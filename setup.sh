#!/usr/bin/env bash
set -e

echo "=== GUID CV Manager - Setup ==="
echo ""

# Check Python
if ! command -v python3 &>/dev/null; then
    echo "ERROR: Python 3 is required. Install it first."
    exit 1
fi

# Create venv if needed
if [ ! -d "venv" ]; then
    echo "[1/3] Creating virtual environment..."
    python3 -m venv venv
else
    echo "[1/3] Virtual environment exists."
fi

# Activate and install
echo "[2/3] Installing dependencies..."
source venv/bin/activate
pip install -q -r requirements.txt

# Check optional dependencies
echo "[3/3] Checking optional tools..."
CHROMIUM=$(command -v chromium || command -v chromium-browser || command -v google-chrome || command -v google-chrome-stable || true)
LIBREOFFICE=$(command -v libreoffice || true)

if [ -z "$CHROMIUM" ]; then
    echo "  WARNING: Chromium/Chrome not found. Pretty PDF export will not work."
    echo "  Install: sudo apt install chromium  (or equivalent)"
else
    echo "  Chromium: $CHROMIUM"
fi

if [ -z "$LIBREOFFICE" ]; then
    echo "  WARNING: LibreOffice not found. ATS PDF export will not work."
    echo "  Install: sudo apt install libreoffice-writer  (or equivalent)"
else
    echo "  LibreOffice: $LIBREOFFICE"
fi

echo ""
echo "=== Ready! ==="
echo "Run:  source venv/bin/activate && python app.py"
echo "Open: http://localhost:5000"
