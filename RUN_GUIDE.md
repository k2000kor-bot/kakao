# CORBU AI 실행 가이드

## 🚀 빠른 시작

### 방법 1: 통합 실행 (권장)

```bash
# 프로젝트 루트에서
chmod +x start_all.sh
./start_all.sh
```

이 명령어로 백엔드와 프론트엔드를 동시에 시작합니다.

### 방법 2: 개별 실행

#### 백엔드 실행

```bash
cd backend
chmod +x start.sh
./start.sh
```

또는:

```bash
cd backend
python app.py
```

#### 프론트엔드 실행

```bash
# 새 터미널에서
npm start
```

## 📍 접속 정보

실행 후 다음 URL로 접속:

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5001
- **API 문서**: http://localhost:5001/docs
- **헬스 체크**: http://localhost:5001/api/health

## ✅ 실행 확인

### 1. 백엔드 확인

터미널에서:
```bash
curl http://localhost:5001/api/health
```

또는 브라우저에서 http://localhost:5001/api/health 접속

### 2. 프론트엔드 확인

브라우저에서 http://localhost:3000 접속하여 ChatGPT 스타일 인터페이스 확인

### 3. 통신 확인

프론트엔드에서 메시지를 입력하여 백엔드와의 통신이 정상적으로 작동하는지 확인

## 🔧 문제 해결

### 포트 충돌

**백엔드 (5001):**
```bash
API_PORT=5002 python app.py
```

**프론트엔드 (3000):**
```bash
PORT=3001 npm start
```

그리고 프론트엔드 `.env` 파일에:
```
REACT_APP_API_URL=http://localhost:5002
```

### 의존성 오류

**백엔드:**
```bash
cd backend
pip install -r requirements.txt
```

**프론트엔드:**
```bash
npm install
```

### CORS 오류

백엔드 `app.py`의 CORS 설정 확인:
```python
allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"]
```

## 📚 상세 가이드

더 자세한 내용은 [SETUP_GUIDE.md](./SETUP_GUIDE.md)를 참조하세요.

