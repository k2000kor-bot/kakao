#!/bin/bash

# macOS 시스템 상태 확인 스크립트
echo "🍎 macOS 카카오톡 AI 시스템 상태 확인"
echo "======================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

echo -e "${BLUE}📋 시스템 정보${NC}"
echo "macOS 버전: $(sw_vers -productVersion)"
echo "Python 버전: $(python3 --version 2>/dev/null || echo '설치되지 않음')"
echo "Node.js 버전: $(node --version 2>/dev/null || echo '설치되지 않음')"
echo "npm 버전: $(npm --version 2>/dev/null || echo '설치되지 않음')"
echo ""

echo -e "${BLUE}📂 프로젝트 구조${NC}"
[ -d ".venv" ] && echo -e "${GREEN}✅ Python 가상환경${NC}" || echo -e "${RED}❌ Python 가상환경${NC}"
[ -d "backend" ] && echo -e "${GREEN}✅ 백엔드 디렉토리${NC}" || echo -e "${RED}❌ 백엔드 디렉토리${NC}"
[ -d "src" ] && echo -e "${GREEN}✅ 프론트엔드 소스${NC}" || echo -e "${RED}❌ 프론트엔드 소스${NC}"
[ -f "package.json" ] && echo -e "${GREEN}✅ package.json${NC}" || echo -e "${RED}❌ package.json${NC}"
[ -f "backend/simple_message_generator.py" ] && echo -e "${GREEN}✅ 메시지 생성기${NC}" || echo -e "${RED}❌ 메시지 생성기${NC}"
echo ""

echo -e "${BLUE}🔧 실행 스크립트${NC}"
[ -x "start_backend.sh" ] && echo -e "${GREEN}✅ 백엔드 시작 스크립트${NC}" || echo -e "${RED}❌ 백엔드 시작 스크립트${NC}"
[ -x "start_frontend.sh" ] && echo -e "${GREEN}✅ 프론트엔드 시작 스크립트${NC}" || echo -e "${RED}❌ 프론트엔드 시작 스크립트${NC}"
[ -x "start_system.sh" ] && echo -e "${GREEN}✅ 시스템 시작 스크립트${NC}" || echo -e "${RED}❌ 시스템 시작 스크립트${NC}"
echo ""

echo -e "${BLUE}🌐 포트 사용 현황${NC}"
backend_port_check=$(lsof -i :8007 2>/dev/null)
frontend_port_check=$(lsof -i :3000 2>/dev/null)

if [ -n "$backend_port_check" ]; then
    echo -e "${GREEN}✅ 백엔드 서버 실행 중 (포트 8007)${NC}"
    echo "$backend_port_check" | head -2
else
    echo -e "${YELLOW}⚠️  백엔드 서버 중지됨 (포트 8007)${NC}"
fi

if [ -n "$frontend_port_check" ]; then
    echo -e "${GREEN}✅ 프론트엔드 서버 실행 중 (포트 3000)${NC}"
    echo "$frontend_port_check" | head -2
else
    echo -e "${YELLOW}⚠️  프론트엔드 서버 중지됨 (포트 3000)${NC}"
fi
echo ""

echo -e "${BLUE}🔍 Python 패키지 확인${NC}"
source .venv/bin/activate 2>/dev/null
if pip show fastapi >/dev/null 2>&1; then
    echo -e "${GREEN}✅ FastAPI 설치됨${NC}"
else
    echo -e "${RED}❌ FastAPI 미설치${NC}"
fi

if pip show uvicorn >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Uvicorn 설치됨${NC}"
else
    echo -e "${RED}❌ Uvicorn 미설치${NC}"
fi
echo ""

echo -e "${BLUE}📡 API 테스트${NC}"
if curl -s http://localhost:8007/ >/dev/null 2>&1; then
    echo -e "${GREEN}✅ 백엔드 API 응답 정상${NC}"
    echo "   응답: $(curl -s http://localhost:8007/ | jq -r '.message' 2>/dev/null || echo 'API 응답 확인됨')"
else
    echo -e "${RED}❌ 백엔드 API 응답 없음${NC}"
    echo -e "${YELLOW}   백엔드 서버를 시작하려면: ./start_backend.sh${NC}"
fi

if curl -s http://localhost:3000/ >/dev/null 2>&1; then
    echo -e "${GREEN}✅ 프론트엔드 서버 응답 정상${NC}"
else
    echo -e "${RED}❌ 프론트엔드 서버 응답 없음${NC}"
    echo -e "${YELLOW}   프론트엔드 서버를 시작하려면: ./start_frontend.sh${NC}"
fi
echo ""

echo -e "${BLUE}🚀 빠른 명령어${NC}"
echo "전체 시스템 시작:     ./start_system.sh"
echo "백엔드만 시작:        ./start_backend.sh"
echo "프론트엔드만 시작:    ./start_frontend.sh"
echo "시스템 상태 확인:     ./check_macos_system.sh"
echo ""
echo "포트 사용 프로세스 확인:"
echo "  lsof -i :8007    (백엔드)"
echo "  lsof -i :3000    (프론트엔드)"
echo ""
echo "프로세스 종료:"
echo "  pkill -f 'simple_message_generator'"
echo "  pkill -f 'npm start'"

echo ""
echo "🌐 접속 주소:"
echo "  프론트엔드: http://localhost:3000"
echo "  백엔드 API: http://localhost:8007"
echo "  API 문서:   http://localhost:8007/docs" 