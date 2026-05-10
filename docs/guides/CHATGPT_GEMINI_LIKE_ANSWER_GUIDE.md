# ChatGPT·Gemini처럼 답변이 나오게 하기 — 개발 가이드

이 문서는 **어디를 어떻게 개발하면** 대화 답변이 ChatGPT·Gemini처럼 자연스럽고 요청에 맞게 나오는지, **로직을 어떻게 갖추고 움직이면** 유연하게 판단하고 AI 능력을 키울 수 있는지 정리합니다.

**프론트 회귀·원격 push**: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — **`npm run test:sidebar-context`**. [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md).

---

## 1. 전체 흐름 요약

```
[프론트] 사용자 입력
    → context 구성 (buildUnifiedChatContext: parsed_input, adapt_answer_to_request, original_user_message, conversation_history)
    → POST /api/chat 또는 /api/chat/stream
[백엔드] unified_chat_api.unified_chat()
    → enhanced_context에 original_user_message·adapt_answer_to_request 주입(없을 때)
    → generate_chat_response(message, quality, enhanced_context)
        → 워크스페이스 도구 라우팅(있으면 조기 반환)
        → (선택) 웹 연구
        → MD 문서 QA (MD 관련 질문이면)
        → _build_unified_response_context() 로 통합 컨텍스트
        → intelligent_answer_generator.generate_answer() [주 경로]
        → (실패/짧음 시) DeepSeek/LLM 서비스 시도
        → (또 실패 시) intelligent_engine.generate_response()
        → (또 실패 시) 지식 기반 → LLM 서비스 → 폴백
    → 응답 반환 (response / message / content)
[프론트] 스트리밍 또는 JSON 응답 파싱 → 화면 표시
```

- **실제로 “답글”을 만드는 곳**:  
  - **intelligent_answer_generator** → **intelligent_response_engine** (템플릿·전략 기반 응답)  
  - **llm_service** (DeepSeek/OpenAI/Anthropic/Ollama 등 **LLM API 호출**)
- ChatGPT/Gemini처럼 **직접적·자연스러운 답**을 내려면, **LLM이 사용자 메시지에 바로 답하는 경로**를 우선하거나, 같은 LLM에 **질문·요구에 맞는 지시**를 잘 넘기는 것이 핵심입니다.

---

## 2. 어디를 어떻게 개발해야 하는지

### 2.1 백엔드 — 응답이 만들어지는 위치

| 목적 | 파일·위치 | 무엇을 하면 좋은지 |
|------|-----------|---------------------|
| **대화 진입점** | `backend/api/unified_chat_api.py` · `unified_chat`, `generate_chat_response` | 라우팅 순서 변경, “직접 LLM 우선” 옵션 추가, context 주입 강화 |
| **통합 컨텍스트·파이프라인** | `unified_chat_api.py` · `_run_pre_generation_pipeline`, `_build_unified_response_context` | `_user_message_priority_hint`, `_adapt_answer_to_request_instruction` 문구 보강, 반대/찬성 논리·사건조사 형식·생성로직 등 요청 유형별 힌트 추가 |
| **고급 엔진(분석·전략)** | `backend/api/intelligent_response_engine.py` · `generate_response`, `_generate_thought_process`, `_generate_strategic_response` | considerations 맨 앞에 사용자 원문·요구 반영(이미 적용), “단순 질문이면 LLM으로 넘기기” 분기 추가 검토 |
| **답변 생성 어댑터** | `backend/api/intelligent_answer_generator.py` · `generate_answer` | 분석 결과에 따라 “직접 LLM” 경로로 넘길지 여부 결정 |
| **실제 LLM 호출** | `backend/llm_service.py` · `generate_response`, `_get_system_prompt`, `_enhance_with_knowledge` | 시스템 프롬프트를 “ChatGPT/Gemini처럼 질문에 직접·자연스럽게 답하라”로 보강, context에 따른 길이·형식 지시 반영 |

### 2.2 프론트엔드 — 요청이 어떻게 넘어가는지

| 목적 | 파일·위치 | 무엇을 하면 좋은지 |
|------|-----------|---------------------|
| **context 구성** | `src/services/generationPromptBuilder.ts` · `buildUnifiedChatContext`, `ADAPT_ANSWER_TO_REQUEST_INSTRUCTION` | 질문·요구 맞춤 지시 한 곳에서 관리, 문구 구체화(한 줄, 반대 논리만 등) |
| **전송 payload** | `src/components/ChatGPTInterface.tsx` · `handleComposerSubmit`, context에 `original_user_message`, `adapt_answer_to_request` | 항상 원문·adapt 지시가 백엔드로 가도록 유지 |
| **스트리밍·파싱** | `src/utils/streamingClient.ts` | 응답에서 `response`/`message`/`content` 추출 안정화 |

