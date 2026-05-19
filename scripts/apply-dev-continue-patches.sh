#!/usr/bin/env bash
# dev-continue-2026-01-20 전체 patch 시리즈 적용 (bundle 대신 가벼운 이관)
# 생성: git format-patch bc4451251..HEAD -o ../patches-dev-continue-2026-05-19
set -euo pipefail

PATCH_DIR="${1:-/Users/a0/kakao-frontend/patches-dev-continue-2026-05-19}"

if [[ ! -d "$PATCH_DIR" ]]; then
  echo "patch 디렉터리 없음: $PATCH_DIR" >&2
  echo "생성: cd kakao-frontend && git format-patch bc4451251..HEAD -o $PATCH_DIR"
  exit 1
fi

shopt -s nullglob
patches=("$PATCH_DIR"/*.patch)
if [[ ${#patches[@]} -eq 0 ]]; then
  echo "no patches in $PATCH_DIR" >&2
  exit 1
fi

echo "Applying ${#patches[@]} patches from $PATCH_DIR"
git am "${patches[@]}"
echo "OK: applied ${#patches[@]} patches"
