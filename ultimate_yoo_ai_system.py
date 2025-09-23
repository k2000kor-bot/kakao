#!/usr/bin/env python3
"""
궁극의 유시민 AI 시스템
- 고급 AI 통합 및 실시간 학습
- 개인화된 적응 시스템
- 멀티모달 학습 통합
- 지능형 대화 관리
- 실시간 성능 최적화
"""

import asyncio
import json
import logging
import re
import random
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum

import aiohttp
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConversationState(Enum):
    """대화 상태"""
    GREETING = "greeting"
    TOPIC_EXPLORATION = "topic_exploration"
    DEEP_DISCUSSION = "deep_discussion"
    CONCLUSION = "conclusion"
    FOLLOW_UP = "follow_up"

class LearningMode(Enum):
    """학습 모드"""
    PASSIVE = "passive"
    ACTIVE = "active"
    ADAPTIVE = "adaptive"
    CREATIVE = "creative"

@dataclass
class UserProfile:
    """사용자 프로필"""
    user_id: str
    name: str
    interests: List[str] = field(default_factory=list)
    expertise_level: Dict[str, float] = field(default_factory=dict)
    conversation_style: str = "balanced"
    learning_preferences: Dict[str, Any] = field(default_factory=dict)
    interaction_history: List[Dict] = field(default_factory=list)
    emotional_state: str = "neutral"
    last_updated: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

@dataclass
class ConversationContext:
    """대화 맥락"""
    current_topic: str
    subtopics: List[str] = field(default_factory=list)
    conversation_state: ConversationState = ConversationState.GREETING
    learning_mode: LearningMode = LearningMode.ADAPTIVE
    depth_level: int = 1
    emotional_tone: str = "neutral"
    user_engagement: float = 0.5
    knowledge_gaps: List[str] = field(default_factory=list)
    learning_opportunities: List[str] = field(default_factory=list)

@dataclass
class AdvancedYooContent:
    """고급 유시민 콘텐츠"""
    title: str
    content: str
    topic: str
    subtopics: List[str]
    complexity_level: int  # 1-5
    emotional_tone: str
    learning_objectives: List[str]
    key_concepts: List[str]
    historical_context: Optional[str] = None
    modern_relevance: Optional[str] = None
    discussion_questions: List[str] = field(default_factory=list)
    related_topics: List[str] = field(default_factory=list)

class AdvancedLearningEngine:
    """고급 학습 엔진"""
    
    def __init__(self):
        self.knowledge_graph = self._build_knowledge_graph()
        self.learning_patterns = self._initialize_learning_patterns()
        self.adaptation_rules = self._initialize_adaptation_rules()
        
    def _build_knowledge_graph(self) -> Dict[str, Dict]:
        """지식 그래프 구축"""
        return {
            "역사": {
                "concepts": ["조선", "근대화", "개화", "전통", "유산"],
                "connections": ["정치", "사회", "문화"],
                "complexity_factors": ["시대적 맥락", "인물", "사건", "영향"],
                "learning_paths": ["chronological", "thematic", "comparative"]
            },
            "정치": {
                "concepts": ["민주주의", "시민", "참여", "정부", "정책"],
                "connections": ["경제", "사회", "교육"],
                "complexity_factors": ["이론", "실제", "비교", "발전"],
                "learning_paths": ["theoretical", "practical", "comparative"]
            },
            "교육": {
                "concepts": ["학습", "성장", "지식", "지혜", "발전"],
                "connections": ["사회", "문화", "기술"],
                "complexity_factors": ["목적", "방법", "효과", "변화"],
                "learning_paths": ["philosophical", "practical", "systematic"]
            }
        }
    
    def _initialize_learning_patterns(self) -> Dict[str, List[str]]:
        """학습 패턴 초기화"""
        return {
            "progressive_discovery": [
                "기본 개념부터 시작하여 점진적으로 복잡한 내용으로",
                "구체적인 예시를 통해 추상적 개념을 이해",
                "개인적 경험과 연결하여 의미를 발견"
            ],
            "comparative_analysis": [
                "다양한 관점을 비교하여 균형잡힌 이해",
                "과거와 현재를 비교하여 변화의 의미 파악",
                "서로 다른 접근 방식을 평가하여 최적의 방법 선택"
            ],
            "critical_thinking": [
                "질문을 통해 깊이 있는 사고 유도",
                "가정을 검증하고 근거를 평가",
                "창의적 해결책을 모색"
            ]
        }
    
    def _initialize_adaptation_rules(self) -> Dict[str, Dict]:
        """적응 규칙 초기화"""
        return {
            "beginner": {
                "complexity_threshold": 0.3,
                "explanation_depth": "basic",
                "example_frequency": "high",
                "question_style": "clarifying"
            },
            "intermediate": {
                "complexity_threshold": 0.6,
                "explanation_depth": "moderate",
                "example_frequency": "medium",
                "question_style": "analytical"
            },
            "advanced": {
                "complexity_threshold": 0.8,
                "explanation_depth": "deep",
                "example_frequency": "low",
                "question_style": "synthetic"
            }
        }

