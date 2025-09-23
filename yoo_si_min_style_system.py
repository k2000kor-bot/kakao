#!/usr/bin/env python3
"""
유시민 스타일 대화 시스템
- 유시민 특유의 말투와 언어 구사
- 역사적 사례와 유추를 통한 설득
- 논리적이면서도 감정적인 설득 방식
- 상대방의 관점을 인정하면서도 자신의 주장을 펼치는 방식
"""

import json
import logging
import os
import re
import requests
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
import asyncio
import aiohttp

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Yoo Si-min Style Conversation System",
    description="유시민 스타일 대화 시스템",
    version="6.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 유시민 스타일 데이터 클래스들
@dataclass
class YooSiMinStyle:
    """유시민 스타일 특성"""
    speaking_rhythm: str
    vocabulary_style: str
    logical_structure: str
    emotional_appeal: str
    historical_reference: str
    analogy_preference: str

@dataclass
class HistoricalCase:
    """역사적 사례"""
    period: str
    event: str
    lesson: str
    relevance: str
    application: str

@dataclass
class YooSiMinContext:
    """유시민 스타일 맥락"""
    user_id: str
    conversation_history: List[Dict] = field(default_factory=list)
    historical_knowledge: Dict[str, List[HistoricalCase]] = field(default_factory=dict)
    style_preferences: Dict[str, float] = field(default_factory=dict)
    persuasion_effectiveness: Dict[str, float] = field(default_factory=dict)

