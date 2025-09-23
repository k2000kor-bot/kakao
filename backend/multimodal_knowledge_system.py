#!/usr/bin/env python3
"""
멀티모달 지식 시스템 - 업로드 및 양방향 웹 기반 지식 축적
Multimodal Knowledge System - Upload and Bidirectional Web-based Knowledge Accumulation

Features:
- 파일 업로드 기반 지식 수집 (PDF, DOC, TXT, 이미지, 오디오)
- 웹 크롤링 및 RSS 피드 수집
- 사용자 피드백 및 수정 제안
- 실시간 지식 업데이트 및 검증
- 다국어 지원 및 OCR 처리
"""

import json
import time
import sqlite3
import hashlib
import logging
import os
import mimetypes
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from enum import Enum
import threading
import queue
import re
import base64
import io

# 파일 처리 라이브러리
try:
    import PyPDF2
    import docx
    from PIL import Image
    import pytesseract
    import speech_recognition as sr
    import librosa
    import soundfile as sf
    FILE_PROCESSING_AVAILABLE = True
except ImportError:
    FILE_PROCESSING_AVAILABLE = False
    print("⚠️ 파일 처리 라이브러리를 사용할 수 없습니다")

# 웹 크롤링 라이브러리
try:
    import requests
    from bs4 import BeautifulSoup
    import feedparser
    import urllib.parse
    from urllib.robotparser import RobotFileParser
    WEB_CRAWLING_AVAILABLE = True
except ImportError:
    WEB_CRAWLING_AVAILABLE = False
    print("⚠️ 웹 크롤링 라이브러리를 사용할 수 없습니다")

logger = logging.getLogger(__name__)

class UploadType(Enum):
    """업로드 타입"""
    FILE = "file"              # 파일 업로드
    WEB_URL = "web_url"        # 웹 URL
    RSS_FEED = "rss_feed"      # RSS 피드
    MANUAL = "manual"          # 수동 입력
    FEEDBACK = "feedback"      # 사용자 피드백

class ContentType(Enum):
    """콘텐츠 타입"""
    TEXT = "text"
    PDF = "pdf"
    DOCUMENT = "document"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    WEB_PAGE = "web_page"
    RSS_ITEM = "rss_item"

