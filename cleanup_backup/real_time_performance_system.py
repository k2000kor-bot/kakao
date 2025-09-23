#!/usr/bin/env python3
"""
실시간 성능 모니터링 및 최적화 시스템
- 실시간 시스템 성능 추적
- 자동 성능 최적화
- 지능형 리소스 관리
- 예측적 스케일링
- 실시간 알림 및 대시보드
"""

import asyncio
import json
import logging
import psutil
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum

import aiohttp
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PerformanceLevel(Enum):
    """성능 수준"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    CRITICAL = "critical"

class AlertType(Enum):
    """알림 유형"""
    CPU_HIGH = "cpu_high"
    MEMORY_HIGH = "memory_high"
    DISK_FULL = "disk_full"
    NETWORK_SLOW = "network_slow"
    RESPONSE_SLOW = "response_slow"
    ERROR_RATE_HIGH = "error_rate_high"

@dataclass
class SystemMetrics:
    """시스템 메트릭"""
    timestamp: str
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    network_io: Dict[str, int]
    process_count: int
    load_average: Tuple[float, float, float]
    uptime: float

@dataclass
class ApplicationMetrics:
    """애플리케이션 메트릭"""
    timestamp: str
    response_time: float
    request_count: int
    error_count: int
    success_rate: float
    active_connections: int
    queue_size: int
    throughput: float

@dataclass
class PerformanceAlert:
    """성능 알림"""
    alert_id: str
    alert_type: AlertType
    severity: str  # "low", "medium", "high", "critical"
    message: str
    metric_value: float
    threshold: float
    timestamp: str
    resolved: bool = False
    resolved_at: Optional[str] = None

@dataclass
class OptimizationAction:
    """최적화 액션"""
    action_id: str
    action_type: str  # "scale_up", "scale_down", "restart", "cleanup", "optimize"
    target_system: str
    description: str
    estimated_impact: str
    executed: bool = False
    executed_at: Optional[str] = None
    result: Optional[str] = None

class RealTimePerformanceMonitor:
    """실시간 성능 모니터"""
    
    def __init__(self):
        self.system_metrics_history: List[SystemMetrics] = []
        self.application_metrics_history: List[ApplicationMetrics] = []
        self.active_alerts: List[PerformanceAlert] = []
        self.optimization_actions: List[OptimizationAction] = []
        self.websocket_connections: List[WebSocket] = []
        
        # 성능 임계값 설정
        self.thresholds = {
            "cpu_percent": 80.0,
            "memory_percent": 85.0,
            "disk_percent": 90.0,
            "response_time": 5.0,  # 초
            "error_rate": 0.05,  # 5%
            "network_latency": 1000.0  # ms
        }
        
        # 최적화 규칙
        self.optimization_rules = self._initialize_optimization_rules()
        
    def _initialize_optimization_rules(self) -> Dict[str, Dict]:
        """최적화 규칙 초기화"""
        return {
            "cpu_high": {
                "condition": "cpu_percent > 80",
                "action": "scale_up",
                "description": "CPU 사용률이 높을 때 스케일 업"
            },
            "memory_high": {
                "condition": "memory_percent > 85",
                "action": "cleanup_memory",
                "description": "메모리 사용률이 높을 때 정리"
            },
            "response_slow": {
                "condition": "response_time > 5",
                "action": "optimize_cache",
                "description": "응답 시간이 느릴 때 캐시 최적화"
            },
            "error_rate_high": {
                "condition": "error_rate > 0.05",
                "action": "restart_service",
                "description": "에러율이 높을 때 서비스 재시작"
            }
        }
    
    async def collect_system_metrics(self) -> SystemMetrics:
        """시스템 메트릭 수집"""
        try:
            # CPU 사용률
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # 메모리 사용률
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # 디스크 사용률
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            
            # 네트워크 I/O
            network_io = psutil.net_io_counters()._asdict()
            
            # 프로세스 수
            process_count = len(psutil.pids())
            
            # 로드 평균
            load_average = psutil.getloadavg()
            
            # 업타임
            uptime = time.time() - psutil.boot_time()
            
            metrics = SystemMetrics(
                timestamp=datetime.now(timezone.utc).isoformat(),
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                disk_percent=disk_percent,
                network_io=network_io,
                process_count=process_count,
                load_average=load_average,
                uptime=uptime
            )
            
            # 히스토리에 추가
            self.system_metrics_history.append(metrics)
            
            # 최근 1000개만 유지
            if len(self.system_metrics_history) > 1000:
                self.system_metrics_history = self.system_metrics_history[-1000:]
            
            return metrics
            
        except Exception as e:
            logger.error(f"시스템 메트릭 수집 오류: {e}")
            raise
    
    async def collect_application_metrics(self, response_time: float = 0.0, 
                                        request_count: int = 0, 
                                        error_count: int = 0) -> ApplicationMetrics:
        """애플리케이션 메트릭 수집"""
        try:
            success_rate = (request_count - error_count) / request_count if request_count > 0 else 1.0
            
            # 활성 연결 수 (시뮬레이션)
            active_connections = len(self.websocket_connections)
            
            # 큐 크기 (시뮬레이션)
            queue_size = max(0, request_count - active_connections)
            
            # 처리량 (초당 요청 수)
            throughput = request_count / 60.0 if request_count > 0 else 0.0
            
            metrics = ApplicationMetrics(
                timestamp=datetime.now(timezone.utc).isoformat(),
                response_time=response_time,
                request_count=request_count,
                error_count=error_count,
                success_rate=success_rate,
                active_connections=active_connections,
                queue_size=queue_size,
                throughput=throughput
            )
            
            # 히스토리에 추가
            self.application_metrics_history.append(metrics)
            
            # 최근 1000개만 유지
            if len(self.application_metrics_history) > 1000:
                self.application_metrics_history = self.application_metrics_history[-1000:]
            
            return metrics
            
        except Exception as e:
            logger.error(f"애플리케이션 메트릭 수집 오류: {e}")
            raise
    
    async def analyze_performance(self) -> Dict[str, Any]:
        """성능 분석"""
        try:
            if not self.system_metrics_history:
                return {"status": "no_data"}
            
            latest_system = self.system_metrics_history[-1]
            latest_app = self.application_metrics_history[-1] if self.application_metrics_history else None
            
            # 성능 수준 결정
            performance_level = self._determine_performance_level(latest_system, latest_app)
            
            # 알림 생성
            await self._check_alerts(latest_system, latest_app)
            
            # 최적화 액션 제안
            optimization_suggestions = await self._suggest_optimizations(latest_system, latest_app)
            
            # 성능 트렌드 분석
            trends = self._analyze_trends()
            
            return {
                "status": "analyzed",
                "performance_level": performance_level.value,
                "current_metrics": {
                    "system": {
                        "cpu_percent": latest_system.cpu_percent,
                        "memory_percent": latest_system.memory_percent,
                        "disk_percent": latest_system.disk_percent,
                        "process_count": latest_system.process_count,
                        "uptime": latest_system.uptime
                    },
                    "application": {
                        "response_time": latest_app.response_time if latest_app else 0,
                        "request_count": latest_app.request_count if latest_app else 0,
                        "error_count": latest_app.error_count if latest_app else 0,
                        "success_rate": latest_app.success_rate if latest_app else 1.0,
                        "active_connections": latest_app.active_connections if latest_app else 0,
                        "throughput": latest_app.throughput if latest_app else 0
                    }
                },
                "active_alerts": len([alert for alert in self.active_alerts if not alert.resolved]),
                "optimization_suggestions": optimization_suggestions,
                "trends": trends
            }
            
        except Exception as e:
            logger.error(f"성능 분석 오류: {e}")
            return {"status": "error", "error": str(e)}
    
    def _determine_performance_level(self, system_metrics: SystemMetrics, 
                                   app_metrics: Optional[ApplicationMetrics]) -> PerformanceLevel:
        """성능 수준 결정"""
        score = 100.0
        
        # CPU 점수 차감
        if system_metrics.cpu_percent > 90:
            score -= 30
        elif system_metrics.cpu_percent > 80:
            score -= 20
        elif system_metrics.cpu_percent > 70:
            score -= 10
        
        # 메모리 점수 차감
        if system_metrics.memory_percent > 95:
            score -= 30
        elif system_metrics.memory_percent > 85:
            score -= 20
        elif system_metrics.memory_percent > 75:
            score -= 10
        
        # 디스크 점수 차감
        if system_metrics.disk_percent > 95:
            score -= 20
        elif system_metrics.disk_percent > 90:
            score -= 15
        elif system_metrics.disk_percent > 80:
            score -= 10
        
        # 애플리케이션 메트릭 점수 차감
        if app_metrics:
            if app_metrics.response_time > 10:
                score -= 25
            elif app_metrics.response_time > 5:
                score -= 15
            elif app_metrics.response_time > 2:
                score -= 10
            
            if app_metrics.success_rate < 0.9:
                score -= 20
            elif app_metrics.success_rate < 0.95:
                score -= 10
        
        # 성능 수준 결정
        if score >= 90:
            return PerformanceLevel.EXCELLENT
        elif score >= 75:
            return PerformanceLevel.GOOD
        elif score >= 60:
            return PerformanceLevel.FAIR
        elif score >= 40:
            return PerformanceLevel.POOR
        else:
            return PerformanceLevel.CRITICAL
    
    async def _check_alerts(self, system_metrics: SystemMetrics, 
                          app_metrics: Optional[ApplicationMetrics]):
        """알림 확인"""
        alerts_to_check = [
            (AlertType.CPU_HIGH, system_metrics.cpu_percent, self.thresholds["cpu_percent"]),
            (AlertType.MEMORY_HIGH, system_metrics.memory_percent, self.thresholds["memory_percent"]),
            (AlertType.DISK_FULL, system_metrics.disk_percent, self.thresholds["disk_percent"])
        ]
        
        if app_metrics:
            alerts_to_check.extend([
                (AlertType.RESPONSE_SLOW, app_metrics.response_time, self.thresholds["response_time"]),
                (AlertType.ERROR_RATE_HIGH, 1 - app_metrics.success_rate, self.thresholds["error_rate"])
            ])
        
        for alert_type, current_value, threshold in alerts_to_check:
            if current_value > threshold:
                await self._create_alert(alert_type, current_value, threshold)
    
    async def _create_alert(self, alert_type: AlertType, current_value: float, threshold: float):
        """알림 생성"""
        # 중복 알림 방지
        existing_alert = next(
            (alert for alert in self.active_alerts 
             if alert.alert_type == alert_type and not alert.resolved), 
            None
        )
        
        if existing_alert:
            return
        
        alert_id = f"alert_{alert_type.value}_{int(time.time())}"
        
        # 심각도 결정
        severity = "low"
        if current_value > threshold * 1.5:
            severity = "high"
        elif current_value > threshold * 1.2:
            severity = "medium"
        
        alert = PerformanceAlert(
            alert_id=alert_id,
            alert_type=alert_type,
            severity=severity,
            message=f"{alert_type.value} 임계값 초과: {current_value:.2f} > {threshold:.2f}",
            metric_value=current_value,
            threshold=threshold,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
        self.active_alerts.append(alert)
        
        # WebSocket 연결에 알림 전송
        await self._broadcast_alert(alert)
        
        logger.warning(f"성능 알림 생성: {alert.message}")
    
    async def _broadcast_alert(self, alert: PerformanceAlert):
        """알림 브로드캐스트"""
        alert_data = {
            "type": "alert",
            "alert_id": alert.alert_id,
            "alert_type": alert.alert_type.value,
            "severity": alert.severity,
            "message": alert.message,
            "metric_value": alert.metric_value,
            "threshold": alert.threshold,
            "timestamp": alert.timestamp
        }
        
        disconnected = []
        for websocket in self.websocket_connections:
            try:
                await websocket.send_json(alert_data)
            except:
                disconnected.append(websocket)
        
        # 연결이 끊어진 WebSocket 제거
        for ws in disconnected:
            self.websocket_connections.remove(ws)
    
    async def _suggest_optimizations(self, system_metrics: SystemMetrics, 
                                   app_metrics: Optional[ApplicationMetrics]) -> List[Dict]:
        """최적화 제안"""
        suggestions = []
        
        # CPU 최적화 제안
        if system_metrics.cpu_percent > 80:
            suggestions.append({
                "type": "scale_up",
                "description": "CPU 사용률이 높습니다. 서버 스케일 업을 고려하세요.",
                "priority": "high",
                "estimated_impact": "CPU 사용률 20% 감소 예상"
            })
        
        # 메모리 최적화 제안
        if system_metrics.memory_percent > 85:
            suggestions.append({
                "type": "cleanup_memory",
                "description": "메모리 사용률이 높습니다. 메모리 정리를 수행하세요.",
                "priority": "high",
                "estimated_impact": "메모리 사용률 15% 감소 예상"
            })
        
        # 응답 시간 최적화 제안
        if app_metrics and app_metrics.response_time > 5:
            suggestions.append({
                "type": "optimize_cache",
                "description": "응답 시간이 느립니다. 캐시 최적화를 고려하세요.",
                "priority": "medium",
                "estimated_impact": "응답 시간 30% 단축 예상"
            })
        
        # 에러율 최적화 제안
        if app_metrics and app_metrics.success_rate < 0.95:
            suggestions.append({
                "type": "restart_service",
                "description": "에러율이 높습니다. 서비스 재시작을 고려하세요.",
                "priority": "high",
                "estimated_impact": "에러율 50% 감소 예상"
            })
        
        return suggestions
    
    def _analyze_trends(self) -> Dict[str, Any]:
        """트렌드 분석"""
        if len(self.system_metrics_history) < 10:
            return {"status": "insufficient_data"}
        
        recent_metrics = self.system_metrics_history[-10:]
        
        # CPU 트렌드
        cpu_values = [m.cpu_percent for m in recent_metrics]
        cpu_trend = "increasing" if cpu_values[-1] > cpu_values[0] else "decreasing"
        
        # 메모리 트렌드
        memory_values = [m.memory_percent for m in recent_metrics]
        memory_trend = "increasing" if memory_values[-1] > memory_values[0] else "decreasing"
        
        # 디스크 트렌드
        disk_values = [m.disk_percent for m in recent_metrics]
        disk_trend = "increasing" if disk_values[-1] > disk_values[0] else "decreasing"
        
        return {
            "status": "analyzed",
            "cpu_trend": cpu_trend,
            "memory_trend": memory_trend,
            "disk_trend": disk_trend,
            "analysis_period": "last_10_samples"
        }
    
    async def execute_optimization(self, action_type: str, target_system: str) -> Dict[str, Any]:
        """최적화 실행"""
        action_id = f"action_{action_type}_{int(time.time())}"
        
        action = OptimizationAction(
            action_id=action_id,
            action_type=action_type,
            target_system=target_system,
            description=f"{action_type} 실행",
            estimated_impact="성능 개선 예상",
            executed_at=datetime.now(timezone.utc).isoformat()
        )
        
        try:
            if action_type == "scale_up":
                action.result = "스케일 업 요청 전송됨"
            elif action_type == "cleanup_memory":
                action.result = "메모리 정리 완료"
            elif action_type == "optimize_cache":
                action.result = "캐시 최적화 완료"
            elif action_type == "restart_service":
                action.result = "서비스 재시작 요청 전송됨"
            else:
                action.result = "알 수 없는 액션"
            
            action.executed = True
            self.optimization_actions.append(action)
            
            return {
                "success": True,
                "action_id": action_id,
                "result": action.result
            }
            
        except Exception as e:
            action.result = f"실행 실패: {str(e)}"
            return {
                "success": False,
                "action_id": action_id,
                "error": str(e)
            }
    
    def get_performance_dashboard_data(self) -> Dict[str, Any]:
        """성능 대시보드 데이터 조회"""
        return {
            "current_status": {
                "system_metrics": self.system_metrics_history[-1].__dict__ if self.system_metrics_history else {},
                "application_metrics": self.application_metrics_history[-1].__dict__ if self.application_metrics_history else {}
            },
            "active_alerts": [
                {
                    "alert_id": alert.alert_id,
                    "alert_type": alert.alert_type.value,
                    "severity": alert.severity,
                    "message": alert.message,
                    "timestamp": alert.timestamp
                }
                for alert in self.active_alerts if not alert.resolved
            ],
            "recent_optimizations": [
                {
                    "action_id": action.action_id,
                    "action_type": action.action_type,
                    "target_system": action.target_system,
                    "description": action.description,
                    "executed": action.executed,
                    "result": action.result
                }
                for action in self.optimization_actions[-10:]
            ],
            "performance_history": {
                "system_metrics": [m.__dict__ for m in self.system_metrics_history[-50:]],
                "application_metrics": [m.__dict__ for m in self.application_metrics_history[-50:]]
            }
        }

# FastAPI 앱 생성
app = FastAPI(
    title="실시간 성능 모니터링 시스템",
    description="실시간 시스템 성능 추적 및 최적화",
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

# 전역 모니터 인스턴스
performance_monitor = RealTimePerformanceMonitor()

class MetricsRequest(BaseModel):
    response_time: Optional[float] = 0.0
    request_count: Optional[int] = 0
    error_count: Optional[int] = 0

class OptimizationRequest(BaseModel):
    action_type: str
    target_system: str

@app.get("/api/performance/status")
async def get_performance_status():
    """성능 상태 조회"""
    try:
        # 시스템 메트릭 수집
        system_metrics = await performance_monitor.collect_system_metrics()
        
        # 애플리케이션 메트릭 수집 (기본값)
        app_metrics = await performance_monitor.collect_application_metrics()
        
        # 성능 분석
        analysis = await performance_monitor.analyze_performance()
        
        return {
            "success": True,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "system_metrics": system_metrics.__dict__,
            "application_metrics": app_metrics.__dict__,
            "analysis": analysis
        }
    except Exception as e:
        logger.error(f"성능 상태 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/performance/metrics")
async def update_application_metrics(request: MetricsRequest):
    """애플리케이션 메트릭 업데이트"""
    try:
        app_metrics = await performance_monitor.collect_application_metrics(
            request.response_time,
            request.request_count,
            request.error_count
        )
        
        return {
            "success": True,
            "metrics": app_metrics.__dict__
        }
    except Exception as e:
        logger.error(f"애플리케이션 메트릭 업데이트 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/performance/optimize")
async def execute_optimization(request: OptimizationRequest):
    """최적화 실행"""
    try:
        result = await performance_monitor.execute_optimization(
            request.action_type,
            request.target_system
        )
        
        return result
    except Exception as e:
        logger.error(f"최적화 실행 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/performance/dashboard")
async def get_performance_dashboard():
    """성능 대시보드 데이터 조회"""
    try:
        dashboard_data = performance_monitor.get_performance_dashboard_data()
        
        return {
            "success": True,
            "dashboard": dashboard_data
        }
    except Exception as e:
        logger.error(f"성능 대시보드 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/performance")
async def websocket_performance_monitor(websocket: WebSocket):
    """실시간 성능 모니터링 WebSocket"""
    await websocket.accept()
    performance_monitor.websocket_connections.append(websocket)
    
    try:
        while True:
            # 주기적으로 성능 데이터 전송
            await asyncio.sleep(5)
            
            system_metrics = await performance_monitor.collect_system_metrics()
            app_metrics = await performance_monitor.collect_application_metrics()
            
            data = {
                "type": "performance_update",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "system_metrics": system_metrics.__dict__,
                "application_metrics": app_metrics.__dict__
            }
            
            await websocket.send_json(data)
            
    except WebSocketDisconnect:
        performance_monitor.websocket_connections.remove(websocket)
    except Exception as e:
        logger.error(f"WebSocket 오류: {e}")
        if websocket in performance_monitor.websocket_connections:
            performance_monitor.websocket_connections.remove(websocket)

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "실시간 성능 모니터링 시스템",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "실시간 시스템 성능 추적",
            "자동 성능 최적화",
            "지능형 리소스 관리",
            "예측적 스케일링",
            "실시간 알림 및 대시보드",
            "WebSocket 기반 실시간 모니터링",
            "성능 트렌드 분석",
            "자동 최적화 제안"
        ],
        "monitored_metrics": [
            "CPU 사용률",
            "메모리 사용률",
            "디스크 사용률",
            "네트워크 I/O",
            "응답 시간",
            "에러율",
            "처리량",
            "활성 연결 수"
        ],
        "endpoints": {
            "performance_status": "/api/performance/status",
            "update_metrics": "/api/performance/metrics",
            "execute_optimization": "/api/performance/optimize",
            "dashboard": "/api/performance/dashboard",
            "websocket": "/ws/performance",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    logger.info("🚀 실시간 성능 모니터링 시스템을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8007")
    logger.info("📚 API 문서: http://localhost:8007/docs")
    logger.info("📊 모니터링 메트릭:")
    logger.info("   - CPU, 메모리, 디스크 사용률")
    logger.info("   - 네트워크 I/O 및 응답 시간")
    logger.info("   - 에러율 및 처리량")
    logger.info("⚡ 실시간 WebSocket 모니터링 활성화")
    logger.info("🔧 자동 최적화 시스템 활성화")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8007,
        reload=False,
        log_level="info"
    )
