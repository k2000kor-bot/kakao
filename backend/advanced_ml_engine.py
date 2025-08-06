#!/usr/bin/env python3
"""
고급 머신러닝 엔진
- 개인화된 사용자 모델링
- 고급 예측 분석
- 감정 분석 강화
- 대화 패턴 학습
- 실시간 모델 업데이트
"""

import numpy as np
import json
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from collections import defaultdict, Counter
import logging
from dataclasses import dataclass, asdict
import math
import random

logger = logging.getLogger(__name__)


@dataclass
class UserProfile:
    """사용자 프로필 데이터 클래스"""
    user_id: str
    personality_traits: Dict[str, float]  # 성격 특성 (0-1)
    communication_style: Dict[str, float]  # 의사소통 스타일
    emotion_patterns: Dict[str, float]  # 감정 패턴
    topic_preferences: Dict[str, float]  # 주제 선호도
    response_patterns: Dict[str, Any]  # 응답 패턴
    learning_history: List[Dict[str, Any]]  # 학습 히스토리
    last_updated: str


@dataclass
class PredictionModel:
    """예측 모델 데이터 클래스"""
    model_id: str
    model_type: str  # 'engagement', 'emotion', 'quality', 'response_time'
    features: List[str]
    weights: Dict[str, float]
    bias: float
    accuracy: float
    last_trained: str
    training_samples: int


