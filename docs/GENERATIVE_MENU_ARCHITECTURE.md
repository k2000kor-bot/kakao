# LLM 기반 생성형 메뉴 시스템 아키텍처

**AI Workspace Minimal UI**에서 “메뉴는 최소, 기능은 프롬프트로 생성”하는 구조를 서비스 수준으로 설계한 문서입니다.

---

## 1. 핵심 개념

| 구분 | 기존 메뉴 중심 UI | 생성형 메뉴 시스템 |
|------|-------------------|---------------------|
| 진입 | 여러 메뉴·버튼 클릭 | 단일 진입점(대화/검색) + 자연어 |
| 기능 노출 | 모든 기능을 UI에 나열 | 최소 4개 영역만 노출, 나머지는 “요청 시 생성” |
| 실행 | 사용자가 화면에서 선택 | 의도 감지 → 도구 라우팅 → 실행 → 응답 생성 |
| 모델 선택 | 사용자가 드롭다운 선택 | 내부 라우팅으로 처리 |

→ **AI 명령 중심 인터페이스** = 사용자 문장이 곧 “메뉴 선택 + 실행” 역할을 함.

---

## 2. 아키텍처 레이어

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation (최소 UI)                                      │
│  [1] 검색 + 새대화  [2] 프로젝트  [3] 최근 대화  [4] 사용자   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Entry Layer (대화/검색 입력)                                │
│  - 사용자 발화 수집                                          │
│  - 세션·프로젝트·대화 컨텍스트 전달                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Intent & Routing Layer                                     │
│  - 워크스페이스 의도 감지 (workspace_intent_router)          │
│  - 패턴/규칙 또는 LLM 기반 분류                              │
│  - 도구/API 식별자 반환 (suggested_tool, slots)              │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Tool Execution    │ │ Tool Execution   │ │ General Chat      │
│ (도구 실행 분기)   │ │ (다른 도구)       │ │ (QA/대화 파이프라인)│
│ - project_create  │ │ - report_generate │ │ - 기존 generate_   │
│ - conversation_  │ │ - data_export     │ │   chat_response   │
│   search          │ │ - ...             │ │ - RAG·요약·분석   │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Response Generation                                        │
│  - 도구 결과를 자연어로 요약 (LLM)                           │
│  - 또는 구조화 응답(링크·다운로드·새 대화 ID) 반환            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 의도 감지 방식 (단계별 확장)

| 단계 | 방식 | 용도 |
|------|------|------|
| 1 | 패턴/정규식·키워드 | 빠른 도입, 고정 발화 (“프로젝트 만들어줘”, “대화 찾아줘”) |
| 2 | 슬롯 추출 (엔티티) | 프로젝트명·지역명·기간 등 파라미터 추출 |
| 3 | LLM 기반 분류 | 발화 변형·신규 의도 확장, 다의성 해소 |
| 4 | 도구 호출 스키마 연동 | Function Calling / Tool Use로 라우팅 + 파라미터 바인딩 |

현재 구현: 1·2 수준 (`workspace_intent_router.py`). 3·4는 확장 시 도입.

---

## 4. 도구 레지스트리 (예시)

서비스에서 “생성형으로 호출 가능한 기능”을 도구 단위로 등록해 두고, 의도 결과의 `suggested_tool`과 매핑.

| suggested_tool | 설명 | 입력(slots) | 백엔드/API |
|----------------|------|-------------|-------------|
| conversation_search | 대화 검색 | query, scope | vector/conversation search |
| project_create | 프로젝트 생성 | project_name, topic | project_session_api |
| project_add_source | 소스/파일 추가 | project_id, file_ref | project_session_api |
| report_generate | 보고서 생성 | conversation_id, format | 분석 + 보고서 파이프라인 |
| conversation_summary | 대화 요약 | query, scope | summary API |
| data_export | 데이터 내보내기 | — | export API |
| new_conversation | 새 대화 | — | 프론트 새 대화 + context 초기화 |

새 기능 추가 시: (1) 의도 패턴 또는 LLM 라벨 추가, (2) 도구 레지스트리에 한 줄 추가, (3) 실행기에서 해당 API 호출.

---

## 5. 연동 지점 (실제 서비스 개발)

1. **대화 API 진입**  
   `unified_chat_api.generate_chat_response()`  
   - 이미 `context["_workspace_intent"]`, `context["_workspace_tool_route"]` 세팅됨.

2. **도구 실행 분기**  
   - `context.get("_workspace_tool_route")`가 있으면  
     `tool == "project_create"` 등으로 분기하여 해당 API 호출.  
   - 실행 결과를 `context["_workspace_tool_result"]`에 넣고,  
     기존 LLM 파이프라인에서 “도구 결과를 요약해 사용자에게 전달”하도록 프롬프트 보강.

3. **스트리밍**  
   - 도구 실행이 끝난 뒤, “실행 결과 요약”만 스트리밍으로 생성하거나,  
     구조화 응답(예: 새 프로젝트 ID, 다운로드 URL)을 클라이언트에 먼저 보내고 요약은 선택.

4. **모델 라우팅**  
   - 모델 선택 UI 없음 → 품질/도메인/도구 유형에 따라 백엔드에서 모델을 선택 (파이프라인 설정 또는 라우터 테이블).

---

## 6. 자이그랩스·카톡 여론 분석 등 도메인 적용

- **동일 4개 영역** 유지: 검색/새대화, 프로젝트, 최근 대화, 사용자.  
- **도메인별 도구만 추가**:  
  - 예: `opinion_summary`, `sentiment_trend`, `chat_export_by_period`  
- **의도 패턴/LLM 라벨**을 해당 도메인 발화에 맞게 확장.  
- **프로젝트** = “여론 분석 프로젝트”, “카톡 채널 분석” 등 하나의 단위로 두고, 기존 프로젝트/대화 모델 재사용.

---

## 7. 참고 문서

- [AI_WORKSPACE_MINIMAL_UI.md](./AI_WORKSPACE_MINIMAL_UI.md) — 4개 영역·요청 시 생성 기능
- [WORKSPACE_INTENT_ROUTING.md](./WORKSPACE_INTENT_ROUTING.md) — 의도 정의·라우팅 스펙·구현 위치
- [QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md](./QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md) — 파이프라인·라우팅

이 아키텍처를 기준으로 “생성형 메뉴”를 단계적으로 확장하면 됩니다.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
