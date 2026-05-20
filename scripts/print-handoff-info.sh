#!/usr/bin/env bash
# bundle·패치·브랜치 tip 한 줄 요약 (이관·검증용)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MANIFEST="${ROOT}/docs/PUSH_BLOCK_MANIFEST.md"
if [[ ! -f "$MANIFEST" ]]; then
  bash scripts/generate-push-block-manifest.sh
fi

echo "=== Handoff (dev-continue-2026-01-20) ==="
git log -1 --oneline
echo ""
grep -E '^- (bundle_path|bundle_sha256|patch_series_count|latest_commit):' "$MANIFEST" 2>/dev/null || cat "$MANIFEST"
echo ""
echo "검증: npm run verify:handoff-artifacts"
echo "재생성: npm run refresh:handoff-artifacts"
echo "이관: docs/PUSH_BLOCK_HANDOFF.md"
