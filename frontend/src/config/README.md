# Config (설정)

## 파일

| 파일 | 용도 |
|------|------|
| **routes.ts** | 라우트 정의, getPageTitle, VOICE_GENERATION_PATH, allAppPaths |
| **api.ts** | API_BASE_URL, WS_BASE_URL, API_ENDPOINTS |

## 참조

- E2E 경로: `e2e/paths.ts` (routes와 동기화)
- [docs/DEVELOPMENT_CONTINUITY.md](../../docs/DEVELOPMENT_CONTINUITY.md)
- 대화 입력 문자열 정규화는 라우트가 아니라 UI·서비스에서 처리: `src/utils/chatInputUtils.ts`, [guides/RESPONSE_CLEANING.md](../../docs/guides/RESPONSE_CLEANING.md)
