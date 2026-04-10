#!/bin/bash
# 통합 백엔드(main_server) 기동 — 기본 포트 5002 (프론트 src/config/api.ts 와 동일)
# 과거: 8001/8002/8003 다중 프로세스. 현재는 단일 uvicorn 만 사용합니다.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
exec "$REPO_ROOT/scripts/restart-backend.sh"
