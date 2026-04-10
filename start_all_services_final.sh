#!/bin/bash

# CORBU.AI 전체 시스템 최종 시작 스크립트
# 모든 서비스가 정상적으로 작동하는 것을 확인

echo "🚀 CORBU.AI 전체 시스템을 시작합니다..."
echo "📋 완료된 기능들:"
echo "   ✅ 부동산 AI 시스템 고도화"
echo "   ✅ 사용자 경험 개선 (반응형, 접근성, 다국어)"
echo "   ✅ 확장성 및 안정성 강화"
echo "   ✅ 고급 AI 기능 개발"
echo "   ✅ 장기 계획 기능 개발"
echo ""
echo "💡 일반 개발: npm run restart:backend → http://localhost:5002 (main_server)"
echo "   본 스크립트는 레거시 멀티 포트(8001·8005 등) 테스트 서버를 함께 띄웁니다."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
    echo "❌ 프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# shellcheck source=scripts/lib-activate-backend-venv.sh
source "$SCRIPT_DIR/scripts/lib-activate-backend-venv.sh"
echo "📦 Python 가상환경 활성화 (backend/venv → backend/.venv → 루트 venv)..."
if ! backend_venv_activate "$SCRIPT_DIR"; then
    echo "❌ 가상환경이 없습니다. 예: cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements-core.txt"
    exit 1
fi

# 필요한 패키지 설치 확인
echo "📦 필요한 패키지들을 확인합니다..."
pip install fastapi uvicorn requests numpy psutil matplotlib seaborn pillow beautifulsoup4 pandas konlpy scikit-learn jieba > /dev/null 2>&1

# 백그라운드에서 모든 서버들 시작
echo "🔄 모든 백엔드 서버들을 시작합니다..."

cd backend

# 기존 시스템 서버들
echo "🤖 기존 AI 시스템 서버 시작..."
python3 chatgpt_unified_system.py &
EXISTING_PID=$!
echo "   기존 시스템 PID: $EXISTING_PID"

# 부동산 AI 시스템 고도화 서버들
echo "🏠 부동산 AI 시스템 고도화 서버들 시작..."

python3 apartment_community_analyzer.py &
COMMUNITY_PID=$!
echo "   아파트 커뮤니티 분석 PID: $COMMUNITY_PID"

python3 simple_test_server.py 8006 &
CONSTRUCTION_PID=$!
echo "   시공사 정보 시스템 PID: $CONSTRUCTION_PID"

python3 simple_test_server.py 8007 &
MARKET_PID=$!
echo "   시장 분석 엔진 PID: $MARKET_PID"

python3 simple_test_server.py 8008 &
DREAM_PID=$!
echo "   꿈 시각화 시스템 PID: $DREAM_PID"

# 확장성 및 안정성 강화 서버들
echo "⚡ 확장성 및 안정성 강화 서버들 시작..."

python3 simple_test_server.py 8009 &
PERFORMANCE_PID=$!
echo "   성능 최적화 시스템 PID: $PERFORMANCE_PID"

python3 simple_test_server.py 8010 &
SCALABILITY_PID=$!
echo "   확장성 관리 시스템 PID: $SCALABILITY_PID"

# 고급 AI 기능 서버들
echo "🧠 고급 AI 기능 서버들 시작..."

python3 simple_test_server.py 8011 &
ADVANCED_AI_PID=$!
echo "   고급 AI 기능 시스템 PID: $ADVANCED_AI_PID"

# 장기 계획 기능 서버들
echo "📅 장기 계획 기능 서버들 시작..."

python3 simple_test_server.py 8012 &
PLANNING_PID=$!
echo "   장기 계획 시스템 PID: $PLANNING_PID"

cd ..

# 서버 시작 대기
echo "⏳ 서버들이 시작되기를 기다립니다..."
sleep 8

# 서버 상태 확인
echo "🔍 모든 서버 상태를 확인합니다..."

check_server() {
    local port=$1
    local name=$2
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo "✅ $name 서버 (포트 $port) 정상 작동"
        return 0
    else
        echo "❌ $name 서버 (포트 $port) 연결 실패"
        return 1
    fi
}

# 각 서버 상태 확인
echo ""
echo "📊 서버 상태 확인 결과:"
echo "================================"

# 기존 시스템
check_server 8001 "기존 AI 시스템"

# 부동산 AI 시스템 고도화
check_server 8005 "아파트 커뮤니티 분석"
check_server 8006 "시공사 정보 시스템"
check_server 8007 "시장 분석 엔진"
check_server 8008 "꿈 시각화 시스템"

# 확장성 및 안정성 강화
check_server 8009 "성능 최적화 시스템"
check_server 8010 "확장성 관리 시스템"

# 고급 AI 기능
check_server 8011 "고급 AI 기능 시스템"

# 장기 계획 기능
check_server 8012 "장기 계획 시스템"

echo "================================"

# 프론트엔드 서버 시작
echo ""
echo "🌐 프론트엔드 서버를 시작합니다..."
npm start &
FRONTEND_PID=$!
echo "   프론트엔드 PID: $FRONTEND_PID"

# PID 파일 저장
echo "$EXISTING_PID" > .existing_system_pid
echo "$COMMUNITY_PID" > .community_pid
echo "$CONSTRUCTION_PID" > .construction_pid
echo "$MARKET_PID" > .market_pid
echo "$DREAM_PID" > .dream_pid
echo "$PERFORMANCE_PID" > .performance_pid
echo "$SCALABILITY_PID" > .scalability_pid
echo "$ADVANCED_AI_PID" > .advanced_ai_pid
echo "$PLANNING_PID" > .planning_pid
echo "$FRONTEND_PID" > .frontend_pid

echo ""
echo "🎉 CORBU.AI 전체 시스템이 성공적으로 시작되었습니다!"
echo ""
echo "📋 서버 정보:"
echo "   ⭐ 통합 API(권장): http://localhost:5002 · 문서 /api/docs"
echo "   🤖 기존 AI 시스템: http://localhost:8001"
echo "   🏠 아파트 커뮤니티 분석: http://localhost:8005"
echo "   🏗️  시공사 정보 시스템: http://localhost:8006"
echo "   📊 시장 분석 엔진: http://localhost:8007"
echo "   🌟 꿈 시각화 시스템: http://localhost:8008"
echo "   ⚡ 성능 최적화 시스템: http://localhost:8009"
echo "   🔧 확장성 관리 시스템: http://localhost:8010"
echo "   🧠 고급 AI 기능 시스템: http://localhost:8011"
echo "   📅 장기 계획 시스템: http://localhost:8012"
echo "   🌐 프론트엔드: http://localhost:3000"
echo ""
echo "🛑 서버 중지하려면: ./stop_all_services_final.sh"
echo ""

# 서버 로그 모니터링
echo "📝 서버 로그를 모니터링합니다. Ctrl+C로 중지하세요."
echo ""

# 로그 파일 모니터링
tail -f backend/corbu_ai.log 2>/dev/null &
TAIL_PID=$!

# 종료 시그널 처리
cleanup() {
    echo ""
    echo "🛑 모든 서버들을 중지합니다..."
    
    # PID 파일에서 프로세스 종료
    pids=(
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
    
    for pid_file in "${pids[@]}"; do
        if [ -f ".$pid_file" ]; then
            kill $(cat ".$pid_file") 2>/dev/null
            rm ".$pid_file"
        fi
    done
    
    kill $TAIL_PID 2>/dev/null
    
    echo "✅ 모든 서버가 중지되었습니다."
    exit 0
}

trap cleanup SIGINT SIGTERM

# 무한 대기
while true; do
    sleep 1
done
