# DeepSeek LLM 적용 가이드

시스템이 **DeepSeek**을 사용할 수 있는 두 가지 방식: **설치형(로컬)** 과 **API(클라우드)**.

> **한 흐름 가이드**: 설치 → 구동 → 개발 진행 → 학습을 한 문서에서 보려면 [DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md](./DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md) 를 참고하세요.

- **설치형**: Ollama에 DeepSeek 모델을 설치해 로컬에서 실행. API 키 불필요, 개발·내부용에 적합.
- **API**: DeepSeek 클라우드 API 사용. 키 설정 시 전체 대화·노트북이 해당 API를 사용.

**아키텍처 (Chat vs Reasoner 이중 계층)**  
**Genspark형 문제 해결 UX + DeepSeek 이중 추론/검수** 통합 설계(v2.0)는 [architecture/GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md](./architecture/GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md) 를 참고하세요. (공식 API의 `deepseek-chat` / `deepseek-reasoner`·thinking 모드는 문서 개정 시 반드시 재확인.)

---

## 0. 내부 보안 — DeepSeek 클라우드·외부 수집 차단

조합·내부망 등에서 **질의·프롬프트가 DeepSeek 클라우드로 나가지 않게** 하거나, **외부 웹에서 정보를 가져오는 파이프라인**을 끄려면 백엔드 환경 변수를 설정합니다. 구현은 `backend/llm_internal_security.py` 한곳에서 정책을 읽으며, 이후 강화 시 해당 모듈만 확장하면 됩니다.

| 환경 변수 | 효과 |
|-----------|------|
| **LLM_INTERNAL_AIRGAP** | DeepSeek API(클라우드) 호출 금지 + 웹 연구·외부 수집 금지. 로컬(Ollama 등)만 허용. |
| **DEEPSEEK_INTERNAL_ONLY** | 클라우드 DeepSeek 금지. 기본적으로 **웹 연구도 비활성화**. 웹만 필요하면 `DEEPSEEK_ALLOW_WEB_WITH_LOCAL=1` |
| **DEEPSEEK_BLOCK_CLOUD** | DeepSeek HTTP API만 금지. 웹 연구는 별도로 `LLM_BLOCK_OUTBOUND_COLLECTION` 등으로 제어. |
| **LLM_BLOCK_OUTBOUND_COLLECTION** 또는 **LLM_BLOCK_WEB_RESEARCH** | 통합 대화의 외부 웹 연구(정보 수집) 비활성화. 클라이언트가 `enable_web_research=true`여도 서버에서 무시. |

**적용 지점**: `llm_service`(provider 교체), `notebook_llm_integration`(클라우드 DeepSeek 호출 생략), `unified_chat_api`(웹 연구 차단), Q→A 파이프라인의 `deepseek_optional_refine`·`deepseek_reasoner_critique`(클라우드 보조 단계 스킵).

---

## 1. 설치형(로컬) DeepSeek — 개발용 (권장)

API 키 없이 **로컬 PC/서버에 DeepSeek을 설치**해 개발·테스트할 때 사용합니다.

### 1.1 Ollama 설치 및 DeepSeek 모델 받기

