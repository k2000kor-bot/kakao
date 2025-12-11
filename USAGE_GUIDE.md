# 사용 가이드

**CORBU AI 시스템 사용 방법**

---

## 🚀 빠른 시작

### 1. 시스템 실행

```bash
# 통합 실행 (권장)
./start_all.sh
```

### 2. 브라우저 접속

http://localhost:3000

---

## 📁 프로젝트 사용하기

### 프로젝트 생성

1. 사이드바에서 **"📁 프로젝트"** 버튼 클릭
2. 프로젝트 이름 입력
3. **"생성"** 버튼 클릭

### 프로젝트 선택

- 사이드바의 프로젝트 목록에서 프로젝트 클릭
- 해당 프로젝트의 대화만 표시됨

### 대화 생성

1. 프로젝트 선택 (필수)
2. **"+ 새 대화"** 버튼 클릭
3. 메시지 입력 및 전송

---

## 🤖 LLM 사용하기

### 노트북 LLM (로컬)

**설정**:
```bash
export LLM_PROVIDER="notebook"
export OLLAMA_BASE_URL="http://localhost:11434"
```

**Ollama 실행**:
```bash
# Ollama 서비스 시작
ollama serve

# 모델 다운로드 (새 터미널)
ollama pull llama3.1:8b
ollama pull kullm:12.8b  # 한국어 특화
```

### OpenAI

```bash
export OPENAI_API_KEY="sk-..."
export LLM_PROVIDER="openai"
export LLM_MODEL="gpt-3.5-turbo"
```

### Anthropic

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export LLM_PROVIDER="anthropic"
export LLM_MODEL="claude-3-5-sonnet-20241022"
```

### 폴백 모드

LLM API 키를 설정하지 않으면 기본 모드로 작동합니다.

---

## 💡 주요 기능

### 대화 관리

- **새 대화**: "+ 새 대화" 버튼
- **대화 선택**: 사이드바에서 대화 클릭
- **대화 삭제**: 대화 항목의 X 버튼
- **자동 저장**: 모든 대화는 자동으로 저장됨

### 프로젝트 관리

- **프로젝트 생성**: "📁 프로젝트" 버튼
- **프로젝트 선택**: 프로젝트 목록에서 클릭
- **프로젝트별 대화**: 선택한 프로젝트의 대화만 표시

### 메시지 기능

- **마크다운 지원**: 코드 블록, 링크, 표 등
- **메시지 복사**: 메시지 옆 복사 버튼
- **자동 스크롤**: 새 메시지 시 자동 스크롤
- **긴 글 자동 생성**: 질문이나 요구 시 상세한 글 자동 생성 🆕

---

## ⌨️ 키보드 단축키

- **Enter**: 메시지 전송
- **Shift + Enter**: 줄바꿈
- **Escape**: 모달 닫기

---

## 🐛 문제 해결

### 프로젝트가 생성되지 않는 경우

1. 프로젝트 이름이 비어있지 않은지 확인
2. 브라우저 콘솔 확인 (F12)
3. 로컬 스토리지 확인 (F12 > Application > Local Storage)

### LLM이 작동하지 않는 경우

1. 환경 변수 확인: `echo $LLM_PROVIDER`
2. Ollama 실행 확인: `curl http://localhost:11434/api/tags`
3. 백엔드 로그 확인

### 대화가 저장되지 않는 경우

1. 브라우저 로컬 스토리지 권한 확인
2. 브라우저 개발자 도구에서 오류 확인
3. 브라우저 캐시 삭제 후 재시도

---

## ✍️ 긴 글 생성 기능

질문이나 요구를 입력하면 자동으로 상세한 긴 글이 생성됩니다.

### 사용 예시

- **명시적 요청**: "인공지능에 대해 글 작성해줘"
- **질문 형태**: "Python이란 무엇인가요?"
- **상세 요청**: "기후변화에 대해 상세하게 설명해줘"

### 자동 감지 키워드

- 글, 작성, 생성, 만들어, 에세이, 문서
- 상세하게, 자세히, 길게, 포괄적으로
- 질문, 궁금, 알려줘, 설명해줘

자세한 내용은 [긴 글 생성 기능 가이드](./LONG_FORM_WRITING_FEATURE.md)를 참고하세요.

---

## 📚 더 알아보기

- [빠른 시작](./START_HERE.md)
- [LLM 설정 가이드](./backend/LLM_SETUP_GUIDE.md)
- [프로젝트 및 노트북 LLM 완료 보고서](./PROJECT_AND_NOTEBOOK_LLM_COMPLETE.md)
- [완전한 기능 요약](./COMPLETE_FEATURES_SUMMARY.md)

---

**행운을 빕니다! 🚀**

