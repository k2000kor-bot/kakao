#!/bin/bash

# 통합 API 서버 중지 스크립트

SERVER_PORT=8000
SERVER_PID_FILE="/tmp/integrated_server.pid"

echo "=== 통합 API 서버 중지 ==="
echo ""

# 포트로 실행 중인 프로세스 찾기
PID=$(lsof -ti:$SERVER_PORT 2>/dev/null)

if [ -z "$PID" ]; then
    # PID 파일 확인
    if [ -f "$SERVER_PID_FILE" ]; then
        PID=$(cat $SERVER_PID_FILE)
        if ps -p $PID > /dev/null 2>&1; then
            echo "PID 파일에서 프로세스 발견: $PID"
        else
            echo "⚠️ 서버가 실행되지 않았습니다"
            rm -f $SERVER_PID_FILE
            exit 0
        fi
    else
        echo "⚠️ 서버가 실행되지 않았습니다"
        exit 0
    fi
fi

echo "서버 중지 중... (PID: $PID)"
kill $PID 2>/dev/null

# 프로세스가 종료될 때까지 대기
for i in {1..10}; do
    if ! ps -p $PID > /dev/null 2>&1; then
        echo "✅ 서버가 중지되었습니다"
        rm -f $SERVER_PID_FILE
        exit 0
    fi
    sleep 0.5
done

# 강제 종료
if ps -p $PID > /dev/null 2>&1; then
    echo "⚠️ 강제 종료 중..."
    kill -9 $PID 2>/dev/null
    echo "✅ 서버가 강제 종료되었습니다"
    rm -f $SERVER_PID_FILE
fi
