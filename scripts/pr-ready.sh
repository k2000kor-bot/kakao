#!/usr/bin/env bash
# PR 생성 준비: 상태 확인 → 본문 복사 → 브라우저 PR 폼 열기
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TITLE="${PR_TITLE:-feat: 관계도 문서 형식별 답변·컴포저 순차 생성·handoff}"
HEAD="${PR_HEAD_BRANCH:-dev-continue-2026-01-20}"
BASE="${PR_BASE_BRANCH:-main}"

echo "=== PR 준비 (${BASE} ← ${HEAD}) ==="
PR_HEAD_BRANCH="$HEAD" PR_BASE_BRANCH="$BASE" npm run pr:status
echo ""

PR_HEAD_BRANCH="$HEAD" PR_BASE_BRANCH="$BASE" PR_TITLE="$TITLE" npm run pr:create || true
if curl -sS "https://api.github.com/repos/k2000kor-bot/kakao/pulls?state=open&head=k2000kor-bot:${HEAD}&base=${BASE}" 2>/dev/null | python3 -c "import sys,json; sys.exit(0 if json.load(sys.stdin) else 1)" 2>/dev/null; then
  echo "PR 생성됨 — PR_HEAD_BRANCH=${HEAD} npm run pr:status"
else
  echo ""
  echo "PR 아직 없음 — 브라우저에서 Create pull request 클릭"
  echo "  .env.local: KAKAO_BOT_PAT=... 후 npm run pr:create"
  echo "  또는: npm run pr:ensure-gh && gh auth login && npm run pr:create"
  echo "  docs/PR_CREATE_NOW.md"
fi
