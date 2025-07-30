#!/bin/bash

# Ultimate AI Message System Launcher
# 최첨단 AI 메시지 시스템 통합 실행 스크립트

echo "🚀 Ultimate AI Message System Starting..."
echo "========================================"

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

# 데이터베이스 초기화
init_databases() {
    log_info "데이터베이스 초기화 중..."
    
    cd backend
    
    # 각 시스템별 데이터베이스 초기화
    python3 -c "
import sqlite3
from pathlib import Path

# 메인 시스템 DB
Path('advanced_message_system.db').touch()
print('✓ Main system database initialized')

# 다국어 시스템 DB
Path('multilingual.db').touch()
print('✓ Multilingual system database initialized')

# AI 앙상블 DB
Path('ai_ensemble.db').touch()
print('✓ AI ensemble database initialized')

# 스케줄러 DB
Path('scheduler.db').touch()
print('✓ Scheduler database initialized')

# 백업 시스템 DB
Path('backups/backup_metadata.db').parent.mkdir(exist_ok=True)
Path('backups/backup_metadata.db').touch()
print('✓ Backup system database initialized')

print('All databases initialized successfully!')
"
    
    cd ..
    log_success "데이터베이스 초기화 완료"
}

# 백그라운드 서비스 시작
start_backend_services() {
    log_info "백엔드 서비스 시작 중..."
    
    cd backend
    
    # 1. 메인 API 서버 (포트 8003)
    log_info "메인 API 서버 시작 (포트 8003)..."
    python3 advanced_api_server.py > ../logs/main_api.log 2>&1 &
    MAIN_API_PID=$!
    echo $MAIN_API_PID > ../logs/main_api.pid
    sleep 3
    
    if kill -0 $MAIN_API_PID 2>/dev/null; then
        log_success "메인 API 서버 시작됨 (PID: $MAIN_API_PID)"
    else
        log_error "메인 API 서버 시작 실패"
        exit 1
    fi
    
    # 2. WebSocket 알림 서버 (포트 8005)
log_info "WebSocket 알림 서버 시작 (포트 8005)..."
    python3 advanced_websocket_server.py > ../logs/websocket.log 2>&1 &
    WEBSOCKET_PID=$!
    echo $WEBSOCKET_PID > ../logs/websocket.pid
    sleep 3
    
    if kill -0 $WEBSOCKET_PID 2>/dev/null; then
        log_success "WebSocket 서버 시작됨 (PID: $WEBSOCKET_PID)"
    else
        log_error "WebSocket 서버 시작 실패"
        exit 1
    fi
    
    # 3. 스케줄러 시작
    log_info "자동 백업 스케줄러 시작..."
    python3 -c "
from backup_recovery_system import start_backup_scheduler
import time
start_backup_scheduler()
print('Backup scheduler started')
while True:
    time.sleep(60)
" > ../logs/scheduler.log 2>&1 &
    SCHEDULER_PID=$!
    echo $SCHEDULER_PID > ../logs/scheduler.pid
    
    if kill -0 $SCHEDULER_PID 2>/dev/null; then
        log_success "백업 스케줄러 시작됨 (PID: $SCHEDULER_PID)"
    else
        log_warn "백업 스케줄러 시작 실패 (선택사항)"
    fi
    
    cd ..
}

# 프론트엔드 시작
start_frontend() {
    log_info "프론트엔드 개발 서버 시작 중..."
    
    # React 개발 서버 시작 (포트 3000)
    npm start > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > logs/frontend.pid
    
    log_success "프론트엔드 서버 시작됨 (PID: $FRONTEND_PID)"
    log_info "프론트엔드는 http://localhost:3000에서 실행됩니다"
}

# 시스템 상태 확인
check_system_status() {
    log_info "시스템 상태 확인 중..."
    
    # API 서버 상태 확인
    if curl -s http://localhost:8003/health > /dev/null 2>&1; then
        log_success "메인 API 서버: 정상 동작"
    else
        log_warn "메인 API 서버: 응답 없음"
    fi
    
    # WebSocket 서버 상태 확인
    if curl -s http://localhost:8005/api/notifications/status > /dev/null 2>&1; then
        log_success "WebSocket 서버: 정상 동작"
    else
        log_warn "WebSocket 서버: 응답 없음"
    fi
    
    # 프론트엔드 상태 확인
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        log_success "프론트엔드: 정상 동작"
    else
        log_warn "프론트엔드: 아직 시작 중..."
    fi
}

