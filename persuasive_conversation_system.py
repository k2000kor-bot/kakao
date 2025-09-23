#!/usr/bin/env python3
"""
설득적 대화 시스템
- 설득 이론 기반 답변 생성
- 고급 대화 전략 및 기법
- 심리학적 분석 및 적응적 응답
- 논리적 구조화 및 감정적 설득
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
    title="Persuasive Conversation System",
    description="설득적 대화 처리 시스템",
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

# 설득 이론 및 대화 전략 데이터 클래스들
@dataclass
class PersuasionContext:
    """설득 맥락 정보"""
    user_id: str
    conversation_history: List[Dict] = field(default_factory=list)
    user_beliefs: Dict[str, float] = field(default_factory=dict)
    user_values: List[str] = field(default_factory=list)
    resistance_level: float = 0.5
    persuasion_style: str = "balanced"
    emotional_state: str = "neutral"
    cognitive_load: float = 0.5
    trust_level: float = 0.7

@dataclass
class PersuasionStrategy:
    """설득 전략"""
    strategy_type: str
    approach: str
    evidence_type: str
    emotional_appeal: str
    logical_structure: str
    credibility_boost: str
    resistance_handling: str

@dataclass
class ConversationAnalysis:
    """대화 분석 결과"""
    intent_type: str
    persuasion_potential: float
    resistance_indicators: List[str]
    emotional_triggers: List[str]
    logical_gaps: List[str]
    credibility_needs: List[str]
    optimal_strategy: PersuasionStrategy
    confidence: float

class PersuasionTheory(Enum):
    """설득 이론"""
    ELABORATION_LIKELIHOOD_MODEL = "정교화 가능성 모델"
    SOCIAL_PROOF = "사회적 증명"
    AUTHORITY = "권위"
    RECIPROCITY = "호혜성"
    COMMITMENT_CONSISTENCY = "일관성"
    SCARCITY = "희소성"
    LIKING = "호감"
    FEAR_APPEAL = "공포 호소"
    RATIONAL_APPEAL = "합리적 호소"
    EMOTIONAL_APPEAL = "감정적 호소"

class ConversationStrategy(Enum):
    """대화 전략"""
    SOCRATIC_METHOD = "소크라테스식 질문법"
    STORYTELLING = "스토리텔링"
    ANALOGY = "유추"
    REFRAMING = "재구성"
    COMMON_GROUND = "공통점 찾기"
    BENEFIT_FOCUS = "이익 중심"
    PROBLEM_SOLUTION = "문제-해결"
    COMPARISON = "비교"
    TESTIMONIAL = "증언"
    EXPERT_OPINION = "전문가 의견"

class PersuasiveConversationEngine:
    """설득적 대화 엔진"""
    
    def __init__(self):
        self.persuasion_contexts: Dict[str, PersuasionContext] = {}
        self.persuasion_strategies = self._initialize_persuasion_strategies()
        self.conversation_templates = self._initialize_conversation_templates()
        self.psychological_patterns = self._initialize_psychological_patterns()
        
    def _initialize_persuasion_strategies(self) -> Dict:
        """설득 전략 초기화"""
        return {
            "logical": {
                "approach": "논리적 근거 제시",
                "evidence_type": "데이터, 통계, 연구 결과",
                "emotional_appeal": "신뢰감, 안정감",
                "logical_structure": "전제-논증-결론",
                "credibility_boost": "전문가 인용, 객관적 자료",
                "resistance_handling": "반박 논리 제시"
            },
            "emotional": {
                "approach": "감정적 공감 및 연결",
                "evidence_type": "개인적 경험, 감동적 사례",
                "emotional_appeal": "공감, 동정, 희망",
                "logical_structure": "문제-감정-해결",
                "credibility_boost": "개인적 신뢰, 진정성",
                "resistance_handling": "감정적 저항 인정"
            },
            "social": {
                "approach": "사회적 증명 및 집단 압력",
                "evidence_type": "다른 사람들의 행동, 성공 사례",
                "emotional_appeal": "소속감, 동조 욕구",
                "logical_structure": "다수-성공-권장",
                "credibility_boost": "집단 지지, 사회적 인정",
                "resistance_handling": "집단 압력 완화"
            },
            "authority": {
                "approach": "전문성 및 권위 활용",
                "evidence_type": "전문가 의견, 연구, 인증",
                "emotional_appeal": "신뢰, 존경, 확신",
                "logical_structure": "전문가-근거-권고",
                "credibility_boost": "전문 자격, 경험, 성과",
                "resistance_handling": "전문성 인정 요구"
            },
            "balanced": {
                "approach": "논리와 감정의 균형",
                "evidence_type": "다양한 근거 조합",
                "emotional_appeal": "균형잡힌 감정 호소",
                "logical_structure": "종합적 접근",
                "credibility_boost": "다면적 신뢰 구축",
                "resistance_handling": "포괄적 저항 관리"
            }
        }
    
    def _initialize_conversation_templates(self) -> Dict:
        """대화 템플릿 초기화"""
        return {
            "socratic": {
                "opening": "이 문제에 대해 어떻게 생각하시나요?",
                "probing": "그렇다면 그 이유는 무엇일까요?",
                "challenging": "만약 반대 상황이라면 어떨까요?",
                "concluding": "이런 관점에서 보면 어떠신가요?"
            },
            "storytelling": {
                "opening": "비슷한 상황에서 이런 일이 있었습니다...",
                "development": "그때 사람들은 이렇게 생각했습니다...",
                "climax": "하지만 실제로는 이렇게 되었습니다...",
                "conclusion": "이 경험에서 우리가 배울 수 있는 것은..."
            },
            "analogy": {
                "opening": "이것은 마치 [비유 대상]과 같습니다...",
                "comparison": "둘 다 [공통점]이 있습니다...",
                "application": "따라서 [원래 주제]도 마찬가지로...",
                "conclusion": "이런 관점에서 보면..."
            },
            "reframing": {
                "opening": "다른 각도에서 보면...",
                "perspective": "이것을 [새로운 관점]으로 보면...",
                "benefit": "이렇게 보면 오히려 [장점]이 있습니다...",
                "conclusion": "따라서 [새로운 해석]이 가능합니다..."
            }
        }
    
    def _initialize_psychological_patterns(self) -> Dict:
        """심리학적 패턴 초기화"""
        return {
            "cognitive_biases": {
                "confirmation_bias": "확증 편향",
                "anchoring_bias": "앵커링 편향",
                "availability_heuristic": "가용성 휴리스틱",
                "representativeness": "대표성 휴리스틱",
                "loss_aversion": "손실 회피"
            },
            "emotional_triggers": {
                "fear": "공포",
                "hope": "희망",
                "anger": "분노",
                "joy": "기쁨",
                "sadness": "슬픔",
                "surprise": "놀라움"
            },
            "persuasion_principles": {
                "reciprocity": "호혜성 원칙",
                "commitment": "일관성 원칙",
                "social_proof": "사회적 증명",
                "authority": "권위 원칙",
                "liking": "호감 원칙",
                "scarcity": "희소성 원칙"
            }
        }
    
    async def analyze_persuasion_potential(self, message: str, user_id: str) -> ConversationAnalysis:
        """설득 가능성 분석"""
        logger.info(f"설득 가능성 분석 시작: {message[:50]}...")
        
        # 1. 의도 유형 분석
        intent_type = self._analyze_intent_type(message)
        
        # 2. 저항 지표 분석
        resistance_indicators = self._analyze_resistance_indicators(message)
        
        # 3. 감정적 트리거 분석
        emotional_triggers = self._analyze_emotional_triggers(message)
        
        # 4. 논리적 공백 분석
        logical_gaps = self._analyze_logical_gaps(message)
        
        # 5. 신뢰도 필요성 분석
        credibility_needs = self._analyze_credibility_needs(message, user_id)
        
        # 6. 설득 가능성 계산
        persuasion_potential = self._calculate_persuasion_potential(
            resistance_indicators, emotional_triggers, logical_gaps
        )
        
        # 7. 최적 전략 선택
        optimal_strategy = self._select_optimal_strategy(
            intent_type, persuasion_potential, user_id
        )
        
        # 8. 신뢰도 계산
        confidence = self._calculate_persuasion_confidence(
            intent_type, resistance_indicators, emotional_triggers
        )
        
        return ConversationAnalysis(
            intent_type=intent_type,
            persuasion_potential=persuasion_potential,
            resistance_indicators=resistance_indicators,
            emotional_triggers=emotional_triggers,
            logical_gaps=logical_gaps,
            credibility_needs=credibility_needs,
            optimal_strategy=optimal_strategy,
            confidence=confidence
        )
    
    def _analyze_intent_type(self, message: str) -> str:
        """의도 유형 분석"""
        message_lower = message.lower()
        
        # 설득 관련 의도 키워드
        persuasion_keywords = {
            "convince": ["설득", "납득", "확신", "믿게", "동의", "convince", "persuade"],
            "inform": ["알려", "설명", "정보", "가르쳐", "inform", "explain"],
            "debate": ["논쟁", "반박", "반대", "의견", "debate", "argue", "논쟁하고", "토론", "discuss"],
            "support": ["지지", "도움", "지원", "응원", "support", "help"],
            "question": ["질문", "궁금", "알고싶", "question", "wonder"]
        }
        
        for intent, keywords in persuasion_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                return intent
        
        # 추가 패턴 매칭 - 논쟁 의도 강화
        debate_patterns = [
            "논쟁", "토론", "논쟁하고", "토론하고", "debate", "discuss",
            "근거", "증거", "이유", "왜", "어떻게", "why", "how",
            "반박", "반대", "의견", "생각", "opinion", "argue",
            "설명해", "알려줘", "가르쳐", "explain", "tell me"
        ]
        
        if any(pattern in message_lower for pattern in debate_patterns):
            return "debate"
        
        return "general"
    
    def _analyze_resistance_indicators(self, message: str) -> List[str]:
        """저항 지표 분석"""
        resistance_patterns = {
            "강한 저항": ["절대", "결코", "절대 안", "불가능", "never", "impossible"],
            "중간 저항": ["의심", "확신 안", "불안", "걱정", "doubt", "worry"],
            "약한 저항": ["아마", "혹시", "maybe", "perhaps"],
            "개방적": ["생각해볼", "고려해볼", "consider", "think about"]
        }
        
        indicators = []
        message_lower = message.lower()
        
        for level, patterns in resistance_patterns.items():
            if any(pattern in message_lower for pattern in patterns):
                indicators.append(level)
        
        return indicators
    
    def _analyze_emotional_triggers(self, message: str) -> List[str]:
        """감정적 트리거 분석"""
        emotional_patterns = {
            "공포": ["두려워", "무서워", "걱정", "불안", "fear", "worry", "anxious"],
            "희망": ["기대", "희망", "바라", "원해", "hope", "wish", "expect"],
            "분노": ["화나", "짜증", "불만", "angry", "frustrated", "annoyed"],
            "기쁨": ["좋아", "행복", "즐거워", "happy", "joy", "pleased"],
            "슬픔": ["슬퍼", "우울", "힘들어", "sad", "depressed", "difficult"],
            "놀라움": ["놀라", "신기", "surprised", "amazing", "wow"]
        }
        
        triggers = []
        message_lower = message.lower()
        
        for emotion, patterns in emotional_patterns.items():
            if any(pattern in message_lower for pattern in patterns):
                triggers.append(emotion)
        
        return triggers
    
    def _analyze_logical_gaps(self, message: str) -> List[str]:
        """논리적 공백 분석"""
        gaps = []
        
        # 근거 부족
        if not re.search(r'왜냐하면|이유는|때문에|because|since|reason', message.lower()):
            gaps.append("근거 부족")
        
        # 구체성 부족
        if not re.search(r'\d+|구체적|실제|actual|specific', message.lower()):
            gaps.append("구체성 부족")
        
        # 대안 고려 부족
        if not re.search(r'또는|대신|대안|alternative|instead', message.lower()):
            gaps.append("대안 고려 부족")
        
        return gaps
    
    def _analyze_credibility_needs(self, message: str, user_id: str) -> List[str]:
        """신뢰도 필요성 분석"""
        needs = []
        
        # 전문성 관련 키워드
        if re.search(r'전문가|연구|데이터|통계|expert|research|data', message.lower()):
            needs.append("전문성 증명")
        
        # 경험 관련 키워드
        if re.search(r'경험|실제|사례|experience|case|actual', message.lower()):
            needs.append("경험 증명")
        
        # 객관성 관련 키워드
        if re.search(r'객관적|공정|fair|objective|neutral', message.lower()):
            needs.append("객관성 증명")
        
        return needs
    
    def _calculate_persuasion_potential(self, resistance: List[str], emotions: List[str], gaps: List[str]) -> float:
        """설득 가능성 계산"""
        base_potential = 0.5
        
        # 저항 수준에 따른 조정
        resistance_penalty = 0.0
        if "강한 저항" in resistance:
            resistance_penalty = -0.3
        elif "중간 저항" in resistance:
            resistance_penalty = -0.1
        elif "개방적" in resistance:
            resistance_penalty = 0.1
        
        # 감정적 트리거에 따른 조정
        emotion_bonus = len(emotions) * 0.05
        
        # 논리적 공백에 따른 조정
        gap_penalty = len(gaps) * -0.1
        
        potential = base_potential + resistance_penalty + emotion_bonus + gap_penalty
        return max(0.0, min(1.0, potential))
    
    def _select_optimal_strategy(self, intent_type: str, persuasion_potential: float, user_id: str) -> PersuasionStrategy:
        """최적 전략 선택"""
        # 사용자 맥락 가져오기
        context = self.persuasion_contexts.get(user_id)
        
        if not context:
            context = PersuasionContext(user_id=user_id)
            self.persuasion_contexts[user_id] = context
        
        # 설득 가능성에 따른 전략 선택
        if persuasion_potential > 0.7:
            strategy_type = "logical"  # 높은 설득 가능성 → 논리적 접근
        elif persuasion_potential < 0.3:
            strategy_type = "emotional"  # 낮은 설득 가능성 → 감정적 접근
        else:
            strategy_type = "balanced"  # 중간 설득 가능성 → 균형적 접근
        
        # 의도 유형에 따른 조정
        if intent_type == "debate":
            strategy_type = "logical"
        elif intent_type == "support":
            strategy_type = "emotional"
        
        strategy_config = self.persuasion_strategies[strategy_type]
        
        return PersuasionStrategy(
            strategy_type=strategy_type,
            approach=strategy_config["approach"],
            evidence_type=strategy_config["evidence_type"],
            emotional_appeal=strategy_config["emotional_appeal"],
            logical_structure=strategy_config["logical_structure"],
            credibility_boost=strategy_config["credibility_boost"],
            resistance_handling=strategy_config["resistance_handling"]
        )
    
    def _calculate_persuasion_confidence(self, intent_type: str, resistance: List[str], emotions: List[str]) -> float:
        """설득 신뢰도 계산"""
        base_confidence = 0.6
        
        # 의도 유형에 따른 조정
        intent_bonus = {
            "convince": 0.1,
            "inform": 0.05,
            "debate": 0.15,
            "support": 0.1,
            "question": 0.0
        }.get(intent_type, 0.0)
        
        # 저항 수준에 따른 조정
        resistance_bonus = 0.0
        if "개방적" in resistance:
            resistance_bonus = 0.1
        elif "강한 저항" in resistance:
            resistance_bonus = -0.1
        
        # 감정적 트리거에 따른 조정
        emotion_bonus = min(0.1, len(emotions) * 0.02)
        
        confidence = base_confidence + intent_bonus + resistance_bonus + emotion_bonus
        return max(0.0, min(0.95, confidence))
    
    async def generate_persuasive_response(
        self,
        message: str,
        analysis: ConversationAnalysis,
        user_id: str
    ) -> str:
        """설득적 응답 생성"""
        logger.info("설득적 응답 생성 시작")
        
        # 대화 맥락 가져오기
        context = self.persuasion_contexts.get(user_id)
        
        # 설득 전략에 따른 응답 생성
        if analysis.optimal_strategy.strategy_type == "logical":
            response = self._generate_logical_persuasion(message, analysis, context)
        elif analysis.optimal_strategy.strategy_type == "emotional":
            response = self._generate_emotional_persuasion(message, analysis, context)
        elif analysis.optimal_strategy.strategy_type == "social":
            response = self._generate_social_persuasion(message, analysis, context)
        elif analysis.optimal_strategy.strategy_type == "authority":
            response = self._generate_authority_persuasion(message, analysis, context)
        else:
            response = self._generate_balanced_persuasion(message, analysis, context)
        
        # 대화 맥락 업데이트
        self._update_persuasion_context(user_id, message, analysis)
        
        logger.info(f"설득적 응답 생성 완료: {len(response)}자")
        return response
    
    def _generate_logical_persuasion(self, message: str, analysis: ConversationAnalysis, context: Optional[PersuasionContext]) -> str:
        """논리적 설득 응답 생성"""
        
        # 메시지에서 주제 추출
        topic = self._extract_topic_from_message(message)
        
        response = f"""## 🧠 논리적 설득 및 분석

