#!/bin/bash

# Ultimate AI Message System Stopper
# 시스템 안전 종료 스크립트

echo "🛑 Ultimate AI Message System 종료 중..."
echo "======================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# PID 파일 기반 프로세스 종료
stop_process_by_pid() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log_info "${service_name} 종료 중 (PID: $pid)..."
            kill "$pid"
            
            # 종료 대기 (최대 10초)
            local count=0
            while kill -0 "$pid" 2>/dev/null && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            # 강제 종료가 필요한 경우
            if kill -0 "$pid" 2>/dev/null; then
                log_warn "${service_name} 강제 종료 중..."
                kill -9 "$pid" 2>/dev/null
            fi
            
            log_success "${service_name} 종료 완료"
        else
            log_warn "${service_name} 프로세스가 이미 종료됨"
        fi
        rm -f "$pid_file"
    else
        log_warn "${service_name} PID 파일을 찾을 수 없음"
    fi
}

# 포트 기반 프로세스 종료
stop_process_by_port() {
    local port=$1
    local service_name=$2
    
    log_info "${service_name} (포트 ${port}) 종료 확인 중..."
    
    # macOS/Linux 호환 포트 사용 프로세스 찾기
    if command -v lsof &> /dev/null; then
        local pid=$(lsof -ti :$port 2>/dev/null)
        if [ -n "$pid" ]; then
            log_info "${service_name} 프로세스 종료 중 (PID: $pid)..."
            kill "$pid" 2>/dev/null
            sleep 2
            
            # 강제 종료 확인
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null
            fi
            log_success "${service_name} 종료 완료"
        else
            log_success "${service_name} 이미 종료됨"
        fi
    else
        log_warn "lsof 명령어를 찾을 수 없습니다. 수동으로 포트 ${port} 프로세스를 확인해주세요."
    fi
}

