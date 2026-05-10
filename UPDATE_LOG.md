# 업데이트 로그

**최신 업데이트**: 2026년 2월 12일

**문서·Jest·push handoff (2026-05-10)**: [TESTING_GUIDE.md](TESTING_GUIDE.md) — **`npm run test:routes`**·**`test:app-unified`**·**`test:sidebar-context`**. 원격 `git push` 막힘 — [docs/PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`maintain:push-block` 등).

---

## 🆕 최신 업데이트

### 전문 분야·도메인 지식 지속 보강 (2026-02-12)

**Phase 2 도메인 심화**:
- 도시정비: 조합분양·분담금·청산금·정비사업전문평가사
- 세무: 세무조사 대응·납부고지 절차
- 법무: 민사소송·형사소송·판례 검색
- 회계: 감가상각·처분손익·부동산 회계처리

**generateDomainInsights 확장**: 세무+회계, 도시정비+금융, 법무+계약 조합

**문서**: NOTEBOOK_LLM_DOMAIN_KNOWLEDGE_COMPLETE.md 15개 도메인·기능 현황 갱신

### 전문 분야·딥러닝·질문 맞춤 생성 강화 (2026-02-12)

**딥러닝 활용 심화**:
- `buildDLPromptEnhancement`: 복잡도·주제·긴급도에 따른 답변 지시 (단계별 상세·핵심 강조·결론 선제시)
- NotebookLLM: DL 분석 결과를 프롬프트에 반영

**전문가 관점 선택**:
- `EXPERT_VIEW_PATTERNS`: 변호사·세무사·감정평가사·회계사·법무사·중개사 관점 지시
- `buildResponseFormatInstructions`: 형식 패턴과 전문가 관점 패턴 병합 반환

**문서 갱신**:
- DOMAIN_EXPERTISE_ROADMAP: 15개 도메인 완료, 보강 목표 달성 상태 반영
- NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST: 15개 도메인, 추가 보강 완료 섹션

### 린트·테스트 수정 (2026-02-14)

**lint:strict 8건 해소**:
- ChatGPTInterface.test: waitFor 다중 assertion 분리, no-node-access (proBadge.closest → getByTitle)
- DeepResearchModal·WebResearchModal: container.firstChild → screen.queryByRole('dialog')
- ProjectShareDialog: waitFor 다중 assertion 분리, 삭제 확인 버튼 getByRole(/공유 링크 삭제 확인/)

**테스트 수정**:
- ChatGPTInterface.test: rehypeHighlightSearch 모킹 (unist-util-visit ESM 파싱 이슈 회피)
- ProjectShareDialog: getMultipleElementsFoundError 해결
- **추가 (6 suites, 141 tests)**:
  - SessionManager: window.confirm 제거 → 인라인 확인 모달 검증 (삭제/취소 버튼)
  - WritingAssistant: showToast 모킹, window.alert → mockShowToast (필수 필드·에러·클립보드 복사)
  - realTimeCollaborationService: errorLogger 모킹, console → mockErrorLogger*, leave/cursor_move 이벤트 리스너 검증
  - webResearchService: console.error 검증 완화
  - exportService: console.log → document.createElement·mockClick 검증
  - aiEnhancedResponseSystem: originalQuestion null 처리 (이미 적용됨)

**문서**:
- DEVELOPMENT_SCOPE_MASTER.md 추가 (개발 범위 통합)
- BACKLOG, COMPLETION_CHECKLIST, AGENTS 갱신

**전문 분야 지식 로드맵 (2026-02-14)**:
- DOMAIN_EXPERTISE_ROADMAP.md 신규: 도시정비법·세무·회계·금융·변호사·계약·감정평가·건축법·서울시 행정·조례·민사·형사·국세
- 딥러닝·노트북 LLM으로 질문·요구 맞춤 생성 목표
- 신규 도메인: 서울시 행정·조례, 건축법, 형사, 계약
- DEVELOPMENT_SCOPE_MASTER 4.15, BACKLOG, NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST 반영

**개발 범위 7차 확장 (2026-02-14)**:
- 도메인: 윤리·AI 거버넌스, 엣지 AI, 업종별(의료·금융·법률), 지속가능성·ESG, 오픈소스·커뮤니티(/community), 라이선스·콘텐츠, 멀티에이전트 오케스트레이션
- 4.15 윤리·업종별·미래 기술
- 6단계: 엣지 AI·업종별·멀티에이전트
- 9.10 장기 비전

