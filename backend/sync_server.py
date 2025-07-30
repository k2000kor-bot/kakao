#!/usr/bin/env python3
"""
동기화 전용 서버
채팅방 동기화와 미디어 파일 분류 기능만 포함
"""

import os
import json
import shutil
import hashlib
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import sqlite3

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="동기화 서버",
    description="채팅방 동기화 전용 API 서버",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 초기화
def init_sync_database():
    """동기화용 데이터베이스 초기화"""
    conn = sqlite3.connect('sync_system.db')
    cursor = conn.cursor()
    
    # 채팅방 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_rooms (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            message_count INTEGER DEFAULT 0,
            last_activity TEXT,
            is_active BOOLEAN DEFAULT 1,
            participants TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    ''')
    
    # 메시지 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            chat_room_id TEXT,
            content TEXT NOT NULL,
            sender TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            emotion TEXT,
            sentiment REAL,
            keywords TEXT,
            created_at TEXT,
            FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
        )
    ''')
    
    # 미디어 파일 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS media_files (
            id TEXT PRIMARY KEY,
            chat_room_id TEXT,
            original_path TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER,
            hash_value TEXT,
            processed_path TEXT,
            created_at TEXT,
            FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
        )
    ''')
    
    # 동기화 로그 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sync_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            chat_room_id TEXT,
            details TEXT,
            created_at TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# 파일 해시 생성
def get_file_hash(file_path):
    """파일의 해시값 생성"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

# 카카오톡 대화 파일 파싱
def parse_kakao_chat(file_path):
    """카카오톡 대화 파일 파싱"""
    messages = []
    participants = set()
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # 카카오톡 메시지 형식 파싱
            if '[' in line and ']' in line and ':' in line:
                try:
                    # 시간 부분 추출
                    time_start = line.find('[')
                    time_end = line.find(']')
                    if time_start != -1 and time_end != -1:
                        timestamp = line[time_start+1:time_end]
                        
                        # 나머지 부분에서 발신자와 메시지 분리
                        content_part = line[time_end+1:].strip()
                        if ':' in content_part:
                            sender, message = content_part.split(':', 1)
                            sender = sender.strip()
                            message = message.strip()
                            
                            if sender and message:
                                participants.add(sender)
                                messages.append({
                                    'sender': sender,
                                    'content': message,
                                    'timestamp': timestamp
                                })
                except Exception as e:
                    logger.warning(f"메시지 파싱 오류: {line}, {e}")
                    continue
    except Exception as e:
        logger.error(f"파일 파싱 오류: {file_path}, {e}")
    
    return messages, list(participants)

# 미디어 파일 분류
def classify_media_files(chat_room_path):
    """미디어 파일 자동 분류"""
    media_files = []
    chat_room_id = os.path.basename(chat_room_path)
    
    # 미디어 폴더 경로
    media_path = os.path.join(chat_room_path, '미디어')
    if not os.path.exists(media_path):
        return media_files
    
    # 파일 타입별 분류
    file_types = {
        'images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
        'videos': ['.mp4', '.avi', '.mov', '.mkv'],
        'audios': ['.mp3', '.wav', '.m4a'],
        'documents': ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx']
    }
    
    for root, dirs, files in os.walk(media_path):
        for file in files:
            file_path = os.path.join(root, file)
            file_ext = os.path.splitext(file)[1].lower()
            
            # 파일 타입 결정
            file_type = 'unknown'
            for type_name, extensions in file_types.items():
                if file_ext in extensions:
                    file_type = type_name
                    break
            
            # 파일 정보 수집
            file_size = os.path.getsize(file_path)
            file_hash = get_file_hash(file_path)
            
            # 처리된 경로 생성
            processed_dir = os.path.join('processed', 'media', file_type)
            os.makedirs(processed_dir, exist_ok=True)
            
            processed_path = os.path.join(processed_dir, f"{file_hash}{file_ext}")
            
            # 파일 복사 (중복 방지)
            if not os.path.exists(processed_path):
                shutil.copy2(file_path, processed_path)
            
            media_files.append({
                'id': file_hash,
                'chat_room_id': chat_room_id,
                'original_path': file_path,
                'file_type': file_type,
                'file_size': file_size,
                'hash_value': file_hash,
                'processed_path': processed_path
            })
    
    return media_files

# 채팅방 동기화
def sync_chat_rooms():
    """채팅방 자동 동기화"""
    chat_rooms_path = 'chat_rooms'
    if not os.path.exists(chat_rooms_path):
        logger.warning(f"채팅방 폴더가 없습니다: {chat_rooms_path}")
        return []
    
    conn = sqlite3.connect('sync_system.db')
    cursor = conn.cursor()
    
    synced_rooms = []
    
    for room_folder in os.listdir(chat_rooms_path):
        room_path = os.path.join(chat_rooms_path, room_folder)
        if not os.path.isdir(room_path):
            continue
        
        # 채팅방 ID 생성
        room_id = room_folder
        
        # 채팅 파일 찾기
        chat_files = []
        for file in os.listdir(room_path):
            if file.endswith('.txt'):
                chat_files.append(os.path.join(room_path, file))
        
        if not chat_files:
            continue
        
        # 가장 최근 파일 사용
        latest_chat_file = max(chat_files, key=os.path.getmtime)
        
        # 파일 해시 확인
        file_hash = get_file_hash(latest_chat_file)
        
        # 데이터베이스에서 기존 정보 확인
        cursor.execute('''
            SELECT id, message_count, last_activity, updated_at 
            FROM chat_rooms 
            WHERE id = ?
        ''', (room_id,))
        
        existing_room = cursor.fetchone()
        
        if existing_room:
            # 기존 채팅방 업데이트 확인
            last_update = existing_room[3]
            if last_update and os.path.getmtime(latest_chat_file) <= datetime.fromisoformat(last_update).timestamp():
                # 변경사항 없음
                cursor.execute('''
                    SELECT * FROM chat_rooms WHERE id = ?
                ''', (room_id,))
                room_data = cursor.fetchone()
                synced_rooms.append({
                    'id': room_data[0],
                    'name': room_data[1],
                    'messageCount': room_data[2],
                    'lastActivity': room_data[3],
                    'isActive': bool(room_data[4]),
                    'participants': room_data[5].split(',') if room_data[5] else []
                })
                continue
        
        # 새로운 채팅방 또는 업데이트
        messages, participants = parse_kakao_chat(latest_chat_file)
        
        # 미디어 파일 분류
        media_files = classify_media_files(room_path)
        
        # 데이터베이스 업데이트
        now = datetime.now().isoformat()
        
        if existing_room:
            # 기존 채팅방 업데이트
            cursor.execute('''
                UPDATE chat_rooms 
                SET message_count = ?, last_activity = ?, updated_at = ?
                WHERE id = ?
            ''', (len(messages), now, now, room_id))
            
            # 기존 메시지 삭제
            cursor.execute('DELETE FROM messages WHERE chat_room_id = ?', (room_id,))
            
            # 동기화 로그
            cursor.execute('''
                INSERT INTO sync_logs (action, chat_room_id, details, created_at)
                VALUES (?, ?, ?, ?)
            ''', ('update', room_id, f'Updated {len(messages)} messages', now))
        else:
            # 새로운 채팅방 추가
            cursor.execute('''
                INSERT INTO chat_rooms (id, name, message_count, last_activity, participants, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (room_id, room_folder, len(messages), now, ','.join(participants), now, now))
            
            # 동기화 로그
            cursor.execute('''
                INSERT INTO sync_logs (action, chat_room_id, details, created_at)
                VALUES (?, ?, ?, ?)
            ''', ('create', room_id, f'Created with {len(messages)} messages', now))
        
        # 메시지 저장
        for i, msg in enumerate(messages):
            message_id = f"{room_id}_msg_{i}"
            cursor.execute('''
                INSERT INTO messages (id, chat_room_id, content, sender, timestamp, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (message_id, room_id, msg['content'], msg['sender'], msg['timestamp'], now))
        
        # 미디어 파일 저장
        for media in media_files:
            cursor.execute('''
                INSERT OR REPLACE INTO media_files 
                (id, chat_room_id, original_path, file_type, file_size, hash_value, processed_path, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (media['id'], media['chat_room_id'], media['original_path'], 
                  media['file_type'], media['file_size'], media['hash_value'], 
                  media['processed_path'], now))
        
        synced_rooms.append({
            'id': room_id,
            'name': room_folder,
            'messageCount': len(messages),
            'lastActivity': now,
            'isActive': True,
            'participants': participants
        })
        
        logger.info(f"채팅방 동기화 완료: {room_id} ({len(messages)}개 메시지, {len(media_files)}개 미디어)")
    
    conn.commit()
    conn.close()
    
    return synced_rooms

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "동기화 서버",
        "version": "1.0.0",
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "채팅방 자동 동기화",
            "미디어 파일 분류",
            "데이터베이스 관리",
            "동기화 로그"
        ]
    }

