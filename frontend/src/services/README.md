# Services (API·비즈니스 로직)

## 주요 서비스 (일반 대화·프로젝트)

| 서비스 | 용도 |
|--------|------|
| **projectService** | 프로젝트 CRUD, 세션·대화 관리 |
| **chatGPTProjectService** | 프로젝트 대화·세션 연동 (`/projects/:id`) |
| **chatService** | 대화 메시지 CRUD |
| **streamingClient** | 스트리밍 응답 (streamChatMessage) |
| **unifiedAPI** | /api/chat, /api/unified/chat 호출 |

## 기타

- **generationPromptBuilder** — 통합 생성 프롬프트·컨텍스트
- **notebookLLMStreamingService** — 노트북 LLM 스트리밍
- **qwenTtsService** — 목소리 생성(TTS)

**문자열 정규화**: 대화·스트리밍 등에서 사용자/응답 조각을 다룰 때는 **`../utils/chatInputUtils`** 의 **`coerceTrimmedString`** / **`coerceTrimmedEnd`** 를 사용합니다(원시 `.trim()`은 유틸 구현부만). 가이드: [docs/guides/RESPONSE_CLEANING.md](../../docs/guides/RESPONSE_CLEANING.md).

상세: [docs/COMPONENT_ARCHITECTURE.md](../../docs/COMPONENT_ARCHITECTURE.md) §5. API 경로: `src/config/api.ts`.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

