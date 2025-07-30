import json
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import re
import random
import hashlib
from collections import defaultdict, Counter
from enum import Enum


class MessageComplexity(Enum):
    """메시지 복잡도 레벨"""
    SIMPLE = "simple"          # 간단한 안내
    MODERATE = "moderate"      # 표준 보고서
    COMPLEX = "complex"        # 복합 분석
    ADVANCED = "advanced"      # 고급 전략 문서


class CognitiveBias(Enum):
    """인지 편향 고려 요소"""
    ANCHORING = "anchoring"              # 닻 내림 편향
    CONFIRMATION = "confirmation"        # 확증 편향
    AVAILABILITY = "availability"        # 가용성 편향
    LOSS_AVERSION = "loss_aversion"     # 손실 회피
    FRAMING = "framing"                 # 프레이밍 효과


@dataclass
class NeuralPattern:
    """신경망 패턴 구조"""
    pattern_id: str
    pattern_type: str
    activation_weight: float
    context_triggers: List[str]
    output_template: str
    effectiveness_score: float
    usage_frequency: int
    last_updated: datetime


@dataclass
class SemanticStructure:
    """의미 구조 분석"""
    main_concept: str
    supporting_concepts: List[str]
    logical_connections: Dict[str, List[str]]
    emotional_undertones: Dict[str, float]
    persuasive_elements: List[str]
    credibility_markers: List[str]


@dataclass
class MessageDNA:
    """메시지 DNA 구조"""
    core_message: str
    logical_backbone: List[str]
    emotional_layer: Dict[str, float]
    persuasive_framework: str
    credibility_foundation: List[str]
    adaptation_genes: Dict[str, Any]
    effectiveness_predictors: Dict[str, float]


