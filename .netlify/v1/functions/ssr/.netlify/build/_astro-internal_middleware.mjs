import 'es-module-lexer';
import './chunks/astro-designed-error-pages_DfWB2oJt.mjs';
import '@astrojs/internal-helpers/path';
import 'piccolore';
import './chunks/astro/server_DthtwOTf.mjs';
import 'clsx';
import { s as sequence } from './chunks/index_C9HfpW_R.mjs';
import { a as adminOrigins } from './chunks/admin-origin_Cnam5a9i.mjs';
import { r as requestStore, f as formsStore, s as sortByPriority, a as renderFormPayloadDiv } from './chunks/request-context_DwoCG0Sw.mjs';

const EDIT_COOKIE = "__tina_edit";
const EDIT_COOKIE_HEADER = `${EDIT_COOKIE}=1; Path=/; SameSite=Strict; Max-Age=3600`;
function isEditMode(request) {
  const url = new URL(request.url);
  if (url.searchParams.get("tina-edit") === "1") return true;
  const dest = request.headers.get("Sec-Fetch-Dest");
  if (dest !== "iframe") return false;
  const referer = request.headers.get("Referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.origin === url.origin && refererUrl.pathname.startsWith("/admin/")) {
        return true;
      }
    } catch {
    }
  }
  return readCookie(request, EDIT_COOKIE) === "1";
}
function readCookie(request, name) {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const pair of header.split(";")) {
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    const key = pair.slice(0, eq).trim();
    if (key === name) return pair.slice(eq + 1).trim();
  }
  return null;
}

const HEAD_CLOSE = "</head>";
const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.tinaEdit = false;
    return next();
  }
  const editing = isEditMode(context.request);
  context.locals.tinaEdit = editing;
  const forms = [];
  return requestStore.run(
    context.request,
    () => formsStore.run(forms, async () => {
      const response = await next();
      return editing ? injectEditMode(response, forms) : response;
    })
  );
};
async function injectEditMode(response, forms) {
  const init = editModeInit(response);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return new Response(response.body, init);
  }
  const html = await response.text();
  const headEnd = html.indexOf(HEAD_CLOSE);
  if (headEnd === -1) {
    return new Response(html, init);
  }
  const injection = renderInjection(forms);
  return new Response(
    html.slice(0, headEnd) + injection + html.slice(headEnd),
    init
  );
}
function editModeInit(response) {
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.append("Set-Cookie", EDIT_COOKIE_HEADER);
  return { status: response.status, statusText: response.statusText, headers };
}
function renderInjection(forms) {
  const formDivs = sortByPriority(forms).map((form, i) => renderFormPayloadDiv(form, i === 0)).join("");
  return formDivs + bridgeScript();
}
function bridgeScript() {
  const origins = adminOrigins();
  const initArg = origins ? `{adminOrigin:${JSON.stringify(origins)}}` : "";
  return `<script type="module">import{init,refreshForms}from"/admin/bridge.js";init(${initArg});document.addEventListener("astro:page-load",refreshForms);<\/script>`;
}

const onRequest = sequence(
	onRequest$1,
	
	
);

export { onRequest };
