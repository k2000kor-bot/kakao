# MD 문서·기능·답변 생성 검증 보고서

**검증일**: 2026-02-19  
**목적**: MD 파일에서 모든 기능과 답변 생성 능력이 제대로 문서화·작동하는지 확인

---

## 1. 핵심 문서 현황

### 1.1 사용자 가이드 (정상)

| 문서 | 내용 | 상태 |
|------|------|------|
| **USAGE_GUIDE.md** | 화면 구성, 프로젝트, 대화, 고급 기능, 시나리오, FAQ, 문제 해결 | ✅ 완전 |
| **MANUAL_QUICK_REFERENCE.md** | 한 페이지 요약, 핵심 3단계, 버튼 위치, 체크리스트 | ✅ 완전 |
| **QUICK_START.md** | 5분 실행·첫 대화 | ✅ 완전 |
| **docs/guides/USAGE_GUIDE.md** | CORBU.AI 짧은 가이드 | ✅ 완전 |

### 1.2 기능·답변 생성 문서화 (정상)

| 기능 | 문서 위치 | 구현 |
|------|-----------|------|
| **대화/답변 생성** | USAGE_GUIDE §5, API.md POST /api/chat | backend/api/unified_chat_api.py, chatService.ts |
| **긴 글 자동 생성** | USAGE_GUIDE §5.3, API_ENDPOINTS_SUMMARY | intelligent_answer_generator, API 키워드 감지 |
| **프로젝트 지침 반영** | USAGE_GUIDE §4.6, API context.project_instructions | projectKnowledge 연동 |
| **프로젝트 파일 맥락** | USAGE_GUIDE §4.6, API context.project_files | projectKnowledge 참고 파일 |
| **스트리밍** | USAGE_GUIDE §5.4 | streamingClient, /api/chat/stream |
| **대화 제목 자동 생성** | USAGE_GUIDE FAQ, §5.4 | POST /api/chat/title |
| **TTS** | TTS_AND_SCRIPT_STYLE_GUIDE, USAGE_GUIDE §6 | AdvancedFeaturesPanel, qwenTtsService |
| **노트북 LLM** | PROJECT_NOTEBOOK_LLM_USER_GUIDE, USAGE_GUIDE §6 | NotebookLLM, generate/stream |

### 1.3 API 문서 (일부 수정 필요)

| 문서 | 내용 | 비고 |
|------|------|------|
| **docs/API.md** | POST /api/chat, context, intent 분석 | Base URL 5000 → 5002로 수정 권장 |
| **API_ENDPOINTS_SUMMARY.md** | 47개 엔드포인트, 대화·긴 글 생성 | ✅ 일치 |

---

## 2. 포트·접속 주소 정리

**실제 구성** (start_all.sh, config/api.ts, PORTS.md):

| 용도 | 포트 | URL |
|------|------|-----|
| 프론트엔드 | 3000 | http://localhost:3000 |
| **통합 API (대화·프로젝트·TTS)** | **5002** | http://localhost:5002 |
| app.py 단독 | **5002** (기본, `API_PORT`로 변경 가능) | http://localhost:5002 |
| API 문서 (Swagger, main_server) | 5002 | http://localhost:5002/api/docs |

**주의**: 일부 MD(USAGE_GUIDE, MANUAL_QUICK_REFERENCE, SYSTEM_READY 등)에 "백엔드 5001"로만 표기된 곳이 있음. **대화·답변 생성**은 **5002**에서 동작.

---

## 3. 검증된 기능·답변 생성 흐름

1. **대화 요청** → ChatGPTInterface/SimpleChatView → chatService/ChatGPTInterface fetch
2. **API 호출** → `POST ${API_BASE_URL}/api/chat` (5002)
3. **백엔드** → main_server → unified_chat_api → generate_chat_response
4. **답변 생성** → intelligent_answer_generator, projectKnowledge(지침·파일) 반영
5. **응답** → `{ success, response, data }` → 프론트 렌더링

**문서와 구현**: 일치 ✅

---

## 4. MD 파일 개수·분류

- **총**: 764개+ MD 파일
- **핵심 사용자·개발자 문서**: USAGE_GUIDE, MANUAL_QUICK_REFERENCE, QUICK_START, DEVELOPMENT, BACKLOG, API.md, SYSTEM_READY, START_HERE, README_FIRST
- **가이드**: docs/guides/ (TTS, 노트북 LLM, USER_STARTUP_GUIDE 등)
- **보고서·히스토리**: docs/reports/ (다수 완료 보고서)

---

## 5. 권장 수정 사항

1. **docs/API.md**: Base URL `5000` → `5002` (또는 "5002(통합), 5001(인증)" 명시)
2. **USAGE_GUIDE, MANUAL_QUICK_REFERENCE, SYSTEM_READY**: "대화 API는 5002" 명시 또는 "5001·5002" 둘 다 안내
3. **기능 누락**: 없음. 핵심 기능(대화, 답변 생성, 프로젝트, TTS, 노트북 LLM) 모두 문서화됨

---

## 6. 결론

- **기능·답변 생성**: 문서와 구현이 일치하며, 대화·긴 글 생성·프로젝트 맥락·스트리밍·TTS·노트북 LLM이 모두 문서화되어 있음.
- **수정 권장**: API Base URL 및 포트(5001 vs 5002) 안내를 실제 구성에 맞게 통일.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
