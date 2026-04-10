#!/bin/bash

echo "🚀 WebSocket 서버를 시작합니다..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
cd "$REPO_ROOT" || exit 1

if ! backend_venv_activate "$REPO_ROOT"; then
    echo "⚠️  가상환경을 찾을 수 없습니다. 시스템 Python을 사용합니다."
fi

echo "📦 필요한 패키지를 확인합니다..."
pip install websockets

echo "🔌 WebSocket 서버를 시작합니다 (포트 8001)..."
exec python3 "$REPO_ROOT/backend/advanced_websocket_server.py"
