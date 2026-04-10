#!/usr/bin/env bash
# CORBU.AI 전체 시스템 시작 (백엔드 5002 + 프론트 3000)
# 사용: 이 스크립트가 있는 폴더(= package.json 있는 폴더)에서 실행
#   ./start_all.sh
# 또는 절대경로로:
#   bash /path/to/kakao-frontend/kakao-frontend/start_all.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR"
# package.json이 있는지 확인
if [ ! -f "$ROOT/package.json" ]; then
  echo "❌ 오류: package.json을 찾을 수 없습니다. 이 스크립트는 package.json이 있는 폴더에서 실행해야 합니다."
  echo "   현재 스크립트 경로: $SCRIPT_DIR"
  echo "   예: cd kakao-frontend/kakao-frontend && ./start_all.sh"
  exit 1
fi
cd "$ROOT"

# nvm (선택)
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 2>/dev/null || true
[ -f ".nvmrc" ] && nvm use 2>/dev/null || true

echo "🚀 CORBU.AI 전체 시스템 시작 (프로젝트 루트: $ROOT)"
echo ""

# 포트 5002 정리 (백엔드)
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti ":5002" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "포트 5002 정리 중..."
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 2
  fi
fi

BACKEND_DIR="$ROOT/backend"
# shellcheck source=lib-backend-python.sh
source "$ROOT/scripts/lib-backend-python.sh"
PYTHON_CMD="python3"
if backend_python_resolve "$ROOT" "import uvicorn"; then
  PYTHON_CMD="$BACKEND_PYTHON_CMD"
  echo "   Python: $PYTHON_CMD"
fi

# 백엔드(5002) 백그라운드 시작
echo "📦 백엔드 API (5002) 시작 중..."
(cd "$BACKEND_DIR" && "$PYTHON_CMD" -m uvicorn main_server:app --host 0.0.0.0 --port 5002 --reload --log-level info) > "$ROOT/backend.log" 2>&1 &
BACKEND_PID=$!
echo "   백엔드 PID: $BACKEND_PID (로그: backend.log)"
sleep 3
if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
  echo "❌ 백엔드 시작 실패. backend.log 확인 후, 수동 실행: npm run restart:backend"
  exit 1
fi

# 프론트엔드(3000) 포트 정리
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti ":3000" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "포트 3000 정리 중..."
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 2
  fi
fi

echo "🎨 프론트엔드 (3000) 시작 중..."
echo ""
echo "✅ 백엔드가 백그라운드에서 실행 중입니다."
echo "   - API: http://localhost:5002"
echo "   - Health: http://localhost:5002/api/health"
echo ""
echo "📍 브라우저에서 접속: http://localhost:3000"
echo "   종료: Ctrl+C (프론트만 종료됨. 백엔드 종료: kill $BACKEND_PID 또는 npm run restart:backend로 재시작)"
echo ""

# trap: Ctrl+C 시 백엔드도 종료
trap "echo ''; echo '🛑 종료 중...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM

exec npm start
