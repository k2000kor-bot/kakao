#!/bin/bash

# Python3 설치 스크립트

echo "🐍 Python3 설치를 시작합니다..."

# 현재 Python 상태 확인
echo "📍 현재 Python 상태 확인:"
python3 --version 2>/dev/null || echo "Python3가 설치되지 않았습니다."

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

# 설치 확인
echo "✅ 설치 완료! Python 버전 확인:"
python3 --version

# pip 업그레이드
echo "📦 pip를 최신 버전으로 업그레이드합니다..."
python3 -m pip install --upgrade pip

# 필요한 패키지 설치
echo "📚 필요한 패키지들을 설치합니다..."
python3 -m pip install fastapi uvicorn pydantic

echo "🎉 Python3 설치가 완료되었습니다!"
echo ""
echo "이제 다음 명령어로 시스템을 실행할 수 있습니다:"
echo "python3 ultimate_ai_system.py"
