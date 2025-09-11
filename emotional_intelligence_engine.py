"""
감정 지능 및 공감 능력 엔진
Emotional Intelligence and Empathy Engine
"""

import json
import time
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import re
import math

class EmotionType(Enum):
    """감정 유형"""
    JOY = "joy"
    SADNESS = "sadness"
    ANGER = "anger"
    FEAR = "fear"
    SURPRISE = "surprise"
    DISGUST = "disgust"
    ANXIETY = "anxiety"
    EXCITEMENT = "excitement"
    FRUSTRATION = "frustration"
    HOPE = "hope"
    LONELINESS = "loneliness"
    CONTENTMENT = "contentment"
    CONFUSION = "confusion"
    RELIEF = "relief"
    GUILT = "guilt"
    SHAME = "shame"
    PRIDE = "pride"
    ENVY = "envy"
    JEALOUSY = "jealousy"
    LOVE = "love"
    HATE = "hate"
    NEUTRAL = "neutral"

class EmpathyLevel(Enum):
    """공감 수준"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    DEEP = "deep"

class EmotionalIntensity(Enum):
    """감정 강도"""
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"
    INTENSE = "intense"

@dataclass
class EmotionalState:
    """감정 상태"""
    primary_emotion: EmotionType
    secondary_emotions: List[EmotionType]
    intensity: EmotionalIntensity
    confidence: float  # 0.0 - 1.0
    duration: float  # 감정 지속 시간 (초)
    triggers: List[str]  # 감정 유발 요인
    context: Dict[str, Any]  # 감정 맥락
    timestamp: datetime

@dataclass
class EmpathyResponse:
    """공감 응답"""
    empathy_level: EmpathyLevel
    emotional_validation: bool
    supportive_actions: List[str]
    emotional_mirroring: bool
    perspective_taking: bool
    emotional_support: str
    practical_advice: List[str]
    follow_up_questions: List[str]

class EmotionalIntelligenceEngine:
    """감정 지능 엔진"""
    
    def __init__(self):
        self.emotion_patterns = self._initialize_emotion_patterns()
        self.emotion_intensifiers = self._initialize_emotion_intensifiers()
        self.cultural_emotion_expressions = self._initialize_cultural_emotion_expressions()
        self.emotional_memories: Dict[str, List[EmotionalState]] = {}
        
    def _initialize_emotion_patterns(self) -> Dict[EmotionType, Dict[str, Any]]:
        """감정 패턴 초기화"""
        return {
            EmotionType.JOY: {
                "keywords": ["기뻐", "행복", "좋아", "만족", "성취", "성공", "희망", "즐거워", "신나", "웃음"],
                "patterns": [r"기분이\s+좋", r"행복해", r"즐거워", r"신나", r"웃음"],
                "intensity_indicators": ["정말", "너무", "완전", "진짜", "엄청"],
                "context_weight": 0.8
            },
            EmotionType.SADNESS: {
                "keywords": ["슬퍼", "우울", "속상", "눈물", "아픔", "힘들어", "지쳐", "절망"],
                "patterns": [r"슬퍼", r"우울해", r"속상해", r"눈물", r"힘들어", r"지쳐"],
                "intensity_indicators": ["너무", "정말", "완전", "진짜", "엄청"],
                "context_weight": 0.9
            },
            EmotionType.ANGER: {
                "keywords": ["화나", "짜증", "분노", "열받아", "빡쳐", "미워", "싫어"],
                "patterns": [r"화나", r"짜증", r"분노", r"열받아", r"빡쳐"],
                "intensity_indicators": ["너무", "정말", "완전", "진짜", "엄청", "미친"],
                "context_weight": 0.9
            },
            EmotionType.FEAR: {
                "keywords": ["무서워", "두려워", "걱정", "불안", "공포", "무서워", "겁나"],
                "patterns": [r"무서워", r"두려워", r"걱정", r"불안", r"공포"],
                "intensity_indicators": ["너무", "정말", "완전", "진짜", "엄청"],
                "context_weight": 0.8
            },
            EmotionType.ANXIETY: {
                "keywords": ["불안", "걱정", "초조", "긴장", "스트레스", "압박", "부담"],
                "patterns": [r"불안해", r"걱정돼", r"초조해", r"긴장돼", r"스트레스"],
                "intensity_indicators": ["너무", "정말", "완전", "진짜", "엄청"],
                "context_weight": 0.9
            },
            EmotionType.EXCITEMENT: {
                "keywords": ["신나", "흥분", "기대", "설레", "들뜨", "활기", "에너지"],
                "patterns": [r"신나", r"흥분돼", r"기대돼", r"설레", r"들뜨"],
                "intensity_indicators": ["정말", "너무", "완전", "진짜", "엄청"],
                "context_weight": 0.7
            },
            EmotionType.FRUSTRATION: {
                "keywords": ["답답", "짜증", "화나", "열받아", "빡쳐", "답답해", "막막해"],
                "patterns": [r"답답해", r"짜증나", r"화나", r"열받아", r"빡쳐"],
                "intensity_indicators": ["너무", "정말", "완전", "진짜", "엄청"],
                "context_weight": 0.8
            },
            EmotionType.HOPE: {
                "keywords": ["희망", "기대", "바라", "원해", "꿈", "미래", "가능성"],
                "patterns": [r"희망", r"기대돼", r"바라", r"원해", r"꿈"],
                "intensity_indicators": ["정말", "너무", "완전", "진짜", "엄청"],
                "context_weight": 0.7
            },
            EmotionType.LONELINESS: {
                "keywords": ["외로워", "쓸쓸해", "혼자", "고독", "외롭", "쓸쓸", "혼자서"],
                "patterns": [r"외로워", r"쓸쓸해", r"혼자", r"고독", r"외롭"],
                "intensity_indicators": ["너무", "정말", "완전", "진짜", "엄청"],
                "context_weight": 0.9
            },
            EmotionType.CONTENTMENT: {
                "keywords": ["만족", "괜찮아", "좋아", "편안", "평온", "안정", "만족스러워"],
                "patterns": [r"만족해", r"괜찮아", r"좋아", r"편안해", r"평온해"],
                "intensity_indicators": ["정말", "너무", "완전", "진짜", "엄청"],
                "context_weight": 0.6
            },
            EmotionType.CONFUSION: {
                "keywords": ["모르겠어", "이해가 안돼", "혼란", "복잡", "어려워", "헷갈려", "애매해"],
                "patterns": [r"모르겠어", r"이해가\s+안돼", r"혼란", r"복잡해", r"어려워"],
                "intensity_indicators": ["너무", "정말", "완전", "진짜", "엄청"],
                "context_weight": 0.8
            },
            EmotionType.RELIEF: {
                "keywords": ["다행", "안도", "편안", "안심", "해결", "끝", "완료"],
                "patterns": [r"다행", r"안도돼", r"편안해", r"안심", r"해결"],
                "intensity_indicators": ["정말", "너무", "완전", "진짜", "엄청"],
                "context_weight": 0.7
            },
            EmotionType.GUILT: {
                "keywords": ["죄송", "미안", "후회", "죄책감", "자책", "책임", "잘못"],
                "patterns": [r"죄송해", r"미안해", r"후회돼", r"죄책감", r"자책"],
                "intensity_indicators": ["너무", "정말", "완전", "진짜", "엄청"],
                "context_weight": 0.9
            },
            EmotionType.SHAME: {
                "keywords": ["부끄러워", "창피", "수치", "당황", "어색", "어려워"],
                "patterns": [r"부끄러워", r"창피해", r"수치", r"당황", r"어색해"],
                "intensity_indicators": ["너무", "정말", "완전", "진짜", "엄청"],
                "context_weight": 0.9
            },
            EmotionType.PRIDE: {
                "keywords": ["자랑", "뿌듯", "성취", "만족", "기쁘", "자신감", "확신"],
                "patterns": [r"자랑", r"뿌듯해", r"성취", r"만족해", r"기뻐"],
                "intensity_indicators": ["정말", "너무", "완전", "진짜", "엄청"],
                "context_weight": 0.7
            },
            EmotionType.ENVY: {
                "keywords": ["부러워", "질투", "시기", "선망", "아쉬워", "부럽"],
                "patterns": [r"부러워", r"질투", r"시기", r"선망", r"아쉬워"],
                "intensity_indicators": ["너무", "정말", "완전", "진짜", "엄청"],
                "context_weight": 0.8
            },
            EmotionType.JEALOUSY: {
                "keywords": ["질투", "시기", "부러워", "아쉬워", "선망", "부럽"],
                "patterns": [r"질투", r"시기", r"부러워", r"아쉬워", r"선망"],
                "intensity_indicators": ["너무", "정말", "완전", "진짜", "엄청"],
                "context_weight": 0.8
            },
            EmotionType.LOVE: {
                "keywords": ["사랑", "좋아해", "애정", "애착", "관심", "소중", "귀여워"],
                "patterns": [r"사랑해", r"좋아해", r"애정", r"애착", r"소중해"],
                "intensity_indicators": ["정말", "너무", "완전", "진짜", "엄청"],
                "context_weight": 0.8
            },
            EmotionType.HATE: {
                "keywords": ["싫어", "미워", "혐오", "증오", "거부", "반감", "악감정"],
                "patterns": [r"싫어해", r"미워해", r"혐오", r"증오", r"거부"],
                "intensity_indicators": ["너무", "정말", "완전", "진짜", "엄청"],
                "context_weight": 0.9
            }
        }
    
    def _initialize_emotion_intensifiers(self) -> Dict[str, float]:
        """감정 강화어 초기화"""
        return {
            "정말": 1.5,
            "너무": 1.4,
            "완전": 1.3,
            "진짜": 1.2,
            "엄청": 1.1,
            "조금": 0.7,
            "약간": 0.6,
            "살짝": 0.5,
            "좀": 0.8,
            "미친": 2.0,
            "개": 1.8,
            "존나": 1.7,
            "완전히": 1.3,
            "정말로": 1.5,
            "너무나": 1.4
        }
    
    def _initialize_cultural_emotion_expressions(self) -> Dict[str, List[str]]:
        """문화적 감정 표현 초기화"""
        return {
            "korean_emotional_suffixes": ["해", "돼", "야", "어", "지", "다"],
            "korean_emotional_prefixes": ["정말", "너무", "완전", "진짜", "엄청"],
            "korean_emotional_interjections": ["아", "어", "오", "우", "으", "이"],
            "korean_emotional_reduplication": ["정말정말", "너무너무", "완전완전", "진짜진짜"]
        }
    
    def analyze_emotion(self, message: str, user_id: str) -> EmotionalState:
        """감정 분석"""
        detected_emotions = []
        emotion_scores = {}
        
        # 각 감정 유형별 점수 계산
        for emotion_type, emotion_data in self.emotion_patterns.items():
            score = 0.0
            
            # 키워드 매칭
            for keyword in emotion_data["keywords"]:
                if keyword in message:
                    score += 1.0
            
            # 패턴 매칭
            for pattern in emotion_data["patterns"]:
                if re.search(pattern, message):
                    score += 2.0
            
            # 강도 지표 확인
            for intensifier in emotion_data["intensity_indicators"]:
                if intensifier in message:
                    score += 0.5
            
            # 문화적 감정 표현 확인
            for suffix in self.cultural_emotion_expressions["korean_emotional_suffixes"]:
                if message.endswith(suffix):
                    score += 0.3
            
            # 중복 표현 확인
            for reduplication in self.cultural_emotion_expressions["korean_emotional_reduplication"]:
                if reduplication in message:
                    score += 1.0
            
            if score > 0:
                emotion_scores[emotion_type] = score
                detected_emotions.append(emotion_type)
        
        # 주요 감정 결정
        if emotion_scores:
            primary_emotion = max(emotion_scores, key=emotion_scores.get)
            primary_score = emotion_scores[primary_emotion]
            
            # 보조 감정 결정 (주요 감정의 70% 이상 점수)
            secondary_emotions = [
                emotion for emotion, score in emotion_scores.items()
                if emotion != primary_emotion and score >= primary_score * 0.7
            ]
        else:
            primary_emotion = EmotionType.NEUTRAL
            secondary_emotions = []
            primary_score = 0.0
        
        # 감정 강도 계산
        intensity = self._calculate_emotional_intensity(message, primary_score)
        
        # 신뢰도 계산
        confidence = min(primary_score / 10.0, 1.0)
        
        # 감정 유발 요인 추출
        triggers = self._extract_emotional_triggers(message)
        
        # 감정 맥락 분석
        context = self._analyze_emotional_context(message, primary_emotion)
        
        return EmotionalState(
            primary_emotion=primary_emotion,
            secondary_emotions=secondary_emotions,
            intensity=intensity,
            confidence=confidence,
            duration=0.0,  # 실시간 분석이므로 0
            triggers=triggers,
            context=context,
            timestamp=datetime.now()
        )
    
    def _calculate_emotional_intensity(self, message: str, base_score: float) -> EmotionalIntensity:
        """감정 강도 계산"""
        # 기본 점수
        intensity_score = base_score
        
        # 강화어 확인
        for intensifier, multiplier in self.emotion_intensifiers.items():
            if intensifier in message:
                intensity_score *= multiplier
        
        # 구두점 확인
        exclamation_count = message.count('!')
        question_count = message.count('?')
        intensity_score += exclamation_count * 0.5
        intensity_score += question_count * 0.3
        
        # 대문자 확인
        caps_ratio = sum(1 for c in message if c.isupper()) / max(len(message), 1)
        intensity_score += caps_ratio * 2.0
        
        # 감정 강도 결정
        if intensity_score >= 8.0:
            return EmotionalIntensity.INTENSE
        elif intensity_score >= 6.0:
            return EmotionalIntensity.VERY_HIGH
        elif intensity_score >= 4.0:
            return EmotionalIntensity.HIGH
        elif intensity_score >= 2.0:
            return EmotionalIntensity.MEDIUM
        elif intensity_score >= 1.0:
            return EmotionalIntensity.LOW
        else:
            return EmotionalIntensity.VERY_LOW
    
    def _extract_emotional_triggers(self, message: str) -> List[str]:
        """감정 유발 요인 추출"""
        triggers = []
        
        # 일반적인 감정 유발 패턴
        trigger_patterns = [
            r"(\w+)\s+(때문에|덕분에|때문)",
            r"(\w+)\s+(해서|해서는|해서도)",
            r"(\w+)\s+(때문|덕분|때문에)",
            r"(\w+)\s+(때|때문|때문에)",
            r"(\w+)\s+(해서|해서는|해서도)"
        ]
        
        for pattern in trigger_patterns:
            matches = re.findall(pattern, message)
            triggers.extend([match[0] for match in matches])
        
        return list(set(triggers))
    
    def _analyze_emotional_context(self, message: str, emotion: EmotionType) -> Dict[str, Any]:
        """감정 맥락 분석"""
        context = {
            "sentence_type": "statement",
            "emotional_tone": "neutral",
            "urgency_level": "normal",
            "social_context": "individual",
            "temporal_context": "present"
        }
        
        # 문장 유형 분석
        if message.endswith('?'):
            context["sentence_type"] = "question"
        elif message.endswith('!'):
            context["sentence_type"] = "exclamation"
        
        # 감정 톤 분석
        if emotion in [EmotionType.JOY, EmotionType.EXCITEMENT, EmotionType.PRIDE]:
            context["emotional_tone"] = "positive"
        elif emotion in [EmotionType.SADNESS, EmotionType.ANGER, EmotionType.FEAR, EmotionType.ANXIETY]:
            context["emotional_tone"] = "negative"
        elif emotion in [EmotionType.CONFUSION, EmotionType.FRUSTRATION]:
            context["emotional_tone"] = "confused"
        
        # 긴급도 분석
        urgency_keywords = ["급해", "빨리", "시급", "긴급", "당장", "지금"]
        if any(keyword in message for keyword in urgency_keywords):
            context["urgency_level"] = "high"
        
        # 사회적 맥락 분석
        social_keywords = ["우리", "함께", "같이", "모두", "사람들", "친구", "가족"]
        if any(keyword in message for keyword in social_keywords):
            context["social_context"] = "group"
        
        # 시간적 맥락 분석
        past_keywords = ["했어", "했었어", "했던", "이었어", "였어"]
        future_keywords = ["할거야", "할래", "할게", "할 예정", "할 계획"]
        
        if any(keyword in message for keyword in past_keywords):
            context["temporal_context"] = "past"
        elif any(keyword in message for keyword in future_keywords):
            context["temporal_context"] = "future"
        
        return context
    
    def generate_empathy_response(self, emotional_state: EmotionalState, user_id: str) -> EmpathyResponse:
        """공감 응답 생성"""
        # 공감 수준 결정
        empathy_level = self._determine_empathy_level(emotional_state)
        
        # 감정 검증
        emotional_validation = self._validate_emotion(emotional_state)
        
        # 지지적 행동 생성
        supportive_actions = self._generate_supportive_actions(emotional_state)
        
        # 감정 반영 여부
        emotional_mirroring = self._should_mirror_emotion(emotional_state)
        
        # 관점 수용 여부
        perspective_taking = self._should_take_perspective(emotional_state)
        
        # 감정적 지지 메시지
        emotional_support = self._generate_emotional_support(emotional_state)
        
        # 실용적 조언
        practical_advice = self._generate_practical_advice(emotional_state)
        
        # 후속 질문
        follow_up_questions = self._generate_follow_up_questions(emotional_state)
        
        return EmpathyResponse(
            empathy_level=empathy_level,
            emotional_validation=emotional_validation,
            supportive_actions=supportive_actions,
            emotional_mirroring=emotional_mirroring,
            perspective_taking=perspective_taking,
            emotional_support=emotional_support,
            practical_advice=practical_advice,
            follow_up_questions=follow_up_questions
        )
    
    def _determine_empathy_level(self, emotional_state: EmotionalState) -> EmpathyLevel:
        """공감 수준 결정"""
        # 감정 강도에 따른 공감 수준
        if emotional_state.intensity in [EmotionalIntensity.INTENSE, EmotionalIntensity.VERY_HIGH]:
            return EmpathyLevel.DEEP
        elif emotional_state.intensity in [EmotionalIntensity.HIGH, EmotionalIntensity.MEDIUM]:
            return EmpathyLevel.HIGH
        elif emotional_state.intensity in [EmotionalIntensity.LOW, EmotionalIntensity.VERY_LOW]:
            return EmpathyLevel.MEDIUM
        else:
            return EmpathyLevel.LOW
    
    def _validate_emotion(self, emotional_state: EmotionalState) -> bool:
        """감정 검증"""
        # 신뢰도가 0.5 이상이면 유효한 감정으로 판단
        return emotional_state.confidence >= 0.5
    
    def _generate_supportive_actions(self, emotional_state: EmotionalState) -> List[str]:
        """지지적 행동 생성"""
        actions = []
        
        emotion = emotional_state.primary_emotion
        
        if emotion == EmotionType.SADNESS:
            actions.extend([
                "슬픔을 인정하고 공감하기",
                "위로의 말 전하기",
                "함께 울어주기",
                "힘든 시간을 견뎌낸 것에 대해 칭찬하기"
            ])
        elif emotion == EmotionType.ANGER:
            actions.extend([
                "화가 난 이유를 들어주기",
                "감정을 표현할 수 있는 안전한 공간 제공하기",
                "분노를 건설적으로 해결할 방법 제시하기"
            ])
        elif emotion == EmotionType.FEAR:
            actions.extend([
                "두려움을 인정하고 공감하기",
                "안전한 환경 제공하기",
                "단계적으로 두려움 극복하기"
            ])
        elif emotion == EmotionType.ANXIETY:
            actions.extend([
                "불안감을 인정하고 공감하기",
                "호흡법이나 명상 제안하기",
                "단계별 해결책 제시하기"
            ])
        elif emotion == EmotionType.JOY:
            actions.extend([
                "기쁨을 함께 나누기",
                "성취를 인정하고 축하하기",
                "긍정적인 에너지 유지하기"
            ])
        elif emotion == EmotionType.CONFUSION:
            actions.extend([
                "혼란을 인정하고 공감하기",
                "명확한 설명 제공하기",
                "단계별 안내 제공하기"
            ])
        
        return actions
    
    def _should_mirror_emotion(self, emotional_state: EmotionalState) -> bool:
        """감정 반영 여부 결정"""
        # 긍정적 감정은 반영, 부정적 감정은 조절
        positive_emotions = [EmotionType.JOY, EmotionType.EXCITEMENT, EmotionType.PRIDE, EmotionType.CONTENTMENT]
        return emotional_state.primary_emotion in positive_emotions
    
    def _should_take_perspective(self, emotional_state: EmotionalState) -> bool:
        """관점 수용 여부 결정"""
        # 복잡한 감정이나 혼란스러운 상황에서는 관점 수용 필요
        complex_emotions = [EmotionType.CONFUSION, EmotionType.FRUSTRATION, EmotionType.ANXIETY]
        return emotional_state.primary_emotion in complex_emotions
    
    def _generate_emotional_support(self, emotional_state: EmotionalState) -> str:
        """감정적 지지 메시지 생성"""
        emotion = emotional_state.primary_emotion
        intensity = emotional_state.intensity
        
        support_messages = {
            EmotionType.SADNESS: {
                EmotionalIntensity.VERY_LOW: "조금 슬프시군요. 괜찮으세요?",
                EmotionalIntensity.LOW: "슬픈 기분이 드시는군요. 말씀해주세요.",
                EmotionalIntensity.MEDIUM: "정말 슬프시겠어요. 함께 있어드릴게요.",
                EmotionalIntensity.HIGH: "너무 슬프시겠어요. 제가 도와드릴게요.",
                EmotionalIntensity.VERY_HIGH: "정말 힘드시겠어요. 혼자 견디지 마세요.",
                EmotionalIntensity.INTENSE: "정말 고통스러우시겠어요. 제가 여기 있어드릴게요."
            },
            EmotionType.ANGER: {
                EmotionalIntensity.VERY_LOW: "조금 화가 나시는군요. 무슨 일인가요?",
                EmotionalIntensity.LOW: "화가 나시는 것 같아요. 이야기해주세요.",
                EmotionalIntensity.MEDIUM: "정말 화나시겠어요. 이해해요.",
                EmotionalIntensity.HIGH: "너무 화나시겠어요. 함께 해결해봐요.",
                EmotionalIntensity.VERY_HIGH: "정말 열받으시겠어요. 제가 도와드릴게요.",
                EmotionalIntensity.INTENSE: "정말 분노가 치솟으시겠어요. 안전하게 해결해봐요."
            },
            EmotionType.FEAR: {
                EmotionalIntensity.VERY_LOW: "조금 무서우시군요. 괜찮으세요?",
                EmotionalIntensity.LOW: "두려우시는 것 같아요. 말씀해주세요.",
                EmotionalIntensity.MEDIUM: "정말 무서우시겠어요. 함께 있어드릴게요.",
                EmotionalIntensity.HIGH: "너무 두려우시겠어요. 제가 도와드릴게요.",
                EmotionalIntensity.VERY_HIGH: "정말 공포스러우시겠어요. 안전하게 해결해봐요.",
                EmotionalIntensity.INTENSE: "정말 극도의 공포를 느끼시겠어요. 제가 여기 있어드릴게요."
            },
            EmotionType.ANXIETY: {
                EmotionalIntensity.VERY_LOW: "조금 불안하시군요. 괜찮으세요?",
                EmotionalIntensity.LOW: "걱정되시는 것 같아요. 말씀해주세요.",
                EmotionalIntensity.MEDIUM: "정말 불안하시겠어요. 함께 해결해봐요.",
                EmotionalIntensity.HIGH: "너무 걱정되시겠어요. 제가 도와드릴게요.",
                EmotionalIntensity.VERY_HIGH: "정말 초조하시겠어요. 안전하게 해결해봐요.",
                EmotionalIntensity.INTENSE: "정말 극도의 불안을 느끼시겠어요. 제가 여기 있어드릴게요."
            },
            EmotionType.JOY: {
                EmotionalIntensity.VERY_LOW: "조금 기분이 좋으시군요. 좋아요!",
                EmotionalIntensity.LOW: "기분이 좋으시는 것 같아요. 함께 기뻐해요!",
                EmotionalIntensity.MEDIUM: "정말 기쁘시겠어요. 축하해요!",
                EmotionalIntensity.HIGH: "너무 기쁘시겠어요. 정말 축하해요!",
                EmotionalIntensity.VERY_HIGH: "정말 행복하시겠어요. 함께 기뻐해요!",
                EmotionalIntensity.INTENSE: "정말 극도의 기쁨을 느끼시겠어요. 정말 축하해요!"
            }
        }
        
        if emotion in support_messages and intensity in support_messages[emotion]:
            return support_messages[emotion][intensity]
        else:
            return "감정을 이해하고 공감합니다. 제가 도와드릴게요."
    
    def _generate_practical_advice(self, emotional_state: EmotionalState) -> List[str]:
        """실용적 조언 생성"""
        advice = []
        
        emotion = emotional_state.primary_emotion
        
        if emotion == EmotionType.SADNESS:
            advice.extend([
                "슬픔을 표현할 수 있는 방법을 찾아보세요",
                "신뢰할 수 있는 사람과 대화해보세요",
                "자신을 돌보는 시간을 가져보세요"
            ])
        elif emotion == EmotionType.ANGER:
            advice.extend([
                "깊게 숨을 쉬며 마음을 진정시켜보세요",
                "화가 나는 이유를 정리해보세요",
                "건설적인 해결책을 찾아보세요"
            ])
        elif emotion == EmotionType.FEAR:
            advice.extend([
                "두려움을 단계적으로 극복해보세요",
                "안전한 환경에서 작은 도전을 해보세요",
                "전문가의 도움을 받아보세요"
            ])
        elif emotion == EmotionType.ANXIETY:
            advice.extend([
                "호흡법이나 명상을 시도해보세요",
                "걱정을 구체적으로 정리해보세요",
                "일상적인 루틴을 유지해보세요"
            ])
        elif emotion == EmotionType.CONFUSION:
            advice.extend([
                "혼란스러운 부분을 구체적으로 정리해보세요",
                "단계별로 접근해보세요",
                "추가 정보를 수집해보세요"
            ])
        
        return advice
    
    def _generate_follow_up_questions(self, emotional_state: EmotionalState) -> List[str]:
        """후속 질문 생성"""
        questions = []
        
        emotion = emotional_state.primary_emotion
        
        if emotion == EmotionType.SADNESS:
            questions.extend([
                "어떤 부분이 가장 힘드신가요?",
                "이런 기분이 얼마나 지속되었나요?",
                "도움이 될 수 있는 것이 있나요?"
            ])
        elif emotion == EmotionType.ANGER:
            questions.extend([
                "화가 나는 구체적인 이유가 있나요?",
                "이런 상황을 어떻게 해결하고 싶으신가요?",
                "도움이 필요한 부분이 있나요?"
            ])
        elif emotion == EmotionType.FEAR:
            questions.extend([
                "무엇이 가장 두렵나요?",
                "이런 두려움을 어떻게 극복하고 싶으신가요?",
                "안전하게 느끼려면 무엇이 필요하신가요?"
            ])
        elif emotion == EmotionType.ANXIETY:
            questions.extend([
                "가장 걱정되는 부분이 무엇인가요?",
                "이런 불안감을 어떻게 관리하고 싶으신가요?",
                "도움이 될 수 있는 방법이 있나요?"
            ])
        elif emotion == EmotionType.CONFUSION:
            questions.extend([
                "어떤 부분이 가장 혼란스러우신가요?",
                "더 명확하게 알고 싶은 것이 있나요?",
                "어떤 도움이 필요하신가요?"
            ])
        
        return questions
    
    def store_emotional_memory(self, emotional_state: EmotionalState, user_id: str):
        """감정 메모리 저장"""
        if user_id not in self.emotional_memories:
            self.emotional_memories[user_id] = []
        
        self.emotional_memories[user_id].append(emotional_state)
        
        # 최근 20개 감정 상태만 유지
        if len(self.emotional_memories[user_id]) > 20:
            self.emotional_memories[user_id] = self.emotional_memories[user_id][-20:]
    
    def get_emotional_history(self, user_id: str) -> List[EmotionalState]:
        """감정 히스토리 조회"""
        return self.emotional_memories.get(user_id, [])
    
    def analyze_emotional_trends(self, user_id: str) -> Dict[str, Any]:
        """감정 트렌드 분석"""
        emotional_history = self.get_emotional_history(user_id)
        
        if not emotional_history:
            return {"error": "감정 데이터가 없습니다"}
        
        # 최근 7일간의 감정 분석
        recent_emotions = [e for e in emotional_history if (datetime.now() - e.timestamp).days <= 7]
        
        # 감정 분포
        emotion_counts = {}
        for emotion in recent_emotions:
            emotion_type = emotion.primary_emotion.value
            emotion_counts[emotion_type] = emotion_counts.get(emotion_type, 0) + 1
        
        # 감정 강도 평균
        intensity_scores = {
            EmotionalIntensity.VERY_LOW: 1,
            EmotionalIntensity.LOW: 2,
            EmotionalIntensity.MEDIUM: 3,
            EmotionalIntensity.HIGH: 4,
            EmotionalIntensity.VERY_HIGH: 5,
            EmotionalIntensity.INTENSE: 6
        }
        
        avg_intensity = sum(intensity_scores.get(e.intensity, 0) for e in recent_emotions) / len(recent_emotions)
        
        # 감정 안정성
        emotional_stability = 1.0 - (len(set(e.primary_emotion for e in recent_emotions)) / len(recent_emotions))
        
        return {
            "emotion_distribution": emotion_counts,
            "average_intensity": avg_intensity,
            "emotional_stability": emotional_stability,
            "total_emotions": len(recent_emotions),
            "analysis_period": "7일",
            "recommendations": self._generate_emotional_recommendations(emotion_counts, avg_intensity, emotional_stability)
        }
    
    def _generate_emotional_recommendations(self, emotion_counts: Dict[str, int], avg_intensity: float, stability: float) -> List[str]:
        """감정적 권장사항 생성"""
        recommendations = []
        
        # 부정적 감정이 많은 경우
        negative_emotions = ["sadness", "anger", "fear", "anxiety", "frustration", "guilt", "shame"]
        negative_count = sum(emotion_counts.get(emotion, 0) for emotion in negative_emotions)
        total_count = sum(emotion_counts.values())
        
        if negative_count / total_count > 0.6:
            recommendations.append("부정적 감정이 많이 나타나고 있습니다. 전문가의 도움을 받아보세요.")
            recommendations.append("긍정적인 활동을 늘려보세요.")
        
        # 감정 강도가 높은 경우
        if avg_intensity > 4.0:
            recommendations.append("감정 강도가 높습니다. 감정 조절 방법을 연습해보세요.")
            recommendations.append("명상이나 호흡법을 시도해보세요.")
        
        # 감정 안정성이 낮은 경우
        if stability < 0.3:
            recommendations.append("감정 변화가 자주 일어나고 있습니다. 일상적인 루틴을 유지해보세요.")
            recommendations.append("감정을 기록하고 패턴을 파악해보세요.")
        
        return recommendations
