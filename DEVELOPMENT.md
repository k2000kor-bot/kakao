# 체계적 개발 가이드

이 문서는 kakao-frontend(CORBU.AI) 프로젝트의 **일상 개발 흐름**, **실행 명령**, **작업 추적**을 한곳에서 관리하기 위한 기준 문서입니다.

---

## 1. 프로젝트 구조 (한눈에)

| 구분 | 경로 | 설명 |
|------|------|------|
| 프론트엔드 | `src/` | React + TypeScript, 메인 UI·컴포넌트·서비스 |
| 백엔드 | `backend/` | FastAPI (main_server), API·비즈니스 로직 |
| 백엔드 테스트 | `backend/tests/` | pytest 기반 API·통합 테스트 |
| 프론트 테스트 | `src/**/__tests__/`, `src/**/*.test.ts(x)` | Jest + React Testing Library |
| E2E | `e2e/` | Playwright E2E 테스트 |
| 문서·백로그 | `docs/` | 상세 문서, **작업 목록(BACKLOG.md)** |
| 스크립트 | `scripts/` | 실행·테스트·배포 스크립트 |
| Python venv | [docs/setup/PYTHON_VENV.md](./docs/setup/PYTHON_VENV.md) | `backend/venv`·`backend/.venv` 우선순위, `lib-activate` / `lib-backend-python` |

**첫 실행은 [START_HERE.md](./START_HERE.md) 참고.**  
macOS 요약: [docs/setup/MACOS_DEV_QUICKSTART.md](./docs/setup/MACOS_DEV_QUICKSTART.md) (`setup_macos_dev.sh` 실행 시 같은 경로가 더 길게 덮어써질 수 있음).

- **앱 진입점**: `src/index.tsx` → `AppUnified` (통합 레이아웃: 대화·프로젝트·목소리 생성). 라우트: `/`, `/projects`, `/projects/:id`, `/voice-generation`. 질문·요구 입력 시 검색·분석·예측 등 기능으로 답변 생성. 디자인 통일: [docs/BRAINWAVE-UI.md](docs/BRAINWAVE-UI.md) (Figma Brainwave AI UI Kit). **새 화면/컴포넌트**는 `theme.css` 변수와 `brainwave-global.css`의 `.bw-*` 클래스 사용 시 Kit 범위 유지.

---

## 2. 일상 개발 흐름

### 2.1 작업 전

```bash
# 저장소 최신화
git pull

# 의존성 확인 (필요 시)
npm install
cd backend && pip install -r requirements.txt && cd ..
```

### 2.2 작업 중

- **프론트**: `npm start` → http://localhost:3000
- **백엔드**: **`npm run restart:backend`** (권장, 포트 5002) 또는 `bash scripts/start-api-5002.sh`, `./scripts/deploy/start_main_server.sh`, `cd backend && uvicorn main_server:app ...`
- **동시 실행**: `./start_all.sh` (권장) 또는 `./start_servers.sh` (백그라운드 uvicorn 5002 + `npm start`; 레거시)

### 2.3 커밋 전 점검 (권장)

한 번에 돌리는 검사:

```bash
npm run dev:check
```

**마무리·배포 전**: `npm run verify:completion` (COMPLETION_CHECKLIST §6 — 타입·린트·P4 148 tests). **P2 검증(선택)**: `npm run p2:check` (verify + test:views 20 suites·105 tests + test:views:services), 4~6단계는 [docs/PERFORMANCE.md](docs/PERFORMANCE.md) §2.6 참고.

- 백엔드 핵심 API 테스트 실행
- 프론트 TypeScript 타입 검사 (`npx tsc --noEmit`)
- 프론트 ESLint (`npm run lint:strict`, 경고도 실패)

**참고**: 타입 검사 실패 시 dev:check는 **exit 1**로 실패합니다. 백엔드만 확인하려면 `npm run test:backend`(`scripts/run-backend-pytest.sh`, `venv`/`.venv` 중 pytest 가능 Python)만 실행하세요. pytest 미설치 시 `npm run dev:check:frontend`로 프론트(타입·린트)만 검사 가능.

### 2.4 병렬로 개발 속도 올리기 (2x)

