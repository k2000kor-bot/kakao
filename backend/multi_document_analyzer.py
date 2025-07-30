#!/usr/bin/env python3
"""
다중 문서 유형 기반 시공사 성향 분석 시스템
입찰계약서, 홍보물, 전달 등 다양한 문서 유형을 고려한 포괄적 분석
"""

import re
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class DocumentAnalysis:
    """문서 분석 결과"""
    document_type: str
    content_analysis: Dict[str, Any]
    bias_indicators: List[str]
    promotional_elements: List[str]
    contractual_terms: List[str]
    delivery_analysis: Dict[str, Any]

@dataclass
class BidContractAnalysis:
    """입찰계약서 분석"""
    contract_type: str
    favorable_terms: List[str]
    unfavorable_terms: List[str]
    risk_clauses: List[str]
    benefit_clauses: List[str]
    bias_score: float

@dataclass
class PromotionalMaterialAnalysis:
    """홍보물 분석"""
    material_type: str
    promotional_claims: List[str]
    target_audience: List[str]
    persuasion_techniques: List[str]
    credibility_indicators: List[str]
    bias_level: str

@dataclass
class DeliveryAnalysis:
    """전달 분석"""
    delivery_method: str
    timing_analysis: Dict[str, Any]
    audience_reach: Dict[str, Any]
    effectiveness_metrics: Dict[str, Any]
    bias_impact: str

