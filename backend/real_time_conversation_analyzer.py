#!/usr/bin/env python3
"""
실시간 대화 분석 및 감정 인식 시스템 v9.0
- 실시간 메시지 스트림 처리
- 감정 분석 및 감정 변화 추적
- 대화 흐름 및 맥락 실시간 분석
- 위험 상황 자동 감지
- 개입 시점 추천
"""

import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, AsyncGenerator, Tuple
from dataclasses import dataclass, asdict
from collections import deque, defaultdict
import logging
import re
import numpy as np
from pathlib import Path
from collections import Counter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class EmotionScore:
    """감정 점수"""
    positive: float  # 긍정 (0-1)
    negative: float  # 부정 (0-1)
    neutral: float   # 중립 (0-1)
    anger: float     # 분노 (0-1)
    joy: float       # 기쁨 (0-1)
    sadness: float   # 슬픔 (0-1)
    fear: float      # 불안/두려움 (0-1)
    surprise: float  # 놀람 (0-1)
    confidence: float # 신뢰도 (0-1)


@dataclass
class ConversationMoment:
    """대화 순간"""
    timestamp: datetime
    speaker_id: str
    message: str
    emotion_score: EmotionScore
    topics: List[str]
    keywords: List[str]
    urgency_level: str  # low, medium, high, critical
    context_shift: bool  # 주제 변화 여부
    response_speed: float  # 응답 속도 (초)
    message_length: int
    formality_level: str  # casual, formal, very_formal


@dataclass
class ConversationFlow:
    """대화 흐름"""
    flow_id: str
    start_time: datetime
    participants: List[str]
    moments: List[ConversationMoment]
    current_topic: str
    dominant_emotion: str
    tension_level: float  # 긴장도 (0-1)
    engagement_level: float  # 참여도 (0-1)
    consensus_level: float  # 합의 수준 (0-1)
    risk_indicators: List[str]


@dataclass
class AlertCondition:
    """알림 조건"""
    condition_id: str
    condition_type: str  # emotion_spike, topic_shift, tension_rise, long_silence
    threshold: float
    description: str
    action_required: bool
    priority: str  # low, medium, high, critical


@dataclass
class RealTimeAlert:
    """실시간 알림"""
    alert_id: str
    timestamp: datetime
    condition: AlertCondition
    current_value: float
    participants_involved: List[str]
    suggested_actions: List[str]
    auto_intervention: bool


