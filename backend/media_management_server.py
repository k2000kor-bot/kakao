#!/usr/bin/env python3
"""
미디어 관리 전용 서버
미디어 파일 처리, 분류, 저장 기능만 포함
"""

import os
import json
import shutil
import hashlib
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import sqlite3
from pathlib import Path

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="미디어 관리 서버",
    description="미디어 파일 관리 전용 API 서버",
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
def init_media_database():
    """미디어 관리용 데이터베이스 초기화"""
    conn = sqlite3.connect('media_system.db')
    cursor = conn.cursor()
    
    # 미디어 파일 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS media_files (
            id TEXT PRIMARY KEY,
            chat_room_id TEXT NOT NULL,
            original_path TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER,
            hash_value TEXT UNIQUE,
            processed_path TEXT,
            thumbnail_path TEXT,
            metadata TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 미디어 분류 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS media_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_id TEXT NOT NULL,
            category TEXT NOT NULL,
            confidence REAL,
            tags TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (file_id) REFERENCES media_files (id)
        )
    ''')
    
    # 미디어 처리 로그 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS media_processing_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_id TEXT NOT NULL,
            action TEXT NOT NULL,
            status TEXT NOT NULL,
            details TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# 요청 모델
class MediaUploadRequest(BaseModel):
    chat_room_id: str
    file_type: str
    description: Optional[str] = ""

class MediaSearchRequest(BaseModel):
    chat_room_id: Optional[str] = None
    file_type: Optional[str] = None
    category: Optional[str] = None
    date_range: Optional[Dict[str, str]] = None

# 응답 모델
class MediaFile(BaseModel):
    id: str
    chat_room_id: str
    original_path: str
    file_type: str
    file_size: int
    processed_path: Optional[str]
    thumbnail_path: Optional[str]
    metadata: Dict[str, Any]
    created_at: str

class MediaCategory(BaseModel):
    category: str
    confidence: float
    tags: List[str]

class MediaProcessingResult(BaseModel):
    success: bool
    file_id: str
    processed_path: str
    thumbnail_path: Optional[str]
    categories: List[MediaCategory]
    processing_time: float

# 파일 해시 생성
def get_file_hash(file_path: str) -> str:
    """파일의 해시값 생성"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

# 파일 타입 분류
def classify_file_type(filename: str) -> str:
    """파일 타입 분류"""
    ext = Path(filename).suffix.lower()
    
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv']
    audio_extensions = ['.mp3', '.wav', '.m4a', '.aac', '.flac']
    document_extensions = ['.pdf', '.doc', '.docx', '.txt', '.md', '.csv', '.xls', '.xlsx', '.ppt', '.pptx']
    
    if ext in image_extensions:
        return 'image'
    elif ext in video_extensions:
        return 'video'
    elif ext in audio_extensions:
        return 'audio'
    elif ext in document_extensions:
        return 'document'
    else:
        return 'unknown'

# 미디어 파일 처리
def process_media_file(file_path: str, chat_room_id: str) -> MediaProcessingResult:
    """미디어 파일 처리"""
    start_time = datetime.now()
    
    # 파일 정보 수집
    file_size = os.path.getsize(file_path)
    file_hash = get_file_hash(file_path)
    file_type = classify_file_type(file_path)
    
    # 처리된 경로 생성
    processed_dir = os.path.join('processed', 'media', file_type)
    os.makedirs(processed_dir, exist_ok=True)
    
    processed_path = os.path.join(processed_dir, f"{file_hash}{Path(file_path).suffix}")
    
    # 파일 복사 (중복 방지)
    if not os.path.exists(processed_path):
        shutil.copy2(file_path, processed_path)
    
    # 썸네일 생성 (이미지인 경우)
    thumbnail_path = None
    if file_type == 'image':
        thumbnail_dir = os.path.join('processed', 'thumbnails')
        os.makedirs(thumbnail_dir, exist_ok=True)
        thumbnail_path = os.path.join(thumbnail_dir, f"thumb_{file_hash}.jpg")
        
        # 간단한 썸네일 생성 (실제로는 PIL 사용)
        if not os.path.exists(thumbnail_path):
            shutil.copy2(processed_path, thumbnail_path)
    
    # 카테고리 분류
    categories = []
    if file_type == 'image':
        categories.append(MediaCategory(
            category='image',
            confidence=0.95,
            tags=['visual', 'media']
        ))
    elif file_type == 'video':
        categories.append(MediaCategory(
            category='video',
            confidence=0.90,
            tags=['motion', 'media']
        ))
    elif file_type == 'audio':
        categories.append(MediaCategory(
            category='audio',
            confidence=0.85,
            tags=['sound', 'media']
        ))
    elif file_type == 'document':
        categories.append(MediaCategory(
            category='document',
            confidence=0.80,
            tags=['text', 'information']
        ))
    
    # 메타데이터 생성
    metadata = {
        'original_filename': Path(file_path).name,
        'file_type': file_type,
        'file_size': file_size,
        'hash': file_hash,
        'processed': True,
        'thumbnail_available': thumbnail_path is not None
    }
    
    processing_time = (datetime.now() - start_time).total_seconds()
    
    return MediaProcessingResult(
        success=True,
        file_id=file_hash,
        processed_path=processed_path,
        thumbnail_path=thumbnail_path,
        categories=categories,
        processing_time=processing_time
    )

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "미디어 관리 서버",
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
            "미디어 파일 처리",
            "자동 분류",
            "썸네일 생성",
            "중복 방지",
            "메타데이터 관리"
        ]
    }

@app.post("/api/upload-media")
async def upload_media(file: UploadFile = File(...), chat_room_id: str = None):
    """미디어 파일 업로드"""
    try:
        if not chat_room_id:
            raise HTTPException(status_code=400, detail="chat_room_id가 필요합니다")
        
        # 임시 파일 저장
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 파일 처리
        processing_result = process_media_file(temp_path, chat_room_id)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('media_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO media_files 
            (id, chat_room_id, original_path, file_type, file_size, 
             hash_value, processed_path, thumbnail_path, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            processing_result.file_id,
            chat_room_id,
            temp_path,
            classify_file_type(file.filename),
            os.path.getsize(temp_path),
            processing_result.file_id,
            processing_result.processed_path,
            processing_result.thumbnail_path,
            json.dumps(processing_result.metadata),
            datetime.now().isoformat()
        ))
        
        # 카테고리 정보 저장
        for category in processing_result.categories:
            cursor.execute('''
                INSERT INTO media_categories 
                (file_id, category, confidence, tags, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                processing_result.file_id,
                category.category,
                category.confidence,
                ','.join(category.tags),
                datetime.now().isoformat()
            ))
        
        # 처리 로그 저장
        cursor.execute('''
            INSERT INTO media_processing_logs 
            (file_id, action, status, details, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            processing_result.file_id,
            'upload',
            'success',
            f'파일 처리 완료: {processing_result.processing_time:.2f}초',
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        # 임시 파일 삭제
        os.remove(temp_path)
        
        return {
            "success": True,
            "file_id": processing_result.file_id,
            "processed_path": processing_result.processed_path,
            "thumbnail_path": processing_result.thumbnail_path,
            "categories": [cat.dict() for cat in processing_result.categories],
            "processing_time": processing_result.processing_time
        }
        
    except Exception as e:
        logger.error(f"미디어 업로드 오류: {e}")
        raise HTTPException(status_code=500, detail=f"미디어 업로드 실패: {str(e)}")

@app.get("/api/media-files/{chat_room_id}")
async def get_media_files(chat_room_id: str):
    """대화방의 미디어 파일 조회"""
    try:
        conn = sqlite3.connect('media_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, original_path, file_type, file_size, processed_path, 
                   thumbnail_path, metadata, created_at
            FROM media_files 
            WHERE chat_room_id = ?
            ORDER BY created_at DESC
        ''', (chat_room_id,))
        
        media_files = []
        for row in cursor.fetchall():
            media_files.append({
                'id': row[0],
                'original_path': row[1],
                'file_type': row[2],
                'file_size': row[3],
                'processed_path': row[4],
                'thumbnail_path': row[5],
                'metadata': json.loads(row[6]) if row[6] else {},
                'created_at': row[7]
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

@app.post("/api/search-media")
async def search_media(request: MediaSearchRequest):
    """미디어 파일 검색"""
    try:
        conn = sqlite3.connect('media_system.db')
        cursor = conn.cursor()
        
        # 검색 조건 구성
        conditions = []
        params = []
        
        if request.chat_room_id:
            conditions.append("chat_room_id = ?")
            params.append(request.chat_room_id)
        
        if request.file_type:
            conditions.append("file_type = ?")
            params.append(request.file_type)
        
        if request.category:
            conditions.append("id IN (SELECT file_id FROM media_categories WHERE category = ?)")
            params.append(request.category)
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        cursor.execute(f'''
            SELECT id, chat_room_id, original_path, file_type, file_size, 
                   processed_path, thumbnail_path, metadata, created_at
            FROM media_files 
            WHERE {where_clause}
            ORDER BY created_at DESC
        ''', params)
        
        search_results = []
        for row in cursor.fetchall():
            search_results.append({
                'id': row[0],
                'chat_room_id': row[1],
                'original_path': row[2],
                'file_type': row[3],
                'file_size': row[4],
                'processed_path': row[5],
                'thumbnail_path': row[6],
                'metadata': json.loads(row[7]) if row[7] else {},
                'created_at': row[8]
            })
        
        conn.close()
        
        return {
            "success": True,
            "search_results": search_results,
            "total_count": len(search_results)
        }
        
    except Exception as e:
        logger.error(f"미디어 검색 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "search_results": []
        }

@app.get("/api/media-stats")
async def get_media_stats():
    """미디어 통계 조회"""
    try:
        conn = sqlite3.connect('media_system.db')
        cursor = conn.cursor()
        
        # 전체 파일 수
        cursor.execute('SELECT COUNT(*) FROM media_files')
        total_files = cursor.fetchone()[0]
        
        # 파일 타입별 통계
        cursor.execute('''
            SELECT file_type, COUNT(*) as count, SUM(file_size) as total_size
            FROM media_files 
            GROUP BY file_type
        ''')
        
        type_stats = {}
        for row in cursor.fetchall():
            type_stats[row[0]] = {
                'count': row[1],
                'total_size': row[2]
            }
        
        # 최근 업로드
        cursor.execute('''
            SELECT COUNT(*) FROM media_files 
            WHERE created_at >= datetime('now', '-7 days')
        ''')
        recent_uploads = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "success": True,
            "stats": {
                "total_files": total_files,
                "type_stats": type_stats,
                "recent_uploads": recent_uploads
            }
        }
        
    except Exception as e:
        logger.error(f"미디어 통계 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# 서버 시작
if __name__ == "__main__":
    _p = int(
        os.environ.get(
            "MEDIA_MANAGEMENT_SERVER_PORT", os.environ.get("PORT", "8006")
        )
    )
    print("🚀 미디어 관리 서버 시작")
    print("=" * 50)
    print(f"📍 서버 주소: http://localhost:{_p}")
    print(f"📖 API 문서: http://localhost:{_p}/docs")
    print("🎯 주요 엔드포인트:")
    print("   POST /api/upload-media - 미디어 업로드")
    print("   GET /api/media-files/{id} - 미디어 파일 조회")
    print("   POST /api/search-media - 미디어 검색")
    print("   GET /api/media-stats - 미디어 통계")
    print("")
    
    try:
        # 데이터베이스 초기화
        init_media_database()
        print("✅ 미디어 데이터베이스 초기화 완료")
        
        # 서버 시작
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=_p, log_level="info")
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 