#!/usr/bin/env python3
"""
실시간 대화 모니터링 시스템
- 실시간 대화 상태 모니터링
- 예측 분석 기능
- 이상 패턴 감지
- 성능 최적화
"""

import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from collections import defaultdict, deque
import logging
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)


@dataclass
class ConversationEvent:
    """대화 이벤트 데이터 클래스"""
    event_id: str
    conversation_id: str
    user_id: str
    event_type: str  # 'message', 'emotion_change', 'topic_shift', 'engagement_drop'
    timestamp: str
    data: Dict[str, Any]
    severity: str = 'normal'  # 'low', 'normal', 'high', 'critical'


@dataclass
class PredictionResult:
    """예측 결과 데이터 클래스"""
    prediction_id: str
    conversation_id: str
    prediction_type: str  # 'engagement', 'emotion', 'topic', 'quality'
    confidence: float
    predicted_value: Any
    timestamp: str
    reasoning: str


class RealtimeConversationMonitor:
    def __init__(self):
        self.active_conversations: Dict[str, Dict[str, Any]] = {}
        self.conversation_events: Dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
        self.predictions: Dict[str, List[PredictionResult]] = defaultdict(list)
        self.monitoring_callbacks: List[Callable] = []
        self.anomaly_thresholds = {
            'response_time': 30.0,  # 30초 이상 응답 지연
            'emotion_volatility': 0.7,  # 감정 변동성 임계값
            'engagement_drop': 0.3,  # 참여도 하락 임계값
            'message_frequency': 0.1  # 메시지 빈도 하락 임계값
        }
        
    def start_monitoring_conversation(self, conversation_id: str, user_id: str):
        """대화 모니터링 시작"""
        try:
            self.active_conversations[conversation_id] = {
                'user_id': user_id,
                'start_time': datetime.now().isoformat(),
                'message_count': 0,
                'last_message_time': None,
                'current_emotion': 'neutral',
                'emotion_history': deque(maxlen=10),
                'response_times': deque(maxlen=10),
                'engagement_score': 1.0,
                'topic_history': deque(maxlen=5),
                'status': 'active'
            }
            
            logger.info(f"대화 모니터링 시작: {conversation_id}")
            
        except Exception as e:
            logger.error(f"대화 모니터링 시작 실패: {e}")
    
    def stop_monitoring_conversation(self, conversation_id: str):
        """대화 모니터링 중지"""
        try:
            if conversation_id in self.active_conversations:
                self.active_conversations[conversation_id]['status'] = 'ended'
                self.active_conversations[conversation_id]['end_time'] = datetime.now().isoformat()
                
                # 최종 분석 수행
                final_analysis = self._analyze_conversation_end(conversation_id)
                self._trigger_event(conversation_id, 'conversation_end', final_analysis)
                
                logger.info(f"대화 모니터링 종료: {conversation_id}")
                
        except Exception as e:
            logger.error(f"대화 모니터링 종료 실패: {e}")
    
    def record_message(self, conversation_id: str, message_data: Dict[str, Any]):
        """메시지 기록 및 분석"""
        try:
            if conversation_id not in self.active_conversations:
                return
            
            conv_data = self.active_conversations[conversation_id]
            current_time = datetime.now()
            
            # 기본 메시지 정보 업데이트
            conv_data['message_count'] += 1
            conv_data['last_message_time'] = current_time.isoformat()
            
            # 응답 시간 계산
            if conv_data['last_message_time'] and len(conv_data['response_times']) > 0:
                last_time = datetime.fromisoformat(conv_data['last_message_time'])
                response_time = (current_time - last_time).total_seconds()
                conv_data['response_times'].append(response_time)
                
                # 응답 시간 이상 감지
                if response_time > self.anomaly_thresholds['response_time']:
                    self._trigger_event(conversation_id, 'slow_response', {
                        'response_time': response_time,
                        'threshold': self.anomaly_thresholds['response_time']
                    }, 'high')
            
            # 감정 분석
            emotion = message_data.get('emotion', 'neutral')
            conv_data['emotion_history'].append(emotion)
            conv_data['current_emotion'] = emotion
            
            # 감정 변화 감지
            if len(conv_data['emotion_history']) >= 2:
                emotion_volatility = self._calculate_emotion_volatility(conv_data['emotion_history'])
                if emotion_volatility > self.anomaly_thresholds['emotion_volatility']:
                    self._trigger_event(conversation_id, 'emotion_volatility', {
                        'volatility': emotion_volatility,
                        'threshold': self.anomaly_thresholds['emotion_volatility']
                    }, 'medium')
            
            # 참여도 계산
            engagement_score = self._calculate_engagement_score(conv_data)
            conv_data['engagement_score'] = engagement_score
            
            # 참여도 하락 감지
            if engagement_score < self.anomaly_thresholds['engagement_drop']:
                self._trigger_event(conversation_id, 'engagement_drop', {
                    'engagement_score': engagement_score,
                    'threshold': self.anomaly_thresholds['engagement_drop']
                }, 'high')
            
            # 주제 분석
            topic = message_data.get('topic', 'general')
            conv_data['topic_history'].append(topic)
            
            # 주제 변화 감지
            if len(conv_data['topic_history']) >= 2:
                topic_changes = self._detect_topic_changes(conv_data['topic_history'])
                if topic_changes > 2:  # 2회 이상 주제 변화
                    self._trigger_event(conversation_id, 'topic_shift', {
                        'topic_changes': topic_changes,
                        'recent_topics': list(conv_data['topic_history'])
                    }, 'normal')
            
            # 예측 분석 수행
            predictions = self._generate_predictions(conversation_id)
            for prediction in predictions:
                self.predictions[conversation_id].append(prediction)
            
            logger.debug(f"메시지 기록 완료: {conversation_id} (총 {conv_data['message_count']}개)")
            
        except Exception as e:
            logger.error(f"메시지 기록 실패: {e}")
    
    def _trigger_event(self, conversation_id: str, event_type: str, data: Dict[str, Any], severity: str = 'normal'):
        """이벤트 트리거"""
        try:
            event = ConversationEvent(
                event_id=f"event_{int(time.time() * 1000)}",
                conversation_id=conversation_id,
                user_id=self.active_conversations[conversation_id]['user_id'],
                event_type=event_type,
                timestamp=datetime.now().isoformat(),
                data=data,
                severity=severity
            )
            
            self.conversation_events[conversation_id].append(event)
            
            # 콜백 함수들 실행
            for callback in self.monitoring_callbacks:
                try:
                    callback(event)
                except Exception as e:
                    logger.error(f"이벤트 콜백 실행 실패: {e}")
            
            logger.info(f"이벤트 트리거: {event_type} (심각도: {severity})")
            
        except Exception as e:
            logger.error(f"이벤트 트리거 실패: {e}")
    
    def _calculate_emotion_volatility(self, emotion_history: deque) -> float:
        """감정 변동성 계산"""
        if len(emotion_history) < 2:
            return 0.0
        
        emotion_changes = 0
        for i in range(1, len(emotion_history)):
            if emotion_history[i] != emotion_history[i-1]:
                emotion_changes += 1
        
        return emotion_changes / (len(emotion_history) - 1)
    
    def _calculate_engagement_score(self, conv_data: Dict[str, Any]) -> float:
        """참여도 점수 계산"""
        try:
            # 메시지 빈도 기반 참여도
            if conv_data['last_message_time']:
                last_time = datetime.fromisoformat(conv_data['last_message_time'])
                time_diff = (datetime.now() - last_time).total_seconds()
                
                # 시간이 지날수록 참여도 감소
                time_factor = max(0, 1 - (time_diff / 300))  # 5분 기준
                
                # 메시지 수 기반 참여도
                message_factor = min(1.0, conv_data['message_count'] / 20)
                
                # 응답 시간 기반 참여도
                response_factor = 1.0
                if len(conv_data['response_times']) > 0:
                    avg_response = sum(conv_data['response_times']) / len(conv_data['response_times'])
                    response_factor = max(0, 1 - (avg_response / 60))  # 1분 기준
                
                # 종합 참여도 점수
                engagement_score = (time_factor * 0.4 + message_factor * 0.4 + response_factor * 0.2)
                return max(0, min(1, engagement_score))
            
            return 1.0
            
        except Exception as e:
            logger.error(f"참여도 계산 실패: {e}")
            return 0.5
    
    def _detect_topic_changes(self, topic_history: deque) -> int:
        """주제 변화 감지"""
        if len(topic_history) < 2:
            return 0
        
        changes = 0
        for i in range(1, len(topic_history)):
            if topic_history[i] != topic_history[i-1]:
                changes += 1
        
        return changes
    
    def _generate_predictions(self, conversation_id: str) -> List[PredictionResult]:
        """예측 분석 생성"""
        try:
            conv_data = self.active_conversations[conversation_id]
            predictions = []
            current_time = datetime.now().isoformat()
            
            # 참여도 예측
            engagement_prediction = self._predict_engagement(conv_data)
            if engagement_prediction:
                predictions.append(PredictionResult(
                    prediction_id=f"pred_{int(time.time() * 1000)}_1",
                    conversation_id=conversation_id,
                    prediction_type='engagement',
                    confidence=engagement_prediction['confidence'],
                    predicted_value=engagement_prediction['value'],
                    timestamp=current_time,
                    reasoning=engagement_prediction['reasoning']
                ))
            
            # 감정 예측
            emotion_prediction = self._predict_emotion(conv_data)
            if emotion_prediction:
                predictions.append(PredictionResult(
                    prediction_id=f"pred_{int(time.time() * 1000)}_2",
                    conversation_id=conversation_id,
                    prediction_type='emotion',
                    confidence=emotion_prediction['confidence'],
                    predicted_value=emotion_prediction['value'],
                    timestamp=current_time,
                    reasoning=emotion_prediction['reasoning']
                ))
            
            # 대화 품질 예측
            quality_prediction = self._predict_quality(conv_data)
            if quality_prediction:
                predictions.append(PredictionResult(
                    prediction_id=f"pred_{int(time.time() * 1000)}_3",
                    conversation_id=conversation_id,
                    prediction_type='quality',
                    confidence=quality_prediction['confidence'],
                    predicted_value=quality_prediction['value'],
                    timestamp=current_time,
                    reasoning=quality_prediction['reasoning']
                ))
            
            return predictions
            
        except Exception as e:
            logger.error(f"예측 생성 실패: {e}")
            return []
    
    def _predict_engagement(self, conv_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """참여도 예측"""
        try:
            current_engagement = conv_data['engagement_score']
            
            # 단순한 선형 예측 (실제로는 더 복잡한 알고리즘 사용)
            if len(conv_data['response_times']) > 0:
                recent_response_avg = sum(list(conv_data['response_times'])[-3:]) / min(3, len(conv_data['response_times']))
                
                if recent_response_avg > 30:  # 30초 이상 응답 지연
                    predicted_engagement = max(0, current_engagement - 0.2)
                    confidence = 0.7
                    reasoning = "최근 응답 시간이 길어 참여도 하락 예상"
                else:
                    predicted_engagement = min(1, current_engagement + 0.1)
                    confidence = 0.6
                    reasoning = "안정적인 응답 시간으로 참여도 유지 예상"
                
                return {
                    'value': predicted_engagement,
                    'confidence': confidence,
                    'reasoning': reasoning
                }
            
            return None
            
        except Exception as e:
            logger.error(f"참여도 예측 실패: {e}")
            return None
    
    def _predict_emotion(self, conv_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """감정 예측"""
        try:
            if len(conv_data['emotion_history']) < 3:
                return None
            
            recent_emotions = list(conv_data['emotion_history'])[-3:]
            emotion_counts = defaultdict(int)
            
            for emotion in recent_emotions:
                emotion_counts[emotion] += 1
            
            # 가장 빈번한 감정을 다음 예측 감정으로 사용
            most_common_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0]
            confidence = emotion_counts[most_common_emotion] / len(recent_emotions)
            
            return {
                'value': most_common_emotion,
                'confidence': confidence,
                'reasoning': f"최근 감정 패턴 기반 예측: {most_common_emotion}"
            }
            
        except Exception as e:
            logger.error(f"감정 예측 실패: {e}")
            return None
    
    def _predict_quality(self, conv_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """대화 품질 예측"""
        try:
            # 품질 점수 계산 (0-100)
            message_count = conv_data['message_count']
            engagement_score = conv_data['engagement_score']
            
            # 기본 품질 점수
            base_quality = min(100, message_count * 5)  # 메시지 수 기반
            
            # 참여도 보정
            engagement_correction = engagement_score * 20
            
            # 응답 시간 보정
            response_correction = 0
            if len(conv_data['response_times']) > 0:
                avg_response = sum(conv_data['response_times']) / len(conv_data['response_times'])
                response_correction = max(-20, min(20, (30 - avg_response) * 2))
            
            predicted_quality = max(0, min(100, base_quality + engagement_correction + response_correction))
            
            # 신뢰도 계산
            confidence = min(0.9, 0.3 + (message_count / 50))
            
            return {
                'value': predicted_quality,
                'confidence': confidence,
                'reasoning': f"메시지 수({message_count}), 참여도({engagement_score:.2f}), 응답시간 기반 품질 예측"
            }
            
        except Exception as e:
            logger.error(f"품질 예측 실패: {e}")
            return None
    
    def _analyze_conversation_end(self, conversation_id: str) -> Dict[str, Any]:
        """대화 종료 분석"""
        try:
            conv_data = self.active_conversations[conversation_id]
            
            # 대화 지속 시간
            start_time = datetime.fromisoformat(conv_data['start_time'])
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            # 평균 응답 시간
            avg_response_time = 0
            if len(conv_data['response_times']) > 0:
                avg_response_time = sum(conv_data['response_times']) / len(conv_data['response_times'])
            
            # 감정 분포
            emotion_distribution = defaultdict(int)
            for emotion in conv_data['emotion_history']:
                emotion_distribution[emotion] += 1
            
            # 주제 분포
            topic_distribution = defaultdict(int)
            for topic in conv_data['topic_history']:
                topic_distribution[topic] += 1
            
            return {
                'duration_seconds': duration,
                'total_messages': conv_data['message_count'],
                'avg_response_time': avg_response_time,
                'final_engagement_score': conv_data['engagement_score'],
                'emotion_distribution': dict(emotion_distribution),
                'topic_distribution': dict(topic_distribution),
                'events_count': len(self.conversation_events[conversation_id]),
                'predictions_count': len(self.predictions[conversation_id])
            }
            
        except Exception as e:
            logger.error(f"대화 종료 분석 실패: {e}")
            return {}
    
    def get_conversation_status(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """대화 상태 조회"""
        if conversation_id in self.active_conversations:
            return self.active_conversations[conversation_id]
        return None
    
    def get_recent_events(self, conversation_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """최근 이벤트 조회"""
        events = list(self.conversation_events[conversation_id])
        return [asdict(event) for event in events[-limit:]]
    
    def get_recent_predictions(self, conversation_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """최근 예측 조회"""
        predictions = self.predictions[conversation_id]
        return [asdict(prediction) for prediction in predictions[-limit:]]
    
    def add_monitoring_callback(self, callback: Callable):
        """모니터링 콜백 추가"""
        self.monitoring_callbacks.append(callback)
    
    def get_active_conversations_count(self) -> int:
        """활성 대화 수 조회"""
        return len([conv for conv in self.active_conversations.values() if conv['status'] == 'active'])
    
    def get_system_stats(self) -> Dict[str, Any]:
        """시스템 통계 조회"""
        active_count = self.get_active_conversations_count()
        total_events = sum(len(events) for events in self.conversation_events.values())
        total_predictions = sum(len(predictions) for predictions in self.predictions.values())
        
        return {
            'active_conversations': active_count,
            'total_events': total_events,
            'total_predictions': total_predictions,
            'monitoring_callbacks': len(self.monitoring_callbacks)
        }


# 싱글톤 인스턴스
realtime_monitor = RealtimeConversationMonitor() 