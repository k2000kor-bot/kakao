#!/bin/bash

# CORBU.AI 통합 시스템 시작 스크립트
echo "🚀 CORBU.AI 통합 시스템을 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 함수 정의
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
cd "$REPO_ROOT" || exit 1

if ! backend_venv_activate "$REPO_ROOT"; then
    print_status "표준 venv 없음. backend/.venv 생성 시도..."
    ( cd "$REPO_ROOT/backend" && python3 -m venv .venv && .venv/bin/pip install -q -r requirements-core.txt ) || true
    backend_venv_activate "$REPO_ROOT" || { print_error "가상환경을 활성화할 수 없습니다."; exit 1; }
fi

# 의존성 설치
print_status "Python 의존성을 설치합니다..."
pip install -r "$REPO_ROOT/backend/requirements.txt" 2>/dev/null || pip install -r "$REPO_ROOT/backend/requirements-core.txt" 2>/dev/null || true

# Node.js 의존성 설치
print_status "Node.js 의존성을 설치합니다..."
npm install

# 백엔드: main_server + uvicorn (npm run restart:backend 와 동일 스택)
BACKEND_PORT="${BACKEND_PORT:-5002}"
print_status "통합 백엔드 서버를 시작합니다 (main_server:$BACKEND_PORT)..."
( cd "$REPO_ROOT/backend" && python3 -m uvicorn main_server:app --host 0.0.0.0 --port "$BACKEND_PORT" ) &
BACKEND_PID=$!

# 백엔드 서버 시작 대기
sleep 3

# 백엔드 서버 상태 확인
if curl -s "http://localhost:${BACKEND_PORT}/api/status" > /dev/null; then
    print_success "백엔드 서버가 성공적으로 시작되었습니다 (PID: $BACKEND_PID)"
else
    print_warning "백엔드 서버 시작에 문제가 있을 수 있습니다. 계속 진행합니다..."
fi

# 프론트엔드 서버 시작
print_status "프론트엔드 서버를 시작합니다..."
npm start &
FRONTEND_PID=$!

# 서버 상태 모니터링
print_status "서버 상태를 모니터링합니다..."
echo ""
echo "=========================================="
echo "🎉 CORBU.AI 통합 시스템이 시작되었습니다!"
echo "=========================================="
echo ""
echo -e "${GREEN}📱 프론트엔드:${NC} http://localhost:3000"
echo -e "${GREEN}🔧 백엔드 API:${NC} http://localhost:${BACKEND_PORT}"
echo -e "${GREEN}📚 API 문서:${NC} http://localhost:${BACKEND_PORT}/api/docs"
echo ""
echo -e "${YELLOW}💡 사용 가능한 기능:${NC}"
echo "• ChatGPT 스타일 대화 인터페이스"
echo "• 파일 업로드 및 AI 분석"
echo "• 프로젝트 관리"
echo "• 실시간 감정 분석"
echo "• 다중 AI 모델 지원"
echo "• 드래그 앤 드롭 파일 업로드"
echo ""
echo -e "${CYAN}🛑 시스템을 중지하려면 Ctrl+C를 누르세요${NC}"
echo ""

# 종료 처리 함수
cleanup() {
    print_status "시스템을 종료합니다..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        print_status "백엔드 서버를 종료합니다 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        print_status "프론트엔드 서버를 종료합니다 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    print_success "시스템이 성공적으로 종료되었습니다."
    exit 0
}

# 시그널 핸들러 등록
trap cleanup SIGINT SIGTERM

# 서버 상태 모니터링 루프
while true; do
    sleep 10
    
    # 백엔드 서버 상태 확인
    if ! curl -s "http://localhost:${BACKEND_PORT}/api/status" > /dev/null; then
        print_warning "백엔드 서버에 연결할 수 없습니다. 재시작을 시도합니다..."
        ( cd "$REPO_ROOT/backend" && python3 -m uvicorn main_server:app --host 0.0.0.0 --port "$BACKEND_PORT" ) &
        BACKEND_PID=$!
        sleep 3
    fi
    
    # 프론트엔드 서버 상태 확인
    if ! curl -s http://localhost:3000 > /dev/null; then
        print_warning "프론트엔드 서버에 연결할 수 없습니다."
    fi
done