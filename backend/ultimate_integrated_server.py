#!/usr/bin/env python3
"""
카카오톡 AI 분석 시스템 - 통합 서버
모든 기능을 하나의 서버에서 제공
"""

import os
import sys
import sqlite3
import json
import hashlib
import shutil
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pathlib import Path
import re
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# 프로젝트 루트 경로 설정
PROJECT_ROOT = Path(__file__).parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
CHAT_ROOMS_DIR = PROJECT_ROOT / "chat_rooms"
PROCESSED_DIR = BACKEND_DIR / "processed"

# 데이터베이스 경로
DB_PATH = BACKEND_DIR / "ultimate_system.db"

# 서버 설정
PORT = 8000
HOST = "0.0.0.0"

class ChatRoom(BaseModel):
    id: str
    name: str
    message_count: int
    last_activity: str
    is_active: bool
    participants: List[str]

class Message(BaseModel):
    id: str
    sender: str
    content: str
    timestamp: str
    is_deleted: bool = False
    has_media: bool = False
    is_duplicate: bool = False

class UploadResponse(BaseModel):
    success: bool
    message: str
    room_id: Optional[str] = None
    message_count: Optional[int] = None

class MessageGenerationRequest(BaseModel):
    purpose: str
    selected_formats: List[str]
    context: Optional[str] = None

class MessageGenerationResponse(BaseModel):
    success: bool
    messages: List[str]
    analysis: Optional[Dict[str, Any]] = None

# 데이터베이스 초기화
def init_database():
    """데이터베이스 초기화"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 채팅방 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_rooms (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            message_count INTEGER DEFAULT 0,
            last_activity TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 메시지 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            room_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            is_deleted BOOLEAN DEFAULT FALSE,
            has_media BOOLEAN DEFAULT FALSE,
            is_duplicate BOOLEAN DEFAULT FALSE,
            message_hash TEXT UNIQUE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES chat_rooms (id)
        )
    ''')
    
    # 참여자 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_id TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES chat_rooms (id)
        )
    ''')
    
    # 업로드 로그 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS upload_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_name TEXT NOT NULL,
            room_id TEXT NOT NULL,
            message_count INTEGER DEFAULT 0,
            duplicate_count INTEGER DEFAULT 0,
            upload_time TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES chat_rooms (id)
        )
    ''')
    
    # 메시지 해시 테이블 (중복 방지)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS message_hashes (
            hash TEXT PRIMARY KEY,
            room_id TEXT NOT NULL,
            message_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"✅ 데이터베이스 초기화 완료: {DB_PATH}")

# 카카오톡 파서
class KakaoChatParser:
    def __init__(self):
        self.message_pattern = re.compile(
            r'^(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2}), (.+?) : (.+)$',
            re.MULTILINE
        )
    
    def parse_chat_file(self, file_path: str) -> Dict[str, Any]:
        """카카오톡 채팅 파일 파싱"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 파일명에서 채팅방 이름 추출
            room_name = Path(file_path).stem
            
            messages = []
            participants = set()
            
            for match in self.message_pattern.finditer(content):
                year, month, day, ampm, hour, minute, sender, content = match.groups()
                
                # 시간 변환
                hour = int(hour)
                if ampm == "오후" and hour != 12:
                    hour += 12
                elif ampm == "오전" and hour == 12:
                    hour = 0
                
                timestamp = datetime(int(year), int(month), int(day), hour, int(minute))
                
                # 메시지 해시 생성 (중복 방지)
                message_hash = hashlib.md5(f"{timestamp.isoformat()}_{sender}_{content}".encode()).hexdigest()
                
                messages.append({
                    'sender': sender,
                    'content': content,
                    'timestamp': timestamp.isoformat(),
                    'message_hash': message_hash
                })
                
                participants.add(sender)
            
            return {
                'room_name': room_name,
                'messages': messages,
                'participants': list(participants),
                'message_count': len(messages)
            }
            
        except Exception as e:
            raise Exception(f"파일 파싱 오류: {str(e)}")

