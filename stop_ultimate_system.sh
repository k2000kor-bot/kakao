#!/bin/bash

# CORBU AI Ultimate System 중지 스크립트
echo "🛑 CORBU AI Ultimate System을 중지합니다..."

# Node.js 프로세스 중지
echo "🎨 프론트엔드 서버를 중지합니다..."
pkill -f "npm start"
pkill -f "react-scripts"

# Python 프로세스 중지
echo "🔧 백엔드 서버를 중지합니다..."
pkill -f "python main_server.py"
pkill -f "uvicorn"

# 포트 3000과 8000 사용 프로세스 중지
echo "🔌 포트를 정리합니다..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

    echo ""
echo "✅ CORBU AI Ultimate System이 성공적으로 중지되었습니다!"
    echo ""
echo "📊 시스템이 완전히 종료되었습니다."
echo "🔄 다시 시작하려면 ./start_ultimate_system.sh를 실행하세요."
        echo ""