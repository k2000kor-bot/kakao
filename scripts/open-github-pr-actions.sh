#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT/scripts/push-remote-default.sh"
URL="https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/actions/workflows/create-pr-to-main.yml"
echo "$URL"
echo ""
echo "Run workflow → Run workflow (branch: dev-continue-2026-01-20)"
command -v open >/dev/null 2>&1 && open "$URL" || true
