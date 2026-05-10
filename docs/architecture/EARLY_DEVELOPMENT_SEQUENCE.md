# 초기 기준선 개발 순서 (Genspark + DeepSeek + 한국어 계층)

**목적**: 문서상 목표를 한 번에 다 넣지 않고, **의존 순서**대로 측정 가능한 단위로 쌓는다.

**참고**

- 통합 설계 마스터(v2.0): [GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md](./GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md)
- API·PRD·시퀀스: [GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md](./GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md)
- OpenAPI: [../api/openapi-unified-chat.yaml](../api/openapi-unified-chat.yaml) · Reasoner: [GENSPARK_DEEPSEEK_REASONER_INTERNAL_API.md](./GENSPARK_DEEPSEEK_REASONER_INTERNAL_API.md) (파이프라인 구현됨)
- 저장소 매핑: [GENSPARK_REPO_IMPLEMENTATION_ORDER.md](./GENSPARK_REPO_IMPLEMENTATION_ORDER.md)
- 한국어 v3: [GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md](./GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md)
- 한국어 로드맵: [KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md](./KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md)

---

## Phase 0 — 이미 완료된 전제

| 단계 | 내용 |
|------|------|
| 0-A | 프론트 `koreanUnderstandingLayer.ts` + `generationPromptBuilder` + `ChatGPTInterface` 컨텍스트 전달 |
| 0-B | 백엔드 `unified_chat_api`에서 `korean_understanding` / `enable_korean_depth` 수신 로그 |

---

## Phase 1 — 파이프라인에 한국어 “붙이기” (현재 스프린트)

**원칙**: Intent/Planner가 한국어 프로필을 **읽기만** 해도 동작이 달라져야 한다 (LLM 교체 없음).

| 순서 | 작업 | 상태 |
|------|------|------|
| 1-1 | `question_answer_pipeline/korean_pipeline_bridge.py` — `RouteDecision`·`RetrievalSpec` 보정 | ✅ |
| 1-2 | `router.py` — `korean_understanding.speech_act` / `genre` 키워드 보강 | ✅ |
| 1-3 | `orchestrator.py` — 라우트 후 브리지 호출, 플랜 후 검색 `top_k` 조정 | ✅ |
| 1-4 | `unified_chat_api._run_pre_generation_pipeline` — `korean_layer_instruction`·`genre_control`을 스타일 지시에 병합 | ✅ |
| 1-5 | `intelligent_response_engine._generate_thought_process` — `korean_layer_instruction`을 considerations 최우선 | ✅ |
| 1-6 | `tests/test_korean_pipeline_bridge.py` | ✅ |

**Phase 2b (일부 반영 ✅)**

- Verifier 보조: `korean_style_checks.py` + `VerificationReport.korean_style_notes` + 공식/법률 장르 시 높임 혼용 `issues` 반영
- API/SSE: `korean_style_notes` 메타
- DeepSeek: `deepseek_korean_reasoner_axis` context 힌트 (`deepseekReviewPrompts.ts`)
- 프론트: 스트리밍·비스트리밍 `next_actions` → 메시지 `suggestedFollowUps` 칩 → `sendMessage` 연동

**다음 (Phase 3)**

- 백엔드에서 DeepSeek 실호출 라우팅
- 한국어 품질 스코어 자동화

---

## Phase 2 — Genspark식 단계 분리 (저장소 순서 문서 §단계 1~2)

| 순서 | 작업 | 상태 |
|------|------|------|
| 2-1 | `generate_chat_response`에서 `use_pipeline_v2` / `agentic_pipeline` 시 `run_pipeline` 조기 분기 (프로젝트 지식·ID 또는 `qa_pipeline_allow_empty_project`) | ✅ |
| 2-1b | `writer.py` 한국어 폴리시·`_skip_qa_pipeline`로 재진입 방지 | ✅ |
| 2-1c | `ChatGPTInterface` 프로젝트 대화 시 파이프라인 플래그 전달 · `buildUnifiedChatContext`의 `useQuestionAnswerPipeline` / genspark+project 자동 플래그 | ✅ |
| 2-2 | Blueprint 선행(expert/long/detail/장문) — `answer_blueprint.py` + `writer` 병합 | ✅ |
| 2-3 | `next_actions`·`answer_blueprint` 응답·스트림 metadata (`unified_chat_api`) | ✅ |

---

## Phase 3 — 품질·튜닝

- 한국어 품질 스코어(`korean_quality_scorer.py`) → 파이프라인 응답 메타 `korean_quality_scores` (휴리스틱)
- 옵트인 DeepSeek Chat 후처리: `PIPELINE_DEEPSEEK_REFINE` + `DEEPSEEK_API_KEY`, 또는 context `pipeline_deepseek_refine` (`buildUnifiedChatContext`의 `pipelineDeepSeekRefine`, `deepSeekReviewLayerHints` 필요) → `deepseek_refine_meta`
- 옵트인 Reasoner 비평: `PIPELINE_DEEPSEEK_REASONER` 또는 `pipeline_deepseek_reasoner` → `deepseek_critique`, `deepseek_reasoner_meta`
- 자동 플래그(선택): `PIPELINE_DEEPSEEK_REASONER_AUTO`, `PIPELINE_DEEPSEEK_REFINE_AUTO` + 힌트 + API 키 → `deepseek_auto_flags.py`
- 프론트 후속 칩: SSE/JSON 메타의 `next_actions` + `deepseek_critique` → `parsePipelineFollowUpHints` (`chatInputUtils.ts`)
- 고급 세션 메모리: `api/memory_context_hint.py` → `advanced_memory_context`를 `_advanced_memory_instruction`으로 통일. Q→A 파이프라인 `orchestrator` 정규화 직후 부착, `writer` LLM 다듬기 프롬프트에 포함
- 내부 QA 자동화, 실데이터 장르별 튜닝 (로드맵 5~6단계)

---

**한 줄 요약**: 지금은 **“한국어 프로필이 라우팅·검색·생성 지시까지 닿는 최소 폐루프”**를 연 것이고, 그 다음이 Writer/Verifier/DeepSeek 고도화다.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

