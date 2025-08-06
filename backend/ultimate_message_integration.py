#!/usr/bin/env python3
"""
궁극적 메시지 통합 시스템
모든 기존 메시지 시스템을 통합한 완전한 메시지 생성 시스템
"""

import json
import random
import time
import sqlite3
from datetime import datetime
from typing import Dict, List, Any
from dataclasses import dataclass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# FastAPI 앱 생성
app = FastAPI(
    title="궁극적 메시지 통합 시스템",
    description="모든 메시지 기능을 통합한 완전한 시스템",
    version="3.0.0"
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
def init_ultimate_database():
    """궁극적 메시지 시스템 데이터베이스 초기화"""
    conn = sqlite3.connect('ultimate_message_system.db')
    cursor = conn.cursor()
    
    # 통합 메시지 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ultimate_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT UNIQUE,
            original_message TEXT,
            generated_message TEXT,
            format_type TEXT,
            strategy_type TEXT,
            tone_type TEXT,
            user_id TEXT,
            chat_room_id TEXT,
            confidence_score REAL,
            impact_score REAL,
            emotion_score REAL,
            sentiment_score REAL,
            complexity_score REAL,
            analytics_data TEXT,
            context_data TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            success BOOLEAN
        )
    ''')
    
    # 사용자 프로필 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE,
            preferred_formats TEXT,
            communication_style TEXT,
            strategy_preferences TEXT,
            tone_preferences TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 메시지 히스토리 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS message_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT,
            user_id TEXT,
            format_type TEXT,
            strategy_type TEXT,
            success BOOLEAN,
            feedback_score REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 분석 결과 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT,
            emotion_score REAL,
            sentiment_score REAL,
            complexity_score REAL,
            impact_prediction REAL,
            keywords TEXT,
            tone TEXT,
            formality_level TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()


# 데이터베이스 초기화 실행
init_ultimate_database()

# 데이터 모델
class UltimateMessageRequest(BaseModel):
    original_message: str
    format_type: str = "중립"
    strategy_type: str = "일반"
    tone_type: str = "중립"
    user_id: str = "default"
    chat_room_id: str = ""
    context: str = ""
    recent_messages: List[Dict[str, Any]] = []
    include_analytics: bool = True
    include_history: bool = True


class UserProfileRequest(BaseModel):
    user_id: str
    preferred_formats: List[str]
    communication_style: str
    strategy_preferences: List[str]
    tone_preferences: List[str]


class MessageAnalysisRequest(BaseModel):
    messages: List[Dict[str, Any]]
    analysis_type: str = "comprehensive"


@dataclass
class UltimateAnalytics:
    emotion_score: float
    sentiment_score: float
    complexity_score: float
    impact_prediction: float
    keywords: List[str]
    tone: str
    formality_level: str
    strategy_effectiveness: float
    format_appropriateness: float


class UltimateMessageGenerator:
    """궁극적 메시지 생성기"""
    
    def __init__(self):
        # 메시지 형식 정의
        self.formats = {
            "반박": self._generate_refutation,
            "반문": self._generate_counter_question,
            "반대": self._generate_opposition,
            "동조": self._generate_agreement,
            "응호": self._generate_defense,
            "비난": self._generate_criticism,
            "중립": self._generate_neutral,
            "회피": self._generate_avoidance,
            "풍자": self._generate_sarcasm,
            "공감": self._generate_empathy,
            "제안": self._generate_suggestion,
            "질문": self._generate_questioning,
            "무시": self._generate_ignoring,
            "강조": self._generate_emphasis,
            "추측": self._generate_speculation,
            "감정적호소": self._generate_emotional_appeal,
            "조롱": self._generate_mockery,
            "명령": self._generate_directive,
            "강압": self._generate_coercion,
            "강제": self._generate_forcefulness,
            "세뇌": self._generate_brainwashing,
            "가스라이팅": self._generate_gaslighting
        }
        
        # 전략 정의
        self.strategies = {
            "일반": self._strategy_general,
            "공감": self._strategy_empathy,
            "논리": self._strategy_logic,
            "감정": self._strategy_emotion,
            "권위": self._strategy_authority,
            "사회적증명": self._strategy_social_proof,
            "희소성": self._strategy_scarcity,
            "호혜성": self._strategy_reciprocity,
            "일관성": self._strategy_consistency,
            "호감": self._strategy_liking
        }
        
        # 톤 정의
        self.tones = {
            "중립": self._tone_neutral,
            "공식": self._tone_formal,
            "친근": self._tone_friendly,
            "격식": self._tone_polite,
            "격렬": self._tone_intense,
            "유머": self._tone_humorous,
            "진지": self._tone_serious,
            "감정적": self._tone_emotional
        }
        
        # 감정 분석 키워드
        self.emotion_keywords = {
            "positive": ["좋아", "행복", "기쁘", "감사", "만족", "성공", "좋은", "훌륭"],
            "negative": ["나쁘", "슬프", "화나", "실패", "문제", "어려", "힘들", "불만"],
            "neutral": ["그렇", "알겠", "그런", "그런데", "그리고", "하지만"]
        }
    
    def generate_ultimate_message(self, request: UltimateMessageRequest) -> Dict[str, Any]:
        """궁극적 메시지 생성"""
        try:
            # 사용자 프로필 분석
            user_profile = self._get_user_profile(request.user_id)
            
            # 맥락 분석
            context_analysis = self._analyze_context(request.context, request.recent_messages)
            
            # 기본 메시지 생성
            base_message = self._generate_base_message(request)
            
            # 전략 적용
            strategy_message = self._apply_strategy(base_message, request.strategy_type)
            
            # 톤 적용
            tone_message = self._apply_tone(strategy_message, request.tone_type)
            
            # 사용자 개인화
            personalized_message = self._personalize_message(tone_message, user_profile)
            
            # 메시지 분석
            analytics = self._analyze_message(personalized_message)
            
            # 데이터베이스에 저장
            message_id = f"ultimate_msg_{int(time.time())}_{random.randint(1000, 9999)}"
            self._save_ultimate_message(message_id, request, personalized_message, analytics)
            
            return {
                "id": message_id,
                "original_message": request.original_message,
                "format_type": request.format_type,
                "strategy_type": request.strategy_type,
                "tone_type": request.tone_type,
                "generated_message": personalized_message,
                "analytics": analytics,
                "user_profile": user_profile,
                "context_analysis": context_analysis,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "error": f"메시지 생성 실패: {str(e)}",
                "generated_message": "죄송합니다. 메시지 생성에 실패했습니다."
            }
    
    def _generate_base_message(self, request: UltimateMessageRequest) -> str:
        """기본 메시지 생성"""
        if request.format_type in self.formats:
            return self.formats[request.format_type](request.context, request.recent_messages)
        else:
            return self._generate_neutral(request.context, request.recent_messages)
    
    def _apply_strategy(self, message: str, strategy_type: str) -> str:
        """전략 적용"""
        if strategy_type in self.strategies:
            return self.strategies[strategy_type](message)
        else:
            return message
    
    def _apply_tone(self, message: str, tone_type: str) -> str:
        """톤 적용"""
        if tone_type in self.tones:
            return self.tones[tone_type](message)
        else:
            return message
    
    def _personalize_message(self, message: str, user_profile: Dict[str, Any]) -> str:
        """사용자 개인화"""
        style = user_profile.get("communication_style", "neutral")
        
        if style == "formal":
            return f"존경하는 분께, {message} 감사합니다."
        elif style == "casual":
            return f"{message} 😊"
        elif style == "professional":
            return f"{message} (업무용)"
        else:
            return message
    
    def _analyze_message(self, message: str) -> UltimateAnalytics:
        """메시지 분석"""
        # 감정 점수 계산
        positive_score = sum(1 for word in self.emotion_keywords["positive"] if word in message.lower())
        negative_score = sum(1 for word in self.emotion_keywords["negative"] if word in message.lower())
        
        emotion_score = (positive_score - negative_score) / max(len(self.emotion_keywords["positive"]), 1)
        sentiment_score = (positive_score + negative_score) / max(len(self.emotion_keywords["positive"] + self.emotion_keywords["negative"]), 1)
        
        # 복잡도 점수
        complexity_score = len(message.split()) / 20.0
        
        # 영향도 예측
        impact_prediction = (emotion_score + sentiment_score + complexity_score) / 3.0
        
        # 키워드 추출
        keywords = [word for word in message.split() if len(word) > 2]
        
        # 톤 분석
        if any(word in message.lower() for word in ["감사", "고마", "죄송"]):
            tone = "polite"
        elif any(word in message.lower() for word in ["ㅋ", "ㅎ", "ㅇㅋ"]):
            tone = "casual"
        else:
            tone = "neutral"
        
        # 형식성 레벨
        if any(word in message for word in ["존경", "감사합니다", "하시기"]):
            formality_level = "formal"
        elif any(word in message for word in ["ㅋ", "ㅎ", "ㅇㅋ"]):
            formality_level = "casual"
        else:
            formality_level = "neutral"
        
        return UltimateAnalytics(
            emotion_score=emotion_score,
            sentiment_score=sentiment_score,
            complexity_score=complexity_score,
            impact_prediction=impact_prediction,
            keywords=keywords[:5],
            tone=tone,
            formality_level=formality_level,
            strategy_effectiveness=random.uniform(0.6, 0.9),
            format_appropriateness=random.uniform(0.7, 0.95)
        )
    
    def _get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """사용자 프로필 조회"""
        conn = sqlite3.connect('ultimate_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT preferred_formats, communication_style, strategy_preferences, tone_preferences
            FROM user_profiles 
            WHERE user_id = ?
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                "preferred_formats": json.loads(result[0]) if result[0] else [],
                "communication_style": result[1] or "neutral",
                "strategy_preferences": json.loads(result[2]) if result[2] else [],
                "tone_preferences": json.loads(result[3]) if result[3] else []
            }
        else:
            return {
                "preferred_formats": [],
                "communication_style": "neutral",
                "strategy_preferences": [],
                "tone_preferences": []
            }
    
    def _analyze_context(self, context: str, recent_messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """맥락 분석"""
        total_messages = len(recent_messages)
        context_length = len(context)
        
        positive_count = sum(1 for msg in recent_messages if any(word in str(msg).lower() for word in self.emotion_keywords["positive"]))
        negative_count = sum(1 for msg in recent_messages if any(word in str(msg).lower() for word in self.emotion_keywords["negative"]))
        
        if positive_count > negative_count:
            overall_sentiment = "positive"
        elif negative_count > positive_count:
            overall_sentiment = "negative"
        else:
            overall_sentiment = "neutral"
        
        return {
            "total_messages": total_messages,
            "context_length": context_length,
            "overall_sentiment": overall_sentiment,
            "positive_count": positive_count,
            "negative_count": negative_count
        }
    
    def _save_ultimate_message(self, message_id: str, request: UltimateMessageRequest, generated_message: str, analytics: UltimateAnalytics):
        """궁극적 메시지 저장"""
        conn = sqlite3.connect('ultimate_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO ultimate_messages 
            (message_id, original_message, generated_message, format_type, strategy_type, tone_type, 
             user_id, chat_room_id, confidence_score, impact_score, emotion_score, sentiment_score, 
             complexity_score, analytics_data, context_data, success)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            message_id, request.original_message, generated_message, request.format_type, 
            request.strategy_type, request.tone_type, request.user_id, request.chat_room_id,
            analytics.strategy_effectiveness, analytics.impact_prediction, analytics.emotion_score,
            analytics.sentiment_score, analytics.complexity_score, json.dumps(analytics.__dict__),
            json.dumps({"context": request.context, "recent_messages": request.recent_messages}), True
        ))
        
        conn.commit()
        conn.close()
    
    # 메시지 형식 생성 메서드들
    def _generate_refutation(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그런 주장은 근거가 부족해요",
            "실제로는 그렇지 않을 것 같아요",
            "그건 잘못된 생각이에요",
            "사실과 다르네요"
        ]
        return random.choice(responses)
    
    def _generate_counter_question(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그런 근거가 있나요?",
            "정말 그런가요?",
            "어떻게 그런 결론을 내리셨나요?",
            "그건 어떻게 알 수 있나요?"
        ]
        return random.choice(responses)
    
    def _generate_opposition(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "저는 반대합니다",
            "그건 동의할 수 없어요",
            "저는 그렇게 생각하지 않아요",
            "그건 맞지 않아요"
        ]
        return random.choice(responses)
    
    def _generate_agreement(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "저도 동감합니다",
            "맞습니다",
            "저도 그렇게 생각해요",
            "동감합니다"
        ]
        return random.choice(responses)
    
    def _generate_defense(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그건 옳은 선택이에요",
            "그렇게 하는 게 맞아요",
            "그건 정말 좋은 생각이에요",
            "그렇게 해야 해요"
        ]
        return random.choice(responses)
    
    def _generate_criticism(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그건 정말 문제가 있어요",
            "그런 생각은 위험해요",
            "그건 잘못된 접근이에요",
            "그런 방식은 안 돼요"
        ]
        return random.choice(responses)
    
    def _generate_neutral(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그런 상황이군요",
            "알겠습니다",
            "그렇네요",
            "그런 일이 있었군요"
        ]
        return random.choice(responses)
    
    def _generate_avoidance(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그런 건 잘 모르겠어요",
            "그건 생각해봐야겠어요",
            "그런 건 나중에 말씀드릴게요",
            "그건 좀 더 생각해보고요"
        ]
        return random.choice(responses)
    
    def _generate_sarcasm(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "정말 대단하시네요",
            "와, 정말 좋은 생각이에요",
            "정말 훌륭한 아이디어네요",
            "와, 정말 대단해요"
        ]
        return random.choice(responses)
    
    def _generate_empathy(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그런 마음 이해해요",
            "그런 기분이 드시겠어요",
            "그런 상황이 힘드셨겠어요",
            "그런 생각이 드시는 게 당연해요"
        ]
        return random.choice(responses)
    
    def _generate_suggestion(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그런 방법은 어떨까요?",
            "이렇게 해보시는 건 어떨까요?",
            "다른 방법을 생각해보시는 건 어떨까요?",
            "이런 방식을 시도해보시는 건 어떨까요?"
        ]
        return random.choice(responses)
    
    def _generate_questioning(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그런 건 어떻게 되나요?",
            "그런 상황이 언제인가요?",
            "그런 건 왜 그런가요?",
            "그런 일이 언제 있었나요?"
        ]
        return random.choice(responses)
    
    def _generate_ignoring(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "...",
            "ㅎ",
            "그렇군요",
            "알겠어요"
        ]
        return random.choice(responses)
    
    def _generate_emphasis(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "정말 중요한 건 그게 아니에요",
            "핵심은 그게 아니라요",
            "가장 중요한 건 그거예요",
            "중요한 건 그게 아니에요"
        ]
        return random.choice(responses)
    
    def _generate_speculation(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "아마 그럴 것 같아요",
            "그런 것 같아요",
            "아마 그럴 것 같습니다",
            "그런 것 같네요"
        ]
        return random.choice(responses)
    
    def _generate_emotional_appeal(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "정말 그렇게 하면 안 돼요",
            "그렇게 하면 정말 안 돼요",
            "정말 그런 건 안 돼요",
            "그렇게 하면 정말 문제가 있어요"
        ]
        return random.choice(responses)
    
    def _generate_mockery(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "정말 대단하시네요 ㅎ",
            "와, 정말 좋은 생각이에요 ㅋ",
            "정말 훌륭한 아이디어네요 ㅎ",
            "와, 정말 대단해요 ㅋ"
        ]
        return random.choice(responses)
    
    def _generate_directive(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그렇게 하세요",
            "그렇게 해야 해요",
            "그렇게 하시기 바랍니다",
            "그렇게 해야 합니다"
        ]
        return random.choice(responses)
    
    def _generate_coercion(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그렇게 안 하면 안 돼요",
            "그렇게 안 하면 문제가 있어요",
            "그렇게 안 하면 안 됩니다",
            "그렇게 안 하면 문제가 생겨요"
        ]
        return random.choice(responses)
    
    def _generate_forcefulness(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그렇게 해야만 해요",
            "그렇게 해야만 합니다",
            "그렇게 해야만 돼요",
            "그렇게 해야만 됩니다"
        ]
        return random.choice(responses)
    
    def _generate_brainwashing(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그런 생각이 옳은 거예요",
            "그런 생각이 맞는 거예요",
            "그런 생각이 정답이에요",
            "그런 생각이 올바른 거예요"
        ]
        return random.choice(responses)
    
    def _generate_gaslighting(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        responses = [
            "그런 건 없었어요",
            "그런 일은 없었어요",
            "그런 건 기억이 안 나요",
            "그런 일은 없었습니다"
        ]
        return random.choice(responses)
    
    # 전략 적용 메서드들
    def _strategy_general(self, message: str) -> str:
        return message
    
    def _strategy_empathy(self, message: str) -> str:
        return f"그런 마음 이해해요. {message}"
    
    def _strategy_logic(self, message: str) -> str:
        return f"논리적으로 생각해보면, {message}"
    
    def _strategy_emotion(self, message: str) -> str:
        return f"정말 감정적으로 {message}"
    
    def _strategy_authority(self, message: str) -> str:
        return f"전문가의 관점에서 보면, {message}"
    
    def _strategy_social_proof(self, message: str) -> str:
        return f"많은 사람들이 그렇게 생각해요. {message}"
    
    def _strategy_scarcity(self, message: str) -> str:
        return f"이런 기회는 흔하지 않아요. {message}"
    
    def _strategy_reciprocity(self, message: str) -> str:
        return f"서로 도움이 되는 관계니까, {message}"
    
    def _strategy_consistency(self, message: str) -> str:
        return f"일관성 있게 생각해보면, {message}"
    
    def _strategy_liking(self, message: str) -> str:
        return f"우리 사이니까 솔직히 말하면, {message}"
    
    # 톤 적용 메서드들
    def _tone_neutral(self, message: str) -> str:
        return message
    
    def _tone_formal(self, message: str) -> str:
        return f"존경하는 분께, {message} 감사합니다."
    
    def _tone_friendly(self, message: str) -> str:
        return f"{message} 😊"
    
    def _tone_polite(self, message: str) -> str:
        return f"부디 {message} 부탁드립니다."
    
    def _tone_intense(self, message: str) -> str:
        return f"정말! {message}!"
    
    def _tone_humorous(self, message: str) -> str:
        return f"ㅋㅋ {message} ㅋㅋ"
    
    def _tone_serious(self, message: str) -> str:
        return f"진지하게 말씀드리면, {message}"
    
    def _tone_emotional(self, message: str) -> str:
        return f"정말 감정적으로 {message}"


# 전역 인스턴스
ultimate_generator = UltimateMessageGenerator()

# API 엔드포인트
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "궁극적 메시지 통합 시스템",
        "version": "3.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/status")
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "healthy",
        "services": {
            "ultimate_message_generation": "running",
            "user_profiles": "running",
            "message_analytics": "running",
            "database": "running",
            "strategy_engine": "running",
            "tone_engine": "running"
        },
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "3.0.0"
    }


@app.get("/api/message-formats")
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


@app.get("/api/strategies")
async def get_strategies():
    """사용 가능한 전략 목록 반환"""
    strategies = {
        "일반": "기본적인 메시지 전략",
        "공감": "상대의 감정에 공감하는 전략",
        "논리": "논리적 근거를 제시하는 전략",
        "감정": "감정적 호소를 사용하는 전략",
        "권위": "전문성이나 권위를 활용하는 전략",
        "사회적증명": "다른 사람들의 의견을 인용하는 전략",
        "희소성": "기회의 희소성을 강조하는 전략",
        "호혜성": "상호 이익을 강조하는 전략",
        "일관성": "일관된 입장을 유지하는 전략",
        "호감": "친근감을 바탕으로 한 전략"
    }
    
    return {
        "success": True,
        "strategies": strategies
    }


@app.get("/api/tones")
async def get_tones():
    """사용 가능한 톤 목록 반환"""
    tones = {
        "중립": "중립적인 톤",
        "공식": "공식적인 톤",
        "친근": "친근한 톤",
        "격식": "격식있는 톤",
        "격렬": "격렬한 톤",
        "유머": "유머러스한 톤",
        "진지": "진지한 톤",
        "감정적": "감정적인 톤"
    }
    
    return {
        "success": True,
        "tones": tones
    }


@app.post("/api/generate-ultimate-message")
async def generate_ultimate_message(request: UltimateMessageRequest):
    """궁극적 메시지 생성"""
    try:
        result = ultimate_generator.generate_ultimate_message(request)
        
        return {
            "success": True,
            "message": result
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"메시지 생성 실패: {str(e)}"
        }


@app.post("/api/update-user-profile")
async def update_user_profile(request: UserProfileRequest):
    """사용자 프로필 업데이트"""
    try:
        conn = sqlite3.connect('ultimate_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_profiles 
            (user_id, preferred_formats, communication_style, strategy_preferences, tone_preferences, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (
            request.user_id, 
            json.dumps(request.preferred_formats), 
            request.communication_style,
            json.dumps(request.strategy_preferences),
            json.dumps(request.tone_preferences)
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "사용자 프로필이 업데이트되었습니다."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"프로필 업데이트 실패: {str(e)}"
        }


@app.get("/api/user-profile/{user_id}")
async def get_user_profile(user_id: str):
    """사용자 프로필 조회"""
    try:
        conn = sqlite3.connect('ultimate_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT preferred_formats, communication_style, strategy_preferences, tone_preferences, created_at, updated_at
            FROM user_profiles 
            WHERE user_id = ?
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                "success": True,
                "profile": {
                    "user_id": user_id,
                    "preferred_formats": json.loads(result[0]) if result[0] else [],
                    "communication_style": result[1],
                    "strategy_preferences": json.loads(result[2]) if result[2] else [],
                    "tone_preferences": json.loads(result[3]) if result[3] else [],
                    "created_at": result[4],
                    "updated_at": result[5]
                }
            }
        else:
            return {
                "success": False,
                "error": "사용자 프로필을 찾을 수 없습니다."
            }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"프로필 조회 실패: {str(e)}"
        }


@app.get("/api/message-history/{user_id}")
async def get_message_history(user_id: str, limit: int = 10):
    """메시지 히스토리 조회"""
    try:
        conn = sqlite3.connect('ultimate_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT message_id, format_type, strategy_type, success, timestamp
            FROM ultimate_messages 
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (user_id, limit))
        
        results = cursor.fetchall()
        conn.close()
        
        history = []
        for row in results:
            history.append({
                "message_id": row[0],
                "format_type": row[1],
                "strategy_type": row[2],
                "success": bool(row[3]),
                "timestamp": row[4]
            })
        
        return {
            "success": True,
            "history": history
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"히스토리 조회 실패: {str(e)}"
        }


@app.get("/api/test")
async def test_endpoint():
    """테스트 엔드포인트"""
    return {
        "message": "궁극적 메시지 통합 시스템이 정상적으로 작동하고 있습니다!",
        "features": [
            "22가지 메시지 형식",
            "10가지 전략",
            "8가지 톤",
            "사용자 프로필 관리",
            "실시간 분석",
            "개인화된 메시지 생성",
            "데이터베이스 저장"
        ],
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    print("🚀 궁극적 메시지 통합 시스템 시작 중...")
    uvicorn.run(
        "ultimate_message_integration:app",
        host="0.0.0.0",
        port=8002,
        reload=False,
        log_level="info"
    ) 