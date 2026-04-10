#!/usr/bin/env python3
"""
데이터 시각화 서버 - 카카오톡 AI 분석 시스템
- 시간대별 활동 차트
- 참여자별 메시지 분포
- 감정 분석 시각화
- 키워드 워드클라우드
- 대화 패턴 분석 그래프
"""

import os
import sqlite3
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

from cors_config import get_cors_allow_origins

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="데이터 시각화 서버 v1.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 데이터 모델
class VisualizationRequest(BaseModel):
    chat_room_id: str
    chart_type: str  # 'hourly', 'daily', 'participant', 'sentiment', 'keyword'
    date_range: Optional[Dict[str, str]] = None
    limit: Optional[int] = 20

class VisualizationResponse(BaseModel):
    success: bool
    chart_type: str
    data: Dict[str, Any]
    metadata: Dict[str, Any]

# 데이터베이스 연결
def get_db_connection():
    return sqlite3.connect('chat_system.db')

# 시간대별 활동 데이터 생성
def get_hourly_activity_data(chat_room_id: str) -> Dict[str, Any]:
    """시간대별 활동 데이터"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT strftime('%H', timestamp) as hour, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY hour
        ORDER BY hour
    ''', (chat_room_id,))
    
    hourly_data = {}
    for row in cursor.fetchall():
        hour, count = row
        hourly_data[int(hour)] = count
    
    # 0-23시 모든 시간대에 대해 데이터 생성
    complete_data = []
    for hour in range(24):
        count = hourly_data.get(hour, 0)
        complete_data.append({
            'hour': hour,
            'count': count,
            'label': f'{hour:02d}:00'
        })
    
    conn.close()
    
    return {
        'labels': [item['label'] for item in complete_data],
        'data': [item['count'] for item in complete_data],
        'datasets': [{
            'label': '메시지 수',
            'data': [item['count'] for item in complete_data],
            'backgroundColor': 'rgba(59, 130, 246, 0.5)',
            'borderColor': 'rgba(59, 130, 246, 1)',
            'borderWidth': 2
        }]
    }

# 일별 활동 데이터 생성
def get_daily_activity_data(chat_room_id: str) -> Dict[str, Any]:
    """일별 활동 데이터"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT DATE(timestamp) as date, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY DATE(timestamp)
        ORDER BY date
    ''', (chat_room_id,))
    
    daily_data = []
    for row in cursor.fetchall():
        date, count = row
        daily_data.append({
            'date': date,
            'count': count,
            'label': date
        })
    
    conn.close()
    
    return {
        'labels': [item['label'] for item in daily_data],
        'data': [item['count'] for item in daily_data],
        'datasets': [{
            'label': '일별 메시지 수',
            'data': [item['count'] for item in daily_data],
            'backgroundColor': 'rgba(16, 185, 129, 0.5)',
            'borderColor': 'rgba(16, 185, 129, 1)',
            'borderWidth': 2
        }]
    }

# 참여자별 메시지 분포 데이터 생성
def get_participant_distribution_data(chat_room_id: str, limit: int = 10) -> Dict[str, Any]:
    """참여자별 메시지 분포 데이터"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT sender, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY sender
        ORDER BY count DESC
        LIMIT ?
    ''', (chat_room_id, limit))
    
    participant_data = []
    colors = [
        'rgba(59, 130, 246, 0.8)',   # blue
        'rgba(16, 185, 129, 0.8)',   # green
        'rgba(245, 158, 11, 0.8)',   # yellow
        'rgba(239, 68, 68, 0.8)',    # red
        'rgba(139, 92, 246, 0.8)',   # purple
        'rgba(236, 72, 153, 0.8)',   # pink
        'rgba(34, 197, 94, 0.8)',    # emerald
        'rgba(251, 146, 60, 0.8)',   # orange
        'rgba(99, 102, 241, 0.8)',   # indigo
        'rgba(14, 165, 233, 0.8)'    # sky
    ]
    
    for i, row in enumerate(cursor.fetchall()):
        sender, count = row
        participant_data.append({
            'sender': sender,
            'count': count,
            'color': colors[i % len(colors)]
        })
    
    conn.close()
    
    return {
        'labels': [item['sender'] for item in participant_data],
        'data': [item['count'] for item in participant_data],
        'backgroundColor': [item['color'] for item in participant_data],
        'datasets': [{
            'label': '메시지 수',
            'data': [item['count'] for item in participant_data],
            'backgroundColor': [item['color'] for item in participant_data]
        }]
    }

