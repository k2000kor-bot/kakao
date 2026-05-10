#!/usr/bin/env bash
# 원격 push 진단: docs/PUSH_BLOCK_HANDOFF.md · 마무리 검증 표: TESTING_GUIDE.md · 회귀: npm run test:sidebar-context
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

ORIGIN_URL="$(git config --get remote.origin.url || true)"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [[ -z "${ORIGIN_URL}" ]]; then
  echo "origin remote is not configured" >&2
  exit 1
fi

echo "branch: ${CURRENT_BRANCH}"
echo "origin: ${ORIGIN_URL}"
echo

echo "[1/3] SSH auth check"
SSH_OUTPUT="$(ssh -T git@github.com 2>&1 || true)"
echo "${SSH_OUTPUT}"
echo

echo "[2/3] Remote repository visibility check"
LS_REMOTE_OUTPUT="$(git ls-remote "${ORIGIN_URL}" 2>&1 || true)"
if [[ -z "${LS_REMOTE_OUTPUT}" ]]; then
  echo "remote is reachable"
else
  echo "${LS_REMOTE_OUTPUT}"
fi
echo

if [[ "${LS_REMOTE_OUTPUT}" == *"Repository not found"* ]]; then
  echo "diagnosis: repository path is wrong or account has no access."
  echo "action: confirm owner/repo URL and collaborator write permission."
  exit 2
fi

if [[ "${LS_REMOTE_OUTPUT}" == *"Permission denied"* ]]; then
  echo "diagnosis: SSH key is valid, but repository write/read permission is missing."
  echo "action: grant repository access to the authenticated account."
  exit 2
fi

echo "[3/3] Push retry"
git push -u origin HEAD
