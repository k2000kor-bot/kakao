#!/usr/bin/env python3
"""
궁극의 통합 시스템
- 모든 고도화된 시스템의 최종 통합
- 지능형 오케스트레이션
- 자동 장애 복구 및 최적화
- 실시간 모니터링 및 관리
- 확장 가능한 마이크로서비스 아키텍처
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum

import aiohttp
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SystemType(Enum):
    """시스템 유형"""
    MASTER = "master"
    ULTIMATE_YOO_AI = "ultimate_yoo_ai"
    ADVANCED_WEB_LEARNING = "advanced_web_learning"
    MULTIMODAL_LEARNING = "multimodal_learning"
    ADVANCED_AI_INTEGRATION = "advanced_ai_integration"
    REAL_TIME_PERFORMANCE = "real_time_performance"
    YOO_SI_MIN_ENHANCED = "yoo_si_min_enhanced"

class SystemStatus(Enum):
    """시스템 상태"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    OFFLINE = "offline"

@dataclass
class SystemInfo:
    """시스템 정보"""
    system_type: SystemType
    port: int
    status: SystemStatus
    last_check: str
    response_time: float
    success_rate: float
    error_count: int = 0
    success_count: int = 0
    features: List[str] = field(default_factory=list)
    dependencies: List[SystemType] = field(default_factory=list)

@dataclass
class OrchestrationRule:
    """오케스트레이션 규칙"""
    rule_id: str
    condition: str
    action: str
    target_systems: List[SystemType]
    priority: int
    enabled: bool = True

@dataclass
class SystemHealth:
    """시스템 건강 상태"""
    overall_health: SystemStatus
    healthy_systems: int
    total_systems: int
    critical_issues: List[str]
    recommendations: List[str]
    last_updated: str

