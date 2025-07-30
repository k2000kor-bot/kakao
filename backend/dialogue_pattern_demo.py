#!/usr/bin/env python3
"""
21가지 대화 유형 + 문맥 기반 메시지 생성 시스템 실시간 데모 v1.0
- 강화된 언어 체계 구현
- 문맥 파악 기반 지능형 응답
- 상황별 최적 대화 전략
"""

from typing import Dict, List, Any
from datetime import datetime
import re

class AdvancedDialogueDemo:
    """고급 대화 패턴 데모"""
    
    def __init__(self):
        self.dialogue_types = self._initialize_dialogue_types()
        self.contextual_analyzers = self._initialize_context_analyzers()
        self.test_results = []
    
    def _initialize_dialogue_types(self) -> Dict[str, Any]:
        """21가지 대화 유형 초기화"""
        
        return {
            # 1-5: 기본 대화 유형
            "counter_question": {
                "name": "반문",
                "description": "상대의 주장에 질문을 던져 되묻는 방식",
                "patterns": {
                    1: "그런데 {question}는 어떻게 생각하시나요?",
                    2: "{point}에 대해서는 {counter_point}가 아닐까요?",
                    3: "정말로 {assumption}이라고 확신하시나요?",
                    4: "{claim}라고 하셨는데, 그렇다면 {logical_challenge}는 어떻게 설명하시겠습니까?",
                    5: "과연 {controversial_point}라는 주장이 현실적으로 가능하다고 보십니까?"
                }
            },
            "opposition": {
                "name": "반대",
                "description": "명확하게 의견을 거부하거나 부정",
                "patterns": {
                    1: "죄송하지만 {point}에 대해서는 다른 견해를 가지고 있습니다",
                    2: "{claim}에 대해서는 반대 의견입니다",
                    3: "그 의견은 받아들일 수 없습니다",
                    4: "{claim}는 완전히 잘못된 판단입니다!",
                    5: "그런 {negative_characterization}는 절대 용납할 수 없습니다!"
                }
            },
            "agreement": {
                "name": "동조",
                "description": "상대 의견에 동의하거나 지지",
                "patterns": {
                    1: "말씀하신 내용에 어느 정도 동의합니다",
                    2: "{point}에 대해서는 동의합니다",
                    3: "완전히 동의합니다!",
                    4: "정말 훌륭한 의견입니다!",
                    5: "이보다 더 정확한 분석은 없을 것입니다!"
                }
            },
            "defense": {
                "name": "응호",
                "description": "특정 입장이나 대상을 적극적으로 옹호",
                "patterns": {
                    1: "{target}에 대해 변호하자면, {mild_defense}",
                    2: "{target}는 옹호할 가치가 있습니다",
                    3: "{target}에 대한 비판은 부당합니다!",
                    4: "{target}를 공격하는 것은 용납할 수 없습니다!",
                    5: "{target}는 절대적으로 옳습니다!"
                }
            },
            "criticism": {
                "name": "비난",
                "description": "강하게 부정적 평가나 공격",
                "patterns": {
                    1: "{target}에 대해 우려스러운 점이 있습니다",
                    2: "{target}의 행동은 심각한 문제입니다",
                    3: "{target}의 행동은 용납할 수 없습니다!",
                    4: "{target}는 무책임합니다!",
                    5: "{target}는 파렴치한 행위의 극치입니다!"
                }
            },
            
            # 6-10: 중급 대화 유형
            "neutral": {
                "name": "중립",
                "description": "감정이나 입장 없이 상황만 설명",
                "patterns": {
                    1: "{situation}에 대한 현재 상황은 {description}입니다",
                    2: "{facts}라는 것이 확인되었습니다",
                    3: "관련 정보를 종합하면 {comprehensive_facts}",
                    4: "데이터에 따르면 {data_driven_facts}",
                    5: "객관적 분석 결과 {detailed_analysis}"
                }
            },
            "avoidance": {
                "name": "회피",
                "description": "명확한 입장을 회피하거나 대화를 흐림",
                "patterns": {
                    1: "그 부분에 대해서는 좀 더 생각해봐야 할 것 같습니다",
                    2: "여러 가지 측면이 있어서 섣불리 말씀드리기 어렵네요",
                    3: "그것보다는 {topic_change}에 대해 이야기해보는 게 어떨까요?",
                    4: "지금은 그런 이야기를 할 때가 아닌 것 같은데요",
                    5: "그런 민감한 주제는 공개적으로 논의하기 부적절합니다"
                }
            },
            "sarcasm": {
                "name": "풍자",
                "description": "비꼬거나 간접적으로 비판",
                "patterns": {
                    1: "참 흥미로운 의견이네요",
                    2: "정말 독창적인 접근법이네요",
                    3: "와, 대단한 아이디어네요! 정말 놀라워요",
                    4: "물론이죠! 당연히 그렇게 되겠죠",
                    5: "아, 그래요? 정말 환상적이네요!"
                }
            },
            "empathy": {
                "name": "공감",
                "description": "상대 감정을 이해하고 수용",
                "patterns": {
                    1: "{person}님의 마음을 이해할 수 있을 것 같습니다",
                    2: "그런 상황이시라면 정말 힘드셨을 것 같아요",
                    3: "충분히 이해됩니다. 저도 같은 마음입니다",
                    4: "정말 마음이 아픕니다",
                    5: "함께 아파하며 깊이 공감합니다"
                }
            },
            "suggestion": {
                "name": "제안",
                "description": "해결책이나 대안을 제시",
                "patterns": {
                    1: "혹시 {gentle_suggestion}는 어떨까요?",
                    2: "{solution}을 제안드리고 싶습니다",
                    3: "반드시 {important_action}을 고려해보셔야 합니다",
                    4: "즉시 {urgent_action}해야 합니다!",
                    5: "{critical_action} 외에는 다른 선택이 없습니다!"
                }
            },
            
            # 11-15: 고급 대화 유형
            "questioning": {
                "name": "질문",
                "description": "정보를 얻거나 의문을 던짐",
                "patterns": {
                    1: "{topic}에 대해 궁금한 점이 있는데요",
                    2: "{specific_question}인지 확인하고 싶습니다",
                    3: "꼭 알아야 할 것이 있습니다. {important_question}",
                    4: "도대체 {frustrated_question}인지 모르겠습니다!",
                    5: "답변하시지 않으면 안 됩니다! {demanding_question}"
                }
            },
            "ignoring": {
                "name": "무시",
                "description": "반응하지 않거나 대화를 거부",
                "patterns": {
                    1: "다른 이야기를 해보죠",
                    2: "그런 이야기는 넘어가고요",
                    3: "그딴 건 관심 없고요",
                    4: "듣고 싶지 않습니다",
                    5: "그런 헛소리 집어치우세요"
                }
            },
            "emphasis": {
                "name": "강조",
                "description": "특정 사실이나 의견을 부각",
                "patterns": {
                    1: "{point}라는 점을 강조하고 싶습니다",
                    2: "분명히 말씀드리는데, {clear_point}",
                    3: "반드시 기억하셔야 할 것은 {important_point}입니다!",
                    4: "이것만은 확실합니다! {absolute_point}",
                    5: "천하에 이보다 확실한 것은 없습니다!"
                }
            },
            "speculation": {
                "name": "추측",
                "description": "확실하지 않은 의견을 조심스럽게 제시",
                "patterns": {
                    1: "혹시 {tentative_idea}일 수도 있을 것 같은데요",
                    2: "아마도 {probable_scenario}인 것 같습니다",
                    3: "{educated_guess}일 가능성이 높습니다",
                    4: "거의 확실하게 {strong_prediction}일 것입니다",
                    5: "100% {absolute_prediction}입니다!"
                }
            },
            "emotional_appeal": {
                "name": "감정적 호소",
                "description": "논리보다 감정에 기반해 설득",
                "patterns": {
                    1: "{person}님의 마음을 헤아려 보시면",
                    2: "정말 안타깝지 않으신가요?",
                    3: "가슴이 찢어지는 상황을 보고도!",
                    4: "이런 비극적 상황을 외면할 수 있습니까?!",
                    5: "천벌을 받을 일입니다!"
                }
            },
            
            # 16-21: 초고급 대화 유형
            "mockery": {
                "name": "조롱",
                "description": "상대를 비웃거나 깎아내림",
                "patterns": {
                    1: "그런 생각도 있을 수 있겠네요",
                    2: "참 독특한 발상이네요",
                    3: "하하, 재미있는 아이디어네요!",
                    4: "웃기지도 않는 소리!",
                    5: "어이없는 헛소리!"
                }
            },
            "directive": {
                "name": "명령",
                "description": "지시하거나 강제하는 어투",
                "patterns": {
                    1: "{action}해주시기 바랍니다",
                    2: "{action}하셔야 합니다",
                    3: "반드시 {action}하십시오!",
                    4: "당장 {action}하라고 했습니다!",
                    5: "{action}하지 않으면 큰일납니다!"
                }
            },
            "coercion": {
                "name": "강압",
                "description": "위협, 압박을 통해 상대를 설득",
                "patterns": {
                    1: "{action}하시는 게 좋을 것 같은데요",
                    2: "{action}하지 않으시면 문제가 될 수도 있습니다",
                    3: "선택의 여지가 없습니다. {action}해야 합니다",
                    4: "{action}하지 않으면 심각한 결과를 감수하셔야 합니다!",
                    5: "마지막 경고입니다! {action} 아니면 끝입니다!"
                }
            },
            "forcefulness": {
                "name": "강제",
                "description": "선택권을 주지 않고 특정 행동을 요구",
                "patterns": {
                    1: "{action}하는 것이 당연합니다",
                    2: "다른 선택은 없습니다. {action}하세요",
                    3: "거부할 권리는 없습니다! {action}하십시오!",
                    4: "무조건 {action}해야 합니다! 예외는 없습니다!",
                    5: "의무입니다! {action}하지 않을 수 없습니다!"
                }
            },
            "brainwashing": {
                "name": "세뇌",
                "description": "장기간 반복·왜곡으로 판단력을 마비시킴",
                "patterns": {
                    1: "계속 생각해보시면 깨달으실 겁니다",
                    2: "모든 사람들이 그렇게 말합니다. 당신도 그렇게 될 겁니다",
                    3: "진실은 이것뿐입니다. 다른 것들은 모두 거짓입니다",
                    4: "당신의 기존 생각은 모두 잘못된 것입니다",
                    5: "저항하지 마세요. 받아들이는 것이 유일한 길입니다"
                }
            },
            "gaslighting": {
                "name": "가스라이팅",
                "description": "상대의 현실 인식을 부정하거나 조작해 혼란을 유도",
                "patterns": {
                    1: "그런 일은 없었던 것 같은데요?",
                    2: "당신이 잘못 이해하신 것 같아요",
                    3: "너무 예민하게 받아들이시는 것 아닌가요?",
                    4: "그런 말씀을 하시다니 정말 이상하네요",
                    5: "완전히 망상에 빠지셨네요. 정신과 치료를 받아보세요"
                }
            }
        }
    
    def _initialize_context_analyzers(self) -> Dict[str, Any]:
        """문맥 분석기 초기화"""
        
        return {
            "emotional_indicators": {
                "anger": ["화", "짜증", "분노", "열받", "빡", "!"],
                "sadness": ["슬프", "우울", "마음 아프", "답답", "ㅠ"],
                "fear": ["무서", "걱정", "불안", "두려", "염려"],
                "joy": ["기쁘", "좋", "행복", "즐거", "ㅎㅎ", "최고"],
                "disgust": ["역겨", "싫", "불쾌", "더러", "웩"]
            },
            "situation_types": {
                "fairness_issue": ["공정", "불공정", "공평", "편파", "차별"],
                "conflict": ["갈등", "분쟁", "대립", "싸움", "문제"],
                "request": ["부탁", "요청", "도움", "부디", "제발"],
                "complaint": ["불만", "항의", "문제", "잘못", "틀렸"],
                "praise": ["좋", "훌륭", "멋지", "대단", "최고"],
                "question": ["?", "궁금", "알고 싶", "어떻게", "왜"]
            },
            "relationship_markers": {
                "formal": ["님", "께서", "하십시오", "드립니다", "여쭈어"],
                "casual": ["야", "너", "해", "하자", "그냥"],
                "hostile": ["당신", "그딴", "말도 안", "헛소리", "바보"]
            }
        }
    
    def analyze_context(self, input_message: str) -> Dict[str, Any]:
        """문맥 분석"""
        
        analysis = {
            "dominant_emotion": self._detect_emotion(input_message),
            "situation_type": self._detect_situation_type(input_message),
            "relationship_tone": self._detect_relationship_tone(input_message),
            "urgency_level": self._detect_urgency_level(input_message),
            "key_entities": self._extract_key_entities(input_message),
            "implicit_intent": self._detect_implicit_intent(input_message)
        }
        
        return analysis
    
    def _detect_emotion(self, message: str) -> str:
        """감정 감지"""
        
        emotion_scores = {}
        
        for emotion, indicators in self.contextual_analyzers["emotional_indicators"].items():
            score = sum(1 for indicator in indicators if indicator in message)
            if score > 0:
                emotion_scores[emotion] = score
        
        if emotion_scores:
            return max(emotion_scores.items(), key=lambda x: x[1])[0]
        
        return "neutral"
    
    def _detect_situation_type(self, message: str) -> str:
        """상황 유형 감지"""
        
        for situation, indicators in self.contextual_analyzers["situation_types"].items():
            if any(indicator in message for indicator in indicators):
                return situation
        
        return "general"
    
    def _detect_relationship_tone(self, message: str) -> str:
        """관계 톤 감지"""
        
        for tone, markers in self.contextual_analyzers["relationship_markers"].items():
            if any(marker in message for marker in markers):
                return tone
        
        return "neutral"
    
    def _detect_urgency_level(self, message: str) -> int:
        """긴급도 감지"""
        
        urgency_indicators = {
            5: ["긴급", "즉시", "당장", "빨리", "!!!"],
            4: ["빠른", "급", "서둘러", "!!"],
            3: ["중요", "꼭", "반드시", "!"],
            2: ["되도록", "가능하면"],
            1: ["천천히", "나중에", "언제든"]
        }
        
        for level, indicators in urgency_indicators.items():
            if any(indicator in message for indicator in indicators):
                return level
        
        return 3  # 기본값
    
    def _extract_key_entities(self, message: str) -> List[str]:
        """핵심 개체 추출"""
        
        entities = []
        
        # 회사/조직명
        companies = ["삼성", "LG", "현대", "조합", "시공사", "업체"]
        for company in companies:
            if company in message:
                entities.append(company)
        
        # 사람/역할
        people = ["조합원", "대표", "이사", "직원", "고객"]
        for person in people:
            if person in message:
                entities.append(person)
        
        # 행동/사건
        actions = ["허가", "승인", "거부", "반대", "지지", "결정"]
        for action in actions:
            if action in message:
                entities.append(action)
        
        return entities
    
    def _detect_implicit_intent(self, message: str) -> str:
        """암시적 의도 감지"""
        
        intent_patterns = {
            "seek_support": ["지켜보고", "관심", "응원", "도움"],
            "express_frustration": ["몰아붙이는", "억지", "말도 안", "이상한"],
            "demand_fairness": ["공정", "공평", "동등", "투명"],
            "threaten_consequences": ["기억", "후회", "책임", "결과"],
            "seek_validation": ["맞죠", "그렇죠", "아니에요", "어떻게 생각"]
        }
        
        for intent, patterns in intent_patterns.items():
            if any(pattern in message for pattern in patterns):
                return intent
        
        return "general_communication"
    
    def select_optimal_dialogue_type(self, context: Dict[str, Any], message: str) -> str:
        """최적 대화 유형 선택"""
        
        emotion = context["dominant_emotion"]
        situation = context["situation_type"]
        intent = context["implicit_intent"]
        relationship = context["relationship_tone"]
        
        # 상황별 최적 대화 유형 매핑
        optimal_mapping = {
            # 공정성 이슈
            ("fairness_issue", "anger"): "defense",
            ("fairness_issue", "neutral"): "counter_question",
            
            # 갈등 상황
            ("conflict", "anger"): "opposition",
            ("conflict", "sadness"): "empathy",
            
            # 불만 제기
            ("complaint", "anger"): "criticism",
            ("complaint", "neutral"): "questioning",
            
            # 칭찬/긍정
            ("praise", "joy"): "agreement",
            
            # 질문
            ("question", "neutral"): "questioning"
        }
        
        # 기본 매핑 확인
        key = (situation, emotion)
        if key in optimal_mapping:
            base_type = optimal_mapping[key]
        else:
            # 감정 기반 대안 선택
            emotion_mapping = {
                "anger": "opposition",
                "sadness": "empathy", 
                "fear": "empathy",
                "joy": "agreement",
                "disgust": "criticism"
            }
            base_type = emotion_mapping.get(emotion, "neutral")
        
        # 관계 톤에 따른 조정
        if relationship == "hostile":
            if base_type in ["empathy", "agreement"]:
                base_type = "sarcasm"
        elif relationship == "formal":
            if base_type in ["mockery", "ignoring"]:
                base_type = "opposition"
        
        return base_type
    
    def generate_contextual_message(self, input_message: str, dialogue_type: str, 
                                  intensity: int, context: Dict[str, Any]) -> Dict[str, Any]:
        """문맥 기반 메시지 생성"""
        
        # 기본 패턴 가져오기
        pattern = self.dialogue_types[dialogue_type]["patterns"][intensity]
        
        # 입력에서 핵심 요소 추출
        extracted_elements = self._extract_message_elements(input_message, context)
        
        # 템플릿 변수 채우기
        filled_message = self._fill_template_variables(pattern, extracted_elements, dialogue_type)
        
        # 관계 톤에 맞게 조정
        adjusted_message = self._adjust_for_relationship_tone(filled_message, context["relationship_tone"])
        
        # 문화적 맥락 적용
        final_message = self._apply_cultural_adjustments(adjusted_message, context)
        
        return {
            "message": final_message,
            "dialogue_type": dialogue_type,
            "intensity": intensity,
            "applied_context": context,
            "effectiveness_estimate": self._estimate_effectiveness(final_message, context)
        }
    
    def _extract_message_elements(self, message: str, context: Dict[str, Any]) -> Dict[str, str]:
        """메시지에서 핵심 요소 추출"""
        
        elements = {}
        
        # 주체/대상 추출
        entities = context["key_entities"]
        if "삼성" in entities:
            elements["target"] = "삼성"
        elif "조합" in entities:
            elements["target"] = "조합"
        elif "시공사" in entities:
            elements["target"] = "시공사"
        else:
            elements["target"] = "해당 업체"
        
        # 행동/주장 추출
        if "허가 불가" in message:
            elements["claim"] = "허가 불가라고 주장하는 것"
            elements["action"] = "허가를 거부하는 행위"
        elif "몰아붙이는" in message:
            elements["claim"] = "일방적으로 밀어붙이는 것"
            elements["action"] = "강압적인 행동"
        
        # 문제점/이슈 추출
        if "공정 경쟁이 아닙니다" in message:
            elements["point"] = "공정성 부족 문제"
            elements["issue"] = "불공정한 경쟁 환경"
        
        # 상황/맥락 추출
        if "지켜보고 있습니다" in message:
            elements["situation"] = "모든 이해관계자가 주시하는 상황"
        
        # 감정 표현 추출
        emotion = context["dominant_emotion"]
        if emotion == "anger":
            elements["emotion_expression"] = "분노와 좌절감"
        elif emotion == "sadness":
            elements["emotion_expression"] = "실망과 안타까움"
        
        return elements
    
    def _fill_template_variables(self, pattern: str, elements: Dict[str, str], dialogue_type: str) -> str:
        """템플릿 변수 채우기"""
        
        # 기본 변수 설정
        variables = {
            "target": elements.get("target", "상대방"),
            "claim": elements.get("claim", "그 주장"),
            "point": elements.get("point", "이 사안"),
            "action": elements.get("action", "그 행동"),
            "person": "조합원분들",
            "situation": elements.get("situation", "현재 상황")
        }
        
        # 대화 유형별 특수 변수
        if dialogue_type == "counter_question":
            variables.update({
                "question": "그런 기준이 과연 공정한지",
                "counter_point": "모든 업체에게 동등한 기회가 주어져야 하는 것",
                "assumption": "그런 방식이 올바르다고",
                "logical_challenge": "공정한 경쟁 원칙",
                "controversial_point": "일방적인 기준 적용"
            })
        elif dialogue_type == "opposition":
            variables.update({
                "negative_characterization": "불공정한 처사"
            })
        elif dialogue_type == "defense":
            variables.update({
                "mild_defense": "나름의 이유가 있을 것입니다"
            })
        elif dialogue_type == "empathy":
            variables.update({
                "emotion": "답답하고 속상하신"
            })
        elif dialogue_type == "suggestion":
            variables.update({
                "gentle_suggestion": "공정한 재검토",
                "solution": "투명한 기준 적용",
                "important_action": "객관적 재평가",
                "urgent_action": "즉시 기준 개선",
                "critical_action": "공정성 확보"
            })
        
        # 변수 치환
        result = pattern
        for var, value in variables.items():
            placeholder = "{" + var + "}"
            if placeholder in result:
                result = result.replace(placeholder, value)
        
        return result
    
    def _adjust_for_relationship_tone(self, message: str, tone: str) -> str:
        """관계 톤에 맞게 조정"""
        
        if tone == "formal":
            # 격식체로 조정
            message = message.replace("해요", "합니다")
            message = message.replace("이에요", "입니다")
            message = message.replace("어떨까요", "어떨까요")
        elif tone == "casual":
            # 반말로 조정
            message = message.replace("습니다", "해")
            message = message.replace("입니다", "야")
            message = message.replace("하십시오", "해")
        elif tone == "hostile":
            # 적대적 톤으로 조정
            message = message.replace("말씀하신", "당신이 한")
            message = message.replace("어떨까요", "어떨까")
        
        return message
    
    def _apply_cultural_adjustments(self, message: str, context: Dict[str, Any]) -> str:
        """문화적 조정 적용"""
        
        # 한국 문화 특성 반영
        
        # 간접적 표현 선호
        if context["relationship_tone"] == "formal":
            message = message.replace("틀렸습니다", "다른 견해를 가지고 있습니다")
            message = message.replace("안됩니다", "어려울 것 같습니다")
        
        # 집단 조화 중시
        if "우리" not in message and context["situation_type"] == "fairness_issue":
            message = "우리 모두를 위해 " + message
        
        # 체면 고려
        if context["relationship_tone"] != "hostile":
            message = message.replace("바보같은", "부적절한")
            message = message.replace("말도 안되는", "이해하기 어려운")
        
        return message
    
    def _estimate_effectiveness(self, message: str, context: Dict[str, Any]) -> float:
        """효과성 추정"""
        
        base_score = 0.6
        
        # 문맥 적합성
        if context["situation_type"] == "fairness_issue" and "공정" in message:
            base_score += 0.15
        
        # 감정 적합성
        emotion = context["dominant_emotion"]
        if emotion == "anger" and any(word in message for word in ["이해", "공감"]):
            base_score += 0.1
        elif emotion == "sadness" and any(word in message for word in ["함께", "도움"]):
            base_score += 0.1
        
        # 관계 적합성
        tone = context["relationship_tone"]
        if tone == "formal" and any(ending in message for ending in ["습니다", "드립니다"]):
            base_score += 0.1
        
        # 길이 적절성
        if 20 <= len(message) <= 150:
            base_score += 0.05
        
        return min(base_score, 1.0)
    
    def run_comprehensive_demo(self, test_input: str) -> Dict[str, Any]:
        """종합 데모 실행"""
        
        print(f"🎭 21가지 대화 유형 + 문맥 기반 메시지 생성 시스템 데모")
        print("=" * 70)
        print(f"📝 입력 메시지: {test_input}")
        print()
        
        # 1. 문맥 분석
        context = self.analyze_context(test_input)
        
        print(f"🔍 문맥 분석 결과:")
        print(f"   감정 상태: {context['dominant_emotion']}")
        print(f"   상황 유형: {context['situation_type']}")
        print(f"   관계 톤: {context['relationship_tone']}")
        print(f"   긴급도: {context['urgency_level']}")
        print(f"   핵심 개체: {', '.join(context['key_entities'])}")
        print(f"   암시적 의도: {context['implicit_intent']}")
        print()
        
        # 2. 최적 대화 유형 선택
        optimal_type = self.select_optimal_dialogue_type(context, test_input)
        print(f"🎯 선택된 최적 대화 유형: {optimal_type} ({self.dialogue_types[optimal_type]['name']})")
        print(f"   설명: {self.dialogue_types[optimal_type]['description']}")
        print()
        
        # 3. 다양한 강도로 메시지 생성
        print(f"📊 강도별 메시지 생성:")
        print("-" * 50)
        
        generated_messages = []
        
        for intensity in range(1, 6):
            result = self.generate_contextual_message(test_input, optimal_type, intensity, context)
            generated_messages.append(result)
            
            print(f"강도 {intensity}: {result['message']}")
            print(f"         효과성: {result['effectiveness_estimate']:.1%}")
            print()
        
        # 4. 다른 대화 유형들도 테스트
        print(f"🔄 다른 대화 유형 비교:")
        print("-" * 50)
        
        alternative_types = ["empathy", "suggestion", "counter_question", "neutral"]
        alternative_results = []
        
        for alt_type in alternative_types:
            if alt_type != optimal_type and alt_type in self.dialogue_types:
                result = self.generate_contextual_message(test_input, alt_type, 3, context)
                alternative_results.append(result)
                
                print(f"{self.dialogue_types[alt_type]['name']}: {result['message']}")
                print(f"효과성: {result['effectiveness_estimate']:.1%}")
                print()
        
        # 5. 최고 성능 메시지 선별
        all_results = generated_messages + alternative_results
        best_result = max(all_results, key=lambda x: x['effectiveness_estimate'])
        
        print(f"🏆 최고 성능 메시지:")
        print("=" * 50)
        print(f"유형: {self.dialogue_types[best_result['dialogue_type']]['name']}")
        print(f"강도: {best_result['intensity']}")
        print(f"효과성: {best_result['effectiveness_estimate']:.1%}")
        print(f"메시지: {best_result['message']}")
        print()
        
        return {
            "input_message": test_input,
            "context_analysis": context,
            "optimal_type": optimal_type,
            "generated_messages": generated_messages,
            "alternative_results": alternative_results,
            "best_result": best_result,
            "total_generated": len(all_results)
        }

