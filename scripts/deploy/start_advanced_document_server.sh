#!/bin/bash

# 고급 문서 처리 서버 실행 스크립트

echo "🚀 고급 문서 처리 서버를 시작합니다..."

# Python 가상환경 활성화 (있는 경우)
if [ -d "venv" ]; then
    echo "📦 가상환경을 활성화합니다..."
    source venv/bin/activate
elif [ -d ".venv" ]; then
    echo "📦 가상환경을 활성화합니다..."
    source .venv/bin/activate
fi

# 필요한 패키지 설치 확인
echo "📋 필요한 패키지를 확인합니다..."
python3 -m pip install --break-system-packages fastapi uvicorn pydantic

# 서버 실행
echo "🔧 고급 문서 처리 서버를 포트 8005에서 실행합니다..."
cd backend
python3 advanced_document_processor.py

echo "✅ 고급 문서 처리 서버가 시작되었습니다!"
echo "🌐 서버 주소: http://localhost:8005"
echo "📊 API 문서: http://localhost:8005/docs"
echo "📈 처리 통계: http://localhost:8005/api/v9/stats"
