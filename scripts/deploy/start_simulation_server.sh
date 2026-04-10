#!/bin/bash

echo "🚀 시뮬레이션 서버 시작"
echo "======================="

# 기존 프로세스 종료
pkill -f "python.*simulation_server.py" 2>/dev/null

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
cd "$REPO_ROOT/backend" || exit 1
if ! backend_venv_activate "$REPO_ROOT"; then
  echo "❌ 가상환경을 찾을 수 없습니다 (backend/venv, backend/.venv 등)."
  exit 1
fi

# 시뮬레이션 서버 시작
python3 simulation_server.py 