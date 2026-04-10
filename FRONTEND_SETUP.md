# 프론트엔드 통합 API 설정 가이드

## ✅ 완료된 작업

1. **프론트엔드 서비스 업데이트**
   - `frontend/src/services/integratedAPIService.ts` 업데이트 완료
   - 포트 8000으로 변경 완료
   - 모든 엔드포인트 메서드 추가 완료

2. **React Hook 생성**
   - `frontend/src/hooks/useIntegratedAPI.ts` 생성
   - 모든 API 기능을 사용할 수 있는 커스텀 훅

3. **예시 컴포넌트 생성**
   - `frontend/src/components/IntegratedAPIDemo.tsx` 생성
   - 사용 예시 포함

## 🔧 환경 설정

### 1. 환경 변수 설정

프론트엔드 프로젝트 루트에 `.env` 파일 생성:

```env
REACT_APP_INTEGRATED_API_URL=http://localhost:5002/api/integrated
```

### 2. 서버 실행 확인

백엔드 서버가 실행 중인지 확인:

```bash
curl http://localhost:5002/api/integrated/health
```

## 📖 사용 방법

### 방법 1: React Hook 사용 (권장)

```typescript
import { useIntegratedAPI } from '../hooks/useIntegratedAPI';

function MyComponent() {
  const {
    analyzeMessage,
    generateStory,
    generateSocialMediaContent,
    loading,
    error,
  } = useIntegratedAPI();

  const handleAnalyze = async () => {
    try {
      const result = await analyzeMessage("안녕하세요!");
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        분석하기
      </button>
      {error && <p>오류: {error.message}</p>}
    </div>
  );
}
```

### 방법 2: 서비스 직접 사용

```typescript
import { integratedAPIService } from '../services/integratedAPIService';

// 메시지 분석
const result = await integratedAPIService.analyzeMessage("안녕하세요!");

// 스토리 생성
const story = await integratedAPIService.generateStory({
  genre: "romance",
  theme: "사랑"
});

// 소셜미디어 콘텐츠
const content = await integratedAPIService.generateSocialMediaContent({
  platform: "instagram",
  content_type: "post",
  company_name: "우리 회사"
});
```

### 방법 3: 예시 컴포넌트 사용

```typescript
import IntegratedAPIDemo from './components/IntegratedAPIDemo';

function App() {
  return (
    <div>
      <IntegratedAPIDemo />
    </div>
  );
}
```

## 📋 사용 가능한 모든 메서드

### 기본 기능

- `analyzeMessage(message: string)` - 메시지 분석
- `getSystemStatus()` - 시스템 상태
- `getMetrics()` - 성능 메트릭
- `getAnalytics()` - 분석 대시보드
- `getLogs()` - 시스템 로그
- `healthCheck()` - 헬스 체크
- `testConnection()` - 서버 연결 테스트

### 창작 콘텐츠

- `generateStory(params)` - 스토리 생성
- `generatePoem(params)` - 시 생성
- `generateEssay(params)` - 에세이 생성
- `analyzeWriting(text)` - 글쓰기 분석

### 설득 콘텐츠

- `generateConstructionPersuasion(params)` - 건설사 설득 콘텐츠
- `generateContractorPersuasion(params)` - 시공사 긍정 콘텐츠
- `analyzePersuasion(content)` - 설득 콘텐츠 분석

### 마케팅 콘텐츠

- `generateSocialMediaContent(params)` - 소셜미디어 콘텐츠
- `generateEmailMarketing(params)` - 이메일 마케팅
- `analyzeMarketingContent(content, contentType)` - 마케팅 콘텐츠 분석

### 고급 분석

- `getAdvancedAnalytics(params)` - 고급 데이터 분석
- `getPredictions(params)` - 예측 분석
- `getInsights(params)` - 인사이트 생성

### AI 최적화

- `optimizeAI(params)` - AI 모델 최적화
- `benchmarkAI(params)` - AI 모델 벤치마크
- `submitFeedback(params)` - AI 피드백 처리

## 🚀 빠른 시작

1. **서버 실행** (백엔드):

   ```bash
   cd /path/to/kakao-frontend/kakao-frontend/backend
   python3 start_simple_integrated_server.py
   ```

2. **환경 변수 설정** (프론트엔드):

   ```bash
   cd /path/to/kakao-frontend/kakao-frontend/frontend
   echo "REACT_APP_INTEGRATED_API_URL=http://localhost:5002/api/integrated" > .env
   ```

3. **프론트엔드 실행**:

   ```bash
   npm start
   ```

4. **컴포넌트에서 사용**:

   ```typescript
   import { useIntegratedAPI } from './hooks/useIntegratedAPI';
   ```

## ✅ 확인 사항

- [x] 백엔드 서버가 포트 8000에서 실행 중
- [x] 프론트엔드 서비스 파일 업데이트 완료
- [x] React Hook 생성 완료
- [x] 예시 컴포넌트 생성 완료
- [ ] 환경 변수 설정 (.env 파일)
- [ ] 프론트엔드에서 테스트

## 🔍 문제 해결

### CORS 오류

서버의 CORS는 이미 설정되어 있습니다. 문제가 발생하면 브라우저 콘솔을 확인하세요.

### 연결 실패

1. 서버가 실행 중인지 확인:

   ```bash
   curl http://localhost:5002/api/integrated/health
   ```

2. 환경 변수가 올바른지 확인:

   ```bash
   echo $REACT_APP_INTEGRATED_API_URL
   ```

3. 프론트엔드 재시작:

   ```bash
   npm start
   ```

---

**이제 프론트엔드에서 모든 통합 API를 사용할 수 있습니다!**
