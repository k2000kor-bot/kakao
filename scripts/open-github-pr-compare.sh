#!/usr/bin/env bash
# macOS: GitHub Compare 페이지를 브라우저에서 연다 (push 후 PR 생성용)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck source=push-remote-default.sh
source "$ROOT/scripts/push-remote-default.sh"
OWNER="${GITHUB_OWNER:-$PUSH_GITHUB_OWNER}"
case "$OWNER" in k2000kor) OWNER="$PUSH_GITHUB_OWNER" ;; esac
REPO="${GITHUB_REPO:-$PUSH_GITHUB_REPO}"
BASE="${PR_BASE_BRANCH:-main}"
HEAD="${PR_HEAD_BRANCH:-dev-continue-2026-01-20}"
URL="https://github.com/${OWNER}/${REPO}/compare/${BASE}...${HEAD}?expand=1"

echo "$URL"
if command -v open >/dev/null 2>&1; then
  open "$URL"
else
  echo "(open 명령 없음 — URL을 브라우저에 붙여넣으세요)"
fi
