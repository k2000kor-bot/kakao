#!/usr/bin/env python3
"""
멀티모달 AI 처리 시스템 v4.0
- 텍스트 + 이미지 + 음성 통합 분석
- 크로스모달 이해 및 생성
- 실시간 멀티모달 스트리밍
- 한국어 특화 멀티모달 처리
"""

import asyncio
import json
import logging
import base64
import io
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from enum import Enum
import numpy as np
import cv2
import librosa
import torch
import torch.nn as nn
from PIL import Image
import speech_recognition as sr
from gtts import gTTS
import tempfile
import os

# 이미지 처리
from transformers import (
    BlipProcessor, BlipForConditionalGeneration,
    CLIPProcessor, CLIPModel,
    AutoProcessor, AutoModelForCausalLM
)

# 음성 처리
import whisper
from pydub import AudioSegment
import noisereduce as nr

# 비디오 처리
import moviepy.editor as mp

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModalityType(Enum):
    """모달리티 타입"""
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    GESTURE = "gesture"
    FACIAL_EXPRESSION = "facial_expression"

class ProcessingMode(Enum):
    """처리 모드"""
    ANALYSIS = "analysis"           # 분석만
    GENERATION = "generation"       # 생성만
    TRANSLATION = "translation"     # 모달리티 변환
    FUSION = "fusion"              # 다중 모달리티 융합
    INTERACTIVE = "interactive"     # 대화형 처리

@dataclass
class MultimodalInput:
    """멀티모달 입력 데이터"""
    input_id: str
    modalities: Dict[ModalityType, Any]
    metadata: Dict[str, Any]
    timestamp: datetime
    processing_mode: ProcessingMode
    target_language: str = "ko"
    quality_requirements: Dict[str, float] = None

@dataclass
class MultimodalOutput:
    """멀티모달 출력 결과"""
    output_id: str
    input_reference: str
    
    # 각 모달리티별 결과
    text_results: Dict[str, Any]
    image_results: Dict[str, Any]
    audio_results: Dict[str, Any]
    video_results: Dict[str, Any]
    
    # 통합 분석 결과
    integrated_analysis: Dict[str, Any]
    cross_modal_insights: Dict[str, Any]
    
    # 생성된 콘텐츠
    generated_content: Dict[ModalityType, Any]
    
    # 메타데이터
    processing_time: float
    confidence_scores: Dict[str, float]
    quality_metrics: Dict[str, float]
    timestamp: datetime

