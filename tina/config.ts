import { defineConfig } from 'tinacms';
import { CATEGORIES } from '../src/data/categories';

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
            type: 'string',
            name: 'category',
            label: 'Category',
            description: 'One category per project (used for category nav)',
            options: CATEGORIES.map((c) => ({ value: c.label, label: c.label })),
            ui: { component: 'select' },
          },
          { type: 'string', name: 'tags', label: 'Tags', list: true },
          { type: 'number', name: 'order', label: 'Order' },
          { type: 'boolean', name: 'featured', label: 'Featured' },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
        defaultItem: () => ({ order: 0 }),
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
});
