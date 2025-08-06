#!/usr/bin/env python3
"""
고급 AI 메시지 생성 시스템
- 자연스러운 대화 스타일
- 컨텍스트 기반 응답
- 감정 분석 및 적절한 톤 조절
- 다국어 지원
- 개인화된 응답 스타일
"""

import random
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)


class AdvancedAIMessageGenerator:
    def __init__(self):
        self.conversation_history = []
        self.user_preferences = {}
        self.response_templates = self._load_response_templates()
        self.emotion_analyzer = self._load_emotion_analyzer()
        self.language_detector = self._load_language_detector()
        self.personality_profiles = self._load_personality_profiles()
        
    def _load_response_templates(self) -> Dict[str, List[str]]:
        """응답 템플릿 로드"""
        return {
            "greeting": [
                "안녕하세요! 어떤 도움이 필요하신가요?",
                "반갑습니다! 무엇을 도와드릴까요?",
                "안녕하세요! 오늘도 좋은 하루 되세요.",
                "반갑습니다! 무엇이든 물어보세요."
            ],
            "question": [
                "좋은 질문이네요! {answer}",
                "흥미로운 질문입니다. {answer}",
                "그것에 대해 말씀드리면, {answer}",
                "좋은 지적이에요. {answer}"
            ],
            "request": [
                "네, 도와드리겠습니다! {action}",
                "물론이죠! {action}",
                "기꺼이 도와드릴게요. {action}",
                "네, 바로 처리해드리겠습니다. {action}"
            ],
            "general": [
                "그렇군요! {response}",
                "흥미롭네요. {response}",
                "좋은 생각이에요. {response}",
                "맞습니다! {response}"
            ],
            "english": {
                "greeting": [
                    "Hello! How can I help you today?",
                    "Hi there! What can I assist you with?",
                    "Good to see you! What do you need help with?",
                    "Welcome! How may I be of service?"
                ],
                "question": [
                    "Great question! {answer}",
                    "That's an interesting question. {answer}",
                    "Let me tell you about that. {answer}",
                    "Good point! {answer}"
                ],
                "request": [
                    "Sure, I'll help you! {action}",
                    "Of course! {action}",
                    "I'd be happy to help. {action}",
                    "No problem! {action}"
                ],
                "general": [
                    "I see! {response}",
                    "That's interesting. {response}",
                    "Good thinking. {response}",
                    "You're right! {response}"
                ]
            }
        }
    
    def _load_emotion_analyzer(self) -> Dict[str, Any]:
        """감정 분석기 로드"""
        return {
            "positive": [
                "좋아", "감사", "행복", "즐거", "훌륭", "완벽", "최고",
                "사랑", "기쁘", "만족"
            ],
            "negative": [
                "싫어", "화나", "짜증", "불만", "실망", "우울", "스트레스", 
                "걱정", "불안", "분노"
            ],
            "neutral": ["그래", "알겠", "네", "응", "좋", "괜찮", "보통", "일반"],
            "question": ["?", "무엇", "어떻게", "왜", "언제", "어디", "누가", "어떤"],
            "request": ["도와", "부탁", "해줘", "해주", "원해", "필요", "원하", "요청"]
        }
    
    def _load_language_detector(self) -> Dict[str, List[str]]:
        """언어 감지기 로드"""
        return {
            "korean": [
                "안녕", "감사", "도와", "부탁", "좋아", "싫어", "그래", "네", "응"
            ],
            "english": [
                "hello", "thank", "help", "please", "good", "bad", "yes", "no", "okay"
            ],
            "japanese": [
                "こんにちは", "ありがとう", "お願い", "助けて", "良い", "悪い", "はい", "いいえ"
            ],
            "chinese": ["你好", "谢谢", "请", "帮助", "好", "坏", "是", "不"]
        }
    
    def _load_personality_profiles(self) -> Dict[str, Dict[str, Any]]:
        """개성 프로필 로드"""
        return {
            "friendly": {
                "tone": "친근하고 따뜻한",
                "style": "친구처럼 편안하게",
                "emoji_usage": "😊",
                "formality": "반말과 존댓말 혼용"
            },
            "professional": {
                "tone": "전문적이고 신뢰할 수 있는",
                "style": "업무 중심의 정확한 정보 제공",
                "emoji_usage": "💼",
                "formality": "존댓말 위주"
            },
            "creative": {
                "tone": "창의적이고 독창적인",
                "style": "새로운 아이디어와 관점 제시",
                "emoji_usage": "🎨",
                "formality": "자유로운 표현"
            },
            "caring": {
                "tone": "배려심 깊고 공감적인",
                "style": "사용자의 감정에 공감하며 지원",
                "emoji_usage": "🤗",
                "formality": "따뜻한 존댓말"
            }
        }
    
    def detect_language(self, text: str) -> str:
        """텍스트 언어 감지"""
        text_lower = text.lower()
        
        for lang, keywords in self.language_detector.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return lang
        
        # 기본값은 한국어
        return "korean"
    
    def analyze_emotion(self, text: str) -> str:
        """텍스트 감정 분석"""
        text_lower = text.lower()
        
        # 긍정적 감정 키워드 확인
        positive_count = sum(
            1 for word in self.emotion_analyzer["positive"] 
            if word in text_lower
        )
        negative_count = sum(
            1 for word in self.emotion_analyzer["negative"] 
            if word in text_lower
        )
        question_count = sum(
            1 for word in self.emotion_analyzer["question"] 
            if word in text_lower
        )
        request_count = sum(
            1 for word in self.emotion_analyzer["request"] 
            if word in text_lower
        )
        
        if question_count > 0:
            return "question"
        elif request_count > 0:
            return "request"
        elif positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    def get_personality_profile(self, user_id: str = "default") -> Dict[str, Any]:
        """사용자 개성 프로필 가져오기"""
        # 실제로는 사용자별 개성 설정을 저장/로드해야 함
        return self.personality_profiles.get(
            "friendly", self.personality_profiles["friendly"]
        )
    
    def generate_response(
        self, user_message: str, context: Optional[Dict[str, Any]] = None
    ) -> str:
        """고급 AI 응답 생성"""
        try:
            # 언어 감지
            language = self.detect_language(user_message)
            
            # 감정 분석
            emotion = self.analyze_emotion(user_message)
            
            # 컨텍스트 분석
            context_info = self._analyze_context(user_message, context)
            
            # 사용자 개성 프로필
            user_id = context.get("user_id", "default")
            personality = self.get_personality_profile(user_id)
            
            # 응답 생성
            response = self._generate_contextual_response(
                user_message, emotion, context_info, language, personality
            )
            
            # 대화 히스토리에 추가
            self.conversation_history.append({
                "user_message": user_message,
                "ai_response": response,
                "emotion": emotion,
                "language": language,
                "timestamp": datetime.now().isoformat()
            })
            
            return response
            
        except Exception as e:
            logger.error(f"응답 생성 중 오류 발생: {e}")
            return "죄송합니다. 응답을 생성하는 중에 문제가 발생했습니다."
    
    def _analyze_context(
        self, message: str, context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """메시지 컨텍스트 분석"""
        question_words = ["무엇", "어떻게", "왜", "언제", "어디", "누가", "어떤"]
        greeting_words = ["안녕", "반갑", "hello", "hi"]
        request_words = ["도와", "부탁", "해줘", "해주", "원해", "필요", "원하", "요청"]
        thanks_words = ["감사", "고마", "thank", "thanks"]
        
        context_info = {
            "is_question": "?" in message or any(word in message for word in question_words),
            "is_greeting": any(word in message for word in greeting_words),
            "is_request": any(word in message for word in request_words),
            "is_thanks": any(word in message for word in thanks_words),
            "project_type": context.get("project_type", "general") if context else "general",
            "user_id": context.get("user_id", "default") if context else "default",
            "conversation_length": len(self.conversation_history)
        }
        
        return context_info
    
    def _generate_contextual_response(
        self, message: str, emotion: str, context: Dict[str, Any], 
        language: str, personality: Dict[str, Any]
    ) -> str:
        """컨텍스트 기반 응답 생성"""
        try:
            if context["is_greeting"]:
                return self._generate_greeting_response(language, personality)
            elif context["is_question"]:
                return self._generate_question_response(
                    message, emotion, context, language, personality
                )
            elif context["is_request"]:
                return self._generate_request_response(
                    message, emotion, context, language, personality
                )
            elif context["is_thanks"]:
                return self._generate_thanks_response(language, personality)
            else:
                return self._generate_general_response(
                    message, emotion, context, language, personality
                )
        except Exception as e:
            logger.error(f"컨텍스트 응답 생성 중 오류: {e}")
            return "죄송합니다. 응답을 생성하는 중에 문제가 발생했습니다."
    
    def _generate_greeting_response(
        self, language: str, personality: Dict[str, Any]
    ) -> str:
        """인사 응답 생성"""
        if language == "english":
            templates = self.response_templates["english"]["greeting"]
        else:
            templates = self.response_templates["greeting"]
        
        response = random.choice(templates)
        return f"{personality['emoji_usage']} {response}"
    
    def _generate_question_response(
        self, message: str, emotion: str, context: Dict[str, Any], 
        language: str, personality: Dict[str, Any]
    ) -> str:
        """질문 응답 생성"""
        # 질문 유형에 따른 맞춤 응답
        if "무엇" in message or "what" in message.lower():
            answer = "그것에 대해 자세히 설명드릴게요."
        elif "어떻게" in message or "how" in message.lower():
            answer = "단계별로 안내해드리겠습니다."
        elif "왜" in message or "why" in message.lower():
            answer = "그 이유를 설명드리겠습니다."
        else:
            answer = "좋은 질문이에요! 답변해드릴게요."
        
        if language == "english":
            templates = self.response_templates["english"]["question"]
        else:
            templates = self.response_templates["question"]
        
        response = random.choice(templates).format(answer=answer)
        return f"{personality['emoji_usage']} {response}"
    
    def _generate_request_response(
        self, message: str, emotion: str, context: Dict[str, Any], 
        language: str, personality: Dict[str, Any]
    ) -> str:
        """요청 응답 생성"""
        action = "바로 도와드리겠습니다!"
        
        if language == "english":
            templates = self.response_templates["english"]["request"]
        else:
            templates = self.response_templates["request"]
        
        response = random.choice(templates).format(action=action)
        return f"{personality['emoji_usage']} {response}"
    
    def _generate_thanks_response(
        self, language: str, personality: Dict[str, Any]
    ) -> str:
        """감사 응답 생성"""
        if language == "english":
            return (f"{personality['emoji_usage']} You're welcome! "
                   "I'm glad I could help.")
        else:
            return f"{personality['emoji_usage']} 천만에요! 도움이 되어서 기뻐요."
    
    def _generate_general_response(
        self, message: str, emotion: str, context: Dict[str, Any], 
        language: str, personality: Dict[str, Any]
    ) -> str:
        """일반 응답 생성"""
        # 감정에 따른 응답 조절
        if emotion == "positive":
            response = "정말 좋은 생각이에요!"
        elif emotion == "negative":
            response = "걱정이 되시겠어요. 도움이 필요하시면 언제든 말씀해주세요."
        else:
            response = "흥미로운 이야기네요."
        
        if language == "english":
            templates = self.response_templates["english"]["general"]
        else:
            templates = self.response_templates["general"]
        
        response_text = random.choice(templates).format(response=response)
        return f"{personality['emoji_usage']} {response_text}"
    
    def generate_project_suggestion(self, project_type: str = "general") -> str:
        """프로젝트 제안 생성"""
        suggestions = {
            "general": [
                "새로운 프로젝트를 시작해보는 건 어떨까요?",
                "오늘은 어떤 작업을 계획하고 계신가요?",
                "새로운 아이디어가 떠오르셨나요?"
            ],
            "business": [
                "비즈니스 전략에 대해 이야기해보시겠어요?",
                "새로운 마케팅 아이디어가 있으신가요?",
                "고객 분석 결과를 살펴보시겠어요?"
            ],
            "creative": [
                "창의적인 프로젝트를 시작해보시겠어요?",
                "새로운 디자인 아이디어가 떠오르셨나요?",
                "예술적 영감을 찾고 계신가요?"
            ]
        }
        
        project_suggestions = suggestions.get(
            project_type, suggestions["general"]
        )
        return random.choice(project_suggestions)
    
    def generate_file_analysis_summary(self, file_info: Dict[str, Any]) -> str:
        """파일 분석 요약 생성"""
        file_name = file_info.get("name", "파일")
        file_size = file_info.get("size", 0)
        
        summary = f"📄 {file_name} 파일 분석이 완료되었습니다!"
        if file_size > 0:
            summary += f" (크기: {file_size} bytes)"
        
        return summary
    
    def get_conversation_summary(self) -> Dict[str, Any]:
        """대화 요약 정보"""
        if not self.conversation_history:
            return {"summary": "아직 대화가 없습니다."}
        
        total_messages = len(self.conversation_history)
        emotions = [
            msg.get("emotion", "neutral") for msg in self.conversation_history
        ]
        languages = [
            msg.get("language", "korean") for msg in self.conversation_history
        ]
        
        emotion_counts = {}
        for emotion in emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        dominant_emotion = (
            max(emotion_counts.items(), key=lambda x: x[1])[0] 
            if emotion_counts else "neutral"
        )
        dominant_language = (
            max(set(languages), key=languages.count) 
            if languages else "korean"
        )
        
        return {
            "total_messages": total_messages,
            "dominant_emotion": dominant_emotion,
            "dominant_language": dominant_language,
            "emotion_distribution": emotion_counts,
            "summary": (
                f"총 {total_messages}개의 메시지가 교환되었습니다. "
                f"주요 감정: {dominant_emotion}, 주요 언어: {dominant_language}"
            )
        }
    
    def clear_history(self):
        """대화 히스토리 초기화"""
        self.conversation_history = []
        logger.info("대화 히스토리가 초기화되었습니다.")
    
    def set_user_preference(self, user_id: str, preference: Dict[str, Any]):
        """사용자 선호도 설정"""
        self.user_preferences[user_id] = preference
        logger.info(f"사용자 {user_id}의 선호도가 설정되었습니다.")
    
    def get_user_preference(self, user_id: str) -> Dict[str, Any]:
        """사용자 선호도 조회"""
        return self.user_preferences.get(user_id, {})


# 싱글톤 인스턴스
ai_message_generator = AdvancedAIMessageGenerator() 