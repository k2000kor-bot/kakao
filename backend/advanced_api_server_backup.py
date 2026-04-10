#!/usr/bin/env python3
"""
고도화된 카카오 AI 메시지 생성 API 서버 v7.0
- 카카오톡 대화 대응 학습 기능
- 개인별 맞춤형 메시지 생성
- 정치인 스타일 + 개인 특성 융합
- 실시간 학습 및 업데이트
"""

import os
import time
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import sqlite3
import shutil
import hashlib
import asyncio
import aiohttp
from openai import OpenAI
import functools
import random

from bs4 import BeautifulSoup
from urllib.parse import urlparse
import uuid

# 고급 감정 분석 시스템 통합
from advanced_emotion_analyzer import analyze_message_emotion, generate_tone_matched_response

# 통합 시스템
from integrated_ai_system import IntegratedAISystem, ConversationContext
from advanced_kakao_parser import AdvancedKakaoParser
from conversation_learner import ConversationLearner

# 정치인 스타일 API
from political_style_api import political_router, set_integrated_system

from cors_config import get_cors_allow_origins

# 샘플 프로젝트 분석기
from gaeposung_analyzer import gaeposung_analyzer
from gaeposung_project_api import gaeposung_project_api

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 캐싱 시스템
class CacheManager:
    def __init__(self, max_size=1000, ttl=300):  # 5분 TTL
        self.cache = {}
        self.max_size = max_size
        self.ttl = ttl
        self.access_times = {}
    
    def get(self, key: str) -> Optional[Any]:
        if key in self.cache:
            if time.time() - self.access_times.get(key, 0) < self.ttl:
                self.access_times[key] = time.time()
                return self.cache[key]
            else:
                del self.cache[key]
                del self.access_times[key]
        return None
    
    def set(self, key: str, value: Any):
        if len(self.cache) >= self.max_size:
            # LRU: 가장 오래된 항목 제거
            oldest_key = min(self.access_times.keys(), key=lambda k: self.access_times[k])
            del self.cache[oldest_key]
            del self.access_times[oldest_key]
        
        self.cache[key] = value
        self.access_times[key] = time.time()
    
    def clear(self):
        self.cache.clear()
        self.access_times.clear()

# 전역 캐시 매니저
cache_manager = CacheManager()

def cache_result(ttl=300):
    """캐싱 데코레이터"""
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # 캐시 키 생성
            cache_key = f"{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            # 캐시에서 결과 확인
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                logger.info(f"캐시 히트: {func.__name__}")
                return cached_result
            
            # 함수 실행
            result = await func(*args, **kwargs)
            
            # 결과 캐싱
            cache_manager.set(cache_key, result)
            logger.info(f"캐시 저장: {func.__name__}")
            
            return result
        return wrapper
    return decorator

# OpenAI 클라이언트 초기화
openai_client = None
try:
    # 환경변수에서 API 키 가져오기
    openai_api_key = os.getenv('OPENAI_API_KEY')
    
    # 환경변수가 없으면 테스트 키 사용
    if not openai_api_key:
        openai_api_key = "sk-test-key-for-development"
        logger.info("⚠️ 환경변수에서 API 키를 찾을 수 없어 테스트 키를 사용합니다.")
    
    if openai_api_key and openai_api_key != "sk-your-actual-api-key-here":
        openai_client = OpenAI(api_key=openai_api_key)
        logger.info("✅ OpenAI 클라이언트 초기화 완료")
    else:
        logger.warning("⚠️ OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
except Exception as e:
    logger.error(f"❌ OpenAI 클라이언트 초기화 실패: {str(e)}")

# 개선된 메시지 생성 로직
def analyze_context(context_messages):
    """문맥 분석"""
    if not context_messages:
        return {"tone": "neutral", "topics": [], "sentiment": "neutral"}
    
    recent_messages = context_messages[-5:]  # 최근 5개 메시지
    
    # 주제 추출
    topics = []
    for msg in recent_messages:
        if isinstance(msg, dict) and 'content' in msg:
            content = msg['content']
            # 간단한 키워드 추출
            keywords = extract_keywords(content)
            topics.extend(keywords)
    
    # 감정 분석
    sentiment = analyze_sentiment(recent_messages)
    
    # 톤 분석
    tone = analyze_tone(recent_messages)
    
    return {
        "tone": tone,
        "topics": list(set(topics)),
        "sentiment": sentiment,
        "message_count": len(recent_messages)
    }

def analyze_emotion(target_message):
    """감정 분석"""
    emotion_keywords = {
        "기쁨": ["좋아", "행복", "기쁘", "만족", "감사"],
        "슬픔": ["슬프", "우울", "힘들", "아프", "속상"],
        "화남": ["화나", "짜증", "분노", "열받", "답답"],
        "걱정": ["걱정", "불안", "우려", "염려", "근심"],
        "중립": ["그래", "알겠", "네", "응", "좋"]
    }
    
    if not target_message:
        return {"primary_emotion": "중립", "intensity": 0.5}
    
    content = target_message.lower()
    emotion_scores = {}
    
    for emotion, keywords in emotion_keywords.items():
        score = sum(1 for keyword in keywords if keyword in content)
        emotion_scores[emotion] = score
    
    primary_emotion = max(emotion_scores, key=emotion_scores.get)
    intensity = min(emotion_scores[primary_emotion] / 3, 1.0)
    
    return {
        "primary_emotion": primary_emotion,
        "intensity": intensity,
        "scores": emotion_scores
    }

def apply_personalized_style(settings):
    """개인화된 스타일 적용"""
    style_templates = {
        "formal": {
            "prefix": "안녕하세요, ",
            "suffix": "감사합니다.",
            "tone": "정중하고 격식있는"
        },
        "casual": {
            "prefix": "안녕! ",
            "suffix": "고마워!",
            "tone": "친근하고 편안한"
        },
        "empathetic": {
            "prefix": "정말 이해가 됩니다. ",
            "suffix": "함께 해결해보아요.",
            "tone": "공감적이고 따뜻한"
        },
        "professional": {
            "prefix": "검토해보니 ",
            "suffix": "참고하시기 바랍니다.",
            "tone": "전문적이고 논리적인"
        }
    }
    
    formality = settings.get('formality', 'casual')
    return style_templates.get(formality, style_templates['casual'])

def select_message_strategy(settings, emotion_analysis):
    """메시지 전략 선택"""
    emotion = emotion_analysis['primary_emotion']
    intensity = emotion_analysis['intensity']
    
    strategies = {
        "기쁨": {
            "high": "공감_축하",
            "medium": "공감_지지",
            "low": "동조_긍정"
        },
        "슬픔": {
            "high": "공감_위로",
            "medium": "공감_지지",
            "low": "동조_이해"
        },
        "화남": {
            "high": "공감_이해",
            "medium": "논리_해결",
            "low": "동조_진정"
        },
        "걱정": {
            "high": "공감_안심",
            "medium": "논리_정보",
            "low": "동조_지지"
        },
        "중립": {
            "high": "논리_정보",
            "medium": "동조_긍정",
            "low": "동조_단순"
        }
    }
    
    intensity_level = "high" if intensity > 0.7 else "medium" if intensity > 0.3 else "low"
    return strategies.get(emotion, strategies["중립"])[intensity_level]

def compose_message(target_message, context_analysis, emotion_analysis, personalized_style, strategy):
    """메시지 구성"""
    
    # 전략별 메시지 템플릿
    strategy_templates = {
        "공감_축하": "정말 축하드려요! {content}",
        "공감_위로": "정말 힘드셨겠어요. {content}",
        "공감_이해": "정말 이해가 됩니다. {content}",
        "공감_안심": "걱정하지 마세요. {content}",
        "공감_지지": "함께 해결해보아요. {content}",
        "논리_정보": "검토해보니 {content}",
        "논리_해결": "해결방안을 찾아보면 {content}",
        "동조_긍정": "맞습니다. {content}",
        "동조_이해": "그럴 수 있어요. {content}",
        "동조_진정": "차분히 생각해보면 {content}",
        "동조_단순": "{content}"
    }
    
    # 기본 메시지 내용 생성
    base_content = generate_base_content(target_message, context_analysis)
    
    # 전략 적용
    template = strategy_templates.get(strategy, strategy_templates["동조_단순"])
    content = template.format(content=base_content)
    
    # 개인화된 스타일 적용
    final_message = personalized_style['prefix'] + content + personalized_style['suffix']
    
    return {
        "content": final_message,
        "strategy": strategy,
        "emotion": emotion_analysis['primary_emotion'],
        "style": personalized_style['tone'],
        "context_used": len(context_analysis['topics']) > 0
    }

def generate_base_content(target_message, context_analysis):
    """기본 메시지 내용 생성"""
    if not target_message:
        return "좋은 하루 보내세요."
    
    # 문맥 기반 응답
    if context_analysis['topics']:
        topic = context_analysis['topics'][0]
        return f"{topic}에 대해 말씀해주셨네요. 정말 중요한 부분이에요."
    
    # 감정 기반 응답
    if context_analysis['sentiment'] == 'positive':
        return "정말 좋은 소식이네요!"
    elif context_analysis['sentiment'] == 'negative':
        return "힘드신 일이 있으셨군요."
    else:
        return "말씀해주신 내용 잘 들었습니다."

def extract_keywords(text):
    """간단한 키워드 추출"""
    keywords = []
    important_words = ["건설", "아파트", "분양", "가격", "위치", "학교", "교통", "환경", "시설"]
    
    for word in important_words:
        if word in text:
            keywords.append(word)
    
    return keywords

def analyze_sentiment(messages):
    """간단한 감정 분석"""
    positive_words = ["좋아", "행복", "감사", "만족", "기쁘"]
    negative_words = ["힘들", "아프", "슬프", "화나", "답답"]
    
    total_score = 0
    for msg in messages:
        if isinstance(msg, dict) and 'content' in msg:
            content = msg['content']
            positive_count = sum(1 for word in positive_words if word in content)
            negative_count = sum(1 for word in negative_words if word in content)
            total_score += positive_count - negative_count
    
    if total_score > 0:
        return "positive"
    elif total_score < 0:
        return "negative"
    else:
        return "neutral"

def analyze_tone(messages):
    """톤 분석"""
    formal_words = ["감사합니다", "부탁드립니다", "참고하시기"]
    casual_words = ["고마워", "안녕", "응", "그래"]
    
    formal_count = 0
    casual_count = 0
    
    for msg in messages:
        if isinstance(msg, dict) and 'content' in msg:
            content = msg['content']
            formal_count += sum(1 for word in formal_words if word in content)
            casual_count += sum(1 for word in casual_words if word in content)
    
    if formal_count > casual_count:
        return "formal"
    elif casual_count > formal_count:
        return "casual"
    else:
        return "neutral"

def generate_improved_message(target_message, context_messages, settings):
    """개선된 메시지 생성 로직"""
    
    # 1. 문맥 분석
    context_analysis = analyze_context(context_messages)
    
    # 2. 감정 분석
    emotion_analysis = analyze_emotion(target_message)
    
    # 3. 개인화된 스타일 적용
    personalized_style = apply_personalized_style(settings)
    
    # 4. 전략적 메시지 구성
    message_strategy = select_message_strategy(settings, emotion_analysis)
    
    # 5. 메시지 생성
    generated_message = compose_message(
        target_message, 
        context_analysis, 
        emotion_analysis, 
        personalized_style, 
        message_strategy
    )
    
    return generated_message

app = FastAPI(title="고도화된 카카오 AI API 서버 v7.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 정치인 스타일 라우터 추가
app.include_router(political_router)

# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "8.0",
        "services": {
            "api": "running",
            "ai_models": "ready",
            "database": "connected"
        }
    }

# 데이터베이스 초기화
def init_database():
    """데이터베이스 초기화"""
    conn = sqlite3.connect('chat_system.db')
    cursor = conn.cursor()
    
    # 대화방 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_rooms (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            message_count INTEGER DEFAULT 0,
            last_activity TEXT,
            is_active BOOLEAN DEFAULT 1,
            participants TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    ''')
    
    # 메시지 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            chat_room_id TEXT,
            content TEXT NOT NULL,
            sender TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            emotion TEXT,
            sentiment REAL,
            keywords TEXT,
            created_at TEXT,
            FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
        )
    ''')
    
    # 미디어 파일 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS media_files (
            id TEXT PRIMARY KEY,
            chat_room_id TEXT,
            original_path TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER,
            hash_value TEXT,
            processed_path TEXT,
            created_at TEXT,
            FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
        )
    ''')
    
    # 동기화 로그 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sync_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            chat_room_id TEXT,
            details TEXT,
            created_at TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# 파일 해시 생성
def get_file_hash(file_path):
    """파일의 해시값 생성"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

# 카카오톡 대화 파일 파싱
def parse_kakao_chat(file_path):
    """카카오톡 대화 파일 파싱 (중복 처리 포함)"""
    try:
        parser = AdvancedKakaoParser()
        room = parser.parse_chat_file(file_path)
        
        messages = []
        participants = set()
        
        for msg in room.messages:
            participants.add(msg.sender)
            messages.append({
                'sender': msg.sender,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'is_duplicate': msg.is_duplicate
            })
        
        return messages, list(participants)
        
    except Exception as e:
        logger.error(f"파일 파싱 오류: {file_path}, {e}")
        return [], []

# 미디어 파일 분류
def classify_media_files(chat_room_path):
    """미디어 파일 자동 분류"""
    media_files = []
    chat_room_id = os.path.basename(chat_room_path)
    
    # 미디어 폴더 경로
    media_path = os.path.join(chat_room_path, '미디어')
    if not os.path.exists(media_path):
        return media_files
    
    # 파일 타입별 분류
    file_types = {
        'images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
        'videos': ['.mp4', '.avi', '.mov', '.mkv'],
        'audios': ['.mp3', '.wav', '.m4a'],
        'documents': ['.pdf', '.doc', '.docx', '.txt', '.md', '.csv', '.xls', '.xlsx']
    }
    
    for root, dirs, files in os.walk(media_path):
        for file in files:
            file_path = os.path.join(root, file)
            file_ext = os.path.splitext(file)[1].lower()
            
            # 파일 타입 결정
            file_type = 'unknown'
            for type_name, extensions in file_types.items():
                if file_ext in extensions:
                    file_type = type_name
                    break
            
            # 파일 정보 수집
            file_size = os.path.getsize(file_path)
            file_hash = get_file_hash(file_path)
            
            # 처리된 경로 생성
            processed_dir = os.path.join('processed', 'media', file_type)
            os.makedirs(processed_dir, exist_ok=True)
            
            processed_path = os.path.join(processed_dir, f"{file_hash}{file_ext}")
            
            # 파일 복사 (중복 방지)
            if not os.path.exists(processed_path):
                shutil.copy2(file_path, processed_path)
            
            media_files.append({
                'id': file_hash,
                'chat_room_id': chat_room_id,
                'original_path': file_path,
                'file_type': file_type,
                'file_size': file_size,
                'hash_value': file_hash,
                'processed_path': processed_path
            })
    
    return media_files

# 대화방 동기화
def sync_chat_rooms():
    """대화방 자동 동기화"""
    chat_rooms_path = 'chat_rooms'
    if not os.path.exists(chat_rooms_path):
        logger.warning(f"대화방 폴더가 없습니다: {chat_rooms_path}")
        return []
    
    conn = sqlite3.connect('chat_system.db')
    cursor = conn.cursor()
    
    synced_rooms = []
    
    # 모든 대화방 폴더 스캔
    for room_folder in os.listdir(chat_rooms_path):
        room_path = os.path.join(chat_rooms_path, room_folder)
        if not os.path.isdir(room_path):
            continue
        
        # 대화방 ID 생성
        room_id = room_folder
        
        # 대화 파일 찾기 (개선된 검색)
        chat_files = []
        for file in os.listdir(room_path):
            if file.endswith('.txt'):
                chat_files.append(os.path.join(room_path, file))
        
        if not chat_files:
            logger.warning(f"대화 파일이 없습니다: {room_path}")
            continue
        
        # 가장 최근 파일 사용
        latest_chat_file = max(chat_files, key=os.path.getmtime)
        
        # 파일 해시 확인
        file_hash = get_file_hash(latest_chat_file)
        
        # 데이터베이스에서 기존 정보 확인
        cursor.execute('''
            SELECT id, message_count, last_activity, updated_at 
            FROM chat_rooms 
            WHERE id = ?
        ''', (room_id,))
        
        existing_room = cursor.fetchone()
        
        if existing_room:
            # 기존 대화방 업데이트 확인
            last_update = existing_room[3]
            if last_update and os.path.getmtime(latest_chat_file) <= datetime.fromisoformat(last_update).timestamp():
                # 변경사항 없음
                cursor.execute('''
                    SELECT * FROM chat_rooms WHERE id = ?
                ''', (room_id,))
                room_data = cursor.fetchone()
                synced_rooms.append({
                    'id': room_data[0],
                    'name': room_data[1],
                    'messageCount': room_data[2],
                    'lastActivity': room_data[3],
                    'isActive': bool(room_data[4]),
                    'participants': room_data[5].split(',') if room_data[5] else []
                })
                continue
        
        # 새로운 대화방 또는 업데이트
        messages, participants = parse_kakao_chat(latest_chat_file)
        
        # 미디어 파일 분류
        media_files = classify_media_files(room_path)
        
        # 데이터베이스 업데이트
        now = datetime.now().isoformat()
        
        if existing_room:
            # 기존 대화방 업데이트
            cursor.execute('''
                UPDATE chat_rooms 
                SET message_count = ?, last_activity = ?, updated_at = ?
                WHERE id = ?
            ''', (len(messages), now, now, room_id))
            
            # 기존 메시지 삭제
            cursor.execute('DELETE FROM messages WHERE chat_room_id = ?', (room_id,))
            
            # 동기화 로그
            cursor.execute('''
                INSERT INTO sync_logs (action, chat_room_id, details, created_at)
                VALUES (?, ?, ?, ?)
            ''', ('update', room_id, f'Updated {len(messages)} messages', now))
        else:
            # 새로운 대화방 추가
            cursor.execute('''
                INSERT INTO chat_rooms (id, name, message_count, last_activity, participants, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (room_id, room_folder, len(messages), now, ','.join(participants), now, now))
            
            # 동기화 로그
            cursor.execute('''
                INSERT INTO sync_logs (action, chat_room_id, details, created_at)
                VALUES (?, ?, ?, ?)
            ''', ('create', room_id, f'Created with {len(messages)} messages', now))
        
        # 메시지 저장
        for i, msg in enumerate(messages):
            message_id = f"{room_id}_msg_{i}"
            cursor.execute('''
                INSERT INTO messages (id, chat_room_id, content, sender, timestamp, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (message_id, room_id, msg['content'], msg['sender'], msg['timestamp'], now))
        
        # 미디어 파일 저장
        for media in media_files:
            cursor.execute('''
                INSERT OR REPLACE INTO media_files 
                (id, chat_room_id, original_path, file_type, file_size, hash_value, processed_path, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (media['id'], media['chat_room_id'], media['original_path'], 
                  media['file_type'], media['file_size'], media['hash_value'], 
                  media['processed_path'], now))
        
        synced_rooms.append({
            'id': room_id,
            'name': room_folder,
            'messageCount': len(messages),
            'lastActivity': now,
            'isActive': True,
            'participants': participants
        })
        
        logger.info(f"대화방 동기화 완료: {room_id} ({len(messages)}개 메시지, {len(media_files)}개 미디어)")
    
    conn.commit()
    conn.close()
    
    return synced_rooms


def auto_detect_new_chat_rooms():
    """새로운 대화방 자동 감지"""
    chat_rooms_path = 'chat_rooms'
    if not os.path.exists(chat_rooms_path):
        return []
    
    conn = sqlite3.connect('chat_system.db')
    cursor = conn.cursor()
    
    # 기존 대화방 목록 조회
    cursor.execute('SELECT id FROM chat_rooms')
    existing_rooms = {row[0] for row in cursor.fetchall()}
    
    new_rooms = []
    
    for room_folder in os.listdir(chat_rooms_path):
        room_path = os.path.join(chat_rooms_path, room_folder)
        if not os.path.isdir(room_path):
            continue
        
        if room_folder not in existing_rooms:
            # 새로운 대화방 발견
            chat_files = [f for f in os.listdir(room_path) if f.endswith('.txt')]
            if chat_files:
                new_rooms.append({
                    'id': room_folder,
                    'name': room_folder,
                    'path': room_path,
                    'chat_files': chat_files
                })
                logger.info(f"새로운 대화방 발견: {room_folder}")
    
    conn.close()
    return new_rooms

# 전역 시스템 인스턴스
integrated_system: Optional[IntegratedAISystem] = None


# Pydantic 모델들
class PersonalizedMessageRequest(BaseModel):
    person_id: str
    target_topic: str
    message_intent: str
    use_political_style: Optional[str] = None
    political_blend_ratio: float = 0.3
    context_messages: Optional[List[Dict[str, Any]]] = None


class PersonalizedMessageResponse(BaseModel):
    success: bool
    message: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    generation_metadata: Optional[Dict[str, Any]] = None


class StyleRecommendationRequest(BaseModel):
    person_id: str
    target_topic: str


class ChatFileUploadResponse(BaseModel):
    success: bool
    processed_file: str
    learned_profiles: int
    error: Optional[str] = None


class SystemStatusResponse(BaseModel):
    system_version: str
    status: str
    learned_profiles: int
    total_learning_data: int
    available_features: List[str]
    last_updated: str


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 통합 시스템 초기화"""
    global integrated_system
    
    logger.info("🚀 고도화된 카카오 AI API 서버 v7.0 시작...")
    
    try:
        # 통합 시스템 초기화 (상대 경로 수정)
        integrated_system = IntegratedAISystem(chat_rooms_path="../chat_rooms")
        logger.info("✅ 통합 AI 시스템 초기화 완료")
        
        # 정치인 스타일 API에 통합 시스템 설정
        set_integrated_system(integrated_system)
        logger.info("✅ 정치인 스타일 API 초기화 완료")
        
    except Exception as e:
        logger.error(f"❌ 시스템 초기화 실패: {e}")
        raise


@app.get("/", response_model=Dict[str, Any])
async def root():
    """루트 엔드포인트"""
    
    return {
        "service": "카카오 AI 메시지 생성 API",
        "version": "7.0.0",
        "description": "실제 대화 학습 기반 개인 맞춤형 AI 메시지 생성",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "key_features": [
            "카카오톡 대화 대응 학습",
            "개인별 성향 분석",
            "맞춤형 메시지 생성",
            "정치인 스타일 융합",
            "실시간 품질 평가",
            "스타일 자동 추천"
        ],
        "api_endpoints": {
            "personalized_message": "/api/v7/personalized-message",
            "style_recommendation": "/api/v7/style-recommendation",
            "upload_chat": "/api/v7/upload-chat",
            "profiles": "/api/v7/profiles",
            "system_status": "/api/v7/status",
            "learning": "/api/v7/learning"
        }
    }


@app.get("/api/v7/status")
@cache_result(ttl=60)  # 1분 캐시
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "online",
        "version": "7.0",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "고급 메시지 생성",
            "대화 분석",
            "시뮬레이션",
            "자동 동기화"
        ]
    }

@app.get("/api/v7/chat-rooms")
@cache_result(ttl=300)  # 5분 캐시
async def get_chat_rooms():
    """대화방 목록 조회"""
    try:
        # 동기화 실행
        synced_rooms = sync_chat_rooms()
        
        return {
            "success": True,
            "chat_rooms": synced_rooms,
            "sync_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"대화방 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "chat_rooms": []
        }

@app.get("/api/v7/chat-messages/{chat_room_id}")
@cache_result(ttl=180)  # 3분 캐시
async def get_chat_messages(chat_room_id: str):
    """대화 메시지 조회"""
    try:
        logger.info(f"메시지 조회 시작: {chat_room_id}")
        
        # 대화방 ID를 실제 폴더명으로 매핑 (URL 디코딩 포함)
        import urllib.parse
        decoded_room_id = urllib.parse.unquote(chat_room_id)
        
        # 동적 대화방 매핑 시스템
        def find_chat_room_file(room_id: str) -> tuple[str, str]:
            """대화방 파일을 동적으로 찾는 함수"""
            chat_rooms_path = "../chat_rooms"
            
            # 1. 정확한 매칭 시도
            exact_path = f"{chat_rooms_path}/{room_id}/{room_id}.txt"
            if os.path.exists(exact_path):
                return room_id, exact_path
            
            # 2. 폴더 내에서 .txt 파일 찾기
            room_folder = f"{chat_rooms_path}/{room_id}"
            if os.path.exists(room_folder) and os.path.isdir(room_folder):
                txt_files = [f for f in os.listdir(room_folder) if f.endswith('.txt')]
                if txt_files:
                    # 가장 큰 파일 선택 (메인 대화 파일)
                    largest_file = max(txt_files, key=lambda f: os.path.getsize(os.path.join(room_folder, f)))
                    return room_id, os.path.join(room_folder, largest_file)
            
            # 3. 부분 매칭 시도 (특수문자 처리)
            for folder in os.listdir(chat_rooms_path):
                folder_path = os.path.join(chat_rooms_path, folder)
                if os.path.isdir(folder_path):
                    # URL 인코딩된 문자 처리
                    normalized_folder = folder.replace('|', '7').replace('%7C', '7')
                    normalized_room_id = room_id.replace('|', '7').replace('%7C', '7')
                    
                    if normalized_folder == normalized_room_id or folder == room_id:
                        txt_files = [f for f in os.listdir(folder_path) if f.endswith('.txt')]
                        if txt_files:
                            largest_file = max(txt_files, key=lambda f: os.path.getsize(os.path.join(folder_path, f)))
                            return folder, os.path.join(folder_path, largest_file)
            
            return None, None
        
        # 기존 매핑 (하위 호환성)
        room_mapping = {
            "sample_chat_room 110 님과 카카오톡 대화": "sample_chat_room",
            "[데모] 샘플 대화보내기 110 님과 카카오톡 대화": "sample_chat_room",
            "테스트 카카오톡 대화 파일 님과 카카오톡 대화": "테스트 카카오톡 대화 파일"
        }
        
        # 매핑 시도
        actual_room_name = room_mapping.get(decoded_room_id, decoded_room_id)
        chat_file_path = f"../chat_rooms/{actual_room_name}/{actual_room_name}.txt"
        
        # 동적 검색으로 파일 찾기
        if not os.path.exists(chat_file_path):
            found_room, found_path = find_chat_room_file(decoded_room_id)
            if found_room and found_path:
                actual_room_name = found_room
                chat_file_path = found_path
                logger.info(f"동적 매핑 성공: {decoded_room_id} -> {actual_room_name}")
            else:
                logger.error(f"대화 파일을 찾을 수 없습니다: {decoded_room_id}")
                return {
                    "success": False,
                    "error": f"대화 파일을 찾을 수 없습니다: {decoded_room_id}",
                    "messages": []
                }
        
        if not os.path.exists(chat_file_path):
            logger.error(f"대화 파일을 찾을 수 없습니다: {chat_file_path}")
            return {
                "success": False,
                "error": f"대화 파일을 찾을 수 없습니다: {chat_file_path}",
                "messages": []
            }
        
        # 파일에서 직접 파싱
        parser = AdvancedKakaoParser()
        room = parser.parse_chat_file(chat_file_path, chat_room_id)
        
        messages = []
        for msg in room.messages:
            messages.append({
                'id': msg.message_hash,
                'content': msg.content,
                'sender': msg.sender,
                'timestamp': msg.timestamp.isoformat(),
                'is_deleted': msg.is_deleted,
                'is_duplicate': msg.is_duplicate
            })
        
        logger.info(f"대화방 {chat_room_id}의 메시지 수: {len(messages)}")
        
        return {
            "success": True,
            "chat_room_id": chat_room_id,
            "message_count": len(messages),
            "messages": messages
        }
        
    except Exception as e:
        logger.error(f"메시지 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "messages": []
        }

@app.get("/api/v7/media-files/{chat_room_id}")
async def get_media_files(chat_room_id: str):
    """미디어 파일 조회"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, file_type, file_size, processed_path, created_at
            FROM media_files 
            WHERE chat_room_id = ?
            ORDER BY created_at
        ''', (chat_room_id,))
        
        media_files = []
        for row in cursor.fetchall():
            media_files.append({
                'id': row[0],
                'file_type': row[1],
                'file_size': row[2],
                'processed_path': row[3],
                'created_at': row[4]
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

@app.post("/api/v7/sync")
async def manual_sync():
    """수동 동기화 실행"""
    try:
        synced_rooms = sync_chat_rooms()
        
        return {
            "success": True,
            "synced_rooms": len(synced_rooms),
            "details": [room['name'] for room in synced_rooms],
            "sync_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"동기화 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/sync-status")
async def get_sync_status():
    """동기화 상태 확인"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        # 최근 동기화 로그 조회
        cursor.execute('''
            SELECT action, chat_room_id, details, created_at
            FROM sync_logs 
            ORDER BY created_at DESC 
            LIMIT 10
        ''')
        
        recent_logs = []
        for row in cursor.fetchall():
            recent_logs.append({
                'action': row[0],
                'chat_room_id': row[1],
                'details': row[2],
                'created_at': row[3]
            })
        
        # 통계 정보
        cursor.execute('SELECT COUNT(*) FROM chat_rooms')
        total_rooms = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM messages')
        total_messages = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM media_files')
        total_media = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "success": True,
            "total_rooms": total_rooms,
            "total_messages": total_messages,
            "total_media": total_media,
            "recent_logs": recent_logs,
            "last_sync": recent_logs[0]['created_at'] if recent_logs else None
        }
    except Exception as e:
        logger.error(f"동기화 상태 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/api/v7/auto-sync")
async def auto_sync_chat_rooms():
    """자동 대화방 동기화"""
    try:
        # 새로운 대화방 감지
        new_rooms = auto_detect_new_chat_rooms()
        
        # 동기화 실행
        synced_rooms = sync_chat_rooms()
        
        return {
            "success": True,
            "synced_rooms": len(synced_rooms),
            "new_rooms_detected": len(new_rooms),
            "new_rooms": new_rooms,
            "sync_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"자동 동기화 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/v7/chat-rooms/discover")
async def discover_chat_rooms():
    """새로운 대화방 탐지"""
    try:
        new_rooms = auto_detect_new_chat_rooms()
        
        return {
            "success": True,
            "new_rooms_count": len(new_rooms),
            "new_rooms": new_rooms,
            "discovery_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"대화방 탐지 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/v7/chat-rooms/{room_id}/info")
async def get_chat_room_info(room_id: str):
    """대화방 상세 정보 조회"""
    try:
        import urllib.parse
        decoded_room_id = urllib.parse.unquote(room_id)
        
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, message_count, last_activity, participants, created_at, updated_at
            FROM chat_rooms WHERE id = ?
        ''', (decoded_room_id,))
        
        room_data = cursor.fetchone()
        
        if not room_data:
            return {
                "success": False,
                "error": f"대화방을 찾을 수 없습니다: {decoded_room_id}"
            }
        
        # 미디어 파일 수 조회
        cursor.execute('''
            SELECT COUNT(*) FROM media_files WHERE chat_room_id = ?
        ''', (decoded_room_id,))
        media_count = cursor.fetchone()[0]
        
        # 참여자별 메시지 수
        cursor.execute('''
            SELECT sender, COUNT(*) as message_count
            FROM messages 
            WHERE chat_room_id = ?
            GROUP BY sender
            ORDER BY message_count DESC
        ''', (decoded_room_id,))
        participant_stats = [
            {"sender": row[0], "message_count": row[1]} 
            for row in cursor.fetchall()
        ]
        
        conn.close()
        
        return {
            "success": True,
            "room_info": {
                "id": room_data[0],
                "name": room_data[1],
                "message_count": room_data[2],
                "last_activity": room_data[3],
                "participants": room_data[4].split(',') if room_data[4] else [],
                "created_at": room_data[5],
                "updated_at": room_data[6],
                "media_count": media_count,
                "participant_stats": participant_stats
            }
        }
    except Exception as e:
        logger.error(f"대화방 정보 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/opengraph")
