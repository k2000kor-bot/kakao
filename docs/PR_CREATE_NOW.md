# PR 생성 — 지금 바로 (2026-05-23)

브랜치 `dev-continue-2026-01-20` · HEAD `f98f0a3a2` · ahead 30 · handoff 227 · `npm run pr:ready`

## 0. 로컬 서버

`docs/LOCAL_SERVER_START.md` — `cd kakao-frontend/kakao-frontend` 후 `npm run start:dev`

## 1. PR 생성 (수동, 1분)

```bash
npm run pr:ready
```

또는 수동:

1. 열기: https://github.com/k2000kor-bot/kakao/pull/new?base=main&head=dev-continue-2026-01-20
2. 제목: `feat: 관계도 문서 형식별 답변·컴포저 순차 생성·handoff`
3. 본문: `docs/PR_COMPOSER_GRAPH_DRAFT.md` 전체 복사·붙여넣기  
   (또는 `npm run pr:copy-body`)
4. **Create pull request** 클릭

## 2. GitHub Actions로 PR 생성 (권장)

**필수 설정 (한 번만):**

1. https://github.com/k2000kor-bot/kakao/settings/secrets/actions → **`KAKAO_BOT_PAT`** (repo 권한 PAT)
2. https://github.com/k2000kor-bot/kakao/settings/actions → Workflow permissions **Read and write** + **Allow GitHub Actions to create and approve pull requests** 체크

**실행:**

1. https://github.com/k2000kor-bot/kakao/actions/workflows/create-pr-to-main.yml
2. **Run workflow** (또는 `dev-continue-2026-01-20` push 시 자동 시도)

> 최근 Actions 실패 원인(확인됨): **「GitHub Actions is not permitted to create or approve pull requests」**  
> → 위 1·2 중 하나 필요. 워크플로는 실패 시에도 Summary에 수동 PR 링크를 남깁니다.  
> 로그: [Create PR to main](https://github.com/k2000kor-bot/kakao/actions/workflows/create-pr-to-main.yml)

## 3. 로컬 API (토큰 또는 gh)

```bash
# A) GitHub CLI (한 번만)
npm run pr:ensure-gh
gh auth login
npm run pr:create

# B) PAT (export 또는 .env.local — gitignore)
export GITHUB_TOKEN=<repo scope PAT>
# .env.local 예: KAKAO_BOT_PAT=ghp_...
PR_TITLE='feat: 관계도 문서 형식별 답변·컴포저 순차 생성·handoff' npm run pr:create
```

## 4. default branch → `main` (선택)

현재 default: `dev-continue-2026-01-20`

```bash
KAKAO_BOT_PAT=<admin PAT> npm run repo:set-default-main
# 또는 수동: https://github.com/k2000kor-bot/kakao/settings/branches
```

## 5. merge 후 로컬

```bash
git checkout main && git pull origin main
npm run sync:frontend-src
```

## 이번 PR 핵심 (graph-answer)

- 14종 문서 형식(보고서·엔티티·인텔리전스·논문·문학·FAQ·백서 등)
- 내장 골격 + 로컬 학습 + 형식 고정 UI + 형식별 후처리
- E2E 13 passed · `npm run verify:conversation-graph` 통과
- 상세: [CONVERSATION_GRAPH_ANSWER_FORMATS.md](./CONVERSATION_GRAPH_ANSWER_FORMATS.md)
