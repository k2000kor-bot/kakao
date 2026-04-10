# 완성 체크리스트

**마무리 한 줄**: `npm run verify:completion` (타입·린트·P4 148 tests. 통과 시 완성도 검증 완료.)

**마무리 완료 조건**: ① `npm run verify:completion` 통과 ② (선택) `npm run test:tts:all` ③ (선택) E2E·커버리지

**목적**: 미진한 부분을 메워 "완성"에 도달하기 위한 항목 정리. 완료 시 체크하고, 남은 항목은 우선순위대로 진행합니다.

**현재 완성도**: 핵심 기능·품질 기준 충족. 대화 질문 답변·대화 이력·노트북 LLM 연결(projectKnowledge)·같은 질문 n번 다른 답변(request_id·diversity·_add_response_diversity) 반영 완료. 위 명령 또는 아래 **마무리 검증 순서** §6 실행해 통과하면 완성도 검증 완료 상태입니다.

**참고**: [BACKLOG.md](BACKLOG.md), [DEVELOPMENT_CONTINUITY.md](DEVELOPMENT_CONTINUITY.md) (경로·컴포넌트 매핑·기능 추가 체크리스트), [DEVELOPMENT_STATUS_CURRENT.md](DEVELOPMENT_STATUS_CURRENT.md), [PERFORMANCE.md](PERFORMANCE.md), [TESTING_GUIDE.md](../TESTING_GUIDE.md) (§스킵된 테스트 복구), [TASK_B4_DEVELOPMENT_REPORT.md](../TASK_B4_DEVELOPMENT_REPORT.md).

---

## 1. 완성 정의 (이 프로젝트 기준)

- **기능**: CORBU.AI·간단 대화·고급 기능(이미지·음성·예측·목소리/TTS)·노트북 LLM이 **AppUnified** 한 진입점에서 동작하고, TTS·노트북 API·보이스 소스 연동 완료.
- **품질**: `npm run dev:check` 통과 (백엔드 144 + **타입 실패 시 exit 1** + lint:strict).
- **마무리 검증**: `npm run verify:completion` 통과 시 완성도 검증 완료 (타입·린트·P4 148 tests).
- **디자인**: Brainwave theme 단일 소스, 에러/fallback까지 theme 변수 사용.
- **문서**: DEVELOPMENT, BACKLOG, BRAINWAVE-UI, TTS 가이드, USAGE_GUIDE·메뉴얼(상세·빠른 참조·QUICK_START), COMPONENT_ARCHITECTURE, DEVELOPMENT_CONTINUITY, 완성 체크리스트(이 문서) 유지.

---

## 2. 이미 완료된 항목 (유지)

