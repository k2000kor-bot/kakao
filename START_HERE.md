# 🚀 시작하기

**CORBU.AI 시스템에 오신 것을 환영합니다!**

이 문서는 시스템을 빠르게 시작하는 방법을 안내합니다.

---

## 👋 처음 사용자 둘러보기

| 하고 싶은 것 | 메뉴/경로 | 설명 |
|-------------|----------|------|
| **일반 대화** | 일반 대화 (/) | 프로젝트와 분리된 대화·질의응답 |
| **프로젝트 관리** | 프로젝트 (/projects) | 프로젝트 목록·생성·편집. 클릭 시 해당 프로젝트 · 대화(/projects/:id)로 진입 |
| **목소리 생성(TTS)** | 목소리 생성 (/voice-generation) | 텍스트→음성 변환. 대본·감정 프리셋 지원 |
| **설정** | 도구 → 설정 (/settings) | 테마·알림·정보 |
| **사용 통계** | 도구 → 분석 (/analytics) | 요청 수·프로젝트별 통계·CSV 내보내기 |
| **도움말** | 도구 → 도움말 (/docs) | 가이드·단축키·문제 해결 |

**한 페이지 요약**: [메뉴얼 빠른 참조](./docs/guides/MANUAL_QUICK_REFERENCE.md)

---

## ⚡ 빠른 시작 (5분)

**npm 명령(`npm run ...`)은 반드시 프로젝트 루트(package.json이 있는 폴더)에서 실행하세요.**  
예: 저장소를 `~/kakao-frontend`에 클론했다면 `cd ~/kakao-frontend/kakao-frontend` 후 실행.

### 1. 의존성 설치

```bash
./setup.sh    # 한 번에 설치 (백엔드 backend/venv + 프론트 npm)
```

**Python 경로**: `backend/venv` → `backend/.venv` → 루트 `venv`/`.venv` 순으로 쓰는 스크립트가 많습니다. 요약은 [docs/setup/PYTHON_VENV.md](./docs/setup/PYTHON_VENV.md) 참고.

### 2. 시스템 실행

```bash
./start_all.sh    # 시작
./stop_all.sh     # 종료
```

### 3. 접속

- **프론트엔드**: http://localhost:3000
- **통합 API (5002)**: http://localhost:5002/api/docs
- **통합 API (기본 5002)**: http://localhost:5002/api/docs (`npm run restart:backend`). 레거시 `app.py`만 쓸 때는 별도 포트일 수 있음.

**PC에서 접속이 안 될 때 · 화면에 아무것도 안 보일 때**  
→ **[CONNECT.md](./CONNECT.md)** 를 먼저 보세요. (같은 PC에서 실행 여부, standalone.html 접속 확인 등)

**docx 대본 → 목소리 샘플** 확인은 CONNECT.md의 **5-1. docx 대본 → 목소리 샘플 확인** 섹션을 참고하세요.

**백엔드·E2E 테스트** 실행 방법은 CONNECT.md의 **7. 테스트 실행**을 참고하세요.

1. **같은 PC**에서 터미널 2개: **`npm run restart:backend`** (통합 API 5002) / **`npm start`** (프론트 3000). (`bash scripts/start-api-5002.sh` 동일)
2. 브라우저에서 **http://localhost:3000/standalone.html** 먼저 열기 → "이 화면이 보이면" 나오면 서버 접속 성공. 메인: http://localhost:3000/
3. 포트·실행 순서: **docs/PORTS.md** 참고

---

## 🤖 LLM 사용하기 (선택사항)

LLM을 사용하려면 환경 변수를 설정하세요:

```bash
# OpenAI 사용
export OPENAI_API_KEY="sk-..."
export LLM_PROVIDER="openai"
export LLM_MODEL="gpt-3.5-turbo"

# 또는 Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."
export LLM_PROVIDER="anthropic"

# 또는 Ollama (로컬)
export OLLAMA_BASE_URL="http://localhost:11434"
export LLM_PROVIDER="ollama"
export LLM_MODEL="llama2"
```

**참고**: LLM API 키를 설정하지 않아도 기본 모드로 작동합니다!

**딥시크(DeepSeek) 사용 시**: 설치→구동→개발→학습 한 흐름은 [docs/DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md](./docs/DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md) 를 참고하세요.

---

## 📚 더 알아보기

### 기본 가이드
- [README.md](./README.md) - 프로젝트 개요
- [COMPLETE_SETUP.md](./COMPLETE_SETUP.md) - 완전한 설정 가이드
- [RUN_GUIDE.md](./RUN_GUIDE.md) - 빠른 실행 가이드

