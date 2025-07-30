#!/usr/bin/env python3
"""
AI 대화 패턴 분석 및 예측 서버 - 카카오톡 AI 분석 시스템
- 대화 패턴 분석
- 참여자 행동 패턴 분석
- 대화 흐름 예측
- 패턴 기반 메시지 생성
- 대화 품질 예측
"""

import sqlite3
import json
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI 대화 패턴 분석 및 예측 서버 v1.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 데이터 모델
class PatternAnalysisRequest(BaseModel):
    chat_room_id: str
    analysis_type: str  # 'conversation', 'participant', 'flow', 'prediction', 'quality'
    analysis_period: Optional[str] = "7d"  # 1d, 7d, 30d, all
    prediction_horizon: Optional[int] = 24  # 시간 단위
    target_participants: Optional[List[str]] = None

class PatternAnalysisResponse(BaseModel):
    success: bool
    analysis_type: str
    patterns: Dict[str, Any]
    predictions: Dict[str, Any]
    insights: List[Dict[str, Any]]
    confidence_score: float
    metadata: Dict[str, Any]

# 데이터베이스 연결
def get_db_connection():
    return sqlite3.connect('chat_system.db')

# 대화 패턴 분석
def analyze_conversation_patterns(chat_room_id: str, period: str = "7d") -> Dict[str, Any]:
    """대화 패턴 분석"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 기간 설정
    if period == "1d":
        time_filter = "AND timestamp >= datetime('now', '-1 day')"
    elif period == "7d":
        time_filter = "AND timestamp >= datetime('now', '-7 days')"
    elif period == "30d":
        time_filter = "AND timestamp >= datetime('now', '-30 days')"
    else:
        time_filter = ""
    
    # 메시지 패턴 분석
    cursor.execute(f'''
        SELECT sender, content, timestamp,
               LENGTH(content) as message_length,
               strftime('%H', timestamp) as hour,
               strftime('%w', timestamp) as weekday
        FROM messages 
        WHERE chat_room_id = ?
        AND content IS NOT NULL
        {time_filter}
        ORDER BY timestamp
    ''', (chat_room_id,))
    
    messages = cursor.fetchall()
    
    if not messages:
        return {"error": "분석할 메시지가 없습니다."}
    
    # 시간대별 패턴 분석
    hourly_patterns = {}
    for msg in messages:
        hour = msg[4]
        if hour not in hourly_patterns:
            hourly_patterns[hour] = {"count": 0, "avg_length": 0, "participants": set()}
        hourly_patterns[hour]["count"] += 1
        hourly_patterns[hour]["avg_length"] += msg[3]
        hourly_patterns[hour]["participants"].add(msg[0])
    
    # 평균 길이 계산
    for hour in hourly_patterns:
        count = hourly_patterns[hour]["count"]
        hourly_patterns[hour]["avg_length"] = hourly_patterns[hour]["avg_length"] / count
        hourly_patterns[hour]["participants"] = len(hourly_patterns[hour]["participants"])
    
    # 요일별 패턴 분석
    weekday_patterns = {}
    for msg in messages:
        weekday = msg[5]
        if weekday not in weekday_patterns:
            weekday_patterns[weekday] = {"count": 0, "avg_length": 0, "participants": set()}
        weekday_patterns[weekday]["count"] += 1
        weekday_patterns[weekday]["avg_length"] += msg[3]
        weekday_patterns[weekday]["participants"].add(msg[0])
    
    # 평균 길이 계산
    for weekday in weekday_patterns:
        count = weekday_patterns[weekday]["count"]
        weekday_patterns[weekday]["avg_length"] = weekday_patterns[weekday]["avg_length"] / count
        weekday_patterns[weekday]["participants"] = len(weekday_patterns[weekday]["participants"])
    
    # 대화 주제 패턴 분석
    topic_patterns = analyze_topic_patterns(messages)
    
    # 감정 패턴 분석
    emotion_patterns = analyze_emotion_patterns(messages)
    
    # 응답 패턴 분석
    response_patterns = analyze_response_patterns(messages)
    
    conn.close()
    
    return {
        "hourly_patterns": hourly_patterns,
        "weekday_patterns": weekday_patterns,
        "topic_patterns": topic_patterns,
        "emotion_patterns": emotion_patterns,
        "response_patterns": response_patterns,
        "total_messages": len(messages),
        "analysis_period": period
    }

# 참여자 행동 패턴 분석
def analyze_participant_patterns(chat_room_id: str, period: str = "7d") -> Dict[str, Any]:
    """참여자 행동 패턴 분석"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 기간 설정
    if period == "1d":
        time_filter = "AND timestamp >= datetime('now', '-1 day')"
    elif period == "7d":
        time_filter = "AND timestamp >= datetime('now', '-7 days')"
    elif period == "30d":
        time_filter = "AND timestamp >= datetime('now', '-30 days')"
    else:
        time_filter = ""
    
    # 참여자별 메시지 분석
    cursor.execute(f'''
        SELECT sender, 
               COUNT(*) as message_count,
               AVG(LENGTH(content)) as avg_length,
               MIN(timestamp) as first_message,
               MAX(timestamp) as last_message,
               COUNT(DISTINCT strftime('%Y-%m-%d', timestamp)) as active_days
        FROM messages 
        WHERE chat_room_id = ?
        AND content IS NOT NULL
        {time_filter}
        GROUP BY sender
        ORDER BY message_count DESC
    ''', (chat_room_id,))
    
    participants = cursor.fetchall()
    
    # 참여자별 상세 패턴 분석
    participant_patterns = {}
    for participant in participants:
        sender = participant[0]
        
        # 시간대별 참여 패턴
        cursor.execute(f'''
            SELECT strftime('%H', timestamp) as hour, COUNT(*) as count
            FROM messages 
            WHERE chat_room_id = ? AND sender = ?
            {time_filter}
            GROUP BY hour
            ORDER BY count DESC
        ''', (chat_room_id, sender))
        
        hourly_activity = dict(cursor.fetchall())
        
        # 요일별 참여 패턴
        cursor.execute(f'''
            SELECT strftime('%w', timestamp) as weekday, COUNT(*) as count
            FROM messages 
            WHERE chat_room_id = ? AND sender = ?
            {time_filter}
            GROUP BY weekday
            ORDER BY count DESC
        ''', (chat_room_id, sender))
        
        weekday_activity = dict(cursor.fetchall())
        
        # 메시지 길이 분포
        cursor.execute(f'''
            SELECT 
                CASE 
                    WHEN LENGTH(content) < 20 THEN 'short'
                    WHEN LENGTH(content) < 100 THEN 'medium'
                    ELSE 'long'
                END as length_category,
                COUNT(*) as count
            FROM messages 
            WHERE chat_room_id = ? AND sender = ?
            {time_filter}
            GROUP BY length_category
        ''', (chat_room_id, sender))
        
        length_distribution = dict(cursor.fetchall())
        
        participant_patterns[sender] = {
            "message_count": participant[1],
            "avg_length": round(participant[2] or 0, 1),
            "first_message": participant[3],
            "last_message": participant[4],
            "active_days": participant[5],
            "hourly_activity": hourly_activity,
            "weekday_activity": weekday_activity,
            "length_distribution": length_distribution,
            "activity_level": get_activity_level(participant[1], participant[5])
        }
    
    # 참여자 간 상호작용 패턴
    interaction_patterns = analyze_interaction_patterns(chat_room_id, period)
    
    conn.close()
    
    return {
        "participant_patterns": participant_patterns,
        "interaction_patterns": interaction_patterns,
        "total_participants": len(participants),
        "analysis_period": period
    }

