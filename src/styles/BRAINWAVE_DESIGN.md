# Brainwave AI UI Kit — 디자인 가이드

**Figma**: [Brainwave AI UI Kit](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit?node-id=323-168775&m=dev)

## 토큰 (theme.css)

### 색상
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary` — 배경
- `--text-primary`, `--text-secondary`, `--text-tertiary` — 텍스트
- `--accent-info` (#0084FF), `--accent-primary` (#3FDD78), `--accent-error` — 강조
- `--on-accent` — 강조 배경 위 텍스트

### 간격
- `--spacing-xs` (4px) ~ `--spacing-4xl` (40px)

### 모서리
- `--radius-sm` (4px) ~ `--radius-full` (9999px)

### 그림자
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-modal`

### 브레이크포인트
- `--breakpoint-sm`: 480px
- `--breakpoint-md`: 768px
- `--breakpoint-lg`: 1024px
- `--breakpoint-xl`: 1280px

## 공통 클래스 (brainwave-global.css)

| 클래스 | 용도 |
|--------|------|
| `.bw-btn-primary` | 주요 버튼 |
| `.bw-btn-secondary` | 보조 버튼 |
| `.bw-btn-ghost` | 투명 버튼 |
| `.bw-btn-danger` | 위험/삭제 버튼 |
| `.bw-input` | 입력 필드 |
| `.bw-select` | 셀렉트 |
| `.bw-toast-success` | 성공 토스트 |
| `.bw-card` | 카드 컨테이너 |
| `.bw-error-fallback` | 에러 화면 |
| `.bw-fieldset-reset` | 필드셋 기본 스타일 제거 |

## 접근성
- 포커스 시 `:focus-visible` + `--focus-ring` 사용
- `prefers-reduced-motion` 대응 (애니메이션 최소화)

## 반응형
- `@media (max-width: var(--breakpoint-xl))` — 1280px
- `@media (max-width: var(--breakpoint-lg))` — 1024px
- `@media (max-width: var(--breakpoint-tablet))` — 960px
- `@media (max-width: var(--breakpoint-tablet-sm))` — 900px
- `@media (max-width: var(--breakpoint-md))` — 768px
- `@media (max-width: var(--breakpoint-mobile))` — 640px
- `@media (max-width: var(--breakpoint-sm))` — 480px

## 접근성 — 터치 타겟
- `--touch-target-min: 44px` — WCAG 2.5.5 최소 터치 영역
- `--touch-target: 48px` — 권장 터치 영역

## 아이콘·요소 크기
- `--icon-size-sm` 16px / `--icon-size-md` 20px / `--icon-size-lg` 32px / `--icon-size-xl` 40px

## 콘텐츠·레이아웃
- `--content-max-2xs` 360px / `--content-max-xs` 480px / `--content-max-md` 600px / `--content-max-lg` 800px / `--content-max-xl` 1200px
- `--content-max-form` 700px / `--content-max-dashboard` 1400px / `--content-max-dialog-sm` 380px
- `--grid-min-sm` 200px / `--grid-min-xs` 120px / `--grid-min-xs-sm` 150px

## 세로 높이
- `--content-height-xs` 60px / `--content-height-sm` 72px / `--content-height-input` 80px / `--content-height-md` 100px
- `--content-max-height-sm` 150px / `--content-max-height-md` 200px / `--content-max-height-lg` 300px / `--content-max-height-xl` 400px / `--content-max-height-2xl` 600px

## 기타
- `--spacing-2xs` 6px / `--icon-size-2xs` 8px
- `--border-width` 1px / `--border-width-md` 2px / `--border-width-lg` 3px / `--border-width-xl` 4px
- `--button-min` 52px / `--dropdown-min` 140px
- `--panel-width` 400px / `--panel-sidebar-width` 350px / `--modal-width` 500px / `--modal-height` 600px

## transform 오프셋
- `--transform-lift-xs` -1px / `--transform-lift-sm` -2px (hover lift)

## 애니메이션
- `--animation-duration-fast` 0.8s / `--animation-duration-base` 1s / `--animation-duration-slow` 1.5s / `--animation-duration-typing` 1.4s / `--animation-duration-pulse` 2s
- `--blur-sm` 2px / `--blur-md` 4px / `--blur-lg` 10px (backdrop-filter)
- `--letter-spacing-subtle` 0.5px
- `--sr-only-size` 1px / `--sr-only-offset` -1px (스크린리더 전용)

## 쉬머 (LoadingSkeleton, LazyImage)
- `--shimmer-size` 200px / `--shimmer-step` 40px

## z-index 레이어
- `--z-base` 10 / `--z-dropdown` 100 / `--z-panel` 1000 / `--z-modal-backdrop` 2000 / `--z-modal` 2001 / `--z-settings` 2500 / `--z-toast` 10000 / `--z-popover` 10001
