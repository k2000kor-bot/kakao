#!/bin/bash

# AGI 시스템 중지 스크립트 v1.0

echo "🛑 AGI 시스템 중지 중..."

# 현재 디렉토리 확인
cd "$(dirname "$0")"

# PID 파일에서 프로세스 종료
if [ -f ".agi_api_pid" ]; then
    AGI_API_PID=$(cat .agi_api_pid)
    if kill -0 $AGI_API_PID 2>/dev/null; then
        echo "🔄 AGI API 서버 종료 중 (PID: $AGI_API_PID)..."
        kill $AGI_API_PID
        sleep 2
        
        # 강제 종료 확인
        if kill -0 $AGI_API_PID 2>/dev/null; then
            echo "⚡ 강제 종료 중..."
            kill -9 $AGI_API_PID
        fi
    else
        echo "ℹ️ AGI API 서버가 이미 종료되었습니다."
    fi
    rm -f .agi_api_pid
else
    echo "ℹ️ PID 파일을 찾을 수 없습니다."
fi

# 관련 프로세스 종료
echo "🔄 관련 프로세스 종료..."
pkill -f "agi_api_server" 2>/dev/null || true
pkill -f "integrated_agi_system" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true

# 잠시 대기
sleep 2

# 포트 사용 확인
if lsof -i :8010 > /dev/null 2>&1; then
    echo "⚠️ 포트 8010이 여전히 사용 중입니다."
    lsof -i :8010
else
    echo "✅ 포트 8010이 해제되었습니다."
fi

echo ""
echo "🎉 AGI 시스템이 완전히 중지되었습니다!"
echo "시스템을 다시 시작하려면: ./start_agi_system.sh" 