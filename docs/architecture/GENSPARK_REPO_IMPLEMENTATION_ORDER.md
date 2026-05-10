# Genspark식 에이전트 답변 — 저장소 구현 순서 (매핑)

**목적**: [GENSPARK_STYLE_ANSWER_ENGINE_V1.md](./GENSPARK_STYLE_ANSWER_ENGINE_V1.md) §7을 **이 레포의 실제 경로**에 맞춰 순차 진행한다.  
**DeepSeek + Genspark 통합 설계 (v2.0)**: [GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md](./GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md) — **문제 해결 UX + 이중 추론/검수** 전체. 구현 매핑은 본 문서 §단계별 표 + 해당 문서 §6·§9·§12·§14.  
**HTTP·context·SSE 계약 (개발팀)**: [GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md](./GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md) · OpenAPI: [../api/openapi-unified-chat.yaml](../api/openapi-unified-chat.yaml) · Reasoner: [GENSPARK_DEEPSEEK_REASONER_INTERNAL_API.md](./GENSPARK_DEEPSEEK_REASONER_INTERNAL_API.md) (파이프라인 연동 **구현됨**) · `main.py` `/api/chat` 파이프라인·통합 AI 폴백 모두 `answer_mode`/`response_style` 에코 · `/api/chat/stream` 종료 이벤트에 `metadata`로 동일 필드 (`streamingClient` 누적 병합) · **빠른 검증**: 루트 `npm run test:dev:dual-pipeline` — 백엔드 `test:backend:pipeline-smoke`(오케스트라 검수 재작성·Writer 프롬프트·Verifier·**라우터 근거 키워드**·**플래너 make_spec**; `scripts/run-backend-pipeline-smoke.sh` + `lib-backend-python.sh`: `venv`/`.venv` 중 `import pytest` 성공 Python) + 프론트 Jest(`chatInputUtils`·`streamingClient`·`generationPromptBuilder`·`GensparkPipelineExtrasPanel`)

**외부 Genspark 에이전트 폼 매핑 (agents?id=…)**

- [GENSPARK_EXTERNAL_AGENT_FORM_MAPPING.md](./GENSPARK_EXTERNAL_AGENT_FORM_MAPPING.md) — UI 필드 ↔ `genspark_external_agent_profile` · env (`REACT_APP_GENSPARK_REFERENCE_AGENT_INSTRUCTIONS` / `GENSPARK_REFERENCE_AGENT_INSTRUCTIONS`)

**프론트 context 힌트**

- `agentic_genspark_style` + `genspark_*` 템플릿: `buildUnifiedChatContext(..., { agenticGensparkStyle: true })`
- `deepseek_review_layer_hints` + Chat/Reasoner 프롬프트·라우팅: `buildUnifiedChatContext(..., { deepSeekReviewLayerHints: true })`
- 옵트인 파이프라인 후처리: `pipelineDeepSeekRefine` → `context.pipeline_deepseek_refine` · `pipelineDeepSeekReasoner` → `context.pipeline_deepseek_reasoner` (둘 다 힌트와 함께만 전달)
- 프로젝트 · 대화: `ChatGPTInterface` — `REACT_APP_PIPELINE_DEEPSEEK_REFINE` / `REACT_APP_PIPELINE_DEEPSEEK_REASONER` (힌트 켜진 경우) · `REACT_APP_PIPELINE_VERIFIER_REWRITE=true` 시 `context.pipeline_verifier_rewrite`(검수 실패 시 Writer 1회 재작성, 메인·재생성·편집 경로) · `REACT_APP_INCLUDE_QA_GENERATION_SCENARIO=true` 시 `include_generation_scenario_in_response`(응답 메타·UI 시나리오 패널) · `REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO=true` 시 직전 턴 시나리오를 다음 요청 `client_generation_scenario`로 전달(`FileAnalysisChatSystem`·`UltimateChatGPTInterface`의 `mergeApiChatContextPayload` 동일)
- 코드: `src/services/gensparkAgenticPrompts.ts`, `src/services/deepseekReviewPrompts.ts`, `src/services/generationPromptBuilder.ts`