# 메시지 중복 체크
def check_duplicate_message(cursor, room_id: str, message_hash: str) -> bool:
    """메시지 중복 체크"""
    cursor.execute(
        "SELECT 1 FROM message_hashes WHERE hash = ? AND room_id = ?",
        (message_hash, room_id)
    )
    return cursor.fetchone() is not None

# 파일 업로드 처리
async def process_chat_file(file_path: str, room_id: str) -> Dict[str, Any]:
    """채팅 파일 처리"""
    parser = KakaoChatParser()
    chat_data = parser.parse_chat_file(file_path)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 채팅방 정보 저장/업데이트
        cursor.execute('''
            INSERT OR REPLACE INTO chat_rooms (id, name, message_count, last_activity, is_active)
            VALUES (?, ?, ?, ?, ?)
        ''', (room_id, chat_data['room_name'], chat_data['message_count'], 
              datetime.now().isoformat(), True))
        
        # 참여자 정보 저장
        for participant in chat_data['participants']:
            cursor.execute('''
                INSERT OR IGNORE INTO participants (room_id, name)
                VALUES (?, ?)
            ''', (room_id, participant))
        
        # 메시지 저장 (중복 제외)
        new_messages = 0
        duplicate_count = 0
        
        for msg in chat_data['messages']:
            if not check_duplicate_message(cursor, room_id, msg['message_hash']):
                # 새 메시지 저장
                message_id = f"{room_id}_msg_{new_messages}"
                cursor.execute('''
                    INSERT INTO messages (id, room_id, sender, content, timestamp, message_hash)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (message_id, room_id, msg['sender'], msg['content'], 
                      msg['timestamp'], msg['message_hash']))
                
                # 해시 저장
                cursor.execute('''
                    INSERT INTO message_hashes (hash, room_id, message_id)
                    VALUES (?, ?, ?)
                ''', (msg['message_hash'], room_id, message_id))
                
                new_messages += 1
            else:
                duplicate_count += 1
        
        # 업로드 로그 저장
        cursor.execute('''
            INSERT INTO upload_logs (file_name, room_id, message_count, duplicate_count)
            VALUES (?, ?, ?, ?)
        ''', (Path(file_path).name, room_id, new_messages, duplicate_count))
        
        conn.commit()
        
        return {
            'success': True,
            'new_messages': new_messages,
            'duplicate_count': duplicate_count,
            'total_messages': len(chat_data['messages'])
        }
        
    except Exception as e:
        conn.rollback()
        raise Exception(f"데이터베이스 저장 오류: {str(e)}")
    finally:
        conn.close()

# FastAPI 앱 생성
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 시작 시 실행
    init_database()
    print(f"🚀 통합 서버 시작: http://{HOST}:{PORT}")
    print(f"📖 API 문서: http://{HOST}:{PORT}/docs")
    yield
    # 종료 시 실행
    print("🛑 서버 종료")

app = FastAPI(
    title="카카오톡 AI 분석 시스템 - 통합 서버",
    description="모든 기능을 통합한 카카오톡 분석 시스템",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 헬스 체크
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# 채팅방 목록 조회
@app.get("/api/v7/chat-rooms")
async def get_chat_rooms():
    """채팅방 목록 조회"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, message_count, last_activity, is_active
            FROM chat_rooms
            ORDER BY last_activity DESC
        ''')
        
        rooms = []
        for row in cursor.fetchall():
            room_id, name, message_count, last_activity, is_active = row
            
            # 참여자 목록 조회
            cursor.execute('''
                SELECT name FROM participants WHERE room_id = ?
            ''', (room_id,))
            participants = [p[0] for p in cursor.fetchall()]
            
            rooms.append({
                'id': room_id,
                'name': name,
                'messageCount': message_count,
                'lastActivity': last_activity,
                'isActive': bool(is_active),
                'participants': participants
            })
        
        conn.close()
        
        return {
            "success": True,
            "chat_rooms": rooms,
            "sync_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

# 채팅방 메시지 조회
@app.get("/api/v7/chat-messages/{room_id}")
async def get_chat_messages(room_id: str, limit: int = 1000, offset: int = 0):
    """채팅방 메시지 조회"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # 메시지 조회
        cursor.execute('''
            SELECT id, sender, content, timestamp, is_deleted, has_media, is_duplicate
            FROM messages
            WHERE room_id = ?
            ORDER BY timestamp ASC
            LIMIT ? OFFSET ?
        ''', (room_id, limit, offset))
        
        messages = []
        for row in cursor.fetchall():
            msg_id, sender, content, timestamp, is_deleted, has_media, is_duplicate = row
            messages.append({
                'id': msg_id,
                'sender': sender,
                'content': content,
                'timestamp': timestamp,
                'is_deleted': bool(is_deleted),
                'has_media': bool(has_media),
                'is_duplicate': bool(is_duplicate)
            })
        
        conn.close()
        
        return {
            "success": True,
            "messages": messages,
            "total": len(messages)
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

# 파일 업로드
@app.post("/api/upload-chat")
async def upload_chat_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """카카오톡 채팅 파일 업로드"""
    try:
        # 파일 저장
        upload_dir = PROCESSED_DIR / "uploads"
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = upload_dir / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 채팅방 ID 생성
        room_id = Path(file.filename).stem
        
        # 백그라운드에서 파일 처리
        background_tasks.add_task(process_chat_file, str(file_path), room_id)
        
        return {
            "success": True,
            "message": "파일 업로드 완료. 처리 중입니다...",
            "room_id": room_id
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

# 메시지 생성
@app.post("/api/generate-message")
async def generate_message(request: MessageGenerationRequest):
    """AI 메시지 생성"""
    try:
        # 간단한 메시지 생성 로직
        purpose = request.purpose
        formats = request.selected_formats
        
        messages = []
        
        if "constructive" in formats:
            messages.append(f"건설적인 관점에서 {purpose}에 대해 생각해보면...")
        
        if "critical" in formats:
            messages.append(f"비판적으로 접근하면 {purpose}의 문제점은...")
        
        if "neutral" in formats:
            messages.append(f"중립적인 입장에서 {purpose}를 바라보면...")
        
        if not messages:
            messages.append(f"{purpose}에 대한 메시지를 생성했습니다.")
        
        return {
            "success": True,
            "messages": messages,
            "analysis": {
                "purpose": purpose,
                "formats_used": formats,
                "generated_count": len(messages)
            }
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

# 시스템 상태
@app.get("/api/status")
async def get_system_status():
    """시스템 상태 조회"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # 통계 조회
        cursor.execute("SELECT COUNT(*) FROM chat_rooms")
        room_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM messages")
        message_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT room_id) FROM participants")
        participant_count = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "success": True,
            "status": "running",
            "timestamp": datetime.now().isoformat(),
            "statistics": {
                "chat_rooms": room_count,
                "total_messages": message_count,
                "total_participants": participant_count
            }
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

if __name__ == "__main__":
    print("🚀 카카오톡 AI 분석 시스템 - 통합 서버 시작")
    print("=" * 50)
    print(f"📍 서버 주소: http://{HOST}:{PORT}")
    print(f"📖 API 문서: http://{HOST}:{PORT}/docs")
    print("🎯 주요 엔드포인트:")
    print("   GET  /api/v7/chat-rooms - 채팅방 목록")
    print("   GET  /api/v7/chat-messages/{room_id} - 메시지 조회")
    print("   POST /api/upload-chat - 파일 업로드")
    print("   POST /api/generate-message - 메시지 생성")
    print("   GET  /api/status - 시스템 상태")
    print("=" * 50)
    
    uvicorn.run(app, host=HOST, port=PORT) 