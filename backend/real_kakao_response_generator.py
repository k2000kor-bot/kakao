#!/usr/bin/env python3
"""
실제 카카오톡 응답 생성기 v1.0
- 실제 카카오톡 대화 데이터를 기반으로 한 현실적인 응답 생성
- 감정, 주제, 사용자 스타일에 맞는 자연스러운 대화
"""

import json
import random
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import re

@dataclass
class KakaoResponseStyle:
    """카카오톡 응답 스타일"""
    user_id: str
    common_emojis: List[str]
    response_length: str  # short, medium, long
    formality_level: str  # formal, casual, very_casual
    emotion_tendency: str  # positive, neutral, negative
    topic_preference: List[str]

class RealKakaoResponseGenerator:
    """실제 카카오톡 응답 생성기"""
    
    def __init__(self):
        self.conversation_data = self._load_conversation_data()
        self.response_templates = self._initialize_response_templates()
        self.user_styles = self._analyze_user_styles()
        
    def _load_conversation_data(self) -> Dict[str, Any]:
        """대화 데이터 로드"""
        try:
            with open("kakao_conversation_analysis.json", "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return {"patterns": [], "user_profiles": {}}
    
    def _initialize_response_templates(self) -> Dict[str, Dict[str, List[str]]]:
        """응답 템플릿 초기화"""
        return {
            "greeting": {
                "positive": [
                    "안녕하세요! 😊",
                    "안녕하세요~",
                    "반가워요!",
                    "하이하이 😄",
                    "안녕하세요! 좋은 하루 보내세요"
                ],
                "neutral": [
                    "안녕하세요",
                    "안녕",
                    "반가워요",
                    "하이"
                ],
                "negative": [
                    "안녕하세요...",
                    "안녕",
                    "반가워요"
                ]
            },
            "agreement": {
                "positive": [
                    "맞아요! 👍",
                    "정말 그렇네요 😊",
                    "동감합니다!",
                    "그래요!",
                    "네, 맞습니다 👍"
                ],
                "neutral": [
                    "맞아요",
                    "그렇네요",
                    "동감합니다",
                    "네, 맞습니다"
                ],
                "negative": [
                    "맞아요...",
                    "그렇네요",
                    "동감합니다"
                ]
            },
            "disagreement": {
                "positive": [
                    "아니에요 😅",
                    "그렇지 않을 수도 있어요",
                    "다를 수도 있어요",
                    "틀렸을 수도 있어요"
                ],
                "neutral": [
                    "아니에요",
                    "그렇지 않을 수도 있어요",
                    "다를 수도 있어요"
                ],
                "negative": [
                    "아니에요...",
                    "그렇지 않을 수도 있어요",
                    "다를 수도 있어요"
                ]
            },
            "question": {
                "positive": [
                    "궁금하시군요! 😊",
                    "좋은 질문이네요 👍",
                    "알고 싶으시군요",
                    "궁금해하시는군요"
                ],
                "neutral": [
                    "궁금하시군요",
                    "좋은 질문이네요",
                    "알고 싶으시군요"
                ],
                "negative": [
                    "궁금하시군요...",
                    "좋은 질문이네요",
                    "알고 싶으시군요"
                ]
            },
            "emotion_support": {
                "positive": [
                    "기뻐하시는군요! 😊",
                    "정말 좋으시겠어요 👍",
                    "행복하시겠어요",
                    "기쁘시겠어요"
                ],
                "neutral": [
                    "그렇군요",
                    "알겠습니다",
                    "네, 맞습니다"
                ],
                "negative": [
                    "힘드시겠어요 😔",
                    "걱정되시겠어요",
                    "어려우시겠어요",
                    "조금 쉬세요 💕"
                ]
            },
            "topic_specific": {
                "부동산": {
                    "positive": [
                        "좋은 정보네요! 👍",
                        "정말 유용한 정보입니다 😊",
                        "도움이 많이 되네요",
                        "좋은 분석이에요"
                    ],
                    "neutral": [
                        "그렇군요",
                        "알겠습니다",
                        "네, 맞습니다"
                    ],
                    "negative": [
                        "걱정되시겠어요 😔",
                        "힘드시겠어요",
                        "어려운 상황이네요"
                    ]
                },
                "커뮤니티": {
                    "positive": [
                        "좋은 시설이네요! 😊",
                        "정말 편리할 것 같아요",
                        "기대되시겠어요",
                        "좋은 커뮤니티네요"
                    ],
                    "neutral": [
                        "그렇군요",
                        "알겠습니다",
                        "네, 맞습니다"
                    ],
                    "negative": [
                        "아쉽네요 😔",
                        "개선이 필요하겠어요",
                        "힘드시겠어요"
                    ]
                },
                "일상": {
                    "positive": [
                        "좋은 하루 보내세요! 😊",
                        "행복한 하루 되세요",
                        "기분 좋은 하루네요",
                        "즐거운 하루 되세요"
                    ],
                    "neutral": [
                        "그렇군요",
                        "알겠습니다",
                        "네, 맞습니다"
                    ],
                    "negative": [
                        "힘드시겠어요 😔",
                        "조금 쉬세요",
                        "걱정하지 마세요 💕"
                    ]
                }
            }
        }
    
    def _analyze_user_styles(self) -> Dict[str, KakaoResponseStyle]:
        """사용자 스타일 분석"""
        styles = {}
        
        if "user_profiles" in self.conversation_data:
            for user_id, profile in self.conversation_data["user_profiles"].items():
                # 이모티콘 사용 패턴
                emoji_usage = profile.get("emoji_usage", {})
                common_emojis = sorted(emoji_usage.items(), key=lambda x: x[1], reverse=True)[:5]
                common_emojis = [emoji for emoji, count in common_emojis if count > 0]
                
                # 응답 길이
                avg_length = profile.get("avg_message_length", 10)
                if avg_length < 5:
                    response_length = "short"
                elif avg_length < 15:
                    response_length = "medium"
                else:
                    response_length = "long"
                
                # 격식 수준
                emotion_tendency = profile.get("emotion_tendency", {})
                positive_count = emotion_tendency.get("positive", 0)
                negative_count = emotion_tendency.get("negative", 0)
                
                if positive_count > negative_count:
                    emotion_tendency_str = "positive"
                elif negative_count > positive_count:
                    emotion_tendency_str = "negative"
                else:
                    emotion_tendency_str = "neutral"
                
                # 주제 선호도
                topic_preference = profile.get("common_topics", [])
                
                styles[user_id] = KakaoResponseStyle(
                    user_id=user_id,
                    common_emojis=common_emojis,
                    response_length=response_length,
                    formality_level="casual",  # 카카오톡은 대부분 캐주얼
                    emotion_tendency=emotion_tendency_str,
                    topic_preference=topic_preference
                )
        
        return styles
    
    def generate_response(self, user_message: str, user_id: str = "default") -> str:
        """현실적인 응답 생성"""
        # 메시지 분석
        message_type = self._classify_message_type(user_message)
        emotion = self._analyze_emotion(user_message)
        topic = self._classify_topic(user_message)
        
        # 사용자 스타일 가져오기
        user_style = self.user_styles.get(user_id, self._get_default_style())
        
        # 응답 생성
        response = self._generate_contextual_response(
            message_type, emotion, topic, user_style
        )
        
        return response
    
    def _classify_message_type(self, message: str) -> str:
        """메시지 타입 분류"""
        message_lower = message.lower()
        
        # 인사
        if any(greeting in message_lower for greeting in ["안녕", "하이", "반가"]):
            return "greeting"
        
        # 질문
        if any(q in message_lower for q in ["어떻게", "언제", "어디", "왜", "무엇", "몇", "얼마", "?"]):
            return "question"
        
        # 동의
        if any(agree in message_lower for agree in ["맞", "동감", "그래", "네", "좋아", "괜찮"]):
            return "agreement"
        
        # 반대
        if any(disagree in message_lower for disagree in ["아니", "싫어", "틀렸", "다르"]):
            return "disagreement"
        
        # 감정 표현
        if any(emotion in message_lower for emotion in ["좋아", "싫어", "화나", "기쁘", "슬프", "힘들"]):
            return "emotion_support"
        
        return "general"
    
    def _analyze_emotion(self, message: str) -> str:
        """감정 분석"""
        message_lower = message.lower()
        
        positive_keywords = ["좋아", "기쁘", "행복", "만족", "감사", "고맙", "^^", "😊", "😄"]
        negative_keywords = ["슬프", "우울", "힘들", "지치", "피곤", "😢", "😭", "😔", "화나", "짜증"]
        
        if any(keyword in message_lower for keyword in positive_keywords):
            return "positive"
        elif any(keyword in message_lower for keyword in negative_keywords):
            return "negative"
        else:
            return "neutral"
    
    def _classify_topic(self, message: str) -> str:
        """주제 분류"""
        message_lower = message.lower()
        
        topic_keywords = {
            "부동산": ["아파트", "매매", "시세", "분양", "입주", "단지", "평수", "억", "환급금", "분담금"],
            "커뮤니티": ["수영장", "헬스장", "사우나", "조식", "관리비", "커뮤니티센터", "시설"],
            "일상": ["안녕", "고맙", "힘들", "좋", "나쁘", "맛있", "재미있"]
        }
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                return topic
        
        return "일반"
    
    def _get_default_style(self) -> KakaoResponseStyle:
        """기본 스타일"""
        return KakaoResponseStyle(
            user_id="default",
            common_emojis=["😊", "👍", "^^"],
            response_length="medium",
            formality_level="casual",
            emotion_tendency="neutral",
            topic_preference=[]
        )
    
    def _generate_contextual_response(self, message_type: str, emotion: str, 
                                   topic: str, user_style: KakaoResponseStyle) -> str:
        """맥락에 맞는 응답 생성"""
        # 기본 응답 템플릿 선택
        if message_type in self.response_templates:
            templates = self.response_templates[message_type]
            if emotion in templates:
                response_candidates = templates[emotion]
            else:
                response_candidates = templates["neutral"]
        else:
            # 주제별 응답
            if topic in self.response_templates["topic_specific"]:
                topic_templates = self.response_templates["topic_specific"][topic]
                if emotion in topic_templates:
                    response_candidates = topic_templates[emotion]
                else:
                    response_candidates = topic_templates["neutral"]
            else:
                response_candidates = ["그렇군요", "알겠습니다", "네, 맞습니다"]
        
        # 사용자 스타일에 따른 조정
        response = random.choice(response_candidates)
        
        # 이모티콘 추가
        if user_style.common_emojis and random.random() < 0.7:  # 70% 확률로 이모티콘 추가
            emoji = random.choice(user_style.common_emojis)
            if not any(emoji in response for emoji in ["😊", "😄", "😢", "😔", "👍", "❤️", "💕"]):
                response += f" {emoji}"
        
        # 응답 길이 조정
        if user_style.response_length == "short" and len(response) > 20:
            # 짧은 응답으로 조정
            short_responses = ["네", "그래요", "알겠어요", "좋아요"]
            response = random.choice(short_responses)
        
        return response
    
    def generate_conversation_flow(self, user_messages: List[str], user_id: str = "default") -> List[str]:
        """대화 흐름 생성"""
        responses = []
        conversation_context = {
            "topic": "일반",
            "emotion": "neutral",
            "message_count": 0
        }
        
        for message in user_messages:
            # 대화 맥락 업데이트
            conversation_context["message_count"] += 1
            conversation_context["topic"] = self._classify_topic(message)
            conversation_context["emotion"] = self._analyze_emotion(message)
            
            # 응답 생성
            response = self.generate_response(message, user_id)
            responses.append(response)
        
        return responses

# 사용 예시
if __name__ == "__main__":
    generator = RealKakaoResponseGenerator()
    
    # 테스트 메시지들
    test_messages = [
        "안녕하세요!",
        "아파트 시세가 어떻게 될까요?",
        "수영장이 정말 좋네요! 😊",
        "힘들어요 ㅠㅠ",
        "맞아요, 동감합니다",
        "아니에요, 그렇지 않아요"
    ]
    
    print("=== 실제 카카오톡 스타일 응답 생성 테스트 ===")
    
    for message in test_messages:
        response = generator.generate_response(message)
        print(f"사용자: {message}")
        print(f"AI: {response}")
        print()
    
    # 대화 흐름 테스트
    print("=== 대화 흐름 테스트 ===")
    conversation_messages = [
        "안녕하세요!",
        "아파트 시세에 대해 궁금해요",
        "수영장이 있는 단지가 좋을까요?",
        "고맙습니다!"
    ]
    
    responses = generator.generate_conversation_flow(conversation_messages)
    
    for i, (message, response) in enumerate(zip(conversation_messages, responses)):
        print(f"사용자: {message}")
        print(f"AI: {response}")
        if i < len(conversation_messages) - 1:
            print() 