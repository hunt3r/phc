// Browser helpers for the stock-photo workflow. Do not run this file with Node.
// Each numbered section is a Runtime.evaluate expression to send with the
// cursor-ide-browser `browser_cdp` tool, in the tab named in its heading.
// Everything is assigned to `window`, so re-sending a section is safe, and the
// globals survive document.open/write. Install once per tab, then reuse.

// ---------------------------------------------------------------------------
// 1. Unsplash tab: navigate to https://unsplash.com/s/photos/office?license=free
//    s(query, n) -> [{ id, slug, alt, by, w, h, raw }]
//    `raw` ends in /photo-<suffix>; pass <suffix> to upload-to-cloudinary.mjs.
//    plus=none and the filter drop Unsplash+ (paid) and sponsored results.
// ---------------------------------------------------------------------------
window.s = async (q, n = 6) => {
  const r = await fetch('/napi/search/photos?query=' + encodeURIComponent(q) + '&per_page=30&orientation=landscape&plus=none');
  const j = await r.json();
  return j.results
    .filter((p) => !p.premium && !p.plus && !p.sponsorship)
    .slice(0, n)
    .map((p) => ({ id: p.id, slug: p.slug, alt: p.alt_description, by: p.user.name, w: p.width, h: p.height, raw: p.urls.raw.split('?')[0] }));
};

// Example search call (returns text lines, easy to read in the tool result):
// (async () => { const qs = ['term one', 'term two']; const out = [];
//   for (const q of qs) { const r = await s(q, 30);
//     out.push(...r.slice(0, 8).map((x) => q + ' | ' + x.raw.split('/photo-')[1] + ' | ' + (x.alt || '').slice(0, 70))); }
//   return out.join('\n'); })()

