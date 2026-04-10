# 최종 체크리스트 (배포 전 점검)

배포 전 또는 개발 완료 시 확인하는 항목입니다. `./scripts/final-verify.sh`(`npm run verify:final`)는 빌드·접속·API·통합 테스트에 더해 **`npm run test:frontend:chat-pipeline`** 까지 실행합니다.

---

## 1. 빌드·실행

| 항목 | 명령 | 기대 결과 |
|------|------|-----------|
| 프론트 빌드 | `npm run build` | Compiled successfully |
| 프론트 실행 | `npm start` | http://localhost:3000 접속 가능 |
| 백엔드 실행 | `npm run restart:backend` (권장) 또는 `cd backend && python3 -m uvicorn main_server:app --port 5002` | http://localhost:5002 접속 가능 |

---

## 2. 검증·테스트

| 항목 | 명령 | 기대 결과 |
|------|------|-----------|
| 접속 확인 | `npm run check:access` | 프론트(3000)·백(5002) 200 또는 안내 메시지 |
| API 검증 | `npm run verify:api` | /api/health, /api/status, /api/docs → 200 |
| 통합 테스트 | `npm run test:integration` | 대화·에러 시나리오·스트리밍 모두 OK (백엔드 실행 중 필요) |
| 대화 파이프라인 (Jest) | `npm run test:frontend:chat-pipeline` | `chatInputUtils`·스트리밍·프롬프트·Genspark 패널 (백엔드 불필요). 유틸 수정 후 `npm run sync:frontend-chat-input-utils` 권장 |
| 백엔드 테스트 | `cd backend && python3 -m pytest tests/test_main_server.py tests/test_unified_chat_api.py -v` | passed |

---

## 3. 한 번에 검증

```bash
./scripts/final-verify.sh
```

- 빌드 필수 확인
- **대화 파이프라인 Jest** 포함 (`test:frontend:chat-pipeline`, 실패 시 exit 1)
- 접속·API·통합 테스트는 백엔드가 켜져 있으면 모두 실행, 아니면 일부 스킵

---

## 4. 포트·문서

- **프론트**: 3000 (package.json, .env.local, 문서 일치)
- **백엔드**: 8000 (main_server.py, api.ts, setupProxy, 문서 일치)
- **문서**: [로컬 접속 가이드](./LOCAL_ACCESS_GUIDE.md), [개발 가이드](./DEV_GUIDE.md), [RUN_GUIDE.md](../RUN_GUIDE.md), [입력·응답 문자열 정리](./guides/RESPONSE_CLEANING.md)

---

## 5. 배포 스크립트 (선택)

- `scripts/deploy/start_main_server.sh` — 백엔드 (8000)
- `scripts/deploy/start_frontend.sh` — 프론트 (3000, 프로젝트 루트에서 npm start)
