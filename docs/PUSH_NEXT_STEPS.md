# Push / 배포 상태 (k2000kor-bot/kakao)

**브랜치**: `dev-continue-2026-01-20` · **HEAD**: `git rev-parse --short HEAD`

## 완료 (2026-05)

| 항목 | 상태 |
|------|------|
| 저장소 | **k2000kor-bot/kakao** |
| SSH | **k2000kor-bot** |
| `dev-continue-2026-01-20` push | ✅ |
| `main` 동기화 | ✅ `npm run promote:main` (`main` = `dev-continue` tip) |
| Handoff | `npm run verify:handoff-artifacts` |

## GitHub default branch (권장)

현재 default가 `dev-continue-2026-01-20`이면:

https://github.com/k2000kor-bot/kakao/settings/branches → Default branch → **`main`**

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
