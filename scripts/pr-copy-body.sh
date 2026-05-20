#!/usr/bin/env bash
# PR 본문을 macOS 클립보드에 복사
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if command -v pbcopy >/dev/null 2>&1; then
  npm run pr:composer-graph-body | pbcopy
  echo "PR 본문을 클립보드에 복사했습니다. (docs/PR_COMPOSER_GRAPH_DRAFT.md)"
else
  echo "pbcopy 없음 — 아래를 수동 복사하세요:" >&2
  npm run pr:composer-graph-body
  exit 1
fi
