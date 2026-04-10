#!/bin/bash
# E2E 테스트: npm start 선실행 후 Playwright 실행
# CRA 초기 컴파일이 오래 걸리므로 webServer 대신 수동 기동 사용

set -e
cd "$(dirname "$0")/.."

# 포트 3000 선점 해제 (이전 프로세스 등)
if lsof -ti :3000 >/dev/null 2>&1; then
  echo "Killing process on port 3000..."
  lsof -ti :3000 | xargs kill -9 2>/dev/null || true
  sleep 2
fi

echo "Starting dev server..."
npm start &
PID=$!
trap "kill $PID 2>/dev/null || true; exit" EXIT INT TERM

echo "Waiting 90s for CRA compile..."
sleep 90

echo "Running E2E (chromium, no webServer)..."
E2E_SERVER_READY=1 E2E_SKIP_REACHABILITY_CHECK=1 npm run test:e2e -- --project=chromium "$@"
