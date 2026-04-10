# 🧪 테스트 가이드

## 테스트 실행

### 모든 테스트 실행
```bash
npm test
```

### Watch 모드로 실행 (개발 중)
```bash
npm run test:watch
```

### 커버리지 리포트 생성
```bash
npm run test:coverage
```

### CI 모드로 실행
```bash
npm run test:ci
```

### E2E 테스트 (Playwright)
```bash
# 서버 선실행 후 (권장)
npm start   # 터미널 1
E2E_SERVER_READY=1 npm run test:e2e:no-server   # 터미널 2

# 또는 스크립트로 서버 기동 + E2E
./scripts/run-e2e-with-server.sh
```
상세·data-testid·스펙 목록(projectManagement, chat, chatgpt5Interface 등): [e2e/README.md](e2e/README.md)

### 주요 검증 명령
| 목적 | 명령 |
|------|------|
| **마무리 검증 (한 번에)** | `npm run verify:completion` |
| 전체 점검 | `npm run dev:check` |
| 프론트만 (타입+린트) | `npm run dev:check:frontend` |
| 타입만 (빠른 검사) | `npm run quick-check` (tsconfig.build.json, 테스트 제외) |
| P4 서비스 (8 suites, 148 tests) | `npm run test:p4:services` |
| 확장 뷰·라우트 (뷰 유닛 + routes.test) | `npm run test:views` (20 suites, 105 tests) |
| 도구 뷰 서비스 (10 suites, 45 tests) | `npm test -- --testPathPattern=ViewService --watchAll=false` 또는 `npm run test:views:services` |
| TTS (프론트+백엔드) | `npm run test:tts:all` |
| 백엔드 pytest | `npm run test:backend` |
| **Q→A 파이프라인 스모크 (백)** | `npm run test:backend:pipeline-smoke` → `run-backend-pipeline-smoke.sh` + `lib-backend-python.sh`(`venv`/`.venv` 중 `import pytest`) · Verifier·검수 재작성·Writer·라우터·플래너 |
| **파이프라인 튜닝 API + 노트북 context (백)** | `npm run test:backend:pipeline-tuning` → `run-backend-pipeline-tuning.sh`(`import pytest, fastapi`), 5 tests |
| **대화 파이프라인 메타 (프론트 Jest)** | `npm run test:frontend:chat-pipeline` (`chatInputUtils`·`streamingClient`·`generationPromptBuilder`·**GensparkPipelineExtrasPanel**) — 보조 트리 `frontend/src`의 `chatInputUtils`는 `npm run sync:frontend-chat-input-utils`로 루트와 맞출 수 있음 |
| **백+프론 파이프라인 관련 한 번에 (2배 속도 점검)** | `npm run test:dev:dual-pipeline` |
| ultimate_media (선택, 8 tests) | `cd backend && python3 -m pytest tests/test_api.py -v` |

**test:p4:services `testPathPattern`**: 정규식에서 `.`는 임의 문자이므로 `projectService.test`만 쓰면 `chatGPTProjectService.test`까지 걸릴 수 있음 → `projectService\.test`·`chatService\.test` 등으로 이스케이프하고, `chatGPTProjectService`는 의도적으로 별도 OR로 포함함(`package.json`).

**Jest·중복 `__mocks__` 경고**: 루트 `src/`와 보조 트리 `frontend/src/`에 같은 이름의 수동 목(`styleMock.js`, `persistentChatSessionService` 등)이 있으면 `jest-haste-map: duplicate manual mock`가 뜰 수 있음. CRA `package.json` Jest는 `modulePathIgnorePatterns`/`roots` 재정의가 막혀 있어, 실제 실행 스위트는 `testMatch`가 `src/` 테스트만 잡으므로 **대개 무시해도 됨**. 보조 트리만 단독으로 `npm test --prefix frontend` 할 때는 해당 트리 목이 사용됨.

**Jest(CRA)**: `GensparkPipelineExtrasPanel`·`UltimateChatGPTInterface` 등은 `react-markdown`·`remark-gfm` ESM 때문에 해당 테스트 파일 상단에서 모킹함(`GensparkPipelineExtrasPanel.test.tsx`, `UltimateChatGPTInterface.test.tsx`, `ChatGPTInterface.test.tsx` 계열).

