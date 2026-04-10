# 프로젝트 생성 시 노트북 LLM 정보 수집·학습 및 프로젝트별 질의응답 기능 개발 계획

## 목표
- **프로젝트 생성 시** 해당 프로젝트 정보(이름, 설명, 태그, 가이드라인)를 노트북 LLM에 넣어 **수집·학습**한다.
- **해당 프로젝트에 맞는 질문·요구**를 했을 때, 학습된 정보를 활용한 **답변**이 가능하도록 한다.

---

## 개발 순서

### 1단계: 백엔드 – 프로젝트 컨텍스트 저장소 및 API ✅
- [x] 프로젝트별 "노트북 컨텍스트" 저장 디렉터리/파일 구조 정의  
  - `project_data/project_knowledge/{project_id}.json`
- [x] 프로젝트 생성 시 저장 데이터 확장  
  - `ProjectCreate`에 `initial_guidelines: Optional[List[str]]` 추가  
  - 생성 시 `name`, `description`, `tags`, `initial_guidelines`를 한 덩어리 텍스트로 만들어 저장 (`save_project_notebook_context`)
- [x] `GET /api/projects/{project_id}/notebook-context`  
  - 저장된 프로젝트 지식 텍스트 반환

### 2단계: 백엔드 – 대화/노트북 생성 시 프로젝트 컨텍스트 반영 ✅
- [x] `UnifiedChatRequest`와 `ChatStreamRequest`에 `project_id: Optional[str]` 추가  
- [x] `generate_chat_response`에서 `project_id`(또는 context 내 `projectId`)가 있으면 해당 프로젝트의 노트북 컨텍스트 로드 후 `context["projectKnowledge"]`로 병합
- [x] `notebook_llm_integration._enhance_prompt`에서 `context.projectKnowledge`를 프롬프트 상단에 포함해 해당 프로젝트에 맞는 답변 생성

### 3단계: 프론트엔드 – 프로젝트 생성 시 정보 전달 ✅
- [x] `projectService.createProject`에서 백엔드 POST 시 `tags`, `initial_guidelines` 전달 (모달에서 오는 `initialGuidelines` 포함)
- [x] `ChatGPTInterface`에서 프로젝트 생성 시 `ProjectCreationModal` 사용 → 이름·설명·태그·가이드라인 전달·노트북 LLM 학습 연동
- [x] 생성 API 한 번으로 백엔드가 `save_project_notebook_context` 호출해 저장
- [x] 프로젝트 수정 시 `projectService.updateProject`에서 `tags`, `initial_guidelines` 전달 → 백엔드가 노트북 컨텍스트 재저장
- [x] 프로젝트 설정 편집 UI: `ProjectEditModal` (이름·설명·태그·가이드라인) + ChatGPTInterface 연동
- [x] 프로젝트 삭제 시 노트북 컨텍스트 파일(`project_knowledge/{id}.json`) 함께 삭제

### 4단계: 프론트엔드 – 대화 시 프로젝트 컨텍스트 사용 ✅
- [x] `ChatGPTInterface` 등에서 이미 `streamChatMessage` 호출 시 `context: { projectId, projectName }` 전달 중
- [x] 백엔드에서 `context.projectId` 또는 `context.project_id`로 로드 후 노트북 컨텍스트 반영

### 5단계: 검증 및 문서화 ✅
- [x] 프로젝트 생성 → 해당 프로젝트로 질문 → 프로젝트 설명/가이드라인에 맞는 답변인지 수동/자동 검증  
  - 수동 검증 절차·curl 예시: `docs/PROJECT_NOTEBOOK_LLM_VERIFICATION.md`  
  - 자동 검증: `backend/tests/test_project_session_api.py::TestProjectNotebookContext`
- [x] RUN_GUIDE 또는 별도 가이드에 "프로젝트별 노트북 LLM 학습 및 질의응답" 사용 방법 정리 → `docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md` 참고

---

## 데이터 흐름 요약

```
[프로젝트 생성]
  이름, 설명, 태그, 가이드라인
    → POST /api/projects (확장)
    → 백엔드가 project_knowledge/{project_id}.json 으로 저장 (학습용 텍스트)

[대화/질의]
  메시지 + project_id
    → POST /api/chat 또는 /api/chat/stream
    → 백엔드가 project_id로 저장된 컨텍스트 로드
    → context에 projectKnowledge로 병합 후 LLM 호출
    → 프로젝트에 맞는 답변 반환
```

