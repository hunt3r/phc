import { c as createAstro, a as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute, F as Fragment } from './astro/server_DthtwOTf.mjs';
import 'piccolore';
import { hashFromQuery, addMetadata } from '@tinacms/bridge/metadata';
import { readOverlay } from '@tinacms/bridge/preview';
import { r as requestStore, b as recordForm } from './request-context_DwoCG0Sw.mjs';
import { tinaField } from '@tinacms/bridge/tina-field';
import 'clsx';
import { createClient } from 'tinacms/dist/client';

const $$Astro$g = createAstro("https://phandc.net");
const $$CodeBlockNode = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$g, $$props, $$slots);
  Astro2.self = $$CodeBlockNode;
  const { node, components } = Astro2.props;
  const Override = components.code_block;
  const value = node.value ?? node.children?.map((line) => line.children?.map((tn) => tn.text).join("") ?? "").join("\n") ?? "";
  return renderTemplate`${Override ? renderTemplate`${renderComponent($$result, "Override", Override, { "value": value, "lang": node.lang })}` : renderTemplate`${maybeRenderHead()}<pre><code${addAttribute(node.lang ? `language-${node.lang}` : void 0, "class")}>${value}</code></pre>`}`;
}, "/Users/hunter/Projects/phc/node_modules/@tinacms/astro/src/CodeBlockNode.astro", void 0);

const $$Astro$f = createAstro("https://phandc.net");
const $$Container = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$f, $$props, $$slots);
  Astro2.self = $$Container;
  const { node, components } = Astro2.props;
  const t = node.type;
  const Override = components[t];
  const tagFor = {
    p: "p",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    ol: "ol",
    ul: "ul",
    li: "li",
    blockquote: "blockquote",
    lic: "div"
  };
  const Tag = tagFor[t];
  return renderTemplate`${Override ? renderTemplate`${renderComponent($$result, "Override", Override, {}, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "TinaMarkdown", $$TinaMarkdown, { "content": node.children, "components": components })}` })}` : renderTemplate`${renderComponent($$result, "Tag", Tag, {}, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "TinaMarkdown", $$TinaMarkdown, { "content": node.children, "components": components })}` })}`}`;
}, "/Users/hunter/Projects/phc/node_modules/@tinacms/astro/src/Container.astro", void 0);

function sanitizeHref(value, fallback = "#") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return fallback;
  }
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") || trimmed.startsWith("./") || trimmed.startsWith("../") || trimmed.startsWith("#")) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:" || url.protocol === "mailto:") {
      return trimmed;
    }
  } catch {
    return fallback;
  }
  return fallback;
}
function sanitizeImageSrc(src) {
  if (typeof src !== "string") return "";
  const trimmed = src.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("./") || trimmed.startsWith("../") || trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") return trimmed;
  } catch {
    return "";
  }
  return "";
}

const $$Astro$e = createAstro("https://phandc.net");
const $$ImageNode = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$e, $$props, $$slots);
  Astro2.self = $$ImageNode;
  const { node, components } = Astro2.props;
  const Override = components.img;
  return renderTemplate`${Override ? renderTemplate`${renderComponent($$result, "Override", Override, { "url": node.url, "alt": node.alt, "caption": node.caption })}` : renderTemplate`${maybeRenderHead()}<img${addAttribute(sanitizeImageSrc(node.url), "src")}${addAttribute(node.alt ?? "", "alt")}>`}`;
}, "/Users/hunter/Projects/phc/node_modules/@tinacms/astro/src/ImageNode.astro", void 0);

