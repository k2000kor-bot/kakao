# 🚀 서버 실행 가이드

**실행 위치**: 아래 모든 명령은 **`package.json`이 있는 폴더**에서 실행하세요.  
(이 파일과 같은 폴더 = `kakao-frontend/kakao-frontend`)

**배포 직전 풀 검증(선택)**: 같은 폴더에서 `npm run verify:final` — [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)

**로컬 UI 스모크 체크리스트**: [docs/LOCAL_UI_SMOKE_CHECKLIST.md](docs/LOCAL_UI_SMOKE_CHECKLIST.md)


**보조 CRA `frontend/src/`** (루트 `src/` 미러): 루트 **`src/`**를 고친 뒤 저장소 루트에서 **`npm run sync:frontend-src`**(동일 **`make sync-frontend`**; `pretest`·`check:src-frontend-parity`(동일: `make check-frontend-parity`)). `chatInputUtils.ts`만 **`npm run sync:frontend-chat-input-utils`**(동일 **`make sync-frontend-chat-input`**). 통합 대화(UI) 등 부분 **`npm run sync:frontend-unified-chat`**(동일 **`make sync-frontend-unified-chat`**) — [QUICK_REFERENCE.md](QUICK_REFERENCE.md)·[AGENTS.md](AGENTS.md)·[scripts/README.md](scripts/README.md).

---

## 1. 한 번에 실행 (권장)

```bash
cd kakao-frontend/kakao-frontend   # 또는 이미 이 폴더에 있다면 생략
chmod +x start_all.sh
./start_all.sh
```

- 백엔드(5002)를 백그라운드로 띄운 뒤 프론트(3000)를 실행합니다.
- 브라우저에서 **http://localhost:3000** 접속.
- `Ctrl+C`로 프론트만 종료. 백엔드는 계속 동작(종료 시 `kill $(lsof -ti :5002)` 또는 새 터미널에서 `npm run restart:backend`로 재시작).

---

## 2. 터미널 두 개로 실행

**터미널 1 – 백엔드 (5002)**  
```bash
cd kakao-frontend/kakao-frontend
npm run restart:backend
```
→ `Uvicorn running on http://0.0.0.0:5002` 확인.

**터미널 2 – 프론트 (3000)**  
```bash
cd kakao-frontend/kakao-frontend
npm start
```
→ `Compiled successfully!` / `Local: http://localhost:3000` 확인 후 브라우저에서 **http://localhost:3000** 접속.

---

## 3. 접속 주소

| 서비스        | 주소 |
|---------------|------|
| 프론트엔드    | http://localhost:3000 |
| 백엔드 API    | http://localhost:5002 |
| API 문서      | http://localhost:5002/api/docs |
| Health 체크   | http://localhost:5002/api/health |

---

## 4. 접속 확인

```bash
cd kakao-frontend/kakao-frontend
npm run check:access
```

- 프론트(3000)·백(5002) 응답 코드가 출력됩니다.

---

## 5. 문제 해결

- **`ENOENT (package.json)`**  
  상위 폴더에서 실행한 경우입니다. 반드시 **`kakao-frontend/kakao-frontend`** 로 이동한 뒤 명령을 실행하세요.

- **백엔드가 안 뜨는 경우**  
  - 가상환경 생성: `cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements-core.txt`
  - 그 다음: `npm run restart:backend`

- **프론트만 켜고 싶을 때**  
  `npm start` 또는 `npm run restart`  
  (대화 등 API는 백엔드 5002가 떠 있어야 동작합니다.)

- **자세한 로컬 접속/방화벽/포트**: [docs/LOCAL_ACCESS_GUIDE.md](docs/LOCAL_ACCESS_GUIDE.md)
