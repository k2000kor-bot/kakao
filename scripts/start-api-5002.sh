#!/usr/bin/env bash
# 통합 API 서버(main_server.py) 포트 5002 실행 — restart:backend와 동일한 진입점
# 사용: 이 터미널은 그대로 두고, 새 터미널에서 npm start 후 http://localhost:3000 접속

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
# shellcheck source=lib-backend-python.sh
source "$SCRIPT_DIR/lib-backend-python.sh"
cd "$BACKEND_DIR"

PORT="${BACKEND_PORT:-5002}"
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti ":$PORT" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "[start-api] 포트 $PORT 이미 사용 중. 종료 후 재시작: npm run restart:backend"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 2
  fi
fi

PYTHON_CMD="python3"
if backend_python_resolve "$ROOT_DIR" "import uvicorn"; then
  PYTHON_CMD="$BACKEND_PYTHON_CMD"
  echo "[start-api] Python: $PYTHON_CMD"
fi

echo "[start-api] 통합 API 서버 시작: http://localhost:$PORT"
echo "[start-api] 프론트는 새 터미널에서: npm start → http://localhost:3000"
echo ""

exec "$PYTHON_CMD" -m uvicorn main_server:app --host 0.0.0.0 --port "$PORT" --reload --log-level info
