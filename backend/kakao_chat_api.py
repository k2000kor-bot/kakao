#!/usr/bin/env python3
"""
카카오톡 대화 대응 API 서버
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import sys
import os

# 현재 디렉토리를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from simplified_ultra_message_system import SimplifiedMessageGenerator, SimplifiedEmotionAnalysis, EmotionType
from cors_config import get_cors_allow_origins

app = FastAPI(title="카카오톡 대화 API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 메시지 생성기 초기화
message_generator = SimplifiedMessageGenerator()

class ChatRequest(BaseModel):
    message: str
    emotion: str = "concern"
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    success: bool
    error: Optional[str] = None

@app.post("/api/v8/generate-message", response_model=ChatResponse)
async def generate_message(request: ChatRequest):
    """메시지 생성 API"""
    try:
        # 감정 분석 객체 생성
        emotion_map = {
            "joy": EmotionType.JOY,
            "sadness": EmotionType.SADNESS,
            "anger": EmotionType.ANGER,
            "fear": EmotionType.FEAR,
            "neutral": EmotionType.NEUTRAL,
            "excitement": EmotionType.EXCITEMENT,
            "concern": EmotionType.CONCERN
        }
        
        emotion = SimplifiedEmotionAnalysis(
            primary_emotion=emotion_map.get(request.emotion, EmotionType.CONCERN),
            intensity=0.8,
            confidence=0.9
        )
        
        # 메시지 생성
        response = await message_generator.generate_message(
            text=request.message,
            emotion=emotion,
            context=request.context
        )
        
        return ChatResponse(
            response=response,
            success=True
        )
        
    except Exception as e:
        return ChatResponse(
            response="죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.",
            success=False,
            error=str(e)
        )

@app.get("/api/v8/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy", "message": "카카오톡 대화 API가 정상적으로 작동 중입니다."}

if __name__ == "__main__":
    import uvicorn

    _p = int(os.environ.get("KAKAO_CHAT_API_PORT", os.environ.get("PORT", "8003")))
    uvicorn.run(app, host="0.0.0.0", port=_p) 