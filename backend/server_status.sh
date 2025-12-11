#!/bin/bash

# 서버 상태 확인 스크립트

SERVER_PORT=8000
SERVER_PID_FILE="/tmp/integrated_server.pid"

echo "=== 통합 API 서버 상태 ==="
echo ""

# 포트로 실행 중인 프로세스 찾기
PID=$(lsof -ti:$SERVER_PORT 2>/dev/null)

if [ -z "$PID" ]; then
    if [ -f "$SERVER_PID_FILE" ]; then
        PID=$(cat $SERVER_PID_FILE)
        if ps -p $PID > /dev/null 2>&1; then
            echo "⚠️ PID 파일에는 있지만 포트 $SERVER_PORT에서 실행되지 않습니다"
        else
            echo "❌ 서버가 실행되지 않았습니다"
            rm -f $SERVER_PID_FILE
            exit 1
        fi
    else
        echo "❌ 서버가 실행되지 않았습니다"
        echo ""
        echo "서버를 시작하려면:"
        echo "  ./start_and_check_server.sh"
        echo "  또는"
        echo "  python3 start_simple_integrated_server.py"
        exit 1
    fi
else
    echo "✅ 서버 실행 중"
    echo "  - 포트: $SERVER_PORT"
    echo "  - PID: $PID"
    echo ""
    
    # 헬스 체크
    echo "헬스 체크:"
    HEALTH_RESPONSE=$(curl -s http://localhost:$SERVER_PORT/api/integrated/health 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
        echo ""
        
        # 시스템 상태
        echo "시스템 상태:"
        curl -s http://localhost:$SERVER_PORT/api/integrated/status 2>/dev/null | python3 -m json.tool 2>/dev/null | head -20 || echo "⚠️ 상태 조회 실패"
    else
        echo "⚠️ 서버 응답 없음"
    fi
    
    echo ""
    echo "서버 정보:"
    echo "  - 헬스 체크: http://localhost:$SERVER_PORT/api/integrated/health"
    echo "  - API 문서: http://localhost:$SERVER_PORT/api/docs"
    echo "  - 통합 API: http://localhost:$SERVER_PORT/api/integrated"
    echo ""
    echo "서버를 중지하려면: ./stop_server.sh"
fi
