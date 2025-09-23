#!/usr/bin/env python3
"""
설득 글쓰기 엔진 - 설득과 이해, 긍정 여론 형성
Persuasion Writing Engine - Persuasion, Understanding, and Positive Opinion Formation

Features:
- 설득적 글쓰기 기법
- 논리적 논증 구조
- 감정적 어필 전략
- 긍정적 여론 형성
- 다양한 설득 전략
"""

import time
import json
import logging
import random
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)

class PersuasionStrategy(Enum):
    """설득 전략"""
    LOGICAL = "logical"             # 논리적 설득
    EMOTIONAL = "emotional"         # 감정적 설득
    SOCIAL_PROOF = "social_proof"   # 사회적 증명
    AUTHORITY = "authority"         # 권위적 설득
    MIXED = "mixed"                 # 종합적 설득
    RECIPROCITY = "reciprocity"     # 상호성
    SCARCITY = "scarcity"           # 희소성
    COMMITMENT = "commitment"       # 일관성
    LIKING = "liking"               # 호감

class OpinionType(Enum):
    """여론 타입"""
    SUPPORTIVE = "supportive"       # 지지적
    NEUTRAL = "neutral"             # 중립적
    OPPOSING = "opposing"           # 반대적
    MIXED = "mixed"                 # 혼재

class AudienceType(Enum):
    """청중 타입"""
    GENERAL = "general"             # 일반인
    PROFESSIONAL = "professional"   # 전문가
    YOUTH = "youth"                 # 젊은층
    ELDERLY = "elderly"             # 중장년층
    ACADEMIC = "academic"           # 학술계
    BUSINESS = "business"           # 비즈니스

@dataclass
class PersuasionContext:
    """설득 컨텍스트"""
    topic: str
    target_audience: AudienceType
    current_opinion: OpinionType
    desired_opinion: OpinionType
    persuasion_strategy: PersuasionStrategy
    urgency_level: str
    credibility_required: bool
    emotional_appeal: bool
    data_support: bool

@dataclass
class PersuasionElement:
    """설득 요소"""
    element_type: str
    content: str
    strength: float
    target_audience: str
    emotional_impact: float
    logical_strength: float

@dataclass
class PersuasionResult:
    """설득 결과"""
    content: str
    persuasion_score: float
    credibility_score: float
    emotional_impact: float
    logical_strength: float
    audience_appeal: float
    opinion_change_potential: float
    elements_used: List[PersuasionElement]
    metadata: Dict[str, Any]

