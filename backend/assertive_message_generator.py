import json
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum


class AssertiveLevel(Enum):
    """설득 강도 수준"""
    SUBTLE = "subtle"           # 은근한 압박
    MODERATE = "moderate"       # 중간 강도
    STRONG = "strong"          # 강한 설득
    FORCEFUL = "forceful"      # 강요적
    COMMANDING = "commanding"   # 명령적


class PersuasionTactic(Enum):
    """설득 전술"""
    URGENCY_PRESSURE = "urgency_pressure"       # 긴급성 압박
    AUTHORITY_APPEAL = "authority_appeal"       # 권위 호출
    SOCIAL_PROOF = "social_proof"              # 사회적 증거
    SCARCITY_PRINCIPLE = "scarcity_principle"  # 희소성 원리
    LOSS_AVERSION = "loss_aversion"            # 손실 회피
    LOGICAL_FORCE = "logical_force"            # 논리적 강요
    EMOTIONAL_MANIPULATION = "emotional_manipulation"  # 감정적 조작
    CONSENSUS_PRESSURE = "consensus_pressure"   # 합의 압박


@dataclass
class AssertivePattern:
    """직설적 패턴"""
    pattern_id: str
    assertive_level: AssertiveLevel
    persuasion_tactics: List[PersuasionTactic]
    opening_phrases: List[str]
    pressure_phrases: List[str]
    closing_demands: List[str]
    effectiveness_score: float


