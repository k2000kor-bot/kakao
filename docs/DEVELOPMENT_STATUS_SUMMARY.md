# 전체 개발 내역 요약 — 진행 vs 미진행

**기준일**: 2026-03-05  
**참고**: [BACKLOG.md](./BACKLOG.md), [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md), [DEVELOPMENT_SCOPE_MASTER.md](./DEVELOPMENT_SCOPE_MASTER.md), [SCOPE_3X.md](./SCOPE_3X.md), [REMAINING_WORK_ESTIMATE.md](./REMAINING_WORK_ESTIMATE.md)

---

## 1. 한 줄 요약

| 구분 | 상태 |
|------|------|
| **배포·마무리 필수** | ✅ **100% 완료** (verify:completion·deploy:check 통과 시 배포 가능) |
| **핵심 기능·품질** | ✅ **완료** (대화·프로젝트·TTS·노트북 LLM·의도 감지·사이드바·라우트) |
| **선택 품질·단기** | 🔄 **약 10~15% 미진행** (성능 유지·UX·a11y·PWA 검증·웹검색 실연 등) |
| **확장 범위 전체** | 🔄 **약 50%+ 미진행** (P4·P5 확장 55개 영역 중 대부분 로드맵·미구현) |

---

## 2. 진행된 것 (완료)

### 2.1 우선순위별 완료

| 우선순위 | 작업 | 상태 |
|----------|------|------|
| **P0** | 린터 에러 제거 | ✅ 완료 |
| **P1** | 프론트 타입 오류 정리(tsc) | ✅ 완료 |
| **P2** | E2E 테스트 실행·검증 | ✅ 62→69 tests 통과(chromium) |
| **P2** | 성능·접근성 | ✅ Lighthouse Perf 90, A11y 91, LCP 3.0s |
| **P2** | PWA 검증 | ✅ pwa.spec 3 pass 2 skip, sw·manifest |
| **P3** | 린터 경고 정리 | ✅ lint:strict 0 경고 |
| **P4** | 테스트 커버리지 50% | ✅ Stmts 61%, Lines 62% (목표 충족) |
| **P4** | P4 서비스 테스트 | ✅ 8 suites, 148 tests |
| **P5** | sqlite3 DeprecationWarning | ✅ (선택) 문서화·대응 |

### 2.2 기능·영역 완료

- **통합 앱**: AppUnified, 대화(/), 프로젝트(/projects), 목소리 생성(/voice-generation), 사이드바(CORBU.AI 로고·검색·새대화·새프로젝트·프로젝트 리스트·도구 목소리·대화 리스트)
- **AI Workspace 마무리**: Minimal UI 4영역, 의도 감지·도구 실행(project_create 등), workspace_tool_result·프론트 반영
- **대화·노트북 LLM**: 질문 답변·대화 맥락·projectKnowledge·답변 다양성·딥시크 연동
- **프로젝트**: 파일 업로드(POST /api/projects/{id}/files), 공유(?share=), 프로젝트별 통계(AnalyticsView)
- **확장 뷰**: 도구 뷰 10개 실 API 연동, test:views 20 suites 105 tests, 도구 뷰 서비스 10 suites 45 tests
- **검증**: verify:completion(타입·린트·P4 148), deploy:check(빌드 성공), test:views 105
- **문서**: DEVELOPMENT_COMPLETION_STATUS, COMPLETION_CHECKLIST, BACKLOG, LOCAL_ACCESS_GUIDE 등 유지

---

## 3. 미진행 것 (안 된 것)

### 3.1 단기·선택 (약 10~15% 미진행)

| 영역 | 내용 | 비고 |
|------|------|------|
| 성능 | Lighthouse Perf 92+ 유지·LCP 재측정 | 현재 90 달성, 3배 목표는 92+ |
| UX | 로딩·에러·토스트 일관화 점검, 온보딩 보강 | DESIGN_CONSISTENCY_REPORT §6 |
| 접근성 | axe-core·스크린 리더 검증 | Lighthouse a11y 91, 95+ 목표 미달 |
| PWA | 푸시 알림 스텁·권한 UI 등 세부 | 기본 sw·오프라인 완료 |
| 웹 검색 | DuckDuckGo 등 실 API 연동 | 문서화·시뮬 완료, 실연 미구현 |
| E2E | 로그인·노트북 전체 플로우 | 69 pass 있음, 핵심 플로우 일부만 |
| 테스트 | 미커버 구간(AdvancedFeaturesPanel·qwenTts 등) | 50% 목표는 충족 |

