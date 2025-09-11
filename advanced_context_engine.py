"""
고급 맥락 이해 및 대화 연속성 엔진
Advanced Context Understanding and Conversation Continuity Engine
"""

import json
import time
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import re
import hashlib

class ContextType(Enum):
    """맥락 유형"""
    EMOTIONAL = "emotional"
    TOPICAL = "topical"
    TEMPORAL = "temporal"
    RELATIONAL = "relational"
    INTENTIONAL = "intentional"
    CULTURAL = "cultural"
    LINGUISTIC = "linguistic"

class ConversationState(Enum):
    """대화 상태"""
    INITIAL = "initial"
    ACTIVE = "active"
    DEEP_DIVE = "deep_dive"
    CLARIFICATION = "clarification"
    TRANSITION = "transition"
    CONCLUSION = "conclusion"

@dataclass
class ContextMemory:
    """맥락 메모리"""
    context_id: str
    context_type: ContextType
    content: str
    importance: float  # 0.0 - 1.0
    timestamp: datetime
    user_id: str
    conversation_id: str
    related_contexts: List[str] = None
    emotional_weight: float = 0.0
    linguistic_features: Dict[str, Any] = None

@dataclass
class ConversationContext:
    """대화 맥락"""
    conversation_id: str
    user_id: str
    current_state: ConversationState
    context_memories: List[ContextMemory]
    topic_history: List[str]
    emotional_trajectory: List[Dict[str, Any]]
    user_preferences: Dict[str, Any]
    conversation_goals: List[str]
    last_activity: datetime
    context_strength: float  # 전체 맥락 강도

