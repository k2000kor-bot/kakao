#!/usr/bin/env bash
# Q→A 파이프라인 스모크: venv Python 우선 (pytest import 성공하는 인터프리터)
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=lib-backend-python.sh
source "$SCRIPT_DIR/lib-backend-python.sh"
backend_python_resolve "$ROOT" "import pytest" || exit 1
cd "$ROOT/backend"

exec "$BACKEND_PYTHON_CMD" -m pytest \
  tests/test_generation_scenario.py \
  tests/test_orchestrator_verifier_rewrite.py \
  tests/test_writer_verifier_polish_hints.py \
  tests/test_verifier.py \
  tests/test_router_grounding_keywords.py \
  tests/test_planner_make_spec.py \
  tests/test_llm_service_helpers.py \
  -q --tb=short "$@"
