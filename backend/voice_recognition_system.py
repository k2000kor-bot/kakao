#!/usr/bin/env python3
"""
실시간 음성 인식 시스템 v1.0
- 음성 인식 시작/중지 API
- 실시간 음성 스트리밍
- 음성 결과 처리
- 음성 명령 시스템
"""

import os
import asyncio
import json
import logging
import time
import wave
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import speech_recognition as sr
import threading
import queue
import base64
import io

from cors_config import get_cors_allow_origins

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="실시간 음성 인식 시스템", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 데이터 모델들 ====================

class VoiceRecognitionRequest(BaseModel):
    """음성 인식 요청"""
    audio_data: str  # Base64 인코딩된 오디오 데이터
    language: str = "ko-KR"
    timeout: int = 10
    phrase_time_limit: Optional[float] = None

class VoiceCommandRequest(BaseModel):
    """음성 명령 요청"""
    command: str
    context: Dict[str, Any] = {}
    user_id: Optional[str] = None

class VoiceAnalysisResult(BaseModel):
    """음성 분석 결과"""
    text: str
    confidence: float
    language: str
    duration: float
    timestamp: str
    emotions: Dict[str, float] = {}
    keywords: List[str] = []
    sentiment: str = "neutral"

# ==================== 전역 변수들 ====================

# 음성 인식 상태 관리
voice_recognition_status = {
    "is_active": False,
    "current_session": None,
    "total_sessions": 0,
    "successful_recognitions": 0,
    "failed_recognitions": 0
}

# 음성 명령 시스템
voice_commands = {
    "분석 시작": "start_analysis",
    "분석 중지": "stop_analysis",
    "요약 생성": "generate_summary",
    "통계 보기": "show_statistics",
    "도움말": "show_help",
    "음성 인식 시작": "start_voice_recognition",
    "음성 인식 중지": "stop_voice_recognition",
    "메시지 생성": "generate_message",
    "감정 분석": "analyze_emotion",
    "키워드 추출": "extract_keywords"
}

# 실시간 음성 스트림 관리
voice_streams = {}
audio_queue = queue.Queue()

# ==================== 음성 인식 핵심 기능 ====================

