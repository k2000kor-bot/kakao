# CORBU.AI 프로젝트(Project) 기능 체크리스트

참고(기능 설명용): [스파르타클럽 — 업무 시간을 줄여주는 'ChatGPT 프로젝트(Project)' 사용법](https://spartaclub.kr/blog/chatgpt-project)

**구현·문서**: [NOTEBOOKLM_SERVICE_AS_GOOGLE.md](./NOTEBOOKLM_SERVICE_AS_GOOGLE.md)·[README.md](./README.md) §NotebookLM·§개발 **통합·로컬**·[../INTEGRATION_TEST_GUIDE.md](../INTEGRATION_TEST_GUIDE.md)·[LOCAL_ACCESS_GUIDE.md](./LOCAL_ACCESS_GUIDE.md)·[../QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md)·[FEATURE_LOGIC_AND_STRENGTHS.md](./FEATURE_LOGIC_AND_STRENGTHS.md) §6 · [PROJECT_NOTEBOOK_LLM_USER_GUIDE.md](./PROJECT_NOTEBOOK_LLM_USER_GUIDE.md)·[COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md)·[SYSTEM_READY.md](../SYSTEM_READY.md) §빠른 참조 · [**`name`·`getPageTitle` → 프로젝트 대화**](../src/config/README.md)·[USAGE_GUIDE.md](../USAGE_GUIDE.md) §1.2 · [AGENTS.md](../AGENTS.md)·[TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes`·`routes.test` · **`npm run test:app-unified`** · **`npm run test:sidebar-context`** · 원격 push 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) · [e2e/README.md](../e2e/README.md)·표 행과 교차

**보조 CRA `frontend/src/`** (루트 `src/` 미러): **`npm run sync:frontend-src`**(동일 **`make sync-frontend`**; `pretest`·`check:src-frontend-parity`(동일: `make check-frontend-parity`)). `chatInputUtils.ts`만 **`npm run sync:frontend-chat-input-utils`**(동일 **`make sync-frontend-chat-input`**). 통합 대화(UI) 등 부분 **`npm run sync:frontend-unified-chat`**(동일 **`make sync-frontend-unified-chat`**) — [QUICK_REFERENCE.md](../QUICK_REFERENCE.md)·[AGENTS.md](../AGENTS.md)·[scripts/README.md](../scripts/README.md).

## 1. 스파르타클럽 기준 기능 vs 구현 상태

| 스파르타클럽 기능 | 구현 위치 | 상태 |
|------------------|-----------|------|
| **프로젝트 만들기** | **`/projects`** 또는 **`/projects/:id`** 내 `ChatGPTInterface` 사이드바 **새 프로젝트**, `projectService.createProject` | ✅ · 표 행과 교차 |
| **프로젝트 이름 편집 / 삭제** | 프로젝트 ⋮ 메뉴 → "편집"(ProjectEditModal), "삭제"(확인 후 삭제) | ✅ · 표 행과 교차 |
| **파일 추가** | ProjectEditModal "프로젝트 파일" 섹션, POST /api/projects/{id}/files, uploadProjectFile | ✅ · 표 행과 교차 |
| **지침 추가** | ProjectEditModal "지침" 필드, context.project_instructions → 백엔드 projectKnowledge | ✅ · 표 행과 교차 |
| **기존 대화 → 프로젝트로 옮기기 (드래그)** | 사이드바 대화 드래그 → 프로젝트 폴더 onDrop, moveConversationToProject | ✅ · 표 행과 교차 |
| **기존 대화 → 프로젝트에 추가 (점 세 개)** | 대화 제목 점 세 개 메뉴 → "프로젝트에 추가" → 프로젝트 선택 | ✅ · 표 행과 교차 |
| **프로젝트 지침이 해당 프로젝트 대화에만 적용** | context.project_instructions + projectId, 백엔드 projectKnowledge | ✅ · 표 행과 교차 |
| **참고 파일 맥락이 대화에 반영** | context.project_files → projectKnowledge "참고 파일: ..." | ✅ · 표 행과 교차 |

## 2. 백엔드 연동

| 항목 | 파일 | 설명 |
|------|------|------|
| 프로젝트 지침 | `backend/api/unified_chat_api.py` | context.project_instructions → "프로젝트 지침(이 프로젝트 내 모든 대화에 적용): ..." · 표 행과 교차 |
| 참고 파일 맥락 | `backend/api/unified_chat_api.py` | context.project_files → "참고 파일(이 프로젝트에 첨부된 문서·이미지 등): ..." · 표 행과 교차 |
| 프로젝트별 NotebookLM | `backend/api/project_session_api.py` | /api/projects/{project_id}/notebook-llm/status, generate, stream — **프로젝트별 개별 단위** · 표 행과 교차 |

## 3. 프로젝트별 NotebookLM 개별 단위

- **API**: `/api/projects/{project_id}/notebook-llm/*` — URL에 포함된 `project_id`로 해당 프로젝트의 학습 소스·컨텍스트만 사용.
- **프론트**: `notebookLLMService.generateWithProjectNotebook(projectId, ...)`, `notebookLLMStreamingService.streamProjectNotebook(projectId, ...)`.
- **소스 선택**: `selectedSourceIds` 등이 프로젝트별 localStorage 키(`notebook-selected-sources-${projectId}`)로 저장·복원.

## 4. 딥러닝 연동 (NotebookLM + 프로젝트 맥락, 진하게)

- **의도·감정·주제 분석**: NotebookLM 화면 "🧠 딥러닝 연동" 체크 시 `notebookLLMDeepLearningIntegration.analyzePromptWithDL`(입력 전), `analyzeResponseWithDL`(출력 후).
- **프로젝트 지침 반영 (진하게)**: 프로젝트가 선택된 경우 `projectService.getProject(projectId)`로 지침·이름을 로드하여 `analyzePromptWithDL(prompt, projectContext)`에 전달. DL 분석 시 "[프로젝트: 이름] [프로젝트 지침 맥락: ...] 사용자 질문: ..." 형태로 맥락 포함. `buildDLPromptEnhancement(analysis, projectContext)`에서 "[프로젝트 지침 반영] 이 프로젝트의 지침에 맞춰 톤·형식·내용을 맞춰 답변해주세요." 문구 추가.

## 5. 검증 방법

- **프로젝트 CRUD·메뉴**: 사이드바에서 프로젝트 생성, ⋮ → 편집/삭제, ProjectEditModal에서 파일 추가·지침 저장.
- **드래그 앤 드롭**: 대화를 프로젝트 폴더로 끌어다 놓기 → "프로젝트에 추가되었습니다" 토스트.
- **프로젝트에 추가 메뉴**: 대화 제목 옆 ⋮ → "프로젝트에 추가" → 프로젝트 선택.
- **대화 맥락**: 프로젝트 선택 후 대화 시 백엔드 로그에서 "프로젝트 지침 맥락 적용", "프로젝트 참고 파일 맥락 적용" 확인.
- **NotebookLM·문서 허브·통합·로컬**: 프로젝트(/projects)에서 프로젝트 클릭 → **프로젝트 대화** 진입 후 해당 프로젝트의 NotebookLM API만 호출되는지 확인.
- **풀 스택·UI 스모크(선택)**: 루트에서 `npm run verify:final` — [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)

## 6. 연관 문서

- [SYSTEM_READY.md](../SYSTEM_READY.md) — AppUnified·**`/projects/:id`**·NotebookLM — §고도화 내역·§빠른 참조
- [COMPLETION_CHECKLIST.md](COMPLETION_CHECKLIST.md) §2 — 라우트·메뉴, 프로젝트 파일 업로드
- [DEVELOPMENT_CONTINUITY.md](DEVELOPMENT_CONTINUITY.md) §1·§2 — `routes.ts`·`e2e/paths.ts` 동기 · [**`name`·`getPageTitle` → 프로젝트 대화**](../src/config/README.md)·[USAGE_GUIDE §1.2](../USAGE_GUIDE.md#12-사이드바-상단-메뉴)·[AGENTS.md](../AGENTS.md)·[TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes`·`routes.test` · **`npm run test:app-unified`** · **`npm run test:sidebar-context`** · 원격 push [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md) · [e2e/README.md](../e2e/README.md)
- [API.md](API.md) — POST /api/projects/{id}/files

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
