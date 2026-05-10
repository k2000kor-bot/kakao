# 기본 플로우 우선 (입력폼 → 답변)

**요청**: 기본적 플로우인 **입력폼에서 답변 나오는 부분**을 우선적으로 먼저 변경·진행합니다.

---

## 1. 플로우 범위

| 단계 | 설명 | 위치 (ChatGPTInterface.tsx) |
|------|------|----------------------------|
| **입력** | textarea + ref/state 동기화 | `input`, `inputRef`, `inputValueRef`, `onChange` |
| **전송** | 엔터·폼 제출·전송 버튼 → 한 곳에서 입력값 읽기 | `getCurrentInputValue()`, `handleComposerSubmit`, `handleKeyDown`, 전송 버튼 `onClick` |
| **전송 처리** | 검증·메시지 추가·API 호출·스트리밍 | `sendMessage()` (useCallback, ~1172행 근처) |
| **답변 표시** | 사용자 메시지 + 어시스턴트 메시지(스트리밍 포함) | `currentConversation.messages.map(...)` (~5736행), 메시지 article·ReactMarkdown |

---

## 2. 변경 시 우선 수정할 곳

- **입력값 읽기**: `getCurrentInputValue()` 한 곳만 수정하면 엔터·폼 제출·전송 버튼 모두 동일 동작.
- **전송 로직**: `sendMessage(overrideText?)` — 사용자 메시지 즉시 반영(flushSync)·대화 갱신·API 호출·스트리밍 갱신.
- **답변 표시**: `currentConversation.messages`를 map 하는 블록 한 곳 (user 메시지 텍스트, assistant 메시지 로딩/ReactMarkdown/접기).

---

## 3. 답변 로직 연결

- **스트리밍**: `POST /api/chat/stream` → 백엔드 동일 답변 로직(ai_engine) → SSE 청크 → `onChunk`/`onComplete`로 UI 갱신.
- **비스트리밍**: `POST /api/chat`(또는 `/api/unified/chat`) → 동일 답변 로직 → `extractResponseContent` 후 대화 목록·현재 대화 state 갱신.
- **워크스페이스 도구**: "OO 프로젝트 만들어줘" 등 의도 감지 시 프로젝트 생성 등 도구 실행 후 `workspace_tool_result`로 응답·프론트에서 목록 갱신. [DEVELOPMENT_COMPLETION_STATUS.md](./DEVELOPMENT_COMPLETION_STATUS.md), [API.md](./API.md) 참고.
- 모든 경로에서 **같은 백엔드 엔진**을 사용하므로, 답변이 항상 동일한 로직에 따라 생성·표시됩니다.

### 질문·요구 → 결과물

- 프론트는 `parsed_input`(question, requirements), `answer_quality_instruction` 등을 **context**에 담아 전달.
- 백엔드는 **context**를 받아 `analyze_message(message, context=context)`에 전달.
- 질문·요구가 있으면(parsed_input 또는 메시지에 "질문"/"요구사항"/"알려줘"/"설명해줘"/"써줘" 등) **결과물 형식**으로 답변 생성(섹션: 질문에 대한 답변, 요구사항 반영, 품질 지침 등). 여러 가지 입력에 대해 만들어진 결과물이 대화 인터페이스에 표시됨.
- **답변 표시 보강 (2026-03)**: 비스트리밍/스트리밍 모두 **같은 대화일 때만** `setCurrentConversation`으로 갱신하도록 해, 입력창에서 생성한 답변이 확실히 화면에 반영됨. 질문·요구 시 백엔드에서 `_build_question_requirement_prompt`로 LLM에 명시적 프롬프트를 넘겨 실제 답변 생성 후, 실패 시에만 템플릿 결과물 사용.
- **라우팅·근거·검증 파이프라인 (2026-03)**: [QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md](./QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md) — Router → Planner → Retrieval → Synthesis → Writer → Verifier. `context.use_pipeline_v2` 또는 `agentic_pipeline` 시 `/api/chat`·`unified_chat`이 `run_pipeline`으로 진입(`pipeline_gate`로 basic/fast 시 생략). 기존 경로는 유지.
- **스타일 시스템 (내용/스타일 분리) (2026-03)**: [STYLE_SYSTEM_ARCHITECTURE.md](./STYLE_SYSTEM_ARCHITECTURE.md) — 내용 생성(사실/논리) → 논리 구조 → **스타일 렌더링**(마지막 단계). 스타일은 7개 파라미터(persona, tone, reasoning_pattern, rhetoric, sentence_rhythm, perspective, persuasion)로 구조화. "유시민 스타일" 등은 스타일 사전에서 Style Profile JSON으로 로드 후 Writer 출력에만 적용(사실 변경 금지).
- **혁신적 생성 능력 (2026-03)**: [INNOVATIVE_GENERATION.md](./INNOVATIVE_GENERATION.md) — 생성 모드(한 줄 요약/3가지 핵심/체크리스트/대비논의), 대안 초안(variants), 확장 질문(follow_up_questions). `context.generation_mode`, `include_variants`, `include_follow_ups`로 제어. 파이프라인 v2에서 사용.

