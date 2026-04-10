#!/usr/bin/env bash
# 백엔드 pytest (venv 우선 — lib-backend-python.sh)
# 사용: npm run test:backend
# 인자 없음: tests/ 전체, -v --tb=short
# 인자 있음: npm run test:backend -- tests/foo.py -q  → 해당 인자만 전달(pytest 기본 addopts는 pytest.ini)
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=lib-backend-python.sh
source "$SCRIPT_DIR/lib-backend-python.sh"
backend_python_resolve "$ROOT" "import pytest" || exit 1
cd "$ROOT/backend"
if [ "$#" -eq 0 ]; then
  exec "$BACKEND_PYTHON_CMD" -m pytest tests/ -v --tb=short
fi
exec "$BACKEND_PYTHON_CMD" -m pytest "$@"
