#!/usr/bin/env bash
# Lighthouse 성능·접근성 측정 (PERFORMANCE.md §2.2, §2.6)
# 사용: build 후 serve가 3000에서 동작 중이어야 함.
#   npm run build && npx serve -s build -l 3000   # 백그라운드
#   ./scripts/run-lighthouse.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -d "build" ]; then
  echo "build/ 없음. npm run check:test-imports 후 빌드 실행 중..."
  npm run check:test-imports
  npm run build
fi

echo "=== Lighthouse 실행 (http://localhost:3000) ==="
echo "  서버 미기동 시: npx serve -s build -l 3000 (백그라운드)"
echo ""

npm run lighthouse || {
  echo ""
  echo "실패: localhost:3000 연결 불가. 먼저 실행: npx serve -s build -l 3000"
  exit 1
}
echo ""
echo "결과: lighthouse-report.html 생성. 목표: Performance 92+, Accessibility 95+ (PERFORMANCE.md §2.2)"
