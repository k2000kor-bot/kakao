#!/usr/bin/env bash
# 완성도 마무리 검증: dev:check:frontend + test:p4:services
# COMPLETION_CHECKLIST §6 마무리 검증 순서 1·2를 한 번에 실행
# (프론트) 루트 src/ 수정 시 CRA 미러: npm run sync:frontend-src 또는 make sync-frontend; chatInputUtils만 npm run sync:frontend-chat-input-utils 또는 make sync-frontend-chat-input; 통합 대화(UI) 등 부분 npm run sync:frontend-unified-chat 또는 make sync-frontend-unified-chat; pretest 패리티: npm run check:src-frontend-parity 또는 make check-frontend-parity — QUICK_REFERENCE.md · AGENTS.md · scripts/README.md
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
echo "--- 2. P4 서비스 (8 suites, 170 tests) ---"
npm run test:p4:services || {
  echo "2단계 실패. npm run test:p4:services 확인."
  exit 1
}

echo ""
echo "=== 완성도 검증 완료 ==="
echo "권장(별도): npm run test:sidebar-context — TESTING_GUIDE.md · 원격 push: docs/PUSH_BLOCK_HANDOFF.md"
echo "선택 점검: DOC_HUB_STRICT=1 npm run check:doc-verification-hub — TESTING_GUIDE.md · scripts/README.md"
