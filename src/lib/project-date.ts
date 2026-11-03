/**
 * Portfolio dates are calendar days, stored as `YYYY-MM-DD`, or a legacy
 * year such as `2026`. Parse the text directly so a date never shifts with
 * the timezone the way `new Date('2026-02-04')` does.
 */

const FULL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const YEAR_ONLY = /^(\d{4})$/;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export type ProjectDate = {
  year: number;
  month?: number;
  day?: number;
};

export function parseProjectDate(value: string | null | undefined): ProjectDate | null {
  if (!value) return null;
  const trimmed = value.trim();

  const full = FULL_DATE.exec(trimmed);
  if (full) {
    const year = Number(full[1]);
    const month = Number(full[2]);
    const day = Number(full[3]);
    if (month < 1 || month > 12) return null;
    const utc = new Date(Date.UTC(year, month - 1, day));
    if (
      utc.getUTCFullYear() !== year ||
      utc.getUTCMonth() !== month - 1 ||
      utc.getUTCDate() !== day
    ) {
      return null;
    }
    return { year, month, day };
  }

  const year = YEAR_ONLY.exec(trimmed);
  if (!year) return null;
  return { year: Number(year[1]) };
}

/** Visitor-facing date. A full day reads "February 4, 2026"; a year stays "2026". */
export function formatProjectDate(value: string | null | undefined): string {
  const parsed = parseProjectDate(value);
  if (!parsed) return '';
  if (parsed.month == null || parsed.day == null) return String(parsed.year);
  return `${MONTHS[parsed.month - 1]} ${parsed.day}, ${parsed.year}`;
}

/**
 * Newest-first sort key. A year with no month or day sorts as January 1 of
 * that year, so a known day in the same year ranks ahead of it. Missing and
 * unreadable values sort as 0.
 */
export function projectDateSortValue(value: string | null | undefined): number {
  const parsed = parseProjectDate(value);
  if (!parsed) return 0;
  const month = parsed.month ?? 1;
  const day = parsed.day ?? 1;
  return parsed.year * 10000 + month * 100 + day;
}

type DatedEntry = {
  data: {
    date?: string | null;
    order?: number | null;
    title?: string | null;
  };
};

function byDateThenTitle(a: DatedEntry, b: DatedEntry): number {
  const dateA = projectDateSortValue(a.data.date);
  const dateB = projectDateSortValue(b.data.date);
  if (dateA !== dateB) return dateB - dateA;
  return (a.data.title ?? '').localeCompare(b.data.title ?? '');
}

/**
 * Newest date first. A set Order is a 1-based spot in that list: 1 is first.
 * A blank Order leaves the project in date order. Projects with no date come
 * last. The same date sorts by title.
 */
export function sortPortfolioEntries<T extends DatedEntry>(entries: readonly T[]): T[] {
  const automatic = entries.filter((entry) => typeof entry.data.order !== 'number').sort(byDateThenTitle);
  const overrides = entries
    .filter((entry): entry is T & { data: { order: number } } => typeof entry.data.order === 'number')
    .sort((a, b) => a.data.order - b.data.order || byDateThenTitle(a, b));

  const sorted = [...automatic];
  for (let index = overrides.length - 1; index >= 0; index -= 1) {
    const entry = overrides[index];
    const spot = Math.max(0, Math.floor(entry.data.order) - 1);
    sorted.splice(Math.min(spot, sorted.length), 0, entry);
  }
  return sorted;
}

/** `YYYY-MM-DD` when a full day is known, otherwise the year. */
export function projectDateIso(value: string | null | undefined): string | undefined {
  const parsed = parseProjectDate(value);
  if (!parsed) return undefined;
  if (parsed.month == null || parsed.day == null) return String(parsed.year);
  const month = String(parsed.month).padStart(2, '0');
  const day = String(parsed.day).padStart(2, '0');
  return `${parsed.year}-${month}-${day}`;
}
