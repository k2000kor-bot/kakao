#!/bin/bash
# Cursor 자꾸 종료될 때 — Cursor 없이 실행
# 사용법: Finder에서 더블클릭 또는 터미널에서 ./scripts/fix-cursor-crash.sh

set -e
cd "$(dirname "$0")/.."

echo "=== Cursor 크래시 완화 적용 ==="

# 1. .cursorignore 보강
if ! grep -q "backups/" .cursorignore 2>/dev/null; then
  cat >> .cursorignore << 'EOF'

# 크래시 완화용
backups/
docs/reports/
*.sqlite
*.log
.DS_Store
corbu-ai/
frontend/node_modules/
EOF
  echo "✓ .cursorignore 보강 완료"
else
  echo "✓ .cursorignore 이미 보강됨"
fi

# 2. Cursor 캐시 삭제
CACHE="$HOME/Library/Application Support/Cursor"
if [ -d "$CACHE/Cache" ] || [ -d "$CACHE/CachedData" ]; then
  rm -rf "$CACHE/Cache"/* "$CACHE/CachedData"/* 2>/dev/null || true
  echo "✓ Cursor 캐시 삭제 완료"
else
  echo "✓ Cursor 캐시 없음"
fi

echo ""
echo "완료. Cursor를 완전히 종료(⌘Q)한 뒤 다시 실행하세요."
echo "자세한 내용: docs/CRASH_EMERGENCY_FIX.md"
