# CORBU.AI 통합 API (main.py)

Flask 기반 통합 API 서버의 주요 엔드포인트 및 검증 규칙입니다.

---

## 공통

- **Base URL**: `http://localhost:5002` (통합 **main_server** 권장). 단독 **app.py**도 기본 **`API_PORT`/`BACKEND_PORT` = 5002** (다른 포트가 필요하면 환경 변수로 지정).
- **프론트엔드**: `REACT_APP_API_URL` 미설정 시 상대 경로(`''`) 사용 → 자체 서버에서 프론트와 API를 같은 호스트로 서빙하면 `/api/*` 요청이 같은 출처로 전달됨. 별도 API 호스트 사용 시에만 `REACT_APP_API_URL` 설정.
- **CORS**: 활성화
- **응답 형식**: JSON. 성공 시 `{ "success": true, "data": ..., "timestamp": "...", "request_id": "..." }`, 실패 시 `{ "success": false, "error": "...", "message": "...", "timestamp": "...", "request_id": "..." }`. `request_id`는 요청 추적용(헤더 `X-Request-Id`와 동일).
- **응답 헤더** (모든 응답):
  - `X-Request-Id`: 요청 추적용 8자 ID
  - `X-Response-Time-Ms`: 처리 시간(ms)

---

## GET /api/health

로드밸런서·모니터링용 단순 헬스 체크.

**요청**: 없음

