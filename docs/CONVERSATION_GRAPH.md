# 대화 관계도

**경로**: `/conversation-graph` (도구 메뉴: 대화 관계도)

## 개요

- **대화 내용 업로드**: 카카오톡 내보내기 형식(.txt, .csv) 또는 동일 형식의 텍스트를 업로드하면, 참여자·메시지·시각이 파싱되어 저장됩니다.
- **동조/반대 분류**: 메시지 내용을 기준으로 **동조(찬성)·반대·중립**을 자동 분류합니다. 재개발·조합·주거 등 주제에 대한 찬반이 관계도에 반영됩니다.
- **대화 관계도**:
  - **노드**: 참여자(발신자). 색상 = 우세 입장(동조=초록, 반대=빨강, 중립=회색). 동조/반대/중립 건수 포함.
  - **엣지**: 연속 발화 흐름(회색) + **동조**(같은 찬성, 초록) · **반대**(같은 반대, 빨강) · **대립**(찬성↔반대, 주황).
- **기간·시간 지정**: 특정 기간(시작일·종료일)을 지정하면 해당 구간만 검색해 관계도를 출력합니다.
- **메인 대화와의 구분**: 이 화면은 **관계도 전용 업로드·API**(`/api/conversations/...`)입니다. 같은 TXT/CSV를 **요약·반박·카톡 초안** 등으로 다루려면 통합 대화 입력창에 붙여넣기·첨부로내면 `conversation_file_content`·플래그 병합이 적용됩니다 — [FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) §3.5.

## 지원 형식

### TXT (카카오 내보내기)

- **날짜 줄**: `2024년 1월 1일`
- **메시지 줄**: `2024년 1월 1일 오전 10:00, 0116 : 메시지 내용`  
  또는 `오전 10:00, 0116 : 메시지 내용` (앞에 날짜 줄이 있는 경우)

### CSV (카카오톡 CSV 내보내기, 상대원2구역·조합방 등)

- 컬럼: **날짜**, **시간**, **유저**(이름/사용자), **메시지**(내용). 헤더 한글/영어 모두 가능. 백엔드 파서는 `Date,User,Message` 3열·`날짜,시간,유저,메시지` 4열을 지원합니다.
- 날짜 예: `2026. 3. 2.` / `2026-03-02`, 시간 예: `오전 10:30` / `18:14`
- 예: `KakaoTalk_Chat_상대원2구역_조합원카톡방_2026-03-02-18-14-43.csv` 업로드 후 기간 지정·관계도 검색 시 동조/반대/대립이 노드·선 색으로 표시됨.

## API (프론트 기대 계약)

