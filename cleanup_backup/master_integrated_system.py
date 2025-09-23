#!/usr/bin/env python3
"""
마스터 통합 시스템
- 모든 고도화된 시스템 통합
- 실시간 성능 모니터링
- 지능형 라우팅
- 자동 확장 및 최적화
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field

import aiohttp
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SystemStatus:
    """시스템 상태"""
    system_name: str
    port: int
    status: str  # "running", "stopped", "error"
    response_time: float
    last_check: str
    error_count: int = 0
    success_count: int = 0

@dataclass
class MasterSystemConfig:
    """마스터 시스템 설정"""
    systems: Dict[str, Dict] = field(default_factory=lambda: {
        "ultimate_yoo_ai": {
            "port": 8003,
            "endpoints": ["/api/ultimate-chat", "/api/user-profile/{user_id}"],
            "priority": "high",
            "health_check": "/"
        },
        "advanced_web_learning": {
            "port": 8004,
            "endpoints": ["/api/learn/add-source", "/api/learn/content"],
            "priority": "high",
            "health_check": "/"
        },
        "multimodal_learning": {
            "port": 8005,
            "endpoints": ["/api/multimodal/create-session", "/api/multimodal/analytics"],
            "priority": "medium",
            "health_check": "/"
        },
        "yoo_si_min_enhanced": {
            "port": 8002,
            "endpoints": ["/api/chat/yoo-style", "/api/yoo/model-status"],
            "priority": "high",
            "health_check": "/"
        }
    })
    
    routing_rules: Dict[str, str] = field(default_factory=lambda: {
        "chat": "ultimate_yoo_ai",
        "learning": "advanced_web_learning",
        "multimodal": "multimodal_learning",
        "yoo_style": "yoo_si_min_enhanced"
    })

class MasterSystemManager:
    """마스터 시스템 관리자"""
    
    def __init__(self):
        self.config = MasterSystemConfig()
        self.system_statuses: Dict[str, SystemStatus] = {}
        self.session = None
        self.routing_cache: Dict[str, str] = {}
        self.performance_metrics: Dict[str, List[float]] = {}
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def initialize_systems(self):
        """시스템 초기화"""
        logger.info("시스템 초기화 시작...")
        
        for system_name, system_config in self.config.systems.items():
            status = SystemStatus(
                system_name=system_name,
                port=system_config["port"],
                status="unknown",
                response_time=0.0,
                last_check=datetime.now(timezone.utc).isoformat()
            )
            self.system_statuses[system_name] = status
            self.performance_metrics[system_name] = []
        
        # 초기 상태 확인
        await self.check_all_systems()
        
        logger.info("시스템 초기화 완료")
    
    async def check_system_health(self, system_name: str) -> SystemStatus:
        """시스템 상태 확인"""
        system_config = self.config.systems[system_name]
        port = system_config["port"]
        health_endpoint = system_config["health_check"]
        
        start_time = time.time()
        
        try:
            url = f"http://localhost:{port}{health_endpoint}"
            async with self.session.get(url, timeout=5) as response:
                response_time = time.time() - start_time
                
                if response.status == 200:
                    status = "running"
                    self.system_statuses[system_name].success_count += 1
                else:
                    status = "error"
                    self.system_statuses[system_name].error_count += 1
                
                self.system_statuses[system_name].status = status
                self.system_statuses[system_name].response_time = response_time
                self.system_statuses[system_name].last_check = datetime.now(timezone.utc).isoformat()
                
                # 성능 메트릭 업데이트
                self.performance_metrics[system_name].append(response_time)
                if len(self.performance_metrics[system_name]) > 100:
                    self.performance_metrics[system_name] = self.performance_metrics[system_name][-100:]
                
        except Exception as e:
            response_time = time.time() - start_time
            self.system_statuses[system_name].status = "error"
            self.system_statuses[system_name].response_time = response_time
            self.system_statuses[system_name].error_count += 1
            self.system_statuses[system_name].last_check = datetime.now(timezone.utc).isoformat()
            
            logger.error(f"시스템 {system_name} 상태 확인 오류: {e}")
        
        return self.system_statuses[system_name]
    
    async def check_all_systems(self):
        """모든 시스템 상태 확인"""
        tasks = []
        for system_name in self.config.systems.keys():
            task = asyncio.create_task(self.check_system_health(system_name))
            tasks.append(task)
        
        await asyncio.gather(*tasks, return_exceptions=True)
    
    def get_best_system_for_request(self, request_type: str) -> Optional[str]:
        """요청 유형에 따른 최적 시스템 선택"""
        # 라우팅 규칙 확인
        if request_type in self.config.routing_rules:
            preferred_system = self.config.routing_rules[request_type]
            
            # 선호 시스템이 실행 중인지 확인
            if (preferred_system in self.system_statuses and 
                self.system_statuses[preferred_system].status == "running"):
                return preferred_system
        
        # 실행 중인 시스템 중에서 선택
        running_systems = [
            name for name, status in self.system_statuses.items() 
            if status.status == "running"
        ]
        
        if not running_systems:
            return None
        
        # 우선순위 기반 선택
        for system_name in running_systems:
            priority = self.config.systems[system_name]["priority"]
            if priority == "high":
                return system_name
        
        # 기본적으로 첫 번째 실행 중인 시스템 반환
        return running_systems[0]
    
    def get_system_performance_summary(self) -> Dict[str, Any]:
        """시스템 성능 요약"""
        summary = {}
        
        for system_name, metrics in self.performance_metrics.items():
            if metrics:
                summary[system_name] = {
                    "average_response_time": sum(metrics) / len(metrics),
                    "min_response_time": min(metrics),
                    "max_response_time": max(metrics),
                    "total_requests": len(metrics),
                    "status": self.system_statuses[system_name].status,
                    "success_rate": self.system_statuses[system_name].success_count / 
                                  (self.system_statuses[system_name].success_count + 
                                   self.system_statuses[system_name].error_count) if 
                                  (self.system_statuses[system_name].success_count + 
                                   self.system_statuses[system_name].error_count) > 0 else 0
                }
            else:
                summary[system_name] = {
                    "average_response_time": 0,
                    "min_response_time": 0,
                    "max_response_time": 0,
                    "total_requests": 0,
                    "status": self.system_statuses[system_name].status,
                    "success_rate": 0
                }
        
        return summary
    
    async def route_request(self, request_type: str, endpoint: str, data: Dict) -> Dict:
        """요청 라우팅"""
        best_system = self.get_best_system_for_request(request_type)
        
        if not best_system:
            return {
                "success": False,
                "error": "사용 가능한 시스템이 없습니다.",
                "available_systems": [name for name, status in self.system_statuses.items() 
                                    if status.status == "running"]
            }
        
        system_config = self.config.systems[best_system]
        port = system_config["port"]
        
        try:
            url = f"http://localhost:{port}{endpoint}"
            
            async with self.session.post(url, json=data, timeout=10) as response:
                result = await response.json()
                result["routed_to"] = best_system
                result["routing_time"] = datetime.now(timezone.utc).isoformat()
                return result
                
        except Exception as e:
            logger.error(f"요청 라우팅 오류 ({best_system}): {e}")
            return {
                "success": False,
                "error": f"시스템 {best_system}으로의 요청 실패: {str(e)}",
                "routed_to": best_system
            }

# FastAPI 앱 생성
app = FastAPI(
    title="마스터 통합 시스템",
    description="모든 고도화된 시스템을 통합하는 마스터 시스템",
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

# 전역 시스템 관리자
master_manager = MasterSystemManager()

class MasterChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = "default"
    request_type: Optional[str] = "chat"
    conversation_history: Optional[List[Dict]] = None

class MasterLearningRequest(BaseModel):
    url: str
    content_type: str
    priority: Optional[str] = "medium"
    request_type: Optional[str] = "learning"

class MasterMultimodalRequest(BaseModel):
    user_id: str
    modality: str
    content_data: str
    metadata: Optional[Dict[str, Any]] = None
    request_type: Optional[str] = "multimodal"

@app.on_event("startup")
async def startup_event():
    """시작 이벤트"""
    async with master_manager:
        await master_manager.initialize_systems()
    logger.info("마스터 시스템 시작 완료")

@app.get("/api/master/status")
async def get_master_status():
    """마스터 시스템 상태 조회"""
    try:
        async with master_manager:
            await master_manager.check_all_systems()
            
            return {
                "success": True,
                "master_system": {
                    "status": "running",
                    "version": "1.0.0",
                    "uptime": "active"
                },
                "subsystems": {
                    name: {
                        "status": status.status,
                        "port": status.port,
                        "response_time": status.response_time,
                        "last_check": status.last_check,
                        "success_count": status.success_count,
                        "error_count": status.error_count
                    }
                    for name, status in master_manager.system_statuses.items()
                },
                "performance_summary": master_manager.get_system_performance_summary()
            }
    except Exception as e:
        logger.error(f"마스터 상태 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/master/chat")
async def master_chat(request: MasterChatRequest):
    """마스터 채팅 API"""
    try:
        async with master_manager:
            endpoint = "/api/ultimate-chat"
            data = {
                "message": request.message,
                "user_id": request.user_id,
                "conversation_history": request.conversation_history
            }
            
            result = await master_manager.route_request(request.request_type, endpoint, data)
            return result
            
    except Exception as e:
        logger.error(f"마스터 채팅 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/master/learning")
async def master_learning(request: MasterLearningRequest):
    """마스터 학습 API"""
    try:
        async with master_manager:
            endpoint = "/api/learn/add-source"
            data = {
                "url": request.url,
                "content_type": request.content_type,
                "priority": request.priority
            }
            
            result = await master_manager.route_request(request.request_type, endpoint, data)
            return result
            
    except Exception as e:
        logger.error(f"마스터 학습 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/master/multimodal")
async def master_multimodal(request: MasterMultimodalRequest):
    """마스터 멀티모달 API"""
    try:
        async with master_manager:
            # 먼저 세션 생성
            session_endpoint = "/api/multimodal/create-session"
            session_data = {
                "user_id": request.user_id,
                "modality": request.modality
            }
            
            session_result = await master_manager.route_request(request.request_type, session_endpoint, session_data)
            
            if not session_result.get("success"):
                return session_result
            
            session_id = session_result.get("session_id")
            
            # 콘텐츠 처리
            content_endpoint = f"/api/multimodal/process-content/{session_id}"
            content_data = {
                "modality": request.modality,
                "content_data": request.content_data,
                "metadata": request.metadata
            }
            
            result = await master_manager.route_request(request.request_type, content_endpoint, content_data)
            result["session_id"] = session_id
            
            return result
            
    except Exception as e:
        logger.error(f"마스터 멀티모달 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/master/analytics")
async def get_master_analytics():
    """마스터 분석 데이터 조회"""
    try:
        async with master_manager:
            await master_manager.check_all_systems()
            
            return {
                "success": True,
                "analytics": {
                    "system_performance": master_manager.get_system_performance_summary(),
                    "routing_rules": master_manager.config.routing_rules,
                    "total_systems": len(master_manager.config.systems),
                    "running_systems": len([s for s in master_manager.system_statuses.values() if s.status == "running"]),
                    "system_health": {
                        name: {
                            "status": status.status,
                            "response_time": status.response_time,
                            "success_rate": status.success_count / (status.success_count + status.error_count) if (status.success_count + status.error_count) > 0 else 0
                        }
                        for name, status in master_manager.system_statuses.items()
                    }
                }
            }
    except Exception as e:
        logger.error(f"마스터 분석 데이터 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/master/health-check")
async def health_check():
    """헬스 체크"""
    try:
        async with master_manager:
            await master_manager.check_all_systems()
            
            running_systems = [name for name, status in master_manager.system_statuses.items() if status.status == "running"]
            
            return {
                "status": "healthy" if len(running_systems) > 0 else "degraded",
                "running_systems": running_systems,
                "total_systems": len(master_manager.config.systems),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    except Exception as e:
        logger.error(f"헬스 체크 오류: {e}")
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "마스터 통합 시스템",
        "version": "1.0.0",
        "status": "running",
        "description": "모든 고도화된 시스템을 통합하는 마스터 시스템",
        "features": [
            "실시간 시스템 상태 모니터링",
            "지능형 요청 라우팅",
            "자동 장애 복구",
            "성능 최적화",
            "통합 API 제공",
            "시스템 간 상호 운용성",
            "실시간 분석 및 리포팅",
            "확장 가능한 아키텍처"
        ],
        "integrated_systems": list(master_manager.config.systems.keys()),
        "endpoints": {
            "master_status": "/api/master/status",
            "master_chat": "/api/master/chat",
            "master_learning": "/api/master/learning",
            "master_multimodal": "/api/master/multimodal",
            "master_analytics": "/api/master/analytics",
            "health_check": "/api/master/health-check",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    logger.info("🚀 마스터 통합 시스템을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8001")
    logger.info("📚 API 문서: http://localhost:8001/docs")
    logger.info("🔗 통합 시스템:")
    logger.info("   - 궁극의 유시민 AI 시스템 (포트 8003)")
    logger.info("   - 고급 웹 학습 통합 시스템 (포트 8004)")
    logger.info("   - 멀티모달 학습 통합 시스템 (포트 8005)")
    logger.info("   - 유시민 고도화 서버 (포트 8002)")
    logger.info("⚡ 실시간 모니터링 및 라우팅 활성화")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )
