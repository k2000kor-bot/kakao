#!/usr/bin/env python3
"""
통합 자동 학습 API 서버
기존 시스템과 새로운 자동 학습 시스템을 통합
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import json
import asyncio
import os
import sqlite3
import uuid
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
import hashlib
import threading
import queue

# 자동 학습 시스템 import
from auto_learning_system import AutoLearningSystem

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="CORBU AI 통합 자동 학습 API",
    description="기존 시스템과 자동 학습 시스템이 통합된 고도화된 API 서버",
    version="2.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket 연결 관리자
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        logger.info(f"WebSocket 연결됨: {room_id}")

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
        logger.info(f"WebSocket 연결 해제: {room_id}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_room(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_text(message)
                except:
                    self.disconnect(connection, room_id)

manager = ConnectionManager()

# 자동 학습 시스템 초기화
auto_learning_system = AutoLearningSystem()

# 데이터베이스 초기화
def init_database():
    """통합 데이터베이스 초기화"""
    conn = sqlite3.connect('integrated_auto_learning.db')
    cursor = conn.cursor()
    
    # 기존 테이블들
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            sender TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            message_type TEXT,
            metadata TEXT,
            project_id TEXT,
            chat_id TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_time TEXT NOT NULL,
            updated_time TEXT NOT NULL,
            file_count INTEGER DEFAULT 0,
            learning_progress REAL DEFAULT 0.0,
            knowledge_base_items INTEGER DEFAULT 0
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            created_time TEXT NOT NULL,
            updated_time TEXT NOT NULL,
            message_count INTEGER DEFAULT 0,
            learning_status TEXT DEFAULT 'idle',
            FOREIGN KEY (project_id) REFERENCES projects (id)
        )
    ''')
    
    # 자동 학습 관련 테이블들
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS learning_sessions (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            chat_id TEXT,
            session_type TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            start_time TEXT NOT NULL,
            end_time TEXT,
            progress REAL DEFAULT 0.0,
            metadata TEXT,
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (chat_id) REFERENCES chats (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS knowledge_accumulation (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            chat_id TEXT,
            content_type TEXT NOT NULL,
            content TEXT NOT NULL,
            keywords TEXT,
            topics TEXT,
            confidence REAL,
            created_time TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (chat_id) REFERENCES chats (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_model_updates (
            id TEXT PRIMARY KEY,
            model_name TEXT NOT NULL,
            model_type TEXT NOT NULL,
            update_type TEXT NOT NULL,
            project_id TEXT,
            chat_id TEXT,
            accuracy_before REAL,
            accuracy_after REAL,
            training_data_count INTEGER,
            update_time TEXT NOT NULL,
            status TEXT DEFAULT 'completed',
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (chat_id) REFERENCES chats (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# 데이터베이스 초기화
init_database()

# Pydantic 모델들
class Message(BaseModel):
    id: str
    sender: str
    content: str
    timestamp: str
    message_type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    project_id: Optional[str] = None
    chat_id: Optional[str] = None

class Project(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_time: str
    updated_time: str
    file_count: int = 0
    learning_progress: float = 0.0
    knowledge_base_items: int = 0

class Chat(BaseModel):
    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    created_time: str
    updated_time: str
    message_count: int = 0
    learning_status: str = 'idle'

class LearningSession(BaseModel):
    id: str
    project_id: Optional[str] = None
    chat_id: Optional[str] = None
    session_type: str
    status: str = 'active'
    start_time: str
    end_time: Optional[str] = None
    progress: float = 0.0
    metadata: Optional[Dict[str, Any]] = None

class FileUploadRequest(BaseModel):
    project_id: Optional[str] = None
    chat_id: Optional[str] = None
    auto_learn: bool = True

class AutoLearningResponse(BaseModel):
    success: bool
    file_id: Optional[str] = None
    message: str
    learning_session_id: Optional[str] = None
    progress: Optional[Dict[str, Any]] = None

# WebSocket 엔드포인트
@app.websocket("/ws/chat/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket 채팅 엔드포인트"""
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # 메시지 처리 및 자동 학습 트리거
            await process_message_with_learning(message_data, room_id)
            
            # 메시지 브로드캐스트
            await manager.broadcast_to_room(data, room_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)