### 사용 가이드 (메뉴얼)
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - 화면 구성·프로젝트·대화·고급 기능 상세
- [메뉴얼 빠른 참조](./docs/guides/MANUAL_QUICK_REFERENCE.md) - 한 페이지 요약
- [QUICK_START.md](./QUICK_START.md) - 5분 안에 실행·첫 대화
- [TTS 가이드](./docs/guides/TTS_AND_SCRIPT_STYLE_GUIDE.md) - 목소리 생성·샘플 스타일
- [노트북 LLM 가이드](./docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md) - 프로젝트 연동 상세

### LLM 가이드
- [README_LLM.md](./README_LLM.md) - LLM 빠른 시작
- [backend/LLM_SETUP_GUIDE.md](./backend/LLM_SETUP_GUIDE.md) - 상세 설정
- [docs/DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md](./docs/DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md) - 딥시크 설치→구동→개발→학습 한 흐름
- [docs/DEEPSEEK_SETUP.md](./docs/DEEPSEEK_SETUP.md) - 딥시크 설치형/API·동작 체크리스트

### 개발 가이드
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 프로젝트 구조·실행·테스트·확장 뷰 검증(`npm run test:views`)
- [docs/guides/RESPONSE_CLEANING.md](./docs/guides/RESPONSE_CLEANING.md) - 대화 입력 `coerceTrimmedString`·`npm run test:frontend:chat-pipeline`·미러 동기화
- [docs/DEVELOPER_QUICK_CHECKLIST.md](./docs/DEVELOPER_QUICK_CHECKLIST.md) - 실행·테스트·API 빠른 체크
- [docs/COMPONENT_ARCHITECTURE.md](./docs/COMPONENT_ARCHITECTURE.md) - 컴포넌트·라우트·프로젝트 관리 매핑
- [src/views/README.md](./src/views/README.md) - 라우트별 뷰·확장 뷰(도구 메뉴) 검증
- [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) - 개발 로드맵
- [COMPLETE_SYSTEM_SUMMARY.md](./COMPLETE_SYSTEM_SUMMARY.md) - 시스템 요약

**마무리 검증**: `npm run verify:completion` (타입·린트·P4 테스트). 상세: [docs/COMPLETION_CHECKLIST.md](./docs/COMPLETION_CHECKLIST.md)  
**대화 파이프라인 Jest**: `npm run test:frontend:chat-pipeline` — `./scripts/final-verify.sh`에도 포함됨.

---

## 🧪 테스트

```bash
# 통합 테스트
./test_integration.sh

# LLM 테스트
./test_llm.sh
```

**main.py API 테스트**: `cd backend && python3 -m pytest tests/test_main_api.py -v` (통과 시 약 62개). **E2E**: CONNECT.md **7. 테스트 실행** 참고.

---

## 🆘 문제 해결

### 백엔드가 시작되지 않는 경우

1. 포트 확인: `lsof -i :5002`
2. Python 버전 확인: `python3 --version` (3.8+ 필요)
3. 의존성 확인: `pip list | grep fastapi`

### 프론트엔드가 시작되지 않는 경우

1. 포트 확인: `lsof -i :3000`
2. Node.js 버전 확인: `node --version` (18+ 필요)
3. 의존성 확인: `npm list react`

### LLM이 작동하지 않는 경우

1. 환경 변수 확인: `echo $OPENAI_API_KEY`
2. 의존성 확인: `pip list | grep openai`
3. [LLM 설정 가이드](./backend/LLM_SETUP_GUIDE.md) 참조

### 창이 예기치 않게 종료될 때 (크래시, 코드 5)

`npm start`·`npm run build`에는 `NODE_OPTIONS=--max-old-space-size=8192`가 적용되어 있습니다. 그래도 반복 크래시하면 [CONNECT.md §8](./CONNECT.md#8-창이-예기치-않게-종료될-때-크래시-코드-5) 또는 [TROUBLESHOOTING_GUIDE](./docs/guides/TROUBLESHOOTING_GUIDE.md) 크래시 섹션을 참고하세요. `npm run start:safe` 시도 권장.

---

## ✅ 체크리스트

시작하기 전 확인:

- [ ] Python 3.8+ 설치됨
- [ ] Node.js 18+ 설치됨
- [ ] 백엔드 의존성 설치됨
- [ ] 프론트엔드 의존성 설치됨
- [ ] 포트 3000, 5002 사용 가능
- [ ] (선택) LLM API 키 설정됨

---

## 🎉 준비 완료!

모든 준비가 끝났습니다. 이제 시스템을 실행하고 사용할 수 있습니다!

**시작하기**: `./start_all.sh`

---

**행운을 빕니다! 🚀**

