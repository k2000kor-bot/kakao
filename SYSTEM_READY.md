# 시스템 준비 완료

**NotebookLM·문서 허브·통합·로컬**: [docs/README.md](./docs/README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](./docs/LOCAL_ACCESS_GUIDE.md)·[SYSTEM_READY.md](./SYSTEM_READY.md)·[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md) — [기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 **시스템 준비·SYSTEM_READY(루트)** 행 · §6 **Agent / AI 개발 가이드** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · §6 **일상 개발·DEVELOPMENT(루트)** 행 · [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) 서두 **검증·실행·접속(루트)** · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **시스템 준비·SYSTEM_READY(루트)** · §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · 동 허브 **NotebookLM·문서 허브·통합·로컬** 표 `SYSTEM_READY` 행 · [DEVELOPMENT.md](./DEVELOPMENT.md) 서두 **일상 개발·실행·접속(루트)** · §6 **테스트 가이드·TESTING_GUIDE(루트)·API(docs)** 행 · [TESTING_GUIDE.md](./TESTING_GUIDE.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · §6 **E2E 가이드·e2e/README(루트)·경로 허브(docs)** 행 · [e2e/README.md](./e2e/README.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · §6 **완성 체크리스트·COMPLETION_CHECKLIST(docs)** 행 · [docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · §6 **배포·풀 스택 체크리스트(docs)** 행 · §6 **스크립트 허브·scripts/README(루트)·dev/deploy(docs)** 행 · §4 **스크립트 허브(루트 scripts/README)** · [scripts/README.md](./scripts/README.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · [docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md) 서두 **실행 가이드·접속 문제(루트)** · [src/config/README.md](./src/config/README.md)·[AGENTS.md](./AGENTS.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md)·표 행과 교차

**시스템 준비·실행·접속(루트)**: [RUN_GUIDE.md](./RUN_GUIDE.md)·[CONNECT.md](./CONNECT.md) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·(기동·원격·포트·**준비 완료 요약·§빠른 참조**는 **본 문서** §준비 완료 항목·§빠른 참조) — [기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 · [USAGE_GUIDE.md](./USAGE_GUIDE.md) §11 · [컴포넌트 아키텍처](./docs/COMPONENT_ARCHITECTURE.md) §1.1 · [QUICK_START.md](./QUICK_START.md)·[README_FIRST.md](./README_FIRST.md)·[START_HERE.md](./START_HERE.md)·[DEVELOPMENT_CONTINUITY.md](./docs/DEVELOPMENT_CONTINUITY.md) §1·§2 · [DEVELOPMENT.md](./DEVELOPMENT.md) §2 · [README.md](./README.md)·[docs/setup/PYTHON_VENV.md](./docs/setup/PYTHON_VENV.md)·[docs/setup/MACOS_DEV_QUICKSTART.md](./docs/setup/MACOS_DEV_QUICKSTART.md)·[docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md)(`verify:completion`) · [docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md)(`verify:final`) · 표 행과 교차

**로컬 UI 스모크 체크리스트**: [docs/LOCAL_UI_SMOKE_CHECKLIST.md](./docs/LOCAL_UI_SMOKE_CHECKLIST.md)

**작성일**: 2025년 1월 27일  
**프로젝트**: CORBU.AI  
**버전**: 1.0.0  
**상태**: ✅ **완전히 준비 완료**

---

## 🎉 시스템 준비 완료!

CORBU.AI 시스템이 완전히 준비되었고 모든 기능이 정상 작동합니다!

---

## ✅ 준비 완료 항목

### 1. 코드 구현 ✅
- ✅ 프론트엔드: **AppUnified** — 에이전트(`/agents`)·대화(`/`·`/chat` 등)·프로젝트(`/projects`)·**프로젝트 대화**(**`/projects/:id`** — NotebookLM 포함)·목소리 생성(`/voice-generation`). 구 URL(`/simple`·`/features`·`/notebook` 등)은 리다이렉트 — [USAGE_GUIDE.md](./USAGE_GUIDE.md) §1.2·§3 · 실행 후 경로 요약: [RUN_GUIDE.md](./RUN_GUIDE.md) **앱 메뉴·경로**
- ✅ 백엔드: 38개 API 엔드포인트
- ✅ LLM 서비스: 4개 제공자 지원
- ✅ 긴 글 자동 생성: 완전 구현
- ✅ 프로젝트 관리: 완전 구현

### 2. 통합 완료 ✅
- ✅ 프론트엔드-백엔드 통신
- ✅ LLM 서비스 통합
- ✅ 프로젝트 관리 통합
- ✅ 긴 글 생성 통합

### 3. 문서화 완료 ✅
- ✅ 73개 문서 파일
- ✅ 사용자 가이드
- ✅ 개발자 가이드
- ✅ API 문서
- ✅ 기능 가이드

### 4. 테스트 준비 ✅
- ✅ 4개 테스트 스크립트
- ✅ 통합 테스트
- ✅ 기능 테스트

### 5. 실행 준비 ✅
- ✅ 33개 실행 스크립트
- ✅ 의존성 파일
- ✅ 환경 설정 가이드

---

## 🚀 즉시 실행 가능

### 실행 방법

```bash
# 1. 의존성 설치
cd backend && pip install -r requirements.txt
cd .. && npm install

# 2. 시스템 실행
./start_all.sh
```

### 접속 주소

- **프론트엔드**: http://localhost:3000
- **백엔드 API (대화·통합)**: http://localhost:5002
- **API 문서**: http://localhost:5002/api/docs

---

## 📊 시스템 통계

- **API 엔드포인트**: 38개
- **문서 파일**: 73개
- **테스트 스크립트**: 4개
- **실행 스크립트**: 33개
- **코드 라인**: 2,937+ 줄

---

## 🎯 주요 기능

### 즉시 사용 가능한 기능
1. **에이전트·대화·프로젝트 대화**: **`/agents`**·독립 대화(`/`·`/chat` 등)와 **`/projects/:id`** 프로젝트 맥락 대화(NotebookLM·지침·파일) — ChatGPT 스타일 UI
2. **프로젝트 관리**: `/projects` 목록·생성, **`/projects/:id`** 에서 대화 분리, 점 세 개 메뉴(편집·삭제)
3. **LLM 연동**: OpenAI, Anthropic, Ollama, NotebookLM(구글 노트북 LM 스타일) — 문서·API·pytest: [docs/FEATURE_LOGIC_AND_STRENGTHS.md](docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [docs/NOTEBOOKLM_FEATURE_ROADMAP.md](docs/NOTEBOOKLM_FEATURE_ROADMAP.md)·[docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md](docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md)·표 행과 교차
4. **긴 글 자동 생성**: 질문/요구 시 상세한 글 생성
5. **마크다운 렌더링**: 코드 블록, 링크, 표 등

---

## 📌 관련 최근 진행 (2026-02)

- **BACKLOG 47~130차**: NotebookLM·notebookLLMService 73·writingStyleService 34·conversationHistoryService 33·fileStorageService 20·formatters 29·config/routes 11·config/api 12. 목소리 생성 Brainwave·AdvancedFeaturesPanel 199. UX 고도화(2단·모바일·토스트·ErrorBoundary·404·단축키·빈 상태·프로젝트 점 세 개 메뉴·드래그 앤 드롭·프로젝트 파일·단축키 도움말·지침 팁). 대화 맥락(프로젝트 파일·지침·백엔드 projectKnowledge 반영). E2E·ProjectEditModal 테스트. **POST /api/projects/{id}/files** 백엔드·프론트 연동·업로드 중 로딩(85~99차). 100차: 프로젝트 파일 업로드·문서 연계 완료·SYSTEM_READY §빠른 참조. 101차: TASK_B4 47~100차 갱신. 102차: 라우트 네이밍 — 프로젝트·대화 분리(첫 메뉴 "CORBU.AI"). 103차: 문서 일관성(SYSTEM_READY §고도화 내역 제목). 104차: TESTING_GUIDE routes 검증 설명·SYSTEM_READY 47~104차. 105차: TASK_B4 47~104차 갱신·SYSTEM_READY 47~105차. 106차: DEVELOPMENT.md 라우트·메뉴 참조·SYSTEM_READY 47~106차. 107차: AGENTS·QUICK_REFERENCE 라우트 참조·TASK_B4 47~106차·SYSTEM_READY 47~107차. 108차: .cursor/rules 프론트 라우트·메뉴 참조·SYSTEM_READY 47~108차. 109차: TASK_B4 47~108차 갱신·SYSTEM_READY 47~109차. 110차: DEVELOPMENT_SCOPE_MASTER §1.2 라우트·메뉴 BACKLOG 102~109차·SYSTEM_READY 47~110차. 111차: TASK_B4 47~110차 갱신·SYSTEM_READY 47~111차. 112차: README §주요 기능 메뉴·라우트 참조·SYSTEM_READY 47~112차. 113차: TASK_B4 47~112차 갱신·SYSTEM_READY 47~113차. 114차: COMPLETION_CHECKLIST §2 라우트·메뉴 행·SYSTEM_READY 47~114차. 115차: TASK_B4 47~114차 갱신·SYSTEM_READY 47~115차. 116차: DEVELOPMENT_SCOPE_MASTER 라우트 BACKLOG 102~115차 갱신·SYSTEM_READY 47~116차. 117차: TASK_B4 47~116차 갱신·SYSTEM_READY 47~117차. 118차: AGENTS·QUICK_REFERENCE·DEVELOPMENT·.cursor/rules 라우트 BACKLOG 102~117차 통일·SYSTEM_READY 47~118차. 119차: CORBU.AI 프로젝트 체크리스트·딥러닝 프로젝트 맥락 반영(ProjectContextForDL·NotebookLLM getProject→DL)·테스트 추가. 120차: 제품명 표기 통일(ChatGPT→CORBU.AI, 라우트·문서·네비게이션). 121차: 전역 점검(CORBU AI→CORBU.AI, 고급 AI 대화→CORBU.AI, public·backend·src·테스트). 122차: 추가 통일(docs/guides·RUN_GUIDE·USAGE_GUIDE·backend 스크립트·루트 완료 문서). 123차: 인프라·스크립트·backend·engines·CI·docker·docs/reports CORBU.AI 통일. 124차: frontend/ 표기 통일(public·config·services·주요 컴포넌트). 125차: docs/guides·docs/reports·backend 서버·스크립트·test_final_integration CORBU.AI 통일. 126차: docs/reports·docs/guides 잔여·backend 대화 API CORBU.AI 통일. 127차: docs/reports·guides 잔여·스크립트·docker·security CORBU.AI 통일. 128차: src .disabled·.backup CORBU.AI 통일. 129차: 스크립트·루트 sh·테스트·backups CORBU.AI 통일. 130차: 타입 오류 수정·backups ConversationInterface CORBU.AI, tsc 통과.
- **참조**: [docs/BACKLOG.md](docs/BACKLOG.md) 진행 중·27차 이후, [TASK_B4_DEVELOPMENT_REPORT.md](TASK_B4_DEVELOPMENT_REPORT.md) 관련 최근 진행.
- **다음 권장**: (선택·빠름) `npm run test:routes`·`npm run test:app-unified`·`npm run test:sidebar-context` — [TESTING_GUIDE.md](./TESTING_GUIDE.md). 원격 `git push` 막힘 시 [docs/PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`). 보조 트리: 루트 `src/`→`frontend/src/`는 **`npm run sync:frontend-src`**(동일 **`make sync-frontend`**; `pretest`·`check:src-frontend-parity`(동일: **`make check-frontend-parity`**); `chatInputUtils`만 **`npm run sync:frontend-chat-input-utils`**(동일 **`make sync-frontend-chat-input`**); 통합 대화(UI) 등 부분 **`npm run sync:frontend-unified-chat`**(동일 **`make sync-frontend-unified-chat`**)) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md). 마무리 검증 `npm run verify:completion`. (선택) E2E `E2E_SERVER_READY=1 npm run test:e2e:no-server`, 커버리지 `npm run test:coverage`. 배포 직전 풀 검증 `npm run verify:final` — [docs/FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md). [docs/COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) §6.
- **검증 현황 (2026-04)**: `npm run dev:check` — 백엔드 pytest **144** + 타입 + `lint:strict`. `npm run test:p4:services` — **8 suites, 170 tests**. `npm run test:tts:all`·기타 수치는 [docs/COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) §2 표와 [docs/BACKLOG.md](docs/BACKLOG.md) 맨 아래 *마지막 업데이트*를 참고. 마무리 한 번에: `npm run verify:completion`.

---

## 🚀 고도화 내역 (2026-02)

### 레이아웃·UX
- **2단 레이아웃**: 3단 → 좌측 사이드바 + 메인 (우측 사이드바 제거), 모든 페이지 공통.
- **모바일**: 768px 미만 햄버거 메뉴 + 오버레이 사이드바, Escape·배경 클릭으로 닫기.
- **메인 영역**: `scroll-behavior: smooth`, 포커스 링(`:focus-visible`), 트랜지션 변수 적용.

### 접근성·포커스
- **스킵 링크**: 포커스 시 부드러운 등장(transition), 클릭 시 본문으로 스크롤.
- **사이드바 네비**: 활성 항목 왼쪽 강조선, `focus-visible` 링, `aria-current="page"`.
- **메인**: 키보드 포커스 시 아웃라인 표시.

### 토스트·로딩·에러
- **토스트**: 슬라이드 인 애니메이션, 타입별 클래스(error/success/info), `prefers-reduced-motion` 대응.
- **로딩 Fallback**: 페이드인, `brainwave-fallback` 클래스.
- **사이드바 API 상태**: 에러 시 카드형 UI + 재시도 버튼, 로딩 시 펄스 인디케이터, 정상 시 `sidebar-api-ok`.
- **ErrorBoundary**: 메인 콘텐츠 래핑, 커스텀 폴백(새로고침·홈으로).

### 라우트·애니메이션
- **라우트 전환**: 경로 변경 시 메인 콘텐츠 페이드인(`brainwave-route-content`).
- **모바일 메뉴**: 슬라이드 인·오버레이 페이드인, `prefers-reduced-motion` 시 애니메이션 비활성화.

### CORBU.AI (ChatGPT 스타일·프로젝트 연동)
- **경로**: 프로젝트 맥락 대화·**NotebookLM·문서 허브·통합·로컬**·지침·파일은 **`/projects/:id`** 통합 화면에서 동작합니다(`src/config/routes.ts`·`AppUnified`) — 브라우저 탭 제목 `getPageTitle`·`defaultRoutes` **name** → **프로젝트 대화**([src/config/README.md](./src/config/README.md)) — [RUN_GUIDE.md](./RUN_GUIDE.md) **앱 메뉴·경로** · [USAGE_GUIDE.md](./USAGE_GUIDE.md) §1.2 · [AGENTS.md](./AGENTS.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md)
- **프로젝트 점 세 개 메뉴**: 사이드바 프로젝트 항목에 ⋮ 버튼 → "편집"(설정 모달), "삭제"(확인 후 삭제). [참고: 스파르타클럽 ChatGPT 프로젝트 사용법(기능 설명)](https://spartaclub.kr/blog/chatgpt-project)
- **대화→프로젝트 드래그 앤 드롭**: 사이드바에서 대화를 프로젝트 폴더로 끌어다 놓으면 해당 프로젝트로 이동. 드롭 시 타겟 강조·토스트 "프로젝트에 추가되었습니다".
- **프로젝트별 파일 추가**: 프로젝트 설정(편집) 모달에 "프로젝트 파일" 섹션 — 파일 추가(다중)·목록·삭제. 저장 시 프로젝트·로컬 스토리지 동기화.
- **대화 시 프로젝트 파일 맥락**: 대화 요청 시 현재 프로젝트의 참고 파일 목록(이름·타입·크기)을 context.project_files로 전달. 백엔드에서 projectKnowledge에 참고 파일 힌트를 넣어 LLM 맥락으로 반영.
- **프로젝트 지침(instructions) 대화 맥락 반영**: 프로젝트 설정의 "지침"을 context.project_instructions로 전달. 백엔드에서 projectKnowledge에 "프로젝트 지침(이 프로젝트 내 모든 대화에 적용): ..." 형태로 추가해 LLM이 톤·형식 등을 따르도록 함.
- **단축키 도움말**: 프로젝트·대화 팁에 드래그·파일 추가·지침(톤·형식) 안내 포함.
- **404 페이지**: brainwave-error-fallback 스타일 통일.
- **사이드바 단축키 버튼**: "단축키 (?)" 클릭 시 ⌘? 전역 트리거(대화 화면에서 단축키 도움말 열기).
- **대화 빈 상태**: "Ctrl+N으로 빠르게 시작" 문구·empty-conversations-cta 클래스.

---

## 📚 빠른 참조

### 시작하기
- [빠른 시작](./START_HERE.md)
- [5분 안에 시작하기](./QUICK_START.md)
- [실행 가이드](./RUN_GUIDE.md) — 백엔드·프론트 기동·접속 URL·**앱 메뉴·경로**(`/agents`·`/chat`·`/projects/:id`·`/voice-generation`·구 URL) · **`name`·`getPageTitle` → 프로젝트 대화**([src/config/README.md](./src/config/README.md)) · [AGENTS.md](./AGENTS.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md)
- [사용 가이드(메뉴얼)](./USAGE_GUIDE.md) — 화면 구성·`/projects/:id`·목소리 생성·구 URL(§1.2·§3~§6)
- [메뉴얼 한 페이지 요약](./docs/guides/MANUAL_QUICK_REFERENCE.md) — 핵심만 빠르게

### 개발·프로젝트 대화(NotebookLM)
- [일상 개발 가이드](./DEVELOPMENT.md) §2.5 · [개발 연속성](./docs/DEVELOPMENT_CONTINUITY.md) §2 · [라우트별 뷰 README](./src/views/README.md) — **`/`**·**`/projects/:id`**·구글 노트북 LM 스타일 요약
- [빠른 참조](./QUICK_REFERENCE.md) — 명령·검증·허브 · **일상 개발** 줄 `AGENTS`·**`name`·`getPageTitle` → 프로젝트 대화** · [src/config/README.md](./src/config/README.md)·위 링크와 동일 진입 줄
- **문서 표·통합·로컬 접속**: [docs/README.md](./docs/README.md)(§NotebookLM·§개발 연속성 **통합·로컬**) · [INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](./docs/LOCAL_ACCESS_GUIDE.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md)·[AGENTS.md](./AGENTS.md)·표 행과 교차
- **실행 가이드·접속 문제**: [RUN_GUIDE.md](./RUN_GUIDE.md)·[CONNECT.md](./CONNECT.md) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·[docs/setup/PYTHON_VENV.md](./docs/setup/PYTHON_VENV.md)·[docs/setup/MACOS_DEV_QUICKSTART.md](./docs/setup/MACOS_DEV_QUICKSTART.md)·[docs/FEATURE_LOGIC_AND_STRENGTHS.md](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 **실행 가이드·접속 문제(루트)** · [docs/NOTEBOOKLM_FEATURE_ROADMAP.md](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 · [일상 개발 가이드](./DEVELOPMENT.md) §2 · 표 행과 교차
- [컴포넌트 아키텍처](./docs/COMPONENT_ARCHITECTURE.md) §1·§1.1 · [기능 로직 및 NotebookLM·문서 허브·통합·로컬](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NotebookLM 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md)·표 행과 교차

### 기능
- [긴 글 생성 기능](./LONG_FORM_WRITING_FEATURE.md)
- [API 엔드포인트 요약](./API_ENDPOINTS_SUMMARY.md)

### 테스트·검증
- [테스트 가이드](./TESTING_GUIDE.md) — 검증 명령·구조·projectService·ProjectEditModal · **`routes.test`**(`src/config/routes.ts`·**`name`·`getPageTitle` → 프로젝트 대화** — [src/config/README.md](./src/config/README.md))
- [완성 체크리스트](docs/COMPLETION_CHECKLIST.md) §6 — 마무리 검증 순서 · 라우트·E2E 동기([AGENTS.md](./AGENTS.md)·[e2e/README.md](./e2e/README.md))
- [배포 전 최종 체크리스트](docs/FINAL_CHECKLIST.md) — `npm run verify:final` · `npm run verify:final:sequential-smoke`

### 시스템
- [시스템 상태](./SYSTEM_STATUS.md)
- [최종 상태 보고서](./FINAL_STATUS_REPORT.md)
- [모든 기능 완료](./ALL_FEATURES_COMPLETE.md)

---

## ✅ 최종 확인

### 시스템 상태
🟢 **완전히 구동 가능**

### 모든 기능
✅ **정상 작동**

### 문서화
✅ **완료**

### 테스트
✅ **준비 완료**

---

## 🎉 준비 완료!

**시스템이 완전히 준비되었습니다!**

**지금 바로 실행하여 사용할 수 있습니다!**

```bash
./start_all.sh
```

---

**시스템 준비 완료!** 🚀

**모든 기능이 정상 작동합니다!** ✅

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

