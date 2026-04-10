#!/usr/bin/env python3
"""
고급 AI 기능 시스템
감정 분석, 개인화 추천, 예측 모델링, 자연어 처리 고도화
"""

import logging
import os
import time
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from collections import defaultdict, Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from transformers import pipeline
from textblob import TextBlob
from nltk.sentiment import SentimentIntensityAnalyzer
from konlpy.tag import Okt, Kkma
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class EmotionAnalysis:
    """감정 분석 결과"""
    text: str
    emotion: str  # joy, sadness, anger, fear, surprise, disgust
    confidence: float
    sentiment_score: float  # -1 to 1
    emotional_intensity: float  # 0 to 1
    keywords: List[str]
    timestamp: str


@dataclass
class PersonalizedRecommendation:
    """개인화 추천 결과"""
    user_id: str
    recommendation_type: str
    items: List[Dict[str, Any]]
    confidence_scores: List[float]
    reasoning: str
    timestamp: str


@dataclass
class PredictionResult:
    """예측 결과"""
    prediction_type: str
    predicted_value: float
    confidence: float
    features_importance: Dict[str, float]
    model_accuracy: float
    timestamp: str


class EmotionAnalyzer:
    """감정 분석 엔진"""

    def __init__(self):
        self.emotion_model = None
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.emotion_keywords = {
            'joy': ['기쁘', '행복', '즐거', '웃음', '좋아', '만족', '성공', '축하'],
            'sadness': ['슬프', '우울', '눈물', '아픔', '힘들', '실망', '좌절', '우울'],
            'anger': ['화나', '짜증', '분노', '열받', '싫어', '미워', '격분', '성나'],
            'fear': ['무서', '두려', '걱정', '불안', '공포', '조심', '위험', '불안'],
            'surprise': ['놀라', '깜짝', '신기', '대단', '놀람', '예상', '갑작', '뜻밖'],
            'disgust': ['역겨', '싫어', '혐오', '더러', '불쾌', '거부', '싫증', '혐오']
        }

        # 한국어 감정 분석 모델 로드
        try:
            self.okt = Okt()
            self._load_emotion_model()
        except Exception as e:
            logger.error(f"감정 분석 모델 로드 오류: {e}")

    def _load_emotion_model(self):
        """감정 분석 모델 로드"""
        # 실제 구현에서는 사전 훈련된 모델 사용
        # 여기서는 간단한 규칙 기반 모델 사용
        self.emotion_model = "rule_based"

    def analyze_emotion(self, text: str) -> EmotionAnalysis:
        """텍스트 감정 분석"""
        try:
            # 기본 감정 점수 계산
            emotion_scores = {}
            for emotion, keywords in self.emotion_keywords.items():
                score = sum(1 for keyword in keywords if keyword in text)
                emotion_scores[emotion] = score

            # 가장 높은 점수의 감정 선택
            if emotion_scores:
                dominant_emotion = max(emotion_scores, key=emotion_scores.get)
                confidence = (
                    emotion_scores[dominant_emotion] / len(text.split())
                )
            else:
                dominant_emotion = 'neutral'
                confidence = 0.0

            # 감정 강도 계산
            emotional_intensity = min(1.0, confidence * 2)

            # 감정 키워드 추출
            emotion_keywords_found = []
            for emotion, keywords in self.emotion_keywords.items():
                for keyword in keywords:
                    if keyword in text:
                        emotion_keywords_found.append(keyword)

            # 감정 점수 (-1: 부정적, 1: 긍정적)
            sentiment_score = self._calculate_sentiment_score(text)

            return EmotionAnalysis(
                text=text,
                emotion=dominant_emotion,
                confidence=confidence,
                sentiment_score=sentiment_score,
                emotional_intensity=emotional_intensity,
                keywords=emotion_keywords_found,
                timestamp=datetime.now().isoformat()
            )

        except Exception as e:
            logger.error(f"감정 분석 오류: {e}")
            return self._get_default_emotion_analysis(text)

    def _calculate_sentiment_score(self, text: str) -> float:
        """감정 점수 계산"""
        try:
            # TextBlob 사용
            blob = TextBlob(text)
            return blob.sentiment.polarity
        except Exception:
            # 간단한 규칙 기반 계산
            positive_words = ['좋', '기쁘', '행복', '만족', '성공']
            negative_words = ['나쁘', '슬프', '화나', '실망', '실패']

            positive_count = sum(1 for word in positive_words if word in text)
            negative_count = sum(1 for word in negative_words if word in text)

            if positive_count + negative_count == 0:
                return 0.0

            return (
                (positive_count - negative_count) /
                (positive_count + negative_count)
            )

    def _get_default_emotion_analysis(self, text: str) -> EmotionAnalysis:
        """기본 감정 분석 결과"""
        return EmotionAnalysis(
            text=text,
            emotion='neutral',
            confidence=0.0,
            sentiment_score=0.0,
            emotional_intensity=0.0,
            keywords=[],
            timestamp=datetime.now().isoformat()
        )

    def analyze_batch(self, texts: List[str]) -> List[EmotionAnalysis]:
        """배치 감정 분석"""
        return [self.analyze_emotion(text) for text in texts]


