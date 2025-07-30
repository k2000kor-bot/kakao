#!/usr/bin/env python3
"""
AI 메시지 추천 서버 - 카카오톡 AI 분석 시스템
- 대화 맥락 분석
- 메시지 추천
- 감정 기반 응답 생성
- 상황별 템플릿 제공
"""

import json
import random
import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI 메시지 추천 서버 v1.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 데이터 모델
class MessageRecommendationRequest(BaseModel):
    chat_room_id: str
    context: str  # 현재 대화 맥락
    user_role: Optional[str] = None  # 사용자 역할
    situation: Optional[str] = None  # 상황 (회의, 일상, 업무 등)
    tone: Optional[str] = None  # 톤 (공식, 친근, 격식 등)
    length: Optional[str] = "medium"  # 메시지 길이 (short, medium, long)

class MessageRecommendationResponse(BaseModel):
    success: bool
    recommendations: List[Dict[str, Any]]
    context_analysis: Dict[str, Any]
    confidence_score: float

class ContextAnalysis(BaseModel):
    topic: str
    sentiment: str
    urgency: str
    formality: str
    participants_count: int

# 메시지 템플릿 데이터베이스
MESSAGE_TEMPLATES = {
    "greeting": {
        "formal": [
            "안녕하세요! 오늘도 좋은 하루 되세요.",
            "안녕하십니까. 오늘도 수고하시겠습니다.",
            "안녕하세요. 오늘도 건승하시기 바랍니다."
        ],
        "casual": [
            "안녕! 오늘도 좋은 하루 보내!",
            "안녕하세요~ 오늘도 화이팅!",
            "안녕! 오늘도 좋은 하루 되길 바라!"
        ]
    },
    "meeting": {
        "formal": [
            "회의 일정을 확인해주시기 바랍니다.",
            "회의 준비사항을 미리 점검해주세요.",
            "회의 자료를 사전에 검토해주시기 바랍니다."
        ],
        "casual": [
            "회의 일정 확인해줘!",
            "회의 준비사항 미리 체크해줘~",
            "회의 자료 미리 봐줘!"
        ]
    },
    "work": {
        "formal": [
            "업무 진행상황을 보고드리겠습니다.",
            "업무 일정을 조율해주시기 바랍니다.",
            "업무 관련 검토가 필요합니다."
        ],
        "casual": [
            "업무 진행상황 알려줄게!",
            "업무 일정 조율해줘~",
            "업무 관련 검토 필요해!"
        ]
    },
    "social": {
        "formal": [
            "모임 일정을 확인해주시기 바랍니다.",
            "모임 준비사항을 점검해주세요.",
            "모임 관련 안내사항을 전달드립니다."
        ],
        "casual": [
            "모임 일정 확인해줘!",
            "모임 준비사항 체크해줘~",
            "모임 관련 안내사항 알려줄게!"
        ]
    },
    "emergency": {
        "formal": [
            "긴급한 상황이 발생했습니다. 즉시 대응이 필요합니다.",
            "긴급 회의가 필요합니다. 빠른 참석 부탁드립니다.",
            "긴급 상황을 알려드립니다. 확인 부탁드립니다."
        ],
        "casual": [
            "긴급한 상황이야! 즉시 대응 필요해!",
            "긴급 회의 필요해! 빠른 참석 부탁해!",
            "긴급 상황이야! 확인해줘!"
        ]
    }
}

# 감정 분석 키워드
SENTIMENT_KEYWORDS = {
    "positive": ["좋다", "감사", "행복", "기쁘", "만족", "성공", "완료", "해결", "진행", "확인"],
    "negative": ["문제", "어려움", "실패", "불만", "걱정", "우려", "지연", "오류", "취소", "반대"],
    "neutral": ["확인", "알림", "안내", "점검", "검토", "진행", "완료", "대기", "예정", "계획"]
}

# 긴급도 키워드
URGENCY_KEYWORDS = {
    "high": ["긴급", "즉시", "바로", "당장", "시급", "중요", "필수", "필요", "요청", "부탁"],
    "medium": ["확인", "점검", "검토", "진행", "완료", "예정", "계획", "안내", "알림", "통보"],
    "low": ["참고", "검토", "확인", "점검", "진행", "완료", "예정", "계획", "안내", "알림"]
}

# 데이터베이스 연결
def get_db_connection():
    return sqlite3.connect('chat_system.db')

