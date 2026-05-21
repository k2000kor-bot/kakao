#!/usr/bin/env bash
# dev-continue handoff: bundle + patch series 재생성 (브랜치 tip과 동기화)
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${PROJECT_ROOT}"

BRANCH="${HANDOFF_BRANCH:-dev-continue-2026-01-20}"
PATCH_SERIES_BASE="${PATCH_SERIES_BASE:-bc4451251}"
if ! git rev-parse "${PATCH_SERIES_BASE}" >/dev/null 2>&1; then
  PATCH_SERIES_BASE="$(git merge-base main HEAD 2>/dev/null || echo main)"
  echo "patch base → ${PATCH_SERIES_BASE} (bc4451251 없음 — filter-repo 후 merge-base)"
fi
BUNDLE_PATH="/Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-05-19.bundle"
PATCH_SERIES_DIR="/Users/a0/kakao-frontend/patches-dev-continue-2026-05-19"

current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$current_branch" != "$BRANCH" ]]; then
  echo "checkout ${BRANCH} first (on ${current_branch})" >&2
  exit 1
fi

echo "bundle -> ${BUNDLE_PATH}"
git bundle create "${BUNDLE_PATH}" "${BRANCH}"

echo "patches -> ${PATCH_SERIES_DIR}"
mkdir -p "${PATCH_SERIES_DIR}"
rm -f "${PATCH_SERIES_DIR}"/*.patch
git format-patch "${PATCH_SERIES_BASE}..HEAD" -o "${PATCH_SERIES_DIR}"

bash scripts/generate-push-block-manifest.sh
bash scripts/verify-push-block-artifacts.sh

echo "handoff artifacts refreshed for $(git rev-parse --short HEAD)"
