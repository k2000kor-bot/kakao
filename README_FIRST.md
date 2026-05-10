# 처음 시작하기

**CORBU.AI 시스템을 처음 사용하시나요?**

이 문서는 가장 빠르게 시작하는 방법을 안내합니다.

**NotebookLM·문서 허브·통합·로컬**: [docs/README.md](./docs/README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](./docs/LOCAL_ACCESS_GUIDE.md)·[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md) — [기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 **처음 시작·README_FIRST(루트)** 행 · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **README_FIRST(루트)** · §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §6 **Agent / AI 개발 가이드** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · §6 **일상 개발·DEVELOPMENT(루트)** 행 · §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · [프로젝트·NotebookLM·문서 허브·통합·로컬 가이드](./docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md)·[프로젝트 기능 체크리스트](./docs/CHATGPT_PROJECT_FEATURE_CHECKLIST.md)·동 허브 **NotebookLM·문서 허브·통합·로컬** 표 `README_FIRST` 행 · 표 행과 교차

**실행 가이드·접속 문제(루트)**: [RUN_GUIDE.md](./RUN_GUIDE.md)·[CONNECT.md](./CONNECT.md) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·[기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · [USAGE_GUIDE.md](./USAGE_GUIDE.md) §11 · [컴포넌트 아키텍처](./docs/COMPONENT_ARCHITECTURE.md) §1.1 · [SYSTEM_READY.md](./SYSTEM_READY.md) §빠른 참조 · [DEVELOPMENT.md](./DEVELOPMENT.md) §2 · [README.md](./README.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md)·[e2e/README.md](./e2e/README.md)·[docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md)(`verify:final`) · 표 행과 교차

**로컬 UI 스모크 체크리스트**: [docs/LOCAL_UI_SMOKE_CHECKLIST.md](./docs/LOCAL_UI_SMOKE_CHECKLIST.md)

**원격 `git push` 막힘·사이드바 회귀(개발자)**: [docs/PUSH_BLOCK_HANDOFF.md](./docs/PUSH_BLOCK_HANDOFF.md) — `npm run maintain:push-block` / `npm run test:sidebar-context` (동일 `make maintain-push-block` / `make test-sidebar-context`)

**개발·`/projects/:id` 진입**: [일상 개발 가이드](./DEVELOPMENT.md) §2.5 · [개발 연속성](./docs/DEVELOPMENT_CONTINUITY.md) §2 · [라우트별 뷰 README](./src/views/README.md)·[config README(`routes.ts`)](./src/config/README.md)(**`name`·`getPageTitle` → 프로젝트 대화**·[USAGE_GUIDE §1.2](./USAGE_GUIDE.md#12-사이드바-상단-메뉴)) · [빠른 참조](./QUICK_REFERENCE.md)·[에이전트 / AI 개발 가이드](./AGENTS.md)(라우트·`name`/`getPageTitle`) · [실행 가이드](./RUN_GUIDE.md)(앱 메뉴·경로) · [시스템 준비](./SYSTEM_READY.md) §빠른 참조 · [컴포넌트 아키텍처](./docs/COMPONENT_ARCHITECTURE.md) §1.1 · [docs/README.md](./docs/README.md)(§NotebookLM·§개발 **통합·로컬**) · [INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](./docs/LOCAL_ACCESS_GUIDE.md)·[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·표 행과 교차

---

## ⚡ 3단계로 시작하기

### 1단계: 의존성 설치

```bash
./setup.sh
```

### 2단계: 시스템 실행

```bash
./start_all.sh
```

### 3단계: 브라우저 접속

http://localhost:3000

---

## 🎯 주요 기능

### 즉시 사용 가능
1. **ChatGPT 스타일 대화**: 질문하고 답변 받기(독립 대화 `/`·`/chat` 등)
2. **프로젝트 관리**: **`/projects`** 목록·**`/projects/:id`** 프로젝트 맥락 대화·**NotebookLM·문서 허브·통합·로컬**
3. **에이전트·목소리 생성**: `/agents`, **`/voice-generation`**(TTS)
4. **긴 글 자동 생성**: 질문하면 자동으로 상세한 글 생성 🆕
5. **마크다운 지원**: 코드 블록, 링크, 표 등

---

## ✨ 최신 기능: 긴 글 자동 생성

질문이나 요구를 입력하면 자동으로 상세한 긴 글이 생성됩니다!

**예시**:
- "인공지능에 대해 글 작성해줘" → 500자 이상의 상세한 글
- "Python이란 무엇인가요?" → 300자 이상의 상세한 답변

---

## 📚 더 알아보기

- [개발·검증 요약](./DEVELOPMENT_FINAL_REPORT.md) — 타입·린트·테스트·빌드 상태, 다음 권장 단계
- [설정 가이드](./SETUP_GUIDE.md)
- [빠른 시작 가이드](./START_HERE.md)
- [5분 안에 시작하기](./QUICK_START.md)
- [사용 가이드(메뉴얼)](./USAGE_GUIDE.md) — 화면 구성·`/projects/:id`·`/voice-generation`·구 URL(§1.2·§3~§6)
- [메뉴얼 한 페이지 요약](./docs/guides/MANUAL_QUICK_REFERENCE.md) — 핵심만 빠르게
- [TTS 가이드](./docs/guides/TTS_AND_SCRIPT_STYLE_GUIDE.md) — 목소리 생성·샘플 스타일
- [NotebookLM 가이드](./docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md) — 프로젝트 연동·**`/projects/:id`** 상세
- [긴 글 생성 기능](./LONG_FORM_WRITING_FEATURE.md)
- [개발 연속성 가이드](./docs/DEVELOPMENT_CONTINUITY.md) — 개발자: §2·`src/views/README`(**`/`**·**`/projects/:id`**·NotebookLM)·경로·컴포넌트 매핑·체크리스트
- [응답·입력 문자열 정리](./docs/guides/RESPONSE_CLEANING.md) — 개발자: `coerceTrimmedString`·`npm run test:frontend:chat-pipeline`·미러 동기화(`npm run sync:frontend-src`·`make sync-frontend` / `npm run sync:frontend-chat-input-utils`·`make sync-frontend-chat-input` / `npm run sync:frontend-unified-chat`·`make sync-frontend-unified-chat`; `pretest`·`check:src-frontend-parity`·`make check-frontend-parity`) — [scripts/README.md](./scripts/README.md)
- **보조 CRA `frontend/src/` (개발자)**: 루트 `src/`와 맞출 때 **`npm run sync:frontend-src`**(동일 **`make sync-frontend`**; `pretest`·`check:src-frontend-parity`(동일: `make check-frontend-parity`)). `chatInputUtils`만 **`npm run sync:frontend-chat-input-utils`**(동일 **`make sync-frontend-chat-input`**). 통합 대화(UI) 등 부분 **`npm run sync:frontend-unified-chat`**(동일 **`make sync-frontend-unified-chat`**) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)
- **배포·검증 (개발자)**: (선택·빠름) `npm run test:routes`·`npm run test:app-unified` — [TESTING_GUIDE.md](./TESTING_GUIDE.md). 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md §6](./docs/COMPLETION_CHECKLIST.md#6-마무리-검증-순서-완성도-확인용). 배포 직전 풀 스크립트 `npm run verify:final` — [FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md) (`verify:final:sequential-smoke`: UI 스모크 순차)

---

## 🆘 문제 해결

### 서버가 시작되지 않는 경우
1. `./stop_all.sh` 후 `./start_all.sh` 재시도
2. `npm run check:system` 으로 상태 확인
3. 의존성: `./setup.sh` 재실행

### LLM이 작동하지 않는 경우
1. 환경 변수 확인 (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY` 등)
2. Ollama 실행 확인 (로컬 LLM 사용 시)
3. 백엔드 로그 확인

자세한 내용은 [사용 가이드](./USAGE_GUIDE.md#-문제-해결)를 참고하세요.

---

## ✅ 준비 완료!

**시스템이 준비되었습니다!**

**지금 바로 시작하세요!** 🚀

```bash
./start_all.sh
```

---

**행운을 빕니다!** 🎉

