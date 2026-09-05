import { defineConfig } from 'tinacms';
// Sectors/Services options are fetched live from the tags collection by a custom
// admin field component, so no tag data is baked into the schema.
import { TagCheckboxGroup } from './fields/TagCheckboxGroup';
// Precomputed tag slug -> public URL map for the tags collection router.
// Regenerate with `npm run generate:tag-routes`.
import { tagRoutes } from './tag-routes';

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

// Only enable TinaCloud search when explicitly turned on with a valid, dedicated
// search token. An invalid/missing indexer token otherwise fails the indexing
// pipeline, which leaves the remote schema stale and breaks admin schema
// validation ("An unexpected error occurred while validating your Tina schema").
const enableSearch = process.env.TINA_SEARCH_ENABLED === 'true';

/**
 * Fields for a reusable "Content Card" promo section. Attached as a `contentCards`
 * list on multiple collections; rendered below the body and above any project list.
 */
const contentCardFields: any[] = [
  { type: 'string', name: 'title', label: 'Title', description: 'Optional. Shown as a heading (H3) above the card content.' },
  { type: 'rich-text', name: 'content', label: 'Content', description: 'Rich text shown in the card. Supports headings, bold, lists, links, etc.' },
  { type: 'image', name: 'image', label: 'Image', description: 'Optional. Upload via Cloudinary.' },
  { type: 'string', name: 'ctaText', label: 'CTA Text', description: 'Optional button label.' },
  { type: 'string', name: 'ctaHref', label: 'CTA Link', description: 'Optional button link (URL or path).' },
  {
    type: 'string',
    name: 'layout',
    label: 'Layout',
    options: ['vertical', 'horizontal'],
    ui: { component: 'select' },
    description: 'Vertical stacks the image above the text; horizontal places them side by side.',
  },
  {
    type: 'string',
    name: 'width',
    label: 'Width',
    options: ['contained', 'full'],
    ui: { component: 'select' },
    description: 'Contained stays within the page width; full bleeds to the edge of the viewport.',
  },
  {
    type: 'string',
    name: 'backgroundColor',
    label: 'Background Color',
    options: ['none', 'primary', 'secondary', 'brand-blue', 'surface', 'brand-beige'],
    ui: { component: 'select' },
    description: 'Background color behind the card content. Use with full width for a color band.',
  },
  {
    type: 'string',
    name: 'textSize',
    label: 'Text Size',
    options: ['sm', 'base', 'lg', 'xl'],
    ui: { component: 'select' },
    description: 'Base text size for the card content.',
  },
  {
    type: 'string',
    name: 'imagePosition',
    label: 'Image Position (horizontal only)',
    options: ['left', 'right'],
    ui: { component: 'select' },
    description: 'Which side the image sits on when layout is horizontal.',
  },
  {
    type: 'boolean',
    name: 'matchImageHeight',
    label: 'Match image height to content (horizontal only)',
    description: 'Crop the image to the height of the text content, clipping from the center.',
  },
  {
    type: 'object',
    name: 'gallery',
    label: 'Image Gallery',
    list: true,
    description: 'Optional. Images shown as a thumbnail grid with a lightbox, below the card content.',
    ui: {
      itemProps: (item: any) => {
        const src: string = item?.src ?? '';
        const thumb = src.includes('/upload/')
          ? src.replace('/upload/', '/upload/w_80,h_80,c_fill,q_auto,f_auto/')
          : src;
        const filename = src.split('/').pop()?.split('?')[0] ?? '';
        const label = item?.alt || filename || 'Gallery image';
        return {
          label,
          ...(thumb && {
            style: {
              backgroundImage: `url("${thumb}")`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'auto 28px',
              backgroundPosition: 'right 64px center',
              paddingRight: '104px',
            },
          }),
        } as any;
      },
    },
    fields: [
      { type: 'image', name: 'src', label: 'Image' },
      { type: 'string', name: 'alt', label: 'Alt text' },
      { type: 'string', name: 'href', label: 'Link URL', description: 'Optional. Link this image to another page (e.g. a portfolio item).' },
      { type: 'string', name: 'ctaText', label: 'Link button label', description: 'Optional. Defaults to "View project".' },
    ],
  },
];