**React**: `onClick={handler}`는 **이벤트 객체**를 첫 인자로 넘깁니다. `handler(directText?: string)`처럼 선택 문자열을 받는 함수는 `onClick={() => void handler()}`로 감싸고, 입력은 `chatInputUtils.coerceTrimmedString(primary, fallback)`로 정규화(예: `ChatGPTInterface.sendMessage`, `ModernChatInterface`, `IntegratedMasterInterface`, `UltimateChatGPTInterface`, `ChatGPT5CompleteInterface`, `ChatGPTStyleInterface`, `IntegratedAIChat`, `Chat/ChatInterface`, `FileAnalysisChatSystem`, `AdvancedFeaturesPanel` 품질 예측 텍스트, `AdvancedAIEngine`, `SimpleChatView`, 웹/딥 리서치 모달·`NewsSearch`·`NotebookLLM`·`ConversationGraphView`, `AICodeGenerator`/`AIDesignSystem`, `ProjectCreationModal`, `ProjectCreateModal`/`ProjectEditDialog`, `MarketingContent`/`PersuasionContent`/`CreativeWriting`, `AdvancedAIFeatures`, `MessageModifyRequestDialog`, `WritingQualityPanel`, `MessageEditor`, `AdvancedSearch`/`AdvancedSearchPanel`). `ChatGPTInterface`는 `inputTrimmed`로 UI·canSend·구조화 미리보기 전송과 동일 기준 유지. 퀵 액션 직후 전송은 `void handler(문자열)` override로 처리. `type="submit"` 버튼은 폼 `onSubmit` 한 경로만 두어 이중 전송을 피합니다.

**수동(프로젝트 · 대화)**: 대화 **JSON 보내기 → 가져오기** 시 `pipelineExtras`·`suggestedFollowUps`·반응·`projectId`·`pinned`·생성/수정 시각(ISO)이 파일에 포함·복원됨(`ChatGPTInterface` `exportConversation`/`importConversation`).

**수동(Ultimate 화면)**: **⌘/Ctrl+S**는 `localStorage` 키 `corbu_ai_conversation`에 저장하며, **페이지 새로고침 후 마운트 시** 같은 키에서 메시지·프로젝트·`pipelineExtras` 등을 복원함(`UltimateChatGPTInterface`).

**참고**: 일상 개발·실행 명령은 [DEVELOPMENT.md](DEVELOPMENT.md), 프로젝트 허브(Task B4) 테스트 요약은 [TASK_B4_DEVELOPMENT_REPORT.md](TASK_B4_DEVELOPMENT_REPORT.md). **마무리 검증 순서**는 [docs/COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) §6 참고.  
**대화 API**: `/api/chat`, `/api/chat/stream`. 전달 필드: `context.conversation_history`(최근 20턴), `project_id`, `request_id`, `diversity`, `temperature`. 프로젝트 맥락: `context.project_files`(참고 파일 목록), `context.project_instructions`(프로젝트 지침) — 백엔드에서 projectKnowledge에 반영.
**수동·E2E 검증(프로젝트·대화)**: 대화→프로젝트 드래그 앤 드롭, 프로젝트 편집에서 파일 추가(project-edit-file-add)·지침 저장, ⌘? 단축키 도움말(프로젝트·대화 팁 3항목). data-testid: `project-list`, `new-project-button`, `edit-project`, `delete-project`, `project-edit-file-add`.
**수동·E2E 검증(질문+요구 도우미)**: `chat-input`에 `질문:`/`요구사항:` 입력 → 누락 가드 표시·원클릭 자동 보정, 구조화 배지 클릭 시 미리보기(복사/이 형식으로 전송/닫기), ESC·외부 클릭 닫기, 퀵 스위치(⚙) ON/OFF 상태 점·툴팁 확인. data-testid: `chat-input`, `send-button`.
**빠른 검증**: ① `npm run test:p4:services` → 8 suites, 148 tests. ② `npm test -- --testPathPattern="config/__tests__|store/__tests__/projectsSlice|store/__tests__/uiSlice|formatters.test|ProjectHub.test" --watchAll=false` → 6 suites, 110 tests.

