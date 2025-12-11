# 🚀 서버 실행 가이드

## 전체 시스템 재실행

### 방법 1: 통합 스크립트 사용 (권장)

```bash
# 모든 서버 시작
./start_all.sh

# 모든 서버 종료
./stop_all.sh
```

### 방법 2: 개별 서버 실행

#### 1. 백엔드 API 서버 (포트 8000)
```bash
cd backend
python3 -m uvicorn advanced_api_server:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. 백엔드 Node.js 서버 (포트 5000/5001) - 선택사항
```bash
cd backend
node server.js
```

#### 3. 프론트엔드 서버 (포트 3000)
```bash
npm start
```

## 서버 주소

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8000
- **백엔드 Node.js**: http://localhost:5000 (선택사항)

## 문제 해결

### 포트가 이미 사용 중인 경우

스크립트가 자동으로 기존 프로세스를 종료하고 재시작합니다. 수동으로 종료하려면:

```bash
# 특정 포트의 프로세스 확인
lsof -i :8000
lsof -i :3000
lsof -i :5000

# 프로세스 종료
kill -9 <PID>
```

### 로그 확인

모든 서버 로그는 `logs/` 디렉토리에 저장됩니다:

- `logs/frontend.log` - 프론트엔드 로그
- `logs/backend_api.log` - 백엔드 API 로그
- `logs/backend_node.log` - 백엔드 Node.js 로그

### Python 가상환경

프로젝트에 `venv` 또는 `gemini-env` 디렉토리가 있으면 자동으로 활성화됩니다.

## 프로세스 관리

### PID 파일

실행 중인 서버의 PID는 `.pids/` 디렉토리에 저장됩니다:

- `.pids/frontend.pid`
- `.pids/backend_api.pid`
- `.pids/backend_node.pid`

### 수동 종료

```bash
# PID 파일을 통한 종료
kill $(cat .pids/frontend.pid)
kill $(cat .pids/backend_api.pid)
kill $(cat .pids/backend_node.pid)
```

## 개발 모드

모든 서버는 개발 모드로 실행되며, 파일 변경 시 자동으로 재시작됩니다.

- **백엔드 API**: `--reload` 옵션으로 자동 재시작
- **프론트엔드**: React 개발 서버의 핫 리로드

