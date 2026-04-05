import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { getIndexableCompareSlugSet } from './src/lib/compare-seo.js';
import { loadProjects } from './src/lib/project-loader.js';

const sitemapProjects = await loadProjects();
const indexableCompareSlugs = getIndexableCompareSlugSet(sitemapProjects);

export default defineConfig({
  site: 'https://shelldex.com',
  trailingSlash: 'always',
  integrations: [
    tailwind(),
    sitemap({
      filter(page) {
        const pathname = new URL(page).pathname;

        if (pathname === '/badges/' || pathname === '/submit/') {
          return false;
        }

        if (pathname.startsWith('/alternatives/')) {
          return false;
        }

        if (pathname.startsWith('/compare/')) {
          if (pathname === '/compare/') return true;
          const slug = pathname.split('/').filter(Boolean)[1];
          return indexableCompareSlugs.has(slug);
        }

        return true;
      },
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
          item.priority = 0.7;
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
