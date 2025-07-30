from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import logging
from enum import Enum
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class InvestorType(Enum):
    """투자자 유형"""
    CONSERVATIVE = "안정형"
    MODERATE = "중위험중수익형"
    AGGRESSIVE = "적극투자형"
    SPECULATIVE = "투기형"


class InvestmentGoal(Enum):
    """투자 목표"""
    RESIDENCE = "실거주"
    ASSET_GROWTH = "자산증식"
    RENTAL_INCOME = "임대수익"
    REDEVELOPMENT = "재개발수익"
    SHORT_TERM = "단기차익"


@dataclass
class InvestorProfile:
    """투자자 프로필"""
    user_id: str
    name: str
    age: int
    annual_income: float  # 연소득 (억원)
    assets: float  # 총자산 (억원)
    investment_budget: float  # 투자가능 금액 (억원)
    investor_type: InvestorType
    investment_goal: InvestmentGoal
    investment_period: int  # 투자기간 (년)
    risk_tolerance: int  # 위험감수도 (1-10)
    preferred_regions: List[str]
    property_types: List[str]
    experience_years: int
    previous_investments: List[Dict[str, Any]]


@dataclass
class PersonalizedRecommendation:
    """개인화 추천"""
    recommendation_id: str
    user_id: str
    property_suggestions: List[Dict[str, Any]]
    investment_strategy: str
    risk_analysis: Dict[str, Any]
    expected_return: float
    confidence_score: float
    reasoning: str
    action_plan: List[str]
    created_at: datetime


