#!/bin/bash

# 실시간 카카오톡 대화 대응 시스템 시작 스크립트
# 모든 AGI 기능과 실제 카카오톡 데이터를 통합한 완전한 시스템
# 💡 일반 CORBU 통합 API: npm run restart:backend (5002). 본 스크립트는 main_kakao_system.py (기본 8004) 전용.

echo "실시간 카카오톡 대화 대응 시스템 시작 중..."

BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$BACKEND_DIR/.." && pwd)"
# shellcheck source=../scripts/lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
cd "$REPO_ROOT" || exit 1
if backend_venv_activate "$REPO_ROOT"; then
    echo "가상환경 활성화 중... 완료"
else
    echo "가상환경이 없습니다. 시스템 Python을 사용합니다."
fi
cd "$BACKEND_DIR" || exit 1

# 필요한 패키지 설치 확인
echo "필요한 패키지 확인 중..."
pip install fastapi uvicorn pydantic

# 기존 프로세스 종료
echo "기존 프로세스 종료 중..."
pkill -f "main_kakao_system.py" 2>/dev/null || true
pkill -f "uvicorn.*8004" 2>/dev/null || true

# 포트 확인
if lsof -Pi :8004 -sTCP:LISTEN -t >/dev/null ; then
    echo "포트 8004가 사용 중입니다. 기존 프로세스를 종료합니다."
    lsof -ti:8004 | xargs kill -9 2>/dev/null || true
fi

# 실제 카카오톡 데이터 분석 실행
echo "실제 카카오톡 데이터 분석 중..."
python3 real_kakao_conversation_analyzer.py

# 메인 시스템 시작
echo "실시간 카카오톡 대화 대응 시스템 시작 중..."
python3 main_kakao_system.py &

# 서버 시작 대기
sleep 3

# 헬스 체크
echo "시스템 헬스 체크 중..."
if curl -s http://localhost:8004/health > /dev/null; then
    echo "✅ 실시간 카카오톡 대화 대응 시스템이 성공적으로 시작되었습니다!"
    echo ""
    echo "🌐 서버 정보:"
    echo "   - URL: http://localhost:8004"
    echo "   - API 문서: http://localhost:8004/docs"
    echo "   - 상태 확인: http://localhost:8004/health"
    echo ""
    echo "📡 API 엔드포인트:"
    echo "   - 대화 처리: POST /api/v1/conversation"
    echo "   - 분석 결과: GET /api/v1/analytics"
    echo "   - 시스템 상태: GET /api/v1/status"
    echo "   - 시스템 테스트: POST /api/v1/test"
    echo "   - 기능 확인: GET /api/v1/capabilities"
    echo ""
    echo "🧪 테스트 예시:"
    echo "   curl -X POST http://localhost:8004/api/v1/conversation \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"user_message\": \"안녕하세요!\"}'"
    echo ""
    echo "📊 시스템 기능:"
    echo "   ✅ AGI 수준 지능"
    echo "   ✅ 멀티모달 AI 기능"
    echo "   ✅ 자율 학습 시스템"
    echo "   ✅ 예측적 대화 기능"
    echo "   ✅ 실제 카카오톡 데이터 통합"
    echo "   ✅ 현실적인 대화 스타일"
    echo ""
    echo "🔄 시스템이 백그라운드에서 실행 중입니다."
    echo "   종료하려면: ./stop_main_kakao_system.sh"
else
    echo "❌ 시스템 시작에 실패했습니다."
    echo "로그를 확인해주세요."
fi 