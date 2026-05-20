#!/usr/bin/env bash
# 배포·PR 직전 회귀 (빌드 제외, 백엔드 불필요)
# 빌드·접속·API·통합·chat-pipeline 포함: npm run verify:final
# E2E(Dev 서버): npm run test:e2e:composer-pipeline:all · npm run verify:conversation-graph
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== 배포 전 회귀 (Jest·관계도 unit) ==="
echo ""

echo "--- 1. src ↔ frontend/src 동기화 ---"
npm run sync:frontend-src

echo ""
echo "--- 2. 사이드바·앱 셸 (test:sidebar-context) ---"
npm run test:sidebar-context

echo ""
echo "--- 3. 컴포저 파이프라인 (verify:composer-pipeline) ---"
npm run verify:composer-pipeline

echo ""
echo "--- 4. 대화 관계도 unit (verify:conversation-graph:unit) ---"
npm run verify:conversation-graph:unit

echo ""
echo "=== 배포 전 회귀 완료 ==="
echo "풀 스택: npm run verify:final"
echo "E2E(서버 :3000): npm run test:e2e:composer-pipeline:all(재생성 포함) · test:e2e:composer-regenerate · npm run verify:conversation-graph"
echo "push-block: bash scripts/run-push-block-local-workflow.sh (아티팩트 검증 포함)"
