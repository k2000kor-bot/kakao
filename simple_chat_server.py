#!/usr/bin/env python3
"""
간단한 채팅 서버 - 연결 테스트용
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="Simple Chat Server",
    description="간단한 채팅 서버",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str
    user_id: str = "default"

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Simple Chat Server",
        "status": "running",
        "version": "1.0.0"
    }

@app.post("/api/chat")
async def chat_endpoint(chat_data: ChatMessage):
    """채팅 API"""
    try:
        logger.info(f"받은 메시지: {chat_data.message}")
        
        # 간단한 응답 생성
        response = f"""안녕하세요! "{chat_data.message}"에 대한 답변입니다.

귀하의 질문을 잘 이해했습니다. CORBU AI가 도와드리겠습니다.

현재 사용 가능한 기능:
- 감정 분석
- 데이터 분석  
- 시스템 상태 확인

더 구체적인 질문을 해주시면 더 정확한 답변을 드릴 수 있습니다."""

        result = {
            "success": True,
            "response": response,
            "message": chat_data.message,
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
        logger.info(f"응답 생성 완료: {len(response)}자")
        return result
        
    except Exception as e:
        logger.error(f"채팅 API 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    """상태 확인"""
    return {
        "status": "healthy",
        "message": "서버가 정상적으로 작동하고 있습니다"
    }

if __name__ == "__main__":
    logger.info("🚀 Simple Chat Server를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
