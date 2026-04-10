#!/usr/bin/env python3
"""
카카오톡 대화 파일 통합 처리 시스템
- 새로운 대화 파일을 기존 폴더 구조와 동일하게 처리
- 미디어 파일 자동 분류 및 정리
- 데이터베이스 자동 저장
- 대화 마지막 "2" 문제 해결
"""

import os
import re
import json
import sqlite3
import shutil
import hashlib
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Any, Tuple
import logging
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ProcessedChatFile:
    """처리된 대화 파일 정보"""
    original_path: str
    processed_path: str
    chat_room_name: str
    message_count: int
    participant_count: int
    media_files_count: int
    start_date: datetime
    end_date: datetime
    processing_status: str
    error_message: Optional[str] = None


@dataclass
class MediaFile:
    """미디어 파일 정보"""
    original_path: str
    classified_path: str
    file_type: str
    file_size: int
    file_hash: str
    timestamp: Optional[datetime] = None


class ChatFileProcessor:
    """카카오톡 대화 파일 통합 처리기"""
    
    def __init__(self, base_dir: str = "chat_rooms", db_path: str = "processed_kakao_chat.db"):
        self.base_dir = Path(base_dir)
        self.db_path = db_path
        self.base_dir.mkdir(exist_ok=True)
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
                original_file_path TEXT,
                processed_file_path TEXT,
                message_count INTEGER,
                participant_count INTEGER,
                media_files_count INTEGER,
                start_date TIMESTAMP,
                end_date TIMESTAMP,
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
                message_type TEXT DEFAULT 'text',
                timestamp TIMESTAMP,
                line_number INTEGER,
                media_files TEXT,
                is_deleted BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
            )
        ''')
        
        # 미디어 파일 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS media_files (
                id TEXT PRIMARY KEY,
                chat_room_id TEXT,
                original_path TEXT,
                classified_path TEXT,
                file_type TEXT,
                file_size INTEGER,
                file_hash TEXT,
                timestamp TIMESTAMP,
                associated_message_id TEXT,
                FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id),
                FOREIGN KEY (associated_message_id) REFERENCES messages (id)
            )
        ''')
        
        # 처리 로그 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS processing_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT,
                processing_type TEXT,
                status TEXT,
                message TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def process_new_chat_file(self, file_path: str) -> ProcessedChatFile:
        """새로운 대화 파일 처리"""
        try:
            logger.info(f"새 대화 파일 처리 시작: {file_path}")
            
            # 1. 파일 존재 확인
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_path}")
            
            # 2. 대화방 정보 추출
            chat_room_info = self._extract_chat_room_info(file_path)
            
            # 3. 기존 폴더 구조 확인 및 생성
            target_dir = self._prepare_target_directory(chat_room_info['name'])
            
            # 4. 파일 복사 및 정리
            processed_file_path = self._copy_and_clean_file(file_path, target_dir, chat_room_info['name'])
            
            # 5. 메시지 파싱
            messages = self._parse_messages(processed_file_path)
            
            # 6. 미디어 파일 처리
            media_files = self._process_media_files(file_path, target_dir)
            
            # 7. 데이터베이스 저장
            chat_room_id = self._save_to_database(chat_room_info, messages, media_files, processed_file_path)
            
            # 8. 처리 결과 반환
            result = ProcessedChatFile(
                original_path=file_path,
                processed_path=processed_file_path,
                chat_room_name=chat_room_info['name'],
                message_count=len(messages),
                participant_count=len(set(msg['sender'] for msg in messages)),
                media_files_count=len(media_files),
                start_date=messages[0]['timestamp'] if messages else datetime.now(),
                end_date=messages[-1]['timestamp'] if messages else datetime.now(),
                processing_status="success"
            )
            
            logger.info(f"처리 완료: {result.chat_room_name} ({result.message_count}개 메시지, {result.media_files_count}개 미디어)")
            return result
            
        except Exception as e:
            logger.error(f"처리 실패: {e}")
            return ProcessedChatFile(
                original_path=file_path,
                processed_path="",
                chat_room_name="",
                message_count=0,
                participant_count=0,
                media_files_count=0,
                start_date=datetime.now(),
                end_date=datetime.now(),
                processing_status="failed",
                error_message=str(e)
            )
    
    def _extract_chat_room_info(self, file_path: str) -> Dict[str, Any]:
        """대화 파일에서 대화방 정보 추출"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # BOM 제거
        content = content.lstrip('\ufeff')
        lines = content.split('\n')
        
        # 대화방 이름 추출 (첫 번째 줄에서)
        room_name = ""
        for line in lines[:10]:  # 처음 10줄에서 찾기
            if "대화" in line or "채팅" in line or "☆" in line:
                # 특수 문자나 키워드가 포함된 경우
                room_name = line.strip()
                break
            elif "[" in line and "]" in line:
                # 대괄호로 둘러싸인 이름
                room_name = line.strip()
                break
        
        if not room_name:
            # 파일명에서 추출
            room_name = Path(file_path).stem
        
        # 참여자 수 추출 (헤더에서)
        participant_count = 0
        for line in lines[:20]:
            if "참여자" in line and "명" in line:
                match = re.search(r'(\d+)명', line)
                if match:
                    participant_count = int(match.group(1))
                    break
        
        # 저장 날짜 추출
        save_date = datetime.now()
        for line in lines[:20]:
            if "저장한 날짜" in line or "Saved on" in line:
                # 날짜 패턴 찾기
                date_match = re.search(r'(\d{4})[\.\-년]?\s*(\d{1,2})[\.\-월]?\s*(\d{1,2})', line)
                if date_match:
                    try:
                        save_date = datetime(
                            int(date_match.group(1)),
                            int(date_match.group(2)),
                            int(date_match.group(3))
                        )
                    except:
                        pass
                break
        
        return {
            'name': room_name,
            'participant_count': participant_count,
            'save_date': save_date
        }
    
    def _prepare_target_directory(self, room_name: str) -> Path:
        """대상 디렉토리 준비"""
        # 기존 폴더가 있는지 확인
        target_dir = self.base_dir / room_name
        
        if target_dir.exists():
            logger.info(f"기존 폴더 사용: {target_dir}")
        else:
            logger.info(f"새 폴더 생성: {target_dir}")
            target_dir.mkdir(parents=True, exist_ok=True)
            
            # 하위 폴더 생성
            (target_dir / "미디어").mkdir(exist_ok=True)
            (target_dir / "미디어" / "음성").mkdir(exist_ok=True)
            (target_dir / "미디어" / "동영상").mkdir(exist_ok=True)
            (target_dir / "문서").mkdir(exist_ok=True)
            (target_dir / "문서" / "Excel").mkdir(exist_ok=True)
            (target_dir / "문서" / "PDF").mkdir(exist_ok=True)
            (target_dir / "문서" / "Word").mkdir(exist_ok=True)
            (target_dir / "이미지").mkdir(exist_ok=True)
            (target_dir / "이미지" / "사진").mkdir(exist_ok=True)
            (target_dir / "이미지" / "스크린샷").mkdir(exist_ok=True)
        
        return target_dir
    
    def _copy_and_clean_file(self, source_path: str, target_dir: Path, room_name: str) -> str:
        """파일 복사 및 정리 (마지막 "2" 문제 해결)"""
        target_file = target_dir / f"{room_name}.txt"
        
        with open(source_path, 'r', encoding='utf-8') as source:
            content = source.read()
        
        # BOM 제거
        content = content.lstrip('\ufeff')
        
        # 라인별로 분리
        lines = content.split('\n')
        
        # 마지막 빈 라인들과 이상한 문자 제거
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            # 숫자만 있는 라인이나 이상한 문자 제거
            if line and not (line.isdigit() and len(line) <= 2):
                cleaned_lines.append(line)
        
        # 정리된 내용 저장
        with open(target_file, 'w', encoding='utf-8') as target:
            target.write('\n'.join(cleaned_lines))
        
        logger.info(f"파일 정리 완료: {len(lines)} -> {len(cleaned_lines)} 라인")
        return str(target_file)
    
    def _parse_messages(self, file_path: str) -> List[Dict[str, Any]]:
        """메시지 파싱"""
        messages = []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        
        # 카카오톡 메시지 패턴
        message_patterns = [
            r'(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2}), ([^:]+) : (.+)',
            r'(\d{4})\. (\d{1,2})\. (\d{1,2})\. (오전|오후) (\d{1,2}):(\d{2}), ([^:]+) : (.+)',
            r'(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{2}), ([^:]+) : (.+)'
        ]
        
        for line_num, line in enumerate(lines, 1):
            if not line.strip():
                continue
            
            for pattern in message_patterns:
                match = re.match(pattern, line)
                if match:
                    if len(match.groups()) == 8:  # 년월일 오전/오후 시분 형식
                        year, month, day, ampm, hour, minute, sender, content = match.groups()
                        hour = int(hour)
                        if ampm == '오후' and hour != 12:
                            hour += 12
                        elif ampm == '오전' and hour == 12:
                            hour = 0
                        
                        timestamp = datetime(int(year), int(month), int(day), hour, int(minute))
                    elif len(match.groups()) == 7:  # 시분 형식만
                        year, month, day, hour, minute, sender, content = match.groups()
                        timestamp = datetime(int(year), int(month), int(day), int(hour), int(minute))
                    else:
                        timestamp = datetime.now()
                    
                    # 메시지 타입 판단
                    message_type = 'text'
                    media_files = []
                    is_deleted = False
                    
                    if '삭제된 메시지입니다' in content:
                        message_type = 'deleted'
                        is_deleted = True
                    elif content.endswith('.jpg') or content.endswith('.png') or content.endswith('.gif'):
                        message_type = 'image'
                        media_files = [content]
                    elif content.endswith('.mp4') or content.endswith('.avi') or content.endswith('.mov'):
                        message_type = 'video'
                        media_files = [content]
                    elif content.endswith('.mp3') or content.endswith('.wav') or content.endswith('.m4a'):
                        message_type = 'audio'
                        media_files = [content]
                    elif 'http' in content or 'www.' in content:
                        message_type = 'link'
                    
                    message_id = hashlib.md5(f"{timestamp}_{sender}_{line_num}".encode()).hexdigest()
                    
                    messages.append({
                        'id': message_id,
                        'sender': sender.strip(),
                        'content': content.strip(),
                        'timestamp': timestamp,
                        'message_type': message_type,
                        'line_number': line_num,
                        'media_files': media_files,
                        'is_deleted': is_deleted
                    })
                    break
        
        return messages
    
    def _process_media_files(self, source_dir: str, target_dir: Path) -> List[MediaFile]:
        """미디어 파일 처리 및 분류"""
        media_files = []
        source_base = Path(source_dir).parent
        
        # 미디어 폴더들 확인
        media_folders = ['미디어', '이미지', '문서', 'media', 'images', 'documents']
        
        for folder_name in media_folders:
            media_source = source_base / folder_name
            if media_source.exists():
                media_files.extend(self._classify_and_copy_media(media_source, target_dir))
        
        return media_files
    
    def _classify_and_copy_media(self, source_dir: Path, target_dir: Path) -> List[MediaFile]:
        """미디어 파일 분류 및 복사"""
        media_files = []
        
        for file_path in source_dir.rglob('*'):
            if file_path.is_file():
                file_type = self._get_file_type(file_path)
                target_subdir = self._get_target_subdir(file_type, target_dir)
                
                # 대상 파일 경로
                target_file = target_subdir / file_path.name
                
                # 파일 복사 (중복되지 않도록)
                if not target_file.exists():
                    shutil.copy2(file_path, target_file)
                
                # 파일 정보 생성
                file_hash = self._calculate_file_hash(file_path)
                
                media_file = MediaFile(
                    original_path=str(file_path),
                    classified_path=str(target_file),
                    file_type=file_type,
                    file_size=file_path.stat().st_size,
                    file_hash=file_hash,
                    timestamp=datetime.fromtimestamp(file_path.stat().st_mtime)
                )
                
                media_files.append(media_file)
        
        return media_files
    
    def _get_file_type(self, file_path: Path) -> str:
        """파일 타입 판단"""
        suffix = file_path.suffix.lower()
        
        if suffix in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
            return 'image'
        elif suffix in ['.mp4', '.avi', '.mov', '.mkv', '.wmv']:
            return 'video'
        elif suffix in ['.mp3', '.wav', '.m4a', '.aac', '.flac']:
            return 'audio'
        elif suffix in ['.pdf']:
            return 'pdf'
        elif suffix in ['.doc', '.docx']:
            return 'word'
        elif suffix in ['.xls', '.xlsx', '.csv']:
            return 'excel'
        elif suffix in ['.txt', '.md']:
            return 'text'
        else:
            return 'other'
    
    def _get_target_subdir(self, file_type: str, target_dir: Path) -> Path:
        """파일 타입에 따른 대상 하위 디렉토리 결정"""
        type_mapping = {
            'image': target_dir / "미디어",
            'video': target_dir / "미디어" / "동영상",
            'audio': target_dir / "미디어" / "음성",
            'pdf': target_dir / "문서" / "PDF",
            'word': target_dir / "문서" / "Word",
            'excel': target_dir / "문서" / "Excel",
            'text': target_dir / "문서",
            'other': target_dir / "문서"
        }
        
        target_subdir = type_mapping.get(file_type, target_dir / "문서")
        target_subdir.mkdir(parents=True, exist_ok=True)
        return target_subdir
    
    def _calculate_file_hash(self, file_path: Path) -> str:
        """파일 해시 계산"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def _save_to_database(self, chat_room_info: Dict[str, Any], messages: List[Dict[str, Any]], 
                         media_files: List[MediaFile], processed_file_path: str) -> str:
        """데이터베이스에 저장"""
        chat_room_id = hashlib.md5(chat_room_info['name'].encode()).hexdigest()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # 대화방 정보 저장
            cursor.execute('''
                INSERT OR REPLACE INTO chat_rooms 
                (id, name, processed_file_path, message_count, participant_count, 
                 media_files_count, start_date, end_date, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                chat_room_id,
                chat_room_info['name'],
                processed_file_path,
                len(messages),
                chat_room_info['participant_count'],
                len(media_files),
                messages[0]['timestamp'] if messages else datetime.now(),
                messages[-1]['timestamp'] if messages else datetime.now(),
                datetime.now()
            ))
            
            # 메시지 저장
            for message in messages:
                cursor.execute('''
                    INSERT OR REPLACE INTO messages 
                    (id, chat_room_id, sender, content, message_type, timestamp, 
                     line_number, media_files, is_deleted)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    message['id'],
                    chat_room_id,
                    message['sender'],
                    message['content'],
                    message['message_type'],
                    message['timestamp'],
                    message['line_number'],
                    json.dumps(message['media_files']),
                    message['is_deleted']
                ))
            
            # 미디어 파일 저장
            for media_file in media_files:
                media_id = hashlib.md5(f"{chat_room_id}_{media_file.file_hash}".encode()).hexdigest()
                cursor.execute('''
                    INSERT OR REPLACE INTO media_files 
                    (id, chat_room_id, original_path, classified_path, file_type, 
                     file_size, file_hash, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    media_id,
                    chat_room_id,
                    media_file.original_path,
                    media_file.classified_path,
                    media_file.file_type,
                    media_file.file_size,
                    media_file.file_hash,
                    media_file.timestamp
                ))
            
            conn.commit()
            logger.info(f"데이터베이스 저장 완료: {chat_room_info['name']}")
            
        except Exception as e:
            conn.rollback()
            logger.error(f"데이터베이스 저장 실패: {e}")
            raise
        finally:
            conn.close()
        
        return chat_room_id
    
    def get_processing_summary(self) -> Dict[str, Any]:
        """처리 요약 정보 반환"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 통계 수집
        cursor.execute('SELECT COUNT(*) FROM chat_rooms')
        total_rooms = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM messages')
        total_messages = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM media_files')
        total_media = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(DISTINCT sender) FROM messages')
        total_participants = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_chat_rooms': total_rooms,
            'total_messages': total_messages,
            'total_media_files': total_media,
            'total_participants': total_participants,
            'database_path': self.db_path
        }


def main():
    """메인 함수 - 사용 예제"""
    processor = ChatFileProcessor()
    
    # 새 파일 처리 예제
    # result = processor.process_new_chat_file("path/to/new/chat_file.txt")
    # print(f"처리 결과: {result}")
    
    # 요약 정보 출력
    summary = processor.get_processing_summary()
    print("=== 처리 요약 ===")
    for key, value in summary.items():
        print(f"{key}: {value}")


if __name__ == "__main__":
    main() 