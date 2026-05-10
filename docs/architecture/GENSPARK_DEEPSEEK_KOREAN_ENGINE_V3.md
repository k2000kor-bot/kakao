# Genspark형 문제 해결 답변 엔진 + DeepSeek 고도화 + 한국어 이해 강화 통합 개발 문서

**버전 3.0**  
**목적**: 현재 개발 중인 답변 시스템을 **과업 완결형 멀티모델 에이전트**로 전환하면서, 특히 **한국어 문맥 이해·화행 해석·장르 적응·어투 제어**를 핵심 모듈로 둔다.

> 본 계층은 **단순 번역·한국어 지원이 아니다.** 생략 복원, 높임/반말·공격성·비꼼 구분, 조합원 카톡체·커뮤니티체·기사체·보고서체 판별, 띄어쓰기·오타·줄바꿈 노이즈 내성, 부동산/법률/행정/카톡 혼합 도맨, **맥락 의존 짧은 문장의 의도 해석**까지 포함한다.

**관련 문서**

- Genspark식 에이전트 답변(과업 완결·파이프라인) v1: [`GENSPARK_STYLE_ANSWER_ENGINE_V1.md`](./GENSPARK_STYLE_ANSWER_ENGINE_V1.md)
- **DeepSeek 이중 추론·검수 통합 v2**: [`GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md`](./GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md)  
  → v3에서는 그 **앞·뒤**에 한국어 이해·스타일 계층을 삽입한다.
- 레포 구현 순서 매핑: [`GENSPARK_REPO_IMPLEMENTATION_ORDER.md`](./GENSPARK_REPO_IMPLEMENTATION_ORDER.md)
- 한국어 계층 구현 로드맵: [`KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md`](./KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md)
- 파이프라인 총론: [`QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md`](../QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md)
- 응답 정리(프롬프트 누출 방지): [`guides/RESPONSE_CLEANING.md`](../guides/RESPONSE_CLEANING.md)

**외부 참고 (DeepSeek API)** — v2 문서와 동일하게 API 변경 시 재확인.

---

## 1. 개발 목표

본 시스템의 목표는 단순히 질문에 답하는 것이 아니라, 사용자의 요청을 **실제 업무 요청**으로 해석하고, 필요 시 계획·분석·문서화·검수까지 포함하는 **완결형 응답 엔진**을 만드는 것이다.

여기에 추가되는 한국어 이해 강화의 목적은 다음과 같다.

### 1.1 한국어 특유의 모호성 해소

한국어는 주어, 목적어, 시점, 태도, 책임 주체가 생략되는 경우가 많다. 문장 표면만 해석하면 의도가 왜곡된다.

예:

- “이거 반박해줘”
- “좀 세게”
- “카톡용으로”
- “극우적으로”
- “중립 팩트체크”
- “이 말투 말고 더 사람처럼”

이런 요청은 영어권 구조처럼 명시적이지 않기 때문에, **직전 문맥, 사용자 목적, 장르, 공격성 수준, 실제 사용처**를 함께 해석해야 한다.

### 1.2 한국어 장르 적응 능력 강화

같은 내용도 아래처럼 전혀 다른 스타일로 요청한다.

- 카카오톡 메시지, 부동산 카페 게시글, 기사체, 보고서체, 공지문, 민원서, 변호사 검토문, 조합원 설득문, 댓글체, 중립 팩트체크, 분노형 감정 메시지 등

단순 tone control이 아니라 **한국어 장르별 서술 규칙**을 학습·분리해 처리해야 한다.

### 1.3 실제 한국어 사용자 관점의 답변 자연스러움

흔한 문제:

- 지나치게 번역투, 어색한 조사, 높임말 불안정, 반복 연결어, 실무 문장처럼 안 보임, 기사체와 카톡체 혼합, 감정 톤 부자연스러움

시스템은 **의미 정확도 + 문체 자연스러움 + 장르 적합성**을 함께 평가해야 한다.

---

## 2. 핵심 설계 철학

### 2.1 한국어는 단순 텍스트가 아니라 화행이다

같은 문장도 어미, 조사, 생략, 줄바꿈, 말끝 처리에 따라 완전히 다른 의미가 될 수 있다.

예:

- “그건 좀 아니지 않나요” / “그건 좀 아니죠” / “그건 아니지” / “그건 아니잖아요” / “그건 아니죠 ㅋㅋ” / “그건 아닌데요?”

표면상 비슷하지만 화행은 완곡한 반대, 단호한 반대, 공격적 비판, 비아냥, 조롱 섞인 반박, 감정 억제형 지적 등으로 갈린다.

→ **문장 의미 분석**과 별도로 **화행 분석(speech act analysis)** 이 필요하다.

