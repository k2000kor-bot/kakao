# 젠스파이크(Genspark)식 답변 생성 방식 이식 개발 문서

**버전 1.0**  
**목적**: 현재 답변 시스템을 **“대화형 응답기”에서 “문제 해결형 에이전트”**로 전환

**관련 문서 (본 저장소)**

- **한 단계 상위 (통합 재설계 v2.0)**: 문제 해결 UX + 메인/DeepSeek Chat/Reasoner 역할 분담 — [`GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md`](./GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md)
- 한국어 이해 계층 + 통합 v3: [`GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md`](./GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md)
- 구현 순서(레포 매핑): [`GENSPARK_REPO_IMPLEMENTATION_ORDER.md`](./GENSPARK_REPO_IMPLEMENTATION_ORDER.md)
- 파이프라인 총론: [`QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md`](../QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md)
- 한국어 계층 로드맵: [`KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md`](./KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md)

**외부 참고 (Genspark 공개 자료)**

- Help Center, Slides Changelog/FAQ, Market Research 등 — 사용자 제공 링크와 동일

---

## 1. 목표

1. 사용자의 질문을 단순 문장 생성 요청이 아니라 **업무 요청**으로 해석한다.
2. 답변은 한 번의 말하기로 끝나지 않고 **문제 정의 → 정보 수집 → 구조 설계 → 결과 생성 → 검증 → 후속 행동 제안**까지 포함한다.
3. 사용자가 느끼기에 “AI가 답했다”가 아니라 **“AI가 일을 처리했다”**는 인상을 주도록 UX를 재구성한다.

---

## 2. 젠스파이크식 답변 방식의 핵심 특성

### 2.1 즉답보다 과업 완결성 우선

리서치, 개요, 문서/슬라이드, 추천안까지 연결된 결과를 지향.

### 2.2 생성 전에 맥락을 수집

대상 청중, 목적, 출처, 구조, 선호를 단계적으로 파악(Guide Mode 철학).

### 2.3 개요 우선, 본문 후생성

outline 승인 후 본문·산출물 생성. 초안 검증 후 결과물 생성 권장.

### 2.4 답변이 아니라 산출물 중심

응답 단위를 **deliverable**(문서, 슬라이드, 시트 등)로 설계.

### 2.5 후속 행동을 스스로 제안

대화 말미 **다음 단계 제안**으로 이어 쓰기 부담 감소.

### 2.6 검증과 수정이 생성과 분리

Fact Check, Polish, Layout 수정 등 **생성 후 품질 계층**을 기본 UX로.

### 2.7 빠른 모드와 정교 모드 분리

**fast**(빠른 초안) vs **guided/expert**(고위험·고품질 산출물).

---

## 3. 현재 시스템이 바꿔야 할 사고방식

**기존**: 입력 → 즉시 생성 → 종료  

**전환**: 입력 → 유형 분류 → 과업 정의 → 맥락 수집 → 계획 → 자료/지식 → **블루프린트** → 초안 → 검증/수정 → 다음 단계 제안  

→ **LLM을 문장 엔진이 아니라 작업 오케스트레이터로 사용.**

---

## 4. 답변 생성 아키텍처 설계안

### 4.1 전체 파이프라인

```text
[User Query]
   ↓
[Intent Classifier]
   ↓
[Task Planner]
   ↓
[Context Collector]
   ↓
[Answer Blueprint Generator]
   ↓
[Draft Composer]
   ↓
[Verifier / Fact Checker / Style Refiner]
   ↓
[Action Suggestion Generator]
   ↓
[Final Response]
```

### 4.2 모듈 요약

