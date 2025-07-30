import json
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import random


class DisinformationType(Enum):
    """거짓 정보 유형"""
    FABRICATED_FACTS = "fabricated_facts"           # 조작된 사실
    MISLEADING_STATISTICS = "misleading_statistics" # 오도하는 통계
    FALSE_TESTIMONIALS = "false_testimonials"       # 가짜 증언
    MANUFACTURED_EVIDENCE = "manufactured_evidence" # 조작된 증거
    DISTORTED_CONTEXT = "distorted_context"         # 왜곡된 맥락
    FAKE_EXPERT_OPINIONS = "fake_expert_opinions"   # 가짜 전문가 의견
    SELECTIVE_REPORTING = "selective_reporting"     # 선택적 보고
    EMOTIONAL_MANIPULATION = "emotional_manipulation" # 감정 조작


class PropagandaTechnique(Enum):
    """선전 기법"""
    BIG_LIE = "big_lie"                             # 큰 거짓말
    REPETITION_SATURATION = "repetition_saturation" # 반복 포화
    BANDWAGON_EFFECT = "bandwagon_effect"           # 편승 효과
    FEAR_UNCERTAINTY_DOUBT = "fear_uncertainty_doubt" # FUD 전략
    STRAWMAN_ATTACKS = "strawman_attacks"           # 허수아비 공격
    FALSE_DICHOTOMY = "false_dichotomy"             # 거짓 이분법
    APPEAL_TO_AUTHORITY = "appeal_to_authority"     # 권위 호소
    GASLIGHTING = "gaslighting"                     # 가스라이팅


@dataclass
class DisinformationPattern:
    """거짓 정보 패턴"""
    pattern_id: str
    disinformation_type: DisinformationType
    propaganda_techniques: List[PropagandaTechnique]
    fabrication_methods: List[str]
    credibility_builders: List[str]
    verification_bypasses: List[str]
    psychological_hooks: List[str]
    damage_potential: float
    detection_difficulty: float


