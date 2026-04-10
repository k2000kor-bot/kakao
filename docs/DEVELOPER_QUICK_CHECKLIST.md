# 개발자 빠른 체크리스트

통합 API(main.py) 기준으로 로컬 실행·테스트·API 확인을 빠르게 할 때 참고하세요.

---

## 1. 실행

| 서버 | 명령 | URL |
|------|------|-----|
| 백엔드 (통합 API) | **`npm run restart:backend`** (권장) 또는 `cd backend && python3 -m api.main` | http://localhost:5002 |
| 프론트엔드 | `npm start` | http://localhost:3000 |

접속 문제 시: [CONNECT.md](../CONNECT.md)

---

## 2. 테스트

| 대상 | 명령 | 기대 |
|------|------|------|
| 프론트 점검 (타입·린트) | `npm run dev:check:frontend` | pytest 없이 타입·ESLint만 검사 |
| 전체 dev:check | `npm run dev:check` | 백엔드 pytest + 타입 + 린트 (pytest 필요) |
| 마무리 검증 (한 번에) | `npm run verify:completion` | dev:check:frontend + P4 148 tests |
| 뷰·라우트 (20 suites) | `npm run test:views` | 105 tests (선택, 배포 전 권장) |
| 백엔드 API (main.py) | `cd backend && python3 -m pytest tests/test_main_api.py -v` | 약 66개 통과 |
| P4 서비스 (8 suites) | `npm run test:p4:services` | 148 tests |
| 대화 파이프라인 메타 (Jest) | `npm run test:frontend:chat-pipeline` | `chatInputUtils`·스트리밍·프롬프트 빌더·Genspark 패널. `chatInputUtils.ts` 수정 후 `npm run sync:frontend-chat-input-utils` 권장 |
| E2E (Playwright) | `npm run test:e2e` (서버 자동 기동) 또는 `npm run test:e2e:no-server` (서버 선실행 후) | Chromium 기준 69 passed, 6 skipped (대화·프로젝트·스트리밍 등) |

E2E에는 대화(/)·프로젝트(/projects) 및 구버전 경로 리다이렉트 검증이 포함됩니다. Playwright 브라우저 미설치 시 `npx playwright install` 실행 후 테스트.

상세: [CONNECT.md](../CONNECT.md) 7. 테스트 실행

---

## 3. API 확인 (curl)

백엔드(5002) 실행 후:

```bash
# 헬스
curl -s http://localhost:5002/api/health | head -c 200

# 기능 상태 (프론트 useApiStatus)
curl -s http://localhost:5002/api/status | head -c 200

# API 목록
curl -s http://localhost:5002/api | head -c 300

# 대화 (POST)
curl -s -X POST http://localhost:5002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"안녕하세요"}' | head -c 300

# 프로젝트 목록 (GET)
curl -s http://localhost:5002/api/projects | head -c 300
```

OpenAPI 문서: http://localhost:5002/api/docs

---

## 4. 주요 엔드포인트 (main.py)

- `GET /`, `GET /api`, `GET /api/health`, `GET /api/status`
- `POST /api/chat` (message)
- `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/<id>`
- `GET /api/tts/config`, `GET /api/tts/voices`, `GET /api/tts/situations`
- `POST /api/tts/script-style/extract-document`, `analyze`, `generate`

요청 본문 최대 16MB. 초과 시 413.

---

## 5. 배포 전 체크 (요약)

- 백엔드·프론트 포트(5002, 3000) 및 환경 변수 확인

## 6. 개발 연속성·경로 참조

| 항목 | 위치 | 용도 |
|------|------|------|
| 라우트·경로 | `src/config/routes.ts` | defaultRoutes, VOICE_GENERATION_PATH, allAppPaths, getPageTitle |
| E2E 경로 | `e2e/paths.ts` | PATHS.HOME, PATHS.PROJECTS, PATHS.VOICE_GENERATION (routes와 동기화) |
| 컴포넌트 매핑 | DEVELOPMENT.md §2.5 | 대화·프로젝트 관리·목소리 생성 컴포넌트 위치 |
| 대화 흐름 검증 | [guides/CHAT_ANSWER_FLOW_VERIFICATION.md](guides/CHAT_ANSWER_FLOW_VERIFICATION.md) | 입력→질문 표시→답변 생성·표시 검증 및 수동 체크리스트 |
| 입력·응답 문자열 정규화 | [guides/RESPONSE_CLEANING.md](guides/RESPONSE_CLEANING.md) | `coerceTrimmedString`·`coerceTrimmedEnd`·미러 동기화 |
| UX 메시징 | [guides/UX_MESSAGING_GUIDE.md](guides/UX_MESSAGING_GUIDE.md) | 로딩·에러·토스트 문구 규칙 (개발 시 참고) |
| 작업·우선순위 | docs/BACKLOG.md | 새 기능·버그 추가·완료 체크 |

경로 변경 시 `routes.ts`·`e2e/paths.ts` 함께 수정. 새 기능 시 BACKLOG·COMPLETION_CHECKLIST·AGENTS.md 동기화 권장.

**개발 연속성 전체**: [docs/DEVELOPMENT_CONTINUITY.md](DEVELOPMENT_CONTINUITY.md) — 경로·컴포넌트 매핑·체크리스트·관련 문서. **컴포넌트 아키텍처**: [docs/COMPONENT_ARCHITECTURE.md](COMPONENT_ARCHITECTURE.md).
- `npm run dev:check:frontend` 또는 `npm run dev:check` (프론트 타입·린트)
- `npm run build` 통과
- `cd backend && python3 -m pytest tests/test_main_api.py -q` 통과 (pytest 설치 시)
- (선택) E2E: `npm run test:e2e:no-server` 통과 (Playwright: `npx playwright install`)

---

## 6. 참고 문서

- [START_HERE.md](../START_HERE.md) - 빠른 시작
- [CONNECT.md](../CONNECT.md) - 접속·테스트
- [docs/DEV_GUIDE.md](./DEV_GUIDE.md) - 상세 개발 가이드 (다른 백엔드 포트 포함)
