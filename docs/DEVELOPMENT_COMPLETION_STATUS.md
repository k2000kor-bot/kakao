# 개발 마무리 현황 (AI Workspace Minimal UI · 생성형 메뉴)

**마무리 요약**: 좌측 사이드바 4개 영역(검색·새대화 / 프로젝트 / 최근 대화 / 사용자), 프롬프트 기반 프로젝트 생성(의도 감지 → 도구 실행 → `workspace_tool_result`·프론트 갱신), 서비스명 CORBU.AI 통일, API·문서 반영 완료. 검증은 §5 체크리스트 참고.

지금까지 진행한 **AI Workspace Minimal UI** 및 **의도 감지 → 도구 실행** 흐름의 마무리 개발 현황입니다.

---

## 1. 완료된 항목

### 1.1 좌측 사이드바 4개 영역 (Minimal UI)

| 영역 | 내용 | 구현 위치 |
|------|------|-----------|
| **[1] 상단 검색 및 새대화** | 통합 검색 입력 + 새대화 버튼 + 사이드바 토글. 정렬 바·새 프로젝트 버튼 제거 | `ChatGPTInterface.tsx` (`.sidebar-entry`) |
| **[2] 프로젝트 / 폴더** | 프로젝트 목록·선택·편집/삭제만 노출. "새 프로젝트 만들기" 버튼 제거, 빈 상태 안내 문구 | 동일 |
| **[3] 최근 대화** | 섹션 제목 "최근 대화", 리스트·고정만 노출. "새 일반 대화"·대화 검색 입력 제거 (상단 통합 검색 사용) | 동일 |
| **[4] 사용자 계정** | 하단 테마·PRO·저장소·온라인 상태를 사용자 영역으로 그룹화 | 동일 (`.sidebar-user-area`) |

- 통합 검색: `sidebarUnifiedSearch` 상태로 프로젝트·대화 목록 동시 필터.
- 문서: [AI_WORKSPACE_MINIMAL_UI.md](./AI_WORKSPACE_MINIMAL_UI.md).

### 1.2 의도 감지 및 기능 라우팅

| 구성요소 | 설명 | 경로 |
|----------|------|------|
| **의도 감지** | 메시지 → intent, confidence, slots, suggested_tool | `backend/api/workspace_intent_router.py` |
| **도구 실행** | project_create, new_conversation, 그 외 스텁 메시지 | `backend/api/workspace_tool_executor.py` |
| **대화 연동** | `generate_chat_response()` 진입 시 감지·실행·조기 반환, `out_metadata`로 결과 전달 | `backend/api/unified_chat_api.py` |

- 지원 인텐트: conversation_search, project_create, file_upload, report_generate, conversation_summary, data_export, new_conversation.
- **project_create**: 실제 프로젝트 생성 API 호출 후 사용자 문구 반환.
- 문서: [WORKSPACE_INTENT_ROUTING.md](./WORKSPACE_INTENT_ROUTING.md).

### 1.3 대화 응답 및 프론트 반영

| 구분 | 내용 |
|------|------|
| **비스트리밍** | `/api/chat` 응답에 `workspace_tool_result` 포함. 도구 실행 시 검증/향상 생략 후 즉시 반환 |
| **스트리밍** | `generate_chat_response(..., out_metadata=stream_metadata)` 호출, 종료 이벤트 `metadata.workspace_tool_result` 포함 |
| **프론트** | 비스트리밍·스트리밍 공통: `workspace_tool_result.tool === 'project_create'` 이면 프로젝트 목록 재조회, 새 프로젝트 선택, 토스트 표시 |

- 스트리밍 클라이언트: `onComplete(fullText, metadata?)` 시그니처로 메타데이터 전달 ([streamingClient.ts](../src/utils/streamingClient.ts)).

### 1.4 공동입력창 (Shared Input Bar)

| 요소 | 동작 |
|------|------|
| **지구본 아이콘** | 클릭 시 `/웹검색` 슬래시 커맨드 삽입 (웹 검색 모드) |
| **A 아이콘** | 클릭 시 "응답 스타일·포맷은 상단 생성 모드에서 설정할 수 있습니다" 토스트 표시 |
| **+ 메뉴** | 대화 파일 첨부, 질문+요구 템플릿, 슬래시 커맨드 목록 |
| **Auto / 마이크 / 전송** | Auto 드롭다운(옵션), 마이크(준비 중), 전송(↑) |

- 구현: `ChatGPTInterface.tsx` (대화·웰컴 입력 폼), `ChatGPTInterface.css` (`.bw-shared-input`). 레이아웃·설명: [CHAT_UI_LAYOUT_SAMPLE.md](./CHAT_UI_LAYOUT_SAMPLE.md).

### 1.5 문서화

