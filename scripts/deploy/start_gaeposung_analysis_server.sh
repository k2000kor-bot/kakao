#!/bin/bash

# 개포우성 분석 서버 시작 스크립트

echo "🏢 개포우성 재개발 프로젝트 분석 서버를 시작합니다..."

# 필요한 디렉토리 생성
mkdir -p backend/uploads/gaeposung
mkdir -p backend/logs

# Python 가상환경 활성화 (있는 경우)
if [ -d "venv" ]; then
    echo "📦 가상환경을 활성화합니다..."
    source venv/bin/activate
fi

# 필요한 Python 패키지 설치
echo "📦 필요한 패키지를 설치합니다..."
pip install flask flask-cors werkzeug pillow

# 백엔드 디렉토리로 이동
cd backend

# 분석 시스템 초기화
echo "🔧 분석 시스템을 초기화합니다..."
python -c "
from gaeposung_advanced_analysis_system import GaepoSungAdvancedAnalysisSystem
system = GaepoSungAdvancedAnalysisSystem()
print('✅ 분석 시스템 초기화 완료')
"

# API 서버 시작
echo "🚀 API 서버를 시작합니다..."
echo "📍 서버 주소: http://localhost:5001"
echo "📋 API 엔드포인트:"
echo "  - GET  /api/health : 헬스 체크"
echo "  - POST /api/files/upload : 파일 업로드"
echo "  - GET  /api/files : 파일 목록 조회"
echo "  - POST /api/analysis/comprehensive : 종합 분석 시작"
echo "  - GET  /api/analysis/results : 분석 결과 조회"
echo "  - GET  /api/analysis/status : 분석 상태 조회"
echo "  - POST /api/analysis/quick : 빠른 분석"
echo "  - POST /api/project/context : 프로젝트 컨텍스트 설정"
echo ""
echo "🛑 서버를 중지하려면 Ctrl+C를 누르세요"
echo ""

python gaeposung_analysis_api.py
