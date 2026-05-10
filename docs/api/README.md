# API 문서 (OpenAPI)

| 파일 | 설명 |
|------|------|
| [openapi-unified-chat.yaml](./openapi-unified-chat.yaml) | 통합 대화 `POST /api/chat`, SSE 스트림, 헬스, `llm-status` — [PRD §9](../architecture/GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md) |

미리보기: [GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md §9](../architecture/GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md) 의 Redocly 명령 참고.

**프론트 `message` 전처리**: [guides/RESPONSE_CLEANING.md](../guides/RESPONSE_CLEANING.md) (`coerceTrimmedString`). HTTP 계약 요약: [API.md](../API.md).

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

