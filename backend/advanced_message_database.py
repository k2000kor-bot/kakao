#!/usr/bin/env python3
"""
고도화된 카카오톡 메시지 데이터베이스 시스템
- 복합 미디어 메시지 지원 (텍스트+이미지+링크+파일)
- 메시지 구성 요소별 분석 및 저장
- 미디어 파일 메타데이터 추출
- 링크 콘텐츠 분석
- 문서 파일 내용 추출
"""

import os
import re
import json
import sqlite3
import hashlib
from datetime import datetime
from typing import List, Dict, Optional, Any, Union, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import logging
from urllib.parse import urlparse
import mimetypes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class MessageComponent:
    """메시지 구성 요소"""
    component_id: str
    component_type: str  # text, image, video, audio, document, link, file
    content: str
    metadata: Dict[str, Any]
    order_index: int
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None


@dataclass
class MediaFile:
    """미디어 파일 정보"""
    file_id: str
    original_name: str
    file_path: str
    file_type: str  # image, video, audio, document
    file_size: int
    mime_type: str
    width: Optional[int] = None
    height: Optional[int] = None
    duration: Optional[float] = None
    extracted_text: Optional[str] = None
    thumbnail_path: Optional[str] = None
    created_date: Optional[datetime] = None


@dataclass
class LinkInfo:
    """링크 정보"""
    link_id: str
    url: str
    domain: str
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    content_type: Optional[str] = None
    status_code: Optional[int] = None
    extracted_text: Optional[str] = None


@dataclass
class ComplexMessage:
    """복합 메시지"""
    message_id: str
    chat_room_id: str
    sender_id: str
    timestamp: datetime
    
    # 메시지 구성 요소들
    components: List[MessageComponent]
    
    # 연관된 파일들
    media_files: List[MediaFile]
    links: List[LinkInfo]
    
    # 메시지 분석 결과
    primary_content_type: str  # text, image, video, document, link, mixed
    content_summary: str
    extracted_text: str  # 모든 텍스트 통합
    topics: List[str]
    keywords: List[str]
    
    # 메타데이터
    is_forwarded: bool = False
    reply_to_message_id: Optional[str] = None
    mention_user_ids: List[str] = None
    
    def __post_init__(self):
        if self.mention_user_ids is None:
            self.mention_user_ids = []