@app.get("/api/chat-rooms")
async def get_chat_rooms():
    """채팅방 목록 조회"""
    try:
        # 동기화 실행
        synced_rooms = sync_chat_rooms()
        
        return {
            "success": True,
            "chat_rooms": synced_rooms,
            "sync_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"채팅방 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "chat_rooms": []
        }

@app.get("/api/chat-messages/{chat_room_id}")
async def get_chat_messages(chat_room_id: str):
    """채팅 메시지 조회"""
    try:
        conn = sqlite3.connect('sync_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, content, sender, timestamp, emotion, sentiment, keywords
            FROM messages 
            WHERE chat_room_id = ?
            ORDER BY timestamp
        ''', (chat_room_id,))
        
        messages = []
        for row in cursor.fetchall():
            messages.append({
                'id': row[0],
                'content': row[1],
                'sender': row[2],
                'timestamp': row[3],
                'emotion': row[4],
                'sentiment': row[5],
                'keywords': row[6].split(',') if row[6] else []
            })
        
        conn.close()
        
        return {
            "success": True,
            "messages": messages
        }
    except Exception as e:
        logger.error(f"메시지 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "messages": []
        }

@app.get("/api/media-files/{chat_room_id}")
async def get_media_files(chat_room_id: str):
    """미디어 파일 조회"""
    try:
        conn = sqlite3.connect('sync_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, file_type, file_size, processed_path, created_at
            FROM media_files 
            WHERE chat_room_id = ?
            ORDER BY created_at
        ''', (chat_room_id,))
        
        media_files = []
        for row in cursor.fetchall():
            media_files.append({
                'id': row[0],
                'file_type': row[1],
                'file_size': row[2],
                'processed_path': row[3],
                'created_at': row[4]
            })
        
        conn.close()
        
        return {
            "success": True,
            "media_files": media_files
        }
    except Exception as e:
        logger.error(f"미디어 파일 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "media_files": []
        }

