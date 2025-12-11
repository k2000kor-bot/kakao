# 🚀 시작하기

**CORBU AI 시스템에 오신 것을 환영합니다!**

이 문서는 시스템을 빠르게 시작하는 방법을 안내합니다.

---

## ⚡ 빠른 시작 (5분)

### 1. 의존성 설치

```bash
# 백엔드
cd backend
pip install -r requirements.txt

# 프론트엔드
cd ..
npm install
```

### 2. 시스템 실행

```bash
# 통합 실행 (권장)
chmod +x start_all.sh
./start_all.sh
```

### 3. 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5001
- **API 문서**: http://localhost:5001/docs

---

## 🤖 LLM 사용하기 (선택사항)

LLM을 사용하려면 환경 변수를 설정하세요:

```bash
# OpenAI 사용
export OPENAI_API_KEY="sk-..."
export LLM_PROVIDER="openai"
export LLM_MODEL="gpt-3.5-turbo"

# 또는 Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
export LLM_PROVIDER="anthropic"

# 또는 Ollama (로컬)
export OLLAMA_BASE_URL="http://localhost:11434"
export LLM_PROVIDER="ollama"
export LLM_MODEL="llama2"
```

**참고**: LLM API 키를 설정하지 않아도 기본 모드로 작동합니다!

---

## 📚 더 알아보기

### 기본 가이드
- [README.md](./README.md) - 프로젝트 개요
- [COMPLETE_SETUP.md](./COMPLETE_SETUP.md) - 완전한 설정 가이드
- [RUN_GUIDE.md](./RUN_GUIDE.md) - 빠른 실행 가이드

### LLM 가이드
- [README_LLM.md](./README_LLM.md) - LLM 빠른 시작
- [backend/LLM_SETUP_GUIDE.md](./backend/LLM_SETUP_GUIDE.md) - 상세 설정

### 개발 가이드
- [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) - 개발 로드맵
- [COMPLETE_SYSTEM_SUMMARY.md](./COMPLETE_SYSTEM_SUMMARY.md) - 시스템 요약

---

## 🧪 테스트

```bash
# 통합 테스트
./test_integration.sh

# LLM 테스트
./test_llm.sh
```

---

## 🆘 문제 해결

### 백엔드가 시작되지 않는 경우

1. 포트 확인: `lsof -i :5001`
2. Python 버전 확인: `python --version` (3.8+ 필요)
3. 의존성 확인: `pip list | grep fastapi`

### 프론트엔드가 시작되지 않는 경우

1. 포트 확인: `lsof -i :3000`
2. Node.js 버전 확인: `node --version` (18+ 필요)
3. 의존성 확인: `npm list react`

### LLM이 작동하지 않는 경우

1. 환경 변수 확인: `echo $OPENAI_API_KEY`
2. 의존성 확인: `pip list | grep openai`
3. [LLM 설정 가이드](./backend/LLM_SETUP_GUIDE.md) 참조

---

## ✅ 체크리스트

시작하기 전 확인:

- [ ] Python 3.8+ 설치됨
- [ ] Node.js 18+ 설치됨
- [ ] 백엔드 의존성 설치됨
- [ ] 프론트엔드 의존성 설치됨
- [ ] 포트 3000, 5001 사용 가능
- [ ] (선택) LLM API 키 설정됨

---

## 🎉 준비 완료!

모든 준비가 끝났습니다. 이제 시스템을 실행하고 사용할 수 있습니다!

**시작하기**: `./start_all.sh`

---

**행운을 빕니다! 🚀**

