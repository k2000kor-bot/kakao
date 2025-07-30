import json
import sqlite3
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from dataclasses import dataclass
from enum import Enum
import random

logger = logging.getLogger(__name__)

class ResponseType(Enum):
    SUPPORT = "support"           # 동조
    CRITICIZE = "criticize"       # 비난
    CRITIQUE = "critique"         # 비판
    DISGUST = "disgust"           # 혐오
    AGREE = "agree"               # 찬성
    RESPOND = "respond"           # 응호
    PRAISE = "praise"             # 찬양
    NEUTRAL = "neutral"           # 중립

class ConversationStyle(Enum):
    YUSIMIN = "yusimin"          # 유시민 스타일
    POLITICIAN = "politician"     # 정치인 스타일
    CRITIC = "critic"             # 비평가 스타일
    DEBATER = "debater"           # 토론가 스타일
    ANALYST = "analyst"           # 분석가 스타일

@dataclass
class ConversationContext:
    original_message: str
    personality: str
    power_level: str
    style: ConversationStyle
    response_type: ResponseType
    guidelines: List[str]
    references: List[str]
    target_audience: str

class AdvancedConversationGenerator:
    """고급 대화 생성 시스템"""
    
    def __init__(self, db_path: str = "conversations.db"):
        self.db_path = db_path
        self.load_conversation_styles()
        self.load_guidelines()
    
    def load_conversation_styles(self):
        """대화 스타일 로드"""
        self.conversation_styles = {
            ConversationStyle.YUSIMIN: {
                "name": "유시민 스타일",
                "characteristics": [
                    "논리적이고 체계적인 분석",
                    "역사적 맥락을 고려한 설명",
                    "객관적 사실에 기반한 주장",
                    "상대방의 관점을 인정하면서도 명확한 입장 표명",
                    "교육적이고 설명적인 톤"
                ],
                "examples": [
                    "이 문제를 역사적 맥락에서 보면...",
                    "객관적 사실을 바탕으로 말씀드리면...",
                    "상대방의 의견도 일정 부분 타당하지만...",
                    "이것은 단순한 의견 차이가 아닌 원칙의 문제입니다."
                ]
            },
            ConversationStyle.POLITICIAN: {
                "name": "정치인 스타일",
                "characteristics": [
                    "국민의 관점에서 접근",
                    "정책적 해결책 제시",
                    "공감대 형성에 중점",
                    "미래 비전 제시",
                    "책임감 있는 톤"
                ],
                "examples": [
                    "국민 여러분의 관점에서 보면...",
                    "이 문제의 해결을 위해 우리는...",
                    "미래 세대를 위해 우리가 해야 할 일은...",
                    "정부의 역할과 책임을 다하기 위해..."
                ]
            },
            ConversationStyle.CRITIC: {
                "name": "비평가 스타일",
                "characteristics": [
                    "예리한 분석과 통찰",
                    "문화적, 사회적 맥락 고려",
                    "객관적이면서도 날카로운 비평",
                    "예술적 감각과 인문학적 소양",
                    "깊이 있는 사고를 유도하는 톤"
                ],
                "examples": [
                    "이것은 단순한 현상이 아닌 사회적 문제의 표출입니다.",
                    "문화적 맥락에서 보면 이는...",
                    "우리 사회의 근본적 모순이 드러나는 지점입니다.",
                    "인간의 본질적 문제와 연결되는 부분이 있습니다."
                ]
            },
            ConversationStyle.DEBATER: {
                "name": "토론가 스타일",
                "characteristics": [
                    "논리적 구조화",
                    "반대 의견에 대한 예측과 대응",
                    "명확한 입장 표명",
                    "객관적 근거 제시",
                    "설득력 있는 논증"
                ],
                "examples": [
                    "이 주장에 대한 반론은 다음과 같을 수 있습니다...",
                    "논리적으로 접근하면...",
                    "객관적 사실을 바탕으로...",
                    "이 문제의 핵심은..."
                ]
            },
            ConversationStyle.ANALYST: {
                "name": "분석가 스타일",
                "characteristics": [
                    "데이터 기반 분석",
                    "객관적이고 중립적인 관점",
                    "체계적인 문제 해결 접근",
                    "전문적 지식 활용",
                    "분석적이고 논리적인 톤"
                ],
                "examples": [
                    "데이터를 분석해보면...",
                    "객관적 관점에서 보면...",
                    "이 문제의 근본 원인은...",
                    "체계적으로 접근하면..."
                ]
            }
        }
    
    def load_guidelines(self):
        """지침 로드"""
        self.guidelines = {
            "debate": [
                "상대방의 의견을 경청하세요",
                "객관적 사실에 기반한 주장을 하세요",
                "감정적 대립보다는 논리적 토론을 하세요",
                "상대방의 관점을 인정하면서도 명확한 입장을 표명하세요"
            ],
            "criticism": [
                "건설적인 비판을 하세요",
                "개인 공격보다는 내용에 대한 비판을 하세요",
                "대안을 제시하세요",
                "객관적 근거를 바탕으로 비판하세요"
            ],
            "persuasion": [
                "공감대를 형성하세요",
                "구체적 사례를 들어 설명하세요",
                "상대방의 관점을 고려하세요",
                "미래 비전을 제시하세요"
            ],
            "discussion": [
                "열린 마음으로 대화하세요",
                "다양한 관점을 고려하세요",
                "상호 존중하는 태도를 유지하세요",
                "건설적인 해결책을 모색하세요"
            ]
        }
    
    def generate_conversation_response(self, context: ConversationContext) -> Dict[str, Any]:
        """대화 응답 생성"""
        try:
            # 스타일별 응답 생성
            style_response = self.generate_style_based_response(context)
            
            # 응답 타입별 조정
            adjusted_response = self.adjust_response_by_type(style_response, context.response_type)
            
            # 지침 적용
            guideline_applied = self.apply_guidelines(adjusted_response, context.guidelines)
            
            # 참고 자료 인용
            final_response = self.add_references(guideline_applied, context.references)
            
            return {
                "response": final_response,
                "style": context.style.value,
                "response_type": context.response_type.value,
                "personality": context.personality,
                "power_level": context.power_level,
                "confidence": self.calculate_confidence(context),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"대화 응답 생성 실패: {e}")
            return {
                "response": "적절한 응답을 생성하는 중 오류가 발생했습니다.",
                "style": context.style.value,
                "response_type": context.response_type.value,
                "confidence": 0.0,
                "timestamp": datetime.now().isoformat()
            }
    
    def generate_style_based_response(self, context: ConversationContext) -> str:
        """스타일 기반 응답 생성"""
        style = self.conversation_styles[context.style]
        
        # 기본 응답 템플릿 선택
        base_response = random.choice(style["examples"])
        
        # 원본 메시지에 대한 반응 추가
        if context.response_type == ResponseType.SUPPORT:
            response = f"동감합니다. {base_response} 특히 {context.original_message}에 대해..."
        elif context.response_type == ResponseType.CRITICIZE:
            response = f"이 부분에 대해서는 다른 관점이 있습니다. {base_response} {context.original_message}의 문제점은..."
        elif context.response_type == ResponseType.CRITIQUE:
            response = f"객관적으로 분석해보면, {base_response} {context.original_message}에 대해..."
        elif context.response_type == ResponseType.AGREE:
            response = f"맞습니다. {base_response} {context.original_message}에 완전히 동의합니다."
        elif context.response_type == ResponseType.RESPOND:
            response = f"흥미로운 관점입니다. {base_response} {context.original_message}에 대해..."
        else:
            response = f"{base_response} {context.original_message}에 대해..."
        
        return response
    
    def adjust_response_by_type(self, response: str, response_type: ResponseType) -> str:
        """응답 타입별 조정"""
        if response_type == ResponseType.SUPPORT:
            response += " 이 주장에 동조하며, 더 나은 해결책을 제시하고 싶습니다."
        elif response_type == ResponseType.CRITICIZE:
            response += " 이는 근본적으로 잘못된 접근입니다."
        elif response_type == ResponseType.CRITIQUE:
            response += " 이에 대한 건설적인 대안을 제시하겠습니다."
        elif response_type == ResponseType.DISGUST:
            response += " 이는 도덕적으로 용납할 수 없는 주장입니다."
        elif response_type == ResponseType.AGREE:
            response += " 이 의견에 전적으로 찬성합니다."
        elif response_type == ResponseType.RESPOND:
            response += " 이에 대한 구체적인 답변을 드리겠습니다."
        elif response_type == ResponseType.PRAISE:
            response += " 이는 매우 훌륭한 관점입니다."
        
        return response
    
    def apply_guidelines(self, response: str, guidelines: List[str]) -> str:
        """지침 적용"""
        guideline_text = ""
        
        for guideline in guidelines:
            if "경청" in guideline:
                guideline_text += " 상대방의 의견을 경청하면서, "
            elif "객관적" in guideline:
                guideline_text += " 객관적 사실에 기반하여, "
            elif "논리적" in guideline:
                guideline_text += " 논리적으로 접근하면, "
            elif "건설적" in guideline:
                guideline_text += " 건설적인 관점에서, "
        
        if guideline_text:
            response = guideline_text + response
        
        return response
    
    def add_references(self, response: str, references: List[str]) -> str:
        """참고 자료 인용"""
        if references:
            reference_text = " 참고로, "
            for ref in references[:2]:  # 최대 2개만 인용
                reference_text += f"{ref}, "
            response += reference_text.rstrip(", ") + " 등의 자료를 참고했습니다."
        
        return response
    
    def calculate_confidence(self, context: ConversationContext) -> float:
        """신뢰도 계산"""
        base_confidence = 0.8
        
        # 스타일별 조정
        if context.style == ConversationStyle.YUSIMIN:
            base_confidence += 0.1
        elif context.style == ConversationStyle.POLITICIAN:
            base_confidence += 0.05
        
        # 응답 타입별 조정
        if context.response_type in [ResponseType.AGREE, ResponseType.SUPPORT]:
            base_confidence += 0.05
        elif context.response_type in [ResponseType.CRITICIZE, ResponseType.DISGUST]:
            base_confidence -= 0.05
        
        return min(base_confidence, 1.0)
    
    def generate_multiple_responses(self, original_message: str, count: int = 5) -> List[Dict[str, Any]]:
        """다양한 응답 생성"""
        responses = []
        
        for i in range(count):
            # 랜덤 스타일과 응답 타입 선택
            style = random.choice(list(ConversationStyle))
            response_type = random.choice(list(ResponseType))
            personality = random.choice(["conservative", "neutral", "critical", "progressive"])
            power_level = random.choice(["strong", "medium", "weak", "none"])
            
            context = ConversationContext(
                original_message=original_message,
                personality=personality,
                power_level=power_level,
                style=style,
                response_type=response_type,
                guidelines=self.guidelines["debate"],
                references=[],
                target_audience="general"
            )
            
            response = self.generate_conversation_response(context)
            responses.append(response)
        
        return responses
    
    def get_conversation_statistics(self, chat_room_id: str) -> Dict[str, Any]:
        """대화 통계 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 메시지 수 조회
        cursor.execute('''
            SELECT COUNT(*) FROM messages WHERE chat_room_id = ?
        ''', (chat_room_id,))
        message_count = cursor.fetchone()[0]
        
        # 성향별 분포
        cursor.execute('''
            SELECT personality, COUNT(*) FROM messages 
            WHERE chat_room_id = ? GROUP BY personality
        ''', (chat_room_id,))
        personality_distribution = dict(cursor.fetchall())
        
        # 파워 레벨별 분포
        cursor.execute('''
            SELECT power_level, COUNT(*) FROM messages 
            WHERE chat_room_id = ? GROUP BY power_level
        ''', (chat_room_id,))
        power_distribution = dict(cursor.fetchall())
        
        conn.close()
        
        return {
            "message_count": message_count,
            "personality_distribution": personality_distribution,
            "power_distribution": power_distribution,
            "chat_room_id": chat_room_id
        }

# 전역 인스턴스
conversation_generator = AdvancedConversationGenerator() 