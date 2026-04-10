# 질문→답변 파이프라인 아키텍처 (라우팅·근거·검증·메모리·평가 중심)

서비스에 바로 박는 기준으로, **LLM-중심이 아니라 라우팅·근거·검증·메모리·평가 중심**으로 설계한 엔드투엔드 아키텍처입니다. LLM은 Planner/Writer/Critic 역할의 **모듈 중 하나**입니다.

**관련**

- Genspark식 과업 완결형 답변(v1): [`architecture/GENSPARK_STYLE_ANSWER_ENGINE_V1.md`](architecture/GENSPARK_STYLE_ANSWER_ENGINE_V1.md)
- Genspark + DeepSeek 이중 추론·검수(v2): [`architecture/GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md`](architecture/GENSPARK_DEEPSEEK_DUAL_INFERENCE_ENGINE_V2.md)
- API 명세 · PRD · 시퀀스: [`architecture/GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md`](architecture/GENSPARK_DEEPSEEK_ENGINE_API_AND_PRD.md)
- OpenAPI: [`api/openapi-unified-chat.yaml`](api/openapi-unified-chat.yaml) · Reasoner 설계: [`architecture/GENSPARK_DEEPSEEK_REASONER_INTERNAL_API.md`](architecture/GENSPARK_DEEPSEEK_REASONER_INTERNAL_API.md)
- 레포 구현 순서: [`architecture/GENSPARK_REPO_IMPLEMENTATION_ORDER.md`](architecture/GENSPARK_REPO_IMPLEMENTATION_ORDER.md)
- 한국어 이해 계층(v3): [`architecture/GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md`](architecture/GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md)

---

## 1) 전체 아키텍처 (컴포넌트 맵)

### Ingress / Control Plane

- **API Gateway**: 인증, 레이트리밋, 로깅, PII 마스킹
- **Conversation Orchestrator**: 상태머신 실행(아래 파이프라인)
- **Policy & Risk Engine**: 금칙/고위험/법률·의료 등 고정 규칙 + LLM 분류 병행
- **Observability**: trace_id 단위로 "질문→근거→검증→답변" 전 과정 저장

### Data Plane

- **Retriever**: (RAG) 벡터DB + 키워드(BM25) + 구조화DB(SQL) + 사내문서
- **Evidence Store**: 답변에 사용된 근거 스냅샷(버전 고정)
- **Memory Store**
  - Episodic memory: 대화별 단기 메모리
  - Semantic memory: 사용자/도메인 사실(정책적으로 저장 가능한 것만)
  - Preference memory: 톤/형식 같은 설정
- **Eval Store**: 자동평가/휴먼평가 결과, 모델/프롬프트/리트리버 버전

### LLM Layer (역할 분리)

- **Router LLM**: 의도/도메인/필요한 도구/근거 필요성 판단
- **Planner LLM**: 질의 분해, 정보 요구사항(spec) 생성
- **Writer LLM**: 근거 기반 답변 생성
- **Verifier LLM**: 근거-주장 정합성, 누락/환각 탐지, 불확실성 표기
- **(선택) Refiner LLM**: 문장 다듬기/구조화, 단 사실 변경 금지

---

## 2) 상태머신 기반 파이프라인 (실행 단계)

### Step A. Normalize & Context Load

1. **입력 정규화**: 언어감지, 인코딩, 길이, 첨부파일/링크 추출, PII 탐지(로그 마스킹)
2. **컨텍스트 로드**: 최근 N턴 요약(episodic), semantic memory 조회, 작업 컨텍스트(프로젝트/테넌트/권한)

**산출물**: `normalized_query`, `context_pack`

### 레포 구현 스냅샷 (2026-03, `backend/api/question_answer_pipeline/`)

