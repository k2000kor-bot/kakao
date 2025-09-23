#!/bin/bash
# CORBU.AI 프로덕션 배포 스크립트

set -e

echo "🚀 CORBU.AI 프로덕션 배포를 시작합니다..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 환경 확인
log_info "환경 확인 중..."

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    log_error "Docker가 설치되지 않았습니다."
    exit 1
fi

# Docker Compose 설치 확인
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose가 설치되지 않았습니다."
    exit 1
fi

log_success "필수 도구가 설치되어 있습니다."

# 기존 컨테이너 정리
log_info "기존 컨테이너 정리 중..."
docker-compose down --remove-orphans 2>/dev/null || true

# 이미지 빌드
log_info "Docker 이미지 빌드 중..."
docker-compose build --no-cache

# 서비스 시작
log_info "서비스 시작 중..."
docker-compose up -d

# 헬스체크
log_info "서비스 헬스체크 중..."
sleep 10

# 프론트엔드 헬스체크
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_success "프론트엔드 서비스가 정상적으로 실행 중입니다."
else
    log_warning "프론트엔드 서비스 헬스체크 실패"
fi

# 백엔드 헬스체크
if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    log_success "백엔드 서비스가 정상적으로 실행 중입니다."
else
    log_warning "백엔드 서비스 헬스체크 실패"
fi

# 배포 완료
log_success "🎉 CORBU.AI 배포가 완료되었습니다!"
echo ""
echo "📋 서비스 정보:"
echo "  🌐 프론트엔드: http://localhost:3000"
echo "  🔧 백엔드 API: http://localhost:5001"
echo "  📊 헬스체크: http://localhost:5001/api/health"
echo ""
echo "🔍 서비스 상태 확인:"
echo "  docker-compose ps"
echo ""
echo "📝 로그 확인:"
echo "  docker-compose logs -f"
echo ""
echo "🛑 서비스 중지:"
echo "  docker-compose down"
echo ""

# 서비스 상태 표시
log_info "현재 실행 중인 서비스:"
docker-compose ps