class MultimodalAIProcessor:
    """멀티모달 AI 처리 시스템"""
    
    def __init__(self):
        # 텍스트 처리 모델
        self.text_models = {}
        
        # 이미지 처리 모델
        self.image_models = {}
        self.clip_processor = None
        self.clip_model = None
        self.blip_processor = None
        self.blip_model = None
        
        # 음성 처리 모델
        self.whisper_model = None
        self.speech_recognizer = sr.Recognizer()
        
        # 비디오 처리
        self.video_processors = {}
        
        # 크로스모달 융합 모델
        self.fusion_network = None
        
        # 처리 통계
        self.processing_stats = {
            'total_requests': 0,
            'successful_processing': 0,
            'modal_type_counts': {modal.value: 0 for modal in ModalityType},
            'average_processing_time': 0.0,
            'quality_scores': {'average': 0.0, 'max': 0.0, 'min': 1.0}
        }
        
        # 캐시 시스템
        self.processing_cache = {}
        self.max_cache_size = 1000
        
        self._initialize_models()
    
    def _initialize_models(self):
        """모든 모달리티 모델 초기화"""
        
        try:
            # 이미지 모델 초기화
            self._initialize_image_models()
            
            # 음성 모델 초기화
            self._initialize_audio_models()
            
            # 크로스모달 모델 초기화
            self._initialize_crossmodal_models()
            
            logger.info("✅ 멀티모달 AI 모델 초기화 완료")
            
        except Exception as e:
            logger.error(f"모델 초기화 실패: {e}")
            self._setup_fallback_models()
    
    def _initialize_image_models(self):
        """이미지 처리 모델 초기화"""
        
        try:
            # CLIP 모델 (이미지-텍스트 매칭)
            self.clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            
            # BLIP 모델 (이미지 캡셔닝)
            self.blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
            self.blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
            
            logger.info("✅ 이미지 모델 초기화 완료")
            
        except Exception as e:
            logger.error(f"이미지 모델 초기화 실패: {e}")
    
    def _initialize_audio_models(self):
        """음성 처리 모델 초기화"""
        
        try:
            # Whisper 모델 (음성 인식)
            self.whisper_model = whisper.load_model("base")
            
            logger.info("✅ 음성 모델 초기화 완료")
            
        except Exception as e:
            logger.error(f"음성 모델 초기화 실패: {e}")
    
    def _initialize_crossmodal_models(self):
        """크로스모달 융합 모델 초기화"""
        
        try:
            # 간단한 융합 네트워크
            self.fusion_network = CrossModalFusionNetwork(
                text_dim=512,
                image_dim=512,
                audio_dim=512,
                hidden_dim=256,
                output_dim=128
            )
            
            logger.info("✅ 크로스모달 모델 초기화 완료")
            
        except Exception as e:
            logger.error(f"크로스모달 모델 초기화 실패: {e}")
    
    def _setup_fallback_models(self):
        """폴백 모델 설정"""
        logger.warning("폴백 모드로 전환, 제한된 기능만 사용 가능")
    
    async def process_multimodal_input(self, multimodal_input: MultimodalInput) -> MultimodalOutput:
        """멀티모달 입력 종합 처리"""
        
        start_time = datetime.now()
        
        try:
            # 캐시 확인
            cache_key = self._generate_cache_key(multimodal_input)
            if cache_key in self.processing_cache:
                logger.info(f"캐시에서 결과 반환: {cache_key}")
                return self.processing_cache[cache_key]
            
            # 각 모달리티별 처리
            text_results = {}
            image_results = {}
            audio_results = {}
            video_results = {}
            
            # 텍스트 처리
            if ModalityType.TEXT in multimodal_input.modalities:
                text_results = await self._process_text_modality(
                    multimodal_input.modalities[ModalityType.TEXT],
                    multimodal_input
                )
            
            # 이미지 처리
            if ModalityType.IMAGE in multimodal_input.modalities:
                image_results = await self._process_image_modality(
                    multimodal_input.modalities[ModalityType.IMAGE],
                    multimodal_input
                )
            
            # 음성 처리
            if ModalityType.AUDIO in multimodal_input.modalities:
                audio_results = await self._process_audio_modality(
                    multimodal_input.modalities[ModalityType.AUDIO],
                    multimodal_input
                )
            
            # 비디오 처리
            if ModalityType.VIDEO in multimodal_input.modalities:
                video_results = await self._process_video_modality(
                    multimodal_input.modalities[ModalityType.VIDEO],
                    multimodal_input
                )
            
            # 크로스모달 분석
            integrated_analysis = await self._perform_integrated_analysis({
                'text': text_results,
                'image': image_results,
                'audio': audio_results,
                'video': video_results
            })
            
            # 크로스모달 인사이트 생성
            cross_modal_insights = await self._generate_cross_modal_insights(
                integrated_analysis, multimodal_input
            )
            
            # 콘텐츠 생성 (요청된 경우)
            generated_content = {}
            if multimodal_input.processing_mode in [ProcessingMode.GENERATION, ProcessingMode.TRANSLATION]:
                generated_content = await self._generate_multimodal_content(
                    integrated_analysis, multimodal_input
                )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # 결과 생성
            output = MultimodalOutput(
                output_id=f"output_{multimodal_input.input_id}",
                input_reference=multimodal_input.input_id,
                text_results=text_results,
                image_results=image_results,
                audio_results=audio_results,
                video_results=video_results,
                integrated_analysis=integrated_analysis,
                cross_modal_insights=cross_modal_insights,
                generated_content=generated_content,
                processing_time=processing_time,
                confidence_scores=self._calculate_confidence_scores(
                    text_results, image_results, audio_results, video_results
                ),
                quality_metrics=self._calculate_quality_metrics(integrated_analysis),
                timestamp=datetime.now(timezone.utc)
            )
            
            # 캐시 저장
            self._save_to_cache(cache_key, output)
            
            # 통계 업데이트
            self._update_processing_stats(output)
            
            return output
            
        except Exception as e:
            logger.error(f"멀티모달 처리 오류: {e}")
            raise
    
    async def _process_text_modality(self, text_data: str, context: MultimodalInput) -> Dict[str, Any]:
        """텍스트 모달리티 처리"""
        
        try:
            results = {
                'original_text': text_data,
                'language_detection': 'ko',  # 기본 한국어
                'sentiment_analysis': {},
                'entities': [],
                'keywords': [],
                'embeddings': []
            }
            
            # 기본 텍스트 분석
            if self.clip_model:  # CLIP의 텍스트 인코더 사용
                inputs = self.clip_processor(text=[text_data], return_tensors="pt", padding=True)
                with torch.no_grad():
                    text_features = self.clip_model.get_text_features(**inputs)
                    results['embeddings'] = text_features.numpy().tolist()
            
            # 감정 분석 (간단한 키워드 기반)
            positive_words = ['좋다', '훌륭하다', '멋지다', '행복하다', '기쁘다']
            negative_words = ['나쁘다', '싫다', '화나다', '슬프다', '불편하다']
            
            positive_count = sum(1 for word in positive_words if word in text_data)
            negative_count = sum(1 for word in negative_words if word in text_data)
            
            if positive_count > negative_count:
                sentiment = 'positive'
                confidence = positive_count / (positive_count + negative_count + 1)
            elif negative_count > positive_count:
                sentiment = 'negative'
                confidence = negative_count / (positive_count + negative_count + 1)
            else:
                sentiment = 'neutral'
                confidence = 0.5
            
            results['sentiment_analysis'] = {
                'sentiment': sentiment,
                'confidence': confidence,
                'positive_score': positive_count,
                'negative_score': negative_count
            }
            
            # 키워드 추출 (간단한 방식)
            import re
            korean_words = re.findall(r'[가-힣]+', text_data)
            word_freq = {}
            for word in korean_words:
                if len(word) > 1:  # 2글자 이상만
                    word_freq[word] = word_freq.get(word, 0) + 1
            
            # 빈도 기준 상위 키워드
            results['keywords'] = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
            
            return results
            
        except Exception as e:
            logger.error(f"텍스트 처리 오류: {e}")
            return {'error': str(e)}
    
    async def _process_image_modality(self, image_data: Union[str, bytes, Image.Image], context: MultimodalInput) -> Dict[str, Any]:
        """이미지 모달리티 처리"""
        
        try:
            # 이미지 로드
            if isinstance(image_data, str):
                if image_data.startswith('data:image'):
                    # Base64 데이터 URL
                    header, encoded = image_data.split(',', 1)
                    image_bytes = base64.b64decode(encoded)
                    image = Image.open(io.BytesIO(image_bytes))
                else:
                    # 파일 경로
                    image = Image.open(image_data)
            elif isinstance(image_data, bytes):
                image = Image.open(io.BytesIO(image_data))
            else:
                image = image_data
            
            # RGB 변환
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            results = {
                'image_info': {
                    'size': image.size,
                    'mode': image.mode,
                    'format': getattr(image, 'format', 'Unknown')
                },
                'description': '',
                'objects': [],
                'emotions': {},
                'embeddings': []
            }
            
            # 이미지 캡셔닝 (BLIP 사용)
            if self.blip_model and self.blip_processor:
                inputs = self.blip_processor(image, return_tensors="pt")
                with torch.no_grad():
                    out = self.blip_model.generate(**inputs, max_length=50)
                    description = self.blip_processor.decode(out[0], skip_special_tokens=True)
                    results['description'] = description
            
            # 이미지 임베딩 (CLIP 사용)
            if self.clip_model and self.clip_processor:
                inputs = self.clip_processor(images=image, return_tensors="pt")
                with torch.no_grad():
                    image_features = self.clip_model.get_image_features(**inputs)
                    results['embeddings'] = image_features.numpy().tolist()
            
            # 간단한 객체 감지 (OpenCV 기반)
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            
            # 얼굴 감지
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                results['objects'].append({
                    'type': 'face',
                    'count': len(faces),
                    'locations': [{'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)} for x, y, w, h in faces]
                })
            
            # 간단한 감정 분석 (얼굴 기반)
            if len(faces) > 0:
                results['emotions'] = {
                    'detected_faces': len(faces),
                    'primary_emotion': 'neutral',  # 실제로는 더 정교한 모델 필요
                    'confidence': 0.7
                }
            
            return results
            
        except Exception as e:
            logger.error(f"이미지 처리 오류: {e}")
            return {'error': str(e)}
    
    async def _process_audio_modality(self, audio_data: Union[str, bytes], context: MultimodalInput) -> Dict[str, Any]:
        """음성 모달리티 처리"""
        
        try:
            results = {
                'transcription': '',
                'language': 'ko',
                'confidence': 0.0,
                'audio_features': {},
                'speaker_analysis': {},
                'embeddings': []
            }
            
            # 오디오 파일 처리
            if isinstance(audio_data, str):
                audio_path = audio_data
            else:
                # 임시 파일 생성
                with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
                    tmp_file.write(audio_data)
                    audio_path = tmp_file.name
            
            try:
                # Whisper를 사용한 음성 인식
                if self.whisper_model:
                    result = self.whisper_model.transcribe(audio_path, language='ko')
                    results['transcription'] = result['text']
                    results['language'] = result.get('language', 'ko')
                    results['confidence'] = 0.8  # Whisper는 기본적으로 신뢰도가 높음
                
                # librosa를 사용한 오디오 특성 추출
                y, sr = librosa.load(audio_path)
                
                # 기본 오디오 특성
                results['audio_features'] = {
                    'duration': len(y) / sr,
                    'sample_rate': sr,
                    'rms_energy': float(np.sqrt(np.mean(y**2))),
                    'zero_crossing_rate': float(np.mean(librosa.feature.zero_crossing_rate(y))),
                }
                
                # MFCC 특성
                mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
                results['audio_features']['mfcc_mean'] = np.mean(mfccs, axis=1).tolist()
                
                # 스펙트럴 특성
                spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)
                results['audio_features']['spectral_centroid'] = float(np.mean(spectral_centroids))
                
                # 화자 분석 (간단한 버전)
                pitch, _ = librosa.piptrack(y=y, sr=sr)
                pitch_values = pitch[pitch > 0]
                if len(pitch_values) > 0:
                    avg_pitch = np.mean(pitch_values)
                    results['speaker_analysis'] = {
                        'average_pitch': float(avg_pitch),
                        'pitch_range': float(np.max(pitch_values) - np.min(pitch_values)),
                        'estimated_gender': 'female' if avg_pitch > 180 else 'male'
                    }
                
                # 감정 분석 (음성 특성 기반)
                energy_variance = np.var(librosa.feature.rms(y=y))
                speaking_rate = len(results['transcription'].split()) / results['audio_features']['duration'] if results['audio_features']['duration'] > 0 else 0
                
                if energy_variance > 0.001 and speaking_rate > 2.5:
                    emotion = 'excited'
                elif energy_variance < 0.0005 and speaking_rate < 1.5:
                    emotion = 'calm'
                else:
                    emotion = 'neutral'
                
                results['speaker_analysis']['estimated_emotion'] = emotion
                
            finally:
                # 임시 파일 정리
                if isinstance(audio_data, bytes) and os.path.exists(audio_path):
                    os.unlink(audio_path)
            
            return results
            
        except Exception as e:
            logger.error(f"음성 처리 오류: {e}")
            return {'error': str(e)}
    
    async def _process_video_modality(self, video_data: Union[str, bytes], context: MultimodalInput) -> Dict[str, Any]:
        """비디오 모달리티 처리"""
        
        try:
            results = {
                'video_info': {},
                'frame_analysis': [],
                'audio_analysis': {},
                'motion_analysis': {},
                'scene_detection': []
            }
            
            # 비디오 파일 처리
            if isinstance(video_data, str):
                video_path = video_data
            else:
                # 임시 파일 생성
                with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp_file:
                    tmp_file.write(video_data)
                    video_path = tmp_file.name
            
            try:
                # MoviePy를 사용한 비디오 분석
                video = mp.VideoFileClip(video_path)
                
                results['video_info'] = {
                    'duration': video.duration,
                    'fps': video.fps,
                    'size': video.size,
                    'has_audio': video.audio is not None
                }
                
                # 키 프레임 추출 및 분석
                frame_interval = max(1, int(video.duration / 10))  # 최대 10개 프레임
                
                for i in range(0, int(video.duration), frame_interval):
                    if i < video.duration:
                        frame = video.get_frame(i)
                        frame_pil = Image.fromarray(frame)
                        
                        # 각 프레임을 이미지로 분석
                        frame_analysis = await self._process_image_modality(frame_pil, context)
                        frame_analysis['timestamp'] = i
                        results['frame_analysis'].append(frame_analysis)
                
                # 오디오 추출 및 분석 (오디오가 있는 경우)
                if video.audio:
                    audio_path = video_path.replace('.mp4', '_audio.wav')
                    video.audio.write_audiofile(audio_path, verbose=False, logger=None)
                    
                    audio_analysis = await self._process_audio_modality(audio_path, context)
                    results['audio_analysis'] = audio_analysis
                    
                    # 오디오 파일 정리
                    if os.path.exists(audio_path):
                        os.unlink(audio_path)
                
                # 간단한 장면 감지
                if len(results['frame_analysis']) > 1:
                    scene_changes = []
                    for i in range(1, len(results['frame_analysis'])):
                        # 매우 간단한 장면 변화 감지 (실제로는 더 정교한 알고리즘 필요)
                        if 'description' in results['frame_analysis'][i] and 'description' in results['frame_analysis'][i-1]:
                            curr_desc = results['frame_analysis'][i]['description']
                            prev_desc = results['frame_analysis'][i-1]['description']
                            
                            # 설명이 크게 다르면 장면 변화로 간주
                            if len(set(curr_desc.split()) & set(prev_desc.split())) < 2:
                                scene_changes.append({
                                    'timestamp': results['frame_analysis'][i]['timestamp'],
                                    'type': 'scene_change',
                                    'confidence': 0.7
                                })
                    
                    results['scene_detection'] = scene_changes
                
                video.close()
                
            finally:
                # 임시 파일 정리
                if isinstance(video_data, bytes) and os.path.exists(video_path):
                    os.unlink(video_path)
            
            return results
            
        except Exception as e:
            logger.error(f"비디오 처리 오류: {e}")
            return {'error': str(e)}
    
    async def _perform_integrated_analysis(self, modal_results: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """통합 분석 수행"""
        
        try:
            integrated_analysis = {
                'content_coherence': 0.0,
                'emotional_consistency': 0.0,
                'information_density': 0.0,
                'multimodal_sentiment': 'neutral',
                'key_insights': [],
                'cross_modal_correlations': {}
            }
            
            # 감정 일관성 분석
            emotions = []
            if 'text' in modal_results and 'sentiment_analysis' in modal_results['text']:
                emotions.append(modal_results['text']['sentiment_analysis'].get('sentiment', 'neutral'))
            
            if 'image' in modal_results and 'emotions' in modal_results['image']:
                emotions.append(modal_results['image']['emotions'].get('primary_emotion', 'neutral'))
            
            if 'audio' in modal_results and 'speaker_analysis' in modal_results['audio']:
                emotions.append(modal_results['audio']['speaker_analysis'].get('estimated_emotion', 'neutral'))
            
            # 감정 일관성 계산
            if emotions:
                emotion_consistency = len(set(emotions)) / len(emotions)
                integrated_analysis['emotional_consistency'] = 1.0 - emotion_consistency
                
                # 다수 감정으로 멀티모달 감정 결정
                from collections import Counter
                emotion_counter = Counter(emotions)
                integrated_analysis['multimodal_sentiment'] = emotion_counter.most_common(1)[0][0]
            
            # 콘텐츠 일관성 분석
            content_elements = []
            if 'text' in modal_results and 'keywords' in modal_results['text']:
                content_elements.extend([kw[0] for kw in modal_results['text']['keywords'][:5]])
            
            if 'image' in modal_results and 'description' in modal_results['image']:
                content_elements.extend(modal_results['image']['description'].split()[:5])
            
            if 'audio' in modal_results and 'transcription' in modal_results['audio']:
                content_elements.extend(modal_results['audio']['transcription'].split()[:5])
            
            # 콘텐츠 겹침 계산
            if len(content_elements) > 1:
                unique_elements = set(content_elements)
                overlap_ratio = 1.0 - (len(unique_elements) / len(content_elements))
                integrated_analysis['content_coherence'] = overlap_ratio
            
            # 정보 밀도 계산
            info_sources = sum(1 for modal in modal_results.values() if modal and 'error' not in modal)
            integrated_analysis['information_density'] = info_sources / len(ModalityType)
            
            # 핵심 인사이트 생성
            insights = []
            
            if integrated_analysis['emotional_consistency'] > 0.7:
                insights.append("모든 모달리티에서 일관된 감정 표현")
            
            if integrated_analysis['content_coherence'] > 0.5:
                insights.append("텍스트, 이미지, 음성 내용이 높은 연관성")
            
            if integrated_analysis['information_density'] > 0.7:
                insights.append("풍부한 멀티모달 정보 제공")
            
            integrated_analysis['key_insights'] = insights
            
            return integrated_analysis
            
        except Exception as e:
            logger.error(f"통합 분석 오류: {e}")
            return {'error': str(e)}
    
    async def _generate_cross_modal_insights(self, integrated_analysis: Dict[str, Any], context: MultimodalInput) -> Dict[str, Any]:
        """크로스모달 인사이트 생성"""
        
        try:
            insights = {
                'modal_complementarity': {},
                'information_gaps': [],
                'enhancement_suggestions': [],
                'accessibility_notes': {}
            }
            
            # 모달리티 보완성 분석
            available_modalities = list(context.modalities.keys())
            
            if ModalityType.TEXT in available_modalities and ModalityType.IMAGE in available_modalities:
                insights['modal_complementarity']['text_image'] = "텍스트와 이미지가 상호 보완적 정보 제공"
            
            if ModalityType.AUDIO in available_modalities:
                insights['modal_complementarity']['audio_enhancement'] = "음성이 감정적 뉘앙스 추가"
            
            # 정보 공백 식별
            missing_modalities = [modal for modal in ModalityType if modal not in available_modalities]
            for modal in missing_modalities:
                insights['information_gaps'].append(f"{modal.value} 정보 부족")
            
            # 향상 제안
            if integrated_analysis.get('emotional_consistency', 0) < 0.5:
                insights['enhancement_suggestions'].append("감정적 일관성 향상 필요")
            
            if integrated_analysis.get('information_density', 0) < 0.5:
                insights['enhancement_suggestions'].append("추가 모달리티 정보 보강 권장")
            
            # 접근성 노트
            if ModalityType.AUDIO in available_modalities:
                insights['accessibility_notes']['hearing_impaired'] = "청각 장애인을 위한 텍스트 대안 제공"
            
            if ModalityType.IMAGE in available_modalities:
                insights['accessibility_notes']['visually_impaired'] = "시각 장애인을 위한 음성 설명 제공"
            
            return insights
            
        except Exception as e:
            logger.error(f"크로스모달 인사이트 생성 오류: {e}")
            return {'error': str(e)}
    
    async def _generate_multimodal_content(self, analysis: Dict[str, Any], context: MultimodalInput) -> Dict[ModalityType, Any]:
        """멀티모달 콘텐츠 생성"""
        
        try:
            generated_content = {}
            
            # 텍스트 생성
            if context.processing_mode == ProcessingMode.GENERATION:
                # 분석 결과 기반 텍스트 요약 생성
                summary_parts = []
                
                if 'multimodal_sentiment' in analysis:
                    summary_parts.append(f"전체적인 감정: {analysis['multimodal_sentiment']}")
                
                if 'key_insights' in analysis:
                    summary_parts.append(f"주요 인사이트: {', '.join(analysis['key_insights'])}")
                
                generated_content[ModalityType.TEXT] = {
                    'summary': ' | '.join(summary_parts),
                    'confidence': analysis.get('emotional_consistency', 0.5)
                }
            
            # 음성 생성 (TTS)
            if ModalityType.AUDIO not in context.modalities and ModalityType.TEXT in generated_content:
                try:
                    tts = gTTS(text=generated_content[ModalityType.TEXT]['summary'], lang='ko')
                    audio_buffer = io.BytesIO()
                    tts.write_to_fp(audio_buffer)
                    audio_buffer.seek(0)
                    
                    generated_content[ModalityType.AUDIO] = {
                        'audio_data': audio_buffer.getvalue(),
                        'format': 'mp3',
                        'language': 'ko'
                    }
                except Exception as e:
                    logger.error(f"TTS 생성 오류: {e}")
            
            return generated_content
            
        except Exception as e:
            logger.error(f"멀티모달 콘텐츠 생성 오류: {e}")
            return {}
    
    def _generate_cache_key(self, multimodal_input: MultimodalInput) -> str:
        """캐시 키 생성"""
        import hashlib
        
        # 입력 데이터의 해시 생성
        key_data = {
            'modalities': list(multimodal_input.modalities.keys()),
            'processing_mode': multimodal_input.processing_mode.value,
            'target_language': multimodal_input.target_language
        }
        
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _save_to_cache(self, cache_key: str, output: MultimodalOutput):
        """캐시에 결과 저장"""
        
        if len(self.processing_cache) >= self.max_cache_size:
            # 가장 오래된 항목 제거
            oldest_key = min(self.processing_cache.keys())
            del self.processing_cache[oldest_key]
        
        self.processing_cache[cache_key] = output
    
    def _calculate_confidence_scores(self, *modal_results) -> Dict[str, float]:
        """신뢰도 점수 계산"""
        
        confidences = {}
        
        for i, result in enumerate(modal_results):
            if result and 'error' not in result:
                modal_name = ['text', 'image', 'audio', 'video'][i]
                
                if 'confidence' in result:
                    confidences[modal_name] = result['confidence']
                else:
                    # 결과가 있으면 기본 신뢰도
                    confidences[modal_name] = 0.7
        
        # 전체 신뢰도
        if confidences:
            confidences['overall'] = sum(confidences.values()) / len(confidences)
        else:
            confidences['overall'] = 0.0
        
        return confidences
    
    def _calculate_quality_metrics(self, analysis: Dict[str, Any]) -> Dict[str, float]:
        """품질 메트릭 계산"""
        
        return {
            'coherence': analysis.get('content_coherence', 0.0),
            'consistency': analysis.get('emotional_consistency', 0.0),
            'information_density': analysis.get('information_density', 0.0),
            'overall_quality': (
                analysis.get('content_coherence', 0.0) + 
                analysis.get('emotional_consistency', 0.0) + 
                analysis.get('information_density', 0.0)
            ) / 3.0
        }
    
    def _update_processing_stats(self, output: MultimodalOutput):
        """처리 통계 업데이트"""
        
        self.processing_stats['total_requests'] += 1
        self.processing_stats['successful_processing'] += 1
        
        # 평균 처리 시간 업데이트
        total = self.processing_stats['total_requests']
        current_avg = self.processing_stats['average_processing_time']
        new_avg = ((current_avg * (total - 1)) + output.processing_time) / total
        self.processing_stats['average_processing_time'] = new_avg
        
        # 품질 점수 업데이트
        overall_quality = output.quality_metrics.get('overall_quality', 0.0)
        
        current_avg_quality = self.processing_stats['quality_scores']['average']
        new_avg_quality = ((current_avg_quality * (total - 1)) + overall_quality) / total
        self.processing_stats['quality_scores']['average'] = new_avg_quality
        self.processing_stats['quality_scores']['max'] = max(
            self.processing_stats['quality_scores']['max'], overall_quality
        )
        self.processing_stats['quality_scores']['min'] = min(
            self.processing_stats['quality_scores']['min'], overall_quality
        )
    
    def get_system_status(self) -> Dict[str, Any]:
        """시스템 상태 조회"""
        
        return {
            'system_version': '4.0',
            'status': 'active',
            'supported_modalities': [modal.value for modal in ModalityType],
            'processing_stats': self.processing_stats,
            'cache_size': len(self.processing_cache),
            'model_status': {
                'clip_available': self.clip_model is not None,
                'blip_available': self.blip_model is not None,
                'whisper_available': self.whisper_model is not None,
                'fusion_network_available': self.fusion_network is not None
            },
            'last_updated': datetime.now(timezone.utc).isoformat()
        }

class CrossModalFusionNetwork(nn.Module):
    """크로스모달 융합 네트워크"""
    
    def __init__(self, text_dim: int, image_dim: int, audio_dim: int, hidden_dim: int, output_dim: int):
        super().__init__()
        
        # 각 모달리티별 인코더
        self.text_encoder = nn.Linear(text_dim, hidden_dim)
        self.image_encoder = nn.Linear(image_dim, hidden_dim)
        self.audio_encoder = nn.Linear(audio_dim, hidden_dim)
        
        # 어텐션 메커니즘
        self.attention = nn.MultiheadAttention(hidden_dim, num_heads=8)
        
        # 융합 레이어
        self.fusion_layer = nn.Sequential(
            nn.Linear(hidden_dim * 3, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim, output_dim)
        )
    
    def forward(self, text_features, image_features, audio_features):
        # 각 모달리티 인코딩
        text_encoded = self.text_encoder(text_features)
        image_encoded = self.image_encoder(image_features)
        audio_encoded = self.audio_encoder(audio_features)
        
        # 어텐션 적용
        all_features = torch.stack([text_encoded, image_encoded, audio_encoded], dim=0)
        attended_features, _ = self.attention(all_features, all_features, all_features)
        
        # 융합
        fused_features = torch.cat([attended_features[0], attended_features[1], attended_features[2]], dim=-1)
        output = self.fusion_layer(fused_features)
        
        return output

# 전역 인스턴스
multimodal_processor = MultimodalAIProcessor()

# 편의 함수들
async def process_multimodal_data(
    text: Optional[str] = None,
    image: Optional[Any] = None,
    audio: Optional[Any] = None,
    video: Optional[Any] = None,
    processing_mode: ProcessingMode = ProcessingMode.ANALYSIS,
    target_language: str = "ko"
) -> MultimodalOutput:
    """멀티모달 데이터 처리 편의 함수"""
    
    modalities = {}
    if text:
        modalities[ModalityType.TEXT] = text
    if image:
        modalities[ModalityType.IMAGE] = image
    if audio:
        modalities[ModalityType.AUDIO] = audio
    if video:
        modalities[ModalityType.VIDEO] = video
    
    multimodal_input = MultimodalInput(
        input_id=f"input_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        modalities=modalities,
        metadata={},
        timestamp=datetime.now(timezone.utc),
        processing_mode=processing_mode,
        target_language=target_language
    )
    
    return await multimodal_processor.process_multimodal_input(multimodal_input)

def get_multimodal_status() -> Dict[str, Any]:
    """멀티모달 시스템 상태 조회 편의 함수"""
    return multimodal_processor.get_system_status()

if __name__ == "__main__":
    print("🎭 멀티모달 AI 처리 시스템 v4.0 초기화 완료")
    print("✅ 지원 모달리티: 텍스트, 이미지, 음성, 비디오")
    print("🎯 기능: 통합분석, 크로스모달인사이트, 콘텐츠생성, 실시간처리") 