class RealTimeConversationAnalyzer:
    """실시간 대화 분석 시스템"""
    
    def __init__(self, buffer_size: int = 100):
        self.buffer_size = buffer_size
        self.conversation_buffer = deque(maxlen=buffer_size)
        self.active_flows: Dict[str, ConversationFlow] = {}
        self.emotion_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=50))
        self.topic_transitions: deque = deque(maxlen=20)
        
        # 감정 분석 모델 (실제로는 transformers 또는 다른 NLP 라이브러리 사용)
        self.emotion_model = self._initialize_emotion_model()
        
        # 토픽 모델링
        self.topic_model = self._initialize_topic_model()
        
        # 알림 조건들
        self.alert_conditions = self._initialize_alert_conditions()
        
        # 키워드 사전
        self.keyword_patterns = self._load_keyword_patterns()
        
        # 실시간 통계
        self.real_time_stats = {
            'messages_processed': 0,
            'alerts_generated': 0,
            'active_participants': set(),
            'current_sentiment': 'neutral',
            'session_start': datetime.now()
        }
        
    def _initialize_emotion_model(self):
        """감정 분석 모델 초기화"""
        # 실제로는 KoBERT, KoELECTRA 등의 한국어 감정 분석 모델 사용
        logger.info("감정 분석 모델 초기화 완료")
        return {
            'positive_words': ['좋다', '훌륭하다', '만족', '기쁘다', '행복', '최고', '완벽', '감사'],
            'negative_words': ['나쁘다', '싫다', '화나다', '짜증', '실망', '우려', '걱정', '문제'],
            'anger_words': ['화나다', '짜증', '분노', '열받다', '억울하다', '불공평'],
            'joy_words': ['기쁘다', '행복', '즐겁다', '좋다', '만족', '기대'],
            'sadness_words': ['슬프다', '우울하다', '실망', '아쉽다', '안타깝다'],
            'fear_words': ['걱정', '불안', '두렵다', '위험', '조심', '신중'],
            'surprise_words': ['놀랍다', '신기하다', '의외', '예상외', '깜짝']
        }
        
    def _initialize_topic_model(self):
        """토픽 모델 초기화"""
        return {
            'construction_keywords': ['시공사', '건설사', 'GS', '대우', '삼성', '현대'],
            'finance_keywords': ['분담금', '환급', '비용', '예산', '자금', '돈', '계산'],
            'facility_keywords': ['커뮤니티', '수영장', '사우나', '헬스', '시설', '편의'],
            'meeting_keywords': ['총회', '투표', '안건', '승인', '결정', '회의', '논의'],
            'legal_keywords': ['법률', '규정', '계약', '조건', '절차', '승인'],
            'complaint_keywords': ['불만', '문제', '개선', '요구', '항의', '이의']
        }
        
    def _initialize_alert_conditions(self) -> List[AlertCondition]:
        """알림 조건 초기화"""
        return [
            AlertCondition(
                condition_id="emotion_spike_negative",
                condition_type="emotion_spike",
                threshold=0.8,
                description="부정 감정 급상승",
                action_required=True,
                priority="high"
            ),
            AlertCondition(
                condition_id="topic_shift_rapid",
                condition_type="topic_shift", 
                threshold=3.0,
                description="빠른 주제 변화 (3회 이상)",
                action_required=False,
                priority="medium"
            ),
            AlertCondition(
                condition_id="tension_rise",
                condition_type="tension_rise",
                threshold=0.7,
                description="대화 긴장도 상승",
                action_required=True,
                priority="high"
            ),
            AlertCondition(
                condition_id="long_silence",
                condition_type="long_silence",
                threshold=300.0,  # 5분
                description="긴 침묵 지속",
                action_required=False,
                priority="low"
            ),
            AlertCondition(
                condition_id="consensus_breakdown",
                condition_type="consensus_breakdown",
                threshold=0.3,
                description="합의 수준 급감",
                action_required=True,
                priority="critical"
            )
        ]
        
    def _load_keyword_patterns(self) -> Dict[str, List[str]]:
        """키워드 패턴 로드"""
        return {
            'urgency_indicators': [
                '긴급', '빨리', '즉시', '당장', '지금', '급하다',
                '중요하다', '심각하다', '문제다', '위험하다'
            ],
            'agreement_indicators': [
                '동의', '찬성', '맞다', '좋다', '그렇다', '옳다',
                '생각도', '마찬가지', '동감', '공감'
            ],
            'disagreement_indicators': [
                '반대', '아니다', '틀렸다', '문제', '싫다', '안된다',
                '이상하다', '말이 안된다', '불가능', '거부'
            ],
            'question_indicators': [
                '?', '궁금', '어떻게', '왜', '언제', '어디서',
                '무엇', '누가', '질문', '문의'
            ]
        }
        
    async def process_message_stream(self, message_stream: AsyncGenerator[Dict[str, Any], None]):
        """메시지 스트림 실시간 처리"""
        
        logger.info("실시간 메시지 스트림 처리 시작")
        
        async for message_data in message_stream:
            try:
                # 메시지 분석
                moment = await self._analyze_message_real_time(message_data)
                
                # 버퍼에 추가
                self.conversation_buffer.append(moment)
                
                # 대화 흐름 업데이트
                await self._update_conversation_flow(moment)
                
                # 알림 조건 체크
                alerts = await self._check_alert_conditions(moment)
                
                # 알림 처리
                for alert in alerts:
                    await self._handle_alert(alert)
                    
                # 통계 업데이트
                self._update_real_time_stats(moment)
                
                # 결과 반환
                yield {
                    'moment': asdict(moment),
                    'alerts': [asdict(alert) for alert in alerts],
                    'flow_update': await self._get_current_flow_summary(),
                    'stats': self.real_time_stats.copy()
                }
                
            except Exception as e:
                logger.error(f"메시지 처리 오류: {e}")
                yield {'error': str(e)}
                
    async def _analyze_message_real_time(self, message_data: Dict[str, Any]) -> ConversationMoment:
        """실시간 메시지 분석"""
        
        message = message_data.get('content', '')
        speaker_id = message_data.get('sender_id', 'unknown')
        timestamp = datetime.fromisoformat(message_data.get('timestamp', datetime.now().isoformat()))
        
        # 감정 분석
        emotion_score = await self._analyze_emotion_real_time(message)
        
        # 주제 추출
        topics = await self._extract_topics_real_time(message)
        
        # 키워드 추출
        keywords = await self._extract_keywords_real_time(message)
        
        # 긴급도 판단
        urgency_level = self._determine_urgency(message, emotion_score)
        
        # 맥락 변화 감지
        context_shift = await self._detect_context_shift(topics)
        
        # 응답 속도 계산
        response_speed = self._calculate_response_speed(speaker_id, timestamp)
        
        # 격식도 분석
        formality_level = self._analyze_formality(message)
        
        return ConversationMoment(
            timestamp=timestamp,
            speaker_id=speaker_id,
            message=message,
            emotion_score=emotion_score,
            topics=topics,
            keywords=keywords,
            urgency_level=urgency_level,
            context_shift=context_shift,
            response_speed=response_speed,
            message_length=len(message),
            formality_level=formality_level
        )
        
    async def _analyze_emotion_real_time(self, message: str) -> EmotionScore:
        """실시간 감정 분석"""
        
        # 간단한 키워드 기반 감정 분석 (실제로는 ML 모델 사용)
        message_lower = message.lower()
        
        # 긍정/부정 기본 점수
        positive_count = sum(1 for word in self.emotion_model['positive_words'] if word in message_lower)
        negative_count = sum(1 for word in self.emotion_model['negative_words'] if word in message_lower)
        
        total_words = len(message.split())
        
        positive_score = min(positive_count / max(total_words * 0.1, 1), 1.0)
        negative_score = min(negative_count / max(total_words * 0.1, 1), 1.0)
        neutral_score = max(1.0 - positive_score - negative_score, 0.0)
        
        # 세부 감정 분석
        anger_score = min(sum(1 for word in self.emotion_model['anger_words'] if word in message_lower) / max(total_words * 0.1, 1), 1.0)
        joy_score = min(sum(1 for word in self.emotion_model['joy_words'] if word in message_lower) / max(total_words * 0.1, 1), 1.0)
        sadness_score = min(sum(1 for word in self.emotion_model['sadness_words'] if word in message_lower) / max(total_words * 0.1, 1), 1.0)
        fear_score = min(sum(1 for word in self.emotion_model['fear_words'] if word in message_lower) / max(total_words * 0.1, 1), 1.0)
        surprise_score = min(sum(1 for word in self.emotion_model['surprise_words'] if word in message_lower) / max(total_words * 0.1, 1), 1.0)
        
        # 신뢰도 계산
        confidence = min((positive_count + negative_count + sum([anger_score, joy_score, sadness_score, fear_score, surprise_score])) / 5, 1.0)
        
        return EmotionScore(
            positive=positive_score,
            negative=negative_score,
            neutral=neutral_score,
            anger=anger_score,
            joy=joy_score,
            sadness=sadness_score,
            fear=fear_score,
            surprise=surprise_score,
            confidence=confidence
        )
        
    async def _extract_topics_real_time(self, message: str) -> List[str]:
        """실시간 주제 추출"""
        
        topics = []
        message_lower = message.lower()
        
        for topic_category, keywords in self.topic_model.items():
            if any(keyword in message_lower for keyword in keywords):
                topic_name = topic_category.replace('_keywords', '')
                topics.append(topic_name)
                
        return topics
        
    async def _extract_keywords_real_time(self, message: str) -> List[str]:
        """실시간 키워드 추출"""
        
        keywords = []
        message_lower = message.lower()
        
        # 모든 키워드 패턴 검사
        for pattern_category, pattern_keywords in self.keyword_patterns.items():
            for keyword in pattern_keywords:
                if keyword in message_lower:
                    keywords.append(keyword)
                    
        # 중요 단어 추출 (간단한 방법)
        important_words = re.findall(r'[가-힣]{2,}', message)
        keywords.extend(important_words[:5])  # 상위 5개만
        
        return list(set(keywords))  # 중복 제거
        
    def _determine_urgency(self, message: str, emotion_score: EmotionScore) -> str:
        """긴급도 판단"""
        
        urgency_count = sum(1 for word in self.keyword_patterns['urgency_indicators'] if word in message.lower())
        
        # 감정 점수와 키워드 기반 긴급도 계산
        urgency_score = (
            emotion_score.negative * 0.3 +
            emotion_score.anger * 0.4 +
            emotion_score.fear * 0.3 +
            urgency_count * 0.2
        )
        
        if urgency_score > 0.8:
            return "critical"
        elif urgency_score > 0.6:
            return "high"
        elif urgency_score > 0.3:
            return "medium"
        else:
            return "low"
            
    async def _detect_context_shift(self, current_topics: List[str]) -> bool:
        """맥락 변화 감지"""
        
        if len(self.topic_transitions) < 2:
            self.topic_transitions.append(current_topics)
            return False
            
        previous_topics = self.topic_transitions[-1]
        
        # 주제 변화 정도 계산
        common_topics = set(current_topics) & set(previous_topics)
        total_topics = set(current_topics) | set(previous_topics)
        
        if not total_topics:
            return False
            
        similarity = len(common_topics) / len(total_topics)
        
        self.topic_transitions.append(current_topics)
        
        return similarity < 0.5  # 50% 미만 유사도면 맥락 변화
        
    def _calculate_response_speed(self, speaker_id: str, timestamp: datetime) -> float:
        """응답 속도 계산"""
        
        # 이전 메시지와의 시간 차이
        if len(self.conversation_buffer) > 0:
            last_moment = self.conversation_buffer[-1]
            if last_moment.speaker_id != speaker_id:
                time_diff = (timestamp - last_moment.timestamp).total_seconds()
                return time_diff
                
        return 0.0
        
    def _analyze_formality(self, message: str) -> str:
        """격식도 분석"""
        
        formal_indicators = ['습니다', '됩니다', '있습니다', '합니다', '입니다']
        casual_indicators = ['해요', '가요', '봐요', '되요', '이에요', 'ㅋㅋ', 'ㅎㅎ']
        very_formal_indicators = ['하겠습니다', '드리겠습니다', '사료됩니다', '고려하겠습니다']
        
        formal_count = sum(1 for indicator in formal_indicators if indicator in message)
        casual_count = sum(1 for indicator in casual_indicators if indicator in message)
        very_formal_count = sum(1 for indicator in very_formal_indicators if indicator in message)
        
        if very_formal_count > 0:
            return "very_formal"
        elif formal_count > casual_count:
            return "formal"
        else:
            return "casual"
            
    async def _update_conversation_flow(self, moment: ConversationMoment):
        """대화 흐름 업데이트"""
        
        # 활성 흐름 찾기 또는 생성
        flow_id = f"flow_{datetime.now().strftime('%Y%m%d_%H')}"  # 시간대별 흐름
        
        if flow_id not in self.active_flows:
            self.active_flows[flow_id] = ConversationFlow(
                flow_id=flow_id,
                start_time=moment.timestamp,
                participants=[],
                moments=[],
                current_topic="",
                dominant_emotion="neutral",
                tension_level=0.0,
                engagement_level=0.0,
                consensus_level=0.5,
                risk_indicators=[]
            )
            
        flow = self.active_flows[flow_id]
        
        # 참여자 추가
        if moment.speaker_id not in flow.participants:
            flow.participants.append(moment.speaker_id)
            
        # 순간 추가
        flow.moments.append(moment)
        
        # 현재 주제 업데이트
        if moment.topics:
            flow.current_topic = moment.topics[0]
            
        # 감정 업데이트
        recent_emotions = [m.emotion_score for m in flow.moments[-10:]]  # 최근 10개
        if recent_emotions:
            avg_negative = sum(e.negative for e in recent_emotions) / len(recent_emotions)
            avg_positive = sum(e.positive for e in recent_emotions) / len(recent_emotions)
            
            if avg_negative > avg_positive:
                flow.dominant_emotion = "negative"
            elif avg_positive > 0.6:
                flow.dominant_emotion = "positive"
            else:
                flow.dominant_emotion = "neutral"
                
        # 긴장도 계산
        tension_indicators = sum(1 for m in flow.moments[-5:] if m.urgency_level in ["high", "critical"])
        flow.tension_level = min(tension_indicators / 5.0, 1.0)
        
        # 참여도 계산
        recent_speakers = set(m.speaker_id for m in flow.moments[-10:])
        flow.engagement_level = len(recent_speakers) / max(len(flow.participants), 1)
        
        # 합의 수준 계산
        agreement_count = 0
        disagreement_count = 0
        
        for moment_obj in flow.moments[-10:]:
            message_lower = moment_obj.message.lower()
            if any(word in message_lower for word in self.keyword_patterns['agreement_indicators']):
                agreement_count += 1
            elif any(word in message_lower for word in self.keyword_patterns['disagreement_indicators']):
                disagreement_count += 1
                
        total_indicators = agreement_count + disagreement_count
        if total_indicators > 0:
            flow.consensus_level = agreement_count / total_indicators
            
        # 위험 지표 업데이트
        flow.risk_indicators.clear()
        if flow.tension_level > 0.7:
            flow.risk_indicators.append("high_tension")
        if flow.consensus_level < 0.3:
            flow.risk_indicators.append("low_consensus")
        if len([m for m in flow.moments[-5:] if m.emotion_score.anger > 0.7]) >= 2:
            flow.risk_indicators.append("anger_escalation")
            
    async def _check_alert_conditions(self, moment: ConversationMoment) -> List[RealTimeAlert]:
        """알림 조건 체크"""
        
        alerts = []
        
        for condition in self.alert_conditions:
            alert = await self._evaluate_condition(condition, moment)
            if alert:
                alerts.append(alert)
                
        return alerts
        
    async def _evaluate_condition(self, condition: AlertCondition, moment: ConversationMoment) -> Optional[RealTimeAlert]:
        """개별 조건 평가"""
        
        current_value = 0.0
        should_alert = False
        
        if condition.condition_type == "emotion_spike":
            current_value = moment.emotion_score.negative
            should_alert = current_value > condition.threshold
            
        elif condition.condition_type == "topic_shift":
            recent_shifts = sum(1 for m in list(self.conversation_buffer)[-5:] if m.context_shift)
            current_value = recent_shifts
            should_alert = current_value >= condition.threshold
            
        elif condition.condition_type == "tension_rise":
            if self.active_flows:
                flow = next(iter(self.active_flows.values()))
                current_value = flow.tension_level
                should_alert = current_value > condition.threshold
                
        elif condition.condition_type == "long_silence":
            if len(self.conversation_buffer) >= 2:
                last_two = list(self.conversation_buffer)[-2:]
                silence_duration = (last_two[1].timestamp - last_two[0].timestamp).total_seconds()
                current_value = silence_duration
                should_alert = current_value > condition.threshold
                
        elif condition.condition_type == "consensus_breakdown":
            if self.active_flows:
                flow = next(iter(self.active_flows.values()))
                current_value = flow.consensus_level
                should_alert = current_value < condition.threshold
                
        if should_alert:
            suggested_actions = self._generate_suggested_actions(condition, current_value)
            
            return RealTimeAlert(
                alert_id=f"alert_{int(time.time())}_{condition.condition_id}",
                timestamp=moment.timestamp,
                condition=condition,
                current_value=current_value,
                participants_involved=[moment.speaker_id],
                suggested_actions=suggested_actions,
                auto_intervention=(condition.priority == "critical")
            )
            
        return None
        
    def _generate_suggested_actions(self, condition: AlertCondition, current_value: float) -> List[str]:
        """제안 액션 생성"""
        
        actions = []
        
        if condition.condition_type == "emotion_spike":
            actions = [
                "대화 중재자 개입 고려",
                "감정 완화 메시지 전송",
                "잠시 휴식 제안",
                "개별 상담 진행"
            ]
        elif condition.condition_type == "topic_shift":
            actions = [
                "현재 주제 정리 필요",
                "의제 우선순위 재정립",
                "구체적 논의 방향 제시"
            ]
        elif condition.condition_type == "tension_rise":
            actions = [
                "즉시 중재 개입",
                "객관적 자료 제시",
                "감정 정리 시간 제공",
                "전문가 의견 요청"
            ]
        elif condition.condition_type == "consensus_breakdown":
            actions = [
                "합의점 찾기 시도",
                "투표 진행 고려",
                "추가 정보 수집",
                "다음 회의로 연기"
            ]
            
        return actions
        
    async def _handle_alert(self, alert: RealTimeAlert):
        """알림 처리"""
        
        logger.warning(f"실시간 알림 발생: {alert.condition.description}")
        
        # 통계 업데이트
        self.real_time_stats['alerts_generated'] += 1
        
        # 자동 개입이 필요한 경우
        if alert.auto_intervention:
            await self._auto_intervention(alert)
            
        # 알림 로그 저장 (실제로는 데이터베이스나 파일에 저장)
        alert_log = {
            'timestamp': alert.timestamp.isoformat(),
            'condition': alert.condition.description,
            'value': alert.current_value,
            'priority': alert.condition.priority,
            'actions': alert.suggested_actions
        }
        
        logger.info(f"알림 로그: {json.dumps(alert_log, ensure_ascii=False)}")
        
    async def _auto_intervention(self, alert: RealTimeAlert):
        """자동 개입"""
        
        intervention_message = ""
        
        if alert.condition.condition_type == "emotion_spike":
            intervention_message = "감정이 격해지고 있습니다. 잠시 정리할 시간을 가져보시겠어요?"
        elif alert.condition.condition_type == "tension_rise":
            intervention_message = "논의가 열띠게 진행되고 있네요. 객관적인 관점에서 다시 정리해보겠습니다."
        elif alert.condition.condition_type == "consensus_breakdown":
            intervention_message = "다양한 의견이 있는 것 같습니다. 공통점을 찾아보시겠어요?"
            
        if intervention_message:
            logger.info(f"자동 개입 메시지: {intervention_message}")
            # 실제로는 대화방에 봇 메시지 전송
            
    def _update_real_time_stats(self, moment: ConversationMoment):
        """실시간 통계 업데이트"""
        
        self.real_time_stats['messages_processed'] += 1
        self.real_time_stats['active_participants'].add(moment.speaker_id)
        
        # 전체 감정 업데이트
        if moment.emotion_score.positive > 0.6:
            self.real_time_stats['current_sentiment'] = 'positive'
        elif moment.emotion_score.negative > 0.6:
            self.real_time_stats['current_sentiment'] = 'negative'
        else:
            self.real_time_stats['current_sentiment'] = 'neutral'
            
    async def _get_current_flow_summary(self) -> Dict[str, Any]:
        """현재 대화 흐름 요약"""
        
        if not self.active_flows:
            return {"status": "no_active_flows"}
            
        flow = next(iter(self.active_flows.values()))
        
        return {
            'flow_id': flow.flow_id,
            'participants': len(flow.participants),
            'current_topic': flow.current_topic,
            'dominant_emotion': flow.dominant_emotion,
            'tension_level': flow.tension_level,
            'engagement_level': flow.engagement_level,
            'consensus_level': flow.consensus_level,
            'risk_indicators': flow.risk_indicators,
            'duration_minutes': (datetime.now() - flow.start_time).total_seconds() / 60
        }
        
    def get_conversation_analytics(self) -> Dict[str, Any]:
        """대화 분석 결과"""
        
        if not self.conversation_buffer:
            return {"status": "no_data"}
            
        # 감정 분석 통계
        emotion_stats = {
            'avg_positive': np.mean([m.emotion_score.positive for m in self.conversation_buffer]),
            'avg_negative': np.mean([m.emotion_score.negative for m in self.conversation_buffer]),
            'avg_tension': np.mean([m.emotion_score.anger + m.emotion_score.fear for m in self.conversation_buffer]),
            'emotion_volatility': np.std([m.emotion_score.negative - m.emotion_score.positive for m in self.conversation_buffer])
        }
        
        # 참여 패턴
        speaker_activity = defaultdict(int)
        for moment in self.conversation_buffer:
            speaker_activity[moment.speaker_id] += 1
            
        # 주제 분석
        all_topics = []
        for moment in self.conversation_buffer:
            all_topics.extend(moment.topics)
            
        topic_frequency = dict(Counter(all_topics))
        
        # 응답 시간 분석
        response_times = [m.response_speed for m in self.conversation_buffer if m.response_speed > 0]
        
        return {
            'session_duration': (datetime.now() - self.real_time_stats['session_start']).total_seconds() / 60,
            'total_messages': len(self.conversation_buffer),
            'unique_participants': len(speaker_activity),
            'emotion_statistics': emotion_stats,
            'participant_activity': dict(speaker_activity),
            'topic_frequency': topic_frequency,
            'avg_response_time': np.mean(response_times) if response_times else 0,
            'alerts_generated': self.real_time_stats['alerts_generated'],
            'current_sentiment': self.real_time_stats['current_sentiment'],
            'risk_level': 'high' if any(flow.risk_indicators for flow in self.active_flows.values()) else 'low'
        }
        
    async def simulate_conversation_stream(self, sample_messages: List[Dict[str, Any]]) -> AsyncGenerator[Dict[str, Any], None]:
        """대화 스트림 시뮬레이션 (테스트용)"""
        
        for message_data in sample_messages:
            # 실제 시간 간격 시뮬레이션
            await asyncio.sleep(0.5)
            
            yield message_data


