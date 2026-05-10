# 통합 API 문서

## 개요

이 문서는 `/backend/api/integrated_api.py`에 구현된 통합 API 엔드포인트에 대한 설명입니다.

Flask 기반의 `main.py` 엔드포인트를 FastAPI router로 변환하여 `main_server.py`에 통합했습니다.

## 엔드포인트 목록

### 기본 기능

#### 1. 메시지 분석

- **엔드포인트**: `POST /api/integrated/analyze`
- **설명**: 메시지를 분석하여 감정, 키워드, 의도를 추출하고 응답을 생성합니다.
- **요청 본문**:

  ```json
  {
    "message": "안녕하세요! 좋은 하루네요!"
  }
  ```

- **응답 예시**:

  ```json
  {
    "success": true,
    "response": "안녕하세요! 기분이 좋으시네요! ...",
    "analysis": {
      "emotion": {
        "sentiment": "긍정",
        "confidence": 0.85
      },
      "keywords": ["안녕하세요", "좋은", "하루"],
      "intent": {
        "type": "greeting",
        "confidence": 0.9
      }
    }
  }
  ```

#### 2. 시스템 상태

- **엔드포인트**: `GET /api/integrated/status`
- **설명**: 통합 시스템의 상태를 조회합니다.

#### 3. 헬스 체크

- **엔드포인트**: `GET /api/integrated/health`
- **설명**: 서비스 헬스 상태를 확인합니다.

#### 4. 성능 메트릭

- **엔드포인트**: `GET /api/integrated/metrics`
- **설명**: 시스템 성능 메트릭을 조회합니다.

#### 5. 분석 대시보드

- **엔드포인트**: `GET /api/integrated/analytics`
- **설명**: 분석 대시보드 데이터를 조회합니다.

#### 6. 시스템 로그

- **엔드포인트**: `GET /api/integrated/logs`
- **설명**: 시스템 로그를 조회합니다.

### 창작 콘텐츠

#### 7. 스토리 생성

- **엔드포인트**: `POST /api/integrated/creative/story`
- **요청 본문**:

  ```json
  {
    "genre": "romance",
    "theme": "사랑",
    "length": "short"
  }
  ```

#### 8. 시 생성

- **엔드포인트**: `POST /api/integrated/creative/poem`
- **요청 본문**:

  ```json
  {
    "type": "lyric",
    "theme": "사랑"
  }
  ```

#### 9. 에세이 생성

- **엔드포인트**: `POST /api/integrated/creative/essay`
- **요청 본문**:

  ```json
  {
    "type": "personal",
    "topic": "성장"
  }
  ```

#### 10. 글쓰기 분석

- **엔드포인트**: `POST /api/integrated/creative/analyze`
- **요청 본문**:

  ```json
  {
    "text": "분석할 텍스트 내용..."
  }
  ```

### 설득 콘텐츠

#### 11. 건설사 설득 콘텐츠

- **엔드포인트**: `POST /api/integrated/persuasion/construction`
- **요청 본문**:

  ```json
  {
    "company_name": "우리 건설사",
    "project_type": "주택건설",
    "persuasion_level": "high"
  }
  ```

#### 12. 시공사 긍정 콘텐츠

- **엔드포인트**: `POST /api/integrated/persuasion/contractor`
- **요청 본문**:

  ```json
  {
    "company_name": "우리 시공사",
    "service_type": "인테리어",
    "persuasion_level": "high"
  }
  ```

#### 13. 설득 콘텐츠 분석

- **엔드포인트**: `POST /api/integrated/persuasion/analyze`
- **요청 본문**:

  ```json
  {
    "content": "설득 콘텐츠 내용..."
  }
  ```

### 마케팅 콘텐츠

#### 14. 소셜미디어 콘텐츠

