# E2E 테스트 가이드

이 디렉토리에는 Playwright를 사용한 E2E (End-to-End) 테스트가 포함되어 있습니다.

**개발 연속성**: 경로는 [paths.ts](./paths.ts) (routes와 동기화). [docs/DEVELOPMENT_CONTINUITY.md](../docs/DEVELOPMENT_CONTINUITY.md) 참조.

**대화 입력 로직(유닛)**: E2E와 별도로 `npm run test:frontend:chat-pipeline` — `chatInputUtils`·스트리밍 등. 유틸 수정 후 `npm run sync:frontend-chat-input-utils` — [guides/RESPONSE_CLEANING.md](../docs/guides/RESPONSE_CLEANING.md).

**라우트·앱 셸·사이드바(유닛, E2E 전 점검)**: `npm run test:routes` · `npm run test:app-unified` · `npm run test:sidebar-context` — [TESTING_GUIDE.md](../TESTING_GUIDE.md). 원격 push 막힘: [docs/PUSH_BLOCK_HANDOFF.md](../docs/PUSH_BLOCK_HANDOFF.md).

## 사전 준비

**최초 1회**: Playwright 브라우저 설치
```bash
npx playwright install
```
(Chromium·Firefox·WebKit 다운로드. 브라우저 미설치 시 E2E가 실패할 수 있음)

**테스트 픽스처**: `test-fixtures/test-image.png` — imageOptimizer.spec 업로드용. 프로젝트 루트 기준 경로.

## 실행 방법

### 기본 실행
```bash
npm run test:e2e
```
(내부적으로 `npm start`로 webServer 기동, 최대 300초 대기)

### 서버 선실행 후 E2E만 실행 (권장)
```bash
# 터미널 1: npm start 후 "Compiled successfully" 대기
npm run test:e2e:no-server
```

### 스크립트로 서버 기동 + 대기 + E2E
```bash
./scripts/run-e2e-with-server.sh
./scripts/run-e2e-with-server.sh e2e/example.spec.ts  # 특정 스펙만
```
- 포트 3000 선점 시 기존 프로세스 정리 후 `npm start` 실행.
- `E2E_SKIP_REACHABILITY_CHECK=1`로 reachability 체크 생략 후 곧바로 `page.goto` (로컬에서 localhost 접근 가능할 때 사용).

### UI 모드로 실행 (디버깅에 유용)
```bash
npm run test:e2e:ui
```

### 헤드 모드로 실행 (브라우저 창 표시)
```bash
npm run test:e2e:headed
```

### 디버그 모드로 실행
```bash
npm run test:e2e:debug
```

## 주요 data-testid 참조 (E2E 셀렉터)

**상수**: `src/constants/testIds.ts` (단일 소스). `e2e/testIds.ts`가 re-export·`byTestId(id)`·`byTestIdPrefix(prefix)` 제공. 모든 E2E 스펙(example·projectManagement·chat·streamingClient·chatgpt5Interface·imageOptimizer·performance·pwa·lazyLoading)에서 참조.  
스펙에서 안정적으로 사용하는 testid. UI 변경 시 여기·testIds.ts·실제 컴포넌트를 함께 맞출 것.