### 대화 리스트·제목·지식 습득 (2026-03)

- **대화 목록**: 사이드바 대화 목록에 **프로젝트에 속하지 않은 대화**(일반 대화), **프로젝트**, **프로젝트 내 대화**가 섹션으로 구분되어 출력됩니다. 일반 대화 / 📁 프로젝트명(접기·펼치기) / 해당 프로젝트 소속 대화 순으로 표시.
- **간결한 제목**: 입력창에 질문·요구를 보낸 뒤 **첫 응답이 생성되면** `/api/chat/title`로 간결한 제목을 자동 생성해 해당 대화의 제목으로 저장하고, 대화 목록에 반영됩니다. (스트리밍·비스트리밍 경로 모두 동일.)
- **딥시크 활용·지식 습득**: 영상(YouTube) 분석, 자료 기반 답변 등은 **별도 메뉴가 아니라 대화로 질문·요구할 때** 생성됩니다. 메시지에 URL을 넣거나 질문만 해도, 필요 시 영상·자료를 습득해 답변에 반영합니다. [YOUTUBE_AS_KNOWLEDGE.md](./YOUTUBE_AS_KNOWLEDGE.md) 참고.

### 답변·글 생성 품질 (2026-03-03)

- **질문·요구 답변**: 질문 핵심에 정확히 답하고, 요구한 형식·길이 반영, 요약·근거·다음 단계 포함. `knowledge_base.json`·`llm_service` 시스템 프롬프트·[지시]·unified_chat_api 응답 스타일에서 반영.
- **글 생성**: 서론·본론·결론, 논리적 흐름·가독성·명확한 문장, 마크다운 활용. 긴 글 키워드(글·작성·생성·써줘·정리해줘 등) 시 `llm_service`에서 long_form 프롬프트 적용.

## 4. UI 구성 (샘플 기준)

- 대화 화면 레이아웃·모달·탭 구도는 [CHAT_UI_LAYOUT_SAMPLE.md](./CHAT_UI_LAYOUT_SAMPLE.md)를 참고합니다. (최상단 바 → 프로젝트 컨텍스트 → **대화 | 소스** 탭 → 본문 → 입력 영역.)

## 5. 관련 파일

- `src/components/ChatGPTInterface.tsx` — 입력·전송·답변 표시 전체.
- `src/AppUnified.tsx` — ChatGPTInterface를 렌더하는 라우트(기본 대화 화면).
- `backend/api/main.py` — `/api/chat`, `/api/chat/stream` (동일 `ai_engine.analyze_message` 사용).

추가 변경 시 **입력폼 → 답변** 구간을 먼저 적용한 뒤, 사이드바·설정·기타 뷰 순으로 진행하면 됩니다.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
