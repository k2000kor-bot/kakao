# 🍎 macOS 개발 환경 — 빠른 참고

전체 자동 셋업은 **`scripts/setup/setup_macos_dev.sh`** 실행 후 이 파일이 갱신될 수 있습니다. 일상 개발은 저장소 루트 **[DEVELOPMENT.md](../../DEVELOPMENT.md)** 를 기준으로 하세요.

**프론트 회귀·원격 push**: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — **`npm run test:sidebar-context`**. [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md).

## 백엔드 (통합 API)

- **권장**: `npm run restart:backend` (포트 **5002**)
- 또는: `bash scripts/start-api-5002.sh`

## Python 가상환경

- 상세: **[PYTHON_VENV.md](./PYTHON_VENV.md)**
- 활성화 헬퍼: `scripts/lib-activate-backend-venv.sh` 의 `backend_venv_activate "$(pwd)"` (저장소 루트에서)

## 경량 셋업

- `simple_macos_setup.sh` (루트) — `backend/.venv` + 최소 패키지

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

