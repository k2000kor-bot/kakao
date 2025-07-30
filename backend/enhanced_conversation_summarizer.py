from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import logging

from chat_conversation_analyzer import ChatConversationAnalyzer, ChatMessage
from advanced_korean_ai_analyzer import AdvancedKoreanAIAnalyzer
from ai_message_generator import AIMessageGenerator, PersonProfile

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class PersonVoiceAnalysis:
    """개인 목소리 분석 결과"""
    person_name: str
    political_stance: str
    preferred_construction_company: Optional[str]
    communication_style: str
    formality_level: str
    signature_phrases: List[str]
    consistent_patterns: List[str]
    emotional_tendencies: Dict[str, float]
    expertise_areas: Dict[str, float]
    influence_level: str
    interaction_patterns: Dict[str, Any]


@dataclass
class ConversationDynamicsAnalysis:
    """대화 역학 분석"""
    participation_balance: Dict[str, float]
    influence_network: Dict[str, List[str]]
    topic_leadership: Dict[str, str]
    consensus_formation: Dict[str, float]
    conflict_patterns: List[Dict[str, Any]]
    communication_efficiency: float
    decision_making_progress: str


@dataclass
class MessageQualityMetrics:
    """메시지 품질 지표"""
    person_name: str
    total_messages: int
    avg_message_length: float
    consistency_score: float
    guideline_compliance: float
    korean_authenticity: float
    informativeness: float
    constructive_ratio: float


@dataclass
class EnhancedSummaryResult:
    """고도화된 요약 결과"""
    basic_summary: str
    voice_analysis: List[PersonVoiceAnalysis]
    conversation_dynamics: ConversationDynamicsAnalysis
    quality_metrics: List[MessageQualityMetrics]
    predictive_insights: Dict[str, Any]
    recommendations: List[str]
    next_meeting_suggestions: List[str]
    key_decision_points: List[Dict[str, Any]]
    cultural_context_analysis: Dict[str, Any]
    generated_sample_messages: Dict[str, str]


