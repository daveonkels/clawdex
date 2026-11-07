import building from '../data/ideas/building.json';
import community from '../data/ideas/community.json';
import research from '../data/ideas/research.json';
import studio from '../data/ideas/studio.json';

export const categories = ['Everyday', 'Work', 'Research', 'Creative', 'Building', 'Operations'];
export const efforts = ['Quick', 'Guided', 'Advanced'];
export const evidenceLabels: Record<string, string> = {
  field: 'Field report', demo: 'Public demo', guide: 'Published guide',
};

interface Recipe {
  id: string;
  title: string;
  score: number;
  category: string;
  task: string;
  inputs: string;
  prompt: string;
  check: string;
  source: string;
  sourceLabel: string;
  evidence: string;
  effort: string;
  recognition?: string;
  recognitionUrl?: string;
  signal?: { label: string; url: string; hnPoints?: number };
}

const recipes: Recipe[] = [...building, ...community, ...research, ...studio];
const ids = new Set<string>();

for (const recipe of recipes) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recipe.id) || ids.has(recipe.id)) throw new Error('Invalid or duplicate idea permalink: ' + recipe.id);
  ids.add(recipe.id);
  if (![4, 5].includes(recipe.score) || !categories.includes(recipe.category) || !efforts.includes(recipe.effort)
    || !Object.hasOwn(evidenceLabels, recipe.evidence)) throw new Error('Unreviewed or invalid idea: ' + recipe.title);
  if (![recipe.title, recipe.task, recipe.inputs, recipe.prompt, recipe.check, recipe.sourceLabel].every(value => value?.trim())
    || !recipe.source.startsWith('https://')) throw new Error('Incomplete recipe: ' + recipe.title);
}
// Within a rating, lead with a few contrasting jobs so the first shelf shows the range.
const firstShelf = new Map([
  ['compare-the-price-youd-actually-pay-for-a-car', 0],
  ['find-bird-calls-worth-listening-to-in-a-long-recording', 1],
  ['make-a-drawer-insert-that-fits-the-object-you-own', 2],
  ['turn-one-of-your-chess-losses-into-a-personal-lesson', 3],
]);
export const ideas = recipes.sort((a, b) => b.score - a.score
  || (firstShelf.get(a.id) ?? firstShelf.size) - (firstShelf.get(b.id) ?? firstShelf.size)
  || a.title.localeCompare(b.title, 'en'));