# 맥락 분석 함수
def analyze_context(context: str) -> ContextAnalysis:
    """대화 맥락 분석"""
    context_lower = context.lower()
    
    # 감정 분석
    sentiment_score = {"positive": 0, "negative": 0, "neutral": 0}
    for sentiment, keywords in SENTIMENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in context_lower:
                sentiment_score[sentiment] += 1
    
    dominant_sentiment = max(sentiment_score, key=sentiment_score.get)
    
    # 긴급도 분석
    urgency_score = {"high": 0, "medium": 0, "low": 0}
    for urgency, keywords in URGENCY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in context_lower:
                urgency_score[urgency] += 1
    
    dominant_urgency = max(urgency_score, key=urgency_score.get)
    
    # 주제 분석
    topics = {
        "meeting": ["회의", "미팅", "모임", "정기회의", "특별회의"],
        "work": ["업무", "작업", "프로젝트", "업무진행", "업무보고"],
        "social": ["모임", "친목", "회식", "모임", "친목회"],
        "emergency": ["긴급", "즉시", "바로", "당장", "시급"]
    }
    
    detected_topic = "general"
    for topic, keywords in topics.items():
        for keyword in keywords:
            if keyword in context_lower:
                detected_topic = topic
                break
        if detected_topic != "general":
            break
    
    # 격식도 분석
    formal_indicators = ["입니다", "습니다", "하시", "드리", "부탁드립니다", "감사합니다"]
    casual_indicators = ["야", "어", "해", "줘", "고마워", "안녕"]
    
    formality_score = 0
    for indicator in formal_indicators:
        if indicator in context_lower:
            formality_score += 1
    for indicator in casual_indicators:
        if indicator in context_lower:
            formality_score -= 1
    
    formality = "formal" if formality_score > 0 else "casual"
    
    return ContextAnalysis(
        topic=detected_topic,
        sentiment=dominant_sentiment,
        urgency=dominant_urgency,
        formality=formality,
        participants_count=len(set(context.split()))  # 간단한 참여자 수 추정
    )

# 메시지 추천 생성
def generate_recommendations(context_analysis: ContextAnalysis, length: str = "medium") -> List[Dict[str, Any]]:
    """맥락 분석을 기반으로 메시지 추천 생성"""
    recommendations = []
    
    # 기본 템플릿 기반 추천
    topic = context_analysis.topic
    formality = context_analysis.formality
    
    if topic in MESSAGE_TEMPLATES:
        templates = MESSAGE_TEMPLATES[topic]
        if formality in templates:
            base_templates = templates[formality]
            
            # 길이에 따른 필터링
            if length == "short":
                filtered_templates = [t for t in base_templates if len(t) < 30]
            elif length == "long":
                filtered_templates = [t for t in base_templates if len(t) > 50]
            else:  # medium
                filtered_templates = [t for t in base_templates if 30 <= len(t) <= 50]
            
            if not filtered_templates:
                filtered_templates = base_templates
            
            for template in filtered_templates[:3]:  # 최대 3개 추천
                recommendations.append({
                    "text": template,
                    "type": "template",
                    "confidence": 0.8,
                    "reason": f"{topic} 관련 {formality} 톤 템플릿"
                })
    
    # 맥락 기반 맞춤 추천
    custom_recommendations = generate_custom_recommendations(context_analysis, length)
    recommendations.extend(custom_recommendations)
    
    # 감정 기반 추천
    sentiment_recommendations = generate_sentiment_recommendations(context_analysis, length)
    recommendations.extend(sentiment_recommendations)
    
    # 중복 제거 및 정렬
    unique_recommendations = []
    seen_texts = set()
    
    for rec in recommendations:
        if rec["text"] not in seen_texts:
            unique_recommendations.append(rec)
            seen_texts.add(rec["text"])
    
    # 신뢰도 순으로 정렬
    unique_recommendations.sort(key=lambda x: x["confidence"], reverse=True)
    
    return unique_recommendations[:5]  # 최대 5개 반환

def generate_custom_recommendations(context_analysis: ContextAnalysis, length: str) -> List[Dict[str, Any]]:
    """맥락 기반 맞춤 추천 생성"""
    recommendations = []
    
    if context_analysis.topic == "meeting":
        if context_analysis.urgency == "high":
            recommendations.append({
                "text": "긴급 회의가 필요합니다. 즉시 참석 부탁드립니다." if context_analysis.formality == "formal" else "긴급 회의 필요해! 즉시 참석 부탁해!",
                "type": "custom",
                "confidence": 0.9,
                "reason": "긴급 회의 상황"
            })
        else:
            recommendations.append({
                "text": "회의 일정을 확인해주시기 바랍니다." if context_analysis.formality == "formal" else "회의 일정 확인해줘!",
                "type": "custom",
                "confidence": 0.8,
                "reason": "일반 회의 상황"
            })
    
    elif context_analysis.topic == "work":
        if context_analysis.sentiment == "positive":
            recommendations.append({
                "text": "업무가 잘 진행되고 있습니다. 계속해서 좋은 결과 기대하겠습니다." if context_analysis.formality == "formal" else "업무가 잘 진행되고 있어! 계속해서 좋은 결과 기대할게!",
                "type": "custom",
                "confidence": 0.85,
                "reason": "긍정적인 업무 상황"
            })
        else:
            recommendations.append({
                "text": "업무 진행상황을 점검해주시기 바랍니다." if context_analysis.formality == "formal" else "업무 진행상황 점검해줘!",
                "type": "custom",
                "confidence": 0.8,
                "reason": "업무 점검 필요"
            })
    
    return recommendations

