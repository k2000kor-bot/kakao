# 개발 범위 마스터 (Development Scope Master)

**프로젝트**: kakao-frontend (CORBU.AI)  
**최종 갱신**: 2026-03-03 (개발 범위 3배 확장 목표 반영 — [SCOPE_3X.md](./SCOPE_3X.md))  
**이전**: 2026-02-14 7차 확장 — 윤리·엣지 AI·업종별·지속가능성·커뮤니티·멀티에이전트  
**목적**: 개발 범위·단계·검증 기준을 한곳에서 완벽하게 관리하는 기준 문서

**프론트 회귀·원격 push**: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `test:routes`·`test:app-unified`·**`test:sidebar-context`**. 원격 `git push` 막힘 — [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md).

### 개발 범위 3배 확장 (2026-03-03)

- **정의**: [SCOPE_3X.md](./SCOPE_3X.md) — 단기 21개·중기 18개·확장 110+ 항목, 검증 목표(E2E 120+, 커버리지 60% 등) 3배 확대.
- **장기 로드맵(개발 길게 진행)**: 동일 문서 §7·§8 — 2차 3배(단기 63·중기 54·확장 495 수준), 12~24개월 타임라인. E2E 360+, test:views 540+, 커버리지 70% 목표.
- **적용**: 본 문서(DEVELOPMENT_SCOPE_MASTER)의 단계·확장 비전은 유지하고, 3배 확장 시 **SCOPE_3X**의 항목·검증 목표·장기 타임라인을 추가 참조.

### 개발 제외 (2026-03-03)

- **구독**: 결제·플랜·사용량 제한·PRO·/billing 기능 확장은 **개발 범위에서 제외**합니다. 기존 BillingView·라우트·도구 메뉴 노출은 유지하며, 신규 구독·결제 개발은 진행하지 않습니다.

---

## 1. 비전·목표

### 1.1 제품 비전

| 구분 | 내용 |
|------|------|
| **제품** | CORBU.AI — AI 기반 통합 플랫폼 |
| **핵심 가치** | CORBU.AI, 프로젝트 기반 노트북 LLM, 멀티모달(음성·이미지·TTS) |
| **디자인 기준** | Brainwave AI UI Kit (Figma node 7-3, 323-168775) 단일 소스 |
| **기술 스택** | React 19 + TypeScript, FastAPI/Flask 백엔드, Redux, theme.css |

### 1.2 완성 정의 (핵심)

- **기능**: CORBU.AI·간단 대화·고급 기능(TTS·이미지·음성·예측)·노트북 LLM이 AppUnified 한 진입점에서 동작. 프로젝트 참고 파일 업로드(POST /api/projects/{id}/files, ProjectEditModal·대화 맥락 반영) 완료 — COMPLETION_CHECKLIST §2, BACKLOG 85~94차. 라우트·메뉴(첫 메뉴 "CORBU.AI", 프로젝트·대화 분리) BACKLOG 102~115차.
- **품질**: `npm run dev:check` 통과 (백엔드 125 + 타입 + lint:strict)
- **디자인**: theme.css·brainwave-global.css 토큰만 사용, Figma 스펙 준수
- **문서**: DEVELOPMENT, BACKLOG, BRAINWAVE-UI, TTS 가이드, USAGE_GUIDE·메뉴얼(상세·빠른 참조·QUICK_START), COMPONENT_ARCHITECTURE, DEVELOPMENT_CONTINUITY(경로·컴포넌트 매핑·기능 추가 체크리스트), 본 문서 유지

### 1.3 확장 비전 (Extended Scope)

