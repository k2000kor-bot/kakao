# 프로젝트 노트북 LLM 기능 검증 가이드

## 1. 수동 검증 절차

### 1-1. 프로젝트 생성 시 학습 정보 저장
1. **프론트**: http://localhost:3000 접속 → **새 프로젝트** 클릭
2. **프로젝트 생성 모달**에서 입력:
   - 이름: `검증용 프로젝트`
   - 설명: `이 프로젝트는 재건축 분야만 다룹니다.`
   - 태그: `재건축`, `검증`
   - 가이드라인: `답변은 항상 존댓말로 작성한다.`, `재건축 관련 법규만 인용한다.`
3. **생성** 클릭
4. **백엔드 확인** (선택):
   - 프로젝트 ID 확인 (예: 개발자 도구 Network 탭 또는 프로젝트 목록에서)
   - `GET http://localhost:5002/api/projects/{project_id}/notebook-context` 호출
   - 응답에서 `data.has_context === true`, `data.context`에 설명·가이드라인 문구 포함 여부 확인

### 1-2. 대화 시 프로젝트 컨텍스트 반영
1. 방금 만든 **검증용 프로젝트** 선택
2. **새 대화**에서 질문 입력: `이 프로젝트의 목적이 뭔가요?` 또는 `재건축 관련해서 간단히 조언해 줘요.`
3. **확인할 점**:
   - 응답이 프로젝트 설명·가이드라인(재건축, 존댓말 등)을 반영하는지
   - 다른 프로젝트를 선택한 뒤 같은 질문을 하면 응답 톤/내용이 달라지는지(선택)

### 1-3. 프로젝트 수정 시 컨텍스트 갱신
1. 해당 프로젝트 **설정/수정**에서 설명 또는 가이드라인 변경
2. 동일 프로젝트로 대화 시 변경된 내용이 반영되는지 확인

---

## 2. API로 빠르게 확인 (curl)

```bash
# 1) 프로젝트 생성 (가이드라인 포함)
RES=$(curl -s -X POST http://localhost:5002/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "curl 검증 프로젝트",
    "description": "API 검증용",
    "tags": ["검증"],
    "initial_guidelines": ["답변은 한 문장으로만 한다."]
  }')
echo "$RES" | python3 -m json.tool

# 2) project_id 추출 (jq 사용 시)
# PROJECT_ID=$(echo "$RES" | jq -r '.data.id')
# 또는 응답에서 id를 복사 후:

# 3) 노트북 컨텍스트 조회 (PROJECT_ID를 위에서 확인한 값으로 교체)
curl -s "http://localhost:5002/api/projects/PROJECT_ID/notebook-context" | python3 -m json.tool
# 기대: success: true, data.has_context: true, data.context에 설명·가이드라인 포함

# 4) 노트북 LLM 상태 (프로젝트에 학습 소스가 있으면 available: true)
curl -s "http://localhost:5002/api/projects/PROJECT_ID/notebook-llm/status" | python3 -m json.tool

# 5) 노트북 LLM 생성 (프롬프트에 대한 답변)
curl -s -X POST "http://localhost:5002/api/projects/PROJECT_ID/notebook-llm/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "요약해줘", "context": null}' | python3 -m json.tool

# 6) 노트북 LLM 스트리밍 (NDJSON)
curl -s -X POST "http://localhost:5002/api/projects/PROJECT_ID/notebook-llm/stream" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "요약해줘", "context": null}'
# 기대: 각 줄이 JSON ({"content": "청크", "done": false} 또는 {"content": "", "done": true})
```

---

## 3. 자동 테스트 (백엔드)

프로젝트 생성 시 노트북 컨텍스트 저장·조회·**대화 시 컨텍스트 반영**은 `backend/tests/test_project_session_api.py`의 **TestProjectNotebookContext**에서 자동 검증합니다.

```bash
cd backend
pytest tests/test_project_session_api.py::TestProjectNotebookContext -v
```

- `test_create_project_with_guidelines_saves_notebook_context`: 생성 시 가이드라인 저장 및 GET notebook-context
- `test_notebook_context_empty_when_no_project`: 존재하지 않는 프로젝트의 컨텍스트
- `test_chat_with_project_context_returns_200`: 프로젝트 생성 후 `context.projectId`로 POST /api/chat 호출 시 200 및 응답 본문 검증
- `test_update_project_updates_notebook_context`: 프로젝트 수정(PUT) 시 name/description/tags/initial_guidelines 변경 후 notebook-context 갱신 여부
- `test_delete_project_removes_notebook_context`: 프로젝트 삭제(DELETE) 시 해당 project_knowledge 파일 제거 여부
- **노트북 LLM 전용 API**: `test_notebook_llm_status_available_when_has_context`, `test_notebook_llm_status_404_for_nonexistent_project`, `test_notebook_llm_generate_returns_content`, `test_notebook_llm_generate_400_empty_prompt`, `test_notebook_llm_stream_returns_ndjson`, `test_notebook_llm_stream_400_empty_prompt`, `test_notebook_llm_stream_404_nonexistent_project`

---

## 4. 노트북 LLM 화면 (프로젝트 선택 시)

프로젝트를 선택한 뒤 **노트북 LLM** 뷰에서:
- **상태**: `GET /api/projects/{id}/notebook-llm/status` → 학습된 소스가 있으면 `available: true`, `models: ["project-notebook"]`
- **일반 생성**: 프롬프트 입력 후 생성 → `POST /api/projects/{id}/notebook-llm/generate` (body: `{ prompt, context? }`)
- **스트리밍**: 스트리밍 모드 체크 후 생성 → `POST /api/projects/{id}/notebook-llm/stream` (NDJSON 스트림)

---

## 5. 문제 발생 시 점검

| 현상 | 확인 항목 |
|------|-----------|
| `GET /notebook-context`가 항상 `has_context: false` | 프로젝트 생성 시 백엔드에서 `save_project_notebook_context` 호출 여부, `project_data/project_knowledge/{id}.json` 파일 생성 여부 |
| 대화 시 프로젝트 정보가 반영되지 않음 | 스트리밍/비스트리밍 요청의 `context`에 `projectId` 포함 여부, 백엔드 `generate_chat_response`에서 `projectKnowledge` 로드·주입 여부 |
| 프론트에서 가이드라인을 못 넣음 | `ProjectCreationModal` 사용 여부, `createProject` 호출 시 `initialGuidelines` 전달 여부 |

관련 구현: `docs/PROJECT_NOTEBOOK_LLM_DEV_PLAN.md`, `docs/PROJECT_NOTEBOOK_LLM_USER_GUIDE.md`

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
