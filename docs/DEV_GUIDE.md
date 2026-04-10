# 개발 가이드

프로젝트 개발·검증·테스트를 위한 요약 가이드입니다.

---

## 환경

- **프론트엔드**: Node.js 18+, React 19, 포트 **3000**
- **백엔드**: Python 3.8+, FastAPI, 포트 **8000** (`main_server.py`)

---

## 실행

| 목적 | 명령 |
|------|------|
| 프론트만 | `npm start` → http://localhost:3000 |
| 백엔드만 | `cd backend && python3 main_server.py` → http://localhost:5002 |
| 프론트 재시작 | `npm run restart` |
| 백엔드 재시작 | `npm run restart:backend` |

상세: [RUN_GUIDE.md](../RUN_GUIDE.md), [로컬 접속 가이드](./LOCAL_ACCESS_GUIDE.md).

---

## 검증·테스트

| 명령 | 설명 |
|------|------|
| `npm run check:access` | 프론트(3000)·백엔드(8000) 접속 가능 여부 확인 |
| `npm run verify:api` | GET /api/health, /api/status, /api/docs 응답 확인 |
| `npm run test:integration` | 대화 API·에러 시나리오(400/422)·스트리밍 통합 테스트 (백엔드 실행 중 필요) |
| `npm run test:frontend:chat-pipeline` | 프론트 Jest: `chatInputUtils`·`streamingClient`·`generationPromptBuilder`·Genspark 패널 (백엔드 불필요). `chatInputUtils.ts` 수정 후 `npm run sync:frontend-chat-input-utils` 권장 |
| `npm run build` | 프론트 프로덕션 빌드 |
| `cd backend && python3 -m pytest tests/test_main_server.py tests/test_unified_chat_api.py -v` | 백엔드 API 단위·통합 테스트 |
| `cd backend && python3 -m pytest tests/test_project_session_api.py::TestProjectNotebookContext -v` | 프로젝트별 노트북 LLM 테스트 (생성·조회·대화 컨텍스트) |

---

## API 문서

- **Swagger**: http://localhost:5002/api/docs (백엔드 실행 후)
- **ReDoc**: http://localhost:5002/api/redoc

---

## 최종 검증 (배포 전)

- **한 번에 실행**: `npm run verify:final` (= `./scripts/final-verify.sh`) — 빌드 + 접속 + API + 통합 테스트 + **`npm run test:frontend:chat-pipeline`**
- **체크리스트**: [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)

---

## 클라이언트 저장 (localStorage)

대화 화면(`ChatGPTInterface`)에서 사용하는 주요 키:

| 키 | 용도 |
|----|------|
| `chatgpt-theme` | 테마 (light/dark) |
| `chatgpt-show-timestamps` | 메시지 시간 표시 여부 |
| `chatgpt-conversations` | 대화 목록·메시지 |
| `chatgpt-projects` | 프로젝트 목록(캐시) |
| `chatgpt-composer-response-mode` | 공동입력창 Auto 드롭다운 선택값 (`auto` / `concise` / `detailed`) — 새로고침 후 복원 |

프로젝트별: `notebook-selected-sources-${projectId}`, `chatgpt-output-preset-by-project` 등. 상세: [CHAT_UI_LAYOUT_SAMPLE.md](./CHAT_UI_LAYOUT_SAMPLE.md), [CHATGPT_PROJECT_FEATURE_CHECKLIST.md](./CHATGPT_PROJECT_FEATURE_CHECKLIST.md).

**입력 문자열**: 전송·검색 등은 `chatInputUtils.coerceTrimmedString` / `coerceTrimmedEnd` — [guides/RESPONSE_CLEANING.md](./guides/RESPONSE_CLEANING.md).

---

## 문제 해결

- 접속 안 됨: [LOCAL_ACCESS_GUIDE.md](./LOCAL_ACCESS_GUIDE.md) — 반드시 프로젝트 폴더에서 실행, test.html 확인 등
- 트러블슈팅: [TROUBLESHOOTING_GUIDE.md](./guides/TROUBLESHOOTING_GUIDE.md)
- 개발 단계 현황: [DEVELOPMENT_ROADMAP.md](../DEVELOPMENT_ROADMAP.md)