class PersonalizedRecommendationEngine:
    """개인화 추천 엔진"""

    def __init__(self):
        self.user_profiles = {}
        self.item_features = {}
        self.interaction_history = defaultdict(list)
        self.recommendation_models = {}

    def create_user_profile(
        self, user_id: str, preferences: Dict[str, Any]
    ) -> bool:
        """사용자 프로필 생성"""
        try:
            profile = {
                'user_id': user_id,
                'preferences': preferences,
                'interaction_history': [],
                'recommendation_history': [],
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }

            self.user_profiles[user_id] = profile
            logger.info(f"사용자 프로필 생성: {user_id}")
            return True

        except Exception as e:
            logger.error(f"사용자 프로필 생성 오류: {e}")
            return False

    def record_interaction(
        self, user_id: str, item_id: str, interaction_type: str,
        rating: float = None
    ):
        """사용자 상호작용 기록"""
        try:
            interaction = {
                'item_id': item_id,
                'interaction_type': interaction_type,
                'rating': rating,
                'timestamp': datetime.now().isoformat()
            }

            self.interaction_history[user_id].append(interaction)

            # 사용자 프로필 업데이트
            if user_id in self.user_profiles:
                self.user_profiles[user_id]['interaction_history'].append(
                    interaction
                )
                self.user_profiles[user_id]['updated_at'] = (
                    datetime.now().isoformat()
                )

            logger.info(
                f"상호작용 기록: {user_id} - {item_id} ({interaction_type})"
            )

        except Exception as e:
            logger.error(f"상호작용 기록 오류: {e}")

    def generate_recommendations(
        self, user_id: str, recommendation_type: str, limit: int = 10
    ) -> PersonalizedRecommendation:
        """개인화 추천 생성"""
        try:
            if user_id not in self.user_profiles:
                return self._get_default_recommendation(
                    user_id, recommendation_type
                )

            user_profile = self.user_profiles[user_id]
            interactions = self.interaction_history[user_id]

            # 추천 알고리즘 선택
            if recommendation_type == 'collaborative_filtering':
                recommendations = self._collaborative_filtering(
                    user_id, interactions, limit
                )
            elif recommendation_type == 'content_based':
                recommendations = self._content_based_filtering(
                    user_id, user_profile, limit
                )
            elif recommendation_type == 'hybrid':
                recommendations = self._hybrid_recommendation(
                    user_id, interactions, user_profile, limit
                )
            else:
                recommendations = self._popularity_based_recommendation(limit)

            # 추천 결과 생성
            items = []
            confidence_scores = []

            for item_id, score in recommendations:
                items.append({
                    'item_id': item_id,
                    'score': score,
                    'metadata': self.item_features.get(item_id, {})
                })
                confidence_scores.append(score)

            reasoning = self._generate_recommendation_reasoning(
                user_id, recommendation_type, interactions
            )

            recommendation = PersonalizedRecommendation(
                user_id=user_id,
                recommendation_type=recommendation_type,
                items=items,
                confidence_scores=confidence_scores,
                reasoning=reasoning,
                timestamp=datetime.now().isoformat()
            )

            # 추천 히스토리에 기록
            user_profile['recommendation_history'].append(recommendation)

            return recommendation

        except Exception as e:
            logger.error(f"추천 생성 오류: {e}")
            return self._get_default_recommendation(
                user_id, recommendation_type
            )

    def _collaborative_filtering(
        self, user_id: str, interactions: List[Dict], limit: int
    ) -> List[Tuple[str, float]]:
        """협업 필터링"""
        # 사용자-아이템 매트릭스 생성
        user_item_matrix = defaultdict(dict)
        for interaction in interactions:
            item_id = interaction['item_id']
            rating = interaction.get('rating', 3.0)  # 기본 평점
            user_item_matrix[user_id][item_id] = rating

        # 유사한 사용자 찾기 (간단한 구현)
        similar_users = self._find_similar_users(user_id, user_item_matrix)

        # 추천 아이템 계산
        recommendations = defaultdict(float)
        for similar_user, similarity in similar_users.items():
            for item_id, rating in user_item_matrix[similar_user].items():
                if item_id not in user_item_matrix[user_id]:
                    recommendations[item_id] += similarity * rating

        # 정렬하여 상위 추천 반환
        sorted_recommendations = sorted(
            recommendations.items(), key=lambda x: x[1], reverse=True
        )
        return sorted_recommendations[:limit]

    def _content_based_filtering(
        self, user_id: str, user_profile: Dict, limit: int
    ) -> List[Tuple[str, float]]:
        """콘텐츠 기반 필터링"""
        preferences = user_profile.get('preferences', {})

        # 사용자 선호도 기반 아이템 점수 계산
        item_scores = {}
        for item_id, features in self.item_features.items():
            score = 0.0
            for feature, weight in preferences.items():
                if feature in features:
                    score += weight * features[feature]
            item_scores[item_id] = score

        # 정렬하여 상위 추천 반환
        sorted_recommendations = sorted(
            item_scores.items(), key=lambda x: x[1], reverse=True
        )
        return sorted_recommendations[:limit]

    def _hybrid_recommendation(
        self, user_id: str, interactions: List[Dict], user_profile: Dict,
        limit: int
    ) -> List[Tuple[str, float]]:
        """하이브리드 추천"""
        # 협업 필터링과 콘텐츠 기반 필터링 결합
        cf_recommendations = self._collaborative_filtering(
            user_id, interactions, limit * 2
        )
        cb_recommendations = self._content_based_filtering(
            user_id, user_profile, limit * 2
        )

        # 가중 평균으로 결합
        combined_scores = defaultdict(float)

        for item_id, score in cf_recommendations:
            combined_scores[item_id] += score * 0.6  # 협업 필터링 가중치

        for item_id, score in cb_recommendations:
            combined_scores[item_id] += score * 0.4  # 콘텐츠 기반 가중치

        # 정렬하여 상위 추천 반환
        sorted_recommendations = sorted(
            combined_scores.items(), key=lambda x: x[1], reverse=True
        )
        return sorted_recommendations[:limit]

    def _popularity_based_recommendation(
        self, limit: int
    ) -> List[Tuple[str, float]]:
        """인기도 기반 추천"""
        # 모든 상호작용에서 아이템 인기도 계산
        item_popularity = Counter()
        for interactions in self.interaction_history.values():
            for interaction in interactions:
                item_popularity[interaction['item_id']] += 1

        # 정렬하여 상위 추천 반환
        sorted_recommendations = sorted(
            item_popularity.items(), key=lambda x: x[1], reverse=True
        )
        return [
            (item_id, float(count))
            for item_id, count in sorted_recommendations[:limit]
        ]

    def _find_similar_users(
        self, user_id: str, user_item_matrix: Dict
    ) -> Dict[str, float]:
        """유사한 사용자 찾기"""
        if user_id not in user_item_matrix:
            return {}

        user_items = set(user_item_matrix[user_id].keys())
        similar_users = {}

        for other_user, other_items in user_item_matrix.items():
            if other_user == user_id:
                continue

            other_items_set = set(other_items.keys())
            intersection = user_items.intersection(other_items_set)
            union = user_items.union(other_items_set)

            if len(union) > 0:
                similarity = len(intersection) / len(union)  # Jaccard 유사도
                if similarity > 0.1:  # 최소 유사도 임계값
                    similar_users[other_user] = similarity

        return similar_users

    def _generate_recommendation_reasoning(
        self, user_id: str, recommendation_type: str, interactions: List[Dict]
    ) -> str:
        """추천 근거 생성"""
        if recommendation_type == 'collaborative_filtering':
            return "비슷한 취향의 사용자들이 좋아한 아이템을 추천합니다."
        elif recommendation_type == 'content_based':
            return "사용자의 선호도와 일치하는 아이템을 추천합니다."
        elif recommendation_type == 'hybrid':
            return "사용자 행동 패턴과 선호도를 종합하여 추천합니다."
        else:
            return "인기 있는 아이템을 추천합니다."

    def _get_default_recommendation(
        self, user_id: str, recommendation_type: str
    ) -> PersonalizedRecommendation:
        """기본 추천 결과"""
        return PersonalizedRecommendation(
            user_id=user_id,
            recommendation_type=recommendation_type,
            items=[],
            confidence_scores=[],
            reasoning="사용자 정보가 부족하여 추천을 생성할 수 없습니다.",
            timestamp=datetime.now().isoformat()
        )


