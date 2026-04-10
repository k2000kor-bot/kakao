#!/bin/bash

# 고급 파일 처리 서버 실행 스크립트

echo "🚀 고급 파일 처리 서버를 시작합니다..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=../lib-activate-backend-venv.sh
source "$REPO_ROOT/scripts/lib-activate-backend-venv.sh"
backend_venv_activate "$REPO_ROOT" || true
cd "$REPO_ROOT" || exit 1

# 필요한 패키지 설치 확인
echo "📋 필요한 패키지를 확인합니다..."
python3 -m pip install --break-system-packages fastapi uvicorn pydantic python-multipart

# 선택적 패키지 설치 (오류 무시)
echo "📋 선택적 패키지들을 설치합니다..."
python3 -m pip install --break-system-packages PyPDF2 python-docx openpyxl python-pptx pillow pytesseract speechrecognition opencv-python easyocr 2>/dev/null || echo "⚠️ 일부 선택적 패키지 설치 실패 (기본 기능은 정상 작동)"

# uploads 디렉토리 생성
echo "📁 업로드 디렉토리를 생성합니다..."
mkdir -p uploads

# 서버 실행
echo "🔧 고급 파일 처리 서버 실행... (단독, 포트는 advanced_file_processor 설정 따름)"
echo "💡 통합 백엔드: npm run restart:backend (5002)"
cd "$REPO_ROOT/backend" || exit 1
python3 advanced_file_processor.py

echo "✅ 고급 파일 처리 서버가 시작되었습니다!"
echo "🌐 서버 주소: http://localhost:8006"
echo "📊 API 문서: http://localhost:8006/docs"
echo "📁 파일 업로드: http://localhost:8006/api/v1/upload-file"
