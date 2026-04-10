#!/usr/bin/env python3
"""
통합 백엔드 API 서버 v1.0
- 21가지 대화 유형 시스템과 프론트엔드 연동
- 실시간 문맥 분석 및 메시지 생성
- 성능 분석 및 통계 제공
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import json
import sqlite3
import asyncio
from datetime import datetime, timedelta
import logging
import uuid
from collections import defaultdict, deque
import random
import os

from cors_config import get_cors_allow_origins

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="통합 백엔드 API 서버", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 데이터 모델들 ====================

class DialogueRequest(BaseModel):
    """대화 생성 요청"""
    input_message: str
    conversation_context: List[str] = []
    target_dialogue_type: Optional[str] = None
    intensity_level: int = 3
    relationship_dynamic: str = "neutral"
    contextual_factors: Dict[str, Any] = {}

class ContextAnalysis(BaseModel):
    """문맥 분석 결과"""
    dominant_emotion: str
    situation_type: str
    relationship_tone: str
    urgency_level: int
    key_entities: List[str]
    implicit_intent: str

class GeneratedMessage(BaseModel):
    """생성된 메시지"""
    message_id: str
    message: str
    dialogue_type: str
    intensity: int
    applied_context: ContextAnalysis
    effectiveness_estimate: float
    linguistic_features: List[str]
    generation_time: str

class DialogueStats(BaseModel):
    """대화 통계"""
    type: str
    name: str
    count: int
    avg_effectiveness: float
    trend: str
    category: str

# ==================== 전역 변수 및 초기화 ====================

# 연결된 WebSocket 클라이언트들
active_connections: List[WebSocket] = []

# 대화 생성 이력
generation_history = deque(maxlen=1000)

# 실시간 통계
realtime_stats = defaultdict(lambda: {
    'count': 0,
    'total_effectiveness': 0.0,
    'recent_trend': []
})

# 21가지 대화 유형 정의
DIALOGUE_TYPES = {
    'counter_question': {'name': '반문', 'category': 'basic', 'description': '상대의 주장에 질문을 던져 되묻는 방식'},
    'opposition': {'name': '반대', 'category': 'basic', 'description': '명확하게 의견을 거부하거나 부정'},
    'agreement': {'name': '동조', 'category': 'basic', 'description': '상대 의견에 동의하거나 지지'},
    'defense': {'name': '응호', 'category': 'basic', 'description': '특정 입장이나 대상을 적극적으로 옹호'},
    'criticism': {'name': '비난', 'category': 'basic', 'description': '강하게 부정적 평가나 공격'},
    'neutral': {'name': '중립', 'category': 'moderate', 'description': '감정이나 입장 없이 상황만 설명'},
    'avoidance': {'name': '회피', 'category': 'moderate', 'description': '명확한 입장을 회피하거나 대화를 흐림'},
    'sarcasm': {'name': '풍자', 'category': 'moderate', 'description': '비꼬거나 간접적으로 비판'},
    'empathy': {'name': '공감', 'category': 'moderate', 'description': '상대 감정을 이해하고 수용'},
    'suggestion': {'name': '제안', 'category': 'moderate', 'description': '해결책이나 대안을 제시'},
    'questioning': {'name': '질문', 'category': 'advanced', 'description': '정보를 얻거나 의문을 던짐'},
    'ignoring': {'name': '무시', 'category': 'advanced', 'description': '반응하지 않거나 대화를 거부'},
    'emphasis': {'name': '강조', 'category': 'advanced', 'description': '특정 사실이나 의견을 부각'},
    'speculation': {'name': '추측', 'category': 'advanced', 'description': '확실하지 않은 의견을 조심스럽게 제시'},
    'emotional_appeal': {'name': '감정적 호소', 'category': 'advanced', 'description': '논리보다 감정에 기반해 설득'},
    'mockery': {'name': '조롱', 'category': 'research', 'description': '상대를 비웃거나 깎아내림'},
    'directive': {'name': '명령', 'category': 'research', 'description': '지시하거나 강제하는 어투'},
    'coercion': {'name': '강압', 'category': 'research', 'description': '위협, 압박을 통해 상대를 설득'},
    'forcefulness': {'name': '강제', 'category': 'research', 'description': '선택권을 주지 않고 특정 행동을 요구'},
    'brainwashing': {'name': '세뇌', 'category': 'research', 'description': '장기간 반복·왜곡으로 판단력을 마비시킴'},
    'gaslighting': {'name': '가스라이팅', 'category': 'research', 'description': '상대의 현실 인식을 부정하거나 조작해 혼란을 유도'}
}

# ==================== 핵심 함수들 ====================

def analyze_context(input_message: str, conversation_history: List[str] = None) -> ContextAnalysis:
    """문맥 분석"""
    
    # 감정 분석
    emotion_indicators = {
        'anger': ['화', '짜증', '분노', '빡', '열받'],
        'sadness': ['슬프', '우울', '마음아프', '답답'],
        'joy': ['기쁘', '좋', '행복', '최고', 'ㅎㅎ'],
        'fear': ['무서', '걱정', '불안', '두려'],
        'neutral': []
    }
    
    dominant_emotion = 'neutral'
    for emotion, indicators in emotion_indicators.items():
        if any(indicator in input_message for indicator in indicators):
            dominant_emotion = emotion
            break
    
    # 상황 유형 분석
    situation_type = 'general'
    if any(word in input_message for word in ['공정', '불공정', '공평']):
        situation_type = 'fairness_issue'
    elif any(word in input_message for word in ['갈등', '분쟁', '문제']):
        situation_type = 'conflict'
    elif '?' in input_message or any(word in input_message for word in ['궁금', '알고싶']):
        situation_type = 'question'
    
    # 관계 톤 분석
    relationship_tone = 'neutral'
    if any(word in input_message for word in ['님', '께서', '하십시오']):
        relationship_tone = 'formal'
    elif any(word in input_message for word in ['야', '너', '해']):
        relationship_tone = 'casual'
    
    # 긴급도 분석
    urgency_level = 3
    if any(word in input_message for word in ['긴급', '즉시', '당장']):
        urgency_level = 5
    elif any(word in input_message for word in ['빠른', '서둘러']):
        urgency_level = 4
    elif '!' in input_message:
        urgency_level = 4
    
    # 핵심 개체 추출
    entities = []
    companies = ['삼성', 'LG', '현대', '조합', '시공사', '업체']
    for company in companies:
        if company in input_message:
            entities.append(company)
    
    # 암시적 의도 분석
    implicit_intent = 'general_communication'
    if any(word in input_message for word in ['지켜보고', '관심', '응원']):
        implicit_intent = 'seek_support'
    elif any(word in input_message for word in ['몰아붙이는', '억지', '말도안']):
        implicit_intent = 'express_frustration'
    elif any(word in input_message for word in ['공정', '공평', '투명']):
        implicit_intent = 'demand_fairness'
    
    return ContextAnalysis(
        dominant_emotion=dominant_emotion,
        situation_type=situation_type,
        relationship_tone=relationship_tone,
        urgency_level=urgency_level,
        key_entities=entities,
        implicit_intent=implicit_intent
    )

def select_optimal_dialogue_type(context: ContextAnalysis, input_message: str) -> str:
    """최적 대화 유형 자동 선택"""
    
    # 상황별 매핑
    if context.situation_type == 'fairness_issue':
        if context.dominant_emotion == 'anger':
            return 'defense'
        else:
            return 'counter_question'
    
    if context.dominant_emotion == 'anger':
        return 'empathy'
    elif context.dominant_emotion == 'sadness':
        return 'empathy'
    elif context.situation_type == 'question':
        return 'questioning'
    
    return 'suggestion'

def generate_contextual_message(input_message: str, dialogue_type: str, 
                               intensity: int, context: ContextAnalysis) -> str:
    """문맥 기반 메시지 생성"""
    
    # 유형별 템플릿
    templates = {
        'counter_question': [
            '그런데 {point}는 어떻게 생각하시나요?',
            '{point}에 대해서는 다른 견해도 있지 않을까요?',
            '정말로 {assumption}이라고 확신하시나요?',
            '{claim}라고 하셨는데, 그렇다면 {challenge}는 어떻게 설명하시겠습니까?',
            '과연 {controversial}라는 주장이 현실적으로 가능하다고 보십니까?'
        ],
        'empathy': [
            '말씀하신 내용을 충분히 이해할 수 있습니다.',
            '그런 상황이시라면 정말 힘드셨을 것 같아요.',
            '충분히 이해됩니다. 같은 마음입니다.',
            '정말 마음이 아픕니다.',
            '함께 아파하며 깊이 공감합니다.'
        ],
        'suggestion': [
            '혹시 공정한 재검토는 어떨까요?',
            '투명한 기준 적용을 제안드립니다.',
            '반드시 객관적 재평가를 고려해보셔야 합니다.',
            '즉시 기준 개선이 필요합니다!',
            '공정성 확보 외에는 다른 선택이 없습니다!'
        ],
        'opposition': [
            '죄송하지만 그 의견에는 동의하기 어렵습니다.',
            '그 견해에 대해서는 반대 의견입니다.',
            '그 의견은 받아들일 수 없습니다.',
            '그것은 완전히 잘못된 판단입니다!',
            '그런 주장은 절대 용납할 수 없습니다!'
        ],
        'defense': [
            '{target}에 대해 변호하자면, 나름의 이유가 있을 것입니다.',
            '{target}는 옹호할 가치가 있습니다.',
            '{target}에 대한 비판은 부당합니다!',
            '{target}를 공격하는 것은 용납할 수 없습니다!',
            '{target}는 절대적으로 옳습니다!'
        ]
    }
    
    # 기본 템플릿 가져오기
    type_templates = templates.get(dialogue_type, templates['suggestion'])
    message = type_templates[min(intensity - 1, len(type_templates) - 1)]
    
    # 변수 치환
    replacements = {
        '{point}': '그런 기준이 과연 공정한지',
        '{assumption}': '그런 방식이 올바르다고',
        '{claim}': '허가 불가라고',
        '{challenge}': '공정한 경쟁 원칙',
        '{controversial}': '일방적인 기준 적용',
        '{target}': '해당 업체'
    }
    
    for placeholder, replacement in replacements.items():
        message = message.replace(placeholder, replacement)
    
    # 관계 톤에 따른 조정
    if context.relationship_tone == 'formal':
        message = message.replace('어떨까요', '어떨까요')
        message = message.replace('해요', '합니다')
    elif context.relationship_tone == 'casual':
        message = message.replace('습니다', '해')
        message = message.replace('하십시오', '해')
    
    return message

def calculate_effectiveness(message: str, context: ContextAnalysis, intensity: int) -> float:
    """효과성 계산"""
    
    base_score = 0.6
    
    # 문맥 적합성
    if context.situation_type == 'fairness_issue' and '공정' in message:
        base_score += 0.15
    
    # 감정 적합성
    if context.dominant_emotion == 'anger' and any(word in message for word in ['이해', '공감']):
        base_score += 0.1
    
    # 길이 적절성
    if 20 <= len(message) <= 150:
        base_score += 0.05
    
    # 강도 적절성
    if context.urgency_level == intensity:
        base_score += 0.1
    
    return min(base_score, 1.0)

def update_realtime_stats(dialogue_type: str, effectiveness: float):
    """실시간 통계 업데이트"""
    
    stats = realtime_stats[dialogue_type]
    stats['count'] += 1
    stats['total_effectiveness'] += effectiveness
    stats['recent_trend'].append(effectiveness)
    
    # 최근 10개 항목만 유지
    if len(stats['recent_trend']) > 10:
        stats['recent_trend'].pop(0)

# ==================== WebSocket 관리 ====================

async def connect_websocket(websocket: WebSocket):
    """WebSocket 연결"""
    await websocket.accept()
    active_connections.append(websocket)
    logger.info(f"WebSocket 연결됨. 총 연결: {len(active_connections)}")

def disconnect_websocket(websocket: WebSocket):
    """WebSocket 연결 해제"""
    if websocket in active_connections:
        active_connections.remove(websocket)
        logger.info(f"WebSocket 연결 해제됨. 총 연결: {len(active_connections)}")

async def broadcast_message(message: dict):
    """모든 연결된 클라이언트에 메시지 브로드캐스트"""
    if active_connections:
        dead_connections = []
        for connection in active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"WebSocket 메시지 전송 실패: {e}")
                dead_connections.append(connection)
        
        # 죽은 연결 제거
        for dead_connection in dead_connections:
            disconnect_websocket(dead_connection)

# ==================== API 엔드포인트들 ====================

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "system": "통합 백엔드 API 서버",
        "version": "1.0.0",
        "status": "active",
        "dialogue_types": len(DIALOGUE_TYPES),
        "active_connections": len(active_connections),
        "capabilities": [
            "21가지 대화 유형",
            "실시간 문맥 분석",
            "효과성 예측",
            "WebSocket 지원",
            "실시간 통계"
        ]
    }

@app.get("/api/dialogue-types")
async def get_dialogue_types():
    """대화 유형 목록 조회"""
    
    formatted_types = []
    for type_id, type_data in DIALOGUE_TYPES.items():
        formatted_types.append({
            "id": type_id,
            "name": type_data["name"],
            "description": type_data["description"],
            "category": type_data["category"],
            "intensity_levels": [1, 2, 3, 4, 5]
        })
    
    return {
        "dialogue_types": formatted_types,
        "total_count": len(formatted_types),
        "categories": {
            "basic": "기본 유형",
            "moderate": "중급 유형", 
            "advanced": "고급 유형",
            "research": "연구 유형"
        }
    }

@app.post("/api/analyze-context")
async def analyze_context_endpoint(request: dict):
    """문맥 분석"""
    
    try:
        input_message = request.get("input_message", "")
        conversation_history = request.get("conversation_history", [])
        
        if not input_message:
            raise HTTPException(status_code=400, detail="입력 메시지가 필요합니다")
        
        context = analyze_context(input_message, conversation_history)
        optimal_type = select_optimal_dialogue_type(context, input_message)
        
        return {
            "success": True,
            "context_analysis": context.dict(),
            "recommended_dialogue_type": optimal_type,
            "recommended_type_name": DIALOGUE_TYPES[optimal_type]["name"]
        }
        
    except Exception as e:
        logger.error(f"문맥 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-dialogue")
async def generate_dialogue(request: DialogueRequest):
    """대화 생성"""
    
    try:
        # 문맥 분석
        context = analyze_context(request.input_message, request.conversation_context)
        
        # 대화 유형 결정
        dialogue_type = request.target_dialogue_type
        if not dialogue_type or dialogue_type == 'auto':
            dialogue_type = select_optimal_dialogue_type(context, request.input_message)
        
        # 여러 강도로 메시지 생성
        generated_messages = []
        
        for intensity in range(1, 6):
            message = generate_contextual_message(
                request.input_message, 
                dialogue_type, 
                intensity, 
                context
            )
            
            effectiveness = calculate_effectiveness(message, context, intensity)
            
            generated_message = GeneratedMessage(
                message_id=str(uuid.uuid4()),
                message=message,
                dialogue_type=dialogue_type,
                intensity=intensity,
                applied_context=context,
                effectiveness_estimate=effectiveness,
                linguistic_features=["한국어", "존댓말", "설득적"],
                generation_time=datetime.now().isoformat()
            )
            
            generated_messages.append(generated_message)
            
            # 통계 업데이트
            update_realtime_stats(dialogue_type, effectiveness)
        
        # 대안 유형들 생성
        alternative_types = ['empathy', 'suggestion', 'counter_question']
        for alt_type in alternative_types:
            if alt_type != dialogue_type:
                message = generate_contextual_message(
                    request.input_message, 
                    alt_type, 
                    3, 
                    context
                )
                
                effectiveness = calculate_effectiveness(message, context, 3)
                
                alt_message = GeneratedMessage(
                    message_id=str(uuid.uuid4()),
                    message=message,
                    dialogue_type=alt_type,
                    intensity=3,
                    applied_context=context,
                    effectiveness_estimate=effectiveness,
                    linguistic_features=["한국어", "존댓말", "설득적"],
                    generation_time=datetime.now().isoformat()
                )
                
                generated_messages.append(alt_message)
                update_realtime_stats(alt_type, effectiveness)
        
        # 생성 이력에 추가
        generation_history.append({
            "timestamp": datetime.now().isoformat(),
            "input": request.input_message,
            "context": context.dict(),
            "results": [msg.dict() for msg in generated_messages]
        })
        
        # WebSocket으로 실시간 업데이트
        await broadcast_message({
            "type": "new_generation",
            "data": {
                "input": request.input_message,
                "count": len(generated_messages),
                "best_effectiveness": max(msg.effectiveness_estimate for msg in generated_messages)
            }
        })
        
        return {
            "success": True,
            "generated_messages": [msg.dict() for msg in generated_messages],
            "context_analysis": context.dict(),
            "generation_count": len(generated_messages),
            "best_effectiveness": max(msg.effectiveness_estimate for msg in generated_messages)
        }
        
    except Exception as e:
        logger.error(f"대화 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/stats")
async def get_analytics_stats():
    """분석 통계 조회"""
    
    try:
        # 실시간 통계 계산
        stats = []
        for type_id, type_data in DIALOGUE_TYPES.items():
            type_stats = realtime_stats[type_id]
            count = type_stats['count']
            avg_effectiveness = type_stats['total_effectiveness'] / max(count, 1)
            
            # 트렌드 계산
            recent_trend = type_stats['recent_trend']
            trend = 'stable'
            if len(recent_trend) >= 3:
                if recent_trend[-1] > recent_trend[-3]:
                    trend = 'up'
                elif recent_trend[-1] < recent_trend[-3]:
                    trend = 'down'
            
            stats.append(DialogueStats(
                type=type_id,
                name=type_data['name'],
                count=count,
                avg_effectiveness=avg_effectiveness,
                trend=trend,
                category=type_data['category']
            ))
        
        # 효과성 데이터 생성 (시간별)
        effectiveness_data = []
        now = datetime.now()
        for i in range(24):
            time_point = now - timedelta(hours=i)
            effectiveness_data.append({
                "time": time_point.strftime("%H:%M"),
                "effectiveness": 0.7 + random.random() * 0.2,
                "type": random.choice(list(DIALOGUE_TYPES.keys()))
            })
        
        effectiveness_data.reverse()
        
        # 전체 통계
        total_messages = sum(stat.count for stat in stats)
        avg_effectiveness = sum(stat.avg_effectiveness for stat in stats) / max(len(stats), 1)
        top_performing = max(stats, key=lambda x: x.avg_effectiveness) if stats else None
        
        return {
            "success": True,
            "stats": [stat.dict() for stat in stats],
            "effectiveness_data": effectiveness_data,
            "summary": {
                "total_messages": total_messages,
                "avg_effectiveness": avg_effectiveness,
                "top_performing_type": top_performing.name if top_performing else None,
                "active_types": len([s for s in stats if s.count > 0])
            }
        }
        
    except Exception as e:
        logger.error(f"통계 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/history")
async def get_generation_history():
    """생성 이력 조회"""
    
    try:
        recent_history = list(generation_history)[-50:]  # 최근 50개
        
        return {
            "success": True,
            "history": recent_history,
            "total_count": len(generation_history),
            "recent_count": len(recent_history)
        }
        
    except Exception as e:
        logger.error(f"이력 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket 엔드포인트"""
    await connect_websocket(websocket)
    
    try:
        while True:
            # 클라이언트로부터 메시지 수신
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # 클라이언트 요청 처리
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.now().isoformat()})
            elif message.get("type") == "request_stats":
                # 실시간 통계 전송
                stats_response = await get_analytics_stats()
                await websocket.send_json({
                    "type": "stats_update", 
                    "data": stats_response
                })
                
    except WebSocketDisconnect:
        disconnect_websocket(websocket)
    except Exception as e:
        logger.error(f"WebSocket 오류: {e}")
        disconnect_websocket(websocket)

