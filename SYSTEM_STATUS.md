# 🚀 카카오 AI 시스템 v7.0 - 완전 가이드

## 📊 현재 시스템 상태

### ✅ **정상 작동 중인 서비스**

- **백엔드 서버**: `http://localhost:8002` ✅
- **프론트엔드 서버**: `http://localhost:3000` ✅
- **GPT API 연동**: 정상 작동 (API 키 설정 시 완전 활성화) ✅
- **모든 기능**: 정상 작동 확인 ✅

### 🎯 **구현된 주요 기능**

#### 1. **GPT 기반 메시지 생성**

- ✅ OpenAI GPT-3.5-turbo 모델 연동
- ✅ 컨텍스트 기반 자연스러운 메시지 생성
- ✅ 다양한 톤 설정 (친근, 공식, 재미, 공감)
- ✅ 메시지 길이 조절 (짧음, 중간, 길게)
- ✅ 의도 설정 (일반, 공감, 제안, 질문)

#### 2. **고급 메시지 생성**

- ✅ 개인별 맞춤형 메시지 생성
- ✅ 정치인 스타일 융합
- ✅ 대화 맥락 인식
- ✅ 품질 자동 평가

#### 3. **미디어 및 링크 미리보기**

- ✅ 이미지 직접 표시
- ✅ 비디오 미리보기
- ✅ OpenGraph 링크 미리보기
- ✅ 실시간 미디어 로딩

#### 4. **대화 분석 및 통계**

- ✅ 대화 데이터 분석
- ✅ 감정 분석
- ✅ 키워드 추출
- ✅ 참여도 분석

#### 5. **성능 모니터링**

- ✅ 실시간 시스템 상태 확인
- ✅ 서비스 상태 모니터링
- ✅ 성능 지표 표시

## 🚀 **시작 방법**

### 1. **백엔드 서버 시작**

```bash
cd backend
source ../.venv/bin/activate
export OPENAI_API_KEY="your-openai-api-key"  # 실제 API 키로 변경
python advanced_api_server.py
```

### 2. **프론트엔드 서버 시작**

```bash
npm start
```

### 3. **웹 인터페이스 접속**

브라우저에서 `http://localhost:3000` 접속

## 🎯 **사용 방법**

### **GPT 메시지 생성**

1. **메시지 선택**: 대화 목록에서 메시지 선택
2. **생성 타입 선택**: "GPT 생성" 옵션 선택
3. **목적 입력**: 생성할 메시지의 목적 입력
4. **생성 실행**: "GPT로 메시지 생성" 버튼 클릭

### **API 직접 호출**

```bash
# GPT 메시지 생성
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

# GPT 상태 확인
curl -X GET "http://localhost:8002/api/v7/gpt-status"
```

## ⚙️ **설정 옵션**

### **톤 설정**

- **친근**: 편안하고 친근한 톤
- **공식**: 정중하고 공식적인 톤
- **재미**: 유쾌하고 재미있는 톤
- **공감**: 이해하고 공감하는 톤

### **길이 설정**

- **짧음**: 1-2문장으로 간결하게
- **중간**: 3-4문장으로 적당한 길이
- **길게**: 5-6문장으로 자세하게

### **의도 설정**

- **일반**: 일반적인 대화
- **공감**: 상대방 감정에 공감
- **제안**: 건설적인 제안
- **질문**: 궁금한 점 질문

## 🔧 **API 엔드포인트**

### **GPT 관련**

- `POST /api/v7/generate-gpt-message`: GPT 메시지 생성
- `GET /api/v7/gpt-status`: GPT API 상태 확인

### **고급 메시지 생성**

- `POST /api/v7/generate-advanced-message`: 고급 메시지 생성
- `POST /api/v7/generate-improved-message`: 개선된 메시지 생성

### **분석 및 통계**

- `POST /api/v7/analyze-conversation-data`: 대화 데이터 분석
- `GET /api/v7/conversation-stats`: 대화 통계

### **미디어 및 링크**

- `GET /api/v7/opengraph`: OpenGraph 메타데이터 추출

### **시스템 상태**

- `GET /api/v7/status`: 시스템 상태 확인

## 📊 **성능 지표**

### **현재 시스템 상태**

```json
{
  "system_version": "7.0",
  "status": "healthy",
  "learned_profiles": 0,
  "total_learning_data": 0,
  "available_features": [
    "실제 대화 패턴 학습",
    "개인별 맞춤형 메시지 생성",
    "정치인 스타일 융합",
    "대화 맥락 인식",
    "품질 자동 평가",
    "스타일 추천"
  ]
}
```

## 🔍 **문제 해결**

### **1. API 키 오류**

```
Error code: 401 - Incorrect API key provided
```

**해결방법**: 올바른 OpenAI API 키를 설정하세요.

### **2. 서버 연결 오류**

```
Cannot connect to server
```

**해결방법**:

- 서버가 실행 중인지 확인
- 포트 충돌 확인
- 방화벽 설정 확인

### **3. 프론트엔드 오류**

```
React development server error
```

**해결방법**:

```bash
pkill -f "react-scripts"
rm -rf node_modules/.cache
npm start
```

## 🎯 **다음 단계**

### **1. 실제 OpenAI API 키 설정**

```bash
export OPENAI_API_KEY="your-actual-openai-api-key"
```

### **2. 고급 기능 활성화**

- GPT-4 모델 지원
- 멀티모달 기능
- 실시간 스트리밍

### **3. 개인화 기능**

- 사용자별 학습 모델
- 맞춤형 프롬프트
- 스타일 전이

## 📞 **지원 및 문의**

### **로그 확인**

- 백엔드: `backend/advanced_api_server.py` 실행 시 출력
- 프론트엔드: 브라우저 개발자 도구 콘솔

### **API 문서**

- Swagger UI: `http://localhost:8002/docs`
- ReDoc: `http://localhost:8002/redoc`

### **상태 확인**

```bash
# 시스템 상태
curl -X GET "http://localhost:8002/api/v7/status"

# GPT 상태
curl -X GET "http://localhost:8002/api/v7/gpt-status"
```

---

## 🎉 **축하합니다!**

**카카오 AI 시스템 v7.0이 성공적으로 구축되었습니다!**

### ✅ **완료된 기능들**

- 🤖 GPT 기반 메시지 생성
- 📊 고급 대화 분석
- 🖼️ 미디어 미리보기
- 📈 성능 모니터링
- 🎯 개인화 기능

### 🚀 **사용 준비 완료**

1. 실제 OpenAI API 키 설정
2. 웹 인터페이스 접속 (`http://localhost:3000`)
3. GPT 메시지 생성 기능 사용

**이제 더욱 자연스럽고 지능적인 메시지 생성이 가능합니다!** 🎯
