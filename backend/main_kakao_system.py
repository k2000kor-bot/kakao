#!/usr/bin/env python3
"""
실시간 카카오톡 대화 대응 시스템 - 메인 통합 시스템 v1.0
- 모든 AGI 기능과 실제 카카오톡 데이터를 통합한 완전한 시스템
- 실시간 대화 처리 및 현실적인 응답 생성
"""

import os
import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import uuid
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 기존 시스템들 import
from enhanced_kakao_agi_system import EnhancedKakaoAGISystem, KakaoAGIRequest, KakaoAGIResponse
from integrated_agi_system import IntegratedAGISystem
from real_kakao_conversation_analyzer import RealKakaoConversationAnalyzer
from real_kakao_response_generator import RealKakaoResponseGenerator
from conversation_summarizer import KakaoConversationSummarizer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic 모델들
class MainKakaoRequest(BaseModel):
    user_message: str
    user_id: str = "default"
    conversation_context: Dict[str, Any] = {}
    learning_objective: str = None
    creativity_level: float = 0.5
    multimodal_input: Dict[str, Any] = None

class MainKakaoResponse(BaseModel):
    success: bool
    response_message: str
    confidence_score: float
    creativity_score: float
    kakao_style: Dict[str, Any]
    conversation_pattern: str
    emotion_analysis: Dict[str, Any]
    topic_classification: str
    agi_processing: Dict[str, Any]
    processing_time: float
    system_status: Dict[str, Any]
    timestamp: str

class SystemAnalyticsResponse(BaseModel):
    total_conversations: int
    emotion_distribution: Dict[str, int]
    topic_distribution: Dict[str, int]
    kakao_data_analysis: Dict[str, Any]
    system_health: str
    kakao_integration: str

