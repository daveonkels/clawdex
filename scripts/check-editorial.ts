import fs from 'node:fs';
import assert from 'node:assert/strict';
import { loadProjects } from '../src/lib/projects';
import { loadLeaderboard } from '../src/lib/compare';
import { buildEditorial } from '../src/lib/editorial';
import { agentFaq } from '../src/lib/agent-faq';
import { editionRows } from '../src/lib/spike-edition';
import { languageLabel } from '../src/lib/constants';

const projects = await loadProjects();
const { entries, generated } = loadLeaderboard();
const copy = buildEditorial(projects, entries, generated);
const decode = (s: string) => s.replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
const plain = (s: string) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g,' ').trim();
const faq = fs.readFileSync('dist/faq/index.html', 'utf8');
const schema = [...faq.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .map(m => JSON.parse(m[1])).find(s => s['@type'] === 'FAQPage');
assert(schema, 'FAQ structured data missing');
const answers = agentFaq(copy, projects.length).flatMap(section => section.items);
assert.equal(schema.mainEntity.length, answers.length);
for (const item of answers) {
  const details = faq.match(new RegExp('<details[^>]*id="' + item.id + '"[^>]*>([\\s\\S]*?)</details>'));
  assert(details, 'Missing FAQ question ' + item.id);
  assert(plain(details[1]).includes(item.q), 'Missing FAQ question text for ' + item.id);
  assert(plain(details[1]).includes(item.a), 'Visible FAQ answer drifted for ' + item.id);
  assert(schema.mainEntity.some((q: any) => q.name === item.q && q.acceptedAnswer.text === item.a), 'Schema drifted for ' + item.id);
}
for (const page of ['faq', 'analysis', 'best-alternatives']) {
  const html = fs.readFileSync('dist/' + page + '/index.html', 'utf8');
  assert(plain(html).includes(copy.snapshotNotice), page + ' is missing the current availability note');
  assert(html.includes('/methodology/'), page + ' is missing its methodology link');
  if (generated) assert(html.includes(new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(generated))), page + ' is missing its snapshot date');
  assert.doesNotMatch(html, /second-most-starred|currently the fastest-growing|Rust is the second most popular|real-time rankings|has daily commits/);
}
const analysis = fs.readFileSync('dist/analysis/index.html', 'utf8');
const languageChart = plain(analysis.match(/<section[^>]*id="languages"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '');
for (const language of new Set(projects.map(p => p.language))) {
  const count = projects.filter(p => p.language === language).length;
  assert(languageChart.includes((languageLabel[language] ?? language) + ' ' + count + ' ' + (count === 1 ? 'agent' : 'agents')), 'Language chart drifted: ' + language);
}
const week = plain(analysis.match(/<ol[^>]*class="totals"[^>]*>([\s\S]*?)<\/ol>/)?.[1] ?? '');
for (const row of editionRows(projects)) {
  assert(week.includes(row.name + ' ' + row.lastWeek.toLocaleString('en-US')), 'Weekly additions drifted for ' + row.name);
}
console.log('Editorial checks passed: all FAQ answers match their schema, availability and dates match current data, and chart rows match their sources.');
