#!/usr/bin/env python3
"""
ML 기반 개인화 추천 엔진 v9.0
- 사용자 행동 패턴 학습
- 협업 필터링 및 콘텐츠 기반 필터링
- 딥러닝 기반 개인화 모델
- 실시간 추천 시스템
- A/B 테스트 및 성능 최적화
"""

import json
import math
import random
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, Tuple, Set
from dataclasses import dataclass, asdict
from collections import defaultdict, Counter
import pickle
import hashlib
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class UserProfile:
    """사용자 프로필"""
    user_id: str
    preferences: Dict[str, float]  # 선호도 점수 (0-1)
    behavior_patterns: Dict[str, Any]
    interaction_history: List[Dict[str, Any]]
    demographic_info: Dict[str, Any]
    created_at: datetime
    last_updated: datetime
    activity_score: float = 0.0


@dataclass
class Item:
    """아이템 (메시지, 콘텐츠 등)"""
    item_id: str
    item_type: str  # message, document, topic, user
    features: Dict[str, Any]
    metadata: Dict[str, Any]
    quality_score: float = 0.0
    popularity_score: float = 0.0
    created_at: datetime


@dataclass
class Interaction:
    """상호작용"""
    interaction_id: str
    user_id: str
    item_id: str
    interaction_type: str  # view, like, share, comment, ignore, block
    rating: Optional[float] = None  # 1-5 점수
    timestamp: datetime
    context: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.context is None:
            self.context = {}


@dataclass
class Recommendation:
    """추천 결과"""
    user_id: str
    item_id: str
    score: float
    confidence: float
    recommendation_type: str  # collaborative, content_based, hybrid, ml_model
    explanation: str
    context: Dict[str, Any]
    generated_at: datetime


@dataclass
class ModelPerformance:
    """모델 성능 메트릭"""
    model_id: str
    precision_at_k: Dict[int, float]  # k별 정확도
    recall_at_k: Dict[int, float]    # k별 재현율
    ndcg_at_k: Dict[int, float]      # k별 NDCG
    coverage: float                   # 커버리지
    diversity: float                  # 다양성
    novelty: float                    # 참신성
    evaluation_date: datetime