### 2.2 한국어 이해는 생성 이전 계층에서 처리해야 한다

생성 전에 아래를 분리한다.

1. 표면 텍스트 정규화  
2. 오타/띄어쓰기 보정 추정  
3. 생략 요소 복원  
4. 화자 의도 추정  
5. 대상 독자 추정  
6. 장르 추정  
7. 감정 강도 추정  
8. 허용 가능한 톤 범위 판정 (안전 정책과 결합)

즉 **한국어 이해 전처리 레이어**가 따로 있어야 한다.

### 2.3 한국어 답변 품질은 “정답”보다 “체감 자연스러움”이 중요할 수 있다

사용자가 원하는 결과 예:

- “실제 사람이 쓴 것 같다”, “카톡에 바로 보낼 수 있다”, “조합원 커뮤니티에 올려도 안 어색하다”, “기사/법률 검토문처럼 보인다”

품질 기준에 **한국어 장르 적합성**과 **문체 현실감**을 추가한다.

---

## 3. 전체 시스템 구조

### 3.1 확장 아키텍처 (v3)

```text
[User Input]
   ↓
[Korean Language Understanding Layer]   ← v3: 이해 (입력)
   ↓
[Intent / Task Classifier]
   ↓
[Task Planner]
   ↓
[Context Slot Filler]
   ↓
[Blueprint Generator]
   ↓
[Primary Draft Generator]
   ↓
[DeepSeek Reviewer Layer]
   ↓
[Korean Style / Tone Refiner]         ← v3: 표현 (출력)
   ↓
[Consistency / Safety / Genre Validator]
   ↓
[Final Output]
```

### 3.2 새로 추가되는 핵심 모듈 (2개)

| 모듈 | 역할 |
|------|------|
| **A. Korean Language Understanding Layer** | 입력 한국어를 의도·장르·감정·생략·관계 맥락이 포함된 **요청 객체**로 변환 |
| **B. Korean Style / Tone Refiner** | 초안을 실제 한국어 사용자·채널에 맞게 다듬음 |

앞단 **이해**, 뒷단 **표현**으로 역할을 나눈다.

---

## 4. 한국어 이해 강화 모듈 설계

### 4.1 Korean Language Understanding Layer

입력을 단순 텍스트가 아니라 **의도, 장르, 감정, 생략, 관계 맥락이 포함된 요청 객체**로 변환한다.

#### 입력 예시

“위 내용 반박해줘 카톡용으로 너무 딱딱하지 않게 근데 세게”

#### 내부 변환 결과 예시 (논리 모델)

```json
{
  "normalized_text": "위 내용을 반박하는 카카오톡용 문장을 작성해줘. 너무 딱딱하지 않되, 강한 어조를 사용해줘.",
  "task_type": "rebuttal_writing",
  "genre": "kakao_message",
  "tone": "strong_but_conversational",
  "target_audience": "peer_group",
  "emotion_level": 0.72,
  "formality": "semi-formal",
  "implicit_constraints": [
    "짧아야 함",
    "복붙 가능해야 함",
    "말맛이 있어야 함"
  ]
}
```

**저장소 구현체 매핑** (`src/utils/koreanUnderstandingLayer.ts`):

| 논리 필드 (문서·PRD) | TypeScript / API 필드 |
|---------------------|------------------------|
| `normalized_text` | `normalized_input` |
| `task_type` | `speech_act` (예: `rebuttal_request`) |
| `tone` | `tone_hint` |
| `target_audience` | `audience_hint` |
| `implicit_constraints` | `style_constraints` |
| (확장) | `omitted_context`, `ellipsis_resolution_notes`, `safety_flags` |

모델용 자연어 지시는 `korean_layer_instruction`으로 별도 생성 가능 (현재 `buildKoreanUnderstandingInstructionBlock`).

### 4.1.1 세부 하위 모듈

#### 1) 한국어 정규화 모듈

- 줄바꿈 정리, 반복 문자 축약, 오타 추정, 특수문자 제거/유지 판단  
- 이모지·ㅋㅋ·ㅎㅎ 의미 처리, 한영 혼합문자 정리  

예: “해주라요” → 후보 보정, “극우적으로” → 장르/강도 옵션, “이거 좀더 쎄게” → 의미 정규화

#### 2) 생략 복원 모듈

복원 대상: 주어, 목적어, 비교 대상, 이전 문맥의 대상 사건, 요청의 사용처  

예: “이거 더 간결하게” → 직전 결과물 대상, “이 취지로 다시” → 직전 논지 유지, “한표 꼭 행사해달라교” → 오타 보정 + 맥락 추론

#### 3) 화행 분석 모듈

