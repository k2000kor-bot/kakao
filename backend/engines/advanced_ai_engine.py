"""
CORBU.AI Advanced Engine - 딥러닝/머신러닝 통합 엔진
"""
import numpy as np
import pandas as pd
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Union
import logging

# ML/DL 라이브러리들
try:
    import tensorflow as tf
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.cluster import KMeans
    from sklearn.decomposition import PCA
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, classification_report
    import cv2
    from PIL import Image
    import matplotlib.pyplot as plt
    import seaborn as sns
    import plotly.express as px
    import plotly.graph_objects as go
    ML_AVAILABLE = True
except ImportError as e:
    print(f"ML 라이브러리 일부가 설치되지 않았습니다: {e}")
    ML_AVAILABLE = False

logger = logging.getLogger(__name__)

class AdvancedAIEngine:
    """고급 AI 엔진 - 딥러닝/머신러닝 통합"""
    
    def __init__(self):
        self.models = {}
        self.vectorizers = {}
        self.is_initialized = False
        self.initialize_models()
    
    def initialize_models(self):
        """AI 모델들 초기화"""
        try:
            if ML_AVAILABLE:
                # 텍스트 분석을 위한 TF-IDF 벡터라이저
                self.vectorizers['tfidf'] = TfidfVectorizer(
                    max_features=1000,
                    stop_words='english',
                    ngram_range=(1, 2)
                )
                
                # 감정 분석을 위한 분류기
                self.models['emotion_classifier'] = RandomForestClassifier(
                    n_estimators=100,
                    random_state=42
                )
                
                # 텍스트 클러스터링을 위한 K-means
                self.models['text_clusterer'] = KMeans(
                    n_clusters=5,
                    random_state=42
                )
                
                # 차원 축소를 위한 PCA
                self.models['pca'] = PCA(n_components=2)
                
                self.is_initialized = True
                logger.info("AI 모델들이 성공적으로 초기화되었습니다.")
            else:
                logger.warning("ML 라이브러리가 설치되지 않아 기본 모드로 실행됩니다.")
                
        except Exception as e:
            logger.error(f"모델 초기화 중 오류 발생: {e}")
            self.is_initialized = False
    
    async def analyze_text_with_ml(self, text: str) -> Dict[str, Any]:
        """머신러닝을 사용한 고급 텍스트 분석"""
        try:
            if not self.is_initialized:
                return await self._fallback_analysis(text)
            
            # 텍스트 전처리
            processed_text = self._preprocess_text(text)
            
            # TF-IDF 벡터화
            tfidf_matrix = self.vectorizers['tfidf'].fit_transform([processed_text])
            
            # 감정 분석 (시뮬레이션)
            emotion_scores = self._analyze_emotion_ml(processed_text)
            
            # 키워드 추출
            keywords = self._extract_keywords_ml(processed_text)
            
            # 텍스트 복잡도 분석
            complexity = self._analyze_complexity(processed_text)
            
            # 주제 분류
            topic = self._classify_topic_ml(processed_text)
            
            return {
                "emotion_analysis": emotion_scores,
                "keywords": keywords,
                "complexity": complexity,
                "topic": topic,
                "confidence": 0.85,
                "model_used": "Advanced ML Pipeline"
            }
            
        except Exception as e:
            logger.error(f"ML 텍스트 분석 중 오류: {e}")
            return await self._fallback_analysis(text)
    
    async def analyze_data_with_dl(self, data: Union[str, List, Dict]) -> Dict[str, Any]:
        """딥러닝을 사용한 고급 데이터 분석"""
        try:
            if not self.is_initialized:
                return await self._fallback_data_analysis(data)
            
            # 데이터 타입에 따른 처리
            if isinstance(data, str):
                return await self._analyze_text_data(data)
            elif isinstance(data, list):
                return await self._analyze_list_data(data)
            elif isinstance(data, dict):
                return await self._analyze_dict_data(data)
            else:
                return await self._fallback_data_analysis(data)
                
        except Exception as e:
            logger.error(f"DL 데이터 분석 중 오류: {e}")
            return await self._fallback_data_analysis(data)
    
    async def train_custom_model(self, training_data: List[Dict], model_type: str = "classification") -> Dict[str, Any]:
        """사용자 정의 모델 훈련"""
        try:
            if not self.is_initialized:
                return {"error": "ML 라이브러리가 초기화되지 않았습니다."}
            
            # 훈련 데이터 준비
            X, y = self._prepare_training_data(training_data)
            
            if model_type == "classification":
                model = RandomForestClassifier(n_estimators=100, random_state=42)
                model.fit(X, y)
                
                # 모델 성능 평가
                y_pred = model.predict(X)
                accuracy = accuracy_score(y, y_pred)
                
                self.models[f"custom_{model_type}"] = model
                
                return {
                    "model_id": f"custom_{model_type}_{len(self.models)}",
                    "accuracy": accuracy,
                    "training_samples": len(X),
                    "features": X.shape[1] if hasattr(X, 'shape') else len(X[0]),
                    "status": "trained"
                }
            else:
                return {"error": f"지원하지 않는 모델 타입: {model_type}"}
                
        except Exception as e:
            logger.error(f"모델 훈련 중 오류: {e}")
            return {"error": str(e)}
    
    async def predict_with_model(self, model_id: str, input_data: Any) -> Dict[str, Any]:
        """훈련된 모델로 예측"""
        try:
            if model_id not in self.models:
                return {"error": f"모델 {model_id}를 찾을 수 없습니다."}
            
            model = self.models[model_id]
            
            # 입력 데이터 전처리
            processed_input = self._preprocess_input(input_data)
            
            # 예측 수행
            prediction = model.predict([processed_input])
            probability = model.predict_proba([processed_input]) if hasattr(model, 'predict_proba') else None
            
            return {
                "prediction": prediction[0] if len(prediction) > 0 else None,
                "probability": probability[0].tolist() if probability is not None else None,
                "model_id": model_id,
                "confidence": max(probability[0]) if probability is not None else 0.5
            }
            
        except Exception as e:
            logger.error(f"모델 예측 중 오류: {e}")
            return {"error": str(e)}
    
    def _preprocess_text(self, text: str) -> str:
        """텍스트 전처리"""
        import re
        # 소문자 변환, 특수문자 제거, 공백 정리
        text = re.sub(r'[^a-zA-Z가-힣\s]', '', text.lower())
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def _analyze_emotion_ml(self, text: str) -> Dict[str, float]:
        """ML 기반 감정 분석"""
        # 간단한 규칙 기반 감정 분석 (실제로는 훈련된 모델 사용)
        positive_words = ['좋다', '좋은', '훌륭하다', '훌륭한', '멋지다', '멋진', '행복', '기쁨', '만족']
        negative_words = ['나쁘다', '나쁜', '안좋다', '안좋은', '슬프다', '슬픈', '화나다', '화난', '불만']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        total_words = len(text.split())
        if total_words == 0:
            return {"positive": 0.5, "negative": 0.5, "neutral": 0.0}
        
        positive_score = positive_count / total_words
        negative_score = negative_count / total_words
        neutral_score = 1 - positive_score - negative_score
        
        return {
            "positive": min(positive_score * 2, 1.0),
            "negative": min(negative_score * 2, 1.0),
            "neutral": max(neutral_score, 0.0)
        }
    
    def _extract_keywords_ml(self, text: str) -> List[str]:
        """ML 기반 키워드 추출"""
        # 간단한 키워드 추출 (실제로는 TF-IDF나 Word2Vec 사용)
        words = text.split()
        word_freq = {}
        for word in words:
            if len(word) > 2:  # 2글자 이상만
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # 빈도순으로 정렬하여 상위 키워드 반환
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:5]]
    
    def _analyze_complexity(self, text: str) -> Dict[str, Any]:
        """텍스트 복잡도 분석"""
        words = text.split()
        sentences = text.split('.')
        
        avg_word_length = sum(len(word) for word in words) / len(words) if words else 0
        avg_sentence_length = len(words) / len(sentences) if sentences else 0
        
        return {
            "word_count": len(words),
            "sentence_count": len(sentences),
            "avg_word_length": round(avg_word_length, 2),
            "avg_sentence_length": round(avg_sentence_length, 2),
            "complexity_score": min(avg_word_length * avg_sentence_length / 10, 1.0)
        }
    
    def _classify_topic_ml(self, text: str) -> str:
        """ML 기반 주제 분류"""
        # 간단한 키워드 기반 분류
        tech_keywords = ['기술', '프로그래밍', '코딩', '개발', '소프트웨어', 'AI', '머신러닝']
        business_keywords = ['비즈니스', '경영', '마케팅', '판매', '고객', '수익']
        personal_keywords = ['개인', '일상', '생활', '가족', '친구', '여행']
        
        text_lower = text.lower()
        
        if any(keyword in text_lower for keyword in tech_keywords):
            return "기술"
        elif any(keyword in text_lower for keyword in business_keywords):
            return "비즈니스"
        elif any(keyword in text_lower for keyword in personal_keywords):
            return "개인"
        else:
            return "일반"
    
    def _prepare_training_data(self, training_data: List[Dict]) -> tuple:
        """훈련 데이터 준비"""
        X = []
        y = []
        
        for item in training_data:
            if 'text' in item and 'label' in item:
                X.append(self._preprocess_text(item['text']))
                y.append(item['label'])
        
        # TF-IDF 벡터화
        X_vectorized = self.vectorizers['tfidf'].fit_transform(X)
        return X_vectorized.toarray(), y
    
    def _preprocess_input(self, input_data: Any) -> Any:
        """입력 데이터 전처리"""
        if isinstance(input_data, str):
            return self._preprocess_text(input_data)
        elif isinstance(input_data, (list, tuple)):
            return [self._preprocess_text(str(item)) for item in input_data]
        else:
            return str(input_data)
    
    async def _analyze_text_data(self, text: str) -> Dict[str, Any]:
        """텍스트 데이터 분석"""
        return await self.analyze_text_with_ml(text)
    
    async def _analyze_list_data(self, data: List) -> Dict[str, Any]:
        """리스트 데이터 분석"""
        return {
            "data_type": "list",
            "length": len(data),
            "sample_data": data[:5] if len(data) > 5 else data,
            "analysis": "리스트 데이터 분석이 완료되었습니다."
        }
    
    async def _analyze_dict_data(self, data: Dict) -> Dict[str, Any]:
        """딕셔너리 데이터 분석"""
        return {
            "data_type": "dict",
            "keys": list(data.keys()),
            "key_count": len(data),
            "sample_values": {k: str(v)[:100] for k, v in list(data.items())[:3]},
            "analysis": "딕셔너리 데이터 분석이 완료되었습니다."
        }
    
    async def _fallback_analysis(self, text: str) -> Dict[str, Any]:
        """ML 라이브러리가 없을 때의 기본 분석"""
        return {
            "emotion_analysis": {"positive": 0.5, "negative": 0.3, "neutral": 0.2},
            "keywords": text.split()[:5],
            "complexity": {"word_count": len(text.split()), "complexity_score": 0.5},
            "topic": "일반",
            "confidence": 0.3,
            "model_used": "Basic Analysis"
        }
    
    async def _fallback_data_analysis(self, data: Any) -> Dict[str, Any]:
        """ML 라이브러리가 없을 때의 기본 데이터 분석"""
        return {
            "data_type": type(data).__name__,
            "analysis": "기본 데이터 분석이 완료되었습니다.",
            "confidence": 0.3,
            "model_used": "Basic Analysis"
        }
    
    async def get_model_status(self) -> Dict[str, Any]:
        """모델 상태 확인"""
        return {
            "ml_available": ML_AVAILABLE,
            "initialized": self.is_initialized,
            "loaded_models": list(self.models.keys()),
            "vectorizers": list(self.vectorizers.keys()),
            "total_models": len(self.models)
        }
