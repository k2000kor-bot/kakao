from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import logging
from datetime import datetime
from message_generator import message_generator

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="메시지 생성 API 서버",
    description="대화 내용에 대응하는 메시지 생성 API",
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

class MessageRequest(BaseModel):
    context: str
    room_id: Optional[str] = ""
    style: Optional[str] = "professional"

class MessageResponse(BaseModel):
    success: bool
    messages: List[Dict[str, Any]]
    timestamp: str
    error: Optional[str] = None

@app.get("/")
async def root():
    """API 서버 상태 확인"""
    return {
        "message": "메시지 생성 API 서버가 실행 중입니다",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v7/generate-message", response_model=MessageResponse)
async def generate_message(request: MessageRequest):
    """대화 내용에 대응하는 메시지 생성"""
    try:
        # 메시지 생성
        messages = message_generator.generate_response(
            request.context, 
            request.room_id, 
            request.style
        )
        
        return MessageResponse(
            success=True,
            messages=messages,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"메시지 생성 오류: {e}")
        return MessageResponse(
            success=False,
            messages=[],
            timestamp=datetime.now().isoformat(),
            error=str(e)
        )

@app.get("/api/v7/generate-message/test")
async def test_message_generation():
    """메시지 생성 기능 테스트"""
    try:
        # 테스트 케이스들
        test_cases = [
            {
                "context": "시공사 평가에 대해 논의해보고 싶습니다",
                "room_id": "개포우성7차",
                "style": "professional"
            },
            {
                "context": "공사비 분담금이 걱정됩니다",
                "room_id": "개포우성7차",
                "style": "casual"
            },
            {
                "context": "설계 품질을 어떻게 평가할까요?",
                "room_id": "개포우성7차",
                "style": "formal"
            }
        ]
        
        results = []
        for test_case in test_cases:
            messages = message_generator.generate_response(
                test_case["context"],
                test_case["room_id"],
                test_case["style"]
            )
            results.append({
                "test_case": test_case,
                "messages": messages
            })
        
        return {
            "success": True,
            "test_results": results,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"테스트 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    try:
        print("🚀 메시지 생성 API 서버 시작 중...")
        print("📍 서버 주소: http://localhost:8002")
        print("📚 API 문서: http://localhost:8002/docs")
        uvicorn.run(app, host="0.0.0.0", port=8002)
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 