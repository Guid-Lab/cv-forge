"""Flask application for CV Manager."""

__version__ = "1.1.0"

import ipaddress
import logging
import os
import re
import secrets
import socket
import time
import urllib.parse
import urllib.request

from flask import Flask, render_template, request, jsonify, send_file, Response, after_this_request, abort
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from cv_generator import generate_docx, generate_pdf
from pdf_renderer import generate_pdf_from_html

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or secrets.token_hex(32)

limiter = Limiter(get_remote_address, app=app, default_limits=["60 per minute"])

logger = logging.getLogger(__name__)

MAX_LOGO_SIZE = 1 * 1024 * 1024
MAX_PDF_HTML_SIZE = 5 * 1024 * 1024

DOMAIN_RE = re.compile(r'^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$')

_pending_loads = {}
_MAX_PENDING = 20
_PENDING_TTL = 300

def _cleanup_pending():
    now = time.time()
    expired = [k for k, (_, ts) in _pending_loads.items() if now - ts > _PENDING_TTL]
    for k in expired:
        del _pending_loads[k]

def _is_safe_domain(domain: str) -> bool:
    """Check domain is not a private/internal IP or reserved hostname."""
    try:
        try:
            ip = ipaddress.ip_address(domain)
            return ip.is_global
        except ValueError:
            pass

        for info in socket.getaddrinfo(domain, None):
            ip = ipaddress.ip_address(info[4][0])
            if not ip.is_global:
                return False
        return True
    except (socket.gaierror, OSError):
        return False

def _safe_read(resp, max_size=MAX_LOGO_SIZE):
    """Read response with size limit."""
    data = resp.read(max_size + 1)
    if len(data) > max_size:
        return None
    return data

def _send_temp_file(path, download_name, mimetype=None):
    """Send a temp file and schedule cleanup after response."""
    @after_this_request
    def cleanup(response):
        try:
            os.unlink(path)
        except OSError:
            pass
        return response
    return send_file(path, as_attachment=True, download_name=download_name, mimetype=mimetype)

def _check_origin():
    """Reject cross-origin requests to API endpoints."""
    origin = request.headers.get('Origin')
    if origin:
        scheme = request.headers.get('X-Forwarded-Proto', request.scheme)
        host = request.headers.get('X-Forwarded-Host', request.host)
        expected = f'{scheme}://{host}'
        if origin != expected:
            abort(403)

@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob:; "
        "font-src 'self'; "
        "connect-src 'self'; "
        "frame-ancestors 'none'"
    )
    return response

@app.route('/')
@limiter.exempt
def index():
    return render_template('index.html')