# 사용 예시 및 테스트
async def test_real_time_analyzer():
    """실시간 분석기 테스트"""
    
    print("🔄 실시간 대화 분석 시스템 테스트")
    print("=" * 50)
    
    analyzer = RealTimeConversationAnalyzer()
    
    # 테스트 메시지들
    test_messages = [
        {
            'content': '안녕하세요! 오늘 총회 관련해서 얘기해보겠습니다.',
            'sender_id': '김조합원',
            'timestamp': datetime.now().isoformat()
        },
        {
            'content': '시공사 선정이 정말 중요한 문제라고 생각합니다.',
            'sender_id': '이조합원',
            'timestamp': (datetime.now() + timedelta(seconds=30)).isoformat()
        },
        {
            'content': '분담금이 너무 많이 나올 것 같아서 걱정입니다.',
            'sender_id': '박조합원',
            'timestamp': (datetime.now() + timedelta(seconds=60)).isoformat()
        },
        {
            'content': '그건 말이 안됩니다! 완전히 잘못된 계산이에요!',
            'sender_id': '최조합원',
            'timestamp': (datetime.now() + timedelta(seconds=90)).isoformat()
        },
        {
            'content': '화내지 마시고 차근차근 설명해주시면 좋겠습니다.',
            'sender_id': '정조합원',
            'timestamp': (datetime.now() + timedelta(seconds=120)).isoformat()
        }
    ]
    
    print("📊 실시간 분석 결과:")
    
    # 스트림 처리 시뮬레이션
    message_stream = analyzer.simulate_conversation_stream(test_messages)
    
    async for result in analyzer.process_message_stream(message_stream):
        if 'error' in result:
            print(f"❌ 오류: {result['error']}")
            continue
            
        moment = result['moment']
        alerts = result['alerts']
        flow_update = result['flow_update']
        
        print(f"\n💬 {moment['speaker_id']}: {moment['message'][:50]}...")
        print(f"   😊 감정: 긍정 {moment['emotion_score']['positive']:.2f}, "
              f"부정 {moment['emotion_score']['negative']:.2f}, "
              f"분노 {moment['emotion_score']['anger']:.2f}")
        print(f"   🏷️ 주제: {moment['topics']}")
        print(f"   ⚡ 긴급도: {moment['urgency_level']}")
        print(f"   ⏱️ 응답시간: {moment['response_speed']:.1f}초")
        
        if alerts:
            print(f"   🚨 알림 {len(alerts)}개 발생:")
            for alert in alerts:
                print(f"     - {alert['condition']['description']} (우선순위: {alert['condition']['priority']})")
                
        if flow_update.get('risk_indicators'):
            print(f"   ⚠️ 위험지표: {flow_update['risk_indicators']}")
            
    # 최종 분석 결과
    print(f"\n📈 **최종 대화 분석 결과:**")
    analytics = analyzer.get_conversation_analytics()
    
    print(f"   세션 시간: {analytics['session_duration']:.1f}분")
    print(f"   총 메시지: {analytics['total_messages']}개")
    print(f"   참여자: {analytics['unique_participants']}명")
    print(f"   평균 감정 (긍정): {analytics['emotion_statistics']['avg_positive']:.2f}")
    print(f"   평균 감정 (부정): {analytics['emotion_statistics']['avg_negative']:.2f}")
    print(f"   감정 변동성: {analytics['emotion_statistics']['emotion_volatility']:.2f}")
    print(f"   평균 응답시간: {analytics['avg_response_time']:.1f}초")
    print(f"   발생 알림: {analytics['alerts_generated']}개")
    print(f"   현재 감정: {analytics['current_sentiment']}")
    print(f"   위험 수준: {analytics['risk_level']}")
    
    if analytics['topic_frequency']:
        print(f"   주요 주제: {list(analytics['topic_frequency'].keys())[:3]}")
        
    print(f"\n🏆 실시간 대화 분석 시스템 테스트 완료!")


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_real_time_analyzer()) 