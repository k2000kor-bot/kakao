# 로컬 접속 가이드

**⚠️ 중요**: `npm run restart`, `npm start`, `npm run restart:backend` 는 **반드시 `package.json`이 있는 폴더**에서 실행하세요.

**로컬 UI 스모크 체크리스트**: [LOCAL_UI_SMOKE_CHECKLIST.md](./LOCAL_UI_SMOKE_CHECKLIST.md)

- **올바른 경로**: `kakao-frontend/kakao-frontend` (안쪽 폴더).  
  상위 폴더(`kakao-frontend`만)에서 실행하면 `ENOENT (package.json)` 이 납니다.
- 예: 워크스페이스가 `/Users/본인/kakao-frontend` 이면 →  
  `cd kakao-frontend/kakao-frontend` 후 `npm start` / `npm run restart:backend` 실행.

- **보조 CRA `frontend/src/`** (개발자): 루트 **`src/`**가 캐논입니다. `npm test`·`pretest` 전에 **`npm run sync:frontend-src`**(동일 **`make sync-frontend`**; `pretest`·`check:src-frontend-parity`(동일: **`make check-frontend-parity`**))로 `frontend/src/`와 맞추고, `chatInputUtils.ts`만 바꿨다면 **`npm run sync:frontend-chat-input-utils`**(동일 **`make sync-frontend-chat-input`**); 통합 대화(UI) 등 부분은 **`npm run sync:frontend-unified-chat`**(동일 **`make sync-frontend-unified-chat`**) — [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](../scripts/README.md).

