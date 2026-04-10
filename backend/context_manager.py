"""
CORBU.AI 대화 컨텍스트 관리 시스템
사용자의 대화 맥락을 기억하여 더 정확한 응답을 제공합니다.
"""

import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
from datetime import datetime, timedelta
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CORBU.AI Context Manager", version="1.0.0")

class ConversationContext(BaseModel):
    session_id: str
    user_id: str
    messages: List[Dict[str, Any]]
    current_intent: Optional[str] = None
    last_updated: str
    context_data: Dict[str, Any] = {}

class ContextRequest(BaseModel):
    session_id: str
    user_id: str
    message: str
    intent: str
    timestamp: str

class ContextResponse(BaseModel):
    session_id: str
    context_summary: str
    relevant_history: List[Dict[str, Any]]
    suggested_follow_up: Optional[str] = None
    confidence_boost: float = 0.0

# 메모리 내 컨텍스트 저장소 (실제 환경에서는 Redis나 데이터베이스 사용)
conversation_contexts: Dict[str, ConversationContext] = {}

def get_or_create_context(session_id: str, user_id: str) -> ConversationContext:
    """세션 컨텍스트를 가져오거나 새로 생성합니다."""
    if session_id not in conversation_contexts:
        conversation_contexts[session_id] = ConversationContext(
            session_id=session_id,
            user_id=user_id,
            messages=[],
            last_updated=datetime.now().isoformat(),
            context_data={}
        )
    return conversation_contexts[session_id]

def update_context(session_id: str, user_id: str, message: str, intent: str, timestamp: str):
    """컨텍스트를 업데이트합니다."""
    context = get_or_create_context(session_id, user_id)
    
    # 새 메시지 추가
    context.messages.append({
        "message": message,
        "intent": intent,
        "timestamp": timestamp,
        "type": "user"
    })
    
    # 컨텍스트 데이터 업데이트
    context.current_intent = intent
    context.last_updated = timestamp
    
    # 최근 10개 메시지만 유지
    if len(context.messages) > 10:
        context.messages = context.messages[-10:]
    
    conversation_contexts[session_id] = context

def analyze_context_for_intent(session_id: str, current_message: str) -> ContextResponse:
    """현재 메시지와 컨텍스트를 분석하여 의도 분류를 개선합니다."""
    if session_id not in conversation_contexts:
        return ContextResponse(
            session_id=session_id,
            context_summary="새로운 대화 시작",
            relevant_history=[],
            confidence_boost=0.0
        )
    
    context = conversation_contexts[session_id]
    
    # 컨텍스트 요약 생성
    context_summary = generate_context_summary(context)
    
    # 관련 이력 추출
    relevant_history = extract_relevant_history(context, current_message)
    
    # 후속 질문 제안
    suggested_follow_up = generate_follow_up_suggestion(context, current_message)
    
    # 신뢰도 부스트 계산
    confidence_boost = calculate_confidence_boost(context, current_message)
    
    return ContextResponse(
        session_id=session_id,
        context_summary=context_summary,
        relevant_history=relevant_history,
        suggested_follow_up=suggested_follow_up,
        confidence_boost=confidence_boost
    )

def generate_context_summary(context: ConversationContext) -> str:
    """컨텍스트 요약을 생성합니다."""
    if not context.messages:
        return "새로운 대화 시작"
    
    recent_intents = [msg.get("intent") for msg in context.messages[-3:] if msg.get("intent")]
    if recent_intents:
        intent_counts = {}
        for intent in recent_intents:
            intent_counts[intent] = intent_counts.get(intent, 0) + 1
        
        most_common_intent = max(intent_counts, key=intent_counts.get)
        
        intent_labels = {
            "apartment_community": "아파트 커뮤니티",
            "construction_company": "시공사 정보",
            "market_analysis": "시장 분석",
            "dream_visualization": "꿈 시각화",
            "performance_optimization": "성능 최적화",
            "scalability": "확장성 관리",
            "advanced_ai": "고급 AI",
            "long_term_planning": "장기 계획",
            "general_chat": "일반 대화"
        }
        
        return f"최근 {intent_labels.get(most_common_intent, most_common_intent)} 관련 대화 진행 중"
    
    return "일반적인 대화 진행 중"

