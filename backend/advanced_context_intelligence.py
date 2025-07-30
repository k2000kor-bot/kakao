"""
Advanced Context Intelligence System
고도화된 컨텍스트 인텔리전스 시스템

Features:
- Multi-dimensional context analysis
- Predictive conversation modeling
- Dynamic personality adaptation
- Cross-conversation memory linking
- Emotional intelligence processing
- Cultural context understanding
- Real-time context streaming
"""

import asyncio
import json
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
import logging
from collections import defaultdict, deque
import sqlite3
import redis
from sentence_transformers import SentenceTransformer
import faiss
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel
from konlpy.tag import Okt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContextDimension(Enum):
    TEMPORAL = "temporal"
    EMOTIONAL = "emotional"
    SOCIAL = "social"
    TOPICAL = "topical"
    CULTURAL = "cultural"
    STRATEGIC = "strategic"

class IntelligenceLevel(Enum):
    BASIC = "basic"
    ADVANCED = "advanced"
    EXPERT = "expert"
    GENIUS = "genius"

@dataclass
class ContextVector:
    """Multi-dimensional context vector"""
    dimensions: Dict[ContextDimension, float] = field(default_factory=dict)
    confidence: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)
    source_data: Dict[str, Any] = field(default_factory=dict)
    embedding: Optional[np.ndarray] = None

@dataclass
class ConversationMemory:
    """Advanced conversation memory structure"""
    memory_id: str
    conversation_id: str
    participants: List[str]
    key_moments: List[Dict[str, Any]]
    emotional_journey: List[Tuple[datetime, Dict[str, float]]]
    topic_evolution: List[Tuple[datetime, List[str]]]
    relationship_dynamics: Dict[str, Dict[str, float]]
    cultural_markers: List[str]
    predictive_insights: Dict[str, Any]
    created_at: datetime = field(default_factory=datetime.now)
    last_accessed: datetime = field(default_factory=datetime.now)

@dataclass
class PersonalityProfile:
    """Dynamic personality profile"""
    person_id: str
    base_traits: Dict[str, float]
    contextual_adaptations: Dict[str, Dict[str, float]]
    communication_patterns: Dict[str, Any]
    emotional_tendencies: Dict[str, float]
    cultural_background: Dict[str, Any]
    learning_history: List[Dict[str, Any]]
    confidence_scores: Dict[str, float]
    last_updated: datetime = field(default_factory=datetime.now)

