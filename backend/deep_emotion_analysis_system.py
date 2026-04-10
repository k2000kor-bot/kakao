"""
딥러닝 기반 실시간 감정 분석 및 행동 예측 시스템
- Transformer 기반 텍스트 감정 분석
- CNN 기반 이미지 감정 인식
- LSTM 기반 시계열 행동 예측
- 멀티모달 감정 융합
- 실시간 스트리밍 분석
"""

import asyncio
import json
import time
import uuid
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset
from transformers import (
    AutoTokenizer, AutoModel, AutoModelForSequenceClassification,
    pipeline, Trainer, TrainingArguments
)
import cv2
import librosa
from PIL import Image
import torchvision.transforms as transforms
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import sqlite3
import logging
import base64
import io
from collections import deque
import threading
import queue

# 감정 타입
class EmotionType(Enum):
    JOY = "joy"
    SADNESS = "sadness"
    ANGER = "anger"
    FEAR = "fear"
    SURPRISE = "surprise"
    DISGUST = "disgust"
    NEUTRAL = "neutral"
    EXCITEMENT = "excitement"
    ANTICIPATION = "anticipation"
    TRUST = "trust"

# 행동 패턴
class BehaviorPattern(Enum):
    ENGAGEMENT = "engagement"
    WITHDRAWAL = "withdrawal"
    AGGRESSION = "aggression"
    COOPERATION = "cooperation"
    CURIOSITY = "curiosity"
    STRESS = "stress"
    RELAXATION = "relaxation"
    FOCUS = "focus"