class PersuasionWritingEngine:
    """설득 글쓰기 엔진"""
    
    def __init__(self):
        self.persuasion_templates = self._initialize_persuasion_templates()
        self.logical_fallacies = self._initialize_logical_fallacies()
        self.emotional_triggers = self._initialize_emotional_triggers()
        self.social_proof_examples = self._initialize_social_proof_examples()
        self.authority_sources = self._initialize_authority_sources()
        self.audience_preferences = self._initialize_audience_preferences()
        
        print("✅ 설득 글쓰기 엔진 초기화 완료")
    
    def _initialize_persuasion_templates(self) -> Dict[str, Dict]:
        """설득 템플릿 초기화"""
        return {
            "logical": {
                "structure": [
                    "## 🎯 주장 제시",
                    "### 📊 논리적 근거",
                    "### 🔍 데이터 분석",
                    "### 💡 결론 도출",
                    "### 🚀 행동 촉구"
                ],
                "tone": "objective",
                "evidence_requirement": "high",
                "emotional_level": "low"
            },
            "emotional": {
                "structure": [
                    "## 💝 감정적 어필",
                    "### 🎭 스토리텔링",
                    "### 💔 공감대 형성",
                    "### 🌟 희망 제시",
                    "### ❤️ 마음 움직이기"
                ],
                "tone": "empathetic",
                "evidence_requirement": "medium",
                "emotional_level": "high"
            },
            "social_proof": {
                "structure": [
                    "## 👥 사회적 증명",
                    "### 📈 통계와 데이터",
                    "### 🏆 성공 사례",
                    "### 💬 사용자 후기",
                    "### 🌍 트렌드 분석"
                ],
                "tone": "confident",
                "evidence_requirement": "high",
                "emotional_level": "medium"
            },
            "authority": {
                "structure": [
                    "## 👨‍🎓 전문가 의견",
                    "### 🏛️ 기관 발표",
                    "### 📚 연구 결과",
                    "### 🎓 학술 논문",
                    "### 💼 업계 전문가"
                ],
                "tone": "authoritative",
                "evidence_requirement": "very_high",
                "emotional_level": "low"
            },
            "mixed": {
                "structure": [
                    "## 🎯 종합적 설득",
                    "### 📊 논리적 근거",
                    "### 💝 감정적 어필",
                    "### 👥 사회적 증명",
                    "### 🚀 행동 촉구"
                ],
                "tone": "balanced",
                "evidence_requirement": "high",
                "emotional_level": "medium"
            }
        }
    
    def _initialize_logical_fallacies(self) -> Dict[str, List[str]]:
        """논리적 오류 패턴"""
        return {
            "avoid": [
                "모든 사람이 그렇게 생각한다",
                "전통적으로 그래왔다",
                "자연스러운 것이 좋다",
                "전문가들이 모두 동의한다"
            ],
            "use": [
                "연구 결과에 따르면",
                "데이터 분석 결과",
                "통계적으로 확인된",
                "실증적으로 입증된"
            ]
        }
    
    def _initialize_emotional_triggers(self) -> Dict[str, List[str]]:
        """감정적 트리거"""
        return {
            "fear": [
                "위험", "위협", "손실", "실패", "실망", "후회"
            ],
            "hope": [
                "희망", "기회", "성공", "성장", "발전", "미래"
            ],
            "pride": [
                "자부심", "성취", "인정", "존경", "칭찬", "자랑"
            ],
            "belonging": [
                "소속감", "공동체", "함께", "우리", "연대", "단결"
            ],
            "curiosity": [
                "궁금", "신기", "새로운", "혁신", "발견", "탐구"
            ]
        }
    
    def _initialize_social_proof_examples(self) -> Dict[str, List[str]]:
        """사회적 증명 예시"""
        return {
            "statistics": [
                "전 세계 90% 이상이 사용",
                "매년 30%씩 증가",
                "100만 명 이상이 선택",
                "5년 연속 1위"
            ],
            "testimonials": [
                "실제 사용자 후기",
                "전문가 추천",
                "업계 인정",
                "수상 경력"
            ],
            "trends": [
                "최신 트렌드",
                "미래 전망",
                "시장 동향",
                "기술 발전"
            ]
        }
    
    def _initialize_authority_sources(self) -> Dict[str, List[str]]:
        """권위적 소스"""
        return {
            "academic": [
                "대학교 연구소",
                "학술 논문",
                "박사 학위자",
                "교수진"
            ],
            "professional": [
                "업계 전문가",
                "기업 임원",
                "정부 기관",
                "국제 기구"
            ],
            "media": [
                "주요 언론사",
                "전문 매체",
                "인터뷰",
                "보도 자료"
            ]
        }
    
    def _initialize_audience_preferences(self) -> Dict[str, Dict]:
        """청중별 선호도"""
        return {
            "general": {
                "language": "쉬운",
                "examples": "일상적",
                "length": "적당한",
                "style": "친근한"
            },
            "professional": {
                "language": "전문적",
                "examples": "업무적",
                "length": "상세한",
                "style": "정중한"
            },
            "youth": {
                "language": "트렌디",
                "examples": "흥미로운",
                "length": "짧은",
                "style": "캐주얼"
            },
            "elderly": {
                "language": "정중한",
                "examples": "전통적",
                "length": "자세한",
                "style": "존중하는"
            },
            "academic": {
                "language": "학술적",
                "examples": "연구적",
                "length": "포괄적",
                "style": "객관적"
            },
            "business": {
                "language": "비즈니스",
                "examples": "경제적",
                "length": "효율적",
                "style": "결과지향적"
            }
        }
    
    def generate_persuasive_content(self,
                                  context: PersuasionContext,
                                  word_count_target: int = 800) -> PersuasionResult:
        """설득적 콘텐츠 생성"""
        
        try:
            print(f"🎯 설득적 콘텐츠 생성 시작: {context.topic[:30]}...")
            
            # 1. 설득 전략 선택
            strategy = self._select_persuasion_strategy(context)
            
            # 2. 템플릿 선택
            template = self.persuasion_templates[strategy.value]
            
            # 3. 설득 요소 생성
            elements = self._generate_persuasion_elements(context, strategy)
            
            # 4. 콘텐츠 생성
            content = self._generate_persuasive_text(context, template, elements)
            
            # 5. 단어 수 조정
            content = self._adjust_word_count(content, word_count_target)
            
            # 6. 설득 효과 평가
            persuasion_score = self._calculate_persuasion_score(content, context)
            credibility_score = self._calculate_credibility_score(content, elements)
            emotional_impact = self._calculate_emotional_impact(content, context)
            logical_strength = self._calculate_logical_strength(content, elements)
            audience_appeal = self._calculate_audience_appeal(content, context)
            opinion_change_potential = self._calculate_opinion_change_potential(
                context.current_opinion, context.desired_opinion, persuasion_score
            )
            
            result = PersuasionResult(
                content=content,
                persuasion_score=persuasion_score,
                credibility_score=credibility_score,
                emotional_impact=emotional_impact,
                logical_strength=logical_strength,
                audience_appeal=audience_appeal,
                opinion_change_potential=opinion_change_potential,
                elements_used=elements,
                metadata={
                    "strategy_used": strategy.value,
                    "template_used": strategy.value,
                    "word_count": len(content.split()),
                    "generation_time": datetime.now().isoformat()
                }
            )
            
            print(f"✅ 설득적 콘텐츠 생성 완료: 설득도 {persuasion_score:.2f}, 신뢰도 {credibility_score:.2f}")
            
            return result
            
        except Exception as e:
            logger.error(f"설득적 콘텐츠 생성 오류: {e}")
            return self._create_fallback_persuasion_result(context.topic, str(e))
    
    def _select_persuasion_strategy(self, context: PersuasionContext) -> PersuasionStrategy:
        """설득 전략 선택"""
        # 현재 여론과 목표 여론의 차이에 따라 전략 선택
        if context.current_opinion == OpinionType.OPPOSING and context.desired_opinion == OpinionType.SUPPORTIVE:
            # 반대에서 지지로: 논리적 설득 우선
            return PersuasionStrategy.LOGICAL
        elif context.current_opinion == OpinionType.NEUTRAL:
            # 중립에서 지지로: 사회적 증명 우선
            return PersuasionStrategy.SOCIAL_PROOF
        elif context.emotional_appeal:
            # 감정적 어필 필요: 감정적 설득
            return PersuasionStrategy.EMOTIONAL
        elif context.credibility_required:
            # 신뢰성 중요: 권위적 설득
            return PersuasionStrategy.AUTHORITY
        else:
            # 기본: 종합적 설득
            return PersuasionStrategy.MIXED
    
    def _generate_persuasion_elements(self, context: PersuasionContext, strategy: PersuasionStrategy) -> List[PersuasionElement]:
        """설득 요소 생성"""
        elements = []
        
        if strategy == PersuasionStrategy.LOGICAL:
            elements.append(PersuasionElement(
                element_type="logical_argument",
                content=f"{context.topic}에 대한 논리적 근거를 제시합니다.",
                strength=0.9,
                target_audience=context.target_audience.value,
                emotional_impact=0.2,
                logical_strength=0.9
            ))
        
        elif strategy == PersuasionStrategy.EMOTIONAL:
            elements.append(PersuasionElement(
                element_type="emotional_appeal",
                content=f"{context.topic}에 대한 감정적 어필을 통해 마음을 움직입니다.",
                strength=0.8,
                target_audience=context.target_audience.value,
                emotional_impact=0.9,
                logical_strength=0.3
            ))
        
        elif strategy == PersuasionStrategy.SOCIAL_PROOF:
            elements.append(PersuasionElement(
                element_type="social_proof",
                content=f"{context.topic}에 대한 사회적 증명을 통해 신뢰를 구축합니다.",
                strength=0.8,
                target_audience=context.target_audience.value,
                emotional_impact=0.6,
                logical_strength=0.7
            ))
        
        elif strategy == PersuasionStrategy.AUTHORITY:
            elements.append(PersuasionElement(
                element_type="authority",
                content=f"{context.topic}에 대한 전문가 의견을 통해 권위를 확립합니다.",
                strength=0.9,
                target_audience=context.target_audience.value,
                emotional_impact=0.3,
                logical_strength=0.9
            ))
        
        return elements
    
    def _generate_persuasive_text(self, context: PersuasionContext, template: Dict, elements: List[PersuasionElement]) -> str:
        """설득적 텍스트 생성"""
        content_parts = []
        
        # 청중별 맞춤 인사
        greeting = self._generate_audience_greeting(context)
        content_parts.append(greeting)
        
        # 주장 제시
        claim = self._generate_claim(context)
        content_parts.append(claim)
        
        # 근거 제시
        evidence = self._generate_evidence(context, elements)
        content_parts.append(evidence)
        
        # 반박 논리 고려
        counterargument = self._generate_counterargument_handling(context)
        content_parts.append(counterargument)
        
        # 행동 촉구
        call_to_action = self._generate_call_to_action(context)
        content_parts.append(call_to_action)
        
        return "\n\n".join(content_parts)
    
    def _generate_audience_greeting(self, context: PersuasionContext) -> str:
        """청중별 맞춤 인사"""
        preferences = self.audience_preferences[context.target_audience.value]
        
        if context.target_audience == AudienceType.GENERAL:
            return "안녕하세요! 오늘은 여러분과 함께 중요한 주제에 대해 이야기해보고자 합니다."
        elif context.target_audience == AudienceType.PROFESSIONAL:
            return "안녕하세요. 업무상 중요한 이슈에 대해 논의하고자 합니다."
        elif context.target_audience == AudienceType.YOUTH:
            return "안녕! 오늘 정말 중요한 얘기 해볼게!"
        elif context.target_audience == AudienceType.ELDERLY:
            return "안녕하십니까. 존경하는 여러분께 중요한 말씀을 드리고자 합니다."
        elif context.target_audience == AudienceType.ACADEMIC:
            return "안녕하세요. 학술적 관점에서 중요한 주제를 다루고자 합니다."
        else:  # BUSINESS
            return "안녕하세요. 비즈니스 관점에서 중요한 이슈를 논의하겠습니다."
    
    def _generate_claim(self, context: PersuasionContext) -> str:
        """주장 생성"""
        if context.desired_opinion == OpinionType.SUPPORTIVE:
            return f"## 🎯 핵심 주장\n\n{context.topic}에 대해 긍정적인 관점을 가져야 한다고 생각합니다. 그 이유를 차근차근 설명드리겠습니다."
        elif context.desired_opinion == OpinionType.NEUTRAL:
            return f"## 🎯 균형잡힌 관점\n\n{context.topic}에 대해 객관적이고 균형잡힌 시각을 가져야 한다고 생각합니다."
        else:
            return f"## 🎯 신중한 접근\n\n{context.topic}에 대해 신중하고 비판적인 관점을 가져야 한다고 생각합니다."
    
    def _generate_evidence(self, context: PersuasionContext, elements: List[PersuasionElement]) -> str:
        """근거 생성"""
        evidence_parts = []
        
        for element in elements:
            if element.element_type == "logical_argument":
                evidence_parts.append(f"### 📊 논리적 근거\n\n{element.content}")
            elif element.element_type == "emotional_appeal":
                evidence_parts.append(f"### 💝 감정적 어필\n\n{element.content}")
            elif element.element_type == "social_proof":
                evidence_parts.append(f"### 👥 사회적 증명\n\n{element.content}")
            elif element.element_type == "authority":
                evidence_parts.append(f"### 👨‍🎓 전문가 의견\n\n{element.content}")
        
        # 추가 근거
        if context.data_support:
            evidence_parts.append("### 📈 데이터 지원\n\n연구 결과와 통계 데이터를 통해 주장을 뒷받침합니다.")
        
        return "\n\n".join(evidence_parts)
    
    def _generate_counterargument_handling(self, context: PersuasionContext) -> str:
        """반박 논리 처리"""
        if context.current_opinion == OpinionType.OPPOSING:
            return f"### 🤔 반대 의견 고려\n\n{context.topic}에 대한 반대 의견도 충분히 이해합니다. 하지만 다음과 같은 이유로 제 주장이 더 타당하다고 생각합니다."
        else:
            return f"### ⚖️ 균형잡힌 시각\n\n{context.topic}에 대한 다양한 관점을 고려해보면, 제시한 주장이 가장 합리적이라고 판단됩니다."
    
    def _generate_call_to_action(self, context: PersuasionContext) -> str:
        """행동 촉구 생성"""
        if context.urgency_level == "high":
            return f"### 🚀 즉시 행동\n\n{context.topic}에 대해 지금 당장 행동해야 합니다. 함께 노력해주시기 바랍니다!"
        elif context.urgency_level == "medium":
            return f"### 📅 적극적 참여\n\n{context.topic}에 대해 적극적으로 관심을 가져주시고, 함께 생각해주시기 바랍니다."
        else:
            return f"### 💭 깊이 있는 고민\n\n{context.topic}에 대해 깊이 있게 고민해보시고, 여러분의 의견을 들려주시기 바랍니다."
    
    def _adjust_word_count(self, content: str, target: int) -> str:
        """단어 수 조정"""
        current_words = len(content.split())
        
        if current_words < target * 0.7:
            # 내용 확장
            content = self._expand_persuasive_content(content, target)
        elif current_words > target * 1.3:
            # 내용 압축
            content = self._compress_persuasive_content(content, target)
        
        return content
    
    def _expand_persuasive_content(self, content: str, target: int) -> str:
        """설득적 콘텐츠 확장"""
        expansions = [
            "\n\n### 💡 추가 인사이트\n\n이 주제에 대해 더 깊이 생각해보면, 다음과 같은 중요한 점들을 발견할 수 있습니다.",
            "\n\n### 🌟 미래 전망\n\n앞으로의 발전 방향을 고려해보면, 이 주장의 중요성이 더욱 부각될 것입니다.",
            "\n\n### 🤝 함께하는 마음\n\n여러분과 함께 이 중요한 주제에 대해 더 나은 방향을 찾아가고 싶습니다."
        ]
        
        # 랜덤하게 1-2개 추가
        num_additions = random.randint(1, 2)
        selected_expansions = random.sample(expansions, num_additions)
        
        return content + "".join(selected_expansions)
    
    def _compress_persuasive_content(self, content: str, target: int) -> str:
        """설득적 콘텐츠 압축"""
        # 불필요한 부분 제거
        sentences = content.split('.')
        if len(sentences) > 5:
            # 마지막 몇 문장 제거
            sentences = sentences[:-2]
            return '.'.join(sentences) + '.'
        
        return content
    
    def _calculate_persuasion_score(self, content: str, context: PersuasionContext) -> float:
        """설득도 점수 계산"""
        score = 0.5  # 기본 점수
        
        # 설득적 키워드 포함 여부
        persuasive_words = ["확실히", "분명히", "당연히", "자연스럽게", "논리적으로"]
        for word in persuasive_words:
            if word in content:
                score += 0.1
        
        # 질문 포함 여부 (참여 유도)
        if '?' in content:
            score += 0.1
        
        # 행동 촉구 포함 여부
        action_words = ["해야", "해보세요", "시도해보세요", "함께", "지금"]
        for word in action_words:
            if word in content:
                score += 0.05
        
        return min(score, 1.0)
    
    def _calculate_credibility_score(self, content: str, elements: List[PersuasionElement]) -> float:
        """신뢰도 점수 계산"""
        score = 0.5  # 기본 점수
        
        # 근거 제시 여부
        evidence_words = ["연구", "데이터", "통계", "전문가", "분석"]
        for word in evidence_words:
            if word in content:
                score += 0.1
        
        # 논리적 구조
        if "논리적" in content or "체계적" in content:
            score += 0.1
        
        # 요소의 신뢰도
        if elements:
            avg_strength = sum(element.strength for element in elements) / len(elements)
            score += avg_strength * 0.2
        
        return min(score, 1.0)
    
    def _calculate_emotional_impact(self, content: str, context: PersuasionContext) -> float:
        """감정적 임팩트 계산"""
        if not context.emotional_appeal:
            return 0.3  # 낮은 감정적 임팩트
        
        score = 0.3  # 기본 점수
        
        # 감정적 단어 포함 여부
        for emotion_type, words in self.emotional_triggers.items():
            for word in words:
                if word in content:
                    score += 0.1
                    break
        
        # 개인적 표현
        personal_words = ["여러분", "우리", "함께", "마음", "느낌"]
        for word in personal_words:
            if word in content:
                score += 0.05
        
        return min(score, 1.0)
    
    def _calculate_logical_strength(self, content: str, elements: List[PersuasionElement]) -> float:
        """논리적 강도 계산"""
        score = 0.5  # 기본 점수
        
        # 논리적 연결어 포함 여부
        logical_words = ["따라서", "그러므로", "결론적으로", "요약하면", "즉"]
        for word in logical_words:
            if word in content:
                score += 0.1
        
        # 요소의 논리적 강도
        if elements:
            avg_logical = sum(element.logical_strength for element in elements) / len(elements)
            score += avg_logical * 0.3
        
        return min(score, 1.0)
    
    def _calculate_audience_appeal(self, content: str, context: PersuasionContext) -> float:
        """청중 어필도 계산"""
        score = 0.5  # 기본 점수
        
        preferences = self.audience_preferences[context.target_audience.value]
        
        # 청중별 선호 언어 사용
        if preferences["style"] == "친근한" and any(word in content for word in ["안녕", "여러분", "함께"]):
            score += 0.2
        elif preferences["style"] == "전문적" and any(word in content for word in ["분석", "연구", "데이터"]):
            score += 0.2
        elif preferences["style"] == "캐주얼" and any(word in content for word in ["정말", "완전", "진짜"]):
            score += 0.2
        
        return min(score, 1.0)
    
    def _calculate_opinion_change_potential(self, current: OpinionType, desired: OpinionType, persuasion_score: float) -> float:
        """여론 변화 가능성 계산"""
        # 현재 여론과 목표 여론의 차이
        if current == desired:
            return 0.1  # 변화 불필요
        
        # 변화 정도에 따른 난이도
        if current == OpinionType.OPPOSING and desired == OpinionType.SUPPORTIVE:
            difficulty = 0.8  # 가장 어려움
        elif current == OpinionType.NEUTRAL and desired == OpinionType.SUPPORTIVE:
            difficulty = 0.5  # 중간
        else:
            difficulty = 0.3  # 상대적으로 쉬움
        
        # 설득도와 난이도를 고려한 변화 가능성
        return persuasion_score * (1 - difficulty)
    
    def _create_fallback_persuasion_result(self, topic: str, error: str) -> PersuasionResult:
        """폴백 설득 결과 생성"""
        fallback_content = f"안녕하세요. {topic}에 대해 설득적인 글을 작성하려고 했는데, 시스템에 문제가 생겼네요. 죄송합니다. 다시 시도해보시거나 다른 방법으로 도움을 받아보세요!"
        
        return PersuasionResult(
            content=fallback_content,
            persuasion_score=0.3,
            credibility_score=0.4,
            emotional_impact=0.3,
            logical_strength=0.3,
            audience_appeal=0.5,
            opinion_change_potential=0.2,
            elements_used=[],
            metadata={"error": error, "fallback": True}
        )
    
    def get_system_stats(self) -> Dict[str, Any]:
        """시스템 통계"""
        return {
            "persuasion_templates": len(self.persuasion_templates),
            "logical_fallacies": sum(len(fallacies) for fallacies in self.logical_fallacies.values()),
            "emotional_triggers": sum(len(triggers) for triggers in self.emotional_triggers.values()),
            "social_proof_examples": sum(len(examples) for examples in self.social_proof_examples.values()),
            "authority_sources": sum(len(sources) for sources in self.authority_sources.values()),
            "audience_preferences": len(self.audience_preferences),
            "timestamp": datetime.now().isoformat()
        }

# 전역 인스턴스
persuasion_writing_engine = PersuasionWritingEngine()