실제 요청 URL은 `API_BASE_URL`(또는 폴백 출처) + 아래 경로로 붙습니다. 상수 정의: `src/config/api.ts` (`API_CONVERSATIONS_UPLOAD_PATH`, `API_CONVERSATIONS_LIST_PATH`, `API_CONVERSATIONS_RELATIONSHIP_GRAPH_SEGMENT`, 쿼리 `start_date` / `end_date`).

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/conversations/upload` | multipart: 필드 `file`, 선택 `name`. 또는 JSON: `text`, `name`, `filename` (`conversationGraphService.uploadConversation` / `uploadConversationText`) |
| GET | `/api/conversations` | 업로드 목록 (id, name, filename, uploaded_at, message_count) |
| GET | `/api/conversations/:uploadId/relationship-graph` | 관계도. 쿼리(선택): `start_date`, `end_date` (ISO 날짜 문자열) |

## 데이터 저장 (백엔드)

**`main_server`(포트 5002)** 에 `backend/api/conversation_graph.py`·`conversation_graph_api.py` 가 포함되어 있으면 위 REST 경로가 동작합니다. SQLite DB 기본 경로: `backend/data/conversation_uploads.db` (`CONVERSATION_GRAPH_DB`로 변경 가능). 백엔드 회귀: `npm run test:backend:conversation-graph`.

## 답변 생성 (관계도 패널)

관계도·AI 성향 분석이 준비되면 **답변 생성** 패널에서 통합 대화 API로 보고서·요약·제안 문장을 만듭니다.

- **정리된 생성 답변(2단 합성)**: 그래프 JSON에서 **참여자 표·연결 표·족보·시공사 신호·Mermaid**를 결정론적으로 만든 뒤(`buildDeterministicGraphAnswerSections`), LLM은 **한 줄 요약·해석·갈등 축·실행 제안**만 작성합니다. 응답 수신 후 `mergeGraphAnswerWithDeterministicSections`로 표·다이어그램이 빠지지 않은 **완성 보고서**로 합칩니다. 백엔드는 `conversation_graph_structured_sections`를 읽어 표·Mermaid 재작성을 금지합니다(`conversation_graph_chat_hint.py`).
- **로컬 학습 힌트**: 검증 통과 답변 개요를 `localStorage`(`corbu.graph.answer.lessons.v1`, 최대 5건)에 저장하고, 다음 생성 시 `buildGraphAnswerLessonsPrompt`로 짧은 참고 문구만 `answer_quality_instruction`에 붙입니다. 스냅샷에 없는 사실 추가는 금지됩니다. 답변 패널 **「답변 학습 초기화」**(`conversation-graph-answer-clear-lessons`)로 기록을 비울 수 있습니다.
- **자가 검증·재시도**: `verifyGraphAnswerAgainstContext`가 Mermaid·표·참여자명·일반 채팅 문구를 검사하고, 실패 시 최대 1회 자동 재생성(`conversation_graph_revision_issues`)합니다.
- **2-pass LLM(선택)**: 답변 패널 **「2-pass 생성(개요 → 보고서)」** 체크박스 또는 `REACT_APP_GRAPH_ANSWER_TWO_PASS=1`. 1차 **개요**(`outline`) → 2차 **보고서 확장**(`draft`) 후 구조화 블록과 합성. 설정은 `corbu.conversationGraph.uiPrefs.useTwoPassAnswer`에 저장됩니다.
- **맥락**: `conversation_graph_analysis` 플래그와 관계도 요약·스냅샷·해석(`conversation_graph_*` 필드)을 `context`에 실어 `buildUnifiedApiChatRequestBody` 경로로 전송합니다.
- **다단계 UI**: 메인 채팅과 동일한 젠스파이크형 5단계(`GensparkGenerationStatus`) — 스트리밍 SSE `metadata.generation_phase`·클라이언트 타이머 병행.
- **스트리밍**: 기본 켜짐. 본문 청크는 플레이스홀더를 제거한 뒤 `GensparkAnswerMarkdown`으로 표시. 스트림 실패 시 비스트림 POST 폴백.
- **프리셋**: **관계도 만들기**(참여자·연결 표·Mermaid `flowchart TB`)·관계도 보고서·갈등 요약·실행 제안·(참여자 선택 시) 참여자 분석.
- **「관계도를 만들어줘」**: 답변 입력·프리셋·자연어에서 관계도 생성 의도를 감지합니다. 붙여넣은 대화가 있으면 **업로드 → 서버 관계도 API** 후 같은 흐름으로 답변을 생성하고, 화면 **족보형 SVG**도 갱신됩니다. 관계도가 없고 원문만 있으면 `conversation_graph_raw_conversation` 맥락으로 표·Mermaid 답변을 만듭니다.
- **통합 대화(`/chat`)**: 첨부·붙여넣은 대화 파일과 함께 「관계도 만들어줘」를내면 `conversation_graph_create` intent·Mermaid 작성 지시가 `context`에 병합됩니다(`conversationGraphChatContextEnhancer`). 전송 후 graph context는 `mergePersistedGraphComposerContext`로 ref에 누적되어 **같은 대화** 안에서 재생성·편집 시 첨부·handoff 맥락이 유지됩니다. **대화 전환·삭제·메시지 전체 삭제** 시 ref·첨부는 초기화됩니다. TXT/CSV 첨부 시 입력창 위 **파일명 칩**이 표시되고, 관계도 생성 의도가 감지되면 **「관계도 화면에서 만들기」** 배너가 뜹니다(웰컴·대화 화면 공통). 배너로 `/conversation-graph`에 넘기면 붙여넣기·자동 「관계도 만들기」 답변 생성이 이어집니다(`conversationGraphNavigateHandoff`).
- **Mermaid 답변**: 생성 결과의 ` ```mermaid ` 블록은 답변 패널에서 별도 카드로 표시·복사·미리보기(lazy `mermaid` 렌더)할 수 있습니다. 렌더 실패 시 소스만 표시됩니다.
- **대화 handoff**: 「대화에서 답변 생성」·「대화에서 바로 전송」 — `/chat`으로 `location.state`에 초안·`context`·선택적 `autosend` 전달 (`ChatGPTInterface`가 수신).
- **자동 생성**: UI 설정 「관계도 생성 후 보고서 답변 자동 생성」 — 관계도·해석 준비 후 기본 보고서 프리셋으로 한 번 생성 시도.
- **단축키**: 질문 입력란 **Ctrl+Enter**(Mac ⌘+Enter)로 생성.

