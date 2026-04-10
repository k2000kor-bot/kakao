#!/usr/bin/env bash
# 프론트엔드 포트 정리 후 재시작 (http://localhost:3000)

set -e
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-3000}"
echo "[restart] 프로젝트 루트: $ROOT_DIR"

# 포트 사용 중인 프로세스 종료
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti ":$PORT" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "[restart] 포트 $PORT 사용 중인 프로세스 종료: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 2
  else
    echo "[restart] 포트 $PORT 에서 실행 중인 프로세스 없음."
  fi
else
  echo "[restart] lsof 없음, 포트 정리 생략."
fi

export HOST="${HOST:-0.0.0.0}"
echo "[restart] 프론트엔드 서버 시작 (PORT=$PORT, HOST=$HOST)..."
echo "[restart] 접속 주소: http://localhost:$PORT 또는 http://127.0.0.1:$PORT"
echo ""

export BROWSER=none
export PORT
export DANGEROUSLY_DISABLE_HOST_CHECK="${DANGEROUSLY_DISABLE_HOST_CHECK:-true}"
export NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=8192"
export DISABLE_ESLINT_PLUGIN="${DISABLE_ESLINT_PLUGIN:-true}"
export GENERATE_SOURCEMAP="${GENERATE_SOURCEMAP:-false}"

# restart:local 시 HOST=127.0.0.1 이면 start:local 사용 (package.json의 start는 HOST=0.0.0.0 고정)
if [ "$HOST" = "127.0.0.1" ]; then
  exec npm run start:local
else
  exec npm start
fi