class NeuralMessageGenerator:
    """신경망 기반 메시지 생성기"""
    
    def __init__(self):
        self.neural_patterns = self._initialize_neural_patterns()
        self.semantic_networks = self._build_semantic_networks()
        self.cognitive_models = self._initialize_cognitive_models()
        self.effectiveness_predictor = self._initialize_effectiveness_predictor()
        self.learning_memory = defaultdict(list)
        self.pattern_evolution = {}
        
    def _initialize_neural_patterns(self) -> Dict[str, List[NeuralPattern]]:
        """신경망 패턴 초기화"""
        patterns = {
            "executive_decision": [
                NeuralPattern(
                    pattern_id="exec_001",
                    pattern_type="결론_우선_논리",
                    activation_weight=0.9,
                    context_triggers=["임원", "의사결정", "긴급"],
                    output_template="결론적으로 {conclusion}입니다. 이는 {primary_evidence}에 기반하며, {supporting_logic}를 통해 도출되었습니다.",
                    effectiveness_score=0.85,
                    usage_frequency=0,
                    last_updated=datetime.now()
                ),
                NeuralPattern(
                    pattern_id="exec_002",
                    pattern_type="리스크_최우선",
                    activation_weight=0.8,
                    context_triggers=["위험", "손실", "보수적"],
                    output_template="신중한 검토 결과, {risk_assessment}를 고려할 때 {recommendation}이 최적의 선택입니다.",
                    effectiveness_score=0.82,
                    usage_frequency=0,
                    last_updated=datetime.now()
                )
            ],
            "technical_analysis": [
                NeuralPattern(
                    pattern_id="tech_001",
                    pattern_type="데이터_중심_분석",
                    activation_weight=0.85,
                    context_triggers=["기술", "분석", "데이터"],
                    output_template="데이터 분석 결과 {key_metrics}에서 {findings}가 확인되었습니다. 기술적 관점에서 {technical_conclusion}입니다.",
                    effectiveness_score=0.88,
                    usage_frequency=0,
                    last_updated=datetime.now()
                ),
                NeuralPattern(
                    pattern_id="tech_002",
                    pattern_type="단계별_검증",
                    activation_weight=0.82,
                    context_triggers=["검증", "단계", "프로세스"],
                    output_template="단계별 검증을 통해 {step1} → {step2} → {step3} 순으로 {verification_result}를 확인했습니다.",
                    effectiveness_score=0.86,
                    usage_frequency=0,
                    last_updated=datetime.now()
                )
            ],
            "collaborative_discussion": [
                NeuralPattern(
                    pattern_id="collab_001",
                    pattern_type="합의_형성_중심",
                    activation_weight=0.75,
                    context_triggers=["협의", "합의", "상의"],
                    output_template="다각도 검토를 통해 {stakeholder_views}를 종합한 결과, {consensus_direction}에 대한 합의가 가능할 것으로 판단됩니다.",
                    effectiveness_score=0.78,
                    usage_frequency=0,
                    last_updated=datetime.now()
                )
            ]
        }
        return patterns
    
    def _build_semantic_networks(self) -> Dict[str, Dict]:
        """의미 네트워크 구축"""
        return {
            "construction_domain": {
                "core_concepts": {
                    "시공사": {
                        "related_terms": ["건설회사", "시공업체", "건설업체", "계약업체"],
                        "attributes": ["기술력", "실적", "재무안정성", "신뢰도"],
                        "evaluations": ["우수", "양호", "보통", "미흡"],
                        "semantic_weight": 1.0
                    },
                    "품질": {
                        "related_terms": ["품질관리", "품질보증", "품질수준", "시공품질"],
                        "attributes": ["정밀도", "내구성", "안전성", "완성도"],
                        "evaluations": ["최상급", "상급", "표준", "개선필요"],
                        "semantic_weight": 0.9
                    },
                    "비용": {
                        "related_terms": ["공사비", "건설비", "투자비", "사업비"],
                        "attributes": ["경제성", "효율성", "적정성", "투명성"],
                        "evaluations": ["최적", "합리적", "적정", "과다"],
                        "semantic_weight": 0.85
                    }
                },
                "relationship_matrices": {
                    "positive_correlations": [
                        ("기술력", "품질", 0.8),
                        ("실적", "신뢰도", 0.75),
                        ("재무안정성", "프로젝트_완성도", 0.7)
                    ],
                    "trade_offs": [
                        ("비용", "품질", -0.3),
                        ("속도", "정밀도", -0.4),
                        ("규모", "유연성", -0.2)
                    ]
                }
            },
            "persuasion_networks": {
                "credibility_builders": [
                    "객관적 데이터 기반",
                    "다년간의 검증된 실적",
                    "업계 전문가 인정",
                    "국제 표준 준수",
                    "투명한 프로세스"
                ],
                "logic_reinforcers": [
                    "단계별 검증 과정",
                    "다각도 비교 분석",
                    "리스크 요인 고려",
                    "장기적 관점 적용",
                    "이해관계자 의견 반영"
                ],
                "emotional_connectors": [
                    "안전과 안심",
                    "미래 가치 창조",
                    "공동체 이익",
                    "지속가능한 발전",
                    "신뢰할 수 있는 파트너십"
                ]
            }
        }
    
    def _initialize_cognitive_models(self) -> Dict[str, Dict]:
        """인지 모델 초기화"""
        return {
            "decision_psychology": {
                "loss_aversion_multiplier": 2.5,  # 손실이 이득보다 2.5배 강하게 인식
                "anchoring_influence": 0.7,       # 첫 정보의 영향력
                "confirmation_seeking": 0.6,      # 기존 믿음 확증 경향
                "availability_bias": 0.5          # 쉽게 기억나는 정보 선호
            },
            "attention_patterns": {
                "primacy_effect": 0.8,      # 첫 부분 강한 기억
                "recency_effect": 0.6,      # 마지막 부분 기억
                "peak_moment_focus": 0.9,   # 강렬한 순간 집중
                "cognitive_load_limit": 7   # 동시 처리 정보 한계
            },
            "trust_mechanisms": {
                "expertise_signals": ["전문용어", "상세데이터", "기술설명"],
                "authority_indicators": ["공식기관", "인증", "표준준수"],
                "social_proof": ["타사례", "업계동향", "전문가의견"],
                "consistency_markers": ["논리일관성", "패턴유지", "예측가능성"]
            }
        }
    
    def _initialize_effectiveness_predictor(self) -> Dict[str, Any]:
        """효과성 예측기 초기화"""
        return {
            "readability_factors": {
                "sentence_length_optimal": (15, 25),    # 최적 문장 길이
                "paragraph_length_optimal": (3, 5),     # 최적 문단 길이
                "technical_term_ratio": (0.1, 0.3),     # 전문용어 비율
                "passive_voice_limit": 0.2              # 수동태 사용 한계
            },
            "persuasion_factors": {
                "evidence_to_claim_ratio": 2.0,         # 근거:주장 비율
                "emotional_balance": (0.2, 0.4),        # 감정적 요소 균형
                "credibility_signals_min": 3,           # 최소 신뢰성 신호
                "call_to_action_clarity": 0.8           # 행동 요구 명확성
            },
            "cognitive_load_factors": {
                "information_density": 0.7,             # 정보 밀도
                "concept_introduction_rate": 3,         # 새 개념 도입 속도
                "transition_smoothness": 0.8,           # 전환 부드러움
                "mental_model_consistency": 0.9         # 멘탈 모델 일관성
            }
        }
    
    def generate_neural_message(
        self,
        core_data: Dict[str, Any],
        target_profile: Dict[str, Any],
        context_analysis: Dict[str, Any],
        complexity_level: MessageComplexity = MessageComplexity.MODERATE
    ) -> Dict[str, Any]:
        """신경망 기반 메시지 생성"""
        
        # 1. 메시지 DNA 생성
        message_dna = self._generate_message_dna(core_data, target_profile, context_analysis)
        
        # 2. 최적 패턴 선택
        optimal_patterns = self._select_optimal_patterns(message_dna, target_profile)
        
        # 3. 의미 구조 설계
        semantic_structure = self._design_semantic_structure(message_dna, optimal_patterns)
        
        # 4. 인지 편향 고려 적용
        cognitive_adjustments = self._apply_cognitive_bias_considerations(
            semantic_structure, target_profile
        )
        
        # 5. 신경망 기반 콘텐츠 생성
        generated_content = self._generate_neural_content(
            semantic_structure, cognitive_adjustments, complexity_level
        )
        
        # 6. 효과성 예측 및 최적화
        optimized_content = self._predict_and_optimize_effectiveness(
            generated_content, target_profile
        )
        
        # 7. 자기 학습 및 패턴 업데이트
        self._update_learning_memory(optimized_content, target_profile)
        
        return {
            "neural_message": optimized_content,
            "message_dna": asdict(message_dna),
            "semantic_structure": asdict(semantic_structure),
            "cognitive_adjustments": cognitive_adjustments,
            "effectiveness_prediction": self._calculate_effectiveness_score(optimized_content),
            "pattern_activations": [p.pattern_id for p in optimal_patterns],
            "generation_metadata": {
                "complexity_level": complexity_level.value,
                "neural_confidence": self._calculate_neural_confidence(optimized_content),
                "cognitive_load_estimate": self._estimate_cognitive_load(optimized_content),
                "persuasion_potential": self._assess_persuasion_potential(optimized_content)
            }
        }
    
    def _generate_message_dna(
        self,
        core_data: Dict[str, Any],
        target_profile: Dict[str, Any],
        context_analysis: Dict[str, Any]
    ) -> MessageDNA:
        """메시지 DNA 생성"""
        
        # 핵심 메시지 추출
        core_message = self._extract_core_message(core_data)
        
        # 논리적 백본 구성
        logical_backbone = self._construct_logical_backbone(core_data, context_analysis)
        
        # 감정적 레이어 설계
        emotional_layer = self._design_emotional_layer(target_profile, context_analysis)
        
        # 설득 프레임워크 선택
        persuasive_framework = self._select_persuasive_framework(target_profile)
        
        # 신뢰성 기반 구축
        credibility_foundation = self._build_credibility_foundation(core_data)
        
        # 적응 유전자 설정
        adaptation_genes = self._configure_adaptation_genes(target_profile, context_analysis)
        
        # 효과성 예측인자 계산
        effectiveness_predictors = self._calculate_effectiveness_predictors(
            core_data, target_profile, context_analysis
        )
        
        return MessageDNA(
            core_message=core_message,
            logical_backbone=logical_backbone,
            emotional_layer=emotional_layer,
            persuasive_framework=persuasive_framework,
            credibility_foundation=credibility_foundation,
            adaptation_genes=adaptation_genes,
            effectiveness_predictors=effectiveness_predictors
        )
    
    def _extract_core_message(self, core_data: Dict[str, Any]) -> str:
        """핵심 메시지 추출"""
        if "recommended_company" in core_data:
            company = core_data["recommended_company"]
            reason = core_data.get("primary_reason", "종합적 우수성")
            return f"{company}이 {reason} 측면에서 최적의 선택입니다"
        elif "comparison_results" in core_data:
            companies = list(core_data["comparison_results"].keys())
            return f"{len(companies)}개 시공사에 대한 종합 분석을 완료했습니다"
        else:
            return "시공사 선정을 위한 체계적 분석이 필요합니다"
    
    def _construct_logical_backbone(
        self,
        core_data: Dict[str, Any],
        context_analysis: Dict[str, Any]
    ) -> List[str]:
        """논리적 백본 구성"""
        backbone = []
        
        # 상황 분석
        backbone.append("현재 상황에 대한 객관적 분석")
        
        # 데이터 기반 평가
        if "comparison_results" in core_data:
            backbone.append("정량적 데이터에 기반한 체계적 평가")
        
        # 리스크 고려
        backbone.append("잠재적 리스크 요인에 대한 종합적 검토")
        
        # 이해관계자 고려
        if context_analysis.get("stakeholder_complexity", 0) > 0.5:
            backbone.append("다양한 이해관계자 관점의 균형적 고려")
        
        # 최적화 결론
        backbone.append("장기적 관점에서의 최적화된 의사결정")
        
        return backbone
    
    def _design_emotional_layer(
        self,
        target_profile: Dict[str, Any],
        context_analysis: Dict[str, Any]
    ) -> Dict[str, float]:
        """감정적 레이어 설계"""
        emotional_layer = {
            "confidence": 0.7,      # 확신
            "urgency": 0.5,         # 긴급감
            "security": 0.8,        # 안전감
            "optimism": 0.6,        # 낙관
            "concern": 0.3,         # 우려
            "trust": 0.8            # 신뢰
        }
        
        # 타겟 프로필에 따른 조정
        if target_profile.get("risk_tolerance") == "conservative":
            emotional_layer["security"] += 0.1
            emotional_layer["concern"] += 0.2
        elif target_profile.get("risk_tolerance") == "aggressive":
            emotional_layer["confidence"] += 0.1
            emotional_layer["optimism"] += 0.1
        
        # 컨텍스트에 따른 조정
        if context_analysis.get("timeline_pressure", 0) > 0.7:
            emotional_layer["urgency"] += 0.3
        
        return emotional_layer
    
    def _select_persuasive_framework(self, target_profile: Dict[str, Any]) -> str:
        """설득 프레임워크 선택"""
        if target_profile.get("decision_style") == "analytical":
            return "evidence_based_logical"
        elif target_profile.get("decision_style") == "intuitive":
            return "narrative_emotional"
        elif target_profile.get("authority_level") == "high":
            return "strategic_impact"
        else:
            return "balanced_comprehensive"
    
    def _build_credibility_foundation(self, core_data: Dict[str, Any]) -> List[str]:
        """신뢰성 기반 구축"""
        foundation = []
        
        if "comparison_results" in core_data:
            foundation.append("객관적 비교 데이터 기반")
        
        if "historical_performance" in core_data:
            foundation.append("과거 실적 검증")
        
        foundation.extend([
            "업계 표준 평가 기준 적용",
            "다각도 검증 프로세스 수행",
            "전문가 의견 종합 반영"
        ])
        
        return foundation
    
    def _configure_adaptation_genes(
        self,
        target_profile: Dict[str, Any],
        context_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """적응 유전자 설정"""
        return {
            "formality_adaptation": target_profile.get("formality_preference", 0.6),
            "detail_adaptation": target_profile.get("detail_preference", 0.5),
            "urgency_adaptation": context_analysis.get("timeline_pressure", 0.3),
            "complexity_adaptation": context_analysis.get("technical_complexity", 0.5),
            "stakeholder_adaptation": context_analysis.get("stakeholder_complexity", 0.4),
            "risk_adaptation": target_profile.get("risk_sensitivity", 0.5)
        }
    
    def _calculate_effectiveness_predictors(
        self,
        core_data: Dict[str, Any],
        target_profile: Dict[str, Any],
        context_analysis: Dict[str, Any]
    ) -> Dict[str, float]:
        """효과성 예측인자 계산"""
        return {
            "data_completeness": min(len(core_data) / 10, 1.0),
            "audience_alignment": self._calculate_audience_alignment(target_profile),
            "context_relevance": self._calculate_context_relevance(context_analysis),
            "logical_coherence": 0.85,  # 기본값
            "emotional_resonance": self._calculate_emotional_resonance(target_profile),
            "action_clarity": 0.8       # 기본값
        }
    
    def _calculate_audience_alignment(self, target_profile: Dict[str, Any]) -> float:
        """청중 정렬도 계산"""
        alignment_factors = []
        
        if "communication_style" in target_profile:
            alignment_factors.append(0.8)
        if "expertise_level" in target_profile:
            alignment_factors.append(0.7)
        if "decision_authority" in target_profile:
            alignment_factors.append(0.6)
        
        return np.mean(alignment_factors) if alignment_factors else 0.5
    
    def _calculate_context_relevance(self, context_analysis: Dict[str, Any]) -> float:
        """컨텍스트 관련성 계산"""
        relevance_score = 0.5  # 기본값
        
        if context_analysis.get("project_scope"):
            relevance_score += 0.1
        if context_analysis.get("timeline_pressure", 0) > 0:
            relevance_score += 0.1
        if context_analysis.get("stakeholder_complexity", 0) > 0:
            relevance_score += 0.1
        
        return min(relevance_score, 1.0)
    
    def _calculate_emotional_resonance(self, target_profile: Dict[str, Any]) -> float:
        """감정적 공명 계산"""
        if target_profile.get("emotional_preference") == "high":
            return 0.8
        elif target_profile.get("emotional_preference") == "low":
            return 0.4
        else:
            return 0.6
    
    def _select_optimal_patterns(
        self,
        message_dna: MessageDNA,
        target_profile: Dict[str, Any]
    ) -> List[NeuralPattern]:
        """최적 패턴 선택"""
        selected_patterns = []
        
        # 타겟 프로필에 따른 패턴 카테고리 선택
        if target_profile.get("authority_level") == "high":
            pattern_category = "executive_decision"
        elif target_profile.get("expertise_level") == "technical":
            pattern_category = "technical_analysis"
        else:
            pattern_category = "collaborative_discussion"
        
        # 해당 카테고리의 패턴들 평가
        available_patterns = self.neural_patterns.get(pattern_category, [])
        
        for pattern in available_patterns:
            # 컨텍스트 트리거 매칭
            trigger_match = any(
                trigger in str(message_dna.adaptation_genes)
                for trigger in pattern.context_triggers
            )
            
            if trigger_match or pattern.effectiveness_score > 0.8:
                selected_patterns.append(pattern)
        
        # 패턴이 없으면 기본 패턴 사용
        if not selected_patterns and available_patterns:
            selected_patterns.append(available_patterns[0])
        
        return selected_patterns
    
    def _design_semantic_structure(
        self,
        message_dna: MessageDNA,
        optimal_patterns: List[NeuralPattern]
    ) -> SemanticStructure:
        """의미 구조 설계"""
        
        # 주요 개념 추출
        main_concept = self._extract_main_concept(message_dna.core_message)
        
        # 지원 개념들
        supporting_concepts = self._generate_supporting_concepts(message_dna)
        
        # 논리적 연결
        logical_connections = self._map_logical_connections(
            main_concept, supporting_concepts, message_dna.logical_backbone
        )
        
        # 감정적 언더톤
        emotional_undertones = message_dna.emotional_layer
        
        # 설득 요소
        persuasive_elements = self._extract_persuasive_elements(message_dna, optimal_patterns)
        
        # 신뢰성 마커
        credibility_markers = message_dna.credibility_foundation
        
        return SemanticStructure(
            main_concept=main_concept,
            supporting_concepts=supporting_concepts,
            logical_connections=logical_connections,
            emotional_undertones=emotional_undertones,
            persuasive_elements=persuasive_elements,
            credibility_markers=credibility_markers
        )
    
    def _extract_main_concept(self, core_message: str) -> str:
        """주요 개념 추출"""
        # 핵심 키워드 추출
        if "최적의 선택" in core_message:
            return "최적 선택"
        elif "종합 분석" in core_message:
            return "종합 분석"
        elif "체계적 분석" in core_message:
            return "체계적 분석"
        else:
            return "시공사 평가"
    
    def _generate_supporting_concepts(self, message_dna: MessageDNA) -> List[str]:
        """지원 개념 생성"""
        concepts = []
        
        # 논리적 백본에서 개념 추출
        for backbone_item in message_dna.logical_backbone:
            if "분석" in backbone_item:
                concepts.append("객관적 분석")
            elif "평가" in backbone_item:
                concepts.append("체계적 평가")
            elif "리스크" in backbone_item:
                concepts.append("리스크 관리")
            elif "이해관계자" in backbone_item:
                concepts.append("이해관계자 고려")
        
        # 신뢰성 기반에서 개념 추출
        for foundation_item in message_dna.credibility_foundation:
            if "데이터" in foundation_item:
                concepts.append("데이터 기반")
            elif "검증" in foundation_item:
                concepts.append("검증 프로세스")
        
        return list(set(concepts))  # 중복 제거
    
    def _map_logical_connections(
        self,
        main_concept: str,
        supporting_concepts: List[str],
        logical_backbone: List[str]
    ) -> Dict[str, List[str]]:
        """논리적 연결 매핑"""
        connections = {}
        
        # 주요 개념과 지원 개념들 연결
        connections[main_concept] = supporting_concepts[:3]  # 최대 3개
        
        # 지원 개념들 간의 연결
        for i, concept in enumerate(supporting_concepts):
            related_concepts = []
            for j, other_concept in enumerate(supporting_concepts):
                if i != j and len(related_concepts) < 2:
                    related_concepts.append(other_concept)
            connections[concept] = related_concepts
        
        return connections
    
    def _extract_persuasive_elements(
        self,
        message_dna: MessageDNA,
        optimal_patterns: List[NeuralPattern]
    ) -> List[str]:
        """설득 요소 추출"""
        elements = []
        
        # 설득 프레임워크에 따른 요소 선택
        framework = message_dna.persuasive_framework
        
        if framework == "evidence_based_logical":
            elements.extend([
                "객관적 데이터 제시",
                "논리적 추론 과정",
                "근거 기반 결론"
            ])
        elif framework == "narrative_emotional":
            elements.extend([
                "스토리텔링 접근",
                "감정적 연결",
                "공감대 형성"
            ])
        elif framework == "strategic_impact":
            elements.extend([
                "전략적 함의",
                "장기적 영향",
                "비즈니스 임팩트"
            ])
        else:  # balanced_comprehensive
            elements.extend([
                "다각도 검토",
                "균형적 시각",
                "종합적 판단"
            ])
        
        return elements
    
    def _apply_cognitive_bias_considerations(
        self,
        semantic_structure: SemanticStructure,
        target_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """인지 편향 고려 적용"""
        adjustments = {}
        
        # 손실 회피 편향 고려
        if target_profile.get("risk_aversion", 0.5) > 0.6:
            adjustments["loss_aversion"] = {
                "emphasize_risk_mitigation": True,
                "highlight_safety_factors": True,
                "minimize_uncertainty_language": True
            }
        
        # 확증 편향 고려
        if target_profile.get("confirmation_tendency", 0.5) > 0.6:
            adjustments["confirmation_bias"] = {
                "align_with_existing_beliefs": True,
                "gradual_perspective_shift": True,
                "supportive_evidence_first": True
            }
        
        # 가용성 편향 고려
        adjustments["availability_bias"] = {
            "use_memorable_examples": True,
            "concrete_scenarios": True,
            "vivid_descriptions": True
        }
        
        # 닻 내림 편향 고려
        adjustments["anchoring_bias"] = {
            "strategic_first_impression": True,
            "reference_point_setting": True,
            "comparative_framing": True
        }
        
        return adjustments
    
    def _generate_neural_content(
        self,
        semantic_structure: SemanticStructure,
        cognitive_adjustments: Dict[str, Any],
        complexity_level: MessageComplexity
    ) -> Dict[str, str]:
        """신경망 기반 콘텐츠 생성"""
        
        # 복잡도에 따른 구조 설정
        if complexity_level == MessageComplexity.SIMPLE:
            sections = ["introduction", "main_point", "conclusion"]
        elif complexity_level == MessageComplexity.MODERATE:
            sections = ["introduction", "analysis", "recommendation", "conclusion"]
        elif complexity_level == MessageComplexity.COMPLEX:
            sections = ["executive_summary", "background", "analysis", "comparison", "recommendation", "next_steps"]
        else:  # ADVANCED
            sections = ["executive_summary", "situational_analysis", "methodology", "findings", "strategic_implications", "recommendations", "implementation_plan", "risk_assessment"]
        
        content = {}
        
        for section in sections:
            content[section] = self._generate_section_content(
                section, semantic_structure, cognitive_adjustments, complexity_level
            )
        
        # 전체 메시지 조합
        content["full_message"] = self._compose_full_message(content, sections)
        
        return content
    
    def _generate_section_content(
        self,
        section: str,
        semantic_structure: SemanticStructure,
        cognitive_adjustments: Dict[str, Any],
        complexity_level: MessageComplexity
    ) -> str:
        """섹션별 콘텐츠 생성"""
        
        if section == "introduction":
            return self._generate_introduction(semantic_structure, cognitive_adjustments)
        elif section == "analysis":
            return self._generate_analysis(semantic_structure, complexity_level)
        elif section == "recommendation":
            return self._generate_recommendation(semantic_structure, cognitive_adjustments)
        elif section == "conclusion":
            return self._generate_conclusion(semantic_structure)
        elif section == "executive_summary":
            return self._generate_executive_summary(semantic_structure)
        elif section == "main_point":
            return self._generate_main_point(semantic_structure)
        else:
            return self._generate_generic_section(section, semantic_structure)
    
    def _generate_introduction(
        self,
        semantic_structure: SemanticStructure,
        cognitive_adjustments: Dict[str, Any]
    ) -> str:
        """도입부 생성"""
        
        # 닻 내림 효과 활용
        if cognitive_adjustments.get("anchoring_bias", {}).get("strategic_first_impression"):
            anchor_phrase = "종합적인 분석을 통해 확인된 핵심 사실은"
        else:
            anchor_phrase = "검토 결과를 말씀드리면"
        
        main_concept = semantic_structure.main_concept
        credibility_marker = semantic_structure.credibility_markers[0] if semantic_structure.credibility_markers else "전문적 분석"
        
        return f"{anchor_phrase}, {credibility_marker}에 기반하여 {main_concept}에 대한 명확한 방향을 제시하고자 합니다."
    
    def _generate_analysis(
        self,
        semantic_structure: SemanticStructure,
        complexity_level: MessageComplexity
    ) -> str:
        """분석 섹션 생성"""
        
        analysis_parts = []
        
        # 지원 개념들을 기반으로 분석 내용 구성
        for i, concept in enumerate(semantic_structure.supporting_concepts[:3], 1):
            if complexity_level in [MessageComplexity.SIMPLE, MessageComplexity.MODERATE]:
                analysis_parts.append(f"{i}. {concept}을 통한 검증")
            else:
                analysis_parts.append(f"{i}. {concept}: 상세한 데이터 분석과 다각도 검토를 통해 객관적 근거를 확보했습니다.")
        
        # 논리적 연결 표현
        if semantic_structure.logical_connections:
            main_concept = semantic_structure.main_concept
            connected_concepts = semantic_structure.logical_connections.get(main_concept, [])
            if connected_concepts:
                analysis_parts.append(f"이러한 요소들은 {', '.join(connected_concepts)}과 밀접한 관련성을 보이며, 종합적 판단의 근거가 됩니다.")
        
        return "\n\n".join(analysis_parts)
    
    def _generate_recommendation(
        self,
        semantic_structure: SemanticStructure,
        cognitive_adjustments: Dict[str, Any]
    ) -> str:
        """권고사항 생성"""
        
        # 손실 회피 편향 고려
        if cognitive_adjustments.get("loss_aversion", {}).get("emphasize_risk_mitigation"):
            risk_phrase = "리스크를 최소화하고 안정성을 확보하기 위해"
        else:
            risk_phrase = "최적의 결과를 위해"
        
        # 설득 요소 활용
        persuasive_elements = semantic_structure.persuasive_elements
        if persuasive_elements:
            persuasion_phrase = f"{persuasive_elements[0]}를 바탕으로"
        else:
            persuasion_phrase = "종합적 검토를 통해"
        
        main_concept = semantic_structure.main_concept
        
        return f"{persuasion_phrase}, {risk_phrase} {main_concept}를 권고드립니다. 이는 장기적 관점에서 가장 합리적인 선택이 될 것입니다."
    
    def _generate_conclusion(self, semantic_structure: SemanticStructure) -> str:
        """결론 생성"""
        main_concept = semantic_structure.main_concept
        credibility_markers = semantic_structure.credibility_markers
        
        if credibility_markers:
            credibility_phrase = f"{credibility_markers[0]}과 {credibility_markers[1] if len(credibility_markers) > 1 else '전문적 검토'}"
        else:
            credibility_phrase = "객관적 분석과 전문적 검토"
        
        return f"결론적으로, {credibility_phrase}를 통해 도출된 {main_concept}는 현재 상황에서 최선의 방향입니다. 신속한 의사결정과 실행을 통해 기대 효과를 실현할 수 있을 것입니다."
    
    def _generate_executive_summary(self, semantic_structure: SemanticStructure) -> str:
        """임원 요약 생성"""
        main_concept = semantic_structure.main_concept
        key_supporting = semantic_structure.supporting_concepts[0] if semantic_structure.supporting_concepts else "종합 평가"
        
        return f"【핵심 요약】 {key_supporting}를 통한 {main_concept} 결과, 전략적 의사결정이 필요한 시점입니다."
    
    def _generate_main_point(self, semantic_structure: SemanticStructure) -> str:
        """핵심 포인트 생성"""
        main_concept = semantic_structure.main_concept
        return f"핵심적으로, {main_concept}가 가장 중요한 고려사항입니다."
    
    def _generate_generic_section(self, section: str, semantic_structure: SemanticStructure) -> str:
        """일반 섹션 생성"""
        main_concept = semantic_structure.main_concept
        return f"{section.replace('_', ' ').title()} 관점에서 {main_concept}에 대한 상세한 검토가 필요합니다."
    
    def _compose_full_message(self, content: Dict[str, str], sections: List[str]) -> str:
        """전체 메시지 조합"""
        message_parts = []
        
        for section in sections:
            if section in content:
                section_title = self._format_section_title(section)
                message_parts.append(f"{section_title}\n{content[section]}")
        
        return "\n\n".join(message_parts)
    
    def _format_section_title(self, section: str) -> str:
        """섹션 제목 포맷팅"""
        title_mapping = {
            "introduction": "□ 개요",
            "analysis": "□ 분석 결과",
            "recommendation": "□ 권고사항",
            "conclusion": "□ 결론",
            "executive_summary": "■ 임원 요약",
            "main_point": "● 핵심 포인트"
        }
        return title_mapping.get(section, f"□ {section.replace('_', ' ').title()}")
    
    def _predict_and_optimize_effectiveness(
        self,
        generated_content: Dict[str, str],
        target_profile: Dict[str, Any]
    ) -> Dict[str, str]:
        """효과성 예측 및 최적화"""
        
        optimized_content = generated_content.copy()
        full_message = generated_content.get("full_message", "")
        
        # 가독성 최적화
        optimized_content["full_message"] = self._optimize_readability(full_message)
        
        # 설득력 강화
        optimized_content["full_message"] = self._enhance_persuasiveness(
            optimized_content["full_message"], target_profile
        )
        
        # 인지 부하 감소
        optimized_content["full_message"] = self._reduce_cognitive_load(
            optimized_content["full_message"]
        )
        
        return optimized_content
    
    def _optimize_readability(self, message: str) -> str:
        """가독성 최적화"""
        
        # 긴 문장 분할
        sentences = message.split('. ')
        optimized_sentences = []
        
        for sentence in sentences:
            if len(sentence) > 50:
                # 접속사 기준으로 분할
                if ', ' in sentence:
                    parts = sentence.split(', ', 1)
                    optimized_sentences.append(parts[0] + '.')
                    optimized_sentences.append(parts[1])
                else:
                    optimized_sentences.append(sentence)
            else:
                optimized_sentences.append(sentence)
        
        return '. '.join(optimized_sentences)
    
    def _enhance_persuasiveness(self, message: str, target_profile: Dict[str, Any]) -> str:
        """설득력 강화"""
        
        # 타겟 프로필에 따른 설득 요소 강화
        if target_profile.get("decision_style") == "analytical":
            # 데이터와 논리 강조
            message = re.sub(
                r'(\d+%|\d+점)',
                r'**\1**',
                message
            )
        
        elif target_profile.get("emotional_preference") == "high":
            # 감정적 연결 강화
            message = message.replace(
                "권고드립니다",
                "확신을 가지고 권고드립니다"
            )
        
        return message
    
    def _reduce_cognitive_load(self, message: str) -> str:
        """인지 부하 감소"""
        
        # 중복 표현 제거
        message = re.sub(r'(\w+)\s+\1', r'\1', message)
        
        # 불필요한 수식어 제거
        redundant_phrases = ["매우", "정말로", "아주", "무척"]
        for phrase in redundant_phrases:
            message = message.replace(f"{phrase} ", "")
        
        # 명확한 구조 표시
        message = re.sub(
            r'^(\d+\.)',
            r'\n\1',
            message,
            flags=re.MULTILINE
        )
        
        return message
    
    def _calculate_effectiveness_score(self, content: Dict[str, str]) -> float:
        """효과성 점수 계산"""
        full_message = content.get("full_message", "")
        
        # 가독성 점수
        readability_score = self._calculate_readability_score(full_message)
        
        # 설득력 점수
        persuasion_score = self._calculate_persuasion_score(full_message)
        
        # 완성도 점수
        completeness_score = len(content) / 8  # 8개 섹션 기준
        
        # 가중 평균
        effectiveness = (
            0.4 * readability_score +
            0.4 * persuasion_score +
            0.2 * completeness_score
        )
        
        return min(effectiveness, 1.0)
    
    def _calculate_readability_score(self, message: str) -> float:
        """가독성 점수 계산"""
        sentences = message.split('.')
        avg_sentence_length = np.mean([len(s.split()) for s in sentences if s.strip()])
        
        # 최적 문장 길이 15-25 단어
        if 15 <= avg_sentence_length <= 25:
            length_score = 1.0
        elif avg_sentence_length < 15:
            length_score = 0.8
        else:
            length_score = max(0.3, 1.0 - (avg_sentence_length - 25) * 0.02)
        
        return length_score
    
    def _calculate_persuasion_score(self, message: str) -> float:
        """설득력 점수 계산"""
        persuasion_indicators = [
            "근거", "데이터", "분석", "검증", "확인",
            "최적", "효과적", "합리적", "신뢰할", "안전"
        ]
        
        indicator_count = sum(1 for indicator in persuasion_indicators if indicator in message)
        persuasion_score = min(indicator_count / 5, 1.0)  # 5개 이상이면 만점
        
        return persuasion_score
    
    def _calculate_neural_confidence(self, content: Dict[str, str]) -> float:
        """신경망 신뢰도 계산"""
        factors = []
        
        # 구조 완성도
        expected_sections = ["introduction", "analysis", "recommendation", "conclusion"]
        completion_rate = sum(1 for section in expected_sections if section in content) / len(expected_sections)
        factors.append(completion_rate)
        
        # 내용 품질
        full_message = content.get("full_message", "")
        if len(full_message) > 100:
            factors.append(0.8)
        else:
            factors.append(0.5)
        
        # 논리적 일관성 (간단한 키워드 기반 평가)
        consistency_keywords = ["따라서", "그러므로", "결론적으로", "이에 따라"]
        has_logical_flow = any(keyword in full_message for keyword in consistency_keywords)
        factors.append(0.9 if has_logical_flow else 0.6)
        
        return np.mean(factors)
    
    def _estimate_cognitive_load(self, content: Dict[str, str]) -> float:
        """인지 부하 추정"""
        full_message = content.get("full_message", "")
        
        # 단어 수
        word_count = len(full_message.split())
        
        # 복잡한 문장 수
        complex_sentences = len([s for s in full_message.split('.') if len(s.split()) > 20])
        
        # 전문 용어 수
        technical_terms = ["분석", "평가", "검토", "검증", "비교", "최적화"]
        tech_term_count = sum(1 for term in technical_terms if term in full_message)
        
        # 인지 부하 계산 (0-1, 낮을수록 좋음)
        load_factors = [
            word_count / 1000,  # 단어 수 기여도
            complex_sentences / 10,  # 복잡 문장 기여도
            tech_term_count / 20  # 전문 용어 기여도
        ]
        
        return min(np.mean(load_factors), 1.0)
    
    def _assess_persuasion_potential(self, content: Dict[str, str]) -> float:
        """설득 잠재력 평가"""
        full_message = content.get("full_message", "")
        
        # 설득 요소들
        credibility_signals = ["데이터", "분석", "검증", "전문가", "객관적"]
        logical_connectors = ["따라서", "그러므로", "결과적으로", "이에 따라"]
        emotional_appeals = ["안전", "신뢰", "최적", "효과적", "성공"]
        
        credibility_score = sum(1 for signal in credibility_signals if signal in full_message) / len(credibility_signals)
        logic_score = sum(1 for connector in logical_connectors if connector in full_message) / len(logical_connectors)
        emotion_score = sum(1 for appeal in emotional_appeals if appeal in full_message) / len(emotional_appeals)
        
        # 균형 잡힌 설득력 (모든 요소가 골고루 있어야 함)
        persuasion_balance = 1 - np.std([credibility_score, logic_score, emotion_score])
        
        return min((credibility_score + logic_score + emotion_score) / 3 * persuasion_balance, 1.0)
    
    def _update_learning_memory(self, content: Dict[str, str], target_profile: Dict[str, Any]):
        """학습 메모리 업데이트"""
        
        # 사용된 패턴과 효과성 기록
        effectiveness = self._calculate_effectiveness_score(content)
        
        # 프로필별 학습 데이터 축적
        profile_key = self._generate_profile_key(target_profile)
        
        self.learning_memory[profile_key].append({
            "timestamp": datetime.now(),
            "effectiveness_score": effectiveness,
            "content_length": len(content.get("full_message", "")),
            "complexity_indicators": self._extract_complexity_indicators(content),
            "target_profile": target_profile
        })
        
        # 메모리 크기 제한
        if len(self.learning_memory[profile_key]) > 100:
            self.learning_memory[profile_key] = self.learning_memory[profile_key][-100:]
    
    def _generate_profile_key(self, target_profile: Dict[str, Any]) -> str:
        """프로필 키 생성"""
        key_elements = [
            target_profile.get("authority_level", "medium"),
            target_profile.get("expertise_level", "general"),
            target_profile.get("decision_style", "balanced")
        ]
        return "_".join(key_elements)
    
    def _extract_complexity_indicators(self, content: Dict[str, str]) -> Dict[str, float]:
        """복잡도 지표 추출"""
        full_message = content.get("full_message", "")
        
        return {
            "word_count": len(full_message.split()),
            "sentence_count": len(full_message.split('.')),
            "technical_term_ratio": self._calculate_technical_term_ratio(full_message),
            "structure_complexity": len(content) - 1  # full_message 제외
        }
    
    def _calculate_technical_term_ratio(self, message: str) -> float:
        """전문 용어 비율 계산"""
        technical_terms = [
            "분석", "평가", "검토", "검증", "비교", "최적화", "효율성",
            "안정성", "신뢰성", "품질", "성능", "기술력", "실적"
        ]
        
        total_words = len(message.split())
        tech_word_count = sum(1 for term in technical_terms if term in message)
        
        return tech_word_count / total_words if total_words > 0 else 0
    
    def get_learning_insights(self, profile_key: str = None) -> Dict[str, Any]:
        """학습 인사이트 제공"""
        if profile_key and profile_key in self.learning_memory:
            memory_data = self.learning_memory[profile_key]
        else:
            # 전체 메모리 통합
            memory_data = []
            for data_list in self.learning_memory.values():
                memory_data.extend(data_list)
        
        if not memory_data:
            return {"message": "학습 데이터가 없습니다."}
        
        # 통계 계산
        effectiveness_scores = [item["effectiveness_score"] for item in memory_data]
        
        insights = {
            "total_generations": len(memory_data),
            "average_effectiveness": np.mean(effectiveness_scores),
            "effectiveness_trend": "향상" if len(effectiveness_scores) > 1 and effectiveness_scores[-1] > effectiveness_scores[0] else "유지",
            "optimal_content_length": np.mean([item["content_length"] for item in memory_data]),
            "learning_recommendations": self._generate_learning_recommendations(memory_data)
        }
        
        return insights
    
    def _generate_learning_recommendations(self, memory_data: List[Dict]) -> List[str]:
        """학습 기반 권고사항 생성"""
        recommendations = []
        
        # 효과성 패턴 분석
        high_effectiveness = [item for item in memory_data if item["effectiveness_score"] > 0.8]
        
        if high_effectiveness:
            avg_length = np.mean([item["content_length"] for item in high_effectiveness])
            recommendations.append(f"높은 효과성을 위해 {int(avg_length)}자 내외의 메시지 길이 권장")
        
        # 복잡도 최적화
        complexity_data = [item["complexity_indicators"] for item in memory_data]
        if complexity_data:
            avg_tech_ratio = np.mean([c["technical_term_ratio"] for c in complexity_data])
            if avg_tech_ratio > 0.3:
                recommendations.append("전문 용어 사용을 30% 이하로 제한하여 가독성 향상")
        
        recommendations.extend([
            "개인화 정확도 향상을 위한 더 많은 프로필 데이터 수집",
            "실시간 피드백 시스템을 통한 지속적 학습 개선"
        ])
        
        return recommendations


# 테스트 함수
def test_neural_message_generator():
    """신경망 메시지 생성기 테스트"""
    generator = NeuralMessageGenerator()
    
    # 테스트 데이터
    core_data = {
        "recommended_company": "삼성물산",
        "primary_reason": "종합 기술력 및 재무 안정성",
        "comparison_results": {
            "삼성물산": {"기술력": 95, "재무안정성": 92, "가격경쟁력": 78},
            "대한건설": {"기술력": 88, "재무안정성": 85, "가격경쟁력": 85}
        },
        "confidence_metrics": {"overall": 90}
    }
    
    target_profile = {
        "authority_level": "high",
        "expertise_level": "business",
        "decision_style": "analytical",
        "risk_aversion": 0.7,
        "formality_preference": 0.8,
        "detail_preference": 0.6
    }
    
    context_analysis = {
        "timeline_pressure": 0.6,
        "stakeholder_complexity": 0.7,
        "technical_complexity": 0.5,
        "project_scope": "large_scale"
    }
    
    # 신경망 메시지 생성
    result = generator.generate_neural_message(
        core_data=core_data,
        target_profile=target_profile,
        context_analysis=context_analysis,
        complexity_level=MessageComplexity.COMPLEX
    )
    
    print("=== 신경망 기반 메시지 생성 결과 ===")
    print(f"생성된 메시지:\n{result['neural_message']['full_message']}")
    print(f"\n효과성 예측: {result['effectiveness_prediction']:.2f}")
    print(f"신경망 신뢰도: {result['generation_metadata']['neural_confidence']:.2f}")
    print(f"인지 부하: {result['generation_metadata']['cognitive_load_estimate']:.2f}")
    print(f"설득 잠재력: {result['generation_metadata']['persuasion_potential']:.2f}")


if __name__ == "__main__":
    test_neural_message_generator() 