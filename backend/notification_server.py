#!/usr/bin/env python3
"""
실시간 알림 서버 - 카카오톡 AI 분석 시스템
- 분석 완료 알림
- 오류 발생 알림
- 시스템 상태 알림
- 실시간 이벤트 브로드캐스트
"""

import os
import asyncio
import json
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

from cors_config import get_cors_allow_origins

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="실시간 알림 서버 v1.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 데이터 모델
class NotificationRequest(BaseModel):
    type: str  # 'info', 'success', 'warning', 'error'
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None

class NotificationResponse(BaseModel):
    success: bool
    notification_id: str
    timestamp: str

# WebSocket 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"새로운 WebSocket 연결: {len(self.active_connections)}개")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket 연결 해제: {len(self.active_connections)}개")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"개인 메시지 전송 오류: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"브로드캐스트 오류: {e}")
                disconnected.append(connection)
        
        # 연결이 끊어진 클라이언트 제거
        for connection in disconnected:
            self.disconnect(connection)

manager = ConnectionManager()

# 알림 타입별 아이콘과 색상
NOTIFICATION_STYLES = {
    'info': {
        'icon': 'ℹ️',
        'color': 'blue',
        'bg_color': 'bg-blue-50',
        'border_color': 'border-blue-200',
        'text_color': 'text-blue-800'
    },
    'success': {
        'icon': '✅',
        'color': 'green',
        'bg_color': 'bg-green-50',
        'border_color': 'border-green-200',
        'text_color': 'text-green-800'
    },
    'warning': {
        'icon': '⚠️',
        'color': 'yellow',
        'bg_color': 'bg-yellow-50',
        'border_color': 'border-yellow-200',
        'text_color': 'text-yellow-800'
    },
    'error': {
        'icon': '❌',
        'color': 'red',
        'bg_color': 'bg-red-50',
        'border_color': 'border-red-200',
        'text_color': 'text-red-800'
    }
}

# 알림 생성 함수
def create_notification(notification_type: str, title: str, message: str, data: Optional[Dict] = None) -> Dict[str, Any]:
    """알림 객체 생성"""
    notification_id = f"notif_{int(time.time() * 1000)}"
    
    notification = {
        'id': notification_id,
        'type': notification_type,
        'title': title,
        'message': message,
        'data': data or {},
        'timestamp': datetime.now().isoformat(),
        'style': NOTIFICATION_STYLES.get(notification_type, NOTIFICATION_STYLES['info'])
    }
    
    return notification