- **Ingress**: `orchestrator.run_pipeline` — `unified_chat_api.generate_chat_response`·`/api/chat`는 `use_pipeline_v2` / `agentic_pipeline` + `pipeline_gate`(basic·`qa_pipeline_fast_path`·`answer_mode=fast` 시 생략)로 진입.
- **Router**: 키워드·한국어 프로필·`answer_mode` / `response_style`로 `grounding_required` 보강.
- **Planner**: `make_spec` — 장문·expert·일부 task 시 보조 서브질문 `sq2`.
- **Retriever**: 프로젝트 `projectKnowledge` 청크화(스캔 상한 약 12k 문자); 동일 소스 반복 시 청크 1회; `pipeline_web_evidence` 등이 있으면 `web` 플랜에 `web_page` 근거 1개.
- **Writer**: 규칙 기반 초안 후 **선택** LLM 다듬기 — `PIPELINE_WRITER_SKIP_LLM_POLISH` 또는 `context.pipeline_skip_writer_llm_polish`로 생략 가능.
- **Verifier**: 근거·수치·한국어 단정 표현 휴리스틱; `verification_summary`·필수 근거 시 orchestrator에서 각주 문구.

### Step B. Intent / Domain Routing (핵심)

Router 결정: `task_type`, `domain`, `grounding_required`, `tools_plan`, `risk_level`, `answer_schema`, `stop_conditions`.

**규칙**: "사실 확인, 최신, 수치, 법령, 일정, 비교" → grounding_required 강제; 내부 문서/규정 → internal RAG 우선; 위험(법률/의료/투자) → risk_level 상향 + 고정 템플릿.

**산출물**: `route_decision.json`

### Step C. Query Decomposition → Retrieval Spec

Planner가 **정보 요구사항(spec)** 생성: Subquestion 분해, 소스(SQL/RAG/웹/파일), 시간/관할/버전, 필수 필드, 신뢰도 기준.

**산출물**: `retrieval_spec.json`

### Step D. Retrieval (다중 소스 + Evidence 고정)

Retriever가 spec대로 실행, **답변 작성 전** Evidence Store에 스냅샷 고정(재현성/감사). RAG/SQL/Web/파일별 출처·hash 저장. 부족 시 Planner 재호출(최대 2회) 또는 "불충분" 플래그.

**산출물**: `evidence_bundle`

### Step E. Evidence Synthesis (근거 요약/충돌 해결)

중복 제거, Claim 후보 추출. **구현**: 동일·겹침 청크는 정규화된 본문 앞 72자 키로 1 claim만 유지. 출처 충돌 시 신뢰도·날짜 순, 또는 "A는 이렇게, B는 이렇게" 병렬 제시(장기).

**산출물**: `claim_graph.json`

### Step F. Draft Answer (Writer: 근거-바인딩)

Writer는 claim_graph만 보고 답변. **근거 없는 새 사실 추가 금지**. answer_schema 준수, claim_id 태깅.

**산출물**: `draft_answer` + `citation_map`

### Step G. Verification (사실·정합성·누락)

Verifier: Attribution, Faithfulness(환각), Numeric sanity, Completeness, Uncertainty 표기, Policy(위험 문구). Fail 시 Retrieval 재시도 / Writer 재작성 / "자료 부족" 안전 종료.

**산출물**: `verification_report.json`

### Step H. Finalize & Post-processing

- **스타일 렌더링**: 내용(사실/논리) 확정 후 마지막에만 적용. [STYLE_SYSTEM_ARCHITECTURE.md](./STYLE_SYSTEM_ARCHITECTURE.md) — `style_profile_loader`(유시민/기자 등 → Style Profile JSON) → `style_renderer`(사실 변경 금지).
- Refiner(선택), 최종 응답 + 근거 표기, 로그/트레이스 저장.

### Step I. Memory Write-back (선별)

Memory Gate: 민감/위험/단기성/근거 없는 추측 저장 금지. memory_item: value, scope, ttl, source(trace_id).

---

## 3) 핵심 데이터 스키마 (구현용)

### route_decision.json

