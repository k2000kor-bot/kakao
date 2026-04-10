from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import json
import logging
import random
import sqlite3
from collections import defaultdict, Counter
import asyncio
import time

from chat_conversation_analyzer import ChatConversationAnalyzer, ChatMessage
from response_message_generator import ResponseMessageGenerator, ResponseType, OpinionType, OpinionMessage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class OpinionCampaign:
    """여론 조성 캠페인"""
    campaign_id: str
    target_message_id: str
    target_person: str
    objective: str  # support, oppose, neutralize
    strategy: List[OpinionType]
    intensity: float  # 0.0 ~ 1.0
    duration_hours: int
    message_frequency: int  # 시간당 메시지 수
    participant_profiles: List[Dict[str, Any]]
    status: str  # active, paused, completed
    created_at: datetime
    expires_at: datetime


@dataclass
class VirtualParticipant:
    """가상 참여자 프로필"""
    participant_id: str
    name: str
    personality: str  # enthusiastic, moderate, critical, neutral
    opinion_tendency: str  # positive, negative, balanced
    activity_level: float  # 0.0 ~ 1.0
    expertise_areas: List[str]
    typical_tone: str  # formal, casual, aggressive, friendly
    response_patterns: Dict[str, float]


@dataclass
class OpinionMetrics:
    """여론 측정 지표"""
    total_messages: int
    support_ratio: float
    opposition_ratio: float
    neutral_ratio: float
    engagement_score: float
    sentiment_shift: float
    influence_distribution: Dict[str, float]
    trending_topics: List[str]