async def get_opengraph_metadata(url: str):
    """URL의 OpenGraph 메타데이터를 추출합니다."""
    try:
        # URL 유효성 검사
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            return {
                "success": False,
                "error": "유효하지 않은 URL입니다."
            }
        
        # User-Agent 설정 (일부 사이트에서 차단 방지)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # 비동기로 웹페이지 가져오기
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=10) as response:
                if response.status != 200:
                    return {
                        "success": False,
                        "error": f"웹페이지를 가져올 수 없습니다. (상태 코드: {response.status})"
                    }
                
                html = await response.text()
        
        # BeautifulSoup으로 HTML 파싱
        soup = BeautifulSoup(html, 'html.parser')
        
        # OpenGraph 메타데이터 추출
        og_data = {}
        
        # 기본 메타데이터
        title_meta = soup.find('meta', property='og:title')
        twitter_title_meta = soup.find('meta', property='twitter:title')
        title_tag = soup.find('title')
        
        og_data['title'] = (
            title_meta.get('content') if title_meta else
            twitter_title_meta.get('content') if twitter_title_meta else
            title_tag.text if title_tag else
            ''
        ).strip()
        
        desc_meta = soup.find('meta', property='og:description')
        twitter_desc_meta = soup.find('meta', property='twitter:description')
        desc_meta_name = soup.find('meta', attrs={'name': 'description'})
        
        og_data['description'] = (
            desc_meta.get('content') if desc_meta else
            twitter_desc_meta.get('content') if twitter_desc_meta else
            desc_meta_name.get('content') if desc_meta_name else
            ''
        ).strip()
        
        image_meta = soup.find('meta', property='og:image')
        twitter_image_meta = soup.find('meta', property='twitter:image')
        
        og_data['image'] = (
            image_meta.get('content') if image_meta else
            twitter_image_meta.get('content') if twitter_image_meta else
            ''
        ).strip()
        
        url_meta = soup.find('meta', property='og:url')
        og_data['url'] = (
            url_meta.get('content') if url_meta else
            url
        ).strip()
        
        site_name_meta = soup.find('meta', property='og:site_name')
        og_data['site_name'] = (
            site_name_meta.get('content') if site_name_meta else
            parsed_url.netloc
        ).strip()
        
        # 추가 메타데이터
        type_meta = soup.find('meta', property='og:type')
        og_data['type'] = type_meta.get('content') if type_meta else 'website'
        
        locale_meta = soup.find('meta', property='og:locale')
        og_data['locale'] = locale_meta.get('content') if locale_meta else 'ko_KR'
        
        # 파비콘 추출
        favicon_link = soup.find('link', rel='icon')
        shortcut_icon = soup.find('link', rel='shortcut icon')
        
        favicon = (
            favicon_link.get('href') if favicon_link else
            shortcut_icon.get('href') if shortcut_icon else
            f"{parsed_url.scheme}://{parsed_url.netloc}/favicon.ico"
        )
        og_data['favicon'] = favicon if favicon.startswith('http') else f"{parsed_url.scheme}://{parsed_url.netloc}{favicon}"
        
        return {
            "success": True,
            "data": og_data,
            "url": url,
            "extracted_at": datetime.now().isoformat()
        }
        
    except asyncio.TimeoutError:
        return {
            "success": False,
            "error": "요청 시간이 초과되었습니다."
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"메타데이터 추출 중 오류가 발생했습니다: {str(e)}"
        }

# 대화 데이터 분석/통계 기능
def analyze_conversation_data(messages):
    """대화 데이터 종합 분석"""
    if not messages:
        return {
            "total_messages": 0,
            "participants": [],
            "emotion_distribution": {},
            "keyword_frequency": {},
            "conversation_patterns": {},
            "engagement_metrics": {},
            "time_analysis": {}
        }
    
    # 기본 통계
    total_messages = len(messages)
    participants = list(set(msg.get('sender', 'Unknown') for msg in messages))
    
    # 감정 분포 분석
    emotion_distribution = analyze_emotion_distribution(messages)
    
    # 키워드 빈도 분석
    keyword_frequency = analyze_keyword_frequency(messages)
    
    # 대화 패턴 분석
    conversation_patterns = analyze_conversation_patterns(messages)
    
    # 참여도 지표
    engagement_metrics = analyze_engagement_metrics(messages)
    
    # 시간 분석
    time_analysis = analyze_time_patterns(messages)
    
    return {
        "total_messages": total_messages,
        "participants": participants,
        "emotion_distribution": emotion_distribution,
        "keyword_frequency": keyword_frequency,
        "conversation_patterns": conversation_patterns,
        "engagement_metrics": engagement_metrics,
        "time_analysis": time_analysis
    }

def analyze_emotion_distribution(messages):
    """감정 분포 분석"""
    emotion_counts = {
        "기쁨": 0, "슬픔": 0, "화남": 0, "걱정": 0, "중립": 0
    }
    
    for msg in messages:
        if isinstance(msg, dict) and 'content' in msg:
            emotion = analyze_emotion(msg['content'])
            primary_emotion = emotion['primary_emotion']
            if primary_emotion in emotion_counts:
                emotion_counts[primary_emotion] += 1
    
    total = sum(emotion_counts.values())
    if total > 0:
        emotion_percentages = {
            emotion: (count / total) * 100 
            for emotion, count in emotion_counts.items()
        }
    else:
        emotion_percentages = emotion_counts
    
    return {
        "counts": emotion_counts,
        "percentages": emotion_percentages,
        "dominant_emotion": max(emotion_counts, key=emotion_counts.get) if total > 0 else "중립"
    }

def analyze_keyword_frequency(messages):
    """키워드 빈도 분석"""
    keyword_counts = {}
    important_keywords = [
        "건설", "아파트", "분양", "가격", "위치", "학교", "교통", "환경", "시설",
        "대우", "삼성", "금리", "조합", "환급금", "브랜드", "품질", "설계",
        "시공", "완공", "입주", "계약", "서명", "결정", "검토", "비교"
    ]
    
    for msg in messages:
        if isinstance(msg, dict) and 'content' in msg:
            content = msg['content']
            for keyword in important_keywords:
                if keyword in content:
                    keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1
    
    # 빈도순 정렬
    sorted_keywords = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "frequencies": dict(sorted_keywords),
        "top_keywords": [kw for kw, count in sorted_keywords[:10]],
        "total_keywords": len(keyword_counts)
    }

def analyze_conversation_patterns(messages):
    """대화 패턴 분석"""
    patterns = {
        "response_times": [],
        "message_lengths": [],
        "interaction_types": [],
        "topic_transitions": []
    }
    
    for i, msg in enumerate(messages):
        if isinstance(msg, dict) and 'content' in msg:
            # 메시지 길이
            content_length = len(msg['content'])
            patterns["message_lengths"].append(content_length)
            
            # 상호작용 유형 (질문, 답변, 정보공유 등)
            interaction_type = classify_interaction_type(msg['content'])
            patterns["interaction_types"].append(interaction_type)
    
    # 평균 메시지 길이
    avg_length = sum(patterns["message_lengths"]) / len(patterns["message_lengths"]) if patterns["message_lengths"] else 0
    
    # 상호작용 유형 분포
    interaction_distribution = {}
    for interaction_type in patterns["interaction_types"]:
        interaction_distribution[interaction_type] = interaction_distribution.get(interaction_type, 0) + 1
    
    return {
        "average_message_length": avg_length,
        "interaction_distribution": interaction_distribution,
        "message_length_distribution": {
            "short": len([l for l in patterns["message_lengths"] if l < 50]),
            "medium": len([l for l in patterns["message_lengths"] if 50 <= l < 200]),
            "long": len([l for l in patterns["message_lengths"] if l >= 200])
        }
    }

def classify_interaction_type(content):
    """상호작용 유형 분류"""
    content_lower = content.lower()
    
    if any(word in content_lower for word in ["?", "질문", "어떻게", "언제", "어디서", "왜"]):
        return "질문"
    elif any(word in content_lower for word in ["네", "맞습니다", "동의", "좋아요", "감사"]):
        return "동의"
    elif any(word in content_lower for word in ["아니요", "틀렸", "반대", "싫어요", "문제"]):
        return "반대"
    elif any(word in content_lower for word in ["정보", "알려", "설명", "소개"]):
        return "정보공유"
    elif any(word in content_lower for word in ["제안", "추천", "권유", "제안드리"]):
        return "제안"
    else:
        return "일반"

def analyze_engagement_metrics(messages):
    """참여도 지표 분석"""
    if not messages:
        return {
            "total_participants": 0,
            "messages_per_participant": {},
            "response_rate": 0,
            "conversation_depth": 0
        }
    
    # 참여자별 메시지 수
    participant_counts = {}
    for msg in messages:
        if isinstance(msg, dict) and 'sender' in msg:
            sender = msg['sender']
            participant_counts[sender] = participant_counts.get(sender, 0) + 1
    
    # 응답률 계산 (질문에 대한 답변 비율)
    questions = 0
    responses = 0
    for i, msg in enumerate(messages):
        if isinstance(msg, dict) and 'content' in msg:
            content = msg['content']
            if "?" in content or any(word in content for word in ["질문", "어떻게", "언제"]):
                questions += 1
                # 다음 메시지가 답변인지 확인
                if i + 1 < len(messages):
                    next_msg = messages[i + 1]
                    if isinstance(next_msg, dict) and 'content' in next_msg:
                        responses += 1
    
    response_rate = (responses / questions * 100) if questions > 0 else 0
    
    # 대화 깊이 (연속된 메시지 수)
    conversation_depth = calculate_conversation_depth(messages)
    
    return {
        "total_participants": len(participant_counts),
        "messages_per_participant": participant_counts,
        "response_rate": response_rate,
        "conversation_depth": conversation_depth,
        "most_active_participant": max(participant_counts, key=participant_counts.get) if participant_counts else None
    }

def calculate_conversation_depth(messages):
    """대화 깊이 계산"""
    if len(messages) < 2:
        return 1
    
    max_depth = 1
    current_depth = 1
    
    for i in range(1, len(messages)):
        prev_msg = messages[i-1]
        curr_msg = messages[i]
        
        if isinstance(prev_msg, dict) and isinstance(curr_msg, dict):
            # 같은 참여자가 연속으로 메시지를 보내는 경우
            if (prev_msg.get('sender') == curr_msg.get('sender') and 
                'content' in prev_msg and 'content' in curr_msg):
                current_depth += 1
                max_depth = max(max_depth, current_depth)
            else:
                current_depth = 1
    
    return max_depth

def analyze_time_patterns(messages):
    """시간 패턴 분석"""
    time_patterns = {
        "hourly_distribution": {},
        "daily_distribution": {},
        "response_times": []
    }
    
    for msg in messages:
        if isinstance(msg, dict) and 'timestamp' in msg:
            try:
                # 타임스탬프 파싱
                timestamp = datetime.fromisoformat(msg['timestamp'].replace('Z', '+00:00'))
                
                # 시간대별 분포
                hour = timestamp.hour
                time_patterns["hourly_distribution"][hour] = time_patterns["hourly_distribution"].get(hour, 0) + 1
                
                # 요일별 분포
                weekday = timestamp.strftime('%A')
                time_patterns["daily_distribution"][weekday] = time_patterns["daily_distribution"].get(weekday, 0) + 1
                
            except (ValueError, AttributeError):
                continue
    
    return time_patterns

def generate_conversation_insights(analysis_data):
    """대화 인사이트 생성"""
    insights = []
    
    # 감정 인사이트
    emotion_data = analysis_data.get('emotion_distribution', {})
    dominant_emotion = emotion_data.get('dominant_emotion', '중립')
    insights.append(f"대화의 주요 감정은 '{dominant_emotion}'입니다.")
    
    # 키워드 인사이트
    keyword_data = analysis_data.get('keyword_frequency', {})
    top_keywords = keyword_data.get('top_keywords', [])
    if top_keywords:
        insights.append(f"가장 많이 언급된 키워드: {', '.join(top_keywords[:3])}")
    
    # 참여도 인사이트
    engagement_data = analysis_data.get('engagement_metrics', {})
    response_rate = engagement_data.get('response_rate', 0)
    insights.append(f"질문에 대한 응답률: {response_rate:.1f}%")
    
    # 대화 패턴 인사이트
    pattern_data = analysis_data.get('conversation_patterns', {})
    avg_length = pattern_data.get('average_message_length', 0)
    insights.append(f"평균 메시지 길이: {avg_length:.0f}자")
    
    return insights

def create_visualization_data(analysis_data):
    """시각화용 데이터 생성"""
    return {
        "emotion_chart": {
            "labels": list(analysis_data.get('emotion_distribution', {}).get('percentages', {}).keys()),
            "data": list(analysis_data.get('emotion_distribution', {}).get('percentages', {}).values())
        },
        "keyword_chart": {
            "labels": analysis_data.get('keyword_frequency', {}).get('top_keywords', [])[:10],
            "data": [analysis_data.get('keyword_frequency', {}).get('frequencies', {}).get(kw, 0) 
                    for kw in analysis_data.get('keyword_frequency', {}).get('top_keywords', [])[:10]]
        },
        "participation_chart": {
            "labels": list(analysis_data.get('engagement_metrics', {}).get('messages_per_participant', {}).keys()),
            "data": list(analysis_data.get('engagement_metrics', {}).get('messages_per_participant', {}).values())
        }
    }

@app.post("/api/v7/analyze-conversation-data")
async def analyze_conversation_data_api(request: dict):
    """대화 데이터 종합 분석 API"""
    try:
        messages = request.get('messages', [])
        
        # 대화 데이터 분석
        analysis_data = analyze_conversation_data(messages)
        
        # 인사이트 생성
        insights = generate_conversation_insights(analysis_data)
        
        # 시각화 데이터 생성
        visualization_data = create_visualization_data(analysis_data)
        
        return {
            "success": True,
            "analysis": analysis_data,
            "insights": insights,
            "visualization": visualization_data,
            "analysis_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"대화 데이터 분석 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/conversation-statistics/{chat_room_id}")
async def get_conversation_statistics(chat_room_id: str):
    """특정 대화방의 통계 정보 조회"""
    try:
        # 대화방 메시지 조회
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT content, sender, timestamp, emotion, sentiment
            FROM messages 
            WHERE chat_room_id = ?
            ORDER BY timestamp
        ''', (chat_room_id,))
        
        messages_data = cursor.fetchall()
        conn.close()
        
        # 메시지 데이터 변환
        messages = []
        for row in messages_data:
            messages.append({
                'content': row[0],
                'sender': row[1],
                'timestamp': row[2],
                'emotion': row[3],
                'sentiment': row[4]
            })
        
        # 분석 수행
        analysis_data = analyze_conversation_data(messages)
        insights = generate_conversation_insights(analysis_data)
        visualization_data = create_visualization_data(analysis_data)
        
        return {
            "success": True,
            "chat_room_id": chat_room_id,
            "analysis": analysis_data,
            "insights": insights,
            "visualization": visualization_data,
            "analysis_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"대화방 통계 조회 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/emotion-trends/{chat_room_id}")
async def get_emotion_trends(chat_room_id: str):
    """감정 트렌드 분석"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT content, timestamp, emotion
            FROM messages 
            WHERE chat_room_id = ?
            ORDER BY timestamp
        ''', (chat_room_id,))
        
        messages_data = cursor.fetchall()
        conn.close()
        
        # 시간별 감정 변화 분석
        emotion_trends = {}
        for row in messages_data:
            content, timestamp, emotion = row
            if timestamp:
                try:
                    # 날짜별로 그룹화
                    date = timestamp.split('T')[0]
                    if date not in emotion_trends:
                        emotion_trends[date] = {"기쁨": 0, "슬픔": 0, "화남": 0, "걱정": 0, "중립": 0}
                    
                    # 감정 분석
                    emotion_analysis = analyze_emotion(content)
                    primary_emotion = emotion_analysis['primary_emotion']
                    if primary_emotion in emotion_trends[date]:
                        emotion_trends[date][primary_emotion] += 1
                        
                except Exception:
                    continue
        
        return {
            "success": True,
            "chat_room_id": chat_room_id,
            "emotion_trends": emotion_trends,
            "analysis_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"감정 트렌드 분석 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/keyword-analysis/{chat_room_id}")
async def get_keyword_analysis(chat_room_id: str):
    """키워드 분석"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT content, timestamp
            FROM messages 
            WHERE chat_room_id = ?
            ORDER BY timestamp
        ''', (chat_room_id,))
        
        messages_data = cursor.fetchall()
        conn.close()
        
        # 메시지 데이터 변환
        messages = []
        for row in messages_data:
            messages.append({
                'content': row[0],
                'timestamp': row[1]
            })
        
        # 키워드 분석
        keyword_analysis = analyze_keyword_frequency(messages)
        
        return {
            "success": True,
            "chat_room_id": chat_room_id,
            "keyword_analysis": keyword_analysis,
            "analysis_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"키워드 분석 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/engagement-metrics/{chat_room_id}")
async def get_engagement_metrics(chat_room_id: str):
    """참여도 지표 분석"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT content, sender, timestamp
            FROM messages 
            WHERE chat_room_id = ?
            ORDER BY timestamp
        ''', (chat_room_id,))
        
        messages_data = cursor.fetchall()
        conn.close()
        
        # 메시지 데이터 변환
        messages = []
        for row in messages_data:
            messages.append({
                'content': row[0],
                'sender': row[1],
                'timestamp': row[2]
            })
        
        # 참여도 분석
        engagement_metrics = analyze_engagement_metrics(messages)
        
        return {
            "success": True,
            "chat_room_id": chat_room_id,
            "engagement_metrics": engagement_metrics,
            "analysis_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"참여도 지표 분석 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def create_gpt_prompt(target_message: str, context_messages: List[Dict], settings: Dict) -> str:
    """GPT 프롬프트 생성"""
    
    # 기본 시스템 프롬프트
    system_prompt = """당신은 카카오톡 대화에서 사용할 수 있는 친근하고 자연스러운 메시지를 생성하는 AI 어시스턴트입니다.

주요 특징:
#!/usr/bin/env python3
"""
고도화된 카카오 AI 메시지 생성 API 서버 v7.0
- 카카오톡 대화 대응 학습 기능
- 개인별 맞춤형 메시지 생성
- 정치인 스타일 + 개인 특성 융합
- 실시간 학습 및 업데이트
"""

import os
import time
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import sqlite3
import shutil
import hashlib
import asyncio
import aiohttp
from openai import OpenAI
import functools
import random

from bs4 import BeautifulSoup
from urllib.parse import urlparse
import uuid

# 고급 감정 분석 시스템 통합
from advanced_emotion_analyzer import analyze_message_emotion, generate_tone_matched_response

# 통합 시스템
from integrated_ai_system import IntegratedAISystem, ConversationContext
from advanced_kakao_parser import AdvancedKakaoParser
from conversation_learner import ConversationLearner

# 정치인 스타일 API
from political_style_api import political_router, set_integrated_system

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 캐싱 시스템
class CacheManager:
    def __init__(self, max_size=1000, ttl=300):  # 5분 TTL
        self.cache = {}
        self.max_size = max_size
        self.ttl = ttl
        self.access_times = {}
    
    def get(self, key: str) -> Optional[Any]:
        if key in self.cache:
            if time.time() - self.access_times.get(key, 0) < self.ttl:
                self.access_times[key] = time.time()
                return self.cache[key]
            else:
                del self.cache[key]
                del self.access_times[key]
        return None
    
    def set(self, key: str, value: Any):
        if len(self.cache) >= self.max_size:
            # LRU: 가장 오래된 항목 제거
            oldest_key = min(self.access_times.keys(), key=lambda k: self.access_times[k])
            del self.cache[oldest_key]
            del self.access_times[oldest_key]
        
        self.cache[key] = value
        self.access_times[key] = time.time()
    
    def clear(self):
        self.cache.clear()
        self.access_times.clear()

# 전역 캐시 매니저
cache_manager = CacheManager()

def cache_result(ttl=300):
    """캐싱 데코레이터"""
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # 캐시 키 생성
            cache_key = f"{func.__name__}:{hash(str(args) + str(sorted(kwargs.items())))}"
            
            # 캐시에서 결과 확인
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                logger.info(f"캐시 히트: {func.__name__}")
                return cached_result
            
            # 함수 실행
            result = await func(*args, **kwargs)
            
            # 결과 캐싱
            cache_manager.set(cache_key, result)
            logger.info(f"캐시 저장: {func.__name__}")
            
            return result
        return wrapper
    return decorator

# OpenAI 클라이언트 초기화
openai_client = None
try:
    # 환경변수에서 API 키 가져오기
    openai_api_key = os.getenv('OPENAI_API_KEY')
    
    # 환경변수가 없으면 테스트 키 사용
    if not openai_api_key:
        openai_api_key = "sk-test-key-for-development"
        logger.info("⚠️ 환경변수에서 API 키를 찾을 수 없어 테스트 키를 사용합니다.")
    
    if openai_api_key and openai_api_key != "sk-your-actual-api-key-here":
        openai_client = OpenAI(api_key=openai_api_key)
        logger.info("✅ OpenAI 클라이언트 초기화 완료")
    else:
        logger.warning("⚠️ OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
except Exception as e:
    logger.error(f"❌ OpenAI 클라이언트 초기화 실패: {str(e)}")

# 개선된 메시지 생성 로직
def analyze_context(context_messages):
    """문맥 분석"""
    if not context_messages:
        return {"tone": "neutral", "topics": [], "sentiment": "neutral"}
    
    recent_messages = context_messages[-5:]  # 최근 5개 메시지
    
    # 주제 추출
    topics = []
    for msg in recent_messages:
        if isinstance(msg, dict) and 'content' in msg:
            content = msg['content']
            # 간단한 키워드 추출
            keywords = extract_keywords(content)
            topics.extend(keywords)
    
    # 감정 분석
    sentiment = analyze_sentiment(recent_messages)
    
    # 톤 분석
    tone = analyze_tone(recent_messages)
    
    return {
        "tone": tone,
        "topics": list(set(topics)),
        "sentiment": sentiment,
        "message_count": len(recent_messages)
    }

def analyze_emotion(target_message):
    """감정 분석"""
    emotion_keywords = {
        "기쁨": ["좋아", "행복", "기쁘", "만족", "감사"],
        "슬픔": ["슬프", "우울", "힘들", "아프", "속상"],
        "화남": ["화나", "짜증", "분노", "열받", "답답"],
        "걱정": ["걱정", "불안", "우려", "염려", "근심"],
        "중립": ["그래", "알겠", "네", "응", "좋"]
    }
    
    if not target_message:
        return {"primary_emotion": "중립", "intensity": 0.5}
    
    content = target_message.lower()
    emotion_scores = {}
    
    for emotion, keywords in emotion_keywords.items():
        score = sum(1 for keyword in keywords if keyword in content)
        emotion_scores[emotion] = score
    
    primary_emotion = max(emotion_scores, key=emotion_scores.get)
    intensity = min(emotion_scores[primary_emotion] / 3, 1.0)
    
    return {
        "primary_emotion": primary_emotion,
        "intensity": intensity,
        "scores": emotion_scores
    }

def apply_personalized_style(settings):
    """개인화된 스타일 적용"""
    style_templates = {
        "formal": {
            "prefix": "안녕하세요, ",
            "suffix": "감사합니다.",
            "tone": "정중하고 격식있는"
        },
        "casual": {
            "prefix": "안녕! ",
            "suffix": "고마워!",
            "tone": "친근하고 편안한"
        },
        "empathetic": {
            "prefix": "정말 이해가 됩니다. ",
            "suffix": "함께 해결해보아요.",
            "tone": "공감적이고 따뜻한"
        },
        "professional": {
            "prefix": "검토해보니 ",
            "suffix": "참고하시기 바랍니다.",
            "tone": "전문적이고 논리적인"
        }
    }
    
    formality = settings.get('formality', 'casual')
    return style_templates.get(formality, style_templates['casual'])

def select_message_strategy(settings, emotion_analysis):
    """메시지 전략 선택"""
    emotion = emotion_analysis['primary_emotion']
    intensity = emotion_analysis['intensity']
    
    strategies = {
        "기쁨": {
            "high": "공감_축하",
            "medium": "공감_지지",
            "low": "동조_긍정"
        },
        "슬픔": {
            "high": "공감_위로",
            "medium": "공감_지지",
            "low": "동조_이해"
        },
        "화남": {
            "high": "공감_이해",
            "medium": "논리_해결",
            "low": "동조_진정"
        },
        "걱정": {
            "high": "공감_안심",
            "medium": "논리_정보",
            "low": "동조_지지"
        },
        "중립": {
            "high": "논리_정보",
            "medium": "동조_긍정",
            "low": "동조_단순"
        }
    }
    
    intensity_level = "high" if intensity > 0.7 else "medium" if intensity > 0.3 else "low"
    return strategies.get(emotion, strategies["중립"])[intensity_level]

def compose_message(target_message, context_analysis, emotion_analysis, personalized_style, strategy):
    """메시지 구성"""
    
    # 전략별 메시지 템플릿
    strategy_templates = {
        "공감_축하": "정말 축하드려요! {content}",
        "공감_위로": "정말 힘드셨겠어요. {content}",
        "공감_이해": "정말 이해가 됩니다. {content}",
        "공감_안심": "걱정하지 마세요. {content}",
        "공감_지지": "함께 해결해보아요. {content}",
        "논리_정보": "검토해보니 {content}",
        "논리_해결": "해결방안을 찾아보면 {content}",
        "동조_긍정": "맞습니다. {content}",
        "동조_이해": "그럴 수 있어요. {content}",
        "동조_진정": "차분히 생각해보면 {content}",
        "동조_단순": "{content}"
    }
    
    # 기본 메시지 내용 생성
    base_content = generate_base_content(target_message, context_analysis)
    
    # 전략 적용
    template = strategy_templates.get(strategy, strategy_templates["동조_단순"])
    content = template.format(content=base_content)
    
    # 개인화된 스타일 적용
    final_message = personalized_style['prefix'] + content + personalized_style['suffix']
    
    return {
        "content": final_message,
        "strategy": strategy,
        "emotion": emotion_analysis['primary_emotion'],
        "style": personalized_style['tone'],
        "context_used": len(context_analysis['topics']) > 0
    }

def generate_base_content(target_message, context_analysis):
    """기본 메시지 내용 생성"""
    if not target_message:
        return "좋은 하루 보내세요."
    
    # 문맥 기반 응답
    if context_analysis['topics']:
        topic = context_analysis['topics'][0]
        return f"{topic}에 대해 말씀해주셨네요. 정말 중요한 부분이에요."
    
    # 감정 기반 응답
    if context_analysis['sentiment'] == 'positive':
        return "정말 좋은 소식이네요!"
    elif context_analysis['sentiment'] == 'negative':
        return "힘드신 일이 있으셨군요."
    else:
        return "말씀해주신 내용 잘 들었습니다."

def extract_keywords(text):
    """간단한 키워드 추출"""
    keywords = []
    important_words = ["건설", "아파트", "분양", "가격", "위치", "학교", "교통", "환경", "시설"]
    
    for word in important_words:
        if word in text:
            keywords.append(word)
    
    return keywords

def analyze_sentiment(messages):
    """간단한 감정 분석"""
    positive_words = ["좋아", "행복", "감사", "만족", "기쁘"]
    negative_words = ["힘들", "아프", "슬프", "화나", "답답"]
    
    total_score = 0
    for msg in messages:
        if isinstance(msg, dict) and 'content' in msg:
            content = msg['content']
            positive_count = sum(1 for word in positive_words if word in content)
            negative_count = sum(1 for word in negative_words if word in content)
            total_score += positive_count - negative_count
    
    if total_score > 0:
        return "positive"
    elif total_score < 0:
        return "negative"
    else:
        return "neutral"

def analyze_tone(messages):
    """톤 분석"""
    formal_words = ["감사합니다", "부탁드립니다", "참고하시기"]
    casual_words = ["고마워", "안녕", "응", "그래"]
    
    formal_count = 0
    casual_count = 0
    
    for msg in messages:
        if isinstance(msg, dict) and 'content' in msg:
            content = msg['content']
            formal_count += sum(1 for word in formal_words if word in content)
            casual_count += sum(1 for word in casual_words if word in content)
    
    if formal_count > casual_count:
        return "formal"
    elif casual_count > formal_count:
        return "casual"
    else:
        return "neutral"

def generate_improved_message(target_message, context_messages, settings):
    """개선된 메시지 생성 로직"""
    
    # 1. 문맥 분석
    context_analysis = analyze_context(context_messages)
    
    # 2. 감정 분석
    emotion_analysis = analyze_emotion(target_message)
    
    # 3. 개인화된 스타일 적용
    personalized_style = apply_personalized_style(settings)
    
    # 4. 전략적 메시지 구성
    message_strategy = select_message_strategy(settings, emotion_analysis)
    
    # 5. 메시지 생성
    generated_message = compose_message(
        target_message, 
        context_analysis, 
        emotion_analysis, 
        personalized_style, 
        message_strategy
    )
    
    return generated_message

app = FastAPI(title="고도화된 카카오 AI API 서버 v7.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 정치인 스타일 라우터 추가
app.include_router(political_router)

# 헬스 체크 엔드포인트
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "8.0",
        "services": {
            "api": "running",
            "ai_models": "ready",
            "database": "connected"
        }
    }

# 데이터베이스 초기화
def init_database():
    """데이터베이스 초기화"""
    conn = sqlite3.connect('chat_system.db')
    cursor = conn.cursor()
    
    # 대화방 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_rooms (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            message_count INTEGER DEFAULT 0,
            last_activity TEXT,
            is_active BOOLEAN DEFAULT 1,
            participants TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    ''')
    
    # 메시지 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            chat_room_id TEXT,
            content TEXT NOT NULL,
            sender TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            emotion TEXT,
            sentiment REAL,
            keywords TEXT,
            created_at TEXT,
            FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
        )
    ''')
    
    # 미디어 파일 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS media_files (
            id TEXT PRIMARY KEY,
            chat_room_id TEXT,
            original_path TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER,
            hash_value TEXT,
            processed_path TEXT,
            created_at TEXT,
            FOREIGN KEY (chat_room_id) REFERENCES chat_rooms (id)
        )
    ''')
    
    # 동기화 로그 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sync_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            chat_room_id TEXT,
            details TEXT,
            created_at TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# 파일 해시 생성
