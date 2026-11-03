import * as React from 'react';
import { wrapFieldsWithMeta } from 'tinacms';

const FULL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const YEAR_ONLY = /^(\d{4})$/;

/**
 * Date-only picker for a portfolio project. Saves `YYYY-MM-DD`.
 * A legacy year such as `2026` is left in place until an editor picks a day
 * or clears the date. An empty picker must not rewrite that year on its own.
 */
export const ProjectDateField = wrapFieldsWithMeta(({ input }) => {
  const raw = typeof input.value === 'string' ? input.value.trim() : '';
  const fullDate = FULL_DATE.test(raw) ? raw : '';
  const yearOnly = YEAR_ONLY.test(raw) ? raw : '';

  return (
    <div>
      <input
        type="date"
        value={fullDate}
        aria-label="Date"
        onChange={(event) => {
          const next = event.target.value;
          if (!next && yearOnly) return;
          input.onChange(next);
        }}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid var(--tina-color-grey-2)',
          borderRadius: 4,
          padding: '8px 10px',
          fontSize: 14,
          background: 'var(--tina-color-grey-0, #fff)',
          color: 'inherit',
        }}
      />
      {yearOnly ? (
        <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.45 }}>
          Saved as the year {yearOnly}. Pick a month and day to replace it.
          Leaving this picker empty keeps {yearOnly}.
        </p>
      ) : null}
      {fullDate || yearOnly ? (
        <button
          type="button"
          onClick={() => input.onChange('')}
          style={{
            marginTop: 8,
            padding: 0,
            border: 0,
            background: 'none',
            color: 'var(--tina-color-primary)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Clear date
        </button>
      ) : null}
    </div>
  );
});
