# 통합 API 사용 가이드

## ✅ 준비 완료

프론트엔드에서 통합 API를 사용할 수 있도록 모든 설정이 완료되었습니다!

## 🚀 빠른 시작

### 1. 환경 변수 설정

프론트엔드 루트에 `.env` 파일 생성:

```bash
cd /path/to/kakao-frontend/kakao-frontend/frontend
echo "REACT_APP_INTEGRATED_API_URL=http://localhost:5002/api/integrated" > .env
```

### 2. 서버 실행 확인

백엔드 서버가 실행 중인지 확인:

```bash
curl http://localhost:5002/api/integrated/health
```

### 3. 프론트엔드에서 사용

#### React Hook 사용 (권장)

```typescript
import { useIntegratedAPI } from './hooks/useIntegratedAPI';

function MyComponent() {
  const {
    analyzeMessage,
    generateStory,
    generateSocialMediaContent,
    loading,
    error,
  } = useIntegratedAPI();

  const handleClick = async () => {
    try {
      // 메시지 분석
      const result = await analyzeMessage("안녕하세요! 좋은 하루네요!");
      console.log('분석 결과:', result);
      
      // 스토리 생성
      const story = await generateStory({
        genre: "romance",
        theme: "사랑"
      });
      console.log('생성된 스토리:', story);
      
      // 소셜미디어 콘텐츠
      const content = await generateSocialMediaContent({
        platform: "instagram",
        content_type: "post",
        company_name: "우리 회사"
      });
      console.log('마케팅 콘텐츠:', content);
    } catch (err) {
      console.error('오류:', err);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? '처리 중...' : 'API 호출'}
      </button>
      {error && <p style={{ color: 'red' }}>오류: {error.message}</p>}
    </div>
  );
}
```

#### 서비스 직접 사용

```typescript
import { integratedAPIService } from './services/integratedAPIService';

// 메시지 분석
const result = await integratedAPIService.analyzeMessage("안녕하세요!");

// 스토리 생성
const story = await integratedAPIService.generateStory({
  genre: "romance",
  theme: "사랑"
});

// 마케팅 콘텐츠
const content = await integratedAPIService.generateSocialMediaContent({
  platform: "instagram",
  content_type: "post",
  company_name: "우리 회사",
  industry: "건설업"
});
```

## 📋 사용 가능한 모든 기능

### 기본 기능

```typescript
// 메시지 분석
await integratedAPIService.analyzeMessage("메시지");

// 시스템 상태
await integratedAPIService.getSystemStatus();

// 성능 메트릭
await integratedAPIService.getMetrics();

// 분석 대시보드
await integratedAPIService.getAnalytics();

// 시스템 로그
await integratedAPIService.getLogs();

// 헬스 체크
await integratedAPIService.healthCheck();
```

### 창작 콘텐츠

```typescript
// 스토리 생성
await integratedAPIService.generateStory({
  genre: "romance",
  theme: "사랑",
  length: "short"
});

// 시 생성
await integratedAPIService.generatePoem({
  type: "lyric",
  theme: "희망"
});

// 에세이 생성
await integratedAPIService.generateEssay({
  type: "personal",
  topic: "성장"
});

// 글쓰기 분석
await integratedAPIService.analyzeWriting("분석할 텍스트...");
```

### 설득 콘텐츠

```typescript
// 건설사 설득 콘텐츠
await integratedAPIService.generateConstructionPersuasion({
  company_name: "우리 건설사",
  project_type: "주택건설",
  persuasion_level: "high"
});

// 시공사 긍정 콘텐츠
await integratedAPIService.generateContractorPersuasion({
  company_name: "우리 시공사",
  service_type: "인테리어",
  persuasion_level: "high"
});

// 설득 콘텐츠 분석
await integratedAPIService.analyzePersuasion("설득 콘텐츠...");
```

### 마케팅 콘텐츠

```typescript
// 소셜미디어 콘텐츠
await integratedAPIService.generateSocialMediaContent({
  platform: "instagram",
  content_type: "post",
  industry: "건설업",
  company_name: "우리 회사",
  tone: "professional"
});

// 이메일 마케팅
await integratedAPIService.generateEmailMarketing({
  email_type: "promotional",
  industry: "건설업",
  company_name: "우리 회사",
  urgency_level: "high"
});

// 마케팅 콘텐츠 분석
await integratedAPIService.analyzeMarketingContent("마케팅 콘텐츠...", "social");
```

### 고급 분석

```typescript
// 고급 데이터 분석
await integratedAPIService.getAdvancedAnalytics({
  analysis_type: "sentiment_trend",
  time_range: "7d"
});

// 예측 분석
await integratedAPIService.getPredictions({
  prediction_type: "user_satisfaction",
  prediction_horizon: "30d"
});

// 인사이트 생성
await integratedAPIService.getInsights({
  insight_type: "general",
  focus_area: "all"
});
```

### AI 최적화

```typescript
// AI 모델 최적화
await integratedAPIService.optimizeAI({
  optimization_type: "performance",
  target_metric: "response_time"
});

// AI 모델 벤치마크
await integratedAPIService.benchmarkAI({
  benchmark_type: "comprehensive",
  test_data_size: "medium"
});

// AI 피드백 처리
await integratedAPIService.submitFeedback({
  feedback_type: "user_rating",
  rating: 5,
  content: "피드백 내용"
});
```

## 📁 생성된 파일

1. `frontend/src/services/integratedAPIService.ts` - 업데이트 완료
2. `frontend/src/hooks/useIntegratedAPI.ts` - React Hook
3. `frontend/src/components/IntegratedAPIDemo.tsx` - 예시 컴포넌트

## 🔍 서버 상태 확인

서버가 정상적으로 실행 중입니다:

- ✅ 포트 8000에서 실행 중
- ✅ 헬스 체크: healthy
- ✅ API 응답: 정상

## 🎯 다음 단계

1. 프론트엔드에서 `.env` 파일 생성
2. 컴포넌트에서 `useIntegratedAPI` 훅 사용
3. 원하는 기능 테스트

---

**프론트엔드에서 모든 통합 API를 사용할 준비가 완료되었습니다!**

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

