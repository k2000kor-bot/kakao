#!/usr/bin/env python3
"""
실시간 음성 인식 시스템
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional
import speech_recognition as sr
import whisper
import numpy as np
from datetime import datetime

class RealTimeVoiceRecognition:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.whisper_model = None
        self.is_listening = False
        self.audio_queue = asyncio.Queue()
        self.recognition_results = []
        
        # 로깅 설정
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Whisper 모델 초기화
        try:
            self.whisper_model = whisper.load_model("base")
            self.logger.info("✅ Whisper 모델 로드 완료")
        except Exception as e:
            self.logger.warning(f"⚠️ Whisper 모델 로드 실패: {e}")
    
    async def start_listening(self):
        """실시간 음성 인식 시작"""
        self.is_listening = True
        self.logger.info("🎤 실시간 음성 인식 시작")
        
        try:
            with sr.Microphone() as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                
                while self.is_listening:
                    try:
                        audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=10)
                        await self.audio_queue.put(audio)
                        
                        # 비동기로 음성 처리
                        asyncio.create_task(self.process_audio(audio))
                        
                    except sr.WaitTimeoutError:
                        continue
                    except Exception as e:
                        self.logger.error(f"음성 인식 오류: {e}")
                        
        except Exception as e:
            self.logger.error(f"마이크 초기화 실패: {e}")
    
    async def process_audio(self, audio):
        """음성 데이터 처리"""
        try:
            # Google Speech Recognition
            try:
                text_google = self.recognizer.recognize_google(audio, language='ko-KR')
                confidence_google = 0.8
            except:
                text_google = None
                confidence_google = 0.0
            
            # Whisper 처리
            text_whisper = None
            confidence_whisper = 0.0
            
            if self.whisper_model:
                try:
                    # 오디오를 numpy 배열로 변환
                    audio_data = np.frombuffer(audio.frame_data, dtype=np.int16)
                    result = self.whisper_model.transcribe(audio_data)
                    text_whisper = result["text"]
                    confidence_whisper = result.get("confidence", 0.7)
                except Exception as e:
                    self.logger.warning(f"Whisper 처리 실패: {e}")
            
            # 최적 결과 선택
            if text_google and text_whisper:
                if confidence_google > confidence_whisper:
                    final_text = text_google
                    final_confidence = confidence_google
                    method = "google"
                else:
                    final_text = text_whisper
                    final_confidence = confidence_whisper
                    method = "whisper"
            elif text_google:
                final_text = text_google
                final_confidence = confidence_google
                method = "google"
            elif text_whisper:
                final_text = text_whisper
                final_confidence = confidence_whisper
                method = "whisper"
            else:
                final_text = ""
                final_confidence = 0.0
                method = "none"
            
            if final_text:
                result = {
                    "text": final_text,
                    "confidence": final_confidence,
                    "method": method,
                    "timestamp": datetime.now().isoformat(),
                    "duration": len(audio.frame_data) / audio.sample_rate
                }
                
                self.recognition_results.append(result)
                self.logger.info(f"음성 인식: {final_text} (신뢰도: {final_confidence:.2f})")
                
                return result
                
        except Exception as e:
            self.logger.error(f"음성 처리 오류: {e}")
            return None
    
    def stop_listening(self):
        """음성 인식 중지"""
        self.is_listening = False
        self.logger.info("🛑 실시간 음성 인식 중지")
    
    def get_recognition_results(self) -> List[Dict]:
        """인식 결과 반환"""
        return self.recognition_results
    
    def clear_results(self):
        """결과 초기화"""
        self.recognition_results.clear()
    
    async def recognize_file(self, audio_file_path: str) -> Dict:
        """음성 파일 인식"""
        try:
            with sr.AudioFile(audio_file_path) as source:
                audio = self.recognizer.record(source)
                return await self.process_audio(audio)
        except Exception as e:
            self.logger.error(f"파일 인식 실패: {e}")
            return None

# 전역 인스턴스
voice_recognition = RealTimeVoiceRecognition() 