class YooSiMinStyleEngine:
    """유시민 스타일 엔진"""
    
    def __init__(self):
        self.conversation_contexts: Dict[str, YooSiMinContext] = {}
        self.yoo_style_patterns = self._initialize_yoo_style_patterns()
        self.historical_cases = self._initialize_historical_cases()
        self.persuasion_templates = self._initialize_persuasion_templates()
        self.vocabulary_styles = self._initialize_vocabulary_styles()
        
    def _initialize_yoo_style_patterns(self) -> Dict:
        """유시민 스타일 패턴 초기화"""
        return {
            "opening_patterns": [
                "그런데 말이죠...",
                "사실 이 문제는...",
                "흥미로운 점이 있습니다...",
                "제가 생각해보니...",
                "여기서 중요한 것은..."
            ],
            "transition_patterns": [
                "그렇다면 이제...",
                "이것을 다른 각도에서 보면...",
                "여기서 핵심은...",
                "그런데 여기서 주목해야 할 것은...",
                "이것이 왜 중요한가 하면..."
            ],
            "emphasis_patterns": [
                "정말 중요한 것은",
                "핵심적으로 말하면",
                "결국 중요한 것은",
                "궁극적으로는",
                "근본적으로는"
            ],
            "conclusion_patterns": [
                "그래서 제가 말씀드리고 싶은 것은...",
                "결론적으로 말하면...",
                "이것이 제가 말하고자 하는 바입니다",
                "그래서 우리가 생각해야 할 것은...",
                "이것이 바로 핵심입니다"
            ],
            "question_patterns": [
                "그런데 여러분은 어떻게 생각하시나요?",
                "이것이 과연 옳은 것일까요?",
                "여기서 우리가 묻고 싶은 것은...",
                "그렇다면 이제 질문해봅시다...",
                "이것에 대해 어떻게 생각하시겠습니까?"
            ]
        }
    
    def _initialize_historical_cases(self) -> Dict[str, List[HistoricalCase]]:
        """역사적 사례 초기화"""
        return {
            "기술_발전": [
                HistoricalCase(
                    period="산업혁명",
                    event="증기기관의 발명과 보급",
                    lesson="기술의 발전은 사회 전반에 걸쳐 근본적인 변화를 가져온다",
                    relevance="현재 AI 기술의 발전과 유사한 패턴",
                    application="AI가 가져올 사회 변화를 예측하는 데 활용"
                ),
                HistoricalCase(
                    period="인쇄술 혁명",
                    event="구텐베르크의 인쇄술 발명",
                    lesson="정보 전달의 민주화는 지식의 보편화를 가져온다",
                    relevance="인터넷과 AI가 정보 접근성을 변화시키는 것과 유사",
                    application="AI 시대의 정보 민주화 논의에 활용"
                )
            ],
            "사회_변화": [
                HistoricalCase(
                    period="조선 후기",
                    event="실학의 등장과 발전",
                    lesson="새로운 사상은 기존 질서에 도전하며 변화를 이끈다",
                    relevance="현재의 혁신적 사고와 유사",
                    application="새로운 기술에 대한 사회적 수용 과정 설명"
                ),
                HistoricalCase(
                    period="근대화 과정",
                    event="개화기 지식인들의 역할",
                    lesson="변화의 시대에는 새로운 지식과 기술을 받아들이는 용기가 필요하다",
                    relevance="현재의 디지털 전환과 유사",
                    application="AI 시대 적응의 필요성 강조"
                )
            ],
            "교육_혁신": [
                HistoricalCase(
                    period="조선시대",
                    event="성리학 교육 체계",
                    lesson="교육은 사회의 가치관과 지식을 전달하는 핵심 수단이다",
                    relevance="현재 교육의 역할과 유사",
                    application="AI 시대 교육의 변화 방향 논의"
                )
            ]
        }
    
    def _initialize_persuasion_templates(self) -> Dict:
        """설득 템플릿 초기화"""
        return {
            "historical_analogy": {
                "structure": "역사적 사례 → 현재 상황과의 유사점 → 교훈 → 적용",
                "example": "과거 {period}의 {event}을 보면, {lesson}. 이것이 현재 {topic}과 어떻게 연결되는지 생각해보면..."
            },
            "logical_progression": {
                "structure": "문제 제기 → 원인 분석 → 해결책 제시 → 효과 예측",
                "example": "여기서 핵심은 {problem}입니다. 그 원인을 살펴보면 {cause}. 따라서 {solution}이 필요합니다."
            },
            "emotional_reasoning": {
                "structure": "공감 → 이해 → 희망 → 행동 촉구",
                "example": "여러분의 우려를 충분히 이해합니다. 하지만 {hope}. 그래서 우리가 {action}해야 합니다."
            },
            "comparative_analysis": {
                "structure": "비교 대상 → 공통점 → 차이점 → 우위성",
                "example": "{A}와 {B}를 비교해보면, 공통점은 {common}이고 차이점은 {difference}. 여기서 중요한 것은 {key_point}입니다."
            }
        }
    
    def _initialize_vocabulary_styles(self) -> Dict:
        """어휘 스타일 초기화"""
        return {
            "formal_academic": [
                "분석해보면", "고찰해보면", "검토해보면", "살펴보면",
                "근본적으로", "본질적으로", "궁극적으로", "핵심적으로"
            ],
            "conversational": [
                "그런데 말이죠", "사실은", "정말로", "실제로",
                "여러분이", "우리가", "우리 모두", "함께"
            ],
            "emphatic": [
                "정말 중요한 것은", "핵심은", "결국", "궁극적으로는",
                "반드시", "절대적으로", "근본적으로는"
            ],
            "questioning": [
                "그런데", "하지만", "그렇다면", "그러면",
                "과연", "정말로", "실제로는", "사실은"
            ]
        }
    
    async def analyze_yoo_style_potential(self, message: str, user_id: str) -> Dict:
        """유시민 스타일 적용 가능성 분석"""
        logger.info(f"유시민 스타일 분석 시작: {message[:50]}...")
        
        # 1. 주제 분석
        topic_analysis = self._analyze_topic_for_yoo_style(message)
        
        # 2. 역사적 사례 매칭
        historical_matches = self._find_historical_matches(message)
        
        # 3. 설득 전략 선택
        persuasion_strategy = self._select_yoo_persuasion_strategy(message, topic_analysis)
        
        # 4. 언어 스타일 선택
        language_style = self._select_yoo_language_style(message, topic_analysis)
        
        # 5. 감정적 톤 분석
        emotional_tone = self._analyze_emotional_tone_for_yoo_style(message)
        
        return {
            "topic_analysis": topic_analysis,
            "historical_matches": historical_matches,
            "persuasion_strategy": persuasion_strategy,
            "language_style": language_style,
            "emotional_tone": emotional_tone,
            "yoo_style_applicability": self._calculate_yoo_style_applicability(
                topic_analysis, historical_matches, persuasion_strategy
            )
        }
    
    def _analyze_topic_for_yoo_style(self, message: str) -> Dict:
        """유시민 스타일에 적합한 주제 분석"""
        topics = {
            "기술_사회": ["인공지능", "AI", "기술", "디지털", "혁신"],
            "교육_학습": ["교육", "학습", "지식", "배움", "성장"],
            "사회_정치": ["사회", "정치", "민주주의", "시민", "참여"],
            "경제_발전": ["경제", "발전", "성장", "혁신", "변화"],
            "문화_역사": ["문화", "역사", "전통", "가치", "정체성"]
        }
        
        detected_topics = []
        message_lower = message.lower()
        
        for topic, keywords in topics.items():
            if any(keyword in message_lower for keyword in keywords):
                detected_topics.append(topic)
        
        return {
            "primary_topic": detected_topics[0] if detected_topics else "일반",
            "all_topics": detected_topics,
            "complexity": len(detected_topics),
            "yoo_relevance": self._calculate_topic_relevance(detected_topics)
        }
    
    def _calculate_topic_relevance(self, topics: List[str]) -> float:
        """주제의 유시민 스타일 관련성 계산"""
        relevance_scores = {
            "기술_사회": 0.9,
            "교육_학습": 0.95,
            "사회_정치": 0.9,
            "경제_발전": 0.8,
            "문화_역사": 0.95,
            "일반": 0.5
        }
        
        if not topics:
            return relevance_scores["일반"]
        
        return max(relevance_scores.get(topic, 0.5) for topic in topics)
    
    def _find_historical_matches(self, message: str) -> List[HistoricalCase]:
        """역사적 사례 매칭"""
        matches = []
        message_lower = message.lower()
        
        for category, cases in self.historical_cases.items():
            for case in cases:
                # 키워드 매칭
                keywords = [case.period, case.event.split()[0] if case.event else ""]
                if any(keyword.lower() in message_lower for keyword in keywords if keyword):
                    matches.append(case)
        
        # 주제별 자동 매칭
        if "기술" in message_lower or "AI" in message_lower:
            matches.extend(self.historical_cases["기술_발전"])
        if "사회" in message_lower or "변화" in message_lower:
            matches.extend(self.historical_cases["사회_변화"])
        if "교육" in message_lower or "학습" in message_lower:
            matches.extend(self.historical_cases["교육_혁신"])
        
        return matches[:2]  # 최대 2개 반환
    
    def _select_yoo_persuasion_strategy(self, message: str, topic_analysis: Dict) -> str:
        """유시민식 설득 전략 선택"""
        if topic_analysis["yoo_relevance"] > 0.8:
            if "비교" in message or "차이" in message:
                return "comparative_analysis"
            elif "역사" in message or "과거" in message:
                return "historical_analogy"
            else:
                return "logical_progression"
        else:
            return "emotional_reasoning"
    
    def _select_yoo_language_style(self, message: str, topic_analysis: Dict) -> Dict:
        """유시민식 언어 스타일 선택"""
        if topic_analysis["complexity"] > 2:
            return {
                "primary": "formal_academic",
                "secondary": "conversational",
                "emphasis": "emphatic"
            }
        else:
            return {
                "primary": "conversational",
                "secondary": "questioning",
                "emphasis": "emphatic"
            }
    
    def _analyze_emotional_tone_for_yoo_style(self, message: str) -> str:
        """유시민 스타일 감정적 톤 분석"""
        emotional_indicators = {
            "passionate": ["중요", "핵심", "필요", "중요한", "important"],
            "thoughtful": ["생각", "고민", "고려", "think", "consider"],
            "hopeful": ["희망", "미래", "발전", "hope", "future"],
            "concerned": ["걱정", "우려", "문제", "worry", "concern"]
        }
        
        message_lower = message.lower()
        detected_tones = []
        
        for tone, indicators in emotional_indicators.items():
            if any(indicator in message_lower for indicator in indicators):
                detected_tones.append(tone)
        
        if not detected_tones:
            return "balanced"
        
        return detected_tones[0]
    
    def _calculate_yoo_style_applicability(self, topic_analysis: Dict, historical_matches: List[HistoricalCase], persuasion_strategy: str) -> float:
        """유시민 스타일 적용 가능성 계산"""
        topic_score = topic_analysis["yoo_relevance"]
        historical_score = min(1.0, len(historical_matches) * 0.5)
        strategy_score = 0.8 if persuasion_strategy in ["historical_analogy", "logical_progression"] else 0.6
        
        return (topic_score * 0.4 + historical_score * 0.3 + strategy_score * 0.3)
    
    async def generate_yoo_style_response(
        self,
        message: str,
        analysis: Dict,
        user_id: str
    ) -> str:
        """유시민 스타일 응답 생성"""
        logger.info("유시민 스타일 응답 생성 시작")
        
        # 주제 추출
        topic = self._extract_topic_from_message(message)
        
        # 유시민 스타일 응답 구성
        response = self._build_yoo_style_response(message, analysis, topic)
        
        # 맥락 업데이트
        self._update_yoo_context(user_id, message, analysis)
        
        logger.info(f"유시민 스타일 응답 생성 완료: {len(response)}자")
        return response
    
    def _extract_topic_from_message(self, message: str) -> str:
        """메시지에서 주제 추출"""
        tech_topics = {
            "인공지능": ["인공지능", "AI", "artificial intelligence"],
            "머신러닝": ["머신러닝", "ML", "machine learning"],
            "기술": ["기술", "technology", "tech"],
            "교육": ["교육", "education", "학습"],
            "사회": ["사회", "society", "사회적"]
        }
        
        message_lower = message.lower()
        for topic, keywords in tech_topics.items():
            if any(keyword in message_lower for keyword in keywords):
                return topic
        
        return "일반 주제"
    
    def _build_yoo_style_response(self, message: str, analysis: Dict, topic: str) -> str:
        """유시민 스타일 응답 구성"""
        
        # 시작 부분
        opening = self._get_yoo_opening(analysis["language_style"])
        
        # 역사적 사례 활용
        historical_section = self._build_historical_section(analysis["historical_matches"], topic)
        
        # 논리적 분석
        logical_section = self._build_logical_section(message, topic, analysis["persuasion_strategy"])
        
        # 감정적 호소
        emotional_section = self._build_emotional_section(analysis["emotional_tone"], topic)
        
        # 결론
        conclusion = self._get_yoo_conclusion(analysis["language_style"], topic)
        
        # 전체 응답 조합
        response = f"""{opening}

{historical_section}

{logical_section}

{emotional_section}

{conclusion}

---
*유시민 스타일로 제공하는 종합적 분석입니다*"""
        
        return response
    
    def _get_yoo_opening(self, language_style: Dict) -> str:
        """유시민식 시작 부분"""
        openings = self.yoo_style_patterns["opening_patterns"]
        selected_opening = openings[0]  # 기본적으로 첫 번째 패턴 사용
        
        return f"""## 🎯 유시민 스타일 분석

{selected_opening} 여러분이 제기하신 질문에 대해 말씀드리겠습니다."""
    
    def _build_historical_section(self, historical_matches: List[HistoricalCase], topic: str) -> str:
        """역사적 사례 섹션 구성"""
        if not historical_matches:
            return f"""### 📚 역사적 관점에서 보면

{topic}에 대한 우리의 이해는 역사적 맥락 속에서 더욱 깊어집니다. 과거의 경험들이 현재 우리가 직면한 문제들에 대한 통찰을 제공해주기 때문입니다."""
        
        case = historical_matches[0]
        return f"""### 📚 역사적 관점에서 보면

{case.period}의 {case.event}을 생각해보면, {case.lesson}. 

이것이 현재 {topic}과 어떻게 연결되는지 살펴보면, {case.relevance}. 

따라서 우리는 {case.application}을 통해 더 나은 이해에 도달할 수 있습니다."""
    
    def _build_logical_section(self, message: str, topic: str, strategy: str) -> str:
        """논리적 분석 섹션 구성"""
        if strategy == "comparative_analysis":
            return f"""### 🔍 논리적 분석

{topic}에 대해 체계적으로 분석해보면, 여기서 핵심은 비교의 기준을 명확히 하는 것입니다.

**첫째**, 정의적 측면에서의 차이점을 살펴보면...
**둘째**, 기능적 측면에서의 차이점을 고려하면...
**셋째**, 실제 적용에서의 차이점을 보면...

이런 관점에서 접근할 때 우리는 더 명확한 이해에 도달할 수 있습니다."""
        
        elif strategy == "historical_analogy":
            return f"""### 🔍 논리적 분석

{topic}에 대한 논리적 접근을 해보면, 여기서 중요한 것은 패턴의 인식입니다.

과거의 경험들이 보여주는 것은 변화의 과정에서 나타나는 일정한 패턴들이 있다는 것입니다. 

따라서 현재 {topic}에 대한 우리의 이해도 이런 역사적 패턴을 통해 더욱 깊어질 수 있습니다."""
        
        else:  # logical_progression
            return f"""### 🔍 논리적 분석

{topic}에 대해 단계적으로 접근해보면, 여기서 핵심은 문제의 본질을 파악하는 것입니다.

**문제의 정의**: {topic}이 무엇인지 명확히 해야 합니다.
**원인 분석**: 왜 이런 질문이 중요한지 살펴봐야 합니다.
**해결 방향**: 어떤 접근이 가장 적절한지 고려해야 합니다.

이런 체계적 접근을 통해 우리는 더 신뢰할 수 있는 결론에 도달할 수 있습니다."""
    
    def _build_emotional_section(self, emotional_tone: str, topic: str) -> str:
        """감정적 호소 섹션 구성"""
        if emotional_tone == "passionate":
            return f"""### 💝 감정적 공감

{topic}에 대한 여러분의 관심과 열정을 충분히 이해합니다. 

정말 중요한 것은 우리가 이런 질문을 던지고 있다는 사실 자체입니다. 이것은 우리가 더 나은 이해를 추구하고 있다는 증거이기 때문입니다.

그래서 제가 말씀드리고 싶은 것은, 이런 탐구 정신이야말로 진정한 학습의 시작이라는 것입니다."""
        
        elif emotional_tone == "hopeful":
            return f"""### 💝 감정적 공감

{topic}에 대한 여러분의 기대와 희망을 공유합니다.

미래에 대한 긍정적 전망은 우리가 더 나은 방향으로 나아갈 수 있는 동력이 됩니다. 

따라서 우리가 해야 할 일은 이런 희망을 현실로 만들어가는 것입니다."""
        
        else:  # balanced
            return f"""### 💝 감정적 공감

{topic}에 대한 여러분의 생각과 관점을 존중합니다.

여기서 중요한 것은 서로 다른 관점들을 인정하면서도 공통의 이해를 찾아가는 것입니다.

그래서 우리가 함께 생각해봐야 할 것은, 어떻게 하면 더 나은 이해에 도달할 수 있을까 하는 것입니다."""
    
    def _get_yoo_conclusion(self, language_style: Dict, topic: str) -> str:
        """유시민식 결론"""
        conclusions = self.yoo_style_patterns["conclusion_patterns"]
        selected_conclusion = conclusions[0]
        
        return f"""### 🎯 결론

{selected_conclusion} {topic}에 대한 우리의 이해는 이런 다양한 관점들을 종합할 때 더욱 풍부해집니다.

그런데 여러분은 어떻게 생각하시나요? 이런 관점들이 {topic}에 대한 여러분의 이해에 어떤 도움이 되었는지 궁금합니다.

함께 생각하고 토론하는 과정에서 우리는 더 나은 답을 찾아갈 수 있을 것입니다."""
    
    def _update_yoo_context(self, user_id: str, message: str, analysis: Dict):
        """유시민 스타일 맥락 업데이트"""
        if user_id not in self.conversation_contexts:
            self.conversation_contexts[user_id] = YooSiMinContext(user_id=user_id)
        
        context = self.conversation_contexts[user_id]
        
        # 대화 기록 추가
        context.conversation_history.append({
            "message": message,
            "analysis": analysis,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # 스타일 선호도 업데이트
        strategy = analysis["persuasion_strategy"]
        if strategy not in context.style_preferences:
            context.style_preferences[strategy] = 0.0
        context.style_preferences[strategy] += 0.1
        
        # 최근 10개 대화만 유지
        if len(context.conversation_history) > 10:
            context.conversation_history = context.conversation_history[-10:]

# 전역 엔진 인스턴스
yoo_engine = YooSiMinStyleEngine()

class ChatMessage(BaseModel):
    message: str
    user_id: str = "default"
    context: Optional[dict] = None

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Yoo Si-min Style Conversation System",
        "version": "6.0.0",
        "status": "running",
        "features": [
            "유시민 특유의 말투와 언어 구사",
            "역사적 사례와 유추를 통한 설득",
            "논리적이면서도 감정적인 설득 방식",
            "상대방의 관점을 인정하면서도 자신의 주장을 펼치는 방식",
            "교육적이면서도 친근한 소통 스타일",
            "역사와 현재를 연결하는 통찰력"
        ]
    }

@app.post("/api/chat")
async def yoo_style_chat_endpoint(chat_data: ChatMessage):
    """유시민 스타일 채팅 API"""
    try:
        logger.info(f"유시민 스타일 채팅 요청: {chat_data.message[:50]}...")
        
        # 1단계: 유시민 스타일 분석
        analysis = await yoo_engine.analyze_yoo_style_potential(
            chat_data.message, chat_data.user_id
        )
        logger.info(f"유시민 스타일 분석 완료: 적용가능성={analysis['yoo_style_applicability']:.2f}")
        
        # 2단계: 유시민 스타일 응답 생성
        response = await yoo_engine.generate_yoo_style_response(
            chat_data.message, analysis, chat_data.user_id
        )
        
        result = {
            "success": True,
            "response": response,
            "yoo_style_analysis": {
                "topic_analysis": analysis["topic_analysis"],
                "historical_matches": [
                    {
                        "period": case.period,
                        "event": case.event,
                        "lesson": case.lesson,
                        "relevance": case.relevance,
                        "application": case.application
                    } for case in analysis["historical_matches"]
                ],
                "persuasion_strategy": analysis["persuasion_strategy"],
                "language_style": analysis["language_style"],
                "emotional_tone": analysis["emotional_tone"],
                "yoo_style_applicability": analysis["yoo_style_applicability"]
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        logger.info(f"유시민 스타일 답변 생성 완료: {len(response)}자")
        return result
        
    except Exception as e:
        logger.error(f"유시민 스타일 채팅 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/yoo-context/{user_id}")
async def get_yoo_context(user_id: str):
    """유시민 스타일 맥락 조회"""
    try:
        context = yoo_engine.conversation_contexts.get(user_id)
        if not context:
            return {"message": "유시민 스타일 대화 기록이 없습니다"}
        
        return {
            "user_id": user_id,
            "conversation_count": len(context.conversation_history),
            "style_preferences": context.style_preferences,
            "persuasion_effectiveness": context.persuasion_effectiveness,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"유시민 스타일 맥락 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_yoo_status():
    """유시민 스타일 시스템 상태 확인"""
    return {
        "status": "healthy",
        "active_sessions": len(yoo_engine.conversation_contexts),
        "style_patterns": len(yoo_engine.yoo_style_patterns),
        "historical_cases": sum(len(cases) for cases in yoo_engine.historical_cases.values()),
        "persuasion_templates": len(yoo_engine.persuasion_templates),
        "message": "유시민 스타일 대화 시스템이 정상적으로 작동하고 있습니다"
    }

if __name__ == "__main__":
    logger.info("🚀 Yoo Si-min Style Conversation System을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
