#!/bin/bash

# CORBU.AI Backend API 시작 스크립트 (backend 디렉터리 기준)

echo "🚀 CORBU.AI Backend API 시작 중..."

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$BACKEND_DIR/.." && pwd)"
# shellcheck source=../scripts/lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"

cd "$REPO_ROOT" || exit 1
if backend_venv_activate "$REPO_ROOT"; then
    echo "📦 가상환경 활성화됨"
else
    echo "⚠️  표준 venv 없음 — backend/venv·backend/.venv 생성 후 재시도 권장"
fi

cd "$BACKEND_DIR" || exit 1

# 의존성 확인
echo "🔍 의존성 확인 중..."
python3 -c "import fastapi, uvicorn, pydantic, psutil" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  필요한 패키지가 설치되지 않았습니다."
    echo "📥 의존성 설치 중..."
    pip install -r requirements-core.txt 2>/dev/null || pip install -r requirements.txt
fi

# 환경 변수 설정 (기본값: 통합 백엔드 5002)
export BACKEND_PORT="${BACKEND_PORT:-${PORT:-5002}}"
export PORT="${PORT:-$BACKEND_PORT}"
export API_PORT="${API_PORT:-$BACKEND_PORT}"
export API_HOST=${API_HOST:-0.0.0.0}
export DEBUG=${DEBUG:-false}
export RELOAD=${RELOAD:-true}

echo "📍 서버 설정:"
echo "   - 포트: $BACKEND_PORT (app.py — BACKEND_PORT/PORT/API_PORT)"
echo "   - 호스트: $API_HOST"
echo "   - 디버그 모드: $DEBUG"
echo ""

exec python3 app.py
