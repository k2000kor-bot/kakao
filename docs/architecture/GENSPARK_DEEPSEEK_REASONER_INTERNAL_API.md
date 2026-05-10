# DeepSeek Reasoner — 내부 비평 API 설계 (초안)

**버전 1.0 (구현 반영)**  
**상위 문서**: [GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md](./GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md) §4.3, §6.3, §8.3  
**구현**: `backend/api/question_answer_pipeline/deepseek_reasoner_critique.py` + `orchestrator.run_pipeline` (Chat 정리 전 비평). 공개 HTTP `/api/internal/critique`는 **미구현**(내부 함수 호출만).

---

## 1. 목적

- 메인 LLM 초안에 대해 **논리 누락·반론·과도한 단정·실무 공백**을 JSON으로 수집한다.
- 메인 LLM 또는 오케스트레이터가 이 JSON을 입력으로 **재작성**할 수 있게 한다.
- 공식 API: `deepseek-reasoner`, thinking/reasoning 계층 — [Reasoning Model](https://api-docs.deepseek.com/guides/reasoning_model), [Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode) (개정 시 재확인).

---

## 2. 호출 위치 (권장)

| 단계 | 담당 | 비고 |
|------|------|------|
| 1 | Main / Pipeline | 초안 텍스트 확보 |
| 2 | **Reasoner pass** | 본 문서 §3 요청 → §4 스키마 JSON만 파싱 |
| 3 | Main | `critique` + 초안 → 사용자 친화 최종안 |
| 4 | DeepSeek Chat (선택) | 포맷 정리 — 기존 `deepseek_optional_refine`과 동일 축 |

**라우팅**: v2 [GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md](./GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md) §11 — 고난도·전략·장문·반박 요청에만 Reasoner 호출.

---

## 3. 내부 HTTP API (제안)

> 구현 시 `POST /api/internal/critique` (인증·IP 제한) 또는 **함수 호출만** (`orchestrator` 내부) 중 선택.

### 3.1 `POST /api/internal/critique` (선택 공개)

**Headers**

- `Content-Type: application/json`
- (운영) `Authorization: Bearer <internal>` 또는 mTLS

**Request body**

```json
{
  "draft_text": "<메인 모델 초안 전체 또는 상한 자른 본문>",
  "user_query": "<원 질문>",
  "task_type": "planning",
  "locale": "ko",
  "blueprint": {},
  "max_input_chars": 32000
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `draft_text` | ✅ | 비평 대상 |
| `user_query` | 권장 | 누락 시 맥락 부족 |
| `task_type` | 선택 | Intent classifier 출력 정렬 |
| `locale` | 선택 | 프롬프트 언어 |
| `blueprint` | 선택 | §7.3 블루프린트 JSON — 대비 검수 |
| `max_input_chars` | 선택 | 서버에서 잘라서 전송 |

**Response 200**

```json
{
  "success": true,
  "critique": { }
}
```

`critique`는 아래 §4와 동일 스키마.  
**Response 4xx/5xx**: `success: false`, `error`, (선택) `raw_model_output` 디버그용.

### 3.2 DeepSeek 호출 파라미터 (서버 내부)

- `model`: `deepseek-reasoner` (또는 환경 변수 `DEEPSEEK_REASONER_MODEL`)
- `messages`: system(§8.3 역할) + user(초안·질문·출력은 JSON만)
- `response_format` 또는 프롬프트 내 “JSON만” — 공식 JSON mode 지원 여부는 문서 재확인
- 온도 낮게(예 0.2–0.4), `max_tokens`는 비평 길이에 맞게

---

## 4. `critique` JSON 스키마 (v2 정합)

```json
{
  "logic_gaps": ["string"],
  "missing_sections": ["string"],
  "risk_points": ["string"],
  "counterarguments": ["string"],
  "overconfident_claims": ["string"],
  "practical_gaps": ["string"],
  "follow_up_questions": ["string"],
  "improvement_actions": [
    {
      "priority": "high",
      "action": "string",
      "target_section": "string"
    }
  ],
  "overall_severity": "low",
  "summary_for_user": "string"
}
```

| 필드 | 설명 |
|------|------|
| `logic_gaps` | 논리 단절·근거 부족 |
| `missing_sections` | 블루프린트 대비 빠진 절 |
| `risk_points` | 오해·법/정책·릴리즈 리스크 등 |
| `counterarguments` | 반대 입장이 공격할 지점 |
| `overconfident_claims` | 단정 과다 문장 요약 |
| `practical_gaps` | 현업 적용 시 부족한 점 |
| `follow_up_questions` | 사용자가 다시 물을 만한 구멍 |
| `improvement_actions` | 우선순위 있는 수정 행동 |
| `overall_severity` | `low` \| `medium` \| `high` |
| `summary_for_user` | (선택) 짧은 한 줄 요약 — 메인 재작성 힌트 |

파서는 **JSON 추출 실패 시** 전체 응답에서 첫 `{...}` 블록 시도 후, 실패하면 `critique` 없이 `error`로 처리하고 **초안 그대로** 폴백.

---

## 5. 환경 변수 (제안)

| 변수 | 기본 | 설명 |
|------|------|------|
| `DEEPSEEK_REASONER_MODEL` | `deepseek-reasoner` | 비평 전용 |
| `DEEPSEEK_API_KEY` | — | Chat과 공유 가능 |
| `PIPELINE_DEEPSEEK_REASONER` | `false` | `true`일 때만 파이프라인에서 Reasoner pass |
| `context.pipeline_deepseek_reasoner` | — | 요청별 옵트인 (Chat refine과 대칭) |

**조건 (제안)**: `PIPELINE_DEEPSEEK_REASONER` 또는 `context.pipeline_deepseek_reasoner` + `deepseek_review_layer_hints` + API 키.

---

## 6. 오케스트레이터 통합 위치

- 파일 후보: `backend/api/question_answer_pipeline/orchestrator.py` — `maybe_refine_final_answer` **앞** 또는 **뒤**  
  - **앞**: 초안 → Reasoner → 메인 재생성 → (선택) Chat 정리  
  - **뒤**: 초안 → Chat 정리 → Reasoner 구조 검수 (표/목차 일관성은 Chat에 가깝고, 논리는 Reasoner)  
- v2 권장 순서: **초안 → Reasoner 비평 → 메인 패치 → Chat 정리** ([GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md](./GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md) §6.3).

---

## 7. 메타 응답 필드 (제안)

스트리밍/JSON 응답 `metadata` 또는 최상위에 추가:

```json
{
  "deepseek_reasoner_meta": {
    "attempted": true,
    "applied": true,
    "model": "deepseek-reasoner",
    "tokens": 2000,
    "severity": "medium",
    "error": null
  }
}
```

---

## 8. 테스트 시나리오

1. 짧은 Q&A + Reasoner 플래그 on → **호출 생략** (라우터가 complexity 낮음으로 판단).  
2. 전략 문서 초안 + 플래그 on → critique JSON 파싱 성공, 메인 2차 호출에 반영.  
3. Reasoner 타임아웃 → `applied: false`, 초안 유지.  
4. 한국어 `user_query` + 한국어 초안 → `summary_for_user` 한국어 유지.

---

## 9. 관련 파일

| 역할 | 경로 |
|------|------|
| Reasoner 비평 | `backend/api/question_answer_pipeline/deepseek_reasoner_critique.py` |
| Chat 정리 (기존) | `backend/api/question_answer_pipeline/deepseek_optional_refine.py` |
| 오케스트레이션 | `backend/api/question_answer_pipeline/orchestrator.py` |
| 응답 메타 전달 | `backend/api/unified_chat_api.py` (`deepseek_critique`, `deepseek_reasoner_meta`) |
| 프론트 context | `src/services/generationPromptBuilder.ts` (`pipelineDeepSeekReasoner`) |
| OpenAPI (공개 대화) | [docs/api/openapi-unified-chat.yaml](../api/openapi-unified-chat.yaml) |

---

*1.0 — Reasoner 비평·메타·refine 연동 구현. 선택 과제: 메인 LLM 2차 재작성 전용 엔드포인트.*

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