**다음 단계(선택)**: E2E — `npm start` 후 `E2E_SERVER_READY=1 npm run test:e2e:no-server`. 커버리지 — `npm run test:coverage`. TTS 전체 — `npm run test:tts:all` (백엔드 11은 backend venv에서 `python3 -m pytest tests/test_tts_api.py -v`). ultimate_media — venv에서 `python3 -m pytest tests/test_api.py -v` (txt/csv/spreadsheet·지식베이스·persuasion·export, 8 tests).

## 테스트 구조

### 유틸리티 테스트
- `src/utils/__tests__/retryHandler.test.ts` - 재시도 로직(retry·retryApiCall·retryWithNetworkCheck·429/5xx·NetworkMonitor) 테스트
- `src/utils/__tests__/performance.test.ts` - 디바운스·스로틀·메모이제이션·가상 스크롤(calculateVirtualScroll)·measurePerformance·batchUpdates 테스트
- `src/utils/__tests__/topicDetector.test.ts` - 토픽 감지 테스트
- `src/utils/__tests__/toast.test.ts` - 토스트 이벤트(showToast, onToast) 테스트
- `src/utils/__tests__/formatters.test.ts` - 포맷터(formatDate, formatDuration, formatNumber(0), formatPercentage(0) 등, 29 tests)
- `src/utils/__tests__/errorMessages.test.ts` - 에러 메시지(getUserFriendlyError, getErrorColor, getErrorIcon, isValidHttpUrl) 테스트
- `src/utils/__tests__/writingExport.test.ts` - 글쓰기 내보내기(exportToText, exportToMarkdown, copyToClipboard 등)
- `src/utils/__tests__/storageCleaner.test.ts` - 로컬 스토리지 정리(cleanLocalStorage, forceRefreshFileList, resetProjectData)

### 설정(config) 테스트
- `src/config/__tests__/api.test.ts` - API_BASE_URL, WS_BASE_URL, API_ENDPOINTS, FRONTEND_DEFAULT_PORT, 빈 문자열·엔드포인트 값 검증 (12 tests)
- `src/config/__tests__/routes.test.ts` - defaultRoutes, routeCategories, navigationConfig, VOICE_GENERATION_PATH, allAppPaths, getPageTitle, 확장 경로 12개 제목·allAppPaths 포함 (11+ tests)

**컴포넌트·라우트 매핑**: [docs/COMPONENT_ARCHITECTURE.md](docs/COMPONENT_ARCHITECTURE.md)

### 훅 테스트
- `src/hooks/__tests__/useApiStatus.test.ts` - API 상태 훅(성공/실패/refetch/타임아웃) 테스트
- `src/hooks/__tests__/useDebounce.test.ts` - 디바운스 훅(초기값·지연 업데이트·연속 변경·delay 0) 테스트
- `src/hooks/__tests__/useThrottle.test.ts` - 스로틀 훅(호출 제한·지연 후 허용·인자 전달·delay 0) 테스트

### 스토어(Redux) 테스트
- `src/store/__tests__/projectsSlice.test.ts` - 프로젝트 slice
- `src/store/__tests__/sessionsSlice.test.ts` - 세션 slice
- `src/store/__tests__/uiSlice.test.ts` - UI slice

### 컴포넌트 테스트
- `src/components/__tests__/AdvancedFeaturesPanel.test.tsx` - 고급 기능 패널(음성 인식·이미지 분석·예측·목소리 생성·Brainwave 결과 UI 포함, 199 tests)
- `src/components/__tests__/ErrorRecovery.test.tsx` - 에러 복구 컴포넌트 테스트
- `src/components/__tests__/ProgressIndicator.test.tsx` - 진행률 표시 컴포넌트 테스트
- `src/components/__tests__/ProjectHub.test.tsx` - 프로젝트 허브(Task B4): 통계·검색·필터·정렬·뷰 전환·메뉴
- `src/components/ProjectManagement/__tests__/ProjectEditModal.test.tsx` - 프로젝트 편집 모달: 렌더링·파일·지침·운영 템플릿(도시정비/재건축 수주)·파일 추가·저장·가이드라인·품질 점검·복구·A/B 비교(22 tests)

