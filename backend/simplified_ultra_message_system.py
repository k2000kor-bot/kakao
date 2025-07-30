#!/usr/bin/env python3
"""
OpenAI 기반 고품질 카카오톡 메시지 생성 시스템
진정한 AI 수준의 대화형 메시지 생성
"""

import os
import json
import random
import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

# OpenAI 클라이언트 임포트 (설치되지 않은 경우 폴백)
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("OpenAI 라이브러리가 설치되지 않았습니다. 로컬 모드로 동작합니다.")

class EmotionType(Enum):
    JOY = "joy"
    SADNESS = "sadness"
    ANGER = "anger"
    FEAR = "fear"
    NEUTRAL = "neutral"
    EXCITEMENT = "excitement"
    CONCERN = "concern"

@dataclass
class SimplifiedEmotionAnalysis:
    primary_emotion: EmotionType
    intensity: float
    confidence: float

@dataclass
class SimplifiedPersonalityProfile:
    communication_style: Optional[Dict[str, float]] = None

class SimplifiedMessageGenerator:
    """고품질 OpenAI 기반 메시지 생성기"""
    
    def __init__(self):
        # OpenAI API 키 설정
        if OPENAI_AVAILABLE:
            openai.api_key = os.getenv('OPENAI_API_KEY', '')
        
        self.conversation_memory = {}
        
        # 카카오톡 특화 시스템 프롬프트
        self.kakao_system_prompt = """
당신은 카카오톡 메시지 작성 전문가입니다. 자연스럽고 친근한 카카오톡 스타일의 메시지를 작성합니다.

핵심 원칙:
1. 자연스럽고 친근한 톤 유지
2. 카카오톡 특유의 편안한 대화 스타일
3. 적절한 이모지 사용 (과도하지 않게)
4. 상대방의 상황과 감정에 맞는 공감적 반응
5. 실용적이고 도움이 되는 정보 제공
6. 부담스럽지 않은 친근한 어조

메시지 특징:
- "~이에요", "~어요" 등 친근한 종결어 사용
- 적절한 이모지로 감정 표현
- 자연스러운 대화 흐름
- 상대방의 입장을 고려한 공감적 반응
- 실용적이고 구체적인 조언
- 부담스럽지 않은 친근한 톤
"""

        # 상황별 특화 프롬프트
        self.situation_templates = {
            "comfort": """
위로가 필요한 상황입니다. 
진심어린 공감과 따뜻한 위로의 메시지를 작성해주세요.
상대방의 마음을 이해하고 있다는 것을 전달하되, 
억지로 위로하려 하지 말고 함께 있어준다는 느낌으로 작성해주세요.
""",
            "celebration": """
기쁜 소식이나 축하할 일이 있는 상황입니다.
함께 기뻐하고 진심으로 축하하는 메시지를 작성해주세요.
상대방의 기쁨에 공감하고 같이 행복해하는 마음을 전달해주세요.
""",
            "support": """
응원과 격려가 필요한 상황입니다.
힘을 주고 용기를 북돋우는 메시지를 작성해주세요.
상대방을 믿고 있다는 마음을 전달해주세요.
""",
            "casual": """
일상적인 편안한 대화 상황입니다.
자연스럽고 친근한 메시지를 작성해주세요.
부담스럽지 않으면서도 관심을 보이는 메시지로 작성해주세요.
""",
            "advice": """
조언이나 도움이 필요한 상황입니다.
도움이 되는 실질적인 조언을 친근하게 전달해주세요.
강요하지 않으면서도 유용한 정보를 제공해주세요.
"""
        }

    async def generate_message(self, text: str, emotion: SimplifiedEmotionAnalysis, 
                             personality: Optional[SimplifiedPersonalityProfile] = None,
                             context: Optional[Dict[str, Any]] = None) -> str:
        """메인 메시지 생성 함수"""
        
        try:
            # OpenAI 사용 가능한 경우
            if OPENAI_AVAILABLE and openai.api_key:
                return await self._generate_with_openai(text, emotion, personality, context)
            else:
                # 폴백: 고도화된 로컬 생성
                return await self._generate_with_advanced_local(text, emotion, personality, context)
        
        except Exception as e:
            print(f"메시지 생성 오류: {e}")
            return self._generate_safe_fallback(text, emotion)

    async def _generate_with_openai(self, text: str, emotion: SimplifiedEmotionAnalysis,
                                  personality: Optional[SimplifiedPersonalityProfile],
                                  context: Optional[Dict[str, Any]]) -> str:
        """OpenAI 기반 메시지 생성"""
        
        # 상황 분석
        situation = self._analyze_situation_advanced(text, emotion)
        
        # 프롬프트 구성
        user_prompt = self._build_kakao_prompt(text, emotion, situation, personality, context)
        
        try:
            # OpenAI API 호출
            response = await self._call_openai_api(user_prompt)
            
            # 카카오톡 스타일 후처리
            optimized_message = self._optimize_for_kakao_style(response, personality)
            
            return optimized_message
            
        except Exception as e:
            print(f"OpenAI API 오류: {e}")
            # API 실패시 고도화된 로컬 생성으로 폴백
            return await self._generate_with_advanced_local(text, emotion, personality, context)

    def _analyze_situation_advanced(self, text: str, emotion: SimplifiedEmotionAnalysis) -> str:
        """고도화된 상황 분석"""
        text_lower = text.lower()
        
        # 감정 기반 1차 분류
        if emotion.primary_emotion in [EmotionType.SADNESS, EmotionType.FEAR]:
            # 위로 키워드 추가 확인
            comfort_keywords = ["힘들", "우울", "슬프", "걱정", "불안", "스트레스", "피곤", "지쳐"]
            if any(keyword in text_lower for keyword in comfort_keywords):
                return "comfort"
            else:
                return "support"
        
        elif emotion.primary_emotion in [EmotionType.JOY, EmotionType.EXCITEMENT]:
            # 축하 키워드 확인
            celebration_keywords = ["축하", "성공", "합격", "승진", "통과", "결혼", "생일", "기쁘"]
            if any(keyword in text_lower for keyword in celebration_keywords):
                return "celebration"
            else:
                return "casual"
        
        elif emotion.primary_emotion == EmotionType.ANGER:
            return "support"  # 화난 상황에서는 지지 필요
        
        # 도움 요청 키워드
        advice_keywords = ["어떻게", "방법", "도움", "조언", "추천", "알려줘", "가르쳐"]
        if any(keyword in text_lower for keyword in advice_keywords):
            return "advice"
        
        return "casual"

    def _build_kakao_prompt(self, text: str, emotion: SimplifiedEmotionAnalysis,
                           situation: str, personality: Optional[SimplifiedPersonalityProfile],
                           context: Optional[Dict[str, Any]]) -> str:
        """카카오톡 특화 프롬프트 구성"""
        
        prompt = f"{self.kakao_system_prompt}\n\n"
        
        # 상황별 지침
        prompt += f"상황 지침:\n{self.situation_templates.get(situation, self.situation_templates['casual'])}\n\n"
        
        # 감정 정보
        emotion_descriptions = {
            EmotionType.JOY: "기쁨, 행복감",
            EmotionType.SADNESS: "슬픔, 우울감", 
            EmotionType.ANGER: "화남, 짜증",
            EmotionType.FEAR: "불안, 걱정",
            EmotionType.EXCITEMENT: "흥분, 기대감",
            EmotionType.CONCERN: "걱정, 염려",
            EmotionType.NEUTRAL: "평범함, 중립적"
        }
        
        prompt += f"상대방의 감정 상태: {emotion_descriptions.get(emotion.primary_emotion, '중립적')}\n"
        prompt += f"감정 강도: {'강함' if emotion.intensity > 0.7 else '보통' if emotion.intensity > 0.4 else '약함'}\n\n"
        
        # 성격 정보 (있는 경우)
        if personality and personality.communication_style:
            style = personality.communication_style
            formality = style.get('formal', 0.5)
            emotional = style.get('emotional', 0.5)
            
            prompt += f"소통 스타일:\n"
            prompt += f"- 격식 수준: {'높음' if formality > 0.7 else '보통' if formality > 0.3 else '낮음'}\n"
            prompt += f"- 감정 표현: {'많음' if emotional > 0.7 else '보통' if emotional > 0.3 else '적음'}\n\n"
        
        # 사용자 메시지
        prompt += f"상대방이 보낸 메시지:\n\"{text}\"\n\n"
        
        # 응답 요청
        prompt += """위 정보를 바탕으로 도움이 되는 응답을 작성해주세요.

ChatGPT 스타일 응답 요구사항:
1. 명확하고 이해하기 쉬운 설명 제공
2. 구체적이고 실용적인 정보나 조언 제공
3. 친근하면서도 전문적인 톤 유지
4. 필요시 추가 설명이나 예시 포함
5. 사용자의 상황에 맞는 도움이 되는 조언
6. 자연스럽고 인간적인 대화 스타일
7. 과도한 감정 표현이나 이모지 사용 자제
8. 객관적이고 균형잡힌 관점 유지

응답만 작성해주세요 (설명이나 부가 정보 없이):"""
        
        return prompt

    async def _call_openai_api(self, prompt: str) -> str:
        """OpenAI API 호출"""
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=120,
                temperature=0.7,  # ChatGPT와 유사하게 조정
                top_p=0.9,
                frequency_penalty=0.0,  # ChatGPT와 유사하게 조정
                presence_penalty=0.0    # ChatGPT와 유사하게 조정
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            raise Exception(f"OpenAI API 호출 실패: {e}")

    def _optimize_for_kakao_style(self, message: str, 
                                 personality: Optional[SimplifiedPersonalityProfile]) -> str:
        """카카오톡 스타일 최적화"""
        
        # 따옴표 제거
        if message.startswith('"') and message.endswith('"'):
            message = message[1:-1]
        if message.startswith("'") and message.endswith("'"):
            message = message[1:-1]
        
        # 불필요한 설명 제거
        remove_phrases = [
            "카카오톡 메시지:", "메시지:", "답변:", "응답:",
            "라고 보내면 됩니다", "라고 말할 수 있습니다"
        ]
        for phrase in remove_phrases:
            message = message.replace(phrase, "")
        
        # 카카오톡 특화 스타일 적용
        # 1. 이모지 적절히 추가
        if "축하" in message or "기뻐" in message:
            message = "🎉 " + message
        elif "힘들" in message or "어려운" in message:
            message = "💪 " + message
        elif "감사" in message:
            message = "🙏 " + message
        
        # 2. 자연스러운 말투로 변경
        message = message.replace("입니다.", "이에요.")
        message = message.replace("습니다.", "어요.")
        message = message.replace("하겠습니다.", "할게요.")
        
        # 3. 친근한 표현 추가
        if not any(word in message for word in ["네", "맞아요", "그래요"]):
            if message.endswith("."):
                message = message[:-1] + "~"
        
        # 최종 정리
        message = message.strip()
        
        # 빈 메시지 방지
        if not message:
            message = "그렇군요! 더 자세한 이야기 들어보고 싶어요."
        
        return message

    async def _generate_with_advanced_local(self, text: str, emotion: SimplifiedEmotionAnalysis,
                                          personality: Optional[SimplifiedPersonalityProfile],
                                          context: Optional[Dict[str, Any]]) -> str:
        """고도화된 로컬 메시지 생성 (OpenAI 없을 때)"""
        
        # 상황 분석
        situation = self._analyze_situation_advanced(text, emotion)
        
        # 고품질 로컬 응답 생성
        return self._generate_high_quality_local_response(text, emotion, situation, personality)

    def _generate_high_quality_local_response(self, text: str, emotion: SimplifiedEmotionAnalysis,
                                            situation: str, personality: Optional[SimplifiedPersonalityProfile]) -> str:
        """고품질 로컬 응답 생성"""
        
        # 텍스트 키워드 추출
        key_words = self._extract_meaningful_words(text)
        
        # 상황별 고품질 응답 템플릿 (ChatGPT 스타일)
        quality_responses = {
            "comfort": [
                "어려운 상황이시군요. 충분히 힘드실 것 같아요. 어떤 상황인지 편하게 말씀해 주시면 함께 해결방법을 찾아보도록 하겠습니다.",
                "정말 힘드시겠어요. 이런 상황에서는 누구라도 어려워할 거예요. 혼자 감당하기 어려운 일이 있을 때는 주변 사람들과 상의하는 것도 좋은 방법이에요.",
                "그런 일이 있으셨군요. 충분히 힘들 만한 상황이네요. 조금이라도 마음이 나아지셨으면 좋겠어요.",
                "많이 지치셨을 것 같아요. 이런 때는 잠시 휴식을 취하는 것도 필요할 수 있어요."
            ],
            "celebration": [
                "정말 축하드려요! 좋은 소식이네요. 어떤 기분이신지 궁금해요.",
                "대단하시네요! 그동안 정말 많은 노력을 하셨을 거예요. 정말 기쁜 일이네요.",
                "정말 좋은 일이네요! 함께 기뻐해요. 앞으로도 좋은 일들이 계속 있으시길 바라요.",
                "축하해요! 정말 대단한 성과네요. 어떤 과정이었는지 궁금해요."
            ],
            "support": [
                "응원할게요! 분명 잘 해내실 수 있을 거예요. 힘든 시기지만 꼭 이겨내실 거라고 믿어요.",
                "어려운 상황이지만 포기하지 마세요. 저도 함께 응원할게요! 언제든 힘이 필요하시면 말씀해 주세요.",
                "힘든 시기지만 꼭 이겨내실 거라고 믿어요. 함께 해결방법을 찾아보면 어떨까요?",
                "어려운 상황이시군요. 하지만 분명 해결방법이 있을 거예요. 함께 고민해보면 좋겠어요."
            ],
            "advice": [
                "어떤 도움이 필요하신지 더 자세히 말씀해 주세요. 구체적으로 어떤 부분이 궁금하신가요?",
                "이런 경우에는 단계적으로 접근하는 게 좋을 것 같아요. 어떤 부분부터 시작하고 싶으신지 궁금해요.",
                "제가 경험한 바로는 이런 방법이 도움이 될 수 있을 것 같아요. 참고해 보시고 궁금한 점이 있으시면 언제든 말씀해 주세요.",
                "함께 해결방법을 생각해보면 어떨까요? 어떤 부분이 가장 어려우신지 궁금해요."
            ],
            "casual": [
                "그렇군요! 더 자세한 이야기 들어보고 싶어요. 어떤 생각이 드시나요?",
                "정말 흥미로운 이야기네요. 어떻게 된 건지 궁금해요. 더 자세히 들려주세요.",
                "좋은 이야기 감사해요. 어떤 생각이 드시나요? 다른 사람들은 어떻게 생각할까요?",
                "재미있네요! 더 자세한 내용이 궁금해요. 어떤 부분이 가장 인상적이셨나요?"
            ]
        }
        
        # 기본 응답 선택
        base_responses = quality_responses.get(situation, quality_responses["casual"])
        base_response = random.choice(base_responses)
        
        # 개인화 적용
        personalized_response = self._apply_personalization_local(base_response, text, key_words, personality)
        
        return personalized_response

    def _extract_meaningful_words(self, text: str) -> List[str]:
        """의미 있는 단어 추출"""
        words = text.split()
        
        # 불용어 제거
        stop_words = ["정말", "너무", "아주", "완전", "진짜", "매우", "그냥", "좀", "약간"]
        meaningful_words = [word for word in words if len(word) > 1 and word not in stop_words]
        
        return meaningful_words[:3]  # 상위 3개만

    def _apply_personalization_local(self, base_response: str, original_text: str, 
                                   key_words: List[str], personality: Optional[SimplifiedPersonalityProfile]) -> str:
        """로컬 개인화 적용"""
        
        response = base_response
        
        # 키워드 연결 (30% 확률)
        if key_words and random.random() < 0.3:
            key_word = key_words[0]
            connection_phrases = [
                f"{key_word} 관련해서",
                f"{key_word} 말씀을 들으니",
                f"{key_word}에 대해서",
                f"{key_word} 상황에서"
            ]
            connection = random.choice(connection_phrases)
            response = f"{connection} {response[0].lower()}{response[1:]}"
        
        # 공감 표현 추가 (20% 확률)
        if random.random() < 0.2:
            empathy_phrases = [
                "저도 비슷한 경험이 있어서 마음이 이해돼요.",
                "그런 기분 정말 잘 알 것 같아요.",
                "충분히 그럴 만한 상황이네요."
            ]
            empathy = random.choice(empathy_phrases)
            response = f"{response} {empathy}"
        
        # 성격 반영
        if personality and personality.communication_style:
            style = personality.communication_style
            
            # 격식 조정
            formality = style.get('formal', 0.5)
            if formality < 0.3:
                response = response.replace("습니다", "어요")
                response = response.replace("됩니다", "돼요")
            elif formality > 0.7:
                response = response.replace("어요", "습니다")
                response = response.replace("돼요", "됩니다")
            
            # 감정 표현 조정
            emotional = style.get('emotional', 0.5)
            if emotional > 0.7 and '!' not in response:
                if random.random() < 0.4:
                    response += "!"
        
        return response

    def _generate_safe_fallback(self, text: str, emotion: SimplifiedEmotionAnalysis) -> str:
        """안전한 폴백 메시지"""
        
        fallback_by_emotion = {
            EmotionType.JOY: "기쁜 소식 들려주셔서 저도 기분이 좋아져요!",
            EmotionType.SADNESS: "힘든 시간을 보내고 계시는군요. 마음이 아파요.",
            EmotionType.ANGER: "화가 나실 만한 상황이었나 보네요. 충분히 이해할 수 있어요.",
            EmotionType.FEAR: "걱정이 많으시겠어요. 괜찮아질 거예요.",
            EmotionType.EXCITEMENT: "정말 기대되시나 보네요! 어떤 일인지 궁금해요.",
            EmotionType.CONCERN: "걱정스러운 상황이신가 보네요. 어떻게 도울까요?",
            EmotionType.NEUTRAL: "말씀해 주신 내용 잘 들었어요. 더 자세한 이야기가 궁금해요."
        }
        
        return fallback_by_emotion.get(emotion.primary_emotion, fallback_by_emotion[EmotionType.NEUTRAL])

# 기존 호환성을 위한 래퍼 함수들
class SimplifiedUltraMessageSystem:
    def __init__(self):
        self.generator = SimplifiedMessageGenerator()
    
    async def generate_ultra_message(self, *args, **kwargs):
        # 기존 인터페이스와 호환성 유지
        return await self.generator.generate_message(*args, **kwargs)