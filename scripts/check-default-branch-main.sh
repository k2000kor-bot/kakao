#!/usr/bin/env bash
# GitHub default branch가 main인지 API로 확인
set -euo pipefail
source "$(cd "$(dirname "$0")/.." && pwd)/scripts/push-remote-default.sh"

DEFAULT="$(curl -sS "https://api.github.com/repos/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('default_branch','?'))")"
echo "default_branch: ${DEFAULT} (${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO})"

if [[ "$DEFAULT" == "main" ]]; then
  echo "OK: default branch is main"
  exit 0
fi

echo "expected: main"
echo "수동: npm run repo:open-default-branch"
echo "  또는: npm run repo:dispatch-set-default-main (KAKAO_BOT_PAT secret)"
command -v open >/dev/null 2>&1 && open "https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/settings/branches" || true
exit 1
