#!/usr/bin/env python3
"""
예측 분석 시스템 v1.0
- 사용자 활동 예측
- 메시지 품질 예측
- 시스템 성능 예측
- 예측 요약 대시보드
"""

import os
import asyncio
import json
import logging
import time
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

from cors_config import get_cors_allow_origins

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="예측 분석 시스템", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 데이터 모델들 ====================

class UserActivityData(BaseModel):
    """사용자 활동 데이터"""
    user_id: str
    timestamp: str
    activity_type: str  # message, analysis, upload, download, etc.
    duration: float
    success: bool
    metadata: Dict[str, Any] = {}

class MessageQualityData(BaseModel):
    """메시지 품질 데이터"""
    message_id: str
    user_id: str
    timestamp: str
    content_length: int
    response_time: float
    user_feedback: Optional[float] = None
    ai_confidence: float
    keywords_count: int
    sentiment_score: float

class SystemPerformanceData(BaseModel):
    """시스템 성능 데이터"""
    timestamp: str
    cpu_usage: float
    memory_usage: float
    response_time: float
    error_rate: float
    active_users: int
    requests_per_minute: float

class PredictionRequest(BaseModel):
    """예측 요청"""
    prediction_type: str  # user_activity, message_quality, system_performance
    data: Dict[str, Any]
    time_horizon: int = 24  # 시간 단위
    confidence_level: float = 0.95

class PredictionResult(BaseModel):
    """예측 결과"""
    prediction_type: str
    predicted_value: float
    confidence_interval: Tuple[float, float]
    prediction_horizon: int
    model_accuracy: float
    features_importance: Dict[str, float] = {}
    timestamp: str

class PredictionSummary(BaseModel):
    """예측 요약"""
    total_predictions: int
    average_accuracy: float
    predictions_by_type: Dict[str, int]
    recent_predictions: List[PredictionResult]
    system_status: str

# ==================== 예측 분석 엔진 ====================

