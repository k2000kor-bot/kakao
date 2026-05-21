#!/usr/bin/env bash
# PR / push 상태 요약
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT/scripts/push-remote-default.sh"

echo "=== PR status (${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}) ==="
echo "local HEAD: $(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo '?')"
echo "branch: $(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
echo ""

if command -v curl >/dev/null 2>&1; then
  PRS=$(curl -sS "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/pulls?state=open" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d)); [print(' ',p['html_url']) for p in d]" 2>/dev/null || echo "?")
  echo "open PRs: $PRS"
  echo ""
  echo "다음 (택1):"
  echo "  1) Settings → Allow Actions to create PRs → Run workflow"
  echo "     https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/settings/actions"
  echo "  2) npm run pr:open-new  (수동 PR)"
  echo "  3) CONFIRM=1 npm run promote:main  (PR 없이 main 동기화)"
  echo ""
  echo "Issue: https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/issues/1"
fi
