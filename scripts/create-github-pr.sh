#!/usr/bin/env bash
# k2000kor-bot/kakao PR 생성 (GITHUB_TOKEN 있으면 API, 없으면 Compare URL)
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

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "GITHUB_TOKEN 없음 — 브라우저에서 PR 생성: $COMPARE"
  if command -v open >/dev/null 2>&1; then
    open "$COMPARE"
  fi
  if command -v pbcopy >/dev/null 2>&1; then
    pbcopy < "$BODY_FILE"
    echo "PR 본문 클립보드에 복사됨"
  fi
  exit 0
fi

BODY_JSON="$(python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' < "$BODY_FILE")"
HTTP="$(curl -sS -o /tmp/gh-pr.json -w "%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/pulls" \
  -d "{\"title\":$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$TITLE"),\"head\":\"${HEAD}\",\"base\":\"${BASE}\",\"body\":${BODY_JSON}}")"

if [[ "$HTTP" == "201" ]]; then
  python3 -c "import json; d=json.load(open('/tmp/gh-pr.json')); print(d.get('html_url',''))"
  exit 0
fi

echo "FAIL: HTTP $HTTP"
cat /tmp/gh-pr.json 2>/dev/null || true
echo ""
echo "수동: $COMPARE"
exit 2
