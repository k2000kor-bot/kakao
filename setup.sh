#!/bin/bash
# CORBU.AI - 기본 셋팅 스크립트
# 별도 설치가 필요한 의존성을 한 번에 설정합니다.

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 CORBU.AI 기본 셋팅을 시작합니다..."
echo ""

# ---------- 1. 백엔드 (Python) ----------
echo "📦 [1/2] 백엔드 Python 의존성 설치..."
cd backend

if [ ! -d "venv" ]; then
    echo "   Python 가상환경 생성 중..."
    python3 -m venv venv
fi

echo "   가상환경 활성화 및 패키지 설치..."
source venv/bin/activate

# requirements-core.txt 사용 (tensorflow/torch 제외 - 의존성 충돌 방지)
if [ -f "requirements-core.txt" ]; then
    pip install -q --upgrade pip
    pip install -q -r requirements-core.txt
    [ -f "requirements-dev.txt" ] && pip install -q -r requirements-dev.txt || true
    echo "   ✅ 백엔드 핵심 패키지 설치 완료"
else
    pip install -q --upgrade pip
    pip install -q -r requirements.txt || pip install -q -r requirements-core.txt
    echo "   ✅ 백엔드 패키지 설치 완료"
fi

deactivate
cd ..
echo ""

# ---------- 2. 프론트엔드 (Node.js) ----------
echo "📦 [2/2] 프론트엔드 Node.js 의존성 설치..."

# nvm 로드 시도 (설치되어 있으면)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -f ".nvmrc" ] && nvm use 2>/dev/null || true

# Node.js 확인
if ! command -v node &> /dev/null; then
    echo ""
    echo "⚠️  Node.js가 설치되어 있지 않습니다."
    echo "   다음 중 하나로 Node.js를 먼저 설치해주세요:"
    echo "   • Homebrew: brew install node"
    echo "   • 공식 사이트: https://nodejs.org/"
    echo "   • nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo ""
    read -p "   Node.js를 설치한 후 계속하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   설치를 중단합니다. Node.js 설치 후 다시 setup.sh를 실행하세요."
        exit 1
    fi
fi

if command -v npm &> /dev/null; then
    npm install
    echo "   ✅ 프론트엔드 패키지 설치 완료"
else
    echo "   ❌ npm을 찾을 수 없습니다. Node.js를 설치해주세요."
    exit 1
fi

echo ""
echo "✅ 기본 셋팅이 완료되었습니다!"
echo ""
echo "🚀 실행 방법:"
echo "   ./start_all.sh"
echo ""
echo "   또는 개별 실행:"
echo "   - 백엔드: cd backend && ./start.sh"
echo "   - 프론트엔드: npm start"
echo ""
echo "📍 접속 주소:"
echo "   - 프론트엔드: http://localhost:3000"
echo "   - 백엔드 API: http://localhost:5002 (통합 main_server · app.py는 API_PORT/BACKEND_PORT 기본 5002)"
echo ""
echo "🔌 추가 기능(OCR, 영상 음성 추출, Ollama 등): ./install-plugins.sh"
echo "   상세: PLUGINS_SETUP.md 참고"
echo ""