**응답 (200)**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "CORBU.AI 통합 API",
    "version": "1.0",
    "uptime_seconds": 123.45
  },
  "timestamp": "..."
}
```

---

## POST /api/intent/analyze

메시지 의도·키워드만 분석 (대화 응답 생성 없음).

**요청 본문**:
- `message` (string, 필수): 분석할 텍스트. **최대 10,000자**. 공백만 있으면 400. **프론트**: 전송 전 `coerceTrimmedString` 권장 — [RESPONSE_CLEANING.md](./guides/RESPONSE_CLEANING.md).

**응답 (200)**:
```json
{
  "success": true,
  "data": {
    "intent": { "type": "greeting", "confidence": 0.85 },
    "keywords": ["안녕", "하세요"]
  },
  "timestamp": "..."
}
```

**에러**:
- 400: `message` 누락, 빈 문자열, 또는 10,000자 초과

---

## POST /api/chat

대화 응답 생성 (프론트엔드 표준 대화 API).

**요청 본문**:
- `message` (string, 필수): 사용자 메시지. **최대 10,000자**. 빈 문자열 400. **프론트**에서는 전송 직전 `chatInputUtils.coerceTrimmedString`로 정규화·빈값 가드 권장 — [guides/RESPONSE_CLEANING.md](./guides/RESPONSE_CLEANING.md).
- `user_id` (string, 선택): 기본값 `"anonymous"`
- `quality` (string, 선택): `"basic"` | `"enhanced"` | `"ultimate"`. 기본값 `"enhanced"`
- `conversation_id` (string, 선택)
- `context` (object, 선택): 대화 맥락. 백엔드에서 `projectKnowledge` 등에 반영.
  - `conversation_history` (array): 최근 대화 턴(role, content).
  - `projectId` (string): 프로젝트 ID. 노트북 LLM 컨텍스트·지식 로드에 사용.
  - `project_files` (array): 참고 파일 목록. 각 항목 `{ name, type, size }`. `projectKnowledge`에 "참고 파일: ..." 힌트로 추가.
  - `project_instructions` (string): 프로젝트 지침(해당 프로젝트 내 모든 대화에 적용). `projectKnowledge`에 "프로젝트 지침: ..." 형태로 추가.
  - `source_ids` (array): 노트북 LLM 소스 ID 목록(선택 시 해당 소스만 사용).

**응답 (200)**:
```json
{
  "success": true,
  "response": "생성된 응답 텍스트",
  "message": "생성된 응답 텍스트",
  "content": "생성된 응답 텍스트",
  "data": { "model": "...", "processing_time": ..., "user_id": "...", "conversation_id": "...", "timestamp": "...", ... },
  "timestamp": "..."
}
```

**AI Workspace 도구 실행 시** (프롬프트로 프로젝트 생성·검색 등 의도 감지 후 도구 실행된 경우):
- 동일 200 응답에 **`workspace_tool_result`** 필드가 추가됨.
- 프론트는 이 필드로 프로젝트 목록 갱신·선택·토스트 등 부가 동작 수행.

```json
{
  "success": true,
  "response": "프로젝트 'OO'이(가) 생성되었습니다. ...",
  "workspace_tool_result": {
    "success": true,
    "tool": "project_create",
    "data": { "project_id": "proj_...", "name": "..." },
    "message": "프로젝트 'OO'이(가) 생성되었습니다. ..."
  },
  ...
}
```

- **스트리밍** (`POST /api/chat/stream`): 종료 이벤트 `data`의 `metadata.workspace_tool_result`에 동일 구조 전달.
- **참고**: [WORKSPACE_INTENT_ROUTING.md](./WORKSPACE_INTENT_ROUTING.md), [DEVELOPMENT_COMPLETION_STATUS.md](./DEVELOPMENT_COMPLETION_STATUS.md).

**에러**:
- 400: `message` 누락, 빈 문자열, 또는 10,000자 초과
- 500: 서버/엔진 오류

---

## POST /api/analysis/web-research

웹 연구 기반 분석 (WebResearchModal·DeepResearchModal 연동). 시뮬레이션 모드(실제 검색 API 미연동).

**요청 본문**:
- `question` (string, 필수): 분석할 질문
- `context` (object, 선택): `project_id`, `user_id`, `conversation_history`, `uploaded_files`

**응답 (200)**:
```json
{
  "success": true,
  "analysis_type": "web_research",
  "result": {
    "original_question": "...",
    "research_results": { "query", "sources", "key_findings", "consensus_points", "credibility_assessment", "research_summary" },
    "logical_refutations": [],
    "methodology_assessment": { "sample_size", "source_diversity", "methodology_strength" },
    "conclusion": "...",
    "recommendations": [],
    "confidence_score": 0.7
  },
  "timestamp": "..."
}
```

**에러**: 400 (빈 질문), 500 (서버 오류)

**참고**: [WEB_SEARCH_AND_RESEARCH.md](./WEB_SEARCH_AND_RESEARCH.md)

---

## POST /api/projects/{project_id}/files

프로젝트 참고 파일 업로드 (메타데이터만 저장, 바이너리는 저장하지 않음).

**요청**: `multipart/form-data`
- `file` (file, 필수): 업로드할 파일. 파일명·크기로 메타데이터 생성.

**응답 (200)**:
```json
{
  "success": true,
  "data": {
    "file": {
      "id": "uuid",
      "name": "원본 파일명",
      "type": "document|image|code|other",
      "size": 1234,
      "uploadedAt": "ISO8601"
    }
  },
  "timestamp": "..."
}
```

**에러**:
- 400: 파일 없음 또는 파일명 없음
- 404: 프로젝트 없음
- 500: 프로젝트 저장 실패

**참고**: 프론트 `projectService.uploadProjectFile`, ProjectEditModal 파일 추가.

---

## GET /api/integrated/health

통합 API 헬스 체크 (로드밸런서·모니터링용).

**요청**: 없음

**응답 (200)**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "CORBU.AI 통합 API"
  },
  "timestamp": "..."
}
```

---

## 기타 엔드포인트 요약

- `GET /api/status` — 기능 상태 (프론트 useApiStatus)
- `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/<id>` — 프로젝트 CRUD
- `GET /api/tts/config`, `GET /api/tts/voices`, `GET /api/tts/situations` — TTS 설정
- `POST /api/chat/stream` — 스트리밍 대화 (SSE). 요청 `message`는 비대화 API와 동일하게 프론트에서 `coerceTrimmedString` 권장.
- `POST /api/chat/title` — 대화 제목 자동 생성

OpenAPI 문서: `http://localhost:5002/api/docs` (백엔드 실행 후)

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
