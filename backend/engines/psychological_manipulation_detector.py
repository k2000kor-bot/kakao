"""
CORBU.AI Psychological Manipulation Detector - 심리적 조작 기법 감지 엔진
"""
import re
import json
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class ManipulationType(Enum):
    """심리적 조작 유형"""
    GASLIGHTING = "gaslighting"  # 가스라이팅
    BRAINWASHING = "brainwashing"  # 세뇌
    EMOTIONAL_BLACKMAIL = "emotional_blackmail"  # 감정적 협박
    GUILT_TRIPPING = "guilt_tripping"  # 죄책감 유발
    LOVE_BOMBING = "love_bombing"  # 러브밤빙
    SILENT_TREATMENT = "silent_treatment"  # 무시하기
    TRIANGULATION = "triangulation"  # 삼각관계 조작
    PROJECTION = "projection"  # 투영
    VICTIM_BLAMING = "victim_blaming"  # 피해자 비난
    ISOLATION = "isolation"  # 고립화
    FEAR_MONGERING = "fear_mongering"  # 공포 조성
    FALSE_DICHOTOMY = "false_dichotomy"  # 거짓 이분법
    AD_HOMINEM = "ad_hominem"  # 인신공격
    STRAWMAN = "strawman"  # 허수아비 논증
    APPEAL_TO_AUTHORITY = "appeal_to_authority"  # 권위에의 호소
    BANDWAGON = "bandwagon"  # 동조 압력
    SCARCITY = "scarcity"  # 희소성 착각
    FOOT_IN_DOOR = "foot_in_door"  # 발끝 문턱 기법
    DOOR_IN_FACE = "door_in_face"  # 문에 얼굴 대기 기법

class PlatformType(Enum):
    """플랫폼 유형"""
    COMMENT = "comment"  # 댓글
    KAKAOTALK = "kakaotalk"  # 카카오톡
    COMMUNITY = "community"  # 커뮤니티
    FORUM = "forum"  # 포럼
    BLOG = "blog"  # 블로그
    SNS = "sns"  # 소셜네트워크
    NEWS = "news"  # 뉴스
    ACADEMIC = "academic"  # 학술

@dataclass
class ManipulationAnalysis:
    """심리적 조작 분석 결과"""
    text: str
    detected_manipulations: List[Dict[str, Any]]
    manipulation_score: float
    risk_level: str
    platform_characteristics: Dict[str, Any]
    ethical_warnings: List[str]
    recommendations: List[str]

