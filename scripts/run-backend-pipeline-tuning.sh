#!/usr/bin/env bash
# 파이프라인 튜닝 API + 노트북 LLM context 파라미터 테스트 (venv Python 우선)
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=lib-backend-python.sh
source "$SCRIPT_DIR/lib-backend-python.sh"
backend_python_resolve "$ROOT" "import pytest, fastapi" || exit 1
cd "$ROOT/backend"

exec "$BACKEND_PYTHON_CMD" -m pytest \
  tests/test_pipeline_tuning_api.py \
  tests/test_notebook_llm_context_params.py \
  -q --tb=short "$@"