class AdvancedMLEngine:
    def __init__(self):
        self.user_profiles: Dict[str, UserProfile] = {}
        self.prediction_models: Dict[str, PredictionModel] = {}
        self.conversation_patterns: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        self.emotion_classifier = self._initialize_emotion_classifier()
        self.personality_analyzer = self._initialize_personality_analyzer()
        self.topic_classifier = self._initialize_topic_classifier()
        
    def _initialize_emotion_classifier(self) -> Dict[str, List[str]]:
        """감정 분류기 초기화"""
        return {
            'happy': ['좋아', '행복', '즐거워', '웃겨', '재밌어', '감사', '사랑', '좋은', '멋진'],
            'sad': ['슬퍼', '우울', '속상', '아프', '힘들', '외로', '그리워', '눈물'],
            'angry': ['화나', '짜증', '열받', '분노', '싫어', '미워', '빡쳐', '열받'],
            'excited': ['신나', '설레', '기대', '떨려', '두근', '재미있', '새로워'],
            'anxious': ['걱정', '불안', '긴장', '떨려', '무서워', '걱정돼', '불안해'],
            'calm': ['차분', '평온', '여유', '편안', '안정', '고요', '조용'],
            'neutral': ['그래', '알았', '네', '응', '오케이', '좋아', '괜찮']
        }
    
    def _initialize_personality_analyzer(self) -> Dict[str, List[str]]:
        """성격 분석기 초기화"""
        return {
            'extroverted': ['많이', '자주', '활발', '적극', '열정', '에너지', '사교'],
            'introverted': ['조용', '혼자', '차분', '신중', '깊이', '내향', '사색'],
            'analytical': ['분석', '논리', '체계', '정확', '객관', '이성', '사고'],
            'creative': ['창의', '상상', '독창', '예술', '감성', '직관', '영감'],
            'practical': ['실용', '현실', '구체', '효율', '실행', '해결', '목표'],
            'empathetic': ['공감', '이해', '배려', '따뜻', '관심', '돌봄', '동정']
        }
    
    def _initialize_topic_classifier(self) -> Dict[str, List[str]]:
        """주제 분류기 초기화"""
        return {
            'work': ['업무', '회사', '프로젝트', '일', '업무', '회의', '보고서'],
            'personal': ['개인', '사생활', '가족', '친구', '관계', '사랑', '연애'],
            'hobby': ['취미', '게임', '운동', '음악', '영화', '독서', '여행'],
            'technology': ['기술', '컴퓨터', '프로그래밍', '인터넷', '디지털', 'AI'],
            'health': ['건강', '운동', '다이어트', '병원', '약', '피로', '스트레스'],
            'education': ['학습', '공부', '학교', '수업', '시험', '지식', '교육'],
            'entertainment': ['재미', '유머', '웃음', '즐거움', '오락', '쇼', '예능']
        }
    
    def analyze_user_personality(self, user_id: str, conversation_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """사용자 성격 분석"""
        try:
            personality_scores = defaultdict(float)
            total_messages = len(conversation_data)
            
            if total_messages == 0:
                return {trait: 0.5 for trait in self.personality_analyzer.keys()}
            
            for message in conversation_data:
                content = message.get('content', '').lower()
                
                for trait, keywords in self.personality_analyzer.items():
                    for keyword in keywords:
                        if keyword in content:
                            personality_scores[trait] += 1
                            break
            
            # 정규화 (0-1 범위)
            normalized_scores = {}
            for trait, score in personality_scores.items():
                normalized_scores[trait] = min(1.0, score / total_messages)
            
            # 기본값 설정
            for trait in self.personality_analyzer.keys():
                if trait not in normalized_scores:
                    normalized_scores[trait] = 0.3
            
            return normalized_scores
            
        except Exception as e:
            logger.error(f"성격 분석 실패: {e}")
            return {trait: 0.5 for trait in self.personality_analyzer.keys()}
    
    def analyze_communication_style(self, user_id: str, conversation_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """의사소통 스타일 분석"""
        try:
            style_scores = {
                'formal': 0.0,
                'casual': 0.0,
                'emotive': 0.0,
                'logical': 0.0,
                'concise': 0.0,
                'detailed': 0.0
            }
            
            total_messages = len(conversation_data)
            if total_messages == 0:
                return style_scores
            
            for message in conversation_data:
                content = message.get('content', '')
                
                # 형식적/비형식적 분석
                if any(word in content for word in ['습니다', '니다', '습니다', '입니다']):
                    style_scores['formal'] += 1
                else:
                    style_scores['casual'] += 1
                
                # 감정적/논리적 분석
                emotion_words = ['좋아', '싫어', '화나', '슬퍼', '신나', '걱정']
                if any(word in content for word in emotion_words):
                    style_scores['emotive'] += 1
                else:
                    style_scores['logical'] += 1
                
                # 간결/상세 분석
                if len(content) < 20:
                    style_scores['concise'] += 1
                else:
                    style_scores['detailed'] += 1
            
            # 정규화
            for key in style_scores:
                style_scores[key] = min(1.0, style_scores[key] / total_messages)
            
            return style_scores
            
        except Exception as e:
            logger.error(f"의사소통 스타일 분석 실패: {e}")
            return {style: 0.5 for style in ['formal', 'casual', 'emotive', 'logical', 'concise', 'detailed']}
    
    def analyze_emotion_patterns(self, user_id: str, conversation_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """감정 패턴 분석"""
        try:
            emotion_counts = Counter()
            total_messages = len(conversation_data)
            
            if total_messages == 0:
                return {emotion: 0.0 for emotion in self.emotion_classifier.keys()}
            
            for message in conversation_data:
                content = message.get('content', '').lower()
                detected_emotion = 'neutral'
                
                for emotion, keywords in self.emotion_classifier.items():
                    for keyword in keywords:
                        if keyword in content:
                            detected_emotion = emotion
                            break
                    if detected_emotion != 'neutral':
                        break
                
                emotion_counts[detected_emotion] += 1
            
            # 정규화
            emotion_patterns = {}
            for emotion in self.emotion_classifier.keys():
                emotion_patterns[emotion] = emotion_counts[emotion] / total_messages
            
            return emotion_patterns
            
        except Exception as e:
            logger.error(f"감정 패턴 분석 실패: {e}")
            return {emotion: 0.0 for emotion in self.emotion_classifier.keys()}
    
    def analyze_topic_preferences(self, user_id: str, conversation_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """주제 선호도 분석"""
        try:
            topic_counts = Counter()
            total_messages = len(conversation_data)
            
            if total_messages == 0:
                return {topic: 0.0 for topic in self.topic_classifier.keys()}
            
            for message in conversation_data:
                content = message.get('content', '').lower()
                
                for topic, keywords in self.topic_classifier.items():
                    for keyword in keywords:
                        if keyword in content:
                            topic_counts[topic] += 1
                            break
            
            # 정규화
            topic_preferences = {}
            for topic in self.topic_classifier.keys():
                topic_preferences[topic] = topic_counts[topic] / total_messages
            
            return topic_preferences
            
        except Exception as e:
            logger.error(f"주제 선호도 분석 실패: {e}")
            return {topic: 0.0 for topic in self.topic_classifier.keys()}
    
    def analyze_response_patterns(self, user_id: str, conversation_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """응답 패턴 분석"""
        try:
            patterns = {
                'avg_response_time': 0.0,
                'response_length': {'short': 0, 'medium': 0, 'long': 0},
                'response_frequency': 0.0,
                'question_ratio': 0.0,
                'emoji_usage': 0.0
            }
            
            total_messages = len(conversation_data)
            if total_messages == 0:
                return patterns
            
            response_times = []
            question_count = 0
            emoji_count = 0
            
            for message in conversation_data:
                content = message.get('content', '')
                
                # 응답 시간 분석
                if 'timestamp' in message:
                    response_times.append(message.get('response_time', 0))
                
                # 질문 비율 분석
                if '?' in content or any(word in content for word in ['무엇', '어떻게', '왜', '언제', '어디']):
                    question_count += 1
                
                # 이모지 사용 분석
                emoji_chars = ['😊', '😄', '😢', '😡', '😍', '🤔', '👍', '👎', '❤️', '💔']
                if any(emoji in content for emoji in emoji_chars):
                    emoji_count += 1
                
                # 응답 길이 분석
                length = len(content)
                if length < 10:
                    patterns['response_length']['short'] += 1
                elif length < 50:
                    patterns['response_length']['medium'] += 1
                else:
                    patterns['response_length']['long'] += 1
            
            # 계산
            if response_times:
                patterns['avg_response_time'] = sum(response_times) / len(response_times)
            
            patterns['response_frequency'] = total_messages / max(1, len(set(msg.get('conversation_id', '') for msg in conversation_data)))
            patterns['question_ratio'] = question_count / total_messages
            patterns['emoji_usage'] = emoji_count / total_messages
            
            return patterns
            
        except Exception as e:
            logger.error(f"응답 패턴 분석 실패: {e}")
            return {
                'avg_response_time': 0.0,
                'response_length': {'short': 0, 'medium': 0, 'long': 0},
                'response_frequency': 0.0,
                'question_ratio': 0.0,
                'emoji_usage': 0.0
            }
    
    def update_user_profile(self, user_id: str, conversation_data: List[Dict[str, Any]]):
        """사용자 프로필 업데이트"""
        try:
            # 기존 프로필 로드 또는 새로 생성
            if user_id in self.user_profiles:
                profile = self.user_profiles[user_id]
            else:
                profile = UserProfile(
                    user_id=user_id,
                    personality_traits={},
                    communication_style={},
                    emotion_patterns={},
                    topic_preferences={},
                    response_patterns={},
                    learning_history=[],
                    last_updated=datetime.now().isoformat()
                )
            
            # 분석 수행
            personality_traits = self.analyze_user_personality(user_id, conversation_data)
            communication_style = self.analyze_communication_style(user_id, conversation_data)
            emotion_patterns = self.analyze_emotion_patterns(user_id, conversation_data)
            topic_preferences = self.analyze_topic_preferences(user_id, conversation_data)
            response_patterns = self.analyze_response_patterns(user_id, conversation_data)
            
            # 프로필 업데이트 (가중 평균 사용)
            alpha = 0.3  # 학습률
            
            profile.personality_traits = self._update_dict_with_alpha(
                profile.personality_traits, personality_traits, alpha
            )
            profile.communication_style = self._update_dict_with_alpha(
                profile.communication_style, communication_style, alpha
            )
            profile.emotion_patterns = self._update_dict_with_alpha(
                profile.emotion_patterns, emotion_patterns, alpha
            )
            profile.topic_preferences = self._update_dict_with_alpha(
                profile.topic_preferences, topic_preferences, alpha
            )
            profile.response_patterns = self._update_dict_with_alpha(
                profile.response_patterns, response_patterns, alpha
            )
            
            # 학습 히스토리 추가
            learning_record = {
                'timestamp': datetime.now().isoformat(),
                'conversation_count': len(conversation_data),
                'personality_changes': personality_traits,
                'emotion_changes': emotion_patterns
            }
            profile.learning_history.append(learning_record)
            
            # 히스토리 크기 제한
            if len(profile.learning_history) > 100:
                profile.learning_history = profile.learning_history[-50:]
            
            profile.last_updated = datetime.now().isoformat()
            
            # 프로필 저장
            self.user_profiles[user_id] = profile
            
            logger.info(f"사용자 프로필 업데이트 완료: {user_id}")
            
        except Exception as e:
            logger.error(f"사용자 프로필 업데이트 실패: {e}")
    
    def _update_dict_with_alpha(self, old_dict: Dict[str, float], new_dict: Dict[str, float], alpha: float) -> Dict[str, float]:
        """가중 평균으로 딕셔너리 업데이트"""
        updated_dict = {}
        
        for key in set(old_dict.keys()) | set(new_dict.keys()):
            old_value = old_dict.get(key, 0.0)
            new_value = new_dict.get(key, 0.0)
            updated_dict[key] = (1 - alpha) * old_value + alpha * new_value
        
        return updated_dict
    
    def predict_user_engagement(self, user_id: str, message_content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """사용자 참여도 예측"""
        try:
            if user_id not in self.user_profiles:
                return {'predicted_engagement': 0.5, 'confidence': 0.3, 'factors': []}
            
            profile = self.user_profiles[user_id]
            
            # 예측 요인들
            factors = []
            base_engagement = 0.5
            
            # 성격 특성 기반 예측
            if profile.personality_traits.get('extroverted', 0) > 0.6:
                factors.append(('extroverted_personality', 0.1))
                base_engagement += 0.1
            
            # 감정 패턴 기반 예측
            content_lower = message_content.lower()
            for emotion, keywords in self.emotion_classifier.items():
                if any(keyword in content_lower for keyword in keywords):
                    emotion_weight = profile.emotion_patterns.get(emotion, 0.0)
                    factors.append((f'emotion_{emotion}', emotion_weight * 0.2))
                    base_engagement += emotion_weight * 0.2
                    break
            
            # 주제 선호도 기반 예측
            for topic, keywords in self.topic_classifier.items():
                if any(keyword in content_lower for keyword in keywords):
                    topic_weight = profile.topic_preferences.get(topic, 0.0)
                    factors.append((f'topic_{topic}', topic_weight * 0.15))
                    base_engagement += topic_weight * 0.15
                    break
            
            # 의사소통 스타일 기반 예측
            if profile.communication_style.get('emotive', 0) > 0.5:
                factors.append(('emotive_style', 0.05))
                base_engagement += 0.05
            
            # 신뢰도 계산
            confidence = min(0.9, 0.3 + len(profile.learning_history) * 0.01)
            
            predicted_engagement = max(0.0, min(1.0, base_engagement))
            
            return {
                'predicted_engagement': predicted_engagement,
                'confidence': confidence,
                'factors': factors
            }
            
        except Exception as e:
            logger.error(f"참여도 예측 실패: {e}")
            return {'predicted_engagement': 0.5, 'confidence': 0.3, 'factors': []}
    
    def predict_response_time(self, user_id: str, message_content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """응답 시간 예측"""
        try:
            if user_id not in self.user_profiles:
                return {'predicted_time': 30.0, 'confidence': 0.3, 'factors': []}
            
            profile = self.user_profiles[user_id]
            
            base_time = 30.0  # 기본 30초
            factors = []
            
            # 응답 패턴 기반 예측
            avg_response_time = profile.response_patterns.get('avg_response_time', 30.0)
            factors.append(('historical_response_time', avg_response_time))
            
            # 메시지 길이 기반 예측
            message_length = len(message_content)
            if message_length < 10:
                time_adjustment = -10.0
            elif message_length > 100:
                time_adjustment = 20.0
            else:
                time_adjustment = 0.0
            
            factors.append(('message_length', time_adjustment))
            
            # 감정 기반 예측
            content_lower = message_content.lower()
            for emotion, keywords in self.emotion_classifier.items():
                if any(keyword in content_lower for keyword in keywords):
                    if emotion in ['angry', 'excited']:
                        time_adjustment = -5.0
                    elif emotion in ['sad', 'anxious']:
                        time_adjustment = 10.0
                    else:
                        time_adjustment = 0.0
                    factors.append((f'emotion_{emotion}', time_adjustment))
                    break
            
            predicted_time = max(5.0, base_time + sum(factor[1] for factor in factors))
            confidence = min(0.9, 0.3 + len(profile.learning_history) * 0.01)
            
            return {
                'predicted_time': predicted_time,
                'confidence': confidence,
                'factors': factors
            }
            
        except Exception as e:
            logger.error(f"응답 시간 예측 실패: {e}")
            return {'predicted_time': 30.0, 'confidence': 0.3, 'factors': []}
    
    def get_personalized_response(self, user_id: str, message_content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """개인화된 응답 생성"""
        try:
            if user_id not in self.user_profiles:
                return {'response_style': 'neutral', 'tone': 'formal', 'length': 'medium'}
            
            profile = self.user_profiles[user_id]
            
            # 의사소통 스타일 기반 응답 스타일 결정
            communication_style = profile.communication_style
            
            if communication_style.get('formal', 0) > 0.6:
                response_style = 'formal'
                tone = 'respectful'
            elif communication_style.get('casual', 0) > 0.6:
                response_style = 'casual'
                tone = 'friendly'
            else:
                response_style = 'neutral'
                tone = 'balanced'
            
            # 성격 특성 기반 응답 길이 결정
            if profile.personality_traits.get('analytical', 0) > 0.6:
                length = 'detailed'
            elif profile.personality_traits.get('practical', 0) > 0.6:
                length = 'concise'
            else:
                length = 'medium'
            
            # 감정 패턴 기반 톤 조정
            dominant_emotion = max(profile.emotion_patterns.items(), key=lambda x: x[1])[0]
            if dominant_emotion in ['sad', 'anxious']:
                tone = 'supportive'
            elif dominant_emotion in ['angry']:
                tone = 'calming'
            elif dominant_emotion in ['excited', 'happy']:
                tone = 'enthusiastic'
            
            return {
                'response_style': response_style,
                'tone': tone,
                'length': length,
                'personality_match': profile.personality_traits,
                'emotion_consideration': dominant_emotion
            }
            
        except Exception as e:
            logger.error(f"개인화된 응답 생성 실패: {e}")
            return {'response_style': 'neutral', 'tone': 'formal', 'length': 'medium'}
    
    def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """사용자 프로필 조회"""
        if user_id in self.user_profiles:
            return asdict(self.user_profiles[user_id])
        return None
    
    def get_all_user_profiles(self) -> Dict[str, Dict[str, Any]]:
        """모든 사용자 프로필 조회"""
        return {user_id: asdict(profile) for user_id, profile in self.user_profiles.items()}
    
    def clear_user_data(self, user_id: str):
        """사용자 데이터 삭제"""
        if user_id in self.user_profiles:
            del self.user_profiles[user_id]
            logger.info(f"사용자 데이터 삭제 완료: {user_id}")
    
    def get_system_stats(self) -> Dict[str, Any]:
        """시스템 통계 조회"""
        return {
            'total_users': len(self.user_profiles),
            'total_models': len(self.prediction_models),
            'avg_profile_age': self._calculate_avg_profile_age(),
            'most_active_users': self._get_most_active_users(),
            'model_accuracy': self._calculate_model_accuracy()
        }
    
    def _calculate_avg_profile_age(self) -> float:
        """평균 프로필 나이 계산"""
        if not self.user_profiles:
            return 0.0
        
        total_age = 0
        for profile in self.user_profiles.values():
            last_updated = datetime.fromisoformat(profile.last_updated)
            age_hours = (datetime.now() - last_updated).total_seconds() / 3600
            total_age += age_hours
        
        return total_age / len(self.user_profiles)
    
    def _get_most_active_users(self) -> List[Dict[str, Any]]:
        """가장 활성화된 사용자 조회"""
        user_activity = []
        
        for user_id, profile in self.user_profiles.items():
            activity_score = len(profile.learning_history)
            user_activity.append({
                'user_id': user_id,
                'activity_score': activity_score,
                'last_updated': profile.last_updated
            })
        
        return sorted(user_activity, key=lambda x: x['activity_score'], reverse=True)[:5]
    
    def _calculate_model_accuracy(self) -> Dict[str, float]:
        """모델 정확도 계산"""
        accuracy = {}
        for model_id, model in self.prediction_models.items():
            accuracy[model_id] = model.accuracy
        return accuracy


# 싱글톤 인스턴스
advanced_ml_engine = AdvancedMLEngine() 