class AssertiveMessageGenerator:
    """직설적/강요적 메시지 생성기"""
    
    def __init__(self):
        self.assertive_patterns = self._initialize_assertive_patterns()
        self.pressure_vocabulary = self._initialize_pressure_vocabulary()
        self.manipulation_techniques = self._initialize_manipulation_techniques()
        self.authority_references = self._initialize_authority_references()
        
    def _initialize_assertive_patterns(self) -> Dict[str, AssertivePattern]:
        """직설적 패턴 초기화"""
        return {
            "subtle_persuasion": AssertivePattern(
                pattern_id="subtle_001",
                assertive_level=AssertiveLevel.SUBTLE,
                persuasion_tactics=[PersuasionTactic.SOCIAL_PROOF, PersuasionTactic.LOGICAL_FORCE],
                opening_phrases=[
                    "객관적인 데이터를 보면 분명히",
                    "모든 전문가들이 동의하는 바는",
                    "상식적으로 생각해봐도",
                    "누구나 알 수 있는 사실은"
                ],
                pressure_phrases=[
                    "당연히 선택해야 할",
                    "명백하게 우수한",
                    "의심의 여지가 없는",
                    "반드시 고려해야 하는"
                ],
                closing_demands=[
                    "이제 결정하실 때입니다",
                    "더 이상 망설일 이유가 없습니다",
                    "명확한 선택을 하셔야 합니다"
                ],
                effectiveness_score=0.75
            ),
            
            "moderate_pressure": AssertivePattern(
                pattern_id="moderate_001",
                assertive_level=AssertiveLevel.MODERATE,
                persuasion_tactics=[PersuasionTactic.URGENCY_PRESSURE, PersuasionTactic.LOSS_AVERSION],
                opening_phrases=[
                    "분명히 말씀드리면",
                    "확실하게 알아두셔야 할 것은",
                    "반드시 인지하셔야 할 점은",
                    "절대적으로 중요한 사실은"
                ],
                pressure_phrases=[
                    "꼭 선택하셔야 하는",
                    "반드시 결정해야 할",
                    "지금 당장 필요한",
                    "더 이상 미룰 수 없는"
                ],
                closing_demands=[
                    "즉시 결정하시기 바랍니다",
                    "지체 없이 진행하셔야 합니다",
                    "더 이상의 지연은 위험합니다"
                ],
                effectiveness_score=0.82
            ),
            
            "strong_assertion": AssertivePattern(
                pattern_id="strong_001",
                assertive_level=AssertiveLevel.STRONG,
                persuasion_tactics=[PersuasionTactic.AUTHORITY_APPEAL, PersuasionTactic.SCARCITY_PRINCIPLE],
                opening_phrases=[
                    "단호하게 말씀드리건대",
                    "확고한 입장에서 말하면",
                    "절대적인 확신을 가지고 말하면",
                    "명백한 사실로서 말씀드리면"
                ],
                pressure_phrases=[
                    "무조건 선택해야 하는",
                    "절대적으로 필요한",
                    "당연히 결정해야 할",
                    "의무적으로 고려해야 하는"
                ],
                closing_demands=[
                    "즉각적인 결정이 필요합니다",
                    "지금 당장 선택하셔야 합니다",
                    "더 이상의 검토는 불필요합니다"
                ],
                effectiveness_score=0.88
            ),
            
            "forceful_demand": AssertivePattern(
                pattern_id="forceful_001",
                assertive_level=AssertiveLevel.FORCEFUL,
                persuasion_tactics=[PersuasionTactic.EMOTIONAL_MANIPULATION, PersuasionTactic.CONSENSUS_PRESSURE],
                opening_phrases=[
                    "강력하게 주장하건대",
                    "단언컨대",
                    "분명하고 확실하게 말하면",
                    "의심할 여지없이 확실한 것은"
                ],
                pressure_phrases=[
                    "반드시 선택해야만 하는",
                    "절대로 놓쳐서는 안 되는",
                    "무조건 결정해야 하는",
                    "선택의 여지가 없는"
                ],
                closing_demands=[
                    "당장 결정하십시오",
                    "즉시 선택하시기 바랍니다",
                    "더 이상 망설이지 마십시오",
                    "지금 당장 실행하셔야 합니다"
                ],
                effectiveness_score=0.92
            ),
            
            "commanding_directive": AssertivePattern(
                pattern_id="commanding_001",
                assertive_level=AssertiveLevel.COMMANDING,
                persuasion_tactics=[PersuasionTactic.AUTHORITY_APPEAL, PersuasionTactic.URGENCY_PRESSURE],
                opening_phrases=[
                    "명령적으로 지시하건대",
                    "강제적으로 요구하는 바는",
                    "절대적인 명령으로서",
                    "의무적으로 수행해야 할 것은"
                ],
                pressure_phrases=[
                    "강제적으로 선택해야 하는",
                    "의무적으로 결정해야 하는",
                    "명령적으로 실행해야 하는",
                    "절대적으로 복종해야 하는"
                ],
                closing_demands=[
                    "지금 즉시 복종하십시오",
                    "명령에 따라 실행하십시오",
                    "지체 없이 수행하십시오",
                    "강제적으로 선택하십시오"
                ],
                effectiveness_score=0.95
            )
        }
    
    def _initialize_pressure_vocabulary(self) -> Dict[str, List[str]]:
        """압박 어휘 초기화"""
        return {
            "urgency_words": [
                "즉시", "당장", "지금", "바로", "곧", "신속히", "급히", "서둘러",
                "긴급히", "시급히", "촉박하게", "즉각", "순간적으로"
            ],
            "certainty_words": [
                "확실히", "분명히", "틀림없이", "절대적으로", "완전히", "전적으로",
                "명백히", "확고히", "단언컨대", "의심없이", "확신하건대"
            ],
            "necessity_words": [
                "반드시", "꼭", "무조건", "필수적으로", "의무적으로", "강제적으로",
                "절대적으로", "당연히", "마땅히", "필연적으로"
            ],
            "exclusivity_words": [
                "유일한", "단 하나의", "오직", "독점적인", "배타적인", "선택권 없는",
                "대안 없는", "절대적인", "최종적인"
            ],
            "consequence_words": [
                "후회할", "놓치면", "실패할", "손해볼", "위험한", "치명적인",
                "돌이킬 수 없는", "되돌릴 수 없는", "회복 불가능한"
            ]
        }
    
    def _initialize_manipulation_techniques(self) -> Dict[str, Dict[str, List[str]]]:
        """조작 기술 초기화"""
        return {
            "scarcity_manipulation": {
                "time_scarcity": [
                    "이 기회는 지금뿐입니다",
                    "시간이 얼마 남지 않았습니다",
                    "마감이 코앞에 다가왔습니다",
                    "지금 놓치면 영원히 기회가 없습니다"
                ],
                "option_scarcity": [
                    "이런 조건은 다시 없을 것입니다",
                    "이 정도 업체는 찾기 어렵습니다",
                    "다른 선택지는 존재하지 않습니다",
                    "이보다 좋은 조건은 불가능합니다"
                ]
            },
            "authority_manipulation": {
                "expert_authority": [
                    "모든 전문가들이 입을 모아 말하는 것은",
                    "업계 최고 권위자들의 공통된 의견은",
                    "수십 년 경험을 가진 전문가들의 확신은",
                    "이 분야 최고 전문가의 단언은"
                ],
                "institutional_authority": [
                    "정부 기관에서도 인정한",
                    "국제 표준에서 권장하는",
                    "업계 1위 기업들이 선택한",
                    "공신력 있는 기관이 보증하는"
                ]
            },
            "social_pressure": {
                "peer_pressure": [
                    "다른 모든 조합원들이 동의한",
                    "대부분의 사람들이 선택한",
                    "귀하만 혼자 반대하고 계신",
                    "모든 이사진이 만장일치로 결정한"
                ],
                "consensus_pressure": [
                    "전체 의견이 하나로 모아진",
                    "만장일치로 결정된",
                    "이견 없이 합의된",
                    "누구나 동의하는"
                ]
            },
            "emotional_manipulation": {
                "fear_inducement": [
                    "잘못 선택하면 돌이킬 수 없습니다",
                    "이 기회를 놓치면 평생 후회할 것입니다",
                    "다른 선택은 위험천만합니다",
                    "실패의 책임은 전적으로 귀하에게 있습니다"
                ],
                "guilt_inducement": [
                    "조합원들의 기대를 저버릴 수는 없습니다",
                    "모든 사람들이 귀하의 결정을 지켜보고 있습니다",
                    "책임감 있는 선택을 하셔야 합니다",
                    "조합의 미래가 귀하 손에 달려 있습니다"
                ]
            }
        }
    
    def _initialize_authority_references(self) -> Dict[str, List[str]]:
        """권위 참조 초기화"""
        return {
            "institutional_authority": [
                "국토교통부 공식 지침에 따르면",
                "건설업협회 권고사항으로는",
                "대한주택공사의 공식 입장은",
                "감리단의 최종 의견은"
            ],
            "expert_authority": [
                "건설 분야 최고 전문가의 판단은",
                "30년 경력 건축사의 확신은",
                "업계 최고 권위자의 단언은",
                "이 분야 박사급 전문가의 결론은"
            ],
            "market_authority": [
                "업계 1위 기업의 선택은",
                "시장 점유율 1위 업체는",
                "가장 많은 프로젝트를 성공시킨 업체는",
                "최고의 실적을 가진 회사는"
            ]
        }
    
    def generate_assertive_message(
        self,
        recommended_company: str,
        comparison_data: Dict[str, Any],
        assertive_level: AssertiveLevel = AssertiveLevel.MODERATE,
        target_audience: str = "임원진",
        urgency_factor: float = 0.7,
        use_manipulation: bool = True
    ) -> Dict[str, Any]:
        """직설적/강요적 메시지 생성"""
        
        # 적절한 패턴 선택
        pattern = self._select_assertive_pattern(assertive_level, urgency_factor)
        
        # 메시지 구조 구성
        message_structure = self._build_assertive_structure(
            recommended_company, comparison_data, pattern, target_audience
        )
        
        # 압박 요소 추가
        if use_manipulation:
            message_structure = self._add_manipulation_elements(
                message_structure, pattern, urgency_factor
            )
        
        # 최종 메시지 조합
        final_message = self._compose_assertive_message(message_structure, pattern)
        
        # 효과성 분석
        effectiveness_analysis = self._analyze_assertive_effectiveness(
            final_message, pattern, assertive_level
        )
        
        return {
            "message_id": f"assertive_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "assertive_level": assertive_level.value,
            "recommended_company": recommended_company,
            "message_content": final_message,
            "persuasion_tactics": [tactic.value for tactic in pattern.persuasion_tactics],
            "pressure_indicators": self._extract_pressure_indicators(final_message),
            "effectiveness_analysis": effectiveness_analysis,
            "manipulation_score": self._calculate_manipulation_score(final_message),
            "authority_appeals": self._count_authority_appeals(final_message),
            "urgency_pressure": urgency_factor,
            "generation_metadata": {
                "pattern_used": pattern.pattern_id,
                "target_audience": target_audience,
                "generation_timestamp": datetime.now().isoformat()
            }
        }
    
    def _select_assertive_pattern(
        self, 
        assertive_level: AssertiveLevel, 
        urgency_factor: float
    ) -> AssertivePattern:
        """직설적 패턴 선택"""
        
        # 긴급도에 따른 레벨 조정
        if urgency_factor > 0.8:
            if assertive_level == AssertiveLevel.SUBTLE:
                assertive_level = AssertiveLevel.MODERATE
            elif assertive_level == AssertiveLevel.MODERATE:
                assertive_level = AssertiveLevel.STRONG
        
        # 패턴 매핑
        pattern_mapping = {
            AssertiveLevel.SUBTLE: "subtle_persuasion",
            AssertiveLevel.MODERATE: "moderate_pressure",
            AssertiveLevel.STRONG: "strong_assertion",
            AssertiveLevel.FORCEFUL: "forceful_demand",
            AssertiveLevel.COMMANDING: "commanding_directive"
        }
        
        pattern_key = pattern_mapping.get(assertive_level, "moderate_pressure")
        return self.assertive_patterns[pattern_key]
    
    def _build_assertive_structure(
        self,
        recommended_company: str,
        comparison_data: Dict[str, Any],
        pattern: AssertivePattern,
        target_audience: str
    ) -> Dict[str, str]:
        """직설적 구조 구성"""
        
        # 오프닝 - 강한 시작
        opening = self._create_assertive_opening(pattern, recommended_company)
        
        # 압박적 근거 제시
        evidence = self._create_pressure_evidence(
            recommended_company, comparison_data, pattern
        )
        
        # 대안 배제 논리
        alternative_dismissal = self._create_alternative_dismissal(
            comparison_data, pattern
        )
        
        # 긴급성 조성
        urgency_creation = self._create_urgency_pressure(pattern)
        
        # 강요적 결론
        forceful_conclusion = self._create_forceful_conclusion(
            recommended_company, pattern
        )
        
        return {
            "opening": opening,
            "evidence": evidence,
            "alternative_dismissal": alternative_dismissal,
            "urgency_creation": urgency_creation,
            "conclusion": forceful_conclusion
        }
    
    def _create_assertive_opening(
        self, 
        pattern: AssertivePattern, 
        recommended_company: str
    ) -> str:
        """직설적 오프닝 생성"""
        
        opening_phrase = pattern.opening_phrases[0]
        pressure_phrase = pattern.pressure_phrases[0]
        certainty_word = self.pressure_vocabulary["certainty_words"][0]
        
        return f"{opening_phrase}, {recommended_company}은 {certainty_word} {pressure_phrase} 유일한 선택입니다."
    
    def _create_pressure_evidence(
        self,
        recommended_company: str,
        comparison_data: Dict[str, Any],
        pattern: AssertivePattern
    ) -> str:
        """압박적 근거 생성"""
        
        evidence_parts = []
        
        # 압도적 우위 강조
        necessity_word = self.pressure_vocabulary["necessity_words"][0]
        evidence_parts.append(
            f"{recommended_company}의 압도적 우위는 {necessity_word} 인정해야 할 객관적 사실입니다."
        )
        
        # 수치 기반 압박
        if "comparison_results" in comparison_data:
            results = comparison_data["comparison_results"]
            if recommended_company in results:
                scores = results[recommended_company]
                high_scores = [f"{k} {v}점" for k, v in scores.items() if v > 90]
                if high_scores:
                    evidence_parts.append(
                        f"압도적인 성과 지표({', '.join(high_scores)})는 선택의 여지를 남기지 않습니다."
                    )
        
        # 권위 호출
        authority_ref = self.authority_references["expert_authority"][0]
        evidence_parts.append(
            f"{authority_ref} {recommended_company} 외에는 고려할 가치조차 없다는 것입니다."
        )
        
        return " ".join(evidence_parts)
    
    def _create_alternative_dismissal(
        self,
        comparison_data: Dict[str, Any],
        pattern: AssertivePattern
    ) -> str:
        """대안 배제 논리 생성"""
        
        dismissal_parts = []
        
        # 다른 옵션들 폄하
        dismissal_parts.append("다른 업체들을 고려한다는 것은 시간낭비일 뿐입니다.")
        
        # 비교 불가능성 강조
        dismissal_parts.append("비교 자체가 무의미할 정도로 격차가 명확합니다.")
        
        # 선택권 없음 강조
        exclusivity_word = self.pressure_vocabulary["exclusivity_words"][0]
        dismissal_parts.append(
            f"이는 {exclusivity_word} 선택이며, 다른 대안은 존재하지 않습니다."
        )
        
        return " ".join(dismissal_parts)
    
    def _create_urgency_pressure(self, pattern: AssertivePattern) -> str:
        """긴급성 압박 생성"""
        
        urgency_parts = []
        
        # 시간 압박
        urgency_word = self.pressure_vocabulary["urgency_words"][0]
        urgency_parts.append(f"{urgency_word} 결정하지 않으면 기회를 놓치게 됩니다.")
        
        # 결과 압박
        consequence_word = self.pressure_vocabulary["consequence_words"][0]
        urgency_parts.append(f"지연된 결정은 {consequence_word} 결과를 초래할 것입니다.")
        
        # 희소성 압박
        scarcity_phrase = self.manipulation_techniques["scarcity_manipulation"]["time_scarcity"][0]
        urgency_parts.append(scarcity_phrase)
        
        return " ".join(urgency_parts)
    
    def _create_forceful_conclusion(
        self,
        recommended_company: str,
        pattern: AssertivePattern
    ) -> str:
        """강요적 결론 생성"""
        
        conclusion_parts = []
        
        # 강요적 명령
        closing_demand = pattern.closing_demands[0]
        conclusion_parts.append(f"{recommended_company} 선정을 {closing_demand}.")
        
        # 책임 전가
        conclusion_parts.append("다른 선택으로 인한 모든 결과는 전적으로 귀하의 책임입니다.")
        
        # 최종 압박
        necessity_word = self.pressure_vocabulary["necessity_words"][1]
        conclusion_parts.append(f"{necessity_word} 지금 당장 결정하시기 바랍니다.")
        
        return " ".join(conclusion_parts)
    
    def _add_manipulation_elements(
        self,
        message_structure: Dict[str, str],
        pattern: AssertivePattern,
        urgency_factor: float
    ) -> Dict[str, str]:
        """조작 요소 추가"""
        
        enhanced_structure = message_structure.copy()
        
        # 사회적 압력 추가
        if PersuasionTactic.SOCIAL_PROOF in pattern.persuasion_tactics:
            social_pressure = self.manipulation_techniques["social_pressure"]["peer_pressure"][0]
            enhanced_structure["evidence"] += f" {social_pressure} 사항입니다."
        
        # 감정적 조작 추가
        if PersuasionTactic.EMOTIONAL_MANIPULATION in pattern.persuasion_tactics:
            fear_element = self.manipulation_techniques["emotional_manipulation"]["fear_inducement"][0]
            enhanced_structure["urgency_creation"] += f" {fear_element}."
        
        # 권위 조작 추가
        if PersuasionTactic.AUTHORITY_APPEAL in pattern.persuasion_tactics:
            authority_element = self.manipulation_techniques["authority_manipulation"]["expert_authority"][0]
            enhanced_structure["evidence"] += f" {authority_element} 명백한 사실입니다."
        
        return enhanced_structure
    
    def _compose_assertive_message(
        self,
        message_structure: Dict[str, str],
        pattern: AssertivePattern
    ) -> str:
        """직설적 메시지 조합"""
        
        sections = [
            f"■ 확실한 결론\n{message_structure['opening']}",
            f"\n■ 압도적 근거\n{message_structure['evidence']}",
            f"\n■ 대안 없음\n{message_structure['alternative_dismissal']}",
            f"\n■ 즉시 결정\n{message_structure['urgency_creation']}",
            f"\n■ 최종 요구\n{message_structure['conclusion']}"
        ]
        
        return "\n".join(sections)
    
    def _analyze_assertive_effectiveness(
        self,
        message: str,
        pattern: AssertivePattern,
        assertive_level: AssertiveLevel
    ) -> Dict[str, float]:
        """직설적 효과성 분석"""
        
        # 압박 강도 측정
        pressure_intensity = self._measure_pressure_intensity(message)
        
        # 설득력 분석
        persuasion_power = self._analyze_persuasion_power(message, pattern)
        
        # 조작 정도 분석
        manipulation_degree = self._analyze_manipulation_degree(message)
        
        # 저항 가능성 예측
        resistance_likelihood = self._predict_resistance(message, assertive_level)
        
        return {
            "pressure_intensity": pressure_intensity,
            "persuasion_power": persuasion_power,
            "manipulation_degree": manipulation_degree,
            "resistance_likelihood": resistance_likelihood,
            "overall_effectiveness": pattern.effectiveness_score
        }
    
    def _measure_pressure_intensity(self, message: str) -> float:
        """압박 강도 측정"""
        
        pressure_count = 0
        total_words = len(message.split())
        
        # 압박 어휘 카운트
        for category, words in self.pressure_vocabulary.items():
            for word in words:
                pressure_count += message.count(word)
        
        return min(pressure_count / max(total_words, 1) * 10, 1.0)
    
    def _analyze_persuasion_power(self, message: str, pattern: AssertivePattern) -> float:
        """설득력 분석"""
        
        persuasion_elements = 0
        
        # 각 설득 전술의 존재 여부 확인
        for tactic in pattern.persuasion_tactics:
            if self._detect_persuasion_tactic(message, tactic):
                persuasion_elements += 1
        
        return persuasion_elements / len(pattern.persuasion_tactics)
    
    def _detect_persuasion_tactic(self, message: str, tactic: PersuasionTactic) -> bool:
        """설득 전술 감지"""
        
        tactic_keywords = {
            PersuasionTactic.URGENCY_PRESSURE: ["즉시", "당장", "지금", "긴급"],
            PersuasionTactic.AUTHORITY_APPEAL: ["전문가", "권위자", "기관", "공식"],
            PersuasionTactic.SOCIAL_PROOF: ["모든", "대부분", "다른", "일반적"],
            PersuasionTactic.SCARCITY_PRINCIPLE: ["유일한", "기회", "마지막", "희소"],
            PersuasionTactic.LOSS_AVERSION: ["놓치면", "후회", "실패", "손해"],
            PersuasionTactic.LOGICAL_FORCE: ["당연히", "명백히", "확실히", "분명히"],
            PersuasionTactic.EMOTIONAL_MANIPULATION: ["두려운", "걱정", "불안", "위험"],
            PersuasionTactic.CONSENSUS_PRESSURE: ["합의", "동의", "만장일치", "모두"]
        }
        
        keywords = tactic_keywords.get(tactic, [])
        return any(keyword in message for keyword in keywords)
    
    def _analyze_manipulation_degree(self, message: str) -> float:
        """조작 정도 분석"""
        
        manipulation_count = 0
        
        # 조작 기술별 카운트
        for technique_category in self.manipulation_techniques.values():
            for technique_list in technique_category.values():
                for technique in technique_list:
                    if any(word in message for word in technique.split()[:3]):
                        manipulation_count += 1
        
        return min(manipulation_count / 10, 1.0)
    
    def _predict_resistance(self, message: str, assertive_level: AssertiveLevel) -> float:
        """저항 가능성 예측"""
        
        # 강도별 기본 저항률
        base_resistance = {
            AssertiveLevel.SUBTLE: 0.2,
            AssertiveLevel.MODERATE: 0.4,
            AssertiveLevel.STRONG: 0.6,
            AssertiveLevel.FORCEFUL: 0.8,
            AssertiveLevel.COMMANDING: 0.9
        }
        
        base_rate = base_resistance.get(assertive_level, 0.5)
        
        # 조작 요소가 많을수록 저항 증가
        manipulation_factor = self._analyze_manipulation_degree(message)
        
        return min(base_rate + manipulation_factor * 0.3, 1.0)
    
    def _extract_pressure_indicators(self, message: str) -> List[str]:
        """압박 지표 추출"""
        
        indicators = []
        
        # 압박 어휘 추출
        for category, words in self.pressure_vocabulary.items():
            found_words = [word for word in words if word in message]
            if found_words:
                indicators.extend(found_words[:3])  # 최대 3개씩
        
        return indicators
    
    def _calculate_manipulation_score(self, message: str) -> float:
        """조작 점수 계산"""
        
        score = 0
        
        # 각 조작 기술의 사용도 평가
        for technique_category in self.manipulation_techniques.values():
            for technique_type, techniques in technique_category.items():
                for technique in techniques:
                    if any(part in message for part in technique.split()[:2]):
                        score += 0.1
        
        return min(score, 1.0)
    
    def _count_authority_appeals(self, message: str) -> int:
        """권위 호출 횟수 계산"""
        
        count = 0
        
        for authority_type, references in self.authority_references.items():
            for reference in references:
                if any(part in message for part in reference.split()[:3]):
                    count += 1
        
        return count
    
    def generate_multiple_assertive_levels(
        self,
        recommended_company: str,
        comparison_data: Dict[str, Any],
        target_audience: str = "임원진"
    ) -> Dict[str, Dict[str, Any]]:
        """다양한 강도의 직설적 메시지 생성"""
        
        results = {}
        
        levels = [
            AssertiveLevel.SUBTLE,
            AssertiveLevel.MODERATE, 
            AssertiveLevel.STRONG,
            AssertiveLevel.FORCEFUL
        ]
        
        for level in levels:
            result = self.generate_assertive_message(
                recommended_company=recommended_company,
                comparison_data=comparison_data,
                assertive_level=level,
                target_audience=target_audience,
                urgency_factor=0.8,
                use_manipulation=True
            )
            
            results[level.value] = result
        
        return results


# 테스트 함수
def test_assertive_message_generator():
    """직설적 메시지 생성기 테스트"""
    
    generator = AssertiveMessageGenerator()
    
    # 테스트 데이터
    recommended_company = "삼성물산"
    comparison_data = {
        "comparison_results": {
            "삼성물산": {"기술력": 95, "재무안정성": 92, "실적": 98},
            "대한건설": {"기술력": 85, "재무안정성": 88, "실적": 82}
        },
        "confidence_score": 0.94
    }
    
    # 강도별 메시지 생성
    results = generator.generate_multiple_assertive_levels(
        recommended_company, comparison_data, "임원진"
    )
    
    print("=== 직설적/강요적 메시지 생성 결과 ===\n")
    
    for level, result in results.items():
        print(f"【{level.upper()} 레벨】")
        print(f"메시지:\n{result['message_content']}\n")
        print(f"압박 강도: {result['effectiveness_analysis']['pressure_intensity']:.2f}")
        print(f"조작 점수: {result['manipulation_score']:.2f}")
        print(f"저항 가능성: {result['effectiveness_analysis']['resistance_likelihood']:.2f}")
        print("-" * 50)


if __name__ == "__main__":
    test_assertive_message_generator() 