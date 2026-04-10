# CORBU.AI - 빠른 참조

## 명령어

| 명령어 | 설명 |
|--------|------|
| `make setup` / `./setup.sh` | 의존성 설치 (최초 1회) |
| `make start` / `./start_all.sh` | 시스템 시작 |
| `make stop` / `./stop_all.sh` | 시스템 종료 |
| `make check` / `npm run check:system` | 상태 확인 |
| `make plugins` / `./install-plugins.sh` | 추가 기능 설치 |

## 접속

| 서비스 | URL |
|--------|-----|
| 프론트엔드 | http://localhost:3000 |
| 통합 API 문서 | http://localhost:5002/api/docs |
| app.py 단독 (인증 등) | 기본 포트도 5002 — `API_PORT`로 분리 시 해당 포트 `/docs` |

## 포트

- 3000: React 프론트엔드
- **5002**: **main_server** + **app.py** 기본값 (대화·통합 API — `npm run restart:backend`). **동시에 둘 다 띄우지 말 것** (포트 충돌).
- 다른 포트: `API_PORT` / `BACKEND_PORT` / `GAEPO_ANALYSIS_PORT`(레거시 Flask 분석 기본 5001) 등

## 검증

| 목적 | 명령 |
|------|------|
| **마무리 검증** | `npm run verify:completion` (타입+린트+P4 148) |
| **배포 전 한 번에** | `npm run deploy:check` (verify:completion + build) |
| 빌드·접속·API·통합 + 대화 Jest | `npm run verify:final` (`scripts/final-verify.sh` — 마지막에 `test:frontend:chat-pipeline`, 실패 시 exit 1) |
| 대화 파이프라인 메타 (Jest) | `npm run test:frontend:chat-pipeline` (`chatInputUtils`·스트리밍·프롬프트·Genspark 패널) |
| dev:check | `npm run dev:check` (백엔드 144 + 타입 + lint) |
| 시스템 상태 | `npm run check:system` |

```bash
./start_all.sh
# 20초 대기 후
npm run check:system
# 5001, 5002가 200이면 정상
```

마무리·배포 전: [docs/COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) §6 참고. 빌드·통합·대화 Jest 한 번에: [docs/FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md) · `npm run verify:final`.  
노트북 LLM·분야별 지식·글쓰기 스타일·딥러닝: [docs/NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md](docs/NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md) §2.4·§2.5.  
프로젝트 파일 업로드: COMPLETION_CHECKLIST §2 "프로젝트 파일 업로드" 행, [docs/API.md](docs/API.md) POST /api/projects/{id}/files.  
라우트·메뉴: config/routes 첫 메뉴 "CORBU.AI"(프로젝트·대화 분리), [docs/BACKLOG.md](docs/BACKLOG.md) 102~117차.  
컴포넌트·라우트 매핑: [docs/COMPONENT_ARCHITECTURE.md](docs/COMPONENT_ARCHITECTURE.md).  
대화 입력·문자열 정규화: [docs/guides/RESPONSE_CLEANING.md](docs/guides/RESPONSE_CLEANING.md) (`coerceTrimmedString`, `npm run sync:frontend-chat-input-utils`).

## 문제 해결

```bash
# 포트 충돌
./stop_all.sh && ./start_all.sh

# 플러그인 상태
./install-plugins.sh status
```
