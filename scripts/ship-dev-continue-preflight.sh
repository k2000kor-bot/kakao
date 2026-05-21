#!/usr/bin/env bash
# push/PR 직전 일괄 점검 (handoff + 관계도 유닛 + push-ready)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== dev-continue preflight (HEAD $(git rev-parse --short HEAD)) ==="
echo ""

echo "[1/4] handoff artifacts"
npm run refresh:handoff-artifacts
echo ""

echo "[2/4] conversation-graph unit"
npm run verify:conversation-graph:unit
echo ""

echo "[3/4] push-ready"
if npm run check:push-ready; then
  echo ""
  echo "OK: push 가능 → PUSH_REMOTE_URL=... npm run push:dev-continue"
  PUSH_OK=1
else
  echo ""
  echo "push 막힘 → npm run push:next-steps"
  echo "  Collaborator: https://github.com/k2000kor/kakao/settings/access"
  PUSH_OK=0
fi

echo ""
echo "[4/4] PR"
npm run pr:composer-graph-url
echo "  본문: npm run pr:composer-graph-body"
echo "  macOS Compare: npm run pr:open-compare"
echo "  본문 복사: npm run pr:copy-body"
if [[ "${PUSH_OK:-0}" -eq 1 ]]; then
  exit 0
fi
exit 1