---

## 단계 1 — Classifier + Planner + Composer 분리

| 작업 | 위치 (우선) | 비고 |
|------|-------------|------|
| 의도·도메인 라우팅 | `backend/api/question_answer_pipeline/router.py` | 기존 Q→A 파이프라인 Router 확장 — 한글(검증·팩트·버전 등)·영문(`fact check`, `verify this` 등) 근거 `required` 트리거 |
| 플래너 JSON | `backend/api/question_answer_pipeline/planner.py` | `make_spec` + **`build_task_plan_snapshot`** / `build_minimal_task_plan` → 응답 `task_plan` 메타 |
| 작성(Composer) | `backend/api/question_answer_pipeline/writer.py` | Planner/Blueprint 출력만 입력으로 받도록 정리 |
| 단일 거대 프롬프트 완화 | `backend/api/unified_chat_api.py` → `generate_chat_response` | 플래그로 파이프라인 분기 |

**프론트**

- ✅ 컨텍스트 플래그: 프로젝트 대화 시 `ChatGPTInterface`가 `context`에 `use_pipeline_v2`·`agentic_pipeline`·`response_style`→`answer_mode`(concise→`fast`, balanced→`guided`, detailed/comprehensive→`expert`)·`qa_pipeline_fast_path`(concise) 주입
- 프롬프트 힌트 상수: `src/services/gensparkAgenticPrompts.ts`

---

## 단계 2 — 블루프린트(개요) 선행

| 작업 | 위치 |
|------|------|
| Answer Blueprint 단계 | `planner.py` 확장 또는 `blueprint.py` 신규 모듈 |
| outline-first 분기 | 길이·키워드·`mode===expert` 시 블루프린트 강제 |
| 오케스트레이션 | `backend/api/question_answer_pipeline/orchestrator.py` |

---

## 단계 3 — Verifier 계층

| 작업 | 위치 |
|------|------|
| 근거·환각·완결성 | `backend/api/question_answer_pipeline/verifier.py` (기존 확장) — 한·영 단정 표현 휴리스틱, 수치/날짜 대비 |
| 스타일·형식 | `style_renderer.py` / `style_schemas.py`와 연계 |
| 검수 실패 시 1회 Writer 재작성 (옵트인) | `orchestrator.py` + `writer.py` — `PIPELINE_VERIFIER_REWRITE=1` 또는 `context.pipeline_verifier_rewrite: true` 시 검수 이슈를 LLM 다듬기 프롬프트에 주입 후 `verify` 재실행 · `verification_summary.verifier_rewrite_attempted` · 프론트 `parsePipelineMessageExtras` / `GensparkPipelineExtrasPanel` |

---

## 단계 3b — DeepSeek 이중 계층 (v2, Verifier와 병행·확장)

| 작업 | 위치 | 상태 |
|------|------|------|
| `deepseek-chat` 포맷 정리 (파이프라인 후단) | `backend/api/question_answer_pipeline/deepseek_optional_refine.py` | ✅ `PIPELINE_DEEPSEEK_REFINE` 또는 `context.pipeline_deepseek_refine` + 힌트 |
| `deepseek-reasoner` 비평 JSON | `backend/api/question_answer_pipeline/deepseek_reasoner_critique.py` | ✅ `PIPELINE_DEEPSEEK_REASONER` 또는 `context.pipeline_deepseek_reasoner` + 힌트 |
| 오케스트레이션 순서 | `orchestrator.py` | ✅ 스타일 → **Reasoner 비평** → critique를 refine user에 주입 → Chat 정리 |
| 응답·SSE 메타 | `unified_chat_api.py` | ✅ `deepseek_critique`, `deepseek_reasoner_meta`, 기존 `deepseek_refine_meta` |
| 범용 DeepSeek 클라이언트 | `llm_service.py` / 별도 `deepseek_client.py` | ⏳ 선택(중복 HTTP 제거용) |
| 라우팅 정책 (복잡도별 자동 reasoner/refine) | `deepseek_auto_flags.py` + `router.py` (`planning` task) | ✅ `PIPELINE_DEEPSEEK_REASONER_AUTO` / `PIPELINE_DEEPSEEK_REFINE_AUTO` |
| 비용·지연 가드 | `pipeline_tuning.py` · `deepseek_auto_flags.py` | ✅ `deepseek_auto.reasoner_max_query_len` / `refine_max_query_len`(0=끔), `prefer_single_deepseek_stage` |

