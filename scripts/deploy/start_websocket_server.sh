#!/bin/bash

echo "🚀 WebSocket 서버를 시작합니다..."

# Python 가상환경 활성화
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ 가상환경이 활성화되었습니다."
else
    echo "⚠️  가상환경을 찾을 수 없습니다. 시스템 Python을 사용합니다."
fi

# 필요한 패키지 설치 확인
echo "📦 필요한 패키지를 확인합니다..."
pip install websockets

# WebSocket 서버 시작
echo "🔌 WebSocket 서버를 시작합니다 (포트 8001)..."
python backend/advanced_websocket_server.py 