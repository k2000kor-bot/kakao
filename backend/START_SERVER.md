# 서버 시작 가이드

## ✅ 준비 완료

통합 API 서버가 프론트엔드에서 사용할 수 있도록 준비되었습니다.

## 🚀 서버 실행 방법

### 방법 0: 프로젝트 루트에서 (가장 권장)

`package.json`이 있는 폴더에서:

```bash
cd /path/to/kakao-frontend/kakao-frontend
npm run restart:backend
```

### 방법 1: 간단한 통합 API 서버

의존성이 적고 빠르게 시작할 수 있습니다:

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
python3 start_simple_integrated_server.py
```

### 방법 2: 전체 기능 서버

모든 기능을 포함한 서버:

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
python3 main_server.py
```

## 📍 서버 정보

서버가 시작되면:

- **서버 주소**: `http://localhost:5002`
- **API 문서**: `http://localhost:5002/api/docs` (Swagger UI)
- **통합 API Base**: `http://localhost:5002/api/integrated`

## 🔍 서버 확인

터미널에서 다음 명령어로 확인:

```bash
# 헬스 체크
curl http://localhost:5002/api/integrated/health

# 시스템 상태
curl http://localhost:5002/api/integrated/status

# 메시지 분석 테스트
curl -X POST http://localhost:5002/api/integrated/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "안녕하세요!"}'
```

## 🔗 프론트엔드 연동

### 1. 환경 변수 설정

프론트엔드 프로젝트의 `.env` 파일에 추가:

```env
REACT_APP_INTEGRATED_API_URL=http://localhost:5002/api/integrated
```

### 2. TypeScript 클라이언트 사용

`/backend/api/integratedAPIClient.ts` 파일을 프론트엔드에 복사하거나:

```typescript
// 프론트엔드에서 사용
import { integratedAPI } from './services/integratedAPIClient';

// 메시지 분석
const result = await integratedAPI.analyzeMessage({
  message: "안녕하세요! 좋은 하루네요!"
});

// 스토리 생성
const story = await integratedAPI.generateStory({
  genre: "romance",
  theme: "사랑"
});

// 마케팅 콘텐츠 생성
const content = await integratedAPI.generateSocialMediaContent({
  platform: "instagram",
  content_type: "post",
  company_name: "우리 회사",
  industry: "건설업"
});
```

### 3. 직접 fetch 사용

```typescript
const response = await fetch('http://localhost:5002/api/integrated/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: "안녕하세요!"
  })
});

const data = await response.json();
```

## 📋 사용 가능한 모든 엔드포인트

### 기본 기능

- `POST /api/integrated/analyze` - 메시지 분석
- `GET /api/integrated/status` - 시스템 상태
- `GET /api/integrated/health` - 헬스 체크
- `GET /api/integrated/metrics` - 성능 메트릭
- `GET /api/integrated/analytics` - 분석 대시보드
- `GET /api/integrated/logs` - 시스템 로그

### 창작 콘텐츠

- `POST /api/integrated/creative/story` - 스토리 생성
- `POST /api/integrated/creative/poem` - 시 생성
- `POST /api/integrated/creative/essay` - 에세이 생성
- `POST /api/integrated/creative/analyze` - 글쓰기 분석

### 설득 콘텐츠

- `POST /api/integrated/persuasion/construction` - 건설사 설득 콘텐츠
- `POST /api/integrated/persuasion/contractor` - 시공사 긍정 콘텐츠
- `POST /api/integrated/persuasion/analyze` - 설득 콘텐츠 분석

### 마케팅 콘텐츠

- `POST /api/integrated/marketing/social` - 소셜미디어 콘텐츠
- `POST /api/integrated/marketing/email` - 이메일 마케팅
- `POST /api/integrated/marketing/analyze` - 마케팅 콘텐츠 분석

### 고급 분석

- `POST /api/integrated/analytics/advanced` - 고급 데이터 분석
- `POST /api/integrated/analytics/predictions` - 예측 분석
- `POST /api/integrated/analytics/insights` - 인사이트 생성

### AI 최적화

- `POST /api/integrated/ai/optimize` - AI 모델 최적화
- `POST /api/integrated/ai/benchmark` - AI 모델 벤치마크
- `POST /api/integrated/ai/feedback` - AI 피드백 처리

## ⚠️ 문제 해결

### 서버가 시작되지 않는 경우

1. **포트 확인**:

   ```bash
   lsof -ti:8000
   ```

   다른 프로세스가 사용 중이면 종료:

   ```bash
   kill -9 $(lsof -ti:8000)
   ```

2. **의존성 확인**:

   ```bash
   pip3 install --break-system-packages fastapi uvicorn
   ```

3. **로그 확인**:

   ```bash
   tail -f integrated_server.log
   ```

### CORS 오류

서버의 CORS는 이미 설정되어 있습니다. 프론트엔드에서 바로 사용 가능합니다.

## 📚 추가 문서

- `api/INTEGRATED_API_README.md` - 상세 API 문서
- `INTEGRATION_SUMMARY.md` - 통합 작업 요약
- `FRONTEND_INTEGRATION_GUIDE.md` - 프론트엔드 연동 가이드

---

**서버를 실행한 후 프론트엔드에서 `http://localhost:5002/api/integrated`로 접근하세요!**
