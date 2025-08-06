#!/bin/bash

# CORBU AI 고도화된 자동 통합 시스템 시작 스크립트

echo "🚀 CORBU AI 고도화된 자동 통합 시스템을 시작합니다..."

# 필요한 디렉토리 생성
echo "📁 필요한 디렉토리를 생성합니다..."
mkdir -p backend/uploads
mkdir -p backend/knowledge_base
mkdir -p backend/models
mkdir -p logs

# Python 의존성 확인 및 설치
echo "🐍 Python 의존성을 확인합니다..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3가 설치되어 있지 않습니다."
    exit 1
fi

# 필요한 Python 패키지 설치
echo "📦 Python 패키지를 설치합니다..."
pip3 install fastapi uvicorn werkzeug

# 백엔드 서버 시작
echo "🔧 백엔드 서버를 시작합니다..."
cd backend

# 고도화된 통합 API 서버 시작 (포트 5003)
echo "🌐 고도화된 통합 API 서버를 시작합니다 (포트 5003)..."
python3 enhanced_integration_api.py &
ENHANCED_PID=$!

# 기존 통합 API 서버 시작 (포트 5002)
echo "🌐 기존 통합 API 서버를 시작합니다 (포트 5002)..."
python3 integrated_auto_learning_api.py &
INTEGRATED_PID=$!

# 기존 API 서버도 시작 (포트 5000)
echo "🌐 기존 API 서버를 시작합니다 (포트 5000)..."
python3 advanced_api_server.py &
LEGACY_PID=$!

cd ..

# 프론트엔드 개발 서버 시작
echo "⚛️ React 개발 서버를 시작합니다 (포트 3000)..."
npm start &
FRONTEND_PID=$!

# PID 파일에 저장
echo $ENHANCED_PID > .enhanced_backend.pid
echo $INTEGRATED_PID > .integrated_backend.pid
echo $LEGACY_PID > .legacy_backend.pid
echo $FRONTEND_PID > .frontend.pid

echo ""
echo "✅ 모든 서비스가 시작되었습니다!"
echo ""
echo "📊 서비스 상태:"
echo "   - 프론트엔드: http://localhost:3000"
echo "   - 고도화된 통합 API: http://localhost:5003"
echo "   - 기존 통합 API: http://localhost:5002"
echo "   - 기존 API: http://localhost:5000"
echo ""
echo "🔗 주요 엔드포인트:"
echo "   - 고도화된 업로드: POST /api/v3/upload-and-integrate"
echo "   - 통합 상태 조회: GET /api/v3/all-integration-status"
echo "   - 시스템 현황: GET /api/v3/system-overview"
echo "   - 실시간 모니터링: GET /api/v3/real-time-monitoring"
echo "   - 시스템 건강도: GET /api/v3/system-health"
echo ""
echo "🎯 고도화된 기능:"
echo "   - 6개 시스템 자동 연동"
echo "   - 실시간 진행 상황 모니터링"
echo "   - 시스템별 성공률 추적"
echo "   - 자동 알림 시스템"
echo "   - WebSocket 실시간 통신"
echo ""
echo "📝 로그 확인:"
echo "   - 백엔드 로그: tail -f logs/backend.log"
echo "   - 프론트엔드 로그: tail -f logs/frontend.log"
echo ""
echo "🛑 시스템 중지: ./stop_enhanced_integration_system.sh"
echo ""

# 서비스 상태 모니터링
echo "🔍 서비스 상태를 모니터링합니다..."
sleep 5

# 서비스 상태 확인
check_service() {
    local port=$1
    local service=$2
    if curl -s http://localhost:$port > /dev/null 2>&1; then
        echo "✅ $service (포트 $port) - 정상"
    else
        echo "❌ $service (포트 $port) - 오류"
    fi
}

check_service 3000 "프론트엔드"
check_service 5003 "고도화된 통합 API"
check_service 5002 "기존 통합 API"
check_service 5000 "기존 API"

echo ""
echo "🎉 고도화된 통합 시스템이 성공적으로 시작되었습니다!"
echo "브라우저에서 http://localhost:3000 을 열어 CORBU AI를 사용하세요."
echo ""
echo "💡 사용 방법:"
echo "   1. 파일을 업로드하면 6개 시스템이 자동으로 연동됩니다"
echo "   2. '통합 모니터링' 버튼을 클릭하여 실시간 진행 상황을 확인하세요"
echo "   3. 각 시스템의 성공률과 처리 상태를 실시간으로 모니터링할 수 있습니다"
echo ""

# 백그라운드에서 실행 중인 프로세스들을 유지
wait
