#!/bin/bash

# CORBU AI Backend API 시작 스크립트

echo "🚀 CORBU AI Backend API 시작 중..."

# Python 가상환경 확인
if [ -d "venv" ]; then
    echo "📦 가상환경 활성화 중..."
    source venv/bin/activate
elif [ -d "../venv" ]; then
    echo "📦 가상환경 활성화 중..."
    source ../venv/bin/activate
fi

# 의존성 확인
echo "🔍 의존성 확인 중..."
python -c "import fastapi, uvicorn, pydantic, psutil" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  필요한 패키지가 설치되지 않았습니다."
    echo "📥 의존성 설치 중..."
    pip install -r requirements.txt
fi

# 환경 변수 설정 (기본값)
export API_PORT=${API_PORT:-5001}
export API_HOST=${API_HOST:-0.0.0.0}
export DEBUG=${DEBUG:-false}
export RELOAD=${RELOAD:-true}

echo "📍 서버 설정:"
echo "   - 포트: $API_PORT"
echo "   - 호스트: $API_HOST"
echo "   - 디버그 모드: $DEBUG"
echo ""

# 서버 시작
python app.py