| 영역 | 확장 목표 | 단계 |
|------|-----------|------|
| **NotebookLM** | Deep Research·웹 검색·Drive 연동·분석 대시보드·PRO | Phase 3~5 |
| **품질** | 성능·UX·접근성 전면 점검, E2E 40+ passed | 2~3단계 |
| **플랫폼** | PWA 검증·모바일 최적화·반응형 | 3단계 |
| **인프라** | CI/CD·스테이징·모니터링·로깅 | 4단계 |
| **기능 확장** | 에이전트·플러그인·국제화·보안 | 4~5단계 |
| **분석·리포팅** | 대시보드·사용 통계·내보내기·차트 | 3~4단계 |
| **통합·API** | 외부 API·웹훅·OAuth·서드파티 연동 | 4~5단계 |
| **오프라인·동기화** | 오프라인 캐시·배경 동기화·충돌 해결 | 4단계 |
| **개발자 생태계** | 공개 API·SDK·플러그인 마켓플레이스 | 5단계 |
| **협업·소셜** | 실시간 협업·팀·공유·댓글 | 4~5단계 |
| **구독·모네타이징** | PRO·플랜·결제·사용량 제한 | **제외** (개발 안 함) |
| **AI/ML 고급** | RAG 고도화·커스텀 모델·파인튜닝 | 5~6단계 |
| **보안·컴플라이언스** | 감사 로그·암호화·GDPR·규제 준수 | 4단계 |
| **알림·커뮤니케이션** | 푸시·이메일·슬랙/디스코드 연동 | 4단계 |
| **데이터·스토리지** | 백업·복구·마이그레이션·데이터 포터빌리티 | 4~5단계 |
| **테스트·품질 확장** | 부하 테스트·보안 스캔·성능 벤치마크 | 3~4단계 |
| **문서화·온보딩** | 사용자 가이드·API 문서·비디오 튜토리얼 | 3~4단계 |
| **엔터프라이즈** | SSO·SAML·LDAP·조직·승인 워크플로우 | 5~6단계 |
| **화이트라벨·커스터마이징** | 브랜딩·커스텀 도메인·테마 | 5단계 |
| **버전·이력** | 변경 이력·롤백·포크·버전 비교 | 4~5단계 |
| **검색·디스커버리** | 전역 검색·권장·태깅·필터 | 4단계 |
| **멀티테넌시** | 워크스페이스·조직 분리 | 5~6단계 |
| **배포 옵션** | 온프레미스·에어갭·하이브리드 | 5~6단계 |
| **음성·비디오** | 화상·라이브 스트리밍·음성 채널 | 5~6단계 |
| **교육·학습** | 학습 경로·인증·코스·튜토리얼 | 5단계 |
| **템플릿·스니펫** | 재사용 템플릿·프롬프트 라이브러리 | 4~5단계 |
| **A/B 테스트·실험** | 기능 플래그·실험 플랫폼 | 5단계 |
| **게이미피케이션** | 포인트·배지·리더보드 | 5~6단계 |
| **피드백·NPS** | 사용자 피드백·NPS·이슈 수집 | 4단계 |
| **데이터 레지던시** | 지역별 데이터·로컬 규제·지역화 | 5~6단계 |
| **파트너·리셀러** | 파트너 API·리셀러 채널 | 6단계 |
| **AI 품질·안전** | 콘텐츠 모더레이션·환각 감지·안전 필터 | 4~5단계 |
| **자동화·워크플로우** | 노코드/로코드 자동화·워크플로우 빌더 | 5~6단계 |
| **고객 성공** | 헬스 스코어·사용 현황·체크인 | 5단계 |
| **API 관리** | 레이트 리밋·API 버전·쿼터 | 4~5단계 |
| **관찰성·모니터링** | 추적·메트릭·알림·대시보드 | 4단계 |
| **멀티모달 생성** | 이미지·비디오·코드 생성 | 5~6단계 |
| **윤리·AI 거버넌스** | 윤리 가이드라인·책임·투명성 | 5~6단계 |
| **엣지 AI** | 로컬 추론·엣지 배포 | 6단계 |
| **업종별 솔루션** | 의료·금융·법률·소매 등 | 6단계 |
| **전문 분야 지식** | 도시정비법·세무·회계·금융·법률·건축·서울시 행정·민사·형사·국세 등, 딥러닝·노트북 LLM 연동 | 3~5단계 |
| **지속가능성** | 탄소·에너지 효율·ESG | 5~6단계 |
| **오픈소스·커뮤니티** | OSS 기여·포럼·지식 공유 | 5~6단계 |
| **라이선스·콘텐츠** | 저작권·라이선스 관리 | 5단계 |
| **멀티에이전트 오케스트레이션** | 에이전트 협업·오케스트레이션 | 6단계 |

---

## 2. 아키텍처·도메인

### 2.1 전체 구조

```
kakao-frontend/
├── src/                    # React 프론트엔드
│   ├── index.tsx           # 진입점
│   ├── AppUnified.tsx      # 통합 레이아웃
│   ├── components/         # UI 컴포넌트
│   ├── services/           # API·비즈니스 로직
│   ├── styles/             # theme.css, brainwave-global.css
│   ├── hooks/              # React 훅
│   ├── store/              # Redux
│   └── views/              # 라우트별 뷰
├── backend/                # Python 백엔드
│   ├── main_server.py      # FastAPI 통합 서버
│   ├── api/                # API 라우터
│   └── tests/              # pytest
├── e2e/                    # Playwright E2E
└── docs/                   # 문서 (본 문서 포함)
```

### 2.2 라우팅·화면 (3분할: 일반 대화·프로젝트·프로젝트 · 대화)

