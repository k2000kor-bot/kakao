# CORBU AI 실행 가이드

## 🚀 빠른 시작

### 방법 1: 통합 실행 (권장)

```bash
# 프로젝트 루트에서
chmod +x start_all.sh
./start_all.sh
```

이 명령어로 백엔드와 프론트엔드를 동시에 시작합니다.

### 방법 2: 개별 실행

#### 백엔드 실행 (FastAPI - 포트 8000)

```bash
cd backend
python3 main_server.py
```

#### 프론트엔드 실행

```bash
# 새 터미널에서
npm start
```

## 📍 접속 정보

실행 후 다음 URL로 접속:

| 서비스 | URL | 설명 |
|--------|-----|------|
| **프론트엔드** | http://localhost:3000 | ChatGPT 스타일 인터페이스 |
| **백엔드 API** | http://localhost:8000 | FastAPI 메인 서버 |
| **API 문서 (Swagger)** | http://localhost:8000/api/docs | API 문서 |
| **API 문서 (ReDoc)** | http://localhost:8000/api/redoc | 대안 API 문서 |
| **헬스 체크** | http://localhost:8000/api/health | 서버 상태 확인 |

## ✅ 실행 확인

### 1. 백엔드 확인

터미널에서:
```bash
curl http://localhost:8000/api/health
```

또는 브라우저에서 http://localhost:8000/api/health 접속

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

### 4. 채팅 테스트

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "안녕하세요", "quality": "enhanced"}'
```

## 🔧 문제 해결

### 포트 충돌

**백엔드 (기본: 8000):**
```bash
# main_server.py에서 포트 변경
# 또는 환경 변수 사용
PORT=8001 python3 main_server.py
```

**프론트엔드 (기본: 3000):**
```bash
PORT=3001 npm start
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

```bash
npx playwright test
```

## 📚 상세 가이드

- [완전한 설정 가이드](./COMPLETE_SETUP.md)
- [상세 설정 가이드](./SETUP_GUIDE.md)
- [사용 가이드](./USAGE_GUIDE.md)
- [개발 로드맵](./DEVELOPMENT_ROADMAP.md)

## 🆘 지원

문제가 발생하면 GitHub Issues에 보고하거나 로그 파일을 확인하세요:

- 백엔드 로그: `corbu_ai.log`
- 프론트엔드 로그: 브라우저 개발자 도구 콘솔
