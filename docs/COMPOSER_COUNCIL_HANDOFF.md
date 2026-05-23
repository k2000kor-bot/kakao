# Composer Council·자가 개발·재생성 — 이관 가이드

`git push`가 막힌 환경에서 **기능 커밋만** 다른 클론/머신에 옮길 때 사용합니다.

## 포함 범위

| 커밋 | 내용 |
|------|------|
| `03bf9a96e` | Council·자가 개발 파이프라인, 재생성 E2E, `ChatGPTInterface` testid |
| `820897aea` | PR 초안·문서 갱신 |

전체 브랜치 이관은 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) · bundle 참고.

## 방법 A — 패치만 적용 (권장)

```bash
cd kakao-frontend   # package.json 있는 루트

# 패치 추출 (이 머신)
bash scripts/export-composer-council-patches.sh

# 다른 머신/브랜치에서 (충돌 시 git am --abort 후 수동 merge)
git am /path/to/patches-composer-council-only/*.patch
```

시리즈 내 파일명: `patches-dev-continue-2026-05-19/0031-feat-composer-Council-E2E.patch`, `0032-docs-PR-Council-E2E.patch`

## 방법 B — bundle에서 브랜치 전체

```bash
git clone /Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-05-19.bundle kakao-frontend
cd kakao-frontend
git checkout dev-continue-2026-01-20
```

## 검증

```bash
npm run sync:frontend-src
npm run verify:composer-pipeline
cd backend && pytest tests/test_composer_oversight_*.py tests/test_composer_self_develop_hint.py -q
E2E_SERVER_READY=1 npm run test:e2e:composer-regenerate   # Dev :3000 선기동
```

## 환경 변수 (선택)

```env
# REACT_APP_COMPOSER_ANSWER_SELF_DEVELOP=0   # 자가 개발 루프만 끔 (Council 유지)
```

## Push (권한 있는 계정)

```bash
npm run check:push-ready
HANDOFF_REFRESH=1 npm run maintain:push-block
PUSH_REMOTE_URL=git@github.com:k2000kor/kakao.git npm run push:dev-continue
```

PR 본문: `docs/PR_COMPOSER_GRAPH_DRAFT.md` · `npm run pr:composer-graph-body`

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
