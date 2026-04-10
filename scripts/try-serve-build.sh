#!/usr/bin/env bash
# 포트 3000 정리 → 빌드 → 빌드 결과만 서빙 (접속 테스트용)
# 사용: npm run try:serve
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[try-serve] 포트 3000 정리 중..."
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
sleep 2

echo "[try-serve] Jest 테스트 import 패턴 확인..."
npm run check:test-imports

echo "[try-serve] 빌드 실행 중..."
npm run build

echo "[try-serve] 빌드 결과 서빙 (http://localhost:3000)"
echo "[try-serve] 접속되면 CRA dev 서버 쪽만 문제인 것. 종료: Ctrl+C"
echo ""
exec node scripts/serve-build.js