# 감정 분석 데이터 생성
def get_sentiment_analysis_data(chat_room_id: str) -> Dict[str, Any]:
    """감정 분석 데이터 (시뮬레이션)"""
    # 실제 감정 분석이 없으므로 시뮬레이션 데이터 생성
    sentiment_data = [
        {'sentiment': '긍정', 'count': 45, 'color': 'rgba(16, 185, 129, 0.8)'},
        {'sentiment': '중립', 'count': 35, 'color': 'rgba(107, 114, 128, 0.8)'},
        {'sentiment': '부정', 'count': 20, 'color': 'rgba(239, 68, 68, 0.8)'}
    ]
    
    return {
        'labels': [item['sentiment'] for item in sentiment_data],
        'data': [item['count'] for item in sentiment_data],
        'backgroundColor': [item['color'] for item in sentiment_data],
        'datasets': [{
            'label': '감정 분포',
            'data': [item['count'] for item in sentiment_data],
            'backgroundColor': [item['color'] for item in sentiment_data]
        }]
    }

# 키워드 워드클라우드 데이터 생성
def get_keyword_cloud_data(chat_room_id: str, limit: int = 20) -> Dict[str, Any]:
    """키워드 워드클라우드 데이터"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT content FROM messages 
        WHERE chat_room_id = ?
    ''', (chat_room_id,))
    
    messages = cursor.fetchall()
    
    # 간단한 키워드 추출
    word_count = {}
    for message in messages:
        content = message[0]
        if content:
            words = content.split()
            for word in words:
                if len(word) > 1:  # 1글자 단어 제외
                    word_count[word] = word_count.get(word, 0) + 1
    
    # 상위 키워드 추출
    top_keywords = sorted(word_count.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    conn.close()
    
    # 워드클라우드 형식으로 변환
    wordcloud_data = []
    for word, count in top_keywords:
        # 크기는 빈도에 비례하여 계산
        size = min(50, max(12, count * 2))
        wordcloud_data.append({
            'text': word,
            'value': count,
            'size': size
        })
    
    return {
        'words': wordcloud_data,
        'total_words': len(word_count),
        'unique_words': len(wordcloud_data)
    }

# 대화 패턴 분석 데이터 생성
def get_conversation_pattern_data(chat_room_id: str) -> Dict[str, Any]:
    """대화 패턴 분석 데이터"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 요일별 활동
    cursor.execute('''
        SELECT strftime('%w', timestamp) as weekday, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        GROUP BY weekday
        ORDER BY weekday
    ''', (chat_room_id,))
    
    weekday_names = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    weekly_data = []
    
    for row in cursor.fetchall():
        weekday, count = row
        weekly_data.append({
            'day': weekday_names[int(weekday)],
            'count': count
        })
    
    # 평균 응답 시간 (시뮬레이션)
    avg_response_time = 15.5  # 분 단위
    
    conn.close()
    
    return {
        'weekly_activity': {
            'labels': [item['day'] for item in weekly_data],
            'data': [item['count'] for item in weekly_data],
            'datasets': [{
                'label': '요일별 메시지 수',
                'data': [item['count'] for item in weekly_data],
                'backgroundColor': 'rgba(139, 92, 246, 0.5)',
                'borderColor': 'rgba(139, 92, 246, 1)',
                'borderWidth': 2
            }]
        },
        'avg_response_time': avg_response_time,
        'peak_day': max(weekly_data, key=lambda x: x['count'])['day'],
        'total_conversations': len(weekly_data)
    }

# API 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "데이터 시각화 서버",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "시간대별 활동 차트",
            "참여자별 메시지 분포",
            "감정 분석 시각화",
            "키워드 워드클라우드",
            "대화 패턴 분석"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/visualize", response_model=VisualizationResponse)
