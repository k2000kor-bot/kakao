"""
지속적 채팅 세션 관리 API
ChatGPT 5 수준의 고급 대화 인터페이스를 위한 백엔드 API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import sqlite3
import uuid
import json
import logging
from pathlib import Path

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Persistent Chat Session API",
    description="ChatGPT 5 수준의 지속적 채팅 세션 관리 API",
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

# 데이터베이스 경로
DB_PATH = Path(__file__).parent / "persistent_chat_sessions.db"

# Pydantic 모델들


class ChatSessionCreate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class ChatSessionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class MessageCreate(BaseModel):
    content: str
    role: str  # 'user' 또는 'assistant'
    sender: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ChatSession(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    tags: List[str]
    status: str
    created_at: datetime
    updated_at: datetime
    last_activity: datetime
    total_messages: int
    metadata: Dict[str, Any]
    is_archived: bool = False


class Message(BaseModel):
    id: str
    session_id: str
    content: str
    role: str
    sender: Optional[str] = None
    timestamp: datetime
    metadata: Dict[str, Any]
    is_bookmarked: bool = False


class SessionStats(BaseModel):
    total_sessions: int
    active_sessions: int
    archived_sessions: int
    total_messages: int
    average_messages_per_session: float
    most_active_session: Optional[str] = None

# 데이터베이스 초기화


def init_database():
    """데이터베이스 테이블 초기화"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 채팅 세션 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            tags TEXT,  -- JSON 배열로 저장
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            total_messages INTEGER DEFAULT 0,
            metadata TEXT,  -- JSON 객체로 저장
            is_archived BOOLEAN DEFAULT FALSE
        )
    """)
    
    # 메시지 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            content TEXT NOT NULL,
            role TEXT NOT NULL,
            sender TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metadata TEXT,  -- JSON 객체로 저장
            is_bookmarked BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (session_id) REFERENCES chat_sessions (id) 
            ON DELETE CASCADE
        )
    """)
    
    # 인덱스 생성
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_messages_session_id "
        "ON messages (session_id)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_messages_timestamp "
        "ON messages (timestamp)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_sessions_status "
        "ON chat_sessions (status)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_sessions_last_activity "
        "ON chat_sessions (last_activity)"
    )
    
    conn.commit()
    conn.close()
    logger.info("데이터베이스 초기화 완료")

# 데이터베이스 의존성


def get_db_connection():
    """데이터베이스 연결 반환"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# API 엔드포인트들


@app.on_event("startup")
async def startup_event():
    """앱 시작 시 데이터베이스 초기화"""
    init_database()


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Persistent Chat Session API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# 채팅 세션 관리 엔드포인트들


@app.post("/api/persistent-sessions", response_model=ChatSession)
async def create_persistent_session(session_data: ChatSessionCreate):
    """새로운 지속적 채팅 세션 생성"""
    session_id = str(uuid.uuid4())
    now = datetime.now()
    
    # 기본 제목 설정
    title = session_data.title or f"새 대화 {now.strftime('%Y-%m-%d %H:%M')}"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO chat_sessions 
            (id, title, description, tags, status, created_at, updated_at, 
             last_activity, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            title,
            session_data.description,
            json.dumps(session_data.tags or []),
            'active',
            now.isoformat(),
            now.isoformat(),
            now.isoformat(),
            json.dumps(session_data.metadata or {})
        ))
        
        conn.commit()
        
        # 생성된 세션 반환
        cursor.execute(
            "SELECT * FROM chat_sessions WHERE id = ?", (session_id,)
        )
        row = cursor.fetchone()
        
        return ChatSession(
            id=row['id'],
            title=row['title'],
            description=row['description'],
            tags=json.loads(row['tags'] or '[]'),
            status=row['status'],
            created_at=datetime.fromisoformat(row['created_at']),
            updated_at=datetime.fromisoformat(row['updated_at']),
            last_activity=datetime.fromisoformat(row['last_activity']),
            total_messages=row['total_messages'],
            metadata=json.loads(row['metadata'] or '{}'),
            is_archived=bool(row['is_archived'])
        )
        
    except Exception as e:
        conn.rollback()
        logger.error(f"세션 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 생성 실패: {str(e)}")
    finally:
        conn.close()


@app.get("/api/persistent-sessions", response_model=List[ChatSession])
async def get_persistent_sessions(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    search: Optional[str] = None
):
    """지속적 채팅 세션 목록 조회"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = "SELECT * FROM chat_sessions WHERE 1=1"
        params = []
        
        if status:
            query += " AND status = ?"
            params.append(status)
        
        if search:
            query += " AND (title LIKE ? OR description LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        query += " ORDER BY last_activity DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        sessions = []
        for row in rows:
            sessions.append(ChatSession(
                id=row['id'],
                title=row['title'],
                description=row['description'],
                tags=json.loads(row['tags'] or '[]'),
                status=row['status'],
                created_at=datetime.fromisoformat(row['created_at']),
                updated_at=datetime.fromisoformat(row['updated_at']),
                last_activity=datetime.fromisoformat(row['last_activity']),
                total_messages=row['total_messages'],
                metadata=json.loads(row['metadata'] or '{}'),
                is_archived=bool(row['is_archived'])
            ))
        
        return sessions
        
    except Exception as e:
        logger.error(f"세션 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 목록 조회 실패: {str(e)}")
    finally:
        conn.close()