- [AI_WORKSPACE_MINIMAL_UI.md](./AI_WORKSPACE_MINIMAL_UI.md) — 4개 영역, 요청 시 생성 기능, 구현 현황.
- [WORKSPACE_INTENT_ROUTING.md](./WORKSPACE_INTENT_ROUTING.md) — 인텐트 정의, 구현 위치, 연동 방식.
- [GENERATIVE_MENU_ARCHITECTURE.md](./GENERATIVE_MENU_ARCHITECTURE.md) — LLM 기반 생성형 메뉴 아키텍처, 도구 레지스트리, 연동 지점.
- [AI_OS_MENU_STRUCTURE.md](./AI_OS_MENU_STRUCTURE.md) — ChatGPT 전체 UI 재설계 관점의 AI OS 메뉴 구조.
- [API.md](./API.md) — POST /api/chat 응답에 `workspace_tool_result` 및 스트리밍 메타데이터 설명 추가.

---

## 2. 사용 시나리오 (동작 확인용)

1. **프로젝트 생성 (프롬프트)**  
   대화에 "성수4지구 분석 프로젝트 만들어줘" 입력 → 의도 감지 → 프로젝트 생성 API 호출 → "프로젝트 '성수4지구 분석'이(가) 생성되었습니다. 사이드바에서 선택해 대화를 이어가세요." 응답 + 사이드바 프로젝트 목록 갱신 + 해당 프로젝트 선택 + 토스트.

2. **새 대화**  
   상단 "새대화" 또는 입력창 "이 주제로 새 분석 시작" → (후자) 안내 메시지 반환.

3. **검색**  
   상단 통합 검색에 키워드 입력 → 프로젝트·대화 목록 필터링.

---

## 3. 추후 확장 (선택)

- **conversation_search / report_generate / data_export** 등: 백엔드 API 연동 후 `workspace_tool_executor.py`에서 스텁 제거.
- **LLM 기반 의도 분류**: 패턴 대신 또는 보조로 LLM 호출해 인텐트·슬롯 추출.
- **자이그랩스·카톡 여론 분석**: 동일 4개 영역 + 도메인별 인텐트·도구 추가 ([GENERATIVE_MENU_ARCHITECTURE.md](./GENERATIVE_MENU_ARCHITECTURE.md) §6).

---

## 4. 관련 문서 요약

| 문서 | 용도 |
|------|------|
| [AI_WORKSPACE_MINIMAL_UI.md](./AI_WORKSPACE_MINIMAL_UI.md) | 4개 영역 설계·구현 현황 |
| [WORKSPACE_INTENT_ROUTING.md](./WORKSPACE_INTENT_ROUTING.md) | 의도·라우팅 스펙·구현 위치 |
| [GENERATIVE_MENU_ARCHITECTURE.md](./GENERATIVE_MENU_ARCHITECTURE.md) | 생성형 메뉴 아키텍처 |
| [AI_OS_MENU_STRUCTURE.md](./AI_OS_MENU_STRUCTURE.md) | AI OS 메뉴 구조 (전체 UI 관점) |
| [BASIC_FLOW_PRIORITY.md](./BASIC_FLOW_PRIORITY.md) | 기본 플로우·우선순위 |
| [CHAT_UI_LAYOUT_SAMPLE.md](./CHAT_UI_LAYOUT_SAMPLE.md) | 대화 UI 레이아웃 (샘플 기준) |

---

## 5. 마무리 검증 체크리스트

배포·전달 전 아래 항목으로 동작을 확인할 수 있습니다.

| # | 확인 항목 | 방법 |
|---|-----------|------|
| 1 | 상단 통합 검색 | 사이드바 상단 검색창에 키워드 입력 시 프로젝트·대화 목록 필터링되는지 확인 |
| 2 | 새대화 버튼 | "새대화" 클릭 시 새 대화가 시작되는지 확인 |
| 3 | 프로젝트 생성 (프롬프트) | 대화에 "OO 분석 프로젝트 만들어줘" 입력 후 프로젝트 생성·사이드바 갱신·토스트 확인 |
| 4 | 도구 실행 시 응답 형태 | 동일 요청 시 응답 JSON에 `workspace_tool_result` 포함 여부 확인 (선택) |
| 5 | 서비스명 표기 | 사용자 노출 문구에 "CORBU.AI"로 통일되어 있는지 확인 (디스클레이머·지침 안내 등) |

- **문서**: [API.md](./API.md) POST /api/chat, [BASIC_FLOW_PRIORITY.md](./BASIC_FLOW_PRIORITY.md), [AI_WORKSPACE_MINIMAL_UI.md](./AI_WORKSPACE_MINIMAL_UI.md) 참고.

이 문서는 위 기능들의 **마무리 개발 완료 시점** 기준 정리입니다.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
