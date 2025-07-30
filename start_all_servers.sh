#!/bin/bash

echo "🚀 모든 서버 시작"
echo "=================="

# 기존 프로세스 종료
pkill -f "python.*main_server.py" 2>/dev/null
pkill -f "python.*message_generation_server.py" 2>/dev/null
pkill -f "python.*sync_server.py" 2>/dev/null
pkill -f "python.*chat_analysis_server.py" 2>/dev/null
pkill -f "python.*simulation_server.py" 2>/dev/null
pkill -f "python.*media_management_server.py" 2>/dev/null
pkill -f "python.*response_generation_server.py" 2>/dev/null
pkill -f "python.*context_analysis_server.py" 2>/dev/null
pkill -f "python.*strategy_optimization_server.py" 2>/dev/null
pkill -f "python.*advanced_message_generation_server.py" 2>/dev/null

# 백엔드 디렉토리로 이동
cd backend

# 가상환경 활성화
source venv/bin/activate

# 로그 디렉토리 생성
mkdir -p ../logs

# 각 서버를 백그라운드에서 시작
echo "📡 메인 서버 시작 (포트 8003)..."
python3 main_server.py > ../logs/main_server.log 2>&1 &
MAIN_PID=$!

echo "💬 메시지 생성 서버 시작 (포트 8001)..."
python3 message_generation_server.py > ../logs/message_server.log 2>&1 &
MESSAGE_PID=$!

echo "🔄 동기화 서버 시작 (포트 8002)..."
python3 sync_server.py > ../logs/sync_server.log 2>&1 &
SYNC_PID=$!

echo "🧠 대화 분석 서버 시작 (포트 8004)..."
python3 chat_analysis_server.py > ../logs/analysis_server.log 2>&1 &
ANALYSIS_PID=$!

echo "🎮 시뮬레이션 서버 시작 (포트 8005)..."
python3 simulation_server.py > ../logs/simulation_server.log 2>&1 &
SIMULATION_PID=$!

echo "📁 미디어 관리 서버 시작 (포트 8006)..."
python3 media_management_server.py > ../logs/media_server.log 2>&1 &
MEDIA_PID=$!

echo "💬 대응메시지 생성 서버 시작 (포트 8007)..."
python3 response_generation_server.py > ../logs/response_server.log 2>&1 &
RESPONSE_PID=$!

echo "🔍 컨텍스트 분석 서버 시작 (포트 8008)..."
python3 context_analysis_server.py > ../logs/context_server.log 2>&1 &
CONTEXT_PID=$!

echo "⚡ 전략 최적화 서버 시작 (포트 8009)..."
python3 strategy_optimization_server.py > ../logs/strategy_server.log 2>&1 &
STRATEGY_PID=$!

echo "🚀 고도화된 메시지 생성 서버 시작 (포트 8011)..."
python3 advanced_message_generation_server.py > ../logs/advanced_message_server.log 2>&1 &
ADVANCED_MESSAGE_PID=$!

echo ""
echo "✅ 모든 서버가 시작되었습니다!"
echo "📍 서버 주소:"
echo "   메인 서버: http://localhost:8003"
echo "   메시지 서버: http://localhost:8001"
echo "   동기화 서버: http://localhost:8002"
echo "   분석 서버: http://localhost:8004"
echo "   시뮬레이션 서버: http://localhost:8005"
echo "   미디어 서버: http://localhost:8006"
echo "   대응메시지 서버: http://localhost:8007"
echo "   컨텍스트 서버: http://localhost:8008"
echo "   전략 최적화 서버: http://localhost:8009"
echo "   고도화된 메시지 서버: http://localhost:8011"
echo ""
echo "📋 로그 파일:"
echo "   메인 서버: logs/main_server.log"
echo "   메시지 서버: logs/message_server.log"
echo "   동기화 서버: logs/sync_server.log"
echo "   분석 서버: logs/analysis_server.log"
echo "   시뮬레이션 서버: logs/simulation_server.log"
echo "   미디어 서버: logs/media_server.log"
echo "   대응메시지 서버: logs/response_server.log"
echo "   컨텍스트 서버: logs/context_server.log"
echo "   전략 최적화 서버: logs/strategy_server.log"
echo "   고도화된 메시지 서버: logs/advanced_message_server.log"
echo ""
echo "🛑 서버 중지: ./stop_all_servers.sh"
echo ""

# 서버 상태 확인
sleep 5
echo "🔍 서버 상태 확인 중..."
curl -s http://localhost:8003/api/status > /dev/null && echo "✅ 메인 서버 정상" || echo "❌ 메인 서버 오류"
curl -s http://localhost:8001/api/status > /dev/null && echo "✅ 메시지 서버 정상" || echo "❌ 메시지 서버 오류"
curl -s http://localhost:8002/api/status > /dev/null && echo "✅ 동기화 서버 정상" || echo "❌ 동기화 서버 오류"
curl -s http://localhost:8004/api/status > /dev/null && echo "✅ 분석 서버 정상" || echo "❌ 분석 서버 오류"
curl -s http://localhost:8005/api/status > /dev/null && echo "✅ 시뮬레이션 서버 정상" || echo "❌ 시뮬레이션 서버 오류"
curl -s http://localhost:8006/api/status > /dev/null && echo "✅ 미디어 서버 정상" || echo "❌ 미디어 서버 오류"
curl -s http://localhost:8007/api/status > /dev/null && echo "✅ 대응메시지 서버 정상" || echo "❌ 대응메시지 서버 오류"
curl -s http://localhost:8008/api/status > /dev/null && echo "✅ 컨텍스트 서버 정상" || echo "❌ 컨텍스트 서버 오류"
curl -s http://localhost:8009/api/status > /dev/null && echo "✅ 전략 최적화 서버 정상" || echo "❌ 전략 최적화 서버 오류"
curl -s http://localhost:8011/api/status > /dev/null && echo "✅ 고도화된 메시지 서버 정상" || echo "❌ 고도화된 메시지 서버 오류" 