1. **Ollama 설치**  
   [https://ollama.com/download](https://ollama.com/download) 에서 OS에 맞게 설치.

2. **DeepSeek 모델 설치 (터미널)**  
   ```bash
   # 추론 강화 모델 (권장)
   ollama pull deepseek-r1

   # 또는 코드 특화 모델
   ollama pull deepseek-coder
   ```

3. **동작 확인**  
   ```bash
   ollama list
   ollama run deepseek-r1
   ```

### 1.2 환경 변수 (설치형만 사용할 때)

백엔드 서버 `.env` 또는 환경에 다음만 설정하면 됩니다.

```bash
# 설치형 DeepSeek 사용 (API 키 불필요)
DEEPSEEK_USE_LOCAL=true

# 사용할 Ollama 모델명 (기본: deepseek-r1)
DEEPSEEK_LOCAL_MODEL=deepseek-r1

# Ollama 주소 (기본: http://localhost:11434)
# OLLAMA_BASE_URL=http://localhost:11434
```

- **우선순위**: `DEEPSEEK_USE_LOCAL=true`가 있으면 **API 키 없이** provider가 `deepseek-local`로 설정되고, Ollama의 `DEEPSEEK_LOCAL_MODEL` 모델을 사용합니다.
- 대화·프로젝트 노트북·통합 API가 모두 이 로컬 모델을 사용합니다.

### 1.3 권장 사양 (참고)

- RAM: 16GB 이상 (32GB 권장)
- GPU: NVIDIA RTX 3060 12GB 이상 권장
- 디스크: 10GB 이상 여유

---

## 2. API(클라우드) DeepSeek

클라우드 API를 쓰려면 `DEEPSEEK_USE_LOCAL`을 쓰지 않고 **DEEPSEEK_API_KEY**만 설정합니다.

### 2.1 환경 변수 (백엔드)

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| **DEEPSEEK_API_KEY** | ✅ (API 사용 시) | — | [DeepSeek 플랫폼](https://platform.deepseek.com/api_keys)에서 발급 |
| **DEEPSEEK_BASE_URL** | 선택 | `https://api.deepseek.com` | API 엔드포인트 |
| **DEEPSEEK_MODEL** | 선택 | `deepseek-chat` | `deepseek-chat` / `deepseek-reasoner` |
| **DEEPSEEK_USE_LOCAL** | 선택 | false | `true`면 설치형(로컬) 우선 사용 |
| **DEEPSEEK_LOCAL_MODEL** | 선택 | `deepseek-r1` | 설치형일 때 Ollama 모델명 |
| **OLLAMA_BASE_URL** | 선택 | `http://localhost:11434` | 설치형일 때 Ollama 주소 |
| **LLM_PROVIDER** | 선택 | 자동 | `deepseek` / `deepseek-local` 로 고정 가능 |
| **PIPELINE_DEEPSEEK_REFINE** | 선택 | false | `true`이면 `deepseek_review_layer_hints`가 켜진 요청에 한해 [질문→답변 파이프라인](../architecture/EARLY_DEVELOPMENT_SEQUENCE.md) 최종문을 **DeepSeek Chat**으로 한 번 더 다듬음 (`DEEPSEEK_API_KEY` 필요). |
| **PIPELINE_DEEPSEEK_REASONER** | 선택 | false | `true`이면 동일 조건에서 파이프라인이 **DeepSeek Reasoner**로 비평 JSON을 생성(`deepseek_reasoner_critique.py`). `context.pipeline_deepseek_reasoner`로도 옵트인 가능. |
| **PIPELINE_DEEPSEEK_REASONER_AUTO** | 선택 | false | `true`이면 힌트+API 키가 있을 때 **라우터 복잡도**에 따라 `pipeline_deepseek_reasoner`를 자동 설정(`deepseek_auto_flags.py`). |
| **PIPELINE_DEEPSEEK_REFINE_AUTO** | 선택 | false | 동일하게 **DeepSeek Chat** 정리 플래그를 자동 설정. |
| **PIPELINE_WRITER_SKIP_LLM_POLISH** | 선택 | false | `true`이면 Q→A 파이프라인 **Writer** 단계에서 `generate_chat_response`로 하는 문장 다듬기(추가 LLM 1회)를 생략하고 규칙 기반 초안만 사용. 지연·비용 절감용. `context.pipeline_skip_writer_llm_polish: true`로도 동일. |
| **pipeline_tuning_config.json → `deepseek_auto`** | 선택 | — | `reasoner_min_query_len`(500), `refine_min_query_len`(280) — 자동 ON 최소 길이. `reasoner_max_query_len` / `refine_max_query_len`(기본 0=끔): 질문이 더 길면 해당 단계는 AUTO로 켜지지 않음. `prefer_single_deepseek_stage`(기본 false): AUTO가 reasoner·refine을 동시에 켠 경우 refine만 끔. (`pipeline_tuning.py` 로드) |
| **DEEPSEEK_REASONER_MODEL** | 선택 | `deepseek-reasoner` | 비평 전용 모델명 |
| **DEEPSEEK_REFINE_MODEL** | 선택 | `DEEPSEEK_MODEL`과 동일 | 파이프라인 후처리 전용 모델명 |

### 2.2 API만 사용할 때 예시

```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
# DEEPSEEK_MODEL=deepseek-reasoner
```

### 2.3 프론트(CRA) — 통합 대화 context에 힌트·파이프라인 후처리 플래그

백엔드만 `PIPELINE_DEEPSEEK_REFINE` / `PIPELINE_DEEPSEEK_REASONER=true`로 켜도 동작하지만, 아래를 켜면 요청 body의 `context`에 힌트·플래그가 포함됩니다.

| 변수 | 기본 | 설명 |
|------|------|------|
| **REACT_APP_DEEPSEEK_REVIEW_HINTS** | 끔 | `true`이면 `buildUnifiedChatContext`·`ChatGPTInterface` 프로젝트 대화(/projects/:id) 등에서 DeepSeek 검수 계층 프롬프트 힌트를 context에 넣음. |
| **REACT_APP_PIPELINE_DEEPSEEK_REFINE** | 끔 | `true`이면 힌트가 켜진 요청에 `pipeline_deepseek_refine` 포함. 백엔드에 `DEEPSEEK_API_KEY` 및 (선택) `PIPELINE_DEEPSEEK_REFINE` 필요. |
| **REACT_APP_PIPELINE_DEEPSEEK_REASONER** | 끔 | `true`이면 힌트가 켜진 요청에 `pipeline_deepseek_reasoner` 포함. 백엔드 `PIPELINE_DEEPSEEK_REASONER` 또는 동 플래그·`DEEPSEEK_API_KEY` 필요. |
| **REACT_APP_PIPELINE_SKIP_WRITER_POLISH** | 끔 | `true`이면 **프로젝트** 대화 context에 `pipeline_skip_writer_llm_polish` 포함 — Q→A Writer 단계 추가 LLM 다듬기 생략(지연·비용 절감). `UltimateChatGPTInterface`·파일 분석 대화(`FileAnalysisChatSystem`, 업로드 요약이 `projectKnowledge`로 붙을 때)에서도 동일 변수로 전달. |
| **REACT_APP_PIPELINE_VERIFIER_REWRITE** | 끔 | `true`이면 **프로젝트** 대화·재생성·편집 후 재전송(`ChatGPTInterface`) 및 `buildUnifiedChatContext`를 쓰는 경로(`UltimateChatGPTInterface`, `FileAnalysisChatSystem` 등)의 Q→A `context`에 `pipeline_verifier_rewrite: true` 포함 — 백엔드에서 검수 실패 시 Writer 다듬기 1회 재시도. 서버 전역은 `PIPELINE_VERIFIER_REWRITE=1`로도 켤 수 있음. |
| **REACT_APP_INCLUDE_QA_GENERATION_SCENARIO** | 끔 | `true`이면 Q→A `context`에 `include_generation_scenario_in_response: true` 포함 — 백엔드가 응답 메타에 `generation_scenario`(작성 시나리오 마크다운)를 넣고, `parsePipelineMessageExtras`·`GensparkPipelineExtrasPanel`에서 확인 가능. `buildUnifiedChatContext` 경로와 **프로젝트** 대화(`ChatGPTInterface` 메인/재생성/편집)·`FileAnalysisChatSystem`에서 동일하게 전달. |
| **REACT_APP_INHERIT_CLIENT_GENERATION_SCENARIO** | 끔 | `true`이면 직전 어시스턴트 메시지의 `pipelineExtras.generationScenarioMarkdown`을 다음 요청 `context.client_generation_scenario`로 넣음(`mergeApiChatContextPayload`·`scenarioInheritMergeOptionsFromMessages` 헬퍼·`streamChatMessage.messagesForScenarioInherit`·`ChatGPTInterface`·`ModernChatInterface`·`FileAnalysisChatSystem`·`UltimateChatGPTInterface`·`IntegratedMasterInterface`·`SimpleChatView`·루트 `App.js`·`apiClient.sendChatMessage.mergeApiChatContextOptions`·`unifiedAPI.ChatRequest.mergeApiChatContextOptions`·`buildUnifiedApiChatRequestBody`·`ChatServiceSendOptions`·`UnifiedMessageRequest`·`IntegratedMessageService`·`buildModernChatPipelineContext`). 이미 `client_generation_scenario`가 있으면 유지. |
| *(요청 필드)* `client_generation_scenario` | — | API `context` 문자열(또는 프론트 `buildUnifiedChatContext`의 `clientGenerationScenario`) — `unified_chat_api`가 `_generation_scenario_markdown`으로 승격 후 **파이프라인을 타지 않는** `llm_service` 직경로에도 시나리오 힌트로 붙음. |
| **REACT_APP_SIMPLE_CHAT_USE_PIPELINE** | 끔 | `true`이면 `SimpleChatView`가 `buildUnifiedChatContext`에 `useQuestionAnswerPipeline: true`를 넣어 일반 대화 화면에서도 Q→A 파이프라인 경로를 탈 수 있음(프로젝트 미선택 시에도 서버가 허용하면 파이프라인 시도). 부하·지연이 늘 수 있어 기본은 끔. |

`.env` 예시:

```bash
REACT_APP_DEEPSEEK_REVIEW_HINTS=true
REACT_APP_PIPELINE_DEEPSEEK_REFINE=true
REACT_APP_PIPELINE_DEEPSEEK_REASONER=true
```

| **REACT_APP_ADVANCED_MEMORY_CONTEXT** | 끔 | `true`이면 `ChatGPTInterface`에서 턴마다 `advancedConversationMemoryService`에 기록하고, 다음 요청 `context`에 `advanced_memory_context`(주제·참여도·프로필 힌트 등)를 붙임. `localStorage` 키 `corbu_conversation_memory`. 백엔드 `unified_chat_api`가 이를 `_advanced_memory_instruction`으로 바꿔 `llm_service`·`intelligent_response_engine` 프롬프트에 포함합니다. |

---

## 3. 적용 경로

- **llm_service.py**: `DEEPSEEK_USE_LOCAL=true` → provider `deepseek-local` → `_call_deepseek_local`(Ollama). `DEEPSEEK_API_KEY`만 있으면 provider `deepseek` → `_call_deepseek`(API).
- **unified_chat_api**: `generate_chat_response` → `llm_service_instance.generate_response` 에서 위 provider에 따라 설치형/API 사용. **GET /api/health** 응답에 `llm_provider` 포함(프론트 설정 화면 표시용). **GET /api/chat/llm-status** 로 provider·model·summary(예: DeepSeek(로컬)/DeepSeek(API)) 전용 조회 가능.
- **question_answer_pipeline**: `orchestrator.run_pipeline` — (옵트인) `deepseek_reasoner_critique` → `deepseek_optional_refine`. 응답·SSE `metadata`에 `deepseek_critique`, `deepseek_reasoner_meta` 포함 가능.
- **프로젝트 노트북**: 동일 LLM 서비스 경로로 설치형/API DeepSeek 적용.
- **notebook_llm_integration**: `DEEPSEEK_USE_LOCAL`이면 로컬 Ollama의 `DEEPSEEK_LOCAL_MODEL` 사용, `DEEPSEEK_API_KEY`만 있으면 클라우드 DeepSeek 사용.
- **파이프라인 튜닝·노트북 정합**: `llm_service`가 `notebook`/`auto`/`ollama` 경로에서도 `temperature`·`max_tokens`를 context에 넣어 전달합니다. `notebook_llm_integration`은 `_read_temperature_max_tokens_from_context`로 Ollama(`num_predict`)·DeepSeek API 호출에 동일 값을 적용합니다(`quality`만 있는 경우는 `llm_service`에서 `pipeline_tuning.get_preset`으로 먼저 보강). 검증: 루트에서 `npm run test:backend:pipeline-tuning`(5 tests).
- **프론트 설정**: 설정 화면(/settings) "LLM 엔진" 섹션에서 현재 provider(DeepSeek API/로컬 등) 표시. [딥시크 개발 순서](DEEPSEEK_DEVELOPMENT_ORDER.md) 참고.

---

## 4. 프로젝트 생성·운영 출력과 DeepSeek 연동 (샘플 기준)

대화 UI 샘플에서 확인되는 **프로젝트 생성·설정·소스·운영 출력** 기능은 DeepSeek(설치형/API) 적용 시 아래처럼 반영되어 있습니다.

| 샘플 기능 | 적용 위치 | 설명 |
|-----------|-----------|------|
| **프로젝트 만들기** (이름·카테고리·메모리) | 프론트·API | 프로젝트 CRUD·메모리(기본값/프로젝트 전용) 설정. LLM 호출 전 컨텍스트로 전달. |
| **프로젝트 설정·지침** | `unified_chat_api` → `llm_service` | `project_instructions` → context `projectKnowledge`에 포함 → `_enhance_with_knowledge`에서 `[프로젝트 컨텍스트·지침·참고 소스]`로 프롬프트 앞에 삽입. DeepSeek이 프로젝트별 지침에 맞춰 답변. |
| **소스 추가** (업로드·텍스트·드라이브·Slack 등) | 프로젝트 노트북·소스 API | 노트북/소스 내용이 `load_project_notebook_context_filtered`로 로드되어 `projectKnowledge`에 병합. |
| **대화·출력** (짧은 버전/표준 글 등) | `llm_service` | 사용자 메시지와 함께 `projectKnowledge`가 프롬프트에 포함되므로, "메시지 만들어줘" 등 요청 시 프로젝트 맥락·지침을 반영한 구조화된 출력(예: 1) 카톡용 짧은 버전, 2) 카페용 상세) 가능. |