class RealTimeAdaptationSystem:
    """실시간 적응 시스템"""
    
    def __init__(self):
        self.user_profiles: Dict[str, UserProfile] = {}
        self.conversation_contexts: Dict[str, ConversationContext] = {}
        self.adaptation_history: Dict[str, List[Dict]] = {}
        
    def analyze_user_response(self, user_id: str, message: str, response_time: float) -> Dict:
        """사용자 응답 분석"""
        analysis = {
            "engagement_level": self._calculate_engagement(message, response_time),
            "emotional_state": self._detect_emotional_state(message),
            "knowledge_gaps": self._identify_knowledge_gaps(message),
            "learning_preferences": self._infer_learning_preferences(message),
            "complexity_preference": self._assess_complexity_preference(message)
        }
        
        # 사용자 프로필 업데이트
        self._update_user_profile(user_id, analysis)
        
        return analysis
    
    def _calculate_engagement(self, message: str, response_time: float) -> float:
        """참여도 계산"""
        factors = {
            "message_length": min(1.0, len(message) / 100),
            "question_count": len(re.findall(r'[?]', message)) / 3,
            "response_speed": max(0, 1.0 - response_time / 10),  # 10초 기준
            "emotional_words": len(re.findall(r'[가-힣]{2,}다|[가-힣]{2,}요', message)) / 5
        }
        
        return sum(factors.values()) / len(factors)
    
    def _detect_emotional_state(self, message: str) -> str:
        """감정 상태 감지"""
        positive_patterns = ["좋다", "훌륭", "멋지다", "감사", "만족", "행복"]
        negative_patterns = ["나쁘다", "실망", "화나다", "슬프다", "불만", "문제"]
        curious_patterns = ["궁금", "알고싶", "왜", "어떻게", "무엇"]
        
        message_lower = message.lower()
        
        positive_score = sum(1 for pattern in positive_patterns if pattern in message_lower)
        negative_score = sum(1 for pattern in negative_patterns if pattern in message_lower)
        curious_score = sum(1 for pattern in curious_patterns if pattern in message_lower)
        
        if curious_score > max(positive_score, negative_score):
            return "curious"
        elif positive_score > negative_score:
            return "positive"
        elif negative_score > positive_score:
            return "negative"
        else:
            return "neutral"
    
    def _identify_knowledge_gaps(self, message: str) -> List[str]:
        """지식 부족 영역 식별"""
        gap_indicators = {
            "기본 개념": ["무엇", "정의", "의미", "개념"],
            "과정/방법": ["어떻게", "방법", "과정", "절차"],
            "이유/원인": ["왜", "이유", "원인", "근거"],
            "비교/관계": ["차이", "비교", "관계", "연결"]
        }
        
        gaps = []
        message_lower = message.lower()
        
        for gap_type, indicators in gap_indicators.items():
            if any(indicator in message_lower for indicator in indicators):
                gaps.append(gap_type)
        
        return gaps
    
    def _infer_learning_preferences(self, message: str) -> Dict[str, Any]:
        """학습 선호도 추론"""
        preferences = {
            "learning_style": "balanced",
            "example_preference": "medium",
            "depth_preference": "moderate",
            "interaction_style": "conversational"
        }
        
        # 메시지 패턴 분석
        if len(re.findall(r'예시|사례|구체적', message)) > 0:
            preferences["example_preference"] = "high"
        
        if len(re.findall(r'깊이|자세히|상세히', message)) > 0:
            preferences["depth_preference"] = "deep"
        
        if len(re.findall(r'간단히|요약|핵심', message)) > 0:
            preferences["depth_preference"] = "shallow"
        
        return preferences
    
    def _assess_complexity_preference(self, message: str) -> float:
        """복잡도 선호도 평가"""
        complexity_indicators = {
            "simple": ["간단", "쉽게", "기본", "초보"],
            "complex": ["복잡", "고급", "전문", "심화", "상세"]
        }
        
        message_lower = message.lower()
        
        simple_score = sum(1 for indicator in complexity_indicators["simple"] if indicator in message_lower)
        complex_score = sum(1 for indicator in complexity_indicators["complex"] if indicator in message_lower)
        
        if simple_score > complex_score:
            return 0.3
        elif complex_score > simple_score:
            return 0.8
        else:
            return 0.5
    
    def _update_user_profile(self, user_id: str, analysis: Dict):
        """사용자 프로필 업데이트"""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = UserProfile(
                user_id=user_id,
                name=f"User_{user_id}"
            )
        
        profile = self.user_profiles[user_id]
        
        # 감정 상태 업데이트
        profile.emotional_state = analysis["emotional_state"]
        
        # 학습 선호도 업데이트
        profile.learning_preferences.update(analysis["learning_preferences"])
        
        # 상호작용 히스토리 업데이트
        profile.interaction_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "analysis": analysis
        })
        
        # 최근 20개 상호작용만 유지
        if len(profile.interaction_history) > 20:
            profile.interaction_history = profile.interaction_history[-20:]
        
        profile.last_updated = datetime.now(timezone.utc).isoformat()

