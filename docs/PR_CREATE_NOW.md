# PR 생성 (1분)

저장소: **https://github.com/k2000kor-bot/kakao**  
브랜치: `dev-continue-2026-01-20` → `main` (177 commits, histories diverged — PR은 생성 가능)

## A. GitHub Actions (클릭 1번, PAT 불필요)

**저장소 설정 (필수 — 없으면 Actions PR 생성 불가):**  
https://github.com/k2000kor-bot/kakao/settings/actions  

- Workflow permissions → **Read and write permissions**  
- ✅ **Allow GitHub Actions to create and approve pull requests** → **Save**

(미설정 시 에러: `GitHub Actions is not permitted to create or approve pull requests` — [Issue #1](https://github.com/k2000kor-bot/kakao/issues/1))

1. https://github.com/k2000kor-bot/kakao/actions/workflows/create-pr-to-main.yml
2. **Run workflow** → **Run workflow** (브랜치 `dev-continue-2026-01-20`)
3. 완료 후 Summary 탭에 PR URL 표시 (실패 시 Settings 위 항목 확인)

```bash
npm run pr:open-actions
```

## B. 브라우저 수동 (macOS)

```bash
npm run pr:open-new    # PR 새로 만들기 (base=main, head=dev-continue)
npm run pr:create      # 위 + 제목·본문 pre-fill(compare URL)
npm run pr:copy-body   # 본문만 클립보드
```

1. 열린 페이지에서 **base: `main`** · **compare: `dev-continue-2026-01-20`** 확인  
2. 제목·본문 붙여넣기 (`docs/PR_COMPOSER_GRAPH_DRAFT.md`)  
3. **Create pull request** 클릭

직접 링크:

- https://github.com/k2000kor-bot/kakao/pull/new?base=main&head=dev-continue-2026-01-20
- https://github.com/k2000kor-bot/kakao/compare/main...dev-continue-2026-01-20?expand=1&quick_pull=1

## 설정 참고

- GitHub **default branch**가 `dev-continue-2026-01-20`로 되어 있음 → PR은 여전히 **base: `main`**, **compare: `dev-continue-2026-01-20`** 로 만드세요.
- merge 충돌은 PR 생성 **후** 해결해도 됩니다 (`main`과 히스토리가 갈라져 있음).
- 로컬 API: `export GITHUB_TOKEN=<k2000kor-bot PAT>` → `npm run pr:create`
- Actions: Secrets → **`KAKAO_BOT_PAT`** (동일 PAT) 후 Run workflow

## C. PR 없이 main 동기화 (주의)

```bash
CONFIRM=1 npm run promote:main
```

`main` ← `dev-continue-2026-01-20` tip (force-with-lease). PR·리뷰 없이 반영할 때만.

## PR 후

- Actions/CI 확인
- merge 전 `npm run ship:preflight` 로컬 재확인 (선택)
