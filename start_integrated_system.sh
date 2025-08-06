#!/bin/bash

# CORBU AI 통합 자동 학습 시스템 시작 스크립트

echo "🚀 CORBU AI 통합 자동 학습 시스템을 시작합니다..."

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
pip3 install fastapi uvicorn sqlite3 werkzeug

# 백엔드 서버 시작
echo "🔧 백엔드 서버를 시작합니다..."
cd backend

# 통합 자동 학습 API 서버 시작
echo "🌐 통합 자동 학습 API 서버를 시작합니다 (포트 5002)..."
python3 integrated_auto_learning_api.py &
BACKEND_PID=$!

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
echo $BACKEND_PID > .integrated_backend.pid
echo $LEGACY_PID > .legacy_backend.pid
echo $FRONTEND_PID > .frontend.pid

echo ""
echo "✅ 모든 서비스가 시작되었습니다!"
echo ""
echo "📊 서비스 상태:"
echo "   - 프론트엔드: http://localhost:3000"
echo "   - 통합 API: http://localhost:5002"
echo "   - 기존 API: http://localhost:5000"
echo ""
echo "🔗 주요 엔드포인트:"
echo "   - 통합 업로드: POST /api/v2/upload-and-learn"
echo "   - 학습 진행상황: GET /api/v2/learning-progress/{session_id}"
echo "   - 지식 베이스: GET /api/v2/knowledge-base/{project_id}"
echo "   - AI 모델 상태: GET /api/v2/ai-models/status"
echo ""
echo "📝 로그 확인:"
echo "   - 백엔드 로그: tail -f logs/backend.log"
echo "   - 프론트엔드 로그: tail -f logs/frontend.log"
echo ""
echo "🛑 시스템 중지: ./stop_integrated_system.sh"
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
check_service 5002 "통합 API"
check_service 5000 "기존 API"

echo ""
echo "🎉 시스템이 성공적으로 시작되었습니다!"
echo "브라우저에서 http://localhost:3000 을 열어 CORBU AI를 사용하세요."
echo ""

# 백그라운드에서 실행 중인 프로세스들을 유지
wait 