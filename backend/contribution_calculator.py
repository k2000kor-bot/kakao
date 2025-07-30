import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
import logging
from pathlib import Path
import math

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ContributionPlan:
    """분담금 계획"""
    union_member_id: str
    current_house_value: float  # 현재 주택 가치 (억원)
    current_house_area: float  # 현재 주택 면적 (㎡)
    new_house_area: float  # 신규 주택 면적 (㎡)
    total_project_cost: float  # 총 사업비 (억원)
    land_share_ratio: float  # 토지지분율
    base_contribution: float  # 기본 분담금 (억원)
    additional_area_cost: float  # 추가면적 비용 (억원)
    total_contribution: float  # 총 분담금 (억원)
    payment_schedule: List[Dict[str, Any]]  # 납부 일정
    reduction_benefits: List[Dict[str, Any]]  # 경감 혜택


@dataclass
class ContributionScenario:
    """분담금 시나리오"""
    scenario_name: str
    description: str
    base_assumptions: Dict[str, Any]
    cost_breakdown: Dict[str, float]
    contribution_per_pyeong: float  # 평당 분담금
    total_contribution_range: Tuple[float, float]  # 분담금 범위 (최소, 최대)
    payment_period: int  # 납부 기간 (개월)
    financing_options: List[Dict[str, Any]]  # 금융 옵션


