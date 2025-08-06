#!/bin/bash

# CORBU AI 고도화된 자동 통합 시스템 중지 스크립트

echo "🛑 CORBU AI 고도화된 자동 통합 시스템을 중지합니다..."

# PID 파일에서 프로세스 ID 읽기
if [ -f ".enhanced_backend.pid" ]; then
    ENHANCED_PID=$(cat .enhanced_backend.pid)
    echo "🔧 고도화된 통합 API 서버를 중지합니다 (PID: $ENHANCED_PID)..."
    kill -TERM $ENHANCED_PID 2>/dev/null || true
    rm -f .enhanced_backend.pid
fi

if [ -f ".integrated_backend.pid" ]; then
    INTEGRATED_PID=$(cat .integrated_backend.pid)
    echo "🔧 기존 통합 API 서버를 중지합니다 (PID: $INTEGRATED_PID)..."
    kill -TERM $INTEGRATED_PID 2>/dev/null || true
    rm -f .integrated_backend.pid
fi

if [ -f ".legacy_backend.pid" ]; then
    LEGACY_PID=$(cat .legacy_backend.pid)
    echo "🔧 기존 API 서버를 중지합니다 (PID: $LEGACY_PID)..."
    kill -TERM $LEGACY_PID 2>/dev/null || true
    rm -f .legacy_backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "⚛️ 프론트엔드 서버를 중지합니다 (PID: $FRONTEND_PID)..."
    kill -TERM $FRONTEND_PID 2>/dev/null || true
    rm -f .frontend.pid
fi

# 포트를 사용하는 모든 프로세스 강제 종료
echo "🧹 포트를 사용하는 프로세스를 정리합니다..."

# 포트 3000 (프론트엔드)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "포트 3000 프로세스를 종료합니다..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# 포트 5003 (고도화된 통합 API)
if lsof -Pi :5003 -sTCP:LISTEN -t >/dev/null ; then
    echo "포트 5003 프로세스를 종료합니다..."
    lsof -ti:5003 | xargs kill -9 2>/dev/null || true
fi

# 포트 5002 (기존 통합 API)
if lsof -Pi :5002 -sTCP:LISTEN -t >/dev/null ; then
    echo "포트 5002 프로세스를 종료합니다..."
    lsof -ti:5002 | xargs kill -9 2>/dev/null || true
fi

# 포트 5000 (기존 API)
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "포트 5000 프로세스를 종료합니다..."
    lsof -ti:5000 | xargs kill -9 2>/dev/null || true
fi

# Node.js 프로세스 정리
echo "🧹 Node.js 프로세스를 정리합니다..."
pkill -f "node.*start" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true

# Python 프로세스 정리
echo "🧹 Python 프로세스를 정리합니다..."
pkill -f "python3.*enhanced_integration_api" 2>/dev/null || true
pkill -f "python3.*integrated_auto_learning_api" 2>/dev/null || true
pkill -f "python3.*advanced_api_server" 2>/dev/null || true
pkill -f "uvicorn.*enhanced_integration_api" 2>/dev/null || true
pkill -f "uvicorn.*integrated_auto_learning_api" 2>/dev/null || true

echo ""
echo "✅ 모든 서비스가 중지되었습니다!"
echo ""
echo "📊 정리된 서비스:"
echo "   - 프론트엔드 서버 (포트 3000)"
echo "   - 고도화된 통합 API 서버 (포트 5003)"
echo "   - 기존 통합 API 서버 (포트 5002)"
echo "   - 기존 API 서버 (포트 5000)"
echo ""
echo "🔄 시스템을 다시 시작하려면: ./start_enhanced_integration_system.sh"
echo ""
