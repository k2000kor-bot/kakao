#!/usr/bin/env bash
# GitHub default branch가 main인지 API로 확인
set -euo pipefail
source "$(cd "$(dirname "$0")/.." && pwd)/scripts/push-remote-default.sh"

REPO_JSON="$(curl -sS "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}")"
DEFAULT="$(echo "$REPO_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('default_branch','?'))")"
echo "default_branch: ${DEFAULT} (${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO})"

if [[ "$DEFAULT" == "main" ]]; then
  echo "OK: default branch is main"
  exit 0
fi

echo "expected: main"
if [[ "$DEFAULT" == "kakao" ]]; then
  echo "hint: default가 저장소 이름(kakao)으로 설정됨 — 브랜치 이름이 아님. General에서 main을 선택하세요."
  MAIN_SHA="$(curl -sS "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/git/ref/heads/main" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('object',{}).get('sha','')[:12])" 2>/dev/null || true)"
  KAKAO_SHA="$(curl -sS "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/git/ref/heads/kakao" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('object',{}).get('sha','')[:12])" 2>/dev/null || true)"
  if [[ -n "$MAIN_SHA" && "$MAIN_SHA" == "$KAKAO_SHA" ]]; then
    echo "hint: main·kakao 브랜치 tip 동일 (${MAIN_SHA}) — default만 main으로 바꾸면 됨"
  fi
fi
echo "수동: npm run repo:open-default-branch"
echo "  Settings → General → Default branch → 연필(⇄) → main 선택 → Update"
echo "  또는: npm run repo:dispatch-set-default-main (KAKAO_BOT_PAT secret)"
command -v open >/dev/null 2>&1 && open "https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/settings" || true
exit 1
