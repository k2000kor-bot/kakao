"""
고급 대화 맥락 분석 시스템
실시간 대화 흐름, 감정 뉘앙스, 성격 패턴 분석
"""

import re
import json
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum

class EmotionNuance(Enum):
    """8단계 감정 뉘앙스"""
    ECSTATIC = "ecstatic"           # 황홀한
    JOYFUL = "joyful"               # 기쁜
    CONTENT = "content"             # 만족한
    CALM = "calm"                   # 평온한
    WORRIED = "worried"             # 걱정하는
    FRUSTRATED = "frustrated"       # 좌절한
    DISTRESSED = "distressed"       # 괴로운
    DEVASTATED = "devastated"       # 절망한

class ConversationContext(Enum):
    """대화 맥락 유형"""
    GREETING = "greeting"           # 인사
    SHARING = "sharing"             # 소식 공유
    SEEKING_ADVICE = "seeking_advice"   # 조언 구하기
    EMOTIONAL_SUPPORT = "emotional_support"  # 감정적 지지
    CASUAL_CHAT = "casual_chat"     # 일상 대화
    PROBLEM_SOLVING = "problem_solving"  # 문제 해결
    CELEBRATION = "celebration"     # 축하
    COMPLAINT = "complaint"         # 불만 토로

@dataclass
class ConversationPattern:
    """대화 패턴 분석 결과"""
    message_length_preference: str  # short, medium, long
    formality_tendency: float       # 0.0 (casual) ~ 1.0 (formal)
    emotional_expressiveness: float  # 0.0 (reserved) ~ 1.0 (expressive)
    question_frequency: float       # 질문 빈도
    emoji_usage_pattern: str        # none, minimal, moderate, frequent
    topic_depth_preference: str     # surface, moderate, deep
    response_time_pattern: str      # immediate, quick, moderate, delayed

@dataclass
class AdvancedEmotionAnalysis:
    """고급 감정 분석 결과"""
    primary_nuance: EmotionNuance
    secondary_nuances: List[EmotionNuance]
    intensity_score: float          # 0.0 ~ 1.0
    authenticity_score: float       # 진정성 점수
    emotional_stability: float      # 감정 안정성
    underlying_needs: List[str]     # 숨겨진 욕구들

@dataclass
class ConversationFlow:
    """대화 흐름 분석"""
    current_context: ConversationContext
    context_transitions: List[Tuple[ConversationContext, float]]  # (context, probability)
    conversation_momentum: float    # 대화 추진력
    engagement_level: float         # 참여도
    natural_endings: List[str]      # 자연스러운 마무리 방법들
    suggested_continuations: List[str]  # 대화 연결 제안