class ProcessingStatus(Enum):
    """처리 상태"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    VERIFIED = "verified"

@dataclass
class UploadedContent:
    """업로드된 콘텐츠"""
    id: str
    upload_type: UploadType
    content_type: ContentType
    title: str
    content: str
    source_url: Optional[str]
    file_path: Optional[str]
    file_size: int
    upload_time: datetime
    processing_status: ProcessingStatus
    extracted_text: str
    metadata: Dict[str, Any]
    tags: List[str]
    language: str
    confidence_score: float

@dataclass
class UserFeedback:
    """사용자 피드백"""
    id: str
    knowledge_id: str
    feedback_type: str  # "correction", "addition", "rating", "question"
    content: str
    user_id: str
    timestamp: datetime
    rating: Optional[int]
    verified: bool

class MultimodalKnowledgeSystem:
    """멀티모달 지식 시스템"""
    
    def __init__(self, db_path: str = "multimodal_knowledge.db", upload_dir: str = "uploads"):
        self.db_path = db_path
        self.upload_dir = upload_dir
        self.processing_queue = queue.Queue()
        self.feedback_queue = queue.Queue()
        self.is_running = False
        
        # 업로드 디렉토리 생성
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(f"{self.upload_dir}/documents", exist_ok=True)
        os.makedirs(f"{self.upload_dir}/images", exist_ok=True)
        os.makedirs(f"{self.upload_dir}/audio", exist_ok=True)
        os.makedirs(f"{self.upload_dir}/videos", exist_ok=True)
        
        # 데이터베이스 초기화
        self._initialize_database()
        
        # 백그라운드 워커 시작
        self._start_background_workers()
        
        print("✅ 멀티모달 지식 시스템 초기화 완료")
    
    def _initialize_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 업로드된 콘텐츠 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS uploaded_content (
                id TEXT PRIMARY KEY,
                upload_type TEXT NOT NULL,
                content_type TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT,
                source_url TEXT,
                file_path TEXT,
                file_size INTEGER,
                upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processing_status TEXT DEFAULT 'pending',
                extracted_text TEXT,
                metadata TEXT,
                tags TEXT,
                language TEXT DEFAULT 'korean',
                confidence_score REAL DEFAULT 0.0
            )
        ''')
        
        # 사용자 피드백 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_feedback (
                id TEXT PRIMARY KEY,
                knowledge_id TEXT,
                feedback_type TEXT NOT NULL,
                content TEXT NOT NULL,
                user_id TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                rating INTEGER,
                verified BOOLEAN DEFAULT FALSE
            )
        ''')
        
        # 웹 크롤링 히스토리 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS crawling_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                title TEXT,
                content TEXT,
                crawl_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                success BOOLEAN DEFAULT TRUE,
                error_message TEXT
            )
        ''')
        
        # RSS 피드 구독 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS rss_feeds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                feed_url TEXT UNIQUE NOT NULL,
                title TEXT,
                description TEXT,
                last_updated TIMESTAMP,
                update_frequency INTEGER DEFAULT 3600,
                active BOOLEAN DEFAULT TRUE
            )
        ''')
        
        # 지식 검증 로그 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS verification_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_id TEXT,
                verification_type TEXT,
                old_content TEXT,
                new_content TEXT,
                verification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                verified_by TEXT,
                confidence_change REAL
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ 멀티모달 지식 시스템 데이터베이스 초기화 완료")
    
    def _start_background_workers(self):
        """백그라운드 워커 시작"""
        self.is_running = True
        
        # 콘텐츠 처리 워커
        processing_thread = threading.Thread(target=self._content_processing_worker, daemon=True)
        processing_thread.start()
        
        # 피드백 처리 워커
        feedback_thread = threading.Thread(target=self._feedback_processing_worker, daemon=True)
        feedback_thread.start()
        
        # RSS 피드 업데이트 워커
        rss_thread = threading.Thread(target=self._rss_update_worker, daemon=True)
        rss_thread.start()
        
        print("✅ 멀티모달 지식 시스템 백그라운드 워커 시작")
    
    def _content_processing_worker(self):
        """콘텐츠 처리 워커"""
        while self.is_running:
            try:
                if not self.processing_queue.empty():
                    content_item = self.processing_queue.get(timeout=1)
                    self._process_uploaded_content(content_item)
                else:
                    time.sleep(5)
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"콘텐츠 처리 워커 오류: {e}")
                time.sleep(10)
    
    def _feedback_processing_worker(self):
        """피드백 처리 워커"""
        while self.is_running:
            try:
                if not self.feedback_queue.empty():
                    feedback_item = self.feedback_queue.get(timeout=1)
                    self._process_user_feedback(feedback_item)
                else:
                    time.sleep(10)
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"피드백 처리 워커 오류: {e}")
                time.sleep(15)
    
    def _rss_update_worker(self):
        """RSS 피드 업데이트 워커"""
        while self.is_running:
            try:
                self._update_rss_feeds()
                time.sleep(3600)  # 1시간마다 업데이트
            except Exception as e:
                logger.error(f"RSS 업데이트 워커 오류: {e}")
                time.sleep(1800)  # 오류 시 30분 후 재시도
    
    def upload_file(self, file_data: bytes, filename: str, content_type: str, user_id: str = "anonymous") -> str:
        """파일 업로드"""
        try:
            # 파일 ID 생성
            file_id = hashlib.md5(f"{filename}_{time.time()}".encode()).hexdigest()
            
            # 파일 타입 결정
            content_type_enum = self._determine_content_type(content_type, filename)
            
            # 파일 저장 경로 결정
            file_path = self._get_file_path(content_type_enum, file_id, filename)
            
            # 파일 저장
            with open(file_path, 'wb') as f:
                f.write(file_data)
            
            # 업로드된 콘텐츠 생성
            uploaded_content = UploadedContent(
                id=file_id,
                upload_type=UploadType.FILE,
                content_type=content_type_enum,
                title=filename,
                content="",
                source_url=None,
                file_path=file_path,
                file_size=len(file_data),
                upload_time=datetime.now(),
                processing_status=ProcessingStatus.PENDING,
                extracted_text="",
                metadata={"original_filename": filename, "user_id": user_id},
                tags=[],
                language="korean",
                confidence_score=0.0
            )
            
            # 데이터베이스에 저장
            self._save_uploaded_content(uploaded_content)
            
            # 처리 큐에 추가
            self.processing_queue.put(uploaded_content)
            
            print(f"✅ 파일 업로드 완료: {filename} (ID: {file_id})")
            return file_id
            
        except Exception as e:
            logger.error(f"파일 업로드 실패: {e}")
            raise
    
    def upload_web_url(self, url: str, user_id: str = "anonymous") -> str:
        """웹 URL 업로드"""
        try:
            if not WEB_CRAWLING_AVAILABLE:
                raise Exception("웹 크롤링 기능을 사용할 수 없습니다")
            
            # URL ID 생성
            url_id = hashlib.md5(f"{url}_{time.time()}".encode()).hexdigest()
            
            # 웹 페이지 크롤링
            page_content = self._crawl_web_page(url)
            
            # 업로드된 콘텐츠 생성
            uploaded_content = UploadedContent(
                id=url_id,
                upload_type=UploadType.WEB_URL,
                content_type=ContentType.WEB_PAGE,
                title=page_content.get('title', url),
                content=page_content.get('content', ''),
                source_url=url,
                file_path=None,
                file_size=len(page_content.get('content', '')),
                upload_time=datetime.now(),
                processing_status=ProcessingStatus.PENDING,
                extracted_text=page_content.get('content', ''),
                metadata={"url": url, "user_id": user_id, "crawled_at": datetime.now().isoformat()},
                tags=page_content.get('tags', []),
                language=page_content.get('language', 'korean'),
                confidence_score=0.8
            )
            
            # 데이터베이스에 저장
            self._save_uploaded_content(uploaded_content)
            
            # 처리 큐에 추가
            self.processing_queue.put(uploaded_content)
            
            print(f"✅ 웹 URL 업로드 완료: {url} (ID: {url_id})")
            return url_id
            
        except Exception as e:
            logger.error(f"웹 URL 업로드 실패: {e}")
            raise
    
    def add_rss_feed(self, feed_url: str, title: str = "", description: str = "", update_frequency: int = 3600) -> int:
        """RSS 피드 추가"""
        try:
            if not WEB_CRAWLING_AVAILABLE:
                raise Exception("RSS 피드 기능을 사용할 수 없습니다")
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # RSS 피드 추가
            cursor.execute('''
                INSERT OR REPLACE INTO rss_feeds (feed_url, title, description, update_frequency, active)
                VALUES (?, ?, ?, ?, ?)
            ''', (feed_url, title, description, update_frequency, True))
            
            feed_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            print(f"✅ RSS 피드 추가 완료: {feed_url} (ID: {feed_id})")
            return feed_id
            
        except Exception as e:
            logger.error(f"RSS 피드 추가 실패: {e}")
            raise
    
    def submit_feedback(self, knowledge_id: str, feedback_type: str, content: str, user_id: str = "anonymous", rating: Optional[int] = None) -> str:
        """사용자 피드백 제출"""
        try:
            # 피드백 ID 생성
            feedback_id = hashlib.md5(f"{knowledge_id}_{feedback_type}_{time.time()}".encode()).hexdigest()
            
            # 피드백 생성
            feedback = UserFeedback(
                id=feedback_id,
                knowledge_id=knowledge_id,
                feedback_type=feedback_type,
                content=content,
                user_id=user_id,
                timestamp=datetime.now(),
                rating=rating,
                verified=False
            )
            
            # 데이터베이스에 저장
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO user_feedback (id, knowledge_id, feedback_type, content, user_id, timestamp, rating, verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                feedback.id,
                feedback.knowledge_id,
                feedback.feedback_type,
                feedback.content,
                feedback.user_id,
                feedback.timestamp,
                feedback.rating,
                feedback.verified
            ))
            
            conn.commit()
            conn.close()
            
            # 피드백 처리 큐에 추가
            self.feedback_queue.put(feedback)
            
            print(f"✅ 피드백 제출 완료: {feedback_type} (ID: {feedback_id})")
            return feedback_id
            
        except Exception as e:
            logger.error(f"피드백 제출 실패: {e}")
            raise
    
    def _determine_content_type(self, content_type: str, filename: str) -> ContentType:
        """콘텐츠 타입 결정"""
        if content_type.startswith('text/'):
            return ContentType.TEXT
        elif content_type == 'application/pdf':
            return ContentType.PDF
        elif content_type in ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
            return ContentType.DOCUMENT
        elif content_type.startswith('image/'):
            return ContentType.IMAGE
        elif content_type.startswith('audio/'):
            return ContentType.AUDIO
        elif content_type.startswith('video/'):
            return ContentType.VIDEO
        else:
            # 파일 확장자로 판단
            ext = filename.lower().split('.')[-1]
            if ext in ['pdf']:
                return ContentType.PDF
            elif ext in ['doc', 'docx']:
                return ContentType.DOCUMENT
            elif ext in ['jpg', 'jpeg', 'png', 'gif', 'bmp']:
                return ContentType.IMAGE
            elif ext in ['mp3', 'wav', 'm4a', 'flac']:
                return ContentType.AUDIO
            elif ext in ['mp4', 'avi', 'mov', 'mkv']:
                return ContentType.VIDEO
            else:
                return ContentType.TEXT
    
    def _get_file_path(self, content_type: ContentType, file_id: str, filename: str) -> str:
        """파일 저장 경로 결정"""
        ext = filename.split('.')[-1] if '.' in filename else 'bin'
        
        if content_type == ContentType.DOCUMENT:
            return f"{self.upload_dir}/documents/{file_id}.{ext}"
        elif content_type == ContentType.IMAGE:
            return f"{self.upload_dir}/images/{file_id}.{ext}"
        elif content_type == ContentType.AUDIO:
            return f"{self.upload_dir}/audio/{file_id}.{ext}"
        elif content_type == ContentType.VIDEO:
            return f"{self.upload_dir}/videos/{file_id}.{ext}"
        else:
            return f"{self.upload_dir}/documents/{file_id}.{ext}"
    
    def _save_uploaded_content(self, content: UploadedContent):
        """업로드된 콘텐츠 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO uploaded_content 
            (id, upload_type, content_type, title, content, source_url, file_path, file_size, 
             upload_time, processing_status, extracted_text, metadata, tags, language, confidence_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            content.id,
            content.upload_type.value,
            content.content_type.value,
            content.title,
            content.content,
            content.source_url,
            content.file_path,
            content.file_size,
            content.upload_time,
            content.processing_status.value,
            content.extracted_text,
            json.dumps(content.metadata, ensure_ascii=False),
            json.dumps(content.tags, ensure_ascii=False),
            content.language,
            content.confidence_score
        ))
        
        conn.commit()
        conn.close()
    
    def _process_uploaded_content(self, content: UploadedContent):
        """업로드된 콘텐츠 처리"""
        try:
            # 처리 상태 업데이트
            self._update_processing_status(content.id, ProcessingStatus.PROCESSING)
            
            # 콘텐츠 타입별 처리
            if content.content_type == ContentType.PDF:
                extracted_text = self._extract_pdf_text(content.file_path)
            elif content.content_type == ContentType.DOCUMENT:
                extracted_text = self._extract_document_text(content.file_path)
            elif content.content_type == ContentType.IMAGE:
                extracted_text = self._extract_image_text(content.file_path)
            elif content.content_type == ContentType.AUDIO:
                extracted_text = self._extract_audio_text(content.file_path)
            elif content.content_type == ContentType.WEB_PAGE:
                extracted_text = content.extracted_text
            else:
                extracted_text = content.content
            
            # 텍스트 분석 및 태그 생성
            tags = self._extract_tags_from_text(extracted_text)
            language = self._detect_language(extracted_text)
            
            # 콘텐츠 업데이트
            self._update_content_processing(content.id, extracted_text, tags, language)
            
            # 처리 완료 상태 업데이트
            self._update_processing_status(content.id, ProcessingStatus.COMPLETED)
            
            print(f"✅ 콘텐츠 처리 완료: {content.title} (ID: {content.id})")
            
        except Exception as e:
            logger.error(f"콘텐츠 처리 실패: {e}")
            self._update_processing_status(content.id, ProcessingStatus.FAILED)
    
    def _extract_pdf_text(self, file_path: str) -> str:
        """PDF 텍스트 추출"""
        if not FILE_PROCESSING_AVAILABLE:
            return "PDF 처리 기능을 사용할 수 없습니다."
        
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
        except Exception as e:
            logger.error(f"PDF 텍스트 추출 실패: {e}")
            return ""
    
    def _extract_document_text(self, file_path: str) -> str:
        """문서 텍스트 추출"""
        if not FILE_PROCESSING_AVAILABLE:
            return "문서 처리 기능을 사용할 수 없습니다."
        
        try:
            if file_path.endswith('.docx'):
                doc = docx.Document(file_path)
                text = ""
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
                return text.strip()
            else:
                # .doc 파일은 다른 라이브러리 필요
                return "DOC 파일 처리는 지원되지 않습니다."
        except Exception as e:
            logger.error(f"문서 텍스트 추출 실패: {e}")
            return ""
    
    def _extract_image_text(self, file_path: str) -> str:
        """이미지 텍스트 추출 (OCR)"""
        if not FILE_PROCESSING_AVAILABLE:
            return "이미지 처리 기능을 사용할 수 없습니다."
        
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image, lang='kor+eng')
            return text.strip()
        except Exception as e:
            logger.error(f"이미지 텍스트 추출 실패: {e}")
            return ""
    
    def _extract_audio_text(self, file_path: str) -> str:
        """오디오 텍스트 추출 (음성 인식)"""
        if not FILE_PROCESSING_AVAILABLE:
            return "오디오 처리 기능을 사용할 수 없습니다."
        
        try:
            # 음성 인식기 초기화
            recognizer = sr.Recognizer()
            
            # 오디오 파일 로드
            with sr.AudioFile(file_path) as source:
                audio = recognizer.record(source)
            
            # 한국어 음성 인식
            text = recognizer.recognize_google(audio, language='ko-KR')
            return text.strip()
        except Exception as e:
            logger.error(f"오디오 텍스트 추출 실패: {e}")
            return ""
    
    def _crawl_web_page(self, url: str) -> Dict[str, Any]:
        """웹 페이지 크롤링"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 제목 추출
            title = soup.find('title')
            title_text = title.get_text().strip() if title else url
            
            # 본문 추출
            content_selectors = ['article', 'main', '.content', '.post', '.entry']
            content = ""
            
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements:
                    content = ' '.join([elem.get_text().strip() for elem in elements])
                    break
            
            if not content:
                # 기본적으로 모든 텍스트 추출
                content = soup.get_text()
            
            # 태그 추출
            tags = []
            meta_keywords = soup.find('meta', {'name': 'keywords'})
            if meta_keywords:
                tags = [tag.strip() for tag in meta_keywords.get('content', '').split(',')]
            
            # 언어 감지
            html_tag = soup.find('html')
            language = html_tag.get('lang', 'ko') if html_tag else 'ko'
            
            return {
                'title': title_text,
                'content': content,
                'tags': tags,
                'language': language
            }
            
        except Exception as e:
            logger.error(f"웹 페이지 크롤링 실패: {e}")
            return {'title': url, 'content': '', 'tags': [], 'language': 'ko'}
    
    def _extract_tags_from_text(self, text: str) -> List[str]:
        """텍스트에서 태그 추출"""
        # 간단한 키워드 추출 (실제로는 더 정교한 NLP 기법 사용)
        keywords = []
        
        # 한국어 키워드 패턴
        korean_patterns = [
            r'[가-힣]{2,10}',  # 2-10자 한국어 단어
        ]
        
        for pattern in korean_patterns:
            matches = re.findall(pattern, text)
            keywords.extend(matches)
        
        # 영어 키워드 패턴
        english_patterns = [
            r'\b[A-Za-z]{3,15}\b',  # 3-15자 영어 단어
        ]
        
        for pattern in english_patterns:
            matches = re.findall(pattern, text)
            keywords.extend(matches)
        
        # 빈도 기반 필터링
        from collections import Counter
        word_freq = Counter(keywords)
        
        # 상위 10개 키워드 반환
        return [word for word, freq in word_freq.most_common(10) if freq > 1]
    
    def _detect_language(self, text: str) -> str:
        """언어 감지"""
        # 간단한 언어 감지 (실제로는 더 정교한 언어 감지 라이브러리 사용)
        korean_chars = len(re.findall(r'[가-힣]', text))
        english_chars = len(re.findall(r'[a-zA-Z]', text))
        
        if korean_chars > english_chars:
            return 'korean'
        else:
            return 'english'
    
    def _update_processing_status(self, content_id: str, status: ProcessingStatus):
        """처리 상태 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE uploaded_content 
            SET processing_status = ? 
            WHERE id = ?
        ''', (status.value, content_id))
        
        conn.commit()
        conn.close()
    
    def _update_content_processing(self, content_id: str, extracted_text: str, tags: List[str], language: str):
        """콘텐츠 처리 결과 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE uploaded_content 
            SET extracted_text = ?, tags = ?, language = ?, confidence_score = ?
            WHERE id = ?
        ''', (extracted_text, json.dumps(tags, ensure_ascii=False), language, 0.8, content_id))
        
        conn.commit()
        conn.close()
    
    def _process_user_feedback(self, feedback: UserFeedback):
        """사용자 피드백 처리"""
        try:
            if feedback.feedback_type == "correction":
                self._apply_correction(feedback)
            elif feedback.feedback_type == "addition":
                self._apply_addition(feedback)
            elif feedback.feedback_type == "rating":
                self._update_rating(feedback)
            
            # 피드백 검증 완료 처리
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE user_feedback 
                SET verified = TRUE 
                WHERE id = ?
            ''', (feedback.id,))
            
            conn.commit()
            conn.close()
            
            print(f"✅ 피드백 처리 완료: {feedback.feedback_type} (ID: {feedback.id})")
            
        except Exception as e:
            logger.error(f"피드백 처리 실패: {e}")
    
    def _apply_correction(self, feedback: UserFeedback):
        """수정 사항 적용"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 기존 내용 가져오기
        cursor.execute("SELECT content FROM uploaded_content WHERE id = ?", (feedback.knowledge_id,))
        old_content = cursor.fetchone()
        old_content = old_content[0] if old_content else ""
        
        # 내용 업데이트
        cursor.execute('''
            UPDATE uploaded_content 
            SET content = ?, confidence_score = confidence_score + 0.1
            WHERE id = ?
        ''', (feedback.content, feedback.knowledge_id))
        
        # 검증 로그 기록
        cursor.execute('''
            INSERT INTO verification_logs (content_id, verification_type, old_content, new_content, verification_time, verified_by, confidence_change)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (feedback.knowledge_id, 'correction', old_content, feedback.content, datetime.now(), feedback.user_id, 0.1))
        
        conn.commit()
        conn.close()
    
    def _apply_addition(self, feedback: UserFeedback):
        """추가 정보 적용"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 기존 내용 가져오기
        cursor.execute("SELECT content FROM uploaded_content WHERE id = ?", (feedback.knowledge_id,))
        old_content = cursor.fetchone()
        old_content = old_content[0] if old_content else ""
        
        # 내용에 추가
        new_content = old_content + "\n\n" + feedback.content
        
        cursor.execute('''
            UPDATE uploaded_content 
            SET content = ?, confidence_score = confidence_score + 0.05
            WHERE id = ?
        ''', (new_content, feedback.knowledge_id))
        
        # 검증 로그 기록
        cursor.execute('''
            INSERT INTO verification_logs (content_id, verification_type, old_content, new_content, verification_time, verified_by, confidence_change)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (feedback.knowledge_id, 'addition', old_content, new_content, datetime.now(), feedback.user_id, 0.05))
        
        conn.commit()
        conn.close()
    
    def _update_rating(self, feedback: UserFeedback):
        """평점 업데이트"""
        if feedback.rating is None:
            return
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 평점에 따른 신뢰도 조정
        confidence_change = (feedback.rating - 3) * 0.1  # 3점 기준으로 ±0.1씩 조정
        
        cursor.execute('''
            UPDATE uploaded_content 
            SET confidence_score = confidence_score + ?
            WHERE id = ?
        ''', (confidence_change, feedback.knowledge_id))
        
        conn.commit()
        conn.close()
    
    def _update_rss_feeds(self):
        """RSS 피드 업데이트"""
        if not WEB_CRAWLING_AVAILABLE:
            return
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 활성 RSS 피드 조회
            cursor.execute("SELECT * FROM rss_feeds WHERE active = TRUE")
            feeds = cursor.fetchall()
            
            for feed in feeds:
                feed_id, feed_url, title, description, last_updated, update_frequency, active = feed
                
                try:
                    # RSS 피드 파싱
                    feed_data = feedparser.parse(feed_url)
                    
                    for entry in feed_data.entries[:5]:  # 최신 5개 항목만
                        # RSS 항목을 콘텐츠로 변환
                        content_id = hashlib.md5(f"rss_{entry.link}_{entry.published}".encode()).hexdigest()
                        
                        # 중복 확인
                        cursor.execute("SELECT id FROM uploaded_content WHERE id = ?", (content_id,))
                        if cursor.fetchone():
                            continue
                        
                        # RSS 항목 저장
                        cursor.execute('''
                            INSERT INTO uploaded_content 
                            (id, upload_type, content_type, title, content, source_url, upload_time, 
                             processing_status, extracted_text, metadata, tags, language, confidence_score)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            content_id,
                            UploadType.RSS_FEED.value,
                            ContentType.RSS_ITEM.value,
                            entry.title,
                            entry.summary,
                            entry.link,
                            datetime.now(),
                            ProcessingStatus.COMPLETED.value,
                            entry.summary,
                            json.dumps({"rss_feed_id": feed_id, "published": entry.published}, ensure_ascii=False),
                            json.dumps([], ensure_ascii=False),
                            'korean',
                            0.7
                        ))
                    
                    # 마지막 업데이트 시간 갱신
                    cursor.execute('''
                        UPDATE rss_feeds 
                        SET last_updated = ? 
                        WHERE id = ?
                    ''', (datetime.now(), feed_id))
                    
                except Exception as e:
                    logger.error(f"RSS 피드 업데이트 실패 ({feed_url}): {e}")
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"RSS 피드 업데이트 워커 오류: {e}")
    
    def search_knowledge(self, query: str, content_types: List[ContentType] = None) -> List[Dict[str, Any]]:
        """지식 검색"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 검색 쿼리 구성
            where_conditions = ["(title LIKE ? OR content LIKE ? OR extracted_text LIKE ? OR tags LIKE ?)"]
            params = [f'%{query}%', f'%{query}%', f'%{query}%', f'%{query}%']
            
            if content_types:
                type_conditions = " OR ".join(["content_type = ?" for _ in content_types])
                where_conditions.append(f"({type_conditions})")
                params.extend([ct.value for ct in content_types])
            
            where_clause = " AND ".join(where_conditions)
            
            cursor.execute(f'''
                SELECT * FROM uploaded_content 
                WHERE {where_clause} AND processing_status = 'completed'
                ORDER BY confidence_score DESC, upload_time DESC
                LIMIT 20
            ''', params)
            
            results = []
            for row in cursor.fetchall():
                result = {
                    'id': row[0],
                    'upload_type': row[1],
                    'content_type': row[2],
                    'title': row[3],
                    'content': row[4],
                    'source_url': row[5],
                    'file_path': row[6],
                    'upload_time': row[7],
                    'extracted_text': row[9],
                    'tags': json.loads(row[12]) if row[12] else [],
                    'language': row[13],
                    'confidence_score': row[14]
                }
                results.append(result)
            
            conn.close()
            return results
            
        except Exception as e:
            logger.error(f"지식 검색 실패: {e}")
            return []
    
    def get_system_statistics(self) -> Dict[str, Any]:
        """시스템 통계 반환"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 총 콘텐츠 수
            cursor.execute("SELECT COUNT(*) FROM uploaded_content")
            total_content = cursor.fetchone()[0]
            
            # 콘텐츠 타입별 분포
            cursor.execute("SELECT content_type, COUNT(*) FROM uploaded_content GROUP BY content_type")
            content_type_distribution = dict(cursor.fetchall())
            
            # 처리 상태별 분포
            cursor.execute("SELECT processing_status, COUNT(*) FROM uploaded_content GROUP BY processing_status")
            processing_status_distribution = dict(cursor.fetchall())
            
            # 총 피드백 수
            cursor.execute("SELECT COUNT(*) FROM user_feedback")
            total_feedback = cursor.fetchone()[0]
            
            # RSS 피드 수
            cursor.execute("SELECT COUNT(*) FROM rss_feeds WHERE active = TRUE")
            active_rss_feeds = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                "total_content": total_content,
                "content_type_distribution": content_type_distribution,
                "processing_status_distribution": processing_status_distribution,
                "total_feedback": total_feedback,
                "active_rss_feeds": active_rss_feeds,
                "processing_queue_size": self.processing_queue.qsize(),
                "feedback_queue_size": self.feedback_queue.qsize(),
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"시스템 통계 조회 실패: {e}")
            return {}

# 전역 인스턴스
multimodal_knowledge_system = MultimodalKnowledgeSystem()
