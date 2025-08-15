#!/bin/bash
set -e

echo "🚀 CORBU AI 프로덕션 서버 시작"
echo "=================================="

# 환경 변수 설정
export PYTHONPATH="/app/backend"
export NODE_ENV="production"

# 백엔드 UMKS 서버 시작 (포트: 8001)
echo "📡 UMKS 백엔드 서버 시작 중... (8001)"
cd /app/backend
python3 ultimate_media_knowledge_system.py &
UMKS_PID=$!

# 서버 상태 확인
echo "⏳ 서버 시작 대기 중..."
sleep 10

# 헬스체크
echo "🔍 서버 상태 확인 중..."
if curl -f http://localhost:8001/api/v1/health > /dev/null 2>&1; then
    echo "✅ UMKS 서버 (8001) 정상"
else
    echo "❌ UMKS 서버 시작 실패"
fi

# Nginx 시작
echo "🌐 Nginx 웹 서버 시작"
nginx -g "daemon off;" &
NGINX_PID=$!

# 프로세스 관리
cleanup() {
    echo "🛑 서버 종료 중..."
    kill $UMKS_PID $NGINX_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# 서버 정보 출력
echo "🎉 CORBU AI 프로덕션 서버 가동 완료!"
echo "=================================="
echo "🌐 웹 인터페이스: http://localhost"
echo "🧪 테스트 페이지: http://localhost/test.html"
echo "📊 API 게이트웨이: http://localhost:8080"
echo "📖 API 문서: http://localhost:8006/docs"
echo "=================================="

# 무한 대기 (컨테이너 유지)
wait
