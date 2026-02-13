# 업데이트 로그

**최신 업데이트**: 2026년 2월 13일

---

## 🆕 최신 업데이트

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

