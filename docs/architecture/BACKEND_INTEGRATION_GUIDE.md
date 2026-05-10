# 백엔드 한국어 이해 계층 통합 가이드

**목적**: 백엔드에서 프론트엔드가 전송한 `korean_understanding` 프로필을 수신하고 프롬프트 엔진에 통합하는 방법

---

## 1. API 요청에서 한국어 프로필 수신

### FastAPI 예시

```python
# backend/main_server.py 또는 chat 엔드포인트

from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    # ... 기타 필드

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # 컨텍스트에서 한국어 프로필 추출
    context = request.context or {}
    korean_profile = context.get('korean_understanding')
    genre_control = context.get('genre_control')
    enable_korean_depth = context.get('enable_korean_depth', False)
    
    # 2단계 검증: 수신 로그
    if korean_profile:
        logger.info(f"[Korean Layer] Received profile: genre={korean_profile.get('genre')}, "
                   f"speech_act={korean_profile.get('speech_act')}, "
                   f"formality={korean_profile.get('formality')}")
        logger.info(f"[Korean Layer] Genre control: {genre_control}")
    else:
        logger.debug("[Korean Layer] No Korean profile in context (non-Korean input or not enabled)")
    
    # 이후 단계에서 사용할 수 있도록 전달
    # ...
```

### Flask 예시

```python
# backend/app.py

from flask import Flask, request, jsonify
import logging

logger = logging.getLogger(__name__)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    context = data.get('context', {})
    
    korean_profile = context.get('korean_understanding')
    genre_control = context.get('genre_control')
    
    if korean_profile:
        logger.info(f"[Korean Layer] Profile: {korean_profile.get('genre')}")
        # ...
```

---

## 2. Task Planner에 한국어 프로필 반영

### 예시 구현

```python
# backend/services/task_planner.py

from typing import Dict, Any, Optional

def build_task_plan(
    user_query: str,
    context: Dict[str, Any],
    default_mode: str = "fast"
) -> Dict[str, Any]:
    """
    사용자 요청을 분석하여 태스크 계획 생성
    한국어 프로필이 있으면 장르/화행에 맞게 모드/형식 조정
    """
    plan = {
        "user_goal": user_query,
        "task_type": "general",
        "mode": default_mode,
        "output_format": "general",
        "required_context": [],
        "deliverables": ["answer"],
    }
    
    # 한국어 프로필 반영
    korean_profile = context.get('korean_understanding')
    genre_control = context.get('genre_control')
    
    if korean_profile and genre_control:
        genre = korean_profile.get('genre', 'general')
        speech_act = korean_profile.get('speech_act', 'unknown')
        formality = korean_profile.get('formality', 'mixed_unspecified')
        
        # 장르별 모드 결정
        if genre == 'kakao_message':
            plan['mode'] = 'fast'
            plan['output_format'] = 'chat_message'
            plan['sentence_length'] = 'short'
        elif genre in ['legal_memo', 'administrative']:
            plan['mode'] = 'expert'
            plan['output_format'] = 'formal_document'
            plan['sentence_length'] = 'medium'
        elif genre == 'news_article':
            plan['mode'] = 'guided'
            plan['output_format'] = 'article'
            plan['sentence_length'] = 'medium'
        
        # 화행별 태스크 타입 결정
        if speech_act == 'rebuttal_request':
            plan['task_type'] = 'rebuttal_writing'
            plan['tone'] = korean_profile.get('tone_hint', 'neutral')
        elif speech_act == 'fact_check_neutral':
            plan['task_type'] = 'fact_checking'
            plan['mode'] = 'expert'  # 검증은 정교 모드
        elif speech_act == 'summarize':
            plan['task_type'] = 'summarization'
        
        # 높임말 수준 반영
        if formality == 'formal':
            plan['politeness_level'] = 'high'
        elif formality == 'semi_formal':
            plan['politeness_level'] = 'medium'
        elif formality == 'informal':
            plan['politeness_level'] = 'low'
        
        # 생략 복원 힌트 추가
        ellipsis_notes = korean_profile.get('ellipsis_resolution_notes', [])
        if ellipsis_notes:
            plan['context_hints'] = ellipsis_notes
    
    return plan
```

