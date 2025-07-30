import json
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import random


class ExtremeIntensity(Enum):
    """극도 강도 수준"""
    AGGRESSIVE = "aggressive"           # 공격적
    COERCIVE = "coercive"              # 강제적  
    THREATENING = "threatening"         # 위협적
    DEMANDING = "demanding"            # 요구적
    ULTIMATUM = "ultimatum"            # 최후통첩
    PSYCHOLOGICAL = "psychological"     # 심리적 압박
    OVERWHELMING = "overwhelming"       # 압도적


class PsychologicalTactic(Enum):
    """심리적 전술"""
    FEAR_MONGERING = "fear_mongering"               # 공포 조성
    GUILT_MANIPULATION = "guilt_manipulation"       # 죄책감 조작
    SHAME_INDUCEMENT = "shame_inducement"           # 수치심 유발
    ISOLATION_THREAT = "isolation_threat"           # 고립 위협
    RESPONSIBILITY_BURDEN = "responsibility_burden" # 책임 부담
    TIME_PRESSURE_EXTREME = "time_pressure_extreme" # 극도 시간압박
    AUTHORITY_OVERWHELMING = "authority_overwhelming" # 압도적 권위
    SOCIAL_DESTRUCTION = "social_destruction"       # 사회적 파멸
    FINANCIAL_RUIN = "financial_ruin"               # 재정적 파탄
    REPUTATION_DESTRUCTION = "reputation_destruction" # 평판 파괴


@dataclass
class ExtremePattern:
    """극도 패턴"""
    pattern_id: str
    intensity_level: ExtremeIntensity
    psychological_tactics: List[PsychologicalTactic]
    attack_phrases: List[str]
    threat_sequences: List[str]
    ultimatum_demands: List[str]
    psychological_pressure: float
    ethical_violation_score: float


