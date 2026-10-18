const MIN_TITLE = 30;
const MAX_TITLE = 75;
const PREFIX = 'PH&C - ';

const ROOT_SUFFIXES: Record<string, string> = {
  '/about': "Owner's Representative in Wayne, PA",
  '/contact': "Owner's Representative in Greater Philadelphia",
  '/portfolio': 'Projects by Sector',
  '/services': "Owner's Representation & Construction Management",
  '/privacy-policy': 'Website Privacy Practices',
  '/testimonials': 'What Clients Say About PH&C',
  '/videos': 'Project and Service Videos',
};

function suffixFor(pathname: string): string {
  const path = pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  if (ROOT_SUFFIXES[path]) return ROOT_SUFFIXES[path];
  if (path.startsWith('/about/')) return "Owner's Representative Team";
  if (path.startsWith('/services/')) return "Owner's Representative Service";
  if (path.startsWith('/portfolio/')) return 'Project Portfolio';
  return "Owner's Representative & Construction Management";
}

/**
 * Browser and search title: keep it between 30 and 75 characters.
 * The visible page heading is unchanged. Short titles get a plain descriptor,
 * and long ones drop trailing " - place" segments.
 */
export function seoTitle(displayTitle: string, pathname: string): string {
  let title = displayTitle;

  while (title.length > MAX_TITLE) {
    const cut = title.lastIndexOf(' - ');
    if (cut <= PREFIX.length) break;
    title = title.slice(0, cut);
  }

  if (title.length < MIN_TITLE) {
    const extended = `${title} | ${suffixFor(pathname)}`;
    if (extended.length <= MAX_TITLE) title = extended;
  }

  return title;
}