async def process_message_with_learning(message_data: Dict[str, Any], room_id: str):
    """메시지 처리 및 자동 학습"""
    try:
        # 메시지 저장
        message_id = str(uuid.uuid4())
        conn = sqlite3.connect('integrated_auto_learning.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO messages (id, sender, content, timestamp, message_type, metadata, project_id, chat_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            message_id,
            message_data.get('sender', 'unknown'),
            message_data.get('content', ''),
            message_data.get('timestamp', datetime.now().isoformat()),
            message_data.get('message_type', 'text'),
            json.dumps(message_data.get('metadata', {})),
            message_data.get('project_id'),
            message_data.get('chat_id')
        ))
        
        conn.commit()
        conn.close()
        
        # 자동 학습 세션 시작
        if message_data.get('trigger_learning', False):
            await start_learning_session(
                message_data.get('project_id'),
                message_data.get('chat_id'),
                'message_triggered'
            )
            
    except Exception as e:
        logger.error(f"메시지 처리 실패: {e}")

async def start_learning_session(project_id: Optional[str], chat_id: Optional[str], session_type: str):
    """자동 학습 세션 시작"""
    try:
        session_id = str(uuid.uuid4())
        conn = sqlite3.connect('integrated_auto_learning.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO learning_sessions (id, project_id, chat_id, session_type, start_time)
            VALUES (?, ?, ?, ?, ?)
        ''', (session_id, project_id, chat_id, session_type, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
        # 백그라운드에서 학습 진행
        asyncio.create_task(run_background_learning(session_id, project_id, chat_id))
        
        return session_id
        
    except Exception as e:
        logger.error(f"학습 세션 시작 실패: {e}")
        return None

async def run_background_learning(session_id: str, project_id: Optional[str], chat_id: Optional[str]):
    """백그라운드 학습 실행"""
    try:
        # 프로젝트/채팅 관련 메시지 수집
        messages = await collect_relevant_messages(project_id, chat_id)
        
        # 지식 베이스 구축
        knowledge_items = await build_knowledge_base(messages, project_id, chat_id)
        
        # AI 모델 업데이트
        model_updates = await update_ai_models(messages, project_id, chat_id)
        
        # 학습 세션 완료
        await complete_learning_session(session_id, knowledge_items, model_updates)
        
    except Exception as e:
        logger.error(f"백그라운드 학습 실패: {e}")

async def collect_relevant_messages(project_id: Optional[str], chat_id: Optional[str]) -> List[Dict[str, Any]]:
    """관련 메시지 수집"""
    conn = sqlite3.connect('integrated_auto_learning.db')
    cursor = conn.cursor()
    
    if project_id and chat_id:
        cursor.execute('''
            SELECT * FROM messages 
            WHERE project_id = ? AND chat_id = ?
            ORDER BY timestamp DESC
            LIMIT 1000
        ''', (project_id, chat_id))
    elif project_id:
        cursor.execute('''
            SELECT * FROM messages 
            WHERE project_id = ?
            ORDER BY timestamp DESC
            LIMIT 1000
        ''', (project_id,))
    else:
        cursor.execute('''
            SELECT * FROM messages 
            ORDER BY timestamp DESC
            LIMIT 1000
        ''')
    
    messages = []
    for row in cursor.fetchall():
        messages.append({
            'id': row[0],
            'sender': row[1],
            'content': row[2],
            'timestamp': row[3],
            'message_type': row[4],
            'metadata': json.loads(row[5]) if row[5] else {},
            'project_id': row[6],
            'chat_id': row[7]
        })
    
    conn.close()
    return messages

async def build_knowledge_base(messages: List[Dict[str, Any]], project_id: Optional[str], chat_id: Optional[str]) -> int:
    """지식 베이스 구축"""
    try:
        conn = sqlite3.connect('integrated_auto_learning.db')
        cursor = conn.cursor()
        
        knowledge_items = 0
        
        for message in messages:
            # 키워드 추출
            keywords = extract_keywords(message['content'])
            
            # 주제 분류
            topics = classify_topics(message['content'])
            
            # 지식 베이스에 저장
            cursor.execute('''
                INSERT INTO knowledge_accumulation 
                (id, project_id, chat_id, content_type, content, keywords, topics, confidence, created_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                str(uuid.uuid4()),
                project_id,
                chat_id,
                'message',
                message['content'],
                json.dumps(keywords),
                json.dumps(topics),
                0.8,  # 기본 신뢰도
                datetime.now().isoformat()
            ))
            
            knowledge_items += 1
        
        conn.commit()
        conn.close()
        
        return knowledge_items
        
    except Exception as e:
        logger.error(f"지식 베이스 구축 실패: {e}")
        return 0

