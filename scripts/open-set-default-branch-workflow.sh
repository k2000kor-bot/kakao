#!/usr/bin/env bash
# GitHub Actions: default branch → main (workflow_dispatch)
set -euo pipefail
source "$(cd "$(dirname "$0")/.." && pwd)/scripts/push-remote-default.sh"
URL="https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/actions/workflows/set-default-branch-main.yml"
echo "Run workflow (KAKAO_BOT_PAT secret 필요): $URL"
command -v open >/dev/null 2>&1 && open "$URL" || true