### 뷰(Views) 테스트
- `src/views/ProjectsPage.test.tsx` - 프로젝트 페이지: 로딩 완료 후 제목·목록 렌더링, getProjects 실패 시 빈 목록(2 tests)
- `src/views/SimpleChatView.test.js` - 간단 대화 뷰: 헤더·환영 메시지·입력·전송·빠른 액션
- **확장 뷰(도구 메뉴 12개)**: SettingsView, AnalyticsView, DocsView, TemplatesView, SearchView, IntegrationsView, TeamView, LearnView, BillingView, WorkspaceView, AutomationView, CommunityView — 각 `*.test.tsx`에서 h1 + 첫 섹션 h2 검증. 라우트: `src/config/__tests__/routes.test.ts`(getPageTitle·allAppPaths). E2E: `e2e/example.spec.ts`에서 확장 경로 접근 후 뷰+h2 표시·사이드바 도구 메뉴 검증. 상세: [src/views/README.md](src/views/README.md) §확장 뷰 검증.

### 서비스 테스트 (예시)
- `src/services/__tests__/projectService.test.ts` - getProjects/getProject/uploadProjectFile(성공·data.file 없음·네트워크 오류)·createProject/updateProject/deleteProject·노트북 컨텍스트·대화·메시지 등
- `src/services/__tests__/projectAnalyticsService.test.ts` - 프로젝트 통계·비교·인사이트(Task B4)
- `src/services/__tests__/projectShareService.test.ts` - 프로젝트 공유 링크 생성·검증·접근 기록(Task B4-4)
- `src/services/__tests__/notebookLLMService.test.ts` - 도메인 지식·buildIntelligentContext·keyPoints·형식 지시(댓글·기사·디테일 50~150자·15~25자·댓글 학습·여러 사람이 쓴 느낌 검증 포함, 73 tests)
- `src/services/__tests__/writingStyleService.test.ts` - 44개 글쓰기 스타일·getStyleInstruction·generatePrompt(34 tests)
- `src/services/__tests__/fileStorageService.test.ts` - 프로젝트 파일 저장·삭제·복구·getDeletedFiles·getAllProjectIds(20 tests)
- `src/services/__tests__/webResearchService.test.ts` - 웹 연구(performWebResearch·formatWebResearchResponse·getWebResearchDescription, 27 tests)

### 백엔드 테스트 (pytest)
- `backend/tests/test_project_session_api.py` - 프로젝트·세션 API
- `backend/tests/test_main_server.py` - main_server 헬스·엔드포인트
- `backend/tests/test_main_api.py` - Flask main API (health·intent·chat·projects)
- `backend/tests/test_intent_analysis.py` - 의도 분석 공유 모듈
- `backend/tests/test_unified_chat_api.py` - 통합 대화 API
- `backend/tests/test_generation_scenario.py` - 생성 시나리오 마크다운·Verifier 다중요청·클라이언트 시나리오 병합·옵트인 응답 메타
- `backend/tests/test_llm_service_helpers.py` - `LLMService` 안전 토큰·온도·히스토리·`_enhance_with_knowledge` 생성 시나리오 프리픽스(네트워크 불필요)
- `backend/tests/test_orchestrator_verifier_rewrite.py` - Q→A 검수 1회 재작성(`pipeline_verifier_rewrite`) 스모크
- `backend/tests/test_writer_verifier_polish_hints.py` - Writer LLM 프롬프트에 검수 피드백 블록 주입
- `backend/tests/test_api.py` - ultimate_media (선택): txt/csv·지식베이스·persuasion·export (8 tests). ultimate_media_knowledge_system import 가능 시 실행.

## 단위·통합·E2E 테스트 구분

| 유형 | 대상 | 실행 방법 | 비고 |
|------|------|----------|------|
| **단위** | 유틸·훅·slice·개별 함수 | `npm test -- --testPathPattern="utils/__tests__|hooks/__tests__|store/__tests__|formatters|config/__tests__"` | 독립 실행, 의존성 모킹 |
| **서비스 통합** | API·대화·프로젝트·파일 학습 | `npm run test:p4:services` (8 suites, 148 tests) | projectService·chatService·fileLearningService·notebookLLMStreamingService·pipelineTuningService 등 |
| **컴포넌트** | UI·상호작용 | `npm test -- --testPathPattern="AdvancedFeaturesPanel|ProjectHub|ProjectEditModal|ProjectsPage|SimpleChatView"` | RTL, user-event |
| **백엔드** | API 엔드포인트 | `npm run test:backend` | pytest, FastAPI TestClient |
| **E2E** | 전체 흐름 | `E2E_SERVER_READY=1 npm run test:e2e:no-server` | Playwright, 실제 브라우저 |

