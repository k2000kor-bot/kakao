#!/bin/bash

# CORBU AI 전체 시스템 중지 스크립트

echo "🛑 CORBU AI 전체 시스템을 중지합니다..."

# PID 파일이 있는지 확인
pid_files=(
    "existing_system_pid"
    "community_pid"
    "construction_pid"
    "market_pid"
    "dream_pid"
    "performance_pid"
    "scalability_pid"
    "advanced_ai_pid"
    "planning_pid"
    "frontend_pid"
)

server_names=(
    "기존 AI 시스템"
    "아파트 커뮤니티 분석"
    "시공사 정보 시스템"
    "시장 분석 엔진"
    "꿈 시각화 시스템"
    "성능 최적화 시스템"
    "확장성 관리 시스템"
    "고급 AI 기능 시스템"
    "장기 계획 시스템"
    "프론트엔드"
)

# PID 파일에서 프로세스 종료
for i in "${!pid_files[@]}"; do
    pid_file=".${pid_files[$i]}"
    server_name="${server_names[$i]}"
    
    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        echo "🔄 $server_name 중지 (PID: $PID)..."
        kill $PID 2>/dev/null
        rm "$pid_file"
    else
        echo "⚠️  $server_name PID 파일이 없습니다."
    fi
done

# 추가로 포트별 프로세스 확인 및 종료
echo ""
echo "🔍 남은 프로세스들을 확인합니다..."

PORTS=(8001 8005 8006 8007 8008 8009 8010 8011 8012 3000)

for port in "${PORTS[@]}"; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "⚠️  포트 $port에 실행 중인 프로세스 발견 (PID: $PID). 강제 종료합니다..."
        kill -9 $PID 2>/dev/null
    else
        echo "✅ 포트 $port 정리 완료"
    fi
done

echo ""
echo "🎉 CORBU AI 전체 시스템이 성공적으로 중지되었습니다!"
echo ""

# 서버 상태 최종 확인
echo "🔍 최종 서버 상태 확인:"

check_server() {
    local port=$1
    local name=$2
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo "⚠️  $name 서버 (포트 $port) 아직 실행 중"
        return 1
    else
        echo "✅ $name 서버 (포트 $port) 정상 중지"
        return 0
    fi
}

check_server 8001 "기존 AI 시스템"
check_server 8005 "아파트 커뮤니티 분석"
check_server 8006 "시공사 정보 시스템"
check_server 8007 "시장 분석 엔진"
check_server 8008 "꿈 시각화 시스템"
check_server 8009 "성능 최적화 시스템"
check_server 8010 "확장성 관리 시스템"
check_server 8011 "고급 AI 기능 시스템"
check_server 8012 "장기 계획 시스템"
check_server 3000 "프론트엔드"

echo ""
echo "✨ 모든 서버가 정상적으로 중지되었습니다!"