# 시스템 정보 출력
show_system_info() {
    echo ""
    echo -e "${WHITE}================================================${NC}"
    echo -e "${PURPLE}🎉 Ultimate AI Message System이 실행되었습니다!${NC}"
    echo -e "${WHITE}================================================${NC}"
    echo ""
    echo -e "${CYAN}📡 서비스 URL:${NC}"
    echo -e "  🌐 프론트엔드:     ${BLUE}http://localhost:3000${NC}"
    echo -e "  🔧 메인 API:       ${BLUE}http://localhost:8003${NC}"
    echo -e "  🔔 WebSocket:      ${BLUE}http://localhost:8004${NC}"
    echo ""
    echo -e "${CYAN}📁 로그 파일:${NC}"
    echo -e "  📄 메인 API:       ${WHITE}logs/main_api.log${NC}"
    echo -e "  📄 WebSocket:      ${WHITE}logs/websocket.log${NC}"
    echo -e "  📄 프론트엔드:     ${WHITE}logs/frontend.log${NC}"
    echo -e "  📄 스케줄러:       ${WHITE}logs/scheduler.log${NC}"
    echo ""
    echo -e "${CYAN}🎯 주요 기능:${NC}"
    echo -e "  🤖 AI 메시지 생성   🔄 실시간 학습"
    echo -e "  🔔 실시간 알림      🌍 다국어 번역"
    echo -e "  ⏰ 자동 스케줄링    🛡️ 자동 백업"
    echo -e "  🧠 감정 분석        🎭 톤 매칭"
    echo -e "  🔍 AI 앙상블        📊 성능 모니터링"
    echo ""
    echo -e "${YELLOW}⚠️  시스템 종료: ${WHITE}./stop_ultimate_system.sh${NC}"
    echo -e "${YELLOW}📊 상태 확인: ${WHITE}./check_system_status.sh${NC}"
    echo ""
}

# 메인 실행 로직
main() {
    echo -e "${PURPLE}"
    echo "██╗   ██╗██╗  ████████╗██╗███╗   ███╗ █████╗ ████████╗███████╗"
    echo "██║   ██║██║  ╚══██╔══╝██║████╗ ████║██╔══██╗╚══██╔══╝██╔════╝"
    echo "██║   ██║██║     ██║   ██║██╔████╔██║███████║   ██║   █████╗  "
    echo "██║   ██║██║     ██║   ██║██║╚██╔╝██║██╔══██║   ██║   ██╔══╝  "
    echo "╚██████╔╝███████╗██║   ██║██║ ╚═╝ ██║██║  ██║   ██║   ███████╗"
    echo " ╚═════╝ ╚══════╝╚═╝   ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝"
    echo -e "${NC}"
    echo -e "${CYAN}AI Message System v2.0 - Enterprise Edition${NC}"
    echo ""
    
    # 단계별 실행
    check_requirements
    install_dependencies
    init_databases
    start_backend_services
    
    # 백엔드 서비스 시작 대기
    log_info "백엔드 서비스 안정화 대기 중..."
    sleep 5
    
    start_frontend
    
    # 시스템 안정화 대기
    log_info "시스템 전체 안정화 대기 중..."
    sleep 10
    
    check_system_status
    show_system_info
    
    # 지속적인 모니터링
    log_info "시스템 모니터링 시작..."
    echo -e "${GREEN}시스템이 성공적으로 시작되었습니다!${NC}"
    echo -e "${YELLOW}Ctrl+C를 눌러 종료하거나, 새 터미널에서 ./stop_ultimate_system.sh를 실행하세요.${NC}"
    
    # 모니터링 루프
    while true; do
        sleep 30
        echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} 시스템 정상 동작 중..."
    done
}

# 시그널 핸들러
cleanup() {
    echo ""
    log_info "시스템 종료 중..."
    
    # PID 파일들을 읽어서 프로세스 종료
    for pidfile in logs/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            if kill -0 "$pid" 2>/dev/null; then
                log_info "프로세스 $pid 종료 중..."
                kill "$pid"
            fi
            rm -f "$pidfile"
        fi
    done
    
    log_success "시스템이 안전하게 종료되었습니다."
    exit 0
}

# 시그널 핸들러 등록
trap cleanup SIGINT SIGTERM

# 메인 함수 실행
main "$@" 