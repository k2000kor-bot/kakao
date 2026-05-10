# CORBU.AI 기능 로직 및 강점 파악

**목적**: 기존 기능과 강점이 제대로 발휘되도록, 시스템의 **실제 동작 흐름**과 **의존 관계**를 정확히 파악한 문서입니다.

---

## 1. 시스템 구조 개요

### 1.1 백엔드 서버 (두 가지 진입점)

| 서버 | 진입 스크립트 | 포트 | 대화 API | 스트리밍 | 비고 |
|------|----------------|------|----------|----------|------|
| **통합 풀스택** | `main_server.py` | **8000** | ✅ `/api/chat`, `/api/chat/stream` | ✅ | **고급 기능 전부 사용** (권장) |
| **간이 API** | `app.py` ← `start.sh` | 5001 | ✅ `/api/chat`, `/chat` | ❌ | LLM 또는 간단 폴백만 |

- **`start_all.sh`** 는 `backend/start.sh` → **`app.py`** (5001) 실행.
- **`RUN_GUIDE.md`** 등 문서는 **`main_server.py`** (8000) 기준으로 설명.
- **프론트 config** (`src/config/api.ts`): 기본 `localhost:8000`, 5001 등은 “잘못된 포트”로 취급해 8000으로 우회.

**정리**: **고급 대화·스트리밍·지식·웹검색·고급 AI 엔진**을 쓰려면 **반드시 `main_server`(8000)** 를 띄워야 합니다.

### 1.2 프론트엔드

- **메인 UI**: `App.tsx` → `ChatGPTInterface` (일부 `ChatGPTInterfaceSimple`).
- **대화 전송**:
  - **스트리밍**: `streamChatMessage()` → `POST /api/chat/stream` → 404 시 `POST /api/unified/chat/stream`.
  - **비스트리밍** (재생성·편집 후 전송 등): `POST /api/chat`.
- **API base**: `config/api.ts` → `API_BASE_URL` (기본 `http://localhost:8000`).

---

## 2. 대화 응답 생성 파이프라인 (핵심 로직)

### 2.1 실제 사용 경로

- **`/api/chat`**, **`/api/chat/stream`**: `unified_chat_api` 라우터 (prefix `/api`).
- **`main_server`** 에서만 이 라우터가 마운트됨 → **8000 서버**에서만 아래 파이프라인이 동작합니다.

### 2.2 `generate_chat_response` 단계별 흐름

`unified_chat_api.generate_chat_response` 안에서, 아래 순서로 **우선 시도**하고, 성공하면 즉시 반환합니다.

| 순서 | 단계 | 설명 | 활용 시점 |
|------|------|------|-----------|
| 0 | **댓글 생성** | `context.force_comment_generation` 또는 "댓글 만들어줘" 등 감지 시, 댓글 N개 생성 | 커뮤니티/댓글 시나리오 |
| 1 | **MD 문서 QA** | `md_qa`로 문서 검색 → 신뢰도·검색 결과 활용 답변 + 출처 | 프로젝트/문서 기반 질의 |
| 2 | **혁신 답변 엔진** | `intelligent_answer_generator`: 요청 분석 → 도메인/타입/다중 요구 반영 → 답변 생성 | 일반 질의·다중 요구 |
| 3 | **향상된 응답 생성기** | `enhanced_response_generator` (폴백) | 2번 실패 시 |
| 4 | **웹 연구** | 웹 검색 결과만으로 응답 | 1~3 실패, 검색 결과 있을 때 |
| 5 | **고급 AI 엔진** | `IntelligentResponseEngine.generate_response` | 1~4 미사용 시 |
| 6 | **지식 기반** | `_generate_knowledge_based_response` (정적 지식) | 5 실패 시 |
| 7 | **LLM 서비스** | `llm_service_instance.generate_response` (OpenAI/Anthropic/Ollama 등) | 6 실패 시 |
| 8 | **기본 폴백** | 고정 문구 등 | 전부 실패 시 |

