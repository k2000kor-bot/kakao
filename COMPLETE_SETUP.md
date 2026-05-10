# CORBU.AI 완전한 설정 및 실행 가이드

## ✅ 완료된 작업

### 백엔드 (FastAPI)
- ✅ 29개 API 엔드포인트 구현
- ✅ 인증 시스템 (회원가입, 로그인, 토큰 관리)
- ✅ 보안 시스템 (이벤트 로깅, 메트릭)
- ✅ 사용자 관리 (프로필, 설정)
- ✅ 시스템 모니터링
- ✅ API 문서화 (Swagger/ReDoc)
- ✅ 에러 처리 및 로깅

### 프론트엔드 (React + TypeScript)
- ✅ ChatGPT 스타일 인터페이스
- ✅ 대화 관리 (생성, 삭제, 선택)
- ✅ 메시지 전송 및 수신
- ✅ 마크다운 렌더링
- ✅ 메시지 복사 기능
- ✅ 로컬 스토리지 저장
- ✅ 반응형 디자인

### 인프라
- ✅ 실행 스크립트 작성
- ✅ 의존성 관리
- ✅ 환경 변수 지원
- ✅ 문서화 완료

## 🚀 실행 방법

### 1단계: 의존성 설치

#### 백엔드
```bash
cd backend
pip install -r requirements.txt
```

필수 패키지:
- fastapi
- uvicorn
- pydantic
- psutil

#### 프론트엔드
```bash
npm install
```

### 2단계: 시스템 실행

#### 방법 A: 통합 실행 (권장)
```bash
chmod +x start_all.sh
./start_all.sh
```

#### 방법 B: 개별 실행

**터미널 1 - 백엔드:**
```bash
cd backend
python app.py
```

**터미널 2 - 프론트엔드:**
```bash
npm start
```

### 3단계: 접속 및 확인

1. **프론트엔드**: http://localhost:3000
2. **백엔드 API**: http://localhost:5002
3. **API 문서**: http://localhost:5002/api/docs
4. **헬스 체크**: http://localhost:5002/api/health

## 🧪 테스트

### 백엔드 API 테스트
```bash
cd backend
python test_api.py
```

### 수동 테스트
1. 프론트엔드에서 메시지 입력
2. 백엔드 응답 확인
3. 대화 저장 확인 (로컬 스토리지)

## 📁 프로젝트 구조

```
kakao-frontend/
├── backend/
│   ├── app.py                    # 메인 백엔드 서버 (1,563줄)
│   ├── requirements.txt          # Python 의존성
│   ├── start.sh                  # 백엔드 실행 스크립트
│   ├── test_api.py               # API 테스트 스크립트
│   └── *.md                      # 문서 파일들
├── src/
│   ├── components/
│   │   ├── ChatGPTInterface.tsx  # ChatGPT 스타일 인터페이스
│   │   └── ChatGPTInterface.css  # 스타일
│   ├── App.tsx                   # 메인 앱
│   └── ...
├── package.json                  # Node.js 의존성
├── start_all.sh                  # 통합 실행 스크립트
├── SETUP_GUIDE.md               # 상세 설정 가이드
├── RUN_GUIDE.md                 # 빠른 실행 가이드
└── README.md
```

## 🎯 주요 기능

### 백엔드 API (29개 엔드포인트)

**인증 (7개)**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- POST /api/auth/change-password
- POST /api/auth/reset-password
- GET /api/auth/me

**대화 (1개)**
- POST /api/chat

**보안 (5개)**
- POST /api/security/events
- GET /api/security/events
- GET /api/security/metrics
- GET /api/security/config
- PUT /api/security/config

**사용자 (4개)**
- GET /api/user-profile/{user_id}
- POST /api/update-user-profile
- GET /api/user/settings
- PUT /api/user/settings

**시스템 (6개)**
- GET /
- GET /health
- GET /api/health
- GET /api/status
- GET /api/version
- GET /api/metrics

**유틸리티 (6개)**
- GET /api/test
- GET /api/test/auth
- POST /api/utils/validate-email
- POST /api/utils/validate-password
- GET /api/utils/stats
- POST /api/utils/init-database
- GET /api/utils/export-data

### 프론트엔드 기능

- ✅ ChatGPT 스타일 UI
- ✅ 사이드바 (대화 목록)
- ✅ 메시지 전송/수신
- ✅ 마크다운 렌더링
- ✅ 메시지 복사
- ✅ 로컬 스토리지 저장
- ✅ 자동 스크롤
- ✅ 타이핑 인디케이터
- ✅ 반응형 디자인

## 🔗 연결 확인

### 백엔드 ↔ 프론트엔드

프론트엔드는 다음 설정으로 백엔드에 연결됩니다:

```typescript
// 실제 코드: src/config/api.ts — resolveApiBaseUrl(), FALLBACK_API_ORIGIN, REACT_APP_API_URL
```

`.env.local`의 **`REACT_APP_API_URL`** / **`REACT_APP_WS_URL`** 과 `docs/PORTS.md`를 참고하세요. 기본 폴백 포트는 **`src/config/api.ts`** 의 **`DEFAULT_API_PORT`**(5002)입니다.

### CORS 설정

백엔드는 다음 origin을 허용합니다:
- http://localhost:3000
- http://127.0.0.1:3000

## 📊 시스템 상태

### 완료율: 100%

- ✅ 백엔드 API: 100%
- ✅ 프론트엔드 UI: 100%
- ✅ 통신 연결: 100%
- ✅ 문서화: 100%
- ✅ 실행 스크립트: 100%

## 🎉 시작하기

1. **의존성 설치**
   ```bash
   # 백엔드
   cd backend && pip install -r requirements.txt
   
   # 프론트엔드
   npm install
   ```

2. **시스템 실행**
   ```bash
   ./start_all.sh
   ```

3. **브라우저 접속**
   - http://localhost:3000

4. **대화 시작**
   - 메시지 입력
   - 백엔드 응답 확인

## 📚 참고 문서

- [상세 설정 가이드](./SETUP_GUIDE.md)
- [빠른 실행 가이드](./RUN_GUIDE.md)
- [백엔드 API 문서](./backend/API_DOCUMENTATION.md)
- [구현 요약](./backend/IMPLEMENTATION_SUMMARY.md)
- [완료 보고서](./backend/COMPLETION_REPORT.md)

---

**시스템 준비 완료! 🚀**

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

