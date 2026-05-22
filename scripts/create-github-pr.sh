#!/usr/bin/env bash
# k2000kor-bot/kakao PR 생성 (GITHUB_TOKEN/gh → API, 없으면 quick_pull URL)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=push-remote-default.sh
source "$ROOT/scripts/push-remote-default.sh"

BASE="${PR_BASE_BRANCH:-main}"
HEAD="${PR_HEAD_BRANCH:-dev-continue-2026-01-20}"
TITLE="${PR_TITLE:-feat: 컴포저 순차 생성·관계도 정리 답변(합성·2-pass)·handoff}"
BODY_FILE="${ROOT}/docs/PR_COMPOSER_GRAPH_DRAFT.md"
COMPARE="https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/compare/${BASE}...${HEAD}?expand=1"

if [[ ! -f "$BODY_FILE" ]]; then
  echo "FAIL: $BODY_FILE 없음" >&2
  exit 1
fi

resolve_token() {
  if [[ -n "${KAKAO_BOT_PAT:-}" ]]; then
    echo "$KAKAO_BOT_PAT"
    return
  fi
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    echo "$GITHUB_TOKEN"
    return
  fi
  if command -v gh >/dev/null 2>&1; then
    gh auth token 2>/dev/null || true
  fi
}

try_gh_pr_create() {
  command -v gh >/dev/null 2>&1 || return 1
  gh auth status >/dev/null 2>&1 || return 1
  local url
  url="$(gh pr create \
    --repo "${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}" \
    --base "$BASE" \
    --head "$HEAD" \
    --title "$TITLE" \
    --body-file "$BODY_FILE" 2>&1)" || return 1
  echo "$url"
  return 0
}

PR_NEW_URL="https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/pull/new?base=${BASE}&head=${HEAD}"

open_quick_pull() {
  local url
  url="$(python3 - "$COMPARE" "$TITLE" "$BODY_FILE" <<'PY'
import sys, urllib.parse
compare, title, body_path = sys.argv[1:4]
body = open(body_path, encoding="utf-8").read()
# GitHub compare URL 길이 제한 — 본문은 앞부분만 pre-fill
if len(body) > 5500:
    body = body[:5500] + "\n\n…(전체 본문: docs/PR_COMPOSER_GRAPH_DRAFT.md)"
q = urllib.parse.urlencode({
    "quick_pull": "1",
    "title": title,
    "body": body,
})
sep = "&" if "?" in compare else "?"
print(f"{compare}{sep}{q}")
PY
)"
  echo "PR (권장): $PR_NEW_URL"
  echo "Compare+pre-fill: $url"
  if command -v open >/dev/null 2>&1; then
    open "$PR_NEW_URL"
  fi
  if command -v pbcopy >/dev/null 2>&1; then
    pbcopy < "$BODY_FILE"
    echo "PR 본문 전체 클립보드에 복사됨"
  fi
}

if try_gh_pr_create; then
  exit 0
fi

TOKEN="$(resolve_token || true)"
if [[ -z "$TOKEN" ]]; then
  echo "GITHUB_TOKEN/KAKAO_BOT_PAT/gh login 없음 — quick_pull로 PR 폼 열기"
  echo "  gh: gh auth login 후 npm run pr:create"
  open_quick_pull
  exit 0
fi

BODY_JSON="$(python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' < "$BODY_FILE")"
HTTP="$(curl -sS -o /tmp/gh-pr.json -w "%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/pulls" \
  -d "{\"title\":$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$TITLE"),\"head\":\"${HEAD}\",\"base\":\"${BASE}\",\"body\":${BODY_JSON}}")"

if [[ "$HTTP" == "201" ]]; then
  python3 -c "import json; d=json.load(open('/tmp/gh-pr.json')); print(d.get('html_url',''))"
  exit 0
fi

echo "API FAIL: HTTP $HTTP — quick_pull로 대체"
cat /tmp/gh-pr.json 2>/dev/null || true
open_quick_pull
exit 0
