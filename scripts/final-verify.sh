#!/usr/bin/env bash
# 최종 검증: 빌드·접속·API·통합 테스트·대화 파이프라인 Jest
# 절차·표: docs/FINAL_CHECKLIST.md · 권장(별도): npm run test:sidebar-context — TESTING_GUIDE.md · 원격 push: docs/PUSH_BLOCK_HANDOFF.md
# 사용: ./scripts/final-verify.sh [BACKEND_URL]
# 백엔드가 이미 실행 중이면 통합 테스트까지 수행. 대화 파이프라인 Jest는 백엔드 없이 실행(실패 시 exit 1).

BACKEND="${1:-http://localhost:5002}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== 최종 검증 (프로젝트 루트: $ROOT) ==="
echo ""

# 0. Jest 테스트 import (빌드·Jest 전 빠른 실패)
echo "--- 0. Jest 테스트 import 패턴 ---"
if npm run check:test-imports; then
  echo "  OK check:test-imports"
else
  echo "  FAIL check:test-imports"
  exit 1
fi

# 1. 프론트 빌드
echo "--- 1. 프론트엔드 빌드 ---"
if npm run build >/dev/null 2>&1; then
  echo "  OK npm run build"
else
  echo "  FAIL npm run build"
  exit 1
fi

# 2. 접속 확인
echo ""
echo "--- 2. 접속 확인 ---"
bash scripts/check-access.sh "http://localhost:3000" "$BACKEND" || true

# 3. API 검증
echo ""
echo "--- 3. API 검증 ---"
if bash scripts/verify-api.sh "$BACKEND" 2>/dev/null; then
  echo "  OK verify:api"
else
  echo "  SKIP/FAIL verify:api (백엔드 미실행 시)"
fi

# 4. 통합 테스트
echo ""
echo "--- 4. 통합 테스트 ---"
if bash scripts/integration-test.sh "$BACKEND" 2>/dev/null; then
  echo "  OK test:integration"
else
  echo "  SKIP/FAIL test:integration (백엔드 미실행 시)"
fi

# 5. 프론트 대화 파이프라인 Jest (백엔드 불필요)
echo ""
echo "--- 5. 대화 파이프라인 Jest (test:frontend:chat-pipeline) ---"
if npm run test:frontend:chat-pipeline; then
  echo "  OK test:frontend:chat-pipeline"
else
  echo "  FAIL test:frontend:chat-pipeline"
  exit 1
fi

# 6. 컴포저 다중 요청·순차 API Jest (백엔드 불필요)
echo ""
echo "--- 6. 컴포저 파이프라인 Jest (verify:composer-pipeline) ---"
if npm run verify:composer-pipeline; then
  echo "  OK verify:composer-pipeline"
else
  echo "  FAIL verify:composer-pipeline"
  exit 1
fi

echo ""
echo "최종 검증 완료."
echo "권장(별도): npm run test:sidebar-context · verify:conversation-graph:unit · E2E: test:e2e:composer-pipeline:all · verify:conversation-graph (Dev 서버)"
