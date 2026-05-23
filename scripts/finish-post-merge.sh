#!/usr/bin/env bash
# merge 후 마무리: 상태·handoff·default branch 확인
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== post-merge finish (HEAD $(git rev-parse --short HEAD)) ==="
echo ""

echo "[1/3] pr:status"
bash scripts/pr-status.sh || true
echo ""

echo "[2/3] handoff"
if [[ "$(git rev-parse --abbrev-ref HEAD)" != "dev-continue-2026-01-20" ]]; then
  git checkout dev-continue-2026-01-20
  RESTORE_BRANCH=1
else
  RESTORE_BRANCH=0
fi
npm run refresh:handoff-artifacts
npm run verify:handoff-artifacts
if [[ "$RESTORE_BRANCH" -eq 1 ]]; then git checkout main; fi
echo ""

echo "[3/3] default branch"
if bash scripts/check-default-branch-main.sh; then
  echo ""
  echo "=== post-merge 완료 ==="
  exit 0
fi
echo ""
echo "=== 코드·handoff 완료 — default branch만 Settings에서 main으로 변경 ==="
exit 1
