#!/usr/bin/env bash
# P2 검증 1·2단계 실행 (verify:completion + test:views)
# PERFORMANCE.md §2.6, COMPLETION_CHECKLIST §6 참고
# 3~5단계(빌드·Lighthouse·PWA E2E)는 안내만 출력
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== P2 검증 (1·2단계) ==="
echo ""

echo "--- 1. 완성도 검증 (타입·린트·P4) ---"
bash "$ROOT/scripts/verify-completion.sh" || {
  echo "1단계 실패. npm run verify:completion 확인."
  exit 1
}

echo ""
echo "--- 2. 확장 뷰·라우트 (test:views) ---"
npm run test:views || {
  echo "2단계 실패. npm run test:views 확인."
  exit 1
}

echo ""
echo "--- 3. 도구 뷰 서비스 (test:views:services) ---"
npm run test:views:services || {
  echo "3단계 실패. npm run test:views:services 확인."
  exit 1
}

echo ""
echo "=== P2 1·2·3단계 완료 ==="
echo ""
echo "다음 단계 (수동):"
echo "  4. npm run build"
echo "  5. npx serve -s build -l 3000 (백그라운드) 후 npm run lighthouse"
echo "  6. E2E_SERVER_READY=1 npx playwright test e2e/pwa.spec.ts --project=chromium"
echo "  상세: docs/PERFORMANCE.md §2.6, docs/COMPLETION_CHECKLIST.md §6"
