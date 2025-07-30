#!/usr/bin/env python3
"""
입찰제안서 기반 시공사 성향 분석 시스템
정치적, 지역적, 친조/반조 요소를 고려한 정교한 분석
"""

import re
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class BidProposalAnalysis:
    """입찰제안서 분석 결과"""
    company_name: str
    positive_mentions: List[str]
    negative_mentions: List[str]
    political_factors: List[str]
    regional_factors: List[str]
    favoritism_indicators: List[str]
    opposition_indicators: List[str]
    benefit_analysis: Dict[str, Any]
    risk_assessment: Dict[str, Any]

@dataclass
class PoliticalAnalysis:
    """정치적 요소 분석"""
    political_affiliation: str
    regional_bias: str
    government_connection: str
    local_politics: str
    influence_score: float

@dataclass
class RegionalAnalysis:
    """지역적 요소 분석"""
    local_company: bool
    regional_advantage: str
    local_employment: str
    regional_economy: str
    community_benefit: str

@dataclass
class FavoritismAnalysis:
    """친조/반조 분석"""
    favoritism_type: str  # "친조", "반조", "중립"
    favoritism_reasons: List[str]
    opposition_reasons: List[str]
    benefit_recipients: List[str]
    risk_recipients: List[str]

class BidProposalAnalyzer:
    """입찰제안서 기반 시공사 성향 분석기"""
    
    def __init__(self):
        # 시공사별 특성 정의
        self.company_characteristics = {
            "삼성물산": {
                "type": "대기업",
                "political_affiliation": "보수",
                "regional_bias": "전국",
                "government_connection": "높음",
                "local_politics": "중간",
                "favoritism_type": "친조"
            },
            "대우건설": {
                "type": "대기업",
                "political_affiliation": "중도",
                "regional_bias": "전국",
                "government_connection": "높음",
                "local_politics": "중간",
                "favoritism_type": "중립"
            },
            "현대건설": {
                "type": "대기업",
                "political_affiliation": "보수",
                "regional_bias": "전국",
                "government_connection": "높음",
                "local_politics": "중간",
                "favoritism_type": "친조"
            },
            "GS건설": {
                "type": "대기업",
                "political_affiliation": "중도",
                "regional_bias": "전국",
                "government_connection": "높음",
                "local_politics": "중간",
                "favoritism_type": "중립"
            },
            "포스코건설": {
                "type": "대기업",
                "political_affiliation": "보수",
                "regional_bias": "전국",
                "government_connection": "높음",
                "local_politics": "중간",
                "favoritism_type": "친조"
            },
            "롯데건설": {
                "type": "대기업",
                "political_affiliation": "보수",
                "regional_bias": "전국",
                "government_connection": "높음",
                "local_politics": "중간",
                "favoritism_type": "친조"
            }
        }
        
        # 긍정적 언급 패턴 (입찰제안서 스타일)
        self.positive_patterns = {
            "기술력": [
                "최고의 기술력", "우수한 기술력", "첨단 기술", "혁신 기술",
                "기술 경쟁력", "기술 우수성", "기술 실력", "기술 전문성"
            ],
            "경험": [
                "풍부한 경험", "다년간의 경험", "검증된 경험", "실적 경험",
                "성공 경험", "우수한 실적", "검증된 실적", "인정받은 실적"
            ],
            "안전성": [
                "최고의 안전성", "우수한 안전성", "안전 보장", "안전 검증",
                "안전 관리", "안전 시스템", "안전 기준", "안전 우수성"
            ],
            "품질": [
                "최고 품질", "우수 품질", "고품질", "품질 보장", "품질 검증",
                "품질 관리", "품질 시스템", "품질 기준", "품질 우수성"
            ],
            "가격": [
                "합리적인 가격", "경쟁력 있는 가격", "경제적인 가격",
                "비용 효율성", "경제성", "합리성", "저렴한 가격"
            ],
            "서비스": [
                "우수한 서비스", "고객 만족", "고객 서비스", "서비스 품질",
                "서비스 우수성", "서비스 경쟁력", "고객 케어", "고객 지원"
            ]
        }
        
        # 부정적 언급 패턴
        self.negative_patterns = {
            "기술력": [
                "부족한 기술력", "미흡한 기술력", "기술력 부족", "기술력 미흡",
                "기술력 문제", "기술력 결함", "기술력 오류", "기술력 실패"
            ],
            "경험": [
                "부족한 경험", "미흡한 경험", "경험 부족", "경험 미흡",
                "경험 문제", "경험 결함", "경험 오류", "경험 실패"
            ],
            "안전성": [
                "부족한 안전성", "미흡한 안전성", "안전성 부족", "안전성 미흡",
                "안전성 문제", "안전성 결함", "안전성 오류", "안전성 실패"
            ],
            "품질": [
                "부족한 품질", "미흡한 품질", "품질 부족", "품질 미흡",
                "품질 문제", "품질 결함", "품질 오류", "품질 실패"
            ],
            "가격": [
                "높은 가격", "비싼 가격", "과도한 가격", "비경제적 가격",
                "비효율적 가격", "부담스러운 가격", "비합리적 가격"
            ],
            "서비스": [
                "부족한 서비스", "미흡한 서비스", "서비스 부족", "서비스 미흡",
                "서비스 문제", "서비스 결함", "서비스 오류", "서비스 실패"
            ]
        }
        
        # 정치적 요소 키워드
        self.political_keywords = {
            "정부연결": [
                "정부", "국가", "공공", "공식", "공인", "공식 인정", "공식 검증",
                "정부 지원", "국가 지원", "공공 지원", "정부 인정", "국가 인정"
            ],
            "지역정치": [
                "지역", "지방", "시도", "시군구", "지역 정치", "지방 정치",
                "지역 이익", "지방 이익", "지역 발전", "지방 발전", "지역 경제"
            ],
            "정당": [
                "보수", "진보", "중도", "정당", "여당", "야당", "정치 성향",
                "정치적", "정치 성향", "정치적 성향", "정치적 배경"
            ],
            "친조": [
                "친조", "친정부", "정부 친화", "정부 지지", "정부 옹호",
                "정부 편향", "정부 편향적", "정부 편향성", "정부 편향적이다"
            ],
            "반조": [
                "반조", "반정부", "정부 반대", "정부 비판", "정부 반대",
                "정부 반대적", "정부 반대성", "정부 반대적이다"
            ]
        }
        
        # 지역적 요소 키워드
        self.regional_keywords = {
            "지역기업": [
                "지역 기업", "지방 기업", "로컬 기업", "지역 업체", "지방 업체",
                "지역 건설사", "지방 건설사", "지역 회사", "지방 회사"
            ],
            "지역고용": [
                "지역 고용", "지방 고용", "지역 일자리", "지방 일자리",
                "지역 취업", "지방 취업", "지역 경제", "지방 경제"
            ],
            "지역경제": [
                "지역 경제", "지방 경제", "지역 발전", "지방 발전",
                "지역 이익", "지방 이익", "지역 혜택", "지방 혜택"
            ],
            "지역우대": [
                "지역 우대", "지방 우대", "지역 혜택", "지방 혜택",
                "지역 특혜", "지방 특혜", "지역 배려", "지방 배려"
            ]
        }
        
        # 이익 수혜자 분석
        self.benefit_recipients = {
            "정부": ["정부", "국가", "공공", "공식", "공인"],
            "지역": ["지역", "지방", "시도", "시군구", "로컬"],
            "기업": ["기업", "회사", "업체", "건설사", "시공사"],
            "정당": ["보수", "진보", "중도", "여당", "야당"],
            "지역정치인": ["지역 정치인", "지방 정치인", "시도 정치인", "시군구 정치인"]
        }

    def analyze_bid_proposal(self, content: str, company_name: str) -> BidProposalAnalysis:
        """입찰제안서 스타일 분석"""
        positive_mentions = []
        negative_mentions = []
        political_factors = []
        regional_factors = []
        favoritism_indicators = []
        opposition_indicators = []
        
        # 긍정적 언급 분석
        for category, patterns in self.positive_patterns.items():
            for pattern in patterns:
                if pattern in content:
                    positive_mentions.append(f"{category}: {pattern}")
        
        # 부정적 언급 분석
        for category, patterns in self.negative_patterns.items():
            for pattern in patterns:
                if pattern in content:
                    negative_mentions.append(f"{category}: {pattern}")
        
        # 정치적 요소 분석
        for category, keywords in self.political_keywords.items():
            for keyword in keywords:
                if keyword in content:
                    political_factors.append(f"{category}: {keyword}")
        
        # 지역적 요소 분석
        for category, keywords in self.regional_keywords.items():
            for keyword in keywords:
                if keyword in content:
                    regional_factors.append(f"{category}: {keyword}")
        
        # 친조/반조 분석
        company_info = self.company_characteristics.get(company_name, {})
        favoritism_type = company_info.get("favoritism_type", "중립")
        
        if favoritism_type == "친조":
            favoritism_indicators = [
                "정부 친화적 기업",
                "정부 정책 지지",
                "정부 인정 기업",
                "공식 인정 기업"
            ]
        elif favoritism_type == "반조":
            opposition_indicators = [
                "정부 비판적 기업",
                "정부 정책 반대",
                "정부 비판 기업",
                "반정부 성향"
            ]
        
        # 이익 분석
        benefit_analysis = self._analyze_benefits(content, company_name)
        risk_assessment = self._analyze_risks(content, company_name)
        
        return BidProposalAnalysis(
            company_name=company_name,
            positive_mentions=positive_mentions,
            negative_mentions=negative_mentions,
            political_factors=political_factors,
            regional_factors=regional_factors,
            favoritism_indicators=favoritism_indicators,
            opposition_indicators=opposition_indicators,
            benefit_analysis=benefit_analysis,
            risk_assessment=risk_assessment
        )

    def _analyze_benefits(self, content: str, company_name: str) -> Dict[str, Any]:
        """이익 수혜자 분석"""
        benefits = {
            "primary_beneficiaries": [],
            "secondary_beneficiaries": [],
            "benefit_reasons": [],
            "economic_impact": "",
            "political_impact": ""
        }
        
        # 주요 수혜자 분석
        for recipient, keywords in self.benefit_recipients.items():
            for keyword in keywords:
                if keyword in content:
                    if recipient not in benefits["primary_beneficiaries"]:
                        benefits["primary_beneficiaries"].append(recipient)
        
        # 이익 이유 분석
        if "정부" in benefits["primary_beneficiaries"]:
            benefits["benefit_reasons"].append("정부 정책 추진 및 행정 효율성 증대")
            benefits["political_impact"] = "정부 정책 성공 및 정치적 성과"
        
        if "지역" in benefits["primary_beneficiaries"]:
            benefits["benefit_reasons"].append("지역 경제 활성화 및 일자리 창출")
            benefits["economic_impact"] = "지역 경제 발전 및 고용 증대"
        
        if "기업" in benefits["primary_beneficiaries"]:
            benefits["benefit_reasons"].append("기업 매출 증대 및 시장 확장")
            benefits["economic_impact"] = "기업 성장 및 시장 경쟁력 향상"
        
        return benefits

    def _analyze_risks(self, content: str, company_name: str) -> Dict[str, Any]:
        """위험 요소 분석"""
        risks = {
            "risk_factors": [],
            "risk_recipients": [],
            "risk_reasons": [],
            "mitigation_measures": []
        }
        
        # 위험 요소 분석
        if "부족한" in content or "미흡한" in content:
            risks["risk_factors"].append("기술력/경험 부족")
            risks["risk_reasons"].append("시공 품질 저하 및 안전사고 위험")
            risks["mitigation_measures"].append("기술력 검증 및 경험 확인 필요")
        
        if "높은 가격" in content or "비싼" in content:
            risks["risk_factors"].append("과도한 비용")
            risks["risk_reasons"].append("예산 초과 및 비효율적 자원 사용")
            risks["mitigation_measures"].append("가격 경쟁력 검토 및 비용 최적화")
        
        if "정치적" in content:
            risks["risk_factors"].append("정치적 편향")
            risks["risk_reasons"].append("공정성 훼손 및 갈등 조성")
            risks["mitigation_measures"].append("중립성 확보 및 투명성 제고")
        
        return risks

    def analyze_political_factors(self, company_name: str) -> PoliticalAnalysis:
        """정치적 요소 분석"""
        company_info = self.company_characteristics.get(company_name, {})
        
        return PoliticalAnalysis(
            political_affiliation=company_info.get("political_affiliation", "중도"),
            regional_bias=company_info.get("regional_bias", "전국"),
            government_connection=company_info.get("government_connection", "보통"),
            local_politics=company_info.get("local_politics", "보통"),
            influence_score=self._calculate_influence_score(company_name)
        )

    def analyze_regional_factors(self, company_name: str) -> RegionalAnalysis:
        """지역적 요소 분석"""
        company_info = self.company_characteristics.get(company_name, {})
        regional_bias = company_info.get("regional_bias", "전국")
        
        return RegionalAnalysis(
            local_company=regional_bias != "전국",
            regional_advantage="지역 기업 우대" if regional_bias != "전국" else "전국적 경쟁",
            local_employment="지역 고용 창출" if regional_bias != "전국" else "전국 고용",
            regional_economy="지역 경제 활성화" if regional_bias != "전국" else "전국 경제",
            community_benefit="지역 사회 기여" if regional_bias != "전국" else "전국 사회"
        )

    def analyze_favoritism(self, content: str, company_name: str) -> FavoritismAnalysis:
        """친조/반조 분석"""
        company_info = self.company_characteristics.get(company_name, {})
        favoritism_type = company_info.get("favoritism_type", "중립")
        
        favoritism_reasons = []
        opposition_reasons = []
        benefit_recipients = []
        risk_recipients = []
        
        if favoritism_type == "친조":
            favoritism_reasons = [
                "정부 정책 지지",
                "정부 인정 기업",
                "공식 인정 기업",
                "정부 친화적 기업"
            ]
            benefit_recipients = ["정부", "정당", "기업"]
            risk_recipients = ["경쟁 기업", "반대 정당"]
        elif favoritism_type == "반조":
            opposition_reasons = [
                "정부 정책 반대",
                "정부 비판적 기업",
                "반정부 성향",
                "정부 비판 기업"
            ]
            benefit_recipients = ["반대 정당", "비판 세력"]
            risk_recipients = ["정부", "지지 정당"]
        else:  # 중립
            favoritism_reasons = ["중립적 기업", "정치적 중립"]
            opposition_reasons = []
            benefit_recipients = ["모든 이해관계자"]
            risk_recipients = []
        
        return FavoritismAnalysis(
            favoritism_type=favoritism_type,
            favoritism_reasons=favoritism_reasons,
            opposition_reasons=opposition_reasons,
            benefit_recipients=benefit_recipients,
            risk_recipients=risk_recipients
        )

    def _calculate_influence_score(self, company_name: str) -> float:
        """영향력 점수 계산"""
        company_info = self.company_characteristics.get(company_name, {})
        
        score = 0.0
        
        # 기업 규모
        if company_info.get("type") == "대기업":
            score += 0.4
        
        # 정부 연결도
        if company_info.get("government_connection") == "높음":
            score += 0.3
        
        # 정치적 성향
        if company_info.get("political_affiliation") in ["보수", "진보"]:
            score += 0.2
        
        # 친조/반조
        if company_info.get("favoritism_type") in ["친조", "반조"]:
            score += 0.1
        
        return min(score, 1.0)

    def generate_comprehensive_analysis(self, content: str, company_name: str) -> Dict[str, Any]:
        """종합 분석 결과 생성"""
        bid_analysis = self.analyze_bid_proposal(content, company_name)
        political_analysis = self.analyze_political_factors(company_name)
        regional_analysis = self.analyze_regional_factors(company_name)
        favoritism_analysis = self.analyze_favoritism(content, company_name)
        
        return {
            "company_name": company_name,
            "bid_proposal_analysis": {
                "positive_mentions": bid_analysis.positive_mentions,
                "negative_mentions": bid_analysis.negative_mentions,
                "political_factors": bid_analysis.political_factors,
                "regional_factors": bid_analysis.regional_factors,
                "favoritism_indicators": bid_analysis.favoritism_indicators,
                "opposition_indicators": bid_analysis.opposition_indicators
            },
            "political_analysis": {
                "political_affiliation": political_analysis.political_affiliation,
                "regional_bias": political_analysis.regional_bias,
                "government_connection": political_analysis.government_connection,
                "local_politics": political_analysis.local_politics,
                "influence_score": political_analysis.influence_score
            },
            "regional_analysis": {
                "local_company": regional_analysis.local_company,
                "regional_advantage": regional_analysis.regional_advantage,
                "local_employment": regional_analysis.local_employment,
                "regional_economy": regional_analysis.regional_economy,
                "community_benefit": regional_analysis.community_benefit
            },
            "favoritism_analysis": {
                "favoritism_type": favoritism_analysis.favoritism_type,
                "favoritism_reasons": favoritism_analysis.favoritism_reasons,
                "opposition_reasons": favoritism_analysis.opposition_reasons,
                "benefit_recipients": favoritism_analysis.benefit_recipients,
                "risk_recipients": favoritism_analysis.risk_recipients
            },
            "benefit_analysis": bid_analysis.benefit_analysis,
            "risk_assessment": bid_analysis.risk_assessment
        }

# 사용 예시
if __name__ == "__main__":
    analyzer = BidProposalAnalyzer()
    # 실제 사용 시에는 입찰제안서 내용을 전달하여 분석 