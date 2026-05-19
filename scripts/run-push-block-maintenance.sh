#!/usr/bin/env bash
# 인수인계·절차: docs/PUSH_BLOCK_HANDOFF.md · 검증 표: TESTING_GUIDE.md · 회귀: npm run test:sidebar-context (로컬 워크플로에 포함)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

if [[ "${HANDOFF_REFRESH:-0}" == "1" ]]; then
  echo "[0/4] refresh handoff bundle + patch series"
  bash scripts/refresh-handoff-artifacts.sh
fi

echo "[1/4] artifact integrity check"
bash scripts/verify-push-block-artifacts.sh || {
  echo "hint: HANDOFF_REFRESH=1 npm run maintain:push-block" >&2
  exit 1
}

echo
echo "[2/4] local regression workflow"
bash scripts/run-push-block-local-workflow.sh

echo
echo "[3/4] push diagnostics"
bash scripts/retry-push-with-diagnostics.sh || true

echo
echo "[4/4] status + manifest snapshot"
bash scripts/generate-push-block-status-report.sh
bash scripts/generate-push-block-manifest.sh

echo
echo "push-block maintenance completed"
