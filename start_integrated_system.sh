#!/bin/bash

# 카카오톡 AI 대화 대응 통합 시스템 시작 스크립트
# 모든 기능을 통합한 최상위 시스템

echo "🚀 카카오톡 AI 대화 대응 통합 시스템 시작..."
echo "=========================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# 로그 디렉토리 생성
mkdir -p logs

# 함수 정의
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${CYAN}[SUCCESS]${NC} $1"
}

# 시스템 요구사항 확인
check_requirements() {
    log_info "시스템 요구사항 확인 중..."
    
    # Python 확인
    if ! command -v python3 &> /dev/null; then
        log_error "Python3가 설치되지 않았습니다."
        exit 1
    fi
    
    # Node.js 확인
    if ! command -v node &> /dev/null; then
        log_error "Node.js가 설치되지 않았습니다."
        exit 1
    fi
    
    # npm 확인
    if ! command -v npm &> /dev/null; then
        log_error "npm이 설치되지 않았습니다."
        exit 1
    fi
    
    log_success "모든 요구사항이 충족되었습니다."
}

# 의존성 설치
install_dependencies() {
    log_info "의존성 설치 중..."
    
    # Backend 의존성
    cd backend
    if [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt > ../logs/pip_install.log 2>&1
        if [ $? -eq 0 ]; then
            log_success "Python 의존성 설치 완료"
        else
            log_error "Python 의존성 설치 실패"
            exit 1
        fi
    fi
    cd ..
    
    # Frontend 의존성
    if [ -f "package.json" ]; then
        npm install > logs/npm_install.log 2>&1
        if [ $? -eq 0 ]; then
            log_success "Node.js 의존성 설치 완료"
        else
            log_error "Node.js 의존성 설치 실패"
            exit 1
        fi
    fi
}

# 포트 확인 및 정리
check_ports() {
    log_info "포트 상태 확인 중..."
    
    # 포트 8003 (메인 API)
    if lsof -Pi :8003 -sTCP:LISTEN -t >/dev/null ; then
        log_warn "포트 8003이 사용 중입니다. 기존 프로세스를 종료합니다."
        lsof -ti:8003 | xargs kill -9 2>/dev/null || true
    fi
    
    # 포트 8005 (WebSocket)
    if lsof -Pi :8005 -sTCP:LISTEN -t >/dev/null ; then
        log_warn "포트 8005가 사용 중입니다. 기존 프로세스를 종료합니다."
        lsof -ti:8005 | xargs kill -9 2>/dev/null || true
    fi
    
    # 포트 3000 (프론트엔드)
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        log_warn "포트 3000이 사용 중입니다. 기존 프로세스를 종료합니다."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    fi
    
    log_success "포트 정리 완료"
}

# 백엔드 서비스 시작
start_backend_services() {
    log_info "백엔드 서비스 시작 중..."
    
    # 1. 메인 API 서버 시작
    log_info "메인 API 서버 시작 (포트 8003)..."
    cd backend
    python3 integrated_kakao_api.py > ../logs/api_server.log 2>&1 &
    API_PID=$!
    echo $API_PID > ../logs/api_server.pid
    cd ..
    
    # 서버 시작 대기
    sleep 3
    
    # API 서버 상태 확인
    if curl -s http://localhost:8003/health > /dev/null 2>&1; then
        log_success "메인 API 서버: 정상 동작"
    else
        log_error "메인 API 서버 시작 실패"
        exit 1
    fi
    
    # 2. WebSocket 서버 시작
    log_info "WebSocket 서버 시작 (포트 8005)..."
    cd backend
    python3 advanced_websocket_server.py > ../logs/websocket_server.log 2>&1 &
    WEBSOCKET_PID=$!
    echo $WEBSOCKET_PID > ../logs/websocket_server.pid
    cd ..
    
    # WebSocket 서버 상태 확인
    sleep 2
    if curl -s http://localhost:8005/api/notifications/status > /dev/null 2>&1; then
        log_success "WebSocket 서버: 정상 동작"
    else
        log_warn "WebSocket 서버 시작 실패 (선택사항)"
    fi
}

# 프론트엔드 서비스 시작
start_frontend_services() {
    log_info "프론트엔드 서비스 시작 중..."
    
    # React 개발 서버 시작
    log_info "React 개발 서버 시작 (포트 3000)..."
    npm start > logs/frontend_server.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > logs/frontend_server.pid
    
    # 서버 시작 대기
    sleep 5
    
    # 프론트엔드 서버 상태 확인
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "프론트엔드 서버: 정상 동작"
    else
        log_error "프론트엔드 서버 시작 실패"
        exit 1
    fi
}

# 시스템 상태 확인
check_system_status() {
    log_info "시스템 상태 확인 중..."
    
    echo ""
    echo "📊 시스템 상태:"
    echo "=================="
    
    # API 서버 상태
    if curl -s http://localhost:8003/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} 메인 API 서버 (8003) - 정상"
    else
        echo -e "  ${RED}✗${NC} 메인 API 서버 (8003) - 오프라인"
    fi
    
    # WebSocket 서버 상태
    if curl -s http://localhost:8005/api/notifications/status > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} WebSocket 서버 (8005) - 정상"
    else
        echo -e "  ${RED}✗${NC} WebSocket 서버 (8005) - 오프라인"
    fi
    
    # 프론트엔드 서버 상태
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} 프론트엔드 서버 (3000) - 정상"
    else
        echo -e "  ${RED}✗${NC} 프론트엔드 서버 (3000) - 오프라인"
    fi
    
    echo ""
    echo "🌐 접속 URL:"
    echo "=================="
    echo -e "  ${BLUE}메인 시스템:${NC} http://localhost:3000"
    echo -e "  ${BLUE}API 문서:${NC} http://localhost:8003/docs"
    echo -e "  ${BLUE}API 상태:${NC} http://localhost:8003/health"
    echo ""
}

