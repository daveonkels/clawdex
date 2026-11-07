const LEGACY_HOSTS = new Set(['theclawdex.com', 'www.theclawdex.com']);

export default {
  fetch(request) {
    const source = new URL(request.url);
    if (!LEGACY_HOSTS.has(source.hostname)) {
      return new Response('Not found', { status: 404 });
    }

    const destination = new URL('https://shelldex.com');
    destination.pathname = source.pathname;
    destination.search = source.search;
    return Response.redirect(destination.toString(), 301);
  },
};
