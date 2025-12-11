# 빠른 시작 가이드

**CORBU AI 시스템을 5분 안에 시작하기**

---

## 🚀 1단계: 의존성 설치

### 백엔드
```bash
cd backend
pip install -r requirements.txt
```

### 프론트엔드
```bash
npm install
```

---

## 🎯 2단계: 시스템 실행

### 방법 1: 통합 실행 (권장)
```bash
./start_all.sh
```

### 방법 2: 개별 실행

**터미널 1 - 백엔드**:
```bash
cd backend
./start.sh
```

**터미널 2 - 프론트엔드**:
```bash
npm start
```

---

## 🌐 3단계: 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5001
- **API 문서**: http://localhost:5001/docs

---

## ⚙️ 4단계: LLM 설정 (선택사항)

### 노트북 LLM (로컬)
```bash
# Ollama 설치 및 실행
ollama serve

# 모델 다운로드 (새 터미널)
ollama pull llama3.1:8b
```

환경 변수:
```bash
export LLM_PROVIDER="notebook"
export OLLAMA_BASE_URL="http://localhost:11434"
```

### OpenAI
```bash
export OPENAI_API_KEY="sk-..."
export LLM_PROVIDER="openai"
```

### Anthropic
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export LLM_PROVIDER="anthropic"
```

---

## ✨ 최신 기능: 긴 글 자동 생성 🆕

질문이나 요구를 입력하면 자동으로 상세한 긴 글이 생성됩니다!

**예시**:
- "인공지능에 대해 글 작성해줘"
- "Python이란 무엇인가요?"
- "기후변화에 대해 상세하게 설명해줘"

---

## ✅ 완료!

이제 시스템을 사용할 수 있습니다!

**다음 단계**:
- [사용 가이드](./USAGE_GUIDE.md) 읽기
- [LLM 설정 가이드](./backend/LLM_SETUP_GUIDE.md) 읽기
- [완전한 설정 가이드](./COMPLETE_SETUP.md) 읽기

---

**문제가 있나요?** [문제 해결 가이드](./USAGE_GUIDE.md#-문제-해결)를 확인하세요.