class MultiDocumentAnalyzer:
    """다중 문서 유형 기반 시공사 성향 분석기"""
    
    def __init__(self):
        # 문서 유형별 특성 정의
        self.document_types = {
            "입찰계약서": {
                "keywords": ["계약서", "입찰", "계약", "조건", "규정", "의무", "책임", "보증", "담보"],
                "bias_indicators": ["특정 기업 우대", "불공정 조건", "독점 조항", "배타적 권리"],
                "risk_factors": ["불리한 조건", "높은 위험", "과도한 책임", "불공정 조항"]
            },
            "홍보물": {
                "keywords": ["홍보", "브로셔", "팜플렛", "카탈로그", "소개서", "안내서", "매뉴얼"],
                "bias_indicators": ["과장된 표현", "편향된 정보", "선택적 사실", "왜곡된 비교"],
                "risk_factors": ["부정확한 정보", "과장된 성능", "허위 광고", "기만적 표현"]
            },
            "전달": {
                "keywords": ["전달", "통지", "공지", "알림", "보고", "제출", "제출서", "보고서"],
                "bias_indicators": ["편향된 전달", "선택적 정보", "왜곡된 사실", "부정확한 보고"],
                "risk_factors": ["정보 누락", "부정확한 보고", "지연된 전달", "불완전한 정보"]
            },
            "제안서": {
                "keywords": ["제안서", "제안", "안건", "계획서", "방안", "대안", "안"],
                "bias_indicators": ["편향된 제안", "특정 기업 선호", "불공정한 조건", "독점적 제안"],
                "risk_factors": ["불리한 조건", "높은 비용", "부적절한 기술", "부족한 경험"]
            },
            "평가서": {
                "keywords": ["평가서", "평가", "검토", "심사", "검증", "인증", "검사"],
                "bias_indicators": ["편향된 평가", "부정확한 검토", "선택적 평가", "왜곡된 결과"],
                "risk_factors": ["부정확한 평가", "부적절한 기준", "편향된 심사", "불공정한 검토"]
            }
        }
        
        # 입찰계약서 특정 분석 패턴
        self.contract_patterns = {
            "favorable_terms": [
                "우대 조건", "특별 혜택", "독점 권리", "배타적 계약",
                "장기 계약", "자동 갱신", "우선권", "특별 조건",
                "할인 혜택", "보조금", "지원금", "인센티브"
            ],
            "unfavorable_terms": [
                "불리한 조건", "높은 위험", "과도한 책임", "불공정 조항",
                "독소 조항", "불평등 계약", "부담스러운 조건", "불리한 갱신"
            ],
            "risk_clauses": [
                "손해배상", "책임 조항", "보증 조항", "담보 조항",
                "위험 분담", "책임 한계", "면책 조항", "해지 조항"
            ],
            "benefit_clauses": [
                "이익 분배", "성과 보상", "인센티브", "보너스",
                "특별 혜택", "우대 조건", "할인", "지원"
            ]
        }
        
        # 홍보물 특정 분석 패턴
        self.promotional_patterns = {
            "exaggerated_claims": [
                "최고의", "최상의", "최첨단", "혁신적인", "독보적인",
                "압도적인", "절대적인", "완벽한", "완전한", "완벽한"
            ],
            "selective_facts": [
                "선택적 사실", "부분적 정보", "왜곡된 비교", "편향된 정보",
                "일부만 언급", "중요 정보 누락", "부정확한 비교"
            ],
            "persuasion_techniques": [
                "감정적 호소", "긴급성 강조", "사회적 증명", "전문성 어필",
                "권위적 표현", "비교 광고", "증언 활용", "통계 왜곡"
            ],
            "credibility_indicators": [
                "공식 인정", "검증된 실적", "인증서", "수상 실적",
                "고객 만족도", "추천서", "사례 연구", "성과 지표"
            ]
        }
        
        # 전달 특정 분석 패턴
        self.delivery_patterns = {
            "timing_analysis": {
                "strategic_timing": ["전략적 타이밍", "시기적절한", "적절한 시점", "최적의 타이밍"],
                "delayed_delivery": ["지연된 전달", "늦은 공지", "지연된 보고", "늦은 알림"],
                "rush_delivery": ["급한 전달", "긴급 공지", "서두른 보고", "급한 알림"]
            },
            "audience_reach": {
                "targeted_delivery": ["선별적 전달", "특정 대상", "선택적 공지", "제한적 알림"],
                "broad_delivery": ["광범위한 전달", "전체 공지", "일반적 알림", "포괄적 보고"],
                "selective_delivery": ["선택적 전달", "편향된 공지", "부정확한 알림", "왜곡된 보고"]
            },
            "effectiveness_metrics": {
                "delivery_success": ["전달 성공률", "도달률", "이해도", "반응률"],
                "information_quality": ["정보 품질", "정확성", "완전성", "시의성"],
                "bias_impact": ["편향성 영향", "왜곡 정도", "부정확성", "선택성"]
            }
        }
        
        # 시공사별 문서 유형별 편향성 패턴
        self.company_document_bias = {
            "삼성물산": {
                "입찰계약서": {
                    "bias_type": "우대적",
                    "favorable_terms": ["장기 계약", "자동 갱신", "우선권", "특별 조건"],
                    "risk_distribution": "낮음",
                    "benefit_concentration": "높음"
                },
                "홍보물": {
                    "bias_type": "과장적",
                    "exaggeration_level": "높음",
                    "credibility_issues": ["과장된 성능", "부정확한 비교"],
                    "persuasion_intensity": "강함"
                },
                "전달": {
                    "bias_type": "선택적",
                    "timing_strategy": "전략적",
                    "audience_targeting": "선별적",
                    "information_control": "높음"
                }
            },
            "대우건설": {
                "입찰계약서": {
                    "bias_type": "중립적",
                    "favorable_terms": ["표준 조건", "공정한 계약", "균형적 조건"],
                    "risk_distribution": "균형적",
                    "benefit_concentration": "보통"
                },
                "홍보물": {
                    "bias_type": "균형적",
                    "exaggeration_level": "보통",
                    "credibility_issues": ["일부 과장", "선택적 사실"],
                    "persuasion_intensity": "보통"
                },
                "전달": {
                    "bias_type": "공정적",
                    "timing_strategy": "일관적",
                    "audience_targeting": "포괄적",
                    "information_control": "보통"
                }
            },
            "현대건설": {
                "입찰계약서": {
                    "bias_type": "우대적",
                    "favorable_terms": ["특별 혜택", "독점 권리", "우선권"],
                    "risk_distribution": "낮음",
                    "benefit_concentration": "높음"
                },
                "홍보물": {
                    "bias_type": "과장적",
                    "exaggeration_level": "높음",
                    "credibility_issues": ["과장된 표현", "부정확한 정보"],
                    "persuasion_intensity": "강함"
                },
                "전달": {
                    "bias_type": "선택적",
                    "timing_strategy": "전략적",
                    "audience_targeting": "선별적",
                    "information_control": "높음"
                }
            }
        }

    def analyze_document_type(self, content: str, document_type: str) -> DocumentAnalysis:
        """문서 유형별 분석"""
        doc_type_info = self.document_types.get(document_type, {})
        
        # 기본 분석
        content_analysis = self._analyze_content(content, document_type)
        bias_indicators = self._detect_bias_indicators(content, document_type)
        promotional_elements = self._detect_promotional_elements(content, document_type)
        contractual_terms = self._extract_contractual_terms(content, document_type)
        delivery_analysis = self._analyze_delivery_aspects(content, document_type)
        
        return DocumentAnalysis(
            document_type=document_type,
            content_analysis=content_analysis,
            bias_indicators=bias_indicators,
            promotional_elements=promotional_elements,
            contractual_terms=contractual_terms,
            delivery_analysis=delivery_analysis
        )

    def analyze_bid_contract(self, content: str, company_name: str) -> BidContractAnalysis:
        """입찰계약서 특정 분석"""
        favorable_terms = []
        unfavorable_terms = []
        risk_clauses = []
        benefit_clauses = []
        
        # 계약서 패턴 분석
        for pattern in self.contract_patterns["favorable_terms"]:
            if pattern in content:
                favorable_terms.append(pattern)
        
        for pattern in self.contract_patterns["unfavorable_terms"]:
            if pattern in content:
                unfavorable_terms.append(pattern)
        
        for pattern in self.contract_patterns["risk_clauses"]:
            if pattern in content:
                risk_clauses.append(pattern)
        
        for pattern in self.contract_patterns["benefit_clauses"]:
            if pattern in content:
                benefit_clauses.append(pattern)
        
        # 편향성 점수 계산
        bias_score = self._calculate_contract_bias_score(favorable_terms, unfavorable_terms, company_name)
        
        return BidContractAnalysis(
            contract_type="입찰계약서",
            favorable_terms=favorable_terms,
            unfavorable_terms=unfavorable_terms,
            risk_clauses=risk_clauses,
            benefit_clauses=benefit_clauses,
            bias_score=bias_score
        )

    def analyze_promotional_material(self, content: str, company_name: str) -> PromotionalMaterialAnalysis:
        """홍보물 특정 분석"""
        promotional_claims = []
        target_audience = []
        persuasion_techniques = []
        credibility_indicators = []
        
        # 홍보 패턴 분석
        for pattern in self.promotional_patterns["exaggerated_claims"]:
            if pattern in content:
                promotional_claims.append(pattern)
        
        for pattern in self.promotional_patterns["persuasion_techniques"]:
            if pattern in content:
                persuasion_techniques.append(pattern)
        
        for pattern in self.promotional_patterns["credibility_indicators"]:
            if pattern in content:
                credibility_indicators.append(pattern)
        
        # 대상자 분석
        target_audience = self._identify_target_audience(content)
        
        # 편향성 수준 평가
        bias_level = self._assess_promotional_bias(promotional_claims, credibility_indicators, company_name)
        
        return PromotionalMaterialAnalysis(
            material_type="홍보물",
            promotional_claims=promotional_claims,
            target_audience=target_audience,
            persuasion_techniques=persuasion_techniques,
            credibility_indicators=credibility_indicators,
            bias_level=bias_level
        )

    def analyze_delivery(self, content: str, company_name: str) -> DeliveryAnalysis:
        """전달 특정 분석"""
        delivery_method = self._identify_delivery_method(content)
        timing_analysis = self._analyze_timing(content)
        audience_reach = self._analyze_audience_reach(content)
        effectiveness_metrics = self._calculate_effectiveness_metrics(content)
        bias_impact = self._assess_delivery_bias(content, company_name)
        
        return DeliveryAnalysis(
            delivery_method=delivery_method,
            timing_analysis=timing_analysis,
            audience_reach=audience_reach,
            effectiveness_metrics=effectiveness_metrics,
            bias_impact=bias_impact
        )

    def _analyze_content(self, content: str, document_type: str) -> Dict[str, Any]:
        """문서 내용 분석"""
        doc_type_info = self.document_types.get(document_type, {})
        
        analysis = {
            "document_type": document_type,
            "keyword_matches": [],
            "bias_indicators": [],
            "risk_factors": [],
            "content_length": len(content),
            "complexity_score": self._calculate_complexity_score(content)
        }
        
        # 키워드 매칭
        for keyword in doc_type_info.get("keywords", []):
            if keyword in content:
                analysis["keyword_matches"].append(keyword)
        
        # 편향 지표
        for indicator in doc_type_info.get("bias_indicators", []):
            if indicator in content:
                analysis["bias_indicators"].append(indicator)
        
        # 위험 요소
        for risk in doc_type_info.get("risk_factors", []):
            if risk in content:
                analysis["risk_factors"].append(risk)
        
        return analysis

    def _detect_bias_indicators(self, content: str, document_type: str) -> List[str]:
        """편향 지표 감지"""
        bias_indicators = []
        
        # 일반적 편향 지표
        general_bias_patterns = [
            "특정 기업", "우대", "편향", "선택적", "왜곡",
            "부정확", "과장", "허위", "기만", "불공정"
        ]
        
        for pattern in general_bias_patterns:
            if pattern in content:
                bias_indicators.append(f"편향 지표: {pattern}")
        
        # 문서 유형별 특정 편향 지표
        doc_type_info = self.document_types.get(document_type, {})
        for indicator in doc_type_info.get("bias_indicators", []):
            if indicator in content:
                bias_indicators.append(f"{document_type} 편향: {indicator}")
        
        return bias_indicators

    def _detect_promotional_elements(self, content: str, document_type: str) -> List[str]:
        """홍보 요소 감지"""
        promotional_elements = []
        
        # 홍보 관련 키워드
        promotional_keywords = [
            "홍보", "광고", "선전", "어필", "강조", "부각",
            "최고", "최상", "우수", "훌륭", "뛰어나", "탁월"
        ]
        
        for keyword in promotional_keywords:
            if keyword in content:
                promotional_elements.append(f"홍보 요소: {keyword}")
        
        return promotional_elements

    def _extract_contractual_terms(self, content: str, document_type: str) -> List[str]:
        """계약 조건 추출"""
        contractual_terms = []
        
        # 계약 관련 키워드
        contract_keywords = [
            "계약", "조건", "규정", "의무", "책임", "보증",
            "담보", "위험", "이익", "혜택", "할인", "보조"
        ]
        
        for keyword in contract_keywords:
            if keyword in content:
                contractual_terms.append(f"계약 조건: {keyword}")
        
        return contractual_terms

    def _analyze_delivery_aspects(self, content: str, document_type: str) -> Dict[str, Any]:
        """전달 측면 분석"""
        delivery_analysis = {
            "delivery_method": self._identify_delivery_method(content),
            "timing_analysis": self._analyze_timing(content),
            "audience_reach": self._analyze_audience_reach(content),
            "effectiveness_metrics": self._calculate_effectiveness_metrics(content)
        }
        
        return delivery_analysis

    def _identify_delivery_method(self, content: str) -> str:
        """전달 방법 식별"""
        delivery_methods = {
            "이메일": ["이메일", "email", "메일"],
            "문서": ["문서", "서류", "보고서", "제출서"],
            "회의": ["회의", "미팅", "상담", "협의"],
            "공지": ["공지", "알림", "통지", "안내"],
            "전화": ["전화", "콜", "통화"]
        }
        
        for method, keywords in delivery_methods.items():
            for keyword in keywords:
                if keyword in content:
                    return method
        
        return "기타"

    def _analyze_timing(self, content: str) -> Dict[str, Any]:
        """타이밍 분석"""
        timing_analysis = {
            "strategic_timing": False,
            "delayed_delivery": False,
            "rush_delivery": False,
            "timing_indicators": []
        }
        
        # 전략적 타이밍
        for pattern in self.delivery_patterns["timing_analysis"]["strategic_timing"]:
            if pattern in content:
                timing_analysis["strategic_timing"] = True
                timing_analysis["timing_indicators"].append(pattern)
        
        # 지연된 전달
        for pattern in self.delivery_patterns["timing_analysis"]["delayed_delivery"]:
            if pattern in content:
                timing_analysis["delayed_delivery"] = True
                timing_analysis["timing_indicators"].append(pattern)
        
        # 급한 전달
        for pattern in self.delivery_patterns["timing_analysis"]["rush_delivery"]:
            if pattern in content:
                timing_analysis["rush_delivery"] = True
                timing_analysis["timing_indicators"].append(pattern)
        
        return timing_analysis

    def _analyze_audience_reach(self, content: str) -> Dict[str, Any]:
        """대상자 도달 분석"""
        audience_analysis = {
            "targeted_delivery": False,
            "broad_delivery": False,
            "selective_delivery": False,
            "audience_indicators": []
        }
        
        # 선별적 전달
        for pattern in self.delivery_patterns["audience_reach"]["targeted_delivery"]:
            if pattern in content:
                audience_analysis["targeted_delivery"] = True
                audience_analysis["audience_indicators"].append(pattern)
        
        # 광범위한 전달
        for pattern in self.delivery_patterns["audience_reach"]["broad_delivery"]:
            if pattern in content:
                audience_analysis["broad_delivery"] = True
                audience_analysis["audience_indicators"].append(pattern)
        
        # 선택적 전달
        for pattern in self.delivery_patterns["audience_reach"]["selective_delivery"]:
            if pattern in content:
                audience_analysis["selective_delivery"] = True
                audience_analysis["audience_indicators"].append(pattern)
        
        return audience_analysis

    def _calculate_effectiveness_metrics(self, content: str) -> Dict[str, Any]:
        """효과성 지표 계산"""
        effectiveness_metrics = {
            "delivery_success": 0.0,
            "information_quality": 0.0,
            "bias_impact": 0.0
        }
        
        # 전달 성공률 (키워드 기반 추정)
        success_keywords = ["성공", "완료", "도달", "전달", "수신"]
        success_count = sum(1 for keyword in success_keywords if keyword in content)
        effectiveness_metrics["delivery_success"] = min(success_count / len(success_keywords), 1.0)
        
        # 정보 품질 (정확성 지표)
        quality_keywords = ["정확", "완전", "검증", "인증", "공식"]
        quality_count = sum(1 for keyword in quality_keywords if keyword in content)
        effectiveness_metrics["information_quality"] = min(quality_count / len(quality_keywords), 1.0)
        
        # 편향성 영향
        bias_keywords = ["편향", "왜곡", "부정확", "선택적", "과장"]
        bias_count = sum(1 for keyword in bias_keywords if keyword in content)
        effectiveness_metrics["bias_impact"] = min(bias_count / len(bias_keywords), 1.0)
        
        return effectiveness_metrics

    def _calculate_contract_bias_score(self, favorable_terms: List[str], unfavorable_terms: List[str], company_name: str) -> float:
        """계약서 편향성 점수 계산"""
        base_score = 0.5
        
        # 유리한 조건
        favorable_score = len(favorable_terms) * 0.1
        base_score += favorable_score
        
        # 불리한 조건
        unfavorable_score = len(unfavorable_terms) * -0.1
        base_score += unfavorable_score
        
        # 회사별 편향성 조정
        company_bias = self.company_document_bias.get(company_name, {}).get("입찰계약서", {})
        if company_bias.get("bias_type") == "우대적":
            base_score += 0.2
        elif company_bias.get("bias_type") == "중립적":
            base_score += 0.0
        
        return max(0.0, min(1.0, base_score))

    def _identify_target_audience(self, content: str) -> List[str]:
        """대상자 식별"""
        audience_patterns = {
            "정부": ["정부", "공공", "국가", "행정"],
            "기업": ["기업", "회사", "업체", "사업자"],
            "일반인": ["일반", "시민", "주민", "고객"],
            "전문가": ["전문가", "전문", "전문성", "전문지식"]
        }
        
        identified_audience = []
        for audience, keywords in audience_patterns.items():
            for keyword in keywords:
                if keyword in content:
                    identified_audience.append(audience)
                    break
        
        return identified_audience

    def _assess_promotional_bias(self, promotional_claims: List[str], credibility_indicators: List[str], company_name: str) -> str:
        """홍보물 편향성 평가"""
        company_bias = self.company_document_bias.get(company_name, {}).get("홍보물", {})
        
        if len(promotional_claims) > len(credibility_indicators) * 2:
            return "높음"
        elif len(promotional_claims) > len(credibility_indicators):
            return "보통"
        else:
            return "낮음"

    def _assess_delivery_bias(self, content: str, company_name: str) -> str:
        """전달 편향성 평가"""
        company_bias = self.company_document_bias.get(company_name, {}).get("전달", {})
        
        bias_keywords = ["선택적", "편향", "왜곡", "부정확", "선별적"]
        bias_count = sum(1 for keyword in bias_keywords if keyword in content)
        
        if bias_count >= 3:
            return "높음"
        elif bias_count >= 1:
            return "보통"
        else:
            return "낮음"

    def _calculate_complexity_score(self, content: str) -> float:
        """복잡성 점수 계산"""
        # 간단한 복잡성 지표 (문장 길이, 전문 용어 등)
        sentences = content.split('.')
        avg_sentence_length = sum(len(sentence.split()) for sentence in sentences) / len(sentences) if sentences else 0
        
        complexity_score = min(avg_sentence_length / 20.0, 1.0)  # 20단어 이상을 복잡으로 간주
        return complexity_score

    def generate_comprehensive_multi_document_analysis(self, content: str, document_type: str, company_name: str) -> Dict[str, Any]:
        """종합 다중 문서 분석 결과 생성"""
        document_analysis = self.analyze_document_type(content, document_type)
        
        # 문서 유형별 특정 분석
        specific_analysis = {}
        if document_type == "입찰계약서":
            specific_analysis = self.analyze_bid_contract(content, company_name)
        elif document_type == "홍보물":
            specific_analysis = self.analyze_promotional_material(content, company_name)
        elif document_type == "전달":
            specific_analysis = self.analyze_delivery(content, company_name)
        
        return {
            "document_type": document_type,
            "company_name": company_name,
            "general_analysis": {
                "content_analysis": document_analysis.content_analysis,
                "bias_indicators": document_analysis.bias_indicators,
                "promotional_elements": document_analysis.promotional_elements,
                "contractual_terms": document_analysis.contractual_terms,
                "delivery_analysis": document_analysis.delivery_analysis
            },
            "specific_analysis": specific_analysis,
            "comprehensive_insights": {
                "document_purpose": self._identify_document_purpose(document_type, content),
                "target_audience": self._identify_target_audience(content),
                "bias_level": self._assess_overall_bias(document_analysis, specific_analysis),
                "risk_assessment": self._assess_document_risks(document_analysis, specific_analysis),
                "recommendations": self._generate_recommendations(document_analysis, specific_analysis)
            }
        }

    def _identify_document_purpose(self, document_type: str, content: str) -> str:
        """문서 목적 식별"""
        purpose_patterns = {
            "입찰계약서": "계약 조건 정의 및 의무 규정",
            "홍보물": "기업/제품 홍보 및 마케팅",
            "전달": "정보 전달 및 공지",
            "제안서": "사업 제안 및 방안 제시",
            "평가서": "성과 평가 및 검토"
        }
        
        return purpose_patterns.get(document_type, "기타")

    def _assess_overall_bias(self, document_analysis: DocumentAnalysis, specific_analysis: Any) -> str:
        """전체 편향성 평가"""
        bias_indicators_count = len(document_analysis.bias_indicators)
        
        if bias_indicators_count >= 5:
            return "매우 높음"
        elif bias_indicators_count >= 3:
            return "높음"
        elif bias_indicators_count >= 1:
            return "보통"
        else:
            return "낮음"

    def _assess_document_risks(self, document_analysis: DocumentAnalysis, specific_analysis: Any) -> Dict[str, Any]:
        """문서 위험 평가"""
        risk_assessment = {
            "legal_risks": [],
            "reputation_risks": [],
            "financial_risks": [],
            "operational_risks": []
        }
        
        # 법적 위험
        legal_keywords = ["불공정", "위법", "위반", "책임", "손해배상"]
        for keyword in legal_keywords:
            if keyword in str(document_analysis.content_analysis):
                risk_assessment["legal_risks"].append(f"법적 위험: {keyword}")
        
        # 평판 위험
        reputation_keywords = ["과장", "허위", "기만", "왜곡", "부정확"]
        for keyword in reputation_keywords:
            if keyword in str(document_analysis.content_analysis):
                risk_assessment["reputation_risks"].append(f"평판 위험: {keyword}")
        
        return risk_assessment

    def _generate_recommendations(self, document_analysis: DocumentAnalysis, specific_analysis: Any) -> List[str]:
        """권장사항 생성"""
        recommendations = []
        
        if len(document_analysis.bias_indicators) > 0:
            recommendations.append("편향성 지표 발견 - 중립성 확보 필요")
        
        if len(document_analysis.promotional_elements) > 3:
            recommendations.append("과도한 홍보 요소 - 객관성 제고 필요")
        
        if "불공정" in str(document_analysis.content_analysis):
            recommendations.append("불공정 요소 발견 - 공정성 검토 필요")
        
        if len(recommendations) == 0:
            recommendations.append("문서 품질 양호 - 추가 검토 불필요")
        
        return recommendations

# 사용 예시
if __name__ == "__main__":
    analyzer = MultiDocumentAnalyzer()
    # 실제 사용 시에는 다양한 문서 유형의 내용을 전달하여 분석 