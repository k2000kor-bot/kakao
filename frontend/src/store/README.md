# Store (Redux)

## Slices

| Slice | 용도 |
|-------|------|
| **projectsSlice** | 프로젝트 목록·선택·CRUD |
| **sessionsSlice** | 세션·대화 목록·현재 세션 |
| **uiSlice** | UI 상태·모달·사이드바 |
| **authSlice** | 인증 상태 |
| **aiEngineSlice** | AI 엔진 설정 |
| **collaborationSlice** | 협업 상태 |

## 참조

- **index.ts** — store 생성·slices 통합
- **테스트**: projectsSlice, sessionsSlice, uiSlice — `npm run test -- --testPathPattern=store`

[docs/COMPONENT_ARCHITECTURE.md](../../docs/COMPONENT_ARCHITECTURE.md)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../../../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../../../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../../../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

