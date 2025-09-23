#!/usr/bin/env python3
"""
고도화된 논리적 설득 시스템
- 고급 논리학 및 수사학 기법
- 심리학적 설득 전략
- 다층적 논증 구조
- 반박 및 재반박 시스템
- 감정-논리 통합 설득
"""

import logging
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Advanced Logical Persuasion System",
    description="고도화된 논리적 설득 시스템",
    version="5.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 고급 논리적 설득 데이터 클래스들


@dataclass
class LogicalArgument:
    """논리적 논증"""
    premise: str
    evidence: List[str]
    reasoning: str
    conclusion: str
    strength: float
    fallacies: List[str]
    counter_arguments: List[str]


@dataclass
class RhetoricalStrategy:
    """수사학적 전략"""
    ethos: str  # 신뢰성
    pathos: str  # 감정적 호소
    logos: str   # 논리적 호소
    kairos: str  # 적절한 시점
    style: str   # 문체


@dataclass
class PsychologicalProfile:
    """심리학적 프로필"""
    cognitive_style: str
    decision_making_style: str
    risk_tolerance: float
    authority_respect: float
    social_influence_susceptibility: float
    emotional_intelligence: float


@dataclass
class AdvancedPersuasionContext:
    """고급 설득 맥락"""
    user_id: str
    conversation_history: List[Dict] = field(default_factory=list)
    logical_preferences: Dict[str, float] = field(default_factory=dict)
    psychological_profile: Optional[PsychologicalProfile] = None
    argument_history: List[LogicalArgument] = field(default_factory=list)
    persuasion_effectiveness: Dict[str, float] = field(default_factory=dict)
    resistance_patterns: List[str] = field(default_factory=list)


class LogicalFallacy(Enum):
    """논리적 오류"""
    AD_HOMINEM = "인신공격"
    STRAW_MAN = "허수아비 공격"
    FALSE_DILEMMA = "거짓 딜레마"
    APPEAL_TO_AUTHORITY = "권위에의 호소"
    APPEAL_TO_EMOTION = "감정에의 호소"
    SLIPPERY_SLOPE = "미끄러운 경사"
    HASTY_GENERALIZATION = "성급한 일반화"
    POST_HOC = "후건부정"
    CIRCULAR_REASONING = "순환논증"
    RED_HERRING = "빨간 청어"


class RhetoricalDevice(Enum):
    """수사학적 기법"""
    METAPHOR = "은유"
    ANALOGY = "유추"
    REPETITION = "반복"
    PARALLELISM = "대구법"
    ANTITHESIS = "대조법"
    RHETORICAL_QUESTION = "수사적 의문문"
    HYPERBOLE = "과장법"
    IRONY = "반어법"
    ALLITERATION = "두운법"
    ANAPHORA = "두음법"


