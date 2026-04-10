#!/usr/bin/env bash
# 완성도 마무리 검증: dev:check:frontend + test:p4:services
# COMPLETION_CHECKLIST §6 마무리 검증 순서 1·2를 한 번에 실행
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== 완성도 마무리 검증 (COMPLETION_CHECKLIST §6) ==="
echo ""

echo "--- 1. 품질 (타입·린트) ---"
DEV_CHECK_SKIP_BACKEND=1 bash "$ROOT/scripts/dev-check.sh" || {
  echo "1단계 실패. npm run dev:check:frontend 확인."
  exit 1
}

echo ""
echo "--- 2. P4 서비스 (8 suites, 148 tests) ---"
npm run test:p4:services || {
  echo "2단계 실패. npm run test:p4:services 확인."
  exit 1
}

echo ""
echo "=== 완성도 검증 완료 ==="
