# 딥시크: 학습·논리와 자료 넣는 방법

딥시크(DeepSeek)가 **어떤 자료를 학습해서**, **어떤 논리**로 답변하는지, **자료는 어디에 어떻게 넣으면 되는지** 정리한 문서입니다.

---

## 1. 전체 흐름 (입력 → 자료·논리 → 답변)

사용자가 **질문·요구**를 입력하면 다음 순서로 답변이 만들어집니다.

| 단계 | 내용 | 딥시크에 전달되는 것 |
|------|------|----------------------|
| **1. 자료 수집** | 웹 연구·프로젝트 지식·대화 맥락 수집 | `[수집 자료]` 요약 |
| **2. 내용 정리** | 수집한 내용을 요약·정리 | `_collected_materials_summary` |
| **3. 논리 구성** | 질문→요구→출처 순의 논리 구조 설계 | `[논리 구성 지침]` (`_logical_structure_outline`) |
| **4. 스타일 지시** | 말투·관점·응답 스타일 | `_style_and_tone_instruction` |
| **5. LLM 호출** | 위 모든 것을 컨텍스트로 DeepSeek에 전달 | **“요구와 질문에 맞는 논리적 사고로, 수집 자료를 반드시 참고해 답변하세요”** 지시와 함께 생성 |

즉, **“학습”은 “프로젝트/대화/웹에서 수집한 자료를 컨텍스트로 넣는 것”**이고, **“논리”는 “질문→요구→출처 순의 구조를 지시하는 것”**입니다.  
별도로 모델을 fine-tuning 하거나 학습시키는 과정은 없고, **매 요청마다 위 자료·논리 지시를 프롬프트에 넣어서** 답변 품질을 높입니다.

---

## 2. “학습”이 되는 자료 — 어디에 무엇을 넣나

시스템이 **자동으로 수집해 DeepSeek에 넘기는 자료**는 세 가지입니다.

### 2.1 프로젝트 지식 (가장 중요 — 여기 넣으면 “학습”됨)

- **어디에 넣나**: **프로젝트** 하나를 만든 뒤, 그 프로젝트 안에 **소스(파일·지침·웹·텍스트)** 를 넣습니다.
- **무엇을 넣나**  
  - **파일 업로드**: 프로젝트 설정(편집) 모달·소스 추가에서 **PDF, 워드(docx/doc), 텍스트(txt), 이미지(png/jpg/gif/webp)** 업로드. PDF·워드·텍스트는 내용이 추출되어 학습 소스로 저장되고, 이미지는 플레이스홀더로 등록됩니다.  
  - **프로젝트 지침**: 같은 모달의 “지침” 텍스트. (예: “이 프로젝트는 도시정비 관련이야. 조합원 대상 문구로 써줘.”)  
  - **웹 소스**: 프로젝트에 등록한 URL·웹 소스.  
  - **텍스트 붙여넣기**: 소스 추가 시 텍스트로 붙여넣은 내용.  
  - **(선택) YouTube 검색 후 학습**: “특정인 검색 후 학습” 등으로 노트북 소스 추가한 내용.
- **어떻게 반영되나**  
  - 대화 시 해당 **프로젝트를 선택한 상태**에서 메시지를 보내면,  
  - 백엔드가 `load_project_notebook_context_filtered`로 프로젝트 노트북/소스 내용을 읽고,  
  - `context["projectKnowledge"]`에 넣은 뒤,  
  - **1단계 자료 수집**에서 `[프로젝트_지식]`으로 요약되어 DeepSeek 프롬프트 **앞부분**에 `[프로젝트 컨텍스트·지침·참고 소스]` 블록으로 들어갑니다.  
- **정리**: **“학습시키고 싶은 자료”는 전부 프로젝트 소스·지침에 넣으면 됩니다.**  
  - 프로젝트 생성 → 프로젝트 설정에서 파일/지침/웹/텍스트 추가 → 해당 프로젝트 선택하고 대화.

### 2.2 대화 맥락

- **어디에 넣나**: 넣을 필요 없음. **최근 대화(역할+내용)** 가 자동으로 수집됩니다.
- **어떻게 반영되나**: 최근 4턴 정도가 `[대화_맥락]`으로 요약되어 1단계 자료에 포함됩니다.

### 2.3 웹 연구 결과

- **어디에 넣나**: 사용자가 **/웹검색** 등 웹 리서치를 켜서 질문하면, 웹 검색 결과가 자동으로 수집됩니다.
- **어떻게 반영되나**: `[웹_연구]`로 1단계 자료에 들어가고, 논리 통합 후 DeepSeek에 전달됩니다.

---

## 3. “논리”를 어떻게 쓰게 하냐