class PredictiveModelingEngine:
    """예측 모델링 엔진"""

    def __init__(self):
        self.models = {}
        self.feature_encoders = {}
        self.scalers = {}

    def train_model(
        self, model_type: str, training_data: pd.DataFrame,
        target_column: str, model_name: str = None
    ) -> Dict[str, Any]:
        """예측 모델 훈련"""
        try:
            if model_name is None:
                model_name = f"{model_type}_{int(time.time())}"

            # 특성과 타겟 분리
            X = training_data.drop(columns=[target_column])
            y = training_data[target_column]

            # 특성 전처리
            X_processed, feature_names = self._preprocess_features(
                X, model_name
            )

            # 모델 선택 및 훈련
            if model_type == 'classification':
                model = RandomForestClassifier(
                    n_estimators=100, random_state=42
                )
            elif model_type == 'regression':
                model = GradientBoostingRegressor(
                    n_estimators=100, random_state=42
                )
            else:
                raise ValueError(f"지원하지 않는 모델 타입: {model_type}")

            # 교차 검증
            cv_scores = cross_val_score(model, X_processed, y, cv=5)

            # 모델 훈련
            model.fit(X_processed, y)

            # 모델 저장
            self.models[model_name] = {
                'model': model,
                'model_type': model_type,
                'feature_names': feature_names,
                'target_column': target_column,
                'cv_scores': cv_scores.tolist(),
                'mean_cv_score': cv_scores.mean(),
                'trained_at': datetime.now().isoformat()
            }

            logger.info(
                f"모델 훈련 완료: {model_name} (CV 점수: {cv_scores.mean():.3f})"
            )

            return {
                'model_name': model_name,
                'model_type': model_type,
                'cv_scores': cv_scores.tolist(),
                'mean_cv_score': cv_scores.mean(),
                'feature_count': len(feature_names),
                'training_samples': len(training_data)
            }

        except Exception as e:
            logger.error(f"모델 훈련 오류: {e}")
            return {'error': str(e)}

    def predict(
        self, model_name: str, input_data: Dict[str, Any]
    ) -> PredictionResult:
        """예측 수행"""
        try:
            if model_name not in self.models:
                raise ValueError(
                    f"모델을 찾을 수 없습니다: {model_name}"
                )

            model_info = self.models[model_name]
            model = model_info['model']
            feature_names = model_info['feature_names']

            # 입력 데이터 전처리
            input_features = self._prepare_input_features(
                input_data, feature_names, model_name
            )

            # 예측 수행
            prediction = model.predict([input_features])[0]

            # 예측 신뢰도 계산
            if hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba([input_features])[0]
                confidence = max(probabilities)
            else:
                confidence = 0.8  # 기본 신뢰도

            # 특성 중요도 추출
            feature_importance = {}
            if hasattr(model, 'feature_importances_'):
                for i, importance in enumerate(model.feature_importances_):
                    feature_importance[feature_names[i]] = float(importance)

            return PredictionResult(
                prediction_type=model_info['model_type'],
                predicted_value=float(prediction),
                confidence=float(confidence),
                features_importance=feature_importance,
                model_accuracy=float(model_info['mean_cv_score']),
                timestamp=datetime.now().isoformat()
            )

        except Exception as e:
            logger.error(f"예측 오류: {e}")
            return self._get_default_prediction_result()

    def _preprocess_features(
        self, X: pd.DataFrame, model_name: str
    ) -> Tuple[np.ndarray, List[str]]:
        """특성 전처리"""
        # 범주형 변수 인코딩
        X_encoded = X.copy()
        feature_names = list(X.columns)

        for column in X.columns:
            if X[column].dtype == 'object':
                # 라벨 인코딩
                if column not in self.feature_encoders:
                    encoder = LabelEncoder()
                    X_encoded[column] = encoder.fit_transform(
                        X[column].astype(str)
                    )
                    self.feature_encoders[f"{model_name}_{column}"] = encoder
                else:
                    encoder = self.feature_encoders[f"{model_name}_{column}"]
                    X_encoded[column] = encoder.transform(
                        X[column].astype(str)
                    )

        # 특성 스케일링
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_encoded)
        self.scalers[model_name] = scaler

        return X_scaled, feature_names

    def _prepare_input_features(
        self, input_data: Dict[str, Any], feature_names: List[str],
        model_name: str
    ) -> np.ndarray:
        """입력 특성 준비"""
        # 특성 벡터 생성
        features = []
        for feature_name in feature_names:
            if feature_name in input_data:
                features.append(input_data[feature_name])
            else:
                features.append(0.0)  # 기본값

        # 범주형 변수 인코딩
        for i, feature_name in enumerate(feature_names):
            encoder_key = f"{model_name}_{feature_name}"
            if encoder_key in self.feature_encoders:
                encoder = self.feature_encoders[encoder_key]
                try:
                    features[i] = encoder.transform([str(features[i])])[0]
                except ValueError:
                    features[i] = 0  # 알 수 없는 값은 0으로 처리

        # 스케일링
        if model_name in self.scalers:
            scaler = self.scalers[model_name]
            features = scaler.transform([features])[0]

        return np.array(features)

    def _get_default_prediction_result(self) -> PredictionResult:
        """기본 예측 결과"""
        return PredictionResult(
            prediction_type='unknown',
            predicted_value=0.0,
            confidence=0.0,
            features_importance={},
            model_accuracy=0.0,
            timestamp=datetime.now().isoformat()
        )