상세 컴포넌트 매핑: [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md)

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | ChatGPTInterface | 대화: 질문·요구 입력 시 검색·분석·예측 등 기능으로 답변 |
| `/projects` | ProjectsPage | 프로젝트 목록·생성·관리 |
| `/projects/:id` | ChatGPTInterface | 프로젝트 · 대화: 노트북 LLM·파일 분석·AI 문서 생성 |
| `/voice-generation` | VoiceGenerationView | 목소리 생성 (TTS) 전용 화면 |
| `/settings` | SettingsView | 설정: 테마·알림·정보 (도구 메뉴) |
| `/analytics` | AnalyticsView | 분석: 사용 통계·대시보드 플레이스홀더 (도구 메뉴) |
| `/docs` | DocsView | 도움말: 가이드·문서 링크·단축키 (도구 메뉴) |
| `/templates` | TemplatesView | 템플릿·프롬프트 라이브러리 (도구 메뉴, GET /api/templates/summary) |
| `/search` | SearchView | 전역 검색·디스커버리 (도구 메뉴, GET /api/search/summary) |
| `/integrations` | IntegrationsView | 연동·API·웹훅 (도구 메뉴, 플레이스홀더) |
| `/team` | TeamView | 팀·멤버·권한 (도구 메뉴, GET /api/team/summary) |
| `/learn` | LearnView | 학습·코스·튜토리얼 (도구 메뉴, GET /api/learn/summary) |
| `/billing` | BillingView | 구독·플랜·결제 (도구 메뉴, GET /api/billing/summary) |
| `/workspace` | WorkspaceView | 워크스페이스·조직 (도구 메뉴, GET /api/workspace/summary) |
| `/automation` | AutomationView | 워크플로우·자동화 빌더 (도구 메뉴, GET /automation/status·/workflows) |
| `/community` | CommunityView | 커뮤니티·포럼·지식 공유 (도구 메뉴, GET /api/community/summary) |
| `*` | NotFoundPage | 404 |

**확장 뷰 검증**: 도구 메뉴 12개 뷰는 `bw-detail-section`·`bw-features-card`로 구조 통일되어 있으며, 유닛 테스트(h1+h2)·E2E(뷰+h2)·config/routes 테스트(getPageTitle·allAppPaths)로 회귀 방지. [views/README.md](../src/views/README.md) §확장 뷰 검증.

