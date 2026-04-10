# 딥시크(DeepSeek) 전체 개발 순서

딥시크 연동을 **순서대로** 진행하기 위한 체크리스트입니다. 완료된 단계는 [x], 미완료는 [ ]로 표시합니다.

> **설치·구동·개발·학습 한 흐름**: [DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md](./DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md) — 이 프로젝트에 딥시크 설치 후 완전 구동·개발 진행·학습(자료 넣기)까지 한 번에 보는 가이드.

---

## 1단계: 백엔드 핵심 연동 (완료)

- [x] **1.1** `llm_service.py` — DeepSeek API·설치형(로컬) provider 추가
  - 환경 변수: `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL`, `DEEPSEEK_USE_LOCAL`, `DEEPSEEK_LOCAL_MODEL`, `OLLAMA_BASE_URL`
  - Provider 우선순위: `LLM_PROVIDER`(env) > deepseek-local > deepseek(API) > notebook > openai > anthropic > fallback
  - `_call_deepseek()`: OpenAI 호환 API 호출
  - `_call_deepseek_local()`: Ollama `/api/generate` 호출
- [x] **1.2** `notebook_llm_integration.py` — DeepSeek 모델 타입·우선순위·응답 생성
  - `CLOUD_DEEPSEEK`, `DEEPSEEK_USE_LOCAL` 시 로컬 모델 우선
  - `_generate_deepseek_response()`: API 호출
  - 용도별(korean_chat, general_chat, analysis, fast_response) deepseek_first 배치
- [x] **1.3** 통합 대화 경로 — `unified_chat_api` → `llm_service_instance.generate_response()` 에서 DeepSeek 사용
- [x] **1.4** 도메인 전문 지식 — `domain_knowledge_urban.json`·`_enhance_with_knowledge` 에서 DeepSeek 답변 시 근거로 활용

---

## 2단계: 설정·문서 (완료)

- [x] **2.1** `docs/DEEPSEEK_SETUP.md` — 설치형(로컬)·API 환경 변수·적용 경로·되돌리기
- [x] **2.2** `docs/NOTEBOOK_LLM_VS_DEEPSEEK_LLM.md` — 노트북 LLM vs 딥시크 성능·튜닝 비교
- [x] **2.3** `docs/DOMAIN_KNOWLEDGE_AND_WRITER.md` — 도메인 지식·작가 기능(DeepSeek 연동)

---

## 3단계: API·상태 노출 (완료)

- [x] **3.1** 백엔드 health 응답에 `llm_provider` 포함 — `GET /api/health` 응답에 `llm_provider` (unified_chat_api)
- [x] **3.2** (선택) `GET /api/chat/llm-status` 전용 엔드포인트 — provider·model·summary (DeepSeek 로컬/API 구분)

---

## 4단계: 프론트엔드 표시 (완료)

- [x] **4.1** 설정 뷰(SettingsView) — "LLM 엔진" 섹션: 현재 provider 표시(DeepSeek API/로컬·노트북 LLM 등), DeepSeek 설정 가이드 링크
- [x] **4.2** (선택) 대화 화면 푸터/힌트 — 입력창 푸터에 현재 LLM 배지(DeepSeek(로컬)/DeepSeek(API) 등)·툴팁 표시

---

## 5단계: 스트리밍·에러·테스트 (완료)

