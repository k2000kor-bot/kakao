# LLM 연동 설정 가이드

## 📋 개요

CORBU.AI는 여러 LLM 제공자를 지원합니다:

- **OpenAI** (GPT-3.5, GPT-4 등)
- **Anthropic** (Claude 3.5 Sonnet)
- **Ollama** (로컬 LLM)

## 🚀 빠른 시작

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하거나 환경 변수를 설정합니다:

```bash
# OpenAI 사용
export OPENAI_API_KEY="sk-..."
export LLM_PROVIDER="openai"
export LLM_MODEL="gpt-3.5-turbo"

# 또는 Anthropic 사용
export ANTHROPIC_API_KEY="sk-ant-..."
export LLM_PROVIDER="anthropic"
export LLM_MODEL="claude-3-5-sonnet-20241022"

# 또는 로컬 Ollama 사용
export OLLAMA_BASE_URL="http://localhost:11434"
export LLM_PROVIDER="ollama"
export LLM_MODEL="llama2"  # 또는 다른 모델
```

### 2. 의존성 설치

```bash
cd backend
pip install openai anthropic aiohttp
```

또는 requirements.txt에서 설치:

```bash
pip install -r requirements.txt
```

### 3. 서버 재시작

```bash
python app.py
```

## 📝 상세 설정

### OpenAI 설정

1. [OpenAI Platform](https://platform.openai.com/)에서 API 키 발급
2. 환경 변수 설정:

   ```bash
   export OPENAI_API_KEY="sk-your-api-key"
   export LLM_PROVIDER="openai"
   export LLM_MODEL="gpt-3.5-turbo"  # 또는 "gpt-4"
   ```

### Anthropic 설정

1. [Anthropic Console](https://console.anthropic.com/)에서 API 키 발급
2. 환경 변수 설정:

   ```bash
   export ANTHROPIC_API_KEY="sk-ant-your-api-key"
   export LLM_PROVIDER="anthropic"
   export LLM_MODEL="claude-3-5-sonnet-20241022"
   ```

### Ollama 설정 (로컬)

1. [Ollama 설치](https://ollama.ai/)
2. 모델 다운로드:

   ```bash
   ollama pull llama2
   # 또는
   ollama pull mistral
   ```

3. 환경 변수 설정:

   ```bash
   export OLLAMA_BASE_URL="http://localhost:11434"
   export LLM_PROVIDER="ollama"
   export LLM_MODEL="llama2"  # 다운로드한 모델 이름
   ```

## 🔧 기본 모드 (LLM 없이)

LLM API 키를 설정하지 않으면 기본 모드로 작동합니다:

- 규칙 기반 응답 생성
- 기본 지식 베이스 활용
- 제한된 기능

## 📚 지식 베이스 커스터마이징

`backend/knowledge_base.json` 파일을 수정하여 기본 지식을 추가할 수 있습니다:

```json
{
  "system_info": {
    "name": "CORBU.AI",
    "version": "1.0.0"
  },
  "capabilities": [
    "자연어 대화",
    "질문 답변"
  ],
  "knowledge_topics": {
    "custom_topic": {
      "description": "사용자 정의 주제",
      "examples": ["예시1", "예시2"]
    }
  }
}
```

## 🧪 테스트

### API 테스트

```bash
curl -X POST http://localhost:5002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "안녕하세요",
    "quality": "enhanced",
    "conversation_id": "test-123"
  }'
```

### 프론트엔드 테스트

1. 브라우저에서 <http://localhost:3000> 접속
2. 메시지 전송
3. LLM 응답 확인

## 🐛 문제 해결

### "LLM 서비스를 사용할 수 없습니다" 오류

1. 환경 변수 확인:

   ```bash
   echo $OPENAI_API_KEY
   ```

2. 의존성 설치 확인:

   ```bash
   pip list | grep openai
   ```

3. 서버 재시작

### API 키 오류

1. API 키가 올바른지 확인
2. API 키에 충분한 크레딧이 있는지 확인
3. API 키 권한 확인

### Ollama 연결 오류

1. Ollama가 실행 중인지 확인:

   ```bash
   curl http://localhost:11434/api/tags
   ```

2. 모델이 다운로드되었는지 확인:

   ```bash
   ollama list
   ```

## 📊 성능 최적화

### 대화 히스토리 관리

- 최근 10개 대화만 유지 (메모리 절약)
- `conversation_id`를 사용하여 대화 분리

### 모델 선택

- **GPT-3.5-turbo**: 빠르고 저렴
- **GPT-4**: 더 정확하지만 느리고 비쌈
- **Claude 3.5 Sonnet**: 균형잡힌 성능
- **Ollama (로컬)**: 무료이지만 하드웨어 요구사항 높음

## 🔒 보안

- API 키는 환경 변수로만 관리
- `.env` 파일을 `.gitignore`에 추가
- 프로덕션에서는 시크릿 관리 시스템 사용

---

**더 많은 정보**: [API 문서](./API_DOCUMENTATION.md)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

