# Constants

## testIds.ts

data-testid 상수 단일 소스. E2E(e2e/testIds.ts)와 컴포넌트에서 공유.

- **TEST_IDS** — 프로젝트·대화·메시지·페이지별 등 data-testid 문자열
- **사용처**: ProjectEditModal, ChatGPTInterface, e2e/testIds.ts (re-export·byTestId·byTestIdPrefix)
- **추가 시**: src/constants/testIds.ts·e2e/README.md 테이블 동기화

[docs/DEVELOPMENT_CONTINUITY.md](../../docs/DEVELOPMENT_CONTINUITY.md) §1, §3 체크리스트 참조.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../../../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../../../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../../../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