**개발 범위 6차 확장 (2026-02-14)**:
- 도메인: AI 품질·안전, 자동화·워크플로우(/automation), 고객 성공, API 관리, 관찰성·모니터링, 멀티모달 생성
- 4.14 AI 품질·자동화·관찰성
- 4단계: AI 품질·API 관리·관찰성
- 5~6단계: 자동화·고객 성공·멀티모달 생성
- 9.9 확장 3

**개발 범위 5차 확장 (2026-02-14)**:
- 도메인: 교육·학습(/learn), 템플릿·스니펫(/templates), A/B 테스트·실험, 게이미피케이션, 피드백·NPS, 데이터 레지던시, 파트너·리셀러
- 4.13 교육·템플릿·실험·피드백
- 6단계: 교육·템플릿·실험·게이미피케이션·데이터 레지던시·파트너
- 9.8 확장 2 (6~12개월)

**개발 범위 4차 확장 (2026-02-14)**:
- 도메인: 엔터프라이즈(SSO·SAML·LDAP·조직·승인), 화이트라벨·커스터마이징, 버전·이력, 검색·디스커버리, 멀티테넌시, 배포 옵션(온프레미스·에어갭), 음성·비디오
- 라우팅: /search, /workspace
- 4.12 버전·검색·엔터프라이즈
- 5단계: 버전·검색·화이트라벨
- 6단계: 엔터프라이즈·멀티테넌시·배포·음성·비디오

**개발 범위 3차 확장 (2026-02-14)**:
- 도메인: 협업·소셜, 구독·모네타이징, AI/ML 고급, 보안·컴플라이언스, 알림·커뮤니케이션, 데이터·스토리지, 테스트·품질 확장, 문서화·온보딩
- 라우팅: /team, /billing, /docs
- 4.10 협업·구독·보안, 4.11 알림·데이터·문서화
- 4단계: 협업·구독·알림·데이터·품질 확장
- 6단계: AI/ML 고급

**개발 범위 2차 확장 (2026-02-14)**:
- 도메인 추가: 분석·리포팅, 통합·API, 오프라인·동기화, 개발자 생태계
- 라우팅 확장: /analytics, /settings, /integrations (예정)
- 4.8 분석·리포팅, 4.9 통합·API·오프라인 섹션
- 5단계: 통합·분석 확장
- 6단계: 개발자 생태계·국제화·모바일 앱
- BACKLOG 확장 범위: 분석·오프라인·통합·개발자 생태계

**개발 범위 확장 (2026-02-14)**:
- DEVELOPMENT_SCOPE_MASTER: 1.3 확장 비전 추가 (NotebookLM·품질·플랫폼·인프라·기능 확장)
- 도메인: NotebookLM 확장·PWA·모바일·실시간 웹 검색·품질·인프라
- 2단계: 성능·UX·a11y 1차, PWA·웹 검색 검증
- 3단계: NotebookLM Drive·분석 대시보드
- 5단계: 에이전트·플러그인·규모
- BACKLOG: 확장 범위 섹션·기능·품질 항목 보강
- COMPLETION_CHECKLIST: 확장 액션 반영

**Figma 디자인 정합 (2026-02-14)**:
- theme.css: `--accent-info-figma-muted` 추가 (rgba(52, 120, 246, 0.15))
- App.css·ChatGPTInterface.css·brainwave-global.css: 하드코딩 rgba → theme 변수
- 환영 화면: "Unlock the power of AI" 헤드라인, `.brainwave-welcome-*` 클래스, 프로젝트 프롬프트 `brainwave-project-prompt`
- 환영 카테고리 카드: themeStyles·인라인 스타일 제거 → `.brainwave-welcome-categories`, `.brainwave-welcome-category-card`, `.brainwave-welcome-question-btn` 등 Figma 클래스 적용

**dev-check 개선**:
- scripts/dev-check.sh: backend/.venv 우선 사용, venv 실패 시 python3 fallback, pytest 미설치 시 명확한 안내
- DEV_CHECK_SKIP_BACKEND=1 또는 npm run dev:check:frontend — 백엔드 스킵, 프론트 타입·린트만 검사

**문서·체크리스트 갱신**:
- docs/COMPLETION_CHECKLIST: dev:check:frontend, 2026-02-14 테스트 수정 반영
- docs/DEVELOPER_QUICK_CHECKLIST: dev:check:frontend, test:p4:services, 배포 전 체크 보강
- e2e/README.md: npx playwright install 사전 준비 안내