**확장 뷰 작업 완료 요약**: 도구 뷰 10개 모두 실 API 연동 완료. Analytics·Integrations·Automation + Search·Templates·Team·Learn·Workspace·Community·Billing (GET /api/*/summary, extended_views_api). `npm run test:views`로 뷰+라우트 일괄 검증. **다음 권장**: P2(성능 90+·접근성·PWA), extended_views_api 실 데이터 — [BACKLOG.md](BACKLOG.md).

### 2.3 도메인 영역

| 도메인 | 포함 항목 | 상태 |
|--------|-----------|------|
| **대화** | ChatGPTInterface, SimpleChatView, 메시지·스트리밍 | ✅ 완료 |
| **프로젝트** | CRUD, 노트북 소스·세션·컨텍스트 | ✅ 완료 |
| **TTS** | Qwen TTS, gTTS 폴백, 프로젝트 보이스·감정 프리셋 | ✅ 완료 |
| **노트북 LLM** | generate/stream, 딥러닝 연동, YouTube 학습 | ✅ 완료 |
| **고급 기능** | 이미지 분석, 음성 인식, 예측 분석, 목소리 생성 | ✅ 완료 |
| **디자인** | Brainwave theme, Figma 토큰, 반응형 | ✅ 완료 |
| **NotebookLM 확장** | Deep Research, 웹/Fast Research, Drive 연동, 분석 대시보드 | 🔄 부분 |
| **PWA·모바일** | manifest, service worker, 터치·반응형 | 🔄 부분 |
| **실시간 웹 검색** | DuckDuckGo·web-research API 연동 | 🔄 검증 필요 |
| **품질·인프라** | 성능·UX·a11y·CI/CD·스테이징 | ⬜ 확장 범위 |
| **분석·리포팅** | 대시보드·통계·차트·내보내기·프로젝트별 통계·CSV | ✅ 완료 |
| **통합·API** | 외부 API·웹훅·OAuth | ⬜ 확장 범위 |
| **오프라인·동기화** | PWA 오프라인·배경 동기화 | ⬜ 확장 범위 |
| **협업·소셜** | 실시간 협업·팀·공유·댓글 | ⬜ 확장 범위 |
| **구독·모네타이징** | PRO·플랜·결제·사용량 | ⬜ **제외** (개발 안 함) |
| **보안·컴플라이언스** | 감사 로그·암호화·규제 | ⬜ 확장 범위 |
| **알림·커뮤니케이션** | 푸시·이메일·슬랙 연동 | ⬜ 확장 범위 |
| **데이터·스토리지** | 백업·복구·마이그레이션 | ⬜ 확장 범위 |
| **버전·이력** | 변경 이력·롤백·포크 | ⬜ 확장 범위 |
| **검색·디스커버리** | 전역 검색·권장·태깅 | ⬜ 확장 범위 |
| **엔터프라이즈** | SSO·SAML·조직·승인 | ⬜ 확장 범위 |
| **화이트라벨** | 브랜딩·커스텀 도메인 | ⬜ 확장 범위 |
| **템플릿·스니펫** | 프롬프트·템플릿 라이브러리 | ⬜ 확장 범위 |
| **피드백·NPS** | 사용자 피드백·NPS | ⬜ 확장 범위 |
| **AI 품질·안전** | 모더레이션·환각 감지 | ⬜ 확장 범위 |
| **자동화·워크플로우** | 노코드 자동화 | ⬜ 확장 범위 |
| **윤리·거버넌스** | AI 윤리·책임·투명성 | ⬜ 확장 범위 |
| **업종별** | 의료·금융·법률 등 | ⬜ 확장 범위 |
| **전문 분야 지식** | 도시정비·세무·회계·금융·법률·건축·서울시 행정·민사·형사·국세 | 🔄 8개 도메인 구축, 보강 중 |

---

## 3. 개발 단계 (타임라인)

### 3.1 1단계 — 즉시 (완료 수준 유지)

| 항목 | 검증 | 담당 |
|------|------|------|
| dev:check 통과 | `npm run dev:check` | CI·개발자 |
| TTS 252+11 | `npm run test:tts:all` | TTS 변경 시 |
| P4 서비스 132 | `npm run test:p4:services` | 서비스 변경 시 |
| lint:strict | `npm run lint:strict` | 커밋 전 |

### 3.2 2단계 — 단기 (1~2주)

| 우선순위 | 작업 | 목표 | 검증 |
|----------|------|------|------|
| **P3** | 린터 경고·any 점진 정리 | 코드 일관성 | lint:strict, typecheck |
| **P2** | E2E 스킵 해제·핵심 플로우 | 17→40+ passed | `npm run test:e2e` |
| **P2** | 성능·UX·a11y 1차 점검 | Lighthouse·키보드 탐색·로딩 | 수치·체크리스트 |
| **P4** | 테스트 커버리지 50% | Statements/Branches | `npm run test:coverage` |
| **확장** | PWA·실시간 웹 검색 검증 | 동작 확인·문서 정리 | 수동·E2E |

### 3.3 3단계 — 중기 (1~2개월)

| 영역 | 작업 | 목표 |
|------|------|------|
| **성능** | 번들 분석·LCP·메모리 프로파일·코드 스플리팅 | Lighthouse 90+ |
| **UX** | 로딩·에러 안내·토스트 일관화·온보딩 | 사용자 만족도 |
| **접근성** | 스크린 리더·키보드·ARIA·포커스 관리 | WCAG 2.1 AA |
| **모바일** | 터치·반응형·PWA 오프라인·설치 프롬프트 | 모바일 사용성 |
| **NotebookLM** | Drive 연동·분석 대시보드·PRO 스텁 실현 | NOTEBOOKLM_FEATURE_ROADMAP |

### 3.4 4단계 — 장기 (3개월~)

| 영역 | 작업 | 비고 |
|------|------|------|
| **기능** | 멀티모달 확장·에이전트·플러그인 | 로드맵 |
| **인프라** | CI/CD·스테이징·모니터링·로깅 | 배포 파이프라인 |
| **국제화** | i18n·다국어 | 필요 시 |
| **보안** | 인증·권한·감사 로그·암호화·GDPR | 엔터프라이즈 |
| **협업** | 팀·멤버·권한·실시간 협업 | /team |
| **구독** | PRO·플랜·결제·사용량 제한 | **제외** (/billing 뷰만 유지) |
| **알림** | 푸시·이메일·슬랙/디스코드 | 확장 |
| **데이터** | 백업·복구·마이그레이션 | 확장 |
| **품질** | 부하 테스트·보안 스캔·벤치마크 | 확장 |
| **AI 품질** | 모더레이션·환각 감지·안전 필터 | 확장 |
| **API 관리** | 레이트 리밋·버전·쿼터 | 확장 |
| **관찰성** | 추적·메트릭·알림 | 확장 |

### 3.5 5단계 — 장기 확장 (6개월~)

| 영역 | 작업 | 비고 |
|------|------|------|
| **AI 확장** | 에이전트·멀티에이전트 협업 | 로드맵 |
| **플러그인** | 확장 포인트·서드파티 연동 | 아키텍처 설계 |
| **규모** | 스케일링·캐싱·CDN | 인프라 |
| **통합** | 웹훅·OAuth·외부 API 게이트웨이 | 엔터프라이즈 |
| **분석** | 프로젝트별 통계·사용 패턴·리포팅 | 데이터 인사이트 |
| **버전·이력** | 변경 이력·롤백·포크 | 확장 |
| **검색** | 전역 검색·권장·태깅 | /search |
| **화이트라벨** | 브랜딩·커스텀 도메인·테마 | 확장 |
| **템플릿** | 프롬프트·템플릿 라이브러리 | /templates |
| **피드백** | 사용자 피드백·NPS | 확장 |

### 3.6 6단계 — 생태계·플랫폼 (12개월~)

| 영역 | 작업 | 비고 |
|------|------|------|
| **개발자** | 공개 API·SDK·플러그인 마켓플레이스 | 생태계 |
| **국제화** | i18n·다국어·지역화 | 글로벌 |
| **모바일 앱** | React Native·Capacitor 등 | 네이티브 |
| **AI/ML 고급** | RAG 고도화·커스텀 모델·파인튜닝 | AI 확장 |
| **엔터프라이즈** | SSO·SAML·LDAP·조직·승인 워크플로우 | 엔터프라이즈 |
| **멀티테넌시** | 워크스페이스·조직 분리 | /workspace |
| **배포** | 온프레미스·에어갭·하이브리드 | 배포 옵션 |
| **음성·비디오** | 화상·라이브 스트리밍 | 멀티모달 |
| **교육** | 학습 경로·코스·인증 | /learn |
| **템플릿** | 프롬프트 라이브러리 | /templates |
| **실험** | A/B 테스트·기능 플래그 | 확장 |
| **게이미피케이션** | 포인트·배지·리더보드 | 확장 |
| **데이터 레지던시** | 지역별·로컬 규제 | 확장 |
| **파트너** | 파트너 API·리셀러 | 확장 |
| **엣지 AI** | 로컬 추론·엣지 배포 | 확장 |
| **업종별** | 의료·금융·법률 | 확장 |
| **지속가능성** | 탄소·에너지·ESG | 확장 |
| **커뮤니티** | OSS·포럼 (/community) | 확장 |
| **멀티에이전트** | 오케스트레이션 | 확장 |
| **자동화** | 워크플로우 빌더 | /automation |
| **고객 성공** | 헬스 스코어·체크인 | 확장 |
| **멀티모달 생성** | 이미지·비디오·코드 생성 | 확장 |
| **윤리·거버넌스** | AI 윤리·책임·투명성 | 확장 |
| **라이선스** | 저작권·콘텐츠 관리 | 확장 |

---

## 4. 기능 범위 (상세)

### 4.1 CORBU.AI

| 기능 | 상태 | API·의존성 |
|------|------|------------|
| 환영 화면·캡빌리티 칩 | ✅ | theme.css |
| 프로젝트 선택·대화 분리 | ✅ | Redux, /api/projects |
| 메시지 전송·스트리밍 | ✅ | /api/chat, NDJSON |
| 음성으로 읽기 (TTS) | ✅ | Qwen TTS, 브라우저 폴백 |
| 노트북 LLM 전환 | ✅ | 프로젝트 · 대화(/projects/:id) |
| 목소리 생성 모달 | ✅ | /api/tts/* |
| 대화 내보내기 (MD/HTML/JSON) | ✅ | 클라이언트 |

### 4.2 노트북 LLM

| 기능 | 상태 | API |
|------|------|-----|
| 프로젝트별 컨텍스트 | ✅ | /api/projects/{id}/notebook-context |
| generate/stream | ✅ | POST notebook-llm/generate, stream |
| 딥러닝 연동 | ✅ | 의도·감정·주제 분석 |
| YouTube 특정인 검색 후 학습 | ✅ | from-youtube-search |
| 보이스 소스 등록 | ✅ | /api/projects/{id}/voice-sources |

### 4.3 목소리 생성 (TTS)

| 기능 | 상태 | 비고 |
|------|------|------|
| URL 직접 입력 | ✅ | YouTube/TikTok |
| 프로젝트 보이스 | ✅ | 등록된 보이스 소스 |
| 상황만 선택 | ✅ | 나레이션·뉴스 등 |
| 감정 프리셋 (7종) | ✅ | Typecast 벤치마크 |
| 구간별 속도 | ✅ | 0.25~4x |
| gTTS 폴백 | ✅ | QWEN_TTS_BASE_URL 미설정 시 |

### 4.4 고급 기능 패널

| 탭 | 기능 | 상태 |
|----|------|------|
| 이미지 | 분석·감정·객체 검출 | ✅ |
| 음성 | 인식·실시간 | ✅ |
| 예측 | 메시지 품질·활동 예측 | ✅ |
| 목소리 생성 | TTS 전체 플로우 | ✅ |

### 4.5 NotebookLM 확장 (NOTEBOOKLM_FEATURE_ROADMAP)

| 기능 | 상태 | Phase |
|------|------|-------|
| Deep Research·웹/Fast Research | ✅ 구현 | Phase 3 |
| 분석 대시보드·소스 요약·키워드 | ✅ | Phase 3 |
| 공유·설정·내 노트북/추천 탭 | ✅ | Phase 4 |
| Drive 연동 | ⬜ 스텁 | Phase 4 |
| PRO/사용자 프로필 | ⬜ 스텁 | Phase 5 |

### 4.6 PWA·모바일

| 항목 | 상태 | 비고 |
|------|------|------|
| manifest.json | ✅ | theme-color, 아이콘 |
| Service Worker | 🔄 | pwaService 존재, 검증 필요 |
| 터치·반응형 | 🔄 | 일부 적용 |
| 오프라인·설치 프롬프트 | ⬜ | 확장 범위 |

### 4.7 실시간 웹 검색·Deep Research

| 항목 | 상태 | 비고 |
|------|------|------|
| WebResearchModal·DeepResearchModal | ✅ | web-research API |
| DuckDuckGo·실시간 검색 | 🔄 | [WEB_SEARCH_AND_RESEARCH.md](./WEB_SEARCH_AND_RESEARCH.md) — 시뮬레이션만 존재, 실제 API 연동 미구현 |
| 소스 후보 → 노트북 추가 | ✅ | Phase 3 |

### 4.8 분석·리포팅 (확장)

| 항목 | 상태 | 비고 |
|------|------|------|
| AnalyticsDashboard·RealtimeAnalyticsDashboard | ✅ | 기존 구현 |
| 프로젝트별 사용 통계 | ⬜ | 확장 범위 |
| 내보내기 (MD/HTML/JSON) | ✅ | 대화 내보내기 |
| 차트·시각화 | 🔄 | themeColors·Recharts 연동 |

### 4.9 통합·API·오프라인 (확장)

| 항목 | 상태 | 비고 |
|------|------|------|
| 공개 API·문서 | 🔄 | /api/docs Swagger |
| 웹훅·OAuth | ⬜ | 확장 범위 |
| PWA 오프라인 캐시 | ⬜ | service worker 검증 |
| 배경 동기화 | ⬜ | 확장 범위 |
| SDK·플러그인 API | ⬜ | 5단계 |

### 4.10 협업·보안 (확장, 구독 제외)

| 항목 | 상태 | 비고 |
|------|------|------|
| 프로젝트 공유·ProjectShareDialog | ✅ | Phase 4 |
| 실시간 협업·커서 표시 | ⬜ | 확장 범위 |
| 팀·멤버·권한 | ⬜ | /team |
| PRO·구독·플랜·결제 | ⬜ **제외** | /billing (뷰만 유지) |
| 사용량 제한·쿼터 | ⬜ | 확장 범위 |
| 감사 로그·암호화·GDPR | ⬜ | 확장 범위 |

### 4.11 알림·데이터·문서화 (확장)

| 항목 | 상태 | 비고 |
|------|------|------|
| 알림 시스템 (기존) | ✅ | NotificationSystem |
| 푸시·이메일·슬랙 연동 | ⬜ | 확장 범위 |
| 백업·복구·마이그레이션 | ⬜ | 확장 범위 |
| 사용자 가이드·온보딩 | ⬜ | /docs |
| API 문서·비디오 튜토리얼 | 🔄 | /api/docs Swagger 존재 |

### 4.12 버전·검색·엔터프라이즈 (확장)

| 항목 | 상태 | 비고 |
|------|------|------|
| 변경 이력·롤백·포크 | ⬜ | 프로젝트·대화 버전 |
| 전역 검색·태깅·필터 | ⬜ | /search |
| SSO·SAML·LDAP | ⬜ | 엔터프라이즈 인증 |
| 조직·승인 워크플로우 | ⬜ | 엔터프라이즈 |
| 워크스페이스·멀티테넌시 | ⬜ | /workspace |
| 화이트라벨·브랜딩 | ⬜ | 커스텀 도메인·테마 |
| 온프레미스·에어갭 배포 | ⬜ | 배포 옵션 |
| 화상·라이브 스트리밍 | ⬜ | 음성·비디오 확장 |

### 4.13 교육·템플릿·실험·피드백 (확장)

| 항목 | 상태 | 비고 |
|------|------|------|
| 학습 경로·코스·인증 | ⬜ | /learn |
| 프롬프트·템플릿 라이브러리 | ⬜ | /templates |
| 기능 플래그·A/B 테스트 | ⬜ | 실험 플랫폼 |
| 포인트·배지·리더보드 | ⬜ | 게이미피케이션 |
| 사용자 피드백·NPS | ⬜ | 피드백 수집 |
| 데이터 레지던시·지역 규제 | ⬜ | GDPR·로컬화 |
| 파트너 API·리셀러 | ⬜ | 6단계 |

### 4.14 AI 품질·자동화·관찰성 (확장)

| 항목 | 상태 | 비고 |
|------|------|------|
| 콘텐츠 모더레이션·환각 감지 | ⬜ | AI 품질·안전 |
| 안전 필터·유해 콘텐츠 차단 | ⬜ | AI 안전 |
| 노코드/로코드 워크플로우 빌더 | ⬜ | /automation |
| 헬스 스코어·사용 현황·체크인 | ⬜ | 고객 성공 |
| API 레이트 리밋·버전·쿼터 | ⬜ | API 관리 |
| 추적·메트릭·알림·대시보드 | 🔄 | 기존 모니터링 확장 |
| 이미지·비디오·코드 생성 | ⬜ | 멀티모달 생성 |

### 4.15 전문 분야 지식 (도시정비·세무·법률·건축·서울시 등)

| 항목 | 상태 | 비고 |
|------|------|------|
| 도시정비법·재개축·재개발 | ✅ | 8개 도메인 (NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST) |
| 세무·회계·금융·국세 | ✅ | 세무·금융 도메인 |
| 변호사·법무·민사·형사·계약 | 🔄 | 법무 도메인, 형사·계약 보강 |
| 감정평가·건축법 | 🔄 | 도시정비·국토부, 건축법 분리 보강 |
| 서울시 행정·조례 | ⬜ | 신규 도메인 |
| 딥러닝·노트북 LLM 질문 맞춤 생성 | 🔄 | notebookLLMDeepLearningIntegration, 요구 맞춤 강화 |

**참고**: [DOMAIN_EXPERTISE_ROADMAP.md](./DOMAIN_EXPERTISE_ROADMAP.md)

### 4.16 윤리·업종별·미래 기술 (확장)

| 항목 | 상태 | 비고 |
|------|------|------|
| AI 윤리·거버넌스·투명성 | ⬜ | 책임·설명 가능성 |
| 엣지 AI·로컬 추론 | ⬜ | 엣지 배포 |
| 업종별: 의료·금융·법률·소매 | ⬜ | HIPAA·규제 등 |
| 지속가능성·ESG·탄소 | ⬜ | 에너지 효율 |
| 오픈소스·커뮤니티·포럼 | ⬜ | /community |
| 라이선스·저작권 관리 | ⬜ | 콘텐츠 권리 |
| 멀티에이전트 오케스트레이션 | ⬜ | 에이전트 협업 |

---

## 5. 품질·테스트 범위

### 5.1 테스트 피라미드

| 레벨 | 도구 | 목표 | 명령 |
|------|------|------|------|
| **단위** | Jest, RTL | 컴포넌트·서비스·훅 | `npm test` |
| **통합** | pytest | API·비즈니스 로직 | `npm run test:backend` |
| **E2E** | Playwright | 핵심 사용자 플로우 | `npm run test:e2e` |

### 5.2 검증 기준

| 기준 | 수치 | 명령 |
|------|------|------|
| 백엔드 | 125+ passed | `npm run test:backend` |
| TTS | 252+11 | `npm run test:tts:all` |
| P4 서비스 | 132 (7 suites) | `npm run test:p4:services` |
| 타입 | 0 errors | `npm run typecheck` |
| 린트 | 0 errors, 0 warnings | `npm run lint:strict` |
| 커버리지 | 50%+ (목표) | `npm run test:coverage` |

### 5.3 테스트 대상 우선순위

1. **필수**: ChatGPTInterface, AdvancedFeaturesPanel, projectService, qwenTtsService, notebookLLMService
2. **권장**: AppUnified, SimpleChatView, NotebookLLM, Redux slices
3. **선택**: 기타 컴포넌트·서비스

---

## 6. 디자인·UI 범위

### 6.1 Figma 기준

- **단일 소스**: [Brainwave AI UI Kit node 7-3](https://www.figma.com/design/9ZrEa3dcS8zb0O6Nr5lT8m/Brainwave-AI-UI-Kit?node-id=7-3&m=dev)
- **토큰**: `src/styles/theme.css`
- **전역 클래스**: `src/styles/brainwave-global.css` (.bw-*)
- **Primary Blue**: `--accent-info-figma` (#3478F6)

### 6.2 적용 원칙

- 새 컴포넌트: theme 변수·`.bw-*`만 사용
- 하드코딩 금지: `#hex`, `rgb(...)` (theme 정의 제외), Tailwind 색상 클래스
- 참조: [BRAINWAVE-UI.md](./BRAINWAVE-UI.md)

---

## 7. 인프라·운영 범위

### 7.1 개발 환경

| 항목 | 값 | 비고 |
|------|-----|------|
| 프론트 포트 | 3000 | `npm start` |
| 백엔드 포트 | 5002 | API_BASE_URL |
| API 문서 | /api/docs | FastAPI Swagger |

### 7.2 스크립트

| 목적 | 명령 |
|------|------|
| 전체 시작 | `./start_all.sh` |
| dev 점검 | `npm run dev:check` |
| 빌드 | `npm run build` |
| E2E | `npm run test:e2e` |

### 7.3 문서 체계

| 문서 | 용도 |
|------|------|
| **DEVELOPMENT.md** | 일상 개발 흐름, 스크립트 |
| **BACKLOG.md** | 작업 목록·우선순위 |
| **BRAINWAVE-UI.md** | Figma·theme·디자인 |
| **COMPLETION_CHECKLIST.md** | 완성 검증·미진 항목 |
| **DEVELOPMENT_STATUS_CURRENT.md** | 현재 완료 수준 |
| **본 문서** | 개발 범위·단계·기준 통합 |

---

## 8. 의사결정·우선순위

### 8.1 우선순위 정의

| 등급 | 의미 | 예시 |
|------|------|------|
| **P0** | 블로커·즉시 해결 | CI 실패, 빌드 깨짐 |
| **P1** | 단기 내 해결 | 타입 오류, 린트 에러 |
| **P2** | 2주 이내 | E2E 검증 |
| **P3** | 1개월 이내 | 린터 경고, any 정리 |
| **P4** | 장기 | 커버리지 50%, 성능 |

### 8.2 변경 영향 범위

| 변경 영역 | 영향 | 점검 항목 |
|-----------|------|-----------|
| API 스펙 | 프론트·백엔드 | test:backend, API.md |
| theme.css | 전역 UI | 시각적 회귀 |
| ChatGPTInterface | 대화 핵심 | E2E, dev:check |
| Redux·store | 상태 관리 | 테스트·타입 |

---

## 9. 다음 액션 (권장 순서)

### 9.1 즉시

1. **지금**: `npm run dev:check` 실행 → 통과 확인
2. **이번 주**: E2E 스킵 24개 중 환경 문제 아닌 스펙 해제

### 9.2 단기 (1~2주)

3. **다음 주**: `npm run test:coverage`로 미커버 구간 확인 → 테스트 추가
4. **성능·UX·a11y 1차**: Lighthouse 실행, 키보드만으로 목소리 생성 탭 조작 테스트
5. **PWA·웹 검색 검증**: manifest·service worker 동작 확인, 실시간 웹 검색 연동 상태 문서화

### 9.3 중기 (1~2개월)

6. **성능 전면**: 번들 분석·LCP·메모리 프로파일
7. **접근성 전면**: 스크린 리더·ARIA·포커스 관리 점검
8. **NotebookLM Drive**: Drive 연동 스텁 → 실제 연동 또는 명확한 로드맵
9. **분석·리포팅**: 프로젝트별 사용 통계·차트 통합

### 9.4 장기 (4~6개월)

10. **오프라인·동기화**: PWA 오프라인 캐시·배경 동기화
11. **통합·API**: 웹훅·OAuth·/integrations 화면
12. **에이전트·플러그인**: 확장 포인트·아키텍처 설계

### 9.5 장기 확장 (4~6개월)

13. **협업**: 팀·권한 (/team). 구독(/billing)은 개발 제외.
14. **보안·알림**: 감사 로그·푸시·이메일·슬랙 연동
15. **데이터**: 백업·복구·마이그레이션
16. **품질 확장**: 부하 테스트·보안 스캔·벤치마크
17. **문서화**: 사용자 가이드·온보딩·비디오 튜토리얼 (/docs)

### 9.6 확장 (5~6개월)

18. **버전·검색**: 변경 이력·롤백·전역 검색·태깅 (/search)
19. **화이트라벨**: 브랜딩·커스텀 도메인·테마

### 9.7 생태계·엔터프라이즈 (12개월~)

20. **개발자**: 공개 API·SDK·플러그인 마켓플레이스
21. **국제화·모바일**: i18n·React Native/Capacitor 검토
22. **AI/ML 고급**: RAG 고도화·커스텀 모델·파인튜닝
23. **엔터프라이즈**: SSO·SAML·LDAP·조직·승인
24. **멀티테넌시**: 워크스페이스·조직 분리 (/workspace)
25. **배포**: 온프레미스·에어갭·하이브리드
26. **음성·비디오**: 화상·라이브 스트리밍

### 9.8 확장 2 (6~12개월)

27. **교육·템플릿**: 학습 경로·코스 (/learn), 프롬프트 라이브러리 (/templates)
28. **실험·게이미피케이션**: A/B 테스트·기능 플래그·포인트·배지
29. **피드백**: 사용자 피드백·NPS 수집
30. **데이터 레지던시·파트너**: 지역별 데이터·파트너 API·리셀러

### 9.9 확장 3 (6~12개월)

31. **AI 품질·안전**: 모더레이션·환각 감지·안전 필터
32. **자동화·워크플로우**: 노코드 워크플로우 빌더 (/automation)
33. **고객 성공**: 헬스 스코어·사용 현황·체크인
34. **API 관리·관찰성**: 레이트 리밋·추적·메트릭
35. **멀티모달 생성**: 이미지·비디오·코드 생성

### 9.10 장기 비전 (12개월~)

36. **윤리·거버넌스**: AI 윤리·책임·투명성
37. **엣지 AI·업종별**: 로컬 추론·의료·금융·법률
38. **지속가능성·커뮤니티**: ESG·OSS·포럼 (/community)
39. **멀티에이전트**: 오케스트레이션·협업

---

## 10. 연관 문서 링크

| 문서 | 경로 |
|------|------|
| 전문 분야 지식 | [DOMAIN_EXPERTISE_ROADMAP.md](./DOMAIN_EXPERTISE_ROADMAP.md) |
| 개발 가이드 | [DEVELOPMENT.md](../DEVELOPMENT.md) |
| 백로그 | [BACKLOG.md](./BACKLOG.md) |
| 완성 체크리스트 | [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) |
| 현재 상태 | [DEVELOPMENT_STATUS_CURRENT.md](./DEVELOPMENT_STATUS_CURRENT.md) |
| 디자인 | [BRAINWAVE-UI.md](./BRAINWAVE-UI.md) |
| NotebookLM 로드맵 | [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) |
| TTS 가이드 | [guides/TTS_AND_SCRIPT_STYLE_GUIDE.md](./guides/TTS_AND_SCRIPT_STYLE_GUIDE.md) |
| API 문서 | [API.md](./API.md) |
| 테스트 가이드 | [TESTING_GUIDE.md](../TESTING_GUIDE.md) |
| 성능·품질 | [PERFORMANCE.md](./PERFORMANCE.md) |
| AGENTS | [AGENTS.md](../AGENTS.md) |

---

*본 문서는 개발 범위의 단일 기준 문서입니다. 변경 시 BACKLOG·COMPLETION_CHECKLIST와 동기화하세요.*
