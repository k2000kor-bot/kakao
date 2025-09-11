#!/bin/bash

echo "🔓 === 루팅폰 카카오톡 데이터 수신 서버 시작 === 🔓"
echo ""

# 가상환경 활성화
if [ -d "backend/.venv" ]; then
    echo "📦 가상환경 활성화 중..."
    source backend/.venv/bin/activate
elif [ -d ".venv" ]; then
    echo "📦 가상환경 활성화 중..."
    source .venv/bin/activate
else
    echo "⚠️ 가상환경을 찾을 수 없습니다. 전역 Python 사용"
fi

# 백엔드 디렉토리로 이동
cd backend

echo "🔓 루팅폰 카카오톡 데이터 수신 서버 시작 중..."
echo "📱 포트: 8005"
echo "📊 API 문서: http://localhost:8005/docs"
echo ""
echo "🔌 루팅폰 앱에서 다음 주소로 데이터를 전송하세요:"
echo "   http://[YOUR_PC_IP]:8005"
echo ""
echo "⚠️ 서버 중지: Ctrl+C"
echo ""

# 서버 실행
python rooted_kakao_extractor.py 