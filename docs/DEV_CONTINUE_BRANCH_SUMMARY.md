# dev-continue-2026-01-20 브랜치 요약

컴포저 다중 요청·관계도·CI·handoff가 포함된 작업 브랜치입니다.

## 포함 기능

- **컴포저**: 질문·요구·요청 칩, 입력 미리보기, 5단계 UI, 다중 요청 체크리스트
- **순차 API** (옵트인): `REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST` (+ `..._STREAM`)
- **다단계** (옵트인): `REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST`
- **관계도**: `ConversationGraphView`, handoff, **정리된 답변 합성**(표·Mermaid+LLM), 2-pass·학습, Jest 200+, E2E 13, 백엔드 15
- **Composer Council**·자가 개발·재생성 E2E (별도 env)

## 검증 (로컬, 2026-05 통과)

```bash
npm run ship:preflight
npm run verify:final
npm run verify:pre-deploy
npm run test:e2e:pipelines:all           # 컴포저 3 + 관계도 13 (E2E_AGENTS_COMPOSER_PIPELINE=1)
npm run pr:prepare
```

최근 (2026-05-20): `verify:final` · `test:e2e:pipelines:all` · `npm run build` · HEAD `27932b48d` (`npm run handoff:info`).

## Push / PR

```bash
npm run push:next-steps
npm run check:push-ready
PUSH_REMOTE_URL=git@github.com:k2000kor/kakao.git npm run push:dev-continue
npm run pr:open-compare
npm run pr:copy-body
```

- `k2000kor/kakao-frontend` — GitHub에 없음
- `k2000kor/kakao` — `k2000kor-bot`에 **Collaborator Write** 필요

## 이관 (push 없이)

- Bundle: `/Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-05-19.bundle`
- Patches: `/Users/a0/kakao-frontend/patches-dev-continue-2026-05-19/` (`bc4451251..HEAD`, `npm run refresh:handoff-artifacts`로 동기화)
- `bash scripts/apply-dev-continue-patches.sh <patch-dir>`
- `bash scripts/verify-push-block-artifacts.sh` (bundle tip = 브랜치 HEAD)
- `npm run refresh:handoff-artifacts` (커밋 후 bundle·patch 재생성)

## PR 초안

[PR_COMPOSER_GRAPH_DRAFT.md](./PR_COMPOSER_GRAPH_DRAFT.md) · `npm run pr:composer-graph-body`

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