const contentCardsField = {
  type: 'object' as const,
  name: 'contentCards',
  label: 'Content Cards',
  list: true,
  description: 'Promotional cards shown below the body content and above any project listing.',
  ui: {
    itemProps: (item: any) => ({ label: item?.title || item?.ctaText || item?.ctaHref || 'Content card' }),
  },
  fields: contentCardFields,
};

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    loadCustomStore: async () => {
      const pack = await import('next-tinacms-cloudinary');
      return pack.TinaCloudCloudinaryMediaStore;
    },
  },
  schema: {
    collections: [
      {
        name: 'portfolio',
        label: 'Portfolio',
        path: 'src/content/portfolio',
        format: 'md',
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true },
          { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
          { type: 'string', name: 'location', label: 'Location' },
          { type: 'string', name: 'client', label: 'Client' },
          { type: 'string', name: 'date', label: 'Date (e.g. 2020)' },
          { type: 'string', name: 'projectCost', label: 'Project Cost', description: 'e.g. $145M' },
          { type: 'string', name: 'size', label: 'Size', description: 'e.g. 166,000 SF' },
          { type: 'string', name: 'architect', label: 'Architect' },
          { type: 'string', name: 'contractor', label: 'Contractor' },
          { type: 'image', name: 'image', label: 'Hero / cover image', description: 'Upload via Cloudinary' },
          {
            type: 'object',
            name: 'gallery',
            label: 'Gallery',
            list: true,
            description: 'Project gallery images (upload via Cloudinary)',
            ui: {
              itemProps: (item) => {
                const src: string = item?.src ?? '';
                const thumb = src.includes('/upload/')
                  ? src.replace('/upload/', '/upload/w_80,h_80,c_fill,q_auto,f_auto/')
                  : src;
                const filename = src.split('/').pop()?.split('?')[0] ?? '';
                const label = item?.alt || filename || 'Gallery image';
                return {
                  label,
                  ...(thumb && {
                    style: {
                      backgroundImage: `url("${thumb}")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'auto 28px',
                      backgroundPosition: 'right 64px center',
                      paddingRight: '104px',
                    },
                  }),
                } as any;
              },
            },
            fields: [
              { type: 'image', name: 'src', label: 'Image' },
              { type: 'string', name: 'alt', label: 'Alt text' },
              { type: 'string', name: 'href', label: 'Link URL', description: 'Optional. Link this image to another page (e.g. a portfolio item).' },
              { type: 'string', name: 'ctaText', label: 'Link button label', description: 'Optional. Defaults to "View project".' },
            ],
          },
          {
            type: 'object',
            name: 'quotes',
            label: 'Customer Quotes',
            list: true,
            description: 'Add, remove, or reorder customer quotes. Toggle "Promote to home page" to feature a quote on the homepage.',
            ui: {
              itemProps: (item) => ({ label: item?.author || item?.quote?.slice(0, 40) || 'New quote' }),
            },
            fields: [
              { type: 'string', name: 'quote', label: 'Quote', required: true, ui: { component: 'textarea' } },
              { type: 'string', name: 'author', label: 'Author' },
              { type: 'string', name: 'role', label: 'Role / Company' },
              { type: 'boolean', name: 'featured', label: 'Promote to home page' },
            ],
          },
          {
            type: 'string',
            name: 'sectors',
            label: 'Sectors',
            list: true,
            ui: { component: TagCheckboxGroup as any },
            description: 'Check all portfolio sectors that apply. Sectors power the portfolio navigation and have their own landing pages.',
          },
          {
            type: 'string',
            name: 'services',
            label: 'Services',
            list: true,
            ui: { component: TagCheckboxGroup as any },
            description: 'Check all services performed on this project. Create new tags in the Tags collection and they appear here immediately.',
          },
          { type: 'number', name: 'order', label: 'Order' },
          { type: 'boolean', name: 'featured', label: 'Featured' },
          {
            type: 'object',
            name: 'videos',
            label: 'Videos',
            list: true,
            description: 'Add, remove, or reorder videos shown as a card + lightbox player on this project.',
            ui: {
              itemProps: (item) => ({ label: item?.title || item?.youtube || 'New video' }),
            },
            fields: [
              { type: 'string', name: 'title', label: 'Title' },
              { type: 'string', name: 'youtube', label: 'YouTube Video URL', required: true, description: 'Paste a full YouTube link (or a bare 11-character video ID).' },
              { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
              { type: 'image', name: 'thumbnail', label: 'Thumbnail Override', description: 'Optional. Upload via Cloudinary to override the auto YouTube thumbnail.' },
              { type: 'boolean', name: 'featured', label: 'Promote to home page' },
            ],
          },
          contentCardsField,
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
        defaultItem: () => ({ order: 0 }),
        ui: {
          // Open the project page in the visual editor.
          router: ({ document }) => `/portfolio/${document._sys.filename}`,
        },
      },
      {
        name: 'tags',
        label: 'Tags',
        path: 'src/content/tags',
        format: 'md',
        fields: [
          { type: 'string', name: 'label', label: 'Label', required: true, description: 'Display name for this tag (e.g. Retail).' },
          { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
          { type: 'image', name: 'image', label: 'Image', description: 'Upload via Cloudinary. Used on the tag landing page and cards.' },
          { type: 'reference', name: 'parent', label: 'Parent Tag', collections: ['tags'], description: 'Optional. The parent tag in the hierarchy. Root tags (e.g. Sectors, Services) have no parent; supports unlimited nesting.' },
          { type: 'number', name: 'order', label: 'Order', description: 'Sort order among sibling tags in navigation and listings.' },
          {
            type: 'object',
            name: 'videos',
            label: 'Videos',
            list: true,
            description: 'Add, remove, or reorder videos shown as a card + lightbox player on this tag landing page.',
            ui: {
              itemProps: (item) => ({ label: item?.title || item?.youtube || 'New video' }),
            },
            fields: [
              { type: 'string', name: 'title', label: 'Title' },
              { type: 'string', name: 'youtube', label: 'YouTube Video URL', required: true, description: 'Paste a full YouTube link (or a bare 11-character video ID).' },
              { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
              { type: 'image', name: 'thumbnail', label: 'Thumbnail Override', description: 'Optional. Upload via Cloudinary to override the auto YouTube thumbnail.' },
              { type: 'boolean', name: 'featured', label: 'Promote to home page' },
            ],
          },
          contentCardsField,
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
        ui: {
          filename: {
            slugify: (values) => (values?.label ? String(values.label).toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '') : ''),
          },
          // Tags render under either /portfolio/<slug> or /services/<slug>
          // depending on their root ancestor. That can't be derived from the
          // document alone, so use the precomputed tagRoutes map. Returns
          // undefined for unmapped tags (falls back to the full-page editor).
          router: ({ document }) => tagRoutes[document._sys.filename],
        },
      },
      {
        name: 'about',
        label: 'About Us',
        path: 'src/content/about',
        match: { include: 'index' },
        format: 'md',
        ui: { allowedActions: { create: false, delete: false }, router: () => '/about' },
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true },
          { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' }, description: 'Shown under the title in the page header.' },
          { type: 'image', name: 'featuredImage', label: 'Featured Image', description: 'Header banner image. Upload via Cloudinary.' },
          {
            type: 'object',
            name: 'videos',
            label: 'Videos',
            list: true,
            description: 'Add, remove, or reorder videos shown as a card + lightbox player on this page.',
            ui: {
              itemProps: (item) => ({ label: item?.title || item?.youtube || 'New video' }),
            },
            fields: [
              { type: 'string', name: 'title', label: 'Title' },
              { type: 'string', name: 'youtube', label: 'YouTube Video URL', required: true, description: 'Paste a full YouTube link (or a bare 11-character video ID).' },
              { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
              { type: 'image', name: 'thumbnail', label: 'Thumbnail Override', description: 'Optional. Upload via Cloudinary to override the auto YouTube thumbnail.' },
              { type: 'boolean', name: 'featured', label: 'Promote to home page' },
            ],
          },
          contentCardsField,
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
      {
        name: 'contact',
        label: 'Contact',
        path: 'src/content/contact',
        match: { include: 'contact' },
        format: 'md',
        ui: { allowedActions: { create: false, delete: false }, router: () => '/contact' },
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true },
          { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
          { type: 'image', name: 'featuredImage', label: 'Featured Image', description: 'Upload via Cloudinary (used as hero background if hero background is not set)' },
          { type: 'rich-text', name: 'contactInfo', label: 'Contact Info (footer)', description: 'Rendered in the site footer contact block and the aside card on the Contact page.' },
          {
            type: 'object',
            name: 'videos',
            label: 'Videos',
            list: true,
            description: 'Add, remove, or reorder videos shown as a card + lightbox player on this page.',
            ui: {
              itemProps: (item) => ({ label: item?.title || item?.youtube || 'New video' }),
            },
            fields: [
              { type: 'string', name: 'title', label: 'Title' },
              { type: 'string', name: 'youtube', label: 'YouTube Video URL', required: true, description: 'Paste a full YouTube link (or a bare 11-character video ID).' },
              { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
              { type: 'image', name: 'thumbnail', label: 'Thumbnail Override', description: 'Optional. Upload via Cloudinary to override the auto YouTube thumbnail.' },
              { type: 'boolean', name: 'featured', label: 'Promote to home page' },
            ],
          },
          contentCardsField,
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
      {
        name: 'pages',
        label: 'Pages',
        path: 'src/content/pages',
        format: 'md',
        // Generic content pages that render at the site root (e.g. /privacy-policy)
        // via the dynamic src/pages/[slug].astro route. Create/delete stay enabled
        // so the collection shows its document list (Tina auto-opens single-document
        // collections that disable both actions) and editors can add new pages.
        ui: { router: ({ document }) => `/${document._sys.filename}` },
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true },
          { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
          { type: 'image', name: 'featuredImage', label: 'Featured Image', description: 'Upload via Cloudinary (used as the page header background).' },
          {
            type: 'object',
            name: 'videos',
            label: 'Videos',
            list: true,
            description: 'Add, remove, or reorder videos shown as a card + lightbox player on this page.',
            ui: {
              itemProps: (item) => ({ label: item?.title || item?.youtube || 'New video' }),
            },
            fields: [
              { type: 'string', name: 'title', label: 'Title' },
              { type: 'string', name: 'youtube', label: 'YouTube Video URL', required: true, description: 'Paste a full YouTube link (or a bare 11-character video ID).' },
              { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
              { type: 'image', name: 'thumbnail', label: 'Thumbnail Override', description: 'Optional. Upload via Cloudinary to override the auto YouTube thumbnail.' },
              { type: 'boolean', name: 'featured', label: 'Promote to home page' },
            ],
          },
          contentCardsField,
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
      {
        name: 'staff',
        label: 'Staff',
        path: 'src/content/staff',
        match: { include: 'index' },
        format: 'json',
        // Staff is rendered on the About page. No `router` here on purpose:
        // clicking "Staff" opens the normal document form (so you can add /
        // remove / reorder people via the list's controls). Inline preview &
        // click-to-edit still works on the About page via the staff island.
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: 'object',
            name: 'staff',
            label: 'Staff',
            list: true,
            description: 'Add, remove, or reorder personnel. Profile photo is optional.',
            ui: {
              itemProps: (item) => ({ label: item?.name || 'New person' }),
            },
            fields: [
              { type: 'string', name: 'name', label: 'Name', required: true },
              { type: 'string', name: 'title', label: 'Title', required: true },
              { type: 'string', name: 'bio', label: 'Bio', ui: { component: 'textarea' } },
              { type: 'image', name: 'image', label: 'Profile Photo', description: 'Upload via Cloudinary' },
              { type: 'string', name: 'note', label: 'Note', description: 'Optional short note shown under the title (e.g. "In Memoriam - September 16, 1957 – October 4, 2024", credentials, etc.).' },
            ],
          },
        ],
      },
      {
        name: 'site',
        label: 'Site Settings',
        path: 'src/content/site',
        match: { include: 'index' },
        format: 'json',
        // Site settings (portfolio title) surface on the Portfolio index page.
        // No `router`: clicking "Site Settings" opens the normal document form
        // rather than redirecting into the Portfolio visual editor. The values
        // still preview/click-to-edit on the Portfolio index via the site island.
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'footerDescription', label: 'Footer Description', ui: { component: 'textarea' }, description: 'Short blurb shown under the logo in the footer.' },
        ],
      },
      {
        name: 'home',
        label: 'Home',
        path: 'src/content/home',
        match: { include: 'index' },
        format: 'json',
        ui: { allowedActions: { create: false, delete: false }, router: () => '/' },
        fields: [
          { type: 'string', name: 'title', label: 'Page Title', description: 'Browser & SEO title for the homepage.' },
          { type: 'number', name: 'maxProjects', label: 'Max Latest Projects', description: 'How many projects to show in the "Latest projects" section. Defaults to 3.' },
          { type: 'number', name: 'maxTestimonials', label: 'Max Testimonials', description: 'How many featured testimonials to show on the homepage. Defaults to 8.' },
          { type: 'number', name: 'maxVideos', label: 'Max Videos', description: 'How many featured videos to show on the homepage. Defaults to 8.' },
          { type: 'object', name: 'hero', label: 'Hero', fields: [
            { type: 'string', name: 'size', label: 'Size', options: ['full', 'compact'], ui: { component: 'select' } },
            { type: 'string', name: 'eyebrow', label: 'Eyebrow' },
            { type: 'string', name: 'tagline', label: 'Tagline' },
            { type: 'string', name: 'subtitle', label: 'Subtitle', ui: { component: 'textarea' } },
            { type: 'string', name: 'ctaPrimaryText', label: 'Primary CTA Text' },
            { type: 'string', name: 'ctaPrimaryHref', label: 'Primary CTA Link' },
            { type: 'string', name: 'ctaSecondaryText', label: 'Secondary CTA Text' },
            { type: 'string', name: 'ctaSecondaryHref', label: 'Secondary CTA Link' },
            { type: 'image', name: 'backgroundImage', label: 'Background Image' },
            { type: 'number', name: 'overlayOpacity', label: 'Overlay Opacity (0-100)' },
            { type: 'string', name: 'overlayColor', label: 'Overlay Color', options: ['dark', 'light'], ui: { component: 'select' } },
          ]},
          contentCardsField,
        ],
      },
    ],
  },
    search: {
      tina: {
        indexerToken: process.env.TINA_INDEXER_TOKEN,
        stopwordLanguages: ['eng'],
      },
      indexBatchSize: 100,
      maxSearchIndexFieldLength: 100,
    },
});
