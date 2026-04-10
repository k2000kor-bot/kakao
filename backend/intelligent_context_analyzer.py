import json
import re
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import hashlib


@dataclass
class ContextualFactor:
    """컨텍스트 요인"""
    factor_type: str
    importance: float
    confidence: float
    source: str
    timestamp: datetime
    metadata: Dict[str, Any]


@dataclass
class DecisionContext:
    """의사결정 컨텍스트"""
    project_scope: str
    timeline_pressure: float  # 0-1
    stakeholder_complexity: float  # 0-1
    financial_sensitivity: float  # 0-1
    technical_complexity: float  # 0-1
    regulatory_requirements: List[str]
    market_conditions: Dict[str, Any]
    organizational_constraints: List[str]
    external_pressures: List[str]


@dataclass
class CommunicationContext:
    """커뮤니케이션 컨텍스트"""
    audience_profile: Dict[str, Any]
    relationship_dynamics: Dict[str, float]
    communication_history: List[Dict]
    cultural_considerations: List[str]
    language_preferences: Dict[str, Any]
    information_sensitivity: float  # 0-1
    formality_expectations: float  # 0-1


@dataclass
class TemporalContext:
    """시간적 컨텍스트"""
    current_phase: str
    phase_duration: timedelta
    remaining_time: timedelta
    critical_milestones: List[Dict]
    seasonal_factors: List[str]
    business_cycle_phase: str
    urgency_level: float  # 0-1


@dataclass
class ContextAnalysisResult:
    """컨텍스트 분석 결과"""
    decision_context: DecisionContext
    communication_context: CommunicationContext
    temporal_context: TemporalContext
    contextual_factors: List[ContextualFactor]
    adaptation_recommendations: List[str]
    confidence_score: float
    analysis_timestamp: datetime


