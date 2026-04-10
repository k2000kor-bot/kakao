#!/bin/bash

echo "🔓 === 루팅폰 카카오톡 데이터 수신 서버 시작 === 🔓"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"

if ! backend_venv_activate "$REPO_ROOT"; then
    echo "⚠️ 가상환경을 찾을 수 없습니다. 전역 Python 사용"
fi

cd "$REPO_ROOT/backend" || exit 1

ROOTED_KAKAO_PORT="${ROOTED_KAKAO_PORT:-8005}"
export ROOTED_KAKAO_PORT

echo "🔓 루팅폰 카카오톡 데이터 수신 서버 시작 중..."
echo "💡 CORBU 메인 웹·대화 API는 별도로 npm run restart:backend (포트 5002)"
echo "📱 루팅 수신 전용 포트: ${ROOTED_KAKAO_PORT} (ROOTED_KAKAO_PORT)"
echo "📊 API 문서: http://localhost:${ROOTED_KAKAO_PORT}/docs"
echo ""
echo "🔌 루팅폰 앱에서 다음 주소로 데이터를 전송하세요:"
echo "   http://[YOUR_PC_IP]:${ROOTED_KAKAO_PORT}"
echo ""
echo "⚠️ 서버 중지: Ctrl+C"
echo ""

python3 rooted_kakao_extractor.py