def generate_sentiment_recommendations(context_analysis: ContextAnalysis, length: str) -> List[Dict[str, Any]]:
    """감정 기반 추천 생성"""
    recommendations = []
    
    if context_analysis.sentiment == "positive":
        recommendations.append({
            "text": "좋은 소식이네요! 계속해서 좋은 결과 기대하겠습니다." if context_analysis.formality == "formal" else "좋은 소식이야! 계속해서 좋은 결과 기대할게!",
            "type": "sentiment",
            "confidence": 0.85,
            "reason": "긍정적 감정 반영"
        })
    elif context_analysis.sentiment == "negative":
        recommendations.append({
            "text": "걱정되는 상황이네요. 함께 해결방안을 찾아보겠습니다." if context_analysis.formality == "formal" else "걱정되는 상황이야. 함께 해결방안을 찾아보자!",
            "type": "sentiment",
            "confidence": 0.8,
            "reason": "부정적 감정 대응"
        })
    
    return recommendations

# API 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "AI 메시지 추천 서버",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "맥락 기반 메시지 추천",
            "감정 분석 기반 응답",
            "상황별 템플릿 제공",
            "톤 및 길이 조절"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/recommend", response_model=MessageRecommendationResponse)
async def recommend_message(request: MessageRecommendationRequest):
    """메시지 추천"""
    try:
        logger.info(f"메시지 추천 요청: {request.context[:50]}...")
        
        # 맥락 분석
        context_analysis = analyze_context(request.context)
        
        # 메시지 추천 생성
        recommendations = generate_recommendations(context_analysis, request.length)
        
        # 신뢰도 계산
        confidence_score = sum(rec["confidence"] for rec in recommendations) / len(recommendations) if recommendations else 0.0
        
        logger.info(f"추천 생성 완료: {len(recommendations)}개 추천")
        
        return MessageRecommendationResponse(
            success=True,
            recommendations=recommendations,
            context_analysis={
                "topic": context_analysis.topic,
                "sentiment": context_analysis.sentiment,
                "urgency": context_analysis.urgency,
                "formality": context_analysis.formality,
                "participants_count": context_analysis.participants_count
            },
            confidence_score=confidence_score
        )
        
    except Exception as e:
        logger.error(f"메시지 추천 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"메시지 추천 중 오류 발생: {str(e)}")

@app.get("/api/templates")
async def get_message_templates():
    """사용 가능한 메시지 템플릿 목록"""
    return {
        "templates": {
            "categories": list(MESSAGE_TEMPLATES.keys()),
            "tones": ["formal", "casual"],
            "lengths": ["short", "medium", "long"],
            "topics": ["greeting", "meeting", "work", "social", "emergency"]
        }
    }

@app.get("/api/analysis/context")
async def analyze_context_endpoint(context: str):
    """맥락 분석 엔드포인트"""
    try:
        analysis = analyze_context(context)
        return {
            "success": True,
            "analysis": {
                "topic": analysis.topic,
                "sentiment": analysis.sentiment,
                "urgency": analysis.urgency,
                "formality": analysis.formality,
                "participants_count": analysis.participants_count
            }
        }
    except Exception as e:
        logger.error(f"맥락 분석 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"맥락 분석 중 오류 발생: {str(e)}")

@app.get("/api/chat-rooms")
async def get_recommendable_chat_rooms():
    """추천 가능한 채팅방 목록"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT DISTINCT chat_room_id, 
                   COUNT(*) as message_count,
                   MIN(timestamp) as first_message,
                   MAX(timestamp) as last_message
            FROM messages 
            GROUP BY chat_room_id
            ORDER BY message_count DESC
        ''')
        
        rooms = []
        for row in cursor.fetchall():
            room_id, count, first, last = row
            rooms.append({
                'id': room_id,
                'message_count': count,
                'first_message': first,
                'last_message': last
            })
        
        conn.close()
        return {"success": True, "chat_rooms": rooms}
        
    except Exception as e:
        logger.error(f"채팅방 목록 조회 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"채팅방 목록 조회 중 오류 발생: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 AI 메시지 추천 서버 시작")
    print("=" * 50)
    print("📍 서버 주소: http://localhost:8007")
    print("📖 API 문서: http://localhost:8007/docs")
    print("🎯 주요 기능:")
    print("   - 맥락 기반 메시지 추천")
    print("   - 감정 분석 기반 응답")
    print("   - 상황별 템플릿 제공")
    print("   - 톤 및 길이 조절")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8007) 