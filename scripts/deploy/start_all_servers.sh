#!/bin/bash
# 과거: 8001–8011 다중 Python 서버 동시 기동.
# 현재: 통합 FastAPI main_server 한 개만 기동 (프론트·문서와 포트 5002 정합).

echo "🚀 통합 백엔드 시작 (main_server)"
echo "=================================="
echo "💡 레거시 멀티 서버는 이 스크립트에서 더 이상 띄우지 않습니다."
echo "   필요 시 개별 .py 는 backend/ 에서 수동 실행하세요."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 오래된 개발 프로세스 정리 (선택)
pkill -f "python.*message_generation_server.py" 2>/dev/null || true
pkill -f "python.*sync_server.py" 2>/dev/null || true
pkill -f "python.*chat_analysis_server.py" 2>/dev/null || true
pkill -f "python.*simulation_server.py" 2>/dev/null || true
pkill -f "python.*media_management_server.py" 2>/dev/null || true
pkill -f "python.*response_generation_server.py" 2>/dev/null || true
pkill -f "python.*context_analysis_server.py" 2>/dev/null || true
pkill -f "python.*strategy_optimization_server.py" 2>/dev/null || true
pkill -f "python.*advanced_message_generation_server.py" 2>/dev/null || true

exec "$REPO_ROOT/scripts/restart-backend.sh"
