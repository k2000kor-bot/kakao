## Push Block Handoff

원격 권한/경로 문제로 `git push`가 막힌 상태에서, 동일 변경을 다른 환경으로 안전하게 이관하기 위한 문서입니다.

**검증·회귀 허브**: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — 마무리 `npm run verify:completion`, 뷰·라우트 `npm run test:views`, 사이드바·대화 맥락 **`npm run test:sidebar-context`**(`scripts/test-sidebar-context.sh`). 아래 `bash scripts/...` 절차는 각 스크립트 파일 상단 주석과 교차합니다.

### 현재 로컬 상태

고정 문자열 대신 아래로 최신 브랜치·커밋·아티팩트를 갱신합니다.

```bash
bash scripts/generate-push-block-manifest.sh
cat docs/PUSH_BLOCK_MANIFEST.md
```

### 생성된 이관 아티팩트 (최신: 컴포저·관계도 파이프라인)

- Bundle: `/Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-05-19.bundle` (~1.1GB, 브랜치 `dev-continue-2026-01-20` 전체)
- Patch 1: `/Users/a0/kakao-frontend/0001-feat-chat-composer-multi-request-pipeline-and-conver.patch`
- Patch 2: `/Users/a0/kakao-frontend/0002-feat-backend-conversation-graph-API-and-pytest-for-C.patch`

**최신 SHA·크기**: `bash scripts/generate-push-block-manifest.sh` 후 `docs/PUSH_BLOCK_MANIFEST.md` 참고.

검증 명령:

```bash
bash scripts/verify-push-block-artifacts.sh
# 또는
shasum -a 256 /Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-05-19.bundle
shasum -a 256 /Users/a0/kakao-frontend/0001-feat-chat-composer-multi-request-pipeline-and-conver.patch
shasum -a 256 /Users/a0/kakao-frontend/0002-feat-backend-conversation-graph-API-and-pytest-for-C.patch
```

자동 검증 스크립트:

```bash
bash scripts/verify-push-block-artifacts.sh
```

통합 로컬 워크플로(검증 + 회귀테스트):

```bash
bash scripts/run-push-block-local-workflow.sh
```

push 진단/재시도 자동화:

```bash
bash scripts/retry-push-with-diagnostics.sh
```

상태 리포트 자동 생성:

```bash
bash scripts/generate-push-block-status-report.sh
```

생성 파일:

- `docs/PUSH_BLOCK_STATUS.md`

매니페스트 자동 생성(아티팩트/커밋 스냅샷):

```bash
bash scripts/generate-push-block-manifest.sh
```

생성 파일:

- `docs/PUSH_BLOCK_MANIFEST.md`

전체 점검 오케스트레이션:

```bash
npm run maintain:push-block
# 또는
make maintain-push-block
# 또는
bash scripts/run-push-block-maintenance.sh
```

동작 순서:

1. 아티팩트 무결성 검증
2. 로컬 회귀 테스트
3. 원격 push 진단
4. 상태/매니페스트 리포트 생성

### 반영 방법 A: bundle 사용 (권장)

```bash
git fetch /Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-05-19.bundle dev-continue-2026-01-20
git checkout -b dev-continue-2026-01-20 FETCH_HEAD
git push -u origin dev-continue-2026-01-20
```

### 반영 방법 B: patch 사용 (2커밋)

```bash
git am /Users/a0/kakao-frontend/0001-feat-chat-composer-multi-request-pipeline-and-conver.patch
git am /Users/a0/kakao-frontend/0002-feat-backend-conversation-graph-API-and-pytest-for-C.patch
```

### 로컬 회귀 검증

사이드바·컴포저 관련 변경 검증:

```bash
npm run test:sidebar-context
npm run verify:composer-pipeline
npm run verify:conversation-graph
# 또는
make test-sidebar-context
bash scripts/test-sidebar-context.sh
bash scripts/test-composer-pipeline.sh
# E2E 컴포저 — 서버 선기동: npm run test:e2e:composer-pipeline:all · 자동 기동: npm run test:e2e:composer-pipeline:ci:all
```

한 번에(아티팩트 검증 + 위 Jest):

```bash
bash scripts/run-push-block-local-workflow.sh
```

### push 재시도 조건

아래 중 하나가 충족되면 즉시 push 가능:

1. 정확한 대상 저장소 URL 확정 (`https://github.com/<owner>/<repo>`)
2. 대상 저장소에 `k2000kor-bot` 계정 write 권한 부여 및 초대 수락 완료

재시도 명령:

```bash
# 저장소가 아직 없으면: docs/PUSH_NEW_REPO_SETUP.md
PUSH_REMOTE_URL=git@github.com:<owner>/<repo>.git bash scripts/push-dev-continue-branch.sh
# 또는
git remote set-url origin git@github.com:<owner>/<repo>.git
git push -u origin dev-continue-2026-01-20
```
