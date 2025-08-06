from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
import logging
from datetime import datetime
from conversational_ai_system import conversational_ai

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="대화형 AI API 서버",
    description="개포우성7차 프로젝트 대화형 AI 시스템",
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

class ConversationRequest(BaseModel):
    user_input: str
    context: Dict[str, Any] = {}
    session_id: str = ""

class ConversationResponse(BaseModel):
    success: bool
    message: str
    suggestions: List[str]
    actions: List[str]
    data: Dict[str, Any]
    timestamp: str

@app.get("/")
async def root():
    """API 서버 상태 확인"""
    return {
        "message": "대화형 AI API 서버가 실행 중입니다",
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

@app.post("/api/v7/conversation", response_model=ConversationResponse)
async def process_conversation(request: ConversationRequest):
    """대화 처리"""
    try:
        # 대화형 AI 시스템으로 응답 생성
        response = conversational_ai.generate_response(
            request.user_input, 
            request.context
        )
        
        return ConversationResponse(
            success=response["success"],
            message=response["message"],
            suggestions=response["suggestions"],
            actions=response["actions"],
            data=response["data"],
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"대화 처리 오류: {e}")
        return ConversationResponse(
            success=False,
            message=f"대화 처리 중 오류가 발생했습니다: {str(e)}",
            suggestions=[],
            actions=[],
            data={},
            timestamp=datetime.now().isoformat()
        )

@app.get("/api/v7/conversation/test")
async def test_conversation():
    """대화형 AI 기능 테스트"""
    try:
        test_cases = [
            "안녕하세요",
            "메시지 생성해줘",
            "프로젝트 분석해줘",
            "일정 확인해줘",
            "도움말 보여줘"
        ]
        
        results = []
        for test_input in test_cases:
            response = conversational_ai.generate_response(test_input)
            results.append({
                "input": test_input,
                "response": response
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

@app.get("/api/v7/conversation/features")
async def get_available_features():
    """사용 가능한 기능 목록 조회"""
    try:
        features = []
        for feature, config in conversational_ai.feature_commands.items():
            features.append({
                "name": feature,
                "description": config["description"],
                "commands": config["commands"],
                "function": config["function"]
            })
        
        return {
            "success": True,
            "features": features,
            "total_features": len(features),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"기능 목록 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/v7/conversation/history")
async def get_conversation_history():
    """대화 히스토리 조회"""
    try:
        return {
            "success": True,
            "history": conversational_ai.conversation_history,
            "total_conversations": len(conversational_ai.conversation_history),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"대화 히스토리 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    try:
        print("🚀 대화형 AI API 서버 시작 중...")
        print("📍 서버 주소: http://localhost:8003")
        print("📚 API 문서: http://localhost:8003/docs")
        uvicorn.run(app, host="0.0.0.0", port=8003)
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 