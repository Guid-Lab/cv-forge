# Contributing

Thanks for your interest in contributing to CV Forge!

## Getting Started

1. Fork the repository
2. Clone your fork and create a branch
3. Install dependencies: `pip install -r requirements.txt`
4. Make your changes
5. Test locally: `python app.py`
6. Submit a pull request

## Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/cv-forge.git
cd cv-forge
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Make sure Chromium and LibreOffice are installed for full PDF export functionality.

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include steps to reproduce for bugs
- Include browser and OS info
- Check existing issues before creating a new one

## Pull Requests

- Keep changes focused and minimal
- Test all export formats (DOCX, ATS PDF, Pretty PDF) if touching generation code
- Test across themes if touching CSS/preview code
- Update documentation if needed