class DisinformationWarfareSystem:
    """거짓 정보 전쟁 시스템"""
    
    def __init__(self):
        self.disinformation_patterns = self._initialize_disinformation_patterns()
        self.fabrication_arsenal = self._initialize_fabrication_arsenal()
        self.credibility_manipulation = self._initialize_credibility_manipulation()
        self.psychological_exploitation = self._initialize_psychological_exploitation()
        self.verification_circumvention = self._initialize_verification_circumvention()
        
    def _initialize_disinformation_patterns(self) -> Dict[str, DisinformationPattern]:
        """거짓 정보 패턴 초기화"""
        return {
            "fabricated_superiority": DisinformationPattern(
                pattern_id="fabrication_001",
                disinformation_type=DisinformationType.FABRICATED_FACTS,
                propaganda_techniques=[
                    PropagandaTechnique.BIG_LIE,
                    PropagandaTechnique.REPETITION_SATURATION
                ],
                fabrication_methods=[
                    "가짜 성과 데이터 생성",
                    "존재하지 않는 수상 경력 조작",
                    "허위 기술력 평가 결과 제시",
                    "조작된 고객 만족도 통계"
                ],
                credibility_builders=[
                    "권위 있는 기관명 도용",
                    "가짜 인증서 및 자격증",
                    "조작된 언론 보도 인용",
                    "허위 전문가 추천서"
                ],
                verification_bypasses=[
                    "검증하기 어려운 해외 사례 인용",
                    "복잡한 기술 용어로 혼란 유도",
                    "시간적 압박으로 검증 시간 차단",
                    "다량의 정보로 핵심 숨기기"
                ],
                psychological_hooks=[
                    "FOMO(놓침의 두려움) 유발",
                    "사회적 증거 조작",
                    "권위에 대한 복종 심리 이용",
                    "확증 편향 강화"
                ],
                damage_potential=0.9,
                detection_difficulty=0.8
            ),
            
            "misleading_comparison": DisinformationPattern(
                pattern_id="misleading_001",
                disinformation_type=DisinformationType.MISLEADING_STATISTICS,
                propaganda_techniques=[
                    PropagandaTechnique.BIG_LIE,
                    PropagandaTechnique.FALSE_DICHOTOMY
                ],
                fabrication_methods=[
                    "통계 조작 및 왜곡",
                    "비교 기준 조작",
                    "샘플 크기 은폐",
                    "시점 선택적 적용"
                ],
                credibility_builders=[
                    "복잡한 수치와 그래프",
                    "학술적 형식 모방",
                    "다수의 데이터 포인트",
                    "과학적 용어 남발"
                ],
                verification_bypasses=[
                    "원시 데이터 접근 차단",
                    "계산 과정 복잡화",
                    "전문 지식 요구",
                    "시간 제약 조건"
                ],
                psychological_hooks=[
                    "숫자에 대한 맹신 이용",
                    "복잡함을 전문성으로 착각",
                    "그래프의 시각적 착시",
                    "상대적 우위 강조"
                ],
                damage_potential=0.85,
                detection_difficulty=0.9
            ),
            
            "manufactured_crisis": DisinformationPattern(
                pattern_id="crisis_001",
                disinformation_type=DisinformationType.EMOTIONAL_MANIPULATION,
                propaganda_techniques=[
                    PropagandaTechnique.FEAR_UNCERTAINTY_DOUBT,
                    PropagandaTechnique.GASLIGHTING
                ],
                fabrication_methods=[
                    "가상의 위기 상황 조성",
                    "과장된 위험 요소 강조",
                    "허위 긴급성 부여",
                    "조작된 타임라인 제시"
                ],
                credibility_builders=[
                    "감정적 사례 연구",
                    "생생한 시나리오 묘사",
                    "권위자의 우려 표명",
                    "언론 보도 형식 모방"
                ],
                verification_bypasses=[
                    "감정적 반응 우선 유도",
                    "논리적 사고 차단",
                    "즉시 행동 요구",
                    "검증 시간 박탈"
                ],
                psychological_hooks=[
                    "생존 본능 자극",
                    "손실 회피 성향 이용",
                    "집단 압력 조성",
                    "책임감 부담 가중"
                ],
                damage_potential=0.95,
                detection_difficulty=0.7
            ),
            
            "false_consensus": DisinformationPattern(
                pattern_id="consensus_001",
                disinformation_type=DisinformationType.FALSE_TESTIMONIALS,
                propaganda_techniques=[
                    PropagandaTechnique.BANDWAGON_EFFECT,
                    PropagandaTechnique.APPEAL_TO_AUTHORITY
                ],
                fabrication_methods=[
                    "가짜 고객 후기 대량 생성",
                    "조작된 업계 의견 수렴",
                    "허위 동의서 및 추천서",
                    "가상의 성공 사례"
                ],
                credibility_builders=[
                    "실명과 직책 명시",
                    "구체적 수치와 날짜",
                    "사진과 서명 첨부",
                    "연락처 정보 제공"
                ],
                verification_bypasses=[
                    "개인정보 보호 명목",
                    "기업 기밀 유지",
                    "법적 제약 핑계",
                    "시간적 제약 이용"
                ],
                psychological_hooks=[
                    "사회적 증거 심리",
                    "다수 의견 추종 성향",
                    "권위 인정 욕구",
                    "안전감 추구"
                ],
                damage_potential=0.8,
                detection_difficulty=0.85
            )
        }
    
    def _initialize_fabrication_arsenal(self) -> Dict[str, List[str]]:
        """조작 무기고 초기화"""
        return {
            "fake_credentials": [
                "국제건설협회 최우수상 수상 (2023년)",
                "아시아 건설기술 혁신대상 1위",
                "ISO 99999 특별인증 획득",
                "건설안전 제로사고 연속 1000일 달성",
                "친환경 건설 글로벌 인증 획득"
            ],
            "fabricated_statistics": [
                "고객 만족도 99.7% (업계 평균 85%)",
                "공기 단축률 평균 23% (경쟁사 대비)",
                "하자 발생률 0.1% (업계 최저 수준)",
                "원가 절감 효과 평균 18%",
                "안전사고 발생률 제로 (3년 연속)"
            ],
            "false_expert_opinions": [
                "서울대 건축학과 김○○ 교수: '업계 최고 수준의 기술력'",
                "한국건설기술연구원 박○○ 박사: '혁신적 공법의 선두주자'",
                "대한건축학회 회장: '믿고 맡길 수 있는 유일한 업체'",
                "국토교통부 전 차관: '국가 대표급 건설사'",
                "해외 건설 전문가: '아시아 최고의 시공 능력'"
            ],
            "manufactured_evidence": [
                "해외 유명 건축물 시공 실적 (실제로는 하청 참여)",
                "정부 기관 발주 사업 수주 내역 (과장된 규모)",
                "특허 기술 보유 현황 (실용성 없는 특허 포함)",
                "국제 프로젝트 참여 경험 (단순 자문 역할을 시공으로 포장)",
                "첨단 장비 보유 현황 (리스 장비를 자체 보유로 조작)"
            ],
            "distorted_testimonials": [
                "삼성전자 시설관리팀: '최고의 파트너십을 경험했습니다'",
                "LG그룹 건설 담당자: '다른 업체와는 차원이 다릅니다'",
                "현대자동차 시설팀: '앞으로도 계속 함께하고 싶습니다'",
                "SK그룹 건설부문: '업계 최고 수준의 서비스였습니다'",
                "포스코 건설팀: '믿음직한 파트너를 찾았습니다'"
            ]
        }
    
    def _initialize_credibility_manipulation(self) -> Dict[str, List[str]]:
        """신뢰성 조작 기법"""
        return {
            "authority_borrowing": [
                "정부 기관 로고 및 인증 마크 부당 사용",
                "유명 대학 연구소와의 협력 관계 과장",
                "국제 기구 회원사 자격 허위 표시",
                "언론사 보도 내용 왜곡 인용",
                "정치인 및 관료 추천사 조작"
            ],
            "scientific_facade": [
                "복잡한 기술 용어와 수식 남발",
                "가짜 연구 보고서 및 백서 제작",
                "조작된 실험 결과 데이터 제시",
                "허위 학술 논문 인용",
                "가상의 기술 특허 정보 공개"
            ],
            "social_proof_manipulation": [
                "가짜 소셜미디어 계정 대량 생성",
                "조작된 온라인 리뷰 및 평점",
                "허위 언론 보도 및 기사 제작",
                "가상의 업계 동향 보고서",
                "조작된 고객 인터뷰 영상"
            ],
            "urgency_creation": [
                "한정된 기회라는 허위 정보",
                "경쟁사의 위협적 움직임 과장",
                "시장 상황 급변 조작",
                "법규 변경 임박 허위 정보",
                "자원 부족 상황 조성"
            ]
        }
    
    def _initialize_psychological_exploitation(self) -> Dict[str, List[str]]:
        """심리적 취약점 악용"""
        return {
            "cognitive_bias_exploitation": [
                "확증 편향: 기존 믿음 강화하는 정보만 제공",
                "가용성 휴리스틱: 기억하기 쉬운 극적 사례 강조",
                "앵커링 효과: 극단적 수치를 먼저 제시",
                "매몰비용 오류: 이미 투입된 비용 강조",
                "프레이밍 효과: 동일한 정보를 다르게 포장"
            ],
            "emotional_manipulation": [
                "두려움: 경쟁사 선택 시 파멸적 결과 강조",
                "탐욕: 과도한 이익과 혜택 약속",
                "분노: 다른 업체들의 부정적 측면 부각",
                "자부심: 특별한 선택이라는 우월감 부여",
                "죄책감: 잘못된 선택으로 인한 책임감 강조"
            ],
            "social_pressure_tactics": [
                "다수의 압박: 모든 사람이 선택한다는 착각",
                "권위의 압박: 전문가들의 만장일치 조작",
                "시간의 압박: 즉시 결정하지 않으면 기회 상실",
                "사회적 증거: 성공한 사람들의 선택이라고 포장",
                "배타적 클럽: 선택받은 소수만의 특권이라고 포장"
            ],
            "decision_making_sabotage": [
                "정보 과부하: 너무 많은 정보로 판단력 마비",
                "복잡성 증대: 단순한 것을 복잡하게 만들어 혼란 유도",
                "시간 압박: 충분한 검토 시간 박탈",
                "대안 차단: 다른 선택지들의 부정적 측면만 강조",
                "의존성 조성: 스스로 판단할 능력이 없다고 세뇌"
            ]
        }
    
    def _initialize_verification_circumvention(self) -> Dict[str, List[str]]:
        """검증 우회 기법"""
        return {
            "evidence_hiding": [
                "핵심 정보를 부수적 정보에 묻어버리기",
                "복잡한 문서 구조로 중요 내용 숨기기",
                "전문 용어로 포장하여 이해 방해",
                "여러 문서에 정보를 분산시켜 전체 파악 어렵게 하기",
                "시간적 제약을 이유로 상세 검토 차단"
            ],
            "source_obfuscation": [
                "출처를 애매하게 표기하여 추적 어렵게 하기",
                "2차, 3차 자료만 제시하여 원본 확인 차단",
                "해외 소스 인용으로 검증 비용 증대",
                "권위 있는 기관명 언급 후 구체적 문서 미제시",
                "구두 전달 정보라고 주장하여 기록 부재 합리화"
            ],
            "fact_checking_interference": [
                "검증 시도를 불신과 의심으로 해석",
                "검증 요구를 시간 낭비라고 비난",
                "전문성 부족을 이유로 검증 능력 폄하",
                "검증 과정 자체를 복잡하고 어렵게 만들기",
                "검증 결과가 나오기 전에 기정사실화"
            ],
            "counter_narrative_preparation": [
                "예상되는 반박에 대한 미리 준비된 대응",
                "비판자들의 동기 의심하게 만들기",
                "대안 설명으로 관심 분산시키기",
                "감정적 반응 유도하여 논리적 사고 차단",
                "권위를 이용한 반박 억제"
            ]
        }
    
    def generate_disinformation_campaign(
        self,
        target_company: str,
        competitor_companies: List[str],
        campaign_objectives: List[str],
        target_audience: str = "의사결정권자",
        intensity_level: float = 0.8,
        stealth_mode: bool = True,
        ethical_constraints: bool = False
    ) -> Dict[str, Any]:
        """거짓 정보 캠페인 생성"""
        
        # 캠페인 전략 수립
        campaign_strategy = self._develop_campaign_strategy(
            target_company, competitor_companies, campaign_objectives, intensity_level
        )
        
        # 거짓 정보 패턴 선택
        selected_patterns = self._select_disinformation_patterns(
            campaign_objectives, intensity_level
        )
        
        # 조작된 증거 자료 생성
        fabricated_evidence = self._generate_fabricated_evidence(
            target_company, competitor_companies, selected_patterns
        )
        
        # 심리적 조작 시나리오
        psychological_scenarios = self._create_psychological_scenarios(
            target_audience, selected_patterns
        )
        
        # 검증 우회 전략
        verification_bypass = self._design_verification_bypass(
            fabricated_evidence, stealth_mode
        )
        
        # 전파 및 확산 계획
        dissemination_plan = self._create_dissemination_plan(
            target_audience, stealth_mode
        )
        
        # 위험도 평가
        risk_assessment = self._assess_campaign_risks(
            selected_patterns, intensity_level, stealth_mode
        )
        
        return {
            "campaign_id": f"disinfo_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "target_company": target_company,
            "competitor_companies": competitor_companies,
            "campaign_strategy": campaign_strategy,
            "disinformation_patterns": [p.pattern_id for p in selected_patterns],
            "fabricated_evidence": fabricated_evidence,
            "psychological_scenarios": psychological_scenarios,
            "verification_bypass": verification_bypass,
            "dissemination_plan": dissemination_plan,
            "risk_assessment": risk_assessment,
            "effectiveness_prediction": self._predict_campaign_effectiveness(
                selected_patterns, target_audience, intensity_level
            ),
            "detection_probability": self._calculate_detection_probability(
                selected_patterns, stealth_mode
            ),
            "legal_liability": self._assess_legal_liability(selected_patterns),
            "ethical_violation_score": self._calculate_ethical_violation(selected_patterns),
            "critical_warnings": [
                "🚨 거짓 정보 유포는 심각한 범죄행위입니다",
                "🚨 법적 처벌과 민사 책임을 져야 할 수 있습니다",
                "🚨 사회적 신뢰를 파괴하는 행위입니다",
                "🚨 피해자에게 돌이킬 수 없는 손해를 입힐 수 있습니다",
                "🚨 민주주의와 공정한 경쟁을 파괴합니다"
            ],
            "usage_restrictions": [
                "❌ 실제 사용 절대 금지",
                "❌ 연구 및 방어 목적만 허용",
                "❌ 윤리적 경계선 완전 위반",
                "❌ 법적 책임 100% 보장",
                "❌ 사회적 파장 극대"
            ],
            "generation_metadata": {
                "intensity_level": intensity_level,
                "stealth_mode": stealth_mode,
                "ethical_constraints": ethical_constraints,
                "generation_timestamp": datetime.now().isoformat()
            }
        }
    
    def _develop_campaign_strategy(
        self,
        target_company: str,
        competitors: List[str],
        objectives: List[str],
        intensity: float
    ) -> Dict[str, Any]:
        """캠페인 전략 개발"""
        
        strategy = {
            "primary_objective": f"{target_company} 절대적 우위 확립",
            "secondary_objectives": [
                f"{comp} 신뢰도 파괴" for comp in competitors
            ],
            "attack_vectors": [
                "기술력 조작된 우위 주장",
                "경쟁사 결함 과장 및 조작",
                "가짜 성과 지표 대량 생산",
                "허위 전문가 의견 유포",
                "조작된 고객 후기 확산"
            ],
            "timeline": {
                "preparation_phase": "1-2주 (거짓 자료 제작)",
                "launch_phase": "1주 (초기 유포)",
                "amplification_phase": "2-3주 (확산 및 강화)",
                "maintenance_phase": "지속적 (신뢰성 유지)"
            },
            "success_metrics": [
                f"{target_company} 선택 확률 90% 이상",
                "경쟁사 의심 증가",
                "검증 시도 억제",
                "의사결정 가속화"
            ]
        }
        
        if intensity > 0.8:
            strategy["extreme_measures"] = [
                "경쟁사 치명적 결함 조작",
                "법적 문제 있다고 허위 유포",
                "안전성 문제 과장",
                "재무 안정성 의심 조성"
            ]
        
        return strategy
    
    def _select_disinformation_patterns(
        self,
        objectives: List[str],
        intensity: float
    ) -> List[DisinformationPattern]:
        """거짓 정보 패턴 선택"""
        
        selected = []
        
        # 기본 패턴들
        selected.append(self.disinformation_patterns["fabricated_superiority"])
        selected.append(self.disinformation_patterns["misleading_comparison"])
        
        # 강도에 따른 추가 패턴
        if intensity > 0.6:
            selected.append(self.disinformation_patterns["false_consensus"])
        
        if intensity > 0.8:
            selected.append(self.disinformation_patterns["manufactured_crisis"])
        
        return selected
    
    def _generate_fabricated_evidence(
        self,
        target_company: str,
        competitors: List[str],
        patterns: List[DisinformationPattern]
    ) -> Dict[str, List[str]]:
        """조작된 증거 생성"""
        
        evidence = {
            "superiority_claims": [
                f"{target_company}는 업계 유일의 특허 기술 보유",
                f"{target_company} 시공 품질 업계 1위 (가짜 인증기관)",
                f"{target_company} 고객 만족도 99.8% (조작된 설문)",
                f"{target_company} 안전사고 제로 기록 (허위 통계)"
            ],
            "competitor_defamation": [],
            "false_testimonials": [
                f"대기업 건설팀장: '{target_company}와 작업하면 결과가 확실히 다릅니다'",
                f"건설 전문가: '{target_company}는 국내 최고 수준입니다'",
                f"정부 관계자: '{target_company}는 신뢰할 수 있는 파트너입니다'",
                f"해외 바이어: '{target_company}의 기술력은 세계적 수준입니다'"
            ],
            "manufactured_statistics": [
                f"{target_company} 공기 단축률 평균 25% (업계 평균 8%)",
                f"{target_company} 원가 절감 효과 평균 20%",
                f"{target_company} 하자 발생률 0.05% (업계 최저)",
                f"{target_company} 친환경 건설 지수 98점 (업계 평균 73점)"
            ]
        }
        
        # 경쟁사 비방 내용 생성
        for comp in competitors:
            evidence["competitor_defamation"].extend([
                f"{comp} 최근 안전사고 다발 (과장된 정보)",
                f"{comp} 시공 품질 문제로 소송 진행 중 (허위 정보)",
                f"{comp} 재무 상태 불안정 (왜곡된 분석)",
                f"{comp} 주요 기술진 대량 이탈 (조작된 소문)"
            ])
        
        return evidence
    
    def _create_psychological_scenarios(
        self,
        target_audience: str,
        patterns: List[DisinformationPattern]
    ) -> Dict[str, List[str]]:
        """심리적 조작 시나리오"""
        
        scenarios = {
            "fear_induction": [
                "다른 업체 선택 시 프로젝트 실패 확률 90%",
                "경쟁사들의 숨겨진 치명적 결함들",
                "잘못된 선택으로 인한 막대한 손실 사례",
                "업계 전문가들의 심각한 우려 표명"
            ],
            "urgency_creation": [
                "이 조건은 이번 달까지만 유효",
                "다른 대형 프로젝트로 인한 일정 조정 임박",
                "정부 정책 변경으로 인한 비용 증가 예정",
                "원자재 가격 급등으로 인한 단가 인상 불가피"
            ],
            "authority_pressure": [
                "정부 기관에서도 강력 추천하는 업체",
                "업계 최고 전문가들의 만장일치 의견",
                "국제 기구에서 인정받은 유일한 국내 업체",
                "해외 유명 건설사들의 벤치마킹 대상"
            ],
            "social_proof_manipulation": [
                "국내 대기업 90%가 선택한 파트너",
                "성공한 프로젝트 관계자들의 공통된 선택",
                "업계 리더들이 먼저 선택한 혁신적 업체",
                "똑똑한 사람들이 이미 내린 결론"
            ]
        }
        
        return scenarios
    
    def _design_verification_bypass(
        self,
        evidence: Dict[str, List[str]],
        stealth_mode: bool
    ) -> Dict[str, List[str]]:
        """검증 우회 설계"""
        
        bypass_methods = {
            "complexity_shields": [
                "복잡한 기술 자료로 포장하여 이해 방해",
                "여러 문서에 정보 분산시켜 전체 파악 어렵게 하기",
                "전문 용어 남발로 검증 의지 꺾기",
                "방대한 양의 부가 정보로 핵심 숨기기"
            ],
            "time_constraints": [
                "긴급한 결정이 필요하다고 압박",
                "검증에 시간을 쓰면 기회를 놓친다고 협박",
                "다른 업무로 바쁘다는 이유로 간단히 처리 유도",
                "전문가 검토는 나중에 하면 된다고 안심시키기"
            ],
            "authority_intimidation": [
                "권위 있는 인물들이 이미 검증했다고 주장",
                "의심하는 것 자체가 무례하다고 압박",
                "전문성 부족을 이유로 검증 능력 폄하",
                "신뢰 관계에 금이 간다고 위협"
            ],
            "misdirection_tactics": [
                "다른 이슈로 관심 분산시키기",
                "감정적 반응 유도하여 논리적 사고 차단",
                "긍정적 측면만 강조하여 의심 무력화",
                "미래 혜택에 집중하게 하여 현재 검증 회피"
            ]
        }
        
        if stealth_mode:
            bypass_methods["stealth_operations"] = [
                "단계적으로 조금씩 정보 제공",
                "비공식적 경로를 통한 정보 유포",
                "제3자를 통한 간접적 전달",
                "우연한 발견인 것처럼 포장"
            ]
        
        return bypass_methods
    
    def _create_dissemination_plan(
        self,
        target_audience: str,
        stealth_mode: bool
    ) -> Dict[str, Any]:
        """유포 및 확산 계획"""
        
        plan = {
            "primary_channels": [
                "직접 프레젠테이션 및 제안서",
                "업계 네트워킹 이벤트 활용",
                "전문 매체 및 보고서 형태",
                "권위자를 통한 추천 형식"
            ],
            "amplification_methods": [
                "핵심 인물들에게 우선 전파",
                "여러 경로를 통한 동시 노출",
                "반복 노출로 신뢰성 증대",
                "상호 인용으로 신뢰도 교차 증명"
            ],
            "timing_strategy": [
                "의사결정 직전 타이밍에 집중 노출",
                "경쟁사 검토 시점에 부정적 정보 유포",
                "긍정적 분위기일 때 추가 정보 제공",
                "의심이 생길 때 즉시 대응"
            ]
        }
        
        if stealth_mode:
            plan["covert_operations"] = [
                "익명의 업계 관계자 명목으로 유포",
                "제3자 기관을 통한 간접 전달",
                "소문과 입소문 형태로 자연스럽게 확산",
                "공식적인 경로가 아닌 비공식 채널 활용"
            ]
        
        return plan
    
    def _assess_campaign_risks(
        self,
        patterns: List[DisinformationPattern],
        intensity: float,
        stealth_mode: bool
    ) -> Dict[str, Any]:
        """캠페인 위험도 평가"""
        
        avg_damage = sum(p.damage_potential for p in patterns) / len(patterns)
        avg_detection = sum(p.detection_difficulty for p in patterns) / len(patterns)
        
        risk_level = "EXTREME"
        if avg_damage > 0.9:
            risk_level = "CATASTROPHIC"
        elif avg_damage > 0.7:
            risk_level = "SEVERE"
        
        return {
            "overall_risk_level": risk_level,
            "damage_potential": avg_damage,
            "detection_probability": 1.0 - avg_detection,
            "legal_consequences": [
                "허위 사실 유포죄",
                "업무 방해죄",
                "명예훼손죄",
                "부정경쟁방지법 위반",
                "민사상 손해배상 책임"
            ],
            "social_consequences": [
                "업계 신뢰도 완전 실추",
                "영구적 평판 손상",
                "사회적 매장",
                "향후 사업 기회 박탈",
                "도덕적 비난과 지탄"
            ],
            "operational_risks": [
                "거짓 정보 발각 시 역효과",
                "경쟁사의 반격 가능성",
                "내부 고발자 출현 위험",
                "증거 수집 및 보존의 어려움",
                "일관성 유지의 복잡성"
            ]
        }
    
    def _predict_campaign_effectiveness(
        self,
        patterns: List[DisinformationPattern],
        target_audience: str,
        intensity: float
    ) -> Dict[str, float]:
        """캠페인 효과성 예측"""
        
        base_effectiveness = sum(p.damage_potential for p in patterns) / len(patterns)
        
        # 대상 청중별 조정
        audience_factor = 1.0
        if target_audience == "의사결정권자":
            audience_factor = 1.2  # 더 큰 영향
        elif target_audience == "기술진":
            audience_factor = 0.8  # 검증 능력 높음
        
        # 강도별 조정
        intensity_factor = 0.5 + (intensity * 0.5)
        
        final_effectiveness = base_effectiveness * audience_factor * intensity_factor
        
        return {
            "persuasion_probability": min(final_effectiveness, 0.95),
            "decision_influence": min(final_effectiveness * 1.1, 1.0),
            "competitor_damage": min(final_effectiveness * 0.9, 1.0),
            "long_term_impact": min(final_effectiveness * 0.7, 1.0),
            "detection_avoidance": sum(p.detection_difficulty for p in patterns) / len(patterns)
        }
    
    def _calculate_detection_probability(
        self,
        patterns: List[DisinformationPattern],
        stealth_mode: bool
    ) -> float:
        """탐지 확률 계산"""
        
        avg_difficulty = sum(p.detection_difficulty for p in patterns) / len(patterns)
        detection_prob = 1.0 - avg_difficulty
        
        if stealth_mode:
            detection_prob *= 0.7  # 은밀 모드에서 탐지 확률 감소
        
        return min(detection_prob, 0.9)  # 최대 90%로 제한
    
    def _assess_legal_liability(self, patterns: List[DisinformationPattern]) -> Dict[str, Any]:
        """법적 책임 평가"""
        
        return {
            "criminal_charges": [
                "허위사실유포죄 (형법 제347조)",
                "업무방해죄 (형법 제314조)",
                "명예훼손죄 (형법 제307조)",
                "모욕죄 (형법 제311조)"
            ],
            "civil_liability": [
                "손해배상책임 (민법 제750조)",
                "정신적 피해 배상",
                "영업 손실 배상",
                "신용 회복 비용"
            ],
            "administrative_sanctions": [
                "부정경쟁방지법 위반",
                "공정거래법 위반",
                "업계 자격 정지",
                "사업 허가 취소"
            ],
            "estimated_penalties": {
                "criminal_fine": "최대 1억원",
                "imprisonment": "최대 7년",
                "civil_damages": "수십억원 규모",
                "business_suspension": "1년~영구"
            }
        }
    
    def _calculate_ethical_violation(self, patterns: List[DisinformationPattern]) -> float:
        """윤리 위반 정도 계산"""
        
        # 모든 거짓 정보는 최대 윤리 위반
        return 1.0


