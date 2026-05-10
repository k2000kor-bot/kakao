# 🚀 시작하기

**CORBU.AI 시스템에 오신 것을 환영합니다!**

이 문서는 시스템을 빠르게 시작하는 방법을 안내합니다.

---

## 👋 처음 사용자 둘러보기

| 하고 싶은 것 | 메뉴/경로 | 설명 |
|-------------|----------|------|
| **에이전트** | 에이전트 (`/agents`) | Genspark식 에이전트 세션 |
| **일반 대화** | 일반 대화 (`/` 또는 `/chat` 등) | 프로젝트와 분리된 대화·질의응답(`getStandaloneChatPath()` 기준) |
| **프로젝트 관리** | 프로젝트 (`/projects`) | 프로젝트 목록·생성·편집. 클릭 시 **프로젝트 대화** (`/projects/:id`)로 진입 |
| **NotebookLM·문서 허브·통합·로컬** | 프로젝트 대화 (`/projects/:id`) | 프로젝트 맥락·소스·스트리밍·구글 노트북 LM 스타일 UI |
| **목소리 생성(TTS)** | 목소리 생성 (`/voice-generation`) | 텍스트→음성 변환. 대본·감정 프리셋 지원 |
| **설정** | 도구 → 설정 (/settings) | 테마·알림·정보 |
| **사용 통계** | 도구 → 분석 (/analytics) | 요청 수·프로젝트별 통계·CSV 내보내기 |
| **도움말** | 도구 → 도움말 (/docs) | 가이드·단축키·문제 해결 |

**한 페이지 요약**: [메뉴얼 빠른 참조](./docs/guides/MANUAL_QUICK_REFERENCE.md)

**구 URL(북마크)**: `/simple`·`/features`·`/notebook` 등은 **`/chat`·`/voice-generation`·`/projects`** 등으로 **리다이렉트**될 수 있습니다 — [USAGE_GUIDE.md](./USAGE_GUIDE.md) §1.2

