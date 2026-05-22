#!/usr/bin/env bash
# PR / push 상태 요약
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT/scripts/push-remote-default.sh"

echo "=== repo status (${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}) ==="
echo "local HEAD: $(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo '?')"
echo "branch: $(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
if git -C "$ROOT" rev-parse origin/main origin/dev-continue-2026-01-20 >/dev/null 2>&1; then
  M=$(git -C "$ROOT" rev-parse --short origin/main)
  D=$(git -C "$ROOT" rev-parse --short origin/dev-continue-2026-01-20)
  echo "origin/main: $M  origin/dev-continue: $D"
  [[ "$M" == "$D" ]] && echo "main 동기화: OK" || echo "main 동기화: 다름 → CONFIRM=1 npm run promote:main"
fi
echo ""

if command -v curl >/dev/null 2>&1; then
  PRS=$(curl -sS "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/pulls?state=open&head=${PUSH_GITHUB_OWNER}:dev-continue-2026-01-20&base=main" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(len(d))
for p in d:
    print(' ', p.get('html_url', ''))
" 2>/dev/null || echo "?")
  echo "open PR (main←dev-continue): $PRS"
  if [[ "$PRS" == "0" ]] || [[ "$PRS" == $'\n0' ]]; then
    echo "PR 없음 → npm run pr:create  또는 npm run pr:open-new"
    echo "  docs/PR_CREATE_NOW.md"
  fi
  echo ""
  echo "다음:"
  echo "  npm run repo:open-default-branch  (default → main 권장)"
  echo "  npm run verify:handoff-artifacts"
  echo "  npm run verify:pre-deploy  (서버 :3000 후 E2E)"
  if [[ "$M" != "$D" ]] 2>/dev/null; then
    echo "  CONFIRM=1 npm run promote:main"
  fi
fi
