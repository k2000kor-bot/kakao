"""
고급 기업 관계 분석기
- 기업 인수/합병 관계 분석
- 지역적 편향성 감지
- 간접적 비하/우호 표현 분석
"""

from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime


@dataclass
class CompanyRelationship:
    """기업 관계 정보"""
    parent_company: str
    subsidiary_company: str
    acquisition_date: str
    region: str
    relationship_type: str  # "인수", "합병", "자회사", "계열사"


@dataclass
class RegionalBias:
    """지역적 편향성 정보"""
    region: str
    companies: List[str]
    bias_type: str  # "우호", "비하", "중립"
    bias_score: float


@dataclass
class IndirectCriticism:
    """간접적 비하/우호 표현"""
    target_company: str
    criticized_company: str
    actual_target: str
    bias_towards: str
    criticism_type: str  # "직접", "간접", "연관"
    confidence_score: float


@dataclass
class AdvancedCompanyAnalysis:
    """고급 기업 분석 결과"""
    company_relationships: List[CompanyRelationship]
    regional_biases: List[RegionalBias]
    indirect_criticisms: List[IndirectCriticism]
    detected_bias_patterns: List[str]
    company_affiliation_analysis: Dict[str, Dict]
    regional_influence_analysis: Dict[str, float]
    overall_bias_assessment: Dict[str, float]