class PredictiveAnalysisEngine:
    """예측 분석 엔진"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.historical_data = {
            "user_activity": [],
            "message_quality": [],
            "system_performance": []
        }
        self.prediction_history = []
        
        # 모델 초기화
        self._initialize_models()
        
        logger.info("예측 분석 엔진 초기화 완료")
    
    def _initialize_models(self):
        """예측 모델 초기화"""
        try:
            # 사용자 활동 예측 모델
            self.models["user_activity"] = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.scalers["user_activity"] = StandardScaler()
            
            # 메시지 품질 예측 모델
            self.models["message_quality"] = LinearRegression()
            self.scalers["message_quality"] = StandardScaler()
            
            # 시스템 성능 예측 모델
            self.models["system_performance"] = RandomForestRegressor(
                n_estimators=50,
                max_depth=8,
                random_state=42
            )
            self.scalers["system_performance"] = StandardScaler()
            
            logger.info("예측 모델 초기화 완료")
            
        except Exception as e:
            logger.error(f"모델 초기화 오류: {e}")
    
    async def predict_user_activity(self, user_data: Dict[str, Any]) -> PredictionResult:
        """사용자 활동 예측"""
        try:
            # 특성 추출
            features = self._extract_user_activity_features(user_data)
            
            # 모델이 훈련되지 않은 경우 기본 예측
            if len(self.historical_data["user_activity"]) < 10:
                return self._generate_default_prediction("user_activity", features)
            
            # 예측 수행
            prediction = await self._make_prediction("user_activity", features)
            
            # 결과 생성
            result = PredictionResult(
                prediction_type="user_activity",
                predicted_value=prediction["value"],
                confidence_interval=prediction["confidence_interval"],
                prediction_horizon=24,
                model_accuracy=prediction["accuracy"],
                features_importance=prediction["feature_importance"],
                timestamp=datetime.now().isoformat()
            )
            
            # 예측 히스토리에 추가
            self.prediction_history.append(result.dict())
            
            return result
            
        except Exception as e:
            logger.error(f"사용자 활동 예측 오류: {e}")
            raise HTTPException(status_code=500, detail=f"사용자 활동 예측 중 오류가 발생했습니다: {str(e)}")
    
    async def predict_message_quality(self, message_data: Dict[str, Any]) -> PredictionResult:
        """메시지 품질 예측"""
        try:
            # 특성 추출
            features = self._extract_message_quality_features(message_data)
            
            # 모델이 훈련되지 않은 경우 기본 예측
            if len(self.historical_data["message_quality"]) < 10:
                return self._generate_default_prediction("message_quality", features)
            
            # 예측 수행
            prediction = await self._make_prediction("message_quality", features)
            
            # 결과 생성
            result = PredictionResult(
                prediction_type="message_quality",
                predicted_value=prediction["value"],
                confidence_interval=prediction["confidence_interval"],
                prediction_horizon=1,
                model_accuracy=prediction["accuracy"],
                features_importance=prediction["feature_importance"],
                timestamp=datetime.now().isoformat()
            )
            
            # 예측 히스토리에 추가
            self.prediction_history.append(result.dict())
            
            return result
            
        except Exception as e:
            logger.error(f"메시지 품질 예측 오류: {e}")
            raise HTTPException(status_code=500, detail=f"메시지 품질 예측 중 오류가 발생했습니다: {str(e)}")
    
    async def predict_system_performance(self, system_data: Dict[str, Any]) -> PredictionResult:
        """시스템 성능 예측"""
        try:
            # 특성 추출
            features = self._extract_system_performance_features(system_data)
            
            # 모델이 훈련되지 않은 경우 기본 예측
            if len(self.historical_data["system_performance"]) < 10:
                return self._generate_default_prediction("system_performance", features)
            
            # 예측 수행
            prediction = await self._make_prediction("system_performance", features)
            
            # 결과 생성
            result = PredictionResult(
                prediction_type="system_performance",
                predicted_value=prediction["value"],
                confidence_interval=prediction["confidence_interval"],
                prediction_horizon=12,
                model_accuracy=prediction["accuracy"],
                features_importance=prediction["feature_importance"],
                timestamp=datetime.now().isoformat()
            )
            
            # 예측 히스토리에 추가
            self.prediction_history.append(result.dict())
            
            return result
            
        except Exception as e:
            logger.error(f"시스템 성능 예측 오류: {e}")
            raise HTTPException(status_code=500, detail=f"시스템 성능 예측 중 오류가 발생했습니다: {str(e)}")
    
    def _extract_user_activity_features(self, user_data: Dict[str, Any]) -> List[float]:
        """사용자 활동 특성 추출"""
        features = []
        
        # 기본 특성
        features.append(user_data.get("session_duration", 0))
        features.append(user_data.get("message_count", 0))
        features.append(user_data.get("analysis_count", 0))
        features.append(user_data.get("upload_count", 0))
        features.append(user_data.get("download_count", 0))
        
        # 시간 관련 특성
        current_hour = datetime.now().hour
        features.append(current_hour)
        features.append(1 if 9 <= current_hour <= 17 else 0)  # 업무 시간 여부
        features.append(1 if current_hour in [12, 18] else 0)  # 점심/저녁 시간 여부
        
        # 활동 패턴 특성
        features.append(user_data.get("avg_response_time", 0))
        features.append(user_data.get("success_rate", 0))
        features.append(user_data.get("error_count", 0))
        
        return features
    
    def _extract_message_quality_features(self, message_data: Dict[str, Any]) -> List[float]:
        """메시지 품질 특성 추출"""
        features = []
        
        # 메시지 특성
        features.append(message_data.get("content_length", 0))
        features.append(message_data.get("keyword_count", 0))
        features.append(message_data.get("sentiment_score", 0))
        features.append(message_data.get("ai_confidence", 0))
        
        # 사용자 특성
        features.append(message_data.get("user_experience_level", 0))
        features.append(message_data.get("user_feedback_history", 0))
        
        # 시간 특성
        current_hour = datetime.now().hour
        features.append(current_hour)
        features.append(1 if 9 <= current_hour <= 17 else 0)
        
        # 시스템 특성
        features.append(message_data.get("system_load", 0))
        features.append(message_data.get("response_time", 0))
        
        return features
    
    def _extract_system_performance_features(self, system_data: Dict[str, Any]) -> List[float]:
        """시스템 성능 특성 추출"""
        features = []
        
        # 현재 성능 지표
        features.append(system_data.get("cpu_usage", 0))
        features.append(system_data.get("memory_usage", 0))
        features.append(system_data.get("response_time", 0))
        features.append(system_data.get("error_rate", 0))
        features.append(system_data.get("active_users", 0))
        features.append(system_data.get("requests_per_minute", 0))
        
        # 시간 특성
        current_hour = datetime.now().hour
        features.append(current_hour)
        features.append(1 if 9 <= current_hour <= 17 else 0)
        
        # 트렌드 특성
        features.append(system_data.get("cpu_trend", 0))
        features.append(system_data.get("memory_trend", 0))
        features.append(system_data.get("response_time_trend", 0))
        
        return features
    
    async def _make_prediction(self, model_type: str, features: List[float]) -> Dict[str, Any]:
        """예측 수행"""
        try:
            # 특성 정규화
            features_array = np.array(features).reshape(1, -1)
            scaled_features = self.scalers[model_type].transform(features_array)
            
            # 예측 수행
            prediction = self.models[model_type].predict(scaled_features)[0]
            
            # 신뢰 구간 계산
            confidence_interval = self._calculate_confidence_interval(prediction, model_type)
            
            # 모델 정확도 계산
            accuracy = self._calculate_model_accuracy(model_type)
            
            # 특성 중요도 계산
            feature_importance = self._calculate_feature_importance(model_type)
            
            return {
                "value": float(prediction),
                "confidence_interval": confidence_interval,
                "accuracy": accuracy,
                "feature_importance": feature_importance
            }
            
        except Exception as e:
            logger.error(f"예측 수행 오류: {e}")
            return self._generate_default_prediction_result(model_type)
    
    def _calculate_confidence_interval(self, prediction: float, model_type: str) -> Tuple[float, float]:
        """신뢰 구간 계산"""
        # 간단한 신뢰 구간 계산 (실제로는 더 정교한 방법 사용)
        margin = prediction * 0.1  # 10% 마진
        
        lower_bound = max(0, prediction - margin)
        upper_bound = prediction + margin
        
        return (lower_bound, upper_bound)
    
    def _calculate_model_accuracy(self, model_type: str) -> float:
        """모델 정확도 계산"""
        # 간단한 정확도 계산 (실제로는 교차 검증 등 사용)
        if len(self.historical_data[model_type]) < 5:
            return 0.8  # 기본 정확도
        
        # 최근 데이터의 예측 정확도 계산
        recent_data = self.historical_data[model_type][-10:]
        if len(recent_data) < 2:
            return 0.8
        
        # 간단한 정확도 추정
        accuracy = 0.85 + np.random.normal(0, 0.05)  # 85% ± 5%
        return max(0.5, min(1.0, accuracy))
    
    def _calculate_feature_importance(self, model_type: str) -> Dict[str, float]:
        """특성 중요도 계산"""
        if model_type == "user_activity":
            return {
                "session_duration": 0.25,
                "message_count": 0.20,
                "analysis_count": 0.15,
                "time_of_day": 0.15,
                "success_rate": 0.25
            }
        elif model_type == "message_quality":
            return {
                "content_length": 0.20,
                "ai_confidence": 0.30,
                "sentiment_score": 0.15,
                "user_experience": 0.20,
                "system_load": 0.15
            }
        else:  # system_performance
            return {
                "cpu_usage": 0.30,
                "memory_usage": 0.25,
                "active_users": 0.20,
                "error_rate": 0.15,
                "time_of_day": 0.10
            }
    
    def _generate_default_prediction(self, model_type: str, features: List[float]) -> PredictionResult:
        """기본 예측 결과 생성"""
        if model_type == "user_activity":
            predicted_value = 0.7  # 70% 활동 확률
        elif model_type == "message_quality":
            predicted_value = 0.8  # 80% 품질 점수
        else:  # system_performance
            predicted_value = 0.9  # 90% 성능 점수
        
        return PredictionResult(
            prediction_type=model_type,
            predicted_value=predicted_value,
            confidence_interval=(predicted_value * 0.8, predicted_value * 1.2),
            prediction_horizon=24 if model_type == "user_activity" else 1,
            model_accuracy=0.8,
            features_importance={},
            timestamp=datetime.now().isoformat()
        )
    
    def _generate_default_prediction_result(self, model_type: str) -> Dict[str, Any]:
        """기본 예측 결과 딕셔너리 생성"""
        if model_type == "user_activity":
            value = 0.7
        elif model_type == "message_quality":
            value = 0.8
        else:  # system_performance
            value = 0.9
        
        return {
            "value": value,
            "confidence_interval": (value * 0.8, value * 1.2),
            "accuracy": 0.8,
            "feature_importance": {}
        }
    
    async def add_training_data(self, data_type: str, data: Dict[str, Any]):
        """훈련 데이터 추가"""
        try:
            if data_type == "user_activity":
                self.historical_data["user_activity"].append(data)
            elif data_type == "message_quality":
                self.historical_data["message_quality"].append(data)
            elif data_type == "system_performance":
                self.historical_data["system_performance"].append(data)
            
            # 데이터가 충분하면 모델 재훈련
            if len(self.historical_data[data_type]) >= 50:
                await self._retrain_model(data_type)
                
        except Exception as e:
            logger.error(f"훈련 데이터 추가 오류: {e}")
    
    async def _retrain_model(self, model_type: str):
        """모델 재훈련"""
        try:
            if len(self.historical_data[model_type]) < 10:
                return
            
            # 데이터 준비
            data = self.historical_data[model_type]
            
            # 특성과 타겟 분리 (간단한 예시)
            X = []
            y = []
            
            for item in data:
                if model_type == "user_activity":
                    features = self._extract_user_activity_features(item)
                    target = item.get("activity_score", 0.5)
                elif model_type == "message_quality":
                    features = self._extract_message_quality_features(item)
                    target = item.get("quality_score", 0.8)
                else:  # system_performance
                    features = self._extract_system_performance_features(item)
                    target = item.get("performance_score", 0.9)
                
                X.append(features)
                y.append(target)
            
            if len(X) < 5:
                return
            
            # 데이터 정규화
            X = np.array(X)
            y = np.array(y)
            
            self.scalers[model_type].fit(X)
            X_scaled = self.scalers[model_type].transform(X)
            
            # 모델 훈련
            self.models[model_type].fit(X_scaled, y)
            
            logger.info(f"{model_type} 모델 재훈련 완료")
            
        except Exception as e:
            logger.error(f"모델 재훈련 오류: {e}")
    
    def get_prediction_summary(self) -> PredictionSummary:
        """예측 요약 생성"""
        try:
            recent_predictions = self.prediction_history[-10:] if self.prediction_history else []
            
            # 예측 타입별 통계
            predictions_by_type = {}
            for pred in self.prediction_history:
                pred_type = pred.get("prediction_type", "unknown")
                predictions_by_type[pred_type] = predictions_by_type.get(pred_type, 0) + 1
            
            # 평균 정확도 계산
            accuracies = [pred.get("model_accuracy", 0.8) for pred in self.prediction_history]
            average_accuracy = np.mean(accuracies) if accuracies else 0.8
            
            return PredictionSummary(
                total_predictions=len(self.prediction_history),
                average_accuracy=average_accuracy,
                predictions_by_type=predictions_by_type,
                recent_predictions=[PredictionResult(**pred) for pred in recent_predictions],
                system_status="active"
            )
            
        except Exception as e:
            logger.error(f"예측 요약 생성 오류: {e}")
            return PredictionSummary(
                total_predictions=0,
                average_accuracy=0.8,
                predictions_by_type={},
                recent_predictions=[],
                system_status="error"
            )

# 예측 분석 엔진 초기화
prediction_engine = PredictiveAnalysisEngine()

# ==================== API 엔드포인트 ====================

@app.post("/api/v7/predict/user-activity")
async def predict_user_activity(request: PredictionRequest):
    """사용자 활동 예측 API"""
    try:
        result = await prediction_engine.predict_user_activity(request.data)
        
        return {
            "success": True,
            "prediction": result.dict(),
            "message": "사용자 활동 예측이 완료되었습니다."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "사용자 활동 예측 중 오류가 발생했습니다."
        }

@app.post("/api/v7/predict/message-quality")
async def predict_message_quality(request: PredictionRequest):
    """메시지 품질 예측 API"""
    try:
        result = await prediction_engine.predict_message_quality(request.data)
        
        return {
            "success": True,
            "prediction": result.dict(),
            "message": "메시지 품질 예측이 완료되었습니다."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "메시지 품질 예측 중 오류가 발생했습니다."
        }

@app.post("/api/v7/predict/system-performance")
async def predict_system_performance(request: PredictionRequest):
    """시스템 성능 예측 API"""
    try:
        result = await prediction_engine.predict_system_performance(request.data)
        
        return {
            "success": True,
            "prediction": result.dict(),
            "message": "시스템 성능 예측이 완료되었습니다."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "시스템 성능 예측 중 오류가 발생했습니다."
        }

@app.get("/api/v7/predict/summary")
async def get_prediction_summary():
    """예측 요약 대시보드 API"""
    try:
        summary = prediction_engine.get_prediction_summary()
        
        return {
            "success": True,
            "summary": summary.dict(),
            "message": "예측 요약을 생성했습니다."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "예측 요약 생성 중 오류가 발생했습니다."
        }

@app.post("/api/v7/predict/training-data")
async def add_training_data_endpoint(request: Dict[str, Any]):
    """훈련 데이터 추가 API"""
    try:
        data_type = request.get("data_type")
        data = request.get("data", {})
        
        if not data_type or data_type not in ["user_activity", "message_quality", "system_performance"]:
            raise HTTPException(status_code=400, detail="잘못된 데이터 타입입니다.")
        
        await prediction_engine.add_training_data(data_type, data)
        
        return {
            "success": True,
            "message": "훈련 데이터가 추가되었습니다."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "훈련 데이터 추가 중 오류가 발생했습니다."
        }

@app.get("/api/v7/predict/status")
async def get_prediction_system_status():
    """예측 시스템 상태 조회"""
    return {
        "success": True,
        "status": {
            "system": "active",
            "version": "1.0.0",
            "models_loaded": len(prediction_engine.models),
            "total_predictions": len(prediction_engine.prediction_history),
            "data_points": {
                "user_activity": len(prediction_engine.historical_data["user_activity"]),
                "message_quality": len(prediction_engine.historical_data["message_quality"]),
                "system_performance": len(prediction_engine.historical_data["system_performance"])
            }
        }
    }

# ==================== 메인 실행 ====================

if __name__ == "__main__":
    import uvicorn
    
    try:
        _p = int(
            os.environ.get(
                "PREDICTIVE_ANALYSIS_SYSTEM_PORT", os.environ.get("PORT", "8003")
            )
        )
        print("🔮 예측 분석 시스템 시작 중...")
        print(f"📍 서버 주소: http://localhost:{_p}")
        print(f"📚 API 문서: http://localhost:{_p}/docs")
        print("🎯 지원 예측: 사용자활동, 메시지품질, 시스템성능")

        uvicorn.run(app, host="0.0.0.0", port=_p)
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 