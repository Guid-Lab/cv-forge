"""Guards the text layer of the Pretty PDF against silently merged words.

Chromium writes every flex item as its own positioned text run. Nothing in the
PDF separates two runs that sit on the same baseline, so a resume parser that
ignores horizontal gaps reads "UBS" + "Apr 2020" as the single token "UBSApr".
poppler reconstructs the gap and therefore cannot detect this, which is why the
test extracts the text the naive way instead.

Run: python tests/test_pdf_text_layer.py
Needs Chromium; skips (exit 0) when none is installed.
"""
import os
import shutil
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from naive_pdf_text import extract  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Pairs that must not end up glued together: (left, right).
ADJACENT_PAIRS = [
    ('UBS', 'Apr 2020'),
    ('CCDCOE', 'Oct 2018'),
    ('MIT', 'Sep 2012'),
    ('Compliance', 'Security'),
    ('Security', 'ISO 27001'),
    ('ISO 27001', 'NIS2'),
    ('Cloud', 'Kubernetes'),
    ('Kubernetes', 'Terraform'),
    ('OSCP', 'Issued Sep 2024'),
    ('Linux Foundation', '2023'),
    ('Threat Modeling', '2021'),
    ('jan@example.com', '+48123456789'),
    ('+48123456789', 'Warszawa'),
    ('kontakt@example.com', 'Gdansk'),
]


def find_chromium():
    for name in ('chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable'):
        path = shutil.which(name)
        if path:
            return path
    return None


def render(chromium, html, out_pdf):
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(html)
        html_path = f.name
    try:
        subprocess.run([
            chromium, '--headless', '--no-sandbox', '--disable-gpu',
            '--disable-javascript', '--window-size=1280,900',
            '--print-to-pdf=' + out_pdf, '--no-pdf-header-footer',
            f'file://{html_path}',
        ], check=True, capture_output=True, timeout=60)
    finally:
        os.unlink(html_path)


def build_page():
    with open(os.path.join(ROOT, 'static', 'css', 'style.css'), encoding='utf-8') as f:
        css = f.read()
    with open(os.path.join(ROOT, 'tests', 'preview_fixture.html'), encoding='utf-8') as f:
        body = f.read()
    return (
        '<!DOCTYPE html><html><head><meta charset="utf-8"><style>\n'
        f'{css}\n'
        '@page { size: A4; margin: 0; }\n'
        'body { margin: 0; background: white; }\n'
        '.preview-page { box-shadow: none; }\n'
        f'</style></head><body>{body}</body></html>'
    )


def main():
    chromium = find_chromium()
    if not chromium:
        print('SKIP: no Chromium found')
        return 0

    out_dir = tempfile.mkdtemp(prefix='cvforge_test_')
    pdf = os.path.join(out_dir, 'preview.pdf')
    try:
        render(chromium, build_page(), pdf)
        text = extract(pdf)
    finally:
        shutil.rmtree(out_dir, ignore_errors=True)

    # The separator is a non-breaking space; treat it as an ordinary one.
    normalized = text.replace('\u00a0', ' ')

    failures = []
    for left, right in ADJACENT_PAIRS:
        glued = left + right
        if glued in normalized:
            failures.append(f'{left!r} + {right!r} merged into {glued!r}')

    if failures:
        print('FAIL: the PDF text layer merges words that must stay apart\n')
        for f in failures:
            print('  -', f)
        print('\nExtracted text:\n' + text)
        return 1

    print(f'OK: {len(ADJACENT_PAIRS)} boundaries kept separate in the PDF text layer')
    return 0


if __name__ == '__main__':
    sys.exit(main())