### 3.2 중기 (약 20~30% 미진행)

| 영역 | 내용 |
|------|------|
| NotebookLM | Drive 연동 스텁→실연, 분석 대시보드 보강 |
| 분석·리포팅 | 프로젝트별 통계·차트·리포팅 확장 |
| CI/CD | 자동화 파이프라인·스테이징·모니터링 |
| 문서화·온보딩 | 사용자 가이드·비디오·퀵스타트 |
| 품질 확장 | 부하 테스트·보안 스캔·벤치마크 |
| 오프라인·동기화 | PWA 오프라인 전략·배경 동기화 |
| 테스트 파일 typecheck | 테스트 파일 ts 타입 점진 수정 |

### 3.3 확장 범위 (BACKLOG 테이블·P4·P5) — 약 50%+ 미진행

BACKLOG §확장 범위 테이블 기준 **55개 행** 중, **구독(1개) 제외** → **54개 영역**.  
이 중 **완료·일부 완료**는 약 **20개 내외**, **미진행·로드맵**은 **약 34개+**.

| 우선순위 | 미진행 예시 | 개수(대략) |
|----------|-------------|------------|
| **P2** | 성능 92+·UX·a11y 95+·웹검색 실연 | 5 |
| **P3** | NotebookLM·분석 확장·문서화 | 3 |
| **P4** | CI/CD·오프라인·통합 API·협업·보안·알림·데이터·검색·템플릿·피드백·API 관리·관찰성·AI 품질·버전·자동화 등 | **약 25** |
| **P5** | 에이전트·개발자 생태계·화이트라벨·엔터프라이즈·멀티테넌시·배포 옵션·음성·비디오·교육·A/B·게이미피케이션·데이터 레지던시·파트너·윤리·엣지 AI·업종별·지속가능성·오픈소스·멀티에이전트 등 | **약 21** |

---

## 4. 안 된 것 몇 %인지

| 기준 | 완료(진행) | 미진행(안 됨) | 비고 |
|------|------------|----------------|
| **배포 필수** | **100%** | **0%** | deploy:check 통과 시 배포 가능 |
| **핵심 기능·품질** | **100%** | **0%** | COMPLETION_CHECKLIST §2 기준 |
| **단기 선택(1~2주)** | **약 85~90%** | **약 10~15%** | 성능 유지·UX·a11y·웹검색 실연 등 |
| **중기(2~4주)** | **약 20~30%** | **약 70~80%** | NotebookLM·CI/CD·문서화 등 |
| **확장 범위 전체(54개 영역)** | **약 35~40%** | **약 60~65%** | P4·P5 대부분 미구현·로드맵 |
| **SCOPE_3X 단기 21개** | **약 14개 완료** | **약 7개** | 성능·UX·a11y·PWA·웹검색·E2E·테스트 세부 |
| **SCOPE_3X 중기 18개** | **약 4개** | **약 14개** | NotebookLM·분석·CI/CD·문서화 등 |
| **SCOPE_3X 확장 110+** | **소수** | **대부분** | 110+ 항목 중 대부분 장기 로드맵 |

**요약**  
- **“배포·마무리”** 기준: 안 된 것 **0%**.  
- **“단기 선택”** 기준: 안 된 것 **약 10~15%**.  
- **“확장 범위 전체”**를 100%로 보면: 안 된 것 **약 60~65%** (P4·P5·중기 대부분).

---

## 5. 다음 권장 액션

1. **배포**: `npm run deploy:check` 통과 후 build/ 배포 ([FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md)).
2. **선택 품질**: `npm run test:coverage`, E2E `E2E_SERVER_READY=1 npx playwright test --project=chromium`, Lighthouse 재측정.
3. **확장**: BACKLOG·SCOPE_3X·DEVELOPMENT_SCOPE_MASTER 우선순위에 따라 P4→P5 순으로 진행.

이 문서는 BACKLOG·COMPLETION_CHECKLIST·REMAINING_WORK_ESTIMATE·SCOPE_3X를 종합한 요약입니다.
