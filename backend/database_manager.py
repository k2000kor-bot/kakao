#!/usr/bin/env python3
"""
데이터베이스 관리 모듈
"""

import sqlite3
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class DatabaseManager:
    """데이터베이스 관리 클래스"""
    
    def __init__(self, db_path: str = "chatgpt_unified.db"):
        self.db_path = db_path
        self.logger = logger
        self.init_database()
    
    def init_database(self):
        """데이터베이스 초기화"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 메시지 테이블
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS messages (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        session_id TEXT NOT NULL,
                        user_id TEXT NOT NULL,
                        message TEXT NOT NULL,
                        response TEXT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                        message_type TEXT DEFAULT 'text',
                        metadata TEXT
                    )
                ''')
                
                # 세션 테이블
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS sessions (
                        id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
                        title TEXT,
                        metadata TEXT
                    )
                ''')
                
                # 사용자 설정 테이블
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS user_settings (
                        user_id TEXT PRIMARY KEY,
                        settings TEXT NOT NULL,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                conn.commit()
                self.logger.info("데이터베이스 초기화 완료")
                
        except Exception as e:
            self.logger.error(f"데이터베이스 초기화 오류: {e}")
            raise
    
    def save_message(self, session_id: str, user_id: str, message: str, 
                    response: str = None, message_type: str = "text", 
                    metadata: Dict[str, Any] = None) -> int:
        """메시지 저장"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO messages (session_id, user_id, message, response, message_type, metadata)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (session_id, user_id, message, response, message_type, 
                     json.dumps(metadata) if metadata else None))
                
                message_id = cursor.lastrowid
                conn.commit()
                
                # 세션 업데이트
                cursor.execute('''
                    UPDATE sessions SET last_activity = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (session_id,))
                conn.commit()
                
                self.logger.info(f"메시지 저장 완료: ID {message_id}")
                return message_id
                
        except Exception as e:
            self.logger.error(f"메시지 저장 오류: {e}")
            raise
    
    def get_messages(self, session_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """메시지 조회"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT * FROM messages 
                    WHERE session_id = ? 
                    ORDER BY timestamp DESC 
                    LIMIT ?
                ''', (session_id, limit))
                
                messages = []
                for row in cursor.fetchall():
                    message = dict(row)
                    if message['metadata']:
                        try:
                            message['metadata'] = json.loads(message['metadata'])
                        except:
                            message['metadata'] = {}
                    messages.append(message)
                
                return messages
                
        except Exception as e:
            self.logger.error(f"메시지 조회 오류: {e}")
            return []
    
    def create_session(self, session_id: str, user_id: str, title: str = None) -> bool:
        """세션 생성"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO sessions (id, user_id, title)
                    VALUES (?, ?, ?)
                ''', (session_id, user_id, title))
                conn.commit()
                
                self.logger.info(f"세션 생성 완료: {session_id}")
                return True
                
        except Exception as e:
            self.logger.error(f"세션 생성 오류: {e}")
            return False
    
    def get_user_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """사용자 세션 목록 조회"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT * FROM sessions 
                    WHERE user_id = ? 
                    ORDER BY last_activity DESC
                ''', (user_id,))
                
                sessions = [dict(row) for row in cursor.fetchall()]
                return sessions
                
        except Exception as e:
            self.logger.error(f"세션 목록 조회 오류: {e}")
            return []