class PsychologicalManipulationDetector:
    """심리적 조작 기법 감지 엔진"""
    
    def __init__(self):
        self.manipulation_patterns = self._initialize_manipulation_patterns()
        self.platform_patterns = self._initialize_platform_patterns()
        self.ethical_guidelines = self._initialize_ethical_guidelines()
        
    def _initialize_manipulation_patterns(self) -> Dict[str, List[str]]:
        """심리적 조작 패턴 초기화"""
        return {
            "gaslighting": [
                "그런 말 안 했는데", "너가 잘못 기억하고 있어", "그건 네 상상이야",
                "너가 과민반응하고 있어", "그런 일 없었어", "너가 착각하고 있어",
                "너가 너무 예민해", "그건 네가 만든 이야기야", "너가 왜곡하고 있어",
                "그런 말 한 적 없어", "너가 잘못 들었어", "그건 네가 착각한 거야"
            ],
            "brainwashing": [
                "너는 잘못 생각하고 있어", "올바른 생각을 해야 해", "그건 틀린 생각이야",
                "너는 교육이 필요해", "너는 아직 모르는 게 많아", "너는 성숙하지 못해",
                "너는 잘못된 정보에 속고 있어", "너는 현실을 제대로 보지 못해",
                "너는 편견에 사로잡혀 있어", "너는 객관적이지 못해"
            ],
            "emotional_blackmail": [
                "너 때문에 내가 아파", "너 때문에 내가 힘들어", "너 때문에 내가 죽고 싶어",
                "너 때문에 내가 우울해", "너 때문에 내가 화가 나", "너 때문에 내가 스트레스받아",
                "너 때문에 내가 잠을 못 자", "너 때문에 내가 밥을 못 먹어",
                "너 때문에 내가 병이 나", "너 때문에 내가 미치겠어"
            ],
            "guilt_tripping": [
                "내가 너를 위해 이렇게 했는데", "내가 너를 위해 희생했는데",
                "내가 너를 위해 포기했는데", "내가 너를 위해 참았는데",
                "내가 너를 위해 버렸는데", "내가 너를 위해 바꿨는데",
                "내가 너를 위해 노력했는데", "내가 너를 위해 투자했는데",
                "내가 너를 위해 기다렸는데", "내가 너를 위해 기대했는데"
            ],
            "love_bombing": [
                "너는 내 인생의 전부야", "너 없이는 살 수 없어", "너는 내 유일한 사랑이야",
                "너는 내 운명이야", "너는 내 천사야", "너는 내 모든 것이야",
                "너는 내 꿈이야", "너는 내 희망이야", "너는 내 미래야",
                "너는 내 과거야", "너는 내 현재야"
            ],
            "silent_treatment": [
                "말하지 않겠어", "대화하지 않겠어", "연락하지 않겠어",
                "만나지 않겠어", "보지 않겠어", "듣지 않겠어",
                "무시하겠어", "외면하겠어", "회피하겠어", "피하겠어"
            ],
            "triangulation": [
                "다른 사람들은 다 그래", "다른 사람들도 그렇게 생각해",
                "다른 사람들도 그렇게 말해", "다른 사람들도 그렇게 해",
                "다른 사람들도 그렇게 느껴", "다른 사람들도 그렇게 봐",
                "다른 사람들도 그렇게 믿어", "다른 사람들도 그렇게 알어"
            ],
            "projection": [
                "너가 그런 거야", "너가 그렇게 해", "너가 그렇게 생각해",
                "너가 그렇게 느껴", "너가 그렇게 봐", "너가 그렇게 믿어",
                "너가 그렇게 알어", "너가 그렇게 말해", "너가 그렇게 행동해"
            ],
            "victim_blaming": [
                "너가 그렇게 해서 그래", "너가 그렇게 해서 그런 거야",
                "너가 그렇게 해서 그렇게 된 거야", "너가 그렇게 해서 그렇게 됐어",
                "너가 그렇게 해서 그렇게 되었어", "너가 그렇게 해서 그렇게 되었어",
                "너가 그렇게 해서 그렇게 되었어", "너가 그렇게 해서 그렇게 되었어"
            ],
            "isolation": [
                "다른 사람들과 어울리지 마", "다른 사람들과 친하게 지내지 마",
                "다른 사람들과 만나지 마", "다른 사람들과 연락하지 마",
                "다른 사람들과 대화하지 마", "다른 사람들과 친구하지 마",
                "다른 사람들과 어울리지 마", "다른 사람들과 친하게 지내지 마"
            ],
            "fear_mongering": [
                "그렇게 하면 안 돼", "그렇게 하면 위험해", "그렇게 하면 문제가 생겨",
                "그렇게 하면 망해", "그렇게 하면 망한다", "그렇게 하면 망할 거야",
                "그렇게 하면 망할 거예요", "그렇게 하면 망할 겁니다"
            ],
            "false_dichotomy": [
                "이것 아니면 저것", "이거 아니면 저거", "이게 아니면 저게",
                "이게 아니면 저게", "이게 아니면 저게", "이게 아니면 저게",
                "이게 아니면 저게", "이게 아니면 저게", "이게 아니면 저게"
            ],
            "ad_hominem": [
                "너는 바보야", "너는 멍청해", "너는 어리석어", "너는 무식해",
                "너는 무지해", "너는 몰라", "너는 모르는 게 많아", "너는 아무것도 몰라"
            ],
            "strawman": [
                "너는 그렇게 말했어", "너는 그렇게 생각해", "너는 그렇게 믿어",
                "너는 그렇게 알어", "너는 그렇게 봐", "너는 그렇게 느껴"
            ],
            "appeal_to_authority": [
                "전문가들이 그렇게 말해", "전문가들이 그렇게 생각해",
                "전문가들이 그렇게 믿어", "전문가들이 그렇게 알어",
                "전문가들이 그렇게 봐", "전문가들이 그렇게 느껴"
            ],
            "bandwagon": [
                "모든 사람들이 그렇게 해", "모든 사람들이 그렇게 생각해",
                "모든 사람들이 그렇게 믿어", "모든 사람들이 그렇게 알어",
                "모든 사람들이 그렇게 봐", "모든 사람들이 그렇게 느껴"
            ],
            "scarcity": [
                "지금 안 하면 안 돼", "지금 안 하면 늦어", "지금 안 하면 끝이야",
                "지금 안 하면 망해", "지금 안 하면 망한다", "지금 안 하면 망할 거야"
            ],
            "foot_in_door": [
                "작은 것부터 시작해", "작은 것부터 해봐", "작은 것부터 시작하자",
                "작은 것부터 해보자", "작은 것부터 시작해봐", "작은 것부터 해봐"
            ],
            "door_in_face": [
                "큰 것부터 시작해", "큰 것부터 해봐", "큰 것부터 시작하자",
                "큰 것부터 해보자", "큰 것부터 시작해봐", "큰 것부터 해봐"
            ]
        }
    
    def _initialize_platform_patterns(self) -> Dict[str, List[str]]:
        """플랫폼별 패턴 초기화"""
        return {
            "comment": [
                "ㅋㅋ", "ㅎㅎ", "ㅠㅠ", "ㅜㅜ", "ㅇㅇ", "ㄴㄴ", "ㄱㄱ", "ㄷㄷ",
                "ㅗ", "ㅉ", "ㅂㅂ", "ㅅㅅ", "ㅈㅈ", "ㅊㅊ", "ㅋㅋㅋ", "ㅎㅎㅎ"
            ],
            "kakaotalk": [
                "ㅋㅋㅋㅋ", "ㅎㅎㅎㅎ", "ㅠㅠㅠㅠ", "ㅜㅜㅜㅜ", "ㅇㅇㅇㅇ",
                "ㄴㄴㄴㄴ", "ㄱㄱㄱㄱ", "ㄷㄷㄷㄷ", "ㅗㅗㅗㅗ", "ㅉㅉㅉㅉ"
            ],
            "community": [
                "글쓴이", "작성자", "원글", "본문", "댓글", "추천", "비추천",
                "공감", "비공감", "신고", "차단", "팔로우", "언팔로우"
            ],
            "forum": [
                "토론", "논의", "의견", "견해", "생각", "관점", "입장",
                "주장", "반박", "지지", "반대", "찬성", "반대"
            ],
            "blog": [
                "블로그", "포스팅", "글", "기사", "후기", "리뷰", "평가",
                "추천", "비추천", "공감", "비공감", "댓글", "트랙백"
            ],
            "sns": [
                "좋아요", "하트", "공유", "리트윗", "팔로우", "언팔로우",
                "멘션", "해시태그", "스토리", "피드", "타임라인"
            ],
            "news": [
                "기사", "뉴스", "보도", "발표", "발표문", "성명", "논평",
                "사설", "칼럼", "기고", "인터뷰", "취재", "보도"
            ],
            "academic": [
                "연구", "논문", "학술", "학문", "이론", "가설", "실험",
                "조사", "분석", "결론", "논의", "참고문헌", "인용"
            ]
        }
    
    def _initialize_ethical_guidelines(self) -> Dict[str, List[str]]:
        """윤리적 가이드라인 초기화"""
        return {
            "warnings": [
                "⚠️ 심리적 조작 기법이 감지되었습니다",
                "⚠️ 가스라이팅 패턴이 발견되었습니다",
                "⚠️ 감정적 협박이 감지되었습니다",
                "⚠️ 죄책감 유발 시도가 감지되었습니다",
                "⚠️ 피해자 비난 패턴이 발견되었습니다",
                "⚠️ 고립화 시도가 감지되었습니다",
                "⚠️ 공포 조성 기법이 감지되었습니다"
            ],
            "recommendations": [
                "💡 상대방의 말을 객관적으로 분석해보세요",
                "💡 감정적으로 반응하기 전에 한 번 더 생각해보세요",
                "💡 신뢰할 수 있는 사람과 상담해보세요",
                "💡 상대방의 의도를 의심해보세요",
                "💡 자신의 감정과 생각을 믿으세요",
                "💡 필요시 전문가의 도움을 받으세요"
            ]
        }
    
    async def analyze_psychological_manipulation(self, text: str, platform: str = "general") -> ManipulationAnalysis:
        """심리적 조작 기법 분석"""
        try:
            detected_manipulations = []
            manipulation_score = 0.0
            
            # 각 조작 기법별 패턴 검사
            for manipulation_type, patterns in self.manipulation_patterns.items():
                for pattern in patterns:
                    if pattern in text:
                        detected_manipulations.append({
                            "type": manipulation_type,
                            "pattern": pattern,
                            "severity": self._calculate_severity(manipulation_type, pattern),
                            "position": text.find(pattern)
                        })
                        manipulation_score += self._calculate_severity(manipulation_type, pattern)
            
            # 조작 점수 정규화 (0-1)
            max_possible_score = len(self.manipulation_patterns) * 10
            manipulation_score = min(manipulation_score / max_possible_score, 1.0)
            
            # 위험도 계산
            risk_level = self._calculate_risk_level(manipulation_score)
            
            # 플랫폼 특성 분석
            platform_characteristics = self._analyze_platform_characteristics(text, platform)
            
            # 윤리적 경고 생성
            ethical_warnings = self._generate_ethical_warnings(detected_manipulations)
            
            # 권장사항 생성
            recommendations = self._generate_recommendations(detected_manipulations, risk_level)
            
            return ManipulationAnalysis(
                text=text,
                detected_manipulations=detected_manipulations,
                manipulation_score=manipulation_score,
                risk_level=risk_level,
                platform_characteristics=platform_characteristics,
                ethical_warnings=ethical_warnings,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"심리적 조작 분석 중 오류: {e}")
            return self._create_fallback_analysis(text)
    
    def _calculate_severity(self, manipulation_type: str, pattern: str) -> float:
        """조작 기법 심각도 계산"""
        severity_weights = {
            "gaslighting": 10.0,
            "brainwashing": 9.0,
            "emotional_blackmail": 8.0,
            "guilt_tripping": 7.0,
            "love_bombing": 6.0,
            "silent_treatment": 5.0,
            "triangulation": 4.0,
            "projection": 3.0,
            "victim_blaming": 8.0,
            "isolation": 7.0,
            "fear_mongering": 6.0,
            "false_dichotomy": 3.0,
            "ad_hominem": 4.0,
            "strawman": 2.0,
            "appeal_to_authority": 3.0,
            "bandwagon": 2.0,
            "scarcity": 4.0,
            "foot_in_door": 3.0,
            "door_in_face": 3.0
        }
        
        return severity_weights.get(manipulation_type, 1.0)
    
    def _calculate_risk_level(self, manipulation_score: float) -> str:
        """위험도 계산"""
        if manipulation_score >= 0.8:
            return "매우 높음"
        elif manipulation_score >= 0.6:
            return "높음"
        elif manipulation_score >= 0.4:
            return "보통"
        elif manipulation_score >= 0.2:
            return "낮음"
        else:
            return "매우 낮음"
    
    def _analyze_platform_characteristics(self, text: str, platform: str) -> Dict[str, Any]:
        """플랫폼 특성 분석"""
        characteristics = {
            "platform": platform,
            "text_length": len(text),
            "emoji_count": len(re.findall(r'[😀-🙏🌀-🗿]', text)),
            "special_characters": len(re.findall(r'[ㅋㅎㅠㅜㅇㄴㄱㄷㅗㅉㅂㅅㅈㅊ]', text)),
            "capital_letters": len(re.findall(r'[A-Z]', text)),
            "exclamation_marks": text.count('!'),
            "question_marks": text.count('?'),
            "periods": text.count('.'),
            "hashtags": len(re.findall(r'#\w+', text)),
            "mentions": len(re.findall(r'@\w+', text))
        }
        
        # 플랫폼별 특성 추가
        if platform in self.platform_patterns:
            platform_patterns = self.platform_patterns[platform]
            platform_specific_count = sum(1 for pattern in platform_patterns if pattern in text)
            characteristics["platform_specific_patterns"] = platform_specific_count
        
        return characteristics
    
    def _generate_ethical_warnings(self, detected_manipulations: List[Dict[str, Any]]) -> List[str]:
        """윤리적 경고 생성"""
        warnings = []
        
        for manipulation in detected_manipulations:
            manipulation_type = manipulation["type"]
            
            if manipulation_type == "gaslighting":
                warnings.append("⚠️ 가스라이팅 패턴이 감지되었습니다. 상대방이 당신의 기억이나 인식을 의심하게 만들려고 합니다.")
            elif manipulation_type == "brainwashing":
                warnings.append("⚠️ 세뇌 기법이 감지되었습니다. 상대방이 당신의 사고방식을 바꾸려고 합니다.")
            elif manipulation_type == "emotional_blackmail":
                warnings.append("⚠️ 감정적 협박이 감지되었습니다. 상대방이 당신의 감정을 이용해 조작하려고 합니다.")
            elif manipulation_type == "guilt_tripping":
                warnings.append("⚠️ 죄책감 유발 시도가 감지되었습니다. 상대방이 당신에게 죄책감을 느끼게 하려고 합니다.")
            elif manipulation_type == "victim_blaming":
                warnings.append("⚠️ 피해자 비난 패턴이 감지되었습니다. 상대방이 당신을 비난하려고 합니다.")
        
        return warnings
    
    def _generate_recommendations(self, detected_manipulations: List[Dict[str, Any]], risk_level: str) -> List[str]:
        """권장사항 생성"""
        recommendations = []
        
        if risk_level in ["매우 높음", "높음"]:
            recommendations.append("🚨 즉시 상대방과의 관계를 재검토하세요.")
            recommendations.append("💡 신뢰할 수 있는 사람과 상담하세요.")
            recommendations.append("🛡️ 자신의 감정과 생각을 믿으세요.")
        
        if any(m["type"] == "gaslighting" for m in detected_manipulations):
            recommendations.append("📝 대화 내용을 기록해두세요.")
            recommendations.append("🔍 객관적 증거를 찾아보세요.")
        
        if any(m["type"] == "emotional_blackmail" for m in detected_manipulations):
            recommendations.append("💪 감정적 거리를 두세요.")
            recommendations.append("🤝 건강한 경계를 설정하세요.")
        
        if any(m["type"] == "isolation" for m in detected_manipulations):
            recommendations.append("👥 다른 사람들과의 관계를 유지하세요.")
            recommendations.append("🌐 사회적 지지망을 강화하세요.")
        
        return recommendations
    
    def _create_fallback_analysis(self, text: str) -> ManipulationAnalysis:
        """기본 분석 결과 생성"""
        return ManipulationAnalysis(
            text=text,
            detected_manipulations=[],
            manipulation_score=0.0,
            risk_level="매우 낮음",
            platform_characteristics={"platform": "general", "text_length": len(text)},
            ethical_warnings=[],
            recommendations=[]
        )
    
    async def generate_manipulation_report(self, analysis: ManipulationAnalysis) -> str:
        """심리적 조작 분석 보고서 생성"""
        try:
            report_parts = []
            
            report_parts.append("## 🧠 심리적 조작 분석 보고서")
            report_parts.append("")
            
            # 기본 정보
            report_parts.append("### 📊 분석 결과")
            report_parts.append(f"**입력 텍스트**: \"{analysis.text[:100]}{'...' if len(analysis.text) > 100 else ''}\"")
            report_parts.append(f"**조작 점수**: {analysis.manipulation_score:.3f}/1.0")
            report_parts.append(f"**위험도**: {analysis.risk_level}")
            report_parts.append("")
            
            # 감지된 조작 기법
            if analysis.detected_manipulations:
                report_parts.append("### ⚠️ 감지된 조작 기법")
                for manipulation in analysis.detected_manipulations:
                    report_parts.append(f"- **{manipulation['type']}**: {manipulation['pattern']} (심각도: {manipulation['severity']:.1f})")
                report_parts.append("")
            else:
                report_parts.append("### ✅ 조작 기법 미감지")
                report_parts.append("분석된 텍스트에서 심리적 조작 기법이 감지되지 않았습니다.")
                report_parts.append("")
            
            # 플랫폼 특성
            report_parts.append("### 📱 플랫폼 특성")
            platform = analysis.platform_characteristics
            report_parts.append(f"- **플랫폼**: {platform['platform']}")
            report_parts.append(f"- **텍스트 길이**: {platform['text_length']}자")
            report_parts.append(f"- **이모지 수**: {platform['emoji_count']}개")
            report_parts.append(f"- **특수문자 수**: {platform['special_characters']}개")
            report_parts.append(f"- **느낌표 수**: {platform['exclamation_marks']}개")
            report_parts.append(f"- **물음표 수**: {platform['question_marks']}개")
            report_parts.append("")
            
            # 윤리적 경고
            if analysis.ethical_warnings:
                report_parts.append("### 🚨 윤리적 경고")
                for warning in analysis.ethical_warnings:
                    report_parts.append(f"- {warning}")
                report_parts.append("")
            
            # 권장사항
            if analysis.recommendations:
                report_parts.append("### 💡 권장사항")
                for recommendation in analysis.recommendations:
                    report_parts.append(f"- {recommendation}")
                report_parts.append("")
            
            # 안전 정보
            report_parts.append("### 🛡️ 안전 정보")
            report_parts.append("- 이 분석은 AI가 제공하는 참고용 정보입니다.")
            report_parts.append("- 심각한 상황에서는 전문가의 도움을 받으세요.")
            report_parts.append("- 필요시 관련 기관에 신고하세요.")
            report_parts.append("")
            
            report_parts.append("---")
            report_parts.append("*CORBU.AI Psychological Manipulation Detector가 제공하는 분석입니다*")
            
            return "\n".join(report_parts)
            
        except Exception as e:
            logger.error(f"조작 분석 보고서 생성 중 오류: {e}")
            return f"## 오류 발생\n조작 분석 보고서 생성 중 오류가 발생했습니다: {str(e)}"
    
    async def get_manipulation_statistics(self) -> Dict[str, Any]:
        """심리적 조작 감지 통계"""
        return {
            "supported_manipulation_types": [t.value for t in ManipulationType],
            "supported_platforms": [p.value for p in PlatformType],
            "total_patterns": sum(len(patterns) for patterns in self.manipulation_patterns.values()),
            "ethical_guidelines": len(self.ethical_guidelines["warnings"]),
            "detector_status": "active"
        }
