#!/usr/bin/env bash
# Agent-readiness smoke test for shelldex.com.
#
# Usage:
#   scripts/test-agent-ready.sh                      # hits https://shelldex.com
#   BASE=http://localhost:4321 scripts/test-agent-ready.sh
#   BASE=https://staging.shelldex.com scripts/test-agent-ready.sh
#
# Requires: curl, jq.

set -u

BASE="${BASE:-https://shelldex.com}"
PASS=0
FAIL=0
FAILURES=()

green() { printf '\033[32m%s\033[0m' "$1"; }
red()   { printf '\033[31m%s\033[0m' "$1"; }
dim()   { printf '\033[2m%s\033[0m' "$1"; }

pass() { PASS=$((PASS+1)); printf '  %s %s\n' "$(green ✓)" "$1"; }
fail() { FAIL=$((FAIL+1)); FAILURES+=("$1"); printf '  %s %s\n' "$(red ✗)" "$1"; [ $# -ge 2 ] && printf '    %s\n' "$(dim "$2")"; }

section() { printf '\n\033[1m%s\033[0m\n' "$1"; }

# assert_status URL EXPECTED_STATUS [EXTRA_CURL_ARGS...]
assert_status() {
  local url="$1" want="$2"; shift 2
  local got
  got=$(curl -s -o /dev/null -w '%{http_code}' "$@" "$url")
  if [ "$got" = "$want" ]; then
    pass "GET $url → $got"
  else
    fail "GET $url → $got (expected $want)"
  fi
}

# assert_header URL HEADER_NAME PATTERN [EXTRA_CURL_ARGS...]
assert_header() {
  local url="$1" hdr="$2" pat="$3"; shift 3
  local headers value
  headers=$(curl -sI "$@" "$url")
  value=$(printf '%s' "$headers" | awk -v h="$hdr" 'BEGIN{IGNORECASE=1} tolower($1) ~ "^"tolower(h)":" {sub(/^[^:]*:[ \t]*/,""); print; exit}')
  if [ -z "$value" ]; then
    fail "$url missing $hdr header"
  elif printf '%s' "$value" | grep -Eqi -- "$pat"; then
    pass "$url $hdr matches /$pat/"
  else
    fail "$url $hdr has no match for /$pat/" "got: $value"
  fi
}

# assert_all_link_rels URL REL1 REL2 ...
assert_all_link_rels() {
  local url="$1"; shift
  local headers
  headers=$(curl -sI "$url")
  local all_link_vals
  all_link_vals=$(printf '%s' "$headers" | awk 'BEGIN{IGNORECASE=1} tolower($1)=="link:"{sub(/^[^:]*:[ \t]*/,""); print}')
  for rel in "$@"; do
    if printf '%s' "$all_link_vals" | grep -Eqi "rel=\"?$rel\"?"; then
      pass "Link: rel=\"$rel\" present on $url"
    else
      fail "Link: rel=\"$rel\" missing on $url"
    fi
  done
}

# assert_json_path URL JQ_QUERY EXPECTED_VALUE [EXTRA_CURL_ARGS...]
assert_json_path() {
  local url="$1" query="$2" want="$3"; shift 3
  local got
  got=$(curl -s "$@" "$url" | jq -r "$query" 2>/dev/null)
  if [ "$got" = "$want" ]; then
    pass "$url $query = $want"
  else
    fail "$url $query" "got: '$got' expected: '$want'"
  fi
}

# assert_json_valid URL [EXTRA_CURL_ARGS...]
assert_json_valid() {
  local url="$1"; shift
  if curl -s "$@" "$url" | jq -e . >/dev/null 2>&1; then
    pass "$url is valid JSON"
  else
    fail "$url is not valid JSON"
  fi
}

# assert_body_contains URL SUBSTRING [EXTRA_CURL_ARGS...]
assert_body_contains() {
  local url="$1" needle="$2"; shift 2
  if curl -s "$@" "$url" | grep -qF -- "$needle"; then
    pass "$url contains '$needle'"
  else
    fail "$url missing '$needle'"
  fi
}

printf 'Testing %s\n' "$BASE"

section 'Discoverability'
assert_status "$BASE/robots.txt" 200
assert_body_contains "$BASE/robots.txt" 'GPTBot'
assert_body_contains "$BASE/robots.txt" 'ClaudeBot'
assert_body_contains "$BASE/robots.txt" 'Content-Signal'
assert_body_contains "$BASE/robots.txt" 'Sitemap:'
assert_status "$BASE/sitemap-index.xml" 200
assert_status "$BASE/llms.txt" 200
assert_header "$BASE/llms.txt" 'content-type' 'text/plain'
assert_status "$BASE/llms-full.txt" 200
assert_body_contains "$BASE/llms-full.txt" '# Shelldex'
assert_status "$BASE/AGENTS.md" 200
assert_header "$BASE/AGENTS.md" 'content-type' 'text/markdown'

section 'RFC 8288 Link response headers (homepage)'
assert_all_link_rels "$BASE/" \
  'api-catalog' \
  'service-desc' \
  'service-doc' \
  'describedby' \
  'mcp-server-card' \
  'agent-skills'

section 'Markdown for Agents (Accept: text/markdown)'
assert_header "$BASE/" 'content-type' 'text/markdown' -H 'Accept: text/markdown'
assert_body_contains "$BASE/" '# Shelldex' -H 'Accept: text/markdown'
assert_header "$BASE/leaderboard/" 'content-type' 'text/markdown' -H 'Accept: text/markdown'
assert_header "$BASE/projects/hermes/" 'content-type' 'text/markdown' -H 'Accept: text/markdown'
assert_body_contains "$BASE/projects/hermes/" 'Hermes Agent' -H 'Accept: text/markdown'
assert_header "$BASE/compare/hermes-vs-openclaw/" 'content-type' 'text/markdown' -H 'Accept: text/markdown'
# Browsers (no Accept: text/markdown) still get HTML.
assert_header "$BASE/" 'content-type' 'text/html'
assert_header "$BASE/projects/hermes/" 'content-type' 'text/html'

section 'JSON API'
assert_status "$BASE/api/projects.json" 200
assert_header "$BASE/api/projects.json" 'content-type' 'application/json'
assert_header "$BASE/api/projects.json" 'access-control-allow-origin' '\*'
assert_json_valid "$BASE/api/projects.json"
assert_json_path "$BASE/api/projects.json" '.projects[0].slug != null' 'true'
assert_json_path "$BASE/api/projects.json" '(.projects | length) > 0' 'true'
assert_status "$BASE/api/projects/hermes.json" 200
assert_json_path "$BASE/api/projects/hermes.json" '.project.slug' 'hermes'
assert_json_path "$BASE/api/projects/hermes.json" '.project.urls.markdown' 'https://shelldex.com/md/projects/hermes.md'
assert_status "$BASE/api/leaderboard.json" 200
assert_json_path "$BASE/api/leaderboard.json" '.entries[0].rank' '1'
assert_status "$BASE/api/compare/hermes-vs-openclaw.json" 200
assert_json_path "$BASE/api/compare/hermes-vs-openclaw.json" '.pair.canonical' 'hermes-vs-openclaw'
assert_json_path "$BASE/api/compare/hermes-vs-openclaw.json" '(.projects | length)' '2'

section 'Markdown mirrors'
assert_status "$BASE/md/index.md" 200
assert_header "$BASE/md/index.md" 'content-type' 'text/markdown'
assert_status "$BASE/md/projects/hermes.md" 200
assert_status "$BASE/md/compare/hermes-vs-openclaw.md" 200
assert_status "$BASE/md/leaderboard.md" 200

section 'OpenAPI spec'
assert_status "$BASE/openapi.json" 200
assert_header "$BASE/openapi.json" 'content-type' 'openapi'
assert_json_path "$BASE/openapi.json" '.openapi' '3.1.0'
assert_json_path "$BASE/openapi.json" '.paths."/api/projects.json".get.operationId' 'listProjects'

section '.well-known manifests'
assert_json_valid "$BASE/.well-known/api-catalog"
assert_json_valid "$BASE/.well-known/ai-plugin.json"
assert_json_valid "$BASE/.well-known/mcp.json"
assert_json_path "$BASE/.well-known/mcp.json" '.serverInfo.name' 'shelldex'
assert_json_valid "$BASE/.well-known/mcp/server-card.json"
assert_json_path "$BASE/.well-known/mcp/server-card.json" '.serverInfo.name' 'shelldex'
assert_json_path "$BASE/.well-known/mcp/server-card.json" '.transport.type' 'static-resources'
assert_json_valid "$BASE/.well-known/agent-skills/index.json"
assert_json_path "$BASE/.well-known/agent-skills/index.json" '.skills[0].name' 'shelldex-lookup'
# Verify the agent-skills index' advertised sha256 matches the live SKILL.md.
SKILL_URL=$(curl -s "$BASE/.well-known/agent-skills/index.json" | jq -r '.skills[0].url' 2>/dev/null)
WANT_SHA=$(curl -s "$BASE/.well-known/agent-skills/index.json" | jq -r '.skills[0].sha256' 2>/dev/null)
GOT_SHA=$(curl -s "$SKILL_URL" | shasum -a 256 | awk '{print $1}')
if [ -n "$WANT_SHA" ] && [ "$WANT_SHA" = "$GOT_SHA" ]; then
  pass "agent-skills index sha256 matches live SKILL.md ($WANT_SHA)"
else
  fail "agent-skills index sha256 mismatch" "index=$WANT_SHA live=$GOT_SHA"
fi
assert_json_valid "$BASE/.well-known/oauth-protected-resource"
assert_json_path "$BASE/.well-known/oauth-protected-resource" '.authorization_servers | length' '0'

section 'WebMCP (in-page script)'
assert_body_contains "$BASE/" 'navigator.modelContext'
assert_body_contains "$BASE/" 'shelldex_search_projects'
assert_body_contains "$BASE/" 'shelldex_compare_projects'

section 'Structured data (JSON-LD on homepage)'
LD_BLOCK=$(curl -s "$BASE/" | awk '/<script type="application\/ld\+json">/,/<\/script>/')
if printf '%s' "$LD_BLOCK" | grep -q 'Dataset'; then pass 'homepage has Dataset JSON-LD'; else fail 'homepage missing Dataset JSON-LD'; fi
if printf '%s' "$LD_BLOCK" | grep -q 'WebSite';  then pass 'homepage has WebSite JSON-LD';  else fail 'homepage missing WebSite JSON-LD'; fi

section 'Canonical link tags (present on every page)'
assert_body_contains "$BASE/" 'rel="api-catalog"'
assert_body_contains "$BASE/" 'rel="alternate" type="text/markdown"'
assert_body_contains "$BASE/projects/hermes/" 'rel="alternate" type="text/markdown"'

printf '\n────────────────────────────────────────\n'
printf '%s passed, %s failed\n' "$(green $PASS)" "$([ $FAIL -gt 0 ] && red $FAIL || green $FAIL)"
if [ $FAIL -gt 0 ]; then
  printf '\nFailed:\n'
  for f in "${FAILURES[@]}"; do printf '  • %s\n' "$f"; done
  exit 1
fi