| 항목 | 검증 방법 |
|------|-----------|
| 통합 앱 (AppUnified) | 사이드바 대화(/), 프로젝트(/projects), 목소리 생성(/voice-generation). 검색·단축키·전체 기능은 대화 입력으로 통합. brainwave-unified·data-brainwave-figma. 구버전 경로(/simple, /notebook, /features-map 등) 리다이렉트 |
| TTS 254+11 | `npm run test:tts:all` (프론트 254 + 백엔드 11). Typecast 벤치마크: Smart Emotion·7 감정 프리셋, 추가 지시(선택), gTTS 폴백, qwenTtsService·AdvancedFeaturesPanel 검증 포함 |
| 백엔드 144 | `npm run dev:check` 1단계 (test_unified_chat_api·test_innovative_writing_instruction_creative_perspective 포함) |
| ESLint 전체 통과 | `npm run lint:strict` (**2026-02-14**: 테스트 8건 린트 수정 반영) |
| 타입 검사 실패 시 dev:check 실패 | `scripts/dev-check.sh` — 타입 실패 시 exit 1 |
| AppUnified 테스트 6개 | 본문 건너뛰기, 404, brainwave 루트, /projects, /projects/:id, /voice-generation 렌더 |
| scriptStyleAPI 100% 커버리지 | `npm run test:coverage -- --testPathPattern="scriptStyleAPI"` |
| 문서·인프라 | DEVELOPMENT, BACKLOG, BRAINWAVE-UI, TTS 가이드, COMPONENT_ARCHITECTURE, DEVELOPMENT_CONTINUITY, dev:check 3단계, CI lint:strict |
| Task B4 프로젝트 허브 | 검색/필터/통계/템플릿/공유 완료. projectAnalyticsService·ProjectHub 50 tests, projectShareService·ProjectShareDialog 42 tests. URL `?share=` 접근 시 프로젝트 자동 선택. |
| 대화 질문 답변·대화 맥락 | ChatGPTInterface 응답 추출·백엔드 빈 응답 방지. context.conversation_history(최근 20턴)·대화방 재진입 시 conversations 우선·재생성·편집 경로 동일·consistency_instruction. available_capabilities·buildFeatureContextFromMessage. 백엔드 _run_pre_generation_pipeline. CHAT_ANSWER_FLOW_VERIFICATION §5.6. |
| 사전 생성 파이프라인 | `_run_pre_generation_pipeline` 4단계(자료 수집→내용 정리→논리 구성→스타일). unified_ctx로 intelligent_engine·llm_service·notebook_llm에 반영. parsed_input·response_style·perspective 기반. 혁신 답변 품질 지시(논리 구조·결론 선행·독창적 관점·수식어 지양·creative 시 창의 모드). BACKLOG 2026-02-20·23차. |
| 통합 생성글 품질(모든 입력창) | `generationPromptBuilder` — buildUnifiedGenerationPrompt·buildUnifiedChatContext·getInnovativeWritingInstructionBlock. SimpleChatView·IntegratedAIChat·UltimateChatGPTInterface·FileAnalysisChatSystem·NotebookLLM에 적용. /api/unified/chat 우선. generationPromptBuilder.test 12 tests. |
| 노트북 LLM·답변 다양성 | 대화 시 project_id·context 전달(스트리밍/비스트리밍·재생성·편집). 백엔드 projectKnowledge 로드·폴백 반영. 같은 질문 n번 다른 답변: request_id·diversity·temperature 전송, _add_response_diversity(시작/마무리 문구) 적용. |
| 노트북 LLM·분야별 지식·글쓰기 스타일·딥러닝 | DOMAIN_KNOWLEDGE_BASE keyPoints(8개 도메인), buildIntelligentContext, getStyleInstruction, buildDLPromptEnhancement(sentiment). FORMAT_PATTERNS 댓글·기사·댓글 학습·기사 학습. NOTEBOOKLM §2.4·§2.5, BACKLOG 33~71차. notebookLLMService 73·writingStyleService 34·conversationHistoryService 33·fileStorageService 20·formatters 29·config/routes 11·config/api 12 tests. |
| 입력창 엔터 → 딥러닝 보강 → 딥시크 답변 | sendMessage 단일 진입점. buildMessageToSendForChat(의도·감정·주제 분석·보강) → 백엔드 딥시크. 메인 대화·재생성·편집·노트북(딥시크) 공통. 응답 품질 분석(analyzeResponseWithDL) 비차단. DEEPSEEK_DEVELOPMENT_ORDER §프론트엔드. ChatGPTInterface·NotebookLLM 테스트 mock 반영. |
| 딥시크 정상 동작 | provider가 deepseek/deepseek-local일 때 대화에서 LLM(딥시크) 우선 시도. llm_service context.conversation_history 우선 사용. 백엔드 unified_chat_api 문법 수정(5002 기동). 설정·동작 안 할 때: [DEEPSEEK_SETUP.md §4.1](DEEPSEEK_SETUP.md#41-딥시크가-동작하지-않을-때-체크리스트). 한 흐름: [DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md](DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md). |
| 대화 API quality 일원화 | /api/chat·/api/unified/chat 호출 시 quality(기본 enhanced) 전달. ChatGPTInterface effectiveQuality·스트리밍/재생성/편집, chatService·unifiedAPI·integratedSystemAPI·SimpleChatView·UltimateChatGPTInterface·FileAnalysisChatSystem·IntegratedMasterInterface·App.js 404 폴백 포함. ANSWER_QUALITY_AND_SEARCH §5. |
| 프로젝트 파일 업로드 | POST /api/projects/{id}/files 백엔드·프론트 연동. projectService.uploadProjectFile, ProjectEditModal 파일 추가(API·로컬 폴백·토스트)·업로드 중 로딩. project-edit-file-add E2E, ProjectEditModal 22 tests, projectService uploadProjectFile 3 tests. BACKLOG 85~90차. |
| 라우트·메뉴 | config/routes 3분할: 대화(/), 프로젝트(/projects), 프로젝트대화(/projects/:id). VOICE_GENERATION_PATH·allAppPaths 단일 소스. routes.test. 대화 리스트 통합(일반+프로젝트, 입력 시 제목, 클릭 시 대화 전환). BACKLOG 102~113차. |
| 2차 메뉴·상세 페이지 bw-detail 통일 | brainwave-global.css bw-detail-* 클래스. 8개 페이지 아이콘·제목·설명·탭(pill)·콘텐츠 통일. AppUnified 모바일 헤더·ErrorBoundary fallback·SimpleChatView confidence-value·NotebookLLM mindmap CSS 클래스화. DESIGN_CONSISTENCY_REPORT §2. |
| 도구 뷰 12개 섹션·카드 구조 통일 | 설정·분석·도움말·템플릿·검색·연동·팀·학습·구독·워크스페이스·자동화·커뮤니티 뷰에 bw-detail-section·bw-features-card·bw-detail-section-title 일관 적용. DocsView 가이드·단축키·문제 해결 카드화. BACKLOG 확장 뷰 구조 강화 완료. |
| 확장 뷰 검증(유닛·E2E·라우트) | 뷰+라우트: `npm run test:views`. E2E: `E2E_SERVER_READY=1 npx playwright test e2e/example.spec.ts`. views/README §확장 뷰 검증. |
| 도구 뷰 예시 플레이스홀더 10개 | Analytics·Integrations·Billing·Search·Templates·Team·Learn·Workspace·Automation·Community 첫 섹션에 예시(—) 블록·aria-label·유닛 테스트. API 연동 전 UI 힌트. BACKLOG 완료. |
| 도구 뷰 10개 실 API 연동 | extended_views_api GET /api/*/summary. Workspace·Templates·Search는 프로젝트 데이터 기반 실 데이터. 실패 시 프론트 폴백. backend/tests/test_extended_views_api.py 7 tests. |
| 프로젝트별 통계 (AnalyticsView) | GET /api/projects/{id}/analytics (세션 수·메시지 수·노트북 소스). AnalyticsView 프로젝트 선택 드롭다운·통계 표시. project_session_api·analyticsViewService. |
| 웹/Fast Research·Deep Research | main_server(5002) POST /api/analysis/web-research 연동. WebResearchModal·DeepResearchModal 기본 기동에서 동작. backend/api/analysis_api.py 시뮬레이션. WEB_SEARCH_AND_RESEARCH.md. |
| 백업 및 복구 뷰 | `/backup`(BACKUP_PATH), BackupRecoveryManager lazy 로드. 백업 작업·기록·복구·저장소 탭, API(/backup/jobs·records·recovery-jobs·status·storage-usage) 연동. 12 tests, routes.test·AppUnified.test /backup 렌더 검증. |

---

## 3. 미진한 부분 (채울 항목)

### 3.1 P3 — 코드 품질 (점진)

| 항목 | 상태 | 비고 |
|------|------|------|
| 기타 any 점진 정리 | 🔄 | services any 0, lint:strict 통과. 테스트/일부 컴포넌트 any 남을 수 있음 |
| 새 코드 기준 | ✅ | lint:strict·typecheck 통과 유지 |

### 3.2 P4 — 테스트 커버리지

| 항목 | 상태 | 비고 |
|------|------|------|
| 전체 프로젝트 50% | ✅ | **2026-03-03**: test:coverage — All files 61.27% Stmts, 62.52% Lines. P4 50% 목표 충족. |
| TTS·통합 앱 | ✅ | TTS 252+11 (test:tts:all), AppUnified 5, scriptStyleAPI 100% |
| P4 추가 테스트 (2026-02-20) | ✅ | `npm run test:p4:services`: **8 suites, 148 tests** (위 7 + **pipelineTuningService**). notebookLLMStreamingService, chatService, chatGPTProjectService, fileLearningService, api, intentApi, projectService. projectService getProjects data null 폴백 검증 포함. |
| 추가 테스트 수정 (2026-02-14) | ✅ | SessionManager·WritingAssistant·realTimeCollaboration·webResearch·exportService 141 tests. showToast·errorLogger 모킹, 인라인 모달 검증. |
| 테스트 검증 (2026-02-15) | ✅ | P4 148 + config/store/formatters/ProjectHub 104 통과. TESTING_GUIDE 빠른 검증 패턴 추가. PerformanceOptimizer.test toError 모킹 수정(13 tests). Task B4: projectAnalyticsService·ProjectHub 50 tests, projectShareService·ProjectShareDialog 42 tests. |
| 미커버 구간 | 🔄 | VoiceGenerationView 유닛 테스트 추가 완료. AdvancedFeaturesPanel·qwenTtsService 일부 브랜치 등 점진 추가 권장. |

**권장**: `npm run test:coverage` 실행 후 Statements/Branches 기준으로 낮은 파일부터 테스트 추가.

**추가 테스트 검증 (2026-02-20 이후)**: P4 서비스 **8 suites, 148 tests** — `npm run test:p4:services` (pipelineTuningService 포함). projectService 포함, getProjects API data null 시 로컬 폴백 테스트 추가. 백엔드: `npm run test:backend` → 144 passed.

### 3.3 중기 — 성능·UX·접근성 (확장 범위)

| 항목 | 상태 | 비고 |
|------|------|------|
| 성능 최적화 점검 | 🔄 | **2026-02-26**: Performance 90·LCP 3.0s 달성 (PERFORMANCE.md §2.2). **다음**: Perf 92+·LCP 재측정 — `./scripts/run-lighthouse.sh` (serve 후 실행). §2.6 순서. |
| 사용자 경험(UX) 개선 | 🔄 | 로딩·에러·토스트 문서화·일부 적용 완료(DESIGN_CONSISTENCY_REPORT §6, UX_MESSAGING_GUIDE). **점검**: §6 단기 미진행 점검 표 참고. 온보딩·첫 방문 안내는 추후 권장. |
| 접근성(a11y) 점검 | 🔄 | **Lighthouse Accessibility 91**. AdvancedFeaturesPanel 탭 키보드·ARIA 완료. **다음**: axe-core(E2E @axe-core/playwright)·스크린 리더·키보드 플로우 수동 점검. PERFORMANCE.md §2.5. |
| PWA 검증 | 🔄 | manifest·sw.js·오프라인 폴백 완료. **순차 진행**: [PWA_VERIFICATION.md](PWA_VERIFICATION.md) §3 수동(빌드 서빙→Application 탭) + E2E `E2E_SERVER_READY=1 npx playwright test e2e/pwa.spec.ts`. 푸시 알림·설치 프롬프트 세부는 추후. |
| 웹 검색·Deep Research 연동 문서화 | 🔄 | [WEB_SEARCH_AND_RESEARCH.md](WEB_SEARCH_AND_RESEARCH.md) — 시뮬·로드맵 정리 완료. **순차 진행**: §4 로드맵 1~4 또는 문서 현황 유지. DuckDuckGo 실연은 P2 확장. |

### 3.4 E2E

| 항목 | 상태 | 비고 |
|------|------|------|
| E2E 69 passed 6 skipped (chromium) | ✅ | **2026-03-03**: example 30·pwa 3/2·chat·streamingClient 등. `E2E_SERVER_READY=1 npx playwright test --project=chromium`. `npx playwright install chromium` 사전 필요. |
| 핵심 플로우 E2E | 🔄 | 대화 전송·목소리 생성 이동·**목소리 생성 페이지 TTS 뷰 로드**(example.spec) 추가 완료. 로그인·노트북 전체 플로우는 추후. |

### 3.5 기타

| 항목 | 상태 | 비고 |
|------|------|------|
| typecheck 포함 테스트 파일 | ⬜ | tsconfig에서 테스트 제외 시 테스트 파일 타입 점진 수정 |
| dev:check 실패 시 CI 실패 | ✅ | 타입·린트 실패 시 exit 1 |
| dev:check:frontend | ✅ | **2026-02-14**: pytest 미설치 시 `npm run dev:check:frontend`로 프론트만 검사. scripts/dev-check.sh venv 우선·fallback. |

---

## 4. 완성에 가까워지기 위한 다음 액션

1. **마무리 검증**: §6 **마무리 검증 순서**대로 1→2 실행. 통과 시 완성도 검증 완료.
2. **계속 진행 (배포 전 권장)**: `npm run deploy:check` → `npm run test:views` (20 suites, 105 tests) → (선택) `E2E_SERVER_READY=1 npx playwright test --project=chromium` (69/6). 필요 시 `npm run test:coverage -- --watchAll=false`.
3. **단기 (선택)**: `npm run test:coverage`로 미커버 구간 확인 후 테스트 추가. E2E 서버 띄운 뒤 `E2E_SERVER_READY=1 npm run test:e2e:no-server`로 스킵 감소.
4. **확장 (2~3주)**: 성능·UX·a11y 1차 점검 (Lighthouse, 키보드만으로 목소리 생성 탭 조작). PWA·실시간 웹 검색 검증·문서화. [PERFORMANCE.md](PERFORMANCE.md).
5. **중기 (확장)**: NotebookLM Drive 연동·CI/CD·분석 대시보드 보강 — DEVELOPMENT_SCOPE_MASTER 확장 비전 참고.

---

## 5. 검증 명령 요약

| 목적 | 명령 |
|------|------|
| **마무리 검증 (1·2 한 번에)** | `npm run verify:completion` |
| **완성도 검증 (한 번에)** | `npm run dev:check` |
| **E2E (chromium, 69 passed 6 skipped)** | `E2E_SERVER_READY=1 npx playwright test --project=chromium` (서버·playwright chromium 사전 필요) |
| **P4 서비스 (8 suites, 148 tests)** | `npm run test:p4:services` |
| **확장 뷰·라우트 (20 suites, 105 tests)** | `npm run test:views` |
| **도구 뷰 서비스 (10 suites, 45 tests)** | `npm test -- --testPathPattern=ViewService --watchAll=false` 또는 `npm run test:views:services` |
| TTS만 | `npm run test:tts:all` |
| pipeline_tuning·내부 보안 + 노트북 context·튜닝 (선택, 5 tests) | `npm run test:backend:pipeline-tuning` (또는 `cd backend && pytest tests/test_pipeline_tuning_api.py tests/test_notebook_llm_context_params.py -q`) |
| ultimate_media (선택, 8 tests) | `cd backend && python3 -m pytest tests/test_api.py -v` |
| 통합 앱 테스트 | `npm test -- --testPathPattern="AppUnified" --watchAll=false` |
| 핵심 스위트 (P4+config/store/ProjectHub) | P4: `npm run test:p4:services`. 추가: `npm test -- --testPathPattern="config/__tests__|store/__tests__/projectsSlice|store/__tests__/uiSlice|formatters.test|ProjectHub.test" --watchAll=false` → 6 suites, 110 tests (TESTING_GUIDE §빠른 검증) |
| 프로젝트 파일 업로드 (선택) | `npm test -- --testPathPattern="projectService|ProjectEditModal|ProjectsPage" --watchAll=false` → projectService·ProjectEditModal 22 tests·ProjectsPage 7 tests |
| 커버리지 확인 | `npm run test:coverage -- --watchAll=false` |
| 대화 파이프라인 메타 (Jest) | `npm run test:frontend:chat-pipeline` | `chatInputUtils`·`streamingClient`·`generationPromptBuilder`·GensparkPipelineExtrasPanel. 유틸 수정 후 `npm run sync:frontend-chat-input-utils`로 `frontend/src` 미러 동기화(선택) |

---

## 6. 마무리 검증 순서 (완성도 확인용)

배포·마무리 전 아래 순서로 실행해 모두 통과하면 **완성도 검증 완료**로 간주합니다.

| 순서 | 항목 | 명령 | 비고 |
|------|------|------|------|
| 1 | 품질 (타입·린트) | `npm run dev:check` 또는 `npm run dev:check:frontend` | 백엔드 없으면 dev:check:frontend |
| 2 | P4 서비스 | `npm run test:p4:services` | 8 suites, 148 tests |

**한 번에 실행**: `npm run verify:completion` (1·2 순서로 실행, 실패 시 exit 1)

| 3 | (선택) 확장 뷰·라우트 | `npm run test:views` | 20 suites, 105 tests — 뷰 유닛 + routes.test (도구 메뉴 12개 검증) |
| — | (선택) P2 1·2·3단계 한 번에 | `npm run p2:check` | verify:completion + test:views + test:views:services. 4~6단계: PERFORMANCE.md §2.6 |
| — | (선택) 프로덕션 빌드 | `npm run deploy:check` 또는 `npm run build` | deploy:check = verify:completion + build. 통과 시 build/ 배포 가능. 실제 적용은 [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md) 참고. |
| 4 | (선택) 핵심 스위트 | §5 표 "핵심 스위트" 행 참고 | 6 suites, 110 tests |
| 5 | (선택) TTS | `npm run test:tts:all` | 프론트 254 + 백엔드 11 (백엔드: backend venv에서 pytest 필요) |
| 6 | (선택) Task B4 | §5 표 "Task B4" 행 참고 | 50+42 tests |
| 7 | (선택) ultimate_media | `cd backend && python3 -m pytest tests/test_api.py -v` | 8 tests (venv 필요) |

**최소 마무리**: 1·2 통과 시 핵심 완성도 충족. 3~7은 선택 사항으로 품질 여유 확보용.

---

*완료한 항목은 위 표에서 상태를 🔄 → ✅ 로 바꾸고, 새로 채운 미진 항목은 "이미 완료된 항목"에 추가하면 됩니다.*
