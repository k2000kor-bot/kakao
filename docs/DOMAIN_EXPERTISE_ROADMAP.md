# 전문 분야 지식 로드맵 (Domain Expertise Roadmap)

**목적**: 도시정비법·세무·회계·금융·법률·건축·서울시 행정 등 전문가 지식을 갖추고, 딥러닝·노트북 LLM으로 질문·요구에 맞는 답변을 생성할 수 있도록 하는 로드맵.

**기술 기반**: 노트북 LLM, 딥러닝 연동(의도·감정·주제 분석), RAG·도메인 지식베이스

---

## 1. 전문 분야 목록 (우선 보강)

| 분야 | 설명 | 현재 상태 | 보강 목표 |
|------|------|-----------|-----------|
| **도시정비법** | 도시 및 주거환경정비법, 재개축·재개발, 정비구역, 관리처분계획 | ✅ 도시정비 | 심화·최신 개정 반영 |
| **세무** | 소득세, 부가세, 종부세, 양도소득세, 상속·증여세, 국세 | ✅ 세무 (국세 포함) | 실무 케이스 |
| **회계** | 재무제표, 회계처리, 감사 | ✅ 회계 도메인 | 심화 |
| **금융** | LTV, DTI, 담보대출, 리츠, 펀드 | ✅ 금융 | 실무·규제 반영 |
| **변호사·법무** | 민사·형사·계약·소송 | ✅ 법무 (민사·형사·계약) | 전문가 관점 선택 |
| **계약업무** | 계약서 작성·검토·분쟁 | ✅ 계약 도메인 | - |
| **감정평가** | 부동산·시가산정·평가 | ✅ 감정평가 도메인 | - |
| **건축법** | 건축법, 건축기준, 용도·규모 | ✅ 건축법 도메인 | - |
| **서울시 행정** | 서울시 조례·행정업무·인·허가 | ✅ 서울시행정 | 조례 확장 |
| **서울시 조례** | 서울시 지방조례·규칙 | ✅ 서울시행정에 포함 | - |
| **민사** | 민법, 채권·물권, 손해배상 | ✅ 법무 | - |
| **형사** | 형법, 형사소송, 형사수사기법 | ✅ 형사 | - |
| **국세** | 국세기본법, 국세징수, 세무조사 | ✅ 세무에 포함 | - |
| **부동산정책** | 분양가상한제, 임대차 3법, 정책 모니터링·시기별 정책 | ✅ 부동산정책 | - |

---

## 2. 기술 연동 (딥러닝·노트북 LLM)

### 2.1 현재 구현

| 기능 | 구현 | 비고 |
|------|------|------|
| 노트북 LLM | `notebookLLMService`, `notebookLLMStreamingService` | 프로젝트별 컨텍스트·스트리밍 |
| 딥러닝 연동 | `notebookLLMDeepLearningIntegration` | 의도·감정·주제·복잡도 분석 → `buildDLPromptEnhancement` |
| 도메인 지식 | `DOMAIN_KNOWLEDGE_BASE`, `domainKnowledgeService` | 15개 도메인 검색·주입 |
| RAG | `buildIntelligentContext`, `searchDomainKnowledge` | 소스 기반 그라운딩 |
| 질문 맞춤 생성 | `buildResponseFormatInstructions` | 형식·톤·깊이·전문가 관점 지시 |
| 전문가 관점 | `EXPERT_VIEW_PATTERNS` | 변호사·세무사·감정평가사 등 |

### 2.2 보강 완료