| 모듈 | 역할 |
|------|------|
| Intent Classifier | 정보/판단/실행/분석/변환/**에이전트형** 분류 |
| Task Planner | user_goal, task_type, deliverables, **mode**(fast/guided/expert) |
| Context Collector | audience, goal, format, tone, source_scope, constraints 슬롯 |
| Blueprint Generator | 목차·섹션 목적·근거 전략 (본문 전) |
| Draft Composer | 설계도 기반 초안 (결론 우선·실행 가능) |
| Verifier/Refiner | 사실·일관성·형식·톤·완결성 |
| Action Suggestion | 후속 2~3개 제안 |

---

## 5. 답변 UX 규칙

### 5.1 출력 형식 기본 순서

1. 한 줄 결론  
2. 문제 재정의  
3. 핵심 분석  
4. 실행안  
5. 후속 옵션  

### 5.2 후속 행동 자동 제안 (예시)

기획서 형식 변환, 명세 확장, 프롬프트 템플릿, API 스키마, 테스트 케이스 등 2~3개.

### 5.3 fast vs guided/expert 승격 조건

키워드: 전략·기획·문서·보고서·비교·분석·개발 / 길고 다단계 / 정확성 리스크 / 외부 자료 필요 → guided 또는 expert. 그 외 fast.

---

## 6. 프롬프트 엔진 설계안 (요약)

- **시스템 레이어**: 과업 해석·구조 설계·실행 가능 산출물·다음 단계 제안 우선순위.  
- **플래너**: user_goal, task_type, mode, required_context, risk_points 등 **JSON만**.  
- **블루프린트**: title, summary, sections[], output_format, followup_actions[] — **본문 없이**.  
- **초안**: 블루프린트 준수, 결론 우선, 예시·절차, 복붙 활용 가능.  
- **검수**: 의도 일치·누락·과장·실행 가능성·다음 단계 — **개선본만**.

> 구현용 문자열 상수는 코드: `src/services/gensparkAgenticPrompts.ts` 참고.

---

## 7. 개발 구현 순서

1. **Classifier + Planner + Composer** 3단계 분리  
2. **블루프린트 선행** (outline-first)  
3. **Verifier** 계층 (fact / style / completeness)  
4. **후속 액션** 추천 모듈  
5. **모드 분기** (fast / guided / expert)  
6. **피드백 루프** (“더 간결하게”, “표로” 등 구조적 재처리)  

레포별 파일 매핑은 [`GENSPARK_REPO_IMPLEMENTATION_ORDER.md`](./GENSPARK_REPO_IMPLEMENTATION_ORDER.md).

---

## 8. 내부 데이터 구조 예시

```json
{
  "request_id": "req_001",
  "input": "젠스파이크 답변방식을 습득해서 답변방식을 바꾸고 싶다",
  "intent": "agentic_documentation",
  "mode": "expert",
  "planner": {
    "user_goal": "젠스파이크식 응답 방식을 분석해 자사 시스템 설계 문서로 전환",
    "deliverables": ["답변 방식 분석", "문제 해결 흐름 설계", "프롬프트 구조", "개발 단계"]
  },
  "blueprint": {
    "title": "젠스파이크식 답변 생성 엔진 설계 문서",
    "sections": ["핵심 철학", "파이프라인", "모듈 설계", "프롬프트 설계", "평가 기준"]
  },
  "verification": {
    "fact_check": true,
    "style_check": true,
    "completeness_check": true
  },
  "next_actions": ["PRD로 확장", "API 명세 생성", "프롬프트 템플릿 작성"]
}
```

---

## 9. 평가 기준(KPI)

- 정량: 재질문 감소, 형식 재요청 감소, 턴 수, 첫 응답 채택률, 후속 액션 클릭률  
- 정성: “일을 잘한다”, 복붙 활용, 완성본 느낌, 실행안 충분성  

---

## 10. 주의사항

1. **너무 많이 묻지 말 것** — guided는 고위험·고가치에 집중.  
2. **긴 문서는 outline-first** 강제.  
3. **검증기는 생성과 분리** 유지.  

---

## 11. 설계 원칙 (한 문장)

**“사용자 질문에 답하지 말고, 사용자가 맡긴 일을 끝내는 방향으로 답변 엔진을 재설계한다.”**

---

## 12. 바로 적용 가능한 실무 5가지

1. 즉답형 단일 프롬프트 의존도 낮추기  
2. 플래너 JSON(또는 동등 메타) 선행  
3. 긴 답변은 개요·블루프린트 우선  
4. 초안 후 검수(Verifier) 경로  
5. 말미 **next actions** 자동 부착  

---

*본 문서는 제품 기획·백엔드 오케스트레이션·프론트 UX 설계의 공통 기준으로 사용한다.*
