#!/bin/bash

echo "🚀 고급 NLP 엔진 설치 스크립트 시작"
echo "=================================="

# Python 가상환경 확인
if [ ! -d "venv" ]; then
    echo "📦 Python 가상환경 생성 중..."
    python3 -m venv venv
fi

# 가상환경 활성화
echo "🔧 가상환경 활성화..."
source venv/bin/activate

# 기본 패키지 업그레이드
echo "📦 기본 패키지 업그레이드..."
pip install --upgrade pip setuptools wheel

# PyTorch 설치 (GPU 지원)
echo "🔥 PyTorch 설치 중 (GPU 지원)..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Transformers 설치
echo "🤖 Transformers 설치 중..."
pip install transformers

# Sentence Transformers 설치
echo "📝 Sentence Transformers 설치 중..."
pip install sentence-transformers

# Spacy 설치
echo "🔍 Spacy 설치 중..."
pip install spacy

# 한국어 Spacy 모델 다운로드
echo "🇰🇷 한국어 Spacy 모델 다운로드 중..."
python -m spacy download ko_core_news_sm

# 영어 Spacy 모델 다운로드 (백업용)
echo "🇺🇸 영어 Spacy 모델 다운로드 중..."
python -m spacy download en_core_web_sm

# NLTK 설치
echo "📚 NLTK 설치 중..."
pip install nltk

# TextBlob 설치
echo "📖 TextBlob 설치 중..."
pip install textblob

# Scikit-learn 설치
echo "🔬 Scikit-learn 설치 중..."
pip install scikit-learn

# NumPy 설치
echo "📊 NumPy 설치 중..."
pip install numpy

# 기존 Flask 패키지들 설치
echo "🌐 Flask 패키지들 설치 중..."
pip install flask flask-cors werkzeug

# Pillow 설치 (이미지 처리)
echo "🖼️ Pillow 설치 중..."
pip install pillow

# NLTK 데이터 다운로드
echo "📥 NLTK 데이터 다운로드 중..."
python -c "
import nltk
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
nltk.download('maxent_ne_chunker', quiet=True)
nltk.download('words', quiet=True)
print('NLTK 데이터 다운로드 완료')
"

# 설치 확인
echo "✅ 설치 확인 중..."
python -c "
try:
    import torch
    print(f'✅ PyTorch 설치됨 (버전: {torch.__version__})')
    print(f'✅ CUDA 사용 가능: {torch.cuda.is_available()}')
except ImportError:
    print('❌ PyTorch 설치 실패')

try:
    import transformers
    print(f'✅ Transformers 설치됨 (버전: {transformers.__version__})')
except ImportError:
    print('❌ Transformers 설치 실패')

try:
    import sentence_transformers
    print(f'✅ Sentence Transformers 설치됨')
except ImportError:
    print('❌ Sentence Transformers 설치 실패')

try:
    import spacy
    print(f'✅ Spacy 설치됨 (버전: {spacy.__version__})')
except ImportError:
    print('❌ Spacy 설치 실패')

try:
    import nltk
    print(f'✅ NLTK 설치됨 (버전: {nltk.__version__})')
except ImportError:
    print('❌ NLTK 설치 실패')

try:
    from textblob import TextBlob
    print(f'✅ TextBlob 설치됨')
except ImportError:
    print('❌ TextBlob 설치 실패')

try:
    import sklearn
    print(f'✅ Scikit-learn 설치됨 (버전: {sklearn.__version__})')
except ImportError:
    print('❌ Scikit-learn 설치 실패')
"

echo ""
echo "🎉 고급 NLP 엔진 설치 완료!"
echo "=================================="
echo "📋 설치된 주요 컴포넌트:"
echo "  - PyTorch (GPU 지원)"
echo "  - Transformers (BERT, GPT-2)"
echo "  - Sentence Transformers"
echo "  - Spacy (한국어/영어 모델)"
echo "  - NLTK (자연어 처리)"
echo "  - TextBlob (감정 분석)"
echo "  - Scikit-learn (머신러닝)"
echo ""
echo "🚀 이제 고급 NLP 엔진을 사용할 수 있습니다!"
echo "💡 서버를 재시작하여 새로운 기능을 활성화하세요."
