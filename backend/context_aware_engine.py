#!/usr/bin/env python3
"""
문맥 인식 및 대화 연속성 엔진
Context-Aware Engine and Conversation Continuity System

Features:
- 대화 문맥 추적 및 관리
- 의도 인식 및 예측
- 대화 흐름 분석
- 개인화된 응답 생성
- 장기 기억 및 학습
- 감정 상태 추적
"""

import json
import time
import sqlite3
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from enum import Enum
import threading
import queue
import re
from collections import deque, defaultdict
import numpy as np

logger = logging.getLogger(__name__)

class ConversationState(Enum):
    """대화 상태"""
    STARTING = "starting"
    ONGOING = "ongoing"
    CLARIFYING = "clarifying"
    DEEP_DIVE = "deep_dive"
    WRAPPING_UP = "wrapping_up"
    ENDED = "ended"

class IntentType(Enum):
    """의도 타입"""
    QUESTION = "question"
    REQUEST = "request"
    CLARIFICATION = "clarification"
    COMPLAINT = "complaint"
    COMPLIMENT = "compliment"
    GREETING = "greeting"
    GOODBYE = "goodbye"
    TOPIC_CHANGE = "topic_change"
    FOLLOW_UP = "follow_up"
    UNKNOWN = "unknown"

class EmotionType(Enum):
    """감정 타입"""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    EXCITED = "excited"
    FRUSTRATED = "frustrated"
    CURIOUS = "curious"
    CONFUSED = "confused"
    SATISFIED = "satisfied"

@dataclass
class Context:
    """문맥 정보"""
    session_id: str
    user_id: str
    current_topic: str
    conversation_state: ConversationState
    intent_history: List[IntentType]
    emotion_history: List[EmotionType]
    topic_history: List[str]
    key_entities: Dict[str, Any]
    user_preferences: Dict[str, Any]
    conversation_flow: List[Dict[str, Any]]
    last_updated: datetime
    context_strength: float

@dataclass
class ConversationTurn:
    """대화 턴"""
    turn_id: str
    session_id: str
    user_message: str
    ai_response: str
    intent: IntentType
    emotion: EmotionType
    entities: Dict[str, Any]
    timestamp: datetime
    response_time: float
    satisfaction_score: Optional[float]

@dataclass
class UserProfile:
    """사용자 프로필"""
    user_id: str
    name: Optional[str]
    preferences: Dict[str, Any]
    communication_style: str
    expertise_level: Dict[str, str]
    interaction_history: List[str]
    favorite_topics: List[str]
    last_active: datetime
    total_interactions: int

