import { AsyncLocalStorage } from 'node:async_hooks';

function escapeAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const STORE_KEY$1 = Symbol.for("@tinacms/astro/forms-store");
const slot$1 = globalThis;
const formsStore = slot$1[STORE_KEY$1] ??= new AsyncLocalStorage();
function recordForm(form) {
  const list = formsStore.getStore();
  if (!list) return;
  const existing = list.find((entry) => entry.id === form.id);
  if (existing) {
    if (form.priority === "primary") existing.priority = "primary";
    return;
  }
  list.push(form);
}
function sortByPriority(forms) {
  return [...forms].sort(
    (a, b) => (a.priority === "primary" ? 0 : 1) - (b.priority === "primary" ? 0 : 1)
  );
}
function renderFormPayloadDiv(form, primary) {
  return `<div data-tina-form="${escapeAttr(JSON.stringify(form))}"${primary ? " data-tina-primary" : ""} hidden></div>`;
}

const STORE_KEY = Symbol.for("@tinacms/astro/request-context");
const slot = globalThis;
const requestStore = slot[STORE_KEY] ??= new AsyncLocalStorage();

export { renderFormPayloadDiv as a, recordForm as b, escapeAttr as e, formsStore as f, requestStore as r, sortByPriority as s };
