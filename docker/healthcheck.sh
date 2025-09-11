#!/bin/bash

# CORBU AI System Health Check Script

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 기본 헬스체크
check_nginx() {
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_info "Nginx is healthy"
        return 0
    else
        log_error "Nginx health check failed"
        return 1
    fi
}

# 백엔드 API 헬스체크
check_backend() {
    if curl -f http://localhost:8004/health > /dev/null 2>&1; then
        log_info "Backend API is healthy"
        return 0
    else
        log_error "Backend API health check failed"
        return 1
    fi
}

# 데이터베이스 연결 체크
check_database() {
    if python -c "
import sqlite3
try:
    conn = sqlite3.connect('/app/backend/corbu_ai.db')
    conn.close()
    print('Database connection successful')
except Exception as e:
    print(f'Database connection failed: {e}')
    exit(1)
" > /dev/null 2>&1; then
        log_info "Database connection is healthy"
        return 0
    else
        log_warn "Database connection check failed"
        return 0  # 데이터베이스 없어도 계속 진행
    fi
}

# 메모리 사용량 체크
check_memory() {
    memory_usage=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
    if (( $(echo "$memory_usage < 90" | bc -l) )); then
        log_info "Memory usage: ${memory_usage}%"
        return 0
    else
        log_warn "High memory usage: ${memory_usage}%"
        return 0  # 경고만 하고 계속 진행
    fi
}

# 디스크 사용량 체크
check_disk() {
    disk_usage=$(df /app | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -lt 90 ]; then
        log_info "Disk usage: ${disk_usage}%"
        return 0
    else
        log_warn "High disk usage: ${disk_usage}%"
        return 0  # 경고만 하고 계속 진행
    fi
}

# 프로세스 상태 체크
check_processes() {
    if pgrep -f "nginx" > /dev/null; then
        log_info "Nginx process is running"
    else
        log_error "Nginx process is not running"
        return 1
    fi

    if pgrep -f "python.*app.py" > /dev/null; then
        log_info "Backend process is running"
    else
        log_error "Backend process is not running"
        return 1
    fi

    return 0
}

# 메인 헬스체크 함수
main() {
    log_info "Starting CORBU AI System health check..."
    
    local exit_code=0
    
    # 각 체크 실행
    check_nginx || exit_code=1
    check_backend || exit_code=1
    check_database
    check_memory
    check_disk
    check_processes || exit_code=1
    
    if [ $exit_code -eq 0 ]; then
        log_info "All health checks passed"
    else
        log_error "Some health checks failed"
    fi
    
    exit $exit_code
}

# 스크립트 실행
main "$@"
