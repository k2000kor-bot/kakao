#!/bin/bash

# CORBU.AI 개발 도구 시작 스크립트 (레거시 — 하드코딩 경로 제거)

echo "🚀 CORBU.AI 개발 도구를 시작합니다..."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT" || exit 1

# shellcheck source=scripts/lib-activate-backend-venv.sh
source "$PROJECT_ROOT/scripts/lib-activate-backend-venv.sh"

echo -e "${BLUE}📁 백업 디렉터리 생성...${NC}"
mkdir -p "$PROJECT_ROOT/code_backups"

echo -e "${BLUE}🐍 Python 가상환경 활성화...${NC}"
if ! backend_venv_activate "$PROJECT_ROOT"; then
    echo -e "${RED}❌ venv 없음. ./setup.sh 또는 backend/.venv 생성 후 재시도.${NC}"
    exit 1
fi

echo -e "${GREEN}🔧 백엔드 app.py 시작 (백그라운드)...${NC}"
(
  cd "$PROJECT_ROOT/backend" || exit 1
  python3 app.py
) &
BACKEND_PID=$!

sleep 3

echo -e "${GREEN}🎨 프론트엔드 시작...${NC}"
cd "$PROJECT_ROOT"
BROWSER=none PORT=3000 npm start &
FRONTEND_PID=$!

sleep 5

echo -e "${GREEN}💻 정적 서버 8080...${NC}"
cd "$PROJECT_ROOT"
python3 -m http.server 8080 &
EDITOR_PID=$!

echo -e "${YELLOW}📊 서버 상태 확인...${NC}"
sleep 2

APP_PORT="${API_PORT:-${BACKEND_PORT:-5002}}"
if curl -s "http://localhost:${APP_PORT}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 백엔드(app.py): http://localhost:${APP_PORT} (API_PORT/BACKEND_PORT, 기본 5002)${NC}"
else
    echo -e "${YELLOW}⚠️  app.py 헬스 없음 — 통합: npm run restart:backend → http://localhost:5002${NC}"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ 프론트엔드: http://localhost:3000${NC}"
else
    echo -e "${RED}❌ 프론트엔드 연결 실패${NC}"
fi

if curl -s http://localhost:8080/web_code_editor.html > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 웹 코드 편집기: http://localhost:8080/web_code_editor.html${NC}"
else
    echo -e "${RED}❌ 웹 코드 편집기 연결 실패${NC}"
fi

echo ""
echo -e "${BLUE}🎯 사용 가능한 도구${NC}"
echo -e "${GREEN}  • 대화: http://localhost:3000${NC}"
echo -e "${GREEN}  • 코드 편집기: http://localhost:8080/web_code_editor.html${NC}"
echo ""

echo "$BACKEND_PID" > "$PROJECT_ROOT/.backend_pid"
echo "$FRONTEND_PID" > "$PROJECT_ROOT/.frontend_pid"
echo "$EDITOR_PID" > "$PROJECT_ROOT/.editor_pid"

echo -e "${BLUE}⏳ 종료: Ctrl+C${NC}"

cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 서버 종료...${NC}"
    for f in .backend_pid .frontend_pid .editor_pid; do
        if [ -f "$PROJECT_ROOT/$f" ]; then
            kill "$(cat "$PROJECT_ROOT/$f")" 2>/dev/null || true
            rm -f "$PROJECT_ROOT/$f"
        fi
    done
    echo -e "${GREEN}✅ 종료 완료${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

while true; do sleep 1; done
