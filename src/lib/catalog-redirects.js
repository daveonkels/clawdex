// Historic project URLs go to the host agent or a runnable agent serving the same use case.
export const retired = {
  clawgo: 'openclaw', clawra: 'openclaw', claudeclaw: 'openclaw', clawwork: 'nanobot',
  memu: 'lettabot', memos: 'hermes', moltworker: 'openclaw', nemoclaw: 'openclaw',
  openmolt: 'openclaw', safeclaw: 'ironclaw',
};

export function catalogRedirect(input, routes) {
  const url = new URL(input);
  const initial = url.href;
  const resolve = s => Object.hasOwn(retired, s) ? retired[s] : Object.hasOwn(routes.aliases, s) ? routes.aliases[s] : routes.active.includes(s) ? s : null;
  const path = url.pathname.replace(/\/index\.html$/, '/');
  const m = path.match(/^\/(?:(api|md)\/)?(projects|compare|alternatives)\/([a-z0-9-]+)(\.md|\.json|\/?)$/);
  const hub = /^\/compare\/?$/.test(path) && url.searchParams.has('a') && url.searchParams.has('b');
  if (!m && !hub) return null;
  const [, fmt = '', kind = 'compare', name = '', suffix = ''] = m || [];
  if (m && (fmt === 'md' ? suffix !== '.md' : fmt === 'api' ? suffix !== '.json' : !['','/'].includes(suffix))) return null;
  const dest = (type, slug) => fmt ? '/' + fmt + '/' + type + '/' + slug + (fmt === 'api' ? '.json' : '.md') : '/' + type + '/' + slug + '/';
  let status = 301;
  if (kind === 'compare') {
    const ids = hub ? ['a','b'].map(k => url.searchParams.get(k)) : name.split('-vs-');
    if (ids.length !== 2) return null;
    const [a,b] = ids.map(resolve);
    if (!a || !b) return null;
    if (hub && ids[0] === a && ids[1] === b) return null;
    if (hub) { url.searchParams.delete('a'); url.searchParams.delete('b'); }
    const pair = [a,b].sort().join('-vs-');
    if (a === b) url.pathname = dest('projects', a);
    else if (routes.pairs.includes(pair)) url.pathname = dest('compare', pair);
    else if (fmt) {
      url.pathname = fmt === 'api' ? '/api/compare.json' : '/md/index.md';
      status = 302;
    } else {
      url.pathname = '/compare/';
      url.searchParams.set('a', a); url.searchParams.set('b', b); status = 302;
    }
  } else {
    const slug = resolve(name);
    if (!slug) return null;
    const type = kind === 'alternatives' && routes.alternatives.includes(slug) && !fmt ? 'alternatives' : 'projects';
    url.pathname = dest(type, slug);
  }
  return url.href === initial ? null : { location: url.href, status };
}
