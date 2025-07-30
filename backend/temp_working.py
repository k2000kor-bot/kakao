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
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
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
    
    # 채팅방 테이블
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
        'documents': ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx']
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

# 채팅방 동기화
def sync_chat_rooms():
    """채팅방 자동 동기화"""
    chat_rooms_path = 'chat_rooms'
    if not os.path.exists(chat_rooms_path):
        logger.warning(f"채팅방 폴더가 없습니다: {chat_rooms_path}")
        return []
    
    conn = sqlite3.connect('chat_system.db')
    cursor = conn.cursor()
    
    synced_rooms = []
    
    # 모든 채팅방 폴더 스캔
    for room_folder in os.listdir(chat_rooms_path):
        room_path = os.path.join(chat_rooms_path, room_folder)
        if not os.path.isdir(room_path):
            continue
        
        # 채팅방 ID 생성
        room_id = room_folder
        
        # 채팅 파일 찾기 (개선된 검색)
        chat_files = []
        for file in os.listdir(room_path):
            if file.endswith('.txt'):
                chat_files.append(os.path.join(room_path, file))
        
        if not chat_files:
            logger.warning(f"채팅 파일이 없습니다: {room_path}")
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
            # 기존 채팅방 업데이트 확인
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
        
        # 새로운 채팅방 또는 업데이트
        messages, participants = parse_kakao_chat(latest_chat_file)
        
        # 미디어 파일 분류
        media_files = classify_media_files(room_path)
        
        # 데이터베이스 업데이트
        now = datetime.now().isoformat()
        
        if existing_room:
            # 기존 채팅방 업데이트
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
            # 새로운 채팅방 추가
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
        
        logger.info(f"채팅방 동기화 완료: {room_id} ({len(messages)}개 메시지, {len(media_files)}개 미디어)")
    
    conn.commit()
    conn.close()
    
    return synced_rooms


def auto_detect_new_chat_rooms():
    """새로운 채팅방 자동 감지"""
    chat_rooms_path = 'chat_rooms'
    if not os.path.exists(chat_rooms_path):
        return []
    
    conn = sqlite3.connect('chat_system.db')
    cursor = conn.cursor()
    
    # 기존 채팅방 목록 조회
    cursor.execute('SELECT id FROM chat_rooms')
    existing_rooms = {row[0] for row in cursor.fetchall()}
    
    new_rooms = []
    
    for room_folder in os.listdir(chat_rooms_path):
        room_path = os.path.join(chat_rooms_path, room_folder)
        if not os.path.isdir(room_path):
            continue
        
        if room_folder not in existing_rooms:
            # 새로운 채팅방 발견
            chat_files = [f for f in os.listdir(room_path) if f.endswith('.txt')]
            if chat_files:
                new_rooms.append({
                    'id': room_folder,
                    'name': room_folder,
                    'path': room_path,
                    'chat_files': chat_files
                })
                logger.info(f"새로운 채팅방 발견: {room_folder}")
    
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
    """채팅방 목록 조회"""
    try:
        # 동기화 실행
        synced_rooms = sync_chat_rooms()
        
        return {
            "success": True,
            "chat_rooms": synced_rooms,
            "sync_time": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"채팅방 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "chat_rooms": []
        }

@app.get("/api/v7/chat-messages/{chat_room_id}")
@cache_result(ttl=180)  # 3분 캐시
async def get_chat_messages(chat_room_id: str):
    """채팅 메시지 조회"""
    try:
        logger.info(f"메시지 조회 시작: {chat_room_id}")
        
        # 채팅방 ID를 실제 폴더명으로 매핑 (URL 디코딩 포함)
        import urllib.parse
        decoded_room_id = urllib.parse.unquote(chat_room_id)
        
        # 동적 채팅방 매핑 시스템
        def find_chat_room_file(room_id: str) -> tuple[str, str]:
            """채팅방 파일을 동적으로 찾는 함수"""
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
                    # 가장 큰 파일 선택 (메인 채팅 파일)
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
            "[인증]행복한소유☆개포우성7차 110 님과 카카오톡 대화": "[인증]행복한소유☆개포우성7차",
            "[인증]행복한소유☆개포우성|차 110 님과 카카오톡 대화": "[인증]행복한소유☆개포우성7차",
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
                logger.error(f"채팅 파일을 찾을 수 없습니다: {decoded_room_id}")
                return {
                    "success": False,
                    "error": f"채팅 파일을 찾을 수 없습니다: {decoded_room_id}",
                    "messages": []
                }
        
        if not os.path.exists(chat_file_path):
            logger.error(f"채팅 파일을 찾을 수 없습니다: {chat_file_path}")
            return {
                "success": False,
                "error": f"채팅 파일을 찾을 수 없습니다: {chat_file_path}",
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
        
        logger.info(f"채팅방 {chat_room_id}의 메시지 수: {len(messages)}")
        
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
