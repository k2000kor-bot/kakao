#!/bin/bash

# 문맥 분석 AI 엔진 서버 실행 스크립트

echo "🚀 문맥 분석 AI 엔진 서버를 시작합니다..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
cd "$REPO_ROOT" || exit 1
backend_venv_activate "$REPO_ROOT" || true

echo "📋 필요한 패키지를 확인합니다..."
pip install fastapi uvicorn pydantic

echo "🔧 문맥 분석 AI 엔진 서버를 포트 8003에서 실행합니다..."
cd "$REPO_ROOT/backend" || exit 1
exec python3 contextual_ai_engine.py
