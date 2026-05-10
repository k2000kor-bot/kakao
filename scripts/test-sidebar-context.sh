#!/usr/bin/env bash
# 사이드바·앱 셸·대화 맥락 회귀 (루트 package.json: npm run test:sidebar-context)
# 상세·다른 검증 명령: TESTING_GUIDE.md · 원격 git push 차단: docs/PUSH_BLOCK_HANDOFF.md
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# Sync mirrored frontend/src and run sidebar-context regression suites.
npm run sync:frontend-src
npm run test -- --runInBand --watchAll=false --testPathPattern='AppUnified\.test|SettingsView\.test|ChatGPTInterface\.test|sidebarContextFilterEvent\.test'
