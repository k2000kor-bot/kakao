#!/bin/bash

# Ultimate AI Message System Status Checker
# 시스템 상태 실시간 모니터링 스크립트

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# 상태 체크 함수들
check_service_status() {
    local url=$1
    local service_name=$2
    local timeout=${3:-5}
    
    if curl -s --max-time $timeout "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}● $service_name${NC}"
        return 0
    else
        echo -e "${RED}● $service_name${NC}"
        return 1
    fi
}

check_port_status() {
    local port=$1
    local service_name=$2
    
    if command -v lsof &> /dev/null; then
        if lsof -ti :$port &>/dev/null; then
            local pid=$(lsof -ti :$port)
            echo -e "${GREEN}● $service_name${NC} (PID: $pid, 포트: $port)"
            return 0
        else
            echo -e "${RED}● $service_name${NC} (포트: $port 사용 안함)"
            return 1
        fi
    else
        echo -e "${YELLOW}● $service_name${NC} (포트 확인 불가)"
        return 2
    fi
}

get_system_resources() {
    echo -e "${CYAN}📊 시스템 리소스:${NC}"
    
    # CPU 사용률
    if command -v top &> /dev/null; then
        local cpu_usage=$(top -l 1 -n 0 | grep "CPU usage" | awk '{print $3}' 2>/dev/null || echo "N/A")
        echo -e "  💻 CPU 사용률: ${WHITE}$cpu_usage${NC}"
    fi
    
    # 메모리 사용률
    if command -v vm_stat &> /dev/null; then
        local free_pages=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        local total_pages=$(( $(vm_stat | grep "Pages free\|Pages active\|Pages inactive\|Pages speculative\|Pages wired down" | awk '{print $3}' | sed 's/\.//' | paste -sd+ | bc) ))
        local used_pages=$((total_pages - free_pages))
        local memory_usage=$(( (used_pages * 100) / total_pages ))
        echo -e "  🧠 메모리 사용률: ${WHITE}${memory_usage}%${NC}"
    fi
    
    # 디스크 사용률
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}' 2>/dev/null || echo "N/A")
    echo -e "  💾 디스크 사용률: ${WHITE}$disk_usage${NC}"
    
    # 네트워크 연결 수
    if command -v netstat &> /dev/null; then
        local connections=$(netstat -an | grep ESTABLISHED | wc -l 2>/dev/null || echo "N/A")
        echo -e "  🌐 활성 연결: ${WHITE}$connections${NC}"
    fi
}

get_service_details() {
    echo -e "${CYAN}🔧 서비스 상세 정보:${NC}"
    
    # API 서버 상태
    if curl -s http://localhost:8003/health &>/dev/null; then
        echo -e "  ${GREEN}✓${NC} 메인 API 서버 (8003) - 정상"
        
        # API 응답 시간 측정
        local response_time=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:8003/health 2>/dev/null || echo "N/A")
        echo -e "    📡 응답 시간: ${WHITE}${response_time}초${NC}"
    else
        echo -e "  ${RED}✗${NC} 메인 API 서버 (8003) - 오프라인"
    fi
    
    # WebSocket 서버 상태
    if curl -s http://localhost:8004/api/notifications/status &>/dev/null; then
        echo -e "  ${GREEN}✓${NC} WebSocket 서버 (8004) - 정상"
        
        # WebSocket 연결 수
        local ws_status=$(curl -s http://localhost:8004/api/notifications/status | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f\"연결: {data.get('connected_clients', 0)}명, 활성방: {data.get('active_rooms', 0)}개\")
except:
    print('정보 없음')
" 2>/dev/null || echo "정보 없음")
        echo -e "    🔔 ${WHITE}$ws_status${NC}"
    else
        echo -e "  ${RED}✗${NC} WebSocket 서버 (8004) - 오프라인"
    fi
    
    # 프론트엔드 상태
    if curl -s http://localhost:3000 &>/dev/null; then
        echo -e "  ${GREEN}✓${NC} 프론트엔드 (3000) - 정상"
    else
        echo -e "  ${RED}✗${NC} 프론트엔드 (3000) - 오프라인"
    fi
}

