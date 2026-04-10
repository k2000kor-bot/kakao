#!/bin/bash

ULTIMATE_HTTP_PORT="${ULTIMATE_HTTP_PORT:-8000}"
export ULTIMATE_HTTP_PORT
ADVANCED_WS_PORT="${ADVANCED_WS_PORT:-8001}"
export ADVANCED_WS_PORT

echo "🚀 카카오톡 AI 분석 시스템 - 통합 버전"
echo "=================================================="
echo "💡 일상 개발·프론트 연동: 프로젝트 루트에서 npm run restart:backend (포트 5002, main_server)"
echo "   이 스크립트는 ultimate_integrated_server(HTTP ${ULTIMATE_HTTP_PORT}) + WebSocket(${ADVANCED_WS_PORT}) 등 레거시 다중 프로세스용입니다."
echo "📍 통합 HTTP 포트 변경: ULTIMATE_HTTP_PORT (기본 ${ULTIMATE_HTTP_PORT})"
echo "📍 레거시 WebSocket 포트 변경: ADVANCED_WS_PORT (기본 ${ADVANCED_WS_PORT})"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
cd "$REPO_ROOT" || exit 1

# 기존 프로세스 종료
echo "🛑 기존 프로세스 종료 중..."
pkill -f "python.*server" 2>/dev/null
pkill -f "node.*start.js" 2>/dev/null
sleep 2

# 백엔드 의존성 확인
echo "📦 백엔드 의존성 확인 중..."
if [ ! -d "$REPO_ROOT/backend/venv" ] && [ ! -d "$REPO_ROOT/backend/.venv" ]; then
    echo "⚠️  backend venv가 없습니다. requirements.txt만 사용자 영역에 설치합니다."
    ( cd "$REPO_ROOT/backend" && pip3 install -r requirements.txt --user )
else
    echo "✅ backend 가상환경 확인됨"
fi

backend_venv_activate "$REPO_ROOT" || echo "⚠️  venv 활성화 실패 — 시스템 Python 사용"

# 프론트엔드 의존성 확인
echo "📦 프론트엔드 의존성 확인 중..."
if [ ! -d "$REPO_ROOT/node_modules" ]; then
    echo "📦 npm 의존성 설치 중..."
    npm install
else
    echo "✅ node_modules 확인됨"
fi

# WebSocket 서버 시작
echo "🔌 WebSocket 서버 시작 중..."
( cd "$REPO_ROOT/backend" && python3 advanced_websocket_server.py ) &
WEBSOCKET_PID=$!

# 통합 서버 시작
echo "🚀 통합 서버 시작 중..."
( cd "$REPO_ROOT/backend" && python3 ultimate_integrated_server.py ) &
SERVER_PID=$!

# 서버 시작 대기
echo "⏳ 서버 시작 대기 중..."
sleep 5

# WebSocket 서버 상태 확인
echo "🔌 WebSocket 서버 상태 확인 중..."
if netstat -an | grep ":${ADVANCED_WS_PORT}" | grep "LISTEN" > /dev/null; then
    echo "✅ WebSocket 서버 시작 완료 (포트 ${ADVANCED_WS_PORT})"
else
    echo "⚠️  WebSocket 서버 상태 확인 실패 (포트 ${ADVANCED_WS_PORT})"
fi

# 서버 상태 확인 (ULTIMATE_HTTP_PORT 와 일치)
if curl -s "http://localhost:${ULTIMATE_HTTP_PORT}/health" > /dev/null; then
    echo "✅ 통합 서버 시작 완료 (포트 ${ULTIMATE_HTTP_PORT})"
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
if curl -s "http://localhost:${ULTIMATE_HTTP_PORT}/health" > /dev/null; then
    echo "✅ 백엔드 서버: http://localhost:${ULTIMATE_HTTP_PORT}"
else
    echo "❌ 백엔드 서버 오류"
fi

# WebSocket 서버 상태
if netstat -an | grep ":${ADVANCED_WS_PORT}" | grep "LISTEN" > /dev/null; then
    echo "✅ WebSocket 서버: ws://localhost:${ADVANCED_WS_PORT}"
else
    echo "❌ WebSocket 서버 오류"
fi

# 프론트엔드 상태
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 프론트엔드: http://localhost:3000"
else
    echo "❌ 프론트엔드 오류"
fi

echo ""
echo "🎯 주요 엔드포인트:"
echo "   📖 API 문서: http://localhost:${ULTIMATE_HTTP_PORT}/docs"
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
    kill $WEBSOCKET_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "python.*ultimate_integrated_server" 2>/dev/null
    pkill -f "python.*advanced_websocket_server" 2>/dev/null
    pkill -f "node.*start.js" 2>/dev/null
    echo "✅ 시스템 종료 완료"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 대기
wait 