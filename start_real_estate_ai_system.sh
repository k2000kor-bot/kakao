#!/bin/bash

# 부동산 AI 시스템 고도화 서버 시작 스크립트
# 아파트 커뮤니티 분석, 시공사 정보, 시장 분석, 꿈 시각화 시스템

echo "🚀 부동산 AI 시스템 고도화 서버들을 시작합니다..."

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
    echo "❌ 프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# Python 가상환경 활성화
if [ -d "backend/venv" ]; then
    echo "📦 Python 가상환경을 활성화합니다..."
    source backend/venv/bin/activate
else
    echo "⚠️  Python 가상환경이 없습니다. 새로 생성합니다..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# 필요한 Python 패키지 설치
echo "📦 필요한 Python 패키지를 설치합니다..."
pip install konlpy jieba scikit-learn matplotlib seaborn pillow requests beautifulsoup4 pandas numpy

# 백그라운드에서 서버들 시작
echo "🔄 백엔드 서버들을 시작합니다..."

# 아파트 커뮤니티 분석 서버 (포트 8005)
echo "🏠 아파트 커뮤니티 분석 서버 시작 (포트 8005)..."
cd backend
python apartment_community_analyzer.py &
COMMUNITY_PID=$!
echo "   PID: $COMMUNITY_PID"

# 시공사 정보 시스템 서버 (포트 8006)
echo "🏗️  시공사 정보 시스템 서버 시작 (포트 8006)..."
python construction_company_info_system.py &
CONSTRUCTION_PID=$!
echo "   PID: $CONSTRUCTION_PID"

# 시장 분석 엔진 서버 (포트 8007)
echo "📊 시장 분석 엔진 서버 시작 (포트 8007)..."
python market_analysis_engine.py &
MARKET_PID=$!
echo "   PID: $MARKET_PID"

# 꿈 시각화 시스템 서버 (포트 8008)
echo "🌟 꿈 시각화 시스템 서버 시작 (포트 8008)..."
python dream_visualization_system.py &
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
check_server 8005 "아파트 커뮤니티 분석"
check_server 8006 "시공사 정보 시스템"
check_server 8007 "시장 분석 엔진"
check_server 8008 "꿈 시각화 시스템"

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
echo "   🏠 아파트 커뮤니티 분석: http://localhost:8005"
echo "   🏗️  시공사 정보 시스템: http://localhost:8006"
echo "   📊 시장 분석 엔진: http://localhost:8007"
echo "   🌟 꿈 시각화 시스템: http://localhost:8008"
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