**귀하의 질문**: "{message}"

### 📊 논리적 접근 방식
{analysis.optimal_strategy.approach}을 통해 귀하의 질문에 체계적으로 답변드리겠습니다.

### 🔍 핵심 논리 구조
**전제**: {self._extract_premise(message)}
**논증**: {self._build_argument(message, analysis)}
**결론**: {self._derive_conclusion(message, analysis)}

### 📈 구체적 근거 및 증거
{analysis.optimal_strategy.evidence_type}를 바탕으로 다음과 같이 설명드립니다:

#### 1. **정의 및 개념 분석**
{topic}에 대한 명확한 정의와 핵심 개념을 제시합니다.

#### 2. **객관적 데이터 분석**
- 통계적 근거와 연구 결과
- 비교 분석을 통한 차이점 명확화
- 실제 사례와 적용 예시

#### 3. **논리적 추론 과정**
- 전제에서 결론으로의 명확한 논리적 연결
- 인과관계 분석을 통한 원인과 결과 제시
- 반대 논리 검증을 통한 견고성 확보

### 🛡️ 반박 논리 대응
{analysis.optimal_strategy.resistance_handling}을 통해 다음과 같이 대응합니다:

1. **일반적 반박에 대한 논리적 반응**
2. **대안적 관점에 대한 객관적 평가**
3. **한계점 인정과 함께 강점 강조**

