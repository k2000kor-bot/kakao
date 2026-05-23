# 관계도 답변 — 문서 형식·학습

관계도 뷰 **답변 생성** 패널은 질문·요청에 맞는 **문서 형식**(보고서, 엔티티·인텔리전스 보고서, 논문, 문학 등)으로 구조화된 마크다운을 생성합니다.

## 지원 형식

| 형식 ID | UI 라벨 | 용도 |
|---------|---------|------|
| `analytical_report` | 분석 보고서 | 동조·반대·성향 분석 |
| `business_report` | 사업·운영 보고서 | 이해관계·리스크·협의 |
| `entity_profile` | 엔티티·참여자 프로필 | 인물·입장·연결 카드 |
| `entity_intelligence_report` | 엔티티·인텔리전스 보고서 | 관계망·입장·리스크·권고 (에널리티 키워드 포함) |
| `executive_brief` | 경영진 브리핑 | 결론·리스크·결정 사항 |
| `academic_paper` | 논문·학술형 | 서론·방법·결과·논의·결론 |
| `literary_essay` | 문학·서사형 | 서사·인물·갈등 (사실 왜곡 금지) |
| `minutes` | 회의록·록 | 안건·합의·미결 |
| `memo` | 메모·브리프 | 내부 공유 요약 |
| `comparison_matrix` | 비교·대조 분석 | 비교 표 중심 |
| `policy_brief` | 정책·제안 브리프 | 문제·근거·대안·권고 |
| `faq_brief` | Q&A·FAQ | 질문·답 쌍 |
| `white_paper` | 백서·화이트페이퍼 | 배경·분석·제언 |
| `graph_deliverable` | 관계도 산출물 | 표·Mermaid 중심 |

## 사용

1. **문서 형식** 버튼으로 형식 고정 + 프롬프트 채우기
2. 질문·지시 보완 후 **생성**
3. **인식된 출력 형식**: `(내장 골격 적용)` → 검증 통과 후 `(학습 N건)`

## 파이프라인

- `conversationGraphAnswerDocumentFormats.ts` — 추론·지시·골격·검증
- `conversationGraphAnswerLearning.ts` / `conversationGraphAnswerFormatLearning.ts` — 로컬 학습
- `conversationGraphAnswerProse.ts` — 형식별 후처리·빈약 답변 보강
- `conversationGraphAnswerGeneration.ts` — API context·자가 개선 재시도

## 환경 변수

```env
REACT_APP_GRAPH_ANSWER_SELF_IMPROVE=1   # 검증 실패 시 1회 재생성 (기본 on, 0으로 off)
REACT_APP_GRAPH_ANSWER_TWO_PASS=0       # 개요→보고서 2-pass (선택)
```

## 로컬 스토리지

- `corbu.graph.answer.lessons.v2` — 성공 답변 본문 샘플
- `corbu.graph.answer.formatStructures.v1` — 형식별 `##` 제목 골격

패널 **학습 기록 지우기**로 둘 다 초기화됩니다.

## 검증

```bash
npm run sync:frontend-src
npm run verify:conversation-graph:unit
```

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
