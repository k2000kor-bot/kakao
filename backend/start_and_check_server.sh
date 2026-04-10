#!/bin/bash

# 통합 API 서버 시작 및 상태 확인 스크립트

SERVER_PORT="${BACKEND_PORT:-${PORT:-5002}}"
SERVER_PID_FILE="/tmp/integrated_server.pid"
SERVER_LOG_FILE="/tmp/integrated_server.log"

echo "=== 통합 API 서버 관리 ==="
echo ""

# 서버가 이미 실행 중인지 확인
if lsof -ti:$SERVER_PORT > /dev/null 2>&1; then
    EXISTING_PID=$(lsof -ti:$SERVER_PORT)
    echo "✅ 서버가 이미 포트 $SERVER_PORT에서 실행 중입니다 (PID: $EXISTING_PID)"
    echo ""
    echo "서버 상태 확인:"
    curl -s http://localhost:$SERVER_PORT/api/integrated/health | python3 -m json.tool 2>/dev/null || echo "⚠️ 서버 응답 없음"
    echo ""
    echo "서버를 중지하려면: kill $EXISTING_PID"
    exit 0
fi

# 기존 PID 파일이 있으면 확인
if [ -f "$SERVER_PID_FILE" ]; then
    OLD_PID=$(cat $SERVER_PID_FILE)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "⚠️ 기존 서버 프로세스가 실행 중입니다 (PID: $OLD_PID)"
        echo "서버를 중지하려면: kill $OLD_PID"
        exit 1
    else
        rm -f $SERVER_PID_FILE
    fi
fi

echo "서버를 시작합니다..."
cd "$(dirname "$0")"

# 서버 시작
python3 start_simple_integrated_server.py > "$SERVER_LOG_FILE" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$SERVER_PID_FILE"

echo "✅ 서버 시작됨 (PID: $SERVER_PID)"
echo "로그 파일: $SERVER_LOG_FILE"
echo ""

# 서버가 시작될 때까지 대기
echo "서버 시작 대기 중..."
for i in {1..10}; do
    sleep 1
    if curl -s http://localhost:$SERVER_PORT/api/integrated/health > /dev/null 2>&1; then
        echo ""
        echo "✅ 서버가 정상적으로 시작되었습니다!"
        echo ""
        echo "서버 정보:"
        echo "  - 포트: $SERVER_PORT"
        echo "  - PID: $SERVER_PID"
        echo "  - 헬스 체크: http://localhost:$SERVER_PORT/api/integrated/health"
        echo "  - API 문서: http://localhost:$SERVER_PORT/api/docs"
        echo ""
        echo "서버 상태:"
        curl -s http://localhost:$SERVER_PORT/api/integrated/health | python3 -m json.tool 2>/dev/null || echo "⚠️ 응답 없음"
        echo ""
        echo "서버를 중지하려면: kill $SERVER_PID"
        echo "또는: ./stop_server.sh"
        exit 0
    fi
    echo -n "."
done

echo ""
echo "⚠️ 서버 시작 시간 초과"
echo "로그를 확인하세요: tail -f $SERVER_LOG_FILE"
exit 1
