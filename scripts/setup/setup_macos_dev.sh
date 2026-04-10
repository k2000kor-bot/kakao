#!/bin/bash

# macOS 개발 환경 설정 스크립트
# KakaoTalk AI Analysis System
#
# Python 가상환경: backend/.venv (프로젝트 기본: lib-activate-backend-venv.sh, restart:backend 와 동일)
# 저장소 루트로 이동한 뒤 실행합니다(스크립트 경로 기준 자동 cd).

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT" || exit 1

echo "🍎 macOS 개발 환경 설정을 시작합니다... (저장소: $REPO_ROOT)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "이 스크립트는 macOS에서만 실행할 수 있습니다."
    exit 1
fi

print_status "macOS 버전 확인 중..."
sw_vers

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    print_warning "Homebrew가 설치되어 있지 않습니다. 설치를 진행합니다..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    print_success "Homebrew가 이미 설치되어 있습니다."
    brew --version
fi

# Update Homebrew
print_status "Homebrew 업데이트 중..."
brew update

# Install Python 3.11 (more stable for ML packages)
print_status "Python 3.11 설치 확인 중..."
if ! brew list python@3.11 &> /dev/null; then
    print_status "Python 3.11 설치 중..."
    brew install python@3.11
else
    print_success "Python 3.11이 이미 설치되어 있습니다."
fi

# Install Node.js LTS
print_status "Node.js LTS 설치 확인 중..."
if ! brew list node &> /dev/null; then
    print_status "Node.js 설치 중..."
    brew install node
else
    print_success "Node.js가 이미 설치되어 있습니다."
    node --version
fi

# Install essential development tools
print_status "개발 도구 설치 중..."
brew_packages=(
    "git"
    "wget"
    "curl"
    "tree"
    "jq"
    "htop"
    "postgresql"
    "redis"
)

for package in "${brew_packages[@]}"; do
    if ! brew list "$package" &> /dev/null; then
        print_status "$package 설치 중..."
        brew install "$package"
    else
        print_success "$package가 이미 설치되어 있습니다."
    fi
done

# Python 가상환경 재생성 (backend/.venv — 배포·검증 스크립트와 동일)
print_status "Python 가상환경 재생성 중 (backend/.venv)..."
mkdir -p "$REPO_ROOT/backend"
if [ -d "$REPO_ROOT/backend/.venv" ]; then
    print_warning "기존 backend/.venv 를 백업합니다..."
    mv "$REPO_ROOT/backend/.venv" "$REPO_ROOT/backend/.venv_backup_$(date +%Y%m%d_%H%M%S)"
fi

PY311="$(command -v python3.11 2>/dev/null || true)"
if [ -n "$PY311" ]; then
    "$PY311" -m venv "$REPO_ROOT/backend/.venv"
else
    print_warning "python3.11 없음 — python3 로 venv 생성"
    python3 -m venv "$REPO_ROOT/backend/.venv"
fi
# shellcheck disable=SC1091
source "$REPO_ROOT/backend/.venv/bin/activate"

print_success "새로운 가상환경이 생성되었습니다 (backend/.venv)."

# Upgrade pip and install wheel
print_status "pip 업그레이드 중..."
pip install --upgrade pip setuptools wheel

# Install macOS specific Python packages
print_status "macOS 호환 Python 패키지 설치 중..."

# Create a macOS-specific requirements file
cat > requirements_macos.txt << 'EOF'
# Core FastAPI dependencies
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
websockets==12.0
sqlalchemy==2.0.23
pydantic==2.5.0
python-dotenv==1.0.0

# Database
aiosqlite==0.19.0

# HTTP clients
httpx==0.25.2
requests==2.31.0

# Data processing
pandas>=2.0.0
numpy>=1.24.0

# Basic ML (macOS compatible)
scikit-learn>=1.3.0

# Korean text processing (simplified)
regex==2023.10.3

# System utilities
psutil>=5.9.0
python-dateutil>=2.8.0

# Development tools
pytest>=7.4.0
pytest-asyncio>=0.21.0
black>=23.0.0
flake8>=6.0.0

# Monitoring
prometheus-client==0.19.0
EOF

pip install -r requirements_macos.txt

print_success "기본 Python 패키지가 설치되었습니다."

# Install additional packages one by one (safer approach)
print_status "추가 패키지 개별 설치 중..."

additional_packages=(
    "transformers>=4.30.0"
    "torch>=2.0.0"
    "sentence-transformers>=2.2.0"
)

for package in "${additional_packages[@]}"; do
    print_status "$package 설치 시도 중..."
    if pip install "$package" --timeout 60; then
        print_success "$package 설치 완료"
    else
        print_warning "$package 설치 실패 - 선택적 패키지입니다."
    fi
done

# Node.js dependencies
print_status "Node.js 의존성 설치 중..."
if [ -f "package.json" ]; then
    npm cache clean --force
    npm install
    print_success "Node.js 패키지가 설치되었습니다."
else
    print_warning "package.json이 없습니다."
fi

# Create convenient scripts
print_status "편의 스크립트 생성 중..."

# Backend start script (통합 main_server, 포트 5002)
cat > start_backend.sh << 'EOF'
#!/bin/bash
echo "🚀 통합 백엔드 시작 (main_server, 기본 5002)..."
ROOT="$(cd "$(dirname "$0")" && pwd)"
exec "$ROOT/scripts/restart-backend.sh"
EOF