- **스트리밍** (`/api/chat/stream`): 동일 파이프라인으로 최종 텍스트를 만든 뒤, **SSE로 청크 전송**.
- **품질** `quality`: `basic` / `enhanced` / `ultimate` 로 전달되며, 토큰·상세도 등에 반영.

### 2.3 고급 AI 엔진 (`IntelligentResponseEngine`) 내부

`generate_response` 호출 시 대략 다음 단계를 거칩니다.

1. **Phase 1 – 심층 질문 분석**
   - `_analyze_query`: 의도, 주제, 난이도 등.
   - `_perform_semantic_analysis`: 깊이 수준, 감정/긴급도, 기대 형식, 도메인.
   - `_analyze_intent_layers`: 의도 레이어.
2. **Phase 2 – 맥락 강화**
   - `_enhance_context_with_history`: 대화 히스토리 반영.
   - `_inject_domain_knowledge`: 도메인 지식 주입.
3. **Phase 3 – 복합 질문**
   - `_split_compound_query` → `_handle_compound_query_advanced`: 여러 질문 분리 후 통합 답변.
4. **Phase 4 – 지능형 생성**
   - `_generate_thought_process`: 사고 과정.
   - `_determine_response_strategy`: 응답 전략.
   - `_generate_strategic_response`: 전략 기반 본문 생성.
5. **Phase 5 – 최적화**
   - `_apply_response_diversity`, `_enhance_response`, `_finalize_response`.

→ **감정/의도/맥락/도메인**을 활용한 **구조화된 응답**이 이 엔진의 강점입니다.

### 2.4 Flask `api/main.py` – SimpleIntegratedAI (별도 경로)

- **용도**: `main_server`가 아닌 **Flask `main.py`** 기반 서버에서 `/api/chat` 제공 시 사용.
- **흐름**: `analyze_message` → **감정** / **키워드** / **의도** 분석 →  
  **IntelligentResponseEngine** 사용 가능 시 우선 호출 →  
  실패 시 `_generate_response` (의도·감정별 템플릿) 폴백.
- **캐시**: 동일 메시지+quality에 대해 결과 캐시 (최대 100개).
- **현재**: `main_server` 통합 스택에서는 **`unified_chat_api`** 가 대화을 담당하므로, **실제 프로덕션 대화**은 2.2 파이프라인이 우선됩니다.

---

## 3. 부가 기능 로직

### 3.1 긴 글 자동 생성

- **위치**: `llm_service` 등에서 메시지 강화·시스템 프롬프트 조정.
- **감지**: "글", "작성", "생성", "만들어", "에세이", "상세하게", "자세히", "길게", "포괄적으로" 등.
- **질문 감지**: "?", "질문", "궁금", "알려줘", "설명해줘" 등.
- **동작**: 감지 시 **토큰·길이·구조**를 늘려 **서론–본론–결론** 형태의 상세 글 생성.

### 3.2 노트북 LLM (하이브리드)

- **프론트**: `NotebookLLM` 컴포넌트, `notebookLLMService` / `notebookLLMStreamingService`.
- **API (프로젝트 선택 시, 메인 백엔드 8000)**:  
  `GET /api/projects/{id}/notebook-llm/status`,  
  `POST /api/projects/{id}/notebook-llm/generate`,  
  `POST /api/projects/{id}/notebook-llm/stream` (NDJSON).  
  프로젝트 학습 컨텍스트 기반 답변·스트리밍.
- **API (기본 노트북, 비프로젝트)**: `/api/v7/notebook-llm/...` (v7 서비스 제공 시).
- **역할**: 프로젝트·도메인 설정에 따른 **로컬/하이브리드 LLM** 호출.  
  프로젝트 선택 시 메인 서버의 `generate_chat_response` 파이프라인과 연동.

### 3.3 프로젝트·대화 관리