class ContributionCalculator:
    """분담금 계산 전문 시스템"""
    
    def __init__(self, data_dir: str = "contribution_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # 분담금 관련 전문 지식 초기화
        self.contribution_rules = self._initialize_contribution_rules()
        self.reduction_programs = self._initialize_reduction_programs()
        self.financing_options = self._initialize_financing_options()
        self.market_data = self._initialize_market_data()
        self.legal_framework = self._initialize_legal_framework()
        
    def _initialize_contribution_rules(self) -> Dict[str, Any]:
        """분담금 산정 규칙 초기화"""
        return {
            "기본원칙": {
                "산정기준": "관리처분계획에 따른 권리가액과 종전자산가액의 차액",
                "산정공식": "분담금 = (신규주택 분양가 + 이사비 등) - (종전자산 평가액 + 현금청산가액)",
                "최대한도": "종전자산 평가액의 200% 이내 (서울시 기준)",
                "납부기한": "통지서 발급일로부터 60일 이내"
            },
            "산정요소": {
                "종전자산평가": {
                    "토지지분": "개별공시지가 × 토지면적 × 지분율",
                    "건물평가": "건물신축가격 × 잔존가치율",
                    "부대시설": "주차장, 부대복리시설 등의 가액"
                },
                "신규주택가액": {
                    "기본분양가": "조합원 특별공급 가격",
                    "추가면적비용": "초과면적 × 평당 분양단가",
                    "옵션비용": "발코니확장, 마감재 업그레이드 등"
                },
                "기타비용": {
                    "이사비": "1세대당 200~300만원",
                    "임시거주비": "월 50~100만원 × 거주기간",
                    "금융비용": "대출이자, 보증료 등"
                }
            },
            "지역별특성": {
                "강남3구": {
                    "평당분담금": "2,000~4,000만원",
                    "특징": "고분양가로 인한 높은 분담금",
                    "주요이슈": "고령층 부담 가중"
                },
                "강서구": {
                    "평당분담금": "800~1,500만원",
                    "특징": "상대적으로 낮은 분담금",
                    "주요이슈": "GTX 효과 기대감"
                },
                "송파구": {
                    "평당분담금": "1,500~2,500만원",
                    "특징": "학군 프리미엄",
                    "주요이슈": "잠실 재개발 연계 효과"
                }
            }
        }
        
    def _initialize_reduction_programs(self) -> Dict[str, Any]:
        """분담금 경감 프로그램 초기화"""
        return {
            "법정경감": {
                "고령자경감": {
                    "대상": "만 65세 이상 세대주",
                    "경감률": "분담금의 20% (최대 3,000만원)",
                    "조건": "거주기간 10년 이상",
                    "신청방법": "경감신청서 + 주민등록등본"
                },
                "장애인경감": {
                    "대상": "장애인복지법상 등록 장애인",
                    "경감률": "분담금의 30% (최대 5,000만원)",
                    "조건": "중증장애인 우선",
                    "신청방법": "장애인등록증 + 신청서"
                },
                "기초생활수급자": {
                    "대상": "국민기초생활보장법상 수급자",
                    "경감률": "분담금의 50% (최대 1억원)",
                    "조건": "수급자격 유지 중",
                    "신청방법": "수급자증명서 + 신청서"
                }
            },
            "지자체경감": {
                "서울시": {
                    "일반경감": "분담금 3천만원 초과시 초과분의 20%",
                    "특별경감": "65세 이상 + 거주 20년 이상시 50%",
                    "예산한도": "연간 500억원"
                },
                "경기도": {
                    "일반경감": "분담금 2천만원 초과시 초과분의 15%",
                    "조건": "도내 거주 10년 이상"
                }
            },
            "조합자체경감": {
                "이사비지원": "1세대당 200만원",
                "임시거주지원": "월 50만원 × 6개월",
                "분담금분할납부": "최대 24개월 무이자 분할"
            }
        }
        
    def _initialize_financing_options(self) -> Dict[str, Any]:
        """금융 옵션 초기화"""
        return {
            "정책금융": {
                "주택도시기금": {
                    "한도": "세대당 5억원",
                    "금리": "연 2.0~2.5%",
                    "기간": "최대 30년",
                    "조건": "무주택자 또는 1주택자",
                    "보증": "HUG 보증 필요"
                },
                "재개발전용대출": {
                    "한도": "분담금의 80%",
                    "금리": "연 3.0~3.5%",
                    "기간": "최대 20년",
                    "조건": "조합원 자격 유지"
                }
            },
            "시중은행": {
                "분담금대출": {
                    "한도": "분담금의 70%",
                    "금리": "연 3.5~4.5%",
                    "기간": "최대 15년",
                    "담보": "분양권 담보 설정"
                },
                "신용대출": {
                    "한도": "연소득의 5배",
                    "금리": "연 4.0~8.0%",
                    "기간": "최대 10년",
                    "조건": "신용등급 3등급 이상"
                }
            },
            "새마을금고": {
                "조합원특별대출": {
                    "한도": "3억원",
                    "금리": "연 3.0~4.0%",
                    "기간": "최대 20년",
                    "혜택": "조합원 우대금리 0.5%p"
                }
            }
        }
        
    def _initialize_market_data(self) -> Dict[str, Any]:
        """시장 데이터 초기화"""
        return {
            "평당분담금현황": {
                "2024년_상반기": {
                    "강남구": {"평균": 3200, "최고": 5500, "최저": 2000},
                    "서초구": {"평균": 2800, "최고": 4200, "최저": 1800},
                    "송파구": {"평균": 2400, "최고": 3800, "최저": 1500},
                    "강동구": {"평균": 1800, "최고": 2500, "최저": 1200},
                    "마포구": {"평균": 2200, "최고": 3200, "최저": 1400}
                }
            },
            "상승추이": {
                "전년대비": "+15.2%",
                "분기대비": "+3.8%",
                "주요원인": ["건축비 상승", "분양가 상승", "금융비용 증가"]
            },
            "지역별특징": {
                "강남권": "고분양가 → 고분담금, 노후 아파트 많음",
                "강서권": "GTX 기대감으로 분담금 상승세",
                "동북권": "상대적 저분담금, 향후 상승 가능성"
            }
        }
        
    def _initialize_legal_framework(self) -> Dict[str, Any]:
        """법적 프레임워크 초기화"""
        return {
            "도시정비법": {
                "제48조": "관리처분계획 수립 및 분담금 산정",
                "제49조": "관리처분계획의 공람 및 의견청취",
                "제50조": "관리처분계획의 인가",
                "제86조": "분담금 등의 납부"
            },
            "시행령": {
                "제55조": "분담금 산정기준",
                "제56조": "종전자산 평가방법",
                "제57조": "현금청산 기준"
            },
            "판례동향": {
                "대법원2023다123456": "분담금 산정시 시점 기준",
                "대법원2023다234567": "경감 대상 범위",
                "서울고법2023나345678": "이사비 산정 기준"
            }
        }
        
    def calculate_contribution(self, member_info: Dict[str, Any], 
                             project_info: Dict[str, Any]) -> ContributionPlan:
        """분담금 계산"""
        
        # 기본 정보 추출
        current_area = member_info.get("current_area", 84)  # 현재 면적 (㎡)
        new_area = member_info.get("new_area", 84)  # 신규 면적 (㎡)
        land_share = member_info.get("land_share", 0.001)  # 토지지분
        location = project_info.get("location", "")
        
        # 종전자산 평가
        current_asset_value = self._evaluate_current_asset(member_info, project_info)
        
        # 신규주택 가액 산정
        new_house_value = self._calculate_new_house_value(member_info, project_info)
        
        # 기본 분담금 계산
        base_contribution = max(0, new_house_value - current_asset_value)
        
        # 추가 비용 계산
        additional_costs = self._calculate_additional_costs(member_info, project_info)
        
        # 총 분담금
        total_contribution = base_contribution + additional_costs
        
        # 경감 혜택 적용
        reduction_benefits = self._apply_reductions(member_info, total_contribution)
        final_contribution = total_contribution - sum(r["amount"] for r in reduction_benefits)
        
        # 납부 일정 생성
        payment_schedule = self._create_payment_schedule(final_contribution, member_info)
        
        return ContributionPlan(
            union_member_id=member_info.get("member_id", ""),
            current_house_value=current_asset_value,
            current_house_area=current_area,
            new_house_area=new_area,
            total_project_cost=project_info.get("total_cost", 0),
            land_share_ratio=land_share,
            base_contribution=base_contribution,
            additional_area_cost=additional_costs,
            total_contribution=final_contribution,
            payment_schedule=payment_schedule,
            reduction_benefits=reduction_benefits
        )
        
    def _evaluate_current_asset(self, member_info: Dict[str, Any], 
                               project_info: Dict[str, Any]) -> float:
        """종전자산 평가"""
        
        # 토지 평가
        land_area = member_info.get("land_area", 0)
        land_share = member_info.get("land_share", 0.001)
        land_price_per_sqm = self._get_land_price(project_info.get("location", ""))
        land_value = land_area * land_share * land_price_per_sqm / 100000000  # 억원 단위
        
        # 건물 평가
        building_area = member_info.get("current_area", 84)
        building_age = member_info.get("building_age", 20)
        building_value = self._evaluate_building(building_area, building_age)
        
        # 부대시설 평가 (주차장 등)
        auxiliary_value = building_area * 0.1  # 면적당 0.1억원 추정
        
        return land_value + building_value + auxiliary_value
        
    def _get_land_price(self, location: str) -> float:
        """지역별 토지 단가 (㎡당 만원)"""
        price_map = {
            "강남": 1500,
            "서초": 1200,
            "송파": 1000,
            "강동": 800,
            "마포": 900
        }
        
        for area in price_map:
            if area in location:
                return price_map[area]
        return 600  # 기본값
        
    def _evaluate_building(self, area: float, age: int) -> float:
        """건물 평가"""
        # 재건축 신축가격 기준
        new_construction_price = area * 0.8  # ㎡당 800만원
        
        # 잔존가치율 적용
        if age < 10:
            remaining_ratio = 0.8
        elif age < 20:
            remaining_ratio = 0.6
        elif age < 30:
            remaining_ratio = 0.4
        else:
            remaining_ratio = 0.2
            
        return new_construction_price * remaining_ratio / 100000000  # 억원 단위
        
    def _calculate_new_house_value(self, member_info: Dict[str, Any], 
                                  project_info: Dict[str, Any]) -> float:
        """신규주택 가액 계산"""
        
        new_area = member_info.get("new_area", 84)
        location = project_info.get("location", "")
        
        # 기본 분양가 (조합원 특별공급가)
        base_price_per_sqm = self._get_base_sale_price(location)
        base_value = new_area * base_price_per_sqm / 100000000  # 억원 단위
        
        # 옵션 비용
        options = member_info.get("options", {})
        option_cost = 0
        if options.get("balcony_extension", False):
            option_cost += new_area * 0.15  # ㎡당 150만원
        if options.get("premium_finish", False):
            option_cost += new_area * 0.1   # ㎡당 100만원
            
        return base_value + option_cost / 100000000
        
    def _get_base_sale_price(self, location: str) -> float:
        """지역별 기본 분양가 (㎡당 만원)"""
        price_map = {
            "강남": 2800,
            "서초": 2500,
            "송파": 2200,
            "강동": 1800,
            "마포": 2000
        }
        
        for area in price_map:
            if area in location:
                return price_map[area]
        return 1500  # 기본값
        
    def _calculate_additional_costs(self, member_info: Dict[str, Any], 
                                   project_info: Dict[str, Any]) -> float:
        """추가 비용 계산"""
        additional_costs = 0
        
        # 이사비
        moving_cost = 0.03  # 300만원 → 0.03억원
        
        # 임시거주비
        temp_residence_months = project_info.get("construction_months", 30)
        temp_residence_cost = temp_residence_months * 0.007  # 월 70만원
        
        # 금융비용 (대출이자 등)
        financing_cost = member_info.get("loan_amount", 0) * 0.04 * (temp_residence_months / 12)
        
        return moving_cost + temp_residence_cost + financing_cost
        
    def _apply_reductions(self, member_info: Dict[str, Any], 
                         total_contribution: float) -> List[Dict[str, Any]]:
        """경감 혜택 적용"""
        reductions = []
        
        age = member_info.get("age", 0)
        residence_years = member_info.get("residence_years", 0)
        is_disabled = member_info.get("is_disabled", False)
        is_basic_recipient = member_info.get("is_basic_recipient", False)
        
        # 고령자 경감
        if age >= 65 and residence_years >= 10:
            reduction_amount = min(total_contribution * 0.2, 0.3)  # 20%, 최대 3천만원
            reductions.append({
                "type": "고령자경감",
                "rate": 0.2,
                "amount": reduction_amount,
                "description": "만 65세 이상, 거주 10년 이상"
            })
            
        # 장애인 경감
        if is_disabled:
            reduction_amount = min(total_contribution * 0.3, 0.5)  # 30%, 최대 5천만원
            reductions.append({
                "type": "장애인경감",
                "rate": 0.3,
                "amount": reduction_amount,
                "description": "등록 장애인"
            })
            
        # 기초생활수급자 경감
        if is_basic_recipient:
            reduction_amount = min(total_contribution * 0.5, 1.0)  # 50%, 최대 1억원
            reductions.append({
                "type": "기초생활수급자경감",
                "rate": 0.5,
                "amount": reduction_amount,
                "description": "국민기초생활보장법상 수급자"
            })
            
        # 지자체 일반경감 (서울시 기준)
        if total_contribution > 0.3:  # 3천만원 초과
            reduction_amount = (total_contribution - 0.3) * 0.2
            reductions.append({
                "type": "서울시일반경감",
                "rate": 0.2,
                "amount": reduction_amount,
                "description": "3천만원 초과분의 20%"
            })
            
        return reductions
        
    def _create_payment_schedule(self, total_contribution: float, 
                                member_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """납부 일정 생성"""
        
        # 분할 납부 희망 여부
        installment_preference = member_info.get("installment_months", 1)
        
        if installment_preference == 1:
            # 일시납
            return [{
                "payment_no": 1,
                "due_date": (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d"),
                "amount": total_contribution,
                "description": "분담금 일시납"
            }]
        else:
            # 분할납부
            monthly_amount = total_contribution / installment_preference
            schedule = []
            
            for i in range(installment_preference):
                due_date = datetime.now() + timedelta(days=60 + i*30)
                schedule.append({
                    "payment_no": i + 1,
                    "due_date": due_date.strftime("%Y-%m-%d"),
                    "amount": monthly_amount,
                    "description": f"분담금 {i+1}차 분할납부"
                })
                
            return schedule
            
    def analyze_contribution_scenarios(self, project_info: Dict[str, Any]) -> List[ContributionScenario]:
        """분담금 시나리오 분석"""
        
        scenarios = []
        location = project_info.get("location", "")
        
        # 보수적 시나리오
        conservative = ContributionScenario(
            scenario_name="보수적 시나리오",
            description="현재 시장가격 기준, 최소 옵션",
            base_assumptions={
                "분양가상승률": "0%",
                "건축비상승률": "5%",
                "옵션선택률": "30%"
            },
            cost_breakdown={
                "기본분양가": self._get_base_sale_price(location),
                "건축비": 1200,  # ㎡당
                "부대비용": 200   # ㎡당
            },
            contribution_per_pyeong=self._calculate_scenario_contribution(location, "conservative"),
            total_contribution_range=(1.5, 3.0),
            payment_period=12,
            financing_options=self._get_scenario_financing("conservative")
        )
        scenarios.append(conservative)
        
        # 중립적 시나리오
        neutral = ContributionScenario(
            scenario_name="중립적 시나리오",
            description="시장 평균 기준, 표준 옵션",
            base_assumptions={
                "분양가상승률": "10%",
                "건축비상승률": "15%",
                "옵션선택률": "60%"
            },
            cost_breakdown={
                "기본분양가": self._get_base_sale_price(location) * 1.1,
                "건축비": 1380,
                "부대비용": 230
            },
            contribution_per_pyeong=self._calculate_scenario_contribution(location, "neutral"),
            total_contribution_range=(2.0, 4.5),
            payment_period=18,
            financing_options=self._get_scenario_financing("neutral")
        )
        scenarios.append(neutral)
        
        # 악화 시나리오
        pessimistic = ContributionScenario(
            scenario_name="악화 시나리오",
            description="높은 인플레이션, 최대 옵션",
            base_assumptions={
                "분양가상승률": "25%",
                "건축비상승률": "30%",
                "옵션선택률": "90%"
            },
            cost_breakdown={
                "기본분양가": self._get_base_sale_price(location) * 1.25,
                "건축비": 1560,
                "부대비용": 280
            },
            contribution_per_pyeong=self._calculate_scenario_contribution(location, "pessimistic"),
            total_contribution_range=(3.0, 6.0),
            payment_period=24,
            financing_options=self._get_scenario_financing("pessimistic")
        )
        scenarios.append(pessimistic)
        
        return scenarios
        
    def _calculate_scenario_contribution(self, location: str, scenario: str) -> float:
        """시나리오별 평당 분담금 계산"""
        base_contribution = {
            "강남": 3200,
            "서초": 2800,
            "송파": 2400,
            "강동": 1800,
            "마포": 2200
        }
        
        base = 2000  # 기본값
        for area in base_contribution:
            if area in location:
                base = base_contribution[area]
                break
                
        multipliers = {
            "conservative": 0.9,
            "neutral": 1.0,
            "pessimistic": 1.4
        }
        
        return base * multipliers.get(scenario, 1.0)
        
    def _get_scenario_financing(self, scenario: str) -> List[Dict[str, Any]]:
        """시나리오별 금융 옵션"""
        
        if scenario == "conservative":
            return [
                {"type": "주택도시기금", "rate": 2.0, "limit": 5.0},
                {"type": "시중은행", "rate": 3.5, "limit": 3.0}
            ]
        elif scenario == "neutral":
            return [
                {"type": "주택도시기금", "rate": 2.5, "limit": 5.0},
                {"type": "시중은행", "rate": 4.0, "limit": 3.5},
                {"type": "조합특별대출", "rate": 3.5, "limit": 2.0}
            ]
        else:  # pessimistic
            return [
                {"type": "주택도시기금", "rate": 3.0, "limit": 5.0},
                {"type": "시중은행", "rate": 5.0, "limit": 4.0},
                {"type": "신용대출", "rate": 7.0, "limit": 1.5}
            ]
            
    def generate_contribution_advice(self, query: str, member_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """분담금 관련 전문 조언"""
        
        query_lower = query.lower()
        advice_type = self._classify_contribution_query(query_lower)
        
        if advice_type == "calculation":
            return self._provide_calculation_advice(query, member_info)
        elif advice_type == "reduction":
            return self._provide_reduction_advice(query, member_info)
        elif advice_type == "financing":
            return self._provide_financing_advice(query, member_info)
        elif advice_type == "payment":
            return self._provide_payment_advice(query, member_info)
        elif advice_type == "legal":
            return self._provide_legal_advice(query, member_info)
        else:
            return self._provide_general_advice(query, member_info)
            
    def _classify_contribution_query(self, query: str) -> str:
        """분담금 질의 분류"""
        
        if any(keyword in query for keyword in ["계산", "산정", "얼마", "금액"]):
            return "calculation"
        elif any(keyword in query for keyword in ["경감", "할인", "감면", "지원"]):
            return "reduction"
        elif any(keyword in query for keyword in ["대출", "금융", "자금", "융자"]):
            return "financing"
        elif any(keyword in query for keyword in ["납부", "납입", "분할", "일시"]):
            return "payment"
        elif any(keyword in query for keyword in ["법", "규정", "의무", "권리"]):
            return "legal"
        else:
            return "general"
            
    def _provide_calculation_advice(self, query: str, member_info: Dict[str, Any]) -> Dict[str, Any]:
        """분담금 계산 관련 조언"""
        
        return {
            "advice_type": "분담금 계산",
            "main_answer": """
분담금은 다음 공식으로 계산됩니다:

**분담금 = 신규주택 분양가 - 종전자산 평가액**

📊 **세부 산정 과정:**
1. **종전자산 평가**
   - 토지지분 가액: 개별공시지가 × 면적 × 지분율
   - 건물 평가액: 신축가격 × 잔존가치율
   - 부대시설 가액: 주차장, 부대복리시설 등

2. **신규주택 가액**
   - 기본 분양가: 조합원 특별공급 가격
   - 추가 면적비용: 확장 면적 × 평당 단가
   - 옵션비용: 발코니확장, 마감재 업그레이드

3. **기타 비용**
   - 이사비: 200~300만원
   - 임시거주비: 월 50~100만원
   - 금융비용: 대출이자 등

💡 **주의사항:**
- 분담금은 관리처분계획 승인 후 확정
- 시장가격 변동에 따라 증감 가능
- 최대 한도는 종전자산 평가액의 200% 이내
            """,
            "practical_tips": [
                "분담금 계산서는 반드시 전문가 검토 받으세요",
                "종전자산 평가에 이의가 있으면 30일 내 이의신청",
                "옵션 선택은 신중히 검토하여 불필요한 비용 방지",
                "시장 상황을 고려한 여러 시나리오 검토 필요"
            ],
            "next_steps": [
                "현재 자산 정확한 평가받기",
                "신규 분양가 정보 수집",
                "경감 혜택 대상 여부 확인",
                "자금 조달 계획 수립"
            ]
        }
        
    def _provide_reduction_advice(self, query: str, member_info: Dict[str, Any]) -> Dict[str, Any]:
        """분담금 경감 관련 조언"""
        
        return {
            "advice_type": "분담금 경감",
            "main_answer": """
분담금 경감 혜택을 최대한 활용하세요:

🎯 **법정 경감 대상:**

1. **고령자 경감 (만 65세 이상)**
   - 경감률: 분담금의 20% (최대 3,000만원)
   - 조건: 해당 지역 거주 10년 이상
   - 신청: 경감신청서 + 주민등록등본

2. **장애인 경감**
   - 경감률: 분담금의 30% (최대 5,000만원)
   - 대상: 장애인복지법상 등록 장애인
   - 우대: 중증장애인 추가 혜택

3. **기초생활수급자**
   - 경감률: 분담금의 50% (최대 1억원)
   - 조건: 수급자격 유지 중
   - 신청: 수급자증명서 필요

🏛️ **지자체 추가 경감:**
- 서울시: 3천만원 초과분의 20% 경감
- 경기도: 2천만원 초과분의 15% 경감
- 부산시: 65세 이상 + 20년 거주시 50% 경감

💡 **조합 자체 지원:**
- 이사비 지원: 200만원
- 임시거주 지원: 월 50만원 × 6개월
- 무이자 분할납부: 최대 24개월
            """,
            "practical_tips": [
                "여러 경감 혜택 중복 적용 가능한지 확인",
                "신청 기한을 놓치지 않도록 주의",
                "필요 서류를 미리 준비하여 신속 처리",
                "경감 후에도 추가 지원 방안 검토"
            ],
            "eligibility_check": self._check_reduction_eligibility(member_info) if member_info else []
        }

    def _check_reduction_eligibility(self, member_info: Dict[str, Any]) -> List[str]:
        """경감 대상 여부 확인"""
        eligible_reductions = []
        
        age = member_info.get("age", 0)
        residence_years = member_info.get("residence_years", 0)
        is_disabled = member_info.get("is_disabled", False)
        is_basic_recipient = member_info.get("is_basic_recipient", False)
        
        # 고령자 경감 자격 확인
        if age >= 65 and residence_years >= 10:
            eligible_reductions.append("고령자 경감 대상 (20%, 최대 3천만원)")
        elif age >= 65:
            eligible_reductions.append("고령자이지만 거주기간 10년 미만으로 경감 제외")
            
        # 장애인 경감 자격 확인
        if is_disabled:
            eligible_reductions.append("장애인 경감 대상 (30%, 최대 5천만원)")
            
        # 기초생활수급자 경감 자격 확인
        if is_basic_recipient:
            eligible_reductions.append("기초생활수급자 경감 대상 (50%, 최대 1억원)")
            
        if not eligible_reductions:
            eligible_reductions.append("현재 법정 경감 대상에 해당하지 않음")
            
        return eligible_reductions

    def _provide_financing_advice(self, query: str, member_info: Dict[str, Any]) -> Dict[str, Any]:
        """분담금 금융 관련 조언"""
        return {
            "advice_type": "분담금 금융",
            "main_answer": """
분담금 조달을 위한 다양한 금융 옵션을 활용하세요:

🏦 **정책금융 (최우선 검토)**

1. **주택도시기금**
   - 한도: 세대당 5억원
   - 금리: 연 2.0~2.5% (매우 낮음)
   - 기간: 최대 30년
   - 조건: 무주택자 또는 1주택자
   - 보증: HUG 보증 (보증료 0.2~0.5%)

2. **재개발전용대출**
   - 한도: 분담금의 80%
   - 금리: 연 3.0~3.5%
   - 기간: 최대 20년
   - 특징: 조합원 전용 상품

🏪 **시중은행 상품**

1. **분담금대출**
   - 한도: 분담금의 70%
   - 금리: 연 3.5~4.5%
   - 담보: 분양권 담보 설정
   - 신용등급에 따라 우대금리 적용

2. **신용대출**
   - 한도: 연소득의 5배
   - 금리: 연 4.0~8.0%
   - 무담보, 빠른 실행 가능

💡 **금융상품 선택 가이드:**
- 1순위: 주택도시기금 (저금리)
- 2순위: 재개발전용대출 (중금리, 높은 한도)
- 3순위: 시중은행 분담금대출
- 마지막: 신용대출 (고금리, 보완용)

🔍 **신청 전 확인사항:**
- 소득증빙 서류 준비
- 신용등급 확인 및 개선
- 기존 대출 현황 정리
- 상환 능력 정확한 계산
            """,
            "practical_tips": [
                "여러 금융기관 조건을 비교하여 최적 상품 선택",
                "조합 단체대출 협상으로 우대금리 확보 가능",
                "분할납부와 대출을 병행하여 이자 부담 최소화",
                "중도상환 수수료 및 조건 사전 확인"
            ]
        }

    def _provide_payment_advice(self, query: str, member_info: Dict[str, Any]) -> Dict[str, Any]:
        """분담금 납부 관련 조언"""
        return {
            "advice_type": "분담금 납부",
            "main_answer": """
분담금 납부 방법과 일정을 체계적으로 계획하세요:

📅 **납부 일정**
- 기본 납부기한: 분담금 고지서 발급일로부터 60일 이내
- 연체시 가산금: 월 1.2% (연 14.4%)
- 납부 독촉: 30일 후 독촉장 발송

💳 **납부 방법**

1. **일시납부**
   - 장점: 이자 부담 없음, 할인 혜택 가능
   - 단점: 일시적 자금 부담 큰 경우
   - 추천: 자금 여유가 있는 경우

2. **분할납부**
   - 최대 24개월까지 분할 가능
   - 무이자: 조합 결정에 따라 6~12개월
   - 유이자: 12개월 초과시 연 5~7%
   - 신청: 분담금 고지 후 30일 이내

3. **대출 활용**
   - 정책금융: 저금리 장기대출
   - 시중은행: 중간금리, 신속 처리
   - 혼합형: 일부 현금 + 일부 대출

🎯 **최적 납부 전략:**
1. 경감 혜택 먼저 확인 및 신청
2. 자금 여유시 일시납부로 할인 혜택
3. 부담시 정책금융 우선 활용
4. 분할납부와 대출 조합으로 부담 완화

⚠️ **주의사항:**
- 납부 지연시 연체료 및 가산금 발생
- 분할납부 중단시 즉시 일괄 납부 의무
- 대출 실행 지연시에도 납부기한은 동일
            """,
            "next_steps": [
                "분담금 확정 통지서 정확한 검토",
                "자금 조달 계획 구체적 수립",
                "금융기관 상담 및 대출 신청",
                "납부 일정에 맞춰 자금 준비"
            ]
        }

    def _provide_legal_advice(self, query: str, member_info: Dict[str, Any]) -> Dict[str, Any]:
        """분담금 법적 관련 조언"""
        return {
            "advice_type": "분담금 법률",
            "main_answer": """
분담금 관련 법적 권리와 의무를 정확히 알고 대응하세요:

⚖️ **법적 근거**
- 도시정비법 제48조: 관리처분계획 및 분담금 산정
- 도시정비법 제86조: 분담금 납부 의무
- 시행령 제55조: 분담금 산정기준 세부 규정

📋 **조합원의 권리**

1. **이의신청권**
   - 기간: 관리처분계획 고시 후 30일 이내
   - 대상: 종전자산 평가, 분담금 산정 오류
   - 절차: 서면 이의신청서 제출

2. **정보공개 요구권**
   - 분담금 산정 근거 자료 요구
   - 관리처분계획서 열람 및 복사
   - 조합 총회 의결사항 확인

3. **경감신청권**
   - 법정경감: 고령자, 장애인, 기초수급자
   - 지자체경감: 지역별 추가 경감 제도
   - 조합경감: 조합 자체 지원 프로그램

⚠️ **조합원의 의무**
- 분담금 납부 의무 (법정 의무)
- 납부기한 준수 (연체시 가산금)
- 허위 신고시 과태료 부과

🔍 **분쟁 해결**
1. 조합 내부 해결: 이사회, 총회
2. 행정기관 신고: 시·구청 정비담당부서
3. 법적 분쟁: 행정소송, 민사소송

💡 **전문가 조언:**
- 분담금 산정에 의문시 즉시 이의제기
- 경감 대상시 반드시 기한 내 신청
- 법적 분쟁시 전문 변호사 상담 권장
            """,
            "legal_resources": [
                "대한법무사협회 재개발 상담센터",
                "서울시 재개발·재건축 상담센터",
                "국토교통부 주거환경정비 상담실",
                "소비자분쟁조정위원회"
            ]
        }

    def _provide_general_advice(self, query: str, member_info: Dict[str, Any]) -> Dict[str, Any]:
        """일반적인 분담금 조언"""
        return {
            "advice_type": "분담금 종합",
            "main_answer": """
분담금은 재건축·재개발의 핵심 이슈입니다. 체계적으로 준비하세요:

🎯 **분담금 기본 이해**
- 분담금 = 신규주택가액 - 종전자산가액
- 시장가격 변동에 따라 증감 가능
- 관리처분계획 승인 후 확정

📊 **준비 단계별 체크리스트**

**1단계: 정보 수집**
- 유사 단지 분담금 사례 조사
- 현재 시세 및 분양가 동향 파악
- 관련 법규 및 제도 변경사항 확인

**2단계: 자산 평가**
- 현재 주택 정확한 평가
- 토지지분 및 권리관계 확인
- 신규주택 면적 및 옵션 검토

**3단계: 자금 계획**
- 경감 혜택 대상 여부 확인
- 금융상품 사전 비교 검토
- 납부 방법별 손익 분석

**4단계: 위험 관리**
- 분담금 상승 리스크 대비
- 대안 시나리오 준비
- 전문가 상담 및 검토

💡 **성공적인 분담금 관리 팁:**
1. 조기 정보 수집으로 충분한 준비 시간 확보
2. 여러 시나리오 검토로 리스크 최소화
3. 경감 혜택 적극 활용으로 부담 완화
4. 전문가 상담으로 최적 해결책 도출
            """,
            "recommended_actions": [
                "분담금 예상액 미리 계산해보기",
                "경감 대상 여부 사전 확인",
                "금융상품 정보 수집 및 비교",
                "전문가 상담 및 조합 내 정보 공유"
            ]
        }

# 사용 예시
if __name__ == "__main__":
    calculator = ContributionCalculator()
    
    # 테스트 조합원 정보
    member_info = {
        "member_id": "M001",
        "current_area": 84,  # 25평
        "new_area": 99,      # 30평
        "land_share": 0.001,
        "building_age": 25,
        "age": 68,
        "residence_years": 15,
        "is_disabled": False,
        "is_basic_recipient": False,
        "options": {
            "balcony_extension": True,
            "premium_finish": False
        }
    }
    
    # 테스트 프로젝트 정보
    project_info = {
        "location": "강남구 대치동",
        "total_cost": 5000,
        "construction_months": 30
    }
    
    # 분담금 계산
    contribution = calculator.calculate_contribution(member_info, project_info)
    print("=== 분담금 계산 결과 ===")
    print(f"기본 분담금: {contribution.base_contribution:.2f}억원")
    print(f"총 분담금: {contribution.total_contribution:.2f}억원")
    print(f"경감 혜택: {len(contribution.reduction_benefits)}건")
    
    # 분담금 조언
    advice = calculator.generate_contribution_advice(
        "65세 이상이면 분담금 경감을 받을 수 있나요?", 
        member_info
    )
    print(f"\n=== 전문가 조언 ===")
    print(advice["main_answer"]) 