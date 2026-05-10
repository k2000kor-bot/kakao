# 대화 API Context 계약

대화 요청 시 프론트엔드가 백엔드로 전달하는 **context** 필드의 키·의미·사용처를 정의합니다.  
**일괄성**: 모든 대화 진입점(메인 대화·재생성·편집·SimpleChatView·UltimateChatGPTInterface·FileAnalysisChatSystem 등)은 이 계약에 맞춰 context를 구성합니다.  
**확장성**: 새 키를 추가할 때는 이 문서와 백엔드 정규화 로직을 함께 갱신합니다.

**프론트 회귀·원격 push**: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes`·`test:app-unified`·**`test:sidebar-context`**. [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md).

---

## 1. Context 키 일람 (프론트 → 백엔드)

| 키 | 타입 | 필수 | 설정 위치 | 백엔드 사용 |
|----|------|------|------------|--------------|
| `conversation_history` | `Array<{role, content}>` | 권장 | 전송·재생성·편집 시 해당 대화 최근 20턴 | 맥락 반영·일관성 지시 |
| `parsed_input` | `{ question?, requirements?, intent_type?, intent_confidence? }` | 선택 | chatInputUtils + buildUnifiedChatContext / ChatGPTInterface | 질문·요구 구조화·논리 구성 힌트 |
| `adapt_answer_to_request` | `string` | 권장 | **단일 소스**: generationPromptBuilder.ADAPT_ANSWER_TO_REQUEST_INSTRUCTION | 요구·질문에 맞게 유연한 생성(길이·형식·깊이·생성로직·사건조사 형식) |
| `answer_quality_instruction` | `string` | 선택 | ChatGPTInterface (칼럼 요청 시 추가 지시 포함) | 품질 수준 지시 |
| `available_capabilities` | `string` | 권장 | generationPromptBuilder.AVAILABLE_CAPABILITIES_HINT | 기능 안내·capability_help |
| `consistency_instruction` | `string` | 이력 있을 때 | 전송·재생성·편집 시 conversation_history.length > 0 | 이전 대화 맥락 유지 |
| `enable_web_research` | `boolean` | 선택 | buildFeatureContextFromMessage | 웹 연구 수행 |
| `prefer_informed_answer` | `boolean` | 선택 | buildFeatureContextFromMessage | 검색·자료 활용 품질 상향 |
| `projectId` / `project_id` | `string` | 선택 | buildChatContext / buildUnifiedChatContext | 프로젝트 지식·파일 |
| `project_instructions` | `string` | 선택 | 프로젝트 설정 | 프로젝트 지침 |
| `response_style` | `string` | 선택 | 사용자 설정 | 스타일(concise/balanced/detailed/comprehensive) |
| `perspective` | `string` | 선택 | 사용자 설정 | 관점(practical 등) |
| `multi_request_mode` | `boolean` | 선택 | `buildFeatureContextFromMessage` (번호·불릿·접속사 다중 요청) | 백엔드가 항목별 통합 답변 유도 |
| `multi_request_items` | `string[]` | 선택 | 위와 동일 | 항목 목록(최대 15)·LLM prefix |
| `multi_request_adaptation_instruction` | `string` | 선택 | `buildUnifiedChatContext` (`MULTI_REQUEST_ADAPTATION_INSTRUCTION`) | 항목별 형식·깊이 지시 |

**서버 전용(프론트 미전송)**: `_multi_request_instruction` — `unified_chat_api._compose_multi_request_instruction`이 위 필드로 합성 후 `llm_service` 프롬프트·`intelligent_response_engine`·Q→A Writer 다듬기에 사용.

---

## 2. 진입점별 context 구성

- **ChatGPTInterface** (메인 대화·재생성·편집·편집 스트리밍)  
  - 자체 `chatContextWithHistory` / `regenContextWithHistory` / `editContextWithHistory` / `editStreamContext`  
  - `buildChatContext` + `buildFeatureContextFromMessage` + `conversation_history`(conversations 우선) + `parsed_input` + `answer_quality_instruction` + **`adapt_answer_to_request`**(generationPromptBuilder에서 import) + `consistency_instruction`(이력 있을 때) 등.
- **SimpleChatView / UltimateChatGPTInterface / FileAnalysisChatSystem**  
  - **`buildUnifiedChatContext(rawInput, { conversationHistory?, project? })`** 사용.  
  - 내부에서 `parsed_input`, `adapt_answer_to_request`, `available_capabilities`, `conversation_history`, `consistency_instruction`(이력 있을 때), feature 플래그 등 일괄 설정.

---

## 3. 단일 소스·확장 시 규칙

- **문구 상수**: `adapt_answer_to_request` 문구는 **`src/services/generationPromptBuilder.ts`**의 `ADAPT_ANSWER_TO_REQUEST_INSTRUCTION`만 사용. ChatGPTInterface는 여기서 import.
- **새 context 키 추가 시**:  
  1. 이 문서 §1에 키·타입·설정 위치·백엔드 사용 추가.  
  2. 공통으로 쓸 키면 `buildUnifiedChatContext`에 추가.  
  3. ChatGPTInterface 전용이면 해당 경로(전송/재생성/편집)에만 추가.  
  4. 백엔드 `unified_chat_api` 정규화·파이프라인에서 사용 시 반영.
- **백엔드 파이프라인**: `_run_pre_generation_pipeline`에서 `adapt_answer_to_request` → `_adapt_answer_to_request_instruction`(최대 900자), `multi_request_*` → `_multi_request_instruction`. `generate_chat_response` 진입 직후·`orchestrator._normalize_and_context_load`에서도 `_multi_request_instruction` 합성. `llm_service`는 **다중 요청 블록을 adapt 지시보다 앞**에 붙임. **웹 연구**: `_append_multi_request_items_to_research_seed`로 `multi_request_items`를 연구 시드에 합침. **DeepSeek 파이프라인**: `deepseek_optional_refine`·`deepseek_reasoner_critique`가 `_multi_request_instruction`을 user 프롬프트에 포함(정제·비평 시 항목 누락 검수). 기타 키는 `normalized_context`로 전달.
- **merge 경로**: `mergeApiChatContextPayload`는 파이프라인 블록이 비어도 `buildFeatureContextFromMessage`로 플래그·다중 요청을 보강(`REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT=0` 제외).
- **구조화 폴백**: `_generate_structured_response`(스트리밍·엔진 폴백 템플릿)도 `multi_request_mode`이면 응답 앞에 항목 목록을 붙임. **스타일 렌더**: `style_renderer.render`가 `_multi_request_instruction`을 프롬프트에 포함.

---

## 3.5 사용자 문자열 정규화 (전처리)

`parsed_input`·`conversation_history`·API `message`에 넣기 **직전** 사용자 텍스트는 **`chatInputUtils.coerceTrimmedString(primary, fallback)`** 로 통일합니다(이벤트가 첫 인자로 들어와도 안전). 선행 공백을 남겨야 할 때만 **`coerceTrimmedEnd`**. 상세·미러 동기화: [RESPONSE_CLEANING.md](./RESPONSE_CLEANING.md).

---

## 4. 참고 문서

- [ANSWER_QUALITY_AND_SEARCH.md](./ANSWER_QUALITY_AND_SEARCH.md) — 품질·검색·adapt_answer_to_request(§2.5)
- [RESPONSE_CLEANING.md](./RESPONSE_CLEANING.md) — `coerceTrimmedString`·`coerceTrimmedEnd`·`sync:frontend-chat-input-utils`
- [CHAT_ANSWER_FLOW_VERIFICATION.md](./CHAT_ANSWER_FLOW_VERIFICATION.md) — 입력→전송→답변·대화 이력(§5.6)
- [DEVELOPMENT_CONTINUITY.md](../DEVELOPMENT_CONTINUITY.md) — 개발 연속성·대화 컨텍스트 일관성(§11)

---

*계약 정리: 2026-03 — 일괄성·확장성 기준으로 대화 context 단일 소스 및 문서화.*