class AdvancedNLPProcessor:
    """고급 자연어 처리 엔진"""

    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.nlp_pipeline = None

        try:
            # 한국어 NLP 모델 로드
            self.okt = Okt()
            self.kkma = Kkma()

            # 감정 분석 파이프라인
            self.sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="nlptown/bert-base-multilingual-uncased-sentiment"
            )

        except Exception as e:
            logger.error(f"NLP 모델 로드 오류: {e}")

    def extract_keywords(
        self, text: str, num_keywords: int = 10
    ) -> List[Dict[str, Any]]:
        """키워드 추출"""
        try:
            # 형태소 분석
            tokens = self.okt.pos(text, stem=True)

            # 명사, 동사, 형용사만 추출
            meaningful_tokens = [
                word for word, pos in tokens
                if pos in ['Noun', 'Verb', 'Adjective'] and len(word) > 1
            ]

            # TF-IDF 기반 키워드 추출
            vectorizer = TfidfVectorizer(
                max_features=num_keywords, stop_words='english'
            )
            tfidf_matrix = vectorizer.fit_transform(
                [' '.join(meaningful_tokens)]
            )

            feature_names = vectorizer.get_feature_names_out()
            tfidf_scores = tfidf_matrix.toarray()[0]

            # 키워드와 점수 매핑
            keywords = []
            for word, score in zip(feature_names, tfidf_scores):
                keywords.append({
                    'keyword': word,
                    'score': float(score),
                    'frequency': meaningful_tokens.count(word)
                })

            # 점수 기준 정렬
            keywords.sort(key=lambda x: x['score'], reverse=True)

            return keywords

        except Exception as e:
            logger.error(f"키워드 추출 오류: {e}")
            return []

    def summarize_text(self, text: str, max_sentences: int = 3) -> str:
        """텍스트 요약"""
        try:
            # 문장 분리
            sentences = self.kkma.sentences(text)

            if len(sentences) <= max_sentences:
                return text

            # 문장별 중요도 계산
            sentence_scores = []
            for sentence in sentences:
                keywords = self.extract_keywords(sentence, 5)
                score = sum(kw['score'] for kw in keywords)
                sentence_scores.append((sentence, score))

            # 중요도 기준 정렬
            sentence_scores.sort(key=lambda x: x[1], reverse=True)

            # 상위 문장들 선택
            selected_sentences = [
                sent for sent, score in sentence_scores[:max_sentences]
            ]

            return ' '.join(selected_sentences)

        except Exception as e:
            logger.error(f"텍스트 요약 오류: {e}")
            return text

    def classify_intent(self, text: str) -> Dict[str, Any]:
        """의도 분류"""
        try:
            # 간단한 규칙 기반 의도 분류
            intent_patterns = {
                'question': ['?', '무엇', '어떻게', '언제', '어디', '왜', '누구'],
                'request': ['해주세요', '부탁', '요청', '도움'],
                'complaint': ['불만', '문제', '오류', '잘못', '실수'],
                'compliment': ['좋아', '감사', '훌륭', '대단', '멋져'],
                'greeting': ['안녕', '하이', '헬로', '반가']
            }

            text_lower = text.lower()
            intent_scores = {}

            for intent, patterns in intent_patterns.items():
                score = sum(1 for pattern in patterns if pattern in text_lower)
                intent_scores[intent] = score

            # 가장 높은 점수의 의도 선택
            if intent_scores:
                predicted_intent = max(intent_scores, key=intent_scores.get)
                confidence = (
                    intent_scores[predicted_intent] / len(text.split())
                )
            else:
                predicted_intent = 'unknown'
                confidence = 0.0

            return {
                'intent': predicted_intent,
                'confidence': confidence,
                'scores': intent_scores
            }

        except Exception as e:
            logger.error(f"의도 분류 오류: {e}")
            return {'intent': 'unknown', 'confidence': 0.0, 'scores': {}}

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """개체명 인식"""
        try:
            # 형태소 분석
            tokens = self.okt.pos(text)

            entities = []
            current_entity = ""
            current_type = ""

            for word, pos in tokens:
                if pos == 'Noun':
                    if not current_entity:
                        current_entity = word
                        current_type = 'PERSON'  # 간단한 분류
                    else:
                        current_entity += " " + word
                else:
                    if current_entity:
                        entities.append({
                            'entity': current_entity,
                            'type': current_type,
                            'start': text.find(current_entity),
                            'end': (
                                text.find(current_entity) + len(current_entity)
                            )
                        })
                        current_entity = ""
                        current_type = ""

            # 마지막 엔티티 처리
            if current_entity:
                entities.append({
                    'entity': current_entity,
                    'type': current_type,
                    'start': text.find(current_entity),
                    'end': (
                        text.find(current_entity) + len(current_entity)
                    )
                })

            return entities

        except Exception as e:
            logger.error(f"개체명 인식 오류: {e}")
            return []