class AdvancedMessageDatabase:
    """고도화된 메시지 데이터베이스"""
    
    def __init__(self, db_path: str = "kakao_messages.db", media_storage_path: str = "media_storage"):
        self.db_path = db_path
        self.media_storage_path = Path(media_storage_path)
        self.media_storage_path.mkdir(exist_ok=True)
        
        # 미디어 타입별 저장소
        self.image_storage = self.media_storage_path / "images"
        self.video_storage = self.media_storage_path / "videos"
        self.audio_storage = self.media_storage_path / "audio"
        self.document_storage = self.media_storage_path / "documents"
        self.thumbnail_storage = self.media_storage_path / "thumbnails"
        
        for storage in [self.image_storage, self.video_storage, self.audio_storage, 
                       self.document_storage, self.thumbnail_storage]:
            storage.mkdir(exist_ok=True)
            
        # 데이터베이스 초기화
        self._init_database()
        
        # 지원 파일 확장자
        self.image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'}
        self.video_extensions = {'.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'}
        self.audio_extensions = {'.mp3', '.wav', '.aac', '.ogg', '.m4a', '.flac'}
        self.document_extensions = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx', '.txt', '.md', '.hwp'}
        
    def _init_database(self):
        """데이터베이스 초기화"""
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 대화방 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chat_rooms (
                    room_id TEXT PRIMARY KEY,
                    room_name TEXT NOT NULL,
                    participant_count INTEGER,
                    created_date TIMESTAMP,
                    last_message_date TIMESTAMP,
                    total_messages INTEGER DEFAULT 0,
                    total_media_files INTEGER DEFAULT 0
                )
            """)
            
            # 사용자 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id TEXT PRIMARY KEY,
                    display_name TEXT,
                    profile_image_path TEXT,
                    first_seen TIMESTAMP,
                    last_seen TIMESTAMP,
                    message_count INTEGER DEFAULT 0
                )
            """)
            
            # 복합 메시지 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    message_id TEXT PRIMARY KEY,
                    chat_room_id TEXT,
                    sender_id TEXT,
                    timestamp TIMESTAMP,
                    primary_content_type TEXT,
                    content_summary TEXT,
                    extracted_text TEXT,
                    topics TEXT,
                    keywords TEXT,
                    is_forwarded BOOLEAN DEFAULT FALSE,
                    reply_to_message_id TEXT,
                    mention_user_ids TEXT,
                    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (room_id),
                    FOREIGN KEY (sender_id) REFERENCES users (user_id)
                )
            """)
            
            # 메시지 구성 요소 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS message_components (
                    component_id TEXT PRIMARY KEY,
                    message_id TEXT,
                    component_type TEXT,
                    content TEXT,
                    metadata TEXT,
                    order_index INTEGER,
                    file_path TEXT,
                    file_size INTEGER,
                    mime_type TEXT,
                    FOREIGN KEY (message_id) REFERENCES messages (message_id)
                )
            """)
            
            # 미디어 파일 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS media_files (
                    file_id TEXT PRIMARY KEY,
                    message_id TEXT,
                    original_name TEXT,
                    file_path TEXT,
                    file_type TEXT,
                    file_size INTEGER,
                    mime_type TEXT,
                    width INTEGER,
                    height INTEGER,
                    duration REAL,
                    extracted_text TEXT,
                    thumbnail_path TEXT,
                    created_date TIMESTAMP,
                    FOREIGN KEY (message_id) REFERENCES messages (message_id)
                )
            """)
            
            # 링크 정보 테이블
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS links (
                    link_id TEXT PRIMARY KEY,
                    message_id TEXT,
                    url TEXT,
                    domain TEXT,
                    title TEXT,
                    description TEXT,
                    image_url TEXT,
                    content_type TEXT,
                    status_code INTEGER,
                    extracted_text TEXT,
                    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (message_id) REFERENCES messages (message_id)
                )
            """)
            
            # 인덱스 생성
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(chat_room_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_components_message ON message_components(message_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_media_message ON media_files(message_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_links_message ON links(message_id)")
            
            conn.commit()
            
        logger.info("데이터베이스 초기화 완료")
        
    def parse_complex_message(self, raw_message: str, sender: str, timestamp: datetime, 
                            chat_room_id: str, media_folder: Optional[str] = None) -> ComplexMessage:
        """복합 메시지 파싱"""
        
        message_id = self._generate_message_id(sender, timestamp)
        
        # 메시지 구성 요소 분석
        components = self._analyze_message_components(raw_message, media_folder)
        
        # 미디어 파일 처리
        media_files = self._process_media_files(components, message_id)
        
        # 링크 처리
        links = self._extract_and_process_links(components, message_id)
        
        # 주요 콘텐츠 타입 결정
        primary_content_type = self._determine_primary_content_type(components)
        
        # 전체 텍스트 추출
        extracted_text = self._extract_all_text(components, media_files, links)
        
        # 내용 요약
        content_summary = self._generate_content_summary(components, media_files, links)
        
        # 주제 및 키워드 추출
        topics, keywords = self._extract_topics_keywords(extracted_text)
        
        # 멘션 사용자 추출
        mention_user_ids = self._extract_mentions(raw_message)
        
        complex_message = ComplexMessage(
            message_id=message_id,
            chat_room_id=chat_room_id,
            sender_id=sender,
            timestamp=timestamp,
            components=components,
            media_files=media_files,
            links=links,
            primary_content_type=primary_content_type,
            content_summary=content_summary,
            extracted_text=extracted_text,
            topics=topics,
            keywords=keywords,
            mention_user_ids=mention_user_ids
        )
        
        return complex_message
        
    def _analyze_message_components(self, raw_message: str, media_folder: Optional[str]) -> List[MessageComponent]:
        """메시지 구성 요소 분석"""
        
        components = []
        order_index = 0
        
        # 텍스트와 미디어 패턴 분리
        parts = self._split_message_parts(raw_message)
        
        for part in parts:
            part = part.strip()
            if not part:
                continue
                
            component_type, content, metadata = self._analyze_part(part, media_folder)
            
            if component_type:
                component_id = f"{hashlib.md5(f'{content}_{order_index}'.encode()).hexdigest()[:12]}"
                
                component = MessageComponent(
                    component_id=component_id,
                    component_type=component_type,
                    content=content,
                    metadata=metadata,
                    order_index=order_index
                )
                
                components.append(component)
                order_index += 1
                
        return components
        
    def _split_message_parts(self, message: str) -> List[str]:
        """메시지를 구성 요소별로 분리"""
        
        # 미디어 패턴들
        patterns = [
            r'<사진[^>]*>',
            r'<동영상[^>]*>',
            r'<음성[^>]*>',
            r'<파일[^>]*>',
            r'https?://[^\s]+',
        ]
        
        # 모든 패턴을 하나로 합치기
        combined_pattern = '|'.join(f'({pattern})' for pattern in patterns)
        
        # 텍스트와 미디어를 분리
        parts = re.split(combined_pattern, message)
        
        # 빈 문자열 제거
        return [part for part in parts if part and part.strip()]
        
    def _analyze_part(self, part: str, media_folder: Optional[str]) -> Tuple[str, str, Dict[str, Any]]:
        """개별 구성 요소 분석"""
        
        metadata = {}
        
        # 이미지 패턴
        if re.match(r'<사진[^>]*>', part):
            return 'image', part, {'type': 'kakao_image', 'original_tag': part}
            
        # 동영상 패턴
        if re.match(r'<동영상[^>]*>', part):
            return 'video', part, {'type': 'kakao_video', 'original_tag': part}
            
        # 음성 패턴
        if re.match(r'<음성[^>]*>', part):
            return 'audio', part, {'type': 'kakao_audio', 'original_tag': part}
            
        # 파일 패턴
        if re.match(r'<파일[^>]*>', part):
            return 'document', part, {'type': 'kakao_file', 'original_tag': part}
            
        # URL 패턴
        if re.match(r'https?://', part):
            parsed_url = urlparse(part)
            metadata = {
                'domain': parsed_url.netloc,
                'scheme': parsed_url.scheme,
                'full_url': part
            }
            return 'link', part, metadata
            
        # 일반 텍스트
        if part.strip():
            # 텍스트 메타데이터
            metadata = {
                'length': len(part),
                'word_count': len(part.split()),
                'has_korean': bool(re.search(r'[가-힣]', part)),
                'has_english': bool(re.search(r'[a-zA-Z]', part)),
                'has_numbers': bool(re.search(r'\d', part))
            }
            return 'text', part, metadata
            
        return None, '', {}
        
    def _process_media_files(self, components: List[MessageComponent], message_id: str) -> List[MediaFile]:
        """미디어 파일 처리"""
        
        media_files = []
        
        for component in components:
            if component.component_type in ['image', 'video', 'audio', 'document']:
                # 실제 파일 경로 찾기
                file_path = self._find_actual_file_path(component.content, component.component_type)
                
                if file_path and os.path.exists(file_path):
                    media_file = self._process_single_media_file(file_path, component.component_type, message_id)
                    if media_file:
                        media_files.append(media_file)
                        
        return media_files
        
    def _find_actual_file_path(self, tag_content: str, file_type: str) -> Optional[str]:
        """카카오톡 태그에서 실제 파일 경로 찾기"""
        
        # 카카오톡 미디어 폴더에서 파일 찾기 로직
        # 실제 구현시에는 파일명 매칭 알고리즘 필요
        
        # 임시 로직: 미디어 폴더에서 파일 검색
        media_folders = [
            "../chat_rooms/sample_chat_room/미디어",
            "../chat_rooms/sample_chat_room/문서"
        ]
        
        for folder in media_folders:
            if os.path.exists(folder):
                for file_name in os.listdir(folder):
                    file_path = os.path.join(folder, file_name)
                    if self._is_matching_file_type(file_path, file_type):
                        return file_path
                        
        return None
        
    def _is_matching_file_type(self, file_path: str, expected_type: str) -> bool:
        """파일 확장자로 타입 매칭"""
        
        ext = Path(file_path).suffix.lower()
        
        if expected_type == 'image':
            return ext in self.image_extensions
        elif expected_type == 'video':
            return ext in self.video_extensions
        elif expected_type == 'audio':
            return ext in self.audio_extensions
        elif expected_type == 'document':
            return ext in self.document_extensions
            
        return False
        
    def _process_single_media_file(self, file_path: str, file_type: str, message_id: str) -> Optional[MediaFile]:
        """개별 미디어 파일 처리"""
        
        try:
            file_path_obj = Path(file_path)
            file_id = hashlib.md5(f"{message_id}_{file_path}".encode()).hexdigest()[:16]
            
            # 기본 정보
            file_size = file_path_obj.stat().st_size
            mime_type, _ = mimetypes.guess_type(file_path)
            
            # 저장 위치 결정
            if file_type == 'image':
                storage_path = self.image_storage
            elif file_type == 'video':
                storage_path = self.video_storage
            elif file_type == 'audio':
                storage_path = self.audio_storage
            else:
                storage_path = self.document_storage
                
            # 파일 복사 (실제 구현시)
            new_file_path = storage_path / f"{file_id}{file_path_obj.suffix}"
            
            media_file = MediaFile(
                file_id=file_id,
                original_name=file_path_obj.name,
                file_path=str(new_file_path),
                file_type=file_type,
                file_size=file_size,
                mime_type=mime_type or 'application/octet-stream',
                created_date=datetime.fromtimestamp(file_path_obj.stat().st_mtime)
            )
            
            # 파일 타입별 추가 처리
            if file_type == 'image':
                media_file.width, media_file.height = self._get_image_dimensions(file_path)
            elif file_type == 'video':
                media_file.duration = self._get_video_duration(file_path)
                media_file.width, media_file.height = self._get_video_dimensions(file_path)
            elif file_type == 'audio':
                media_file.duration = self._get_audio_duration(file_path)
            elif file_type == 'document':
                media_file.extracted_text = self._extract_document_text(file_path)
                
            return media_file
            
        except Exception as e:
            logger.warning(f"미디어 파일 처리 실패 {file_path}: {e}")
            return None
            
    def _get_image_dimensions(self, file_path: str) -> Tuple[Optional[int], Optional[int]]:
        """이미지 크기 추출"""
        try:
            # PIL 사용 예시 (실제로는 pillow 설치 필요)
            # from PIL import Image
            # with Image.open(file_path) as img:
            #     return img.width, img.height
            
            # 임시로 기본값 반환
            return 1920, 1080
        except:
            return None, None
            
    def _get_video_duration(self, file_path: str) -> Optional[float]:
        """비디오 길이 추출"""
        # ffmpeg 또는 moviepy 사용 가능
        return None
        
    def _get_video_dimensions(self, file_path: str) -> Tuple[Optional[int], Optional[int]]:
        """비디오 크기 추출"""
        return None, None
        
    def _get_audio_duration(self, file_path: str) -> Optional[float]:
        """오디오 길이 추출"""
        return None
        
    def _extract_document_text(self, file_path: str) -> Optional[str]:
        """문서에서 텍스트 추출"""
        
        file_ext = Path(file_path).suffix.lower()
        
        try:
            if file_ext == '.txt':
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            elif file_ext == '.md':
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            elif file_ext == '.csv':
                raw = Path(file_path).read_bytes()
                for enc in ('utf-8-sig', 'utf-8', 'cp949', 'euc-kr'):
                    try:
                        return raw.decode(enc)
                    except UnicodeDecodeError:
                        continue
                return raw.decode('utf-8', errors='replace')
            elif file_ext == '.pdf':
                # PyPDF2 또는 pdfplumber 사용
                return "PDF 텍스트 추출 (구현 필요)"
            elif file_ext in ['.doc', '.docx']:
                # python-docx 사용
                return "Word 문서 텍스트 추출 (구현 필요)"
            elif file_ext in ['.xls', '.xlsx']:
                # openpyxl 또는 pandas 사용
                return "Excel 텍스트 추출 (구현 필요)"
            elif file_ext in ['.ppt', '.pptx']:
                # python-pptx 사용
                return "PowerPoint 텍스트 추출 (구현 필요)"
                
        except Exception as e:
            logger.warning(f"문서 텍스트 추출 실패 {file_path}: {e}")
            
        return None
        
    def _extract_and_process_links(self, components: List[MessageComponent], message_id: str) -> List[LinkInfo]:
        """링크 추출 및 처리"""
        
        links = []
        
        for component in components:
            if component.component_type == 'link':
                url = component.content
                link_id = hashlib.md5(f"{message_id}_{url}".encode()).hexdigest()[:16]
                
                parsed_url = urlparse(url)
                
                link_info = LinkInfo(
                    link_id=link_id,
                    url=url,
                    domain=parsed_url.netloc
                )
                
                # 링크 메타데이터 추출 (실제 구현시)
                link_info.title, link_info.description = self._fetch_link_metadata(url)
                
                links.append(link_info)
                
        return links
        
    def _fetch_link_metadata(self, url: str) -> Tuple[Optional[str], Optional[str]]:
        """링크 메타데이터 가져오기"""
        
        # requests + BeautifulSoup 사용 예시
        try:
            # response = requests.get(url, timeout=5)
            # soup = BeautifulSoup(response.text, 'html.parser')
            # title = soup.find('title')
            # description = soup.find('meta', attrs={'name': 'description'})
            
            # 임시로 기본값 반환
            return f"링크 제목 ({urlparse(url).netloc})", "링크 설명"
            
        except Exception as e:
            logger.warning(f"링크 메타데이터 추출 실패 {url}: {e}")
            return None, None
            
    def _determine_primary_content_type(self, components: List[MessageComponent]) -> str:
        """주요 콘텐츠 타입 결정"""
        
        if not components:
            return 'empty'
            
        # 구성 요소 타입별 개수
        type_counts = {}
        for component in components:
            type_counts[component.component_type] = type_counts.get(component.component_type, 0) + 1
            
        # 우선순위: image > video > document > audio > link > text
        priority = ['image', 'video', 'document', 'audio', 'link', 'text']
        
        for content_type in priority:
            if content_type in type_counts:
                # 혼합 타입인지 확인
                if len(type_counts) > 1:
                    return 'mixed'
                else:
                    return content_type
                    
        return 'text'
        
    def _extract_all_text(self, components: List[MessageComponent], 
                         media_files: List[MediaFile], links: List[LinkInfo]) -> str:
        """모든 텍스트 통합 추출"""
        
        all_texts = []
        
        # 구성 요소의 텍스트
        for component in components:
            if component.component_type == 'text':
                all_texts.append(component.content)
                
        # 미디어 파일에서 추출된 텍스트
        for media_file in media_files:
            if media_file.extracted_text:
                all_texts.append(media_file.extracted_text)
                
        # 링크 텍스트
        for link in links:
            if link.title:
                all_texts.append(link.title)
            if link.description:
                all_texts.append(link.description)
                
        return ' '.join(all_texts)
        
    def _generate_content_summary(self, components: List[MessageComponent], 
                                media_files: List[MediaFile], links: List[LinkInfo]) -> str:
        """내용 요약 생성"""
        
        summary_parts = []
        
        # 구성 요소 요약
        text_count = len([c for c in components if c.component_type == 'text'])
        image_count = len([c for c in components if c.component_type == 'image'])
        video_count = len([c for c in components if c.component_type == 'video'])
        audio_count = len([c for c in components if c.component_type == 'audio'])
        document_count = len([c for c in components if c.component_type == 'document'])
        link_count = len(links)
        
        if text_count > 0:
            # 첫 번째 텍스트의 일부
            first_text = next((c.content for c in components if c.component_type == 'text'), "")
            if first_text:
                summary_parts.append(f"텍스트: {first_text[:50]}...")
                
        if image_count > 0:
            summary_parts.append(f"이미지 {image_count}개")
        if video_count > 0:
            summary_parts.append(f"동영상 {video_count}개")
        if audio_count > 0:
            summary_parts.append(f"음성 {audio_count}개")
        if document_count > 0:
            summary_parts.append(f"문서 {document_count}개")
        if link_count > 0:
            summary_parts.append(f"링크 {link_count}개")
            
        return ", ".join(summary_parts) if summary_parts else "빈 메시지"
        
    def _extract_topics_keywords(self, text: str) -> Tuple[List[str], List[str]]:
        """주제 및 키워드 추출"""
        
        # 재건축 관련 주요 키워드
        topic_keywords = {
            "시공사": ["시공사", "건설사", "GS", "대우", "삼성", "현대", "롯데"],
            "분담금": ["분담금", "환급", "비용", "예산", "자금", "돈"],
            "커뮤니티": ["커뮤니티", "수영장", "사우나", "헬스", "시설"],
            "총회": ["총회", "투표", "안건", "승인", "결정", "회의"],
            "아파트": ["아파트", "단지", "입지", "가치", "브랜드", "프리미엄"]
        }
        
        found_topics = []
        found_keywords = []
        
        text_lower = text.lower()
        
        for topic, keywords in topic_keywords.items():
            topic_found = False
            for keyword in keywords:
                if keyword.lower() in text_lower:
                    found_keywords.append(keyword)
                    topic_found = True
                    
            if topic_found:
                found_topics.append(topic)
                
        return found_topics, found_keywords
        
    def _extract_mentions(self, message: str) -> List[str]:
        """멘션 사용자 추출"""
        
        # @사용자명 패턴 찾기
        mention_pattern = r'@([^\s]+)'
        mentions = re.findall(mention_pattern, message)
        
        return mentions
        
    def _generate_message_id(self, sender: str, timestamp: datetime) -> str:
        """메시지 ID 생성"""
        
        unique_string = f"{sender}_{timestamp.isoformat()}"
        return hashlib.md5(unique_string.encode()).hexdigest()[:16]
        
    def save_complex_message(self, complex_message: ComplexMessage) -> bool:
        """복합 메시지 저장"""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 메시지 저장
                cursor.execute("""
                    INSERT OR REPLACE INTO messages 
                    (message_id, chat_room_id, sender_id, timestamp, primary_content_type,
                     content_summary, extracted_text, topics, keywords, is_forwarded,
                     reply_to_message_id, mention_user_ids)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    complex_message.message_id,
                    complex_message.chat_room_id,
                    complex_message.sender_id,
                    complex_message.timestamp.isoformat(),
                    complex_message.primary_content_type,
                    complex_message.content_summary,
                    complex_message.extracted_text,
                    json.dumps(complex_message.topics),
                    json.dumps(complex_message.keywords),
                    complex_message.is_forwarded,
                    complex_message.reply_to_message_id,
                    json.dumps(complex_message.mention_user_ids)
                ))
                
                # 구성 요소 저장
                for component in complex_message.components:
                    cursor.execute("""
                        INSERT OR REPLACE INTO message_components
                        (component_id, message_id, component_type, content, metadata,
                         order_index, file_path, file_size, mime_type)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        component.component_id,
                        complex_message.message_id,
                        component.component_type,
                        component.content,
                        json.dumps(component.metadata),
                        component.order_index,
                        component.file_path,
                        component.file_size,
                        component.mime_type
                    ))
                
                # 미디어 파일 저장
                for media_file in complex_message.media_files:
                    cursor.execute("""
                        INSERT OR REPLACE INTO media_files
                        (file_id, message_id, original_name, file_path, file_type,
                         file_size, mime_type, width, height, duration, 
                         extracted_text, thumbnail_path, created_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        media_file.file_id,
                        complex_message.message_id,
                        media_file.original_name,
                        media_file.file_path,
                        media_file.file_type,
                        media_file.file_size,
                        media_file.mime_type,
                        media_file.width,
                        media_file.height,
                        media_file.duration,
                        media_file.extracted_text,
                        media_file.thumbnail_path,
                        media_file.created_date.isoformat() if media_file.created_date else None
                    ))
                
                # 링크 저장
                for link in complex_message.links:
                    cursor.execute("""
                        INSERT OR REPLACE INTO links
                        (link_id, message_id, url, domain, title, description,
                         image_url, content_type, status_code, extracted_text)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        link.link_id,
                        complex_message.message_id,
                        link.url,
                        link.domain,
                        link.title,
                        link.description,
                        link.image_url,
                        link.content_type,
                        link.status_code,
                        link.extracted_text
                    ))
                
                conn.commit()
                logger.info(f"복합 메시지 저장 완료: {complex_message.message_id}")
                return True
                
        except Exception as e:
            logger.error(f"복합 메시지 저장 실패: {e}")
            return False
            
    def search_messages(self, 
                       chat_room_id: Optional[str] = None,
                       sender_id: Optional[str] = None,
                       content_type: Optional[str] = None,
                       keywords: Optional[List[str]] = None,
                       start_date: Optional[datetime] = None,
                       end_date: Optional[datetime] = None,
                       has_media: Optional[bool] = None,
                       limit: int = 100) -> List[ComplexMessage]:
        """복합 조건으로 메시지 검색"""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                query_parts = ["SELECT * FROM messages WHERE 1=1"]
                params = []
                
                if chat_room_id:
                    query_parts.append("AND chat_room_id = ?")
                    params.append(chat_room_id)
                    
                if sender_id:
                    query_parts.append("AND sender_id = ?")
                    params.append(sender_id)
                    
                if content_type:
                    query_parts.append("AND primary_content_type = ?")
                    params.append(content_type)
                    
                if keywords:
                    keyword_conditions = []
                    for keyword in keywords:
                        keyword_conditions.append("extracted_text LIKE ?")
                        params.append(f"%{keyword}%")
                    query_parts.append(f"AND ({' OR '.join(keyword_conditions)})")
                    
                if start_date:
                    query_parts.append("AND timestamp >= ?")
                    params.append(start_date.isoformat())
                    
                if end_date:
                    query_parts.append("AND timestamp <= ?")
                    params.append(end_date.isoformat())
                    
                if has_media is not None:
                    if has_media:
                        query_parts.append("AND primary_content_type IN ('image', 'video', 'audio', 'document', 'mixed')")
                    else:
                        query_parts.append("AND primary_content_type = 'text'")
                        
                query_parts.append("ORDER BY timestamp DESC")
                query_parts.append("LIMIT ?")
                params.append(limit)
                
                query = " ".join(query_parts)
                cursor.execute(query, params)
                
                messages = []
                for row in cursor.fetchall():
                    # 메시지 재구성 (간단한 버전)
                    message_data = {
                        'message_id': row[0],
                        'chat_room_id': row[1],
                        'sender_id': row[2],
                        'timestamp': datetime.fromisoformat(row[3]),
                        'primary_content_type': row[4],
                        'content_summary': row[5],
                        'extracted_text': row[6],
                        'topics': json.loads(row[7]) if row[7] else [],
                        'keywords': json.loads(row[8]) if row[8] else []
                    }
                    
                    # 간단한 ComplexMessage 객체 생성
                    complex_msg = ComplexMessage(
                        message_id=message_data['message_id'],
                        chat_room_id=message_data['chat_room_id'],
                        sender_id=message_data['sender_id'],
                        timestamp=message_data['timestamp'],
                        components=[],
                        media_files=[],
                        links=[],
                        primary_content_type=message_data['primary_content_type'],
                        content_summary=message_data['content_summary'],
                        extracted_text=message_data['extracted_text'],
                        topics=message_data['topics'],
                        keywords=message_data['keywords']
                    )
                    
                    messages.append(complex_msg)
                    
                return messages
                
        except Exception as e:
            logger.error(f"메시지 검색 실패: {e}")
            return []
            
    def get_database_statistics(self) -> Dict[str, Any]:
        """데이터베이스 통계 정보"""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 기본 통계
                cursor.execute("SELECT COUNT(*) FROM messages")
                total_messages = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM media_files")
                total_media_files = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM links")
                total_links = cursor.fetchone()[0]
                
                # 콘텐츠 타입별 통계
                cursor.execute("""
                    SELECT primary_content_type, COUNT(*) 
                    FROM messages 
                    GROUP BY primary_content_type
                """)
                content_type_stats = dict(cursor.fetchall())
                
                # 사용자별 통계
                cursor.execute("""
                    SELECT sender_id, COUNT(*) 
                    FROM messages 
                    GROUP BY sender_id 
                    ORDER BY COUNT(*) DESC 
                    LIMIT 10
                """)
                top_users = cursor.fetchall()
                
                # 미디어 타입별 통계
                cursor.execute("""
                    SELECT file_type, COUNT(*), SUM(file_size) 
                    FROM media_files 
                    GROUP BY file_type
                """)
                media_type_stats = cursor.fetchall()
                
                return {
                    'total_messages': total_messages,
                    'total_media_files': total_media_files,
                    'total_links': total_links,
                    'content_type_distribution': content_type_stats,
                    'top_users': [{'user_id': user, 'message_count': count} for user, count in top_users],
                    'media_type_distribution': [
                        {'type': mtype, 'count': count, 'total_size': size} 
                        for mtype, count, size in media_type_stats
                    ],
                    'database_size': os.path.getsize(self.db_path) if os.path.exists(self.db_path) else 0
                }
                
        except Exception as e:
            logger.error(f"통계 조회 실패: {e}")
            return {}


# 사용 예시
if __name__ == "__main__":
    print("🗄️ 고도화된 메시지 데이터베이스 시스템 테스트")
    print("=" * 60)
    
    # 데이터베이스 초기화
    db = AdvancedMessageDatabase()
    
    # 테스트 메시지들
    test_messages = [
        {
            'content': '안녕하세요! 시공사 관련해서 의견 드리고 싶습니다. https://example.com/construction',
            'sender': '김조합원',
            'timestamp': datetime.now()
        },
        {
            'content': '<사진> 이 자료 보시면 대우 시공사가 좋을 것 같아요. <파일: 시공사비교표.xlsx>',
            'sender': '이조합원',
            'timestamp': datetime.now()
        },
        {
            'content': '<동영상> 총회 관련 영상입니다. 분담금 계산해보니 생각보다 많이 나오네요.',
            'sender': '박조합원',
            'timestamp': datetime.now()
        }
    ]
    
    # 메시지 파싱 및 저장
    for i, msg_data in enumerate(test_messages, 1):
        print(f"\n{i}. 메시지 파싱 중...")
        
        complex_msg = db.parse_complex_message(
            raw_message=msg_data['content'],
            sender=msg_data['sender'],
            timestamp=msg_data['timestamp'],
            chat_room_id='test_room_001'
        )
        
        print(f"   메시지 ID: {complex_msg.message_id}")
        print(f"   주요 타입: {complex_msg.primary_content_type}")
        print(f"   구성 요소: {len(complex_msg.components)}개")
        print(f"   미디어 파일: {len(complex_msg.media_files)}개")
        print(f"   링크: {len(complex_msg.links)}개")
        print(f"   요약: {complex_msg.content_summary}")
        
        # 데이터베이스 저장
        success = db.save_complex_message(complex_msg)
        print(f"   저장 결과: {'성공' if success else '실패'}")
    
    # 통계 정보
    print(f"\n📊 데이터베이스 통계:")
    stats = db.get_database_statistics()
    print(f"   총 메시지: {stats.get('total_messages', 0)}개")
    print(f"   미디어 파일: {stats.get('total_media_files', 0)}개")
    print(f"   링크: {stats.get('total_links', 0)}개")
    
    if stats.get('content_type_distribution'):
        print("   콘텐츠 타입별:")
        for ctype, count in stats['content_type_distribution'].items():
            print(f"     {ctype}: {count}개")
    
    print(f"\n🏆 고도화된 메시지 데이터베이스 시스템 테스트 완료!") 