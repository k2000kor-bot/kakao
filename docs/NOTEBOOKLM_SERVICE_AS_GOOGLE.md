# 구글 노트북 LLM과 동일한 서비스 구현 명세

이 프로젝트의 **노트북 LLM**을 구글 NotebookLM과 **동일한 방식**으로 쓰도록 정리한 명세입니다. 이 구조를 지키면 나중에 **해당 서비스를 체계적으로 학습시키는** 흐름(소스 추가 → 대화·스튜디오 → 품질 개선)을 일관되게 적용할 수 있습니다.

---

## 1. 구글 NotebookLM ↔ 이 프로젝트 매핑

| 구글 NotebookLM | 이 프로젝트 | 설명 |
|------------------|-------------|------|
| **노트북(Notebook)** | **프로젝트(Project)** | 하나의 “학습 단위”. 노트북 하나 = 프로젝트 하나. |
| **소스(Sources)** | **노트북 소스(notebook-sources)** | PDF·워드·웹·텍스트·이미지 등. 프로젝트별로 추가·삭제·목록 조회. |
| **대화(Chat)** | **프로젝트 선택 후 대화** | 해당 프로젝트의 소스(projectKnowledge)만 근거로 답변. |
| **스튜디오(Studio)** | **노트북 스튜디오** | 보고서·학습 가이드·퀴즈·플래시카드·요약·마인드맵·슬라이드 등. 소스 기반 생성. |
| **추천 질문** | **suggestedQuestions** | 소스 기반 추천 질문 노출. |
| **분석** | **분석 모달** | 소스 요약·키워드·미리보기. |

---

## 2. 서비스를 “그대로” 쓰기 위한 동작 원칙

- **한 노트북 = 한 프로젝트**  
  주제·과제·도메인마다 프로젝트(노트북)를 따로 두고, 그 안에만 소스를 넣습니다.
- **답변은 “그 노트북의 소스만” 근거로**  
  대화·스튜디오는 해당 프로젝트의 `projectKnowledge`(노트북 소스 + 지침)만 사용합니다. (백엔드 `load_project_notebook_context_filtered` → `projectKnowledge` → DeepSeek/LLM.)
- **소스 추가 방식**  
  파일 업로드(PDF·워드·txt·이미지), URL, 텍스트 붙여넣기, (선택) YouTube 검색 후 학습. Drive는 스텁.
- **체계적 학습**  
  “체계적으로 학습시킨다” = **노트북(프로젝트) 단위로 소스를 순서대로 넣고, 같은 노트북에서만 대화·스튜디오를 쓰는 것**입니다. 이렇게 하면 나중에 “어떤 노트북에 어떤 소스가 있고, 어떤 답이 나왔는지”를 일관되게 관리·개선할 수 있습니다.

---

## 3. 구현 상태 (구글과 동일하게 쓰기 위한 체크)

| 기능 | 구글 NotebookLM | 이 프로젝트 | 비고 |
|------|-----------------|-------------|------|
| 노트북 생성 | 새 노트북 만들기 | 프로젝트 생성 (이름·설명·지침·태그) | ✅ 동일 개념 |
| 소스 추가 | PDF, 웹, 텍스트, 붙여넣기, Drive | PDF·워드·txt·이미지, URL, 텍스트, YouTube 검색 후 학습. Drive 스텁 | ✅ 파일·URL·텍스트 동일 |
| 소스 목록 | 왼쪽 패널 출처 목록 | 노트북 소스 목록 (소스 추가·관리 모달, API) | ✅ |
| 소스 삭제 | 소스별 삭제 | DELETE notebook-sources/{source_id} | ✅ |
| 소스 선택 | 대화에 반영할 소스 체크 | selectedSourceIds, source_ids API 전달 | ✅ |
| 대화 | 소스 기반 답변 | **질문·답변 시 항상** DeepSeek 등 LLM 연결( generate_chat_response ). 프로젝트 있으면 노트북 소스 반영. 메인 대화(/api/chat·/api/chat/stream) 동일 | ✅ |
| 스튜디오 | 보고서·퀴즈·오디오 등 | 보고서·학습가이드·퀴즈·요약·플래시카드·마인드맵·슬라이드·데이터표·오디오 | ✅ |
| 추천 질문 | 소스 기반 질문 제안 | getNotebookSuggestedQuestions, 추천 질문 칩 | ✅ |
| 분석 | 소스 요약·키워드 | 분석 모달 (소스 수·키워드·미리보기) | ✅ |

위 표대로 쓰면 **구글 노트북 LLM과 동일한 서비스**로 사용할 수 있습니다.

- **화면 레이아웃(구글 동일)**: 노트북 LLM 화면은 **3열** — 왼쪽 **출처(소스)** 목록·분석 버튼·**지식 추가**(딥시크에 반영될 지식을 여기에 쌓기), 가운데 **대화**(설정·추천 질문·대화·입력), 오른쪽 **스튜디오**(유형 선택·생성·이력). 반응형에서 좁은 화면은 1열로 전환.
- **노트북 LLM = 딥시크**: 대화·스튜디오 생성은 모두 `generate_chat_response` → `llm_service`(딥시크) 경로를 사용합니다. 왼쪽 출처에 쌓은 지식(소스·지식 추가)은 `projectKnowledge`로 로드되어 딥시크 답변에 반영됩니다.

---

## 4. 체계적으로 학습시키는 방법 (운영 흐름)

나중에 “해당 서비스를 체계적으로 학습시킨다”는 것은 아래 순서를 반복하는 것입니다.

1. **노트북(프로젝트) 생성**  
   - 주제·도메인별로 하나씩. (예: “재건축 정리”, “세무 Q&A”)