get_database_status() {
    echo -e "${CYAN}🗄️ 데이터베이스 상태:${NC}"
    
    cd backend 2>/dev/null || return
    
    # 각 데이터베이스 파일 확인
    local databases=(
        "advanced_message_system.db:메인 시스템"
        "multilingual.db:다국어 시스템"
        "ai_ensemble.db:AI 앙상블"
        "scheduler.db:스케줄러"
        "backups/backup_metadata.db:백업 시스템"
    )
    
    for db_info in "${databases[@]}"; do
        IFS=':' read -r db_file db_name <<< "$db_info"
        
        if [ -f "$db_file" ]; then
            local db_size=$(du -h "$db_file" 2>/dev/null | cut -f1 || echo "N/A")
            echo -e "  ${GREEN}✓${NC} $db_name - ${WHITE}$db_size${NC}"
            
            # 간단한 연결 테스트
            if python3 -c "
import sqlite3
try:
    conn = sqlite3.connect('$db_file')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM sqlite_master WHERE type=\"table\"')
    table_count = cursor.fetchone()[0]
    print(f'    📊 테이블 수: {table_count}')
    conn.close()
except Exception as e:
    print(f'    ⚠️ 연결 오류: {e}')
" 2>/dev/null; then
                :
            fi
        else
            echo -e "  ${RED}✗${NC} $db_name - 파일 없음"
        fi
    done
    
    cd ..
}

get_log_summary() {
    echo -e "${CYAN}📋 로그 요약 (최근 1시간):${NC}"
    
    if [ -d "logs" ]; then
        # 오류 로그 카운트
        local error_count=$(find logs -name "*.log" -mmin -60 -exec grep -i "error" {} \; 2>/dev/null | wc -l)
        local warning_count=$(find logs -name "*.log" -mmin -60 -exec grep -i "warn" {} \; 2>/dev/null | wc -l)
        local info_count=$(find logs -name "*.log" -mmin -60 -exec grep -i "info" {} \; 2>/dev/null | wc -l)
        
        echo -e "  ${RED}🔴${NC} 오류: ${WHITE}$error_count${NC}"
        echo -e "  ${YELLOW}🟡${NC} 경고: ${WHITE}$warning_count${NC}"
        echo -e "  ${BLUE}🔵${NC} 정보: ${WHITE}$info_count${NC}"
        
        # 최근 오류 표시
        if [ $error_count -gt 0 ]; then
            echo -e "  ${RED}최근 오류:${NC}"
            find logs -name "*.log" -mmin -60 -exec grep -i "error" {} \; 2>/dev/null | tail -3 | sed 's/^/    /'
        fi
    else
        echo -e "  ${YELLOW}로그 디렉토리 없음${NC}"
    fi
}