def get_file_hash(file_path):
    """파일의 해시값 생성"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

# 카카오톡 대화 파일 파싱
def parse_kakao_chat(file_path):
    """카카오톡 대화 파일 파싱 (중복 처리 포함)"""
    try:
        parser = AdvancedKakaoParser()
        room = parser.parse_chat_file(file_path)
        
        messages = []
        participants = set()
        
        for msg in room.messages:
            participants.add(msg.sender)
            messages.append({
                'sender': msg.sender,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat(),
                'is_duplicate': msg.is_duplicate
            })
        
        return messages, list(participants)
        
    except Exception as e:
        logger.error(f"파일 파싱 오류: {file_path}, {e}")
        return [], []

# 미디어 파일 분류
def classify_media_files(chat_room_path):
    """미디어 파일 자동 분류"""
    media_files = []
    chat_room_id = os.path.basename(chat_room_path)
    
    # 미디어 폴더 경로
    media_path = os.path.join(chat_room_path, '미디어')
    if not os.path.exists(media_path):
        return media_files
    
    # 파일 타입별 분류
    file_types = {
        'images': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
        'videos': ['.mp4', '.avi', '.mov', '.mkv'],
        'audios': ['.mp3', '.wav', '.m4a'],
        'documents': ['.pdf', '.doc', '.docx', '.txt', '.md', '.csv', '.xls', '.xlsx']
    }
    
    for root, dirs, files in os.walk(media_path):
        for file in files:
            file_path = os.path.join(root, file)
            file_ext = os.path.splitext(file)[1].lower()
            
            # 파일 타입 결정
            file_type = 'unknown'
            for type_name, extensions in file_types.items():
                if file_ext in extensions:
                    file_type = type_name
                    break
            
            # 파일 정보 수집
            file_size = os.path.getsize(file_path)
            file_hash = get_file_hash(file_path)
            
            # 처리된 경로 생성
            processed_dir = os.path.join('processed', 'media', file_type)
            os.makedirs(processed_dir, exist_ok=True)
            
            processed_path = os.path.join(processed_dir, f"{file_hash}{file_ext}")
            
            # 파일 복사 (중복 방지)
            if not os.path.exists(processed_path):
                shutil.copy2(file_path, processed_path)
            
            media_files.append({
                'id': file_hash,
                'chat_room_id': chat_room_id,
                'original_path': file_path,
                'file_type': file_type,
                'file_size': file_size,
                'hash_value': file_hash,
                'processed_path': processed_path
            })
    
    return media_files

# 대화방 동기화
def sync_chat_rooms():
    """대화방 자동 동기화"""
    chat_rooms_path = 'chat_rooms'
    if not os.path.exists(chat_rooms_path):
        logger.warning(f"대화방 폴더가 없습니다: {chat_rooms_path}")
        return []
    
    conn = sqlite3.connect('chat_system.db')
    cursor = conn.cursor()
    
    synced_rooms = []
    
    # 모든 대화방 폴더 스캔
    for room_folder in os.listdir(chat_rooms_path):
        room_path = os.path.join(chat_rooms_path, room_folder)
        if not os.path.isdir(room_path):
            continue
        
        # 대화방 ID 생성
        room_id = room_folder
        
        # 대화 파일 찾기 (개선된 검색)
        chat_files = []
        for file in os.listdir(room_path):
            if file.endswith('.txt'):
                chat_files.append(os.path.join(room_path, file))
        
        if not chat_files:
            logger.warning(f"대화 파일이 없습니다: {room_path}")
            continue
        
        # 가장 최근 파일 사용
        latest_chat_file = max(chat_files, key=os.path.getmtime)
        
        # 파일 해시 확인
        file_hash = get_file_hash(latest_chat_file)
        
        # 데이터베이스에서 기존 정보 확인
        cursor.execute('''
            SELECT id, message_count, last_activity, updated_at 
            FROM chat_rooms 
            WHERE id = ?
        ''', (room_id,))
        
        existing_room = cursor.fetchone()
        
        if existing_room:
            # 기존 대화방 업데이트 확인
            last_update = existing_room[3]
            if last_update and os.path.getmtime(latest_chat_file) <= datetime.fromisoformat(last_update).timestamp():
                # 변경사항 없음
                cursor.execute('''
                    SELECT * FROM chat_rooms WHERE id = ?
                ''', (room_id,))
                room_data = cursor.fetchone()
                synced_rooms.append({
                    'id': room_data[0],
                    'name': room_data[1],
                    'messageCount': room_data[2],
                    'lastActivity': room_data[3],
                    'isActive': bool(room_data[4]),
                    'participants': room_data[5].split(',') if room_data[5] else []
                })
                continue
        
        # 새로운 대화방 또는 업데이트
        messages, participants = parse_kakao_chat(latest_chat_file)
        
        # 미디어 파일 분류
        media_files = classify_media_files(room_path)
        
        # 데이터베이스 업데이트
        now = datetime.now().isoformat()
        
        if existing_room:
            # 기존 대화방 업데이트
            cursor.execute('''
                UPDATE chat_rooms 
                SET message_count = ?, last_activity = ?, updated_at = ?
                WHERE id = ?
            ''', (len(messages), now, now, room_id))
            
            # 기존 메시지 삭제
            cursor.execute('DELETE FROM messages WHERE chat_room_id = ?', (room_id,))
            
            # 동기화 로그
            cursor.execute('''
                INSERT INTO sync_logs (action, chat_room_id, details, created_at)
                VALUES (?, ?, ?, ?)
            ''', ('update', room_id, f'Updated {len(messages)} messages', now))
        else:
            # 새로운 대화방 추가
            cursor.execute('''
                INSERT INTO chat_rooms (id, name, message_count, last_activity, participants, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (room_id, room_folder, len(messages), now, ','.join(participants), now, now))
            
            # 동기화 로그
            cursor.execute('''
                INSERT INTO sync_logs (action, chat_room_id, details, created_at)
                VALUES (?, ?, ?, ?)
            ''', ('create', room_id, f'Created with {len(messages)} messages', now))
        
        # 메시지 저장
        for i, msg in enumerate(messages):
            message_id = f"{room_id}_msg_{i}"
            cursor.execute('''
                INSERT INTO messages (id, chat_room_id, content, sender, timestamp, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (message_id, room_id, msg['content'], msg['sender'], msg['timestamp'], now))
        
        # 미디어 파일 저장
        for media in media_files:
            cursor.execute('''
                INSERT OR REPLACE INTO media_files 
                (id, chat_room_id, original_path, file_type, file_size, hash_value, processed_path, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (media['id'], media['chat_room_id'], media['original_path'], 
                  media['file_type'], media['file_size'], media['hash_value'], 
                  media['processed_path'], now))
        
        synced_rooms.append({
            'id': room_id,
            'name': room_folder,
            'messageCount': len(messages),
            'lastActivity': now,
            'isActive': True,
            'participants': participants
        })
        
        logger.info(f"대화방 동기화 완료: {room_id} ({len(messages)}개 메시지, {len(media_files)}개 미디어)")
    
    conn.commit()
    conn.close()
    
    return synced_rooms


def auto_detect_new_chat_rooms():
    """새로운 대화방 자동 감지"""
    chat_rooms_path = 'chat_rooms'
    if not os.path.exists(chat_rooms_path):
        return []
    
    conn = sqlite3.connect('chat_system.db')
    cursor = conn.cursor()
    
    # 기존 대화방 목록 조회
    cursor.execute('SELECT id FROM chat_rooms')
    existing_rooms = {row[0] for row in cursor.fetchall()}
    
    new_rooms = []
    
    for room_folder in os.listdir(chat_rooms_path):
        room_path = os.path.join(chat_rooms_path, room_folder)
        if not os.path.isdir(room_path):
            continue
        
        if room_folder not in existing_rooms:
            # 새로운 대화방 발견
            chat_files = [f for f in os.listdir(room_path) if f.endswith('.txt')]
            if chat_files:
                new_rooms.append({
                    'id': room_folder,
                    'name': room_folder,
                    'path': room_path,
                    'chat_files': chat_files
                })
                logger.info(f"새로운 대화방 발견: {room_folder}")
    
    conn.close()
    return new_rooms

# 전역 시스템 인스턴스
integrated_system: Optional[IntegratedAISystem] = None


# Pydantic 모델들
class PersonalizedMessageRequest(BaseModel):
    person_id: str
    target_topic: str
    message_intent: str
    use_political_style: Optional[str] = None
    political_blend_ratio: float = 0.3
    context_messages: Optional[List[Dict[str, Any]]] = None


class PersonalizedMessageResponse(BaseModel):
    success: bool
    message: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    generation_metadata: Optional[Dict[str, Any]] = None


class StyleRecommendationRequest(BaseModel):
    person_id: str
    target_topic: str


class ChatFileUploadResponse(BaseModel):
    success: bool
    processed_file: str
    learned_profiles: int
    error: Optional[str] = None


class SystemStatusResponse(BaseModel):
    system_version: str
    status: str
    learned_profiles: int
    total_learning_data: int
    available_features: List[str]
    last_updated: str


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 통합 시스템 초기화"""
    global integrated_system
    
    logger.info("🚀 고도화된 카카오 AI API 서버 v7.0 시작...")
    
    try:
        # 통합 시스템 초기화 (상대 경로 수정)
        integrated_system = IntegratedAISystem(chat_rooms_path="../chat_rooms")
        logger.info("✅ 통합 AI 시스템 초기화 완료")
        
        # 정치인 스타일 API에 통합 시스템 설정
        set_integrated_system(integrated_system)
        logger.info("✅ 정치인 스타일 API 초기화 완료")
        
    except Exception as e:
        logger.error(f"❌ 시스템 초기화 실패: {e}")
        raise


@app.get("/", response_model=Dict[str, Any])
async def root():
    """루트 엔드포인트"""
    
    return {
        "service": "카카오 AI 메시지 생성 API",
        "version": "7.0.0",
        "description": "실제 대화 학습 기반 개인 맞춤형 AI 메시지 생성",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "key_features": [
            "카카오톡 대화 대응 학습",
            "개인별 성향 분석",
            "맞춤형 메시지 생성",
            "정치인 스타일 융합",
            "실시간 품질 평가",
            "스타일 자동 추천"
        ],
        "api_endpoints": {
            "personalized_message": "/api/v7/personalized-message",
            "style_recommendation": "/api/v7/style-recommendation",
            "upload_chat": "/api/v7/upload-chat",
            "profiles": "/api/v7/profiles",
            "system_status": "/api/v7/status",
            "learning": "/api/v7/learning"
        }
    }


@app.get("/api/v7/status")
@cache_result(ttl=60)  # 1분 캐시
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "online",
        "version": "7.0",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "고급 메시지 생성",
            "대화 분석",
            "시뮬레이션",
            "자동 동기화"
        ]
    }

@app.get("/api/v7/chat-rooms")
@cache_result(ttl=300)  # 5분 캐시
async def get_chat_rooms():
    """대화방 목록 조회"""
    try:
        # 동기화 실행
        synced_rooms = sync_chat_rooms()
        
        return {
            "success": True,
            "chat_rooms": synced_rooms,
            "sync_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"대화방 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "chat_rooms": []
        }

@app.get("/api/v7/chat-messages/{chat_room_id}")
@cache_result(ttl=180)  # 3분 캐시
async def get_chat_messages(chat_room_id: str):
    """대화 메시지 조회"""
    try:
        logger.info(f"메시지 조회 시작: {chat_room_id}")
        
        # 대화방 ID를 실제 폴더명으로 매핑 (URL 디코딩 포함)
        import urllib.parse
        decoded_room_id = urllib.parse.unquote(chat_room_id)
        
        # 동적 대화방 매핑 시스템
        def find_chat_room_file(room_id: str) -> tuple[str, str]:
            """대화방 파일을 동적으로 찾는 함수"""
            chat_rooms_path = "../chat_rooms"
            
            # 1. 정확한 매칭 시도
            exact_path = f"{chat_rooms_path}/{room_id}/{room_id}.txt"
            if os.path.exists(exact_path):
                return room_id, exact_path
            
            # 2. 폴더 내에서 .txt 파일 찾기
            room_folder = f"{chat_rooms_path}/{room_id}"
            if os.path.exists(room_folder) and os.path.isdir(room_folder):
                txt_files = [f for f in os.listdir(room_folder) if f.endswith('.txt')]
                if txt_files:
                    # 가장 큰 파일 선택 (메인 대화 파일)
                    largest_file = max(txt_files, key=lambda f: os.path.getsize(os.path.join(room_folder, f)))
                    return room_id, os.path.join(room_folder, largest_file)
            
            # 3. 부분 매칭 시도 (특수문자 처리)
            for folder in os.listdir(chat_rooms_path):
                folder_path = os.path.join(chat_rooms_path, folder)
                if os.path.isdir(folder_path):
                    # URL 인코딩된 문자 처리
                    normalized_folder = folder.replace('|', '7').replace('%7C', '7')
                    normalized_room_id = room_id.replace('|', '7').replace('%7C', '7')
                    
                    if normalized_folder == normalized_room_id or folder == room_id:
                        txt_files = [f for f in os.listdir(folder_path) if f.endswith('.txt')]
                        if txt_files:
                            largest_file = max(txt_files, key=lambda f: os.path.getsize(os.path.join(folder_path, f)))
                            return folder, os.path.join(folder_path, largest_file)
            
            return None, None
        
        # 기존 매핑 (하위 호환성)
        room_mapping = {
            "sample_chat_room 110 님과 카카오톡 대화": "sample_chat_room",
            "[데모] 샘플 대화보내기 110 님과 카카오톡 대화": "sample_chat_room",
            "테스트 카카오톡 대화 파일 님과 카카오톡 대화": "테스트 카카오톡 대화 파일"
        }
        
        # 매핑 시도
        actual_room_name = room_mapping.get(decoded_room_id, decoded_room_id)
        chat_file_path = f"../chat_rooms/{actual_room_name}/{actual_room_name}.txt"
        
        # 동적 검색으로 파일 찾기
        if not os.path.exists(chat_file_path):
            found_room, found_path = find_chat_room_file(decoded_room_id)
            if found_room and found_path:
                actual_room_name = found_room
                chat_file_path = found_path
                logger.info(f"동적 매핑 성공: {decoded_room_id} -> {actual_room_name}")
            else:
                logger.error(f"대화 파일을 찾을 수 없습니다: {decoded_room_id}")
                return {
                    "success": False,
                    "error": f"대화 파일을 찾을 수 없습니다: {decoded_room_id}",
                    "messages": []
                }
        
        if not os.path.exists(chat_file_path):
            logger.error(f"대화 파일을 찾을 수 없습니다: {chat_file_path}")
            return {
                "success": False,
                "error": f"대화 파일을 찾을 수 없습니다: {chat_file_path}",
                "messages": []
            }
        
        # 파일에서 직접 파싱
        parser = AdvancedKakaoParser()
        room = parser.parse_chat_file(chat_file_path, chat_room_id)
        
        messages = []
        for msg in room.messages:
            messages.append({
                'id': msg.message_hash,
                'content': msg.content,
                'sender': msg.sender,
                'timestamp': msg.timestamp.isoformat(),
                'is_deleted': msg.is_deleted,
                'is_duplicate': msg.is_duplicate
            })
        
        logger.info(f"대화방 {chat_room_id}의 메시지 수: {len(messages)}")
        
        return {
            "success": True,
            "chat_room_id": chat_room_id,
            "message_count": len(messages),
            "messages": messages
        }
        
    except Exception as e:
        logger.error(f"메시지 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "messages": []
        }

