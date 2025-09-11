#!/bin/bash

# 고도화된 대화형 인터페이스 서버 시작 스크립트
# Enhanced Conversational Interface Server Startup Script

echo "🚀 고도화된 대화형 인터페이스 서버를 시작합니다..."
echo "Starting Enhanced Conversational Interface Server..."

# 가상환경 활성화 (있는 경우)
if [ -d "venv" ]; then
    echo "📦 가상환경을 활성화합니다..."
    source venv/bin/activate
fi

# 필요한 패키지 설치 확인
echo "📋 필요한 패키지를 확인합니다..."
pip install fastapi uvicorn pydantic

# 서버 시작
echo "🌐 고도화된 대화형 API 서버를 포트 8003에서 시작합니다..."
python backend/enhanced_conversational_api.py &

# 서버 상태 확인
sleep 3
echo "✅ 서버 상태 확인 중..."
curl -s http://localhost:8003/api/v2/enhanced/health

echo ""
echo "🎉 고도화된 대화형 인터페이스 서버가 시작되었습니다!"
echo "📍 서버 주소: http://localhost:8003"
echo "📚 API 문서: http://localhost:8003/docs"
echo "🔗 WebSocket: ws://localhost:8003/ws/v2/enhanced/{conversation_id}"
echo ""
echo "✨ 새로운 기능들:"
echo "• 🧠 실시간 감정 분석"
echo "• 💡 지능형 인사이트 생성"
echo "• 📊 고급 대화 분석"
echo "• 🎯 맥락 기반 응답"
echo "• 🔄 적응형 학습"
echo "• 🌐 멀티모달 지원"
echo ""
echo "�� 서버를 중지하려면: Ctrl+C" 