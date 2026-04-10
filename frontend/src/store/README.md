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
