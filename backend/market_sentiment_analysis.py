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
class MarketSentiment:
    """시장 심리 분석 결과"""
    sentiment_score: float  # 심리 점수 (-100 ~ +100)
    confidence_level: float  # 신뢰도 (0~1)
    trend_direction: str  # 상승/하락/횡보
    key_factors: List[str]  # 주요 요인들
    media_sentiment: float  # 언론 심리
    public_sentiment: float  # 대중 심리
    expert_sentiment: float  # 전문가 의견


@dataclass
class UrbanRenewalProject:
    """정비사업 프로젝트"""
    project_id: str
    project_name: str
    project_type: str  # 재개발/재건축/뉴타운/도시재생
    location: str
    total_area: float  # 총 면적 (㎡)
    households: int  # 총 세대수
    current_status: str  # 추진 단계
    progress_rate: float  # 진행률 (%)
    estimated_completion: datetime  # 예상 완료일
    key_issues: List[str]  # 주요 이슈들


class MarketSentimentAnalyzer:
    """부동산 시장 여론 및 정비사업 전문 분석 시스템"""
    
    def __init__(self, data_dir: str = "market_sentiment_data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        
        # 시장 여론 분석 시스템 초기화
        self.sentiment_indicators = self._initialize_sentiment_indicators()
        self.market_psychology = self._initialize_market_psychology()
        self.media_analysis = self._initialize_media_analysis()
        self.public_opinion = self._initialize_public_opinion()
        self.expert_views = self._initialize_expert_views()
        self.urban_renewal_system = self._initialize_urban_renewal_system()
        self.maintenance_projects = self._initialize_maintenance_projects()
        
    def _initialize_sentiment_indicators(self) -> Dict[str, Any]:
        """시장 심리 지표 초기화"""
        return {
            "거시지표": {
                "부동산심리지수": {
                    "현재값": 105.2,
                    "전월대비": "+2.3",
                    "해석": "100 초과시 낙관, 100 미만시 비관",
                    "최근동향": "3개월 연속 상승세"
                },
                "주택매매거래지수": {
                    "현재값": 87.5,
                    "전월대비": "+5.8",
                    "해석": "거래량 회복 조짐",
                    "계절조정": "봄철 성수기 효과"
                },
                "전세수급지수": {
                    "현재값": 115.3,
                    "전월대비": "+8.2",
                    "해석": "전세 공급 부족 심화",
                    "위험신호": "120 이상시 전세대란 우려"
                }
            },
            "검색동향": {
                "부동산관련키워드": {
                    "아파트분양": {"검색량": 145, "변화": "+25%"},
                    "재개발": {"검색량": 132, "변화": "+18%"},
                    "전세대출": {"검색량": 178, "변화": "+45%"},
                    "분담금": {"검색량": 98, "변화": "+12%"},
                    "청약": {"검색량": 156, "변화": "+32%"}
                },
                "지역별관심도": {
                    "강남": {"관심도": 187, "핫이슈": "재건축"},
                    "송파": {"관심도": 165, "핫이슈": "잠실재개발"},
                    "강동": {"관심도": 143, "핫이슈": "3기신도시"},
                    "용산": {"관심도": 178, "핫이슈": "용산국제업무지구"}
                }
            },
            "소셜미디어": {
                "긍정키워드": ["상승", "기대", "투자기회", "프리미엄", "입지"],
                "부정키워드": ["하락", "우려", "거품", "위험", "과열"],
                "중립키워드": ["분석", "검토", "관망", "신중", "대기"],
                "감정분석점수": 67.5  # 0-100 (긍정적)
            }
        }
        
    def _initialize_market_psychology(self) -> Dict[str, Any]:
        """시장 심리학 초기화"""
        return {
            "심리단계": {
                "1단계_절망": {
                    "특징": "극도의 비관, 매도 러시",
                    "지표": "심리지수 70 이하",
                    "투자기회": "저점 매수 기회",
                    "주의사항": "떨어지는 칼날 잡기 위험"
                },
                "2단계_의심": {
                    "특징": "조심스러운 회복, 반신반의",
                    "지표": "심리지수 70-85",
                    "투자기회": "선별적 투자 시점",
                    "주의사항": "가짜 신호 가능성"
                },
                "3단계_회복": {
                    "특징": "신뢰 회복, 거래량 증가",
                    "지표": "심리지수 85-100",
                    "투자기회": "본격 투자 검토",
                    "주의사항": "과도한 낙관 경계"
                },
                "4단계_낙관": {
                    "특징": "강한 상승 기대, 적극 매수",
                    "지표": "심리지수 100-115",
                    "투자기회": "수익 실현 검토",
                    "주의사항": "고점 근접 신호"
                },
                "5단계_도취": {
                    "특징": "극도의 낙관, 무분별 투자",
                    "지표": "심리지수 115 이상",
                    "투자기회": "매도 타이밍",
                    "주의사항": "버블 붕괴 위험"
                }
            },
            "현재상황": {
                "단계": "3단계_회복",
                "심리점수": 105.2,
                "주요특징": [
                    "금리안정화로 심리 회복",
                    "거래량 점진적 증가",
                    "선별적 투자 심리",
                    "정책 완화 기대감"
                ]
            },
            "예측모델": {
                "단기전망": {
                    "방향": "완만한 상승",
                    "심리점수": "105-110",
                    "핵심변수": "금리정책, 공급물량"
                },
                "중기전망": {
                    "방향": "낙관단계 진입",
                    "심리점수": "110-120",
                    "핵심변수": "경기회복, 소득증가"
                }
            }
        }
        
    def _initialize_media_analysis(self) -> Dict[str, Any]:
        """언론 분석 초기화"""
        return {
            "주요언론사": {
                "조선일부": {
                    "스탠스": "보수적 낙관",
                    "주요논조": "정책 안정화 강조",
                    "영향력": "높음",
                    "독자층": "고소득층, 투자자"
                },
                "중앙일보": {
                    "스탠스": "중립적 분석",
                    "주요논조": "시장 데이터 중심",
                    "영향력": "높음", 
                    "독자층": "중산층, 실수요자"
                },
                "한겨레": {
                    "스탠스": "진보적 비판",
                    "주요논조": "서민 주거 문제",
                    "영향력": "중간",
                    "독자층": "젊은층, 무주택자"
                }
            },
            "보도경향": {
                "최근1개월": {
                    "긍정보도": 45,
                    "부정보도": 25,
                    "중립보도": 30,
                    "전체점수": 65  # 0-100
                },
                "주요키워드": [
                    "정책완화", "시장안정", "실수요",
                    "공급확대", "금리인하", "투자기회"
                ],
                "이슈분석": {
                    "3기신도시": "긍정적 (공급확대)",
                    "재건축규제": "중립적 (완화기대)",
                    "전세대란": "부정적 (공급부족)"
                }
            },
            "여론형성": {
                "영향도순위": [
                    "1위: 정부정책 발표",
                    "2위: 금융기관 전망",
                    "3위: 전문가 의견",
                    "4위: 연예인 투자 사례",
                    "5위: 해외 시장 동향"
                ],
                "파급효과": {
                    "즉시효과": "검색량 급증",
                    "단기효과": "매수/매도 심리 변화",
                    "중기효과": "투자 행동 변화",
                    "장기효과": "정책 방향 결정"
                }
            }
        }
        
    def _initialize_public_opinion(self) -> Dict[str, Any]:
        """대중 여론 초기화"""
        return {
            "설문조사": {
                "부동산전망": {
                    "상승예상": 42,
                    "하락예상": 23,
                    "보합예상": 35,
                    "전망지수": 119  # (상승*2+보합-하락*2)+100
                },
                "투자의향": {
                    "적극투자": 18,
                    "신중투자": 45,
                    "투자안함": 37,
                    "투자지수": 81
                },
                "정책평가": {
                    "긍정평가": 38,
                    "부정평가": 34,
                    "보통": 28,
                    "정책지지도": 52
                }
            },
            "연령별여론": {
                "20-30대": {
                    "주요관심": "내집마련",
                    "투자성향": "공격적",
                    "선호지역": "신도시, 역세권",
                    "우려사항": "높은 집값, 대출규제"
                },
                "40-50대": {
                    "주요관심": "자산증식",
                    "투자성향": "안정적",
                    "선호지역": "기존 선호지역",
                    "우려사항": "정책변화, 금리상승"
                },
                "60대이상": {
                    "주요관심": "안전자산",
                    "투자성향": "보수적",
                    "선호지역": "도심, 생활편의",
                    "우려사항": "유동성, 상속세"
                }
            },
            "지역별정서": {
                "서울": {
                    "시장인식": "여전히 강세",
                    "투자심리": "적극적",
                    "주요이슈": "재건축, 정책완화"
                },
                "경기": {
                    "시장인식": "성장잠재력",
                    "투자심리": "긍정적",
                    "주요이슈": "3기신도시, GTX"
                },
                "지방": {
                    "시장인식": "양극화 진행",
                    "투자심리": "신중",
                    "주요이슈": "인구감소, 공급과잉"
                }
            }
        }
        
    def _initialize_expert_views(self) -> Dict[str, Any]:
        """전문가 의견 초기화"""
        return {
            "부동산전문가": {
                "낙관론자": {
                    "비율": 45,
                    "주요논리": [
                        "인구집중 지속",
                        "공급 제약",
                        "금융완화 기대",
                        "인프라 개발"
                    ],
                    "목표가격": "10-20% 상승"
                },
                "신중론자": {
                    "비율": 40,
                    "주요논리": [
                        "정책 불확실성",
                        "금리 상승 우려",
                        "경기 둔화",
                        "공급 증가"
                    ],
                    "목표가격": "현 수준 유지"
                },
                "비관론자": {
                    "비율": 15,
                    "주요논리": [
                        "버블 붕괴 위험",
                        "과도한 부채",
                        "인구 감소",
                        "규제 강화"
                    ],
                    "목표가격": "10-30% 하락"
                }
            },
            "금융기관": {
                "은행": {
                    "전망": "안정적 상승",
                    "근거": "대출 안정성 확보",
                    "리스크": "부실채권 증가"
                },
                "증권사": {
                    "전망": "선별적 투자",
                    "근거": "변동성 확대",
                    "리스크": "유동성 위험"
                },
                "보험사": {
                    "전망": "장기 보유",
                    "근거": "안정적 수익",
                    "리스크": "금리 리스크"
                }
            },
            "정부기관": {
                "국토교통부": {
                    "정책방향": "공급 확대",
                    "핵심정책": "3기 신도시",
                    "시장기대": "가격 안정"
                },
                "기획재정부": {
                    "정책방향": "금융 안정",
                    "핵심정책": "거시건전성",
                    "시장기대": "연착륙"
                },
                "한국은행": {
                    "정책방향": "물가 안정",
                    "핵심정책": "금리 정책",
                    "시장기대": "점진적 완화"
                }
            }
        }
        
    def _initialize_urban_renewal_system(self) -> Dict[str, Any]:
        """도시정비 시스템 초기화"""
        return {
            "정비사업유형": {
                "주거환경개선사업": {
                    "정의": "기존 주거지의 생활환경 개선",
                    "대상": "노후·불량 주거지",
                    "특징": "현지개량 중심",
                    "사업기간": "3-5년",
                    "주요내용": ["도로정비", "상하수도", "공원조성"]
                },
                "재개발사업": {
                    "정의": "토지의 합리적 이용과 도시기능 회복",
                    "대상": "정비기반시설 불량, 건축물 노후",
                    "특징": "전면철거 후 신축",
                    "사업기간": "7-12년",
                    "주요내용": ["아파트 건설", "상업시설", "공공시설"]
                },
                "재건축사업": {
                    "정의": "안전상 위험한 건축물의 건체",
                    "대상": "노후 공동주택",
                    "특징": "안전진단 필수",
                    "사업기간": "5-8년",
                    "주요내용": ["아파트 재건축", "용적률 상향"]
                },
                "도시환경정비사업": {
                    "정의": "상업·업무지역의 도시기능 회복",
                    "대상": "도심 기능 쇠퇴지역",
                    "특징": "복합개발",
                    "사업기간": "10-15년",
                    "주요내용": ["상업시설", "업무시설", "주거시설"]
                }
            },
            "추진체계": {
                "계획수립": {
                    "기본계획": "시·도지사 (10년 단위)",
                    "정비계획": "시장·군수 (5년 단위)",
                    "지구단위계획": "상세 계획 수립"
                },
                "사업추진": {
                    "구역지정": "시장·군수 지정",
                    "조합설립": "조합원 동의",
                    "사업시행": "시행인가 후 착공",
                    "사업완료": "준공 및 청산"
                },
                "관리감독": {
                    "국토교통부": "정책 수립, 제도 개선",
                    "시·도": "기본계획, 승인권한",
                    "시·군·구": "인허가, 관리감독",
                    "정비사업전문관리업체": "업무 대행"
                }
            },
            "법적근거": {
                "도시정비법": "도시 및 주거환경정비법",
                "건축법": "건축 관련 기준",
                "국토계획법": "토지이용계획",
                "주택법": "주택건설 기준"
            }
        }
        
    def _initialize_maintenance_projects(self) -> Dict[str, Any]:
        """정비사업 현황 초기화"""
        return {
            "전국현황": {
                "총사업수": 1247,
                "진행중": 856,
                "완료": 298,
                "중단": 93,
                "총사업비": "125조원"
            },
            "지역별현황": {
                "서울": {
                    "사업수": 156,
                    "주요사업": ["잠실재개발", "용산정비사업"],
                    "특징": "고밀도 개발, 높은 분담금"
                },
                "경기": {
                    "사업수": 298,
                    "주요사업": ["분당재개발", "일산뉴타운"],
                    "특징": "신도시 연계, 교통 중심"
                },
                "인천": {
                    "사업수": 87,
                    "주요사업": ["송도국제도시", "청라국제도시"],
                    "특징": "국제도시, 복합개발"
                }
            },
            "주요이슈": {
                "분담금문제": {
                    "현황": "평균 분담금 증가",
                    "원인": "건축비 상승, 분양가 상승",
                    "대책": "경감제도, 대출지원"
                },
                "조합갈등": {
                    "현황": "조합원 간 의견 대립",
                    "원인": "이해관계 상충",
                    "대책": "중재제도, 소통강화"
                },
                "사업지연": {
                    "현황": "평균 사업기간 연장",
                    "원인": "인허가 지연, 자금 부족",
                    "대책": "절차 간소화, 지원 확대"
                }
            },
            "성공사례": {
                "잠실재개발": {
                    "성과": "브랜드 가치 상승",
                    "핵심요인": "입지, 규모, 계획"
                },
                "목동신시가지": {
                    "성과": "체계적 개발",
                    "핵심요인": "마스터플랜, 인프라"
                }
            }
        }
        
    def analyze_market_sentiment(self, analysis_period: str = "1month") -> MarketSentiment:
        """시장 심리 종합 분석"""
        
        # 각 영역별 심리 점수 계산
        media_score = self._calculate_media_sentiment()
        public_score = self._calculate_public_sentiment()
        expert_score = self._calculate_expert_sentiment()
        
        # 가중평균으로 종합 점수 계산
        weights = {"media": 0.3, "public": 0.4, "expert": 0.3}
        total_score = (
            media_score * weights["media"] +
            public_score * weights["public"] + 
            expert_score * weights["expert"]
        )
        
        # 트렌드 방향 결정
        trend_direction = self._determine_trend_direction(total_score)
        
        # 주요 요인 추출
        key_factors = self._extract_key_sentiment_factors()
        
        # 신뢰도 계산
        confidence = self._calculate_confidence_level(media_score, public_score, expert_score)
        
        return MarketSentiment(
            sentiment_score=total_score,
            confidence_level=confidence,
            trend_direction=trend_direction,
            key_factors=key_factors,
            media_sentiment=media_score,
            public_sentiment=public_score,
            expert_sentiment=expert_score
        )
        
    def _calculate_media_sentiment(self) -> float:
        """언론 심리 점수 계산"""
        media_data = self.media_analysis["보도경향"]["최근1개월"]
        
        # 긍정/부정 비율로 점수 계산
        positive_ratio = media_data["긍정보도"] / 100
        negative_ratio = media_data["부정보도"] / 100
        
        # -100 ~ +100 범위로 정규화
        score = (positive_ratio - negative_ratio) * 100
        return max(-100, min(100, score))
        
    def _calculate_public_sentiment(self) -> float:
        """대중 심리 점수 계산"""
        opinion_data = self.public_opinion["설문조사"]["부동산전망"]
        
        # 전망지수를 -100 ~ +100 범위로 변환
        forecast_index = opinion_data["전망지수"]
        score = (forecast_index - 100) * 2  # 100을 중립점으로 설정
        
        return max(-100, min(100, score))
        
    def _calculate_expert_sentiment(self) -> float:
        """전문가 심리 점수 계산"""
        expert_data = self.expert_views["부동산전문가"]
        
        # 낙관/비관 비율로 점수 계산
        optimistic = expert_data["낙관론자"]["비율"]
        pessimistic = expert_data["비관론자"]["비율"]
        
        score = (optimistic - pessimistic) * 2
        return max(-100, min(100, score))
        
    def _determine_trend_direction(self, score: float) -> str:
        """트렌드 방향 결정"""
        if score > 20:
            return "강한 상승"
        elif score > 5:
            return "완만한 상승"
        elif score > -5:
            return "횡보"
        elif score > -20:
            return "완만한 하락"
        else:
            return "강한 하락"
            
    def _extract_key_sentiment_factors(self) -> List[str]:
        """주요 심리 요인 추출"""
        return [
            "금리 정책 안정화",
            "3기 신도시 공급 기대",
            "실수요자 지원 정책",
            "전세 공급 부족 우려",
            "경기 회복 기대감"
        ]
        
    def _calculate_confidence_level(self, media: float, public: float, expert: float) -> float:
        """신뢰도 계산"""
        # 세 점수의 일치성으로 신뢰도 계산
        scores = [media, public, expert]
        avg_score = sum(scores) / len(scores)
        variance = sum((s - avg_score) ** 2 for s in scores) / len(scores)
        
        # 분산이 클수록 신뢰도 낮음
        confidence = max(0.5, 1.0 - variance / 10000)
        return confidence
        
    def analyze_urban_renewal_trends(self) -> Dict[str, Any]:
        """도시정비 동향 분석"""
        
        # 정비사업 현황 분석
        project_status = self._analyze_project_status()
        
        # 지역별 동향
        regional_trends = self._analyze_regional_trends()
        
        # 정책 영향 분석
        policy_impact = self._analyze_policy_impact_on_renewal()
        
        # 미래 전망
        future_outlook = self._forecast_renewal_trends()
        
        return {
            "project_status": project_status,
            "regional_trends": regional_trends,
            "policy_impact": policy_impact,
            "future_outlook": future_outlook,
            "key_insights": self._generate_renewal_insights(),
            "investment_opportunities": self._identify_renewal_opportunities()
        }
        
    def _analyze_project_status(self) -> Dict[str, Any]:
        """정비사업 현황 분석"""
        status_data = self.maintenance_projects["전국현황"]
        
        completion_rate = status_data["완료"] / status_data["총사업수"] * 100
        progress_rate = status_data["진행중"] / status_data["총사업수"] * 100
        cancellation_rate = status_data["중단"] / status_data["총사업수"] * 100
        
        return {
            "completion_rate": round(completion_rate, 1),
            "progress_rate": round(progress_rate, 1),
            "cancellation_rate": round(cancellation_rate, 1),
            "total_investment": status_data["총사업비"],
            "status_assessment": "진행 중인 사업 비율이 높아 향후 공급 증가 예상"
        }
        
    def _analyze_regional_trends(self) -> Dict[str, Any]:
        """지역별 동향 분석"""
        return {
            "서울": {
                "trend": "고품질 재건축 중심",
                "characteristic": "높은 분담금, 브랜드 프리미엄",
                "outlook": "선별적 사업 추진"
            },
            "경기": {
                "trend": "신도시 연계 개발",
                "characteristic": "교통 인프라 중심",
                "outlook": "GTX 효과 기대"
            },
            "지방": {
                "trend": "도시재생 중심",
                "characteristic": "정부 지원 필요",
                "outlook": "신중한 접근 필요"
            }
        }
        
    def generate_comprehensive_market_analysis(self, query: str, 
                                             context: Dict[str, Any] = None) -> Dict[str, Any]:
        """종합 시장 분석 및 상담"""
        
        query_lower = query.lower()
        analysis_type = self._classify_market_query(query_lower)
        
        if analysis_type == "sentiment":
            return self._provide_sentiment_analysis(query, context)
        elif analysis_type == "urban_renewal":
            return self._provide_urban_renewal_analysis(query, context)
        elif analysis_type == "market_trends":
            return self._provide_market_trends_analysis(query, context)
        elif analysis_type == "public_opinion":
            return self._provide_public_opinion_analysis(query, context)
        else:
            return self._provide_comprehensive_analysis(query, context)
            
    def _classify_market_query(self, query: str) -> str:
        """시장 질의 분류"""
        if any(keyword in query for keyword in ["심리", "여론", "분위기", "정서"]):
            return "sentiment"
        elif any(keyword in query for keyword in ["정비사업", "도시정비", "재개발", "재건축"]):
            return "urban_renewal"
        elif any(keyword in query for keyword in ["시장", "동향", "전망"]):
            return "market_trends"
        elif any(keyword in query for keyword in ["여론", "설문", "대중"]):
            return "public_opinion"
        else:
            return "comprehensive"
            
    def _provide_sentiment_analysis(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """시장 심리 분석 상담"""
        
        sentiment = self.analyze_market_sentiment()
        
        return {
            "analysis_type": "시장 심리 분석",
            "expert_answer": f"""
📊 **부동산 시장 심리 전문 분석:**

🎯 **현재 시장 심리 점수: {sentiment.sentiment_score:.1f}/100**
- 트렌드: {sentiment.trend_direction}
- 신뢰도: {sentiment.confidence_level:.1f}

💭 **세부 심리 분석:**
- 📺 언론 심리: {sentiment.media_sentiment:.1f}점 ({"긍정" if sentiment.media_sentiment > 0 else "부정" if sentiment.media_sentiment < 0 else "중립"})
- 👥 대중 심리: {sentiment.public_sentiment:.1f}점 ({"낙관" if sentiment.public_sentiment > 0 else "비관" if sentiment.public_sentiment < 0 else "중립"})
- 🎓 전문가 의견: {sentiment.expert_sentiment:.1f}점 ({"긍정" if sentiment.expert_sentiment > 0 else "부정" if sentiment.expert_sentiment < 0 else "중립"})

🔥 **주요 심리 요인:**
{chr(10).join('- ' + factor for factor in sentiment.key_factors)}

📈 **현재 시장 단계: 3단계 회복기**
- 특징: 신뢰 회복, 거래량 증가
- 심리지수: 105.2 (100 초과로 낙관 우세)
- 투자기회: 본격 투자 검토 시점

⚠️ **주의사항:**
- 과도한 낙관 경계 필요
- 정책 변화 지속 모니터링
- 지역별 차별화 접근

💡 **투자 전략:**
- 현재는 신중한 낙관론이 적절
- 선별적 투자 기회 포착
- 심리 과열 신호 주의 깊게 관찰
            """,
            "sentiment_data": {
                "score": sentiment.sentiment_score,
                "trend": sentiment.trend_direction,
                "confidence": sentiment.confidence_level
            },
            "recommendations": [
                "시장 심리 지표 정기 모니터링",
                "언론 보도 동향 추적",
                "전문가 의견 종합 검토",
                "대중 심리 변화 감지"
            ]
        }

# 간단한 보조 메서드들
    def _analyze_policy_impact_on_renewal(self): 
        return {"impact": "positive", "key_policies": ["공급확대", "규제완화"]}
    def _forecast_renewal_trends(self): 
        return {"outlook": "active", "timeline": "2-3년"}
    def _generate_renewal_insights(self): 
        return ["정비사업 활성화 예상", "선별적 추진 필요"]
    def _identify_renewal_opportunities(self): 
        return ["노후단지", "역세권", "개발호재지역"]
    def _provide_urban_renewal_analysis(self, query, context): 
        return {"analysis_type": "정비사업", "expert_answer": "정비사업 전문 분석..."}
    def _provide_market_trends_analysis(self, query, context): 
        return {"analysis_type": "시장동향", "expert_answer": "시장동향 전문 분석..."}
    def _provide_public_opinion_analysis(self, query, context): 
        return {"analysis_type": "대중여론", "expert_answer": "대중여론 전문 분석..."}
    def _provide_comprehensive_analysis(self, query, context): 
        return {"analysis_type": "종합분석", "expert_answer": "종합 시장 분석..."}


# 사용 예시
if __name__ == "__main__":
    analyzer = MarketSentimentAnalyzer()
    
    # 시장 심리 분석
    sentiment = analyzer.analyze_market_sentiment()
    print("=== 시장 심리 분석 ===")
    print(f"심리 점수: {sentiment.sentiment_score:.1f}")
    print(f"트렌드: {sentiment.trend_direction}")
    print(f"신뢰도: {sentiment.confidence_level:.2f}")
    
    # 정비사업 동향 분석
    renewal_trends = analyzer.analyze_urban_renewal_trends()
    print(f"\n=== 정비사업 동향 ===")
    print(f"완료율: {renewal_trends['project_status']['completion_rate']}%")
    print(f"진행률: {renewal_trends['project_status']['progress_rate']}%")
    
    # 종합 상담
    analysis = analyzer.generate_comprehensive_market_analysis(
        "현재 부동산 시장 심리는 어떤가요?"
    )
    print(f"\n=== 전문가 분석 ===")
    print(analysis["expert_answer"]) 