#!/usr/bin/env bash
# GitHub default branch 설정 — Settings → General (not /settings/branches)
set -euo pipefail
source "$(cd "$(dirname "$0")/.." && pwd)/scripts/push-remote-default.sh"
URL="https://github.com/${PUSH_GITHUB_OWNER}/${PUSH_GITHUB_REPO}/settings"
echo "Default branch → main: ${URL}"
echo "  저장소 Settings → General → Default branch → 연필(⇄) 아이콘 → main 선택"
echo "  (참고: /settings/branches 는 보호 규칙 페이지 — default branch 변경 아님)"
command -v open >/dev/null 2>&1 && open "$URL" || true