분류 예: 요청, 반박 요청, 정리 요청, 설득 요청, 감정 강화 요청, 완곡화 요청, 공격성 조정 요청, 법률형 검토 요청, 기사형 재작성 요청  

예: “조합원용으로” → 대상자 지정, “변호사 입장에서” → 역할 프레이밍, “중립적으로” → 감정 낮춤, “극우적으로” → 편향/공격성 강화 요청 (안전 정책과 충돌 시 클램프)

#### 4) 장르 판별 모듈

지원 장르 예: 카카오톡용, 댓글·커뮤니티 게시글, 기사체, 보도자료형, 공지문, 행정문, 법률 검토문, 사업계획서, 개발 문서, 제안서, 발표자료용 문안 등  

→ 구현체 `KoreanOutputGenre` enum과 확장 시 동기화.

#### 5) 관계/위계 추정 모듈

상하·동등·불특정 다수·공식 기관·조합원/회원/독자/고객·내부/외부 배포 등  

예: “구청 신고용” → 행정문, “카톡방에 올릴 것” → 짧고 직설적

#### 6) 감정/뉘앙스 추정 모듈

스펙트럼: 차분함, 우려, 경고, 분노, 조롱, 냉소, 설득, 호소, 비판, 중립 등  

예: “비아냥 거리는거는 못 따라 가지 조롱을 해줘”, “분노한 조합원 메세지를 카톡용으로”, “중립 팩트체크 버전”

---

## 5. 한국어 출력 강화 모듈 설계

### 5.1 Korean Style / Tone Refiner

초안 완성 뒤, 결과를 실제 한국어 사용자 장르에 맞게 다듬는다.

- 번역투 제거, 조사/어미 자연화, 장르별 호흡, 높임말 일관성, 줄 단위 리듬, 한국어식 강조 표현 보정

고위험 도메인(법률·의료·혐오·선동 등)은 **Policy & Safety**가 장르 요청보다 우선.

### 5.1.1 처리 대상

1. **조사 보정** — 예: “그 부분에 대하여” ↔ “그 부분은”, “의결을 행사하다” ↔ “의결권을 행사하다”  
2. **높임말 일관성** — “해주십시오. 부탁드립니다요.” 같은 혼합 제거  
3. **카톡체 리듬** — 짧은 줄, 핵심 앞 배치, 부담 없는 존댓말, 과한 장문 회피  
4. **기사체/보고서체/커뮤니티체 분리** — 객관 진술 vs 항목·근거·실행안 vs 말맛·공감 호흡  
5. **관용표현·직역투 보정** — “진행되어지는” → “진행되는”, 과잉 피동·번역투 축소

---

## 6. 새로 추가되는 내부 데이터 구조

### 6.1 Korean Understanding Profile (논리 스키마)

문서·PRD용 전체 필드 예시:

```json
{
  "normalized_input": "",
  "corrected_candidates": [],
  "genre": "",
  "speech_act": "",
  "tone": "",
  "emotion_level": 0.0,
  "audience": "",
  "relationship_context": "",
  "omitted_context": [],
  "style_constraints": [],
  "safety_flags": []
}
```

구현체에서는 `tone` → `tone_hint`, `audience` → `audience_hint`, 추가로 `ellipsis_resolution_notes` 등을 사용한다. 상세 타입: `KoreanUnderstandingProfile` in `koreanUnderstandingLayer.ts`.

### 6.2 Genre Control Profile

```json
{
  "output_genre": "kakao_message",
  "sentence_length": "short",
  "line_break_style": "chat",
  "politeness": "semi-formal",
  "emphasis_style": "human_direct",
  "allowed_rhetoric": ["호소", "강조", "우려"],
  "disallowed_rhetoric": ["번역투", "과도한 반복", "장문 수식"]
}
```

구현체: `GenreControlProfile` (`emphasis_style` 값은 TS에서 `neutral | human_direct | formal_emphasis`).

---

## 7. DeepSeek와의 역할 결합 방식

### 7.1 DeepSeek Chat

- 한국어 긴 문장 구조 정리, 중복 표현 압축, 장르별 포맷 안정화, 표준화된 한국어 문서 템플릿 정리

### 7.2 DeepSeek Reasoner

- 생략된 맥락 추론, 화행 의도 추정 보조, 감정 강도 판별 보조, 문장 간 논리 충돌 탐지, **장르와 톤 충돌** 검토  

예: “중립 팩트체크인데 카톡용으로 사람 말투처럼”

- 중립성 vs 구어체 균형, 과도한 공격성 여부, 카톡체인데 신뢰도 하락 여부, 문장 길이 과다 여부

프론트 템플릿: `src/services/deepseekReviewPrompts.ts` (v2 §8 정렬; 한국어 계층과 함께 쓸 때 본 절 참고).

