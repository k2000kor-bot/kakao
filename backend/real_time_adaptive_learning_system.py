#!/usr/bin/env python3
"""
실시간 적응형 학습 시스템 v3.0
- 사용자 피드백 기반 즉시 학습
- 동적 모델 파라미터 조정
- 연속적 성능 개선
- 개인화 패턴 실시간 학습
"""

import asyncio
import json
import logging
import numpy as np
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, asdict, field
from collections import deque, defaultdict
import sqlite3
import threading
from concurrent.futures import ThreadPoolExecutor
import hashlib
import pickle
import os
import time
from sklearn.linear_model import SGDClassifier, SGDRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
import redis
import torch
import torch.nn as nn
import torch.optim as optim

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class FeedbackEvent:
    """사용자 피드백 이벤트"""
    event_id: str
    user_id: str
    message_id: str
    feedback_type: str  # 'rating', 'usage', 'correction', 'preference'
    feedback_value: Any
    context: Dict[str, Any]
    timestamp: datetime
    processed: bool = False
    impact_score: float = 1.0

@dataclass
class LearningPattern:
    """학습된 패턴"""
    pattern_id: str
    user_segments: List[str]
    context_features: Dict[str, Any]
    success_metrics: Dict[str, float]
    confidence_score: float
    usage_count: int
    last_updated: datetime
    pattern_type: str  # 'style', 'content', 'timing', 'emotional'

@dataclass
class AdaptationStrategy:
    """적응 전략"""
    strategy_id: str
    target_metric: str
    adaptation_rules: List[Dict[str, Any]]
    effectiveness_score: float
    usage_frequency: int
    last_applied: datetime

class NeuralAdaptationNetwork(nn.Module):
    """신경망 기반 적응 네트워크"""
    
    def __init__(self, input_dim: int, hidden_dims: List[int], output_dim: int):
        super().__init__()
        
        layers = []
        prev_dim = input_dim
        
        for hidden_dim in hidden_dims:
            layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.ReLU(),
                nn.Dropout(0.2),
                nn.BatchNorm1d(hidden_dim)
            ])
            prev_dim = hidden_dim
        
        layers.append(nn.Linear(prev_dim, output_dim))
        
        self.network = nn.Sequential(*layers)
        self.input_dim = input_dim
        self.output_dim = output_dim
    
    def forward(self, x):
        return self.network(x)

