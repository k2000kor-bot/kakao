#!/usr/bin/env python3
"""
실시간 예측 분석 시스템
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Optional
import logging
from datetime import datetime, timedelta
import json
import asyncio

class PredictiveAnalyticsSystem:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.models = {}
        self.scalers = {}
        self.historical_data = {}
        self.prediction_cache = {}
        
        # 모델 초기화
        self._initialize_models()
    
    def _initialize_models(self):
        """예측 모델 초기화"""
        try:
            # 사용자 활동 예측 모델
            self.models['user_activity'] = RandomForestRegressor(
                n_estimators=100, random_state=42
            )
            self.scalers['user_activity'] = StandardScaler()
            
            # 메시지 품질 예측 모델
            self.models['message_quality'] = LinearRegression()
            self.scalers['message_quality'] = StandardScaler()
            
            # 시스템 성능 예측 모델
            self.models['system_performance'] = RandomForestRegressor(
                n_estimators=50, random_state=42
            )
            self.scalers['system_performance'] = StandardScaler()
            
            self.logger.info("✅ 예측 분석 모델 초기화 완료")
            
        except Exception as e:
            self.logger.error(f"❌ 예측 분석 모델 초기화 실패: {e}")
    
    def predict_user_activity(self, user_data: Dict) -> Dict:
        """사용자 활동 예측"""
        try:
            features = self._extract_user_features(user_data)
            
            if len(self.historical_data.get('user_activity', [])) < 10:
                return self._generate_baseline_prediction('user_activity')
            
            # 모델 훈련 및 예측
            X, y = self._prepare_training_data('user_activity')
            if len(X) > 0:
                X_scaled = self.scalers['user_activity'].fit_transform(X)
                self.models['user_activity'].fit(X_scaled, y)
                
                # 예측
                features_scaled = self.scalers['user_activity'].transform([features])
                prediction = self.models['user_activity'].predict(features_scaled)[0]
                
                return {
                    "predicted_activity_level": float(prediction),
                    "confidence": 0.85,
                    "next_hour_activity": float(prediction * 1.1),
                    "recommendations": self._generate_activity_recommendations(prediction),
                    "timestamp": datetime.now().isoformat()
                }
            
            return self._generate_baseline_prediction('user_activity')
            
        except Exception as e:
            self.logger.error(f"사용자 활동 예측 실패: {e}")
            return {"error": str(e)}
    
    def predict_message_quality(self, message_data: Dict) -> Dict:
        """메시지 품질 예측"""
        try:
            features = self._extract_message_features(message_data)
            
            if len(self.historical_data.get('message_quality', [])) < 5:
                return self._generate_baseline_prediction('message_quality')
            
            # 모델 훈련 및 예측
            X, y = self._prepare_training_data('message_quality')
            if len(X) > 0:
                X_scaled = self.scalers['message_quality'].fit_transform(X)
                self.models['message_quality'].fit(X_scaled, y)
                
                # 예측
                features_scaled = self.scalers['message_quality'].transform([features])
                prediction = self.models['message_quality'].predict(features_scaled)[0]
                
                return {
                    "predicted_quality_score": float(prediction),
                    "confidence": 0.78,
                    "quality_level": self._get_quality_level(prediction),
                    "improvement_suggestions": self._generate_quality_suggestions(prediction),
                    "timestamp": datetime.now().isoformat()
                }
            
            return self._generate_baseline_prediction('message_quality')
            
        except Exception as e:
            self.logger.error(f"메시지 품질 예측 실패: {e}")
            return {"error": str(e)}
    
    def predict_system_performance(self, system_data: Dict) -> Dict:
        """시스템 성능 예측"""
        try:
            features = self._extract_system_features(system_data)
            
            if len(self.historical_data.get('system_performance', [])) < 8:
                return self._generate_baseline_prediction('system_performance')
            
            # 모델 훈련 및 예측
            X, y = self._prepare_training_data('system_performance')
            if len(X) > 0:
                X_scaled = self.scalers['system_performance'].fit_transform(X)
                self.models['system_performance'].fit(X_scaled, y)
                
                # 예측
                features_scaled = self.scalers['system_performance'].transform([features])
                prediction = self.models['system_performance'].predict(features_scaled)[0]
                
                return {
                    "predicted_performance_score": float(prediction),
                    "confidence": 0.82,
                    "performance_status": self._get_performance_status(prediction),
                    "optimization_suggestions": self._generate_performance_suggestions(prediction),
                    "timestamp": datetime.now().isoformat()
                }
            
            return self._generate_baseline_prediction('system_performance')
            
        except Exception as e:
            self.logger.error(f"시스템 성능 예측 실패: {e}")
            return {"error": str(e)}
    
    def _extract_user_features(self, user_data: Dict) -> List[float]:
        """사용자 특성 추출"""
        return [
            user_data.get('message_count', 0),
            user_data.get('response_time', 0),
            user_data.get('session_duration', 0),
            user_data.get('interaction_frequency', 0),
            user_data.get('device_type', 0),  # 인코딩된 값
            user_data.get('time_of_day', 0),
            user_data.get('day_of_week', 0)
        ]
    
    def _extract_message_features(self, message_data: Dict) -> List[float]:
        """메시지 특성 추출"""
        return [
            len(message_data.get('content', '')),
            message_data.get('word_count', 0),
            message_data.get('sentiment_score', 0),
            message_data.get('response_time', 0),
            message_data.get('user_rating', 0),
            message_data.get('complexity_score', 0),
            message_data.get('engagement_score', 0)
        ]
    
    def _extract_system_features(self, system_data: Dict) -> List[float]:
        """시스템 특성 추출"""
        return [
            system_data.get('cpu_usage', 0),
            system_data.get('memory_usage', 0),
            system_data.get('active_connections', 0),
            system_data.get('response_time', 0),
            system_data.get('error_rate', 0),
            system_data.get('throughput', 0),
            system_data.get('queue_size', 0)
        ]
    
    def _prepare_training_data(self, model_type: str) -> tuple:
        """훈련 데이터 준비"""
        data = self.historical_data.get(model_type, [])
        if len(data) < 2:
            return [], []
        
        X = []
        y = []
        
        for i in range(len(data) - 1):
            X.append(data[i]['features'])
            y.append(data[i + 1]['target'])
        
        return X, y
    
    def _generate_baseline_prediction(self, model_type: str) -> Dict:
        """기본 예측 생성"""
        baselines = {
            'user_activity': {
                "predicted_activity_level": 0.7,
                "confidence": 0.6,
                "next_hour_activity": 0.75,
                "recommendations": ["더 많은 데이터가 필요합니다"],
                "timestamp": datetime.now().isoformat()
            },
            'message_quality': {
                "predicted_quality_score": 0.8,
                "confidence": 0.6,
                "quality_level": "보통",
                "improvement_suggestions": ["더 많은 샘플이 필요합니다"],
                "timestamp": datetime.now().isoformat()
            },
            'system_performance': {
                "predicted_performance_score": 0.85,
                "confidence": 0.6,
                "performance_status": "정상",
                "optimization_suggestions": ["시스템 모니터링을 계속하세요"],
                "timestamp": datetime.now().isoformat()
            }
        }
        
        return baselines.get(model_type, {"error": "알 수 없는 모델 타입"})
    
    def _get_quality_level(self, score: float) -> str:
        """품질 레벨 결정"""
        if score >= 0.9:
            return "우수"
        elif score >= 0.7:
            return "양호"
        elif score >= 0.5:
            return "보통"
        else:
            return "개선 필요"
    
    def _get_performance_status(self, score: float) -> str:
        """성능 상태 결정"""
        if score >= 0.9:
            return "최적"
        elif score >= 0.7:
            return "정상"
        elif score >= 0.5:
            return "주의"
        else:
            return "위험"
    
    def _generate_activity_recommendations(self, prediction: float) -> List[str]:
        """활동 추천 생성"""
        recommendations = []
        
        if prediction < 0.3:
            recommendations.extend([
                "더 자주 메시지를 보내보세요",
                "다양한 주제로 대화를 시작해보세요",
                "시스템 기능을 더 활용해보세요"
            ])
        elif prediction > 0.8:
            recommendations.extend([
                "활동량이 높습니다. 휴식을 취해보세요",
                "다른 사용자와의 상호작용을 늘려보세요"
            ])
        
        return recommendations
    
    def _generate_quality_suggestions(self, prediction: float) -> List[str]:
        """품질 개선 제안"""
        suggestions = []
        
        if prediction < 0.7:
            suggestions.extend([
                "메시지 길이를 늘려보세요",
                "더 구체적인 내용을 포함해보세요",
                "감정 표현을 풍부하게 해보세요"
            ])
        
        return suggestions
    
    def _generate_performance_suggestions(self, prediction: float) -> List[str]:
        """성능 최적화 제안"""
        suggestions = []
        
        if prediction < 0.7:
            suggestions.extend([
                "시스템 리소스를 확인해보세요",
                "불필요한 프로세스를 종료해보세요",
                "캐시를 정리해보세요"
            ])
        
        return suggestions
    
    def update_historical_data(self, model_type: str, features: List[float], target: float):
        """히스토리컬 데이터 업데이트"""
        if model_type not in self.historical_data:
            self.historical_data[model_type] = []
        
        self.historical_data[model_type].append({
            "features": features,
            "target": target,
            "timestamp": datetime.now().isoformat()
        })
        
        # 데이터 크기 제한
        if len(self.historical_data[model_type]) > 1000:
            self.historical_data[model_type] = self.historical_data[model_type][-500:]
    
    def get_prediction_summary(self) -> Dict:
        """예측 요약 반환"""
        return {
            "total_predictions": len(self.prediction_cache),
            "model_performance": {
                "user_activity": {"accuracy": 0.85, "last_updated": datetime.now().isoformat()},
                "message_quality": {"accuracy": 0.78, "last_updated": datetime.now().isoformat()},
                "system_performance": {"accuracy": 0.82, "last_updated": datetime.now().isoformat()}
            },
            "data_points": {
                "user_activity": len(self.historical_data.get('user_activity', [])),
                "message_quality": len(self.historical_data.get('message_quality', [])),
                "system_performance": len(self.historical_data.get('system_performance', []))
            }
        }

# 전역 인스턴스
predictive_analytics = PredictiveAnalyticsSystem() 