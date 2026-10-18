#!/usr/bin/env python3
"""Turn a saved CDP Page.captureScreenshot response into a viewable JPEG.

Usage:
    python3 .cursor/skills/finding-stock-photos/scripts/decode-screenshot.py <cdp-response.json> [/tmp/out.jpg]

Then open the output with the Read tool to see the panel.
"""
import base64
import json
import sys

if len(sys.argv) < 2:
    sys.exit(__doc__)
src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else "/tmp/stock-panel.jpg"
with open(src) as f:
    d = json.load(f)
d = d.get("result", d)
with open(out, "wb") as f:
    f.write(base64.b64decode(d["data"]))
print(out)