class PersonalizedInvestmentAdvisor:
    """개인화 투자 컨설팅 시스템"""
    
    def __init__(self):
        self.user_profiles: Dict[str, InvestorProfile] = {}
        self.recommendation_history: Dict[str, List[PersonalizedRecommendation]] = {}
        
        # 투자 성향별 기본 전략
        self.investment_strategies = self._initialize_investment_strategies()
        
        # 지역별 특성 데이터
        self.regional_characteristics = self._initialize_regional_data()
        
        # 시장 상황별 가중치
        self.market_weights = self._initialize_market_weights()
        
    def _initialize_investment_strategies(self) -> Dict[InvestorType, Dict[str, Any]]:
        """투자 성향별 전략 초기화"""
        return {
            InvestorType.CONSERVATIVE: {
                "risk_level": 1,
                "preferred_properties": ["신축 아파트", "역세권", "학군지"],
                "avoid_properties": ["재개발", "경매", "구축"],
                "max_leverage": 0.5,  # 최대 레버리지 50%
                "expected_return": 0.05,  # 연 5%
                "holding_period": 5,
                "diversification": True,
                "key_factors": ["안정성", "유동성", "브랜드"]
            },
            InvestorType.MODERATE: {
                "risk_level": 2,
                "preferred_properties": ["브랜드 아파트", "개발호재", "교통 인프라"],
                "avoid_properties": ["고위험 재개발"],
                "max_leverage": 0.7,
                "expected_return": 0.10,
                "holding_period": 3,
                "diversification": True,
                "key_factors": ["성장성", "안정성", "수익성"]
            },
            InvestorType.AGGRESSIVE: {
                "risk_level": 3,
                "preferred_properties": ["재개발", "신도시", "개발호재"],
                "avoid_properties": ["완성된 지역"],
                "max_leverage": 0.8,
                "expected_return": 0.20,
                "holding_period": 2,
                "diversification": False,
                "key_factors": ["수익성", "성장성", "타이밍"]
            },
            InvestorType.SPECULATIVE: {
                "risk_level": 4,
                "preferred_properties": ["경매", "재개발", "신규 개발"],
                "avoid_properties": ["안정 자산"],
                "max_leverage": 0.9,
                "expected_return": 0.30,
                "holding_period": 1,
                "diversification": False,
                "key_factors": ["고수익", "타이밍", "정보력"]
            }
        }
        
    def _initialize_regional_data(self) -> Dict[str, Dict[str, Any]]:
        """지역별 특성 데이터 초기화"""
        return {
            "강남구": {
                "stability": 9,
                "growth_potential": 7,
                "liquidity": 10,
                "avg_yield": 0.02,
                "price_volatility": 0.15,
                "redevelopment_potential": 8,
                "infrastructure": 10,
                "education": 10,
                "characteristics": ["프리미엄", "안정성", "브랜드"],
                "suitable_for": [InvestorType.CONSERVATIVE, InvestorType.MODERATE]
            },
            "서초구": {
                "stability": 9,
                "growth_potential": 7,
                "liquidity": 9,
                "avg_yield": 0.025,
                "price_volatility": 0.12,
                "redevelopment_potential": 7,
                "infrastructure": 9,
                "education": 10,
                "characteristics": ["교육", "안정성", "인프라"],
                "suitable_for": [InvestorType.CONSERVATIVE, InvestorType.MODERATE]
            },
            "송파구": {
                "stability": 8,
                "growth_potential": 8,
                "liquidity": 8,
                "avg_yield": 0.03,
                "price_volatility": 0.18,
                "redevelopment_potential": 9,
                "infrastructure": 9,
                "education": 8,
                "characteristics": ["재개발", "성장성", "개발호재"],
                "suitable_for": [InvestorType.MODERATE, InvestorType.AGGRESSIVE]
            },
            "강동구": {
                "stability": 7,
                "growth_potential": 9,
                "liquidity": 7,
                "avg_yield": 0.04,
                "price_volatility": 0.25,
                "redevelopment_potential": 8,
                "infrastructure": 8,
                "education": 7,
                "characteristics": ["신도시", "개발호재", "성장성"],
                "suitable_for": [InvestorType.MODERATE, InvestorType.AGGRESSIVE]
            },
            "마포구": {
                "stability": 7,
                "growth_potential": 8,
                "liquidity": 8,
                "avg_yield": 0.035,
                "price_volatility": 0.20,
                "redevelopment_potential": 7,
                "infrastructure": 8,
                "education": 7,
                "characteristics": ["젊은층", "교통", "문화"],
                "suitable_for": [InvestorType.MODERATE, InvestorType.AGGRESSIVE]
            }
        }
        
    def _initialize_market_weights(self) -> Dict[str, float]:
        """시장 상황별 가중치 초기화"""
        return {
            "bull_market": {"growth": 0.4, "stability": 0.3, "yield": 0.3},
            "bear_market": {"growth": 0.2, "stability": 0.5, "yield": 0.3},
            "sideways": {"growth": 0.3, "stability": 0.4, "yield": 0.3},
            "recovery": {"growth": 0.45, "stability": 0.35, "yield": 0.2}
        }
        
    def create_investor_profile(self, profile_data: Dict[str, Any]) -> InvestorProfile:
        """투자자 프로필 생성"""
        profile = InvestorProfile(
            user_id=profile_data["user_id"],
            name=profile_data["name"],
            age=profile_data["age"],
            annual_income=profile_data["annual_income"],
            assets=profile_data["assets"],
            investment_budget=profile_data["investment_budget"],
            investor_type=InvestorType(profile_data["investor_type"]),
            investment_goal=InvestmentGoal(profile_data["investment_goal"]),
            investment_period=profile_data["investment_period"],
            risk_tolerance=profile_data["risk_tolerance"],
            preferred_regions=profile_data.get("preferred_regions", []),
            property_types=profile_data.get("property_types", ["아파트"]),
            experience_years=profile_data.get("experience_years", 0),
            previous_investments=profile_data.get("previous_investments", [])
        )
        
        # 프로필 저장
        self.user_profiles[profile.user_id] = profile
        
        # 프로필 검증 및 조정
        validated_profile = self._validate_and_adjust_profile(profile)
        
        return validated_profile
        
    def _validate_and_adjust_profile(self, profile: InvestorProfile) -> InvestorProfile:
        """프로필 검증 및 조정"""
        
        # 투자가능금액 검증
        max_investment = profile.assets * 0.7  # 총자산의 70% 한도
        if profile.investment_budget > max_investment:
            logger.warning(f"투자예산이 권장한도 초과. 조정: {profile.investment_budget} -> {max_investment}")
            profile.investment_budget = max_investment
            
        # 나이별 투자성향 조정
        if profile.age > 60 and profile.investor_type in [InvestorType.AGGRESSIVE, InvestorType.SPECULATIVE]:
            logger.warning("고령 투자자의 공격적 투자성향을 중위험으로 조정")
            profile.investor_type = InvestorType.MODERATE
            profile.risk_tolerance = min(profile.risk_tolerance, 6)
            
        # 경험연수별 조정
        if profile.experience_years < 2 and profile.investor_type == InvestorType.SPECULATIVE:
            logger.warning("투자경험 부족으로 투자성향을 적극형으로 조정")
            profile.investor_type = InvestorType.AGGRESSIVE
            
        return profile
        
    def generate_personalized_recommendation(self, user_id: str, 
                                           market_context: Dict[str, Any] = None) -> PersonalizedRecommendation:
        """개인화 투자 추천 생성"""
        
        if user_id not in self.user_profiles:
            raise ValueError(f"사용자 프로필을 찾을 수 없습니다: {user_id}")
            
        profile = self.user_profiles[user_id]
        
        # 1. 시장 상황 분석
        current_market = self._analyze_current_market(market_context)
        
        # 2. 개인 맞춤 지역 추천
        recommended_regions = self._recommend_regions(profile, current_market)
        
        # 3. 구체적 물건 제안
        property_suggestions = self._generate_property_suggestions(profile, recommended_regions)
        
        # 4. 투자 전략 수립
        investment_strategy = self._create_investment_strategy(profile, current_market)
        
        # 5. 리스크 분석
        risk_analysis = self._analyze_investment_risks(profile, property_suggestions)
        
        # 6. 예상 수익률 계산
        expected_return = self._calculate_expected_return(profile, property_suggestions, current_market)
        
        # 7. 실행 계획 수립
        action_plan = self._create_action_plan(profile, property_suggestions)
        
        # 8. 신뢰도 점수 계산
        confidence_score = self._calculate_confidence_score(profile, current_market, property_suggestions)
        
        # 9. 추천 근거 생성
        reasoning = self._generate_reasoning(profile, property_suggestions, investment_strategy)
        
        recommendation = PersonalizedRecommendation(
            recommendation_id=f"REC_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            user_id=user_id,
            property_suggestions=property_suggestions,
            investment_strategy=investment_strategy,
            risk_analysis=risk_analysis,
            expected_return=expected_return,
            confidence_score=confidence_score,
            reasoning=reasoning,
            action_plan=action_plan,
            created_at=datetime.now()
        )
        
        # 추천 이력 저장
        if user_id not in self.recommendation_history:
            self.recommendation_history[user_id] = []
        self.recommendation_history[user_id].append(recommendation)
        
        return recommendation
        
    def _analyze_current_market(self, market_context: Dict[str, Any] = None) -> str:
        """현재 시장 상황 분석"""
        if not market_context:
            # 기본 시장 상황 (실제로는 실시간 데이터 활용)
            return "recovery"  # 회복기
            
        sentiment_score = market_context.get("sentiment_score", 0)
        
        if sentiment_score > 30:
            return "bull_market"
        elif sentiment_score < -20:
            return "bear_market"
        elif -5 <= sentiment_score <= 5:
            return "sideways"
        else:
            return "recovery"
            
    def _recommend_regions(self, profile: InvestorProfile, market_condition: str) -> List[str]:
        """개인 맞춤 지역 추천"""
        suitable_regions = []
        
        for region, characteristics in self.regional_characteristics.items():
            # 투자성향에 맞는 지역인지 확인
            if profile.investor_type in characteristics["suitable_for"]:
                score = self._calculate_region_score(profile, region, characteristics, market_condition)
                suitable_regions.append((region, score))
                
        # 점수 순으로 정렬하여 상위 3개 지역 선택
        suitable_regions.sort(key=lambda x: x[1], reverse=True)
        return [region[0] for region in suitable_regions[:3]]
        
    def _calculate_region_score(self, profile: InvestorProfile, region: str, 
                               characteristics: Dict[str, Any], market_condition: str) -> float:
        """지역별 점수 계산"""
        
        strategy = self.investment_strategies[profile.investor_type]
        weights = self.market_weights[market_condition]
        
        # 기본 점수 계산
        stability_score = characteristics["stability"] * weights["stability"] * 0.3
        growth_score = characteristics["growth_potential"] * weights["growth"] * 0.4
        yield_score = characteristics["avg_yield"] * 1000 * weights["yield"] * 0.3
        
        base_score = stability_score + growth_score + yield_score
        
        # 개인 선호도 반영
        if region in profile.preferred_regions:
            base_score *= 1.2
            
        # 투자목표 반영
        if profile.investment_goal == InvestmentGoal.RESIDENCE:
            base_score += characteristics["education"] * 0.2
        elif profile.investment_goal == InvestmentGoal.REDEVELOPMENT:
            base_score += characteristics["redevelopment_potential"] * 0.3
        elif profile.investment_goal == InvestmentGoal.RENTAL_INCOME:
            base_score += characteristics["avg_yield"] * 1000 * 0.3
            
        # 리스크 허용도 반영
        volatility_penalty = characteristics["price_volatility"] * (10 - profile.risk_tolerance) * 0.1
        base_score -= volatility_penalty
        
        return max(0, base_score)
        
    def _generate_property_suggestions(self, profile: InvestorProfile, 
                                     regions: List[str]) -> List[Dict[str, Any]]:
        """구체적 물건 제안"""
        suggestions = []
        
        for region in regions:
            region_data = self.regional_characteristics[region]
            
            # 예산에 맞는 물건 제안
            budget_per_property = profile.investment_budget / len(regions)
            
            suggestion = {
                "region": region,
                "property_type": "아파트",
                "price_range": {
                    "min": budget_per_property * 0.8,
                    "max": budget_per_property * 1.2
                },
                "recommended_size": self._recommend_property_size(profile),
                "key_features": region_data["characteristics"],
                "investment_rationale": self._get_investment_rationale(profile, region),
                "expected_yield": region_data["avg_yield"],
                "risk_level": self._assess_property_risk(region_data, profile),
                "holding_period": self.investment_strategies[profile.investor_type]["holding_period"],
                "financing_strategy": self._suggest_financing(profile, budget_per_property)
            }
            
            suggestions.append(suggestion)
            
        return suggestions
        
    def _recommend_property_size(self, profile: InvestorProfile) -> str:
        """적정 면적 추천"""
        if profile.investment_goal == InvestmentGoal.RESIDENCE:
            if profile.age < 40:
                return "70-84평형 (3-4룸)"
            else:
                return "84-100평형 (4-5룸)"
        elif profile.investment_goal == InvestmentGoal.RENTAL_INCOME:
            return "50-70평형 (2-3룸) - 임대 선호도 높음"
        else:
            return "84평형 내외 (최다 거래 면적)"
            
    def _get_investment_rationale(self, profile: InvestorProfile, region: str) -> str:
        """투자 근거 설명"""
        region_data = self.regional_characteristics[region]
        
        if profile.investor_type == InvestorType.CONSERVATIVE:
            return f"{region}의 안정성과 브랜드 가치를 활용한 안전 투자"
        elif profile.investor_type == InvestorType.MODERATE:
            return f"{region}의 균형 잡힌 성장성과 안정성을 고려한 중도 투자"
        elif profile.investor_type == InvestorType.AGGRESSIVE:
            return f"{region}의 높은 성장 잠재력과 개발 호재를 노린 적극적 투자"
        else:
            return f"{region}의 고수익 기회와 단기 차익을 목표로 한 투기적 투자"
            
    def _assess_property_risk(self, region_data: Dict[str, Any], profile: InvestorProfile) -> str:
        """물건별 리스크 평가"""
        volatility = region_data["price_volatility"]
        
        if volatility < 0.15:
            return "낮음"
        elif volatility < 0.25:
            return "보통"
        else:
            return "높음"
            
    def _suggest_financing(self, profile: InvestorProfile, property_price: float) -> Dict[str, Any]:
        """자금조달 방안 제안"""
        strategy = self.investment_strategies[profile.investor_type]
        max_loan_ratio = strategy["max_leverage"]
        
        own_capital = property_price * (1 - max_loan_ratio)
        loan_amount = property_price * max_loan_ratio
        
        return {
            "total_price": property_price,
            "own_capital": own_capital,
            "loan_amount": loan_amount,
            "loan_ratio": max_loan_ratio,
            "recommended_loan_type": "주택담보대출" if loan_amount < 10 else "PF대출 검토",
            "estimated_interest_rate": 0.035,  # 3.5% 가정
            "monthly_payment": loan_amount * 0.004  # 월 대출상환액 추정
        }
        
    def _create_investment_strategy(self, profile: InvestorProfile, market_condition: str) -> str:
        """투자 전략 수립"""
        strategy_template = self.investment_strategies[profile.investor_type]
        
        base_strategy = f"""
**{profile.name}님을 위한 맞춤 투자 전략**

🎯 **투자 성향**: {profile.investor_type.value}
💰 **투자 예산**: {profile.investment_budget:.1f}억원
⏰ **투자 기간**: {profile.investment_period}년
🎪 **투자 목표**: {profile.investment_goal.value}

📊 **핵심 전략**:
- 위험도: {strategy_template['risk_level']}/4
- 예상 수익률: 연 {strategy_template['expected_return']*100:.0f}%
- 보유 기간: {strategy_template['holding_period']}년
- 최대 레버리지: {strategy_template['max_leverage']*100:.0f}%

🔑 **주요 고려사항**:
{chr(10).join('- ' + factor for factor in strategy_template['key_factors'])}

📈 **시장 대응**: 현재 {market_condition} 국면에서는 """

        if market_condition == "recovery":
            base_strategy += "회복 초기 진입으로 안정적 수익 추구"
        elif market_condition == "bull_market":
            base_strategy += "상승장 활용하되 고점 경계"
        elif market_condition == "bear_market":
            base_strategy += "하락장에서 선별적 저가 매수"
        else:
            base_strategy += "횡보장에서 임대수익 중심 운용"
            
        return base_strategy
        
    def _analyze_investment_risks(self, profile: InvestorProfile, 
                                properties: List[Dict[str, Any]]) -> Dict[str, Any]:
        """투자 리스크 분석"""
        
        total_investment = sum(prop["price_range"]["max"] for prop in properties)
        leverage_ratio = total_investment / profile.investment_budget if profile.investment_budget > 0 else 0
        
        # 리스크 요소들
        risks = {
            "market_risk": {
                "level": "보통",
                "description": "시장 변동에 따른 가격 하락 위험",
                "mitigation": "분산투자 및 장기보유"
            },
            "liquidity_risk": {
                "level": "낮음" if any("강남" in prop["region"] or "서초" in prop["region"] for prop in properties) else "보통",
                "description": "매각시 유동성 부족 위험",
                "mitigation": "인기 지역 위주 투자"
            },
            "leverage_risk": {
                "level": "높음" if leverage_ratio > 0.8 else "보통" if leverage_ratio > 0.6 else "낮음",
                "description": f"레버리지 비율 {leverage_ratio:.1f}배에 따른 금융 위험",
                "mitigation": "금리 변동 모니터링 및 여유자금 확보"
            },
            "concentration_risk": {
                "level": "높음" if len(set(prop["region"] for prop in properties)) == 1 else "낮음",
                "description": "특정 지역 집중투자 위험",
                "mitigation": "지역 분산 또는 시기 분산 투자"
            }
        }
        
        # 전체 리스크 레벨 계산
        risk_levels = {"낮음": 1, "보통": 2, "높음": 3}
        avg_risk = sum(risk_levels[risk["level"]] for risk in risks.values()) / len(risks)
        
        overall_risk = "낮음" if avg_risk < 1.5 else "보통" if avg_risk < 2.5 else "높음"
        
        return {
            "overall_risk": overall_risk,
            "detailed_risks": risks,
            "risk_score": avg_risk,
            "leverage_ratio": leverage_ratio,
            "diversification_score": len(set(prop["region"] for prop in properties)) / len(properties)
        }
        
    def _calculate_expected_return(self, profile: InvestorProfile, 
                                 properties: List[Dict[str, Any]], 
                                 market_condition: str) -> float:
        """예상 수익률 계산"""
        
        base_returns = []
        for prop in properties:
            region_data = self.regional_characteristics[prop["region"]]
            
            # 기본 수익률
            base_return = region_data["avg_yield"] * 2  # 임대수익의 2배를 시세차익으로 가정
            
            # 시장 상황 조정
            if market_condition == "bull_market":
                base_return *= 1.3
            elif market_condition == "recovery":
                base_return *= 1.1
            elif market_condition == "bear_market":
                base_return *= 0.7
                
            # 투자성향별 조정
            strategy = self.investment_strategies[profile.investor_type]
            base_return *= (1 + strategy["expected_return"])
            
            base_returns.append(base_return)
            
        # 가중평균 수익률
        avg_return = sum(base_returns) / len(base_returns)
        
        # 리스크 조정
        if profile.risk_tolerance < 5:
            avg_return *= 0.9  # 보수적 투자자는 10% 할인
            
        return min(avg_return, 0.5)  # 최대 50% 수익률로 제한
        
    def _create_action_plan(self, profile: InvestorProfile, 
                          properties: List[Dict[str, Any]]) -> List[str]:
        """실행 계획 수립"""
        
        plan = [
            "📋 **1단계: 사전 준비 (1-2주)**",
            "   - 투자자금 준비 및 대출 사전 승인",
            "   - 부동산 중개업소 및 전문가 네트워크 구축",
            "   - 투자 지역 현장 답사 및 시장 조사",
            "",
            "🔍 **2단계: 물건 탐색 (2-4주)**"
        ]
        
        for i, prop in enumerate(properties, 1):
            plan.append(f"   - {prop['region']} {prop['property_type']} 매물 조사")
            plan.append(f"   - 가격대: {prop['price_range']['min']:.1f}-{prop['price_range']['max']:.1f}억원")
            
        plan.extend([
            "",
            "💰 **3단계: 투자 실행 (1-2주)**",
            "   - 우선순위 물건 계약 체결",
            "   - 대출 실행 및 잔금 지급",
            "   - 소유권 이전 및 세무 신고",
            "",
            "📊 **4단계: 사후 관리**",
            "   - 월별 시장 동향 모니터링",
            "   - 분기별 투자 성과 점검",
            f"   - {profile.investment_period}년 후 출구전략 검토"
        ])
        
        return plan
        
    def _calculate_confidence_score(self, profile: InvestorProfile, 
                                  market_condition: str, 
                                  properties: List[Dict[str, Any]]) -> float:
        """신뢰도 점수 계산"""
        
        # 기본 신뢰도
        base_confidence = 0.7
        
        # 프로필 완성도
        profile_completeness = 0.8  # 가정
        
        # 시장 조건 적합성
        market_fit = 0.8 if market_condition == "recovery" else 0.6
        
        # 지역 다양성
        region_diversity = len(set(prop["region"] for prop in properties)) / len(properties)
        
        # 투자 경험
        experience_factor = min(profile.experience_years / 10, 1.0)
        
        # 종합 신뢰도 계산
        confidence = (
            base_confidence * 0.3 +
            profile_completeness * 0.2 +
            market_fit * 0.2 +
            region_diversity * 0.1 +
            experience_factor * 0.2
        )
        
        return min(max(confidence, 0.5), 0.95)  # 50%-95% 범위로 제한
        
    def _generate_reasoning(self, profile: InvestorProfile, 
                          properties: List[Dict[str, Any]], 
                          strategy: str) -> str:
        """추천 근거 생성"""
        
        reasoning = f"""
🧠 **{profile.name}님을 위한 맞춤 분석 근거**

👤 **투자자 특성 분석**:
- 연령: {profile.age}세, 투자성향: {profile.investor_type.value}
- 투자경험: {profile.experience_years}년, 위험감수도: {profile.risk_tolerance}/10
- 투자목표: {profile.investment_goal.value}, 기간: {profile.investment_period}년

🎯 **추천 근거**:
1. **성향 매칭**: {profile.investor_type.value} 투자자에게 적합한 안정성과 수익성 균형
2. **예산 최적화**: {profile.investment_budget:.1f}억원 예산을 {len(properties)}개 지역에 분산 배치
3. **목표 연계**: {profile.investment_goal.value} 목표에 부합하는 지역 및 물건 선정

🏠 **선정 지역 분석**:
"""
        
        for prop in properties:
            region_data = self.regional_characteristics[prop["region"]]
            reasoning += f"""
- **{prop['region']}**: {', '.join(region_data['characteristics'])}
  └ 안정성 {region_data['stability']}/10, 성장성 {region_data['growth_potential']}/10
"""
        
        reasoning += f"""
⚠️ **리스크 관리**:
- 투자자 위험감수도({profile.risk_tolerance}/10)에 맞춘 적정 리스크 수준 유지
- 레버리지 {self.investment_strategies[profile.investor_type]['max_leverage']*100:.0f}% 이하로 안전마진 확보
- 유동성 높은 지역 우선 선정으로 출구전략 다각화

💡 **차별화 포인트**:
- 개인 투자 이력과 선호도 반영한 맞춤형 포트폴리오
- 현재 시장 사이클과 개인 투자기간의 최적 조합
- AI 기반 데이터 분석과 전문가 경험의 융합
        """
        
        return reasoning.strip()
        
    def get_recommendation_summary(self, user_id: str) -> Dict[str, Any]:
        """추천 요약 정보 조회"""
        if user_id not in self.recommendation_history:
            return {"error": "추천 이력이 없습니다"}
            
        latest_rec = self.recommendation_history[user_id][-1]
        profile = self.user_profiles[user_id]
        
        return {
            "user_profile": {
                "name": profile.name,
                "investor_type": profile.investor_type.value,
                "investment_budget": profile.investment_budget,
                "investment_goal": profile.investment_goal.value
            },
            "recommendation_summary": {
                "total_properties": len(latest_rec.property_suggestions),
                "target_regions": [prop["region"] for prop in latest_rec.property_suggestions],
                "expected_return": f"{latest_rec.expected_return*100:.1f}%",
                "overall_risk": latest_rec.risk_analysis["overall_risk"],
                "confidence_score": f"{latest_rec.confidence_score*100:.1f}%"
            },
            "next_actions": latest_rec.action_plan[:3],  # 처음 3개 액션만
            "recommendation_date": latest_rec.created_at.strftime("%Y-%m-%d %H:%M")
        }


