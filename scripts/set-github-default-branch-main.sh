#!/usr/bin/env bash
# GitHub default branch → main (PAT 필요: KAKAO_BOT_PAT | GITHUB_TOKEN | GH_TOKEN)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/push-remote-default.sh
source "$ROOT/scripts/push-remote-default.sh"

TOKEN="${KAKAO_BOT_PAT:-${GITHUB_TOKEN:-${GH_TOKEN:-}}}"
if [[ -z "$TOKEN" ]]; then
  echo "토큰 없음 — Settings에서 수동 변경:"
  echo "  https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/settings/branches"
  echo "  또는: KAKAO_BOT_PAT=... $0"
  exit 1
fi

RESP="$(curl -sS -w "\n%{http_code}" -X PATCH \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}" \
  -d '{"default_branch":"main"}')"
BODY="${RESP%$'\n'*}"
CODE="${RESP##*$'\n'}"

if [[ "$CODE" != "200" ]]; then
  echo "PATCH failed (HTTP $CODE):"
  echo "$BODY" | head -20
  exit 1
fi

echo "OK: default_branch → main (${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO})"
