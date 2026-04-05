import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.join(process.cwd(), 'dist');
const SITEMAP_INDEX = path.join(DIST_DIR, 'sitemap-index.xml');
const SITE_ROOT = 'https://shelldex.com/';

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

function toDistHtmlPath(url) {
  const relative = url.replace(SITE_ROOT, '');
  return relative ? path.join(DIST_DIR, relative, 'index.html') : path.join(DIST_DIR, 'index.html');
}

if (!fs.existsSync(SITEMAP_INDEX)) {
  fail('dist/sitemap-index.xml is missing. Run `npx astro build` first.');
}

const sitemapFiles = extractLocs(readFile(SITEMAP_INDEX)).map((url) => path.join(DIST_DIR, url.replace(SITE_ROOT, '')));
const pageUrls = sitemapFiles.flatMap((filePath) => extractLocs(readFile(filePath)));
const compareUrls = pageUrls.filter((url) => url.includes('/compare/') && !url.endsWith('/compare/'));
const leaks = [];

for (const url of compareUrls) {
  const htmlPath = toDistHtmlPath(url);
  if (!fs.existsSync(htmlPath)) {
    fail(`Sitemap entry does not exist in dist: ${url}`);
  }

  const html = readFile(htmlPath);
  const robotsMatch = html.match(/<meta name="robots" content="([^"]+)"/i);
  const robots = robotsMatch?.[1] ?? null;

  if (robots?.includes('noindex')) {
    leaks.push(url);
  }
}

if (leaks.length > 0) {
  console.error('FAIL: sitemap contains compare pages marked noindex');
  for (const url of leaks) {
    console.error(` - ${url}`);
  }
  process.exit(1);
}

console.log(`PASS: ${compareUrls.length} compare URLs in sitemap, 0 noindex leaks.`);