# 대화 흐름 예측
def predict_conversation_flow(chat_room_id: str, horizon: int = 24) -> Dict[str, Any]:
    """대화 흐름 예측"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 최근 대화 데이터 분석
    cursor.execute('''
        SELECT sender, content, timestamp,
               LENGTH(content) as message_length
        FROM messages 
        WHERE chat_room_id = ?
        AND content IS NOT NULL
        ORDER BY timestamp DESC
        LIMIT 100
    ''', (chat_room_id,))
    
    recent_messages = cursor.fetchall()
    
    if not recent_messages:
        return {"error": "예측할 데이터가 부족합니다."}
    
    # 시간대별 활동 패턴 분석
    hourly_activity = {}
    for msg in recent_messages:
        hour = datetime.fromisoformat(msg[2].replace('Z', '+00:00')).hour
        if hour not in hourly_activity:
            hourly_activity[hour] = 0
        hourly_activity[hour] += 1
    
    # 다음 24시간 예측
    predictions = {}
    current_hour = datetime.now().hour
    
    for i in range(horizon):
        predicted_hour = (current_hour + i) % 24
        base_activity = hourly_activity.get(str(predicted_hour), 0)
        
        # 시간대별 가중치 적용
        if 9 <= predicted_hour <= 18:  # 업무 시간
            weight = 1.5
        elif 19 <= predicted_hour <= 22:  # 저녁 시간
            weight = 1.2
        else:  # 새벽/이른 아침
            weight = 0.3
        
        predicted_activity = max(0, int(base_activity * weight))
        predictions[f"hour_{predicted_hour}"] = {
            "predicted_messages": predicted_activity,
            "confidence": min(0.9, 0.3 + (base_activity * 0.1)),
            "time_period": get_time_period(predicted_hour)
        }
    
    # 참여자별 예측
    participant_predictions = predict_participant_activity(chat_room_id, horizon)
    
    # 주제 예측
    topic_predictions = predict_topic_evolution(chat_room_id)
    
    conn.close()
    
    return {
        "hourly_predictions": predictions,
        "participant_predictions": participant_predictions,
        "topic_predictions": topic_predictions,
        "prediction_horizon": horizon,
        "confidence_overall": calculate_overall_confidence(predictions)
    }

# 패턴 기반 메시지 생성
def generate_pattern_based_messages(chat_room_id: str, count: int = 5) -> Dict[str, Any]:
    """패턴 기반 메시지 생성"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 참여자별 메시지 패턴 분석
    cursor.execute('''
        SELECT sender, content, LENGTH(content) as length
        FROM messages 
        WHERE chat_room_id = ?
        AND content IS NOT NULL
        ORDER BY timestamp DESC
        LIMIT 500
    ''', (chat_room_id,))
    
    messages = cursor.fetchall()
    
    if not messages:
        return {"error": "메시지 생성에 필요한 데이터가 부족합니다."}
    
    # 참여자별 패턴 분석
    participant_patterns = {}
    for msg in messages:
        sender = msg[0]
        if sender not in participant_patterns:
            participant_patterns[sender] = {
                "messages": [],
                "avg_length": 0,
                "common_words": {},
                "message_types": {"question": 0, "statement": 0, "reaction": 0}
            }
        
        content = msg[1]
        participant_patterns[sender]["messages"].append(content)
        
        # 메시지 타입 분류
        if '?' in content:
            participant_patterns[sender]["message_types"]["question"] += 1
        elif len(content) < 20:
            participant_patterns[sender]["message_types"]["reaction"] += 1
        else:
            participant_patterns[sender]["message_types"]["statement"] += 1
    
    # 평균 길이 계산
    for sender in participant_patterns:
        messages = participant_patterns[sender]["messages"]
        total_length = sum(len(msg) for msg in messages)
        participant_patterns[sender]["avg_length"] = total_length / len(messages)
    
    # 패턴 기반 메시지 생성
    generated_messages = []
    for i in range(count):
        # 가장 활발한 참여자 선택
        most_active = max(participant_patterns.keys(), 
                         key=lambda x: len(participant_patterns[x]["messages"]))
        
        pattern = participant_patterns[most_active]
        
        # 메시지 타입 결정
        message_type = max(pattern["message_types"].items(), key=lambda x: x[1])[0]
        
        # 패턴 기반 메시지 생성
        if message_type == "question":
            generated_msg = generate_question_message(pattern)
        elif message_type == "reaction":
            generated_msg = generate_reaction_message(pattern)
        else:
            generated_msg = generate_statement_message(pattern)
        
        generated_messages.append({
            "sender": most_active,
            "content": generated_msg,
            "type": message_type,
            "confidence": 0.7 + (i * 0.05)
        })
    
    conn.close()
    
    return {
        "generated_messages": generated_messages,
        "patterns_used": participant_patterns,
        "generation_count": count
    }

