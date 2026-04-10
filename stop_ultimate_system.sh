#!/bin/bash

# CORBU.AI Ultimate System 중지 스크립트
echo "🛑 CORBU.AI Ultimate System을 중지합니다..."

echo "🎨 프론트엔드 서버를 중지합니다..."
pkill -f "npm start" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true

echo "🔧 백엔드 서버를 중지합니다..."
pkill -f "python3 main_server.py" 2>/dev/null || true
pkill -f "python main_server.py" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true

echo "🔌 포트 정리 (3000, 5002, 8000)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5002 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

echo ""
echo "✅ CORBU.AI Ultimate System이 중지되었습니다."
echo "📊 시스템이 종료되었습니다."
echo "🔄 다시 시작: ./start_ultimate_system.sh 또는 npm run restart:backend"
echo ""