@app.route('/api/fetch-logo', methods=['POST'])
@limiter.limit("20 per minute")
def fetch_logo():
    """Fetch logo from a URL domain via Google/Clearbit (SSRF-safe proxy)."""
    _check_origin()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request'}), 400

    url = data.get('url', '').strip()
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    if not url.startswith('http'):
        url = 'https://' + url
    try:
        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc or parsed.path.split('/')[0]
    except Exception:
        return jsonify({'error': 'Invalid URL'}), 400

    domain = domain.lower().strip('.')
    if not DOMAIN_RE.match(domain):
        return jsonify({'error': 'Invalid domain'}), 400

    if not _is_safe_domain(domain):
        return jsonify({'error': 'Invalid domain'}), 400

    safe_domain = urllib.parse.quote(domain, safe='.-')

    logo_url = f'https://www.google.com/s2/favicons?domain={safe_domain}&sz=128'
    try:
        req = urllib.request.Request(logo_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            img_data = _safe_read(resp)
            if img_data and len(img_data) >= 200:
                content_type = resp.headers.get('Content-Type', 'image/png')
                if not content_type.startswith('image/'):
                    raise ValueError('not an image')
                return Response(img_data, mimetype=content_type)
    except Exception:
        pass

    clearbit_url = f'https://logo.clearbit.com/{safe_domain}'
    try:
        req = urllib.request.Request(clearbit_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            img_data = _safe_read(resp)
            if not img_data or len(img_data) < 200:
                return jsonify({'error': 'No logo found'}), 404
            content_type = resp.headers.get('Content-Type', 'image/png')
            if not content_type.startswith('image/'):
                return jsonify({'error': 'Invalid response'}), 400
            return Response(img_data, mimetype=content_type)
    except Exception:
        return jsonify({'error': 'Could not fetch logo'}), 404

@app.route('/api/generate/docx', methods=['POST'])
@limiter.limit("10 per minute")
def gen_docx():
    """Generate ATS DOCX from CV data sent in request body."""
    _check_origin()
    data = request.get_json() if request.is_json else None
    if not data or not isinstance(data, dict):
        return jsonify({'error': 'No data provided'}), 400
    if not data.get('personal') or not isinstance(data.get('personal'), dict):
        return jsonify({'error': 'Missing personal data'}), 400
    try:
        path = generate_docx(data)
        name = _cv_filename(data, 'docx')
        return _send_temp_file(path, download_name=name)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.exception("DOCX generation failed")
        return jsonify({'error': 'Document generation failed'}), 500

@app.route('/api/generate/pdf', methods=['POST'])
@limiter.limit("10 per minute")
def gen_pdf():
    """Generate Pretty PDF from HTML preview content."""
    _check_origin()
    data = request.get_json()
    if not data or 'html' not in data:
        return jsonify({'error': 'No HTML content provided'}), 400

    html_content = data['html']
    if len(html_content) > MAX_PDF_HTML_SIZE:
        return jsonify({'error': 'HTML content too large'}), 400

    try:
        static_dir = os.path.join(os.path.dirname(__file__), 'static')
        css_path = os.path.join(static_dir, 'css', 'style.css')
        with open(css_path, 'r') as f:
            css = f.read()

        pages_html = _sanitize_html_for_pdf(html_content)

        full_html = f"""<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
{css}
@page {{ size: A4; margin: 0; }}
body {{ margin: 0; padding: 0; background: white; }}
.preview-page {{
    width: 794px; height: 1123px;
    page-break-after: always;
    page-break-inside: avoid;
    box-shadow: none;
    position: relative;
    overflow: hidden;
}}
.preview-page:last-child {{ page-break-after: auto; }}
.preview-page-number {{ display: none; }}
.preview-page {{ transform: none !important; margin-bottom: 0 !important; }}
</style>
</head><body>{pages_html}</body></html>"""

        path = generate_pdf_from_html(full_html)
        cv_data = data.get('cv_data') if isinstance(data.get('cv_data'), dict) else data
        name = _cv_filename(cv_data, 'pdf')
        return _send_temp_file(path, download_name=name)
    except Exception as e:
        logger.exception("PDF generation failed")
        return jsonify({'error': 'PDF generation failed'}), 500

@app.route('/api/generate/ats-pdf', methods=['POST'])
@limiter.limit("10 per minute")
def gen_ats_pdf():
    """Generate ATS PDF from DOCX via LibreOffice."""
    _check_origin()
    data = request.get_json() if request.is_json else None
    if not data or not isinstance(data, dict):
        return jsonify({'error': 'No data provided'}), 400
    if not data.get('personal') or not isinstance(data.get('personal'), dict):
        return jsonify({'error': 'Missing personal data'}), 400
    try:
        path = generate_pdf(data)
        name = _cv_filename(data, 'pdf', suffix='_ATS')
        return _send_temp_file(path, download_name=name)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.exception("ATS PDF generation failed")
        return jsonify({'error': 'PDF generation failed'}), 500

def _cv_filename(data, ext, suffix=''):
    """Generate download filename from CV data."""
    name = 'CV'
    if data and isinstance(data, dict):
        personal = data.get('personal', {})
        raw_name = personal.get('name', '').strip()
        if raw_name:
            safe = re.sub(r'[^\w\s\-]', '', raw_name).replace(' ', '_')
            if safe:
                name = f'CV_{safe}'
    return f'{name}{suffix}.{ext}'

def _sanitize_html_for_pdf(html):
    """Strip dangerous elements from HTML before passing to Chromium."""
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r'\s+on\w+\s*=\s*["\'][^"\']*["\']', '', html, flags=re.IGNORECASE)
    html = re.sub(r'\s+on\w+\s*=\s*[^\s>]+', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<(iframe|object|embed|applet|link|meta|base|form|input|button|textarea|select)[^>]*>.*?</\1>', '', html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r'<(iframe|object|embed|applet|link|meta|base|form|input|button|textarea|select)[^>]*/?\s*>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'href\s*=\s*["\']javascript:[^"\']*["\']', 'href="#"', html, flags=re.IGNORECASE)
    html = re.sub(r'src\s*=\s*["\']javascript:[^"\']*["\']', 'src=""', html, flags=re.IGNORECASE)
    html = re.sub(r'@import\s+[^;]+;?', '', html, flags=re.IGNORECASE)
    html = re.sub(r'url\s*\(\s*["\']?(?:https?://|file://|ftp://|data:(?!image/))[^)]*\)', 'url()', html, flags=re.IGNORECASE)
    return html

@app.route('/api/load-data', methods=['POST'])
@limiter.limit("5 per minute")
def store_load_data():
    """Store CV data temporarily for loading via URL token."""
    data = request.get_json()
    if not data or not isinstance(data, dict):
        return jsonify({'error': 'Invalid data'}), 400
    _cleanup_pending()
    if len(_pending_loads) >= _MAX_PENDING:
        return jsonify({'error': 'Too many pending loads'}), 429
    token = secrets.token_urlsafe(16)
    _pending_loads[token] = (data, time.time())
    scheme = request.headers.get('X-Forwarded-Proto', request.scheme)
    host = request.headers.get('X-Forwarded-Host', request.host)
    url = f'{scheme}://{host}/?load={token}'
    return jsonify({'token': token, 'url': url})

@app.route('/api/load-data/<token>', methods=['GET'])
@limiter.limit("20 per minute")
def get_load_data(token):
    """Retrieve and delete stored CV data by token."""
    _cleanup_pending()
    entry = _pending_loads.pop(token, None)
    if not entry:
        return jsonify({'error': 'Token not found or expired'}), 404
    data, ts = entry
    if time.time() - ts > _PENDING_TTL:
        return jsonify({'error': 'Token expired'}), 404
    return jsonify(data)

if __name__ == '__main__':
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    if debug:
        logger.warning("Running in debug mode — do not use in production")
    app.run(debug=debug, host='0.0.0.0', port=5000)