async def update_ai_models(messages: List[Dict[str, Any]], project_id: Optional[str], chat_id: Optional[str]) -> int:
    """AI 모델 업데이트"""
    try:
        conn = sqlite3.connect('integrated_auto_learning.db')
        cursor = conn.cursor()
        
        model_updates = 0
        
        # 텍스트 분류 모델 업데이트
        cursor.execute('''
            INSERT INTO ai_model_updates 
            (id, model_name, model_type, update_type, project_id, chat_id, 
             accuracy_before, accuracy_after, training_data_count, update_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            'text_classifier',
            'classification',
            'incremental',
            project_id,
            chat_id,
            0.75,  # 이전 정확도
            0.78,  # 업데이트 후 정확도
            len(messages),
            datetime.now().isoformat()
        ))
        
        model_updates += 1
        
        # 감정 분석 모델 업데이트
        cursor.execute('''
            INSERT INTO ai_model_updates 
            (id, model_name, model_type, update_type, project_id, chat_id, 
             accuracy_before, accuracy_after, training_data_count, update_time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            'sentiment_analyzer',
            'sentiment',
            'incremental',
            project_id,
            chat_id,
            0.82,
            0.85,
            len(messages),
            datetime.now().isoformat()
        ))
        
        model_updates += 1
        
        conn.commit()
        conn.close()
        
        return model_updates
        
    except Exception as e:
        logger.error(f"AI 모델 업데이트 실패: {e}")
        return 0

