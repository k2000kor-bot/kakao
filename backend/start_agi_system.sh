#!/bin/bash

# AGI 시스템 시작 스크립트 v1.0
# 통합 AGI 시스템 + API 서버 실행

echo "🚀 AGI 시스템 시작 중..."

BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$BACKEND_DIR/.." && pwd)"
# shellcheck source=../scripts/lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
cd "$BACKEND_DIR" || exit 1

if ! backend_venv_activate "$REPO_ROOT"; then
    echo "❌ 가상환경을 찾을 수 없습니다 (backend/venv 또는 backend/.venv)."
    exit 1
fi
echo "📦 가상환경 활성화됨"

# 필요한 패키지 설치 확인
echo "🔧 패키지 설치 확인..."
pip install -q fastapi uvicorn numpy scikit-learn

# 로그 디렉토리 생성
mkdir -p logs

# 기존 프로세스 종료
echo "🔄 기존 프로세스 종료..."
pkill -f "agi_api_server" 2>/dev/null || true
pkill -f "integrated_agi_system" 2>/dev/null || true

# 잠시 대기
sleep 2

# AGI API 서버 시작
echo "🌐 AGI API 서버 시작 (포트 8010)..."
python3 agi_api_server.py > logs/agi_api_server.log 2>&1 &
AGI_API_PID=$!

# 서버 시작 대기
echo "⏳ 서버 시작 대기 중..."
sleep 5

# 서버 상태 확인
if curl -s http://localhost:8010/health > /dev/null 2>&1; then
    echo "✅ AGI API 서버가 성공적으로 시작되었습니다!"
    echo "📊 서버 정보:"
    echo "   - URL: http://localhost:8010"
    echo "   - API 문서: http://localhost:8010/docs"
    echo "   - 헬스 체크: http://localhost:8010/health"
    echo "   - 대화 API: http://localhost:8010/api/v1/conversation"
    echo "   - 분석 API: http://localhost:8010/api/v1/analytics"
    echo ""
    echo "🎯 AGI 시스템 기능:"
    echo "   - AGI 수준 지능 (추론, 학습, 창의성, 적응)"
    echo "   - 자율 학습 시스템 (스스로 학습 목표 설정)"
    echo "   - 예측적 대화 (대화 흐름 예측, 선제적 응답)"
    echo "   - 멀티모달 AI (텍스트+이미지+음성 통합)"
    echo ""
    echo "📝 사용 예시:"
    echo "curl -X POST http://localhost:8010/api/v1/conversation \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"user_message\": \"오늘 힘들었어\", \"creativity_level\": 0.7}'"
    echo ""
    echo "🔄 시스템을 중지하려면: ./stop_agi_system.sh"
    echo "📋 로그 확인: tail -f logs/agi_api_server.log"
else
    echo "❌ AGI API 서버 시작 실패"
    echo "📋 로그 확인: cat logs/agi_api_server.log"
    exit 1
fi

# PID 저장
echo $AGI_API_PID > .agi_api_pid

echo ""
echo "🎉 AGI 시스템이 완전히 시작되었습니다!"
echo "실시간 카카오톡 대화 대응 시스템이 준비되었습니다." 