class AdvancedConversationAnalyzer:
    """고급 대화 분석기"""
    
    def __init__(self):
        self.emotion_patterns = self._initialize_emotion_patterns()
        self.context_indicators = self._initialize_context_indicators()
        self.personality_markers = self._initialize_personality_markers()
        
    def _initialize_emotion_patterns(self) -> Dict[EmotionNuance, Dict[str, Any]]:
        """감정 뉘앙스별 패턴 정의"""
        return {
            EmotionNuance.ECSTATIC: {
                "keywords": ["최고", "완전", "대박", "진짜", "정말정말", "와!!!", "대단해"],
                "patterns": ["!{2,}", "ㅋ{3,}", "ㅎ{3,}"],
                "intensity_multiplier": 1.0
            },
            EmotionNuance.JOYFUL: {
                "keywords": ["기쁘", "좋아", "행복", "신나", "즐거", "웃음", "미소"],
                "patterns": ["!", "ㅋㅋ", "ㅎㅎ", "😊", "😄"],
                "intensity_multiplier": 0.8
            },
            EmotionNuance.CONTENT: {
                "keywords": ["만족", "괜찮", "나쁘지않", "적당", "평범", "무난"],
                "patterns": ["그럭저럭", "나름", "적당히"],
                "intensity_multiplier": 0.6
            },
            EmotionNuance.CALM: {
                "keywords": ["평온", "고요", "안정", "차분", "조용", "평화"],
                "patterns": ["천천히", "여유", "편안"],
                "intensity_multiplier": 0.4
            },
            EmotionNuance.WORRIED: {
                "keywords": ["걱정", "불안", "염려", "근심", "우려", "고민"],
                "patterns": ["어떡하지", "괜찮을까", "걱정되"],
                "intensity_multiplier": 0.5
            },
            EmotionNuance.FRUSTRATED: {
                "keywords": ["짜증", "답답", "화나", "귀찮", "성가", "빡쳐"],
                "patterns": ["아휴", "어휴", "하...", "아..."],
                "intensity_multiplier": 0.7
            },
            EmotionNuance.DISTRESSED: {
                "keywords": ["괴로", "힘들", "고통", "아픔", "슬프", "우울"],
                "patterns": ["ㅠㅠ", "😢", "😞", "하..."],
                "intensity_multiplier": 0.8
            },
            EmotionNuance.DEVASTATED: {
                "keywords": ["절망", "끝났", "망했", "죽고싶", "포기", "안돼"],
                "patterns": ["ㅠㅠㅠ", "😭", "망했다", "끝이다"],
                "intensity_multiplier": 1.0
            }
        }
    
    def _initialize_context_indicators(self) -> Dict[ConversationContext, List[str]]:
        """대화 맥락별 지표 단어들"""
        return {
            ConversationContext.GREETING: ["안녕", "하이", "반가", "오랜만", "잘지냈", "어떻게지내"],
            ConversationContext.SHARING: ["오늘", "어제", "요즘", "최근", "소식", "일어났", "있었"],
            ConversationContext.SEEKING_ADVICE: ["어떻게", "방법", "조언", "도움", "알려줘", "가르쳐"],
            ConversationContext.EMOTIONAL_SUPPORT: ["힘들", "슬프", "우울", "지쳐", "위로", "공감"],
            ConversationContext.CASUAL_CHAT: ["그냥", "별거없", "일상", "평범", "뭐해", "심심"],
            ConversationContext.PROBLEM_SOLVING: ["문제", "해결", "방안", "대책", "계획", "전략"],
            ConversationContext.CELEBRATION: ["축하", "기념", "성공", "합격", "승진", "좋은소식"],
            ConversationContext.COMPLAINT: ["불만", "짜증", "화나", "억울", "이상해", "말이안돼"]
        }
    
    def _initialize_personality_markers(self) -> Dict[str, List[str]]:
        """성격 특성별 마커"""
        return {
            "introverted": ["혼자", "조용히", "집에서", "사람많으면", "피곤"],
            "extroverted": ["사람들과", "모임", "파티", "활동적", "에너지"],
            "analytical": ["분석", "논리적", "체계적", "계획", "단계적"],
            "emotional": ["감정", "느낌", "마음", "직감", "감성적"],
            "optimistic": ["긍정적", "희망적", "잘될거야", "괜찮을거야", "좋은방향"],
            "pessimistic": ["부정적", "안될거야", "어려울거야", "걱정", "문제"]
        }
    
    def analyze_emotion_nuance(self, text: str) -> AdvancedEmotionAnalysis:
        """8단계 감정 뉘앙스 분석"""
        text_lower = text.lower()
        
        # 각 감정 뉘앙스별 점수 계산
        emotion_scores = {}
        for nuance, patterns in self.emotion_patterns.items():
            score = 0.0
            
            # 키워드 매칭
            for keyword in patterns["keywords"]:
                if keyword in text_lower:
                    score += 1.0
            
            # 패턴 매칭
            for pattern in patterns["patterns"]:
                if re.search(pattern, text):
                    score += 0.5
            
            # 강도 조정
            score *= patterns["intensity_multiplier"]
            emotion_scores[nuance] = score
        
        # 주요 감정 선정
        if not emotion_scores or max(emotion_scores.values()) == 0:
            primary_nuance = EmotionNuance.CALM
        else:
            primary_nuance = max(emotion_scores, key=emotion_scores.get)
        
        # 보조 감정들
        secondary_nuances = [
            emotion for emotion, score in emotion_scores.items() 
            if score > 0 and emotion != primary_nuance
        ][:2]
        
        # 강도 계산
        intensity_score = min(max(emotion_scores.values()) / 3.0, 1.0)
        
        # 진정성 점수 (다양한 표현 방식 사용 여부)
        authenticity_indicators = len([
            pattern for patterns in self.emotion_patterns.values()
            for pattern in patterns["patterns"]
            if re.search(pattern, text)
        ])
        authenticity_score = min(authenticity_indicators / 5.0, 1.0)
        
        # 감정 안정성 (극단적 표현 여부)
        extreme_patterns = ["!{3,}", "ㅠ{3,}", "ㅋ{5,}"]
        extreme_count = sum(1 for pattern in extreme_patterns if re.search(pattern, text))
        emotional_stability = max(0.0, 1.0 - (extreme_count * 0.3))
        
        # 숨겨진 욕구 추론
        underlying_needs = self._infer_underlying_needs(text, primary_nuance)
        
        return AdvancedEmotionAnalysis(
            primary_nuance=primary_nuance,
            secondary_nuances=secondary_nuances,
            intensity_score=intensity_score,
            authenticity_score=authenticity_score,
            emotional_stability=emotional_stability,
            underlying_needs=underlying_needs
        )
    
    def analyze_conversation_context(self, text: str, 
                                   conversation_history: Optional[List[str]] = None) -> ConversationContext:
        """대화 맥락 분석"""
        text_lower = text.lower()
        context_scores = {}
        
        # 각 맥락별 점수 계산
        for context, indicators in self.context_indicators.items():
            score = sum(1 for indicator in indicators if indicator in text_lower)
            context_scores[context] = score
        
        # 대화 기록 고려
        if conversation_history:
            # 이전 대화의 맥락을 고려한 가중치 적용
            recent_contexts = self._analyze_recent_contexts(conversation_history)
            for context, weight in recent_contexts.items():
                if context in context_scores:
                    context_scores[context] += weight * 0.5
        
        # 가장 높은 점수의 맥락 반환
        if not context_scores or max(context_scores.values()) == 0:
            return ConversationContext.CASUAL_CHAT
        
        return max(context_scores, key=context_scores.get)
    
    def analyze_conversation_flow(self, current_text: str,
                                conversation_history: Optional[List[str]] = None) -> ConversationFlow:
        """대화 흐름 분석"""
        
        current_context = self.analyze_conversation_context(current_text, conversation_history)
        
        # 맥락 전환 확률 계산
        context_transitions = self._calculate_context_transitions(current_context, current_text)
        
        # 대화 추진력 계산
        momentum = self._calculate_conversation_momentum(current_text, conversation_history)
        
        # 참여도 계산
        engagement = self._calculate_engagement_level(current_text)
        
        # 자연스러운 마무리 방법
        natural_endings = self._suggest_natural_endings(current_context, current_text)
        
        # 대화 연결 제안
        continuations = self._suggest_continuations(current_context, current_text)
        
        return ConversationFlow(
            current_context=current_context,
            context_transitions=context_transitions,
            conversation_momentum=momentum,
            engagement_level=engagement,
            natural_endings=natural_endings,
            suggested_continuations=continuations
        )
    
    def analyze_personality_pattern(self, texts: List[str]) -> ConversationPattern:
        """대화 패턴을 통한 성격 분석"""
        
        if not texts:
            return self._default_conversation_pattern()
        
        combined_text = " ".join(texts)
        
        # 메시지 길이 선호도
        avg_length = sum(len(text.split()) for text in texts) / len(texts)
        if avg_length < 5:
            length_pref = "short"
        elif avg_length < 15:
            length_pref = "medium"
        else:
            length_pref = "long"
        
        # 격식 성향
        formal_indicators = ["습니다", "됩니다", "드립니다", "하겠습니다"]
        casual_indicators = ["어요", "해요", "그래", "응", "ㅋㅋ"]
        
        formal_count = sum(1 for indicator in formal_indicators if indicator in combined_text)
        casual_count = sum(1 for indicator in casual_indicators if indicator in combined_text)
        
        formality = formal_count / (formal_count + casual_count + 1)
        
        # 감정 표현력
        emotion_markers = ["!", "ㅋ", "ㅠ", "😊", "😢", "정말", "너무", "완전"]
        emotion_count = sum(combined_text.count(marker) for marker in emotion_markers)
        emotional_expressiveness = min(emotion_count / len(combined_text) * 10, 1.0)
        
        # 질문 빈도
        question_count = sum(1 for text in texts if "?" in text or any(
            q_word in text.lower() for q_word in ["어떻게", "뭐", "왜", "언제", "어디"]
        ))
        question_frequency = question_count / len(texts)
        
        # 이모지 사용 패턴
        emoji_count = sum(text.count("ㅋ") + text.count("ㅠ") + 
                         len(re.findall(r'[😀-🙏]', text)) for text in texts)
        if emoji_count == 0:
            emoji_pattern = "none"
        elif emoji_count < len(texts):
            emoji_pattern = "minimal"
        elif emoji_count < len(texts) * 2:
            emoji_pattern = "moderate"
        else:
            emoji_pattern = "frequent"
        
        # 주제 깊이 선호도
        deep_indicators = ["왜냐하면", "구체적으로", "자세히", "심층적", "분석"]
        surface_indicators = ["그냥", "대충", "간단히", "빨리", "요약"]
        
        deep_count = sum(1 for indicator in deep_indicators if indicator in combined_text)
        surface_count = sum(1 for indicator in surface_indicators if indicator in combined_text)
        
        if deep_count > surface_count:
            topic_depth = "deep"
        elif surface_count > deep_count:
            topic_depth = "surface"
        else:
            topic_depth = "moderate"
        
        return ConversationPattern(
            message_length_preference=length_pref,
            formality_tendency=formality,
            emotional_expressiveness=emotional_expressiveness,
            question_frequency=question_frequency,
            emoji_usage_pattern=emoji_pattern,
            topic_depth_preference=topic_depth,
            response_time_pattern="moderate"  # 실시간 데이터 필요
        )
    
    def _infer_underlying_needs(self, text: str, emotion: EmotionNuance) -> List[str]:
        """감정을 바탕으로 숨겨진 욕구 추론"""
        needs_map = {
            EmotionNuance.ECSTATIC: ["인정받고 싶음", "성취감 공유"],
            EmotionNuance.JOYFUL: ["기쁨 공유", "긍정적 반응"],
            EmotionNuance.CONTENT: ["현상 유지", "안정감"],
            EmotionNuance.CALM: ["평온함", "이해"],
            EmotionNuance.WORRIED: ["안심", "지지"],
            EmotionNuance.FRUSTRATED: ["해결책", "공감"],
            EmotionNuance.DISTRESSED: ["위로", "도움"],
            EmotionNuance.DEVASTATED: ["즉각적 지지", "희망"]
        }
        
        base_needs = needs_map.get(emotion, ["이해", "공감"])
        
        # 텍스트 내용 기반 추가 욕구
        if "도움" in text.lower():
            base_needs.append("구체적 도움")
        if "조언" in text.lower():
            base_needs.append("전문적 조언")
        if "들어줘" in text.lower():
            base_needs.append("경청")
        
        return base_needs[:3]  # 최대 3개
    
    def _analyze_recent_contexts(self, history: List[str]) -> Dict[ConversationContext, float]:
        """최근 대화의 맥락 분석"""
        if not history:
            return {}
        
        recent_messages = history[-3:]  # 최근 3개 메시지
        context_weights = {}
        
        for i, message in enumerate(recent_messages):
            context = self.analyze_conversation_context(message)
            weight = 1.0 - (i * 0.2)  # 최근일수록 높은 가중치
            context_weights[context] = context_weights.get(context, 0) + weight
        
        return context_weights
    
    def _calculate_context_transitions(self, current_context: ConversationContext, 
                                     text: str) -> List[Tuple[ConversationContext, float]]:
        """맥락 전환 확률 계산"""
        
        # 맥락별 자연스러운 전환 확률
        transition_probabilities = {
            ConversationContext.GREETING: [
                (ConversationContext.SHARING, 0.4),
                (ConversationContext.CASUAL_CHAT, 0.3),
                (ConversationContext.SEEKING_ADVICE, 0.2)
            ],
            ConversationContext.SHARING: [
                (ConversationContext.EMOTIONAL_SUPPORT, 0.3),
                (ConversationContext.CASUAL_CHAT, 0.3),
                (ConversationContext.SEEKING_ADVICE, 0.2)
            ],
            ConversationContext.SEEKING_ADVICE: [
                (ConversationContext.PROBLEM_SOLVING, 0.5),
                (ConversationContext.EMOTIONAL_SUPPORT, 0.3)
            ],
            ConversationContext.EMOTIONAL_SUPPORT: [
                (ConversationContext.CASUAL_CHAT, 0.4),
                (ConversationContext.PROBLEM_SOLVING, 0.3)
            ]
        }
        
        return transition_probabilities.get(current_context, [
            (ConversationContext.CASUAL_CHAT, 0.5)
        ])
    
    def _calculate_conversation_momentum(self, text: str, 
                                       history: Optional[List[str]]) -> float:
        """대화 추진력 계산"""
        momentum = 0.5  # 기본값
        
        # 질문이 있으면 추진력 증가
        if "?" in text or any(q in text.lower() for q in ["어떻게", "뭐", "왜"]):
            momentum += 0.3
        
        # 감정 표현이 강하면 추진력 증가
        if re.search(r'[!]{2,}|[ㅋ]{3,}|[ㅠ]{2,}', text):
            momentum += 0.2
        
        # 구체적 정보 요청이 있으면 추진력 증가
        if any(word in text.lower() for word in ["자세히", "더", "구체적"]):
            momentum += 0.2
        
        return min(momentum, 1.0)
    
    def _calculate_engagement_level(self, text: str) -> float:
        """참여도 계산"""
        engagement = 0.5  # 기본값
        
        # 텍스트 길이 기반
        word_count = len(text.split())
        if word_count > 20:
            engagement += 0.2
        elif word_count < 5:
            engagement -= 0.2
        
        # 감정 표현 기반
        emotion_indicators = text.count("!") + text.count("ㅋ") + text.count("ㅠ")
        engagement += min(emotion_indicators * 0.1, 0.3)
        
        # 개인적 경험 공유
        personal_indicators = ["나는", "내가", "우리", "저는", "제가"]
        if any(indicator in text for indicator in personal_indicators):
            engagement += 0.2
        
        return min(engagement, 1.0)
    
    def _suggest_natural_endings(self, context: ConversationContext, text: str) -> List[str]:
        """자연스러운 마무리 방법 제안"""
        endings = {
            ConversationContext.EMOTIONAL_SUPPORT: [
                "언제든 이야기하고 싶으면 말해주세요",
                "힘내시고 좋은 결과 있으시길 바라요",
                "응원할게요!"
            ],
            ConversationContext.CELEBRATION: [
                "정말 축하드려요! 좋은 하루 되세요",
                "기쁜 소식 감사해요",
                "계속 좋은 일만 있으시길!"
            ],
            ConversationContext.CASUAL_CHAT: [
                "좋은 이야기 감사해요",
                "또 이야기해요",
                "오늘도 좋은 하루 되세요"
            ]
        }
        
        return endings.get(context, ["좋은 이야기 감사해요", "또 이야기해요"])
    
    def _suggest_continuations(self, context: ConversationContext, text: str) -> List[str]:
        """대화 연결 제안"""
        continuations = {
            ConversationContext.SHARING: [
                "더 자세한 이야기가 궁금해요",
                "그래서 어떻게 되었나요?",
                "어떤 기분이셨어요?"
            ],
            ConversationContext.SEEKING_ADVICE: [
                "어떤 부분이 가장 어려우신가요?",
                "이전에 비슷한 경험이 있으셨나요?",
                "어떤 결과를 원하시나요?"
            ],
            ConversationContext.EMOTIONAL_SUPPORT: [
                "정말 힘드셨겠어요",
                "어떤 도움이 필요하신가요?",
                "누군가와 이야기하는 것만으로도 도움이 될 거예요"
            ]
        }
        
        return continuations.get(context, [
            "더 이야기해 주세요",
            "어떻게 생각하세요?",
            "다른 이야기도 궁금해요"
        ])
    
    def _default_conversation_pattern(self) -> ConversationPattern:
        """기본 대화 패턴"""
        return ConversationPattern(
            message_length_preference="medium",
            formality_tendency=0.5,
            emotional_expressiveness=0.5,
            question_frequency=0.3,
            emoji_usage_pattern="moderate",
            topic_depth_preference="moderate",
            response_time_pattern="moderate"
        )

