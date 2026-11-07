export function markdownPath(pathname) {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/') return '/md/index.md';
  if (path === '/leaderboard') return '/md/leaderboard.md';
  if (/^\/(projects|compare)\/[a-z0-9-]+$/.test(path)) return `/md${path}.md`;
  return null;
}

export function prefersMarkdown(accept = '') {
  const quality = (mime) => {
    const entry = accept.toLowerCase().split(',').map(value => value.trim()).find(value => value.split(';')[0].trim() === mime);
    if (!entry) return 0;
    const q = entry.match(/;\s*q=([\d.]+)/);
    return q ? Number(q[1]) : 1;
  };
  return quality('text/markdown') > 0 && quality('text/markdown') >= quality('text/html');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const mirror = markdownPath(url.pathname);
    if (['GET', 'HEAD'].includes(request.method) && mirror && prefersMarkdown(request.headers.get('Accept') ?? '')) {
      url.pathname = mirror;
      const response = await env.ASSETS.fetch(new Request(url, request));
      if (response.ok) return response;
    }
    return env.ASSETS.fetch(request);
  },
};