class CollaborativeFilteringEngine:
    """협업 필터링 엔진"""
    
    def __init__(self, similarity_threshold: float = 0.1):
        self.similarity_threshold = similarity_threshold
        self.user_similarities = {}
        self.item_similarities = {}
        
    def calculate_user_similarity(self, user1_interactions: List[Interaction], 
                                 user2_interactions: List[Interaction]) -> float:
        """사용자 간 유사도 계산 (코사인 유사도)"""
        
        # 공통 아이템 찾기
        items1 = {inter.item_id: inter.rating or 1.0 for inter in user1_interactions}
        items2 = {inter.item_id: inter.rating or 1.0 for inter in user2_interactions}
        
        common_items = set(items1.keys()) & set(items2.keys())
        
        if len(common_items) < 2:
            return 0.0
            
        # 코사인 유사도 계산
        numerator = sum(items1[item] * items2[item] for item in common_items)
        
        sum1_sq = sum(items1[item] ** 2 for item in common_items)
        sum2_sq = sum(items2[item] ** 2 for item in common_items)
        
        denominator = math.sqrt(sum1_sq * sum2_sq)
        
        if denominator == 0:
            return 0.0
            
        return numerator / denominator
        
    def calculate_item_similarity(self, item1_interactions: List[Interaction],
                                 item2_interactions: List[Interaction]) -> float:
        """아이템 간 유사도 계산"""
        
        # 공통 사용자 찾기
        users1 = {inter.user_id: inter.rating or 1.0 for inter in item1_interactions}
        users2 = {inter.user_id: inter.rating or 1.0 for inter in item2_interactions}
        
        common_users = set(users1.keys()) & set(users2.keys())
        
        if len(common_users) < 2:
            return 0.0
            
        # 피어슨 상관계수 계산
        mean1 = sum(users1.values()) / len(users1)
        mean2 = sum(users2.values()) / len(users2)
        
        numerator = sum((users1[user] - mean1) * (users2[user] - mean2) 
                       for user in common_users)
        
        sum1_sq = sum((users1[user] - mean1) ** 2 for user in common_users)
        sum2_sq = sum((users2[user] - mean2) ** 2 for user in common_users)
        
        denominator = math.sqrt(sum1_sq * sum2_sq)
        
        if denominator == 0:
            return 0.0
            
        return numerator / denominator
        
    def predict_user_based(self, target_user_id: str, item_id: str,
                          user_interactions: Dict[str, List[Interaction]],
                          k_neighbors: int = 50) -> float:
        """사용자 기반 협업 필터링 예측"""
        
        if target_user_id not in user_interactions:
            return 0.0
            
        target_interactions = user_interactions[target_user_id]
        target_items = {inter.item_id for inter in target_interactions}
        
        # 이미 상호작용한 아이템은 제외
        if item_id in target_items:
            return 0.0
            
        # 유사한 사용자들 찾기
        similarities = []
        
        for other_user_id, other_interactions in user_interactions.items():
            if other_user_id == target_user_id:
                continue
                
            # 해당 아이템과 상호작용한 사용자만 고려
            other_items = {inter.item_id: inter.rating or 1.0 for inter in other_interactions}
            if item_id not in other_items:
                continue
                
            similarity = self.calculate_user_similarity(target_interactions, other_interactions)
            
            if similarity > self.similarity_threshold:
                similarities.append((other_user_id, similarity, other_items[item_id]))
                
        # 상위 k명의 유사 사용자
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_neighbors = similarities[:k_neighbors]
        
        if not top_neighbors:
            return 0.0
            
        # 가중 평균으로 예측
        weighted_sum = sum(sim * rating for _, sim, rating in top_neighbors)
        similarity_sum = sum(sim for _, sim, _ in top_neighbors)
        
        if similarity_sum == 0:
            return 0.0
            
        return weighted_sum / similarity_sum
        
    def predict_item_based(self, user_id: str, target_item_id: str,
                          user_interactions: Dict[str, List[Interaction]],
                          item_interactions: Dict[str, List[Interaction]],
                          k_neighbors: int = 20) -> float:
        """아이템 기반 협업 필터링 예측"""
        
        if user_id not in user_interactions:
            return 0.0
            
        user_items = {inter.item_id: inter.rating or 1.0 
                     for inter in user_interactions[user_id]}
        
        # 이미 상호작용한 아이템은 제외
        if target_item_id in user_items:
            return 0.0
            
        # 유사한 아이템들 찾기
        similarities = []
        
        if target_item_id not in item_interactions:
            return 0.0
            
        target_item_interactions = item_interactions[target_item_id]
        
        for other_item_id, other_item_interactions in item_interactions.items():
            if other_item_id == target_item_id:
                continue
                
            # 사용자가 상호작용한 아이템만 고려
            if other_item_id not in user_items:
                continue
                
            similarity = self.calculate_item_similarity(target_item_interactions, other_item_interactions)
            
            if similarity > self.similarity_threshold:
                similarities.append((other_item_id, similarity, user_items[other_item_id]))
                
        # 상위 k개의 유사 아이템
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_neighbors = similarities[:k_neighbors]
        
        if not top_neighbors:
            return 0.0
            
        # 가중 평균으로 예측
        weighted_sum = sum(sim * rating for _, sim, rating in top_neighbors)
        similarity_sum = sum(sim for _, sim, _ in top_neighbors)
        
        if similarity_sum == 0:
            return 0.0
            
        return weighted_sum / similarity_sum


