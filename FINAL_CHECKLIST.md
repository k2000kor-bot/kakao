# 최종 체크리스트 (루트 안내)

배포 직전 풀 스택 검증 절차·표·명령은 **[docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md)** 를 따릅니다.

- **`npm run verify:final`** — `scripts/final-verify.sh` (`check:test-imports` 이후 빌드·접속·API·통합·대화 Jest·UI 스모크)
- **`npm run verify:final:sequential-smoke`** — UI 스모크 마지막 구간을 순차 Jest로 실행할 때

**사이드바·대화 맥락 회귀(권장)**: `npm run test:sidebar-context` — [TESTING_GUIDE.md](./TESTING_GUIDE.md) · 원격 `git push` 막힘 [docs/PUSH_BLOCK_HANDOFF.md](./docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`)

**완성도 마무리**: [docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md) — `npm run verify:completion`

루트의 이 파일은 위 `docs/` 문서로 연결하는 **스텁**입니다. 예전 루트에 있던 항목별 완료 체크리스트 초안은 정식 절차가 `docs/FINAL_CHECKLIST.md`로 통합되었고, 필요하면 git 히스토리에서 확인할 수 있습니다.
