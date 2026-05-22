#!/usr/bin/env bash
# PR 생성 준비: 상태 확인 → 본문 복사 → 브라우저 PR 폼 열기
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TITLE="${PR_TITLE:-feat: 관계도 문서 형식별 답변·컴포저 순차 생성·handoff}"

echo "=== PR 준비 (main ← dev-continue-2026-01-20) ==="
npm run pr:status
echo ""

PR_TITLE="$TITLE" npm run pr:create || true
if curl -sS "https://api.github.com/repos/k2000kor-bot/kakao/pulls?state=open&head=k2000kor-bot:dev-continue-2026-01-20&base=main" 2>/dev/null | python3 -c "import sys,json; sys.exit(0 if json.load(sys.stdin) else 1)" 2>/dev/null; then
  echo "PR 생성됨 — npm run pr:status"
else
  echo ""
  echo "PR 아직 없음 — 브라우저에서 Create pull request 클릭"
  echo "  자동화: gh auth login · KAKAO_BOT_PAT · docs/PR_CREATE_NOW.md"
fi