# 모달리티
class Modality(Enum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    MULTIMODAL = "multimodal"

@dataclass
class EmotionResult:
    """감정 분석 결과"""
    emotion: EmotionType
    confidence: float
    intensity: float
    valence: float  # 긍정-부정 축
    arousal: float  # 각성 수준
    timestamp: datetime
    modality: Modality
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class BehaviorPrediction:
    """행동 예측 결과"""
    pattern: BehaviorPattern
    probability: float
    confidence_interval: Tuple[float, float]
    prediction_horizon: int  # 예측 시간 범위 (분)
    contributing_factors: List[str]
    timestamp: datetime

@dataclass
class MultimodalInput:
    """멀티모달 입력"""
    input_id: str
    text: Optional[str] = None
    image: Optional[np.ndarray] = None
    audio: Optional[np.ndarray] = None
    video: Optional[np.ndarray] = None
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

class TransformerEmotionClassifier(nn.Module):
    """Transformer 기반 텍스트 감정 분류기"""
    
    def __init__(self, model_name: str = "klue/roberta-base", num_emotions: int = 10):
        super().__init__()
        self.model_name = model_name
        self.num_emotions = num_emotions
        
        # 사전 훈련된 모델 로드
        self.bert = AutoModel.from_pretrained(model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        
        # 감정 분류 헤드
        self.emotion_classifier = nn.Sequential(
            nn.Linear(self.bert.config.hidden_size, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_emotions)
        )
        
        # 감정 강도 예측 헤드
        self.intensity_regressor = nn.Sequential(
            nn.Linear(self.bert.config.hidden_size, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
        
        # Valence-Arousal 예측 헤드
        self.va_regressor = nn.Sequential(
            nn.Linear(self.bert.config.hidden_size, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 2),  # valence, arousal
            nn.Tanh()
        )
    
    def forward(self, input_ids, attention_mask):
        # BERT 인코딩
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.pooler_output
        
        # 감정 분류
        emotion_logits = self.emotion_classifier(pooled_output)
        
        # 감정 강도
        intensity = self.intensity_regressor(pooled_output)
        
        # Valence-Arousal
        va_output = self.va_regressor(pooled_output)
        
        return {
            'emotion_logits': emotion_logits,
            'intensity': intensity,
            'valence': va_output[:, 0:1],
            'arousal': va_output[:, 1:2]
        }
    
    def predict_emotion(self, text: str) -> EmotionResult:
        """단일 텍스트 감정 예측"""
        try:
            self.eval()
            
            # 토크나이징
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                max_length=512,
                truncation=True,
                padding=True
            )
            
            with torch.no_grad():
                outputs = self.forward(
                    inputs['input_ids'],
                    inputs['attention_mask']
                )
            
            # 감정 예측
            emotion_probs = F.softmax(outputs['emotion_logits'], dim=1)
            emotion_idx = torch.argmax(emotion_probs, dim=1).item()
            confidence = emotion_probs[0, emotion_idx].item()
            
            # 감정 매핑
            emotions = list(EmotionType)
            emotion = emotions[emotion_idx] if emotion_idx < len(emotions) else EmotionType.NEUTRAL
            
            # 강도 및 VA
            intensity = outputs['intensity'][0].item()
            valence = outputs['valence'][0].item()
            arousal = outputs['arousal'][0].item()
            
            return EmotionResult(
                emotion=emotion,
                confidence=confidence,
                intensity=intensity,
                valence=valence,
                arousal=arousal,
                timestamp=datetime.now(),
                modality=Modality.TEXT,
                metadata={'text_length': len(text)}
            )
            
        except Exception as e:
            logging.error(f"텍스트 감정 예측 오류: {e}")
            return EmotionResult(
                emotion=EmotionType.NEUTRAL,
                confidence=0.0,
                intensity=0.0,
                valence=0.0,
                arousal=0.0,
                timestamp=datetime.now(),
                modality=Modality.TEXT
            )

class CNNEmotionClassifier(nn.Module):
    """CNN 기반 이미지 감정 분류기"""
    
    def __init__(self, num_emotions: int = 10):
        super().__init__()
        self.num_emotions = num_emotions
        
        # CNN 백본
        self.features = nn.Sequential(
            # 첫 번째 컨볼루션 블록
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # 두 번째 컨볼루션 블록
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # 세 번째 컨볼루션 블록
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # 네 번째 컨볼루션 블록
            nn.Conv2d(256, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(),
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )
        
        # 분류 헤드
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d((7, 7)),
            nn.Flatten(),
            nn.Linear(512 * 7 * 7, 4096),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(4096, 1024),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(1024, num_emotions)
        )
        
        # 강도 및 VA 예측
        self.intensity_regressor = nn.Sequential(
            nn.Linear(1024, 256),
            nn.ReLU(),
            nn.Linear(256, 1),
            nn.Sigmoid()
        )
        
        self.va_regressor = nn.Sequential(
            nn.Linear(1024, 256),
            nn.ReLU(),
            nn.Linear(256, 2),
            nn.Tanh()
        )
        
        # 이미지 전처리
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def forward(self, x):
        # 특징 추출
        features = self.features(x)
        
        # 분류를 위한 특징
        flattened = nn.AdaptiveAvgPool2d((7, 7))(features)
        flattened = torch.flatten(flattened, 1)
        
        # 중간 특징
        mid_features = F.relu(nn.Linear(512 * 7 * 7, 1024)(flattened))
        
        # 감정 분류
        emotion_logits = self.classifier(x)
        
        # 강도 및 VA
        intensity = self.intensity_regressor(mid_features)
        va_output = self.va_regressor(mid_features)
        
        return {
            'emotion_logits': emotion_logits,
            'intensity': intensity,
            'valence': va_output[:, 0:1],
            'arousal': va_output[:, 1:2]
        }
    
    def predict_emotion(self, image: np.ndarray) -> EmotionResult:
        """단일 이미지 감정 예측"""
        try:
            self.eval()
            
            # 이미지 전처리
            if len(image.shape) == 3:
                pil_image = Image.fromarray(image)
            else:
                pil_image = Image.fromarray(image).convert('RGB')
            
            input_tensor = self.transform(pil_image).unsqueeze(0)
            
            with torch.no_grad():
                outputs = self.forward(input_tensor)
            
            # 감정 예측
            emotion_probs = F.softmax(outputs['emotion_logits'], dim=1)
            emotion_idx = torch.argmax(emotion_probs, dim=1).item()
            confidence = emotion_probs[0, emotion_idx].item()
            
            # 감정 매핑
            emotions = list(EmotionType)
            emotion = emotions[emotion_idx] if emotion_idx < len(emotions) else EmotionType.NEUTRAL
            
            # 강도 및 VA
            intensity = outputs['intensity'][0].item()
            valence = outputs['valence'][0].item()
            arousal = outputs['arousal'][0].item()
            
            return EmotionResult(
                emotion=emotion,
                confidence=confidence,
                intensity=intensity,
                valence=valence,
                arousal=arousal,
                timestamp=datetime.now(),
                modality=Modality.IMAGE,
                metadata={'image_shape': image.shape}
            )
            
        except Exception as e:
            logging.error(f"이미지 감정 예측 오류: {e}")
            return EmotionResult(
                emotion=EmotionType.NEUTRAL,
                confidence=0.0,
                intensity=0.0,
                valence=0.0,
                arousal=0.0,
                timestamp=datetime.now(),
                modality=Modality.IMAGE
            )

class LSTMBehaviorPredictor(nn.Module):
    """LSTM 기반 행동 패턴 예측기"""
    
    def __init__(self, input_size: int = 50, hidden_size: int = 128, 
                 num_layers: int = 3, num_behaviors: int = 8):
        super().__init__()
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.num_behaviors = num_behaviors
        
        # LSTM 레이어
        self.lstm = nn.LSTM(
            input_size, hidden_size, num_layers,
            batch_first=True, dropout=0.3, bidirectional=True
        )
        
        # Attention 메커니즘
        self.attention = nn.MultiheadAttention(
            embed_dim=hidden_size * 2,
            num_heads=8,
            dropout=0.2,
            batch_first=True
        )
        
        # 행동 분류 헤드
        self.behavior_classifier = nn.Sequential(
            nn.Linear(hidden_size * 2, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, num_behaviors)
        )
        
        # 시간 예측 헤드
        self.time_regressor = nn.Sequential(
            nn.Linear(hidden_size * 2, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
        # 신뢰도 예측 헤드
        self.confidence_regressor = nn.Sequential(
            nn.Linear(hidden_size * 2, 128),
            nn.ReLU(),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x):
        # LSTM 처리
        lstm_out, (hidden, cell) = self.lstm(x)
        
        # Attention 적용
        attended_out, attention_weights = self.attention(lstm_out, lstm_out, lstm_out)
        
        # 마지막 시점의 출력 사용
        last_output = attended_out[:, -1, :]
        
        # 행동 분류
        behavior_logits = self.behavior_classifier(last_output)
        
        # 시간 및 신뢰도 예측
        time_pred = self.time_regressor(last_output)
        confidence = self.confidence_regressor(last_output)
        
        return {
            'behavior_logits': behavior_logits,
            'time_prediction': time_pred,
            'confidence': confidence,
            'attention_weights': attention_weights
        }
    
    def predict_behavior(self, emotion_sequence: List[EmotionResult], 
                        sequence_length: int = 20) -> BehaviorPrediction:
        """감정 시퀀스에서 행동 예측"""
        try:
            self.eval()
            
            # 감정 시퀀스를 특징 벡터로 변환
            features = []
            for emotion in emotion_sequence[-sequence_length:]:
                feature_vector = [
                    emotion.confidence,
                    emotion.intensity,
                    emotion.valence,
                    emotion.arousal,
                    list(EmotionType).index(emotion.emotion) / len(EmotionType)
                ]
                features.append(feature_vector)
            
            # 패딩 (시퀀스가 짧은 경우)
            while len(features) < sequence_length:
                features.insert(0, [0.0] * 5)
            
            # 텐서 변환
            input_tensor = torch.FloatTensor(features).unsqueeze(0)
            
            with torch.no_grad():
                outputs = self.forward(input_tensor)
            
            # 행동 예측
            behavior_probs = F.softmax(outputs['behavior_logits'], dim=1)
            behavior_idx = torch.argmax(behavior_probs, dim=1).item()
            probability = behavior_probs[0, behavior_idx].item()
            
            # 행동 매핑
            behaviors = list(BehaviorPattern)
            pattern = behaviors[behavior_idx] if behavior_idx < len(behaviors) else BehaviorPattern.ENGAGEMENT
            
            # 시간 및 신뢰도
            time_pred = outputs['time_prediction'][0].item() * 60  # 분으로 변환
            confidence = outputs['confidence'][0].item()
            
            # 신뢰구간 계산
            confidence_interval = (
                max(0.0, probability - confidence * 0.1),
                min(1.0, probability + confidence * 0.1)
            )
            
            # 기여 요인 분석
            contributing_factors = []
            if len(emotion_sequence) > 0:
                latest_emotion = emotion_sequence[-1]
                if latest_emotion.intensity > 0.7:
                    contributing_factors.append("high_intensity")
                if latest_emotion.valence < -0.5:
                    contributing_factors.append("negative_valence")
                if latest_emotion.arousal > 0.5:
                    contributing_factors.append("high_arousal")
            
            return BehaviorPrediction(
                pattern=pattern,
                probability=probability,
                confidence_interval=confidence_interval,
                prediction_horizon=int(time_pred),
                contributing_factors=contributing_factors,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logging.error(f"행동 예측 오류: {e}")
            return BehaviorPrediction(
                pattern=BehaviorPattern.ENGAGEMENT,
                probability=0.0,
                confidence_interval=(0.0, 0.0),
                prediction_horizon=0,
                contributing_factors=[],
                timestamp=datetime.now()
            )

class MultimodalEmotionFusion(nn.Module):
    """멀티모달 감정 융합 네트워크"""
    
    def __init__(self, text_dim: int = 768, image_dim: int = 1024, 
                 audio_dim: int = 512, num_emotions: int = 10):
        super().__init__()
        self.text_dim = text_dim
        self.image_dim = image_dim
        self.audio_dim = audio_dim
        self.num_emotions = num_emotions
        
        # 모달리티별 투영 레이어
        self.text_projection = nn.Sequential(
            nn.Linear(text_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        self.image_projection = nn.Sequential(
            nn.Linear(image_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        self.audio_projection = nn.Sequential(
            nn.Linear(audio_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        # Cross-modal Attention
        self.cross_attention = nn.MultiheadAttention(
            embed_dim=256,
            num_heads=8,
            dropout=0.1,
            batch_first=True
        )
        
        # 융합 레이어
        self.fusion_layer = nn.Sequential(
            nn.Linear(256 * 3, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        # 최종 분류기
        self.classifier = nn.Sequential(
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, num_emotions)
        )
        
        # 융합 가중치 학습
        self.modal_weights = nn.Parameter(torch.ones(3) / 3)
        
    def forward(self, text_features=None, image_features=None, audio_features=None):
        modal_features = []
        available_modalities = []
        
        # 텍스트 특징 처리
        if text_features is not None:
            text_proj = self.text_projection(text_features)
            modal_features.append(text_proj)
            available_modalities.append(0)
        
        # 이미지 특징 처리
        if image_features is not None:
            image_proj = self.image_projection(image_features)
            modal_features.append(image_proj)
            available_modalities.append(1)
        
        # 오디오 특징 처리
        if audio_features is not None:
            audio_proj = self.audio_projection(audio_features)
            modal_features.append(audio_proj)
            available_modalities.append(2)
        
        if not modal_features:
            raise ValueError("적어도 하나의 모달리티가 필요합니다")
        
        # Cross-modal Attention
        if len(modal_features) > 1:
            stacked_features = torch.stack(modal_features, dim=1)
            attended_features, _ = self.cross_attention(
                stacked_features, stacked_features, stacked_features
            )
            attended_features = attended_features.mean(dim=1)
        else:
            attended_features = modal_features[0]
        
        # 모달리티별 가중치 적용
        weighted_features = []
        for i, feature in enumerate(modal_features):
            modal_idx = available_modalities[i]
            weight = torch.softmax(self.modal_weights, dim=0)[modal_idx]
            weighted_features.append(feature * weight)
        
        # 특징 융합
        if len(weighted_features) == 3:
            fused_features = torch.cat(weighted_features, dim=1)
        else:
            # 누락된 모달리티는 0으로 패딩
            padded_features = []
            modal_idx = 0
            for i in range(3):
                if i in available_modalities:
                    padded_features.append(weighted_features[modal_idx])
                    modal_idx += 1
                else:
                    padded_features.append(torch.zeros_like(weighted_features[0]))
            fused_features = torch.cat(padded_features, dim=1)
        
        # 융합 및 분류
        fusion_output = self.fusion_layer(fused_features)
        emotion_logits = self.classifier(fusion_output)
        
        return {
            'emotion_logits': emotion_logits,
            'modal_weights': torch.softmax(self.modal_weights, dim=0),
            'fused_features': fusion_output
        }

class RealTimeEmotionAnalyzer:
    """실시간 감정 분석 시스템"""
    
    def __init__(self, db_path: str = "emotion_analysis.db"):
        self.db_path = db_path
        
        # 모델 초기화
        self.text_model = TransformerEmotionClassifier()
        self.image_model = CNNEmotionClassifier()
        self.behavior_model = LSTMBehaviorPredictor()
        self.fusion_model = MultimodalEmotionFusion()
        
        # 실시간 데이터 큐
        self.emotion_queue = deque(maxlen=1000)
        self.behavior_queue = deque(maxlen=100)
        
        # 실시간 스트림
        self.stream_active = False
        self.stream_thread = None
        
        # 데이터베이스 초기화
        self.init_database()
        
        # 성능 메트릭스
        self.metrics = {
            'processed_count': 0,
            'average_processing_time': 0.0,
            'accuracy_scores': deque(maxlen=100)
        }
    
    def init_database(self):
        """데이터베이스 초기화"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 감정 분석 결과 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS emotion_results (
                result_id TEXT PRIMARY KEY,
                input_id TEXT,
                emotion TEXT,
                confidence REAL,
                intensity REAL,
                valence REAL,
                arousal REAL,
                modality TEXT,
                timestamp TEXT,
                metadata TEXT
            )
        """)
        
        # 행동 예측 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS behavior_predictions (
                prediction_id TEXT PRIMARY KEY,
                pattern TEXT,
                probability REAL,
                confidence_interval_low REAL,
                confidence_interval_high REAL,
                prediction_horizon INTEGER,
                contributing_factors TEXT,
                timestamp TEXT
            )
        """)
        
        # 멀티모달 분석 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS multimodal_analysis (
                analysis_id TEXT PRIMARY KEY,
                input_id TEXT,
                text_emotion TEXT,
                image_emotion TEXT,
                audio_emotion TEXT,
                fused_emotion TEXT,
                fusion_confidence REAL,
                modal_weights TEXT,
                timestamp TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    
    async def analyze_text_emotion(self, text: str, input_id: str = None) -> EmotionResult:
        """텍스트 감정 분석"""
        try:
            start_time = time.time()
            
            # 모델 예측
            result = self.text_model.predict_emotion(text)
            
            # 입력 ID 설정
            if input_id is None:
                input_id = str(uuid.uuid4())
            
            # 결과 저장
            await self._save_emotion_result(result, input_id)
            
            # 큐에 추가
            self.emotion_queue.append(result)
            
            # 성능 메트릭스 업데이트
            processing_time = time.time() - start_time
            self._update_metrics(processing_time)
            
            logging.info(f"텍스트 감정 분석 완료: {result.emotion.value} ({result.confidence:.3f})")
            
            return result
            
        except Exception as e:
            logging.error(f"텍스트 감정 분석 오류: {e}")
            raise e
    
    async def analyze_image_emotion(self, image: np.ndarray, input_id: str = None) -> EmotionResult:
        """이미지 감정 분석"""
        try:
            start_time = time.time()
            
            # 모델 예측
            result = self.image_model.predict_emotion(image)
            
            # 입력 ID 설정
            if input_id is None:
                input_id = str(uuid.uuid4())
            
            # 결과 저장
            await self._save_emotion_result(result, input_id)
            
            # 큐에 추가
            self.emotion_queue.append(result)
            
            # 성능 메트릭스 업데이트
            processing_time = time.time() - start_time
            self._update_metrics(processing_time)
            
            logging.info(f"이미지 감정 분석 완료: {result.emotion.value} ({result.confidence:.3f})")
            
            return result
            
        except Exception as e:
            logging.error(f"이미지 감정 분석 오류: {e}")
            raise e
    
    async def analyze_multimodal_emotion(self, multimodal_input: MultimodalInput) -> Dict[str, Any]:
        """멀티모달 감정 분석"""
        try:
            start_time = time.time()
            
            results = {}
            
            # 텍스트 분석
            if multimodal_input.text:
                text_result = await self.analyze_text_emotion(
                    multimodal_input.text, multimodal_input.input_id
                )
                results['text'] = text_result
            
            # 이미지 분석
            if multimodal_input.image is not None:
                image_result = await self.analyze_image_emotion(
                    multimodal_input.image, multimodal_input.input_id
                )
                results['image'] = image_result
            
            # 오디오 분석 (간소화된 버전)
            if multimodal_input.audio is not None:
                audio_result = await self._analyze_audio_emotion(
                    multimodal_input.audio, multimodal_input.input_id
                )
                results['audio'] = audio_result
            
            # 융합 분석
            if len(results) > 1:
                fused_result = await self._fuse_multimodal_emotions(results, multimodal_input.input_id)
                results['fused'] = fused_result
            
            # 멀티모달 분석 결과 저장
            await self._save_multimodal_analysis(multimodal_input.input_id, results)
            
            # 성능 메트릭스 업데이트
            processing_time = time.time() - start_time
            self._update_metrics(processing_time)
            
            logging.info(f"멀티모달 감정 분석 완료: {len(results)} 모달리티")
            
            return {
                'input_id': multimodal_input.input_id,
                'results': results,
                'processing_time': processing_time,
                'modalities_processed': len(results)
            }
            
        except Exception as e:
            logging.error(f"멀티모달 감정 분석 오류: {e}")
            raise e
    
    async def predict_behavior(self, lookback_window: int = 20) -> BehaviorPrediction:
        """행동 패턴 예측"""
        try:
            if len(self.emotion_queue) < lookback_window:
                raise ValueError("충분한 감정 데이터가 없습니다")
            
            # 최근 감정 시퀀스 추출
            recent_emotions = list(self.emotion_queue)[-lookback_window:]
            
            # 행동 예측
            prediction = self.behavior_model.predict_behavior(recent_emotions)
            
            # 예측 결과 저장
            await self._save_behavior_prediction(prediction)
            
            # 큐에 추가
            self.behavior_queue.append(prediction)
            
            logging.info(f"행동 예측 완료: {prediction.pattern.value} ({prediction.probability:.3f})")
            
            return prediction
            
        except Exception as e:
            logging.error(f"행동 예측 오류: {e}")
            raise e
    
    async def _analyze_audio_emotion(self, audio: np.ndarray, input_id: str) -> EmotionResult:
        """오디오 감정 분석 (간소화된 버전)"""
        try:
            # 간단한 오디오 특징 추출
            # 실제 구현에서는 더 복잡한 오디오 모델 사용
            
            # 기본적인 특징 (에너지, 톤 등)
            energy = np.mean(audio ** 2)
            
            # 감정 매핑 (간소화)
            if energy > 0.01:
                emotion = EmotionType.EXCITEMENT
                confidence = min(energy * 10, 1.0)
            elif energy < 0.001:
                emotion = EmotionType.SADNESS
                confidence = 0.6
            else:
                emotion = EmotionType.NEUTRAL
                confidence = 0.5
            
            return EmotionResult(
                emotion=emotion,
                confidence=confidence,
                intensity=energy * 10,
                valence=0.0,
                arousal=energy * 5,
                timestamp=datetime.now(),
                modality=Modality.AUDIO,
                metadata={'audio_length': len(audio)}
            )
            
        except Exception as e:
            logging.error(f"오디오 감정 분석 오류: {e}")
            return EmotionResult(
                emotion=EmotionType.NEUTRAL,
                confidence=0.0,
                intensity=0.0,
                valence=0.0,
                arousal=0.0,
                timestamp=datetime.now(),
                modality=Modality.AUDIO
            )
    
    async def _fuse_multimodal_emotions(self, results: Dict[str, EmotionResult], input_id: str) -> EmotionResult:
        """멀티모달 감정 융합"""
        try:
            # 간단한 가중 평균 융합 (실제로는 fusion_model 사용)
            emotions = list(results.values())
            
            # 신뢰도 기반 가중치
            weights = [emotion.confidence for emotion in emotions]
            total_weight = sum(weights)
            
            if total_weight == 0:
                weights = [1.0] * len(emotions)
                total_weight = len(emotions)
            
            # 가중 평균 계산
            avg_confidence = sum(e.confidence * w for e, w in zip(emotions, weights)) / total_weight
            avg_intensity = sum(e.intensity * w for e, w in zip(emotions, weights)) / total_weight
            avg_valence = sum(e.valence * w for e, w in zip(emotions, weights)) / total_weight
            avg_arousal = sum(e.arousal * w for e, w in zip(emotions, weights)) / total_weight
            
            # 최고 신뢰도 감정 선택
            best_emotion = max(emotions, key=lambda e: e.confidence)
            
            return EmotionResult(
                emotion=best_emotion.emotion,
                confidence=avg_confidence,
                intensity=avg_intensity,
                valence=avg_valence,
                arousal=avg_arousal,
                timestamp=datetime.now(),
                modality=Modality.MULTIMODAL,
                metadata={
                    'modalities': [e.modality.value for e in emotions],
                    'fusion_weights': weights
                }
            )
            
        except Exception as e:
            logging.error(f"멀티모달 융합 오류: {e}")
            return emotions[0] if emotions else EmotionResult(
                emotion=EmotionType.NEUTRAL,
                confidence=0.0,
                intensity=0.0,
                valence=0.0,
                arousal=0.0,
                timestamp=datetime.now(),
                modality=Modality.MULTIMODAL
            )
    
    async def _save_emotion_result(self, result: EmotionResult, input_id: str):
        """감정 결과 저장"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO emotion_results 
                (result_id, input_id, emotion, confidence, intensity, valence, 
                 arousal, modality, timestamp, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                str(uuid.uuid4()),
                input_id,
                result.emotion.value,
                result.confidence,
                result.intensity,
                result.valence,
                result.arousal,
                result.modality.value,
                result.timestamp.isoformat(),
                json.dumps(result.metadata)
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logging.error(f"감정 결과 저장 오류: {e}")
    
    async def _save_behavior_prediction(self, prediction: BehaviorPrediction):
        """행동 예측 저장"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO behavior_predictions 
                (prediction_id, pattern, probability, confidence_interval_low,
                 confidence_interval_high, prediction_horizon, contributing_factors, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                str(uuid.uuid4()),
                prediction.pattern.value,
                prediction.probability,
                prediction.confidence_interval[0],
                prediction.confidence_interval[1],
                prediction.prediction_horizon,
                json.dumps(prediction.contributing_factors),
                prediction.timestamp.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logging.error(f"행동 예측 저장 오류: {e}")
    
    async def _save_multimodal_analysis(self, input_id: str, results: Dict[str, EmotionResult]):
        """멀티모달 분석 저장"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 모달리티별 결과 추출
            text_emotion = results.get('text', {}).emotion.value if 'text' in results else None
            image_emotion = results.get('image', {}).emotion.value if 'image' in results else None
            audio_emotion = results.get('audio', {}).emotion.value if 'audio' in results else None
            fused_emotion = results.get('fused', {}).emotion.value if 'fused' in results else None
            fusion_confidence = results.get('fused', {}).confidence if 'fused' in results else None
            
            # 융합 가중치
            modal_weights = {}
            if 'fused' in results:
                modal_weights = results['fused'].metadata.get('fusion_weights', [])
            
            cursor.execute("""
                INSERT INTO multimodal_analysis 
                (analysis_id, input_id, text_emotion, image_emotion, audio_emotion,
                 fused_emotion, fusion_confidence, modal_weights, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                str(uuid.uuid4()),
                input_id,
                text_emotion,
                image_emotion,
                audio_emotion,
                fused_emotion,
                fusion_confidence,
                json.dumps(modal_weights),
                datetime.now().isoformat()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logging.error(f"멀티모달 분석 저장 오류: {e}")
    
    def _update_metrics(self, processing_time: float):
        """성능 메트릭스 업데이트"""
        self.metrics['processed_count'] += 1
        
        # 평균 처리 시간 업데이트
        current_avg = self.metrics['average_processing_time']
        new_avg = (current_avg * (self.metrics['processed_count'] - 1) + processing_time) / self.metrics['processed_count']
        self.metrics['average_processing_time'] = new_avg
    
    async def start_real_time_stream(self, callback_func=None):
        """실시간 스트림 시작"""
        if self.stream_active:
            logging.warning("이미 실시간 스트림이 활성화되어 있습니다")
            return
        
        self.stream_active = True
        
        def stream_worker():
            while self.stream_active:
                try:
                    # 실시간 감정 분석 시뮬레이션
                    if len(self.emotion_queue) >= 10:
                        # 최근 감정 패턴 분석
                        recent_emotions = list(self.emotion_queue)[-10:]
                        
                        # 패턴 변화 감지
                        pattern_change = self._detect_emotion_pattern_change(recent_emotions)
                        
                        if pattern_change and callback_func:
                            callback_func(pattern_change)
                    
                    time.sleep(1)  # 1초마다 체크
                    
                except Exception as e:
                    logging.error(f"실시간 스트림 오류: {e}")
        
        self.stream_thread = threading.Thread(target=stream_worker)
        self.stream_thread.start()
        
        logging.info("실시간 감정 분석 스트림 시작됨")
    
    async def stop_real_time_stream(self):
        """실시간 스트림 중지"""
        self.stream_active = False
        
        if self.stream_thread:
            self.stream_thread.join(timeout=5)
        
        logging.info("실시간 감정 분석 스트림 중지됨")
    
    def _detect_emotion_pattern_change(self, emotions: List[EmotionResult]) -> Optional[Dict[str, Any]]:
        """감정 패턴 변화 감지"""
        try:
            if len(emotions) < 5:
                return None
            
            # 최근 5개와 이전 5개 비교
            recent = emotions[-5:]
            previous = emotions[-10:-5]
            
            # 평균 감정 강도 변화
            recent_intensity = np.mean([e.intensity for e in recent])
            previous_intensity = np.mean([e.intensity for e in previous])
            
            intensity_change = recent_intensity - previous_intensity
            
            # 감정 변화 임계값
            if abs(intensity_change) > 0.3:
                return {
                    'type': 'intensity_change',
                    'change_magnitude': intensity_change,
                    'recent_average': recent_intensity,
                    'previous_average': previous_intensity,
                    'timestamp': datetime.now().isoformat()
                }
            
            # 감정 타입 변화
            recent_emotions = [e.emotion for e in recent]
            if len(set(recent_emotions)) == 1 and len(set([e.emotion for e in previous])) > 1:
                return {
                    'type': 'emotion_stabilization',
                    'stabilized_emotion': recent_emotions[0].value,
                    'timestamp': datetime.now().isoformat()
                }
            
            return None
            
        except Exception as e:
            logging.error(f"감정 패턴 변화 감지 오류: {e}")
            return None
    
    async def get_emotion_statistics(self, hours: int = 24) -> Dict[str, Any]:
        """감정 통계 조회"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # 시간 범위 설정
            time_threshold = datetime.now() - timedelta(hours=hours)
            
            # 감정별 분포
            cursor.execute("""
                SELECT emotion, COUNT(*), AVG(confidence), AVG(intensity)
                FROM emotion_results 
                WHERE timestamp > ?
                GROUP BY emotion
            """, (time_threshold.isoformat(),))
            
            emotion_distribution = {}
            for row in cursor.fetchall():
                emotion_distribution[row[0]] = {
                    'count': row[1],
                    'avg_confidence': row[2],
                    'avg_intensity': row[3]
                }
            
            # 모달리티별 통계
            cursor.execute("""
                SELECT modality, COUNT(*), AVG(confidence)
                FROM emotion_results 
                WHERE timestamp > ?
                GROUP BY modality
            """, (time_threshold.isoformat(),))
            
            modality_stats = {}
            for row in cursor.fetchall():
                modality_stats[row[0]] = {
                    'count': row[1],
                    'avg_confidence': row[2]
                }
            
            # 행동 예측 통계
            cursor.execute("""
                SELECT pattern, COUNT(*), AVG(probability)
                FROM behavior_predictions 
                WHERE timestamp > ?
                GROUP BY pattern
            """, (time_threshold.isoformat(),))
            
            behavior_stats = {}
            for row in cursor.fetchall():
                behavior_stats[row[0]] = {
                    'count': row[1],
                    'avg_probability': row[2]
                }
            
            conn.close()
            
            return {
                'time_range_hours': hours,
                'emotion_distribution': emotion_distribution,
                'modality_statistics': modality_stats,
                'behavior_predictions': behavior_stats,
                'system_metrics': self.metrics,
                'queue_status': {
                    'emotion_queue_size': len(self.emotion_queue),
                    'behavior_queue_size': len(self.behavior_queue)
                }
            }
            
        except Exception as e:
            logging.error(f"감정 통계 조회 오류: {e}")
            return {"error": str(e)}

# FastAPI 통합
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import cv2

class TextAnalysisRequest(BaseModel):
    text: str
    input_id: Optional[str] = None

class MultimodalAnalysisRequest(BaseModel):
    input_id: str
    text: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# 글로벌 분석기
emotion_analyzer = None

async def get_emotion_analyzer():
    global emotion_analyzer
    if emotion_analyzer is None:
        emotion_analyzer = RealTimeEmotionAnalyzer()
    return emotion_analyzer

def create_emotion_analysis_app() -> FastAPI:
    app = FastAPI(title="Deep Emotion Analysis System", version="1.0.0")
    
    @app.post("/analyze/text")
    async def analyze_text(request: TextAnalysisRequest):
        """텍스트 감정 분석"""
        analyzer = await get_emotion_analyzer()
        
        try:
            result = await analyzer.analyze_text_emotion(request.text, request.input_id)
            
            return {
                "success": True,
                "emotion": result.emotion.value,
                "confidence": result.confidence,
                "intensity": result.intensity,
                "valence": result.valence,
                "arousal": result.arousal,
                "modality": result.modality.value,
                "timestamp": result.timestamp.isoformat()
            }
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    @app.post("/analyze/image")
    async def analyze_image(file: UploadFile = File(...), input_id: str = None):
        """이미지 감정 분석"""
        analyzer = await get_emotion_analyzer()
        
        try:
            # 이미지 로드
            contents = await file.read()
            nparr = np.frombuffer(contents, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            result = await analyzer.analyze_image_emotion(image, input_id)
            
            return {
                "success": True,
                "emotion": result.emotion.value,
                "confidence": result.confidence,
                "intensity": result.intensity,
                "valence": result.valence,
                "arousal": result.arousal,
                "modality": result.modality.value,
                "timestamp": result.timestamp.isoformat()
            }
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    @app.post("/analyze/multimodal")
    async def analyze_multimodal(request: MultimodalAnalysisRequest, 
                               image_file: UploadFile = File(None)):
        """멀티모달 감정 분석"""
        analyzer = await get_emotion_analyzer()
        
        try:
            # 멀티모달 입력 구성
            multimodal_input = MultimodalInput(
                input_id=request.input_id,
                text=request.text,
                metadata=request.metadata or {}
            )
            
            # 이미지 처리
            if image_file:
                contents = await image_file.read()
                nparr = np.frombuffer(contents, np.uint8)
                image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                multimodal_input.image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            result = await analyzer.analyze_multimodal_emotion(multimodal_input)
            
            # 결과 직렬화
            serialized_results = {}
            for modality, emotion_result in result['results'].items():
                serialized_results[modality] = {
                    "emotion": emotion_result.emotion.value,
                    "confidence": emotion_result.confidence,
                    "intensity": emotion_result.intensity,
                    "valence": emotion_result.valence,
                    "arousal": emotion_result.arousal,
                    "timestamp": emotion_result.timestamp.isoformat()
                }
            
            return {
                "success": True,
                "input_id": result['input_id'],
                "results": serialized_results,
                "processing_time": result['processing_time'],
                "modalities_processed": result['modalities_processed']
            }
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    @app.post("/predict/behavior")
    async def predict_behavior(lookback_window: int = 20):
        """행동 패턴 예측"""
        analyzer = await get_emotion_analyzer()
        
        try:
            prediction = await analyzer.predict_behavior(lookback_window)
            
            return {
                "success": True,
                "pattern": prediction.pattern.value,
                "probability": prediction.probability,
                "confidence_interval": prediction.confidence_interval,
                "prediction_horizon": prediction.prediction_horizon,
                "contributing_factors": prediction.contributing_factors,
                "timestamp": prediction.timestamp.isoformat()
            }
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    @app.get("/statistics")
    async def get_statistics(hours: int = 24):
        """감정 분석 통계"""
        analyzer = await get_emotion_analyzer()
        return await analyzer.get_emotion_statistics(hours)
    
    @app.post("/stream/start")
    async def start_stream():
        """실시간 스트림 시작"""
        analyzer = await get_emotion_analyzer()
        await analyzer.start_real_time_stream()
        return {"success": True, "message": "실시간 스트림 시작됨"}
    
    @app.post("/stream/stop")
    async def stop_stream():
        """실시간 스트림 중지"""
        analyzer = await get_emotion_analyzer()
        await analyzer.stop_real_time_stream()
        return {"success": True, "message": "실시간 스트림 중지됨"}
    
    @app.get("/health")
    async def health_check():
        """헬스 체크"""
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
    
    return app

if __name__ == "__main__":
    import os
    import uvicorn
    
    # 로깅 설정
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    app = create_emotion_analysis_app()
    _p = int(os.environ.get("DEEP_EMOTION_ANALYSIS_SYSTEM_PORT", os.environ.get("PORT", "8004")))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=_p,
        log_level="info"
    ) 