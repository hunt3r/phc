# phc

Content migration tooling for phandc.net. This workspace contains a sitemap-based spider that scrapes the existing WordPress site into a structured format for import into an Astro/Tina site.

## Spider (scrape phandc.net)

The spider:

1. Fetches the sitemap index and all child sitemaps from phandc.net.
2. For each **page** and **post** URL in the sitemap: fetches the HTML page, creates a folder (folder name = that URL’s path), saves the HTML as `index.html`, crawls the page for all `<img>` tags, and downloads each image into that folder’s `images/` subfolder.
3. Writes taxonomy index files and a manifest.

### Run

```bash
npm install
npm run scrape
```

Output is written to `./scraped/` (override with `OUTPUT_DIR`). Optional env:

- `BASE_URL` – default `https://phandc.net`
- `OUTPUT_DIR` – default `scraped`
- `DELAY_MS` – delay between requests (default `800`)
- `SITEMAP_URL` – override sitemap index URL

### Output layout

Output mirrors the site URL structure:

- **Pages** (from page-sitemap): one folder per URL, name = URL path.  
  Example: `https://phandc.net/privacy-policy/` → `scraped/pages/privacy-policy/`  
  Each folder contains:
  - `index.html` – raw HTML of the page
  - `index.json` – structured data (title, date, content, taxonomy, `allImageUrls`, `allImageLocalPaths`)
  - `images/` – every image found in that page’s `<img>` tags

- **Posts** (from post-sitemap): one folder per URL, name = URL path.  
  Example: `https://phandc.net/wawa-abington-jenkintown/` → `scraped/portfolio/wawa-abington-jenkintown/`  
  Same layout: `index.html`, `index.json`, `images/` (images are those found in that post’s HTML).

- **Taxonomy**: `scraped/taxonomy/categories.json`, `tags.json`, `authors.json`

- **manifest.json** – index of every scraped URL (type, url, localPath, slug, lastmod)

Use the scraped data as the source for a separate migration step into your Astro/Tina content.
