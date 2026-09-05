"""
Renders CV preview HTML to PDF using Chromium headless.
This ensures the PDF output is 1:1 with the browser preview.
"""

import os
import shutil
import subprocess
import tempfile
import threading

def _find_chromium():
    """Find Chromium/Chrome binary."""
    chromium = shutil.which('chromium') or shutil.which('chromium-browser') \
               or shutil.which('google-chrome') or shutil.which('google-chrome-stable')
    if not chromium:
        raise RuntimeError("No Chromium/Chrome found")
    return chromium


class RendererBusy(RuntimeError):
    """No render slot became free in time."""


# A headless Chromium render peaks at a few hundred MB. The deployment has 1 GB
# and one shared core for the whole container, so running two at once mostly
# buys an OOM kill that takes the other request down with it.
_RENDER_SLOT = threading.Semaphore(1)
_RENDER_WAIT = 30


def generate_pdf_from_html(html_content):
    """Render HTML to A4 PDF using Chromium headless."""
    if not _RENDER_SLOT.acquire(timeout=_RENDER_WAIT):
        raise RendererBusy("PDF rendering is busy")

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
            # The HTML comes from the client, so the renderer must not be able to
            # reach the network: an <img> pointing at an internal address would
            # otherwise be fetched and embedded in the PDF handed back to the
            # caller. Every image the preview produces is a data: URI, which is
            # unaffected. Loopback is proxied too, since Chromium bypasses
            # proxies for it by default.
            '--proxy-server=127.0.0.1:1',
            '--proxy-bypass-list=<-loopback>',
            '--host-resolver-rules=MAP * ~NOTFOUND',
            '--window-size=1280,900',
            '--print-to-pdf=' + pdf_path,
            '--print-to-pdf-no-header',
            '--no-pdf-header-footer',
            f'file://{html_path}',
        ], check=True, capture_output=True, timeout=30)
    except Exception:
        # Nothing downstream will send this file, so do not leave it behind.
        try:
            os.unlink(pdf_path)
        except OSError:
            pass
        raise
    finally:
        _RENDER_SLOT.release()
        try:
            os.unlink(html_path)
        except OSError:
            pass

    return pdf_path