**NotebookLM·문서 허브·통합·로컬**: [docs/README.md](./docs/README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](./docs/LOCAL_ACCESS_GUIDE.md)·[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md) — [기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 **시작 문서·START_HERE(루트)** 행 · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **시작 문서(루트)·START_HERE** · §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §6 **Agent / AI 개발 가이드** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · §6 **일상 개발·DEVELOPMENT(루트)** 행 · §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · 동 허브 **NotebookLM·문서 허브·통합·로컬** 표 `START_HERE` 행 · [src/config/README.md](./src/config/README.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md)·[AGENTS.md](./AGENTS.md)·표 행과 교차

**실행 가이드·접속 문제(루트)**: [RUN_GUIDE.md](./RUN_GUIDE.md)·[CONNECT.md](./CONNECT.md) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·[기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · [USAGE_GUIDE.md](./USAGE_GUIDE.md) §11 · [컴포넌트 아키텍처](./docs/COMPONENT_ARCHITECTURE.md) §1.1 · [docs/setup/PYTHON_VENV.md](./docs/setup/PYTHON_VENV.md)·[docs/setup/MACOS_DEV_QUICKSTART.md](./docs/setup/MACOS_DEV_QUICKSTART.md)·[SYSTEM_READY.md](./SYSTEM_READY.md) §빠른 참조 · [DEVELOPMENT.md](./DEVELOPMENT.md) §2 · [README.md](./README.md)·[README_FIRST.md](./README_FIRST.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md)·[e2e/README.md](./e2e/README.md)·[docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md)(`verify:final`) · 표 행과 교차

**로컬 UI 스모크 체크리스트**: [docs/LOCAL_UI_SMOKE_CHECKLIST.md](./docs/LOCAL_UI_SMOKE_CHECKLIST.md)

---

## ⚡ 빠른 시작 (5분)

**npm 명령(`npm run ...`)은 반드시 프로젝트 루트(package.json이 있는 폴더)에서 실행하세요.**  
예: 저장소를 `~/kakao-frontend`에 클론했다면 `cd ~/kakao-frontend/kakao-frontend` 후 실행.

### 1. 의존성 설치

```bash
./setup.sh    # 한 번에 설치 (백엔드 backend/venv + 프론트 npm)
```

**Python 경로**: `backend/venv` → `backend/.venv` → 루트 `venv`/`.venv` 순으로 쓰는 스크립트가 많습니다. 요약은 [docs/setup/PYTHON_VENV.md](./docs/setup/PYTHON_VENV.md) 참고.

### 2. 시스템 실행

```bash
./start_all.sh    # 시작
./stop_all.sh     # 종료
```

### 3. 접속

- **프론트엔드**: http://localhost:3000
- **통합 API (5002)**: http://localhost:5002/api/docs
- **통합 API (기본 5002)**: http://localhost:5002/api/docs (`npm run restart:backend`). 레거시 `app.py`만 쓸 때는 별도 포트일 수 있음.

**PC에서 접속이 안 될 때 · 화면에 아무것도 안 보일 때**  
→ **[CONNECT.md](./CONNECT.md)** 를 먼저 보세요. (같은 PC에서 실행 여부, standalone.html 접속 확인 등)

**docx 대본 → 목소리 샘플** 확인은 CONNECT.md의 **5-1. docx 대본 → 목소리 샘플 확인** 섹션을 참고하세요.

**백엔드·E2E 테스트** 실행 방법은 CONNECT.md의 **7. 테스트 실행**을 참고하세요.

1. **같은 PC**에서 터미널 2개: **`npm run restart:backend`** (통합 API 5002) / **`npm start`** (프론트 3000). (`bash scripts/start-api-5002.sh` 동일)
2. 브라우저에서 **http://localhost:3000/standalone.html** 먼저 열기 → "이 화면이 보이면" 나오면 서버 접속 성공. 메인: http://localhost:3000/
3. 포트·실행 순서: **docs/PORTS.md** 참고

---

## 🤖 LLM 사용하기 (선택사항)

LLM을 사용하려면 환경 변수를 설정하세요:

```bash
# OpenAI 사용
export OPENAI_API_KEY="sk-..."
export LLM_PROVIDER="openai"
export LLM_MODEL="gpt-3.5-turbo"

# 또는 Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
export LLM_PROVIDER="anthropic"

# 또는 Ollama (로컬)
export OLLAMA_BASE_URL="http://localhost:11434"
export LLM_PROVIDER="ollama"
export LLM_MODEL="llama2"
```

**참고**: LLM API 키를 설정하지 않아도 기본 모드로 작동합니다!

**딥시크(DeepSeek) 사용 시**: 설치→구동→개발→학습 한 흐름은 [docs/DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md](./docs/DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md) 를 참고하세요.

---

## 📚 더 알아보기

### 기본 가이드
- [README.md](./README.md) - 프로젝트 개요
- [COMPLETE_SETUP.md](./COMPLETE_SETUP.md) - 완전한 설정 가이드
- [RUN_GUIDE.md](./RUN_GUIDE.md) - 빠른 실행 가이드·접속 URL·**앱 메뉴·경로** 요약(`/agents`·`/chat` 등·`USAGE_GUIDE` §1.2) · **`name`·`getPageTitle` → 프로젝트 대화**([src/config/README.md](./src/config/README.md)) · [AGENTS.md](./AGENTS.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md)

### 사용 가이드 (메뉴얼)
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - 화면 구성·`/projects/:id`·`/voice-generation`·구 URL(§1.2·§3~§6)
- [메뉴얼 빠른 참조](./docs/guides/MANUAL_QUICK_REFERENCE.md) - 한 페이지 요약
- [QUICK_START.md](./QUICK_START.md) - 5분 안에 실행·첫 대화
- [TTS 가이드](./docs/guides/TTS_AND_SCRIPT_STYLE_GUIDE.md) - 목소리 생성·샘플 스타일
- [NotebookLM 가이드](./docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md) - 프로젝트 연동 상세
- [기능 로직 및 NotebookLM·문서 허브·통합·로컬·pytest](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) — **NotebookLM·문서 허브·통합·로컬**·§6 참고 표 · 표 행과 교차
- [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) - Phase·화면·§4.1 엔진 · 표 행과 교차
- [프로젝트 기능 체크리스트](./docs/CHATGPT_PROJECT_FEATURE_CHECKLIST.md) - ChatGPT 프로젝트 패리티·`/projects/:id` 검증

### LLM 가이드
- [README_LLM.md](./README_LLM.md) - LLM 빠른 시작
- [backend/LLM_SETUP_GUIDE.md](./backend/LLM_SETUP_GUIDE.md) - 상세 설정
- [docs/DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md](./docs/DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md) - 딥시크 설치→구동→개발→학습 한 흐름
- [docs/DEEPSEEK_SETUP.md](./docs/DEEPSEEK_SETUP.md) - 딥시크 설치형/API·동작 체크리스트

### 개발 가이드
- [src/config/README.md](./src/config/README.md) - `routes.ts` 표: **`/projects/:id`** 항목 **`name`·`getPageTitle()` → 프로젝트 대화** (UI·문서 표기와 동일 문자열) · [USAGE_GUIDE §1.2](./USAGE_GUIDE.md#12-사이드바-상단-메뉴)
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 프로젝트 구조·실행·테스트·**§2.5** 뷰/`src/views/README`(**`/`**·**`/projects/:id`**·NotebookLM)·개발 연속성 — [docs/DEVELOPMENT_CONTINUITY.md](./docs/DEVELOPMENT_CONTINUITY.md) §2 · [TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md)
- [docs/guides/RESPONSE_CLEANING.md](./docs/guides/RESPONSE_CLEANING.md) - 대화 입력 `coerceTrimmedString`·`npm run test:frontend:chat-pipeline`·미러 동기화(`npm run sync:frontend-src` 전체·동일 `make sync-frontend` / `npm run sync:frontend-chat-input-utils` 한 파일·동일 `make sync-frontend-chat-input` / `npm run sync:frontend-unified-chat` 통합 대화(UI) 등 부분·동일 `make sync-frontend-unified-chat`; `npm test`/`pretest`: `check:src-frontend-parity`·동일 `make check-frontend-parity`) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)
- [docs/DEVELOPER_QUICK_CHECKLIST.md](./docs/DEVELOPER_QUICK_CHECKLIST.md) - 실행·테스트·API 빠른 체크 — §6 경로·§7 참고 · `routes.test` · `e2e/README`
- [docs/COMPONENT_ARCHITECTURE.md](./docs/COMPONENT_ARCHITECTURE.md) - 컴포넌트·라우트·**§1.1 NotebookLM**·프로젝트 관리 매핑
- [src/views/README.md](./src/views/README.md) - 라우트별 뷰·**`/projects/:id`·구글 노트북 LM 스타일(NotebookLM)** 요약·확장 뷰(도구 메뉴) 검증
- [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) - 개발 로드맵
- [COMPLETE_SYSTEM_SUMMARY.md](./COMPLETE_SYSTEM_SUMMARY.md) - 시스템 요약

**빠른 Jest(선택·프론트)**: `npm run test:routes`·`npm run test:app-unified`·`npm run test:sidebar-context` — [TESTING_GUIDE.md](./TESTING_GUIDE.md). 원격 `git push` 막힘: [docs/PUSH_BLOCK_HANDOFF.md](./docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).  
**보조 CRA 미러(선택)**: 루트 `src/` → `frontend/src/`는 **`npm run sync:frontend-src`**(동일 **`make sync-frontend`**; `pretest`·`check:src-frontend-parity`(동일: `make check-frontend-parity`)). `chatInputUtils`만 **`npm run sync:frontend-chat-input-utils`**(동일 **`make sync-frontend-chat-input`**). 통합 대화(UI) 등 부분 **`npm run sync:frontend-unified-chat`**(동일 **`make sync-frontend-unified-chat`**) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md).  
**마무리 검증**: `npm run verify:completion` (타입·린트·P4 테스트). 상세: [docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md)  
**배포 직전 한 번에**: `npm run verify:final` → `./scripts/final-verify.sh` — `check:test-imports`·빌드·접속·API·통합·**`test:frontend:chat-pipeline`**·**`test:chat-ui-interfaces:smoke`**. 상세 [docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md). UI 스모크만 순차 Jest: **`npm run verify:final:sequential-smoke`**.

---

## 🧪 테스트

```bash
# 통합 테스트
./test_integration.sh

# LLM 테스트
./test_llm.sh
```

**main.py API 테스트**: `cd backend && python3 -m pytest tests/test_main_api.py -v` (통과 시 약 62개). **E2E**: CONNECT.md **7. 테스트 실행** 참고.

---

## 🆘 문제 해결

### 백엔드가 시작되지 않는 경우

1. 포트 확인: `lsof -i :5002`
2. Python 버전 확인: `python3 --version` (3.8+ 필요)
3. 의존성 확인: `pip list | grep fastapi`

### 프론트엔드가 시작되지 않는 경우

1. 포트 확인: `lsof -i :3000`
2. Node.js 버전 확인: `node --version` (**20** 권장 — `.nvmrc`·`package.json` `engines`·CI와 동일)
3. 의존성 확인: `npm list react`

### LLM이 작동하지 않는 경우

1. 환경 변수 확인: `echo $OPENAI_API_KEY`
2. 의존성 확인: `pip list | grep openai`
3. [LLM 설정 가이드](./backend/LLM_SETUP_GUIDE.md) 참조

### 창이 예기치 않게 종료될 때 (크래시, 코드 5)

`npm start`·`npm run build`에는 `NODE_OPTIONS=--max-old-space-size=8192`가 적용되어 있습니다. 그래도 반복 크래시하면 [CONNECT.md §8](./CONNECT.md#8-창이-예기치-않게-종료될-때-크래시-코드-5) 또는 [TROUBLESHOOTING_GUIDE](./docs/guides/TROUBLESHOOTING_GUIDE.md) 크래시 섹션을 참고하세요. `npm run start:safe` 시도 권장.

---

## ✅ 체크리스트

시작하기 전 확인:

- [ ] Python 3.8+ 설치됨
- [ ] Node.js 20 설치됨 (또는 `nvm use` / `fnm use` 로 `.nvmrc` 적용)
- [ ] 백엔드 의존성 설치됨
- [ ] 프론트엔드 의존성 설치됨
- [ ] 포트 3000, 5002 사용 가능
- [ ] (선택) LLM API 키 설정됨

---

## 🎉 준비 완료!

모든 준비가 끝났습니다. 이제 시스템을 실행하고 사용할 수 있습니다!

**시작하기**: `./start_all.sh`

---

**행운을 빕니다! 🚀**

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