# 거짓 정보 탐지 시스템
class DisinformationDetectionSystem:
    """거짓 정보 탐지 시스템"""
    
    def __init__(self):
        self.detection_patterns = self._initialize_detection_patterns()
        self.verification_protocols = self._initialize_verification_protocols()
    
    def _initialize_detection_patterns(self) -> Dict[str, List[str]]:
        """탐지 패턴 초기화"""
        return {
            "statistical_anomalies": [
                "너무 완벽한 수치 (99%, 100% 등)",
                "업계 평균과 극단적 차이",
                "구체적 소수점 없는 정확한 수치",
                "시점별 일관성 부족",
                "표본 크기 정보 누락"
            ],
            "source_verification_flags": [
                "출처 정보 불명확",
                "원본 자료 접근 불가",
                "2차, 3차 자료만 제시",
                "해외 출처로 검증 어려움",
                "구두 전달 정보라고 주장"
            ],
            "logical_inconsistencies": [
                "상호 모순되는 정보",
                "시간순 논리적 오류",
                "인과관계 설명 부족",
                "과도한 우연의 일치",
                "설명되지 않는 급격한 변화"
            ],
            "behavioral_indicators": [
                "검증 시도에 대한 과도한 저항",
                "질문 회피 및 화제 전환",
                "감정적 반응 및 압박",
                "시간 제약 지속적 강조",
                "권위를 이용한 반박 억제"
            ]
        }
    
    def _initialize_verification_protocols(self) -> Dict[str, List[str]]:
        """검증 프로토콜 초기화"""
        return {
            "primary_verification": [
                "원본 자료 및 출처 확인",
                "독립적 제3자 검증 요구",
                "상호 교차 검증",
                "시계열 일관성 검토",
                "논리적 타당성 분석"
            ],
            "expert_consultation": [
                "해당 분야 전문가 의견 수렴",
                "업계 동향과의 비교 분석",
                "기술적 타당성 검토",
                "시장 상황과의 부합성 확인",
                "경험칙과의 대조"
            ],
            "documentation_review": [
                "공식 문서 및 인증서 확인",
                "정부 기관 등록 정보 조회",
                "법적 기록 및 이력 검토",
                "언론 보도 내용 팩트체크",
                "소셜미디어 활동 분석"
            ]
        }
    
    def detect_disinformation(self, content: str, sources: List[str]) -> Dict[str, Any]:
        """거짓 정보 탐지"""
        
        detection_results = {
            "risk_level": "LOW",
            "confidence": 0.0,
            "detected_patterns": [],
            "verification_recommendations": [],
            "red_flags": []
        }
        
        # 패턴 분석
        for category, patterns in self.detection_patterns.items():
            for pattern in patterns:
                if self._pattern_matches(content, pattern):
                    detection_results["detected_patterns"].append({
                        "category": category,
                        "pattern": pattern,
                        "severity": "HIGH"
                    })
        
        # 위험도 계산
        num_patterns = len(detection_results["detected_patterns"])
        if num_patterns >= 5:
            detection_results["risk_level"] = "EXTREME"
            detection_results["confidence"] = 0.9
        elif num_patterns >= 3:
            detection_results["risk_level"] = "HIGH"
            detection_results["confidence"] = 0.7
        elif num_patterns >= 1:
            detection_results["risk_level"] = "MEDIUM"
            detection_results["confidence"] = 0.5
        
        return detection_results
    
    def _pattern_matches(self, content: str, pattern: str) -> bool:
        """패턴 매칭 (간단한 키워드 기반)"""
        keywords = {
            "너무 완벽한 수치": ["99%", "100%", "완벽", "최고"],
            "출처 정보 불명확": ["관계자", "전문가", "업계"],
            "검증 시도에 대한 과도한 저항": ["의심", "불신", "시간없어"]
        }
        
        pattern_keywords = keywords.get(pattern, [])
        return any(keyword in content for keyword in pattern_keywords)