관련: `src/views/ConversationGraphAnswerPanel.tsx`, `conversationGraphAnswerGeneration.ts`, `conversationGraphAnswerPipeline.ts`, `conversationGraphDeterministicSections.ts`, `conversationGraphAnswerSynthesis.ts`, `conversationGraphAnswerLearning.ts`, `conversationGraphAnswerTwoPass.ts`, `conversationGraphAnswerVerifier.ts`.

## 환경 변수 (답변 생성·선택)

CRA는 `.env` / `.env.local`을 읽습니다. 변경 후 dev 서버를 재시작하세요.

| 변수 | 기본 | 설명 |
|------|------|------|
| `REACT_APP_GRAPH_ANSWER_SELF_IMPROVE` | `1`(켜짐) | `0`이면 검증·1회 재생성 루프 비활성 |
| `REACT_APP_GRAPH_ANSWER_TWO_PASS` | `0`(꺼짐) | `1`이면 2-pass(개요→보고서) 기본 켜짐. 패널 체크박스·`corbu.conversationGraph.uiPrefs`가 우선 |

```env
# 관계도 답변 — 정리된 합성 + (선택) 2-pass
REACT_APP_GRAPH_ANSWER_SELF_IMPROVE=1
REACT_APP_GRAPH_ANSWER_TWO_PASS=0
```

## Push / 패치 이관

- 브랜치 push·PR: [PUSH_NEXT_STEPS.md](./PUSH_NEXT_STEPS.md) · `npm run push:next-steps`
- **관계도 답변만** 이관: `npm run export:graph-answer-patches` → `patches-graph-answer-only/` (기본 `ff911ff77` 1커밋; handoff·문서 포함 시 `GRAPH_PATCH_END=HEAD`)

## 관련 파일 (이 저장소)

- 프론트: `src/views/ConversationGraphView.tsx`, `src/services/conversationGraphService.ts`, `src/config/api.ts` (경로·필드명 상수)
- 답변 생성: `ConversationGraphAnswerPanel.tsx`, `conversationGraphAnswerGeneration.ts`, `conversationGraphAnswerPipeline.ts`, `conversationGraphDeterministicSections.ts`, `conversationGraphAnswerSynthesis.ts`, `conversationGraphAnswerLearning.ts`, `conversationGraphAnswerTwoPass.ts`
- handoff·Mermaid: `conversationGraphNavigateHandoff.ts`, `conversationGraphChatContextEnhancer.ts`, `ConversationGraphMermaidBlock.tsx`, `conversationGraphMermaidExtract.ts`, `conversationGraphScroll.ts`
- 채팅 연동: `src/components/ChatGPTInterface.tsx` (첨부 칩·handoff 배너·`openConversationGraphHandoff`). E2E testid: `TEST_IDS.CHAT_INPUT_CONTAINER`, `CONVERSATION_GRAPH_CHAT_*` (`src/constants/testIds.ts`)
- 앱 라우팅: `src/config/routes.ts` (`CONVERSATION_GRAPH_PATH`), `src/AppUnified.tsx` (lazy 라우트)
- E2E: `e2e/conversationGraph.spec.ts`, `e2e/helpers/conversationGraphPage.ts`, `e2e/helpers/conversationGraphApiMock.ts`

## UI·접근성 (프론트)