- **엔드포인트**: `POST /api/integrated/marketing/social`
- **요청 본문**:

  ```json
  {
    "platform": "instagram",
    "content_type": "post",
    "industry": "건설업",
    "company_name": "우리 회사",
    "tone": "professional"
  }
  ```

#### 15. 이메일 마케팅

- **엔드포인트**: `POST /api/integrated/marketing/email`
- **요청 본문**:

  ```json
  {
    "email_type": "promotional",
    "industry": "건설업",
    "company_name": "우리 회사",
    "urgency_level": "medium"
  }
  ```

#### 16. 마케팅 콘텐츠 분석

- **엔드포인트**: `POST /api/integrated/marketing/analyze`
- **요청 본문**:

  ```json
  {
    "content": "마케팅 콘텐츠 내용...",
    "content_type": "social"
  }
  ```

### 고급 분석

#### 17. 고급 데이터 분석

- **엔드포인트**: `POST /api/integrated/analytics/advanced`
- **요청 본문**:

  ```json
  {
    "analysis_type": "sentiment_trend",
    "time_range": "7d",
    "filters": {}
  }
  ```

#### 18. 예측 분석

- **엔드포인트**: `POST /api/integrated/analytics/predictions`
- **요청 본문**:

  ```json
  {
    "prediction_type": "user_satisfaction",
    "prediction_horizon": "30d"
  }
  ```

#### 19. 인사이트 생성

- **엔드포인트**: `POST /api/integrated/analytics/insights`
- **요청 본문**:

  ```json
  {
    "insight_type": "general",
    "focus_area": "all"
  }
  ```

### AI 최적화

#### 20. AI 모델 최적화

- **엔드포인트**: `POST /api/integrated/ai/optimize`
- **요청 본문**:

  ```json
  {
    "optimization_type": "performance",
    "target_metric": "response_time"
  }
  ```

#### 21. AI 모델 벤치마크

- **엔드포인트**: `POST /api/integrated/ai/benchmark`
- **요청 본문**:

  ```json
  {
    "benchmark_type": "comprehensive",
    "test_data_size": "medium"
  }
  ```

#### 22. AI 피드백 처리

- **엔드포인트**: `POST /api/integrated/ai/feedback`
- **요청 본문**:

  ```json
  {
    "feedback_type": "user_rating",
    "content": "피드백 내용",
    "rating": 5,
    "correction": "수정 사항",
    "context": {}
  }
  ```

## 사용 방법

### 서버 실행

**권장** (프로젝트 루트):

```bash
cd /path/to/kakao-frontend/kakao-frontend
npm run restart:backend
```

**대안**:

```bash
cd /path/to/kakao-frontend/kakao-frontend/backend
python3 -m uvicorn main_server:app --host 0.0.0.0 --port 5002
```

서버는 **`http://localhost:5002`** 에서 실행됩니다.

### API 문서 확인

- Swagger UI: `http://localhost:5002/api/docs`
- ReDoc: `http://localhost:5002/api/redoc`

### 예시 요청

```bash
# 메시지 분석
curl -X POST http://localhost:5002/api/integrated/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "안녕하세요! 좋은 하루네요!"}'

# 스토리 생성
curl -X POST http://localhost:5002/api/integrated/creative/story \
  -H "Content-Type: application/json" \
  -d '{"genre": "romance", "theme": "사랑"}'

# 시스템 상태 확인
curl http://localhost:5002/api/integrated/status
```

## 통합 상태

- ✅ Flask `main.py`의 모든 주요 엔드포인트가 FastAPI router로 변환됨
- ✅ `main_server.py`에 통합 완료
- ✅ Pydantic 모델로 타입 안정성 확보
- ✅ 에러 처리 및 로깅 구현 완료

## 참고사항

- 모든 엔드포인트는 `/api/integrated` prefix를 사용합니다.
- 요청/응답은 JSON 형식을 사용합니다.
- 에러 발생 시 적절한 HTTP 상태 코드와 에러 메시지를 반환합니다.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

