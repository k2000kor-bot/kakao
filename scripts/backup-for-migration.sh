#!/usr/bin/env bash
# 프로젝트 전체 백업 (새 PC 이전용)
# - node_modules, .venv, build 등 제외 → 새 PC에서 npm install / pip install 로 복구
# - 압축 파일은 프로젝트 상위 폴더에 생성 (예: ../kakao-frontend-backup-YYYY-MM-DD.tar.gz)

set -e
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
PARENT="$(dirname "$ROOT")"
DATE="$(date +%Y-%m-%d)"
ARCHIVE_NAME="kakao-frontend-backup-${DATE}.tar.gz"
ARCHIVE_PATH="${PARENT}/${ARCHIVE_NAME}"

echo "백업 대상: ${ROOT}"
echo "압축 파일: ${ARCHIVE_PATH}"
echo "제외: node_modules, .venv, build, dist, coverage, __pycache__, .pytest_cache, .git (선택)"
echo ""

# .git 포함 여부 (용량 줄이려면 EXCLUDE_GIT=1 로 실행)
EXCLUDE_GIT="${EXCLUDE_GIT:-0}"

EXCLUDES=(
  --exclude='node_modules'
  --exclude='.venv'
  --exclude='venv'
  --exclude='ENV'
  --exclude='__pycache__'
  --exclude='.pytest_cache'
  --exclude='.coverage'
  --exclude='htmlcov'
  --exclude='build'
  --exclude='dist'
  --exclude='coverage'
  --exclude='.cache'
  --exclude='test-results'
  --exclude='playwright-report'
  --exclude='playwright/.cache'
  --exclude='*.log'
  --exclude='*.pid'
  --exclude='.DS_Store'
)

if [ "$EXCLUDE_GIT" = "1" ]; then
  EXCLUDES+=(--exclude='.git')
  echo "(.git 제외 - 용량 절감)"
fi

tar czf "$ARCHIVE_PATH" "${EXCLUDES[@]}" -C "$PARENT" "$(basename "$ROOT")"

echo ""
echo "완료: ${ARCHIVE_PATH}"
echo "크기: $(du -h "$ARCHIVE_PATH" | cut -f1)"
echo ""
echo "새 PC에서 복원: docs/BACKUP_AND_RESTORE.md 참고"
