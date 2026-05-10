# Python 가상환경 (백엔드)

프로젝트 스크립트·문서는 아래 **우선순위**를 기준으로 맞춰 두었습니다.

**프론트 회귀·원격 push**(백엔드와 병행 시): [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — **`npm run test:sidebar-context`**. [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md).

## 활성화 순서 (`source …/bin/activate`)

1. **`backend/venv`** (`./setup.sh`가 생성하는 기본 경로)
2. **`backend/.venv`** (macOS 셋업·`restart-backend` 재생성 등)
3. **루트 `venv` / `.venv`** (레거시·일부 도구)

헬퍼: **`scripts/lib-activate-backend-venv.sh`** 의 `backend_venv_activate <저장소_루트>`

## 인터프리터만 고를 때 (`python` 실행 파일 경로)

pytest·uvicorn 등 **import 한 줄**로 고를 때: **`scripts/lib-backend-python.sh`** 의 `backend_python_resolve "$ROOT" "import pytest"` 등.

## 통합 API (개발)

- **`npm run restart:backend`** → `scripts/restart-backend.sh` (위 우선순위 + `import uvicorn`, 없으면 `backend/.venv`를 `requirements-core.txt`로 재생성)
- 동일 진입: **`bash scripts/start-api-5002.sh`**

## VS Code

- **`.vscode/settings.json`**: 기본 인터프리터 `backend/.venv/bin/python`  
  `backend/venv`만 쓰는 경우 에디터에서 **`backend/venv/bin/python`** 으로 바꿉니다.

## 레거시·별도 엔트리포인트 포트 (환경변수)

일상 개발은 **`main_server` 5002** (`npm run restart:backend`)가 기준입니다. 아래는 **별도로 띄우는** 스크립트용입니다.

| 변수 | 용도 | 기본값 |
|------|------|--------|
| **`ULTIMATE_HTTP_PORT`** | `ultimate_integrated_server.py` (`start_unified_system.sh`) | `8000` |
| **`UNIFIED_CONV_PORT`** | `unified_conversation_api.py` | `8001` |
| **`ULTIMATE_MEDIA_PORT`** / **`MEDIA_KNOWLEDGE_PORT`** | `ultimate_media_knowledge_system.py` | `8001` |

테스트: **`CORBU_ULTIMATE_MEDIA_BASE`**, **`CORBU_ENHANCED_CONV_BASE`** 등 (`scripts/test/` 내 해당 스크립트 참고).

## 관련 문서

- [MACOS_DEV_QUICKSTART.md](./MACOS_DEV_QUICKSTART.md)
- [DEVELOPMENT.md](../../DEVELOPMENT.md) §2 (실행·백엔드)
- [scripts/README.md](../../scripts/README.md) (배포 스크립트 요약)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

