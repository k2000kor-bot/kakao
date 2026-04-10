#!/bin/bash

# 고급 문서 처리 서버 실행 스크립트

echo "🚀 고급 문서 처리 서버를 시작합니다..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
backend_venv_activate "$REPO_ROOT" || true
cd "$REPO_ROOT" || exit 1

# 필요한 패키지 설치 확인
echo "📋 필요한 패키지를 확인합니다..."
python3 -m pip install --break-system-packages fastapi uvicorn pydantic

# 서버 실행
echo "🔧 고급 문서 처리 서버 실행... (단독, 기본 포트는 advanced_document_processor 설정 따름)"
echo "💡 통합 백엔드: npm run restart:backend (5002)"
cd "$REPO_ROOT/backend" || exit 1
python3 advanced_document_processor.py

echo "✅ 고급 문서 처리 서버가 시작되었습니다!"
echo "🌐 서버 주소: http://localhost:8005"
echo "📊 API 문서: http://localhost:8005/docs"
echo "📈 처리 통계: http://localhost:8005/api/v9/stats"
