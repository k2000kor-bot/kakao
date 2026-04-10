#!/bin/bash

# 간단한 macOS 개발 환경 설정 (경량) — 가상환경은 backend/.venv
echo "🍎 간단한 macOS 개발 환경 설정을 시작합니다..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR"
cd "$REPO_ROOT" || exit 1

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 현재 Python 버전 확인
print_status "현재 Python 버전: $(python3 --version)"
print_status "현재 Node.js 버전: $(node --version)"

mkdir -p "$REPO_ROOT/backend"

# 기존 가상환경 백업 및 새로 생성 (backend/.venv)
print_status "Python 가상환경 재생성 중 (backend/.venv)..."
if [ -d "$REPO_ROOT/backend/.venv" ]; then
    print_warning "기존 backend/.venv 를 백업합니다..."
    mv "$REPO_ROOT/backend/.venv" "$REPO_ROOT/backend/.venv_backup_$(date +%Y%m%d_%H%M%S)"
fi

python3 -m venv "$REPO_ROOT/backend/.venv"
# shellcheck disable=SC1091
source "$REPO_ROOT/backend/.venv/bin/activate"

print_success "새로운 가상환경이 생성되었습니다 (backend/.venv)."

# pip 업그레이드
print_status "pip 업그레이드 중..."
pip install --upgrade pip

# macOS 호환 requirements 생성
print_status "macOS 호환 패키지 목록 생성 중..."
cat > "$REPO_ROOT/backend/requirements_macos.txt" << 'EOF'
# Core FastAPI dependencies
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
websockets==12.0
pydantic==2.5.0
python-dotenv==1.0.0

# Basic data processing
pandas>=2.0.0
numpy>=1.24.0

# System utilities
psutil>=5.9.0

# Development tools
pytest>=7.4.0
black>=23.0.0
EOF

# 필수 패키지만 설치
print_status "필수 Python 패키지 설치 중..."
pip install -r "$REPO_ROOT/backend/requirements_macos.txt"

print_success "기본 패키지 설치 완료!"

# 편의 스크립트 생성
print_status "시작 스크립트 생성 중..."

# 백엔드 시작 스크립트
cat > "$REPO_ROOT/start_backend.sh" << 'EOF'
#!/bin/bash
echo "🚀 통합 백엔드 시작 (main_server, 기본 포트 5002)..."
ROOT="$(cd "$(dirname "$0")" && pwd)"
exec "$ROOT/scripts/restart-backend.sh"
EOF

# 프론트엔드 시작 스크립트  
cat > "$REPO_ROOT/start_frontend.sh" << 'EOF'
#!/bin/bash
echo "🚀 프론트엔드 서버 시작 중..."
cd "$(dirname "$0")"
echo "서버가 http://localhost:3000 에서 실행됩니다."
npm start
EOF

# 전체 시작 스크립트
cat > "$REPO_ROOT/start_system.sh" << 'EOF'
#!/bin/bash
echo "🚀 카카오톡 AI 분석 시스템 시작 중..."

# 터미널 탭에서 백엔드 실행
echo "백엔드 서버를 새 터미널에서 실행합니다..."
osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && ./start_backend.sh"'

# 잠시 대기
sleep 2

# 프론트엔드 실행
echo "프론트엔드 서버 시작..."
npm start
EOF

# 실행 권한 부여
chmod +x "$REPO_ROOT/start_backend.sh" "$REPO_ROOT/start_frontend.sh" "$REPO_ROOT/start_system.sh"

# 개발 환경 설정 파일
cat > "$REPO_ROOT/.env.development" << 'EOF'
# 개발 환경 설정
NODE_ENV=development
REACT_APP_API_URL=http://localhost:5002
BACKEND_PORT=5002
FRONTEND_PORT=3000
EOF

# VS Code 설정
mkdir -p "$REPO_ROOT/.vscode"
cat > "$REPO_ROOT/.vscode/settings.json" << 'EOF'
{
    "python.defaultInterpreterPath": "${workspaceFolder}/backend/.venv/bin/python",
    "python.pythonPath": "${workspaceFolder}/backend/.venv/bin/python",
    "python.terminal.activateEnvironment": true,
    "editor.formatOnSave": true,
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true
    }
}
EOF

# 간단한 개발 가이드
cat > "$REPO_ROOT/QUICK_START.md" << 'EOF'
# 🚀 빠른 시작 가이드

통합 API(권장)는 포트 **5002**: `npm run restart:backend` 또는 `bash scripts/start-api-5002.sh`

## 전체 시스템 실행 (래퍼)
```bash
./start_system.sh
```

## 개별 실행

### 백엔드만 실행
```bash
./start_backend.sh
```

### 프론트엔드만 실행
```bash
./start_frontend.sh
```

## 개발 환경

### Python 가상환경
- 위치: **backend/.venv**
```bash
source backend/.venv/bin/activate
```

### 서버 주소
- **프론트엔드**: http://localhost:3000
- **통합 API**: http://localhost:5002

## 문제 해결

### 포트 사용 확인
```bash
lsof -i :3000
lsof -i :5002
lsof -i :5002
```

### 프로세스 종료
```bash
pkill -f "simple_message_generator"
pkill -f "npm start"
```
EOF

print_success "🎉 macOS 개발 환경 설정 완료!"
echo ""
echo "📁 생성된 파일:"
echo "  🐍 backend/.venv          - Python 가상환경"
echo "  🚀 start_backend.sh     - 백엔드 서버 실행"
echo "  🚀 start_frontend.sh    - 프론트엔드 서버 실행" 
echo "  🚀 start_system.sh      - 전체 시스템 실행"
echo "  ⚙️  .env.development     - 환경 설정"
echo "  🛠️  .vscode/settings.json - VS Code (backend/.venv)"
echo "  📖 QUICK_START.md       - 빠른 시작 가이드"
echo ""
echo "🎯 다음 명령어로 시스템을 시작하세요:"
echo "   npm run restart:backend   # 통합 API 5002"
echo "   ./start_system.sh         # 레거시 래퍼"
echo ""
echo "또는 개별 실행:"
echo "   ./start_backend.sh     (백엔드)"
echo "   ./start_frontend.sh    (프론트엔드)"
