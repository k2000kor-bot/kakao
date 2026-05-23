# Styles

## 파일

| 파일 | 용도 |
|------|------|
| **theme.css** | CSS 변수(색·폰트·간격), 라이트/다크 테마 |
| **brainwave-global.css** | bw-detail-*, bw-flex-*, bw-page-input-dock 등 공통 클래스 |
| **themeColors.ts** | CHART_COLORS, getStatusColor, getQualityScoreColor 등 |
| **responsive.css** | 반응형 breakpoint |

## 참조

- **디자인 기준**: [Figma Brainwave AI UI Kit](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m)
- **BRAINWAVE_DESIGN.md** — 디자인 토큰·일관성
- [docs/BRAINWAVE-UI.md](../../docs/BRAINWAVE-UI.md)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