- **정리**: 프로젝트 지침·소스·참고 파일은 모두 **context.projectKnowledge**로 모아지고, **llm_service._enhance_with_knowledge**에서 DeepSeek(및 기타 provider) 호출 시 **요청 메시지 앞에** `[프로젝트 컨텍스트·지침·참고 소스]` 블록으로 넣어집니다. 따라서 설치형/API 구분 없이 동일하게 프로젝트 기반 답변이 나갑니다.

- **도메인 전문 지식**: 도시정비법·국토부·계약·부동산정책·부동산시장·변호사·변리사·법무사·세무사·부동산중개사·감정평가사·재건축/재개발 판례·조합업무처리 등은 **backend/domain_knowledge_urban.json**에 정의되어 있으며, 메시지 또는 프로젝트 맥락에 트리거 키워드가 있으면 `[도메인 전문 지식]` 블록이 프롬프트 앞에 추가되어 DeepSeek이 해당 지식을 근거로 답변합니다. 자세한 내용은 [DOMAIN_KNOWLEDGE_AND_WRITER.md](./DOMAIN_KNOWLEDGE_AND_WRITER.md) 참고.

- **에러·폴백**: API 키 누락 시 `llm_service`에서 폴백 응답 반환. 통합 대화 API에서는 LLM 타임아웃(기본 30초) 후 실패 시 다음 경로(지식 기반·기본 응답)로 넘어갑니다. [DEEPSEEK_DEVELOPMENT_ORDER.md](./DEEPSEEK_DEVELOPMENT_ORDER.md) §5.2 참고.

