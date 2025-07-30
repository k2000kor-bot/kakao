#!/bin/bash

# 미진행 개발을 위한 의존성 설치 스크립트

echo "🚀 미진행 개발 의존성 설치 시작..."

# Python 가상환경 활성화 (있는 경우)
if [ -d "venv" ]; then
    echo "📦 가상환경 활성화..."
    source venv/bin/activate
fi

# 기본 Python 패키지들
echo "📦 기본 Python 패키지 설치..."
pip install --upgrade pip
pip install fastapi uvicorn python-multipart aiofiles python-dotenv

# OCR 및 이미지 처리
echo "📦 OCR 및 이미지 처리 라이브러리 설치..."
pip install Pillow pytesseract

# 음성 인식
echo "📦 음성 인식 라이브러리 설치..."
pip install openai-whisper

# 문서 처리
echo "📦 문서 처리 라이브러리 설치..."
pip install PyPDF2 python-docx pandas openpyxl python-pptx

# AI 모델
echo "📦 AI 모델 라이브러리 설치..."
pip install transformers sentence-transformers torch numpy

# 한국어 처리
echo "📦 한국어 처리 라이브러리 설치..."
pip install konlpy kss

# 머신러닝
echo "📦 머신러닝 라이브러리 설치..."
pip install scikit-learn faiss-cpu

# 이미지 처리 고급 기능
echo "📦 이미지 처리 고급 기능 설치..."
pip install opencv-python

# 비디오 처리
echo "📦 비디오 처리 라이브러리 설치..."
pip install ffmpeg-python

# 웹 스크래핑
echo "📦 웹 스크래핑 라이브러리 설치..."
pip install selenium requests-html

# 보안
echo "📦 보안 라이브러리 설치..."
pip install cryptography passlib

# 로깅 및 모니터링
echo "📦 로깅 및 모니터링 라이브러리 설치..."
pip install structlog prometheus-client

# 추가 유틸리티
echo "📦 추가 유틸리티 설치..."
pip install requests beautifulsoup4

echo "✅ 모든 의존성 설치 완료!"
echo ""
echo "🔧 다음 단계:"
echo "1. OpenAI API 키 설정: export OPENAI_API_KEY='your-api-key'"
echo "2. Tesseract OCR 설치 (macOS): brew install tesseract"
echo "3. Tesseract OCR 설치 (Ubuntu): sudo apt-get install tesseract-ocr"
echo "4. FFmpeg 설치 (macOS): brew install ffmpeg"
echo "5. FFmpeg 설치 (Ubuntu): sudo apt-get install ffmpeg"
echo ""
echo "🚀 서버 시작: python backend/advanced_api_server.py" 