| 항목 | 구현 |
|------|------|
| **질문 맞춤 생성** | `buildResponseFormatInstructions` — 요약/보고서/계약서/판례 분석 등 9가지 형식 |
| **도메인 자동 식별** | `detectRelevantDomains`, `domainKnowledgeService.detectDomainsFromPrompt` |
| **전문가 관점 선택** | 변호사·세무사·감정평가사·회계사·법무사·중개사 관점 지시 |
| **딥러닝 활용 심화** | `buildDLPromptEnhancement` — 복잡도·주제·긴급도·**sentiment**(negative→공감·해결 중심, positive→구체·도움) 반영 |
| **분야별 지식 디테일** | `DOMAIN_KNOWLEDGE_BASE` keyPoints(도시정비·세무·법무·감정평가·대법원판례·건축법·계약·회계), `buildIntelligentContext`에 핵심 포인트 포함. BACKLOG 33·34·35차. |
| **글쓰기 스타일** | `writingStyleService.getStyleInstruction`, NotebookLLM 전송 전 선택 스타일 지시 적용. 44종 스타일. |
| **생성 형식·댓글·기사** | `buildResponseFormatInstructions`(FORMAT_PATTERNS): 댓글용·기사로·**댓글 학습·댓글 생성 능력**·기사 학습·기사 생성 키워드 시 **댓글**(50~150자·여러 사람이 쓴 느낌·프로젝트 소스(댓글·SNS 리플) 톤·말투 참고) 또는 **기사**(제목 15~25자·리드 50~80자·본문 5W1H·인용 표기·소스 스타일 참고) 지시. 변환 요청 시 원문 기반만 재구성. 키워드: 댓글 달아줘·댓글 학습·올린 댓글처럼·코멘트·기사로 변환·뉴스처럼·보도문 등. NOTEBOOKLM §2.4. |

---

## 3. 도메인 확장 계획

### 3.1 신규 도메인 (Phase 1) — ✅ 완료

| 도메인 | 포함 내용 | 상태 |
|--------|-----------|------|
| **서울시 행정·조례** | 서울시 조례, 행정절차, 인·허가, 민원 | ✅ 완료 |
| **건축법** | 건축법, 건축기준법, 용도·규모·건폐율 | ✅ 완료 |
| **형사** | 형법, 형사소송법, 형사수사기법 | ✅ 완료 |
| **계약** | 계약서 작성·검토, 일반조항·특약, 분쟁 조항 | ✅ 완료 |
| **감정평가** | 시가산정, 거래사례비교법, 재개발 분담금 | ✅ 완료 |

### 3.2 기존 도메인 심화 (Phase 2) — ✅ 적용됨

| 도메인 | 심화 내용 | 상태 |
|--------|-----------|------|
| 세무 | 국세기본법·국세징수·세무조사, 세무조사 대응 절차 | ✅ |
| 회계 | 회계원리·재무제표·감사, 감가상각·처분손익, 부동산 회계처리 | ✅ |
| 법무 | 민사·형사·계약, 민사소송·형사소송, 판례 검색 | ✅ |
| 도시정비 | 조합분양·분담금·청산금, 정비사업전문평가사 | ✅ |

---

## 4. 생성 답변 품질 요구사항

사용자 **질문**과 **요구**에 맞게 생성하기 위해:

1. **형식 맞춤**: 요약/보고서/계약서 초안/판례 분석 등 요청 형식에 맞춤
2. **톤 맞춤**: 법률문서(격식)·상담(친절)·내부메모(간결) 등
3. **깊이 맞춤**: 개요만/실무 수준/판례 인용까지 등
4. **도메인 혼합**: "세무+법률" 복합 질문 시 두 도메인 지식 병합
5. **인용·근거**: 판례·조문·서울시 조례 등 근거 명시 옵션

---

## 5. 구현 위치·참고

| 항목 | 경로 |
|------|------|
| 도메인 지식 | `src/services/notebookLLMService.ts` DOMAIN_KNOWLEDGE_BASE |
| 도메인 서비스 | `src/services/domainKnowledgeService.ts` |
| 딥러닝 연동 | `src/services/notebookLLMDeepLearningIntegration.ts` |
| 백엔드 전문 로직 | `backend/redevelopment_ai_specialist.py` |
| 기존 체크리스트 | [NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md](./NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md) |

---

## 6. 연관 문서

- [DEVELOPMENT_SCOPE_MASTER.md](./DEVELOPMENT_SCOPE_MASTER.md) — 업종별·전문 분야
- [NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md](./NOTEBOOKLM_FEATURE_AND_KNOWLEDGE_CHECKLIST.md) — 15개 도메인 현황
- [NOTEBOOKLM_FEATURE_ROADMAP.md](./NOTEBOOKLM_FEATURE_ROADMAP.md) — 기능 로드맵

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](./PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).
