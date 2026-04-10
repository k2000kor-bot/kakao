#!/bin/bash
# Docker 컨테이너 엔트리포인트
# 기본: 통합 FastAPI main_server (BACKEND_PORT, 기본 5002)
# 레거시 UMKS: CORBU_DOCKER_ENTRY=umks
set -e

echo "🚀 CORBU.AI 프로덕션 서버 시작"
echo "=================================="

export PYTHONPATH="/app/backend"
export NODE_ENV="production"

BACKEND_PORT="${BACKEND_PORT:-5002}"
CORBU_DOCKER_ENTRY="${CORBU_DOCKER_ENTRY:-main}"

cd /app/backend || exit 1

if [ "$CORBU_DOCKER_ENTRY" = "umks" ]; then
    echo "📡 (레거시) UMKS 백엔드 시작 — 포트 8001"
    python3 ultimate_media_knowledge_system.py &
    BACKEND_PID=$!
    echo "⏳ 서버 시작 대기 중..."
    sleep 10
    echo "🔍 서버 상태 확인 중..."
    if curl -sf "http://localhost:8001/api/v1/health" > /dev/null 2>&1; then
        echo "✅ UMKS 서버 (8001) 정상"
    else
        echo "❌ UMKS 서버 시작 실패 (헬스체크)"
    fi
else
    echo "📡 통합 백엔드 main_server — 포트 ${BACKEND_PORT}"
    export PORT="$BACKEND_PORT"
    export API_PORT="$BACKEND_PORT"
    python3 main_server.py &
    BACKEND_PID=$!
    echo "⏳ 서버 시작 대기 중..."
    for _ in $(seq 1 30); do
        if curl -sf "http://localhost:${BACKEND_PORT}/api/health" > /dev/null 2>&1; then
            echo "✅ 통합 서버 (${BACKEND_PORT}) 정상"
            break
        fi
        sleep 1
    done
    if ! curl -sf "http://localhost:${BACKEND_PORT}/api/health" > /dev/null 2>&1; then
        echo "⚠️ 통합 서버 헬스체크 실패 — 로그 확인"
    fi
fi

echo "🌐 Nginx 웹 서버 시작"
nginx -g "daemon off;" &
NGINX_PID=$!

cleanup() {
    echo "🛑 서버 종료 중..."
    kill "$BACKEND_PID" "$NGINX_PID" 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

echo "🎉 CORBU.AI 프로덕션 서버 가동 완료!"
echo "=================================="
echo "🌐 웹 인터페이스: http://localhost"
echo "🧪 테스트 페이지: http://localhost/test.html"
echo "📊 API 게이트웨이: http://localhost:8080"
if [ "$CORBU_DOCKER_ENTRY" != "umks" ]; then
    echo "📖 통합 API: http://localhost:${BACKEND_PORT}/api/docs"
    echo "🔍 헬스: http://localhost:${BACKEND_PORT}/api/health"
else
    echo "📖 (UMKS) API: http://localhost:8001/docs"
fi
echo "=================================="

wait
