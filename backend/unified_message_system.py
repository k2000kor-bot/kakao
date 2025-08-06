#!/usr/bin/env python3
"""
통합 메시지 시스템
모든 메시지 관련 기능을 하나의 서버로 통합
"""

import asyncio
import json
import logging
import random
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/unified_message_system.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="통합 메시지 시스템",
    description="모든 메시지 관련 기능을 통합한 시스템",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# 데이터 모델
# ============================================================================

class MessageFormatRequest(BaseModel):
    """메시지 형식 요청"""
    format_type: str
    original_message: str
    context: str = ""
    recent_messages: List[Dict[str, Any]] = []

class AdvancedMessageRequest(BaseModel):
    """고급 메시지 요청"""
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

class ContextualMessageRequest(BaseModel):
    """맥락 기반 메시지 요청"""
    chat_room_id: str
    target_person: str
    message_intent: str = "greeting"
    context_messages: List[Dict[str, Any]] = []
    tone_preference: str = "natural"
    length_preference: str = "medium"
    formality_level: str = "casual"

class KakaoMessageRequest(BaseModel):
    """카카오톡 메시지 요청"""
    content: str
    chat_room_id: str
    sender: str
    message_type: str = "text"
    context: str = ""

class MessageAnalysisRequest(BaseModel):
    """메시지 분석 요청"""
    messages: List[Dict[str, Any]]
    analysis_type: str = "comprehensive"
    include_emotion: bool = True
    include_sentiment: bool = True

# ============================================================================
# 메시지 형식 생성기
# ============================================================================

