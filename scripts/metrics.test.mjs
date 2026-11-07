import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import yaml from 'js-yaml';
import { calculateStarGrowth7d, buildLeaderboard } from '../src/lib/metrics.js';
import { loadProjects, loadProjectFiles } from '../src/lib/project-loader.js';
import { dailyStarActivity, recentStarActivity } from '../src/lib/star-activity.js';
import legacyRedirect from '../redirect/worker.js';

test('legacy domains permanently redirect all paths and preserve encoded queries', async () => {
  for (const protocol of ['http', 'https']) {
    for (const host of ['theclawdex.com', 'www.theclawdex.com']) {
      for (const path of ['/', '/projects/hermes/', '/faq/', '/api/projects.json', '/images/og-default.jpg', '/missing-page', '/a%20b?q=hello%20world&ref=old']) {
        const response = legacyRedirect.fetch(new Request(`${protocol}://${host}${path}`));
        assert.equal(response.status, 301);
        assert.equal(response.headers.get('Location'), `https://shelldex.com${path}`);
      }
    }
  }
  assert.equal(legacyRedirect.fetch(new Request('https://shelldex.com/')).status, 404);
});

const now = '2026-11-01T15:00:00Z';
const root = process.cwd();

test('weekly growth requires an actual seven-day baseline', () => {
  assert.equal(calculateStarGrowth7d([], 100, now), null);
  assert.equal(calculateStarGrowth7d([{ date: '2026-11-01', stars: 100 }], 100, now), null);
  assert.equal(calculateStarGrowth7d([{ date: '2026-05-23', stars: 20 }], 100, now), null);
  assert.equal(calculateStarGrowth7d([{ date: '2026-10-24', stars: 80 }], 100, now), null);
  assert.equal(calculateStarGrowth7d([{ date: '2026-10-25', stars: 80 }], 100, now), 20);
  assert.equal(calculateStarGrowth7d([{ date: '2026-10-25', stars: 105 }], 100, now), -5);
});

test('daily star charts use GitHub dates and preserve zeroes, missing days and observed net growth', () => {
  const sunday = Date.parse('2026-10-25') / 1000;
  const week = { week: sunday, total: 13, days: [0, 3, 0, 1, 5, 0, 4] };
  const later = { week: sunday + 14 * 86400, total: 11, days: [2, 0, 9, 0, 0, 0, 0] };
  const cutoff = '2026-11-10T12:00:00Z';
  const daily = dailyStarActivity([later, week], cutoff, '2026-10-27');
  assert.equal(daily['2026-10-25'], undefined); // predates the repository
  assert.equal(daily['2026-10-27'], 0);
  assert.equal(daily['2026-11-03'], undefined); // week absent from the response
  assert.equal(daily['2026-11-10'], undefined); // partial day
  assert.deepEqual(recentStarActivity(daily, cutoff, 7), [
    {date: '2026-11-08', stars: 2}, {date: '2026-11-09', stars: 0}
  ]);
  assert.throws(() => dailyStarActivity([week, week], cutoff), /Overlapping/);
  assert.throws(() => dailyStarActivity([{ ...week, total: 12 }], cutoff), /Invalid/);
  assert.throws(() => dailyStarActivity(undefined, cutoff), /Missing/);
});

