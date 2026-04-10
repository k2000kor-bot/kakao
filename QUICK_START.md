# CORBU.AI 빠른 시작 가이드

**CORBU.AI 시스템을 5분 안에 실행하고 첫 대화까지 진행하는 단계별 가이드입니다.**

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

- **필수**: Node.js 18+ 권장

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

- **첫 화면**: 사이드바(메뉴·프로젝트·대화 목록) + 메인 대화 영역
- **메뉴**: CORBU.AI(메인 대화), 간단 대화, 고급 기능, 전체 기능, 노트북 LLM

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

### 5.1 노트북 LLM (로컬, Ollama)

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

- **상세 사용법**: [사용 가이드(메뉴얼)](./USAGE_GUIDE.md) – 화면 구성, 메뉴별 기능, 프로젝트·대화·고급 기능, 시나리오별 예상 결과, 단축키, 문제 해결, FAQ
- **한 페이지 요약**: [메뉴얼 빠른 참조](./docs/guides/MANUAL_QUICK_REFERENCE.md) – 화면 구조·핵심 3단계·버튼 위치·실행 전 체크리스트
- **실행·배포**: [실행 가이드](./RUN_GUIDE.md)
- **LLM 상세**: [LLM 설정 가이드](./backend/LLM_SETUP_GUIDE.md)
- **목소리 생성(TTS)**: [TTS·스크립트 스타일 가이드](./docs/guides/TTS_AND_SCRIPT_STYLE_GUIDE.md)
- **노트북 LLM**: [프로젝트·노트북 LLM 사용자 가이드](./docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md)

---

## 7. 문제 발생 시

- **의존성 설치 실패**: `pip install` 실패 시 `python3 -m pip install -r requirements.txt` 시도. `npm install` 실패 시 `npm cache clean --force` 후 재시도. Node.js 18+·Python 3.8+ 확인.
- **화면이 안 뜸**: http://localhost:3000, http://localhost:5002 접속 가능 여부 확인. 방화벽·다른 프로그램의 포트 사용 여부 확인
- **프로젝트/대화가 안 만들어짐**: F12 → Console·Network 탭에서 오류 확인
- **LLM 응답 없음**: 환경 변수·Ollama/API 서버 실행 여부 확인. [사용 가이드 – 문제 해결](./USAGE_GUIDE.md#8-문제-해결) 참고
- **목소리 생성(TTS)·노트북 LLM 오류**: [USAGE_GUIDE §8.5·§8.6](./USAGE_GUIDE.md#8-문제-해결) 참고. TTS는 고급 기능 → 목소리 생성, 노트북 LLM은 CORBU.AI에서 프로젝트 선택 후 진입

---

**이제 CORBU.AI를 사용할 준비가 되었습니다.**
