# dev-continue 이어하기 체크리스트

- [x] `testHelpers.tsx`에 `withProcessEnv`·`withProcessEnvAsync`·`installJestDomQuietNetworkForTests` 복구
- [x] `npm run test:composer-pipeline` 통과
- [x] `npm run local:verify` 통과
- [x] `npx tsc --noEmit` 통과
- [x] 커밋·push (`76d4b607f`)
- [x] `npm run ship:preflight` · `npm run build` · `test:conversation-graph` 226 passed
- [x] `npm run refresh:handoff-artifacts` — bundle tip `f98f0a3a2` · 227 patches · verify OK
- [ ] PR 생성 — `.env.local` `KAKAO_BOT_PAT` 또는 `gh auth login` 후 `npm run pr:create` (또는 브라우저 수동)
