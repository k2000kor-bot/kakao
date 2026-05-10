# 한국어 이해 계층 + Genspark형 파이프라인 구현 로드맵

**버전**: 1.0  
**목적**: 단계별 구현 순서와 체크리스트로 점진적 적용

**관련 문서**:
- [GENSPARK_STYLE_ANSWER_ENGINE_V1.md](./GENSPARK_STYLE_ANSWER_ENGINE_V1.md) — Genspark식 과업 완결형 답변(본편)
- [GENSPARK_REPO_IMPLEMENTATION_ORDER.md](./GENSPARK_REPO_IMPLEMENTATION_ORDER.md) — 백엔드 구현 순서 매핑
- [GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md](./GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md) — 한국어 계층 통합 v3
- [QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md](../QUESTION_ANSWER_PIPELINE_ARCHITECTURE.md) - 파이프라인 총론

---

## 📋 전체 구현 단계 개요

| 단계 | 범위 | 예상 기간 | 우선순위 |
|------|------|-----------|----------|
| **1단계** | 프론트엔드 한국어 정규화·프로필 생성 | 1-2일 | 🔴 필수 |
| **2단계** | 백엔드 API 컨텍스트 전달 검증 | 1일 | 🔴 필수 |
| **3단계** | 백엔드 프롬프트 엔진에 한국어 계층 통합 | 2-3일 | 🟡 중요 |
| **4단계** | 출력 단계 한국어 스타일 리파이너 | 2일 | 🟡 중요 |
| **5단계** | 품질 평가·QA 체크리스트 | 1일 | 🟢 개선 |
| **6단계** | 실데이터 기반 장르별 튜닝 | 3-5일 | 🟢 개선 |

---

## 🎯 1단계: 프론트엔드 한국어 정규화·프로필 생성 (완료 ✅)

### 목표
- 입력 한국어를 정규화하고 장르/화행/톤 프로필을 생성
- API 요청 시 `korean_understanding`, `genre_control` 컨텍스트 전달

### 완료된 작업
- ✅ `src/utils/koreanUnderstandingLayer.ts` 모듈 생성
- ✅ `generationPromptBuilder.ts`에 한국어 계층 통합
- ✅ `ChatGPTInterface.tsx`에 한국어 프로필 추가
- ✅ 테스트 파일 작성 (`koreanUnderstandingLayer.test.ts`)

### 검증 체크리스트
- [ ] 한글 입력 시 `chatContextWithHistory`에 `korean_understanding` 포함 확인
- [ ] 장르 휴리스틱 동작 확인 (카톡/기사/보고서 등)
- [ ] 생략 복원 힌트가 대화 히스토리에서 추출되는지 확인
- [ ] API 요청 페이로드에 한국어 프로필 JSON 포함 확인

### 다음 단계로 넘어가기 전 확인사항
```typescript
// ChatGPTInterface.tsx에서 디버깅용 로그 추가
if (containsHangul(trimmedInput)) {
  console.log('[Korean Layer] Profile:', koreanProfile);
  console.log('[Korean Layer] Genre Control:', genreControl);
}
```

---

## 🔌 2단계: 백엔드 API 컨텍스트 전달 검증

### 목표
- 프론트엔드에서 보낸 `korean_understanding`가 백엔드에서 수신되는지 확인
- 백엔드 로그/디버깅으로 프로필 파싱 검증

### 작업 항목

#### 2.1 프론트엔드 전송 검증
- [ ] `ChatGPTInterface.tsx`에서 API 요청 전 `chatContextWithHistory` 로그 출력
- [ ] 네트워크 탭에서 실제 전송 페이로드 확인
- [ ] 스트리밍/비스트리밍 경로 모두에서 전달되는지 확인

#### 2.2 백엔드 수신 검증
- [ ] 백엔드 API 엔드포인트에서 `context.korean_understanding` 수신 로그
- [ ] JSON 파싱 오류 없는지 확인
- [ ] `context.genre_control`도 함께 수신되는지 확인

#### 2.3 백엔드 임시 응답 (검증용)
```python
# backend/main_server.py 또는 해당 엔드포인트
if 'korean_understanding' in context:
    logger.info(f"[Korean Layer] Received profile: {context['korean_understanding']}")
    logger.info(f"[Korean Layer] Genre: {context['korean_understanding'].get('genre')}")
    # 임시로 프로필을 응답에 포함 (검증용)
    response_metadata['korean_profile_received'] = True
```

### 완료 기준
- ✅ 프론트엔드에서 한국어 입력 시 프로필 생성
- ✅ 백엔드에서 프로필 수신 확인
- ✅ 프로필 필드(genre, speech_act, formality 등) 파싱 성공

---

## 🧠 3단계: 백엔드 프롬프트 엔진에 한국어 계층 통합

### 목표
- 백엔드에서 `korean_understanding` 프로필을 받아 프롬프트에 반영
- Intent Classifier → Task Planner → Blueprint Generator 단계에 한국어 맥락 주입

### 작업 항목

