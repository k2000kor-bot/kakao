# PR #3 — feat/chat-composer-context-graph (2026-05-26)

**PR:** https://github.com/k2000kor-bot/kakao/pull/3 · **open** (Draft)  
**브랜치:** `feat/chat-composer-context-graph` → `main`  
**HEAD:** `6e37cd1e5` (+ CI docker/e2e push 예정)

## Summary

- 대화 삭제·초기화 후 첨부+짧은 지시 맥락 API 반영
- conversation graph handoff·sparse 폴백·E2E
- 컴포저 dock·UI · backend YouTube/workspace intent

## CI (`6e37cd1e5`)

| Job | 상태 |
|-----|------|
| 코드 품질 검사 · 컴poser Jest · 관계도 · 백엔드 · 프론트 빌드 | ✅ |
| Test Coverage Report | ✅ |
| 컴poser·재생성·관계도 E2E (별도 job) | ✅ |
| E2E Tests (e2e-tests smoke) | 실행 중 |
| Docker 이미지 빌드 | PR push 실패 → `push: false` on PR 수정 예정 |

## 수동 (머지 전)

1. **Ready for review** (Draft 해제)
2. 본문: [PR_COMPOSER_GRAPH_DRAFT.md](./PR_COMPOSER_GRAPH_DRAFT.md)

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md).
