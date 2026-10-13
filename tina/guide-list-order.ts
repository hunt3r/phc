import { TinaAdminApi } from 'tinacms';

// Tina's collection list sorts by the title field when no sort is chosen.
// These articles should open in reading order instead.
const patched = Symbol.for('phc.guidesListOrder');
const Api = TinaAdminApi as typeof TinaAdminApi & { [patched]?: boolean };

if (!Api[patched]) {
  const original = TinaAdminApi.prototype.fetchCollection;
  TinaAdminApi.prototype.fetchCollection = function (collectionName, includeDocuments, folder, after, sortKey, order, filterArgs) {
    if (collectionName === 'guides' && !sortKey) {
      sortKey = 'order';
      order = order ?? 'asc';
    }
    return original.call(this, collectionName, includeDocuments, folder, after, sortKey, order, filterArgs);
  };
  Api[patched] = true;
}
