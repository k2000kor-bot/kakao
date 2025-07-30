#!/usr/bin/env python3
"""
AI 대화 최적화 서버 - 카카오톡 AI 분석 시스템
- 대화 품질 분석
- 개선 방안 제안
- 참여도 최적화
- 의사소통 효율성 향상
- 갈등 해결 방안
"""

import sqlite3
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI 대화 최적화 서버 v1.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 데이터 모델
class OptimizationRequest(BaseModel):
    chat_room_id: str
    optimization_type: str  # 'quality', 'participation', 'efficiency', 'conflict', 'engagement'
    analysis_period: Optional[str] = "7d"  # 1d, 7d, 30d, all
    target_metrics: Optional[List[str]] = None

class OptimizationResponse(BaseModel):
    success: bool
    optimization_type: str
    analysis: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    improvement_score: float
    metadata: Dict[str, Any]

# 데이터베이스 연결
def get_db_connection():
    return sqlite3.connect('chat_system.db')

# 대화 품질 분석
def analyze_conversation_quality(chat_room_id: str, period: str = "7d") -> Dict[str, Any]:
    """대화 품질 분석"""
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
    
    # 기본 통계
    cursor.execute(f'''
        SELECT COUNT(*) as total_messages,
               COUNT(DISTINCT sender) as unique_participants,
               AVG(LENGTH(content)) as avg_message_length,
               MIN(timestamp) as first_message,
               MAX(timestamp) as last_message
        FROM messages 
        WHERE chat_room_id = ?
        {time_filter}
    ''', (chat_room_id,))
    
    stats = cursor.fetchone()
    total_messages, unique_participants, avg_length, first_message, last_message = stats
    
    # 참여도 분석
    cursor.execute(f'''
        SELECT sender, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        {time_filter}
        GROUP BY sender
        ORDER BY count DESC
    ''', (chat_room_id,))
    
    participation_data = cursor.fetchall()
    
    # 참여도 불균형 계산
    if participation_data:
        total_participants = len(participation_data)
        top_participant_count = participation_data[0][1]
        participation_imbalance = (top_participant_count / total_messages) * 100
    else:
        participation_imbalance = 0
    
    # 응답 시간 분석
    cursor.execute(f'''
        SELECT timestamp, sender
        FROM messages 
        WHERE chat_room_id = ?
        {time_filter}
        ORDER BY timestamp
    ''', (chat_room_id,))
    
    messages = cursor.fetchall()
    
    # 평균 응답 시간 계산 (시뮬레이션)
    avg_response_time = 15.5  # 분 단위
    
    # 감정 분석
    positive_words = ['좋다', '감사', '행복', '기쁘', '만족', '성공', '완료', '해결']
    negative_words = ['문제', '어려움', '실패', '불만', '걱정', '우려', '지연', '오류']
    
    positive_count = 0
    negative_count = 0
    
    for message in messages:
        content = message[0] if message[0] else ""
        for word in positive_words:
            if word in content:
                positive_count += 1
        for word in negative_words:
            if word in content:
                negative_count += 1
    
    total_analyzed = len(messages)
    positive_ratio = (positive_count / total_analyzed * 100) if total_analyzed > 0 else 0
    negative_ratio = (negative_count / total_analyzed * 100) if total_analyzed > 0 else 0
    neutral_ratio = 100 - positive_ratio - negative_ratio
    
    conn.close()
    
    # 품질 점수 계산
    quality_score = 0
    
    # 메시지 수 기반 점수
    if total_messages >= 100:
        quality_score += 20
    elif total_messages >= 50:
        quality_score += 15
    elif total_messages >= 20:
        quality_score += 10
    
    # 참여자 수 기반 점수
    if unique_participants >= 10:
        quality_score += 20
    elif unique_participants >= 5:
        quality_score += 15
    elif unique_participants >= 3:
        quality_score += 10
    
    # 참여도 균형 기반 점수
    if participation_imbalance < 30:
        quality_score += 25
    elif participation_imbalance < 50:
        quality_score += 15
    elif participation_imbalance < 70:
        quality_score += 10
    
    # 감정 분포 기반 점수
    if positive_ratio >= 40:
        quality_score += 20
    elif positive_ratio >= 20:
        quality_score += 15
    elif positive_ratio >= 10:
        quality_score += 10
    
    # 메시지 길이 기반 점수
    if 20 <= avg_length <= 200:
        quality_score += 15
    elif avg_length > 200:
        quality_score += 10
    
    return {
        "quality_score": min(100, quality_score),
        "statistics": {
            "total_messages": total_messages,
            "unique_participants": unique_participants,
            "avg_message_length": round(avg_length or 0, 1),
            "participation_imbalance": round(participation_imbalance, 1),
            "avg_response_time": avg_response_time
        },
        "sentiment_analysis": {
            "positive_ratio": round(positive_ratio, 1),
            "negative_ratio": round(negative_ratio, 1),
            "neutral_ratio": round(neutral_ratio, 1)
        },
        "participation_data": [
            {"sender": sender, "count": count} 
            for sender, count in participation_data[:10]
        ]
    }