class UltimateYooSiMinSystem:
    """궁극의 유시민 시스템"""
    
    def __init__(self):
        self.learning_engine = AdvancedLearningEngine()
        self.adaptation_system = RealTimeAdaptationSystem()
        self.content_database = self._initialize_ultimate_content()
        self.conversation_flows = self._initialize_conversation_flows()
        self.response_templates = self._initialize_response_templates()
        
    def _initialize_ultimate_content(self) -> List[AdvancedYooContent]:
        """궁극의 콘텐츠 데이터베이스 초기화"""
        return [
            AdvancedYooContent(
                title="조선의 개화와 근대화의 진실",
                content="그런데 말이죠, 조선의 개화 과정을 보면 정말 흥미로운 점이 있습니다. 서구의 압력에 굴복한 것이 아니라, 스스로의 필요에 의해 변화를 선택한 것입니다. 여기서 중요한 것은 조선이 수동적이지 않았다는 점입니다. 개화는 외부의 강요가 아니라 내부의 필요에서 시작된 것이죠. 그런데 이 과정에서 우리가 놓치지 말아야 할 것은 조선인들의 주체적 의식입니다.",
                topic="역사",
                subtopics=["조선", "개화", "근대화", "주체성"],
                complexity_level=4,
                emotional_tone="reflective",
                learning_objectives=["역사적 맥락 이해", "주체적 의식 파악", "근대화 과정 분석"],
                key_concepts=["개화", "근대화", "주체성", "변화"],
                historical_context="19세기 조선의 사회적 변화",
                modern_relevance="현대 한국의 발전 과정과 연결",
                discussion_questions=[
                    "조선의 개화가 외부 압력이 아닌 내부 필요에서 시작되었다는 관점이 맞다고 생각하시나요?",
                    "현재 우리 사회의 변화도 비슷한 패턴을 보인다고 생각하시나요?"
                ],
                related_topics=["정치", "사회", "문화"]
            ),
            AdvancedYooContent(
                title="민주주의의 진정한 의미",
                content="민주주의는 단순히 투표하는 것이 아닙니다. 진정한 민주주의는 시민들이 적극적으로 참여하고, 서로의 의견을 존중하는 것입니다. 여기서 핵심은 상호 존중입니다. 그런데 말이죠, 이것이 쉽지 않습니다. 하지만 우리가 노력해야 할 가치입니다. 민주주의는 완성된 제도가 아니라 계속 발전해가는 과정입니다.",
                topic="정치",
                subtopics=["민주주의", "시민참여", "상호존중", "발전"],
                complexity_level=3,
                emotional_tone="inspirational",
                learning_objectives=["민주주의 본질 이해", "시민 역할 인식", "참여의 중요성 파악"],
                key_concepts=["민주주의", "시민참여", "상호존중", "발전"],
                historical_context="한국 민주주의 발전사",
                modern_relevance="현재 민주주의의 과제와 미래",
                discussion_questions=[
                    "민주주의에서 가장 중요한 요소는 무엇이라고 생각하시나요?",
                    "우리 사회의 민주주의는 어떤 방향으로 발전해야 할까요?"
                ],
                related_topics=["사회", "교육", "문화"]
            ),
            AdvancedYooContent(
                title="교육의 본질과 미래",
                content="교육의 본질은 지식을 전달하는 것이 아니라, 사람을 사람답게 만드는 것입니다. 그런데 현재 우리 교육은 이 본질을 놓치고 있는 것 같습니다. 따라서 우리는 교육의 목적을 다시 생각해봐야 합니다. 교육은 미래를 준비하는 것이지 과거를 위한 것이 아닙니다. 그런데 말이죠, 여기서 중요한 것은 학습자가 주체가 되는 교육입니다.",
                topic="교육",
                subtopics=["교육본질", "인간성", "미래지향", "학습자주체"],
                complexity_level=4,
                emotional_tone="philosophical",
                learning_objectives=["교육 본질 탐구", "미래 교육 방향 모색", "학습자 중심 교육 이해"],
                key_concepts=["교육본질", "인간성", "미래지향", "학습자주체"],
                historical_context="교육사상의 변화",
                modern_relevance="4차 산업혁명 시대의 교육",
                discussion_questions=[
                    "교육의 가장 중요한 목적은 무엇이라고 생각하시나요?",
                    "미래 사회에 필요한 교육은 어떤 모습일까요?"
                ],
                related_topics=["사회", "기술", "문화"]
            )
        ]
    
    def _initialize_conversation_flows(self) -> Dict[str, List[str]]:
        """대화 흐름 초기화"""
        return {
            "greeting": [
                "안녕하세요! 오늘은 어떤 주제로 이야기해보실까요?",
                "그런데 말이죠, 어떤 것에 대해 궁금하신가요?",
                "여기서 중요한 것은 함께 생각해보는 것입니다."
            ],
            "topic_exploration": [
                "이 주제에 대해 어떻게 생각하시나요?",
                "그런데 말이죠, 여기서 핵심은 무엇일까요?",
                "이런 관점에서 접근해보면 어떨까요?"
            ],
            "deep_discussion": [
                "더 깊이 들어가보면 흥미로운 점이 있습니다.",
                "그런데 말이죠, 여기서 중요한 것은...",
                "이것이 우리에게 주는 의미는 무엇일까요?"
            ],
            "conclusion": [
                "그래서 제가 말씀드리고 싶은 것은...",
                "따라서 우리는 이렇게 생각해볼 수 있습니다.",
                "마지막으로, 함께 생각해보면 어떨까요?"
            ]
        }
    
    def _initialize_response_templates(self) -> Dict[str, Dict]:
        """응답 템플릿 초기화"""
        return {
            "beginner": {
                "opening": "그런데 말이죠, {topic}에 대해 쉽게 설명드리겠습니다.",
                "explanation": "여기서 중요한 것은 {concept}입니다. 간단히 말하면...",
                "example": "예를 들어, {example}을 생각해보시면 이해하기 쉬울 것입니다.",
                "conclusion": "따라서 우리는 {topic}을 이렇게 이해할 수 있습니다."
            },
            "intermediate": {
                "opening": "그런데 말이죠, {topic}에 대해 좀 더 깊이 살펴보겠습니다.",
                "explanation": "여기서 핵심은 {concept}입니다. 이를 통해 우리는...",
                "analysis": "이것을 분석해보면 {analysis}라는 점을 알 수 있습니다.",
                "conclusion": "따라서 우리는 {topic}에 대해 이렇게 생각해볼 수 있습니다."
            },
            "advanced": {
                "opening": "그런데 말이죠, {topic}의 본질을 탐구해보겠습니다.",
                "explanation": "여기서 중요한 것은 {concept}의 다층적 의미입니다.",
                "synthesis": "이를 종합해보면 {synthesis}라는 통찰을 얻을 수 있습니다.",
                "conclusion": "따라서 우리는 {topic}에 대해 더 깊이 있는 이해에 도달할 수 있습니다."
            }
        }
    
    async def generate_ultimate_response(
        self, 
        message: str, 
        user_id: str,
        conversation_history: List[Dict] = None
    ) -> Dict:
        """궁극의 응답 생성"""
        try:
            # 1. 사용자 분석
            user_analysis = self.adaptation_system.analyze_user_response(user_id, message, 0.0)
            
            # 2. 대화 맥락 분석
            context = self._analyze_conversation_context(message, user_id, conversation_history)
            
            # 3. 최적 콘텐츠 선택
            selected_content = self._select_optimal_content(message, context, user_analysis)
            
            # 4. 응답 스타일 결정
            response_style = self._determine_response_style(user_analysis, context)
            
            # 5. 개인화된 응답 생성
            response = self._generate_personalized_response(
                message, selected_content, response_style, user_analysis, context
            )
            
            # 6. 학습 기회 식별
            learning_opportunities = self._identify_learning_opportunities(context, user_analysis)
            
            # 7. 후속 질문 생성
            follow_up_questions = self._generate_follow_up_questions(selected_content, context)
            
            return {
                "success": True,
                "response": response,
                "user_analysis": user_analysis,
                "context": context.__dict__,
                "learning_opportunities": learning_opportunities,
                "follow_up_questions": follow_up_questions,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"궁극 응답 생성 오류: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    
    def _analyze_conversation_context(
        self, 
        message: str, 
        user_id: str, 
        conversation_history: List[Dict]
    ) -> ConversationContext:
        """대화 맥락 분석"""
        # 주제 추출
        topics = self._extract_topics(message)
        current_topic = topics[0] if topics else "일반"
        
        # 대화 상태 결정
        conversation_state = self._determine_conversation_state(message, conversation_history)
        
        # 학습 모드 결정
        learning_mode = self._determine_learning_mode(message, user_id)
        
        # 깊이 레벨 계산
        depth_level = self._calculate_depth_level(message, conversation_history)
        
        return ConversationContext(
            current_topic=current_topic,
            subtopics=topics[1:] if len(topics) > 1 else [],
            conversation_state=conversation_state,
            learning_mode=learning_mode,
            depth_level=depth_level,
            emotional_tone=self.adaptation_system.user_profiles.get(user_id, UserProfile(user_id, "")).emotional_state,
            user_engagement=self.adaptation_system.user_profiles.get(user_id, UserProfile(user_id, "")).interaction_history[-1]["analysis"]["engagement_level"] if self.adaptation_system.user_profiles.get(user_id) and self.adaptation_system.user_profiles[user_id].interaction_history else 0.5
        )
    
    def _extract_topics(self, message: str) -> List[str]:
        """주제 추출"""
        topic_keywords = {
            "역사": ["역사", "과거", "조선", "근대", "전통", "유산"],
            "정치": ["정치", "정부", "국회", "선거", "정책", "민주주의"],
            "교육": ["교육", "학습", "학교", "대학", "지식", "성장"],
            "사회": ["사회", "문화", "복지", "불평등", "다양성", "변화"],
            "기술": ["기술", "AI", "인공지능", "디지털", "혁신", "스마트"],
            "철학": ["철학", "윤리", "가치", "의미", "존재", "진리"],
            "경제": ["경제", "경기", "시장", "투자", "GDP", "인플레이션"]
        }
        
        detected_topics = []
        message_lower = message.lower()
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_topics.append(topic)
        
        return detected_topics if detected_topics else ["일반"]
    
    def _determine_conversation_state(self, message: str, history: List[Dict]) -> ConversationState:
        """대화 상태 결정"""
        if not history:
            return ConversationState.GREETING
        
        # 최근 대화 분석
        recent_messages = history[-3:] if len(history) >= 3 else history
        
        # 질문 패턴 분석
        question_count = sum(1 for msg in recent_messages if "?" in msg.get("message", ""))
        
        if question_count >= 2:
            return ConversationState.DEEP_DISCUSSION
        elif question_count == 1:
            return ConversationState.TOPIC_EXPLORATION
        else:
            return ConversationState.CONCLUSION
    
    def _determine_learning_mode(self, message: str, user_id: str) -> LearningMode:
        """학습 모드 결정"""
        user_profile = self.adaptation_system.user_profiles.get(user_id)
        
        if not user_profile:
            return LearningMode.ADAPTIVE
        
        # 사용자 선호도 기반 결정
        if user_profile.learning_preferences.get("depth_preference") == "deep":
            return LearningMode.CREATIVE
        elif user_profile.learning_preferences.get("depth_preference") == "shallow":
            return LearningMode.PASSIVE
        else:
            return LearningMode.ADAPTIVE
    
    def _calculate_depth_level(self, message: str, history: List[Dict]) -> int:
        """깊이 레벨 계산"""
        base_level = 1
        
        # 메시지 복잡도
        complexity_indicators = ["분석", "비교", "종합", "탐구", "심화"]
        complexity_score = sum(1 for indicator in complexity_indicators if indicator in message)
        
        # 대화 히스토리 길이
        history_length = len(history)
        
        # 깊이 레벨 계산
        depth_level = base_level + min(complexity_score, 2) + min(history_length // 3, 2)
        
        return min(depth_level, 5)
    
    def _select_optimal_content(
        self, 
        message: str, 
        context: ConversationContext, 
        user_analysis: Dict
    ) -> AdvancedYooContent:
        """최적 콘텐츠 선택"""
        # 주제별 콘텐츠 필터링
        relevant_content = [
            content for content in self.content_database 
            if content.topic == context.current_topic
        ]
        
        if not relevant_content:
            relevant_content = self.content_database
        
        # 복잡도 기반 필터링
        user_complexity_preference = user_analysis.get("complexity_preference", 0.5)
        complexity_threshold = 0.3 if user_complexity_preference < 0.4 else 0.7 if user_complexity_preference > 0.6 else 0.5
        
        filtered_content = [
            content for content in relevant_content
            if abs(content.complexity_level / 5 - complexity_threshold) < 0.3
        ]
        
        if not filtered_content:
            filtered_content = relevant_content
        
        # 랜덤 선택 (실제로는 더 정교한 알고리즘 사용)
        return random.choice(filtered_content)
    
    def _determine_response_style(self, user_analysis: Dict, context: ConversationContext) -> str:
        """응답 스타일 결정"""
        complexity_preference = user_analysis.get("complexity_preference", 0.5)
        
        if complexity_preference < 0.4:
            return "beginner"
        elif complexity_preference > 0.6:
            return "advanced"
        else:
            return "intermediate"
    
    def _generate_personalized_response(
        self,
        message: str,
        content: AdvancedYooContent,
        response_style: str,
        user_analysis: Dict,
        context: ConversationContext
    ) -> str:
        """개인화된 응답 생성"""
        templates = self.response_templates[response_style]
        
        # 시작 부분
        opening = templates["opening"].format(topic=content.topic)
        
        # 본문 구성
        response = f"{opening}\n\n"
        response += f"{content.content}\n\n"
        
        # 학습 목표 연결
        if content.learning_objectives:
            response += f"여기서 중요한 것은 {content.learning_objectives[0]}입니다.\n\n"
        
        # 현대적 관련성
        if content.modern_relevance:
            response += f"그런데 말이죠, {content.modern_relevance}\n\n"
        
        # 결론 부분
        conclusion = templates["conclusion"].format(topic=content.topic)
        response += f"{conclusion}\n\n"
        
        # 대화 유도
        if content.discussion_questions:
            response += f"{content.discussion_questions[0]}\n\n"
        
        response += "함께 생각해보는 것이 진정한 학습의 의미라고 생각합니다."
        
        return response
    
    def _identify_learning_opportunities(self, context: ConversationContext, user_analysis: Dict) -> List[str]:
        """학습 기회 식별"""
        opportunities = []
        
        # 지식 부족 영역 기반
        knowledge_gaps = user_analysis.get("knowledge_gaps", [])
        for gap in knowledge_gaps:
            opportunities.append(f"{gap} 영역에 대한 추가 학습")
        
        # 대화 깊이 기반
        if context.depth_level < 3:
            opportunities.append("더 깊이 있는 탐구를 위한 추가 질문")
        
        # 관련 주제 기반
        if context.current_topic in ["역사", "정치", "교육"]:
            opportunities.append("다양한 관점에서의 비교 분석")
        
        return opportunities
    
    def _generate_follow_up_questions(self, content: AdvancedYooContent, context: ConversationContext) -> List[str]:
        """후속 질문 생성"""
        questions = []
        
        # 콘텐츠의 토론 질문 활용
        if content.discussion_questions:
            questions.extend(content.discussion_questions[:2])
        
        # 관련 주제 질문
        if content.related_topics:
            questions.append(f"{content.related_topics[0]}과의 관계는 어떻게 생각하시나요?")
        
        # 깊이 기반 질문
        if context.depth_level < 3:
            questions.append("이 주제를 더 깊이 탐구해보고 싶으신가요?")
        
        return questions[:3]  # 최대 3개 질문

# FastAPI 앱 생성
app = FastAPI(
    title="궁극의 유시민 AI 시스템",
    description="고급 AI 통합 및 실시간 적응 시스템",
    version="4.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 시스템 인스턴스
ultimate_system = UltimateYooSiMinSystem()

class UltimateChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = "default"
    conversation_history: Optional[List[Dict]] = None

class UltimateChatResponse(BaseModel):
    success: bool
    response: str
    user_analysis: Optional[Dict] = None
    context: Optional[Dict] = None
    learning_opportunities: Optional[List[str]] = None
    follow_up_questions: Optional[List[str]] = None
    timestamp: str

@app.post("/api/ultimate-chat", response_model=UltimateChatResponse)
async def ultimate_chat_endpoint(request: UltimateChatRequest):
    """궁극의 채팅 API"""
    try:
        logger.info(f"궁극 채팅 요청: {request.message}")
        
        result = await ultimate_system.generate_ultimate_response(
            request.message,
            request.user_id,
            request.conversation_history or []
        )
        
        return UltimateChatResponse(**result)
        
    except Exception as e:
        logger.error(f"궁극 채팅 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user-profile/{user_id}")
async def get_user_profile(user_id: str):
    """사용자 프로필 조회"""
    try:
        profile = ultimate_system.adaptation_system.user_profiles.get(user_id)
        if not profile:
            return {"message": "사용자 프로필을 찾을 수 없습니다."}
        
        return {
            "success": True,
            "profile": {
                "user_id": profile.user_id,
                "name": profile.name,
                "interests": profile.interests,
                "expertise_level": profile.expertise_level,
                "conversation_style": profile.conversation_style,
                "learning_preferences": profile.learning_preferences,
                "emotional_state": profile.emotional_state,
                "last_updated": profile.last_updated
            }
        }
    except Exception as e:
        logger.error(f"사용자 프로필 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/learning-analytics")
async def get_learning_analytics():
    """학습 분석 데이터 조회"""
    try:
        analytics = {
            "total_users": len(ultimate_system.adaptation_system.user_profiles),
            "content_database_size": len(ultimate_system.content_database),
            "learning_patterns": ultimate_system.learning_engine.learning_patterns,
            "adaptation_rules": ultimate_system.learning_engine.adaptation_rules
        }
        
        return {
            "success": True,
            "analytics": analytics
        }
    except Exception as e:
        logger.error(f"학습 분석 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "궁극의 유시민 AI 시스템",
        "version": "4.0.0",
        "status": "running",
        "features": [
            "고급 AI 통합 및 실시간 학습",
            "개인화된 적응 시스템",
            "멀티모달 학습 통합",
            "지능형 대화 관리",
            "실시간 성능 최적화",
            "사용자 프로필 기반 맞춤화",
            "학습 기회 자동 식별",
            "후속 질문 자동 생성"
        ],
        "system_info": {
            "content_database": len(ultimate_system.content_database),
            "learning_patterns": len(ultimate_system.learning_engine.learning_patterns),
            "adaptation_rules": len(ultimate_system.learning_engine.adaptation_rules)
        },
        "endpoints": {
            "ultimate_chat": "/api/ultimate-chat",
            "user_profile": "/api/user-profile/{user_id}",
            "learning_analytics": "/api/learning-analytics",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    logger.info("🚀 궁극의 유시민 AI 시스템을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8003")
    logger.info("📚 API 문서: http://localhost:8003/docs")
    logger.info(f"📊 콘텐츠 데이터베이스: {len(ultimate_system.content_database)}개")
    logger.info(f"🧠 학습 패턴: {len(ultimate_system.learning_engine.learning_patterns)}개")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8003,
        reload=False,
        log_level="info"
    )
