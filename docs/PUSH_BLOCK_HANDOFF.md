## Push Block Handoff

원격 권한/경로 문제로 `git push`가 막힌 상태에서, 동일 변경을 다른 환경으로 안전하게 이관하기 위한 문서입니다.

### 현재 로컬 상태

- 브랜치: `dev-continue-2026-01-20`
- 최신 커밋: `b096f399bf020707f3001f1037e7309fbb4164d1`
- 커밋 메시지: `test: harden sidebar context filter sync contracts`

### 생성된 이관 아티팩트

- Bundle: `/Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-01-20.bundle`
- Patch: `/Users/a0/kakao-frontend/0001-test-harden-sidebar-context-filter-sync-contracts.patch`

### SHA256 검증값

- `27e1411a1d9462fbcfc04f7dfe4614c38eb593d9e9ae104be7328e215e2767e2`  (`kakao-frontend-dev-continue-2026-01-20.bundle`)
- `ed0abc7ea4ce04271371f1734a2863a5f332277d6c828178a448705a79960f38`  (`0001-test-harden-sidebar-context-filter-sync-contracts.patch`)

검증 명령:

```bash
shasum -a 256 /Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-01-20.bundle
shasum -a 256 /Users/a0/kakao-frontend/0001-test-harden-sidebar-context-filter-sync-contracts.patch
```

자동 검증 스크립트:

```bash
bash scripts/verify-push-block-artifacts.sh
```

통합 로컬 워크플로(검증 + 회귀테스트):

```bash
bash scripts/run-push-block-local-workflow.sh
```

### 반영 방법 A: bundle 사용 (권장)

```bash
git fetch /Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-01-20.bundle dev-continue-2026-01-20
git checkout -b dev-continue-2026-01-20 FETCH_HEAD
```

### 반영 방법 B: patch 사용

```bash
git am /Users/a0/kakao-frontend/0001-test-harden-sidebar-context-filter-sync-contracts.patch
```

### 로컬 회귀 검증

사이드바 컨텍스트 관련 변경 검증은 아래 스크립트로 반복 실행:

```bash
bash scripts/test-sidebar-context.sh
```

### push 재시도 조건

아래 중 하나가 충족되면 즉시 push 가능:

1. 정확한 대상 저장소 URL 확정 (`https://github.com/<owner>/<repo>`)
2. 대상 저장소에 `k2000kor-bot` 계정 write 권한 부여 및 초대 수락 완료

재시도 명령:

```bash
git remote set-url origin git@github.com:<owner>/<repo>.git
git push -u origin HEAD
```
