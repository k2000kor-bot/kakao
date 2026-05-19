#!/usr/bin/env bash
# dev-continue-2026-01-20 브랜치 push (원격 URL은 인자 또는 PUSH_REMOTE_URL)
# 저장소 없음: docs/PUSH_NEW_REPO_SETUP.md · 이관: docs/PUSH_BLOCK_HANDOFF.md
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BRANCH="${PUSH_BRANCH:-dev-continue-2026-01-20}"
REMOTE_URL="${1:-${PUSH_REMOTE_URL:-}}"

if [[ -z "$REMOTE_URL" ]]; then
  REMOTE_URL="$(git config --get remote.origin.url 2>/dev/null || true)"
fi

if [[ -z "$REMOTE_URL" ]]; then
  echo "사용법: PUSH_REMOTE_URL=git@github.com:<owner>/<repo>.git bash scripts/push-dev-continue-branch.sh"
  echo "또는: bash scripts/push-dev-continue-branch.sh git@github.com:<owner>/<repo>.git"
  echo "저장소 생성: docs/PUSH_NEW_REPO_SETUP.md"
  exit 1
fi

CURRENT="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT" != "$BRANCH" ]]; then
  echo "현재 브랜치: $CURRENT (예상: $BRANCH)"
  echo "  git checkout $BRANCH"
  exit 1
fi

echo "origin → $REMOTE_URL"
git remote set-url origin "$REMOTE_URL"

echo "--- handoff artifacts ---"
if ! npm run verify:handoff-artifacts; then
  echo "FAIL: bundle/patch가 브랜치 tip과 불일치합니다." >&2
  echo "  npm run refresh:handoff-artifacts" >&2
  exit 3
fi

echo "--- remote check ---"
if ! git ls-remote origin HEAD >/dev/null 2>&1; then
  echo "FAIL: 원격 저장소에 접근할 수 없습니다."
  echo "  - GitHub에 저장소가 있는지 확인"
  echo "  - k2000kor-bot(또는 사용 SSH 계정)에 write 권한 부여"
  bash scripts/retry-push-with-diagnostics.sh || true
  exit 2
fi

echo "--- push ---"
git push -u origin "$BRANCH"
echo "OK: pushed $BRANCH"
echo "PR 본문: npm run pr:composer-graph-body"
echo "  (또는 docs/PR_COMPOSER_GRAPH_DRAFT.md)"