class IntelligentContextAnalyzer:
    """지능형 컨텍스트 분석기"""
    
    def __init__(self):
        self.context_patterns = self._initialize_context_patterns()
        self.factor_weights = self._initialize_factor_weights()
        self.adaptation_rules = self._initialize_adaptation_rules()
        self.context_history = defaultdict(list)
        self.pattern_cache = {}
        
    def _initialize_context_patterns(self) -> Dict[str, Dict]:
        """컨텍스트 패턴 초기화"""
        return {
            "project_scope_indicators": {
                "large_scale": [
                    "대규모", "대형", "전체", "통합", "종합", "총", "전면",
                    "1000세대", "억원", "단지", "복합", "메가"
                ],
                "medium_scale": [
                    "중규모", "중형", "부분", "단계별", "순차", "500세대",
                    "수십억", "블록", "동별"
                ],
                "small_scale": [
                    "소규모", "소형", "국소", "일부", "개별", "100세대",
                    "수억", "개별동", "파일럿"
                ]
            },
            "urgency_indicators": {
                "critical": [
                    "긴급", "즉시", "당장", "시급", "응급", "critical", "urgent",
                    "deadline", "마감", "촉박", "급한"
                ],
                "high": [
                    "빠른", "신속", "조속", "서둘", "우선", "priority", "asap",
                    "최대한 빨리", "가능한 빨리"
                ],
                "moderate": [
                    "적절한", "정상", "일반", "표준", "통상", "보통", "regular",
                    "정해진 일정"
                ],
                "low": [
                    "여유", "충분한", "천천히", "신중", "단계적", "점진적",
                    "flexible", "여유있게"
                ]
            },
            "stakeholder_complexity": {
                "high_complexity": [
                    "다수", "복수", "여러", "각기", "상이한", "복잡한", "얽힌",
                    "이해관계", "갈등", "조율", "합의", "협의"
                ],
                "medium_complexity": [
                    "몇몇", "일부", "주요", "핵심", "관련", "참여", "관심",
                    "의견", "검토", "확인"
                ],
                "low_complexity": [
                    "단순", "명확", "일치", "동일", "합의된", "결정된",
                    "승인", "확정", "단일"
                ]
            },
            "financial_sensitivity": {
                "high_sensitive": [
                    "예산", "비용", "재정", "자금", "투자", "수익", "손실",
                    "경제적", "재무적", "비용효율", "ROI", "수익성"
                ],
                "medium_sensitive": [
                    "가격", "견적", "단가", "금액", "비교", "절약", "효율",
                    "경쟁력", "가성비"
                ],
                "low_sensitive": [
                    "품질", "기술", "성능", "안전", "신뢰", "평판", "경험",
                    "실적", "역량"
                ]
            }
        }
    
    def _initialize_factor_weights(self) -> Dict[str, float]:
        """요인 가중치 초기화"""
        return {
            "project_scope": 0.25,
            "timeline_pressure": 0.20,
            "stakeholder_complexity": 0.15,
            "financial_sensitivity": 0.15,
            "technical_complexity": 0.10,
            "regulatory_requirements": 0.08,
            "market_conditions": 0.05,
            "organizational_constraints": 0.02
        }
    
    def _initialize_adaptation_rules(self) -> Dict[str, Dict]:
        """적응 규칙 초기화"""
        return {
            "message_structure": {
                "high_urgency": {
                    "lead_with_conclusion": True,
                    "minimize_background": True,
                    "emphasize_action_items": True,
                    "use_bullet_points": True
                },
                "high_complexity": {
                    "provide_executive_summary": True,
                    "include_stakeholder_matrix": True,
                    "add_decision_tree": True,
                    "clarify_dependencies": True
                },
                "high_sensitivity": {
                    "add_disclaimers": True,
                    "include_risk_assessment": True,
                    "provide_alternatives": True,
                    "emphasize_due_diligence": True
                }
            },
            "communication_style": {
                "formal_audience": {
                    "increase_formality": 0.3,
                    "use_technical_terms": True,
                    "add_references": True,
                    "structured_format": True
                },
                "diverse_stakeholders": {
                    "neutral_tone": True,
                    "avoid_jargon": True,
                    "provide_definitions": True,
                    "multiple_perspectives": True
                },
                "time_pressure": {
                    "concise_language": True,
                    "clear_priorities": True,
                    "immediate_actions": True,
                    "minimal_elaboration": True
                }
            },
            "content_adaptation": {
                "technical_audience": {
                    "detailed_methodology": True,
                    "include_specifications": True,
                    "add_technical_appendix": True,
                    "reference_standards": True
                },
                "executive_audience": {
                    "strategic_implications": True,
                    "financial_impact": True,
                    "high_level_summary": True,
                    "decision_recommendations": True
                },
                "regulatory_focus": {
                    "compliance_emphasis": True,
                    "regulatory_references": True,
                    "audit_trail": True,
                    "documentation_standards": True
                }
            }
        }
    
    def analyze_comprehensive_context(
        self,
        input_data: Dict[str, Any],
        communication_history: List[Dict] = None,
        project_metadata: Dict[str, Any] = None
    ) -> ContextAnalysisResult:
        """종합적 컨텍스트 분석"""
        
        # 1. 의사결정 컨텍스트 분석
        decision_context = self._analyze_decision_context(input_data, project_metadata)
        
        # 2. 커뮤니케이션 컨텍스트 분석
        communication_context = self._analyze_communication_context(
            input_data, communication_history
        )
        
        # 3. 시간적 컨텍스트 분석
        temporal_context = self._analyze_temporal_context(input_data, project_metadata)
        
        # 4. 컨텍스트 요인 추출
        contextual_factors = self._extract_contextual_factors(
            input_data, decision_context, communication_context, temporal_context
        )
        
        # 5. 적응 권고사항 생성
        adaptation_recommendations = self._generate_adaptation_recommendations(
            decision_context, communication_context, temporal_context, contextual_factors
        )
        
        # 6. 신뢰도 점수 계산
        confidence_score = self._calculate_confidence_score(
            input_data, contextual_factors
        )
        
        result = ContextAnalysisResult(
            decision_context=decision_context,
            communication_context=communication_context,
            temporal_context=temporal_context,
            contextual_factors=contextual_factors,
            adaptation_recommendations=adaptation_recommendations,
            confidence_score=confidence_score,
            analysis_timestamp=datetime.now()
        )
        
        # 컨텍스트 이력 저장
        self._store_context_history(result)
        
        return result
    
    def _analyze_decision_context(
        self,
        input_data: Dict[str, Any],
        project_metadata: Dict[str, Any] = None
    ) -> DecisionContext:
        """의사결정 컨텍스트 분석"""
        
        # 프로젝트 규모 분석
        project_scope = self._determine_project_scope(input_data, project_metadata)
        
        # 타임라인 압박도 분석
        timeline_pressure = self._analyze_timeline_pressure(input_data)
        
        # 이해관계자 복잡도 분석
        stakeholder_complexity = self._analyze_stakeholder_complexity(input_data)
        
        # 재무 민감도 분석
        financial_sensitivity = self._analyze_financial_sensitivity(input_data)
        
        # 기술적 복잡도 분석
        technical_complexity = self._analyze_technical_complexity(input_data)
        
        # 규제 요구사항 추출
        regulatory_requirements = self._extract_regulatory_requirements(input_data)
        
        # 시장 조건 분석
        market_conditions = self._analyze_market_conditions(input_data, project_metadata)
        
        # 조직적 제약사항 분석
        organizational_constraints = self._identify_organizational_constraints(input_data)
        
        # 외부 압력 요인 분석
        external_pressures = self._identify_external_pressures(input_data)
        
        return DecisionContext(
            project_scope=project_scope,
            timeline_pressure=timeline_pressure,
            stakeholder_complexity=stakeholder_complexity,
            financial_sensitivity=financial_sensitivity,
            technical_complexity=technical_complexity,
            regulatory_requirements=regulatory_requirements,
            market_conditions=market_conditions,
            organizational_constraints=organizational_constraints,
            external_pressures=external_pressures
        )
    
    def _determine_project_scope(
        self,
        input_data: Dict[str, Any],
        project_metadata: Dict[str, Any] = None
    ) -> str:
        """프로젝트 규모 결정"""
        
        text_data = str(input_data.get("project_description", ""))
        if project_metadata:
            text_data += " " + str(project_metadata.get("description", ""))
        
        text_lower = text_data.lower()
        
        # 규모 지표 점수 계산
        scope_scores = {}
        for scope_type, indicators in self.context_patterns["project_scope_indicators"].items():
            score = sum(1 for indicator in indicators if indicator in text_lower)
            scope_scores[scope_type] = score
        
        # 수치 정보 기반 판단
        if project_metadata:
            budget = project_metadata.get("budget", 0)
            units = project_metadata.get("housing_units", 0)
            
            if budget > 1000000000000 or units > 1000:  # 1조원 또는 1000세대 이상
                return "large_scale"
            elif budget > 100000000000 or units > 300:  # 1000억원 또는 300세대 이상
                return "medium_scale"
            else:
                return "small_scale"
        
        # 텍스트 기반 판단
        max_score_type = max(scope_scores, key=scope_scores.get) if scope_scores else "medium_scale"
        return max_score_type
    
    def _analyze_timeline_pressure(self, input_data: Dict[str, Any]) -> float:
        """타임라인 압박도 분석"""
        
        text_data = str(input_data.get("timeline_requirements", ""))
        text_data += " " + str(input_data.get("urgency_notes", ""))
        text_lower = text_data.lower()
        
        urgency_scores = {}
        for urgency_level, indicators in self.context_patterns["urgency_indicators"].items():
            score = sum(1 for indicator in indicators if indicator in text_lower)
            urgency_scores[urgency_level] = score
        
        # 점수를 0-1 범위로 정규화
        total_score = sum(urgency_scores.values())
        if total_score == 0:
            return 0.5  # 기본값
        
        pressure_mapping = {
            "critical": 1.0,
            "high": 0.8,
            "moderate": 0.5,
            "low": 0.2
        }
        
        weighted_score = sum(
            pressure_mapping[level] * score / total_score
            for level, score in urgency_scores.items()
        )
        
        return weighted_score
    
    def _analyze_stakeholder_complexity(self, input_data: Dict[str, Any]) -> float:
        """이해관계자 복잡도 분석"""
        
        stakeholder_data = input_data.get("stakeholders", [])
        if isinstance(stakeholder_data, str):
            stakeholder_text = stakeholder_data.lower()
        else:
            stakeholder_text = " ".join(str(s) for s in stakeholder_data).lower()
        
        complexity_scores = {}
        for complexity_level, indicators in self.context_patterns["stakeholder_complexity"].items():
            score = sum(1 for indicator in indicators if indicator in stakeholder_text)
            complexity_scores[complexity_level] = score
        
        # 이해관계자 수 기반 보정
        stakeholder_count = len(stakeholder_data) if isinstance(stakeholder_data, list) else 3
        count_factor = min(stakeholder_count / 10, 1.0)  # 최대 10명 기준
        
        total_score = sum(complexity_scores.values())
        if total_score == 0:
            return count_factor
        
        complexity_mapping = {
            "high_complexity": 1.0,
            "medium_complexity": 0.6,
            "low_complexity": 0.3
        }
        
        text_score = sum(
            complexity_mapping[level] * score / total_score
            for level, score in complexity_scores.items()
        )
        
        return 0.7 * text_score + 0.3 * count_factor
    
    def _analyze_financial_sensitivity(self, input_data: Dict[str, Any]) -> float:
        """재무 민감도 분석"""
        
        financial_text = str(input_data.get("financial_considerations", ""))
        financial_text += " " + str(input_data.get("budget_constraints", ""))
        financial_text = financial_text.lower()
        
        sensitivity_scores = {}
        for sensitivity_level, indicators in self.context_patterns["financial_sensitivity"].items():
            score = sum(1 for indicator in indicators if indicator in financial_text)
            sensitivity_scores[sensitivity_level] = score
        
        total_score = sum(sensitivity_scores.values())
        if total_score == 0:
            return 0.6  # 기본값 (중간 정도 민감)
        
        sensitivity_mapping = {
            "high_sensitive": 1.0,
            "medium_sensitive": 0.6,
            "low_sensitive": 0.3
        }
        
        weighted_score = sum(
            sensitivity_mapping[level] * score / total_score
            for level, score in sensitivity_scores.items()
        )
        
        return weighted_score
    
    def _analyze_technical_complexity(self, input_data: Dict[str, Any]) -> float:
        """기술적 복잡도 분석"""
        
        technical_indicators = [
            "고도", "복잡", "첨단", "신기술", "특수", "맞춤", "혁신",
            "고성능", "정밀", "전문", "기술집약", "하이테크"
        ]
        
        simple_indicators = [
            "표준", "일반", "기본", "단순", "평범", "통상", "보편",
            "범용", "표준화", "기존"
        ]
        
        technical_text = str(input_data.get("technical_requirements", ""))
        technical_text += " " + str(input_data.get("project_description", ""))
        technical_text = technical_text.lower()
        
        complex_score = sum(1 for indicator in technical_indicators if indicator in technical_text)
        simple_score = sum(1 for indicator in simple_indicators if indicator in technical_text)
        
        total_indicators = complex_score + simple_score
        if total_indicators == 0:
            return 0.5  # 기본값
        
        complexity_ratio = complex_score / total_indicators
        return complexity_ratio
    
    def _extract_regulatory_requirements(self, input_data: Dict[str, Any]) -> List[str]:
        """규제 요구사항 추출"""
        
        regulatory_keywords = {
            "건축법": ["건축법", "건축기준", "건축허가", "건축신고"],
            "도시계획법": ["도시계획", "용도지역", "지구단위", "개발행위"],
            "환경법": ["환경영향", "환경평가", "환경허가", "오염"],
            "안전법": ["안전관리", "산업안전", "건설안전", "안전규정"],
            "소방법": ["소방시설", "소방설계", "방화", "피난"],
            "장애인법": ["장애인", "접근성", "편의시설", "무장애"]
        }
        
        text_data = str(input_data.get("regulatory_requirements", ""))
        text_data += " " + str(input_data.get("compliance_notes", ""))
        text_lower = text_data.lower()
        
        identified_requirements = []
        for requirement, keywords in regulatory_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                identified_requirements.append(requirement)
        
        return identified_requirements
    
    def _analyze_market_conditions(
        self,
        input_data: Dict[str, Any],
        project_metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """시장 조건 분석"""
        
        market_indicators = {
            "construction_cost": "보통",
            "material_price": "상승",
            "labor_cost": "안정",
            "competition_level": "높음",
            "demand_level": "보통"
        }
        
        # 입력 데이터에서 시장 정보 추출
        market_data = input_data.get("market_conditions", {})
        if isinstance(market_data, dict):
            market_indicators.update(market_data)
        
        return market_indicators
    
    def _identify_organizational_constraints(self, input_data: Dict[str, Any]) -> List[str]:
        """조직적 제약사항 식별"""
        
        constraint_patterns = {
            "예산 제약": ["예산", "자금", "재정", "비용"],
            "인력 제약": ["인력", "인원", "직원", "팀"],
            "시간 제약": ["일정", "기간", "마감", "시간"],
            "기술 제약": ["기술", "역량", "전문성", "경험"],
            "정책 제약": ["정책", "규정", "지침", "방침"]
        }
        
        constraints_text = str(input_data.get("constraints", ""))
        constraints_text += " " + str(input_data.get("limitations", ""))
        constraints_lower = constraints_text.lower()
        
        identified_constraints = []
        for constraint, keywords in constraint_patterns.items():
            if any(keyword in constraints_lower for keyword in keywords):
                identified_constraints.append(constraint)
        
        return identified_constraints
    
    def _identify_external_pressures(self, input_data: Dict[str, Any]) -> List[str]:
        """외부 압력 요인 식별"""
        
        pressure_patterns = {
            "언론 관심": ["언론", "미디어", "보도", "기사"],
            "주민 반대": ["주민", "반대", "민원", "항의"],
            "정치적 압력": ["정치", "정부", "당국", "행정"],
            "경제적 압력": ["경제", "경기", "불황", "위기"],
            "사회적 압력": ["사회", "여론", "공론", "비판"]
        }
        
        pressure_text = str(input_data.get("external_factors", ""))
        pressure_text += " " + str(input_data.get("public_opinion", ""))
        pressure_lower = pressure_text.lower()
        
        identified_pressures = []
        for pressure, keywords in pressure_patterns.items():
            if any(keyword in pressure_lower for keyword in keywords):
                identified_pressures.append(pressure)
        
        return identified_pressures
    
    def _analyze_communication_context(
        self,
        input_data: Dict[str, Any],
        communication_history: List[Dict] = None
    ) -> CommunicationContext:
        """커뮤니케이션 컨텍스트 분석"""
        
        # 대상 청중 프로필 분석
        audience_profile = self._analyze_audience_profile(input_data)
        
        # 관계 역학 분석
        relationship_dynamics = self._analyze_relationship_dynamics(
            input_data, communication_history
        )
        
        # 커뮤니케이션 이력 처리
        processed_history = communication_history or []
        
        # 문화적 고려사항 식별
        cultural_considerations = self._identify_cultural_considerations(input_data)
        
        # 언어 선호도 분석
        language_preferences = self._analyze_language_preferences(input_data)
        
        # 정보 민감도 평가
        information_sensitivity = self._assess_information_sensitivity(input_data)
        
        # 격식성 기대치 분석
        formality_expectations = self._analyze_formality_expectations(input_data)
        
        return CommunicationContext(
            audience_profile=audience_profile,
            relationship_dynamics=relationship_dynamics,
            communication_history=processed_history,
            cultural_considerations=cultural_considerations,
            language_preferences=language_preferences,
            information_sensitivity=information_sensitivity,
            formality_expectations=formality_expectations
        )
    
    def _analyze_audience_profile(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """대상 청중 프로필 분석"""
        
        stakeholders = input_data.get("stakeholders", [])
        if isinstance(stakeholders, str):
            stakeholders = [stakeholders]
        
        profile = {
            "primary_audience": "실무진",  # 기본값
            "audience_types": [],
            "expertise_level": "중급",
            "decision_authority": "중간",
            "technical_background": False
        }
        
        # 청중 유형별 분류
        executive_keywords = ["임원", "이사", "대표", "회장", "사장", "부사장"]
        technical_keywords = ["기술", "엔지니어", "설계", "시공", "전문가"]
        administrative_keywords = ["관리", "행정", "사무", "총무", "기획"]
        
        stakeholder_text = " ".join(stakeholders).lower()
        
        if any(keyword in stakeholder_text for keyword in executive_keywords):
            profile["primary_audience"] = "임원진"
            profile["decision_authority"] = "높음"
            profile["expertise_level"] = "고급"
        elif any(keyword in stakeholder_text for keyword in technical_keywords):
            profile["primary_audience"] = "기술진"
            profile["technical_background"] = True
            profile["expertise_level"] = "전문가"
        elif any(keyword in stakeholder_text for keyword in administrative_keywords):
            profile["primary_audience"] = "관리진"
            profile["decision_authority"] = "중간"
        
        return profile
    
    def _analyze_relationship_dynamics(
        self,
        input_data: Dict[str, Any],
        communication_history: List[Dict] = None
    ) -> Dict[str, float]:
        """관계 역학 분석"""
        
        dynamics = {
            "trust_level": 0.7,  # 기본 신뢰도
            "collaboration_history": 0.6,  # 협업 이력
            "conflict_potential": 0.3,  # 갈등 가능성
            "influence_balance": 0.5  # 영향력 균형
        }
        
        if communication_history:
            # 이전 커뮤니케이션 분석을 통한 관계 평가
            positive_indicators = ["합의", "동의", "찬성", "협력", "긍정"]
            negative_indicators = ["반대", "거부", "문제", "우려", "갈등"]
            
            total_messages = len(communication_history)
            positive_count = 0
            negative_count = 0
            
            for msg in communication_history:
                content = str(msg.get("content", "")).lower()
                positive_count += sum(1 for indicator in positive_indicators if indicator in content)
                negative_count += sum(1 for indicator in negative_indicators if indicator in content)
            
            if total_messages > 0:
                dynamics["trust_level"] = max(0.1, min(0.9, 
                    0.7 + (positive_count - negative_count) / total_messages * 0.3
                ))
                dynamics["collaboration_history"] = min(0.9, total_messages / 10)
                dynamics["conflict_potential"] = max(0.1, negative_count / max(total_messages, 1))
        
        return dynamics
    
    def _identify_cultural_considerations(self, input_data: Dict[str, Any]) -> List[str]:
        """문화적 고려사항 식별"""
        
        considerations = []
        
        # 지역적 특성
        location = input_data.get("project_location", "")
        if "강남" in location or "서초" in location:
            considerations.append("고급 주거지역 특성")
        elif "강북" in location or "은평" in location:
            considerations.append("전통 주거지역 특성")
        
        # 연령대 특성
        target_age = input_data.get("target_demographic", "")
        if "고령" in target_age or "시니어" in target_age:
            considerations.append("고령층 친화적 소통")
        elif "젊은" in target_age or "청년" in target_age:
            considerations.append("젊은층 중심 소통")
        
        return considerations
    
    def _analyze_language_preferences(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """언어 선호도 분석"""
        
        preferences = {
            "formality_level": "보통",
            "technical_terms": "적절히 사용",
            "foreign_terms": "최소화",
            "length_preference": "보통"
        }
        
        # 청중 특성에 따른 언어 선호도 조정
        audience = input_data.get("stakeholders", [])
        audience_text = " ".join(audience).lower() if isinstance(audience, list) else str(audience).lower()
        
        if "임원" in audience_text or "이사" in audience_text:
            preferences["formality_level"] = "높음"
            preferences["length_preference"] = "간결"
        elif "기술" in audience_text or "전문가" in audience_text:
            preferences["technical_terms"] = "적극 사용"
            preferences["length_preference"] = "상세"
        
        return preferences
    
    def _assess_information_sensitivity(self, input_data: Dict[str, Any]) -> float:
        """정보 민감도 평가"""
        
        sensitive_keywords = [
            "기밀", "비공개", "내부", "한정", "제한", "민감",
            "경쟁", "입찰", "가격", "조건", "계약"
        ]
        
        all_text = " ".join(str(v) for v in input_data.values()).lower()
        
        sensitivity_score = sum(1 for keyword in sensitive_keywords if keyword in all_text)
        normalized_score = min(sensitivity_score / 5, 1.0)  # 0-1 정규화
        
        return max(0.3, normalized_score)  # 최소 0.3 (기본 민감도)
    
    def _analyze_formality_expectations(self, input_data: Dict[str, Any]) -> float:
        """격식성 기대치 분석"""
        
        formal_contexts = [
            "공식", "정식", "공문", "보고서", "제안서", "계약",
            "발표", "회의", "임원", "이사회"
        ]
        
        informal_contexts = [
            "내부", "참고", "검토", "논의", "상의", "브리핑",
            "실무", "팀", "워킹", "스터디"
        ]
        
        all_text = " ".join(str(v) for v in input_data.values()).lower()
        
        formal_score = sum(1 for context in formal_contexts if context in all_text)
        informal_score = sum(1 for context in informal_contexts if context in all_text)
        
        total_score = formal_score + informal_score
        if total_score == 0:
            return 0.6  # 기본값
        
        formality_ratio = formal_score / total_score
        return 0.4 + formality_ratio * 0.6  # 0.4-1.0 범위
    
    def _analyze_temporal_context(
        self,
        input_data: Dict[str, Any],
        project_metadata: Dict[str, Any] = None
    ) -> TemporalContext:
        """시간적 컨텍스트 분석"""
        
        # 현재 단계 식별
        current_phase = self._identify_current_phase(input_data)
        
        # 단계 지속 기간 추정
        phase_duration = self._estimate_phase_duration(current_phase, project_metadata)
        
        # 남은 시간 계산
        remaining_time = self._calculate_remaining_time(input_data, project_metadata)
        
        # 중요 마일스톤 식별
        critical_milestones = self._identify_critical_milestones(input_data, project_metadata)
        
        # 계절적 요인 분석
        seasonal_factors = self._analyze_seasonal_factors(input_data)
        
        # 사업 주기 단계 분석
        business_cycle_phase = self._analyze_business_cycle(input_data, project_metadata)
        
        # 긴급도 수준 계산
        urgency_level = self._calculate_urgency_level(remaining_time, critical_milestones)
        
        return TemporalContext(
            current_phase=current_phase,
            phase_duration=phase_duration,
            remaining_time=remaining_time,
            critical_milestones=critical_milestones,
            seasonal_factors=seasonal_factors,
            business_cycle_phase=business_cycle_phase,
            urgency_level=urgency_level
        )
    
    def _identify_current_phase(self, input_data: Dict[str, Any]) -> str:
        """현재 단계 식별"""
        
        phase_keywords = {
            "기획": ["기획", "계획", "구상", "설계"],
            "승인": ["승인", "허가", "인허가", "심의"],
            "입찰": ["입찰", "공고", "선정", "평가"],
            "계약": ["계약", "협상", "조건", "체결"],
            "시공": ["시공", "공사", "건설", "시작"],
            "완료": ["완료", "준공", "인도", "마무리"]
        }
        
        phase_text = str(input_data.get("current_phase", ""))
        phase_text += " " + str(input_data.get("project_status", ""))
        phase_lower = phase_text.lower()
        
        for phase, keywords in phase_keywords.items():
            if any(keyword in phase_lower for keyword in keywords):
                return phase
        
        return "입찰"  # 기본값 (시공사 선정 단계)
    
    def _estimate_phase_duration(
        self,
        current_phase: str,
        project_metadata: Dict[str, Any] = None
    ) -> timedelta:
        """단계 지속 기간 추정"""
        
        standard_durations = {
            "기획": timedelta(days=60),
            "승인": timedelta(days=90),
            "입찰": timedelta(days=30),
            "계약": timedelta(days=20),
            "시공": timedelta(days=365),
            "완료": timedelta(days=30)
        }
        
        return standard_durations.get(current_phase, timedelta(days=30))
    
    def _calculate_remaining_time(
        self,
        input_data: Dict[str, Any],
        project_metadata: Dict[str, Any] = None
    ) -> timedelta:
        """남은 시간 계산"""
        
        deadline_str = input_data.get("deadline", "")
        if deadline_str:
            try:
                deadline = datetime.strptime(deadline_str, "%Y-%m-%d")
                return deadline - datetime.now()
            except ValueError:
                pass
        
        # 기본값: 2주
        return timedelta(days=14)
    
    def _identify_critical_milestones(
        self,
        input_data: Dict[str, Any],
        project_metadata: Dict[str, Any] = None
    ) -> List[Dict]:
        """중요 마일스톤 식별"""
        
        milestones = []
        
        # 표준 마일스톤
        standard_milestones = [
            {"name": "시공사 선정", "days_ahead": 0},
            {"name": "계약 체결", "days_ahead": 14},
            {"name": "공사 시작", "days_ahead": 30},
            {"name": "중간 점검", "days_ahead": 180}
        ]
        
        current_date = datetime.now()
        for milestone in standard_milestones:
            milestone_date = current_date + timedelta(days=milestone["days_ahead"])
            milestones.append({
                "name": milestone["name"],
                "date": milestone_date,
                "importance": "높음" if milestone["days_ahead"] <= 30 else "보통"
            })
        
        return milestones
    
    def _analyze_seasonal_factors(self, input_data: Dict[str, Any]) -> List[str]:
        """계절적 요인 분석"""
        
        current_month = datetime.now().month
        seasonal_factors = []
        
        if current_month in [12, 1, 2]:
            seasonal_factors.extend(["동절기 시공 제약", "연말 예산 마감"])
        elif current_month in [6, 7, 8]:
            seasonal_factors.extend(["우기 대비", "하절기 안전"])
        elif current_month in [3, 4, 5]:
            seasonal_factors.extend(["건설 성수기", "자재 수급"])
        else:
            seasonal_factors.extend(["추가 고려사항 없음"])
        
        return seasonal_factors
    
    def _analyze_business_cycle(
        self,
        input_data: Dict[str, Any],
        project_metadata: Dict[str, Any] = None
    ) -> str:
        """사업 주기 단계 분석"""
        
        # 간단한 분석 (실제로는 더 복잡한 경제 지표 분석 필요)
        market_conditions = input_data.get("market_conditions", {})
        
        if isinstance(market_conditions, dict):
            economic_status = market_conditions.get("economic_phase", "stable")
            if economic_status in ["growth", "expansion"]:
                return "성장기"
            elif economic_status in ["recession", "contraction"]:
                return "침체기"
            else:
                return "안정기"
        
        return "안정기"
    
    def _calculate_urgency_level(
        self,
        remaining_time: timedelta,
        critical_milestones: List[Dict]
    ) -> float:
        """긴급도 수준 계산"""
        
        # 남은 시간 기반 긴급도
        days_remaining = remaining_time.days
        
        if days_remaining <= 3:
            time_urgency = 1.0
        elif days_remaining <= 7:
            time_urgency = 0.8
        elif days_remaining <= 14:
            time_urgency = 0.6
        elif days_remaining <= 30:
            time_urgency = 0.4
        else:
            time_urgency = 0.2
        
        # 마일스톤 기반 긴급도
        upcoming_milestones = [
            m for m in critical_milestones
            if (m["date"] - datetime.now()).days <= 7
        ]
        
        milestone_urgency = min(len(upcoming_milestones) * 0.3, 1.0)
        
        # 종합 긴급도
        overall_urgency = max(time_urgency, milestone_urgency)
        
        return overall_urgency
    
    def _extract_contextual_factors(
        self,
        input_data: Dict[str, Any],
        decision_context: DecisionContext,
        communication_context: CommunicationContext,
        temporal_context: TemporalContext
    ) -> List[ContextualFactor]:
        """컨텍스트 요인 추출"""
        
        factors = []
        
        # 의사결정 컨텍스트 요인
        if decision_context.timeline_pressure > 0.7:
            factors.append(ContextualFactor(
                factor_type="timeline_pressure",
                importance=decision_context.timeline_pressure,
                confidence=0.8,
                source="decision_context",
                timestamp=datetime.now(),
                metadata={"description": "높은 시간적 압박"}
            ))
        
        if decision_context.stakeholder_complexity > 0.6:
            factors.append(ContextualFactor(
                factor_type="stakeholder_complexity",
                importance=decision_context.stakeholder_complexity,
                confidence=0.7,
                source="decision_context",
                timestamp=datetime.now(),
                metadata={"description": "복잡한 이해관계자 구조"}
            ))
        
        # 커뮤니케이션 컨텍스트 요인
        if communication_context.information_sensitivity > 0.7:
            factors.append(ContextualFactor(
                factor_type="information_sensitivity",
                importance=communication_context.information_sensitivity,
                confidence=0.9,
                source="communication_context",
                timestamp=datetime.now(),
                metadata={"description": "높은 정보 민감도"}
            ))
        
        # 시간적 컨텍스트 요인
        if temporal_context.urgency_level > 0.8:
            factors.append(ContextualFactor(
                factor_type="high_urgency",
                importance=temporal_context.urgency_level,
                confidence=0.9,
                source="temporal_context",
                timestamp=datetime.now(),
                metadata={"description": "매우 높은 긴급도"}
            ))
        
        return factors
    
    def _generate_adaptation_recommendations(
        self,
        decision_context: DecisionContext,
        communication_context: CommunicationContext,
        temporal_context: TemporalContext,
        contextual_factors: List[ContextualFactor]
    ) -> List[str]:
        """적응 권고사항 생성"""
        
        recommendations = []
        
        # 시간 압박 관련 권고
        if decision_context.timeline_pressure > 0.7:
            recommendations.extend([
                "결론을 먼저 제시하고 상세 설명은 후순위로 배치",
                "핵심 액션 아이템을 명확히 구분하여 제시",
                "불필요한 배경 설명 최소화"
            ])
        
        # 이해관계자 복잡도 관련 권고
        if decision_context.stakeholder_complexity > 0.6:
            recommendations.extend([
                "이해관계자별 관심사를 명시적으로 다룸",
                "의사결정 매트릭스나 비교표 활용",
                "합의 형성을 위한 단계적 접근 제안"
            ])
        
        # 정보 민감도 관련 권고
        if communication_context.information_sensitivity > 0.7:
            recommendations.extend([
                "면책 조항 및 주의사항 명시",
                "정보 공개 범위와 제한사항 설명",
                "추가 검증이 필요한 부분 표시"
            ])
        
        # 긴급도 관련 권고
        if temporal_context.urgency_level > 0.8:
            recommendations.extend([
                "즉시 필요한 조치사항을 최우선으로 배치",
                "의사결정 데드라인 명확히 제시",
                "빠른 실행을 위한 간소화된 절차 제안"
            ])
        
        # 청중 특성 관련 권고
        if communication_context.audience_profile.get("primary_audience") == "임원진":
            recommendations.extend([
                "전략적 함의와 비즈니스 임팩트 강조",
                "고수준 요약과 핵심 수치 중심 구성",
                "의사결정 권고안을 명확히 제시"
            ])
        
        return list(set(recommendations))  # 중복 제거
    
    def _calculate_confidence_score(
        self,
        input_data: Dict[str, Any],
        contextual_factors: List[ContextualFactor]
    ) -> float:
        """신뢰도 점수 계산"""
        
        # 데이터 완전성 평가
        data_completeness = len(input_data) / 10  # 10개 필드 기준
        data_completeness = min(data_completeness, 1.0)
        
        # 컨텍스트 요인 신뢰도
        factor_confidence = np.mean([f.confidence for f in contextual_factors]) if contextual_factors else 0.5
        
        # 분석 일관성 (요인들 간의 상호 일치성)
        consistency_score = 0.8  # 기본값 (실제로는 더 복잡한 계산 필요)
        
        # 종합 신뢰도
        overall_confidence = (
            0.4 * data_completeness +
            0.4 * factor_confidence +
            0.2 * consistency_score
        )
        
        return round(overall_confidence, 2)
    
    def _store_context_history(self, result: ContextAnalysisResult):
        """컨텍스트 분석 이력 저장"""
        
        # 프로젝트 식별자 생성
        project_id = hashlib.md5(
            str(result.decision_context.project_scope + 
                result.temporal_context.current_phase).encode()
        ).hexdigest()[:8]
        
        self.context_history[project_id].append({
            "timestamp": result.analysis_timestamp,
            "confidence": result.confidence_score,
            "factors_count": len(result.contextual_factors),
            "recommendations_count": len(result.adaptation_recommendations)
        })
        
        # 이력 크기 제한 (최대 100개)
        if len(self.context_history[project_id]) > 100:
            self.context_history[project_id] = self.context_history[project_id][-100:]
    
    def get_context_insights(self, project_id: str = None) -> Dict[str, Any]:
        """컨텍스트 인사이트 제공"""
        
        if project_id and project_id in self.context_history:
            history = self.context_history[project_id]
        else:
            # 전체 이력 통합
            all_history = []
            for project_history in self.context_history.values():
                all_history.extend(project_history)
            history = all_history
        
        if not history:
            return {"message": "분석 이력이 없습니다."}
        
        # 통계 계산
        confidence_scores = [h["confidence"] for h in history]
        factor_counts = [h["factors_count"] for h in history]
        
        insights = {
            "total_analyses": len(history),
            "average_confidence": np.mean(confidence_scores),
            "confidence_trend": "증가" if len(confidence_scores) > 1 and confidence_scores[-1] > confidence_scores[0] else "감소",
            "average_factors": np.mean(factor_counts),
            "most_recent_analysis": max(h["timestamp"] for h in history) if history else None,
            "recommendations": [
                "컨텍스트 분석의 정확도가 지속적으로 개선되고 있습니다.",
                "다양한 프로젝트 경험을 통해 패턴 인식 능력이 향상되었습니다."
            ]
        }
        
        return insights


# 테스트 함수
def test_context_analyzer():
    """컨텍스트 분석기 테스트"""
    analyzer = IntelligentContextAnalyzer()
    
    # 테스트 데이터
    test_input = {
        "project_description": "샘플 프로젝트 대규모 재개발 프로젝트",
        "stakeholders": ["조합 임원진", "실무진", "외부 컨설턴트"],
        "timeline_requirements": "시급한 시공사 선정 필요",
        "financial_considerations": "예산 제약과 수익성 극대화",
        "regulatory_requirements": "건축법, 도시계획법 준수 필요",
        "market_conditions": {"economic_phase": "stable", "construction_cost": "rising"},
        "constraints": "인력 부족, 시간 제약",
        "current_phase": "시공사 선정 단계"
    }
    
    # 컨텍스트 분석 실행
    result = analyzer.analyze_comprehensive_context(test_input)
    
    print("=== 컨텍스트 분석 결과 ===")
    print(f"프로젝트 규모: {result.decision_context.project_scope}")
    print(f"시간 압박도: {result.decision_context.timeline_pressure:.2f}")
    print(f"이해관계자 복잡도: {result.decision_context.stakeholder_complexity:.2f}")
    print(f"재무 민감도: {result.decision_context.financial_sensitivity:.2f}")
    print(f"현재 단계: {result.temporal_context.current_phase}")
    print(f"긴급도: {result.temporal_context.urgency_level:.2f}")
    print(f"신뢰도: {result.confidence_score:.2f}")
    print(f"\n적응 권고사항:")
    for i, rec in enumerate(result.adaptation_recommendations, 1):
        print(f"{i}. {rec}")


if __name__ == "__main__":
    test_context_analyzer() 