class MainKakaoSystem:
    """실시간 카카오톡 대화 대응 메인 시스템"""
    
    def __init__(self):
        logger.info("실시간 카카오톡 대화 대응 시스템 초기화 중...")
        
        # 향상된 카카오톡 AGI 시스템
        self.enhanced_kakao_agi = EnhancedKakaoAGISystem()
        
        # 기존 AGI 시스템
        self.agi_system = IntegratedAGISystem()
        
        # 카카오톡 특화 시스템들
        self.conversation_analyzer = RealKakaoConversationAnalyzer()
        self.response_generator = RealKakaoResponseGenerator()
        
        # 대화 요약 시스템
        self.conversation_summarizer = KakaoConversationSummarizer()
        
        # 시스템 상태
        self.system_start_time = datetime.now()
        self.total_requests = 0
        self.successful_requests = 0
        self.system_version = "1.0"
        
        logger.info("실시간 카카오톡 대화 대응 시스템 초기화 완료!")
    
    async def process_conversation(self, request: MainKakaoRequest) -> MainKakaoResponse:
        """실시간 대화 처리"""
        start_time = datetime.now()
        self.total_requests += 1
        
        try:
            # 카카오톡 AGI 요청으로 변환
            kakao_request = KakaoAGIRequest(
                request_id=str(uuid.uuid4()),
                user_message=request.user_message,
                user_id=request.user_id,
                conversation_context=request.conversation_context,
                learning_objective=request.learning_objective,
                creativity_level=request.creativity_level
            )
            
            # 향상된 카카오톡 AGI 시스템으로 처리
            kakao_response = await self.enhanced_kakao_agi.process_kakao_conversation(kakao_request)
            
            # 성공 카운트 증가
            self.successful_requests += 1
            
            # 응답 변환
            response = MainKakaoResponse(
                success=True,
                response_message=kakao_response.response_message,
                confidence_score=kakao_response.confidence_score,
                creativity_score=kakao_response.creativity_score,
                kakao_style=kakao_response.kakao_style,
                conversation_pattern=kakao_response.conversation_pattern,
                emotion_analysis=kakao_response.emotion_analysis,
                topic_classification=kakao_response.topic_classification,
                agi_processing=kakao_response.agi_processing,
                processing_time=kakao_response.processing_time,
                system_status=kakao_response.system_status,
                timestamp=kakao_response.timestamp.isoformat()
            )
            
            logger.info(f"대화 처리 완료: {request.user_message[:50]}... -> {response.response_message[:50]}...")
            
            return response
            
        except Exception as e:
            logger.error(f"대화 처리 오류: {str(e)}")
            raise HTTPException(status_code=500, detail=f"대화 처리 중 오류가 발생했습니다: {str(e)}")
    
    async def get_system_analytics(self) -> SystemAnalyticsResponse:
        """시스템 분석 결과"""
        try:
            analytics = await self.enhanced_kakao_agi.get_kakao_analytics()
            
            return SystemAnalyticsResponse(
                total_conversations=analytics.get("total_conversations", 0),
                emotion_distribution=analytics.get("emotion_distribution", {}),
                topic_distribution=analytics.get("topic_distribution", {}),
                kakao_data_analysis=analytics.get("kakao_data_analysis", {}),
                system_health=analytics.get("system_health", "unknown"),
                kakao_integration=analytics.get("kakao_integration", "unknown")
            )
            
        except Exception as e:
            logger.error(f"분석 결과 조회 오류: {str(e)}")
            raise HTTPException(status_code=500, detail=f"분석 결과 조회 중 오류가 발생했습니다: {str(e)}")
    
    async def get_system_status(self) -> Dict[str, Any]:
        """시스템 상태"""
        uptime = (datetime.now() - self.system_start_time).total_seconds()
        
        return {
            "system_version": self.system_version,
            "status": "running",
            "uptime_seconds": uptime,
            "total_requests": self.total_requests,
            "successful_requests": self.successful_requests,
            "success_rate": (self.successful_requests / self.total_requests * 100) if self.total_requests > 0 else 0,
            "kakao_integration": "active",
            "agi_capabilities": "enabled",
            "real_time_processing": "enabled",
            "last_updated": datetime.now().isoformat()
        }
    
    async def test_system(self) -> Dict[str, Any]:
        """시스템 테스트"""
        test_messages = [
            "안녕하세요!",
            "아파트 시세가 어떻게 될까요?",
            "수영장이 정말 좋네요! 😊",
            "힘들어요 ㅠㅠ",
            "맞아요, 동감합니다"
        ]
        
        test_results = []
        
        for i, message in enumerate(test_messages, 1):
            try:
                request = MainKakaoRequest(
                    user_message=message,
                    user_id=f"test_user_{i}"
                )
                
                response = await self.process_conversation(request)
                
                test_results.append({
                    "test_id": i,
                    "input": message,
                    "output": response.response_message,
                    "success": response.success,
                    "confidence": response.confidence_score,
                    "emotion": response.emotion_analysis["type"],
                    "topic": response.topic_classification
                })
                
            except Exception as e:
                test_results.append({
                    "test_id": i,
                    "input": message,
                    "error": str(e),
                    "success": False
                })
        
        return {
            "test_results": test_results,
            "total_tests": len(test_messages),
            "successful_tests": len([r for r in test_results if r.get("success", False)]),
            "test_timestamp": datetime.now().isoformat()
        }

    async def generate_conversation_summary(self, chat_file: str, start_date: str = None, end_date: str = None,
                                         start_datetime: str = None, end_datetime: str = None) -> Dict[str, Any]:
        """대화 요약 생성"""
        try:
            summary = self.conversation_summarizer.generate_conversation_summary(
                chat_file, start_date, end_date, start_datetime, end_datetime
            )
            
            # 표시용 포맷팅
            formatted_summary = self.conversation_summarizer.format_summary_for_display(summary)
            
            return {
                "success": True,
                "summary": asdict(summary),
                "formatted_summary": formatted_summary,
                "period": f"{summary.period_start.strftime('%Y-%m-%d')} ~ {summary.period_end.strftime('%Y-%m-%d')}",
                "total_messages": summary.total_messages,
                "total_participants": summary.total_participants,
                "topics_count": len(summary.topics)
            }
            
        except Exception as e:
            logger.error(f"대화 요약 생성 오류: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

# FastAPI 앱 생성
app = FastAPI(
    title="실시간 카카오톡 대화 대응 시스템",
    description="AGI 수준 지능과 실제 카카오톡 데이터를 통합한 실시간 대화 시스템",
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

# 메인 시스템 인스턴스
main_kakao_system = MainKakaoSystem()

@app.on_event("startup")
async def startup_event():
    """시스템 시작 이벤트"""
    logger.info("실시간 카카오톡 대화 대응 시스템 시작!")

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "실시간 카카오톡 대화 대응 시스템",
        "version": "1.0.0",
        "status": "running",
        "capabilities": [
            "AGI 수준 지능",
            "멀티모달 AI 기능", 
            "자율 학습 시스템",
            "예측적 대화 기능",
            "실제 카카오톡 데이터 통합",
            "현실적인 대화 스타일"
        ]
    }

@app.post("/api/v1/conversation", response_model=MainKakaoResponse)
async def process_conversation(request: MainKakaoRequest):
    """실시간 대화 처리"""
    return await main_kakao_system.process_conversation(request)

@app.get("/api/v1/analytics", response_model=SystemAnalyticsResponse)
async def get_analytics():
    """시스템 분석 결과"""
    return await main_kakao_system.get_system_analytics()

@app.get("/api/v1/status")
async def get_status():
    """시스템 상태"""
    return await main_kakao_system.get_system_status()

@app.post("/api/v1/test")
async def test_system():
    """시스템 테스트"""
    return await main_kakao_system.test_system()

@app.post("/api/v1/summarize")
async def generate_summary(request: Dict[str, Any]):
    """대화 요약 생성"""
    chat_file = request.get("chat_file", "../chat_rooms/sample_room/sample_export.txt")
    start_date = request.get("start_date")
    end_date = request.get("end_date")
    start_datetime = request.get("start_datetime")
    end_datetime = request.get("end_datetime")
    
    return await main_kakao_system.generate_conversation_summary(
        chat_file, start_date, end_date, start_datetime, end_datetime
    )

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "system": "실시간 카카오톡 대화 대응 시스템"
    }

@app.get("/api/v1/capabilities")
async def get_capabilities():
    """시스템 기능"""
    return {
        "agi_level_intelligence": "enabled",
        "multimodal_ai": "enabled", 
        "autonomous_learning": "enabled",
        "predictive_conversation": "enabled",
        "real_kakao_integration": "enabled",
        "realistic_response_generation": "enabled",
        "conversation_pattern_analysis": "enabled",
        "emotion_analysis": "enabled",
        "topic_classification": "enabled",
        "user_profile_analysis": "enabled"
    }

# 배치 처리 엔드포인트
@app.post("/api/v1/batch")
async def batch_process(requests: List[MainKakaoRequest]):
    """배치 처리"""
    results = []
    for request in requests:
        try:
            response = await main_kakao_system.process_conversation(request)
            results.append(response.dict())
        except Exception as e:
            results.append({
                "success": False,
                "error": str(e),
                "request": request.dict()
            })
    
    return {
        "batch_results": results,
        "total_requests": len(requests),
        "successful_requests": len([r for r in results if r.get("success", False)])
    }

if __name__ == "__main__":
    _p = int(os.environ.get("MAIN_KAKAO_SYSTEM_PORT", os.environ.get("PORT", "8004")))
    uvicorn.run(
        "main_kakao_system:app",
        host="0.0.0.0",
        port=_p,
        reload=True,
        log_level="info"
    ) 