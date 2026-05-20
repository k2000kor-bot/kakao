#!/usr/bin/env bash
# 관계도 정리 답변(합성·2-pass·학습) 커밋만 패치로 추출 — 전체 dev-continue 브랜치 없이 적용
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ff911ff77 단일 커밋 (기능). handoff·문서까지: GRAPH_PATCH_END=HEAD
BASE="${GRAPH_PATCH_BASE:-ff911ff77^}"
END="${GRAPH_PATCH_END:-ff911ff77}"
OUT="${1:-/Users/a0/kakao-frontend/patches-graph-answer-only}"

mkdir -p "$OUT"
rm -f "${OUT}"/*.patch
git format-patch "${BASE}..${END}" -o "$OUT"

echo "graph answer patches: ${BASE}..${END} -> ${OUT}"
ls -1 "${OUT}"/*.patch 2>/dev/null || true