```json
{
  "task_type": "fact_check | how_to | compare | summarize | generate",
  "domain": ["real_estate", "law", "dev", "marketing"],
  "grounding_required": "required | preferred | none",
  "sources": ["internal_rag", "sql", "web"],
  "risk_level": "low | medium | high",
  "answer_schema": "steps | checklist | table | narrative",
  "stop_conditions": ["need_more_data", "refuse", "safe_complete"]
}
```

### retrieval_spec.json

```json
{
  "subquestions": [
    {
      "id": "sq1",
      "question": "…",
      "source_plan": [
        { "type": "internal_rag", "query": "…", "top_k": 8 },
        { "type": "sql", "query": "SELECT …" }
      ],
      "required_fields": ["date", "issuer", "amount"],
      "freshness": { "max_age_days": 30 },
      "confidence_min": 0.7
    }
  ]
}
```

### evidence_bundle

```json
{
  "items": [
    {
      "evidence_id": "ev_001",
      "type": "rag_chunk | sql_row | web_page",
      "source_ref": { "doc_id": "…", "url": "…", "query_hash": "…" },
      "content": "…",
      "timestamp": "2026-03-04T…",
      "score": 0.82,
      "hash": "sha256…"
    }
  ],
  "coverage": 0.78,
  "confidence": 0.8
}
```

### claim_graph.json

```json
{
  "claims": [
    {
      "claim_id": "c1",
      "statement": "…",
      "supporting": ["ev_001", "ev_009"],
      "conflicts": [],
      "certainty": "high | medium | low"
    }
  ]
}
```

---

## 4) 운영·평가 루프

- **온라인**: Retrieval coverage, Faithfulness score, Refusal correctness, Latency budget
- **오프라인**: 필수 포함 항목 체크리스트, 근거 링크 정확도, 환각 여부
- **A/B**: Retriever(top_k, hybrid), Planner/Verifier 버전, Verifier 엄격도

---

## 5) LLM 컴포넌트 인터페이스 (계약)

- `router.predict(context_pack, query) -> route_decision`
- `planner.make_spec(route_decision, context_pack, query) -> retrieval_spec`
- `writer.generate(claim_graph, answer_schema) -> draft_answer`
- `verifier.check(draft_answer, claim_graph, evidence_bundle) -> report`

모델 교체 시에도 계약 유지, 테스트/모킹 용이.

---

## 6) 최소 MVP (2주 컷)

1. **Router**: 간단 규칙 + (선택) LLM 분류
2. **Retrieval**: internal RAG + (있으면) SQL
3. **Writer**: 근거 묶음 기반 작성
4. **Verifier**: "근거 없는 핵심 주장 금지"만 강제
5. **Trace 로그 + Evidence 스냅샷 저장**

이 MVP로 재현성·감사 가능성을 확보.

---

## 7) 혁신적 생성 (선택)

- **생성 모드**: `context.generation_mode` → one_liner, three_key_points, action_checklist, counter_argument. 같은 근거에서 형태만 변경.
- **대안 초안**: `context.include_variants` → response_alternatives (동일 내용 다른 표현).
- **확장 질문**: `context.include_follow_ups` → follow_up_questions (이어서 물어보면 좋은 질문).
- 상세: [INNOVATIVE_GENERATION.md](./INNOVATIVE_GENERATION.md).

---

## 8) 코드베이스 적용

- **백엔드**: `backend/api/question_answer_pipeline/` — Router, Planner, Retriever 어댑터, Writer, Verifier, Orchestrator.
- **연결**: `POST /api/chat` 본문에 `context.use_pipeline_v2: true` 넣으면 파이프라인 경로 진입. 실패 시 기존 엔진으로 폴백.
- **기존 경로**: `use_pipeline_v2` 없으면 기존 SimpleIntegratedAI 경로 유지(하위 호환).

**프론트에서 파이프라인 사용**: `chatContextWithHistory`에 `use_pipeline_v2: true` 포함해 전달하면 됨. (선택: 설정 토글이나 특정 프로젝트에서만 켜기)

참고: [BASIC_FLOW_PRIORITY.md](./BASIC_FLOW_PRIORITY.md) — 입력폼→답변 표시 우선.
