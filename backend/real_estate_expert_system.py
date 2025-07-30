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
class PropertyAnalysis:
    """부동산 분석 결과"""
    property_id: str
    location: str
    property_type: str  # 아파트, 오피스텔, 상가, 토지
    current_value: float  # 현재 시세 (억원)
    predicted_value: float  # 예상 시세 (억원)
    investment_score: float  # 투자 점수 (1-10)
    risk_level: str  # 위험도 (낮음/보통/높음)
    recommendations: List[str]  # 권장사항
    market_factors: Dict[str, Any]  # 시장 요인들


@dataclass
class ArchitecturalDesign:
    """건축 설계 정보"""
    design_id: str
    project_name: str
    building_type: str  # 공동주택, 상업시설, 복합시설
    total_area: float  # 총 연면적 (㎡)
    efficiency_ratio: float  # 효율성 비율
    design_concept: str  # 설계 개념
    sustainability_score: float  # 지속가능성 점수
    cost_estimate: float  # 건축비 추정 (억원)
    compliance_status: Dict[str, bool]  # 법규 준수 상태


class RealEstateExpertSystem:
    """부동산 및 건축 종합 전문가 시스템"""
    
    def __init__(self, data_dir: str = "real_estate_expert_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # 전문가 시스템 초기화
        self.market_data = self._initialize_market_data()
        self.investment_strategies = self._initialize_investment_strategies()
        self.architectural_standards = self._initialize_architectural_standards()
        self.consulting_frameworks = self._initialize_consulting_frameworks()
        self.legal_knowledge = self._initialize_legal_knowledge()
        self.valuation_models = self._initialize_valuation_models()
        self.design_principles = self._initialize_design_principles()
        
    def _initialize_market_data(self) -> Dict[str, Any]:
        """부동산 시장 데이터 초기화"""
        return {
            "서울시장현황": {
                "강남구": {
                    "아파트평균가": 15.2,  # 억원/㎡당
                    "전년대비상승률": 8.5,
                    "거래량": "월 450건",
                    "주요이슈": ["재건축 기대감", "학군 프리미엄", "교통 접근성"],
                    "투자매력도": 9.2
                },
                "서초구": {
                    "아파트평균가": 13.8,
                    "전년대비상승률": 7.2,
                    "거래량": "월 380건",
                    "주요이슈": ["법조타운 인접", "교육환경 우수"],
                    "투자매력도": 8.8
                },
                "송파구": {
                    "아파트평균가": 11.5,
                    "전년대비상승률": 12.3,
                    "거래량": "월 520건",
                    "주요이슈": ["잠실 재개발", "롯데타워 효과"],
                    "투자매력도": 8.5
                }
            },
            "시장전망": {
                "단기전망": {
                    "기간": "6개월",
                    "예상변동률": "+3~5%",
                    "주요변수": ["금리 정책", "정부 규제", "공급 물량"]
                },
                "중기전망": {
                    "기간": "2-3년",
                    "예상변동률": "+10~15%",
                    "주요변수": ["재개발 사업", "GTX 개통", "인구 유입"]
                },
                "장기전망": {
                    "기간": "5-10년",
                    "예상변동률": "+20~30%",
                    "주요변수": ["도시 개발", "인프라 확충", "경제 성장"]
                }
            },
            "투자핫스팟": [
                {
                    "지역": "강동구 암사동",
                    "이유": "3기 신도시 개발",
                    "예상상승률": "+25%",
                    "투자시점": "현재"
                },
                {
                    "지역": "용산구 한남동",
                    "이유": "재개발 본격화",
                    "예상상승률": "+30%",
                    "투자시점": "6개월 이내"
                }
            ]
        }
        
    def _initialize_investment_strategies(self) -> Dict[str, Any]:
        """부동산 투자 전략 초기화"""
        return {
            "투자유형별전략": {
                "안정형투자": {
                    "특징": "낮은 위험, 안정적 수익",
                    "추천지역": ["강남 기존 단지", "분당 성숙 지역"],
                    "예상수익률": "연 3-5%",
                    "투자기간": "5-10년",
                    "주의사항": ["유지비 고려", "시설 노후화"]
                },
                "성장형투자": {
                    "특징": "중간 위험, 성장 잠재력",
                    "추천지역": ["재개발 예정지", "신규 인프라 인근"],
                    "예상수익률": "연 8-12%",
                    "투자기간": "3-7년",
                    "주의사항": ["개발 불확실성", "정책 변화"]
                },
                "공격형투자": {
                    "특징": "높은 위험, 고수익 추구",
                    "추천지역": ["신도시 개발지", "역세권 개발"],
                    "예상수익률": "연 15-25%",
                    "투자기간": "1-5년",
                    "주의사항": ["시장 변동성", "유동성 위험"]
                }
            },
            "라이프사이클별전략": {
                "20-30대": {
                    "투자목표": "내 집 마련 + 자산 형성",
                    "추천전략": "소형 아파트 → 중형 아파트",
                    "자금조달": "전세자금대출 + 청년 특례",
                    "주요고려사항": ["직장 접근성", "미래 확장성"]
                },
                "40-50대": {
                    "투자목표": "자산 극대화 + 노후 준비",
                    "추천전략": "다세대 + 상업시설 투자",
                    "자금조달": "기존 주택 담보 + 투자대출",
                    "주요고려사항": ["임대수익률", "시세차익"]
                },
                "60대이상": {
                    "투자목표": "안정적 임대수익",
                    "추천전략": "역세권 오피스텔 + REITs",
                    "자금조달": "현금 비중 확대",
                    "주요고려사항": ["유지관리 편의성", "유동성"]
                }
            },
            "시장상황별전략": {
                "상승장": {
                    "전략": "매수 타이밍 중요, 갭투자 활용",
                    "주의사항": "과열 신호 주의, 적정가 매수"
                },
                "하락장": {
                    "전략": "우량 물건 선별 매수, 현금 비중 확대",
                    "주의사항": "충분한 여유자금 확보"
                },
                "횡보장": {
                    "전략": "임대수익 중심, 리모델링 투자",
                    "주의사항": "매매차익 기대 절제"
                }
            }
        }
        
    def _initialize_architectural_standards(self) -> Dict[str, Any]:
        """건축 기준 및 표준 초기화"""
        return {
            "설계기준": {
                "주거건축물": {
                    "층고": "2.3m 이상 (거실 기준)",
                    "채광": "바닥면적의 1/10 이상",
                    "환기": "자연환기 + 기계환기 병행",
                    "방음": "경계벽 50dB 이하",
                    "내진설계": "진도 VII 이상 대응"
                },
                "상업건축물": {
                    "층고": "3.0m 이상",
                    "하중": "500kg/㎡ 이상",
                    "피난": "2방향 피난계단 확보",
                    "주차": "연면적 25㎡당 1대",
                    "장애인시설": "전체의 5% 이상"
                }
            },
            "친환경기준": {
                "에너지효율": {
                    "1등급": "60kWh/㎡·년 이하",
                    "2등급": "90kWh/㎡·년 이하",
                    "3등급": "120kWh/㎡·년 이하"
                },
                "신재생에너지": {
                    "의무비율": "연면적 3,000㎡ 이상시 12%",
                    "권장기술": ["태양광", "지열", "풍력"]
                },
                "녹색건축인증": {
                    "최우수": "80점 이상",
                    "우수": "65-79점",
                    "일반": "50-64점"
                }
            },
            "스마트건축": {
                "IoT시설": ["스마트홈", "원격검침", "통합관제"],
                "보안시설": ["비접촉 출입", "AI 보안", "통합관리"],
                "편의시설": ["무인택배", "공유서비스", "예약시스템"]
            }
        }
        
    def _initialize_consulting_frameworks(self) -> Dict[str, Any]:
        """컨설팅 프레임워크 초기화"""
        return {
            "부동산컨설팅프로세스": {
                "1단계_현황분석": {
                    "목적": "고객 니즈 및 현재 상황 파악",
                    "조사항목": ["자산현황", "투자목표", "위험성향", "자금여력"],
                    "소요기간": "1-2주",
                    "산출물": "현황분석보고서"
                },
                "2단계_시장분석": {
                    "목적": "투자대상 지역 및 물건 분석",
                    "조사항목": ["시세동향", "거래현황", "개발계획", "교통여건"],
                    "소요기간": "2-3주",
                    "산출물": "시장분석보고서"
                },
                "3단계_투자전략수립": {
                    "목적": "최적 투자 전략 및 포트폴리오 구성",
                    "검토사항": ["수익성", "안전성", "유동성", "세금효과"],
                    "소요기간": "1-2주",
                    "산출물": "투자전략보고서"
                },
                "4단계_실행지원": {
                    "목적": "투자 실행 및 사후관리",
                    "지원내용": ["물건선정", "자금조달", "계약지원", "관리방안"],
                    "소요기간": "지속적",
                    "산출물": "실행결과보고서"
                }
            },
            "가치평가모델": {
                "DCF모델": {
                    "적용대상": "임대용 부동산",
                    "핵심변수": ["임대수익", "할인율", "잔존가치"],
                    "장점": "객관적 수치 기반",
                    "단점": "미래 예측의 불확실성"
                },
                "비교법": {
                    "적용대상": "일반 거주용 부동산",
                    "핵심변수": ["유사물건 거래가", "차이점 보정"],
                    "장점": "시장 현실 반영",
                    "단점": "비교대상 선정의 주관성"
                },
                "원가법": {
                    "적용대상": "신축 또는 특수용도",
                    "핵심변수": ["토지가격", "건축비", "감가상각"],
                    "장점": "명확한 산정 기준",
                    "단점": "시장가치와의 괴리"
                }
            }
        }
        
    def _initialize_design_principles(self) -> Dict[str, Any]:
        """설계 원칙 초기화"""
        return {
            "설계철학": {
                "인간중심설계": {
                    "원칙": "사용자의 편의성과 안전성 최우선",
                    "적용방법": ["유니버설 디자인", "행동패턴 분석", "접근성 확보"],
                    "평가기준": ["사용성", "안전성", "접근성"]
                },
                "지속가능설계": {
                    "원칙": "환경 영향 최소화 및 자원 효율성",
                    "적용방법": ["친환경 자재", "에너지 절약", "폐기물 감소"],
                    "평가기준": ["환경성", "경제성", "사회성"]
                },
                "맥락적설계": {
                    "원칙": "지역 특성 및 문화 반영",
                    "적용방법": ["지역 재료 활용", "전통 요소 현대적 해석"],
                    "평가기준": ["조화성", "정체성", "차별성"]
                }
            },
            "공간구성원칙": {
                "기능적배치": {
                    "공적공간": ["현관", "거실", "주방"],
                    "사적공간": ["침실", "서재", "드레스룸"],
                    "서비스공간": ["화장실", "다용도실", "팬트리"],
                    "동선계획": "최단거리, 교차 최소화"
                },
                "비례와균형": {
                    "황금비율": "1:1.618 적용",
                    "모듈시스템": "900mm 기본 모듈",
                    "시각적균형": "대칭 vs 비대칭의 조화"
                }
            },
            "최신트렌드": {
                "2024년_키워드": [
                    "홈 오피스 (재택근무 공간)",
                    "멀티스페이스 (가변형 공간)",
                    "스마트홈 (IoT 연동)",
                    "바이오필릭 디자인 (자연 요소)",
                    "미니멀리즘 (간결한 디자인)"
                ],
                "미래전망": [
                    "VR/AR 활용 설계",
                    "AI 기반 공간 최적화",
                    "모듈러 건축 확산",
                    "탄소중립 건축"
                ]
            }
        }
        
    def _initialize_legal_knowledge(self) -> Dict[str, Any]:
        """부동산 관련 법규 지식 초기화"""
        return {
            "거래관련법": {
                "부동산거래신고법": {
                    "신고대상": "토지 거래, 부동산 매매",
                    "신고기한": "계약체결일로부터 30일 이내",
                    "신고기관": "시·군·구청",
                    "위반시제재": "과태료 500만원 이하"
                },
                "부동산중개업법": {
                    "중개수수료": "매매 0.5%, 임대 0.4%",
                    "중개업자의무": ["확인설명서", "계약서 작성", "보증보험"],
                    "위반시제재": ["업무정지", "등록취소", "과태료"]
                }
            },
            "세무관련법": {
                "양도소득세": {
                    "세율": "6~45% (소유기간별 차등)",
                    "비과세": ["1세대1주택 2년 거주"],
                    "감면": ["장기보유특별공제", "고령자 공제"]
                },
                "취득세": {
                    "세율": "1~3% (취득가액 기준)",
                    "감면": ["신혼부부", "생애최초"]
                }
            },
            "건축관련법": {
                "건축법": {
                    "건폐율": "용도지역별 차등 (40~80%)",
                    "용적률": "용도지역별 차등 (100~1500%)",
                    "높이제한": "용도지역별 차등"
                },
                "주택법": {
                    "주택규모": "전용면적 85㎡ 이하 = 국민주택",
                    "공급의무": "일정 규모 이상 단지"
                }
            }
        }
        
    def _initialize_valuation_models(self) -> Dict[str, Any]:
        """부동산 가치평가 모델 초기화"""
        return {
            "수익가치평가": {
                "순현재가치법": {
                    "공식": "Σ(순수익 / (1+할인율)^n)",
                    "적용": "임대용 부동산",
                    "핵심변수": ["월임대료", "공실률", "관리비", "할인율"]
                },
                "직접자본환원법": {
                    "공식": "순영업수익 / 자본환원율",
                    "적용": "안정적 임대수익 부동산",
                    "핵심변수": ["연간순수익", "자본환원율"]
                }
            },
            "시장가치평가": {
                "회귀분석모델": {
                    "변수": ["면적", "층수", "역세권", "학군", "연식"],
                    "정확도": "±5-10%",
                    "업데이트": "월 1회"
                },
                "인공지능모델": {
                    "변수": "500+ 개 요인",
                    "정확도": "±3-7%",
                    "업데이트": "실시간"
                }
            }
        }
        
    def analyze_property_investment(self, property_info: Dict[str, Any], 
                                   investor_profile: Dict[str, Any]) -> PropertyAnalysis:
        """부동산 투자 분석"""
        
        location = property_info.get("location", "")
        property_type = property_info.get("type", "아파트")
        area = property_info.get("area", 84)
        current_price = property_info.get("price", 10.0)
        
        # 시장 분석
        market_info = self._analyze_market_conditions(location)
        
        # 투자 점수 계산
        investment_score = self._calculate_investment_score(
            property_info, investor_profile, market_info
        )
        
        # 가치 예측
        predicted_value = self._predict_property_value(
            property_info, market_info
        )
        
        # 위험도 평가
        risk_level = self._assess_investment_risk(
            property_info, market_info, investor_profile
        )
        
        # 권장사항 생성
        recommendations = self._generate_investment_recommendations(
            investment_score, risk_level, investor_profile
        )
        
        return PropertyAnalysis(
            property_id=property_info.get("id", ""),
            location=location,
            property_type=property_type,
            current_value=current_price,
            predicted_value=predicted_value,
            investment_score=investment_score,
            risk_level=risk_level,
            recommendations=recommendations,
            market_factors=market_info
        )
        
    def _analyze_market_conditions(self, location: str) -> Dict[str, Any]:
        """시장 상황 분석"""
        
        # 지역별 시장 데이터 조회
        for region, data in self.market_data["서울시장현황"].items():
            if region in location:
                return {
                    "region": region,
                    "average_price": data["아파트평균가"],
                    "growth_rate": data["전년대비상승률"],
                    "trading_volume": data["거래량"],
                    "investment_attractiveness": data["투자매력도"],
                    "market_trend": "상승" if data["전년대비상승률"] > 5 else "안정"
                }
                
        # 기본값 반환
        return {
            "region": "기타지역",
            "average_price": 8.0,
            "growth_rate": 3.0,
            "trading_volume": "월 200건",
            "investment_attractiveness": 6.0,
            "market_trend": "안정"
        }
        
    def _calculate_investment_score(self, property_info: Dict[str, Any], 
                                   investor_profile: Dict[str, Any],
                                   market_info: Dict[str, Any]) -> float:
        """투자 점수 계산 (1-10점)"""
        
        score = 5.0  # 기본 점수
        
        # 시장 매력도 (30%)
        market_score = market_info["investment_attractiveness"] / 10 * 3
        
        # 가격 적정성 (25%)
        avg_price = market_info["average_price"]
        current_price = property_info.get("price", 10.0)
        price_ratio = current_price / avg_price
        
        if price_ratio < 0.9:  # 시세 대비 저렴
            price_score = 2.5
        elif price_ratio < 1.1:  # 적정 수준
            price_score = 2.0
        else:  # 비쌈
            price_score = 1.0
            
        # 성장 잠재력 (25%)
        growth_rate = market_info["growth_rate"]
        growth_score = min(growth_rate / 10 * 2.5, 2.5)
        
        # 투자자 적합성 (20%)
        risk_tolerance = investor_profile.get("risk_tolerance", "보통")
        suitability_score = 2.0
        if risk_tolerance == "높음" and growth_rate > 10:
            suitability_score = 2.0
        elif risk_tolerance == "낮음" and growth_rate < 5:
            suitability_score = 2.0
        else:
            suitability_score = 1.5
            
        total_score = market_score + price_score + growth_score + suitability_score
        return min(max(total_score, 1.0), 10.0)
        
    def _predict_property_value(self, property_info: Dict[str, Any], 
                               market_info: Dict[str, Any]) -> float:
        """부동산 가치 예측 (3년 후)"""
        
        current_price = property_info.get("price", 10.0)
        annual_growth = market_info["growth_rate"] / 100
        
        # 복리 계산 (3년)
        predicted_value = current_price * (1 + annual_growth) ** 3
        
        return round(predicted_value, 2)
        
    def _assess_investment_risk(self, property_info: Dict[str, Any],
                               market_info: Dict[str, Any],
                               investor_profile: Dict[str, Any]) -> str:
        """투자 위험도 평가"""
        
        risk_factors = 0
        
        # 시장 위험
        if market_info["growth_rate"] > 15:
            risk_factors += 1  # 과열 위험
        if market_info["investment_attractiveness"] < 5:
            risk_factors += 1  # 저매력 지역
            
        # 물건 위험
        property_age = property_info.get("age", 10)
        if property_age > 30:
            risk_factors += 1  # 노후 물건
            
        # 투자자 위험
        leverage_ratio = investor_profile.get("leverage_ratio", 0.5)
        if leverage_ratio > 0.8:
            risk_factors += 1  # 높은 레버리지
            
        if risk_factors <= 1:
            return "낮음"
        elif risk_factors <= 2:
            return "보통"
        else:
            return "높음"
            
    def _generate_investment_recommendations(self, score: float, risk: str, 
                                           profile: Dict[str, Any]) -> List[str]:
        """투자 권장사항 생성"""
        
        recommendations = []
        
        if score >= 8.0:
            recommendations.append("매우 우수한 투자 기회, 적극 검토 권장")
        elif score >= 6.0:
            recommendations.append("양호한 투자 기회, 신중한 검토 후 투자")
        else:
            recommendations.append("투자 매력도 낮음, 다른 대안 검토 권장")
            
        if risk == "높음":
            recommendations.append("위험도가 높으니 충분한 여유자금 확보 필요")
        elif risk == "보통":
            recommendations.append("적정 수준의 위험, 분산투자 고려")
        else:
            recommendations.append("안정적 투자, 장기 보유 권장")
            
        # 투자자 성향별 조언
        risk_tolerance = profile.get("risk_tolerance", "보통")
        if risk_tolerance == "낮음" and risk != "낮음":
            recommendations.append("투자자 성향 대비 위험도 높음, 재검토 필요")
            
        return recommendations
        
    def generate_expert_consultation(self, query: str, 
                                   context: Dict[str, Any] = None) -> Dict[str, Any]:
        """종합 전문가 상담"""
        
        query_lower = query.lower()
        consultation_type = self._classify_consultation_type(query_lower)
        
        if consultation_type == "investment":
            return self._provide_investment_consultation(query, context)
        elif consultation_type == "market_analysis":
            return self._provide_market_analysis(query, context)
        elif consultation_type == "architectural":
            return self._provide_architectural_consultation(query, context)
        elif consultation_type == "legal":
            return self._provide_legal_consultation(query, context)
        elif consultation_type == "valuation":
            return self._provide_valuation_consultation(query, context)
        else:
            return self._provide_general_consultation(query, context)
            
    def _classify_consultation_type(self, query: str) -> str:
        """상담 유형 분류"""
        
        if any(keyword in query for keyword in ["투자", "수익", "포트폴리오"]):
            return "investment"
        elif any(keyword in query for keyword in ["시장", "시세", "전망"]):
            return "market_analysis"
        elif any(keyword in query for keyword in ["설계", "건축", "인테리어"]):
            return "architectural"
        elif any(keyword in query for keyword in ["법", "세금", "규제"]):
            return "legal"
        elif any(keyword in query for keyword in ["가격", "평가", "감정"]):
            return "valuation"
        else:
            return "general"
            
    def _provide_investment_consultation(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """투자 상담"""
        
        return {
            "consultation_type": "부동산 투자 전문 상담",
            "expert_answer": """
🏢 **부동산 투자 전문가 관점에서 조언드리겠습니다:**

💰 **현재 시장 상황 (2024년 기준)**
- 서울 아파트 시장: 선별적 상승세
- 금리 안정화로 거래량 회복 조짐
- 재개발·재건축 지역 관심 집중
- 생활형 숙박시설, 오피스텔 투자 증가

📊 **투자 전략 로드맵:**

**1단계: 투자 목표 설정**
- 투자 기간: 단기(1-3년) vs 중장기(5-10년)
- 수익 목표: 시세차익 vs 임대수익
- 위험 성향: 안정형 vs 성장형 vs 공격형

**2단계: 지역 선정**
- 🔥 핫스팟: 강동구(3기신도시), 용산구(재개발)
- 📈 성장형: 하남, 과천, 의왕 (교통 인프라)
- 🏰 안정형: 강남, 서초, 송파 (기존 프리미엄)

**3단계: 물건 선별**
- 역세권 도보 10분 이내
- 학군 또는 직장 접근성 우수
- 향후 개발계획 있는 지역
- 적정 가격대 (시세 대비 90-110%)

**4단계: 자금 계획**
- 레버리지 비율: 50-70% 권장
- 여유자금: 총 투자금의 20% 확보
- 세금 효과: 양도세, 종부세 고려

💡 **2024년 투자 키워드:**
1. **역세권**: GTX, 지하철 연장선 인근
2. **재개발**: 30년 이상 노후 단지
3. **생활SOC**: 공원, 도서관, 체육시설 인근
4. **ESG**: 친환경, 스마트홈 시설

⚠️ **위험 요소:**
- 정부 부동산 정책 변화
- 금리 급등 가능성
- 공급 물량 증가
- 경기 침체 우려

🎯 **성공 투자의 3원칙:**
1. **Location**: 입지가 모든 것을 결정
2. **Timing**: 적절한 매수·매도 타이밍
3. **Financing**: 효율적인 자금 조달
            """,
            "investment_tips": [
                "직접 현장 답사로 주변 환경 확인",
                "최소 3곳 이상 비교 검토",
                "전문가 의견 수렴 후 결정",
                "시장 변화에 대한 지속적 모니터링"
            ],
            "recommended_actions": [
                "투자 목표 및 예산 명확화",
                "관심 지역 시장 조사",
                "금융 상품 비교 검토",
                "세무 전문가 상담"
            ]
        }

# 사용 예시
if __name__ == "__main__":
    expert_system = RealEstateExpertSystem()
    
    # 부동산 투자 분석
    property_info = {
        "id": "P001",
        "location": "강남구 대치동",
        "type": "아파트",
        "area": 84,
        "price": 15.5,
        "age": 20
    }
    
    investor_profile = {
        "risk_tolerance": "보통",
        "investment_period": "중장기",
        "leverage_ratio": 0.6
    }
    
    analysis = expert_system.analyze_property_investment(property_info, investor_profile)
    print("=== 부동산 투자 분석 ===")
    print(f"투자 점수: {analysis.investment_score:.1f}/10")
    print(f"위험도: {analysis.risk_level}")
    print(f"예상 가치: {analysis.predicted_value}억원")
    
    # 전문가 상담
    consultation = expert_system.generate_expert_consultation(
        "강남 지역 아파트 투자에 대해 조언해주세요"
    )
    print(f"\n=== 전문가 상담 ===")
    print(consultation["expert_answer"]) 