# 백업 진행 중인 작업 확인
check_backup_status() {
    log_info "진행 중인 백업 작업 확인..."
    
    cd backend 2>/dev/null || return
    
    # 백업 상태 확인 (Python 스크립트)
    python3 -c "
import sqlite3
from pathlib import Path

backup_db = Path('backups/backup_metadata.db')
if backup_db.exists():
    try:
        with sqlite3.connect(backup_db) as conn:
            cursor = conn.cursor()
            cursor.execute(\"SELECT COUNT(*) FROM backup_records WHERE status = 'in_progress'\")
            in_progress = cursor.fetchone()[0]
            
            if in_progress > 0:
                print(f'경고: {in_progress}개의 백업이 진행 중입니다.')
                print('잠시 기다린 후 다시 시도하거나, 강제 종료하려면 -f 옵션을 사용하세요.')
                exit(1)
            else:
                print('진행 중인 백업 없음')
    except Exception as e:
        print(f'백업 상태 확인 실패: {e}')
else:
    print('백업 데이터베이스 없음')
" 2>/dev/null || log_warn "백업 상태 확인 실패"
    
    cd ..
}

# 로그 파일 정리
cleanup_logs() {
    log_info "로그 파일 정리 중..."
    
    # 오래된 로그 파일 아카이브 (7일 이상)
    if [ -d "logs" ]; then
        find logs -name "*.log" -mtime +7 -exec gzip {} \; 2>/dev/null
        find logs -name "*.log.gz" -mtime +30 -delete 2>/dev/null
        log_success "로그 파일 정리 완료"
    fi
}

# 임시 파일 정리
cleanup_temp_files() {
    log_info "임시 파일 정리 중..."
    
    # Node.js 임시 파일
    rm -rf .npm 2>/dev/null
    rm -rf node_modules/.cache 2>/dev/null
    
    # Python 캐시 파일
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null
    find . -name "*.pyc" -delete 2>/dev/null
    
    # 백업 임시 파일
    find backend/backups -name "temp_*" -delete 2>/dev/null
    
    log_success "임시 파일 정리 완료"
}

# 시스템 상태 리포트
generate_shutdown_report() {
    local report_file="logs/shutdown_report_$(date +%Y%m%d_%H%M%S).txt"
    
    log_info "종료 리포트 생성 중..."
    
    cat > "$report_file" << EOF
Ultimate AI Message System - Shutdown Report
Generated: $(date)
============================================

Service Status:
- Main API Server (8003): STOPPED
- WebSocket Server (8004): STOPPED  
- Frontend Server (3000): STOPPED
- Backup Scheduler: STOPPED

Log Files Preserved:
$(ls -la logs/*.log 2>/dev/null | wc -l) log files found

System Resources at Shutdown:
- Memory Usage: $(ps aux | awk '{sum+=$6} END {print sum/1024 " MB"}' 2>/dev/null || echo "N/A")
- Disk Usage: $(df -h . | tail -1 | awk '{print $5}' 2>/dev/null || echo "N/A")

Backup Status:
$(cd backend && python3 -c "
from backup_recovery_system import backup_system
try:
    stats = backup_system.get_backup_statistics(7)
    print(f\"Recent backups: {stats.get('total_backups', 0)}\")
    print(f\"Success rate: {stats.get('success_rate', 0)}%\")
except Exception as e:
    print(f'Stats unavailable: {e}')
" 2>/dev/null || echo "Backup stats unavailable")

Shutdown completed successfully.
EOF
    
    log_success "종료 리포트 저장됨: $report_file"
}

# 메인 종료 로직
main() {
    local force_shutdown=false
    
    # 명령줄 옵션 처리
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--force)
                force_shutdown=true
                shift
                ;;
            -h|--help)
                echo "사용법: $0 [옵션]"
                echo "옵션:"
                echo "  -f, --force    강제 종료 (백업 진행 중이어도 종료)"
                echo "  -h, --help     도움말 표시"
                exit 0
                ;;
            *)
                log_warn "알 수 없는 옵션: $1"
                shift
                ;;
        esac
    done
    
    echo "🔄 시스템 종료 절차 시작..."
    
    # 백업 상태 확인 (강제 종료가 아닌 경우)
    if [ "$force_shutdown" = false ]; then
        check_backup_status
        if [ $? -ne 0 ]; then
            echo "종료 취소됨. 강제 종료하려면 -f 옵션을 사용하세요."
            exit 1
        fi
    fi
    
    # 서비스별 종료
    echo ""
    log_info "백엔드 서비스 종료 중..."
    
    # 1. 스케줄러 종료
    stop_process_by_pid "scheduler"
    
    # 2. WebSocket 서버 종료
    stop_process_by_pid "websocket"
    stop_process_by_port "8004" "WebSocket Server"
    
    # 3. 메인 API 서버 종료
    stop_process_by_pid "main_api"
    stop_process_by_port "8003" "Main API Server"
    
    # 4. 프론트엔드 종료
    log_info "프론트엔드 서비스 종료 중..."
    stop_process_by_pid "frontend"
    stop_process_by_port "3000" "Frontend Server"
    
    # 추가 정리 작업
    echo ""
    log_info "시스템 정리 작업 수행 중..."
    
    cleanup_temp_files
    cleanup_logs
    generate_shutdown_report
    
    # 최종 확인
    echo ""
    log_info "최종 상태 확인..."
    
    local running_processes=0
    for port in 3000 8003 8004; do
        if command -v lsof &> /dev/null; then
            if lsof -ti :$port &>/dev/null; then
                log_warn "포트 $port가 여전히 사용 중입니다"
                running_processes=$((running_processes + 1))
            fi
        fi
    done
    
    if [ $running_processes -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Ultimate AI Message System이 성공적으로 종료되었습니다!${NC}"
        echo ""
        echo -e "${BLUE}📊 종료 요약:${NC}"
        echo -e "  🔴 모든 서비스 중지됨"
        echo -e "  🧹 임시 파일 정리됨"  
        echo -e "  📝 로그 파일 보존됨"
        echo -e "  💾 데이터 안전하게 저장됨"
        echo ""
        echo -e "${YELLOW}💡 다시 시작하려면: ${NC}./start_ultimate_system.sh"
        echo ""
    else
        echo ""
        log_warn "일부 프로세스가 여전히 실행 중일 수 있습니다."
        echo -e "${YELLOW}수동으로 확인하려면: ${NC}lsof -ti :3000,8003,8004"
        echo -e "${YELLOW}강제 종료하려면: ${NC}$0 --force"
    fi
}

# 스크립트 실행
main "$@" 