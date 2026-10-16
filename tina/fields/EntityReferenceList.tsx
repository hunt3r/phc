import * as React from 'react';
import { wrapFieldsWithMeta, useCMS } from 'tinacms';

export const ENTITY_KINDS = [
  { value: 'person', label: 'Person' },
  { value: 'company', label: 'Company' },
  { value: 'organization', label: 'Organization' },
] as const;

const COLLECTION_PATH = 'src/content/entities';

const ENTITIES_QUERY = `
  query EntityOptions {
    entitiesConnection(first: 1000) {
      edges {
        node {
          ... on Entities {
            id
            name
            kind
            url
            logo
          }
        }
      }
    }
  }
`;

const CREATE_ENTITY = `
  mutation CreateEntity($relativePath: String!, $params: DocumentMutation!) {
    createDocument(collection: "entities", relativePath: $relativePath, params: $params) {
      __typename
    }
  }
`;

type Kind = (typeof ENTITY_KINDS)[number]['value'];

type EntityOption = {
  id: string;
  name: string;
  kind: string;
  url: string;
  logo: string;
};

type Credit = { entity: string };

export function entitySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function creditsOf(value: unknown): Credit[] {
  if (!Array.isArray(value)) return [];
  const credits: Credit[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const entity = (item as { entity?: unknown }).entity;
    if (typeof entity === 'string' && entity.trim()) credits.push({ entity: entity.trim() });
  }
  return credits;
}

function filenameOf(id: string): string {
  const base = id.split('/').pop() ?? id;
  return base.replace(/\.(md|mdx|json)$/i, '');
}

function openEntity(cms: ReturnType<typeof useCMS>, id: string) {
  if (cms.state.editingMode === 'visual') {
    cms.dispatch({ type: 'forms:set-active-form-id', value: id });
    return;
  }
  const preview = cms.flags.get('tina-preview');
  const base = preview ? `/${preview}/index.html#` : '/admin#';
  window.location.href = `${base}/collections/edit/entities/~/${filenameOf(id)}`;
}

