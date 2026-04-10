# 혁신적 생성 능력 (Innovative Generation)

근거·검증·스타일 파이프라인 위에 **생성 다양성·확장·대안**을 더해, 같은 사실에서 여러 형태와 다음 단계를 제안합니다.

---

## 1. 생성 모드 (generation_mode)

같은 claim_graph에서 **목적별로 다른 구조**로 산출합니다. 사실은 동일, 형태만 변경.

| 모드 | 설명 | 출력 예 |
|------|------|---------|
| **default** | answer_schema대로 (narrative/steps/table 등) | 기존과 동일 |
| **one_liner** | 한 줄 요약 | "시공사 협상은 조합이 불리한 지금이 아니라, 시간 압박을 만들었을 때 유리해진다." |
| **three_key_points** | 3가지 핵심만 | 1. … 2. … 3. … |
| **action_checklist** | 실행 체크리스트 | - [ ] … - [ ] … |
| **counter_argument** | 반대/대비 논의 포함 | "다만 반대 견해로는 …", "확인할 점은 …" |

- **context.generation_mode** 로 지정. 미지정 시 default.

---

## 2. 대안 초안 (variants)

동일 내용을 **다른 표현으로 1~2개** 더 생성합니다. 사용자가 톤/강조를 고를 수 있게.

- **context.include_variants: true** 시 응답에 `response_alternatives: [str, str]` 포함.
- 사실 변경 금지, 문장만 변형.

---

## 3. 확장 질문 (follow_up_questions)

답변을 바탕으로 **다음에 알아보면 좋을 질문 2~3개**를 제안합니다.

- **context.include_follow_ups: true** 시 응답에 `follow_up_questions: [str, str, str]` 포함.
- "더 깊이 보기", "실무 적용", "반대 관점" 등으로 구분해 제안 가능.

---

## 4. 파이프라인 위치

```
… → Writer(draft, generation_mode 반영) → Verifier → 스타일 렌더링
      → (선택) 대안 초안 생성
      → (선택) 확장 질문 생성
      → final_output + alternatives + follow_ups
```

- **generation_mode**: Writer 단계에서 구조만 바꿈.
- **variants / follow_ups**: 스타일 적용 후, 선택적으로 추가.

---

## 5. API 사용 예

```json
{
  "message": "재건축 조합 협상 전략을 요약해줘",
  "context": {
    "use_pipeline_v2": true,
    "generation_mode": "three_key_points",
    "include_variants": true,
    "include_follow_ups": true
  }
}
```

응답 예:

```json
{
  "success": true,
  "response": "1. … 2. … 3. …",
  "response_alternatives": ["다른 표현 요약 1", "다른 표현 요약 2"],
  "follow_up_questions": ["시공사 선정 시 유의할 점은?", "조합원 동의율 확보 전략은?"]
}
```

---

## 6. 운영 원칙

- 모든 혁신적 생성은 **이미 검증된 내용(claim_graph/evidence)** 기준. 새 사실 추가 금지.
- 대안·확장 질문은 **선택 옵션**이라 기본 응답 경로는 그대로 두고, 플래그 있을 때만 비용/지연 증가.