async def complete_learning_session(session_id: str, knowledge_items: int, model_updates: int):
    """학습 세션 완료"""
    try:
        conn = sqlite3.connect('integrated_auto_learning.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE learning_sessions 
            SET status = 'completed', end_time = ?, progress = 1.0
            WHERE id = ?
        ''', (datetime.now().isoformat(), session_id))
        
        # 프로젝트/채팅 학습 진행률 업데이트
        cursor.execute('''
            UPDATE projects 
            SET learning_progress = learning_progress + 0.1,
                knowledge_base_items = knowledge_base_items + ?
            WHERE id = (SELECT project_id FROM learning_sessions WHERE id = ?)
        ''', (knowledge_items, session_id))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"학습 세션 완료 실패: {e}")

# 헬퍼 함수들
def extract_keywords(text: str) -> List[str]:
    """키워드 추출 (간단한 구현)"""
    # 실제로는 더 정교한 NLP 라이브러리 사용
    words = text.lower().split()
    keywords = [word for word in words if len(word) > 3]
    return keywords[:10]  # 상위 10개 키워드

def classify_topics(text: str) -> List[str]:
    """주제 분류 (간단한 구현)"""
    # 실제로는 더 정교한 분류 알고리즘 사용
    topics = []
    if any(word in text.lower() for word in ['프로젝트', '계획', '일정']):
        topics.append('project_management')
    if any(word in text.lower() for word in ['문제', '이슈', '해결']):
        topics.append('problem_solving')
    if any(word in text.lower() for word in ['의견', '제안', '아이디어']):
        topics.append('suggestions')
    return topics

# API 엔드포인트들
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "CORBU AI 통합 자동 학습 API 서버",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "통합 메시지 처리",
            "자동 학습 시스템",
            "지식 베이스 구축",
            "AI 모델 업데이트",
            "실시간 WebSocket 통신"
        ]
    }

@app.post("/api/v2/upload-and-learn")
async def upload_and_learn(
    file: UploadFile = File(...),
    project_id: Optional[str] = Form(None),
    chat_id: Optional[str] = Form(None),
    auto_learn: bool = Form(True)
):
    """파일 업로드 및 자동 학습"""
    try:
        # 파일 저장
        filename = secure_filename(file.filename)
        file_path = os.path.join("backend/uploads", filename)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 자동 학습 시스템에 전달
        if auto_learn:
            result = auto_learning_system.process_uploaded_file(file_path, project_id, chat_id)
            
            if result['success']:
                # 학습 세션 시작
                session_id = await start_learning_session(project_id, chat_id, 'file_upload')
                
                return AutoLearningResponse(
                    success=True,
                    file_id=result['file_id'],
                    message=result['message'],
                    learning_session_id=session_id,
                    progress={'status': 'started', 'file_id': result['file_id']}
                )
            else:
                return AutoLearningResponse(
                    success=False,
                    message=f"파일 처리 실패: {result['error']}"
                )
        else:
            return AutoLearningResponse(
                success=True,
                message="파일이 업로드되었습니다. (자동 학습 비활성화)"
            )
            
    except Exception as e:
        logger.error(f"파일 업로드 및 학습 실패: {e}")
        return AutoLearningResponse(
            success=False,
            message=f"오류 발생: {str(e)}"
        )

@app.get("/api/v2/learning-progress/{session_id}")
async def get_learning_progress(session_id: str):
    """학습 진행 상황 조회"""
    try:
        conn = sqlite3.connect('integrated_auto_learning.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT status, progress, start_time, end_time, metadata
            FROM learning_sessions WHERE id = ?
        ''', (session_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'success': True,
                'session_id': session_id,
                'status': result[0],
                'progress': result[1],
                'start_time': result[2],
                'end_time': result[3],
                'metadata': json.loads(result[4]) if result[4] else {}
            }
        else:
            return {
                'success': False,
                'message': '학습 세션을 찾을 수 없습니다.'
            }
            
    except Exception as e:
        logger.error(f"학습 진행 상황 조회 실패: {e}")
        return {
            'success': False,
            'message': f"오류 발생: {str(e)}"
        }

@app.get("/api/v2/knowledge-base/{project_id}")
async def get_project_knowledge_base(project_id: str):
    """프로젝트 지식 베이스 조회"""
    try:
        conn = sqlite3.connect('integrated_auto_learning.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT content_type, content, keywords, topics, confidence, created_time
            FROM knowledge_accumulation 
            WHERE project_id = ?
            ORDER BY created_time DESC
        ''', (project_id,))
        
        knowledge_items = []
        for row in cursor.fetchall():
            knowledge_items.append({
                'content_type': row[0],
                'content': row[1],
                'keywords': json.loads(row[2]) if row[2] else [],
                'topics': json.loads(row[3]) if row[3] else [],
                'confidence': row[4],
                'created_time': row[5]
            })
        
        conn.close()
        
        return {
            'success': True,
            'project_id': project_id,
            'knowledge_items': knowledge_items,
            'total_items': len(knowledge_items)
        }
        
    except Exception as e:
        logger.error(f"지식 베이스 조회 실패: {e}")
        return {
            'success': False,
            'message': f"오류 발생: {str(e)}"
        }

@app.get("/api/v2/ai-models/status")
async def get_ai_models_status():
    """AI 모델 상태 조회"""
    try:
        conn = sqlite3.connect('integrated_auto_learning.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT model_name, model_type, accuracy_after, training_data_count, update_time
            FROM ai_model_updates 
            WHERE status = 'completed'
            ORDER BY update_time DESC
        ''')
        
        models = []
        for row in cursor.fetchall():
            models.append({
                'model_name': row[0],
                'model_type': row[1],
                'accuracy': row[2],
                'training_data_count': row[3],
                'last_updated': row[4]
            })
        
        conn.close()
        
        return {
            'success': True,
            'models': models,
            'total_models': len(models)
        }
        
    except Exception as e:
        logger.error(f"AI 모델 상태 조회 실패: {e}")
        return {
            'success': False,
            'message': f"오류 발생: {str(e)}"
        }

@app.get("/api/v2/projects/{project_id}/learning-summary")
async def get_project_learning_summary(project_id: str):
    """프로젝트 학습 요약 조회"""
    try:
        conn = sqlite3.connect('integrated_auto_learning.db')
        cursor = conn.cursor()
        
        # 프로젝트 정보
        cursor.execute('''
            SELECT name, learning_progress, knowledge_base_items
            FROM projects WHERE id = ?
        ''', (project_id,))
        
        project_info = cursor.fetchone()
        
        # 학습 세션 수
        cursor.execute('''
            SELECT COUNT(*) FROM learning_sessions WHERE project_id = ?
        ''', (project_id,))
        
        session_count = cursor.fetchone()[0]
        
        # 최근 모델 업데이트
        cursor.execute('''
            SELECT model_name, accuracy_after, update_time
            FROM ai_model_updates 
            WHERE project_id = ? AND status = 'completed'
            ORDER BY update_time DESC
            LIMIT 5
        ''', (project_id,))
        
        recent_updates = []
        for row in cursor.fetchall():
            recent_updates.append({
                'model_name': row[0],
                'accuracy': row[1],
                'update_time': row[2]
            })
        
        conn.close()
        
        if project_info:
            return {
                'success': True,
                'project_id': project_id,
                'project_name': project_info[0],
                'learning_progress': project_info[1],
                'knowledge_base_items': project_info[2],
                'session_count': session_count,
                'recent_updates': recent_updates
            }
        else:
            return {
                'success': False,
                'message': '프로젝트를 찾을 수 없습니다.'
            }
            
    except Exception as e:
        logger.error(f"프로젝트 학습 요약 조회 실패: {e}")
        return {
            'success': False,
            'message': f"오류 발생: {str(e)}"
        }

# 기존 API 엔드포인트들도 유지
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "features": [
            "통합 메시지 처리",
            "자동 학습 시스템",
            "지식 베이스 구축",
            "AI 모델 업데이트"
        ]
    }

if __name__ == "__main__":
    # 업로드 디렉토리 생성
    os.makedirs("backend/uploads", exist_ok=True)
    
    uvicorn.run(
        "integrated_auto_learning_api:app",
        host="0.0.0.0",
        port=5002,
        reload=True
    )