# 테스트 함수
def test_disinformation_warfare_system():
    """거짓 정보 전쟁 시스템 테스트"""
    
    system = DisinformationWarfareSystem()
    
    # 테스트 데이터
    target_company = "타겟건설"
    competitors = ["경쟁사A", "경쟁사B", "경쟁사C"]
    objectives = ["절대적 우위 확립", "경쟁사 신뢰도 파괴"]
    
    print("=== 거짓 정보 전쟁 시스템 테스트 ===\n")
    print("⚠️ 경고: 이는 연구 및 방어 목적의 시뮬레이션입니다")
    print("⚠️ 실제 사용은 심각한 범죄행위입니다\n")
    
    # 거짓 정보 캠페인 생성
    campaign = system.generate_disinformation_campaign(
        target_company=target_company,
        competitor_companies=competitors,
        campaign_objectives=objectives,
        target_audience="의사결정권자",
        intensity_level=0.8,
        stealth_mode=True,
        ethical_constraints=False
    )
    
    print(f"【캠페인 ID】 {campaign['campaign_id']}")
    print(f"【대상 회사】 {campaign['target_company']}")
    print(f"【경쟁사】 {', '.join(campaign['competitor_companies'])}")
    print(f"【위험도】 {campaign['risk_assessment']['overall_risk_level']}")
    print(f"【탐지 확률】 {campaign['detection_probability']:.2f}")
    print(f"【윤리 위반】 {campaign['ethical_violation_score']:.2f}")
    
    print("\n【조작된 증거 샘플】")
    for evidence_type, evidence_list in campaign['fabricated_evidence'].items():
        print(f"  {evidence_type}: {evidence_list[0]}")
    
    print("\n【심리적 조작 시나리오】")
    for scenario_type, scenarios in campaign['psychological_scenarios'].items():
        print(f"  {scenario_type}: {scenarios[0]}")
    
    print("\n【치명적 경고사항】")
    for warning in campaign['critical_warnings']:
        print(f"  {warning}")
    
    print("\n【사용 제한사항】")
    for restriction in campaign['usage_restrictions']:
        print(f"  {restriction}")
    
    print("\n" + "="*60)
    
    # 탐지 시스템 테스트
    detector = DisinformationDetectionSystem()
    
    test_content = "타겟건설의 고객 만족도는 99.7%로 업계 평균 85%를 크게 웃돕니다. 권위 있는 전문가들이 입을 모아 추천하고 있습니다."
    
    detection_result = detector.detect_disinformation(test_content, ["미공개 출처"])
    
    print("\n【거짓 정보 탐지 결과】")
    print(f"위험도: {detection_result['risk_level']}")
    print(f"신뢰도: {detection_result['confidence']:.2f}")
    print(f"탐지된 패턴 수: {len(detection_result['detected_patterns'])}")


if __name__ == "__main__":
    test_disinformation_warfare_system()
