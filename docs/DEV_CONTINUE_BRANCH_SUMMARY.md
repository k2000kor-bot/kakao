# dev-continue-2026-01-20 브랜치 요약

컴포저 다중 요청·관계도·CI·handoff가 포함된 작업 브랜치입니다.

## 포함 기능

- **컴포저**: 질문·요구·요청 칩, 입력 미리보기, 5단계 UI, 다중 요청 체크리스트
- **순차 API** (옵트인): `REACT_APP_COMPOSER_SEQUENTIAL_MULTI_REQUEST` (+ `..._STREAM`)
- **다단계** (옵트인): `REACT_APP_COMPOSER_MULTI_STEP_MULTI_REQUEST`
- **관계도**: `ConversationGraphView`, handoff, Jest 169+, E2E 12, 백엔드 API

## 검증 (로컬, 2026-05 통과)

```bash
npm run verify:pre-deploy          # Jest만
npm run verify:final               # 빌드 + chat-pipeline + composer
npm run verify:full-stack-local    # 서버 :3000 + :5002 기동 후 전체
```

## Push

```bash
npm run check:push-ready
PUSH_REMOTE_URL=git@github.com:k2000kor/kakao.git npm run push:dev-continue
```

- `k2000kor/kakao-frontend` — GitHub에 없음
- `k2000kor/kakao` — `k2000kor-bot`에 **Collaborator Write** 필요

## 이관 (push 없이)

- Bundle: `/Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-05-19.bundle`
- Patches: `/Users/a0/kakao-frontend/patches-dev-continue-2026-05-19/` (19개)
- `bash scripts/apply-dev-continue-patches.sh <patch-dir>`
- `bash scripts/verify-push-block-artifacts.sh`

## PR 초안

[PR_COMPOSER_GRAPH_DRAFT.md](./PR_COMPOSER_GRAPH_DRAFT.md)