### 💡 핵심 메시지
논리적 근거와 객관적 데이터를 바탕으로 한 신뢰할 수 있는 결론을 제시합니다. 
귀하의 질문에 대해 체계적이고 명확한 답변을 제공하여 논쟁의 기반을 마련합니다."""
        
        return response
    
    def _generate_emotional_persuasion(self, message: str, analysis: ConversationAnalysis, context: Optional[PersuasionContext]) -> str:
        """감정적 설득 응답 생성"""
        response = f"""## 💝 감정적 공감 및 설득

**귀하의 질문**: "{message}"

### 🤗 감정적 연결
{analysis.optimal_strategy.emotional_appeal}을 통해 귀하와의 깊은 연결을 만들어가겠습니다.

### 💭 감정적 이해
현재 느끼고 계신 감정을 충분히 이해합니다:
{chr(10).join(f"- {trigger}" for trigger in analysis.emotional_triggers) if analysis.emotional_triggers else "- 감정적 상태 분석 중"}

### 🌟 공감적 접근
1. **감정 인정**: 현재 감정의 정당성 인정
2. **공감 표현**: 진심어린 이해와 공감
3. **희망 제시**: 긍정적인 변화의 가능성
4. **지지 제공**: 구체적이고 실용적인 도움

### 🎯 감정적 설득 전략
{analysis.optimal_strategy.approach}을 통해 귀하의 마음을 움직여보겠습니다.