@app.get("/api/persistent-sessions/{session_id}", response_model=ChatSession)
async def get_persistent_session(session_id: str):
    """특정 지속적 채팅 세션 조회"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "SELECT * FROM chat_sessions WHERE id = ?", (session_id,)
        )
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")
        
        return ChatSession(
            id=row['id'],
            title=row['title'],
            description=row['description'],
            tags=json.loads(row['tags'] or '[]'),
            status=row['status'],
            created_at=datetime.fromisoformat(row['created_at']),
            updated_at=datetime.fromisoformat(row['updated_at']),
            last_activity=datetime.fromisoformat(row['last_activity']),
            total_messages=row['total_messages'],
            metadata=json.loads(row['metadata'] or '{}'),
            is_archived=bool(row['is_archived'])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"세션 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 조회 실패: {str(e)}")
    finally:
        conn.close()


@app.put("/api/persistent-sessions/{session_id}", response_model=ChatSession)
async def update_persistent_session(
    session_id: str, session_data: ChatSessionUpdate
):
    """지속적 채팅 세션 업데이트"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 기존 세션 확인
        cursor.execute(
            "SELECT * FROM chat_sessions WHERE id = ?", (session_id,)
        )
        existing = cursor.fetchone()
        
        if not existing:
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")
        
        # 업데이트할 필드들
        update_fields = []
        params = []
        
        if session_data.title is not None:
            update_fields.append("title = ?")
            params.append(session_data.title)
        
        if session_data.description is not None:
            update_fields.append("description = ?")
            params.append(session_data.description)
        
        if session_data.tags is not None:
            update_fields.append("tags = ?")
            params.append(json.dumps(session_data.tags))
        
        if session_data.status is not None:
            update_fields.append("status = ?")
            params.append(session_data.status)
        
        if session_data.metadata is not None:
            update_fields.append("metadata = ?")
            params.append(json.dumps(session_data.metadata))
        
        if update_fields:
            update_fields.append("updated_at = ?")
            params.append(datetime.now().isoformat())
            params.append(session_id)
            
            query = (
                f"UPDATE chat_sessions SET {', '.join(update_fields)} "
                f"WHERE id = ?"
            )
            cursor.execute(query, params)
            conn.commit()
        
        # 업데이트된 세션 반환
        cursor.execute(
            "SELECT * FROM chat_sessions WHERE id = ?", (session_id,)
        )
        row = cursor.fetchone()
        
        return ChatSession(
            id=row['id'],
            title=row['title'],
            description=row['description'],
            tags=json.loads(row['tags'] or '[]'),
            status=row['status'],
            created_at=datetime.fromisoformat(row['created_at']),
            updated_at=datetime.fromisoformat(row['updated_at']),
            last_activity=datetime.fromisoformat(row['last_activity']),
            total_messages=row['total_messages'],
            metadata=json.loads(row['metadata'] or '{}'),
            is_archived=bool(row['is_archived'])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"세션 업데이트 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 업데이트 실패: {str(e)}")
    finally:
        conn.close()