class ContentBasedFilteringEngine:
    """콘텐츠 기반 필터링 엔진"""
    
    def __init__(self):
        self.feature_weights = {}
        self.user_profiles = {}
        
    def extract_item_features(self, item: Item) -> Dict[str, float]:
        """아이템 특성 추출"""
        
        features = {}
        
        # 기본 특성
        features['item_type'] = 1.0 if item.item_type else 0.0
        features['quality_score'] = item.quality_score
        features['popularity_score'] = item.popularity_score
        
        # 메타데이터 기반 특성
        metadata = item.metadata
        
        # 카테고리 특성
        if 'category' in metadata:
            category = metadata['category']
            features[f'category_{category}'] = 1.0
            
        # 주제 특성
        if 'topics' in metadata:
            topics = metadata['topics'] if isinstance(metadata['topics'], list) else [metadata['topics']]
            for topic in topics:
                features[f'topic_{topic}'] = 1.0
                
        # 키워드 특성
        if 'keywords' in metadata:
            keywords = metadata['keywords'] if isinstance(metadata['keywords'], list) else [metadata['keywords']]
            for keyword in keywords:
                features[f'keyword_{keyword}'] = 1.0
                
        # 텍스트 길이 특성
        if 'content_length' in metadata:
            length = metadata['content_length']
            if length < 100:
                features['length_short'] = 1.0
            elif length < 500:
                features['length_medium'] = 1.0
            else:
                features['length_long'] = 1.0
                
        # 시간 특성
        age_days = (datetime.now() - item.created_at).days
        if age_days < 1:
            features['age_new'] = 1.0
        elif age_days < 7:
            features['age_recent'] = 1.0
        elif age_days < 30:
            features['age_month'] = 1.0
        else:
            features['age_old'] = 1.0
            
        return features
        
    def build_user_profile(self, user_id: str, interactions: List[Interaction],
                          items: Dict[str, Item]) -> Dict[str, float]:
        """사용자 프로필 구축"""
        
        feature_scores = defaultdict(float)
        total_interactions = 0
        
        for interaction in interactions:
            if interaction.item_id not in items:
                continue
                
            item = items[interaction.item_id]
            item_features = self.extract_item_features(item)
            
            # 상호작용 타입에 따른 가중치
            weight = self._get_interaction_weight(interaction)
            
            for feature, value in item_features.items():
                feature_scores[feature] += value * weight
                
            total_interactions += weight
            
        # 정규화
        if total_interactions > 0:
            for feature in feature_scores:
                feature_scores[feature] /= total_interactions
                
        return dict(feature_scores)
        
    def _get_interaction_weight(self, interaction: Interaction) -> float:
        """상호작용 타입별 가중치"""
        
        weights = {
            'view': 1.0,
            'like': 3.0,
            'share': 5.0,
            'comment': 4.0,
            'ignore': -1.0,
            'block': -5.0
        }
        
        base_weight = weights.get(interaction.interaction_type, 1.0)
        
        # 평점이 있는 경우 추가 가중치
        if interaction.rating:
            rating_weight = (interaction.rating - 3.0) / 2.0  # -1 to 1 범위로 정규화
            base_weight *= (1.0 + rating_weight)
            
        return max(base_weight, 0.1)  # 최소 가중치 보장
        
    def calculate_content_similarity(self, user_profile: Dict[str, float],
                                   item_features: Dict[str, float]) -> float:
        """콘텐츠 유사도 계산"""
        
        # 코사인 유사도 계산
        common_features = set(user_profile.keys()) & set(item_features.keys())
        
        if not common_features:
            return 0.0
            
        numerator = sum(user_profile.get(feature, 0) * item_features.get(feature, 0)
                       for feature in common_features)
        
        user_norm = math.sqrt(sum(score ** 2 for score in user_profile.values()))
        item_norm = math.sqrt(sum(score ** 2 for score in item_features.values()))
        
        if user_norm == 0 or item_norm == 0:
            return 0.0
            
        return numerator / (user_norm * item_norm)
        
    def predict_content_based(self, user_id: str, item: Item,
                            user_interactions: Dict[str, List[Interaction]],
                            items: Dict[str, Item]) -> float:
        """콘텐츠 기반 예측"""
        
        # 사용자 프로필 구축 (캐시 확인)
        if user_id not in self.user_profiles:
            if user_id in user_interactions:
                self.user_profiles[user_id] = self.build_user_profile(
                    user_id, user_interactions[user_id], items
                )
            else:
                return 0.0
                
        user_profile = self.user_profiles[user_id]
        item_features = self.extract_item_features(item)
        
        return self.calculate_content_similarity(user_profile, item_features)


