#!/bin/bash

# 궁극의 AI 시스템 자동 설정 스크립트

echo "🚀 궁극의 AI 시스템 설정을 시작합니다..."
echo ""

# 현재 디렉토리 확인
echo "📍 현재 위치: $(pwd)"
echo ""

# Python3 설치 확인
echo "🐍 Python3 설치 상태 확인..."
if command -v python3 &> /dev/null; then
    echo "✅ Python3가 이미 설치되어 있습니다: $(python3 --version)"
else
    echo "❌ Python3가 설치되지 않았습니다."
    echo "🔧 Python3를 설치합니다..."
    
    # Mac인지 확인
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍎 Mac 환경 감지됨"
        
        # Homebrew 설치 확인
        if ! command -v brew &> /dev/null; then
            echo "🍺 Homebrew를 설치합니다..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            
            # PATH 설정
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        else
            echo "✅ Homebrew가 이미 설치되어 있습니다."
        fi
        
        # Python3 설치
        echo "🐍 Python3를 설치합니다..."
        brew install python3
        
    else
        echo "🪟 Windows/Linux 환경입니다."
        echo "📖 PYTHON_INSTALL.md 파일을 참고하여 수동으로 설치해주세요."
        exit 1
    fi
fi

echo ""

# pip 업그레이드
echo "📦 pip를 최신 버전으로 업그레이드합니다..."
python3 -m pip install --upgrade pip

# 필요한 패키지 설치
echo "📚 필요한 패키지들을 설치합니다..."
python3 -m pip install fastapi uvicorn pydantic

echo ""

# 설치 확인
echo "✅ 설치 확인..."
python3 -c "import fastapi; print('✅ FastAPI 설치됨')" 2>/dev/null || echo "❌ FastAPI 설치 실패"
python3 -c "import uvicorn; print('✅ Uvicorn 설치됨')" 2>/dev/null || echo "❌ Uvicorn 설치 실패"
python3 -c "import pydantic; print('✅ Pydantic 설치됨')" 2>/dev/null || echo "❌ Pydantic 설치 실패"

echo ""

# 시스템 파일 확인
echo "📁 시스템 파일 확인..."
if [ -f "ultimate_ai_system.py" ]; then
    echo "✅ ultimate_ai_system.py 파일 존재"
else
    echo "❌ ultimate_ai_system.py 파일이 없습니다."
    exit 1
fi

echo ""

# 실행 권한 부여
echo "🔧 실행 권한을 설정합니다..."
chmod +x start_system.sh 2>/dev/null || echo "start_system.sh 파일이 없습니다."

echo ""

# 완료 메시지
echo "🎉 설정이 완료되었습니다!"
echo ""
echo "🚀 시스템을 실행하려면:"
echo "   python3 ultimate_ai_system.py"
echo ""
echo "🌐 (레거시 스크립트) 브라우저에서 접속 예시:"
echo "   http://localhost:8000/dashboard"
echo ""
echo "💡 CORBU 통합 웹·API는 보통 http://localhost:3000 + 백엔드 http://localhost:5002"
echo ""
echo "📚 자세한 사용법은 README.md 파일을 참고하세요."
echo ""

# 자동 실행 옵션
read -p "지금 바로 시스템을 실행하시겠습니까? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 궁극의 AI 시스템을 시작합니다..."
    python3 ultimate_ai_system.py
fi