### 💡 핵심 메시지
감정적 연결과 진정한 공감을 바탕으로 한 따뜻한 설득을 제공합니다."""
        
        return response
    
    def _generate_social_persuasion(self, message: str, analysis: ConversationAnalysis, context: Optional[PersuasionContext]) -> str:
        """사회적 설득 응답 생성"""
        response = f"""## 👥 사회적 증명 및 설득

**귀하의 질문**: "{message}"

### 🌍 사회적 맥락
{analysis.optimal_strategy.approach}을 통해 사회적 증명을 활용한 설득을 제공합니다.

### 📊 사회적 증거
다른 사람들이 어떻게 생각하고 행동하는지 살펴보겠습니다:

1. **다수 의견**: 대부분의 사람들이 선택하는 방향
2. **성공 사례**: 비슷한 상황에서 성공한 사례들
3. **사회적 트렌드**: 현재 사회의 변화 방향
4. **집단 지지**: 관련 커뮤니티의 지지와 격려

### 🤝 공통점 발견
{analysis.optimal_strategy.emotional_appeal}을 통해 우리가 공유하는 가치와 관점을 찾아보겠습니다.

### 🎯 사회적 설득 전략
- **집단 압력 활용**: 사회적 규범과 기대
- **성공 모델 제시**: 비슷한 사람들의 성공 사례
- **소속감 강화**: 같은 집단의 일원이라는 인식