- **재검색**: 「관계도 검색」을 다시 누르면 로딩 구간에서 **이전 그래프가 즉시 비워지고**(`setGraph(null)`), 응답 후 새 데이터로 D3를 다시 그립니다.
- **키보드**: 기간 입력란과 검색 버튼(`data-testid="conversation-graph-search-submit"`, 라벨 **검색**)은 **`aria-label="기간 지정 및 관계도 검색"`** 인 `<form>`으로 묶여 있어, 날짜 필드에서 **Enter**로도 제출(검색)할 수 있습니다.
- **문서 형식별 답변**: [CONVERSATION_GRAPH_ANSWER_FORMATS.md](./CONVERSATION_GRAPH_ANSWER_FORMATS.md) — 보고서·엔티티·인텔리전스·논문·문학 등 14종, 내장 골격·로컬 학습.
- **스크린 리더**: `data-testid="conversation-graph-status"` · `aria-live="polite"`(스크린 리더 전용 영역)로 로딩·성공·빈 결과·실패 문구를 안내합니다. 검색 버튼·그래프 카드·**답변 생성 패널**(`role="region"`, `aria-busy`)에 `aria-busy`가 연동됩니다.
- **스크롤**: 노드가 있는 관계도가 도착하면 「대화 관계도」 섹션으로 `scrollIntoView`합니다. 채팅 handoff로 대화를 불러오면 **답변 생성 패널**(없으면 붙여넣기란)로 스크롤합니다. **`prefers-reduced-motion: reduce`** 이면 `behavior: 'auto'`로 애니메이션을 줄입니다.
- **보기**: **관계도 / 매트릭스** 토글, **전문가 레이어**(영향력·갈등·주고받기·시공사·족보), **시간 흐름**(초반/중반/후반) 기간 점프.

## 개발자 검증

- 뷰 테스트 TypeScript: `npm run typecheck:views-tests` — `src/views/tsconfig.json`(Jest 전역·`*.test.tsx`). `verify:conversation-graph`·`dev:check`에 선행 포함.
- API 클라이언트 회귀: `src/services/__tests__/conversationGraphService.test.ts`는 `npm run test:p4:services`에 포함됩니다.
- 뷰·답변 회귀: `npm run test:conversation-graph` — `ConversationGraphView.test.tsx`(43), `ConversationGraphAnswerPanel.test.tsx`(7), `conversationGraphDeterministicSections`·`AnswerSynthesis`·`AnswerLearning`, `generateGraphAnswerViaChat.test.ts`(구조화 합성), kakaoTalk·관계도 유틸 등(합계 195+). **한 번에**: `npm run verify:conversation-graph`(`typecheck:views-tests` + 유닛 + Chromium E2E).
- **풀 스택(API 스모크 포함)**: `npm run verify:conversation-graph:full` — unit + `verify:conversation-graph-api`(백엔드 5002) + E2E 13 tests. 배포 전 선택: [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md) §5.
- 뷰만: `npm test -- --testPathPattern='ConversationGraphView\\.test'`(업로드·목록·관계도 검색·재검색·답변 handoff 등).
- 메인 통합 대화에서 **첨부·재생성·편집** 품질을 보려면(이 화면과 별도): [guides/CHAT_UI_TEST_SCENARIOS.md §14.5](./guides/CHAT_UI_TEST_SCENARIOS.md)·[guides/CHAT_ANSWER_FLOW_VERIFICATION.md §8](./guides/CHAT_ANSWER_FLOW_VERIFICATION.md) 행 9 — [FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) §3.5.
- 저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · `npm run test:views`(확장 뷰·라우트) · (권장) `npm run test:sidebar-context`(수동 §14.5 [CHAT_UI_TEST_SCENARIOS](./guides/CHAT_UI_TEST_SCENARIOS.md)) · (선택) `npm run check:doc-verification-hub` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
- **E2E**(dev 서버 `localhost:3000` 필요): `npm run test:e2e:conversation-graph:chromium` — 13 tests(관계도 검색·합성 답변·2-pass·Mermaid·handoff·`/chat` 이동). 헬퍼: `conversationGraphPage.ts`·`conversationGraphApiMock.ts`.
- **백엔드**: `npm run test:backend:conversation-graph` — `test_conversation_graph.py` + `test_conversation_graph_chat_hint.py`(구조화 블록·폴백).
- **전체**: `npm run verify:conversation-graph`(유닛 + E2E) · **API 포함**: `npm run verify:conversation-graph:full`.
- **`/chat` graph 재생성·편집**: `npm run test:conversation-graph:chat-handoff` — handoff·`mergePersistedGraphComposerContext`·`ChatGPTInterface` graph **재생성·편집** 단위. E2E graph 재생성: `npm run test:e2e:graph-chat-regenerate`(dev `:3000` + `E2E_SERVER_READY=1`). **삭제·초기화 후 첨부+짧은 지시**: `composerContextAfterClear.test` · E2E `test:e2e:composer-attach-context`. 일반 재생성: `test:e2e:composer-regenerate`.
- **/chat handoff만**: `npm run test:conversation-graph:chat-handoff`(context 병합·배너·navigate·전송 context·`ChatGPTInterface` handoff).
