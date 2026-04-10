#!/bin/bash

# 궁극의 AI 시스템 시작 스크립트 (레거시 — 저장소에 ultimate_ai_system.py 없을 수 있음)
# CORBU 통합 대화·API: npm run restart:backend → http://localhost:5002

echo "🚀 궁극의 AI 시스템을 시작합니다..."

# 현재 디렉토리 확인
echo "📍 현재 디렉토리: $(pwd)"

# Python 버전 확인
echo "🐍 Python 버전: $(python3 --version)"

# 필요한 파일들 확인
if [ ! -f "ultimate_ai_system.py" ]; then
    echo "❌ ultimate_ai_system.py 파일을 찾을 수 없습니다."
    exit 1
fi

echo "✅ 모든 파일이 준비되었습니다."

# 서버 시작
echo "🌟 궁극의 AI 시스템 서버를 시작합니다..."
echo "📍 서버 주소: http://localhost:8000"
echo "🎯 대시보드: http://localhost:8000/dashboard"
echo "📚 API 문서: http://localhost:8000/docs"
echo ""
echo "서버를 중지하려면 Ctrl+C를 누르세요."
echo ""

# 서버 실행
python3 ultimate_ai_system.py
