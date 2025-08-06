#!/bin/bash

echo "🚀 통합 메시지 시스템 시작"
echo "=================================================="
echo "📍 프로젝트 루트: $(pwd)"
echo ""

# 가상환경 활성화
echo "[STEP] 가상환경 활성화 중..."
source venv/bin/activate
echo "[SUCCESS] 가상환경 활성화 완료"

# 포트 확인 및 정리
echo "[STEP] 포트 8000 상태 확인 중..."
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "[WARNING] 포트 8000이 사용 중입니다. 프로세스를 종료합니다."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# 백엔드 디렉토리로 이동
cd backend

# 통합 메시지 시스템 시작
echo "[INFO] 통합 메시지 시스템 시작 (포트 8000)..."
python3 unified_message_system.py > ../logs/unified_message_system.log 2>&1 &
UNIFIED_MESSAGE_PID=$!
echo "[SUCCESS] 통합 메시지 시스템 시작됨 (PID: $UNIFIED_MESSAGE_PID)"

cd ..

# 서버 상태 확인
echo ""
echo "[STEP] 서버 상태 확인 중..."
sleep 3

echo ""
echo "🎉 통합 메시지 시스템 시작 완료!"
echo "=================================================="
echo ""
echo "🔧 백엔드 서버:"
echo "   📝 통합 메시지 시스템: http://localhost:8000"
echo ""
echo "📖 API 문서:"
echo "   📚 통합 메시지 API: http://localhost:8000/docs"
echo ""
echo "🆕 통합 메시지 기능:"
echo "   📝 메시지 형식 선택 (22가지)"
echo "   🎯 맥락 기반 메시지 생성"
echo "   🤖 고급 메시지 생성"
echo "   💬 카카오톡 메시지 생성"
echo "   📊 메시지 분석"
echo "   🧠 감정 분석"
echo "   🔄 실시간 메시지 처리"
echo ""
echo "💡 사용 방법:"
echo "   - 프론트엔드에서 '메시지 형태 선택' 탭 클릭"
echo "   - 원하는 메시지 형식 선택"
echo "   - 원본 메시지 입력"
echo "   - 맥락 정보 입력 (선택사항)"
echo "   - '메시지 생성' 버튼 클릭"
echo ""
echo "🛑 서버 종료: kill $UNIFIED_MESSAGE_PID"
echo "📋 로그 확인: logs/unified_message_system.log"
echo ""
echo "🚀 통합 메시지 시스템이 성공적으로 시작되었습니다!"

# PID 저장
echo "$UNIFIED_MESSAGE_PID" > .unified_message_system_pid

# 백그라운드에서 실행 중인 프로세스 모니터링
echo ""
echo "[INFO] 서버 모니터링 시작..."
while true; do
    sleep 30
    echo "[INFO] 서버 상태 확인 중... ($(date))"
    
    # 서버 상태 확인
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
        echo "   ✅ 포트 8000: 정상"
    else
        echo "   ❌ 포트 8000: 중단됨"
    fi
    echo ""
done 