"""Import an n8n workflow into a running n8n instance.

Usage:
    python import_workflow.py                         (imports ollama-chat.json)
    python import_workflow.py claude-chat.json         (imports a specific workflow file)

Requirements:
    - n8n running at http://localhost:5678
"""
import requests
import json
import sys
import os

BASE_URL = 'http://localhost:5678'
DEFAULT_WORKFLOW_FILE = 'n8n/workflows/ollama-chat.json'


def login(session: requests.Session) -> str:
    """Login to n8n and return auth cookie."""
    r = session.post(f'{BASE_URL}/rest/login', json={
        'emailOrLdapLoginId': 'achref.nejah@gmail.com',
        'password': 'Password123!'
    })
    if r.status_code != 200:
        raise RuntimeError(f'Login failed: {r.text[:200]}')
    auth_cookie = session.cookies.get('n8n-auth')
    if not auth_cookie:
        raise RuntimeError('No auth cookie received')
    return auth_cookie


def import_workflow(session: requests.Session, auth_cookie: str,
                    workflow_file: str) -> dict:
    """Import workflow from file. Returns the workflow data dict (including id and name)."""
    with open(workflow_file, 'r') as f:
        workflow_data = json.load(f)

    # Remove fields that would conflict with existing workflows
    workflow_data.pop('versionId', None)

    r = session.post(f'{BASE_URL}/rest/workflows',
                        json=workflow_data,
                        headers={'Cookie': f'n8n-auth={auth_cookie}'})
    if r.status_code != 200:
        raise RuntimeError(f'Import failed: {r.text[:200]}')

    wf = r.json()['data']
    print(f'  Imported: "{wf["name"]}" (ID: {wf["id"]})')
    return wf


def activate_workflow(session: requests.Session, auth_cookie: str,
                      workflow_id: str) -> None:
    """Activate a workflow."""
    r = session.patch(f'{BASE_URL}/rest/workflows/{workflow_id}',
                      json={'active': True},
                      headers={'Cookie': f'n8n-auth={auth_cookie}'})
    if r.status_code != 200:
        raise RuntimeError(f'Activation failed: {r.text[:200]}')
    data = r.json()['data']
    assert data['active'] is True
    print(f'  Activated: {data["active"]}')


def list_workflows(session: requests.Session, auth_cookie: str) -> None:
    """List all workflows."""
    r = session.get(f'{BASE_URL}/rest/workflows',
                    headers={'Cookie': f'n8n-auth={auth_cookie}'})
    if r.status_code != 200:
        raise RuntimeError(f'List failed: {r.text[:200]}')
    data = r.json()['data']
    for wf in data:
        status = '✅ active' if wf['active'] else '⏸️  inactive'
        print(f'  {status} - {wf["name"]} (ID: {wf["id"]})')


def resolve_workflow_path(filename: str) -> str:
    """Resolve a workflow filename to a full path.
    If the file already looks like a path, return it as-is.
    Otherwise, assume it's in n8n/workflows/.
    """
    if os.sep in filename or filename.startswith('n8n/'):
        return filename
    return f'n8n/workflows/{filename}'


def main():
    # Determine workflow file from CLI args or default
    if len(sys.argv) > 1:
        WORKFLOW_FILE = resolve_workflow_path(sys.argv[1])
    else:
        WORKFLOW_FILE = DEFAULT_WORKFLOW_FILE

    session = requests.Session()

    print('🔑 Logging in...')
    auth_cookie = login(session)
    print('✅ Logged in successfully')

    print('\n📋 Current workflows:')
    list_workflows(session, auth_cookie)

    print(f'\n📥 Importing workflow from {WORKFLOW_FILE}...')
    if not os.path.isfile(WORKFLOW_FILE):
        print(f'❌ File not found: {WORKFLOW_FILE}')
        sys.exit(1)
    wf = import_workflow(session, auth_cookie, WORKFLOW_FILE)

    print('\n▶️  Activating workflow...')
    activate_workflow(session, auth_cookie, wf['id'])

    print('\n📋 Updated workflows:')
    list_workflows(session, auth_cookie)

    # Derive webhook path from workflow name
    wf_name = wf['name'].lower().replace(' ', '-')
    print(f'\n✨ Done! Workflow "{wf_name}" is active at:')
    print(f'   POST http://localhost:5678/webhook/{wf_name}')
    print(f'\n   Test it with:')
    print(f'   curl -X POST http://localhost:5678/webhook/{wf_name} \\')
    print(f'     -H "Content-Type: application/json" \\')
    claude = 'claude' in wf_name
    if claude:
        print(f'     -d \'{{"prompt":"Hello, how are you?", "apiKey":"<YOUR_ANTHROPIC_API_KEY>"}}\'')
    else:
        print(f'     -d \'{{"prompt":"Say hello in one word"}}\'')


if __name__ == '__main__':
    main()