# 참여도 최적화 분석
def analyze_participation_optimization(chat_room_id: str, period: str = "7d") -> Dict[str, Any]:
    """참여도 최적화 분석"""
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
    
    # 참여자별 활동 분석
    cursor.execute(f'''
        SELECT sender, 
               COUNT(*) as message_count,
               AVG(LENGTH(content)) as avg_length,
               MIN(timestamp) as first_message,
               MAX(timestamp) as last_message
        FROM messages 
        WHERE chat_room_id = ?
        {time_filter}
        GROUP BY sender
        ORDER BY message_count DESC
    ''', (chat_room_id,))
    
    participants = []
    for row in cursor.fetchall():
        sender, count, avg_length, first, last = row
        participants.append({
            "sender": sender,
            "message_count": count,
            "avg_length": round(avg_length or 0, 1),
            "first_message": first,
            "last_message": last,
            "activity_level": "high" if count > 20 else "medium" if count > 10 else "low"
        })
    
    # 참여도 분포
    high_activity = len([p for p in participants if p["activity_level"] == "high"])
    medium_activity = len([p for p in participants if p["activity_level"] == "medium"])
    low_activity = len([p for p in participants if p["activity_level"] == "low"])
    
    # 비활성 참여자 식별
    inactive_participants = [p for p in participants if p["activity_level"] == "low"]
    
    # 참여도 점수 계산
    total_participants = len(participants)
    participation_score = 0
    
    if total_participants > 0:
        # 높은 활동 참여자 비율
        high_ratio = (high_activity / total_participants) * 100
        participation_score += min(40, high_ratio * 0.4)
        
        # 중간 활동 참여자 비율
        medium_ratio = (medium_activity / total_participants) * 100
        participation_score += min(30, medium_ratio * 0.3)
        
        # 낮은 활동 참여자 비율 (감점)
        low_ratio = (low_activity / total_participants) * 100
        participation_score -= min(20, low_ratio * 0.2)
    
    conn.close()
    
    return {
        "participation_score": max(0, min(100, participation_score)),
        "participants": participants,
        "activity_distribution": {
            "high": high_activity,
            "medium": medium_activity,
            "low": low_activity,
            "total": total_participants
        },
        "inactive_participants": inactive_participants,
        "recommendations": generate_participation_recommendations(participants)
    }

# 의사소통 효율성 분석
def analyze_communication_efficiency(chat_room_id: str, period: str = "7d") -> Dict[str, Any]:
    """의사소통 효율성 분석"""
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
    
    # 메시지 길이 분석
    cursor.execute(f'''
        SELECT LENGTH(content) as length
        FROM messages 
        WHERE chat_room_id = ?
        AND content IS NOT NULL
        {time_filter}
    ''', (chat_room_id,))
    
    lengths = [row[0] for row in cursor.fetchall()]
    
    if lengths:
        avg_length = sum(lengths) / len(lengths)
        short_messages = len([l for l in lengths if l < 20])
        medium_messages = len([l for l in lengths if 20 <= l <= 100])
        long_messages = len([l for l in lengths if l > 100])
    else:
        avg_length = 0
        short_messages = 0
        medium_messages = 0
        long_messages = 0
    
    # 응답 패턴 분석
    cursor.execute(f'''
        SELECT timestamp, sender
        FROM messages 
        WHERE chat_room_id = ?
        {time_filter}
        ORDER BY timestamp
    ''', (chat_room_id,))
    
    messages = cursor.fetchall()
    
    # 대화 흐름 분석
    conversation_flow = []
    current_topic = None
    topic_changes = 0
    
    for i, message in enumerate(messages):
        timestamp, sender = message
        if i > 0:
            prev_timestamp = messages[i-1][0]
            time_diff = (datetime.fromisoformat(timestamp.replace('Z', '+00:00')) - 
                        datetime.fromisoformat(prev_timestamp.replace('Z', '+00:00'))).total_seconds() / 60
            
            if time_diff > 30:  # 30분 이상 간격은 새로운 주제로 간주
                topic_changes += 1
    
    # 효율성 점수 계산
    efficiency_score = 0
    
    # 메시지 길이 최적화
    if 20 <= avg_length <= 100:
        efficiency_score += 30
    elif avg_length < 20:
        efficiency_score += 20
    elif avg_length > 100:
        efficiency_score += 15
    
    # 대화 흐름
    if topic_changes < 5:
        efficiency_score += 25
    elif topic_changes < 10:
        efficiency_score += 15
    else:
        efficiency_score += 10
    
    # 메시지 분포
    total_messages = len(lengths)
    if total_messages > 0:
        medium_ratio = (medium_messages / total_messages) * 100
        efficiency_score += min(25, medium_ratio * 0.25)
    
    conn.close()
    
    return {
        "efficiency_score": min(100, efficiency_score),
        "message_length_analysis": {
            "average_length": round(avg_length, 1),
            "short_messages": short_messages,
            "medium_messages": medium_messages,
            "long_messages": long_messages
        },
        "conversation_flow": {
            "total_messages": len(messages),
            "topic_changes": topic_changes,
            "avg_response_time": 15.5  # 시뮬레이션
        },
        "recommendations": generate_efficiency_recommendations(avg_length, topic_changes)
    }