class ContextAwareEngine:
    """문맥 인식 엔진"""
    
    def __init__(self, db_path: str = "context_aware.db"):
        self.db_path = db_path
        self.active_contexts = {}
        self.user_profiles = {}
        self.conversation_patterns = defaultdict(list)
        self.topic_relationships = {}
        self.emotion_patterns = {}
        
        # 데이터베이스 초기화
        self._initialize_database()
        
        # 백그라운드 워커 시작
        self.is_running = True
        self._start_background_workers()
        
        print("✅ 문맥 인식 엔진 초기화 완료")
    
    def _initialize_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 대화 턴 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversation_turns (
                turn_id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                user_message TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                intent TEXT NOT NULL,
                emotion TEXT NOT NULL,
                entities TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                response_time REAL,
                satisfaction_score REAL
            )
        ''')
        
        # 사용자 프로필 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id TEXT PRIMARY KEY,
                name TEXT,
                preferences TEXT,
                communication_style TEXT,
                expertise_level TEXT,
                interaction_history TEXT,
                favorite_topics TEXT,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_interactions INTEGER DEFAULT 0
            )
        ''')
        
        # 문맥 히스토리 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS context_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                context_data TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 대화 패턴 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversation_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern_type TEXT NOT NULL,
                pattern_data TEXT NOT NULL,
                frequency INTEGER DEFAULT 1,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ 문맥 인식 데이터베이스 초기화 완료")
    
    def _start_background_workers(self):
        """백그라운드 워커 시작"""
        # 문맥 업데이트 워커
        context_thread = threading.Thread(target=self._context_update_worker, daemon=True)
        context_thread.start()
        
        # 패턴 학습 워커
        pattern_thread = threading.Thread(target=self._pattern_learning_worker, daemon=True)
        pattern_thread.start()
        
        print("✅ 문맥 인식 백그라운드 워커 시작")
    
    def _context_update_worker(self):
        """문맥 업데이트 워커"""
        while self.is_running:
            try:
                # 오래된 문맥 정리
                self._cleanup_old_contexts()
                
                # 사용자 프로필 업데이트
                self._update_user_profiles()
                
                time.sleep(30)  # 30초마다 실행
                
            except Exception as e:
                logger.error(f"문맥 업데이트 워커 오류: {e}")
                time.sleep(60)
    
    def _pattern_learning_worker(self):
        """패턴 학습 워커"""
        while self.is_running:
            try:
                # 대화 패턴 분석
                self._analyze_conversation_patterns()
                
                # 감정 패턴 학습
                self._learn_emotion_patterns()
                
                time.sleep(60)  # 1분마다 실행
                
            except Exception as e:
                logger.error(f"패턴 학습 워커 오류: {e}")
                time.sleep(120)
    
    def process_conversation_turn(
        self, 
        session_id: str, 
        user_message: str, 
        ai_response: str,
        user_id: str = "anonymous"
    ) -> Context:
        """대화 턴 처리"""
        try:
            # 기존 문맥 가져오기 또는 새로 생성
            context = self._get_or_create_context(session_id, user_id)
            
            # 의도 분석
            intent = self._analyze_intent(user_message, context)
            
            # 감정 분석
            emotion = self._analyze_emotion(user_message, context)
            
            # 개체명 추출
            entities = self._extract_entities(user_message)
            
            # 대화 턴 저장
            turn = ConversationTurn(
                turn_id=hashlib.md5(f"{session_id}_{time.time()}".encode()).hexdigest(),
                session_id=session_id,
                user_message=user_message,
                ai_response=ai_response,
                intent=intent,
                emotion=emotion,
                entities=entities,
                timestamp=datetime.now(),
                response_time=0.0,  # 실제로는 측정
                satisfaction_score=None
            )
            
            self._save_conversation_turn(turn)
            
            # 문맥 업데이트
            updated_context = self._update_context(context, turn)
            
            # 사용자 프로필 업데이트
            self._update_user_profile(user_id, turn)
            
            return updated_context
            
        except Exception as e:
            logger.error(f"대화 턴 처리 실패: {e}")
            raise
    
    def _get_or_create_context(self, session_id: str, user_id: str) -> Context:
        """문맥 가져오기 또는 생성"""
        if session_id in self.active_contexts:
            return self.active_contexts[session_id]
        
        # 새 문맥 생성
        context = Context(
            session_id=session_id,
            user_id=user_id,
            current_topic="general",
            conversation_state=ConversationState.STARTING,
            intent_history=[],
            emotion_history=[],
            topic_history=[],
            key_entities={},
            user_preferences={},
            conversation_flow=[],
            last_updated=datetime.now(),
            context_strength=0.0
        )
        
        self.active_contexts[session_id] = context
        return context
    
    def _analyze_intent(self, message: str, context: Context) -> IntentType:
        """의도 분석"""
        message_lower = message.lower()
        
        # 의도 키워드 매핑
        intent_keywords = {
            IntentType.QUESTION: ['?', '무엇', '어떻게', '왜', '언제', '어디', '누가'],
            IntentType.REQUEST: ['해주세요', '도와주세요', '부탁', '요청'],
            IntentType.CLARIFICATION: ['다시', '설명', '명확히', '정확히'],
            IntentType.COMPLAINT: ['문제', '불만', '어려움', '힘들다'],
            IntentType.COMPLIMENT: ['좋다', '훌륭하다', '감사', '고맙다'],
            IntentType.GREETING: ['안녕', '반갑', '처음'],
            IntentType.GOODBYE: ['안녕히', '다음에', '끝', '종료'],
            IntentType.TOPIC_CHANGE: ['다른', '바꿔', '새로운', '이제'],
            IntentType.FOLLOW_UP: ['그리고', '또한', '추가로', '더']
        }
        
        # 의도 점수 계산
        intent_scores = {}
        for intent, keywords in intent_keywords.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            intent_scores[intent] = score
        
        # 최고 점수 의도 선택
        if intent_scores:
            best_intent = max(intent_scores.items(), key=lambda x: x[1])
            if best_intent[1] > 0:
                return best_intent[0]
        
        # 문맥 기반 의도 추론
        if context.intent_history:
            last_intent = context.intent_history[-1]
            if last_intent == IntentType.QUESTION:
                return IntentType.FOLLOW_UP
        
        return IntentType.UNKNOWN
    
    def _analyze_emotion(self, message: str, context: Context) -> EmotionType:
        """감정 분석"""
        message_lower = message.lower()
        
        # 감정 키워드 매핑
        emotion_keywords = {
            EmotionType.POSITIVE: ['좋다', '훌륭하다', '감사', '고맙다', '만족'],
            EmotionType.NEGATIVE: ['나쁘다', '문제', '어렵다', '힘들다', '불만'],
            EmotionType.EXCITED: ['와', '대단하다', '놀라다', '신기하다'],
            EmotionType.FRUSTRATED: ['짜증', '화나다', '답답하다', '어려워'],
            EmotionType.CURIOUS: ['궁금', '알고싶다', '어떻게', '왜'],
            EmotionType.CONFUSED: ['모르겠다', '이해안된다', '복잡하다'],
            EmotionType.SATISFIED: ['완벽하다', '충분하다', '만족스럽다']
        }
        
        # 감정 점수 계산
        emotion_scores = {}
        for emotion, keywords in emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            emotion_scores[emotion] = score
        
        # 최고 점수 감정 선택
        if emotion_scores:
            best_emotion = max(emotion_scores.items(), key=lambda x: x[1])
            if best_emotion[1] > 0:
                return best_emotion[0]
        
        # 문맥 기반 감정 추론
        if context.emotion_history:
            recent_emotions = context.emotion_history[-3:]  # 최근 3개 감정
            emotion_counts = {}
            for emotion in recent_emotions:
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            
            if emotion_counts:
                most_common = max(emotion_counts.items(), key=lambda x: x[1])
                return most_common[0]
        
        return EmotionType.NEUTRAL
    
    def _extract_entities(self, message: str) -> Dict[str, Any]:
        """개체명 추출"""
        entities = {
            'persons': [],
            'organizations': [],
            'locations': [],
            'dates': [],
            'numbers': [],
            'topics': []
        }
        
        # 한국어 이름 패턴
        korean_names = re.findall(r'[가-힣]{2,4}(?=씨|님|선생님)', message)
        entities['persons'].extend(korean_names)
        
        # 영어 이름 패턴
        english_names = re.findall(r'[A-Z][a-z]+ [A-Z][a-z]+', message)
        entities['persons'].extend(english_names)
        
        # 날짜 패턴
        dates = re.findall(r'\d{4}년|\d{1,2}월|\d{1,2}일', message)
        entities['dates'].extend(dates)
        
        # 숫자 패턴
        numbers = re.findall(r'\d+', message)
        entities['numbers'].extend(numbers)
        
        # 주제 키워드
        topic_keywords = {
            '프로그래밍': ['코딩', '개발', '프로그래밍', '알고리즘'],
            '비즈니스': ['경영', '마케팅', '전략', '비즈니스'],
            '교육': ['학습', '공부', '교육', '수업'],
            '기술': ['AI', '인공지능', '기술', '혁신']
        }
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in message for keyword in keywords):
                entities['topics'].append(topic)
        
        return entities
    
    def _update_context(self, context: Context, turn: ConversationTurn) -> Context:
        """문맥 업데이트"""
        # 의도 히스토리 업데이트
        context.intent_history.append(turn.intent)
        if len(context.intent_history) > 10:  # 최근 10개만 유지
            context.intent_history = context.intent_history[-10:]
        
        # 감정 히스토리 업데이트
        context.emotion_history.append(turn.emotion)
        if len(context.emotion_history) > 10:
            context.emotion_history = context.emotion_history[-10:]
        
        # 주제 업데이트
        if turn.entities.get('topics'):
            new_topic = turn.entities['topics'][0]
            if new_topic != context.current_topic:
                context.topic_history.append(context.current_topic)
                context.current_topic = new_topic
                if len(context.topic_history) > 5:
                    context.topic_history = context.topic_history[-5:]
        
        # 개체명 업데이트
        for entity_type, entities in turn.entities.items():
            if entities:
                if entity_type not in context.key_entities:
                    context.key_entities[entity_type] = []
                context.key_entities[entity_type].extend(entities)
                
                # 중복 제거 및 최근 것만 유지
                context.key_entities[entity_type] = list(set(context.key_entities[entity_type]))[-10:]
        
        # 대화 흐름 업데이트
        flow_entry = {
            'turn_id': turn.turn_id,
            'intent': turn.intent.value,
            'emotion': turn.emotion.value,
            'topic': context.current_topic,
            'timestamp': turn.timestamp.isoformat()
        }
        context.conversation_flow.append(flow_entry)
        if len(context.conversation_flow) > 20:  # 최근 20개만 유지
            context.conversation_flow = context.conversation_flow[-20:]
        
        # 대화 상태 업데이트
        context.conversation_state = self._determine_conversation_state(context)
        
        # 문맥 강도 계산
        context.context_strength = self._calculate_context_strength(context)
        
        # 마지막 업데이트 시간
        context.last_updated = datetime.now()
        
        return context
    
    def _determine_conversation_state(self, context: Context) -> ConversationState:
        """대화 상태 결정"""
        if not context.intent_history:
            return ConversationState.STARTING
        
        recent_intents = context.intent_history[-3:]
        
        # 의도 기반 상태 결정
        if IntentType.CLARIFICATION in recent_intents:
            return ConversationState.CLARIFYING
        elif IntentType.FOLLOW_UP in recent_intents:
            return ConversationState.DEEP_DIVE
        elif IntentType.GOODBYE in recent_intents:
            return ConversationState.WRAPPING_UP
        elif len(context.intent_history) > 5:
            return ConversationState.ONGOING
        else:
            return ConversationState.STARTING
    
    def _calculate_context_strength(self, context: Context) -> float:
        """문맥 강도 계산"""
        strength = 0.0
        
        # 대화 길이 기반
        turn_count = len(context.intent_history)
        strength += min(turn_count * 0.1, 0.5)
        
        # 주제 일관성
        if context.topic_history:
            topic_consistency = 1.0 - (len(set(context.topic_history)) / len(context.topic_history))
            strength += topic_consistency * 0.3
        
        # 개체명 풍부성
        entity_count = sum(len(entities) for entities in context.key_entities.values())
        strength += min(entity_count * 0.05, 0.2)
        
        return min(strength, 1.0)
    
    def _update_user_profile(self, user_id: str, turn: ConversationTurn):
        """사용자 프로필 업데이트"""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = UserProfile(
                user_id=user_id,
                name=None,
                preferences={},
                communication_style="formal",
                expertise_level={},
                interaction_history=[],
                favorite_topics=[],
                last_active=datetime.now(),
                total_interactions=0
            )
        
        profile = self.user_profiles[user_id]
        
        # 상호작용 히스토리 업데이트
        profile.interaction_history.append(turn.turn_id)
        if len(profile.interaction_history) > 100:
            profile.interaction_history = profile.interaction_history[-100:]
        
        # 선호 주제 업데이트
        if turn.entities.get('topics'):
            for topic in turn.entities['topics']:
                if topic not in profile.favorite_topics:
                    profile.favorite_topics.append(topic)
                if len(profile.favorite_topics) > 10:
                    profile.favorite_topics = profile.favorite_topics[-10:]
        
        # 전문성 수준 업데이트
        for topic in turn.entities.get('topics', []):
            if topic not in profile.expertise_level:
                profile.expertise_level[topic] = "beginner"
            else:
                # 상호작용 횟수에 따라 전문성 증가
                current_level = profile.expertise_level[topic]
                if current_level == "beginner" and profile.total_interactions > 5:
                    profile.expertise_level[topic] = "intermediate"
                elif current_level == "intermediate" and profile.total_interactions > 20:
                    profile.expertise_level[topic] = "advanced"
        
        # 통신 스타일 업데이트
        if turn.emotion == EmotionType.POSITIVE:
            profile.communication_style = "friendly"
        elif turn.emotion == EmotionType.FRUSTRATED:
            profile.communication_style = "formal"
        
        # 마지막 활동 시간 및 총 상호작용 수
        profile.last_active = datetime.now()
        profile.total_interactions += 1
    
    def _save_conversation_turn(self, turn: ConversationTurn):
        """대화 턴 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO conversation_turns 
            (turn_id, session_id, user_message, ai_response, intent, emotion, entities, 
             timestamp, response_time, satisfaction_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            turn.turn_id,
            turn.session_id,
            turn.user_message,
            turn.ai_response,
            turn.intent.value,
            turn.emotion.value,
            json.dumps(turn.entities, ensure_ascii=False),
            turn.timestamp,
            turn.response_time,
            turn.satisfaction_score
        ))
        
        conn.commit()
        conn.close()
    
    def _cleanup_old_contexts(self):
        """오래된 문맥 정리"""
        current_time = datetime.now()
        cutoff_time = current_time - timedelta(hours=24)  # 24시간 이상 된 문맥
        
        contexts_to_remove = []
        for session_id, context in self.active_contexts.items():
            if context.last_updated < cutoff_time:
                contexts_to_remove.append(session_id)
        
        for session_id in contexts_to_remove:
            del self.active_contexts[session_id]
        
        if contexts_to_remove:
            logger.info(f"오래된 문맥 {len(contexts_to_remove)}개 정리 완료")
    
    def _update_user_profiles(self):
        """사용자 프로필 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for user_id, profile in self.user_profiles.items():
            cursor.execute('''
                INSERT OR REPLACE INTO user_profiles 
                (user_id, name, preferences, communication_style, expertise_level, 
                 interaction_history, favorite_topics, last_active, total_interactions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                profile.name,
                json.dumps(profile.preferences, ensure_ascii=False),
                profile.communication_style,
                json.dumps(profile.expertise_level, ensure_ascii=False),
                json.dumps(profile.interaction_history, ensure_ascii=False),
                json.dumps(profile.favorite_topics, ensure_ascii=False),
                profile.last_active,
                profile.total_interactions
            ))
        
        conn.commit()
        conn.close()
    
    def _analyze_conversation_patterns(self):
        """대화 패턴 분석"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 최근 대화 턴들 분석
        cursor.execute('''
            SELECT intent, emotion, entities 
            FROM conversation_turns 
            WHERE timestamp > datetime('now', '-1 day')
            ORDER BY timestamp DESC
            LIMIT 100
        ''')
        
        recent_turns = cursor.fetchall()
        
        # 의도-감정 패턴 분석
        intent_emotion_patterns = defaultdict(int)
        for intent, emotion, entities in recent_turns:
            pattern = f"{intent}-{emotion}"
            intent_emotion_patterns[pattern] += 1
        
        # 패턴 저장
        for pattern, frequency in intent_emotion_patterns.items():
            cursor.execute('''
                INSERT OR REPLACE INTO conversation_patterns 
                (pattern_type, pattern_data, frequency, last_seen)
                VALUES (?, ?, ?, ?)
            ''', ('intent_emotion', pattern, frequency, datetime.now()))
        
        conn.commit()
        conn.close()
    
    def _learn_emotion_patterns(self):
        """감정 패턴 학습"""
        # 사용자별 감정 패턴 학습
        for user_id, profile in self.user_profiles.items():
            if len(profile.interaction_history) > 5:
                # 최근 상호작용의 감정 패턴 분석
                recent_emotions = self._get_recent_emotions(user_id)
                if recent_emotions:
                    emotion_pattern = self._analyze_emotion_pattern(recent_emotions)
                    self.emotion_patterns[user_id] = emotion_pattern
    
    def _get_recent_emotions(self, user_id: str) -> List[EmotionType]:
        """최근 감정 가져오기"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT emotion 
            FROM conversation_turns ct
            JOIN user_profiles up ON ct.session_id LIKE ?
            WHERE up.user_id = ?
            ORDER BY ct.timestamp DESC
            LIMIT 10
        ''', (f'%{user_id}%', user_id))
        
        emotions = [EmotionType(row[0]) for row in cursor.fetchall()]
        conn.close()
        
        return emotions
    
    def _analyze_emotion_pattern(self, emotions: List[EmotionType]) -> Dict[str, Any]:
        """감정 패턴 분석"""
        if not emotions:
            return {}
        
        emotion_counts = {}
        for emotion in emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        total_emotions = len(emotions)
        emotion_ratios = {
            emotion.value: count / total_emotions 
            for emotion, count in emotion_counts.items()
        }
        
        dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0]
        
        return {
            'emotion_ratios': emotion_ratios,
            'dominant_emotion': dominant_emotion.value,
            'emotion_stability': 1.0 - (len(emotion_counts) / total_emotions),
            'pattern_length': total_emotions
        }
    
    def get_context(self, session_id: str) -> Optional[Context]:
        """문맥 조회"""
        return self.active_contexts.get(session_id)
    
    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """사용자 프로필 조회"""
        return self.user_profiles.get(user_id)
    
    def predict_next_intent(self, session_id: str) -> Optional[IntentType]:
        """다음 의도 예측"""
        context = self.get_context(session_id)
        if not context or len(context.intent_history) < 2:
            return None
        
        # 최근 의도 패턴 분석
        recent_intents = context.intent_history[-3:]
        
        # 패턴 기반 예측
        if IntentType.QUESTION in recent_intents:
            return IntentType.FOLLOW_UP
        elif IntentType.CLARIFICATION in recent_intents:
            return IntentType.QUESTION
        elif IntentType.REQUEST in recent_intents:
            return IntentType.CLARIFICATION
        
        return IntentType.UNKNOWN
    
    def get_personalized_response_style(self, user_id: str) -> Dict[str, Any]:
        """개인화된 응답 스타일 조회"""
        profile = self.get_user_profile(user_id)
        if not profile:
            return {
                'style': 'formal',
                'length': 'medium',
                'detail_level': 'standard'
            }
        
        # 사용자 프로필 기반 스타일 결정
        style = profile.communication_style
        
        # 전문성 수준에 따른 상세도 조정
        detail_level = 'standard'
        if profile.expertise_level:
            avg_expertise = sum(
                1 if level == 'advanced' else 0.5 if level == 'intermediate' else 0
                for level in profile.expertise_level.values()
            ) / len(profile.expertise_level)
            
            if avg_expertise > 0.7:
                detail_level = 'detailed'
            elif avg_expertise < 0.3:
                detail_level = 'simple'
        
        # 감정 패턴에 따른 길이 조정
        length = 'medium'
        if user_id in self.emotion_patterns:
            emotion_pattern = self.emotion_patterns[user_id]
            if emotion_pattern.get('emotion_stability', 0) > 0.8:
                length = 'detailed'
            elif emotion_pattern.get('emotion_stability', 0) < 0.3:
                length = 'concise'
        
        return {
            'style': style,
            'length': length,
            'detail_level': detail_level,
            'preferred_topics': profile.favorite_topics,
            'expertise_areas': profile.expertise_level
        }
    
    def get_conversation_summary(self, session_id: str) -> Dict[str, Any]:
        """대화 요약"""
        context = self.get_context(session_id)
        if not context:
            return {}
        
        return {
            'session_id': session_id,
            'current_topic': context.current_topic,
            'conversation_state': context.conversation_state.value,
            'turn_count': len(context.intent_history),
            'context_strength': context.context_strength,
            'key_entities': context.key_entities,
            'topic_history': context.topic_history,
            'recent_emotions': [e.value for e in context.emotion_history[-3:]],
            'recent_intents': [i.value for i in context.intent_history[-3:]],
            'conversation_flow': context.conversation_flow[-5:]  # 최근 5개 턴
        }
    
    def get_system_stats(self) -> Dict[str, Any]:
        """시스템 통계"""
        return {
            'active_contexts': len(self.active_contexts),
            'user_profiles': len(self.user_profiles),
            'emotion_patterns': len(self.emotion_patterns),
            'conversation_patterns': len(self.conversation_patterns),
            'last_updated': datetime.now().isoformat()
        }
    
    def shutdown(self):
        """시스템 종료"""
        self.is_running = False
        print("✅ 문맥 인식 엔진 종료 완료")

# 전역 인스턴스
context_aware_engine = ContextAwareEngine()
