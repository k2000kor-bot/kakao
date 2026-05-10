# 긴 글 생성 기능 구현 상세

**백엔드 구현 상세 문서**

---

## 📋 구현 개요

질문이나 요구를 입력하면 자동으로 상세하고 포괄적인 긴 글을 생성하는 기능을 구현했습니다.

---

## 🔧 구현 세부사항

### 1. 메시지 강화 메서드 (`_enhance_with_knowledge`)

**위치**: `backend/llm_service.py:182`

**기능**:
- 사용자 메시지에서 키워드 감지
- 긴 글 생성 모드 여부 판단
- 프롬프트 자동 강화

**키워드 감지**:
```python
# 긴 글 생성 키워드
long_form_keywords = [
    "글", "작성", "생성", "만들어", "작성해줘", "생성해줘", 
    "만들어줘", "글쓰기", "에세이", "문서", "상세하게", 
    "자세히", "길게", "포괄적으로", "전체적으로"
]

# 질문 키워드
question_keywords = ["?", "질문", "궁금", "알려줘", "설명해줘", "알려주세요"]
```

**반환값**:
- `tuple[str, bool]`: (enhanced_message, is_long_form)

---

### 2. 시스템 프롬프트 (`_get_system_prompt`)

**위치**: `backend/llm_service.py:92`

**파라미터**:
- `is_long_form: bool = False`: 긴 글 생성 모드 여부

**기능**:
- 모드에 따라 다른 지침 제공
- 긴 글 생성 모드: 상세하고 포괄적인 글 작성 지침
- 일반 모드: 간결하고 명확한 답변 지침

---

### 3. LLM 호출 메서드 수정

#### 3.1 OpenAI (`_call_openai`)

**위치**: `backend/llm_service.py:234`

**변경사항**:
- `is_long_form` 파라미터 추가
- `max_tokens` 조정: 긴 글 모드 2000, 일반 모드 1000
- 시스템 프롬프트에 `is_long_form` 전달

```python
async def _call_openai(self, message: str, history: List[Dict], is_long_form: bool = False) -> Dict[str, Any]:
    max_tokens = 2000 if is_long_form else 1000
    messages = [{"role": "system", "content": self._get_system_prompt(is_long_form)}]
    # ...
```

#### 3.2 Anthropic (`_call_anthropic`)

**위치**: `backend/llm_service.py:270`

**변경사항**:
- `is_long_form` 파라미터 추가
- `max_tokens` 조정: 긴 글 모드 2000, 일반 모드 1000
- 시스템 프롬프트에 `is_long_form` 전달

```python
async def _call_anthropic(self, message: str, history: List[Dict], is_long_form: bool = False) -> Dict[str, Any]:
    max_tokens = 2000 if is_long_form else 1000
    system_prompt = self._get_system_prompt(is_long_form)
    # ...
```

#### 3.3 Ollama (`_call_ollama`)

**위치**: `backend/llm_service.py:314`

**변경사항**:
- `is_long_form` 파라미터 추가
- 시스템 프롬프트에 `is_long_form` 전달

```python
async def _call_ollama(self, message: str, history: List[Dict], is_long_form: bool = False) -> Dict[str, Any]:
    prompt = self._get_system_prompt(is_long_form) + "\n\n"
    # ...
```

#### 3.4 노트북 LLM (`_call_notebook_llm`)

**위치**: `backend/llm_service.py:398`

**변경사항**:
- `is_long_form` 파라미터 추가
- 긴 글 생성 모드일 때 시스템 프롬프트 추가

```python
async def _call_notebook_llm(self, message: str, history: List[Dict], context: Optional[Dict], is_long_form: bool = False) -> Dict[str, Any]:
    if is_long_form:
        system_prompt = self._get_system_prompt(is_long_form)
        prompt = f"{system_prompt}\n\n{prompt}"
    # ...
```

---

### 4. 응답 생성 메서드 (`generate_response`)

