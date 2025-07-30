#!/usr/bin/env python3
"""
Advanced WebSocket Server for Real-time Notifications
실시간 알림 WebSocket 서버
"""

import asyncio
import json
import logging
import time
from datetime import datetime
from typing import Dict, Set, List, Optional
import websockets
from websockets.server import WebSocketServerProtocol
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class WebSocketManager:
    """WebSocket 연결 관리자"""
    
    def __init__(self):
        self.connections: Dict[str, WebSocketServerProtocol] = {}
        self.rooms: Dict[str, Set[str]] = {}  # room_id -> client_ids
        self.client_rooms: Dict[str, Set[str]] = {}  # client_id -> room_ids
        self.last_heartbeat: Dict[str, float] = {}
        
    async def connect(self, websocket: WebSocketServerProtocol, client_id: str):
        """클라이언트 연결"""
        self.connections[client_id] = websocket
        self.last_heartbeat[client_id] = time.time()
        logger.info(f"클라이언트 {client_id} 연결됨")
        
        # 연결 확인 메시지
        await self.send_to_client(client_id, {
            'type': 'connection_established',
            'client_id': client_id,
            'timestamp': datetime.now().isoformat()
        })
    
    async def disconnect(self, client_id: str):
        """클라이언트 연결 해제"""
        if client_id in self.connections:
            # 모든 방에서 제거
            if client_id in self.client_rooms:
                for room_id in self.client_rooms[client_id].copy():
                    await self.leave_room(client_id, room_id)
                del self.client_rooms[client_id]
            
            # 연결 정보 정리
            del self.connections[client_id]
            if client_id in self.last_heartbeat:
                del self.last_heartbeat[client_id]
                
            logger.info(f"클라이언트 {client_id} 연결 해제됨")
    
    async def join_room(self, client_id: str, room_id: str):
        """클라이언트를 방에 추가"""
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        
        self.rooms[room_id].add(client_id)
        
        if client_id not in self.client_rooms:
            self.client_rooms[client_id] = set()
        self.client_rooms[client_id].add(room_id)
        
        logger.info(f"클라이언트 {client_id}가 방 {room_id}에 참여")
        
        # 참여 확인 메시지
        await self.send_to_client(client_id, {
            'type': 'room_joined',
            'room_id': room_id,
            'timestamp': datetime.now().isoformat()
        })
    
    async def leave_room(self, client_id: str, room_id: str):
        """클라이언트를 방에서 제거"""
        if room_id in self.rooms and client_id in self.rooms[room_id]:
            self.rooms[room_id].remove(client_id)
            
            # 빈 방 정리
            if not self.rooms[room_id]:
                del self.rooms[room_id]
        
        if client_id in self.client_rooms and room_id in self.client_rooms[client_id]:
            self.client_rooms[client_id].remove(room_id)
        
        logger.info(f"클라이언트 {client_id}가 방 {room_id}에서 나감")
    
    async def send_to_client(self, client_id: str, message: dict):
        """특정 클라이언트에게 메시지 전송"""
        if client_id in self.connections:
            try:
                await self.connections[client_id].send(json.dumps(message))
                return True
            except websockets.exceptions.ConnectionClosed:
                await self.disconnect(client_id)
                return False
            except Exception as e:
                logger.error(f"클라이언트 {client_id}에게 메시지 전송 실패: {e}")
                return False
        return False
    
    async def broadcast_to_room(self, room_id: str, message: dict):
        """방의 모든 클라이언트에게 메시지 전송"""
        if room_id not in self.rooms:
            return 0
        
        clients = self.rooms[room_id].copy()
        success_count = 0
        
        for client_id in clients:
            if await self.send_to_client(client_id, message):
                success_count += 1
        
        logger.info(f"방 {room_id}에 메시지 전송: {success_count}/{len(clients)} 성공")
        return success_count
    
    async def broadcast_to_all(self, message: dict):
        """모든 연결된 클라이언트에게 메시지 전송"""
        clients = list(self.connections.keys())
        success_count = 0
        
        for client_id in clients:
            if await self.send_to_client(client_id, message):
                success_count += 1
        
        logger.info(f"전체 브로드캐스트: {success_count}/{len(clients)} 성공")
        return success_count
    
    def get_stats(self):
        """연결 통계"""
        return {
            'connected_clients': len(self.connections),
            'active_rooms': len(self.rooms),
            'total_room_memberships': sum(len(members) for members in self.rooms.values()),
            'clients_by_room': {room_id: len(members) for room_id, members in self.rooms.items()}
        }
    
    async def cleanup_inactive_connections(self):
        """비활성 연결 정리"""
        current_time = time.time()
        timeout = 300  # 5분
        
        inactive_clients = []
        for client_id, last_time in self.last_heartbeat.items():
            if current_time - last_time > timeout:
                inactive_clients.append(client_id)
        
        for client_id in inactive_clients:
            logger.info(f"비활성 클라이언트 {client_id} 정리")
            await self.disconnect(client_id)

# 전역 WebSocket 매니저
ws_manager = WebSocketManager()

# FastAPI 앱 생성
app = FastAPI(title="WebSocket Notification Server", version="2.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket 연결 핸들러
async def websocket_handler(websocket: WebSocketServerProtocol, path: str):
    """WebSocket 연결 처리"""
    client_id = path.split('/')[-1] if '/' in path else f"client_{int(time.time())}"
    
    try:
        await ws_manager.connect(websocket, client_id)
        
        async for message in websocket:
            try:
                data = json.loads(message)
                await handle_websocket_message(client_id, data)
            except json.JSONDecodeError:
                logger.error(f"잘못된 JSON 메시지: {message}")
            except Exception as e:
                logger.error(f"메시지 처리 오류: {e}")
                
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"클라이언트 {client_id} 연결 종료")
    except Exception as e:
        logger.error(f"WebSocket 오류: {e}")
    finally:
        await ws_manager.disconnect(client_id)

