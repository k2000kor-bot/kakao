#!/bin/bash

echo "🚀 미디어 분석 서버를 시작합니다..."

# Python 가상환경 활성화 (있는 경우)
if [ -d "venv" ]; then
    echo "📦 가상환경을 활성화합니다..."
    source venv/bin/activate
fi

# 필요한 디렉토리 생성
echo "📁 필요한 디렉토리를 생성합니다..."
mkdir -p uploads/media
mkdir -p logs

# 의존성 설치 확인
echo "🔧 의존성을 확인합니다..."
pip install fastapi uvicorn python-multipart

# 서버 시작
echo "🌐 미디어 분석 API 서버를 시작합니다..."
echo "📍 서버 주소: http://localhost:8001"
echo "📚 API 문서: http://localhost:8001/docs"
echo ""
echo "서버를 중지하려면 Ctrl+C를 누르세요."
echo ""

python backend/advanced_media_analysis_api.py 