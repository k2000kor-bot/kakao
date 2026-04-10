# 서버 시작 가이드

## 🚀 통합 API 서버 실행

### 빠른 시작

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
python3 main_server.py
```

서버는 `http://localhost:5002`에서 실행됩니다.

### 필요한 패키지

다음 패키지들이 설치되어 있어야 합니다:

```bash
pip3 install --break-system-packages fastapi uvicorn psutil redis
```

또는 requirements.txt 사용:

```bash
pip3 install --break-system-packages -r requirements.txt
```

### 서버 확인

서버가 정상적으로 실행되었는지 확인:

```bash
# 헬스 체크
curl http://localhost:5002/api/integrated/health

# API 문서 확인
open http://localhost:5002/api/docs
```

### 프론트엔드 연동

프론트엔드에서 사용하려면:

1. 환경 변수 설정 (`.env` 파일):

   ```env
   REACT_APP_INTEGRATED_API_URL=http://localhost:5002/api/integrated
   ```

2. TypeScript 클라이언트 사용:

   ```typescript
   import { integratedAPI } from './services/integratedAPIClient';
   
   // 메시지 분석
   const result = await integratedAPI.analyzeMessage({
     message: "안녕하세요!"
   });
   ```

### 사용 가능한 엔드포인트

모든 엔드포인트는 `/api/integrated` prefix를 사용합니다:

- `POST /api/integrated/analyze` - 메시지 분석
- `GET /api/integrated/status` - 시스템 상태
- `GET /api/integrated/health` - 헬스 체크
- `POST /api/integrated/creative/story` - 스토리 생성
- `POST /api/integrated/marketing/social` - 소셜미디어 콘텐츠
- 등등... (총 21개 엔드포인트)

자세한 내용은 `INTEGRATED_API_README.md`를 참고하세요.

### 문제 해결

서버가 시작되지 않는 경우:

1. 로그 확인:

   ```bash
   tail -f integrated_server.log
   ```

2. 포트 확인:

   ```bash
   lsof -ti:8000
   ```

3. 프로세스 확인:

   ```bash
   ps aux | grep main_server.py
   ```

### 백그라운드 실행

```bash
nohup python3 main_server.py > integrated_server.log 2>&1 &
```

### 서버 중지

```bash
pkill -f "main_server.py"
```