// ---------------------------------------------------------------------------
// 2. Pexels tab: navigate to https://www.pexels.com/search/office/
//    px(query) -> ["<id> | <slug>", ...]
//    Display: https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&w=600
//    Upload:  same URL with w=2400
// ---------------------------------------------------------------------------
window.px = async (q) => {
  const h = await (await fetch('/search/' + encodeURIComponent(q) + '/?orientation=landscape')).text();
  const seen = new Set();
  return [...h.matchAll(/\/photo\/([a-z0-9-]+)-(\d+)\//g)]
    .filter((x) => !seen.has(x[2]) && seen.add(x[2]))
    .map((x) => x[2] + ' | ' + x[1]);
};

// ---------------------------------------------------------------------------
// 3. Pixabay tab: navigate to https://pixabay.com/photos/search/office/?orientation=horizontal
//    pb(query) -> ["<id> | <slug> | <yyyy/mm/dd/hh/mm/name-id_640.jpg>", ...]
//    Display: https://cdn.pixabay.com/photo/<path>   (the _640 file)
//    Upload:  swap _640.jpg for _1280.jpg (some old files max out near 1024 px)
// ---------------------------------------------------------------------------
window.pb = async (q) => {
  const h = await (await fetch('/photos/search/' + encodeURIComponent(q) + '/?orientation=horizontal')).text();
  const m = [...h.matchAll(/https:\/\/cdn\.pixabay\.com\/photo\/\d{4}\/\d{2}\/\d{2}\/\d{2}\/\d{2}\/([a-z0-9-]+)-(\d+)_(?:340|480|640)\.jpg/g)];
  const seen = new Set();
  return m.filter((x) => !seen.has(x[2]) && seen.add(x[2])).map((x) => x[2] + ' | ' + x[1] + ' | ' + x[0].slice(30));
};

// ---------------------------------------------------------------------------
// 4. Review panel tab (about:blank, opened beside the chat).
//    Set window.cands = [[label, displayUrl, sourceName], ...] then call
//    renderAll(title). Labels: U# Unsplash, X# Pexels, B# Pixabay, W# Wikimedia.
//    After ranking, set window.ranked = [...labels].map(find) and call
//    showRanked(title): numbered 1..N grid with a click-to-zoom lightbox.
// ---------------------------------------------------------------------------
window.unsplashUrl = (suffix) => 'https://images.unsplash.com/photo-' + suffix + '?w=600&q=60';
window.pexelsUrl = (id) => 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.jpeg?auto=compress&w=600';
window.pixabayUrl = (path) => 'https://cdn.pixabay.com/photo/' + path.replace(/_640\.jpg$/, '') + '_640.jpg';
// Wikimedia: pass "<h>/<hh>/<File_name.jpg>" from the thumb URL.
window.wikiUrl = (p) => 'https://upload.wikimedia.org/wikipedia/commons/thumb/' + p + '/960px-' + p.split('/')[2];

window.big = (u) =>
  u.includes('wikimedia')
    ? u.replace('/960px-', '/1920px-')
    : u.replace('w=600&q=60', 'w=2000&q=80').replace('auto=compress&w=600', 'auto=compress&w=2000').replace('_640.jpg', '_1280.jpg');

window.PANEL_CSS =
  'body{font-family:system-ui;margin:8px;background:#111;color:#eee}h2{font-size:15px;margin:4px 0 8px}p{font-size:12px;color:#aaa;margin:0 0 8px}' +
  '.g{display:grid;gap:6px}figure{margin:0;position:relative}img{width:100%;object-fit:cover;border-radius:4px;display:block}' +
  'figcaption{position:absolute;top:3px;left:3px;background:#000c;color:#f6c400;font:bold 14px system-ui;padding:2px 6px;border-radius:3px}' +
  'small{position:absolute;bottom:3px;right:3px;background:#000b;color:#ccc;font:11px system-ui;padding:1px 4px;border-radius:3px}';

window.renderAll = (title) => {
  document.open();
  document.write(
    '<!doctype html><style>' + PANEL_CSS + '.g{grid-template-columns:repeat(6,1fr)}img{aspect-ratio:3/2}</style><h2>' + title +
      '</h2><div class=g>' + cands.map((c) => '<figure><img src="' + c[1] + '"><figcaption>' + c[0] + '</figcaption></figure>').join('') + '</div>'
  );
  document.close();
  return cands.length;
};

window.showRanked = (title) => {
  const order = window.ranked;
  document.open();
  document.write(
    '<!doctype html><style>' + PANEL_CSS +
      '.g{grid-template-columns:repeat(4,1fr)}figure{cursor:zoom-in}img{aspect-ratio:16/9}' +
      '#lb{position:fixed;inset:0;background:#000e;display:none;z-index:9;overflow:auto}#lb.on{display:block}' +
      '#lb img{width:auto;max-width:100%;max-height:calc(100vh - 40px);aspect-ratio:auto;object-fit:contain;margin:30px auto 0;border-radius:0;cursor:zoom-in}' +
      '#lb.full img{max-width:none;max-height:none;cursor:zoom-out}#lbn{position:fixed;top:6px;left:10px;color:#f6c400;font:bold 15px system-ui}' +
      '#lbh{position:fixed;top:8px;right:12px;color:#aaa;font:12px system-ui}</style><h2>' + title +
      '</h2><p>Click a tile to open it. Click the image for full size, use the arrow keys to move between options, and press Esc or click the dark area to close.</p><div class=g>' +
      order.map((c, i) => '<figure data-i="' + i + '"><img src="' + c[1] + '"><figcaption>' + (i + 1) + '</figcaption><small>' + c[2] + '</small></figure>').join('') +
      '</div><div id=lb><span id=lbn></span><span id=lbh>Click image: full size · ← → next · Esc close</span><img id=lbi></div>'
  );
  document.close();
  const lb = document.getElementById('lb'), im = document.getElementById('lbi'), n = document.getElementById('lbn');
  let cur = 0;
  const open = (i) => {
    cur = (i + order.length) % order.length;
    lb.classList.remove('full');
    im.src = big(order[cur][1]);
    n.textContent = cur + 1 + ' · ' + order[cur][2];
    lb.classList.add('on');
  };
  document.querySelectorAll('figure').forEach((f) => (f.onclick = () => open(+f.dataset.i)));
  im.onclick = (e) => { e.stopPropagation(); lb.classList.toggle('full'); };
  lb.onclick = () => lb.classList.remove('on');
  document.onkeydown = (e) => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') lb.classList.remove('on');
    if (e.key === 'ArrowRight') open(cur + 1);
    if (e.key === 'ArrowLeft') open(cur - 1);
  };
  return JSON.stringify(order.slice(0, 10).map((c) => c[1]));
};
