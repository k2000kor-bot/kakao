#!/bin/bash

# 부동산 AI 시스템 고도화 서버 중지 스크립트

echo "🛑 부동산 AI 시스템 고도화 서버들을 중지합니다..."

# PID 파일이 있는지 확인
if [ ! -f .community_pid ] && [ ! -f .construction_pid ] && [ ! -f .market_pid ] && [ ! -f .dream_pid ] && [ ! -f .frontend_pid ]; then
    echo "⚠️  PID 파일이 없습니다. 실행 중인 프로세스를 찾아서 중지합니다..."
    
    # 포트별로 프로세스 찾아서 종료
    echo "🔍 포트 8005 (아파트 커뮤니티 분석) 프로세스 중지..."
    lsof -ti:8005 | xargs kill -9 2>/dev/null
    
    echo "🔍 포트 8006 (시공사 정보 시스템) 프로세스 중지..."
    lsof -ti:8006 | xargs kill -9 2>/dev/null
    
    echo "🔍 포트 8007 (시장 분석 엔진) 프로세스 중지..."
    lsof -ti:8007 | xargs kill -9 2>/dev/null
    
    echo "🔍 포트 8008 (꿈 시각화 시스템) 프로세스 중지..."
    lsof -ti:8008 | xargs kill -9 2>/dev/null
    
    echo "🔍 포트 3000 (프론트엔드) 프로세스 중지..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    
    echo "✅ 모든 프로세스가 중지되었습니다."
    exit 0
fi

# PID 파일에서 프로세스 종료
if [ -f .community_pid ]; then
    COMMUNITY_PID=$(cat .community_pid)
    echo "🏠 아파트 커뮤니티 분석 서버 중지 (PID: $COMMUNITY_PID)..."
    kill $COMMUNITY_PID 2>/dev/null
    rm .community_pid
fi

if [ -f .construction_pid ]; then
    CONSTRUCTION_PID=$(cat .construction_pid)
    echo "🏗️  시공사 정보 시스템 서버 중지 (PID: $CONSTRUCTION_PID)..."
    kill $CONSTRUCTION_PID 2>/dev/null
    rm .construction_pid
fi

if [ -f .market_pid ]; then
    MARKET_PID=$(cat .market_pid)
    echo "📊 시장 분석 엔진 서버 중지 (PID: $MARKET_PID)..."
    kill $MARKET_PID 2>/dev/null
    rm .market_pid
fi

if [ -f .dream_pid ]; then
    DREAM_PID=$(cat .dream_pid)
    echo "🌟 꿈 시각화 시스템 서버 중지 (PID: $DREAM_PID)..."
    kill $DREAM_PID 2>/dev/null
    rm .dream_pid
fi

if [ -f .frontend_pid ]; then
    FRONTEND_PID=$(cat .frontend_pid)
    echo "🌐 프론트엔드 서버 중지 (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    rm .frontend_pid
fi

# 추가로 포트별 프로세스 확인 및 종료
echo "🔍 남은 프로세스들을 확인합니다..."

PORTS=(8005 8006 8007 8008 3000)
NAMES=("아파트 커뮤니티 분석" "시공사 정보 시스템" "시장 분석 엔진" "꿈 시각화 시스템" "프론트엔드")

for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    NAME=${NAMES[$i]}
    
    PID=$(lsof -ti:$PORT 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "⚠️  포트 $PORT ($NAME)에 실행 중인 프로세스 발견 (PID: $PID). 강제 종료합니다..."
        kill -9 $PID 2>/dev/null
    else
        echo "✅ 포트 $PORT ($NAME) 정리 완료"
    fi
done

echo ""
echo "🎉 부동산 AI 시스템 고도화가 성공적으로 중지되었습니다!"
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

check_server 8005 "아파트 커뮤니티 분석"
check_server 8006 "시공사 정보 시스템"
check_server 8007 "시장 분석 엔진"
check_server 8008 "꿈 시각화 시스템"
check_server 3000 "프론트엔드"

echo ""
echo "✨ 모든 서버가 정상적으로 중지되었습니다!"
