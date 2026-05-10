# 성능·품질 가이드

프론트엔드 성능 점검과 번들 분석 방법을 정리합니다. 확장 범위는 [DEVELOPMENT_SCOPE_MASTER.md](./DEVELOPMENT_SCOPE_MASTER.md) 및 [BACKLOG.md](./BACKLOG.md)를 참고하세요.

**프론트 회귀·원격 push**: 저장소 루트에서 `npm run test:sidebar-context` — [../TESTING_GUIDE.md](../TESTING_GUIDE.md) · 원격 push는 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md).

---

## 1. 검증 명령 (일상)

| 목적 | 명령 |
|------|------|
| 마무리 검증 (한 번에) | `npm run verify:completion` |
| 전체 점검 | `npm run dev:check` (백엔드 144 + 타입 + lint:strict) |
| 프론트만 | `npm run dev:check:frontend` |
| 확장 뷰·라우트 유닛 | `npm run test:views` (20 suites, 105 tests — 뷰 + routes.test) |
| 사이드바·대화 맥락 회귀 | `npm run test:sidebar-context` |
| 빌드 검증 | `npm run build` |

---

## 2. 성능 1차 점검 (2단계 목표)

### 2.1 빌드 결과 (2026-02-26 기준)

| 파일 | gzip 크기 | 비고 |
|------|-----------|------|
| main.js | 117 kB | 메인 청크 (ChatGPTInterface lazy·NotebookLLM lazy 분리) |
| 633.chunk.js | 120 kB | MUI/Chart 등 |
| 981.chunk.js | 90 kB | NotebookLLM (lazy) |
| 662.chunk.js | 84 kB | 추가 청크 |
| main.css | 34 kB | 글로벌 스타일 |
| 42.chunk.js | 28 kB | 라우터 등 |
| 기타 청크 | ~12 kB | 255·453·469 등 |
| **총 JS gzip** | **~650 kB** | 코드 스플리팅 10+ 청크 |

### 2.2 Lighthouse

- **브라우저**: Chrome DevTools → Lighthouse 탭에서 Performance (및 Accessibility) 실행.
- **CLI** (서버 기동 후): `npx serve -s build -l 3000` 백그라운드 실행 후  
  `npm run lighthouse` 또는 `npx lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html --chrome-flags="--headless"`.

**Lighthouse 기준선 (2026-02-26, build/serve, ChatGPTInterface lazy)**:

| 항목 | 점수/값 | 상태 |
|------|---------|------|
| Performance | **90** | 목표 달성 |
| Accessibility | 91 | 양호 |
| Best Practices | 96 | 양호 |
| SEO | 100 | 양호 |
| LCP | 3.0 s | 개선 (main.js 396→117 kB) |

**개선 완료**: main.js 396→117 kB (ChatGPTInterface lazy). **단기 미진행 해소**: LCP 재측정, Perf 92+ 목표 — `./scripts/run-lighthouse.sh` (serve 기동 후 실행). §2.6 P2 검증 순서 참고.

**Perf 70→90 로드맵 (2026-02-20)**:
1. 메인 청크: `npm run analyze:bundle` 후 633.chunk(MUI/Chart) 트리 쉐이킹·지연 로딩 검토
2. FCP: critical CSS 인라인·초기 HTML 최소화 검토
3. LCP: LCP 요소(헤더·첫 블록) 이미지 `loading="lazy"`·`fetchpriority` 적용 검토
4. 3G throttling에서 재측정 후 변화 확인

**적용 (2026-02-20)**: Inter 폰트를 `preload as="style"` + `onload` 비블로킹 로드로 전환 — render-blocking 제거로 FCP 개선 기대. index.html 참고.

**적용 (2026-02-26)**: 폰트 preload에 `fetchpriority="high"` 추가 — LCP 요소(「CORBU.AI」 텍스트) 페인트 가속.

**적용 (2026-02-24)**: ChatGPTInterface에서 NotebookLLM을 `React.lazy`로 분리 — 노트북 탭 진입 시에만 청크 로드. Suspense fallback: LoadingSkeleton.

**적용 (2026-02-26)**: AppUnified에서 ChatGPTInterface를 `lazy`로 분리 — main.js 396→117 kB (약 70% 감소). 대화·프로젝트대화 라우트 진입 시 청크 108(132 kB) 로드.

**적용 (2026-02-26)**: ChatGPTInterface 내부 `ProjectEditModal`·`ProjectShareDialog`를 `React.lazy`로 분리 — 초기 대화 진입 시 모달 관련 청크(약 10~16 kB + CSS)는 필요 시점에 로드.

**Recharts 지연 로딩 (2026-02-20 검토)**: AnalyticsView는 AppUnified에서 `React.lazy`로 로드됨. Recharts는 AnalyticsView 청크에 포함되며 `/analytics` 방문 시에만 다운로드됨. 메인 번들에 Recharts 미포함 상태 유지.