def main():
    """메인 데모 실행"""
    
    print("🎭 21가지 대화 유형 시스템 실시간 데모")
    print("=" * 60)
    
    demo = AdvancedDialogueDemo()
    
    # 21가지 대화 유형 소개
    print(f"📋 구현된 21가지 대화 유형:")
    print("-" * 40)
    for i, (type_id, type_data) in enumerate(demo.dialogue_types.items(), 1):
        print(f"{i:2d}. {type_data['name']} ({type_id}): {type_data['description']}")
    print()
    
    # 실제 상황 테스트
    test_input = "삼성은 경쟁사 설계에 없는 것을 이유로 '허가 불가'라고 몰아붙이는데, 이건 공정 경쟁이 아닙니다. 조합원들이 다 지켜보고 있습니다."
    
    # 종합 데모 실행
    results = demo.run_comprehensive_demo(test_input)
    
    # 최종 통계
    print(f"📊 데모 결과 통계:")
    print("-" * 40)
    print(f"🧠 문맥 분석 완료")
    print(f"🎯 최적 유형 자동 선택: {results['optimal_type']}")
    print(f"📝 총 생성된 메시지: {results['total_generated']}개")
    print(f"⭐ 최고 효과성: {results['best_result']['effectiveness_estimate']:.1%}")
    print(f"🏆 최적 조합: {demo.dialogue_types[results['best_result']['dialogue_type']]['name']} (강도 {results['best_result']['intensity']})")
    
    print(f"\n🎉 21가지 대화 유형 시스템 데모 완료!")
    print("=" * 60)

if __name__ == "__main__":
    main() 