- **프론트**: `projectService`, `chatService`, `messageService` (localStorage 폴백), Redux(`projectsSlice`, `sessionsSlice`).
- **백엔드**: `project_session_api` 등.
- **대화과의 연결**: `conversation_id`, `context.projectId` 등으로 **대화별·프로젝트별** 컨텍스트 전달.

---

## 4. 강점 요약

| 영역 | 강점 | 발휘 조건 |
|------|------|-----------|
| **대화 품질** | MD QA → 혁신 답변 엔진 → 고급 AI → 지식 → LLM → 폴백 다단계 파이프라인 | `main_server`(8000) 기동 |
| **실시간 UX** | SSE 스트리밍 (`/api/chat/stream`) | 8000 + 프론트 `streamChatMessage` 사용 |
| **의도·감정 반영** | 감정/의도 분석 + 고급 AI 엔진의 전략적 응답 | 동일 |
| **문서·도메인** | MD 기반 QA, 도메인 지식 주입 | 8000, 문서/지식 설정 유효 |
| **긴 글** | 키워드 기반 자동 감지 + 토큰/구조 확대 | LLM 또는 상위 엔진 사용 시 |
| **노트북 LLM** | 프로젝트별 학습 기반 답변·스트리밍 | 메인 서버(8000) `/api/projects/{id}/notebook-llm` + 노트북 UI |

---

## 5. 기능이 제대로 발휘되도록 할 일

### 5.1 백엔드 서버 선택

- **고급 대화·스트리밍·지식·웹검색**을 쓰려면:
  - **`main_server`(8000)** 를 띄우고,
  - `start_all.sh`가 `app.py`(5001)만 띄우지 않도록, **실행 스크립트를 `main_server` 기준으로 통일**하는 것이 좋습니다.

### 5.2 프론트엔드 설정

- `API_BASE_URL`이 **8000**을 가리키는지 확인 (`config/api.ts`, `REACT_APP_API_URL`).
- 스트리밍 사용 시 `streamChatMessage` → `/api/chat/stream` 호출이 유지되는지 확인.

### 5.3 대화 플로우 점검

1. **스트리밍**  
   - `useStreaming` 등으로 스트리밍 모드 켜짐 → `streamChatMessage` → `POST /api/chat/stream` (8000).
2. **비스트리밍**  
   - 재생성·편집 후 전송 등 → `POST /api/chat` (8000).
3. **컨텍스트**  
   - `conversation_id`, `context.projectId` 등이 요청 body에 포함되어, **대화/프로젝트 단위** 응답이 나오는지 확인.

### 5.4 의존성·환경

- `intelligent_response_engine`, `intelligent_answer_generator`, `enhanced_response_generator`, MD QA, `llm_service` 등이 **import 가능**한지.
- LLM 사용 시: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, Ollama 등 **환경 변수** 설정.

---

## 6. 참고 파일

**프론트 라우트·앱 셸·사이드바·원격 push**: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes`·`test:app-unified`·**`test:sidebar-context`**. 원격 `git push` 막힘 — [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md).

| 역할 | 경로 |
|------|------|
| 통합 서버 (권장) | `backend/main_server.py` |
| 통합 대화 API | `backend/api/unified_chat_api.py` |
| 고급 AI 엔진 | `backend/api/intelligent_response_engine.py` |
| 간이 대화 (5001) | `backend/app.py` |
| Flask 단순 통합 | `backend/api/main.py` |
| 스트리밍 클라이언트 | `src/utils/streamingClient.ts` |
| 대화 UI | `src/components/ChatGPTInterface.tsx` |
| API 설정 | `src/config/api.ts` |

---

**정리**: 기능 로직을 **그대로** 쓰려면 **`main_server`(8000) + `unified_chat` 파이프라인**을 사용하고, 스트리밍·프로젝트·컨텍스트가 그 경로로 가도록 맞추는 것이 중요합니다.
