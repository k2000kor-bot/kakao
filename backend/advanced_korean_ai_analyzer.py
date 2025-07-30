from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import logging
import re
from enum import Enum

from chat_conversation_analyzer import ChatConversationAnalyzer, ChatMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EmotionType(Enum):
    """감정 유형"""
    POSITIVE = "긍정적"
    NEGATIVE = "부정적" 
    NEUTRAL = "중립적"
    CONCERNED = "우려"
    EXCITED = "흥분"
    DISAPPOINTED = "실망"
    HOPEFUL = "희망적"
    ANGRY = "분노"
    SATISFIED = "만족"


class IntentType(Enum):
    """발언 의도"""
    INFORM = "정보전달"
    PERSUADE = "설득"
    OBJECT = "반대표명"
    SUPPORT = "지지표명"
    QUESTION = "질문"
    SUGGEST = "제안"
    WARN = "경고"
    COMPLAIN = "불만제기"
    ENCOURAGE = "격려"
    MEDIATE = "중재"


class InfluenceLevel(Enum):
    """영향력 수준"""
    VERY_HIGH = "매우높음"
    HIGH = "높음"
    MEDIUM = "보통"
    LOW = "낮음"
    VERY_LOW = "매우낮음"


@dataclass
class EmotionAnalysis:
    """감정 분석 결과"""
    primary_emotion: EmotionType
    emotion_intensity: float  # 0.0 ~ 1.0
    emotion_confidence: float  # 0.0 ~ 1.0
    emotional_keywords: List[str]
    emotion_trajectory: List[Tuple[datetime, EmotionType, float]]
    cultural_emotion_context: Dict[str, Any]


@dataclass
class IntentAnalysis:
    """의도 분석 결과"""
    primary_intent: IntentType
    intent_confidence: float
    secondary_intents: List[Tuple[IntentType, float]]
    persuasion_techniques: List[str]
    argument_structure: Dict[str, Any]
    target_audience: List[str]


@dataclass
class ConversationDynamics:
    """대화 역학 분석"""
    participation_pattern: Dict[str, float]
    influence_network: Dict[str, Dict[str, float]]
    topic_leadership: Dict[str, List[str]]
    conflict_intensity: float
    consensus_formation: Dict[str, Any]
    communication_efficiency: float


@dataclass
class AdvancedPersonProfile:
    """고도화된 개인 프로필"""
    person_name: str
    communication_style: Dict[str, Any]
    emotion_profile: EmotionAnalysis
    intent_patterns: List[IntentAnalysis]
    influence_metrics: Dict[str, float]
    relationship_map: Dict[str, str]
    behavioral_patterns: Dict[str, Any]
    predictive_insights: Dict[str, Any]
    key_quoted_statements: List[str]  # 인용문은 원문 유지
    analysis_summary: str  # 분석은 평어


@dataclass
class TopicAnalysisAdvanced:
    """고도화된 주제 분석"""
    topic_name: str
    stakeholder_positions: Dict[str, Dict[str, Any]]
    argument_mapping: Dict[str, List[str]]
    consensus_probability: float
    resolution_pathways: List[Dict[str, Any]]
    emotional_resonance: Dict[str, float]
    key_turning_points: List[Dict[str, Any]]
    quoted_key_arguments: List[str]  # 핵심 논거는 인용문으로


@dataclass
class AdvancedKoreanSummary:
    """고도화된 한국어 요약"""
    summary_id: str
    analysis_timestamp: datetime
    conversation_metadata: Dict[str, Any]
    person_profiles: List[AdvancedPersonProfile]
    topic_analyses: List[TopicAnalysisAdvanced]
    conversation_dynamics: ConversationDynamics
    ai_insights: Dict[str, Any]
    predictive_outcomes: Dict[str, Any]
    actionable_recommendations: List[Dict[str, Any]]
    visual_summary_data: Dict[str, Any]