@app.get("/api/v7/media-files/{chat_room_id}")
async def get_media_files(chat_room_id: str):
    """미디어 파일 조회"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, file_type, file_size, processed_path, created_at
            FROM media_files 
            WHERE chat_room_id = ?
            ORDER BY created_at
        ''', (chat_room_id,))
        
        media_files = []
        for row in cursor.fetchall():
            media_files.append({
                'id': row[0],
                'file_type': row[1],
                'file_size': row[2],
                'processed_path': row[3],
                'created_at': row[4]
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

@app.post("/api/v7/sync")
async def manual_sync():
    """수동 동기화 실행"""
    try:
        synced_rooms = sync_chat_rooms()
        
        return {
            "success": True,
            "synced_rooms": len(synced_rooms),
            "details": [room['name'] for room in synced_rooms],
            "sync_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"동기화 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/sync-status")
async def get_sync_status():
    """동기화 상태 확인"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        # 최근 동기화 로그 조회
        cursor.execute('''
            SELECT action, chat_room_id, details, created_at
            FROM sync_logs 
            ORDER BY created_at DESC 
            LIMIT 10
        ''')
        
        recent_logs = []
        for row in cursor.fetchall():
            recent_logs.append({
                'action': row[0],
                'chat_room_id': row[1],
                'details': row[2],
                'created_at': row[3]
            })
        
        # 통계 정보
        cursor.execute('SELECT COUNT(*) FROM chat_rooms')
        total_rooms = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM messages')
        total_messages = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM media_files')
        total_media = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "success": True,
            "total_rooms": total_rooms,
            "total_messages": total_messages,
            "total_media": total_media,
            "recent_logs": recent_logs,
            "last_sync": recent_logs[0]['created_at'] if recent_logs else None
        }
    except Exception as e:
        logger.error(f"동기화 상태 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@app.post("/api/v7/auto-sync")
async def auto_sync_chat_rooms():
    """자동 대화방 동기화"""
    try:
        # 새로운 대화방 감지
        new_rooms = auto_detect_new_chat_rooms()
        
        # 동기화 실행
        synced_rooms = sync_chat_rooms()
        
        return {
            "success": True,
            "synced_rooms": len(synced_rooms),
            "new_rooms_detected": len(new_rooms),
            "new_rooms": new_rooms,
            "sync_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"자동 동기화 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/v7/chat-rooms/discover")
async def discover_chat_rooms():
    """새로운 대화방 탐지"""
    try:
        new_rooms = auto_detect_new_chat_rooms()
        
        return {
            "success": True,
            "new_rooms_count": len(new_rooms),
            "new_rooms": new_rooms,
            "discovery_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"대화방 탐지 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@app.get("/api/v7/chat-rooms/{room_id}/info")
async def get_chat_room_info(room_id: str):
    """대화방 상세 정보 조회"""
    try:
        import urllib.parse
        decoded_room_id = urllib.parse.unquote(room_id)
        
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, message_count, last_activity, participants, created_at, updated_at
            FROM chat_rooms WHERE id = ?
        ''', (decoded_room_id,))
        
        room_data = cursor.fetchone()
        
        if not room_data:
            return {
                "success": False,
                "error": f"대화방을 찾을 수 없습니다: {decoded_room_id}"
            }
        
        # 미디어 파일 수 조회
        cursor.execute('''
            SELECT COUNT(*) FROM media_files WHERE chat_room_id = ?
        ''', (decoded_room_id,))
        media_count = cursor.fetchone()[0]
        
        # 참여자별 메시지 수
        cursor.execute('''
            SELECT sender, COUNT(*) as message_count
            FROM messages 
            WHERE chat_room_id = ?
            GROUP BY sender
            ORDER BY message_count DESC
        ''', (decoded_room_id,))
        participant_stats = [
            {"sender": row[0], "message_count": row[1]} 
            for row in cursor.fetchall()
        ]
        
        conn.close()
        
        return {
            "success": True,
            "room_info": {
                "id": room_data[0],
                "name": room_data[1],
                "message_count": room_data[2],
                "last_activity": room_data[3],
                "participants": room_data[4].split(',') if room_data[4] else [],
                "created_at": room_data[5],
                "updated_at": room_data[6],
                "media_count": media_count,
                "participant_stats": participant_stats
            }
        }
    except Exception as e:
        logger.error(f"대화방 정보 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/opengraph")
async def get_opengraph_metadata(url: str):
    """URL의 OpenGraph 메타데이터를 추출합니다."""
    try:
        # URL 유효성 검사
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            return {
                "success": False,
                "error": "유효하지 않은 URL입니다."
            }
        
        # User-Agent 설정 (일부 사이트에서 차단 방지)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # 비동기로 웹페이지 가져오기
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=10) as response:
                if response.status != 200:
                    return {
                        "success": False,
                        "error": f"웹페이지를 가져올 수 없습니다. (상태 코드: {response.status})"
                    }
                
                html = await response.text()
        
        # BeautifulSoup으로 HTML 파싱
        soup = BeautifulSoup(html, 'html.parser')
        
        # OpenGraph 메타데이터 추출
        og_data = {}
        
        # 기본 메타데이터
        title_meta = soup.find('meta', property='og:title')
        twitter_title_meta = soup.find('meta', property='twitter:title')
        title_tag = soup.find('title')
        
        og_data['title'] = (
            title_meta.get('content') if title_meta else
            twitter_title_meta.get('content') if twitter_title_meta else
            title_tag.text if title_tag else
            ''
        ).strip()
        
        desc_meta = soup.find('meta', property='og:description')
        twitter_desc_meta = soup.find('meta', property='twitter:description')
        desc_meta_name = soup.find('meta', attrs={'name': 'description'})
        
        og_data['description'] = (
            desc_meta.get('content') if desc_meta else
            twitter_desc_meta.get('content') if twitter_desc_meta else
            desc_meta_name.get('content') if desc_meta_name else
            ''
        ).strip()
        
        image_meta = soup.find('meta', property='og:image')
        twitter_image_meta = soup.find('meta', property='twitter:image')
        
        og_data['image'] = (
            image_meta.get('content') if image_meta else
            twitter_image_meta.get('content') if twitter_image_meta else
            ''
        ).strip()
        
        url_meta = soup.find('meta', property='og:url')
        og_data['url'] = (
            url_meta.get('content') if url_meta else
            url
        ).strip()
        
        site_name_meta = soup.find('meta', property='og:site_name')
        og_data['site_name'] = (
            site_name_meta.get('content') if site_name_meta else
            parsed_url.netloc
        ).strip()
        
        # 추가 메타데이터
        type_meta = soup.find('meta', property='og:type')
        og_data['type'] = type_meta.get('content') if type_meta else 'website'
        
        locale_meta = soup.find('meta', property='og:locale')
        og_data['locale'] = locale_meta.get('content') if locale_meta else 'ko_KR'
        
        # 파비콘 추출
        favicon_link = soup.find('link', rel='icon')
        shortcut_icon = soup.find('link', rel='shortcut icon')
        
        favicon = (
            favicon_link.get('href') if favicon_link else
            shortcut_icon.get('href') if shortcut_icon else
            f"{parsed_url.scheme}://{parsed_url.netloc}/favicon.ico"
        )
        og_data['favicon'] = favicon if favicon.startswith('http') else f"{parsed_url.scheme}://{parsed_url.netloc}{favicon}"
        
        return {
            "success": True,
            "data": og_data,
            "url": url,
            "extracted_at": datetime.now().isoformat()
        }
        
    except asyncio.TimeoutError:
        return {
            "success": False,
            "error": "요청 시간이 초과되었습니다."
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"메타데이터 추출 중 오류가 발생했습니다: {str(e)}"
        }

# 대화 데이터 분석/통계 기능
def analyze_conversation_data(messages):
    """대화 데이터 종합 분석"""
    if not messages:
        return {
            "total_messages": 0,
            "participants": [],
            "emotion_distribution": {},
            "keyword_frequency": {},
            "conversation_patterns": {},
            "engagement_metrics": {},
            "time_analysis": {}
        }
    
    # 기본 통계
    total_messages = len(messages)
    participants = list(set(msg.get('sender', 'Unknown') for msg in messages))
    
    # 감정 분포 분석
    emotion_distribution = analyze_emotion_distribution(messages)
    
    # 키워드 빈도 분석
    keyword_frequency = analyze_keyword_frequency(messages)
    
    # 대화 패턴 분석
    conversation_patterns = analyze_conversation_patterns(messages)
    
    # 참여도 지표
    engagement_metrics = analyze_engagement_metrics(messages)
    
    # 시간 분석
    time_analysis = analyze_time_patterns(messages)
    
    return {
        "total_messages": total_messages,
        "participants": participants,
        "emotion_distribution": emotion_distribution,
        "keyword_frequency": keyword_frequency,
        "conversation_patterns": conversation_patterns,
        "engagement_metrics": engagement_metrics,
        "time_analysis": time_analysis
    }

def analyze_emotion_distribution(messages):
    """감정 분포 분석"""
    emotion_counts = {
        "기쁨": 0, "슬픔": 0, "화남": 0, "걱정": 0, "중립": 0
    }
    
    for msg in messages:
        if isinstance(msg, dict) and 'content' in msg:
            emotion = analyze_emotion(msg['content'])
            primary_emotion = emotion['primary_emotion']
            if primary_emotion in emotion_counts:
                emotion_counts[primary_emotion] += 1
    
    total = sum(emotion_counts.values())
    if total > 0:
        emotion_percentages = {
            emotion: (count / total) * 100 
            for emotion, count in emotion_counts.items()
        }
    else:
        emotion_percentages = emotion_counts
    
    return {
        "counts": emotion_counts,
        "percentages": emotion_percentages,
        "dominant_emotion": max(emotion_counts, key=emotion_counts.get) if total > 0 else "중립"
    }

def analyze_keyword_frequency(messages):
    """키워드 빈도 분석"""
    keyword_counts = {}
    important_keywords = [
        "건설", "아파트", "분양", "가격", "위치", "학교", "교통", "환경", "시설",
        "대우", "삼성", "금리", "조합", "환급금", "브랜드", "품질", "설계",
        "시공", "완공", "입주", "계약", "서명", "결정", "검토", "비교"
    ]
    
    for msg in messages:
        if isinstance(msg, dict) and 'content' in msg:
            content = msg['content']
            for keyword in important_keywords:
                if keyword in content:
                    keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1
    
    # 빈도순 정렬
    sorted_keywords = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "frequencies": dict(sorted_keywords),
        "top_keywords": [kw for kw, count in sorted_keywords[:10]],
        "total_keywords": len(keyword_counts)
    }

def analyze_conversation_patterns(messages):
    """대화 패턴 분석"""
    patterns = {
        "response_times": [],
        "message_lengths": [],
        "interaction_types": [],
        "topic_transitions": []
    }
    
    for i, msg in enumerate(messages):
        if isinstance(msg, dict) and 'content' in msg:
            # 메시지 길이
            content_length = len(msg['content'])
            patterns["message_lengths"].append(content_length)
            
            # 상호작용 유형 (질문, 답변, 정보공유 등)
            interaction_type = classify_interaction_type(msg['content'])
            patterns["interaction_types"].append(interaction_type)
    
    # 평균 메시지 길이
    avg_length = sum(patterns["message_lengths"]) / len(patterns["message_lengths"]) if patterns["message_lengths"] else 0
    
    # 상호작용 유형 분포
    interaction_distribution = {}
    for interaction_type in patterns["interaction_types"]:
        interaction_distribution[interaction_type] = interaction_distribution.get(interaction_type, 0) + 1
    
    return {
        "average_message_length": avg_length,
        "interaction_distribution": interaction_distribution,
        "message_length_distribution": {
            "short": len([l for l in patterns["message_lengths"] if l < 50]),
            "medium": len([l for l in patterns["message_lengths"] if 50 <= l < 200]),
            "long": len([l for l in patterns["message_lengths"] if l >= 200])
        }
    }

def classify_interaction_type(content):
    """상호작용 유형 분류"""
    content_lower = content.lower()
    
    if any(word in content_lower for word in ["?", "질문", "어떻게", "언제", "어디서", "왜"]):
        return "질문"
    elif any(word in content_lower for word in ["네", "맞습니다", "동의", "좋아요", "감사"]):
        return "동의"
    elif any(word in content_lower for word in ["아니요", "틀렸", "반대", "싫어요", "문제"]):
        return "반대"
    elif any(word in content_lower for word in ["정보", "알려", "설명", "소개"]):
        return "정보공유"
    elif any(word in content_lower for word in ["제안", "추천", "권유", "제안드리"]):
        return "제안"
    else:
        return "일반"

def analyze_engagement_metrics(messages):
    """참여도 지표 분석"""
    if not messages:
        return {
            "total_participants": 0,
            "messages_per_participant": {},
            "response_rate": 0,
            "conversation_depth": 0
        }
    
    # 참여자별 메시지 수
    participant_counts = {}
    for msg in messages:
        if isinstance(msg, dict) and 'sender' in msg:
            sender = msg['sender']
            participant_counts[sender] = participant_counts.get(sender, 0) + 1
    
    # 응답률 계산 (질문에 대한 답변 비율)
    questions = 0
    responses = 0
    for i, msg in enumerate(messages):
        if isinstance(msg, dict) and 'content' in msg:
            content = msg['content']
            if "?" in content or any(word in content for word in ["질문", "어떻게", "언제"]):
                questions += 1
                # 다음 메시지가 답변인지 확인
                if i + 1 < len(messages):
                    next_msg = messages[i + 1]
                    if isinstance(next_msg, dict) and 'content' in next_msg:
                        responses += 1
    
    response_rate = (responses / questions * 100) if questions > 0 else 0
    
    # 대화 깊이 (연속된 메시지 수)
    conversation_depth = calculate_conversation_depth(messages)
    
    return {
        "total_participants": len(participant_counts),
        "messages_per_participant": participant_counts,
        "response_rate": response_rate,
        "conversation_depth": conversation_depth,
        "most_active_participant": max(participant_counts, key=participant_counts.get) if participant_counts else None
    }

def calculate_conversation_depth(messages):
    """대화 깊이 계산"""
    if len(messages) < 2:
        return 1
    
    max_depth = 1
    current_depth = 1
    
    for i in range(1, len(messages)):
        prev_msg = messages[i-1]
        curr_msg = messages[i]
        
        if isinstance(prev_msg, dict) and isinstance(curr_msg, dict):
            # 같은 참여자가 연속으로 메시지를 보내는 경우
            if (prev_msg.get('sender') == curr_msg.get('sender') and 
                'content' in prev_msg and 'content' in curr_msg):
                current_depth += 1
                max_depth = max(max_depth, current_depth)
            else:
                current_depth = 1
    
    return max_depth

def analyze_time_patterns(messages):
    """시간 패턴 분석"""
    time_patterns = {
        "hourly_distribution": {},
        "daily_distribution": {},
        "response_times": []
    }
    
    for msg in messages:
        if isinstance(msg, dict) and 'timestamp' in msg:
            try:
                # 타임스탬프 파싱
                timestamp = datetime.fromisoformat(msg['timestamp'].replace('Z', '+00:00'))
                
                # 시간대별 분포
                hour = timestamp.hour
                time_patterns["hourly_distribution"][hour] = time_patterns["hourly_distribution"].get(hour, 0) + 1
                
                # 요일별 분포
                weekday = timestamp.strftime('%A')
                time_patterns["daily_distribution"][weekday] = time_patterns["daily_distribution"].get(weekday, 0) + 1
                
            except (ValueError, AttributeError):
                continue
    
    return time_patterns

def generate_conversation_insights(analysis_data):
    """대화 인사이트 생성"""
    insights = []
    
    # 감정 인사이트
    emotion_data = analysis_data.get('emotion_distribution', {})
    dominant_emotion = emotion_data.get('dominant_emotion', '중립')
    insights.append(f"대화의 주요 감정은 '{dominant_emotion}'입니다.")
    
    # 키워드 인사이트
    keyword_data = analysis_data.get('keyword_frequency', {})
    top_keywords = keyword_data.get('top_keywords', [])
    if top_keywords:
        insights.append(f"가장 많이 언급된 키워드: {', '.join(top_keywords[:3])}")
    
    # 참여도 인사이트
    engagement_data = analysis_data.get('engagement_metrics', {})
    response_rate = engagement_data.get('response_rate', 0)
    insights.append(f"질문에 대한 응답률: {response_rate:.1f}%")
    
    # 대화 패턴 인사이트
    pattern_data = analysis_data.get('conversation_patterns', {})
    avg_length = pattern_data.get('average_message_length', 0)
    insights.append(f"평균 메시지 길이: {avg_length:.0f}자")
    
    return insights

def create_visualization_data(analysis_data):
    """시각화용 데이터 생성"""
    return {
        "emotion_chart": {
            "labels": list(analysis_data.get('emotion_distribution', {}).get('percentages', {}).keys()),
            "data": list(analysis_data.get('emotion_distribution', {}).get('percentages', {}).values())
        },
        "keyword_chart": {
            "labels": analysis_data.get('keyword_frequency', {}).get('top_keywords', [])[:10],
            "data": [analysis_data.get('keyword_frequency', {}).get('frequencies', {}).get(kw, 0) 
                    for kw in analysis_data.get('keyword_frequency', {}).get('top_keywords', [])[:10]]
        },
        "participation_chart": {
            "labels": list(analysis_data.get('engagement_metrics', {}).get('messages_per_participant', {}).keys()),
            "data": list(analysis_data.get('engagement_metrics', {}).get('messages_per_participant', {}).values())
        }
    }

@app.post("/api/v7/analyze-conversation-data")
async def analyze_conversation_data_api(request: dict):
    """대화 데이터 종합 분석 API"""
    try:
        messages = request.get('messages', [])
        
        # 대화 데이터 분석
        analysis_data = analyze_conversation_data(messages)
        
        # 인사이트 생성
        insights = generate_conversation_insights(analysis_data)
        
        # 시각화 데이터 생성
        visualization_data = create_visualization_data(analysis_data)
        
        return {
            "success": True,
            "analysis": analysis_data,
            "insights": insights,
            "visualization": visualization_data,
            "analysis_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"대화 데이터 분석 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/conversation-statistics/{chat_room_id}")
async def get_conversation_statistics(chat_room_id: str):
    """특정 대화방의 통계 정보 조회"""
    try:
        # 대화방 메시지 조회
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT content, sender, timestamp, emotion, sentiment
            FROM messages 
            WHERE chat_room_id = ?
            ORDER BY timestamp
        ''', (chat_room_id,))
        
        messages_data = cursor.fetchall()
        conn.close()
        
        # 메시지 데이터 변환
        messages = []
        for row in messages_data:
            messages.append({
                'content': row[0],
                'sender': row[1],
                'timestamp': row[2],
                'emotion': row[3],
                'sentiment': row[4]
            })
        
        # 분석 수행
        analysis_data = analyze_conversation_data(messages)
        insights = generate_conversation_insights(analysis_data)
        visualization_data = create_visualization_data(analysis_data)
        
        return {
            "success": True,
            "chat_room_id": chat_room_id,
            "analysis": analysis_data,
            "insights": insights,
            "visualization": visualization_data,
            "analysis_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"대화방 통계 조회 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/emotion-trends/{chat_room_id}")
async def get_emotion_trends(chat_room_id: str):
    """감정 트렌드 분석"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT content, timestamp, emotion
            FROM messages 
            WHERE chat_room_id = ?
            ORDER BY timestamp
        ''', (chat_room_id,))
        
        messages_data = cursor.fetchall()
        conn.close()
        
        # 시간별 감정 변화 분석
        emotion_trends = {}
        for row in messages_data:
            content, timestamp, emotion = row
            if timestamp:
                try:
                    # 날짜별로 그룹화
                    date = timestamp.split('T')[0]
                    if date not in emotion_trends:
                        emotion_trends[date] = {"기쁨": 0, "슬픔": 0, "화남": 0, "걱정": 0, "중립": 0}
                    
                    # 감정 분석
                    emotion_analysis = analyze_emotion(content)
                    primary_emotion = emotion_analysis['primary_emotion']
                    if primary_emotion in emotion_trends[date]:
                        emotion_trends[date][primary_emotion] += 1
                        
                except Exception:
                    continue
        
        return {
            "success": True,
            "chat_room_id": chat_room_id,
            "emotion_trends": emotion_trends,
            "analysis_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"감정 트렌드 분석 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/keyword-analysis/{chat_room_id}")
async def get_keyword_analysis(chat_room_id: str):
    """키워드 분석"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT content, timestamp
            FROM messages 
            WHERE chat_room_id = ?
            ORDER BY timestamp
        ''', (chat_room_id,))
        
        messages_data = cursor.fetchall()
        conn.close()
        
        # 메시지 데이터 변환
        messages = []
        for row in messages_data:
            messages.append({
                'content': row[0],
                'timestamp': row[1]
            })
        
        # 키워드 분석
        keyword_analysis = analyze_keyword_frequency(messages)
        
        return {
            "success": True,
            "chat_room_id": chat_room_id,
            "keyword_analysis": keyword_analysis,
            "analysis_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"키워드 분석 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/engagement-metrics/{chat_room_id}")
async def get_engagement_metrics(chat_room_id: str):
    """참여도 지표 분석"""
    try:
        conn = sqlite3.connect('chat_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT content, sender, timestamp
            FROM messages 
            WHERE chat_room_id = ?
            ORDER BY timestamp
        ''', (chat_room_id,))
        
        messages_data = cursor.fetchall()
        conn.close()
        
        # 메시지 데이터 변환
        messages = []
        for row in messages_data:
            messages.append({
                'content': row[0],
                'sender': row[1],
                'timestamp': row[2]
            })
        
        # 참여도 분석
        engagement_metrics = analyze_engagement_metrics(messages)
        
        return {
            "success": True,
            "chat_room_id": chat_room_id,
            "engagement_metrics": engagement_metrics,
            "analysis_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"참여도 지표 분석 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def create_gpt_prompt(target_message: str, context_messages: List[Dict], settings: Dict) -> str:
    """GPT 프롬프트 생성"""
    
    # 기본 시스템 프롬프트
    system_prompt = """당신은 카카오톡 대화에서 사용할 수 있는 친근하고 자연스러운 메시지를 생성하는 AI 어시스턴트입니다.

주요 특징:
- 한국어로 자연스럽게 대화
- 상황에 맞는 적절한 톤과 스타일 사용
- 이모티콘과 표현을 적절히 활용
- 상대방의 감정과 맥락을 고려한 메시지 생성

생성 규칙:
1. 친근하고 자연스러운 톤 유지
2. 상황에 맞는 적절한 길이 (짧게 또는 길게)
3. 필요시 이모티콘 사용 (하지만 과도하지 않게)
4. 상대방의 관심사와 맥락을 고려
5. 건설적이고 도움이 되는 내용 포함"""

    # 컨텍스트 분석
    context_text = ""
    if context_messages:
        context_text = "\n\n[이전 대화 컨텍스트]\n"
        for msg in context_messages[-3:]:  # 최근 3개 메시지만
            sender = msg.get('sender', 'Unknown')
            content = msg.get('content', '')
            context_text += f"{sender}: {content}\n"
    
    # 설정 정보
    tone = settings.get('tone', '친근')
    message_length = settings.get('message_length', '중간')
    intent = settings.get('intent', '일반')
    
    # 길이 설정
    length_guide = {
        '짧음': '1-2문장으로 간결하게',
        '중간': '3-4문장으로 적당한 길이로',
        '길게': '5-6문장으로 자세하게'
    }
    
    # 톤 설정
    tone_guide = {
        '친근': '친근하고 편안한 톤으로',
        '공식': '정중하고 공식적인 톤으로',
        '재미': '재미있고 유쾌한 톤으로',
        '공감': '공감하고 이해하는 톤으로'
    }
    
    # 사용자 프롬프트 구성
    user_prompt = f"""다음 상황에 맞는 메시지를 생성해주세요:

{context_text}

[생성 요청]
- 대상 메시지: {target_message}
- 톤: {tone_guide.get(tone, '친근')}
- 길이: {length_guide.get(message_length, '중간')}
- 의도: {intent}

위 조건에 맞는 자연스러운 카카오톡 메시지를 생성해주세요."""

    return system_prompt, user_prompt

# 기존 함수는 새로운 고급 생성기로 대체됨

@app.post("/api/v7/generate-gpt-message")
async def generate_gpt_message_api(request: dict):
    """GPT 기반 메시지 생성 API"""
    try:
        target_message = request.get('target_message', '')
        context_messages = request.get('context_messages', [])
        settings = request.get('settings', {})
        
        if not target_message:
            return {
                "success": False,
                "error": "target_message가 필요합니다."
            }
        
        # GPT 메시지 생성
        result = await generate_gpt_message(target_message, context_messages, settings)
        
        return {
            "success": result["success"],
            "message": result["content"],
            "analysis": result["analysis"],
            "generation_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"GPT 메시지 생성 API 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/v7/gpt-status")
async def get_gpt_status():
    """GPT API 상태 확인"""
    try:
        if not openai_client:
            return {
                "success": True,
                "status": "demo_mode",
                "message": "데모 모드로 실행 중입니다. 실제 OpenAI API 키를 설정하면 완전한 기능을 사용할 수 있습니다.",
                "model": "demo-gpt-3.5-turbo",
                "test_response": "안녕하세요! 데모 모드에서 테스트 응답입니다."
            }
        
        # 간단한 테스트 요청
        test_response = await asyncio.to_thread(
            openai_client.chat.completions.create,
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "안녕하세요"}],
            max_tokens=10
        )
        
        return {
            "success": True,
            "status": "available",
            "message": "GPT API가 정상적으로 작동합니다.",
            "model": "gpt-3.5-turbo",
            "test_response": test_response.choices[0].message.content
        }
        
    except Exception as e:
        return {
            "success": True,
            "status": "demo_mode",
            "message": f"데모 모드로 실행 중입니다. (오류: {str(e)})",
            "model": "demo-gpt-3.5-turbo",
            "test_response": "안녕하세요! 데모 모드에서 테스트 응답입니다."
        }

@app.post("/api/v7/smart-conversation-summary")
async def generate_smart_conversation_summary(request: dict):
    """
    고도화된 대화 요약 기능
    - 중요한 정보만 추출
    - 약속/일정 자동 관리
    - 핵심 내용 요약
    - 실용적인 정보 정리
    """
    try:
        chat_room_id = request.get('chat_room_id')
        messages = request.get('messages', [])
        summary_type = request.get('summary_type', 'comprehensive')  # comprehensive, schedule, key_points, action_items
        
        if not messages:
            return {"success": False, "error": "메시지가 없습니다."}
        
        # 1. 대화 내용 분석
        conversation_analysis = analyze_conversation_for_summary(messages)
        
        # 2. 요약 타입별 처리
        if summary_type == 'schedule':
            summary_result = extract_schedule_and_events(messages)
        elif summary_type == 'key_points':
            summary_result = extract_key_points(messages)
        elif summary_type == 'action_items':
            summary_result = extract_action_items(messages)
        else:  # comprehensive
            summary_result = generate_comprehensive_summary(messages, conversation_analysis)
        
        return {
            "success": True,
            "summary": summary_result,
            "analysis": conversation_analysis,
            "summary_type": summary_type
        }
        
    except Exception as e:
        logger.error(f"대화 요약 생성 오류: {e}")
        return {"success": False, "error": str(e)}

def analyze_conversation_for_summary(messages: List[Dict]) -> Dict:
    """대화 내용을 요약을 위해 분석"""
    
    # 기본 통계
    total_messages = len(messages)
    participants = set(msg.get('sender', '') for msg in messages)
    
    # 주제별 분류
    topics = {
        '일정/약속': [],
        '업무/회사': [],
        '개인/감정': [],
        '일상/잡담': [],
        '중요사항': []
    }
    
    # 키워드 추출
    keywords = {}
    for msg in messages:
        content = msg.get('content', '')
        words = content.split()
        for word in words:
            if len(word) > 1:  # 1글자 제외
                keywords[word] = keywords.get(word, 0) + 1
    
    # 상위 키워드
    top_keywords = sorted(keywords.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # 감정 분석
    positive_words = ['좋아', '행복', '즐거워', '감사', '고마워', '완벽', '최고']
    negative_words = ['싫어', '화나', '짜증', '힘들어', '슬퍼', '스트레스', '문제']
    
    positive_count = sum(1 for msg in messages for word in positive_words if word in msg.get('content', ''))
    negative_count = sum(1 for msg in messages for word in negative_words if word in msg.get('content', ''))
    
    return {
        'total_messages': total_messages,
        'participants': list(participants),
        'top_keywords': top_keywords,
        'sentiment': {
            'positive': positive_count,
            'negative': negative_count,
            'neutral': total_messages - positive_count - negative_count
        }
    }

def extract_schedule_and_events(messages: List[Dict]) -> Dict:
    """일정과 약속 정보 추출"""
    
    schedule_keywords = ['일정', '약속', '미팅', '회의', '만남', '데이트', '식사', '점심', '저녁']
    time_keywords = ['오늘', '내일', '이번주', '다음주', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
    time_patterns = ['시', '분', '오전', '오후', 'AM', 'PM']
    
    schedules = []
    
    for msg in messages:
        content = msg.get('content', '')
        
        # 일정 관련 키워드가 있는 메시지 찾기
        has_schedule_keyword = any(keyword in content for keyword in schedule_keywords)
        has_time_keyword = any(keyword in content for keyword in time_keywords + time_patterns)
        
        if has_schedule_keyword or has_time_keyword:
            # 시간 정보 추출
            time_info = extract_time_info(content)
            
            schedules.append({
                'content': content,
                'sender': msg.get('sender', ''),
                'timestamp': msg.get('timestamp', ''),
                'time_info': time_info,
                'type': 'schedule' if has_schedule_keyword else 'time_mention'
            })
    
    return {
        'total_schedules': len(schedules),
        'schedules': schedules,
        'summary': f"총 {len(schedules)}개의 일정/약속 관련 대화가 있습니다."
    }

def extract_time_info(content: str) -> Dict:
    """메시지에서 시간 정보 추출"""
    time_info = {
        'date': None,
        'time': None,
        'period': None
    }
    
    # 날짜 패턴
    date_patterns = ['오늘', '내일', '이번주', '다음주']
    for pattern in date_patterns:
        if pattern in content:
            time_info['date'] = pattern
            break
    
    # 시간 패턴
    time_patterns = ['시', '분', '오전', '오후']
    for pattern in time_patterns:
        if pattern in content:
            time_info['time'] = pattern
            break
    
    return time_info

def extract_key_points(messages: List[Dict]) -> Dict:
    """핵심 내용 추출"""
    
    # 중요 키워드 정의
    important_keywords = [
        '중요', '필요', '꼭', '반드시', '확실히', '분명히',
        '결정', '확정', '최종', '완료', '완료됨',
        '문제', '이슈', '해결', '처리', '진행',
        '결과', '성과', '성공', '실패', '오류'
    ]
    
    key_points = []
    
    for msg in messages:
        content = msg.get('content', '')
        
        # 중요 키워드가 포함된 메시지 찾기
        has_important_keyword = any(keyword in content for keyword in important_keywords)
        
        if has_important_keyword:
            # 키워드 강조
            highlighted_content = content
            for keyword in important_keywords:
                if keyword in content:
                    highlighted_content = highlighted_content.replace(keyword, f"**{keyword}**")
            
            key_points.append({
                'content': highlighted_content,
                'sender': msg.get('sender', ''),
                'timestamp': msg.get('timestamp', ''),
                'importance_score': len([k for k in important_keywords if k in content])
            })
    
    # 중요도 순으로 정렬
    key_points.sort(key=lambda x: x['importance_score'], reverse=True)
    
    return {
        'total_key_points': len(key_points),
        'key_points': key_points[:10],  # 상위 10개만
        'summary': f"총 {len(key_points)}개의 핵심 내용이 추출되었습니다."
    }

def extract_action_items(messages: List[Dict]) -> Dict:
    """액션 아이템 추출"""
    
    # 액션 키워드 정의
    action_keywords = [
        '해야', '해야지', '해야겠다', '해야겠어',
        '할게', '할게요', '하겠어', '하겠습니다',
        '해야겠어요', '해야겠습니다', '해야겠네',
        '해야겠어', '해야겠어요', '해야겠습니다'
    ]
    
    # 할 일 패턴
    todo_patterns = [
        '~해야 해', '~해야지', '~해야겠다',
        '~할게', '~하겠어', '~해야겠어',
        '~해야겠어요', '~해야겠습니다'
    ]
    
    action_items = []
    
    for msg in messages:
        content = msg.get('content', '')
        
        # 액션 키워드가 포함된 메시지 찾기
        has_action_keyword = any(keyword in content for keyword in action_keywords)
        
        if has_action_keyword:
            # 할 일 내용 추출
            action_content = extract_action_content(content)
            
            if action_content:
                action_items.append({
                    'action': action_content,
                    'sender': msg.get('sender', ''),
                    'timestamp': msg.get('timestamp', ''),
                    'status': 'pending'  # 기본값: 대기중
                })
    
    return {
        'total_action_items': len(action_items),
        'action_items': action_items,
        'summary': f"총 {len(action_items)}개의 액션 아이템이 추출되었습니다."
    }

def extract_action_content(content: str) -> str:
    """메시지에서 액션 내용 추출"""
    
    # 액션 키워드 제거 후 내용 추출
    action_keywords = ['해야', '해야지', '해야겠다', '할게', '하겠어']
    
    for keyword in action_keywords:
        if keyword in content:
            # 키워드 이후의 내용을 액션으로 추출
            parts = content.split(keyword)
            if len(parts) > 1:
                action_part = parts[1].strip()
                if action_part:
                    return action_part
    
    return content

def generate_comprehensive_summary(messages: List[Dict], analysis: Dict) -> Dict:
    """종합적인 대화 요약 생성"""
    
    # 기본 정보
    total_messages = analysis['total_messages']
    participants = analysis['participants']
    top_keywords = analysis['top_keywords'][:5]  # 상위 5개
    
    # 일정/약속 추출
    schedule_summary = extract_schedule_and_events(messages)
    
    # 핵심 내용 추출
    key_points_summary = extract_key_points(messages)
    
    # 액션 아이템 추출
    action_items_summary = extract_action_items(messages)
    
    # 감정 분석
    sentiment = analysis['sentiment']
    dominant_sentiment = '긍정' if sentiment['positive'] > sentiment['negative'] else '부정' if sentiment['negative'] > sentiment['positive'] else '중립'
    
    # 요약 텍스트 생성
    summary_text = f"""
        # 대화 요약

    # 참여자: {', '.join(participants)}
    # 총 메시지: {total_messages}개
    # 전체 분위기: {dominant_sentiment}

    # 일정/약속: {schedule_summary['total_schedules']}개
    # 핵심 내용: {key_points_summary['total_key_points']}개
    # 액션 아이템: {action_items_summary['total_action_items']}개

    # 주요 키워드: {', '.join([f"{word}({count})" for word, count in top_keywords])}
"""
    
    return {
        'summary_text': summary_text.strip(),
        'schedule_summary': schedule_summary,
        'key_points_summary': key_points_summary,
        'action_items_summary': action_items_summary,
        'analysis': analysis
    }

@app.get("/api/v7/gpt-status")
async def get_gpt_status():
    """GPT API 상태 확인"""
    try:
        if not openai_client:
            return {
                "success": True,
                "status": "demo_mode",
                "message": "데모 모드로 실행 중입니다. 실제 OpenAI API 키를 설정하면 완전한 기능을 사용할 수 있습니다.",
                "model": "demo-gpt-3.5-turbo",
                "test_response": "안녕하세요! 데모 모드에서 테스트 응답입니다."
            }
        
        # 간단한 테스트 요청
        test_response = await asyncio.to_thread(
            openai_client.chat.completions.create,
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "안녕하세요"}],
            max_tokens=10
        )
        
        return {
            "success": True,
            "status": "available",
            "message": "GPT API가 정상적으로 작동합니다.",
            "model": "gpt-3.5-turbo",
            "test_response": test_response.choices[0].message.content
        }
        
    except Exception as e:
        return {
            "success": True,
            "status": "demo_mode",
            "message": f"데모 모드로 실행 중입니다. (오류: {str(e)})",
            "model": "demo-gpt-3.5-turbo",
            "test_response": "안녕하세요! 데모 모드에서 테스트 응답입니다."
        }

@app.post("/api/analyze-conversation-enhanced", response_model=Dict[str, Any])
async def analyze_conversation_enhanced(request: Dict[str, Any]):
    """향상된 대화 분석"""
    try:
        chat_file_path = request.get("chat_file_path", "")
        
        if not chat_file_path:
            return {
                "success": False,
                "error": "대화 파일 경로가 필요합니다."
            }
        
        # 향상된 대화 분석 실행
        analysis_result = message_generator.analyze_conversation_data(chat_file_path)
        
        # 인사이트 생성
        insights = message_generator.enhanced_analyzer.generate_insights(analysis_result)
        
        return {
            "success": True,
            "analysis": analysis_result,
            "insights": insights,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"향상된 대화 분석 오류: {e}")
        return {
            "success": False,
            "error": f"대화 분석 실패: {str(e)}"
        }

@app.post("/api/generate-context-aware-message", response_model=Dict[str, Any])
async def generate_context_aware_message(request: Dict[str, Any]):
    """맥락을 고려한 메시지 생성"""
    try:
        original_message = request.get("original_message", "")
        format_type = request.get("format_type", "중립")
        context = request.get("context", "")
        chat_file_path = request.get("chat_file_path", "")
        
        if not original_message:
            return {
                "success": False,
                "error": "원본 메시지가 필요합니다."
            }
        
        # 대화 데이터 분석 (필요한 경우)
        if chat_file_path and not message_generator.conversation_insights:
            message_generator.analyze_conversation_data(chat_file_path)
        
        # 맥락 기반 메시지 생성
        context_aware_message = message_generator.generate_context_aware_message(
            original_message, format_type, context
        )
        
        # 카카오톡 형식으로 변환
        kakao_formatted_message = message_generator.ai_simulator._generate_kakao_message_format(
            context_aware_message, "AI_Assistant"
        )
        
        return {
            "success": True,
            "message": {
                "id": f"context_aware_{int(time.time())}_{random.randint(1000, 9999)}",
                "original_message": original_message,
                "format_type": format_type,
                "context": context,
                "generated_message": kakao_formatted_message,
                "raw_message": context_aware_message,
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"맥락 기반 메시지 생성 오류: {e}")
        return {
            "success": False,
            "error": f"메시지 생성 실패: {str(e)}"
        }

@app.get("/api/conversation-insights", response_model=Dict[str, Any])
async def get_conversation_insights():
    """대화 인사이트 조회"""
    try:
        insights = message_generator.conversation_insights
        
        if not insights:
            return {
                "success": False,
                "error": "분석된 대화 데이터가 없습니다."
            }
        
        # 주요 인사이트 추출
        key_insights = {
            "total_messages": insights.get("total_messages", 0),
            "participants_count": len(insights.get("participants", {})),
            "top_topics": [],
            "dominant_emotions": [],
            "communication_patterns": {}
        }
        
        # 주제별 분석
        topic_analysis = insights.get("topic_analysis", {})
        for topic, messages in topic_analysis.items():
            if messages:
                key_insights["top_topics"].append({
                    "topic": topic,
                    "message_count": len(messages)
                })
        
        # 감정 분석
        emotion_analysis = insights.get("emotion_analysis", {})
        overall_sentiment = emotion_analysis.get("overall_sentiment", {})
        if overall_sentiment:
            key_insights["dominant_emotions"] = [
                {"emotion": emotion, "count": count}
                for emotion, count in overall_sentiment.most_common(3)
            ]
        
        # 의사소통 패턴
        communication_style = insights.get("communication_style", {})
        key_insights["communication_patterns"] = {
            "formality_level": dict(communication_style.get("formality_level", {})),
            "engagement_level": {
                user: dict(data) for user, data in 
                communication_style.get("engagement_level", {}).items()
            }
        }
        
        return {
            "success": True,
            "insights": key_insights,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"대화 인사이트 조회 오류: {e}")
        return {
            "success": False,
            "error": f"인사이트 조회 실패: {str(e)}"
        }

# 파일 업로드 엔드포인트
@app.post("/api/v7/upload-chat")
async def upload_chat_file(file: UploadFile = File(...)):
    """카카오톡 대화 파일 업로드"""
    try:
        if not file.filename.endswith('.txt'):
            return {
                "success": False,
                "error": "텍스트 파일만 업로드 가능합니다"
            }
        
        # 파일 내용 읽기
        content = await file.read()
        content_str = content.decode('utf-8')
        
        # 방 이름 추출 (첫 번째 줄에서)
        lines = content_str.split('\n')
        room_name = None
        for line in lines[:10]:  # 첫 10줄에서 방 이름 찾기
            if "님과 카카오톡 대화" in line or "님과의 대화" in line:
                room_name = line.strip()
                break
        
        if not room_name:
            room_name = file.filename.replace('.txt', '')
        
        # 대화방 디렉토리 생성
        import os
        room_dir = f"chat_rooms/{room_name}"
        os.makedirs(room_dir, exist_ok=True)
        
        # 파일 저장
        file_path = f"{room_dir}/{file.filename}"
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content_str)
        
        # AI 시스템에 다시 로드하도록 알림
        try:
            if integrated_system:
                await integrated_system.process_new_chat_file(file_path, room_name)
        except:
            pass  # 시스템이 없어도 파일 업로드는 성공
        
        return {
            "success": True,
            "message": f"파일이 성공적으로 업로드되었습니다: {room_name}",
            "room_name": room_name,
            "file_path": file_path,
            "upload_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"파일 업로드 오류: {e}")
        return {
            "success": False,
            "error": f"파일 업로드 실패: {str(e)}"
        }

# 메시지 내보내기 엔드포인트
@app.post("/api/v7/export-messages")
async def export_messages(request: dict):
    """생성된 메시지들을 다양한 형식으로 내보내기"""
    try:
        messages = request.get('messages', [])
        format_type = request.get('format', 'txt')  # txt, json, csv
        room_name = request.get('room_name', 'export')
        
        if not messages:
            return {
                "success": False,
                "error": "내보낼 메시지가 없습니다"
            }
        
        import json
        from datetime import datetime
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if format_type == 'json':
            # JSON 형식으로 내보내기
            export_data = {
                "export_info": {
                    "room_name": room_name,
                    "exported_at": datetime.now().isoformat(),
                    "total_messages": len(messages),
                    "format": "json"
                },
                "messages": messages
            }
            
            content = json.dumps(export_data, ensure_ascii=False, indent=2)
            filename = f"{room_name}_messages_{timestamp}.json"
            
        elif format_type == 'csv':
            # CSV 형식으로 내보내기
            import csv
            import io
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # 헤더 작성
            writer.writerow(['번호', '발신자', '내용', '생성시간', '타입'])
            
            # 메시지 데이터 작성
            for i, msg in enumerate(messages, 1):
                writer.writerow([
                    i,
                    msg.get('sender', ''),
                    msg.get('content', ''),
                    msg.get('timestamp', ''),
                    msg.get('type', 'generated')
                ])
            
            content = output.getvalue()
            filename = f"{room_name}_messages_{timestamp}.csv"
            
        else:  # txt 형식 (기본값)
            # 텍스트 형식으로 내보내기
            lines = [
                f"카카오톡 AI 생성 메시지 내보내기",
                f"대화방: {room_name}",
                f"내보낸 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                f"총 메시지 수: {len(messages)}",
                "=" * 50,
                ""
            ]
            
            for i, msg in enumerate(messages, 1):
                lines.append(f"{i}. [{msg.get('sender', '알 수 없음')}]")
                lines.append(f"   {msg.get('content', '')}")
                if msg.get('timestamp'):
                    lines.append(f"   생성시간: {msg.get('timestamp')}")
                lines.append("")
            
            content = "\n".join(lines)
            filename = f"{room_name}_messages_{timestamp}.txt"
        
        # 파일 저장 (선택적)
        export_dir = "exports"
        os.makedirs(export_dir, exist_ok=True)
        file_path = os.path.join(export_dir, filename)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return {
            "success": True,
            "message": f"메시지가 성공적으로 내보내졌습니다: {filename}",
            "filename": filename,
            "file_path": file_path,
            "content": content,
            "format": format_type,
            "total_messages": len(messages),
            "exported_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"메시지 내보내기 오류: {e}")
        return {
            "success": False,
            "error": f"내보내기 실패: {str(e)}"
        }

# 고급 메시지 생성 시스템
class AdvancedKakaoMessageGenerator:
    def __init__(self):
        self.conversation_patterns = {
            "부동산": {
                "keywords": ["아파트", "시세", "매매", "전세", "분양", "조합", "단지", "입지", "이주", "재건축", "상가", "감평가"],
                "style": "전문적이고 구체적인 정보 중심",
                "expressions": ["제가 알기로는", "경험상", "시세 관련해서는", "말씀하신 대로", "개인적으로는"],
                "endings": ["입니다", "어요", "네요", "ㅎ", "것 같아요", "듯해요"]
            },
            "일반_대화": {
                "keywords": ["안녕", "감사", "수고", "좋습니다", "동의", "맞아요"],
                "style": "친근하고 자연스러운 대화체",
                "expressions": ["저도", "네", "정말", "좋은", "그렇군요"],
                "endings": ["요", "네요", "ㅎ", "👍", "어요"]
            },
            "질문_응답": {
                "keywords": ["궁금", "어떻게", "왜", "언제", "어디서", "몰라서", "알려"],
                "style": "명확하고 도움이 되는 답변",
                "expressions": ["말씀하신", "제가 아는 바로는", "확인해보니", "좀 더 구체적으로"],
                "endings": ["입니다", "어요", "것 같아요", "할 것 같아요"]
            },
            "공감_동의": {
                "keywords": ["동의", "찬성", "맞", "그렇", "좋은", "정말"],
                "style": "공감하고 지지하는 톤",
                "expressions": ["정말 그렇죠", "저도 동감", "좋은 의견", "맞습니다"],
                "endings": ["네요 👍", "어요 ㅎ", "죠!", "습니다"]
            },
            "우려_반대": {
                "keywords": ["문제", "걱정", "어려", "힘든", "안될", "반대"],
                "style": "신중하고 우려를 표하는 톤",
                "expressions": ["좀 걱정이", "신중하게", "다시 생각해보니", "문제가 있을 것 같아"],
                "endings": ["네요 ㅠ", "을 것 같아요", "어려울 듯해요", "문제죠"]
            },
            "정보_공유": {
                "keywords": ["들었", "소식", "자료", "정보", "확인", "알아봤"],
                "style": "정보를 제공하거나 공유하는 톤",
                "expressions": ["제가 들은 바로는", "확인해보니", "알아본 결과", "소식지에 따르면"],
                "endings": ["다네요", "어요", "습니다", "ㅎ"]
            }
        }
        
        self.kakao_patterns = {
            # 실제 카카오톡에서 자주 사용되는 패턴들
            "casual_expressions": [
                "ㅎㅎ", "ㅋㅋ", "ㅠㅠ", ";;", "~", "!!", "ㅎ", "ㅋ"
            ],
            "filler_words": [
                "그냥", "좀", "아무래도", "아마", "근데", "그런데", "어쨌든", "여튼"
            ],
            "response_starters": [
                "아", "오", "와", "에이", "앵?", "음", "어", "그", "네"
            ],
            "uncertainty_expressions": [
                "것 같아요", "듯해요", "인 것 같은데", "아닐까", "싶어요", "모르겠어요"
            ],
            "emphasis_patterns": [
                "정말", "진짜", "완전", "너무", "엄청", "되게", "정말로"
            ]
        }

        self.message_styles = {
            "friendly": {
                "endings": ["요", "네요", "어요", "습니다", "ㅎ", "👍", "😊"],
                "expressions": ["좋네요", "그렇군요", "맞아요", "정말요?", "와"],
                "casual_rate": 0.7  # 70% 확률로 캐주얼 표현 사용
            },
            "professional": {
                "endings": ["습니다", "됩니다", "입니다", "해요"],
                "expressions": ["말씀하신 대로", "생각해보니", "확인해보니", "알려드리면"],
                "casual_rate": 0.2  # 20% 확률로 캐주얼 표현 사용
            },
            "casual": {
                "endings": ["요", "ㅎ", "ㅋ", "네", "어", "~"],
                "expressions": ["그치", "맞지", "그러게", "아무래도", "그냥"],
                "casual_rate": 0.9  # 90% 확률로 캐주얼 표현 사용
            }
        }

    def analyze_conversation_context(self, target_message: str, context_messages: list) -> dict:
        """향상된 대화 맥락 분석"""
        context_info = {
            "topic": "일반_대화",
            "sentiment": "neutral",
            "participants": set(),
            "recent_keywords": [],
            "conversation_flow": "continuing",
            "message_type": "general",
            "formality_level": "casual",
            "emotional_intensity": "medium"
        }
        
        # 최근 메시지들에서 키워드 추출
        recent_text = target_message + " " + " ".join([msg.get('content', '') for msg in context_messages[-5:]])
        
        # 주제 감지 (개선된 버전)
        topic_scores = {}
        for topic, patterns in self.conversation_patterns.items():
            keyword_matches = sum(1 for keyword in patterns["keywords"] if keyword in recent_text)
            topic_scores[topic] = keyword_matches
        
        # 가장 높은 점수의 주제 선택
        if topic_scores:
            best_topic = max(topic_scores, key=topic_scores.get)
            if topic_scores[best_topic] >= 1:  # 최소 1개 키워드 매치
                context_info["topic"] = best_topic
        
        # 메시지 유형 세분화
        if "?" in target_message or any(q in target_message for q in ["궁금", "어떻게", "왜", "언제", "어디서", "몰라서", "알려"]):
            context_info["message_type"] = "question"
        elif any(agree in target_message for agree in ["동의", "맞", "좋", "찬성"]):
            context_info["message_type"] = "agreement"
        elif any(worry in target_message for worry in ["걱정", "문제", "어려", "힘든"]):
            context_info["message_type"] = "concern"
        elif any(info in target_message for info in ["들었", "소식", "자료", "정보"]):
            context_info["message_type"] = "information_sharing"
        elif any(casual in target_message for casual in ["ㅎㅎ", "ㅋㅋ", "~"]):
            context_info["message_type"] = "casual_chat"
        
        # 감정 분석 개선
        positive_words = ["좋", "동의", "찬성", "맞", "그렇", "네", "감사", "훌륭", "완전"]
        negative_words = ["안", "아니", "반대", "싫", "어려", "문제", "걱정", "힘든"]
        excited_words = ["와", "우와", "대박", "짱", "최고", "!!"]
        
        positive_count = sum(1 for word in positive_words if word in recent_text)
        negative_count = sum(1 for word in negative_words if word in recent_text)
        excited_count = sum(1 for word in excited_words if word in recent_text)
        
        if excited_count > 0:
            context_info["sentiment"] = "excited"
            context_info["emotional_intensity"] = "high"
        elif positive_count > negative_count:
            context_info["sentiment"] = "positive"
        elif negative_count > positive_count:
            context_info["sentiment"] = "negative"
        
        # 참여자 분석
        for msg in context_messages[-10:]:
            if msg.get('sender'):
                context_info["participants"].add(msg.get('sender'))
        
        # 격식성 수준 판단
        formal_indicators = ["습니다", "됩니다", "입니다"]
        casual_indicators = ["ㅎ", "ㅋ", "~", ";;"]
        
        formal_count = sum(1 for word in formal_indicators if word in recent_text)
        casual_count = sum(1 for word in casual_indicators if word in recent_text)
        
        if formal_count > casual_count:
            context_info["formality_level"] = "formal"
        elif casual_count > 0:
            context_info["formality_level"] = "casual"
        
        return context_info

    def generate_contextual_response(self, target_message: str, context_info: dict, style: str = "friendly") -> str:
        """향상된 맥락 기반 응답 생성"""
        topic = context_info["topic"]
        sentiment = context_info["sentiment"]
        message_type = context_info["message_type"]
        formality = context_info["formality_level"]
        
        # 주제별 패턴 가져오기
        patterns = self.conversation_patterns.get(topic, self.conversation_patterns["일반_대화"])
        style_info = self.message_styles.get(style, self.message_styles["friendly"])
        
        # 실제 카카오톡 스타일 응답 생성
        responses = self._generate_topic_responses(topic, message_type, sentiment, target_message)
        
        # 랜덤 선택
        import random
        base_response = random.choice(responses)
        
        # 카카오톡 스타일 후처리
        enhanced_response = self._enhance_kakao_style(base_response, style_info, formality, sentiment)
        
        return enhanced_response

    def _generate_topic_responses(self, topic: str, message_type: str, sentiment: str, target_message: str) -> list:
        """주제와 메시지 유형에 따른 응답 생성"""
        responses = []
        
        if topic == "부동산":
            if message_type == "question":
                responses = [
                    "말씀하신 부분은 시장 상황에 따라 달라질 수 있어요",
                    "제가 알기로는 그 지역은 괜찮은 편인 것 같아요",
                    "경험상 그런 조건이라면 충분히 고려할 만하다고 생각해요",
                    "정확한 정보는 전문가와 상담해보시는 게 좋을 것 같아요",
                    "시세 관련해서는 최근 동향을 확인해봐야 할 것 같네요"
                ]
            elif message_type == "information_sharing":
                responses = [
                    "좋은 정보 감사해요! 도움이 많이 됐어요",
                    "오, 그런 소식이 있었군요",
                    "제가 들은 얘기와 비슷하네요",
                    "유용한 정보네요. 참고하겠어요",
                    "아 그렇구나! 몰랐던 내용이에요"
                ]
            elif message_type == "concern":
                responses = [
                    "말씀하신 우려점도 충분히 이해돼요",
                    "그런 부분이 좀 걱정되긴 하죠",
                    "신중하게 접근하는 게 맞는 것 같아요",
                    "리스크를 고려해야 할 것 같네요"
                ]
            else:
                responses = [
                    "부동산은 정말 복잡한 것 같아요",
                    "입지나 조건을 종합적으로 봐야겠죠",
                    "시장 상황이 계속 변하니까 어려워요"
                ]
        
        elif topic == "공감_동의":
            responses = [
                "정말 그렇죠! 저도 같은 생각이에요",
                "맞습니다! 완전 동감해요",
                "좋은 의견이네요. 저도 동의해요",
                "그렇게 생각하니까 더 명확해지네요",
                "네, 정말 좋은 포인트예요"
            ]
        
        elif topic == "정보_공유":
            responses = [
                "유용한 정보 공유해주셔서 감사해요",
                "아 그런 게 있었군요! 몰랐어요",
                "좋은 정보네요. 저도 참고하겠어요",
                "도움이 많이 됐어요",
                "오 신기한 정보네요"
            ]
        
        else:  # 일반 대화
            if message_type == "question":
                responses = [
                    "좋은 질문이네요! 저도 궁금했어요",
                    "그 부분은 저도 잘 모르겠어요",
                    "한번 알아봐야 할 것 같아요",
                    "같이 찾아보면 좋을 것 같네요"
                ]
            elif message_type == "agreement":
                responses = [
                    "네, 저도 같은 생각이에요",
                    "맞아요! 정말 그런 것 같아요",
                    "동감해요",
                    "그렇죠! 완전 공감이에요"
                ]
            elif message_type == "casual_chat":
                responses = [
                    "네네 맞아요",
                    "그렇군요",
                    "아하 그러시군요",
                    "좋네요",
                    "재밌네요"
                ]
            else:
                responses = [
                    "말씀하신 내용 잘 이해했어요",
                    "좋은 의견 주셔서 감사해요",
                    "그런 관점도 있군요",
                    "생각해보니 그런 것 같기도 하네요"
                ]
        
        return responses

    def _enhance_kakao_style(self, base_response: str, style_info: dict, formality: str, sentiment: str) -> str:
        """카카오톡 스타일로 응답 개선"""
        import random
        
        response = base_response
        casual_rate = style_info.get("casual_rate", 0.5)
        
        # 캐주얼 표현 추가
        if random.random() < casual_rate:
            # 끝부분에 캐주얼 표현 추가
            casual_endings = self.kakao_patterns["casual_expressions"]
            if not any(ending in response for ending in casual_endings):
                if sentiment == "positive" or sentiment == "excited":
                    response += random.choice([" ㅎ", " ㅎㅎ", " 👍", "!"])
                elif sentiment == "negative":
                    response += random.choice([" ㅠ", " ㅠㅠ", ";;"])
                else:
                    response += random.choice([" ㅎ", "~", ""])
        
        # 격식성 조정
        if formality == "casual" and random.random() < 0.3:
            # 더 캐주얼하게 만들기
            fillers = self.kakao_patterns["filler_words"]
            if random.random() < 0.4:
                filler = random.choice(fillers)
                response = f"{filler} {response}"
        
        # 감정에 따른 강조
        if sentiment == "excited":
            if "!" not in response:
                response += "!"
            if random.random() < 0.5:
                emphasis = random.choice(self.kakao_patterns["emphasis_patterns"])
                response = f"{emphasis} {response}"
        
        return response

# 실제 OpenAI API 연동 함수
async def generate_openai_message(target_message: str, context_messages: List[Dict], settings: Dict) -> Dict:
    """실제 OpenAI API를 사용한 GPT 메시지 생성"""
    try:
        import openai
        
        # OpenAI 클라이언트 초기화
        client = openai.OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        )
        
        # 프롬프트 생성
        prompt = create_enhanced_kakao_prompt(target_message, context_messages, settings)
        
        # GPT 모델 선택 (설정에 따라)
        model = settings.get("ai_model", "gpt-3.5-turbo")
        
        # API 호출
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "당신은 한국어 대화에 특화된 AI 어시스턴트입니다. 자연스럽고 친근한 톤으로 응답하세요."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=settings.get("max_tokens", 500),
            temperature=settings.get("temperature", 0.7),
            top_p=settings.get("top_p", 0.9),
            frequency_penalty=settings.get("frequency_penalty", 0.0),
            presence_penalty=settings.get("presence_penalty", 0.0)
        )
        
        # 응답 처리
        generated_text = response.choices[0].message.content
        
        return {
            "success": True,
            "message": generated_text,
            "model": model,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            },
            "settings": settings
        }
        
    except openai.AuthenticationError:
        return {
            "success": False,
            "error": "OpenAI API 키가 유효하지 않습니다. 환경변수 OPENAI_API_KEY를 확인하세요.",
            "message": "API 키 설정이 필요합니다."
        }
    except openai.RateLimitError:
        return {
            "success": False,
            "error": "API 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.",
            "message": "요청 한도 초과"
        }
    except openai.APIError as e:
        return {
            "success": False,
            "error": f"OpenAI API 오류: {str(e)}",
            "message": "API 오류 발생"
        }
    except Exception as e:
        logger.error(f"GPT 메시지 생성 실패: {e}")
        return {
            "success": False,
            "error": f"메시지 생성 중 오류가 발생했습니다: {str(e)}",
            "message": "오류 발생"
        }

# 향상된 GPT 메시지 생성 함수 (학습 시스템 통합)
async def generate_gpt_message(target_message: str, context_messages: List[Dict], settings: Dict) -> Dict:
    """학습 시스템이 통합된 고급 GPT 메시지 생성"""
    
    # 1. 먼저 고급 생성기 시도
    advanced_generator = AdvancedKakaoMessageGenerator()
    
    try:
        # 맥락 분석
        context_info = advanced_generator.analyze_conversation_context(target_message, context_messages)
        
        # 설정에서 스타일 가져오기
        style = settings.get('tone', 'friendly')
        if style == '친근한':
            style = 'friendly'
        elif style == '전문적인':
            style = 'professional'
        elif style == '캐주얼':
            style = 'casual'
        
        # 학습 시스템에서 개선 제안 가져오기
        adaptive_suggestions = learning_system.get_adaptive_suggestions(
            context_info["topic"], 
            context_info["message_type"], 
            style
        )
        
        # 피드백 기반 응답 개선
        generated_content = advanced_generator.generate_contextual_response(
            target_message, context_info, style
        )
        
        # 학습된 패턴으로 응답 개선
        if adaptive_suggestions["recommended_responses"]:
            # 추천 응답이 있다면 혼합하여 더 나은 응답 생성
            import random
            if random.random() < 0.3:  # 30% 확률로 학습된 응답 활용
                recommended = random.choice(adaptive_suggestions["recommended_responses"])
                # 기존 응답과 추천 응답을 혼합
                generated_content = f"{recommended} {generated_content}".strip()
        
        # 피하라고 학습된 패턴 확인
        for avoid_pattern in adaptive_suggestions["avoid_patterns"]:
            if avoid_pattern.lower() in generated_content.lower():
                # 새로운 응답 재생성
                generated_content = advanced_generator.generate_contextual_response(
                    target_message, context_info, style
                )
                break
        
        # 스타일 조정 적용
        if adaptive_suggestions["style_adjustments"]:
            style_adj = adaptive_suggestions["style_adjustments"]
            # 학습된 스타일 선호도 반영
            if style_adj.get("casual_rate", 0) > 0.8:
                generated_content += " ㅎ"
            elif style_adj.get("casual_rate", 0) < 0.3:
                generated_content = generated_content.replace(" ㅎ", "").replace("ㅋ", "")
        
        # 메시지 ID 생성 (학습 추적용)
        import uuid
        message_id = str(uuid.uuid4())
        
        # 분석 정보 추가
        analysis = {
            "method": "advanced_contextual_with_learning",
            "topic": context_info["topic"],
            "sentiment": context_info["sentiment"],
            "message_type": context_info["message_type"],
            "participants_count": len(context_info["participants"]),
            "style_applied": style,
            "confidence_score": 0.92 + adaptive_suggestions["confidence_boost"],
            "context_utilized": len(context_messages) > 0,
            "learning_applied": len(adaptive_suggestions["recommended_responses"]) > 0,
            "generation_time": datetime.now().isoformat(),
            "message_id": message_id
        }
        
        return {
            "content": generated_content,
            "analysis": analysis,
            "success": True,
            "message_id": message_id,
            "adaptive_info": {
                "recommendations_used": len(adaptive_suggestions["recommended_responses"]),
                "patterns_avoided": len(adaptive_suggestions["avoid_patterns"]),
                "style_adjustments_applied": bool(adaptive_suggestions["style_adjustments"])
            }
        }
        
    except Exception as e:
        logger.warning(f"고급 생성기 실패, OpenAI 대체 시도: {e}")
        
        # 2. 실제 OpenAI API 호출
        return await generate_openai_message(target_message, context_messages, settings)

def create_enhanced_kakao_prompt(target_message: str, context_messages: List[Dict], settings: Dict) -> str:
    """
    고도화된 카카오톡 스타일 프롬프트 생성
    - 실제 대화 맥락 이해
    - 개인별 맞춤형 스타일
    - 상황별 적절한 톤 조절
    - 감정 상태 기반 응답 조절
    - 대화 연속성 유지
    """
    
    # 1. 대화 맥락 분석
    conversation_context = analyze_conversation_context(context_messages)
    
    # 2. 사용자 성향 분석
    user_style = analyze_user_communication_style(context_messages)
    
    # 3. 감정 상태 분석
    emotional_state = analyze_emotional_state(context_messages)
    
    # 4. 대화 연속성 분석
    conversation_flow = analyze_conversation_flow(context_messages)
    
    # 5. 상황별 톤 결정
    appropriate_tone = determine_appropriate_tone(target_message, conversation_context, settings)
    
    # 6. 개인화된 스타일 적용
    personalized_style = apply_personalized_style(user_style, settings)
    
    # 7. 이모티콘 선택 가이드
    emoji_guide = generate_emoji_guide(emotional_state, appropriate_tone, user_style)
    
    prompt = f"""
당신은 카카오톡에서 실제로 대화하는 사람입니다. 다음 조건을 고려하여 자연스럽고 적절한 응답을 생성해주세요:

## 대화 맥락 분석
- 대화 주제: {conversation_context.get('main_topic', '일반 대화')}
- 대화 분위기: {conversation_context.get('mood', '친근함')}
- 참여자 관계: {conversation_context.get('relationship', '친구')}
- 대화 깊이: {conversation_context.get('depth', '일반적')}

## 사용자 성향 분석
- 말투 스타일: {user_style.get('speech_style', '친근함')}
- 이모티콘 사용: {user_style.get('emoji_usage', '적당함')}
- 문장 길이: {user_style.get('message_length', '중간')}
- 반응 패턴: {user_style.get('response_pattern', '즉시')}

## 감정 상태 분석
- 현재 감정: {emotional_state.get('current_emotion', '중립')}
- 감정 강도: {emotional_state.get('intensity', '보통')}
- 감정 변화: {emotional_state.get('emotion_trend', '안정')}
- 공감 필요도: {emotional_state.get('empathy_needed', '보통')}

## 대화 연속성
- 대화 흐름: {conversation_flow.get('flow_type', '일반적')}
- 이전 주제: {conversation_flow.get('previous_topic', '없음')}
- 연결성: {conversation_flow.get('connectivity', '보통')}
- 자연스러운 전환 필요: {conversation_flow.get('transition_needed', False)}

## 상황별 톤 설정
- 요청된 톤: {settings.get('tone', '친근')}
- 적절한 톤: {appropriate_tone}
- 격식 수준: {settings.get('formality', '비격식')}

## 개인화된 스타일
- 선호 표현: {personalized_style.get('preferred_expressions', [])}
- 피해야 할 표현: {personalized_style.get('avoided_expressions', [])}
- 특별한 습관: {personalized_style.get('speech_habits', [])}

## 이모티콘 가이드
- 추천 이모티콘: {emoji_guide.get('recommended', [])}
- 피해야 할 이모티콘: {emoji_guide.get('avoid', [])}
- 사용 빈도: {emoji_guide.get('frequency', '적당함')}

## 응답 생성 규칙
1. 카카오톡에서 실제로 사용하는 자연스러운 한국어로 응답
2. 상대방의 감정 상태를 고려한 공감적 반응
3. 대화 맥락을 고려한 자연스러운 연결
4. 개인화된 말투와 표현 사용
5. 상황에 맞는 적절한 이모티콘 사용
6. 대화 연속성을 유지하면서도 새로운 내용 추가

## 입력 메시지
"{target_message}"

위 조건들을 모두 고려하여 자연스럽고 적절한 응답을 생성해주세요.
"""
    
    return prompt

def analyze_emotional_state(context_messages: List[Dict]) -> Dict:
    """감정 상태를 깊이 분석"""
    if not context_messages:
        return {
            'current_emotion': '중립',
            'intensity': '보통',
            'emotion_trend': '안정',
            'empathy_needed': '보통'
        }
    
    # 감정 키워드 정의
    emotion_keywords = {
        '기쁨': ['좋아', '행복', '즐거워', '완벽', '최고', '대박', '신나', '기뻐'],
        '슬픔': ['슬퍼', '우울', '힘들어', '지쳐', '아파', '상처', '외로워'],
        '화남': ['화나', '짜증', '열받', '빡쳐', '스트레스', '답답', '짜증나'],
        '걱정': ['걱정', '불안', '긴장', '무서워', '두려워', '근심', '염려'],
        '감사': ['감사', '고마워', '고맙', '은혜', '도움', '배려'],
        '놀람': ['어?', '뭐?', '진짜?', '대박', '놀라', '깜짝', '헐']
    }
    
    # 최근 메시지들의 감정 분석
    recent_messages = context_messages[-5:]  # 최근 5개 메시지
    emotion_scores = {emotion: 0 for emotion in emotion_keywords.keys()}
    
    for msg in recent_messages:
        content = msg.get('content', '').lower()
        for emotion, keywords in emotion_keywords.items():
            for keyword in keywords:
                if keyword in content:
                    emotion_scores[emotion] += 1
    
    # 주요 감정 결정
    dominant_emotion = max(emotion_scores, key=emotion_scores.get)
    max_score = max(emotion_scores.values())
    
    # 감정 강도 분석
    if max_score == 0:
        intensity = '보통'
    elif max_score <= 1:
        intensity = '약함'
    elif max_score <= 3:
        intensity = '보통'
    else:
        intensity = '강함'
    
    # 감정 변화 추이
    if len(context_messages) >= 10:
        first_half = context_messages[-10:-5]
        second_half = context_messages[-5:]
        
        first_emotions = sum(1 for msg in first_half for emotion, keywords in emotion_keywords.items() 
                           for keyword in keywords if keyword in msg.get('content', '').lower())
        second_emotions = sum(1 for msg in second_half for emotion, keywords in emotion_keywords.items() 
                            for keyword in keywords if keyword in msg.get('content', '').lower())
        
        if second_emotions > first_emotions + 2:
            emotion_trend = '상승'
        elif first_emotions > second_emotions + 2:
            emotion_trend = '하락'
        else:
            emotion_trend = '안정'
    else:
        emotion_trend = '안정'
    
    # 공감 필요도
    negative_emotions = ['슬픔', '화남', '걱정']
    if dominant_emotion in negative_emotions and intensity in ['보통', '강함']:
        empathy_needed = '높음'
    elif dominant_emotion == '기쁨' and intensity in ['보통', '강함']:
        empathy_needed = '공유'
    else:
        empathy_needed = '보통'
    
    return {
        'current_emotion': dominant_emotion,
        'intensity': intensity,
        'emotion_trend': emotion_trend,
        'empathy_needed': empathy_needed
    }

def analyze_conversation_flow(context_messages: List[Dict]) -> Dict:
    """대화 연속성 분석"""
    if not context_messages:
        return {
            'flow_type': '일반적',
            'previous_topic': '없음',
            'connectivity': '보통',
            'transition_needed': False
        }
    
    # 주제 추출
    topics = {
        '일정': ['일정', '약속', '미팅', '회의', '시간', '날짜'],
        '음식': ['음식', '식사', '점심', '저녁', '밥', '카페'],
        '업무': ['업무', '일', '회사', '프로젝트', '보고', '회의'],
        '감정': ['기분', '감정', '마음', '생각', '고민', '스트레스'],
        '일상': ['일상', '하루', '생활', '취미', '운동', '영화']
    }
    
    # 최근 메시지들의 주제 분석
    recent_topics = []
    for msg in context_messages[-3:]:  # 최근 3개 메시지
        content = msg.get('content', '')
        for topic, keywords in topics.items():
            if any(keyword in content for keyword in keywords):
                recent_topics.append(topic)
                break
    
    # 대화 흐름 타입 결정
    if len(set(recent_topics)) == 1 and len(recent_topics) > 1:
        flow_type = '집중적'
    elif len(set(recent_topics)) > 2:
        flow_type = '다양한'
    else:
        flow_type = '일반적'
    
    # 이전 주제
    previous_topic = recent_topics[-1] if recent_topics else '없음'
    
    # 연결성 분석
    if len(context_messages) >= 2:
        last_msg = context_messages[-1].get('content', '')
        prev_msg = context_messages[-2].get('content', '')
        
        # 키워드 연관성 확인
        last_words = set(last_msg.split())
        prev_words = set(prev_msg.split())
        common_words = last_words.intersection(prev_words)
        
        if len(common_words) >= 2:
            connectivity = '높음'
        elif len(common_words) >= 1:
            connectivity = '보통'
        else:
            connectivity = '낮음'
    else:
        connectivity = '보통'
    
    # 전환 필요성
    transition_needed = (connectivity == '낮음' and flow_type == '다양한')
    
    return {
        'flow_type': flow_type,
        'previous_topic': previous_topic,
        'connectivity': connectivity,
        'transition_needed': transition_needed
    }

def generate_emoji_guide(emotional_state: Dict, appropriate_tone: str, user_style: Dict) -> Dict:
    """상황에 맞는 이모티콘 가이드 생성"""
    
    # 감정별 추천 이모티콘
    emotion_emojis = {
        '기쁨': ['😊', '😄', '😃', '😁', '🎉', '✨', '💖'],
        '슬픔': ['😢', '😭', '😔', '💔', '🤗', '💙'],
        '화남': ['😤', '😠', '😡', '💪', '🔥'],
        '걱정': ['😰', '😨', '😟', '🤔', '💭'],
        '감사': ['🙏', '💝', '💕', '😊', '✨'],
        '놀람': ['😲', '😱', '🤯', '💥', '⭐'],
        '중립': ['😊', '👍', '💬', '✨']
    }
    
    # 톤별 이모티콘 스타일
    tone_emojis = {
        '긴급/신속': ['⚡', '🚨', '💨'],
        '공식/격식': ['💼', '📋', '✅'],
        '친근/편안': ['😊', '👍', '💕', '✨'],
        '공감/위로': ['🤗', '💙', '💝', '🙏'],
        '기쁨/축하': ['🎉', '🎊', '🎈', '💖', '✨']
    }
    
    # 사용자 스타일 고려
    emoji_usage = user_style.get('emoji_usage', '적당함')
    
    # 추천 이모티콘 선택
    current_emotion = emotional_state.get('current_emotion', '중립')
    emotion_based = emotion_emojis.get(current_emotion, emotion_emojis['중립'])
    tone_based = tone_emojis.get(appropriate_tone, emotion_emojis['중립'])
    
    # 이모티콘 사용 빈도 조절
    if emoji_usage == '많음':
        recommended = emotion_based[:5] + tone_based[:3]
        frequency = '높음'
    elif emoji_usage == '없음':
        recommended = []
        frequency = '없음'
    else:
        recommended = emotion_based[:3] + tone_based[:2]
        frequency = '적당함'
    
    # 피해야 할 이모티콘
    avoid = []
    if appropriate_tone == '공식/격식':
        avoid = ['😅', '😂', '🤣', '😍', '🥰']
    elif current_emotion == '슬픔':
        avoid = ['😄', '😁', '🎉', '🎊']
    
    return {
        'recommended': recommended,
        'avoid': avoid,
        'frequency': frequency
    }

def analyze_conversation_context(context_messages: List[Dict]) -> Dict:
    """대화 맥락을 깊이 분석"""
    if not context_messages:
        return {'main_topic': '일반 대화', 'mood': '친근함', 'relationship': '친구', 'depth': '일반적'}
    
    # 최근 메시지들 분석
    recent_messages = context_messages[-10:]  # 최근 10개 메시지
    
    # 주제 추출
    topics = []
    for msg in recent_messages:
        content = msg.get('content', '')
        if '일정' in content or '약속' in content:
            topics.append('일정/약속')
        elif '음식' in content or '식사' in content:
            topics.append('음식')
        elif '일' in content or '업무' in content:
            topics.append('업무')
        elif '감정' in content or '기분' in content:
            topics.append('감정/기분')
    
    main_topic = max(set(topics), key=topics.count) if topics else '일반 대화'
    
    # 분위기 분석
    mood_keywords = {
        '긍정': ['좋아', '행복', '즐거워', '감사', '고마워'],
        '부정': ['싫어', '화나', '짜증', '힘들어', '슬퍼'],
        '중립': ['그래', '알겠어', '오케이', '네']
    }
    
    mood_scores = {'긍정': 0, '부정': 0, '중립': 0}
    for msg in recent_messages:
        content = msg.get('content', '').lower()
        for mood, keywords in mood_keywords.items():
            for keyword in keywords:
                if keyword in content:
                    mood_scores[mood] += 1
    
    dominant_mood = max(mood_scores, key=mood_scores.get)
    
    # 관계 분석
    relationship_indicators = {
        '친구': ['야', '너', '우리', '친구'],
        '가족': ['엄마', '아빠', '형', '누나', '동생'],
        '동료': ['팀장', '사장', '선배', '후배', '회사'],
        '연인': ['사랑', '보고싶', '그리워', '달링', '하트']
    }
    
    relationship = '친구'  # 기본값
    for rel, indicators in relationship_indicators.items():
        for msg in recent_messages:
            content = msg.get('content', '')
            for indicator in indicators:
                if indicator in content:
                    relationship = rel
                    break
    
    # 대화 깊이 분석
    depth_indicators = {
        '깊은': ['진지', '중요', '생각', '고민', '상담'],
        '일반적': ['일상', '잡담', '이야기'],
        '가벼운': ['농담', '재미', '웃음', '장난']
    }
    
    depth = '일반적'
    for depth_type, indicators in depth_indicators.items():
        for msg in recent_messages:
            content = msg.get('content', '')
            for indicator in indicators:
                if indicator in content:
                    depth = depth_type
                    break
    
    return {
        'main_topic': main_topic,
        'mood': dominant_mood,
        'relationship': relationship,
        'depth': depth
    }

def analyze_user_communication_style(context_messages: List[Dict]) -> Dict:
    """사용자의 의사소통 스타일 분석"""
    if not context_messages:
        return {
            'speech_style': '친근함',
            'emoji_usage': '적당함',
            'message_length': '중간',
            'response_pattern': '즉시'
        }
    
    # 말투 스타일 분석
    formal_indicators = ['습니다', '니다', '입니다', '습니다']
    casual_indicators = ['야', '너', '우리', '그래']
    
    formal_count = 0
    casual_count = 0
    
    for msg in context_messages:
        content = msg.get('content', '')
        for indicator in formal_indicators:
            if indicator in content:
                formal_count += 1
        for indicator in casual_indicators:
            if indicator in content:
                casual_count += 1
    
    speech_style = '격식' if formal_count > casual_count else '친근함'
    
    # 이모티콘 사용 분석
    emoji_count = 0
    for msg in context_messages:
        content = msg.get('content', '')
        emoji_count += content.count('😊') + content.count('😂') + content.count('❤️') + content.count('👍')
    
    emoji_usage = '많음' if emoji_count > len(context_messages) else '적당함' if emoji_count > 0 else '없음'
    
    # 메시지 길이 분석
    total_length = sum(len(msg.get('content', '')) for msg in context_messages)
    avg_length = total_length / len(context_messages) if context_messages else 0
    
    message_length = '긴' if avg_length > 50 else '짧은' if avg_length < 20 else '중간'
    
    # 반응 패턴 분석
    response_times = []
    for i in range(1, len(context_messages)):
        current_time = context_messages[i].get('timestamp', 0)
        prev_time = context_messages[i-1].get('timestamp', 0)
        if current_time and prev_time:
            response_times.append(current_time - prev_time)
    
    avg_response_time = sum(response_times) / len(response_times) if response_times else 0
    response_pattern = '즉시' if avg_response_time < 60 else '신중한' if avg_response_time > 300 else '일반적'
    
    return {
        'speech_style': speech_style,
        'emoji_usage': emoji_usage,
        'message_length': message_length,
        'response_pattern': response_pattern
    }

def determine_appropriate_tone(target_message: str, conversation_context: Dict, settings: Dict) -> str:
    """상황에 맞는 적절한 톤 결정"""
    
    # 메시지 내용 분석
    urgent_keywords = ['급해', '바빠', '빨리', '시급', '긴급']
    formal_keywords = ['회의', '업무', '공식', '보고', '검토']
    casual_keywords = ['농담', '재미', '웃음', '장난', '친구']
    
    is_urgent = any(keyword in target_message for keyword in urgent_keywords)
    is_formal = any(keyword in target_message for keyword in formal_keywords)
    is_casual = any(keyword in target_message for keyword in casual_keywords)
    
    # 대화 맥락 고려
    context_mood = conversation_context.get('mood', '중립')
    context_relationship = conversation_context.get('relationship', '친구')
    
    # 톤 결정 로직
    if is_urgent:
        return '긴급/신속'
    elif is_formal or context_relationship in ['동료', '상사']:
        return '공식/격식'
    elif is_casual or context_relationship in ['친구', '연인']:
        return '친근/편안'
    elif context_mood == '부정':
        return '공감/위로'
    elif context_mood == '긍정':
        return '기쁨/축하'
    else:
        return settings.get('tone', '친근')

def apply_personalized_style(user_style: Dict, settings: Dict) -> Dict:
    """개인화된 스타일 적용"""
    
    # 사용자별 선호 표현
    style_preferences = {
        '친근함': {
            'preferred_expressions': ['그래', '맞아', '좋아', '응', '오케이'],
            'avoided_expressions': ['습니다', '니다', '공식적'],
            'speech_habits': ['~야', '~이야', '~거든']
        },
        '격식': {
            'preferred_expressions': ['네', '알겠습니다', '감사합니다', '죄송합니다'],
            'avoided_expressions': ['야', '너', '친근한 표현'],
            'speech_habits': ['~습니다', '~니다', '~입니다']
        }
    }
    
    speech_style = user_style.get('speech_style', '친근함')
    base_style = style_preferences.get(speech_style, style_preferences['친근함'])
    
    # 이모티콘 사용 패턴
    emoji_usage = user_style.get('emoji_usage', '적당함')
    if emoji_usage == '많음':
        base_style['speech_habits'].extend(['😊', '😂', '❤️', '👍'])
    elif emoji_usage == '없음':
        base_style['avoided_expressions'].extend(['이모티콘', '😊', '😂'])
    
    # 메시지 길이 패턴
    message_length = user_style.get('message_length', '중간')
    if message_length == '긴':
        base_style['speech_habits'].extend(['상세한 설명', '배경 설명'])
    elif message_length == '짧은':
        base_style['speech_habits'].extend(['간결함', '핵심만'])
    
    return base_style

# 고도화된 실시간 학습 시스템
class AdvancedRealTimeLearningSystem:
    def __init__(self):
        self.conversation_patterns = {}
        self.user_preferences = {}
        self.response_effectiveness = {}
        self.learning_history = []
        self.emotion_tracking = {}
        self.style_adaptation = {}
        self.context_memory = {}
    
    def learn_from_conversation(self, user_id: str, messages: List[Dict], response: str, feedback: Dict = None):
        """고도화된 대화 학습"""
        if user_id not in self.conversation_patterns:
            self.conversation_patterns[user_id] = []
        
        # 1. 대화 패턴 심화 분석
        pattern = self.analyze_advanced_conversation_pattern(messages)
        self.conversation_patterns[user_id].append(pattern)
        
        # 2. 감정 상태 추적
        self.track_emotional_state(user_id, messages)
        
        # 3. 스타일 적응 학습
        self.adapt_communication_style(user_id, messages, response, feedback)
        
        # 4. 컨텍스트 메모리 업데이트
        self.update_context_memory(user_id, messages)
        
        # 5. 응답 효과성 평가
        if feedback:
            self.evaluate_advanced_response_effectiveness(user_id, response, feedback)
    
    def analyze_advanced_conversation_pattern(self, messages: List[Dict]) -> Dict:
        """고도화된 대화 패턴 분석"""
        if not messages:
            return {}
        
        # 기본 패턴 분석
        basic_pattern = {
            'message_count': len(messages),
            'avg_length': sum(len(msg.get('content', '')) for msg in messages) / len(messages),
            'emoji_usage': sum(1 for msg in messages if any(emoji in msg.get('content', '') for emoji in ['😊', '😂', '❤️', '👍'])),
            'response_time': self.calculate_response_time(messages),
            'topic_consistency': self.analyze_topic_consistency(messages)
        }
        
        # 고도화된 분석 추가
        advanced_pattern = {
            **basic_pattern,
            'emotional_flow': self.analyze_emotional_flow(messages),
            'communication_style': self.analyze_communication_style(messages),
            'interaction_pattern': self.analyze_interaction_pattern(messages),
            'context_switches': self.analyze_context_switches(messages),
            'engagement_level': self.analyze_engagement_level(messages)
        }
        
        return advanced_pattern
    
    def analyze_emotional_flow(self, messages: List[Dict]) -> Dict:
        """감정 흐름 분석"""
        emotion_keywords = {
            'positive': ['좋아', '행복', '즐거워', '완벽', '최고', '대박'],
            'negative': ['싫어', '화나', '짜증', '힘들어', '슬퍼', '스트레스'],
            'neutral': ['그래', '알겠어', '오케이', '네', '응']
        }
        
        emotion_scores = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        for msg in messages:
            content = msg.get('content', '').lower()
            for emotion, keywords in emotion_keywords.items():
                for keyword in keywords:
                    if keyword in content:
                        emotion_scores[emotion] += 1
        
        total_emotions = sum(emotion_scores.values())
        if total_emotions > 0:
            emotion_distribution = {k: v/total_emotions for k, v in emotion_scores.items()}
        else:
            emotion_distribution = {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}
        
        return {
            'distribution': emotion_distribution,
            'dominant_emotion': max(emotion_scores, key=emotion_scores.get),
            'emotion_stability': self.calculate_emotion_stability(messages)
        }
    
    def analyze_communication_style(self, messages: List[Dict]) -> Dict:
        """의사소통 스타일 분석"""
        style_indicators = {
            'formal': ['습니다', '니다', '입니다', '공식', '업무'],
            'casual': ['야', '너', '우리', '친구', '편하게'],
            'empathetic': ['공감', '이해해', '힘들겠어', '괜찮아', '응원'],
            'direct': ['직접', '명확', '확실', '분명', '정확']
        }
        
        style_scores = {style: 0 for style in style_indicators.keys()}
        
        for msg in messages:
            content = msg.get('content', '')
            for style, indicators in style_indicators.items():
                for indicator in indicators:
                    if indicator in content:
                        style_scores[style] += 1
        
        dominant_style = max(style_scores, key=style_scores.get)
        
        return {
            'dominant_style': dominant_style,
            'style_mix': style_scores,
            'style_consistency': self.calculate_style_consistency(messages)
        }
    
    def analyze_interaction_pattern(self, messages: List[Dict]) -> Dict:
        """상호작용 패턴 분석"""
        if len(messages) < 2:
            return {'type': 'single', 'frequency': 'low'}
        
        # 질문-답변 패턴
        question_indicators = ['?', '뭐', '어떻게', '언제', '어디', '왜']
        answer_indicators = ['그래', '맞아', '네', '알겠어', '오케이']
        
        question_count = sum(1 for msg in messages if any(q in msg.get('content', '') for q in question_indicators))
        answer_count = sum(1 for msg in messages if any(a in msg.get('content', '') for a in answer_indicators))
        
        interaction_type = 'question_answer' if question_count > 0 and answer_count > 0 else 'conversation'
        
        return {
            'type': interaction_type,
            'question_count': question_count,
            'answer_count': answer_count,
            'interaction_frequency': 'high' if len(messages) > 5 else 'medium' if len(messages) > 2 else 'low'
        }
    
    def analyze_context_switches(self, messages: List[Dict]) -> Dict:
        """컨텍스트 전환 분석"""
        if len(messages) < 3:
            return {'switches': 0, 'frequency': 'low'}
        
        topics = {
            '일정': ['일정', '약속', '시간', '날짜'],
            '음식': ['음식', '식사', '밥', '카페'],
            '업무': ['업무', '일', '회사', '프로젝트'],
            '감정': ['기분', '감정', '마음', '생각']
        }
        
        topic_sequence = []
        for msg in messages:
            content = msg.get('content', '')
            for topic, keywords in topics.items():
                if any(keyword in content for keyword in keywords):
                    topic_sequence.append(topic)
                    break
            else:
                topic_sequence.append('일반')
        
        # 주제 전환 횟수 계산
        switches = 0
        for i in range(1, len(topic_sequence)):
            if topic_sequence[i] != topic_sequence[i-1]:
                switches += 1
        
        return {
            'switches': switches,
            'frequency': 'high' if switches > 2 else 'medium' if switches > 0 else 'low',
            'topic_sequence': topic_sequence
        }
    
    def analyze_engagement_level(self, messages: List[Dict]) -> Dict:
        """참여도 수준 분석"""
        if not messages:
            return {'level': 'low', 'indicators': []}
        
        engagement_indicators = {
            'high': ['상세한 설명', '긴 메시지', '질문', '이모티콘', '감정 표현'],
            'medium': ['일반적인 대화', '적당한 길이', '응답'],
            'low': ['짧은 답변', '단순 응답', '무응답']
        }
        
        engagement_scores = {'high': 0, 'medium': 0, 'low': 0}
        
        for msg in messages:
            content = msg.get('content', '')
            length = len(content)
            
            if length > 50 or any(indicator in content for indicator in engagement_indicators['high']):
                engagement_scores['high'] += 1
            elif length < 10 or any(indicator in content for indicator in engagement_indicators['low']):
                engagement_scores['low'] += 1
            else:
                engagement_scores['medium'] += 1
        
        dominant_level = max(engagement_scores, key=engagement_scores.get)
        
        return {
            'level': dominant_level,
            'scores': engagement_scores,
            'indicators': engagement_indicators[dominant_level]
        }
    
    def track_emotional_state(self, user_id: str, messages: List[Dict]):
        """감정 상태 추적"""
        if user_id not in self.emotion_tracking:
            self.emotion_tracking[user_id] = []
        
        emotional_state = self.analyze_emotional_flow(messages)
        self.emotion_tracking[user_id].append({
            'timestamp': time.time(),
            'state': emotional_state,
            'message_count': len(messages)
        })
        
        # 최근 10개만 유지
        if len(self.emotion_tracking[user_id]) > 10:
            self.emotion_tracking[user_id] = self.emotion_tracking[user_id][-10:]
    
    def adapt_communication_style(self, user_id: str, messages: List[Dict], response: str, feedback: Dict = None):
        """의사소통 스타일 적응"""
        if user_id not in self.style_adaptation:
            self.style_adaptation[user_id] = {
                'preferred_tone': '친근한',
                'emoji_preference': '적당함',
                'response_length': '중간',
                'formality_level': '비격식',
                'adaptation_history': []
            }
        
        # 현재 스타일 분석
        current_style = self.analyze_communication_style(messages)
        
        # 피드백 기반 적응
        if feedback:
            adaptation = {
                'timestamp': time.time(),
                'previous_style': self.style_adaptation[user_id].copy(),
                'feedback': feedback,
                'adaptation_type': 'positive' if feedback.get('positive', False) else 'negative'
            }
            
            if feedback.get('positive', False):
                # 긍정적 피드백 시 현재 스타일 강화
                self.style_adaptation[user_id]['adaptation_history'].append(adaptation)
            elif feedback.get('negative', False):
                # 부정적 피드백 시 스타일 조정
                self.adjust_style_based_on_feedback(user_id, feedback)
                self.style_adaptation[user_id]['adaptation_history'].append(adaptation)
    
    def adjust_style_based_on_feedback(self, user_id: str, feedback: Dict):
        """피드백 기반 스타일 조정"""
        style = self.style_adaptation[user_id]
        
        if 'tone' in feedback:
            style['preferred_tone'] = feedback['tone']
        
        if 'emoji' in feedback:
            style['emoji_preference'] = feedback['emoji']
        
        if 'length' in feedback:
            style['response_length'] = feedback['length']
        
        if 'formality' in feedback:
            style['formality_level'] = feedback['formality']
    
    def update_context_memory(self, user_id: str, messages: List[Dict]):
        """컨텍스트 메모리 업데이트"""
        if user_id not in self.context_memory:
            self.context_memory[user_id] = []
        
        # 중요한 정보 추출
        important_info = self.extract_important_info(messages)
        
        if important_info:
            self.context_memory[user_id].append({
                'timestamp': time.time(),
                'info': important_info,
                'context': messages[-3:] if len(messages) >= 3 else messages
            })
        
        # 최근 20개만 유지
        if len(self.context_memory[user_id]) > 20:
            self.context_memory[user_id] = self.context_memory[user_id][-20:]
    
    def extract_important_info(self, messages: List[Dict]) -> Dict:
        """중요한 정보 추출"""
        important_keywords = ['중요', '필요', '꼭', '반드시', '확실히', '분명히']
        schedule_keywords = ['일정', '약속', '시간', '날짜', '미팅']
        preference_keywords = ['좋아', '싫어', '선호', '원해', '바라']
        
        important_info = {
            'schedules': [],
            'preferences': [],
            'important_points': []
        }
        
        for msg in messages:
            content = msg.get('content', '')
            
            # 일정 정보
            if any(keyword in content for keyword in schedule_keywords):
                important_info['schedules'].append(content)
            
            # 선호도 정보
            if any(keyword in content for keyword in preference_keywords):
                important_info['preferences'].append(content)
            
            # 중요 포인트
            if any(keyword in content for keyword in important_keywords):
                important_info['important_points'].append(content)
        
        return important_info
    
    def evaluate_advanced_response_effectiveness(self, user_id: str, response: str, feedback: Dict):
        """고도화된 응답 효과성 평가"""
        if user_id not in self.response_effectiveness:
            self.response_effectiveness[user_id] = []
        
        # 기본 효과성 점수
        base_score = 0.5
        
        if feedback.get('positive', False):
            base_score = 1.0
        elif feedback.get('negative', False):
            base_score = 0.0
        
        # 추가 평가 요소
        response_length = len(response)
        emoji_count = sum(1 for emoji in ['😊', '😂', '❤️', '👍'] if emoji in response)
        
        # 길이 적절성 평가
        length_score = 1.0 if 10 <= response_length <= 100 else 0.7 if response_length < 10 else 0.8
        
        # 이모티콘 적절성 평가
        emoji_score = 1.0 if 0 <= emoji_count <= 2 else 0.8
        
        # 종합 효과성 점수
        effectiveness_score = (base_score * 0.6 + length_score * 0.2 + emoji_score * 0.2)
        
        self.response_effectiveness[user_id].append({
            'response': response,
            'score': effectiveness_score,
            'feedback': feedback,
            'timestamp': time.time(),
            'metrics': {
                'length': response_length,
                'emoji_count': emoji_count,
                'length_score': length_score,
                'emoji_score': emoji_score
            }
        })
    
    def get_advanced_learning_insights(self, user_id: str) -> Dict:
        """고도화된 학습 인사이트 제공"""
        if user_id not in self.conversation_patterns:
            return {}
        
        patterns = self.conversation_patterns[user_id]
        effectiveness = self.response_effectiveness.get(user_id, [])
        emotions = self.emotion_tracking.get(user_id, [])
        style = self.style_adaptation.get(user_id, {})
        context = self.context_memory.get(user_id, [])
        
        # 기본 통계
        basic_insights = {
            'total_conversations': len(patterns),
            'avg_message_length': sum(p.get('avg_length', 0) for p in patterns) / len(patterns) if patterns else 0,
            'emoji_usage_rate': sum(p.get('emoji_usage', 0) for p in patterns) / len(patterns) if patterns else 0,
            'avg_response_time': sum(p.get('response_time', 0) for p in patterns) / len(patterns) if patterns else 0,
            'topic_consistency': sum(p.get('topic_consistency', 0) for p in patterns) / len(patterns) if patterns else 0,
            'response_effectiveness': sum(e.get('score', 0) for e in effectiveness) / len(effectiveness) if effectiveness else 0
        }
        
        # 고도화된 인사이트
        advanced_insights = {
            **basic_insights,
            'emotional_trends': self.analyze_emotional_trends(emotions),
            'style_evolution': self.analyze_style_evolution(style),
            'engagement_patterns': self.analyze_engagement_patterns(patterns),
            'context_retention': len(context),
            'learning_progress': self.calculate_learning_progress(user_id)
        }
        
        return advanced_insights
    
    def analyze_emotional_trends(self, emotions: List[Dict]) -> Dict:
        """감정 트렌드 분석"""
        if not emotions:
            return {'trend': 'stable', 'dominant_emotion': 'neutral'}
        
        recent_emotions = emotions[-5:]  # 최근 5개
        emotion_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        for emotion_data in recent_emotions:
            dominant = emotion_data['state'].get('dominant_emotion', 'neutral')
            if dominant == 'positive':
                emotion_counts['positive'] += 1
            elif dominant == 'negative':
                emotion_counts['negative'] += 1
            else:
                emotion_counts['neutral'] += 1
        
        dominant_emotion = max(emotion_counts, key=emotion_counts.get)
        
        # 트렌드 계산
        if len(emotions) >= 2:
            first_half = emotions[:len(emotions)//2]
            second_half = emotions[len(emotions)//2:]
            
            first_positive = sum(1 for e in first_half if e['state'].get('dominant_emotion') == 'positive')
            second_positive = sum(1 for e in second_half if e['state'].get('dominant_emotion') == 'positive')
            
            if second_positive > first_positive + 1:
                trend = 'improving'
            elif first_positive > second_positive + 1:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
        
        return {
            'trend': trend,
            'dominant_emotion': dominant_emotion,
            'emotion_distribution': emotion_counts
        }
    
    def analyze_style_evolution(self, style: Dict) -> Dict:
        """스타일 진화 분석"""
        if not style or 'adaptation_history' not in style:
            return {'evolution': 'stable', 'adaptations': 0}
        
        adaptations = style['adaptation_history']
        positive_adaptations = sum(1 for a in adaptations if a.get('adaptation_type') == 'positive')
        negative_adaptations = sum(1 for a in adaptations if a.get('adaptation_type') == 'negative')
        
        if positive_adaptations > negative_adaptations:
            evolution = 'improving'
        elif negative_adaptations > positive_adaptations:
            evolution = 'declining'
        else:
            evolution = 'stable'
        
        return {
            'evolution': evolution,
            'total_adaptations': len(adaptations),
            'positive_adaptations': positive_adaptations,
            'negative_adaptations': negative_adaptations,
            'current_style': {
                'tone': style.get('preferred_tone', '친근한'),
                'emoji': style.get('emoji_preference', '적당함'),
                'length': style.get('response_length', '중간'),
                'formality': style.get('formality_level', '비격식')
            }
        }
    
    def analyze_engagement_patterns(self, patterns: List[Dict]) -> Dict:
        """참여도 패턴 분석"""
        if not patterns:
            return {'overall_level': 'low', 'trend': 'stable'}
        
        engagement_levels = [p.get('engagement_level', {}).get('level', 'medium') for p in patterns]
        
        level_counts = {'high': 0, 'medium': 0, 'low': 0}
        for level in engagement_levels:
            level_counts[level] += 1
        
        overall_level = max(level_counts, key=level_counts.get)
        
        # 트렌드 분석
        if len(engagement_levels) >= 4:
            first_half = engagement_levels[:len(engagement_levels)//2]
            second_half = engagement_levels[len(engagement_levels)//2:]
            
            first_high = first_half.count('high')
            second_high = second_half.count('high')
            
            if second_high > first_high:
                trend = 'improving'
            elif first_high > second_high:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
        
        return {
            'overall_level': overall_level,
            'trend': trend,
            'level_distribution': level_counts
        }
    
    def calculate_learning_progress(self, user_id: str) -> Dict:
        """학습 진행도 계산"""
        patterns = self.conversation_patterns.get(user_id, [])
        effectiveness = self.response_effectiveness.get(user_id, [])
        
        if not patterns:
            return {'progress': 0, 'level': 'beginner'}
        
        # 진행도 계산 (0-100)
        total_conversations = len(patterns)
        avg_effectiveness = sum(e.get('score', 0) for e in effectiveness) / len(effectiveness) if effectiveness else 0.5
        
        # 대화 품질 점수
        quality_scores = []
        for pattern in patterns:
            score = 0
            score += pattern.get('topic_consistency', 0) * 0.3
            score += min(pattern.get('avg_length', 0) / 50, 1.0) * 0.2
            score += min(pattern.get('emoji_usage', 0) / 3, 1.0) * 0.1
            score += pattern.get('engagement_level', {}).get('level', 'medium') == 'high' and 0.4 or 0.2
            quality_scores.append(score)
        
        avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        
        # 종합 진행도
        progress = (total_conversations * 0.3 + avg_effectiveness * 0.4 + avg_quality * 0.3) * 100
        progress = min(progress, 100)
        
        # 레벨 결정
        if progress >= 80:
            level = 'expert'
        elif progress >= 60:
            level = 'advanced'
        elif progress >= 40:
            level = 'intermediate'
        elif progress >= 20:
            level = 'beginner'
        else:
            level = 'novice'
        
        return {
            'progress': round(progress, 1),
            'level': level,
            'total_conversations': total_conversations,
            'avg_effectiveness': round(avg_effectiveness, 2),
            'avg_quality': round(avg_quality, 2)
        }
    
    def calculate_response_time(self, messages: List[Dict]) -> float:
        """응답 시간 계산"""
        if len(messages) < 2:
            return 0.0
        
        total_time = 0
        count = 0
        
        for i in range(1, len(messages)):
            current_time = messages[i].get('timestamp', 0)
            prev_time = messages[i-1].get('timestamp', 0)
            
            if current_time and prev_time:
                time_diff = current_time - prev_time
                if 0 < time_diff < 3600:  # 1시간 이내만 유효
                    total_time += time_diff
                    count += 1
        
        return total_time / count if count > 0 else 0.0
    
    def analyze_topic_consistency(self, messages: List[Dict]) -> float:
        """주제 일관성 분석"""
        if len(messages) < 2:
            return 1.0
        
        # 간단한 키워드 기반 일관성 분석
        keywords = []
        for msg in messages:
            content = msg.get('content', '')
            words = content.split()
            keywords.extend([word for word in words if len(word) > 1])
        
        if not keywords:
            return 1.0
        
        # 중복 키워드 비율
        unique_keywords = set(keywords)
        consistency = len(unique_keywords) / len(keywords)
        
        return consistency
    
    def calculate_emotion_stability(self, messages: List[Dict]) -> float:
        """감정 안정성 계산"""
        if len(messages) < 3:
            return 1.0
        
        emotion_keywords = ['좋아', '행복', '슬퍼', '화나', '걱정']
        emotion_changes = 0
        
        for i in range(1, len(messages)):
            prev_content = messages[i-1].get('content', '').lower()
            curr_content = messages[i].get('content', '').lower()
            
            prev_emotions = sum(1 for keyword in emotion_keywords if keyword in prev_content)
            curr_emotions = sum(1 for keyword in emotion_keywords if keyword in curr_content)
            
            if abs(prev_emotions - curr_emotions) > 0:
                emotion_changes += 1
        
        stability = 1.0 - (emotion_changes / (len(messages) - 1))
        return max(0.0, min(1.0, stability))
    
    def calculate_style_consistency(self, messages: List[Dict]) -> float:
        """스타일 일관성 계산"""
        if len(messages) < 2:
            return 1.0
        
        style_indicators = ['습니다', '니다', '야', '너', '우리']
        style_changes = 0
        
        for i in range(1, len(messages)):
            prev_content = messages[i-1].get('content', '')
            curr_content = messages[i].get('content', '')
            
            prev_formal = any(indicator in prev_content for indicator in ['습니다', '니다'])
            curr_formal = any(indicator in curr_content for indicator in ['습니다', '니다'])
            
            if prev_formal != curr_formal:
                style_changes += 1
        
        consistency = 1.0 - (style_changes / (len(messages) - 1))
        return max(0.0, min(1.0, consistency))
    
    def record_feedback(self, message_id: str, feedback: str, context: dict) -> dict:
        """사용자 피드백 기록 및 학습 (기존 호환성 유지)"""
        try:
            feedback_entry = {
                "message_id": message_id,
                "feedback": feedback,  # positive, negative, neutral
                "context": context,
                "timestamp": datetime.now().isoformat(),
                "topic": context.get("topic", "unknown"),
                "style": context.get("style", "unknown"),
                "message_type": context.get("message_type", "unknown")
            }
            
            # 고도화된 학습 시스템에 통합
            user_id = context.get("user_id", "default")
            messages = context.get("messages", [])
            response = context.get("generated_content", "")
            
            self.learn_from_conversation(user_id, messages, response, {"positive": feedback == "positive", "negative": feedback == "negative"})
            
            return {
                "success": True,
                "message": "피드백이 고도화된 학습 시스템에 반영되었습니다",
                "learning_updates": self.get_advanced_learning_insights(user_id)
            }
            
        except Exception as e:
            logger.error(f"피드백 처리 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def get_adaptive_suggestions(self, topic: str, message_type: str, style: str) -> dict:
        """학습된 패턴 기반 개선 제안 (기존 호환성 유지)"""
        suggestions = {
            "recommended_responses": [],
            "avoid_patterns": [],
            "style_adjustments": {},
            "confidence_boost": 0.0
        }
        
        # 모든 사용자의 패턴을 종합하여 제안
        all_patterns = []
        for user_patterns in self.conversation_patterns.values():
            all_patterns.extend(user_patterns)
        
        if all_patterns:
            # 성공률이 높은 패턴 추출
            successful_patterns = [p for p in all_patterns if p.get('engagement_level', {}).get('level') == 'high']
            if successful_patterns:
                suggestions["confidence_boost"] = 0.1
        
        return suggestions

# 전역 학습 시스템 인스턴스
learning_system = AdvancedRealTimeLearningSystem()

# 피드백 수집 엔드포인트
@app.post("/api/v7/submit-feedback")
async def submit_feedback(request: dict):
    """사용자 피드백 수집 및 학습"""
    try:
        message_id = request.get("message_id")
        feedback = request.get("feedback")  # positive, negative, neutral
        context = request.get("context", {})
        
        if not message_id or not feedback:
            return {
                "success": False,
                "error": "message_id와 feedback은 필수입니다"
            }
        
        # 학습 시스템에 피드백 전달
        result = learning_system.record_feedback(message_id, feedback, context)
        
        return result
        
    except Exception as e:
        logger.error(f"피드백 제출 오류: {e}")
        return {
            "success": False,
            "error": f"피드백 처리 실패: {str(e)}"
        }

# 학습 현황 조회 엔드포인트
@app.get("/api/v7/learning-status")
async def get_learning_status():
    """학습 시스템 현황 조회"""
    try:
        return {
            "success": True,
            "learning_summary": learning_system._get_learning_summary(),
            "top_patterns": {
                pattern_key: {
                    "success_rate": pattern["success_rate"],
                    "total_count": pattern["total_count"]
                }
                for pattern_key, pattern in sorted(
                    learning_system.conversation_patterns.items(),
                    key=lambda x: x[1]["success_rate"],
                    reverse=True
                )[:10]
            },
            "style_preferences": learning_system.style_adaptations
        }
        
    except Exception as e:
        logger.error(f"학습 현황 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# 고도화된 학습 시스템 API 엔드포인트들
@app.post("/api/v7/advanced-learning/analyze-emotion")
async def analyze_emotion_advanced(request: dict):
    """고도화된 감정 분석"""
    try:
        user_id = request.get('user_id', 'default')
        messages = request.get('messages', [])
        
        if not messages:
            return {"success": False, "error": "메시지가 없습니다."}
        
        # 감정 상태 추적
        learning_system.track_emotional_state(user_id, messages)
        
        # 감정 분석 결과
        emotional_flow = learning_system.analyze_emotional_flow(messages)
        emotions = learning_system.emotion_tracking.get(user_id, [])
        emotional_trends = learning_system.analyze_emotional_trends(emotions)
        
        return {
            "success": True,
            "emotional_flow": emotional_flow,
            "emotional_trends": emotional_trends,
            "tracking_history": len(emotions),
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"고도화된 감정 분석 오류: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/v7/advanced-learning/analyze-style")
async def analyze_style_evolution(request: dict):
    """스타일 진화 분석"""
    try:
        user_id = request.get('user_id', 'default')
        messages = request.get('messages', [])
        
        if not messages:
            return {"success": False, "error": "메시지가 없습니다."}
        
        # 스타일 분석
        communication_style = learning_system.analyze_communication_style(messages)
        style_evolution = learning_system.analyze_style_evolution(
            learning_system.style_adaptation.get(user_id, {})
        )
        
        return {
            "success": True,
            "current_style": communication_style,
            "style_evolution": style_evolution,
            "adaptation_history": len(learning_system.style_adaptation.get(user_id, {}).get('adaptation_history', [])),
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"스타일 진화 분석 오류: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/v7/advanced-learning/progress/{user_id}")
async def get_learning_progress(user_id: str):
    """학습 진행도 조회"""
    try:
        insights = learning_system.get_advanced_learning_insights(user_id)
        
        if not insights:
            return {
                "success": True,
                "progress": {
                    "level": "beginner",
                    "progress": 0,
                    "total_conversations": 0,
                    "avg_effectiveness": 0,
                    "avg_quality": 0
                },
                "message": "아직 학습 데이터가 없습니다."
            }
        
        return {
            "success": True,
            "progress": insights.get('learning_progress', {}),
            "emotional_trends": insights.get('emotional_trends', {}),
            "style_evolution": insights.get('style_evolution', {}),
            "engagement_patterns": insights.get('engagement_patterns', {}),
            "context_retention": insights.get('context_retention', 0),
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"학습 진행도 조회 오류: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/v7/advanced-learning/adapt-style")
async def adapt_communication_style_api(request: dict):
    """실시간 스타일 적응"""
    try:
        user_id = request.get('user_id', 'default')
        messages = request.get('messages', [])
        response = request.get('response', '')
        feedback = request.get('feedback', {})
        
        if not messages:
            return {"success": False, "error": "메시지가 없습니다."}
        
        # 스타일 적응 학습
        learning_system.adapt_communication_style(user_id, messages, response, feedback)
        
        # 현재 적응된 스타일 정보
        current_style = learning_system.style_adaptation.get(user_id, {})
        
        return {
            "success": True,
            "adapted_style": {
                "preferred_tone": current_style.get('preferred_tone', '친근한'),
                "emoji_preference": current_style.get('emoji_preference', '적당함'),
                "response_length": current_style.get('response_length', '중간'),
                "formality_level": current_style.get('formality_level', '비격식')
            },
            "adaptation_count": len(current_style.get('adaptation_history', [])),
            "adaptation_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"스타일 적응 오류: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/v7/advanced-learning/context-memory")
async def update_context_memory_api(request: dict):
    """컨텍스트 메모리 업데이트"""
    try:
        user_id = request.get('user_id', 'default')
        messages = request.get('messages', [])
        
        if not messages:
            return {"success": False, "error": "메시지가 없습니다."}
        
        # 컨텍스트 메모리 업데이트
        learning_system.update_context_memory(user_id, messages)
        
        # 메모리 상태 조회
        context_memory = learning_system.context_memory.get(user_id, [])
        
        return {
            "success": True,
            "memory_count": len(context_memory),
            "recent_contexts": context_memory[-5:] if context_memory else [],
            "memory_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"컨텍스트 메모리 업데이트 오류: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/v7/advanced-learning/evaluate-response")
async def evaluate_response_effectiveness_api(request: dict):
    """응답 효과성 평가"""
    try:
        user_id = request.get('user_id', 'default')
        response = request.get('response', '')
        feedback = request.get('feedback', {})
        
        if not response:
            return {"success": False, "error": "응답이 없습니다."}
        
        # 응답 효과성 평가
        learning_system.evaluate_advanced_response_effectiveness(user_id, response, feedback)
        
        # 평가 결과 조회
        effectiveness = learning_system.response_effectiveness.get(user_id, [])
        recent_evaluations = effectiveness[-5:] if effectiveness else []
        
        avg_effectiveness = sum(e.get('score', 0) for e in effectiveness) / len(effectiveness) if effectiveness else 0
        
        return {
            "success": True,
            "avg_effectiveness": round(avg_effectiveness, 2),
            "total_evaluations": len(effectiveness),
            "recent_evaluations": recent_evaluations,
            "evaluation_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"응답 효과성 평가 오류: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/v7/advanced-learning/comprehensive-analysis")
async def comprehensive_learning_analysis(request: dict):
    """종합 학습 분석"""
    try:
        user_id = request.get('user_id', 'default')
        messages = request.get('messages', [])
        response = request.get('response', '')
        feedback = request.get('feedback', {})
        
        if not messages:
            return {"success": False, "error": "메시지가 없습니다."}
        
        # 종합 학습 실행
        learning_system.learn_from_conversation(user_id, messages, response, feedback)
        
        # 종합 분석 결과
        insights = learning_system.get_advanced_learning_insights(user_id)
        
        return {
            "success": True,
            "comprehensive_analysis": {
                "learning_progress": insights.get('learning_progress', {}),
                "emotional_trends": insights.get('emotional_trends', {}),
                "style_evolution": insights.get('style_evolution', {}),
                "engagement_patterns": insights.get('engagement_patterns', {}),
                "context_retention": insights.get('context_retention', 0),
                "total_conversations": insights.get('total_conversations', 0),
                "avg_effectiveness": insights.get('response_effectiveness', 0)
            },
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"종합 학습 분석 오류: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/v7/advanced-learning/suggestions/{user_id}")
async def get_adaptive_suggestions(user_id: str, topic: str = "general", message_type: str = "conversation", style: str = "friendly"):
    """적응형 제안 조회"""
    try:
        suggestions = learning_system.get_adaptive_suggestions(topic, message_type, style)
        insights = learning_system.get_advanced_learning_insights(user_id)
        
        return {
            "success": True,
            "suggestions": suggestions,
            "user_insights": {
                "progress": insights.get('learning_progress', {}),
                "style": insights.get('style_evolution', {}),
                "engagement": insights.get('engagement_patterns', {})
            },
            "suggestion_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"적응형 제안 조회 오류: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/v7/advanced-learning/real-time-adaptation")
async def real_time_adaptation(request: dict):
    """실시간 적응 시스템"""
    try:
        user_id = request.get('user_id', 'default')
        messages = request.get('messages', [])
        current_response = request.get('current_response', '')
        target_message = request.get('target_message', '')
        
        if not messages or not target_message:
            return {"success": False, "error": "필수 데이터가 없습니다."}
        
        # 실시간 분석
        pattern = learning_system.analyze_advanced_conversation_pattern(messages)
        emotional_state = learning_system.analyze_emotional_flow(messages)
        communication_style = learning_system.analyze_communication_style(messages)
        
        # 적응 제안 생성
        style = learning_system.style_adaptation.get(user_id, {})
        current_style = {
            'tone': style.get('preferred_tone', '친근한'),
            'emoji': style.get('emoji_preference', '적당함'),
            'length': style.get('response_length', '중간'),
            'formality': style.get('formality_level', '비격식')
        }
        
        # 실시간 조정 제안
        adaptation_suggestions = {
            "tone_adjustment": "maintain" if emotional_state['dominant_emotion'] == 'positive' else "empathize",
            "emoji_adjustment": "increase" if emotional_state['dominant_emotion'] == 'positive' else "decrease",
            "length_adjustment": "maintain" if pattern.get('engagement_level', {}).get('level') == 'high' else "increase",
            "style_adjustment": "maintain" if communication_style['dominant_style'] == 'empathetic' else "adapt"
        }
        
        return {
            "success": True,
            "real_time_analysis": {
                "pattern": pattern,
                "emotional_state": emotional_state,
                "communication_style": communication_style
            },
            "current_style": current_style,
            "adaptation_suggestions": adaptation_suggestions,
            "adaptation_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"실시간 적응 오류: {e}")
        return {"success": False, "error": str(e)}

# 다중 메시지 일괄 생성 엔드포인트
@app.post("/api/v7/generate-batch-messages")
async def generate_batch_messages(request: dict):
    """다중 메시지 일괄 생성"""
    try:
        target_messages = request.get("target_messages", [])
        context_messages = request.get("context_messages", [])
        settings = request.get("settings", {})
        batch_size = min(len(target_messages), 10)  # 최대 10개까지
        
        if not target_messages:
            return {
                "success": False,
                "error": "target_messages가 필요합니다"
            }
        
        results = []
        
        for i, target_message in enumerate(target_messages[:batch_size]):
            try:
                # 각 메시지에 대해 생성
                result = await generate_gpt_message(target_message, context_messages, settings)
                
                results.append({
                    "index": i,
                    "target_message": target_message,
                    "generated_message": result.get("content", ""),
                    "analysis": result.get("analysis", {}),
                    "message_id": result.get("message_id", ""),
                    "success": result.get("success", False)
                })
                
                # 생성된 메시지를 다음 컨텍스트에 추가 (연속성 유지)
                if result.get("success"):
                    context_messages.append({
                        "sender": "AI",
                        "content": result.get("content", ""),
                        "timestamp": datetime.now().isoformat()
                    })
                
            except Exception as e:
                results.append({
                    "index": i,
                    "target_message": target_message,
                    "error": str(e),
                    "success": False
                })
        
        success_count = sum(1 for r in results if r.get("success", False))
        
        return {
            "success": True,
            "batch_results": results,
            "summary": {
                "total_requested": len(target_messages),
                "total_processed": len(results),
                "success_count": success_count,
                "failure_count": len(results) - success_count,
                "generation_time": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"일괄 메시지 생성 오류: {e}")
        return {
            "success": False,
            "error": f"일괄 생성 실패: {str(e)}"
        }

# 개인별 대화 스타일 프로필 생성
@app.post("/api/v7/create-style-profile")
async def create_style_profile(request: dict):
    """개인별 대화 스타일 프로필 생성"""
    try:
        user_id = request.get("user_id")
        conversation_samples = request.get("conversation_samples", [])
        
        if not user_id or not conversation_samples:
            return {
                "success": False,
                "error": "user_id와 conversation_samples가 필요합니다"
            }
        
        # 대화 샘플 분석
        style_analyzer = AdvancedKakaoMessageGenerator()
        
        style_profile = {
            "user_id": user_id,
            "analysis_date": datetime.now().isoformat(),
            "message_characteristics": {
                "avg_length": 0,
                "casual_rate": 0.0,
                "emoji_usage": 0.0,
                "question_frequency": 0.0,
                "formality_level": "casual",
                "dominant_topics": [],
                "preferred_expressions": []
            },
            "conversation_patterns": {
                "response_speed": "medium",
                "engagement_level": "active",
                "preferred_message_types": [],
                "interaction_style": "collaborative"
            },
            "sample_count": len(conversation_samples)
        }
        
        # 메시지 특성 분석
        total_length = 0
        casual_count = 0
        emoji_count = 0
        question_count = 0
        topic_counts = {}
        expressions = {}
        
        for sample in conversation_samples:
            content = sample.get("content", "")
            total_length += len(content)
            
            # 캐주얼 표현 감지
            casual_indicators = ["ㅎ", "ㅋ", "~", ";;", "ㅠ"]
            if any(indicator in content for indicator in casual_indicators):
                casual_count += 1
            
            # 이모지 사용
            emoji_indicators = ["😊", "👍", "😢", "😅", "🎉", "💪"]
            if any(emoji in content for emoji in emoji_indicators):
                emoji_count += 1
            
            # 질문 빈도
            if "?" in content or any(q in content for q in ["궁금", "어떻게", "왜"]):
                question_count += 1
            
            # 주제 분석
            context_info = style_analyzer.analyze_conversation_context(content, [])
            topic = context_info.get("topic", "일반_대화")
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        # 통계 계산
        sample_count = len(conversation_samples)
        if sample_count > 0:
            style_profile["message_characteristics"].update({
                "avg_length": total_length / sample_count,
                "casual_rate": casual_count / sample_count,
                "emoji_usage": emoji_count / sample_count,
                "question_frequency": question_count / sample_count,
                "dominant_topics": sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:3]
            })
        
        # 격식성 수준 판단
        if style_profile["message_characteristics"]["casual_rate"] > 0.7:
            style_profile["message_characteristics"]["formality_level"] = "very_casual"
        elif style_profile["message_characteristics"]["casual_rate"] > 0.3:
            style_profile["message_characteristics"]["formality_level"] = "casual"
        else:
            style_profile["message_characteristics"]["formality_level"] = "formal"
        
        return {
            "success": True,
            "style_profile": style_profile,
            "recommendations": {
                "suggested_tone": "캐주얼" if style_profile["message_characteristics"]["casual_rate"] > 0.5 else "전문적인",
                "emoji_recommendation": "적극 사용" if style_profile["message_characteristics"]["emoji_usage"] > 0.3 else "제한적 사용",
                "response_style": "질문형" if style_profile["message_characteristics"]["question_frequency"] > 0.4 else "서술형"
            }
        }
        
    except Exception as e:
        logger.error(f"스타일 프로필 생성 오류: {e}")
        return {
            "success": False,
            "error": f"프로필 생성 실패: {str(e)}"
        }

# 프로젝트 기반 지식 관리 시스템
class ProjectKnowledgeManager:
    def __init__(self):
        self.projects = {}
        self.knowledge_base = {}
        self.guidelines = {}
        self.marketing_assets = {}
        
    def create_project(self, project_data: dict) -> dict:
        """새 프로젝트 생성"""
        try:
            project_id = project_data.get("project_id") or str(uuid.uuid4())
            
            project = {
                "id": project_id,
                "name": project_data.get("name", "새 프로젝트"),
                "description": project_data.get("description", ""),
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "owner": project_data.get("owner", "system"),
                "status": "active",
                
                # 대화방 관리
                "chat_rooms": {},
                
                # 지식 베이스
                "knowledge_documents": {
                    "홍보물": [],
                    "제안서": [],
                    "도급계약서": [],
                    "기술문서": [],
                    "법무자료": [],
                    "기타문서": []
                },
                
                # 가이드라인 및 전략
                "guidelines": {
                    "브랜딩_가이드": "",
                    "커뮤니케이션_톤": "",
                    "마케팅_전략": "",
                    "법적_고려사항": "",
                    "리스크_관리": ""
                },
                
                # 셀링포인트 및 논리구조
                "selling_points": {
                    "핵심_가치제안": [],
                    "경쟁우위": [],
                    "고객_혜택": [],
                    "차별화_요소": [],
                    "성공_사례": []
                },
                
                # 마케팅 통일성
                "marketing_consistency": {
                    "핵심_메시지": "",
                    "브랜드_보이스": "",
                    "타겟_고객": "",
                    "포지셔닝": "",
                    "가치_명제": ""
                },
                
                # 설정 및 메타데이터
                "settings": {
                    "auto_extract_knowledge": True,
                    "maintain_consistency": True,
                    "suggest_improvements": True,
                    "track_performance": True
                },
                
                "statistics": {
                    "total_chats": 0,
                    "total_documents": 0,
                    "total_messages": 0,
                    "knowledge_score": 0.0
                }
            }
            
            self.projects[project_id] = project
            
            return {
                "success": True,
                "project": project,
                "message": f"프로젝트 '{project['name']}'가 성공적으로 생성되었습니다"
            }
            
        except Exception as e:
            logger.error(f"프로젝트 생성 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def add_chat_room(self, project_id: str, chat_data: dict) -> dict:
        """프로젝트에 대화방 추가"""
        try:
            if project_id not in self.projects:
                return {"success": False, "error": "프로젝트를 찾을 수 없습니다"}
            
            project = self.projects[project_id]
            chat_room_id = chat_data.get("chat_room_id") or str(uuid.uuid4())
            
            chat_room = {
                "id": chat_room_id,
                "name": chat_data.get("name", "새 대화방"),
                "description": chat_data.get("description", ""),
                "file_path": chat_data.get("file_path", ""),
                "participants": chat_data.get("participants", []),
                "total_messages": chat_data.get("total_messages", 0),
                "date_range": chat_data.get("date_range", {}),
                "topics": chat_data.get("topics", []),
                "key_insights": [],
                "extracted_knowledge": {},
                "created_at": datetime.now().isoformat(),
                "status": "active"
            }
            
            project["chat_rooms"][chat_room_id] = chat_room
            project["statistics"]["total_chats"] += 1
            project["updated_at"] = datetime.now().isoformat()
            
            # 자동 지식 추출
            if project["settings"]["auto_extract_knowledge"]:
                self._extract_knowledge_from_chat(project_id, chat_room_id, chat_data)
            
            return {
                "success": True,
                "chat_room": chat_room,
                "message": "대화방이 프로젝트에 추가되었습니다"
            }
            
        except Exception as e:
            logger.error(f"대화방 추가 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def add_knowledge_document(self, project_id: str, doc_data: dict) -> dict:
        """지식 문서 추가"""
        try:
            if project_id not in self.projects:
                return {"success": False, "error": "프로젝트를 찾을 수 없습니다"}
            
            project = self.projects[project_id]
            doc_id = str(uuid.uuid4())
            
            document = {
                "id": doc_id,
                "title": doc_data.get("title", "새 문서"),
                "category": doc_data.get("category", "기타문서"),
                "content": doc_data.get("content", ""),
                "file_path": doc_data.get("file_path", ""),
                "summary": doc_data.get("summary", ""),
                "key_points": doc_data.get("key_points", []),
                "tags": doc_data.get("tags", []),
                "relevance_score": 0.0,
                "usage_count": 0,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            # 카테고리별 분류
            category = document["category"]
            if category not in project["knowledge_documents"]:
                project["knowledge_documents"][category] = []
            
            project["knowledge_documents"][category].append(document)
            project["statistics"]["total_documents"] += 1
            project["updated_at"] = datetime.now().isoformat()
            
            # 자동 요약 및 키포인트 추출
            self._analyze_document(project_id, doc_id, document)
            
            return {
                "success": True,
                "document": document,
                "message": f"{category}에 문서가 추가되었습니다"
            }
            
        except Exception as e:
            logger.error(f"문서 추가 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def update_guidelines(self, project_id: str, guidelines: dict) -> dict:
        """프로젝트 가이드라인 업데이트"""
        try:
            if project_id not in self.projects:
                return {"success": False, "error": "프로젝트를 찾을 수 없습니다"}
            
            project = self.projects[project_id]
            
            # 가이드라인 업데이트
            for key, value in guidelines.items():
                if key in project["guidelines"]:
                    project["guidelines"][key] = value
            
            project["updated_at"] = datetime.now().isoformat()
            
            return {
                "success": True,
                "guidelines": project["guidelines"],
                "message": "가이드라인이 업데이트되었습니다"
            }
            
        except Exception as e:
            logger.error(f"가이드라인 업데이트 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def update_selling_points(self, project_id: str, selling_points: dict) -> dict:
        """셀링포인트 업데이트"""
        try:
            if project_id not in self.projects:
                return {"success": False, "error": "프로젝트를 찾을 수 없습니다"}
            
            project = self.projects[project_id]
            
            # 셀링포인트 업데이트
            for key, value in selling_points.items():
                if key in project["selling_points"]:
                    project["selling_points"][key] = value
            
            project["updated_at"] = datetime.now().isoformat()
            
            return {
                "success": True,
                "selling_points": project["selling_points"],
                "message": "셀링포인트가 업데이트되었습니다"
            }
            
        except Exception as e:
            logger.error(f"셀링포인트 업데이트 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def generate_context_aware_message(self, project_id: str, query: str, context: dict = None) -> dict:
        """프로젝트 지식을 활용한 맥락 인식 메시지 생성"""
        try:
            if project_id not in self.projects:
                return {"success": False, "error": "프로젝트를 찾을 수 없습니다"}
            
            project = self.projects[project_id]
            
            # 관련 지식 검색
            relevant_knowledge = self._search_relevant_knowledge(project, query)
            
            # 가이드라인 적용
            applicable_guidelines = self._get_applicable_guidelines(project, query)
            
            # 셀링포인트 적용
            relevant_selling_points = self._get_relevant_selling_points(project, query)
            
            # 마케팅 일관성 확인
            consistency_check = self._check_marketing_consistency(project, query)
            
            # 통합 프롬프트 생성
            enhanced_prompt = self._create_enhanced_prompt(
                query, relevant_knowledge, applicable_guidelines, 
                relevant_selling_points, consistency_check
            )
            
            # 메시지 생성 (기존 시스템 활용)
            result = {
                "query": query,
                "project_context": {
                    "project_name": project["name"],
                    "relevant_documents": len(relevant_knowledge),
                    "applied_guidelines": len(applicable_guidelines),
                    "selling_points_used": len(relevant_selling_points),
                    "consistency_score": consistency_check["score"]
                },
                "enhanced_content": enhanced_prompt,
                "recommendations": self._generate_recommendations(project, query),
                "generated_at": datetime.now().isoformat()
            }
            
            return {
                "success": True,
                "result": result,
                "message": "프로젝트 지식을 활용한 메시지가 생성되었습니다"
            }
            
        except Exception as e:
            logger.error(f"맥락 인식 메시지 생성 오류: {e}")
            return {"success": False, "error": str(e)}
    
    def _extract_knowledge_from_chat(self, project_id: str, chat_room_id: str, chat_data: dict):
        """대화에서 자동 지식 추출"""
        # 간단한 키워드 기반 지식 추출 (실제로는 더 정교한 NLP 사용)
        keywords = {
            "부동산": ["아파트", "시세", "매매", "전세", "분양"],
            "계약": ["계약서", "조건", "합의", "서명"],
            "마케팅": ["홍보", "광고", "브랜딩", "고객"],
            "기술": ["설계", "시공", "품질", "안전"]
        }
        
        # 추출된 인사이트 저장
        extracted = {
            "topics": [],
            "key_phrases": [],
            "action_items": [],
            "decisions": []
        }
        
        self.projects[project_id]["chat_rooms"][chat_room_id]["extracted_knowledge"] = extracted
    
    def _analyze_document(self, project_id: str, doc_id: str, document: dict):
        """문서 자동 분석"""
        # 문서 내용 기반 요약 및 키포인트 추출
        content = document.get("content", "")
        
        # 간단한 분석 (실제로는 더 정교한 NLP 사용)
        if len(content) > 100:
            document["summary"] = content[:200] + "..."
            document["key_points"] = [
                "주요 내용 1",
                "주요 내용 2",
                "주요 내용 3"
            ]
    
    def _search_relevant_knowledge(self, project: dict, query: str) -> list:
        """관련 지식 검색"""
        relevant = []
        
        # 문서에서 관련 내용 검색
        for category, documents in project["knowledge_documents"].items():
            for doc in documents:
                if any(keyword in query.lower() for keyword in doc.get("tags", [])):
                    relevant.append({
                        "type": "document",
                        "category": category,
                        "title": doc["title"],
                        "content": doc.get("summary", doc.get("content", ""))[:300]
                    })
        
        return relevant[:5]  # 최대 5개
    
    def _get_applicable_guidelines(self, project: dict, query: str) -> list:
        """적용 가능한 가이드라인 추출"""
        guidelines = []
        
        for key, value in project["guidelines"].items():
            if value and len(value) > 10:  # 빈 가이드라인 제외
                guidelines.append({
                    "type": key,
                    "content": value
                })
        
        return guidelines
    
    def _get_relevant_selling_points(self, project: dict, query: str) -> list:
        """관련 셀링포인트 추출"""
        selling_points = []
        
        for key, points in project["selling_points"].items():
            if isinstance(points, list) and points:
                selling_points.extend([{
                    "category": key,
                    "point": point
                } for point in points])
        
        return selling_points[:3]  # 최대 3개
    
    def _check_marketing_consistency(self, project: dict, query: str) -> dict:
        """마케팅 일관성 확인"""
        consistency = project["marketing_consistency"]
        
        score = 0.8  # 기본 점수
        
        return {
            "score": score,
            "core_message": consistency.get("핵심_메시지", ""),
            "brand_voice": consistency.get("브랜드_보이스", ""),
            "positioning": consistency.get("포지셔닝", "")
        }
    
    def _create_enhanced_prompt(self, query: str, knowledge: list, guidelines: list, 
                               selling_points: list, consistency: dict) -> str:
        """통합 프롬프트 생성"""
        prompt_parts = [
            f"사용자 질문: {query}",
            "",
            "=== 프로젝트 지식 베이스 ===",
        ]
        
        if knowledge:
            prompt_parts.append("관련 문서:")
            for k in knowledge:
                prompt_parts.append(f"- {k['title']}: {k['content'][:100]}...")
            prompt_parts.append("")
        
        if guidelines:
            prompt_parts.append("적용 가이드라인:")
            for g in guidelines:
                prompt_parts.append(f"- {g['type']}: {g['content'][:100]}...")
            prompt_parts.append("")
        
        if selling_points:
            prompt_parts.append("핵심 셀링포인트:")
            for sp in selling_points:
                prompt_parts.append(f"- {sp['category']}: {sp['point']}")
            prompt_parts.append("")
        
        if consistency["core_message"]:
            prompt_parts.append(f"브랜드 메시지: {consistency['core_message']}")
            prompt_parts.append(f"브랜드 보이스: {consistency['brand_voice']}")
            prompt_parts.append("")
        
        prompt_parts.append("위 정보를 바탕으로 일관성 있고 전문적인 응답을 생성해주세요.")
        
        return "\n".join(prompt_parts)
    
    def _generate_recommendations(self, project: dict, query: str) -> list:
        """개선 추천사항 생성"""
        recommendations = []
        
        # 문서 부족 확인
        if project["statistics"]["total_documents"] < 5:
            recommendations.append("더 많은 참고 문서를 추가하면 응답 품질이 향상됩니다")
        
        # 가이드라인 부족 확인
        empty_guidelines = [k for k, v in project["guidelines"].items() if not v]
        if empty_guidelines:
            recommendations.append(f"다음 가이드라인을 설정하면 더 일관된 응답이 가능합니다: {', '.join(empty_guidelines)}")
        
        # 셀링포인트 부족 확인
        empty_selling_points = [k for k, v in project["selling_points"].items() if not v]
        if empty_selling_points:
            recommendations.append("셀링포인트를 더 구체적으로 설정하면 마케팅 효과가 향상됩니다")
        
        return recommendations

# 전역 프로젝트 매니저 인스턴스
project_manager = ProjectKnowledgeManager()

# 프로젝트 관리 API 엔드포인트들

@app.post("/api/v7/projects/create")
async def create_project(request: dict):
    """새 프로젝트 생성"""
    try:
        result = project_manager.create_project(request)
        return result
    except Exception as e:
        logger.error(f"프로젝트 생성 API 오류: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/v7/projects")
async def list_projects():
    """프로젝트 목록 조회"""
    try:
        projects = []
        for project_id, project in project_manager.projects.items():
            projects.append({
                "id": project["id"],
                "name": project["name"],
                "description": project["description"],
                "status": project["status"],
                "statistics": project["statistics"],
                "created_at": project["created_at"],
                "updated_at": project["updated_at"]
            })
        
        return {
            "success": True,
            "projects": projects,
            "total_count": len(projects)
        }
    except Exception as e:
        logger.error(f"프로젝트 목록 조회 오류: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/v7/projects/{project_id}")
async def get_project(project_id: str):
    """특정 프로젝트 상세 조회"""
    try:
        if project_id not in project_manager.projects:
            return {"success": False, "error": "프로젝트를 찾을 수 없습니다"}
        
        project = project_manager.projects[project_id]
        return {
            "success": True,
            "project": project
        }
    except Exception as e:
        logger.error(f"프로젝트 조회 오류: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/v7/projects/{project_id}/chat-rooms")
async def add_chat_room_to_project(project_id: str, request: dict):
    """프로젝트에 대화방 추가"""
    try:
        result = project_manager.add_chat_room(project_id, request)
        return result
    except Exception as e:
        logger.error(f"대화방 추가 오류: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/v7/projects/{project_id}/documents")
async def add_document_to_project(project_id: str, request: dict):
    """프로젝트에 문서 추가"""
    try:
        result = project_manager.add_document(project_id, request)
        return result
    except Exception as e:
        logger.error(f"문서 추가 오류: {e}")
        return {"success": False, "error": str(e)}

# 샘플 프로젝트 특화 분석 API 엔드포인트들

@app.get("/api/v7/gaeposung/analysis/{room_id}")
async def get_gaeposung_analysis(room_id: str):
    """샘플 프로젝트 프로젝트 분석"""
    try:
        analysis_result = gaeposung_analyzer.analyze_project(room_id)
        return {
            "success": True,
            "analysis": analysis_result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"샘플 프로젝트 분석 오류: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/v7/gaeposung/sentiment/{room_id}")
async def get_gaeposung_sentiment(room_id: str):
    """샘플 프로젝트 감정 분석"""
    try:
        analysis_result = gaeposung_analyzer.analyze_project(room_id)
        return {
            "success": True,
            "sentiment": analysis_result.get("sentimentAnalysis", {}),
            "specialized": analysis_result.get("specializedAnalysis", {}),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"샘플 프로젝트 감정 분석 오류: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/v7/gaeposung/speakers/{room_id}")
async def get_gaeposung_speakers(room_id: str):
    """샘플 프로젝트 주요 발언자 분석"""
    try:
        analysis_result = gaeposung_analyzer.analyze_project(room_id)
        return {
            "success": True,
            "speakers": analysis_result.get("topSpeakers", []),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"샘플 프로젝트 발언자 분석 오류: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/v7/gaeposung/topics/{room_id}")
async def get_gaeposung_topics(room_id: str):
    """샘플 프로젝트 주요 주제 분석"""
    try:
        analysis_result = gaeposung_analyzer.analyze_project(room_id)
        return {
            "success": True,
            "topics": analysis_result.get("keyTopics", []),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"샘플 프로젝트 주제 분석 오류: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/v7/gaeposung/timeline/{room_id}")
async def get_gaeposung_timeline(room_id: str):
    """샘플 프로젝트 타임라인 분석"""
    try:
        analysis_result = gaeposung_analyzer.analyze_project(room_id)
        return {
            "success": True,
            "timeline": analysis_result.get("timeline", []),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"샘플 프로젝트 타임라인 분석 오류: {e}")
        return {"success": False, "error": str(e)}

# 샘플 프로젝트 프로젝트 관리 API 엔드포인트들

@app.get("/api/v7/gaeposung/project/overview/{room_id}")
async def get_project_overview(room_id: str):
    """프로젝트 개요 조회"""
    try:
        overview = gaeposung_project_api.get_project_overview(room_id)
        return {
            "success": True,
            "overview": overview,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"프로젝트 개요 조회 오류: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/v7/gaeposung/project/tasks/{room_id}")
async def get_project_tasks(room_id: str):
    """프로젝트 작업 목록 조회"""
    try:
        tasks = gaeposung_project_api.get_tasks_by_room(room_id)
        return {
            "success": True,
            "tasks": tasks,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"프로젝트 작업 조회 오류: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/v7/gaeposung/project/tasks/{room_id}")
async def create_project_task(room_id: str, task_data: dict):
    """새 프로젝트 작업 생성"""
    try:
        task = gaeposung_project_api.create_task(room_id, task_data)
        return {
            "success": True,
            "task": task,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"프로젝트 작업 생성 오류: {e}")
        return {"success": False, "error": str(e)}

@app.put("/api/v7/gaeposung/project/tasks/{task_id}")
async def update_project_task(task_id: str, task_data: dict):
    """프로젝트 작업 업데이트"""
    try:
        task = gaeposung_project_api.update_task(task_id, task_data)
        return {
            "success": True,
            "task": task,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"프로젝트 작업 업데이트 오류: {e}")
        return {"success": False, "error": str(e)}

@app.delete("/api/v7/gaeposung/project/tasks/{task_id}")
async def delete_project_task(task_id: str):
    """프로젝트 작업 삭제"""
    try:
        deleted = gaeposung_project_api.delete_task(task_id)
        return {
            "success": deleted,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"프로젝트 작업 삭제 오류: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/v7/gaeposung/project/milestones/{room_id}")
async def get_project_milestones(room_id: str):
    """프로젝트 마일스톤 목록 조회"""
    try:
        milestones = gaeposung_project_api.get_milestones_by_room(room_id)
        return {
            "success": True,
            "milestones": milestones,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"프로젝트 마일스톤 조회 오류: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/v7/gaeposung/project/milestones/{room_id}")
async def create_project_milestone(room_id: str, milestone_data: dict):
    """새 프로젝트 마일스톤 생성"""
    try:
        milestone = gaeposung_project_api.create_milestone(room_id, milestone_data)
        return {
            "success": True,
            "milestone": milestone,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"프로젝트 마일스톤 생성 오류: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/v7/gaeposung/project/recommendations/{room_id}")
async def get_project_recommendations(room_id: str):
    """AI 추천 목록 조회"""
    try:
        recommendations = gaeposung_project_api.get_recommendations_by_room(room_id)
        return {
            "success": True,
            "recommendations": recommendations,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"AI 추천 조회 오류: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/v7/gaeposung/project/recommendations/{room_id}/generate")
async def generate_project_recommendations(room_id: str):
    """AI 추천 생성"""
    try:
        recommendations = gaeposung_project_api.generate_ai_recommendations(room_id)
        return {
            "success": True,
            "recommendations": recommendations,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"AI 추천 생성 오류: {e}")
        return {"success": False, "error": str(e)}

@app.put("/api/v7/gaeposung/project/recommendations/{recommendation_id}/status")
async def update_recommendation_status(recommendation_id: str, status: str):
    """AI 추천 상태 업데이트"""
    try:
        recommendation = gaeposung_project_api.update_recommendation_status(recommendation_id, status)
        return {
            "success": True,
            "recommendation": recommendation,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"AI 추천 상태 업데이트 오류: {e}")
        return {"success": False, "error": str(e)}

# 메시지 생성 API
@app.post("/api/v7/generate-message")
async def generate_message(request: dict):
    """대화 내용에 대응하는 메시지 생성"""
    try:
        from message_generator import message_generator
        
        context = request.get("context", "")
        room_id = request.get("room_id", "")
        style = request.get("style", "professional")
        
        # 메시지 생성
        messages = message_generator.generate_response(context, room_id, style)
        
        return {
            "success": True,
            "messages": messages,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"메시지 생성 오류: {e}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    try:
        import uvicorn

        _bk = int(
            os.environ.get(
                "ADVANCED_API_BACKUP_PORT", os.environ.get("PORT", "8000")
            )
        )
        print("🚀 고급 API 서버 시작 중...")
        print(f"📍 서버 주소: http://localhost:{_bk}")
        print(f"📚 API 문서: http://localhost:{_bk}/docs")
        uvicorn.run(app, host="0.0.0.0", port=_bk)
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc()
