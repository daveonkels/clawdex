const form = document.querySelector<HTMLFormElement>('#idea-filters')!;
const list = document.querySelector<HTMLElement>('#idea-list')!;
const search = form.querySelector<HTMLInputElement>('[name=q]')!;
const setup = form.querySelector<HTMLSelectElement>('[name=effort]')!;
const evidence = form.querySelector<HTMLSelectElement>('[name=evidence]')!;
const sort = form.querySelector<HTMLSelectElement>('[name=sort]')!;
const topics = Array.from(form.querySelectorAll<HTMLInputElement>('[name=topic]'));
const more = document.querySelector<HTMLButtonElement>('#more-ideas')!;
const reset = document.querySelector<HTMLButtonElement>('#reset-ideas')!;
const count = document.querySelector<HTMLElement>('#results-count')!;
const empty = document.querySelector<HTMLElement>('#empty-ideas')!;
const status = document.querySelector<HTMLElement>('#copy-status')!;
const batch = 12;
let visibleLimit = batch;

function normalize(text: string) {
  return text.toLocaleLowerCase('en').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/['’]/g, '');
}

const levels = ['Quick', 'Guided', 'Advanced'];
const cards = Array.from(list.querySelectorAll<HTMLDetailsElement>('.recipe'), element => ({
  element,
  title: element.querySelector('h3')!.textContent!,
  text: normalize(element.textContent ?? ''),
  topic: element.dataset.topic!,
  effort: element.dataset.effort!,
  evidence: element.dataset.evidence!.split(' '),
  order: Number(element.dataset.order),
  hnPoints: Number(element.dataset.hn ?? -1),
}));

function readFilters() {
  const params = new URLSearchParams(location.search);
  search.value = params.get('q') ?? '';
  for (const select of [setup, evidence, sort]) {
    const requested = params.get(select.name);
    select.value = Array.from(select.options).find(o => o.value === requested)?.value ?? '';
  }
  (topics.find(topic => topic.value === params.get('topic')) ?? topics[0]).checked = true;
}

function render(updateUrl = false, linkedId = '') {
  const topic = topics.find(input => input.checked)?.value ?? '';
  const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
  const matches = cards.filter(card =>
    (!topic || card.topic === topic) && (!setup.value || card.effort === setup.value)
    && (!evidence.value || card.evidence.includes(evidence.value)) && words.every(w => card.text.includes(w)));
  if (sort.value === 'az') matches.sort((a, b) => a.title.localeCompare(b.title, 'en'));
  if (sort.value === 'effort') matches.sort((a, b) => levels.indexOf(a.effort) - levels.indexOf(b.effort) || a.order - b.order);
  if (sort.value === 'hn') matches.sort((a, b) => b.hnPoints - a.hnPoints || a.order - b.order);
  list.dataset.sort = sort.value;
  document.getElementById('points-note')!.hidden = sort.value !== 'hn';

  if (linkedId) visibleLimit = Math.max(visibleLimit, matches.findIndex(card => card.element.id === linkedId) + 1);
  const shown = matches.slice(0, visibleLimit);
  const visible = new Set(shown.map(card => card.element));
  for (const { element } of cards) element.hidden = !visible.has(element);
  for (const card of shown) list.append(card.element);
  count.textContent = shown.length < matches.length
    ? `Showing ${shown.length} of ${matches.length} recipes`
    : `${matches.length} ${matches.length === 1 ? 'recipe' : 'recipes'}`;
  empty.hidden = !!matches.length;
  more.hidden = shown.length >= matches.length;
  more.textContent = 'Show ' + Math.min(batch, matches.length - shown.length) + ' more recipes';
  reset.hidden = !(search.value || topic || setup.value || evidence.value || sort.value);
  if (updateUrl) {
    const url = new URL(location.href);
    for (const [key, value] of Object.entries({ q: search.value.trim(), topic, effort: setup.value, evidence: evidence.value, sort: sort.value })) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    if (cards.some(card => '#' + card.element.id === url.hash)) url.hash = 'recipes';
    history.replaceState(null, '', url);
  }
  return shown;
}

function openLinkedRecipe() {
  const linked = cards.find(card => '#' + card.element.id === location.hash);
  if (!linked) { render(); return; }
  render(false, linked.element.id);
  // A shared recipe takes precedence over stale or incompatible filters.
  if (linked.element.hidden) {
    form.reset();
    const url = new URL(location.href);
    for (const key of ['q', 'topic', 'effort', 'evidence', 'sort']) url.searchParams.delete(key);
    history.replaceState(null, '', url);
    render(false, linked.element.id);
  }
  linked.element.open = true;
  requestAnimationFrame(() => linked.element.scrollIntoView({ block: 'start' }));
}

form.hidden = false;
readFilters();
openLinkedRecipe();
function applyFilters() { visibleLimit = batch; render(true); }
search.addEventListener('input', applyFilters);
form.addEventListener('change', event => { if (event.target !== search) applyFilters(); });
form.addEventListener('submit', event => { event.preventDefault(); applyFilters(); });
reset.addEventListener('click', () => { form.reset(); applyFilters(); search.focus(); });
more.addEventListener('click', () => {
  const start = visibleLimit;
  visibleLimit += batch;
  const added = render()[start]?.element.querySelector('summary');
  added?.focus({ preventScroll: true });
});
window.addEventListener('hashchange', openLinkedRecipe);
window.addEventListener('popstate', () => { readFilters(); visibleLimit = batch; openLinkedRecipe(); });
for (const card of cards) {
  const button = card.element.querySelector<HTMLButtonElement>('[data-copy-prompt]')!;
  button.hidden = !navigator.clipboard?.writeText;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(card.element.querySelector('blockquote')!.textContent!);
      status.textContent = 'Prompt copied for ' + card.title;
      button.textContent = 'Copied';
      window.setTimeout(() => { button.textContent = 'Copy prompt'; }, 1800);
    } catch {
      button.textContent = 'Select and copy the prompt above';
      status.textContent = 'Clipboard unavailable. Select and copy the prompt above.';
    }
  });
}
