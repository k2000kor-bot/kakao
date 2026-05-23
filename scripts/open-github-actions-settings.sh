#!/usr/bin/env bash
# Actions workflow permissions (Read and write) 설정
set -euo pipefail
source "$(cd "$(dirname "$0")/.." && pwd)/scripts/push-remote-default.sh"
URL="https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/settings/actions"
echo "Actions settings (Workflow permissions → Read and write): $URL"
command -v open >/dev/null 2>&1 && open "$URL" || true