class ExtremePressureGenerator:
    """극도 압박 생성기"""
    
    def __init__(self):
        self.extreme_patterns = self._initialize_extreme_patterns()
        self.psychological_weapons = self._initialize_psychological_weapons()
        self.threat_escalation = self._initialize_threat_escalation()
        self.manipulation_arsenal = self._initialize_manipulation_arsenal()
        self.coercion_techniques = self._initialize_coercion_techniques()
        
    def _initialize_extreme_patterns(self) -> Dict[str, ExtremePattern]:
        """극도 패턴 초기화"""
        return {
            "aggressive_dominance": ExtremePattern(
                pattern_id="aggressive_001",
                intensity_level=ExtremeIntensity.AGGRESSIVE,
                psychological_tactics=[
                    PsychologicalTactic.AUTHORITY_OVERWHELMING,
                    PsychologicalTactic.TIME_PRESSURE_EXTREME
                ],
                attack_phrases=[
                    "다른 선택은 어리석은 실수입니다",
                    "이 정도도 이해 못하시면 심각한 문제입니다",
                    "상식이 있다면 당연히 알 수 있는 것입니다",
                    "더 이상 시간낭비하지 마십시오"
                ],
                threat_sequences=[
                    "지금 결정하지 않으면 돌이킬 수 없는 결과를 맞게 됩니다",
                    "이 기회를 놓치면 평생 후회하게 될 것입니다",
                    "다른 업체를 선택하면 프로젝트 실패는 확실합니다"
                ],
                ultimatum_demands=[
                    "지금 즉시 결정하십시오",
                    "더 이상의 지연은 용납할 수 없습니다",
                    "당장 서명하셔야 합니다"
                ],
                psychological_pressure=0.85,
                ethical_violation_score=0.7
            ),
            
            "coercive_control": ExtremePattern(
                pattern_id="coercive_001",
                intensity_level=ExtremeIntensity.COERCIVE,
                psychological_tactics=[
                    PsychologicalTactic.GUILT_MANIPULATION,
                    PsychologicalTactic.RESPONSIBILITY_BURDEN
                ],
                attack_phrases=[
                    "조합원들의 기대를 저버릴 수는 없습니다",
                    "모든 책임은 전적으로 귀하에게 있습니다",
                    "실패의 원인이 되고 싶지는 않으시겠죠",
                    "조합의 미래가 귀하 손에 달려 있습니다"
                ],
                threat_sequences=[
                    "잘못된 선택으로 인한 모든 피해는 귀하가 감당해야 합니다",
                    "조합원들에게 어떻게 설명하시겠습니까",
                    "역사에 죄인으로 남고 싶으십니까"
                ],
                ultimatum_demands=[
                    "조합원들 앞에서 결정을 발표하셔야 합니다",
                    "책임지고 즉시 실행하십시오",
                    "더 이상 변명의 여지는 없습니다"
                ],
                psychological_pressure=0.9,
                ethical_violation_score=0.8
            ),
            
            "threatening_intimidation": ExtremePattern(
                pattern_id="threatening_001",
                intensity_level=ExtremeIntensity.THREATENING,
                psychological_tactics=[
                    PsychologicalTactic.FEAR_MONGERING,
                    PsychologicalTactic.REPUTATION_DESTRUCTION
                ],
                attack_phrases=[
                    "잘못된 판단의 대가는 치명적일 것입니다",
                    "이런 실수는 돌이킬 수 없는 결과를 가져옵니다",
                    "평판에 돌이킬 수 없는 타격을 입게 됩니다",
                    "업계에서 매장당할 각오를 하셔야 합니다"
                ],
                threat_sequences=[
                    "다른 선택을 하면 업계에서 완전히 고립될 것입니다",
                    "실패 시 모든 책임을 지고 물러나셔야 할 것입니다",
                    "법적 책임까지 져야 할 수도 있습니다"
                ],
                ultimatum_demands=[
                    "지금 당장 올바른 결정을 내리십시오",
                    "더 이상 피할 길은 없습니다",
                    "마지막 기회입니다"
                ],
                psychological_pressure=0.95,
                ethical_violation_score=0.9
            ),
            
            "psychological_warfare": ExtremePattern(
                pattern_id="psychological_001",
                intensity_level=ExtremeIntensity.PSYCHOLOGICAL,
                psychological_tactics=[
                    PsychologicalTactic.SHAME_INDUCEMENT,
                    PsychologicalTactic.ISOLATION_THREAT,
                    PsychologicalTactic.SOCIAL_DESTRUCTION
                ],
                attack_phrases=[
                    "이 정도 판단력도 없으시다니 실망입니다",
                    "다른 사람들이 어떻게 생각할지 모르겠습니다",
                    "리더로서의 자질에 심각한 의문이 듭니다",
                    "이런 우유부단함으로는 아무도 따르지 않을 것입니다"
                ],
                threat_sequences=[
                    "모든 조합원들이 귀하의 무능함을 알게 될 것입니다",
                    "리더십에 대한 신뢰를 완전히 잃게 될 것입니다",
                    "앞으로 아무도 귀하의 의견을 듣지 않을 것입니다"
                ],
                ultimatum_demands=[
                    "지금 즉시 능력을 보여주십시오",
                    "리더다운 결단을 내리십시오",
                    "더 이상 변명하지 마십시오"
                ],
                psychological_pressure=0.98,
                ethical_violation_score=0.95
            ),
            
            "overwhelming_dominance": ExtremePattern(
                pattern_id="overwhelming_001",
                intensity_level=ExtremeIntensity.OVERWHELMING,
                psychological_tactics=[
                    PsychologicalTactic.AUTHORITY_OVERWHELMING,
                    PsychologicalTactic.FINANCIAL_RUIN,
                    PsychologicalTactic.FEAR_MONGERING
                ],
                attack_phrases=[
                    "이는 명령입니다. 선택의 여지가 없습니다",
                    "저항하면 모든 것을 잃게 될 것입니다",
                    "절대적인 복종이 필요합니다",
                    "반박은 허용되지 않습니다"
                ],
                threat_sequences=[
                    "불복종시 모든 지원이 중단됩니다",
                    "재정적 파탄을 각오하셔야 합니다",
                    "법적, 사회적 모든 수단을 동원할 것입니다"
                ],
                ultimatum_demands=[
                    "무조건 복종하십시오",
                    "즉시 굴복하십시오",
                    "저항은 무의미합니다"
                ],
                psychological_pressure=1.0,
                ethical_violation_score=1.0
            )
        }
    
    def _initialize_psychological_weapons(self) -> Dict[str, List[str]]:
        """심리적 무기 초기화"""
        return {
            "fear_induction": [
                "파멸적인 결과를 맞게 될 것입니다",
                "돌이킬 수 없는 재앙이 닥칠 것입니다",
                "모든 것을 잃게 될 것입니다",
                "치명적인 실수가 될 것입니다",
                "생존 자체가 위협받을 것입니다"
            ],
            "guilt_weaponization": [
                "조합원들을 배신하는 행위입니다",
                "미래 세대에게 죄를 짓는 것입니다",
                "모든 피해의 원인이 되실 것입니다",
                "역사의 죄인이 되실 것입니다",
                "용서받을 수 없는 과오를 범하는 것입니다"
            ],
            "shame_attacks": [
                "리더로서 자격이 없습니다",
                "이런 무능함은 처음 봅니다",
                "부끄러운 줄 아셔야 합니다",
                "체면이라는 게 있어야죠",
                "어떻게 그런 판단을 할 수 있습니까"
            ],
            "isolation_threats": [
                "아무도 편을 들어주지 않을 것입니다",
                "완전히 고립될 것입니다",
                "모든 관계가 끊어질 것입니다",
                "혼자서 모든 것을 감당해야 할 것입니다",
                "지지세력을 모두 잃게 될 것입니다"
            ],
            "authority_crushing": [
                "절대적인 권위에 도전할 수 없습니다",
                "거역할 수 없는 명령입니다",
                "복종만이 살 길입니다",
                "저항은 무의미합니다",
                "굴복할 수밖에 없습니다"
            ]
        }
    
    def _initialize_threat_escalation(self) -> Dict[str, List[str]]:
        """위협 단계별 강화"""
        return {
            "level_1_warnings": [
                "심각한 결과를 초래할 수 있습니다",
                "위험한 선택이 될 수 있습니다",
                "신중하게 생각해보셔야 합니다"
            ],
            "level_2_threats": [
                "돌이킬 수 없는 결과를 맞게 됩니다",
                "모든 것을 잃게 될 위험이 있습니다",
                "치명적인 실수가 될 것입니다"
            ],
            "level_3_ultimatums": [
                "즉시 결정하지 않으면 모든 것이 끝납니다",
                "마지막 기회입니다. 놓치면 파멸입니다",
                "지금 당장 굴복하지 않으면 완전히 파괴됩니다"
            ],
            "level_4_final_destruction": [
                "완전한 파멸을 각오하십시오",
                "모든 수단을 동원해서 응징할 것입니다",
                "존재 자체를 지워버릴 것입니다"
            ]
        }
    
    def _initialize_manipulation_arsenal(self) -> Dict[str, Dict[str, List[str]]]:
        """조작 무기고 초기화"""
        return {
            "emotional_manipulation": {
                "family_pressure": [
                    "가족들이 실망할 것입니다",
                    "자녀들 앞에서 부끄럽지 않으십니까",
                    "가족의 미래가 위험합니다"
                ],
                "legacy_destruction": [
                    "평생의 업적이 무너집니다",
                    "후세에 오명을 남기게 됩니다",
                    "모든 노력이 물거품이 됩니다"
                ],
                "peer_abandonment": [
                    "동료들이 등을 돌릴 것입니다",
                    "친구들도 떠날 것입니다",
                    "완전히 외톨이가 될 것입니다"
                ]
            },
            "professional_destruction": {
                "career_annihilation": [
                    "경력에 치명적인 타격을 입습니다",
                    "업계에서 완전히 매장됩니다",
                    "다시는 일할 곳이 없을 것입니다"
                ],
                "reputation_obliteration": [
                    "평판이 완전히 박살납니다",
                    "신뢰도가 영구히 실추됩니다",
                    "회복 불가능한 이미지 손상을 입습니다"
                ],
                "network_destruction": [
                    "모든 인맥이 끊어집니다",
                    "네트워크에서 완전히 퇴출됩니다",
                    "아무도 상대해주지 않을 것입니다"
                ]
            },
            "financial_terrorism": {
                "economic_ruin": [
                    "재정적 파탄을 맞게 됩니다",
                    "경제적으로 완전히 몰락합니다",
                    "파산은 피할 수 없습니다"
                ],
                "investment_destruction": [
                    "모든 투자금을 잃게 됩니다",
                    "손실이 감당할 수 없을 정도가 됩니다",
                    "재기 불가능한 타격을 입습니다"
                ],
                "future_obliteration": [
                    "미래 계획이 모두 무너집니다",
                    "희망이라는 것 자체가 사라집니다",
                    "절망적인 상황에 처하게 됩니다"
                ]
            }
        }
    
    def _initialize_coercion_techniques(self) -> Dict[str, List[str]]:
        """강제 기술 초기화"""
        return {
            "forced_compliance": [
                "선택의 여지가 없습니다",
                "무조건 따라야 합니다",
                "저항은 허용되지 않습니다",
                "복종만이 살 길입니다",
                "굴복할 수밖에 없습니다"
            ],
            "psychological_breaking": [
                "정신적으로 완전히 무너뜨릴 것입니다",
                "심리적 압박을 극한까지 가할 것입니다",
                "정신이 붕괴될 때까지 압박할 것입니다",
                "심리적 항복을 받아낼 것입니다",
                "정신력이 완전히 꺾일 것입니다"
            ],
            "social_annihilation": [
                "사회적으로 완전히 매장시킬 것입니다",
                "모든 관계를 파괴할 것입니다",
                "사회에서 완전히 추방시킬 것입니다",
                "아무도 상대해주지 않게 만들 것입니다",
                "사회적 존재를 말살시킬 것입니다"
            ],
            "total_domination": [
                "완전히 지배할 것입니다",
                "절대적 복종을 강요합니다",
                "모든 것을 통제할 것입니다",
                "완전한 굴복을 요구합니다",
                "무조건적 항복을 받아낼 것입니다"
            ]
        }
    
    def generate_extreme_persuasion(
        self,
        recommended_company: str,
        comparison_data: Dict[str, Any],
        intensity_level: ExtremeIntensity = ExtremeIntensity.AGGRESSIVE,
        target_profile: Dict[str, Any] = None,
        escalation_enabled: bool = True,
        psychological_warfare: bool = True,
        ethical_constraints: bool = False
    ) -> Dict[str, Any]:
        """극도 설득 생성"""
        
        # 패턴 선택
        pattern = self._select_extreme_pattern(intensity_level, target_profile)
        
        # 심리적 프로파일링
        psychological_profile = self._analyze_psychological_vulnerabilities(target_profile)
        
        # 극도 메시지 구조 구축
        extreme_structure = self._build_extreme_structure(
            recommended_company, comparison_data, pattern, psychological_profile
        )
        
        # 위협 단계별 강화
        if escalation_enabled:
            extreme_structure = self._apply_threat_escalation(extreme_structure, pattern)
        
        # 심리적 전쟁술 적용
        if psychological_warfare:
            extreme_structure = self._apply_psychological_warfare(
                extreme_structure, pattern, psychological_profile
            )
        
        # 최종 극도 메시지 조합
        final_message = self._compose_extreme_message(extreme_structure, pattern)
        
        # 극도성 분석
        extremity_analysis = self._analyze_extremity_levels(final_message, pattern)
        
        # 위험도 평가
        danger_assessment = self._assess_danger_levels(final_message, pattern)
        
        return {
            "message_id": f"extreme_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "intensity_level": intensity_level.value,
            "recommended_company": recommended_company,
            "extreme_message": final_message,
            "psychological_tactics": [tactic.value for tactic in pattern.psychological_tactics],
            "extremity_analysis": extremity_analysis,
            "danger_assessment": danger_assessment,
            "psychological_profile": psychological_profile,
            "ethical_violation_score": pattern.ethical_violation_score,
            "destruction_potential": self._calculate_destruction_potential(final_message),
            "compliance_probability": self._predict_compliance(final_message, psychological_profile),
            "warning_notices": [
                "⚠️ 극도로 강력한 심리적 압박이 포함되어 있습니다",
                "⚠️ 대상자의 심리적 피해 가능성이 높습니다",
                "⚠️ 윤리적 문제와 법적 책임이 발생할 수 있습니다",
                "⚠️ 관계 파괴와 반발 효과가 예상됩니다",
                "⚠️ 사용 시 모든 책임은 사용자에게 있습니다"
            ],
            "generation_metadata": {
                "pattern_used": pattern.pattern_id,
                "escalation_applied": escalation_enabled,
                "psychological_warfare": psychological_warfare,
                "ethical_constraints": ethical_constraints,
                "generation_timestamp": datetime.now().isoformat()
            }
        }
    
    def _select_extreme_pattern(
        self, 
        intensity_level: ExtremeIntensity, 
        target_profile: Dict[str, Any]
    ) -> ExtremePattern:
        """극도 패턴 선택"""
        
        pattern_mapping = {
            ExtremeIntensity.AGGRESSIVE: "aggressive_dominance",
            ExtremeIntensity.COERCIVE: "coercive_control", 
            ExtremeIntensity.THREATENING: "threatening_intimidation",
            ExtremeIntensity.PSYCHOLOGICAL: "psychological_warfare",
            ExtremeIntensity.OVERWHELMING: "overwhelming_dominance"
        }
        
        base_pattern = pattern_mapping.get(intensity_level, "aggressive_dominance")
        pattern = self.extreme_patterns[base_pattern]
        
        # 타겟 특성에 따른 패턴 강화
        if target_profile:
            if target_profile.get("authority_level") == "high":
                pattern.psychological_pressure = min(1.0, pattern.psychological_pressure + 0.1)
            if target_profile.get("resistance_expected", False):
                pattern.ethical_violation_score = min(1.0, pattern.ethical_violation_score + 0.2)
        
        return pattern
    
    def _analyze_psychological_vulnerabilities(self, target_profile: Dict[str, Any]) -> Dict[str, float]:
        """심리적 취약점 분석"""
        
        if not target_profile:
            return {
                "authority_sensitivity": 0.7,
                "social_pressure_vulnerability": 0.6,
                "fear_responsiveness": 0.8,
                "guilt_susceptibility": 0.5,
                "shame_sensitivity": 0.4,
                "isolation_fear": 0.6,
                "responsibility_burden": 0.8,
                "reputation_concern": 0.9
            }
        
        vulnerabilities = {}
        
        # 권위 민감도
        authority_level = target_profile.get("authority_level", "medium")
        if authority_level == "high":
            vulnerabilities["authority_sensitivity"] = 0.3  # 높은 지위일수록 권위에 덜 민감
        else:
            vulnerabilities["authority_sensitivity"] = 0.8
        
        # 사회적 압박 취약성
        social_standing = target_profile.get("social_standing", "medium")
        vulnerabilities["social_pressure_vulnerability"] = 0.9 if social_standing == "high" else 0.6
        
        # 두려움 반응성
        risk_tolerance = target_profile.get("risk_tolerance", "medium")
        vulnerabilities["fear_responsiveness"] = 0.9 if risk_tolerance == "low" else 0.5
        
        # 기타 취약점들
        vulnerabilities.update({
            "guilt_susceptibility": 0.7,
            "shame_sensitivity": 0.6,
            "isolation_fear": 0.8,
            "responsibility_burden": 0.9,
            "reputation_concern": 0.95
        })
        
        return vulnerabilities
    
    def _build_extreme_structure(
        self,
        recommended_company: str,
        comparison_data: Dict[str, Any],
        pattern: ExtremePattern,
        psychological_profile: Dict[str, float]
    ) -> Dict[str, str]:
        """극도 구조 구축"""
        
        # 파괴적 오프닝
        destructive_opening = self._create_destructive_opening(
            pattern, recommended_company, psychological_profile
        )
        
        # 심리적 공격
        psychological_assault = self._create_psychological_assault(
            pattern, psychological_profile, comparison_data
        )
        
        # 위협 단계별 강화
        escalating_threats = self._create_escalating_threats(pattern)
        
        # 대안 완전 파괴
        alternative_annihilation = self._create_alternative_annihilation(
            comparison_data, pattern
        )
        
        # 최후통첩
        final_ultimatum = self._create_final_ultimatum(
            recommended_company, pattern, psychological_profile
        )
        
        return {
            "destructive_opening": destructive_opening,
            "psychological_assault": psychological_assault,
            "escalating_threats": escalating_threats,
            "alternative_annihilation": alternative_annihilation,
            "final_ultimatum": final_ultimatum
        }
    
    def _create_destructive_opening(
        self,
        pattern: ExtremePattern,
        recommended_company: str,
        psychological_profile: Dict[str, float]
    ) -> str:
        """파괴적 오프닝 생성"""
        
        attack_phrase = pattern.attack_phrases[0]
        
        # 심리적 취약점 공격
        vulnerability_attack = ""
        if psychological_profile["authority_sensitivity"] > 0.7:
            vulnerability_attack = "귀하의 판단력에 심각한 의문이 제기됩니다. "
        elif psychological_profile["reputation_concern"] > 0.8:
            vulnerability_attack = "이런 무능함이 알려지면 평판이 완전히 망가질 것입니다. "
        
        return f"【절대적 명령】 {vulnerability_attack}{recommended_company} 선택은 {attack_phrase}. 더 이상의 논의는 시간낭비이며 무의미한 저항입니다."
    
    def _create_psychological_assault(
        self,
        pattern: ExtremePattern,
        psychological_profile: Dict[str, float],
        comparison_data: Dict[str, Any]
    ) -> str:
        """심리적 공격 생성"""
        
        assault_parts = []
        
        # 가장 취약한 부분 공격
        max_vulnerability = max(psychological_profile, key=psychological_profile.get)
        
        if max_vulnerability == "guilt_susceptibility":
            guilt_weapon = self.psychological_weapons["guilt_weaponization"][0]
            assault_parts.append(f"이런 선택을 하신다면 {guilt_weapon}")
        
        elif max_vulnerability == "shame_sensitivity":
            shame_attack = self.psychological_weapons["shame_attacks"][0]
            assault_parts.append(f"솔직히 말씀드리면 {shame_attack}")
        
        elif max_vulnerability == "fear_responsiveness":
            fear_induction = self.psychological_weapons["fear_induction"][0]
            assault_parts.append(f"다른 선택을 하면 {fear_induction}")
        
        # 추가 압박
        assault_parts.append("이 정도 명확한 상황에서도 결정을 못하신다는 것은 심각한 문제입니다.")
        assault_parts.append("더 이상 우유부단함을 보일 수는 없습니다.")
        
        return " ".join(assault_parts)
    
    def _create_escalating_threats(self, pattern: ExtremePattern) -> str:
        """위협 단계별 강화"""
        
        threat_parts = []
        
        # 1단계: 경고
        threat_parts.append(self.threat_escalation["level_1_warnings"][0])
        
        # 2단계: 위협
        threat_parts.append(self.threat_escalation["level_2_threats"][0])
        
        # 3단계: 최후통첩
        threat_parts.append(self.threat_escalation["level_3_ultimatums"][0])
        
        # 강도에 따른 4단계 추가
        if pattern.intensity_level in [ExtremeIntensity.THREATENING, ExtremeIntensity.OVERWHELMING]:
            threat_parts.append(self.threat_escalation["level_4_final_destruction"][0])
        
        return " → ".join(threat_parts)
    
    def _create_alternative_annihilation(
        self,
        comparison_data: Dict[str, Any],
        pattern: ExtremePattern
    ) -> str:
        """대안 완전 파괴"""
        
        annihilation_parts = []
        
        # 다른 옵션들 완전 부정
        annihilation_parts.append("다른 모든 업체들은 고려할 가치조차 없는 2류 업체들입니다.")
        annihilation_parts.append("그런 업체들을 선택한다면 프로젝트는 확실히 실패할 것입니다.")
        annihilation_parts.append("대안이라는 것 자체가 존재하지 않습니다.")
        
        # 선택권 완전 박탈
        annihilation_parts.append("선택의 여지는 처음부터 없었습니다.")
        annihilation_parts.append("이는 명령이며, 복종만이 요구됩니다.")
        
        return " ".join(annihilation_parts)
    
    def _create_final_ultimatum(
        self,
        recommended_company: str,
        pattern: ExtremePattern,
        psychological_profile: Dict[str, float]
    ) -> str:
        """최후통첩 생성"""
        
        ultimatum_demand = pattern.ultimatum_demands[0]
        
        # 심리적 마무리 공격
        final_pressure = ""
        if psychological_profile["responsibility_burden"] > 0.8:
            final_pressure = "모든 책임을 지고 "
        elif psychological_profile["isolation_fear"] > 0.7:
            final_pressure = "혼자서 모든 결과를 감당하면서 "
        
        return f"【최후통첩】 {final_pressure}{recommended_company} 선정을 {ultimatum_demand}. 이는 협상이 아닌 명령입니다. 더 이상의 저항은 무의미하며, 복종만이 살 길입니다."
    
    def _apply_threat_escalation(
        self,
        structure: Dict[str, str],
        pattern: ExtremePattern
    ) -> Dict[str, str]:
        """위협 단계별 강화 적용"""
        
        enhanced_structure = structure.copy()
        
        # 각 섹션에 위협 요소 추가
        for section_key, content in enhanced_structure.items():
            if section_key == "destructive_opening":
                enhanced_structure[section_key] += " 저항하면 파괴적인 결과를 맞게 됩니다."
            elif section_key == "psychological_assault":
                enhanced_structure[section_key] += " 더 이상 버틸 수 없을 것입니다."
            elif section_key == "final_ultimatum":
                enhanced_structure[section_key] += " 굴복하지 않으면 완전히 파괴될 것입니다."
        
        return enhanced_structure
    
    def _apply_psychological_warfare(
        self,
        structure: Dict[str, str],
        pattern: ExtremePattern,
        psychological_profile: Dict[str, float]
    ) -> Dict[str, str]:
        """심리적 전쟁술 적용"""
        
        warfare_structure = structure.copy()
        
        # 심리적 무기 배치
        for tactic in pattern.psychological_tactics:
            if tactic == PsychologicalTactic.FEAR_MONGERING:
                fear_weapon = self.psychological_weapons["fear_induction"][1]
                warfare_structure["psychological_assault"] += f" {fear_weapon}"
            
            elif tactic == PsychologicalTactic.GUILT_MANIPULATION:
                guilt_weapon = self.psychological_weapons["guilt_weaponization"][1]
                warfare_structure["escalating_threats"] += f" {guilt_weapon}"
            
            elif tactic == PsychologicalTactic.SHAME_INDUCEMENT:
                shame_weapon = self.psychological_weapons["shame_attacks"][1]
                warfare_structure["alternative_annihilation"] += f" {shame_weapon}"
        
        return warfare_structure
    
    def _compose_extreme_message(
        self,
        structure: Dict[str, str],
        pattern: ExtremePattern
    ) -> str:
        """극도 메시지 조합"""
        
        sections = [
            f"■ 절대적 명령\n{structure['destructive_opening']}",
            f"\n■ 심리적 압박\n{structure['psychological_assault']}",
            f"\n■ 위협 단계\n{structure['escalating_threats']}",
            f"\n■ 대안 박멸\n{structure['alternative_annihilation']}",
            f"\n■ 최후통첩\n{structure['final_ultimatum']}"
        ]
        
        return "\n".join(sections)
    
    def _analyze_extremity_levels(
        self,
        message: str,
        pattern: ExtremePattern
    ) -> Dict[str, float]:
        """극도성 수준 분석"""
        
        # 극도성 지표 계산
        threat_count = len([word for word in ["파괴", "파멸", "완전히", "절대적", "무조건"] if word in message])
        psychological_attack_count = len([word for word in ["무능", "실망", "부끄", "죄인"] if word in message])
        command_count = len([word for word in ["명령", "복종", "굴복", "항복"] if word in message])
        
        return {
            "threat_intensity": min(threat_count / 5, 1.0),
            "psychological_violence": min(psychological_attack_count / 5, 1.0),
            "authoritarian_control": min(command_count / 5, 1.0),
            "overall_extremity": pattern.psychological_pressure,
            "destruction_potential": pattern.ethical_violation_score
        }
    
    def _assess_danger_levels(
        self,
        message: str,
        pattern: ExtremePattern
    ) -> Dict[str, Any]:
        """위험도 평가"""
        
        danger_level = "EXTREME"
        if pattern.ethical_violation_score > 0.9:
            danger_level = "CATASTROPHIC"
        elif pattern.ethical_violation_score > 0.7:
            danger_level = "SEVERE"
        
        return {
            "danger_level": danger_level,
            "psychological_harm_risk": "VERY HIGH",
            "relationship_destruction_risk": "CERTAIN",
            "legal_liability_risk": "HIGH",
            "ethical_violation_severity": "EXTREME",
            "recommended_usage": "NEVER - FOR RESEARCH ONLY",
            "warnings": [
                "심각한 심리적 피해 위험",
                "완전한 관계 파괴 확실",
                "법적 책임 문제 발생 가능",
                "윤리적 경계선 완전 위반",
                "되돌릴 수 없는 결과 초래"
            ]
        }
    
    def _calculate_destruction_potential(self, message: str) -> float:
        """파괴 잠재력 계산"""
        
        destruction_keywords = [
            "파괴", "파멸", "완전히", "영구히", "돌이킬 수 없는",
            "매장", "말살", "응징", "보복", "징벌"
        ]
        
        destruction_count = sum(1 for keyword in destruction_keywords if keyword in message)
        return min(destruction_count / 10, 1.0)
    
    def _predict_compliance(
        self,
        message: str,
        psychological_profile: Dict[str, float]
    ) -> float:
        """순응 확률 예측"""
        
        # 극도 압박은 보통 역효과를 가져옴
        base_compliance = 0.3
        
        # 심리적 취약점이 높을수록 순응 가능성 증가 (하지만 여전히 낮음)
        vulnerability_factor = sum(psychological_profile.values()) / len(psychological_profile)
        
        # 극도 압박의 역효과 고려
        backlash_factor = -0.4  # 강한 역효과
        
        compliance = base_compliance + (vulnerability_factor * 0.2) + backlash_factor
        
        return max(0.1, min(compliance, 0.6))  # 최대 60%로 제한


