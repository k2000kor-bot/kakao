#!/bin/bash

# 통합 API 서버 시작 스크립트 (main_server, 기본 포트 BACKEND_PORT/5002)

echo "🚀 CORBU.AI 통합 API 서버를 시작합니다..."
echo "📍 기본 주소: http://localhost:${BACKEND_PORT:-5002} (환경변수 BACKEND_PORT)"
echo "📚 API 문서: /api/docs"
echo "🔗 통합 API: /api/integrated"
echo "💡 권장: 프로젝트 루트에서 npm run restart:backend"
echo ""

# 현재 디렉토리로 이동
cd "$(dirname "$0")"

# Python 경로 확인
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3를 찾을 수 없습니다."
    exit 1
fi

# 필요한 패키지 확인
echo "📦 필요한 패키지를 확인합니다..."
python3 -c "import fastapi, uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  필요한 패키지가 설치되지 않았습니다. 설치 중..."
    pip3 install fastapi uvicorn
fi

# 서버 시작
echo "✅ 서버를 시작합니다..."
echo ""
python3 main_server.py
