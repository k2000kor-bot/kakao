#!/bin/bash

# CORBU.AI 개발 도구 시작 스크립트
echo "🚀 CORBU.AI 개발 도구를 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 프로젝트 루트 디렉토리
PROJECT_ROOT="/Users/aD/kakao-frontend"

# 백업 디렉토리 생성
echo -e "${BLUE}📁 백업 디렉토리를 생성합니다...${NC}"
mkdir -p "$PROJECT_ROOT/code_backups"

# 가상환경 활성화
echo -e "${BLUE}🐍 Python 가상환경을 활성화합니다...${NC}"
cd "$PROJECT_ROOT"
source venv/bin/activate

# 백엔드 서버 시작 (백그라운드)
echo -e "${GREEN}🔧 백엔드 서버를 시작합니다...${NC}"
python app.py &
BACKEND_PID=$!

# 잠시 대기
sleep 3

# 프론트엔드 서버 시작 (백그라운드)
echo -e "${GREEN}🎨 프론트엔드 서버를 시작합니다...${NC}"
cd "$PROJECT_ROOT"
BROWSER=none PORT=3000 npm start &
FRONTEND_PID=$!

# 잠시 대기
sleep 5

# 웹 코드 편집기 서버 시작 (백그라운드)
echo -e "${GREEN}💻 웹 코드 편집기를 시작합니다...${NC}"
cd "$PROJECT_ROOT"
python -m http.server 8080 &
EDITOR_PID=$!

# 서버 상태 확인
echo -e "${YELLOW}📊 서버 상태를 확인합니다...${NC}"
sleep 2

# 백엔드 상태 확인
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo -e "${GREEN}✅ 백엔드 서버: http://localhost:5001${NC}"
else
    echo -e "${RED}❌ 백엔드 서버 연결 실패${NC}"
fi

# 프론트엔드 상태 확인
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ 프론트엔드 서버: http://localhost:3000${NC}"
else
    echo -e "${RED}❌ 프론트엔드 서버 연결 실패${NC}"
fi

# 웹 코드 편집기 상태 확인
if curl -s http://localhost:8080/web_code_editor.html > /dev/null; then
    echo -e "${GREEN}✅ 웹 코드 편집기: http://localhost:8080/web_code_editor.html${NC}"
else
    echo -e "${RED}❌ 웹 코드 편집기 연결 실패${NC}"
fi

echo ""
echo -e "${BLUE}🎯 사용 가능한 도구들:${NC}"
echo -e "${GREEN}  • 채팅 인터페이스: http://localhost:3000${NC}"
echo -e "${GREEN}  • 웹 코드 편집기: http://localhost:8080/web_code_editor.html${NC}"
echo -e "${GREEN}  • 백엔드 API: http://localhost:5001${NC}"
echo ""
echo -e "${YELLOW}💡 개발 팁:${NC}"
echo -e "  • Ctrl+C를 눌러 모든 서버를 종료할 수 있습니다"
echo -e "  • 코드 편집기에서 파일을 수정하면 자동으로 백업이 생성됩니다"
echo -e "  • 긴 코드는 여러 탭으로 나누어 편집할 수 있습니다"
echo ""

# 프로세스 ID 저장
echo $BACKEND_PID > .backend_pid
echo $FRONTEND_PID > .frontend_pid
echo $EDITOR_PID > .editor_pid

# 사용자 입력 대기
echo -e "${BLUE}⏳ 서버가 실행 중입니다. 종료하려면 Ctrl+C를 누르세요...${NC}"

# 종료 시그널 처리
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 서버를 종료합니다...${NC}"
    
    # 프로세스 종료
    if [ -f .backend_pid ]; then
        kill $(cat .backend_pid) 2>/dev/null
        rm .backend_pid
    fi
    
    if [ -f .frontend_pid ]; then
        kill $(cat .frontend_pid) 2>/dev/null
        rm .frontend_pid
    fi
    
    if [ -f .editor_pid ]; then
        kill $(cat .editor_pid) 2>/dev/null
        rm .editor_pid
    fi
    
    echo -e "${GREEN}✅ 모든 서버가 종료되었습니다.${NC}"
    exit 0
}

# 시그널 트랩 설정
trap cleanup SIGINT SIGTERM

# 무한 대기
while true; do
    sleep 1
done
