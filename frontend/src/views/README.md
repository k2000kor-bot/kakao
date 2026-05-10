# Views (라우트별 뷰)

AppUnified 라우트에 매핑되는 페이지 컴포넌트.

**대화 입력**: `SimpleChatView` 등 메시지 전송·검색어는 **`chatInputUtils.coerceTrimmedString`** / **`coerceTrimmedEnd`** — [utils/README.md](../utils/README.md), [guides/RESPONSE_CLEANING.md](../../docs/guides/RESPONSE_CLEANING.md).

## 활성 뷰

| 파일 | 경로 | 설명 |
|------|------|------|
| ChatGPTInterface | `/`, `/projects/:id` | components에 있음, 라우트에서 직접 사용 |
| ProjectsPage | `/projects` | ProjectHub + ProjectEditModal. 테스트: ProjectsPage.test.tsx (7: 로딩·목록·스켈레톤·클릭·생성 성공/실패) |
| VoiceGenerationView | `/voice-generation` | AdvancedFeaturesPanel(voiceGen) |
| SettingsView | `/settings` | 설정: 테마·알림·정보. 테스트: SettingsView.test.tsx |
| AnalyticsView | `/analytics` | 분석: 사용 통계(API)·프로젝트별 통계(세션·메시지·소스·BarChart)·대시보드·내보내기. GET /api/integrated/analytics, GET /api/projects/{id}/analytics. 테스트: AnalyticsView.test.tsx |
| DocsView | `/docs` | 도움말: 가이드·문서·단축키·문제 해결 섹션(카드). 테스트: DocsView.test.tsx |
| TemplatesView | `/templates` | 템플릿: 라이브러리·카테고리·즐겨찾기. GET /api/templates/summary. |
| SearchView | `/search` | 검색: 전역·최근·추천. GET /api/search/summary. |
| IntegrationsView | `/integrations` | 연동: 웹훅·OAuth·알림. GET /api/integrated/health (integrationsViewService). |
| TeamView | `/team` | 팀: 멤버·권한·협업. GET /api/team/summary. |
| LearnView | `/learn` | 학습: 경로·튜토리얼·인증. GET /api/learn/summary. |
| BillingView | `/billing` | 구독: 플랜·결제·사용량. GET /api/billing/summary. |
| WorkspaceView | `/workspace` | 워크스페이스: 목록·조직·리소스. GET /api/workspace/summary. |
| AutomationView | `/automation` | 자동화: 빌더·트리거·이력. GET /automation/status·/workflows. automationViewService. |
| CommunityView | `/community` | 커뮤니티: 포럼·지식 공유·OSS. GET /api/community/summary. |
| DevStatusView | `/dev-status` | 개발 현황: "이걸 뭐 하려는 거야?", 프론트 변경 사항(문서 목록 CHAT_ANSWER_FLOW_VERIFICATION 등)·검증·배포(20 suites·105 tests). 사이드바 더 보기→개발 현황. 테스트: DevStatusView.test.tsx(섹션·문서 목록 포함 검증) |

## 도구 뷰 레이아웃

도구 뷰(설정·분석·도움말 등)는 `bw-tool-view` + `bw-tool-view-body` 구조. 헤더 고정, 본문 섹션 스크롤. brainwave-global.css §bw-tool-view.

## 확장 뷰 검증 (도구 메뉴 12개)

- **유닛 테스트**: 각 뷰 `*.test.tsx`에서 h1 페이지 제목 + 첫 섹션 h2 제목 검증. (SettingsView·DocsView는 테마/가이드·문서·단축키 등 추가 검증.)
- **E2E**: `e2e/example.spec.ts`에서 확장 경로 접근 후 `data-testid="*-view"` 및 해당 뷰 첫 섹션 h2 표시 검증.
- **라우트**: `src/config/routes.ts`·`getPageTitle`·`allAppPaths`, `src/config/__tests__/routes.test.ts`에서 확장 경로 12개 제목·경로 포함 검증.
- **도구 뷰 데이터 연동**: **AnalyticsView**·**IntegrationsView**·**AutomationView**·**SearchView**·**TemplatesView**·**TeamView**·**LearnView**·**WorkspaceView**·**CommunityView**·**BillingView** 모두 실 API(GET /api/*/summary). 백엔드 extended_views_api 목데이터 반환, 실패 시 프론트 폴백. (Settings·Docs는 실사용/가이드.)
- **도구 뷰 서비스 테스트**: analyticsViewService·automationViewService·integrationsViewService·billingViewService·communityViewService·workspaceViewService·teamViewService·learnViewService·searchViewService·templatesViewService — 10 suites, 45 tests (success·data 없음 엣지 케이스 포함). `npm run test -- --testPathPattern=ViewService --watchAll=false` 또는 `npm run test:views:services`(해당 스크립트 있을 때).

**검증 명령**: `npm run test:routes` (**27** — 라우트만) · `npm run test:app-unified` (**115** — `AppUnified` 셸·리다이렉트, 수 초대) · `npm run test:sidebar-context` (사이드바·설정·대화 이력 묶음) · `npm run test:views` (20 suites, 105 tests — 뷰 유닛 + 라우트) · `npm test -- --testPathPattern=ViewService --watchAll=false` (10 suites, 45 tests) · `npm run test -- src/views` (뷰만) · `E2E_SERVER_READY=1 npx playwright test e2e/example.spec.ts` (E2E, 서버 선실행 시). 원격 push 막힘: [docs/PUSH_BLOCK_HANDOFF.md](../../docs/PUSH_BLOCK_HANDOFF.md).

## 도구 뷰 API (구현 완료)

백엔드 extended_views_api에서 아래 엔드포인트 제공. WorkspaceView·TemplatesView·SearchView(프로젝트명→recentQueries)는 프로젝트 데이터 기반 실 데이터. Team·Learn·Community·Billing은 목데이터(팀/학습/포럼/구독 DB 추가 시 교체).

| 뷰 | 엔드포인트 | 응답 data |
|----|-----------------|-----------|
| SearchView | GET /api/search/summary | `{ searchTarget, recentQueries }` |
| TemplatesView | GET /api/templates/summary | `{ categories[], favoritesCount }` |
| TeamView | GET /api/team/summary | `{ memberCount, role }` |
| LearnView | GET /api/learn/summary | `{ progressPercent, completedCourses }` |
| WorkspaceView | GET /api/workspace/summary | `{ workspaceCount, currentName }` |
| CommunityView | GET /api/community/summary | `{ topicCount, recentPostLabel }` |
| BillingView | GET /api/billing/summary | `{ currentPlan, nextBillingDate }` |

## 기타

- **FeaturesMapView**, **SimpleChatView** — 구버전·리다이렉트 경로에서 사용되거나 별도 진입
- **NotFoundPage** — 404 (AppUnified에서 정의)

경로 상수: `src/config/routes.ts`, `e2e/paths.ts`. 상세: [docs/COMPONENT_ARCHITECTURE.md](../../docs/COMPONENT_ARCHITECTURE.md), [docs/DEVELOPMENT_SCOPE_MASTER.md](../../docs/DEVELOPMENT_SCOPE_MASTER.md).

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../../../docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../../../docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../../../docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

