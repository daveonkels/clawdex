import fs from 'node:fs';
import path from 'node:path';

const DIST_DIR = path.join(process.cwd(), 'dist');
const SITEMAP_INDEX = path.join(DIST_DIR, 'sitemap-index.xml');
const SITE_ROOT = 'https://shelldex.com/';

const NON_HTML_PREFIXES = ['/api/', '/md/'];
const EXCLUDED_HTML_PATHS = ['/badges/', '/submit/'];

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

function toDistPath(url) {
  const { pathname } = new URL(url);
  const relative = decodeURIComponent(pathname.replace(/^\/+/, ''));

  if (!relative) return path.join(DIST_DIR, 'index.html');
  if (pathname.endsWith('/')) return path.join(DIST_DIR, relative, 'index.html');
  return path.join(DIST_DIR, relative);
}

function extractCanonical(html) {
  return html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] ?? null;
}

function extractRobots(html) {
  return html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] ?? null;
}

if (!fs.existsSync(SITEMAP_INDEX)) {
  fail('dist/sitemap-index.xml is missing. Run `npx astro build` first.');
}

const sitemapFiles = extractLocs(readFile(SITEMAP_INDEX)).map(toDistPath);
const pageUrls = sitemapFiles.flatMap((filePath) => {
  if (!fs.existsSync(filePath)) fail(`Sitemap file does not exist in dist: ${filePath}`);
  return extractLocs(readFile(filePath));
});

const failures = [];
let compareCount = 0;

for (const url of pageUrls) {
  const { pathname } = new URL(url);
  const htmlPath = toDistPath(url);

  for (const prefix of NON_HTML_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      failures.push(`Sitemap contains machine-readable mirror ${url}`);
    }
  }

  for (const excludedPath of EXCLUDED_HTML_PATHS) {
    if (pathname === excludedPath) {
      failures.push(`Sitemap contains intentionally excluded page ${url}`);
    }
  }

  if (!fs.existsSync(htmlPath)) {
    failures.push(`Sitemap entry does not exist in dist: ${url}`);
    continue;
  }

  const html = readFile(htmlPath);
  const robots = extractRobots(html);
  const canonical = extractCanonical(html);

  if (robots?.toLowerCase().includes('noindex')) {
    failures.push(`Sitemap entry is marked noindex: ${url}`);
  }

  if (!canonical) {
    failures.push(`Sitemap entry is missing a canonical tag: ${url}`);
  } else if (canonical !== url) {
    failures.push(`Sitemap canonical mismatch: ${url} -> ${canonical}`);
  }

  if (pathname.startsWith('/compare/') && pathname !== '/compare/') {
    compareCount++;
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL: ${failure}`);
  }
  process.exit(1);
}

console.log(`PASS: ${pageUrls.length} sitemap URLs verified; ${compareCount} compare pages are indexable and self-canonical.`);
