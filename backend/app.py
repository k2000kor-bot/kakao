from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import asyncio
import time
import random

app = FastAPI(title="CORBU AI Backend API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청/응답 모델
class ChatRequest(BaseModel):
    message: str
    quality: str = "enhanced"
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    quality_score: float
    confidence: float
    processing_time: int
    model: str
    tokens: int

class HealthResponse(BaseModel):
    status: str
    ultimate: bool
    enhanced: bool
    standard: bool
    timestamp: str

# 상태 변수
system_status = {
    "ultimate": True,
    "enhanced": True,
    "standard": True,
    "last_check": time.time()
}

@app.get("/")
async def root():
    return {"message": "CORBU AI Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    """백엔드 상태 확인"""
    return HealthResponse(
        status="healthy",
        ultimate=system_status["ultimate"],
        enhanced=system_status["enhanced"],
        standard=system_status["standard"],
        timestamp=time.strftime("%Y-%m-%d %H:%M:%S")
    )

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """채팅 메시지 처리"""
    start_time = time.time()
    
    try:
        # 품질별 처리 시간 시뮬레이션
        if request.quality == "ultimate":
            await asyncio.sleep(2.0)
            quality_score = random.uniform(0.85, 0.98)
            model = "Ultimate AI Model"
            tokens = random.randint(800, 1200)
        elif request.quality == "enhanced":
            await asyncio.sleep(1.5)
            quality_score = random.uniform(0.75, 0.90)
            model = "Enhanced AI Model"
            tokens = random.randint(600, 900)
        else:  # standard
            await asyncio.sleep(0.8)
            quality_score = random.uniform(0.60, 0.80)
            model = "Standard AI Model"
            tokens = random.randint(400, 700)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # 응답 생성
        response_text = f"안녕하세요! '{request.message}'에 대한 {request.quality} 품질의 응답입니다. "
        response_text += f"현재 {model}을 사용하여 처리되었으며, 품질 점수는 {quality_score:.2f}입니다."
        
        return ChatResponse(
            response=response_text,
            quality_score=quality_score,
            confidence=random.uniform(0.7, 0.95),
            processing_time=processing_time,
            model=model,
            tokens=tokens
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"처리 중 오류 발생: {str(e)}")

@app.get("/api/status")
async def api_status():
    """API 상태 확인 (프론트엔드 호환성)"""
    return {
        "ultimate": system_status["ultimate"],
        "enhanced": system_status["enhanced"],
        "standard": system_status["standard"],
        "overall": any([system_status["ultimate"], system_status["enhanced"], system_status["standard"]])
    }

@app.post("/api/chat")
async def api_chat(request: ChatRequest):
    """API 채팅 엔드포인트 (프론트엔드 호환성)"""
    return await chat_endpoint(request)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004, reload=True)
