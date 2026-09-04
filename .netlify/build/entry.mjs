import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_bl0u8TXh.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/contact/success.astro.mjs');
const _page3 = () => import('./pages/contact.astro.mjs');
const _page4 = () => import('./pages/llms-full.txt.astro.mjs');
const _page5 = () => import('./pages/llms.txt.astro.mjs');
const _page6 = () => import('./pages/portfolio/_slug_.astro.mjs');
const _page7 = () => import('./pages/portfolio.astro.mjs');
const _page8 = () => import('./pages/privacy-policy.astro.mjs');
const _page9 = () => import('./pages/services/_slug_.astro.mjs');
const _page10 = () => import('./pages/services.astro.mjs');
const _page11 = () => import('./pages/testimonials.astro.mjs');
const _page12 = () => import('./pages/tina-island/_name_.astro.mjs');
const _page13 = () => import('./pages/videos.astro.mjs');
const _page14 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/contact/success.astro", _page2],
    ["src/pages/contact.astro", _page3],
    ["src/pages/llms-full.txt.ts", _page4],
    ["src/pages/llms.txt.ts", _page5],
    ["src/pages/portfolio/[slug].astro", _page6],
    ["src/pages/portfolio/index.astro", _page7],
    ["src/pages/privacy-policy.astro", _page8],
    ["src/pages/services/[slug].astro", _page9],
    ["src/pages/services.astro", _page10],
    ["src/pages/testimonials.astro", _page11],
    ["src/pages/tina-island/[name].ts", _page12],
    ["src/pages/videos.astro", _page13],
    ["src/pages/index.astro", _page14]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "5ae54fd3-8fcb-455b-879c-5a158024d384"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
