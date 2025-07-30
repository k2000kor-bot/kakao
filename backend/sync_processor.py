import os
import re
import json
import sqlite3
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import logging
from dataclasses import dataclass
import hashlib
import mimetypes
from urllib.parse import urlparse
import requests

logger = logging.getLogger(__name__)

@dataclass
class SyncMessage:
    """동기화된 메시지 데이터"""
    id: str
    chat_room_id: str
    sender: str
    content: str
    message_type: str
    timestamp: datetime
    media_files: List[str] = None
    links: List[str] = None
    file_size: int = 0
    file_hash: str = ""
    sync_status: str = "synced"

@dataclass
class SyncMedia:
    """동기화된 미디어 데이터"""
    id: str
    chat_room_id: str
    original_path: str
    classified_path: str
    file_type: str
    file_size: int
    file_hash: str
    sync_timestamp: datetime
    metadata: Dict[str, Any] = None

@dataclass
class SyncLink:
    """동기화된 링크 데이터"""
    id: str
    chat_room_id: str
    url: str
    link_type: str
    shared_by: str
    shared_at: datetime
    content_analysis: Dict[str, Any] = None
    sync_status: str = "synced"

class ConversationSyncProcessor:
    """대화 동기화 및 데이터베이스화 처리기"""
    
    def __init__(self, db_path: str = "conversations.db"):
        self.db_path = db_path
        self.init_sync_database()
    
    def init_sync_database(self):
        """동기화 전용 데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 동기화된 메시지 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sync_messages (
                id TEXT PRIMARY KEY,
                chat_room_id TEXT NOT NULL,
                sender TEXT NOT NULL,
                content TEXT NOT NULL,
                message_type TEXT DEFAULT 'text',
                timestamp TIMESTAMP,
                media_files TEXT,
                links TEXT,
                file_size INTEGER DEFAULT 0,
                file_hash TEXT,
                sync_status TEXT DEFAULT 'synced',
                sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
            )
        ''')
        
        # 동기화된 미디어 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sync_media (
                id TEXT PRIMARY KEY,
                chat_room_id TEXT NOT NULL,
                original_path TEXT NOT NULL,
                classified_path TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER,
                file_hash TEXT,
                sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT,
                FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
            )
        ''')
        
        # 동기화된 링크 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sync_links (
                id TEXT PRIMARY KEY,
                chat_room_id TEXT NOT NULL,
                url TEXT NOT NULL,
                link_type TEXT NOT NULL,
                shared_by TEXT NOT NULL,
                shared_at TIMESTAMP,
                content_analysis TEXT,
                sync_status TEXT DEFAULT 'synced',
                sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
            )
        ''')
        
        # 동기화 로그 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sync_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_room_id TEXT NOT NULL,
                sync_type TEXT NOT NULL,
                status TEXT NOT NULL,
                message TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def sync_conversation(self, chat_room_id: str, chat_room_path: str) -> Dict[str, Any]:
        """대화 동기화 메인 프로세스"""
        sync_result = {
            "chat_room_id": chat_room_id,
            "sync_timestamp": datetime.now().isoformat(),
            "messages_synced": 0,
            "media_synced": 0,
            "links_synced": 0,
            "errors": []
        }
        
        try:
            # 1. 대화 텍스트 동기화
            chat_file_path = f"{chat_room_path}/대화.txt"
            if os.path.exists(chat_file_path):
                messages = self.sync_messages(chat_room_id, chat_file_path)
                sync_result["messages_synced"] = len(messages)
                self.log_sync(chat_room_id, "messages", "success", f"{len(messages)}개 메시지 동기화")
            else:
                self.log_sync(chat_room_id, "messages", "error", "대화 파일을 찾을 수 없음")
                sync_result["errors"].append("대화 파일을 찾을 수 없음")
            
            # 2. 미디어 파일 동기화
            media_files = self.sync_media_files(chat_room_id, chat_room_path)
            sync_result["media_synced"] = len(media_files)
            self.log_sync(chat_room_id, "media", "success", f"{len(media_files)}개 미디어 파일 동기화")
            
            # 3. 링크 동기화
            links = self.sync_links(chat_room_id, chat_file_path)
            sync_result["links_synced"] = len(links)
            self.log_sync(chat_room_id, "links", "success", f"{len(links)}개 링크 동기화")
            
        except Exception as e:
            logger.error(f"동기화 실패: {e}")
            self.log_sync(chat_room_id, "sync", "error", str(e))
            sync_result["errors"].append(str(e))
        
        return sync_result
    
    def sync_messages(self, chat_room_id: str, chat_file_path: str) -> List[SyncMessage]:
        """대화 메시지 동기화"""
        messages = []
        
        with open(chat_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 카카오톡 대화 형식 파싱
        pattern = r'\[([^\]]+)\] \[([^\]]+)\] ([^:]+) : (.+)'
        
        for line_num, line in enumerate(content.split('\n')):
            if not line.strip():
                continue
            
            match = re.match(pattern, line)
            if match:
                date_str, time_str, sender, content = match.groups()
                
                # 날짜시간 파싱
                timestamp = self.parse_datetime(f"{date_str} {time_str}")
                
                # 메시지 타입 및 미디어/링크 추출
                message_type, media_files, links = self.extract_message_components(content)
                
                # 메시지 ID 생성
                message_id = f"{chat_room_id}_{timestamp.strftime('%Y%m%d_%H%M%S')}_{line_num}"
                
                # 파일 해시 생성
                file_hash = hashlib.md5(content.encode()).hexdigest()
                
                message = SyncMessage(
                    id=message_id,
                    chat_room_id=chat_room_id,
                    sender=sender.strip(),
                    content=content.strip(),
                    message_type=message_type,
                    timestamp=timestamp,
                    media_files=media_files,
                    links=links,
                    file_size=len(content.encode()),
                    file_hash=file_hash
                )
                
                messages.append(message)
        
        # 데이터베이스에 저장
        self.save_messages_to_db(messages)
        
        return messages
    
    def sync_media_files(self, chat_room_id: str, chat_room_path: str) -> List[SyncMedia]:
        """미디어 파일 동기화"""
        media_files = []
        
        # 미디어 폴더들 스캔
        media_folders = [
            f"{chat_room_path}/미디어/동영상",
            f"{chat_room_path}/미디어/음성",
            f"{chat_room_path}/이미지/사진",
            f"{chat_room_path}/이미지/스크린샷"
        ]
        
        for folder in media_folders:
            if os.path.exists(folder):
                for file_path in Path(folder).rglob('*'):
                    if file_path.is_file():
                        try:
                            # 파일 정보 수집
                            file_size = file_path.stat().st_size
                            file_hash = self.calculate_file_hash(file_path)
                            file_type = self.get_file_type(file_path)
                            
                            # 미디어 ID 생성
                            media_id = f"{chat_room_id}_{file_hash[:8]}"
                            
                            # 메타데이터 수집
                            metadata = self.extract_media_metadata(file_path)
                            
                            media = SyncMedia(
                                id=media_id,
                                chat_room_id=chat_room_id,
                                original_path=str(file_path),
                                classified_path=str(file_path),
                                file_type=file_type,
                                file_size=file_size,
                                file_hash=file_hash,
                                sync_timestamp=datetime.now(),
                                metadata=metadata
                            )
                            
                            media_files.append(media)
                            
                        except Exception as e:
                            logger.error(f"미디어 파일 처리 실패 {file_path}: {e}")
        
        # 데이터베이스에 저장
        self.save_media_to_db(media_files)
        
        return media_files
    
    def sync_links(self, chat_room_id: str, chat_file_path: str) -> List[SyncLink]:
        """링크 동기화"""
        links = []
        
        if not os.path.exists(chat_file_path):
            return links
        
        with open(chat_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 카카오톡 대화 형식에서 링크 추출
        pattern = r'\[([^\]]+)\] \[([^\]]+)\] ([^:]+) : (.+)'
        
        for line in content.split('\n'):
            if not line.strip():
                continue
            
            match = re.match(pattern, line)
            if match:
                date_str, time_str, sender, message = match.groups()
                
                # 메시지에서 링크 추출
                message_links = self.extract_links_from_text(message)
                
                for link in message_links:
                    # 링크 ID 생성
                    link_id = f"{chat_room_id}_{hashlib.md5(link.encode()).hexdigest()[:8]}"
                    
                    # 링크 타입 분류
                    link_type = self.classify_link(link)
                    
                    # 링크 내용 분석
                    content_analysis = self.analyze_link_content(link)
                    
                    # 날짜시간 파싱
                    shared_at = self.parse_datetime(f"{date_str} {time_str}")
                    
                    sync_link = SyncLink(
                        id=link_id,
                        chat_room_id=chat_room_id,
                        url=link,
                        link_type=link_type,
                        shared_by=sender.strip(),
                        shared_at=shared_at,
                        content_analysis=content_analysis
                    )
                    
                    links.append(sync_link)
        
        # 데이터베이스에 저장
        self.save_links_to_db(links)
        
        return links
    
    def extract_message_components(self, content: str) -> Tuple[str, List[str], List[str]]:
        """메시지에서 타입, 미디어 파일, 링크 추출"""
        message_type = "text"
        media_files = []
        links = []
        
        # 이미지 파일 패턴
        image_patterns = [
            r'이미지\.(jpg|jpeg|png|gif|bmp)',
            r'사진\.(jpg|jpeg|png|gif|bmp)',
            r'\[이미지\]',
            r'\[사진\]'
        ]
        
        # 미디어 파일 패턴
        media_patterns = [
            r'동영상\.(mp4|avi|mov|mkv)',
            r'음성\.(mp3|wav|m4a)',
            r'\[동영상\]',
            r'\[음성\]'
        ]
        
        # 링크 패턴
        link_patterns = [
            r'https?://[^\s]+',
            r'www\.[^\s]+',
            r'\[링크\]([^\]]+)',
            r'\[URL\]([^\]]+)'
        ]
        
        # 이미지 확인
        for pattern in image_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                message_type = "image"
                media_files.append(content)
                break
        
        # 미디어 확인
        for pattern in media_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                message_type = "media"
                media_files.append(content)
                break
        
        # 링크 확인
        for pattern in link_patterns:
            matches = re.findall(pattern, content)
            links.extend(matches)
        
        return message_type, media_files, links
    
    def extract_links_from_text(self, text: str) -> List[str]:
        """텍스트에서 링크 추출"""
        link_patterns = [
            r'https?://[^\s]+',
            r'www\.[^\s]+',
            r'\[링크\]([^\]]+)',
            r'\[URL\]([^\]]+)'
        ]
        
        links = []
        for pattern in link_patterns:
            matches = re.findall(pattern, text)
            links.extend(matches)
        
        return links
    
    def classify_link(self, url: str) -> str:
        """링크 타입 분류"""
        url_lower = url.lower()
        
        if any(domain in url_lower for domain in ['youtube.com', 'youtu.be']):
            return 'youtube'
        elif any(domain in url_lower for domain in ['naver.com', 'blog.naver.com']):
            return 'naver'
        elif any(domain in url_lower for domain in ['daum.net', 'cafe.daum.net']):
            return 'daum'
        elif any(domain in url_lower for domain in ['google.com', 'docs.google.com']):
            return 'google'
        elif any(domain in url_lower for domain in ['facebook.com', 'fb.com']):
            return 'facebook'
        elif any(domain in url_lower for domain in ['instagram.com', 'ig.com']):
            return 'instagram'
        elif any(domain in url_lower for domain in ['twitter.com', 't.co', 'x.com']):
            return 'twitter'
        elif any(domain in url_lower for domain in ['kakao.com', 'kakao.co.kr']):
            return 'kakao'
        else:
            return 'other'
    
    def analyze_link_content(self, url: str) -> Dict[str, Any]:
        """링크 내용 분석"""
        try:
            response = requests.get(url, timeout=10)
            content = response.text
            
            # 기본 정보 추출
            title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
            title = title_match.group(1) if title_match else "제목 없음"
            
            # 메타 설명 추출
            desc_match = re.search(r'<meta name="description" content="(.*?)"', content, re.IGNORECASE)
            description = desc_match.group(1) if desc_match else ""
            
            return {
                'url': url,
                'title': title,
                'description': description,
                'status_code': response.status_code,
                'content_length': len(content)
            }
        except Exception as e:
            logger.error(f"링크 분석 실패 {url}: {e}")
            return {
                'url': url,
                'title': "분석 실패",
                'description': str(e),
                'status_code': 0,
                'content_length': 0
            }
    
    def calculate_file_hash(self, file_path: Path) -> str:
        """파일 해시 계산"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def get_file_type(self, file_path: Path) -> str:
        """파일 타입 결정"""
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if mime_type:
            return mime_type.split('/')[0]  # video, audio, image, application
        else:
            return "unknown"
    
    def extract_media_metadata(self, file_path: Path) -> Dict[str, Any]:
        """미디어 파일 메타데이터 추출"""
        try:
            stat = file_path.stat()
            return {
                'file_name': file_path.name,
                'file_extension': file_path.suffix,
                'file_size': stat.st_size,
                'created_time': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                'modified_time': datetime.fromtimestamp(stat.st_mtime).isoformat()
            }
        except Exception as e:
            logger.error(f"메타데이터 추출 실패 {file_path}: {e}")
            return {}
    
    def parse_datetime(self, datetime_str: str) -> datetime:
        """날짜시간 문자열 파싱"""
        try:
            return datetime.strptime(datetime_str, "%Y년 %m월 %d일 %H:%M")
        except ValueError:
            try:
                return datetime.strptime(datetime_str, "%Y. %m. %d. %H:%M")
            except ValueError:
                return datetime.now()
    
    def save_messages_to_db(self, messages: List[SyncMessage]):
        """메시지를 데이터베이스에 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for message in messages:
            cursor.execute('''
                INSERT OR REPLACE INTO sync_messages 
                (id, chat_room_id, sender, content, message_type, timestamp, 
                 media_files, links, file_size, file_hash, sync_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                message.id,
                message.chat_room_id,
                message.sender,
                message.content,
                message.message_type,
                message.timestamp,
                json.dumps(message.media_files) if message.media_files else None,
                json.dumps(message.links) if message.links else None,
                message.file_size,
                message.file_hash,
                message.sync_status
            ))
        
        conn.commit()
        conn.close()
    
    def save_media_to_db(self, media_files: List[SyncMedia]):
        """미디어 파일을 데이터베이스에 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for media in media_files:
            cursor.execute('''
                INSERT OR REPLACE INTO sync_media 
                (id, chat_room_id, original_path, classified_path, file_type, 
                 file_size, file_hash, sync_timestamp, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                media.id,
                media.chat_room_id,
                media.original_path,
                media.classified_path,
                media.file_type,
                media.file_size,
                media.file_hash,
                media.sync_timestamp,
                json.dumps(media.metadata) if media.metadata else None
            ))
        
        conn.commit()
        conn.close()
    
    def save_links_to_db(self, links: List[SyncLink]):
        """링크를 데이터베이스에 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for link in links:
            cursor.execute('''
                INSERT OR REPLACE INTO sync_links 
                (id, chat_room_id, url, link_type, shared_by, shared_at, 
                 content_analysis, sync_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                link.id,
                link.chat_room_id,
                link.url,
                link.link_type,
                link.shared_by,
                link.shared_at,
                json.dumps(link.content_analysis) if link.content_analysis else None,
                link.sync_status
            ))
        
        conn.commit()
        conn.close()
    
    def log_sync(self, chat_room_id: str, sync_type: str, status: str, message: str):
        """동기화 로그 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO sync_logs (chat_room_id, sync_type, status, message)
            VALUES (?, ?, ?, ?)
        ''', (chat_room_id, sync_type, status, message))
        
        conn.commit()
        conn.close()

# 전역 인스턴스 생성
sync_processor = ConversationSyncProcessor()
