#!/usr/bin/env bash
# 아티팩트 무결성 점검. 절차·인수인계: docs/PUSH_BLOCK_HANDOFF.md · 회귀·검증: TESTING_GUIDE.md · npm run test:sidebar-context
set -euo pipefail

BUNDLE_PATH="/Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-01-20.bundle"
PATCH_PATH="/Users/a0/kakao-frontend/0001-test-harden-sidebar-context-filter-sync-contracts.patch"

EXPECTED_BUNDLE_SHA="27e1411a1d9462fbcfc04f7dfe4614c38eb593d9e9ae104be7328e215e2767e2"
EXPECTED_PATCH_SHA="ed0abc7ea4ce04271371f1734a2863a5f332277d6c828178a448705a79960f38"

if [[ ! -f "$BUNDLE_PATH" ]]; then
  echo "missing bundle: $BUNDLE_PATH" >&2
  exit 1
fi

if [[ ! -f "$PATCH_PATH" ]]; then
  echo "missing patch: $PATCH_PATH" >&2
  exit 1
fi

ACTUAL_BUNDLE_SHA="$(shasum -a 256 "$BUNDLE_PATH" | awk '{print $1}')"
ACTUAL_PATCH_SHA="$(shasum -a 256 "$PATCH_PATH" | awk '{print $1}')"

if [[ "$ACTUAL_BUNDLE_SHA" != "$EXPECTED_BUNDLE_SHA" ]]; then
  echo "bundle sha mismatch" >&2
  echo "expected: $EXPECTED_BUNDLE_SHA" >&2
  echo "actual:   $ACTUAL_BUNDLE_SHA" >&2
  exit 1
fi

if [[ "$ACTUAL_PATCH_SHA" != "$EXPECTED_PATCH_SHA" ]]; then
  echo "patch sha mismatch" >&2
  echo "expected: $EXPECTED_PATCH_SHA" >&2
  echo "actual:   $ACTUAL_PATCH_SHA" >&2
  exit 1
fi

echo "artifacts verified"
echo "bundle: $BUNDLE_PATH"
echo "patch:  $PATCH_PATH"
