#!/bin/bash
# 서버 상태 확인 스크립트
# 백엔드 서버의 상태를 확인하고 정보를 출력합니다

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}백엔드 서버 상태 확인${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 서버 포트 기본값
PORT=${PORT:-8000}
BASE_URL="http://localhost:${PORT}"

# 헬스 체크
echo -e "${GREEN}헬스 체크 중...${NC}"
HEALTH_RESPONSE=$(curl -s "${BASE_URL}/health" 2>&1)
CURL_EXIT_CODE=$?

if [ $CURL_EXIT_CODE -eq 0 ] && echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ 서버 상태: 정상${NC}"
    
    # 서버 정보 추출
    STATUS=$(echo "$HEALTH_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('status', 'unknown'))" 2>/dev/null || echo "unknown")
    VERSION=$(echo "$HEALTH_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('version', 'unknown'))" 2>/dev/null || echo "unknown")
    DATABASE=$(echo "$HEALTH_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('database', 'unknown'))" 2>/dev/null || echo "unknown")
    
    echo -e "  상태: ${GREEN}${STATUS}${NC}"
    echo -e "  버전: ${BLUE}${VERSION}${NC}"
    echo -e "  데이터베이스: ${BLUE}${DATABASE}${NC}"
else
    echo -e "${RED}❌ 서버 상태: 오프라인 또는 오류${NC}"
    echo -e "${YELLOW}서버가 실행 중인지 확인하세요:${NC}"
    echo -e "  ${BLUE}cd backend && python advanced_api_server.py${NC}"
    exit 1
fi

echo ""

# API 문서 확인
echo -e "${GREEN}API 문서 확인 중...${NC}"
DOCS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/docs" 2>&1 || echo "000")

if [ "$DOCS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ API 문서: 접근 가능${NC}"
    echo -e "  URL: ${BLUE}${BASE_URL}/docs${NC}"
else
    echo -e "${YELLOW}⚠️  API 문서: 접근 불가 (HTTP ${DOCS_RESPONSE})${NC}"
fi

echo ""

# 프로세스 정보
echo -e "${GREEN}프로세스 정보:${NC}"
SERVER_PID=$(lsof -ti :${PORT} 2>/dev/null || echo "")
if [ -n "$SERVER_PID" ]; then
    echo -e "  PID: ${BLUE}${SERVER_PID}${NC}"
    PS_INFO=$(ps -p $SERVER_PID -o pid,command,etime 2>/dev/null | tail -1 || echo "")
    if [ -n "$PS_INFO" ]; then
        echo -e "  실행 시간: ${BLUE}$(echo $PS_INFO | awk '{print $NF}')${NC}"
    fi
else
    echo -e "${YELLOW}  프로세스 정보를 가져올 수 없습니다${NC}"
fi

echo ""

# 엔드포인트 테스트
echo -e "${GREEN}주요 엔드포인트 테스트:${NC}"

# 상태 엔드포인트
STATUS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/v7/status" 2>&1 || echo "000")
if [ "$STATUS_RESPONSE" = "200" ]; then
    echo -e "  ${GREEN}✅${NC} /api/v7/status"
else
    echo -e "  ${YELLOW}⚠️${NC}  /api/v7/status (HTTP ${STATUS_RESPONSE})"
fi

# 프로젝트 엔드포인트
PROJECTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/projects" 2>&1 || echo "000")
if [ "$PROJECTS_RESPONSE" = "200" ]; then
    echo -e "  ${GREEN}✅${NC} /api/projects"
elif [ "$PROJECTS_RESPONSE" = "404" ]; then
    echo -e "  ${YELLOW}⚠️${NC}  /api/projects (404 - 엔드포인트 없음)"
else
    echo -e "  ${YELLOW}⚠️${NC}  /api/projects (HTTP ${PROJECTS_RESPONSE})"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}서버 정보:${NC}"
echo -e "  URL: ${BLUE}${BASE_URL}${NC}"
echo -e "  헬스 체크: ${BLUE}${BASE_URL}/health${NC}"
echo -e "  API 문서: ${BLUE}${BASE_URL}/docs${NC}"
echo -e "${BLUE}========================================${NC}"