async def handle_websocket_message(client_id: str, data: dict):
    """WebSocket 메시지 처리"""
    message_type = data.get('type')
    
    if message_type == 'heartbeat':
        ws_manager.last_heartbeat[client_id] = time.time()
        await ws_manager.send_to_client(client_id, {
            'type': 'heartbeat_ack',
            'timestamp': datetime.now().isoformat()
        })
    
    elif message_type == 'subscribe_room':
        room_id = data.get('room_id')
        if room_id:
            await ws_manager.join_room(client_id, room_id)
    
    elif message_type == 'unsubscribe_room':
        room_id = data.get('room_id')
        if room_id:
            await ws_manager.leave_room(client_id, room_id)
    
    elif message_type == 'get_stats':
        stats = ws_manager.get_stats()
        await ws_manager.send_to_client(client_id, {
            'type': 'stats_response',
            'data': stats,
            'timestamp': datetime.now().isoformat()
        })

# REST API 엔드포인트들

@app.get("/api/notifications/status")
async def get_status():
    """서버 상태 조회"""
    stats = ws_manager.get_stats()
    return {
        'status': 'running',
        'timestamp': datetime.now().isoformat(),
        **stats
    }

@app.post("/api/notifications/message-generated")
async def notify_message_generated(data: dict):
    """메시지 생성 완료 알림"""
    room_id = data.get('room_id', 'general')
    message_count = data.get('message_count', 1)
    
    notification = {
        'type': 'message_generated',
        'room_id': room_id,
        'message_count': message_count,
        'timestamp': datetime.now().isoformat(),
        'title': '메시지 생성 완료',
        'content': f'{message_count}개의 메시지가 생성되었습니다'
    }
    
    success_count = await ws_manager.broadcast_to_room(room_id, notification)
    
    return {
        'success': True,
        'sent_to': success_count,
        'room_id': room_id
    }

@app.post("/api/notifications/learning-update")
async def notify_learning_update(data: dict):
    """AI 학습 업데이트 알림"""
    room_id = data.get('room_id', 'general')
    progress = data.get('progress', 0)
    
    notification = {
        'type': 'learning_update',
        'room_id': room_id,
        'progress': progress,
        'timestamp': datetime.now().isoformat(),
        'title': 'AI 학습 진행',
        'content': f'학습 진도: {progress}%'
    }
    
    success_count = await ws_manager.broadcast_to_room(room_id, notification)
    
    return {
        'success': True,
        'sent_to': success_count,
        'room_id': room_id
    }

@app.post("/api/notifications/analysis-complete")
async def notify_analysis_complete(data: dict):
    """분석 완료 알림"""
    room_id = data.get('room_id', 'general')
    analysis_type = data.get('analysis_type', '대화 분석')
    
    notification = {
        'type': 'analysis_complete',
        'room_id': room_id,
        'analysis_type': analysis_type,
        'timestamp': datetime.now().isoformat(),
        'title': '분석 완료',
        'content': f'{analysis_type}이 완료되었습니다'
    }
    
    success_count = await ws_manager.broadcast_to_room(room_id, notification)
    
    return {
        'success': True,
        'sent_to': success_count,
        'room_id': room_id
    }

@app.post("/api/notifications/broadcast")
async def broadcast_notification(data: dict):
    """전체 브로드캐스트"""
    notification = {
        'type': 'broadcast',
        'title': data.get('title', '알림'),
        'content': data.get('content', ''),
        'timestamp': datetime.now().isoformat()
    }
    
    success_count = await ws_manager.broadcast_to_all(notification)
    
    return {
        'success': True,
        'sent_to': success_count
    }

@app.get("/api/notifications/rooms")
async def get_active_rooms():
    """활성 방 목록"""
    stats = ws_manager.get_stats()
    return {
        'rooms': list(ws_manager.rooms.keys()),
        'room_stats': stats['clients_by_room']
    }

# 정리 태스크
async def cleanup_task():
    """정기적으로 비활성 연결 정리"""
    while True:
        try:
            await ws_manager.cleanup_inactive_connections()
            await asyncio.sleep(60)  # 1분마다 실행
        except Exception as e:
            logger.error(f"정리 태스크 오류: {e}")
            await asyncio.sleep(60)

def start_websocket_server():
    """WebSocket 서버 시작"""
    logger.info("WebSocket 서버 시작 중...")
    
    # WebSocket 서버 설정
    start_server = websockets.serve(
        websocket_handler,
        "localhost",
        8004,
        ping_interval=20,
        ping_timeout=10
    )
    
    # 이벤트 루프에 WebSocket 서버와 정리 태스크 추가
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server)
    loop.create_task(cleanup_task())
    
    logger.info("WebSocket 서버가 ws://localhost:8004에서 실행 중")

if __name__ == "__main__":
    try:
        # WebSocket 서버를 별도 스레드에서 시작
        import threading
        
        def run_websocket_server():
            asyncio.set_event_loop(asyncio.new_event_loop())
            start_websocket_server()
        
        websocket_thread = threading.Thread(target=run_websocket_server, daemon=True)
        websocket_thread.start()
        
        # FastAPI 서버 시작 (메인 스레드)
        logger.info("FastAPI 서버 시작 중 (포트 8005)...")
        uvicorn.run(
            app,
            host="localhost",
            port=8005,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        logger.info("서버 종료 중...")
    except Exception as e:
        logger.error(f"서버 시작 오류: {e}") 