class VoiceRecognitionEngine:
    """고급 음성 인식 엔진"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 4000
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8
        self.recognizer.phrase_threshold = 0.3
        self.recognizer.non_speaking_duration = 0.5
        
        # 한국어 음성 인식 최적화
        self.recognizer.operation_timeout = 10
        self.recognizer.phrase_time_limit = 5
        
        # 감정 분석 및 키워드 추출을 위한 설정
        self.emotion_keywords = {
            "긍정": ["좋다", "감사", "고맙다", "희망", "기대", "만족"],
            "부정": ["나쁘다", "실망", "우려", "걱정", "화나다", "짜증"],
            "중립": ["그렇다", "알겠다", "네", "아니오", "확인"]
        }
        
        logger.info("음성 인식 엔진 초기화 완료")
    
    async def recognize_speech(self, audio_data: str, language: str = "ko-KR") -> VoiceAnalysisResult:
        """음성 인식 및 분석"""
        try:
            # Base64 디코딩
            audio_bytes = base64.b64decode(audio_data)
            
            # 오디오 데이터를 AudioData로 변환
            audio = sr.AudioData(audio_bytes, sample_rate=16000, sample_width=2)
            
            # 음성 인식 실행
            start_time = time.time()
            text = self.recognizer.recognize_google(audio, language=language)
            duration = time.time() - start_time
            
            # 신뢰도 계산 (Google Speech Recognition은 신뢰도를 직접 제공하지 않으므로 추정)
            confidence = self._calculate_confidence(text, duration)
            
            # 감정 분석
            emotions = self._analyze_emotions(text)
            
            # 키워드 추출
            keywords = self._extract_keywords(text)
            
            # 감정 판단
            sentiment = self._determine_sentiment(emotions)
            
            result = VoiceAnalysisResult(
                text=text,
                confidence=confidence,
                language=language,
                duration=duration,
                timestamp=datetime.now().isoformat(),
                emotions=emotions,
                keywords=keywords,
                sentiment=sentiment
            )
            
            # 통계 업데이트
            voice_recognition_status["successful_recognitions"] += 1
            
            logger.info(f"음성 인식 성공: {text[:50]}... (신뢰도: {confidence:.2f})")
            
            return result
            
        except sr.UnknownValueError:
            logger.warning("음성을 인식할 수 없습니다.")
            voice_recognition_status["failed_recognitions"] += 1
            raise HTTPException(status_code=400, detail="음성을 인식할 수 없습니다.")
            
        except sr.RequestError as e:
            logger.error(f"음성 인식 서비스 오류: {e}")
            voice_recognition_status["failed_recognitions"] += 1
            raise HTTPException(status_code=500, detail="음성 인식 서비스에 문제가 발생했습니다.")
            
        except Exception as e:
            logger.error(f"음성 인식 중 오류 발생: {e}")
            voice_recognition_status["failed_recognitions"] += 1
            raise HTTPException(status_code=500, detail="음성 인식 중 오류가 발생했습니다.")
    
    def _calculate_confidence(self, text: str, duration: float) -> float:
        """신뢰도 계산 (추정)"""
        # 텍스트 길이, 발화 시간, 명확한 단어 수 등을 고려한 신뢰도 추정
        base_confidence = 0.8
        
        # 텍스트 길이에 따른 조정
        if len(text) > 50:
            base_confidence += 0.1
        elif len(text) < 10:
            base_confidence -= 0.1
        
        # 발화 시간에 따른 조정
        if 1.0 <= duration <= 5.0:
            base_confidence += 0.05
        elif duration > 10.0:
            base_confidence -= 0.1
        
        # 명확한 단어 수에 따른 조정
        clear_words = len([word for word in text.split() if len(word) > 1])
        if clear_words > 5:
            base_confidence += 0.05
        
        return min(max(base_confidence, 0.0), 1.0)
    
    def _analyze_emotions(self, text: str) -> Dict[str, float]:
        """감정 분석"""
        emotions = {
            "긍정": 0.0,
            "부정": 0.0,
            "중립": 0.0
        }
        
        text_lower = text.lower()
        
        # 각 감정 카테고리의 키워드 수 계산
        for emotion, keywords in self.emotion_keywords.items():
            count = sum(1 for keyword in keywords if keyword in text_lower)
            emotions[emotion] = count / len(keywords) if keywords else 0.0
        
        # 정규화
        total = sum(emotions.values())
        if total > 0:
            for emotion in emotions:
                emotions[emotion] /= total
        
        return emotions
    
    def _extract_keywords(self, text: str) -> List[str]:
        """키워드 추출"""
        # 한국어 주요 키워드 추출
        keywords = []
        
        # 분석 관련 키워드
        analysis_keywords = ["분석", "통계", "요약", "결과", "데이터", "차트", "그래프"]
        for keyword in analysis_keywords:
            if keyword in text:
                keywords.append(keyword)
        
        # 감정 관련 키워드
        emotion_keywords = ["좋다", "나쁘다", "화나다", "기쁘다", "슬프다", "걱정", "기대"]
        for keyword in emotion_keywords:
            if keyword in text:
                keywords.append(keyword)
        
        # 명령 관련 키워드
        command_keywords = ["시작", "중지", "생성", "보기", "도움말", "설정"]
        for keyword in command_keywords:
            if keyword in text:
                keywords.append(keyword)
        
        return list(set(keywords))  # 중복 제거
    
    def _determine_sentiment(self, emotions: Dict[str, float]) -> str:
        """감정 판단"""
        if emotions["긍정"] > emotions["부정"] and emotions["긍정"] > 0.3:
            return "positive"
        elif emotions["부정"] > emotions["긍정"] and emotions["부정"] > 0.3:
            return "negative"
        else:
            return "neutral"

# 음성 인식 엔진 초기화
voice_engine = VoiceRecognitionEngine()

# ==================== 음성 명령 처리 시스템 ====================

class VoiceCommandProcessor:
    """음성 명령 처리 시스템"""
    
    def __init__(self):
        self.command_history = []
        self.command_success_rate = {}
        
    async def process_voice_command(self, command: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """음성 명령 처리"""
        try:
            # 명령 정규화
            normalized_command = self._normalize_command(command)
            
            # 명령 매칭
            matched_command = self._match_command(normalized_command)
            
            if matched_command:
                # 명령 실행
                result = await self._execute_command(matched_command, context or {})
                
                # 명령 히스토리 기록
                self.command_history.append({
                    "command": command,
                    "normalized": normalized_command,
                    "matched": matched_command,
                    "timestamp": datetime.now().isoformat(),
                    "success": result.get("success", False)
                })
                
                # 성공률 업데이트
                self._update_success_rate(matched_command, result.get("success", False))
                
                return result
            else:
                return {
                    "success": False,
                    "error": "인식할 수 없는 명령입니다.",
                    "suggestions": self._get_command_suggestions(normalized_command)
                }
                
        except Exception as e:
            logger.error(f"음성 명령 처리 중 오류: {e}")
            return {
                "success": False,
                "error": f"명령 처리 중 오류가 발생했습니다: {str(e)}"
            }
    
    def _normalize_command(self, command: str) -> str:
        """명령 정규화"""
        # 불필요한 단어 제거
        remove_words = ["해주세요", "해주시면", "좋겠습니다", "감사합니다", "네", "아니오"]
        normalized = command
        
        for word in remove_words:
            normalized = normalized.replace(word, "")
        
        # 공백 정리
        normalized = " ".join(normalized.split())
        
        return normalized
    
    def _match_command(self, normalized_command: str) -> Optional[str]:
        """명령 매칭"""
        for voice_command, system_command in voice_commands.items():
            if voice_command in normalized_command:
                return system_command
        
        # 부분 매칭 시도
        for voice_command, system_command in voice_commands.items():
            if any(word in normalized_command for word in voice_command.split()):
                return system_command
        
        return None
    
    async def _execute_command(self, command: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """명령 실행"""
        try:
            if command == "start_analysis":
                return await self._start_analysis(context)
            elif command == "stop_analysis":
                return await self._stop_analysis(context)
            elif command == "generate_summary":
                return await self._generate_summary(context)
            elif command == "show_statistics":
                return await self._show_statistics(context)
            elif command == "show_help":
                return await self._show_help(context)
            elif command == "start_voice_recognition":
                return await self._start_voice_recognition(context)
            elif command == "stop_voice_recognition":
                return await self._stop_voice_recognition(context)
            elif command == "generate_message":
                return await self._generate_message(context)
            elif command == "analyze_emotion":
                return await self._analyze_emotion(context)
            elif command == "extract_keywords":
                return await self._extract_keywords(context)
            else:
                return {
                    "success": False,
                    "error": f"알 수 없는 명령: {command}"
                }
                
        except Exception as e:
            logger.error(f"명령 실행 중 오류: {e}")
            return {
                "success": False,
                "error": f"명령 실행 중 오류가 발생했습니다: {str(e)}"
            }
    
    async def _start_analysis(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """분석 시작"""
        return {
            "success": True,
            "message": "분석을 시작합니다.",
            "command": "start_analysis",
            "timestamp": datetime.now().isoformat()
        }
    
    async def _stop_analysis(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """분석 중지"""
        return {
            "success": True,
            "message": "분석을 중지합니다.",
            "command": "stop_analysis",
            "timestamp": datetime.now().isoformat()
        }
    
    async def _generate_summary(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """요약 생성"""
        return {
            "success": True,
            "message": "요약을 생성합니다.",
            "command": "generate_summary",
            "timestamp": datetime.now().isoformat()
        }
    
    async def _show_statistics(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """통계 보기"""
        return {
            "success": True,
            "message": "통계를 표시합니다.",
            "command": "show_statistics",
            "timestamp": datetime.now().isoformat(),
            "statistics": voice_recognition_status
        }
    
    async def _show_help(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """도움말 보기"""
        return {
            "success": True,
            "message": "음성 명령 도움말을 표시합니다.",
            "command": "show_help",
            "timestamp": datetime.now().isoformat(),
            "available_commands": list(voice_commands.keys())
        }
    
    async def _start_voice_recognition(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """음성 인식 시작"""
        voice_recognition_status["is_active"] = True
        voice_recognition_status["current_session"] = datetime.now().isoformat()
        voice_recognition_status["total_sessions"] += 1
        
        return {
            "success": True,
            "message": "음성 인식을 시작합니다.",
            "command": "start_voice_recognition",
            "timestamp": datetime.now().isoformat()
        }
    
    async def _stop_voice_recognition(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """음성 인식 중지"""
        voice_recognition_status["is_active"] = False
        voice_recognition_status["current_session"] = None
        
        return {
            "success": True,
            "message": "음성 인식을 중지합니다.",
            "command": "stop_voice_recognition",
            "timestamp": datetime.now().isoformat()
        }
    
    async def _generate_message(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """메시지 생성"""
        return {
            "success": True,
            "message": "메시지를 생성합니다.",
            "command": "generate_message",
            "timestamp": datetime.now().isoformat()
        }
    
    async def _analyze_emotion(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """감정 분석"""
        return {
            "success": True,
            "message": "감정 분석을 수행합니다.",
            "command": "analyze_emotion",
            "timestamp": datetime.now().isoformat()
        }
    
    async def _extract_keywords(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """키워드 추출"""
        return {
            "success": True,
            "message": "키워드를 추출합니다.",
            "command": "extract_keywords",
            "timestamp": datetime.now().isoformat()
        }
    
    def _get_command_suggestions(self, normalized_command: str) -> List[str]:
        """명령 제안"""
        suggestions = []
        
        for voice_command in voice_commands.keys():
            if any(word in voice_command for word in normalized_command.split()):
                suggestions.append(voice_command)
        
        return suggestions[:3]  # 최대 3개 제안
    
    def _update_success_rate(self, command: str, success: bool):
        """성공률 업데이트"""
        if command not in self.command_success_rate:
            self.command_success_rate[command] = {"success": 0, "total": 0}
        
        self.command_success_rate[command]["total"] += 1
        if success:
            self.command_success_rate[command]["success"] += 1

# 음성 명령 처리기 초기화
command_processor = VoiceCommandProcessor()

# ==================== API 엔드포인트 ====================

@app.post("/api/v7/voice/recognize")
async def recognize_voice(request: VoiceRecognitionRequest):
    """음성 인식 API"""
    try:
        result = await voice_engine.recognize_speech(
            request.audio_data,
            request.language
        )
        
        return {
            "success": True,
            "result": result.dict(),
            "message": "음성 인식이 완료되었습니다."
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "음성 인식 중 오류가 발생했습니다."
        }

@app.post("/api/v7/voice/command")
async def process_voice_command(request: VoiceCommandRequest):
    """음성 명령 처리 API"""
    try:
        result = await command_processor.process_voice_command(
            request.command,
            request.context
        )
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "음성 명령 처리 중 오류가 발생했습니다."
        }

@app.get("/api/v7/voice/status")
async def get_voice_recognition_status():
    """음성 인식 상태 조회"""
    return {
        "success": True,
        "status": voice_recognition_status,
        "available_commands": list(voice_commands.keys()),
        "command_success_rate": command_processor.command_success_rate
    }

@app.get("/api/v7/voice/commands")
async def get_available_commands():
    """사용 가능한 음성 명령 목록"""
    return {
        "success": True,
        "commands": voice_commands,
        "total_commands": len(voice_commands)
    }

@app.get("/api/v7/voice/history")
async def get_command_history():
    """명령 히스토리 조회"""
    return {
        "success": True,
        "history": command_processor.command_history[-10:],  # 최근 10개
        "total_commands": len(command_processor.command_history)
    }

# ==================== WebSocket 실시간 음성 스트리밍 ====================

class VoiceWebSocketManager:
    """WebSocket 음성 스트리밍 관리자"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.voice_streams: Dict[str, Any] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        """WebSocket 연결"""
        await websocket.accept()
        self.active_connections.append(websocket)
        self.voice_streams[session_id] = {
            "websocket": websocket,
            "is_active": False,
            "start_time": None,
            "audio_chunks": []
        }
        logger.info(f"음성 스트림 연결: {session_id}")
    
    def disconnect(self, websocket: WebSocket, session_id: str):
        """WebSocket 연결 해제"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if session_id in self.voice_streams:
            del self.voice_streams[session_id]
        logger.info(f"음성 스트림 연결 해제: {session_id}")
    
    async def process_voice_stream(self, session_id: str, audio_chunk: bytes):
        """실시간 음성 스트림 처리"""
        if session_id in self.voice_streams:
            stream = self.voice_streams[session_id]
            stream["audio_chunks"].append(audio_chunk)
            
            # 일정 크기가 되면 음성 인식 수행
            if len(stream["audio_chunks"]) >= 10:  # 10개 청크마다 처리
                await self._process_audio_chunks(session_id)
    
    async def _process_audio_chunks(self, session_id: str):
        """오디오 청크 처리"""
        try:
            stream = self.voice_streams[session_id]
            audio_chunks = stream["audio_chunks"]
            stream["audio_chunks"] = []  # 청크 초기화
            
            # 오디오 데이터 결합
            audio_data = b''.join(audio_chunks)
            
            # Base64 인코딩
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            
            # 음성 인식 수행
            result = await voice_engine.recognize_speech(audio_base64)
            
            # 결과를 WebSocket으로 전송
            await stream["websocket"].send_text(json.dumps({
                "type": "voice_recognition_result",
                "data": result.dict(),
                "timestamp": datetime.now().isoformat()
            }))
            
        except Exception as e:
            logger.error(f"오디오 청크 처리 중 오류: {e}")

