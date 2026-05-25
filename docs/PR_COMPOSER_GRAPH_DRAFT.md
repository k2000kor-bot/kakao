# PR — feat/chat-composer-context-graph

**브랜치**: `feat/chat-composer-context-graph`  
**베이스**: `main`  
**제목**: `fix(chat): 대화 삭제·초기화 후 첨부 맥락 + conversation graph handoff`

**Compare**: https://github.com/k2000kor-bot/kakao/compare/main...feat/chat-composer-context-graph?expand=1

## Summary

- **대화 삭제·초기화 후 첨부+짧은 지시** 시 API에 짧은 지시만 전달되던 문제 수정
  - `composerSimpleQuery` fast path: 첨부·스레드 맥락이 있으면 비활성
  - `flushSync` 직후 stale `conversations` 클로저로 이력이 짧게 구성되던 문제 → `pickComposerHistoryMessages`로 보강
  - 삭제·초기화·대화 전환 시 `pendingConversationGraphContextRef`·첨부 상태 정리
  - 재생성·편집 경로에도 동일 규칙 적용
- **Conversation graph**: handoff 배너·sparse 폴백·재생성/편집 E2E·문서(§14.10 등)
- **UI**: 웰컴·컴포저 dock·사이드바「대화」레이아웃 통일
- **Composer**: graph 맥락에서 순차·다중 요청 전송 차단
- **Backend**: YouTube shorts/embed URL 추출·workspace intent `project_create` 억제 (활성 프로젝트 시)

## Commits (8)

1. `fix(chat)` — 삭제·초기화 후 첨부 맥락 API 반영
2. `feat(conversation-graph)` — sparse 폴백·handoff·E2E
3. `feat(ui)` — 웰컴·dock·「대화」
4. `fix(composer)` — graph 순차 전송 차단
5. `docs` — manifest·verify-completion
6. `feat(backend)` — user_question_hint, response_enhancer, google_drive_auth_api
7. `fix(backend)` — YouTube·workspace intent + pytest
8. `fix(e2e)` — graph 재생성 검증 안정화 (composer 스텁·API 호출 기준)

## Test plan

- [x] `npm run verify:pre-deploy`
- [x] `npm run verify:composer-pipeline` (152 passed)
- [x] `npm run test:conversation-graph:chat-handoff` (17 passed)
- [x] `npm run test:composer-context-after-clear` (5 passed)
- [x] `E2E_COMPOSER_ATTACH_CONTEXT=1 npm run test:e2e:composer-attach-context`
- [x] `E2E_GRAPH_CHAT_REGENERATE=1 npm run test:e2e:graph-chat-regenerate`
- [x] `E2E_SERVER_READY=1 npm run test:e2e:composer-pipeline:all`
- [x] backend `pytest tests/test_workspace_intent_router.py tests/test_youtube_video_id_extract.py`

## 수동 확인 (선택)

- [ ] 대화 삭제 또는 초기화 → txt/csv 첨부 → 「위 내용 기준으로 요약해줘」 전송 → 답변이 첨부 본문을 반영하는지
- [ ] `/chat` CSV 첨부 → 「관계도를 만들어줘」 → handoff 배너·답변 패널