- **에이전트·페어**: [AGENTS.md §병렬·2배 속도](./AGENTS.md) — 프론트(`chatInputUtils`·스트리밍)와 백엔드(파이프라인)·OpenAPI를 동시에 맞춤.
- **파이프라인 점검 한 방**: `npm run test:dev:dual-pipeline` — 백엔드 스모크(`scripts/lib-backend-python.sh`: `venv`/`.venv` 중 `import pytest` 성공 인터프리터) + 프론트 Jest(`chatInputUtils`·`streamingClient`·`generationPromptBuilder`·`GensparkPipelineExtrasPanel`). 백만: `npm run test:backend:pipeline-smoke`. **튜닝 API·노트북 context**: `npm run test:backend:pipeline-tuning`(5 tests, pytest+fastapi 필요)
- **일반 대화에서도 파이프라인 시험**: `.env`에 `REACT_APP_SIMPLE_CHAT_USE_PIPELINE=true` ([DEEPSEEK_SETUP §2.3](docs/DEEPSEEK_SETUP.md))

### 2.5 컴포넌트·화면 매핑 (개발 연속성)

| 영역 | 컴포넌트/파일 | 설명 |
|------|----------------|------|
| **라우트·메뉴** | `src/config/routes.ts` | defaultRoutes, getPageTitle, VOICE_GENERATION_PATH, allAppPaths |
| **뷰** | `src/views/` | ProjectsPage, VoiceGenerationView 등. views/README.md 참조 |
| **설정** | `src/config/` | routes.ts, api.ts. config/README.md 참조 |
| **상수** | `src/constants/` | testIds.ts (data-testid 단일 소스). constants/README.md 참조 |
| **서비스** | `src/services/` | projectService, chatService, streamingClient 등. services/README.md 참조 |
| **훅** | `src/hooks/` | useApiStatus, useChatManagement 등. hooks/README.md 참조 |
| **스토어** | `src/store/` | projectsSlice, sessionsSlice, uiSlice 등. store/README.md 참조 |
| **유틸** | `src/utils/` | chatInputUtils(`coerceTrimmedString`·`coerceTrimmedEnd`, 파이프라인 메타 파싱 등), streamingClient, guidelineQuality 등. [utils/README.md](src/utils/README.md) 참조. **`chatInputUtils.ts` 수정 시** 보조 트리와 맞추려면 `npm run sync:frontend-chat-input-utils` |
| **스타일** | `src/styles/` | theme.css, brainwave-global.css, themeColors. styles/README.md 참조 |
| **E2E** | `e2e/` | paths.ts, data-testid. e2e/README.md 참조 |
| **백엔드** | `backend/` | main_server.py(5002), api/. backend/README.md 참조 |
| **타입** | `src/types/` | project, chat, conversation 등. types/README.md 참조 |
| **스크립트** | `scripts/` | dev-check, verify-completion 등. scripts/README.md 참조 |
| **대화** | ChatGPTInterface(자체 렌더링), ChatMessage·MessageContent·MessageActions(Chat/) | `src/components/ChatGPTInterface.tsx`, `src/components/Chat/` (README 참조) |
| **프로젝트 관리** | ProjectEditModal(편집·지침·가이드라인), ProjectHub(목록·생성·편집·삭제) | `src/components/ProjectManagement/`, `src/components/ProjectHub*`. ProjectsPage → ProjectHub·ProjectEditModal. *ProjectCreationModal·ProjectList: backup/UnifiedProjectInterface.tsx.disabled에서 사용(비활성) |
| **목소리 생성** | VoiceGenerationView → AdvancedFeaturesPanel(defaultTab=voiceGen) | `src/views/VoiceGenerationView.tsx`, `src/components/AdvancedFeaturesPanel*` |

새 화면/기능 추가 시 BACKLOG·COMPLETION_CHECKLIST·AGENTS.md에 경로·테스트 명령 반영 권장. **개발 연속성**: [docs/DEVELOPMENT_CONTINUITY.md](docs/DEVELOPMENT_CONTINUITY.md). 상세: [docs/COMPONENT_ARCHITECTURE.md](docs/COMPONENT_ARCHITECTURE.md).

