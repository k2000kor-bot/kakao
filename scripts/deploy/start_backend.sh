#!/bin/bash

echo "🚀 CORBU AI 백엔드 시스템 시작..."

# 가상환경 활성화
if [ -d "venv" ]; then
    echo "📦 가상환경 활성화 중..."
    source venv/bin/activate
else
    echo "❌ 가상환경을 찾을 수 없습니다. 먼저 가상환경을 생성해주세요."
    exit 1
fi

# 필요한 패키지 설치 확인
echo "📋 필요한 패키지 설치 확인 중..."
pip install -q fastapi uvicorn pydantic aiofiles

# 포트 사용 중인지 확인
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  포트 $port가 이미 사용 중입니다."
        return 1
    else
        return 0
    fi
}

# 기존 프로세스 종료
echo "🔄 기존 프로세스 종료 중..."
pkill -f "comprehensive_message_api.py" 2>/dev/null || true
pkill -f "advanced_message_server.py" 2>/dev/null || true
pkill -f "analysis_server.py" 2>/dev/null || true

# 잠시 대기
sleep 2

# 포트 확인 및 서버 시작
echo "🌐 서버 시작 중..."

# 종합 메시지 API 서버 (포트 8001)
if check_port 8001; then
    echo "✅ 종합 메시지 API 서버 시작 (포트 8001)..."
    python backend/comprehensive_message_api.py &
    echo $! > logs/comprehensive_api.pid
    sleep 3
else
    echo "❌ 포트 8001을 사용할 수 없습니다."
fi

# 고급 메시지 서버 (포트 8002)
if check_port 8002; then
    echo "✅ 고급 메시지 서버 시작 (포트 8002)..."
    python backend/advanced_message_server.py &
    echo $! > logs/advanced_message.pid
    sleep 3
else
    echo "❌ 포트 8002를 사용할 수 없습니다."
fi

# 분석 서버 (포트 8003)
if check_port 8003; then
    echo "✅ 분석 서버 시작 (포트 8003)..."
    python backend/analysis_server.py &
    echo $! > logs/analysis_server.pid
    sleep 3
else
    echo "❌ 포트 8003을 사용할 수 없습니다."
fi

# 서버 상태 확인
echo "🔍 서버 상태 확인 중..."
sleep 5

check_server() {
    local port=$1
    local name=$2
    if curl -s http://localhost:$port/ > /dev/null 2>&1; then
        echo "✅ $name (포트 $port) - 정상 작동"
    else
        echo "❌ $name (포트 $port) - 연결 실패"
    fi
}

check_server 8001 "종합 메시지 API"
check_server 8002 "고급 메시지 서버"
check_server 8003 "분석 서버"

echo ""
echo "🎯 백엔드 시스템 시작 완료!"
echo "📖 API 문서:"
echo "   - 종합 메시지 API: http://localhost:8001/docs"
echo "   - 고급 메시지 서버: http://localhost:8002/docs"
echo "   - 분석 서버: http://localhost:8003/docs"
echo ""
echo "🔗 WebSocket 연결:"
echo "   - ws://localhost:8001/ws"
echo ""
echo "📊 로그 파일:"
echo "   - 종합 API: logs/comprehensive_api.log"
echo "   - 고급 메시지: logs/advanced_message.log"
echo "   - 분석 서버: logs/analysis_server.log"
echo ""
echo "💡 프론트엔드와 연결하려면:"
echo "   npm start"
echo ""
echo "🛑 서버 중지: ./stop_backend.sh"