const $$Astro$d = createAstro("https://phandc.net");
const $$Leaf = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$Leaf;
  const { node } = Astro2.props;
  return renderTemplate`${node.bold ? renderTemplate`${maybeRenderHead()}<strong>${renderComponent($$result, "Astro.self", Astro2.self, { "node": { ...node, bold: false } })}</strong>` : node.italic ? renderTemplate`<em>${renderComponent($$result, "Astro.self", Astro2.self, { "node": { ...node, italic: false } })}</em>` : node.underline ? renderTemplate`<u>${renderComponent($$result, "Astro.self", Astro2.self, { "node": { ...node, underline: false } })}</u>` : node.strikethrough ? renderTemplate`<s>${renderComponent($$result, "Astro.self", Astro2.self, { "node": { ...node, strikethrough: false } })}</s>` : node.code ? renderTemplate`<code>${renderComponent($$result, "Astro.self", Astro2.self, { "node": { ...node, code: false } })}</code>` : node.highlight ? renderTemplate`<mark${addAttribute(node.highlightColor ? `background-color:${node.highlightColor}` : void 0, "style")}>${renderComponent($$result, "Astro.self", Astro2.self, { "node": { ...node, highlight: false, highlightColor: void 0 } })}</mark>` : renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${node.text}` })}`}`;
}, "/Users/hunter/Projects/phc/node_modules/@tinacms/astro/src/Leaf.astro", void 0);