**대화·답변 생성**: API 호출 시 `context.conversation_history`(최근 20턴), `project_id`(노트북 LLM), `request_id`·`diversity`·`temperature`(같은 질문 n번 다른 답변) 전달. 백엔드: projectKnowledge 로드, _add_response_diversity 적용. 상세: [docs/BACKLOG.md](docs/BACKLOG.md) 27·28차.

**대화 전송(프론트 UI)**: `chatInputUtils.coerceTrimmedString`(`ChatGPTInterface`·`ModernChatInterface`·`IntegratedMasterInterface`·`Ultimate`·`ChatGPT5Complete`·`ChatGPTStyle`·`IntegratedAIChat`·`Chat/ChatInterface`·`AdvancedFeaturesPanel`(품질 예측)·`AdvancedAIEngine`(처리 파이프라인)·`SimpleChatView`·`WebResearchModal`·`DeepResearchModal`·`NewsSearch`·`NotebookLLM`·`ConversationGraphView`·`AICodeGenerator`·`AIDesignSystem`·`ProjectCreationModal`·`ProjectCreateModal`·`ProjectEditDialog`·`MarketingContent`·`PersuasionContent`·`CreativeWriting`·`AdvancedAIFeatures`·`MessageModifyRequestDialog`·`WritingQualityPanel`·`MessageEditor`·`AdvancedSearch`·`AdvancedSearchPanel`·파일분석 등; `ChatGPTInterface`는 `inputTrimmed`로 표시·전송 조건 정렬), 선택 인자 `handler(text?)`는 전송 버튼 `onClick={() => void send()}` 패턴 — [AGENTS.md](AGENTS.md), [TESTING_GUIDE.md](TESTING_GUIDE.md).

**노트북 LLM·분야별 지식·글쓰기 스타일·딥러닝**: DOMAIN_KNOWLEDGE_BASE keyPoints, buildIntelligentContext, getStyleInstruction, buildDLPromptEnhancement(sentiment). [docs/NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md](docs/NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md) §2.4·§2.5, BACKLOG 33·34·35차.

**프로젝트 파일 업로드**: POST /api/projects/{id}/files 백엔드·프론트 연동. projectService.uploadProjectFile, ProjectEditModal 파일 추가(API·로컬 폴백·업로드 중 로딩). [docs/COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) §2, [docs/API.md](docs/API.md), BACKLOG 85~92차. **라우트·메뉴**: config/routes 첫 메뉴 "CORBU.AI"(프로젝트·대화 분리), BACKLOG 102~117차.

**확장 뷰(도구 메뉴)**: 설정·분석·도움말·템플릿·검색·연동·팀·학습·구독·워크스페이스·자동화·커뮤니티 12개. `src/views/`에 섹션·카드 구조(bw-detail-section·bw-features-card) 통일, 섹션별 aria-labelledby 적용. 검증: `npm run test:views` (뷰+라우트), `npm run test:views:services` 또는 `npm test -- --testPathPattern=ViewService` (도구 뷰 서비스 45 tests), `E2E_SERVER_READY=1 npx playwright test e2e/example.spec.ts` (E2E). [src/views/README.md](src/views/README.md) §확장 뷰 검증, [docs/DEVELOPMENT_SCOPE_MASTER.md](docs/DEVELOPMENT_SCOPE_MASTER.md) §2.2.

### 2.4 수동으로 각각 실행