@app.delete("/api/persistent-sessions/{session_id}")
async def delete_persistent_session(session_id: str):
    """지속적 채팅 세션 삭제"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 세션 존재 확인
        cursor.execute(
            "SELECT id FROM chat_sessions WHERE id = ?", (session_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")
        
        # 세션과 관련된 모든 메시지 삭제 (CASCADE로 자동 삭제됨)
        cursor.execute("DELETE FROM chat_sessions WHERE id = ?", (session_id,))
        conn.commit()
        
        return {"message": "세션이 성공적으로 삭제되었습니다", "session_id": session_id}
        
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"세션 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 삭제 실패: {str(e)}")
    finally:
        conn.close()


@app.post("/api/persistent-sessions/{session_id}/archive")
async def archive_persistent_session(session_id: str):
    """지속적 채팅 세션 아카이브"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE chat_sessions 
            SET is_archived = TRUE, status = 'archived', updated_at = ?
            WHERE id = ?
        """, (datetime.now().isoformat(), session_id))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")
        
        conn.commit()
        return {"message": "세션이 아카이브되었습니다", "session_id": session_id}
        
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"세션 아카이브 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 아카이브 실패: {str(e)}")
    finally:
        conn.close()


@app.post("/api/persistent-sessions/{session_id}/restore")
async def restore_persistent_session(session_id: str):
    """아카이브된 지속적 채팅 세션 복원"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE chat_sessions 
            SET is_archived = FALSE, status = 'active', updated_at = ?
            WHERE id = ?
        """, (datetime.now().isoformat(), session_id))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")
        
        conn.commit()
        return {"message": "세션이 복원되었습니다", "session_id": session_id}
        
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"세션 복원 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 복원 실패: {str(e)}")
    finally:
        conn.close()

# 메시지 관리 엔드포인트들


@app.post(
    "/api/persistent-sessions/{session_id}/messages", response_model=Message
)
async def add_message_to_session(
    session_id: str, message_data: MessageCreate
):
    """세션에 메시지 추가"""
    message_id = str(uuid.uuid4())
    now = datetime.now()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 세션 존재 확인
        cursor.execute(
            "SELECT id FROM chat_sessions WHERE id = ?", (session_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")
        
        # 메시지 추가
        cursor.execute("""
            INSERT INTO messages 
            (id, session_id, content, role, sender, timestamp, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            message_id,
            session_id,
            message_data.content,
            message_data.role,
            message_data.sender,
            now.isoformat(),
            json.dumps(message_data.metadata or {})
        ))
        
        # 세션의 메시지 수 업데이트 및 마지막 활동 시간 갱신
        cursor.execute("""
            UPDATE chat_sessions 
            SET total_messages = total_messages + 1, 
                last_activity = ?, 
                updated_at = ?
            WHERE id = ?
        """, (now.isoformat(), now.isoformat(), session_id))
        
        conn.commit()
        
        # 생성된 메시지 반환
        cursor.execute("SELECT * FROM messages WHERE id = ?", (message_id,))
        row = cursor.fetchone()
        
        return Message(
            id=row['id'],
            session_id=row['session_id'],
            content=row['content'],
            role=row['role'],
            sender=row['sender'],
            timestamp=datetime.fromisoformat(row['timestamp']),
            metadata=json.loads(row['metadata'] or '{}'),
            is_bookmarked=bool(row['is_bookmarked'])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"메시지 추가 실패: {e}")
        raise HTTPException(status_code=500, detail=f"메시지 추가 실패: {str(e)}")
    finally:
        conn.close()


