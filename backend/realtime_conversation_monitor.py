#!/usr/bin/env python3
"""
실시간 대화 모니터링 서버 - 카카오톡 AI 분석 시스템
- 실시간 메시지 분석
- 중요 이벤트 감지
- 참여자 활동 추적
- 대화 품질 모니터링
- 알림 시스템
"""

import sqlite3
import json
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="실시간 대화 모니터링 서버 v1.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# WebSocket 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket 연결 추가. 총 연결 수: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket 연결 제거. 총 연결 수: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # 연결이 끊어진 경우 제거
                self.active_connections.remove(connection)

manager = ConnectionManager()

# 데이터 모델
class MonitoringRequest(BaseModel):
    chat_room_id: str
    monitoring_type: str  # 'realtime', 'events', 'quality', 'activity'
    settings: Optional[Dict[str, Any]] = None

class MonitoringResponse(BaseModel):
    success: bool
    monitoring_type: str
    data: Dict[str, Any]
    timestamp: str

# 데이터베이스 연결
def get_db_connection():
    return sqlite3.connect('chat_system.db')

# 실시간 메시지 분석
def analyze_realtime_message(message_data: Dict[str, Any]) -> Dict[str, Any]:
    """실시간 메시지 분석"""
    content = message_data.get('content', '')
    sender = message_data.get('sender', '')
    timestamp = message_data.get('timestamp', '')
    
    # 메시지 길이 분석
    message_length = len(content) if content else 0
    length_category = 'short' if message_length < 20 else 'medium' if message_length < 100 else 'long'
    
    # 키워드 감지
    important_keywords = ['긴급', '즉시', '바로', '당장', '시급', '중요', '필수', '필요']
    detected_keywords = [keyword for keyword in important_keywords if keyword in content]
    
    # 감정 분석 (간단한 키워드 기반)
    positive_words = ['좋다', '감사', '행복', '기쁘', '만족', '성공', '완료', '해결']
    negative_words = ['문제', '어려움', '실패', '불만', '걱정', '우려', '지연', '오류']
    
    sentiment_score = 0
    for word in positive_words:
        if word in content:
            sentiment_score += 1
    for word in negative_words:
        if word in content:
            sentiment_score -= 1
    
    sentiment = 'positive' if sentiment_score > 0 else 'negative' if sentiment_score < 0 else 'neutral'
    
    return {
        'message_id': message_data.get('id'),
        'sender': sender,
        'content': content,
        'timestamp': timestamp,
        'analysis': {
            'length': message_length,
            'length_category': length_category,
            'detected_keywords': detected_keywords,
            'sentiment': sentiment,
            'sentiment_score': sentiment_score,
            'is_important': len(detected_keywords) > 0,
            'has_urgency': any(word in content for word in ['긴급', '즉시', '바로', '당장'])
        }
    }

