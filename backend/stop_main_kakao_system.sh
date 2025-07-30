#!/bin/bash

# 실시간 카카오톡 대화 대응 시스템 종료 스크립트

echo "실시간 카카오톡 대화 대응 시스템 종료 중..."

# 프로세스 ID 확인
PIDS=$(pgrep -f "main_kakao_system.py")
UVICORN_PIDS=$(pgrep -f "uvicorn.*8004")

if [ -n "$PIDS" ]; then
    echo "메인 시스템 프로세스 종료 중..."
    echo "$PIDS" | xargs kill -TERM
    sleep 2
    
    # 강제 종료 확인
    REMAINING_PIDS=$(pgrep -f "main_kakao_system.py")
    if [ -n "$REMAINING_PIDS" ]; then
        echo "강제 종료 중..."
        echo "$REMAINING_PIDS" | xargs kill -KILL
    fi
fi

if [ -n "$UVICORN_PIDS" ]; then
    echo "Uvicorn 프로세스 종료 중..."
    echo "$UVICORN_PIDS" | xargs kill -TERM
    sleep 2
    
    # 강제 종료 확인
    REMAINING_UVICORN_PIDS=$(pgrep -f "uvicorn.*8004")
    if [ -n "$REMAINING_UVICORN_PIDS" ]; then
        echo "Uvicorn 강제 종료 중..."
        echo "$REMAINING_UVICORN_PIDS" | xargs kill -KILL
    fi
fi

# 포트 확인
if lsof -Pi :8004 -sTCP:LISTEN -t >/dev/null ; then
    echo "포트 8004에서 실행 중인 프로세스 강제 종료 중..."
    lsof -ti:8004 | xargs kill -KILL 2>/dev/null || true
fi

# 프로세스 확인
REMAINING_PIDS=$(pgrep -f "main_kakao_system.py")
REMAINING_UVICORN_PIDS=$(pgrep -f "uvicorn.*8004")

if [ -z "$REMAINING_PIDS" ] && [ -z "$REMAINING_UVICORN_PIDS" ]; then
    echo "✅ 실시간 카카오톡 대화 대응 시스템이 성공적으로 종료되었습니다."
else
    echo "⚠️  일부 프로세스가 여전히 실행 중일 수 있습니다."
    echo "남은 프로세스:"
    if [ -n "$REMAINING_PIDS" ]; then
        echo "  메인 시스템: $REMAINING_PIDS"
    fi
    if [ -n "$REMAINING_UVICORN_PIDS" ]; then
        echo "  Uvicorn: $REMAINING_UVICORN_PIDS"
    fi
fi

echo "시스템 종료 완료." 