#!/usr/bin/env python3
"""
고급 분석 서버 - 카카오톡 대화 분석
- 대화 패턴 분석
- 감정 분석
- 참여자 분석
- 키워드 추출
- 통계 분석
"""

import os
import json
import time
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="고급 분석 서버 v1.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 데이터 모델
class AnalysisRequest(BaseModel):
    chat_room_id: str
    analysis_type: str  # 'pattern', 'emotion', 'participant', 'keyword', 'statistics'
    date_range: Optional[Dict[str, str]] = None
    participants: Optional[List[str]] = None

class AnalysisResponse(BaseModel):
    success: bool
    analysis_type: str
    data: Dict[str, Any]
    summary: str
    timestamp: str

class ParticipantAnalysis(BaseModel):
    participant_id: str
    message_count: int
    avg_message_length: float
    active_hours: List[int]
    response_time_avg: float
    keywords: List[str]
    emotion_distribution: Dict[str, float]

class PatternAnalysis(BaseModel):
    conversation_patterns: List[Dict[str, Any]]
    peak_activity_hours: List[int]
    daily_activity: Dict[str, int]
    weekly_activity: Dict[str, int]

# 데이터베이스 연결
def get_db_connection():
    return sqlite3.connect('chat_system.db')

# 분석 함수들
def analyze_participants(chat_room_id: str) -> Dict[str, Any]:
    """참여자 분석"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 참여자별 메시지 수 조회
    cursor.execute('''
        SELECT sender, COUNT(*) as message_count, 
               AVG(LENGTH(content)) as avg_length
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY sender
        ORDER BY message_count DESC
    ''', (chat_room_id,))
    
    participants = []
    for row in cursor.fetchall():
        sender, count, avg_len = row
        participants.append({
            'sender': sender,
            'message_count': count,
            'avg_message_length': round(avg_len or 0, 2),
            'percentage': 0  # 나중에 계산
        })
    
    # 전체 메시지 수로 퍼센트 계산
    total_messages = sum(p['message_count'] for p in participants)
    for p in participants:
        p['percentage'] = round((p['message_count'] / total_messages * 100), 2) if total_messages > 0 else 0
    
    conn.close()
    return {
        'participants': participants,
        'total_participants': len(participants),
        'total_messages': total_messages
    }

def analyze_conversation_patterns(chat_room_id: str) -> Dict[str, Any]:
    """대화 패턴 분석"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 시간대별 활동 분석
    cursor.execute('''
        SELECT strftime('%H', timestamp) as hour, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY hour
        ORDER BY hour
    ''', (chat_room_id,))
    
    hourly_activity = {}
    for row in cursor.fetchall():
        hour, count = row
        hourly_activity[int(hour)] = count
    
    # 요일별 활동 분석
    cursor.execute('''
        SELECT strftime('%w', timestamp) as weekday, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY weekday
        ORDER BY weekday
    ''', (chat_room_id,))
    
    weekly_activity = {}
    weekday_names = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    for row in cursor.fetchall():
        weekday, count = row
        weekly_activity[weekday_names[int(weekday)]] = count
    
    # 평균 응답 시간 분석
    cursor.execute('''
        SELECT AVG(
            CAST(
                (julianday(timestamp) - julianday(
                    LAG(timestamp) OVER (ORDER BY timestamp)
                )) * 24 * 60 AS INTEGER
            )
        ) as avg_response_minutes
        FROM messages 
        WHERE chat_room_id = ?
    ''', (chat_room_id,))
    
    avg_response = cursor.fetchone()[0] or 0
    
    conn.close()
    return {
        'hourly_activity': hourly_activity,
        'weekly_activity': weekly_activity,
        'avg_response_minutes': round(avg_response, 2),
        'peak_hours': sorted(hourly_activity.items(), key=lambda x: x[1], reverse=True)[:3]
    }

