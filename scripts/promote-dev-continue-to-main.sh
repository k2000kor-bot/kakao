#!/usr/bin/env bash
# dev-continue-2026-01-20 tip을 main에 반영 (PR 없이). 위험 — CONFIRM=1 필요
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
BRANCH="${PUSH_BRANCH:-dev-continue-2026-01-20}"

if [[ "${CONFIRM:-}" != "1" ]]; then
  echo "main을 ${BRANCH} tip으로 맞춥니다 (force-with-lease)."
  echo "PR 대신 직접 반영할 때만: CONFIRM=1 bash scripts/promote-dev-continue-to-main.sh"
  exit 2
fi

git fetch origin
echo "origin/main     $(git rev-parse --short origin/main)"
echo "origin/${BRANCH} $(git rev-parse --short origin/${BRANCH})"
git push origin "${BRANCH}:main" --force-with-lease
echo "OK: main ← ${BRANCH}"