@app.get(
    "/api/persistent-sessions/{session_id}/messages", 
    response_model=List[Message]
)
async def get_session_messages(
    session_id: str,
    limit: int = 100,
    offset: int = 0
):
    """세션의 메시지 목록 조회"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 세션 존재 확인
        cursor.execute(
            "SELECT id FROM chat_sessions WHERE id = ?", (session_id,)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")
        
        # 메시지 조회
        cursor.execute("""
            SELECT * FROM messages 
            WHERE session_id = ? 
            ORDER BY timestamp ASC 
            LIMIT ? OFFSET ?
        """, (session_id, limit, offset))
        
        rows = cursor.fetchall()
        
        messages = []
        for row in rows:
            messages.append(Message(
                id=row['id'],
                session_id=row['session_id'],
                content=row['content'],
                role=row['role'],
                sender=row['sender'],
                timestamp=datetime.fromisoformat(row['timestamp']),
                metadata=json.loads(row['metadata'] or '{}'),
                is_bookmarked=bool(row['is_bookmarked'])
            ))
        
        return messages
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"메시지 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"메시지 조회 실패: {str(e)}")
    finally:
        conn.close()

# 통계 및 분석 엔드포인트들


@app.get("/api/persistent-sessions/stats", response_model=SessionStats)
async def get_session_stats():
    """채팅 세션 통계 조회"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 전체 세션 수
        cursor.execute("SELECT COUNT(*) as total FROM chat_sessions")
        total_sessions = cursor.fetchone()['total']
        
        # 활성 세션 수
        cursor.execute(
            "SELECT COUNT(*) as active FROM chat_sessions "
            "WHERE status = 'active'"
        )
        active_sessions = cursor.fetchone()['active']
        
        # 아카이브된 세션 수
        cursor.execute(
            "SELECT COUNT(*) as archived FROM chat_sessions "
            "WHERE is_archived = TRUE"
        )
        archived_sessions = cursor.fetchone()['archived']
        
        # 전체 메시지 수
        cursor.execute("SELECT COUNT(*) as total_messages FROM messages")
        total_messages = cursor.fetchone()['total_messages']
        
        # 세션당 평균 메시지 수
        average_messages = (
            total_messages / total_sessions if total_sessions > 0 else 0
        )
        
        # 가장 활발한 세션
        cursor.execute("""
            SELECT session_id, COUNT(*) as message_count 
            FROM messages 
            GROUP BY session_id 
            ORDER BY message_count DESC 
            LIMIT 1
        """)
        most_active = cursor.fetchone()
        most_active_session = (
            most_active['session_id'] if most_active else None
        )
        
        return SessionStats(
            total_sessions=total_sessions,
            active_sessions=active_sessions,
            archived_sessions=archived_sessions,
            total_messages=total_messages,
            average_messages_per_session=average_messages,
            most_active_session=most_active_session
        )
        
    except Exception as e:
        logger.error(f"통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"통계 조회 실패: {str(e)}")
    finally:
        conn.close()


@app.get("/api/persistent-sessions/search")
async def search_sessions(
    query: str,
    limit: int = 20
):
    """세션 검색"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT * FROM chat_sessions 
            WHERE title LIKE ? OR description LIKE ?
            ORDER BY last_activity DESC 
            LIMIT ?
        """, (f"%{query}%", f"%{query}%", limit))
        
        rows = cursor.fetchall()
        
        sessions = []
        for row in rows:
            sessions.append(ChatSession(
                id=row['id'],
                title=row['title'],
                description=row['description'],
                tags=json.loads(row['tags'] or '[]'),
                status=row['status'],
                created_at=datetime.fromisoformat(row['created_at']),
                updated_at=datetime.fromisoformat(row['updated_at']),
                last_activity=datetime.fromisoformat(row['last_activity']),
                total_messages=row['total_messages'],
                metadata=json.loads(row['metadata'] or '{}'),
                is_archived=bool(row['is_archived'])
            ))
        
        return {"sessions": sessions, "query": query, "count": len(sessions)}
        
    except Exception as e:
        logger.error(f"세션 검색 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 검색 실패: {str(e)}")
    finally:
        conn.close()

# 정리 및 유지보수 엔드포인트들


@app.post("/api/persistent-sessions/cleanup")
async def cleanup_old_sessions(days: int = 30):
    """오래된 세션 정리"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        # 오래된 아카이브된 세션 삭제
        cursor.execute("""
            DELETE FROM chat_sessions 
            WHERE is_archived = TRUE AND last_activity < ?
        """, (cutoff_date,))
        
        deleted_count = cursor.rowcount
        conn.commit()
        
        return {
            "message": f"{deleted_count}개의 오래된 세션이 정리되었습니다",
            "deleted_count": deleted_count,
            "cutoff_date": cutoff_date
        }
        
    except Exception as e:
        conn.rollback()
        logger.error(f"세션 정리 실패: {e}")
        raise HTTPException(status_code=500, detail=f"세션 정리 실패: {str(e)}")
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
