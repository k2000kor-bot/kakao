# CORBU.AI 실행 가이드

## 🚀 빠른 시작

### 권장: 통합 API + 프론트 (포트 **5002** + 3000)

프로젝트 루트(`package.json`이 있는 폴더)에서:

**터미널 1 — 백엔드**

```bash
npm run restart:backend
```

**터미널 2 — 프론트**

```bash
npm start
```

- 기본 포트는 `main_server`의 **`API_PORT` / `PORT` 환경변수**, 미설정 시 **5002**입니다.
- 상세: **[docs/setup/PYTHON_VENV.md](./docs/setup/PYTHON_VENV.md)**, **[CONNECT.md](./CONNECT.md)**  
- **기능 로직·파이프라인**은 **[기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md)** 참고.
- **배포 직전 풀 검증(선택)**: 루트에서 **`npm run verify:final`** · 순차 UI 스모크 **`npm run verify:final:sequential-smoke`** — [docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md).
- **마무리·완성도 검증**: **`npm run verify:completion`** — [docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md) (서두 **NotebookLM·문서 허브·통합·로컬**·**실행 가이드·접속 문제(루트)** · `FEATURE_LOGIC` §6 **완성 체크리스트·COMPLETION_CHECKLIST(docs)**) · 표 행과 교차.

