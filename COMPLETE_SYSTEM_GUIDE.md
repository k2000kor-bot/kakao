# 완전한 시스템 가이드

## 🎉 전체 시스템 통합 완료

프론트엔드와 백엔드가 완전히 통합되어 실행 중입니다!

## ✅ 현재 상태

### 백엔드 서버
- ✅ 포트 8000에서 실행 중
- ✅ 통합 API 엔드포인트: `/api/integrated`
- ✅ 헬스 체크: healthy
- ✅ API 문서: http://localhost:8000/api/docs

### 프론트엔드
- ✅ 포트 3000에서 실행 중
- ✅ 통합 API 서비스 연동 완료
- ✅ React 컴포넌트 준비 완료
- ✅ 환경 변수 설정 완료

## 🚀 빠른 시작

### 1. 백엔드 서버 시작

```bash
cd /Users/aD/kakao-frontend/backend

# 서버 상태 확인
bash server_status.sh

# 서버가 실행되지 않았다면 시작
bash start_and_check_server.sh
```

### 2. 프론트엔드 시작

```bash
cd /Users/aD/kakao-frontend/frontend

# 환경 변수 확인
cat .env

# 프론트엔드 시작
npm start
```

프론트엔드는 자동으로 `http://localhost:3000`에서 열립니다.

## 📱 사용 방법

### 브라우저에서 접속

1. **프론트엔드**: http://localhost:3000
   - 🤖 CORBU AI 채팅 탭
   - 🚀 통합 API 탭
   - 테스트 탭

2. **백엔드 API 문서**: http://localhost:8000/api/docs
   - Swagger UI로 모든 API 확인
   - 직접 테스트 가능

3. **헬스 체크**: http://localhost:8000/api/integrated/health

### 통합 API 사용

#### 1. React Hook 사용 (권장)

```typescript
import { useIntegratedAPI } from './hooks/useIntegratedAPI';

function MyComponent() {
  const {
    analyzeMessage,
    generateStory,
    loading,
    error,
  } = useIntegratedAPI();

  const handleClick = async () => {
    const result = await analyzeMessage("안녕하세요!");
    console.log(result);
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      분석하기
    </button>
  );
}
```

#### 2. 서비스 직접 사용

```typescript
import { integratedAPIService } from './services/integratedAPIService';

const result = await integratedAPIService.analyzeMessage("메시지");
const story = await integratedAPIService.generateStory({ genre: "romance" });
```

## 🔧 API 엔드포인트

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

## 📁 주요 파일 구조

```
kakao-frontend/
├── backend/
│   ├── api/
│   │   ├── integrated_api.py          # 통합 API 라우터
│   │   └── main.py                    # 원본 Flask API
│   ├── start_simple_integrated_server.py  # 통합 서버 시작
│   ├── server_status.sh               # 서버 상태 확인
│   ├── start_and_check_server.sh      # 서버 시작 및 확인
│   └── stop_server.sh                 # 서버 중지
│
└── frontend/
    ├── src/
    │   ├── App.tsx                    # 메인 앱 (통합 API 탭 포함)
    │   ├── components/
    │   │   ├── SimpleChatInterface.tsx # 채팅 인터페이스
    │   │   └── IntegratedAPIDemo.tsx # 통합 API 데모
    │   ├── hooks/
    │   │   └── useIntegratedAPI.ts   # React Hook
    │   └── services/
    │       └── integratedAPIService.ts # API 서비스
    └── .env                            # 환경 변수
```

## 🔍 문제 해결

### 프론트엔드가 백엔드에 연결되지 않을 때

1. **환경 변수 확인**:
   ```bash
   cd frontend
   cat .env
   # REACT_APP_INTEGRATED_API_URL=http://localhost:8000/api/integrated
   ```

2. **백엔드 서버 확인**:
   ```bash
   curl http://localhost:8000/api/integrated/health
   ```

3. **CORS 확인**:
   - 백엔드의 CORS 설정이 올바른지 확인
   - 브라우저 콘솔에서 CORS 오류 확인

### 서버가 시작되지 않을 때

1. **포트 확인**:
   ```bash
   lsof -ti:8000
   ```

2. **의존성 확인**:
   ```bash
   pip3 list | grep -E "fastapi|uvicorn|pydantic"
   ```

3. **로그 확인**:
   ```bash
   tail -f /tmp/integrated_server.log
   ```

## 📊 시스템 모니터링

### 서버 상태 확인

```bash
cd backend
bash server_status.sh
```

### 실시간 로그 확인

```bash
tail -f /tmp/integrated_server.log
```

### API 테스트

```bash
# 헬스 체크
curl http://localhost:8000/api/integrated/health

# 메시지 분석 테스트
curl -X POST http://localhost:8000/api/integrated/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "안녕하세요!"}'
```

## 🎯 다음 단계

1. ✅ 백엔드 서버 실행 중
2. ✅ 프론트엔드 실행 중
3. ✅ 통합 API 연동 완료
4. ✅ 모든 컴포넌트 준비 완료

**이제 브라우저에서 http://localhost:3000 을 열어서 사용하세요!**

---

## 📚 추가 문서

- `backend/SERVER_MANAGEMENT.md` - 서버 관리 가이드
- `frontend/INTEGRATED_API_USAGE.md` - 프론트엔드 사용 가이드
- `FRONTEND_READY.md` - 프론트엔드 준비 완료 가이드

**전체 시스템이 준비되었습니다! 🎉**
