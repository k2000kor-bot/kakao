import os
import json
import sqlite3
from datetime import datetime
from typing import Dict, List, Any, Optional
import pandas as pd
from pathlib import Path
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class MessageType(Enum):
    TEXT = "text"
    IMAGE = "image"
    MEDIA = "media"
    WORD = "word"
    LINK = "link"
    FILE = "file"

class PersonalityType(Enum):
    CONSERVATIVE = "conservative"      # 보수적 성향
    NEUTRAL = "neutral"               # 중립 성향
    CRITICAL = "critical"             # 비판적 성향
    PROGRESSIVE = "progressive"       # 진보적 성향

class PowerLevel(Enum):
    STRONG = "strong"                 # 강대우
    MEDIUM = "medium"                 # 중대우
    WEAK = "weak"                     # 약대우
    NONE = "none"                     # 선호없음

@dataclass
class ConversationMessage:
    id: str
    sender: str
    content: str
    message_type: MessageType
    timestamp: datetime
    personality: PersonalityType
    power_level: PowerLevel
    sentiment: str
    topics: List[str]
    media_files: List[str] = None
    references: List[str] = None

class DataProcessor:
    """카카오톡 대화 데이터 처리기"""
    
    def __init__(self, upload_dir: str = "uploads", db_path: str = "conversations.db"):
        self.upload_dir = Path(upload_dir)
        self.db_path = db_path
        self.upload_dir.mkdir(exist_ok=True)
        self.init_database()
    
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 대화방 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_rooms (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 메시지 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                chat_room_id TEXT,
                sender TEXT NOT NULL,
                content TEXT NOT NULL,
                message_type TEXT NOT NULL,
                timestamp TIMESTAMP,
                personality TEXT,
                power_level TEXT,
                sentiment TEXT,
                topics TEXT,
                media_files TEXT,
                references TEXT,
                FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
            )
        ''')
        
        # 학습 자료 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS learning_materials (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT,
                file_type TEXT,
                file_path TEXT,
                category TEXT,
                tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 대화 스타일 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversation_styles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                personality_type TEXT,
                power_level TEXT,
                characteristics TEXT,
                examples TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 지침 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS guidelines (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT,
                category TEXT,
                priority INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def process_uploaded_files(self, chat_room_id: str) -> Dict[str, Any]:
        """업로드된 파일들을 처리"""
        results = {
            "processed_files": [],
            "errors": [],
            "chat_room_id": chat_room_id
        }
        
        for file_path in self.upload_dir.rglob("*"):
            if file_path.is_file():
                try:
                    file_result = self.process_single_file(file_path, chat_room_id)
                    results["processed_files"].append(file_result)
                except Exception as e:
                    results["errors"].append({
                        "file": str(file_path),
                        "error": str(e)
                    })
        
        return results
    
    def process_single_file(self, file_path: Path, chat_room_id: str) -> Dict[str, Any]:
        """단일 파일 처리"""
        file_type = file_path.suffix.lower()
        
        if file_type == ".txt":
            return self.process_text_file(file_path, chat_room_id)
        elif file_type in [".jpg", ".jpeg", ".png", ".gif"]:
            return self.process_image_file(file_path, chat_room_id)
        elif file_type in [".mp4", ".avi", ".mov"]:
            return self.process_media_file(file_path, chat_room_id)
        elif file_type in [".doc", ".docx"]:
            return self.process_word_file(file_path, chat_room_id)
        elif file_type == ".json":
            return self.process_json_file(file_path, chat_room_id)
        else:
            return self.process_generic_file(file_path, chat_room_id)
    
    def process_text_file(self, file_path: Path, chat_room_id: str) -> Dict[str, Any]:
        """텍스트 파일 처리"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 카카오톡 대화 형식 파싱
        messages = self.parse_kakao_chat(content)
        
        # 데이터베이스에 저장
        self.save_messages_to_db(messages, chat_room_id)
        
        return {
            "file": str(file_path),
            "type": "text",
            "messages_count": len(messages),
            "status": "success"
        }
    
    def parse_kakao_chat(self, content: str) -> List[ConversationMessage]:
        """카카오톡 대화 형식 파싱"""
        messages = []
        lines = content.split('\n')
        
        for line in lines:
            if not line.strip():
                continue
            
            # 카카오톡 형식: [날짜] [시간] [이름] : [메시지]
            if '[' in line and ']' in line and ':' in line:
                try:
                    # 날짜/시간 부분 추출
                    date_start = line.find('[')
                    date_end = line.find(']')
                    date_str = line[date_start+1:date_end]
                    
                    # 이름 부분 추출
                    name_start = line.find('[', date_end)
                    name_end = line.find(']', name_start)
                    sender = line[name_start+1:name_end]
                    
                    # 메시지 부분 추출
                    message_start = line.find(':', name_end)
                    content = line[message_start+1:].strip()
                    
                    # 메시지 타입 판별
                    message_type = self.detect_message_type(content)
                    
                    # 성향 분석 (기본값)
                    personality = PersonalityType.NEUTRAL
                    power_level = PowerLevel.MEDIUM
                    
                    message = ConversationMessage(
                        id=f"msg_{len(messages)}",
                        sender=sender,
                        content=content,
                        message_type=message_type,
                        timestamp=datetime.now(),  # 실제로는 파싱된 시간 사용
                        personality=personality,
                        power_level=power_level,
                        sentiment="neutral",
                        topics=[],
                        media_files=[]
                    )
                    
                    messages.append(message)
                    
                except Exception as e:
                    logger.error(f"메시지 파싱 실패: {line}, 오류: {e}")
        
        return messages
    
    def detect_message_type(self, content: str) -> MessageType:
        """메시지 타입 감지"""
        if content.startswith('http') or 'www.' in content:
            return MessageType.LINK
        elif content.endswith(('.jpg', '.jpeg', '.png', '.gif')):
            return MessageType.IMAGE
        elif content.endswith(('.mp4', '.avi', '.mov')):
            return MessageType.MEDIA
        elif content.endswith(('.doc', '.docx')):
            return MessageType.WORD
        else:
            return MessageType.TEXT
    
    def save_messages_to_db(self, messages: List[ConversationMessage], chat_room_id: str):
        """메시지를 데이터베이스에 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for message in messages:
            cursor.execute('''
                INSERT OR REPLACE INTO messages 
                (id, chat_room_id, sender, content, message_type, timestamp, 
                 personality, power_level, sentiment, topics, media_files, references)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                message.id,
                chat_room_id,
                message.sender,
                message.content,
                message.message_type.value,
                message.timestamp.isoformat(),
                message.personality.value,
                message.power_level.value,
                message.sentiment,
                json.dumps(message.topics),
                json.dumps(message.media_files or []),
                json.dumps(message.references or [])
            ))
        
        conn.commit()
        conn.close()
    
    def process_image_file(self, file_path: Path, chat_room_id: str) -> Dict[str, Any]:
        """이미지 파일 처리"""
        # 이미지 메타데이터 추출 및 저장
        return {
            "file": str(file_path),
            "type": "image",
            "status": "success"
        }
    
    def process_media_file(self, file_path: Path, chat_room_id: str) -> Dict[str, Any]:
        """미디어 파일 처리"""
        return {
            "file": str(file_path),
            "type": "media",
            "status": "success"
        }
    
    def process_word_file(self, file_path: Path, chat_room_id: str) -> Dict[str, Any]:
        """워드 파일 처리"""
        # python-docx 라이브러리 사용하여 텍스트 추출
        return {
            "file": str(file_path),
            "type": "word",
            "status": "success"
        }
    
    def process_json_file(self, file_path: Path, chat_room_id: str) -> Dict[str, Any]:
        """JSON 파일 처리"""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # JSON 데이터를 메시지로 변환
        messages = self.convert_json_to_messages(data)
        self.save_messages_to_db(messages, chat_room_id)
        
        return {
            "file": str(file_path),
            "type": "json",
            "messages_count": len(messages),
            "status": "success"
        }
    
    def process_generic_file(self, file_path: Path, chat_room_id: str) -> Dict[str, Any]:
        """일반 파일 처리"""
        return {
            "file": str(file_path),
            "type": "generic",
            "status": "success"
        }
    
    def convert_json_to_messages(self, data: Dict[str, Any]) -> List[ConversationMessage]:
        """JSON 데이터를 메시지로 변환"""
        messages = []
        
        if isinstance(data, list):
            for item in data:
                message = ConversationMessage(
                    id=item.get('id', f"msg_{len(messages)}"),
                    sender=item.get('sender', 'Unknown'),
                    content=item.get('content', ''),
                    message_type=MessageType(item.get('type', 'text')),
                    timestamp=datetime.fromisoformat(item.get('timestamp', datetime.now().isoformat())),
                    personality=PersonalityType(item.get('personality', 'neutral')),
                    power_level=PowerLevel(item.get('power_level', 'medium')),
                    sentiment=item.get('sentiment', 'neutral'),
                    topics=item.get('topics', []),
                    media_files=item.get('media_files', [])
                )
                messages.append(message)
        
        return messages

# 전역 인스턴스
data_processor = DataProcessor() 