# Legacy server config

ShellDex now runs on Cloudflare Workers Static Assets. Nothing in this folder
is used by the production deployment; it is retained only as migration history.

## `nginx/agent-headers.conf`

Emits RFC 8288 Link response headers, enables `Accept: text/markdown`
content negotiation to the `/md/` mirrors, and sets correct content
types for agent-facing files.

The former Ploi/nginx deployment included this snippet inside its `server`
block:

```nginx
server {
    # ... existing directives ...
    include /home/ploi/shelldex.com/current/deploy/nginx/agent-headers.conf;
}
```

Do not edit these files for current production changes. Cloudflare header rules
live in `public/_headers`, and deployment instructions live in `DEPLOYMENT.md`.

Verify with:

```bash
curl -sI https://shelldex.com/ | grep -i ^link
curl -s -H 'Accept: text/markdown' https://shelldex.com/ | head
curl -sI -H 'Accept: text/markdown' https://shelldex.com/projects/hermes/ | grep -i content-type
```
