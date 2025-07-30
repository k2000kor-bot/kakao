#!/usr/bin/env python3
"""
채팅 파일 업로드 서버 (중복 처리 포함)
"""

import os
import shutil
from datetime import datetime
from typing import List, Dict, Optional, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import sqlite3
from advanced_kakao_parser import AdvancedKakaoParser

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="채팅 파일 업로드 서버",
    description="카카오톡 대화 파일 업로드 및 중복 처리 서버",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 데이터베이스 초기화
def init_database():
    """데이터베이스 초기화"""
    conn = sqlite3.connect('chat_system.db')
    cursor = conn.cursor()
    
    # 업로드 로그 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS upload_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_name TEXT NOT NULL,
            chat_room_id TEXT NOT NULL,
            total_messages INTEGER,
            new_messages INTEGER,
            duplicate_messages INTEGER,
            upload_time TEXT NOT NULL,
            status TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# 요청/응답 모델
class UploadResponse(BaseModel):
    success: bool
    chat_room_id: str
    total_messages: int
    new_messages: int
    duplicate_messages: int
    message: str
    upload_time: str

class ChatRoomInfo(BaseModel):
    id: str
    name: str
    total_messages: int
    last_upload: str
    upload_count: int

@app.on_event("startup")
async def startup_event():
    """서버 시작 시 초기화"""
    init_database()
    logger.info("채팅 업로드 서버 시작")

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "service": "채팅 파일 업로드 서버",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "카카오톡 대화 파일 업로드",
            "중복 메시지 자동 제외",
            "채팅방별 메시지 관리",
            "업로드 통계 제공"
        ]
    }

@app.post("/api/upload-chat", response_model=UploadResponse)
async def upload_chat_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """채팅 파일 업로드"""
    
    try:
        # 파일 확장자 확인
        if not file.filename.endswith('.txt'):
            raise HTTPException(status_code=400, detail="텍스트 파일만 업로드 가능합니다")
        
        # 업로드 디렉토리 생성
        upload_dir = "chat_rooms"
        os.makedirs(upload_dir, exist_ok=True)
        
        # 파일 내용 읽기
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # 방 이름 추출
        lines = content_str.split('\n')
        room_name = lines[0].strip() if lines else "Unknown Room"
        
        # 채팅방 디렉토리 생성
        room_dir = os.path.join(upload_dir, room_name)
        os.makedirs(room_dir, exist_ok=True)
        
        # 파일 저장
        file_path = os.path.join(room_dir, file.filename)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content_str)
        
        # 고급 파서로 파싱 (중복 처리 포함)
        parser = AdvancedKakaoParser()
        room = parser.parse_chat_file(file_path, room_name)
        
        # 업로드 로그 저장
        background_tasks.add_task(save_upload_log, room_name, file.filename, room)
        
        return UploadResponse(
            success=True,
            chat_room_id=room_name,
            total_messages=room.total_messages,
            new_messages=room.new_messages,
            duplicate_messages=room.duplicate_messages,
            message=f"업로드 완료: {room.new_messages}개 새 메시지, {room.duplicate_messages}개 중복 제외",
            upload_time=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"파일 업로드 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def save_upload_log(chat_room_id: str, file_name: str, room: Any):
    """업로드 로그 저장"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO upload_logs 
            (file_name, chat_room_id, total_messages, new_messages, duplicate_messages, upload_time, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            file_name,
            chat_room_id,
            room.total_messages,
            room.new_messages,
            room.duplicate_messages,
            datetime.now().isoformat(),
            'success'
        ))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"업로드 로그 저장 오류: {e}")

@app.get("/api/chat-rooms")
async def get_chat_rooms():
    """채팅방 목록 조회"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        # 채팅방별 통계 조회
        cursor.execute('''
            SELECT 
                chat_room_id,
                COUNT(*) as total_messages,
                MAX(upload_time) as last_upload,
                COUNT(DISTINCT file_name) as upload_count
            FROM upload_logs 
            GROUP BY chat_room_id
        ''')
        
        rooms = []
        for row in cursor.fetchall():
            rooms.append(ChatRoomInfo(
                id=row[0],
                name=row[0],
                total_messages=row[1],
                last_upload=row[2],
                upload_count=row[3]
            ))
        
        conn.close()
        
        return {
            "success": True,
            "chat_rooms": [room.dict() for room in rooms]
        }
        
    except Exception as e:
        logger.error(f"채팅방 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "chat_rooms": []
        }

@app.get("/api/chat-rooms/{chat_room_id}/statistics")
async def get_chat_room_statistics(chat_room_id: str):
    """채팅방 통계 조회"""
    try:
        parser = AdvancedKakaoParser()
        stats = parser.get_duplicate_statistics(chat_room_id)
        
        # 업로드 로그 조회
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                COUNT(*) as total_uploads,
                SUM(new_messages) as total_new_messages,
                SUM(duplicate_messages) as total_duplicate_messages,
                MAX(upload_time) as last_upload
            FROM upload_logs 
            WHERE chat_room_id = ?
        ''', (chat_room_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        return {
            "success": True,
            "chat_room_id": chat_room_id,
            "stored_messages": stats['total_stored_messages'],
            "total_uploads": row[0] if row else 0,
            "total_new_messages": row[1] if row and row[1] else 0,
            "total_duplicate_messages": row[2] if row and row[2] else 0,
            "last_upload": row[3] if row else None,
            "last_updated": stats['last_updated']
        }
        
    except Exception as e:
        logger.error(f"통계 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/upload-logs")
async def get_upload_logs():
    """업로드 로그 조회"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                file_name, chat_room_id, total_messages, new_messages, 
                duplicate_messages, upload_time, status
            FROM upload_logs 
            ORDER BY upload_time DESC
        ''')
        
        logs = []
        for row in cursor.fetchall():
            logs.append({
                'file_name': row[0],
                'chat_room_id': row[1],
                'total_messages': row[2],
                'new_messages': row[3],
                'duplicate_messages': row[4],
                'upload_time': row[5],
                'status': row[6]
            })
        
        conn.close()
        
        return {
            "success": True,
            "logs": logs
        }
        
    except Exception as e:
        logger.error(f"업로드 로그 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "logs": []
        }

if __name__ == "__main__":
    import uvicorn
    print("🚀 채팅 파일 업로드 서버 시작")
    print("=" * 50)
    print("📍 서버 주소: http://localhost:8005")
    print("📖 API 문서: http://localhost:8005/docs")
    print("🎯 주요 엔드포인트:")
    print("   POST /api/upload-chat - 파일 업로드")
    print("   GET /api/chat-rooms - 채팅방 목록")
    print("   GET /api/upload-logs - 업로드 로그")
    print("")
    
    try:
        uvicorn.run(app, host="0.0.0.0", port=8004, log_level="info")
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}") 