### 검증 명령별 스코프

| 명령 | 포함 테스트 | 용도 |
|------|------------|------|
| `npm run dev:check` | 백엔드 5개 스펙 + 타입 + 린트 | 커밋 전 일상 점검 |
| `npm run dev:check:frontend` | 타입 + 린트 (백엔드 제외) | venv 없을 때 프론트만 |
| `npm run verify:completion` | dev:check:frontend + test:p4:services | 마무리·배포 전 검증 |
| `npm run test:p4:services` | notebookLLMStreamingService·chatService·fileLearningService·api·intentApi·projectService | 대화·프로젝트·파일 핵심 |
| `npm run test:tts:all` | AdvancedFeaturesPanel·scriptStyleAPI·qwenTtsService + backend test_tts_api | TTS·목소리 생성 |
| `npm run test:e2e:no-server` | example.spec·projectManagement·chat 등 | 라우트·사이드바·프로젝트 E2E |

### 통합 테스트 시나리오 요약

- **대화·프로젝트**: projectService(getProjects·uploadProjectFile·createProject), chatService, notebookLLMStreamingService
- **파일·학습**: fileLearningService, projectService 노트북 컨텍스트
- **라우트·경로**: config/routes.test, e2e example.spec (PATHS·LEGACY_REDIRECT_PATHS)
- **프로젝트 관리**: ProjectEditModal·ProjectHub·projectsSlice·sessionsSlice
- **상세**: [docs/COMPONENT_ARCHITECTURE.md](docs/COMPONENT_ARCHITECTURE.md), [docs/DEVELOPMENT_CONTINUITY.md](docs/DEVELOPMENT_CONTINUITY.md)

## 테스트 작성 가이드

### 1. 유틸리티 함수 테스트

```typescript
import { functionName } from '../utils/utility';

describe('utility', () => {
  it('should do something', () => {
    const result = functionName();
    expect(result).toBe(expected);
  });
});
```

### 2. React 컴포넌트 테스트

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from '../Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### 3. 비동기 함수 테스트

```typescript
import { waitFor } from '@testing-library/react';

it('should handle async operations', async () => {
  const mockFn = jest.fn().mockResolvedValue('data');
  
  await waitFor(() => {
    expect(mockFn).toHaveBeenCalled();
  });
});
```

## 테스트 커버리지 목표

- **유틸리티 함수**: 80% 이상
- **컴포넌트**: 70% 이상
- **서비스**: 75% 이상

## 스킵된 테스트(it.skip) 복구

일부 테스트는 `it.skip`으로 비활성화되어 있으며, 복구 방법은 해당 파일 주석에 적혀 있습니다.

| 파일 | 비고 |
|------|------|
| `src/components/__tests__/IntegratedMasterInterface.test.tsx` | 시스템 상태 조회 실패·분석 데이터 조회 실패 시 에러 로깅 검증 — fetch mock 순서/describe 격리 이슈. 주석에 mockImplementation·afterEach 복구 방안 안내. |

스킵 해제 시: 주석의 복구 방안을 적용한 뒤 `it.skip` → `it`으로 변경하고, `npm run test:views` 또는 해당 스위트만 실행해 회귀 여부를 확인하세요.

## 모킹 가이드

### API 호출 모킹
```typescript
jest.mock('../services/apiService', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' }),
}));
```

### 브라우저 API 모킹
```typescript
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});
```

## 베스트 프랙티스

1. **테스트는 독립적이어야 함**: 각 테스트는 다른 테스트에 의존하지 않아야 합니다.
2. **명확한 테스트 이름**: 테스트 이름은 무엇을 테스트하는지 명확히 해야 합니다.
3. **AAA 패턴**: Arrange, Act, Assert 패턴을 따르세요.
4. **모킹 최소화**: 필요한 경우에만 모킹을 사용하세요.
5. **실제 사용 사례 테스트**: 실제 사용 시나리오를 테스트하세요.

