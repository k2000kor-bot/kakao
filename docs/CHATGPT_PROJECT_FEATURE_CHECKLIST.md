# CORBU.AI 프로젝트(Project) 기능 체크리스트

참고(기능 설명용): [스파르타클럽 — 업무 시간을 줄여주는 'ChatGPT 프로젝트(Project)' 사용법](https://spartaclub.kr/blog/chatgpt-project)

## 1. 스파르타클럽 기준 기능 vs 구현 상태

| 스파르타클럽 기능 | 구현 위치 | 상태 |
|------------------|-----------|------|
| **프로젝트 만들기** | CORBU.AI 대화 화면(ChatGPTInterface) 사이드바 "새 프로젝트", projectService.createProject | ✅ |
| **프로젝트 이름 편집 / 삭제** | 프로젝트 ⋮ 메뉴 → "편집"(ProjectEditModal), "삭제"(확인 후 삭제) | ✅ |
| **파일 추가** | ProjectEditModal "프로젝트 파일" 섹션, POST /api/projects/{id}/files, uploadProjectFile | ✅ |
| **지침 추가** | ProjectEditModal "지침" 필드, context.project_instructions → 백엔드 projectKnowledge | ✅ |
| **기존 대화 → 프로젝트로 옮기기 (드래그)** | 사이드바 대화 드래그 → 프로젝트 폴더 onDrop, moveConversationToProject | ✅ |
| **기존 대화 → 프로젝트에 추가 (점 세 개)** | 대화 제목 점 세 개 메뉴 → "프로젝트에 추가" → 프로젝트 선택 | ✅ |
| **프로젝트 지침이 해당 프로젝트 대화에만 적용** | context.project_instructions + projectId, 백엔드 projectKnowledge | ✅ |
| **참고 파일 맥락이 대화에 반영** | context.project_files → projectKnowledge "참고 파일: ..." | ✅ |

## 2. 백엔드 연동

| 항목 | 파일 | 설명 |
|------|------|------|
| 프로젝트 지침 | `backend/api/unified_chat_api.py` | context.project_instructions → "프로젝트 지침(이 프로젝트 내 모든 대화에 적용): ..." |
| 참고 파일 맥락 | `backend/api/unified_chat_api.py` | context.project_files → "참고 파일(이 프로젝트에 첨부된 문서·이미지 등): ..." |
| 프로젝트별 노트북 LLM | `backend/api/project_session_api.py` | /api/projects/{project_id}/notebook-llm/status, generate, stream — **프로젝트별 개별 단위** |

## 3. 프로젝트별 노트북 LLM 개별 단위

- **API**: `/api/projects/{project_id}/notebook-llm/*` — URL에 포함된 `project_id`로 해당 프로젝트의 학습 소스·컨텍스트만 사용.
- **프론트**: `notebookLLMService.generateWithProjectNotebook(projectId, ...)`, `notebookLLMStreamingService.streamProjectNotebook(projectId, ...)`.
- **소스 선택**: `selectedSourceIds` 등이 프로젝트별 localStorage 키(`notebook-selected-sources-${projectId}`)로 저장·복원.

## 4. 딥러닝 연동 (노트북 LLM + 프로젝트 맥락, 진하게)

- **의도·감정·주제 분석**: 노트북 LLM 화면 "🧠 딥러닝 연동" 체크 시 `notebookLLMDeepLearningIntegration.analyzePromptWithDL`(입력 전), `analyzeResponseWithDL`(출력 후).
- **프로젝트 지침 반영 (진하게)**: 프로젝트가 선택된 경우 `projectService.getProject(projectId)`로 지침·이름을 로드하여 `analyzePromptWithDL(prompt, projectContext)`에 전달. DL 분석 시 "[프로젝트: 이름] [프로젝트 지침 맥락: ...] 사용자 질문: ..." 형태로 맥락 포함. `buildDLPromptEnhancement(analysis, projectContext)`에서 "[프로젝트 지침 반영] 이 프로젝트의 지침에 맞춰 톤·형식·내용을 맞춰 답변해주세요." 문구 추가.

## 5. 검증 방법

- **프로젝트 CRUD·메뉴**: 사이드바에서 프로젝트 생성, ⋮ → 편집/삭제, ProjectEditModal에서 파일 추가·지침 저장.
- **드래그 앤 드롭**: 대화를 프로젝트 폴더로 끌어다 놓기 → "프로젝트에 추가되었습니다" 토스트.
- **프로젝트에 추가 메뉴**: 대화 제목 옆 ⋮ → "프로젝트에 추가" → 프로젝트 선택.
- **대화 맥락**: 프로젝트 선택 후 대화 시 백엔드 로그에서 "프로젝트 지침 맥락 적용", "프로젝트 참고 파일 맥락 적용" 확인.
- **노트북 LLM**: 프로젝트(/projects)에서 프로젝트 클릭 → 프로젝트 · 대화 진입 후 해당 프로젝트의 노트북 API만 호출되는지 확인.

## 6. 연관 문서

- [SYSTEM_READY.md](../SYSTEM_READY.md) — CORBU.AI(프로젝트 연동) §고도화 내역
- [COMPLETION_CHECKLIST.md](COMPLETION_CHECKLIST.md) §2 — 라우트·메뉴, 프로젝트 파일 업로드
- [API.md](API.md) — POST /api/projects/{id}/files