def extract_relevant_history(context: ConversationContext, current_message: str) -> List[Dict[str, Any]]:
    """현재 메시지와 관련된 이력을 추출합니다."""
    relevant_history = []
    
    # 최근 메시지들 중에서 관련성 높은 것들 선택
    for msg in context.messages[-5:]:
        if msg.get("intent") and msg.get("intent") != "general_chat":
            relevant_history.append({
                "message": msg.get("message", "")[:50] + "...",
                "intent": msg.get("intent"),
                "timestamp": msg.get("timestamp")
            })
    
    return relevant_history

def generate_follow_up_suggestion(context: ConversationContext, current_message: str) -> Optional[str]:
    """후속 질문 제안을 생성합니다."""
    if not context.messages:
        return None
    
    current_intent = context.current_intent
    
    follow_up_suggestions = {
        "apartment_community": "더 구체적인 커뮤니티 정보가 필요하신가요?",
        "construction_company": "다른 시공사와 비교해보시겠어요?",
        "market_analysis": "다른 지역의 시장도 분석해보시겠어요?",
        "dream_visualization": "구체적인 목표 금액을 설정해보시겠어요?",
        "performance_optimization": "다른 최적화 방안도 알아보시겠어요?",
        "scalability": "확장 계획을 더 자세히 세워보시겠어요?",
        "advanced_ai": "다른 AI 기능도 활용해보시겠어요?",
        "long_term_planning": "단기 계획도 함께 세워보시겠어요?"
    }
    
    return follow_up_suggestions.get(current_intent)

def calculate_confidence_boost(context: ConversationContext, current_message: str) -> float:
    """컨텍스트 기반 신뢰도 부스트를 계산합니다."""
    if not context.messages:
        return 0.0
    
    # 최근 의도와 현재 의도가 일치하면 신뢰도 부스트
    recent_intents = [msg.get("intent") for msg in context.messages[-3:] if msg.get("intent")]
    if recent_intents:
        # 연속된 의도일 경우 더 높은 부스트
        consecutive_count = 0
        for i in range(len(recent_intents) - 1, -1, -1):
            if recent_intents[i] == recent_intents[-1]:
                consecutive_count += 1
            else:
                break
        
        return min(consecutive_count * 0.1, 0.3)  # 최대 0.3까지 부스트
    
    return 0.0

@app.post("/update-context")
async def update_conversation_context(request: ContextRequest):
    """대화 컨텍스트를 업데이트합니다."""
    try:
        update_context(
            request.session_id,
            request.user_id,
            request.message,
            request.intent,
            request.timestamp
        )
        
        logger.info(f"Context updated for session {request.session_id}")
        return {"status": "success", "message": "Context updated successfully"}
    
    except Exception as e:
        logger.error(f"Context update error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Context update failed: {str(e)}")

@app.post("/analyze-context", response_model=ContextResponse)
async def analyze_context_for_improvement(session_id: str, current_message: str):
    """컨텍스트를 분석하여 의도 분류 개선 정보를 제공합니다."""
    try:
        result = analyze_context_for_intent(session_id, current_message)
        logger.info(f"Context analyzed for session {session_id}")
        return result
    
    except Exception as e:
        logger.error(f"Context analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Context analysis failed: {str(e)}")

@app.get("/context/{session_id}")
async def get_context(session_id: str):
    """특정 세션의 컨텍스트를 조회합니다."""
    if session_id not in conversation_contexts:
        raise HTTPException(status_code=404, detail="Context not found")
    
    return conversation_contexts[session_id]

@app.delete("/context/{session_id}")
async def clear_context(session_id: str):
    """특정 세션의 컨텍스트를 삭제합니다."""
    if session_id in conversation_contexts:
        del conversation_contexts[session_id]
        return {"status": "success", "message": "Context cleared successfully"}
    else:
        raise HTTPException(status_code=404, detail="Context not found")

@app.get("/health")
async def health_check():
    """헬스체크 엔드포인트"""
    return {
        "status": "healthy", 
        "service": "context_manager", 
        "active_sessions": len(conversation_contexts),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "CORBU.AI Context Manager",
        "version": "1.0.0",
        "description": "대화 컨텍스트를 관리하여 더 정확한 의도 분류를 제공합니다.",
        "endpoints": {
            "update_context": "/update-context",
            "analyze_context": "/analyze-context",
            "get_context": "/context/{session_id}",
            "clear_context": "/context/{session_id}",
            "health": "/health",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn

    _p = int(
        os.environ.get("CONTEXT_MANAGER_SERVICE_PORT", os.environ.get("PORT", "8003"))
    )
    uvicorn.run(app, host="0.0.0.0", port=_p)
