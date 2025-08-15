#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
간단한 궁극의 통합 응답 시스템 API 서버
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from simple_ultimate_system import process_simple_ultimate_request

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="CORBU AI 궁극의 통합 응답 시스템",
    description="모든 AI 기능을 통합한 고신뢰도 답변 생성 시스템",
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

# 데이터 모델
class UltimateRequest(BaseModel):
    user_input: str
    conversation_history: Optional[List[Dict[str, Any]]] = []
    project_context: Optional[Dict[str, Any]] = None
    user_preferences: Optional[Dict[str, Any]] = None

class UltimateResponse(BaseModel):
    success: bool
    result: Optional[Dict[str, Any]] = None
    system_status: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class SystemStatus(BaseModel):
    status: str
    timestamp: str
    system_info: Dict[str, Any]

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "CORBU AI 궁극의 통합 응답 시스템",
        "version": "1.0.0",
        "status": "active",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/ultimate/process", response_model=UltimateResponse)
async def process_ultimate_message(request: UltimateRequest):
    """궁극의 통합 응답 시스템을 통한 메시지 처리"""
    try:
        logger.info(f"궁극 요청 처리 시작: {request.user_input[:50]}...")
        
        # 궁극의 통합 응답 시스템 호출
        result = await process_simple_ultimate_request({
            'user_input': request.user_input,
            'conversation_history': request.conversation_history or [],
            'project_context': request.project_context,
            'user_preferences': request.user_preferences
        })
        
        if result['success']:
            logger.info("✅ 궁극 요청 처리 성공")
            return UltimateResponse(
                success=True,
                result=result['result'],
                system_status=result['system_status']
            )
        else:
            logger.error(f"❌ 궁극 요청 처리 실패: {result['error']}")
            return UltimateResponse(
                success=False,
                error=result['error']
            )
            
    except Exception as e:
        logger.error(f"궁극 요청 처리 중 예외 발생: {e}")
        return UltimateResponse(
            success=False,
            error=f"처리 중 오류가 발생했습니다: {str(e)}"
        )

@app.get("/api/ultimate/status", response_model=SystemStatus)
async def get_ultimate_system_status():
    """궁극의 통합 응답 시스템 상태 확인"""
    try:
        from simple_ultimate_system import simple_ultimate_response_system
        status = await simple_ultimate_response_system.get_system_status()
        return SystemStatus(
            status="active",
            timestamp=datetime.now().isoformat(),
            system_info=status
        )
    except Exception as e:
        logger.error(f"시스템 상태 확인 중 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ultimate/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "CORBU AI Ultimate Response System"
    }

@app.get("/api/ultimate/capabilities")
async def get_capabilities():
    """시스템 능력 정보 반환"""
    try:
        from simple_ultimate_system import simple_ultimate_response_system
        capabilities = simple_ultimate_response_system.system_capabilities
        return {
            "capabilities": {
                name: {
                    "name": cap.name,
                    "description": cap.description,
                    "confidence_weight": cap.confidence_weight,
                    "processing_time": cap.processing_time,
                    "is_available": cap.is_available
                }
                for name, cap in capabilities.items()
            }
        }
    except Exception as e:
        logger.error(f"능력 정보 조회 중 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ultimate/stats")
async def get_system_stats():
    """시스템 통계 정보"""
    try:
        from simple_ultimate_system import simple_ultimate_response_system
        history_count = len(simple_ultimate_response_system.processing_history)
        
        return {
            "total_requests": history_count,
            "system_uptime": "active",
            "average_processing_time": 0.3,  # 예시 값
            "success_rate": 95.5,  # 예시 값
            "last_request": simple_ultimate_response_system.processing_history[-1]['timestamp'] if history_count > 0 else None
        }
    except Exception as e:
        logger.error(f"통계 정보 조회 중 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # 서버 실행
    uvicorn.run(
        "simple_ultimate_api_server:app",
        host="0.0.0.0",
        port=8004,
        reload=True,
        log_level="info"
    )
