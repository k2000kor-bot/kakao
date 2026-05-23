# Push / 배포 상태 (k2000kor-bot/kakao)

**브랜치**: `main` · **HEAD**: `f8afccda0` (`main` = `dev-continue-2026-01-20`)

## 완료 (2026-05-23)

| 항목 | 상태 |
|------|------|
| 저장소 | **k2000kor-bot/kakao** |
| SSH | **k2000kor-bot** |
| PR #2 merge | ✅ [feat: 관계도·컴포저·handoff](https://github.com/k2000kor-bot/kakao/pull/2) |
| `main` 동기화 | ✅ `origin/main` = `origin/dev-continue-2026-01-20` |
| Handoff | `npm run verify:handoff-artifacts` (bundle tip = branch tip, patch series 0) |
| merge 후 문서 | `docs/PR_CREATE_NOW.md` 갱신됨 |
| pre-deploy | ✅ `npm run verify:pre-deploy` (sidebar-context·composer·관계도 unit) |

## GitHub default branch (권장)

현재 API 기준 default: **`dev-continue-2026-01-20`** → **`main`** 권장.

**1차 (자동):** `main` push 시 [Set default branch to main](https://github.com/k2000kor-bot/kakao/actions/workflows/set-default-branch-main.yml) 워크플로가 `GITHUB_TOKEN`으로 시도합니다.

**실패 시** (KAKAO_BOT_PAT 없음 · Actions workflow permissions read-only):

1. **가장 빠름 (30초):** https://github.com/k2000kor-bot/kakao/settings/branches → Default branch → **`main`**
2. Actions write 권한: `npm run repo:open-actions-settings` → Workflow permissions **Read and write**
3. Secret 등록: `npm run repo:open-actions-secrets` → `KAKAO_BOT_PAT` (admin PAT) → `npm run repo:dispatch-set-default-main`

## 로컬 검증

```bash
npm run verify:handoff-artifacts
npm run verify:pre-deploy          # Jest·관계도 unit (~1분)
npm run verify:final               # 빌드·API·통합 (서버 필요)
# 서버 :3000 기동 후
npm run test:e2e:pipelines:all
```

## PR (선택)

`main`과 이미 동기화됐으면 PR diff 없음. 새 작업은 브랜치 따서 PR.

- 수동: `npm run pr:open-new`
- Actions: [PR_CREATE_NOW.md](./PR_CREATE_NOW.md) (Settings PR 권한 필요)

## 명령 요약

```bash
npm run check:push-ready
npm run push:dev-continue
npm run promote:main              # CONFIRM=1 — main ← dev-continue
npm run pr:status
npm run handoff:info
```

관련: [PR_COMPOSER_GRAPH_DRAFT.md](./PR_COMPOSER_GRAPH_DRAFT.md) · [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
