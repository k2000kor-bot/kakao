#!/usr/bin/env bash
# 백엔드용 Python 경로 결정 (backend/venv 우선 → .venv → 시스템 python3, import 성공하는 것만)
# 사용: ROOT(저장소 루트, backend/ 하위 포함) 설정 후 source
#       backend_python_resolve "$ROOT" "import pytest"   # dev-check, run-backend-pytest, run-backend-pipeline-*
#       backend_python_resolve "$ROOT" "import uvicorn"  # start-api-5002, start_all
# 성공 시 BACKEND_PYTHON_CMD 설정, 실패 시 exit 1
backend_python_resolve() {
  local root="$1"
  local snippet="${2:-import pytest}"
  BACKEND_PYTHON_CMD=""
  local candidate
  for candidate in "$root/backend/venv/bin/python" "$root/backend/.venv/bin/python"; do
    if [ -f "$candidate" ] && "$candidate" -c "$snippet" 2>/dev/null; then
      BACKEND_PYTHON_CMD="$candidate"
      return 0
    fi
  done
  if command -v python3 &>/dev/null && python3 -c "$snippet" 2>/dev/null; then
    BACKEND_PYTHON_CMD="python3"
    return 0
  fi
  echo "다음 import를 만족하는 Python이 없습니다: $snippet" >&2
  echo "backend/venv(또는 .venv)에 requirements 설치 후 재시도하세요." >&2
  return 1
}
