# 백업 및 새 PC 복원 가이드

프로젝트 전체를 압축해 새 컴퓨터에서 다시 셋팅할 때 사용하는 방법입니다.

---

## 1. 백업 만들기 (현재 PC)

### 방법 A: 스크립트 실행 (권장)

```bash
# 프로젝트 루트에서
./scripts/backup-for-migration.sh
```

- 압축 파일이 **프로젝트 상위 폴더**에 생성됩니다.  
  예: `/Users/사용자명/kakao-frontend-backup-2026-02-11.tar.gz`
- **제외되는 것**: `node_modules`, `.venv`, `venv`, `build`, `dist`, `coverage`, `__pycache__`, `.pytest_cache`, `.cache`, 로그/pid 등  
  → 새 PC에서 `npm install`, `pip install`로 다시 설치합니다.
- **포함되는 것**: 소스 코드, 설정 파일, `package.json`, `requirements.txt`, `docs/`, `.git`(기본 포함) 등  
- 생성된 압축 파일은 **프로젝트 폴더의 한 단계 위**에 있습니다.  
  예: 프로젝트가 `/Users/사용자명/kakao-frontend`이면 → `/Users/사용자명/kakao-frontend-backup-날짜.tar.gz`  
- 용량이 크면(수 GB) USB·외장 디스크나 클라우드에 복사한 뒤 새 PC로 옮기세요.

### Git 제외하고 용량 줄이기

```bash
EXCLUDE_GIT=1 ./scripts/backup-for-migration.sh
```

- `.git` 폴더를 제외해 용량을 줄입니다.  
  버전 이력이 필요 없을 때만 사용하세요.

### 방법 B: 수동 tar (선택)

```bash
cd /path/to/parent/of/kakao-frontend
tar czf kakao-frontend-backup-$(date +%Y-%m-%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.venv' \
  --exclude='venv' \
  --exclude='build' \
  --exclude='dist' \
  --exclude='coverage' \
  --exclude='__pycache__' \
  --exclude='.pytest_cache' \
  --exclude='.cache' \
  kakao-frontend
```

---

## 2. 새 PC에서 복원 및 셋팅

### 2.1 압축 해제

```bash
# 압축 파일을 옮긴 위치에서 (예: 다운로드 폴더)
cd ~
tar xzf kakao-frontend-backup-2026-02-11.tar.gz
cd kakao-frontend
```

### 2.2 필수 환경

- **Node.js** (v18 이상 권장): [nodejs.org](https://nodejs.org/) 또는 `nvm` 설치
- **Python 3.10+**: [python.org](https://www.python.org/) 또는 `pyenv` 설치
- **npm** (Node 설치 시 포함)

### 2.3 프론트엔드 의존성 및 실행

```bash
npm install
npm start
```

- 브라우저에서 http://localhost:3000 접속

### 2.4 백엔드 의존성 및 실행

```bash
cd backend
python3 -m venv .venv   # 또는 python3 -m venv venv (backend/venv)
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

백엔드만 실행:

```bash
cd backend && source .venv/bin/activate && uvicorn main_server:app --reload --host 0.0.0.0 --port 5002
```

또는 프로젝트 루트에서 (`backend/venv` → `backend/.venv` → 시스템 Python 순으로 선택):

```bash
npm run restart:backend
# (내부적으로 scripts/restart-backend.sh)
```

(스크립트가 없으면 [DEVELOPMENT.md](../DEVELOPMENT.md)의 백엔드 실행 방법 참고.)

### 2.5 환경 변수 (선택)

- `.env`는 보안상 백업에 포함하지 않는 것을 권장합니다.
- 새 PC에서 필요 시 `.env.example`을 복사해 `.env`를 만들고, API URL·키 등을 채웁니다.
- 루트 또는 `backend/`에 `.env`가 있다면 로컬에 맞게 새로 작성하세요.

### 2.6 동작 확인

```bash
# 백엔드 테스트
npm run test:backend

# 프론트 타입·린트
npm run typecheck
npm run lint:strict

# 프론트 테스트 (TTS·P4 서비스 등)
npm run test:p4:services
npm run test:tts:all
```

한 번에 검사:

```bash
npm run dev:check
```

---

## 3. 요약

| 단계 | 현재 PC | 새 PC |
|------|---------|--------|
| 1 | `./scripts/backup-for-migration.sh` | 압축 파일 복사 (USB/클라우드 등) |
| 2 | - | `tar xzf kakao-frontend-backup-*.tar.gz` |
| 3 | - | `npm install` |
| 4 | - | `cd backend && python3 -m venv .venv && pip install -r requirements.txt` |
| 5 | - | `.env` 필요 시 생성 |
| 6 | - | `npm start` / 백엔드 실행 후 사용 |

자세한 개발 흐름·명령은 [DEVELOPMENT.md](../DEVELOPMENT.md), [START_HERE.md](../START_HERE.md)를 참고하세요.