# 사용 예시
if __name__ == "__main__":
    # 개인화 투자 어드바이저 초기화
    advisor = PersonalizedInvestmentAdvisor()
    
    # 샘플 투자자 프로필
    sample_profile = {
        "user_id": "user_001",
        "name": "김투자",
        "age": 35,
        "annual_income": 1.2,
        "assets": 5.0,
        "investment_budget": 3.0,
        "investor_type": "중위험중수익형",
        "investment_goal": "자산증식",
        "investment_period": 3,
        "risk_tolerance": 7,
        "preferred_regions": ["강남구", "서초구"],
        "property_types": ["아파트"],
        "experience_years": 2,
        "previous_investments": []
    }
    
    # 프로필 생성
    profile = advisor.create_investor_profile(sample_profile)
    print(f"프로필 생성 완료: {profile.name} ({profile.investor_type.value})")
    
    # 개인화 추천 생성
    recommendation = advisor.generate_personalized_recommendation(
        "user_001", 
        {"sentiment_score": 15, "market_phase": "recovery"}
    )
    
    print(f"\n추천 ID: {recommendation.recommendation_id}")
    print(f"예상 수익률: {recommendation.expected_return*100:.1f}%")
    print(f"신뢰도: {recommendation.confidence_score*100:.1f}%")
    print(f"추천 지역: {[prop['region'] for prop in recommendation.property_suggestions]}")
    
    # 추천 요약 조회
    summary = advisor.get_recommendation_summary("user_001")
    print(f"\n=== 추천 요약 ===")
    print(json.dumps(summary, indent=2, ensure_ascii=False)) 