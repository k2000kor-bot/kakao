#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "$0")/.." && pwd)/scripts/push-remote-default.sh"
URL="https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/settings/branches"
echo "Default branch → main 권장: $URL"
command -v open >/dev/null 2>&1 && open "$URL" || true