### 💡 핵심 메시지
사회적 증명과 집단 지지를 바탕으로 한 설득력을 제공합니다."""
        
        return response
    
    def _generate_authority_persuasion(self, message: str, analysis: ConversationAnalysis, context: Optional[PersuasionContext]) -> str:
        """권위적 설득 응답 생성"""
        response = f"""## 🎓 권위 및 전문성 기반 설득

**귀하의 질문**: "{message}"

### 🏆 전문성 인정
{analysis.optimal_strategy.approach}을 통해 전문적이고 신뢰할 수 있는 설득을 제공합니다.

### 📚 전문가 근거
{analysis.optimal_strategy.evidence_type}를 바탕으로 한 권위 있는 정보를 제공합니다:

1. **전문가 의견**: 해당 분야 전문가들의 견해
2. **연구 결과**: 과학적 연구와 실험 결과
3. **인증 기관**: 공신력 있는 기관의 인증
4. **경험적 증거**: 오랜 경험에서 나온 지혜

### 🔬 신뢰도 강화
{analysis.optimal_strategy.credibility_boost}을 통해 정보의 신뢰성을 높입니다.

### 📈 권위적 설득 전략
- **전문성 강조**: 깊이 있는 지식과 경험
- **객관성 유지**: 편견 없는 중립적 관점
- **근거 제시**: 명확하고 검증된 근거

