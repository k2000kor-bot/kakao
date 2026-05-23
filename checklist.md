# dev-continue 이어하기 체크리스트

- [x] `testHelpers.tsx`에 `withProcessEnv`·`withProcessEnvAsync`·`installJestDomQuietNetworkForTests` 복구
- [x] `npm run test:composer-pipeline` 통과
- [x] `npm run local:verify` 통과
- [x] `npx tsc --noEmit` 통과
- [x] 커밋·push (`76d4b607f`)
- [x] `npm run ship:preflight` · `npm run build` · `test:conversation-graph` 226 passed
- [ ] PR 생성 (수동 또는 `KAKAO_BOT_PAT` / `gh auth login`)
