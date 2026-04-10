#!/usr/bin/env bash
# main_server (FastAPI) — 프론트·restart-backend와 동일: 기본 포트 5002
echo "🚀 메인 서버 시작 (uvicorn main_server:app)"
echo "=================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"

PORT="${PORT:-5002}"

cd "$REPO_ROOT/backend" || exit 1

if ! backend_venv_activate "$REPO_ROOT"; then
  echo "❌ 가상환경을 찾을 수 없습니다. 예: cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements-core.txt"
  exit 1
fi

# 동일 포트·프로세스 정리 (restart-backend.sh 와 유사)
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti ":$PORT" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "⚠️  포트 $PORT 사용 중 — 종료: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
fi
pkill -f "uvicorn.*main_server:app" 2>/dev/null || true

echo "📍 http://0.0.0.0:$PORT (문서: /api/docs)"
exec python3 -m uvicorn main_server:app --host 0.0.0.0 --port "$PORT" --reload --log-level info
