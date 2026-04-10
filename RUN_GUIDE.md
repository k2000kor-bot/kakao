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

### 네트워크 접속 (같은 LAN 내 다른 기기)

`.env.local`에 `HOST=0.0.0.0`, `DANGEROUSLY_DISABLE_HOST_CHECK=true`가 있으면,  
**같은 Wi‑Fi/LAN**에 있는 휴대폰·다른 PC에서 `http://<이 PC IP>:3000`으로 접속할 수 있습니다.

- 적용하려면 **프론트 서버 재시작** (`npm start` 중지 후 다시 실행).
- 예: `http://192.168.0.117:3000` (이 PC의 로컬 IP는 터미널에서 `ipconfig getifaddr en0` 등으로 확인).

## ✅ 실행 확인

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

### 5. 프로젝트별 노트북 LLM (선택)

- 프로젝트 생성 시 **이름·설명·태그·가이드라인**을 입력하면 해당 프로젝트로 대화할 때 AI가 이 정보를 반영해 답변합니다.
- 사용법: [프로젝트별 노트북 LLM 사용 가이드](./docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md)  
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