| 목적 | 명령 |
|------|------|
| 백엔드 테스트 (전체) | `npm run test:backend` |
| **파이프라인 튜닝 API + 노트북 context (5 tests)** | `npm run test:backend:pipeline-tuning` |
| 백엔드 테스트 (특정 파일) | `cd backend && python3 -m pytest tests/test_project_session_api.py -v` |
| **TTS 관련 (목소리 생성)** | `npm run test:tts:all` (프론트 252 + 백엔드 11, 백엔드는 backend venv에서 pytest 필요) |
| **P4 서비스 (8 suites, 148 tests)** | `npm run test:p4:services` |
| **확장 뷰·라우트 (뷰 유닛 + routes.test)** | `npm run test:views` |
| **사이드바 컨텍스트·설정·대화 이력 회귀** | `npm run test:sidebar-context` (동일 `make test-sidebar-context`; `AppUnified`·`SettingsView`·`ChatGPTInterface`·`sidebarContextFilterEvent`) — [docs/PUSH_BLOCK_HANDOFF.md](./docs/PUSH_BLOCK_HANDOFF.md) |
| **원격 `git push` 막힘 시 로컬 점검** | `npm run maintain:push-block` (동일 `make maintain-push-block`) — 동 문서 |
| **도구 뷰 서비스 (10 suites, 45 tests)** | `npm test -- --testPathPattern=ViewService --watchAll=false` 또는 `npm run test:views:services` |
| **P2 1·2·3단계 (verify + test:views + test:views:services)** | `npm run p2:check` (4~6: PERFORMANCE.md §2.6) |
| ultimate_media (선택, 8 tests) | `cd backend && python3 -m pytest tests/test_api.py -v` |
| 프론트 유닛 테스트 | `npm test -- --watchAll=false` |
| testHelpers 적용 스위트만 | `npm run test:helpers` (약 52 스위트, 851 테스트) |
| 프론트 타입/린트 | `npm run typecheck` (또는 `npx tsc --noEmit`), `npm run lint`, `npm run lint:strict` (경고도 실패, CI용). `npm run dev:check:frontend` — 백엔드 스킵, 타입·린트만. 전체 src가 느리면 `npm run lint -- src/hooks src/utils src/store src/types` 처럼 경로 지정 가능. |
| E2E 테스트 | `npm run test:e2e` (Playwright가 dev 서버 기동) 또는 터미널에서 `npm start` 후 `E2E_SERVER_READY=1 npm run test:e2e:no-server`. **최초 1회**: `npx playwright install` (브라우저 다운로드). 빌드 기반: `npm run test:e2e:build` (E2E_USE_BUILD=1). 목록만 확인: `npx playwright test --list` (123 tests, 9 specs) |
| 빌드 검증 | `npm run build` |
| **성능·번들 분석** | `npm run perf:analyze` (build + analyze:bundle). 상세: docs/PERFORMANCE.md §2.3 |

**E2E 참고**: localhost:3000 접근 가능한 환경에서 실행. 서버 미기동 시 `./scripts/run-e2e-with-server.sh` 사용 가능 (e2e/README.md 참고).  
**테스트 상세**: 유닛 테스트 구조·유틸/설정/스토어/훅 목록·검증 명령은 [TESTING_GUIDE.md](./TESTING_GUIDE.md) 참고.

---

## 3. 브랜치·커밋

- **기본 브랜치**: `main` (배포), `develop` (개발)
- **작업 브랜치**: `feature/기능명`, `fix/버그명` 등
- 커밋 메시지: 간단히 동사형으로 (예: `Add project notebook-context API`, `Fix sidebar source count`)

---

## 4. 작업 관리 (백로그·개발 범위)

- **개발 범위 통합**: [docs/DEVELOPMENT_SCOPE_MASTER.md](./docs/DEVELOPMENT_SCOPE_MASTER.md) — 비전·아키텍처·단계·품질 기준 통합
- **작업 목록·우선순위**: [docs/BACKLOG.md](./docs/BACKLOG.md) 에서 관리합니다.
- 새 작업·버그는 BACKLOG.md에 추가하고, 완료 시 체크하여 진행 상황을 유지합니다.
- **성능·품질 점검**: [docs/PERFORMANCE.md](./docs/PERFORMANCE.md) (Lighthouse·번들 분석·LCP).
- **목소리 생성(TTS) 상세·검증**: [docs/guides/TTS_AND_SCRIPT_STYLE_GUIDE.md](docs/guides/TTS_AND_SCRIPT_STYLE_GUIDE.md) 참고, `npm run test:tts:all` 로 TTS 관련 테스트 실행.
- **프로젝트 허브(Task B4) 완료 보고서**: [TASK_B4_DEVELOPMENT_REPORT.md](./TASK_B4_DEVELOPMENT_REPORT.md) — ProjectHub·projectAnalyticsService·테스트 50.
- **완성 체크리스트·마무리 검증**: [docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md) — 미진 항목·검증 명령 요약. **마무리 검증 순서**는 §6 참고 (dev:check → test:p4:services 필수).
- **사용자 메뉴얼**: [USAGE_GUIDE.md](./USAGE_GUIDE.md) (상세), [docs/guides/MANUAL_QUICK_REFERENCE.md](./docs/guides/MANUAL_QUICK_REFERENCE.md) (한 페이지), [QUICK_START.md](./QUICK_START.md) (5분 실행·첫 대화).

