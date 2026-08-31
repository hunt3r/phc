import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://phandc.net',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        if (path === '/') {
          item.priority = 1.0;
        } else if (path === '/portfolio' || path === '/about') {
          item.priority = 0.9;
        } else if (path.startsWith('/portfolio/')) {
          item.priority = 0.8;
        } else if (path.startsWith('/category/') || path.startsWith('/tags/')) {
          item.priority = 0.6;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3456',
          changeOrigin: true,
        },
      },
    },
  },
});
