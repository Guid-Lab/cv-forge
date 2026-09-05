"""Naive ATS-style PDF text extractor used by the text-layer test.

Groups text runs by baseline, sorts them left to right and joins them with no
separator — the behaviour of simple resume parsers that ignore the horizontal
gap between runs. Poppler/pdftotext reconstructs those gaps, so it cannot show
the problem this script is meant to expose.
"""
import re
import sys
import zlib
from collections import defaultdict


def streams(data):
    for m in re.finditer(rb'stream\r?\n(.*?)\r?\nendstream', data, re.S):
        try:
            yield zlib.decompress(m.group(1))
        except zlib.error:
            continue


def tounicode_maps(data):
    """Map every /ToUnicode CMap found in the file: glyph code -> unicode char."""
    cmap = {}
    for s in streams(data):
        for block in re.findall(rb'beginbfchar(.*?)endbfchar', s, re.S):
            for src, dst in re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', block):
                cmap[int(src, 16)] = bytes.fromhex(dst.decode()).decode('utf-16-be', 'replace')
        for block in re.findall(rb'beginbfrange(.*?)endbfrange', s, re.S):
            for lo, hi, dst in re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', block):
                start = int(dst, 16)
                for i, code in enumerate(range(int(lo, 16), int(hi, 16) + 1)):
                    cmap[code] = chr(start + i)
    return cmap


def decode_hex(hexstr, cmap):
    codes = [int(hexstr[i:i + 4], 16) for i in range(0, len(hexstr), 4)]
    return ''.join(cmap.get(c, '�') for c in codes)


def extract(path):
    data = open(path, 'rb').read()
    cmap = tounicode_maps(data)
    runs = []
    for s in streams(data):
        if b'Tj' not in s and b'TJ' not in s:
            continue
        text = s.decode('latin-1')
        x = y = 0.0
        for tok in re.finditer(
            r'([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+Tm'
            r'|([-\d.]+)\s+([-\d.]+)\s+Td'
            r'|(BT)'
            r'|<([0-9A-Fa-f]+)>\s*Tj'
            r'|(\((?:\\.|[^()\\])*\))\s*Tj'
            r'|(\[(?:\((?:\\.|[^()\\])*\)|[^\]])*\])\s*TJ',
            text,
        ):
            if tok.group(1) is not None:
                x, y = float(tok.group(5)), float(tok.group(6))
            elif tok.group(7) is not None:
                x, y = x + float(tok.group(7)), y + float(tok.group(8))
            elif tok.group(9) is not None:
                x = y = 0.0
            elif tok.group(10) is not None:
                runs.append((round(y, 1), x, decode_hex(tok.group(10), cmap)))
            else:
                lit = tok.group(11) or tok.group(12)
                txt = ''
                for part in re.findall(r'\((?:\\.|[^()\\])*\)|<[0-9A-Fa-f]+>', lit):
                    if part.startswith('('):
                        txt += re.sub(r'\\([()\\])', r'\1', part[1:-1])
                    else:
                        txt += decode_hex(part[1:-1], cmap)
                runs.append((round(y, 1), x, txt))

    lines = defaultdict(list)
    for y, x, t in runs:
        lines[y].append((x, t))
    return '\n'.join(
        ''.join(t for _, t in sorted(parts))
        for _, parts in sorted(lines.items())
    )


if __name__ == '__main__':
    print(extract(sys.argv[1]))
