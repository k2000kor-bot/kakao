# 🤖 GPT 기반 메시지 생성 시스템 가이드

## 📋 개요

카카오 AI 시스템에 OpenAI GPT-3.5-turbo 모델을 통합하여 고도화된 메시지 생성 기능을 제공합니다.

## ✨ 주요 기능

### 1. GPT 메시지 생성

- **컨텍스트 기반 생성**: 이전 대화 내용을 고려한 자연스러운 메시지
- **톤 설정**: 친근, 공식, 재미, 공감 등 다양한 톤 지원
- **길이 조절**: 짧음, 중간, 길게 옵션 제공
- **의도 설정**: 일반, 공감, 제안, 질문 등 다양한 의도 지원

### 2. 실시간 상태 확인

- GPT API 연결 상태 모니터링
- 토큰 사용량 및 성능 지표
- 에러 처리 및 복구

### 3. 사용자 피드백 시스템

- 생성된 메시지에 대한 평가
- 학습 데이터 수집
- 품질 개선

## 🚀 설치 및 설정

### 1. 의존성 설치

```bash
cd backend
source ../.venv/bin/activate
pip install openai
```

### 2. OpenAI API 키 설정

```bash
# 환경변수로 설정
export OPENAI_API_KEY="your-openai-api-key"

# 또는 .env 파일에 추가
echo "OPENAI_API_KEY=your-openai-api-key" >> .env
```

### 3. 서버 시작

```bash
# 백엔드 서버
cd backend
source ../.venv/bin/activate
python advanced_api_server.py

# 프론트엔드 서버
npm start
```

## 🔧 API 엔드포인트

### GPT 메시지 생성

```http
POST /api/v7/generate-gpt-message
Content-Type: application/json

{
  "target_message": "생성할 메시지 내용",
  "context_messages": [
    {
      "content": "이전 메시지",
      "sender": "발신자",
      "timestamp": "2025-07-26T10:00:00"
    }
  ],
  "settings": {
    "tone": "친근",
    "message_length": "중간",
    "intent": "일반"
  }
}
```

### GPT 상태 확인

```http
GET /api/v7/gpt-status
```

## 🎯 사용 방법

### 1. 웹 인터페이스 사용

1. **메시지 선택**: 대화 목록에서 메시지 선택
2. **생성 타입 선택**:
   - 기본 생성: 간단한 템플릿 기반
   - 고급 생성: 컨텍스트 분석 기반
   - **GPT 생성**: AI 기반 자연스러운 메시지
3. **목적 입력**: 생성할 메시지의 목적 입력
4. **생성 실행**: "GPT로 메시지 생성" 버튼 클릭

### 2. API 직접 호출

```bash
curl -X POST "http://localhost:8002/api/v7/generate-gpt-message" \
  -H "Content-Type: application/json" \
  -d '{
    "target_message": "안녕하세요",
    "context_messages": [],
    "settings": {
      "tone": "친근",
      "message_length": "중간",
      "intent": "일반"
    }
  }'
```

## ⚙️ 설정 옵션

### 톤 설정

- **친근**: 편안하고 친근한 톤
- **공식**: 정중하고 공식적인 톤
- **재미**: 유쾌하고 재미있는 톤
- **공감**: 이해하고 공감하는 톤

### 길이 설정

- **짧음**: 1-2문장으로 간결하게
- **중간**: 3-4문장으로 적당한 길이
- **길게**: 5-6문장으로 자세하게

### 의도 설정

- **일반**: 일반적인 대화
- **공감**: 상대방 감정에 공감
- **제안**: 건설적인 제안
- **질문**: 궁금한 점 질문

## 📊 성능 모니터링

### GPT 상태 확인

```bash
curl -X GET "http://localhost:8002/api/v7/gpt-status"
```

### 응답 예시

```json
{
  "success": true,
  "status": "available",
  "message": "GPT API가 정상적으로 작동합니다.",
  "model": "gpt-3.5-turbo",
  "test_response": "안녕하세요!"
}
```

## 🔍 문제 해결

### 1. API 키 오류

```
Error code: 401 - Incorrect API key provided
```

**해결방법**: 올바른 OpenAI API 키를 설정하세요.

### 2. 연결 오류

```
GPT API 오류: Connection timeout
```

**해결방법**:

- 인터넷 연결 확인
- OpenAI 서비스 상태 확인
- 방화벽 설정 확인

### 3. 토큰 한도 초과

```
Error code: 429 - Rate limit exceeded
```

**해결방법**:

- 요청 빈도 줄이기
- OpenAI 계정 한도 확인
- 더 높은 한도로 업그레이드

## 💡 최적화 팁

### 1. 프롬프트 최적화

- 명확하고 구체적인 목적 설정
- 적절한 컨텍스트 제공
- 일관된 톤 유지

### 2. 비용 최적화

- 토큰 사용량 모니터링
- 불필요한 컨텍스트 제거
- 효율적인 프롬프트 작성

### 3. 품질 향상

- 사용자 피드백 수집
- 생성 결과 검토
- 지속적인 개선

## 🔮 향후 계획

### 1. 고급 기능

- GPT-4 모델 지원
- 멀티모달 기능 (이미지, 음성)
- 실시간 스트리밍

### 2. 개인화

- 사용자별 학습 모델
- 맞춤형 프롬프트
- 스타일 전이

### 3. 통합 기능

- 다른 AI 모델과 연동
- 외부 API 통합
- 확장 가능한 아키텍처

## 📞 지원

문제가 발생하거나 질문이 있으시면:

1. 로그 확인: `backend/advanced_api_server.py` 실행 시 출력되는 로그
2. API 상태 확인: `/api/v7/gpt-status` 엔드포인트 호출
3. 문서 참조: 이 가이드 문서

---

**🎯 GPT 통합이 완료되었습니다! 이제 더욱 자연스럽고 지능적인 메시지 생성이 가능합니다.**
