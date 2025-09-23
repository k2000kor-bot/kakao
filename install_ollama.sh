#!/bin/bash

# Ollama 설치 및 설정 스크립트 - 완전 자동화
# CORBU.AI 노트북 LLM 통합을 위한 Ollama 설치

echo "🚀 CORBU.AI 노트북 LLM 통합을 위한 Ollama 설치를 시작합니다..."

# 시스템 정보 확인
echo "📊 시스템 정보:"
echo "OS: $(uname -s)"
echo "Architecture: $(uname -m)"
echo ""

# Ollama 설치 확인
if command -v ollama &> /dev/null; then
    echo "✅ Ollama가 이미 설치되어 있습니다."
    echo "현재 버전: $(ollama --version)"
else
    echo "📥 Ollama 설치 중..."
    
    # macOS에서 Ollama 설치
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "📱 macOS에서 Ollama 설치 중..."
        
        # Homebrew 설치 확인
        if ! command -v brew &> /dev/null; then
            echo "🍺 Homebrew 설치 중..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        
        # Ollama 설치
        echo "🤖 Ollama 설치 중..."
        brew install ollama
        
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "🐧 Linux에서 Ollama 설치 중..."
        curl -fsSL https://ollama.ai/install.sh | sh
        
    else
        echo "❌ 지원되지 않는 운영체제: $OSTYPE"
        echo "수동으로 Ollama를 설치해주세요: https://ollama.ai"
        exit 1
    fi
    
    echo "✅ Ollama 설치 완료!"
fi

echo ""
echo "🔄 Ollama 서비스 시작 중..."

# Ollama 서비스 시작 (백그라운드)
if pgrep -f "ollama serve" > /dev/null; then
    echo "✅ Ollama 서비스가 이미 실행 중입니다."
else
    echo "🚀 Ollama 서비스를 시작합니다..."
    nohup ollama serve > ollama.log 2>&1 &
    sleep 5
    echo "✅ Ollama 서비스가 시작되었습니다."
fi

echo ""
echo "📦 권장 모델 다운로드 중..."

# 권장 모델들 다운로드 (병렬 처리)
models=("llama3.1:8b" "qwen2.5:7b" "gemma2:9b" "polyglot-ko:5.8b")

# 백그라운드에서 모델 다운로드 시작
for model in "${models[@]}"; do
    echo "📥 $model 다운로드 시작..."
    ollama pull "$model" &
done

# 모든 다운로드 완료 대기
echo "⏳ 모델 다운로드 완료 대기 중..."
wait

echo ""
echo "🧪 모델 테스트 중..."

# 모델 테스트
test_prompt="안녕하세요! 간단한 인사말을 해주세요."
echo "테스트 프롬프트: $test_prompt"

for model in "${models[@]}"; do
    echo "🔍 $model 테스트 중..."
    if timeout 30 ollama run "$model" "$test_prompt" > /dev/null 2>&1; then
        echo "✅ $model 테스트 성공"
    else
        echo "❌ $model 테스트 실패 (시간 초과 또는 오류)"
    fi
done

echo ""
echo "📊 Ollama 상태 확인:"
ollama list

echo ""
echo "🌐 서비스 상태 확인:"
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama API가 정상적으로 작동합니다."
    echo "📍 API 엔드포인트: http://localhost:11434"
    
    # API 응답 예시
    echo "📋 사용 가능한 모델 목록:"
    curl -s http://localhost:11434/api/tags | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    models = data.get('models', [])
    for model in models:
        name = model.get('name', 'Unknown')
        size = model.get('size', 0)
        size_gb = size / (1024**3) if size > 0 else 0
        print(f'  - {name} ({size_gb:.1f}GB)')
except:
    print('  모델 정보를 가져올 수 없습니다.')
"
else
    echo "❌ Ollama API에 연결할 수 없습니다."
    echo "다시 시도해보세요: ollama serve"
fi

echo ""
echo "🎉 Ollama 설정이 완료되었습니다!"
echo ""
echo "📋 다음 단계:"
echo "1. CORBU.AI 서버를 재시작하세요"
echo "2. 웹 인터페이스에서 '노트북 LLM 사용' 옵션을 활성화하세요"
echo "3. 다양한 처리 모드를 테스트해보세요"
echo ""
echo "🔧 유용한 명령어:"
echo "- ollama list: 설치된 모델 목록"
echo "- ollama ps: 실행 중인 모델 목록"
echo "- ollama stop <model>: 모델 중지"
echo "- ollama serve: 서비스 시작"
echo "- ollama logs: 서비스 로그 확인"
echo ""
echo "📚 자세한 정보는 NOTEBOOK_LLM_INTEGRATION_GUIDE.md를 참조하세요."
echo ""
echo "🌐 CORBU.AI 웹 인터페이스: http://localhost:8080"