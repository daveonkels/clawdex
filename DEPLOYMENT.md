# Cloudflare deployment

ShellDex is built by Astro and deployed as static assets on Cloudflare Workers.

- Production URL: `https://shelldex.com`
- Worker: `shelldex-com`
- Build output: `dist/`
- Routing: the production custom domain is declared in `wrangler.jsonc`

## Validate

```sh
npm ci
npm run validate
npm run check:sitemap
npm run deploy:dry-run
```

## Deploy

```sh
npm run deploy
```

The normal deploy uses the project data tracked in Git. To refresh GitHub
metadata before publishing, set `GITHUB_TOKEN` in the shell and run:

```sh
npm run deploy:refresh
```

Do not run the refresh without a token: the site needs more requests than the
anonymous GitHub API hourly allowance.

Wrangler uses its local OAuth login. Do not add credentials to the repository.
A deploy updates the production custom domain and does not publish a
`workers.dev` hostname. Cloudflare Web Analytics is managed in the dashboard.
To roll back, run `npx wrangler rollback <version-id>`.
