# CORBU.AI 빠른 시작 가이드

**CORBU.AI 시스템을 5분 안에 실행하고 첫 대화까지 진행하는 단계별 가이드입니다.**

**NotebookLM·문서 허브·통합·로컬**: [docs/README.md](./docs/README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](./docs/LOCAL_ACCESS_GUIDE.md)·[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md) — [기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 **빠른 시작·QUICK_START(루트)** 행 · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **빠른 시작(루트)·QUICK_START** · §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §6 **Agent / AI 개발 가이드** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · §6 **일상 개발·DEVELOPMENT(루트)** 행 · §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · 동 허브 **NotebookLM·문서 허브·통합·로컬** 표 `QUICK_START` 행 · [src/config/README.md](./src/config/README.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md)·[AGENTS.md](./AGENTS.md)·표 행과 교차

**실행 가이드·접속 문제(루트)**: [RUN_GUIDE.md](./RUN_GUIDE.md)·[CONNECT.md](./CONNECT.md) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·[기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · [USAGE_GUIDE.md](./USAGE_GUIDE.md) §1.2·§11 · [컴포넌트 아키텍처](./docs/COMPONENT_ARCHITECTURE.md) §1.1 · [SYSTEM_READY.md](./SYSTEM_READY.md) §빠른 참조 · [DEVELOPMENT.md](./DEVELOPMENT.md) §2 · [README.md](./README.md)·[README_FIRST.md](./README_FIRST.md)·[START_HERE.md](./START_HERE.md)·[DEVELOPMENT_CONTINUITY.md](./docs/DEVELOPMENT_CONTINUITY.md) §1·§2 · [TESTING_GUIDE.md](./TESTING_GUIDE.md)·[e2e/README.md](./e2e/README.md)·[docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md)(`verify:final`) · 표 행과 교차

**로컬 UI 스모크 체크리스트**: [docs/LOCAL_UI_SMOKE_CHECKLIST.md](./docs/LOCAL_UI_SMOKE_CHECKLIST.md)

---

## 목차

1. [의존성 설치](#1-의존성-설치)
2. [시스템 실행](#2-시스템-실행)
3. [브라우저 접속](#3-브라우저-접속)
4. [첫 대화 하기](#4-첫-대화-하기)
5. [LLM 설정 (선택)](#5-llm-설정-선택)
6. [다음 단계](#6-다음-단계)
7. [문제 발생 시](#7-문제-발생-시)

---

## 1. 의존성 설치

### 1.1 백엔드 (Python)

```bash
cd backend
pip install -r requirements.txt
cd ..
```

- **권장**: 가상환경 사용 (`python3 -m venv venv`, `source venv/bin/activate` 후 위 명령)

### 1.2 프론트엔드 (Node.js)

```bash
npm install
```

- **필수**: Node.js **20** (`.nvmrc`·CI·`engines`와 동일)

---

## 2. 시스템 실행

### 2.1 방법 A: 통합 실행 (권장)

```bash
./start_all.sh
```

- 프론트엔드(3000)와 백엔드(통합 API 기본 **5002**)를 한 번에 실행
- 종료: 해당 터미널에서 Ctrl+C

### 2.2 방법 B: 개별 실행

**터미널 1 – 백엔드**

```bash
cd backend
./start.sh
```

**터미널 2 – 프론트엔드**

```bash
npm start
```

- 프론트는 기본적으로 브라우저를 자동으로 열지 않음. 아래 주소로 직접 접속

---

## 3. 브라우저 접속

| 용도 | 주소 |
|------|------|
| **웹 앱(메인)** | http://localhost:3000 |
| **백엔드 API (대화·통합)** | http://localhost:5002 |
| **API 문서** | http://localhost:5002/api/docs |

- **포트/API URL 변경**: 백엔드는 `BACKEND_PORT` / `API_PORT` / `PORT`(기본 5002), 프론트는 `.env`의 `REACT_APP_API_URL` 및 `src/config/api.ts` — 상세는 **`docs/PORTS.md`**.

- **첫 화면**: 사이드바(에이전트·메뉴·프로젝트·대화 목록·목소리 생성 등) + 메인 대화 영역
- **메뉴(기본)**: **에이전트**(`/agents`)·**대화**(`/`·`/chat` 등 독립 대화)·**프로젝트**(`/projects`)·**목소리 생성**(`/voice-generation`) 등(`src/config/routes.ts`). **프로젝트 대화**는 프로젝트를 고르면 **`/projects/:id`** 로 열립니다. **NotebookLM·문서 허브·통합·로컬**은 이 통합 화면 안에서 사용합니다. 예전 **`/simple`·`/features`·`/notebook`** 등은 설정에 따라 **`/chat`·`/`**·**`/projects`** 등으로 **리다이렉트**될 수 있습니다 — [USAGE_GUIDE.md](./USAGE_GUIDE.md) §1.2 · [src/config/README.md](./src/config/README.md)(**`name`·`getPageTitle`**) · [AGENTS.md](./AGENTS.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md).

**정상 시 확인**: CORBU.AI 로고·제목, 좌측 사이드바, 메인 영역, 하단 입력창이 보이면 정상입니다. API 문서는 http://localhost:5002/api/docs 에서 확인할 수 있습니다.

---

## 4. 첫 대화 하기

### 4.1 프로젝트 만들기

1. 사이드바에서 **"새 프로젝트"** 클릭
2. 프로젝트 이름 입력 (예: `첫 프로젝트`)
3. **"생성"** 또는 **"프로젝트 만들기"** 클릭
4. 목록에 새 프로젝트가 보이면 선택

### 4.2 새 대화 시작

1. **"+ 새 대화"** 클릭
2. 하단 입력창에 메시지 입력 (예: `안녕하세요`)
3. **Enter** 또는 전송 버튼으로 전송
4. AI 응답 확인 (LLM 설정에 따라 동작)

**정상 시 확인**: 입력창이 비워지고, 사용자 메시지가 메인에 표시된 뒤 AI 응답이 표시됨. 사이드바 대화 목록에 자동 생성된 제목이 나타남. (LLM 미설정 시 응답이 없을 수 있음 — §5 참고.)

### 4.3 (선택) 지침·파일 추가

- **지침**: 프로젝트 **⋮** → **편집** → 지침 입력 후 저장 → 해당 프로젝트 대화(/projects/:id)에 공통 적용
- **파일**: 편집 모달에서 "파일 추가"로 문서·이미지 업로드 → 대화 시 프로젝트 맥락으로 참고

---

## 5. LLM 설정 (선택)

LLM을 설정하지 않으면 기본(폴백) 모드로 동작합니다. 원하는 방식만 설정하면 됩니다.

### 5.1 NotebookLM (로컬, Ollama)

```bash
# Ollama 설치 후 실행
ollama serve

# 새 터미널에서 모델 다운로드
ollama pull llama3.1:8b
# 한국어 특화: ollama pull kullm:12.8b
```

환경 변수 (실행 전에 설정):

```bash
export LLM_PROVIDER="notebook"
export OLLAMA_BASE_URL="http://localhost:11434"
```

### 5.2 OpenAI

```bash
export OPENAI_API_KEY="sk-..."
export LLM_PROVIDER="openai"
export LLM_MODEL="gpt-3.5-turbo"
```

### 5.3 Anthropic

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export LLM_PROVIDER="anthropic"
export LLM_MODEL="claude-3-5-sonnet-20241022"
```

---

## 6. 다음 단계

- **상세 사용법**: [사용 가이드(메뉴얼)](./USAGE_GUIDE.md) – 화면 구성, 메뉴별 기능, 프로젝트·대화·고급 기능, 시나리오별 예상 결과, 단축키, 문제 해결, FAQ · [§11 참고 링크](./USAGE_GUIDE.md#11-참고-링크)(개발·NotebookLM API 진입)
- **NotebookLM·문서 허브·통합·로컬**: [docs/README.md](./docs/README.md) §NotebookLM·§개발 연속성 (**통합·로컬** 표) · [INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](./docs/LOCAL_ACCESS_GUIDE.md)·[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·[기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 · 표 행과 교차
- **한 페이지 요약**: [메뉴얼 빠른 참조](./docs/guides/MANUAL_QUICK_REFERENCE.md) – 화면 구조·핵심 3단계·버튼 위치·실행 전 체크리스트
- **시스템 준비·문서 모음**: [SYSTEM_READY.md](./SYSTEM_READY.md) §빠른 참조 — `RUN_GUIDE`·메뉴얼·개발·NotebookLM 진입
- **실행·배포**: [실행 가이드](./RUN_GUIDE.md) — 접속 URL·**앱 메뉴·경로**(`/agents`·`/chat` 등·`USAGE_GUIDE` §1.2)
- **프론트 빠른 Jest(선택, 개발자)**: `npm run test:routes`·`npm run test:app-unified` — [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **보조 CRA `frontend/src/` (선택, 개발자)**: 루트 `src/`와 맞출 때 **`npm run sync:frontend-src`**(동일 **`make sync-frontend`**; `pretest`·`check:src-frontend-parity`(동일: `make check-frontend-parity`)). `chatInputUtils.ts`만 **`npm run sync:frontend-chat-input-utils`**(동일 **`make sync-frontend-chat-input`**). 통합 대화(UI) 등 부분 **`npm run sync:frontend-unified-chat`**(동일 **`make sync-frontend-unified-chat`**) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)
- **배포 직전 풀 검증 (개발자, 선택)**: `npm run verify:final` — [FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md). UI 스모크만 순차 Jest: `npm run verify:final:sequential-smoke`
- **LLM 상세**: [LLM 설정 가이드](./backend/LLM_SETUP_GUIDE.md)
- **목소리 생성(TTS)**: [TTS·스크립트 스타일 가이드](./docs/guides/TTS_AND_SCRIPT_STYLE_GUIDE.md)
- **NotebookLM·문서 허브·통합·로컬**: [프로젝트·NotebookLM·문서 허브·통합·로컬 사용자 가이드](./docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md)

---

## 7. 문제 발생 시

- **의존성 설치 실패**: `pip install` 실패 시 `python3 -m pip install -r requirements.txt` 시도. `npm install` 실패 시 `npm cache clean --force` 후 재시도. Node.js **20**·Python 3.8+ 확인.
- **화면이 안 뜸**: http://localhost:3000, http://localhost:5002 접속 가능 여부 확인. 방화벽·다른 프로그램의 포트 사용 여부 확인
- **프로젝트/대화가 안 만들어짐**: F12 → Console·Network 탭에서 오류 확인
- **LLM 응답 없음**: 환경 변수·Ollama/API 서버 실행 여부 확인. [사용 가이드 – 문제 해결](./USAGE_GUIDE.md#8-문제-해결) 참고
- **목소리 생성(TTS)·NotebookLM 오류**: [USAGE_GUIDE §8.5·§8.6](./USAGE_GUIDE.md#8-문제-해결) 참고. TTS는 사이드바 **목소리 생성**(`/voice-generation`) — 메뉴얼 [§6.1](./USAGE_GUIDE.md#61-목소리-생성tts). NotebookLM은 **프로젝트** → **`/projects/:id`** 통합 화면에서 사용

---

**이제 CORBU.AI를 사용할 준비가 되었습니다.**
