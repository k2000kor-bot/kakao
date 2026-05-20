#!/usr/bin/env bash
# Council·자가 개발·재생성 E2E 커밋만 별도 패치로 추출 (push-block 전체 브랜치 없이 적용용)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BASE="${COMPOSER_PATCH_BASE:-15426d29b}"
END="${COMPOSER_PATCH_END:-820897aea}"
OUT="${1:-/Users/a0/kakao-frontend/patches-composer-council-only}"

mkdir -p "$OUT"
git format-patch "${BASE}..${END}" -o "$OUT"

echo "composer council patches: ${BASE}..${END} -> ${OUT}"
ls -1 "$OUT"/*.patch 2>/dev/null || true
