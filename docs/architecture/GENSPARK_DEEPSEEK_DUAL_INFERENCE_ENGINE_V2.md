# Genspark형 문제 해결 답변 엔진 + DeepSeek 고도화 통합 개발 문서

**버전 2.0 (통합 재설계본)**  
**목적**: 현재 개발 중인 답변 시스템을 **단순 생성형 응답기 → 과업 완결형 멀티모델 에이전트**로 전환하고, **메인 답변 모델 + DeepSeek 보조 추론/검수** 구조를 명시한다.

---

## 본 저장소에서의 위치

| 문서 | 역할 |
|------|------|
| [GENSPARK_STYLE_ANSWER_ENGINE_V1.md](./GENSPARK_STYLE_ANSWER_ENGINE_V1.md) | Genspark식 과업 UX v1 |
| [GENSPARK_REPO_IMPLEMENTATION_ORDER.md](./GENSPARK_REPO_IMPLEMENTATION_ORDER.md) | 레포 구현 순서·코드 매핑 |
| [GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md](./GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md) | 한국어 이해·출력 계층 v3 |
| [QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md](../QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md) | Q→A 파이프라인 총론 |
| [EARLY_DEVELOPMENT_SEQUENCE.md](./EARLY_DEVELOPMENT_SEQUENCE.md) | 단계별 개발 순서 |
| [GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md](./GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md) | API 명세 · PRD · 시퀀스 (개발팀 전달) |
| [GENSPARK_DEEPSEEK_REASONER_INTERNAL_API.md](./GENSPARK_DEEPSEEK_REASONER_INTERNAL_API.md) | Reasoner 비평 내부 API 설계 (로드맵, v0.1) |
| [../api/openapi-unified-chat.yaml](../api/openapi-unified-chat.yaml) | OpenAPI 3.0 — 통합 대화 엔드포인트 |

**외부 참고 (DeepSeek API — 변경 시 반드시 재확인)**