class AdvancedContextEngine:
    """고급 맥락 이해 엔진"""
    
    def __init__(self):
        self.conversations: Dict[str, ConversationContext] = {}
        self.context_patterns = self._initialize_context_patterns()
        self.emotional_contexts = self._initialize_emotional_contexts()
        self.cultural_contexts = self._initialize_cultural_contexts()
        
    def _initialize_context_patterns(self) -> Dict[str, List[str]]:
        """맥락 패턴 초기화"""
        return {
            "question_patterns": [
                r"왜\s+.*\?",
                r"어떻게\s+.*\?",
                r"무엇을\s+.*\?",
                r"언제\s+.*\?",
                r"어디서\s+.*\?",
                r"누가\s+.*\?",
                r"어떤\s+.*\?",
                r"얼마나\s+.*\?",
                r"왜냐하면\s+.*",
                r"그런데\s+.*",
                r"그러면\s+.*",
                r"그래서\s+.*"
            ],
            "emotional_patterns": [
                r"기분이\s+.*",
                r"느낌이\s+.*",
                r"마음이\s+.*",
                r"속상해",
                r"화나",
                r"기뻐",
                r"슬퍼",
                r"걱정돼",
                r"불안해",
                r"행복해"
            ],
            "continuation_patterns": [
                r"그리고\s+.*",
                r"또한\s+.*",
                r"또\s+.*",
                r"그런데\s+.*",
                r"그러면\s+.*",
                r"그래서\s+.*",
                r"그리고\s+.*",
                r"또한\s+.*",
                r"그런데\s+.*",
                r"그러면\s+.*"
            ],
            "clarification_patterns": [
                r"정확히\s+.*",
                r"구체적으로\s+.*",
                r"자세히\s+.*",
                r"더\s+.*",
                r"다시\s+.*",
                r"명확히\s+.*"
            ]
        }
    
    def _initialize_emotional_contexts(self) -> Dict[str, Dict[str, Any]]:
        """감정적 맥락 초기화"""
        return {
            "positive": {
                "keywords": ["기뻐", "행복", "좋아", "만족", "성취", "성공", "희망"],
                "context_weight": 0.8,
                "follow_up_intent": "encourage_continuation"
            },
            "negative": {
                "keywords": ["슬퍼", "화나", "속상", "걱정", "불안", "우울", "절망"],
                "context_weight": 0.9,
                "follow_up_intent": "provide_support"
            },
            "neutral": {
                "keywords": ["괜찮아", "보통", "그냥", "평범", "일반적"],
                "context_weight": 0.5,
                "follow_up_intent": "explore_deeper"
            },
            "confused": {
                "keywords": ["모르겠어", "이해가 안돼", "혼란", "복잡", "어려워"],
                "context_weight": 0.9,
                "follow_up_intent": "clarify_and_explain"
            }
        }
    
    def _initialize_cultural_contexts(self) -> Dict[str, Dict[str, Any]]:
        """문화적 맥락 초기화"""
        return {
            "korean_formality": {
                "formal": ["습니다", "입니다", "하겠습니다", "드리겠습니다"],
                "informal": ["어", "야", "지", "다", "해"],
                "context_importance": 0.7
            },
            "korean_honorifics": {
                "respectful": ["님", "께서", "께서는", "께서도"],
                "humble": ["제가", "저는", "저희가"],
                "context_importance": 0.8
            },
            "korean_emotional_expressions": {
                "intensifiers": ["정말", "너무", "진짜", "완전", "엄청"],
                "softeners": ["조금", "약간", "살짝", "좀"],
                "context_importance": 0.6
            }
        }
    
    def analyze_context(self, message: str, user_id: str, conversation_id: str) -> Dict[str, Any]:
        """메시지의 맥락 분석"""
        context_analysis = {
            "context_types": [],
            "emotional_context": None,
            "cultural_context": None,
            "linguistic_features": {},
            "continuation_indicators": [],
            "clarification_needs": [],
            "context_strength": 0.0,
            "recommended_responses": []
        }
        
        # 1. 맥락 유형 분석
        context_analysis["context_types"] = self._identify_context_types(message)
        
        # 2. 감정적 맥락 분석
        context_analysis["emotional_context"] = self._analyze_emotional_context(message)
        
        # 3. 문화적 맥락 분석
        context_analysis["cultural_context"] = self._analyze_cultural_context(message)
        
        # 4. 언어적 특징 분석
        context_analysis["linguistic_features"] = self._analyze_linguistic_features(message)
        
        # 5. 연속성 지표 분석
        context_analysis["continuation_indicators"] = self._identify_continuation_indicators(message)
        
        # 6. 명확화 필요성 분석
        context_analysis["clarification_needs"] = self._identify_clarification_needs(message)
        
        # 7. 맥락 강도 계산
        context_analysis["context_strength"] = self._calculate_context_strength(context_analysis)
        
        # 8. 권장 응답 생성
        context_analysis["recommended_responses"] = self._generate_recommended_responses(context_analysis)
        
        # 9. 맥락 메모리 저장
        self._store_context_memory(message, user_id, conversation_id, context_analysis)
        
        return context_analysis
    
    def _identify_context_types(self, message: str) -> List[ContextType]:
        """맥락 유형 식별"""
        context_types = []
        
        # 질문 패턴 확인
        if any(re.search(pattern, message) for pattern in self.context_patterns["question_patterns"]):
            context_types.append(ContextType.INTENTIONAL)
        
        # 감정 패턴 확인
        if any(re.search(pattern, message) for pattern in self.context_patterns["emotional_patterns"]):
            context_types.append(ContextType.EMOTIONAL)
        
        # 연속성 패턴 확인
        if any(re.search(pattern, message) for pattern in self.context_patterns["continuation_patterns"]):
            context_types.append(ContextType.TOPICAL)
        
        # 명확화 패턴 확인
        if any(re.search(pattern, message) for pattern in self.context_patterns["clarification_patterns"]):
            context_types.append(ContextType.INTENTIONAL)
        
        return context_types
    
    def _analyze_emotional_context(self, message: str) -> Optional[Dict[str, Any]]:
        """감정적 맥락 분석"""
        for emotion_type, emotion_data in self.emotional_contexts.items():
            if any(keyword in message for keyword in emotion_data["keywords"]):
                return {
                    "emotion_type": emotion_type,
                    "intensity": self._calculate_emotional_intensity(message, emotion_data["keywords"]),
                    "context_weight": emotion_data["context_weight"],
                    "follow_up_intent": emotion_data["follow_up_intent"]
                }
        return None
    
    def _analyze_cultural_context(self, message: str) -> Dict[str, Any]:
        """문화적 맥락 분석"""
        cultural_context = {
            "formality_level": "neutral",
            "honorific_usage": "none",
            "emotional_expression_style": "neutral",
            "cultural_indicators": []
        }
        
        # 존댓말 수준 분석
        formal_count = sum(1 for pattern in self.cultural_contexts["korean_formality"]["formal"] 
                          if pattern in message)
        informal_count = sum(1 for pattern in self.cultural_contexts["korean_formality"]["informal"] 
                            if pattern in message)
        
        if formal_count > informal_count:
            cultural_context["formality_level"] = "formal"
        elif informal_count > formal_count:
            cultural_context["formality_level"] = "informal"
        
        # 존댓말 사용 분석
        if any(pattern in message for pattern in self.cultural_contexts["korean_honorifics"]["respectful"]):
            cultural_context["honorific_usage"] = "respectful"
        elif any(pattern in message for pattern in self.cultural_contexts["korean_honorifics"]["humble"]):
            cultural_context["honorific_usage"] = "humble"
        
        # 감정 표현 스타일 분석
        if any(pattern in message for pattern in self.cultural_contexts["korean_emotional_expressions"]["intensifiers"]):
            cultural_context["emotional_expression_style"] = "intense"
        elif any(pattern in message for pattern in self.cultural_contexts["korean_emotional_expressions"]["softeners"]):
            cultural_context["emotional_expression_style"] = "soft"
        
        return cultural_context
    
    def _analyze_linguistic_features(self, message: str) -> Dict[str, Any]:
        """언어적 특징 분석"""
        return {
            "sentence_count": len(re.split(r'[.!?]', message)),
            "word_count": len(message.split()),
            "character_count": len(message),
            "question_count": len(re.findall(r'\?', message)),
            "exclamation_count": len(re.findall(r'!', message)),
            "complexity_score": self._calculate_linguistic_complexity(message),
            "readability_score": self._calculate_readability_score(message)
        }
    
    def _identify_continuation_indicators(self, message: str) -> List[str]:
        """연속성 지표 식별"""
        indicators = []
        for pattern in self.context_patterns["continuation_patterns"]:
            if re.search(pattern, message):
                indicators.append(pattern)
        return indicators
    
    def _identify_clarification_needs(self, message: str) -> List[str]:
        """명확화 필요성 식별"""
        needs = []
        for pattern in self.context_patterns["clarification_patterns"]:
            if re.search(pattern, message):
                needs.append(pattern)
        return needs
    
    def _calculate_context_strength(self, context_analysis: Dict[str, Any]) -> float:
        """맥락 강도 계산"""
        strength = 0.0
        
        # 기본 맥락 유형 가중치
        strength += len(context_analysis["context_types"]) * 0.2
        
        # 감정적 맥락 가중치
        if context_analysis["emotional_context"]:
            strength += context_analysis["emotional_context"]["context_weight"] * 0.3
        
        # 연속성 지표 가중치
        strength += len(context_analysis["continuation_indicators"]) * 0.1
        
        # 명확화 필요성 가중치
        strength += len(context_analysis["clarification_needs"]) * 0.2
        
        # 언어적 복잡성 가중치
        linguistic_features = context_analysis["linguistic_features"]
        strength += linguistic_features.get("complexity_score", 0) * 0.2
        
        return min(strength, 1.0)
    
    def _calculate_emotional_intensity(self, message: str, keywords: List[str]) -> float:
        """감정 강도 계산"""
        keyword_count = sum(1 for keyword in keywords if keyword in message)
        total_words = len(message.split())
        return min(keyword_count / max(total_words, 1), 1.0)
    
    def _calculate_linguistic_complexity(self, message: str) -> float:
        """언어적 복잡성 계산"""
        words = message.split()
        if not words:
            return 0.0
        
        # 평균 단어 길이
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # 문장 복잡성 (부사, 형용사, 복합어 등)
        complex_words = sum(1 for word in words if len(word) > 6 or any(char in word for char in ['은', '는', '이', '가', '을', '를', '에', '에서', '로', '으로']))
        
        # 구두점 복잡성
        punctuation_complexity = len(re.findall(r'[,;:]', message)) / max(len(words), 1)
        
        complexity = (avg_word_length / 10) + (complex_words / len(words)) + punctuation_complexity
        return min(complexity, 1.0)
    
    def _calculate_readability_score(self, message: str) -> float:
        """가독성 점수 계산"""
        words = message.split()
        sentences = re.split(r'[.!?]', message)
        
        if not words or not sentences:
            return 0.0
        
        # 평균 문장 길이
        avg_sentence_length = len(words) / len(sentences)
        
        # 평균 단어 길이
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # 가독성 점수 (낮을수록 읽기 쉬움)
        readability = (avg_sentence_length * 0.4) + (avg_word_length * 0.6)
        return max(0.0, min(1.0, 1.0 - (readability / 20)))
    
    def _generate_recommended_responses(self, context_analysis: Dict[str, Any]) -> List[str]:
        """권장 응답 생성"""
        recommendations = []
        
        # 감정적 맥락 기반 권장사항
        if context_analysis["emotional_context"]:
            emotion_type = context_analysis["emotional_context"]["emotion_type"]
            if emotion_type == "negative":
                recommendations.append("감정적 지지와 공감을 표현하세요")
                recommendations.append("구체적인 해결책을 제시하세요")
            elif emotion_type == "positive":
                recommendations.append("긍정적 감정을 공유하고 격려하세요")
                recommendations.append("성취를 인정하고 더 발전할 방향을 제시하세요")
            elif emotion_type == "confused":
                recommendations.append("명확하고 단계적인 설명을 제공하세요")
                recommendations.append("예시와 비유를 사용하여 이해를 돕세요")
        
        # 문화적 맥락 기반 권장사항
        cultural_context = context_analysis["cultural_context"]
        if cultural_context["formality_level"] == "formal":
            recommendations.append("존댓말을 사용하여 정중하게 응답하세요")
        elif cultural_context["formality_level"] == "informal":
            recommendations.append("친근하고 편안한 톤으로 응답하세요")
        
        # 연속성 지표 기반 권장사항
        if context_analysis["continuation_indicators"]:
            recommendations.append("이전 맥락을 연결하여 응답하세요")
            recommendations.append("대화의 흐름을 유지하세요")
        
        # 명확화 필요성 기반 권장사항
        if context_analysis["clarification_needs"]:
            recommendations.append("구체적이고 명확한 정보를 제공하세요")
            recommendations.append("추가 질문을 통해 더 정확한 답변을 제공하세요")
        
        return recommendations
    
    def _store_context_memory(self, message: str, user_id: str, conversation_id: str, context_analysis: Dict[str, Any]):
        """맥락 메모리 저장"""
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = ConversationContext(
                conversation_id=conversation_id,
                user_id=user_id,
                current_state=ConversationState.ACTIVE,
                context_memories=[],
                topic_history=[],
                emotional_trajectory=[],
                user_preferences={},
                conversation_goals=[],
                last_activity=datetime.now(),
                context_strength=0.0
            )
        
        # 맥락 메모리 생성
        context_memory = ContextMemory(
            context_id=hashlib.md5(f"{message}{user_id}{datetime.now()}".encode()).hexdigest()[:16],
            context_type=ContextType.TOPICAL,  # 기본값
            content=message,
            importance=context_analysis["context_strength"],
            timestamp=datetime.now(),
            user_id=user_id,
            conversation_id=conversation_id,
            emotional_weight=context_analysis["emotional_context"]["intensity"] if context_analysis["emotional_context"] else 0.0,
            linguistic_features=context_analysis["linguistic_features"]
        )
        
        # 대화 맥락에 추가
        self.conversations[conversation_id].context_memories.append(context_memory)
        self.conversations[conversation_id].last_activity = datetime.now()
        self.conversations[conversation_id].context_strength = context_analysis["context_strength"]
        
        # 최근 10개 메모리만 유지
        if len(self.conversations[conversation_id].context_memories) > 10:
            self.conversations[conversation_id].context_memories = self.conversations[conversation_id].context_memories[-10:]
    
    def get_conversation_context(self, conversation_id: str) -> Optional[ConversationContext]:
        """대화 맥락 조회"""
        return self.conversations.get(conversation_id)
    
    def update_conversation_state(self, conversation_id: str, new_state: ConversationState):
        """대화 상태 업데이트"""
        if conversation_id in self.conversations:
            self.conversations[conversation_id].current_state = new_state
            self.conversations[conversation_id].last_activity = datetime.now()
    
    def get_context_summary(self, conversation_id: str) -> Dict[str, Any]:
        """맥락 요약 생성"""
        if conversation_id not in self.conversations:
            return {"error": "대화를 찾을 수 없습니다"}
        
        conversation = self.conversations[conversation_id]
        
        # 최근 맥락 메모리 분석
        recent_memories = conversation.context_memories[-5:] if conversation.context_memories else []
        
        # 감정적 트렌드 분석
        emotional_trend = []
        for memory in recent_memories:
            if memory.emotional_weight > 0:
                emotional_trend.append({
                    "timestamp": memory.timestamp.isoformat(),
                    "weight": memory.emotional_weight
                })
        
        # 주제 트렌드 분석
        topic_trend = []
        for memory in recent_memories:
            topic_trend.append({
                "timestamp": memory.timestamp.isoformat(),
                "content": memory.content[:50] + "..." if len(memory.content) > 50 else memory.content,
                "importance": memory.importance
            })
        
        return {
            "conversation_id": conversation_id,
            "current_state": conversation.current_state.value,
            "context_strength": conversation.context_strength,
            "recent_memories_count": len(recent_memories),
            "emotional_trend": emotional_trend,
            "topic_trend": topic_trend,
            "last_activity": conversation.last_activity.isoformat(),
            "total_memories": len(conversation.context_memories)
        }
    
    def generate_context_aware_response(self, message: str, user_id: str, conversation_id: str) -> Dict[str, Any]:
        """맥락을 고려한 응답 생성"""
        # 맥락 분석
        context_analysis = self.analyze_context(message, user_id, conversation_id)
        
        # 대화 맥락 조회
        conversation_context = self.get_conversation_context(conversation_id)
        
        # 맥락 기반 응답 전략 결정
        response_strategy = self._determine_response_strategy(context_analysis, conversation_context)
        
        # 맥락을 고려한 응답 생성
        context_aware_response = {
            "message": message,
            "context_analysis": context_analysis,
            "response_strategy": response_strategy,
            "conversation_context": conversation_context.context_strength if conversation_context else 0.0,
            "recommendations": context_analysis["recommended_responses"],
            "context_summary": self.get_context_summary(conversation_id)
        }
        
        return context_aware_response
    
    def _determine_response_strategy(self, context_analysis: Dict[str, Any], conversation_context: Optional[ConversationContext]) -> Dict[str, Any]:
        """응답 전략 결정"""
        strategy = {
            "tone": "neutral",
            "approach": "direct",
            "length": "medium",
            "focus": "general",
            "emotional_support": False,
            "clarification_needed": False
        }
        
        # 감정적 맥락 기반 전략
        if context_analysis["emotional_context"]:
            emotion_type = context_analysis["emotional_context"]["emotion_type"]
            if emotion_type == "negative":
                strategy["tone"] = "supportive"
                strategy["emotional_support"] = True
                strategy["approach"] = "gentle"
            elif emotion_type == "positive":
                strategy["tone"] = "enthusiastic"
                strategy["approach"] = "encouraging"
            elif emotion_type == "confused":
                strategy["tone"] = "patient"
                strategy["approach"] = "explanatory"
                strategy["clarification_needed"] = True
        
        # 맥락 강도 기반 전략
        if context_analysis["context_strength"] > 0.7:
            strategy["length"] = "long"
            strategy["focus"] = "detailed"
        elif context_analysis["context_strength"] < 0.3:
            strategy["length"] = "short"
            strategy["focus"] = "concise"
        
        # 대화 상태 기반 전략
        if conversation_context:
            if conversation_context.current_state == ConversationState.CLARIFICATION:
                strategy["approach"] = "explanatory"
                strategy["clarification_needed"] = True
            elif conversation_context.current_state == ConversationState.DEEP_DIVE:
                strategy["length"] = "long"
                strategy["focus"] = "comprehensive"
        
        return strategy
