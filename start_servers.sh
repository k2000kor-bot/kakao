#!/usr/bin/env bash
# 레거시: 백엔드 + 프론트 동시 기동. 통합 API는 포트 5002.
# 권장: 터미널 분리 — `npm run restart:backend` + `npm start`

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

if [ ! -f "$SCRIPT_DIR/package.json" ]; then
  echo "❌ package.json 이 있는 프로젝트 루트에서 실행하세요."
  exit 1
fi

# shellcheck source=scripts/lib-backend-python.sh
source "$SCRIPT_DIR/scripts/lib-backend-python.sh"
PYTHON_CMD="python3"
if backend_python_resolve "$SCRIPT_DIR" "import uvicorn"; then
  PYTHON_CMD="$BACKEND_PYTHON_CMD"
  echo "📡 Python: $PYTHON_CMD"
else
  echo "⚠️  venv 에 uvicorn 없음 — python3 사용 (실패 시: cd backend && pip install -r requirements-core.txt)"
fi

echo "🚀 백엔드 main_server (5002) 백그라운드 시작..."
(
  cd "$SCRIPT_DIR/backend" || exit 1
  exec "$PYTHON_CMD" -m uvicorn main_server:app --host 0.0.0.0 --port 5002 --reload
) &
BACKEND_PID=$!

sleep 2

echo "⚛️  React (3000) 시작..."
npm start &
REACT_PID=$!

echo "✅ 시작됨 — 백엔드 PID: $BACKEND_PID, 프론트 PID: $REACT_PID"
echo "📍 API: http://localhost:5002  |  앱: http://localhost:3000"
echo "🛑 중지: kill $BACKEND_PID $REACT_PID"
wait