def analyze_keywords(chat_room_id: str) -> Dict[str, Any]:
    """키워드 분석"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 모든 메시지 내용 가져오기
    cursor.execute('''
        SELECT content FROM messages 
        WHERE chat_room_id = ?
    ''', (chat_room_id,))
    
    messages = cursor.fetchall()
    
    # 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
    word_count = {}
    total_words = 0
    
    for message in messages:
        content = message[0]
        if content:
            words = content.split()
            total_words += len(words)
            for word in words:
                if len(word) > 1:  # 1글자 단어 제외
                    word_count[word] = word_count.get(word, 0) + 1
    
    # 상위 키워드 추출
    top_keywords = sorted(word_count.items(), key=lambda x: x[1], reverse=True)[:20]
    
    conn.close()
    return {
        'top_keywords': [{'word': word, 'count': count} for word, count in top_keywords],
        'total_unique_words': len(word_count),
        'total_words': total_words,
        'avg_words_per_message': round(total_words / len(messages), 2) if messages else 0
    }

def analyze_statistics(chat_room_id: str) -> Dict[str, Any]:
    """통계 분석"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 기본 통계
    cursor.execute('''
        SELECT 
            COUNT(*) as total_messages,
            COUNT(DISTINCT sender) as unique_participants,
            MIN(timestamp) as first_message,
            MAX(timestamp) as last_message,
            AVG(LENGTH(content)) as avg_message_length
        FROM messages 
        WHERE chat_room_id = ?
    ''', (chat_room_id,))
    
    stats = cursor.fetchone()
    total_messages, unique_participants, first_message, last_message, avg_length = stats
    
    # 기간 계산
    if first_message and last_message:
        start_date = datetime.fromisoformat(first_message.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(last_message.replace('Z', '+00:00'))
        duration_days = (end_date - start_date).days
    else:
        duration_days = 0
    
    # 일별 메시지 수
    cursor.execute('''
        SELECT DATE(timestamp) as date, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY DATE(timestamp)
        ORDER BY date
    ''', (chat_room_id,))
    
    daily_stats = {}
    for row in cursor.fetchall():
        date, count = row
        daily_stats[date] = count
    
    conn.close()
    return {
        'total_messages': total_messages,
        'unique_participants': unique_participants,
        'duration_days': duration_days,
        'avg_message_length': round(avg_length or 0, 2),
        'messages_per_day': round(total_messages / max(duration_days, 1), 2),
        'first_message': first_message,
        'last_message': last_message,
        'daily_stats': daily_stats
    }

# API 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "고급 분석 서버",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "참여자 분석",
            "대화 패턴 분석", 
            "키워드 분석",
            "통계 분석"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_chat(request: AnalysisRequest):
    """채팅 분석 수행"""
    try:
        analysis_type = request.analysis_type
        chat_room_id = request.chat_room_id
        
        logger.info(f"분석 요청: {analysis_type} for {chat_room_id}")
        
        if analysis_type == "participant":
            data = analyze_participants(chat_room_id)
            summary = f"총 {data['total_participants']}명의 참여자, {data['total_messages']}개 메시지 분석"
            
        elif analysis_type == "pattern":
            data = analyze_conversation_patterns(chat_room_id)
            summary = f"대화 패턴 분석 완료 - 평균 응답시간: {data['avg_response_minutes']}분"
            
        elif analysis_type == "keyword":
            data = analyze_keywords(chat_room_id)
            summary = f"키워드 분석 완료 - 총 {data['total_unique_words']}개 고유 단어"
            
        elif analysis_type == "statistics":
            data = analyze_statistics(chat_room_id)
            summary = f"통계 분석 완료 - {data['duration_days']}일간 {data['total_messages']}개 메시지"
            
        else:
            raise HTTPException(status_code=400, detail=f"지원하지 않는 분석 타입: {analysis_type}")
        
        return AnalysisResponse(
            success=True,
            analysis_type=analysis_type,
            data=data,
            summary=summary,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"분석 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분석 중 오류 발생: {str(e)}")

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

@app.get("/api/analysis-types")
async def get_analysis_types():
    """지원하는 분석 타입 목록"""
    return {
        "analysis_types": [
            {
                "id": "participant",
                "name": "참여자 분석",
                "description": "참여자별 메시지 수, 활동 패턴 분석"
            },
            {
                "id": "pattern", 
                "name": "대화 패턴 분석",
                "description": "시간대별, 요일별 활동 패턴 분석"
            },
            {
                "id": "keyword",
                "name": "키워드 분석", 
                "description": "자주 사용된 단어, 키워드 추출"
            },
            {
                "id": "statistics",
                "name": "통계 분석",
                "description": "전체적인 대화 통계 정보"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 고급 분석 서버 시작")
    print("=" * 50)
    print("📍 서버 주소: http://localhost:8005")
    print("📖 API 문서: http://localhost:8005/docs")
    print("🎯 주요 기능:")
    print("   - 참여자 분석")
    print("   - 대화 패턴 분석")
    print("   - 키워드 분석")
    print("   - 통계 분석")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8005) 