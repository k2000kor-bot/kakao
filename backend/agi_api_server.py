#!/usr/bin/env python3
"""
통합 AGI API 서버 v1.0
- 실시간 카카오톡 대화 대응 API
- AGI 수준 지능 + 자율 학습 + 예측적 대화 + 멀티모달 AI
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any, Optional
import asyncio
import json
import logging
from datetime import datetime
import uuid

# 통합 AGI 시스템 import
from integrated_agi_system import (
    IntegratedAGISystem, 
    process_integrated_agi_request,
    get_system_analytics
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="통합 AGI API 서버",
    description="실시간 카카오톡 대화 대응을 위한 AGI 수준 지능 시스템",
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

# Pydantic 모델들
class ConversationRequest(BaseModel):
    """대화 요청 모델"""
    user_message: str
    conversation_context: Dict[str, Any] = {}
    multimodal_input: Optional[Dict[str, Any]] = None
    learning_objective: Optional[str] = None
    creativity_level: float = 0.5

class ConversationResponse(BaseModel):
    """대화 응답 모델"""
    success: bool
    response_message: str
    confidence_score: float
    creativity_score: float
    predictions: Dict[str, Any]
    learning_outcome: Dict[str, Any]
    multimodal_analysis: Dict[str, Any]
    agi_processing: Dict[str, Any]
    processing_time: float
    system_status: Dict[str, Any]

class SystemAnalyticsResponse(BaseModel):
    """시스템 분석 응답 모델"""
    total_conversations: int
    average_confidence: float
    average_creativity: float
    recent_performance: Dict[str, Any]
    system_health: str
    learning_progress: str

# 통합 AGI 시스템 인스턴스
agi_system = IntegratedAGISystem()

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "통합 AGI API 서버 v1.0",
        "description": "실시간 카카오톡 대화 대응 시스템",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "system_version": "1.0.0",
        "agi_capabilities": [
            "reasoning", "learning", "creativity", 
            "adaptation", "prediction", "multimodal"
        ],
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/conversation", response_model=ConversationResponse)
async def process_conversation(request: ConversationRequest):
    """대화 처리 API"""
    try:
        # 요청 데이터 구성
        request_data = {
            "request_id": str(uuid.uuid4()),
            "user_message": request.user_message,
            "conversation_context": request.conversation_context,
            "multimodal_input": request.multimodal_input,
            "learning_objective": request.learning_objective,
            "creativity_level": request.creativity_level
        }
        
        # AGI 시스템으로 처리
        result = await process_integrated_agi_request(request_data)
        
        # 응답 구성
        response = ConversationResponse(
            success=result["success"],
            response_message=result["response"]["response_message"],
            confidence_score=result["response"]["confidence_score"],
            creativity_score=result["response"]["creativity_score"],
            predictions=result["response"]["predictions"],
            learning_outcome=result["response"]["learning_outcome"],
            multimodal_analysis=result["response"]["multimodal_analysis"],
            agi_processing=result["response"]["agi_processing"],
            processing_time=result["response"]["processing_time"],
            system_status=result["response"]["system_status"]
        )
        
        return response
        
    except Exception as e:
        logger.error(f"대화 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"대화 처리 실패: {str(e)}")

@app.get("/api/v1/analytics", response_model=SystemAnalyticsResponse)
async def get_analytics():
    """시스템 분석 결과 조회"""
    try:
        analytics = await get_system_analytics()
        
        if "message" in analytics:
            # 대화 기록이 없는 경우
            return SystemAnalyticsResponse(
                total_conversations=0,
                average_confidence=0.0,
                average_creativity=0.0,
                recent_performance={"confidence_trend": "stable"},
                system_health="excellent",
                learning_progress="ready"
            )
        
        return SystemAnalyticsResponse(
            total_conversations=analytics["total_conversations"],
            average_confidence=analytics["average_confidence"],
            average_creativity=analytics["average_creativity"],
            recent_performance=analytics["recent_performance"],
            system_health=analytics["system_health"],
            learning_progress=analytics["learning_progress"]
        )
        
    except Exception as e:
        logger.error(f"분석 결과 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분석 결과 조회 실패: {str(e)}")

@app.post("/api/v1/batch-conversation")
async def process_batch_conversation(requests: List[ConversationRequest]):
    """배치 대화 처리 API"""
    try:
        results = []
        
        for request in requests:
            request_data = {
                "request_id": str(uuid.uuid4()),
                "user_message": request.user_message,
                "conversation_context": request.conversation_context,
                "multimodal_input": request.multimodal_input,
                "learning_objective": request.learning_objective,
                "creativity_level": request.creativity_level
            }
            
            result = await process_integrated_agi_request(request_data)
            results.append(result)
        
        return {
            "success": True,
            "results": results,
            "total_processed": len(results),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"배치 대화 처리 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"배치 처리 실패: {str(e)}")

@app.get("/api/v1/system-status")
async def get_system_status():
    """시스템 상태 조회"""
    try:
        status = await agi_system._get_system_status()
        return {
            "success": True,
            "system_status": status,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"시스템 상태 조회 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"시스템 상태 조회 실패: {str(e)}")

@app.post("/api/v1/learning-reset")
async def reset_learning_system():
    """학습 시스템 리셋"""
    try:
        # 학습 시스템 초기화
        agi_system.autonomous_learning = agi_system.autonomous_learning.__class__()
        agi_system.conversation_history = []
        
        return {
            "success": True,
            "message": "학습 시스템이 성공적으로 리셋되었습니다.",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"학습 시스템 리셋 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"학습 시스템 리셋 실패: {str(e)}")

@app.get("/api/v1/capabilities")
async def get_agi_capabilities():
    """AGI 능력 조회"""
    return {
        "success": True,
        "capabilities": {
            "reasoning": {
                "description": "논리적 추론 및 문제 해결",
                "strength": "high",
                "applications": ["대화 맥락 이해", "복잡한 질문 처리"]
            },
            "learning": {
                "description": "자율적 학습 및 적응",
                "strength": "high",
                "applications": ["사용자 패턴 학습", "응답 품질 개선"]
            },
            "creativity": {
                "description": "창의적 사고 및 표현",
                "strength": "medium",
                "applications": ["다양한 응답 생성", "예상치 못한 상황 대응"]
            },
            "adaptation": {
                "description": "상황 적응 및 변화 대응",
                "strength": "high",
                "applications": ["대화 스타일 조정", "감정 상태 적응"]
            },
            "prediction": {
                "description": "대화 흐름 및 사용자 의도 예측",
                "strength": "medium",
                "applications": ["선제적 응답", "대화 방향 예측"]
            },
            "multimodal": {
                "description": "다중 모달리티 이해 및 처리",
                "strength": "medium",
                "applications": ["텍스트+이미지+음성 통합", "멀티미디어 대화"]
            }
        },
        "timestamp": datetime.now().isoformat()
    }

# 백그라운드 작업
@app.post("/api/v1/background-learning")
async def trigger_background_learning(background_tasks: BackgroundTasks):
    """백그라운드 학습 트리거"""
    try:
        # 백그라운드에서 학습 수행
        background_tasks.add_task(perform_background_learning)
        
        return {
            "success": True,
            "message": "백그라운드 학습이 시작되었습니다.",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"백그라운드 학습 트리거 중 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=f"백그라운드 학습 실패: {str(e)}")

async def perform_background_learning():
    """백그라운드 학습 수행"""
    try:
        logger.info("백그라운드 학습 시작...")
        
        # 학습 목표 설정
        current_performance = {
            "confidence": 0.8,
            "creativity": 0.7,
            "adaptation": 0.8,
            "response_time": 2.0
        }
        
        # 자율 학습 수행
        learning_objectives = await agi_system.autonomous_learning.set_autonomous_learning_goals(current_performance)
        
        logger.info(f"학습 목표 설정 완료: {len(learning_objectives)}개")
        
        # 학습 결과 로깅
        for objective in learning_objectives:
            logger.info(f"학습 목표: {objective.goal_type.value} - {objective.target_metric}")
        
        logger.info("백그라운드 학습 완료")
        
    except Exception as e:
        logger.error(f"백그라운드 학습 중 오류: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    
    # 서버 실행
    uvicorn.run(
        "agi_api_server:app",
        host="0.0.0.0",
        port=8010,
        reload=True,
        log_level="info"
    ) 