#!/usr/bin/env python3
"""
고도화된 메시지 생성 서버
AI 모델 통합, 감정 분석, 개인화, 실시간 학습 등의 고급 기능 포함
"""

import json
import random
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import sqlite3
import os
import re
import time
from message_format_generator import MessageFormatGenerator
from enhanced_conversation_analyzer import EnhancedConversationAnalyzer

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# FastAPI 앱 생성
app = FastAPI(
    title="고도화된 메시지 생성 서버",
    description="AI 모델 통합, 감정 분석, 개인화, 실시간 학습 기능을 포함한 고급 메시지 생성 서버",
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

# 데이터베이스 초기화


def init_advanced_message_database():
    """고도화된 메시지 시스템 데이터베이스 초기화"""
    conn = sqlite3.connect('advanced_message_system.db')
    cursor = conn.cursor()
    
    # 고급 메시지 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS advanced_messages (
            id TEXT PRIMARY KEY,
            original_message TEXT NOT NULL,
            generated_message TEXT NOT NULL,
            ai_model_used TEXT,
            emotion_analysis TEXT,
            personalization_score REAL,
            confidence_score REAL,
            impact_prediction REAL,
            learning_insights TEXT,
            alternatives TEXT,
            user_id TEXT,
            chat_room_id TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    ''')
    
    # 사용자 프로필 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_profiles (
            user_id TEXT PRIMARY KEY,
            communication_style TEXT,
            preferred_tone TEXT,
            response_speed TEXT,
            formality_level TEXT,
            emotion_sensitivity REAL,
            learning_pattern TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    ''')
    
    # AI 모델 성능 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_model_performance (
            model_name TEXT PRIMARY KEY,
            success_rate REAL,
            average_response_time REAL,
            user_satisfaction REAL,
            total_requests INTEGER,
            last_updated TEXT
        )
    ''')
    
    # 학습 피드백 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS learning_feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT,
            feedback_score REAL,
            success_indicator BOOLEAN,
            learning_insights TEXT,
            improvement_areas TEXT,
            adaptation_recommendations TEXT,
            created_at TEXT
        )
    ''')
    
    # 성공 패턴 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS successful_patterns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT,
            feedback_score REAL,
            success_indicator BOOLEAN,
            pattern_type TEXT,
            created_at TEXT
        )
    ''')
    
    # 개선 작업 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS improvement_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            area TEXT,
            priority TEXT,
            status TEXT,
            created_at TEXT,
            feedback_id TEXT
        )
    ''')
    
    # 탐색 작업 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS exploration_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recommendation TEXT,
            priority TEXT,
            status TEXT,
            created_at TEXT,
            feedback_id TEXT
        )
    ''')
    
    # 성능 메트릭 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS performance_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_name TEXT,
            metric_value REAL,
            timestamp TEXT,
            context TEXT
        )
    ''')
    
    # 감정 분석 히스토리 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS emotion_analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT,
            primary_emotion TEXT,
            intensity REAL,
            context_emotion TEXT,
            emotion_trend TEXT,
            complex_emotions TEXT,
            confidence REAL,
            sentiment_score REAL,
            emotional_context TEXT,
            created_at TEXT
        )
    ''')
    
    # 개인화 히스토리 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS personalization_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            message_id TEXT,
            communication_style TEXT,
            preferred_tone TEXT,
            response_speed TEXT,
            formality_level TEXT,
            emotion_sensitivity REAL,
            learning_pattern TEXT,
            personalization_score REAL,
            created_at TEXT
        )
    ''')
    
    # 맥락 분석 히스토리 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS context_analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT,
            detected_context TEXT,
            urgency_level TEXT,
            complexity_level TEXT,
            emotional_tone TEXT,
            key_topics TEXT,
            stakeholders TEXT,
            constraints TEXT,
            created_at TEXT
        )
    ''')
    
    # 기본 AI 모델 성능 데이터 삽입
    cursor.execute('''
        INSERT OR REPLACE INTO ai_model_performance 
        (model_name, success_rate, average_response_time, user_satisfaction, total_requests, last_updated)
        VALUES 
        ('GPT-4', 0.92, 2.5, 0.89, 0, ?),
        ('Claude-3', 0.89, 2.8, 0.87, 0, ?),
        ('Gemini', 0.87, 2.2, 0.85, 0, ?),
        ('Custom-Korean', 0.85, 1.8, 0.88, 0, ?)
    ''', (datetime.now().isoformat(), datetime.now().isoformat(), datetime.now().isoformat(), datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    logger.info("✅ 고도화된 메시지 시스템 데이터베이스 초기화 완료")

# 요청 모델


class AdvancedMessageRequest(BaseModel):
    original_message: str
    context: str
    sender: str
    chat_room_id: str
    target_audience: List[str]
    context_type: str
    user_id: str
    emotion_context: Optional[str] = None
    style: Optional[str] = None
    recent_messages: Optional[List[Dict[str, Any]]] = None  # 최근 대화 흐름


class AdvancedMessageSampleRequest(BaseModel):
    original_message: str
    context: str
    sender: str
    chat_room_id: str
    target_audience: List[str]
    context_type: str
    user_id: str
    emotion_context: Optional[str] = None
    styles: Optional[List[str]] = None
    emotion_contexts: Optional[List[str]] = None
    contexts: Optional[List[str]] = None
    recent_messages: Optional[List[Dict[str, Any]]] = None  # 최근 대화 흐름


class UserProfileRequest(BaseModel):
    user_id: str
    communication_style: str
    preferred_tone: str
    response_speed: str
    formality_level: str
    emotion_sensitivity: float


class LearningFeedbackRequest(BaseModel):
    message_id: str
    user_feedback: float
    success_indicator: bool
    improvement_suggestions: Optional[str] = None


# 응답 모델


class AdvancedGeneratedMessage(BaseModel):
    id: str
    original_message: str
    generated_message: str
    ai_model_used: str
    emotion_analysis: Dict[str, Any]
    personalization_score: float
    confidence_score: float
    impact_prediction: float
    learning_insights: List[str]
    alternatives: List[str]
    created_at: str


class UserProfile(BaseModel):
    user_id: str
    communication_style: str
    preferred_tone: str
    response_speed: str
    formality_level: str
    emotion_sensitivity: float
    learning_pattern: str
    created_at: str
    updated_at: str


# AI 모델 시뮬레이션


class ConversationAnalyzer:
    """실제 카카오톡 대화 분석기"""
    
    def __init__(self):
        self.conversation_patterns = {}
        self.speaker_styles = {}
        self.common_expressions = []
        self.topic_transitions = []
        self.emotion_patterns = {}
        self.response_patterns = {}
        self.context_patterns = {}
        self.real_estate_patterns = {}
        self.community_patterns = {}
        
    def analyze_chat_file(self, file_path: str):
        """카카오톡 대화 파일 분석"""
        try:
            messages = self._parse_messages(file_path)
            if not messages:
                print(f"⚠️ 메시지를 파싱할 수 없습니다: {file_path}")
                return
            
            self._analyze_speaker_patterns(messages)
            self._analyze_common_expressions(messages)
            self._analyze_topic_transitions(messages)
            self._analyze_emotion_patterns(messages)
            self._analyze_response_patterns(messages)
            self._analyze_context_patterns(messages)
            
            # 우성7차 특화 분석 추가
            self._analyze_real_estate_patterns(messages)
            self._analyze_community_patterns(messages)
            
            print(f"✅ 대화 분석 완료: {len(messages)}개 메시지")
            
        except Exception as e:
            print(f"❌ 대화 분석 오류: {e}")
    
    def _parse_messages(self, file_path: str) -> List[Dict[str, Any]]:
        """카카오톡 대화 메시지 파싱"""
        messages = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            lines = content.split('\n')
            current_date = ""
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # 날짜 라인 확인 (예: 2025년 6월 24일 오전 9:22)
                if re.match(r'\d{4}년 \d{1,2}월 \d{1,2}일', line):
                    current_date = line
                    continue
                
                # 메시지 라인 확인 (예: 2025년 6월 24일 오전 9:22, 0098 : 메시지내용)
                if ', ' in line and ' : ' in line:
                    try:
                        # 시간과 사용자 ID 분리
                        time_user_part, message_content = line.split(' : ', 1)
                        
                        # 시간 부분에서 사용자 ID 추출
                        if ', ' in time_user_part:
                            time_part, user_id = time_user_part.rsplit(', ', 1)
                            timestamp = time_part.strip()
                        else:
                            timestamp = time_user_part.strip()
                            user_id = "unknown"
                        
                        # 메시지 타입 분석
                        message_type = self._analyze_message_type(message_content)
                        
                        messages.append({
                            'timestamp': timestamp,
                            'user_id': user_id,
                            'content': message_content,
                            'type': message_type,
                            'has_emotion': self._has_emotion_indicators(message_content),
                            'is_question': '?' in message_content,
                            'is_agreement': self._is_agreement(message_content),
                            'is_disagreement': self._is_disagreement(message_content),
                            'length': len(message_content),
                            'words': message_content.split()
                        })
                        
                    except Exception as e:
                        print(f"메시지 파싱 오류: {line} - {e}")
                        continue
                
                # 특수 메시지 처리
                elif any(special in line for special in ['삭제된 메시지입니다', '<사진 읽지 않음>', '<이모티콘>']):
                    messages.append({
                        'timestamp': current_date,
                        'user_id': 'system',
                        'content': line,
                        'type': 'special',
                        'has_emotion': False,
                        'is_question': False,
                        'is_agreement': False,
                        'is_disagreement': False,
                        'length': len(line),
                        'words': line.split()
                    })
        
        except Exception as e:
            print(f"파일 읽기 오류: {e}")
        
        return messages
    
    def _analyze_message_type(self, content: str) -> str:
        """메시지 타입 분석"""
        if '삭제된 메시지입니다' in content:
            return 'deleted'
        elif '<사진 읽지 않음>' in content:
            return 'photo'
        elif '<이모티콘>' in content:
            return 'emoticon'
        elif any(word in content for word in ['ㅎ', 'ㅋ', '^^', 'ㅠ', 'ㅜ', 'ㅡ', 'ㅇ', '!']):
            return 'emotional'
        elif '?' in content:
            return 'question'
        elif any(word in content for word in ['맞다', '좋다', '동감', '그래', '응', '네', '좋아', '괜찮아']):
            return 'agreement'
        elif any(word in content for word in ['아니', '그렇지 않', '틀렸', '반대', '싫어', '안 좋']):
            return 'disagreement'
        elif any(word in content for word in ['재개발', '재건축', '분양', '시세', '가격', '환급', '분담금']):
            return 'real_estate'
        else:
            return 'general'
    
    def _has_emotion_indicators(self, message: str) -> bool:
        """감정 표현 지표 확인"""
        emotion_indicators = ['ㅎ', 'ㅋ', '^^', 'ㅠ', 'ㅜ', 'ㅡ', 'ㅇ', '!', '?']
        return any(indicator in message for indicator in emotion_indicators)
    
    def _is_agreement(self, message: str) -> bool:
        """동의 표현 확인"""
        agreement_words = ['맞다', '좋다', '동감', '그래', '응', '네', '좋아', '괜찮아']
        return any(word in message for word in agreement_words)
    
    def _is_disagreement(self, message: str) -> bool:
        """반대 표현 확인"""
        disagreement_words = ['아니', '그렇지 않', '틀렸', '반대', '싫어', '안 좋']
        return any(word in message for word in disagreement_words)
    
    def _analyze_speaker_patterns(self, messages: List[Dict[str, Any]]):
        """발신자별 대화 패턴 분석"""
        speaker_stats = {}
        
        for msg in messages:
            # user_id 또는 speaker 키 사용 (호환성 유지)
            speaker = msg.get('user_id', msg.get('speaker', 'unknown'))
            if speaker not in speaker_stats:
                speaker_stats[speaker] = {
                    'message_count': 0,
                    'avg_length': 0,
                    'common_words': {},
                    'emotion_indicators': [],
                    'question_count': 0,
                    'agreement_count': 0,
                    'disagreement_count': 0,
                    'response_style': 'neutral'
                }
            
            stats = speaker_stats[speaker]
            stats['message_count'] += 1
            
            # 메시지 길이 계산 (content가 있는 경우)
            content = msg.get('content', msg.get('message', ''))
            msg_length = len(content)
            stats['avg_length'] += msg_length
            
            # 감정 표현 분석
            if msg.get('has_emotion', False):
                stats['emotion_indicators'].append(content)
            
            # 질문/동의/반대 카운트
            if msg.get('is_question', False):
                stats['question_count'] += 1
            if msg.get('is_agreement', False):
                stats['agreement_count'] += 1
            if msg.get('is_disagreement', False):
                stats['disagreement_count'] += 1
            
            # 단어 빈도 분석
            words = content.split()
            for word in words:
                if len(word) > 1:  # 1글자 단어 제외
                    stats['common_words'][word] = stats['common_words'].get(word, 0) + 1
        
        # 평균 길이 계산 및 스타일 결정
        for speaker, stats in speaker_stats.items():
            if stats['message_count'] > 0:
                stats['avg_length'] = stats['avg_length'] / stats['message_count']
                
                # 응답 스타일 결정
                if stats['agreement_count'] > stats['disagreement_count']:
                    stats['response_style'] = 'agreeable'
                elif stats['disagreement_count'] > stats['agreement_count']:
                    stats['response_style'] = 'argumentative'
                elif stats['question_count'] > stats['message_count'] * 0.3:
                    stats['response_style'] = 'inquisitive'
        
        self.speaker_styles = speaker_stats
    
    def _analyze_common_expressions(self, messages: List[Dict[str, Any]]):
        """자주 사용되는 표현 분석"""
        expressions = []
        
        for msg in messages:
            message = msg.get('content', msg.get('message', ''))
            
            # 감탄사, 이모티콘
            if re.search(r'[ㅎㅋㅠㅜ^^]', message):
                expressions.append(message)
            
            # 동의 표현
            if any(word in message for word in ['맞습니다', '동감', '동의', '마자요']):
                expressions.append(message)
            
            # 질문 표현
            if '?' in message:
                expressions.append(message)
            
            # 감정 표현
            if any(word in message for word in ['좋아요', '싫어요', '괜찮아요', '안 좋아요']):
                expressions.append(message)
        
        self.common_expressions = expressions[:30]  # 상위 30개
    
    def _analyze_topic_transitions(self, messages: List[Dict[str, Any]]):
        """주제 전환 패턴 분석"""
        transitions = []
        
        for i in range(len(messages) - 1):
            current_msg = messages[i].get('content', messages[i].get('message', ''))
            next_msg = messages[i + 1].get('content', messages[i + 1].get('message', ''))
            
            # 주제 전환 키워드
            transition_keywords = ['그런데', '근데', '하지만', '다만', '참고로', '참', '아', '그리고', '그래서', '그럼']
            
            for keyword in transition_keywords:
                if keyword in next_msg:
                    transitions.append({
                        'from': current_msg,
                        'to': next_msg,
                        'keyword': keyword
                    })
                    break
        
        self.topic_transitions = transitions
    
    def _analyze_emotion_patterns(self, messages: List[Dict[str, Any]]):
        """감정 패턴 분석"""
        emotion_patterns = {
            'positive': [],
            'negative': [],
            'neutral': [],
            'question': [],
            'agreement': [],
            'disagreement': []
        }
        
        for msg in messages:
            message = msg.get('content', msg.get('message', ''))
            
            # 긍정적 감정
            if any(word in message for word in ['좋아', '행복', '기쁘', '만족', '감사']):
                emotion_patterns['positive'].append(message)
            
            # 부정적 감정
            elif any(word in message for word in ['싫어', '화나', '슬퍼', '불만', '짜증']):
                emotion_patterns['negative'].append(message)
            
            # 질문
            elif msg.get('is_question', False):
                emotion_patterns['question'].append(message)
            
            # 동의
            elif msg.get('is_agreement', False):
                emotion_patterns['agreement'].append(message)
            
            # 반대
            elif msg.get('is_disagreement', False):
                emotion_patterns['disagreement'].append(message)
            
            # 중립
            else:
                emotion_patterns['neutral'].append(message)
        
        self.emotion_patterns = emotion_patterns
    
    def _analyze_response_patterns(self, messages: List[Dict[str, Any]]):
        """응답 패턴 분석"""
        response_patterns = {
            'question_response': [],
            'agreement_response': [],
            'disagreement_response': [],
            'neutral_response': []
        }
        
        for i in range(len(messages) - 1):
            current_msg = messages[i]
            next_msg = messages[i + 1]
            
            # 질문에 대한 응답
            if current_msg.get('is_question', False):
                response_patterns['question_response'].append({
                    'question': current_msg.get('content', current_msg.get('message', '')),
                    'response': next_msg.get('content', next_msg.get('message', ''))
                })
            
            # 동의에 대한 응답
            elif current_msg.get('is_agreement', False):
                response_patterns['agreement_response'].append({
                    'agreement': current_msg.get('content', current_msg.get('message', '')),
                    'response': next_msg.get('content', next_msg.get('message', ''))
                })
            
            # 반대에 대한 응답
            elif current_msg.get('is_disagreement', False):
                response_patterns['disagreement_response'].append({
                    'disagreement': current_msg.get('content', current_msg.get('message', '')),
                    'response': next_msg.get('content', next_msg.get('message', ''))
                })
            
            # 중립적 응답
            else:
                response_patterns['neutral_response'].append({
                    'context': current_msg.get('content', current_msg.get('message', '')),
                    'response': next_msg.get('content', next_msg.get('message', ''))
                })
        
        self.response_patterns = response_patterns
    
    def _analyze_context_patterns(self, messages: List[Dict[str, Any]]):
        """컨텍스트 패턴 분석"""
        context_patterns = {
            'formal': [],
            'informal': [],
            'casual': [],
            'professional': []
        }
        
        for msg in messages:
            message = msg.get('content', msg.get('message', ''))
            
            # 격식체
            if any(word in message for word in ['습니다', '니다', '습니다', '입니다']):
                context_patterns['formal'].append(message)
            
            # 비격식체
            elif any(word in message for word in ['해요', '이에요', '아요', '어요']):
                context_patterns['informal'].append(message)
            
            # 친근체
            elif any(word in message for word in ['ㅎ', 'ㅋ', '^^', '~', '!']):
                context_patterns['casual'].append(message)
            
            # 전문적
            elif any(word in message for word in ['분석', '검토', '검증', '확인', '점검']):
                context_patterns['professional'].append(message)
    
    def _analyze_real_estate_patterns(self, messages: List[Dict[str, Any]]):
        """부동산 관련 패턴 분석 (우성7차 특화)"""
        real_estate_patterns = {
            'redevelopment': [], 'compensation': [], 'community': [],
            'price': [], 'location': [], 'facilities': []
        }
        
        real_estate_keywords = {
            'redevelopment': ['재개발', '재건축', '분양', '시공사', '건설사'],
            'compensation': ['보상', '환급', '분담금', '공사비', '비용'],
            'community': ['커뮤니티', '수영장', '헬스장', '사우나', '조식', '중식'],
            'price': ['시세', '가격', '매매', '전세', '월세', '임대'],
            'location': ['입지', '역세권', '학군', '교통', '편의시설'],
            'facilities': ['시설', '편의', '상가', '주차', '조경']
        }
        
        for msg in messages:
            message = msg.get('content', msg.get('message', ''))
            for category, keywords in real_estate_keywords.items():
                if any(keyword in message for keyword in keywords):
                    real_estate_patterns[category].append(message)
        
        self.real_estate_patterns = real_estate_patterns
    
    def _analyze_community_patterns(self, messages: List[Dict[str, Any]]):
        """커뮤니티 관련 패턴 분석 (우성7차 특화)"""
        community_patterns = {
            'agreement': [], 'disagreement': [], 'question': [],
            'suggestion': [], 'concern': [], 'satisfaction': []
        }
        
        for msg in messages:
            message = msg.get('content', msg.get('message', ''))
            
            # 동의 패턴
            if any(word in message for word in ['맞다', '좋다', '동감', '그래', '응', '네', '좋아', '괜찮아']):
                community_patterns['agreement'].append(message)
            
            # 반대 패턴
            elif any(word in message for word in ['아니', '그렇지 않', '틀렸', '반대', '싫어', '안 좋']):
                community_patterns['disagreement'].append(message)
            
            # 질문 패턴
            elif any(word in message for word in ['궁금', '어떻게', '언제', '어디', '왜', '?']):
                community_patterns['question'].append(message)
            
            # 제안 패턴
            elif any(word in message for word in ['제안', '제안드리', '생각해보', '고려해보']):
                community_patterns['suggestion'].append(message)
            
            # 우려 패턴
            elif any(word in message for word in ['우려', '걱정', '문제', '어려워', '힘들']):
                community_patterns['concern'].append(message)
            
            # 만족 패턴
            elif any(word in message for word in ['만족', '좋아', '행복', '기쁘', '감사']):
                community_patterns['satisfaction'].append(message)
        
        self.community_patterns = community_patterns

class AIModelSimulator:
    def __init__(self):
        self.models = {
            'GPT-4': {
                'model_name': 'GPT-4',
                'capabilities': ['창의성', '논리적 분석', '다양한 관점'],
                'strengths': ['복잡한 문제 해결', '창의적 아이디어'],
                'weaknesses': ['실시간성 부족', '비용 높음'],
                'style_templates': {
                    '논리': (
                        "논리적으로 분석해보겠습니다."
                    ),
                    '공감': (
                        "공감과 이해를 바탕으로 답변드리겠습니다."
                    ),
                    '권위': (
                        "전문적 지식과 경험을 토대로 설명드리겠습니다."
                    ),
                    '설명적': (
                        "명확하고 상세하게 설명드리겠습니다."
                    ),
                    '친근적': (
                        "친근하고 편안한 마음으로 답변드리겠습니다."
                    ),
                    '창의적': (
                        "창의적이고 혁신적인 관점에서 접근해보겠습니다."
                    ),
                    '직설적': (
                        "핵심만 명확하게 말씀드리겠습니다."
                    ),
                    '핵심요약': (
                        "핵심만 요약해 말씀드리겠습니다."
                    ),
                    '실제대화': (
                        "실제 대화처럼 자연스럽게 답변드리겠습니다."
                    )
                }
            },
            'Claude-3': {
                'model_name': 'Claude-3',
                'capabilities': ['객관적 분석', '정확한 정보', '안전성'],
                'strengths': ['신뢰성', '정확성', '안전성'],
                'weaknesses': ['창의성 부족', '제한적 접근'],
                'style_templates': {
                    '논리': "객관적 사실을 바탕으로 분석해보겠습니다.",
                    '공감': "이해와 공감을 바탕으로 답변드리겠습니다.",
                    '권위': "전문적 관점에서 설명드리겠습니다.",
                    '설명적': "정확하고 상세하게 설명드리겠습니다.",
                    '친근적': "편안한 마음으로 답변드리겠습니다.",
                    '창의적': "새로운 관점에서 접근해보겠습니다.",
                    '직설적': "핵심만 명확하게 말씀드리겠습니다.",
                    '핵심요약': "핵심만 요약해 말씀드리겠습니다.",
                    '실제대화': "실제 대화처럼 자연스럽게 답변드리겠습니다."
                }
            },
            'Gemini': {
                'model_name': 'Gemini',
                'capabilities': ['실용적 해결책', '구체적 제안', '효율성'],
                'strengths': ['실용성', '구체성', '효율성'],
                'weaknesses': ['창의성 부족', '감정적 이해 부족'],
                'style_templates': {
                    '논리': "실용적 관점에서 분석해보겠습니다.",
                    '공감': "실용적 관점에서 답변드리겠습니다.",
                    '권위': "구체적 경험을 바탕으로 설명드리겠습니다.",
                    '설명적': "구체적이고 실용적으로 설명드리겠습니다.",
                    '친근적': "실용적 관점에서 답변드리겠습니다.",
                    '창의적': "실용적 관점에서 접근해보겠습니다.",
                    '직설적': "핵심만 명확하게 말씀드리겠습니다.",
                    '핵심요약': "핵심만 요약해 말씀드리겠습니다.",
                    '실제대화': "실제 대화처럼 자연스럽게 답변드리겠습니다."
                }
            },
            'Custom-Korean': {
                'model_name': 'Custom-Korean',
                'capabilities': ['한국어 특화', '문화적 이해', '맥락 인식'],
                'strengths': ['한국어 자연스러움', '문화적 맥락 이해'],
                'weaknesses': ['복잡한 분석 부족', '제한적 데이터'],
                'style_templates': {
                    '논리': "우리 문화에 맞게 분석해보겠습니다.",
                    '공감': "우리 문화에 맞게 답변드리겠습니다.",
                    '권위': "우리 문화에 맞게 설명드리겠습니다.",
                    '설명적': "우리 문화에 맞게 설명드리겠습니다.",
                    '친근적': "우리 문화에 맞게 답변드리겠습니다.",
                    '창의적': "우리 문화에 맞게 접근해보겠습니다.",
                    '직설적': "핵심만 명확하게 말씀드리겠습니다.",
                    '핵심요약': "핵심만 요약해 말씀드리겠습니다.",
                    '실제대화': "실제 대화처럼 자연스럽게 답변드리겠습니다."
                }
            }
        }
        
        # 실제 대화 분석기 초기화
        self.conversation_analyzer = ConversationAnalyzer()
        self._load_real_conversations()
    
    def _load_real_conversations(self):
        """실제 카카오톡 대화 파일 로드"""
        chat_rooms_dir = "chat_rooms"
        if os.path.exists(chat_rooms_dir):
            for root, dirs, files in os.walk(chat_rooms_dir):
                for file in files:
                    if file.endswith('.txt'):
                        file_path = os.path.join(root, file)
                        logger.info(f"대화 파일 분석 중: {file_path}")
                        self.conversation_analyzer.analyze_chat_file(file_path)
    
    def generate_message(
        self,
        context: str,
        style: str,
        model_name: str,
        emotion_context: Optional[str] = None,
        recent_messages: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """고도화된 메시지 생성"""
        if model_name not in self.models:
            model_name = 'GPT-4'
        
        model_info = self.models[model_name]
        
        # 실제 대화 스타일 처리
        if style == '실제대화':
            return self._generate_real_conversation_style(context, recent_messages, model_info)
        
        # 친구같이 스타일 처리
        if style == '친구같이':
            return self._generate_friend_style(context, recent_messages, model_info)
        
        # 조언자 스타일 처리
        if style == '조언자':
            return self._generate_advisor_style(context, recent_messages, model_info)
        
        # 동료 스타일 처리
        if style == '동료':
            return self._generate_colleague_style(context, recent_messages, model_info)
        
        # 감정적 스타일 처리
        if style == '감정적':
            return self._generate_emotional_style(context, recent_messages, model_info)
        
        # 1. 최근 대화 흐름 분석
        summary = ""
        if recent_messages:
            # 최근 메시지에서 핵심 질문/이슈/의견 추출
            questions = [
                m['content'] for m in recent_messages
                if any(q in m['content'] for q in [
                    '?', '궁금', '문의', '언제', '어떻게', '왜', '무엇'
                ])
            ]
            opinions = [
                m['content'] for m in recent_messages
                if not any(q in m['content'] for q in [
                    '?', '궁금', '문의', '언제', '어떻게', '왜', '무엇'
                ])
            ]
            if questions:
                summary += (
                    "주요 질문: " + ", ".join(questions) + ". "
                )
            if opinions:
                summary += (
                    "주요 의견: " + ", ".join(opinions) + ". "
                )
        
        # 2. 기존 스타일별 메시지 생성
        style_messages = {
            '공감': "공감적이고 이해하는 톤으로 답변드리겠습니다.",
            '논리': "논리적 분석을 바탕으로 객관적으로 답변드리겠습니다.",
            '권위': "전문적 지식을 바탕으로 권위있게 답변드리겠습니다.",
            '설명적': "자세한 설명과 함께 답변드리겠습니다.",
            '친근적': "친근하고 편안한 톤으로 답변드리겠습니다.",
            '직설적': "직설적이고 명확하게 답변드리겠습니다.",
            '핵심요약': "핵심만 간단히 요약해서 답변드리겠습니다.",
            '실제대화': "실제 카카오톡 대화처럼 자연스럽게 답변드리겠습니다.",
            '감정적': "감정을 담아서 공감적으로 답변드리겠습니다.",
            '전문적': "전문적 관점에서 분석하여 답변드리겠습니다.",
            '친구같이': "친구처럼 편하게 대화하듯 답변드리겠습니다.",
            '조언자': "조언자의 입장에서 도움을 드리겠습니다.",
            '동료': "동료처럼 함께 고민하고 해결책을 찾아보겠습니다."
        }
        
        base_message = style_messages.get(style, "답변드리겠습니다.")
        
        # 3. 직설적/핵심요약 스타일이면 summary(문맥 요약) + original_message를 조합
        if style in ['직설적', '핵심요약'] and summary:
            final_message = (
                f"{summary.strip()} {context} {base_message}"
            )
        else:
            final_message = f"{context} {base_message}"
        
        # 4. 품질 향상 처리(기존 로직 활용)
        final_message = self._improve_korean_expression(final_message)
        
        # 5. 맥락에 맞는 접두사 추가(예시)
        if context and ("건설" in context or "부동산" in context):
            final_message = (
                f"건설 현장 관점에서 {final_message}"
            )
        elif context and "투자" in context:
            final_message = (
                f"투자 관점에서 {final_message}"
            )
        else:
            final_message = (
                f"객관적으로 {final_message}"
            )
        
        # 6. 중복 표현 제거
        final_message = final_message.replace(
            "이는 다음과 같은 이유 때문입니다.", ""
        )
        final_message = final_message.replace(
            "이는 학습을 통해 개선된 응답입니다.", ""
        )
        final_message = final_message.replace("  ", " ")
        final_message = final_message.strip()
        
        # 실제 대화 스타일인 경우 추가 정리
        if style == '실제대화':
            final_message = final_message.replace(
                "객관적으로 ", ""
            )
            final_message = final_message.replace(
                "GPT-4 ", ""
            )
            final_message = final_message.replace(
                "답변드리겠습니다.", ""
            )
            final_message = final_message.replace("  ", " ")
            final_message = final_message.strip()
        
        # 모든 스타일에 대해 중복 표현 제거
        final_message = final_message.replace(
            "이는 다음과 같은 이유 때문입니다.", ""
        )
        final_message = final_message.replace(
            "이는 학습을 통해 개선된 응답입니다.", ""
        )
        final_message = final_message.replace("  ", " ")
        final_message = final_message.strip()
        
        # 감정적 스타일인 경우 추가 정리
        if style == '감정적':
            final_message = final_message.replace(
                "객관적으로 ", ""
            )
            final_message = final_message.replace(
                "GPT-4 ", ""
            )
            final_message = final_message.replace(
                "답변드리겠습니다.", ""
            )
            final_message = final_message.replace("  ", " ")
            final_message = final_message.strip()
        
        return final_message
    
    def _generate_real_conversation_style(self, context: str, recent_messages: Optional[List[Dict[str, Any]]], model_info: Dict[str, Any]) -> str:
        """실제 카카오톡 대화 스타일로 메시지 생성"""
        if not recent_messages:
            # 최근 메시지가 없는 경우 기본 응답
            return "알겠어요"
        
        # 실제 우성7차 대화 패턴 분석
        last_message = recent_messages[-1]['content'] if recent_messages else context
        
        # 실제 대화에서 나타나는 패턴들
        if any(word in last_message for word in ['궁금', '어떻게', '언제', '어디', '왜', '?']):
            # 질문에 대한 응답
            responses = [
                "그 부분은 이렇게 될 것 같아요",
                "아마 그럴 것 같아요",
                "그런 것 같아요",
                "그렇다고 하네요",
                "그런 것 같습니다",
                "그런 것 같아요 ㅎ",
                "그런 것 같습니다 ㅎ",
                "그런 것 같아요 ^^",
                "그런 것 같습니다 ^^"
            ]
            return random.choice(responses)
        
        elif any(word in last_message for word in ['맞다', '좋다', '동감', '그래', '응', '네', '좋아', '괜찮아']):
            # 동의 표현에 대한 응답
            responses = [
                "저도 동감합니다!",
                "맞습니다",
                "저도 그렇게 생각해요",
                "동감합니다",
                "저도 동감합니다 ㅎ",
                "맞습니다 ㅎ",
                "저도 그렇게 생각해요 ^^",
                "동감합니다 ^^"
            ]
            return random.choice(responses)
        
        elif any(word in last_message for word in ['아니', '그렇지 않', '틀렸', '반대', '싫어', '안 좋']):
            # 반대 표현에 대한 응답
            responses = [
                "그런 부분도 있겠네요",
                "그런 생각도 들 수 있겠어요",
                "그런 면도 있겠네요",
                "그런 부분도 있겠어요",
                "그런 생각도 들 수 있겠네요 ㅎ",
                "그런 면도 있겠어요 ㅎ"
            ]
            return random.choice(responses)
        
        elif any(word in last_message for word in ['ㅎ', 'ㅋ', '^^', 'ㅠ', 'ㅜ', 'ㅡ', 'ㅇ', '!']):
            # 감정 표현이 있는 경우
            responses = [
                "ㅎㅎ",
                "^^",
                "ㅋㅋ",
                "그렇네요 ㅎ",
                "맞아요 ^^",
                "그런 것 같아요 ㅋ",
                "그렇네요 ^^",
                "맞아요 ㅎ"
            ]
            return random.choice(responses)
        
        elif any(word in last_message for word in ['재개발', '재건축', '분양', '시세', '가격', '환급', '분담금']):
            # 부동산 관련 전문적 응답
            responses = [
                "그런 부분이 중요하겠네요",
                "그런 고려사항이 있겠어요",
                "그런 점을 생각해봐야겠네요",
                "그런 부분이 있겠어요",
                "그런 고려사항이 있겠네요 ㅎ",
                "그런 점을 생각해봐야겠어요 ^^"
            ]
            return random.choice(responses)
        
        else:
            # 일반적인 응답
            responses = [
                "알겠어요",
                "그렇네요",
                "그런 것 같아요",
                "그렇습니다",
                "알겠어요 ㅎ",
                "그렇네요 ^^",
                "그런 것 같아요 ㅎ",
                "그렇습니다 ^^"
            ]
            return random.choice(responses)
    
    def _generate_kakao_message_format(self, content: str, user_id: str = "AI") -> str:
        """카카오톡 메시지 형식으로 변환"""
        from datetime import datetime
        
        # 현재 시간을 카카오톡 형식으로 변환
        now = datetime.now()
        time_str = now.strftime("%Y년 %m월 %d일 %p %I:%M")
        time_str = time_str.replace("AM", "오전").replace("PM", "오후")
        
        # 카카오톡 메시지 형식: "시간, 사용자ID : 메시지내용"
        return f"{time_str}, {user_id} : {content}"
    
    def _generate_realistic_kakao_response(self, context: str, recent_messages: Optional[List[Dict[str, Any]]]) -> str:
        """실제 카카오톡과 유사한 응답 생성"""
        if not recent_messages:
            return self._generate_kakao_message_format("알겠어요")
        
        last_message = recent_messages[-1]['content']
        last_user_id = recent_messages[-1].get('user_id', 'unknown')
        
        # 실제 대화 패턴에 따른 응답 생성
        response_content = self._generate_real_conversation_style(context, recent_messages, {})
        
        # 카카오톡 형식으로 변환
        return self._generate_kakao_message_format(response_content, "AI_Assistant")
    
    def _improve_korean_expression(self, message: str) -> str:
        """한국어 표현 개선"""
        # 반복되는 표현 제거
        message = message.replace("신속한 처리가 필요한 사항으로", "")
        message = message.replace("이는 심층적 분석을 통해 도출된 결과입니다.", "")
        message = message.replace("창의적 관점에서 새로운 해결책을 제시하겠습니다.", "")
        message = message.replace("감정적 맥락을 고려한 응답입니다.", "")
        message = message.replace("이는 다음과 같은 이유 때문입니다.", "")
        message = message.replace("이는 학습을 통해 개선된 응답입니다.", "")
        
        # 중복된 표현 제거
        message = message.replace("논리적 분석을 바탕으로 객관적으로", "논리적 분석을 바탕으로")
        message = message.replace("객관적으로 논리적 분석을 바탕으로", "논리적 분석을 바탕으로")
        
        # 자연스러운 연결어 추가
        if "에 대해" in message and "답변드리겠습니다" in message:
            message = message.replace("에 대해", "에 대해 ")
        
        # 문장 끝 정리
        message = message.replace("  ", " ")
        message = message.replace(" .", ".")
        message = message.replace(" ,", ",")
        
        return message.strip()
    
    def _generate_friend_style(self, context: str, recent_messages: Optional[List[Dict[str, Any]]], model_info: Dict[str, Any]) -> str:
        """친구같이 스타일로 메시지 생성"""
        friend_patterns = [
            "야, 그거 진짜 그렇더라",
            "맞아 맞아, 나도 그렇게 생각해",
            "아 진짜? 그런가?",
            "오, 그거 좋은데?",
            "음... 그런 것 같아",
            "아, 그거 어려울 것 같은데?",
            "진짜? 나도 궁금했어",
            "그래? 나는 좀 다르게 생각하는데",
            "오케이, 알겠어",
            "응, 그럴 수 있지"
        ]
        
        # 감정 표현
        emotion_patterns = [
            "ㅎㅎ",
            "ㅋㅋ",
            "^^",
            "ㅠㅠ"
        ]
        
        response = random.choice(friend_patterns)
        
        # 감정 표현 추가 (40% 확률)
        if random.random() < 0.4:
            response += " " + random.choice(emotion_patterns)
        
        return response
    
    def _generate_advisor_style(self, context: str, recent_messages: Optional[List[Dict[str, Any]]], model_info: Dict[str, Any]) -> str:
        """조언자 스타일로 메시지 생성"""
        advisor_patterns = [
            "제가 조언드리자면...",
            "이런 방법은 어떨까요?",
            "참고로 말씀드리면...",
            "제 경험상으로는...",
            "한 가지 제안드리고 싶은데...",
            "이런 관점에서 보시면...",
            "조금 다른 각도에서 생각해보시면...",
            "제가 생각하기에는...",
            "이런 접근 방법도 있어요",
            "참고하실 만한 점은..."
        ]
        
        return random.choice(advisor_patterns)
    
    def _generate_colleague_style(self, context: str, recent_messages: Optional[List[Dict[str, Any]]], model_info: Dict[str, Any]) -> str:
        """동료 스타일로 메시지 생성"""
        colleague_patterns = [
            "우리 함께 해결해보죠",
            "같이 고민해봅시다",
            "함께 찾아보면 좋을 것 같아요",
            "우리 팀워크로 해결해보죠",
            "같이 검토해보시죠",
            "함께 분석해보면 어떨까요?",
            "우리 같이 생각해봅시다",
            "같이 확인해보죠",
            "함께 점검해보시죠",
            "우리 같이 해결책을 찾아봅시다"
        ]
        
        return random.choice(colleague_patterns)
    
    def _generate_emotional_style(self, context: str, recent_messages: Optional[List[Dict[str, Any]]], model_info: Dict[str, Any]) -> str:
        """감정적 스타일로 메시지 생성"""
        # 실제 메시지 내용 분석
        message_content = context.lower()
        
        # 부정적 감정 키워드
        negative_keywords = ['불만', '화나', '짜증', '힘들', '싫어', '안 좋', '틀렸', '반대', '문제', '어려워']
        # 긍정적 감정 키워드
        positive_keywords = ['좋아', '행복', '기쁘', '만족', '감사', '축하', '성공', '완료', '해결']
        
        # 감정 방향 판단
        if any(keyword in message_content for keyword in negative_keywords):
            emotional_patterns = [
                "정말 이해해요...",
                "그런 마음이 느껴져요",
                "정말 힘드셨겠어요",
                "걱정되시겠어요",
                "안타깝네요...",
                "이해해요 ㅠㅠ",
                "힘드시겠어요 ㅠㅠ",
                "걱정되시겠어요 ㅠㅠ",
                "안타깝네요... ㅠㅠ"
            ]
        elif any(keyword in message_content for keyword in positive_keywords):
            emotional_patterns = [
                "정말 좋겠어요!",
                "기뻐요 ^^",
                "행복하시겠어요",
                "축하드려요!",
                "정말 좋겠어요 ^^",
                "기뻐요! ^^",
                "행복하시겠어요 ^^",
                "축하드려요! ^^"
            ]
        else:
            # 중립적 감정적 응답
            emotional_patterns = [
                "그런 기분이 드시겠어요",
                "이해해요",
                "그런 것 같아요",
                "그런 기분이 드시겠어요 ㅎㅎ",
                "이해해요 ㅎㅎ",
                "그런 것 같아요 ^^"
            ]
        
        return random.choice(emotional_patterns)

# 감정 분석 엔진
class EmotionAnalysisEngine:
    def __init__(self):
        self.emotion_keywords = {
            '분노': ['화나다', '짜증', '열받다', '분노', '화가', '격분', '노여움'],
            '슬픔': ['슬프다', '우울', '절망', '상심', '비통', '애통', '슬픔'],
            '두려움': ['무섭다', '겁나다', '불안', '공포', '걱정', '근심', '두려움'],
            '기쁨': ['기쁘다', '행복', '즐겁다', '신나다', '환희', '기쁨', '즐거움'],
            '놀람': ['놀랐다', '깜짝', '충격', '놀람', '경악', '당황', '놀라움'],
            '중립': ['그렇다', '알겠다', '네', '응', '중립', '평온']
        }
        self.context_emotions = {
            '건설': ['논리적', '체계적', '실용적'],
            '투자': ['신중', '분석적', '전략적'],
            '갈등': ['공감적', '이해', '조정'],
            '정보': ['객관적', '정확', '명확'],
            '승인': ['긍정적', '지지', '동의'],
            '반대': ['설명적', '이해', '대안']
        }
        self.emotion_intensity_indicators = {
            '매우강함': ['!!!', '??', 'ㅠㅠ', 'ㅋㅋㅋ', 'ㅎㅎㅎ'],
            '강함': ['!', '?', 'ㅠ', 'ㅋㅋ', 'ㅎㅎ'],
            '보통': ['.', '~', 'ㅋ', 'ㅎ'],
            '약함': ['', ' ', '\n']
        }

    def analyze_emotion(self, text: str) -> Dict[str, Any]:
        """다층 감정 분석"""
        # 1. 기본 감정 분석
        primary_emotion = self._analyze_primary_emotion(text)
        
        # 2. 감정 강도 분석
        intensity = self._analyze_emotion_intensity(text)
        
        # 3. 맥락 감정 분석
        context_emotion = self._analyze_context_emotion(text)
        
        # 4. 감정 변화 추적
        emotion_trend = self._analyze_emotion_trend(text)
        
        # 5. 복합 감정 분석
        complex_emotions = self._analyze_complex_emotions(text)
        
        # 6. 감정 신뢰도 계산
        confidence = self._calculate_emotion_confidence(text, primary_emotion)
        
        return {
            'primary_emotion': primary_emotion,
            'intensity': intensity,
            'context_emotion': context_emotion,
            'emotion_trend': emotion_trend,
            'complex_emotions': complex_emotions,
            'confidence': confidence,
            'emotion_keywords': self._extract_emotion_keywords(text),
            'sentiment_score': self._calculate_sentiment_score(text),
            'emotional_context': self._analyze_emotional_context(text)
        }
    
    def _analyze_primary_emotion(self, text: str) -> str:
        """주요 감정 분석"""
        emotion_scores = {}
        for emotion, keywords in self.emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text)
            emotion_scores[emotion] = score
        
        if not any(emotion_scores.values()):
            return '중립'
        
        return max(emotion_scores, key=emotion_scores.get)
    
    def _analyze_emotion_intensity(self, text: str) -> float:
        """감정 강도 분석"""
        intensity_score = 0.0
        
        # 문장 부호 분석
        for intensity, indicators in self.emotion_intensity_indicators.items():
            for indicator in indicators:
                if indicator in text:
                    if intensity == '매우강함':
                        intensity_score += 0.8
                    elif intensity == '강함':
                        intensity_score += 0.6
                    elif intensity == '보통':
                        intensity_score += 0.4
                    elif intensity == '약함':
                        intensity_score += 0.2
        
        # 대문자 사용 분석
        uppercase_ratio = sum(1 for char in text if char.isupper()) / len(text) if text else 0
        intensity_score += uppercase_ratio * 0.3
        
        # 반복 문자 분석
        repeated_chars = sum(1 for i in range(len(text)-1) if text[i] == text[i+1])
        intensity_score += min(repeated_chars * 0.1, 0.5)
        
        return min(intensity_score, 1.0)
    
    def _analyze_context_emotion(self, text: str) -> str:
        """맥락 감정 분석"""
        # 맥락별 감정 키워드 분석
        context_scores = {}
        for context, keywords in self.context_emotions.items():
            score = sum(1 for keyword in keywords if keyword in text)
            context_scores[context] = score
        
        if not any(context_scores.values()):
            return '일반'
        
        return max(context_scores, key=context_scores.get)
    
    def _analyze_emotion_trend(self, text: str) -> str:
        """감정 변화 추적"""
        # 시간적 표현 분석
        time_indicators = {
            '상승': ['점점', '갈수록', '더욱', '증가'],
            '하락': ['줄어들다', '감소', '적어지다', '떨어지다'],
            '안정': ['그대로', '유지', '변화없다', '일정']
        }
        
        for trend, indicators in time_indicators.items():
            if any(indicator in text for indicator in indicators):
                return trend
        
        return '안정'
    
    def _analyze_complex_emotions(self, text: str) -> List[str]:
        """복합 감정 분석"""
        complex_emotions = []
        
        # 감정 조합 패턴 분석
        emotion_combinations = [
            ('기쁨', '놀람', '기쁜놀람'),
            ('슬픔', '분노', '슬픈분노'),
            ('두려움', '놀람', '두려운놀람'),
            ('기쁨', '슬픔', '희비교차')
        ]
        
        for emotion1, emotion2, complex_name in emotion_combinations:
            if (any(keyword in text for keyword in self.emotion_keywords[emotion1]) and
                any(keyword in text for keyword in self.emotion_keywords[emotion2])):
                complex_emotions.append(complex_name)
        
        return complex_emotions
    
    def _calculate_emotion_confidence(self, text: str, primary_emotion: str) -> float:
        """감정 분석 신뢰도 계산"""
        # 키워드 매칭률
        keyword_matches = sum(1 for keyword in self.emotion_keywords[primary_emotion] if keyword in text)
        keyword_confidence = min(keyword_matches / len(self.emotion_keywords[primary_emotion]), 1.0)
        
        # 문장 길이에 따른 신뢰도 조정
        length_factor = min(len(text) / 50, 1.0)
        
        # 감정 강도에 따른 신뢰도 조정
        intensity_factor = self._analyze_emotion_intensity(text)
        
        return (keyword_confidence * 0.5 + length_factor * 0.3 + intensity_factor * 0.2)
    
    def _extract_emotion_keywords(self, text: str) -> List[str]:
        """감정 키워드 추출"""
        found_keywords = []
        for emotion, keywords in self.emotion_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    found_keywords.append(keyword)
        return found_keywords
    
    def _calculate_sentiment_score(self, text: str) -> float:
        """감정 점수 계산 (-1.0 ~ 1.0)"""
        positive_keywords = self.emotion_keywords['기쁨'] + self.emotion_keywords['놀람']
        negative_keywords = self.emotion_keywords['분노'] + self.emotion_keywords['슬픔'] + self.emotion_keywords['두려움']
        
        positive_count = sum(1 for keyword in positive_keywords if keyword in text)
        negative_count = sum(1 for keyword in negative_keywords if keyword in text)
        
        total_count = positive_count + negative_count
        if total_count == 0:
            return 0.0
        
        return (positive_count - negative_count) / total_count
    
    def _analyze_emotional_context(self, text: str) -> Dict[str, Any]:
        """감정적 맥락 분석"""
        return {
            'urgency_level': self._analyze_urgency(text),
            'formality_level': self._analyze_formality(text),
            'emotional_distance': self._analyze_emotional_distance(text),
            'communication_style': self._analyze_communication_style(text)
        }
    
    def _analyze_urgency(self, text: str) -> str:
        """긴급도 분석"""
        urgency_indicators = {
            '매우긴급': ['즉시', '당장', '지금', '바로', '!!!'],
            '긴급': ['빨리', '서둘러', '급하다', '!'],
            '보통': ['', '~', '.'],
            '여유': ['천천히', '차근차근', '여유롭게']
        }
        
        for level, indicators in urgency_indicators.items():
            if any(indicator in text for indicator in indicators):
                return level
        
        return '보통'
    
    def _analyze_formality(self, text: str) -> str:
        """격식도 분석"""
        formal_indicators = ['습니다', '니다', '입니다', '하겠습니다']
        informal_indicators = ['야', '어', '다', '해', 'ㅋ', 'ㅎ']
        
        formal_count = sum(1 for indicator in formal_indicators if indicator in text)
        informal_count = sum(1 for indicator in informal_indicators if indicator in text)
        
        if formal_count > informal_count:
            return '격식'
        elif informal_count > formal_count:
            return '친근'
        else:
            return '중간'
    
    def _analyze_emotional_distance(self, text: str) -> str:
        """감정적 거리 분석"""
        close_indicators = ['우리', '함께', '같이', '친구', '가족']
        distant_indicators = ['귀하', '당신', '그쪽', '상대방']
        
        close_count = sum(1 for indicator in close_indicators if indicator in text)
        distant_count = sum(1 for indicator in distant_indicators if indicator in text)
        
        if close_count > distant_count:
            return '가까움'
        elif distant_count > close_count:
            return '멀음'
        else:
            return '중간'
    
    def _analyze_communication_style(self, text: str) -> str:
        """의사소통 스타일 분석"""
        styles = {
            '직설적': ['직접', '명확', '분명'],
            '우회적': ['간접', '암시', '넌지시'],
            '설명적': ['설명', '이유', '근거'],
            '감정적': ['느낌', '마음', '감정']
        }
        
        style_scores = {}
        for style, keywords in styles.items():
            score = sum(1 for keyword in keywords if keyword in text)
            style_scores[style] = score
        
        if not any(style_scores.values()):
            return '일반'
        
        return max(style_scores, key=style_scores.get)

# 개인화 엔진
class PersonalizationEngine:
    def __init__(self):
        self.user_profiles = {}
        self.communication_patterns = {
            '직설적': ['명확', '직접', '분명', '확실'],
            '우회적': ['간접', '암시', '넌지시', '둘러서'],
            '설명적': ['설명', '이유', '근거', '상세'],
            '감정적': ['느낌', '마음', '감정', '공감'],
            '논리적': ['논리', '분석', '체계', '구조'],
            '창의적': ['새로운', '혁신', '창의', '독특']
        }
        self.tone_preferences = {
            '격식': ['습니다', '니다', '입니다', '하겠습니다'],
            '친근': ['야', '어', '다', '해', '~'],
            '중간': ['요', '네', '어요', '해요'],
            '전문': ['전문용어', '기술적', '정확', '정밀']
        }
        self.response_speed_patterns = {
            '즉시': ['바로', '지금', '당장', '즉시'],
            '빠름': ['빨리', '서둘러', '급하다', '신속'],
            '보통': ['', '~', '.', '일반'],
            '여유': ['천천히', '차근차근', '여유롭게', '충분히']
        }

    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """다차원 사용자 프로필 조회"""
        try:
            conn = sqlite3.connect('advanced_message_system.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT communication_style, preferred_tone, response_speed,
                       formality_level, emotion_sensitivity, learning_pattern,
                       created_at, updated_at
                FROM user_profiles 
                WHERE user_id = ?
            ''', (user_id,))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return {
                    'user_id': user_id,
                    'communication_style': result[0],
                    'preferred_tone': result[1],
                    'response_speed': result[2],
                    'formality_level': result[3],
                    'emotion_sensitivity': result[4],
                    'learning_pattern': result[5],
                    'created_at': result[6],
                    'updated_at': result[7],
                    'interaction_history': self._get_interaction_history(user_id),
                    'preference_analysis': self._analyze_preferences(user_id),
                    'behavioral_patterns': self._analyze_behavioral_patterns(user_id)
                }
            else:
                return self._create_default_profile(user_id)
                
        except Exception as e:
            logger.error(f"사용자 프로필 조회 오류: {e}")
            return self._create_default_profile(user_id)
    
    def _create_default_profile(self, user_id: str) -> Dict[str, Any]:
        """기본 프로필 생성"""
        return {
            'user_id': user_id,
            'communication_style': '설명적',
            'preferred_tone': '중간',
            'response_speed': '보통',
            'formality_level': '중간',
            'emotion_sensitivity': 0.5,
            'learning_pattern': '적응형',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'interaction_history': [],
            'preference_analysis': {},
            'behavioral_patterns': {}
        }
    
    def _get_interaction_history(self, user_id: str) -> List[Dict[str, Any]]:
        """상호작용 히스토리 조회"""
        try:
            conn = sqlite3.connect('advanced_message_system.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT message_id, original_message, generated_message,
                       emotion_analysis, personalization_score, created_at
                FROM advanced_messages 
                WHERE user_id = ?
                ORDER BY created_at DESC 
                LIMIT 20
            ''', (user_id,))
            
            history = []
            for row in cursor.fetchall():
                history.append({
                    'message_id': row[0],
                    'original_message': row[1],
                    'generated_message': row[2],
                    'emotion_analysis': json.loads(row[3]) if row[3] else {},
                    'personalization_score': row[4],
                    'created_at': row[5]
                })
            
            conn.close()
            return history
            
        except Exception as e:
            logger.error(f"상호작용 히스토리 조회 오류: {e}")
            return []
    
    def _analyze_preferences(self, user_id: str) -> Dict[str, Any]:
        """사용자 선호도 분석"""
        history = self._get_interaction_history(user_id)
        
        if not history:
            return {}
        
        # 감정 선호도 분석
        emotion_preferences = {}
        for interaction in history:
            emotion = interaction.get('emotion_analysis', {}).get('primary_emotion', '중립')
            emotion_preferences[emotion] = emotion_preferences.get(emotion, 0) + 1
        
        # 메시지 길이 선호도 분석
        length_preferences = []
        for interaction in history:
            length = len(interaction.get('generated_message', ''))
            if length < 50:
                length_preferences.append('짧음')
            elif length < 150:
                length_preferences.append('중간')
            else:
                length_preferences.append('길음')
        
        # 개인화 점수 트렌드 분석
        personalization_scores = [interaction.get('personalization_score', 0) for interaction in history]
        
        return {
            'emotion_preferences': emotion_preferences,
            'length_preferences': {
                '짧음': length_preferences.count('짧음'),
                '중간': length_preferences.count('중간'),
                '길음': length_preferences.count('길음')
            },
            'personalization_trend': {
                'average': sum(personalization_scores) / len(personalization_scores) if personalization_scores else 0,
                'trend': '상승' if len(personalization_scores) > 1 and personalization_scores[-1] > personalization_scores[0] else '하락'
            }
        }
    
    def _analyze_behavioral_patterns(self, user_id: str) -> Dict[str, Any]:
        """행동 패턴 분석"""
        history = self._get_interaction_history(user_id)
        
        if not history:
            return {}
        
        # 시간대별 활동 패턴
        time_patterns = {}
        for interaction in history:
            try:
                created_time = datetime.fromisoformat(interaction['created_at'])
                hour = created_time.hour
                time_slot = f"{hour:02d}:00-{(hour+1):02d}:00"
                time_patterns[time_slot] = time_patterns.get(time_slot, 0) + 1
            except:
                continue
        
        # 감정 변화 패턴
        emotion_changes = []
        for i in range(1, len(history)):
            prev_emotion = history[i-1].get('emotion_analysis', {}).get('primary_emotion', '중립')
            curr_emotion = history[i].get('emotion_analysis', {}).get('primary_emotion', '중립')
            if prev_emotion != curr_emotion:
                emotion_changes.append(f"{prev_emotion}→{curr_emotion}")
        
        # 응답 시간 패턴
        response_times = []
        for i in range(1, len(history)):
            try:
                prev_time = datetime.fromisoformat(history[i-1]['created_at'])
                curr_time = datetime.fromisoformat(history[i]['created_at'])
                response_time = (curr_time - prev_time).total_seconds() / 60  # 분 단위
                response_times.append(response_time)
            except:
                continue
        
        return {
            'time_patterns': time_patterns,
            'emotion_changes': emotion_changes,
            'response_times': {
                'average': sum(response_times) / len(response_times) if response_times else 0,
                'fastest': min(response_times) if response_times else 0,
                'slowest': max(response_times) if response_times else 0
            }
        }
    
    def personalize_message(self, message: str, user_profile: Dict[str, Any]) -> str:
        """다차원 개인화 메시지 생성"""
        personalized_message = message
        
        # 1. 의사소통 스타일 적용
        communication_style = user_profile.get('communication_style', '설명적')
        personalized_message = self._apply_communication_style(personalized_message, communication_style)
        
        # 2. 톤 선호도 적용
        preferred_tone = user_profile.get('preferred_tone', '중간')
        personalized_message = self._apply_tone_preference(personalized_message, preferred_tone)
        
        # 3. 응답 속도 적용
        response_speed = user_profile.get('response_speed', '보통')
        personalized_message = self._apply_response_speed(personalized_message, response_speed)
        
        # 4. 격식도 적용
        formality_level = user_profile.get('formality_level', '중간')
        personalized_message = self._apply_formality_level(personalized_message, formality_level)
        
        # 5. 감정 민감도 적용
        emotion_sensitivity = user_profile.get('emotion_sensitivity', 0.5)
        personalized_message = self._apply_emotion_sensitivity(personalized_message, emotion_sensitivity)
        
        # 6. 학습 패턴 적용
        learning_pattern = user_profile.get('learning_pattern', '적응형')
        personalized_message = self._apply_learning_pattern(personalized_message, learning_pattern)
        
        # 7. 선호도 기반 조정
        preferences = user_profile.get('preference_analysis', {})
        personalized_message = self._apply_preferences(personalized_message, preferences)
        
        return personalized_message
    
    def _apply_communication_style(self, message: str, style: str) -> str:
        """의사소통 스타일 적용"""
        style_modifiers = {
            '직설적': lambda msg: msg.replace('~것 같습니다', '입니다').replace('~할 수 있습니다', '합니다'),
            '우회적': lambda msg: msg.replace('합니다', '할 수 있습니다').replace('입니다', '것 같습니다'),
            '설명적': lambda msg: msg + " 이는 다음과 같은 이유 때문입니다.",
            '감정적': lambda msg: msg.replace('합니다', '해요').replace('입니다', '이에요'),
            '논리적': lambda msg: msg + " 이는 논리적으로 다음과 같은 근거를 가집니다.",
            '창의적': lambda msg: msg.replace('합니다', '해봅니다').replace('입니다', '이에요')
        }
        
        modifier = style_modifiers.get(style, lambda msg: msg)
        return modifier(message)
    
    def _apply_tone_preference(self, message: str, tone: str) -> str:
        """톤 선호도 적용"""
        tone_modifiers = {
            '격식': lambda msg: msg.replace('해요', '합니다').replace('이에요', '입니다'),
            '친근': lambda msg: msg.replace('합니다', '해요').replace('입니다', '이에요'),
            '중간': lambda msg: msg,
            '전문': lambda msg: msg + " 이는 전문적인 관점에서 분석한 결과입니다."
        }
        
        modifier = tone_modifiers.get(tone, lambda msg: msg)
        return modifier(message)
    
    def _apply_response_speed(self, message: str, speed: str) -> str:
        """응답 속도 적용"""
        speed_modifiers = {
            '즉시': lambda msg: "즉시 " + msg,
            '빠름': lambda msg: "빠르게 " + msg,
            '보통': lambda msg: msg,
            '여유': lambda msg: "차근차근 " + msg
        }
        
        modifier = speed_modifiers.get(speed, lambda msg: msg)
        return modifier(message)
    
    def _apply_formality_level(self, message: str, level: str) -> str:
        """격식도 적용"""
        formality_modifiers = {
            '격식': lambda msg: msg.replace('~', '').replace('ㅋ', '').replace('ㅎ', ''),
            '친근': lambda msg: msg + "~",
            '중간': lambda msg: msg,
            '전문': lambda msg: msg.replace('~', '').replace('ㅋ', '').replace('ㅎ', '')
        }
        
        modifier = formality_modifiers.get(level, lambda msg: msg)
        return modifier(message)
    
    def _apply_emotion_sensitivity(self, message: str, sensitivity: float) -> str:
        """감정 민감도 적용"""
        if sensitivity > 0.7:
            # 높은 감정 민감도: 더 공감적이고 이해하는 톤
            message = message.replace('합니다', '해요').replace('입니다', '이에요')
            if '이해' not in message:
                message = "이해합니다. " + message
        elif sensitivity < 0.3:
            # 낮은 감정 민감도: 더 객관적이고 논리적인 톤
            message = message.replace('해요', '합니다').replace('이에요', '입니다')
            if '분석' not in message:
                message = "분석해보면 " + message
        
        return message
    
    def _apply_learning_pattern(self, message: str, pattern: str) -> str:
        """학습 패턴 적용"""
        pattern_modifiers = {
            '적응형': lambda msg: msg + " 이는 학습을 통해 개선된 응답입니다.",
            '보수적': lambda msg: msg + " 이는 검증된 방법입니다.",
            '혁신적': lambda msg: msg + " 이는 새로운 접근 방식입니다.",
            '실험적': lambda msg: msg + " 이는 실험적인 제안입니다."
        }
        
        modifier = pattern_modifiers.get(pattern, lambda msg: msg)
        return modifier(message)
    
    def _apply_preferences(self, message: str, preferences: Dict[str, Any]) -> str:
        """선호도 기반 조정"""
        # 감정 선호도 적용
        emotion_prefs = preferences.get('emotion_preferences', {})
        if emotion_prefs:
            most_preferred = max(emotion_prefs.items(), key=lambda x: x[1])[0]
            if most_preferred == '기쁨':
                message = message.replace('합니다', '해요').replace('입니다', '이에요')
            elif most_preferred == '슬픔':
                message = "이해합니다. " + message
        
        # 길이 선호도 적용
        length_prefs = preferences.get('length_preferences', {})
        if length_prefs:
            preferred_length = max(length_prefs.items(), key=lambda x: x[1])[0]
            current_length = len(message)
            
            if preferred_length == '짧음' and current_length > 100:
                # 메시지를 짧게 줄임
                sentences = message.split('.')
                message = '. '.join(sentences[:2]) + '.'
            elif preferred_length == '길음' and current_length < 50:
                # 메시지를 길게 확장
                message += " 추가적인 세부사항과 함께 더 구체적인 방안을 제시하겠습니다."
        
        return message

# 실시간 학습 엔진
class LearningEngine:
    def __init__(self):
        self.learning_patterns = {
            '적응형': {'adaptation_rate': 0.8, 'exploration_rate': 0.2, 'memory_size': 100},
            '보수적': {'adaptation_rate': 0.3, 'exploration_rate': 0.1, 'memory_size': 50},
            '혁신적': {'adaptation_rate': 0.9, 'exploration_rate': 0.4, 'memory_size': 200},
            '실험적': {'adaptation_rate': 0.7, 'exploration_rate': 0.6, 'memory_size': 150}
        }
        self.performance_metrics = {
            'response_quality': [],
            'user_satisfaction': [],
            'adaptation_speed': [],
            'learning_efficiency': []
        }
        self.feedback_history = []
        self.improvement_suggestions = []

    def record_feedback(self, message_id: str, feedback: float, success: bool):
        """고도화된 피드백 기록"""
        feedback_record = {
            'message_id': message_id,
            'feedback_score': feedback,
            'success_indicator': success,
            'timestamp': datetime.now().isoformat(),
            'learning_insights': self._extract_learning_insights(message_id, feedback, success),
            'improvement_areas': self._identify_improvement_areas(message_id, feedback, success),
            'adaptation_recommendations': self._generate_adaptation_recommendations(feedback, success)
        }
        
        self.feedback_history.append(feedback_record)
        
        # 실시간 학습 적용
        self._apply_real_time_learning(feedback_record)
        
        # 성능 메트릭 업데이트
        self._update_performance_metrics(feedback_record)
        
        # 데이터베이스에 저장
        self._save_feedback_to_database(feedback_record)
    
    def _extract_learning_insights(self, message_id: str, feedback: float, success: bool) -> List[str]:
        """학습 인사이트 추출"""
        insights = []
        
        if feedback > 0.8:
            insights.append("사용자 만족도가 높은 응답 패턴 발견")
            insights.append("효과적인 개인화 전략 확인")
        elif feedback < 0.4:
            insights.append("개선이 필요한 응답 패턴 식별")
            insights.append("사용자 선호도 재분석 필요")
        
        if success:
            insights.append("성공적인 문제 해결 접근법 확인")
            insights.append("효과적인 맥락 이해 패턴 발견")
        else:
            insights.append("실패 원인 분석 및 대안 모색 필요")
            insights.append("맥락 이해 개선 필요")
        
        # 피드백 점수별 인사이트
        if feedback > 0.9:
            insights.append("최적의 응답 패턴 발견 - 표준화 고려")
        elif feedback > 0.7:
            insights.append("양호한 응답 패턴 - 지속적 개선 필요")
        elif feedback > 0.5:
            insights.append("보통 수준의 응답 - 개선 여지 있음")
        else:
            insights.append("개선이 시급한 응답 패턴 - 전면 재검토 필요")
        
        return insights
    
    def _identify_improvement_areas(self, message_id: str, feedback: float, success: bool) -> List[str]:
        """개선 영역 식별"""
        improvement_areas = []
        
        if feedback < 0.6:
            improvement_areas.append("응답 정확성 향상")
            improvement_areas.append("맥락 이해 개선")
        
        if feedback < 0.7:
            improvement_areas.append("개인화 수준 향상")
            improvement_areas.append("감정 인식 정확도 개선")
        
        if not success:
            improvement_areas.append("문제 해결 능력 강화")
            improvement_areas.append("사용자 의도 파악 정확도 향상")
        
        if feedback < 0.5:
            improvement_areas.append("전체적인 응답 품질 개선")
            improvement_areas.append("사용자 경험 최적화")
        
        return improvement_areas
    
    def _generate_adaptation_recommendations(self, feedback: float, success: bool) -> List[str]:
        """적응적 개선 권장사항 생성"""
        recommendations = []
        
        if feedback < 0.6:
            recommendations.append("더 정확한 맥락 분석 필요")
            recommendations.append("사용자 프로필 업데이트 권장")
        
        if feedback < 0.7:
            recommendations.append("감정 분석 정확도 향상 필요")
            recommendations.append("개인화 알고리즘 조정 권장")
        
        if not success:
            recommendations.append("문제 해결 전략 재검토 필요")
            recommendations.append("사용자 피드백 기반 학습 강화")
        
        if feedback > 0.8:
            recommendations.append("성공적인 패턴 표준화 고려")
            recommendations.append("다른 사용자에게 적용 검토")
        
        return recommendations
    
    def _apply_real_time_learning(self, feedback_record: Dict[str, Any]):
        """실시간 학습 적용"""
        feedback_score = feedback_record['feedback_score']
        success = feedback_record['success_indicator']
        
        # 학습 패턴 결정
        if feedback_score > 0.8:
            learning_pattern = '적응형'
        elif feedback_score > 0.6:
            learning_pattern = '보수적'
        elif feedback_score > 0.4:
            learning_pattern = '혁신적'
        else:
            learning_pattern = '실험적'
        
        # 적응률 계산
        adaptation_rate = self.learning_patterns[learning_pattern]['adaptation_rate']
        
        # 성공적인 패턴 강화
        if success and feedback_score > 0.7:
            self._reinforce_successful_patterns(feedback_record)
        
        # 실패한 패턴 수정
        if not success or feedback_score < 0.5:
            self._modify_failed_patterns(feedback_record)
        
        # 새로운 패턴 탐색
        if feedback_score < 0.4:
            self._explore_new_patterns(feedback_record)
    
    def _reinforce_successful_patterns(self, feedback_record: Dict[str, Any]):
        """성공적인 패턴 강화"""
        # 성공적인 응답 패턴을 데이터베이스에 저장
        try:
            conn = sqlite3.connect('advanced_message_system.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO successful_patterns 
                (message_id, feedback_score, success_indicator, pattern_type, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                feedback_record['message_id'],
                feedback_record['feedback_score'],
                feedback_record['success_indicator'],
                'successful',
                feedback_record['timestamp']
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"성공 패턴 저장 오류: {e}")
    
    def _modify_failed_patterns(self, feedback_record: Dict[str, Any]):
        """실패한 패턴 수정"""
        # 실패한 패턴을 분석하여 개선 방안 도출
        improvement_areas = feedback_record['improvement_areas']
        
        for area in improvement_areas:
            self._create_improvement_task(area, feedback_record)
    
    def _explore_new_patterns(self, feedback_record: Dict[str, Any]):
        """새로운 패턴 탐색"""
        # 새로운 접근 방식 시도
        exploration_recommendations = [
            "다른 AI 모델 조합 시도",
            "새로운 개인화 전략 적용",
            "감정 분석 알고리즘 개선",
            "맥락 이해 방식 변경"
        ]
        
        for recommendation in exploration_recommendations:
            self._create_exploration_task(recommendation, feedback_record)
    
    def _create_improvement_task(self, area: str, feedback_record: Dict[str, Any]):
        """개선 작업 생성"""
        try:
            conn = sqlite3.connect('advanced_message_system.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO improvement_tasks 
                (area, priority, status, created_at, feedback_id)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                area,
                'high' if feedback_record['feedback_score'] < 0.5 else 'medium',
                'pending',
                datetime.now().isoformat(),
                feedback_record['message_id']
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"개선 작업 생성 오류: {e}")
    
    def _create_exploration_task(self, recommendation: str, feedback_record: Dict[str, Any]):
        """탐색 작업 생성"""
        try:
            conn = sqlite3.connect('advanced_message_system.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO exploration_tasks 
                (recommendation, priority, status, created_at, feedback_id)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                recommendation,
                'high' if feedback_record['feedback_score'] < 0.4 else 'medium',
                'pending',
                datetime.now().isoformat(),
                feedback_record['message_id']
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"탐색 작업 생성 오류: {e}")
    
    def _update_performance_metrics(self, feedback_record: Dict[str, Any]):
        """성능 메트릭 업데이트"""
        feedback_score = feedback_record['feedback_score']
        success = feedback_record['success_indicator']
        
        # 응답 품질 메트릭
        self.performance_metrics['response_quality'].append(feedback_score)
        
        # 사용자 만족도 메트릭
        self.performance_metrics['user_satisfaction'].append(feedback_score)
        
        # 적응 속도 메트릭 (최근 10개 피드백의 평균)
        recent_feedbacks = self.performance_metrics['user_satisfaction'][-10:]
        if len(recent_feedbacks) >= 2:
            adaptation_speed = recent_feedbacks[-1] - recent_feedbacks[0]
            self.performance_metrics['adaptation_speed'].append(adaptation_speed)
        
        # 학습 효율성 메트릭
        if len(self.performance_metrics['user_satisfaction']) >= 5:
            recent_avg = sum(self.performance_metrics['user_satisfaction'][-5:]) / 5
            overall_avg = sum(self.performance_metrics['user_satisfaction']) / len(self.performance_metrics['user_satisfaction'])
            learning_efficiency = recent_avg - overall_avg
            self.performance_metrics['learning_efficiency'].append(learning_efficiency)
    
    def _save_feedback_to_database(self, feedback_record: Dict[str, Any]):
        """피드백을 데이터베이스에 저장"""
        try:
            conn = sqlite3.connect('advanced_message_system.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO learning_feedback 
                (message_id, feedback_score, success_indicator, learning_insights, 
                 improvement_areas, adaptation_recommendations, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                feedback_record['message_id'],
                feedback_record['feedback_score'],
                feedback_record['success_indicator'],
                json.dumps(feedback_record['learning_insights']),
                json.dumps(feedback_record['improvement_areas']),
                json.dumps(feedback_record['adaptation_recommendations']),
                feedback_record['timestamp']
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"피드백 저장 오류: {e}")
    
    def analyze_performance(self) -> Dict[str, Any]:
        """고도화된 성능 분석"""
        if not self.performance_metrics['user_satisfaction']:
            return {
                'overall_performance': 0.0,
                'trend_analysis': 'insufficient_data',
                'learning_efficiency': 0.0,
                'improvement_areas': [],
                'recommendations': []
            }
        
        # 전체 성능 계산
        overall_performance = sum(self.performance_metrics['user_satisfaction']) / len(self.performance_metrics['user_satisfaction'])
        
        # 트렌드 분석
        recent_scores = self.performance_metrics['user_satisfaction'][-10:]
        if len(recent_scores) >= 2:
            trend = 'improving' if recent_scores[-1] > recent_scores[0] else 'declining'
        else:
            trend = 'stable'
        
        # 학습 효율성 계산
        learning_efficiency = 0.0
        if self.performance_metrics['learning_efficiency']:
            learning_efficiency = sum(self.performance_metrics['learning_efficiency']) / len(self.performance_metrics['learning_efficiency'])
        
        # 개선 영역 식별
        improvement_areas = self._identify_system_improvement_areas()
        
        # 권장사항 생성
        recommendations = self._generate_system_recommendations(overall_performance, trend, learning_efficiency)
        
        return {
            'overall_performance': overall_performance,
            'trend_analysis': trend,
            'learning_efficiency': learning_efficiency,
            'improvement_areas': improvement_areas,
            'recommendations': recommendations,
            'detailed_metrics': {
                'response_quality_avg': sum(self.performance_metrics['response_quality']) / len(self.performance_metrics['response_quality']) if self.performance_metrics['response_quality'] else 0,
                'user_satisfaction_avg': sum(self.performance_metrics['user_satisfaction']) / len(self.performance_metrics['user_satisfaction']) if self.performance_metrics['user_satisfaction'] else 0,
                'adaptation_speed_avg': sum(self.performance_metrics['adaptation_speed']) / len(self.performance_metrics['adaptation_speed']) if self.performance_metrics['adaptation_speed'] else 0
            }
        }
    
    def _identify_system_improvement_areas(self) -> List[str]:
        """시스템 개선 영역 식별"""
        improvement_areas = []
        
        if self.performance_metrics['user_satisfaction']:
            avg_satisfaction = sum(self.performance_metrics['user_satisfaction']) / len(self.performance_metrics['user_satisfaction'])
            
            if avg_satisfaction < 0.6:
                improvement_areas.append("전체적인 응답 품질 개선 필요")
                improvement_areas.append("사용자 만족도 향상이 시급")
            
            if avg_satisfaction < 0.7:
                improvement_areas.append("개인화 알고리즘 최적화 필요")
                improvement_areas.append("감정 분석 정확도 향상 필요")
        
        if self.performance_metrics['adaptation_speed']:
            avg_adaptation = sum(self.performance_metrics['adaptation_speed']) / len(self.performance_metrics['adaptation_speed'])
            
            if avg_adaptation < 0:
                improvement_areas.append("학습 속도 개선 필요")
                improvement_areas.append("적응성 향상 필요")
        
        return improvement_areas
    
    def _generate_system_recommendations(self, overall_performance: float, trend: str, learning_efficiency: float) -> List[str]:
        """시스템 권장사항 생성"""
        recommendations = []
        
        if overall_performance < 0.6:
            recommendations.append("전면적인 시스템 성능 개선 필요")
            recommendations.append("사용자 피드백 기반 대폭 개선")
        
        if overall_performance < 0.7:
            recommendations.append("개인화 알고리즘 재검토")
            recommendations.append("감정 분석 모델 업데이트")
        
        if trend == 'declining':
            recommendations.append("성능 저하 원인 분석 및 대책 수립")
            recommendations.append("학습 알고리즘 조정 필요")
        
        if learning_efficiency < 0:
            recommendations.append("학습 효율성 향상을 위한 알고리즘 개선")
            recommendations.append("적응적 학습 전략 재검토")
        
        if overall_performance > 0.8:
            recommendations.append("현재 성능 유지 및 안정화")
            recommendations.append("성공적인 패턴 표준화")
        
        return recommendations

# 고도화된 메시지 생성 시스템
class AdvancedMessageGenerator:
    def __init__(self):
        self.ai_simulator = AIModelSimulator()
        self.emotion_engine = EmotionAnalysisEngine()
        self.personalization_engine = PersonalizationEngine()
        self.learning_engine = LearningEngine()
        self.enhanced_analyzer = EnhancedConversationAnalyzer()
        self.conversation_insights = {}
    
    def generate_advanced_message(self, request: AdvancedMessageRequest) -> AdvancedGeneratedMessage:
        """고도화된 메시지 생성"""
        # 1. 감정 분석
        emotion_analysis = self.emotion_engine.analyze_emotion(request.original_message)
        
        # 2. 사용자 프로필 조회
        user_profile = self.personalization_engine.get_user_profile(request.sender)
        
        # 3. AI 모델 선택
        ai_model = self._select_best_model()
        
        # 4. 스타일 선택 (요청된 스타일이 있으면 사용, 없으면 컨텍스트 기반 선택)
        style = request.style if request.style else self._select_style_based_on_context(request.context_type, emotion_analysis)
        
        # 5. AI 모델을 사용한 메시지 생성
        base_message = self.ai_simulator.generate_message(
            context=request.original_message,
            style=style,
            model_name=ai_model,
            emotion_context=request.emotion_context,
            recent_messages=request.recent_messages
        )
        
        # 6. 개인화 적용 (실제 대화 스타일이 아닌 경우에만)
        if style == '실제대화':
            personalized_message = base_message
        else:
            personalized_message = self.personalization_engine.personalize_message(base_message, user_profile)
        
        # 7. 추가 옵션 적용
        final_message = self._apply_options(personalized_message, request)
        
        # 8. 대안 메시지 생성
        alternatives = self._generate_alternatives(request, style, ai_model)
        
        # 9. 점수 계산
        personalization_score = self._calculate_personalization_score(user_profile, request)
        confidence_score = self._calculate_confidence_score(emotion_analysis, ai_model)
        impact_prediction = self._predict_impact(final_message, emotion_analysis)
        
        # 10. 학습 인사이트 생성
        learning_insights = self._generate_learning_insights(request, emotion_analysis)
        
        # 메시지 ID 생성
        message_id = f"adv_msg_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random.randint(1000, 9999)}"
        
        return AdvancedGeneratedMessage(
            id=message_id,
            original_message=request.original_message,
            generated_message=final_message,
            ai_model_used=ai_model,
            emotion_analysis=emotion_analysis,
            personalization_score=personalization_score,
            confidence_score=confidence_score,
            impact_prediction=impact_prediction,
            learning_insights=learning_insights,
            alternatives=alternatives,
            created_at=datetime.now().isoformat()
        )
    
    def _select_best_model(self) -> str:
        """최적의 AI 모델 선택"""
        conn = sqlite3.connect('advanced_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT model_name, success_rate 
            FROM ai_model_performance 
            ORDER BY success_rate DESC 
            LIMIT 1
        ''')
        
        result = cursor.fetchone()
        conn.close()
        
        return result[0] if result else 'GPT-4'
    
    def _select_style_based_on_context(self, context_type: str, emotion_analysis: Dict[str, Any]) -> str:
        """컨텍스트 기반 스타일 선택"""
        context_styles = {
            '건설': '논리',
            '투자': '권위',
            '갈등': '공감',
            '정보': '설명적',
            '승인': '논리',
            '반대': '공감'
        }
        
        primary_emotion = emotion_analysis['primary_emotion']
        emotion_styles = {
            '분노': '공감',
            '슬픔': '공감',
            '두려움': '설명적',
            '기쁨': '친근적',
            '놀람': '설명적'
        }
        
        # 감정이 강하면 감정 기반 스타일 선택
        if emotion_analysis['intensity'] > 0.6:
            return emotion_styles.get(primary_emotion, '공감')
        
        return context_styles.get(context_type, '설명적')
    
    def _apply_options(self, message: str, request: AdvancedMessageRequest) -> str:
        """추가 옵션 적용"""
        # 옵션 필드가 없는 경우 아무 동작도 하지 않음
        # 예전 옵션: include_data, include_examples, include_call_to_action 등
        # getattr로 안전하게 처리
        if getattr(request, 'include_data', False):
            message += " 관련 데이터를 첨부드립니다."
        if getattr(request, 'include_examples', False):
            message += " 예시를 함께 안내드립니다."
        if getattr(request, 'include_call_to_action', False):
            message += " 추가 문의는 언제든 연락주세요."
        return message
    
    def _generate_alternatives(self, request: AdvancedMessageRequest, style: str, ai_model: str) -> List[str]:
        """대안 메시지 생성"""
        alternatives = []
        alternative_styles = ['공감', '논리', '설명적']
        
        for alt_style in alternative_styles:
            if alt_style != style:
                alt_message = self.ai_simulator.generate_message(ai_model, request.original_message, alt_style, request.emotion_context, request.recent_messages)
                alternatives.append(alt_message)
        
        return alternatives[:2]  # 최대 2개 대안
    
    def _calculate_personalization_score(self, user_profile: Dict[str, Any], request: AdvancedMessageRequest) -> float:
        """개인화 점수 계산"""
        base_score = 0.7
        # 개인화 레벨에 따른 조정
        personalization_level = getattr(request, 'personalization_level', None)
        if personalization_level == '높음':
            base_score += 0.2
        elif personalization_level == '중간':
            base_score += 0.1
        # 사용자 프로필 완성도에 따른 조정
        profile_completeness = len([v for v in user_profile.values() if v is not None]) / len(user_profile)
        base_score += profile_completeness * 0.1
        return min(1.0, base_score)
    
    def _calculate_confidence_score(self, emotion_analysis: Dict[str, Any], ai_model: str) -> float:
        """신뢰도 점수 계산"""
        base_confidence = 0.8
        
        # 감정 분석 신뢰도
        emotion_confidence = emotion_analysis['confidence']
        base_confidence += emotion_confidence * 0.1
        
        # AI 모델 성능
        model_performance = {
            'GPT-4': 0.92,
            'Claude-3': 0.89,
            'Gemini-Pro': 0.87,
            'Local-LLM': 0.75
        }
        
        model_confidence = model_performance.get(ai_model, 0.8)
        base_confidence += model_confidence * 0.1
        
        return min(1.0, base_confidence)
    
    def _predict_impact(self, message: str, emotion_analysis: Dict[str, Any]) -> float:
        """영향력 예측"""
        base_impact = 70.0
        
        # 감정 강도에 따른 조정
        intensity = emotion_analysis['intensity']
        if intensity > 0.7:
            base_impact += 15
        elif intensity > 0.4:
            base_impact += 5
        
        # 메시지 길이에 따른 조정
        if len(message) > 100:
            base_impact += 5
        elif len(message) < 50:
            base_impact -= 5
        
        return min(100.0, max(0.0, base_impact))
    
    def _generate_learning_insights(self, request: AdvancedMessageRequest, emotion_analysis: Dict[str, Any]) -> List[str]:
        """학습 인사이트 생성"""
        insights = []
        # 감정 기반 인사이트
        primary_emotion = emotion_analysis['primary_emotion']
        if primary_emotion in ['분노', '슬픔']:
            insights.append("감정적 상황이므로 공감적 접근이 효과적일 수 있습니다.")
        # 컨텍스트 기반 인사이트
        if request.context_type == '갈등':
            insights.append("갈등 상황에서는 중재적 입장을 유지하는 것이 좋습니다.")
        elif request.context_type == '투자':
            insights.append("투자 관련 메시지는 객관적 데이터를 포함하는 것이 효과적입니다.")
        # 개인화 기반 인사이트
        personalization_level = getattr(request, 'personalization_level', None)
        if personalization_level == '높음':
            insights.append("개인화된 메시지가 사용자 반응을 향상시킬 수 있습니다.")
        return insights
    
    def analyze_conversation_data(self, chat_file_path: str) -> Dict[str, Any]:
        """실제 카카오톡 대화 데이터 분석"""
        try:
            analysis_result = self.enhanced_analyzer.analyze_chat_file(chat_file_path)
            self.conversation_insights = analysis_result
            return analysis_result
        except Exception as e:
            logger.error(f"대화 데이터 분석 오류: {e}")
            return {}
    
    def generate_context_aware_message(self, 
                                     original_message: str, 
                                     format_type: str,
                                     context: str = "") -> str:
        """대화 맥락을 고려한 메시지 생성"""
        try:
            # 대화 인사이트 활용
            insights = self.conversation_insights.get('insights', [])
            participants = self.conversation_insights.get('participants', {})
            
            # 참여자 패턴 분석
            if participants:
                most_active_user = max(participants.items(), 
                                     key=lambda x: x[1].get('message_count', 0))
                user_style = self._analyze_user_style(most_active_user[1])
            else:
                user_style = "neutral"
            
            # 주제별 패턴 분석
            topic_analysis = self.conversation_insights.get('topic_analysis', {})
            real_estate_patterns = self.conversation_insights.get('real_estate_patterns', {})
            
            # 맥락 기반 메시지 생성
            context_enhanced_message = self._generate_context_enhanced_message(
                original_message, format_type, context, user_style, 
                topic_analysis, real_estate_patterns
            )
            
            return context_enhanced_message
            
        except Exception as e:
            logger.error(f"맥락 기반 메시지 생성 오류: {e}")
            return self._generate_fallback_message(original_message, format_type)
    
    def _analyze_user_style(self, user_data: Dict[str, Any]) -> str:
        """사용자 스타일 분석"""
        message_types = user_data.get('message_types', {})
        emotion_indicators = user_data.get('emotion_indicators', {})
        
        # 감정적 스타일
        if emotion_indicators.get('긍정', 0) > emotion_indicators.get('부정', 0):
            return "positive"
        elif emotion_indicators.get('부정', 0) > emotion_indicators.get('긍정', 0):
            return "negative"
        
        # 질문 스타일
        if message_types.get('question', 0) > 0:
            return "inquisitive"
        
        # 동의/부정 스타일
        if message_types.get('agreement', 0) > message_types.get('disagreement', 0):
            return "supportive"
        elif message_types.get('disagreement', 0) > message_types.get('agreement', 0):
            return "critical"
        
        return "neutral"
    
    def _generate_context_enhanced_message(self, 
                                         original_message: str,
                                         format_type: str,
                                         context: str,
                                         user_style: str,
                                         topic_analysis: Dict[str, Any],
                                         real_estate_patterns: Dict[str, Any]) -> str:
        """맥락을 고려한 향상된 메시지 생성"""
        
        # 부동산 관련 키워드 확인
        real_estate_keywords = real_estate_patterns.get('keywords_frequency', {})
        is_real_estate_topic = any(keyword in original_message.lower() 
                                  for keyword in ['재개발', '재건축', '분양', '아파트'])
        
        # 사용자 스타일에 따른 응답 조정
        if user_style == "positive":
            if format_type == "동조":
                return "정말 좋은 의견이에요! 👍"
            elif format_type == "제안":
                return "그런 방법도 좋을 것 같아요"
        elif user_style == "critical":
            if format_type == "반박":
                return "그런 주장은 문제가 있어요"
            elif format_type == "질문":
                return "그런 근거가 있나요?"
        elif user_style == "inquisitive":
            if format_type == "질문":
                return "어떻게 그런 생각을 하게 되셨나요?"
            elif format_type == "반문":
                return "정말 그런가요? 좀 더 자세히 설명해주세요"
        
        # 부동산 주제 특화 응답
        if is_real_estate_topic:
            if format_type == "동조":
                return "재개발 관련해서 저도 그렇게 생각해요"
            elif format_type == "반박":
                return "재개발 관련해서는 그런 주장이 맞지 않을 것 같아요"
            elif format_type == "제안":
                return "재개발 과정에서 그런 방법을 시도해보시는 건 어떨까요?"
        
        # 기본 형식별 응답
        return self._generate_basic_formatted_message(original_message, format_type)
    
    def _generate_basic_formatted_message(self, original_message: str, format_type: str) -> str:
        """기본 형식별 메시지 생성"""
        format_responses = {
            "반박": "그런 주장은 근거가 부족해요",
            "반문": "그런 근거가 있나요?",
            "반대": "저는 반대합니다",
            "동조": "저도 동감합니다",
            "응호": "그건 옳은 선택이에요",
            "비난": "그건 정말 문제가 있어요",
            "중립": "그런 상황이군요",
            "회피": "그런 건 잘 모르겠어요",
            "풍자": "정말 대단하시네요",
            "공감": "그런 마음 이해해요",
            "제안": "그런 방법은 어떨까요?",
            "질문": "그런 건 어떻게 되나요?",
            "무시": "...",
            "강조": "정말 중요한 건 그게 아니에요",
            "추측": "아마 그럴 것 같아요",
            "감정적호소": "정말 그렇게 하면 안 돼요",
            "조롱": "정말 대단하시네요 ㅎ",
            "명령": "그렇게 하세요",
            "강압": "그렇게 안 하면 안 돼요",
            "강제": "그렇게 해야만 해요",
            "세뇌": "그런 생각이 옳은 거예요",
            "가스라이팅": "그런 건 없었어요"
        }
        
        return format_responses.get(format_type, "알겠습니다")
    
    def _generate_fallback_message(self, original_message: str, format_type: str) -> str:
        """폴백 메시지 생성"""
        return f"선택된 형식({format_type})에 따른 응답입니다."

