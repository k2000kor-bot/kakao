# 답변 품질·검색·자료 활용

부족한 지식을 검색하거나 관련 자료를 활용해 답변 품질을 높이기 위한 동작 정리입니다.

---

## 1. 흐름 요약

1. **프론트**: 사용자 메시지와 응답 스타일을 바탕으로 `enable_web_research` 또는 `prefer_informed_answer`를 context에 넣어 백엔드로 전달.
2. **백엔드**: `generate_default_response(message, context)`에서  
   - 웹 연구 필요 시 검색·자료 수집  
   - MD 문서 QA·지능형 엔진·폴백 순으로 답변 생성  
   - 수집한 자료를 답변에 논리적으로 반영해 출력.

---

## 2. 프론트엔드 (context 플래그)

### 2.1 `enable_web_research`

- **위치**: `src/utils/chatInputUtils.ts` — `buildFeatureContextFromMessage()`
- **설정 조건**:  
  - 슬래시/명시 명령: `/웹검색`, `/검색`, `[웹검색]` 등  
  - 또는 메시지에 **검색·자료 활용 패턴** 포함 시  
    - 검색/찾아/알려/최신/뉴스/웹/리서치/출처/근거/정보/현재/트렌드/동향 등  
    - 설명해줘/설명해/뭐야/무엇이/왜/어떻게/정의/개념/원리/근거를/출처를/확인해/소개해/개요/지식/참고/관련 자료 등
- **효과**: 백엔드에서 웹 연구 단계를 수행하고, 결과를 답변에 반영.

### 2.2 `prefer_informed_answer`

- **위치**: 동일 `buildFeatureContextFromMessage()`
- **설정 조건**:  
  - `enable_web_research`가 아직 설정되지 않았고  
  - 다음 중 하나일 때  
    - **질문/설명 패턴**: `?`, 뭐야, 무엇, 왜, 어떻게, 언제, 어디, 누가, 설명, 알려, 소개, 개념, 정의, 요약/비교/차이점/장단점/분석/정리, 배경/이유/원인/근거/기준/방법/절차/과정/역할/기능/효과/영향  
    - **품질·상세 요청 패턴**: 상세히, 자세히, 구체적으로, 예시와 함께, 단계별, 논리적으로, 근거를 들어, 보고서, 대안, 권장, 추천, 결론, 정리하면, 설명 부탁, 알려 주세요, 품질 높은, 깊이 있는, 전문적으로, 핵심만, 요점, 참고해서, 관점에서 등  
    - **구조화 입력**: `질문:` / `요구사항:` (또는 `요구:`) 헤더로 파싱된 섹션이 있는 경우 (`parseQuestionRequirementSections` 결과가 question/requirements 비어 있지 않거나 hasBoth)
- **효과**: 백엔드에서 `prefer_informed_answer`만 있어도 웹 연구를 허용(아래 참고).

### 2.3 응답 스타일(상세/종합)

- **위치**: `src/components/ChatGPTInterface.tsx` — `chatContextWithHistory`
- **설정 조건**: `responseStyle === 'detailed'` 또는 `responseStyle === 'comprehensive'`
- **전달 값**: `prefer_informed_answer: true`
- **효과**: 상세/종합 모드에서도 검색·자료 활용을 사용해 근거 있는 답변 생성.

### 2.4 생성 답변 능력 최대 활용 (품질 상향)

- **위치**: `src/components/ChatGPTInterface.tsx` — 전송/재생성/편집 시 `effectiveQuality` 계산
- **동작**:  
  - context에 `enable_web_research` 또는 `prefer_informed_answer`가 있으면 **품질을 한 단계씩 상향**  
  - 사용자 선택이 `basic`(간결)이면 → 해당 요청만 `enhanced`로 전송  
  - 사용자 선택이 `enhanced`(Auto)이면 → 해당 요청만 `ultimate`로 전송  
  - 사용자 선택이 이미 `ultimate`(상세)이면 유지
- **기본 응답 모드**: 저장된 값이 없을 때 **상세(detailed)** 로 두어 API 품질을 `ultimate`로 사용(파이프라인·지능형 엔진·논리 구성 전체 활용).
- **효과**: 질문/설명/요약/비교 등 검색·자료 활용이 필요한 요청에서 자동으로 enhanced·ultimate가 사용되어 답변 생성 능력을 최대한 활용.

### 2.5 요구·질문에 맞게 유연한 생성 (adapt_answer_to_request)

- **단일 소스**: `src/services/generationPromptBuilder.ts` — `ADAPT_ANSWER_TO_REQUEST_INSTRUCTION` (ChatGPTInterface·buildUnifiedChatContext에서 사용)
- **전달**: ChatGPTInterface(일반 전송·재생성·편집·편집 스트리밍), SimpleChatView·UltimateChatGPTInterface·FileAnalysisChatSystem(buildUnifiedChatContext) → context.adapt_answer_to_request
- **내용 요약**: 답변의 길이·형식·깊이를 질문·요구에 맞춰 유연하게 조절. **글쓰기 형식(보고서·칼럼·요약·가이드·사건조사 형식 등)과 스타일(어투·톤)을 요구에 맞게 구성**하고, **결과물의 구성(서론·본론·결론, 항목·섹션)을 질문·요구에 맞게 잡음**. **생성로직**(사실 정리→맥락·원인→분석·조사 내용→결론·시사점)에 맞게 단계적으로 서술. **사건조사 형식** 요청 시 개요·경과·원인 분석·관계자·결론·시사점 등 조사보고 구조로 작성. 짧은 질문은 간결하게, 상세·분석·비교·예시 요청 시 충실히. 요구에 형식이 명시되면 반드시 따름.
- **백엔드**: `unified_chat_api` 파이프라인에서 `_adapt_answer_to_request_instruction`으로 넣고, `intelligent_response_engine` considerations에 반영. [CHAT_CONTEXT_CONTRACT](./CHAT_CONTEXT_CONTRACT.md) §1·§3 참고.

