#!/bin/bash

# CORBU AI System Startup Script

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# 환경 변수 설정
export PYTHONPATH="/app/backend:$PYTHONPATH"
export FLASK_ENV="production"
export NODE_ENV="production"

# 디렉토리 생성
create_directories() {
    log_info "Creating necessary directories..."
    
    mkdir -p /var/log/supervisor
    mkdir -p /var/log/nginx
    mkdir -p /app/backend/logs
    mkdir -p /app/backend/data
    
    # 권한 설정
    chown -R corbu:corbu /app/backend/logs
    chown -R corbu:corbu /app/backend/data
}

# 데이터베이스 초기화
init_database() {
    log_info "Initializing database..."
    
    cd /app/backend
    
    if [ ! -f "corbu_ai.db" ]; then
        log_info "Creating new database..."
        python -c "
import sqlite3
conn = sqlite3.connect('corbu_ai.db')
cursor = conn.cursor()

# 기본 테이블 생성
cursor.execute('''
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS user_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER,
    rating INTEGER,
    feedback TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations (id)
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS system_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

conn.commit()
conn.close()
print('Database initialized successfully')
"
        log_info "Database initialized successfully"
    else
        log_info "Database already exists"
    fi
}

# 백엔드 서비스 시작
start_backend() {
    log_info "Starting backend services..."
    
    cd /app/backend
    
    # 백그라운드에서 Flask 앱 시작
    nohup python app.py > logs/flask.log 2>&1 &
    FLASK_PID=$!
    echo $FLASK_PID > logs/flask.pid
    
    # FastAPI 앱 시작
    nohup python -m uvicorn app:app --host 0.0.0.0 --port 8004 --workers 4 > logs/fastapi.log 2>&1 &
    FASTAPI_PID=$!
    echo $FASTAPI_PID > logs/fastapi.pid
    
    log_info "Backend services started (Flask PID: $FLASK_PID, FastAPI PID: $FASTAPI_PID)"
}

# Nginx 시작
start_nginx() {
    log_info "Starting Nginx..."
    
    # Nginx 설정 테스트
    nginx -t
    
    # Nginx 시작
    nginx -g "daemon off;" &
    NGINX_PID=$!
    echo $NGINX_PID > /var/run/nginx.pid
    
    log_info "Nginx started (PID: $NGINX_PID)"
}

# 헬스체크 대기
wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost/health > /dev/null 2>&1; then
            log_info "Nginx is ready"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "Nginx failed to start within timeout"
            exit 1
        fi
        
        log_debug "Waiting for Nginx... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8004/health > /dev/null 2>&1; then
            log_info "Backend API is ready"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "Backend API failed to start within timeout"
            exit 1
        fi
        
        log_debug "Waiting for Backend API... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
}

# 시그널 핸들러
cleanup() {
    log_info "Shutting down CORBU AI System..."
    
    # 프로세스 종료
    if [ -f "/var/run/nginx.pid" ]; then
        nginx -s quit
    fi
    
    if [ -f "/app/backend/logs/flask.pid" ]; then
        kill $(cat /app/backend/logs/flask.pid) 2>/dev/null || true
    fi
    
    if [ -f "/app/backend/logs/fastapi.pid" ]; then
        kill $(cat /app/backend/logs/fastapi.pid) 2>/dev/null || true
    fi
    
    log_info "Shutdown complete"
    exit 0
}

# 시그널 트랩 설정
trap cleanup SIGTERM SIGINT

# 메인 시작 함수
main() {
    log_info "Starting CORBU AI System..."
    log_info "Version: 2.0.0"
    log_info "Environment: $NODE_ENV"
    
    # 디렉토리 생성
    create_directories
    
    # 데이터베이스 초기화
    init_database
    
    # 서비스 시작
    start_backend
    start_nginx
    
    # 서비스 준비 대기
    wait_for_services
    
    log_info "CORBU AI System is ready!"
    log_info "Frontend: http://localhost"
    log_info "Backend API: http://localhost:8004"
    log_info "Health Check: http://localhost/health"
    
    # 헬스체크 루프
    while true; do
        sleep 30
        /usr/local/bin/healthcheck.sh > /dev/null 2>&1 || log_warn "Health check failed"
    done
}

# 스크립트 실행
main "$@"