# API 엔드포인트
@app.get("/")
async def root():
    return {
        "service": "실시간 알림 서버",
        "version": "1.0.0",
        "status": "running",
        "active_connections": len(manager.active_connections),
        "features": [
            "실시간 알림",
            "WebSocket 브로드캐스트",
            "알림 타입별 스타일링",
            "시스템 상태 모니터링"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "active_connections": len(manager.active_connections)
    }

@app.post("/api/notify", response_model=NotificationResponse)
async def send_notification(request: NotificationRequest):
    """알림 전송"""
    try:
        notification = create_notification(
            request.type,
            request.title,
            request.message,
            request.data
        )
        
        # WebSocket으로 브로드캐스트
        await manager.broadcast(json.dumps(notification))
        
        logger.info(f"알림 전송: {request.type} - {request.title}")
        
        return NotificationResponse(
            success=True,
            notification_id=notification['id'],
            timestamp=notification['timestamp']
        )
        
    except Exception as e:
        logger.error(f"알림 전송 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"알림 전송 중 오류 발생: {str(e)}")

@app.get("/api/notifications/types")
async def get_notification_types():
    """지원하는 알림 타입 목록"""
    return {
        "notification_types": [
            {
                "type": "info",
                "name": "정보",
                "description": "일반적인 정보 알림",
                "icon": "ℹ️"
            },
            {
                "type": "success",
                "name": "성공",
                "description": "작업 완료 알림",
                "icon": "✅"
            },
            {
                "type": "warning",
                "name": "경고",
                "description": "주의가 필요한 알림",
                "icon": "⚠️"
            },
            {
                "type": "error",
                "name": "오류",
                "description": "오류 발생 알림",
                "icon": "❌"
            }
        ]
    }

@app.get("/api/status")
async def get_server_status():
    """서버 상태 정보"""
    return {
        "active_connections": len(manager.active_connections),
        "server_time": datetime.now().isoformat(),
        "uptime": "실행 중",
        "features": [
            "WebSocket 실시간 통신",
            "알림 브로드캐스트",
            "다중 클라이언트 지원"
        ]
    }

# WebSocket 엔드포인트
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # 연결 확인 메시지 전송
        welcome_message = create_notification(
            'info',
            '연결 성공',
            '실시간 알림 서버에 연결되었습니다.',
            {'connection_id': id(websocket)}
        )
        await manager.send_personal_message(json.dumps(welcome_message), websocket)
        
        # 클라이언트로부터 메시지 수신 대기
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # 클라이언트 메시지 처리 (필요시)
                logger.info(f"클라이언트 메시지: {message}")
                
            except WebSocketDisconnect:
                manager.disconnect(websocket)
                break
            except Exception as e:
                logger.error(f"WebSocket 오류: {e}")
                break
                
    except Exception as e:
        logger.error(f"WebSocket 연결 오류: {e}")
        manager.disconnect(websocket)

# 시스템 알림 함수들
async def send_analysis_complete_notification(analysis_type: str, room_id: str, result: Dict):
    """분석 완료 알림"""
    notification = create_notification(
        'success',
        '분석 완료',
        f'{analysis_type} 분석이 완료되었습니다.',
        {
            'analysis_type': analysis_type,
            'room_id': room_id,
            'result_summary': result.get('summary', '')
        }
    )
    await manager.broadcast(json.dumps(notification))

async def send_error_notification(error_type: str, error_message: str, details: Optional[Dict] = None):
    """오류 알림"""
    notification = create_notification(
        'error',
        f'{error_type} 오류',
        error_message,
        details or {}
    )
    await manager.broadcast(json.dumps(notification))

async def send_system_status_notification(status: str, message: str):
    """시스템 상태 알림"""
    notification = create_notification(
        'info',
        f'시스템 상태: {status}',
        message,
        {'status': status, 'timestamp': datetime.now().isoformat()}
    )
    await manager.broadcast(json.dumps(notification))

# 테스트용 엔드포인트
@app.post("/api/test/notify")
async def test_notification():
    """테스트 알림 전송"""
    try:
        # 다양한 타입의 테스트 알림 전송
        test_notifications = [
            ('info', '테스트 정보', '이것은 정보 알림입니다.'),
            ('success', '테스트 성공', '작업이 성공적으로 완료되었습니다.'),
            ('warning', '테스트 경고', '주의가 필요한 상황입니다.'),
            ('error', '테스트 오류', '오류가 발생했습니다.')
        ]
        
        for notif_type, title, message in test_notifications:
            notification = create_notification(notif_type, title, message)
            await manager.broadcast(json.dumps(notification))
            await asyncio.sleep(1)  # 1초 간격으로 전송
        
        return {"success": True, "message": "테스트 알림 전송 완료"}
        
    except Exception as e:
        logger.error(f"테스트 알림 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"테스트 알림 전송 중 오류 발생: {str(e)}")

if __name__ == "__main__":
    import uvicorn

    _p = int(
        os.environ.get("NOTIFICATION_SERVER_PORT", os.environ.get("PORT", "8006"))
    )
    print("🚀 실시간 알림 서버 시작")
    print("=" * 50)
    print(f"📍 서버 주소: http://localhost:{_p}")
    print(f"📖 API 문서: http://localhost:{_p}/docs")
    print(f"🔌 WebSocket: ws://localhost:{_p}/ws")
    print("🎯 주요 기능:")
    print("   - 실시간 알림")
    print("   - WebSocket 브로드캐스트")
    print("   - 알림 타입별 스타일링")
    print("   - 시스템 상태 모니터링")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=_p) 