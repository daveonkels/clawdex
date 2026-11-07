"""Collect public GitHub metrics through Agent Vault's proxy on Luna."""
import datetime
import json
import os
import re
import subprocess
import sys


def fetch(endpoint, optional=False):
    # Only the placeholder enters argv; Agent Vault substitutes it on the wire.
    result = subprocess.run([
        'curl', '--silent', '--show-error', '--max-time', '30',
        '--header', 'Accept: application/vnd.github+json',
        '--header', 'X-GitHub-Api-Version: 2026-03-10',
        '--header', 'Authorization: Bearer __github_public_read_token__',
        '--write-out', '\n%{http_code}',
        'https://api.github.com' + endpoint,
    ], capture_output=True, text=True, check=True)
    body, status = result.stdout.rsplit('\n', 1)
    if status == '404' and optional:
        return None
    if status != '200':
        raise RuntimeError(f'GitHub/Agent Vault returned HTTP {status} for {endpoint}')
    return json.loads(body)


def star_weeks(github):
    weeks = []
    for page in range(1, 101):
        batch = fetch(f'/repos/{github}/stargazers/history?per_page=30&page={page}')
        if not isinstance(batch, list):
            raise ValueError(f'Invalid star history for {github}')
        weeks.extend(batch)
        if len(batch) < 30:
            return weeks
    return weeks


def main():
    repositories = json.loads(sys.argv[1])
    output = sys.argv[2]
    snapshot = {'collected_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'repositories': {}}
    cache = {}
    if os.path.exists(output):
        with open(output) as handle:
            previous = json.load(handle)
        age = datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat(previous['collected_at'])
        if 0 <= age.total_seconds() < 3600 and any('error' in entry for entry in previous['repositories'].values()):
            cache = previous['repositories']
    for github in repositories:
        if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', github):
            raise ValueError('Invalid repository name')
        if github in cache and 'star_weeks' in cache[github] and 'error' not in cache[github]:
            snapshot['repositories'][github] = cache[github]
            print(f'Using recent response for {github}', flush=True)
            continue
        try:
            record = {'repo': fetch(f'/repos/{github}', optional=True), 'release': None}
            if record['repo'] is not None:
                record['release'] = fetch(f'/repos/{github}/releases/latest', optional=True)
                record['star_weeks'] = star_weeks(github)
            record['repo_status'] = 200 if record['repo'] is not None else 404
            print(f"Fetched {github}: HTTP {record['repo_status']}", flush=True)
        except Exception as error:
            record = {'error': str(error)}
            print(f'Failed {github}: {error}', flush=True)
        snapshot['repositories'][github] = record
        if 'error' in record and 'HTTP 301' not in record['error']:
            break
    with open(output + '.tmp', 'w') as handle:
        json.dump(snapshot, handle)
    os.replace(output + '.tmp', output)


if __name__ == '__main__':
    main()
