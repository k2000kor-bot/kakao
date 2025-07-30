import os
import json
import sqlite3
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import logging
from dataclasses import dataclass
from enum import Enum
import pickle
import hashlib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import re
import jieba
from collections import Counter

logger = logging.getLogger(__name__)

class TrainingStatus(Enum):
    IDLE = "idle"
    TRAINING = "training"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class TrainingConfig:
    model_type: str
    epochs: int
    batch_size: int
    learning_rate: float
    validation_split: float
    early_stopping_patience: int

class AdvancedAITrainer:
    """고도화된 AI 학습 시스템"""
    
    def __init__(self, data_dir: str = "processed", model_dir: str = "models"):
        self.data_dir = Path(data_dir)
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(exist_ok=True)
        
        # 학습 상태
        self.training_status = TrainingStatus.IDLE
        self.training_progress = 0
        self.current_epoch = 0
        self.training_history = []
        
        # 모델들
        self.models = {}
        self.vectorizers = {}
        self.classifiers = {}
        
        # 데이터 처리기
        self.text_processor = TextProcessor()
        self.data_loader = DataLoader(data_dir)
        
        # 학습 설정
        self.default_config = TrainingConfig(
            model_type="ensemble",
            epochs=50,
            batch_size=32,
            learning_rate=0.001,
            validation_split=0.2,
            early_stopping_patience=5
        )
    
    def start_comprehensive_training(self, config: TrainingConfig = None) -> Dict[str, Any]:
        """종합적인 AI 학습 시작"""
        try:
            if self.training_status == TrainingStatus.TRAINING:
                return {"error": "이미 학습이 진행 중입니다."}
            
            self.training_status = TrainingStatus.TRAINING
            self.training_progress = 0
            self.current_epoch = 0
            
            if config is None:
                config = self.default_config
            
            # 1. 데이터 로드 및 전처리
            logger.info("데이터 로드 및 전처리 시작...")
            training_data = self.data_loader.load_all_training_data()
            processed_data = self.text_processor.process_training_data(training_data)
            
            # 2. 모델별 학습
            results = {}
            
            # 텍스트 분류 모델 학습
            logger.info("텍스트 분류 모델 학습 시작...")
            classification_result = self.train_text_classifier(processed_data, config)
            results["text_classification"] = classification_result
            
            # 감정 분석 모델 학습
            logger.info("감정 분석 모델 학습 시작...")
            sentiment_result = self.train_sentiment_analyzer(processed_data, config)
            results["sentiment_analysis"] = sentiment_result
            
            # 주제 추출 모델 학습
            logger.info("주제 추출 모델 학습 시작...")
            topic_result = self.train_topic_extractor(processed_data, config)
            results["topic_extraction"] = topic_result
            
            # 응답 생성 모델 학습
            logger.info("응답 생성 모델 학습 시작...")
            response_result = self.train_response_generator(processed_data, config)
            results["response_generation"] = response_result
            
            # 3. 모델 저장
            self.save_all_models()
            
            # 4. 학습 완료
            self.training_status = TrainingStatus.COMPLETED
            self.training_progress = 100
            
            return {
                "status": "success",
                "message": "모든 모델 학습이 완료되었습니다.",
                "results": results,
                "models_saved": list(self.models.keys()),
                "completion_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.training_status = TrainingStatus.FAILED
            logger.error(f"학습 실패: {e}")
            return {"error": f"학습 실패: {str(e)}"}
    
    def train_text_classifier(self, data: Dict[str, Any], config: TrainingConfig) -> Dict[str, Any]:
        """텍스트 분류 모델 학습"""
        try:
            # TF-IDF 벡터화
            vectorizer = TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),
                stop_words='english'
            )
            
            # 텍스트 데이터 준비
            texts = data.get("texts", [])
            labels = data.get("categories", [])
            
            if len(texts) < 10:
                return {"error": "학습 데이터가 부족합니다."}
            
            # 벡터화
            X = vectorizer.fit_transform(texts)
            y = np.array(labels)
            
            # 데이터 분할
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=config.validation_split, random_state=42
            )
            
            # 분류기 학습
            classifier = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            classifier.fit(X_train, y_train)
            
            # 성능 평가
            y_pred = classifier.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # 모델 저장
            self.models["text_classifier"] = classifier
            self.vectorizers["text_vectorizer"] = vectorizer
            
            return {
                "accuracy": accuracy,
                "model_type": "RandomForest",
                "features": X.shape[1],
                "training_samples": len(X_train),
                "test_samples": len(X_test)
            }
            
        except Exception as e:
            return {"error": f"텍스트 분류 모델 학습 실패: {str(e)}"}
    
    def train_sentiment_analyzer(self, data: Dict[str, Any], config: TrainingConfig) -> Dict[str, Any]:
        """감정 분석 모델 학습"""
        try:
            # 감정 데이터 준비
            texts = data.get("texts", [])
            sentiments = data.get("sentiments", [])
            
            if len(texts) < 10:
                return {"error": "감정 분석 데이터가 부족합니다."}
            
            # TF-IDF 벡터화
            vectorizer = TfidfVectorizer(
                max_features=3000,
                ngram_range=(1, 2)
            )
            
            X = vectorizer.fit_transform(texts)
            y = np.array(sentiments)
            
            # 데이터 분할
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=config.validation_split, random_state=42
            )
            
            # 감정 분석기 학습
            sentiment_classifier = RandomForestClassifier(
                n_estimators=50,
                max_depth=8,
                random_state=42
            )
            
            sentiment_classifier.fit(X_train, y_train)
            
            # 성능 평가
            y_pred = sentiment_classifier.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # 모델 저장
            self.models["sentiment_analyzer"] = sentiment_classifier
            self.vectorizers["sentiment_vectorizer"] = vectorizer
            
            return {
                "accuracy": accuracy,
                "model_type": "RandomForest",
                "sentiment_classes": list(set(sentiments)),
                "training_samples": len(X_train),
                "test_samples": len(X_test)
            }
            
        except Exception as e:
            return {"error": f"감정 분석 모델 학습 실패: {str(e)}"}
    
    def train_topic_extractor(self, data: Dict[str, Any], config: TrainingConfig) -> Dict[str, Any]:
        """주제 추출 모델 학습"""
        try:
            texts = data.get("texts", [])
            
            if len(texts) < 10:
                return {"error": "주제 추출 데이터가 부족합니다."}
            
            # TF-IDF 벡터화
            vectorizer = TfidfVectorizer(
                max_features=2000,
                ngram_range=(1, 2)
            )
            
            X = vectorizer.fit_transform(texts)
            
            # K-means 클러스터링으로 주제 추출
            n_topics = min(10, len(texts) // 5)  # 데이터 크기에 따라 주제 수 조정
            kmeans = KMeans(n_clusters=n_topics, random_state=42)
            
            # 차원 축소 (선택사항)
            from sklearn.decomposition import TruncatedSVD
            svd = TruncatedSVD(n_components=100, random_state=42)
            X_reduced = svd.fit_transform(X)
            
            kmeans.fit(X_reduced)
            
            # 모델 저장
            self.models["topic_extractor"] = kmeans
            self.vectorizers["topic_vectorizer"] = vectorizer
            self.models["topic_svd"] = svd
            
            return {
                "n_topics": n_topics,
                "model_type": "KMeans",
                "training_samples": len(texts),
                "feature_dimensions": X.shape[1]
            }
            
        except Exception as e:
            return {"error": f"주제 추출 모델 학습 실패: {str(e)}"}
    
    def train_response_generator(self, data: Dict[str, Any], config: TrainingConfig) -> Dict[str, Any]:
        """응답 생성 모델 학습"""
        try:
            # 대화 데이터 준비
            contexts = data.get("contexts", [])
            responses = data.get("responses", [])
            
            if len(contexts) < 10:
                return {"error": "응답 생성 데이터가 부족합니다."}
            
            # TF-IDF 벡터화
            vectorizer = TfidfVectorizer(
                max_features=3000,
                ngram_range=(1, 2)
            )
            
            # 컨텍스트와 응답을 결합하여 학습
            combined_texts = [f"{ctx} {resp}" for ctx, resp in zip(contexts, responses)]
            X = vectorizer.fit_transform(combined_texts)
            
            # 응답 스타일 분류기
            response_styles = data.get("response_styles", ["neutral"] * len(contexts))
            y = np.array(response_styles)
            
            # 데이터 분할
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=config.validation_split, random_state=42
            )
            
            # 응답 생성기 학습
            response_classifier = RandomForestClassifier(
                n_estimators=50,
                max_depth=8,
                random_state=42
            )
            
            response_classifier.fit(X_train, y_train)
            
            # 성능 평가
            y_pred = response_classifier.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # 모델 저장
            self.models["response_generator"] = response_classifier
            self.vectorizers["response_vectorizer"] = vectorizer
            
            return {
                "accuracy": accuracy,
                "model_type": "RandomForest",
                "response_styles": list(set(response_styles)),
                "training_samples": len(X_train),
                "test_samples": len(X_test)
            }
            
        except Exception as e:
            return {"error": f"응답 생성 모델 학습 실패: {str(e)}"}
    
    def save_all_models(self):
        """모든 모델 저장"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            for model_name, model in self.models.items():
                model_path = self.model_dir / f"{model_name}_{timestamp}.pkl"
                with open(model_path, 'wb') as f:
                    pickle.dump(model, f)
            
            for vectorizer_name, vectorizer in self.vectorizers.items():
                vectorizer_path = self.model_dir / f"{vectorizer_name}_{timestamp}.pkl"
                with open(vectorizer_path, 'wb') as f:
                    pickle.dump(vectorizer, f)
            
            # 메타데이터 저장
            metadata = {
                "training_date": timestamp,
                "models": list(self.models.keys()),
                "vectorizers": list(self.vectorizers.keys()),
                "training_status": self.training_status.value,
                "training_progress": self.training_progress
            }
            
            metadata_path = self.model_dir / f"metadata_{timestamp}.json"
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            logger.info(f"모든 모델이 저장되었습니다: {timestamp}")
            
        except Exception as e:
            logger.error(f"모델 저장 실패: {e}")
    
    def load_models(self, timestamp: str = None):
        """모델 로드"""
        try:
            if timestamp is None:
                # 가장 최근 모델 찾기
                metadata_files = list(self.model_dir.glob("metadata_*.json"))
                if not metadata_files:
                    return {"error": "저장된 모델이 없습니다."}
                
                latest_metadata = max(metadata_files, key=lambda x: x.stat().st_mtime)
                timestamp = latest_metadata.stem.split("_")[1]
            
            # 모델 로드
            for model_name in ["text_classifier", "sentiment_analyzer", "topic_extractor", "response_generator"]:
                model_path = self.model_dir / f"{model_name}_{timestamp}.pkl"
                if model_path.exists():
                    with open(model_path, 'rb') as f:
                        self.models[model_name] = pickle.load(f)
            
            # 벡터라이저 로드
            for vectorizer_name in ["text_vectorizer", "sentiment_vectorizer", "topic_vectorizer", "response_vectorizer"]:
                vectorizer_path = self.model_dir / f"{vectorizer_name}_{timestamp}.pkl"
                if vectorizer_path.exists():
                    with open(vectorizer_path, 'rb') as f:
                        self.vectorizers[vectorizer_name] = pickle.load(f)
            
            logger.info(f"모델 로드 완료: {timestamp}")
            return {"status": "success", "timestamp": timestamp}
            
        except Exception as e:
            logger.error(f"모델 로드 실패: {e}")
            return {"error": f"모델 로드 실패: {str(e)}"}
    
    def get_training_status(self) -> Dict[str, Any]:
        """학습 상태 조회"""
        return {
            "status": self.training_status.value,
            "progress": self.training_progress,
            "current_epoch": self.current_epoch,
            "models_loaded": list(self.models.keys()),
            "last_update": datetime.now().isoformat()
        }
    
    def predict_text_category(self, text: str) -> Dict[str, Any]:
        """텍스트 카테고리 예측"""
        try:
            if "text_classifier" not in self.models:
                return {"error": "텍스트 분류 모델이 로드되지 않았습니다."}
            
            vectorizer = self.vectorizers.get("text_vectorizer")
            if vectorizer is None:
                return {"error": "텍스트 벡터라이저가 로드되지 않았습니다."}
            
            # 텍스트 벡터화
            X = vectorizer.transform([text])
            
            # 예측
            classifier = self.models["text_classifier"]
            prediction = classifier.predict(X)[0]
            probabilities = classifier.predict_proba(X)[0]
            
            return {
                "category": prediction,
                "confidence": float(max(probabilities)),
                "probabilities": dict(zip(classifier.classes_, probabilities))
            }
            
        except Exception as e:
            return {"error": f"텍스트 카테고리 예측 실패: {str(e)}"}
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """감정 분석"""
        try:
            if "sentiment_analyzer" not in self.models:
                return {"error": "감정 분석 모델이 로드되지 않았습니다."}
            
            vectorizer = self.vectorizers.get("sentiment_vectorizer")
            if vectorizer is None:
                return {"error": "감정 분석 벡터라이저가 로드되지 않았습니다."}
            
            # 텍스트 벡터화
            X = vectorizer.transform([text])
            
            # 예측
            analyzer = self.models["sentiment_analyzer"]
            prediction = analyzer.predict(X)[0]
            probabilities = analyzer.predict_proba(X)[0]
            
            return {
                "sentiment": prediction,
                "confidence": float(max(probabilities)),
                "probabilities": dict(zip(analyzer.classes_, probabilities))
            }
            
        except Exception as e:
            return {"error": f"감정 분석 실패: {str(e)}"}

class TextProcessor:
    """텍스트 전처리기"""
    
    def __init__(self):
        self.stop_words = set([
            '이', '그', '저', '것', '수', '등', '들', '및', '또는', '그리고',
            '하지만', '그러나', '따라서', '때문에', '위해서', '통해서'
        ])
    
    def process_training_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """학습 데이터 전처리"""
        processed_data = {
            "texts": [],
            "categories": [],
            "sentiments": [],
            "contexts": [],
            "responses": [],
            "response_styles": []
        }
        
        # 문서 데이터 처리
        for doc in data.get("documents", []):
            text = self.clean_text(doc.get("content", ""))
            if text:
                processed_data["texts"].append(text)
                processed_data["categories"].append(doc.get("category", "general"))
                processed_data["sentiments"].append(doc.get("sentiment", "neutral"))
        
        # 대화 데이터 처리
        for conv in data.get("conversations", []):
            context = self.clean_text(conv.get("context", ""))
            response = self.clean_text(conv.get("response", ""))
            
            if context and response:
                processed_data["contexts"].append(context)
                processed_data["responses"].append(response)
                processed_data["response_styles"].append(conv.get("style", "neutral"))
        
        return processed_data
    
    def clean_text(self, text: str) -> str:
        """텍스트 정리"""
        if not text:
            return ""
        
        # 특수문자 제거
        text = re.sub(r'[^\w\s가-힣]', ' ', text)
        
        # 연속된 공백 제거
        text = re.sub(r'\s+', ' ', text)
        
        # 불용어 제거
        words = text.split()
        words = [word for word in words if word not in self.stop_words]
        
        return ' '.join(words).strip()

class DataLoader:
    """데이터 로더"""
    
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
    
    def load_all_training_data(self) -> Dict[str, Any]:
        """모든 학습 데이터 로드"""
        data = {
            "documents": [],
            "conversations": []
        }
        
        # 처리된 문서 로드
        for category_dir in self.data_dir.iterdir():
            if category_dir.is_dir():
                category = category_dir.name
                for file_path in category_dir.iterdir():
                    if file_path.is_file():
                        doc_data = self.load_document(file_path, category)
                        if doc_data:
                            data["documents"].append(doc_data)
        
        # 대화 데이터 생성 (샘플)
        sample_conversations = self.generate_sample_conversations()
        data["conversations"].extend(sample_conversations)
        
        return data
    
    def load_document(self, file_path: Path, category: str) -> Dict[str, Any]:
        """문서 로드"""
        try:
            # 간단한 텍스트 추출 (실제로는 PDF, DOC 등 파싱 필요)
            if file_path.suffix.lower() in ['.txt', '.json']:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            else:
                # 다른 파일 형식은 간단히 파일명만 사용
                content = file_path.stem
            
            return {
                "id": str(file_path),
                "title": file_path.stem,
                "content": content,
                "category": category,
                "sentiment": "neutral",  # 기본값
                "file_path": str(file_path)
            }
            
        except Exception as e:
            logger.error(f"문서 로드 실패: {file_path}, 오류: {e}")
            return None
    
    def generate_sample_conversations(self) -> List[Dict[str, Any]]:
        """샘플 대화 데이터 생성"""
        return [
            {
                "context": "급여 체불 문제가 발생했습니다.",
                "response": "조합에서 시공사와 긴급 협의를 진행하겠습니다.",
                "style": "formal"
            },
            {
                "context": "안전 규정이 너무 엄격합니다.",
                "response": "안전을 위한 규정이니 이해해주시기 바랍니다.",
                "style": "empathetic"
            },
            {
                "context": "복지 혜택을 늘려주세요.",
                "response": "조합원 여러분의 복지 향상을 위해 노력하겠습니다.",
                "style": "supportive"
            }
        ]

# 전역 인스턴스
ai_trainer = AdvancedAITrainer() 