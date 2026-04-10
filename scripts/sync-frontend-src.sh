#!/usr/bin/env bash
# 메인 src/ → 보조 트리 frontend/src/ 전체 미러 (CRA 보조 패키지용)
# 권한·샌드박스에서 읽기 실패하는 로컬 폴더는 rsync 제외 (.gitignore·.cursorignore와 동일)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

rsync -a --delete \
  --exclude='.DS_Store' \
  --exclude='components/Oracle_JDK-24.jdk' \
  --exclude='components/OpenJDK-24.jdk' \
  --exclude='components/Security' \
  --exclude='components/backup' \
  src/ frontend/src/

cp src/styles/GensparkQALayout.css frontend/styles/GensparkQALayout.css
echo 'synced src/ -> frontend/src/ (+ frontend/styles/GensparkQALayout.css)'
npm run check:test-imports
