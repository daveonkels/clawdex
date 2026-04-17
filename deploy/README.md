# Deploy config

Server runs via ploi.io (nginx on the user's own box). This folder holds
config snippets the ploi site references.

## `nginx/agent-headers.conf`

Emits RFC 8288 Link response headers, enables `Accept: text/markdown`
content negotiation to the `/md/` mirrors, and sets correct content
types for agent-facing files.

Install once via ploi Site → Manage → Nginx Configuration. Paste the
contents inside the main `server { ... }` block, or `include` it if
the file is on disk:

```nginx
server {
    # ... existing directives ...
    include /home/ploi/shelldex.com/current/deploy/nginx/agent-headers.conf;
}
```

Reload nginx (ploi: Site → Restart Nginx) after changes.

Verify with:

```bash
curl -sI https://shelldex.com/ | grep -i ^link
curl -s -H 'Accept: text/markdown' https://shelldex.com/ | head
curl -sI -H 'Accept: text/markdown' https://shelldex.com/projects/hermes/ | grep -i content-type
```