# 전역 인스턴스
message_generator = AdvancedMessageGenerator()

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "고도화된 메시지 생성 서버",
        "version": "2.0.0",
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "online",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "AI 모델 통합",
            "감정 분석",
            "개인화 엔진",
            "실시간 학습",
            "성능 최적화",
            "다중 모델 지원"
        ]
    }

@app.post("/api/generate-advanced-message")
async def generate_advanced_message_endpoint(request: AdvancedMessageRequest):
    """고도화된 메시지 생성 API"""
    try:
        message = message_generator.generate_advanced_message(request)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('advanced_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO advanced_messages 
            (id, original_message, generated_message, ai_model_used, emotion_analysis,
             personalization_score, confidence_score, impact_prediction, learning_insights,
             alternatives, user_id, chat_room_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            message.id, request.original_message, message.generated_message,
            message.ai_model_used, json.dumps(message.emotion_analysis),
            message.personalization_score, message.confidence_score,
            message.impact_prediction, json.dumps(message.learning_insights),
            json.dumps(message.alternatives), request.sender, request.chat_room_id,
            message.created_at, message.created_at
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": message.dict()
        }
        
    except Exception as e:
        logger.error(f"고도화된 메시지 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=f"메시지 생성 실패: {str(e)}")

@app.post("/api/update-user-profile")
async def update_user_profile_endpoint(request: UserProfileRequest):
    """사용자 프로필 업데이트"""
    try:
        conn = sqlite3.connect('advanced_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_profiles 
            (user_id, communication_style, preferred_tone, response_speed,
             formality_level, emotion_sensitivity, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            request.user_id, request.communication_style, request.preferred_tone,
            request.response_speed, request.formality_level, request.emotion_sensitivity,
            datetime.now().isoformat(), datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "사용자 프로필이 업데이트되었습니다."
        }
        
    except Exception as e:
        logger.error(f"사용자 프로필 업데이트 오류: {e}")
        raise HTTPException(status_code=500, detail=f"프로필 업데이트 실패: {str(e)}")

@app.post("/api/learning-feedback")
async def learning_feedback_endpoint(request: LearningFeedbackRequest):
    """학습 피드백 제출"""
    try:
        message_generator.learning_engine.record_feedback(
            request.message_id,
            request.user_feedback,
            request.success_indicator
        )
        
        return {
            "success": True,
            "message": "학습 피드백이 기록되었습니다."
        }
        
    except Exception as e:
        logger.error(f"학습 피드백 기록 오류: {e}")
        raise HTTPException(status_code=500, detail=f"피드백 기록 실패: {str(e)}")

@app.get("/api/performance-analysis")
async def get_performance_analysis():
    """성능 분석 조회"""
    try:
        performance = message_generator.learning_engine.analyze_performance()
        
        return {
            "success": True,
            "performance": performance
        }
        
    except Exception as e:
        logger.error(f"성능 분석 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "performance": {}
        }

@app.get("/api/ai-model-performance")
async def get_ai_model_performance():
    """AI 모델 성능 조회"""
    try:
        conn = sqlite3.connect('advanced_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT model_name, success_rate, average_response_time, user_satisfaction, total_requests, last_updated
            FROM ai_model_performance 
            ORDER BY success_rate DESC
        ''')
        
        models = []
        for row in cursor.fetchall():
            models.append({
                'model_name': row[0],
                'success_rate': row[1],
                'average_response_time': row[2],
                'user_satisfaction': row[3],
                'total_requests': row[4],
                'last_updated': row[5]
            })
        
        conn.close()
        
        return {
            "success": True,
            "models": models
        }
        
    except Exception as e:
        logger.error(f"AI 모델 성능 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "models": []
        }

@app.get("/api/user-profile/{user_id}")
async def get_user_profile(user_id: str):
    """사용자 프로필 조회"""
    try:
        profile = message_generator.personalization_engine.get_user_profile(user_id)
        
        return {
            "success": True,
            "profile": profile
        }
        
    except Exception as e:
        logger.error(f"사용자 프로필 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "profile": {}
        }

@app.post("/api/generate-advanced-message-samples")
def generate_advanced_message_samples_endpoint(request: AdvancedMessageSampleRequest):
    try:
        samples = ai_model_simulator.generate_message_samples(
            original_message=request.original_message,
            context=request.context,
            sender=request.sender,
            chat_room_id=request.chat_room_id,
            target_audience=request.target_audience,
            context_type=request.context_type,
            user_id=request.user_id,
            styles=request.styles,
            emotion_contexts=request.emotion_contexts,
            contexts=request.contexts,
            recent_messages=request.recent_messages
        )
        return {"success": True, "samples": samples}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/generate-kakao-message", response_model=Dict[str, Any])
async def generate_kakao_message(request: AdvancedMessageRequest):
    """실제 카카오톡 메시지 형식으로 응답 생성"""
    try:
        # 실제 대화 분석
        if request.recent_messages:
            # 실제 카카오톡 형식 응답 생성
            kakao_response = message_generator.ai_simulator._generate_realistic_kakao_response(
                request.original_message, 
                request.recent_messages
            )
            
            return {
                "success": True,
                "message": {
                    "id": f"kakao_msg_{int(time.time())}_{random.randint(1000, 9999)}",
                    "original_message": request.original_message,
                    "generated_message": kakao_response,
                    "format": "kakao_talk",
                    "timestamp": datetime.now().isoformat(),
                    "style": request.style or "실제대화"
                }
            }
        else:
            # 기본 응답
            basic_response = message_generator.ai_simulator._generate_kakao_message_format(
                "알겠어요", 
                "AI_Assistant"
            )
            
            return {
                "success": True,
                "message": {
                    "id": f"kakao_msg_{int(time.time())}_{random.randint(1000, 9999)}",
                    "original_message": request.original_message,
                    "generated_message": basic_response,
                    "format": "kakao_talk",
                    "timestamp": datetime.now().isoformat(),
                    "style": "실제대화"
                }
            }
            
    except Exception as e:
        logger.error(f"카카오 메시지 생성 오류: {e}")
        return {
            "success": False,
            "error": f"메시지 생성 실패: {str(e)}"
        }

@app.post("/api/analyze-kakao-conversation", response_model=Dict[str, Any])
async def analyze_kakao_conversation(request: Dict[str, Any]):
    """카카오톡 대화 분석"""
    try:
        file_path = request.get("file_path")
        if not file_path:
            return {
                "success": False,
                "error": "파일 경로가 필요합니다"
            }
        
        # 대화 분석기 생성
        analyzer = ConversationAnalyzer()
        analyzer.analyze_chat_file(file_path)
        
        return {
            "success": True,
            "analysis": {
                "total_messages": len(analyzer.speaker_styles),
                "speaker_patterns": analyzer.speaker_styles,
                "common_expressions": analyzer.common_expressions[:10],
                "emotion_patterns": analyzer.emotion_patterns,
                "real_estate_patterns": getattr(analyzer, 'real_estate_patterns', {}),
                "community_patterns": getattr(analyzer, 'community_patterns', {})
            }
        }
        
    except Exception as e:
        logger.error(f"대화 분석 오류: {e}")
        return {
            "success": False,
            "error": f"대화 분석 실패: {str(e)}"
        }

# 메시지 형식 생성기 초기화
format_generator = MessageFormatGenerator()

@app.post("/api/generate-formatted-message", response_model=Dict[str, Any])
async def generate_formatted_message(request: Dict[str, Any]):
    """선택된 메시지 형식에 따른 메시지 생성"""
    try:
        format_type = request.get("format_type", "중립")
        original_message = request.get("original_message", "")
        context = request.get("context", "")
        recent_messages = request.get("recent_messages", [])
        
        # 선택된 형식에 따른 메시지 생성
        formatted_message = format_generator.generate_formatted_message(
            format_type, context, recent_messages
        )
        
        # 카카오톡 형식으로 변환
        kakao_formatted_message = message_generator.ai_simulator._generate_kakao_message_format(
            formatted_message, "AI_Assistant"
        )
        
        return {
            "success": True,
            "message": {
                "id": f"formatted_msg_{int(time.time())}_{random.randint(1000, 9999)}",
                "original_message": original_message,
                "format_type": format_type,
                "generated_message": kakao_formatted_message,
                "raw_message": formatted_message,
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"형식별 메시지 생성 오류: {e}")
        return {
            "success": False,
            "error": f"메시지 생성 실패: {str(e)}"
        }

@app.get("/api/message-formats", response_model=Dict[str, Any])
async def get_message_formats():
    """사용 가능한 메시지 형식 목록 반환"""
    formats = {
        "반박": "상대 주장의 오류나 약점을 지적하며 부정",
        "반문": "상대의 주장에 질문을 던져 되묻는 방식",
        "반대": "명확하게 의견을 거부하거나 부정",
        "동조": "상대 의견에 동의하거나 지지",
        "응호": "특정 입장이나 대상을 적극적으로 옹호",
        "비난": "강하게 부정적 평가나 공격",
        "중립": "감정이나 입장 없이 상황만 설명",
        "회피": "명확한 입장을 회피하거나 대화를 흐림",
        "풍자": "비꼬거나 간접적으로 비판",
        "공감": "상대 감정을 이해하고 수용",
        "제안": "해결책이나 대안을 제시",
        "질문": "정보를 얻거나 의문을 던짐",
        "무시": "반응하지 않거나 대화를 거부",
        "강조": "특정 사실이나 의견을 부각",
        "추측": "확실하지 않은 의견을 조심스럽게 제시",
        "감정적호소": "논리보다 감정에 기반해 설득",
        "조롱": "상대를 비웃거나 깎아내림",
        "명령": "지시하거나 강제하는 어투",
        "강압": "위협, 압박을 통해 상대를 설득",
        "강제": "선택권을 주지 않고 특정 행동을 요구",
        "세뇌": "장기간 반복·왜곡으로 판단력을 마비시킴",
        "가스라이팅": "상대의 현실 인식을 부정하거나 조작해 혼란을 유도"
    }
    
    return {
        "success": True,
        "formats": formats
    }

@app.post("/api/analyze-conversation-enhanced", response_model=Dict[str, Any])
async def analyze_conversation_enhanced(request: Dict[str, Any]):
    """향상된 대화 분석"""
    try:
        chat_file_path = request.get("chat_file_path", "")
        
        if not chat_file_path:
            return {
                "success": False,
                "error": "채팅 파일 경로가 필요합니다."
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

# 서버 시작
if __name__ == "__main__":
    print("🚀 고도화된 메시지 생성 서버 시작")
    print("=" * 60)
    print("📍 서버 주소: http://localhost:8011")
    print("📖 API 문서: http://localhost:8011/docs")
    print("🎯 주요 엔드포인트:")
    print("   POST /api/generate-advanced-message - 고도화된 메시지 생성")
    print("   POST /api/update-user-profile - 사용자 프로필 업데이트")
    print("   POST /api/learning-feedback - 학습 피드백")
    print("   GET /api/performance-analysis - 성능 분석")
    print("   GET /api/ai-model-performance - AI 모델 성능")
    print("   GET /api/user-profile/{id} - 사용자 프로필")
    print("")
    
    try:
        # 데이터베이스 초기화
        init_advanced_message_database()
        print("✅ 고도화된 메시지 데이터베이스 초기화 완료")
        
        # 서버 시작
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8011, log_level="info")
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 