class AdvancedCompanyRelationshipAnalyzer:
    """고급 기업 관계 분석기"""
    
    def __init__(self):
        # 기업 관계 데이터베이스
        self.company_relationships = {
            "대우건설": [
                CompanyRelationship(
                    parent_company="대우건설",
                    subsidiary_company="중흥건설",
                    acquisition_date="2020",
                    region="전라도",
                    relationship_type="인수"
                )
            ],
            "삼성물산": [
                CompanyRelationship(
                    parent_company="삼성물산",
                    subsidiary_company="삼성엔지니어링",
                    acquisition_date="2015",
                    region="서울",
                    relationship_type="계열사"
                )
            ],
            "현대건설": [
                CompanyRelationship(
                    parent_company="현대건설",
                    subsidiary_company="현대산업개발",
                    acquisition_date="2018",
                    region="경기도",
                    relationship_type="자회사"
                )
            ]
        }
        
        # 지역별 기업 분류
        self.regional_companies = {
            "전라도": ["중흥건설", "동부건설", "한진중공업"],
            "경상도": ["삼성물산", "현대건설", "포스코건설"],
            "서울": ["롯데건설", "GS건설", "두산건설"],
            "경기도": ["현대산업개발", "한화건설", "DL이앤씨"]
        }
        
        # 비하/우호 키워드
        self.criticism_keywords = {
            "직접_비하": ["쓰레기", "망할", "최악", "실패", "부실", "문제"],
            "간접_비하": ["의심스럽다", "불안하다", "우려된다", "문제가 있다"],
            "지역_비하": ["전라도", "호남", "지방", "시골", "후진"],
            "우호_표현": ["최고", "우수", "탁월", "뛰어나다", "신뢰할 수 있다"]
        }
        
        # 기업별 연관 키워드
        self.company_associations = {
            "중흥건설": ["전라도", "호남", "지방", "중소기업"],
            "대우건설": ["중흥", "전라도", "인수", "계열사"],
            "삼성물산": ["대기업", "서울", "경상도", "최고"],
            "현대건설": ["대기업", "서울", "경기도", "우수"]
        }

    def analyze_company_relationships(self, content: str) -> AdvancedCompanyAnalysis:
        """고급 기업 관계 분석"""
        
        # 1. 기업 관계 감지
        detected_relationships = self._detect_company_relationships(content)
        
        # 2. 지역적 편향성 분석
        regional_biases = self._analyze_regional_bias(content)
        
        # 3. 간접적 비하/우호 표현 분석
        indirect_criticisms = self._analyze_indirect_criticism(content)
        
        # 4. 편향 패턴 감지
        bias_patterns = self._detect_bias_patterns(content)
        
        # 5. 기업 소속 관계 분석
        affiliation_analysis = self._analyze_company_affiliation(content)
        
        # 6. 지역 영향도 분석
        regional_influence = self._analyze_regional_influence(content)
        
        # 7. 전체 편향성 평가
        overall_bias = self._assess_overall_bias(content)
        
        return AdvancedCompanyAnalysis(
            company_relationships=detected_relationships,
            regional_biases=regional_biases,
            indirect_criticisms=indirect_criticisms,
            detected_bias_patterns=bias_patterns,
            company_affiliation_analysis=affiliation_analysis,
            regional_influence_analysis=regional_influence,
            overall_bias_assessment=overall_bias
        )

    def _detect_company_relationships(self, content: str) -> List[CompanyRelationship]:
        """기업 관계 감지"""
        detected = []
        
        # 대우건설-중흥건설 관계 감지
        if "중흥" in content and ("대우" in content or "인수" in content):
            detected.append(CompanyRelationship(
                parent_company="대우건설",
                subsidiary_company="중흥건설",
                acquisition_date="2020",
                region="전라도",
                relationship_type="인수"
            ))
        
        # 삼성물산-삼성엔지니어링 관계 감지
        if "삼성엔지니어링" in content and "삼성" in content:
            detected.append(CompanyRelationship(
                parent_company="삼성물산",
                subsidiary_company="삼성엔지니어링",
                acquisition_date="2015",
                region="서울",
                relationship_type="계열사"
            ))
        
        return detected

    def _analyze_regional_bias(self, content: str) -> List[RegionalBias]:
        """지역적 편향성 분석"""
        biases = []
        
        # 전라도 편향성 분석
        jeolla_keywords = ["전라도", "호남", "중흥", "지방"]
        jeolla_criticism = sum(1 for keyword in jeolla_keywords if keyword in content)
        
        if jeolla_criticism > 0:
            biases.append(RegionalBias(
                region="전라도",
                companies=["중흥건설", "동부건설"],
                bias_type="비하" if jeolla_criticism > 2 else "중립",
                bias_score=min(jeolla_criticism * 0.3, 1.0)
            ))
        
        # 경상도 편향성 분석
        gyeongsang_keywords = ["경상도", "영남", "삼성", "대기업"]
        gyeongsang_favor = sum(1 for keyword in gyeongsang_keywords if keyword in content)
        
        if gyeongsang_favor > 0:
            biases.append(RegionalBias(
                region="경상도",
                companies=["삼성물산", "포스코건설"],
                bias_type="우호" if gyeongsang_favor > 2 else "중립",
                bias_score=min(gyeongsang_favor * 0.25, 1.0)
            ))
        
        return biases

    def _analyze_indirect_criticism(self, content: str) -> List[IndirectCriticism]:
        """간접적 비하/우호 표현 분석"""
        criticisms = []
        
        # 중흥건설 비하 → 대우건설 비하 → 삼성물산 우호
        if "중흥" in content and any(word in content for word in self.criticism_keywords["직접_비하"] + self.criticism_keywords["간접_비하"]):
            criticisms.append(IndirectCriticism(
                target_company="중흥건설",
                criticized_company="중흥건설",
                actual_target="대우건설",
                bias_towards="삼성물산",
                criticism_type="간접",
                confidence_score=0.85
            ))
        
        # 전라도 지역 비하 → 중흥건설 비하 → 대우건설 비하 → 삼성물산 우호
        if any(word in content for word in self.criticism_keywords["지역_비하"]):
            criticisms.append(IndirectCriticism(
                target_company="전라도",
                criticized_company="중흥건설",
                actual_target="대우건설",
                bias_towards="삼성물산",
                criticism_type="연관",
                confidence_score=0.75
            ))
        
        # 삼성물산 직접 우호
        if "삼성" in content and any(word in content for word in self.criticism_keywords["우호_표현"]):
            criticisms.append(IndirectCriticism(
                target_company="삼성물산",
                criticized_company="",
                actual_target="삼성물산",
                bias_towards="삼성물산",
                criticism_type="직접",
                confidence_score=0.95
            ))
        
        return criticisms

    def _detect_bias_patterns(self, content: str) -> List[str]:
        """편향 패턴 감지"""
        patterns = []
        
        # 중흥건설 비하 패턴
        if "중흥" in content and any(word in content for word in self.criticism_keywords["직접_비하"]):
            patterns.append("중흥건설 직접 비하 → 대우건설 간접 비하")
        
        # 전라도 지역 비하 패턴
        if any(word in content for word in self.criticism_keywords["지역_비하"]):
            patterns.append("전라도 지역 비하 → 중흥건설 연관 비하")
        
        # 삼성물산 우호 패턴
        if "삼성" in content and any(word in content for word in self.criticism_keywords["우호_표현"]):
            patterns.append("삼성물산 직접 우호 표현")
        
        # 대우건설 간접 비하 패턴
        if "대우" in content and any(word in content for word in self.criticism_keywords["간접_비하"]):
            patterns.append("대우건설 간접 비하")
        
        return patterns

    def _analyze_company_affiliation(self, content: str) -> Dict[str, Dict]:
        """기업 소속 관계 분석"""
        analysis = {}
        
        # 대우건설-중흥건설 관계
        if "중흥" in content:
            analysis["대우건설"] = {
                "subsidiaries": ["중흥건설"],
                "regional_focus": "전라도",
                "criticism_impact": "중흥 비하 = 대우 비하",
                "bias_transfer": True
            }
        
        # 삼성물산 관계
        if "삼성" in content:
            analysis["삼성물산"] = {
                "subsidiaries": ["삼성엔지니어링"],
                "regional_focus": "경상도",
                "criticism_impact": "직접 우호",
                "bias_transfer": False
            }
        
        return analysis

    def _analyze_regional_influence(self, content: str) -> Dict[str, float]:
        """지역 영향도 분석"""
        influence = {}
        
        # 전라도 영향도
        jeolla_mentions = content.count("전라도") + content.count("호남") + content.count("중흥")
        influence["전라도"] = min(jeolla_mentions * 0.2, 1.0)
        
        # 경상도 영향도
        gyeongsang_mentions = content.count("경상도") + content.count("영남") + content.count("삼성")
        influence["경상도"] = min(gyeongsang_mentions * 0.2, 1.0)
        
        return influence

    def _assess_overall_bias(self, content: str) -> Dict[str, float]:
        """전체 편향성 평가"""
        bias_scores = {}
        
        # 삼성물산 편향도
        samsung_favor = 0
        if "삼성" in content:
            samsung_favor += content.count("최고") * 0.3
            samsung_favor += content.count("우수") * 0.2
            samsung_favor += content.count("신뢰") * 0.2
        
        bias_scores["삼성물산"] = min(samsung_favor, 1.0)
        
        # 대우건설 편향도 (간접적)
        daewoo_bias = 0
        if "중흥" in content:
            daewoo_bias += content.count("쓰레기") * 0.4
            daewoo_bias += content.count("문제") * 0.3
            daewoo_bias += content.count("부실") * 0.3
        
        bias_scores["대우건설"] = -min(daewoo_bias, 1.0)  # 음수 = 비하
        
        # 전라도 지역 편향도
        jeolla_bias = 0
        if "전라도" in content or "호남" in content:
            jeolla_bias += content.count("지방") * 0.3
            jeolla_bias += content.count("후진") * 0.4
            jeolla_bias += content.count("문제") * 0.2
        
        bias_scores["전라도"] = -min(jeolla_bias, 1.0)  # 음수 = 비하
        
        return bias_scores

    def generate_relationship_report(self, analysis: AdvancedCompanyAnalysis) -> Dict:
        """기업 관계 분석 보고서 생성"""
        return {
            "analysis_type": "고급 기업 관계 분석",
            "timestamp": datetime.now().isoformat(),
            "company_relationships": [
                {
                    "parent": rel.parent_company,
                    "subsidiary": rel.subsidiary_company,
                    "region": rel.region,
                    "relationship": rel.relationship_type
                } for rel in analysis.company_relationships
            ],
            "regional_biases": [
                {
                    "region": bias.region,
                    "companies": bias.companies,
                    "bias_type": bias.bias_type,
                    "score": bias.bias_score
                } for bias in analysis.regional_biases
            ],
            "indirect_criticisms": [
                {
                    "target": crit.target_company,
                    "criticized": crit.criticized_company,
                    "actual_target": crit.actual_target,
                    "bias_towards": crit.bias_towards,
                    "type": crit.criticism_type,
                    "confidence": crit.confidence_score
                } for crit in analysis.indirect_criticisms
            ],
            "bias_patterns": analysis.detected_bias_patterns,
            "company_affiliations": analysis.company_affiliation_analysis,
            "regional_influence": analysis.regional_influence_analysis,
            "overall_bias": analysis.overall_bias_assessment,
            "key_insights": self._generate_key_insights(analysis)
        }

    def _generate_key_insights(self, analysis: AdvancedCompanyAnalysis) -> List[str]:
        """핵심 인사이트 생성"""
        insights = []
        
        # 중흥건설 비하 → 대우건설 비하 인사이트
        if any("중흥" in str(crit) for crit in analysis.indirect_criticisms):
            insights.append("중흥건설 비하는 실제로 대우건설을 비하하는 것으로 해석됨")
            insights.append("이는 삼성물산에 대한 우호적 편향을 나타냄")
        
        # 전라도 지역 비하 인사이트
        if any("전라도" in str(bias) for bias in analysis.regional_biases):
            insights.append("전라도 지역 비하는 중흥건설 및 대우건설에 대한 간접적 비하")
            insights.append("지역적 편향성이 기업 평가에 영향을 미침")
        
        # 삼성물산 우호 인사이트
        if analysis.overall_bias_assessment.get("삼성물산", 0) > 0.5:
            insights.append("삼성물산에 대한 직접적 우호 표현이 감지됨")
            insights.append("이는 다른 기업에 대한 상대적 비하로 이어질 수 있음")
        
        return insights 