@app.post("/api/sync")
async def manual_sync():
    """수동 동기화 실행"""
    try:
        synced_rooms = sync_chat_rooms()
        
        return {
            "success": True,
            "synced_rooms": len(synced_rooms),
            "details": [room['name'] for room in synced_rooms],
            "sync_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"동기화 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/sync-status")
async def get_sync_status():
    """동기화 상태 확인"""
    try:
        conn = sqlite3.connect('sync_system.db')
        cursor = conn.cursor()
        
        # 최근 동기화 로그 조회
        cursor.execute('''
            SELECT action, chat_room_id, details, created_at
            FROM sync_logs 
            ORDER BY created_at DESC 
            LIMIT 10
        ''')
        
        recent_logs = []
        for row in cursor.fetchall():
            recent_logs.append({
                'action': row[0],
                'chat_room_id': row[1],
                'details': row[2],
                'created_at': row[3]
            })
        
        # 통계 정보
        cursor.execute('SELECT COUNT(*) FROM chat_rooms')
        total_rooms = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM messages')
        total_messages = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM media_files')
        total_media = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "success": True,
            "total_rooms": total_rooms,
            "total_messages": total_messages,
            "total_media": total_media,
            "recent_logs": recent_logs,
            "last_sync": recent_logs[0]['created_at'] if recent_logs else None
        }
    except Exception as e:
        logger.error(f"동기화 상태 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# 서버 시작
if __name__ == "__main__":
    print("🚀 동기화 서버 시작")
    print("=" * 50)
    print("📍 서버 주소: http://localhost:8002")
    print("📖 API 문서: http://localhost:8002/docs")
    print("🎯 주요 엔드포인트:")
    print("   GET /api/chat-rooms - 채팅방 목록")
    print("   GET /api/chat-messages/{id} - 메시지 조회")
    print("   GET /api/media-files/{id} - 미디어 파일 조회")
    print("   POST /api/sync - 수동 동기화")
    print("   GET /api/sync-status - 동기화 상태")
    print("")
    
    try:
        # 데이터베이스 초기화
        init_sync_database()
        print("✅ 동기화 데이터베이스 초기화 완료")
        
        # 서버 시작
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8002, log_level="info")
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 