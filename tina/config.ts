import { defineConfig } from 'tinacms';

export default defineConfig({
  build: {
    publicFolder: 'public',
    outputFolder: 'admin',
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
          { type: 'image', name: 'image', label: 'Image' },
          { type: 'string', name: 'category', label: 'Category' },
          { type: 'string', name: 'tags', label: 'Tags', list: true },
          { type: 'number', name: 'order', label: 'Order', required: true },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
        defaultItem: () => ({ order: 0 }),
      },
      {
        name: 'home',
        label: 'Home',
        path: 'src/content/home',
        match: { include: 'index' },
        format: 'json',
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'object', name: 'hero', label: 'Hero', fields: [
            { type: 'string', name: 'tagline', label: 'Tagline' },
            { type: 'string', name: 'subtitle', label: 'Subtitle', ui: { component: 'textarea' } },
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
  media: {
    loadCustomStore: async () => {
      const pack = await import('next-tinacms-cloudinary');
      return pack.TinaCloudCloudinaryMediaStore;
    },
  },
});
