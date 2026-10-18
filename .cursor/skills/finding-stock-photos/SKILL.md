---
name: finding-stock-photos
description: >-
  Finds free stock photos (Unsplash, Pexels, Pixabay, Wikimedia public domain) for the
  PH&C website, shows ranked options in a zoomable side panel, lets the user pick, uploads
  the pick to Cloudinary, and writes the URL into the content file. Use when the user asks
  to find, replace, or fill in images for service/sector tags, page featured images, home
  hero slides, or content cards, or mentions stock photos, Unsplash, Pexels, Pixabay, or
  missing images.
---

# Finding stock photos for the PH&C site

One item at a time: decide what the image should show, search every free source, rank,
let the user choose, upload to Cloudinary, save the file, then move to the next item.
**Always save the user's pick before starting the next item.**

## Where images go

| Content | File | Field | Cloudinary folder |
|---|---|---|---|
| Service/sector tag | `src/content/tags/<slug>.md` | `image` | `tags` |
| Page, About, Contact | `src/content/{pages,about,contact}/*.md` | `featuredImage` | `pages` |
| Home hero slide | `src/content/home/index.json` | `hero.slides[n].image` | `home` |
| Content card | `contentCards[n].image` in any of the above | `image` | `cards` |

- Portfolio projects and staff use **real photos only**. Never put stock images there.
- In frontmatter, put `image: '<url>'` after the `description` block and before `parent:`,
  or straight after `label:` when there's no description. Keep the single quotes.
- These fields already render in the Tina live preview, so no island or guide change is
  needed just to fill one in.

## Checklist

```
- [ ] 1. List what needs images
- [ ] 2. Open the browser tabs and install helpers (once per session)
- [ ] Per item:
      - [ ] a. Read the file and decide on imagery and search terms
      - [ ] b. Search all sources in parallel
      - [ ] c. Render about 30 candidates, capture the panel, look at it
      - [ ] d. Rank the top 20, then call showRanked
      - [ ] e. Post the top 10 inline and ask with AskQuestion
      - [ ] f. Upload the pick and save the file
- [ ] 3. Verify
```

### 1. List what needs images

```bash
node .cursor/skills/finding-stock-photos/scripts/find-missing-images.mjs        # add --cards for content cards
```

Tags flagged `[no order: legacy stub?]` are old portfolio tags that aren't on the
Services page. Ask the user whether to skip them, fill them, or delete them before you
spend effort on them.

### 2. Browser setup

Use the `cursor-ide-browser` tools. Open four tabs: Unsplash, Pexels, Pixabay, and an
`about:blank` panel beside the chat. Install the matching section of
[scripts/browser-helpers.js](scripts/browser-helpers.js) in each tab with
`browser_cdp` → `Runtime.evaluate` (`awaitPromise: true`, `returnByValue: true`).
Searches must run *inside* each site's tab (same-origin `fetch`).

### 3a. Decide on imagery first

Read the item's label, description, and body. Before searching, write one or two lines on
what the ideal photo shows, then choose 4–5 specific, concrete queries: objects, actions,
and settings, not abstract nouns. Avoid anything already used on the site: grep
`src/content` for the photo id before offering it. See [examples.md](examples.md).

### 3b. Search all sources

Run the Unsplash, Pexels, and Pixabay searches in parallel, taking about 8 results per
query. Add Wikimedia when government or public-domain photos are likely, such as EPA,
Army Corps, USDA, DOT, testing, or infrastructure:

```bash
python3 .cursor/skills/finding-stock-photos/scripts/wikimedia-search.py "query one" "query two"   # full_network
```

| Source | License rule | Upload URL |
|---|---|---|
| Unsplash | Free only; the helper drops Unsplash+ and sponsored results | pass the `photo-` id suffix |
| Pexels | Pexels license, all fine | `…/pexels-photo-<id>.jpeg?auto=compress&w=2400` |
| Pixabay | Content license, all fine | the `_1280.jpg` file (old uploads may be ~1024 px) |
| Wikimedia | Public domain or CC0 only (the script filters) | curl to `/tmp` first, then pass the local path |

### 3c–d. Review and rank

Set `window.cands` with labels U#, X#, B#, and W#, then call `renderAll(title)`. Capture
the panel with `browser_cdp` `Page.captureScreenshot` (`format: jpeg`, `quality: 70`). It
saves a JSON file; decode that and Read the image:

```bash
python3 .cursor/skills/finding-stock-photos/scripts/decode-screenshot.py <saved.json> /tmp/grid.jpg
```

Rank by fit to the item, how it reads as a wide hero crop, professional feel, and no
visible brand logos. Drop studio color backdrops, near-duplicates, off-topic images, and
the maps and diagrams that Wikimedia often returns.
Set `window.ranked` to the top 20 and call `showRanked('<Item>: best first')`. It returns
the top 10 URLs.

### 3e. Ask

Post the top 10 inline as `**N. Short description** (Source)` followed by
`![N](<800px url>)`. Note repeat shoots, reused images, and brand names. Then ask:

- id `pick`, prompt `<Item name> (N of M): which image? (Click any tile in the right panel to zoom; options 11–20 are there too.)`
- options 1–10 with short labels, then `A number from 11–20 (type it in Other)`,
  `None of these, search more`, and `Skip this tag`

If the user wants different results, such as more scheduling-focused ones, re-search with
new terms. Keep the best of the earlier round in the new set.

### 3f. Upload and save

Look up the pick with `ranked[n-1]`, then:

```bash
node .cursor/skills/finding-stock-photos/scripts/upload-to-cloudinary.mjs <unsplash-suffix | url | /tmp/file.jpg> <source>-<short-description>[-<id>] [folder]   # full_network
# Wikimedia: curl -sfL -A "PHC-site-image-fetch/1.0" -o /tmp/x.jpg "https://upload.wikimedia.org/wikipedia/commons/thumb/<h>/<hh>/<File>/1920px-<File>"
```

Write the printed `secure_url` into the field with StrReplace, then go to the next item.

### 4. Verify

Re-run `find-missing-images.mjs` and `npx astro sync`. "Duplicate id" warnings on the
first sync after edits come from a stale cache; run it again to confirm they're gone.

## Gotchas

- **Auto-review blocks a search call.** Retry the identical call with
  `mcpDetails.requestSmartModeApproval: true` and the exact block reason.
- **`browser_take_screenshot` returns a stale panel.** Use CDP `Page.captureScreenshot`
  instead.
- **Cloudinary returns 400 on a Wikimedia URL.** Download with curl and upload the file.
- **Wrong labels.** Labels come from the order of the arrays in `cands`. Check the grid
  screenshot before you describe an image.
- **Deleting a tag** also means removing it from portfolio `services`/`sectors` lists,
  pointing its `public/_redirects` entries at `/services/`, and running
  `npm run generate:tag-routes`.
