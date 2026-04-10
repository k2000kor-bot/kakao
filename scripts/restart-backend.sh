#!/usr/bin/env bash
# 백엔드 포트 정리 후 재시작 (프론트 config/api.ts와 맞춤: 5002)
# Python: backend/venv → .venv → 시스템 python3 (import uvicorn 성공분) 우선, 없으면 .venv 재생성

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
# shellcheck source=lib-backend-python.sh
source "$SCRIPT_DIR/lib-backend-python.sh"
cd "$BACKEND_DIR"

# 프론트엔드 API_BASE_URL(5002)과 동일한 포트 사용
PORT="${BACKEND_PORT:-5002}"
echo "[restart:backend] 백엔드 디렉터리: $BACKEND_DIR"

# 포트 사용 중인 프로세스 종료
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti ":$PORT" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "[restart:backend] 포트 $PORT 사용 중인 프로세스 종료: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 2
  else
    echo "[restart:backend] 포트 $PORT 에서 실행 중인 프로세스 없음."
  fi
else
  echo "[restart:backend] lsof 없음, 포트 정리 생략."
fi

PYTHON_CMD="python3"
REUSE_VENV=
if backend_python_resolve "$ROOT_DIR" "import uvicorn"; then
  PYTHON_CMD="$BACKEND_PYTHON_CMD"
  REUSE_VENV=1
  echo "[restart:backend] Python (venv 우선): $PYTHON_CMD"
  "$PYTHON_CMD" -c "import gtts" 2>/dev/null || echo "[restart:backend] TTS 폴백 사용 시: pip install gtts"
fi

VENV_PYTHON="$BACKEND_DIR/.venv/bin/python"
if [ -z "$REUSE_VENV" ] && [ -x "$VENV_PYTHON" ]; then
  if "$VENV_PYTHON" -c "import uvicorn" 2>/dev/null; then
    PYTHON_CMD="$VENV_PYTHON"
    REUSE_VENV=1
    echo "[restart:backend] 가상환경 사용: .venv"
    "$VENV_PYTHON" -c "import gtts" 2>/dev/null || echo "[restart:backend] TTS 폴백 사용 시: pip install gtts"
  else
    echo "[restart:backend] .venv에 uvicorn 없음. 가상환경 재생성합니다."
  fi
elif [ -z "$REUSE_VENV" ] && [ -d "$BACKEND_DIR/.venv" ]; then
  echo "[restart:backend] .venv가 깨져 있음(다른 경로/삭제된 python). 재생성합니다."
fi

if [ -z "$REUSE_VENV" ] && command -v python3 >/dev/null 2>&1; then
  echo "[restart:backend] 가상환경 생성 중... (requirements-core.txt 기준)"
  if (cd "$BACKEND_DIR" && rm -rf .venv && python3 -m venv .venv && .venv/bin/pip install -q -r requirements-core.txt); then
    if [ -x "$VENV_PYTHON" ] && "$VENV_PYTHON" -c "import uvicorn" 2>/dev/null; then
      PYTHON_CMD="$VENV_PYTHON"
      echo "[restart:backend] .venv 생성 완료 (requirements-core.txt)"
    fi
  else
    echo "[restart:backend] .venv 생성 실패. 시스템 python3로 시도합니다."
    echo "[restart:backend] 수동 설치: cd $BACKEND_DIR && pip install -r requirements-core.txt"
  fi
fi

if ! "$PYTHON_CMD" -c "import uvicorn" 2>/dev/null; then
  echo "[restart:backend] 오류: uvicorn을 찾을 수 없습니다. 다음 중 하나를 실행하세요:"
  echo "  cd $BACKEND_DIR && pip install -r requirements-core.txt"
  echo "  또는: cd $BACKEND_DIR && python3 -m venv .venv && .venv/bin/pip install -r requirements-core.txt"
  exit 1
fi

echo "[restart:backend] 백엔드 서버 시작 (PORT=$PORT)..."
echo "[restart:backend] API 주소: http://localhost:$PORT"
echo ""

exec "$PYTHON_CMD" -m uvicorn main_server:app --host 0.0.0.0 --port "$PORT" --reload --log-level info