**NotebookLM·문서 허브·통합·로컬**: [docs/README.md](./docs/README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](./docs/LOCAL_ACCESS_GUIDE.md)·[RUN_GUIDE.md](./RUN_GUIDE.md)·[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md) — [기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 **통합 테스트·INTEGRATION_TEST_GUIDE(루트)·로컬 접속·LOCAL_ACCESS_GUIDE(docs)** 행 · §6 **개발 연속성·DEVELOPMENT_CONTINUITY(docs)·경로·뷰** 행 · §6 **개발 요약·개발자 체크리스트(docs)** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **Agent / AI 개발 가이드** 행 · §6 **앱 실행·RUN_GUIDE(루트)** 행 · §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · §6 **테스트 가이드·TESTING_GUIDE(루트)·API(docs)** 행 · [TESTING_GUIDE.md](./TESTING_GUIDE.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · §6 **E2E 가이드·e2e/README(루트)·경로 허브(docs)** 행 · [e2e/README.md](./e2e/README.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · §6 **스크립트 허브·scripts/README(루트)·dev/deploy(docs)** 행 · [scripts/README.md](./scripts/README.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) 서두 **검증·실행·접속(루트)** · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · 동 허브 **NotebookLM·문서 허브·통합·로컬** 표 `RUN_GUIDE` 행 · **`/projects/:id`·`name`/`getPageTitle`**: [src/config/README.md](./src/config/README.md)·[AGENTS.md](./AGENTS.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md)·백엔드 venv·macOS: [docs/setup/PYTHON_VENV.md](./docs/setup/PYTHON_VENV.md)·[docs/setup/MACOS_DEV_QUICKSTART.md](./docs/setup/MACOS_DEV_QUICKSTART.md)·§6 **완성 체크리스트·COMPLETION_CHECKLIST(docs)** 행 · [docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · §6 **배포·풀 스택 체크리스트(docs)** 행 · [docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md) 서두 **실행 가이드·접속 문제(루트)** · 표 행과 교차

**실행 가이드·접속 문제(루트)**: [RUN_GUIDE.md](./RUN_GUIDE.md) (위 **빠른 시작** 절·백엔드·프론트 **기동**) · [CONNECT.md](./CONNECT.md) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·[기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §4 **앱 기동·RUN_GUIDE(루트)** · §4 **접속·CONNECT(루트)** · §4 **통합 테스트·로컬 접속** · [USAGE_GUIDE.md](./USAGE_GUIDE.md) §11 · [컴포넌트 아키텍처](./docs/COMPONENT_ARCHITECTURE.md) §1.1 · [QUICK_START.md](./QUICK_START.md)·[README_FIRST.md](./README_FIRST.md)·[START_HERE.md](./START_HERE.md)·[DEVELOPMENT_CONTINUITY.md](./docs/DEVELOPMENT_CONTINUITY.md) §1·§2 · [SYSTEM_READY.md](./SYSTEM_READY.md) §빠른 참조 · [DEVELOPMENT.md](./DEVELOPMENT.md) §2 · [README.md](./README.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md)·[e2e/README.md](./e2e/README.md)·[docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md)(`verify:completion`) · [docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md)(`verify:final`) · 표 행과 교차

**대안** (uvicorn 직접):

```bash
cd backend
python3 -m uvicorn main_server:app --host 0.0.0.0 --port 5002
```

### 선택: `start_all.sh` 일괄 기동

```bash
chmod +x start_all.sh
./start_all.sh
```

일부 스크립트는 **레거시 `app.py`/다른 포트**를 쓸 수 있습니다. **스트리밍·통합 FastAPI 파이프라인**은 위 **권장** 방식을 사용하세요.

## 📍 접속 정보

실행 후 다음 URL로 접속:

| 서비스 | URL | 설명 |
|--------|-----|------|
| **프론트엔드** | http://localhost:3000 | ChatGPT 스타일 인터페이스 (포트 3000 사용) |
| **백엔드 API** | http://localhost:5002 | FastAPI `main_server` (기본 포트) |
| **API 문서 (Swagger)** | http://localhost:5002/api/docs | API 문서 |
| **API 문서 (ReDoc)** | http://localhost:5002/api/redoc | 대안 API 문서 |
| **헬스 체크** | http://localhost:5002/api/health | 서버 상태 확인 |

### 앱 메뉴·경로 (요약)

프론트(**3000**)는 `AppUnified` 기준으로 **`/agents`** · **`/`** · **`/chat`** 등(독립 대화) · **`/projects`** · **`/projects/:id`**(NotebookLM — 탭 제목 `getPageTitle`·`routes.ts` **name** → **프로젝트 대화**, [src/config/README.md](./src/config/README.md)) · **`/voice-generation`**(목소리 생성) 등이 쓰이며, **`/simple`·`/features`·`/notebook`** 등 구 URL은 **`/chat`·`/projects`·`/voice-generation`** 등으로 리다이렉트될 수 있습니다 — [USAGE_GUIDE.md](./USAGE_GUIDE.md) §1.2 · [DEVELOPMENT.md](./DEVELOPMENT.md)·라우트 [AGENTS.md](./AGENTS.md)·점검 [TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · E2E [e2e/README.md](./e2e/README.md)·문서 표 [docs/README.md](./docs/README.md)(§NotebookLM·§개발 **통합·로컬**) · [INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](./docs/LOCAL_ACCESS_GUIDE.md).

### 네트워크 접속 (같은 LAN 내 다른 기기)

`.env.local`에 `HOST=0.0.0.0`, `DANGEROUSLY_DISABLE_HOST_CHECK=true`가 있으면,  
**같은 Wi‑Fi/LAN**에 있는 휴대폰·다른 PC에서 `http://<이 PC IP>:3000`으로 접속할 수 있습니다.

- 적용하려면 **프론트 서버 재시작** (`npm start` 중지 후 다시 실행).
- 예: `http://192.168.0.117:3000` (이 PC의 로컬 IP는 터미널에서 `ipconfig getifaddr en0` 등으로 확인).

## ✅ 실행 확인

로컬 UI 동작을 단계별로 점검하려면 [docs/LOCAL_UI_SMOKE_CHECKLIST.md](./docs/LOCAL_UI_SMOKE_CHECKLIST.md)를 함께 확인하세요.

### 1. 백엔드 확인

터미널에서:
```bash
curl http://localhost:5002/api/health
```

또는 브라우저에서 http://localhost:5002/api/health 접속

정상 응답 예시:
```json
{
  "status": "healthy",
  "service": "unified-chat-api",
  "timestamp": "2026-01-21T12:00:00.000000"
}
```

### 2. 서버 상태 스크립트 사용

```bash
chmod +x backend/scripts/server_status.sh
./backend/scripts/server_status.sh
```

### 3. 프론트엔드 확인

브라우저에서 http://localhost:3000 접속하여 ChatGPT 스타일 인터페이스 확인

### 4. 대화 테스트

```bash
curl -X POST http://localhost:5002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "안녕하세요", "quality": "enhanced"}'
```

### 5. 프로젝트별 NotebookLM (선택)

- 프로젝트 생성 시 **이름·설명·태그·가이드라인**을 입력하면 해당 프로젝트로 대화할 때 AI가 이 정보를 반영해 답변합니다.
- 사용법: [프로젝트별 구글 노트북 LM 스타일 사용 가이드](./docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md)  
- 화면·Phase·엔진: [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4·§4.1 · NotebookLM API·pytest: [기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §5.5·§6 · 표 행과 교차  
- 검증: `cd backend && python3 -m pytest tests/test_project_session_api.py::TestProjectNotebookContext -v`

## 🔧 문제 해결

### 포트 충돌

**백엔드 (기본: 5002):**
```bash
# 환경 변수로 포트 변경 예시
API_PORT=5003 python3 -m uvicorn main_server:app --host 0.0.0.0 --port 5003
# 또는: PORT=5003 npm run restart:backend  (스크립트가 PORT를 넘기는 경우)
```

**프론트엔드 (기본: 3000):**
```bash
# 기본 3000 사용. 충돌 시 다른 포트 사용
PORT=3002 npm start
```

### 의존성 오류

**백엔드:**
```bash
cd backend
pip install -r requirements.txt
```

**프론트엔드:**
```bash
npm install
```

### CORS 오류

백엔드 `main_server.py`의 CORS 설정은 기본적으로 모든 출처를 허용합니다:
```python
allow_origins=["*"]
```

프로덕션에서는 특정 도메인만 허용하도록 변경하세요.

### 백엔드가 시작되지 않을 때

1. Python 버전 확인 (3.8 이상 필요):
   ```bash
   python3 --version
   ```

2. 의존성 설치:
   ```bash
   pip install fastapi uvicorn pydantic
   ```

3. 로그 확인:
   ```bash
   tail -f corbu_ai.log
   ```

## 🧪 테스트 실행

### 백엔드 테스트

```bash
cd backend
python3 -m pytest tests/ -v
```

### 프론트엔드 테스트

```bash
npm test
```

**빠른 일부 스위트** (백엔드 없이): `npm run test:routes`(**27**) · `npm run test:app-unified`(**115**, 수 초대) · `npm run test:sidebar-context` · `npm run test:chatgpt-interface:quick` / `npm run test:chatgpt-interface:genspark` — [TESTING_GUIDE.md](./TESTING_GUIDE.md) 주요 검증 표. 원격 push 막힘: [docs/PUSH_BLOCK_HANDOFF.md](./docs/PUSH_BLOCK_HANDOFF.md)(`maintain:push-block`).

**보조 CRA `frontend/src/`** (루트 `src/`와 바이트 동기): **`npm run sync:frontend-src`**(동일 **`make sync-frontend`**) — 루트 `npm test`의 `pretest`·`check:src-frontend-parity`(동일: `make check-frontend-parity`) 전제. `chatInputUtils.ts`만 **`npm run sync:frontend-chat-input-utils`**(동일 **`make sync-frontend-chat-input`**). 통합 대화(UI) 등 부분 **`npm run sync:frontend-unified-chat`**(동일 **`make sync-frontend-unified-chat`**) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md).

### E2E 테스트 (Playwright)

**방법 1 – webServer 자동 기동** (CRA 컴파일이 오래 걸리면 300s 타임아웃에 걸릴 수 있음)

```bash
npm run test:e2e
```

**방법 2 – 개발 서버 선실행 (권장)**  
터미널 1에서 `npm start` 후 "Compiled successfully"가 나온 뒤, 터미널 2에서:

```bash
npm run test:e2e:no-server
```

**방법 3 – 스크립트 한 번에 실행**  
서버 기동 → 90초 대기 → E2E 실행:

```bash
./scripts/run-e2e-with-server.sh
# 특정 스펙만: ./scripts/run-e2e-with-server.sh e2e/example.spec.ts
```

`E2E_SERVER_READY=1`이면 webServer를 띄우지 않고 `baseURL`(localhost:3000)만 사용합니다.

**경로 동기**: [e2e/paths.ts](./e2e/paths.ts)는 [src/config/routes.ts](./src/config/routes.ts)와 맞춥니다. **`name`·`getPageTitle` → 프로젝트 대화**는 [src/config/README.md](./src/config/README.md) 표·[USAGE_GUIDE.md](./USAGE_GUIDE.md) §1.2와 동일 문자열로 유지하고, Jest는 [TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test`·`npm run test:routes`·`npm run test:app-unified`·`npm run test:sidebar-context`·가이드는 [e2e/README.md](./e2e/README.md)를 참고하세요. 원격 push 막힘: [docs/PUSH_BLOCK_HANDOFF.md](./docs/PUSH_BLOCK_HANDOFF.md).

## 📚 상세 가이드

- [**기능 로직 및 강점**](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) — 대화 파이프라인·강점·발휘 조건
- [완전한 설정 가이드](./COMPLETE_SETUP.md)
- [상세 설정 가이드](./SETUP_GUIDE.md)
- [사용 가이드](./USAGE_GUIDE.md)
- [개발 로드맵](./DEVELOPMENT_ROADMAP.md)

## 🆘 지원

문제가 발생하면 GitHub Issues에 보고하거나 로그 파일을 확인하세요:

- 백엔드 로그: `corbu_ai.log`
- 프론트엔드 로그: 브라우저 개발자 도구 콘솔
