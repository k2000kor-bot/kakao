# 대화 입력 → 질문 표시 → 답변 생성·표시 흐름 검증

## 개요

입력창 텍스트 전송 후, 대화창에 **질문**이 나오고 이어서 **생성 답변**이 나오는지 코드 기준으로 검증한 문서입니다.

---

## 1. 입력 → 전송

- **위치**: `ChatGPTInterface.tsx` — `handleComposerSubmit`
- **동작**:
  - form submit 시 **form 내 textarea DOM 값**을 우선 사용: `textarea?.value`를 **`chatInputUtils.coerceTrimmedString(…, '')`**로 정규화(원시 `.trim()` 대신 이벤트·비문자 방어)
  - 정규화 결과가 비어 있으면 `getCurrentInputValue()` 사용(동일하게 `coerceTrimmedString` 기반)
- **전송 호출**: `sendMessage(v)` — `v`가 위에서 읽은 입력 텍스트

---

## 2. 전송 → 질문 대화창 표시

- **위치**: `ChatGPTInterface.tsx` — `sendMessage` 내부
- **동작**:
  - `userMessage` 생성 (role: `'user'`, content: `trimmedInput`)
  - `updatedMessages = [...conversation.messages, userMessage]`
  - `updatedConversation = { ...conversation, messages: updatedMessages }`
  - **`flushSync`** 안에서:
    - `setCurrentConversation(updatedConversation)`
    - `setConversations(...)` (목록에 반영)
  - 대화창은 `currentConversation.messages`를 map 하여 렌더 → **질문이 바로 대화창에 표시됨**

---

## 3. 답변 생성·표시 (두 경로)

### 3-1. 스트리밍 경로

- **조건**: `isStreamingSupported()` true
- **호출**: `streamChatMessage(messageToSend, conversation.id, { onChunk, onComplete })`
- **동작**:
  - 빈 assistant 메시지로 `initialConversation` 생성 후 **flushSync**로 한 번 반영 (플레이스홀더)
  - `onChunk(chunk)`: `accumulatedText` 누적 → `setCurrentConversation`으로 해당 assistant 메시지 `content` 갱신 → 스트리밍 텍스트가 대화창에 실시간 표시
  - `onComplete(fullText)`: `finalConversation`(질문 + 최종 답변) 구성 → **flushSync**로 `setCurrentConversation` / `setConversations` / `saveConversationsToStorage` 호출
- **연결**: `streamingClient.ts`의 `streamChatMessage`가 SSE로 `/api/chat/stream` 또는 `/api/unified/chat/stream` 호출 후 `onChunk`/`onComplete` 콜백 호출 → 위 로직과 일치

### 3-2. 비스트리밍 경로

- **조건**: 스트리밍 미지원 또는 스트리밍 실패 시
- **동작**:
  - **플레이스홀더**: assistant 메시지 `content: '생각 중...'` 으로 대화창에 먼저 표시 (flushSync)
  - **API**: `axios.post(/api/chat)` 또는 `/api/unified/chat` 폴백
  - **응답 파싱**: `extractResponseContent(response)` → `displayContent`
  - **반영**: `placeholderMessages` 중 `placeholderAssistantId`인 메시지만 `content: displayContent`로 교체 → `finalConversation` → **flushSync**로 `setCurrentConversation` / `setConversations` / 저장
- **연결**: `chatInputUtils.ts`의 `extractResponseContent`가 `response.data`에서 문자열/객체 등 다양한 형태에서 텍스트 추출 → 대화창 assistant 메시지에 그대로 사용
- **지원 응답 필드**: `response`, `message`, `content`, `text`, `result`, `output`, `reply`, `answer`, `answer_text`, `response_text`, `generated_text`, `generated_content` 및 `data.data` 내부·OpenAI 스타일 `choices[0].message.content` (chatInputUtils 테스트 25건)

---

## 4. 에러 시

