# CORBU AI 시스템 설정 및 실행 가이드

## 📋 개요

이 가이드는 CORBU AI 시스템을 처음부터 끝까지 설정하고 실행하는 방법을 안내합니다.

## 🎯 시스템 구성

- **백엔드**: FastAPI 기반 REST API (포트 5001)
- **프론트엔드**: React + TypeScript (포트 3000)
- **인터페이스**: ChatGPT 스타일 채팅 인터페이스

## 📦 1단계: 환경 준비

### 필수 요구사항

- **Python**: 3.8 이상
- **Node.js**: 18 이상
- **npm** 또는 **yarn**

### 확인 방법

```bash
python --version  # Python 3.8 이상
node --version    # Node.js 18 이상
npm --version     # npm 버전 확인
```

## 🔧 2단계: 백엔드 설정

### 2.1 의존성 설치

```bash
cd backend
pip install -r requirements.txt
```

또는 가상환경 사용 (권장):

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2.2 백엔드 실행

**방법 1: 스크립트 사용 (권장)**
```bash
cd backend
chmod +x start.sh
./start.sh
```

**방법 2: 직접 실행**
```bash
cd backend
python app.py
```

**방법 3: 환경 변수와 함께**
```bash
cd backend
API_PORT=5001 API_HOST=0.0.0.0 python app.py
```

### 2.3 백엔드 확인

브라우저에서 다음 URL을 열어 확인:
- http://localhost:5001/api/health
- http://localhost:5001/docs (Swagger UI)

## 🎨 3단계: 프론트엔드 설정

### 3.1 의존성 설치

```bash
# 프로젝트 루트에서
npm install
```

### 3.2 환경 변수 설정 (선택사항)

`.env` 파일 생성 (프로젝트 루트):

```env
REACT_APP_API_URL=http://localhost:5001
```

기본값은 `http://localhost:5001`이므로 생략 가능합니다.

### 3.3 프론트엔드 실행

```bash
npm start
```

브라우저에서 자동으로 http://localhost:3000 이 열립니다.

## 🚀 4단계: 통합 실행 (한 번에 시작)

### 자동 실행 스크립트 사용

```bash
chmod +x start_all.sh
./start_all.sh
```

이 스크립트는 백엔드와 프론트엔드를 동시에 시작합니다.

## ✅ 5단계: 시스템 확인

### 백엔드 확인

```bash
# 헬스 체크
curl http://localhost:5001/api/health

# API 상태
curl http://localhost:5001/api/status
```

### 프론트엔드 확인

1. 브라우저에서 http://localhost:3000 접속
2. ChatGPT 스타일 인터페이스가 표시되는지 확인
3. 메시지를 입력하여 백엔드와 통신 확인

## 🧪 6단계: 테스트

### 백엔드 API 테스트

```bash
cd backend
python test_api.py
```

### 수동 테스트

1. **회원가입 테스트**
   - 프론트엔드에서 회원가입 기능 사용
   - 또는 Swagger UI (http://localhost:5001/docs)에서 테스트

2. **채팅 테스트**
   - 프론트엔드에서 메시지 입력
   - 백엔드 응답 확인

## 🔧 문제 해결

### 포트 충돌

**백엔드 포트 (5001)가 사용 중인 경우:**
```bash
# 다른 포트 사용
API_PORT=5002 python app.py
```

**프론트엔드 포트 (3000)가 사용 중인 경우:**
```bash
PORT=3001 npm start
```

### CORS 오류

백엔드 `app.py`의 CORS 설정 확인:
```python
allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"]
```

필요한 origin을 추가하세요.

### 의존성 오류

**백엔드:**
```bash
cd backend
pip install --upgrade fastapi uvicorn pydantic psutil
```

**프론트엔드:**
```bash
npm install
# 또는
rm -rf node_modules package-lock.json
npm install
```

### 모듈을 찾을 수 없는 오류

```bash
# Python 경로 확인
which python
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 📁 프로젝트 구조

```
kakao-frontend/
├── backend/
│   ├── app.py                 # 메인 백엔드 서버
│   ├── requirements.txt       # Python 의존성
│   ├── start.sh              # 백엔드 실행 스크립트
│   ├── test_api.py           # API 테스트 스크립트
│   └── *.md                  # 문서 파일들
├── src/
│   ├── components/
│   │   └── ChatGPTInterface.tsx  # ChatGPT 스타일 인터페이스
│   ├── App.tsx               # 메인 앱 컴포넌트
│   └── ...
├── package.json              # Node.js 의존성
├── start_all.sh             # 통합 실행 스크립트
└── README.md
```

## 🎯 주요 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 채팅
- `POST /api/chat` - 채팅 메시지 전송

### 시스템
- `GET /api/health` - 헬스 체크
- `GET /api/status` - 상태 확인

전체 엔드포인트는 http://localhost:5001/docs 에서 확인할 수 있습니다.

## 📚 추가 문서

- [백엔드 API 문서](./backend/API_DOCUMENTATION.md)
- [빠른 시작 가이드](./backend/QUICK_START.md)
- [구현 요약](./backend/IMPLEMENTATION_SUMMARY.md)
- [완료 보고서](./backend/COMPLETION_REPORT.md)

## 🎉 완료!

이제 시스템이 준비되었습니다. 즐거운 개발 되세요!

---

**문제가 발생하면:**
1. 로그 확인
2. 문서 참조
3. 이슈 등록

