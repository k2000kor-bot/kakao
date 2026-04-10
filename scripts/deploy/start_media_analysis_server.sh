#!/bin/bash

echo "🚀 미디어 분석 서버를 시작합니다..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
cd "$REPO_ROOT" || exit 1
backend_venv_activate "$REPO_ROOT" || true

echo "📁 필요한 디렉토리를 생성합니다..."
mkdir -p "$REPO_ROOT/uploads/media" "$REPO_ROOT/logs"

echo "🔧 의존성을 확인합니다..."
pip install fastapi uvicorn python-multipart

ADVANCED_MEDIA_ANALYSIS_PORT="${ADVANCED_MEDIA_ANALYSIS_PORT:-8001}"
export ADVANCED_MEDIA_ANALYSIS_PORT

echo "🌐 미디어 분석 API 서버를 시작합니다... (단독 프로세스)"
echo "💡 통합 백엔드: npm run restart:backend → http://localhost:5002"
echo "📍 미디어 분석 API: http://localhost:${ADVANCED_MEDIA_ANALYSIS_PORT} (ADVANCED_MEDIA_ANALYSIS_PORT)"
echo "서버를 중지하려면 Ctrl+C를 누르세요."
echo ""

exec python3 "$REPO_ROOT/backend/advanced_media_analysis_api.py"