# Frontend start script
cat > start_frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 프론트엔드 서버 시작 중..."
cd "$(dirname "$0")"
npm start
EOF

# Full system start script
cat > start_all.sh << 'EOF'
#!/bin/bash
echo "🚀 전체 시스템 시작 중..."

# Start backend in background
echo "백엔드 서버 시작..."
./start_backend.sh &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "프론트엔드 서버 시작..."
./start_frontend.sh &
FRONTEND_PID=$!

echo "시스템이 시작되었습니다!"
echo "백엔드: http://localhost:5002"
echo "프론트엔드: http://localhost:3000"
echo ""
echo "종료하려면 Ctrl+C를 누르세요."

# Wait for interrupt
trap "echo '시스템을 종료합니다...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
EOF

# Make scripts executable
chmod +x start_backend.sh start_frontend.sh start_all.sh

# Create development configuration
cat > .env.development << 'EOF'
# 개발 환경 설정
NODE_ENV=development
REACT_APP_API_URL=http://localhost:5002
BACKEND_PORT=5002
FRONTEND_PORT=3000

# Python 환경
PYTHONPATH=./backend
PYTHONDONTWRITEBYTECODE=1
PYTHONUNBUFFERED=1
EOF

# Create VS Code configuration for better development experience
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
    "python.defaultInterpreterPath": "${workspaceFolder}/backend/.venv/bin/python",
    "python.pythonPath": "${workspaceFolder}/backend/.venv/bin/python",
    "python.terminal.activateEnvironment": true,
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": true,
    "python.formatting.provider": "black",
    "typescript.preferences.importModuleSpecifier": "relative",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    },
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true
    }
}
EOF

cat > .vscode/launch.json << 'EOF'
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Backend Server (main_server)",
            "type": "python",
            "request": "launch",
            "module": "uvicorn",
            "args": ["main_server:app", "--host", "0.0.0.0", "--port", "5002", "--reload"],
            "console": "integratedTerminal",
            "env": {
                "PYTHONPATH": "${workspaceFolder}/backend"
            },
            "cwd": "${workspaceFolder}/backend",
            "python": "${workspaceFolder}/backend/.venv/bin/python"
        }
    ]
}
EOF

# 보조 가이드 (루트 DEVELOPMENT.md 는 덮어쓰지 않음)
mkdir -p "$REPO_ROOT/docs/setup"
cat > "$REPO_ROOT/docs/setup/MACOS_DEV_QUICKSTART.md" << 'EOF'
# 🍎 macOS 개발 환경 — setup_macos_dev.sh 요약

`scripts/setup/setup_macos_dev.sh` 실행 후 참고용입니다. 상세 워크플로는 저장소 루트 **DEVELOPMENT.md** 를 따르세요.

## 빠른 시작

### 전체 시스템 실행 (스크립트가 생성한 래퍼)
```bash
./start_all.sh
```

### 통합 API (프로젝트 기본, 포트 5002)
```bash
npm run restart:backend
# 또는: bash scripts/start-api-5002.sh
```

### 개별 실행
```bash
./start_backend.sh    # 통합 API (restart-backend.sh)
./start_frontend.sh
```

## Python 가상환경

- 위치: **`backend/.venv`** (배포·pytest·`lib-activate-backend-venv.sh` 와 동일)
- 활성화:
```bash
source scripts/lib-activate-backend-venv.sh
backend_venv_activate "$(pwd)"
```
또는:
```bash
source backend/.venv/bin/activate
```

## 서버 주소

- **프론트엔드**: http://localhost:3000
- **통합 API (권장)**: http://localhost:5002

## VS Code

- 인터프리터: `backend/.venv/bin/python` (`.vscode/settings.json` 에 반영)

## 문제 해결

### backend/.venv 재생성
```bash
rm -rf backend/.venv
python3.11 -m venv backend/.venv   # 또는 python3
source backend/.venv/bin/activate
pip install -r requirements_macos.txt
```

### Node.js 캐시 정리
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```
EOF

print_success "개발 환경 설정이 완료되었습니다!"
print_status "생성된 파일들:"
echo "  📄 requirements_macos.txt - macOS용 Python 패키지"
echo "  🐍 backend/.venv - Python 가상환경"
echo "  🚀 start_backend.sh - 백엔드 시작 스크립트 (lib-activate 사용)"
echo "  🚀 start_frontend.sh - 프론트엔드 시작 스크립트" 
echo "  🚀 start_all.sh - 전체 시스템 시작"
echo "  ⚙️  .env.development - 개발 환경 설정"
echo "  🛠️  .vscode/ - VS Code 설정 (backend/.venv)"
echo "  📖 docs/setup/MACOS_DEV_QUICKSTART.md - macOS 셋업 요약 (루트 DEVELOPMENT.md 는 유지)"

print_status "다음 명령어로 시스템을 시작할 수 있습니다:"
echo "  npm run restart:backend   # 통합 API 5002 (권장)"
echo "  ./start_all.sh            # 레거시 래퍼"

print_status "VS Code에서 인터프리터: backend/.venv/bin/python"

echo ""
print_success "🎉 macOS 개발 환경 구축이 완료되었습니다!" 