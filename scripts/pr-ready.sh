#!/usr/bin/env bash
# PR 생성 준비: 상태 확인 → 본문 복사 → 브라우저 PR 폼 열기
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TITLE="${PR_TITLE:-feat: 관계도 문서 형식별 답변·컴포저 순차 생성·handoff}"

echo "=== PR 준비 (main ← dev-continue-2026-01-20) ==="
npm run pr:status
echo ""

if [[ -z "${GITHUB_TOKEN:-}" && -z "${KAKAO_BOT_PAT:-}" ]]; then
  npm run pr:copy-body
  npm run pr:open-new
  echo ""
  echo "제목 (복사용): $TITLE"
  echo ""
  echo "다음 (브라우저):"
  echo "  1. 제목 붙여넣기"
  echo "  2. Cmd+V 로 본문 붙여넣기 (이미 클립보드)"
  echo "  3. Create pull request"
  echo ""
  echo "자동 PR: docs/PR_CREATE_NOW.md → KAKAO_BOT_PAT 또는 Actions PR 권한"
else
  PR_TITLE="$TITLE" npm run pr:create
fi