---

## 단계 4 — 후속 액션 추천

| 작업 | 위치 |
|------|------|
| 응답 메타에 `next_actions: string[]` | `unified_chat_api.py` 응답 스키마 · `next_actions_hint.py` 빈 질문 시 입력 유도 문구 |
| `follow_up_questions` / `response_alternatives` | `orchestrator.py` + `creative_generation.py` — 후속 질문 줄 필터는 `is_follow_up_question_line_candidate()` (and/or 우선순위 버그 방지) |
| 스트리밍 종료 `metadata` | `unified_chat` SSE 마지막 이벤트에 `task_plan`, `verification_summary`, `verification_pass`, `follow_up_questions`, `response_alternatives`, `evidence_coverage`, `answer_mode`/`response_style` 에코 등 포함 (`streamingClient`는 조각 metadata 누적) · 단위: `src/utils/__tests__/streamingClient.test.ts`(SSE 누적·`application/json` 폴백·mock `headers`) |
| UI 칩/버튼 | `GensparkNextActionChips.tsx` + `ChatGPTInterface`(메인·**재생성·편집 후 스트리밍** `onComplete`에서 동일 메타 병합) / `UltimateChatGPTInterface` / `FileAnalysisChatSystem` (제안 클릭 → 즉시 전송, 메인과 동일) / **`ModernChatInterface`**(스트리밍·비스트리밍·세션 저장 `pipelineExtras`; 구조화·웹 의도 시 `modernChatContextBuilder`로 통합 context) |
| 파일 분석 대화 context | `FileAnalysisChatSystem` — 업로드 지식뿐 아니라 **질문+요구·웹 의도**일 때도 `useQuestionAnswerPipeline`+`agenticGensparkStyle`+`qa_pipeline_allow_empty_project`·참조 에이전트 프로필 (`buildUnifiedChatContext`) |
| 통합 마스터 대화 탭 | `IntegratedMasterInterface` — `buildChatPipelineContextFromHistory`로 이전 user/assistant 턴 + 현재 메시지에서 파이프라인 context 조건부 전송 (`REACT_APP_MODERN_CHAT_UNIFIED_CONTEXT=0`로 끔) |
| 서비스 레이어 | `ChatService.sendMessage`·`integratedSystemAPI.sendMessage`·**`unifiedAPI.sendChatMessage` / `UnifiedAPIService.sendMessage`** — `mergeApiChatContextPayload`(`buildUnifiedApiChatRequestBody`)로 `/api/chat` body 병합. `ChatRequest.conversation_history`·선택 `ChatService` 5번째 인자로 턴 전달 |
| Enhanced 백엔드 | **`EnhancedBackendAPI`** — `sendChatMessage`(래퍼)가 `context.conversationHistory`를 `mapConversationHistoryToChatTurns`로 정규화해 표준 경로(`callStandardAPI` → `unifiedAPI.sendChatMessage`)에 `conversation_history`로 전달. `standard` 품질은 API `quality: basic` 매핑 |
| 다단계 생성기 | **`multiStepResponseGenerator`** — 2단계 이후 `executeResponseStep`이 이전 단계 `response.results`를 `conversation_history`로 붙여 `sendChatMessage`·파이프라인이 맥락을 공유 |
| 블루프린트·검수 메타 접기 | `GensparkPipelineExtrasPanel.tsx` 공통 — 위 화면 + **`MessageItem`**(`ModernChatInterface` 메인 대화)에서 동일 스타일(`과업 메타` details) |

