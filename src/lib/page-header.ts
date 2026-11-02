/**
 * Pages and Contact share a header: a banner when Featured Image is set, and
 * an in-page title below the breadcrumb when it is blank.
 */

/** A featured image is set when the field has a non-blank URL. */
export function hasFeaturedImage(value?: string | null): boolean {
  return Boolean(value?.trim());
}

/** Fields the banner and the in-page title both read. Pages and Contact have them. */
export interface PageHeaderDocument {
  title?: string | null;
  description?: string | null;
  featuredImage?: string | null;
  _content_source?: {
    queryId: string;
    path: (number | string)[];
  };
}