async def create_visualization(request: VisualizationRequest):
    """시각화 데이터 생성"""
    try:
        logger.info(f"시각화 요청: {request.chart_type} for {request.chat_room_id}")
        
        if request.chart_type == "hourly":
            data = get_hourly_activity_data(request.chat_room_id)
            metadata = {
                "title": "시간대별 활동",
                "description": "24시간 동안의 메시지 활동 분포",
                "type": "line"
            }
            
        elif request.chart_type == "daily":
            data = get_daily_activity_data(request.chat_room_id)
            metadata = {
                "title": "일별 활동",
                "description": "날짜별 메시지 활동 추이",
                "type": "line"
            }
            
        elif request.chart_type == "participant":
            data = get_participant_distribution_data(request.chat_room_id, request.limit or 10)
            metadata = {
                "title": "참여자별 메시지 분포",
                "description": "참여자별 메시지 수 분포",
                "type": "doughnut"
            }
            
        elif request.chart_type == "sentiment":
            data = get_sentiment_analysis_data(request.chat_room_id)
            metadata = {
                "title": "감정 분석",
                "description": "메시지의 감정 분포 분석",
                "type": "pie"
            }
            
        elif request.chart_type == "keyword":
            data = get_keyword_cloud_data(request.chat_room_id, request.limit or 20)
            metadata = {
                "title": "키워드 워드클라우드",
                "description": "자주 사용된 키워드 시각화",
                "type": "wordcloud"
            }
            
        elif request.chart_type == "pattern":
            data = get_conversation_pattern_data(request.chat_room_id)
            metadata = {
                "title": "대화 패턴 분석",
                "description": "요일별 활동 및 응답 시간 분석",
                "type": "mixed"
            }
            
        else:
            raise HTTPException(status_code=400, detail=f"지원하지 않는 차트 타입: {request.chart_type}")
        
        logger.info(f"시각화 데이터 생성 완료: {request.chart_type}")
        
        return VisualizationResponse(
            success=True,
            chart_type=request.chart_type,
            data=data,
            metadata=metadata
        )
        
    except Exception as e:
        logger.error(f"시각화 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"시각화 중 오류 발생: {str(e)}")

@app.get("/api/chart-types")
async def get_chart_types():
    """지원하는 차트 타입 목록"""
    return {
        "chart_types": [
            {
                "id": "hourly",
                "name": "시간대별 활동",
                "description": "24시간 동안의 메시지 활동 분포",
                "type": "line"
            },
            {
                "id": "daily",
                "name": "일별 활동",
                "description": "날짜별 메시지 활동 추이",
                "type": "line"
            },
            {
                "id": "participant",
                "name": "참여자별 분포",
                "description": "참여자별 메시지 수 분포",
                "type": "doughnut"
            },
            {
                "id": "sentiment",
                "name": "감정 분석",
                "description": "메시지의 감정 분포 분석",
                "type": "pie"
            },
            {
                "id": "keyword",
                "name": "키워드 워드클라우드",
                "description": "자주 사용된 키워드 시각화",
                "type": "wordcloud"
            },
            {
                "id": "pattern",
                "name": "대화 패턴",
                "description": "요일별 활동 및 응답 시간 분석",
                "type": "mixed"
            }
        ]
    }

@app.get("/api/chat-rooms")
async def get_visualizable_chat_rooms():
    """시각화 가능한 대화방 목록"""
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
        logger.error(f"대화방 목록 조회 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"대화방 목록 조회 중 오류 발생: {str(e)}")

if __name__ == "__main__":
    import uvicorn

    _p = int(
        os.environ.get(
            "DATA_VISUALIZATION_SERVER_PORT", os.environ.get("PORT", "8008")
        )
    )
    print("🚀 데이터 시각화 서버 시작")
    print("=" * 50)
    print(f"📍 서버 주소: http://localhost:{_p}")
    print(f"📖 API 문서: http://localhost:{_p}/docs")
    print("🎯 주요 기능:")
    print("   - 시간대별 활동 차트")
    print("   - 참여자별 메시지 분포")
    print("   - 감정 분석 시각화")
    print("   - 키워드 워드클라우드")
    print("   - 대화 패턴 분석")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=_p) 