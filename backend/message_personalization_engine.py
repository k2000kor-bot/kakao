import json
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import re


@dataclass
class PersonaStyle:
    """개인 스타일 프로필"""
    formality_level: float  # 0-1 (격식체 수준)
    directness: float  # 0-1 (직설적 정도)
    detail_preference: float  # 0-1 (세부사항 선호도)
    emotion_expression: float  # 0-1 (감정 표현 정도)
    logic_pattern: str  # 논리 전개 패턴
    vocabulary_level: str  # 어휘 수준
    communication_style: str  # 소통 스타일
    decision_approach: str  # 의사결정 접근방식


@dataclass
class MessagePersonalization:
    """메시지 개인화 설정"""
    target_persona: PersonaStyle
    context_adaptation: Dict[str, Any]
    tone_adjustments: Dict[str, float]
    content_priorities: List[str]
    structure_preferences: Dict[str, Any]


class MessagePersonalizationEngine:
    """메시지 개인화 엔진"""
    
    def __init__(self):
        self.persona_templates = self._initialize_persona_templates()
        self.style_patterns = self._initialize_style_patterns()
        self.adaptation_rules = self._initialize_adaptation_rules()
        self.personalization_history = {}
        
    def _initialize_persona_templates(self) -> Dict[str, PersonaStyle]:
        """페르소나 템플릿 초기화"""
        return {
            "conservative_executive": PersonaStyle(
                formality_level=0.9,
                directness=0.7,
                detail_preference=0.4,
                emotion_expression=0.2,
                logic_pattern="deductive",
                vocabulary_level="formal",
                communication_style="authoritative",
                decision_approach="risk_averse"
            ),
            "progressive_manager": PersonaStyle(
                formality_level=0.6,
                directness=0.8,
                detail_preference=0.7,
                emotion_expression=0.5,
                logic_pattern="inductive",
                vocabulary_level="professional",
                communication_style="collaborative",
                decision_approach="data_driven"
            ),
            "detail_oriented_analyst": PersonaStyle(
                formality_level=0.7,
                directness=0.6,
                detail_preference=0.9,
                emotion_expression=0.3,
                logic_pattern="analytical",
                vocabulary_level="technical",
                communication_style="methodical",
                decision_approach="thorough_analysis"
            ),
            "relationship_focused_coordinator": PersonaStyle(
                formality_level=0.5,
                directness=0.4,
                detail_preference=0.6,
                emotion_expression=0.8,
                logic_pattern="narrative",
                vocabulary_level="accessible",
                communication_style="empathetic",
                decision_approach="consensus_building"
            ),
            "results_driven_leader": PersonaStyle(
                formality_level=0.8,
                directness=0.9,
                detail_preference=0.5,
                emotion_expression=0.3,
                logic_pattern="goal_oriented",
                vocabulary_level="business",
                communication_style="decisive",
                decision_approach="outcome_focused"
            )
        }
    
    def _initialize_style_patterns(self) -> Dict[str, Dict[str, List[str]]]:
        """스타일 패턴 초기화"""
        return {
            "formality_levels": {
                "very_formal": [
                    "귀하께서 요청하신", "신중히 검토한 바", "정중히 제안드리는", 
                    "존경하는", "말씀드리겠습니다", "검토해 주시기 바랍니다"
                ],
                "formal": [
                    "요청하신", "검토한 결과", "제안드리는", 
                    "말씀드리며", "확인해 주십시오", "고려해 주시기 바랍니다"
                ],
                "semi_formal": [
                    "요청한", "검토 결과", "제안하는", 
                    "말씀드리고", "확인해 주세요", "고려해 주세요"
                ],
                "casual": [
                    "요청한", "검토해보니", "제안하는", 
                    "말씀드리면", "확인해보세요", "고려해보세요"
                ]
            },
            "directness_levels": {
                "very_direct": [
                    "결론부터 말씀드리면", "명확히 말씀드리면", "직접적으로 표현하면",
                    "단도직입적으로", "솔직히 말씀드리면"
                ],
                "direct": [
                    "요점을 말씀드리면", "핵심은", "중요한 것은",
                    "결론적으로", "분명한 것은"
                ],
                "moderate": [
                    "전반적으로 보면", "종합적으로 판단할 때", "다각도로 검토한 결과",
                    "신중히 고려할 때", "균형적 관점에서"
                ],
                "indirect": [
                    "조심스럽게 말씀드리면", "개인적인 의견으로는", "혹시 고려해볼 만한",
                    "참고로 말씀드리면", "가능성을 염두에 두고"
                ]
            },
            "emotion_expression": {
                "high": [
                    "매우 기쁘게 생각합니다", "진심으로 우려됩니다", "깊은 신뢰를 갖고",
                    "열정적으로 추천합니다", "확고한 믿음으로"
                ],
                "moderate": [
                    "긍정적으로 평가합니다", "우려스러운 부분이 있습니다", "신뢰할 만합니다",
                    "추천할 만합니다", "확신을 갖고"
                ],
                "low": [
                    "적절하다고 판단됩니다", "고려할 필요가 있습니다", "타당하다고 봅니다",
                    "검토가 필요합니다", "합리적이라고 생각됩니다"
                ],
                "minimal": [
                    "해당됩니다", "필요합니다", "적용됩니다",
                    "요구됩니다", "관련됩니다"
                ]
            }
        }
    
    def _initialize_adaptation_rules(self) -> Dict[str, Dict]:
        """적응 규칙 초기화"""
        return {
            "context_sensitivity": {
                "urgent_situation": {
                    "increase_directness": 0.3,
                    "reduce_detail": 0.2,
                    "emphasize_action": True
                },
                "sensitive_topic": {
                    "increase_formality": 0.2,
                    "reduce_directness": 0.1,
                    "add_diplomatic_language": True
                },
                "technical_discussion": {
                    "increase_detail": 0.3,
                    "use_technical_vocabulary": True,
                    "structured_presentation": True
                }
            },
            "audience_adaptation": {
                "senior_executive": {
                    "high_level_summary": True,
                    "focus_on_impact": True,
                    "minimize_technical_details": True
                },
                "technical_team": {
                    "detailed_methodology": True,
                    "include_specifications": True,
                    "use_technical_terminology": True
                },
                "external_stakeholder": {
                    "formal_tone": True,
                    "comprehensive_context": True,
                    "diplomatic_language": True
                }
            }
        }
    
    def analyze_recipient_style(self, recipient_messages: List[str]) -> PersonaStyle:
        """수신자 스타일 분석"""
        if not recipient_messages:
            return self.persona_templates["progressive_manager"]  # 기본값
        
        # 격식성 수준 분석
        formality = self._analyze_formality(recipient_messages)
        
        # 직설성 분석
        directness = self._analyze_directness(recipient_messages)
        
        # 세부사항 선호도 분석
        detail_preference = self._analyze_detail_preference(recipient_messages)
        
        # 감정 표현 정도 분석
        emotion_expression = self._analyze_emotion_expression(recipient_messages)
        
        # 논리 패턴 분석
        logic_pattern = self._analyze_logic_pattern(recipient_messages)
        
        # 어휘 수준 분석
        vocabulary_level = self._analyze_vocabulary_level(recipient_messages)
        
        # 소통 스타일 분석
        communication_style = self._analyze_communication_style(recipient_messages)
        
        # 의사결정 접근방식 분석
        decision_approach = self._analyze_decision_approach(recipient_messages)
        
        return PersonaStyle(
            formality_level=formality,
            directness=directness,
            detail_preference=detail_preference,
            emotion_expression=emotion_expression,
            logic_pattern=logic_pattern,
            vocabulary_level=vocabulary_level,
            communication_style=communication_style,
            decision_approach=decision_approach
        )
    
    def _analyze_formality(self, messages: List[str]) -> float:
        """격식성 수준 분석"""
        formal_indicators = [
            "존경하는", "귀하", "말씀드리", "제안드리", "검토해 주시기", 
            "바랍니다", "주십시오", "해주십시오"
        ]
        
        casual_indicators = [
            "해보세요", "봐주세요", "주세요", "해주세요", "생각해요", "해요"
        ]
        
        total_messages = len(messages)
        formal_count = 0
        casual_count = 0
        
        for message in messages:
            message_lower = message.lower()
            formal_score = sum(1 for indicator in formal_indicators if indicator in message_lower)
            casual_score = sum(1 for indicator in casual_indicators if indicator in message_lower)
            
            if formal_score > casual_score:
                formal_count += 1
            elif casual_score > formal_score:
                casual_count += 1
        
        if total_messages == 0:
            return 0.6  # 기본값
        
        return (formal_count + 0.5 * (total_messages - formal_count - casual_count)) / total_messages
    
    def _analyze_directness(self, messages: List[str]) -> float:
        """직설성 정도 분석"""
        direct_indicators = [
            "결론부터", "명확히", "직접적으로", "솔직히", "분명히",
            "확실히", "단적으로", "핵심은"
        ]
        
        indirect_indicators = [
            "조심스럽게", "개인적으로", "혹시", "참고로", "가능성",
            "어쩌면", "아마도", "정도"
        ]
        
        direct_count = 0
        indirect_count = 0
        
        for message in messages:
            message_lower = message.lower()
            direct_score = sum(1 for indicator in direct_indicators if indicator in message_lower)
            indirect_score = sum(1 for indicator in indirect_indicators if indicator in message_lower)
            
            direct_count += direct_score
            indirect_count += indirect_score
        
        total_indicators = direct_count + indirect_count
        if total_indicators == 0:
            return 0.5  # 기본값
        
        return direct_count / total_indicators
    
    def _analyze_detail_preference(self, messages: List[str]) -> float:
        """세부사항 선호도 분석"""
        detail_indicators = [
            "구체적으로", "세부적으로", "자세히", "상세히", "정확히",
            "명세", "사양", "규격", "수치", "데이터"
        ]
        
        high_level_indicators = [
            "전반적으로", "개괄적으로", "요약하면", "핵심만", "간단히",
            "전체적으로", "대략", "개요"
        ]
        
        avg_length = sum(len(message) for message in messages) / len(messages) if messages else 50
        
        detail_count = 0
        high_level_count = 0
        
        for message in messages:
            message_lower = message.lower()
            detail_score = sum(1 for indicator in detail_indicators if indicator in message_lower)
            high_level_score = sum(1 for indicator in high_level_indicators if indicator in message_lower)
            
            detail_count += detail_score
            high_level_count += high_level_score
        
        # 메시지 길이도 고려
        length_factor = min(avg_length / 100, 1.0)
        
        total_indicators = detail_count + high_level_count
        if total_indicators == 0:
            return length_factor
        
        preference_score = detail_count / total_indicators
        return 0.7 * preference_score + 0.3 * length_factor
    
    def _analyze_emotion_expression(self, messages: List[str]) -> float:
        """감정 표현 정도 분석"""
        emotion_indicators = [
            "기쁘", "우려", "걱정", "확신", "믿", "희망", "실망",
            "만족", "불안", "안심", "감사", "죄송", "미안"
        ]
        
        neutral_indicators = [
            "판단", "분석", "검토", "확인", "평가", "고려",
            "적용", "진행", "실행", "완료"
        ]
        
        emotion_count = 0
        neutral_count = 0
        
        for message in messages:
            message_lower = message.lower()
            emotion_score = sum(1 for indicator in emotion_indicators if indicator in message_lower)
            neutral_score = sum(1 for indicator in neutral_indicators if indicator in message_lower)
            
            emotion_count += emotion_score
            neutral_count += neutral_score
        
        total_indicators = emotion_count + neutral_count
        if total_indicators == 0:
            return 0.3  # 기본값 (낮은 감정 표현)
        
        return emotion_count / total_indicators
    
    def _analyze_logic_pattern(self, messages: List[str]) -> str:
        """논리 패턴 분석"""
        patterns = {
            "deductive": ["원칙적으로", "일반적으로", "기본적으로", "표준에 따라"],
            "inductive": ["사례를 보면", "경험상", "실제로", "과거에"],
            "analytical": ["분석하면", "데이터에 따르면", "수치상", "통계적으로"],
            "narrative": ["과정을 보면", "순서대로", "단계별로", "흐름상"]
        }
        
        pattern_scores = {pattern: 0 for pattern in patterns}
        
        for message in messages:
            message_lower = message.lower()
            for pattern, indicators in patterns.items():
                score = sum(1 for indicator in indicators if indicator in message_lower)
                pattern_scores[pattern] += score
        
        return max(pattern_scores, key=pattern_scores.get) if any(pattern_scores.values()) else "analytical"
    
    def _analyze_vocabulary_level(self, messages: List[str]) -> str:
        """어휘 수준 분석"""
        technical_terms = [
            "시공", "설계", "구조", "기술", "공법", "품질", "안전", "관리",
            "시스템", "프로세스", "성능", "효율", "최적화"
        ]
        
        formal_terms = [
            "귀하", "검토", "제안", "협의", "승인", "결정", "진행",
            "완료", "확인", "보고", "계획", "실행"
        ]
        
        business_terms = [
            "비용", "수익", "투자", "예산", "계약", "성과", "결과",
            "목표", "전략", "방향", "정책", "방침"
        ]
        
        technical_count = 0
        formal_count = 0
        business_count = 0
        
        for message in messages:
            message_lower = message.lower()
            technical_count += sum(1 for term in technical_terms if term in message_lower)
            formal_count += sum(1 for term in formal_terms if term in message_lower)
            business_count += sum(1 for term in business_terms if term in message_lower)
        
        max_count = max(technical_count, formal_count, business_count)
        
        if max_count == technical_count:
            return "technical"
        elif max_count == business_count:
            return "business"
        else:
            return "formal"
    
    def _analyze_communication_style(self, messages: List[str]) -> str:
        """소통 스타일 분석"""
        styles = {
            "authoritative": ["지시", "명령", "결정", "승인", "지정"],
            "collaborative": ["협의", "상의", "함께", "공동", "협력"],
            "methodical": ["순서", "단계", "체계", "절차", "과정"],
            "empathetic": ["이해", "배려", "고려", "염려", "걱정"]
        }
        
        style_scores = {style: 0 for style in styles}
        
        for message in messages:
            message_lower = message.lower()
            for style, indicators in styles.items():
                score = sum(1 for indicator in indicators if indicator in message_lower)
                style_scores[style] += score
        
        return max(style_scores, key=style_scores.get) if any(style_scores.values()) else "collaborative"
    
    def _analyze_decision_approach(self, messages: List[str]) -> str:
        """의사결정 접근방식 분석"""
        approaches = {
            "risk_averse": ["신중", "조심", "안전", "보수", "확실"],
            "data_driven": ["데이터", "분석", "수치", "근거", "객관"],
            "thorough_analysis": ["검토", "분석", "평가", "조사", "연구"],
            "consensus_building": ["의견", "합의", "동의", "협의", "조율"],
            "outcome_focused": ["결과", "성과", "목표", "달성", "완료"]
        }
        
        approach_scores = {approach: 0 for approach in approaches}
        
        for message in messages:
            message_lower = message.lower()
            for approach, indicators in approaches.items():
                score = sum(1 for indicator in indicators if indicator in message_lower)
                approach_scores[approach] += score
        
        return max(approach_scores, key=approach_scores.get) if any(approach_scores.values()) else "data_driven"
    
    def personalize_message(
        self,
        base_message: str,
        recipient_style: PersonaStyle,
        context: Dict[str, Any] = None
    ) -> str:
        """메시지 개인화"""
        
        # 1. 격식성 조정
        formalized_message = self._adjust_formality(base_message, recipient_style.formality_level)
        
        # 2. 직설성 조정
        directness_adjusted = self._adjust_directness(formalized_message, recipient_style.directness)
        
        # 3. 세부사항 조정
        detail_adjusted = self._adjust_detail_level(directness_adjusted, recipient_style.detail_preference)
        
        # 4. 감정 표현 조정
        emotion_adjusted = self._adjust_emotion_expression(detail_adjusted, recipient_style.emotion_expression)
        
        # 5. 어휘 수준 조정
        vocabulary_adjusted = self._adjust_vocabulary(emotion_adjusted, recipient_style.vocabulary_level)
        
        # 6. 논리 패턴 조정
        logic_adjusted = self._adjust_logic_pattern(vocabulary_adjusted, recipient_style.logic_pattern)
        
        # 7. 컨텍스트 적응
        if context:
            context_adapted = self._apply_context_adaptation(logic_adjusted, context)
        else:
            context_adapted = logic_adjusted
        
        return context_adapted
    
    def _adjust_formality(self, message: str, formality_level: float) -> str:
        """격식성 수준 조정"""
        if formality_level >= 0.8:
            pattern_key = "very_formal"
        elif formality_level >= 0.6:
            pattern_key = "formal"
        elif formality_level >= 0.4:
            pattern_key = "semi_formal"
        else:
            pattern_key = "casual"
        
        patterns = self.style_patterns["formality_levels"][pattern_key]
        
        # 간단한 패턴 치환
        replacements = {
            "제안합니다": patterns[2] if len(patterns) > 2 else "제안합니다",
            "확인하세요": patterns[4] if len(patterns) > 4 else "확인하세요",
            "고려하세요": patterns[5] if len(patterns) > 5 else "고려하세요"
        }
        
        adjusted_message = message
        for old, new in replacements.items():
            adjusted_message = adjusted_message.replace(old, new)
        
        return adjusted_message
    
    def _adjust_directness(self, message: str, directness_level: float) -> str:
        """직설성 정도 조정"""
        if directness_level >= 0.8:
            pattern_key = "very_direct"
        elif directness_level >= 0.6:
            pattern_key = "direct"
        elif directness_level >= 0.4:
            pattern_key = "moderate"
        else:
            pattern_key = "indirect"
        
        patterns = self.style_patterns["directness_levels"][pattern_key]
        
        # 문장 시작 부분에 적절한 표현 추가
        if not any(pattern in message for pattern in patterns):
            intro_phrase = patterns[0] if patterns else ""
            if intro_phrase and not message.startswith(tuple(patterns)):
                message = f"{intro_phrase}, {message.lower()}"
        
        return message
    
    def _adjust_detail_level(self, message: str, detail_preference: float) -> str:
        """세부사항 수준 조정"""
        if detail_preference >= 0.7:
            # 세부사항 추가
            detail_phrases = [
                "(구체적으로)", "(세부적으로)", "(정확히)", "(상세히)"
            ]
            
            # 숫자나 데이터 근처에 세부 표현 추가
            import re
            number_pattern = r'(\d+[%점위원])'
            
            def add_detail(match):
                return f"{match.group(1)} {detail_phrases[0]}"
            
            message = re.sub(number_pattern, add_detail, message, count=2)
        
        elif detail_preference <= 0.3:
            # 간결하게 만들기
            summary_phrases = ["요약하면", "핵심은", "간단히 말해"]
            if not any(phrase in message for phrase in summary_phrases):
                message = f"요약하면, {message}"
        
        return message
    
    def _adjust_emotion_expression(self, message: str, emotion_level: float) -> str:
        """감정 표현 정도 조정"""
        if emotion_level >= 0.7:
            pattern_key = "high"
        elif emotion_level >= 0.5:
            pattern_key = "moderate"
        elif emotion_level >= 0.3:
            pattern_key = "low"
        else:
            pattern_key = "minimal"
        
        patterns = self.style_patterns["emotion_expression"][pattern_key]
        
        # 감정 표현 패턴 치환
        neutral_to_emotional = {
            "적절합니다": patterns[0] if len(patterns) > 0 else "적절합니다",
            "필요합니다": patterns[1] if len(patterns) > 1 else "필요합니다",
            "추천합니다": patterns[3] if len(patterns) > 3 else "추천합니다"
        }
        
        adjusted_message = message
        for neutral, emotional in neutral_to_emotional.items():
            if neutral in adjusted_message:
                adjusted_message = adjusted_message.replace(neutral, emotional)
        
        return adjusted_message
    
    def _adjust_vocabulary(self, message: str, vocabulary_level: str) -> str:
        """어휘 수준 조정"""
        vocabulary_mapping = {
            "technical": {
                "방법": "기술적 방법론",
                "과정": "프로세스",
                "결과": "성과 지표",
                "문제": "기술적 이슈"
            },
            "business": {
                "결과": "비즈니스 성과",
                "계획": "전략적 계획",
                "문제": "경영 과제",
                "방법": "솔루션"
            },
            "formal": {
                "방법": "방안",
                "결과": "성과",
                "문제": "과제",
                "계획": "방침"
            }
        }
        
        if vocabulary_level in vocabulary_mapping:
            mappings = vocabulary_mapping[vocabulary_level]
            for simple, advanced in mappings.items():
                message = message.replace(simple, advanced)
        
        return message
    
    def _adjust_logic_pattern(self, message: str, logic_pattern: str) -> str:
        """논리 패턴 조정"""
        logic_connectors = {
            "deductive": ["원칙적으로", "기본적으로", "일반론으로는"],
            "inductive": ["실례를 들면", "경험상", "사례를 보면"],
            "analytical": ["분석 결과", "데이터상", "수치적으로"],
            "narrative": ["과정을 살펴보면", "단계별로", "순차적으로"],
            "goal_oriented": ["목표 관점에서", "성과 중심으로", "결과적으로"]
        }
        
        connectors = logic_connectors.get(logic_pattern, ["종합적으로"])
        
        # 논리 연결어가 없으면 추가
        if not any(connector in message for patterns in logic_connectors.values() for connector in patterns):
            message = f"{connectors[0]}, {message}"
        
        return message
    
    def _apply_context_adaptation(self, message: str, context: Dict[str, Any]) -> str:
        """컨텍스트 적응 적용"""
        if context.get("urgency") == "high":
            if not message.startswith(("긴급", "즉시", "우선")):
                message = f"긴급히 검토가 필요한 사안으로, {message}"
        
        if context.get("sensitivity") == "high":
            diplomatic_phrases = ["신중히 고려한 결과", "세심한 검토를 통해"]
            if not any(phrase in message for phrase in diplomatic_phrases):
                message = f"신중히 고려한 결과, {message}"
        
        if context.get("audience") == "external":
            if not message.startswith("말씀드리겠습니다"):
                message = f"말씀드리겠습니다. {message}"
        
        return message
    
    def generate_personalized_variants(
        self,
        base_message: str,
        recipient_styles: List[PersonaStyle],
        context: Dict[str, Any] = None
    ) -> List[str]:
        """개인화된 메시지 변형들 생성"""
        variants = []
        
        for style in recipient_styles:
            personalized = self.personalize_message(base_message, style, context)
            variants.append(personalized)
        
        return variants
    
    def learn_from_feedback(self, message_id: str, feedback: Dict[str, Any]):
        """피드백을 통한 학습"""
        if message_id not in self.personalization_history:
            self.personalization_history[message_id] = []
        
        self.personalization_history[message_id].append({
            "timestamp": datetime.now(),
            "feedback": feedback,
            "effectiveness_score": feedback.get("effectiveness", 0.5)
        })
        
        # 학습 로직 (향후 구현)
        self._update_personalization_rules(feedback)
    
    def _update_personalization_rules(self, feedback: Dict[str, Any]):
        """개인화 규칙 업데이트"""
        # 피드백 기반 규칙 개선 로직
        # 실제 구현에서는 머신러닝 모델 업데이트 등이 필요
        pass


# 테스트 함수
def test_personalization_engine():
    """개인화 엔진 테스트"""
    engine = MessagePersonalizationEngine()
    
    # 테스트 메시지
    base_message = "시공사 선정 결과를 말씀드립니다. 삼성물산이 최적의 선택입니다. 기술력과 재무안정성이 우수합니다."
    
    # 다양한 페르소나 테스트
    personas = ["conservative_executive", "progressive_manager", "detail_oriented_analyst"]
    
    for persona_name in personas:
        persona = engine.persona_templates[persona_name]
        personalized = engine.personalize_message(base_message, persona)
        
        print(f"\n=== {persona_name} 스타일 ===")
        print(f"원본: {base_message}")
        print(f"개인화: {personalized}")


if __name__ == "__main__":
    test_personalization_engine() 