---

## 파일 변경 예상

| 구분 | 파일 | 내용 |
|------|------|------|
| 백엔드 | `backend/api/project_session_api.py` | ProjectCreate 확장, 생성 시 노트북 컨텍스트 저장, GET notebook-context |
| 백엔드 | `backend/api/unified_chat_api.py` | UnifiedChatRequest에 project_id, generate_chat_response에서 프로젝트 컨텍스트 로드·병합 |
| 프론트 | `src/services/projectService.ts` 등 | createProject·updateProject 시 initialGuidelines·tags 전달 |
| 프론트 | 대화 전송 로직 (ChatGPTInterface 등) | 요청에 projectId 포함 |

---

**작성일**: 2025-01-27  
**상태**: **개발 완료** (1~5단계 구현·검증 완료).

### 완료 확인 사항
- **백엔드**: 비스트리밍 `/api/chat`에서 `context.projectId`로 project_id 보정 적용 (`request.project_id` 없을 때).
- **스트리밍**: `context.projectId` → `normalized_context` → `generate_chat_response`에서 프로젝트 컨텍스트 로드·반영.
- **자동 테스트**: `TestProjectNotebookContext` 5건 통과  
  (생성 시 저장·없는 프로젝트·대화 시 컨텍스트 반영·수정 시 갱신·**삭제 시 노트북 컨텍스트 파일 제거**).
- **문서**: [PROJECT_NOTEBOOK_LLM_VERIFICATION.md](./PROJECT_NOTEBOOK_LLM_VERIFICATION.md), [PROJECT_NOTEBOOK_LLM_USER_GUIDE.md](./PROJECT_NOTEBOOK_LLM_USER_GUIDE.md).

### 노트북 LLM 고도화 (Google NotebookLM 스타일 소스 그라운딩)
- **동작 방식**: 노트북 LLM은 업로드·학습된 프로젝트 정보를 **소스**로 사용해, 그 소스에 근거한 답변만 하도록 유도합니다 (Google NotebookLM과 유사한 그라운딩 방식).
- **구현 요약**:
  - `_build_project_knowledge_text`: 저장 시 상단에 "소스 기반 답변 지침", "[학습된 소스] 프로젝트 개요/가이드라인", "답변 시 준수 사항" 섹션으로 구조화.
  - `notebook_llm_integration._enhance_prompt`: "그라운딩 규칙" 명시(학습 정보 우선, 배치 내용 금지, 추정 시 표시).
  - `intelligent_response_engine._inject_domain_knowledge`: `projectKnowledge`를 context에 유지해 다른 파이프라인에서도 프로젝트 지식 접근 가능.

### Google NotebookLM 스타일 UI/기능 확장
- **소스 개수 표시**: `GET /api/projects/{project_id}/notebook-context` 응답에 `source_count`, `sources` 포함. 프로젝트 목록 `GET /api/projects`에 프로젝트별 `source_count` 포함. 대화 입력 영역에 "소스 N개" 및 AI 검증 안내 문구 표시.
- **소스 추가**: `POST /api/projects/{project_id}/notebook-sources` (body: `{ "title": "...", "content": "...", "type": "text"|"url" }`) 로 학습 소스 추가. 추가 시 `context_text`를 프로젝트 개요 + 모든 활성 소스로 재구성하여 대화/스튜디오에 반영. `projectService.addNotebookSource(projectId, { title, content, type })` 로 호출 가능.
- **소스 삭제**: `DELETE /api/projects/{project_id}/notebook-sources/{source_id}` 로 추가 소스 삭제 (프로젝트 개요는 삭제 불가). `projectService.deleteNotebookSource(projectId, sourceId)` 로 호출. 소스 추가 모달에서 「현재 소스」 목록과 삭제 버튼 제공.
- **스튜디오 출력**: `POST /api/projects/{project_id}/notebook-studio/generate` (body: `{ "type": "report"|"study_guide"|"quiz"|"summary"|"flashcards" }`) 로 학습된 소스 기반 보고서·학습 가이드·퀴즈·요약·플래시카드 생성. 프론트엔드 대화 화면에 "스튜디오" 버튼 및 결과 모달 연동.
