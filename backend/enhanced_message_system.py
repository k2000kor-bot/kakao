#!/usr/bin/env python3
"""
향상된 메시지 시스템
고급 기능들을 추가한 통합 메시지 시스템
"""

import json
import random
import time
import sqlite3
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# FastAPI 앱 생성
app = FastAPI(
    title="향상된 메시지 시스템",
    description="고급 기능을 포함한 통합 메시지 시스템",
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
def init_database():
    """데이터베이스 초기화"""
    conn = sqlite3.connect('enhanced_message_system.db')
    cursor = conn.cursor()
    
    # 메시지 히스토리 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS message_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT UNIQUE,
            format_type TEXT,
            original_message TEXT,
            generated_message TEXT,
            context TEXT,
            user_id TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            success BOOLEAN,
            feedback_score REAL
        )
    ''')
    
    # 사용자 프로필 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE,
            preferred_formats TEXT,
            communication_style TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 메시지 분석 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS message_analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT,
            emotion_score REAL,
            sentiment_score REAL,
            complexity_score REAL,
            impact_prediction REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# 데이터베이스 초기화 실행
init_database()

# 데이터 모델
class MessageFormatRequest(BaseModel):
    format_type: str
    original_message: str
    context: str = ""
    recent_messages: List[Dict[str, Any]] = []
    user_id: str = "default"

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
    recent_messages: Optional[List[Dict[str, Any]]] = None

class UserProfileRequest(BaseModel):
    user_id: str
    preferred_formats: List[str]
    communication_style: str

class MessageAnalysisRequest(BaseModel):
    messages: List[Dict[str, Any]]
    analysis_type: str = "comprehensive"

@dataclass
class MessageAnalytics:
    """메시지 분석 결과"""
    emotion_score: float
    sentiment_score: float
    complexity_score: float
    impact_prediction: float
    keywords: List[str]
    tone: str
    formality_level: str

class EnhancedMessageFormat:
    """향상된 메시지 형식 생성기"""
    
    def __init__(self):
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
        
        # 감정 분석 키워드
        self.emotion_keywords = {
            "positive": ["좋아", "행복", "기쁘", "감사", "만족", "성공", "좋은", "훌륭"],
            "negative": ["나쁘", "슬프", "화나", "실패", "문제", "어려", "힘들", "불만"],
            "neutral": ["그렇", "알겠", "그런", "그런데", "그리고", "하지만"]
        }
    
    def generate_formatted_message(self, format_type: str, context: str, recent_messages: List[Dict[str, Any]], user_id: str = "default") -> Dict[str, Any]:
        """향상된 메시지 생성"""
        try:
            # 사용자 프로필 분석
            user_profile = self._get_user_profile(user_id)
            
            # 맥락 분석
            context_analysis = self._analyze_context(context, recent_messages)
            
            # 형식별 메시지 생성
            if format_type in self.formats:
                base_message = self.formats[format_type](context, recent_messages)
            else:
                base_message = self._generate_neutral(context, recent_messages)
            
            # 사용자 스타일에 맞게 조정
            personalized_message = self._personalize_message(base_message, user_profile)
            
            # 메시지 분석
            analytics = self._analyze_message(personalized_message)
            
            # 데이터베이스에 저장
            message_id = f"enhanced_msg_{int(time.time())}_{random.randint(1000, 9999)}"
            self._save_message_history(message_id, format_type, context, personalized_message, user_id, analytics)
            
            return {
                "id": message_id,
                "original_message": context,
                "format_type": format_type,
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
    
    def _get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """사용자 프로필 조회"""
        conn = sqlite3.connect('enhanced_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT preferred_formats, communication_style 
            FROM user_profiles 
            WHERE user_id = ?
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                "preferred_formats": json.loads(result[0]) if result[0] else [],
                "communication_style": result[1] or "neutral"
            }
        else:
            return {
                "preferred_formats": [],
                "communication_style": "neutral"
            }
    
    def _analyze_context(self, context: str, recent_messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """맥락 분석"""
        # 간단한 맥락 분석
        total_messages = len(recent_messages)
        context_length = len(context)
        
        # 감정 분석
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
    
    def _personalize_message(self, message: str, user_profile: Dict[str, Any]) -> str:
        """사용자 스타일에 맞게 메시지 개인화"""
        style = user_profile.get("communication_style", "neutral")
        
        if style == "formal":
            return f"존경하는 분께, {message} 감사합니다."
        elif style == "casual":
            return f"{message} 😊"
        elif style == "professional":
            return f"{message} (업무용)"
        else:
            return message
    
    def _analyze_message(self, message: str) -> MessageAnalytics:
        """메시지 분석"""
        # 감정 점수 계산
        positive_score = sum(1 for word in self.emotion_keywords["positive"] if word in message.lower())
        negative_score = sum(1 for word in self.emotion_keywords["negative"] if word in message.lower())
        
        emotion_score = (positive_score - negative_score) / max(len(self.emotion_keywords["positive"]), 1)
        sentiment_score = (positive_score + negative_score) / max(len(self.emotion_keywords["positive"] + self.emotion_keywords["negative"]), 1)
        
        # 복잡도 점수
        complexity_score = len(message.split()) / 20.0  # 단어 수 기반
        
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
        
        return MessageAnalytics(
            emotion_score=emotion_score,
            sentiment_score=sentiment_score,
            complexity_score=complexity_score,
            impact_prediction=impact_prediction,
            keywords=keywords[:5],  # 상위 5개 키워드
            tone=tone,
            formality_level=formality_level
        )
    
    def _save_message_history(self, message_id: str, format_type: str, original_message: str, generated_message: str, user_id: str, analytics: MessageAnalytics):
        """메시지 히스토리 저장"""
        conn = sqlite3.connect('enhanced_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO message_history 
            (message_id, format_type, original_message, generated_message, user_id, success)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (message_id, format_type, original_message, generated_message, user_id, True))
        
        # 분석 결과 저장
        cursor.execute('''
            INSERT INTO message_analytics 
            (message_id, emotion_score, sentiment_score, complexity_score, impact_prediction)
            VALUES (?, ?, ?, ?, ?)
        ''', (message_id, analytics.emotion_score, analytics.sentiment_score, analytics.complexity_score, analytics.impact_prediction))
        
        conn.commit()
        conn.close()
    
    # 기존 메시지 생성 메서드들 (간단한 버전)
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

# 전역 인스턴스
enhanced_generator = EnhancedMessageFormat()

# API 엔드포인트
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "향상된 메시지 시스템",
        "version": "2.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "healthy",
        "services": {
            "enhanced_message_format": "running",
            "user_profiles": "running",
            "message_analytics": "running",
            "database": "running"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
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

@app.post("/api/generate-enhanced-message")
async def generate_enhanced_message(request: MessageFormatRequest):
    """향상된 메시지 생성"""
    try:
        result = enhanced_generator.generate_formatted_message(
            request.format_type,
            request.original_message,
            request.recent_messages,
            request.user_id
        )
        
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
        conn = sqlite3.connect('enhanced_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_profiles 
            (user_id, preferred_formats, communication_style, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ''', (request.user_id, json.dumps(request.preferred_formats), request.communication_style))
        
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
        conn = sqlite3.connect('enhanced_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT preferred_formats, communication_style, created_at, updated_at
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
                    "created_at": result[2],
                    "updated_at": result[3]
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
        conn = sqlite3.connect('enhanced_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT message_id, format_type, original_message, generated_message, timestamp, success
            FROM message_history 
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
                "original_message": row[2],
                "generated_message": row[3],
                "timestamp": row[4],
                "success": bool(row[5])
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

@app.get("/api/analytics/{message_id}")
async def get_message_analytics(message_id: str):
    """메시지 분석 결과 조회"""
    try:
        conn = sqlite3.connect('enhanced_message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT emotion_score, sentiment_score, complexity_score, impact_prediction, timestamp
            FROM message_analytics 
            WHERE message_id = ?
        ''', (message_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                "success": True,
                "analytics": {
                    "emotion_score": result[0],
                    "sentiment_score": result[1],
                    "complexity_score": result[2],
                    "impact_prediction": result[3],
                    "timestamp": result[4]
                }
            }
        else:
            return {
                "success": False,
                "error": "분석 결과를 찾을 수 없습니다."
            }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"분석 결과 조회 실패: {str(e)}"
        }

@app.get("/api/test")
async def test_endpoint():
    """테스트 엔드포인트"""
    return {
        "message": "향상된 메시지 시스템이 정상적으로 작동하고 있습니다!",
        "features": [
            "사용자 프로필 관리",
            "메시지 히스토리",
            "실시간 분석",
            "개인화된 메시지 생성"
        ],
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    print("🚀 향상된 메시지 시스템 시작 중...")
    uvicorn.run(
        "enhanced_message_system:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    ) 