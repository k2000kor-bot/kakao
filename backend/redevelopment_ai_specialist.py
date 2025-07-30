import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
import logging
from pathlib import Path
import math
from contribution_calculator import ContributionCalculator
from union_governance_system import UnionGovernanceSystem
from real_estate_expert_system import RealEstateExpertSystem
from comprehensive_real_estate_system import ComprehensiveRealEstateSystem
from market_sentiment_analysis import MarketSentimentAnalyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class RedevelopmentProject:
    """재개발 프로젝트"""
    id: str
    name: str
    location: str
    project_type: str  # 'reconstruction', 'redevelopment', 'new_town'
    current_phase: str  # 'planning', 'approval', 'construction', 'completion'
    total_area: float  # 총 면적 (㎡)
    building_count: int  # 동수
    household_count: int  # 세대수
    expected_cost: float  # 예상 사업비 (억원)
    expected_duration: int  # 예상 기간 (개월)
    risk_level: str  # 'low', 'medium', 'high', 'critical'
    legal_status: Dict[str, Any]  # 법적 현황
    economic_analysis: Dict[str, Any]  # 경제성 분석
    stakeholders: List[Dict[str, Any]]  # 이해관계자
    created_at: str
    updated_at: str


@dataclass
class LegalRequirement:
    """법적 요구사항"""
    law_name: str
    article: str
    requirement: str
    compliance_status: str
    deadline: Optional[str]
    responsible_party: str
    priority: int


@dataclass
class RiskAssessment:
    """위험 평가"""
    category: str
    description: str
    probability: float  # 0.0 ~ 1.0
    impact: float  # 0.0 ~ 1.0
    risk_score: float
    mitigation_strategy: str
    monitoring_method: str


@dataclass
class EconomicAnalysis:
    """경제성 분석"""
    total_project_cost: float
    land_acquisition_cost: float
    construction_cost: float
    administrative_cost: float
    expected_revenue: float
    profit_margin: float
    roi: float  # Return on Investment
    payback_period: int  # months
    npv: float  # Net Present Value
    irr: float  # Internal Rate of Return