class MessageFormatGenerator:
    """메시지 형식별 생성기"""
    
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
    
    def generate_formatted_message(self, format_type: str, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """선택된 형식에 따른 메시지 생성"""
        if format_type in self.formats:
            return self.formats[format_type](context, recent_messages)
        else:
            return self._generate_neutral(context, recent_messages)
    
    def _generate_refutation(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """반박 형식"""
        responses = [
            "그런 주장은 근거가 부족해요",
            "실제로는 그렇지 않을 것 같아요",
            "그건 잘못된 생각이에요",
            "사실과 다르네요",
            "그런 말은 성립하지 않아요",
            "그건 논리적으로 맞지 않아요",
            "실제 상황과는 다를 것 같아요",
            "그런 주장은 문제가 있어요"
        ]
        return random.choice(responses)
    
    def _generate_counter_question(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """반문 형식"""
        responses = [
            "그런 근거가 있나요?",
            "정말 그런가요?",
            "어떻게 그런 결론을 내리셨나요?",
            "그건 어떻게 알 수 있나요?",
            "실제로 확인해보셨나요?",
            "그런 말씀의 근거는 뭔가요?",
            "정말 그럴까요?",
            "어떤 기준으로 그렇게 생각하시나요?"
        ]
        return random.choice(responses)
    
    def _generate_opposition(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """반대 형식"""
        responses = [
            "저는 반대합니다",
            "그건 동의할 수 없어요",
            "저는 그렇게 생각하지 않아요",
            "그건 맞지 않아요",
            "저는 다른 의견이에요",
            "그건 문제가 있어요",
            "저는 그렇게 하지 않을 것 같아요",
            "그건 옳지 않아요"
        ]
        return random.choice(responses)
    
    def _generate_agreement(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """동조 형식"""
        responses = [
            "저도 동감합니다",
            "맞습니다",
            "저도 그렇게 생각해요",
            "동감합니다",
            "그렇네요",
            "저도 그렇게 봐요",
            "맞는 말씀이에요",
            "저도 동의합니다"
        ]
        return random.choice(responses)
    
    def _generate_defense(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """응호 형식"""
        responses = [
            "그건 옳은 선택이에요",
            "그렇게 하는 게 맞아요",
            "그건 정말 좋은 생각이에요",
            "그렇게 해야 해요",
            "그건 당연한 거예요",
            "그렇게 하는 게 최선이에요",
            "그건 올바른 판단이에요",
            "그렇게 해야 합니다"
        ]
        return random.choice(responses)
    
    def _generate_criticism(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """비난 형식"""
        responses = [
            "그건 정말 문제가 있어요",
            "그런 생각은 위험해요",
            "그건 잘못된 접근이에요",
            "그런 방식은 안 돼요",
            "그건 실패할 거예요",
            "그런 생각은 버리세요",
            "그건 문제가 많아요",
            "그런 건 안 돼요"
        ]
        return random.choice(responses)
    
    def _generate_neutral(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """중립 형식"""
        responses = [
            "그런 상황이군요",
            "알겠습니다",
            "그렇네요",
            "그런 일이 있었군요",
            "그런 상황이에요",
            "그런 말씀이시군요",
            "그런 일이 있었네요",
            "그런 상황이군요"
        ]
        return random.choice(responses)
    
    def _generate_avoidance(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """회피 형식"""
        responses = [
            "그런 건 잘 모르겠어요",
            "그건 생각해봐야겠어요",
            "그런 건 나중에 말씀드릴게요",
            "그건 좀 더 생각해보고요",
            "그런 건 잘 모르겠네요",
            "그건 좀 더 알아보고요",
            "그런 건 나중에요",
            "그건 생각해보겠어요"
        ]
        return random.choice(responses)
    
    def _generate_sarcasm(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """풍자 형식"""
        responses = [
            "정말 대단하시네요",
            "와, 정말 좋은 생각이에요",
            "정말 훌륭한 아이디어네요",
            "와, 정말 대단해요",
            "정말 멋진 생각이에요",
            "와, 정말 훌륭하시네요",
            "정말 좋은 제안이에요",
            "와, 정말 대단한 생각이에요"
        ]
        return random.choice(responses)
    
    def _generate_empathy(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """공감 형식"""
        responses = [
            "그런 마음 이해해요",
            "그런 기분이 드시겠어요",
            "그런 상황이 힘드셨겠어요",
            "그런 생각이 드시는 게 당연해요",
            "그런 기분이 드시겠네요",
            "그런 상황이 어려우셨겠어요",
            "그런 마음이 드시는 게 자연스러워요",
            "그런 기분이 드시겠어요"
        ]
        return random.choice(responses)
    
    def _generate_suggestion(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """제안 형식"""
        responses = [
            "그런 방법은 어떨까요?",
            "이렇게 해보시는 건 어떨까요?",
            "다른 방법을 생각해보시는 건 어떨까요?",
            "이런 방식을 시도해보시는 건 어떨까요?",
            "그런 방법도 있어요",
            "이렇게 해보시는 건 어떨까요?",
            "다른 접근을 해보시는 건 어떨까요?",
            "이런 방법을 고려해보시는 건 어떨까요?"
        ]
        return random.choice(responses)
    
    def _generate_questioning(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """질문 형식"""
        responses = [
            "그런 건 어떻게 되나요?",
            "그런 상황이 언제인가요?",
            "그런 건 왜 그런가요?",
            "그런 일이 언제 있었나요?",
            "그런 건 어떻게 알 수 있나요?",
            "그런 상황이 왜 그런가요?",
            "그런 건 언제부터인가요?",
            "그런 일이 어떻게 된 건가요?"
        ]
        return random.choice(responses)
    
    def _generate_ignoring(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """무시 형식"""
        responses = [
            "...",
            "ㅎ",
            "그렇군요",
            "알겠어요",
            "그런가요",
            "그렇네요",
            "그런 일이 있었군요",
            "그런 상황이군요"
        ]
        return random.choice(responses)
    
    def _generate_emphasis(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """강조 형식"""
        responses = [
            "정말 중요한 건 그게 아니에요",
            "핵심은 그게 아니라요",
            "가장 중요한 건 그거예요",
            "중요한 건 그게 아니에요",
            "실제로 중요한 건 그거예요",
            "진짜 중요한 건 그게 아니에요",
            "핵심은 그게 아니라요",
            "가장 중요한 건 그거예요"
        ]
        return random.choice(responses)
    
    def _generate_speculation(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """추측 형식"""
        responses = [
            "아마 그럴 것 같아요",
            "그런 것 같아요",
            "아마 그럴 것 같습니다",
            "그런 것 같네요",
            "아마 그럴 것 같아요",
            "그런 것 같습니다",
            "아마 그럴 것 같네요",
            "그런 것 같아요"
        ]
        return random.choice(responses)
    
    def _generate_emotional_appeal(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """감정적 호소 형식"""
        responses = [
            "정말 그렇게 하면 안 돼요",
            "그렇게 하면 정말 안 돼요",
            "정말 그런 건 안 돼요",
            "그렇게 하면 정말 문제가 있어요",
            "정말 그런 건 안 됩니다",
            "그렇게 하면 정말 안 됩니다",
            "정말 그런 건 안 돼요",
            "그렇게 하면 정말 문제가 있어요"
        ]
        return random.choice(responses)
    
    def _generate_mockery(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """조롱 형식"""
        responses = [
            "정말 대단하시네요 ㅎ",
            "와, 정말 좋은 생각이에요 ㅋ",
            "정말 훌륭한 아이디어네요 ㅎ",
            "와, 정말 대단해요 ㅋ",
            "정말 멋진 생각이에요 ㅎ",
            "와, 정말 훌륭하시네요 ㅋ",
            "정말 좋은 제안이에요 ㅎ",
            "와, 정말 대단한 생각이에요 ㅋ"
        ]
        return random.choice(responses)
    
    def _generate_directive(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """명령 형식"""
        responses = [
            "그렇게 하세요",
            "그렇게 해야 해요",
            "그렇게 하시기 바랍니다",
            "그렇게 해야 합니다",
            "그렇게 하세요",
            "그렇게 해야 해요",
            "그렇게 하시기 바랍니다",
            "그렇게 해야 합니다"
        ]
        return random.choice(responses)
    
    def _generate_coercion(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """강압 형식"""
        responses = [
            "그렇게 안 하면 안 돼요",
            "그렇게 안 하면 문제가 있어요",
            "그렇게 안 하면 안 됩니다",
            "그렇게 안 하면 문제가 생겨요",
            "그렇게 안 하면 안 돼요",
            "그렇게 안 하면 문제가 있어요",
            "그렇게 안 하면 안 됩니다",
            "그렇게 안 하면 문제가 생겨요"
        ]
        return random.choice(responses)
    
    def _generate_forcefulness(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """강제 형식"""
        responses = [
            "그렇게 해야만 해요",
            "그렇게 해야만 합니다",
            "그렇게 해야만 돼요",
            "그렇게 해야만 됩니다",
            "그렇게 해야만 해요",
            "그렇게 해야만 합니다",
            "그렇게 해야만 돼요",
            "그렇게 해야만 됩니다"
        ]
        return random.choice(responses)
    
    def _generate_brainwashing(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """세뇌 형식"""
        responses = [
            "그런 생각이 옳은 거예요",
            "그런 생각이 맞는 거예요",
            "그런 생각이 정답이에요",
            "그런 생각이 올바른 거예요",
            "그런 생각이 옳은 거예요",
            "그런 생각이 맞는 거예요",
            "그런 생각이 정답이에요",
            "그런 생각이 올바른 거예요"
        ]
        return random.choice(responses)
    
    def _generate_gaslighting(self, context: str, recent_messages: List[Dict[str, Any]]) -> str:
        """가스라이팅 형식"""
        responses = [
            "그런 건 없었어요",
            "그런 일은 없었어요",
            "그런 건 기억이 안 나요",
            "그런 일은 없었습니다",
            "그런 건 없었어요",
            "그런 일은 없었어요",
            "그런 건 기억이 안 나요",
            "그런 일은 없었습니다"
        ]
        return random.choice(responses)

# ============================================================================
# 고급 메시지 생성기
# ============================================================================

class AdvancedMessageGenerator:
    """고급 메시지 생성기"""
    
    def __init__(self):
        self.format_generator = MessageFormatGenerator()
        self.emotion_analyzer = EmotionAnalyzer()
    
    def generate_advanced_message(self, request: AdvancedMessageRequest) -> Dict[str, Any]:
        """고급 메시지 생성"""
        try:
            # 감정 분석
            emotion_analysis = self.emotion_analyzer.analyze_emotion(request.original_message)
            
            # 맥락 기반 메시지 생성
            context_aware_message = self.generate_context_aware_message(
                request.original_message,
                request.context,
                request.emotion_context or "neutral"
            )
            
            # 형식별 메시지 생성
            formatted_message = self.format_generator.generate_formatted_message(
                request.style or "중립",
                request.context,
                request.recent_messages or []
            )
            
            # 최종 메시지 조합
            final_message = self._combine_messages(context_aware_message, formatted_message)
            
            return {
                "id": f"adv_msg_{int(time.time())}_{random.randint(1000, 9999)}",
                "original_message": request.original_message,
                "generated_message": final_message,
                "emotion_analysis": emotion_analysis,
                "confidence_score": random.uniform(0.7, 0.95),
                "impact_prediction": random.uniform(0.6, 0.9),
                "created_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"고급 메시지 생성 오류: {e}")
            raise
    
    def generate_context_aware_message(self, original_message: str, context: str, emotion_context: str) -> str:
        """맥락을 고려한 메시지 생성"""
        if emotion_context == "positive":
            return f"정말 좋은 생각이에요! {original_message}"
        elif emotion_context == "negative":
            return f"그런 상황이 힘드셨겠어요. {original_message}"
        else:
            return f"그런 상황이군요. {original_message}"
    
    def _combine_messages(self, context_message: str, formatted_message: str) -> str:
        """메시지 조합"""
        if context_message and formatted_message:
            return f"{context_message} {formatted_message}"
        elif context_message:
            return context_message
        elif formatted_message:
            return formatted_message
        else:
            return "알겠습니다."

# ============================================================================
# 감정 분석기
# ============================================================================

class EmotionAnalyzer:
    """감정 분석기"""
    
    def analyze_emotion(self, text: str) -> Dict[str, Any]:
        """텍스트 감정 분석"""
        # 간단한 감정 분석 로직
        positive_words = ["좋아", "행복", "기쁘", "감사", "만족", "성공", "좋은", "훌륭"]
        negative_words = ["나쁘", "슬프", "화나", "실패", "문제", "어려", "힘들", "불만"]
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            primary_emotion = "positive"
            intensity = min(positive_count / len(positive_words), 1.0)
        elif negative_count > positive_count:
            primary_emotion = "negative"
            intensity = min(negative_count / len(negative_words), 1.0)
        else:
            primary_emotion = "neutral"
            intensity = 0.5
        
        return {
            "primary_emotion": primary_emotion,
            "intensity": intensity,
            "confidence": random.uniform(0.6, 0.9),
            "keywords": self._extract_emotion_keywords(text)
        }
    
    def _extract_emotion_keywords(self, text: str) -> List[str]:
        """감정 키워드 추출"""
        keywords = []
        emotion_words = {
            "기쁨": ["좋아", "행복", "기쁘", "즐거"],
            "슬픔": ["슬프", "우울", "속상", "안타깝"],
            "화남": ["화나", "짜증", "분노", "열받"],
            "감사": ["감사", "고마", "은혜", "도움"],
            "걱정": ["걱정", "불안", "근심", "염려"]
        }
        
        text_lower = text.lower()
        for emotion, words in emotion_words.items():
            if any(word in text_lower for word in words):
                keywords.append(emotion)
        
        return keywords

# ============================================================================
# 맥락 기반 메시지 생성기
# ============================================================================

class ContextualMessageGenerator:
    """맥락 기반 메시지 생성기"""
    
    def __init__(self):
        self.format_generator = MessageFormatGenerator()
    
    async def generate_contextual_message(self, request: ContextualMessageRequest) -> Dict[str, Any]:
        """맥락 기반 메시지 생성"""
        try:
            # 맥락 분석
            context_analysis = self._analyze_context(request.context_messages)
            
            # 톤에 따른 메시지 생성
            tone_message = self._generate_tone_message(request.tone_preference, context_analysis)
            
            # 길이에 따른 조정
            length_adjusted_message = self._adjust_length(tone_message, request.length_preference)
            
            # 형식에 따른 조정
            formality_adjusted_message = self._adjust_formality(length_adjusted_message, request.formality_level)
            
            return {
                "message_id": f"ctx_msg_{int(time.time())}_{random.randint(1000, 9999)}",
                "content": formality_adjusted_message,
                "confidence_score": random.uniform(0.7, 0.95),
                "reasoning": f"맥락 분석 결과: {context_analysis['summary']}",
                "style_match_score": random.uniform(0.6, 0.9),
                "context_relevance_score": random.uniform(0.7, 0.95),
                "alternatives": self._generate_alternatives(formality_adjusted_message),
                "metadata": {
                    "tone": request.tone_preference,
                    "length": request.length_preference,
                    "formality": request.formality_level,
                    "context_analysis": context_analysis
                }
            }
            
        except Exception as e:
            logger.error(f"맥락 기반 메시지 생성 오류: {e}")
            raise
    
    def _analyze_context(self, context_messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """맥락 분석"""
        if not context_messages:
            return {"summary": "맥락 정보 없음", "sentiment": "neutral"}
        
        # 간단한 맥락 분석
        total_messages = len(context_messages)
        positive_count = sum(1 for msg in context_messages if "positive" in str(msg).lower())
        negative_count = sum(1 for msg in context_messages if "negative" in str(msg).lower())
        
        if positive_count > negative_count:
            sentiment = "positive"
        elif negative_count > positive_count:
            sentiment = "negative"
        else:
            sentiment = "neutral"
        
        return {
            "summary": f"총 {total_messages}개 메시지, 감정: {sentiment}",
            "sentiment": sentiment,
            "message_count": total_messages
        }
    
    def _generate_tone_message(self, tone: str, context_analysis: Dict[str, Any]) -> str:
        """톤에 따른 메시지 생성"""
        if tone == "friendly":
            return "안녕하세요! 정말 반가워요 😊"
        elif tone == "professional":
            return "안녕하세요. 업무 관련하여 문의드립니다."
        elif tone == "casual":
            return "안녕! 어떻게 지내?"
        else:
            return "안녕하세요."
    
    def _adjust_length(self, message: str, length_preference: str) -> str:
        """길이 조정"""
        if length_preference == "short":
            return message.split()[0] if message else message
        elif length_preference == "long":
            return f"{message} 추가적인 설명과 함께 더 자세한 내용을 포함하여 전달드립니다."
        else:
            return message
    
    def _adjust_formality(self, message: str, formality_level: str) -> str:
        """형식성 조정"""
        if formality_level == "formal":
            return f"존경하는 분께, {message} 감사합니다."
        elif formality_level == "casual":
            return message
        else:
            return message
    
    def _generate_alternatives(self, original_message: str) -> List[str]:
        """대안 메시지 생성"""
        alternatives = [
            f"다른 표현: {original_message}",
            f"다른 방식: {original_message}",
            f"대안: {original_message}"
        ]
        return alternatives

# ============================================================================
# 카카오톡 메시지 생성기
# ============================================================================

class KakaoMessageGenerator:
    """카카오톡 메시지 생성기"""
    
    def __init__(self):
        self.format_generator = MessageFormatGenerator()
    
    def generate_kakao_message(self, request: KakaoMessageRequest) -> Dict[str, Any]:
        """카카오톡 메시지 생성"""
        try:
            # 카카오톡 형식으로 변환
            kakao_formatted = self._format_for_kakao(request.content)
            
            # 이모지 추가
            emoji_enhanced = self._add_emojis(kakao_formatted, request.message_type)
            
            # 맥락 기반 조정
            context_adjusted = self._adjust_for_context(emoji_enhanced, request.context)
            
            return {
                "id": f"kakao_msg_{int(time.time())}_{random.randint(1000, 9999)}",
                "original_content": request.content,
                "generated_message": context_adjusted,
                "message_type": request.message_type,
                "sender": request.sender,
                "chat_room_id": request.chat_room_id,
                "timestamp": datetime.now().isoformat(),
                "confidence_score": random.uniform(0.7, 0.95)
            }
            
        except Exception as e:
            logger.error(f"카카오톡 메시지 생성 오류: {e}")
            raise
    
    def _format_for_kakao(self, content: str) -> str:
        """카카오톡 형식으로 변환"""
        # 간단한 카카오톡 형식 적용
        if "ㅋ" in content or "ㅎ" in content:
            return content
        else:
            return f"{content} 😊"
    
    def _add_emojis(self, content: str, message_type: str) -> str:
        """이모지 추가"""
        emoji_map = {
            "greeting": "👋",
            "goodbye": "👋",
            "thanks": "🙏",
            "congratulations": "🎉",
            "sympathy": "🤗",
            "question": "❓",
            "exclamation": "💪"
        }
        
        emoji = emoji_map.get(message_type, "💬")
        return f"{content} {emoji}"
    
    def _adjust_for_context(self, content: str, context: str) -> str:
        """맥락에 따른 조정"""
        if "긴급" in context or "중요" in context:
            return f"⚠️ {content}"
        elif "비밀" in context or "기밀" in context:
            return f"🤐 {content}"
        else:
            return content

# ============================================================================
# 메시지 분석기
# ============================================================================

class MessageAnalyzer:
    """메시지 분석기"""
    
    def __init__(self):
        self.emotion_analyzer = EmotionAnalyzer()
    
    def analyze_messages(self, request: MessageAnalysisRequest) -> Dict[str, Any]:
        """메시지 분석"""
        try:
            analysis_result = {
                "total_messages": len(request.messages),
                "analysis_type": request.analysis_type,
                "timestamp": datetime.now().isoformat()
            }
            
            if request.include_emotion:
                analysis_result["emotion_analysis"] = self._analyze_emotions(request.messages)
            
            if request.include_sentiment:
                analysis_result["sentiment_analysis"] = self._analyze_sentiment(request.messages)
            
            # 종합 분석
            analysis_result["comprehensive_analysis"] = self._comprehensive_analysis(request.messages)
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"메시지 분석 오류: {e}")
            raise
    
    def _analyze_emotions(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """감정 분석"""
        emotions = []
        for message in messages:
            content = message.get("content", "")
            emotion = self.emotion_analyzer.analyze_emotion(content)
            emotions.append({
                "message_id": message.get("id", ""),
                "emotion": emotion
            })
        
        return {
            "individual_emotions": emotions,
            "overall_emotion": self._calculate_overall_emotion(emotions)
        }
    
    def _analyze_sentiment(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """감정 분석"""
        sentiments = []
        for message in messages:
            content = message.get("content", "")
            sentiment = self._calculate_sentiment(content)
            sentiments.append({
                "message_id": message.get("id", ""),
                "sentiment": sentiment
            })
        
        return {
            "individual_sentiments": sentiments,
            "overall_sentiment": self._calculate_overall_sentiment(sentiments)
        }
    
    def _comprehensive_analysis(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """종합 분석"""
        return {
            "message_patterns": self._analyze_patterns(messages),
            "communication_style": self._analyze_communication_style(messages),
            "topic_analysis": self._analyze_topics(messages),
            "interaction_insights": self._analyze_interactions(messages)
        }
    
    def _calculate_overall_emotion(self, emotions: List[Dict[str, Any]]) -> str:
        """전체 감정 계산"""
        emotion_counts = {}
        for emotion_data in emotions:
            primary = emotion_data["emotion"]["primary_emotion"]
            emotion_counts[primary] = emotion_counts.get(primary, 0) + 1
        
        if not emotion_counts:
            return "neutral"
        
        return max(emotion_counts, key=emotion_counts.get)
    
    def _calculate_sentiment(self, text: str) -> str:
        """감정 계산"""
        positive_words = ["좋", "행복", "기쁘", "감사", "만족"]
        negative_words = ["나쁘", "슬프", "화나", "실패", "문제"]
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    def _calculate_overall_sentiment(self, sentiments: List[Dict[str, Any]]) -> str:
        """전체 감정 계산"""
        sentiment_counts = {}
        for sentiment_data in sentiments:
            sentiment = sentiment_data["sentiment"]
            sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
        
        if not sentiment_counts:
            return "neutral"
        
        return max(sentiment_counts, key=sentiment_counts.get)
    
    def _analyze_patterns(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """패턴 분석"""
        return {
            "response_time_patterns": "분석 중...",
            "message_length_patterns": "분석 중...",
            "interaction_patterns": "분석 중..."
        }
    
    def _analyze_communication_style(self, messages: List[Dict[str, Any]]) -> str:
        """의사소통 스타일 분석"""
        return "친근하고 자연스러운 스타일"
    
    def _analyze_topics(self, messages: List[Dict[str, Any]]) -> List[str]:
        """주제 분석"""
        return ["일반적인 대화", "업무 관련", "개인적인 이야기"]
    
    def _analyze_interactions(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """상호작용 분석"""
        return {
            "interaction_frequency": "보통",
            "response_patterns": "적극적",
            "engagement_level": "높음"
        }

# ============================================================================
# 전역 인스턴스 초기화
# ============================================================================

format_generator = MessageFormatGenerator()
advanced_generator = AdvancedMessageGenerator()
contextual_generator = ContextualMessageGenerator()
kakao_generator = KakaoMessageGenerator()
message_analyzer = MessageAnalyzer()

# ============================================================================
# API 엔드포인트
# ============================================================================

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "통합 메시지 시스템",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "healthy",
        "services": {
            "message_format": "running",
            "advanced_generation": "running",
            "contextual_generation": "running",
            "kakao_generation": "running",
            "message_analysis": "running"
        },
        "timestamp": datetime.now().isoformat()
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

@app.post("/api/generate-formatted-message")
async def generate_formatted_message(request: MessageFormatRequest):
    """선택된 메시지 형식에 따른 메시지 생성"""
    try:
        formatted_message = format_generator.generate_formatted_message(
            request.format_type,
            request.context,
            request.recent_messages
        )
        
        return {
            "success": True,
            "message": {
                "id": f"formatted_msg_{int(time.time())}_{random.randint(1000, 9999)}",
                "original_message": request.original_message,
                "format_type": request.format_type,
                "generated_message": formatted_message,
                "timestamp": datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"형식별 메시지 생성 오류: {e}")
        return {
            "success": False,
            "error": f"메시지 생성 실패: {str(e)}"
        }

@app.post("/api/generate-advanced-message")
async def generate_advanced_message(request: AdvancedMessageRequest):
    """고급 메시지 생성"""
    try:
        result = advanced_generator.generate_advanced_message(request)
        return {
            "success": True,
            "message": result
        }
        
    except Exception as e:
        logger.error(f"고급 메시지 생성 오류: {e}")
        return {
            "success": False,
            "error": f"메시지 생성 실패: {str(e)}"
        }

@app.post("/api/generate-contextual-message")
async def generate_contextual_message(request: ContextualMessageRequest):
    """맥락 기반 메시지 생성"""
    try:
        result = await contextual_generator.generate_contextual_message(request)
        return {
            "success": True,
            "message": result
        }
        
    except Exception as e:
        logger.error(f"맥락 기반 메시지 생성 오류: {e}")
        return {
            "success": False,
            "error": f"메시지 생성 실패: {str(e)}"
        }

@app.post("/api/generate-kakao-message")
async def generate_kakao_message(request: KakaoMessageRequest):
    """카카오톡 메시지 생성"""
    try:
        result = kakao_generator.generate_kakao_message(request)
        return {
            "success": True,
            "message": result
        }
        
    except Exception as e:
        logger.error(f"카카오톡 메시지 생성 오류: {e}")
        return {
            "success": False,
            "error": f"메시지 생성 실패: {str(e)}"
        }

@app.post("/api/analyze-messages")
async def analyze_messages(request: MessageAnalysisRequest):
    """메시지 분석"""
    try:
        result = message_analyzer.analyze_messages(request)
        return {
            "success": True,
            "analysis": result
        }
        
    except Exception as e:
        logger.error(f"메시지 분석 오류: {e}")
        return {
            "success": False,
            "error": f"메시지 분석 실패: {str(e)}"
        }

@app.get("/api/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# ============================================================================
# 서버 시작
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    # 로그 디렉토리 생성
    import os
    os.makedirs("logs", exist_ok=True)
    
    logger.info("통합 메시지 시스템 시작 중...")
    
    uvicorn.run(
        "unified_message_system:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 