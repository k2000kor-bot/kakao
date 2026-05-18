#!/usr/bin/env bash
# 인수인계·절차: docs/PUSH_BLOCK_HANDOFF.md · 검증 표: TESTING_GUIDE.md · 회귀: test-sidebar-context · verify:composer-pipeline
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# 1) 전달 아티팩트(bundle/patch) 무결성 확인
bash scripts/verify-push-block-artifacts.sh

# 2) 사이드바 컨텍스트 회귀 테스트 실행
bash scripts/test-sidebar-context.sh

# 3) 컴포저 다중 요청·순차·다단계 API 회귀
npm run verify:composer-pipeline

# 4) 대화 관계도 Jest·백엔드 (E2E 제외)
npm run verify:conversation-graph:unit

echo "local push-block workflow completed"
echo "선택 E2E: npm run test:e2e:pipelines:all (서버 선기동) · CI: test:e2e:pipelines:ci:all"
echo "선택 관계도 E2E 포함: npm run verify:conversation-graph"
