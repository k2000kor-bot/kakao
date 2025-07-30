#!/bin/bash

echo "🌟 초고도화 메시지 생성 시스템 v8.0 시작 🌟"
echo "========================================"

# 현재 디렉토리 확인
if [ ! -f "ultra_advanced_message_system.py" ]; then
    echo "❌ ultra_advanced_message_system.py 파일을 찾을 수 없습니다."
    echo "backend 디렉토리에서 실행해주세요."
    exit 1
fi

# 가상환경 활성화
if [ -d "../.venv" ]; then
    echo "🔧 가상환경 활성화 중..."
    source ../.venv/bin/activate
else
    echo "⚠️  가상환경을 찾을 수 없습니다. 시스템 Python을 사용합니다."
fi

# 필요한 패키지 설치 확인
echo "📦 의존성 패키지 확인 중..."
python -c "
import sys
required_packages = [
    'torch', 'transformers', 'opencv-python', 
    'librosa', 'speech_recognition', 'gtts', 
    'pillow', 'cryptography', 'numpy', 'fastapi', 'uvicorn'
]

missing_packages = []
for package in required_packages:
    try:
        __import__(package.replace('-', '_'))
    except ImportError:
        missing_packages.append(package)

if missing_packages:
    print(f'❌ 누락된 패키지: {missing_packages}')
    print('다음 명령어로 설치해주세요:')
    print(f'pip install {\" \".join(missing_packages)}')
    sys.exit(1)
else:
    print('✅ 모든 필수 패키지가 설치되어 있습니다.')
"

if [ $? -ne 0 ]; then
    echo "❌ 패키지 확인 실패"
    exit 1
fi

# 임시 디렉토리 생성
echo "📁 임시 디렉토리 생성 중..."
mkdir -p temp_uploads

# 기존 서버 프로세스 확인 및 종료
echo "🔍 기존 서버 프로세스 확인 중..."
if pgrep -f "quantum_neural_message_api" > /dev/null; then
    echo "⚠️  기존 서버 프로세스를 종료합니다..."
    pkill -f "quantum_neural_message_api"
    sleep 2
fi

if pgrep -f "uvicorn.*8010" > /dev/null; then
    echo "⚠️  포트 8010을 사용 중인 프로세스를 종료합니다..."
    pkill -f "uvicorn.*8010"
    sleep 2
fi

# 환경 변수 설정
echo "🔧 환경 변수 설정 중..."
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
export OPENAI_API_KEY="${OPENAI_API_KEY:-test-key}"

# 서버 시작
echo ""
echo "🚀 양자-신경망 메시지 생성 API 서버 시작 중..."
echo "   - 포트: 8010"
echo "   - 멀티모달 AI 처리 활성화"
echo "   - 양자 보안 시스템 활성화"
echo "   - 실시간 감정 분석 활성화"
echo "   - 신경망 기반 개인화 활성화"
echo ""

# 백그라운드에서 API 서버 실행
nohup python quantum_neural_message_api.py > ../logs/ultra_message_system.log 2>&1 &
SERVER_PID=$!

# 서버 시작 대기
echo "⏳ 서버 시작을 기다리는 중..."
sleep 5

# 서버 상태 확인
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ 양자-신경망 메시지 생성 API 서버가 성공적으로 시작되었습니다!"
    echo ""
    echo "📡 API 엔드포인트:"
    echo "   • 메시지 생성: POST http://localhost:8010/api/v8/ultra-generate"
    echo "   • 배치 생성: POST http://localhost:8010/api/v8/batch-generate"
    echo "   • 실시간 분석: POST http://localhost:8010/api/v8/analyze"
    echo "   • 개인화 프로필: GET http://localhost:8010/api/v8/personality/{user_id}"
    echo "   • 이미지 분석: POST http://localhost:8010/api/v8/upload/image"
    echo "   • 음성 분석: POST http://localhost:8010/api/v8/upload/audio"
    echo "   • 시스템 통계: GET http://localhost:8010/api/v8/stats"
    echo "   • 상태 확인: GET http://localhost:8010/api/v8/health"
    echo "   • 스트리밍: POST http://localhost:8010/api/v8/stream/generate"
    echo ""
    echo "🔗 API 문서: http://localhost:8010/docs"
    echo "🔍 로그 확인: tail -f ../logs/ultra_message_system.log"
    echo ""
    echo "🌟 초고도화 기능:"
    echo "   ✓ 멀티모달 AI 처리 (텍스트+이미지+음성)"
    echo "   ✓ 양자 보안 시스템"
    echo "   ✓ 실시간 감정 분석"
    echo "   ✓ 신경망 기반 개인화"
    echo "   ✓ 예측적 대화 모델링"
    echo "   ✓ 크로스모달 인사이트"
    echo "   ✓ AI 앙상블 (GPT-4 + Claude-3.5 + Gemini-Pro)"
    echo ""
    echo "서버 PID: $SERVER_PID"
    
    # 간단한 상태 확인 테스트
    echo "🧪 서버 상태 테스트 중..."
    sleep 2
    
    if curl -s http://localhost:8010/api/v8/health > /dev/null; then
        echo "✅ 서버가 정상적으로 응답하고 있습니다!"
    else
        echo "⚠️  서버가 시작되었지만 응답 확인에 실패했습니다."
        echo "   몇 초 후 다시 시도해보세요."
    fi
    
else
    echo "❌ 서버 시작에 실패했습니다."
    echo "   로그를 확인해주세요: cat ../logs/ultra_message_system.log"
    exit 1
fi

echo ""
echo "🎯 사용 예시:"
echo ""
echo "# 기본 메시지 생성"
echo "curl -X POST \"http://localhost:8010/api/v8/ultra-generate\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"text\": \"안녕하세요! 오늘 기분이 좋네요!\", \"user_id\": \"user001\"}'"
echo ""
echo "# 실시간 감정 분석"
echo "curl -X POST \"http://localhost:8010/api/v8/analyze\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"text\": \"정말 화가 나네요\", \"user_id\": \"user001\", \"analysis_types\": [\"emotion\", \"intent\"]}'"
echo ""
echo "# 시스템 통계 확인"
echo "curl -X GET \"http://localhost:8010/api/v8/stats\""
echo ""
echo "🔥 초고도화 메시지 생성 시스템 v8.0이 준비되었습니다!" 