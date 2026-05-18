#!/usr/bin/env bash
# 스냅샷 생성. 절차: docs/PUSH_BLOCK_HANDOFF.md · 검증·회귀: TESTING_GUIDE.md · npm run test:sidebar-context
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_PATH="${PROJECT_ROOT}/docs/PUSH_BLOCK_MANIFEST.md"

BUNDLE_PATH="/Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-05-19.bundle"
PATCH_PATH="/Users/a0/kakao-frontend/0001-feat-chat-composer-multi-request-pipeline-and-conver.patch"
PATCH_PATH_2="/Users/a0/kakao-frontend/0002-feat-backend-conversation-graph-API-and-pytest-for-C.patch"

branch="$(git -C "${PROJECT_ROOT}" rev-parse --abbrev-ref HEAD)"
latest_commit="$(git -C "${PROJECT_ROOT}" log -1 --oneline)"
generated_at="$(date '+%Y-%m-%d %H:%M:%S %Z')"

bundle_exists="no"
bundle_sha="N/A"
bundle_size="N/A"
if [[ -f "${BUNDLE_PATH}" ]]; then
  bundle_exists="yes"
  bundle_sha="$(shasum -a 256 "${BUNDLE_PATH}" | awk '{print $1}')"
  bundle_size="$(stat -f%z "${BUNDLE_PATH}")"
fi

patch_exists="no"
patch_sha="N/A"
patch_size="N/A"
if [[ -f "${PATCH_PATH}" ]]; then
  patch_exists="yes"
  patch_sha="$(shasum -a 256 "${PATCH_PATH}" | awk '{print $1}')"
  patch_size="$(stat -f%z "${PATCH_PATH}")"
fi

patch_2_exists="no"
patch_2_sha="N/A"
patch_2_size="N/A"
if [[ -f "${PATCH_PATH_2}" ]]; then
  patch_2_exists="yes"
  patch_2_sha="$(shasum -a 256 "${PATCH_PATH_2}" | awk '{print $1}')"
  patch_2_size="$(stat -f%z "${PATCH_PATH_2}")"
fi

recent_commits="$(git -C "${PROJECT_ROOT}" log -5 --oneline)"

cat > "${OUTPUT_PATH}" <<EOF_REPORT
## Push Block Manifest

- generated_at: ${generated_at}
- branch: \`${branch}\`
- latest_commit: \`${latest_commit}\`

### Artifacts

- bundle_path: \`${BUNDLE_PATH}\`
- bundle_exists: ${bundle_exists}
- bundle_size_bytes: ${bundle_size}
- bundle_sha256: \`${bundle_sha}\`

- patch_path: \`${PATCH_PATH}\`
- patch_exists: ${patch_exists}
- patch_size_bytes: ${patch_size}
- patch_sha256: \`${patch_sha}\`

- patch_path_2: \`${PATCH_PATH_2}\`
- patch_2_exists: ${patch_2_exists}
- patch_2_size_bytes: ${patch_2_size}
- patch_2_sha256: \`${patch_2_sha}\`

### Recent Commits

\`\`\`
${recent_commits}
\`\`\`
EOF_REPORT

echo "manifest generated: ${OUTPUT_PATH}"
