# 🚀 빠른 시작 가이드

## 전체 시스템 실행
```bash
./start_system.sh
```

## 개별 실행

### 백엔드만 실행
```bash
./start_backend.sh
```

### 프론트엔드만 실행
```bash
./start_frontend.sh
```

## 개발 환경

### Python 가상환경 활성화
```bash
source .venv/bin/activate
```

### 서버 주소
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8007
- **API 문서**: http://localhost:8007/docs

## 문제 해결

### 포트 사용 확인
```bash
lsof -i :3000
lsof -i :8007
```

### 프로세스 종료
```bash
pkill -f "simple_message_generator"
pkill -f "npm start"
```
