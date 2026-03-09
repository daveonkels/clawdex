import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { getIndexableCompareSlugSet } from './src/lib/compare-seo.js';

function loadProjectsForSitemap() {
  const projectDir = path.join(process.cwd(), 'src', 'data', 'projects');
  return fs.readdirSync(projectDir)
    .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
    .map((file) => yaml.load(fs.readFileSync(path.join(projectDir, file), 'utf-8')));
}

const sitemapProjects = loadProjectsForSitemap();
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
