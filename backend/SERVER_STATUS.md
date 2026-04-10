# 서버 실행 상태

## ✅ 서버 실행 완료

통합 API 서버가 **포트 8000**에서 정상적으로 실행 중입니다.

### 서버 정보

- **서버 주소**: `http://localhost:5002`
- **API 문서**: `http://localhost:5002/api/docs` (Swagger UI)
- **ReDoc**: `http://localhost:5002/api/redoc`
- **통합 API Base**: `http://localhost:5002/api/integrated`

### 서버 확인

```bash
# 헬스 체크
curl http://localhost:5002/api/integrated/health

# 시스템 상태
curl http://localhost:5002/api/integrated/status

# 루트 엔드포인트
curl http://localhost:5002/
```

### 서버 중지

```bash
# 프로세스 종료
pkill -f "start_simple_integrated_server.py"

# 또는 포트로 종료
kill -9 $(lsof -ti:8000)
```

### 서버 재시작

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
python3 start_simple_integrated_server.py
```

## 🔗 프론트엔드 연동

프론트엔드에서 바로 사용 가능합니다:

```typescript
// 환경 변수 설정 (.env)
REACT_APP_INTEGRATED_API_URL=http://localhost:5002/api/integrated

// TypeScript 사용
import { integratedAPI } from './services/integratedAPIClient';

const result = await integratedAPI.analyzeMessage({
  message: "안녕하세요!"
});
```

## 📋 사용 가능한 엔드포인트

모든 엔드포인트는 `/api/integrated` prefix를 사용합니다.

자세한 내용은 `api/INTEGRATED_API_README.md` 참고
