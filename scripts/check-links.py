"""Verify every local navigation, asset, fragment and advertised catalog schema in the built site."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import json
import sys

root = Path('dist')
origin = 'https://shelldex.com'
targets = {}
ids = {}

class Links(HTMLParser):
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if data.get('id'):
            ids[page].add(data['id'])
        for key in ('href', 'src', 'action'):
            value = data.get(key)
            if not value:
                continue
            url = urlsplit(urljoin(origin + page, value))
            if url.hostname == 'shelldex.com':
                targets.setdefault((url.path, unquote(url.fragment)), page)

for file in root.rglob('*.html'):
    page = '/' + file.relative_to(root).as_posix()
    if page.endswith('/index.html'):
        page = page[:-10]
    ids[page] = set()
    Links().feed(file.read_text())
for file in (root/'api').rglob('*.json'):
    schema = json.loads(file.read_text()).get('$schema')
    if schema:
        targets.setdefault((urlsplit(schema).path, ''), str(file))

errors = []
for (path, fragment), source in sorted(targets.items()):
    file = root / unquote(path).lstrip('/')
    if file.is_dir():
        file = file / 'index.html'
    if not file.is_file():
        errors.append(f'{source} -> {path}')
    elif fragment and path in ids and fragment not in ids[path] and not fragment.startswith(':~:text='):
        errors.append(f'{source} -> {path}#{fragment}')
print(f'{len(ids)} HTML pages, {len(targets)} distinct internal links/assets/fragments, {len(errors)} unresolved')
if errors:
    sys.exit('\n'.join(errors))