| testid | 위치 | 용도 |
|--------|------|------|
| `project-list` | Sidebar | 프로젝트 목록 컨테이너 |
| `new-project-button` | Sidebar | 새 프로젝트 만들기 버튼 |
| `edit-project` | ChatGPTInterface (노트북 설정) | 프로젝트 편집/노트북 설정 |
| `project-detail-view` | ChatGPTInterface (메인) | 프로젝트 클릭 시 상세 뷰 래퍼 |
| `project-detail-settings-btn` | ChatGPTInterface (프로젝트 상세 헤더) | 프로젝트 설정 열기 버튼 |
| `project-sources-tab` | ChatGPTInterface (프로젝트) | 대화/소스 탭 중 소스 탭 |
| `project-sources-input-hint` | ChatGPTInterface (소스 탭) | 입력창 위 소스 탭 안내 영역 |
| `project-sources-go-chat-tab-btn` | ChatGPTInterface (소스 탭) | 대화 탭으로 전환 버튼 |
| `messages-container` | ChatGPTInterface | 메시지·소스 목록 스크롤 영역 (`project-content-panel`) |
| `project-edit-modal` | ProjectEditModal | 프로젝트 설정 편집 모달 |
| `project-edit-file-add` | ProjectEditModal | 프로젝트 파일 추가 버튼 |
| `delete-project` | ChatGPTInterface (프로젝트 목록) | 프로젝트 삭제 버튼 |
| `sidebar-conversation-delete` | AppUnified 사이드바 | 대화 줄별 삭제(휴지통) |
| `sidebar-delete-conversation-cancel` / `sidebar-delete-conversation-confirm` | AppUnified | 사이드바 대화 삭제 모달 취소·확정 |
| `chat-delete-conversation` | ChatGPTInterface (헤더) | 현재 대화 스레드 삭제 요청 |
| `chat-delete-conversation-cancel` / `chat-delete-conversation-confirm` | ChatGPTInterface | 대화 삭제 모달 취소·확정 |
| `chat-input` | ChatGPTInterface | 대화 입력 textarea |
| `composer-response-mode` | ChatGPTInterface | 공동입력창 응답 스타일 드롭다운 (Auto/간결/상세) |
| `send-button` | ChatGPTInterface | 전송 버튼 |
| `structured-input-assist-toggle` | ChatGPTInterface | 질문+요구 도우미 퀵 스위치(⚙) |
| `structured-input-guard` | ChatGPTInterface | 질문/요구 누락 자동 보정 가드 버튼 |
| `structured-input-badge` | ChatGPTInterface | 구조화 생성 활성 배지 버튼 |
| `structured-input-preview` | ChatGPTInterface | 질문+요구 미리보기 팝오버 |
| `structured-input-copy` | ChatGPTInterface | 미리보기 복사 버튼 |
| `structured-input-send` | ChatGPTInterface | 미리보기 전송 버튼 |
| `structured-input-close` | ChatGPTInterface | 미리보기 닫기 버튼 |
| `loading-state-initial` | LoadingStateIndicator | 초기 로딩 영역 |
| `loading-state-updating` | LoadingStateIndicator | 업데이트 로딩 영역 |
| `error-recovery` | ErrorRecovery | 에러 복구 블록 |
| `error-boundary` | ErrorBoundary | 에러 바운더리 폴백 UI |
| `progress-indicator` | ProgressIndicator | 진행률 표시 |
| `page-file-analysis` | FileAnalysisChatSystem | 파일 분석 페이지 루트 |
| `page-documents` | AIDocumentGenerator | AI 문서 생성 페이지 루트 |
| `page-analytics` | AnalyticsDashboard | 분석 대시보드 페이지 루트 |
| `page-notebook` | NotebookLLM | 노트북 LLM 페이지 루트 |
| `page-integrated` | IntegratedAIChat | 통합 AI 대화 페이지 루트 |
| `voice-gen-section` | 목소리 생성 | 목소리 생성 모달/섹션 |
| `search-input`, `search-results` | 검색 | 검색 입력·결과 |
| `new-chat-button`, `menu-button`, `drawer`, `menu` | 메뉴·대화 | 새 대화·모바일 메뉴 |
| `optimized-image` | 이미지 최적화 | 최적화된 이미지 |
| `performance-monitor`, `performance-dashboard`, `generate-performance-report`, `performance-report` | 성능 | 성능 모니터·리포트 |
| `offline-indicator`, `update-notification` | PWA | 오프라인·업데이트 알림 |
| `lazy-load-error` | 지연 로딩 | 지연 로딩 에러 |

## 경로 상수 (e2e/paths.ts)

E2E에서 사용하는 경로 상수. `src/config/routes` allAppPaths·VOICE_GENERATION_PATH와 동기화 유지.
- `PATHS.HOME`, `PATHS.PROJECTS`, `PATHS.VOICE_GENERATION` — 공개 경로
- `LEGACY_REDIRECT_PATHS` — 구버전 경로(리다이렉트 검증용): FEATURES, NOTEBOOK, FILE_ANALYSIS, ANALYTICS, FEATURES_MAP
- `NOT_FOUND_PATH` — 404 검증용

경로 변경 시 `routes.ts`와 함께 수정.

## 테스트 파일

### example.spec.ts
기본 앱 기능 테스트 (**33 tests**): 앱 로드·스킵 링크·대화 영역·**홈(/) 입력 영역에 메시지 입력창(chat-input)과 전송 버튼(send-button) 표시**·메시지 전송·`/agents`·프로젝트·설정·문서·템플릿·검색·연동·팀·학습·구독·워크스페이스·자동화·커뮤니티 등 라우트 스모크·구버전 리다이렉트·사이드바 새 대화/프로젝트/목소리 생성·404 등. **baseURL(localhost:3000)에 Dev 서버가 응답하지 않으면** `isServerReachable` 체크로 스킵.

