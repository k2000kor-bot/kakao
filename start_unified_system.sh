#!/bin/bash

echo "🚀 카카오톡 AI 분석 시스템 - 통합 버전"
echo "=================================================="
echo "📍 모든 기능이 포트 8000에서 통합 실행됩니다"
echo ""

# 프로젝트 루트로 이동
cd "$(dirname "$0")"

# 기존 프로세스 종료
echo "🛑 기존 프로세스 종료 중..."
pkill -f "python.*server" 2>/dev/null
pkill -f "node.*start.js" 2>/dev/null
sleep 2

# 백엔드 의존성 확인
echo "📦 백엔드 의존성 확인 중..."
if [ ! -d "backend/venv" ]; then
    echo "⚠️  가상환경이 없습니다. requirements.txt만 설치합니다."
    cd backend
    pip3 install -r requirements.txt --user
    cd ..
else
    echo "✅ 가상환경 확인됨"
fi

# 프론트엔드 의존성 확인
echo "📦 프론트엔드 의존성 확인 중..."
if [ ! -d "node_modules" ]; then
    echo "📦 npm 의존성 설치 중..."
    npm install
else
    echo "✅ node_modules 확인됨"
fi

# 통합 서버 시작
echo "🚀 통합 서버 시작 중..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
fi
python3 ultimate_integrated_server.py &
SERVER_PID=$!
cd ..

# 서버 시작 대기
echo "⏳ 서버 시작 대기 중..."
sleep 5

# 서버 상태 확인
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 통합 서버 시작 완료 (포트 8000)"
else
    echo "❌ 서버 시작 실패"
    exit 1
fi

# 프론트엔드 시작
echo "🚀 프론트엔드 시작 중..."
npm start &
FRONTEND_PID=$!

# 프론트엔드 시작 대기
sleep 10

# 전체 상태 확인
echo ""
echo "🎯 시스템 상태 확인:"
echo "=================================================="

# 백엔드 상태
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ 백엔드 서버: http://localhost:8000"
else
    echo "❌ 백엔드 서버 오류"
fi

# 프론트엔드 상태
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 프론트엔드: http://localhost:3000"
else
    echo "❌ 프론트엔드 오류"
fi

echo ""
echo "🎯 주요 엔드포인트:"
echo "   📖 API 문서: http://localhost:8000/docs"
echo "   🏠 메인 페이지: http://localhost:3000"
echo "   💬 카카오톡 대화 대응: http://localhost:3000/#/real-kakao"
echo "   📁 파일 업로드: http://localhost:3000/#/upload"
echo ""
echo "🔄 시스템이 실행 중입니다. 종료하려면 Ctrl+C를 누르세요."
echo ""

# 프로세스 종료 처리
cleanup() {
    echo ""
    echo "🛑 시스템 종료 중..."
    kill $SERVER_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "python.*ultimate_integrated_server" 2>/dev/null
    pkill -f "node.*start.js" 2>/dev/null
    echo "✅ 시스템 종료 완료"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 대기
wait 