#!/bin/bash

# CORBU AI 시스템 종료 스크립트

echo "🛑 CORBU AI 시스템 종료 중..."
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

# 프로세스 ID 파일 확인
if [ -f ".backend_pid" ]; then
    BACKEND_PID=$(cat .backend_pid)
    print_status "백엔드 서버 종료 중 (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    sleep 2
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_warning "백엔드 서버 강제 종료 중..."
        kill -9 $BACKEND_PID 2>/dev/null
    fi
    rm -f .backend_pid
    print_success "백엔드 서버 종료 완료"
else
    print_warning "백엔드 서버 PID 파일을 찾을 수 없습니다."
fi

if [ -f ".frontend_pid" ]; then
    FRONTEND_PID=$(cat .frontend_pid)
    print_status "프론트엔드 서버 종료 중 (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    sleep 2
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_warning "프론트엔드 서버 강제 종료 중..."
        kill -9 $FRONTEND_PID 2>/dev/null
    fi
    rm -f .frontend_pid
    print_success "프론트엔드 서버 종료 완료"
else
    print_warning "프론트엔드 서버 PID 파일을 찾을 수 없습니다."
fi

if [ -f ".monitor_pid" ]; then
    MONITOR_PID=$(cat .monitor_pid)
    print_status "시스템 모니터링 종료 중 (PID: $MONITOR_PID)..."
    kill $MONITOR_PID 2>/dev/null
    sleep 1
    if kill -0 $MONITOR_PID 2>/dev/null; then
        print_warning "시스템 모니터링 강제 종료 중..."
        kill -9 $MONITOR_PID 2>/dev/null
    fi
    rm -f .monitor_pid
    print_success "시스템 모니터링 종료 완료"
else
    print_warning "시스템 모니터링 PID 파일을 찾을 수 없습니다."
fi

# 관련 프로세스 강제 종료
print_status "관련 프로세스 정리 중..."

# Python 프로세스 종료
pkill -f "advanced_api_server.py" 2>/dev/null
pkill -f "system_monitor.py" 2>/dev/null

# Node.js 프로세스 종료
pkill -f "react-scripts" 2>/dev/null
pkill -f "npm start" 2>/dev/null

# 포트 사용 확인 및 정리
print_status "포트 사용 확인 중..."

# 포트 8000 (백엔드) 확인
if lsof -ti:8000 > /dev/null 2>&1; then
    print_warning "포트 8000이 여전히 사용 중입니다."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    print_success "포트 8000 정리 완료"
fi

# 포트 3000 (프론트엔드) 확인
if lsof -ti:3000 > /dev/null 2>&1; then
    print_warning "포트 3000이 여전히 사용 중입니다."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    print_success "포트 3000 정리 완료"
fi
    
    # 임시 파일 정리
print_status "임시 파일 정리 중..."
rm -f .backend_pid .frontend_pid .monitor_pid 2>/dev/null
rm -f test_*.txt test_*.pdf test_*.docx test_*.xlsx 2>/dev/null

print_success "시스템 종료 완료!"
echo ""
echo "📋 종료된 서비스:"
echo "   • 백엔드 서버 (포트 8000)"
echo "   • 프론트엔드 서버 (포트 3000)"
echo "   • 시스템 모니터링"
echo ""
echo "💡 다시 시작하려면: ./start_system.sh"
    echo ""