# 갈등 해결 방안 분석
def analyze_conflict_resolution(chat_room_id: str, period: str = "7d") -> Dict[str, Any]:
    """갈등 해결 방안 분석"""
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
    
    # 갈등 관련 키워드 분석
    conflict_keywords = [
        '문제', '어려움', '실패', '불만', '걱정', '우려', '지연', '오류',
        '반대', '취소', '거부', '불가', '안됨', '안되', '못해', '어려워'
    ]
    
    cursor.execute(f'''
        SELECT content, sender, timestamp
        FROM messages 
        WHERE chat_room_id = ?
        AND content IS NOT NULL
        {time_filter}
    ''', (chat_room_id,))
    
    messages = cursor.fetchall()
    
    conflict_messages = []
    conflict_participants = set()
    
    for content, sender, timestamp in messages:
        if content:
            conflict_count = sum(1 for keyword in conflict_keywords if keyword in content)
            if conflict_count > 0:
                conflict_messages.append({
                    "content": content,
                    "sender": sender,
                    "timestamp": timestamp,
                    "conflict_level": "high" if conflict_count > 2 else "medium" if conflict_count > 1 else "low"
                })
                conflict_participants.add(sender)
    
    # 갈등 해결 키워드 분석
    resolution_keywords = [
        '해결', '완료', '성공', '좋다', '감사', '만족', '진행', '확인',
        '동의', '합의', '조정', '타협', '이해', '수용', '개선', '발전'
    ]
    
    resolution_messages = []
    for content, sender, timestamp in messages:
        if content:
            resolution_count = sum(1 for keyword in resolution_keywords if keyword in content)
            if resolution_count > 0:
                resolution_messages.append({
                    "content": content,
                    "sender": sender,
                    "timestamp": timestamp,
                    "resolution_level": "high" if resolution_count > 2 else "medium" if resolution_count > 1 else "low"
                })
    
    # 갈등 해결 점수 계산
    total_messages = len(messages)
    conflict_ratio = (len(conflict_messages) / total_messages * 100) if total_messages > 0 else 0
    resolution_ratio = (len(resolution_messages) / total_messages * 100) if total_messages > 0 else 0
    
    conflict_resolution_score = 0
    
    # 갈등 비율 (낮을수록 좋음)
    if conflict_ratio < 10:
        conflict_resolution_score += 40
    elif conflict_ratio < 20:
        conflict_resolution_score += 30
    elif conflict_ratio < 30:
        conflict_resolution_score += 20
    else:
        conflict_resolution_score += 10
    
    # 해결 비율 (높을수록 좋음)
    if resolution_ratio > 20:
        conflict_resolution_score += 40
    elif resolution_ratio > 10:
        conflict_resolution_score += 30
    elif resolution_ratio > 5:
        conflict_resolution_score += 20
    else:
        conflict_resolution_score += 10
    
    # 갈등 해결 패턴
    if len(resolution_messages) > len(conflict_messages):
        conflict_resolution_score += 20
    elif len(resolution_messages) > 0:
        conflict_resolution_score += 10
    
    conn.close()
    
    return {
        "conflict_resolution_score": min(100, conflict_resolution_score),
        "conflict_analysis": {
            "total_messages": total_messages,
            "conflict_messages": len(conflict_messages),
            "resolution_messages": len(resolution_messages),
            "conflict_ratio": round(conflict_ratio, 1),
            "resolution_ratio": round(resolution_ratio, 1),
            "conflict_participants": list(conflict_participants)
        },
        "conflict_messages": conflict_messages[:5],  # 최근 5개
        "resolution_messages": resolution_messages[:5],  # 최근 5개
        "recommendations": generate_conflict_recommendations(conflict_ratio, resolution_ratio)
    }

