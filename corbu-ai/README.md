# CORBU AI - 고도화된 AI 플랫폼

## 🚀 개요

CORBU AI는 완전히 고도화된 엔터프라이즈급 AI 플랫폼입니다. ChatGPT 모의 응답, 실시간 모니터링, 스마트 알림 시스템, 고급 분석 기능을 제공합니다.

## ✨ 주요 기능

### 1. 기본 대화

- ChatGPT 모의 응답 시스템
- 실시간 대화 인터페이스
- 감정 분석 및 의도 인식

### 2. 통합 AI 대화

- 고급 AI 분석 기능
- 창작 글쓰기 (소설, 시, 에세이)
- 설득 콘텐츠 생성
- 마케팅 콘텐츠 생성

### 3. 분석 대시보드

- 고급 데이터 분석
- 예측 분석
- AI 인사이트 생성
- 캐시 관리 시스템

### 4. 실시간 모니터링

- CPU, 메모리, 디스크 사용률 모니터링
- 네트워크 지연 시간 추적
- 시스템 성능 지표
- 실시간 알림 시스템

### 5. 스마트 알림 시스템

- AI 기반 알림 생성
- 우선순위별 알림 분류
- 알림 설정 및 관리
- 시뮬레이션 알림 기능

## 🛠️ 기술 스택

### Backend

- **Python 3.8+**
- **Flask** - 웹 프레임워크
- **Flask-CORS** - CORS 지원
- **psutil** - 시스템 메트릭 수집
- **python-dotenv** - 환경 변수 관리

### Frontend

- **React 18**
- **TypeScript**
- **Material-UI (MUI)** - UI 컴포넌트
- **CSS Grid** - 레이아웃

### AI & Analytics

- **ChatGPT 모의 응답** - 개발 환경 안정성
- **감정 분석** - 고급 자연어 처리
- **실시간 모니터링** - 시스템 성능 추적
- **캐싱 시스템** - 성능 최적화

## 🚀 설치 및 실행

### 1. 백엔드 설정

```bash
# 프로젝트 디렉토리로 이동
cd /Users/aD/kakao-frontend/corbu-ai/backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r requirements.txt
pip install psutil  # 시스템 메트릭용

# 서버 실행
python dev_server.py
```

### 2. 프론트엔드 설정

```bash
# 프론트엔드 디렉토리로 이동
cd /Users/aD/kakao-frontend/corbu-ai/frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

## 📡 API 엔드포인트

### 기본 엔드포인트

- `GET /health` - 서버 상태 확인
- `GET /metrics` - 시스템 메트릭
- `GET /system/metrics` - 실시간 시스템 메트릭

### AI 기능

- `POST /analyze` - AI 텍스트 분석 (캐싱 적용)
- `POST /creative/story` - 창작 글쓰기
- `POST /marketing/content` - 마케팅 콘텐츠

### 알림 시스템

- `POST /notifications/generate` - 스마트 알림 생성

### 캐시 관리

- `GET /cache/status` - 캐시 상태 확인
- `POST /cache/clear` - 캐시 초기화

## 🎯 사용 방법

### 1. 시스템 접속

브라우저에서 `http://localhost:3000` 접속

### 2. 탭별 기능 사용

#### 기본 대화

- AI와 실시간 대화
- 감정 분석 결과 확인
- 의도 인식 기능

#### 통합 AI 대화

- 고급 AI 분석 요청
- 창작 글쓰기 (장르별)
- 마케팅 콘텐츠 생성

#### 분석 대시보드

- 고급 데이터 분석 실행
- 예측 분석 수행
- AI 인사이트 생성
- 캐시 상태 모니터링

#### 실시간 모니터링

- 시스템 성능 실시간 추적
- CPU, 메모리, 디스크 사용률 확인
- 네트워크 지연 시간 모니터링
- 시스템 알림 확인

#### 스마트 알림

- AI 기반 알림 생성
- 알림 우선순위 관리
- 알림 설정 조정
- 시뮬레이션 알림 테스트

## ⚡ 성능 최적화

### 캐싱 시스템

- **TTL**: 5분 (300초)
- **타입**: 메모리 기반 캐시
- **키 생성**: MD5 해시
- **자동 만료**: 만료된 캐시 자동 정리

### 응답 속도

- **캐시 히트**: < 0.02초
- **캐시 미스**: 0.5-1.5초 (시뮬레이션)
- **실시간 모니터링**: 5초 간격 업데이트

## 🔧 설정

### 환경 변수

```bash
# .env 파일 (선택사항)
REACT_APP_INTEGRATED_API_URL=http://localhost:5005
```

### 포트 설정

- **백엔드**: 5005
- **프론트엔드**: 3000

## 📊 시스템 요구사항

### 최소 요구사항

- **Python**: 3.8+
- **Node.js**: 16+
- **메모리**: 4GB RAM
- **디스크**: 1GB 여유 공간

### 권장 요구사항

- **Python**: 3.9+
- **Node.js**: 18+
- **메모리**: 8GB RAM
- **디스크**: 2GB 여유 공간

## 🐛 문제 해결

### 일반적인 문제

#### 서버가 시작되지 않는 경우

```bash
# 포트 충돌 확인
lsof -i :5005

# 프로세스 종료
pkill -f "python.*dev_server"

# 서버 재시작
cd /Users/aD/kakao-frontend/corbu-ai/backend
source venv/bin/activate
python dev_server.py
```

#### 프론트엔드 컴파일 오류

```bash
# 캐시 정리
cd /Users/aD/kakao-frontend/corbu-ai/frontend
rm -rf node_modules/.cache
rm -rf build
npm cache clean --force

# 재설치
npm install
npm start
```

#### 의존성 오류

```bash
# 백엔드 의존성 재설치
cd /Users/aD/kakao-frontend/corbu-ai/backend
source venv/bin/activate
pip install -r requirements.txt
pip install psutil
```

## 🔮 향후 계획

### 단기 계획

- [ ] 실제 ChatGPT API 연동
- [ ] 사용자 인증 시스템
- [ ] 데이터베이스 연동
- [ ] 로그 시스템

### 장기 계획

- [ ] 마이크로서비스 아키텍처
- [ ] Kubernetes 배포
- [ ] 모니터링 대시보드 고도화
- [ ] AI 모델 최적화

## 📝 라이선스

이 프로젝트는 개발 및 연구 목적으로 제작되었습니다.

## 🤝 기여

프로젝트 개선을 위한 제안이나 버그 리포트는 언제든 환영합니다.

---

**CORBU AI - 차세대 AI 플랫폼** 🚀✨

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

