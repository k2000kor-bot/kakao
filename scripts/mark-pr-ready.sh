#!/usr/bin/env bash
# open PR을 draft → ready for review (기본: main ← dev-continue-2026-01-20)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=push-remote-default.sh
source "$ROOT/scripts/push-remote-default.sh"

PR_NUMBER="${PR_NUMBER:-3}"
BASE="${PR_BASE_BRANCH:-main}"
HEAD="${PR_HEAD_BRANCH:-dev-continue-2026-01-20}"

load_pr_secrets_from_env_local() {
  local f="$ROOT/.env.local"
  [[ -f "$f" ]] || return 0
  local key line val
  for key in KAKAO_BOT_PAT GITHUB_TOKEN GH_TOKEN; do
    [[ -n "${!key:-}" ]] && continue
    line="$(grep -E "^[[:space:]]*${key}=" "$f" 2>/dev/null | tail -1 || true)"
    [[ -z "$line" ]] && continue
    val="${line#*=}"
    val="${val%\"}"
    val="${val#\"}"
    val="${val%\'}"
    val="${val#\'}"
    [[ -n "$val" ]] && export "$key=$val"
  done
}

resolve_token() {
  if [[ -n "${KAKAO_BOT_PAT:-}" ]]; then echo "$KAKAO_BOT_PAT"; return; fi
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then echo "$GITHUB_TOKEN"; return; fi
  if [[ -n "${GH_TOKEN:-}" ]]; then echo "$GH_TOKEN"; return; fi
  if command -v gh >/dev/null 2>&1; then gh auth token 2>/dev/null || true; fi
}

ensure_gh_in_path() {
  local gh_bin="$ROOT/tools/gh/bin"
  if [[ -x "$gh_bin/gh" ]]; then export PATH="$gh_bin:$PATH"; fi
}

load_pr_secrets_from_env_local
ensure_gh_in_path
bash "$ROOT/scripts/ensure-gh-cli.sh" >/dev/null 2>&1 || true
ensure_gh_in_path

if command -v gh >/dev/null 2>&1; then
  TOKEN="$(resolve_token || true)"
  if [[ -n "$TOKEN" ]]; then
    GH_TOKEN="$TOKEN" gh pr ready "$PR_NUMBER" --repo "${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}" && exit 0
  elif gh auth status >/dev/null 2>&1; then
    gh pr ready "$PR_NUMBER" --repo "${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}" && exit 0
  fi
fi

TOKEN="$(resolve_token || true)"
if [[ -z "$TOKEN" ]]; then
  echo "토큰/gh 없음 — GitHub에서 수동: https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/pull/${PR_NUMBER}"
  echo "  「Ready for review」 클릭 (현재 Draft면 merge 불가)"
  if command -v open >/dev/null 2>&1; then
    open "https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/pull/${PR_NUMBER}"
  fi
  exit 0
fi

HTTP="$(curl -sS -o /tmp/gh-pr-ready.json -w "%{http_code}" \
  -X PATCH \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/pulls/${PR_NUMBER}" \
  -d '{"draft":false}')"

if [[ "$HTTP" == "200" ]]; then
  python3 -c "import json; d=json.load(open('/tmp/gh-pr-ready.json')); print(d.get('html_url',''), 'draft=', d.get('draft'))"
  exit 0
fi

echo "FAIL: HTTP $HTTP"
cat /tmp/gh-pr-ready.json 2>/dev/null || true
exit 1
