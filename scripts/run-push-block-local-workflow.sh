#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# 1) 전달 아티팩트(bundle/patch) 무결성 확인
bash scripts/verify-push-block-artifacts.sh

# 2) 사이드바 컨텍스트 회귀 테스트 실행
bash scripts/test-sidebar-context.sh

echo "local push-block workflow completed"