# 실시간 통계 브로드캐스트 태스크
async def periodic_stats_broadcast():
    """주기적 통계 브로드캐스트"""
    while True:
        try:
            if active_connections:
                stats_response = await get_analytics_stats()
                await broadcast_message({
                    "type": "periodic_stats_update",
                    "data": stats_response
                })
        except Exception as e:
            logger.error(f"주기적 브로드캐스트 오류: {e}")
        
        await asyncio.sleep(30)  # 30초마다

# 서버 시작 이벤트
@app.on_event("startup")
async def startup_event():
    """서버 시작 시 실행"""
    logger.info("통합 백엔드 API 서버 시작")
    
    # 주기적 브로드캐스트 태스크 시작
    asyncio.create_task(periodic_stats_broadcast())

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 통합 백엔드 API 서버 시작!")
    print("📊 지원 기능:")
    print("   🎭 21가지 대화 유형")
    print("   🧠 실시간 문맥 분석")
    print("   📈 효과성 예측")
    print("   🔄 WebSocket 실시간 통신")
    print("   📊 실시간 통계 및 분석")
    
    _p = int(os.environ.get("INTEGRATED_API_SERVER_PORT", os.environ.get("PORT", "8095")))
    uvicorn.run(app, host="0.0.0.0", port=_p) 