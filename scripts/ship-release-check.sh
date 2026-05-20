#!/usr/bin/env bash
# PR/push 직전 풀 릴리스 점검 (handoff + tsc + pre-deploy + E2E는 별도)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== ship release check (HEAD $(git rev-parse --short HEAD)) ==="
echo ""

echo "[1/4] handoff"
npm run verify:handoff-artifacts
echo ""

echo "[2/4] TypeScript"
npx tsc --noEmit
echo "  OK tsc"
echo ""

if [[ "${SKIP_PRE_DEPLOY:-0}" != "1" ]]; then
  echo "[3/4] verify:pre-deploy"
  npm run verify:pre-deploy
else
  echo "[3/4] verify:pre-deploy SKIP (SKIP_PRE_DEPLOY=1)"
fi
echo ""

echo "[4/4] push-ready (실패해도 계속)"
if npm run check:push-ready; then
  echo ""
  echo "=== READY TO PUSH ==="
  echo "  PUSH_REMOTE_URL=git@github.com:k2000kor/kakao.git npm run push:dev-continue"
else
  echo ""
  echo "=== PUSH BLOCKED — 이관 또는 Collaborator ==="
  echo "  npm run push:next-steps"
  echo "  npm run handoff:info"
fi

echo ""
echo "PR: npm run pr:prepare"
