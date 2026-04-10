#!/bin/bash

# 궁극의 미디어 지식 활용 시스템 시작 스크립트

echo "🚀 궁극의 미디어 지식 활용 시스템을 시작합니다..."
echo "💡 통합 개발 API는 npm run restart:backend (포트 5002, main_server) 권장"
ULTIMATE_MEDIA_PORT="${ULTIMATE_MEDIA_PORT:-8001}"
export ULTIMATE_MEDIA_PORT

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
cd "$REPO_ROOT" || exit 1

mkdir -p "$REPO_ROOT/uploads" "$REPO_ROOT/processed_media" "$REPO_ROOT/logs"

if ! backend_venv_activate "$REPO_ROOT"; then
    echo "⚠️ 표준 venv 없음. backend/.venv 생성을 시도합니다..."
    if command -v python3 >/dev/null 2>&1; then
        ( cd "$REPO_ROOT/backend" && python3 -m venv .venv && .venv/bin/pip install -q -r requirements-core.txt ) || true
        backend_venv_activate "$REPO_ROOT" || echo "⚠️ 시스템 Python으로 계속합니다."
    fi
fi

echo "📦 필요한 패키지를 설치합니다..."
pip install fastapi uvicorn python-multipart
pip install opencv-python-headless pillow pytesseract
pip install transformers torch sentence-transformers
pip install easyocr
pip install numpy openpyxl python-docx PyPDF2
pip install speechrecognition pydub
pip install aiofiles

echo "🔧 백엔드 서버를 시작합니다..."
python3 "$REPO_ROOT/backend/ultimate_media_knowledge_system.py" &

sleep 3
echo "🔍 서버 상태를 확인합니다..."
curl -s "http://localhost:${ULTIMATE_MEDIA_PORT}/api/v1/health" || echo "서버가 아직 시작되지 않았습니다."

echo "✅ 궁극의 미디어 지식 활용 시스템이 시작되었습니다!"
echo "🌐 백엔드 API: http://localhost:${ULTIMATE_MEDIA_PORT}"
echo "📚 API 문서: http://localhost:${ULTIMATE_MEDIA_PORT}/docs"
echo ""
echo "서버를 중지하려면: Ctrl+C"