class AdvancedLogicalPersuasionEngine:
    """고도화된 논리적 설득 엔진"""

    def __init__(self):
        self.persuasion_contexts: Dict[str, AdvancedPersuasionContext] = {}
        self.logical_frameworks = self._initialize_logical_frameworks()
        self.rhetorical_strategies = self._initialize_rhetorical_strategies()
        self.psychological_patterns = self._initialize_psychological_patterns()
        self.argument_templates = self._initialize_argument_templates()
        
    def _initialize_logical_frameworks(self) -> Dict:
        """논리적 프레임워크 초기화"""
        return {
            "deductive": {
                "description": "연역적 추론",
                "structure": "일반적 원리 → 특수한 경우 → 결론",
                "strength": 0.9,
                "use_case": "명확한 원리가 있는 경우"
            },
            "inductive": {
                "description": "귀납적 추론",
                "structure": "특수한 사례들 → 일반적 원리 → 결론",
                "strength": 0.7,
                "use_case": "패턴을 찾아야 하는 경우"
            },
            "abductive": {
                "description": "가설적 추론",
                "structure": "관찰된 현상 → 최선의 설명 → 결론",
                "strength": 0.6,
                "use_case": "원인을 추론해야 하는 경우"
            },
            "dialectical": {
                "description": "변증법적 추론",
                "structure": "정립 → 반정립 → 종합",
                "strength": 0.8,
                "use_case": "대립되는 관점을 통합해야 하는 경우"
            },
            "analogical": {
                "description": "유추적 추론",
                "structure": "유사한 사례 → 공통점 → 결론",
                "strength": 0.5,
                "use_case": "비유를 통한 설명이 필요한 경우"
            }
        }
    
    def _initialize_rhetorical_strategies(self) -> Dict:
        """수사학적 전략 초기화"""
        return {
            "ethos": {
                "credibility_builders": [
                    "전문성 강조", "경험 인용", "객관성 유지", "신뢰할 수 있는 소스 활용"
                ],
                "trust_indicators": [
                    "인정된 연구 결과", "전문가 의견", "검증된 데이터", "공신력 있는 기관"
                ]
            },
            "pathos": {
                "emotional_triggers": [
                    "공감", "동정", "희망", "두려움", "자부심", "분노"
                ],
                "emotional_appeals": [
                    "개인적 이야기", "감동적 사례", "미래 비전", "현재 문제점"
                ]
            },
            "logos": {
                "logical_structures": [
                    "인과관계", "비교분석", "통계적 근거", "논리적 추론"
                ],
                "evidence_types": [
                    "데이터", "연구결과", "실제사례", "논리적 증명"
                ]
            },
            "kairos": {
                "timing_factors": [
                    "현재 상황의 중요성", "시급성", "적절한 시점", "기회의 창"
                ],
                "urgency_indicators": [
                    "지금이 중요한 순간", "기회를 놓치면 안 됨", "시대적 요구"
                ]
            }
        }
    
    def _initialize_psychological_patterns(self) -> Dict:
        """심리학적 패턴 초기화"""
        return {
            "cognitive_biases": {
                "confirmation_bias": "확증 편향 - 자신의 믿음을 확인하는 정보를 선호",
                "anchoring_bias": "앵커링 편향 - 첫 번째 정보에 과도하게 의존",
                "availability_heuristic": "가용성 휴리스틱 - 쉽게 떠오르는 정보를 과대평가",
                "representativeness": "대표성 휴리스틱 - 전형적인 사례로 판단",
                "loss_aversion": "손실 회피 - 손실을 이익보다 크게 느낌"
            },
            "persuasion_principles": {
                "reciprocity": "호혜성 - 받은 것에 대해 갚으려는 심리",
                "commitment": "일관성 - 자신의 말과 행동을 일치시키려는 심리",
                "social_proof": "사회적 증명 - 다른 사람들이 하는 것을 따라하려는 심리",
                "authority": "권위 - 전문가나 권위자의 말을 믿으려는 심리",
                "liking": "호감 - 좋아하는 사람의 말을 듣고 싶어하는 심리",
                "scarcity": "희소성 - 희귀한 것을 더 가치 있게 여기는 심리"
            },
            "decision_making_styles": {
                "analytical": "분석적 - 데이터와 논리를 중시",
                "intuitive": "직관적 - 감정과 직감을 중시",
                "systematic": "체계적 - 단계별로 신중하게 결정",
                "spontaneous": "즉흥적 - 빠르고 감정적으로 결정"
            }
        }
    
    def _initialize_argument_templates(self) -> Dict:
        """논증 템플릿 초기화"""
        return {
            "comparison": {
                "structure": "A와 B의 비교 → 공통점과 차이점 → 우위성 판단 → 결론",
                "evidence": "객관적 기준, 데이터, 사례",
                "rhetorical": "대조법, 유추법"
            },
            "causal": {
                "structure": "원인 분석 → 결과 예측 → 인과관계 증명 → 결론",
                "evidence": "인과관계 데이터, 실험결과, 통계",
                "rhetorical": "논리적 추론, 수사적 의문문"
            },
            "problem_solution": {
                "structure": "문제 정의 → 원인 분석 → 해결책 제시 → 효과 예측",
                "evidence": "문제 사례, 해결 사례, 효과 데이터",
                "rhetorical": "감정적 호소, 미래 비전"
            },
            "definitional": {
                "structure": "정의 제시 → 특징 분석 → 범위 확정 → 적용",
                "evidence": "정의적 근거, 특징적 사례, 적용 사례",
                "rhetorical": "은유법, 유추법"
            }
        }
    
    async def analyze_advanced_persuasion_potential(
        self, message: str, user_id: str
    ) -> Dict:
        """고급 설득 가능성 분석"""
        logger.info(f"고급 설득 가능성 분석 시작: {message[:50]}...")
        
        # 1. 논리적 복잡도 분석
        logical_complexity = self._analyze_logical_complexity(message)
        
        # 2. 수사학적 기회 분석
        rhetorical_opportunities = self._analyze_rhetorical_opportunities(
            message
        )
        
        # 3. 심리학적 저항 분석
        psychological_resistance = self._analyze_psychological_resistance(
            message, user_id
        )
        
        # 4. 최적 논증 프레임워크 선택
        optimal_framework = self._select_optimal_framework(
            logical_complexity, message
        )
        
        # 5. 수사학적 전략 선택
        rhetorical_strategy = self._select_rhetorical_strategy(
            rhetorical_opportunities, user_id
        )
        
        # 6. 심리학적 설득 전략 선택
        psychological_strategy = self._select_psychological_strategy(
            psychological_resistance, user_id
        )
        
        return {
            "logical_complexity": logical_complexity,
            "rhetorical_opportunities": rhetorical_opportunities,
            "psychological_resistance": psychological_resistance,
            "optimal_framework": optimal_framework,
            "rhetorical_strategy": rhetorical_strategy,
            "psychological_strategy": psychological_strategy,
            "overall_potential": self._calculate_overall_potential(
                logical_complexity, rhetorical_opportunities,
                psychological_resistance
            )
        }
    
    def _analyze_logical_complexity(self, message: str) -> Dict:
        """논리적 복잡도 분석"""
        complexity_factors = {
            "argument_count": len(re.findall(
                r'그리고|또한|또는|하지만|그러나', message
            )),
            "conditional_statements": len(re.findall(
                r'만약|만약에|경우|때문에', message
            )),
            "comparative_elements": len(re.findall(
                r'비교|차이|장단점|대비', message
            )),
            "technical_terms": len(re.findall(
                r'[A-Z]{2,}|[가-힣]{3,}기술|[가-힣]{3,}학', message
            )),
            "question_complexity": len(re.findall(r'[?]', message))
        }
        
        total_complexity = sum(complexity_factors.values()) / len(
            complexity_factors
        )
        
        return {
            "score": min(1.0, total_complexity / 10),
            "factors": complexity_factors,
            "level": (
                "높음" if total_complexity > 0.7
                else "중간" if total_complexity > 0.4
                else "낮음"
            )
        }
    
    def _analyze_rhetorical_opportunities(self, message: str) -> Dict:
        """수사학적 기회 분석"""
        opportunities = {
            "ethos_opportunities": [],
            "pathos_opportunities": [],
            "logos_opportunities": [],
            "kairos_opportunities": []
        }
        
        # 신뢰성 기회
        if re.search(r'전문가|연구|데이터|통계|expert|research', message.lower()):
            opportunities["ethos_opportunities"].append("전문성 강조")
        
        # 감정적 기회
        emotional_words = ['좋아', '싫어', '기쁘', '슬프', '화나', '걱정', '희망']
        if any(word in message.lower() for word in emotional_words):
            opportunities["pathos_opportunities"].append("감정적 연결")
        
        # 논리적 기회
        if re.search(r'왜|어떻게|이유|원인|결과|because|why|how', message.lower()):
            opportunities["logos_opportunities"].append("논리적 설명")
        
        # 시점 기회
        if re.search(r'지금|현재|최근|요즘|now|current|recent', message.lower()):
            opportunities["kairos_opportunities"].append("시점의 중요성")
        
        return opportunities
    
    def _analyze_psychological_resistance(self, message: str, user_id: str) -> Dict:
        """심리학적 저항 분석"""
        # 사용자 맥락 가져오기
        context = self.persuasion_contexts.get(user_id)
        
        resistance_indicators = {
            "strong_resistance": [
                "절대", "결코", "절대 안", "불가능", "never", "impossible"
            ],
            "moderate_resistance": [
                "의심", "확신 안", "불안", "걱정", "doubt", "worry"
            ],
            "weak_resistance": ["아마", "혹시", "maybe", "perhaps"],
            "open": ["생각해볼", "고려해볼", "consider", "think about"]
        }
        
        detected_resistance = []
        message_lower = message.lower()
        
        for level, patterns in resistance_indicators.items():
            if any(pattern in message_lower for pattern in patterns):
                detected_resistance.append(level)
        
        # 인지 편향 분석
        cognitive_biases = []
        if "확신" in message_lower:
            cognitive_biases.append("확증 편향")
        if "첫" in message_lower or "처음" in message_lower:
            cognitive_biases.append("앵커링 편향")
        
        return {
            "resistance_levels": detected_resistance,
            "cognitive_biases": cognitive_biases,
            "overall_resistance": self._calculate_resistance_score(
                detected_resistance
            ),
            "user_profile": (
                context.psychological_profile if context else None
            )
        }
    
    def _calculate_resistance_score(self, resistance_levels: List[str]) -> float:
        """저항 점수 계산"""
        if "strong_resistance" in resistance_levels:
            return 0.8
        elif "moderate_resistance" in resistance_levels:
            return 0.5
        elif "weak_resistance" in resistance_levels:
            return 0.2
        elif "open" in resistance_levels:
            return 0.1
        else:
            return 0.3  # 기본값
    
    def _select_optimal_framework(self, complexity: Dict, message: str) -> str:
        """최적 논증 프레임워크 선택"""
        if complexity["score"] > 0.7:
            return "dialectical"  # 복잡한 경우 변증법적 접근
        elif "비교" in message or "차이" in message:
            return "deductive"  # 비교가 필요한 경우 - 연역적 접근 사용
        elif "원인" in message or "결과" in message:
            return "deductive"  # 인과관계가 필요한 경우 - 연역적 접근 사용
        elif "정의" in message or "무엇" in message:
            return "deductive"  # 정의가 필요한 경우 - 연역적 접근 사용
        else:
            return "deductive"  # 기본적으로 연역적 접근
    
    def _select_rhetorical_strategy(self, opportunities: Dict, user_id: str) -> Dict:
        """수사학적 전략 선택"""
        strategy = {
            "primary_appeal": "logos",  # 기본적으로 논리적 호소
            "secondary_appeal": "ethos",
            "supporting_appeals": []
        }
        
        # 기회가 많은 호소 방식 선택
        appeal_counts = {
            "ethos": len(opportunities["ethos_opportunities"]),
            "pathos": len(opportunities["pathos_opportunities"]),
            "logos": len(opportunities["logos_opportunities"]),
            "kairos": len(opportunities["kairos_opportunities"])
        }
        
        # 가장 많은 기회가 있는 호소 방식 선택
        primary_appeal = max(appeal_counts, key=appeal_counts.get)
        strategy["primary_appeal"] = primary_appeal
        
        # 보조 호소 방식 선택
        remaining_appeals = {k: v for k, v in appeal_counts.items() if k != primary_appeal}
        if remaining_appeals:
            secondary_appeal = max(remaining_appeals, key=remaining_appeals.get)
            strategy["secondary_appeal"] = secondary_appeal
        
        return strategy
    
    def _select_psychological_strategy(self, resistance: Dict, user_id: str) -> Dict:
        """심리학적 설득 전략 선택"""
        resistance_score = resistance["overall_resistance"]
        
        if resistance_score > 0.6:
            # 높은 저항 - 감정적 접근
            return {
                "approach": "emotional",
                "principles": ["liking", "reciprocity"],
                "techniques": ["공감", "개인적 연결", "점진적 설득"]
            }
        elif resistance_score > 0.3:
            # 중간 저항 - 균형적 접근
            return {
                "approach": "balanced",
                "principles": ["authority", "social_proof"],
                "techniques": ["전문성 강조", "사회적 증명", "논리적 근거"]
            }
        else:
            # 낮은 저항 - 논리적 접근
            return {
                "approach": "logical",
                "principles": ["commitment", "consistency"],
                "techniques": ["논리적 증명", "데이터 제시", "체계적 설명"]
            }
    
    def _calculate_overall_potential(self, complexity: Dict, opportunities: Dict, resistance: Dict) -> float:
        """전체 설득 가능성 계산"""
        complexity_score = complexity["score"]
        opportunity_score = sum(len(opps) for opps in opportunities.values()) / 4
        resistance_score = 1.0 - resistance["overall_resistance"]
        
        overall = (complexity_score * 0.3 + opportunity_score * 0.4 + resistance_score * 0.3)
        return min(1.0, overall)
    
    async def generate_advanced_logical_response(
        self,
        message: str,
        analysis: Dict,
        user_id: str
    ) -> str:
        """고급 논리적 응답 생성"""
        logger.info("고급 논리적 응답 생성 시작")
        
        # 주제 추출
        topic = self._extract_advanced_topic(message)
        
        # 논증 구조 생성
        argument_structure = self._build_advanced_argument_structure(message, analysis, topic)
        
        # 수사학적 기법 적용
        rhetorical_response = self._apply_rhetorical_devices(argument_structure, analysis["rhetorical_strategy"])
        
        # 심리학적 설득 요소 추가
        psychological_response = self._add_psychological_elements(rhetorical_response, analysis["psychological_strategy"])
        
        # 최종 응답 조합
        final_response = self._combine_advanced_response(message, psychological_response, analysis)
        
        # 맥락 업데이트
        self._update_advanced_context(user_id, message, analysis)
        
        logger.info(f"고급 논리적 응답 생성 완료: {len(final_response)}자")
        return final_response
    
    def _extract_advanced_topic(self, message: str) -> str:
        """고급 주제 추출"""
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
        
        if "차이점" in message:
            return "비교 분석"
        elif "장단점" in message:
            return "장단점 분석"
        elif "방법" in message:
            return "방법론"
        else:
            return "일반 주제"
    
    def _build_advanced_argument_structure(self, message: str, analysis: Dict, topic: str) -> Dict:
        """고급 논증 구조 구축"""
        framework = analysis["optimal_framework"]
        framework_info = self.logical_frameworks[framework]
        
        return {
            "framework": framework,
            "framework_info": framework_info,
            "topic": topic,
            "premises": self._generate_premises(message, topic),
            "evidence": self._generate_evidence(message, topic),
            "reasoning": self._generate_reasoning(message, framework),
            "conclusion": self._generate_conclusion(message, topic),
            "counter_arguments": self._generate_counter_arguments(message, topic)
        }
    
    def _generate_premises(self, message: str, topic: str) -> List[str]:
        """전제 생성"""
        premises = []
        
        if topic == "인공지능":
            premises.extend([
                "인공지능은 인간의 지능을 모방하는 기술입니다",
                "인공지능은 다양한 분야에서 활용되고 있습니다",
                "인공지능의 발전은 지속적으로 이루어지고 있습니다"
            ])
        elif topic == "머신러닝":
            premises.extend([
                "머신러닝은 데이터로부터 패턴을 학습하는 기술입니다",
                "머신러닝은 인공지능의 핵심 구성요소입니다",
                "머신러닝은 다양한 알고리즘을 통해 구현됩니다"
            ])
        else:
            premises.extend([
                f"{topic}에 대한 기본적인 정의와 개념이 존재합니다",
                f"{topic}는 중요한 연구 및 실용적 가치를 가지고 있습니다",
                f"{topic}에 대한 다양한 관점과 접근법이 있습니다"
            ])
        
        return premises
    
    def _generate_evidence(self, message: str, topic: str) -> List[str]:
        """증거 생성"""
        evidence = []
        
        if topic == "인공지능":
            evidence.extend([
                "최근 연구에 따르면 AI 기술이 급속도로 발전하고 있습니다",
                "실제 산업 현장에서 AI가 다양한 문제를 해결하고 있습니다",
                "전문가들은 AI의 미래 발전 가능성을 높이 평가하고 있습니다"
            ])
        elif topic == "머신러닝":
            evidence.extend([
                "ML 알고리즘의 성능이 지속적으로 향상되고 있습니다",
                "대량의 데이터 처리 능력이 ML 발전을 이끌고 있습니다",
                "실제 응용 사례에서 ML의 효과가 입증되고 있습니다"
            ])
        else:
            evidence.extend([
                f"{topic}에 대한 객관적 데이터와 연구 결과가 존재합니다",
                f"{topic}의 실제 적용 사례와 성공 사례가 있습니다",
                f"{topic}에 대한 전문가들의 의견과 평가가 있습니다"
            ])
        
        return evidence
    
    def _generate_reasoning(self, message: str, framework: str) -> str:
        """추론 과정 생성"""
        reasoning_templates = {
            "deductive": "일반적인 원리에서 특수한 경우로의 논리적 추론을 통해",
            "inductive": "특수한 사례들에서 일반적인 원리로의 패턴 인식을 통해",
            "abductive": "관찰된 현상에 대한 최선의 설명을 찾는 과정을 통해",
            "dialectical": "대립되는 관점들을 종합하여 새로운 통찰을 얻는 과정을 통해",
            "analogical": "유사한 사례와의 비교를 통한 유추적 추론을 통해"
        }
        
        return reasoning_templates.get(framework, "논리적 추론을 통해")
    
    def _generate_conclusion(self, message: str, topic: str) -> str:
        """결론 생성"""
        if "차이점" in message:
            return f"{topic}에 대한 체계적 분석을 통해 명확한 차이점과 특징을 도출할 수 있습니다"
        elif "장단점" in message:
            return f"{topic}의 객관적 장단점 분석을 통해 균형잡힌 평가를 제공할 수 있습니다"
        else:
            return f"{topic}에 대한 종합적 분석을 통해 신뢰할 수 있는 결론에 도달할 수 있습니다"
    
    def _generate_counter_arguments(self, message: str, topic: str) -> List[str]:
        """반박 논리 생성"""
        counter_args = [
            f"{topic}에 대한 다른 관점이나 반대 의견이 존재할 수 있습니다",
            f"{topic}의 한계점이나 문제점에 대한 지적이 있을 수 있습니다",
            f"{topic}에 대한 대안적 접근법이나 해석이 가능합니다"
        ]
        return counter_args
    
    def _apply_rhetorical_devices(self, argument_structure: Dict, rhetorical_strategy: Dict) -> str:
        """수사학적 기법 적용"""
        
        response = f"""## 🧠 고급 논리적 설득 및 분석

**귀하의 질문**: "{argument_structure['topic']}에 대한 논쟁"

### 📊 논증 프레임워크: {argument_structure['framework_info']['description']}
{argument_structure['framework_info']['structure']}

### 🔍 논리적 전제
{chr(10).join(f"• {premise}" for premise in argument_structure['premises'])}

### 📈 객관적 증거
{chr(10).join(f"• {evidence}" for evidence in argument_structure['evidence'])}

### 🧩 추론 과정
{argument_structure['reasoning']} 논리적 결론에 도달합니다.

### 🎯 핵심 결론
{argument_structure['conclusion']}

### 🛡️ 반박 논리 고려
{chr(10).join(f"• {counter}" for counter in argument_structure['counter_arguments'])}"""
        
        return response
    
    def _add_psychological_elements(self, response: str, psychological_strategy: Dict) -> str:
        """심리학적 요소 추가"""
        approach = psychological_strategy["approach"]
        principles = psychological_strategy["principles"]
        techniques = psychological_strategy["techniques"]
        
        psychological_section = f"""

### 🧠 심리학적 설득 전략
**접근 방식**: {approach}
**설득 원칙**: {', '.join(principles)}
**기법**: {', '.join(techniques)}

#### 💡 설득 효과 극대화
- **신뢰성 구축**: 전문성과 객관성을 통한 신뢰 형성
- **감정적 연결**: 공감과 이해를 통한 심리적 연결
- **논리적 설득**: 체계적이고 명확한 논증을 통한 설득
- **사회적 증명**: 다른 사람들의 성공 사례를 통한 설득"""
        
        return response + psychological_section
    
    def _combine_advanced_response(self, message: str, response: str, analysis: Dict) -> str:
        """고급 응답 조합"""
        final_response = response + f"""

### 🎯 종합적 설득 전략
**전체 설득 가능성**: {analysis['overall_potential']:.2f}
**논리적 복잡도**: {analysis['logical_complexity']['level']}
**심리학적 저항**: {'높음' if analysis['psychological_resistance']['overall_resistance'] > 0.5 else '낮음'}

### 💡 핵심 메시지
논리적 근거, 수사학적 기법, 심리학적 설득을 통합한 고도화된 설득 전략을 제공합니다.
귀하의 질문에 대해 체계적이고 효과적인 답변을 통해 논쟁의 기반을 마련합니다.

---
*고도화된 논리적 설득 시스템이 제공하는 종합적 분석입니다*"""
        
        return final_response
    
    def _update_advanced_context(self, user_id: str, message: str, analysis: Dict):
        """고급 맥락 업데이트"""
        if user_id not in self.persuasion_contexts:
            self.persuasion_contexts[user_id] = AdvancedPersuasionContext(user_id=user_id)
        
        context = self.persuasion_contexts[user_id]
        
        # 대화 기록 추가
        context.conversation_history.append({
            "message": message,
            "analysis": analysis,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # 설득 효과성 업데이트
        framework = analysis["optimal_framework"]
        if framework not in context.persuasion_effectiveness:
            context.persuasion_effectiveness[framework] = 0.0
        context.persuasion_effectiveness[framework] += 0.1
        
        # 저항 패턴 업데이트
        resistance_levels = analysis["psychological_resistance"]["resistance_levels"]
        context.resistance_patterns.extend(resistance_levels)
        
        # 최근 10개 대화만 유지
        if len(context.conversation_history) > 10:
            context.conversation_history = context.conversation_history[-10:]

# 전역 엔진 인스턴스
advanced_engine = AdvancedLogicalPersuasionEngine()


class ChatMessage(BaseModel):
    message: str
    user_id: str = "default"
    context: Optional[dict] = None


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Advanced Logical Persuasion System",
        "version": "5.0.0",
        "status": "running",
        "features": [
            "고급 논리학 및 수사학 기법",
            "심리학적 설득 전략",
            "다층적 논증 구조",
            "반박 및 재반박 시스템",
            "감정-논리 통합 설득",
            "적응적 설득 전략"
        ]
    }


@app.post("/api/chat")
async def advanced_logical_chat_endpoint(chat_data: ChatMessage):
    """고급 논리적 채팅 API"""
    try:
        logger.info(f"고급 논리적 채팅 요청: {chat_data.message[:50]}...")
        
        # 1단계: 고급 설득 가능성 분석
        analysis = await advanced_engine.analyze_advanced_persuasion_potential(
            chat_data.message, chat_data.user_id
        )
        logger.info(f"고급 설득 분석 완료: 프레임워크={analysis['optimal_framework']}")
        
        # 2단계: 고급 논리적 응답 생성
        response = await advanced_engine.generate_advanced_logical_response(
            chat_data.message, analysis, chat_data.user_id
        )
        
        result = {
            "success": True,
            "response": response,
            "advanced_analysis": {
                "logical_complexity": analysis["logical_complexity"],
                "rhetorical_opportunities": analysis["rhetorical_opportunities"],
                "psychological_resistance": analysis["psychological_resistance"],
                "optimal_framework": analysis["optimal_framework"],
                "rhetorical_strategy": analysis["rhetorical_strategy"],
                "psychological_strategy": analysis["psychological_strategy"],
                "overall_potential": analysis["overall_potential"]
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        logger.info(f"고급 논리적 답변 생성 완료: {len(response)}자")
        return result
        
    except Exception as e:
        logger.error(f"고급 논리적 채팅 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/advanced-context/{user_id}")
async def get_advanced_context(user_id: str):
    """고급 설득 맥락 조회"""
    try:
        context = advanced_engine.persuasion_contexts.get(user_id)
        if not context:
            return {"message": "고급 설득 기록이 없습니다"}
        
        return {
            "user_id": user_id,
            "conversation_count": len(context.conversation_history),
            "logical_preferences": context.logical_preferences,
            "persuasion_effectiveness": context.persuasion_effectiveness,
            "resistance_patterns": context.resistance_patterns,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"고급 설득 맥락 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/status")
async def get_advanced_status():
    """고급 논리적 설득 시스템 상태 확인"""
    return {
        "status": "healthy",
        "active_sessions": len(advanced_engine.persuasion_contexts),
        "logical_frameworks": len(advanced_engine.logical_frameworks),
        "rhetorical_strategies": len(advanced_engine.rhetorical_strategies),
        "psychological_patterns": len(advanced_engine.psychological_patterns),
        "message": "고도화된 논리적 설득 시스템이 정상적으로 작동하고 있습니다"
    }

if __name__ == "__main__":
    logger.info("🚀 Advanced Logical Persuasion System을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
