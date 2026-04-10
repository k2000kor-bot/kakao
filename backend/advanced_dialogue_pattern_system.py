#!/usr/bin/env python3
"""
고급 대화 패턴 시스템 v1.0
- 21가지 대화 유형 완전 구현
- 문맥 기반 지능형 메시지 생성
- 상황별 최적 대화 전략 자동 선택
- 실시간 대화 흐름 분석 및 적응
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional, Tuple
import json
import re
from datetime import datetime
import logging
from collections import defaultdict, deque
import numpy as np

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="고급 대화 패턴 시스템", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 데이터 모델들 ====================

class DialogueRequest(BaseModel):
    """대화 요청"""
    input_message: str
    conversation_context: List[str] = []
    target_dialogue_type: Optional[str] = None
    intensity_level: int = 3  # 1-5
    contextual_factors: Dict[str, Any] = {}
    relationship_dynamic: str = "neutral"  # formal, casual, hostile, friendly

class ContextualMessage(BaseModel):
    """문맥 기반 메시지"""
    message_id: str
    generated_message: str
    dialogue_type: str
    contextual_analysis: Dict[str, Any]
    linguistic_features: List[str]
    effectiveness_prediction: float
    alternative_responses: List[Dict[str, str]]
    generation_reasoning: str

# ==================== 핵심 시스템 ====================

class AdvancedDialogueSystem:
    """고급 대화 패턴 시스템"""
    
    def __init__(self):
        self.dialogue_patterns = self._initialize_dialogue_patterns()
        self.contextual_analyzers = self._initialize_contextual_analyzers()
        self.linguistic_frameworks = self._initialize_linguistic_frameworks()
        self.conversation_memory = deque(maxlen=50)
    
    def _initialize_dialogue_patterns(self) -> Dict[str, Any]:
        """21가지 대화 패턴 초기화"""
        
        return {
            # 1. 반문 (Counter-question)
            "counter_question": {
                "description": "상대의 주장에 질문을 던져 되묻는 방식",
                "intensity_patterns": {
                    1: {
                        "structure": "그런데 {question}는 어떻게 생각하시나요?",
                        "triggers": ["궁금한 점이", "혹시", "어떻게 생각"],
                        "tone": "curious_mild"
                    },
                    2: {
                        "structure": "{point}에 대해서는 {counter_point}가 아닐까요?",
                        "triggers": ["그런데", "하지만", "반면에"],
                        "tone": "questioning_moderate"
                    },
                    3: {
                        "structure": "정말로 {assumption}이라고 확신하시나요? {evidence_question}",
                        "triggers": ["정말로", "확신", "근거가"],
                        "tone": "challenging_direct"
                    },
                    4: {
                        "structure": "{claim}라고 하셨는데, 그렇다면 {logical_challenge}는 어떻게 설명하시겠습니까?",
                        "triggers": ["그렇다면", "어떻게 설명", "논리적으로"],
                        "tone": "confrontational_logical"
                    },
                    5: {
                        "structure": "과연 {controversial_point}라는 주장이 현실적으로 가능하다고 보십니까? {sharp_counter}",
                        "triggers": ["과연", "현실적으로", "가능하다고"],
                        "tone": "aggressive_challenging"
                    }
                },
                "contextual_variations": {
                    "formal_business": "검토가 필요한 부분이 있는데, {question}에 대한 견해는 어떠신지요?",
                    "casual_friendly": "그런데 말이야, {question}는 어떻게 생각해?",
                    "hostile_confrontational": "{assumption}라고? 그럼 {challenge}는 뭐로 설명할 거야?"
                }
            },
            
            # 2. 반대 (Opposition)
            "opposition": {
                "description": "명확하게 의견을 거부하거나 부정",
                "intensity_patterns": {
                    1: {
                        "structure": "죄송하지만 {point}에 대해서는 다른 견해를 가지고 있습니다",
                        "triggers": ["죄송하지만", "다른 견해", "동의하기 어렵습니다"],
                        "tone": "polite_disagreement"
                    },
                    2: {
                        "structure": "{claim}에 대해서는 반대 의견입니다. {reason} 때문입니다",
                        "triggers": ["반대 의견", "동의할 수 없습니다", "문제가 있습니다"],
                        "tone": "firm_disagreement"
                    },
                    3: {
                        "structure": "그 의견은 받아들일 수 없습니다. {strong_reason}",
                        "triggers": ["받아들일 수 없습니다", "반대합니다", "잘못된"],
                        "tone": "strong_opposition"
                    },
                    4: {
                        "structure": "{claim}는 완전히 잘못된 판단입니다! {emphatic_reason}",
                        "triggers": ["완전히 잘못", "절대 안됩니다", "말도 안됩니다"],
                        "tone": "emphatic_rejection"
                    },
                    5: {
                        "structure": "그런 {negative_characterization}는 절대 용납할 수 없습니다! {absolute_rejection}",
                        "triggers": ["절대 용납할 수 없습니다", "터무니없는", "황당한"],
                        "tone": "absolute_opposition"
                    }
                }
            },
            
            # 3. 동조 (Agreement)
            "agreement": {
                "description": "상대 의견에 동의하거나 지지",
                "intensity_patterns": {
                    1: {
                        "structure": "말씀하신 내용에 어느 정도 동의합니다",
                        "triggers": ["어느 정도", "일리가 있습니다", "맞는 부분이"],
                        "tone": "cautious_agreement"
                    },
                    2: {
                        "structure": "{point}에 대해서는 동의합니다. {supporting_reason}",
                        "triggers": ["동의합니다", "맞습니다", "좋은 지적"],
                        "tone": "clear_agreement"
                    },
                    3: {
                        "structure": "완전히 동의합니다! {enthusiastic_support}",
                        "triggers": ["완전히 동의", "정확한 지적", "절대적으로"],
                        "tone": "enthusiastic_agreement"
                    },
                    4: {
                        "structure": "정말 훌륭한 의견입니다! {strong_endorsement}",
                        "triggers": ["훌륭한", "탁월한", "완벽한"],
                        "tone": "strong_endorsement"
                    },
                    5: {
                        "structure": "이보다 더 정확한 분석은 없을 것입니다! {absolute_support}",
                        "triggers": ["더 정확한", "완벽한", "이보다 더"],
                        "tone": "absolute_endorsement"
                    }
                }
            },
            
            # 4. 응호 (Defense)
            "defense": {
                "description": "특정 입장이나 대상을 적극적으로 옹호",
                "intensity_patterns": {
                    1: {
                        "structure": "{target}에 대해 변호하자면, {mild_defense}",
                        "triggers": ["변호하자면", "공정하게 말하면", "객관적으로"],
                        "tone": "measured_defense"
                    },
                    2: {
                        "structure": "{target}는 {positive_qualities}하기 때문에 옹호할 가치가 있습니다",
                        "triggers": ["옹호할 가치", "정당한", "합리적인"],
                        "tone": "active_defense"
                    },
                    3: {
                        "structure": "{target}에 대한 비판은 부당합니다! {strong_defense}",
                        "triggers": ["부당합니다", "불공정한", "근거 없는"],
                        "tone": "strong_defense"
                    },
                    4: {
                        "structure": "{target}를 공격하는 것은 용납할 수 없습니다! {passionate_defense}",
                        "triggers": ["용납할 수 없습니다", "공격하는 것은", "부당한"],
                        "tone": "passionate_defense"
                    },
                    5: {
                        "structure": "{target}는 절대적으로 옳습니다! {absolute_defense}",
                        "triggers": ["절대적으로", "의심의 여지없이", "완벽하게"],
                        "tone": "absolute_defense"
                    }
                }
            },
            
            # 5. 비난 (Criticism)
            "criticism": {
                "description": "강하게 부정적 평가나 공격",
                "intensity_patterns": {
                    1: {
                        "structure": "{target}에 대해 우려스러운 점이 있습니다. {mild_criticism}",
                        "triggers": ["우려스러운", "문제가 될 수 있는", "개선이 필요한"],
                        "tone": "constructive_criticism"
                    },
                    2: {
                        "structure": "{target}의 {problematic_aspect}는 심각한 문제입니다",
                        "triggers": ["심각한 문제", "잘못된", "부적절한"],
                        "tone": "direct_criticism"
                    },
                    3: {
                        "structure": "{target}의 행동은 용납할 수 없습니다! {strong_criticism}",
                        "triggers": ["용납할 수 없습니다", "비판받아야", "책임져야"],
                        "tone": "strong_criticism"
                    },
                    4: {
                        "structure": "{target}는 {harsh_characterization}입니다! {severe_criticism}",
                        "triggers": ["무책임한", "부도덕한", "파렴치한"],
                        "tone": "harsh_criticism"
                    },
                    5: {
                        "structure": "{target}는 {extreme_negative}의 극치입니다! {devastating_criticism}",
                        "triggers": ["극치입니다", "최악의", "터무니없는"],
                        "tone": "devastating_criticism"
                    }
                }
            },
            
            # 6. 중립 (Neutral)
            "neutral": {
                "description": "감정이나 입장 없이 상황만 설명",
                "intensity_patterns": {
                    1: {
                        "structure": "{situation}에 대한 현재 상황은 {objective_description}입니다",
                        "triggers": ["현재 상황", "객관적으로", "사실상"],
                        "tone": "objective_reporting"
                    },
                    2: {
                        "structure": "{facts}라는 것이 확인되었습니다",
                        "triggers": ["확인되었습니다", "파악되었습니다", "보고되었습니다"],
                        "tone": "factual_reporting"
                    },
                    3: {
                        "structure": "관련 정보를 종합하면 {comprehensive_facts}",
                        "triggers": ["종합하면", "정리하면", "요약하면"],
                        "tone": "analytical_summary"
                    },
                    4: {
                        "structure": "데이터에 따르면 {data_driven_facts}",
                        "triggers": ["데이터에 따르면", "통계적으로", "수치상"],
                        "tone": "data_driven"
                    },
                    5: {
                        "structure": "객관적 분석 결과 {detailed_analysis}",
                        "triggers": ["객관적 분석", "과학적 검토", "체계적 조사"],
                        "tone": "scientific_analysis"
                    }
                }
            },
            
            # 7. 회피 (Avoidance)
            "avoidance": {
                "description": "명확한 입장을 회피하거나 대화를 흐림",
                "intensity_patterns": {
                    1: {
                        "structure": "그 부분에 대해서는 좀 더 생각해봐야 할 것 같습니다",
                        "triggers": ["생각해봐야", "검토가 필요", "판단하기 어려운"],
                        "tone": "cautious_delay"
                    },
                    2: {
                        "structure": "여러 가지 측면이 있어서 섣불리 말씀드리기 어렵네요",
                        "triggers": ["여러 가지 측면", "복잡한", "단순하지 않은"],
                        "tone": "complexity_excuse"
                    },
                    3: {
                        "structure": "그것보다는 {topic_change}에 대해 이야기해보는 게 어떨까요?",
                        "triggers": ["그것보다는", "대신", "다른 이야기"],
                        "tone": "topic_redirection"
                    },
                    4: {
                        "structure": "지금은 그런 이야기를 할 때가 아닌 것 같은데요",
                        "triggers": ["지금은 아닌", "때가 아닌", "적절하지 않은"],
                        "tone": "timing_excuse"
                    },
                    5: {
                        "structure": "그런 민감한 주제는 공개적으로 논의하기 부적절합니다",
                        "triggers": ["민감한", "부적절한", "공개적으로"],
                        "tone": "complete_avoidance"
                    }
                }
            },
            
            # 8. 풍자 (Sarcasm)
            "sarcasm": {
                "description": "비꼬거나 간접적으로 비판",
                "intensity_patterns": {
                    1: {
                        "structure": "참 {ironic_praise}네요",
                        "triggers": ["참 흥미롭네요", "놀랍네요", "인상적이네요"],
                        "tone": "mild_irony"
                    },
                    2: {
                        "structure": "정말 {sarcastic_compliment}한 {approach}네요",
                        "triggers": ["정말 독창적인", "창의적인", "혁신적인"],
                        "tone": "clear_sarcasm"
                    },
                    3: {
                        "structure": "와, {exaggerated_praise}! 정말 {ironic_admiration}",
                        "triggers": ["와 대단해", "정말 놀라워", "천재적이야"],
                        "tone": "obvious_sarcasm"
                    },
                    4: {
                        "structure": "물론이죠! {obvious_contradiction}하니까 {sarcastic_agreement}",
                        "triggers": ["물론이죠", "당연하죠", "그럼요"],
                        "tone": "heavy_sarcasm"
                    },
                    5: {
                        "structure": "아, 그래요? {extreme_sarcasm} 정말 {devastating_irony}",
                        "triggers": ["아 그래요", "정말요", "대박이네요"],
                        "tone": "cutting_sarcasm"
                    }
                }
            },
            
            # 9. 공감 (Empathy)
            "empathy": {
                "description": "상대 감정을 이해하고 수용",
                "intensity_patterns": {
                    1: {
                        "structure": "{person}님의 마음을 이해할 수 있을 것 같습니다",
                        "triggers": ["이해할 수 있을", "마음을", "입장에서"],
                        "tone": "gentle_understanding"
                    },
                    2: {
                        "structure": "그런 상황이시라면 정말 {emotion}스러우셨을 것 같아요",
                        "triggers": ["그런 상황", "정말", "스러우셨을"],
                        "tone": "emotional_validation"
                    },
                    3: {
                        "structure": "충분히 이해됩니다. 저도 {shared_experience}",
                        "triggers": ["충분히 이해", "저도", "같은 경험"],
                        "tone": "personal_connection"
                    },
                    4: {
                        "structure": "정말 마음이 아픕니다. {deep_empathy}",
                        "triggers": ["마음이 아픕니다", "가슴이", "안타깝습니다"],
                        "tone": "deep_empathy"
                    },
                    5: {
                        "structure": "함께 아파하며 {absolute_solidarity}",
                        "triggers": ["함께 아파", "동감합니다", "마음 깊이"],
                        "tone": "profound_empathy"
                    }
                }
            },
            
            # 10. 제안 (Suggestion)
            "suggestion": {
                "description": "해결책이나 대안을 제시",
                "intensity_patterns": {
                    1: {
                        "structure": "혹시 {gentle_suggestion}는 어떨까요?",
                        "triggers": ["혹시", "어떨까요", "생각해보시면"],
                        "tone": "tentative_suggestion"
                    },
                    2: {
                        "structure": "{solution}을 제안드리고 싶습니다",
                        "triggers": ["제안드리고", "권해드리고", "추천하고"],
                        "tone": "clear_proposal"
                    },
                    3: {
                        "structure": "반드시 {important_action}을 고려해보셔야 합니다",
                        "triggers": ["반드시", "꼭", "고려해보셔야"],
                        "tone": "strong_recommendation"
                    },
                    4: {
                        "structure": "즉시 {urgent_action}해야 합니다!",
                        "triggers": ["즉시", "당장", "지금 바로"],
                        "tone": "urgent_directive"
                    },
                    5: {
                        "structure": "{critical_action} 외에는 다른 선택이 없습니다!",
                        "triggers": ["외에는 없습니다", "유일한 방법", "마지막 기회"],
                        "tone": "absolute_imperative"
                    }
                }
            },
            
            # 11. 질문 (Questioning)
            "questioning": {
                "description": "정보를 얻거나 의문을 던짐",
                "intensity_patterns": {
                    1: {
                        "structure": "{topic}에 대해 궁금한 점이 있는데요",
                        "triggers": ["궁금한 점", "여쭤보고 싶은", "알고 싶은"],
                        "tone": "polite_inquiry"
                    },
                    2: {
                        "structure": "{specific_question}인지 확인하고 싶습니다",
                        "triggers": ["확인하고 싶습니다", "알아보고 싶습니다", "파악하고 싶습니다"],
                        "tone": "direct_inquiry"
                    },
                    3: {
                        "structure": "꼭 알아야 할 것이 있습니다. {important_question}",
                        "triggers": ["꼭 알아야", "중요한 질문", "반드시"],
                        "tone": "pressing_inquiry"
                    },
                    4: {
                        "structure": "도대체 {frustrated_question}인지 모르겠습니다!",
                        "triggers": ["도대체", "대체", "왜"],
                        "tone": "frustrated_questioning"
                    },
                    5: {
                        "structure": "답변하시지 않으면 {consequence}! {demanding_question}",
                        "triggers": ["답변하시지 않으면", "대답해야", "말씀하셔야"],
                        "tone": "demanding_interrogation"
                    }
                }
            },
            
            # 12. 무시 (Ignoring)
            "ignoring": {
                "description": "반응하지 않거나 대화를 거부",
                "intensity_patterns": {
                    1: {
                        "structure": "다른 이야기를 해보죠",
                        "triggers": ["다른 이야기", "주제를 바꿔서", "대신"],
                        "tone": "polite_deflection"
                    },
                    2: {
                        "structure": "그런 이야기는 넘어가고요",
                        "triggers": ["넘어가고", "패스하고", "건너뛰고"],
                        "tone": "clear_dismissal"
                    },
                    3: {
                        "structure": "그딴 건 관심 없고요",
                        "triggers": ["관심 없고", "상관없고", "알 바 아니고"],
                        "tone": "open_dismissal"
                    },
                    4: {
                        "structure": "듣고 싶지 않습니다",
                        "triggers": ["듣고 싶지 않습니다", "관심 없습니다", "필요 없습니다"],
                        "tone": "explicit_rejection"
                    },
                    5: {
                        "structure": "그런 헛소리 집어치우세요",
                        "triggers": ["헛소리", "집어치우세요", "그만하세요"],
                        "tone": "hostile_dismissal"
                    }
                }
            },
            
            # 13. 강조 (Emphasis)
            "emphasis": {
                "description": "특정 사실이나 의견을 부각",
                "intensity_patterns": {
                    1: {
                        "structure": "{point}라는 점을 강조하고 싶습니다",
                        "triggers": ["강조하고 싶습니다", "중요한 점은", "주목할 점은"],
                        "tone": "polite_emphasis"
                    },
                    2: {
                        "structure": "분명히 말씀드리는데, {clear_point}",
                        "triggers": ["분명히", "확실히", "명확히"],
                        "tone": "clear_emphasis"
                    },
                    3: {
                        "structure": "반드시 기억하셔야 할 것은 {important_point}입니다!",
                        "triggers": ["반드시", "꼭", "절대적으로"],
                        "tone": "strong_emphasis"
                    },
                    4: {
                        "structure": "이것만은 확실합니다! {absolute_point}",
                        "triggers": ["이것만은 확실", "틀림없이", "의심의 여지없이"],
                        "tone": "emphatic_certainty"
                    },
                    5: {
                        "structure": "천하에 이보다 확실한 것은 없습니다! {ultimate_point}",
                        "triggers": ["천하에", "이보다 확실한", "절대적으로"],
                        "tone": "ultimate_emphasis"
                    }
                }
            },
            
            # 14. 추측 (Speculation)
            "speculation": {
                "description": "확실하지 않은 의견을 조심스럽게 제시",
                "intensity_patterns": {
                    1: {
                        "structure": "혹시 {tentative_idea}일 수도 있을 것 같은데요",
                        "triggers": ["혹시", "일 수도", "것 같은데"],
                        "tone": "cautious_speculation"
                    },
                    2: {
                        "structure": "아마도 {probable_scenario}인 것 같습니다",
                        "triggers": ["아마도", "것 같습니다", "추정됩니다"],
                        "tone": "moderate_speculation"
                    },
                    3: {
                        "structure": "{educated_guess}일 가능성이 높습니다",
                        "triggers": ["가능성이 높습니다", "확률이 큽니다", "예상됩니다"],
                        "tone": "confident_speculation"
                    },
                    4: {
                        "structure": "거의 확실하게 {strong_prediction}일 것입니다",
                        "triggers": ["거의 확실", "틀림없이", "분명히"],
                        "tone": "strong_prediction"
                    },
                    5: {
                        "structure": "100% {absolute_prediction}입니다!",
                        "triggers": ["100%", "절대적으로", "의심의 여지없이"],
                        "tone": "absolute_prediction"
                    }
                }
            },
            
            # 15. 감정적 호소 (Emotional appeal)
            "emotional_appeal": {
                "description": "논리보다 감정에 기반해 설득",
                "intensity_patterns": {
                    1: {
                        "structure": "{person}님의 마음을 헤아려 보시면 {gentle_appeal}",
                        "triggers": ["마음을 헤아려", "감정을 생각해", "입장에서"],
                        "tone": "gentle_emotional_appeal"
                    },
                    2: {
                        "structure": "정말 {emotional_adjective}하지 않으신가요? {emotional_reason}",
                        "triggers": ["정말", "하지 않으신가요", "마음이"],
                        "tone": "direct_emotional_appeal"
                    },
                    3: {
                        "structure": "가슴이 찢어지는 {tragic_situation}을 보고도 {emotional_challenge}!",
                        "triggers": ["가슴이", "마음이", "보고도"],
                        "tone": "dramatic_appeal"
                    },
                    4: {
                        "structure": "이런 {heartbreaking_situation}를 외면할 수 있습니까?! {passionate_plea}",
                        "triggers": ["외면할 수", "있습니까", "어떻게"],
                        "tone": "passionate_appeal"
                    },
                    5: {
                        "structure": "천벌을 받을 {extreme_situation}! {desperate_plea}",
                        "triggers": ["천벌을", "극한의", "절망적인"],
                        "tone": "desperate_appeal"
                    }
                }
            },
            
            # 16. 조롱 (Mockery)
            "mockery": {
                "description": "상대를 비웃거나 깎아내림",
                "intensity_patterns": {
                    1: {
                        "structure": "그런 생각도 있을 수 있겠네요",
                        "triggers": ["그런 생각도", "있을 수", "겠네요"],
                        "tone": "subtle_condescension"
                    },
                    2: {
                        "structure": "참 {mocking_adjective}한 발상이네요",
                        "triggers": ["참", "한 발상", "이네요"],
                        "tone": "open_mockery"
                    },
                    3: {
                        "structure": "하하, {ridiculous_idea}라니! 정말 {mocking_comment}",
                        "triggers": ["하하", "라니", "정말"],
                        "tone": "laughing_mockery"
                    },
                    4: {
                        "structure": "웃기지도 않는 {stupid_idea}! {harsh_mockery}",
                        "triggers": ["웃기지도 않는", "바보같은", "말도 안되는"],
                        "tone": "harsh_ridicule"
                    },
                    5: {
                        "structure": "어이없는 {pathetic_attempt}! {devastating_mockery}",
                        "triggers": ["어이없는", "한심한", "우스꽝스러운"],
                        "tone": "devastating_ridicule"
                    }
                }
            },
            
            # 17. 명령 (Directive)
            "directive": {
                "description": "지시하거나 강제하는 어투",
                "intensity_patterns": {
                    1: {
                        "structure": "{action}해주시기 바랍니다",
                        "triggers": ["해주시기 바랍니다", "부탁드립니다", "요청합니다"],
                        "tone": "polite_request"
                    },
                    2: {
                        "structure": "{action}하셔야 합니다",
                        "triggers": ["하셔야", "해야", "필요합니다"],
                        "tone": "firm_instruction"
                    },
                    3: {
                        "structure": "반드시 {action}하십시오!",
                        "triggers": ["반드시", "꼭", "즉시"],
                        "tone": "strong_command"
                    },
                    4: {
                        "structure": "당장 {action}하라고 했습니다!",
                        "triggers": ["당장", "하라고", "지금"],
                        "tone": "forceful_order"
                    },
                    5: {
                        "structure": "{action}하지 않으면 {consequence}!",
                        "triggers": ["하지 않으면", "안 하면", "거부하면"],
                        "tone": "threatening_ultimatum"
                    }
                }
            },
            
            # 18. 강압 (Coercion)
            "coercion": {
                "description": "위협, 압박을 통해 상대를 설득",
                "intensity_patterns": {
                    1: {
                        "structure": "{action}하시는 게 좋을 것 같은데요",
                        "triggers": ["좋을 것 같은데", "권하고 싶습니다", "추천드립니다"],
                        "tone": "subtle_pressure"
                    },
                    2: {
                        "structure": "{action}하지 않으시면 {mild_consequence}할 수도 있습니다",
                        "triggers": ["하지 않으시면", "않으면", "거절하시면"],
                        "tone": "implied_threat"
                    },
                    3: {
                        "structure": "선택의 여지가 없습니다. {action}해야 합니다",
                        "triggers": ["선택의 여지", "다른 방법", "어쩔 수 없이"],
                        "tone": "limited_options"
                    },
                    4: {
                        "structure": "{action}하지 않으면 {serious_consequence}하겠습니다!",
                        "triggers": ["하지 않으면", "않으면", "거부하면"],
                        "tone": "explicit_threat"
                    },
                    5: {
                        "structure": "마지막 경고입니다! {action} 아니면 {severe_consequence}!",
                        "triggers": ["마지막 경고", "최후 통첩", "더 이상"],
                        "tone": "ultimate_threat"
                    }
                }
            },
            
            # 19. 강제 (Forcefulness)
            "forcefulness": {
                "description": "선택권을 주지 않고 특정 행동을 요구",
                "intensity_patterns": {
                    1: {
                        "structure": "{action}하는 것이 당연합니다",
                        "triggers": ["당연합니다", "마땅합니다", "해야 하는"],
                        "tone": "moral_obligation"
                    },
                    2: {
                        "structure": "다른 선택은 없습니다. {action}하세요",
                        "triggers": ["다른 선택", "유일한", "오직"],
                        "tone": "no_alternative"
                    },
                    3: {
                        "structure": "거부할 권리는 없습니다! {action}하십시오!",
                        "triggers": ["거부할 권리", "권한이", "자격이"],
                        "tone": "denied_refusal"
                    },
                    4: {
                        "structure": "무조건 {action}해야 합니다! 예외는 없습니다!",
                        "triggers": ["무조건", "예외는 없습니다", "절대적으로"],
                        "tone": "absolute_requirement"
                    },
                    5: {
                        "structure": "의무입니다! {action}하지 않을 수 없습니다!",
                        "triggers": ["의무입니다", "할 수 없습니다", "강제입니다"],
                        "tone": "compulsory_force"
                    }
                }
            },
            
            # 20. 세뇌 (Brainwashing)
            "brainwashing": {
                "description": "장기간 반복·왜곡으로 판단력을 마비시킴",
                "intensity_patterns": {
                    1: {
                        "structure": "계속 생각해보시면 {subtle_influence}를 깨달으실 겁니다",
                        "triggers": ["계속 생각해보시면", "깨달으실", "알게 되실"],
                        "tone": "gradual_influence"
                    },
                    2: {
                        "structure": "모든 사람들이 {repeated_message}라고 합니다. 당신도 그렇게 생각하게 될 겁니다",
                        "triggers": ["모든 사람", "다들", "당신도"],
                        "tone": "social_conditioning"
                    },
                    3: {
                        "structure": "진실은 {distorted_reality}입니다. 다른 것들은 모두 거짓입니다",
                        "triggers": ["진실은", "다른 것들은", "모두 거짓"],
                        "tone": "reality_distortion"
                    },
                    4: {
                        "structure": "당신의 기존 생각은 모두 잘못된 것입니다. {new_belief}만이 옳습니다",
                        "triggers": ["기존 생각", "모두 잘못", "만이 옳습니다"],
                        "tone": "belief_replacement"
                    },
                    5: {
                        "structure": "저항하지 마세요. {absolute_control}를 받아들이는 것이 유일한 길입니다",
                        "triggers": ["저항하지", "받아들이는", "유일한 길"],
                        "tone": "total_control"
                    }
                }
            },
            
            # 21. 가스라이팅 (Gaslighting)
            "gaslighting": {
                "description": "상대의 현실 인식을 부정하거나 조작해 혼란을 유도",
                "intensity_patterns": {
                    1: {
                        "structure": "그런 일은 없었던 것 같은데요?",
                        "triggers": ["없었던 것 같은데", "기억이 잘못", "착각이신"],
                        "tone": "memory_questioning"
                    },
                    2: {
                        "structure": "당신이 잘못 이해하신 것 같아요. 실제로는 {alternative_reality}",
                        "triggers": ["잘못 이해", "실제로는", "사실은"],
                        "tone": "reality_revision"
                    },
                    3: {
                        "structure": "너무 예민하게 받아들이시는 것 아닌가요? {dismissive_explanation}",
                        "triggers": ["너무 예민", "과민반응", "민감하게"],
                        "tone": "emotional_invalidation"
                    },
                    4: {
                        "structure": "그런 말씀을 하시다니 정말 {character_attack}. {reality_denial}",
                        "triggers": ["정말", "믿을 수 없는", "이상한"],
                        "tone": "character_undermining"
                    },
                    5: {
                        "structure": "완전히 망상에 빠지셨네요. {total_denial} 정신과 치료를 받아보세요",
                        "triggers": ["망상에", "정신과", "치료를"],
                        "tone": "sanity_questioning"
                    }
                }
            }
        }
    
    def _initialize_contextual_analyzers(self) -> Dict[str, Any]:
        """문맥 분석기 초기화"""
        
        return {
            "conversation_flow_analyzer": {
                "patterns": {
                    "escalating": "대화가 점점 격해지는 패턴",
                    "de_escalating": "대화가 진정되는 패턴", 
                    "circular": "같은 주제로 돌고 도는 패턴",
                    "tangential": "주제가 계속 바뀌는 패턴",
                    "building": "논리가 단계적으로 쌓이는 패턴"
                }
            },
            "emotional_state_detector": {
                "indicators": {
                    "anger": ["화나", "짜증", "분노", "열받", "!"],
                    "sadness": ["슬프", "우울", "마음", "아프", "ㅠ"],
                    "fear": ["무서", "걱정", "불안", "두려", "염려"],
                    "joy": ["기쁘", "좋", "행복", "즐거", "ㅎㅎ"],
                    "surprise": ["놀라", "깜짝", "어?", "헉", "와"],
                    "disgust": ["역겨", "싫", "불쾌", "더러", "웩"]
                }
            },
            "power_dynamic_analyzer": {
                "hierarchies": {
                    "superior_to_subordinate": ["지시", "명령", "해라", "하라"],
                    "subordinate_to_superior": ["죄송", "실례", "부탁", "여쭤"],
                    "peer_to_peer": ["함께", "같이", "우리", "서로"],
                    "formal_distance": ["귀하", "선생님", "께서", "하십시오"],
                    "informal_closeness": ["너", "야", "해", "자"]
                }
            },
            "topic_sensitivity_detector": {
                "sensitive_topics": {
                    "high": ["정치", "종교", "성별", "인종", "개인사"],
                    "medium": ["돈", "직업", "나이", "외모", "성적"],
                    "low": ["날씨", "음식", "취미", "영화", "스포츠"]
                }
            }
        }
    
    def _initialize_linguistic_frameworks(self) -> Dict[str, Any]:
        """언어학적 프레임워크 초기화"""
        
        return {
            "register_variations": {
                "ultra_formal": {
                    "endings": ["습니다", "하겠습니다", "드립니다", "하옵니다"],
                    "vocabulary": ["귀하", "께서", "모시고", "여쭙다"],
                    "honorifics": ["선생님", "님", "께", "하시다"]
                },
                "formal": {
                    "endings": ["합니다", "해요", "이에요", "예요"],
                    "vocabulary": ["당신", "분", "하시다", "계시다"],
                    "honorifics": ["씨", "님", "분", "하세요"]
                },
                "informal": {
                    "endings": ["해", "야", "다", "지"],
                    "vocabulary": ["너", "얘", "쟤", "하다"],
                    "honorifics": []
                },
                "casual": {
                    "endings": ["함", "임", "ㅇㅇ", "ㅋㅋ"],
                    "vocabulary": ["걍", "막", "진짜", "완전"],
                    "honorifics": []
                }
            },
            "rhetorical_devices": {
                "metaphor": "은유를 통한 비유적 표현",
                "hyperbole": "과장법을 통한 강조",
                "irony": "반어법을 통한 역설적 표현", 
                "repetition": "반복법을 통한 강조",
                "parallelism": "대조법을 통한 균형",
                "rhetorical_question": "의문법을 통한 강조"
            },
            "discourse_markers": {
                "addition": ["그리고", "또한", "더욱이", "게다가"],
                "contrast": ["하지만", "그러나", "반면에", "그럼에도"],
                "causation": ["왜냐하면", "따라서", "그러므로", "결과적으로"],
                "exemplification": ["예를 들어", "즉", "다시 말해", "구체적으로"],
                "emphasis": ["특히", "무엇보다", "중요한 것은", "강조하면"]
            }
        }
    
    def analyze_context(self, input_message: str, conversation_history: List[str]) -> Dict[str, Any]:
        """종합적 문맥 분석"""
        
        context_analysis = {
            "emotional_state": self._detect_emotional_state(input_message),
            "conversation_flow": self._analyze_conversation_flow(conversation_history),
            "power_dynamics": self._analyze_power_dynamics(input_message),
            "topic_sensitivity": self._detect_topic_sensitivity(input_message),
            "linguistic_register": self._detect_linguistic_register(input_message),
            "implicit_intent": self._detect_implicit_intent(input_message),
            "cultural_context": self._analyze_cultural_context(input_message)
        }
        
        return context_analysis
    
    def _detect_emotional_state(self, message: str) -> Dict[str, float]:
        """감정 상태 감지"""
        
        emotions = {emotion: 0.0 for emotion in self.contextual_analyzers["emotional_state_detector"]["indicators"]}
        
        for emotion, indicators in self.contextual_analyzers["emotional_state_detector"]["indicators"].items():
            for indicator in indicators:
                if indicator in message:
                    emotions[emotion] += 1.0
        
        # 정규화
        total = sum(emotions.values())
        if total > 0:
            emotions = {k: v/total for k, v in emotions.items()}
        
        return emotions
    
    def _analyze_conversation_flow(self, history: List[str]) -> str:
        """대화 흐름 분석"""
        
        if len(history) < 2:
            return "initial"
        
        # 간단한 흐름 분석 (실제로는 더 복잡한 NLP 분석 필요)
        recent_messages = history[-3:]
        
        # 감정 강도 증가 패턴 확인
        intensity_indicators = ["!", "?", "정말", "완전", "절대"]
        intensity_scores = []
        
        for msg in recent_messages:
            score = sum(1 for indicator in intensity_indicators if indicator in msg)
            intensity_scores.append(score)
        
        if len(intensity_scores) >= 2:
            if intensity_scores[-1] > intensity_scores[-2]:
                return "escalating"
            elif intensity_scores[-1] < intensity_scores[-2]:
                return "de_escalating"
        
        return "stable"
    
    def _analyze_power_dynamics(self, message: str) -> str:
        """권력 관계 분석"""
        
        for dynamic, indicators in self.contextual_analyzers["power_dynamic_analyzer"]["hierarchies"].items():
            if any(indicator in message for indicator in indicators):
                return dynamic
        
        return "neutral"
    
    def _detect_topic_sensitivity(self, message: str) -> str:
        """주제 민감도 감지"""
        
        for level, topics in self.contextual_analyzers["topic_sensitivity_detector"]["sensitive_topics"].items():
            if any(topic in message for topic in topics):
                return level
        
        return "low"
    
    def _detect_linguistic_register(self, message: str) -> str:
        """언어 격식 수준 감지"""
        
        for register, features in self.linguistic_frameworks["register_variations"].items():
            score = 0
            for feature_type, feature_list in features.items():
                score += sum(1 for feature in feature_list if feature in message)
            
            if score > 0:
                return register
        
        return "neutral"
    
    def _detect_implicit_intent(self, message: str) -> str:
        """암시적 의도 감지"""
        
        # 간단한 의도 분류 (실제로는 더 정교한 NLP 분석 필요)
        intent_patterns = {
            "request_help": ["도와", "부탁", "도움", "요청"],
            "express_dissatisfaction": ["불만", "문제", "잘못", "화"],
            "seek_information": ["궁금", "알고 싶", "질문", "?"],
            "express_agreement": ["동의", "맞", "좋", "그래"],
            "express_disagreement": ["반대", "안", "아니", "틀렸"],
            "make_suggestion": ["제안", "어떨까", "하면", "추천"],
            "express_emotion": ["기쁘", "슬프", "화", "좋"]
        }
        
        for intent, indicators in intent_patterns.items():
            if any(indicator in message for indicator in indicators):
                return intent
        
        return "general_communication"
    
    def _analyze_cultural_context(self, message: str) -> Dict[str, Any]:
        """문화적 맥락 분석"""
        
        cultural_indicators = {
            "hierarchy_awareness": ["선배", "후배", "상사", "부하", "어른", "나이"],
            "group_harmony": ["화합", "조화", "단결", "함께", "우리", "모두"],
            "face_saving": ["체면", "명예", "자존심", "위신", "품격"],
            "indirect_communication": ["돌려서", "에둘러", "암시", "넌지시"],
            "formality_emphasis": ["격식", "예의", "예절", "정중", "공손"]
        }
        
        detected_contexts = {}
        for context, indicators in cultural_indicators.items():
            score = sum(1 for indicator in indicators if indicator in message)
            if score > 0:
                detected_contexts[context] = score
        
        return detected_contexts
    
    def generate_contextual_response(self, request: DialogueRequest) -> ContextualMessage:
        """문맥 기반 응답 생성"""
        
        # 1. 문맥 분석
        context_analysis = self.analyze_context(request.input_message, request.conversation_context)
        
        # 2. 최적 대화 유형 선택
        if request.target_dialogue_type:
            dialogue_type = request.target_dialogue_type
        else:
            dialogue_type = self._select_optimal_dialogue_type(context_analysis, request.input_message)
        
        # 3. 메시지 생성
        generated_message = self._generate_message_with_context(
            dialogue_type, 
            request.intensity_level,
            context_analysis,
            request.input_message,
            request.relationship_dynamic
        )
        
        # 4. 언어학적 특징 추출
        linguistic_features = self._extract_linguistic_features(generated_message)
        
        # 5. 효과성 예측
        effectiveness = self._predict_effectiveness(generated_message, context_analysis)
        
        # 6. 대안 응답 생성
        alternatives = self._generate_alternative_responses(dialogue_type, request.intensity_level, context_analysis)
        
        # 7. 생성 근거 설명
        reasoning = self._explain_generation_reasoning(dialogue_type, context_analysis, request.intensity_level)
        
        message_id = f"ctx_msg_{len(self.conversation_memory)+1}"
        
        response = ContextualMessage(
            message_id=message_id,
            generated_message=generated_message,
            dialogue_type=dialogue_type,
            contextual_analysis=context_analysis,
            linguistic_features=linguistic_features,
            effectiveness_prediction=effectiveness,
            alternative_responses=alternatives,
            generation_reasoning=reasoning
        )
        
        # 대화 기억에 저장
        self.conversation_memory.append({
            "input": request.input_message,
            "output": generated_message,
            "context": context_analysis,
            "type": dialogue_type
        })
        
        return response
    
    def _select_optimal_dialogue_type(self, context_analysis: Dict[str, Any], input_message: str) -> str:
        """최적 대화 유형 자동 선택"""
        
        implicit_intent = context_analysis["implicit_intent"]
        emotional_state = max(context_analysis["emotional_state"].items(), key=lambda x: x[1])[0]
        conversation_flow = context_analysis["conversation_flow"]
        
        # 문맥 기반 대화 유형 매핑
        type_mapping = {
            ("express_dissatisfaction", "anger"): "criticism",
            ("express_agreement", "joy"): "agreement",
            ("express_disagreement", "anger"): "opposition",
            ("request_help", "sadness"): "empathy",
            ("seek_information", "neutral"): "questioning",
            ("make_suggestion", "neutral"): "suggestion",
            ("express_emotion", "sadness"): "empathy"
        }
        
        # 기본 매핑 확인
        key = (implicit_intent, emotional_state)
        if key in type_mapping:
            return type_mapping[key]
        
        # 대화 흐름 기반 조정
        if conversation_flow == "escalating":
            if "공정" in input_message or "불공정" in input_message:
                return "defense"
            else:
                return "counter_question"
        elif conversation_flow == "de_escalating":
            return "empathy"
        
        # 입력 메시지 키워드 기반 분류
        if any(word in input_message for word in ["왜", "어떻게", "?"]):
            return "counter_question"
        elif any(word in input_message for word in ["동의", "맞다", "좋다"]):
            return "agreement"
        elif any(word in input_message for word in ["반대", "틀렸다", "안된다"]):
            return "opposition"
        elif any(word in input_message for word in ["문제", "잘못", "비판"]):
            return "criticism"
        
        return "neutral"  # 기본값
    
    def _generate_message_with_context(self, dialogue_type: str, intensity: int, 
                                     context: Dict[str, Any], input_message: str,
                                     relationship_dynamic: str) -> str:
        """문맥을 고려한 메시지 생성"""
        
        pattern = self.dialogue_patterns[dialogue_type]["intensity_patterns"][intensity]
        
        # 기본 구조 가져오기
        structure = pattern["structure"]
        
        # 관계 역학에 따른 조정
        if relationship_dynamic == "formal_business":
            structure = self._adjust_for_formal_context(structure)
        elif relationship_dynamic == "casual_friendly":
            structure = self._adjust_for_casual_context(structure)
        elif relationship_dynamic == "hostile":
            structure = self._adjust_for_hostile_context(structure)
        
        # 입력 메시지에서 핵심 요소 추출
        extracted_elements = self._extract_key_elements(input_message)
        
        # 템플릿 변수 채우기
        filled_message = self._fill_template_variables(structure, extracted_elements, context, dialogue_type)
        
        # 문화적 맥락 적용
        final_message = self._apply_cultural_context(filled_message, context["cultural_context"])
        
        return final_message
    
    def _adjust_for_formal_context(self, structure: str) -> str:
        """격식적 맥락에 맞게 조정"""
        
        formal_replacements = {
            "그런데": "그런데 말씀드리면",
            "어떻게": "어떻게 생각하시는지요",
            "정말": "정말로",
            "!": ".",
            "?": "지요?"
        }
        
        for old, new in formal_replacements.items():
            structure = structure.replace(old, new)
        
        return structure
    
    def _adjust_for_casual_context(self, structure: str) -> str:
        """친근한 맥락에 맞게 조정"""
        
        casual_replacements = {
            "습니다": "해요",
            "하십시오": "해요",
            "드립니다": "해요",
            "께서": "이",
            "하시나요": "해요"
        }
        
        for old, new in casual_replacements.items():
            structure = structure.replace(old, new)
        
        return structure
    
    def _adjust_for_hostile_context(self, structure: str) -> str:
        """적대적 맥락에 맞게 조정"""
        
        hostile_adjustments = {
            "말씀하신": "당신이 말한",
            "생각하시나요": "생각하는 거야",
            "어떨까요": "어떨까",
            "하시겠습니까": "할 거야"
        }
        
        for old, new in hostile_adjustments.items():
            structure = structure.replace(old, new)
        
        return structure
    
    def _extract_key_elements(self, input_message: str) -> Dict[str, str]:
        """입력 메시지에서 핵심 요소 추출"""
        
        elements = {}
        
        # 주체 추출
        subjects = ["삼성", "조합원", "시공사", "업체", "회사"]
        for subject in subjects:
            if subject in input_message:
                elements["target"] = subject
                break
        
        # 행동/주장 추출
        if "허가 불가" in input_message:
            elements["claim"] = "허가 불가라고 주장하는 것"
            elements["action"] = "허가를 거부하는 행위"
        
        # 문제점 추출
        if "공정 경쟁이 아닙니다" in input_message:
            elements["problem"] = "공정성 부족"
            elements["issue"] = "불공정한 경쟁 환경"
        
        # 감정 표현 추출
        if "지켜보고 있습니다" in input_message:
            elements["emotional_context"] = "모든 사람이 주시하고 있는 상황"
        
        return elements
    
    def _fill_template_variables(self, structure: str, elements: Dict[str, str], 
                               context: Dict[str, Any], dialogue_type: str) -> str:
        """템플릿 변수 채우기"""
        
        # 기본 변수들
        variables = {
            "target": elements.get("target", "해당 업체"),
            "claim": elements.get("claim", "그 주장"),
            "problem": elements.get("problem", "이 문제"),
            "point": elements.get("issue", "이 사안"),
            "person": "조합원"
        }
        
        # 대화 유형별 특수 변수
        if dialogue_type == "counter_question":
            variables.update({
                "question": "그런 기준이 정말 공정한지",
                "counter_point": "모든 업체에게 동등한 기회가 주어져야 하는 것",
                "assumption": "그런 방식이 올바르다고",
                "evidence_question": "그 근거는 무엇인가요?"
            })
        elif dialogue_type == "opposition":
            variables.update({
                "reason": "공정한 경쟁 원칙에 위배되기",
                "strong_reason": "명백히 불공정한 처사입니다"
            })
        elif dialogue_type == "empathy":
            variables.update({
                "emotion": "답답하고 불안",
                "shared_experience": "같은 마음입니다"
            })
        
        # 변수 치환
        result = structure
        for var, value in variables.items():
            placeholder = "{" + var + "}"
            if placeholder in result:
                result = result.replace(placeholder, value)
        
        return result
    
    def _apply_cultural_context(self, message: str, cultural_context: Dict[str, Any]) -> str:
        """문화적 맥락 적용"""
        
        if "hierarchy_awareness" in cultural_context:
            # 계층 의식 강화
            message = message.replace("당신", "귀하")
            message = message.replace("해요", "합니다")
        
        if "group_harmony" in cultural_context:
            # 집단 조화 강조
            if "우리" not in message:
                message = "우리 모두가 " + message
        
        if "face_saving" in cultural_context:
            # 체면 고려
            message = message.replace("틀렸습니다", "다른 견해를 가지고 있습니다")
            message = message.replace("잘못", "개선이 필요한 부분")
        
        return message
    
    def _extract_linguistic_features(self, message: str) -> List[str]:
        """언어학적 특징 추출"""
        
        features = []
        
        # 수사법 확인
        if "?" in message:
            features.append("의문법")
        if "!" in message:
            features.append("감탄법")
        if any(word in message for word in ["마치", "같은", "처럼"]):
            features.append("은유법")
        if any(word in message for word in ["절대", "완전", "정말"]):
            features.append("과장법")
        
        # 담화 표지 확인
        if any(marker in message for marker in ["그런데", "하지만", "그러나"]):
            features.append("대조표현")
        if any(marker in message for marker in ["왜냐하면", "따라서", "그러므로"]):
            features.append("인과표현")
        
        # 높임법 확인
        if any(ending in message for ending in ["습니다", "하겠습니다"]):
            features.append("격식체")
        if any(ending in message for ending in ["해요", "이에요"]):
            features.append("준격식체")
        
        return features
    
    def _predict_effectiveness(self, message: str, context_analysis: Dict[str, Any]) -> float:
        """효과성 예측"""
        
        base_score = 0.6
        
        # 문맥 적합성
        if context_analysis["conversation_flow"] == "escalating" and "!" in message:
            base_score += 0.1
        elif context_analysis["conversation_flow"] == "de_escalating" and "." in message:
            base_score += 0.1
        
        # 감정 상태 고려
        dominant_emotion = max(context_analysis["emotional_state"].items(), key=lambda x: x[1])[0]
        if dominant_emotion == "anger" and any(word in message for word in ["이해", "공감"]):
            base_score += 0.15
        
        # 언어 격식 적합성
        register = context_analysis["linguistic_register"]
        if register == "formal" and any(ending in message for ending in ["습니다", "드립니다"]):
            base_score += 0.1
        
        # 길이 적절성
        if 30 <= len(message) <= 200:
            base_score += 0.05
        
        return min(base_score, 1.0)
    
    def _generate_alternative_responses(self, dialogue_type: str, intensity: int, 
                                      context: Dict[str, Any]) -> List[Dict[str, str]]:
        """대안 응답 생성"""
        
        alternatives = []
        
        # 강도 조절 대안
        if intensity > 1:
            alt_type = dialogue_type
            alt_intensity = intensity - 1
            alt_message = self._generate_basic_message(alt_type, alt_intensity)
            alternatives.append({
                "type": f"{alt_type}_lower_intensity",
                "message": alt_message,
                "description": "더 온화한 톤"
            })
        
        if intensity < 5:
            alt_type = dialogue_type
            alt_intensity = intensity + 1
            alt_message = self._generate_basic_message(alt_type, alt_intensity)
            alternatives.append({
                "type": f"{alt_type}_higher_intensity", 
                "message": alt_message,
                "description": "더 강한 톤"
            })
        
        # 다른 대화 유형 제안
        alternative_types = {
            "counter_question": "empathy",
            "opposition": "counter_question", 
            "criticism": "suggestion",
            "empathy": "suggestion"
        }
        
        if dialogue_type in alternative_types:
            alt_type = alternative_types[dialogue_type]
            alt_message = self._generate_basic_message(alt_type, intensity)
            alternatives.append({
                "type": alt_type,
                "message": alt_message,
                "description": f"{alt_type} 접근법"
            })
        
        return alternatives[:3]  # 최대 3개
    
    def _generate_basic_message(self, dialogue_type: str, intensity: int) -> str:
        """기본 메시지 생성 (간단 버전)"""
        
        if dialogue_type not in self.dialogue_patterns:
            return "적절한 응답을 생성할 수 없습니다."
        
        pattern = self.dialogue_patterns[dialogue_type]["intensity_patterns"][intensity]
        structure = pattern["structure"]
        
        # 기본 변수로 채우기
        basic_vars = {
            "target": "해당 업체",
            "point": "이 문제",
            "claim": "그 주장",
            "person": "조합원",
            "question": "정말 그런지",
            "reason": "적절하지 않기 때문"
        }
        
        result = structure
        for var, value in basic_vars.items():
            placeholder = "{" + var + "}"
            result = result.replace(placeholder, value)
        
        return result
    
    def _explain_generation_reasoning(self, dialogue_type: str, context: Dict[str, Any], 
                                    intensity: int) -> str:
        """생성 근거 설명"""
        
        reasoning_parts = []
        
        # 대화 유형 선택 근거
        reasoning_parts.append(f"'{dialogue_type}' 유형 선택")
        
        # 문맥 분석 근거
        dominant_emotion = max(context["emotional_state"].items(), key=lambda x: x[1])[0]
        reasoning_parts.append(f"감정 상태: {dominant_emotion}")
        
        reasoning_parts.append(f"대화 흐름: {context['conversation_flow']}")
        
        # 강도 선택 근거
        reasoning_parts.append(f"강도 {intensity} 적용")
        
        # 문화적 맥락 고려
        if context["cultural_context"]:
            cultural_factors = list(context["cultural_context"].keys())
            reasoning_parts.append(f"문화적 맥락: {', '.join(cultural_factors[:2])}")
        
        return " | ".join(reasoning_parts)

# ==================== 전역 인스턴스 ====================

advanced_dialogue_system = AdvancedDialogueSystem()

# ==================== API 엔드포인트들 ====================

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "system": "고급 대화 패턴 시스템",
        "version": "1.0.0",
        "dialogue_types": list(advanced_dialogue_system.dialogue_patterns.keys()),
        "features": [
            "🎭 21가지 대화 유형 완전 구현",
            "🧠 문맥 기반 지능형 분석",
            "🎯 상황별 최적 전략 자동 선택",
            "📊 실시간 효과성 예측",
            "🔄 다양한 대안 응답 제공"
        ],
        "capabilities": {
            "dialogue_types": 21,
            "intensity_levels": 5,
            "contextual_factors": 7,
            "linguistic_features": "무제한",
            "cultural_adaptation": "한국어 특화"
        }
    }

@app.post("/generate-contextual-response")
async def generate_contextual_response(request: DialogueRequest):
    """문맥 기반 응답 생성"""
    
    try:
        response = advanced_dialogue_system.generate_contextual_response(request)
        
        return {
            "success": True,
            "message": "문맥 기반 응답이 성공적으로 생성되었습니다.",
            "result": response.dict()
        }
    except Exception as e:
        logger.error(f"응답 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dialogue-types")
async def get_dialogue_types():
    """사용 가능한 대화 유형 목록"""
    
    types_info = {}
    for type_name, type_data in advanced_dialogue_system.dialogue_patterns.items():
        types_info[type_name] = {
            "description": type_data["description"],
            "intensity_levels": list(type_data["intensity_patterns"].keys()),
            "sample_triggers": type_data["intensity_patterns"][3]["triggers"][:3]
        }
    
    return {
        "dialogue_types": types_info,
        "total_types": len(types_info)
    }

@app.post("/analyze-context")
async def analyze_context_only(context_request: Dict[str, Any]):
    """문맥 분석만 수행"""
    
    try:
        input_message = context_request.get("input_message", "")
        conversation_history = context_request.get("conversation_history", [])
        
        analysis = advanced_dialogue_system.analyze_context(input_message, conversation_history)
        
        return {
            "success": True,
            "context_analysis": analysis,
            "recommended_dialogue_type": advanced_dialogue_system._select_optimal_dialogue_type(analysis, input_message)
        }
    except Exception as e:
        logger.error(f"문맥 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 데모용 엔드포인트
@app.post("/demo/comprehensive-dialogue-test")
async def comprehensive_dialogue_demo():
    """종합적 대화 패턴 데모"""
    
    test_scenarios = [
        {
            "input": "삼성은 경쟁사 설계에 없는 것을 이유로 '허가 불가'라고 몰아붙이는데, 이건 공정 경쟁이 아닙니다. 조합원들이 다 지켜보고 있습니다.",
            "relationship": "formal_business",
            "expected_types": ["counter_question", "opposition", "defense"]
        },
        {
            "input": "정말 화가 나네요! 이런 식으로 밀어붙이면 안 되는 거 아니에요?",
            "relationship": "casual_friendly", 
            "expected_types": ["empathy", "agreement", "suggestion"]
        },
        {
            "input": "그런 말씀을 하시니 좀 의외네요. 다른 생각은 없으신가요?",
            "relationship": "neutral",
            "expected_types": ["counter_question", "questioning", "neutral"]
        }
    ]
    
    demo_results = []
    
    for scenario in test_scenarios:
        # 각 시나리오에 대해 여러 대화 유형으로 응답 생성
        scenario_results = {
            "input_scenario": scenario["input"],
            "relationship_dynamic": scenario["relationship"],
            "responses": []
        }
        
        for dialogue_type in scenario["expected_types"]:
            for intensity in [2, 3, 4]:
                request = DialogueRequest(
                    input_message=scenario["input"],
                    target_dialogue_type=dialogue_type,
                    intensity_level=intensity,
                    relationship_dynamic=scenario["relationship"]
                )
                
                response = advanced_dialogue_system.generate_contextual_response(request)
                
                scenario_results["responses"].append({
                    "dialogue_type": dialogue_type,
                    "intensity": intensity,
                    "message": response.generated_message,
                    "effectiveness": response.effectiveness_prediction,
                    "linguistic_features": response.linguistic_features
                })
        
        demo_results.append(scenario_results)
    
    return {
        "demo_title": "고급 대화 패턴 시스템 종합 테스트",
        "total_scenarios": len(test_scenarios),
        "results": demo_results,
        "system_capabilities": {
            "dialogue_types_tested": len(set(r["dialogue_type"] for scenario in demo_results for r in scenario["responses"])),
            "total_responses_generated": sum(len(scenario["responses"]) for scenario in demo_results),
            "average_effectiveness": sum(r["effectiveness"] for scenario in demo_results for r in scenario["responses"]) / sum(len(scenario["responses"]) for scenario in demo_results)
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 고급 대화 패턴 시스템 시작!")
    print("🎭 21가지 대화 유형:")
    for i, (type_name, type_data) in enumerate(advanced_dialogue_system.dialogue_patterns.items(), 1):
        print(f"   {i:2d}. {type_name}: {type_data['description']}")
    
    _p = int(os.environ.get("ADVANCED_DIALOGUE_PATTERN_PORT", os.environ.get("PORT", "8094")))
    uvicorn.run(app, host="0.0.0.0", port=_p) 