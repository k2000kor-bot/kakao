#!/bin/bash

echo "🚀 CORBU AI 통합 대화 서버를 시작합니다..."

# 가상환경 활성화 (있는 경우)
if [ -d "venv" ]; then
    echo "📦 가상환경을 활성화합니다..."
    source venv/bin/activate
fi

# 필요한 디렉토리 생성
echo "📁 필요한 디렉토리를 생성합니다..."
mkdir -p uploads
mkdir -p logs

# 의존성 설치
echo "📦 필요한 패키지를 설치합니다..."
pip install fastapi uvicorn python-multipart sqlite3

# 서버 시작
echo "🌐 통합 대화 API 서버를 시작합니다..."
echo "📍 서버 주소: http://localhost:8001"
echo "📚 API 문서: http://localhost:8001/docs"
echo "🔧 관리자 패널: http://localhost:8001/redoc"

# 백그라운드에서 서버 실행
python backend/unified_conversation_api.py &

# 서버 프로세스 ID 저장
echo $! > .unified_conversation_server.pid

echo "✅ 서버가 성공적으로 시작되었습니다!"
echo "💡 서버를 중지하려면: ./stop_unified_conversation_server.sh"
echo "📊 로그를 확인하려면: tail -f logs/unified_conversation.log" 