# 대화 품질 예측
def predict_conversation_quality(chat_room_id: str, future_hours: int = 24) -> Dict[str, Any]:
    """대화 품질 예측"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 현재 품질 지표 계산
    cursor.execute('''
        SELECT 
            COUNT(*) as total_messages,
            COUNT(DISTINCT sender) as unique_participants,
            AVG(LENGTH(content)) as avg_length,
            COUNT(CASE WHEN LENGTH(content) > 100 THEN 1 END) as long_messages,
            COUNT(CASE WHEN LENGTH(content) < 10 THEN 1 END) as short_messages
        FROM messages 
        WHERE chat_room_id = ?
        AND content IS NOT NULL
        AND timestamp >= datetime('now', '-7 days')
    ''', (chat_room_id,))
    
    current_metrics = cursor.fetchone()
    
    if not current_metrics or current_metrics[0] == 0:
        return {"error": "품질 예측에 필요한 데이터가 부족합니다."}
    
    total_messages, unique_participants, avg_length, long_messages, short_messages = current_metrics
    
    # 현재 품질 점수 계산
    current_quality = calculate_quality_score(
        total_messages, unique_participants, avg_length, long_messages, short_messages
    )
    
    # 미래 품질 예측
    future_predictions = []
    for hour in range(future_hours):
        # 시간대별 품질 변화 예측
        time_factor = get_time_quality_factor(hour)
        activity_factor = get_activity_quality_factor(hour)
        
        predicted_quality = current_quality * time_factor * activity_factor
        predicted_quality = max(0, min(100, predicted_quality))
        
        future_predictions.append({
            "hour": hour,
            "predicted_quality": round(predicted_quality, 1),
            "confidence": 0.6 + (hour * 0.01),
            "factors": {
                "time_factor": time_factor,
                "activity_factor": activity_factor
            }
        })
    
    # 품질 개선 제안
    improvement_suggestions = generate_quality_improvements(current_metrics)
    
    conn.close()
    
    return {
        "current_quality": round(current_quality, 1),
        "future_predictions": future_predictions,
        "improvement_suggestions": improvement_suggestions,
        "prediction_horizon": future_hours
    }

# 헬퍼 함수들
def analyze_topic_patterns(messages: List[Tuple]) -> Dict[str, Any]:
    """주제 패턴 분석"""
    topic_keywords = {
        "업무": ["회의", "프로젝트", "업무", "작업", "진행"],
        "일상": ["식사", "커피", "점심", "저녁", "주말"],
        "감정": ["좋다", "싫다", "기쁘다", "슬프다", "화나다"],
        "정보": ["알림", "공지", "정보", "뉴스", "소식"]
    }
    
    topic_counts = {topic: 0 for topic in topic_keywords}
    
    for msg in messages:
        content = msg[1].lower()
        for topic, keywords in topic_keywords.items():
            if any(keyword in content for keyword in keywords):
                topic_counts[topic] += 1
    
    return topic_counts

def analyze_emotion_patterns(messages: List[Tuple]) -> Dict[str, Any]:
    """감정 패턴 분석"""
    positive_words = ["좋다", "감사", "행복", "기쁘", "만족", "성공", "완료", "해결"]
    negative_words = ["문제", "어려움", "실패", "불만", "걱정", "우려", "지연", "오류"]
    neutral_words = ["확인", "알겠", "네", "예", "아니오", "모르겠"]
    
    emotion_counts = {"positive": 0, "negative": 0, "neutral": 0}
    
    for msg in messages:
        content = msg[1].lower()
        if any(word in content for word in positive_words):
            emotion_counts["positive"] += 1
        elif any(word in content for word in negative_words):
            emotion_counts["negative"] += 1
        elif any(word in content for word in neutral_words):
            emotion_counts["neutral"] += 1
    
    return emotion_counts

def analyze_response_patterns(messages: List[Tuple]) -> Dict[str, Any]:
    """응답 패턴 분석"""
    response_times = []
    conversation_chains = []
    
    for i in range(1, len(messages)):
        prev_time = datetime.fromisoformat(messages[i-1][2].replace('Z', '+00:00'))
        curr_time = datetime.fromisoformat(messages[i][2].replace('Z', '+00:00'))
        
        time_diff = (curr_time - prev_time).total_seconds() / 60  # 분 단위
        response_times.append(time_diff)
    
    if response_times:
        avg_response_time = sum(response_times) / len(response_times)
        quick_responses = len([t for t in response_times if t < 5])
        slow_responses = len([t for t in response_times if t > 30])
    else:
        avg_response_time = 0
        quick_responses = 0
        slow_responses = 0
    
    return {
        "avg_response_time": round(avg_response_time, 1),
        "quick_responses": quick_responses,
        "slow_responses": slow_responses,
        "response_efficiency": quick_responses / len(response_times) if response_times else 0
    }

def analyze_interaction_patterns(chat_room_id: str, period: str) -> Dict[str, Any]:
    """참여자 간 상호작용 패턴 분석"""
    # 간단한 구현 - 실제로는 더 복잡한 상호작용 분석 필요
    return {
        "interaction_network": {},
        "key_influencers": [],
        "interaction_clusters": []
    }

def get_activity_level(message_count: int, active_days: int) -> str:
    """활동 수준 판단"""
    if message_count > 100 and active_days > 5:
        return "high"
    elif message_count > 50 and active_days > 3:
        return "medium"
    else:
        return "low"

def predict_participant_activity(chat_room_id: str, horizon: int) -> Dict[str, Any]:
    """참여자 활동 예측"""
    # 간단한 예측 로직
    return {
        "predicted_participants": [],
        "activity_trends": {}
    }

def predict_topic_evolution(chat_room_id: str) -> Dict[str, Any]:
    """주제 진화 예측"""
    # 간단한 예측 로직
    return {
        "emerging_topics": [],
        "declining_topics": [],
        "stable_topics": []
    }

def calculate_overall_confidence(predictions: Dict[str, Any]) -> float:
    """전체 예측 신뢰도 계산"""
    confidences = [pred["confidence"] for pred in predictions.values()]
    return sum(confidences) / len(confidences) if confidences else 0.5

def get_time_period(hour: int) -> str:
    """시간대 분류"""
    if 6 <= hour < 12:
        return "아침"
    elif 12 <= hour < 18:
        return "오후"
    elif 18 <= hour < 22:
        return "저녁"
    else:
        return "밤"

def get_time_quality_factor(hour: int) -> float:
    """시간대별 품질 계수"""
    if 9 <= hour <= 18:
        return 1.0
    elif 19 <= hour <= 22:
        return 0.9
    else:
        return 0.7

def get_activity_quality_factor(hour: int) -> float:
    """활동성 품질 계수"""
    if 10 <= hour <= 11 or 14 <= hour <= 16:
        return 1.1
    elif 12 <= hour <= 13:
        return 0.9
    else:
        return 1.0

def calculate_quality_score(total_messages: int, unique_participants: int, 
                          avg_length: float, long_messages: int, short_messages: int) -> float:
    """품질 점수 계산"""
    score = 0
    
    # 메시지 수 기반 점수
    if total_messages >= 100:
        score += 25
    elif total_messages >= 50:
        score += 20
    elif total_messages >= 20:
        score += 15
    
    # 참여자 수 기반 점수
    if unique_participants >= 5:
        score += 25
    elif unique_participants >= 3:
        score += 20
    elif unique_participants >= 2:
        score += 15
    
    # 메시지 길이 기반 점수
    if 20 <= avg_length <= 200:
        score += 25
    elif avg_length > 200:
        score += 20
    elif avg_length > 10:
        score += 15
    
    # 메시지 분포 기반 점수
    total = long_messages + short_messages
    if total > 0:
        balance_ratio = min(long_messages, short_messages) / total
        score += balance_ratio * 25
    
    return min(100, score)

def generate_quality_improvements(metrics: Tuple) -> List[Dict[str, Any]]:
    """품질 개선 제안 생성"""
    suggestions = []
    total_messages, unique_participants, avg_length, long_messages, short_messages = metrics
    
    if total_messages < 50:
        suggestions.append({
            "type": "activity",
            "priority": "high",
            "title": "대화 활동 증가 필요",
            "description": "더 많은 메시지를 주고받아 대화를 활성화하세요."
        })
    
    if unique_participants < 3:
        suggestions.append({
            "type": "participation",
            "priority": "medium",
            "title": "참여자 참여 유도",
            "description": "더 많은 참여자가 대화에 참여하도록 유도하세요."
        })
    
    if avg_length < 20:
        suggestions.append({
            "type": "content",
            "priority": "medium",
            "title": "메시지 내용 개선",
            "description": "더 자세하고 의미 있는 메시지를 작성하세요."
        })
    
    return suggestions

def generate_question_message(pattern: Dict[str, Any]) -> str:
    """질문 메시지 생성"""
    questions = [
        "어떻게 생각하시나요?",
        "이 부분에 대해 어떻게 생각하세요?",
        "혹시 다른 의견이 있으신가요?",
        "이 방법이 어떠신가요?",
        "더 좋은 아이디어가 있으신가요?"
    ]
    return questions[len(pattern["messages"]) % len(questions)]

def generate_reaction_message(pattern: Dict[str, Any]) -> str:
    """반응 메시지 생성"""
    reactions = [
        "좋아요!",
        "네, 맞습니다.",
        "알겠습니다.",
        "감사합니다!",
        "좋은 생각이네요!"
    ]
    return reactions[len(pattern["messages"]) % len(reactions)]

def generate_statement_message(pattern: Dict[str, Any]) -> str:
    """진술 메시지 생성"""
    statements = [
        "이 부분에 대해 설명드리겠습니다.",
        "제 생각에는 이렇게 하는 것이 좋을 것 같습니다.",
        "이런 방식으로 진행하면 될 것 같습니다.",
        "이 내용을 참고해보시기 바랍니다.",
        "이 방법을 시도해보시는 것을 추천합니다."
    ]
    return statements[len(pattern["messages"]) % len(statements)]

# API 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "AI 대화 패턴 분석 및 예측 서버",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "대화 패턴 분석",
            "참여자 행동 패턴 분석",
            "대화 흐름 예측",
            "패턴 기반 메시지 생성",
            "대화 품질 예측"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/analyze-patterns", response_model=PatternAnalysisResponse)
async def analyze_patterns(request: PatternAnalysisRequest):
    """패턴 분석"""
    try:
        logger.info(f"패턴 분석 요청: {request.analysis_type} for {request.chat_room_id}")
        
        if request.analysis_type == "conversation":
            patterns = analyze_conversation_patterns(request.chat_room_id, request.analysis_period)
            predictions = predict_conversation_flow(request.chat_room_id, request.prediction_horizon)
            insights = generate_conversation_insights(patterns)
            confidence_score = 0.8
            
        elif request.analysis_type == "participant":
            patterns = analyze_participant_patterns(request.chat_room_id, request.analysis_period)
            predictions = predict_participant_activity(request.chat_room_id, request.prediction_horizon)
            insights = generate_participant_insights(patterns)
            confidence_score = 0.75
            
        elif request.analysis_type == "flow":
            patterns = analyze_conversation_patterns(request.chat_room_id, request.analysis_period)
            predictions = predict_conversation_flow(request.chat_room_id, request.prediction_horizon)
            insights = generate_flow_insights(patterns, predictions)
            confidence_score = 0.7
            
        elif request.analysis_type == "prediction":
            patterns = analyze_conversation_patterns(request.chat_room_id, request.analysis_period)
            predictions = predict_conversation_flow(request.chat_room_id, request.prediction_horizon)
            insights = generate_prediction_insights(predictions)
            confidence_score = 0.65
            
        elif request.analysis_type == "quality":
            patterns = analyze_conversation_patterns(request.chat_room_id, request.analysis_period)
            predictions = predict_conversation_quality(request.chat_room_id, request.prediction_horizon)
            insights = generate_quality_insights(patterns, predictions)
            confidence_score = 0.8
            
        else:
            raise HTTPException(status_code=400, detail=f"지원하지 않는 분석 타입: {request.analysis_type}")
        
        logger.info(f"패턴 분석 완료: {request.analysis_type}")
        
        return PatternAnalysisResponse(
            success=True,
            analysis_type=request.analysis_type,
            patterns=patterns,
            predictions=predictions,
            insights=insights,
            confidence_score=confidence_score,
            metadata={
                "analysis_period": request.analysis_period,
                "prediction_horizon": request.prediction_horizon,
                "timestamp": datetime.now().isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"패턴 분석 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"패턴 분석 중 오류 발생: {str(e)}")

def generate_conversation_insights(patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
    """대화 인사이트 생성"""
    insights = []
    
    if "hourly_patterns" in patterns:
        peak_hour = max(patterns["hourly_patterns"].items(), key=lambda x: x[1]["count"])[0]
        insights.append({
            "type": "activity_peak",
            "title": "가장 활발한 시간대",
            "description": f"{peak_hour}시에 가장 많은 대화가 이루어집니다.",
            "value": peak_hour
        })
    
    if "emotion_patterns" in patterns:
        emotion_patterns = patterns["emotion_patterns"]
        dominant_emotion = max(emotion_patterns.items(), key=lambda x: x[1])[0]
        insights.append({
            "type": "emotion_trend",
            "title": "주요 감정 분위기",
            "description": f"대화에서 {dominant_emotion}한 분위기가 우세합니다.",
            "value": dominant_emotion
        })
    
    return insights

def generate_participant_insights(patterns: Dict[str, Any]) -> List[Dict[str, Any]]:
    """참여자 인사이트 생성"""
    insights = []
    
    if "participant_patterns" in patterns:
        participants = patterns["participant_patterns"]
        most_active = max(participants.items(), key=lambda x: x[1]["message_count"])[0]
        insights.append({
            "type": "most_active",
            "title": "가장 활발한 참여자",
            "description": f"{most_active}님이 가장 많은 메시지를 보냈습니다.",
            "value": most_active
        })
    
    return insights

def generate_flow_insights(patterns: Dict[str, Any], predictions: Dict[str, Any]) -> List[Dict[str, Any]]:
    """흐름 인사이트 생성"""
    insights = []
    
    if "response_patterns" in patterns:
        avg_response = patterns["response_patterns"]["avg_response_time"]
        insights.append({
            "type": "response_time",
            "title": "평균 응답 시간",
            "description": f"평균 응답 시간은 {avg_response}분입니다.",
            "value": avg_response
        })
    
    return insights

def generate_prediction_insights(predictions: Dict[str, Any]) -> List[Dict[str, Any]]:
    """예측 인사이트 생성"""
    insights = []
    
    if "hourly_predictions" in predictions:
        predictions_data = predictions["hourly_predictions"]
        peak_hour = max(predictions_data.items(), key=lambda x: x[1]["predicted_messages"])[0]
        insights.append({
            "type": "predicted_peak",
            "title": "예상 활발 시간대",
            "description": f"{peak_hour}시에 가장 활발한 대화가 예상됩니다.",
            "value": peak_hour
        })
    
    return insights

def generate_quality_insights(patterns: Dict[str, Any], predictions: Dict[str, Any]) -> List[Dict[str, Any]]:
    """품질 인사이트 생성"""
    insights = []
    
    if "current_quality" in predictions:
        current_quality = predictions["current_quality"]
        insights.append({
            "type": "current_quality",
            "title": "현재 대화 품질",
            "description": f"현재 대화 품질 점수는 {current_quality}/100입니다.",
            "value": current_quality
        })
    
    return insights

@app.post("/api/generate-messages")
async def generate_messages(chat_room_id: str, count: int = 5):
    """패턴 기반 메시지 생성"""
    try:
        logger.info(f"메시지 생성 요청: {chat_room_id}, {count}개")
        
        result = generate_pattern_based_messages(chat_room_id, count)
        
        logger.info(f"메시지 생성 완료: {len(result.get('generated_messages', []))}개")
        
        return {
            "success": True,
            "generated_messages": result.get("generated_messages", []),
            "patterns_used": result.get("patterns_used", {}),
            "generation_count": count
        }
        
    except Exception as e:
        logger.error(f"메시지 생성 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"메시지 생성 중 오류 발생: {str(e)}")

@app.get("/api/analysis-types")
async def get_analysis_types():
    """지원하는 분석 타입 목록"""
    return {
        "analysis_types": [
            {
                "id": "conversation",
                "name": "대화 패턴",
                "description": "전체적인 대화 패턴 분석",
                "type": "comprehensive"
            },
            {
                "id": "participant",
                "name": "참여자 행동",
                "description": "참여자별 행동 패턴 분석",
                "type": "behavioral"
            },
            {
                "id": "flow",
                "name": "대화 흐름",
                "description": "대화 흐름 및 응답 패턴 분석",
                "type": "temporal"
            },
            {
                "id": "prediction",
                "name": "미래 예측",
                "description": "대화 흐름 및 참여자 활동 예측",
                "type": "predictive"
            },
            {
                "id": "quality",
                "name": "품질 예측",
                "description": "대화 품질 및 개선 방안 예측",
                "type": "quality"
            }
        ]
    }

@app.get("/api/chat-rooms")
async def get_analyzable_chat_rooms():
    """분석 가능한 채팅방 목록"""
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
    print("🚀 AI 대화 패턴 분석 및 예측 서버 시작")
    print("=" * 50)
    print("📍 서버 주소: http://localhost:8012")
    print("📖 API 문서: http://localhost:8012/docs")
    print("🎯 주요 기능:")
    print("   - 대화 패턴 분석")
    print("   - 참여자 행동 패턴 분석")
    print("   - 대화 흐름 예측")
    print("   - 패턴 기반 메시지 생성")
    print("   - 대화 품질 예측")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8012) 