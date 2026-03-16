# phc

Astro + Tina CMS + Tailwind portfolio site for phandc.net, with tooling to scrape the existing WordPress site into a structured format for content migration.

## Site (Astro + Tina + Tailwind)

The site is a minimal responsive portfolio built with:

- **Astro 5** – static site generator
- **Tailwind CSS 4** – styling
- **Tina CMS** – content editing (home and portfolio)
- **Cloudinary** – optional media storage for Tina (images)

### Commands

```bash
npm install   # if you see peer dependency errors, use: npm install --legacy-peer-deps
npm run dev        # Tina + Astro dev server (admin at /admin/index.html)
npm run build      # Build static site
npm run preview   # Preview production build
npm run build:admin  # Build Tina admin UI to admin/
```

### Cloudinary + Tina (media uploader)

Image fields in Tina (portfolio hero image, gallery, home hero background) use the **Cloudinary** media store. Setup matches circuitn:

1. **Env vars** – Copy `.env.example` to `.env` and set:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   Optional for Tina Cloud: `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`.

2. **Media API** – The Tina admin talks to `/api/cloudinary/media` to upload, list, and delete assets. The repo uses the same approach as circuitn:
   - **Local dev**: Run `npm run dev` (Tina + Astro only). With Tina Cloud configured (clientId + token), the Cloudinary media store uses Tina Cloud; no local API or proxy is required.
   - **Production**: Deploy to **Netlify**. The Netlify function at `netlify/functions/api.mjs` serves `/api/cloudinary/media`. Set the same Cloudinary env vars in the Netlify dashboard.

To test the media API locally against the Netlify function, run `netlify dev` instead of `npm run dev` so the function runs and proxies `/api/*` to it.

---

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
