#!/usr/bin/env python3
"""
AI 대화 인사이트 서버 - 카카오톡 AI 분석 시스템
- 대화 요약 생성
- 핵심 주제 추출
- 참여자 활동 분석
- 감정 트렌드 분석
- 행동 패턴 인사이트
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

app = FastAPI(title="AI 대화 인사이트 서버 v1.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 데이터 모델
class InsightRequest(BaseModel):
    chat_room_id: str
    analysis_type: str  # 'summary', 'topics', 'participants', 'sentiment', 'patterns'
    date_range: Optional[Dict[str, str]] = None
    limit: Optional[int] = 10

class InsightResponse(BaseModel):
    success: bool
    analysis_type: str
    insights: Dict[str, Any]
    metadata: Dict[str, Any]

# 데이터베이스 연결
def get_db_connection():
    return sqlite3.connect('chat_system.db')

# 대화 요약 생성
def generate_conversation_summary(chat_room_id: str) -> Dict[str, Any]:
    """대화 요약 생성"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 기본 통계
    cursor.execute('''
        SELECT COUNT(*) as total_messages,
               COUNT(DISTINCT sender) as unique_participants,
               MIN(timestamp) as first_message,
               MAX(timestamp) as last_message
        FROM messages 
        WHERE chat_room_id = ?
    ''', (chat_room_id,))
    
    stats = cursor.fetchone()
    total_messages, unique_participants, first_message, last_message = stats
    
    # 기간 계산
    if first_message and last_message:
        start_date = datetime.fromisoformat(first_message.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(last_message.replace('Z', '+00:00'))
        duration_days = (end_date - start_date).days
    else:
        duration_days = 0
    
    # 가장 활발한 시간대
    cursor.execute('''
        SELECT strftime('%H', timestamp) as hour, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY hour
        ORDER BY count DESC
        LIMIT 1
    ''', (chat_room_id,))
    
    peak_hour_result = cursor.fetchone()
    peak_hour = peak_hour_result[0] if peak_hour_result else "00"
    
    # 가장 활발한 참여자
    cursor.execute('''
        SELECT sender, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY sender
        ORDER BY count DESC
        LIMIT 1
    ''', (chat_room_id,))
    
    top_participant_result = cursor.fetchone()
    top_participant = top_participant_result[0] if top_participant_result else "Unknown"
    top_participant_count = top_participant_result[1] if top_participant_result else 0
    
    conn.close()
    
    # 요약 생성
    summary = f"이 채팅방은 총 {total_messages}개의 메시지가 {unique_participants}명의 참여자에 의해 {duration_days}일간 진행되었습니다. "
    summary += f"가장 활발한 시간대는 {peak_hour}시이며, {top_participant}님이 {top_participant_count}개의 메시지로 가장 활발하게 참여했습니다."
    
    return {
        "summary": summary,
        "statistics": {
            "total_messages": total_messages,
            "unique_participants": unique_participants,
            "duration_days": duration_days,
            "peak_hour": peak_hour,
            "top_participant": top_participant,
            "top_participant_count": top_participant_count
        },
        "timeline": {
            "first_message": first_message,
            "last_message": last_message
        }
    }

# 핵심 주제 추출
def extract_key_topics(chat_room_id: str, limit: int = 10) -> Dict[str, Any]:
    """핵심 주제 추출"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT content FROM messages 
        WHERE chat_room_id = ?
        AND content IS NOT NULL
        AND content != ''
    ''', (chat_room_id,))
    
    messages = cursor.fetchall()
    
    # 간단한 키워드 분석
    word_frequency = {}
    topic_keywords = {
        "회의": ["회의", "미팅", "정기회의", "특별회의", "회의록"],
        "업무": ["업무", "작업", "프로젝트", "보고", "진행"],
        "일정": ["일정", "스케줄", "예정", "계획", "시간"],
        "모임": ["모임", "친목", "회식", "모임", "친목회"],
        "긴급": ["긴급", "즉시", "바로", "당장", "시급"],
        "일상": ["안녕", "고마워", "잘가", "좋아", "괜찮아"]
    }
    
    topic_counts = {topic: 0 for topic in topic_keywords.keys()}
    
    for message in messages:
        content = message[0].lower()
        words = content.split()
        
        for word in words:
            if len(word) > 1:
                word_frequency[word] = word_frequency.get(word, 0) + 1
        
        # 주제 분류
        for topic, keywords in topic_keywords.items():
            for keyword in keywords:
                if keyword in content:
                    topic_counts[topic] += 1
                    break
    
    # 상위 키워드
    top_keywords = sorted(word_frequency.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    # 주요 주제
    main_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
    
    conn.close()
    
    return {
        "top_keywords": [{"word": word, "count": count} for word, count in top_keywords],
        "main_topics": [{"topic": topic, "count": count} for topic, count in main_topics if count > 0],
        "total_unique_words": len(word_frequency)
    }

# 참여자 활동 분석
def analyze_participant_activity(chat_room_id: str) -> Dict[str, Any]:
    """참여자 활동 분석"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 참여자별 기본 통계
    cursor.execute('''
        SELECT sender, 
               COUNT(*) as message_count,
               MIN(timestamp) as first_message,
               MAX(timestamp) as last_message,
               AVG(LENGTH(content)) as avg_message_length
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY sender
        ORDER BY message_count DESC
    ''', (chat_room_id,))
    
    participants = []
    for row in cursor.fetchall():
        sender, count, first, last, avg_length = row
        participants.append({
            "sender": sender,
            "message_count": count,
            "first_message": first,
            "last_message": last,
            "avg_message_length": round(avg_length or 0, 1)
        })
    
    # 참여 패턴 분석
    cursor.execute('''
        SELECT sender, strftime('%H', timestamp) as hour, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY sender, hour
        ORDER BY sender, hour
    ''', (chat_room_id,))
    
    activity_patterns = {}
    for row in cursor.fetchall():
        sender, hour, count = row
        if sender not in activity_patterns:
            activity_patterns[sender] = {}
        activity_patterns[sender][int(hour)] = count
    
    # 참여자별 활동 시간대
    participant_peak_hours = {}
    for sender, hours in activity_patterns.items():
        peak_hour = max(hours.items(), key=lambda x: x[1])[0]
        participant_peak_hours[sender] = peak_hour
    
    conn.close()
    
    return {
        "participants": participants,
        "activity_patterns": activity_patterns,
        "peak_hours": participant_peak_hours,
        "total_participants": len(participants)
    }

# 감정 트렌드 분석
def analyze_sentiment_trends(chat_room_id: str) -> Dict[str, Any]:
    """감정 트렌드 분석 (시뮬레이션)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 시간별 메시지 수
    cursor.execute('''
        SELECT DATE(timestamp) as date, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY DATE(timestamp)
        ORDER BY date
    ''', (chat_room_id,))
    
    daily_counts = []
    for row in cursor.fetchall():
        date, count = row
        daily_counts.append({
            "date": date,
            "count": count
        })
    
    conn.close()
    
    # 감정 분석 시뮬레이션
    sentiment_keywords = {
        "positive": ["좋다", "감사", "행복", "기쁘", "만족", "성공", "완료", "해결"],
        "negative": ["문제", "어려움", "실패", "불만", "걱정", "우려", "지연", "오류"],
        "neutral": ["확인", "알림", "안내", "점검", "검토", "진행", "완료"]
    }
    
    # 시뮬레이션된 감정 트렌드
    sentiment_trends = []
    for i, day_data in enumerate(daily_counts):
        # 간단한 시뮬레이션: 메시지 수에 따라 감정 분포 변화
        base_positive = 0.4
        base_negative = 0.2
        base_neutral = 0.4
        
        # 메시지 수가 많을수록 긍정적 감정 증가
        message_factor = min(day_data["count"] / 100, 1.0)
        positive_ratio = base_positive + (message_factor * 0.3)
        negative_ratio = base_negative - (message_factor * 0.1)
        neutral_ratio = base_neutral - (message_factor * 0.2)
        
        sentiment_trends.append({
            "date": day_data["date"],
            "positive": round(positive_ratio * 100, 1),
            "negative": round(negative_ratio * 100, 1),
            "neutral": round(neutral_ratio * 100, 1),
            "message_count": day_data["count"]
        })
    
    return {
        "sentiment_trends": sentiment_trends,
        "overall_sentiment": {
            "positive": 55.2,
            "negative": 18.3,
            "neutral": 26.5
        },
        "sentiment_keywords": sentiment_keywords
    }

# 행동 패턴 인사이트
def analyze_behavior_patterns(chat_room_id: str) -> Dict[str, Any]:
    """행동 패턴 인사이트"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 응답 시간 패턴
    cursor.execute('''
        SELECT sender, 
               strftime('%H', timestamp) as hour,
               COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY sender, hour
        ORDER BY sender, hour
    ''', (chat_room_id,))
    
    response_patterns = {}
    for row in cursor.fetchall():
        sender, hour, count = row
        if sender not in response_patterns:
            response_patterns[sender] = {}
        response_patterns[sender][int(hour)] = count
    
    # 요일별 활동
    cursor.execute('''
        SELECT strftime('%w', timestamp) as weekday, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY weekday
        ORDER BY weekday
    ''', (chat_room_id,))
    
    weekday_names = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    weekly_pattern = []
    
    for row in cursor.fetchall():
        weekday, count = row
        weekly_pattern.append({
            "day": weekday_names[int(weekday)],
            "count": count
        })
    
    # 메시지 길이 패턴
    cursor.execute('''
        SELECT AVG(LENGTH(content)) as avg_length,
               MIN(LENGTH(content)) as min_length,
               MAX(LENGTH(content)) as max_length
        FROM messages 
        WHERE chat_room_id = ?
        AND content IS NOT NULL
    ''', (chat_room_id,))
    
    length_stats = cursor.fetchone()
    avg_length, min_length, max_length = length_stats or (0, 0, 0)
    
    conn.close()
    
    # 패턴 인사이트 생성
    insights = []
    
    # 가장 활발한 요일
    if weekly_pattern:
        peak_day = max(weekly_pattern, key=lambda x: x["count"])
        insights.append(f"가장 활발한 요일은 {peak_day['day']}입니다.")
    
    # 메시지 길이 패턴
    if avg_length > 50:
        insights.append("평균적으로 긴 메시지를 주고받는 대화입니다.")
    elif avg_length < 20:
        insights.append("짧고 간결한 메시지 위주의 대화입니다.")
    else:
        insights.append("적당한 길이의 메시지로 소통합니다.")
    
    # 시간대 패턴
    active_hours = []
    for sender, hours in response_patterns.items():
        peak_hour = max(hours.items(), key=lambda x: x[1])[0]
        active_hours.append(f"{sender}: {peak_hour}시")
    
    if active_hours:
        insights.append(f"주요 활동 시간: {', '.join(active_hours[:3])}")
    
    return {
        "response_patterns": response_patterns,
        "weekly_pattern": weekly_pattern,
        "message_length_stats": {
            "average": round(avg_length, 1),
            "minimum": min_length,
            "maximum": max_length
        },
        "insights": insights
    }

# API 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "AI 대화 인사이트 서버",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "대화 요약 생성",
            "핵심 주제 추출",
            "참여자 활동 분석",
            "감정 트렌드 분석",
            "행동 패턴 인사이트"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/insights", response_model=InsightResponse)
async def generate_insights(request: InsightRequest):
    """인사이트 생성"""
    try:
        logger.info(f"인사이트 요청: {request.analysis_type} for {request.chat_room_id}")
        
        if request.analysis_type == "summary":
            insights = generate_conversation_summary(request.chat_room_id)
            metadata = {
                "title": "대화 요약",
                "description": "전체 대화의 핵심 요약 정보",
                "type": "summary"
            }
            
        elif request.analysis_type == "topics":
            insights = extract_key_topics(request.chat_room_id, request.limit or 10)
            metadata = {
                "title": "핵심 주제",
                "description": "대화에서 자주 언급된 키워드와 주제",
                "type": "topics"
            }
            
        elif request.analysis_type == "participants":
            insights = analyze_participant_activity(request.chat_room_id)
            metadata = {
                "title": "참여자 활동",
                "description": "참여자별 활동 패턴 분석",
                "type": "participants"
            }
            
        elif request.analysis_type == "sentiment":
            insights = analyze_sentiment_trends(request.chat_room_id)
            metadata = {
                "title": "감정 트렌드",
                "description": "시간에 따른 감정 변화 분석",
                "type": "sentiment"
            }
            
        elif request.analysis_type == "patterns":
            insights = analyze_behavior_patterns(request.chat_room_id)
            metadata = {
                "title": "행동 패턴",
                "description": "참여자들의 행동 패턴 인사이트",
                "type": "patterns"
            }
            
        else:
            raise HTTPException(status_code=400, detail=f"지원하지 않는 분석 타입: {request.analysis_type}")
        
        logger.info(f"인사이트 생성 완료: {request.analysis_type}")
        
        return InsightResponse(
            success=True,
            analysis_type=request.analysis_type,
            insights=insights,
            metadata=metadata
        )
        
    except Exception as e:
        logger.error(f"인사이트 생성 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"인사이트 생성 중 오류 발생: {str(e)}")

@app.get("/api/analysis-types")
async def get_analysis_types():
    """지원하는 분석 타입 목록"""
    return {
        "analysis_types": [
            {
                "id": "summary",
                "name": "대화 요약",
                "description": "전체 대화의 핵심 요약 정보",
                "type": "summary"
            },
            {
                "id": "topics",
                "name": "핵심 주제",
                "description": "대화에서 자주 언급된 키워드와 주제",
                "type": "topics"
            },
            {
                "id": "participants",
                "name": "참여자 활동",
                "description": "참여자별 활동 패턴 분석",
                "type": "participants"
            },
            {
                "id": "sentiment",
                "name": "감정 트렌드",
                "description": "시간에 따른 감정 변화 분석",
                "type": "sentiment"
            },
            {
                "id": "patterns",
                "name": "행동 패턴",
                "description": "참여자들의 행동 패턴 인사이트",
                "type": "patterns"
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
    print("🚀 AI 대화 인사이트 서버 시작")
    print("=" * 50)
    print("📍 서버 주소: http://localhost:8009")
    print("📖 API 문서: http://localhost:8009/docs")
    print("🎯 주요 기능:")
    print("   - 대화 요약 생성")
    print("   - 핵심 주제 추출")
    print("   - 참여자 활동 분석")
    print("   - 감정 트렌드 분석")
    print("   - 행동 패턴 인사이트")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8009) 