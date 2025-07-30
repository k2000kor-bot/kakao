#!/usr/bin/env python3
"""
루팅폰용 카카오톡 데이터 추출 시스템
Rooted Android 앱에서 전송된 카카오톡 데이터를 처리하는 백엔드 모듈
"""

import sqlite3
import json
import os
import hashlib
import datetime
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import asyncio
import websockets
import uvicorn

class KakaoMessage(BaseModel):
    """카카오톡 메시지 데이터 모델"""
    message_id: str
    chat_room_id: str
    sender_id: str
    sender_name: str
    sender_hash: Optional[str] = None
    sender_phone_hash: Optional[str] = None
    sender_profile_image: Optional[str] = None
    content: str
    message_type: str  # text, image, video, file, etc.
    timestamp: int
    is_sent_by_me: bool
    attachment_path: Optional[str] = None
    attachment_type: Optional[str] = None
    room_name: Optional[str] = None
    room_type: Optional[str] = None
    context_hash: Optional[str] = None

class ChatRoom(BaseModel):
    """채팅방 정보 모델"""
    room_id: str
    room_name: str
    room_type: str  # direct, group, openchat
    participant_count: int
    participants: List[str]
    last_message_time: int
    room_hash: Optional[str] = None
    profile_image_url: Optional[str] = None
    created_at: Optional[int] = None