---

## 5. 주요 스크립트 (package.json)

| 스크립트 | 설명 |
|----------|------|
| `npm run verify:completion` | **마무리 검증** (타입·린트·P4 148 tests. COMPLETION_CHECKLIST §6) |
| `npm start` | 프론트 개발 서버 (PORT 3000) |
| `npm run build` | 프론트 프로덕션 빌드 |
| `npm test` | 프론트 Jest 테스트 |
| `npm run test:backend` | 백엔드 pytest 실행 |
| `npm run test:tts:all` | TTS 관련 (프론트 249 + 백엔드 11) |
| `npm run test:p4:services` | P4 서비스 8개 스위트 (148 tests) |
| `npm run dev:check` | 커밋 전 점검 (백엔드 테스트 + 타입 등) |
| `npm run test:e2e` | Playwright E2E |

---

## 6. 문제 해결

- **백엔드 테스트 실패**: `backend/` 에서 `python3 -m pytest tests/ -v --tb=long` 로 상세 로그 확인.
- **프론트 빌드/타입 에러**: `npx tsc --noEmit` 로 에러 위치 확인.
- **API 연결 안 됨**: 백엔드 실행 여부, `REACT_APP_API_URL`(또는 프론트 설정) 확인.

### 서버 접속이 안 될 때

1. **접속 주소**: 프론트는 **http://localhost:3000** (같은 PC) 또는 **http://192.168.0.212:3000** (같은 LAN). 백엔드 API는 5002 포트.
2. **둘 다 켜져 있는지**: 터미널에서 `npm run check:access` 로 확인 (프론트 3000, 백엔드 5002).
3. **접속 자체가 안 되면 (연결 거부/타임아웃)**:
   - **1단계**: 브라우저에서 **http://localhost:3000/ping.html** 또는 **http://localhost:3000/test.html** 먼저 열어보기. 이게 보이면 서버는 동작 중이고 메인(/) 쪽 이슈.
   - **2단계**: 터미널에서 **`npm run restart`** 실행 (포트 3000 정리 후 재시작). "Compiled successfully" 나올 때까지 기다린 뒤 **http://localhost:3000** 접속.
   - **3단계**: 그래도 안 되면 **`npm run restart:local`** 로 시도 (127.0.0.1만 바인딩). 브라우저는 **http://localhost:3000** 으로 접속.
   - **4단계(원인 격리)**: **`npm run try:serve`** 한 번 실행 (포트 정리 → 빌드 → 빌드만 서빙) → 브라우저에서 **http://localhost:3000** 접속. **이렇게 접속되면** 이 PC·브라우저 접속은 정상이고, **CRA dev 서버(npm start) 쪽**만 문제인 경우입니다.
   - **5단계(dev 서버 재시도)**: 프록시를 경로만 명시하도록 수정했고 `.env.development`에 `CHOKIDAR_USEPOLLING=true` 추가됨. **`npm run restart:local`** 실행 후 다시 **http://localhost:3000** 접속해 보세요.
   - 시작 시 터미널에 에러(예: 포트 사용 중, 컴파일 실패)가 있으면 해당 메시지 확인.
4. **프론트만 안 되면**: `npm run restart` 후 브라우저에서 **http://localhost:3000** 새로고침. 캐시 무시 새로고침(Cmd+Shift+R / Ctrl+Shift+R) 시도.
5. **백엔드만 안 되면**: `npm run restart:backend` (`scripts/restart-backend.sh`: `backend/venv` → `backend/.venv` → 시스템 `python3` 중 `import uvicorn` 성공분 우선, 없으면 `backend/.venv`를 `requirements-core.txt`로 재생성) 또는 `cd backend && python3 main_server.py` 로 5002 포트 기동.
6. **빈 화면/에러 화면**: 브라우저 개발자 도구(F12) → Console 탭의 에러 메시지 확인. API 5002 미기동이면 프록시/API 호출 실패로 빈 화면이 나올 수 있음.