---

## 3. 백엔드 (웹 연구 허용)

- **위치**: `backend/api/unified_chat_api.py` — `generate_default_response(message, context)` 및 스트리밍 폴백
- **스트리밍 폴백**: 빈/짧은 응답 시 `generate_default_response(question, normalized_context)` 호출로, 스트리밍 경로에서도 context(prefer_informed_answer 등)가 반영됨.
- **로직**:  
  - `enable_web_research = context.get("enable_web_research")`  
  - `prefer_informed_answer = context.get("prefer_informed_answer")`  
  - **`prefer_informed_answer`가 True이고 `enable_web_research`가 False면**  
    → `enable_web_research = True` 로 설정해 웹 연구 단계 수행.
- **이후 파이프라인**:  
  - 웹 연구 필요성 판단 → (필요 시) 정보 격차 분석·웹 연구·결과 종합  
  - MD 문서 QA 시도 → 지능형 답변 엔진 → 웹 연구 결과와 논리적 통합 → 응답 검증·출력.

---

## 4. UI 안내

- **입력 placeholder**: `"질문·요구사항을 입력하세요 (요약·비교·분석 시 품질 향상)"` — 질문·요구 형식 입력을 유도.
- **입력 힌트**:  
  - 입력이 비어 있을 때: 푸터에 `" · 질문·요구 형식으로 쓰면 품질 향상"` 표시.  
  - 입력 시 검색·자료가 활용되면: `" · 검색·자료 활용해 답변"` 표시 (`willUseSearchOrInformed`).
- **품질 상향 연동**: `ChatGPTInterface`에서 `featureCtx.enable_web_research` 또는 `featureCtx.prefer_informed_answer`가 있으면 `effectiveQuality`를 한 단계 상향해 API에 전달(basic→enhanced, enhanced→ultimate).

## 5. 입력 예시 (품질·검색 활용 유도)

- **질문 형식**: "도시정비법 요건이 뭐야?", "A와 B 차이점 알려줘"
- **요구 형식**: "상세히 설명해줘", "구체적으로 알려 주세요", "단계별로 정리해줘", "검토 의견 부탁"
- **구조화**: `질문: ...` / `요구사항: ...` (또는 `요구: ...`) — 파싱 시 `prefer_informed_answer` 자동 설정

## 6. ChatGPT/Gemini와 비교·정확도

- 질문·요구에 대한 답변이 ChatGPT/Gemini와 다르게 나오는 **원인과 개선**은 [ANSWER_ACCURACY_CHATGPT_GEMINI_COMPARISON.md](./ANSWER_ACCURACY_CHATGPT_GEMINI_COMPARISON.md) 참고 (스텁 도구 조기 반환 제거, enhanced/ultimate 직접 LLM 우선).

## 7. 확인 포인트

- 질문/설명 요청 시 context에 `enable_web_research` 또는 `prefer_informed_answer`가 넘어가는지.
- 응답 스타일을 "상세" 또는 "종합"으로 두었을 때 `prefer_informed_answer`가 설정되는지.
- 입력 시 힌트에 "검색·자료 활용해 답변"이 표시되는지.
- 백엔드 로그에서 웹 연구 수행·MD QA·지능형 엔진 경로가 기대대로 동작하는지.
- **API 호출 시**: `/api/chat`·`/api/unified/chat` 호출 시 body에 `quality`(basic | enhanced | ultimate)를 포함하면 파이프라인·max_tokens가 적용됨. 미포함 시 백엔드 기본값 enhanced 사용. (chatService, unifiedAPI, IntegratedMasterInterface, FileAnalysisChatSystem 등 일원화 반영됨.)

## 8. 검증·배포 (로컬)

프로젝트 루트 `kakao-frontend/`에서 실행합니다.

| 목적 | 명령 |
|------|------|
| 완성도 (타입·린트·P4 148) | `npm run verify:completion` |
| 뷰·라우트 (20 suites, 105) | `npm run test:views -- --watchAll=false` |
| 빌드 포함 배포 전 점검 | `npm run deploy:check` |
| 백엔드 재시작 (프록시 5002) | `npm run restart:backend` |

에디터/에이전트 터미널이 실행되지 않을 때는 위 명령을 **로컬 터미널**에서 직접 실행하는 것이 가장 확실합니다. [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) §6, [BACKLOG.md](../BACKLOG.md) 참고.

---

*최종 반영: 입력 힌트·placeholder, 질문/요구·품질 패턴 확대, 구조화 입력(질문:/요구사항:) prefer_informed_answer, effectiveQuality 연동, 상세/종합 모드 연동, §8 검증·배포 명령*
