# 기본 셋팅 가이드

별도 설치가 필요한 기본 환경 설정 방법입니다.

## ✅ 완료된 작업

### 백엔드 (Python)
- ✅ `backend/venv` 가상환경 생성
- ✅ 핵심 패키지 설치 완료 (FastAPI, uvicorn, pydantic, Flask 등)
- 📌 `requirements-core.txt` 사용 (tensorflow/torch는 의존성 충돌로 제외)

## 📋 수동 설치가 필요한 항목

### 1. Node.js (프론트엔드용)

Node.js가 설치되어 있지 않다면 다음 중 하나로 설치하세요:

```bash
# Homebrew 사용 시
brew install node

# 또는 nvm 사용 (권장)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# 터미널 재시작 후
nvm install 18
nvm use 18
```

### 2. 프론트엔드 의존성 설치

Node.js 설치 후:

```bash
cd /Users/a0/kakao-frontend/kakao-frontend
npm install
```

## 🚀 한 번에 셋팅하기

```bash
./setup.sh
```

위 스크립트는 백엔드 venv + 패키지 설치를 수행하고, Node.js가 있으면 `npm install`도 실행합니다.

## 🔌 플러그인/추가 기능 설치

OCR, YouTube 음성 추출, Ollama(로컬 LLM) 등:

```bash
./install-plugins.sh
```

상세: [PLUGINS_SETUP.md](./PLUGINS_SETUP.md)

## ▶️ 실행 방법

```bash
./start_all.sh   # 시작
./stop_all.sh    # 종료
```

상태 확인: `npm run check:system`

또는 개별 실행:
- **백엔드**: `cd backend && ./start.sh`
- **프론트엔드**: `npm start`

## 환경 변수 (선택)

LLM 등 추가 설정 시 `.env.example`을 참고하여 `.env.local` 생성:

```bash
cp .env.example .env.local
# 필요시 .env.local 편집
```

주소창 `?id=` 기반 Genspark·merge 보강을 끄려면 `.env.local`에 `REACT_APP_GENSPARK_DISABLE_WINDOW_ROUTE_CONTEXT=1`(또는 `true`)을 넣습니다. 그 외 선택 변수는 `.env.example` 주석을 참고하세요.

## 📍 접속 주소

- 프론트엔드: http://localhost:3000
- 통합 백엔드 API (기본 5002, `BACKEND_PORT`/`API_PORT`): http://localhost:5002/api/docs

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

