import type { Project } from './projects';

type Setup = { devices?: string; localModel?: string; setup?: string; source?: string };

const setupBySlug: Record<string, Setup> = {
  'atomic-agent': { devices: 'macOS, Windows, Linux', setup: 'Desktop installer', localModel: 'llama.cpp' },
  hermes: { setup: 'Desktop installer', localModel: 'Ollama or the built-in local model service', source: 'https://hermes-agent.nousresearch.com/docs/guides/local-ollama-setup' },
  aionui: { devices: 'macOS, Windows, Linux', setup: 'Desktop installer', localModel: 'Ollama or LM Studio' },
  openclaw: { devices: 'macOS, Windows, Linux', setup: 'Command line', localModel: 'a supported local model provider' },
  edgeclaw: { setup: 'Command line', localModel: 'Ollama or vLLM for locally routed requests' },
  nanobot: { devices: 'macOS, Windows, Linux', setup: 'Command line', localModel: 'Ollama or vLLM' },
  zeroclaw: { devices: 'macOS, Windows, Linux', setup: 'Command line', localModel: 'Ollama' },
  nullclaw: { setup: 'Command line', localModel: 'Ollama' },
  astrbot: { setup: 'Docker', localModel: 'Ollama' },
  'cowork-os': { setup: 'Desktop installer', localModel: 'Ollama or LM Studio' },
  openhuman: { setup: 'Desktop installer', localModel: 'Ollama, LM Studio or MLX' },
  qwenpaw: { setup: 'Command line', localModel: 'QwenPaw Local, Ollama or LM Studio' },
  openlegion: { setup: 'Docker' },
  'poco-agent': { setup: 'Docker' },
  kai: { devices: 'Android, iOS, Windows, macOS, Linux and web' },
  mimiclaw: { devices: 'ESP32-S3 board' },
  gitclaw: { devices: 'macOS, Linux', setup: 'Command line' },
  openbrowserclaw: { devices: 'Web browser' },
};

export function verifiedSetup(p: Project): Setup {
  const data = setupBySlug[p.slug];
  return data ? { source: p.github && `https://github.com/${p.github}#readme`, ...data } : {};
}

export function quickStartUrl(p: Project) {
  if (p.github_data?.availability === 'unavailable') return null;
  return p.quick_start || (p.github ? `https://github.com/${p.github}#readme` : p.website ?? null);
}

export function modelAccess(p: Project): string {
  const local = verifiedSetup(p).localModel;
  if (local) return `Local option: ${local}. Hosted models may bill for usage.`;
  if (p.requires_llm === false) return 'A language model is optional.';
  if (p.requires_llm === true) return 'Uses a language model. Check the setup guide for supported providers and fees.';
  return 'Check the setup guide for model options.';
}

export function licenseLabel(p: Project) {
  const license = p.github_data?.license;
  if (license && license !== 'NOASSERTION') return license;
  return p.slug === 'spacebot' ? 'FSL-1.1-ALv2 (project license)' : 'See repository license';
}

export function publicStatus(p: Project) {
  return p.github_data?.availability === 'unavailable' ? 'Repository unavailable' : p.status;
}

export function firstTask(p: Project): string {
  if (p.first_task) return p.first_task;
  if (p.platform?.includes('embedded')) return 'Ask the agent to report the hardware it can see. Compare its answer with the board you connected before enabling any controls.';
  if (p.platform?.includes('messaging')) return 'In a private test chat, paste three sample appointments and ask it to make a checklist in date order. Check the dates before connecting a shared account.';
  return 'Give it a short set of sample meeting notes. Ask for a checklist with the owner and deadline beside each item. Check that it flags any missing details.';
}

export function projectFocus(p: Project): string {
  return p.tagline.replace(/[.!?]$/, '');
}

export function archiveNotice(p: Project): string {
  const data = p.github_data;
  if (p.status === 'archived' && data?.availability !== 'unavailable') return `${p.name} is archived. Its metrics are historical.`;
  if (data?.availability !== 'unavailable') return '';
  return `${p.name}’s repository was unavailable on ${(data.last_checked || data.last_enriched).slice(0, 10)}. Its metrics are historical, last collected on ${data.last_enriched.slice(0, 10)}.`;
}

const choiceNotes: Record<string, string> = {
  hermes: 'You repeat a task across days and want the assistant to remember your preferences and build a reusable skill.',
  openclaw: 'You want to reach the same personal assistant from a supported chat app while it runs on a computer you control.',
  aionui: 'You want to open a folder of documents, ask for changes and review the resulting files in a desktop app.',
  'atomic-agent': 'You want a desktop or terminal agent and have a computer capable of running the model you choose.',
  astrbot: 'You want an assistant in a group chat and already use one of its supported messaging services.',
  kai: 'You want to use your phone as the main place to talk to your personal assistant.',
  edgeclaw: 'You want to configure which requests use a local model and which can go to a cloud model.',
  nanobot: 'You want to start with a personal assistant in a terminal or browser and add a chat channel later.',
  openbrowserclaw: 'You want to try an assistant inside a browser tab, and that tab can stay open while you work.',
  picoclaw: 'You already own a compatible single-board computer and want to use it to host your assistant.',
  mimiclaw: 'You have an ESP32-S3 development board and want an assistant running on the board itself.',
  'esp-claw': 'You want to give natural-language requests to a supported device with sensors or other peripherals.',
  lettabot: 'You want an assistant with persistent memory that you can reach from different chat apps.',
  nanoclaw: 'You want chat groups to have their own instructions and tools, with agent work running in containers.',
  'poco-agent': 'You want to assign tasks from a web project and inspect the files the agent produces.',
  openlegion: 'You want agents in separate containers with configurable budgets, and someone can maintain the Docker setup.',
  gitclaw: 'You want to give a terminal agent work inside a repository and track its instructions in version control.',
  lobsterai: 'You want to request a task from a chat app and review the resulting files on your desktop.',
  'secure-openclaw': 'You want an assistant that can act through connected accounts and can review which permissions it receives.',
};

export function choiceNote(p: Project) {
  return choiceNotes[p.slug] ?? null;
}

export function sharedTraits(a: Project, b: Project): string[] {
  const platforms = (a.platform ?? []).filter(platform => b.platform?.includes(platform));
  const categories = a.category.filter(category => b.category.includes(category));
  return [...new Set([...platforms, ...categories])].map(trait => trait.replace(/-/g, ' '));
}
