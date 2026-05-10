# Types

## 주요 타입

| 파일 | 용도 |
|------|------|
| **project.ts** | Project 인터페이스 |
| **chat.ts** | Message, ChatMessage |
| **conversation.ts** | Message (conversation) |
| **ai.ts** | AI 관련 타입 |
| **knowledge.ts** | 지식 베이스 |
| **routes.ts** | 라우트 타입 |

## 참조

- **index.ts** — 타입 re-export
- [docs/COMPONENT_ARCHITECTURE.md](../../docs/COMPONENT_ARCHITECTURE.md)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../../../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../../../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../../../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