# 사용 예시
def demo_advanced_analysis():
    analyzer = AdvancedConversationAnalyzer()
    
    # 테스트 메시지들
    test_messages = [
        "오늘 정말정말 좋은 일이 있었어요!! 너무 기뻐서 미치겠어요ㅋㅋㅋ",
        "요즘 너무 힘들어서... 어떻게 해야 할지 모르겠어요 ㅠㅠ",
        "그냥 별일 없이 지내고 있어요. 뭐 특별한 건 없고요",
        "조언 좀 구하고 싶은데, 이런 상황에서는 어떻게 하는 게 좋을까요?"
    ]
    
    print("🔍 고급 대화 분석 데모")
    print("=" * 50)
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n📝 메시지 {i}: {message}")
        
        # 감정 뉘앙스 분석
        emotion_analysis = analyzer.analyze_emotion_nuance(message)
        print(f"   🎭 주요 감정: {emotion_analysis.primary_nuance.value}")
        print(f"   💯 감정 강도: {emotion_analysis.intensity_score:.2f}")
        print(f"   ✨ 진정성: {emotion_analysis.authenticity_score:.2f}")
        print(f"   🎯 숨겨진 욕구: {', '.join(emotion_analysis.underlying_needs)}")
        
        # 대화 맥락 분석
        context = analyzer.analyze_conversation_context(message)
        print(f"   💬 대화 맥락: {context.value}")
        
        # 대화 흐름 분석
        flow = analyzer.analyze_conversation_flow(message)
        print(f"   🌊 대화 추진력: {flow.conversation_momentum:.2f}")
        print(f"   🤝 참여도: {flow.engagement_level:.2f}")

if __name__ == "__main__":
    demo_advanced_analysis() 