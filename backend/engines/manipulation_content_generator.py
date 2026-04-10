"""
CORBU.AI Manipulation Content Generator - 심리적 조작 콘텐츠 생성기
"""
import re
import json
import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum
import random

logger = logging.getLogger(__name__)

class ContentType(Enum):
    """콘텐츠 유형"""
    ARTICLE = "article"  # 글
    COMMENT = "comment"  # 댓글
    CHAT = "chat"  # 대화체
    POST = "post"  # 게시글
    MESSAGE = "message"  # 메시지
    EMAIL = "email"  # 이메일

class ManipulationTechnique(Enum):
    """조작 기법"""
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

@dataclass
class ManipulationContent:
    """조작 콘텐츠"""
    content: str
    technique: ManipulationTechnique
    content_type: ContentType
    intensity: float  # 0-1
    target_emotion: str
    psychological_impact: str

class ManipulationContentGenerator:
    """심리적 조작 콘텐츠 생성기"""
    
    def __init__(self):
        self.manipulation_templates = self._initialize_manipulation_templates()
        self.platform_adaptations = self._initialize_platform_adaptations()
        
    def _initialize_manipulation_templates(self) -> Dict[str, Dict[str, List[str]]]:
        """조작 템플릿 초기화"""
        return {
            "gaslighting": {
                "article": [
                    "당신이 기억하는 것은 사실이 아닙니다. 실제로는 {target}이었습니다.",
                    "그런 일은 절대 일어나지 않았습니다. 당신이 착각하고 있는 것 같습니다.",
                    "당신의 기억이 왜곡되어 있습니다. {authority}도 그렇게 말했습니다.",
                    "그건 당신의 상상입니다. 현실과 혼동하고 있는 것 같습니다.",
                    "당신이 과민반응하고 있습니다. {authority}도 그렇게 생각합니다."
                ],
                "comment": [
                    "ㅋㅋ 그런 말 안했는데? 너가 잘못 기억하는거 아냐?",
                    "그런 일 없었는데? 너가 착각하는거 같은데?",
                    "ㅇㅇ 그건 네 상상이야. 현실과 구분 못하나?",
                    "너가 과민반응하는거 같은데? 다른 사람들도 그렇게 생각해",
                    "그런 말 한 적 없는데? 너가 왜곡하고 있는거 아냐?"
                ],
                "chat": [
                    "어? 그런 말 안했는데? 너가 잘못 기억하는거 아니야?",
                    "그런 일 없었는데? 너가 착각하는거 같은데?",
                    "그건 네 상상이야. 현실과 구분 못하나?",
                    "너가 과민반응하는거 같은데? 다른 사람들도 그렇게 생각해",
                    "그런 말 한 적 없는데? 너가 왜곡하고 있는거 아냐?"
                ]
            },
            "brainwashing": {
                "article": [
                    "당신의 생각은 잘못되었습니다. 올바른 생각은 {correct_thought}입니다.",
                    "당신은 아직 교육이 부족합니다. {authority}의 가르침을 받아야 합니다.",
                    "당신의 믿음은 틀렸습니다. {authority}가 말한 {correct_belief}가 맞습니다.",
                    "당신은 현실을 제대로 보지 못하고 있습니다. {reality}가 진실입니다.",
                    "당신의 가치관은 잘못되었습니다. {correct_values}를 받아들여야 합니다."
                ],
                "comment": [
                    "ㅋㅋ 너 생각이 잘못됐어. 올바른 생각은 {correct_thought}야",
                    "너는 아직 교육이 부족해. {authority}의 가르침을 받아야 해",
                    "너 믿음이 틀렸어. {authority}가 말한 {correct_belief}가 맞아",
                    "너는 현실을 제대로 못보고 있어. {reality}가 진실이야",
                    "너 가치관이 잘못됐어. {correct_values}를 받아들여야 해"
                ],
                "chat": [
                    "어? 너 생각이 잘못됐어. 올바른 생각은 {correct_thought}야",
                    "너는 아직 교육이 부족해. {authority}의 가르침을 받아야 해",
                    "너 믿음이 틀렸어. {authority}가 말한 {correct_belief}가 맞아",
                    "너는 현실을 제대로 못보고 있어. {reality}가 진실이야",
                    "너 가치관이 잘못됐어. {correct_values}를 받아들여야 해"
                ]
            },
            "emotional_blackmail": {
                "article": [
                    "당신 때문에 내가 {suffering}하고 있습니다. 이제 그만해주세요.",
                    "당신이 {action}하지 않으면 내가 {consequence}할 것입니다.",
                    "당신 때문에 내가 {emotional_state}합니다. 정말 그렇게 하고 싶으신가요?",
                    "당신이 {action}하지 않으면 우리 관계가 끝날 것입니다.",
                    "당신 때문에 내가 {physical_symptom}하고 있습니다. 이제 그만해주세요."
                ],
                "comment": [
                    "너 때문에 내가 {suffering}하고 있어. 이제 그만해줘",
                    "너가 {action}하지 않으면 내가 {consequence}할거야",
                    "너 때문에 내가 {emotional_state}해. 정말 그렇게 하고 싶어?",
                    "너가 {action}하지 않으면 우리 관계 끝이야",
                    "너 때문에 내가 {physical_symptom}하고 있어. 이제 그만해줘"
                ],
                "chat": [
                    "어? 너 때문에 내가 {suffering}하고 있어. 이제 그만해줘",
                    "너가 {action}하지 않으면 내가 {consequence}할거야",
                    "너 때문에 내가 {emotional_state}해. 정말 그렇게 하고 싶어?",
                    "너가 {action}하지 않으면 우리 관계 끝이야",
                    "너 때문에 내가 {physical_symptom}하고 있어. 이제 그만해줘"
                ]
            },
            "guilt_tripping": {
                "article": [
                    "내가 당신을 위해 {sacrifice}했는데, 당신은 그런 식으로 대하시는군요.",
                    "내가 당신을 위해 {effort}했는데, 당신은 고마워하지도 않네요.",
                    "내가 당신을 위해 {investment}했는데, 당신은 그런 식으로 보답하시는군요.",
                    "내가 당신을 위해 {time}을 투자했는데, 당신은 그런 식으로 대하시는군요.",
                    "내가 당신을 위해 {money}을 썼는데, 당신은 그런 식으로 보답하시는군요."
                ],
                "comment": [
                    "내가 너를 위해 {sacrifice}했는데, 너는 그런 식으로 대하는구나",
                    "내가 너를 위해 {effort}했는데, 너는 고마워하지도 않네",
                    "내가 너를 위해 {investment}했는데, 너는 그런 식으로 보답하는구나",
                    "내가 너를 위해 {time}을 투자했는데, 너는 그런 식으로 대하는구나",
                    "내가 너를 위해 {money}을 썼는데, 너는 그런 식으로 보답하는구나"
                ],
                "chat": [
                    "어? 내가 너를 위해 {sacrifice}했는데, 너는 그런 식으로 대하는구나",
                    "내가 너를 위해 {effort}했는데, 너는 고마워하지도 않네",
                    "내가 너를 위해 {investment}했는데, 너는 그런 식으로 보답하는구나",
                    "내가 너를 위해 {time}을 투자했는데, 너는 그런 식으로 대하는구나",
                    "내가 너를 위해 {money}을 썼는데, 너는 그런 식으로 보답하는구나"
                ]
            },
            "love_bombing": {
                "article": [
                    "당신은 내 인생의 전부입니다. 당신 없이는 살 수 없어요.",
                    "당신은 내 유일한 사랑입니다. 다른 사람은 필요 없어요.",
                    "당신은 내 운명입니다. 우리는 영원히 함께해야 해요.",
                    "당신은 내 천사입니다. 당신만 있으면 충분해요.",
                    "당신은 내 모든 것입니다. 당신만 바라보고 살 거예요."
                ],
                "comment": [
                    "너는 내 인생의 전부야. 너 없이는 살 수 없어",
                    "너는 내 유일한 사랑이야. 다른 사람은 필요 없어",
                    "너는 내 운명이야. 우리는 영원히 함께해야 해",
                    "너는 내 천사야. 너만 있으면 충분해",
                    "너는 내 모든 것이야. 너만 바라보고 살 거야"
                ],
                "chat": [
                    "어? 너는 내 인생의 전부야. 너 없이는 살 수 없어",
                    "너는 내 유일한 사랑이야. 다른 사람은 필요 없어",
                    "너는 내 운명이야. 우리는 영원히 함께해야 해",
                    "너는 내 천사야. 너만 있으면 충분해",
                    "너는 내 모든 것이야. 너만 바라보고 살 거야"
                ]
            },
            "victim_blaming": {
                "article": [
                    "당신이 그렇게 해서 그런 일이 생긴 것입니다. 당신이 원인입니다.",
                    "당신이 그런 행동을 했기 때문에 그런 결과가 나온 것입니다.",
                    "당신이 그렇게 대했기 때문에 그런 반응이 나온 것입니다.",
                    "당신이 그런 말을 했기 때문에 그런 일이 생긴 것입니다.",
                    "당신이 그런 태도를 보였기 때문에 그런 결과가 나온 것입니다."
                ],
                "comment": [
                    "너가 그렇게 해서 그런 일이 생긴거야. 너가 원인이야",
                    "너가 그런 행동을 했기 때문에 그런 결과가 나온거야",
                    "너가 그렇게 대했기 때문에 그런 반응이 나온거야",
                    "너가 그런 말을 했기 때문에 그런 일이 생긴거야",
                    "너가 그런 태도를 보였기 때문에 그런 결과가 나온거야"
                ],
                "chat": [
                    "어? 너가 그렇게 해서 그런 일이 생긴거야. 너가 원인이야",
                    "너가 그런 행동을 했기 때문에 그런 결과가 나온거야",
                    "너가 그렇게 대했기 때문에 그런 반응이 나온거야",
                    "너가 그런 말을 했기 때문에 그런 일이 생긴거야",
                    "너가 그런 태도를 보였기 때문에 그런 결과가 나온거야"
                ]
            }
        }
    
    def _initialize_platform_adaptations(self) -> Dict[str, Dict[str, str]]:
        """플랫폼별 적응 초기화"""
        return {
            "article": {
                "opening": "최근 많은 사람들이",
                "middle": "따라서",
                "ending": "결론적으로",
                "formality": "습니다"
            },
            "comment": {
                "opening": "ㅋㅋ",
                "middle": "그런데",
                "ending": "아무튼",
                "formality": "어"
            },
            "chat": {
                "opening": "어?",
                "middle": "그런데",
                "ending": "아무튼",
                "formality": "야"
            }
        }
    
    
    async def generate_manipulation_content(
        self, 
        technique: ManipulationTechnique, 
        content_type: ContentType, 
        target: str = "상대방",
        intensity: float = 0.5,
        context: Dict[str, Any] = None
    ) -> ManipulationContent:
        """조작 콘텐츠 생성"""
        try:
            # 템플릿 선택
            template = random.choice(
                self.manipulation_templates[technique.value][content_type.value]
            )
            
            # 변수 치환
            content = self._replace_variables(template, target, context)
            
            # 플랫폼별 적응
            content = self._adapt_to_platform(content, content_type)
            
            # 강도 조정
            content = self._adjust_intensity(content, intensity)
            
            # 타겟 감정 결정
            target_emotion = self._determine_target_emotion(technique)
            
            # 심리적 영향 분석
            psychological_impact = self._analyze_psychological_impact(technique, intensity)
            
            return ManipulationContent(
                content=content,
                technique=technique,
                content_type=content_type,
                intensity=intensity,
                target_emotion=target_emotion,
                psychological_impact=psychological_impact
            )
            
        except Exception as e:
            logger.error(f"조작 콘텐츠 생성 중 오류: {e}")
            return self._create_fallback_content(technique, content_type)
    
    def _replace_variables(self, template: str, target: str, context: Dict[str, Any]) -> str:
        """변수 치환"""
        replacements = {
            "target": target,
            "authority": context.get("authority", "전문가") if context else "전문가",
            "correct_thought": context.get("correct_thought", "올바른 생각") if context else "올바른 생각",
            "correct_belief": context.get("correct_belief", "올바른 믿음") if context else "올바른 믿음",
            "reality": context.get("reality", "현실") if context else "현실",
            "correct_values": context.get("correct_values", "올바른 가치관") if context else "올바른 가치관",
            "suffering": context.get("suffering", "고통") if context else "고통",
            "action": context.get("action", "그 행동") if context else "그 행동",
            "consequence": context.get("consequence", "죽을 것") if context else "죽을 것",
            "emotional_state": context.get("emotional_state", "우울") if context else "우울",
            "physical_symptom": context.get("physical_symptom", "아프") if context else "아프",
            "sacrifice": context.get("sacrifice", "희생") if context else "희생",
            "effort": context.get("effort", "노력") if context else "노력",
            "investment": context.get("investment", "투자") if context else "투자",
            "time": context.get("time", "시간") if context else "시간",
            "money": context.get("money", "돈") if context else "돈"
        }
        
        for key, value in replacements.items():
            template = template.replace(f"{{{key}}}", value)
        
        return template
    
    def _adapt_to_platform(self, content: str, content_type: ContentType) -> str:
        """플랫폼별 적응"""
        adaptations = self.platform_adaptations[content_type.value]
        
        if content_type == ContentType.COMMENT:
            # 댓글 특성 추가
            content = f"{adaptations['opening']} {content}"
            if not content.endswith(('!', '?', '.')):
                content += f"{adaptations['formality']}"
        elif content_type == ContentType.CHAT:
            # 대화체 특성 추가
            content = f"{adaptations['opening']} {content}"
            if not content.endswith(('!', '?', '.')):
                content += f"{adaptations['formality']}"
        elif content_type == ContentType.ARTICLE:
            # 글 특성 추가
            content = f"{adaptations['opening']} {content} {adaptations['ending']} {content}"
        
        return content
    
    def _adjust_intensity(self, content: str, intensity: float) -> str:
        """강도 조정"""
        if intensity < 0.3:
            # 약한 강도
            content = content.replace("절대", "아마")
            content = content.replace("완전히", "조금")
            content = content.replace("정말", "약간")
        elif intensity > 0.7:
            # 강한 강도
            content = content.replace("아마", "절대")
            content = content.replace("조금", "완전히")
            content = content.replace("약간", "정말")
            content = f"정말로 {content}"
        
        return content
    
    def _determine_target_emotion(self, technique: ManipulationTechnique) -> str:
        """타겟 감정 결정"""
        emotion_map = {
            ManipulationTechnique.GASLIGHTING: "혼란, 불안",
            ManipulationTechnique.BRAINWASHING: "의존, 복종",
            ManipulationTechnique.EMOTIONAL_BLACKMAIL: "죄책감, 두려움",
            ManipulationTechnique.GUILT_TRIPPING: "죄책감, 부담감",
            ManipulationTechnique.LOVE_BOMBING: "의존, 착각",
            ManipulationTechnique.VICTIM_BLAMING: "자책, 우울"
        }
        return emotion_map.get(technique, "불안, 혼란")
    
    def _analyze_psychological_impact(self, technique: ManipulationTechnique, intensity: float) -> str:
        """심리적 영향 분석"""
        impacts = {
            ManipulationTechnique.GASLIGHTING: f"상대방의 기억과 인식을 의심하게 만들어 정신적 혼란을 야기합니다. (강도: {intensity:.1f})",
            ManipulationTechnique.BRAINWASHING: f"상대방의 사고방식을 바꾸려고 시도하여 자유의지를 침해합니다. (강도: {intensity:.1f})",
            ManipulationTechnique.EMOTIONAL_BLACKMAIL: f"상대방의 감정을 이용하여 조작하려고 시도합니다. (강도: {intensity:.1f})",
            ManipulationTechnique.GUILT_TRIPPING: f"상대방에게 죄책감을 느끼게 하여 조작하려고 시도합니다. (강도: {intensity:.1f})",
            ManipulationTechnique.LOVE_BOMBING: f"과도한 애정 표현으로 상대방을 의존하게 만듭니다. (강도: {intensity:.1f})",
            ManipulationTechnique.VICTIM_BLAMING: f"상대방을 비난하여 자책하게 만듭니다. (강도: {intensity:.1f})"
        }
        return impacts.get(technique, f"심리적 조작을 시도합니다. (강도: {intensity:.1f})")
    
    def _create_fallback_content(self, technique: ManipulationTechnique, content_type: ContentType) -> ManipulationContent:
        """기본 콘텐츠 생성"""
        return ManipulationContent(
            content=f"조작 콘텐츠 생성 중 오류가 발생했습니다. ({technique.value}, {content_type.value})",
            technique=technique,
            content_type=content_type,
            intensity=0.0,
            target_emotion="없음",
            psychological_impact="오류 발생"
        )
    
    async def generate_manipulation_report(self, content: ManipulationContent) -> str:
        """조작 콘텐츠 보고서 생성"""
        try:
            report_parts = []
            
            report_parts.append("## ⚠️ 심리적 조작 콘텐츠 생성 보고서")
            report_parts.append("")
            
            # 기본 정보
            report_parts.append("### 📊 생성된 콘텐츠")
            report_parts.append(f"**조작 기법**: {content.technique.value}")
            report_parts.append(f"**콘텐츠 유형**: {content.content_type.value}")
            report_parts.append(f"**강도**: {content.intensity:.1f}/1.0")
            report_parts.append(f"**타겟 감정**: {content.target_emotion}")
            report_parts.append("")
            
            # 생성된 콘텐츠
            report_parts.append("### 📝 생성된 콘텐츠")
            report_parts.append(f"```")
            report_parts.append(content.content)
            report_parts.append(f"```")
            report_parts.append("")
            
            # 심리적 영향
            report_parts.append("### 🧠 심리적 영향")
            report_parts.append(content.psychological_impact)
            report_parts.append("")
            
            
            report_parts.append("---")
            report_parts.append("*CORBU.AI Manipulation Content Generator가 생성한 콘텐츠입니다*")
            
            return "\n".join(report_parts)
            
        except Exception as e:
            logger.error(f"조작 콘텐츠 보고서 생성 중 오류: {e}")
            return f"## 오류 발생\n조작 콘텐츠 보고서 생성 중 오류가 발생했습니다: {str(e)}"
    
    async def get_manipulation_statistics(self) -> Dict[str, Any]:
        """조작 콘텐츠 생성 통계"""
        return {
            "supported_techniques": [t.value for t in ManipulationTechnique],
            "supported_content_types": [t.value for t in ContentType],
            "total_templates": sum(
                len(templates) 
                for technique_templates in self.manipulation_templates.values() 
                for templates in technique_templates.values()
            ),
            "generator_status": "active"
        }
