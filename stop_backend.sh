#!/bin/bash

echo "🛑 CORBU AI 백엔드 시스템 중지 중..."

# PID 파일에서 프로세스 종료
kill_process_from_pid() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "🔄 $service_name 프로세스 종료 중 (PID: $pid)..."
            kill $pid
            sleep 2
            
            # 강제 종료 확인
            if ps -p $pid > /dev/null 2>&1; then
                echo "⚠️  강제 종료 중..."
                kill -9 $pid
            fi
            
            rm -f "$pid_file"
            echo "✅ $service_name 종료 완료"
        else
            echo "ℹ️  $service_name 프로세스가 이미 종료됨"
            rm -f "$pid_file"
        fi
    else
        echo "ℹ️  $service_name PID 파일이 없음"
    fi
}

# 프로세스 이름으로 종료
kill_process_by_name() {
    local process_name=$1
    local service_name=$2
    
    if pgrep -f "$process_name" > /dev/null; then
        echo "🔄 $service_name 프로세스 종료 중..."
        pkill -f "$process_name"
        sleep 2
        
        # 강제 종료 확인
        if pgrep -f "$process_name" > /dev/null; then
            echo "⚠️  강제 종료 중..."
            pkill -9 -f "$process_name"
        fi
        
        echo "✅ $service_name 종료 완료"
    else
        echo "ℹ️  $service_name 프로세스가 실행 중이 아님"
    fi
}

# PID 파일 기반 종료
kill_process_from_pid "logs/comprehensive_api.pid" "종합 메시지 API"
kill_process_from_pid "logs/advanced_message.pid" "고급 메시지 서버"
kill_process_from_pid "logs/analysis_server.pid" "분석 서버"

# 프로세스 이름 기반 종료 (백업)
kill_process_by_name "comprehensive_message_api.py" "종합 메시지 API"
kill_process_by_name "advanced_message_server.py" "고급 메시지 서버"
kill_process_by_name "analysis_server.py" "분석 서버"

# 포트 사용 확인
check_port_usage() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  $service_name (포트 $port)가 여전히 실행 중입니다."
        return 1
    else
        echo "✅ $service_name (포트 $port) 종료 확인"
        return 0
    fi
}

echo ""
echo "🔍 서버 종료 상태 확인 중..."
sleep 2

check_port_usage 8001 "종합 메시지 API"
check_port_usage 8002 "고급 메시지 서버"
check_port_usage 8003 "분석 서버"

echo ""
echo "🎯 백엔드 시스템 중지 완료!"
echo "💡 서버를 다시 시작하려면: ./start_backend.sh" 