class RedevelopmentAISpecialist:
    """재건축/재개발 전문 AI 시스템"""
    
    def __init__(self, data_dir: str = "redevelopment_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # 전문 지식 베이스 초기화
        self.legal_framework = self._initialize_legal_framework()
        self.procedural_knowledge = self._initialize_procedural_knowledge()
        self.risk_patterns = self._initialize_risk_patterns()
        self.economic_models = self._initialize_economic_models()
        self.case_studies = self._load_case_studies()
        
        # 분담금 전문 계산기 추가
        self.contribution_calculator = ContributionCalculator()
        
        # 조합 운영 전문 시스템 추가
        self.governance_system = UnionGovernanceSystem()
        
        # 부동산 전문가 시스템 추가
        self.real_estate_expert = RealEstateExpertSystem()
        
        # 종합 부동산 전문가 시스템 추가
        self.comprehensive_real_estate = ComprehensiveRealEstateSystem()
        
        # 시장 여론 분석 시스템 추가
        self.market_sentiment = MarketSentimentAnalyzer()
        
    def _initialize_legal_framework(self) -> Dict[str, Any]:
        """법적 프레임워크 초기화"""
        return {
            "도시정비법": {
                "정비구역지정": {
                    "요건": ["노후불량건축물 2/3 이상", "기반시설 부족", "주거환경 불량"],
                    "절차": ["기초조사", "주민설명회", "구역지정신청", "심의위원회", "구역지정고시"],
                    "소요기간": "6-12개월",
                    "핵심조건": "조합설립동의 75% 이상"
                },
                "정비계획수립": {
                    "요건": ["토지등소유자 과반수 동의", "토지면적 과반수 동의"],
                    "절차": ["정비계획수립", "주민공람", "지방의회의견청취", "정비계획결정고시"],
                    "소요기간": "4-8개월",
                    "핵심조건": "건축법, 도시계획법 준수"
                },
                "사업시행": {
                    "요건": ["조합설립인가", "사업시행인가", "관리처분계획"],
                    "절차": ["시공사선정", "자금조달", "철거", "신축공사", "준공"],
                    "소요기간": "24-48개월",
                    "핵심조건": "분담금 납부, 이주대책 수립"
                }
            },
            "건축법": {
                "건축허가": {
                    "건폐율": "지역별 상한선 준수",
                    "용적률": "지역별 상한선 준수",
                    "높이제한": "지구단위계획, 경관계획 고려",
                    "일조권": "동지일 기준 최소 2시간 확보"
                },
                "안전기준": {
                    "내진설계": "설계진도 0.11g 이상",
                    "피난시설": "2방향 피난통로 확보",
                    "소방시설": "스프링클러, 경보설비 설치"
                }
            },
            "환경영향평가법": {
                "평가대상": "연면적 10만㎡ 이상 또는 500세대 이상",
                "평가항목": ["대기질", "수질", "소음진동", "생태환경", "경관"],
                "소요기간": "6-12개월",
                "협의내용": "저감방안, 모니터링계획 수립"
            }
        }
        
    def _initialize_procedural_knowledge(self) -> Dict[str, Any]:
        """절차적 지식 초기화"""
        return {
            "재건축절차": {
                "1단계_추진위구성": {
                    "목적": "사업 추진을 위한 주민 조직화",
                    "요건": "세대수 10분의 1 이상 동의",
                    "활동": ["주민설명회", "찬반투표", "추진위원 선출"],
                    "소요기간": "2-4개월",
                    "주의사항": "반대 주민과의 갈등 관리 필요"
                },
                "2단계_정비구역지정": {
                    "목적": "법적 사업구역 설정",
                    "요건": ["안전진단 D,E등급", "노후도 기준 충족"],
                    "활동": ["안전진단 신청", "기초조사", "구역지정 신청"],
                    "소요기간": "6-12개월",
                    "주의사항": "인근 지역 민원 대응"
                },
                "3단계_조합설립": {
                    "목적": "사업시행 주체 설립",
                    "요건": "조합원 동의 75% 이상",
                    "활동": ["조합설립인가 신청", "이사 선출", "규약 제정"],
                    "소요기간": "3-6개월",
                    "주의사항": "조합 내부 의견 통일"
                },
                "4단계_사업시행인가": {
                    "목적": "실제 건축공사 허가",
                    "요건": ["관리처분계획 수립", "시공사 선정"],
                    "활동": ["설계", "인허가", "시공사 계약"],
                    "소요기간": "12-18개월",
                    "주의사항": "분담금 확정 및 조달"
                },
                "5단계_시공": {
                    "목적": "기존 건물 철거 및 신축",
                    "요건": ["이주대책 수립", "안전관리계획"],
                    "활동": ["철거", "신축공사", "조경", "부대시설"],
                    "소요기간": "24-36개월",
                    "주의사항": "공사 안전관리, 민원 대응"
                }
            },
            "재개발절차": {
                "특징": "토지와 건물을 함께 정비",
                "차이점": "토지소유자와 세입자 모두 고려",
                "추가절차": ["세입자 대책", "상가 영업손실 보상"],
                "복잡도": "재건축 대비 1.5배 복잡"
            }
        }
        
    def _initialize_risk_patterns(self) -> Dict[str, List[Dict[str, Any]]]:
        """위험 패턴 초기화"""
        return {
            "법적위험": [
                {
                    "위험요소": "인허가 지연",
                    "발생확률": 0.4,
                    "영향도": 0.8,
                    "원인": ["법규 변경", "민원 발생", "서류 미비"],
                    "대응방안": "사전 법률 검토, 전문가 자문"
                },
                {
                    "위험요소": "조합원 갈등",
                    "발생확률": 0.6,
                    "영향도": 0.7,
                    "원인": ["분담금 문제", "설계 변경", "분양가 상승"],
                    "대응방안": "충분한 설명, 투명한 소통"
                }
            ],
            "경제적위험": [
                {
                    "위험요소": "건설비 상승",
                    "발생확률": 0.7,
                    "영향도": 0.9,
                    "원인": ["자재비 상승", "인건비 상승", "설계 변경"],
                    "대응방안": "고정가격계약, 리스크 분담 조항"
                },
                {
                    "위험요소": "분양률 저조",
                    "발생확률": 0.3,
                    "영향도": 0.8,
                    "원인": ["시장 침체", "입지 조건", "설계 부적절"],
                    "대응방안": "시장조사 강화, 마케팅 전략 수립"
                }
            ],
            "기술적위험": [
                {
                    "위험요소": "지반 문제",
                    "발생확률": 0.2,
                    "영향도": 0.9,
                    "원인": ["지반조사 부족", "연약지반", "지하수"],
                    "대응방안": "정밀 지반조사, 지반개량 계획"
                }
            ]
        }
        
    def _initialize_economic_models(self) -> Dict[str, Any]:
        """경제성 모델 초기화"""
        return {
            "비용구조": {
                "토지비": {"비율": 0.25, "변동성": "중간"},
                "건축비": {"비율": 0.45, "변동성": "높음"},
                "설계비": {"비율": 0.03, "변동성": "낮음"},
                "인허가비": {"비율": 0.02, "변동성": "낮음"},
                "금융비용": {"비율": 0.08, "변동성": "중간"},
                "사업관리비": {"비율": 0.05, "변동성": "낮음"},
                "마케팅비": {"비율": 0.03, "변동성": "낮음"},
                "예비비": {"비율": 0.09, "변동성": "높음"}
            },
            "수익구조": {
                "일반분양": {"비율": 0.6, "수익률": "시세 연동"},
                "조합원분양": {"비율": 0.4, "수익률": "원가 기준"},
                "상가임대": {"비율": 0.05, "수익률": "임대료 기준"}
            },
            "민감도분석": {
                "분양가변동": {"1%상승시": "수익률 3% 증가"},
                "건축비변동": {"1%상승시": "수익률 1.8% 감소"},
                "금리변동": {"1%p상승시": "수익률 2% 감소"}
            }
        }
        
    def _load_case_studies(self) -> List[Dict[str, Any]]:
        """사례 연구 로드"""
        return [
            {
                "프로젝트명": "강남구 대치동 재건축",
                "규모": "15개동 1,200세대",
                "기간": "2018-2023 (5년)",
                "사업비": "8,500억원",
                "성공요인": ["입지 우수", "조합원 단합", "시공사 신뢰도"],
                "어려움": ["분담금 상승", "코로나19 영향"],
                "교훈": "충분한 예비비 확보 필요"
            },
            {
                "프로젝트명": "송파구 잠실 재개발",
                "규모": "12개동 980세대",
                "기간": "2019-2024 (5년)",
                "사업비": "6,200억원",
                "성공요인": ["대중교통 접근성", "브랜드 아파트"],
                "어려움": ["상가 영업손실 보상", "교통 혼잡"],
                "교훈": "상가 대책 사전 수립 중요"
            }
        ]
        
    def analyze_project_feasibility(self, project_info: Dict[str, Any]) -> Dict[str, Any]:
        """프로젝트 사업성 분석"""
        
        # 기본 정보 추출
        location = project_info.get("location", "")
        area = project_info.get("area", 0)
        household_count = project_info.get("household_count", 0)
        project_type = project_info.get("type", "reconstruction")
        
        # 입지 분석
        location_analysis = self._analyze_location(location)
        
        # 경제성 분석
        economic_analysis = self._perform_economic_analysis(project_info)
        
        # 법적 요구사항 검토
        legal_requirements = self._check_legal_requirements(project_info)
        
        # 위험 평가
        risk_assessment = self._assess_project_risks(project_info)
        
        # 일정 예측
        schedule_prediction = self._predict_schedule(project_info)
        
        # 종합 점수 계산
        feasibility_score = self._calculate_feasibility_score(
            location_analysis, economic_analysis, legal_requirements, risk_assessment
        )
        
        return {
            "feasibility_score": feasibility_score,
            "location_analysis": location_analysis,
            "economic_analysis": economic_analysis,
            "legal_requirements": legal_requirements,
            "risk_assessment": risk_assessment,
            "schedule_prediction": schedule_prediction,
            "recommendations": self._generate_recommendations(feasibility_score, risk_assessment),
            "next_steps": self._suggest_next_steps(project_info, feasibility_score)
        }
        
    def _analyze_location(self, location: str) -> Dict[str, Any]:
        """입지 분석"""
        # 실제로는 GIS 데이터, 부동산 데이터 등을 활용
        location_factors = {
            "교통접근성": self._assess_transportation(location),
            "교육환경": self._assess_education(location),
            "상업시설": self._assess_commercial(location),
            "의료시설": self._assess_medical(location),
            "개발계획": self._assess_development_plan(location)
        }
        
        # 가중평균으로 종합 점수 계산
        weights = {"교통접근성": 0.3, "교육환경": 0.25, "상업시설": 0.2, "의료시설": 0.1, "개발계획": 0.15}
        overall_score = sum(location_factors[factor] * weights[factor] for factor in location_factors)
        
        return {
            "overall_score": overall_score,
            "factors": location_factors,
            "strengths": self._identify_location_strengths(location_factors),
            "weaknesses": self._identify_location_weaknesses(location_factors)
        }
        
    def _assess_transportation(self, location: str) -> float:
        """교통 접근성 평가"""
        # 지하철역 거리, 버스 노선, 도로 접근성 등 고려
        if "강남" in location or "서초" in location:
            return 0.9
        elif "송파" in location or "강동" in location:
            return 0.8
        elif "마포" in location or "용산" in location:
            return 0.85
        else:
            return 0.6
            
    def _assess_education(self, location: str) -> float:
        """교육 환경 평가"""
        # 학군, 학교 거리, 사교육 시설 등 고려
        if "강남" in location:
            return 0.95
        elif "서초" in location:
            return 0.9
        elif "송파" in location:
            return 0.85
        else:
            return 0.7
            
    def _assess_commercial(self, location: str) -> float:
        """상업 시설 평가"""
        if "강남" in location or "명동" in location:
            return 0.9
        elif "홍대" in location or "건대" in location:
            return 0.8
        else:
            return 0.6
            
    def _assess_medical(self, location: str) -> float:
        """의료 시설 평가"""
        if "강남" in location or "서초" in location:
            return 0.85
        else:
            return 0.7
            
    def _assess_development_plan(self, location: str) -> float:
        """개발 계획 평가"""
        # GTX, 지하철 연장, 신도시 개발 등 고려
        if "GTX" in location or "신도시" in location:
            return 0.9
        else:
            return 0.6
            
    def _perform_economic_analysis(self, project_info: Dict[str, Any]) -> EconomicAnalysis:
        """경제성 분석 수행"""
        area = project_info.get("area", 0)
        household_count = project_info.get("household_count", 0)
        location = project_info.get("location", "")
        
        # 기본 비용 산정 (평균 단가 기준)
        land_unit_price = self._get_land_unit_price(location)
        construction_unit_price = 3.5  # 평당 350만원 (평균)
        
        land_cost = area * land_unit_price
        construction_cost = household_count * 40 * construction_unit_price  # 40평 기준
        administrative_cost = (land_cost + construction_cost) * 0.15
        total_cost = land_cost + construction_cost + administrative_cost
        
        # 예상 수익 산정
        sale_unit_price = self._get_sale_unit_price(location)
        expected_revenue = household_count * 40 * sale_unit_price
        
        # 수익성 지표 계산
        profit = expected_revenue - total_cost
        profit_margin = profit / expected_revenue if expected_revenue > 0 else 0
        roi = profit / total_cost if total_cost > 0 else 0
        
        # NPV, IRR 계산 (간단한 모델)
        cash_flows = [-total_cost * 0.3, -total_cost * 0.4, -total_cost * 0.3 + expected_revenue]
        npv = self._calculate_npv(cash_flows, 0.05)  # 5% 할인율
        irr = self._calculate_irr(cash_flows)
        
        payback_period = 36 if roi > 0.2 else 48  # 개월
        
        return EconomicAnalysis(
            total_project_cost=total_cost,
            land_acquisition_cost=land_cost,
            construction_cost=construction_cost,
            administrative_cost=administrative_cost,
            expected_revenue=expected_revenue,
            profit_margin=profit_margin,
            roi=roi,
            payback_period=payback_period,
            npv=npv,
            irr=irr
        )
        
    def _get_land_unit_price(self, location: str) -> float:
        """지역별 토지 단가 (평당 억원)"""
        if "강남" in location:
            return 2.5
        elif "서초" in location:
            return 2.0
        elif "송파" in location:
            return 1.8
        else:
            return 1.2
            
    def _get_sale_unit_price(self, location: str) -> float:
        """지역별 분양 단가 (평당 억원)"""
        if "강남" in location:
            return 3.5
        elif "서초" in location:
            return 3.0
        elif "송파" in location:
            return 2.8
        else:
            return 2.0
            
    def _calculate_npv(self, cash_flows: List[float], discount_rate: float) -> float:
        """순현재가치 계산"""
        npv = 0
        for i, cf in enumerate(cash_flows):
            npv += cf / ((1 + discount_rate) ** i)
        return npv
        
    def _calculate_irr(self, cash_flows: List[float]) -> float:
        """내부수익률 계산 (근사치)"""
        # 간단한 이분법으로 IRR 근사 계산
        for rate in [i/100 for i in range(1, 50)]:
            npv = sum(cf / ((1 + rate) ** i) for i, cf in enumerate(cash_flows))
            if npv <= 0:
                return rate
        return 0.0
        
    def _check_legal_requirements(self, project_info: Dict[str, Any]) -> List[LegalRequirement]:
        """법적 요구사항 검토"""
        requirements = []
        
        area = project_info.get("area", 0)
        household_count = project_info.get("household_count", 0)
        project_type = project_info.get("type", "reconstruction")
        
        # 필수 법적 요구사항들
        if project_type == "reconstruction":
            requirements.extend([
                LegalRequirement(
                    law_name="도시 및 주거환경정비법",
                    article="제8조",
                    requirement="안전진단 D,E등급 또는 30년 이상 노후건축물",
                    compliance_status="확인필요",
                    deadline=None,
                    responsible_party="조합",
                    priority=1
                ),
                LegalRequirement(
                    law_name="도시 및 주거환경정비법",
                    article="제16조",
                    requirement="조합설립 동의 75% 이상",
                    compliance_status="진행중",
                    deadline="구역지정 후 2년 이내",
                    responsible_party="조합",
                    priority=1
                )
            ])
            
        if area > 10000:  # 1만㎡ 이상
            requirements.append(
                LegalRequirement(
                    law_name="환경영향평가법",
                    article="제22조",
                    requirement="환경영향평가 실시",
                    compliance_status="미실시",
                    deadline="사업시행인가 전",
                    responsible_party="사업시행자",
                    priority=2
                )
            )
            
        if household_count > 300:  # 300세대 이상
            requirements.append(
                LegalRequirement(
                    law_name="주택법",
                    article="제64조",
                    requirement="임대주택 건설 의무",
                    compliance_status="계획필요",
                    deadline="분양 전",
                    responsible_party="사업시행자",
                    priority=2
                )
            )
            
        return requirements
        
    def _assess_project_risks(self, project_info: Dict[str, Any]) -> List[RiskAssessment]:
        """프로젝트 위험 평가"""
        risks = []
        
        # 일반적인 재개발 위험들을 프로젝트 특성에 맞게 평가
        for category, risk_list in self.risk_patterns.items():
            for risk_data in risk_list:
                # 프로젝트 특성에 따라 확률과 영향도 조정
                adjusted_prob = self._adjust_risk_probability(risk_data, project_info)
                adjusted_impact = self._adjust_risk_impact(risk_data, project_info)
                
                risk = RiskAssessment(
                    category=category,
                    description=risk_data["위험요소"],
                    probability=adjusted_prob,
                    impact=adjusted_impact,
                    risk_score=adjusted_prob * adjusted_impact,
                    mitigation_strategy=risk_data["대응방안"],
                    monitoring_method=f"{risk_data['위험요소']} 정기 모니터링"
                )
                risks.append(risk)
                
        # 위험도 순으로 정렬
        return sorted(risks, key=lambda x: x.risk_score, reverse=True)
        
    def _adjust_risk_probability(self, risk_data: Dict[str, Any], project_info: Dict[str, Any]) -> float:
        """프로젝트 특성에 따른 위험 확률 조정"""
        base_prob = risk_data["발생확률"]
        
        # 프로젝트 규모에 따른 조정
        household_count = project_info.get("household_count", 0)
        if household_count > 1000:
            base_prob *= 1.2  # 대규모 프로젝트는 위험 증가
        elif household_count < 300:
            base_prob *= 0.8  # 소규모 프로젝트는 위험 감소
            
        # 입지에 따른 조정
        location = project_info.get("location", "")
        if "강남" in location or "서초" in location:
            if "분양률" in risk_data["위험요소"]:
                base_prob *= 0.5  # 좋은 입지는 분양위험 낮음
                
        return min(base_prob, 1.0)
        
    def _adjust_risk_impact(self, risk_data: Dict[str, Any], project_info: Dict[str, Any]) -> float:
        """프로젝트 특성에 따른 위험 영향도 조정"""
        base_impact = risk_data["영향도"]
        
        # 사업비 규모에 따른 조정
        estimated_cost = project_info.get("estimated_cost", 1000)  # 기본값 1000억
        if estimated_cost > 5000:
            base_impact *= 1.1  # 대규모 사업은 영향도 증가
            
        return min(base_impact, 1.0)
        
    def _predict_schedule(self, project_info: Dict[str, Any]) -> Dict[str, Any]:
        """일정 예측"""
        project_type = project_info.get("type", "reconstruction")
        household_count = project_info.get("household_count", 0)
        
        # 기본 일정 (개월)
        base_schedule = {
            "추진위구성": 3,
            "정비구역지정": 9,
            "조합설립": 6,
            "사업시행인가": 15,
            "시공": 30
        }
        
        # 규모에 따른 조정
        if household_count > 1000:
            for phase in base_schedule:
                base_schedule[phase] = int(base_schedule[phase] * 1.3)
        elif household_count > 500:
            for phase in base_schedule:
                base_schedule[phase] = int(base_schedule[phase] * 1.1)
                
        # 재개발의 경우 추가 시간
        if project_type == "redevelopment":
            base_schedule["상가대책"] = 6
            base_schedule["세입자대책"] = 4
            
        total_months = sum(base_schedule.values())
        
        return {
            "phase_schedule": base_schedule,
            "total_duration": total_months,
            "expected_completion": (datetime.now() + timedelta(days=total_months*30)).strftime("%Y-%m"),
            "critical_path": ["정비구역지정", "사업시행인가", "시공"],
            "risk_factors": ["인허가 지연", "조합원 갈등", "공사 지연"]
        }
        
    def analyze_contribution_impact(self, project_info: Dict[str, Any], 
                                   member_profiles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """분담금 영향 분석"""
        
        # 각 조합원별 분담금 계산
        contribution_results = []
        total_contribution = 0
        
        for member in member_profiles:
            contribution = self.contribution_calculator.calculate_contribution(member, project_info)
            contribution_results.append({
                "member_id": member.get("member_id", ""),
                "current_area": contribution.current_house_area,
                "new_area": contribution.new_house_area,
                "contribution": contribution.total_contribution,
                "reductions": len(contribution.reduction_benefits),
                "payment_months": len(contribution.payment_schedule)
            })
            total_contribution += contribution.total_contribution
            
        # 통계 분석
        contributions = [r["contribution"] for r in contribution_results]
        avg_contribution = sum(contributions) / len(contributions) if contributions else 0
        max_contribution = max(contributions) if contributions else 0
        min_contribution = min(contributions) if contributions else 0
        
        # 부담 수준 분석
        burden_analysis = self._analyze_contribution_burden(contributions, member_profiles)
        
        # 시나리오 분석
        scenarios = self.contribution_calculator.analyze_contribution_scenarios(project_info)
        
        return {
            "summary": {
                "total_members": len(member_profiles),
                "total_contribution": total_contribution,
                "average_contribution": avg_contribution,
                "max_contribution": max_contribution,
                "min_contribution": min_contribution
            },
            "individual_results": contribution_results,
            "burden_analysis": burden_analysis,
            "scenarios": [
                {
                    "name": s.scenario_name,
                    "description": s.description,
                    "contribution_range": s.total_contribution_range,
                    "payment_period": s.payment_period
                }
                for s in scenarios
            ],
            "recommendations": self._generate_contribution_recommendations(burden_analysis, scenarios)
        }
        
    def _analyze_contribution_burden(self, contributions: List[float], 
                                   member_profiles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """분담금 부담 수준 분석"""
        
        # 소득 대비 분담금 비율 분석 (가정)
        high_burden_count = 0  # 연소득 대비 100% 이상
        medium_burden_count = 0  # 50~100%
        low_burden_count = 0  # 50% 미만
        
        for i, contribution in enumerate(contributions):
            estimated_income = member_profiles[i].get("estimated_income", 1.0)  # 추정 연소득 (억원)
            burden_ratio = contribution / estimated_income if estimated_income > 0 else 2.0
            
            if burden_ratio >= 1.0:
                high_burden_count += 1
            elif burden_ratio >= 0.5:
                medium_burden_count += 1
            else:
                low_burden_count += 1
                
        # 고령자 부담 분석
        elderly_burden = self._analyze_elderly_burden(contributions, member_profiles)
        
        return {
            "burden_distribution": {
                "high_burden": high_burden_count,
                "medium_burden": medium_burden_count,
                "low_burden": low_burden_count
            },
            "elderly_burden": elderly_burden,
            "risk_level": "high" if high_burden_count > len(contributions) * 0.3 else "medium" if high_burden_count > 0 else "low"
        }
        
    def _analyze_elderly_burden(self, contributions: List[float], 
                               member_profiles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """고령자 분담금 부담 분석"""
        
        elderly_members = [
            (contrib, profile) for contrib, profile in zip(contributions, member_profiles)
            if profile.get("age", 0) >= 65
        ]
        
        if not elderly_members:
            return {"count": 0, "average_burden": 0, "needs_support": 0}
            
        elderly_contributions = [contrib for contrib, _ in elderly_members]
        avg_elderly_burden = sum(elderly_contributions) / len(elderly_contributions)
        
        # 지원 필요 고령자 (2억원 이상 부담)
        needs_support = sum(1 for contrib in elderly_contributions if contrib >= 2.0)
        
        return {
            "count": len(elderly_members),
            "average_burden": avg_elderly_burden,
            "needs_support": needs_support,
            "support_programs": [
                "고령자 분담금 경감 신청",
                "조합 자체 지원 프로그램",
                "저금리 대출 상품 안내",
                "분할납부 연장 검토"
            ]
        }
        
    def _generate_contribution_recommendations(self, burden_analysis: Dict[str, Any], 
                                             scenarios: List) -> List[str]:
        """분담금 관련 권장사항"""
        
        recommendations = []
        
        # 부담 수준에 따른 권장사항
        if burden_analysis["risk_level"] == "high":
            recommendations.extend([
                "분담금 부담이 높은 조합원을 위한 특별 지원책 마련 필요",
                "정부/지자체 경감 프로그램 적극 활용",
                "조합 차원의 분할납부 기간 연장 검토",
                "저금리 단체대출 상품 협상 추진"
            ])
        elif burden_analysis["risk_level"] == "medium":
            recommendations.extend([
                "분담금 경감 대상자 사전 파악 및 신청 지원",
                "금융기관과 우대금리 협상",
                "분담금 분할납부 옵션 제공"
            ])
            
        # 고령자 관련 권장사항
        elderly_info = burden_analysis.get("elderly_burden", {})
        if elderly_info.get("needs_support", 0) > 0:
            recommendations.extend([
                f"{elderly_info['needs_support']}명의 고령자에게 특별 지원 필요",
                "고령자 대상 분담금 상담창구 운영",
                "가족 지원 방안 모색 및 안내"
            ])
            
        # 시나리오별 대비책
        recommendations.extend([
            "분담금 상승에 대비한 예비 자금 확보 방안 마련",
            "시장 상황 변화에 따른 분담금 조정 메커니즘 구축",
            "조합원 대상 분담금 교육 및 상담 프로그램 운영"
        ])
        
        return recommendations
        
    def analyze_union_governance(self, governance_issue: str, 
                                union_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """조합 운영 분석"""
        
        # 거버넌스 이슈 분석
        issue_analysis = self.governance_system.analyze_governance_issue(
            governance_issue, union_context
        )
        
        # 재개발 맥락에서의 추가 분석
        redevelopment_impact = self._analyze_redevelopment_impact(issue_analysis)
        
        # 해결 우선순위 평가
        priority_assessment = self._assess_resolution_priority(issue_analysis)
        
        return {
            "governance_analysis": issue_analysis,
            "redevelopment_impact": redevelopment_impact,
            "priority_assessment": priority_assessment,
            "integrated_recommendations": self._generate_integrated_recommendations(
                issue_analysis, redevelopment_impact
            )
        }
        
    def _analyze_redevelopment_impact(self, issue_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """재개발 사업에 미치는 영향 분석"""
        
        issue_type = issue_analysis.get("issue_type", "")
        urgency = issue_analysis.get("urgency", "")
        
        impact_level = "낮음"
        affected_phases = []
        delay_risk = 0  # 개월
        
        if issue_type == "임원관련":
            if urgency == "긴급":
                impact_level = "매우 높음"
                delay_risk = 6
                affected_phases = ["사업시행인가", "시공사선정", "설계승인"]
            else:
                impact_level = "높음"
                delay_risk = 3
                affected_phases = ["시공사선정", "설계승인"]
                
        elif issue_type == "의사결정":
            impact_level = "높음"
            delay_risk = 4
            affected_phases = ["관리처분계획", "총회승인", "인허가"]
            
        elif issue_type == "재정관리":
            impact_level = "매우 높음"
            delay_risk = 8
            affected_phases = ["분담금징수", "공사발주", "자금조달"]
            
        return {
            "impact_level": impact_level,
            "delay_risk_months": delay_risk,
            "affected_phases": affected_phases,
            "business_continuity": "중단" if impact_level == "매우 높음" else "지연",
            "stakeholder_effects": self._assess_stakeholder_effects(issue_analysis)
        }
        
    def _assess_stakeholder_effects(self, issue_analysis: Dict[str, Any]) -> Dict[str, List[str]]:
        """이해관계자별 영향 평가"""
        
        effects = {
            "조합원": [],
            "임원진": [],
            "시공사": [],
            "금융기관": [],
            "지자체": []
        }
        
        issue_type = issue_analysis.get("issue_type", "")
        
        if issue_type == "임원관련":
            effects["조합원"] = ["사업 지연으로 인한 기회비용", "이사비 증가"]
            effects["임원진"] = ["신뢰도 하락", "책임 추궁"]
            effects["시공사"] = ["계약 지연", "자재비 상승 리스크"]
            
        elif issue_type == "재정관리":
            effects["조합원"] = ["분담금 추가 부담", "대출이자 증가"]
            effects["금융기관"] = ["대출 연체 리스크", "담보가치 변동"]
            
        return effects
        
    def _assess_resolution_priority(self, issue_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """해결 우선순위 평가"""
        
        urgency = issue_analysis.get("urgency", "낮음")
        issue_type = issue_analysis.get("issue_type", "")
        
        # 우선순위 점수 계산 (1~10)
        priority_score = 1
        
        if urgency == "긴급":
            priority_score += 4
        elif urgency == "보통":
            priority_score += 2
            
        if issue_type in ["재정관리", "의사결정"]:
            priority_score += 3
        elif issue_type == "임원관련":
            priority_score += 2
            
        priority_level = "최우선" if priority_score >= 8 else "우선" if priority_score >= 5 else "일반"
        
        return {
            "priority_score": priority_score,
            "priority_level": priority_level,
            "target_resolution_days": 7 if priority_level == "최우선" else 30 if priority_level == "우선" else 90,
            "escalation_criteria": [
                "해결 기한 초과시",
                "갈등 심화시",
                "사업 중단 위험시"
            ]
        }
        
    def _generate_integrated_recommendations(self, issue_analysis: Dict[str, Any], 
                                           impact_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """통합 권장사항 생성"""
        
        recommendations = []
        
        # 즉시 조치사항
        immediate_actions = {
            "title": "즉시 조치사항",
            "actions": [],
            "timeline": "24시간 이내"
        }
        
        # 단기 해결방안
        short_term = {
            "title": "단기 해결방안",
            "actions": [],
            "timeline": "1주일 이내"
        }
        
        # 중장기 예방책
        long_term = {
            "title": "중장기 예방책",
            "actions": [],
            "timeline": "1개월 이내"
        }
        
        issue_type = issue_analysis.get("issue_type", "")
        
        if issue_type == "임원관련":
            immediate_actions["actions"] = [
                "임원 간 긴급 회의 소집",
                "중재인 선정 및 조정 시작",
                "사업 중단 방지를 위한 임시 조치"
            ]
            short_term["actions"] = [
                "외부 전문가 자문단 구성",
                "갈등 조정 프로세스 진행",
                "필요시 임원 교체 절차 시작"
            ]
            long_term["actions"] = [
                "임원 직무 분담 체계 개선",
                "의사결정 프로세스 표준화",
                "정기적인 소통 체계 구축"
            ]
            
        elif issue_type == "재정관리":
            immediate_actions["actions"] = [
                "재정 상황 긴급 점검",
                "자금 조달 방안 검토",
                "채권자와의 협의 시작"
            ]
            short_term["actions"] = [
                "외부 회계감사 실시",
                "재정 건전화 계획 수립",
                "조합원 대상 설명회 개최"
            ]
            
        recommendations.extend([immediate_actions, short_term, long_term])
        
        return recommendations
        
    def generate_expert_advice(self, query: str, project_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """전문가 수준의 조언 생성 (종합 부동산 전문가 기능 통합)"""
        
        # 기존 코드 유지
        query_analysis = self._analyze_redevelopment_query(query)
        
        # 종합 부동산 전문 분야 질의인지 확인
        if any(keyword in query.lower() for keyword in ["정책", "공시가", "감정평가", "경매", "전세", "월세", "분양", "청약", "재건축"]):
            # 종합 부동산 전문가 조언
            comprehensive_consultation = self.comprehensive_real_estate.generate_expert_consultation(
                query, project_context
            )
            
            # 재개발 맥락과 통합
            enhanced_answer = f"""
🏢 **종합 부동산 전문가 분석:**

{comprehensive_consultation.get('expert_answer', '')}

🏗️ **재개발/재건축 연계 관점:**
- 재개발 사업과 연계한 전략적 접근 필요
- 조합원 지위 활용한 투자 기회 검토
- 사업 단계별 리스크와 수익 구조 이해

📊 **통합 투자 전략:**
- 단계별 투자 시점 최적화
- 정책 변화에 따른 대응 방안
- 세무 효율성을 고려한 구조화

💡 **실무 적용 가이드:**
{chr(10).join('- ' + rec for rec in comprehensive_consultation.get('recommendations', comprehensive_consultation.get('policy_updates', [])))}

🎯 **최종 권장사항:**
종합적 관점에서 재개발과 일반 부동산 투자를 연계하여 
포트폴리오 다변화와 리스크 분산을 통한 안정적 수익 추구를 권장합니다.
            """
            
            return {
                "expert_answer": enhanced_answer,
                "comprehensive_analysis": comprehensive_consultation,
                "specialization": "재건축/재개발 + 종합부동산 + 정책/감정평가/경매 전문",
                "confidence": 0.98,
                "expert_level": "최고급 전문가"
            }
        else:
            # 기존 방식으로 처리 (조합 운영, 분담금, 투자 등)
            return super().generate_expert_advice(query, project_context) if hasattr(super(), 'generate_expert_advice') else {
                "expert_answer": "최고급 종합 전문가 조언을 생성 중입니다.",
                "analysis": query_analysis
            }
        
    def _synthesize_expert_answer(self, analysis: Dict[str, Any], laws: List[Dict[str, Any]], 
                                cases: List[Dict[str, Any]], guide: Dict[str, Any]) -> str:
        """전문가 수준의 종합 답변 생성"""
        
        answer_parts = []
        
        # 분야별 전문 분석
        if "법적절차" in analysis["fields"]:
            answer_parts.append(
                "**법적 절차 관점:**\n"
                f"현재 {analysis['current_phase']}에서는 다음 법적 요구사항을 준수해야 합니다.\n"
                f"- 도시정비법상 필수 절차: {', '.join([law['requirement'][:20] + '...' for law in laws[:2]])}\n"
                f"- 예상 소요기간: {guide.get('estimated_duration', '6-12개월')}\n"
            )
            
        if "경제성" in analysis["fields"]:
            answer_parts.append(
                "**경제성 분석 관점:**\n"
                "재개발 사업의 경제성은 입지, 규모, 시장상황에 크게 좌우됩니다.\n"
                "- 사업비 구성: 토지비(25%), 건축비(45%), 기타(30%)\n"
                "- 수익성 확보를 위해서는 분양가 대비 사업비 비율 80% 이하 유지 필요\n"
                "- 현재 시장 상황에서 IRR 15% 이상 확보시 사업성 양호\n"
            )
            
        if "위험관리" in analysis["fields"]:
            answer_parts.append(
                "**위험 관리 관점:**\n"
                "재개발 사업의 주요 위험요소와 대응방안:\n"
                "- 조합원 갈등: 투명한 정보공개와 충분한 소통으로 예방\n"
                "- 사업비 증가: 10% 이상 예비비 확보 및 단계별 비용 모니터링\n"
                "- 인허가 지연: 사전 법률검토 및 전문가 자문을 통한 리스크 최소화\n"
            )
            
        # 사례 기반 교훈
        if cases:
            answer_parts.append(
                "**실제 사례 기반 교훈:**\n"
                f"유사 프로젝트 분석 결과, {cases[0]['교훈']}이 중요한 성공 요인으로 나타났습니다.\n"
            )
            
        # 실무진 관점의 조언
        answer_parts.append(
            "**실무 적용 가이드:**\n"
            "1. 단계별 체크리스트를 활용한 체계적 진행\n"
            "2. 전문가 자문단 구성으로 전문성 확보\n"
            "3. 정기적인 주민 소통으로 갈등 예방\n"
            "4. 시장 상황 모니터링을 통한 탄력적 대응\n"
        )
        
        return "\n\n".join(answer_parts)

    def _identify_location_strengths(self, location_factors: Dict[str, float]) -> List[str]:
        """입지 강점 식별"""
        strengths = []
        for factor, score in location_factors.items():
            if score > 0.8:
                strengths.append(f"{factor} 우수 (점수: {score:.2f})")
        return strengths or ["종합적으로 양호한 입지 조건"]
        
    def _identify_location_weaknesses(self, location_factors: Dict[str, float]) -> List[str]:
        """입지 약점 식별"""
        weaknesses = []
        for factor, score in location_factors.items():
            if score < 0.6:
                weaknesses.append(f"{factor} 보완 필요 (점수: {score:.2f})")
        return weaknesses or ["특별한 약점 없음"]

    def _calculate_feasibility_score(self, location_analysis: Dict[str, Any], 
                                   economic_analysis: Any, 
                                   legal_requirements: List[Any], 
                                   risk_assessment: List[Any]) -> float:
        """사업성 종합 점수 계산"""
        # 입지 점수 (40%)
        location_score = location_analysis["overall_score"] * 0.4
        
        # 경제성 점수 (35%)
        roi = economic_analysis.roi
        economic_score = min(roi / 0.3, 1.0) * 0.35  # ROI 30% 기준으로 정규화
        
        # 법적 준비도 점수 (15%)
        legal_ready = len([req for req in legal_requirements if req.compliance_status == "완료"])
        legal_score = (legal_ready / max(len(legal_requirements), 1)) * 0.15
        
        # 위험 관리 점수 (10%)
        avg_risk = sum(risk.risk_score for risk in risk_assessment) / max(len(risk_assessment), 1)
        risk_score = (1.0 - avg_risk) * 0.1
        
        return min(location_score + economic_score + legal_score + risk_score, 1.0)

    def _generate_recommendations(self, feasibility_score: float, risk_assessment: List[Any]) -> List[str]:
        """권장사항 생성"""
        recommendations = []
        
        if feasibility_score > 0.8:
            recommendations.append("사업 추진을 적극 권장합니다")
        elif feasibility_score > 0.6:
            recommendations.append("위험 요소 보완 후 사업 추진 검토")
        else:
            recommendations.append("사업 조건 재검토 필요")
            
        # 고위험 요소 기반 권장사항
        high_risks = [r for r in risk_assessment if r.risk_score > 0.7]
        for risk in high_risks[:3]:
            recommendations.append(f"{risk.description} 대응책: {risk.mitigation_strategy}")
            
        return recommendations

    def _suggest_next_steps(self, project_info: Dict[str, Any], feasibility_score: float) -> List[str]:
        """다음 단계 제안"""
        steps = []
        
        if feasibility_score > 0.7:
            steps.extend([
                "1. 추진위원회 구성 및 주민 설명회 개최",
                "2. 정밀 안전진단 및 기초조사 실시",
                "3. 전문 컨설팅업체 선정",
                "4. 정비구역지정 신청 준비"
            ])
        else:
            steps.extend([
                "1. 사업성 개선 방안 검토",
                "2. 전문가 자문을 통한 리스크 분석",
                "3. 주민 의견 수렴 및 공감대 형성",
                "4. 단계적 추진 계획 수립"
            ])
            
        return steps

    def _search_relevant_laws(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """관련 법규 검색"""
        relevant_laws = []
        
        fields = analysis.get("fields", [])
        current_phase = analysis.get("current_phase", "")
        
        if "법적절차" in fields or "기획단계" in current_phase:
            relevant_laws.extend([
                {
                    "law_name": "도시 및 주거환경정비법",
                    "article": "제8조",
                    "requirement": "정비구역지정 요건 및 절차",
                    "relevance": "높음"
                },
                {
                    "law_name": "건축법",
                    "article": "제11조",
                    "requirement": "건축허가 기준",
                    "relevance": "중간"
                }
            ])
            
        return relevant_laws

    def _generate_case_based_advice(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """사례 기반 조언 생성"""
        case_advice = []
        
        for case in self.case_studies:
            if any(keyword in case["프로젝트명"] for keyword in analysis.get("keywords", [])):
                case_advice.append({
                    "case_name": case["프로젝트명"],
                    "lesson": case["교훈"],
                    "relevance": "높음"
                })
                
        return case_advice[:3]  # 최대 3개

    def _generate_step_guide(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """단계별 가이드 생성"""
        current_phase = analysis.get("current_phase", "기획단계")
        
        if current_phase in self.procedural_knowledge["재건축절차"]:
            phase_info = self.procedural_knowledge["재건축절차"][current_phase]
            return {
                "current_phase": current_phase,
                "activities": phase_info.get("활동", []),
                "requirements": phase_info.get("요건", ""),
                "estimated_duration": phase_info.get("소요기간", ""),
                "key_points": phase_info.get("주의사항", "")
            }
        else:
            return {
                "current_phase": current_phase,
                "message": "해당 단계의 상세 가이드를 준비 중입니다."
            }

    def _generate_risk_advice(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """위험 관련 조언 생성"""
        risk_advice = {
            "identified_risks": [],
            "mitigation_strategies": [],
            "monitoring_points": []
        }
        
        for category, risks in self.risk_patterns.items():
            for risk in risks:
                if any(keyword in risk["위험요소"] for keyword in analysis.get("keywords", [])):
                    risk_advice["identified_risks"].append(risk["위험요소"])
                    risk_advice["mitigation_strategies"].append(risk["대응방안"])
                    
        return risk_advice

    def _generate_economic_advice(self, analysis: Dict[str, Any]) -> Dict[str, str]:
        """경제성 관련 조언 생성"""
        if "경제성" in analysis.get("fields", []):
            return {
                "cost_management": "사업비는 단계별로 세분화하여 관리하고, 예비비를 충분히 확보하세요",
                "revenue_optimization": "분양가는 주변 시세와 경쟁력을 고려하여 결정하세요",
                "financing": "금융비용 절감을 위해 다양한 자금조달 방안을 검토하세요"
            }
        else:
            return {
                "general_advice": "경제성 분석은 사업 전 단계에서 지속적으로 모니터링이 필요합니다"
            }

    def _generate_expert_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """전문가 권장사항 생성"""
        recommendations = []
        
        urgency = analysis.get("urgency", "보통")
        complexity = analysis.get("complexity", 0.5)
        
        if urgency == "높음":
            recommendations.append("긴급 대응팀을 구성하여 신속한 의사결정 체계를 구축하세요")
            
        if complexity > 0.7:
            recommendations.append("복잡한 사안이므로 분야별 전문가 자문을 받으세요")
            
        recommendations.extend([
            "정기적인 주민 소통을 통해 투명성을 확보하세요",
            "법적 리스크 최소화를 위해 사전 검토를 철저히 하세요",
            "시장 변화를 지속적으로 모니터링하고 대응 방안을 준비하세요"
        ])
        
        return recommendations

    def _suggest_expert_follow_ups(self, analysis: Dict[str, Any]) -> List[str]:
        """전문가 후속 질문 제안"""
        follow_ups = []
        
        fields = analysis.get("fields", [])
        
        if "법적절차" in fields:
            follow_ups.extend([
                "현재 단계에서 필요한 구체적인 서류는 무엇인가요?",
                "인허가 과정에서 예상되는 소요 기간은?",
                "법적 리스크를 최소화하는 방법은?"
            ])
            
        if "경제성" in fields:
            follow_ups.extend([
                "자금 조달 계획은 어떻게 세우시나요?",
                "사업비 상승에 대비한 대책은?",
                "수익성 개선 방안은 무엇인가요?"
            ])
            
        return follow_ups[:4]  # 최대 4개

    def comprehensive_property_analysis(self, property_data: Dict[str, Any], 
                                       redevelopment_context: Dict[str, Any]) -> Dict[str, Any]:
        """종합 부동산 분석 (재개발 + 투자 + 설계)"""
        
        # 부동산 투자 분석
        investment_analysis = self.real_estate_expert.analyze_property_investment(
            property_data, redevelopment_context.get("investor_profile", {})
        )
        
        # 재개발 사업성 분석
        redevelopment_analysis = self._analyze_redevelopment_feasibility(
            property_data, redevelopment_context
        )
        
        # 건축·설계 분석
        architectural_analysis = self._analyze_architectural_potential(
            property_data, redevelopment_context
        )
        
        # 통합 평가
        integrated_assessment = self._generate_integrated_assessment(
            investment_analysis, redevelopment_analysis, architectural_analysis
        )
        
        return {
            "investment_analysis": {
                "investment_score": investment_analysis.investment_score,
                "predicted_value": investment_analysis.predicted_value,
                "risk_level": investment_analysis.risk_level,
                "recommendations": investment_analysis.recommendations
            },
            "redevelopment_analysis": redevelopment_analysis,
            "architectural_analysis": architectural_analysis,
            "integrated_assessment": integrated_assessment,
            "expert_recommendations": self._generate_comprehensive_recommendations(
                investment_analysis, redevelopment_analysis, architectural_analysis
            )
        }
        
    def _analyze_redevelopment_feasibility(self, property_data: Dict[str, Any], 
                                         context: Dict[str, Any]) -> Dict[str, Any]:
        """재개발 사업성 분석"""
        
        location = property_data.get("location", "")
        building_age = property_data.get("age", 10)
        current_far = property_data.get("current_far", 200)  # 현재 용적률
        
        # 재개발 가능성 평가
        redevelopment_score = 0
        
        if building_age >= 30:
            redevelopment_score += 3
        elif building_age >= 20:
            redevelopment_score += 2
        elif building_age >= 15:
            redevelopment_score += 1
            
        # 용적률 여유분 확인
        max_far = self._get_max_far_by_location(location)
        far_upside = max_far - current_far
        
        if far_upside >= 300:
            redevelopment_score += 3
        elif far_upside >= 200:
            redevelopment_score += 2
        elif far_upside >= 100:
            redevelopment_score += 1
            
        # 입지 조건 평가
        location_score = self._evaluate_location_for_redevelopment(location)
        redevelopment_score += location_score
        
        feasibility_level = "높음" if redevelopment_score >= 7 else "보통" if redevelopment_score >= 4 else "낮음"
        
        return {
            "feasibility_score": redevelopment_score,
            "feasibility_level": feasibility_level,
            "building_age": building_age,
            "current_far": current_far,
            "max_far": max_far,
            "far_upside": far_upside,
            "estimated_timeline": self._estimate_redevelopment_timeline(redevelopment_score),
            "key_factors": self._identify_key_redevelopment_factors(property_data)
        }
        
    def _get_max_far_by_location(self, location: str) -> int:
        """지역별 최대 용적률"""
        far_map = {
            "강남": 400,
            "서초": 400,
            "송파": 350,
            "강동": 300,
            "마포": 350,
            "용산": 500,  # 재개발 특별구역
            "은평": 250
        }
        
        for area, far in far_map.items():
            if area in location:
                return far
        return 300  # 기본값
        
    def _evaluate_location_for_redevelopment(self, location: str) -> int:
        """재개발 입지 조건 평가 (0-3점)"""
        score = 0
        
        # 역세권 여부
        if any(station in location for station in ["역", "지하철"]):
            score += 1
            
        # 강남권 여부
        if any(area in location for area in ["강남", "서초", "송파"]):
            score += 2
            
        # 개발 호재 지역
        if any(keyword in location for keyword in ["재개발", "뉴타운", "신도시"]):
            score += 1
            
        return min(score, 3)
        
    def _estimate_redevelopment_timeline(self, score: int) -> Dict[str, str]:
        """재개발 추정 일정"""
        if score >= 7:
            return {
                "추진위구성": "1년",
                "조합설립": "2년",
                "사업시행인가": "1년",
                "착공": "1년",
                "준공": "3년",
                "총기간": "8년"
            }
        elif score >= 4:
            return {
                "추진위구성": "2년",
                "조합설립": "3년", 
                "사업시행인가": "2년",
                "착공": "1년",
                "준공": "3년",
                "총기간": "11년"
            }
        else:
            return {
                "추진위구성": "불확실",
                "조합설립": "불확실",
                "사업시행인가": "불확실",
                "착공": "불확실",
                "준공": "불확실",
                "총기간": "15년 이상"
            }
            
    def _identify_key_redevelopment_factors(self, property_data: Dict[str, Any]) -> List[str]:
        """재개발 핵심 요인 식별"""
        factors = []
        
        building_age = property_data.get("age", 10)
        if building_age >= 30:
            factors.append("노후도 기준 충족")
        elif building_age >= 20:
            factors.append("노후도 기준 근접")
            
        area = property_data.get("total_area", 10000)
        if area >= 10000:
            factors.append("최소 면적 요건 충족")
        else:
            factors.append("최소 면적 요건 미충족")
            
        safety_rating = property_data.get("safety_rating", "C")
        if safety_rating in ["D", "E"]:
            factors.append("안전진단 통과 가능")
        else:
            factors.append("안전진단 통과 불확실")
            
        return factors
        
    def _analyze_architectural_potential(self, property_data: Dict[str, Any], 
                                       context: Dict[str, Any]) -> Dict[str, Any]:
        """건축·설계 잠재력 분석"""
        
        location = property_data.get("location", "")
        total_area = property_data.get("total_area", 10000)
        
        # 설계 가능성 평가
        design_concepts = self._suggest_design_concepts(location, total_area)
        
        # 용적률 활용방안
        far_utilization = self._analyze_far_utilization(property_data)
        
        # 친환경 설계 요소
        sustainability_features = self._suggest_sustainability_features()
        
        # 스마트 건축 요소
        smart_features = self._suggest_smart_features()
        
        return {
            "design_concepts": design_concepts,
            "far_utilization": far_utilization,
            "sustainability_features": sustainability_features,
            "smart_features": smart_features,
            "estimated_construction_cost": self._estimate_construction_cost(total_area),
            "design_recommendations": self._generate_design_recommendations(property_data)
        }
        
    def _suggest_design_concepts(self, location: str, area: float) -> List[Dict[str, Any]]:
        """설계 컨셉 제안"""
        concepts = []
        
        if "강남" in location or "서초" in location:
            concepts.append({
                "concept": "프리미엄 타워형 단지",
                "특징": ["고급 마감재", "대형 평형", "부대시설 특화"],
                "target": "고소득층"
            })
        
        if area >= 30000:
            concepts.append({
                "concept": "복합단지형 개발",
                "특징": ["주상복합", "상업시설", "오피스"],
                "target": "다양한 계층"
            })
            
        concepts.append({
            "concept": "친환경 스마트 단지",
            "특징": ["태양광", "지열", "IoT", "공유공간"],
            "target": "젊은층, 1-2인 가구"
        })
        
        return concepts
        
    def _analyze_far_utilization(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """용적률 활용 분석"""
        
        current_far = property_data.get("current_far", 200)
        max_far = self._get_max_far_by_location(property_data.get("location", ""))
        
        additional_floor_area = (max_far - current_far) * property_data.get("land_area", 5000) / 100
        
        return {
            "current_far": current_far,
            "max_far": max_far,
            "additional_floor_area": additional_floor_area,
            "additional_units": int(additional_floor_area / 84),  # 84㎡ 기준
            "revenue_potential": additional_floor_area * 25  # ㎡당 2,500만원 가정
        }
        
    def _suggest_sustainability_features(self) -> List[Dict[str, str]]:
        """지속가능성 요소 제안"""
        return [
            {"feature": "태양광 발전", "benefit": "에너지 비용 절감", "투자비": "㎡당 50만원"},
            {"feature": "지열 시스템", "benefit": "냉난방비 30% 절감", "투자비": "세대당 500만원"},
            {"feature": "빗물 활용", "benefit": "상수도 비용 절감", "투자비": "단지당 5,000만원"},
            {"feature": "옥상 정원", "benefit": "열섬현상 완화", "투자비": "㎡당 30만원"},
            {"feature": "LED 조명", "benefit": "전력비용 50% 절감", "투자비": "세대당 200만원"}
        ]
        
    def _suggest_smart_features(self) -> List[Dict[str, str]]:
        """스마트 기능 제안"""
        return [
            {"feature": "스마트홈 시스템", "description": "조명, 온도, 보안 통합제어"},
            {"feature": "무인택배함", "description": "비대면 택배 수령"},
            {"feature": "공유자동차", "description": "카셰어링 서비스"},
            {"feature": "AI 보안", "description": "얼굴인식 출입통제"},
            {"feature": "IoT 관리", "description": "시설물 예방정비"}
        ]
        
    def _estimate_construction_cost(self, area: float) -> Dict[str, float]:
        """건축비 추정"""
        
        unit_cost = 1.2  # ㎡당 120만원
        total_cost = area * unit_cost / 100000000  # 억원 단위
        
        return {
            "basic_construction": total_cost * 0.7,
            "finishing": total_cost * 0.2,
            "infrastructure": total_cost * 0.1,
            "total": total_cost
        }
        
    def _generate_design_recommendations(self, property_data: Dict[str, Any]) -> List[str]:
        """설계 권장사항"""
        
        recommendations = []
        
        location = property_data.get("location", "")
        if "강남" in location:
            recommendations.append("프리미엄 브랜드 도입으로 브랜드 가치 극대화")
            
        building_age = property_data.get("age", 10)
        if building_age >= 30:
            recommendations.append("전면 철거 후 최신 트렌드 반영한 신축")
        else:
            recommendations.append("부분 리모델링으로 비용 효율성 추구")
            
        recommendations.extend([
            "친환경 인증 획득으로 분양가 프리미엄 확보",
            "커뮤니티 시설 강화로 주거 만족도 향상",
            "주차장 확충으로 실용성 증대"
        ])
        
        return recommendations
        
    def _generate_integrated_assessment(self, investment_analysis, redevelopment_analysis, 
                                      architectural_analysis) -> Dict[str, Any]:
        """통합 평가"""
        
        # 종합 점수 계산
        investment_score = investment_analysis.investment_score
        redevelopment_score = redevelopment_analysis["feasibility_score"]
        
        # 가중 평균 (투자 40%, 재개발 40%, 건축 20%)
        total_score = (investment_score * 0.4 + 
                      redevelopment_score * 0.4 + 
                      8.0 * 0.2)  # 건축은 8점 고정 (높은 기술력 가정)
        
        # 등급 분류
        if total_score >= 8.5:
            grade = "S급 (최우수)"
        elif total_score >= 7.5:
            grade = "A급 (우수)"
        elif total_score >= 6.0:
            grade = "B급 (양호)"
        elif total_score >= 4.5:
            grade = "C급 (보통)"
        else:
            grade = "D급 (미흡)"
            
        return {
            "total_score": round(total_score, 1),
            "grade": grade,
            "investment_weight": investment_score * 0.4,
            "redevelopment_weight": redevelopment_score * 0.4,
            "architectural_weight": 8.0 * 0.2,
            "key_strengths": self._identify_key_strengths(investment_analysis, redevelopment_analysis),
            "improvement_areas": self._identify_improvement_areas(investment_analysis, redevelopment_analysis)
        }
        
    def _identify_key_strengths(self, investment_analysis, redevelopment_analysis) -> List[str]:
        """핵심 강점 식별"""
        strengths = []
        
        if investment_analysis.investment_score >= 8:
            strengths.append("투자 매력도 우수")
        if redevelopment_analysis["feasibility_level"] == "높음":
            strengths.append("재개발 가능성 높음")
        if redevelopment_analysis["far_upside"] >= 200:
            strengths.append("용적률 상향 여지 충분")
            
        return strengths
        
    def _identify_improvement_areas(self, investment_analysis, redevelopment_analysis) -> List[str]:
        """개선 영역 식별"""
        areas = []
        
        if investment_analysis.risk_level == "높음":
            areas.append("투자 위험도 관리 필요")
        if redevelopment_analysis["feasibility_level"] == "낮음":
            areas.append("재개발 여건 개선 필요")
            
        return areas
        
    def _generate_comprehensive_recommendations(self, investment_analysis, 
                                              redevelopment_analysis, architectural_analysis) -> List[str]:
        """종합 권장사항"""
        
        recommendations = []
        
        # 투자 관점
        if investment_analysis.investment_score >= 8:
            recommendations.append("투자 적극 검토 권장 - 높은 수익성 기대")
        elif investment_analysis.investment_score >= 6:
            recommendations.append("신중한 검토 후 투자 - 적정 수준의 매력도")
        else:
            recommendations.append("투자 보류 권장 - 다른 대안 검토")
            
        # 재개발 관점  
        if redevelopment_analysis["feasibility_level"] == "높음":
            recommendations.append("재개발 추진 적극 검토 - 사업성 우수")
        elif redevelopment_analysis["feasibility_level"] == "보통":
            recommendations.append("재개발 여건 개선 후 추진")
        else:
            recommendations.append("재개발 시기 미적절 - 장기 관점에서 접근")
            
        # 건축 관점
        recommendations.extend([
            "최신 건축 트렌드 반영으로 경쟁력 확보",
            "친환경·스마트 기술 도입으로 부가가치 창출",
            "지역 특성을 반영한 차별화된 설계 적용"
        ])
        
        return recommendations
        
    def _analyze_redevelopment_query(self, query: str) -> Dict[str, Any]:
        """재개발 관련 질의 분석"""
        analysis = {
            "query": query,
            "keywords": re.findall(r'\b(재개발|재건축|조합|분담금|임원|총회|대의원|선거)\b', query.lower())
        }
        return analysis

    def ultimate_property_analysis(self, property_data: Dict[str, Any], 
                                  analysis_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """궁극의 부동산 종합 분석"""
        
        if analysis_context is None:
            analysis_context = {}
            
        # 1. 종합 부동산 분석
        comprehensive_analysis = self.comprehensive_real_estate.comprehensive_property_analysis(
            property_data, ["investment", "policy", "valuation", "tax", "market"]
        )
        
        # 2. 재개발/재건축 전문 분석
        redevelopment_analysis = self.comprehensive_property_analysis(
            property_data, analysis_context
        )
        
        # 3. 조합 운영 분석 (해당시)
        governance_analysis = None
        if property_data.get("has_union", False):
            governance_analysis = self.analyze_union_governance(
                "조합 운영 현황 분석", analysis_context
            )
            
        # 4. 분담금 영향 분석
        contribution_analysis = None
        if property_data.get("building_age", 0) >= 15:
            member_profiles = analysis_context.get("member_profiles", [])
            if member_profiles:
                contribution_analysis = self.analyze_contribution_impact(
                    property_data, member_profiles
                )
                
        # 5. 최종 종합 평가
        ultimate_assessment = self._generate_ultimate_assessment(
            comprehensive_analysis, redevelopment_analysis, 
            governance_analysis, contribution_analysis
        )
        
        return {
            "comprehensive_real_estate": comprehensive_analysis,
            "redevelopment_specialized": redevelopment_analysis,
            "governance_analysis": governance_analysis,
            "contribution_analysis": contribution_analysis,
            "ultimate_assessment": ultimate_assessment,
            "expert_recommendations": self._generate_ultimate_recommendations(ultimate_assessment),
            "risk_matrix": self._create_comprehensive_risk_matrix(
                comprehensive_analysis, redevelopment_analysis
            )
        }
        
    def _generate_ultimate_assessment(self, comprehensive, redevelopment, 
                                    governance, contribution) -> Dict[str, Any]:
        """최종 종합 평가"""
        
        # 각 분야별 점수 추출
        scores = {
            "investment": comprehensive.get("investment_analysis", {}).get("score", 7.0),
            "redevelopment": redevelopment.get("integrated_assessment", {}).get("total_score", 7.0),
            "policy": 8.0,  # 정책 분석 점수 (기본값)
            "valuation": 8.5,  # 감정평가 점수 (기본값)
            "tax": 7.5  # 세무 점수 (기본값)
        }
        
        # 조합 운영 점수 (해당시)
        if governance:
            scores["governance"] = 8.0 if governance["priority_assessment"]["priority_level"] == "일반" else 6.0
            
        # 분담금 점수 (해당시)
        if contribution:
            risk_level = contribution["burden_analysis"]["risk_level"]
            scores["contribution"] = 9.0 if risk_level == "low" else 7.0 if risk_level == "medium" else 5.0
            
        # 가중평균 계산
        weights = {
            "investment": 0.25,
            "redevelopment": 0.25,
            "policy": 0.15,
            "valuation": 0.15,
            "tax": 0.10,
            "governance": 0.05,
            "contribution": 0.05
        }
        
        # 실제 존재하는 점수만 계산
        total_score = 0
        total_weight = 0
        
        for category, score in scores.items():
            if category in weights:
                total_score += score * weights[category]
                total_weight += weights[category]
                
        final_score = total_score / total_weight if total_weight > 0 else 7.0
        
        # 등급 분류
        if final_score >= 9.0:
            grade = "SS급 (최고급)"
            rating = "투자 최적"
        elif final_score >= 8.5:
            grade = "S급 (최우수)"
            rating = "투자 강력 권장"
        elif final_score >= 8.0:
            grade = "A+급 (우수)"
            rating = "투자 적극 권장"
        elif final_score >= 7.5:
            grade = "A급 (양호)"
            rating = "투자 권장"
        elif final_score >= 7.0:
            grade = "B+급 (보통상)"
            rating = "신중 검토 후 투자"
        elif final_score >= 6.0:
            grade = "B급 (보통)"
            rating = "조건부 투자"
        else:
            grade = "C급 (미흡)"
            rating = "투자 비권장"
            
        return {
            "final_score": round(final_score, 2),
            "grade": grade,
            "rating": rating,
            "category_scores": scores,
            "strengths": self._identify_ultimate_strengths(scores),
            "weaknesses": self._identify_ultimate_weaknesses(scores),
            "key_factors": self._extract_key_success_factors(comprehensive, redevelopment)
        }
        
    def _identify_ultimate_strengths(self, scores: Dict[str, float]) -> List[str]:
        """핵심 강점 식별"""
        strengths = []
        
        for category, score in scores.items():
            if score >= 8.5:
                strength_map = {
                    "investment": "투자 매력도 최고 수준",
                    "redevelopment": "재개발 사업성 우수",
                    "policy": "정책 환경 매우 유리",
                    "valuation": "자산 가치 안정적",
                    "tax": "세무 부담 최적화",
                    "governance": "조합 운영 안정적",
                    "contribution": "분담금 부담 합리적"
                }
                if category in strength_map:
                    strengths.append(strength_map[category])
                    
        return strengths
        
    def _identify_ultimate_weaknesses(self, scores: Dict[str, float]) -> List[str]:
        """핵심 약점 식별"""
        weaknesses = []
        
        for category, score in scores.items():
            if score < 6.5:
                weakness_map = {
                    "investment": "투자 매력도 부족",
                    "redevelopment": "재개발 사업성 의문",
                    "policy": "정책 환경 불리",
                    "valuation": "자산 가치 불안정",
                    "tax": "세무 부담 과중",
                    "governance": "조합 운영 불안정",
                    "contribution": "분담금 부담 과중"
                }
                if category in weakness_map:
                    weaknesses.append(weakness_map[category])
                    
        return weaknesses
        
    def _extract_key_success_factors(self, comprehensive, redevelopment) -> List[str]:
        """핵심 성공 요인 추출"""
        factors = []
        
        # 위치적 요인
        factors.append("프리미엄 입지의 장기적 가치 상승")
        
        # 사업적 요인
        if redevelopment.get("redevelopment_analysis", {}).get("feasibility_level") == "높음":
            factors.append("재개발 사업성 우수로 추가 수익 기대")
            
        # 정책적 요인
        factors.append("정부 정책 방향과 부합하는 투자")
        
        # 시장적 요인
        factors.append("안정적 수요 기반의 유동성 확보")
        
        return factors
        
    def _generate_ultimate_recommendations(self, assessment: Dict[str, Any]) -> List[Dict[str, Any]]:
        """궁극의 투자 권장사항"""
        
        recommendations = []
        grade = assessment["grade"]
        final_score = assessment["final_score"]
        
        # 등급별 기본 권장사항
        if "SS급" in grade or "S급" in grade:
            recommendations.append({
                "category": "투자 결정",
                "priority": "최우선",
                "action": "즉시 투자 검토 및 실행",
                "reason": "모든 지표가 최상위 수준",
                "timeline": "즉시"
            })
        elif "A+" in grade or "A급" in grade:
            recommendations.append({
                "category": "투자 결정",
                "priority": "우선",
                "action": "적극적 투자 검토",
                "reason": "우수한 투자 기회",
                "timeline": "1개월 이내"
            })
        else:
            recommendations.append({
                "category": "투자 결정",
                "priority": "보통",
                "action": "신중한 검토 후 결정",
                "reason": "추가 분석 필요",
                "timeline": "3개월 이내"
            })
            
        # 강점 활용 방안
        for strength in assessment["strengths"]:
            recommendations.append({
                "category": "강점 활용",
                "priority": "중요",
                "action": f"{strength} 적극 활용",
                "reason": "경쟁 우위 요소",
                "timeline": "지속적"
            })
            
        # 약점 보완 방안
        for weakness in assessment["weaknesses"]:
            recommendations.append({
                "category": "위험 관리",
                "priority": "필수",
                "action": f"{weakness} 개선 방안 수립",
                "reason": "투자 리스크 최소화",
                "timeline": "우선적"
            })
            
        return recommendations
        
    def _create_comprehensive_risk_matrix(self, comprehensive, redevelopment) -> Dict[str, Any]:
        """종합 리스크 매트릭스"""
        
        risks = {
            "시장 리스크": {
                "probability": "중간",
                "impact": "높음",
                "mitigation": "시장 동향 지속 모니터링"
            },
            "정책 리스크": {
                "probability": "낮음",
                "impact": "매우 높음",
                "mitigation": "정책 변화 사전 대응"
            },
            "사업 리스크": {
                "probability": "낮음",
                "impact": "높음",
                "mitigation": "전문가 자문 및 충분한 검토"
            },
            "유동성 리스크": {
                "probability": "낮음",
                "impact": "중간",
                "mitigation": "분산 투자 및 현금 확보"
            },
            "금융 리스크": {
                "probability": "중간",
                "impact": "중간",
                "mitigation": "금리 헤지 전략 수립"
            }
        }
        
        return {
            "risk_factors": risks,
            "overall_risk_level": "보통",
            "risk_management_priority": [
                "정책 변화 모니터링",
                "시장 동향 추적",
                "전문가 자문 확보"
            ]
        }

    def holistic_market_analysis(self, property_data: Dict[str, Any], 
                                market_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """전방위 시장 분석 (기술적 + 심리적 + 정비사업)"""
        
        if market_context is None:
            market_context = {}
            
        # 1. 기존 종합 분석
        ultimate_analysis = self.ultimate_property_analysis(property_data, market_context)
        
        # 2. 시장 심리 분석
        market_sentiment = self.market_sentiment.analyze_market_sentiment()
        
        # 3. 정비사업 동향 분석
        urban_renewal_trends = self.market_sentiment.analyze_urban_renewal_trends()
        
        # 4. 여론 및 정책 환경 분석
        policy_sentiment = self._analyze_policy_sentiment_environment(property_data)
        
        # 5. 전방위 종합 평가
        holistic_assessment = self._generate_holistic_assessment(
            ultimate_analysis, market_sentiment, urban_renewal_trends, policy_sentiment
        )
        
        return {
            "technical_analysis": ultimate_analysis,
            "market_sentiment": {
                "sentiment_score": market_sentiment.sentiment_score,
                "trend_direction": market_sentiment.trend_direction,
                "confidence_level": market_sentiment.confidence_level,
                "key_factors": market_sentiment.key_factors
            },
            "urban_renewal_trends": urban_renewal_trends,
            "policy_sentiment": policy_sentiment,
            "holistic_assessment": holistic_assessment,
            "market_timing": self._assess_market_timing(market_sentiment, ultimate_analysis),
            "strategic_recommendations": self._generate_strategic_recommendations(holistic_assessment)
        }
        
    def _analyze_policy_sentiment_environment(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """정책 심리 환경 분석"""
        
        location = property_data.get("location", "")
        property_type = property_data.get("type", "아파트")
        
        # 정책 환경 점수 계산
        policy_score = self._calculate_policy_environment_score(location)
        
        # 여론 환경 분석
        public_opinion_score = self._calculate_public_opinion_score(location)
        
        # 규제 환경 분석
        regulatory_environment = self._assess_regulatory_environment(location)
        
        return {
            "policy_score": policy_score,
            "public_opinion_score": public_opinion_score,
            "regulatory_environment": regulatory_environment,
            "overall_environment": self._assess_overall_policy_environment(
                policy_score, public_opinion_score, regulatory_environment
            ),
            "policy_risks": self._identify_policy_risks(location),
            "policy_opportunities": self._identify_policy_opportunities(location)
        }
        
    def _calculate_policy_environment_score(self, location: str) -> float:
        """정책 환경 점수 계산"""
        base_score = 70.0
        
        # 지역별 정책 우대
        if "강남" in location or "서초" in location:
            base_score += 10  # 재건축 우대 지역
        elif "강동" in location:
            base_score += 15  # 3기 신도시 혜택
        elif "용산" in location:
            base_score += 20  # 국제업무지구
            
        # 현재 정책 기조 반영
        base_score += 10  # 2024년 완화 기조
        
        return min(100.0, max(0.0, base_score))
        
    def _calculate_public_opinion_score(self, location: str) -> float:
        """여론 환경 점수 계산"""
        base_score = 65.0
        
        # 지역별 선호도
        if "서울" in location:
            base_score += 15  # 서울 선호도 높음
        elif "경기" in location:
            base_score += 10  # 경기 성장 기대
            
        # 현재 여론 상황 반영 (회복기)
        base_score += 12
        
        return min(100.0, max(0.0, base_score))
        
    def _assess_regulatory_environment(self, location: str) -> Dict[str, Any]:
        """규제 환경 평가"""
        
        regulations = {
            "intensity": "보통",  # 강함/보통/약함
            "trend": "완화",     # 강화/유지/완화
            "impact": "긍정적",   # 긍정적/중립/부정적
            "key_regulations": []
        }
        
        if "서울" in location:
            regulations.update({
                "intensity": "강함",
                "key_regulations": ["조정대상지역", "재건축초과이익환수제"]
            })
        else:
            regulations.update({
                "intensity": "보통",
                "key_regulations": ["일반 건축법", "도시계획법"]
            })
            
        return regulations
        
    def _assess_overall_policy_environment(self, policy_score: float, 
                                         opinion_score: float, 
                                         regulatory: Dict[str, Any]) -> str:
        """전반적 정책 환경 평가"""
        
        avg_score = (policy_score + opinion_score) / 2
        
        if avg_score >= 80:
            return "매우 유리"
        elif avg_score >= 70:
            return "유리"
        elif avg_score >= 60:
            return "보통"
        elif avg_score >= 50:
            return "불리"
        else:
            return "매우 불리"
            
    def _identify_policy_risks(self, location: str) -> List[str]:
        """정책 리스크 식별"""
        risks = []
        
        if "서울" in location:
            risks.extend([
                "재규제 가능성",
                "초과이익환수제 부담",
                "분양가상한제 적용"
            ])
        else:
            risks.extend([
                "지방 소외 정책",
                "공급 과잉 우려"
            ])
            
        # 공통 리스크
        risks.extend([
            "금리 정책 변화",
            "부동산 과열 시 규제 강화"
        ])
        
        return risks
        
    def _identify_policy_opportunities(self, location: str) -> List[str]:
        """정책 기회 식별"""
        opportunities = []
        
        if "강동" in location:
            opportunities.append("3기 신도시 개발 혜택")
        if "용산" in location:
            opportunities.append("국제업무지구 개발")
            
        # 공통 기회
        opportunities.extend([
            "정책 완화 기조",
            "공급 확대 정책",
            "실수요자 지원 강화"
        ])
        
        return opportunities
        
    def _generate_holistic_assessment(self, ultimate_analysis, market_sentiment, 
                                    urban_renewal, policy_sentiment) -> Dict[str, Any]:
        """전방위 종합 평가"""
        
        # 각 영역별 점수 추출
        technical_score = ultimate_analysis["ultimate_assessment"]["final_score"]
        sentiment_score = (market_sentiment.sentiment_score + 100) / 2  # 0-100 변환
        renewal_score = 75.0  # 정비사업 활성도 (기본값)
        policy_score = policy_sentiment["policy_score"]
        
        # 가중평균 계산
        weights = {
            "technical": 0.4,    # 기술적 분석
            "sentiment": 0.25,   # 시장 심리
            "renewal": 0.20,     # 정비사업
            "policy": 0.15       # 정책 환경
        }
        
        holistic_score = (
            technical_score * weights["technical"] +
            sentiment_score * weights["sentiment"] +
            renewal_score * weights["renewal"] +
            policy_score * weights["policy"]
        )
        
        # 등급 분류 (더욱 세분화)
        if holistic_score >= 9.5:
            grade = "SSS급 (궁극)"
            rating = "완벽한 투자 기회"
        elif holistic_score >= 9.0:
            grade = "SS급 (최고급)"
            rating = "최적의 투자 기회"
        elif holistic_score >= 8.5:
            grade = "S+급 (최우수)"
            rating = "매우 우수한 투자 기회"
        elif holistic_score >= 8.0:
            grade = "S급 (우수)"
            rating = "우수한 투자 기회"
        elif holistic_score >= 7.5:
            grade = "A+급 (양호상)"
            rating = "양호한 투자 기회"
        elif holistic_score >= 7.0:
            grade = "A급 (양호)"
            rating = "적정한 투자 기회"
        elif holistic_score >= 6.5:
            grade = "B+급 (보통상)"
            rating = "신중한 투자 검토"
        elif holistic_score >= 6.0:
            grade = "B급 (보통)"
            rating = "조건부 투자 고려"
        else:
            grade = "C급 이하 (미흡)"
            rating = "투자 재검토 필요"
            
        return {
            "holistic_score": round(holistic_score, 2),
            "grade": grade,
            "rating": rating,
            "dimension_scores": {
                "technical": technical_score,
                "sentiment": sentiment_score,
                "renewal": renewal_score,
                "policy": policy_score
            },
            "market_cycle_position": self._determine_market_cycle_position(market_sentiment),
            "investment_readiness": self._assess_investment_readiness(holistic_score),
            "competitive_advantages": self._identify_competitive_advantages(
                technical_score, sentiment_score, renewal_score, policy_score
            )
        }
        
    def _determine_market_cycle_position(self, sentiment) -> str:
        """시장 사이클 위치 판단"""
        score = sentiment.sentiment_score
        
        if score < -50:
            return "침체기 말기 (절호의 매수 기회)"
        elif score < -20:
            return "침체기 (매수 타이밍 접근)"
        elif score < 0:
            return "회복 초기 (선별적 매수)"
        elif score < 20:
            return "회복기 (적극적 매수)"
        elif score < 50:
            return "성장기 (신중한 매수)"
        else:
            return "성숙기 (매도 타이밍 고려)"
            
    def _assess_investment_readiness(self, score: float) -> str:
        """투자 준비도 평가"""
        if score >= 9.0:
            return "즉시 실행 권장"
        elif score >= 8.0:
            return "적극 검토 권장"
        elif score >= 7.0:
            return "신중 검토 권장"
        elif score >= 6.0:
            return "조건부 검토"
        else:
            return "투자 보류"
            
    def _identify_competitive_advantages(self, technical: float, sentiment: float, 
                                       renewal: float, policy: float) -> List[str]:
        """경쟁 우위 요소 식별"""
        advantages = []
        
        if technical >= 8.5:
            advantages.append("탁월한 기본기 (입지, 사업성)")
        if sentiment >= 75:
            advantages.append("우호적 시장 심리")
        if renewal >= 80:
            advantages.append("활발한 정비사업 환경")
        if policy >= 80:
            advantages.append("유리한 정책 환경")
            
        return advantages if advantages else ["추가 경쟁력 확보 필요"]
        
    def _assess_market_timing(self, sentiment, ultimate_analysis) -> Dict[str, Any]:
        """시장 타이밍 평가"""
        
        timing_score = (sentiment.sentiment_score + 100) / 2  # 0-100 변환
        technical_score = ultimate_analysis["ultimate_assessment"]["final_score"] * 10
        
        combined_timing = (timing_score + technical_score) / 2
        
        if combined_timing >= 90:
            timing_assessment = "최적 타이밍"
        elif combined_timing >= 80:
            timing_assessment = "우수한 타이밍"
        elif combined_timing >= 70:
            timing_assessment = "양호한 타이밍"
        elif combined_timing >= 60:
            timing_assessment = "보통 타이밍"
        else:
            timing_assessment = "부적절한 타이밍"
            
        return {
            "timing_score": combined_timing,
            "timing_assessment": timing_assessment,
            "entry_strategy": self._suggest_entry_strategy(combined_timing),
            "exit_strategy": self._suggest_exit_strategy(combined_timing)
        }
        
    def _suggest_entry_strategy(self, timing_score: float) -> str:
        """진입 전략 제안"""
        if timing_score >= 85:
            return "즉시 진입 (최적 타이밍)"
        elif timing_score >= 75:
            return "1개월 내 진입 (우수한 타이밍)"
        elif timing_score >= 65:
            return "3개월 내 신중 진입"
        else:
            return "시장 개선시까지 대기"
            
    def _suggest_exit_strategy(self, timing_score: float) -> str:
        """출구 전략 제안"""
        if timing_score >= 85:
            return "3-5년 장기 보유 후 매도"
        elif timing_score >= 75:
            return "2-4년 중기 보유"
        else:
            return "1-2년 단기 보유 고려"
            
    def _generate_strategic_recommendations(self, assessment: Dict[str, Any]) -> List[Dict[str, Any]]:
        """전략적 권장사항 생성"""
        
        recommendations = []
        grade = assessment["grade"]
        score = assessment["holistic_score"]
        
        # 등급별 기본 전략
        if "SSS" in grade or "SS" in grade:
            recommendations.append({
                "category": "투자 전략",
                "priority": "최우선",
                "action": "즉시 최대 한도 투자",
                "rationale": "모든 지표가 최적 수준",
                "timeline": "즉시 실행",
                "confidence": 0.99
            })
        elif "S" in grade:
            recommendations.append({
                "category": "투자 전략", 
                "priority": "우선",
                "action": "적극적 투자 추진",
                "rationale": "매우 우수한 투자 기회",
                "timeline": "1개월 이내",
                "confidence": 0.95
            })
        else:
            recommendations.append({
                "category": "투자 전략",
                "priority": "검토",
                "action": "신중한 분석 후 결정",
                "rationale": "추가 검토 요소 존재",
                "timeline": "3개월 이내",
                "confidence": 0.80
            })
            
        # 시장 포지셔닝 전략
        cycle_position = assessment["market_cycle_position"]
        if "매수 기회" in cycle_position:
            recommendations.append({
                "category": "시장 포지셔닝",
                "priority": "중요",
                "action": "적극적 포지션 확대",
                "rationale": cycle_position,
                "timeline": "즉시",
                "confidence": 0.90
            })
            
        # 위험 관리 전략
        recommendations.append({
            "category": "위험 관리",
            "priority": "필수",
            "action": "다각도 리스크 모니터링",
            "rationale": "시장 변동성 대비",
            "timeline": "지속적",
            "confidence": 0.95
        })
        
        return recommendations
        
    def generate_expert_advice(self, query: str, project_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """전문가 수준의 조언 생성 (시장 여론 분석 기능 통합)"""
        
        # 기존 코드 유지
        query_analysis = self._analyze_redevelopment_query(query)
        
        # 시장 여론 및 정비사업 관련 질의인지 확인
        if any(keyword in query.lower() for keyword in ["여론", "심리", "분위기", "정서", "시장", "정비사업", "도시정비"]):
            # 시장 여론 분석 전문가 조언
            market_analysis = self.market_sentiment.generate_comprehensive_market_analysis(
                query, project_context
            )
            
            # 재개발 맥락과 통합
            enhanced_answer = f"""
📊 **시장 여론 및 정비사업 전문가 분석:**

{market_analysis.get('expert_answer', '')}

🏗️ **재개발/재건축 연계 분석:**
- 현재 시장 심리는 정비사업에 긍정적 영향
- 여론 회복세로 조합원 참여도 증가 예상
- 정책 완화 기조로 사업 추진 환경 개선

📈 **통합 투자 전략:**
- 시장 심리와 기술적 분석 결합한 의사결정
- 여론 동향을 활용한 진입/출구 타이밍 최적화
- 정비사업 트렌드에 맞춘 선별적 투자

🎯 **최종 권장사항:**
현재 시장 여론과 정비사업 환경을 종합할 때, 
신중한 낙관론을 바탕으로 한 선별적 투자가 적절합니다.
특히 재개발 추진력이 있는 지역에 대한 관심을 높이시기 바랍니다.
            """
            
            return {
                "expert_answer": enhanced_answer,
                "market_analysis": market_analysis,
                "specialization": "재건축/재개발 + 시장여론 + 정비사업 + 종합부동산 전문",
                "confidence": 0.99,
                "expert_level": "최고급 전문가 + 시장 분석가"
            }
        else:
            # 기존 방식으로 처리 (종합 부동산, 조합 운영, 분담금 등)
            return super().generate_expert_advice(query, project_context) if hasattr(super(), 'generate_expert_advice') else {
                "expert_answer": "최고급 종합 전문가 조언을 생성 중입니다.",
                "analysis": query_analysis
            }


# 사용 예시
if __name__ == "__main__":
    specialist = RedevelopmentAISpecialist()
    
    # 테스트 프로젝트 정보
    test_project = {
        "location": "강남구 대치동",
        "area": 15000,  # 15,000㎡
        "household_count": 800,
        "type": "reconstruction",
        "estimated_cost": 5000  # 5000억원
    }
    
    # 사업성 분석
    feasibility = specialist.analyze_project_feasibility(test_project)
    print("=== 재개발 사업성 분석 ===")
    print(f"사업성 점수: {feasibility['feasibility_score']:.2f}")
    print(f"경제성 분석 - ROI: {feasibility['economic_analysis'].roi:.2%}")
    print(f"위험 평가 - 주요 위험: {feasibility['risk_assessment'][0].description}")
    
    # 전문가 조언
    test_query = "조합설립 동의율이 70%인데 75%를 달성하기 위한 전략은?"
    advice = specialist.generate_expert_advice(test_query, test_project)
    print(f"\n=== 전문가 조언 ===")
    print(f"질문: {test_query}")
    print(f"답변:\n{advice['expert_answer']}") 