### 💡 핵심 메시지
전문성과 권위를 바탕으로 한 신뢰할 수 있는 설득을 제공합니다."""
        
        return response
    
    def _generate_balanced_persuasion(self, message: str, analysis: ConversationAnalysis, context: Optional[PersuasionContext]) -> str:
        """균형적 설득 응답 생성"""
        response = f"""## ⚖️ 균형적 설득 및 종합 분석

**귀하의 질문**: "{message}"

### 🎯 종합적 접근
{analysis.optimal_strategy.approach}을 통해 균형잡힌 설득을 제공합니다.

### 🔄 다면적 분석
논리와 감정, 개인과 사회, 현재와 미래를 모두 고려한 종합적 접근:

1. **논리적 측면**: 객관적 데이터와 분석
2. **감정적 측면**: 인간적 공감과 이해
3. **사회적 측면**: 사회적 맥락과 영향
4. **개인적 측면**: 개인의 상황과 필요

### 🌟 균형잡힌 설득 전략
- **다각도 접근**: 여러 관점에서의 종합적 분석
- **균형 유지**: 편향되지 않은 공정한 관점
- **포용적 태도**: 다양한 의견과 선택지 존중

### 💡 핵심 메시지
논리와 감정, 객관과 주관의 균형을 통한 포괄적 설득을 제공합니다."""
        
        return response
    
    def _extract_premise(self, message: str) -> str:
        """전제 추출"""
        # 간단한 전제 추출 로직
        if "차이점" in message:
            return "비교 대상들 간의 차이점이 존재한다"
        elif "장단점" in message:
            return "모든 것에는 장점과 단점이 있다"
        elif "방법" in message:
            return "문제 해결을 위한 방법이 존재한다"
        else:
            return "질문에 대한 답변이 존재한다"
    
    def _build_argument(self, message: str, analysis: ConversationAnalysis) -> str:
        """논증 구축"""
        if analysis.optimal_strategy.strategy_type == "logical":
            return "논리적 근거와 객관적 데이터를 통한 체계적 분석"
        elif analysis.optimal_strategy.strategy_type == "emotional":
            return "감정적 공감과 인간적 이해를 통한 연결"
        else:
            return "다양한 관점과 근거를 통한 종합적 분석"
    
    def _derive_conclusion(self, message: str, analysis: ConversationAnalysis) -> str:
        """결론 도출"""
        return f"분석 결과를 바탕으로 한 {analysis.optimal_strategy.strategy_type}적 결론"
    
    def _extract_topic_from_message(self, message: str) -> str:
        """메시지에서 주제 추출"""
        # 기술 관련 주제 추출
        tech_topics = {
            "인공지능": ["인공지능", "AI", "artificial intelligence"],
            "머신러닝": ["머신러닝", "ML", "machine learning"],
            "딥러닝": ["딥러닝", "DL", "deep learning"],
            "데이터": ["데이터", "data", "빅데이터"],
            "알고리즘": ["알고리즘", "algorithm"]
        }
        
        message_lower = message.lower()
        for topic, keywords in tech_topics.items():
            if any(keyword in message_lower for keyword in keywords):
                return topic
        
        # 일반적인 주제 추출
        if "차이점" in message:
            return "비교 분석"
        elif "장단점" in message:
            return "장단점 분석"
        elif "방법" in message:
            return "방법론"
        else:
            return "일반 주제"
    
    def _update_persuasion_context(self, user_id: str, message: str, analysis: ConversationAnalysis):
        """설득 맥락 업데이트"""
        if user_id not in self.persuasion_contexts:
            self.persuasion_contexts[user_id] = PersuasionContext(user_id=user_id)
        
        context = self.persuasion_contexts[user_id]
        
        # 대화 기록 추가
        context.conversation_history.append({
            "message": message,
            "analysis": analysis.__dict__,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # 저항 수준 업데이트
        if analysis.resistance_indicators:
            if "강한 저항" in analysis.resistance_indicators:
                context.resistance_level = min(1.0, context.resistance_level + 0.1)
            elif "개방적" in analysis.resistance_indicators:
                context.resistance_level = max(0.0, context.resistance_level - 0.1)
        
        # 감정 상태 업데이트
        if analysis.emotional_triggers:
            context.emotional_state = analysis.emotional_triggers[0]
        
        # 최근 10개 대화만 유지
        if len(context.conversation_history) > 10:
            context.conversation_history = context.conversation_history[-10:]
        
        context.last_updated = datetime.now(timezone.utc).isoformat()

# 전역 엔진 인스턴스
persuasion_engine = PersuasiveConversationEngine()

class ChatMessage(BaseModel):
    message: str
    user_id: str = "default"
    context: Optional[dict] = None

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Persuasive Conversation System",
        "version": "4.0.0",
        "status": "running",
        "features": [
            "설득 이론 기반 답변 생성",
            "고급 대화 전략 및 기법",
            "심리학적 분석 및 적응적 응답",
            "논리적 구조화 및 감정적 설득",
            "사회적 증명 및 권위 활용",
            "균형잡힌 설득 전략"
        ]
    }

@app.post("/api/chat")
async def persuasive_chat_endpoint(chat_data: ChatMessage):
    """설득적 채팅 API"""
    try:
        logger.info(f"설득적 채팅 요청: {chat_data.message[:50]}...")
        
        # 1단계: 설득 가능성 분석
        analysis = await persuasion_engine.analyze_persuasion_potential(
            chat_data.message, chat_data.user_id
        )
        logger.info(f"설득 분석 완료: {analysis.intent_type}, 전략: {analysis.optimal_strategy.strategy_type}")
        
        # 2단계: 설득적 응답 생성
        response = await persuasion_engine.generate_persuasive_response(
            chat_data.message, analysis, chat_data.user_id
        )
        
        result = {
            "success": True,
            "response": response,
            "persuasion_analysis": {
                "intent_type": analysis.intent_type,
                "persuasion_potential": analysis.persuasion_potential,
                "resistance_indicators": analysis.resistance_indicators,
                "emotional_triggers": analysis.emotional_triggers,
                "logical_gaps": analysis.logical_gaps,
                "credibility_needs": analysis.credibility_needs,
                "optimal_strategy": {
                    "strategy_type": analysis.optimal_strategy.strategy_type,
                    "approach": analysis.optimal_strategy.approach,
                    "evidence_type": analysis.optimal_strategy.evidence_type,
                    "emotional_appeal": analysis.optimal_strategy.emotional_appeal,
                    "logical_structure": analysis.optimal_strategy.logical_structure,
                    "credibility_boost": analysis.optimal_strategy.credibility_boost,
                    "resistance_handling": analysis.optimal_strategy.resistance_handling
                },
                "confidence": analysis.confidence
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        logger.info(f"설득적 답변 생성 완료: {len(response)}자")
        return result
        
    except Exception as e:
        logger.error(f"설득적 채팅 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/persuasion/{user_id}")
async def get_persuasion_context(user_id: str):
    """설득 맥락 조회"""
    try:
        context = persuasion_engine.persuasion_contexts.get(user_id)
        if not context:
            return {"message": "설득 기록이 없습니다"}
        
        return {
            "user_id": user_id,
            "conversation_count": len(context.conversation_history),
            "resistance_level": context.resistance_level,
            "persuasion_style": context.persuasion_style,
            "emotional_state": context.emotional_state,
            "trust_level": context.trust_level,
            "last_updated": context.last_updated
        }
    except Exception as e:
        logger.error(f"설득 맥락 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_persuasion_status():
    """설득 시스템 상태 확인"""
    return {
        "status": "healthy",
        "active_persuasion_sessions": len(persuasion_engine.persuasion_contexts),
        "available_strategies": list(persuasion_engine.persuasion_strategies.keys()),
        "psychological_patterns": len(persuasion_engine.psychological_patterns),
        "message": "설득적 대화 시스템이 정상적으로 작동하고 있습니다"
    }

if __name__ == "__main__":
    logger.info("🚀 Persuasive Conversation System을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