**NotebookLM·문서 허브·통합·로컬**: [README.md](./README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](../INTEGRATION_TEST_GUIDE.md)·[LOCAL_ACCESS_GUIDE.md](./LOCAL_ACCESS_GUIDE.md)·[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](../scripts/README.md) — [FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) §6 **통합 테스트·INTEGRATION_TEST_GUIDE(루트)·로컬 접속·LOCAL_ACCESS_GUIDE(docs)** 행 · §6 **개발 연속성·DEVELOPMENT_CONTINUITY(docs)·경로·뷰** 행 · §6 **개발 요약·개발자 체크리스트(docs)** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **접속·CONNECT(루트)** 행 · §6 **앱 실행·RUN_GUIDE(루트)** 행 · [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **통합 테스트·로컬 접속** · §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §6 **Agent / AI 개발 가이드** 행 · §6 **일상 개발·DEVELOPMENT(루트)** 행 · §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · 동 허브 **개발·개발 연속성** 표 `LOCAL_ACCESS_GUIDE` 행 · [TESTING_GUIDE.md](../TESTING_GUIDE.md) `routes.test` · [e2e/README.md](../e2e/README.md)·[docs/COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md)·[docs/FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)·표 행과 교차

**실행 가이드·접속 문제(루트)**: (본 문서 **로컬 3000/5002**·`check:access`·상단 경로 주의) · [RUN_GUIDE.md](../RUN_GUIDE.md)·[CONNECT.md](../CONNECT.md) — [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](../scripts/README.md)·[FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §4 **통합 테스트·로컬 접속** · [INTEGRATION_TEST_GUIDE.md](../INTEGRATION_TEST_GUIDE.md)·[docs/COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) §1.1 · [USAGE_GUIDE.md](../USAGE_GUIDE.md) §11 · [SYSTEM_READY.md](../SYSTEM_READY.md) §빠른 참조 · [DEVELOPMENT.md](../DEVELOPMENT.md) §2 · [README.md](../README.md)·[docs/README.md](./README.md) §NotebookLM·§개발 **통합·로컬** · 표 행과 교차

---

## 서버 접속이 안 될 때 (요약)

| 단계 | 할 일 |
|------|--------|
| 1 | 터미널에서 **`cd kakao-frontend/kakao-frontend`** (또는 절대경로로 해당 폴더로 이동) · 표 행과 교차 |
| 2 | **백엔드 먼저**: `npm run restart:backend` → `Uvicorn running on http://0.0.0.0:5002` 확인 · 표 행과 교차 |
| 3 | **프론트** (새 터미널에서 같은 폴더): `npm start` → `Compiled successfully` / `Local: http://localhost:3000` 확인 · 표 행과 교차 |
| 4 | 브라우저에서 **http://localhost:3000** 접속 · 표 행과 교차 |
| 확인 | `npm run check:access` → 프론트(3000)·백(5002) 응답 코드 출력 · 표 행과 교차 |

**접속이 안 될 때 — 서버 실행 (아래 중 하나만 하면 됨)**

1. **한 줄로 실행** (터미널에 붙여넣기, 경로는 본인 환경에 맞게 수정):
   ```bash
   cd /path/to/kakao-frontend/kakao-frontend && npm start
   ```
2. **재시작 스크립트** (프로젝트 폴더에서):
   ```bash
   npm run restart
   ```
   → `Compiled successfully!` / `Local: http://localhost:3000` 이 보일 때까지 기다린 뒤, 브라우저에서 **http://localhost:3000** 접속.

**프론트 포트: 3000** · **백엔드 포트: 5002** (proxy·config/api·restart:backend 모두 5002)

앱 **메뉴 URL·브라우저 제목**은 [src/config/README.md](../src/config/README.md)·[TESTING_GUIDE.md](../TESTING_GUIDE.md) (`npm run test:routes`·`routes.test`)·[e2e/README.md](../e2e/README.md)·[AGENTS.md](../AGENTS.md)와 맞춥니다(**`name`·`getPageTitle` → `/projects/:id` 프로젝트 대화** 등). 앱 셸·사이드바(선택): **`npm run test:app-unified`**·**`npm run test:sidebar-context`** — 동일 [TESTING_GUIDE.md](../TESTING_GUIDE.md). 원격 push 막힘: [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md).

## 프론트엔드 (http://localhost:3000)

### 서버 재구동 (권장)

포트를 정리한 뒤 서버를 다시 띄우려면:

```bash
cd kakao-frontend/kakao-frontend   # package.json 있는 폴더
npm run restart
```

- 포트 3000을 쓰는 기존 프로세스를 종료한 다음 `npm start`를 실행합니다.
- 매번 새 터미널에서 깔끔하게 띄우고 싶을 때 사용하면 됩니다.

### 일반 실행

1. **터미널에서 프로젝트 루트로 이동** (`package.json`이 있는 폴더)
   ```bash
   cd kakao-frontend/kakao-frontend
   ```

2. **개발 서버 실행**
   ```bash
   npm start
   ```
   - 첫 실행 시 컴파일이 1~2분 걸릴 수 있습니다.
   - `Compiled successfully!` 와 `Local: http://localhost:3000` 이 보이면 준비된 것입니다.

3. **브라우저에서 접속**
   - 같은 PC: http://localhost:3000 또는 http://127.0.0.1:3000
   - 같은 LAN 다른 기기: `npm start` / `npm run restart` 는 `HOST=0.0.0.0` 으로 동작하므로 **http://이_PC_IP:3000** 로 접속 가능 (예: http://192.168.0.10:3000). 다른 기기에서 API(대화 등)까지 쓰려면 `.env.local`에 `REACT_APP_API_URL=http://이_PC_IP:5002` 설정 후 재시작.

4. **접속이 안 될 때**
- **먼저 확인**: 브라우저에서 **http://localhost:3000/test.html** 을 연다. "접속됨"이 보이면 서버는 동작 중이고, 메인 앱(/)만 문제인 경우다. 이때 메인(/)에서 F12 → Console 에러를 확인한다.
- **test.html도 안 뜨면**: 터미널에서 `npm run restart` 실행 후 `Compiled successfully` / `Local: http://localhost:3000` 이 나올 때까지 대기한다. 나오지 않으면 터미널에 찍힌 에러를 확인한다.
  - **메모리 부족**인 경우: `NODE_OPTIONS=--max-old-space-size=4096 npm start`
  - **타입 체크로 인한 지연**이 길다면: `TSC_COMPILE_ON_ERROR=true npm start` 로 타입 오류가 있어도 일단 실행 가능합니다.
  - 포트 3000이 이미 사용 중이면: `npm run restart` 로 기존 프로세스 종료 후 재시작, 또는 `PORT=3002 npm start` 로 다른 포트 사용

## "API 연결 끊김" 해결 (대화·질문/요구 결과 출력)

- **대화 API**는 **포트 5002** 백엔드(`main_server.py`·uvicorn)를 사용합니다. `package.json`의 `proxy`가 `http://localhost:5002`로 설정되어 있어, 개발 서버(`npm start`)에서는 상대 경로 `/api/*` 요청이 5002로 전달됩니다.
- **"API 연결 끊김"**이 뜨는 경우:
  1. **백엔드(5002) 실행**: 같은 프로젝트 폴더에서 `npm run restart:backend` 실행 후, 사이드바 **다시 시도**를 누르거나 페이지를 새로고침하세요.
  2. **전송은 그대로 가능**: 연결 상태와 관계없이 **입력창에서 질문·요구를 입력하고 전송**할 수 있습니다. 백엔드를 실행한 뒤 전송하면 결과가 프론트에 출력됩니다.
- **환경 변수**: 로컬 개발 시 `REACT_APP_API_URL`을 **설정하지 않으면** 상대 경로가 사용되어 proxy(5002)로 연결됩니다. 다른 포트의 백엔드를 쓰려면 `REACT_APP_API_URL=http://localhost:해당포트` 로 설정하세요.

## 백엔드 (API, 선택 사항)

대화/프로젝트 API를 쓰려면 백엔드도 실행해야 합니다.

### 백엔드 재구동

```bash
cd kakao-frontend/kakao-frontend   # package.json 있는 폴더
npm run restart:backend
```

- 포트 **5002**를 쓰는 기존 프로세스를 종료한 뒤 `uvicorn main_server:app --port 5002` 를 실행합니다.

### 수동 실행

```bash
cd kakao-frontend/kakao-frontend/backend
python3 -m uvicorn main_server:app --host 0.0.0.0 --port 5002 --reload
```

- 백엔드가 없어도 **프론트는 뜹니다**. 프로젝트 목록 등은 로컬 스토리지·타임아웃 후 빈 상태로 표시됩니다.

## 한번에 확인

| 목적 | 명령 |
|------|------|
| 프론트만 | `npm run restart` → 브라우저에서 http://localhost:3000 · 표 행과 교차 |
| 백엔드만 | `npm run restart:backend` → API http://localhost:5002 · 표 행과 교차 |
| 둘 다 | **터미널 1**: `npm run restart:backend` / **터미널 2**: `npm run restart` → http://localhost:3000 · 표 행과 교차 |

- 프론트가 켜진 상태에서 백엔드를 띄우면, 같은 주소에서 대화·프로젝트 생성 등을 테스트할 수 있습니다.

## 접속 확인 체크리스트

| 확인 항목 | 방법 |
|-----------|------|
| 한번에 확인 | `bash scripts/check-access.sh` 또는 `npm run check:access` → 프론트(3000)·백(5002) 응답 코드 출력 · 표 행과 교차 |
| API 검증 | `npm run verify:api` → /api/health, /api/status, /api/docs · 표 행과 교차 |
| 통합 테스트 | `npm run test:integration` → 대화 API·에러 시나리오(400/422)·스트리밍 검증 (백엔드 실행 중 필요) · 표 행과 교차 |
| 프론트 Jest(선택) | `npm run test:routes`·`npm run test:app-unified`·`npm run test:sidebar-context` → 라우트·제목 계약·AppUnified 셸·사이드바 컨텍스트 (백엔드 불필요). [TESTING_GUIDE.md](../TESTING_GUIDE.md)·[PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)·표 행과 교차 |
| 빌드 성공 | `npm run build` → "Compiled successfully" · 표 행과 교차 |
| 프론트 접속 | 브라우저에서 http://localhost:3000 또는 http://localhost:3000/test.html · 표 행과 교차 |
| 백엔드 상태 | `curl http://localhost:5002/api/health` → JSON 응답 확인 · 표 행과 교차 |
| 프론트+백 동시 | 위 둘 다 실행 후 3000에서 대화/프로젝트 동작 확인 · 표 행과 교차 |

---

## 배포 직전 풀 검증 (선택)

접속·빌드가 된 뒤 **import 검사·빌드·접속·API·통합·대화 Jest·UI 스모크**까지 한 번에 보려면 프로젝트 루트에서 **`npm run verify:final`** (`scripts/final-verify.sh`). UI 스모크만 순차 Jest: **`npm run verify:final:sequential-smoke`**. 상세는 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md) 참고.