### 2.3 번들 분석

- **사전**: `npm run build` 실행 후, `npm i -D source-map-explorer` 설치.
- **실행**: `npm run analyze:bundle`.  
  - `build/static/js/*.js`를 source-map-explorer로 분석해 `build/bundle-report.html` 생성. (react-scripts source map 호환: `--no-border-checks` 사용)
- **2026-02-20 청크**: main ~1.87MB, 633.chunk(MUI/Chart) ~521KB, 42.chunk(router) ~125KB. `build/bundle-report.html`에서 상세 트리맵 확인.
- **한 번에**: `npm run perf:analyze` — build + analyze:bundle 실행.

### 2.4 LCP·메모리

- **LCP**: Lighthouse 또는 `performance.getEntriesByType('largest-contentful-paint')`로 측정.
- **메모리**: Chrome DevTools → Memory 프로파일링 (장시간 사용 시 누수 확인).

### 2.5 접근성(a11y) — Lighthouse Accessibility

- **2026-02-20 기준선**: Accessibility **91** (Lighthouse, build/serve).
- **적용 완료**: AdvancedFeaturesPanel 탭 키보드(Arrow·Home·End)·ARIA, ErrorRecovery role="alert", LoadingStateIndicator, GlobalToast aria-live. DESIGN_CONSISTENCY_REPORT §6.
- **상세 검증 (단기 미진행)**: axe-core·스크린 리더 — E2E에서 `@axe-core/playwright` 사용 또는 Lighthouse Accessibility 재실행. 키보드만으로 대화·목소리 생성 탭 조작 가능 여부 수동 확인 권장.

---

## 2.6 P2 검증 실행 순서 (배포 전 권장)

배포·릴리스 전에 아래 순서로 한 번씩 실행하면 P2(성능·접근성·PWA) 검증을 마칠 수 있습니다.

| 순서 | 항목 | 명령 | 비고 |
|------|------|------|------|
| 1 | 품질·P4 | `npm run verify:completion` | 타입·린트·P4 148 tests |
| 2 | 확장 뷰·라우트 | `npm run test:views` | 20 suites, 105 tests (뷰 유닛 + routes.test) |
| 3 | 사이드바·대화 맥락 | `npm run test:sidebar-context` | [TESTING_GUIDE.md](../TESTING_GUIDE.md) |
| 4 | 도구 뷰 서비스 | `npm test -- --testPathPattern=ViewService --watchAll=false` 또는 `npm run test:views:services` | 10 suites, 45 tests |
| 5 | 빌드 | `npm run build` | build/ 생성 |
| 6 | Lighthouse | `npx serve -s build -l 3000` 백그라운드 후 `npm run lighthouse` | lighthouse-report.html 생성. §2.2 기준선 참고 |
| 7 | PWA E2E | `E2E_SERVER_READY=1 npx playwright test e2e/pwa.spec.ts --project=chromium` | 프론트 서버 기동 후 실행. PWA_VERIFICATION.md 참고 |

**한 번에 (1·2·4 자동)**: `npm run p2:check` 또는 `./scripts/run-p2-check.sh` — verify:completion + test:views + test:views:services 실행 후 5~7 단계 안내 출력. **3** `test:sidebar-context`는 별도 실행.

---

## 3. 품질 확장 (BACKLOG·확장 범위)

- **확장 뷰 검증 후**: `npm run test:views`·`npm run test:sidebar-context` 통과 확인한 뒤, Lighthouse(§2.2)·PWA(COMPLETION_CHECKLIST §3.3) 검증 권장.
- **성능 최적화**: 번들 분석·LCP·메모리 프로파일·코드 스플리팅 (3단계).
- **부하 테스트·보안 스캔·벤치마크**: 품질 확장 (3~4단계).

---

## 4. 연관 문서

| 문서 | 용도 |
|------|------|
| [DEVELOPMENT_SCOPE_MASTER.md](./DEVELOPMENT_SCOPE_MASTER.md) | 비전·단계·검증 기준 |
| [BACKLOG.md](./BACKLOG.md) | 성능·UX·a11y 작업 목록 |
| [DEVELOPMENT.md](../DEVELOPMENT.md) | 일상 개발·스크립트 |
| [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) | 완성 체크리스트·다음 액션 |
| [TESTING_GUIDE.md](../TESTING_GUIDE.md) | 테스트 구조·검증 명령 |
| [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) | 원격 `git push` 절차·차단 시 인수인계 |
| [PWA_VERIFICATION.md](./PWA_VERIFICATION.md) | PWA manifest·SW·검증 방법 |
| [WEB_SEARCH_AND_RESEARCH.md](./WEB_SEARCH_AND_RESEARCH.md) | 웹 검색·Deep Research 연동 상태 |
