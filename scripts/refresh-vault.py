"""Fetch on Luna via Agent Vault, then validate and apply the public snapshot locally."""
import json
import pathlib
import shlex
import subprocess
import tempfile
import uuid

ROOT = pathlib.Path(__file__).resolve().parent.parent
WRAPPER = pathlib.Path.home() / '.agents/skills/agent-vault-cli/scripts/luna_vault_run.py'


def run(argv, **kwargs):
    return subprocess.run(argv, cwd=ROOT, check=True, **kwargs)


def main():
    if not WRAPPER.is_file():
        raise SystemExit('Agent Vault wrapper is missing; see DEPLOYMENT.md.')
    projects = run(['node', '--input-type=module', '-e',
                    "import {loadProjectFiles} from './src/lib/project-loader.js'; console.log(JSON.stringify(loadProjectFiles().map(p=>p.github).filter(Boolean)))"],
                   capture_output=True, text=True).stdout.strip()
    json.loads(projects)
    remote = '/tmp/codex-shelldex-' + uuid.uuid4().hex
    helper = remote + '.py'
    snapshot = remote + '.json'
    try:
        run(['scp', str(ROOT / 'scripts/fetch-github-snapshot.py'), 'luna:' + helper])
        retained = ROOT / 'src/data/generated/github-snapshot.json'
        if retained.exists():
            run(['scp', str(retained), 'luna:' + snapshot])
        run(['python3', str(WRAPPER), '--', 'python3', helper, projects, snapshot])
        with tempfile.TemporaryDirectory(prefix='shelldex-refresh-') as directory:
            local = str(pathlib.Path(directory) / 'snapshot.json')
            run(['scp', 'luna:' + snapshot, local])
            retained = ROOT / 'src/data/generated/github-snapshot.json'
            retained.parent.mkdir(parents=True, exist_ok=True)
            retained.write_bytes(pathlib.Path(local).read_bytes())
            run(['pnpm', 'run', 'enrich', '--snapshot', str(retained)])
    finally:
        run(['ssh', 'luna', 'rm -f ' + ' '.join(shlex.quote(p) for p in [helper, snapshot, snapshot + '.tmp'])])


if __name__ == '__main__':
    main()