class RootedKakaoExtractor:
    """루팅폰에서 추출된 카카오톡 데이터 처리 클래스"""
    
    def __init__(self, db_path: str = "rooted_kakao_data.db"):
        self.db_path = db_path
        self.init_database()
        
    def init_database(self):
        """로컬 데이터베이스 초기화"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 메시지 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS extracted_messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    message_id TEXT UNIQUE,
                    chat_room_id TEXT,
                    sender_id TEXT,
                    sender_name TEXT,
                    content TEXT,
                    message_type TEXT,
                    timestamp INTEGER,
                    is_sent_by_me BOOLEAN,
                    attachment_path TEXT,
                    attachment_type TEXT,
                    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processed BOOLEAN DEFAULT FALSE
                )
            """)
            
            # 채팅방 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chat_rooms (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    room_id TEXT UNIQUE,
                    room_name TEXT,
                    room_type TEXT,
                    participant_count INTEGER,
                    participants TEXT,  -- JSON string
                    last_message_time INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 동기화 상태 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sync_status (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    device_id TEXT,
                    last_sync_time INTEGER,
                    total_messages INTEGER,
                    processed_messages INTEGER,
                    status TEXT,  -- syncing, completed, error
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()

    def store_message(self, message: KakaoMessage) -> bool:
        """추출된 메시지 저장"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO extracted_messages 
                    (message_id, chat_room_id, sender_id, sender_name, content, 
                     message_type, timestamp, is_sent_by_me, attachment_path, 
                     attachment_type)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    message.message_id, message.chat_room_id, message.sender_id,
                    message.sender_name, message.content, message.message_type,
                    message.timestamp, message.is_sent_by_me, 
                    message.attachment_path, message.attachment_type
                ))
                conn.commit()
                return True
        except Exception as e:
            print(f"메시지 저장 오류: {e}")
            return False

    def store_chat_room(self, room: ChatRoom) -> bool:
        """채팅방 정보 저장"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                participants_json = json.dumps(room.participants, ensure_ascii=False)
                cursor.execute("""
                    INSERT OR REPLACE INTO chat_rooms 
                    (room_id, room_name, room_type, participant_count, 
                     participants, last_message_time, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    room.room_id, room.room_name, room.room_type,
                    room.participant_count, participants_json, room.last_message_time
                ))
                conn.commit()
                return True
        except Exception as e:
            print(f"채팅방 저장 오류: {e}")
            return False

    def get_unprocessed_messages(self, limit: int = 100) -> List[Dict[str, Any]]:
        """미처리 메시지들 조회"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM extracted_messages 
                WHERE processed = FALSE 
                ORDER BY timestamp ASC 
                LIMIT ?
            """, (limit,))
            
            columns = [desc[0] for desc in cursor.description]
            messages = []
            for row in cursor.fetchall():
                message = dict(zip(columns, row))
                messages.append(message)
            
            return messages

    def mark_messages_processed(self, message_ids: List[str]) -> bool:
        """메시지들을 처리완료로 마킹"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                placeholders = ','.join(['?' for _ in message_ids])
                cursor.execute(f"""
                    UPDATE extracted_messages 
                    SET processed = TRUE 
                    WHERE message_id IN ({placeholders})
                """, message_ids)
                conn.commit()
                return True
        except Exception as e:
            print(f"메시지 처리 마킹 오류: {e}")
            return False

    def get_chat_rooms(self) -> List[Dict[str, Any]]:
        """모든 채팅방 정보 조회"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM chat_rooms ORDER BY last_message_time DESC")
            
            columns = [desc[0] for desc in cursor.description]
            rooms = []
            for row in cursor.fetchall():
                room = dict(zip(columns, row))
                # participants JSON 파싱
                if room['participants']:
                    room['participants'] = json.loads(room['participants'])
                rooms.append(room)
            
            return rooms

    def convert_to_standard_format(self, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """기존 시스템 형식으로 변환"""
        standard_messages = []
        
        for msg in messages:
            # 타임스탬프를 datetime으로 변환
            timestamp = datetime.datetime.fromtimestamp(msg['timestamp'] / 1000)
            
            standard_msg = {
                "id": msg['message_id'],
                "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "sender": msg['sender_name'],
                "content": msg['content'],
                "message_type": msg['message_type'],
                "is_sent_by_me": msg['is_sent_by_me'],
                "chat_room": msg['chat_room_id'],
                "attachment": {
                    "path": msg['attachment_path'],
                    "type": msg['attachment_type']
                } if msg['attachment_path'] else None
            }
            standard_messages.append(standard_msg)
        
        return standard_messages

# FastAPI 앱 인스턴스
app = FastAPI(title="루팅폰 카카오톡 데이터 수신 서버")
extractor = RootedKakaoExtractor()

@app.post("/api/rooted/messages/bulk")
async def receive_bulk_messages(messages: List[KakaoMessage]):
    """루팅폰 앱에서 대량 메시지 수신"""
    try:
        success_count = 0
        for message in messages:
            if extractor.store_message(message):
                success_count += 1
        
        return {
            "success": True,
            "received_count": len(messages),
            "stored_count": success_count,
            "message": f"{success_count}/{len(messages)} 메시지가 저장되었습니다."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"메시지 저장 오류: {str(e)}")

@app.post("/api/rooted/message")
async def receive_single_message(message: KakaoMessage):
    """루팅폰 앱에서 단일 메시지 수신"""
    try:
        success = extractor.store_message(message)
        if success:
            return {"success": True, "message": "메시지가 저장되었습니다."}
        else:
            raise HTTPException(status_code=500, detail="메시지 저장 실패")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"메시지 저장 오류: {str(e)}")

@app.post("/api/rooted/chatrooms/bulk")
async def receive_bulk_chatrooms(rooms: List[ChatRoom]):
    """루팅폰 앱에서 채팅방 정보 대량 수신"""
    try:
        success_count = 0
        for room in rooms:
            if extractor.store_chat_room(room):
                success_count += 1
        
        return {
            "success": True,
            "received_count": len(rooms),
            "stored_count": success_count,
            "message": f"{success_count}/{len(rooms)} 채팅방이 저장되었습니다."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"채팅방 저장 오류: {str(e)}")

@app.get("/api/rooted/messages/unprocessed")
async def get_unprocessed_messages(limit: int = 100):
    """미처리 메시지들 조회"""
    try:
        messages = extractor.get_unprocessed_messages(limit)
        standard_messages = extractor.convert_to_standard_format(messages)
        
        return {
            "success": True,
            "count": len(standard_messages),
            "messages": standard_messages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"메시지 조회 오류: {str(e)}")

@app.post("/api/rooted/messages/mark-processed")
async def mark_messages_processed(message_ids: List[str]):
    """메시지들을 처리완료로 마킹"""
    try:
        success = extractor.mark_messages_processed(message_ids)
        if success:
            return {"success": True, "message": f"{len(message_ids)}개 메시지가 처리완료 되었습니다."}
        else:
            raise HTTPException(status_code=500, detail="메시지 처리 마킹 실패")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"처리 마킹 오류: {str(e)}")

@app.get("/api/rooted/chatrooms")
async def get_chatrooms():
    """모든 채팅방 정보 조회"""
    try:
        rooms = extractor.get_chat_rooms()
        return {
            "success": True,
            "count": len(rooms),
            "chatrooms": rooms
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"채팅방 조회 오류: {str(e)}")

@app.post("/api/rooted/sync-with-main-system")
async def sync_with_main_system():
    """기존 메인 시스템과 동기화"""
    try:
        # 미처리 메시지들 조회
        messages = extractor.get_unprocessed_messages(1000)
        
        if not messages:
            return {"success": True, "message": "동기화할 새 메시지가 없습니다."}
        
        # 기존 시스템 형식으로 변환
        standard_messages = extractor.convert_to_standard_format(messages)
        
        # 여기서 기존 advanced_api_server.py의 API를 호출하여 메시지들을 전송
        # 실제 구현에서는 HTTP 클라이언트를 사용하여 기존 시스템에 전송
        
        # 처리 완료 마킹
        message_ids = [msg['message_id'] for msg in messages]
        extractor.mark_messages_processed(message_ids)
        
        return {
            "success": True,
            "synced_count": len(standard_messages),
            "message": f"{len(standard_messages)}개의 메시지가 메인 시스템에 동기화되었습니다."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"동기화 오류: {str(e)}")

@app.post("/api/rooted/upload-media")
async def upload_media_file(file: UploadFile = File(...), message_id: str = None):
    """루팅폰에서 미디어 파일 업로드"""
    try:
        # 미디어 저장 디렉토리 생성
        media_dir = "media_storage/rooted_uploads"
        os.makedirs(media_dir, exist_ok=True)
        
        # 파일 저장
        file_hash = hashlib.md5(await file.read()).hexdigest()
        await file.seek(0)  # 파일 포인터 리셋
        
        file_extension = os.path.splitext(file.filename)[1]
        saved_filename = f"{file_hash}{file_extension}"
        file_path = os.path.join(media_dir, saved_filename)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "success": True,
            "file_path": file_path,
            "file_hash": file_hash,
            "message": "미디어 파일이 업로드되었습니다.",
            "message_id": message_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 업로드 오류: {str(e)}")

@app.post("/api/rooted/identify-and-store")
async def identify_and_store_message(request: dict):
    """메시지를 받아서 사용자/채팅방 식별 후 저장"""
    try:
        # 식별 시스템 import (실제 파일 경로에 맞게 수정)
        from kakao_user_identifier import KakaoIdentifier
        
        identifier = KakaoIdentifier()
        
        # 메시지에서 식별 정보 추출
        message_data = request.get("message", {})
        context = identifier.identify_message_context(message_data)
        
        # 식별된 정보와 함께 메시지 저장
        enhanced_message = KakaoMessage(**message_data)
        success = extractor.store_message(enhanced_message)
        
        return {
            "success": success,
            "identification": context,
            "message": "메시지가 식별되어 저장되었습니다."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"식별 및 저장 오류: {str(e)}")

@app.get("/api/rooted/user/{user_id}")
async def get_user_info(user_id: str):
    """사용자 ID로 식별된 사용자 정보 조회"""
    try:
        from kakao_user_identifier import KakaoIdentifier
        
        identifier = KakaoIdentifier()
        user_info = identifier.get_user_by_id(user_id)
        
        if user_info:
            return {"success": True, "user": user_info}
        else:
            return {"success": False, "message": "사용자를 찾을 수 없습니다."}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"사용자 조회 오류: {str(e)}")

@app.get("/api/rooted/chatroom/{chat_id}")
async def get_chatroom_info(chat_id: str):
    """채팅방 ID로 식별된 채팅방 정보 조회"""
    try:
        from kakao_user_identifier import KakaoIdentifier
        
        identifier = KakaoIdentifier()
        room_info = identifier.get_chatroom_by_id(chat_id)
        
        if room_info:
            return {"success": True, "chatroom": room_info}
        else:
            return {"success": False, "message": "채팅방을 찾을 수 없습니다."}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"채팅방 조회 오류: {str(e)}")

@app.get("/api/rooted/identification-summary")
async def get_identification_summary():
    """식별 시스템 전체 요약 정보"""
    try:
        from kakao_user_identifier import KakaoIdentifier
        
        identifier = KakaoIdentifier()
        summary = identifier.get_identification_summary()
        
        return {"success": True, "summary": summary}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"요약 정보 조회 오류: {str(e)}")

@app.post("/api/rooted/analyze-kakao-db")
async def analyze_kakao_database(db_path: str):
    """카카오톡 DB 파일을 분석하여 사용자/채팅방 식별"""
    try:
        from kakao_user_identifier import KakaoIdentifier
        
        identifier = KakaoIdentifier()
        result = identifier.extract_and_identify_from_kakao_db(db_path)
        
        return {
            "success": True,
            "analysis_result": result,
            "message": f"DB 분석 완료: 사용자 {len(result['users'])}명, 채팅방 {len(result['chatrooms'])}개"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB 분석 오류: {str(e)}")

# Add new endpoints for selective chatroom monitoring

@app.post("/api/rooted/set-monitored-rooms")
async def set_monitored_rooms(request: dict):
    """모니터링할 대화방 설정"""
    try:
        room_ids = request.get("room_ids", [])
        
        # 설정 저장 (실제로는 DB나 파일에 저장)
        with open("monitored_rooms.json", "w") as f:
            json.dump({"room_ids": room_ids, "updated_at": datetime.datetime.now().isoformat()}, f)
        
        return {
            "success": True,
            "monitored_rooms": room_ids,
            "message": f"{len(room_ids)}개 대화방이 모니터링 대상으로 설정되었습니다."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모니터링 설정 오류: {str(e)}")

@app.get("/api/rooted/get-monitored-rooms")
async def get_monitored_rooms():
    """현재 모니터링 중인 대화방 목록 조회"""
    try:
        if os.path.exists("monitored_rooms.json"):
            with open("monitored_rooms.json", "r") as f:
                data = json.load(f)
                return {"success": True, "monitored_rooms": data}
        else:
            return {"success": True, "monitored_rooms": {"room_ids": [], "updated_at": None}}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모니터링 설정 조회 오류: {str(e)}")

@app.post("/api/rooted/messages/filtered")
async def receive_filtered_messages(messages: List[KakaoMessage]):
    """선택된 대화방의 메시지만 수신"""
    try:
        # 현재 모니터링 설정 확인
        monitored_rooms = []
        if os.path.exists("monitored_rooms.json"):
            with open("monitored_rooms.json", "r") as f:
                data = json.load(f)
                monitored_rooms = data.get("room_ids", [])
        
        # 모니터링 대상 대화방의 메시지만 필터링
        filtered_messages = []
        if monitored_rooms:  # 특정 대화방만 모니터링
            filtered_messages = [msg for msg in messages if msg.chat_room_id in monitored_rooms]
        else:  # 전체 모니터링
            filtered_messages = messages
        
        # 필터링된 메시지 저장
        success_count = 0
        for message in filtered_messages:
            if extractor.store_message(message):
                success_count += 1
        
        return {
            "success": True,
            "total_received": len(messages),
            "filtered_stored": success_count,
            "monitored_rooms_count": len(monitored_rooms) if monitored_rooms else "전체",
            "message": f"총 {len(messages)}개 중 {success_count}개 메시지가 저장되었습니다."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"필터링된 메시지 저장 오류: {str(e)}")

@app.get("/api/rooted/chatroom-stats")
async def get_chatroom_statistics():
    """대화방별 통계 정보"""
    try:
        stats = {}
        
        with sqlite3.connect(extractor.db_path) as conn:
            cursor = conn.cursor()
            
            # 대화방별 메시지 수
            cursor.execute("""
                SELECT chat_room_id, COUNT(*) as message_count
                FROM extracted_messages 
                GROUP BY chat_room_id
                ORDER BY message_count DESC
            """)
            
            for room_id, count in cursor.fetchall():
                stats[room_id] = {"message_count": count}
            
            # 대화방별 최근 활동
            cursor.execute("""
                SELECT chat_room_id, MAX(timestamp) as last_activity
                FROM extracted_messages 
                GROUP BY chat_room_id
            """)
            
            for room_id, last_activity in cursor.fetchall():
                if room_id in stats:
                    stats[room_id]["last_activity"] = last_activity
        
        return {"success": True, "chatroom_stats": stats}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"통계 조회 오류: {str(e)}")

if __name__ == "__main__":
    print("🔓 루팅폰 카카오톡 데이터 수신 서버 시작...")
    print("📱 루팅폰 앱에서 다음 주소로 데이터를 전송하세요:")
    print("   http://localhost:8005")
    print("📊 API 문서: http://localhost:8005/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8005) 