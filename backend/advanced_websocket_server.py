#!/usr/bin/env python3
"""
Advanced WebSocket Server for Real-time Notifications
실시간 알림 WebSocket 서버
"""

import asyncio
import json
import logging
from typing import Dict, Set, Optional
from websockets.server import serve, WebSocketServerProtocol
from websockets.exceptions import ConnectionClosed
import uuid

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatWebSocketServer:
    def __init__(self):
        self.clients: Dict[str, WebSocketServerProtocol] = {}
        self.rooms: Dict[str, Set[str]] = {}
        self.user_rooms: Dict[str, str] = {}  # user_id -> room_id
        self.typing_users: Dict[str, Set[str]] = {}  # room_id -> set of user_ids
        
    async def register_client(self, websocket: WebSocketServerProtocol, user_id: str):
        """클라이언트 등록"""
        self.clients[user_id] = websocket
        logger.info(f"클라이언트 등록: {user_id}")
        
    async def unregister_client(self, user_id: str):
        """클라이언트 등록 해제"""
        if user_id in self.clients:
            del self.clients[user_id]
            
        # 사용자가 속한 방에서 제거
        room_id = self.user_rooms.get(user_id)
        if room_id and room_id in self.rooms:
            self.rooms[room_id].discard(user_id)
            if not self.rooms[room_id]:
                del self.rooms[room_id]
            del self.user_rooms[user_id]
            
        # 타이핑 상태에서 제거
        for room_id in self.typing_users:
            self.typing_users[room_id].discard(user_id)
            
        logger.info(f"클라이언트 등록 해제: {user_id}")
        
    async def join_room(self, user_id: str, room_id: str):
        """방 참가"""
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
            
        self.rooms[room_id].add(user_id)
        self.user_rooms[user_id] = room_id
        
        # 방 참가 알림 전송
        await self.broadcast_to_room(room_id, {
            "type": "system",
            "message": f"{user_id}님이 방에 참가했습니다.",
            "room_id": room_id,
            "timestamp": self.get_timestamp()
        }, exclude_user=user_id)
        
        logger.info(f"사용자 {user_id}가 방 {room_id}에 참가")
        
    async def leave_room(self, user_id: str):
        """방 나가기"""
        room_id = self.user_rooms.get(user_id)
        if room_id:
            if room_id in self.rooms:
                self.rooms[room_id].discard(user_id)
                if not self.rooms[room_id]:
                    del self.rooms[room_id]
                    
            del self.user_rooms[user_id]
            
            # 방 나가기 알림 전송
            await self.broadcast_to_room(room_id, {
                "type": "system",
                "message": f"{user_id}님이 방을 나갔습니다.",
                "room_id": room_id,
                "timestamp": self.get_timestamp()
            })
            
            logger.info(f"사용자 {user_id}가 방 {room_id}에서 나감")
            
    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: Optional[str] = None):
        """방의 모든 사용자에게 메시지 브로드캐스트"""
        if room_id not in self.rooms:
            return
            
        for user_id in self.rooms[room_id]:
            if user_id != exclude_user and user_id in self.clients:
                try:
                    await self.clients[user_id].send(json.dumps(message, ensure_ascii=False))
                except ConnectionClosed:
                    await self.unregister_client(user_id)
                except Exception as e:
                    logger.error(f"메시지 전송 실패 ({user_id}): {e}")
                    
    async def handle_message(self, websocket: WebSocketServerProtocol, message: dict):
        """메시지 처리"""
        try:
            msg_type = message.get("type")
            user_id = message.get("user_id", "anonymous")
            room_id = message.get("room_id")
            
            if msg_type == "join":
                await self.join_room(user_id, room_id)
                
            elif msg_type == "leave":
                await self.leave_room(user_id)
                
            elif msg_type == "message":
                # 메시지를 방의 모든 사용자에게 브로드캐스트
                await self.broadcast_to_room(room_id, {
                    "type": "message",
                    "message": message.get("message"),
                    "room_id": room_id,
                    "timestamp": self.get_timestamp()
                })
                
            elif msg_type == "typing":
                # 타이핑 상태 업데이트
                if room_id not in self.typing_users:
                    self.typing_users[room_id] = set()
                    
                if message.get("isTyping"):
                    self.typing_users[room_id].add(user_id)
                else:
                    self.typing_users[room_id].discard(user_id)
                    
                # 타이핑 상태를 다른 사용자들에게 브로드캐스트
                await self.broadcast_to_room(room_id, {
                    "type": "typing",
                    "user": user_id,
                    "isTyping": message.get("isTyping"),
                    "room_id": room_id,
                    "timestamp": self.get_timestamp()
                }, exclude_user=user_id)
                
        except Exception as e:
            logger.error(f"메시지 처리 오류: {e}")
            
    def get_timestamp(self):
        """현재 타임스탬프 반환"""
        from datetime import datetime
        return datetime.now().isoformat()
        
    async def handle_client(self, websocket: WebSocketServerProtocol, path: str):
        """클라이언트 연결 처리"""
        user_id = str(uuid.uuid4())
        
        try:
            await self.register_client(websocket, user_id)
            
            # 연결 성공 메시지 전송
            await websocket.send(json.dumps({
                "type": "connected",
                "user_id": user_id,
                "message": "WebSocket 연결이 성공했습니다."
            }, ensure_ascii=False))
            
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await self.handle_message(websocket, data)
                except json.JSONDecodeError:
                    logger.error(f"잘못된 JSON 형식: {message}")
                except Exception as e:
                    logger.error(f"메시지 처리 중 오류: {e}")
                    
        except ConnectionClosed:
            logger.info(f"클라이언트 연결 종료: {user_id}")
        except Exception as e:
            logger.error(f"클라이언트 처리 중 오류: {e}")
        finally:
            await self.unregister_client(user_id)

async def main():
    """메인 서버 실행"""
    server = ChatWebSocketServer()
    
    # WebSocket 서버 시작
    async with serve(server.handle_client, "localhost", 8001):
        logger.info("WebSocket 서버가 localhost:8001에서 시작되었습니다.")
        await asyncio.Future()  # 서버를 계속 실행

if __name__ == "__main__":
    asyncio.run(main()) 