# 메인 실행
main() {
    echo ""
    echo "██╗   ██╗██╗  ████████╗██╗███╗   ███╗ █████╗ ████████╗███████╗"
    echo "██║   ██║██║  ╚══██╔══╝██║████╗ ████║██╔══██╗╚══██╔══╝██╔════╝"
    echo "██║   ██║██║     ██║   ██║██╔████╔██║███████║   ██║   █████╗  "
    echo "██║   ██║██║     ██║   ██║██║╚██╔╝██║██╔══██║   ██║   ██╔══╝  "
    echo "╚██████╔╝███████╗██║   ██║██║ ╚═╝ ██║██║  ██║   ██║   ███████╗"
    echo " ╚═════╝ ╚══════╝╚═╝   ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝"
    echo ""
    echo "카카오톡 AI 대화 대응 통합 시스템 v2.0"
    echo ""
    
    # 요구사항 확인
    check_requirements
    
    # 의존성 설치
    install_dependencies
    
    # 포트 확인 및 정리
    check_ports
    
    # 백엔드 서비스 시작
    start_backend_services
    
    # 프론트엔드 서비스 시작
    start_frontend_services
    
    # 시스템 상태 확인
    check_system_status
    
    echo ""
    echo "🎉 시스템이 성공적으로 시작되었습니다!"
    echo ""
    echo "📋 사용 가능한 기능:"
    echo "=================="
    echo "  💬 실시간 채팅"
    echo "  ✨ AI 메시지 생성"
    echo "  🤖 ChatGPT 인터페이스"
    echo "  📊 실시간 대시보드"
    echo "  📈 AI 분석"
    echo "  🧪 유사도 테스터"
    echo "  📁 파일 업로드"
    echo "  📝 대화 요약"
    echo "  ⚡ 성능 모니터"
    echo ""
    echo "🔧 관리 명령어:"
    echo "=================="
    echo "  상태 확인: ./check_system_status.sh"
    echo "  시스템 종료: ./stop_integrated_system.sh"
    echo "  로그 확인: tail -f logs/*.log"
    echo ""
    echo "🌐 브라우저에서 http://localhost:3000 으로 접속하세요!"
    echo ""
}

# 스크립트 실행
main "$@" 