# PR 초안 — composer multi-request + conversation graph

**브랜치**: `dev-continue-2026-01-20`  
**HEAD**: `git rev-parse --short HEAD` · `npm run pr:composer-graph-url` (push 직전 `npm run refresh:handoff-artifacts`)  
**베이스**: `main` (또는 팀 기본 브랜치)  
**제목 제안**: `feat: 컴포저 순차 생성·관계도 정리 답변(합성·2-pass)·handoff`

**Compare URL** (push 후):  
`https://github.com/k2000kor/kakao/compare/main...dev-continue-2026-01-20?expand=1`

## Summary

- 컴포저 다중 요청 UI(질문·요구·요청 칩, 입력 미리보기, 5단계 UI, 체크리스트)
- 옵트인 순차 API(`REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST` / `..._STREAM`) — 전송·재생성·편집 공통
- 옵트인 다단계 응답(`REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST`)
- **Composer Oversight Council v2**·답변 **자가 개발** 루프(전송·재생성·편집 공통) — `03bf9a96e`
- **재생성 E2E**: Ultimate(+Council)·`/agents` 스트림(ChatGPTInterface) — CI `composer-regenerate-e2e`
- 대화 관계도 뷰·handoff·Jest/E2E·CI jobs (`composer-pipeline`, `conversation-graph`, E2E)
- **관계도 정리된 생성 답변**: 결정론적 표·Mermaid + LLM 해석 합성, 로컬 학습 힌트, 2-pass(개요→보고서), 패널 UI 토글

## Test plan

- [x] `npm run verify:pre-deploy`
- [x] `npm run verify:final`
- [x] `npm run verify:conversation-graph:unit` (관계도 Jest + 백엔드 pytest)
- [x] `ConversationGraphView.test.tsx` (43 tests)
- [x] `npm run verify:handoff-artifacts` (bundle tip = 브랜치 HEAD; push 직전 `npm run refresh:handoff-artifacts`)
- [x] `HANDOFF_REFRESH=1 npm run maintain:push-block` (사이드바·컴포저 회귀)
- [x] `npm run verify:conversation-graph-api` (upload·relationship-graph)
- [x] `npm run test:e2e:conversation-graph:chromium` (13 passed, 합성·2-pass 포함)
- [x] `npm run verify:composer-pipeline` (19 suites, 147 tests)
- [x] `npm run test:e2e:composer-regenerate:ci` (2 passed, 파일분석 skip)
- [x] `npm run test:e2e:composer-pipeline:all` (에이전트·다중요청·재생성)
- [x] `npm run test:e2e:pipelines:all` (컴포저 묶음 + 관계도 13)
- [x] 백엔드 `pytest tests/test_composer_oversight_*.py tests/test_composer_self_develop_hint.py` (10 passed)
- [x] `npm run verify:conversation-graph` (= unit + E2E)
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

일괄: `npm run pr:prepare` (preflight + 본문 export + URL) · 점검: `npm run ship:preflight` · [PUSH_NEXT_STEPS.md](./PUSH_NEXT_STEPS.md)

```bash
npm run check:push-ready
npm run refresh:handoff-artifacts   # 커밋 직후라면
PUSH_REMOTE_URL=git@github.com:<owner>/<repo>.git npm run push:dev-continue
```

PR 본문: `npm run pr:composer-graph-body` · Compare: `npm run pr:open-compare` (macOS)

관계도 답변만 패치 이관: `npm run export:graph-answer-patches`

**로컬 재검증 (2026-05-20)**

- [x] `npm run ship:preflight` (handoff + 관계도 유닛)
- [x] `verify:composer-pipeline` — 19 suites, 147 tests
- [x] E2E 관계도 13 (`test:e2e:conversation-graph:chromium`)
- [ ] push — `k2000kor-bot` Write 필요 ([Collaborator](https://github.com/k2000kor/kakao/settings/access))