---

## 4.1 딥시크가 동작하지 않을 때 (체크리스트)

| 확인 항목 | 설명 |
|-----------|------|
| **backend/.env** | 환경 변수는 반드시 **backend/** 폴더 안의 `.env`에 두세요. `main_server.py`가 이 경로에서 로드합니다. |
| **백엔드 재시작** | `.env` 수정 후에는 백엔드(5002)를 재시작해야 적용됩니다. (`./start_all.sh` 다시 실행 또는 `npm run restart:backend`) |
| **GET /api/health** | 브라우저나 `curl http://localhost:5002/api/health`로 응답에 `llm_provider`가 `deepseek` 또는 `deepseek-local`인지 확인하세요. |
| **설치형** | `DEEPSEEK_USE_LOCAL=true` 사용 시 Ollama가 실행 중이어야 합니다. `ollama list`, `ollama run deepseek-r1`로 확인. |
| **API형** | `DEEPSEEK_API_KEY=sk-...` 설정 시 키가 유효한지, 네트워크가 DeepSeek API에 접근 가능한지 확인하세요. |

대화에서 응답이 나오지 않거나 폴백 메시지만 나오면 위 항목을 순서대로 확인한 뒤 백엔드 로그(`🤖 DeepSeek 우선 시도`, `✅ DeepSeek 응답 사용` 등)를 확인하세요.

---

## 5. DeepSeek 미사용(기존 방식)으로 되돌리기

- **DEEPSEEK_USE_LOCAL**과 **DEEPSEEK_API_KEY**를 모두 제거/비우면, 기존 우선순위대로 **노트북 LLM(Ollama)** → OpenAI → Anthropic → fallback 이 적용됩니다.
- Ollama만 사용(다른 모델): `LLM_PROVIDER=ollama`, `LLM_MODEL=qwen3:4b` 등으로 설정.

---

## 6. 참고

- [노트북LLM vs 딥시크LLM 비교](./NOTEBOOK_LLM_VS_DEEPSEEK_LLM.md)
- [도메인 전문 지식·작가 기능](./DOMAIN_KNOWLEDGE_AND_WRITER.md) — 도시정비·부동산·조합 지식 주입 및 조합원 정보·여론 통합
- [DeepSeek API 문서](https://api-docs.deepseek.com/)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
