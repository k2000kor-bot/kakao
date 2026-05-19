#!/usr/bin/env bash
# push 가능 여부 점검 (Collaborator 설정 후 exit 0)
# 사용: PUSH_REMOTE_URL=git@github.com:k2000kor/kakao.git bash scripts/check-github-push-ready.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REMOTE_URL="${PUSH_REMOTE_URL:-$(git config --get remote.origin.url 2>/dev/null || true)}"
BRANCH="${PUSH_BRANCH:-dev-continue-2026-01-20}"

if [[ -z "$REMOTE_URL" ]]; then
  echo "PUSH_REMOTE_URL 또는 origin remote 필요" >&2
  exit 1
fi

echo "remote: $REMOTE_URL"
echo "branch: $BRANCH"
echo ""

echo "[1] SSH"
ssh -T git@github.com 2>&1 || true
echo ""

echo "[2] ls-remote"
if ! git ls-remote "$REMOTE_URL" HEAD >/dev/null 2>&1; then
  echo "FAIL: 저장소 없음 또는 읽기 권한 없음"
  exit 2
fi
echo "OK: remote reachable"
echo ""

echo "[3] push dry-run"
git remote set-url origin "$REMOTE_URL"
if git push --dry-run -u origin "$BRANCH" 2>&1; then
  echo ""
  echo "OK: push 가능 → npm run push:dev-continue"
  exit 0
fi

echo ""
echo "FAIL: push 불가 (Collaborator Write 또는 저장소 URL 확인)"
echo "  docs/PUSH_NEW_REPO_SETUP.md"
exit 3
