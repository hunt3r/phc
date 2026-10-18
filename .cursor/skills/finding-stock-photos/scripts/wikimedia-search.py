#!/usr/bin/env python3
"""Search Wikimedia Commons for public-domain or CC0 landscape photos.

Usage (needs full network access):
    python3 .cursor/skills/finding-stock-photos/scripts/wikimedia-search.py "query one" "query two"

Prints one line per usable file:
    <license> | <width> x <height> | <title> | <960px thumbnail URL>

Only public domain and CC0 files at least 1200 px wide and landscape are listed,
so anything printed is safe to use without attribution.
"""
import json
import sys
import urllib.parse
import urllib.request

UA = {"User-Agent": "PHC-site-image-search/1.0"}


def get(params):
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({**params, "format": "json"})
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
        return json.load(r)


if len(sys.argv) < 2:
    sys.exit(__doc__)

seen = set()
for q in sys.argv[1:]:
    print("==", q)
    d = get({
        "action": "query", "generator": "search", "gsrnamespace": "6", "gsrlimit": "50",
        "gsrsearch": q + " filetype:bitmap", "prop": "imageinfo",
        "iiprop": "url|size|extmetadata", "iiurlwidth": "960",
    })
    for p in d.get("query", {}).get("pages", {}).values():
        if p["title"] in seen:
            continue
        seen.add(p["title"])
        ii = p["imageinfo"][0]
        lic = ii.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "")
        ok_license = "public domain" in lic.lower() or lic.upper().startswith("CC0")
        if ok_license and ii["width"] >= 1200 and ii["width"] > ii["height"]:
            print(lic, "|", ii["width"], "x", ii["height"], "|", p["title"][5:90], "|", ii["thumburl"].split("?")[0])