class PublicOpinionOrchestrator:
    """여론 형성 조율 시스템"""
    
    def __init__(self, analyzer: ChatConversationAnalyzer, generator: ResponseMessageGenerator,
                 db_path: str = "opinion_orchestrator.db"):
        self.analyzer = analyzer
        self.generator = generator
        self.db_path = db_path
        
        # 가상 참여자 풀
        self.virtual_participants = self._initialize_virtual_participants()
        
        # 여론 조성 전략
        self.opinion_strategies = self._initialize_opinion_strategies()
        
        # 활성 캠페인
        self.active_campaigns: Dict[str, OpinionCampaign] = {}
        
        # 데이터베이스 초기화
        self.init_database()
        
    def _initialize_virtual_participants(self) -> List[VirtualParticipant]:
        """가상 참여자 초기화"""
        participants = []
        
        # 다양한 성격의 참여자들
        participant_data = [
            {
                "name": "열정적인주민", "personality": "enthusiastic", 
                "opinion_tendency": "positive", "activity_level": 0.9,
                "expertise_areas": ["재개발", "분담금"], "typical_tone": "casual"
            },
            {
                "name": "신중한조합원", "personality": "moderate", 
                "opinion_tendency": "balanced", "activity_level": 0.6,
                "expertise_areas": ["법적사항", "시공사"], "typical_tone": "formal"
            },
            {
                "name": "비판적시민", "personality": "critical", 
                "opinion_tendency": "negative", "activity_level": 0.7,
                "expertise_areas": ["민원", "법적사항"], "typical_tone": "aggressive"
            },
            {
                "name": "중립적관찰자", "personality": "neutral", 
                "opinion_tendency": "balanced", "activity_level": 0.4,
                "expertise_areas": ["일정", "투표"], "typical_tone": "formal"
            },
            {
                "name": "적극적지지자", "personality": "enthusiastic", 
                "opinion_tendency": "positive", "activity_level": 0.8,
                "expertise_areas": ["재개발", "시공사"], "typical_tone": "friendly"
            },
            {
                "name": "현실적주민", "personality": "moderate", 
                "opinion_tendency": "balanced", "activity_level": 0.5,
                "expertise_areas": ["분담금", "일정"], "typical_tone": "casual"
            },
            {
                "name": "우려하는이웃", "personality": "critical", 
                "opinion_tendency": "negative", "activity_level": 0.6,
                "expertise_areas": ["분담금", "민원"], "typical_tone": "formal"
            },
            {
                "name": "경험많은선배", "personality": "moderate", 
                "opinion_tendency": "positive", "activity_level": 0.7,
                "expertise_areas": ["재개발", "시공사"], "typical_tone": "formal"
            }
        ]
        
        for i, data in enumerate(participant_data):
            participant = VirtualParticipant(
                participant_id=f"vp_{i+1:03d}",
                name=data["name"],
                personality=data["personality"],
                opinion_tendency=data["opinion_tendency"],
                activity_level=data["activity_level"],
                expertise_areas=data["expertise_areas"],
                typical_tone=data["typical_tone"],
                response_patterns=self._generate_response_patterns(data["personality"])
            )
            participants.append(participant)
            
        return participants
        
    def _generate_response_patterns(self, personality: str) -> Dict[str, float]:
        """성격별 응답 패턴 생성"""
        if personality == "enthusiastic":
            return {
                OpinionType.SUPPORT.value: 0.4,
                OpinionType.AGREEMENT.value: 0.3,
                OpinionType.APPROVAL.value: 0.2,
                OpinionType.POSITIVE.value: 0.1
            }
        elif personality == "critical":
            return {
                OpinionType.OPPOSITION.value: 0.35,
                OpinionType.COUNTER.value: 0.25,
                OpinionType.NEUTRAL.value: 0.2,
                OpinionType.UNRELATED.value: 0.2
            }
        elif personality == "moderate":
            return {
                OpinionType.AGREEMENT.value: 0.25,
                OpinionType.NEUTRAL.value: 0.3,
                OpinionType.POSITIVE.value: 0.2,
                OpinionType.OPPOSITION.value: 0.15,
                OpinionType.UNRELATED.value: 0.1
            }
        else:  # neutral
            return {
                OpinionType.NEUTRAL.value: 0.5,
                OpinionType.UNRELATED.value: 0.2,
                OpinionType.AGREEMENT.value: 0.15,
                OpinionType.OPPOSITION.value: 0.15
            }
            
    def _initialize_opinion_strategies(self) -> Dict[str, Dict[str, Any]]:
        """여론 조성 전략 초기화"""
        return {
            "overwhelming_support": {
                "description": "압도적 지지 조성",
                "opinion_distribution": {
                    OpinionType.SUPPORT: 0.4,
                    OpinionType.AGREEMENT: 0.3,
                    OpinionType.APPROVAL: 0.2,
                    OpinionType.POSITIVE: 0.1
                },
                "intensity": 0.8,
                "frequency": 8  # 시간당 8개 메시지
            },
            "balanced_discussion": {
                "description": "균형잡힌 토론 유도",
                "opinion_distribution": {
                    OpinionType.AGREEMENT: 0.25,
                    OpinionType.OPPOSITION: 0.25,
                    OpinionType.NEUTRAL: 0.3,
                    OpinionType.POSITIVE: 0.1,
                    OpinionType.COUNTER: 0.1
                },
                "intensity": 0.5,
                "frequency": 6
            },
            "strong_opposition": {
                "description": "강력한 반대 여론 조성",
                "opinion_distribution": {
                    OpinionType.OPPOSITION: 0.35,
                    OpinionType.COUNTER: 0.25,
                    OpinionType.NEUTRAL: 0.2,
                    OpinionType.UNRELATED: 0.2
                },
                "intensity": 0.7,
                "frequency": 7
            },
            "neutralization": {
                "description": "여론 중립화",
                "opinion_distribution": {
                    OpinionType.NEUTRAL: 0.5,
                    OpinionType.UNRELATED: 0.3,
                    OpinionType.AGREEMENT: 0.1,
                    OpinionType.OPPOSITION: 0.1
                },
                "intensity": 0.3,
                "frequency": 4
            },
            "topic_diversion": {
                "description": "주제 전환 유도",
                "opinion_distribution": {
                    OpinionType.UNRELATED: 0.6,
                    OpinionType.NEUTRAL: 0.2,
                    OpinionType.AGREEMENT: 0.1,
                    OpinionType.POSITIVE: 0.1
                },
                "intensity": 0.4,
                "frequency": 5
            }
        }
        
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 여론 캠페인 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS opinion_campaigns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                campaign_id TEXT UNIQUE,
                target_message_id TEXT,
                target_person TEXT,
                objective TEXT,
                strategy TEXT,
                intensity REAL,
                duration_hours INTEGER,
                message_frequency INTEGER,
                participant_profiles TEXT,
                status TEXT,
                created_at TEXT,
                expires_at TEXT
            )
        ''')
        
        # 생성된 여론 메시지 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS generated_opinion_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id TEXT UNIQUE,
                campaign_id TEXT,
                participant_id TEXT,
                opinion_type TEXT,
                content TEXT,
                tone TEXT,
                intensity REAL,
                generated_at TEXT,
                scheduled_at TEXT,
                sent_at TEXT,
                status TEXT
            )
        ''')
        
        # 여론 측정 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS opinion_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                target_message_id TEXT,
                measurement_time TEXT,
                total_messages INTEGER,
                support_ratio REAL,
                opposition_ratio REAL,
                neutral_ratio REAL,
                engagement_score REAL,
                sentiment_shift REAL,
                influence_distribution TEXT,
                trending_topics TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        
    def create_opinion_campaign(self, target_message: ChatMessage, 
                              objective: str, strategy_name: str,
                              duration_hours: int = 24,
                              custom_intensity: Optional[float] = None) -> str:
        """여론 조성 캠페인 생성"""
        
        strategy = self.opinion_strategies.get(strategy_name)
        if not strategy:
            raise ValueError(f"알 수 없는 전략: {strategy_name}")
            
        # 캠페인 ID 생성
        campaign_id = f"camp_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random.randint(1000, 9999)}"
        
        # 전략에 따른 여론 유형들
        opinion_types = list(strategy["opinion_distribution"].keys())
        
        # 참여자 선별
        selected_participants = self._select_participants_for_campaign(
            objective, len(opinion_types), strategy["intensity"]
        )
        
        # 캠페인 생성
        campaign = OpinionCampaign(
            campaign_id=campaign_id,
            target_message_id=target_message.message_id,
            target_person=target_message.sender,
            objective=objective,
            strategy=opinion_types,
            intensity=custom_intensity or strategy["intensity"],
            duration_hours=duration_hours,
            message_frequency=strategy["frequency"],
            participant_profiles=[asdict(p) for p in selected_participants],
            status="active",
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(hours=duration_hours)
        )
        
        # 활성 캠페인에 추가
        self.active_campaigns[campaign_id] = campaign
        
        # 데이터베이스에 저장
        self._save_campaign(campaign)
        
        # 메시지 생성 스케줄링
        asyncio.create_task(self._execute_campaign(campaign, target_message, strategy))
        
        logger.info(f"여론 캠페인 생성: {campaign_id} ({strategy_name})")
        return campaign_id
        
    def _select_participants_for_campaign(self, objective: str, num_types: int, 
                                        intensity: float) -> List[VirtualParticipant]:
        """캠페인에 참여할 가상 참여자들 선별"""
        
        # 목표에 따라 참여자 필터링
        if objective == "support":
            preferred_tendencies = ["positive", "balanced"]
            preferred_personalities = ["enthusiastic", "moderate"]
        elif objective == "oppose":
            preferred_tendencies = ["negative", "balanced"]
            preferred_personalities = ["critical", "moderate"]
        else:  # neutralize
            preferred_tendencies = ["balanced"]
            preferred_personalities = ["neutral", "moderate"]
            
        # 적합한 참여자들 필터링
        suitable_participants = []
        for participant in self.virtual_participants:
            if (participant.opinion_tendency in preferred_tendencies and
                participant.personality in preferred_personalities):
                suitable_participants.append(participant)
                
        # 강도에 따라 참여자 수 결정
        num_participants = min(
            int(intensity * 8),  # 최대 8명
            len(suitable_participants),
            max(3, num_types)  # 최소 3명
        )
        
        # 무작위 선별
        selected = random.sample(suitable_participants, num_participants)
        
        return selected
        
    async def _execute_campaign(self, campaign: OpinionCampaign, 
                              target_message: ChatMessage,
                              strategy: Dict[str, Any]):
        """캠페인 실행"""
        
        logger.info(f"캠페인 실행 시작: {campaign.campaign_id}")
        
        start_time = datetime.now()
        end_time = start_time + timedelta(hours=campaign.duration_hours)
        
        message_interval = 3600 / campaign.message_frequency  # 초 단위
        
        participants = [
            VirtualParticipant(**p) for p in campaign.participant_profiles
        ]
        
        while datetime.now() < end_time and campaign.status == "active":
            try:
                # 이번 라운드에서 메시지를 생성할 참여자들 선택
                active_participants = self._select_active_participants(
                    participants, campaign.intensity
                )
                
                # 각 참여자별로 메시지 생성
                for participant in active_participants:
                    opinion_type = self._choose_opinion_type(participant, strategy)
                    
                    # 여론 메시지 생성
                    opinion_messages = self.generator.generate_opinion_messages(
                        target_message, [opinion_type], count_per_type=1
                    )
                    
                    if opinion_messages:
                        opinion_msg = opinion_messages[0]
                        
                        # 참여자 스타일에 맞게 조정
                        opinion_msg = self._customize_message_for_participant(
                            opinion_msg, participant
                        )
                        
                        # 메시지 저장
                        self._save_generated_message(
                            opinion_msg, campaign.campaign_id, participant.participant_id
                        )
                        
                        logger.info(f"여론 메시지 생성: {participant.name} - {opinion_type.value}")
                        
                # 다음 메시지까지 대기
                await asyncio.sleep(message_interval)
                
            except Exception as e:
                logger.error(f"캠페인 실행 오류: {e}")
                await asyncio.sleep(60)  # 1분 후 재시도
                
        # 캠페인 완료
        campaign.status = "completed"
        self._update_campaign_status(campaign.campaign_id, "completed")
        
        logger.info(f"캠페인 완료: {campaign.campaign_id}")
        
    def _select_active_participants(self, participants: List[VirtualParticipant],
                                  intensity: float) -> List[VirtualParticipant]:
        """활성 참여자 선택"""
        active = []
        
        for participant in participants:
            # 활동 확률 = 기본 활동도 * 캠페인 강도
            activity_probability = participant.activity_level * intensity
            
            if random.random() < activity_probability:
                active.append(participant)
                
        # 최소 1명은 활동하도록
        if not active and participants:
            active.append(random.choice(participants))
            
        return active
        
    def _choose_opinion_type(self, participant: VirtualParticipant,
                           strategy: Dict[str, Any]) -> OpinionType:
        """참여자별 여론 유형 선택"""
        
        # 전략의 분포와 참여자의 성향을 결합
        strategy_distribution = strategy["opinion_distribution"]
        participant_patterns = participant.response_patterns
        
        # 가중 평균 계산
        combined_weights = {}
        for opinion_type, strategy_weight in strategy_distribution.items():
            participant_weight = participant_patterns.get(opinion_type.value, 0.1)
            combined_weights[opinion_type] = strategy_weight * (1 + participant_weight)
            
        # 가중치에 따라 선택
        total_weight = sum(combined_weights.values())
        random_value = random.random() * total_weight
        
        cumulative_weight = 0
        for opinion_type, weight in combined_weights.items():
            cumulative_weight += weight
            if random_value <= cumulative_weight:
                return opinion_type
                
        # 기본값
        return list(strategy_distribution.keys())[0]
        
    def _customize_message_for_participant(self, message: OpinionMessage,
                                         participant: VirtualParticipant) -> OpinionMessage:
        """참여자 스타일에 맞게 메시지 조정"""
        
        # 톤 조정
        message.tone = participant.typical_tone
        
        # 강도 조정 (성격에 따라)
        if participant.personality == "enthusiastic":
            message.intensity = min(message.intensity * 1.2, 1.0)
        elif participant.personality == "critical":
            message.intensity = min(message.intensity * 1.1, 1.0)
        elif participant.personality == "neutral":
            message.intensity = message.intensity * 0.8
            
        # 메시지 ID에 참여자 정보 추가
        message.message_id = f"{participant.participant_id}_{message.message_id}"
        
        return message
        
    def _save_campaign(self, campaign: OpinionCampaign):
        """캠페인 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO opinion_campaigns 
            (campaign_id, target_message_id, target_person, objective, strategy,
             intensity, duration_hours, message_frequency, participant_profiles,
             status, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            campaign.campaign_id, campaign.target_message_id, campaign.target_person,
            campaign.objective, json.dumps([s.value for s in campaign.strategy]),
            campaign.intensity, campaign.duration_hours, campaign.message_frequency,
            json.dumps(campaign.participant_profiles), campaign.status,
            campaign.created_at.isoformat(), campaign.expires_at.isoformat()
        ))
        
        conn.commit()
        conn.close()
        
    def _save_generated_message(self, message: OpinionMessage, 
                              campaign_id: str, participant_id: str):
        """생성된 메시지 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO generated_opinion_messages 
            (message_id, campaign_id, participant_id, opinion_type, content,
             tone, intensity, generated_at, scheduled_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            message.message_id, campaign_id, participant_id, message.opinion_type.value,
            message.content, message.tone, message.intensity,
            message.generated_at.isoformat(), datetime.now().isoformat(), "generated"
        ))
        
        conn.commit()
        conn.close()
        
    def _update_campaign_status(self, campaign_id: str, status: str):
        """캠페인 상태 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE opinion_campaigns SET status = ? WHERE campaign_id = ?
        ''', (status, campaign_id))
        
        conn.commit()
        conn.close()
        
    def measure_opinion_impact(self, target_message_id: str,
                             time_window_hours: int = 24) -> OpinionMetrics:
        """여론 영향 측정"""
        
        # 시간 범위 설정
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=time_window_hours)
        
        # 관련 메시지들 조회
        related_messages = self.analyzer.get_messages_by_timerange(start_time, end_time)
        
        # 감정 분포 계산
        sentiment_counter = Counter()
        total_messages = len(related_messages)
        
        for message in related_messages:
            sentiment_counter[message.sentiment] += 1
            
        # 비율 계산
        support_ratio = sentiment_counter.get("positive", 0) / max(total_messages, 1)
        opposition_ratio = sentiment_counter.get("negative", 0) / max(total_messages, 1)
        neutral_ratio = sentiment_counter.get("neutral", 0) / max(total_messages, 1)
        
        # 참여도 점수 계산
        engagement_score = self._calculate_engagement_score(related_messages)
        
        # 감정 변화 계산
        sentiment_shift = self._calculate_sentiment_shift(target_message_id, time_window_hours)
        
        # 영향력 분포 계산
        influence_distribution = self._calculate_influence_distribution(related_messages)
        
        # 트렌딩 주제 추출
        trending_topics = self._extract_trending_topics(related_messages)
        
        metrics = OpinionMetrics(
            total_messages=total_messages,
            support_ratio=support_ratio,
            opposition_ratio=opposition_ratio,
            neutral_ratio=neutral_ratio,
            engagement_score=engagement_score,
            sentiment_shift=sentiment_shift,
            influence_distribution=influence_distribution,
            trending_topics=trending_topics
        )
        
        # 측정 결과 저장
        self._save_opinion_metrics(target_message_id, metrics)
        
        return metrics
        
    def _calculate_engagement_score(self, messages: List[ChatMessage]) -> float:
        """참여도 점수 계산"""
        if not messages:
            return 0.0
            
        # 메시지 빈도
        time_span = (messages[-1].timestamp - messages[0].timestamp).total_seconds() / 3600
        frequency_score = len(messages) / max(time_span, 1) * 10
        
        # 메시지 길이 (상세한 의견 표현)
        avg_length = sum(len(msg.content) for msg in messages) / len(messages)
        length_score = min(avg_length / 50, 10)  # 50자 기준
        
        # 참여자 다양성
        unique_senders = len(set(msg.sender for msg in messages))
        diversity_score = min(unique_senders, 10)
        
        # 종합 점수 (0-10 스케일)
        engagement_score = (frequency_score + length_score + diversity_score) / 3
        
        return min(engagement_score, 10.0)
        
    def _calculate_sentiment_shift(self, target_message_id: str, 
                                 time_window_hours: int) -> float:
        """감정 변화 측정"""
        
        # 이전 기간과 비교
        current_end = datetime.now()
        current_start = current_end - timedelta(hours=time_window_hours)
        previous_end = current_start
        previous_start = previous_end - timedelta(hours=time_window_hours)
        
        # 현재 기간 감정 분포
        current_messages = self.analyzer.get_messages_by_timerange(current_start, current_end)
        current_sentiment = self._get_sentiment_score(current_messages)
        
        # 이전 기간 감정 분포
        previous_messages = self.analyzer.get_messages_by_timerange(previous_start, previous_end)
        previous_sentiment = self._get_sentiment_score(previous_messages)
        
        # 변화량 계산 (-1.0 ~ 1.0)
        sentiment_shift = current_sentiment - previous_sentiment
        
        return sentiment_shift
        
    def _get_sentiment_score(self, messages: List[ChatMessage]) -> float:
        """메시지들의 전체 감정 점수 계산"""
        if not messages:
            return 0.0
            
        sentiment_values = {"positive": 1.0, "neutral": 0.0, "negative": -1.0}
        total_score = sum(sentiment_values.get(msg.sentiment, 0.0) for msg in messages)
        
        return total_score / len(messages)
        
    def _calculate_influence_distribution(self, messages: List[ChatMessage]) -> Dict[str, float]:
        """영향력 분포 계산"""
        sender_influence = defaultdict(float)
        
        for message in messages:
            # 메시지 길이에 따른 영향력
            length_factor = min(len(message.content) / 100, 2.0)
            
            # 멘션 수에 따른 영향력
            mention_factor = len(message.mentions) * 0.5
            
            # 중요 키워드 포함에 따른 영향력
            keyword_factor = sum(1 for keyword in self.analyzer.important_keywords 
                                if keyword in message.content) * 0.3
            
            influence = 1.0 + length_factor + mention_factor + keyword_factor
            sender_influence[message.sender] += influence
            
        # 정규화
        total_influence = sum(sender_influence.values())
        if total_influence > 0:
            return {sender: influence / total_influence 
                   for sender, influence in sender_influence.items()}
        else:
            return {}
            
    def _extract_trending_topics(self, messages: List[ChatMessage]) -> List[str]:
        """트렌딩 주제 추출"""
        topic_counter = Counter()
        
        for message in messages:
            if message.topic_category:
                topic_counter[message.topic_category] += 1
                
        # 상위 5개 주제
        trending = [topic for topic, count in topic_counter.most_common(5)]
        
        return trending
        
    def _save_opinion_metrics(self, target_message_id: str, metrics: OpinionMetrics):
        """여론 측정 결과 저장"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO opinion_metrics 
            (target_message_id, measurement_time, total_messages, support_ratio,
             opposition_ratio, neutral_ratio, engagement_score, sentiment_shift,
             influence_distribution, trending_topics)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            target_message_id, datetime.now().isoformat(), metrics.total_messages,
            metrics.support_ratio, metrics.opposition_ratio, metrics.neutral_ratio,
            metrics.engagement_score, metrics.sentiment_shift,
            json.dumps(metrics.influence_distribution), json.dumps(metrics.trending_topics)
        ))
        
        conn.commit()
        conn.close()
        
    def get_campaign_status(self, campaign_id: str) -> Dict[str, Any]:
        """캠페인 상태 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 캠페인 정보
        cursor.execute('''
            SELECT * FROM opinion_campaigns WHERE campaign_id = ?
        ''', (campaign_id,))
        
        campaign_row = cursor.fetchone()
        if not campaign_row:
            return {"error": "캠페인을 찾을 수 없습니다"}
            
        # 생성된 메시지 수
        cursor.execute('''
            SELECT COUNT(*) FROM generated_opinion_messages WHERE campaign_id = ?
        ''', (campaign_id,))
        
        message_count = cursor.fetchone()[0]
        
        # 여론 유형별 분포
        cursor.execute('''
            SELECT opinion_type, COUNT(*) FROM generated_opinion_messages 
            WHERE campaign_id = ? GROUP BY opinion_type
        ''', (campaign_id,))
        
        opinion_distribution = {row[0]: row[1] for row in cursor.fetchall()}
        
        conn.close()
        
        return {
            "campaign_id": campaign_id,
            "status": campaign_row[10],  # status 컬럼
            "generated_messages": message_count,
            "opinion_distribution": opinion_distribution,
            "created_at": campaign_row[11],
            "expires_at": campaign_row[12]
        }
        
    def get_generated_messages(self, campaign_id: str) -> List[Dict[str, Any]]:
        """생성된 메시지들 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT message_id, participant_id, opinion_type, content, tone, intensity, generated_at
            FROM generated_opinion_messages 
            WHERE campaign_id = ?
            ORDER BY generated_at ASC
        ''', (campaign_id,))
        
        messages = []
        for row in cursor.fetchall():
            messages.append({
                "message_id": row[0],
                "participant_id": row[1],
                "opinion_type": row[2],
                "content": row[3],
                "tone": row[4],
                "intensity": row[5],
                "generated_at": row[6]
            })
            
        conn.close()
        return messages


# 사용 예시
if __name__ == "__main__":
    from chat_conversation_analyzer import ChatConversationAnalyzer
    from response_message_generator import ResponseMessageGenerator
    
    # 시스템 초기화
    analyzer = ChatConversationAnalyzer()
    generator = ResponseMessageGenerator(analyzer)
    orchestrator = PublicOpinionOrchestrator(analyzer, generator)
    
    # 샘플 타겟 메시지
    target_message = ChatMessage(
        message_id="msg_target",
        chat_room="샘플 프로젝트",
        sender="김조합장",
        content="현대건설로 시공사를 결정하면 분담금이 너무 높아질 것 같은데 어떻게 생각하시나요?",
        timestamp=datetime.now(),
        message_type="text",
        sentiment="neutral",
        topic_category="시공사"
    )
    
    print("🗳️ 여론 형성 시스템 테스트")
    print("=" * 60)
    
    # 1. 압도적 지지 캠페인 생성
    campaign_id = orchestrator.create_opinion_campaign(
        target_message, 
        objective="support",
        strategy_name="overwhelming_support",
        duration_hours=2  # 테스트용 2시간
    )
    
    print(f"✅ 여론 캠페인 생성: {campaign_id}")
    print(f"   전략: 압도적 지지 조성")
    print(f"   참여자: {len(orchestrator.active_campaigns[campaign_id].participant_profiles)}명")
    
    # 2. 가상 참여자 정보 출력
    print(f"\n👥 가상 참여자들:")
    for i, participant_data in enumerate(orchestrator.active_campaigns[campaign_id].participant_profiles[:3]):
        print(f"   {i+1}. {participant_data['name']} ({participant_data['personality']}, {participant_data['opinion_tendency']})")
        
    # 3. 즉시 몇 개 메시지 생성 (테스트용)
    participants = [VirtualParticipant(**p) for p in orchestrator.active_campaigns[campaign_id].participant_profiles]
    strategy = orchestrator.opinion_strategies["overwhelming_support"]
    
    print(f"\n💬 생성된 여론 메시지들:")
    for i, participant in enumerate(participants[:3]):
        opinion_type = orchestrator._choose_opinion_type(participant, strategy)
        opinion_messages = generator.generate_opinion_messages(target_message, [opinion_type], 1)
        
        if opinion_messages:
            msg = opinion_messages[0]
            msg = orchestrator._customize_message_for_participant(msg, participant)
            print(f"   [{participant.name}] ({opinion_type.value}) {msg.content}")
            
    # 4. 여론 영향 측정
    print(f"\n📊 여론 영향 측정:")
    metrics = orchestrator.measure_opinion_impact(target_message.message_id, 1)
    print(f"   - 총 메시지: {metrics.total_messages}개")
    print(f"   - 지지 비율: {metrics.support_ratio:.1%}")
    print(f"   - 반대 비율: {metrics.opposition_ratio:.1%}")
    print(f"   - 중립 비율: {metrics.neutral_ratio:.1%}")
    print(f"   - 참여도 점수: {metrics.engagement_score:.1f}/10")
    
    print(f"\n�� 여론 형성 시스템 구축 완료!") 