**위치**: `backend/llm_service.py:121`

**변경사항**:
- `_enhance_with_knowledge`에서 `is_long_form` 플래그 받기
- 모든 LLM 호출 메서드에 `is_long_form` 전달

```python
enhanced_message, is_long_form = self._enhance_with_knowledge(message, context)

if self.provider == "openai":
    response = await self._call_openai(enhanced_message, history, is_long_form)
elif self.provider == "anthropic":
    response = await self._call_anthropic(enhanced_message, history, is_long_form)
# ...
```

---

## 📊 작동 흐름

```
1. 사용자 메시지 입력
   ↓
2. _enhance_with_knowledge 호출
   - 키워드 감지
   - is_long_form 판단
   - 프롬프트 강화
   ↓
3. generate_response에서 is_long_form 받기
   ↓
4. LLM 호출 메서드에 is_long_form 전달
   - 시스템 프롬프트 조정
   - max_tokens 조정
   ↓
5. LLM 응답 생성
   - 긴 글 모드: 상세하고 포괄적인 글
   - 일반 모드: 간결한 답변
   ↓
6. 프론트엔드로 응답 전달
```

---

## 🎯 프롬프트 강화 예시

### 긴 글 생성 키워드 감지 시

**입력**:
```
"인공지능에 대해 글 작성해줘"
```

**강화된 프롬프트**:
```
인공지능에 대해 글 작성해줘

위 요청에 대해 다음을 포함한 상세하고 포괄적인 글을 작성해주세요:
- 서론: 주제 소개 및 배경 설명
- 본론: 핵심 내용을 여러 섹션으로 나누어 상세히 설명
- 결론: 요약 및 마무리
- 구체적인 예시와 사례 포함
- 마크다운 형식 사용 (제목, 소제목, 목록, 강조 등)
최소 500자 이상의 길고 자세한 글을 작성해주세요.
```

### 질문 키워드 감지 시

**입력**:
```
"Python이란 무엇인가요?"
```

**강화된 프롬프트**:
```
Python이란 무엇인가요?

위 질문에 대해 상세하고 포괄적으로 답변해주세요. 다음을 포함해주세요:
- 질문에 대한 명확한 답변
- 배경 설명 및 컨텍스트
- 구체적인 예시와 사례
- 관련 정보 및 추가 설명
- 마크다운 형식 사용
최소 300자 이상의 자세한 답변을 작성해주세요.
```

---

## ⚙️ 설정 값

### 토큰 제한
- **긴 글 생성 모드**: 2000 토큰
- **일반 모드**: 1000 토큰

### 최소 글자 수
- **긴 글 생성 모드**: 500자 이상
- **질문 답변 모드**: 300자 이상

---

## ✅ 테스트 시나리오

### 시나리오 1: 명시적 요청
```
입력: "기후변화에 대해 글 작성해줘"
예상: 긴 글 생성 모드 활성화, 500자 이상의 상세한 글 생성
```

### 시나리오 2: 질문 형태
```
입력: "React는 무엇인가요?"
예상: 긴 글 생성 모드 활성화, 300자 이상의 상세한 답변 생성
```

### 시나리오 3: 일반 대화
```
입력: "안녕하세요"
예상: 일반 모드, 간결한 인사 응답
```

---

## 🔍 코드 위치

- **메인 로직**: `backend/llm_service.py`
- **엔드포인트**: `backend/app.py:440` (`/chat`, `/api/chat`)
- **프론트엔드**: `src/components/ChatGPTInterface.tsx` (자동 연동)

---

## 📝 주의사항

1. **키워드 감지는 대소문자 구분 없음**: `message.lower()` 사용
2. **프로그래밍 키워드는 추가 태그만 붙임**: 긴 글 생성 모드와 독립적
3. **모든 LLM 제공자 지원**: OpenAI, Anthropic, Ollama, 노트북 LLM

---

**구현 완료!** ✅

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