# 중요 이벤트 감지
def detect_important_events(chat_room_id: str, time_window: int = 60) -> List[Dict[str, Any]]:
    """중요 이벤트 감지"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 최근 메시지 조회
    cursor.execute('''
        SELECT id, sender, content, timestamp
        FROM messages 
        WHERE chat_room_id = ?
        AND timestamp >= datetime('now', '-{} minutes')
        ORDER BY timestamp DESC
    '''.format(time_window), (chat_room_id,))
    
    recent_messages = cursor.fetchall()
    events = []
    
    # 긴급 키워드 이벤트
    urgent_keywords = ['긴급', '즉시', '바로', '당장', '시급']
    for message in recent_messages:
        msg_id, sender, content, timestamp = message
        if any(keyword in content for keyword in urgent_keywords):
            events.append({
                'type': 'urgent_message',
                'severity': 'high',
                'message_id': msg_id,
                'sender': sender,
                'content': content,
                'timestamp': timestamp,
                'description': '긴급 키워드가 포함된 메시지'
            })
    
    # 높은 활동량 이벤트
    cursor.execute('''
        SELECT sender, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        AND timestamp >= datetime('now', '-10 minutes')
        GROUP BY sender
        HAVING count > 10
    ''', (chat_room_id,))
    
    high_activity = cursor.fetchall()
    for sender, count in high_activity:
        events.append({
            'type': 'high_activity',
            'severity': 'medium',
            'sender': sender,
            'message_count': count,
            'timestamp': datetime.now().isoformat(),
            'description': f'{sender}님이 10분 내 {count}개 메시지 전송'
        })
    
    # 새로운 참여자 이벤트
    cursor.execute('''
        SELECT sender, MIN(timestamp) as first_message
        FROM messages 
        WHERE chat_room_id = ?
        AND timestamp >= datetime('now', '-30 minutes')
        GROUP BY sender
        HAVING first_message >= datetime('now', '-30 minutes')
    ''', (chat_room_id,))
    
    new_participants = cursor.fetchall()
    for sender, first_message in new_participants:
        events.append({
            'type': 'new_participant',
            'severity': 'low',
            'sender': sender,
            'timestamp': first_message,
            'description': f'새로운 참여자: {sender}'
        })
    
    conn.close()
    return events

# 대화 품질 모니터링
def monitor_conversation_quality(chat_room_id: str) -> Dict[str, Any]:
    """대화 품질 모니터링"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 최근 1시간 메시지 분석
    cursor.execute('''
        SELECT content, sender, timestamp
        FROM messages 
        WHERE chat_room_id = ?
        AND timestamp >= datetime('now', '-1 hour')
        ORDER BY timestamp DESC
    ''', (chat_room_id,))
    
    recent_messages = cursor.fetchall()
    
    if not recent_messages:
        return {
            'quality_score': 0,
            'message_count': 0,
            'participant_count': 0,
            'avg_message_length': 0,
            'sentiment_distribution': {'positive': 0, 'neutral': 0, 'negative': 0},
            'issues': ['최근 메시지가 없습니다']
        }
    
    # 기본 통계
    message_count = len(recent_messages)
    participants = set(msg[1] for msg in recent_messages)
    participant_count = len(participants)
    
    # 메시지 길이 분석
    total_length = sum(len(msg[0]) for msg in recent_messages if msg[0])
    avg_message_length = total_length / message_count if message_count > 0 else 0
    
    # 감정 분포
    sentiment_counts = {'positive': 0, 'neutral': 0, 'negative': 0}
    positive_words = ['좋다', '감사', '행복', '기쁘', '만족', '성공', '완료', '해결']
    negative_words = ['문제', '어려움', '실패', '불만', '걱정', '우려', '지연', '오류']
    
    for message in recent_messages:
        content = message[0].lower() if message[0] else ''
        positive_count = sum(1 for word in positive_words if word in content)
        negative_count = sum(1 for word in negative_words if word in content)
        
        if positive_count > negative_count:
            sentiment_counts['positive'] += 1
        elif negative_count > positive_count:
            sentiment_counts['negative'] += 1
        else:
            sentiment_counts['neutral'] += 1
    
    # 품질 점수 계산
    quality_score = 0
    issues = []
    
    # 메시지 수 기반 점수
    if message_count >= 20:
        quality_score += 30
    elif message_count >= 10:
        quality_score += 20
    elif message_count >= 5:
        quality_score += 10
    else:
        issues.append('메시지 수가 적습니다')
    
    # 참여자 수 기반 점수
    if participant_count >= 5:
        quality_score += 25
    elif participant_count >= 3:
        quality_score += 15
    elif participant_count >= 2:
        quality_score += 10
    else:
        issues.append('참여자가 적습니다')
    
    # 감정 분포 기반 점수
    positive_ratio = sentiment_counts['positive'] / message_count if message_count > 0 else 0
    if positive_ratio >= 0.6:
        quality_score += 25
    elif positive_ratio >= 0.4:
        quality_score += 15
    elif positive_ratio >= 0.2:
        quality_score += 10
    else:
        issues.append('부정적 감정이 많습니다')
    
    # 메시지 길이 기반 점수
    if 20 <= avg_message_length <= 200:
        quality_score += 20
    elif avg_message_length > 200:
        quality_score += 10
        issues.append('메시지가 너무 깁니다')
    else:
        issues.append('메시지가 너무 짧습니다')
    
    conn.close()
    
    return {
        'quality_score': min(100, quality_score),
        'message_count': message_count,
        'participant_count': participant_count,
        'avg_message_length': round(avg_message_length, 1),
        'sentiment_distribution': sentiment_counts,
        'issues': issues
    }

