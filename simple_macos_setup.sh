#!/bin/bash

# 간단한 macOS 개발 환경 설정
echo "🍎 간단한 macOS 개발 환경 설정을 시작합니다..."

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

# 기존 가상환경 백업 및 새로 생성
print_status "Python 가상환경 재생성 중..."
if [ -d ".venv" ]; then
    print_warning "기존 가상환경을 백업합니다..."
    mv .venv .venv_backup_$(date +%Y%m%d_%H%M%S)
fi

# 새 가상환경 생성
python3 -m venv .venv
source .venv/bin/activate

print_success "새로운 가상환경이 생성되었습니다."

# pip 업그레이드
print_status "pip 업그레이드 중..."
pip install --upgrade pip

# macOS 호환 requirements 생성
print_status "macOS 호환 패키지 목록 생성 중..."
cat > backend/requirements_macos.txt << 'EOF'
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
pip install -r backend/requirements_macos.txt

print_success "기본 패키지 설치 완료!"

# 편의 스크립트 생성
print_status "시작 스크립트 생성 중..."

# 백엔드 시작 스크립트
cat > start_backend.sh << 'EOF'
#!/bin/bash
echo "🚀 백엔드 서버 시작 중..."
cd "$(dirname "$0")"
source .venv/bin/activate
cd backend
echo "서버가 http://localhost:8007 에서 실행됩니다."
python simple_message_generator.py
EOF

# 프론트엔드 시작 스크립트  
cat > start_frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 프론트엔드 서버 시작 중..."
cd "$(dirname "$0")"
echo "서버가 http://localhost:3000 에서 실행됩니다."
npm start
EOF

# 전체 시작 스크립트
cat > start_system.sh << 'EOF'
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
chmod +x start_backend.sh start_frontend.sh start_system.sh

# 개발 환경 설정 파일
cat > .env.development << 'EOF'
# 개발 환경 설정
NODE_ENV=development
REACT_APP_API_URL=http://localhost:8007
BACKEND_PORT=8007
FRONTEND_PORT=3000
EOF

# VS Code 설정
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
    "python.pythonPath": "./.venv/bin/python",
    "python.terminal.activateEnvironment": true,
    "editor.formatOnSave": true,
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true
    }
}
EOF

# 간단한 개발 가이드
cat > QUICK_START.md << 'EOF'
# 🚀 빠른 시작 가이드

## 전체 시스템 실행
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

### Python 가상환경 활성화
```bash
source .venv/bin/activate
```

### 서버 주소
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8007
- **API 문서**: http://localhost:8007/docs

## 문제 해결

### 포트 사용 확인
```bash
lsof -i :3000
lsof -i :8007
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
echo "  🚀 start_backend.sh     - 백엔드 서버 실행"
echo "  🚀 start_frontend.sh    - 프론트엔드 서버 실행" 
echo "  🚀 start_system.sh      - 전체 시스템 실행"
echo "  ⚙️  .env.development     - 환경 설정"
echo "  🛠️  .vscode/settings.json - VS Code 설정"
echo "  📖 QUICK_START.md       - 빠른 시작 가이드"
echo ""
echo "🎯 다음 명령어로 시스템을 시작하세요:"
echo "   ./start_system.sh"
echo ""
echo "또는 개별 실행:"
echo "   ./start_backend.sh     (백엔드)"
echo "   ./start_frontend.sh    (프론트엔드)" 