import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://shelldex.com',
  trailingSlash: 'always',
  integrations: [
    tailwind(),
    sitemap({
      priority: 0.7,
      serialize(item) {
        // Editorial pages get highest priority
        if (item.url.includes('/analysis') || item.url.includes('/faq') || item.url.includes('/best-alternatives')) {
          item.priority = 0.9;
        }
        // Project detail pages
        else if (item.url.includes('/projects/')) {
          item.priority = 0.8;
        }
        // Compare index
        else if (item.url === 'https://shelldex.com/compare/') {
          item.priority = 0.8;
        }
        // Individual comparison pages
        else if (item.url.includes('/compare/')) {
          item.priority = 0.6;
        }
        // Homepage and leaderboard
        else if (item.url === 'https://shelldex.com/' || item.url.includes('/leaderboard')) {
          item.priority = 1.0;
        }
        return item;
      },
    }),
  ],
  output: 'static',
});
