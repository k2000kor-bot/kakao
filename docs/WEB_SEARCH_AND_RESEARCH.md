# 웹 검색·Deep Research 연동 상태

**목적**: DuckDuckGo·web-research API 연동 상태 정리.

---

## 1. 개요

| 기능 | UI | 프론트 서비스 | 백엔드 API | 상태 |
|------|-----|---------------|------------|------|
| **웹/Fast Research** | WebResearchModal | webResearchService | POST /api/analysis/web-research | ⚠️ 시뮬레이션 (NotebookLLM 내) |
| **Deep Research** | DeepResearchModal | webResearchService | POST /api/analysis/web-research | ⚠️ 시뮬레이션 (NotebookLLM 내) |
| **대화 내 웹 연구** | ChatGPTInterface | (context.enable_web_research) | unified_chat_api | ✅ intelligent_web_researcher(시뮬) |

---

## 2. 프론트엔드

### 2.1 webResearchService

- **경로**: `src/services/webResearchService.ts`
- **호출**: `POST ${API_BASE_URL}/api/analysis/web-research` — API_BASE_URL은 `src/config/api.ts` (기본 localhost:5002)
- **역할**: 질문 → 웹 연구 기반 분석 요청, 결과 포맷팅(formatWebResearchResponse)
- **테스트**: `src/services/__tests__/webResearchService.test.ts`

### 2.2 UI 컴포넌트

| 컴포넌트 | 용도 | 노출 위치 |
|----------|------|-----------|
| **WebResearchModal** | 웹/Fast Research — 질문 검색·소스 추가 | NotebookLLM (프로젝트 · 대화 /projects/:id) |
| **DeepResearchModal** | Deep Research — 심층 보고서 생성 | NotebookLLM (프로젝트 · 대화 /projects/:id) |

### 2.3 ChatGPTInterface 입력 통합 (2026-02-20)

- **경로**: `src/components/ChatGPTInterface.tsx`, `src/utils/chatInputUtils.ts`
- **기능**: 사용자 메시지 의도 기반 `enable_web_research`, `investigative_mode`, `force_comment_generation` 플래그를 `context`에 자동 주입
- **슬래시 명령어**: `/웹검색`, `/검색`, `/웹` 등 — 입력창 + 버튼 메뉴에서 삽입 가능
- **키워드 감지**: `buildFeatureContextFromMessage()` — "검색", "최신", "뉴스", "웹", "리서치", "조사", "검증", "출처" 등
- **테스트**: `src/utils/__tests__/chatInputUtils.test.ts` (buildFeatureContextFromMessage·extractResponseContent)
- **로딩 메시지**: 웹검색 요청 시 "웹 검색 및 응답 생성 중..." 표시
- **스트리밍 폴백**: 스트리밍 실패 시 비스트리밍 API로 자동 재시도

### 2.4 기타 서비스

- **intelligentKnowledgeProcessor.performWebSearch**: 대화 API(sendChatMessage)에 intent `web_search` 전달 — 실제 검색 엔진 직접 호출 없음
- **webSearchService**: `simulateSearchResults` — 시뮬레이션 전용
- **webSearchIntegrationService**: 통합 검색·합성 — `performMultiSourceSearch` 내부 구현

---

## 3. 백엔드

### 3.1 POST /api/analysis/web-research

- **정의**: `backend/api/analysis_api.py` (FastAPI 라우터) — **main_server(5002)에 포함**
- **엔진**: 시뮬레이션 (실제 DuckDuckGo/외부 API 호출 없음)
- **동작**: `npm run restart:backend`로 기동 시 WebResearchModal·DeepResearchModal에서 사용 가능
- **테스트**: `tests/test_main_server.py::TestAnalysisWebResearch`
- **참고**: gaeposung_analysis_api.py(Flask)에도 동일 경로 존재 — main_server 사용 시 analysis_api가 우선

### 3.2 intelligent_web_researcher (대화 연동)

- **경로**: `backend/intelligent_web_researcher.py`
- **검색 엔진**: `google`, `bing`, `duckduckgo` — **모두 시뮬레이션** (실제 HTTP 검색 없음)
- **DuckDuckGo**: `_search_duckduckgo` — 고정 스니펫·URL 반환
- **사용처**: `unified_chat_api` — `context.enable_web_research` true일 때 `get_web_researcher().research_information()` 호출

### 3.3 기타 엔진

| 파일 | 용도 | 실제 검색 |
|------|------|-----------|
| real_web_research_engine.py | RealWebResearchEngine | 구현 확인 필요 |
| advanced_web_researcher.py | AdvancedWebResearcher | 구현 확인 필요 |
| web_research_engine.py | WebResearchEngine | 구현 확인 필요 |

---

## 4. DuckDuckGo 연동 현황

| 항목 | 상태 |
|------|------|
| **실제 DuckDuckGo API 호출** | ❌ 미구현 (시뮬레이션만 존재) |
| **intelligent_web_researcher** | 시뮬레이션 (고정 응답) |
| **gaeposung SimpleWebResearchEngine** | 시뮬레이션 (example.com 등 하드코딩 소스) |

**실제 검색 연동 시**: DuckDuckGo Instant Answer API, SerpAPI, 또는 공개 검색 API 연동 필요.

**단기 미진행**: 실연(§실제 연동 로드맵) 또는 문서화 정리. 현재 시뮬로 WebResearchModal·DeepResearchModal·대화 웹검색 플로우 검증 가능.

### 실제 연동 로드맵 (P2 확장)

| 단계 | 작업 | 비고 |
|------|------|------|
| 1 | DuckDuckGo HTML API 또는 SerpAPI 키 연동 | 무료·유료 선택 |
| 2 | intelligent_web_researcher `_search_duckduckgo` 실연 교체 | unified_chat_api 경로 |
| 3 | analysis_api web-research 엔진 실연 교체 | WebResearchModal·DeepResearchModal |
| 4 | 검색 결과 캐싱·레이트 리밋 | API 쿼터 관리 |

---

## 5. 검증·테스트

### 프론트

```bash
npm test -- --testPathPattern="webResearchService|WebResearchModal|DeepResearchModal" --watchAll=false
```

### 백엔드 (gaeposung 기동 시)

- `POST /api/analysis/web-research` 호출 → 200 + result 구조 확인

---

## 6. 연관 문서

- [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) — Deep Research, 웹/Fast Research Phase 3
- [DEVELOPMENT_SCOPE_MASTER.md](./DEVELOPMENT_SCOPE_MASTER.md) — 실시간 웹 검색 확장 범위
- [BACKLOG.md](./BACKLOG.md) — 웹 검색 P2 작업

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
