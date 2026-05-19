#!/usr/bin/env bash
# 아티팩트 무결성 점검. 절차·인수인계: docs/PUSH_BLOCK_HANDOFF.md · 최신 경로·SHA: docs/PUSH_BLOCK_MANIFEST.md
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PATCH_SERIES_BASE="${PATCH_SERIES_BASE:-bc4451251}"

BUNDLE_PATH="/Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-05-19.bundle"
PATCH_PATH="/Users/a0/kakao-frontend/0001-feat-chat-composer-multi-request-pipeline-and-conver.patch"
PATCH_PATH_2="/Users/a0/kakao-frontend/0002-feat-backend-conversation-graph-API-and-pytest-for-C.patch"
PATCH_SERIES_DIR="/Users/a0/kakao-frontend/patches-dev-continue-2026-05-19"

EXPECTED_BUNDLE_SHA="4f83bb8ed8a0efb211ef267bd5748f38fedb90ec9fbe1d19f0a8387fc0d2c103"
EXPECTED_PATCH_SHA="cf79c715adf51acea9a3774e98e2557eeaf0cc6295ad68a0e413f61b5e40a9e9"
EXPECTED_PATCH_2_SHA="f466b3a60f81558e2c5f6e3f0ea78b007acdedeb3e55918d956d460a35734870"

verify_file() {
  local path="$1"
  local expected="$2"
  local label="$3"
  if [[ ! -f "$path" ]]; then
    echo "missing ${label}: $path" >&2
    exit 1
  fi
  local actual
  actual="$(shasum -a 256 "$path" | awk '{print $1}')"
  if [[ "$actual" != "$expected" ]]; then
    echo "${label} sha mismatch" >&2
    echo "expected: $expected" >&2
    echo "actual:   $actual" >&2
    exit 1
  fi
  echo "  OK ${label}: $path"
}

verify_file "$BUNDLE_PATH" "$EXPECTED_BUNDLE_SHA" "bundle"
verify_file "$PATCH_PATH" "$EXPECTED_PATCH_SHA" "patch 1"
verify_file "$PATCH_PATH_2" "$EXPECTED_PATCH_2_SHA" "patch 2"

expected_patch_count="$(git -C "$PROJECT_ROOT" rev-list --count "${PATCH_SERIES_BASE}..HEAD")"
shopt -s nullglob
patch_series=("$PATCH_SERIES_DIR"/*.patch)
if [[ ! -d "$PATCH_SERIES_DIR" ]]; then
  echo "missing patch series dir: $PATCH_SERIES_DIR" >&2
  exit 1
fi
if [[ ${#patch_series[@]} -ne "$expected_patch_count" ]]; then
  echo "patch series count mismatch" >&2
  echo "expected: $expected_patch_count (from ${PATCH_SERIES_BASE}..HEAD)" >&2
  echo "actual:   ${#patch_series[@]} in $PATCH_SERIES_DIR" >&2
  exit 1
fi
echo "  OK patch series: ${#patch_series[@]} patches in $PATCH_SERIES_DIR"

echo "artifacts verified (see docs/PUSH_BLOCK_MANIFEST.md)"