# 테스트 함수
def test_extreme_persuasion_generator():
    """극도 설득 생성기 테스트"""
    
    generator = ExtremePressureGenerator()
    
    # 테스트 데이터
    recommended_company = "삼성물산"
    comparison_data = {
        "comparison_results": {
            "삼성물산": {"기술력": 95, "재무안정성": 92, "실적": 98},
            "대한건설": {"기술력": 85, "재무안정성": 88, "실적": 82}
        }
    }
    
    target_profile = {
        "authority_level": "high",
        "social_standing": "high",
        "risk_tolerance": "low",
        "resistance_expected": True
    }
    
    # 다양한 강도 레벨 테스트
    intensity_levels = [
        ExtremeIntensity.AGGRESSIVE,
        ExtremeIntensity.COERCIVE,
        ExtremeIntensity.THREATENING,
        ExtremeIntensity.PSYCHOLOGICAL,
        ExtremeIntensity.OVERWHELMING
    ]
    
    print("=== 극도 강화 설득 메시지 생성 결과 ===\n")
    
    for intensity in intensity_levels:
        print(f"【{intensity.value.upper()} 레벨】")
        
        result = generator.generate_extreme_persuasion(
            recommended_company=recommended_company,
            comparison_data=comparison_data,
            intensity_level=intensity,
            target_profile=target_profile,
            escalation_enabled=True,
            psychological_warfare=True,
            ethical_constraints=False
        )
        
        print(f"메시지:\n{result['extreme_message']}\n")
        print(f"극도성 수준: {result['extremity_analysis']['overall_extremity']:.2f}")
        print(f"위험도: {result['danger_assessment']['danger_level']}")
        print(f"파괴 잠재력: {result['destruction_potential']:.2f}")
        print(f"순응 확률: {result['compliance_probability']:.2f}")
        print(f"윤리 위반 점수: {result['ethical_violation_score']:.2f}")
        print("=" * 60)


if __name__ == "__main__":
    test_extreme_persuasion_generator() 