### 2.3 설정·튜닝

| 목적 | 파일·위치 | 무엇을 하면 좋은지 |
|------|-----------|---------------------|
| **품질별 동작** | `backend/pipeline_tuning.py` (있다면) · `get_preset(quality)` | `use_intelligent_engine`, `prefer_direct_llm`, `llm_timeout_seconds` 등으로 “직접 LLM” 비중 조절 |
| **환경 변수** | `LLM_PROVIDER`, `DEEPSEEK_USE_LOCAL`, `OPENAI_API_KEY` 등 | 사용할 LLM을 정하고, 해당 provider가 실제로 호출되도록 유지 |

---

## 3. 로직을 어떻게 갖추고 움직여야 하는지

### 3.1 유연한 판단을 위한 라우팅 원칙

- **단순 대화·짧은 질문**:  
  - 가능하면 **LLM 한 번에** 사용자 메시지 + 대화 이력 + 짧은 시스템 지시만 넘겨서, ChatGPT/Gemini처럼 **직접 답**이 나오게 한다.
- **도구/기능이 필요한 요청**:  
  - 워크스페이스 의도, 웹 검색, MD QA 등 **도구 라우팅**을 먼저 하고, 그 결과를 LLM에 맥락으로 넘긴다.
- **긴 글·반대/찬성 논리·형식 지정·사건조사·생성로직**:  
  - **같은 LLM**을 쓰되, `_user_message_priority_hint`, `_adapt_answer_to_request_instruction` 등으로 **형식·길이·반대/찬성 논리·사건조사 형식·생성로직**을 명확히 지시한다.

즉, “복잡한 파이프라인 vs 단순 LLM”을 **요청 유형에 따라 선택**하는 것이 유연한 판단의 핵심입니다.

### 3.2 구체적인 로직 제안

1. **“직접 LLM 우선” 경로 (prefer_direct_chat / prefer_direct_llm)**  
   - **구현됨**: `context.prefer_direct_chat` 또는 품질 프리셋의 `prefer_direct_llm`이 True이면,  
     웹 연구·MD QA 전에 **먼저** `_build_unified_response_context(context, None, None, False)`로 최소 통합 컨텍스트를 만든 뒤  
     `llm_service.generate_response(message, ..., context=unified_ctx_minimal)` 호출.  
     응답이 20자 이상이면 그대로 반환해 ChatGPT/Gemini처럼 직접 답이 나오게 함.  
   - **사용법**:  
     - 프론트에서 대화 요청 시 `context.prefer_direct_chat: true` 전달, 또는  
     - `backend/pipeline_tuning.py`의 `get_preset(quality)`에서 `prefer_direct_llm: True` 반환 (예: basic 품질).  
   - 이때 전달되는 context에 `original_user_message`, `adapt_answer_to_request`가 있고,  
     파이프라인 결과인 `_user_message_priority_hint`, `_adapt_answer_to_request_instruction`가  
     `llm_service._enhance_with_knowledge`에서 **프롬프트 맨 앞**에 붙어 요청에 맞는 답을 유도합니다.

2. **시스템 프롬프트 보강 (llm_service)**  
   - “당신은 CORBU.AI입니다” 뒤에,  
     - **짧은 질문에는 짧게**, **한 줄 요청에는 한 줄만**, **반대 논리만 요청하면 반대만** 서술하라는 문구를 명시.  
   - `_enhance_with_knowledge`에서 context의 `_user_message_priority_hint`, `_adapt_answer_to_request_instruction`를 **메시지 앞에** 붙이면, 모델이 요청을 더 정확히 따릅니다.

3. **고급 엔진과의 역할 분담**  
   - **intelligent_response_engine**은 “구조화된 설명·가이드·코드”처럼 **템플릿/전략이 유리한 응답**에 쓰고,  
   - **일상 대화·단순 질문·한 줄 답·반대 논리만** 같은 건 **우선 LLM에 맡기면** 일관되게 자연스러운 답이 나옵니다.

4. **품질·프리셋으로 제어**  
   - `basic`: 직접 LLM 비중 높임 (속도·자연스러움).  
   - `enhanced`: 지금처럼 intelligent_answer_generator + LLM 혼합.  
   - `ultimate`: 웹 연구·상세 구성까지 활용.  
   이렇게 **품질별로 “어디까지 파이프라인을 탈지”**를 나누면, 유연한 판단과 성능/품질 균형을 동시에 잡을 수 있습니다.

