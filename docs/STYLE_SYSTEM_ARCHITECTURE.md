# 스타일 시스템 아키텍처 (내용 생성과 스타일 렌더링 분리)

"누구의 스타일로 작성"은 **단순 프롬프트 한 줄이 아니라 구조화된 스타일 파라미터**로 처리합니다.  
**내용 생성 로직**과 **스타일 렌더링 로직**을 반드시 분리합니다.

---

## 1. 핵심 구조

```
content_generation (사실/논리 생성)
        ↓
argument_structure (논리 구조)
        ↓
style_renderer (인물 스타일 적용)
```

**스타일은 마지막 단계에서만 적용되는 렌더링 레이어**입니다.

---

## 2. 스타일 지시어의 구조화

예: "유시민 스타일 논평" 한 문장은 아래 요소로 분해됩니다.

| 요소 | 의미 |
|------|------|
| 화자 페르소나 | 지식인 논객 |
| 논리 전개 방식 | 설명 → 질문 → 결론 |
| 문장 리듬 | 비교적 긴 문장 + 구어체 |
| 논증 방식 | 사례 + 비유 |
| 감정 톤 | 냉소적이지만 이성적 |
| 설득 방식 | 독자에게 질문 던짐 |

시스템에서는 **Style Profile JSON**으로 표현합니다.

---

## 3. 스타일 적용 파이프라인 (3단)

### Step 1. 내용 생성 (스타일 없음)

- facts, logic, arguments, conclusion
- 예: "1 시공사 협상은 협상력이 중요하다 2 조건을 개선하려면 시간 압박이 필요하다 3 지금 협상은 조합에 불리한 위치다"

### Step 2. 논리 구조 생성

- argument_structure: intro → issue_definition → logic_expansion → counter_argument → conclusion

### Step 3. 스타일 렌더링

- **여기서만** 스타일 적용. 사실/숫자/결론은 변경 금지.

예:
- 기본 문장: "지금 협상은 조합에 유리한 상황이 아니다."
- 유시민 스타일 렌더링: "지금 상황을 냉정하게 보면 협상이라는 단어 자체가 조금 어색합니다. 협상이라는 것은 서로가 필요할 때 이루어지는 것이지… 그래서 저는 오히려 질문을 하나 던지고 싶습니다. 지금 우리가 협상하고 있는 것일까요, 아니면 협상을 기다리고 있는 것일까요."

---

## 4. 스타일을 구성하는 7개 핵심 파라미터

| # | 파라미터 | 예시 값 |
|---|----------|---------|
| 1 | **persona** | 지식인, 기자, 평론가, 친근한 블로거, 냉정한 분석가 |
| 2 | **tone** | neutral, critical, sarcastic, warm, calm, aggressive |
| 3 | **reasoning_pattern** | deductive, inductive, story_based, dialogue, step_explanation |
| 4 | **rhetoric** | analogy, contrast, rhetorical_question, irony, example |
| 5 | **sentence_rhythm** | short_punch, long_explanatory, mixed |
| 6 | **perspective** | first_person, third_person, reader_question, observer |
| 7 | **persuasion** | logic, emotion_empathy, problem_raising, refutation |

---

## 5. Style Profile JSON (시스템 형식)

```json
{
  "style": "yusimin",
  "persona": "intellectual_commentator",
  "tone": "calm_critical",
  "reasoning_pattern": "step_explanation",
  "rhetoric": ["rhetorical_question", "analogy"],
  "sentence_rhythm": "medium_long",
  "perspective": "reader_engagement",
  "persuasion": "logic_reflection"
}
```

Writer 단계에는 **스타일을 넣지 않고** 내용만 생성.  
**Style Renderer** 단계에서 위 프로파일을 입력으로 사용합니다.

---

## 6. 전체 파이프라인에서의 위치

```
user_query
     ↓
intent_router
     ↓
knowledge_retrieval
     ↓
argument_builder (content_generation)
     ↓
style_profile_loader   ← "유시민 스타일" → Style Profile JSON
     ↓
style_renderer         ← 사실 변경 금지, 문장만 스타일 적용
     ↓
final_output
```

즉 **지식 생성 → 논리 생성 → 스타일 적용** 3단 구조입니다.

---

## 7. 스타일 사전·예문·특징 벡터 (확장)

"유시민 스타일로 써줘"를 이해하려면:

1. **스타일 사전 (style_dictionary)**: 유시민, 김어준, 손석희, 기자 스타일, 부동산카페 스타일 등 → 각각 Style Profile ID와 매핑.
2. **스타일 예문 코퍼스**: 칼럼, 인터뷰, 논평 등 예문 (선택: 스타일 추출/학습용).
3. **스타일 특징 벡터**: sentence_length, rhetoric_ratio, question_frequency, metaphor_frequency (A/B·품질 측정용).

현재 MVP는 **1. 스타일 사전(고정 프로파일)** 만 구현합니다.

---

## 8. 운영 원칙

- **스타일은 사실을 바꾸면 안 됩니다.**
- 파이프라인 순서는 반드시 **facts → logic → argument → style**.
- 스타일이 먼저 오면 환각이 증가하므로, 스타일 렌더러는 **이미 확정된 내용**만 받아 문장만 변형합니다.

---

## 9. 코드베이스 적용

- **스키마**: `backend/api/question_answer_pipeline/style_schemas.py` — StyleProfile, 7개 필드.
- **스타일 사전**: `style_dictionary.py` — 유시민, 기자, 기본 등 프로파일 + `resolve_style_profile(style_request)`.
- **렌더러**: `style_renderer.py` — `render(content_draft, style_profile) -> str`, 사실 변경 금지 지시로 LLM 호출(또는 규칙 기반).
- **오케스트레이터**: Writer 이후 `style_profile_loader` → `style_renderer` 호출, `context.style_request` 또는 쿼리에서 스타일 지시 추출.

---

## 10. LLM 스타일 엔진 확장 (설계 참고)

- **스타일 DB 구조**: style_dictionary + 별칭(ALIASES) → StyleProfile. 확장 시 DB 테이블(style_id, persona, tone, rhetoric JSON, ...).
- **스타일 추출 알고리즘**: 쿼리/대화에서 "N 스타일로", "N처럼 써줘" 정규식 + 엔티티 매칭.
- **스타일 렌더러 로직**: 입력=확정 내용(draft), 출력=문장만 변형. 프롬프트에 "사실·숫자·결론 변경 금지" 명시.
- **프롬프트 구조**: _build_style_instruction(profile) → 7개 파라미터 문장화 + 금지 사항.
- **스타일 학습 방법**: 예문 코퍼스(칼럼/논평) → 특징 벡터(sentence_length, rhetoric_ratio 등) → 프로파일 보정 또는 A/B 테스트.

참고: [QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md](./QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md), [BASIC_FLOW_PRIORITY.md](./BASIC_FLOW_PRIORITY.md).

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
