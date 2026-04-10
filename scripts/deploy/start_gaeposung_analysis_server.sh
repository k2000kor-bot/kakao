#!/bin/bash

# 레거시 Flask 분석 서버 시작 스크립트

echo "🏢 Flask 분석 서버를 시작합니다 (GAEPO_ANALYSIS_PORT)..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
cd "$REPO_ROOT" || exit 1

mkdir -p "$REPO_ROOT/backend/uploads/gaeposung"
mkdir -p "$REPO_ROOT/backend/logs"

backend_venv_activate "$REPO_ROOT" || true

echo "📦 필요한 패키지를 설치합니다..."
pip install flask flask-cors werkzeug pillow

cd "$REPO_ROOT/backend" || exit 1

echo "🔧 분석 시스템을 초기화합니다..."
python3 -c "
from gaeposung_advanced_analysis_system import GaepoSungAdvancedAnalysisSystem
system = GaepoSungAdvancedAnalysisSystem()
print('✅ 분석 시스템 초기화 완료')
" 2>/dev/null || echo "⚠️ 초기화 스킵 또는 모듈 없음"

echo "🚀 API 서버를 시작합니다..."
echo "📍 서버 주소: http://localhost:${GAEPO_ANALYSIS_PORT:-5001} (GAEPO_ANALYSIS_PORT)"
echo "💡 통합 CORBU API는 별도: npm run restart:backend → 5002"
echo "🛑 서버를 중지하려면 Ctrl+C를 누르세요"
echo ""

exec python3 gaeposung_analysis_api.py
