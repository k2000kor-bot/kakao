#!/bin/bash

# 모든 서버 실행 스크립트
echo "🚀 모든 서버를 시작합니다..."

# 백엔드 서버 실행
echo "📡 백엔드 서버 시작 중..."
python3 simple_working_chat.py &
BACKEND_PID=$!

# 잠시 대기
sleep 3

# React 앱 실행
echo "⚛️ React 앱 시작 중..."
npm start &
REACT_PID=$!

echo "✅ 모든 서버가 시작되었습니다!"
echo "📍 백엔드(simple_working_chat 등): 레거시 스크립트 — 통합 API는 http://localhost:5002 권장"
echo "📍 React 앱: http://localhost:3000"
echo ""
echo "프로세스 ID:"
echo "백엔드: $BACKEND_PID"
echo "React: $REACT_PID"
echo ""
echo "서버를 중지하려면 Ctrl+C를 누르세요"

# 프로세스 대기
wait
