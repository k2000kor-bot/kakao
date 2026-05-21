# PR 생성 (1분)

저장소: **https://github.com/k2000kor-bot/kakao**  
브랜치: `dev-continue-2026-01-20` → `main` (177 commits, histories diverged — PR은 생성 가능)

## 자동 (macOS)

```bash
npm run pr:create
```

브라우저에 **제목·본문이 채워진** PR 폼이 열립니다 → **Create pull request** 클릭.

직접 링크:

https://github.com/k2000kor-bot/kakao/compare/main...dev-continue-2026-01-20?expand=1&quick_pull=1

## 설정 참고

- GitHub **default branch**가 `dev-continue-2026-01-20`로 되어 있음 → PR은 여전히 **base: `main`**, **compare: `dev-continue-2026-01-20`** 로 만드세요.
- merge 충돌은 PR 생성 **후** 해결해도 됩니다 (`main`과 히스토리가 갈라져 있음).
- API 자동 생성: `export GITHUB_TOKEN=<k2000kor-bot PAT>` 후 `npm run pr:create`

## PR 후

- Actions/CI 확인
- merge 전 `npm run ship:preflight` 로컬 재확인 (선택)
