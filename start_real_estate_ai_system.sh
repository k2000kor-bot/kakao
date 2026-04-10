#!/bin/bash

# 부동산 AI 시스템 고도화 서버 시작 스크립트
# 아파트 커뮤니티 분석, 시공사 정보, 시장 분석, 꿈 시각화 시스템

echo "🚀 부동산 AI 시스템 고도화 서버들을 시작합니다..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
    echo "❌ 프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# shellcheck source=scripts/lib-activate-backend-venv.sh
source "$SCRIPT_DIR/scripts/lib-activate-backend-venv.sh"
echo "📦 Python 가상환경 활성화..."
if ! backend_venv_activate "$SCRIPT_DIR"; then
    echo "⚠️  venv 없음. backend 에 생성합니다..."
    cd "$SCRIPT_DIR/backend" || exit 1
    python3 -m venv venv
    # shellcheck disable=SC1091
    source venv/bin/activate
    pip install -q -r requirements-core.txt 2>/dev/null || pip install -q -r requirements.txt
    cd "$SCRIPT_DIR" || exit 1
    backend_venv_activate "$SCRIPT_DIR" || { echo "❌ venv 활성화 실패"; exit 1; }
fi

# 필요한 Python 패키지 설치
echo "📦 필요한 Python 패키지를 설치합니다..."
pip install konlpy jieba scikit-learn matplotlib seaborn pillow requests beautifulsoup4 pandas numpy

# 포트 (환경 변수로 덮어쓰기 가능 — backend/*.py 와 동일 이름)
APARTMENT_COMMUNITY_PORT="${APARTMENT_COMMUNITY_PORT:-8005}"
CONSTRUCTION_COMPANY_INFO_PORT="${CONSTRUCTION_COMPANY_INFO_PORT:-8006}"
MARKET_ANALYSIS_ENGINE_PORT="${MARKET_ANALYSIS_ENGINE_PORT:-8007}"
DREAM_VISUALIZATION_PORT="${DREAM_VISUALIZATION_PORT:-8008}"

# 백그라운드에서 서버들 시작
echo "🔄 백엔드 서버들을 시작합니다..."

# 아파트 커뮤니티 분석 서버
echo "🏠 아파트 커뮤니티 분석 서버 시작 (포트 $APARTMENT_COMMUNITY_PORT)..."
cd "$SCRIPT_DIR/backend" || exit 1
PORT="$APARTMENT_COMMUNITY_PORT" python3 apartment_community_analyzer.py &
COMMUNITY_PID=$!
echo "   PID: $COMMUNITY_PID"

# 시공사 정보 시스템 서버
echo "🏗️  시공사 정보 시스템 서버 시작 (포트 $CONSTRUCTION_COMPANY_INFO_PORT)..."
PORT="$CONSTRUCTION_COMPANY_INFO_PORT" python3 construction_company_info_system.py &
CONSTRUCTION_PID=$!
echo "   PID: $CONSTRUCTION_PID"

# 시장 분석 엔진 서버
echo "📊 시장 분석 엔진 서버 시작 (포트 $MARKET_ANALYSIS_ENGINE_PORT)..."
PORT="$MARKET_ANALYSIS_ENGINE_PORT" python3 market_analysis_engine.py &
MARKET_PID=$!
echo "   PID: $MARKET_PID"

# 꿈 시각화 시스템 서버
echo "🌟 꿈 시각화 시스템 서버 시작 (포트 $DREAM_VISUALIZATION_PORT)..."
PORT="$DREAM_VISUALIZATION_PORT" python3 dream_visualization_system.py &
DREAM_PID=$!
echo "   PID: $DREAM_PID"

cd ..

# 서버 시작 대기
echo "⏳ 서버들이 시작되기를 기다립니다..."
sleep 5

# 서버 상태 확인
echo "🔍 서버 상태를 확인합니다..."

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
check_server "$APARTMENT_COMMUNITY_PORT" "아파트 커뮤니티 분석"
check_server "$CONSTRUCTION_COMPANY_INFO_PORT" "시공사 정보 시스템"
check_server "$MARKET_ANALYSIS_ENGINE_PORT" "시장 분석 엔진"
check_server "$DREAM_VISUALIZATION_PORT" "꿈 시각화 시스템"

# 프론트엔드 서버 시작
echo "🌐 프론트엔드 서버를 시작합니다..."
npm start &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"

# PID 파일 저장
echo "$COMMUNITY_PID" > .community_pid
echo "$CONSTRUCTION_PID" > .construction_pid
echo "$MARKET_PID" > .market_pid
echo "$DREAM_PID" > .dream_pid
echo "$FRONTEND_PID" > .frontend_pid

echo ""
echo "🎉 부동산 AI 시스템 고도화가 성공적으로 시작되었습니다!"
echo ""
echo "📋 서버 정보:"
echo "   ⭐ 통합 API(권장): http://localhost:5002 · 문서 /api/docs"
echo "   🏠 아파트 커뮤니티 분석: http://localhost:$APARTMENT_COMMUNITY_PORT"
echo "   🏗️  시공사 정보 시스템: http://localhost:$CONSTRUCTION_COMPANY_INFO_PORT"
echo "   📊 시장 분석 엔진: http://localhost:$MARKET_ANALYSIS_ENGINE_PORT"
echo "   🌟 꿈 시각화 시스템: http://localhost:$DREAM_VISUALIZATION_PORT"
echo "   🌐 프론트엔드: http://localhost:3000"
echo ""
echo "🛑 서버 중지하려면: ./stop_real_estate_ai_system.sh"
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
    echo "🛑 서버들을 중지합니다..."
    
    # PID 파일에서 프로세스 종료
    if [ -f .community_pid ]; then
        kill $(cat .community_pid) 2>/dev/null
        rm .community_pid
    fi
    
    if [ -f .construction_pid ]; then
        kill $(cat .construction_pid) 2>/dev/null
        rm .construction_pid
    fi
    
    if [ -f .market_pid ]; then
        kill $(cat .market_pid) 2>/dev/null
        rm .market_pid
    fi
    
    if [ -f .dream_pid ]; then
        kill $(cat .dream_pid) 2>/dev/null
        rm .dream_pid
    fi
    
    if [ -f .frontend_pid ]; then
        kill $(cat .frontend_pid) 2>/dev/null
        rm .frontend_pid
    fi
    
    kill $TAIL_PID 2>/dev/null
    
    echo "✅ 모든 서버가 중지되었습니다."
    exit 0
}

trap cleanup SIGINT SIGTERM

# 무한 대기
while true; do
    sleep 1
done
