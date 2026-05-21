#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT/scripts/push-remote-default.sh"
URL="https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/actions/workflows/create-pr-to-main.yml"
SETTINGS="https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/settings/actions"
echo "Workflow: $URL"
echo "Settings (PR 권한): $SETTINGS"
echo ""
echo "1) Settings → Allow GitHub Actions to create and approve pull requests ✅"
echo "2) Run workflow → Run workflow (branch: dev-continue-2026-01-20)"
command -v open >/dev/null 2>&1 && open "$SETTINGS" || true
