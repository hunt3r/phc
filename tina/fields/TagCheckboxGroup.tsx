import * as React from 'react';
import { wrapFieldsWithMeta, useCMS } from 'tinacms';

// Maps a portfolio field name to the root tag whose descendants are selectable.
const ROOT_BY_FIELD: Record<string, string> = {
  sectors: 'portfolio',
  services: 'services',
};

type TagNode = {
  slug: string;
  label: string;
  order: number;
  parent: string;
};

type Option = { value: string; label: string };

const TAGS_QUERY = `
  query TagOptions {
    tagsConnection(first: 1000) {
      edges {
        node {
          _sys { filename }
          label
          order
          parent {
            ... on Tags { _sys { filename } }
          }
        }
      }
    }
  }
`;

function rootOf(slug: string, bySlug: Map<string, TagNode>): string {
  let current = bySlug.get(slug);
  const seen = new Set<string>([slug]);
  while (current?.parent && !seen.has(current.parent)) {
    seen.add(current.parent);
    const next = bySlug.get(current.parent);
    if (!next) return current.parent;
    current = next;
  }
  return current ? current.slug : slug;
}

function buildOptions(tags: TagNode[], root: string): Option[] {
  const bySlug = new Map(tags.map((t) => [t.slug, t]));
  return tags
    .filter((t) => t.slug !== root && rootOf(t.slug, bySlug) === root)
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    .map((t) => ({ value: t.slug, label: t.label }));
}

export const TagCheckboxGroup = wrapFieldsWithMeta(({ input, field }: any) => {
  const cms = useCMS();
  const root = ROOT_BY_FIELD[field.name] ?? field.name;

  const [options, setOptions] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res: any = await cms.api.tina.request(TAGS_QUERY, { variables: {} });
        if (cancelled) return;
        const edges = res?.tagsConnection?.edges ?? [];
        const tags: TagNode[] = edges
          .map((edge: any) => edge?.node)
          .filter(Boolean)
          .map((node: any) => ({
            slug: node._sys?.filename ?? '',
            label: node.label ?? node._sys?.filename ?? '',
            order: typeof node.order === 'number' ? node.order : 999,
            parent: node.parent?._sys?.filename ?? '',
          }))
          .filter((t: TagNode) => t.slug);
        setOptions(buildOptions(tags, root));
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load tags');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cms, root]);

  const selected: string[] = Array.isArray(input.value) ? input.value : [];

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    input.onChange(next);
  };

  if (loading) {
    return <div style={{ color: 'var(--tina-color-grey-6)', fontSize: 13 }}>Loading tags…</div>;
  }

  if (error) {
    return <div style={{ color: 'var(--tina-color-error)', fontSize: 13 }}>{error}</div>;
  }

  if (options.length === 0) {
    return (
      <div style={{ color: 'var(--tina-color-grey-6)', fontSize: 13 }}>
        No tags found. Create tags under the “{root}” root in the Tags collection.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {options.map((opt) => {
        const checked = selected.includes(opt.value);
        return (
          <label
            key={opt.value}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}
          >
            <input type="checkbox" checked={checked} onChange={() => toggle(opt.value)} />
            <span>{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
});
