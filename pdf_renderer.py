"""
Renders CV preview HTML to PDF using Chromium headless.
This ensures the PDF output is 1:1 with the browser preview.
"""

import os
import shutil
import subprocess
import tempfile

def _find_chromium():
    """Find Chromium/Chrome binary."""
    chromium = shutil.which('chromium') or shutil.which('chromium-browser') \
               or shutil.which('google-chrome') or shutil.which('google-chrome-stable')
    if not chromium:
        raise RuntimeError("No Chromium/Chrome found")
    return chromium


def generate_pdf_from_html(html_content):
    """Render HTML to A4 PDF using Chromium headless."""
    pdf_file = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
    pdf_path = pdf_file.name
    pdf_file.close()

    with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(html_content)
        html_path = f.name

    try:
        subprocess.run([
            _find_chromium(),
            '--headless',
            '--no-sandbox',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-sync',
            '--no-first-run',
            '--disable-javascript',
            '--window-size=1280,900',
            '--print-to-pdf=' + pdf_path,
            '--print-to-pdf-no-header',
            '--no-pdf-header-footer',
            f'file://{html_path}',
        ], check=True, capture_output=True, timeout=30)
    finally:
        try:
            os.unlink(html_path)
        except OSError:
            pass

    return pdf_path
