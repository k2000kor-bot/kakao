# PR 초안 — composer multi-request + conversation graph

**브랜치**: `dev-continue-2026-01-20`  
**HEAD**: `08a35b227` · `npm run pr:composer-graph-url` (push·handoff 갱신 완료)  
**베이스**: `main` (또는 팀 기본 브랜치)  
**제목 제안**: `feat: 관계도 문서 형식별 답변·컴포저 순차 생성·handoff`

**Compare URL** (push 후):  
`https://github.com/k2000kor-bot/kakao/compare/main...dev-continue-2026-01-20?expand=1`

## Summary

- 컴포저 다중 요청 UI(질문·요구·요청 칩, 입력 미리보기, 5단계 UI, 체크리스트)
- 옵트인 순차 API(`REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST` / `..._STREAM`) — 전송·재생성·편집 공통
- 옵트인 다단계 응답(`REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST`)
- **Composer Oversight Council v2**·답변 **자가 개발** 루프(전송·재생성·편집 공통) — `03bf9a96e`
- **재생성 E2E**: Ultimate(+Council)·`/agents` 스트림(ChatGPTInterface) — CI `composer-regenerate-e2e`
- 대화 관계도 뷰·handoff·Jest/E2E·CI jobs (`composer-pipeline`, `conversation-graph`, E2E)
- **관계도 정리된 생성 답변**: 결정론적 표·Mermaid + LLM 해석 합성, 2-pass(개요→보고서), 패널 UI 토글
- **문서 형식별 답변**: 보고서·엔티티·인텔리전스·논문·문학·회의록·FAQ·백서 등 형식 추론·고정·내장 골격·로컬 학습·형식별 후처리 — [CONVERSATION_GRAPH_ANSWER_FORMATS.md](./CONVERSATION_GRAPH_ANSWER_FORMATS.md)
- **관계도 연속 질문·답변**: 스크롤 기록·이전 맥락 API 전달 (`a5fb640b6`)
- **한글 보고서 prose**: 글 유형 지시·시스템 태그 제거 후처리
- **IME Enter**: 채팅·관계도 입력창 한글 조합 중 Enter 잔여 글자 수정
- **UI 간결화**: 관계도·채팅/프로젝트 상세 버튼 라벨·`bw-tool-view` 상세 레이아웃(툴바 wrap·패널 너비)
- **카카오톡 CSV 업로드**: 정규화 TXT·미리보기·대용량 샘플링·`/chat` handoff state 키 (`cf710e93d`)

## Test plan

- [x] `npm run verify:pre-deploy`
- [x] `npm run verify:final`
- [x] `npm run verify:conversation-graph:unit` (관계도 Jest + 백엔드 pytest)
- [x] `ConversationGraphView.test.tsx` · `npm run test:conversation-graph` (205 tests, 카카오 CSV 업로드 포함)
- [x] `npm run verify:handoff-artifacts` (bundle tip = 브랜치 HEAD; push 직전 `npm run refresh:handoff-artifacts`)
- [x] `HANDOFF_REFRESH=1 npm run maintain:push-block` (사이드바·컴포저 회귀)
- [x] `npm run verify:conversation-graph-api` (upload·relationship-graph·`conversation_graph_analysis` chat 스모크)
- [x] `npm run test:e2e:conversation-graph:chromium` (13 passed, 문서 형식·E2E 클릭 안정화 포함)
- [x] `npm run verify:composer-pipeline` (19 suites, 147 tests)
- [x] `npm run test:e2e:composer-regenerate:ci` (2 passed, 1 skip, 2026-05-20 재확인)
- [x] `npm run test:e2e:composer-pipeline:all` (에이전트·다중요청·재생성)
- [x] `npm run test:e2e:pipelines:all` (컴포저 묶음 + 관계도 13)
- [x] 백엔드 `pytest tests/test_composer_oversight_*.py tests/test_composer_self_develop_hint.py` (10 passed)
- [x] `npm run verify:conversation-graph` (= unit + E2E, 2026-05-21 재확인 13 passed)
- [ ] 수동: `.env.local` 순차/multi-step 플래그 후 `1.\n2.` 전송·재생성·편집

## Env (선택)

```env
REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST=true
REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST_STREAM=true
REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST=true
# REACT_APP_COMPOSER_ANSWER_SELF_DEVELOP=0   # 자가 개발 루프만 끄기 (Council 유지)

# 관계도 답변 (선택 — [CONVERSATION_GRAPH.md](./CONVERSATION_GRAPH.md))
REACT_APP_GRAPH_ANSWER_SELF_IMPROVE=1
REACT_APP_GRAPH_ANSWER_TWO_PASS=0
```

## Push / PR

일괄: `npm run pr:prepare` · 릴리스 점검: `npm run ship:release-check` · [PUSH_NEXT_STEPS.md](./PUSH_NEXT_STEPS.md)

```bash
npm run check:push-ready
npm run refresh:handoff-artifacts   # 커밋 직후라면
npm run push:dev-continue           # 기본: k2000kor-bot/kakao
npm run pr:create                   # PR 폼 열기 (quick_pull)
```

PR 본문: `npm run pr:composer-graph-body` · Compare: `npm run pr:open-compare` (macOS)

관계도 답변만 패치 이관: `npm run export:graph-answer-patches`

**로컬 재검증 (2026-05-20)**

- [x] `npm run ship:preflight` (handoff + 관계도 유닛)
- [x] `verify:composer-pipeline` — 19 suites, 147 tests
- [x] E2E 관계도 13 (`test:e2e:conversation-graph:chromium`)
- [x] `npx tsc --noEmit` · `680071efd` TS 수정 (재생성 `messageIndex`, `agentRouteId`, `pipelineExtras`)
- [x] `npm run verify:final` (빌드·API·integration·chat-pipeline·composer, 2026-05-20)
- [x] `npm run test:e2e:pipelines:all` (컴포저 3 + 관계도 13, Council 스텁 수정 후)
- [x] `npm run verify:pre-deploy` (sidebar + composer 147 + 관계도 unit, 2026-05-20)
- [x] `npm run build` — 프로덕션 빌드 성공 (TS·번들)
- [x] `npm run pr:prepare` (preflight + PR 본문 export)
- [x] `npm run local:verify` · `npm run ship:preflight` (HEAD `88378ad1a`)
- [x] 관계도 답변 연속 턴·IME 단위 테스트
- [x] `npm run local:verify` · 관계도/채팅 UI 간결화 (`74fdc9b60`, `01d2b15d9`)
- [x] push — `k2000kor-bot/kakao` (`5edeecfe6`, 대용량 blob 히스토리 정리 후 push)
- [x] `main` 동기화 — `npm run promote:main` (`9ae459681`, typecheck·Lazy Chat·API `analysis_mode`)
- [x] handoff — `npm run refresh:handoff-artifacts` (195 patches, bundle tip `9ae459681`)
- [x] `npm run verify:conversation-graph:unit` — Jest 205 + pytest 16 (2026-05-21)
- [ ] default branch → `main` — `npm run repo:open-default-branch` 또는 `KAKAO_BOT_PAT=... npm run repo:set-default-main` (현재: `dev-continue-2026-01-20`)
- [x] push — `d19c66377` feat(graph-answer) 문서 형식별 답변 (2026-05-21)
- [ ] PR 생성 — [PR_CREATE_NOW.md](./PR_CREATE_NOW.md) · [PR new](https://github.com/k2000kor-bot/kakao/pull/new?base=main&head=dev-continue-2026-01-20)
