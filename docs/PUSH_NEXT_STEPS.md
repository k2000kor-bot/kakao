# Push / PR 다음 단계 (dev-continue-2026-01-20)

현재 로컬 **HEAD**: `npm run pr:composer-graph-url` 로 확인.

## 상태 요약

| 항목 | 결과 |
|------|------|
| Handoff bundle | `npm run verify:handoff-artifacts` 통과 |
| 관계도 유닛 | `npm run verify:conversation-graph:unit` 통과 |
| SSH | `k2000kor-bot` 인증 OK |
| Push | `k2000kor/kakao` — **Write 거부** (Collaborator 필요) |

## A. 같은 저장소에 push (권장)

1. https://github.com/k2000kor/kakao/settings/access → **Invite collaborator**  
2. `k2000kor-bot` → **Write** → 초대 수락  
3. 로컬:

```bash
npm run ship:preflight   # handoff + 유닛 + push 점검 (일괄)
```

4. push:

```bash
cd kakao-frontend
npm run refresh:handoff-artifacts
npm run check:push-ready
PUSH_REMOTE_URL=git@github.com:k2000kor/kakao.git npm run push:dev-continue
```

5. PR: `npm run pr:open-compare` · 본문: `npm run pr:copy-body`

## B. 새 저장소에 push

[ PUSH_NEW_REPO_SETUP.md](./PUSH_NEW_REPO_SETUP.md) 참고.

```bash
PUSH_REMOTE_URL=git@github.com:<owner>/<new-repo>.git npm run push:dev-continue
```

## C. Push 없이 이관

```bash
# bundle (브랜치 전체)
git clone /Users/a0/kakao-frontend/kakao-frontend-dev-continue-2026-05-19.bundle kakao-import
cd kakao-import && git checkout dev-continue-2026-01-20

# 또는 패치 시리즈 (39개)
bash scripts/apply-dev-continue-patches.sh /Users/a0/kakao-frontend/patches-dev-continue-2026-05-19

# 관계도 답변 기능만 (1~4커밋)
npm run export:graph-answer-patches
# handoff·문서 포함 시:
GRAPH_PATCH_END=HEAD npm run export:graph-answer-patches
```

## 검증 (이관·push 전)

```bash
npm run ship:release-check          # handoff + tsc + pre-deploy + push 점검 (권장)
npm run ship:preflight              # handoff + 관계도 유닛 + push 점검
npm run verify:pre-deploy           # sidebar + composer + 관계도 unit (~1분)
npm run verify:composer-pipeline    # 컴포저 147 tests
npm run handoff:info                # bundle SHA·경로 요약
# 서버 :3000 기동 후
npm run test:e2e:conversation-graph:chromium
```

**SSH (변경 불필요)**: `~/.ssh/kakao_frontend_ed25519` → `k2000kor-bot` 인증은 **정상**입니다. 막힌 것은 **저장소 쓰기 권한**뿐입니다 → 아래 Collaborator로 `k2000kor-bot`에 Write 부여 후 동일 설정으로 push.

관련: [PR_COMPOSER_GRAPH_DRAFT.md](./PR_COMPOSER_GRAPH_DRAFT.md) · [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) · [CONVERSATION_GRAPH.md](./CONVERSATION_GRAPH.md)
