# 접속이 안 될 때 (아무것도 안 보일 때)

**NotebookLM·문서 허브·통합·로컬**: [docs/README.md](./docs/README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](./docs/LOCAL_ACCESS_GUIDE.md)·[CONNECT.md](./CONNECT.md)·[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md) — [기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 **접속·CONNECT(루트)** 행 · §6 **개발 연속성·DEVELOPMENT_CONTINUITY(docs)·경로·뷰** 행 · §6 **개발 요약·개발자 체크리스트(docs)** 행 · §6 **컴포넌트 아키텍처·COMPONENT_ARCHITECTURE(docs)·라우트→뷰** 행 · §6 **config README·routes.ts(src/config)·프로젝트 대화** 행 · §6 **Agent / AI 개발 가이드** 행 · §6 **시스템 준비·SYSTEM_READY(루트)** 행 · §6 **일상 개발·DEVELOPMENT(루트)** 행 · §6 **검증·빠른 참조·QUICK_REFERENCE(루트)** 행 · [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) 서두 **검증·실행·접속(루트)** · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · 동 허브 **개발·개발 연속성** 표 `CONNECT` 행 · [SYSTEM_READY.md](./SYSTEM_READY.md) 서두 **시스템 준비·실행·접속(루트)** · [DEVELOPMENT.md](./DEVELOPMENT.md) 서두 **일상 개발·실행·접속(루트)** · §6 **테스트 가이드·TESTING_GUIDE(루트)·API(docs)** 행 · [TESTING_GUIDE.md](./TESTING_GUIDE.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · §6 **E2E 가이드·e2e/README(루트)·경로 허브(docs)** 행 · [e2e/README.md](./e2e/README.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · §6 **완성 체크리스트·COMPLETION_CHECKLIST(docs)** 행 · [docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · §6 **배포·풀 스택 체크리스트(docs)** 행 · [docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md) 서두 **실행 가이드·접속 문제(루트)** · §6 **스크립트 허브·scripts/README(루트)·dev/deploy(docs)** 행 · §4 **스크립트 허브(루트 scripts/README)** · [scripts/README.md](./scripts/README.md) 서두 **NotebookLM·문서 허브·통합·로컬** 교차 · [src/config/README.md](./src/config/README.md)·[AGENTS.md](./AGENTS.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test` · [e2e/README.md](./e2e/README.md)·표 행과 교차

**실행 가이드·접속 문제(루트)**: [RUN_GUIDE.md](./RUN_GUIDE.md) (백엔드·프론트 **기동**·5002·3000) · (**접속·원격·포트**는 **본 문서** §2 이하·§7) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·[기능 로직 및 강점](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [NotebookLM 기능 로드맵](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 **에이전트 가이드** · §4 **config README(`routes.ts`)** · §4 **라우트·컴포넌트 매핑** · §4 **접속·CONNECT(루트)** · §4 **앱 기동·RUN_GUIDE(루트)** · §4 **통합 테스트·로컬 접속** · [USAGE_GUIDE.md](./USAGE_GUIDE.md) §11 · [컴포넌트 아키텍처](./docs/COMPONENT_ARCHITECTURE.md) §1.1 · [QUICK_START.md](./QUICK_START.md)·[README_FIRST.md](./README_FIRST.md)·[START_HERE.md](./START_HERE.md)·[DEVELOPMENT_CONTINUITY.md](./docs/DEVELOPMENT_CONTINUITY.md) §1·§2 · [SYSTEM_READY.md](./SYSTEM_READY.md) §빠른 참조 · [DEVELOPMENT.md](./DEVELOPMENT.md) §2 · [README.md](./README.md)·[docs/setup/PYTHON_VENV.md](./docs/setup/PYTHON_VENV.md)·[docs/setup/MACOS_DEV_QUICKSTART.md](./docs/setup/MACOS_DEV_QUICKSTART.md)·[docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md)(`verify:completion`) · [docs/FINAL_CHECKLIST.md](./docs/FINAL_CHECKLIST.md)(`verify:final`) · 표 행과 교차

**로컬 UI 스모크 체크리스트**: [docs/LOCAL_UI_SMOKE_CHECKLIST.md](./docs/LOCAL_UI_SMOKE_CHECKLIST.md)

## 1. 가장 중요한 점

**브라우저를 여는 PC**와 **터미널에서 `npm start`를 실행하는 PC**가 **같은 컴퓨터**여야 합니다.

- Cursor/VS Code **원격 개발**을 쓰면: 서버는 원격 PC에서 돌고, 브라우저는 **본인 PC**에서 열립니다.  
  → **본인 PC**에서 터미널을 열고 아래를 실행하거나, Cursor에서 **포트 포워딩**을 켜야 합니다 (아래 "원격 개발 시" 참고).
- **같은 PC**에서 터미널 2개를 열고, 하나는 백엔드, 하나는 `npm start` 실행한 뒤, **그 PC**의 브라우저에서 접속하세요.

---

## 0. 먼저: "이 PC에서 서버가 되는지" 확인 (선택)

React/npm 없이 **접속만** 확인하고 싶다면, **브라우저를 열 PC**에서:

```bash
cd /path/to/kakao-frontend/kakao-frontend   # package.json 있는 폴더
python3 scripts/serve-check.py
```

그 다음 브라우저에서 **http://localhost:3999** 를 엽니다.

- **"이 화면이 보이면"** 이 나오면 → 이 PC에서 서버 접속은 됩니다. 2단계로 가서 `npm start` 후 3000 포트로 접속하세요.
- **연결할 수 없음 / 빈 화면** 이면 → 이 PC에서 3999 포트가 막혀 있거나, 터미널을 **다른 PC**에서 연 것입니다. **브라우저를 여는 그 PC**의 터미널에서 위를 실행하세요.

---

## 2. 순서 (반드시 이 PC에서 실행)

**브라우저를 열 컴퓨터**에서 아래를 진행하세요.

### 터미널 1 (백엔드)

**권장** (프로젝트 루트에서, venv 자동 탐지):

```bash
cd /path/to/kakao-frontend/kakao-frontend
npm run restart:backend
```

**대안** (Flask 통합 엔트리 직접):

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
python3 -m api.main
```

`Running on http://127.0.0.1:5002` (또는 uvicorn 로그)가 나올 때까지 기다립니다.

### 터미널 2 (프론트)

```bash
cd /path/to/kakao-frontend/kakao-frontend
npm start
```

`Compiled successfully!` 와 `Local: http://localhost:3000` (또는 3001) 이 나올 때까지 기다립니다.

### 브라우저

1. **먼저** 아래 주소를 **그대로** 입력해서 엽니다.  
   **http://localhost:3000/standalone.html**
2. **진한 배경 + "CORBU.AI - 이 화면이 보이면"** 이 보이면 → 서버 접속 성공.  
   같은 탭에서 **/** 로 가거나, 주소창에 **http://localhost:3000/** 입력해서 메인으로 이동합니다.
3. **standalone.html 도 안 보이면** → 이 PC에서 3000 포트로 서버가 안 떠 있는 것입니다.  
   - 터미널 2에서 `npm start` 가 **에러 없이** 끝까지 실행 중인지 확인  
   - 주소가 **http://localhost:3000** 인지 (다른 숫자 아님)  
   - **다른 PC**에서 터미널을 켠 건 아닌지 확인  

---

## 3. 포트가 3001로 나올 때

`npm start` 후 터미널에 `http://localhost:3001` 만 나오면, 3000이 이미 사용 중이라 3001로 뜬 것입니다.  
이때는 아래로 접속합니다.

- **http://localhost:3001/standalone.html**
- **http://localhost:3001/**

---

## 3-1. 백엔드 연결 확인 (선택)

프론트는 뜨는데 대화·API가 동작하지 않을 때, **백엔드(5002)** 가 떠 있는지 확인하세요.

- 브라우저에서 **http://localhost:5002/api/health** 를 엽니다.
- `{"success":true,"data":{"status":"healthy",...}}` 비슷한 JSON이 보이면 백엔드 정상입니다.
- **http://localhost:5002/api** 를 열면 사용 가능한 API 엔드포인트 목록이 나옵니다.
- **http://localhost:5002/api/docs** 에서 Swagger UI API 문서를 볼 수 있습니다.
- API 요청 본문은 **최대 16MB**까지 허용됩니다. 초과 시 413 응답이 반환됩니다.

터미널 1에서 **`npm run restart:backend`** 또는 `python3 -m api.main` 이 **에러 없이** 실행 중인지 확인하세요.

---

## 4. 그래도 아무것도 안 보일 때

1. **캐시 없이 새로고침**: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
2. **시크릿/프라이빗 창**에서 **http://localhost:3000/standalone.html** 다시 열기
3. **다른 브라우저** (Chrome, Edge, Safari 등)로 같은 주소 열기
4. **주소창에 주소를 직접 입력** (북마크나 자동완성 말고)  
5. **주소가 `http://localhost:3000` 인지 확인** — `file:///...` 이나 `https://...` 가 아니어야 합니다.

---

## 5. 정리

| 확인 | 주소 | 보여야 하는 것 |
|------|------|----------------|
| 서버 접속 여부 | http://localhost:3000/standalone.html | 진한 배경 + "이 화면이 보이면" |
| 메인 앱 | http://localhost:3000/ | 대화 화면 또는 로딩/오류 메시지 |
| 백엔드 API | http://localhost:5002/api/health | JSON `"status": "healthy"` |

**standalone.html** 이 보이면 서버는 동작 중이므로, 메인(/)만 문제인 경우입니다.  
**standalone.html** 도 안 보이면, **같은 PC**에서 `npm start` 를 다시 실행했는지 확인하세요.

---

## 5-1. docx 대본 → 목소리 샘플 확인 (선택)

워드(docx)나 텍스트 파일에서 대본을 추출한 뒤, 바로 음성으로 들어보려면:

1. **http://localhost:3000** 접속 → **고급 기능** → **목소리 생성** 탭
2. **📄 문서에서 추출 (docx/txt)** 클릭 후 docx 또는 txt 파일 선택
3. 추출된 텍스트가 **대본** 칸에 채워지면 **생성 후 재생** 버튼 클릭 (또는 **🎙️ 생성** 후 **▶ 재생**)
4. TTS가 동작하려면 백엔드에 **QWEN_TTS_BASE_URL**이 설정되어 있어야 합니다. docx 추출만 쓰려면 **python-docx**가 백엔드에 설치되어 있으면 됩니다 (`pip install python-docx`).
5. 대본 입력 칸에서 **Cmd/Ctrl+Enter**: 음성 생성, **Cmd/Ctrl+Shift+Enter**: 음성 생성 후 바로 재생.

---

## 6. 원격 개발 시 (Cursor/VS Code SSH·WSL·원격)

- **서버는 원격 PC**, **브라우저는 본인 PC**에서 여는 경우:
  1. **방법 A**: **본인 PC**에서 터미널을 열고, 프로젝트 폴더를 연 뒤 위 2단계(백엔드 + `npm start`)를 **본인 PC에서** 실행. 그 다음 본인 PC 브라우저에서 `http://localhost:3000/standalone.html` 접속.
  2. **방법 B**: 원격에서 `npm start` 한 상태로, Cursor/VS Code **포트 포워딩**에서 **3000** 포트를 포워드. 그 다음 "브라우저에서 열기" 또는 본인 PC에서 `http://localhost:3000/standalone.html` 접속 (포워딩된 주소가 다르면 그 주소 사용).

- **WSL** 사용 시: WSL 터미널에서 `npm start` 한 뒤, **Windows** 브라우저에서는 `http://localhost:3000` 이 아니라 WSL2 기준으로 `http://127.0.0.1:3000` 또는 터미널에 나온 URL을 사용하세요.

---

## 7. 테스트 실행 (선택)

- **마무리 검증 (한 번에)**: `npm run verify:completion` — 타입·린트·P4 170 tests. 통과 시 배포 가능. [docs/COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) §6.
- **배포 전 검증 + 프로덕션 빌드**: `npm run deploy:check` — 위 마무리 검증 후 `build/` 생성.
- **빌드·접속·API·통합 + 대화 Jest + UI 스모크**: `npm run verify:final` — `final-verify.sh`가 **`npm run check:test-imports`** 후 빌드·check:access·verify:api·test:integration에 이어 **`npm run test:frontend:chat-pipeline`**, **`npm run test:chat-ui-interfaces:smoke`** 순으로 실행(실패 시 exit 1). 순차 스모크: **`npm run verify:final:sequential-smoke`**. [docs/FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md).
- **대화 파이프라인만 (Jest)**: `npm run test:frontend:chat-pipeline` — 백엔드 없이 `chatInputUtils`·스트리밍·프롬프트·Genspark 패널. [guides/RESPONSE_CLEANING.md](docs/guides/RESPONSE_CLEANING.md). 루트 `npm test` 전 보조 트리 패리티: **`npm run sync:frontend-src`**(동일 **`make sync-frontend`**; `pretest`·`check:src-frontend-parity`(동일: `make check-frontend-parity`)); 또는 `chatInputUtils`만 **`npm run sync:frontend-chat-input-utils`**(동일 **`make sync-frontend-chat-input`**); 통합 대화(UI) 등 부분 **`npm run sync:frontend-unified-chat`**(동일 **`make sync-frontend-unified-chat`**)) — [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md).
- **라우트만 (Jest)**: `npm run test:routes` — **27** tests (`pretest` 포함). [TESTING_GUIDE.md](./TESTING_GUIDE.md) 주요 검증 표.
- **통합 앱 셸만 (Jest)**: `npm run test:app-unified` — **115** tests (수 초대). [TESTING_GUIDE.md](./TESTING_GUIDE.md).
- **사이드바 컨텍스트 회귀 (Jest)**: `npm run test:sidebar-context` — [TESTING_GUIDE.md](./TESTING_GUIDE.md)·[docs/PUSH_BLOCK_HANDOFF.md](./docs/PUSH_BLOCK_HANDOFF.md).
- **원격 `git push` 막힘 (로컬 이관·점검)**: `npm run maintain:push-block` — [docs/PUSH_BLOCK_HANDOFF.md](./docs/PUSH_BLOCK_HANDOFF.md).
- **뷰·라우트**: `npm run test:views` — 22 suites, 142 tests (배포 전 권장).
- **백엔드 API 테스트**: `cd backend && python3 -m pytest tests/test_main_api.py -v`  
  통과 시 **약 60개 이상** 테스트가 실행됩니다 (루트·health·status·api·docs·projects·TTS·script-style 등).
- **E2E 테스트**: 프론트 서버가 이미 떠 있는 상태에서 `npm run test:e2e:no-server` (또는 서버 자동 기동 시 `npm run test:e2e`).  
  Chromium 기준 69 passed, 6 skipped. 상세: [e2e/README.md](./e2e/README.md)·[e2e/paths.ts](./e2e/paths.ts)(`src/config/routes.ts`와 동기) · [docs/DEVELOPER_QUICK_CHECKLIST.md](./docs/DEVELOPER_QUICK_CHECKLIST.md) §6~7 · **`name`·`getPageTitle` → 프로젝트 대화**: [src/config/README.md](./src/config/README.md)·[USAGE_GUIDE.md](./USAGE_GUIDE.md) §1.2 · [AGENTS.md](./AGENTS.md)·[TESTING_GUIDE.md](./TESTING_GUIDE.md) `routes.test`
- **NotebookLM·문서 허브·통합·로컬**: [docs/README.md](./docs/README.md) §NotebookLM·§개발 **통합·로컬**·[INTEGRATION_TEST_GUIDE.md](./INTEGRATION_TEST_GUIDE.md)·[docs/LOCAL_ACCESS_GUIDE.md](./docs/LOCAL_ACCESS_GUIDE.md)·[CONNECT.md](./CONNECT.md)·[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)·[AGENTS.md](./AGENTS.md)·[scripts/README.md](./scripts/README.md)·[NOTEBOOKLM_FEATURE_ROADMAP.md](./docs/NOTEBOOKLM_FEATURE_ROADMAP.md) §4 · [FEATURE_LOGIC_AND_STRENGTHS.md](./docs/FEATURE_LOGIC_AND_STRENGTHS.md) §6 — **`/projects/:id`** · [src/config/README.md](./src/config/README.md)(**`name`·`getPageTitle` → 프로젝트 대화**) · 백엔드 venv·macOS: [docs/setup/PYTHON_VENV.md](./docs/setup/PYTHON_VENV.md)·[docs/setup/MACOS_DEV_QUICKSTART.md](./docs/setup/MACOS_DEV_QUICKSTART.md)·루트 개요·**실행 가이드·접속**: [README.md](./README.md)·[README_FIRST.md](./README_FIRST.md)·[DEVELOPMENT.md](./DEVELOPMENT.md) §2 · [SYSTEM_READY.md](./SYSTEM_READY.md) §빠른 참조 · [RUN_GUIDE.md](./RUN_GUIDE.md)·표 행과 교차

---

## 8. 창이 예기치 않게 종료될 때 (크래시, 코드 5)

**증상**: "창이 예기치 않게 종료되었습니다(원인: 'crashed', 코드: '5')" 또는 브라우저/개발 서버가 반복적으로 꺼짐.

### 8.1 즉시 시도할 것

1. **메모리 확대 실행** (권장)
   ```bash
   npm run start:safe
   ```
   `start:safe`는 Node 힙 메모리를 8GB로 늘립니다. `npm start`·`npm run build`도 이미 `NODE_OPTIONS=--max-old-space-size=8192`를 적용해 두었습니다.

2. **브라우저·캐시 초기화**
   - Chrome: 설정 → 개인정보 및 보안 → 인터넷 사용 기록 삭제 → 캐시된 이미지 및 파일
   - 또는 **시크릿 창**에서 `http://localhost:3000` 접속

3. **Service Worker 제거** (localhost에서 SW 충돌 시)
   - Chrome: F12 → Application → Service Workers → Unregister
   - 또는 주소에 `?sw=0`을 붙이지 않고 접속 (개발 모드에서는 localhost에서 SW가 등록되지 않도록 설정됨)

### 8.2 그래도 크래시할 때

4. **node_modules 재설치**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

5. **다른 브라우저** 사용 (Chrome → Edge 또는 Safari)

6. **Cursor/IDE 재시작**: Cursor 창 자체가 크래시한다면 Cursor를 완전히 종료한 뒤 다시 실행. `.cursor/rules/session-continuity.mdc`의 작업 분할·요청 단순화를 따르면 재발 가능성이 줄어듭니다.

### 8.2a Cursor·개발 서버가 자꾸 종료될 때

**상세 가이드**: [docs/CRASH_PREVENTION.md](docs/CRASH_PREVENTION.md)

### 8.2b Cursor 창 크래시가 반복될 때 (코드 5)

- **Cursor 전용 조치**
  1. Cursor 완전 종료 후 재실행 (⌘Q 등으로 종료, 재실행)
  2. 불필요한 탭·창을 닫고 한 프로젝트만 열기
  3. `.cursorignore` 확인: 루트의 `.cursorignore`에 `node_modules/`, `frontend/node_modules/`, `build/`, `backup/`, `backups/`, `corbu-ai/`, `*.db`, `*.log`, `.DS_Store` 등 대용량·불필요 폴더·파일이 제외되어 있는지 확인. 없으면 추가해 Cursor 인덱싱 부담을 줄임.
  4. 대형 파일·폴더 첨부를 피하고, 요청은 짧고 구체적으로 유지
- **시스템 여유**: 다른 앱(브라우저·Docker 등)을 정리해 메모리 여유 확보

### 8.3 근본 원인

- **메모리 부족**: TensorFlow.js·대형 번들 등으로 Node/브라우저 힙 초과 → `NODE_OPTIONS=--max-old-space-size=8192` 적용 완료 (start·start:safe·build·restart-frontend)
- **Service Worker 충돌**: 개발 시 localhost에서 SW 비활성화 (index.html 참고)
- **GPU/렌더러**: Chrome에서 `chrome://settings/system` → 하드웨어 가속 사용 중지 후 재시도