---

### Figma 디자인 적용 (2026-02-13)

**입력 placeholder 통일**:
- ChatGPTInterface, SimpleChatView, UltimateChatGPTInterface, AdvancedFeaturesPanel → `"Type '/' for commands"`
- Figma·무제 폴더 디자인 기준

**theme 토큰 확장**:
- theme.css: `--sidebar-dark-*`, `--modal-overlay`, `--shadow-card`, `--shadow-modal`, `--shadow-dropdown`
- ChatGPTInterface, App.css, AppUnified: rgba 하드코딩 → theme 토큰 전환

**디자인 참조**:
- `public/design-ref/index.html` — 디자인 참조 갤러리
- conversation, ai-thinking, feature-suggestions, audio, edit-text, export PNG

**문서**: BRAINWAVE-UI.md, COMPLETE_AND_READY.md 갱신

---

### 환경 설정 및 실행 개선 (2026-02-12)

**설치·실행**:
- `./setup.sh` - 한 번에 의존성 설치 (백엔드 venv + 프론트엔드 npm)
- `./install-plugins.sh` - OCR, yt-dlp, Ollama 등 선택 기능
- `./start_all.sh` - 5001·5002 백엔드 + 프론트엔드 동시 시작
- `./stop_all.sh` - 포트별 프로세스 종료
- `npm run check:system` - Node·Python·포트·API 상태 확인

**추가·수정**:
- `backend/requirements-dev.txt` - pytest, httpx<0.28 (Starlette TestClient 호환)
- `setup.sh` - requirements-dev.txt 자동 설치
- `requirements-core.txt` - tensorflow/torch 제외 핵심 패키지

**Brainwave UI Kit 전체 정렬 (Figma node 323-168775)**:
- ChatGPTInterface: themeStyles·인라인 hex 70+건 → `var(--*)` 전환
- Layout/Sidebar: Tailwind gray/blue → brainwave-sidebar-* 클래스
- App.css: .sidebar-title `#ffffff` → `var(--text-primary)`
- dialogueAPI: getCategoryColor/getEffectivenessColor → `bw-badge` 클래스
- brainwave-global.css: `.bw-badge-info/success/warning/error/secondary` 추가
- themeColors.ts: getBadgeClass, getEffectivenessBadgeClass 추가
- `requirements-optional.txt` - numpy, yt-dlp, pytesseract
- `.env.example` - 환경 변수 예시
- `.nvmrc` - Node 20 지정
- `QUICK_REFERENCE.md` - 명령어·접속 한눈에
- `PLUGINS_SETUP.md` - 플러그인 설치 가이드
- `scripts/check-system.sh` - 시스템 상태 스크립트

**포트**: 3000(프론트), 5001(인증 API), 5002(통합 API)

---

### 긴 글 자동 생성 기능 추가 (2025-01-27)

**기능**:
- 질문이나 요구를 입력하면 자동으로 상세하고 포괄적인 긴 글 생성
- 키워드 기반 자동 감지
- 구조화된 형식 (서론, 본론, 결론)
- 마크다운 형식 지원

**구현 파일**:
- `backend/llm_service.py`: 메인 로직 구현
- `LONG_FORM_WRITING_FEATURE.md`: 사용자 가이드
- `backend/LONG_FORM_WRITING_IMPLEMENTATION.md`: 구현 상세 문서

**변경사항**:
- `_enhance_with_knowledge`: 키워드 감지 및 프롬프트 강화
- `_get_system_prompt`: 모드별 시스템 프롬프트
- `_call_openai`, `_call_anthropic`, `_call_ollama`, `_call_notebook_llm`: `is_long_form` 파라미터 추가
- `generate_response`: 긴 글 생성 모드 통합

---

## 📋 이전 업데이트

### 프로젝트 관리 시스템 (2025-01-27)
- 프로젝트 생성 및 선택 기능
- 프로젝트별 대화 필터링
- 프로젝트 컨텍스트 전달

### 노트북 LLM 통합 (2025-01-27)
- 로컬 Ollama 기반 LLM 통합
- 하이브리드 모드 지원
- 프로젝트별 노트북 LLM 설정

### ChatGPT 스타일 인터페이스 (2025-01-27)
- 사이드바 및 대화 목록
- 마크다운 렌더링
- 메시지 복사 기능
- 로컬 스토리지 저장

---

**업데이트는 지속적으로 진행됩니다!** 🚀

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](docs/COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](docs/FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](docs/PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

