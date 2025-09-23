# 🚀 OpenAI API 키 설정 가이드

## 📋 개요

이 가이드는 Kakao AI 시스템에서 OpenAI GPT 기능을 활성화하기 위한 설정 방법을 설명합니다.

## 🔑 OpenAI API 키 획득

### 1. OpenAI 계정 생성

1. [OpenAI 웹사이트](https://platform.openai.com/)에 접속
2. 계정 생성 및 로그인
3. 이메일 인증 완료

### 2. API 키 생성

1. OpenAI 대시보드에서 "API Keys" 섹션으로 이동
2. "Create new secret key" 클릭
3. 키 이름 입력 (예: "Kakao AI System")
4. 생성된 API 키 복사 (sk-로 시작하는 문자열)

## ⚙️ 환경 설정

### 방법 1: .env 파일 사용 (권장)

```bash
# 프로젝트 루트에 .env 파일 생성
echo "OPENAI_API_KEY=sk-your-actual-api-key-here" > .env
```

### 방법 2: 환경변수 직접 설정

```bash
# macOS/Linux
export OPENAI_API_KEY="sk-your-actual-api-key-here"

# Windows
set OPENAI_API_KEY=sk-your-actual-api-key-here
```

## 🔧 서버 재시작

API 키 설정 후 백엔드 서버를 재시작해야 합니다:

```bash
# 기존 서버 종료
pkill -f "python.*advanced_api_server.py"

# 서버 재시작
cd backend && source ../.venv/bin/activate && python advanced_api_server.py &
```

## ✅ 테스트

### 1. GPT 상태 확인

```bash
curl -X GET "http://localhost:8002/api/v7/gpt-status"
```

### 2. GPT 메시지 생성 테스트

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

## 🎯 프론트엔드에서 사용

1. 웹 브라우저에서 `http://localhost:3000` 접속
2. AI 학습 시스템에서 "학습 시작" 클릭
3. 메시지 생성 시 "GPT" 옵션 선택
4. GPT 기반 메시지 생성 확인

## 🔒 보안 주의사항

- API 키를 절대 공개 저장소에 업로드하지 마세요
- .env 파일을 .gitignore에 추가하세요
- API 키를 정기적으로 로테이션하세요
- 사용량 모니터링을 설정하세요

## 💰 비용 관리

- OpenAI API는 사용량에 따라 과금됩니다
- 무료 티어: 월 $5 크레딧
- 유료 플랜: 사용량 기반 과금
- [OpenAI 가격 정책](https://openai.com/pricing) 확인

## 🛠️ 문제 해결

### API 키 오류

```
{"success":false,"status":"error","message":"GPT API 오류: Error code: 401"}
```

- API 키가 올바른지 확인
- API 키에 충분한 크레딧이 있는지 확인

### 연결 오류

```
{"success":false,"status":"error","message":"GPT API 오류: Connection failed"}
```

- 인터넷 연결 확인
- 방화벽 설정 확인

### 속도 제한

```
{"success":false,"status":"error","message":"GPT API 오류: Rate limit exceeded"}
```

- 요청 빈도 줄이기
- 더 높은 플랜으로 업그레이드

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. API 키 설정 상태
2. 서버 로그 확인
3. 네트워크 연결 상태
4. OpenAI 계정 상태