- [DeepSeek API Docs](https://api-docs.deepseek.com/) — Your First API Call  
- [Reasoning Model (`deepseek-reasoner`)](https://api-docs.deepseek.com/guides/reasoning_model)  
- [Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode)  
- [Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing)  

> `deepseek-chat` / `deepseek-reasoner`, 128K 컨텍스트, reasoning·thinking·tool calls·JSON 출력 등은 **공식 문서 개정 시마다 재검증**할 것.

---

# 1. 개발 목표

본 시스템의 목표는 사용자의 질문에 단순히 문장을 생성하는 것이 아니라, 질문을 **업무 요청으로 해석**하고, 필요한 경우 **자료 수집·구조화·초안 생성·자기검토·일관성 검수·후속 행동 제안**까지 포함하는 **완결형 답변 시스템**을 만드는 것이다.

### DeepSeek를 결합하는 목적 (단순 모델 추가가 아님)

1. **장문 응답의 구조 안정성** 강화  
2. **추론형 질문**에서의 논리 전개 강화  
3. **초안에 대한 자기비평·결함 탐지** 강화  
4. 같은 질문에 대해 **톤·포맷 일관성** 유지  
5. **복잡한 기획·보고·분석 문서** 작성 품질 향상  

공식 문서 기준으로 reasoning 계열은 최종 답변 전 **reasoning / thinking 계층**을 활용할 수 있으며, thinking 모드·tool calls·JSON 출력 지원 방향이 정리되어 있다. 이는 DeepSeek를 “최종 응답기”보다 **추론·검수·계획용 서브엔진**으로 두기에 적합하다는 뜻이다.

---

# 2. 핵심 설계 철학

## 2.1 한 모델이 다 하지 않는다

기존에는 하나의 모델에 질문 해석·계획·본문·사실 검토·논리 검토·스타일 정리를 모두 맡기는 경우가 많다. 짧은 답에는 통하지만 **긴 문서·복합 문제 해결**에서는 품질 흔들림이 커진다.

| 역할 | 담당 |
|------|------|
| **주 모델** | 사용자 응답 생성, 대화 흐름 유지 |
| **DeepSeek Chat** | 구조화 초안 보조, 포맷 안정화 |
| **DeepSeek Reasoner** | 고난도 추론, 반론 생성, 누락 탐지, 자기비평 |
| **검수 레이어** | 일관성·사실성·형식성 검토 (규칙 + LLM 병행) |

이 방식은 **Genspark식 과업 완결형 UX**와 **DeepSeek의 reasoning·thinking·tool-use** 특성을 결합한 구조다.

## 2.2 답변이 아니라 작업 결과를 만든다

단위는 “한 문단”이 아니라 예를 들어 다음과 같은 **산출물**이다.

- 실행안, 기획 문서, 비교표, 분석 보고서  
- 프롬프트 명세, 운영 가이드, 체크리스트  
- 반박문·설득문·정책안  

질문을 받으면 답변 생성 전에 내부적으로 **“이 요청의 최종 산출물은 무엇인가?”**를 정의해야 한다.

## 2.3 생성보다 구조를 먼저 만든다

긴 문서일수록 먼저 만들 것은 문장이 아니라 **구조**다.

1. 질문 의도 분석  
2. 사용자 목표 추정  
3. 출력 형식 결정  
4. **개요(Blueprint) 설계**  
5. 본문 생성  
6. 검수 및 보정  

---

# 3. 전체 시스템 구조

## 3.1 상위 아키텍처

```text
[User Input]
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
[Consistency / Style Refiner]
   ↓
[Action Suggestion Generator]
   ↓
[Final Output]
```

**v3.0 확장 (한국어)**: `[User Input]` 직후 **[Korean Language Understanding Layer]**, DeepSeek 검수 이후 **[Korean Style / Tone Refiner]** 삽입. 상세는 [GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md](./GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md) §3.1.

## 3.2 멀티모델 오케스트레이션 구조

```text
사용자 질문
   ↓
메인 LLM
   ├─ 의도 분류
   ├─ 출력 목표 설정
   └─ 초안 생성
        ↓
DeepSeek Chat
   ├─ 구조 정리
   ├─ 포맷 정렬
   └─ JSON/스키마 안정화
        ↓
DeepSeek Reasoner
   ├─ 논리 누락 탐지
   ├─ 반론 시뮬레이션
   ├─ 취약 문장 지적
   └─ 자기비평 리포트 생성
        ↓
메인 LLM
   ├─ 사용자 친화적으로 재작성
   └─ 최종 답변 완성
```

---

# 4. 모델 역할 분담

## 4.1 메인 모델

- 자연스러운 대화 유지, 사용자 맥락 파악  
- 최종 출력 **문체 통일**, 후속 행동 제안, 도메인 맞춤 표현  
→ **프론트 응답 엔진**

## 4.2 DeepSeek Chat (`deepseek-chat`)

공식 문서상 비사고 모드 계열, **128K 컨텍스트**, JSON output·tool calls 지원.

**적합 역할**: 긴 입력 재구조화, 템플릿 채우기, 스키마 변환, 표·항목·섹션 정렬, 포맷 표준화, 반복 표현 축소  
→ **문서 정리·포맷 엔진**

## 4.3 DeepSeek Reasoner (`deepseek-reasoner`)

reasoning / thinking 기반 추론, tool-use·JSON 출력 지원 방향.

**적합 역할**: 복잡한 논리 검토, 주장 간 충돌 탐지, 반박 포인트, 빠진 전제, 단계별 해결 설계, 대안 비교, **자기비평·red-team 리뷰**  
→ **추론·감사·비평 엔진**

---

# 5. DeepSeek를 붙였을 때의 고도화 포인트

## 5.1 일관성 강화

최종 생성 전 **응답 블루프린트**를 고정한다.

1. **Blueprint Validator** — 초안 구조가 사용자 목적과 맞는지  
2. **Consistency Reviewer** — 제목·소제목·논리 흐름·결론 일관성  

## 5.2 자기비평 엔진

DeepSeek Reasoner로 생성 후 별도 질의 예시:

- 이 답변의 가장 약한 논리는 무엇인가  
- 사용자가 다시 물 가능성이 큰 부분은 어디인가  
- 빠진 전제는 무엇인가  
- 반대편 입장이라면 무엇을 공격하겠는가  
- 현업 문서로 쓰이기엔 무엇이 부족한가  

## 5.3 문제 해결형 응답

“설명”이 아니라 **해결책**일 때 Reasoner 투입:

- 하위 과제 분해, 우선순위, 해결 경로 2~3개 비교, 리스크, 실무 실행 순서  

## 5.4 장문 문서 안정성

기획서·보고서·정책안·가이드 등 **앞뒤 논리 흐트러짐** 완화.  
128K와 reasoning 기반 검토로 구간·전체 검토 전략 수립(필요 시 청크+요약 체인).

---

# 6. 권장 파이프라인 설계

## 6.1 기본 모드 (짧은 질문·빠른 응답)

```text
User Query → Intent Classifier → Main Model Draft → Output
```

## 6.2 구조화 모드 (문서·기획·비교·분석)

```text
User Query → Task Planner → Blueprint Generator → Main Draft
  → DeepSeek Chat Formatter → Final Output
```

## 6.3 고도 추론 모드 (논쟁·전략·법·정책·장문 보고)

```text
User Query → Task Planner → Blueprint Generator → Main Draft
  → DeepSeek Reasoner Critique → Weakness Patch
  → DeepSeek Chat Structure Cleanup → Final Output
```

---

# 7. 내부 모듈 설계

## 7.1 Intent Classifier

입력을 예: `explanation`, `analysis`, `writing`, `planning`, `transformation`, `research`, `rebuttal`, `legal-style reasoning`, `executive memo`, `strategic scenario` 등으로 분류.

```json
{
  "task_type": "planning",
  "complexity": "high",
  "requires_reasoning": true,
  "requires_external_validation": false,
  "recommended_mode": "expert"
}
```

## 7.2 Task Planner

```json
{
  "user_goal": "딥시크를 함께 사용하여 답변 엔진의 일관성과 답변 능력을 높이는 개발문서 작성",
  "hidden_needs": [
    "멀티모델 구조",
    "추론/검수 분리",
    "실제 개발 적용안"
  ],
  "deliverables": [
    "아키텍처",
    "모듈별 역할",
    "프롬프트 설계",
    "평가 지표"
  ],
  "mode": "expert"
}
```

## 7.3 Blueprint Generator

```json
{
  "title": "Genspark형 + DeepSeek 통합 답변 시스템 개발문서",
  "sections": [
    "개발 목표",
    "멀티모델 구조",
    "역할 분담",
    "프롬프트 레이어",
    "검수 체계",
    "평가 지표",
    "구현 로드맵"
  ],
  "output_style": "technical_document"
}
```

## 7.4 DeepSeek Review Layer (고도화 핵심)

```json
{
  "logic_gaps": [
    "DeepSeek의 역할이 포맷 정리와 reasoning 검수로 명확히 분리되지 않음"
  ],
  "missing_sections": [
    "fallback strategy",
    "latency policy",
    "quality scoring"
  ],
  "risk_points": [
    "모델 간 중복 호출로 비용 증가 가능성",
    "reasoning 레이어 과사용 시 지연 증가"
  ],
  "improvement_actions": [
    "simple task에는 deepseek-chat 생략",
    "reasoning task에만 deepseek-reasoner 호출"
  ]
}
```

---

# 8. 프롬프트 계층 설계

구현 상수·힌트는 코드 **`src/services/gensparkAgenticPrompts.ts`**, **`src/services/deepseekReviewPrompts.ts`** 와 `buildUnifiedChatContext` 옵션과 함께 유지한다.

## 8.1 메인 시스템 프롬프트 (개념)

```text
너는 단순 응답 생성기가 아니다.
사용자 요청을 과업으로 해석하고,
필요하면 구조를 먼저 설계하고,
최종 결과는 실행 가능한 산출물 형태로 완성한다.
답변 전에 반드시 다음을 판단한다.
1. 사용자의 실제 목적
2. 필요한 맥락
3. 출력물 형태
4. 검수 필요 수준
5. 후속 행동 제안
```

## 8.2 DeepSeek Chat용 프롬프트 (개념)

```text
너의 역할은 초안을 더 구조적이고 일관되게 정리하는 것이다.
새로운 주장 추가보다 다음에 집중하라.
1. 섹션 구조 정렬
2. 중복 문장 제거
3. JSON/표/목차 안정화
4. 표현의 균일화
최종 결과는 구조화된 문서만 반환하라.
```

## 8.3 DeepSeek Reasoner용 프롬프트 (개념)

```text
너의 역할은 비평가이자 검수자다.
아래 초안에 대해 다음을 분석하라.
1. 논리적 누락
2. 취약한 전제
3. 반대편이 공격할 지점
4. 과도한 단정
5. 실무 적용성 부족 요소
6. 개선 우선순위
출력은 JSON으로 반환하라.
```

## 8.4 최종 재조합 프롬프트 (개념)

```text
아래 초안과 검수 결과를 반영하여
사용자에게 전달할 최종 문서를 완성하라.
조건:
- 문체는 일관되게 유지
- 불필요한 메타 설명 제거
- 개선사항은 자연스럽게 본문에 녹여라
- 결론 우선 구조를 유지하라
```

---

# 9. API 오케스트레이션 설계

DeepSeek API는 **OpenAI 호환** 포맷, Base `https://api.deepseek.com`, `/v1` 호환 경로 제공. Thinking mode는 모델 지정 또는 thinking 파라미터로 활성화 — **공식 문서 기준**.

## 9.1 권장 호출 정책

| 시나리오 | 호출 |
|----------|------|
| 일반 질문 | 메인 모델만 |
| 문서 작성·구조화 | 메인 → `deepseek-chat` |
| 고난도 추론·반박·정책·복합 전략 | 메인 → `deepseek-reasoner` → `deepseek-chat` |

## 9.2 호출 라우팅 규칙 예시

```json
{
  "routing_policy": {
    "simple_qa": ["main_model"],
    "long_form_writing": ["main_model", "deepseek_chat"],
    "strategic_reasoning": ["main_model", "deepseek_reasoner", "deepseek_chat"],
    "critical_review": ["deepseek_reasoner"],
    "format_cleanup": ["deepseek_chat"]
  }
}
```

---

# 10. 품질 관리 설계

## 10.1 품질 스코어링 (내부)

- 구조·논리·일관성·완결성·실행 가능성·톤 적합성  
- 레포 휴리스틱 예: `korean_quality_scorer.py`, 응답 메타 `korean_quality_scores` 등과 연계 가능  

## 10.2 내부 QA 질문 (Reasoner에 위임 가능)

- 결론이 앞에 있는가  
- 주장에 근거가 충분한가  
- 중간 단계가 빠지지 않았는가  
- 사용자 목적과 출력 형식이 맞는가  
- 재질문 가능성이 높은 구멍이 있는가  
- 더 적합한 출력 구조가 있는가  

---

# 11. 비용·성능 최적화 전략

`deepseek-chat`과 `deepseek-reasoner`는 **가격·최대 출력** 구성이 다를 수 있어, reasoner 남용은 비효율적일 수 있다. ([Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing) 참고)

## 11.1 Reasoner 호출 조건 (권장)

- 논리 다단계, 반론·반박, 전략 문서, 장문 보고, 법·정책 구조 검토, 고가치 문서  

## 11.2 Chat 호출 조건 (권장)

- 표·목차·섹션 정리, 템플릿 매핑, 긴 문서 포맷, JSON 스키마 보정  

## 11.3 생략 조건

- 짧은 번역, 간단 재작성, 단문 Q&A, 경량 설명  

---

# 12. 추천 구현 로드맵

1. **1단계**: 단일 생성기 → Classifier / Planner / Composer 분리  
2. **2단계**: 답변 전 **Blueprint** 생성  
3. **3단계**: DeepSeek Chat — 포맷 정리 계층 연결  
4. **4단계**: DeepSeek Reasoner — 비평·논리 검토 계층 연결  
5. **5단계**: Quality Score 엔진  
6. **6단계**: 질문 유형별 **라우팅 정책** 자동화  
7. **7단계**: 사용자 피드백 기반 재생성 루프 (더 간결·공격적·보고서형·PPT형·실무형 등)  

레포 매핑은 [GENSPARK_REPO_IMPLEMENTATION_ORDER.md](./GENSPARK_REPO_IMPLEMENTATION_ORDER.md) 참고.

---

# 13. 최종 설계 원칙

**“메인 모델은 사용자와 말하고, DeepSeek는 생각하고 검토하며, 전체 시스템은 결과물을 완성한다.”**

- **Genspark에서 가져올 것**: 과업 완결형 UX  
- **DeepSeek에서 가져올 것**: 추론·검수·구조 안정성  
- **시스템 방향**: 멀티모델 오케스트레이션 기반 답변 엔진  

---

# 14. 바로 적용 가능한 실무 요약

1. 답변 전에 **Task Planner JSON**을 만든다.  
2. 긴 문서는 먼저 **Blueprint**를 만든다.  
3. 본문 초안은 **메인 모델**이 쓴다.  
4. 구조 정리는 **DeepSeek Chat**이 맡는다.  
5. 논리 검수·자기비평은 **DeepSeek Reasoner**가 맡는다.  
6. 최종 출력은 **메인 모델**이 사용자 문체에 맞게 재조합한다.  

---

## 다음 확장 (선택)

- ✅ **API 명세 + PRD + 시퀀스 다이어그램**: [GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md](./GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md)  
- ✅ **OpenAPI 3.0**: [../api/openapi-unified-chat.yaml](../api/openapi-unified-chat.yaml)  
- ✅ **Reasoner 내부 API 설계(초안)**: [GENSPARK_DEEPSEEK_REASONER_INTERNAL_API.md](./GENSPARK_DEEPSEEK_REASONER_INTERNAL_API.md)  
- (선택) OpenAPI 기반 클라이언트 코드젠, `/api/internal/critique` 실구현  

---

*본 문서는 Genspark형 문제 해결 UX와 DeepSeek 이중 추론·검수 구조를 **하나의 v2.0 통합 설계**로 정리한 것이다. 구현 시 `llm_service`·`question_answer_pipeline`·`unified_chat_api`·환경 변수(`DEEPSEEK_*`, `PIPELINE_DEEPSEEK_REFINE` 등) 및 프론트 `buildUnifiedChatContext` 플래그와 함께 검토한다.*

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