# 참여도 개선 방안 생성
def generate_participation_recommendations(participants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """참여도 개선 방안 생성"""
    recommendations = []
    
    low_activity_participants = [p for p in participants if p["activity_level"] == "low"]
    high_activity_participants = [p for p in participants if p["activity_level"] == "high"]
    
    if len(low_activity_participants) > len(high_activity_participants):
        recommendations.append({
            "type": "participation_boost",
            "priority": "high",
            "title": "참여도 향상 필요",
            "description": f"{len(low_activity_participants)}명의 참여자가 낮은 활동을 보이고 있습니다.",
            "suggestions": [
                "관심 있는 주제로 대화를 유도하세요",
                "질문을 통해 참여를 독려하세요",
                "정기적인 안내 메시지를 보내세요"
            ]
        })
    
    if len(high_activity_participants) > 0:
        recommendations.append({
            "type": "role_model",
            "priority": "medium",
            "title": "활발한 참여자 활용",
            "description": f"{high_activity_participants[0]['sender']}님과 같은 활발한 참여자를 롤모델로 활용하세요.",
            "suggestions": [
                "활발한 참여자의 의견을 인용하세요",
                "공동 주제를 제안하여 참여를 유도하세요"
            ]
        })
    
    return recommendations

# 효율성 개선 방안 생성
def generate_efficiency_recommendations(avg_length: float, topic_changes: int) -> List[Dict[str, Any]]:
    """효율성 개선 방안 생성"""
    recommendations = []
    
    if avg_length < 20:
        recommendations.append({
            "type": "message_length",
            "priority": "medium",
            "title": "메시지 길이 개선",
            "description": "평균 메시지 길이가 너무 짧습니다.",
            "suggestions": [
                "더 자세한 설명을 포함하세요",
                "예시나 맥락을 추가하세요"
            ]
        })
    elif avg_length > 100:
        recommendations.append({
            "type": "message_length",
            "priority": "medium",
            "title": "메시지 길이 최적화",
            "description": "평균 메시지 길이가 너무 깁니다.",
            "suggestions": [
                "핵심 내용만 간결하게 전달하세요",
                "긴 메시지는 여러 개로 나누세요"
            ]
        })
    
    if topic_changes > 10:
        recommendations.append({
            "type": "conversation_focus",
            "priority": "high",
            "title": "대화 집중도 향상",
            "description": "주제가 자주 바뀌어 대화 효율성이 떨어집니다.",
            "suggestions": [
                "한 번에 하나의 주제에 집중하세요",
                "주제 전환 시 명확한 안내를 하세요"
            ]
        })
    
    return recommendations

# 갈등 해결 방안 생성
def generate_conflict_recommendations(conflict_ratio: float, resolution_ratio: float) -> List[Dict[str, Any]]:
    """갈등 해결 방안 생성"""
    recommendations = []
    
    if conflict_ratio > 20:
        recommendations.append({
            "type": "conflict_prevention",
            "priority": "high",
            "title": "갈등 예방 필요",
            "description": "갈등 관련 메시지가 많습니다.",
            "suggestions": [
                "명확한 기준과 규칙을 제시하세요",
                "이해관계를 명확히 설명하세요",
                "중재자를 지정하여 갈등을 조정하세요"
            ]
        })
    
    if resolution_ratio < 10:
        recommendations.append({
            "type": "conflict_resolution",
            "priority": "high",
            "title": "갈등 해결 방안 강화",
            "description": "갈등 해결 메시지가 부족합니다.",
            "suggestions": [
                "해결 방안을 구체적으로 제시하세요",
                "합의점을 찾기 위한 대화를 유도하세요",
                "긍정적인 결과를 강조하세요"
            ]
        })
    
    return recommendations

# API 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "AI 대화 최적화 서버",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "대화 품질 분석",
            "참여도 최적화",
            "의사소통 효율성 향상",
            "갈등 해결 방안",
            "개선 제안 시스템"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/optimize", response_model=OptimizationResponse)
async def optimize_conversation(request: OptimizationRequest):
    """대화 최적화 분석"""
    try:
        logger.info(f"최적화 요청: {request.optimization_type} for {request.chat_room_id}")
        
        if request.optimization_type == "quality":
            analysis = analyze_conversation_quality(request.chat_room_id, request.analysis_period)
            recommendations = generate_quality_recommendations(analysis)
            improvement_score = calculate_improvement_score(analysis["quality_score"])
            
        elif request.optimization_type == "participation":
            analysis = analyze_participation_optimization(request.chat_room_id, request.analysis_period)
            recommendations = analysis["recommendations"]
            improvement_score = calculate_improvement_score(analysis["participation_score"])
            
        elif request.optimization_type == "efficiency":
            analysis = analyze_communication_efficiency(request.chat_room_id, request.analysis_period)
            recommendations = analysis["recommendations"]
            improvement_score = calculate_improvement_score(analysis["efficiency_score"])
            
        elif request.optimization_type == "conflict":
            analysis = analyze_conflict_resolution(request.chat_room_id, request.analysis_period)
            recommendations = analysis["recommendations"]
            improvement_score = calculate_improvement_score(analysis["conflict_resolution_score"])
            
        else:
            raise HTTPException(status_code=400, detail=f"지원하지 않는 최적화 타입: {request.optimization_type}")
        
        logger.info(f"최적화 분석 완료: {request.optimization_type}")
        
        return OptimizationResponse(
            success=True,
            optimization_type=request.optimization_type,
            analysis=analysis,
            recommendations=recommendations,
            improvement_score=improvement_score,
            metadata={
                "analysis_period": request.analysis_period,
                "timestamp": datetime.now().isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"최적화 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"최적화 중 오류 발생: {str(e)}")

def generate_quality_recommendations(analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
    """품질 개선 방안 생성"""
    recommendations = []
    
    quality_score = analysis["quality_score"]
    
    if quality_score < 50:
        recommendations.append({
            "type": "overall_improvement",
            "priority": "high",
            "title": "전체적인 대화 품질 향상 필요",
            "description": "대화 품질이 낮습니다. 여러 측면에서 개선이 필요합니다.",
            "suggestions": [
                "참여자들의 관심사를 파악하여 주제를 선정하세요",
                "명확하고 이해하기 쉬운 메시지를 작성하세요",
                "정기적인 대화를 유도하세요"
            ]
        })
    
    participation_imbalance = analysis["statistics"]["participation_imbalance"]
    if participation_imbalance > 50:
        recommendations.append({
            "type": "participation_balance",
            "priority": "medium",
            "title": "참여도 균형 개선",
            "description": "특정 참여자의 참여도가 너무 높습니다.",
            "suggestions": [
                "다른 참여자들에게 발언 기회를 주세요",
                "공동 주제를 제안하여 참여를 유도하세요"
            ]
        })
    
    return recommendations

def calculate_improvement_score(current_score: float) -> float:
    """개선 점수 계산"""
    if current_score >= 80:
        return 0.0  # 이미 높은 점수
    elif current_score >= 60:
        return 20.0  # 약간의 개선 가능
    elif current_score >= 40:
        return 40.0  # 중간 정도 개선 가능
    else:
        return 60.0  # 큰 개선 가능

@app.get("/api/optimization-types")
async def get_optimization_types():
    """지원하는 최적화 타입 목록"""
    return {
        "optimization_types": [
            {
                "id": "quality",
                "name": "대화 품질",
                "description": "전체적인 대화 품질 분석 및 개선",
                "type": "comprehensive"
            },
            {
                "id": "participation",
                "name": "참여도 최적화",
                "description": "참여자 활동 분석 및 참여도 향상",
                "type": "engagement"
            },
            {
                "id": "efficiency",
                "name": "의사소통 효율성",
                "description": "메시지 길이 및 대화 흐름 최적화",
                "type": "communication"
            },
            {
                "id": "conflict",
                "name": "갈등 해결",
                "description": "갈등 분석 및 해결 방안 제시",
                "type": "resolution"
            }
        ]
    }

@app.get("/api/chat-rooms")
async def get_optimizable_chat_rooms():
    """최적화 가능한 채팅방 목록"""
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
    print("🚀 AI 대화 최적화 서버 시작")
    print("=" * 50)
    print("📍 서버 주소: http://localhost:8011")
    print("📖 API 문서: http://localhost:8011/docs")
    print("🎯 주요 기능:")
    print("   - 대화 품질 분석")
    print("   - 참여도 최적화")
    print("   - 의사소통 효율성 향상")
    print("   - 갈등 해결 방안")
    print("   - 개선 제안 시스템")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8011) 