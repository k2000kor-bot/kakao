# GitHub 저장소 생성 후 push (kakao-frontend 미존재 시)

`git push` 시 `Repository not found`가 나오면, GitHub에 **새 저장소**를 만든 뒤 아래를 실행합니다.

**현재 진단 (2026-05)**
- `k2000kor/kakao-frontend` — GitHub에 **없음** (`Repository not found`)
- `k2000kor/kakao` — 저장소는 있으나 `k2000kor-bot` SSH는 **push 거부** (`Permission denied`) → Collaborator Write 필요
- SSH 인증: `k2000kor-bot` — **성공**

## 1. GitHub에서 저장소 생성

1. https://github.com/new 접속 (로그인: `k2000kor` 또는 조직)
2. Repository name: 예) `kakao-frontend` 또는 `corbu-ai`
3. **Private** 권장 · README/license 추가 **하지 않음** (빈 저장소)
4. Create repository

## 2. Collaborator (SSH가 `k2000kor-bot`인 경우)

Settings → Collaborators → `k2000kor-bot` 초대 → **Write** 이상

## 3. push

```bash
cd kakao-frontend   # package.json 있는 루트

# URL을 본인 저장소에 맞게 수정
PUSH_REMOTE_URL=git@github.com:<owner>/<repo>.git \
  bash scripts/push-dev-continue-branch.sh
```

또는:

```bash
git remote set-url origin git@github.com:<owner>/<repo>.git
git push -u origin dev-continue-2026-01-20
```

## 4. PR

본문 초안: [PR_COMPOSER_GRAPH_DRAFT.md](./PR_COMPOSER_GRAPH_DRAFT.md)

## 5. push 없이 이관만 할 때

[ PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) — bundle / patch

```bash
bash scripts/verify-push-block-artifacts.sh
```
