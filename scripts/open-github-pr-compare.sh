#!/usr/bin/env bash
# macOS: GitHub Compare 페이지를 브라우저에서 연다 (push 후 PR 생성용)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OWNER="${GITHUB_OWNER:-k2000kor}"
REPO="${GITHUB_REPO:-kakao}"
BASE="${PR_BASE_BRANCH:-main}"
HEAD="${PR_HEAD_BRANCH:-dev-continue-2026-01-20}"
URL="https://github.com/${OWNER}/${REPO}/compare/${BASE}...${HEAD}?expand=1"

echo "$URL"
if command -v open >/dev/null 2>&1; then
  open "$URL"
else
  echo "(open 명령 없음 — URL을 브라우저에 붙여넣으세요)"
fi
