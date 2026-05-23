#!/usr/bin/env bash
# Actions secrets (KAKAO_BOT_PAT 등) 설정 페이지
set -euo pipefail
source "$(cd "$(dirname "$0")/.." && pwd)/scripts/push-remote-default.sh"
URL="https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/settings/secrets/actions"
echo "Actions secrets: $URL"
command -v open >/dev/null 2>&1 && open "$URL" || true
