import { defineConfig } from 'tinacms';
// Options are precomputed into a static module by scripts/generate-tag-options.mjs
// (run before dev/build). This must NOT read the filesystem here: tina/config.ts
// is also evaluated in the browser for the admin UI, where fs is unavailable.
import { tagOptions } from './tag-options';

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

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
            fields: [
              { type: 'image', name: 'src', label: 'Image' },
              { type: 'string', name: 'alt', label: 'Alt text' },
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
            options: tagOptions.sectors,
            description: 'Check all portfolio sectors that apply. Sectors power the portfolio navigation and have their own landing pages.',
          },
          {
            type: 'string',
            name: 'services',
            label: 'Services',
            list: true,
            options: tagOptions.services,
            description: 'Check all services performed on this project. To add a new tag, create it in the Tags collection; it will appear here after the next build.',
          },
          { type: 'number', name: 'order', label: 'Order' },
          { type: 'boolean', name: 'featured', label: 'Featured' },
          { type: 'string', name: 'youtube', label: 'YouTube Video URL', description: 'Optional. Paste a full YouTube link to embed a player at the bottom of the page.' },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
        defaultItem: () => ({ order: 0 }),
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
          {
            type: 'object',
            name: 'hero',
            label: 'Hero',
            description: 'Optional hero block for the tag landing page. Defaults use the label and image.',
            fields: [
              { type: 'string', name: 'size', label: 'Size', options: ['full', 'compact'], ui: { component: 'select' } },
              { type: 'string', name: 'eyebrow', label: 'Eyebrow' },
              { type: 'string', name: 'tagline', label: 'Tagline' },
              { type: 'string', name: 'subtitle', label: 'Subtitle', ui: { component: 'textarea' } },
              { type: 'string', name: 'ctaPrimaryText', label: 'Primary CTA Text' },
              { type: 'string', name: 'ctaPrimaryHref', label: 'Primary CTA Link' },
              { type: 'string', name: 'ctaSecondaryText', label: 'Secondary CTA Text' },
              { type: 'string', name: 'ctaSecondaryHref', label: 'Secondary CTA Link' },
              { type: 'image', name: 'backgroundImage', label: 'Background Image', description: 'Upload via Cloudinary' },
              { type: 'number', name: 'overlayOpacity', label: 'Overlay Opacity (0-100)' },
              { type: 'string', name: 'overlayColor', label: 'Overlay Color', options: ['dark', 'light'], ui: { component: 'select' } },
            ],
          },
          { type: 'reference', name: 'parent', label: 'Parent Tag', collections: ['tags'], description: 'Optional. The parent tag in the hierarchy. Root tags (e.g. Sectors, Services) have no parent; supports unlimited nesting.' },
          { type: 'number', name: 'order', label: 'Order', description: 'Sort order among sibling tags in navigation and listings.' },
          { type: 'boolean', name: 'showInNav', label: 'Show in portfolio navigation', description: 'Deprecated: navigation is derived from the sectors tag tree.' },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
        ui: {
          filename: {
            slugify: (values) => (values?.label ? String(values.label).toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '') : ''),
          },
        },
      },
      {
        name: 'about',
        label: 'About Us',
        path: 'src/content/about',
        match: { include: 'index' },
        format: 'md',
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true },
          { type: 'image', name: 'featuredImage', label: 'Featured Image', description: 'Upload via Cloudinary (used as hero background if hero background is not set)' },
          {
            type: 'object',
            name: 'hero',
            label: 'Hero',
            description: 'Same hero block as the homepage. Optional; defaults use title and featured image.',
            fields: [
              { type: 'string', name: 'size', label: 'Size', options: ['full', 'compact'], ui: { component: 'select' } },
              { type: 'string', name: 'eyebrow', label: 'Eyebrow' },
              { type: 'string', name: 'tagline', label: 'Tagline' },
              { type: 'string', name: 'subtitle', label: 'Subtitle', ui: { component: 'textarea' } },
              { type: 'string', name: 'ctaPrimaryText', label: 'Primary CTA Text' },
              { type: 'string', name: 'ctaPrimaryHref', label: 'Primary CTA Link' },
              { type: 'string', name: 'ctaSecondaryText', label: 'Secondary CTA Text' },
              { type: 'string', name: 'ctaSecondaryHref', label: 'Secondary CTA Link' },
              { type: 'image', name: 'backgroundImage', label: 'Background Image', description: 'Upload via Cloudinary' },
              { type: 'number', name: 'overlayOpacity', label: 'Overlay Opacity (0-100)' },
              { type: 'string', name: 'overlayColor', label: 'Overlay Color', options: ['dark', 'light'], ui: { component: 'select' } },
            ],
          },
          { type: 'string', name: 'youtube', label: 'YouTube Video URL', description: 'Optional. Paste a full YouTube link to embed a player at the bottom of the page.' },
          { type: 'string', name: 'body', label: 'Body', ui: { component: 'textarea' }, isBody: true },
        ],
      },
      {
        name: 'pages',
        label: 'Pages',
        path: 'src/content/pages',
        format: 'md',
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true },
          { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
          { type: 'image', name: 'featuredImage', label: 'Featured Image', description: 'Upload via Cloudinary (used as hero background if hero background is not set)' },
          {
            type: 'object',
            name: 'hero',
            label: 'Hero',
            description: 'Optional hero block. Defaults use the page title and featured image.',
            fields: [
              { type: 'string', name: 'size', label: 'Size', options: ['full', 'compact'], ui: { component: 'select' } },
              { type: 'string', name: 'eyebrow', label: 'Eyebrow' },
              { type: 'string', name: 'tagline', label: 'Tagline' },
              { type: 'string', name: 'subtitle', label: 'Subtitle', ui: { component: 'textarea' } },
              { type: 'string', name: 'ctaPrimaryText', label: 'Primary CTA Text' },
              { type: 'string', name: 'ctaPrimaryHref', label: 'Primary CTA Link' },
              { type: 'string', name: 'ctaSecondaryText', label: 'Secondary CTA Text' },
              { type: 'string', name: 'ctaSecondaryHref', label: 'Secondary CTA Link' },
              { type: 'image', name: 'backgroundImage', label: 'Background Image', description: 'Upload via Cloudinary' },
              { type: 'number', name: 'overlayOpacity', label: 'Overlay Opacity (0-100)' },
              { type: 'string', name: 'overlayColor', label: 'Overlay Color', options: ['dark', 'light'], ui: { component: 'select' } },
            ],
          },
          { type: 'string', name: 'youtube', label: 'YouTube Video URL', description: 'Optional. Paste a full YouTube link to embed a player at the bottom of the page.' },
          { type: 'string', name: 'body', label: 'Body', ui: { component: 'textarea' }, isBody: true },
        ],
      },
      {
        name: 'staff',
        label: 'Staff',
        path: 'src/content/staff',
        match: { include: 'index' },
        format: 'json',
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
              { type: 'string', name: 'inMemoriam', label: 'In Memoriam', description: 'e.g. September 16, 1957 – October 4, 2024' },
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
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'portfolioTitle', label: 'Portfolio Page Title', description: 'Browser & SEO title for the Portfolio index page.' },
          { type: 'string', name: 'tagsTitle', label: 'Tags Page Title', description: 'Browser & SEO title for the Tags index page.' },
        ],
      },
      {
        name: 'home',
        label: 'Home',
        path: 'src/content/home',
        match: { include: 'index' },
        format: 'json',
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'title', label: 'Page Title', description: 'Browser & SEO title for the homepage.' },
          { type: 'string', name: 'youtube', label: 'YouTube Video URL', description: 'Optional. Paste a full YouTube link to embed a player at the bottom of the page.' },
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
          { type: 'object', name: 'about', label: 'About', fields: [
            { type: 'string', name: 'heading', label: 'Heading' },
            { type: 'string', name: 'body', label: 'Body', ui: { component: 'textarea' } },
          ]},
          { type: 'object', name: 'contactCta', label: 'Contact CTA', fields: [
            { type: 'string', name: 'heading', label: 'Heading' },
            { type: 'string', name: 'subtext', label: 'Subtext', ui: { component: 'textarea' } },
          ]},
        ],
      },
    ],
  },
  search: {
    tina: {
      indexerToken: process.env.TINA_TOKEN,
      stopwordLanguages: ['eng'],
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100,
  },
});