get_ai_performance_stats() {
    echo -e "${CYAN}🤖 AI 성능 통계:${NC}"
    
    cd backend 2>/dev/null || return
    
    # AI 앙상블 통계
    local ai_stats=$(python3 -c "
from ai_ensemble_system import ai_ensemble
try:
    stats = ai_ensemble.get_model_performance_stats(7)
    performance = stats.get('model_performance', [])
    if performance:
        best_model = max(performance, key=lambda x: x.get('avg_confidence', 0))
        print(f\"최고 성능: {best_model.get('model', 'N/A')} ({best_model.get('avg_confidence', 0):.3f})\")
        print(f\"총 요청: {sum(p.get('total_responses', 0) for p in performance)}\")
    else:
        print('통계 없음')
except Exception as e:
    print(f'통계 로드 실패: {e}')
" 2>/dev/null || echo "AI 통계 없음")
    
    echo -e "  🧠 $ai_stats" | head -2 | sed 's/^/  /'
    
    # 번역 시스템 통계
    local translation_stats=$(python3 -c "
from multilingual_system import multilingual_system
try:
    stats = multilingual_system.get_translation_statistics(7)
    print(f\"번역 수: {stats.get('total_translations', 0)}\")
    print(f\"평균 신뢰도: {stats.get('average_confidence', 0):.2f}\")
except Exception as e:
    print(f'번역 통계 없음: {e}')
" 2>/dev/null || echo "번역 통계 없음")
    
    echo -e "  🌍 $translation_stats" | head -2 | sed 's/^/  /'
    
    cd ..
}

get_backup_status() {
    echo -e "${CYAN}💾 백업 시스템 상태:${NC}"
    
    cd backend 2>/dev/null || return
    
    local backup_stats=$(python3 -c "
from backup_recovery_system import backup_system
try:
    stats = backup_system.get_backup_statistics(7)
    print(f\"총 백업: {stats.get('total_backups', 0)}개\")
    print(f\"성공률: {stats.get('success_rate', 0)}%\")
    print(f\"총 크기: {stats.get('total_size_gb', 0)} GB\")
    
    recent = stats.get('recent_backups', [])
    if recent:
        latest = recent[0]
        print(f\"최근: {latest.get('created_at', 'N/A')[:16]}\")
except Exception as e:
    print(f'백업 통계 로드 실패: {e}')
" 2>/dev/null || echo "백업 통계 없음")
    
    echo "$backup_stats" | sed 's/^/  💾 /'
    
    cd ..
}

# 실시간 모니터링 모드
monitor_mode() {
    echo -e "${PURPLE}🔄 실시간 모니터링 모드 (Ctrl+C로 종료)${NC}"
    echo ""
    
    while true; do
        clear
        echo -e "${WHITE}Ultimate AI Message System - Live Monitor${NC}"
        echo -e "${BLUE}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
        echo "=================================================="
        
        # 핵심 서비스 상태
        echo -e "${CYAN}🚀 핵심 서비스:${NC}"
        check_service_status "http://localhost:8003/health" "메인 API 서버"
        check_service_status "http://localhost:8004/api/notifications/status" "WebSocket 서버"
        check_service_status "http://localhost:3000" "프론트엔드"
        echo ""
        
        get_system_resources
        echo ""
        
        # 간단한 통계
        echo -e "${CYAN}📊 빠른 통계:${NC}"
        if curl -s http://localhost:8004/api/notifications/status &>/dev/null; then
            local quick_stats=$(curl -s http://localhost:8004/api/notifications/status | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f\"  🔔 WebSocket 연결: {data.get('connected_clients', 0)}명\")
    print(f\"  💬 활성 채팅방: {data.get('active_rooms', 0)}개\")
except:
    pass
" 2>/dev/null)
            echo "$quick_stats"
        fi
        
        echo ""
        echo -e "${YELLOW}다음 업데이트: 5초 후...${NC}"
        sleep 5
    done
}

# 도움말 표시
show_help() {
    echo "Ultimate AI Message System - Status Checker"
    echo ""
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  -m, --monitor     실시간 모니터링 모드"
    echo "  -q, --quick       빠른 상태 체크만"
    echo "  -d, --detailed    상세 정보 포함"
    echo "  -h, --help        도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0                기본 상태 체크"
    echo "  $0 -m             실시간 모니터링"
    echo "  $0 -d             상세 정보 포함"
}

# 메인 함수
main() {
    local monitor_mode_flag=false
    local quick_mode=false
    local detailed_mode=false
    
    # 옵션 파싱
    while [[ $# -gt 0 ]]; do
        case $1 in
            -m|--monitor)
                monitor_mode_flag=true
                shift
                ;;
            -q|--quick)
                quick_mode=true
                shift
                ;;
            -d|--detailed)
                detailed_mode=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                echo "알 수 없는 옵션: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 실시간 모니터링 모드
    if [ "$monitor_mode_flag" = true ]; then
        monitor_mode
        return
    fi
    
    # 헤더
    echo -e "${PURPLE}"
    echo "██╗   ██╗██╗  ████████╗██╗███╗   ███╗ █████╗ ████████╗███████╗"
    echo "██║   ██║██║  ╚══██╔══╝██║████╗ ████║██╔══██╗╚══██╔══╝██╔════╝"  
    echo "██║   ██║██║     ██║   ██║██╔████╔██║███████║   ██║   █████╗  "
    echo "██║   ██║██║     ██║   ██║██║╚██╔╝██║██╔══██║   ██║   ██╔══╝  "
    echo "╚██████╔╝███████╗██║   ██║██║ ╚═╝ ██║██║  ██║   ██║   ███████╗"
    echo " ╚═════╝ ╚══════╝╚═╝   ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝"
    echo -e "${NC}"
    echo -e "${CYAN}시스템 상태 체크 - $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo "=================================================="
    echo ""
    
    # 빠른 모드
    if [ "$quick_mode" = true ]; then
        echo -e "${CYAN}🚀 핵심 서비스 상태:${NC}"
        check_service_status "http://localhost:8003/health" "메인 API 서버"
        check_service_status "http://localhost:8004/api/notifications/status" "WebSocket 서버" 
        check_service_status "http://localhost:3000" "프론트엔드"
        echo ""
        get_system_resources
        return
    fi
    
    # 기본 상태 체크
    get_service_details
    echo ""
    get_system_resources
    echo ""
    get_database_status
    echo ""
    get_log_summary
    
    # 상세 모드
    if [ "$detailed_mode" = true ]; then
        echo ""
        get_ai_performance_stats
        echo ""
        get_backup_status
    fi
    
    echo ""
    echo -e "${GREEN}✅ 상태 체크 완료!${NC}"
    echo ""
    echo -e "${YELLOW}💡 팁:${NC}"
    echo -e "  실시간 모니터링: ${WHITE}$0 -m${NC}"
    echo -e "  상세 정보: ${WHITE}$0 -d${NC}"
    echo -e "  시스템 종료: ${WHITE}./stop_ultimate_system.sh${NC}"
}

# 시그널 핸들러
cleanup() {
    echo ""
    echo -e "${GREEN}모니터링 종료됨${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 메인 실행
main "$@" 