export const EntityReferenceList = wrapFieldsWithMeta(({ input }: { input: any }) => {
  const cms = useCMS();
  const selected = creditsOf(input.value);

  const [options, setOptions] = React.useState<EntityOption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState('');
  const [kind, setKind] = React.useState<Kind>('company');
  const [url, setUrl] = React.useState('');
  const [logo, setLogo] = React.useState('');

  const load = React.useCallback(async () => {
    const res: any = await cms.api.tina.request(ENTITIES_QUERY, { variables: {} });
    const edges = res?.entitiesConnection?.edges ?? [];
    const next: EntityOption[] = edges
      .map((edge: any) => edge?.node)
      .filter(Boolean)
      .map((node: any) => ({
        id: String(node.id ?? ''),
        name: String(node.name ?? ''),
        kind: String(node.kind ?? ''),
        url: String(node.url ?? ''),
        logo: String(node.logo ?? ''),
      }))
      .filter((entity: EntityOption) => entity.id && entity.name);
    next.sort((a, b) => a.name.localeCompare(b.name));
    setOptions(next);
    return next;
  }, [cms]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Could not load entities');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const byId = React.useMemo(() => new Map(options.map((entity) => [entity.id, entity])), [options]);

  const write = (next: Credit[]) => input.onChange(next);

  const add = (id: string) => {
    if (selected.some((credit) => credit.entity === id)) return;
    write([...selected, { entity: id }]);
    setQuery('');
  };

  const remove = (index: number) => write(selected.filter((_, i) => i !== index));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selected.length) return;
    const next = selected.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    write(next);
  };

  const needle = query.trim().toLowerCase();
  const matches = options
    .filter((entity) => !selected.some((credit) => credit.entity === entity.id))
    .filter((entity) => !needle || entity.name.toLowerCase().includes(needle))
    .slice(0, 8);

  const chooseLogo = () => {
    cms.media.open({
      allowDelete: false,
      onSelect: (media) => {
        if (media?.src) setLogo(media.src);
      },
    });
  };

  const createEntity = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    const existing = options.find((entity) => entity.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      add(existing.id);
      setCreating(false);
      setName('');
      setUrl('');
      setLogo('');
      setKind('company');
      return;
    }

    const base = entitySlug(trimmed);
    if (!base) {
      setError('Enter a name that can be saved.');
      return;
    }
    const used = new Set(options.map((entity) => filenameOf(entity.id)));
    let slug = base;
    let n = 2;
    while (used.has(slug)) {
      slug = `${base}-${n}`;
      n += 1;
    }

    const record: Record<string, string> = { name: trimmed, kind };
    if (url.trim()) record.url = url.trim();
    if (logo.trim()) record.logo = logo.trim();

    setSaving(true);
    setError(null);
    try {
      await cms.api.tina.request(CREATE_ENTITY, {
        variables: {
          relativePath: `${slug}.md`,
          params: { entities: record },
        },
      });
      const id = `${COLLECTION_PATH}/${slug}.md`;
      await load();
      add(id);
      setCreating(false);
      setName('');
      setUrl('');
      setLogo('');
      setKind('company');
    } catch (err: any) {
      setError(err?.message || 'Could not create the entity');
    } finally {
      setSaving(false);
    }
  };

  const buttonStyle: React.CSSProperties = {
    border: '1px solid var(--tina-color-grey-2)',
    background: 'white',
    borderRadius: 4,
    padding: '4px 8px',
    fontSize: 13,
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {selected.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {selected.map((credit, index) => {
            const entity = byId.get(credit.entity);
            return (
              <li
                key={`${credit.entity}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid var(--tina-color-grey-2)',
                  borderRadius: 6,
                  padding: '6px 8px',
                }}
              >
                <button
                  type="button"
                  onClick={() => openEntity(cms, credit.entity)}
                  style={{
                    flex: 1,
                    fontSize: 14,
                    textAlign: 'left',
                    background: 'none',
                    border: 0,
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--tina-color-primary)',
                  }}
                >
                  {entity?.name || filenameOf(credit.entity)}
                </button>
                <button type="button" style={buttonStyle} onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                  Up
                </button>
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => move(index, 1)}
                  disabled={index === selected.length - 1}
                  aria-label="Move down"
                >
                  Down
                </button>
                <button type="button" style={buttonStyle} onClick={() => remove(index)}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        <span style={{ color: 'var(--tina-color-grey-6)' }}>Search existing</span>
        <input
          type="search"
          value={query}
          placeholder={loading ? 'Loading…' : 'Type a name'}
          onChange={(event) => setQuery(event.target.value)}
          style={{
            border: '1px solid var(--tina-color-grey-2)',
            borderRadius: 4,
            padding: '6px 8px',
            fontSize: 14,
          }}
        />
      </label>

      {needle && matches.length === 0 && !loading && (
        <div style={{ color: 'var(--tina-color-grey-6)', fontSize: 13 }}>No matching entity.</div>
      )}

      {matches.length > 0 && (needle || selected.length === 0) && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {matches.map((entity) => (
            <li key={entity.id}>
              <button type="button" onClick={() => add(entity.id)} style={{ ...buttonStyle, width: '100%', textAlign: 'left' }}>
                {entity.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!creating ? (
        <button type="button" style={buttonStyle} onClick={() => setCreating(true)}>
          Add new entity
        </button>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            border: '1px solid var(--tina-color-grey-2)',
            borderRadius: 6,
            padding: 10,
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={{ border: '1px solid var(--tina-color-grey-2)', borderRadius: 4, padding: '6px 8px', fontSize: 14 }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
            Kind
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as Kind)}
              style={{ border: '1px solid var(--tina-color-grey-2)', borderRadius: 4, padding: '6px 8px', fontSize: 14 }}
            >
              {ENTITY_KINDS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
            Website
            <input
              type="url"
              value={url}
              placeholder="https://"
              onChange={(event) => setUrl(event.target.value)}
              style={{ border: '1px solid var(--tina-color-grey-2)', borderRadius: 4, padding: '6px 8px', fontSize: 14 }}
            />
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" style={buttonStyle} onClick={chooseLogo}>
              {logo ? 'Change logo' : 'Choose logo'}
            </button>
            {logo && (
              <button type="button" style={buttonStyle} onClick={() => setLogo('')}>
                Remove logo
              </button>
            )}
            {logo && <img src={logo} alt="" style={{ height: 28, width: 28, objectFit: 'contain', background: 'white' }} />}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" style={buttonStyle} disabled={!name.trim() || saving} onClick={createEntity}>
              {saving ? 'Saving…' : 'Save entity'}
            </button>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => {
                setCreating(false);
                setName('');
                setUrl('');
                setLogo('');
                setKind('company');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <div style={{ color: 'var(--tina-color-error)', fontSize: 13 }}>{error}</div>}
    </div>
  );
});