---

## 4. AI 능력을 키우기 위한 개선 포인트

- **데이터**: 사용자 만족/불만족 피드백, “답이 안 나왔다” 로그를 수집해 **어떤 유형에서 LLM 경로 vs 엔진 경로가 유리한지** 분석.  
- **프롬프트**: `ADAPT_ANSWER_TO_REQUEST_INSTRUCTION`, `_user_message_priority_hint`를 A/B 테스트하거나, 요청 유형별로 다른 지시문을 넣어 보기.  
- **라우팅**: “단순 질문” 감지(길이·키워드·의도 분류)를 한 곳에서 하고, 그 결과로 `prefer_direct_llm`을 자동 설정.  
- **모델**: 동일 로직으로 여러 provider(DeepSeek, OpenAI, Claude 등)를 바꿔 끼워 보며 **답변 품질·속도** 비교.

---

## 5. 유시민 스타일·원문 재작성 (롯데건설 PF 예시)

**요청 예**: 긴 원문 + "위 글을 유시민스타일로 어투와 화법으로 되묻는 방식으로 … 롯데건설 유동성위기는 해결되지 않고 뒤로 미룬다 취지로 만들어줘"

**Gemini/ChatGPT와 비교했을 때 부족했던 점**
- 메시지에만 "유시민 스타일로" 있어도 **context에 없으면** 유시민 전용 경로를 타지 않음 → **해결**: 메시지에서 "유시민" + "스타일/처럼/어투/화법/되묻/만들어줘" 감지 시 `writing_style`/`person_style`을 `yoo_simin`으로 설정.
- 유시민 경로가 **고정 템플릿**만 사용해, 사용자가 준 **원문을 재작성**하지 않고 주제만 넣은 일반 칼럼만 생성함 → **해결**: 원문 재작성 요청(긴 원문 + "위 글/위 내용/만들어줘/취지")이면 **LLM을 먼저** 호출하고, "[지시] 원문을 유시민 어투·화법, 되묻는 방식, 사용자 취지 반영해 재작성" 문구를 붙여 전달. LLM 응답이 300자 이상이고 원문과 동일한 복사가 아니면 그대로 반환.

**확인 방법**
- `scripts/test-yoosimin-rewrite.sh` 실행 (백엔드 5002 기동 후).
- 답변이 **원문 요약이 아닌**, 되묻는 문장·유시민 톤·"해결이 아니라 미룬 것" 취지가 드러나는지 확인.

**재작성 품질이 템플릿 수준일 때**
- 유시민 재작성은 **LLM이 연결된 경우**에만 본문을 새로 생성합니다. 연결이 없거나 타임아웃이면 intelligent_answer_generator 템플릿으로 폴백합니다.
- 환경 변수로 LLM 활성화: `DEEPSEEK_USE_LOCAL=1`, 또는 `DEEPSEEK_API_KEY`, `OPENAI_API_KEY` 등 설정 후 백엔드 재시작.
- 재작성 경로에서는 `is_long_form=True`, 타임아웃 90초, `max_tokens` 4096으로 설정됩니다.

---

## 6. 기본 동작 요약

- **quality=basic**: `prefer_direct_llm: true` 로 두어, 웹 연구·MD QA 전에 **직접 LLM**을 먼저 시도합니다. 답이 20자 이상이면 그대로 반환해 ChatGPT/Gemini처럼 빠르고 직접적인 답이 나옵니다.
- **quality=enhanced / ultimate**: 기존처럼 파이프라인(intelligent_answer_generator, 웹 연구 등)을 타고, 실패 시 LLM을 사용합니다.  
- **프론트에서** `context.prefer_direct_chat: true` 를 보내면 품질과 관계없이 이번 요청만 직접 LLM 우선으로 처리합니다.

---

## 7. 관련 문서

- [CHAT_CONTEXT_CONTRACT.md](./CHAT_CONTEXT_CONTRACT.md) — context 키·진입점·확장 규칙  
- [ANSWER_QUALITY_AND_SEARCH.md](./ANSWER_QUALITY_AND_SEARCH.md) — 품질·adapt_answer_to_request  
- [CHAT_ANSWER_FLOW_VERIFICATION.md](./CHAT_ANSWER_FLOW_VERIFICATION.md) — 수동 확인 시나리오  
- [QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md](../QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md) — 파이프라인 구조