---

## 3. 프롬프트 빌더에 한국어 지시 블록 주입

### 예시 구현

```python
# backend/services/prompt_builder.py

def build_generation_prompt(
    user_query: str,
    task_plan: Dict[str, Any],
    context: Dict[str, Any]
) -> str:
    """
    사용자 쿼리와 태스크 계획을 바탕으로 최종 프롬프트 생성
    한국어 프로필이 있으면 내부 지시 블록 추가
    """
    base_prompt = f"{user_query}\n\n"
    
    # 한국어 계층 지시 블록 (내부 전용, 사용자에게 노출 금지)
    korean_instruction = context.get('korean_layer_instruction')
    if korean_instruction:
        base_prompt = f"{korean_instruction}\n\n{base_prompt}"
    
    # 일반 출력 형식 지시
    output_format = task_plan.get('output_format', 'general')
    if output_format == 'chat_message':
        base_prompt += "[출력 형식 지시]\n카카오톡 메시지 형식으로 작성하세요. 짧은 줄, 핵심 선행, 부담 없는 존댓말을 사용하세요.\n\n"
    elif output_format == 'formal_document':
        base_prompt += "[출력 형식 지시]\n공식 문서 형식으로 작성하세요. 높임말 일관, 서식 준수, 추정은 확인 필요로 표기하세요.\n\n"
    elif output_format == 'article':
        base_prompt += "[출력 형식 지시]\n기사체로 작성하세요. 객관 서술, 사실 전달 우선, 과한 감탄사 배제하세요.\n\n"
    
    # 태스크 타입별 지시
    task_type = task_plan.get('task_type')
    if task_type == 'rebuttal_writing':
        tone = task_plan.get('tone', 'neutral')
        base_prompt += f"[반박 작성 지시]\n제시된 내용에 대한 반박을 작성하세요. 톤: {tone}\n\n"
    elif task_type == 'fact_checking':
        base_prompt += "[팩트체크 지시]\n중립적 관점에서 사실을 검증하고 확인 필요 사항을 명시하세요.\n\n"
    
    return base_prompt
```

---

## 4. 출력 리파이너에 장르별 후처리

### 예시 구현

```python
# backend/services/korean_refiner.py

import re
from typing import Dict, Any

def refine_korean_output(
    draft: str,
    genre_control: Dict[str, Any],
    korean_profile: Dict[str, Any]
) -> str:
    """
    생성된 초안을 한국어 장르/톤에 맞게 후처리
    """
    refined = draft
    genre = genre_control.get('output_genre', 'general')
    politeness = genre_control.get('politeness', 'mixed_unspecified')
    
    # 번역투 제거 (공통)
    refined = re.sub(r'진행되어지는', '진행되는', refined)
    refined = re.sub(r'검토가 필요하다고 판단됩니다', '검토가 필요합니다', refined)
    refined = re.sub(r'대응이 요구되는 바입니다', '대응이 필요합니다', refined)
    
    # 장르별 후처리
    if genre == 'kakao_message':
        # 카톡체: 짧은 줄로 분리, 핵심 선행
        refined = adjust_for_kakao(refined)
    elif genre == 'news_article':
        # 기사체: 객관화, 감정 표현 최소화
        refined = adjust_for_news(refined)
    elif genre in ['administrative', 'legal_memo']:
        # 공문/법률: 높임말 통일, 서식 준수
        refined = adjust_for_formal(refined, politeness)
    
    # 높임말 일관성 통일
    if politeness == 'formal':
        refined = normalize_to_formal(refined)
    elif politeness == 'semi_formal':
        refined = normalize_to_semi_formal(refined)
    
    return refined

def adjust_for_kakao(text: str) -> str:
    """카톡체 조정: 긴 문장을 짧게 분리"""
    # 예시: 마침표 기준으로 줄바꿈 추가 (너무 긴 경우)
    lines = text.split('\n')
    adjusted = []
    for line in lines:
        if len(line) > 100 and '. ' in line:
            sentences = line.split('. ')
            adjusted.append('. '.join(sentences[:2]) + '.')
            if len(sentences) > 2:
                adjusted.append('. '.join(sentences[2:]) + ('.' if sentences[-1].endswith('.') else ''))
        else:
            adjusted.append(line)
    return '\n'.join(adjusted)

def normalize_to_formal(text: str) -> str:
    """높임말 통일 (존댓말)"""
    # 예시: "해줘" → "해주시기 바랍니다" (맥락에 따라)
    # 실제로는 더 정교한 규칙 필요
    text = re.sub(r'\b해줘\b', '해주시기 바랍니다', text)
    text = re.sub(r'\b안녕하세요 반갑다\b', '안녕하세요. 반갑습니다', text)
    return text
```

