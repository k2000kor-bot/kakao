# 🚀 **CORBU AI 시스템 사용자 가이드**

## 📋 **목차**

1. [시스템 개요](#시스템-개요)
2. [설치 및 설정](#설치-및-설정)
3. [시스템 시작](#시스템-시작)
4. [주요 기능](#주요-기능)
5. [API 사용법](#api-사용법)
6. [문제 해결](#문제-해결)

---

## 🎯 **시스템 개요**

**CORBU AI 시스템**은 카카오톡 대화 분석 및 AI 메시지 생성을 위한 종합적인 플랫폼입니다.

### ✨ **주요 특징**

- 🤖 **AI 메시지 생성**: GPT-3.5/4 모델을 사용한 자연스러운 메시지 생성
- 📊 **실시간 분석**: 대화 패턴, 감정 분석, 참여도 분석
- 📁 **다양한 파일 지원**: PDF, Word, Excel, 이미지, 음성 파일 처리
- 💬 **실시간 채팅**: 웹소켓 기반 실시간 통신
- 📈 **고급 대시보드**: 인터랙티브 차트와 실시간 메트릭

---

## ⚙️ **설치 및 설정**

### 1. **시스템 요구사항**

- **운영체제**: macOS, Linux, Windows
- **Python**: 3.8 이상
- **Node.js**: 16 이상
- **메모리**: 최소 4GB RAM 권장

### 2. **초기 설정**

```bash
# 1. 저장소 클론
git clone <repository-url>
cd kakao-frontend

# 2. 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate  # Windows

# 3. 의존성 설치
./install_dependencies.sh

# 4. 시스템 라이브러리 설치 (macOS)
brew install tesseract ffmpeg

# 5. OpenAI API 키 설정
export OPENAI_API_KEY="your-openai-api-key"
```

### 3. **환경 변수 설정**

```bash
# .env 파일 생성
cat > .env << EOF
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
DATABASE_URL=sqlite:///./corbu_ai.db
LOG_LEVEL=INFO
EOF
```

---

## 🚀 **시스템 시작**

### 1. **자동 시작 (권장)**

```bash
# 전체 시스템 자동 시작
./start_system.sh
```

이 스크립트는 다음을 자동으로 수행합니다:

- ✅ 가상환경 활성화
- ✅ 의존성 확인
- ✅ 백엔드 서버 시작 (포트 8000)
- ✅ 프론트엔드 서버 시작 (포트 3000)
- ✅ 시스템 모니터링 시작

### 2. **수동 시작**

```bash
# 1. 가상환경 활성화
source venv/bin/activate

# 2. 백엔드 서버 시작
cd backend
python advanced_api_server.py

# 3. 새 터미널에서 프론트엔드 시작
npm start
```

### 3. **시스템 종료**

```bash
# 안전한 종료
./stop_system.sh

# 또는 Ctrl+C (시스템 시작 스크립트 실행 중)
```

---

## 🎯 **주요 기능**

### 1. **실시간 채팅** 💬

- **위치**: 첫 번째 탭
- **기능**:
  - 실시간 메시지 전송/수신
  - 타이핑 표시
  - 자동 스크롤
  - 연결 상태 모니터링

### 2. **AI 메시지 생성기** ✨

- **위치**: 두 번째 탭
- **기능**:
  - 컨텍스트 기반 메시지 생성
  - 다양한 톤 설정 (친근, 공식, 재미, 공감)
  - 개인별 맞춤 응답

### 3. **AI 인터페이스** 🤖

- **위치**: 세 번째 탭
- **기능**:
  - AI 모델 선택
  - 파라미터 조정
  - 실시간 응답 테스트

### 4. **실시간 대시보드** 📊

- **위치**: 네 번째 탭
- **기능**:
  - 실시간 메트릭 업데이트
  - 시스템 상태 모니터링
  - 사용자 활동 추적

### 5. **AI 분석** 📈

- **위치**: 다섯 번째 탭
- **기능**:
  - 대화 패턴 분석
  - 감정 분석
  - 참여도 분석

### 6. **유사도 테스터** 🧪

- **위치**: 여섯 번째 탭
- **기능**:
  - 텍스트 유사도 측정
  - AI 모델 성능 테스트

### 7. **파일 업로드** 📁

- **위치**: 일곱 번째 탭
- **지원 형식**:
  - 이미지 (OCR 텍스트 추출)
  - 음성 파일 (음성 인식)
  - PDF, Word, Excel 문서
  - 비디오 파일

### 8. **대화 요약** 📝

- **위치**: 여덟 번째 탭
- **기능**:
  - 대화 내용 요약
  - 키워드 추출
  - 핵심 포인트 정리

### 9. **성능 모니터** ⚡

- **위치**: 아홉 번째 탭
- **기능**:
  - 시스템 성능 모니터링
  - 리소스 사용량 추적
  - 성능 최적화 제안

---

## 🔧 **API 사용법**

### 1. **API 문서 접속**

```
http://localhost:8000/docs
```

### 2. **주요 API 엔드포인트**

#### **AI 메시지 생성**

```bash
curl -X POST "http://localhost:8000/api/chat/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "target_message": "안녕하세요",
    "context_messages": [
      {"role": "user", "content": "안녕하세요"},
      {"role": "assistant", "content": "안녕하세요! 무엇을 도와드릴까요?"}
    ],
    "settings": {
      "tone": "friendly",
      "ai_model": "gpt-3.5-turbo"
    }
  }'
```

#### **파일 업로드**

```bash
curl -X POST "http://localhost:8000/api/files/upload" \
  -F "file=@your_file.pdf"
```

#### **감정 분석**

```bash
curl -X POST "http://localhost:8000/api/ai/sentiment" \
  -H "Content-Type: application/json" \
  -d '{"text": "오늘 정말 좋은 하루였어요!"}'
```

#### **대시보드 메트릭**

```bash
curl "http://localhost:8000/api/dashboard/metrics"
```

### 3. **웹소켓 연결**

```javascript
// 실시간 채팅
const ws = new WebSocket('ws://localhost:8000/ws/chat/default');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('받은 메시지:', data);
};

// 메시지 전송
ws.send(JSON.stringify({
    type: 'message',
    data: {
        content: '안녕하세요!',
        sender: '사용자',
        timestamp: new Date().toISOString()
    }
}));
```

---

## 🔍 **문제 해결**

### 1. **백엔드 서버 시작 실패**

**증상**: `ModuleNotFoundError` 또는 포트 8000 사용 중

**해결 방법**:

```bash
# 1. 가상환경 활성화 확인
source venv/bin/activate

# 2. 의존성 재설치
pip install -r backend/requirements.txt

# 3. 포트 확인
lsof -ti:8000 | xargs kill -9

# 4. 서버 재시작
cd backend && python advanced_api_server.py
```

### 2. **프론트엔드 서버 시작 실패**

**증상**: 포트 3000 사용 중 또는 모듈 오류

**해결 방법**:

```bash
# 1. Node.js 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 2. 포트 확인
lsof -ti:3000 | xargs kill -9

# 3. 서버 재시작
npm start
```

### 3. **OpenAI API 오류**

**증상**: API 키 오류 또는 요청 실패

**해결 방법**:

```bash
# 1. API 키 확인
echo $OPENAI_API_KEY

# 2. API 키 재설정
export OPENAI_API_KEY="your-new-api-key"

# 3. API 테스트
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### 4. **파일 업로드 실패**

**증상**: OCR 또는 파일 처리 오류

**해결 방법**:

```bash
# 1. 시스템 라이브러리 확인
tesseract --version
ffmpeg -version

# 2. Python 라이브러리 재설치
pip install --upgrade pytesseract Pillow openai-whisper

# 3. 테스트 실행
python test_implemented_features.py
```

### 5. **메모리 부족 오류**

**증상**: `OutOfMemoryError` 또는 시스템 느림

**해결 방법**:

```bash
# 1. 시스템 리소스 확인
python system_monitor.py

# 2. 불필요한 프로세스 종료
./stop_system.sh

# 3. 메모리 정리 후 재시작
./start_system.sh
```

---

## 📞 **지원 및 문의**

### **시스템 정보**

- **버전**: 1.0.0
- **완성도**: 93%
- **지원 플랫폼**: macOS, Linux, Windows

### **로그 확인**

```bash
# 백엔드 로그
tail -f backend/logs/app.log

# 프론트엔드 로그
npm start 2>&1 | tee frontend.log
```

### **성능 최적화**

1. **메모리 사용량 모니터링**: `python system_monitor.py`
2. **불필요한 프로세스 종료**: `./stop_system.sh`
3. **캐시 정리**: `npm run build` (프로덕션 빌드)

---

## 🎉 **결론**

**CORBU AI 시스템**은 현재 **93% 완성도**로 개발이 완료되었으며, 모든 핵심 기능이 실제 구현되어 즉시 사용 가능합니다.

### **즉시 사용 가능한 기능들**

- ✅ 실시간 채팅 및 메시지 생성
- ✅ AI 기반 대화 분석
- ✅ 다양한 파일 형식 처리
- ✅ 고급 분석 대시보드
- ✅ 실시간 모니터링

### **시작하기**

```bash
# 1. 시스템 시작
./start_system.sh

# 2. 브라우저에서 접속
open http://localhost:3000

# 3. API 문서 확인
open http://localhost:8000/docs
```

**이제 CORBU AI 시스템을 사용하여 더욱 스마트한 대화 분석과 AI 메시지 생성을 경험해보세요!** 🚀