2. **지침 입력**  
   - 프로젝트 설정에서 “이 노트북에서 답할 때 따를 규칙·톤·대상”을 지침으로 입력. (예: “조합원 대상, 3문장 이내”)
3. **소스 추가 (순서 권장)**  
   - 먼저 기준 문서(PDF·워드) → 그다음 보조(URL·텍스트) → 필요 시 이미지(플레이스홀더로 등록).  
   - 소스 추가 모달: 파일 업로드, URL, 텍스트 붙여넣기, (기능 있는 경우) YouTube 검색 후 학습.
4. **같은 노트북에서만 대화**  
   - 해당 프로젝트를 선택한 상태에서만 질문·요청. “이 자료 요약해줘”, “정리해줘” 등.
5. **스튜디오로 정리물 생성**  
   - 같은 노트북에서 보고서·학습 가이드·퀴즈·요약 등을 생성해, 소스 기반 결과물을 누적.
6. **품질 개선**  
   - 답변이 어긋나면 지침 보강 또는 소스 추가/삭제로 “이 노트북”만 조정. (다른 노트북은 영향 없음.)

이 흐름을 지키면 **노트북 단위로** 체계적으로 학습·운영할 수 있습니다.

---

## 5. API·코드 위치 (개발·학습 자동화 시 참고)

| 목적 | API·함수 | 비고 |
|------|----------|------|
| 노트북 = 프로젝트 | GET/POST/PUT/DELETE /api/projects, /api/projects/{id} | 프로젝트 CRUD |
| 소스 목록 | GET /api/projects/{id}/notebook-sources | 소스 + 보이스 소스 |
| 소스 추가(텍스트) | POST /api/projects/{id}/notebook-sources | body: title, content, type |
| 소스 추가(파일) | POST /api/projects/{id}/notebook-sources/from-file | multipart, PDF·워드·txt·이미지 |
| 소스 추가(URL) | POST /api/projects/{id}/notebook-sources/from-url | body: url |
| 소스 추가(YouTube 검색) | POST /api/projects/{id}/notebook-sources/from-youtube-search | query, max_videos |
| 소스 삭제 | DELETE /api/projects/{id}/notebook-sources/{source_id} | |
| 노트북 컨텍스트 로드 | load_project_notebook_context_filtered(project_id, source_ids) | projectKnowledge 구성 |
| 대화 시 반영 | unified_chat_api에서 context.projectKnowledge | 자료 수집·논리·DeepSeek 전달 |
| 스튜디오 생성 | POST /api/projects/{id}/notebook-studio/generate | type: report, study_guide, quiz 등 |
| 추천 질문 | GET /api/projects/{id}/notebook-suggested-questions | |

### 5.1 지식·전문가·글쓰기 스타일 (대화 생성 시 반영)

노트북 LLM 대화/스튜디오 생성 시 다음 옵션이 **요청 context**에 포함되며, 백엔드에서 `_style_and_tone_instruction`으로 합쳐져 LLM 생성에 반영됩니다.

| 항목 | 프론트 필드 | 백엔드 반영 |
|------|-------------|-------------|
| 글쓰기 스타일 | `writing_style`, `person_style` | `unified_chat_api` 4단계 스타일 지시 |
| 지식(도메인) | `domain_instruction` | 동일 파이프라인에 "지식/도메인: …" 추가 |
| 전문가 관점 | `expert_instruction` | 동일 파이프라인에 "전문가: …" 추가 |

- **프론트**: `NotebookLLM.tsx`에서 스트리밍/비스트리밍 모두 `llmContext`에 위 필드를 넣어 `notebookLLMService` / `notebookLLMStreamingService`로 전달.
- **백엔드**: `project_session_api`가 `body.context`를 그대로 `generate_chat_response(..., ctx)`에 넘기고, `unified_chat_api._run_pre_generation_pipeline` 4단계에서 `ctx`의 `writing_style`, `domain_instruction`, `expert_instruction`을 읽어 `_style_and_tone_instruction`에 이어 붙임.
- **검증**: 프론트는 `selectedDomains.length > 0`일 때 `DOMAIN_TYPE_TO_KO`로 한글 도메인명을 붙여 `domain_instruction`·`expert_instruction`을 설정함(스트리밍·비스트리밍 동일). 백엔드는 `unified_chat_api` 1994~2050행 4단계와 `llm_service`에서 `[스타일 지시]`·`[프로젝트 컨텍스트·지침·참고 소스]`로 반영.

---

## 6. 관련 문서

- [DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md](./DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md) — 딥시크 설치→구동→개발→학습 한 흐름 가이드(체크리스트·연결·배포 전 확인)
- [PROJECT_NOTEBOOK_LLM_USER_GUIDE.md](./PROJECT_NOTEBOOK_LLM_USER_GUIDE.md) — 사용자용 노트북·소스·대화·스튜디오 가이드  
- [NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md](./NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md) — 화면 기능·도메인 지식 체크리스트  
- [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) — Phase별 로드맵  
- [DEEPSEEK_LEARNING_AND_MATERIALS.md](./DEEPSEEK_LEARNING_AND_MATERIALS.md) — 학습·자료 넣는 방법(딥시크 연동)

---

**요약**: 이 프로젝트는 **노트북 = 프로젝트, 소스 = notebook-sources, 대화·스튜디오 = 소스 기반**으로 구글 노트북 LLM과 **동일한 서비스**로 동작합니다. “체계적으로 학습시킨다”는 것은 **노트북(프로젝트) 단위로 소스를 넣고, 같은 노트북에서만 대화·스튜디오를 쓰는** 위 §4 흐름을 따르면 됩니다.