#### 3.1 Intent Classifier 강화
- [x] `korean_understanding.speech_act`를 의도 분류에 반영 (`router.py` + `korean_pipeline_bridge.adjust_route_decision_for_korean`)
  - 예: `rebuttal_request` → 반박 생성 태스크로 라우팅
  - 예: `fact_check_neutral` → 검증 모드 활성화
- [x] `korean_understanding.genre`를 검색·라우팅에 반영 (`adjust_retrieval_spec_for_genre`, 법률/행정 시 grounding 상향)
- [ ] `genre`를 Writer/Refiner 출력 형식까지 완전 연동 (Phase 2)

#### 3.2 Task Planner에 한국어 맥락 주입
```python
# 예시: backend/services/task_planner.py
def build_task_plan(user_query, context):
    plan = {
        "user_goal": user_query,
        "task_type": "general",
        "mode": "fast",
    }
    
    # 한국어 프로필이 있으면 모드/형식 조정
    if ko_profile := context.get('korean_understanding'):
        if ko_profile['genre'] == 'kakao_message':
            plan['mode'] = 'fast'  # 카톡은 빠른 응답
            plan['output_format'] = 'chat_message'
        elif ko_profile['genre'] in ['legal_memo', 'administrative']:
            plan['mode'] = 'expert'  # 법률/행정은 정교 모드
            plan['output_format'] = 'formal_document'
        
        if ko_profile['speech_act'] == 'rebuttal_request':
            plan['task_type'] = 'rebuttal_writing'
            plan['tone'] = ko_profile.get('tone_hint', 'neutral')
    
    return plan
```

#### 3.3 Blueprint Generator에 장르 반영
- [ ] `genre_control`의 `sentence_length`, `line_break_style`을 블루프린트에 반영
- [ ] 카톡체: 짧은 줄, 핵심 선행
- [ ] 기사체: 객관 서술, 사실 전달 우선
- [ ] 보고서체: 항목 구조, 실행안 연결

#### 3.4 프롬프트 빌더에 한국어 지시 블록 주입
```python
# backend/services/prompt_builder.py
def build_generation_prompt(user_query, task_plan, context):
    base_prompt = f"{user_query}\n\n[출력 형식 지시]\n..."
    
    # 한국어 계층 지시 추가
    if ko_profile := context.get('korean_understanding'):
        korean_block = build_korean_instruction_block(ko_profile, context.get('genre_control'))
        base_prompt = f"{korean_block}\n\n{base_prompt}"
    
    return base_prompt
```

### 완료 기준
- ✅ 백엔드에서 한국어 프로필을 받아 태스크 계획에 반영
- ✅ 장르별로 다른 출력 형식/모드 적용
- ✅ 프롬프트에 한국어 이해 지시 블록 포함

---

## ✨ 4단계: 출력 단계 한국어 스타일 리파이너

### 목표
- 생성된 초안을 한국어 장르/톤에 맞게 후처리
- 번역투 제거, 조사/어미 자연화, 높임말 일관성

### 작업 항목

#### 4.1 Verifier 계층에 한국어 스타일 체크 추가
- [x] 경량 규칙: `api/question_answer_pipeline/korean_style_checks.py` + `verifier.verify(..., context_pack=)` + `VerificationReport.korean_style_notes` (저장소 실구현 경로)
```python
# backend/services/verifier.py (예시 — 레포는 question_answer_pipeline/verifier.py 사용)
def verify_korean_style(draft, genre_control):
    issues = []
    
    # 장르별 금지 표현 체크
    if genre_control['output_genre'] == 'kakao_message':
        if '진행되어지는' in draft or '검토가 필요하다고 판단됩니다' in draft:
            issues.append("번역투/과도한 문어체 감지")
    
    # 높임말 일관성 체크
    if genre_control['politeness'] == 'formal':
        if '해줘' in draft or '안녕하세요 반갑다' in draft:
            issues.append("높임말 혼합 오류")
    
    return issues
```

#### 4.2 Refiner 모듈 구현
- [ ] 번역투 패턴 제거 (예: "진행되어지는" → "진행되는")
- [ ] 조사 보정 (예: "그 부분에 대하여" → "그 부분은")
- [ ] 높임말 일관성 통일
- [ ] 카톡체 리듬 조정 (짧은 줄, 핵심 선행)

#### 4.3 최종 출력 전 리파이닝 적용
```python
# backend/services/refiner.py
def refine_korean_output(draft, genre_control, korean_profile):
    refined = draft
    
    # 장르별 후처리
    if genre_control['output_genre'] == 'kakao_message':
        refined = adjust_for_kakao(refined)
    elif genre_control['output_genre'] == 'news_article':
        refined = adjust_for_news(refined)
    
    # 높임말 통일
    refined = normalize_politeness(refined, genre_control['politeness'])
    
    return refined
```

### 완료 기준
- ✅ 생성된 답변이 장르에 맞는 문체로 출력
- ✅ 번역투/조사 오류 감소
- ✅ 높임말 일관성 유지

---

## 📊 5단계: 품질 평가·QA 체크리스트

### 목표
- 한국어 품질 스코어링 시스템
- 내부 QA 질문 체크리스트 자동화

### 작업 항목