const $$Astro$c = createAstro("https://phandc.net");
const $$LinkNode = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$LinkNode;
  const { node, components } = Astro2.props;
  const Override = components.a;
  return renderTemplate`${Override ? renderTemplate`${renderComponent($$result, "Override", Override, { "url": node.url }, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "TinaMarkdown", $$TinaMarkdown, { "content": node.children, "components": components })}` })}` : renderTemplate`${maybeRenderHead()}<a${addAttribute(sanitizeHref(node.url), "href")}>${renderComponent($$result, "TinaMarkdown", $$TinaMarkdown, { "content": node.children, "components": components })}</a>`}`;
}, "/Users/hunter/Projects/phc/node_modules/@tinacms/astro/src/LinkNode.astro", void 0);

const $$Astro$b = createAstro("https://phandc.net");
const $$MdxTableNode = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$MdxTableNode;
  const { node, components } = Astro2.props;
  const props = node.props;
  const align = props.align ?? [];
  const allRows = props.tableRows ?? [];
  const header = props.firstRowHeader ? allRows.at(0) : void 0;
  const bodyRows = props.firstRowHeader ? allRows.slice(1) : allRows;
  const ThOverride = components.th;
  const TdOverride = components.td;
  const cellInline = (value) => {
    const nodes = Array.isArray(value) ? value : value?.children ?? [];
    return nodes.flatMap((n) => n.type === "p" ? n.children : []);
  };
  const cellStyle = (i) => `text-align:${align[i] ?? "auto"}`;
  return renderTemplate`${maybeRenderHead()}<table> ${header && renderTemplate`<thead> <tr> ${(header.tableCells ?? []).map(
    (cell, i) => ThOverride ? renderTemplate`${renderComponent($$result, "ThOverride", ThOverride, { "align": align[i] }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TinaMarkdown", $$TinaMarkdown, { "content": cellInline(cell.value), "components": components })} ` })}` : renderTemplate`<th${addAttribute(cellStyle(i), "style")}> ${renderComponent($$result, "TinaMarkdown", $$TinaMarkdown, { "content": cellInline(cell.value), "components": components })} </th>`
  )} </tr> </thead>`} <tbody> ${bodyRows.map((row) => renderTemplate`<tr> ${(row?.tableCells ?? []).map(
    (cell, i) => TdOverride ? renderTemplate`${renderComponent($$result, "TdOverride", TdOverride, { "align": align[i] }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TinaMarkdown", $$TinaMarkdown, { "content": cellInline(cell.value), "components": components })} ` })}` : renderTemplate`<td${addAttribute(cellStyle(i), "style")}> ${renderComponent($$result, "TinaMarkdown", $$TinaMarkdown, { "content": cellInline(cell.value), "components": components })} </td>`
  )} </tr>`)} </tbody> </table>`;
}, "/Users/hunter/Projects/phc/node_modules/@tinacms/astro/src/MdxTableNode.astro", void 0);

const $$Astro$a = createAstro("https://phandc.net");
const $$MdxNode = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$MdxNode;
  const { node, components } = Astro2.props;
  const props = node.props ?? {};
  const MdxComponent = components[node.name];
  const isLegacyTable = !MdxComponent && node.name === "table";
  return renderTemplate`${MdxComponent ? renderTemplate`${renderComponent($$result, "MdxComponent", MdxComponent, { ...props })}` : isLegacyTable ? renderTemplate`${renderComponent($$result, "MdxTableNode", $$MdxTableNode, { "node": { ...node, props }, "components": components })}` : renderTemplate`${maybeRenderHead()}<span style="display:inline-block;padding:0.25rem 0.5rem;background:#fee;color:#900;border-radius:0.25rem;font-family:monospace;font-size:0.85em;">
No component provided for ${node.name}</span>`}`;
}, "/Users/hunter/Projects/phc/node_modules/@tinacms/astro/src/MdxNode.astro", void 0);

const $$Astro$9 = createAstro("https://phandc.net");
const $$TableNode = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$TableNode;
  const { node, components } = Astro2.props;
  const TableOverride = components.table;
  const TrOverride = components.tr;
  const TdOverride = components.td;
  const align = node.props?.align ?? [];
  const rows = node.children ?? [];
  const TABLE_STYLE = "border:1px solid #EDECF3";
  const tdStyle = (i) => `text-align:${align[i] ?? "auto"};border:1px solid #EDECF3;padding:0.25rem`;
  const cellContent = (cell) => (cell?.children ?? []).flatMap((paragraph) => paragraph?.children ?? []);
  const Table = TableOverride ?? "table";
  const tableProps = TableOverride ? { node } : { style: TABLE_STYLE };
  const Tr = TrOverride ?? "tr";
  return renderTemplate`${renderComponent($$result, "Table", Table, { ...tableProps }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<tbody> ${rows.map((row) => renderTemplate`${renderComponent($$result2, "Tr", Tr, {}, { "default": ($$result3) => renderTemplate`${(row?.children ?? []).map(
    (cell, i) => TdOverride ? renderTemplate`${renderComponent($$result3, "TdOverride", TdOverride, { "align": align[i] }, { "default": ($$result4) => renderTemplate` ${renderComponent($$result4, "TinaMarkdown", $$TinaMarkdown, { "content": cellContent(cell), "components": components })} ` })}` : renderTemplate`<td${addAttribute(tdStyle(i), "style")}> ${renderComponent($$result3, "TinaMarkdown", $$TinaMarkdown, { "content": cellContent(cell), "components": components })} </td>`
  )}` })}`)} </tbody> ` })}`;
}, "/Users/hunter/Projects/phc/node_modules/@tinacms/astro/src/TableNode.astro", void 0);

const $$Astro$8 = createAstro("https://phandc.net");
const $$Node = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$Node;
  const { node, components } = Astro2.props;
  const t = node.type;
  const Override = components[t];
  const containerTypes = /* @__PURE__ */ new Set([
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ol",
    "ul",
    "li",
    "lic",
    "blockquote"
  ]);
  return renderTemplate`${containerTypes.has(t) ? renderTemplate`${renderComponent($$result, "Container", $$Container, { "node": node, "components": components })}` : t === "a" ? renderTemplate`${renderComponent($$result, "LinkNode", $$LinkNode, { "node": node, "components": components })}` : t === "img" ? renderTemplate`${renderComponent($$result, "ImageNode", $$ImageNode, { "node": node, "components": components })}` : t === "code_block" ? renderTemplate`${renderComponent($$result, "CodeBlockNode", $$CodeBlockNode, { "node": node, "components": components })}` : t === "table" ? renderTemplate`${renderComponent($$result, "TableNode", $$TableNode, { "node": node, "components": components })}` : t === "text" ? renderTemplate`${renderComponent($$result, "Leaf", $$Leaf, { "node": node })}` : t === "mdxJsxFlowElement" || t === "mdxJsxTextElement" ? renderTemplate`${renderComponent($$result, "MdxNode", $$MdxNode, { "node": node, "components": components })}` : t === "hr" ? Override ? renderTemplate`${renderComponent($$result, "Override", Override, {})}` : renderTemplate`${maybeRenderHead()}<hr>` : t === "break" ? Override ? renderTemplate`${renderComponent($$result, "Override", Override, {})}` : renderTemplate`<br>` : t === "html" || t === "html_inline" ? Override ? renderTemplate`${renderComponent($$result, "Override", Override, { "value": node.value })}` : node.value : t === "invalid_markdown" ? renderTemplate`<pre>${node.value}</pre>` : null}`;
}, "/Users/hunter/Projects/phc/node_modules/@tinacms/astro/src/Node.astro", void 0);

async function requestWithMetadata(source, options) {
  let result = null;
  try {
    result = await source ?? null;
  } catch (error) {
    console.warn("[@tinacms/astro] client query failed", error);
  }
  const query = result?.query ?? "";
  const variables = result?.variables ?? {};
  const id = hashFromQuery(JSON.stringify({ query, variables }));
  const data = result?.data ?? {};
  const request = requestStore.getStore();
  let resolvedData = data;
  if (request) {
    const overlay = await readOverlay(request, id);
    if (overlay !== void 0) {
      resolvedData = overlay;
    }
  }
  const enriched = {
    data: addMetadata(id, resolvedData),
    query,
    variables,
    id
  };
  recordForm({
    id,
    query,
    variables,
    data: enriched.data,
    priority: options?.priority
  });
  return enriched;
}

const $$Astro$7 = createAstro("https://phandc.net");
const $$TinaMarkdown = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$TinaMarkdown;
  const { content, components = {} } = Astro2.props;
  const nodes = !content ? [] : Array.isArray(content) ? content : content.children ?? [];
  return renderTemplate`${nodes.map((node) => renderTemplate`${renderComponent($$result, "Node", $$Node, { "node": node, "components": components })}`)}`;
}, "/Users/hunter/Projects/phc/node_modules/@tinacms/astro/src/TinaMarkdown.astro", void 0);

const $$Astro$6 = createAstro("https://phandc.net");
const $$PortfolioBody = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$PortfolioBody;
  const { data } = Astro2.props;
  return renderTemplate`${data && renderTemplate`${maybeRenderHead()}<article class="pt-8 space-y-8"><header class="space-y-3"><h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100"${addAttribute(tinaField(data, "title"), "data-tina-field")}>${data.title}</h1>${data.description && renderTemplate`<p class="text-gray-600 dark:text-gray-300"${addAttribute(tinaField(data, "description"), "data-tina-field")}>${data.description}</p>`}<dl class="mt-2 grid gap-4 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-3">${data.location && renderTemplate`<div><dt class="font-medium text-gray-900 dark:text-gray-100">Location</dt><dd${addAttribute(tinaField(data, "location"), "data-tina-field")}>${data.location}</dd></div>`}${data.client && renderTemplate`<div><dt class="font-medium text-gray-900 dark:text-gray-100">Client</dt><dd${addAttribute(tinaField(data, "client"), "data-tina-field")}>${data.client}</dd></div>`}${data.date && renderTemplate`<div><dt class="font-medium text-gray-900 dark:text-gray-100">Date</dt><dd${addAttribute(tinaField(data, "date"), "data-tina-field")}>${data.date}</dd></div>`}</dl>${data.image && renderTemplate`<img${addAttribute(data.image, "src")}${addAttribute(data.title ?? "", "alt")} class="mt-4 w-full rounded-lg object-cover"${addAttribute(tinaField(data, "image"), "data-tina-field")}>`}</header><section class="prose-content"${addAttribute(tinaField(data, "body"), "data-tina-field")}>${renderComponent($$result, "TinaMarkdown", $$TinaMarkdown, { "content": data.body })}</section>${data.quotes && data.quotes.length > 0 && renderTemplate`<section class="space-y-6"><h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Testimonials</h2><div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">${data.quotes.map(
    (q) => q ? renderTemplate`<figure class="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><blockquote${addAttribute(tinaField(q, "quote"), "data-tina-field")}>${q.quote}</blockquote>${q.author && renderTemplate`<figcaption class="mt-2 text-sm text-gray-500"${addAttribute(tinaField(q, "author"), "data-tina-field")}>${q.author}</figcaption>`}</figure>` : null
  )}</div></section>`}</article>`}`;
}, "/Users/hunter/Projects/phc/src/components/islands/PortfolioBody.astro", void 0);

const $$Astro$5 = createAstro("https://phandc.net");
const $$TagBody = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$TagBody;
  const { data } = Astro2.props;
  return renderTemplate`${data && renderTemplate`${maybeRenderHead()}<div class="min-w-0 flex-1 space-y-6"><div><h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100"${addAttribute(tinaField(data, "label"), "data-tina-field")}>${data.label}</h1>${data.description && renderTemplate`<p class="mt-1 text-gray-600 dark:text-gray-400"${addAttribute(tinaField(data, "description"), "data-tina-field")}>${data.description}</p>`}</div><section class="prose-content"${addAttribute(tinaField(data, "body"), "data-tina-field")}>${renderComponent($$result, "TinaMarkdown", $$TinaMarkdown, { "content": data.body })}</section></div>`}`;
}, "/Users/hunter/Projects/phc/src/components/islands/TagBody.astro", void 0);

const $$Astro$4 = createAstro("https://phandc.net");
const $$AboutBody = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$AboutBody;
  const { data } = Astro2.props;
  const hero = data?.hero;
  return renderTemplate`${data && renderTemplate`${maybeRenderHead()}<article class="pt-8 space-y-8"><header class="space-y-3"><h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100"${addAttribute(tinaField(data, "title"), "data-tina-field")}>${data.title}</h1>${hero?.tagline && renderTemplate`<p class="text-xl text-gray-700 dark:text-gray-200"${addAttribute(tinaField(hero, "tagline"), "data-tina-field")}>${hero.tagline}</p>`}${hero?.subtitle && renderTemplate`<p class="text-gray-600 dark:text-gray-300"${addAttribute(tinaField(hero, "subtitle"), "data-tina-field")}>${hero.subtitle}</p>`}</header>${data.body && renderTemplate`<section class="prose-content whitespace-pre-wrap"${addAttribute(tinaField(data, "body"), "data-tina-field")}>${data.body}</section>`}</article>`}`;
}, "/Users/hunter/Projects/phc/src/components/islands/AboutBody.astro", void 0);

const $$Astro$3 = createAstro("https://phandc.net");
const $$PageBody = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$PageBody;
  const { data } = Astro2.props;
  const hero = data?.hero;
  return renderTemplate`${data && renderTemplate`${maybeRenderHead()}<article class="pt-8 space-y-8"><header class="space-y-3"><h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100"${addAttribute(tinaField(data, "title"), "data-tina-field")}>${data.title}</h1>${data.description && renderTemplate`<p class="text-gray-600 dark:text-gray-300"${addAttribute(tinaField(data, "description"), "data-tina-field")}>${data.description}</p>`}${hero?.subtitle && renderTemplate`<p class="text-gray-600 dark:text-gray-300"${addAttribute(tinaField(hero, "subtitle"), "data-tina-field")}>${hero.subtitle}</p>`}</header>${data.body && renderTemplate`<section class="prose-content whitespace-pre-wrap"${addAttribute(tinaField(data, "body"), "data-tina-field")}>${data.body}</section>`}</article>`}`;
}, "/Users/hunter/Projects/phc/src/components/islands/PageBody.astro", void 0);

const $$Astro$2 = createAstro("https://phandc.net");
const $$HomeBody = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$HomeBody;
  const { data } = Astro2.props;
  const hero = data?.hero;
  return renderTemplate`${data && renderTemplate`${maybeRenderHead()}<section class="space-y-4 py-8 text-center">${hero?.eyebrow && renderTemplate`<p class="text-sm font-semibold uppercase tracking-wider text-primary"${addAttribute(tinaField(hero, "eyebrow"), "data-tina-field")}>${hero.eyebrow}</p>`}${hero?.tagline && renderTemplate`<h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100"${addAttribute(tinaField(hero, "tagline"), "data-tina-field")}>${hero.tagline}</h1>`}${hero?.subtitle && renderTemplate`<p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300"${addAttribute(tinaField(hero, "subtitle"), "data-tina-field")}>${hero.subtitle}</p>`}</section>`}`;
}, "/Users/hunter/Projects/phc/src/components/islands/HomeBody.astro", void 0);

const $$Astro$1 = createAstro("https://phandc.net");
const $$StaffBody = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$StaffBody;
  const { data } = Astro2.props;
  const staff = data?.staff ?? [];
  return renderTemplate`${data && renderTemplate`${maybeRenderHead()}<section class="pt-4"><h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">Key Personnel</h2><div class="grid grid-cols-1 gap-6">${staff.map(
    (member) => member ? renderTemplate`<div class="flex flex-col gap-1 rounded-lg border border-gray-200 p-4 dark:border-gray-700"><p class="text-lg font-semibold text-gray-900 dark:text-gray-100"${addAttribute(tinaField(member, "name"), "data-tina-field")}>${member.name}</p><p class="text-sm text-gray-600 dark:text-gray-300"${addAttribute(tinaField(member, "title"), "data-tina-field")}>${member.title}</p>${member.bio && renderTemplate`<p class="mt-1 text-sm text-gray-500 dark:text-gray-400"${addAttribute(tinaField(member, "bio"), "data-tina-field")}>${member.bio}</p>`}</div>` : null
  )}</div></section>`}`;
}, "/Users/hunter/Projects/phc/src/components/islands/StaffBody.astro", void 0);

const $$Astro = createAstro("https://phandc.net");
const $$SiteSettings = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SiteSettings;
  const { data } = Astro2.props;
  return renderTemplate`${data && renderTemplate`${maybeRenderHead()}<div><h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100"${addAttribute(tinaField(data, "portfolioTitle"), "data-tina-field")}>${data.portfolioTitle ?? "Portfolio"}</h1></div>`}`;
}, "/Users/hunter/Projects/phc/src/components/islands/SiteSettings.astro", void 0);

function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
const PortfolioPartsFragmentDoc = gql`
    fragment PortfolioParts on Portfolio {
  __typename
  title
  description
  location
  client
  date
  projectCost
  size
  architect
  contractor
  image
  gallery {
    __typename
    src
    alt
  }
  quotes {
    __typename
    quote
    author
    role
    featured
  }
  sectors
  services
  order
  featured
  videos {
    __typename
    title
    youtube
    description
    thumbnail
    featured
  }
  contentCards {
    __typename
    title
    content
    image
    ctaText
    ctaHref
    layout
    width
    backgroundColor
    textSize
    imagePosition
    matchImageHeight
  }
  body
}
    `;
const TagsPartsFragmentDoc = gql`
    fragment TagsParts on Tags {
  __typename
  label
  description
  image
  parent {
    ... on Tags {
      __typename
      label
      description
      image
      parent {
        ... on Tags {
          __typename
          label
          description
          image
          order
          videos {
            __typename
            title
            youtube
            description
            thumbnail
            featured
          }
          contentCards {
            __typename
            title
            content
            image
            ctaText
            ctaHref
            layout
            width
            backgroundColor
            textSize
            imagePosition
            matchImageHeight
          }
          body
        }
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
      }
      order
      videos {
        __typename
        title
        youtube
        description
        thumbnail
        featured
      }
      contentCards {
        __typename
        title
        content
        image
        ctaText
        ctaHref
        layout
        width
        backgroundColor
        textSize
        imagePosition
        matchImageHeight
      }
      body
    }
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
  }
  order
  videos {
    __typename
    title
    youtube
    description
    thumbnail
    featured
  }
  contentCards {
    __typename
    title
    content
    image
    ctaText
    ctaHref
    layout
    width
    backgroundColor
    textSize
    imagePosition
    matchImageHeight
  }
  body
}
    `;
const AboutPartsFragmentDoc = gql`
    fragment AboutParts on About {
  __typename
  title
  featuredImage
  hero {
    __typename
    size
    eyebrow
    tagline
    subtitle
    ctaPrimaryText
    ctaPrimaryHref
    ctaSecondaryText
    ctaSecondaryHref
    backgroundImage
    overlayOpacity
    overlayColor
  }
  videos {
    __typename
    title
    youtube
    description
    thumbnail
    featured
  }
  contentCards {
    __typename
    title
    content
    image
    ctaText
    ctaHref
    layout
    width
    backgroundColor
    textSize
    imagePosition
    matchImageHeight
  }
  body
}
    `;
const PagesPartsFragmentDoc = gql`
    fragment PagesParts on Pages {
  __typename
  title
  description
  featuredImage
  hero {
    __typename
    size
    eyebrow
    tagline
    subtitle
    ctaPrimaryText
    ctaPrimaryHref
    ctaSecondaryText
    ctaSecondaryHref
    backgroundImage
    overlayOpacity
    overlayColor
  }
  videos {
    __typename
    title
    youtube
    description
    thumbnail
    featured
  }
  contentCards {
    __typename
    title
    content
    image
    ctaText
    ctaHref
    layout
    width
    backgroundColor
    textSize
    imagePosition
    matchImageHeight
  }
  body
}
    `;
const StaffPartsFragmentDoc = gql`
    fragment StaffParts on Staff {
  __typename
  staff {
    __typename
    name
    title
    bio
    image
    note
  }
}
    `;
const SitePartsFragmentDoc = gql`
    fragment SiteParts on Site {
  __typename
  portfolioTitle
  tagsTitle
}
    `;
const HomePartsFragmentDoc = gql`
    fragment HomeParts on Home {
  __typename
  title
  maxProjects
  maxTestimonials
  maxVideos
  hero {
    __typename
    size
    eyebrow
    tagline
    subtitle
    ctaPrimaryText
    ctaPrimaryHref
    ctaSecondaryText
    ctaSecondaryHref
    backgroundImage
    overlayOpacity
    overlayColor
  }
  contentCards {
    __typename
    title
    content
    image
    ctaText
    ctaHref
    layout
    width
    backgroundColor
    textSize
    imagePosition
    matchImageHeight
  }
}
    `;
const PortfolioDocument = gql`
    query portfolio($relativePath: String!) {
  portfolio(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PortfolioParts
  }
}
    ${PortfolioPartsFragmentDoc}`;
const PortfolioConnectionDocument = gql`
    query portfolioConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PortfolioFilter) {
  portfolioConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PortfolioParts
      }
    }
  }
}
    ${PortfolioPartsFragmentDoc}`;
const TagsDocument = gql`
    query tags($relativePath: String!) {
  tags(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...TagsParts
  }
}
    ${TagsPartsFragmentDoc}`;
const TagsConnectionDocument = gql`
    query tagsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: TagsFilter) {
  tagsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...TagsParts
      }
    }
  }
}
    ${TagsPartsFragmentDoc}`;
const AboutDocument = gql`
    query about($relativePath: String!) {
  about(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...AboutParts
  }
}
    ${AboutPartsFragmentDoc}`;
const AboutConnectionDocument = gql`
    query aboutConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: AboutFilter) {
  aboutConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...AboutParts
      }
    }
  }
}
    ${AboutPartsFragmentDoc}`;
const PagesDocument = gql`
    query pages($relativePath: String!) {
  pages(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PagesParts
  }
}
    ${PagesPartsFragmentDoc}`;
const PagesConnectionDocument = gql`
    query pagesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PagesFilter) {
  pagesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PagesParts
      }
    }
  }
}
    ${PagesPartsFragmentDoc}`;
const StaffDocument = gql`
    query staff($relativePath: String!) {
  staff(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...StaffParts
  }
}
    ${StaffPartsFragmentDoc}`;
const StaffConnectionDocument = gql`
    query staffConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: StaffFilter) {
  staffConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...StaffParts
      }
    }
  }
}
    ${StaffPartsFragmentDoc}`;
const SiteDocument = gql`
    query site($relativePath: String!) {
  site(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...SiteParts
  }
}
    ${SitePartsFragmentDoc}`;
const SiteConnectionDocument = gql`
    query siteConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: SiteFilter) {
  siteConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...SiteParts
      }
    }
  }
}
    ${SitePartsFragmentDoc}`;
const HomeDocument = gql`
    query home($relativePath: String!) {
  home(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...HomeParts
  }
}
    ${HomePartsFragmentDoc}`;
const HomeConnectionDocument = gql`
    query homeConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: HomeFilter) {
  homeConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...HomeParts
      }
    }
  }
}
    ${HomePartsFragmentDoc}`;
function getSdk(requester) {
  return {
    portfolio(variables, options) {
      return requester(PortfolioDocument, variables, options);
    },
    portfolioConnection(variables, options) {
      return requester(PortfolioConnectionDocument, variables, options);
    },
    tags(variables, options) {
      return requester(TagsDocument, variables, options);
    },
    tagsConnection(variables, options) {
      return requester(TagsConnectionDocument, variables, options);
    },
    about(variables, options) {
      return requester(AboutDocument, variables, options);
    },
    aboutConnection(variables, options) {
      return requester(AboutConnectionDocument, variables, options);
    },
    pages(variables, options) {
      return requester(PagesDocument, variables, options);
    },
    pagesConnection(variables, options) {
      return requester(PagesConnectionDocument, variables, options);
    },
    staff(variables, options) {
      return requester(StaffDocument, variables, options);
    },
    staffConnection(variables, options) {
      return requester(StaffConnectionDocument, variables, options);
    },
    site(variables, options) {
      return requester(SiteDocument, variables, options);
    },
    siteConnection(variables, options) {
      return requester(SiteConnectionDocument, variables, options);
    },
    home(variables, options) {
      return requester(HomeDocument, variables, options);
    },
    homeConnection(variables, options) {
      return requester(HomeConnectionDocument, variables, options);
    }
  };
}
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};

const client = createClient({ url: "http://localhost:4001/graphql", token: "17fd4a0e6589fd0728cdd491f16085ff07cabcda", queries });

const getPortfolio = (slug) => requestWithMetadata(
  client.queries.portfolio({ relativePath: `${slug}.md` }),
  { priority: "primary" }
);
const getTag = (slug) => requestWithMetadata(
  client.queries.tags({ relativePath: `${slug}.md` }),
  { priority: "primary" }
);
const getAbout = () => requestWithMetadata(
  client.queries.about({ relativePath: "index.md" }),
  { priority: "primary" }
);
const getPage = (slug) => requestWithMetadata(
  client.queries.pages({ relativePath: `${slug}.md` }),
  { priority: "primary" }
);
const getHome = () => requestWithMetadata(
  client.queries.home({ relativePath: "index.json" }),
  { priority: "primary" }
);
const getStaff = () => requestWithMetadata(client.queries.staff({ relativePath: "index.json" }));
const getSite = () => requestWithMetadata(client.queries.site({ relativePath: "index.json" }));

const islands = {
  portfolio: {
    fetch: (_request, params) => getPortfolio(params.get("slug") ?? ""),
    component: $$PortfolioBody,
    wrapper: { tag: "div" },
    propsFromData: (data) => ({
      data: data.data?.portfolio
    })
  },
  tag: {
    fetch: (_request, params) => getTag(params.get("slug") ?? ""),
    component: $$TagBody,
    wrapper: { tag: "div" },
    propsFromData: (data) => ({
      data: data.data?.tags
    })
  },
  about: {
    fetch: () => getAbout(),
    component: $$AboutBody,
    wrapper: { tag: "div" },
    propsFromData: (data) => ({
      data: data.data?.about
    })
  },
  page: {
    fetch: (_request, params) => getPage(params.get("slug") ?? ""),
    component: $$PageBody,
    wrapper: { tag: "div" },
    propsFromData: (data) => ({
      data: data.data?.pages
    })
  },
  home: {
    fetch: () => getHome(),
    component: $$HomeBody,
    wrapper: { tag: "div" },
    propsFromData: (data) => ({
      data: data.data?.home
    })
  },
  staff: {
    fetch: () => getStaff(),
    component: $$StaffBody,
    wrapper: { tag: "div" },
    propsFromData: (data) => ({
      data: data.data?.staff
    })
  },
  site: {
    fetch: () => getSite(),
    component: $$SiteSettings,
    wrapper: { tag: "div" },
    propsFromData: (data) => ({
      data: data.data?.site
    })
  }
};

export { islands as i };
