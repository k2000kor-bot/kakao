#!/bin/bash

# 전체 시스템 종료 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 프로젝트 루트 디렉토리
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$PROJECT_ROOT/.pids"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🛑 전체 시스템 종료${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# PID 파일에서 프로세스 종료
if [ -d "$PID_DIR" ]; then
    for pidfile in "$PID_DIR"/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile" 2>/dev/null || true)
            name=$(basename "$pidfile" .pid)
            if [ ! -z "$pid" ] && kill -0 $pid 2>/dev/null; then
                echo -e "${YELLOW}$name 서버 종료 중... (PID: $pid)${NC}"
                kill $pid 2>/dev/null || true
                sleep 1
                # 강제 종료
                if kill -0 $pid 2>/dev/null; then
                    kill -9 $pid 2>/dev/null || true
                fi
            fi
            rm -f "$pidfile"
        fi
    done
fi

# 포트별로 실행 중인 프로세스 찾기 및 종료 (통합 백엔드 5002 우선, 5001은 개별·개포 분석 등)
for port in 3000 5002 5001 8000 5000; do
    pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}포트 $port의 프로세스 종료 중... (PID: $pid)${NC}"
        kill $pid 2>/dev/null || true
        sleep 1
        # 강제 종료
        if kill -0 $pid 2>/dev/null; then
            kill -9 $pid 2>/dev/null || true
        fi
    fi
done

# Node.js 프로세스 종료
echo -e "${YELLOW}Node.js 프로세스 종료 중...${NC}"
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "node.*server.js" 2>/dev/null || true

# Python 프로세스 종료
echo -e "${YELLOW}Python 프로세스 종료 중...${NC}"
pkill -f "uvicorn main_server" 2>/dev/null || true
pkill -f "uvicorn.*advanced_api_server" 2>/dev/null || true
pkill -f "python.*app.py" 2>/dev/null || true

sleep 2

echo ""
echo -e "${GREEN}✅ 모든 서버가 종료되었습니다${NC}"
echo ""