class AdvancedAIFeatures:
    """고급 AI 기능 메인 클래스"""

    def __init__(self):
        self.emotion_analyzer = EmotionAnalyzer()
        self.recommendation_engine = PersonalizedRecommendationEngine()
        self.prediction_engine = PredictiveModelingEngine()
        self.nlp_processor = AdvancedNLPProcessor()

    def analyze_user_emotion(self, user_id: str, text: str) -> Dict[str, Any]:
        """사용자 감정 분석"""
        emotion_analysis = self.emotion_analyzer.analyze_emotion(text)

        return {
            'user_id': user_id,
            'emotion_analysis': emotion_analysis.__dict__,
            'recommendations': self._get_emotion_based_recommendations(
                emotion_analysis
            ),
            'timestamp': datetime.now().isoformat()
        }

    def _get_emotion_based_recommendations(
        self, emotion_analysis: EmotionAnalysis
    ) -> List[str]:
        """감정 기반 추천"""
        recommendations = []

        if emotion_analysis.emotion == 'sadness':
            recommendations.extend([
                "힘든 시간이시군요. 조금씩 나아질 거예요.",
                "음악이나 영화를 통해 기분 전환을 해보세요.",
                "가까운 사람들과 대화해보세요."
            ])
        elif emotion_analysis.emotion == 'anger':
            recommendations.extend([
                "깊게 숨을 쉬며 마음을 진정시켜보세요.",
                "운동이나 산책으로 스트레스를 해소해보세요.",
                "상황을 객관적으로 바라보는 시간을 가져보세요."
            ])
        elif emotion_analysis.emotion == 'joy':
            recommendations.extend([
                "좋은 기분이 계속되길 바랍니다!",
                "이런 긍정적인 에너지를 주변에 나눠보세요.",
                "기쁜 순간을 기록으로 남겨보세요."
            ])

        return recommendations

    def generate_smart_recommendations(
        self, user_id: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """스마트 추천 생성"""
        # 사용자 프로필 확인
        if user_id not in self.recommendation_engine.user_profiles:
            # 기본 프로필 생성
            self.recommendation_engine.create_user_profile(
                user_id, context.get('preferences', {})
            )

        # 추천 타입 결정
        recommendation_type = context.get('recommendation_type', 'hybrid')

        # 추천 생성
        recommendation = self.recommendation_engine.generate_recommendations(
            user_id, recommendation_type, context.get('limit', 10)
        )

        return {
            'user_id': user_id,
            'recommendation': recommendation.__dict__,
            'context': context,
            'timestamp': datetime.now().isoformat()
        }

    def predict_user_behavior(
        self, user_id: str, features: Dict[str, Any]
    ) -> Dict[str, Any]:
        """사용자 행동 예측"""
        # 예측 모델이 있는지 확인
        model_name = f"user_behavior_{user_id}"

        if model_name not in self.prediction_engine.models:
            # 기본 모델 생성 (실제로는 사전 훈련된 모델 사용)
            return {
                'user_id': user_id,
                'prediction': '모델이 없어 예측할 수 없습니다.',
                'confidence': 0.0,
                'timestamp': datetime.now().isoformat()
            }

        # 예측 수행
        prediction_result = self.prediction_engine.predict(
            model_name, features
        )

        return {
            'user_id': user_id,
            'prediction_result': prediction_result.__dict__,
            'features': features,
            'timestamp': datetime.now().isoformat()
        }

    def process_natural_language(self, text: str) -> Dict[str, Any]:
        """자연어 처리"""
        # 키워드 추출
        keywords = self.nlp_processor.extract_keywords(text)

        # 텍스트 요약
        summary = self.nlp_processor.summarize_text(text)

        # 의도 분류
        intent = self.nlp_processor.classify_intent(text)

        # 개체명 인식
        entities = self.nlp_processor.extract_entities(text)

        return {
            'original_text': text,
            'keywords': keywords,
            'summary': summary,
            'intent': intent,
            'entities': entities,
            'timestamp': datetime.now().isoformat()
        }


# API 서버 통합
app = FastAPI(title="고급 AI 기능 API")


class EmotionAnalysisRequest(BaseModel):
    user_id: str
    text: str


class RecommendationRequest(BaseModel):
    user_id: str
    context: Dict[str, Any]


class PredictionRequest(BaseModel):
    user_id: str
    features: Dict[str, Any]


class NLPRequest(BaseModel):
    text: str


class ModelTrainingRequest(BaseModel):
    model_type: str
    training_data: Dict[str, Any]
    target_column: str
    model_name: str = None


advanced_ai = AdvancedAIFeatures()


@app.post("/analyze-emotion")
async def analyze_emotion(request: EmotionAnalysisRequest):
    """감정 분석"""
    try:
        result = advanced_ai.analyze_user_emotion(
            request.user_id, request.text
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-recommendations")
async def generate_recommendations(request: RecommendationRequest):
    """개인화 추천 생성"""
    try:
        result = advanced_ai.generate_smart_recommendations(
            request.user_id, request.context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-behavior")
async def predict_behavior(request: PredictionRequest):
    """사용자 행동 예측"""
    try:
        result = advanced_ai.predict_user_behavior(
            request.user_id, request.features
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/process-nlp")
async def process_nlp(request: NLPRequest):
    """자연어 처리"""
    try:
        result = advanced_ai.process_natural_language(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train-model")
async def train_model(request: ModelTrainingRequest):
    """예측 모델 훈련"""
    try:
        # DataFrame 생성
        import pandas as pd
        training_data = pd.DataFrame(request.training_data)

        result = advanced_ai.prediction_engine.train_model(
            request.model_type,
            training_data,
            request.target_column,
            request.model_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models")
async def get_models():
    """훈련된 모델 목록 조회"""
    try:
        models = {}
        for model_name, model_info in (
            advanced_ai.prediction_engine.models.items()
        ):
            models[model_name] = {
                'model_type': model_info['model_type'],
                'target_column': model_info['target_column'],
                'mean_cv_score': model_info['mean_cv_score'],
                'trained_at': model_info['trained_at']
            }
        return models
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    _p = int(os.environ.get("ADVANCED_AI_FEATURES_PORT", os.environ.get("PORT", "8011")))
    uvicorn.run(app, host="0.0.0.0", port=_p)