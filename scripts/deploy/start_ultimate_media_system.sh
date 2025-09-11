#!/bin/bash

# 궁극의 미디어 지식 활용 시스템 시작 스크립트

echo "🚀 궁극의 미디어 지식 활용 시스템을 시작합니다..."

# 필요한 디렉토리 생성
mkdir -p uploads
mkdir -p processed_media
mkdir -p logs

# Python 가상환경 확인 및 활성화
if [ -d "venv" ]; then
    echo "📦 가상환경을 활성화합니다..."
    source venv/bin/activate
else
    echo "⚠️ 가상환경이 없습니다. 새로 생성합니다..."
    python3 -m venv venv
    source venv/bin/activate
fi

# 필요한 패키지 설치
echo "📦 필요한 패키지를 설치합니다..."
pip install fastapi uvicorn python-multipart
pip install opencv-python-headless pillow pytesseract
pip install transformers torch sentence-transformers
pip install easyocr
pip install numpy openpyxl python-docx PyPDF2
pip install speechrecognition pydub
pip install aiofiles

# 백엔드 서버 시작
echo "🔧 백엔드 서버를 시작합니다..."
python backend/ultimate_media_knowledge_system.py &

# 서버 시작 대기
sleep 3

# 서버 상태 확인
echo "🔍 서버 상태를 확인합니다..."
curl -s http://localhost:8001/api/v1/health || echo "서버가 아직 시작되지 않았습니다."

echo "✅ 궁극의 미디어 지식 활용 시스템이 시작되었습니다!"
echo "🌐 백엔드 API: http://localhost:8001"
echo "📚 API 문서: http://localhost:8001/docs"
echo ""
echo "프론트엔드에서 다음 URL로 연결하세요:"
echo "http://localhost:3000"
echo ""
echo "서버를 중지하려면: Ctrl+C"
