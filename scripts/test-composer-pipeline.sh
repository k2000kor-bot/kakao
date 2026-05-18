#!/usr/bin/env bash
# 컴포저 다중 요청·첨부·순차 API 회귀 (루트 package.json: npm run test:composer-pipeline / verify:composer-pipeline)
# 수동·E2E: docs/guides/CHAT_UI_TEST_SCENARIOS.md §14.7 · TESTING_GUIDE.md
# E2E 포함: E2E_COMPOSER_PIPELINE=1 npm run test:composer-pipeline (Dev 서버 :3000)
# CI·자동 기동: npm run test:e2e:composer-pipeline:ci:all
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

npm run sync:frontend-src
npm run pretest
CI=true react-scripts test \
  --testPathPattern='composerAttachmentPayload|composerMultiRequestProgress|composerSequential|composerMultiStep|runComposerSequentialMultiRequest|runComposerMultiStep|chatGptComposerPayload|WorkspaceQueryComposer.test|ChatGPTInterface.test' \
  --watchAll=false

if [ "${E2E_COMPOSER_PIPELINE:-}" = "1" ]; then
  echo ""
  echo "--- E2E (composer-pipeline:all) ---"
  npm run test:e2e:composer-pipeline:all
fi
