#!/usr/bin/env bash
# push 전 PR 준비: preflight + 본문 파일 export + Compare URL
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

EXPORT="${ROOT}/docs/PR_BODY_FOR_GITHUB.md"
BODY_SRC="${ROOT}/docs/PR_COMPOSER_GRAPH_DRAFT.md"

echo "=== prepare GitHub PR ==="
echo ""

echo "[1] preflight (push 실패해도 계속)"
bash scripts/ship-dev-continue-preflight.sh || true
echo ""

echo "[2] PR 본문 export -> docs/PR_BODY_FOR_GITHUB.md"
cp "$BODY_SRC" "$EXPORT"
echo "  $EXPORT"
echo ""

echo "[3] Compare URL"
bash scripts/print-github-pr-url.sh
echo ""

if command -v pbcopy >/dev/null 2>&1; then
  pbcopy < "$BODY_SRC"
  echo "[4] 클립보드에 PR 본문 복사됨 (pbcopy)"
fi

echo ""
echo "다음: npm run pr:open-compare → GitHub에 본문 붙여넣기 (또는 npm run pr:create)"
