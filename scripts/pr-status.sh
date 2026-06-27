#!/usr/bin/env bash
# PR / push 상태 요약
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT/scripts/push-remote-default.sh"

BASE="${PR_BASE_BRANCH:-main}"
HEAD="${PR_HEAD_BRANCH:-dev-continue-2026-01-20}"

echo "=== repo status (${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}) ==="
echo "local HEAD: $(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo '?')"
echo "branch: $(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
if git -C "$ROOT" rev-parse origin/main >/dev/null 2>&1; then
  M=$(git -C "$ROOT" rev-parse --short origin/main)
  echo "origin/main: $M"
  if git -C "$ROOT" rev-parse "origin/${HEAD}" >/dev/null 2>&1; then
    H=$(git -C "$ROOT" rev-parse --short "origin/${HEAD}")
    echo "origin/${HEAD}: $H"
  fi
  if git -C "$ROOT" rev-parse origin/dev-continue-2026-01-20 >/dev/null 2>&1; then
    D=$(git -C "$ROOT" rev-parse --short origin/dev-continue-2026-01-20)
    echo "origin/dev-continue: $D"
    [[ "$M" == "$D" ]] && echo "main = dev-continue: OK" || echo "main ≠ dev-continue"
  fi
fi
echo ""

if command -v curl >/dev/null 2>&1; then
  PRS=$(curl -sS "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/pulls?state=open&head=${PUSH_GITHUB_OWNER}:${HEAD}&base=${BASE}" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(len(d))
for p in d:
    print(' ', p.get('html_url', ''))
" 2>/dev/null || echo "?")
  echo "open PR (main←${HEAD}): $PRS"
  CMP=$(curl -sS "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/compare/${BASE}...${HEAD}" | python3 -c "import sys,json; c=json.load(sys.stdin); print(c.get('status','?'), 'ahead', c.get('ahead_by','?'), 'behind', c.get('behind_by','?'))" 2>/dev/null || echo "?")
  echo "compare ${BASE}...${HEAD}: $CMP"
  DEFAULT=$(curl -sS "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}" | python3 -c "
import sys, json
try:
  data = json.load(sys.stdin)
except json.JSONDecodeError:
  print('?')
  sys.exit(0)
if 'message' in data and 'default_branch' not in data:
  print('?')
else:
  print(data.get('default_branch', '?'))
" 2>/dev/null || echo "?")
  if [[ "$DEFAULT" == "?" ]]; then
    DEFAULT=$(git -C "$ROOT" remote show origin 2>/dev/null | sed -n 's/^[[:space:]]*HEAD branch: //p' | head -1 || echo "?")
  fi
  echo "default_branch: $DEFAULT"
  [[ "$DEFAULT" == "main" ]] && echo "default branch: OK" || echo "default branch: main 권장 → npm run repo:open-default-branch"
  if [[ "$PRS" == "0" ]] || [[ "$PRS" == $'\n0' ]] || [[ "$PRS" == "?" ]]; then
    if [[ "$CMP" == *"identical"* ]] || [[ "$CMP" == *"ahead 0"* ]]; then
      echo "PR 불필요 (${HEAD} = ${BASE})"
    else
      echo "PR 없음 → PR_HEAD_BRANCH=${HEAD} npm run pr:create"
      echo "  또는: npm run pr:create:chat-composer-context"
    fi
  fi
  echo ""
  echo "다음:"
  [[ "$DEFAULT" != "main" ]] && echo "  npm run repo:open-default-branch  (default → main 권장)"
  echo "  npm run verify:handoff-artifacts"
  echo "  npm run verify:pre-deploy  (서버 :3000 후 E2E)"
  if [[ "$M" != "$D" ]] 2>/dev/null; then
    echo "  CONFIRM=1 npm run promote:main"
  fi
fi