class RealTimeAdaptiveLearningSystem:
    """실시간 적응형 학습 시스템"""
    
    def __init__(self, redis_host: str = 'localhost', redis_port: int = 6379):
        # 데이터 저장소
        self.db_path = 'adaptive_learning.db'
        self.redis_client = None
        try:
            self.redis_client = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
            self.redis_client.ping()
        except:
            logger.warning("Redis 연결 실패, 로컬 캐시 사용")
        
        # 피드백 이벤트 큐
        self.feedback_queue = deque(maxlen=10000)
        self.processing_queue = asyncio.Queue()
        
        # 학습 상태
        self.learning_patterns = {}
        self.adaptation_strategies = {}
        self.user_profiles = defaultdict(dict)
        
        # 실시간 메트릭
        self.real_time_metrics = {
            'total_feedback_events': 0,
            'processed_events': 0,
            'adaptation_count': 0,
            'learning_accuracy': 0.0,
            'average_response_improvement': 0.0,
            'active_users': set(),
            'pattern_discovery_rate': 0.0
        }
        
        # 머신러닝 모델들
        self.quality_predictor = SGDRegressor(learning_rate='adaptive', eta0=0.01)
        self.style_classifier = SGDClassifier(learning_rate='adaptive', eta0=0.01)
        self.preference_predictor = SGDRegressor(learning_rate='adaptive', eta0=0.01)
        
        # 특성 추출기
        self.tfidf_vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
        self.feature_scaler = StandardScaler()
        
        # 신경망 모델
        self.neural_adapter = NeuralAdaptationNetwork(
            input_dim=100,  # 특성 차원
            hidden_dims=[256, 128, 64],
            output_dim=50  # 적응 파라미터 차원
        )
        self.neural_optimizer = optim.Adam(self.neural_adapter.parameters(), lr=0.001)
        
        # 백그라운드 처리
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.processing_active = True
        
        # 초기화
        self._initialize_database()
        self._load_existing_patterns()
        self._start_background_processing()
    
    def _initialize_database(self):
        """데이터베이스 초기화"""
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 피드백 이벤트 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feedback_events (
                event_id TEXT PRIMARY KEY,
                user_id TEXT,
                message_id TEXT,
                feedback_type TEXT,
                feedback_value TEXT,
                context TEXT,
                timestamp TEXT,
                processed BOOLEAN,
                impact_score REAL
            )
        ''')
        
        # 학습 패턴 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS learning_patterns (
                pattern_id TEXT PRIMARY KEY,
                user_segments TEXT,
                context_features TEXT,
                success_metrics TEXT,
                confidence_score REAL,
                usage_count INTEGER,
                last_updated TEXT,
                pattern_type TEXT
            )
        ''')
        
        # 적응 전략 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS adaptation_strategies (
                strategy_id TEXT PRIMARY KEY,
                target_metric TEXT,
                adaptation_rules TEXT,
                effectiveness_score REAL,
                usage_frequency INTEGER,
                last_applied TEXT
            )
        ''')
        
        # 사용자 프로필 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id TEXT PRIMARY KEY,
                profile_data TEXT,
                last_updated TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        
        logger.info("✅ 적응형 학습 데이터베이스 초기화 완료")
    
    def _load_existing_patterns(self):
        """기존 학습 패턴 로드"""
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 학습 패턴 로드
            cursor.execute('SELECT * FROM learning_patterns')
            for row in cursor.fetchall():
                pattern = LearningPattern(
                    pattern_id=row[0],
                    user_segments=json.loads(row[1]),
                    context_features=json.loads(row[2]),
                    success_metrics=json.loads(row[3]),
                    confidence_score=row[4],
                    usage_count=row[5],
                    last_updated=datetime.fromisoformat(row[6]),
                    pattern_type=row[7]
                )
                self.learning_patterns[pattern.pattern_id] = pattern
            
            # 적응 전략 로드
            cursor.execute('SELECT * FROM adaptation_strategies')
            for row in cursor.fetchall():
                strategy = AdaptationStrategy(
                    strategy_id=row[0],
                    target_metric=row[1],
                    adaptation_rules=json.loads(row[2]),
                    effectiveness_score=row[3],
                    usage_frequency=row[4],
                    last_applied=datetime.fromisoformat(row[5])
                )
                self.adaptation_strategies[strategy.strategy_id] = strategy
            
            conn.close()
            
            logger.info(f"✅ 로드된 패턴: {len(self.learning_patterns)}개, 전략: {len(self.adaptation_strategies)}개")
            
        except Exception as e:
            logger.error(f"패턴 로드 실패: {e}")
    
    def _start_background_processing(self):
        """백그라운드 처리 시작"""
        
        # 비동기 처리 태스크
        asyncio.create_task(self._process_feedback_events())
        asyncio.create_task(self._continuous_learning_loop())
        asyncio.create_task(self._pattern_discovery_loop())
        asyncio.create_task(self._adaptation_optimization_loop())
        
        logger.info("🚀 백그라운드 처리 시작")
    
    async def record_feedback(self, feedback_data: Dict[str, Any]) -> str:
        """사용자 피드백 기록"""
        
        event_id = hashlib.md5(
            f"{feedback_data.get('user_id', 'anonymous')}_{feedback_data.get('message_id', '')}_{datetime.now().isoformat()}".encode()
        ).hexdigest()
        
        feedback_event = FeedbackEvent(
            event_id=event_id,
            user_id=feedback_data.get('user_id', 'anonymous'),
            message_id=feedback_data.get('message_id', ''),
            feedback_type=feedback_data.get('feedback_type', 'rating'),
            feedback_value=feedback_data.get('feedback_value'),
            context=feedback_data.get('context', {}),
            timestamp=datetime.now(timezone.utc),
            impact_score=feedback_data.get('impact_score', 1.0)
        )
        
        # 큐에 추가
        self.feedback_queue.append(feedback_event)
        await self.processing_queue.put(feedback_event)
        
        # 실시간 메트릭 업데이트
        self.real_time_metrics['total_feedback_events'] += 1
        self.real_time_metrics['active_users'].add(feedback_event.user_id)
        
        # 데이터베이스 저장
        self._save_feedback_event(feedback_event)
        
        logger.info(f"📝 피드백 기록: {feedback_event.feedback_type} from {feedback_event.user_id}")
        
        return event_id
    
    async def _process_feedback_events(self):
        """피드백 이벤트 처리 루프"""
        
        while self.processing_active:
            try:
                # 큐에서 이벤트 가져오기
                feedback_event = await self.processing_queue.get()
                
                # 즉시 학습 수행
                await self._immediate_learning(feedback_event)
                
                # 사용자 프로필 업데이트
                await self._update_user_profile(feedback_event)
                
                # 패턴 매칭 및 업데이트
                await self._match_and_update_patterns(feedback_event)
                
                # 적응 전략 트리거
                await self._trigger_adaptation_strategies(feedback_event)
                
                feedback_event.processed = True
                self.real_time_metrics['processed_events'] += 1
                
                # 처리 완료 표시
                self.processing_queue.task_done()
                
            except Exception as e:
                logger.error(f"피드백 처리 오류: {e}")
                await asyncio.sleep(1)
    
    async def _immediate_learning(self, feedback_event: FeedbackEvent):
        """즉시 학습 수행"""
        
        try:
            # 특성 추출
            features = self._extract_features(feedback_event)
            
            if feedback_event.feedback_type == 'rating':
                # 품질 예측 모델 업데이트
                rating = float(feedback_event.feedback_value)
                self.quality_predictor.partial_fit([features], [rating])
                
            elif feedback_event.feedback_type == 'style_preference':
                # 스타일 분류 모델 업데이트
                style_label = feedback_event.feedback_value
                self.style_classifier.partial_fit([features], [style_label], classes=['formal', 'casual', 'friendly', 'professional'])
                
            elif feedback_event.feedback_type == 'preference_score':
                # 선호도 예측 모델 업데이트
                score = float(feedback_event.feedback_value)
                self.preference_predictor.partial_fit([features], [score])
            
            # 신경망 모델 업데이트
            await self._update_neural_adapter(feedback_event, features)
            
            logger.debug(f"✅ 즉시 학습 완료: {feedback_event.event_id}")
            
        except Exception as e:
            logger.error(f"즉시 학습 오류: {e}")
    
    async def _update_neural_adapter(self, feedback_event: FeedbackEvent, features: List[float]):
        """신경망 적응 모델 업데이트"""
        
        try:
            # 특성을 텐서로 변환
            feature_tensor = torch.FloatTensor(features).unsqueeze(0)
            
            if len(features) != self.neural_adapter.input_dim:
                # 특성 차원 조정
                if len(features) < self.neural_adapter.input_dim:
                    # 패딩
                    padding = [0.0] * (self.neural_adapter.input_dim - len(features))
                    feature_tensor = torch.FloatTensor(features + padding).unsqueeze(0)
                else:
                    # 잘라내기
                    feature_tensor = torch.FloatTensor(features[:self.neural_adapter.input_dim]).unsqueeze(0)
            
            # 타겟 생성 (피드백 기반)
            target = self._create_adaptation_target(feedback_event)
            target_tensor = torch.FloatTensor(target).unsqueeze(0)
            
            # 순전파
            self.neural_adapter.train()
            output = self.neural_adapter(feature_tensor)
            
            # 손실 계산
            loss = nn.MSELoss()(output, target_tensor)
            
            # 역전파
            self.neural_optimizer.zero_grad()
            loss.backward()
            self.neural_optimizer.step()
            
            logger.debug(f"🧠 신경망 학습: loss={loss.item():.4f}")
            
        except Exception as e:
            logger.error(f"신경망 업데이트 오류: {e}")
    
    def _create_adaptation_target(self, feedback_event: FeedbackEvent) -> List[float]:
        """피드백 기반 적응 타겟 생성"""
        
        target = [0.0] * self.neural_adapter.output_dim
        
        if feedback_event.feedback_type == 'rating':
            rating = float(feedback_event.feedback_value)
            normalized_rating = (rating - 1) / 4  # 1-5 스케일을 0-1로 정규화
            
            # 품질 관련 파라미터 조정
            for i in range(0, 10):  # 처음 10개는 품질 관련
                target[i] = normalized_rating
                
        elif feedback_event.feedback_type == 'style_preference':
            style = feedback_event.feedback_value
            style_mapping = {'formal': 0.2, 'casual': 0.4, 'friendly': 0.6, 'professional': 0.8}
            style_value = style_mapping.get(style, 0.5)
            
            # 스타일 관련 파라미터 조정
            for i in range(10, 20):  # 10-19번은 스타일 관련
                target[i] = style_value
        
        # 나머지는 현재 상태 유지
        for i in range(20, self.neural_adapter.output_dim):
            target[i] = 0.5  # 중성 값
        
        return target
    
    def _extract_features(self, feedback_event: FeedbackEvent) -> List[float]:
        """피드백 이벤트에서 특성 추출"""
        
        features = []
        
        # 시간적 특성
        hour = feedback_event.timestamp.hour
        day_of_week = feedback_event.timestamp.weekday()
        features.extend([hour / 24.0, day_of_week / 6.0])
        
        # 피드백 타입 원-핫 인코딩
        feedback_types = ['rating', 'usage', 'correction', 'preference', 'style_preference']
        for ftype in feedback_types:
            features.append(1.0 if feedback_event.feedback_type == ftype else 0.0)
        
        # 컨텍스트 특성
        context = feedback_event.context
        features.extend([
            context.get('message_length', 0) / 1000.0,  # 정규화
            context.get('complexity', 0.5),
            context.get('emotional_intensity', 0.5),
            context.get('formality', 0.5)
        ])
        
        # 사용자 특성
        user_profile = self.user_profiles.get(feedback_event.user_id, {})
        features.extend([
            user_profile.get('activity_level', 0.5),
            user_profile.get('satisfaction_average', 0.5),
            user_profile.get('response_frequency', 0.5)
        ])
        
        # 패딩 또는 잘라내기 (100차원으로 맞춤)
        while len(features) < 100:
            features.append(0.0)
        
        return features[:100]
    
    async def _continuous_learning_loop(self):
        """연속적 학습 루프"""
        
        while self.processing_active:
            try:
                # 30초마다 모델 성능 평가 및 개선
                await asyncio.sleep(30)
                
                # 최근 피드백 기반 성능 평가
                recent_feedback = list(self.feedback_queue)[-100:]  # 최근 100개
                
                if len(recent_feedback) >= 10:
                    # 정확도 계산
                    accuracy = self._calculate_learning_accuracy(recent_feedback)
                    self.real_time_metrics['learning_accuracy'] = accuracy
                    
                    # 성능 개선 측정
                    improvement = self._measure_response_improvement(recent_feedback)
                    self.real_time_metrics['average_response_improvement'] = improvement
                    
                    logger.info(f"📊 학습 성능: 정확도 {accuracy:.3f}, 개선도 {improvement:.3f}")
                
            except Exception as e:
                logger.error(f"연속 학습 오류: {e}")
                await asyncio.sleep(5)
    
    async def _pattern_discovery_loop(self):
        """패턴 발견 루프"""
        
        while self.processing_active:
            try:
                # 5분마다 새로운 패턴 발견
                await asyncio.sleep(300)
                
                # 최근 데이터에서 패턴 추출
                new_patterns = await self._discover_new_patterns()
                
                for pattern in new_patterns:
                    self.learning_patterns[pattern.pattern_id] = pattern
                    self._save_learning_pattern(pattern)
                
                if new_patterns:
                    discovery_rate = len(new_patterns) / len(self.feedback_queue) if self.feedback_queue else 0
                    self.real_time_metrics['pattern_discovery_rate'] = discovery_rate
                    
                    logger.info(f"🔍 새로운 패턴 발견: {len(new_patterns)}개")
                
            except Exception as e:
                logger.error(f"패턴 발견 오류: {e}")
                await asyncio.sleep(30)
    
    async def _discover_new_patterns(self) -> List[LearningPattern]:
        """새로운 학습 패턴 발견"""
        
        patterns = []
        
        try:
            # 최근 피드백 분석
            recent_feedback = list(self.feedback_queue)[-500:]  # 최근 500개
            
            if len(recent_feedback) < 50:
                return patterns
            
            # 사용자 세그먼트별 그룹화
            user_groups = defaultdict(list)
            for feedback in recent_feedback:
                user_groups[feedback.user_id].append(feedback)
            
            # 성공적인 패턴 식별
            for user_id, user_feedback in user_groups.items():
                if len(user_feedback) >= 5:  # 충분한 데이터가 있는 사용자만
                    
                    # 높은 평점 피드백 필터링
                    positive_feedback = [
                        f for f in user_feedback 
                        if f.feedback_type == 'rating' and float(f.feedback_value) >= 4.0
                    ]
                    
                    if len(positive_feedback) >= 3:
                        # 패턴 추출
                        pattern = self._extract_success_pattern(user_id, positive_feedback)
                        if pattern:
                            patterns.append(pattern)
            
        except Exception as e:
            logger.error(f"패턴 발견 중 오류: {e}")
        
        return patterns
    
    def _extract_success_pattern(self, user_id: str, positive_feedback: List[FeedbackEvent]) -> Optional[LearningPattern]:
        """성공 패턴 추출"""
        
        try:
            # 공통 특성 찾기
            common_features = {}
            context_keys = set()
            
            for feedback in positive_feedback:
                for key, value in feedback.context.items():
                    context_keys.add(key)
            
            for key in context_keys:
                values = [f.context.get(key) for f in positive_feedback if key in f.context]
                if values and len(set(values)) == 1:  # 모든 값이 동일한 경우
                    common_features[key] = values[0]
            
            if len(common_features) >= 2:  # 최소 2개 이상의 공통 특성
                
                pattern_id = hashlib.md5(
                    f"{user_id}_{json.dumps(common_features, sort_keys=True)}_{datetime.now().isoformat()}".encode()
                ).hexdigest()
                
                # 성공 메트릭 계산
                success_metrics = {
                    'average_rating': sum(float(f.feedback_value) for f in positive_feedback) / len(positive_feedback),
                    'consistency_score': len(positive_feedback) / len(context_keys),
                    'recency_score': (datetime.now(timezone.utc) - min(f.timestamp for f in positive_feedback)).total_seconds() / 86400  # 일 단위
                }
                
                pattern = LearningPattern(
                    pattern_id=pattern_id,
                    user_segments=[user_id],
                    context_features=common_features,
                    success_metrics=success_metrics,
                    confidence_score=min(success_metrics['average_rating'] / 5.0, 1.0),
                    usage_count=0,
                    last_updated=datetime.now(timezone.utc),
                    pattern_type='success_context'
                )
                
                return pattern
                
        except Exception as e:
            logger.error(f"패턴 추출 오류: {e}")
        
        return None
    
    async def get_adaptive_recommendations(self, user_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """적응형 추천 생성"""
        
        try:
            recommendations = {
                'style_suggestions': [],
                'content_suggestions': [],
                'timing_suggestions': [],
                'quality_predictions': {},
                'personalization_adjustments': {}
            }
            
            # 사용자 프로필 기반 추천
            user_profile = self.user_profiles.get(user_id, {})
            
            # 패턴 매칭
            matching_patterns = self._find_matching_patterns(user_id, context)
            
            for pattern in matching_patterns:
                if pattern.pattern_type == 'style':
                    recommendations['style_suggestions'].append({
                        'style': pattern.context_features.get('preferred_style'),
                        'confidence': pattern.confidence_score,
                        'success_rate': pattern.success_metrics.get('average_rating', 0)
                    })
                
                elif pattern.pattern_type == 'content':
                    recommendations['content_suggestions'].append({
                        'content_type': pattern.context_features.get('content_preference'),
                        'confidence': pattern.confidence_score,
                        'effectiveness': pattern.success_metrics.get('consistency_score', 0)
                    })
            
            # ML 모델 기반 예측
            features = self._extract_context_features(user_id, context)
            
            if len(features) == 100:  # 올바른 차원
                # 품질 예측
                try:
                    quality_pred = self.quality_predictor.predict([features])[0]
                    recommendations['quality_predictions']['expected_rating'] = max(1.0, min(5.0, quality_pred))
                except:
                    recommendations['quality_predictions']['expected_rating'] = 3.0
                
                # 스타일 예측
                try:
                    style_pred = self.style_classifier.predict([features])[0]
                    recommendations['style_suggestions'].append({
                        'style': style_pred,
                        'confidence': 0.8,
                        'source': 'ml_prediction'
                    })
                except:
                    pass
                
                # 신경망 기반 개인화 조정
                neural_adjustments = await self._get_neural_adjustments(features)
                recommendations['personalization_adjustments'] = neural_adjustments
            
            return recommendations
            
        except Exception as e:
            logger.error(f"적응형 추천 생성 오류: {e}")
            return {}
    
    def _find_matching_patterns(self, user_id: str, context: Dict[str, Any]) -> List[LearningPattern]:
        """사용자와 컨텍스트에 맞는 패턴 찾기"""
        
        matching_patterns = []
        
        for pattern in self.learning_patterns.values():
            # 사용자 매칭
            if user_id in pattern.user_segments or 'all' in pattern.user_segments:
                
                # 컨텍스트 매칭
                context_match_score = 0
                total_features = len(pattern.context_features)
                
                if total_features > 0:
                    for key, expected_value in pattern.context_features.items():
                        if key in context and context[key] == expected_value:
                            context_match_score += 1
                    
                    match_ratio = context_match_score / total_features
                    
                    if match_ratio >= 0.6:  # 60% 이상 매칭
                        matching_patterns.append(pattern)
        
        # 신뢰도 순으로 정렬
        matching_patterns.sort(key=lambda p: p.confidence_score, reverse=True)
        
        return matching_patterns[:5]  # 상위 5개 반환
    
    def _extract_context_features(self, user_id: str, context: Dict[str, Any]) -> List[float]:
        """컨텍스트에서 특성 추출"""
        
        features = []
        
        # 시간적 특성
        now = datetime.now()
        features.extend([now.hour / 24.0, now.weekday() / 6.0])
        
        # 컨텍스트 특성
        features.extend([
            context.get('message_length', 0) / 1000.0,
            context.get('complexity', 0.5),
            context.get('emotional_intensity', 0.5),
            context.get('formality', 0.5),
            context.get('urgency', 0.5)
        ])
        
        # 사용자 프로필 특성
        user_profile = self.user_profiles.get(user_id, {})
        features.extend([
            user_profile.get('activity_level', 0.5),
            user_profile.get('satisfaction_average', 0.5),
            user_profile.get('response_frequency', 0.5),
            user_profile.get('style_preference_strength', 0.5)
        ])
        
        # 패딩
        while len(features) < 100:
            features.append(0.0)
        
        return features[:100]
    
    async def _get_neural_adjustments(self, features: List[float]) -> Dict[str, float]:
        """신경망 기반 개인화 조정값 얻기"""
        
        try:
            self.neural_adapter.eval()
            
            with torch.no_grad():
                feature_tensor = torch.FloatTensor(features).unsqueeze(0)
                adjustments = self.neural_adapter(feature_tensor).squeeze().numpy()
            
            return {
                'quality_weight': float(adjustments[0]),
                'style_intensity': float(adjustments[1]),
                'formality_level': float(adjustments[2]),
                'emotional_tone': float(adjustments[3]),
                'complexity_preference': float(adjustments[4])
            }
            
        except Exception as e:
            logger.error(f"신경망 조정값 계산 오류: {e}")
            return {}
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """시스템 메트릭 조회"""
        
        metrics = dict(self.real_time_metrics)
        metrics['active_users'] = len(metrics['active_users'])  # Set을 개수로 변환
        
        metrics.update({
            'learning_patterns_count': len(self.learning_patterns),
            'adaptation_strategies_count': len(self.adaptation_strategies),
            'feedback_queue_size': len(self.feedback_queue),
            'user_profiles_count': len(self.user_profiles),
            'system_uptime': time.time() - self._start_time if hasattr(self, '_start_time') else 0,
            'last_updated': datetime.now(timezone.utc).isoformat()
        })
        
        return metrics
    
    def _save_feedback_event(self, feedback_event: FeedbackEvent):
        """피드백 이벤트 저장"""
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO feedback_events 
                (event_id, user_id, message_id, feedback_type, feedback_value, context, timestamp, processed, impact_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                feedback_event.event_id,
                feedback_event.user_id,
                feedback_event.message_id,
                feedback_event.feedback_type,
                json.dumps(feedback_event.feedback_value),
                json.dumps(feedback_event.context),
                feedback_event.timestamp.isoformat(),
                feedback_event.processed,
                feedback_event.impact_score
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"피드백 이벤트 저장 오류: {e}")
    
    def __del__(self):
        """소멸자"""
        self.processing_active = False
        if hasattr(self, 'executor'):
            self.executor.shutdown(wait=False)

# 전역 인스턴스
adaptive_learning_system = RealTimeAdaptiveLearningSystem()

# 편의 함수들
async def record_user_feedback(feedback_data: Dict[str, Any]) -> str:
    """사용자 피드백 기록 편의 함수"""
    return await adaptive_learning_system.record_feedback(feedback_data)

async def get_personalized_recommendations(user_id: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """개인화 추천 조회 편의 함수"""
    return await adaptive_learning_system.get_adaptive_recommendations(user_id, context)

def get_learning_metrics() -> Dict[str, Any]:
    """학습 메트릭 조회 편의 함수"""
    return adaptive_learning_system.get_system_metrics()

if __name__ == "__main__":
    print("🧠 실시간 적응형 학습 시스템 v3.0 초기화 완료")
    print("✅ 기능: 즉시학습, 패턴발견, 개인화추천, 신경망적응") 