- **위치**: `sendMessage` 내부 `catch`
- **동작**: `errorMessage`(role: `'assistant'`) 생성 후 `finalConversation`에 포함해 **flushSync**로 반영 → 오류 메시지도 대화창에 표시. 저장 후 `sidebar-chats-updated` 이벤트 발생으로 사이드바 대화 목록 즉시 갱신

---

## 5. 검증 요약

| 단계 | 연결 여부 | 비고 |
|------|-----------|------|
| 입력 → 전송 | ✅ | form textarea DOM 값 우선, `sendMessage(값)` 호출 |
| 전송 → 질문 표시 | ✅ | user 메시지 추가 후 flushSync로 state 반영, 대화창이 같은 state 구독 |
| 스트리밍 답변 표시 | ✅ | streamChatMessage 콜백 → setCurrentConversation / flushSync(onComplete) |
| 비스트리밍 답변 표시 | ✅ | extractResponseContent → displayContent → placeholder 교체 후 flushSync |
| 에러 메시지 표시 | ✅ | catch에서 assistant 메시지 추가 후 flushSync |

---

## 5.5 품질·컨텍스트 전달 (생성 능력 최대 활용)

- **위치**: `ChatGPTInterface.tsx` — `sendMessage` 내 `featureCtx`, `chatContextWithHistory`, `effectiveQuality`
- **동작**:
  - `featureCtx = buildFeatureContextFromMessage(trimmedInput)` (`trimmedInput`은 `sendMessage` 내부에서 `coerceTrimmedString`으로 만든 전송용 문자열) → `enable_web_research`, `prefer_informed_answer` 등 설정
  - `effectiveQuality`: 검색·자료 활용 시 품질 상향(basic→enhanced, enhanced→ultimate)
  - 스트리밍: `requestBody`에 `quality: effectiveQuality`, `context: chatContextWithHistory` 전달 → `streamingClient`가 그대로 body에 포함
  - 비스트리밍: `payload.quality`, `payload.context` 동일하게 전달
- **백엔드**: `/api/chat/stream`·`/api/chat`에서 `request.quality`, `request.context` 수신 후 `generate_chat_response(message, quality, normalized_context)` 호출. 스트리밍 폴백 시에도 `normalized_context` 전달.
- **참고**: [ANSWER_QUALITY_AND_SEARCH](./ANSWER_QUALITY_AND_SEARCH.md) §2.4

---

## 5.6 대화 이력 기억 및 대화방 재진입

- **저장**: `conversations`가 변경될 때마다 `localStorage`(`chatgpt-conversations`)에 **전체 대화 목록·메시지**를 저장.
- **로드**: 마운트 시 `localStorage`에서 불러와 `setConversations`로 설정. 각 대화에 `messages` 배열 포함.
- **대화방 선택**: 사이드바에서 대화 클릭 시 `conversations.find(id)`로 해당 대화를 찾아 `setCurrentConversation(conv)` 호출 → **저장된 메시지가 그대로 화면·전송 시 컨텍스트로 사용됨**.
- **답변 생성 시 이력 반영**: `sendMessage`에서 `conversation_history`를 구성할 때 **`conversations` 목록에서 해당 대화방의 메시지를 우선 사용** (`conversationForHistory = conversations.find(c => c.id === conversation.id)`). 재진입 후 첫 전송에서도 기존 스토리가 백엔드에 전달되며, `consistency_instruction`으로 이전 맥락 유지가 지시됨.
- **재생성·편집 경로**: 재생성 시에도 `conversations.find`로 해당 대화의 메시지를 우선해 `conversation_history` 구성. 편집 후 전송(스트리밍/비스트리밍)은 최근 20턴으로 통일했으며, 이력이 있으면 `consistency_instruction`을 함께 전달함.

---

## 6. 테스트 실행

- **단위 검증**: `extractResponseContent`와 비스트리밍 경로 연결 여부를 테스트에서 확인
  - 실행: `npm test -- --testPathPattern="ChatGPTInterface.test" --testNamePattern="답변 로직 연결" --watchAll=false`
  - 내용: `chatInputUtils.extractResponseContent`가 `{ data: { response: '...' } }` 형태를 파싱해 문자열을 반환하는지 검증