- [x] **5.1** 스트리밍 — `unified_chat_stream` 은 `generate_chat_response` → `llm_service_instance.generate_response()` 를 사용하므로 **DeepSeek(설치형/API) 응답이 이미 스트리밍에 사용됨**. 현재는 전체 응답 생성 후 청크(chunk_size 80) 단위로 SSE 전송 방식이며, DeepSeek API 토큰 단위 실시간 스트리밍은 미구현.
- [x] **5.1a** 딥시크 우선 시도 — `generate_chat_response`에서 **provider가 deepseek/deepseek-local이면** 다른 엔진보다 **먼저** `llm_service_instance.generate_response()`를 호출하므로, 대화이 설치형/API DeepSeek으로 정상 동작. 실패 시 기존 순서(고급 엔진·지식·LLM 재시도·폴백)로 진행. DEEPSEEK_SETUP §4.1 "동작하지 않을 때" 참고.
- [x] **5.2** 에러 처리 — **API 키 누락**: `llm_service._call_deepseek` 에서 `ValueError` 후 `_generate_fallback_response` 반환. **타임아웃**: `unified_chat_api.generate_chat_response` 에서 `asyncio.wait_for(llm_timeout_seconds, 기본 30초)` 후 실패 시 폴백 경로. DEEPSEEK_SETUP §5 "미사용으로 되돌리기" 참고.
- [x] **5.3** 백엔드 테스트 — DeepSeek/LLM 코드 경로 mock 단위 테스트: `tests/test_unified_chat_api.py`의 `TestDeepSeekLLMPathMock.test_generate_chat_response_uses_llm_path_when_mocked`. 실행 조건·명령: [DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md §6](./DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md#6-선택-백엔드-단위-테스트)(backend 의존성·venv 후 `pytest tests/test_unified_chat_api.py::TestDeepSeekLLMPathMock -v`)

---

## 6단계: 검증·운영

- [x] **6.1** 수동 검증 체크리스트 — 아래 순서로 확인 권장.
  1. **설치형**: `DEEPSEEK_USE_LOCAL=true`, Ollama 실행·`ollama run deepseek-r1` 확인 후 백엔드 재시작 → 대화 전송 → 응답 확인.
  2. **API**: `DEEPSEEK_API_KEY=sk-...` 설정 후 백엔드 재시작 → 대화·노트북 응답 확인.
  3. **상태**: `GET /api/health` 응답에 `llm_provider` 값 확인(deepseek-local / deepseek).
  4. **설정 화면**: /settings → "LLM 엔진" 섹션에 현재 provider 표시 확인.
- [x] **6.2** 환경별 안내 — DEEPSEEK_SETUP §1(설치형)·§2(API)·§5(되돌리기). 개발(로컬)·스테이징/프로덕션(API 키·비용)은 동일 환경 변수로 제어.

---

## 실행 순서 요약

| 순서 | 내용 | 담당 |
|------|------|------|
| 1 | 백엔드 llm_service·notebook_llm_integration (완료) | 백엔드 |
| 2 | 설정·문서 DEEPSEEK_SETUP·비교 문서 (완료) | 문서 |
| 3 | API health에 llm_provider 추가 | 백엔드 |
| 4 | 프론트 설정 뷰 LLM 엔진 섹션 | 프론트 |
| 5 | 스트리밍·에러 문서화 (완료) | 백엔드·문서 |
| 6 | 수동 검증 체크리스트·환경별 안내 (완료) | 운영·문서 |

---

## 프론트엔드: 입력창 엔터 → 질문·요구 수신 → 딥시크 답변

입력창에서 **엔터**를 치거나 **전송 버튼**을 누르면, 질문·요구가 **단일 진입점(sendMessage)** 으로 들어가 아래 순서로 처리됩니다.

1. **검증** — 입력값 검증·이미지/대화 파일 첨부 반영.
2. **구조화 프롬프트** — `buildStructuredGenerationPrompt`로 요청 메시지 생성.
3. **딥러닝 보강** — `buildMessageToSendForChat`(의도·감정·주제·복잡도 분석 → 보강 문구 추가)으로 전송용 메시지 생성. (메인 대화·재생성·편집·노트북(딥시크) 화면 공통)
4. **백엔드 전송** — `/api/chat` 또는 `/api/chat/stream`으로 **딥시크(DeepSeek)** 등 LLM 호출.
5. **응답 표시** — 스트리밍/비스트리밍에 따라 UI 갱신.
6. **응답 품질 분석** — `analyzeResponseWithDL` 비동기 호출(실패 시에도 대화 흐름 유지).

실제 **답변 생성 엔진은 백엔드의 딥시크**이며, "노트북"은 프로젝트별 학습·소스 기반 답변 **기능/화면** 이름입니다. 코드: `ChatGPTInterface` sendMessage, `notebookLLMDeepLearningIntegration.buildMessageToSendForChat`.

---

## 입력 → 논리·자료 → DeepSeek 답변 흐름

입력창에 **요구와 질문**을 넣으면 다음 순서로 답변이 생성됩니다.

1. **자료 수집** — 웹 연구·프로젝트 지식·대화 맥락 등 답변에 필요한 자료를 수집합니다.
2. **논리 구성** — 사용자 질문·요구사항(parsed_input)에 맞는 논리적 사고·구조(질문에 대한 직접 답변 → 요구사항별 상세 → 참고·출처)를 잡습니다.
3. **스타일 지시** — 응답 스타일·관점·말투를 반영합니다.
4. **DeepSeek LLM 호출** — 수집 자료·논리 구성·스타일 지시를 컨텍스트로 넘기고, "요구와 질문에 맞는 논리적 사고로 수집 자료를 활용해 답변하세요" 지시와 함께 답변을 생성합니다. (환경 변수로 DeepSeek API 또는 설치형 사용)

즉, **답변에 필요한 내용을 파이프라인에서 가져와 DeepSeek LLM에 전달**하고, LLM이 그 자료를 활용해 논리적으로 답변합니다.

- **품질 프리셋**: API 요청 시 `quality`(basic / enhanced / ultimate)를 넘기면 파이프라인 단계·타임아웃·max_tokens가 달라집니다. 검색·자료 활용 시 프론트에서 자동으로 품질을 상향해 전달합니다. 자세한 내용은 [ANSWER_QUALITY_AND_SEARCH §2.4](./guides/ANSWER_QUALITY_AND_SEARCH.md#24-생성-답변-능력-최대-활용-품질-상향).

---

## 정보 수집·학습·정보 찾기 능력

시스템이 가진 세 가지 핵심 능력입니다. 대화 시 자동으로 활용됩니다.

| 능력 | 설명 | 구현 |
|------|------|------|
| **정보 수집** | 답변에 필요한 자료를 여러 소스에서 수집 | 웹 연구(enable_web_research), 프로젝트 지식(projectKnowledge), 대화 맥락(conversation_history) → 파이프라인 1단계 자료 수집 |
| **학습** | 프로젝트에 등록한 내용을 저장·활용 | 프로젝트 파일·지침·가이드라인 → notebook-context 저장; 대화 시 load_project_notebook_context_filtered로 로드해 projectKnowledge에 반영 |
| **정보 찾기** | 관련 정보를 검색·조회해 답변에 반영 | 웹 리서치(intelligent_web_researcher), MD 문서 검색(/md/search), 프로젝트 노트북 컨텍스트 조회 |

- **정보 수집**: 웹 검색 결과·프로젝트 소스·최근 대화를 모아 `_collected_materials_summary`로 정리합니다.
- **학습**: 프로젝트별로 업로드·등록한 소스와 지침이 notebook-context에 저장되고, 대화 시 해당 프로젝트 컨텍스트를 불러와 답변에 반영합니다.
- **정보 찾기**: 질문/요구에 따라 웹 연구 수행, MD 인덱스 검색, 프로젝트 컨텍스트에서 관련 구간을 찾아 답변 자료로 씁니다.

---

## 참고

- [DEEPSEEK_SETUP.md](./DEEPSEEK_SETUP.md) — 환경 변수·설치형·API
- [NOTEBOOK_LLM_VS_DEEPSEEK_LLM.md](./NOTEBOOK_LLM_VS_DEEPSEEK_LLM.md) — 비교·권장 방향
- [ANSWER_QUALITY_AND_SEARCH.md](./guides/ANSWER_QUALITY_AND_SEARCH.md) — 답변 품질·검색·자료 활용·품질 상향
- [DeepSeek API 문서](https://api-docs.deepseek.com/)