---

## 8. 품질 평가 기준 확장

### 8.1 한국어 품질 스코어 (제안 지표)

- 자연스러움, 조사 정확도, 높임말 일관성, 장르 적합성, 생략 복원 정확도, 감정 톤 적합성, 사용자 체감 현실감, 복붙 사용 가능성

### 8.2 내부 QA 질문 (최종 응답 전)

1. 이 문장은 실제 한국인이 이 상황에서 쓸 법한가  
2. 장르가 섞이지 않았는가  
3. 높임말과 반말이 충돌하지 않는가  
4. 사용자가 의도한 감정 강도와 맞는가  
5. 번역투처럼 느껴지지 않는가  
6. 줄바꿈과 호흡이 목적 채널에 맞는가  
7. 직전 문맥의 생략된 대상이 제대로 복원되었는가  

---

## 9. 구현 로드맵 추가

| 단계 | 내용 |
|------|------|
| **9.1** 1단계 | 입력 전처리에 **한국어 정규화 모듈** 추가 |
| **9.2** 2단계 | 의도 분류 전에 **화행 분석** 추가 |
| **9.3** 3단계 | 출력 전에 **장르 제어기** 추가 |
| **9.4** 4단계 | 후처리에 **한국어 자연화 리라이팅 모듈** 추가 |
| **9.5** 5단계 | 평가 시스템에 **한국어 품질 스코어** 추가 |
| **9.6** 6단계 | 실제 사용자 데이터 기준 장르별 튜닝 (카톡·기사·보고서·커뮤니티·민원·법률 등) |

저장소 진행 상황은 [`KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md`](./KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md)와 교차 확인.

---

## 10. 실제 개발 적용 우선순위 (필수 7)

1. 한국어 입력 정규화  
2. 생략 복원  
3. 화행 분석  
4. 장르 판별  
5. 높임말/반말 일관성 제어  
6. 카톡체 / 기사체 / 보고서체 분리  
7. 최종 한국어 자연화 후처리  

---

## 11. 최종 설계 원칙 (한 문장)

**잘 답하는 AI가 아니라, 한국어 화자의 의도를 정확히 읽고 한국어 실사용 환경에 맞게 결과를 쓰는 AI로 설계한다.**

시스템은 다음 **3축**으로 움직인다.

- **Genspark에서 가져올 것**: 과업 완결형 UX  
- **DeepSeek에서 가져올 것**: 추론·검수·일관성 강화  
- **한국어 이해 계층에서 가져올 것**: 생략 복원·장르 적응·문체 자연화  

---

## 12. 실무용 요약

### 입력 단계

- 한국어 정규화 → 생략 복원 → 화행 분석 → 장르 추정  

### 생성 단계

- Task Planner → Blueprint → Main Draft → DeepSeek Review  

### 출력 단계

- 한국어 스타일 보정 → 높임말 정리 → 장르별 자연화 → 최종 품질 검사  

---

## 13. 코드 연동 (현재 저장소)

- **프론트 1차**: `src/utils/koreanUnderstandingLayer.ts` — 프로필 생성 + 모델용 내부 지시 문자열  
- **프롬프트/컨텍스트**: `src/services/generationPromptBuilder.ts` — 한글 입력 시 `buildUnifiedChatContext`에 `korean_understanding`, `genre_control` 포함, 생성 프롬프트에 `[한국어 이해·출력 계층]` 블록 주입  
- **대화 페이로드**: `ChatGPTInterface.tsx` 등에서 동일 컨텍스트 필드 전달  
- **백엔드**: `unified_chat_api` 등에서 수신 로그·스타일 지시 병합·향후 Refiner 연동 — [`BACKEND_INTEGRATION_GUIDE.md`](./BACKEND_INTEGRATION_GUIDE.md), [`STEP2_VERIFICATION_GUIDE.md`](./STEP2_VERIFICATION_GUIDE.md)
- **Q→A 파이프라인 브리지 (초기 기준선)**: `backend/api/question_answer_pipeline/korean_pipeline_bridge.py` + [`EARLY_DEVELOPMENT_SEQUENCE.md`](./EARLY_DEVELOPMENT_SEQUENCE.md)

백엔드에서 Planner / Blueprint / Verifier / Refiner를 분리 구현할 때, 위 프로필 JSON을 **단일 진실 공급원**으로 받아 확장하면 된다.

---

## 14. 다음 문서화 단계 (선택)

필요 시 본 문서를 바탕으로 다음을 별도 작성할 수 있다.

- **개발팀 전달용 상세 PRD**  
- **API 스키마 + 프롬프트 + DB 설계까지 포함한 구현 명세서**

요청 시 해당 형식으로 확장한다.

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

