#!/usr/bin/env bash
# 저장소 루트 기준 가상환경 activate (레거시 레이아웃 포함)
# 우선순위: backend/venv → backend/.venv → 루트 venv → 루트 .venv
#
# 사용 예 (deploy 스크립트에서):
#   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
#   REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"   # scripts/deploy/*.sh 기준
#   # shellcheck source=../lib-activate-backend-venv.sh
#   source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
#   backend_venv_activate "$REPO_ROOT" || { echo "가상환경 없음"; exit 1; }

backend_venv_activate() {
  local root="${1:-}"
  if [ -z "$root" ]; then
    echo "backend_venv_activate: 저장소 루트 경로가 필요합니다." >&2
    return 1
  fi
  local act
  for act in \
    "$root/backend/venv/bin/activate" \
    "$root/backend/.venv/bin/activate" \
    "$root/venv/bin/activate" \
    "$root/.venv/bin/activate"; do
    if [ -f "$act" ]; then
      # shellcheck disable=SC1090
      source "$act"
      echo "[venv] 활성화: $act"
      return 0
    fi
  done
  return 1
}
