# AI Workspace 의도 감지 및 기능 라우팅

좌측 메뉴 4개 영역에서 **요청 시 생성되는 기능**을 프롬프트로 실행하기 위한 의도 감지 → 기능 라우팅 스펙 및 구현 가이드.

---

## 1. 시스템 플로우

```
User Request (대화 입력)
    ↓
Workspace Intent Detection (workspace_intent_router)
    ↓
Function / Tool Routing
    ↓
Tool Execution (기존 API 또는 새 핸들러)
    ↓
Response Generation (LLM이 결과를 자연어로 정리 또는 직접 반환)
```

- **UI**: 최소 4개 영역만 노출 (검색·새대화 / 프로젝트 / 최근 대화 / 사용자).
- **기능 실행**: 사용자 문장 → 의도 분류 → 해당 도구 호출 → 응답 생성.

---

## 2. 워크스페이스 인텐트 정의

| Intent | 설명 | 예시 발화 | 라우팅 대상 |
|--------|------|-----------|-------------|
| `conversation_search` | 대화 검색 | "상대원2구역 관련 대화 찾아줘", "지난주 대화 검색" | vector/conversation search API |
| `project_create` | 프로젝트 생성 | "성수4지구 분석 프로젝트 만들어줘", "OO 프로젝트 생성" | project_session_api (프로젝트 생성) |
| `file_upload` / `add_source` | 파일·자료 추가 | "이 프로젝트에 기사 자료 추가", "PDF 올려줘" | project_session_api (소스 추가) |
| `knowledge_search` | 지식 검색 | "지식베이스에서 OO 찾아줘" | vector retrieval |
| `report_generate` | 보고서 생성 | "이 대화 기반 보고서 만들어줘", "요약 보고서" | 분석 + 보고서 생성 파이프라인 |
| `conversation_summary` | 대화 요약 | "최근 상대원2구역 대화 요약", "이 대화 요약해줘" | conversation summary API |
| `data_export` | 데이터 내보내기 | "내 대화 데이터 다운로드", "대화 export" | export API |
| `new_conversation` | 새 대화 시작 | "이 주제로 새 분석 시작", "새로 시작" | 프론트: 새 대화 생성 (백엔드에서는 context 초기화 힌트) |

추가 확장: `project_analyze`, `project_summary`, `usage_analytics`, `api_key_manage` 등.

---

## 3. 구현 위치

| 구성요소 | 경로 | 역할 |
|----------|------|------|
| 의도 감지·라우팅 | `backend/api/workspace_intent_router.py` | 메시지 → intent + slots + suggested_tool 반환 |
| 대화 진입점 | `backend/api/unified_chat_api.py` → `generate_chat_response()` | 진입 시 `detect_workspace_intent()` 호출, 결과를 `context["_workspace_intent"]`, `context["_workspace_tool_route"]`에 저장. 도구 실행 분기는 파이프라인에서 `_workspace_tool_route` 사용 가능 |
| 기존 의도/명령 | `backend/intent_classifier.py`, `backend/natural_language_command_system.py` | 도메인별/시스템 명령; 워크스페이스 인텐트와 병행 사용 가능 |

---

## 4. 연동 방식 (권장)

1. **`generate_chat_response()` 진입 직후**
   - `detect_workspace_intent(message, context)` 호출.
   - `confidence >= threshold`이고 실행 가능한 도구가 있으면:
     - 해당 API 호출 (예: 프로젝트 생성, 대화 검색, export).
     - 도구 결과를 `context`에 넣거나, 구조화 응답으로 반환 후 LLM이 자연어로 요약.
   - 그 외에는 기존 QA/대화 파이프라인 그대로 진행.

2. **스트리밍**
   - 인텐트가 도구 실행으로 확정되면: 도구 실행 → 결과를 한 번에 또는 청크로 전달 후, 스트리밍에서는 “실행 결과 요약”만 생성.

3. **모델 선택**
   - UI에서 제거되어 있으므로, 백엔드/파이프라인 내부 라우팅으로만 모델 결정.

---

## 5. 패턴 예시 (정규식·키워드)

- `conversation_search`: `(대화|대화).*찾아|검색.*(대화|대화)|~관련 대화`
- `project_create`: `(프로젝트|분석).*만들어|생성.*프로젝트|~지구 분석 프로젝트`
- `report_generate`: `(보고서|요약).*만들어|대화 기반 보고서`
- `conversation_summary`: `(대화|대화).*요약|최근.*요약`
- `data_export`: `(대화|데이터).*다운로드|export|내보내기`
- `new_conversation`: `새.*(분석|대화|시작)|이 주제로 새로`

실제 패턴은 `workspace_intent_router.py`에 구현하며, 필요 시 LLM 기반 분류로 확장.

---

## 6. 참고 문서

- [AI_WORKSPACE_MINIMAL_UI.md](./AI_WORKSPACE_MINIMAL_UI.md) — 4개 영역 및 요청 시 생성 기능 정리
- [QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md](./QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md) — 파이프라인·라우팅
- [BASIC_FLOW_PRIORITY.md](./BASIC_FLOW_PRIORITY.md) — 기본 플로우·우선순위
