// Tina opens a document from the collection list with history.replaceState.
// That drops the list, so the browser Back button cannot return to it.
// For guides, keep the list (`#/collections/guides/~`) on the stack.

const patched = Symbol.for('phc.guidesHistoryPush');

function hashPath(url: string): string {
  const hashIndex = url.indexOf('#');
  const hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : url;
  const path = hash.split('?')[0];
  return path.startsWith('/') ? path : `/${path}`;
}

function isGuidesList(path: string) {
  return path === '/collections/guides' || path === '/collections/guides/~';
}

function isGuideDocument(path: string) {
  return path.startsWith('/collections/edit/guides/');
}

if (typeof window !== 'undefined' && !(history as History & { [patched]?: boolean })[patched]) {
  const originalReplaceState = history.replaceState.bind(history);
  history.replaceState = function (data, unused, url) {
    const current = hashPath(window.location.href);
    const next = url == null ? current : hashPath(String(url));
    if (isGuidesList(current) && isGuideDocument(next)) {
      const state =
        data && typeof data === 'object'
          ? { ...data, idx: ((data as { idx?: number }).idx ?? 0) + 1 }
          : data;
      history.pushState(state, unused, url);
      return;
    }
    return originalReplaceState(data, unused, url);
  };
  (history as History & { [patched]?: boolean })[patched] = true;
}