### 프론트 설정 요약 (페이지/로딩 문제 시)

- **API 호출**: 프론트는 **http://localhost:5002** 로 직접 호출 (`src/config/api.ts`). dev 서버 프록시(`setupProxy.js`)는 접속 문제 회피를 위해 **미등록** 상태. 백엔드 CORS가 허용하므로 동작함.
- **개발 시 asset 경로**: `.env.development`에 `PUBLIC_URL=/` 로 두면 스크립트가 루트 기준으로 로드됨.
- **설정 변경 후**: `npm start` 재시작 후 브라우저에서 강력 새로고침(Cmd+Shift+R / Ctrl+Shift+R) 권장.

---

## 7. 목소리 생성 (TTS)

Qwen3-TTS 기반 목소리 생성은 다음 경로에서 사용할 수 있습니다. **QWEN_TTS_BASE_URL** 미설정 시 서버에서 **gTTS** 폴백을 사용합니다(고급 기능 패널·목소리 생성 탭에서 「생성」 시 서버 음성 재생). 더 나은 음질은 Qwen TTS 서버 설정 또는 `pip install gtts` 후 백엔드 재시작을 권장합니다.

| 경로 | 설명 |
|------|------|
| **고급 기능 패널** | ModernChatInterface 등에서 고급 기능 → **목소리 생성** 탭. URL/프로젝트 ID/상황만 선택 가능. |
| **노트북 뷰 모달** | ChatGPTInterface에서 노트북 LLM 진입 후 헤더 **🎙️ 목소리 생성** 클릭 → 모달(프로젝트 ID 자동 반영). Escape로 닫기, 열릴 때 닫기 버튼 포커스, Tab/Shift+Tab 포커스 트랩. |

**입력 방식**

- **URL 직접 입력**: YouTube/TikTok 영상 URL + 대본 → 해당 목소리로 합성.
- **프로젝트 보이스 사용**: 프로젝트 ID 입력 후 보이스 소스(URL) 등록·관리, 대본만 입력해 프로젝트 보이스로 생성.
- **상황만 선택**: 나레이션·뉴스·다큐멘터리 등 상황만 선택 후 대본 입력 → 참조 음성 없이 상황 스타일로 생성.
- **감정·상황 프롬프트 (Beta)**: 「프롬프트 (Beta)」 입력란에 자연어(예: 서러운듯 울먹이며) 또는 빠른 태그(#명료하게, #따뜻하게 등)를 넣으면 TTS instructions로 전달되어 음성 톤이 반영됨. 상세: [TTS_AND_SCRIPT_STYLE_GUIDE](docs/guides/TTS_AND_SCRIPT_STYLE_GUIDE.md#감정상황-프롬프트-beta).

**대화 읽어주기**: 각 메시지의 「음성으로 읽기」 버튼 클릭 시, AI(assistant) 메시지는 Qwen TTS를 우선 사용(현재 프로젝트가 있으면 프로젝트 보이스, 없으면 나레이션 스타일). API 실패 시 브라우저 SpeechSynthesis로 폴백. 사용자 메시지는 브라우저 TTS만 사용.

백엔드: `POST /api/tts/speech`, `speech-from-source`, `speech-from-project`, `GET /api/tts/situations`, 프로젝트 보이스 소스 `GET/POST/DELETE /api/projects/{id}/voice-sources`. 프론트: `src/services/qwenTtsService.ts`, `AdvancedFeaturesPanel` 목소리 생성 탭. TTS 폴백: `backend/requirements.txt`에 `gtts` 포함. gTTS 사용 시 `cd backend && pip install gtts`(또는 `pip install -r requirements.txt`) 후 백엔드 재시작; `restart:backend`가 새 `.venv`를 만들 때는 `requirements-core.txt` 기준이라 gtts가 없으면 스크립트가 안내 메시지를 출력할 수 있음.

---

AI/에이전트가 코드 수정 시 참고할 내용은 **[AGENTS.md](./AGENTS.md)** 를 사용합니다.

이 가이드를 기준으로 개발을 진행하면, 팀과 AI 어시스턴트가 동일한 흐름을 따를 수 있습니다.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