class EnhancedConversationSummarizer:
    """고도화된 대화 요약 시스템"""
    
    def __init__(self, 
                 analyzer: ChatConversationAnalyzer,
                 ai_analyzer: AdvancedKoreanAIAnalyzer,
                 message_generator: AIMessageGenerator):
        self.analyzer = analyzer
        self.ai_analyzer = ai_analyzer
        self.message_generator = message_generator
        
    def generate_enhanced_summary(self, 
                                messages: List[ChatMessage],
                                analysis_depth: str = "comprehensive") -> EnhancedSummaryResult:
        """고도화된 대화 요약 생성"""
        
        logger.info(f"고도화된 요약 생성 시작: {len(messages)}개 메시지, 깊이: {analysis_depth}")
        
        # 1. 기본 요약 생성
        basic_summary = self._generate_basic_summary(messages)
        
        # 2. 개인별 목소리 분석
        voice_analysis = self._analyze_individual_voices(messages)
        
        # 3. 대화 역학 분석
        conversation_dynamics = self._analyze_conversation_dynamics(messages)
        
        # 4. 메시지 품질 분석
        quality_metrics = self._analyze_message_quality(messages)
        
        # 5. 예측적 인사이트
        predictive_insights = self._generate_predictive_insights(messages, voice_analysis)
        
        # 6. 개선 권장사항
        recommendations = self._generate_recommendations(
            voice_analysis, conversation_dynamics, quality_metrics
        )
        
        # 7. 다음 회의 제안사항
        next_meeting_suggestions = self._suggest_next_meeting_agenda(
            messages, conversation_dynamics
        )
        
        # 8. 핵심 결정 포인트
        key_decision_points = self._identify_key_decision_points(messages)
        
        # 9. 문화적 맥락 분석
        cultural_context = self._analyze_cultural_context(messages)
        
        # 10. 샘플 메시지 생성
        sample_messages = self._generate_sample_messages(voice_analysis)
        
        return EnhancedSummaryResult(
            basic_summary=basic_summary,
            voice_analysis=voice_analysis,
            conversation_dynamics=conversation_dynamics,
            quality_metrics=quality_metrics,
            predictive_insights=predictive_insights,
            recommendations=recommendations,
            next_meeting_suggestions=next_meeting_suggestions,
            key_decision_points=key_decision_points,
            cultural_context_analysis=cultural_context,
            generated_sample_messages=sample_messages
        )
        
    def _generate_basic_summary(self, messages: List[ChatMessage]) -> str:
        """기본 요약 생성"""
        
        # 주요 주제 추출
        topics = self._extract_main_topics(messages)
        
        # 참여자 분석
        participants = list(set(msg.sender for msg in messages))
        
        # 시간 범위
        if messages:
            start_time = min(msg.timestamp for msg in messages)
            end_time = max(msg.timestamp for msg in messages)
            duration = end_time - start_time
        else:
            duration = timedelta(0)
            
        summary_parts = [
            f"📅 **대화 기간**: {duration.days}일간 진행",
            f"👥 **참여자**: {len(participants)}명 ({', '.join(participants[:5])}{'...' if len(participants) > 5 else ''})",
            f"💬 **총 메시지**: {len(messages)}개",
            f"🎯 **주요 주제**: {', '.join(topics[:3])}"
        ]
        
        # 주요 논의사항 요약
        if topics:
            summary_parts.append("\n**📋 주요 논의사항**:")
            for i, topic in enumerate(topics[:5], 1):
                topic_messages = [msg for msg in messages if topic.lower() in msg.content.lower()]
                summary_parts.append(f"{i}. {topic}: {len(topic_messages)}개 메시지")
                
        return "\n".join(summary_parts)
        
    def _analyze_individual_voices(self, messages: List[ChatMessage]) -> List[PersonVoiceAnalysis]:
        """개인별 목소리 분석"""
        
        participants = list(set(msg.sender for msg in messages))
        voice_analyses = []
        
        for person in participants:
            person_messages = [msg for msg in messages if msg.sender == person]
            
            if len(person_messages) < 2:  # 최소 메시지 수 확인
                continue
                
            # AI 메시지 생성기를 통한 프로필 학습
            try:
                profile = self.message_generator.learn_person_profile(person)
                voice_consistency = self.message_generator._analyze_voice_consistency(
                    person, self.message_generator._load_project_guidelines()
                )
                
                # 영향력 수준 분석
                influence_level = self._calculate_influence_level(person, messages)
                
                # 상호작용 패턴 분석
                interaction_patterns = self._analyze_interaction_patterns(person, messages)
                
                voice_analysis = PersonVoiceAnalysis(
                    person_name=person,
                    political_stance=profile.political_stance,
                    preferred_construction_company=profile.preferred_construction_company,
                    communication_style=profile.communication_style,
                    formality_level=profile.formality_level,
                    signature_phrases=profile.signature_phrases,
                    consistent_patterns=voice_consistency.get("consistent_phrases", []),
                    emotional_tendencies=voice_consistency.get("emotional_range", {}),
                    expertise_areas=voice_consistency.get("topic_expertise", {}),
                    influence_level=influence_level,
                    interaction_patterns=interaction_patterns
                )
                
                voice_analyses.append(voice_analysis)
                
            except Exception as e:
                logger.warning(f"개인 분석 실패 ({person}): {e}")
                continue
                
        return voice_analyses
        
    def _analyze_conversation_dynamics(self, messages: List[ChatMessage]) -> ConversationDynamicsAnalysis:
        """대화 역학 분석"""
        
        participants = list(set(msg.sender for msg in messages))
        
        # 참여 균형도
        participation_balance = {}
        total_messages = len(messages)
        for person in participants:
            person_count = len([msg for msg in messages if msg.sender == person])
            participation_balance[person] = person_count / total_messages if total_messages > 0 else 0
            
        # 영향력 네트워크 (누가 누구에게 응답하는지)
        influence_network = defaultdict(list)
        for i, msg in enumerate(messages[1:], 1):
            prev_msg = messages[i-1]
            if msg.sender != prev_msg.sender:
                # 응답 관계로 간주
                influence_network[prev_msg.sender].append(msg.sender)
                
        # 주제별 리더십
        topics = self._extract_main_topics(messages)
        topic_leadership = {}
        
        for topic in topics:
            topic_messages = [msg for msg in messages if topic.lower() in msg.content.lower()]
            if topic_messages:
                topic_participants = [msg.sender for msg in topic_messages]
                leader = Counter(topic_participants).most_common(1)[0][0]
                topic_leadership[topic] = leader
                
        # 합의 형성도
        consensus_formation = self._analyze_consensus_formation(messages, participants)
        
        # 갈등 패턴
        conflict_patterns = self._identify_conflict_patterns(messages)
        
        # 소통 효율성
        communication_efficiency = self._calculate_communication_efficiency(messages)
        
        # 의사결정 진행도
        decision_progress = self._assess_decision_making_progress(messages)
        
        return ConversationDynamicsAnalysis(
            participation_balance=participation_balance,
            influence_network=dict(influence_network),
            topic_leadership=topic_leadership,
            consensus_formation=consensus_formation,
            conflict_patterns=conflict_patterns,
            communication_efficiency=communication_efficiency,
            decision_making_progress=decision_progress
        )
        
    def _analyze_message_quality(self, messages: List[ChatMessage]) -> List[MessageQualityMetrics]:
        """메시지 품질 분석"""
        
        participants = list(set(msg.sender for msg in messages))
        quality_metrics = []
        
        guidelines = self.message_generator._load_project_guidelines()
        
        for person in participants:
            person_messages = [msg for msg in messages if msg.sender == person]
            
            if len(person_messages) < 2:
                continue
                
            try:
                profile = self.message_generator.learn_person_profile(person)
                voice_consistency = self.message_generator._analyze_voice_consistency(person, guidelines)
                
                # 품질 지표 계산
                total_messages = len(person_messages)
                avg_length = sum(len(msg.content) for msg in person_messages) / total_messages
                
                # 각 메시지의 품질 점수 계산
                quality_scores = []
                for msg in person_messages:
                    quality = self.message_generator._validate_message_quality(
                        msg.content, profile, guidelines, voice_consistency
                    )
                    quality_scores.append(quality)
                    
                # 평균 점수들
                avg_consistency = sum(q.get("consistency", 0) for q in quality_scores) / len(quality_scores)
                avg_compliance = sum(q.get("compliance", 0) for q in quality_scores) / len(quality_scores)
                avg_naturalness = sum(q.get("naturalness", 0) for q in quality_scores) / len(quality_scores)
                avg_informativeness = sum(q.get("informativeness", 0) for q in quality_scores) / len(quality_scores)
                
                # 건설적 메시지 비율
                constructive_count = sum(1 for msg in person_messages 
                                      if any(word in msg.content for word in ["제안", "개선", "협력", "해결"]))
                constructive_ratio = constructive_count / total_messages
                
                # 한국어 자연스러움
                korean_scores = []
                for msg in person_messages:
                    korean_score = self.message_generator._validate_korean_authenticity(msg.content, profile)
                    korean_scores.append(korean_score)
                avg_korean_authenticity = sum(korean_scores) / len(korean_scores)
                
                metrics = MessageQualityMetrics(
                    person_name=person,
                    total_messages=total_messages,
                    avg_message_length=avg_length,
                    consistency_score=avg_consistency,
                    guideline_compliance=avg_compliance,
                    korean_authenticity=avg_korean_authenticity,
                    informativeness=avg_informativeness,
                    constructive_ratio=constructive_ratio
                )
                
                quality_metrics.append(metrics)
                
            except Exception as e:
                logger.warning(f"품질 분석 실패 ({person}): {e}")
                continue
                
        return quality_metrics
        
    def _generate_predictive_insights(self, 
                                    messages: List[ChatMessage],
                                    voice_analysis: List[PersonVoiceAnalysis]) -> Dict[str, Any]:
        """예측적 인사이트 생성"""
        
        insights = {}
        
        # 향후 참여 예측
        participation_trends = {}
        for analysis in voice_analysis:
            person_messages = [msg for msg in messages if msg.sender == analysis.person_name]
            
            if len(person_messages) >= 3:
                # 최근 활동 추세
                recent_activity = len([msg for msg in person_messages[-10:]])
                early_activity = len([msg for msg in person_messages[:10]])
                
                if recent_activity > early_activity:
                    trend = "증가"
                elif recent_activity < early_activity:
                    trend = "감소"
                else:
                    trend = "안정"
                    
                participation_trends[analysis.person_name] = trend
                
        insights["participation_trends"] = participation_trends
        
        # 갈등 확산 위험도
        conflict_risk = "낮음"
        conflict_keywords = ["반대", "문제", "우려", "불만"]
        recent_messages = messages[-20:] if len(messages) >= 20 else messages
        
        conflict_count = sum(1 for msg in recent_messages 
                           if any(keyword in msg.content for keyword in conflict_keywords))
        
        if conflict_count > len(recent_messages) * 0.3:
            conflict_risk = "높음"
        elif conflict_count > len(recent_messages) * 0.15:
            conflict_risk = "보통"
            
        insights["conflict_escalation_risk"] = conflict_risk
        
        # 의사결정 타이밍 예측
        decision_indicators = ["결정", "선택", "승인", "확정"]
        decision_mentions = sum(1 for msg in messages 
                              if any(indicator in msg.content for indicator in decision_indicators))
        
        if decision_mentions > len(messages) * 0.1:
            decision_timing = "임박"
        elif decision_mentions > len(messages) * 0.05:
            decision_timing = "준비단계"
        else:
            decision_timing = "논의단계"
            
        insights["decision_timing_prediction"] = decision_timing
        
        # 영향력 변화 예측
        influence_shifts = {}
        for analysis in voice_analysis:
            if analysis.influence_level in ["높음", "매우높음"]:
                # 높은 영향력자의 입장 변화 가능성
                person_messages = [msg for msg in messages if msg.sender == analysis.person_name]
                recent_stance = self._analyze_recent_stance_change(person_messages)
                influence_shifts[analysis.person_name] = recent_stance
                
        insights["influence_shifts"] = influence_shifts
        
        return insights
        
    def _generate_recommendations(self, 
                                voice_analysis: List[PersonVoiceAnalysis],
                                dynamics: ConversationDynamicsAnalysis,
                                quality_metrics: List[MessageQualityMetrics]) -> List[str]:
        """개선 권장사항 생성"""
        
        recommendations = []
        
        # 참여 균형 개선
        participation_values = list(dynamics.participation_balance.values())
        if participation_values:
            max_participation = max(participation_values)
            min_participation = min(participation_values)
            
            if max_participation > 0.4:  # 특정인이 40% 이상 발언
                dominant_person = max(dynamics.participation_balance, 
                                    key=dynamics.participation_balance.get)
                recommendations.append(
                    f"🎯 **참여 균형 개선**: {dominant_person}님의 발언이 집중되어 있습니다. "
                    "다른 조합원들의 의견을 더 적극적으로 유도해보세요."
                )
                
            if min_participation < 0.05:  # 5% 미만 참여자
                quiet_members = [person for person, ratio in dynamics.participation_balance.items() 
                               if ratio < 0.05]
                recommendations.append(
                    f"👥 **참여 촉진**: {', '.join(quiet_members)}님들의 의견을 더 들어보는 것이 좋겠습니다."
                )
        
        # 소통 품질 개선
        low_quality_members = [m for m in quality_metrics if m.consistency_score < 0.6]
        if low_quality_members:
            recommendations.append(
                "📝 **메시지 품질 향상**: 일부 참여자의 메시지 일관성이 낮습니다. "
                "개인별 입장을 명확히 하고 논리적 구조로 의견을 제시해보세요."
            )
            
        # 갈등 해결 방안
        if dynamics.conflict_patterns:
            recommendations.append(
                "🤝 **갈등 해결**: 의견 차이가 관찰됩니다. "
                "단계적 접근과 상호 이해를 위한 시간을 가져보세요."
            )
            
        # 의사결정 촉진
        if dynamics.decision_making_progress == "정체":
            recommendations.append(
                "⚡ **의사결정 촉진**: 논의가 정체되어 있습니다. "
                "구체적인 안건별로 찬반 의견을 정리하고 단계적 결정을 진행해보세요."
            )
            
        # 문화적 개선사항
        formal_members = [v for v in voice_analysis if v.formality_level == "높음"]
        informal_members = [v for v in voice_analysis if v.formality_level == "낮음"]
        
        if len(formal_members) > 0 and len(informal_members) > 0:
            recommendations.append(
                "🎭 **소통 스타일 조화**: 격식 수준이 다양합니다. "
                "상호 존중하는 분위기에서 편안한 의견 교환이 이루어지도록 해보세요."
            )
            
        return recommendations
        
    def _suggest_next_meeting_agenda(self, 
                                   messages: List[ChatMessage],
                                   dynamics: ConversationDynamicsAnalysis) -> List[str]:
        """다음 회의 제안사항"""
        
        suggestions = []
        
        # 미해결 주제들
        unresolved_topics = []
        topics = self._extract_main_topics(messages)
        
        for topic in topics:
            topic_messages = [msg for msg in messages if topic.lower() in msg.content.lower()]
            decision_words = ["결정", "확정", "승인", "채택"]
            
            has_decision = any(any(word in msg.content for word in decision_words) 
                             for msg in topic_messages)
            
            if not has_decision:
                unresolved_topics.append(topic)
                
        if unresolved_topics:
            suggestions.append(f"📋 **미해결 안건 논의**: {', '.join(unresolved_topics[:3])}")
            
        # 전문가 의견 필요 영역
        technical_topics = []
        for topic, leader in dynamics.topic_leadership.items():
            if topic in ["시공", "법률", "재무", "기술"]:
                technical_topics.append(topic)
                
        if technical_topics:
            suggestions.append(f"🔬 **전문가 자문 요청**: {', '.join(technical_topics)} 관련")
            
        # 합의 형성 필요 사항
        low_consensus_items = [topic for topic, score in dynamics.consensus_formation.items() 
                              if score < 0.6]
        
        if low_consensus_items:
            suggestions.append(f"🤝 **합의 형성 집중**: {', '.join(low_consensus_items[:2])}")
            
        # 투명성 강화 방안
        transparency_needed = any("투명" in msg.content or "공개" in msg.content 
                                for msg in messages[-10:])
        
        if transparency_needed:
            suggestions.append("📊 **투명성 강화**: 관련 자료 공개 및 절차 투명화 논의")
            
        return suggestions
        
    def _identify_key_decision_points(self, messages: List[ChatMessage]) -> List[Dict[str, Any]]:
        """핵심 결정 포인트 식별"""
        
        decision_points = []
        
        # 결정이 필요한 주요 사안들
        decision_keywords = {
            "시공사 선정": ["GS", "파르나스", "현대", "시공사"],
            "분담금": ["분담금", "비용", "부담", "예산"],
            "운영권": ["운영권", "위탁", "관리", "운영"],
            "총회 절차": ["총회", "회의", "절차", "진행"]
        }
        
        for category, keywords in decision_keywords.items():
            related_messages = []
            for msg in messages:
                if any(keyword in msg.content for keyword in keywords):
                    related_messages.append(msg)
                    
            if related_messages:
                # 찬반 의견 분석
                support_count = sum(1 for msg in related_messages 
                                  if any(word in msg.content for word in ["찬성", "좋다", "적절"]))
                oppose_count = sum(1 for msg in related_messages 
                                 if any(word in msg.content for word in ["반대", "우려", "문제"]))
                
                urgency = "높음" if len(related_messages) > len(messages) * 0.2 else "보통"
                
                decision_point = {
                    "category": category,
                    "total_mentions": len(related_messages),
                    "support_ratio": support_count / len(related_messages) if related_messages else 0,
                    "oppose_ratio": oppose_count / len(related_messages) if related_messages else 0,
                    "urgency_level": urgency,
                    "key_participants": list(set(msg.sender for msg in related_messages[:5]))
                }
                
                decision_points.append(decision_point)
                
        return decision_points
        
    def _analyze_cultural_context(self, messages: List[ChatMessage]) -> Dict[str, Any]:
        """문화적 맥락 분석"""
        
        context = {}
        
        # 한국어 존댓말 사용 패턴
        formal_count = sum(1 for msg in messages 
                          if any(ending in msg.content for ending in ["습니다", "드립니다"]))
        
        context["formality_ratio"] = formal_count / len(messages) if messages else 0
        
        # 집단 의사결정 패턴
        group_words = ["함께", "모두", "전체", "조합원", "우리"]
        group_mentions = sum(1 for msg in messages 
                           if any(word in msg.content for word in group_words))
        
        context["collective_orientation"] = group_mentions / len(messages) if messages else 0
        
        # 조화 지향성
        harmony_words = ["조화", "협력", "합의", "상생", "균형"]
        harmony_mentions = sum(1 for msg in messages 
                             if any(word in msg.content for word in harmony_words))
        
        context["harmony_emphasis"] = harmony_mentions / len(messages) if messages else 0
        
        # 권위 인정 패턴
        authority_words = ["전문가", "자문", "의견", "지침", "규정"]
        authority_mentions = sum(1 for msg in messages 
                               if any(word in msg.content for word in authority_words))
        
        context["authority_respect"] = authority_mentions / len(messages) if messages else 0
        
        return context
        
    def _generate_sample_messages(self, voice_analysis: List[PersonVoiceAnalysis]) -> Dict[str, str]:
        """샘플 메시지 생성"""
        
        sample_messages = {}
        
        for analysis in voice_analysis[:3]:  # 상위 3명만
            try:
                generated_msg = self.message_generator.generate_contextual_message(
                    person_name=analysis.person_name,
                    target_topic="향후 진행 방안",
                    message_intent="제안형"
                )
                
                sample_messages[analysis.person_name] = generated_msg.generated_content
                
            except Exception as e:
                logger.warning(f"샘플 메시지 생성 실패 ({analysis.person_name}): {e}")
                
        return sample_messages
        
    def format_enhanced_summary(self, result: EnhancedSummaryResult) -> str:
        """고도화된 요약 포맷팅"""
        
        formatted_parts = []
        
        # 기본 요약
        formatted_parts.append("# 📊 **고도화된 대화 분석 리포트**\n")
        formatted_parts.append("## 📋 **기본 요약**")
        formatted_parts.append(result.basic_summary)
        formatted_parts.append("")
        
        # 개인별 목소리 분석
        if result.voice_analysis:
            formatted_parts.append("## 🎭 **개인별 목소리 분석**")
            for analysis in result.voice_analysis:
                formatted_parts.append(f"### 👤 **{analysis.person_name}**")
                formatted_parts.append(f"- **정치적 성향**: {analysis.political_stance}")
                formatted_parts.append(f"- **소통 스타일**: {analysis.communication_style}")
                formatted_parts.append(f"- **격식 수준**: {analysis.formality_level}")
                formatted_parts.append(f"- **영향력**: {analysis.influence_level}")
                
                if analysis.preferred_construction_company:
                    formatted_parts.append(f"- **선호 시공사**: {analysis.preferred_construction_company}")
                    
                if analysis.signature_phrases:
                    formatted_parts.append(f"- **시그니처 표현**: {', '.join(analysis.signature_phrases[:3])}")
                    
                formatted_parts.append("")
        
        # 대화 역학
        formatted_parts.append("## 🔄 **대화 역학 분석**")
        formatted_parts.append(f"- **소통 효율성**: {result.conversation_dynamics.communication_efficiency:.1%}")
        formatted_parts.append(f"- **의사결정 진행**: {result.conversation_dynamics.decision_making_progress}")
        
        if result.conversation_dynamics.topic_leadership:
            formatted_parts.append("- **주제별 리더십**:")
            for topic, leader in result.conversation_dynamics.topic_leadership.items():
                formatted_parts.append(f"  - {topic}: {leader}")
        formatted_parts.append("")
        
        # 품질 지표
        if result.quality_metrics:
            formatted_parts.append("## 🏆 **메시지 품질 분석**")
            for metrics in result.quality_metrics:
                formatted_parts.append(f"### {metrics.person_name}")
                formatted_parts.append(f"- 일관성: {metrics.consistency_score:.1%}")
                formatted_parts.append(f"- 가이드라인 준수: {metrics.guideline_compliance:.1%}")
                formatted_parts.append(f"- 한국어 자연성: {metrics.korean_authenticity:.1%}")
                formatted_parts.append(f"- 건설적 비율: {metrics.constructive_ratio:.1%}")
                formatted_parts.append("")
        
        # 예측적 인사이트
        if result.predictive_insights:
            formatted_parts.append("## 🔮 **예측적 인사이트**")
            
            conflict_risk = result.predictive_insights.get("conflict_escalation_risk", "알수없음")
            formatted_parts.append(f"- **갈등 확산 위험**: {conflict_risk}")
            
            decision_timing = result.predictive_insights.get("decision_timing_prediction", "알수없음")
            formatted_parts.append(f"- **의사결정 시점**: {decision_timing}")
            
            if result.predictive_insights.get("participation_trends"):
                formatted_parts.append("- **참여 동향**:")
                for person, trend in result.predictive_insights["participation_trends"].items():
                    formatted_parts.append(f"  - {person}: {trend}")
            formatted_parts.append("")
        
        # 권장사항
        if result.recommendations:
            formatted_parts.append("## 💡 **개선 권장사항**")
            for i, rec in enumerate(result.recommendations, 1):
                formatted_parts.append(f"{i}. {rec}")
            formatted_parts.append("")
        
        # 다음 회의 제안
        if result.next_meeting_suggestions:
            formatted_parts.append("## 📅 **다음 회의 제안사항**")
            for i, suggestion in enumerate(result.next_meeting_suggestions, 1):
                formatted_parts.append(f"{i}. {suggestion}")
            formatted_parts.append("")
        
        # 핵심 결정 포인트
        if result.key_decision_points:
            formatted_parts.append("## ⚡ **핵심 결정 포인트**")
            for point in result.key_decision_points:
                formatted_parts.append(f"### {point['category']}")
                formatted_parts.append(f"- 언급 횟수: {point['total_mentions']}회")
                formatted_parts.append(f"- 찬성 비율: {point['support_ratio']:.1%}")
                formatted_parts.append(f"- 반대 비율: {point['oppose_ratio']:.1%}")
                formatted_parts.append(f"- 긴급도: {point['urgency_level']}")
                formatted_parts.append("")
        
        # 문화적 맥락
        if result.cultural_context_analysis:
            formatted_parts.append("## 🏮 **한국적 소통 문화 분석**")
            
            formality = result.cultural_context_analysis.get("formality_ratio", 0)
            formatted_parts.append(f"- **격식성**: {formality:.1%}")
            
            collective = result.cultural_context_analysis.get("collective_orientation", 0)
            formatted_parts.append(f"- **집단 지향성**: {collective:.1%}")
            
            harmony = result.cultural_context_analysis.get("harmony_emphasis", 0)
            formatted_parts.append(f"- **조화 추구**: {harmony:.1%}")
            
            authority = result.cultural_context_analysis.get("authority_respect", 0)
            formatted_parts.append(f"- **권위 존중**: {authority:.1%}")
            formatted_parts.append("")
        
        # 생성된 샘플 메시지
        if result.generated_sample_messages:
            formatted_parts.append("## 🤖 **AI 생성 샘플 메시지**")
            formatted_parts.append("*각 개인의 성향을 반영한 예상 메시지*")
            formatted_parts.append("")
            
            for person, message in result.generated_sample_messages.items():
                formatted_parts.append(f"**{person}** (예상 메시지):")
                formatted_parts.append(f'"{message}"')
                formatted_parts.append("")
        
        return "\n".join(formatted_parts)


# 사용 예시
if __name__ == "__main__":
    print("📊 고도화된 대화 요약 시스템 v2.0")
    print("=" * 50)
    print("🎯 추가된 분석 기능:")
    print("   ✓ 개인별 목소리 일관성 분석")
    print("   ✓ 메시지 품질 지표 측정")
    print("   ✓ 예측적 인사이트 제공")
    print("   ✓ 문화적 맥락 분석")
    print("   ✓ AI 생성 샘플 메시지")
    print("   ✓ 다음 회의 제안사항")
    print("   ✓ 핵심 결정 포인트 식별")
    print("")
    print("🏆 **가장 종합적이고 실용적인 대화 분석!**") 