class AdvancedContextIntelligence:
    """고도화된 컨텍스트 인텔리전스 시스템"""
    
    def __init__(self, 
                 redis_client: Optional[redis.Redis] = None,
                 model_name: str = "jhgan/ko-sroberta-multitask",
                 intelligence_level: IntelligenceLevel = IntelligenceLevel.EXPERT):
        
        self.intelligence_level = intelligence_level
        self.redis_client = redis_client or redis.Redis(host='localhost', port=6379, db=0)
        
        # AI Models
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.sentence_transformer = SentenceTransformer(model_name)
        self.korean_analyzer = Okt()
        
        # Context Memory Systems
        self.conversation_memories: Dict[str, ConversationMemory] = {}
        self.personality_profiles: Dict[str, PersonalityProfile] = {}
        self.context_vectors: Dict[str, ContextVector] = {}
        
        # Advanced Analytics
        self.context_clusterer = DBSCAN(eps=0.3, min_samples=2)
        self.scaler = StandardScaler()
        
        # Real-time processing
        self.context_stream = deque(maxlen=1000)
        self.processing_queue = asyncio.Queue()
        
        # Cultural intelligence
        self.cultural_patterns = self._load_cultural_patterns()
        
        # Predictive models
        self._initialize_predictive_models()
        
        logger.info(f"Advanced Context Intelligence initialized at {intelligence_level.value} level")

    def _load_cultural_patterns(self) -> Dict[str, Any]:
        """Load Korean cultural communication patterns"""
        return {
            "hierarchy_markers": {
                "formal": ["습니다", "있습니다", "드립니다", "께서", "님"],
                "casual": ["해요", "이에요", "가요", "네요"],
                "intimate": ["야", "어", "지", "다"],
                "honorific": ["께서", "드시다", "계시다", "말씀하시다"]
            },
            "emotional_expressions": {
                "concern": ["걱정", "우려", "염려", "신중", "조심"],
                "enthusiasm": ["기대", "희망", "좋아", "좋겠", "기쁘"],
                "frustration": ["답답", "짜증", "힘들", "어려", "문제"],
                "agreement": ["맞아", "그래", "동의", "찬성", "좋아"]
            },
            "social_context": {
                "meeting": ["회의", "총회", "모임", "논의", "결정"],
                "conflict": ["문제", "갈등", "반대", "불만", "개선"],
                "cooperation": ["협력", "함께", "같이", "도움", "지원"],
                "decision": ["결정", "선택", "판단", "결론", "방향"]
            }
        }

    def _initialize_predictive_models(self):
        """Initialize predictive modeling components"""
        self.conversation_predictor = ConversationPredictor()
        self.emotion_predictor = EmotionPredictor()
        self.response_optimizer = ResponseOptimizer()

    async def analyze_multi_dimensional_context(self, 
                                              conversation_data: Dict[str, Any],
                                              analysis_depth: IntelligenceLevel = None) -> ContextVector:
        """Multi-dimensional context analysis"""
        
        analysis_depth = analysis_depth or self.intelligence_level
        
        try:
            # Extract basic elements
            messages = conversation_data.get('messages', [])
            participants = conversation_data.get('participants', [])
            
            if not messages:
                return ContextVector()
            
            # Temporal dimension analysis
            temporal_context = await self._analyze_temporal_dimension(messages)
            
            # Emotional dimension analysis
            emotional_context = await self._analyze_emotional_dimension(messages)
            
            # Social dimension analysis
            social_context = await self._analyze_social_dimension(messages, participants)
            
            # Topical dimension analysis
            topical_context = await self._analyze_topical_dimension(messages)
            
            # Cultural dimension analysis
            cultural_context = await self._analyze_cultural_dimension(messages)
            
            # Strategic dimension analysis (for expert+ levels)
            strategic_context = {}
            if analysis_depth in [IntelligenceLevel.EXPERT, IntelligenceLevel.GENIUS]:
                strategic_context = await self._analyze_strategic_dimension(messages, participants)
            
            # Create multi-dimensional context vector
            context_vector = ContextVector(
                dimensions={
                    ContextDimension.TEMPORAL: temporal_context['score'],
                    ContextDimension.EMOTIONAL: emotional_context['score'],
                    ContextDimension.SOCIAL: social_context['score'],
                    ContextDimension.TOPICAL: topical_context['score'],
                    ContextDimension.CULTURAL: cultural_context['score'],
                    ContextDimension.STRATEGIC: strategic_context.get('score', 0.0)
                },
                confidence=self._calculate_context_confidence(
                    temporal_context, emotional_context, social_context, 
                    topical_context, cultural_context, strategic_context
                ),
                source_data={
                    'temporal': temporal_context,
                    'emotional': emotional_context,
                    'social': social_context,
                    'topical': topical_context,
                    'cultural': cultural_context,
                    'strategic': strategic_context
                }
            )
            
            # Generate embedding
            context_vector.embedding = await self._generate_context_embedding(context_vector)
            
            return context_vector
            
        except Exception as e:
            logger.error(f"Multi-dimensional context analysis failed: {e}")
            return ContextVector()

    async def _analyze_temporal_dimension(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze temporal patterns and rhythms"""
        
        if len(messages) < 2:
            return {'score': 0.0, 'patterns': {}, 'rhythm': 'unknown'}
        
        # Calculate response times
        response_times = []
        timestamps = []
        
        for i, msg in enumerate(messages):
            try:
                timestamp = datetime.fromisoformat(msg.get('timestamp', ''))
                timestamps.append(timestamp)
                
                if i > 0:
                    time_diff = (timestamp - timestamps[i-1]).total_seconds()
                    response_times.append(time_diff)
            except:
                continue
        
        if not response_times:
            return {'score': 0.0, 'patterns': {}, 'rhythm': 'unknown'}
        
        # Analyze patterns
        avg_response_time = np.mean(response_times)
        rhythm_consistency = 1.0 - (np.std(response_times) / (avg_response_time + 1))
        
        # Determine conversation rhythm
        if avg_response_time < 30:  # seconds
            rhythm = 'rapid'
            urgency_score = 0.9
        elif avg_response_time < 300:  # 5 minutes
            rhythm = 'moderate'
            urgency_score = 0.5
        else:
            rhythm = 'slow'
            urgency_score = 0.1
        
        # Time-of-day analysis
        hours = [ts.hour for ts in timestamps]
        peak_hour = max(set(hours), key=hours.count) if hours else 12
        
        temporal_score = (rhythm_consistency * 0.4 + urgency_score * 0.6)
        
        return {
            'score': temporal_score,
            'patterns': {
                'avg_response_time': avg_response_time,
                'rhythm_consistency': rhythm_consistency,
                'peak_hour': peak_hour,
                'total_duration': (timestamps[-1] - timestamps[0]).total_seconds() if len(timestamps) > 1 else 0
            },
            'rhythm': rhythm,
            'urgency_score': urgency_score
        }

    async def _analyze_emotional_dimension(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Advanced emotional context analysis"""
        
        if not messages:
            return {'score': 0.0, 'emotions': {}, 'trajectory': []}
        
        emotional_trajectory = []
        overall_emotions = defaultdict(float)
        
        for msg in messages:
            content = msg.get('content', '')
            if not content:
                continue
            
            # Analyze emotions using cultural patterns
            msg_emotions = self._analyze_korean_emotions(content)
            emotional_trajectory.append(msg_emotions)
            
            # Accumulate overall emotions
            for emotion, score in msg_emotions.items():
                overall_emotions[emotion] += score
        
        if not emotional_trajectory:
            return {'score': 0.0, 'emotions': {}, 'trajectory': []}
        
        # Normalize emotions
        total_messages = len(emotional_trajectory)
        for emotion in overall_emotions:
            overall_emotions[emotion] /= total_messages
        
        # Calculate emotional intensity and stability
        emotional_variance = self._calculate_emotional_variance(emotional_trajectory)
        emotional_intensity = sum(abs(score) for score in overall_emotions.values())
        
        emotional_score = min(1.0, emotional_intensity * (1.0 - emotional_variance))
        
        return {
            'score': emotional_score,
            'emotions': dict(overall_emotions),
            'trajectory': emotional_trajectory,
            'intensity': emotional_intensity,
            'stability': 1.0 - emotional_variance
        }

    def _analyze_korean_emotions(self, content: str) -> Dict[str, float]:
        """Analyze emotions with Korean cultural context"""
        
        emotions = {
            'positive': 0.0,
            'negative': 0.0,
            'concern': 0.0,
            'enthusiasm': 0.0,
            'frustration': 0.0,
            'agreement': 0.0
        }
        
        # Cultural pattern matching
        for emotion_type, patterns in self.cultural_patterns['emotional_expressions'].items():
            if emotion_type in emotions:
                score = sum(1 for pattern in patterns if pattern in content)
                emotions[emotion_type] = min(1.0, score * 0.3)
        
        # Positive/negative sentiment
        positive_markers = ['좋', '좋아', '기쁘', '만족', '성공', '효과']
        negative_markers = ['나쁘', '싫', '문제', '어려', '실패', '걱정']
        
        emotions['positive'] += sum(0.2 for marker in positive_markers if marker in content)
        emotions['negative'] += sum(0.2 for marker in negative_markers if marker in content)
        
        # Normalize scores
        for emotion in emotions:
            emotions[emotion] = min(1.0, emotions[emotion])
        
        return emotions

    async def _analyze_social_dimension(self, messages: List[Dict[str, Any]], participants: List[str]) -> Dict[str, Any]:
        """Analyze social dynamics and relationships"""
        
        if not messages or not participants:
            return {'score': 0.0, 'dynamics': {}, 'roles': {}}
        
        # Participation analysis
        speaker_counts = defaultdict(int)
        speaker_lengths = defaultdict(list)
        
        for msg in messages:
            sender = msg.get('sender', '')
            content = msg.get('content', '')
            
            if sender:
                speaker_counts[sender] += 1
                speaker_lengths[sender].append(len(content))
        
        # Calculate social dynamics
        total_messages = len(messages)
        participation_balance = self._calculate_participation_balance(speaker_counts, total_messages)
        
        # Analyze communication styles
        communication_styles = {}
        for speaker, lengths in speaker_lengths.items():
            avg_length = np.mean(lengths) if lengths else 0
            communication_styles[speaker] = {
                'verbosity': min(1.0, avg_length / 100),  # Normalize to 0-1
                'activity': speaker_counts[speaker] / total_messages,
                'avg_message_length': avg_length
            }
        
        # Detect hierarchy and formality
        hierarchy_score = self._detect_hierarchy_patterns(messages)
        
        social_score = (participation_balance * 0.4 + hierarchy_score * 0.6)
        
        return {
            'score': social_score,
            'dynamics': {
                'participation_balance': participation_balance,
                'hierarchy_score': hierarchy_score,
                'total_participants': len(participants),
                'active_participants': len(speaker_counts)
            },
            'roles': communication_styles
        }

    def _calculate_participation_balance(self, speaker_counts: Dict[str, int], total_messages: int) -> float:
        """Calculate how balanced the participation is"""
        if not speaker_counts or total_messages == 0:
            return 0.0
        
        # Calculate participation ratios
        participation_ratios = [count / total_messages for count in speaker_counts.values()]
        
        # Use Gini coefficient inverse as balance measure
        n = len(participation_ratios)
        if n <= 1:
            return 1.0
        
        # Sort ratios
        sorted_ratios = sorted(participation_ratios)
        
        # Calculate Gini coefficient
        index = np.arange(1, n + 1)
        gini = (2 * np.sum(index * sorted_ratios)) / (n * np.sum(sorted_ratios)) - (n + 1) / n
        
        # Return balance score (inverse of inequality)
        return 1.0 - gini

    def _detect_hierarchy_patterns(self, messages: List[Dict[str, Any]]) -> float:
        """Detect hierarchy and formality patterns"""
        
        formality_scores = []
        
        for msg in messages:
            content = msg.get('content', '')
            if not content:
                continue
            
            formality_score = 0.0
            
            # Check for formal language patterns
            for formal_marker in self.cultural_patterns['hierarchy_markers']['formal']:
                if formal_marker in content:
                    formality_score += 0.3
            
            for honorific in self.cultural_patterns['hierarchy_markers']['honorific']:
                if honorific in content:
                    formality_score += 0.5
            
            # Check for casual language patterns (negative score)
            for casual_marker in self.cultural_patterns['hierarchy_markers']['casual']:
                if casual_marker in content:
                    formality_score -= 0.2
            
            formality_scores.append(max(0.0, min(1.0, formality_score)))
        
        return np.mean(formality_scores) if formality_scores else 0.0

    async def _analyze_topical_dimension(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze topic evolution and coherence"""
        
        if not messages:
            return {'score': 0.0, 'topics': [], 'coherence': 0.0}
        
        # Extract topics from messages
        all_topics = []
        topic_evolution = []
        
        for msg in messages:
            content = msg.get('content', '')
            if not content:
                continue
            
            # Extract keywords using Korean NLP
            keywords = self.korean_analyzer.nouns(content)
            meaningful_keywords = [kw for kw in keywords if len(kw) > 1]
            
            # Categorize into topics
            msg_topics = self._categorize_topics(meaningful_keywords)
            all_topics.extend(msg_topics)
            topic_evolution.append(msg_topics)
        
        if not all_topics:
            return {'score': 0.0, 'topics': [], 'coherence': 0.0}
        
        # Calculate topic coherence
        topic_coherence = self._calculate_topic_coherence(topic_evolution)
        
        # Get dominant topics
        topic_counts = defaultdict(int)
        for topic in all_topics:
            topic_counts[topic] += 1
        
        dominant_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        topical_score = topic_coherence
        
        return {
            'score': topical_score,
            'topics': [topic for topic, count in dominant_topics],
            'coherence': topic_coherence,
            'evolution': topic_evolution,
            'topic_counts': dict(topic_counts)
        }

    def _categorize_topics(self, keywords: List[str]) -> List[str]:
        """Categorize keywords into broader topics"""
        
        topic_categories = {
            '재건축': ['재건축', '재개발', '조합', '시공사', '분담금'],
            '회의': ['회의', '총회', '결정', '논의', '투표'],
            '비용': ['비용', '돈', '분담금', '부담금', '가격'],
            '시공': ['시공', '공사', '건설', '설계', '공정'],
            '일정': ['일정', '스케줄', '기간', '날짜', '시간'],
            '문제': ['문제', '이슈', '갈등', '불만', '개선']
        }
        
        topics = []
        for keyword in keywords:
            for topic, category_keywords in topic_categories.items():
                if any(cat_kw in keyword for cat_kw in category_keywords):
                    topics.append(topic)
                    break
        
        return topics

    def _calculate_topic_coherence(self, topic_evolution: List[List[str]]) -> float:
        """Calculate how coherent the topic flow is"""
        
        if len(topic_evolution) < 2:
            return 1.0
        
        coherence_scores = []
        
        for i in range(1, len(topic_evolution)):
            prev_topics = set(topic_evolution[i-1])
            curr_topics = set(topic_evolution[i])
            
            if not prev_topics and not curr_topics:
                coherence_scores.append(1.0)
            elif not prev_topics or not curr_topics:
                coherence_scores.append(0.0)
            else:
                overlap = len(prev_topics.intersection(curr_topics))
                total = len(prev_topics.union(curr_topics))
                coherence_scores.append(overlap / total if total > 0 else 0.0)
        
        return np.mean(coherence_scores) if coherence_scores else 0.0

    async def _analyze_cultural_dimension(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze cultural context and communication patterns"""
        
        if not messages:
            return {'score': 0.0, 'markers': [], 'patterns': {}}
        
        cultural_markers = []
        communication_patterns = defaultdict(int)
        
        for msg in messages:
            content = msg.get('content', '')
            if not content:
                continue
            
            # Detect cultural markers
            for category, markers in self.cultural_patterns.items():
                if isinstance(markers, dict):
                    for subcategory, marker_list in markers.items():
                        for marker in marker_list:
                            if marker in content:
                                cultural_markers.append(f"{category}_{subcategory}")
                                communication_patterns[f"{category}_{subcategory}"] += 1
        
        # Calculate cultural score based on pattern richness
        cultural_score = min(1.0, len(set(cultural_markers)) * 0.1)
        
        return {
            'score': cultural_score,
            'markers': list(set(cultural_markers)),
            'patterns': dict(communication_patterns)
        }

    async def _analyze_strategic_dimension(self, messages: List[Dict[str, Any]], participants: List[str]) -> Dict[str, Any]:
        """Analyze strategic communication patterns (Expert+ level)"""
        
        if not messages:
            return {'score': 0.0, 'strategies': [], 'intentions': {}}
        
        strategic_patterns = []
        speaker_intentions = defaultdict(list)
        
        for msg in messages:
            content = msg.get('content', '')
            sender = msg.get('sender', '')
            
            if not content:
                continue
            
            # Detect strategic communication patterns
            strategies = self._detect_communication_strategies(content)
            strategic_patterns.extend(strategies)
            
            if sender:
                speaker_intentions[sender].extend(strategies)
        
        # Calculate strategic complexity
        unique_strategies = len(set(strategic_patterns))
        strategic_score = min(1.0, unique_strategies * 0.15)
        
        return {
            'score': strategic_score,
            'strategies': list(set(strategic_patterns)),
            'intentions': dict(speaker_intentions),
            'complexity': unique_strategies
        }

    def _detect_communication_strategies(self, content: str) -> List[str]:
        """Detect strategic communication patterns"""
        
        strategies = []
        
        strategy_patterns = {
            'persuasion': ['설득', '납득', '이해', '동의', '찬성'],
            'information_seeking': ['궁금', '질문', '문의', '알고', '확인'],
            'problem_solving': ['해결', '방법', '방안', '대책', '개선'],
            'consensus_building': ['합의', '의견', '모두', '함께', '공동'],
            'authority_appeal': ['규정', '법률', '원칙', '기준', '표준'],
            'emotional_appeal': ['걱정', '불안', '희망', '기대', '우려']
        }
        
        for strategy, patterns in strategy_patterns.items():
            if any(pattern in content for pattern in patterns):
                strategies.append(strategy)
        
        return strategies

    def _calculate_context_confidence(self, *context_analyses) -> float:
        """Calculate overall confidence in context analysis"""
        
        valid_analyses = [analysis for analysis in context_analyses if analysis and 'score' in analysis]
        
        if not valid_analyses:
            return 0.0
        
        # Base confidence on data richness and consistency
        scores = [analysis['score'] for analysis in valid_analyses]
        score_variance = np.var(scores) if len(scores) > 1 else 0.0
        
        # High variance means inconsistent analysis, lower confidence
        consistency_factor = 1.0 - min(0.5, score_variance)
        
        # Data richness factor
        richness_factor = min(1.0, len(valid_analyses) / 6)  # 6 dimensions max
        
        confidence = np.mean(scores) * consistency_factor * richness_factor
        
        return min(1.0, confidence)

    async def _generate_context_embedding(self, context_vector: ContextVector) -> np.ndarray:
        """Generate high-dimensional embedding for context vector"""
        
        try:
            # Create text representation of context
            context_text = self._context_to_text(context_vector)
            
            # Generate embedding using sentence transformer
            embedding = self.sentence_transformer.encode([context_text])[0]
            
            return embedding
            
        except Exception as e:
            logger.error(f"Context embedding generation failed: {e}")
            return np.zeros(768)  # Default embedding size

    def _context_to_text(self, context_vector: ContextVector) -> str:
        """Convert context vector to text representation"""
        
        text_parts = []
        
        for dimension, score in context_vector.dimensions.items():
            text_parts.append(f"{dimension.value}:{score:.2f}")
        
        # Add source data summaries
        if context_vector.source_data:
            for key, data in context_vector.source_data.items():
                if isinstance(data, dict) and 'score' in data:
                    text_parts.append(f"{key}_analysis:{data['score']:.2f}")
        
        return " ".join(text_parts)

    def _calculate_emotional_variance(self, emotional_trajectory: List[Dict[str, float]]) -> float:
        """Calculate emotional variance across conversation"""
        
        if len(emotional_trajectory) < 2:
            return 0.0
        
        # Track variance for each emotion type
        emotion_types = set()
        for emotions in emotional_trajectory:
            emotion_types.update(emotions.keys())
        
        variances = []
        for emotion_type in emotion_types:
            values = [emotions.get(emotion_type, 0.0) for emotions in emotional_trajectory]
            if len(values) > 1:
                variances.append(np.var(values))
        
        return np.mean(variances) if variances else 0.0

class ConversationPredictor:
    """Predictive conversation modeling"""
    
    def __init__(self):
        self.model = self._build_prediction_model()
    
    def _build_prediction_model(self):
        """Build neural network for conversation prediction"""
        # Simplified model for demo
        return None
    
    def predict_next_turn(self, context_vector: ContextVector) -> Dict[str, Any]:
        """Predict likely next conversation turn"""
        # Implementation would use the trained model
        return {
            'predicted_speaker': 'unknown',
            'predicted_topic': 'continuation',
            'predicted_emotion': 'neutral',
            'confidence': 0.5
        }

class EmotionPredictor:
    """Emotional trajectory prediction"""
    
    def predict_emotional_response(self, context_vector: ContextVector) -> Dict[str, float]:
        """Predict emotional response to potential messages"""
        return {
            'positive': 0.3,
            'negative': 0.2,
            'neutral': 0.5
        }

class ResponseOptimizer:
    """Response generation optimization"""
    
    def optimize_response(self, 
                         context_vector: ContextVector,
                         candidate_responses: List[str]) -> List[Tuple[str, float]]:
        """Optimize and rank response candidates"""
        
        # Score responses based on context fitness
        scored_responses = []
        for response in candidate_responses:
            score = self._calculate_response_fitness(response, context_vector)
            scored_responses.append((response, score))
        
        return sorted(scored_responses, key=lambda x: x[1], reverse=True)
    
    def _calculate_response_fitness(self, response: str, context_vector: ContextVector) -> float:
        """Calculate how well a response fits the context"""
        # Simplified fitness calculation
        base_score = 0.5
        
        # Adjust based on context dimensions
        if context_vector.dimensions.get(ContextDimension.EMOTIONAL, 0) > 0.7:
            if any(word in response for word in ['이해', '공감', '걱정']):
                base_score += 0.2
        
        return min(1.0, base_score)

# Factory function for easy instantiation
def create_advanced_context_intelligence(intelligence_level: IntelligenceLevel = IntelligenceLevel.EXPERT) -> AdvancedContextIntelligence:
    """Create and initialize Advanced Context Intelligence system"""
    return AdvancedContextIntelligence(intelligence_level=intelligence_level)

if __name__ == "__main__":
    # Example usage
    async def test_context_intelligence():
        aci = create_advanced_context_intelligence(IntelligenceLevel.GENIUS)
        
        sample_data = {
            'messages': [
                {'content': '시공사 선정에 대해 논의해야 합니다', 'sender': '조합장', 'timestamp': '2024-01-24T10:00:00'},
                {'content': '네, 걱정이 많습니다. 신중하게 결정해야겠어요', 'sender': '조합원A', 'timestamp': '2024-01-24T10:02:00'},
                {'content': '저도 동의합니다. 여러 옵션을 검토해보시죠', 'sender': '조합원B', 'timestamp': '2024-01-24T10:05:00'}
            ],
            'participants': ['조합장', '조합원A', '조합원B']
        }
        
        context_vector = await aci.analyze_multi_dimensional_context(sample_data)
        print(f"Context Analysis Complete - Confidence: {context_vector.confidence:.2f}")
        print(f"Dimensions: {context_vector.dimensions}")
    
    # Run test
    # asyncio.run(test_context_intelligence()) 