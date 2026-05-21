#!/usr/bin/env bash
# k2000kor-bot/kakao-frontend 빈 저장소 생성 (없을 때만)
# GITHUB_TOKEN: k2000kor-bot 계정 PAT (repo 권한)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=push-remote-default.sh
source "$ROOT/scripts/push-remote-default.sh"

REMOTE="$PUSH_DEFAULT_REMOTE_URL"
if git ls-remote "$REMOTE" HEAD >/dev/null 2>&1; then
  echo "OK: 이미 존재 — $REMOTE"
  exit 0
fi

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "저장소 없음: ${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}"
  echo ""
  echo "A) 브라우저 (권장)"
  echo "   1. https://github.com/k2000kor-bot 로 로그인"
  echo "   2. https://github.com/new"
  echo "   3. Repository name: kakao-frontend · README 추가 안 함 · Create"
  echo ""
  echo "B) PAT로 자동 생성"
  echo "   export GITHUB_TOKEN=<k2000kor-bot PAT>"
  echo "   npm run create:github-repo"
  if command -v open >/dev/null 2>&1; then
    open "https://github.com/new" 2>/dev/null || true
  fi
  exit 2
fi

echo "GitHub API로 ${PUSH_GITHUB_REPO} 생성 중..."
HTTP="$(curl -sS -o /tmp/gh-create-repo.json -w "%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"${PUSH_GITHUB_REPO}\",\"private\":true,\"auto_init\":false}")"

if [[ "$HTTP" == "201" ]]; then
  echo "OK: 생성됨 — https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}"
  git ls-remote "$REMOTE" HEAD
  exit 0
fi

if [[ "$HTTP" == "422" ]] && grep -q "already exists" /tmp/gh-create-repo.json 2>/dev/null; then
  echo "OK: 이미 존재 (API)"
  exit 0
fi

echo "FAIL: HTTP $HTTP"
cat /tmp/gh-create-repo.json 2>/dev/null || true
exit 3
