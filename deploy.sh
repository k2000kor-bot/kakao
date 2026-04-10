#!/bin/bash
# CORBU.AI 배포 스크립트

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# shellcheck source=scripts/lib-activate-backend-venv.sh
source "$PROJECT_ROOT/scripts/lib-activate-backend-venv.sh"

ensure_python_venv() {
    if backend_venv_activate "$PROJECT_ROOT"; then
        return 0
    fi
    log_warning "표준 venv 없음 — backend/.venv 생성 시도..."
    if ( cd "$PROJECT_ROOT/backend" && python3 -m venv .venv && .venv/bin/pip install -q --upgrade pip && .venv/bin/pip install -q -r requirements-core.txt ); then
        backend_venv_activate "$PROJECT_ROOT"
    else
        return 1
    fi
}

echo "🚀 CORBU.AI 배포를 시작합니다..."

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

# 환경 확인
check_requirements() {
    log_info "시스템 요구사항 확인 중..."
    
    # Docker 확인
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되어 있지 않습니다."
        exit 1
    fi
    
    # Python 확인
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3가 설치되어 있지 않습니다."
        exit 1
    fi
    
    log_success "시스템 요구사항 확인 완료"
}

# 환경 변수 설정
setup_environment() {
    log_info "환경 변수 설정 중..."
    
    # .env 파일이 없으면 생성
    if [ ! -f .env ]; then
        cp env.example .env
        log_warning ".env 파일을 생성했습니다. 필요한 설정을 수정해주세요."
    fi
    
    # 로그 디렉토리 생성
    mkdir -p logs uploads backups
    
    log_success "환경 설정 완료"
}

# 의존성 설치
install_dependencies() {
    log_info "의존성 설치 중..."
    
    if ! ensure_python_venv; then
        log_error "Python 가상환경을 준비할 수 없습니다."
        exit 1
    fi
    
    pip install -r "$PROJECT_ROOT/requirements.txt" gunicorn 2>/dev/null \
        || pip install -r "$PROJECT_ROOT/backend/requirements.txt" gunicorn
    
    log_success "의존성 설치 완료"
}

# 테스트 실행
run_tests() {
    log_info "기본 테스트 실행 중..."
    
    ensure_python_venv || exit 1
    
    # 서버 시작 테스트
    python3 -c "from complete_server import app; print('✅ 서버 모듈 로드 성공')"
    
    # 포트 확인
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null; then
        log_warning "포트 8080이 이미 사용 중입니다."
    fi
    
    log_success "테스트 완료"
}

# Docker 빌드
build_docker() {
    log_info "Docker 이미지 빌드 중..."
    
    # 이미지 빌드
    docker build -t corbu-ai:latest .
    
    log_success "Docker 이미지 빌드 완료"
}

# 서비스 배포
deploy_service() {
    local deployment_type=${1:-"local"}
    
    case $deployment_type in
        "local")
            deploy_local
            ;;
        "docker")
            deploy_docker
            ;;
        "production")
            deploy_production
            ;;
        *)
            log_error "알 수 없는 배포 타입: $deployment_type"
            exit 1
            ;;
    esac
}

# 로컬 배포
deploy_local() {
    log_info "로컬 환경에 배포 중..."
    
    ensure_python_venv || exit 1
    
    # 기존 프로세스 종료
    pkill -f "python.*complete_server.py" || true
    pkill -f "gunicorn.*production_server" || true
    
    # Gunicorn으로 프로덕션 서버 시작
    nohup gunicorn --config gunicorn.conf.py production_server:application > logs/deploy.log 2>&1 &
    
    sleep 3
    
    # 헬스체크
    if curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
        log_success "로컬 배포 완료! http://localhost:8080 에서 접속 가능합니다."
    else
        log_error "서버 시작 실패. logs/deploy.log를 확인하세요."
        exit 1
    fi
}

# Docker 배포
deploy_docker() {
    log_info "Docker 컨테이너 배포 중..."
    
    # 기존 컨테이너 중지 및 삭제
    docker stop corbu-ai-container 2>/dev/null || true
    docker rm corbu-ai-container 2>/dev/null || true
    
    # 새 컨테이너 실행
    docker run -d \
        --name corbu-ai-container \
        -p 8080:8080 \
        -v $(pwd)/logs:/app/logs \
        -v $(pwd)/uploads:/app/uploads \
        --restart unless-stopped \
        corbu-ai:latest
    
    sleep 5
    
    # 헬스체크
    if curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
        log_success "Docker 배포 완료! http://localhost:8080 에서 접속 가능합니다."
    else
        log_error "컨테이너 시작 실패."
        docker logs corbu-ai-container
        exit 1
    fi
}

# 프로덕션 배포
deploy_production() {
    log_info "프로덕션 환경 배포 준비 중..."
    
    log_warning "프로덕션 배포는 다음 사항들을 확인해주세요:"
    echo "  • SSL/TLS 인증서 설정"
    echo "  • 도메인 및 DNS 설정"
    echo "  • 방화벽 및 보안 그룹 설정"
    echo "  • 데이터베이스 백업"
    echo "  • 모니터링 시스템 연동"
    
    read -p "계속하시겠습니까? (y/N): " confirm
    if [[ $confirm != [yY] ]]; then
        log_info "배포가 취소되었습니다."
        exit 0
    fi
    
    deploy_docker
}

# 백업 생성
create_backup() {
    log_info "시스템 백업 생성 중..."
    
    backup_dir="backups/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # 중요 파일들 백업
    cp -r logs "$backup_dir/" 2>/dev/null || true
    cp -r uploads "$backup_dir/" 2>/dev/null || true
    cp *.db "$backup_dir/" 2>/dev/null || true
    cp .env "$backup_dir/" 2>/dev/null || true
    
    log_success "백업 완료: $backup_dir"
}

# 메인 실행 함수
main() {
    local deployment_type=${1:-"local"}
    
    echo "🤖 CORBU.AI 자동 배포 시스템"
    echo "================================="
    
    check_requirements
    setup_environment
    install_dependencies
    run_tests
    
    if [[ $deployment_type == "docker" || $deployment_type == "production" ]]; then
        build_docker
    fi
    
    create_backup
    deploy_service "$deployment_type"
    
    echo ""
    log_success "🎉 CORBU.AI 배포가 완료되었습니다!"
    echo ""
    echo "📊 서비스 상태 확인: curl http://localhost:8080/api/health"
    echo "🌐 웹 인터페이스: http://localhost:8080"
    echo "📝 로그 확인: tail -f logs/corbu_ai.log"
    echo ""
}

# 스크립트 실행
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi