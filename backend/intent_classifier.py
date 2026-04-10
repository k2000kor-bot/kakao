"""
CORBU.AI 의도 분류 및 스마트 라우팅 시스템
사용자의 질문을 분석하여 적절한 기능으로 라우팅합니다.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
import re
import os
from datetime import datetime
import logging
import hashlib
import requests

def _default_main_api_origin() -> str:
    p = os.environ.get("API_PORT") or os.environ.get("BACKEND_PORT") or "5002"
    return f"http://localhost:{p}"


def _default_intent_cache_origin() -> str:
    p = os.environ.get("CACHE_MANAGER_PORT") or "8014"
    return f"http://localhost:{p}"


# 통합 API 기본 오리진. CORBU_MAIN_API_BASE 미설정 시 API_PORT/BACKEND_PORT(기본 5002).
_DEFAULT_SERVICE_ORIGIN = os.environ.get(
    "CORBU_MAIN_API_BASE", _default_main_api_origin()
).rstrip("/")
# 의도 캐시 전용(선택). CORBU_INTENT_CACHE_BASE 미설정 시 CACHE_MANAGER_PORT(기본 8014).
_INTENT_CACHE_BASE = os.environ.get(
    "CORBU_INTENT_CACHE_BASE", _default_intent_cache_origin()
).rstrip("/")
# 컨텍스트/분석 트래킹(선택). 미설정 시 통합 오리진으로 시도(엔드포인트 없으면 무시).
_CONTEXT_MANAGER_BASE = os.environ.get(
    "CORBU_CONTEXT_MANAGER_BASE", _DEFAULT_SERVICE_ORIGIN
).rstrip("/")
_ANALYTICS_TRACKER_BASE = os.environ.get(
    "CORBU_ANALYTICS_TRACKER_BASE", _DEFAULT_SERVICE_ORIGIN
).rstrip("/")

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CORBU.AI Intent Classifier", version="1.0.0")

class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = "default_user"
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class IntentResponse(BaseModel):
    intent: str
    confidence: float
    suggested_action: str
    parameters: Dict[str, Any]
    response_message: str
    service_endpoint: str

class ChatResponse(BaseModel):
    response: str
    intent: str
    service_used: str
    data: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[str]] = None
    timestamp: str

# 의도 분류 키워드 및 패턴
INTENT_PATTERNS = {
    "apartment_community": {
        "keywords": ["아파트", "커뮤니티", "입주민", "단지", "이웃", "커뮤니티센터", "관리사무소", "분위기", "성향", "활동"],
        "patterns": [
            r".*아파트.*커뮤니티.*",
            r".*입주민.*분석.*",
            r".*단지.*분위기.*",
            r".*이웃.*성향.*",
            r".*커뮤니티.*분석.*"
        ],
        "service": "apartment_community_analyzer",
        "endpoint": _DEFAULT_SERVICE_ORIGIN
    },
    "construction_company": {
        "keywords": ["시공사", "건설회사", "하자", "품질", "시공", "건설업체", "시공업체", "정보"],
        "patterns": [
            r".*시공사.*분석.*",
            r".*건설회사.*정보.*",
            r".*하자.*이력.*",
            r".*시공.*품질.*",
            r".*시공사.*정보.*"
        ],
        "service": "construction_company_info_system",
        "endpoint": _DEFAULT_SERVICE_ORIGIN
    },
    "market_analysis": {
        "keywords": ["시장", "부동산", "가격", "분석", "투자", "시세", "매매", "전세", "월세", "강남구", "서초구", "송파구", "강동구", "가격", "동향", "예측"],
        "patterns": [
            r".*부동산.*시장.*분석.*",
            r".*가격.*동향.*",
            r".*투자.*분석.*",
            r".*시세.*예측.*",
            r".*아파트.*시세.*",
            r".*구.*아파트.*가격.*",
            r".*지역.*부동산.*가격.*"
        ],
        "service": "market_analysis_engine",
        "endpoint": _DEFAULT_SERVICE_ORIGIN
    },
    "dream_visualization": {
        "keywords": ["꿈", "목표", "계획", "미래", "희망", "비전", "설계", "계획"],
        "patterns": [
            r".*꿈.*집.*계획.*",
            r".*미래.*목표.*",
            r".*희망.*설계.*",
            r".*비전.*수립.*"
        ],
        "service": "dream_visualization_system",
        "endpoint": _DEFAULT_SERVICE_ORIGIN
    },
    "performance_optimization": {
        "keywords": ["성능", "최적화", "속도", "개선", "효율", "최적화"],
        "patterns": [
            r".*성능.*최적화.*",
            r".*속도.*개선.*",
            r".*효율.*향상.*"
        ],
        "service": "performance_optimizer",
        "endpoint": _DEFAULT_SERVICE_ORIGIN
    },
    "scalability": {
        "keywords": ["확장", "스케일", "용량", "부하", "확장성"],
        "patterns": [
            r".*확장.*계획.*",
            r".*스케일.*관리.*",
            r".*용량.*계획.*"
        ],
        "service": "scalability_manager",
        "endpoint": _DEFAULT_SERVICE_ORIGIN
    },
    "advanced_ai": {
        "keywords": ["AI", "인공지능", "고급", "분석", "예측", "추천"],
        "patterns": [
            r".*AI.*분석.*",
            r".*인공지능.*추천.*",
            r".*고급.*예측.*"
        ],
        "service": "advanced_ai_features",
        "endpoint": _DEFAULT_SERVICE_ORIGIN
    },
    "long_term_planning": {
        "keywords": ["장기", "계획", "전략", "목표", "로드맵", "미래"],
        "patterns": [
            r".*장기.*계획.*",
            r".*전략.*수립.*",
            r".*로드맵.*계획.*"
        ],
        "service": "long_term_planning",
        "endpoint": _DEFAULT_SERVICE_ORIGIN
    },
    "general_chat": {
        "keywords": ["안녕", "도움", "정보", "질문", "궁금"],
        "patterns": [
            r".*안녕.*",
            r".*도움.*",
            r".*정보.*"
        ],
        "service": "chatgpt_unified_system",
        "endpoint": _DEFAULT_SERVICE_ORIGIN
    }
}

def generate_cache_key(message: str) -> str:
    """메시지 기반 캐시 키 생성"""
    return hashlib.md5(message.encode()).hexdigest()

def get_cached_intent(cache_key: str) -> Optional[IntentResponse]:
    """캐시에서 의도 분류 결과 조회"""
    try:
        response = requests.get(f"{_INTENT_CACHE_BASE}/cache/intent/{cache_key}", timeout=1)
        if response.status_code == 200:
            data = response.json()
            return IntentResponse(**data["result"])
    except Exception as e:
        logger.warning(f"Cache lookup failed: {e}")
    return None

def cache_intent_result(cache_key: str, intent_result: IntentResponse) -> None:
    """의도 분류 결과를 캐시에 저장"""
    try:
        requests.post(
            f"{_INTENT_CACHE_BASE}/cache/intent/{cache_key}",
            json=intent_result.dict(),
            timeout=1,
        )
    except Exception as e:
        logger.warning(f"Cache store failed: {e}")

def classify_intent(message: str) -> IntentResponse:
    """사용자 메시지를 분석하여 의도를 분류합니다. 캐시를 활용하여 성능을 최적화합니다."""
    # 캐시 키 생성
    cache_key = generate_cache_key(message)
    
    # 캐시에서 결과 조회
    cached_result = get_cached_intent(cache_key)
    if cached_result:
        logger.info(f"Cache hit for intent classification: {cache_key[:8]}...")
        return cached_result
    
    # 캐시 미스 - 새로운 분류 수행
    message_lower = message.lower()
    
    # 키워드 매칭 점수 계산
    intent_scores = {}
    
    for intent, config in INTENT_PATTERNS.items():
        score = 0
        
        # 키워드 매칭
        for keyword in config["keywords"]:
            if keyword in message_lower:
                score += 1
        
        # 패턴 매칭
        for pattern in config["patterns"]:
            if re.search(pattern, message_lower):
                score += 2
        
        intent_scores[intent] = score
    
    # 가장 높은 점수의 의도 선택
    if not intent_scores or max(intent_scores.values()) == 0:
        # 기본적으로 일반 대화로 분류
        best_intent = "general_chat"
        confidence = 0.1
    else:
        best_intent = max(intent_scores, key=intent_scores.get)
        max_score = max(intent_scores.values())
        confidence = min(max_score / 5.0, 1.0)  # 최대 5점을 기준으로 정규화
    
    config = INTENT_PATTERNS[best_intent]
    
    # 응답 메시지 생성
    response_messages = {
        "apartment_community": "아파트 커뮤니티 분석을 도와드리겠습니다. 어떤 정보가 필요하신가요?",
        "construction_company": "시공사 정보 및 분석을 제공해드리겠습니다.",
        "market_analysis": "부동산 시장 분석을 시작하겠습니다.",
        "dream_visualization": "꿈의 집 계획을 함께 세워보겠습니다.",
        "performance_optimization": "성능 최적화 분석을 진행하겠습니다.",
        "scalability": "확장성 관리 방안을 제안해드리겠습니다.",
        "advanced_ai": "고급 AI 기능을 활용한 분석을 시작하겠습니다.",
        "long_term_planning": "장기 계획 수립을 도와드리겠습니다.",
        "general_chat": "안녕하세요! CORBU.AI가 도와드리겠습니다."
    }
    
    result = IntentResponse(
        intent=best_intent,
        confidence=confidence,
        suggested_action=f"Call {config['service']} service",
        parameters={"message": message},
        response_message=response_messages[best_intent],
        service_endpoint=config["endpoint"]
    )
    
    # 결과를 캐시에 저장
    cache_intent_result(cache_key, result)
    
    return result

def extract_parameters(message: str, intent: str) -> Dict[str, Any]:
    """메시지에서 의도별 파라미터를 추출합니다."""
    parameters = {"message": message}
    
    if intent == "apartment_community":
        # 아파트 관련 정보 추출
        if "분석" in message:
            parameters["action"] = "analyze"
        elif "응답" in message:
            parameters["action"] = "generate_response"
    
    elif intent == "construction_company":
        # 시공사 관련 정보 추출
        if "분석" in message:
            parameters["action"] = "analyze_company"
        elif "비교" in message:
            parameters["action"] = "compare_companies"
    
    elif intent == "market_analysis":
        # 시장 분석 관련 정보 추출
        if "분석" in message:
            parameters["action"] = "analyze_market"
        elif "비교" in message:
            parameters["action"] = "compare_regions"
    
    elif intent == "dream_visualization":
        # 꿈 시각화 관련 정보 추출
        if "목표" in message:
            parameters["action"] = "create_goal"
        elif "시각화" in message:
            parameters["action"] = "visualize_dream"
    
    return parameters

@app.post("/classify-intent", response_model=IntentResponse)
async def classify_user_intent(message: ChatMessage):
    """사용자 메시지의 의도를 분류합니다."""
    try:
        intent_result = classify_intent(message.message)
        intent_result.parameters = extract_parameters(message.message, intent_result.intent)
        
        logger.info(f"Intent classified: {intent_result.intent} (confidence: {intent_result.confidence})")
        return intent_result
    
    except Exception as e:
        logger.error(f"Intent classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Intent classification failed: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def process_chat_message(message: ChatMessage):
    """사용자 메시지를 처리하고 적절한 서비스로 라우팅합니다."""
    try:
        # 컨텍스트 분석 (컨텍스트 관리자가 실행 중인 경우)
        context_boost = 0.0
        try:
            import requests
            context_response = requests.post(
                f"{_CONTEXT_MANAGER_BASE}/analyze-context",
                params={"session_id": message.session_id or "default", "current_message": message.message},
                timeout=1
            )
            if context_response.status_code == 200:
                context_data = context_response.json()
                context_boost = context_data.get("confidence_boost", 0.0)
                logger.info(f"Context boost: {context_boost}")
        except Exception as context_error:
            logger.warning(f"Context analysis failed: {context_error}")
        
        # 의도 분류
        intent_result = classify_intent(message.message)
        
        # 컨텍스트 부스트 적용
        intent_result.confidence += context_boost
        intent_result.confidence = min(intent_result.confidence, 1.0)
        
        # 컨텍스트 업데이트
        try:
            requests.post(
                f"{_CONTEXT_MANAGER_BASE}/update-context",
                json={
                    "session_id": message.session_id or "default",
                    "user_id": message.user_id,
                    "message": message.message,
                    "intent": intent_result.intent,
                    "timestamp": datetime.now().isoformat()
                },
                timeout=1
            )
        except Exception as context_error:
            logger.warning(f"Context update failed: {context_error}")
        
        # 분석 이벤트 추적
        try:
            # 질문 이벤트 추적
            requests.post(
                f"{_ANALYTICS_TRACKER_BASE}/track-event",
                json={
                    "user_id": message.user_id,
                    "session_id": message.session_id or "default",
                    "event_type": "question",
                    "data": {"message": message.message},
                    "timestamp": datetime.now().isoformat()
                },
                timeout=1
            )
            
            # 의도 분류 이벤트 추적
            requests.post(
                f"{_ANALYTICS_TRACKER_BASE}/track-event",
                json={
                    "user_id": message.user_id,
                    "session_id": message.session_id or "default",
                    "event_type": "intent_classified",
                    "data": {
                        "intent": intent_result.intent,
                        "confidence": intent_result.confidence,
                        "service_endpoint": intent_result.service_endpoint
                    },
                    "timestamp": datetime.now().isoformat()
                },
                timeout=1
            )
            
            # 서비스 사용 이벤트 추적
            requests.post(
                f"{_ANALYTICS_TRACKER_BASE}/track-event",
                json={
                    "user_id": message.user_id,
                    "session_id": message.session_id or "default",
                    "event_type": "service_used",
                    "data": {"service": intent_result.service_endpoint},
                    "timestamp": datetime.now().isoformat()
                },
                timeout=1
            )
        except Exception as analytics_error:
            logger.warning(f"Analytics tracking failed: {analytics_error}")
        
        # 서비스별 처리
        if intent_result.intent == "general_chat":
            # 일반 대화은 메인 시스템으로 라우팅
            response_text = f"안녕하세요! CORBU.AI입니다. '{message.message}'에 대해 도움을 드리겠습니다."
            suggestions = [
                "아파트 커뮤니티 분석해주세요",
                "시공사 정보를 알려주세요",
                "부동산 시장 분석을 해주세요",
                "꿈의 집 계획을 세워주세요"
            ]
        else:
            # 특정 기능으로 라우팅
            response_text = intent_result.response_message
            suggestions = get_suggestions_for_intent(intent_result.intent)
        
        return ChatResponse(
            response=response_text,
            intent=intent_result.intent,
            service_used=intent_result.service_endpoint,
            suggestions=suggestions,
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        logger.error(f"Chat processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

def get_suggestions_for_intent(intent: str) -> List[str]:
    """의도별 추천 질문을 반환합니다."""
    suggestions_map = {
        "apartment_community": [
            "입주민 성향을 분석해주세요",
            "커뮤니티 분위기는 어떤가요?",
            "단지 내 활동을 분석해주세요"
        ],
        "construction_company": [
            "시공사 신뢰도를 분석해주세요",
            "하자 이력을 확인해주세요",
            "시공사들을 비교해주세요"
        ],
        "market_analysis": [
            "부동산 시장 동향을 분석해주세요",
            "가격 예측을 해주세요",
            "투자 가치를 분석해주세요"
        ],
        "dream_visualization": [
            "꿈의 집 목표를 설정해주세요",
            "미래 계획을 시각화해주세요",
            "희망 설계를 도와주세요"
        ],
        "performance_optimization": [
            "성능을 최적화해주세요",
            "속도를 개선해주세요"
        ],
        "scalability": [
            "확장 계획을 세워주세요",
            "용량을 관리해주세요"
        ],
        "advanced_ai": [
            "AI 분석을 해주세요",
            "고급 예측을 해주세요"
        ],
        "long_term_planning": [
            "장기 계획을 수립해주세요",
            "전략을 세워주세요"
        ]
    }
    
    return suggestions_map.get(intent, ["더 자세한 정보를 알려주세요"])

@app.get("/health")
async def health_check():
    """헬스체크 엔드포인트"""
    return {"status": "healthy", "service": "intent_classifier", "timestamp": datetime.now().isoformat()}

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "CORBU.AI Intent Classifier",
        "version": "1.0.0",
        "description": "사용자 질문을 분석하여 적절한 AI 서비스로 라우팅합니다.",
        "endpoints": {
            "classify": "/classify-intent",
            "chat": "/chat",
            "health": "/health",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn

    _ic_port = int(
        os.environ.get("INTENT_CLASSIFIER_PORT", os.environ.get("PORT", "8000"))
    )
    uvicorn.run(app, host="0.0.0.0", port=_ic_port)
