#!/bin/bash

# 모든 고도화된 시스템 시작 스크립트
# 마스터 통합 시스템을 포함한 모든 서브시스템을 시작합니다.

echo "🚀 모든 고도화된 시스템을 시작합니다..."
echo "================================================"

# 가상환경 활성화
echo "📦 가상환경 활성화 중..."
source venv/bin/activate

# 포트 확인 함수
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  포트 $port가 이미 사용 중입니다."
        return 1
    else
        echo "✅ 포트 $port 사용 가능"
        return 0
    fi
}

# 프로세스 종료 함수
cleanup() {
    echo ""
    echo "🛑 모든 시스템을 종료합니다..."
    pkill -f "python.*ultimate_yoo_ai_system.py"
    pkill -f "python.*advanced_web_learning_integration.py"
    pkill -f "python.*multimodal_learning_system.py"
    pkill -f "python.*yoo_si_min_enhanced_server.py"
    pkill -f "python.*master_integrated_system.py"
    echo "✅ 모든 시스템이 종료되었습니다."
    exit 0
}

# 시그널 핸들러 설정
trap cleanup SIGINT SIGTERM

# 포트 확인
echo "🔍 포트 상태 확인 중..."
check_port 8001 || exit 1
check_port 8002 || exit 1
check_port 8003 || exit 1
check_port 8004 || exit 1
check_port 8005 || exit 1

echo ""
echo "🎯 시스템 시작 순서:"
echo "1. 유시민 고도화 서버 (포트 8002)"
echo "2. 궁극의 유시민 AI 시스템 (포트 8003)"
echo "3. 고급 웹 학습 통합 시스템 (포트 8004)"
echo "4. 멀티모달 학습 통합 시스템 (포트 8005)"
echo "5. 마스터 통합 시스템 (포트 8001)"
echo ""

# 각 시스템 시작
echo "🚀 1. 유시민 고도화 서버 시작 중..."
python yoo_si_min_enhanced_server.py &
SERVER1_PID=$!
sleep 3

echo "🚀 2. 궁극의 유시민 AI 시스템 시작 중..."
python ultimate_yoo_ai_system.py &
SERVER2_PID=$!
sleep 3

echo "🚀 3. 고급 웹 학습 통합 시스템 시작 중..."
python advanced_web_learning_integration.py &
SERVER3_PID=$!
sleep 3

echo "🚀 4. 멀티모달 학습 통합 시스템 시작 중..."
python multimodal_learning_system.py &
SERVER4_PID=$!
sleep 3

echo "🚀 5. 마스터 통합 시스템 시작 중..."
python master_integrated_system.py &
MASTER_PID=$!
sleep 5

echo ""
echo "✅ 모든 시스템이 시작되었습니다!"
echo "================================================"
echo "🌐 접속 가능한 서비스:"
echo "   📊 마스터 통합 시스템: http://localhost:8001"
echo "   🤖 궁극의 유시민 AI: http://localhost:8003"
echo "   🌐 고급 웹 학습: http://localhost:8004"
echo "   🎭 멀티모달 학습: http://localhost:8005"
echo "   🎯 유시민 고도화: http://localhost:8002"
echo ""
echo "📚 API 문서:"
echo "   마스터 시스템: http://localhost:8001/docs"
echo "   궁극 AI: http://localhost:8003/docs"
echo "   웹 학습: http://localhost:8004/docs"
echo "   멀티모달: http://localhost:8005/docs"
echo "   유시민: http://localhost:8002/docs"
echo ""
echo "🔧 시스템 상태 확인:"
echo "   curl http://localhost:8001/api/master/status"
echo ""
echo "💡 테스트 명령어:"
echo "   # 마스터 채팅 테스트"
echo "   curl -X POST http://localhost:8001/api/master/chat \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"message\": \"정치와 교육의 관계에 대해 어떻게 생각하시나요?\", \"user_id\": \"test_user\"}'"
echo ""
echo "   # 웹 학습 테스트"
echo "   curl -X POST http://localhost:8001/api/master/learning \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"url\": \"https://example.com\", \"content_type\": \"webpage\", \"priority\": \"high\"}'"
echo ""
echo "   # 멀티모달 테스트"
echo "   curl -X POST http://localhost:8001/api/master/multimodal \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"user_id\": \"test_user\", \"modality\": \"text\", \"content_data\": \"테스트 콘텐츠\"}'"
echo ""
echo "⏹️  종료하려면 Ctrl+C를 누르세요"
echo "================================================"

# 시스템 상태 모니터링
while true; do
    sleep 30
    echo "📊 시스템 상태 체크 중... $(date)"
    
    # 각 시스템의 상태 확인
    if ! kill -0 $SERVER1_PID 2>/dev/null; then
        echo "⚠️  유시민 고도화 서버가 중단되었습니다."
    fi
    
    if ! kill -0 $SERVER2_PID 2>/dev/null; then
        echo "⚠️  궁극의 유시민 AI 시스템이 중단되었습니다."
    fi
    
    if ! kill -0 $SERVER3_PID 2>/dev/null; then
        echo "⚠️  고급 웹 학습 통합 시스템이 중단되었습니다."
    fi
    
    if ! kill -0 $SERVER4_PID 2>/dev/null; then
        echo "⚠️  멀티모달 학습 통합 시스템이 중단되었습니다."
    fi
    
    if ! kill -0 $MASTER_PID 2>/dev/null; then
        echo "⚠️  마스터 통합 시스템이 중단되었습니다."
    fi
done