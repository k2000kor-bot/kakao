#!/usr/bin/env bash
# GitHub default branch → main (PAT 필요: KAKAO_BOT_PAT | GITHUB_TOKEN | GH_TOKEN)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/push-remote-default.sh
source "$ROOT/scripts/push-remote-default.sh"

load_token_from_env_local() {
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

ensure_gh_in_path() {
  local gh_bin="$ROOT/tools/gh/bin"
  if [[ -x "$gh_bin/gh" ]]; then export PATH="$gh_bin:$PATH"; fi
}

resolve_token() {
  if [[ -n "${KAKAO_BOT_PAT:-}" ]]; then echo "$KAKAO_BOT_PAT"; return; fi
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then echo "$GITHUB_TOKEN"; return; fi
  if [[ -n "${GH_TOKEN:-}" ]]; then echo "$GH_TOKEN"; return; fi
  if command -v gh >/dev/null 2>&1; then gh auth token 2>/dev/null || true; fi
}

load_token_from_env_local
ensure_gh_in_path
bash "$ROOT/scripts/ensure-gh-cli.sh" >/dev/null 2>&1 || true
TOKEN="$(resolve_token)"
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