#### 5.1 한국어 품질 스코어 함수
```python
# backend/services/korean_quality_scorer.py
def score_korean_quality(text, genre_control, korean_profile):
    scores = {
        'naturalness': check_naturalness(text),
        'particle_accuracy': check_particles(text),
        'politeness_consistency': check_politeness(text, genre_control['politeness']),
        'genre_fitness': check_genre_fitness(text, genre_control['output_genre']),
        'ellipsis_resolution': check_ellipsis_resolution(text, korean_profile),
    }
    return scores
```

#### 5.2 내부 QA 체크리스트
- [ ] "이 문장은 실제 한국인이 이 상황에서 쓸 법한가?"
- [ ] "장르가 섞이지 않았는가?"
- [ ] "높임말과 반말이 충돌하지 않는가?"
- [ ] "번역투처럼 느껴지지 않는가?"

#### 5.3 로깅·모니터링
- [ ] 한국어 품질 스코어를 응답 메타데이터에 포함
- [ ] 낮은 스코어 케이스 자동 플래그
- [ ] 사용자 피드백 수집 파이프라인

### 완료 기준
- ✅ 한국어 품질 스코어 계산
- ✅ QA 체크리스트 자동 실행
- ✅ 품질 이슈 로깅

---

## 🎨 6단계: 실데이터 기반 장르별 튜닝

### 목표
- 실제 사용자 입력/응답 데이터로 휴리스틱 개선
- 장르별 프롬프트/후처리 규칙 정교화

### 작업 항목

#### 6.1 데이터 수집
- [ ] 한국어 입력 샘플 수집 (카톡/기사/보고서 등)
- [ ] 사용자 피드백 수집 ("자연스럽다"/"어색하다" 등)
- [ ] 품질 이슈 케이스 수집

#### 6.2 휴리스틱 개선
- [ ] 장르 판별 정확도 향상 (키워드 확장)
- [ ] 화행 분석 정확도 향상
- [ ] 생략 복원 규칙 추가

#### 6.3 프롬프트 튜닝
- [ ] 장르별 프롬프트 템플릿 정교화
- [ ] 후처리 규칙 추가 (패턴 기반)
- [ ] LLM 기반 분류로 전환 검토 (1단계 휴리스틱 → 2단계 LLM)

### 완료 기준
- ✅ 장르별 정확도 향상 (목표: 80%+)
- ✅ 사용자 만족도 향상
- ✅ 품질 이슈 감소

---

## 🚀 즉시 시작 가능한 작업 (우선순위 순)

### 오늘 바로 시작 (1-2시간)
1. **1단계 검증**: 프론트엔드에서 한국어 프로필 생성 로그 확인
2. **2단계 시작**: 백엔드 API에서 `korean_understanding` 수신 로그 추가

### 이번 주 내 (3-5일)
3. **3단계 핵심**: 백엔드 Task Planner에 한국어 프로필 반영
4. **4단계 기본**: 카톡체/기사체 후처리 규칙 2-3개 추가

### 다음 주 (1-2주)
5. **5단계**: 품질 스코어링 기본 구현
6. **6단계**: 실데이터 수집 시작

---

## 📝 개발 진행 상황 추적

### 체크리스트 템플릿
각 단계별로 아래 형식으로 진행 상황을 기록하세요:

```markdown
## [단계명] 진행 상황

**시작일**: YYYY-MM-DD  
**목표 완료일**: YYYY-MM-DD  
**현재 상태**: 진행 중 / 완료 / 보류

### 완료된 작업
- [x] 작업 1
- [x] 작업 2

### 진행 중인 작업
- [ ] 작업 3 (진행률: 50%)

### 블로커/이슈
- 이슈 1: 설명
- 해결 방안: ...

### 다음 액션
1. 작업 4 시작
2. 작업 5 검토
```

---

## 🔗 관련 파일 위치

### 프론트엔드
- `src/utils/koreanUnderstandingLayer.ts` - 한국어 이해 계층 모듈
- `src/services/generationPromptBuilder.ts` - 프롬프트 빌더 (한국어 계층 통합)
- `src/components/ChatGPTInterface.tsx` - 메인 대화 인터페이스

### 백엔드 (구현 예정)
- `backend/services/task_planner.py` - 태스크 계획 (한국어 프로필 반영)
- `backend/services/prompt_builder.py` - 프롬프트 빌더
- `backend/services/verifier.py` - 검증 계층
- `backend/services/refiner.py` - 후처리 계층

### 문서
- `docs/architecture/GENSPARK_DEEPSEEK_KOREAN_ENGINE_V3.md` - 전체 설계
- `docs/architecture/KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md` - 이 문서

---

## 💡 팁

1. **점진적 적용**: 모든 기능을 한 번에 구현하지 말고, 1단계씩 검증하며 진행
2. **로깅 강화**: 각 단계에서 충분한 로그를 남겨 디버깅 용이하게
3. **사용자 피드백**: 실제 사용자에게 테스트해보고 피드백 수집
4. **A/B 테스트**: 기존 방식과 한국어 계층 적용 버전을 비교

---

**마지막 업데이트**: 2026-03-03  
**다음 리뷰**: 1단계 완료 후

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