class AdvancedKoreanAIAnalyzer:
    """AI 기반 고도화된 한국어 대화 분석기"""
    
    def __init__(self, base_analyzer: ChatConversationAnalyzer):
        self.base_analyzer = base_analyzer
        
        # 한국어 감정 어휘 사전
        self.korean_emotion_dict = {
            EmotionType.POSITIVE: [
                "좋다", "훌륭하다", "만족", "기쁘다", "다행", "감사", "환영", 
                "효과적", "성공적", "바람직", "적절", "우수", "완벽"
            ],
            EmotionType.NEGATIVE: [
                "나쁘다", "실망", "불만", "걱정", "문제", "위험", "심각", 
                "곤란", "어려움", "부적절", "실패", "손실"
            ],
            EmotionType.CONCERNED: [
                "우려", "걱정", "염려", "불안", "신중", "조심", "주의", 
                "검토", "재고", "의문", "의심"
            ],
            EmotionType.EXCITED: [
                "기대", "흥미", "열정", "적극적", "진전", "발전", "개선", 
                "혁신", "새로운", "획기적"
            ],
            EmotionType.DISAPPOINTED: [
                "실망", "아쉽다", "유감", "안타깝다", "답답", "한계", 
                "부족", "미흡", "아직"
            ],
            EmotionType.HOPEFUL: [
                "희망", "기대", "가능성", "기회", "발전", "개선", "향후", 
                "미래", "전망", "잠재력"
            ],
            EmotionType.ANGRY: [
                "화나다", "분노", "격분", "억울", "불공평", "부당", 
                "말도안되는", "터무니없는"
            ],
            EmotionType.SATISFIED: [
                "만족", "충분", "적당", "괜찮다", "OK", "좋겠다", 
                "적절", "합리적"
            ]
        }
        
        # 한국어 의도 패턴
        self.korean_intent_patterns = {
            IntentType.INFORM: [
                "알려드리", "안내", "공지", "설명", "전달", "보고", 
                "참고", "확인", "공유", "첨부"
            ],
            IntentType.PERSUADE: [
                "생각해보시면", "~하는게 좋겠", "제안", "권하", "추천", 
                "바람직", "효과적", "유리"
            ],
            IntentType.OBJECT: [
                "반대", "문제", "우려", "동의할수없", "지적", "비판", 
                "의문", "재고"
            ],
            IntentType.SUPPORT: [
                "찬성", "동의", "지지", "좋다", "적절", "맞다", 
                "동감", "공감"
            ],
            IntentType.QUESTION: [
                "궁금", "질문", "어떻게", "왜", "언제", "무엇", 
                "어디서", "문의"
            ],
            IntentType.SUGGEST: [
                "제안", "어떨까", "~해보면", "방법", "대안", "아이디어", 
                "개선"
            ],
            IntentType.WARN: [
                "주의", "조심", "위험", "경고", "염려", "우려", 
                "문제가될", "신중"
            ],
            IntentType.COMPLAIN: [
                "불만", "문제", "안된다", "잘못", "개선해야", "시정", 
                "바꿔야"
            ],
            IntentType.ENCOURAGE: [
                "격려", "응원", "힘내", "잘하고있", "괜찮다", "할수있", 
                "노력"
            ],
            IntentType.MEDIATE: [
                "양쪽", "균형", "중간", "절충", "조정", "타협", 
                "합의", "조화"
            ]
        }
        
        # 한국 문화적 맥락 키워드
        self.korean_cultural_keywords = {
            "hierarchy": ["선배", "후배", "상급자", "하급자", "존경", "예의"],
            "harmony": ["화합", "조화", "평화", "상생", "협력", "단합"],
            "face_saving": ["체면", "명예", "존중", "배려", "신중", "예의"],
            "collectivism": ["함께", "모두", "전체", "공동", "같이", "우리"],
            "emotional_bond": ["정", "마음", "감정", "이해", "공감", "소통"]
        }
        
    def analyze_conversation_advanced(self, 
                                    start_time: datetime, 
                                    end_time: datetime,
                                    chat_room: Optional[str] = None) -> AdvancedKoreanSummary:
        """고도화된 대화 분석"""
        
        messages = self.base_analyzer.get_messages_by_timerange(start_time, end_time, chat_room)
        
        if not messages:
            return self._create_empty_advanced_summary(start_time, end_time)
        
        # 1. 개인별 고도화 프로필 생성
        person_profiles = self._create_advanced_person_profiles(messages)
        
        # 2. 고도화된 주제 분석
        topic_analyses = self._create_advanced_topic_analyses(messages)
        
        # 3. 대화 역학 분석
        conversation_dynamics = self._analyze_conversation_dynamics(messages)
        
        # 4. AI 인사이트 생성
        ai_insights = self._generate_ai_insights(messages, person_profiles, topic_analyses)
        
        # 5. 예측적 결과 분석
        predictive_outcomes = self._predict_outcomes(messages, person_profiles, topic_analyses)
        
        # 6. 실행 가능한 권고사항
        recommendations = self._generate_actionable_recommendations(
            messages, person_profiles, topic_analyses, conversation_dynamics
        )
        
        # 7. 시각적 요약 데이터
        visual_data = self._prepare_visual_summary_data(
            person_profiles, topic_analyses, conversation_dynamics
        )
        
        return AdvancedKoreanSummary(
            summary_id=f"advanced_ai_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            analysis_timestamp=datetime.now(),
            conversation_metadata={
                "period": f"{start_time.strftime('%Y년 %m월 %d일')} ~ {end_time.strftime('%Y년 %m월 %d일')}",
                "participants_count": len(set(msg.sender for msg in messages)),
                "total_messages": len(messages),
                "analysis_version": "v5.0_advanced_ai"
            },
            person_profiles=person_profiles,
            topic_analyses=topic_analyses,
            conversation_dynamics=conversation_dynamics,
            ai_insights=ai_insights,
            predictive_outcomes=predictive_outcomes,
            actionable_recommendations=recommendations,
            visual_summary_data=visual_data
        )
        
    def _create_advanced_person_profiles(self, messages: List[ChatMessage]) -> List[AdvancedPersonProfile]:
        """고도화된 개인 프로필 생성"""
        person_messages = defaultdict(list)
        for msg in messages:
            person_messages[msg.sender].append(msg)
            
        profiles = []
        for person_name, person_msgs in person_messages.items():
            profile = self._analyze_single_person_advanced(person_name, person_msgs, messages)
            profiles.append(profile)
            
        return sorted(profiles, key=lambda x: x.influence_metrics.get('overall_influence', 0), reverse=True)
        
    def _analyze_single_person_advanced(self, 
                                      person_name: str, 
                                      person_messages: List[ChatMessage],
                                      all_messages: List[ChatMessage]) -> AdvancedPersonProfile:
        """단일 개인 고도화 분석"""
        
        # 감정 분석
        emotion_analysis = self._analyze_emotions_advanced(person_messages)
        
        # 의도 패턴 분석
        intent_patterns = self._analyze_intent_patterns(person_messages)
        
        # 영향력 측정
        influence_metrics = self._calculate_influence_metrics(
            person_name, person_messages, all_messages
        )
        
        # 관계 맵핑
        relationship_map = self._map_relationships(person_name, all_messages)
        
        # 행동 패턴 분석
        behavioral_patterns = self._analyze_behavioral_patterns(person_messages)
        
        # 예측적 인사이트
        predictive_insights = self._generate_predictive_insights(
            person_name, person_messages, all_messages
        )
        
        # 커뮤니케이션 스타일
        communication_style = self._analyze_communication_style(person_messages)
        
        # 인용문 추출 (원문 유지)
        key_quoted_statements = self._extract_key_quotes(person_messages)
        
        # 분석 요약 (평어)
        analysis_summary = self._create_analysis_summary(
            person_name, emotion_analysis, intent_patterns, influence_metrics
        )
        
        return AdvancedPersonProfile(
            person_name=person_name,
            communication_style=communication_style,
            emotion_profile=emotion_analysis,
            intent_patterns=intent_patterns,
            influence_metrics=influence_metrics,
            relationship_map=relationship_map,
            behavioral_patterns=behavioral_patterns,
            predictive_insights=predictive_insights,
            key_quoted_statements=key_quoted_statements,
            analysis_summary=analysis_summary
        )
        
    def _analyze_emotions_advanced(self, messages: List[ChatMessage]) -> EmotionAnalysis:
        """고도화된 감정 분석"""
        emotion_scores = defaultdict(float)
        emotional_keywords = []
        emotion_trajectory = []
        
        for msg in messages:
            content = msg.content
            msg_emotions = defaultdict(float)
            
            # 각 감정별 점수 계산
            for emotion_type, keywords in self.korean_emotion_dict.items():
                score = sum(1 for keyword in keywords if keyword in content)
                if score > 0:
                    msg_emotions[emotion_type] += score
                    emotional_keywords.extend([kw for kw in keywords if kw in content])
                    
            # 맥락적 감정 분석 (한국어 특성)
            context_score = self._analyze_emotional_context(content)
            for emotion, score in context_score.items():
                msg_emotions[emotion] += score
                
            # 메시지별 주요 감정 추가
            if msg_emotions:
                primary_emotion = max(msg_emotions, key=msg_emotions.get)
                intensity = min(msg_emotions[primary_emotion] / 5.0, 1.0)
                emotion_trajectory.append((msg.timestamp, primary_emotion, intensity))
                
            # 전체 감정 점수 누적
            for emotion, score in msg_emotions.items():
                emotion_scores[emotion] += score
                
        # 주요 감정 결정
        if emotion_scores:
            primary_emotion = max(emotion_scores, key=emotion_scores.get)
            total_score = sum(emotion_scores.values())
            emotion_intensity = min(emotion_scores[primary_emotion] / len(messages), 1.0)
            emotion_confidence = emotion_scores[primary_emotion] / total_score if total_score > 0 else 0.0
        else:
            primary_emotion = EmotionType.NEUTRAL
            emotion_intensity = 0.0
            emotion_confidence = 0.0
            
        # 문화적 감정 맥락
        cultural_context = self._analyze_cultural_emotion_context(messages)
        
        return EmotionAnalysis(
            primary_emotion=primary_emotion,
            emotion_intensity=emotion_intensity,
            emotion_confidence=emotion_confidence,
            emotional_keywords=list(set(emotional_keywords))[:10],
            emotion_trajectory=emotion_trajectory,
            cultural_emotion_context=cultural_context
        )
        
    def _analyze_emotional_context(self, content: str) -> Dict[EmotionType, float]:
        """맥락적 감정 분석"""
        context_scores = defaultdict(float)
        
        # 한국어 특화 감정 패턴
        patterns = {
            EmotionType.CONCERNED: [
                r"걱정이\s*됩니다", r"우려가\s*있습니다", r"염려\s*스럽습니다",
                r"신중하게\s*해야", r"조심\s*스럽게"
            ],
            EmotionType.POSITIVE: [
                r"좋을\s*것\s*같습니다", r"바람직하다고\s*봅니다", r"효과적일\s*것",
                r"성공적으로", r"만족\s*스럽습니다"
            ],
            EmotionType.NEGATIVE: [
                r"문제가\s*있습니다", r"어려움이\s*있습니다", r"불만이\s*있습니다",
                r"안\s*좋습니다", r"실망\s*스럽습니다"
            ]
        }
        
        for emotion, pattern_list in patterns.items():
            for pattern in pattern_list:
                if re.search(pattern, content):
                    context_scores[emotion] += 1.5  # 맥락 점수는 더 높게
                    
        return context_scores
        
    def _analyze_intent_patterns(self, messages: List[ChatMessage]) -> List[IntentAnalysis]:
        """의도 패턴 분석"""
        intent_analyses = []
        
        for msg in messages:
            content = msg.content
            intent_scores = defaultdict(float)
            
            # 각 의도별 점수 계산
            for intent_type, keywords in self.korean_intent_patterns.items():
                score = sum(1 for keyword in keywords if keyword in content)
                intent_scores[intent_type] = score
                
            # 문법적 패턴 분석
            grammar_intents = self._analyze_grammatical_intent_patterns(content)
            for intent, score in grammar_intents.items():
                intent_scores[intent] += score
                
            if intent_scores:
                primary_intent = max(intent_scores, key=intent_scores.get)
                total_score = sum(intent_scores.values())
                confidence = intent_scores[primary_intent] / total_score if total_score > 0 else 0.0
                
                # 부차적 의도들
                sorted_intents = sorted(intent_scores.items(), key=lambda x: x[1], reverse=True)
                secondary_intents = [(intent, score/total_score) for intent, score in sorted_intents[1:3] if score > 0]
                
                # 설득 기법 분석
                persuasion_techniques = self._analyze_persuasion_techniques(content)
                
                # 논증 구조 분석
                argument_structure = self._analyze_argument_structure(content)
                
                # 대상 청중 분석
                target_audience = self._identify_target_audience(content)
                
                intent_analysis = IntentAnalysis(
                    primary_intent=primary_intent,
                    intent_confidence=confidence,
                    secondary_intents=secondary_intents,
                    persuasion_techniques=persuasion_techniques,
                    argument_structure=argument_structure,
                    target_audience=target_audience
                )
                
                intent_analyses.append(intent_analysis)
                
        return intent_analyses
        
    def _analyze_grammatical_intent_patterns(self, content: str) -> Dict[IntentType, float]:
        """문법적 의도 패턴 분석"""
        patterns = {
            IntentType.QUESTION: [r"\?", r"궁금", r"어떻게", r"왜", r"언제"],
            IntentType.SUGGEST: [r"어떨까요", r"~하면", r"제안", r"추천"],
            IntentType.WARN: [r"조심", r"주의", r"위험", r"문제가\s*될"],
            IntentType.PERSUADE: [r"생각해보시면", r"~하는게\s*좋", r"바람직"],
            IntentType.INFORM: [r"알려드리", r"안내", r"공지", r"참고"]
        }
        
        scores = defaultdict(float)
        for intent, pattern_list in patterns.items():
            for pattern in pattern_list:
                if re.search(pattern, content):
                    scores[intent] += 1.0
                    
        return scores 

    def _calculate_influence_metrics(self, 
                                   person_name: str, 
                                   person_messages: List[ChatMessage],
                                   all_messages: List[ChatMessage]) -> Dict[str, float]:
        """영향력 측정"""
        metrics = {}
        
        # 1. 발언 빈도 영향력
        total_messages = len(all_messages)
        person_message_count = len(person_messages)
        frequency_influence = person_message_count / total_messages if total_messages > 0 else 0
        
        # 2. 응답 유발 영향력 (다른 사람들이 응답하는 정도)
        response_triggers = 0
        for i, msg in enumerate(all_messages):
            if msg.sender == person_name and i < len(all_messages) - 1:
                # 다음 5개 메시지 내에 다른 사람의 응답이 있는지 확인
                for j in range(i + 1, min(i + 6, len(all_messages))):
                    if all_messages[j].sender != person_name:
                        response_triggers += 1
                        break
                        
        response_influence = response_triggers / person_message_count if person_message_count > 0 else 0
        
        # 3. 키워드 영향력 (중요 키워드 사용 빈도)
        important_keywords = ["중요", "결정", "제안", "문제", "해결", "필요", "검토"]
        keyword_usage = sum(1 for msg in person_messages for keyword in important_keywords 
                          if keyword in msg.content)
        keyword_influence = keyword_usage / person_message_count if person_message_count > 0 else 0
        
        # 4. 시간 분산 영향력 (지속적 참여도)
        if person_messages:
            time_spans = []
            sorted_msgs = sorted(person_messages, key=lambda x: x.timestamp)
            for i in range(1, len(sorted_msgs)):
                time_diff = (sorted_msgs[i].timestamp - sorted_msgs[i-1].timestamp).total_seconds()
                time_spans.append(time_diff)
            
            if time_spans:
                avg_interval = sum(time_spans) / len(time_spans)
                time_influence = min(1.0, 3600 / avg_interval) if avg_interval > 0 else 0  # 1시간 기준
            else:
                time_influence = 0.5
        else:
            time_influence = 0
            
        # 5. 감정 영향력 (감정적 반응 유발)
        emotional_words = ["우려", "걱정", "기대", "만족", "불만", "화나", "기쁘"]
        emotional_usage = sum(1 for msg in person_messages for word in emotional_words 
                            if word in msg.content)
        emotion_influence = emotional_usage / person_message_count if person_message_count > 0 else 0
        
        # 종합 영향력 계산
        overall_influence = (
            frequency_influence * 0.25 +
            response_influence * 0.30 +
            keyword_influence * 0.20 +
            time_influence * 0.15 +
            emotion_influence * 0.10
        )
        
        metrics = {
            "overall_influence": overall_influence,
            "frequency_influence": frequency_influence,
            "response_influence": response_influence,
            "keyword_influence": keyword_influence,
            "time_influence": time_influence,
            "emotion_influence": emotion_influence,
            "message_count": person_message_count,
            "response_triggers": response_triggers
        }
        
        return metrics
        
    def _map_relationships(self, person_name: str, all_messages: List[ChatMessage]) -> Dict[str, str]:
        """관계 맵핑"""
        relationships = {}
        person_messages = [msg for msg in all_messages if msg.sender == person_name]
        
        # 다른 참여자들과의 관계 분석
        other_participants = set(msg.sender for msg in all_messages if msg.sender != person_name)
        
        for other_person in other_participants:
            relationship_type = self._analyze_relationship_type(
                person_name, other_person, all_messages
            )
            relationships[other_person] = relationship_type
            
        return relationships
        
    def _analyze_relationship_type(self, 
                                 person1: str, 
                                 person2: str, 
                                 all_messages: List[ChatMessage]) -> str:
        """두 사람 간 관계 유형 분석"""
        
        person1_msgs = [msg for msg in all_messages if msg.sender == person1]
        person2_msgs = [msg for msg in all_messages if msg.sender == person2]
        
        # 상호작용 패턴 분석
        agreement_count = 0
        disagreement_count = 0
        
        for msg1 in person1_msgs:
            for msg2 in person2_msgs:
                # 시간적으로 가까운 메시지들 분석
                time_diff = abs((msg1.timestamp - msg2.timestamp).total_seconds())
                if time_diff < 1800:  # 30분 이내
                    
                    # 동의/반대 패턴 분석
                    agreement_keywords = ["동의", "찬성", "맞다", "좋다", "적절"]
                    disagreement_keywords = ["반대", "동의할수없", "문제", "우려", "의문"]
                    
                    if any(keyword in msg2.content for keyword in agreement_keywords):
                        if any(keyword in msg1.content for keyword in agreement_keywords):
                            agreement_count += 1
                            
                    if any(keyword in msg2.content for keyword in disagreement_keywords):
                        if any(keyword in msg1.content for keyword in disagreement_keywords):
                            disagreement_count += 1
                            
        # 관계 유형 결정
        if agreement_count > disagreement_count * 2:
            return "협력적"
        elif disagreement_count > agreement_count * 2:
            return "대립적"
        elif agreement_count + disagreement_count > 0:
            return "경쟁적"
        else:
            return "중립적"
            
    def _analyze_behavioral_patterns(self, messages: List[ChatMessage]) -> Dict[str, Any]:
        """행동 패턴 분석"""
        patterns = {}
        
        if not messages:
            return patterns
            
        # 1. 시간별 활동 패턴
        hourly_activity = defaultdict(int)
        for msg in messages:
            hour = msg.timestamp.hour
            hourly_activity[hour] += 1
            
        peak_hours = sorted(hourly_activity.items(), key=lambda x: x[1], reverse=True)[:3]
        patterns["peak_activity_hours"] = [f"{hour}시({count}회)" for hour, count in peak_hours]
        
        # 2. 메시지 길이 패턴
        message_lengths = [len(msg.content) for msg in messages]
        avg_length = sum(message_lengths) / len(message_lengths)
        patterns["avg_message_length"] = round(avg_length, 1)
        patterns["message_style"] = "상세형" if avg_length > 100 else "간결형"
        
        # 3. 응답 속도 패턴
        sorted_msgs = sorted(messages, key=lambda x: x.timestamp)
        response_times = []
        for i in range(1, len(sorted_msgs)):
            time_diff = (sorted_msgs[i].timestamp - sorted_msgs[i-1].timestamp).total_seconds()
            if time_diff < 3600:  # 1시간 이내만 고려
                response_times.append(time_diff)
                
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            patterns["avg_response_time"] = f"{avg_response_time/60:.1f}분"
            patterns["response_style"] = "즉시형" if avg_response_time < 300 else "신중형"
        
        # 4. 주제 전환 패턴
        topic_switches = 0
        current_topic_keywords = set()
        
        for msg in sorted_msgs:
            msg_keywords = set(re.findall(r'\b\w{2,}\b', msg.content))
            if current_topic_keywords and len(msg_keywords & current_topic_keywords) < 2:
                topic_switches += 1
            current_topic_keywords = msg_keywords
            
        patterns["topic_switches"] = topic_switches
        patterns["topic_consistency"] = "일관성있음" if topic_switches < len(messages) * 0.3 else "다양함"
        
        return patterns
        
    def _generate_predictive_insights(self, 
                                    person_name: str,
                                    person_messages: List[ChatMessage],
                                    all_messages: List[ChatMessage]) -> Dict[str, Any]:
        """예측적 인사이트 생성"""
        insights = {}
        
        # 1. 참여 지속성 예측
        if len(person_messages) >= 3:
            recent_msgs = sorted(person_messages, key=lambda x: x.timestamp)[-3:]
            time_intervals = []
            for i in range(1, len(recent_msgs)):
                interval = (recent_msgs[i].timestamp - recent_msgs[i-1].timestamp).total_seconds()
                time_intervals.append(interval)
                
            if time_intervals:
                avg_interval = sum(time_intervals) / len(time_intervals)
                if avg_interval < 1800:  # 30분
                    insights["participation_likelihood"] = "높음"
                elif avg_interval < 3600:  # 1시간
                    insights["participation_likelihood"] = "보통"
                else:
                    insights["participation_likelihood"] = "낮음"
        
        # 2. 입장 변화 가능성
        if len(person_messages) >= 5:
            early_msgs = person_messages[:len(person_messages)//2]
            late_msgs = person_messages[len(person_messages)//2:]
            
            early_sentiment = self._quick_sentiment_analysis(early_msgs)
            late_sentiment = self._quick_sentiment_analysis(late_msgs)
            
            if abs(early_sentiment - late_sentiment) > 0.3:
                insights["stance_flexibility"] = "유연함"
            else:
                insights["stance_flexibility"] = "일관됨"
                
        # 3. 영향력 변화 추세
        if len(person_messages) >= 4:
            first_half = person_messages[:len(person_messages)//2]
            second_half = person_messages[len(person_messages)//2:]
            
            first_influence = self._calculate_mini_influence(first_half, all_messages)
            second_influence = self._calculate_mini_influence(second_half, all_messages)
            
            if second_influence > first_influence * 1.2:
                insights["influence_trend"] = "상승"
            elif second_influence < first_influence * 0.8:
                insights["influence_trend"] = "하락"
            else:
                insights["influence_trend"] = "안정"
                
        # 4. 갈등 해결 기여도 예측
        conflict_keywords = ["문제", "해결", "타협", "합의", "절충"]
        mediation_score = sum(1 for msg in person_messages 
                            for keyword in conflict_keywords if keyword in msg.content)
        
        if mediation_score >= 2:
            insights["conflict_resolution_potential"] = "높음"
        elif mediation_score == 1:
            insights["conflict_resolution_potential"] = "보통"
        else:
            insights["conflict_resolution_potential"] = "낮음"
            
        return insights
        
    def _quick_sentiment_analysis(self, messages: List[ChatMessage]) -> float:
        """빠른 감정 분석"""
        positive_words = ["좋다", "만족", "효과적", "적절", "찬성"]
        negative_words = ["문제", "우려", "반대", "불만", "걱정"]
        
        positive_count = sum(1 for msg in messages for word in positive_words 
                           if word in msg.content)
        negative_count = sum(1 for msg in messages for word in negative_words 
                           if word in msg.content)
        
        total_count = positive_count + negative_count
        if total_count == 0:
            return 0.0
            
        return (positive_count - negative_count) / total_count
        
    def _calculate_mini_influence(self, messages: List[ChatMessage], all_messages: List[ChatMessage]) -> float:
        """간소화된 영향력 계산"""
        if not messages:
            return 0.0
            
        # 메시지 수 비율
        msg_ratio = len(messages) / len(all_messages) if all_messages else 0
        
        # 키워드 점수
        important_keywords = ["중요", "제안", "결정", "해결"]
        keyword_score = sum(1 for msg in messages for keyword in important_keywords 
                          if keyword in msg.content) / len(messages)
        
        return (msg_ratio + keyword_score) / 2
        
    def _analyze_communication_style(self, messages: List[ChatMessage]) -> Dict[str, Any]:
        """커뮤니케이션 스타일 분석"""
        style = {}
        
        if not messages:
            return style
            
        # 1. 공식성 수준
        formal_indicators = ["습니다", "드립니다", "바랍니다", "해주시기"]
        informal_indicators = ["해요", "그죠", "~네", "~거든요"]
        
        formal_count = sum(1 for msg in messages for indicator in formal_indicators 
                         if indicator in msg.content)
        informal_count = sum(1 for msg in messages for indicator in informal_indicators 
                           if indicator in msg.content)
        
        if formal_count > informal_count * 2:
            style["formality_level"] = "매우 공식적"
        elif formal_count > informal_count:
            style["formality_level"] = "공식적"
        elif informal_count > formal_count:
            style["formality_level"] = "비공식적"
        else:
            style["formality_level"] = "보통"
            
        # 2. 논리성 vs 감정성
        logical_indicators = ["따라서", "그러므로", "왜냐하면", "결론적으로"]
        emotional_indicators = ["정말", "너무", "매우", "완전히"]
        
        logical_score = sum(1 for msg in messages for indicator in logical_indicators 
                          if indicator in msg.content)
        emotional_score = sum(1 for msg in messages for indicator in emotional_indicators 
                            if indicator in msg.content)
        
        if logical_score > emotional_score:
            style["reasoning_style"] = "논리적"
        elif emotional_score > logical_score:
            style["reasoning_style"] = "감정적"
        else:
            style["reasoning_style"] = "균형적"
            
        # 3. 직접성 수준
        direct_indicators = ["명확히", "분명히", "확실히", "단언"]
        indirect_indicators = ["아마", "혹시", "~것 같다", "~할 수도"]
        
        direct_score = sum(1 for msg in messages for indicator in direct_indicators 
                         if indicator in msg.content)
        indirect_score = sum(1 for msg in messages for indicator in indirect_indicators 
                           if indicator in msg.content)
        
        if direct_score > indirect_score:
            style["directness_level"] = "직접적"
        elif indirect_score > direct_score:
            style["directness_level"] = "간접적"
        else:
            style["directness_level"] = "보통"
            
        return style
        
    def _extract_key_quotes(self, messages: List[ChatMessage]) -> List[str]:
        """핵심 인용문 추출 (원문 유지)"""
        quotes = []
        
        for msg in messages:
            content = msg.content
            
            # 중요도 계산
            importance_score = 0
            
            # 길이 기준
            if len(content) > 80:
                importance_score += 2
                
            # 키워드 기준
            important_keywords = ["중요", "문제", "제안", "결정", "우려", "반대", "찬성", "해결"]
            keyword_count = sum(1 for keyword in important_keywords if keyword in content)
            importance_score += keyword_count
            
            # 감정 강도 기준
            strong_emotions = ["심각한", "매우", "절대", "반드시", "꼭"]
            emotion_count = sum(1 for emotion in strong_emotions if emotion in content)
            importance_score += emotion_count
            
            # 중요도 임계값 초과시 인용문으로 추가
            if importance_score >= 3:
                quotes.append(f'"{content}"')
                
        return quotes[:5]  # 상위 5개
        
    def _create_analysis_summary(self, 
                               person_name: str,
                               emotion_analysis: EmotionAnalysis,
                               intent_patterns: List[IntentAnalysis],
                               influence_metrics: Dict[str, float]) -> str:
        """분석 요약 생성 (평어)"""
        
        # 주요 감정
        emotion_desc = emotion_analysis.primary_emotion.value
        
        # 주요 의도
        if intent_patterns:
            main_intents = [pattern.primary_intent.value for pattern in intent_patterns]
            intent_counter = Counter(main_intents)
            most_common_intent = intent_counter.most_common(1)[0][0] if intent_counter else "정보전달"
        else:
            most_common_intent = "정보전달"
            
        # 영향력 수준
        overall_influence = influence_metrics.get("overall_influence", 0)
        if overall_influence > 0.7:
            influence_level = "높음"
        elif overall_influence > 0.4:
            influence_level = "보통"
        else:
            influence_level = "낮음"
            
        # 메시지 수
        message_count = influence_metrics.get("message_count", 0)
        
        summary = f"{person_name}은 주로 {emotion_desc} 감정을 보이며 {most_common_intent} 의도로 {message_count}회 발언함. 전체적인 영향력은 {influence_level} 수준임."
        
        return summary 

    def _analyze_conversation_dynamics(self, messages: List[ChatMessage]) -> ConversationDynamics:
        """대화 역학 분석"""
        
        participants = list(set(msg.sender for msg in messages))
        
        # 1. 참여 패턴 분석
        participation_pattern = self._analyze_participation_pattern(messages, participants)
        
        # 2. 영향력 네트워크 분석
        influence_network = self._build_influence_network(messages, participants)
        
        # 3. 주제별 리더십 분석
        topic_leadership = self._analyze_topic_leadership(messages, participants)
        
        # 4. 갈등 강도 측정
        conflict_intensity = self._measure_conflict_intensity(messages)
        
        # 5. 합의 형성 과정 분석
        consensus_formation = self._analyze_consensus_formation(messages)
        
        # 6. 커뮤니케이션 효율성 측정
        communication_efficiency = self._measure_communication_efficiency(messages)
        
        return ConversationDynamics(
            participation_pattern=participation_pattern,
            influence_network=influence_network,
            topic_leadership=topic_leadership,
            conflict_intensity=conflict_intensity,
            consensus_formation=consensus_formation,
            communication_efficiency=communication_efficiency
        )
        
    def _analyze_participation_pattern(self, messages: List[ChatMessage], participants: List[str]) -> Dict[str, float]:
        """참여 패턴 분석"""
        pattern = {}
        total_messages = len(messages)
        
        for participant in participants:
            participant_messages = [msg for msg in messages if msg.sender == participant]
            
            # 기본 참여율
            participation_rate = len(participant_messages) / total_messages if total_messages > 0 else 0
            
            # 시간적 분산 (지속적 참여도)
            if len(participant_messages) > 1:
                timestamps = [msg.timestamp for msg in participant_messages]
                timestamps.sort()
                
                total_time = (timestamps[-1] - timestamps[0]).total_seconds()
                if total_time > 0:
                    time_distribution = []
                    for i in range(1, len(timestamps)):
                        interval = (timestamps[i] - timestamps[i-1]).total_seconds()
                        time_distribution.append(interval)
                    
                    # 시간 분산의 역수 (낮을수록 지속적 참여)
                    if time_distribution:
                        avg_interval = sum(time_distribution) / len(time_distribution)
                        time_consistency = min(1.0, 3600 / avg_interval) if avg_interval > 0 else 0
                    else:
                        time_consistency = 0.5
                else:
                    time_consistency = 0.5
            else:
                time_consistency = 0.1
                
            # 종합 참여 점수
            pattern[participant] = (participation_rate * 0.7 + time_consistency * 0.3)
            
        return pattern
        
    def _build_influence_network(self, messages: List[ChatMessage], participants: List[str]) -> Dict[str, Dict[str, float]]:
        """영향력 네트워크 구축"""
        network = defaultdict(lambda: defaultdict(float))
        
        # 시간순 정렬
        sorted_messages = sorted(messages, key=lambda x: x.timestamp)
        
        for i, msg in enumerate(sorted_messages):
            sender = msg.sender
            
            # 다음 5개 메시지 내에서 응답 관계 분석
            for j in range(i + 1, min(i + 6, len(sorted_messages))):
                responder = sorted_messages[j].sender
                
                if responder != sender:
                    # 시간 간격에 따른 가중치
                    time_diff = (sorted_messages[j].timestamp - msg.timestamp).total_seconds()
                    if time_diff < 1800:  # 30분 이내
                        weight = max(0.1, 1.0 - (time_diff / 1800))
                        
                        # 내용 관련성 분석
                        content_similarity = self._calculate_content_similarity(
                            msg.content, sorted_messages[j].content
                        )
                        
                        final_weight = weight * content_similarity
                        network[sender][responder] += final_weight
                        
        return dict(network)
        
    def _calculate_content_similarity(self, content1: str, content2: str) -> float:
        """내용 유사도 계산"""
        # 키워드 기반 유사도
        words1 = set(re.findall(r'\b\w{2,}\b', content1))
        words2 = set(re.findall(r'\b\w{2,}\b', content2))
        
        if not words1 or not words2:
            return 0.1
            
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        
        jaccard_similarity = intersection / union if union > 0 else 0
        
        # 최소 기본 점수 보장
        return max(0.1, jaccard_similarity)
        
    def _analyze_topic_leadership(self, messages: List[ChatMessage], participants: List[str]) -> Dict[str, List[str]]:
        """주제별 리더십 분석"""
        topics = {
            "총회운영": ["총회", "회의", "안건", "절차"],
            "운영권": ["운영권", "위탁", "파르나스", "GS"],
            "시공사": ["시공사", "건설", "계약", "입찰"],
            "분담금": ["분담금", "비용", "부담", "자금"],
            "절차": ["절차", "투명성", "검토", "신중"]
        }
        
        topic_leadership = defaultdict(list)
        
        for topic_name, keywords in topics.items():
            topic_messages = [msg for msg in messages 
                            if any(keyword in msg.content for keyword in keywords)]
            
            if topic_messages:
                # 각 참여자의 주제별 기여도 계산
                participant_contributions = defaultdict(int)
                
                for msg in topic_messages:
                    # 메시지 길이와 키워드 밀도로 기여도 계산
                    keyword_count = sum(1 for keyword in keywords if keyword in msg.content)
                    contribution_score = len(msg.content) * keyword_count
                    participant_contributions[msg.sender] += contribution_score
                    
                # 상위 리더들 선정
                sorted_contributors = sorted(participant_contributions.items(), 
                                           key=lambda x: x[1], reverse=True)
                
                leaders = [participant for participant, score in sorted_contributors[:3] if score > 0]
                topic_leadership[topic_name] = leaders
                
        return dict(topic_leadership)
        
    def _measure_conflict_intensity(self, messages: List[ChatMessage]) -> float:
        """갈등 강도 측정"""
        conflict_indicators = [
            "반대", "동의할수없", "문제", "우려", "의문", "비판", 
            "잘못", "틀렸", "안된다", "부당", "불공평"
        ]
        
        agreement_indicators = [
            "동의", "찬성", "맞다", "좋다", "적절", "합리적", 
            "효과적", "바람직", "공감"
        ]
        
        conflict_count = sum(1 for msg in messages 
                           for indicator in conflict_indicators 
                           if indicator in msg.content)
        
        agreement_count = sum(1 for msg in messages 
                            for indicator in agreement_indicators 
                            if indicator in msg.content)
        
        total_indicators = conflict_count + agreement_count
        if total_indicators == 0:
            return 0.0
            
        conflict_ratio = conflict_count / total_indicators
        
        # 정규화 (0.0 ~ 1.0)
        return min(1.0, conflict_ratio * 2)
        
    def _analyze_consensus_formation(self, messages: List[ChatMessage]) -> Dict[str, Any]:
        """합의 형성 과정 분석"""
        consensus_data = {}
        
        # 시간순 메시지로 합의 진행 과정 추적
        sorted_messages = sorted(messages, key=lambda x: x.timestamp)
        
        time_windows = []
        window_size = max(1, len(sorted_messages) // 5)  # 5개 구간으로 나눔
        
        for i in range(0, len(sorted_messages), window_size):
            window_messages = sorted_messages[i:i + window_size]
            time_windows.append(window_messages)
            
        # 각 시간 구간별 합의 수준 측정
        consensus_progression = []
        
        for i, window in enumerate(time_windows):
            agreement_score = self._calculate_agreement_score(window)
            consensus_progression.append({
                "time_period": i + 1,
                "agreement_level": agreement_score,
                "message_count": len(window)
            })
            
        consensus_data["progression"] = consensus_progression
        
        # 최종 합의 상태
        if consensus_progression:
            final_agreement = consensus_progression[-1]["agreement_level"]
            if final_agreement > 0.7:
                consensus_data["final_status"] = "높은 합의"
            elif final_agreement > 0.4:
                consensus_data["final_status"] = "부분 합의"
            else:
                consensus_data["final_status"] = "낮은 합의"
        else:
            consensus_data["final_status"] = "측정 불가"
            
        # 합의 형성 속도
        if len(consensus_progression) > 1:
            initial_agreement = consensus_progression[0]["agreement_level"]
            final_agreement = consensus_progression[-1]["agreement_level"]
            consensus_data["formation_speed"] = final_agreement - initial_agreement
        else:
            consensus_data["formation_speed"] = 0.0
            
        return consensus_data
        
    def _calculate_agreement_score(self, messages: List[ChatMessage]) -> float:
        """합의 점수 계산"""
        if not messages:
            return 0.0
            
        positive_indicators = ["동의", "찬성", "좋다", "적절", "맞다", "효과적"]
        negative_indicators = ["반대", "문제", "우려", "의문", "불만", "안된다"]
        
        positive_count = sum(1 for msg in messages 
                           for indicator in positive_indicators 
                           if indicator in msg.content)
        
        negative_count = sum(1 for msg in messages 
                           for indicator in negative_indicators 
                           if indicator in msg.content)
        
        total_count = positive_count + negative_count
        if total_count == 0:
            return 0.5  # 중립
            
        return positive_count / total_count
        
    def _measure_communication_efficiency(self, messages: List[ChatMessage]) -> float:
        """커뮤니케이션 효율성 측정"""
        if len(messages) < 2:
            return 0.0
            
        # 1. 응답 속도 효율성
        sorted_messages = sorted(messages, key=lambda x: x.timestamp)
        response_times = []
        
        for i in range(1, len(sorted_messages)):
            time_diff = (sorted_messages[i].timestamp - sorted_messages[i-1].timestamp).total_seconds()
            if time_diff < 3600:  # 1시간 이내만 고려
                response_times.append(time_diff)
                
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            # 빠른 응답일수록 높은 점수 (최대 30분 기준)
            response_efficiency = max(0, 1 - (avg_response_time / 1800))
        else:
            response_efficiency = 0.5
            
        # 2. 내용 관련성 효율성
        relevant_transitions = 0
        total_transitions = len(messages) - 1
        
        for i in range(1, len(sorted_messages)):
            prev_content = sorted_messages[i-1].content
            curr_content = sorted_messages[i].content
            
            similarity = self._calculate_content_similarity(prev_content, curr_content)
            if similarity > 0.3:  # 30% 이상 관련성
                relevant_transitions += 1
                
        content_efficiency = relevant_transitions / total_transitions if total_transitions > 0 else 0
        
        # 3. 참여자 분산 효율성
        participants = set(msg.sender for msg in messages)
        participant_count = len(participants)
        
        # 적절한 참여자 수 (2-6명이 이상적)
        if 2 <= participant_count <= 6:
            participation_efficiency = 1.0
        elif participant_count < 2:
            participation_efficiency = participant_count / 2
        else:
            participation_efficiency = max(0.3, 6 / participant_count)
            
        # 종합 효율성
        overall_efficiency = (
            response_efficiency * 0.4 +
            content_efficiency * 0.4 +
            participation_efficiency * 0.2
        )
        
        return overall_efficiency
        
    def _create_advanced_topic_analyses(self, messages: List[ChatMessage]) -> List[TopicAnalysisAdvanced]:
        """고도화된 주제 분석"""
        topics = {
            "총회 운영": {
                "keywords": ["총회", "회의", "안건", "절차", "참석", "위임장"],
                "stakeholders": ["실무진", "조합원", "임원"]
            },
            "운영권 논란": {
                "keywords": ["운영권", "위탁", "파르나스", "GS", "외부", "내부"],
                "stakeholders": ["찬성파", "반대파", "중재자"]
            },
            "시공사 선정": {
                "keywords": ["시공사", "건설", "계약", "입찰", "선정", "업체"],
                "stakeholders": ["전문가", "조합원", "실무진"]
            },
            "비용 분담": {
                "keywords": ["분담금", "비용", "부담", "자금", "예산", "경비"],
                "stakeholders": ["회계담당", "조합원", "감사"]
            }
        }
        
        topic_analyses = []
        
        for topic_name, topic_info in topics.items():
            keywords = topic_info["keywords"]
            
            # 해당 주제 메시지 필터링
            topic_messages = [msg for msg in messages 
                            if any(keyword in msg.content for keyword in keywords)]
            
            if not topic_messages:
                continue
                
            # 이해관계자별 입장 분석
            stakeholder_positions = self._analyze_stakeholder_positions(topic_messages, keywords)
            
            # 논증 맵핑
            argument_mapping = self._map_arguments(topic_messages, keywords)
            
            # 합의 확률 계산
            consensus_probability = self._calculate_consensus_probability(topic_messages)
            
            # 해결 경로 분석
            resolution_pathways = self._identify_resolution_pathways(topic_messages)
            
            # 감정적 공명 분석
            emotional_resonance = self._analyze_emotional_resonance(topic_messages)
            
            # 핵심 전환점 식별
            key_turning_points = self._identify_turning_points(topic_messages)
            
            # 핵심 논거 인용문 추출
            quoted_key_arguments = self._extract_key_arguments(topic_messages)
            
            topic_analysis = TopicAnalysisAdvanced(
                topic_name=topic_name,
                stakeholder_positions=stakeholder_positions,
                argument_mapping=argument_mapping,
                consensus_probability=consensus_probability,
                resolution_pathways=resolution_pathways,
                emotional_resonance=emotional_resonance,
                key_turning_points=key_turning_points,
                quoted_key_arguments=quoted_key_arguments
            )
            
            topic_analyses.append(topic_analysis)
            
        return topic_analyses
        
    def _analyze_stakeholder_positions(self, messages: List[ChatMessage], keywords: List[str]) -> Dict[str, Dict[str, Any]]:
        """이해관계자별 입장 분석"""
        positions = defaultdict(lambda: defaultdict(list))
        
        for msg in messages:
            sender = msg.sender
            content = msg.content
            
            # 입장 표명 키워드 분석
            support_keywords = ["찬성", "동의", "좋다", "효과적", "적절", "바람직"]
            oppose_keywords = ["반대", "우려", "문제", "의문", "부적절", "위험"]
            neutral_keywords = ["검토", "신중", "고려", "살펴보", "판단"]
            
            support_count = sum(1 for keyword in support_keywords if keyword in content)
            oppose_count = sum(1 for keyword in oppose_keywords if keyword in content)
            neutral_count = sum(1 for keyword in neutral_keywords if keyword in content)
            
            # 입장 결정
            if support_count > oppose_count and support_count > neutral_count:
                stance = "지지"
                confidence = support_count / (support_count + oppose_count + neutral_count)
            elif oppose_count > support_count and oppose_count > neutral_count:
                stance = "반대"
                confidence = oppose_count / (support_count + oppose_count + neutral_count)
            else:
                stance = "중립"
                confidence = neutral_count / (support_count + oppose_count + neutral_count) if (support_count + oppose_count + neutral_count) > 0 else 0
                
            positions[sender] = {
                "stance": stance,
                "confidence": confidence,
                "key_arguments": [content] if len(content) > 50 else [],
                "message_count": positions[sender].get("message_count", 0) + 1
            }
            
        return dict(positions) 

    def _generate_ai_insights(self, 
                           messages: List[ChatMessage],
                           person_profiles: List[AdvancedPersonProfile],
                           topic_analyses: List[TopicAnalysisAdvanced]) -> Dict[str, Any]:
        """AI 인사이트 생성"""
        insights = {}
        
        # 1. 대화 패턴 인사이트
        insights["conversation_patterns"] = self._analyze_conversation_patterns(messages)
        
        # 2. 영향력 역학 인사이트
        insights["influence_dynamics"] = self._analyze_influence_dynamics(person_profiles)
        
        # 3. 감정 흐름 인사이트
        insights["emotional_flow"] = self._analyze_emotional_flow(person_profiles)
        
        # 4. 주제별 역학 인사이트
        insights["topic_dynamics"] = self._analyze_topic_dynamics(topic_analyses)
        
        # 5. 의사결정 패턴 인사이트
        insights["decision_patterns"] = self._analyze_decision_patterns(messages)
        
        # 6. 한국 문화적 인사이트
        insights["cultural_insights"] = self._analyze_korean_cultural_dynamics(messages, person_profiles)
        
        return insights
        
    def _analyze_conversation_patterns(self, messages: List[ChatMessage]) -> Dict[str, Any]:
        """대화 패턴 분석"""
        patterns = {}
        
        # 시간대별 활동 패턴
        hourly_distribution = defaultdict(int)
        for msg in messages:
            hour = msg.timestamp.hour
            hourly_distribution[hour] += 1
            
        peak_hour = max(hourly_distribution, key=hourly_distribution.get) if hourly_distribution else 0
        patterns["peak_activity_hour"] = f"{peak_hour}시"
        
        # 대화 밀도 분석
        if len(messages) > 1:
            sorted_msgs = sorted(messages, key=lambda x: x.timestamp)
            total_time = (sorted_msgs[-1].timestamp - sorted_msgs[0].timestamp).total_seconds()
            density = len(messages) / (total_time / 3600) if total_time > 0 else 0
            patterns["conversation_density"] = f"{density:.1f}개/시간"
        
        # 참여자 교대 패턴
        speakers = [msg.sender for msg in sorted(messages, key=lambda x: x.timestamp)]
        speaker_changes = sum(1 for i in range(1, len(speakers)) if speakers[i] != speakers[i-1])
        patterns["speaker_transitions"] = speaker_changes
        patterns["conversation_flow"] = "활발한 교대" if speaker_changes > len(messages) * 0.6 else "단조로운 진행"
        
        return patterns
        
    def _analyze_influence_dynamics(self, person_profiles: List[AdvancedPersonProfile]) -> Dict[str, Any]:
        """영향력 역학 분석"""
        dynamics = {}
        
        # 영향력 분포
        influences = [(p.person_name, p.influence_metrics.get("overall_influence", 0)) 
                     for p in person_profiles]
        influences.sort(key=lambda x: x[1], reverse=True)
        
        if influences:
            dynamics["top_influencer"] = influences[0][0]
            dynamics["influence_concentration"] = influences[0][1] / sum(inf[1] for inf in influences) if sum(inf[1] for inf in influences) > 0 else 0
            
            # 영향력 격차
            if len(influences) > 1:
                dynamics["influence_gap"] = influences[0][1] - influences[1][1]
            
        # 영향력 네트워크 중심성
        network_centralities = {}
        for profile in person_profiles:
            # 관계 맵에서 중심성 계산
            connections = len([rel for rel in profile.relationship_map.values() if rel in ["협력적", "경쟁적"]])
            network_centralities[profile.person_name] = connections
            
        dynamics["network_centralities"] = network_centralities
        
        return dynamics
        
    def _analyze_emotional_flow(self, person_profiles: List[AdvancedPersonProfile]) -> Dict[str, Any]:
        """감정 흐름 분석"""
        flow = {}
        
        # 전체 감정 분포
        emotions = [profile.emotion_profile.primary_emotion.value for profile in person_profiles]
        emotion_counter = Counter(emotions)
        flow["dominant_emotions"] = dict(emotion_counter.most_common(3))
        
        # 감정 강도 평균
        intensities = [profile.emotion_profile.emotion_intensity for profile in person_profiles]
        flow["average_intensity"] = sum(intensities) / len(intensities) if intensities else 0
        
        # 감정 궤적 분석
        trajectories = []
        for profile in person_profiles:
            if profile.emotion_profile.emotion_trajectory:
                trajectory = profile.emotion_profile.emotion_trajectory
                trajectories.extend(trajectory)
                
        if trajectories:
            trajectories.sort(key=lambda x: x[0])  # 시간순 정렬
            flow["emotional_progression"] = [
                {
                    "time": traj[0].strftime("%H:%M"),
                    "emotion": traj[1].value,
                    "intensity": traj[2]
                } for traj in trajectories[-10:]  # 최근 10개
            ]
            
        return flow
        
    def _analyze_topic_dynamics(self, topic_analyses: List[TopicAnalysisAdvanced]) -> Dict[str, Any]:
        """주제별 역학 분석"""
        dynamics = {}
        
        # 가장 논란이 많은 주제
        controversial_topics = []
        for topic in topic_analyses:
            controversy_score = 1.0 - topic.consensus_probability
            controversial_topics.append((topic.topic_name, controversy_score))
            
        controversial_topics.sort(key=lambda x: x[1], reverse=True)
        
        if controversial_topics:
            dynamics["most_controversial"] = controversial_topics[0][0]
            dynamics["controversy_scores"] = dict(controversial_topics)
            
        # 해결 가능성이 높은 주제
        resolvable_topics = [(topic.topic_name, topic.consensus_probability) 
                           for topic in topic_analyses]
        resolvable_topics.sort(key=lambda x: x[1], reverse=True)
        
        if resolvable_topics:
            dynamics["most_resolvable"] = resolvable_topics[0][0]
            dynamics["resolution_probabilities"] = dict(resolvable_topics)
            
        return dynamics
        
    def _analyze_decision_patterns(self, messages: List[ChatMessage]) -> Dict[str, Any]:
        """의사결정 패턴 분석"""
        patterns = {}
        
        # 결정 관련 키워드 분석
        decision_keywords = ["결정", "선택", "채택", "승인", "거부", "보류"]
        decision_messages = [msg for msg in messages 
                           if any(keyword in msg.content for keyword in decision_keywords)]
        
        patterns["decision_points"] = len(decision_messages)
        
        if decision_messages:
            # 결정 속도
            sorted_msgs = sorted(messages, key=lambda x: x.timestamp)
            if len(sorted_msgs) > 1:
                total_time = (sorted_msgs[-1].timestamp - sorted_msgs[0].timestamp).total_seconds()
                decisions_per_hour = len(decision_messages) / (total_time / 3600) if total_time > 0 else 0
                patterns["decision_speed"] = f"{decisions_per_hour:.2f}개/시간"
                
            # 결정 방식 분석
            consensus_indicators = ["합의", "동의", "만장일치"]
            majority_indicators = ["다수", "과반", "표결"]
            authority_indicators = ["결정권자", "승인", "지시"]
            
            consensus_count = sum(1 for msg in decision_messages 
                                for indicator in consensus_indicators 
                                if indicator in msg.content)
            majority_count = sum(1 for msg in decision_messages 
                               for indicator in majority_indicators 
                               if indicator in msg.content)
            authority_count = sum(1 for msg in decision_messages 
                                for indicator in authority_indicators 
                                if indicator in msg.content)
            
            total = consensus_count + majority_count + authority_count
            if total > 0:
                if consensus_count >= majority_count and consensus_count >= authority_count:
                    patterns["primary_decision_style"] = "합의형"
                elif majority_count >= authority_count:
                    patterns["primary_decision_style"] = "다수결형"
                else:
                    patterns["primary_decision_style"] = "권위형"
                    
        return patterns
        
    def _analyze_korean_cultural_dynamics(self, 
                                        messages: List[ChatMessage],
                                        person_profiles: List[AdvancedPersonProfile]) -> Dict[str, Any]:
        """한국 문화적 역학 분석"""
        cultural = {}
        
        # 1. 위계 존중 수준
        hierarchy_indicators = ["선배님", "선생님", "회장님", "위원장님", "존경", "예의"]
        hierarchy_count = sum(1 for msg in messages 
                            for indicator in hierarchy_indicators 
                            if indicator in msg.content)
        cultural["hierarchy_respect"] = "높음" if hierarchy_count > len(messages) * 0.1 else "보통"
        
        # 2. 집단 화합 추구
        harmony_indicators = ["화합", "단합", "협력", "상생", "함께", "모두"]
        harmony_count = sum(1 for msg in messages 
                          for indicator in harmony_indicators 
                          if indicator in msg.content)
        cultural["harmony_seeking"] = "강함" if harmony_count > len(messages) * 0.15 else "보통"
        
        # 3. 체면 고려
        face_indicators = ["체면", "명예", "신중", "배려", "예의", "염려"]
        face_count = sum(1 for msg in messages 
                       for indicator in face_indicators 
                       if indicator in msg.content)
        cultural["face_consideration"] = "높음" if face_count > len(messages) * 0.1 else "보통"
        
        # 4. 정서적 소통
        emotion_indicators = ["마음", "정", "이해", "공감", "감정", "느낌"]
        emotion_count = sum(1 for msg in messages 
                          for indicator in emotion_indicators 
                          if indicator in msg.content)
        cultural["emotional_communication"] = "활발함" if emotion_count > len(messages) * 0.1 else "보통"
        
        # 5. 갈등 회피 성향
        conflict_avoidance = ["신중", "조심", "염려", "우려", "검토", "고려"]
        avoidance_count = sum(1 for msg in messages 
                            for indicator in conflict_avoidance 
                            if indicator in msg.content)
        cultural["conflict_avoidance"] = "높음" if avoidance_count > len(messages) * 0.2 else "보통"
        
        return cultural
        
    def _predict_outcomes(self, 
                        messages: List[ChatMessage],
                        person_profiles: List[AdvancedPersonProfile],
                        topic_analyses: List[TopicAnalysisAdvanced]) -> Dict[str, Any]:
        """예측적 결과 분석"""
        predictions = {}
        
        # 1. 참여 지속성 예측
        predictions["participation_forecast"] = self._predict_participation_trends(person_profiles)
        
        # 2. 주제별 해결 가능성 예측
        predictions["resolution_forecast"] = self._predict_topic_resolutions(topic_analyses)
        
        # 3. 갈등 에스컬레이션 위험도
        predictions["conflict_escalation_risk"] = self._assess_conflict_escalation_risk(messages, person_profiles)
        
        # 4. 합의 형성 시나리오
        predictions["consensus_scenarios"] = self._generate_consensus_scenarios(topic_analyses)
        
        # 5. 영향력 변화 예측
        predictions["influence_shift_forecast"] = self._predict_influence_shifts(person_profiles)
        
        return predictions
        
    def _predict_participation_trends(self, person_profiles: List[AdvancedPersonProfile]) -> Dict[str, Any]:
        """참여 트렌드 예측"""
        trends = {}
        
        for profile in person_profiles:
            participation_likelihood = profile.predictive_insights.get("participation_likelihood", "보통")
            stance_flexibility = profile.predictive_insights.get("stance_flexibility", "일관됨")
            influence_trend = profile.predictive_insights.get("influence_trend", "안정")
            
            # 종합 참여 전망
            if participation_likelihood == "높음" and influence_trend in ["상승", "안정"]:
                forecast = "적극적 참여 지속"
            elif participation_likelihood == "낮음" or influence_trend == "하락":
                forecast = "참여 감소 가능성"
            else:
                forecast = "현 수준 유지"
                
            trends[profile.person_name] = {
                "participation_forecast": forecast,
                "flexibility": stance_flexibility,
                "influence_trajectory": influence_trend
            }
            
        return trends
        
    def _predict_topic_resolutions(self, topic_analyses: List[TopicAnalysisAdvanced]) -> Dict[str, Any]:
        """주제별 해결 예측"""
        resolutions = {}
        
        for topic in topic_analyses:
            consensus_prob = topic.consensus_probability
            resolution_paths = len(topic.resolution_pathways)
            
            if consensus_prob > 0.7 and resolution_paths > 0:
                forecast = "단기 해결 가능"
                timeline = "1-2주 내"
            elif consensus_prob > 0.4 and resolution_paths > 1:
                forecast = "중기 해결 가능"  
                timeline = "1-2개월 내"
            elif resolution_paths > 0:
                forecast = "장기 협의 필요"
                timeline = "2개월 이상"
            else:
                forecast = "해결 어려움"
                timeline = "미정"
                
            resolutions[topic.topic_name] = {
                "resolution_forecast": forecast,
                "estimated_timeline": timeline,
                "consensus_probability": f"{consensus_prob:.1%}",
                "available_pathways": resolution_paths
            }
            
        return resolutions
        
    def _generate_actionable_recommendations(self, 
                                           messages: List[ChatMessage],
                                           person_profiles: List[AdvancedPersonProfile],
                                           topic_analyses: List[TopicAnalysisAdvanced],
                                           dynamics: ConversationDynamics) -> List[Dict[str, Any]]:
        """실행 가능한 권고사항 생성"""
        recommendations = []
        
        # 1. 갈등 해결 권고
        if dynamics.conflict_intensity > 0.6:
            recommendations.append({
                "category": "갈등 해결",
                "priority": "높음",
                "action": "중재자 역할 강화 및 대화 중재 필요",
                "target_persons": [p.person_name for p in person_profiles 
                                 if "중재" in p.predictive_insights.get("conflict_resolution_potential", "")],
                "expected_outcome": "갈등 강도 감소 및 건설적 대화 유도",
                "timeline": "즉시"
            })
            
        # 2. 참여 촉진 권고
        low_participation = [p.person_name for p in person_profiles 
                           if p.influence_metrics.get("overall_influence", 0) < 0.3]
        if low_participation:
            recommendations.append({
                "category": "참여 촉진",
                "priority": "보통",
                "action": "저참여자 의견 수렴 및 참여 유도 방안 마련",
                "target_persons": low_participation,
                "expected_outcome": "전체 참여도 향상 및 다양한 의견 수렴",
                "timeline": "1주 내"
            })
            
        # 3. 주제별 해결 방안
        for topic in topic_analyses:
            if topic.consensus_probability < 0.5 and topic.resolution_pathways:
                recommendations.append({
                    "category": "주제 해결",
                    "priority": "높음" if topic.consensus_probability < 0.3 else "보통",
                    "action": f"{topic.topic_name} 관련 단계적 해결 방안 실행",
                    "target_persons": list(topic.stakeholder_positions.keys()),
                    "expected_outcome": "주제별 점진적 합의 도출",
                    "timeline": "2-4주"
                })
                
        # 4. 커뮤니케이션 효율성 개선
        if dynamics.communication_efficiency < 0.6:
            recommendations.append({
                "category": "소통 개선",
                "priority": "보통",
                "action": "체계적인 안건 정리 및 진행 방식 개선",
                "target_persons": ["전체"],
                "expected_outcome": "논의 효율성 증대 및 명확한 결론 도출",
                "timeline": "즉시 적용 가능"
            })
            
        return recommendations
        
    def _prepare_visual_summary_data(self, 
                                   person_profiles: List[AdvancedPersonProfile],
                                   topic_analyses: List[TopicAnalysisAdvanced],
                                   dynamics: ConversationDynamics) -> Dict[str, Any]:
        """시각적 요약 데이터 준비"""
        visual_data = {}
        
        # 1. 영향력 네트워크 그래프 데이터
        visual_data["influence_network"] = {
            "nodes": [
                {
                    "id": profile.person_name,
                    "influence": profile.influence_metrics.get("overall_influence", 0),
                    "emotion": profile.emotion_profile.primary_emotion.value,
                    "size": profile.influence_metrics.get("message_count", 0)
                } for profile in person_profiles
            ],
            "edges": []
        }
        
        # 네트워크 연결 관계 추가
        for source, targets in dynamics.influence_network.items():
            for target, weight in targets.items():
                if weight > 0.1:  # 최소 임계값
                    visual_data["influence_network"]["edges"].append({
                        "source": source,
                        "target": target,
                        "weight": weight
                    })
                    
        # 2. 감정 분포 차트 데이터
        emotions = [profile.emotion_profile.primary_emotion.value for profile in person_profiles]
        emotion_counts = Counter(emotions)
        visual_data["emotion_distribution"] = [
            {"emotion": emotion, "count": count} 
            for emotion, count in emotion_counts.items()
        ]
        
        # 3. 주제별 합의도 차트 데이터
        visual_data["consensus_levels"] = [
            {
                "topic": topic.topic_name,
                "consensus": topic.consensus_probability,
                "participants": len(topic.stakeholder_positions)
            } for topic in topic_analyses
        ]
        
        # 4. 참여 패턴 차트 데이터
        visual_data["participation_pattern"] = [
            {
                "person": person,
                "participation": score
            } for person, score in dynamics.participation_pattern.items()
        ]
        
        # 5. 시간별 활동 차트 데이터 (예시)
        visual_data["activity_timeline"] = {
            "conflict_intensity": dynamics.conflict_intensity,
            "communication_efficiency": dynamics.communication_efficiency,
            "overall_sentiment": sum(p.emotion_profile.emotion_intensity for p in person_profiles) / len(person_profiles) if person_profiles else 0
        }
        
        return visual_data
        
    def format_advanced_summary(self, summary: AdvancedKoreanSummary) -> str:
        """고도화된 요약 포맷팅 (인용문은 원문 유지, 분석은 평어)"""
        
        formatted = f"""
🚀 AI 고도화 한국어 대화 분석 v5.0
{'='*70}
📅 분석 기간: {summary.conversation_metadata['period']}
👥 참여자: {summary.conversation_metadata['participants_count']}명
💬 총 메시지: {summary.conversation_metadata['total_messages']}개

"""
        
        # AI 기반 개인 프로필 (인용문과 분석 구분)
        formatted += f"🤖 AI 기반 개인 프로필 분석\n"
        formatted += f"{'='*50}\n"
        
        for profile in summary.person_profiles:
            formatted += f"\n[{profile.person_name}]\n"
            formatted += f"🧠 AI 분석: {profile.analysis_summary}\n"
            formatted += f"💭 주요 감정: {profile.emotion_profile.primary_emotion.value} "
            formatted += f"(강도: {profile.emotion_profile.emotion_intensity:.1f})\n"
            formatted += f"🎯 영향력 점수: {profile.influence_metrics.get('overall_influence', 0):.2f}\n"
            
            # 핵심 발언 (인용문은 원문 그대로)
            if profile.key_quoted_statements:
                formatted += f"📝 핵심 발언 (원문):\n"
                for quote in profile.key_quoted_statements[:3]:
                    formatted += f"   • {quote}\n"
                    
            # 예측 인사이트 (분석은 평어)
            if profile.predictive_insights:
                formatted += f"🔮 AI 예측:\n"
                for key, value in profile.predictive_insights.items():
                    key_kr = {
                        "participation_likelihood": "참여 지속성",
                        "stance_flexibility": "입장 유연성", 
                        "influence_trend": "영향력 변화",
                        "conflict_resolution_potential": "갈등 해결 기여도"
                    }.get(key, key)
                    formatted += f"   - {key_kr}: {value}\n"
                    
            formatted += "\n"
            
        # AI 기반 주제 분석
        if summary.topic_analyses:
            formatted += f"🎯 AI 기반 주제별 심화 분석\n"
            formatted += f"{'='*45}\n"
            
            for topic in summary.topic_analyses:
                formatted += f"\n📌 {topic.topic_name}\n"
                formatted += f"🤝 합의 확률: {topic.consensus_probability:.1%}\n"
                formatted += f"💡 해결 경로: {len(topic.resolution_pathways)}개 식별됨\n"
                
                # 핵심 논거 (인용문으로)
                if topic.quoted_key_arguments:
                    formatted += f"🗣️ 핵심 논거 (원문):\n"
                    for arg in topic.quoted_key_arguments[:2]:
                        formatted += f"   • {arg}\n"
                        
                # 이해관계자 입장 (분석은 간결하게)
                if topic.stakeholder_positions:
                    formatted += f"👥 이해관계자 입장:\n"
                    for person, position in list(topic.stakeholder_positions.items())[:3]:
                        stance = position.get('stance', '중립')
                        confidence = position.get('confidence', 0)
                        formatted += f"   - {person}: {stance} (확신도: {confidence:.1f})\n"
                        
                formatted += "\n"
                
        # AI 종합 인사이트
        if summary.ai_insights:
            formatted += f"🧠 AI 종합 인사이트\n"
            formatted += f"{'='*35}\n"
            
            # 대화 패턴
            if "conversation_patterns" in summary.ai_insights:
                patterns = summary.ai_insights["conversation_patterns"]
                formatted += f"📊 대화 패턴: {patterns.get('conversation_flow', '일반적')}\n"
                formatted += f"⏰ 활동 피크: {patterns.get('peak_activity_hour', '미상')}\n"
                
            # 영향력 역학
            if "influence_dynamics" in summary.ai_insights:
                influence = summary.ai_insights["influence_dynamics"]
                formatted += f"👑 최고 영향력자: {influence.get('top_influencer', '미상')}\n"
                formatted += f"⚖️ 영향력 집중도: {influence.get('influence_concentration', 0):.1%}\n"
                
            # 한국 문화적 특성
            if "cultural_insights" in summary.ai_insights:
                cultural = summary.ai_insights["cultural_insights"]
                formatted += f"🏮 한국 문화적 특성:\n"
                for aspect, level in cultural.items():
                    aspect_kr = {
                        "hierarchy_respect": "위계 존중",
                        "harmony_seeking": "화합 추구",
                        "face_consideration": "체면 고려",
                        "emotional_communication": "정서적 소통",
                        "conflict_avoidance": "갈등 회피"
                    }.get(aspect, aspect)
                    formatted += f"   - {aspect_kr}: {level}\n"
                    
            formatted += "\n"
            
        # 예측 결과
        if summary.predictive_outcomes:
            formatted += f"🔮 AI 예측 분석\n"
            formatted += f"{'='*30}\n"
            
            if "resolution_forecast" in summary.predictive_outcomes:
                resolutions = summary.predictive_outcomes["resolution_forecast"]
                formatted += f"📋 주제별 해결 전망:\n"
                for topic, forecast in resolutions.items():
                    timeline = forecast.get('estimated_timeline', '미정')
                    probability = forecast.get('consensus_probability', '0%')
                    formatted += f"   - {topic}: {timeline} ({probability} 합의 가능성)\n"
                    
            formatted += "\n"
            
        # AI 권고사항
        if summary.actionable_recommendations:
            formatted += f"💡 AI 실행 권고사항\n"
            formatted += f"{'='*35}\n"
            
            for i, rec in enumerate(summary.actionable_recommendations[:5], 1):
                priority_icon = "🔴" if rec['priority'] == "높음" else "🟡"
                formatted += f"{i}. {priority_icon} {rec['action']}\n"
                formatted += f"   📅 시기: {rec['timeline']}\n"
                formatted += f"   🎯 효과: {rec['expected_outcome']}\n\n"
                
        formatted += f"🤖 **AI 고도화 분석 완료 - 최첨단 한국어 이해!**\n"
        
        return formatted
        
    def _create_empty_advanced_summary(self, start_time: datetime, end_time: datetime) -> AdvancedKoreanSummary:
        """빈 고도화 요약 생성"""
        return AdvancedKoreanSummary(
            summary_id=f"empty_advanced_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            analysis_timestamp=datetime.now(),
            conversation_metadata={
                "period": f"{start_time.strftime('%Y년 %m월 %d일')} ~ {end_time.strftime('%Y년 %m월 %d일')}",
                "participants_count": 0,
                "total_messages": 0,
                "analysis_version": "v5.0_advanced_ai"
            },
            person_profiles=[],
            topic_analyses=[],
            conversation_dynamics=ConversationDynamics(
                participation_pattern={},
                influence_network={},
                topic_leadership={},
                conflict_intensity=0.0,
                consensus_formation={},
                communication_efficiency=0.0
            ),
            ai_insights={},
            predictive_outcomes={},
            actionable_recommendations=[],
            visual_summary_data={}
        )


# 사용 예시
if __name__ == "__main__":
    print("🚀 AI 고도화 한국어 대화 분석 시스템 v5.0")
    print("=" * 60)
    print("🤖 AI 기반 감정 분석 및 의도 파악")
    print("📊 실시간 대화 흐름 분석")
    print("🔮 예측적 인사이트 생성")
    print("💡 실행 가능한 권고사항 제시")
    print("📝 인용 대화 원문 유지 + 분석 평어 표현")
    print("🇰🇷 한국어 담화 구조 완벽 분석")
    print("📈 시각적 데이터 생성")
    print("")
    print("🏆 **최첨단 AI 기반 한국어 대화 분석 시스템!**") 