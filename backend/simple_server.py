#!/usr/bin/env python3
"""
간단한 카카오 AI API 서버
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="간단한 카카오 AI API 서버")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class MessageRequest(BaseModel):
    content: str
    sender: str
    context: Optional[str] = None

class MessageResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "카카오 AI API 서버가 실행 중입니다", "timestamp": datetime.now().isoformat()}

@app.get("/api/status")
async def get_status():
    return {
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/generate-message", response_model=MessageResponse)
async def generate_message(request: MessageRequest):
    try:
        # 간단한 메시지 생성 로직
        response_message = f"안녕하세요! {request.sender}님의 메시지를 확인했습니다. '{request.content}'에 대한 응답입니다."
        
        return MessageResponse(
            success=True,
            message=response_message
        )
    except Exception as e:
        logger.error(f"메시지 생성 실패: {e}")
        return MessageResponse(
            success=False,
            error=str(e)
        )

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 