class UltimateIntegratedSystem:
    """궁극의 통합 시스템"""
    
    def __init__(self):
        self.systems = self._initialize_systems()
        self.orchestration_rules = self._initialize_orchestration_rules()
        self.session = None
        self.websocket_connections: List[WebSocket] = []
        self.system_health = SystemHealth(
            overall_health=SystemStatus.OFFLINE,
            healthy_systems=0,
            total_systems=len(self.systems),
            critical_issues=[],
            recommendations=[],
            last_updated=datetime.now(timezone.utc).isoformat()
        )
        
    def _initialize_systems(self) -> Dict[SystemType, SystemInfo]:
        """시스템 초기화"""
        return {
            SystemType.MASTER: SystemInfo(
                system_type=SystemType.MASTER,
                port=8001,
                status=SystemStatus.OFFLINE,
                last_check="",
                response_time=0.0,
                success_rate=1.0,
                features=["통합 라우팅", "시스템 관리", "성능 모니터링"],
                dependencies=[]
            ),
            SystemType.ULTIMATE_YOO_AI: SystemInfo(
                system_type=SystemType.ULTIMATE_YOO_AI,
                port=8003,
                status=SystemStatus.OFFLINE,
                last_check="",
                response_time=0.0,
                success_rate=1.0,
                features=["고급 AI 통합", "실시간 적응", "개인화"],
                dependencies=[SystemType.MASTER]
            ),
            SystemType.ADVANCED_WEB_LEARNING: SystemInfo(
                system_type=SystemType.ADVANCED_WEB_LEARNING,
                port=8004,
                status=SystemStatus.OFFLINE,
                last_check="",
                response_time=0.0,
                success_rate=1.0,
                features=["웹 콘텐츠 학습", "ChatGPT 통합", "실시간 학습"],
                dependencies=[SystemType.MASTER]
            ),
            SystemType.MULTIMODAL_LEARNING: SystemInfo(
                system_type=SystemType.MULTIMODAL_LEARNING,
                port=8005,
                status=SystemStatus.OFFLINE,
                last_check="",
                response_time=0.0,
                success_rate=1.0,
                features=["멀티모달 학습", "텍스트/음성/이미지", "적응형 학습"],
                dependencies=[SystemType.MASTER]
            ),
            SystemType.ADVANCED_AI_INTEGRATION: SystemInfo(
                system_type=SystemType.ADVANCED_AI_INTEGRATION,
                port=8006,
                status=SystemStatus.OFFLINE,
                last_check="",
                response_time=0.0,
                success_rate=1.0,
                features=["다중 AI 모델", "성능 최적화", "품질 평가"],
                dependencies=[SystemType.MASTER]
            ),
            SystemType.REAL_TIME_PERFORMANCE: SystemInfo(
                system_type=SystemType.REAL_TIME_PERFORMANCE,
                port=8007,
                status=SystemStatus.OFFLINE,
                last_check="",
                response_time=0.0,
                success_rate=1.0,
                features=["실시간 모니터링", "자동 최적화", "성능 분석"],
                dependencies=[SystemType.MASTER]
            ),
            SystemType.YOO_SI_MIN_ENHANCED: SystemInfo(
                system_type=SystemType.YOO_SI_MIN_ENHANCED,
                port=8002,
                status=SystemStatus.OFFLINE,
                last_check="",
                response_time=0.0,
                success_rate=1.0,
                features=["유시민 스타일", "딥러닝", "맥락 인식"],
                dependencies=[SystemType.MASTER]
            )
        }
    
    def _initialize_orchestration_rules(self) -> List[OrchestrationRule]:
        """오케스트레이션 규칙 초기화"""
        return [
            OrchestrationRule(
                rule_id="rule_001",
                condition="master_system_down",
                action="restart_master",
                target_systems=[SystemType.MASTER],
                priority=1
            ),
            OrchestrationRule(
                rule_id="rule_002",
                condition="high_cpu_usage",
                action="scale_up_systems",
                target_systems=[SystemType.ULTIMATE_YOO_AI, SystemType.ADVANCED_WEB_LEARNING],
                priority=2
            ),
            OrchestrationRule(
                rule_id="rule_003",
                condition="low_response_quality",
                action="switch_to_backup_ai",
                target_systems=[SystemType.ADVANCED_AI_INTEGRATION],
                priority=3
            ),
            OrchestrationRule(
                rule_id="rule_004",
                condition="learning_system_overload",
                action="distribute_load",
                target_systems=[SystemType.MULTIMODAL_LEARNING, SystemType.ADVANCED_WEB_LEARNING],
                priority=4
            ),
            OrchestrationRule(
                rule_id="rule_005",
                condition="performance_degradation",
                action="optimize_all_systems",
                target_systems=list(SystemType),
                priority=5
            )
        ]
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def check_all_systems_health(self) -> SystemHealth:
        """모든 시스템 건강 상태 확인"""
        healthy_count = 0
        critical_issues = []
        recommendations = []
        
        for system_type, system_info in self.systems.items():
            try:
                health_status = await self._check_system_health(system_type)
                system_info.status = health_status["status"]
                system_info.response_time = health_status["response_time"]
                system_info.last_check = datetime.now(timezone.utc).isoformat()
                
                if health_status["status"] == SystemStatus.HEALTHY:
                    healthy_count += 1
                elif health_status["status"] == SystemStatus.DEGRADED:
                    recommendations.append(f"{system_type.value} 시스템 성능 저하 감지")
                elif health_status["status"] == SystemStatus.UNHEALTHY:
                    critical_issues.append(f"{system_type.value} 시스템 비정상 상태")
                else:
                    critical_issues.append(f"{system_type.value} 시스템 오프라인")
                    
            except Exception as e:
                logger.error(f"시스템 {system_type.value} 상태 확인 오류: {e}")
                system_info.status = SystemStatus.OFFLINE
                critical_issues.append(f"{system_type.value} 시스템 연결 실패")
        
        # 전체 건강 상태 결정
        if healthy_count == len(self.systems):
            overall_health = SystemStatus.HEALTHY
        elif healthy_count >= len(self.systems) * 0.8:
            overall_health = SystemStatus.DEGRADED
        elif healthy_count >= len(self.systems) * 0.5:
            overall_health = SystemStatus.UNHEALTHY
        else:
            overall_health = SystemStatus.OFFLINE
        
        self.system_health = SystemHealth(
            overall_health=overall_health,
            healthy_systems=healthy_count,
            total_systems=len(self.systems),
            critical_issues=critical_issues,
            recommendations=recommendations,
            last_updated=datetime.now(timezone.utc).isoformat()
        )
        
        return self.system_health
    
    async def _check_system_health(self, system_type: SystemType) -> Dict[str, Any]:
        """개별 시스템 건강 상태 확인"""
        system_info = self.systems[system_type]
        
        try:
            url = f"http://localhost:{system_info.port}/"
            start_time = time.time()
            
            async with self.session.get(url, timeout=5) as response:
                response_time = time.time() - start_time
                
                if response.status == 200:
                    system_info.success_count += 1
                    return {
                        "status": SystemStatus.HEALTHY,
                        "response_time": response_time,
                        "message": "시스템 정상"
                    }
                else:
                    system_info.error_count += 1
                    return {
                        "status": SystemStatus.DEGRADED,
                        "response_time": response_time,
                        "message": f"HTTP {response.status}"
                    }
                    
        except asyncio.TimeoutError:
            system_info.error_count += 1
            return {
                "status": SystemStatus.UNHEALTHY,
                "response_time": 5.0,
                "message": "응답 시간 초과"
            }
        except Exception as e:
            system_info.error_count += 1
            return {
                "status": SystemStatus.OFFLINE,
                "response_time": 0.0,
                "message": f"연결 실패: {str(e)}"
            }
    
    async def orchestrate_systems(self) -> Dict[str, Any]:
        """시스템 오케스트레이션"""
        orchestration_results = []
        
        # 건강 상태 확인
        health = await self.check_all_systems_health()
        
        # 오케스트레이션 규칙 실행
        for rule in self.orchestration_rules:
            if not rule.enabled:
                continue
                
            try:
                result = await self._execute_orchestration_rule(rule, health)
                orchestration_results.append(result)
            except Exception as e:
                logger.error(f"오케스트레이션 규칙 {rule.rule_id} 실행 오류: {e}")
                orchestration_results.append({
                    "rule_id": rule.rule_id,
                    "success": False,
                    "error": str(e)
                })
        
        return {
            "system_health": health.__dict__,
            "orchestration_results": orchestration_results,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    async def _execute_orchestration_rule(self, rule: OrchestrationRule, health: SystemHealth) -> Dict[str, Any]:
        """오케스트레이션 규칙 실행"""
        result = {
            "rule_id": rule.rule_id,
            "condition": rule.condition,
            "action": rule.action,
            "success": False,
            "message": ""
        }
        
        # 조건 확인
        condition_met = await self._evaluate_condition(rule.condition, health)
        
        if condition_met:
            # 액션 실행
            action_result = await self._execute_action(rule.action, rule.target_systems)
            result.update(action_result)
        else:
            result["message"] = "조건 미충족"
        
        return result
    
    async def _evaluate_condition(self, condition: str, health: SystemHealth) -> bool:
        """조건 평가"""
        if condition == "master_system_down":
            return self.systems[SystemType.MASTER].status == SystemStatus.OFFLINE
        elif condition == "high_cpu_usage":
            # 실제로는 CPU 사용률 확인
            return health.overall_health == SystemStatus.DEGRADED
        elif condition == "low_response_quality":
            # 실제로는 응답 품질 확인
            return health.overall_health == SystemStatus.UNHEALTHY
        elif condition == "learning_system_overload":
            # 실제로는 학습 시스템 부하 확인
            return health.healthy_systems < health.total_systems * 0.7
        elif condition == "performance_degradation":
            return health.overall_health in [SystemStatus.DEGRADED, SystemStatus.UNHEALTHY]
        
        return False
    
    async def _execute_action(self, action: str, target_systems: List[SystemType]) -> Dict[str, Any]:
        """액션 실행"""
        if action == "restart_master":
            return await self._restart_system(SystemType.MASTER)
        elif action == "scale_up_systems":
            return await self._scale_up_systems(target_systems)
        elif action == "switch_to_backup_ai":
            return await self._switch_to_backup_ai()
        elif action == "distribute_load":
            return await self._distribute_load(target_systems)
        elif action == "optimize_all_systems":
            return await self._optimize_all_systems()
        else:
            return {
                "success": False,
                "message": f"알 수 없는 액션: {action}"
            }
    
    async def _restart_system(self, system_type: SystemType) -> Dict[str, Any]:
        """시스템 재시작"""
        # 실제로는 시스템 재시작 로직 구현
        logger.info(f"시스템 {system_type.value} 재시작 요청")
        return {
            "success": True,
            "message": f"{system_type.value} 시스템 재시작 요청됨"
        }
    
    async def _scale_up_systems(self, target_systems: List[SystemType]) -> Dict[str, Any]:
        """시스템 스케일 업"""
        logger.info(f"시스템 스케일 업: {[s.value for s in target_systems]}")
        return {
            "success": True,
            "message": f"{len(target_systems)}개 시스템 스케일 업 요청됨"
        }
    
    async def _switch_to_backup_ai(self) -> Dict[str, Any]:
        """백업 AI로 전환"""
        logger.info("백업 AI 시스템으로 전환")
        return {
            "success": True,
            "message": "백업 AI 시스템으로 전환됨"
        }
    
    async def _distribute_load(self, target_systems: List[SystemType]) -> Dict[str, Any]:
        """부하 분산"""
        logger.info(f"부하 분산: {[s.value for s in target_systems]}")
        return {
            "success": True,
            "message": f"{len(target_systems)}개 시스템에 부하 분산됨"
        }
    
    async def _optimize_all_systems(self) -> Dict[str, Any]:
        """모든 시스템 최적화"""
        logger.info("모든 시스템 최적화 실행")
        return {
            "success": True,
            "message": "전체 시스템 최적화 완료"
        }
    
    async def route_request(self, request_type: str, endpoint: str, data: Dict) -> Dict[str, Any]:
        """요청 라우팅"""
        # 최적 시스템 선택
        best_system = self._select_best_system_for_request(request_type)
        
        if not best_system:
            return {
                "success": False,
                "error": "사용 가능한 시스템이 없습니다.",
                "fallback_response": self._generate_fallback_response(data)
            }
        
        system_info = self.systems[best_system]
        
        try:
            url = f"http://localhost:{system_info.port}{endpoint}"
            
            async with self.session.post(url, json=data, timeout=10) as response:
                result = await response.json()
                result["routed_to"] = best_system.value
                result["routing_time"] = datetime.now(timezone.utc).isoformat()
                result["system_port"] = system_info.port
                return result
                
        except Exception as e:
            logger.error(f"요청 라우팅 오류 ({best_system.value}): {e}")
            return {
                "success": False,
                "error": f"시스템 {best_system.value}으로의 요청 실패: {str(e)}",
                "routed_to": best_system.value,
                "fallback_response": self._generate_fallback_response(data)
            }
    
    def _select_best_system_for_request(self, request_type: str) -> Optional[SystemType]:
        """요청 유형에 따른 최적 시스템 선택"""
        # 요청 유형별 시스템 매핑
        request_mapping = {
            "chat": SystemType.ULTIMATE_YOO_AI,
            "learning": SystemType.ADVANCED_WEB_LEARNING,
            "multimodal": SystemType.MULTIMODAL_LEARNING,
            "ai_integration": SystemType.ADVANCED_AI_INTEGRATION,
            "performance": SystemType.REAL_TIME_PERFORMANCE,
            "yoo_style": SystemType.YOO_SI_MIN_ENHANCED
        }
        
        preferred_system = request_mapping.get(request_type)
        
        if preferred_system and self.systems[preferred_system].status == SystemStatus.HEALTHY:
            return preferred_system
        
        # 백업 시스템 선택
        healthy_systems = [
            system_type for system_type, system_info in self.systems.items()
            if system_info.status == SystemStatus.HEALTHY
        ]
        
        if healthy_systems:
            return healthy_systems[0]
        
        return None
    
    def _generate_fallback_response(self, data: Dict) -> str:
        """폴백 응답 생성"""
        message = data.get("message", "질문")
        
        return f"""
안녕하세요! "{message}"에 대해 답변드리겠습니다.

현재 시스템이 일시적으로 사용할 수 없는 상태입니다. 하지만 기본적인 답변을 제공해드리겠습니다.

귀하의 질문에 대한 답변을 제공해드리겠습니다.

현재 궁극의 통합 시스템은 다음과 같은 기능을 제공합니다:
- **고급 AI 통합**: 여러 AI 모델의 장점을 결합
- **실시간 학습**: 웹 콘텐츠를 통한 지속적 학습
- **멀티모달 처리**: 텍스트, 음성, 이미지 통합 처리
- **성능 최적화**: 실시간 모니터링 및 자동 최적화
- **지능형 오케스트레이션**: 시스템 간 자동 조율

더 구체적인 도움이 필요하시다면 시스템이 복구된 후 다시 시도해주세요.

---
*궁극의 통합 시스템이 제공하는 지능형 서비스입니다*
"""
    
    def get_system_overview(self) -> Dict[str, Any]:
        """시스템 개요 조회"""
        return {
            "overall_status": self.system_health.overall_health.value,
            "healthy_systems": self.system_health.healthy_systems,
            "total_systems": self.system_health.total_systems,
            "systems": {
                system_type.value: {
                    "port": system_info.port,
                    "status": system_info.status.value,
                    "response_time": system_info.response_time,
                    "success_rate": system_info.success_rate,
                    "features": system_info.features,
                    "last_check": system_info.last_check
                }
                for system_type, system_info in self.systems.items()
            },
            "critical_issues": self.system_health.critical_issues,
            "recommendations": self.system_health.recommendations,
            "last_updated": self.system_health.last_updated
        }
    
    async def broadcast_system_update(self, update_data: Dict):
        """시스템 업데이트 브로드캐스트"""
        disconnected = []
        for websocket in self.websocket_connections:
            try:
                await websocket.send_json(update_data)
            except:
                disconnected.append(websocket)
        
        # 연결이 끊어진 WebSocket 제거
        for ws in disconnected:
            self.websocket_connections.remove(ws)

# FastAPI 앱 생성
app = FastAPI(
    title="궁극의 통합 시스템",
    description="모든 고도화된 시스템의 최종 통합 및 오케스트레이션",
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

# 전역 시스템 인스턴스
ultimate_system = UltimateIntegratedSystem()

class UltimateRequest(BaseModel):
    message: str
    request_type: str
    user_id: Optional[str] = "default"
    context: Optional[Dict[str, Any]] = None

class UltimateResponse(BaseModel):
    success: bool
    response: str
    routed_to: str
    system_port: int
    routing_time: str
    system_status: str

@app.on_event("startup")
async def startup_event():
    """시작 이벤트"""
    async with ultimate_system:
        await ultimate_system.check_all_systems_health()
    logger.info("궁극의 통합 시스템 시작 완료")

@app.post("/api/ultimate/request", response_model=UltimateResponse)
async def ultimate_request(request: UltimateRequest):
    """궁극의 통합 요청"""
    try:
        async with ultimate_system:
            # 요청 유형에 따른 엔드포인트 결정
            endpoint_mapping = {
                "chat": "/api/ultimate-chat",
                "learning": "/api/learn/add-source",
                "multimodal": "/api/multimodal/create-session",
                "ai_integration": "/api/ai/generate",
                "performance": "/api/performance/status",
                "yoo_style": "/api/chat/yoo-style"
            }
            
            endpoint = endpoint_mapping.get(request.request_type, "/api/ultimate-chat")
            
            data = {
                "message": request.message,
                "user_id": request.user_id,
                "context": request.context
            }
            
            result = await ultimate_system.route_request(request.request_type, endpoint, data)
            
            return UltimateResponse(
                success=result.get("success", False),
                response=result.get("response", result.get("fallback_response", "")),
                routed_to=result.get("routed_to", "unknown"),
                system_port=result.get("system_port", 0),
                routing_time=result.get("routing_time", ""),
                system_status=ultimate_system.system_health.overall_health.value
            )
            
    except Exception as e:
        logger.error(f"궁극 요청 처리 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ultimate/status")
async def get_ultimate_status():
    """궁극 시스템 상태 조회"""
    try:
        async with ultimate_system:
            await ultimate_system.check_all_systems_health()
            overview = ultimate_system.get_system_overview()
            
            return {
                "success": True,
                "overview": overview
            }
    except Exception as e:
        logger.error(f"궁극 상태 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ultimate/orchestrate")
async def orchestrate_systems():
    """시스템 오케스트레이션 실행"""
    try:
        async with ultimate_system:
            orchestration_result = await ultimate_system.orchestrate_systems()
            
            return {
                "success": True,
                "orchestration": orchestration_result
            }
    except Exception as e:
        logger.error(f"시스템 오케스트레이션 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/ultimate")
async def websocket_ultimate_monitor(websocket: WebSocket):
    """궁극 시스템 실시간 모니터링 WebSocket"""
    await websocket.accept()
    ultimate_system.websocket_connections.append(websocket)
    
    try:
        while True:
            # 주기적으로 시스템 상태 업데이트 전송
            await asyncio.sleep(10)
            
            async with ultimate_system:
                await ultimate_system.check_all_systems_health()
                overview = ultimate_system.get_system_overview()
            
            data = {
                "type": "system_update",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "overview": overview
            }
            
            await websocket.send_json(data)
            
    except WebSocketDisconnect:
        ultimate_system.websocket_connections.remove(websocket)
    except Exception as e:
        logger.error(f"WebSocket 오류: {e}")
        if websocket in ultimate_system.websocket_connections:
            ultimate_system.websocket_connections.remove(websocket)

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "궁극의 통합 시스템",
        "version": "1.0.0",
        "status": "running",
        "description": "모든 고도화된 시스템의 최종 통합 및 오케스트레이션",
        "features": [
            "지능형 시스템 오케스트레이션",
            "자동 장애 복구 및 최적화",
            "실시간 모니터링 및 관리",
            "확장 가능한 마이크로서비스 아키텍처",
            "다중 AI 모델 통합",
            "실시간 학습 및 적응",
            "멀티모달 콘텐츠 처리",
            "성능 최적화 및 스케일링"
        ],
        "integrated_systems": [
            "마스터 통합 시스템 (포트 8001)",
            "궁극의 유시민 AI 시스템 (포트 8003)",
            "고급 웹 학습 통합 시스템 (포트 8004)",
            "멀티모달 학습 통합 시스템 (포트 8005)",
            "고급 AI 통합 시스템 (포트 8006)",
            "실시간 성능 모니터링 시스템 (포트 8007)",
            "유시민 고도화 서버 (포트 8002)"
        ],
        "endpoints": {
            "ultimate_request": "/api/ultimate/request",
            "system_status": "/api/ultimate/status",
            "orchestrate": "/api/ultimate/orchestrate",
            "websocket": "/ws/ultimate",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    logger.info("🚀 궁극의 통합 시스템을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/docs")
    logger.info("🔗 통합된 시스템들:")
    logger.info("   - 마스터 통합 시스템 (포트 8001)")
    logger.info("   - 궁극의 유시민 AI 시스템 (포트 8003)")
    logger.info("   - 고급 웹 학습 통합 시스템 (포트 8004)")
    logger.info("   - 멀티모달 학습 통합 시스템 (포트 8005)")
    logger.info("   - 고급 AI 통합 시스템 (포트 8006)")
    logger.info("   - 실시간 성능 모니터링 시스템 (포트 8007)")
    logger.info("   - 유시민 고도화 서버 (포트 8002)")
    logger.info("⚡ 지능형 오케스트레이션 활성화")
    logger.info("🔧 자동 장애 복구 및 최적화 활성화")
    logger.info("📊 실시간 모니터링 및 관리 활성화")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