### projectManagement.spec.ts
프로젝트 관리 E2E: 프로젝트 목록 표시·새 프로젝트 생성·편집·삭제·**편집 모달 파일·지침 섹션**·**파일 추가 버튼(project-edit-file-add) 가시성**·**단축키 도움말(프로젝트·대화 팁)** 검증. `data-testid="project-list"`, `new-project-button`, `edit-project`, `delete-project`, `project-edit-file-add` 우선 사용. 목록/버튼이 보일 때까지 대기(최대 8~10초) 후 미표시 시 skip.

### chat.spec.ts
대화 E2E (**15 tests**): 대화 입력 필드·메시지 전송·AI 응답·스트리밍·응답 스타일·에러·**사이드바 대화 삭제** 확정·취소·**ESC 닫기**·**헤더 대화 삭제** 확정·취소·**ESC 닫기**(`sidebar-conversation-delete`, `chat-delete-conversation`, 삭제 확인 `role=dialog`). 추가 수동 검증으로 질문+요구 도우미(누락 가드 클릭 자동 보정, 구조화 배지 미리보기, 복사/전송/닫기, ESC·외부 클릭 닫기, 퀵 스위치 ⚙ 상태 점·툴팁)를 확인. `data-testid="chat-input"`, `send-button` 우선.

### chatgpt5Interface.spec.ts
ChatGPT5/전체 기능 인터페이스 E2E.

### imageOptimizer.spec.ts
이미지 최적화 기능 E2E 테스트 (Jest에서 스킵된 테스트)

### streamingClient.spec.ts
스트리밍 클라이언트 기능 E2E 테스트 (Jest에서 스킵된 테스트)

### performance.spec.ts
성능 관련 E2E (LCP 등).

### pwa.spec.ts
PWA·Service Worker 동작 E2E.

### lazyLoading.spec.ts
지연 로딩 E2E.

## 현재 상태

- **Chromium** (`npm run test:e2e -- --project=chromium`): **약 72 passed, 8 skipped, 0 failed** (스펙 추가 시 증가). webServer 자동 기동 시 기준.
- **스킵 사유**: 서버 미도달(isServerReachable), `E2E_USE_BUILD` 시 AI/에러 테스트 스킵, PWA 사전 캐싱 미구현, 프로젝트 목록 비어 있음·스트리밍 에러 미표시 등 환경 의존 스킵.
- **최근 반영**: 대화 입력창 `disabled={isLoading}` 전용 적용, 사이드바 프로젝트 링크 셀렉터 `aside a[href="/projects"]`, projectManagement 편집 버튼에 `project-detail-settings-btn`·"프로젝트 설정" 추가, 스트리밍 에러 테스트는 에러 미표시 시 스킵. **문서 타이틀**은 `document.title`이 CORBU.AI 기준으로 노출되며, example.spec.ts 타이틀 검증은 `CORBU.AI|React App`, `대화|CORBU.AI`, `프로젝트|CORBU.AI` 등으로 허용.

## 주의사항

- **Playwright 브라우저**: 최초 실행 또는 업데이트 후에는 `npx playwright install`로 Chromium 등 브라우저 바이너리를 설치해야 합니다. 미설치 시 `Executable doesn't exist`로 전체 실패합니다.
- E2E 테스트는 실제 브라우저를 사용하므로 실행 시간이 오래 걸릴 수 있습니다.
- `npm run test:e2e`는 Playwright가 `npm start`로 개발 서버를 띄우지만, CRA 컴파일이 길어 300초 안에 준비되지 않을 수 있습니다. 이 경우 `test:e2e:no-server` 또는 `run-e2e-with-server.sh` 사용을 권장합니다.
- `E2E_SERVER_READY=1`일 때는 webServer를 띄우지 않고 `http://localhost:3000`에 이미 서버가 있다고 가정합니다.
- **샌드박스/CI** 등에서 localhost에 접근 불가한 환경에서는 `isServerReachable`로 skip되거나 `page.goto` 타임아웃이 발생할 수 있습니다. E2E는 **localhost 접근 가능한 환경**에서 실행하는 것을 권장합니다.
- **E2E_SERVER_READY=1**을 설정하면 (1) Playwright가 webServer를 띄우지 않고, (2) example·projectManagement·chat 스펙에서 서버 도달 가능 여부 fetch를 생략하고 곧바로 테스트를 실행합니다. 서버를 수동으로 띄운 뒤 `E2E_SERVER_READY=1 npm run test:e2e:no-server`로 실행할 때 유용합니다.

## CI/CD 통합

GitHub Actions에서 E2E 테스트를 실행하려면 `.github/workflows/e2e.yml` 파일을 참조하세요.

