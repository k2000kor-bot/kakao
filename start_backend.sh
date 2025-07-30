#!/bin/bash
echo "🚀 백엔드 서버 시작 중..."
cd "$(dirname "$0")"
source .venv/bin/activate
cd backend
echo "서버가 http://localhost:8007 에서 실행됩니다."
python simple_message_generator.py
