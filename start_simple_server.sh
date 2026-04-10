#!/bin/bash
# 프론트 dev 서버만 백그라운드 (저장소 루트 = package.json 있는 폴더)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

if [ ! -f "$SCRIPT_DIR/package.json" ]; then
  echo "❌ package.json 이 있는 프로젝트 루트에서 실행하세요."
  exit 1
fi

mkdir -p "$SCRIPT_DIR/logs"

pkill -f "react-scripts" 2>/dev/null || true
pkill -f "node.*3000" 2>/dev/null || true
sleep 2

BROWSER=none PORT=3000 npm start > "$SCRIPT_DIR/logs/dev-server.log" 2>&1 &
echo $! > "$SCRIPT_DIR/.dev_server_pid"
echo "✅ 개발 서버 시작됨 (PID: $(cat "$SCRIPT_DIR/.dev_server_pid"))"
echo "컴파일 완료까지 약 30초 대기..."
sleep 30
echo "서버 준비 완료!"
tail -5 "$SCRIPT_DIR/logs/dev-server.log"