---

## 5. 통합 예시 (전체 흐름)

```python
# backend/main_server.py

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_query = request.message
    context = request.context or {}
    
    # 1. 한국어 프로필 추출
    korean_profile = context.get('korean_understanding')
    genre_control = context.get('genre_control')
    
    # 2. Task Planner에 프로필 전달
    task_plan = build_task_plan(user_query, context)
    
    # 3. 프롬프트 생성 (한국어 지시 포함)
    prompt = build_generation_prompt(user_query, task_plan, context)
    
    # 4. LLM 호출
    draft_response = await call_llm(prompt, task_plan)
    
    # 5. 한국어 리파이닝 (프로필이 있는 경우)
    if korean_profile and genre_control:
        final_response = refine_korean_output(draft_response, genre_control, korean_profile)
    else:
        final_response = draft_response
    
    # 6. 응답 반환
    return {
        "response": final_response,
        "metadata": {
            "korean_layer_applied": bool(korean_profile),
            "genre": korean_profile.get('genre') if korean_profile else None,
        }
    }
```

---

## 6. 테스트 방법

### 수동 테스트

1. 프론트엔드에서 한글 입력 (예: "위 내용 카톡용으로 반박해줘")
2. 백엔드 로그에서 다음 확인:
   ```
   [Korean Layer] Received profile: genre=kakao_message, speech_act=rebuttal_request
   ```
3. 생성된 프롬프트에 한국어 지시 블록 포함 확인
4. 최종 응답이 카톡체로 출력되는지 확인

### 자동 테스트

```python
# backend/tests/test_korean_layer.py

def test_korean_profile_reception():
    context = {
        "korean_understanding": {
            "genre": "kakao_message",
            "speech_act": "rebuttal_request",
            "formality": "semi_formal",
        },
        "genre_control": {
            "output_genre": "kakao_message",
            "sentence_length": "short",
        }
    }
    
    task_plan = build_task_plan("테스트", context)
    assert task_plan["mode"] == "fast"
    assert task_plan["output_format"] == "chat_message"
    assert task_plan["task_type"] == "rebuttal_writing"
```

---

## 7. 다음 단계

이 가이드를 따라 구현한 후:

1. **로깅 확인**: 한국어 프로필이 제대로 수신되는지
2. **프롬프트 검증**: 생성된 프롬프트에 한국어 지시가 포함되는지
3. **출력 검증**: 최종 응답이 장르에 맞는지
4. **피드백 수집**: 실제 사용자 테스트

자세한 단계별 가이드는 [`KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md`](./KOREAN_LAYER_IMPLEMENTATION_ROADMAP.md) 참고.

---

**마지막 업데이트**: 2026-03-03

## 개발자 검증

저장소 루트 검증 허브: [TESTING_GUIDE.md](../../TESTING_GUIDE.md) — `npm run test:routes` · (권장) `npm run test:sidebar-context` · 마무리 `npm run verify:completion` — [COMPLETION_CHECKLIST.md](../COMPLETION_CHECKLIST.md) · 배포 직전 [FINAL_CHECKLIST.md](../FINAL_CHECKLIST.md)(`npm run verify:final`) · 원격 `git push` 막힘 [PUSH_BLOCK_HANDOFF.md](../PUSH_BLOCK_HANDOFF.md)(`npm run maintain:push-block`).

