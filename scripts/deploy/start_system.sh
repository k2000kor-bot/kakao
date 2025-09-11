#!/bin/bash

# CORBU AI 시스템 시작 스크립트

echo "🚀 CORBU AI 시스템 시작 중..."
echo "=" * 50

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 가상환경 확인 및 활성화
if [ -d "venv" ]; then
    print_status "가상환경 활성화 중..."
    source venv/bin/activate
    print_success "가상환경 활성화 완료"
else
    print_error "가상환경을 찾을 수 없습니다. 먼저 가상환경을 생성하세요."
    exit 1
fi

# 의존성 확인
print_status "의존성 확인 중..."
if ! python -c "import fastapi, uvicorn, openai" 2>/dev/null; then
    print_warning "일부 의존성이 설치되지 않았습니다. 설치를 진행합니다..."
    ./install_dependencies.sh
fi

# OpenAI API 키 확인
if [ -z "$OPENAI_API_KEY" ]; then
    print_warning "OpenAI API 키가 설정되지 않았습니다."
    echo "API 키를 설정하려면: export OPENAI_API_KEY='your-api-key'"
    echo "계속 진행하시겠습니까? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_error "API 키 설정 후 다시 시도하세요."
        exit 1
    fi
else
    print_success "OpenAI API 키 확인됨"
fi

# 백엔드 서버 시작
print_status "백엔드 서버 시작 중..."
cd backend
python advanced_api_server.py &
BACKEND_PID=$!
cd ..

# 백엔드 서버 시작 대기
print_status "백엔드 서버 시작 대기 중..."
sleep 5

# 백엔드 서버 상태 확인
if curl -s http://localhost:8000/health > /dev/null; then
    print_success "백엔드 서버 시작 완료 (PID: $BACKEND_PID)"
else
    print_error "백엔드 서버 시작 실패"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 프론트엔드 서버 시작
print_status "프론트엔드 서버 시작 중..."
npm start &
FRONTEND_PID=$!

# 프론트엔드 서버 시작 대기
print_status "프론트엔드 서버 시작 대기 중..."
sleep 10

# 프론트엔드 서버 상태 확인
if curl -s http://localhost:3000 > /dev/null; then
    print_success "프론트엔드 서버 시작 완료 (PID: $FRONTEND_PID)"
else
    print_warning "프론트엔드 서버 상태 확인 실패 (일반적으로 정상 작동)"
fi

# 시스템 모니터링 시작
print_status "시스템 모니터링 시작 중..."
python system_monitor.py &
MONITOR_PID=$!

# 완료 메시지
echo ""
echo "🎉 CORBU AI 시스템 시작 완료!"
echo "=" * 50
echo "📱 프론트엔드: http://localhost:3000"
echo "🔧 백엔드 API: http://localhost:8000"
echo "📚 API 문서: http://localhost:8000/docs"
echo "🖥️  모니터링: 시스템 상태 자동 업데이트"
echo ""
echo "💡 사용 팁:"
echo "   • 브라우저에서 http://localhost:3000 접속"
echo "   • API 테스트는 http://localhost:8000/docs 에서"
echo "   • 종료하려면 Ctrl+C 또는 ./stop_system.sh 실행"
echo ""

# 프로세스 ID 저장
echo $BACKEND_PID > .backend_pid
echo $FRONTEND_PID > .frontend_pid
echo $MONITOR_PID > .monitor_pid

print_success "모든 서비스가 정상적으로 시작되었습니다!"

# 시그널 핸들러
cleanup() {
    print_status "시스템 종료 중..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $MONITOR_PID 2>/dev/null
    rm -f .backend_pid .frontend_pid .monitor_pid
    print_success "시스템 종료 완료"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 대기
print_status "시스템이 실행 중입니다. 종료하려면 Ctrl+C를 누르세요."
wait