test('directory and leaderboard share saved counts without network or cache writes', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Build attempted network access'); };
  try {
    const projects = await loadProjects();
    const leaderboard = buildLeaderboard(loadProjectFiles());
    assert.equal(leaderboard.count, projects.filter(p => p.github).length);
    for (const project of projects) {
      assert.equal(project.stars, project.github_data.stars);
      assert.equal(leaderboard.entries.find(e => e.slug === project.slug).stars, project.stars);
    }
    assert.deepEqual(leaderboard, buildLeaderboard(loadProjectFiles()));
    assert.equal(leaderboard.generated, projects.map(p => p.github_data.last_checked ?? p.github_data.last_enriched).sort()[0]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('refresh rejects incomplete snapshots without changing any existing files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shelldex-enrich-test-'));
  try {
    fs.mkdirSync(path.join(dir, 'src/data/projects'), { recursive: true });
    const a = { name: 'A', slug: 'a', github: 'test/a' };
    const b = { name: 'B', slug: 'b', github: 'test/b' };
    for (const project of [a, b]) fs.writeFileSync(path.join(dir, `src/data/projects/${project.slug}.yml`), yaml.dump(project));
    const original = fs.readFileSync(path.join(dir, 'src/data/projects/a.yml'), 'utf8');
    const snapshot = {
      collected_at: new Date().toISOString(),
      repositories: { 'test/a': { repo: { id: 123, stargazers_count: 100, forks_count: 2, open_issues_count: 1, pushed_at: now }, release: null, star_weeks: [{ week: 1792886400, total: 7, days: [0,1,2,1,1,0,2] }] } },
    };
    fs.writeFileSync(path.join(dir, 'snapshot.json'), JSON.stringify(snapshot));
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/enrich-github-data.ts'), '--snapshot', path.join(dir, 'snapshot.json')], { cwd: dir, encoding: 'utf8' });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /missing repository metrics for test\/b/);
    assert.equal(fs.readFileSync(path.join(dir, 'src/data/projects/a.yml'), 'utf8'), original);
    assert.equal(fs.existsSync(path.join(dir, 'src/data/star-history.json')), false);
    assert.equal(fs.existsSync(path.join(dir, 'src/data/generated/leaderboard.json')), false);
    snapshot.repositories['test/b'] = snapshot.repositories['test/a'];
    fs.writeFileSync(path.join(dir, 'snapshot.json'), JSON.stringify(snapshot));
    const success = spawnSync(process.execPath, [path.join(root, 'scripts/enrich-github-data.ts'), '--snapshot', path.join(dir, 'snapshot.json')], { cwd: dir, encoding: 'utf8' });
    assert.equal(success.status, 0, success.stderr);
    const leaderboard = JSON.parse(fs.readFileSync(path.join(dir, 'src/data/generated/leaderboard.json'), 'utf8'));
    assert.equal(leaderboard.count, 2);
    assert.equal(leaderboard.entries[0].star_growth_7d, null);
    // A confirmed unavailable repository keeps its historical metrics and date.
    snapshot.repositories['test/b'] = { repo: null, release: null, repo_status: 404 };
    snapshot.collected_at = new Date(Date.now() + 1000).toISOString();
    fs.writeFileSync(path.join(dir, 'snapshot.json'), JSON.stringify(snapshot));
    const unavailable = spawnSync(process.execPath, [path.join(root, 'scripts/enrich-github-data.ts'), '--snapshot', path.join(dir, 'snapshot.json')], { cwd: dir, encoding: 'utf8' });
    assert.equal(unavailable.status, 0, unavailable.stderr);
    const retained = yaml.load(fs.readFileSync(path.join(dir, 'src/data/projects/b.yml'), 'utf8')).github_data;
    assert.equal(retained.stars, 100);
    assert.equal(retained.availability, 'unavailable');
    assert.notEqual(retained.last_enriched, retained.last_checked);
    // Reused repository URLs must not silently replace the original project's data.
    snapshot.repositories['test/a'].repo.id = 999;
    fs.writeFileSync(path.join(dir, 'snapshot.json'), JSON.stringify(snapshot));
    const identityFailure = spawnSync(process.execPath, [path.join(root, 'scripts/enrich-github-data.ts'), '--snapshot', path.join(dir, 'snapshot.json')], { cwd: dir, encoding: 'utf8' });
    assert.equal(identityFailure.status, 1, identityFailure.stderr);
    assert.match(identityFailure.stderr, /Repository identity changed/);
    assert.equal(yaml.load(fs.readFileSync(path.join(dir, 'src/data/projects/a.yml'), 'utf8')).github_data.repository_id, 123);
    snapshot.repositories['test/a'].repo.id = 123;
    fs.writeFileSync(path.join(dir, 'snapshot.json'), JSON.stringify(snapshot));
    // Same-day repeated refresh must not manufacture a weekly baseline.
    const repeated = spawnSync(process.execPath, [path.join(root, 'scripts/enrich-github-data.ts'), '--snapshot', path.join(dir, 'snapshot.json')], { cwd: dir, encoding: 'utf8' });
    assert.equal(repeated.status, 0, repeated.stderr);
    assert.equal(yaml.load(fs.readFileSync(path.join(dir, 'src/data/projects/a.yml'), 'utf8')).github_data.star_growth_7d, null);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});


test('Markdown negotiation preserves browser HTML and falls back for unknown mirrors', async () => {
  const { default: worker, markdownPath, prefersMarkdown } = await import('../src/worker.js');
  assert.equal(markdownPath('/projects/hermes/'), '/md/projects/hermes.md');
  assert.equal(markdownPath('/api/projects.json'), null);
  assert.equal(prefersMarkdown('text/markdown;q=0,text/html'), false);
  assert.equal(prefersMarkdown('text/markdown;q=0.5,text/html'), false);
  assert.equal(prefersMarkdown('text/markdown'), true);
  const paths = [];
  const env = { ASSETS: { fetch: async (request) => {
    const pathname = new URL(request.url).pathname;
    paths.push(pathname);
    return new Response(pathname, { status: pathname.includes('missing.md') ? 404 : 200 });
  } } };
  const markdown = await worker.fetch(new Request('https://shelldex.com/projects/hermes/', { headers: { Accept: 'text/markdown' } }), env);
  assert.equal(await markdown.text(), '/md/projects/hermes.md');
  const browser = await worker.fetch(new Request('https://shelldex.com/projects/hermes/', { headers: { Accept: 'text/html' } }), env);
  assert.equal(await browser.text(), '/projects/hermes/');
  await worker.fetch(new Request('https://shelldex.com/projects/missing/', { headers: { Accept: 'text/markdown' } }), env);
  assert.deepEqual(paths.slice(-2), ['/md/projects/missing.md', '/projects/missing/']);
});

test('legacy links keep identity, query parameters, formats, and valid destinations', async () => {
  const { catalogRedirect } = await import('../src/lib/catalog-redirects.js');
  const routes = {active:['openclaw','hermes','picoclaw'], aliases:{'hermes-agent':'hermes'}, pairs:['hermes-vs-openclaw'], alternatives:['hermes']};
  const redirect = path => catalogRedirect('https://shelldex.com' + path, routes);
  const target = p => redirect(p)?.location.replace('https://shelldex.com','');
  assert.equal(target('/projects/clawgo/?via=google'), '/projects/openclaw/?via=google');
  assert.equal(target('/md/compare/openclaw-vs-hermes-agent.md'), '/md/compare/hermes-vs-openclaw.md');
  assert.equal(target('/api/projects/hermes-agent.json'), '/api/projects/hermes.json');
  assert.equal(target('/compare/moltworker-vs-openclaw/'), '/projects/openclaw/');
  assert.equal(target('/compare/picoclaw-vs-hermes/'), '/compare/?a=picoclaw&b=hermes');
  assert.equal(redirect('/compare/?a=picoclaw&b=hermes'), null);
  assert.equal(redirect('/compare/hermes-vs-openclaw/'), null);
  assert.equal(redirect('/projects/not-an-agent/'), null);
});

test('historical projects keep their counts but cannot outrank an available agent', () => {
  const project = (slug, stars, status = 'active', availability = 'available') => ({
    slug, status, github: 'test/' + slug,
    github_data: { stars, open_issues: 1, availability, last_enriched: '2026-11-07T00:00:00Z' },
  });
  const { entries } = buildLeaderboard([project('retired', 800, 'archived'), project('gone', 100, 'active', 'unavailable'), project('b', 0), project('a', 0)]);
  assert.deepEqual(entries.map(e => [e.slug, e.rank]), [['a', 1], ['b', 2], ['retired', null], ['gone', null]]);
  assert.equal(entries[0].health.issues_stars_ratio, null);
});
