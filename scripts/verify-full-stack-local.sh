#!/usr/bin/env bash
# 프론트(:3000) + 백(:5002) 기동 후 풀스택 스모크 (push 불필요)
# Jest만: npm run verify:pre-deploy · 빌드 포함: npm run verify:final
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BACKEND="${BACKEND_URL:-http://localhost:5002}"
FRONTEND="${FRONTEND_URL:-http://localhost:3000}"

check_url() {
  local url="$1"
  local label="$2"
  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo 000)"
  if [[ "$code" != "200" && "$code" != "301" && "$code" != "302" ]]; then
    echo "FAIL: $label ($url) → HTTP $code"
    echo "  백엔드: npm run restart:backend"
    echo "  프론트: npm start"
    exit 1
  fi
  echo "  OK $label → $code"
}

echo "=== 풀스택 로컬 검증 ==="
echo ""
echo "--- 접속 ---"
check_url "$BACKEND/api/health" "backend /api/health"
check_url "$FRONTEND/" "frontend"

echo ""
echo "--- Jest (pre-deploy) ---"
npm run verify:pre-deploy

echo ""
echo "--- 관계도 API ---"
npm run verify:conversation-graph-api

echo ""
echo "--- 통합 테스트 ---"
npm run test:integration

echo ""
echo "--- E2E (컴포저 + 관계도, E2E_SERVER_READY=1) ---"
npm run test:e2e:pipelines:all

echo ""
echo "=== 풀스택 로컬 검증 완료 ==="
echo "push: npm run check:push-ready (Collaborator 설정 후 npm run push:dev-continue)"