# 참여자 활동 추적
def track_participant_activity(chat_room_id: str) -> Dict[str, Any]:
    """참여자 활동 추적"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 최근 30분 활동
    cursor.execute('''
        SELECT sender, COUNT(*) as count, 
               AVG(LENGTH(content)) as avg_length,
               MIN(timestamp) as first_message,
               MAX(timestamp) as last_message
        FROM messages 
        WHERE chat_room_id = ?
        AND timestamp >= datetime('now', '-30 minutes')
        GROUP BY sender
        ORDER BY count DESC
    ''', (chat_room_id,))
    
    recent_activity = []
    for row in cursor.fetchall():
        sender, count, avg_length, first, last = row
        recent_activity.append({
            'sender': sender,
            'message_count': count,
            'avg_message_length': round(avg_length or 0, 1),
            'first_message': first,
            'last_message': last,
            'activity_level': 'high' if count > 10 else 'medium' if count > 5 else 'low'
        })
    
    # 시간대별 활동
    cursor.execute('''
        SELECT strftime('%H', timestamp) as hour, COUNT(*) as count
        FROM messages 
        WHERE chat_room_id = ?
        AND timestamp >= datetime('now', '-1 hour')
        GROUP BY hour
        ORDER BY hour
    ''', (chat_room_id,))
    
    hourly_activity = {}
    for row in cursor.fetchall():
        hour, count = row
        hourly_activity[int(hour)] = count
    
    # 활발한 참여자
    active_participants = [p for p in recent_activity if p['activity_level'] == 'high']
    
    conn.close()
    
    return {
        'recent_activity': recent_activity,
        'hourly_activity': hourly_activity,
        'active_participants': active_participants,
        'total_participants': len(recent_activity),
        'total_messages': sum(p['message_count'] for p in recent_activity)
    }

# API 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "실시간 대화 모니터링 서버",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "실시간 메시지 분석",
            "중요 이벤트 감지",
            "참여자 활동 추적",
            "대화 품질 모니터링",
            "WebSocket 알림"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/monitor", response_model=MonitoringResponse)
async def start_monitoring(request: MonitoringRequest):
    """모니터링 시작"""
    try:
        logger.info(f"모니터링 요청: {request.monitoring_type} for {request.chat_room_id}")
        
        if request.monitoring_type == "realtime":
            # 실시간 분석은 WebSocket을 통해 처리
            data = {"status": "monitoring_started", "chat_room_id": request.chat_room_id}
            
        elif request.monitoring_type == "events":
            data = {
                "events": detect_important_events(request.chat_room_id),
                "chat_room_id": request.chat_room_id
            }
            
        elif request.monitoring_type == "quality":
            data = monitor_conversation_quality(request.chat_room_id)
            
        elif request.monitoring_type == "activity":
            data = track_participant_activity(request.chat_room_id)
            
        else:
            raise HTTPException(status_code=400, detail=f"지원하지 않는 모니터링 타입: {request.monitoring_type}")
        
        logger.info(f"모니터링 완료: {request.monitoring_type}")
        
        return MonitoringResponse(
            success=True,
            monitoring_type=request.monitoring_type,
            data=data,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"모니터링 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"모니터링 중 오류 발생: {str(e)}")

@app.websocket("/ws/monitor")
async def websocket_monitor(websocket: WebSocket):
    """WebSocket 모니터링"""
    await manager.connect(websocket)
    try:
        while True:
            # 클라이언트로부터 메시지 수신
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # 실시간 메시지 분석
            analysis = analyze_realtime_message(message_data)
            
            # 중요 이벤트 감지
            if analysis['analysis']['is_important']:
                event_data = {
                    'type': 'important_message',
                    'severity': 'high',
                    'message': analysis,
                    'timestamp': datetime.now().isoformat()
                }
                await manager.send_personal_message(json.dumps(event_data), websocket)
            
            # 분석 결과 전송
            await manager.send_personal_message(json.dumps(analysis), websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket 오류: {str(e)}")
        manager.disconnect(websocket)

@app.get("/api/monitoring-types")
async def get_monitoring_types():
    """지원하는 모니터링 타입 목록"""
    return {
        "monitoring_types": [
            {
                "id": "realtime",
                "name": "실시간 분석",
                "description": "메시지를 실시간으로 분석",
                "type": "websocket"
            },
            {
                "id": "events",
                "name": "이벤트 감지",
                "description": "중요한 이벤트를 감지",
                "type": "api"
            },
            {
                "id": "quality",
                "name": "품질 모니터링",
                "description": "대화 품질을 분석",
                "type": "api"
            },
            {
                "id": "activity",
                "name": "활동 추적",
                "description": "참여자 활동을 추적",
                "type": "api"
            }
        ]
    }

@app.get("/api/chat-rooms")
async def get_monitorable_chat_rooms():
    """모니터링 가능한 채팅방 목록"""
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
    print("🚀 실시간 대화 모니터링 서버 시작")
    print("=" * 50)
    print("📍 서버 주소: http://localhost:8010")
    print("📖 API 문서: http://localhost:8010/docs")
    print("🎯 주요 기능:")
    print("   - 실시간 메시지 분석")
    print("   - 중요 이벤트 감지")
    print("   - 참여자 활동 추적")
    print("   - 대화 품질 모니터링")
    print("   - WebSocket 알림")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8010) 