---

## 단계 5 — 모드 분기 (fast / guided / expert)

| 작업 | 위치 |
|------|------|
| 모드 결정 휴리스틱 | `router.py` — `context.answer_mode`(`expert`/`guided`)·`response_style`(`detailed`/`comprehensive`) 시 `grounding_required: none → preferred` |
| 프론트 매핑 | `ChatGPTInterface` — `response_style` → `answer_mode`(concise→`fast`, balanced→`guided`, 상세→`expert`) |
| 한국어 장르 연동 | `context.korean_understanding` + `genre_control` ([한국어 v3](./GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md)) |
| 튜닝 프리셋 | `backend/pipeline_tuning.py` |

---

## 단계 6 — 피드백 루프

| 작업 | 위치 |
|------|------|
| 후속 명령 파싱 | `parseInputIntent` / `chatInputUtils` (프론트) |
| 동일 스레드에서 모드 유지 | `conversation_history` + `consistency_instruction` |

---

## 권장 진행 순서 (1주 스프린트 단위 예시)

1. **Week A**: 단계 1 (라우터·플래너·writer 입출력 계약만 고정) + `gensparkAgenticPrompts` API 컨텍스트 주입  
2. **Week B**: 단계 2 (expert/long-only 블루프린트)  
3. **Week C**: 단계 3 (Verifier 경량 통합) + 단계 4 (next_actions JSON만)  
4. **Week D**: 단계 5 (모드 자동 승격 규칙) + 단계 6 (UI 제안 버튼)

---

## 체크리스트 (요약)

- [x] `generate_chat_response`가 `use_pipeline_v2` / `agentic_pipeline` 시 `run_pipeline` 분기 — `qa_pipeline_fast_path`·`quality=basic` 등은 `pipeline_gate`로 생략  
- [x] 블루프린트가 본문 생성 전에 고정되는가 — `wants_blueprint_first` + Writer가 narrative·steps·checklist·table 모두 `_answer_blueprint_markdown` 선행 병합  
- [~] Verifier가 선택적으로 초안을 수정·거부하는가 — 이슈·fix_actions·`verification_summary`·필수 근거 시 각주 문구 주입(orchestrator); **1회 Writer 재작성**은 `PIPELINE_VERIFIER_REWRITE=1` 또는 `context.pipeline_verifier_rewrite: true` 시 활성(검수 이슈를 LLM 다듬기 프롬프트에 주입 후 `verify` 재실행, `verification_summary.verifier_rewrite_attempted`)  
- [x] 응답에 `next_actions`가 포함되는가 (Q→A 파이프라인 경로: `unified_chat_api` + SSE metadata)  
- [x] (옵트인) 파이프라인 후 DeepSeek Chat 정리·Reasoner 비평·메타 전달 (`deepseek_optional_refine` / `deepseek_reasoner_critique`)  
- [x] (선택) `PIPELINE_DEEPSEEK_*_AUTO`로 Reasoner/Refine 플래그 자동화 (`deepseek_auto_flags.py`)  
- [ ] 메인 LLM **2차 재작성**(비평 JSON만으로 별도 completion) — 현재는 refine 프롬프트에 critique 주입  
- [x] fast 요청은 여전히 1턴으로 끝나는가 — `quality=basic` · `qa_pipeline_fast_path` · `answer_mode=fast` 시 `run_pipeline` 생략 (`pipeline_gate.py`, `unified_chat_api` / `main.py`)

---

**관련**: [KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md](./KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md) · [STEP2_VERIFICATION_GUIDE.md](./STEP2_VERIFICATION_GUIDE.md) · [초기 기준선 개발 순서](./EARLY_DEVELOPMENT_SEQUENCE.md)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