- **통합/수동**: 브라우저에서 입력 → 전송 후 질문·답변 표시는 수동 또는 E2E로 확인 권장

## 7. 실제 동작 확인 권장 사항

- 브라우저에서 **입력 → 전송(엔터/버튼)** 후 질문이 바로 나오는지 확인
- 백엔드(예: 5002) 기동 상태에서 **스트리밍/비스트리밍** 각각 답변이 대화창에 나오는지 확인
- 백엔드 응답 형식 변경 시 `extractResponseContent`가 기대하는 `response.data` 구조와 `streamChatMessage`의 SSE 프로토콜이 일치하는지 재점검

## 8. 다음 단계 (수동 확인 체크리스트)

| 순서 | 확인 항목 | 방법 |
|------|-----------|------|
| 1 | 프론트 기동 | `npm start` 후 대화 화면 접속 |
| 2 | 백엔드 기동 | API 서버(예: 5002) 실행 후 헬스 체크 통과 확인 |
| 3 | 질문 표시 | 입력창에 텍스트 입력 → Enter 또는 전송 버튼 → 대화창에 사용자 메시지가 바로 표시되는지 확인 |
| 4 | 답변 표시 | 이어서 "생각 중..." 또는 스트리밍 텍스트 후 최종 답변이 assistant 메시지로 표시되는지 확인 |
| 5 | 오류 시 | 네트워크 끊김 또는 API 오류 시 에러 메시지가 대화창에 표시되는지 확인 |
| 6 | quality 전달 | 네트워크 탭에서 /api/chat·/api/chat/stream 요청 body 확인 | `quality`(basic \| enhanced \| ultimate) 필드 포함 시 파이프라인·max_tokens 적용. [ANSWER_QUALITY_AND_SEARCH §5](./ANSWER_QUALITY_AND_SEARCH.md#5-확인-포인트) 참고 |
| 7 | **대화방 재진입·대화 이력** | (1) 한 대화에서 메시지 2~3턴 주고 받기 (2) 사이드바에서 다른 대화 선택 후 다시 해당 대화 클릭 (3) 새 질문 전송 | 이전 대화가 화면에 그대로 보이고, 전송 시 요청 body의 `context.conversation_history`에 이전 턴이 포함되는지 네트워크 탭에서 확인. 답변이 이전 맥락을 참고하는지 내용으로 확인. |
| 8 | **요구·질문에 맞는 유연한 생성** | (1) 짧은 질문 입력(예: "뭐야?") → 답변이 간결한지 (2) "상세히 비교해서 설명해줘" 입력 → 답변이 충실한지 (3) "사건조사 형식으로 요약해줘" / "생성로직에 맞게 정리해줘" → 해당 구조·순서로 답하는지 | 요청 body의 `context.adapt_answer_to_request` 포함 여부 확인. [CHAT_CONTEXT_CONTRACT](./CHAT_CONTEXT_CONTRACT.md) §1, [ANSWER_QUALITY_AND_SEARCH §2.5](./ANSWER_QUALITY_AND_SEARCH.md) 참고. |

**이어서 진행 시**: 위 1~8번 수동 확인 후, 배포 전 `npm run deploy:check` 실행 → `build/` 배포. 추가 검증은 `npm run test:coverage`, E2E(Playwright) 등 선택.

---

## 참고

- [ANSWER_QUALITY_AND_SEARCH](./ANSWER_QUALITY_AND_SEARCH.md) — 답변 품질·검색·자료 활용·품질 상향(§2.4)·adapt_answer_to_request(§2.5)·API quality 확인(§5)
- [CHAT_CONTEXT_CONTRACT](./CHAT_CONTEXT_CONTRACT.md) — 대화 API context 계약(키·진입점·확장 규칙)
- [CHAT_UI_TEST_SCENARIOS](./CHAT_UI_TEST_SCENARIOS.md) — 대화 UI·접근성·품질 수동 확인 시나리오(§14 품질·생성 능력)