- **자동 구성**:  
  - `parsed_input`(질문·요구사항·의도)이 있으면,  
  - **3단계 논리 구성**에서  
    - “1) [질문에 대한 직접 답변]”  
    - “2) [요구사항별 상세]”  
    - “3) [참고·출처]”  
  순서로 `_logical_structure_outline`이 만들어지고,  
  **“아래 [논리 구성 지침]에 따라 요구와 질문에 맞는 논리적 사고로 답변 구조를 잡으세요. 수집된 자료를 이 구조에 맞게 활용하세요.”** 라는 `_structure_hint`와 함께 DeepSeek에 넘어갑니다.
- **파이프라인 preset**:  
  - `pipeline_tuning_config.json`의 `quality_presets`에서  
    - `basic`: `logical_structure: false` → 논리 구성 단계 생략.  
    - `enhanced` / `ultimate`: `logical_structure: true` → 위 논리 구성이 적용됩니다.  
  - 즉, **논리**를 쓰게 하려면 enhanced/ultimate 같은 preset을 쓰면 됩니다(기본이면 unified_chat_api에서 파이프라인 사용 시 둘 다 true).

---

## 4. 자료를 “넣는” 방법 요약 (실무 체크리스트)

1. **프로젝트 만들기**  
   - 대화/프로젝트 화면에서 “새 프로젝트 만들기”로 프로젝트 생성.

2. **자료 넣기 (학습시킬 내용)**  
   - 해당 프로젝트 **설정(편집) 모달** 열기.  
   - **지침**: 이 프로젝트의 목적, 톤, 제약(예: “조합원 대상”, “3문장 이내”)을 텍스트로 입력.  
   - **소스 추가**:  
     - 파일 업로드,  
     - 텍스트 붙여넣기,  
     - 웹 소스,  
     - (기능 있는 경우) YouTube 검색 후 학습 등으로 **참고할 문서·데이터**를 전부 넣기.

3. **대화할 때**  
   - **반드시 그 프로젝트를 선택한 상태**에서 대화.  
   - 그러면 위에 넣은 지침·소스가 `projectKnowledge` → 자료 수집 → DeepSeek 컨텍스트로 전달됩니다.

4. **논리까지 쓰게 하려면**  
   - 파이프라인을 쓰는 경로(일반 대화 등)에서는 **enhanced/ultimate** preset이면 자동으로 논리 구성이 켜져 있음.  
   - 질문·요구를 문장에 담아 입력하면(예: “OO에 대해 설명해줘. 그리고 예시 2개 들어줘.”), `parsed_input`과 논리 구성이 적용됩니다.

---

## 5. 참고 문서·코드 위치

| 목적 | 참고 |
|------|------|
| **설치→구동→개발→학습 한 흐름** | [DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md](./DEEPSEEK_INSTALL_RUN_DEVELOP_LEARN.md) — 체크리스트·지금 연결하기·배포 전 확인 포함 |
| DeepSeek 설치·API·환경 변수 | [DEEPSEEK_SETUP.md](./DEEPSEEK_SETUP.md) |
| 개발 순서·입력→논리·자료→답변 흐름 | [DEEPSEEK_DEVELOPMENT_ORDER.md](./DEEPSEEK_DEVELOPMENT_ORDER.md) §입력→논리·자료→DeepSeek 답변 흐름, §정보 수집·학습·정보 찾기 능력 |
| 프로젝트 지침·소스가 LLM에 전달되는 경로 | [DEEPSEEK_SETUP.md](./DEEPSEEK_SETUP.md) §4 프로젝트 생성·운영 출력과 DeepSeek 연동 |
| 파이프라인 단계(자료 수집·논리·스타일) | `backend/api/unified_chat_api.py` — `_run_pre_generation_pipeline` |
| 프로젝트 지식 로드·projectKnowledge 채우기 | `backend/api/unified_chat_api.py` (load_project_notebook_context_filtered, project_instructions 반영), `backend/api/project_session_api.py` — `load_project_notebook_context_filtered`, `load_project_notebook_data` |
| 논리 구성 on/off | `backend/pipeline_tuning_config.json` — `quality_presets.*.pipeline_steps.logical_structure` |

---

**한 줄 요약**:  
- **학습** = 프로젝트에 넣은 **지침 + 소스(파일/텍스트/웹)** 가 매 요청 시 `projectKnowledge`로 로드되어 DeepSeek 컨텍스트로 들어가는 것.  
- **논리** = 파이프라인 3단계에서 **질문→요구→출처** 순의 구조를 지시하는 것.  
- **자료 넣는 곳** = **프로젝트 설정(지침 + 소스 추가)** 이고, **그 프로젝트를 선택한 대화**에서만 해당 자료가 사용됩니다.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
