#!/bin/bash

# CORBU AI System Deployment Script

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# 환경 변수
ENVIRONMENT=${1:-development}
VERSION=${2:-latest}

# 배포 환경별 설정
case $ENVIRONMENT in
    "development")
        DOCKER_COMPOSE_FILE="docker-compose.dev.yml"
        ENV_FILE=".env.development"
        ;;
    "staging")
        DOCKER_COMPOSE_FILE="docker-compose.staging.yml"
        ENV_FILE=".env.staging"
        ;;
    "production")
        DOCKER_COMPOSE_FILE="docker-compose.production.yml"
        ENV_FILE=".env.production"
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT"
        log_info "Usage: $0 [development|staging|production] [version]"
        exit 1
        ;;
esac

# 배포 전 체크리스트
pre_deployment_check() {
    log_info "Starting pre-deployment checks..."
    
    # Docker 설치 확인
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Docker Compose 설치 확인
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # 필요한 파일 확인
    if [ ! -f "Dockerfile" ]; then
        log_error "Dockerfile not found"
        exit 1
    fi
    
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        log_warn "Docker Compose file not found, using default"
        DOCKER_COMPOSE_FILE="docker-compose.yml"
    fi
    
    # 환경 변수 파일 확인
    if [ ! -f "$ENV_FILE" ]; then
        log_warn "Environment file not found: $ENV_FILE"
    fi
    
    log_info "Pre-deployment checks completed"
}

# 기존 컨테이너 정리
cleanup_containers() {
    log_info "Cleaning up existing containers..."
    
    # 기존 컨테이너 중지
    docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans || true
    
    # 사용하지 않는 이미지 정리
    docker image prune -f || true
    
    log_info "Cleanup completed"
}

# 이미지 빌드
build_images() {
    log_info "Building Docker images..."
    
    # 환경 변수 파일이 있으면 로드
    if [ -f "$ENV_FILE" ]; then
        export $(cat $ENV_FILE | grep -v '^#' | xargs)
    fi
    
    # 이미지 빌드
    docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    
    log_info "Image build completed"
}

# 데이터베이스 마이그레이션
run_migrations() {
    log_info "Running database migrations..."
    
    # 마이그레이션 스크립트가 있으면 실행
    if [ -f "backend/migrations/run_migrations.sh" ]; then
        docker-compose -f $DOCKER_COMPOSE_FILE exec -T corbu-ai bash -c "cd /app/backend && ./migrations/run_migrations.sh"
    else
        log_warn "No migration script found"
    fi
    
    log_info "Migrations completed"
}

# 서비스 시작
start_services() {
    log_info "Starting services..."
    
    # 서비스 시작
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    log_info "Services started"
}

# 헬스체크
health_check() {
    log_info "Performing health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost/health > /dev/null 2>&1; then
            log_info "Frontend health check passed"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "Frontend health check failed"
            return 1
        fi
        
        log_debug "Waiting for frontend... (attempt $attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8004/health > /dev/null 2>&1; then
            log_info "Backend health check passed"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "Backend health check failed"
            return 1
        fi
        
        log_debug "Waiting for backend... (attempt $attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log_info "All health checks passed"
    return 0
}

# 배포 후 정리
post_deployment_cleanup() {
    log_info "Performing post-deployment cleanup..."
    
    # 사용하지 않는 이미지 정리
    docker image prune -f || true
    
    # 사용하지 않는 볼륨 정리
    docker volume prune -f || true
    
    log_info "Post-deployment cleanup completed"
}

# 배포 상태 확인
check_deployment_status() {
    log_info "Checking deployment status..."
    
    # 컨테이너 상태 확인
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    
    # 로그 확인
    log_info "Recent logs:"
    docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20
}

# 롤백 함수
rollback() {
    log_error "Deployment failed, starting rollback..."
    
    # 이전 버전으로 롤백
    docker-compose -f $DOCKER_COMPOSE_FILE down
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    log_info "Rollback completed"
}

# 메인 배포 함수
main() {
    log_info "Starting CORBU AI System deployment..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
    
    # 배포 시작 시간
    START_TIME=$(date +%s)
    
    # 배포 단계 실행
    pre_deployment_check
    cleanup_containers
    build_images
    start_services
    
    # 헬스체크
    if health_check; then
        run_migrations
        post_deployment_cleanup
        check_deployment_status
        
        # 배포 완료 시간 계산
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        
        log_info "Deployment completed successfully!"
        log_info "Duration: ${DURATION} seconds"
        log_info "Frontend: http://localhost"
        log_info "Backend API: http://localhost:8004"
        log_info "Health Check: http://localhost/health"
        
        # 성공 알림
        if command -v notify-send &> /dev/null; then
            notify-send "CORBU AI Deployment" "Deployment completed successfully!"
        fi
    else
        log_error "Health check failed"
        rollback
        exit 1
    fi
}

# 시그널 핸들러
cleanup_on_exit() {
    log_error "Deployment interrupted"
    rollback
    exit 1
}

# 시그널 트랩 설정
trap cleanup_on_exit SIGINT SIGTERM

# 스크립트 실행
main "$@"