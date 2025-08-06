#!/bin/bash

# CORBU AI 시스템 배포 스크립트
# 사용법: ./deploy.sh [environment]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
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

# 환경 설정
ENVIRONMENT=${1:-development}
PROJECT_NAME="corbu-ai-system"

log_info "🚀 CORBU AI 시스템 배포 시작"
log_info "환경: $ENVIRONMENT"

# 1. 환경 확인
log_info "1️⃣ 환경 확인 중..."

# Docker 확인
if ! command -v docker &> /dev/null; then
    log_error "Docker가 설치되지 않았습니다."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose가 설치되지 않았습니다."
    exit 1
fi

log_success "Docker 환경 확인 완료"

# 2. 기존 컨테이너 정리
log_info "2️⃣ 기존 컨테이너 정리 중..."

if docker-compose ps | grep -q "corbu-ai"; then
    log_info "기존 컨테이너 중지 중..."
    docker-compose down
    log_success "기존 컨테이너 정리 완료"
else
    log_info "실행 중인 컨테이너가 없습니다."
fi

# 3. 이미지 빌드
log_info "3️⃣ Docker 이미지 빌드 중..."

# 프론트엔드 빌드
log_info "프론트엔드 빌드 중..."
docker-compose build frontend
log_success "프론트엔드 빌드 완료"

# 백엔드 빌드
log_info "백엔드 빌드 중..."
docker-compose build backend
log_success "백엔드 빌드 완료"

# 4. 서비스 시작
log_info "4️⃣ 서비스 시작 중..."

docker-compose up -d

# 5. 헬스체크
log_info "5️⃣ 서비스 상태 확인 중..."

# 백엔드 헬스체크
log_info "백엔드 서비스 확인 중..."
for i in {1..30}; do
    if curl -f http://localhost:8000/health &> /dev/null; then
        log_success "백엔드 서비스 정상 작동"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "백엔드 서비스 시작 실패"
        exit 1
    fi
    sleep 2
done

# 프론트엔드 헬스체크
log_info "프론트엔드 서비스 확인 중..."
for i in {1..30}; do
    if curl -f http://localhost:3000 &> /dev/null; then
        log_success "프론트엔드 서비스 정상 작동"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "프론트엔드 서비스 시작 실패"
        exit 1
    fi
    sleep 2
done

# 6. 성능 테스트
log_info "6️⃣ 성능 테스트 중..."

# API 응답 시간 테스트
log_info "API 응답 시간 측정 중..."
RESPONSE_TIME=$(curl -w "%{time_total}" -o /dev/null -s http://localhost:8000/health)
log_info "API 응답 시간: ${RESPONSE_TIME}초"

# 프론트엔드 로딩 시간 테스트
log_info "프론트엔드 로딩 시간 측정 중..."
FRONTEND_TIME=$(curl -w "%{time_total}" -o /dev/null -s http://localhost:3000)
log_info "프론트엔드 로딩 시간: ${FRONTEND_TIME}초"

# 7. 컨테이너 상태 확인
log_info "7️⃣ 컨테이너 상태 확인 중..."

docker-compose ps

# 8. 로그 확인
log_info "8️⃣ 서비스 로그 확인 중..."

log_info "백엔드 로그:"
docker-compose logs backend --tail=10

log_info "프론트엔드 로그:"
docker-compose logs frontend --tail=10

# 9. 배포 완료
log_success "🎉 CORBU AI 시스템 배포 완료!"
log_info ""
log_info "📊 배포 정보:"
log_info "   - 백엔드: http://localhost:8000"
log_info "   - 프론트엔드: http://localhost:3000"
log_info "   - API 문서: http://localhost:8000/docs"
log_info "   - 헬스체크: http://localhost:8000/health"
log_info ""
log_info "🔧 관리 명령어:"
log_info "   - 서비스 상태 확인: docker-compose ps"
log_info "   - 로그 확인: docker-compose logs -f"
log_info "   - 서비스 중지: docker-compose down"
log_info "   - 서비스 재시작: docker-compose restart"
log_info ""
log_info "📈 모니터링:"
log_info "   - 실시간 로그: docker-compose logs -f"
log_info "   - 리소스 사용량: docker stats"
log_info "   - 컨테이너 상태: docker-compose ps"

# 10. 추가 정보
if [ "$ENVIRONMENT" = "production" ]; then
    log_warning "⚠️  프로덕션 환경 배포 완료"
    log_info "보안 설정을 확인하세요:"
    log_info "   - 방화벽 설정"
    log_info "   - SSL 인증서"
    log_info "   - 백업 설정"
    log_info "   - 모니터링 설정"
fi

log_success "✅ 배포 스크립트 완료" 