# WebSocket 관리자 초기화
voice_ws_manager = VoiceWebSocketManager()

@app.websocket("/ws/voice/{session_id}")
async def voice_websocket_endpoint(websocket: WebSocket, session_id: str):
    """음성 WebSocket 엔드포인트"""
    await voice_ws_manager.connect(websocket, session_id)
    
    try:
        while True:
            # 오디오 데이터 수신
            data = await websocket.receive_bytes()
            
            # 실시간 음성 스트림 처리
            await voice_ws_manager.process_voice_stream(session_id, data)
            
    except WebSocketDisconnect:
        voice_ws_manager.disconnect(websocket, session_id)
    except Exception as e:
        logger.error(f"음성 WebSocket 오류: {e}")
        voice_ws_manager.disconnect(websocket, session_id)

# ==================== 메인 실행 ====================

if __name__ == "__main__":
    import uvicorn

    try:
        _p = int(
            os.environ.get("VOICE_RECOGNITION_PORT", os.environ.get("PORT", "8001"))
        )
        print("🎤 실시간 음성 인식 시스템 시작 중...")
        print(f"📍 서버 주소: http://localhost:{_p}")
        print(f"📚 API 문서: http://localhost:{_p}/docs")
        print(f"🔗 WebSocket: ws://localhost:{_p}/ws/voice/{{session_id}}")

        uvicorn.run(app, host="0.0.0.0", port=_p)
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 