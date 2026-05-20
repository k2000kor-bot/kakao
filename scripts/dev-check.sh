#!/usr/bin/env bash
# 커밋 전 권장 점검: 백엔드 핵심 테스트(project_session·main_server·main_api·intent·unified_chat·response_enhancer) + 프론트 타입 검사 + ESLint
# (프론트) src/ ↔ frontend/src/ 미러: npm run sync:frontend-src 또는 make sync-frontend; chatInputUtils만 npm run sync:frontend-chat-input-utils 또는 make sync-frontend-chat-input; 통합 대화(UI) 등 부분 npm run sync:frontend-unified-chat 또는 make sync-frontend-unified-chat; pretest: npm run check:src-frontend-parity 또는 make check-frontend-parity — QUICK_REFERENCE.md · AGENTS.md · scripts/README.md
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib-backend-python.sh
source "$SCRIPT_DIR/lib-backend-python.sh"

echo "=== 1. 백엔드 핵심 API 테스트 ==="
if [ -n "$DEV_CHECK_SKIP_BACKEND" ]; then
  echo "DEV_CHECK_SKIP_BACKEND=1, 백엔드 테스트 스킵."
else
  if backend_python_resolve "$ROOT" "import pytest"; then
    echo "Python: $BACKEND_PYTHON_CMD"
    (cd "$ROOT/backend" && "$BACKEND_PYTHON_CMD" -m pytest tests/test_project_session_api.py tests/test_main_server.py tests/test_main_api.py tests/test_intent_analysis.py tests/test_unified_chat_api.py tests/test_response_enhancer.py -v --tb=short -q) || {
      echo "백엔드 테스트 실패. 위 로그 확인."
      exit 1
    }
  else
    echo "pytest 미설치. 설치: pip install -r backend/requirements-dev.txt (또는 backend/venv 에 가상환경 생성 후 설치)"
    exit 1
  fi
fi

echo ""
echo "=== 2. 프론트 TypeScript 검사 ==="
if command -v npx &>/dev/null; then
  if ! npx tsc --noEmit -p tsconfig.build.json 2>/dev/null; then
    echo "타입 검사 실패. 상세: npx tsc --noEmit -p tsconfig.build.json"
    echo "  백엔드만 확인하려면: npm run test:backend"
    exit 1
  fi
  echo "앱 소스 타입 검사 통과."
  if ! npx tsc --noEmit -p src/services/__tests__/tsconfig.json; then
    echo "적응형 학습 테스트 타입 검사 실패. 상세: npx tsc --noEmit -p src/services/__tests__/tsconfig.json"
    echo "  단독 확인: npm run typecheck:adaptive-learning-tests"
    exit 1
  fi
  echo "적응형 학습 테스트 타입 검사 통과 (src)."
  if [[ -f frontend/src/services/__tests__/tsconfig.json ]]; then
    if ! (cd frontend && npx tsc --noEmit -p src/services/__tests__/tsconfig.json); then
      echo "적응형 학습 테스트 타입 검사 실패 (frontend 미러). 상세: cd frontend && npx tsc --noEmit -p src/services/__tests__/tsconfig.json"
      echo "  단독 확인: npm run typecheck:adaptive-learning-tests --prefix frontend"
      exit 1
    fi
    echo "적응형 학습 테스트 타입 검사 통과 (frontend)."
  fi
  if ! npx tsc --noEmit -p src/views/tsconfig.json; then
    echo "뷰 테스트 타입 검사 실패. 상세: npm run typecheck:views-tests"
    exit 1
  fi
  echo "뷰 테스트 타입 검사 통과 (src). (미러는 check:src-frontend-parity로 동기화 확인)"
else
  echo "npx 없음. 타입 검사 스킵."
fi

echo ""
echo "=== 2b. Jest 테스트 import 패턴 검사 ==="
if command -v npm &>/dev/null; then
  if ! npm run check:test-imports; then
    echo "check:test-imports 실패. 멀티라인 import 안에 installJestFetchMock이 끼었는지 확인하세요."
    exit 1
  fi
  echo "테스트 import 패턴 검사 통과."
else
  echo "npm 없음. check:test-imports 스킵."
fi

echo ""
echo "=== 3. 프론트 ESLint (경고도 실패) ==="
if command -v npx &>/dev/null; then
  if ! npm run lint:strict; then
    echo "ESLint 실패 (에러 또는 경고). 위 로그 확인."
    exit 1
  else
    echo "ESLint 통과."
  fi
else
  echo "npx 없음. ESLint 스킵."
fi

echo ""
echo "=== dev:check 완료 ==="
echo "권장(별도): npm run test:sidebar-context — TESTING_GUIDE.md · 원격 push: docs/PUSH_BLOCK_HANDOFF.md"
echo "선택 점검: DOC_HUB_STRICT=1 npm run check:doc-verification-hub — TESTING_GUIDE.md · scripts/README.md"
