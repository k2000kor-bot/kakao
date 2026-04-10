#!/bin/bash

# 고도화된 대화형 인터페이스 — 단독 프로세스 (디버깅용)
# 권장: 통합 API만 사용 — npm run restart:backend (포트 5002, /api/v2/enhanced 이미 포함)

echo "🚀 고도화된 대화형 인터페이스 서버를 시작합니다... (단독 모드)"
echo "Starting Enhanced Conversational Interface Server (standalone)..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
cd "$REPO_ROOT" || exit 1
backend_venv_activate "$REPO_ROOT" || true

echo "📋 필요한 패키지를 확인합니다..."
pip install fastapi uvicorn pydantic

PORT="${ENHANCED_CONV_PORT:-8003}"
export ENHANCED_CONV_PORT="$PORT"
echo "🌐 고도화된 대화형 API 서버를 포트 ${PORT}에서 시작합니다..."
python3 "$REPO_ROOT/backend/enhanced_conversational_api.py" &

sleep 3
echo "✅ 서버 상태 확인 중..."
curl -s "http://localhost:${PORT}/api/v2/enhanced/health"

echo ""
echo "🎉 고도화된 대화형 인터페이스 서버가 시작되었습니다!"
echo "📍 서버 주소: http://localhost:${PORT}"
echo "📚 API 문서: http://localhost:${PORT}/docs"
echo "🔗 WebSocket: ws://localhost:${PORT}/ws/v2/enhanced/{conversation_id}"
echo ""
echo "✨ 새로운 기능들:"
echo "• 🧠 실시간 감정 분석"
echo "• 💡 지능형 인사이트 생성"
echo "• 📊 고급 대화 분석"
echo "• 🎯 맥락 기반 응답"
echo "• 🔄 적응형 학습"
echo "• 🌐 멀티모달 지원"
echo ""
echo "🛑 서버를 중지하려면: Ctrl+C"
