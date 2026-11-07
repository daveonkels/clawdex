import assets from './worker.js';
import routes from './data/generated/catalog-routes.json';
import { catalogRedirect } from './lib/catalog-redirects.js';

export default { fetch(request, env) {
  if (['GET', 'HEAD'].includes(request.method)) {
    const redirect = catalogRedirect(request.url, routes);
    if (redirect) return Response.redirect(redirect.location, redirect.status);
  }
  return assets.fetch(request, env);
} };
