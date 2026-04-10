# 프론트엔드 통합 가이드

## 🚀 서버 실행

### 방법 1: 직접 실행

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
python3 main_server.py
```

### 방법 2: uvicorn으로 실행

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
uvicorn main_server:app --host 0.0.0.0 --port 8000 --reload
```

## 📍 서버 정보

- **서버 주소**: `http://localhost:5002`
- **API 문서**: `http://localhost:5002/api/docs`
- **통합 API Base URL**: `http://localhost:5002/api/integrated`

## 🔗 프론트엔드 설정

### 환경 변수 설정

프론트엔드 `.env` 파일에 추가:

```env
REACT_APP_INTEGRATED_API_URL=http://localhost:5002/api/integrated
```

### TypeScript 클라이언트 사용

`/backend/api/integratedAPIClient.ts` 파일을 프론트엔드에 복사하거나 import:

```typescript
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
const socialContent = await integratedAPI.generateSocialMediaContent({
  platform: "instagram",
  content_type: "post",
  company_name: "우리 회사",
  industry: "건설업"
});
```

## 📋 사용 가능한 엔드포인트

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

## 🔍 테스트

서버가 실행 중인지 확인:

```bash
curl http://localhost:5002/api/integrated/health
```

메시지 분석 테스트:

```bash
curl -X POST http://localhost:5002/api/integrated/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "안녕하세요!"}'
```

## ⚠️ 주의사항

1. CORS는 이미 설정되어 있어 프론트엔드에서 바로 사용 가능합니다.
2. 서버는 포트 8000에서 실행됩니다.
3. 모든 엔드포인트는 `/api/integrated` prefix를 사용합니다.
