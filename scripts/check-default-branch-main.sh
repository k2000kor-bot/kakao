#!/usr/bin/env bash
# GitHub default branch가 main인지 확인 (API + git ls-remote fallback)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/push-remote-default.sh
source "$ROOT/scripts/push-remote-default.sh"

remote_head() {
  git -C "$ROOT" remote show origin 2>/dev/null | sed -n 's/^[[:space:]]*HEAD branch: //p' | head -1
}

remote_ref_sha() {
  local ref="$1"
  git -C "$ROOT" ls-remote origin "$ref" 2>/dev/null | awk '{print substr($1,1,12); exit}'
}

REPO_JSON="$(curl -sS "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}" 2>/dev/null || true)"
DEFAULT="$(echo "$REPO_JSON" | python3 -c "
import sys, json
try:
  data = json.load(sys.stdin)
except json.JSONDecodeError:
  print('?')
  sys.exit(0)
if 'message' in data and 'default_branch' not in data:
  print('?')
else:
  print(data.get('default_branch', '?'))
" 2>/dev/null || echo "?")"

if [[ "$DEFAULT" == "?" ]]; then
  DEFAULT="$(remote_head || echo "?")"
  [[ "$DEFAULT" != "?" ]] && echo "note: GitHub API 제한/오류 — git remote HEAD branch 사용"
fi

echo "default_branch: ${DEFAULT} (${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO})"

if [[ "$DEFAULT" == "main" ]]; then
  echo "OK: default branch is main"
  exit 0
fi

echo "expected: main"
if [[ "$DEFAULT" == "kakao" ]]; then
  echo "hint: default가 저장소 이름(kakao)으로 설정됨 — 브랜치 이름이 아님. General에서 main을 선택하세요."
fi

MAIN_SHA="$(remote_ref_sha refs/heads/main || true)"
KAKAO_SHA="$(remote_ref_sha refs/heads/kakao || true)"
if [[ -n "$MAIN_SHA" && -n "$KAKAO_SHA" ]]; then
  if [[ "$MAIN_SHA" == "$KAKAO_SHA" ]]; then
    echo "hint: main·kakao 브랜치 tip 동일 (${MAIN_SHA}) — default만 main으로 바꾸면 됨"
  else
    echo "hint: main(${MAIN_SHA}) ≠ kakao(${KAKAO_SHA}) — default를 main으로 바꾼 뒤 kakao 브랜치 삭제 권장"
  fi
fi

echo "수동: npm run repo:open-default-branch"
echo "  Settings → General → Default branch → 연필(⇄) → main 선택 → Update"
echo "  또는: npm run repo:dispatch-set-default-main (KAKAO_BOT_PAT secret)"
command -v open >/dev/null 2>&1 && open "https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/settings" || true
exit 1