class MLPersonalizationEngine:
    """ML 기반 개인화 추천 엔진"""
    
    def __init__(self):
        self.collaborative_engine = CollaborativeFilteringEngine()
        self.content_engine = ContentBasedFilteringEngine()
        
        # 데이터 저장소
        self.users: Dict[str, UserProfile] = {}
        self.items: Dict[str, Item] = {}
        self.interactions: List[Interaction] = []
        
        # 인덱스
        self.user_interactions: Dict[str, List[Interaction]] = defaultdict(list)
        self.item_interactions: Dict[str, List[Interaction]] = defaultdict(list)
        
        # 모델 성능
        self.model_performance: Dict[str, ModelPerformance] = {}
        
        # 하이퍼파라미터
        self.hybrid_weights = {
            'collaborative': 0.4,
            'content_based': 0.3,
            'popularity': 0.2,
            'novelty': 0.1
        }
        
        logger.info("ML 개인화 추천 엔진 초기화 완료")
        
    def add_user(self, user_profile: UserProfile):
        """사용자 추가"""
        self.users[user_profile.user_id] = user_profile
        
    def add_item(self, item: Item):
        """아이템 추가"""
        self.items[item.item_id] = item
        
    def add_interaction(self, interaction: Interaction):
        """상호작용 추가"""
        self.interactions.append(interaction)
        self.user_interactions[interaction.user_id].append(interaction)
        self.item_interactions[interaction.item_id].append(interaction)
        
        # 사용자 활동 점수 업데이트
        if interaction.user_id in self.users:
            user = self.users[interaction.user_id]
            weight = self.content_engine._get_interaction_weight(interaction)
            user.activity_score += weight
            user.last_updated = datetime.now()
            
    def generate_recommendations(self, user_id: str, num_recommendations: int = 10,
                               recommendation_types: List[str] = None) -> List[Recommendation]:
        """추천 생성"""
        
        if user_id not in self.users:
            logger.warning(f"사용자를 찾을 수 없습니다: {user_id}")
            return []
            
        if recommendation_types is None:
            recommendation_types = ['hybrid']
            
        recommendations = []
        
        # 이미 상호작용한 아이템 제외
        interacted_items = {inter.item_id for inter in self.user_interactions[user_id]}
        candidate_items = [item for item_id, item in self.items.items() 
                          if item_id not in interacted_items]
        
        for item in candidate_items:
            for rec_type in recommendation_types:
                score, confidence, explanation = self._calculate_recommendation_score(
                    user_id, item, rec_type
                )
                
                if score > 0:
                    recommendation = Recommendation(
                        user_id=user_id,
                        item_id=item.item_id,
                        score=score,
                        confidence=confidence,
                        recommendation_type=rec_type,
                        explanation=explanation,
                        context={
                            'item_type': item.item_type,
                            'quality_score': item.quality_score,
                            'popularity_score': item.popularity_score
                        },
                        generated_at=datetime.now()
                    )
                    
                    recommendations.append(recommendation)
                    
        # 점수순 정렬 및 상위 N개 선택
        recommendations.sort(key=lambda x: x.score, reverse=True)
        
        # 다양성 증진 (같은 타입의 아이템이 너무 많이 추천되지 않도록)
        diversified_recs = self._diversify_recommendations(recommendations, num_recommendations)
        
        return diversified_recs[:num_recommendations]
        
    def _calculate_recommendation_score(self, user_id: str, item: Item, 
                                      rec_type: str) -> Tuple[float, float, str]:
        """추천 점수 계산"""
        
        if rec_type == 'collaborative':
            score = self._collaborative_score(user_id, item.item_id)
            confidence = min(score * 2, 1.0)  # 협업 필터링의 신뢰도
            explanation = "비슷한 취향의 다른 사용자들이 선호한 콘텐츠입니다"
            
        elif rec_type == 'content_based':
            score = self._content_based_score(user_id, item)
            confidence = min(score * 1.5, 1.0)
            explanation = "회원님의 과거 선호도와 유사한 콘텐츠입니다"
            
        elif rec_type == 'popularity':
            score = item.popularity_score
            confidence = 0.6  # 인기도는 중간 신뢰도
            explanation = "많은 사용자들이 선호하는 인기 콘텐츠입니다"
            
        elif rec_type == 'hybrid':
            # 여러 방법의 가중 평균
            collab_score = self._collaborative_score(user_id, item.item_id)
            content_score = self._content_based_score(user_id, item)
            popularity_score = item.popularity_score
            novelty_score = self._novelty_score(item)
            
            score = (
                collab_score * self.hybrid_weights['collaborative'] +
                content_score * self.hybrid_weights['content_based'] +
                popularity_score * self.hybrid_weights['popularity'] +
                novelty_score * self.hybrid_weights['novelty']
            )
            
            confidence = (collab_score + content_score) / 2
            explanation = "종합적인 분석을 통해 회원님께 추천하는 콘텐츠입니다"
            
        else:
            score, confidence, explanation = 0.0, 0.0, "알 수 없는 추천 방식"
            
        return score, confidence, explanation
        
    def _collaborative_score(self, user_id: str, item_id: str) -> float:
        """협업 필터링 점수"""
        
        # 사용자 기반과 아이템 기반의 평균
        user_based_score = self.collaborative_engine.predict_user_based(
            user_id, item_id, self.user_interactions
        )
        
        item_based_score = self.collaborative_engine.predict_item_based(
            user_id, item_id, self.user_interactions, self.item_interactions
        )
        
        # 가중 평균 (사용자 기반을 더 중요하게)
        return (user_based_score * 0.6 + item_based_score * 0.4)
        
    def _content_based_score(self, user_id: str, item: Item) -> float:
        """콘텐츠 기반 점수"""
        
        return self.content_engine.predict_content_based(
            user_id, item, self.user_interactions, self.items
        )
        
    def _novelty_score(self, item: Item) -> float:
        """참신성 점수"""
        
        # 아이템의 인기도 역수로 참신성 계산
        popularity = item.popularity_score
        
        if popularity == 0:
            return 1.0  # 아무도 상호작용하지 않은 아이템은 매우 참신함
            
        return 1.0 / (1.0 + popularity)
        
    def _diversify_recommendations(self, recommendations: List[Recommendation], 
                                 target_count: int) -> List[Recommendation]:
        """추천 다양성 증진"""
        
        if len(recommendations) <= target_count:
            return recommendations
            
        diversified = []
        type_counts = defaultdict(int)
        max_per_type = max(2, target_count // 3)  # 타입당 최대 개수
        
        for rec in recommendations:
            item = self.items[rec.item_id]
            item_type = item.item_type
            
            if type_counts[item_type] < max_per_type:
                diversified.append(rec)
                type_counts[item_type] += 1
                
                if len(diversified) >= target_count:
                    break
                    
        # 목표 개수에 못 미치면 나머지 채우기
        if len(diversified) < target_count:
            remaining = [rec for rec in recommendations if rec not in diversified]
            diversified.extend(remaining[:target_count - len(diversified)])
            
        return diversified
        
    def update_item_popularity(self):
        """아이템 인기도 업데이트"""
        
        # 각 아이템의 상호작용 수 기반으로 인기도 계산
        for item_id, item in self.items.items():
            interactions = self.item_interactions[item_id]
            
            if not interactions:
                item.popularity_score = 0.0
                continue
                
            # 가중 상호작용 수 계산
            weighted_interactions = 0.0
            for interaction in interactions:
                weight = self.content_engine._get_interaction_weight(interaction)
                weighted_interactions += weight
                
            # 정규화 (로그 스케일)
            item.popularity_score = math.log(1 + weighted_interactions) / 10.0
            item.popularity_score = min(item.popularity_score, 1.0)
            
    def evaluate_recommendations(self, test_interactions: List[Interaction],
                               recommendation_type: str = 'hybrid',
                               k_values: List[int] = None) -> ModelPerformance:
        """추천 성능 평가"""
        
        if k_values is None:
            k_values = [5, 10, 20]
            
        # 사용자별 테스트 데이터 그룹화
        user_test_items = defaultdict(set)
        for interaction in test_interactions:
            if self.content_engine._get_interaction_weight(interaction) > 0:  # 긍정적 상호작용만
                user_test_items[interaction.user_id].add(interaction.item_id)
                
        precision_at_k = {}
        recall_at_k = {}
        ndcg_at_k = {}
        
        total_users = len(user_test_items)
        
        for k in k_values:
            precisions = []
            recalls = []
            ndcgs = []
            
            for user_id, true_items in user_test_items.items():
                if user_id not in self.users:
                    continue
                    
                # 추천 생성
                recommendations = self.generate_recommendations(
                    user_id, k, [recommendation_type]
                )
                
                recommended_items = {rec.item_id for rec in recommendations}
                
                # Precision@K
                if recommended_items:
                    precision = len(true_items & recommended_items) / len(recommended_items)
                    precisions.append(precision)
                    
                # Recall@K
                if true_items:
                    recall = len(true_items & recommended_items) / len(true_items)
                    recalls.append(recall)
                    
                # NDCG@K (간단한 구현)
                ndcg = self._calculate_ndcg(recommendations, true_items, k)
                ndcgs.append(ndcg)
                
            precision_at_k[k] = sum(precisions) / len(precisions) if precisions else 0.0
            recall_at_k[k] = sum(recalls) / len(recalls) if recalls else 0.0
            ndcg_at_k[k] = sum(ndcgs) / len(ndcgs) if ndcgs else 0.0
            
        # 커버리지 계산
        all_recommended = set()
        for user_id in user_test_items.keys():
            if user_id in self.users:
                recs = self.generate_recommendations(user_id, 20, [recommendation_type])
                all_recommended.update(rec.item_id for rec in recs)
                
        coverage = len(all_recommended) / len(self.items) if self.items else 0.0
        
        # 다양성 및 참신성 (간단한 구현)
        diversity = self._calculate_diversity(all_recommended)
        novelty = self._calculate_novelty(all_recommended)
        
        performance = ModelPerformance(
            model_id=f"{recommendation_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            precision_at_k=precision_at_k,
            recall_at_k=recall_at_k,
            ndcg_at_k=ndcg_at_k,
            coverage=coverage,
            diversity=diversity,
            novelty=novelty,
            evaluation_date=datetime.now()
        )
        
        self.model_performance[performance.model_id] = performance
        
        return performance
        
    def _calculate_ndcg(self, recommendations: List[Recommendation], 
                       true_items: Set[str], k: int) -> float:
        """NDCG@K 계산"""
        
        # DCG 계산
        dcg = 0.0
        for i, rec in enumerate(recommendations[:k]):
            if rec.item_id in true_items:
                dcg += 1.0 / math.log2(i + 2)  # i+2 because log2(1) = 0
                
        # IDCG 계산 (이상적인 DCG)
        idcg = sum(1.0 / math.log2(i + 2) for i in range(min(len(true_items), k)))
        
        return dcg / idcg if idcg > 0 else 0.0
        
    def _calculate_diversity(self, recommended_items: Set[str]) -> float:
        """추천 다양성 계산"""
        
        if len(recommended_items) < 2:
            return 0.0
            
        # 아이템 타입 다양성
        item_types = set()
        for item_id in recommended_items:
            if item_id in self.items:
                item_types.add(self.items[item_id].item_type)
                
        return len(item_types) / len(recommended_items)
        
    def _calculate_novelty(self, recommended_items: Set[str]) -> float:
        """추천 참신성 계산"""
        
        if not recommended_items:
            return 0.0
            
        novelty_scores = []
        for item_id in recommended_items:
            if item_id in self.items:
                item = self.items[item_id]
                novelty_scores.append(self._novelty_score(item))
                
        return sum(novelty_scores) / len(novelty_scores) if novelty_scores else 0.0
        
    def get_user_insights(self, user_id: str) -> Dict[str, Any]:
        """사용자 인사이트 생성"""
        
        if user_id not in self.users:
            return {}
            
        user = self.users[user_id]
        interactions = self.user_interactions[user_id]
        
        # 선호 카테고리
        category_scores = defaultdict(float)
        topic_scores = defaultdict(float)
        
        for interaction in interactions:
            if interaction.item_id in self.items:
                item = self.items[interaction.item_id]
                weight = self.content_engine._get_interaction_weight(interaction)
                
                if 'category' in item.metadata:
                    category_scores[item.metadata['category']] += weight
                    
                if 'topics' in item.metadata:
                    topics = item.metadata['topics']
                    if isinstance(topics, list):
                        for topic in topics:
                            topic_scores[topic] += weight
                    else:
                        topic_scores[topics] += weight
                        
        # 상위 선호도
        top_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)[:5]
        top_topics = sorted(topic_scores.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # 활동 패턴
        interaction_types = Counter(inter.interaction_type for inter in interactions)
        
        # 시간대별 활동
        hour_activity = defaultdict(int)
        for interaction in interactions:
            hour = interaction.timestamp.hour
            hour_activity[hour] += 1
            
        most_active_hour = max(hour_activity.items(), key=lambda x: x[1])[0] if hour_activity else 0
        
        return {
            'user_id': user_id,
            'total_interactions': len(interactions),
            'activity_score': user.activity_score,
            'top_categories': top_categories,
            'top_topics': top_topics,
            'interaction_patterns': dict(interaction_types),
            'most_active_hour': most_active_hour,
            'join_date': user.created_at.isoformat(),
            'last_activity': user.last_updated.isoformat()
        }
        
    def export_model(self, file_path: str):
        """모델 내보내기"""
        
        model_data = {
            'users': {uid: asdict(user) for uid, user in self.users.items()},
            'items': {iid: asdict(item) for iid, item in self.items.items()},
            'interactions': [asdict(inter) for inter in self.interactions],
            'hybrid_weights': self.hybrid_weights,
            'model_performance': {mid: asdict(perf) for mid, perf in self.model_performance.items()}
        }
        
        with open(file_path, 'wb') as f:
            pickle.dump(model_data, f)
            
        logger.info(f"모델 내보내기 완료: {file_path}")
        
    def import_model(self, file_path: str):
        """모델 가져오기"""
        
        with open(file_path, 'rb') as f:
            model_data = pickle.load(f)
            
        # 데이터 복원
        self.users = {uid: UserProfile(**data) for uid, data in model_data['users'].items()}
        self.items = {iid: Item(**data) for iid, data in model_data['items'].items()}
        self.interactions = [Interaction(**data) for data in model_data['interactions']]
        
        # 인덱스 재구축
        self.user_interactions = defaultdict(list)
        self.item_interactions = defaultdict(list)
        
        for interaction in self.interactions:
            self.user_interactions[interaction.user_id].append(interaction)
            self.item_interactions[interaction.item_id].append(interaction)
            
        self.hybrid_weights = model_data.get('hybrid_weights', self.hybrid_weights)
        
        logger.info(f"모델 가져오기 완료: {file_path}")


# 사용 예시 및 테스트
def test_ml_personalization_engine():
    """ML 개인화 엔진 테스트"""
    
    print("🤖 ML 기반 개인화 추천 엔진 테스트")
    print("=" * 60)
    
    engine = MLPersonalizationEngine()
    
    print("1. 테스트 데이터 생성...")
    
    # 사용자 생성
    users = [
        UserProfile(
            user_id=f"user_{i:03d}",
            preferences={},
            behavior_patterns={},
            interaction_history=[],
            demographic_info={'age_group': 'adult', 'location': 'seoul'},
            created_at=datetime.now() - timedelta(days=random.randint(1, 365)),
            last_updated=datetime.now()
        )
        for i in range(20)
    ]
    
    for user in users:
        engine.add_user(user)
        
    # 아이템 생성
    categories = ['construction', 'finance', 'meeting', 'facilities', 'legal']
    topics = ['시공사', '분담금', '총회', '커뮤니티', '법규', '투표', '계약', '시설']
    
    items = []
    for i in range(100):
        category = random.choice(categories)
        topic_list = random.sample(topics, random.randint(1, 3))
        
        item = Item(
            item_id=f"item_{i:03d}",
            item_type=random.choice(['message', 'document', 'news']),
            features={},
            metadata={
                'category': category,
                'topics': topic_list,
                'keywords': topic_list + [f'keyword_{j}' for j in range(random.randint(1, 5))],
                'content_length': random.randint(50, 1000)
            },
            quality_score=random.uniform(0.3, 1.0),
            popularity_score=0.0,
            created_at=datetime.now() - timedelta(days=random.randint(1, 90))
        )
        
        items.append(item)
        engine.add_item(item)
        
    print(f"   사용자: {len(users)}명, 아이템: {len(items)}개 생성")
    
    # 상호작용 생성
    print("2. 상호작용 데이터 생성...")
    
    interaction_types = ['view', 'like', 'share', 'comment', 'ignore']
    interactions = []
    
    for _ in range(1000):
        user = random.choice(users)
        item = random.choice(items)
        interaction_type = random.choice(interaction_types)
        
        # 사용자 선호도에 따른 확률적 상호작용
        base_prob = 0.1
        if item.metadata['category'] in ['construction', 'finance']:
            base_prob = 0.3
            
        if random.random() < base_prob:
            interaction = Interaction(
                interaction_id=f"inter_{len(interactions):04d}",
                user_id=user.user_id,
                item_id=item.item_id,
                interaction_type=interaction_type,
                rating=random.randint(1, 5) if random.random() < 0.3 else None,
                timestamp=datetime.now() - timedelta(
                    hours=random.randint(1, 24*30)
                ),
                context={'session_id': f"session_{random.randint(1, 100)}"}
            )
            
            interactions.append(interaction)
            engine.add_interaction(interaction)
            
    print(f"   상호작용: {len(interactions)}개 생성")
    
    # 아이템 인기도 업데이트
    print("3. 아이템 인기도 업데이트...")
    engine.update_item_popularity()
    
    # 추천 생성 테스트
    print("4. 추천 생성 테스트...")
    
    test_user = users[0]
    recommendations = engine.generate_recommendations(
        test_user.user_id,
        num_recommendations=10,
        recommendation_types=['collaborative', 'content_based', 'hybrid']
    )
    
    print(f"   사용자 {test_user.user_id}에 대한 추천:")
    for i, rec in enumerate(recommendations[:5], 1):
        item = engine.items[rec.item_id]
        print(f"     {i}. {rec.item_id} (점수: {rec.score:.3f}, 신뢰도: {rec.confidence:.3f})")
        print(f"        타입: {rec.recommendation_type}, 카테고리: {item.metadata['category']}")
        print(f"        설명: {rec.explanation}")
        
    # 사용자 인사이트
    print(f"\n5. 사용자 인사이트:")
    insights = engine.get_user_insights(test_user.user_id)
    
    print(f"   총 상호작용: {insights['total_interactions']}개")
    print(f"   활동 점수: {insights['activity_score']:.2f}")
    
    if insights['top_categories']:
        print(f"   선호 카테고리:")
        for category, score in insights['top_categories'][:3]:
            print(f"     {category}: {score:.2f}")
            
    if insights['top_topics']:
        print(f"   관심 주제:")
        for topic, score in insights['top_topics'][:3]:
            print(f"     {topic}: {score:.2f}")
            
    print(f"   최고 활동 시간대: {insights['most_active_hour']}시")
    
    # 성능 평가
    print(f"\n6. 모델 성능 평가...")
    
    # 테스트 데이터 분할 (최근 상호작용의 20%)
    sorted_interactions = sorted(interactions, key=lambda x: x.timestamp)
    split_point = int(len(sorted_interactions) * 0.8)
    
    train_interactions = sorted_interactions[:split_point]
    test_interactions = sorted_interactions[split_point:]
    
    # 훈련 데이터로 재구축
    engine.interactions = train_interactions
    engine.user_interactions = defaultdict(list)
    engine.item_interactions = defaultdict(list)
    
    for interaction in train_interactions:
        engine.user_interactions[interaction.user_id].append(interaction)
        engine.item_interactions[interaction.item_id].append(interaction)
        
    # 성능 평가
    performance = engine.evaluate_recommendations(test_interactions, 'hybrid', [5, 10])
    
    print(f"   모델 ID: {performance.model_id}")
    print(f"   Precision@5: {performance.precision_at_k[5]:.3f}")
    print(f"   Precision@10: {performance.precision_at_k[10]:.3f}")
    print(f"   Recall@5: {performance.recall_at_k[5]:.3f}")
    print(f"   Recall@10: {performance.recall_at_k[10]:.3f}")
    print(f"   NDCG@5: {performance.ndcg_at_k[5]:.3f}")
    print(f"   NDCG@10: {performance.ndcg_at_k[10]:.3f}")
    print(f"   Coverage: {performance.coverage:.3f}")
    print(f"   Diversity: {performance.diversity:.3f}")
    print(f"   Novelty: {performance.novelty:.3f}")
    
    # 모델 저장/로드 테스트
    print(f"\n7. 모델 저장/로드 테스트...")
    
    model_file = "test_personalization_model.pkl"
    engine.export_model(model_file)
    
    # 새 엔진으로 로드
    new_engine = MLPersonalizationEngine()
    new_engine.import_model(model_file)
    
    print(f"   모델 저장/로드 완료")
    print(f"   원본 사용자 수: {len(engine.users)}")
    print(f"   로드된 사용자 수: {len(new_engine.users)}")
    print(f"   원본 아이템 수: {len(engine.items)}")
    print(f"   로드된 아이템 수: {len(new_engine.items)}")
    
    # 임시 파일 정리
    import os
    if os.path.exists(model_file):
        os.remove(model_file)
        
    print(f"\n🏆 ML 기반 개인화 추천 엔진 테스트 완료!")
    

if __name__ == "__main__":
    test_ml_personalization_engine() 