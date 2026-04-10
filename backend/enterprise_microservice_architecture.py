"""
엔터프라이즈급 마이크로서비스 아키텍처 시스템
- API Gateway with Authentication & Rate Limiting
- Service Discovery & Registry
- Load Balancer with Health Checks
- Circuit Breaker Pattern
- Distributed Tracing
- Event-Driven Architecture
"""

import asyncio
import json
import time
import uuid
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field
from enum import Enum
import aiohttp
import aioredis
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import hashlib
import logging
from concurrent.futures import ThreadPoolExecutor
import psutil

# 서비스 상태 열거형
class ServiceStatus(Enum):
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    DEGRADED = "degraded"
    MAINTENANCE = "maintenance"

# 요청 상태 열거형
class RequestStatus(Enum):
    SUCCESS = "success"
    FAILED = "failed"
    TIMEOUT = "timeout"
    CIRCUIT_OPEN = "circuit_open"

@dataclass
class ServiceMetrics:
    """서비스 메트릭스"""
    request_count: int = 0
    error_count: int = 0
    total_response_time: float = 0.0
    last_request_time: datetime = field(default_factory=datetime.now)
    cpu_usage: float = 0.0
    memory_usage: float = 0.0
    
    @property
    def error_rate(self) -> float:
        return self.error_count / max(self.request_count, 1)
    
    @property
    def average_response_time(self) -> float:
        return self.total_response_time / max(self.request_count, 1)

@dataclass
class ServiceInstance:
    """서비스 인스턴스"""
    service_id: str
    service_name: str
    host: str
    port: int
    version: str
    status: ServiceStatus = ServiceStatus.HEALTHY
    metadata: Dict[str, Any] = field(default_factory=dict)
    metrics: ServiceMetrics = field(default_factory=ServiceMetrics)
    last_heartbeat: datetime = field(default_factory=datetime.now)
    
    @property
    def url(self) -> str:
        return f"http://{self.host}:{self.port}"
    
    @property
    def is_healthy(self) -> bool:
        heartbeat_threshold = datetime.now() - timedelta(seconds=30)
        return (self.status == ServiceStatus.HEALTHY and 
                self.last_heartbeat > heartbeat_threshold)

class CircuitBreaker:
    """서킷 브레이커 패턴 구현"""
    
    def __init__(self, failure_threshold: int = 5, reset_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def can_execute(self) -> bool:
        if self.state == "CLOSED":
            return True
        elif self.state == "OPEN":
            if (datetime.now() - self.last_failure_time).seconds >= self.reset_timeout:
                self.state = "HALF_OPEN"
                return True
            return False
        else:  # HALF_OPEN
            return True
    
    def record_success(self):
        self.failure_count = 0
        self.state = "CLOSED"
    
    def record_failure(self):
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

class ServiceRegistry:
    """서비스 등록소"""
    
    def __init__(self):
        self.services: Dict[str, List[ServiceInstance]] = {}
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
        self.redis_client = None
    
    async def initialize_redis(self):
        """Redis 연결 초기화"""
        try:
            self.redis_client = await aioredis.create_redis_pool('redis://localhost:6379')
        except Exception as e:
            logging.warning(f"Redis 연결 실패: {e}")
    
    async def register_service(self, service: ServiceInstance) -> bool:
        """서비스 등록"""
        try:
            if service.service_name not in self.services:
                self.services[service.service_name] = []
            
            # 기존 인스턴스 제거 (같은 ID)
            self.services[service.service_name] = [
                s for s in self.services[service.service_name] 
                if s.service_id != service.service_id
            ]
            
            # 새 인스턴스 추가
            self.services[service.service_name].append(service)
            
            # Redis에 저장
            if self.redis_client:
                await self.redis_client.setex(
                    f"service:{service.service_name}:{service.service_id}",
                    300,  # 5분 TTL
                    json.dumps({
                        "service_id": service.service_id,
                        "host": service.host,
                        "port": service.port,
                        "version": service.version,
                        "status": service.status.value,
                        "metadata": service.metadata
                    })
                )
            
            logging.info(f"서비스 등록됨: {service.service_name} ({service.service_id})")
            return True
            
        except Exception as e:
            logging.error(f"서비스 등록 오류: {e}")
            return False
    
    async def deregister_service(self, service_name: str, service_id: str) -> bool:
        """서비스 등록 해제"""
        try:
            if service_name in self.services:
                self.services[service_name] = [
                    s for s in self.services[service_name] 
                    if s.service_id != service_id
                ]
            
            # Redis에서 제거
            if self.redis_client:
                await self.redis_client.delete(f"service:{service_name}:{service_id}")
            
            logging.info(f"서비스 등록 해제됨: {service_name} ({service_id})")
            return True
            
        except Exception as e:
            logging.error(f"서비스 등록 해제 오류: {e}")
            return False
    
    async def discover_service(self, service_name: str) -> Optional[ServiceInstance]:
        """서비스 발견 (로드 밸런싱)"""
        try:
            if service_name not in self.services:
                return None
            
            healthy_services = [
                s for s in self.services[service_name] 
                if s.is_healthy
            ]
            
            if not healthy_services:
                return None
            
            # 라운드 로빈 로드 밸런싱
            service = min(healthy_services, key=lambda s: s.metrics.request_count)
            return service
            
        except Exception as e:
            logging.error(f"서비스 발견 오류: {e}")
            return None
    
    async def get_all_services(self) -> Dict[str, List[ServiceInstance]]:
        """모든 서비스 목록 조회"""
        return self.services
    
    async def update_service_metrics(self, service_name: str, service_id: str, 
                                   response_time: float, success: bool):
        """서비스 메트릭스 업데이트"""
        try:
            if service_name in self.services:
                for service in self.services[service_name]:
                    if service.service_id == service_id:
                        service.metrics.request_count += 1
                        service.metrics.total_response_time += response_time
                        service.metrics.last_request_time = datetime.now()
                        
                        if not success:
                            service.metrics.error_count += 1
                        
                        # 시스템 메트릭스 업데이트
                        service.metrics.cpu_usage = psutil.cpu_percent()
                        service.metrics.memory_usage = psutil.virtual_memory().percent
                        
                        break
                        
        except Exception as e:
            logging.error(f"메트릭스 업데이트 오류: {e}")

class APIGateway:
    """API 게이트웨이"""
    
    def __init__(self, service_registry: ServiceRegistry):
        self.service_registry = service_registry
        self.rate_limiter = {}
        self.auth_secret = "your-secret-key"
        self.request_trace = {}
    
    async def authenticate_request(self, token: str) -> Optional[Dict[str, Any]]:
        """요청 인증"""
        try:
            payload = jwt.decode(token, self.auth_secret, algorithms=["HS256"])
            return payload
        except jwt.InvalidTokenError:
            return None
    
    async def check_rate_limit(self, client_id: str, limit: int = 100, 
                             window: int = 3600) -> bool:
        """속도 제한 확인"""
        try:
            current_time = int(time.time())
            window_start = current_time - (current_time % window)
            
            if client_id not in self.rate_limiter:
                self.rate_limiter[client_id] = {}
            
            if window_start not in self.rate_limiter[client_id]:
                self.rate_limiter[client_id][window_start] = 0
            
            # 이전 윈도우 정리
            old_windows = [
                w for w in self.rate_limiter[client_id].keys() 
                if w < window_start
            ]
            for w in old_windows:
                del self.rate_limiter[client_id][w]
            
            # 현재 요청 수 확인
            current_requests = self.rate_limiter[client_id][window_start]
            if current_requests >= limit:
                return False
            
            self.rate_limiter[client_id][window_start] += 1
            return True
            
        except Exception as e:
            logging.error(f"속도 제한 확인 오류: {e}")
            return True  # 오류 시 허용
    
    async def route_request(self, service_name: str, path: str, method: str,
                          headers: Dict[str, str], body: Any = None) -> Dict[str, Any]:
        """요청 라우팅"""
        request_id = str(uuid.uuid4())
        start_time = time.time()
        
        try:
            # 서비스 발견
            service = await self.service_registry.discover_service(service_name)
            if not service:
                raise HTTPException(status_code=503, detail="서비스를 찾을 수 없습니다")
            
            # 서킷 브레이커 확인
            circuit_breaker = self.service_registry.circuit_breakers.get(
                service.service_id, CircuitBreaker()
            )
            self.service_registry.circuit_breakers[service.service_id] = circuit_breaker
            
            if not circuit_breaker.can_execute():
                raise HTTPException(status_code=503, detail="서킷 브레이커 열림")
            
            # 요청 추적 시작
            trace_data = {
                "request_id": request_id,
                "service_name": service_name,
                "service_id": service.service_id,
                "path": path,
                "method": method,
                "start_time": start_time,
                "steps": []
            }
            self.request_trace[request_id] = trace_data
            
            # HTTP 요청 수행
            url = f"{service.url}{path}"
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method=method,
                    url=url,
                    headers=headers,
                    json=body,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    response_body = await response.text()
                    
                    # 응답 처리
                    response_time = time.time() - start_time
                    success = 200 <= response.status < 300
                    
                    # 메트릭스 업데이트
                    await self.service_registry.update_service_metrics(
                        service_name, service.service_id, response_time, success
                    )
                    
                    # 서킷 브레이커 상태 업데이트
                    if success:
                        circuit_breaker.record_success()
                    else:
                        circuit_breaker.record_failure()
                    
                    # 추적 완료
                    trace_data["end_time"] = time.time()
                    trace_data["response_time"] = response_time
                    trace_data["status_code"] = response.status
                    trace_data["success"] = success
                    
                    return {
                        "status_code": response.status,
                        "body": response_body,
                        "headers": dict(response.headers),
                        "request_id": request_id,
                        "response_time": response_time
                    }
                    
        except Exception as e:
            # 오류 처리
            response_time = time.time() - start_time
            
            # 메트릭스 업데이트
            if 'service' in locals():
                await self.service_registry.update_service_metrics(
                    service_name, service.service_id, response_time, False
                )
                
                # 서킷 브레이커 실패 기록
                circuit_breaker = self.service_registry.circuit_breakers.get(
                    service.service_id, CircuitBreaker()
                )
                circuit_breaker.record_failure()
            
            # 추적 오류 기록
            if request_id in self.request_trace:
                self.request_trace[request_id]["error"] = str(e)
                self.request_trace[request_id]["end_time"] = time.time()
                self.request_trace[request_id]["response_time"] = response_time
            
            raise e

class EventBus:
    """이벤트 버스"""
    
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = {}
        self.event_store = []
    
    async def subscribe(self, event_type: str, handler: Callable):
        """이벤트 구독"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(handler)
    
    async def publish(self, event_type: str, data: Dict[str, Any]):
        """이벤트 발행"""
        event = {
            "id": str(uuid.uuid4()),
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        # 이벤트 저장
        self.event_store.append(event)
        
        # 구독자들에게 이벤트 전송
        if event_type in self.subscribers:
            for handler in self.subscribers[event_type]:
                try:
                    await handler(event)
                except Exception as e:
                    logging.error(f"이벤트 핸들러 오류: {e}")

class DistributedTracing:
    """분산 추적"""
    
    def __init__(self):
        self.traces: Dict[str, Dict[str, Any]] = {}
    
    def start_span(self, trace_id: str, span_id: str, operation_name: str,
                   parent_span_id: Optional[str] = None) -> Dict[str, Any]:
        """스팬 시작"""
        span = {
            "trace_id": trace_id,
            "span_id": span_id,
            "parent_span_id": parent_span_id,
            "operation_name": operation_name,
            "start_time": time.time(),
            "tags": {},
            "logs": []
        }
        
        if trace_id not in self.traces:
            self.traces[trace_id] = {}
        
        self.traces[trace_id][span_id] = span
        return span
    
    def finish_span(self, trace_id: str, span_id: str, 
                   tags: Optional[Dict[str, Any]] = None):
        """스팬 종료"""
        if trace_id in self.traces and span_id in self.traces[trace_id]:
            span = self.traces[trace_id][span_id]
            span["end_time"] = time.time()
            span["duration"] = span["end_time"] - span["start_time"]
            
            if tags:
                span["tags"].update(tags)
    
    def add_log(self, trace_id: str, span_id: str, message: str, level: str = "info"):
        """로그 추가"""
        if trace_id in self.traces and span_id in self.traces[trace_id]:
            self.traces[trace_id][span_id]["logs"].append({
                "timestamp": time.time(),
                "message": message,
                "level": level
            })

class EnterpriseServiceManager:
    """엔터프라이즈 서비스 매니저"""
    
    def __init__(self):
        self.service_registry = ServiceRegistry()
        self.api_gateway = APIGateway(self.service_registry)
        self.event_bus = EventBus()
        self.distributed_tracing = DistributedTracing()
        self.health_check_interval = 30
        self.cleanup_interval = 300
        
    async def initialize(self):
        """시스템 초기화"""
        await self.service_registry.initialize_redis()
        
        # 헬스 체크 태스크 시작
        asyncio.create_task(self.health_check_loop())
        
        # 정리 태스크 시작
        asyncio.create_task(self.cleanup_loop())
        
        logging.info("엔터프라이즈 서비스 매니저 초기화 완료")
    
    async def health_check_loop(self):
        """주기적 헬스 체크"""
        while True:
            try:
                await asyncio.sleep(self.health_check_interval)
                
                all_services = await self.service_registry.get_all_services()
                for service_name, instances in all_services.items():
                    for instance in instances:
                        try:
                            # 헬스 체크 요청
                            async with aiohttp.ClientSession() as session:
                                async with session.get(
                                    f"{instance.url}/health",
                                    timeout=aiohttp.ClientTimeout(total=5)
                                ) as response:
                                    if response.status == 200:
                                        instance.status = ServiceStatus.HEALTHY
                                        instance.last_heartbeat = datetime.now()
                                    else:
                                        instance.status = ServiceStatus.UNHEALTHY
                                        
                        except Exception as e:
                            instance.status = ServiceStatus.UNHEALTHY
                            logging.warning(f"헬스 체크 실패: {instance.service_id} - {e}")
                
            except Exception as e:
                logging.error(f"헬스 체크 루프 오류: {e}")
    
    async def cleanup_loop(self):
        """주기적 정리 작업"""
        while True:
            try:
                await asyncio.sleep(self.cleanup_interval)
                
                # 오래된 추적 데이터 정리
                current_time = time.time()
                old_traces = [
                    trace_id for trace_id, trace_data in self.distributed_tracing.traces.items()
                    if any(
                        span.get("start_time", 0) < current_time - 3600
                        for span in trace_data.values()
                    )
                ]
                
                for trace_id in old_traces:
                    del self.distributed_tracing.traces[trace_id]
                
                # 오래된 API 게이트웨이 추적 정리
                old_requests = [
                    req_id for req_id, req_data in self.api_gateway.request_trace.items()
                    if req_data.get("start_time", 0) < current_time - 3600
                ]
                
                for req_id in old_requests:
                    del self.api_gateway.request_trace[req_id]
                
                logging.info(f"정리 완료: 추적 {len(old_traces)}개, 요청 {len(old_requests)}개 제거")
                
            except Exception as e:
                logging.error(f"정리 루프 오류: {e}")
    
    async def register_service(self, service_name: str, host: str, port: int,
                             version: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """서비스 등록"""
        service_id = f"{service_name}-{uuid.uuid4().hex[:8]}"
        service = ServiceInstance(
            service_id=service_id,
            service_name=service_name,
            host=host,
            port=port,
            version=version,
            metadata=metadata or {}
        )
        
        success = await self.service_registry.register_service(service)
        if success:
            # 서비스 등록 이벤트 발행
            await self.event_bus.publish("service.registered", {
                "service_id": service_id,
                "service_name": service_name,
                "host": host,
                "port": port,
                "version": version
            })
            
            return service_id
        else:
            raise Exception("서비스 등록 실패")
    
    async def get_service_metrics(self) -> Dict[str, Any]:
        """서비스 메트릭스 조회"""
        all_services = await self.service_registry.get_all_services()
        metrics = {}
        
        for service_name, instances in all_services.items():
            service_metrics = {
                "total_instances": len(instances),
                "healthy_instances": len([i for i in instances if i.is_healthy]),
                "total_requests": sum(i.metrics.request_count for i in instances),
                "total_errors": sum(i.metrics.error_count for i in instances),
                "average_response_time": sum(i.metrics.average_response_time for i in instances) / max(len(instances), 1),
                "instances": []
            }
            
            for instance in instances:
                service_metrics["instances"].append({
                    "service_id": instance.service_id,
                    "host": instance.host,
                    "port": instance.port,
                    "status": instance.status.value,
                    "request_count": instance.metrics.request_count,
                    "error_count": instance.metrics.error_count,
                    "error_rate": instance.metrics.error_rate,
                    "average_response_time": instance.metrics.average_response_time,
                    "cpu_usage": instance.metrics.cpu_usage,
                    "memory_usage": instance.metrics.memory_usage,
                    "last_heartbeat": instance.last_heartbeat.isoformat()
                })
            
            metrics[service_name] = service_metrics
        
        return metrics

# FastAPI 애플리케이션
app = FastAPI(title="Enterprise Microservice Architecture", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 글로벌 서비스 매니저
service_manager = None

@app.on_event("startup")
async def startup_event():
    global service_manager
    service_manager = EnterpriseServiceManager()
    await service_manager.initialize()

# API 엔드포인트들
@app.post("/services/register")
async def register_service(request: Dict[str, Any]):
    """서비스 등록"""
    service_id = await service_manager.register_service(
        service_name=request["service_name"],
        host=request["host"],
        port=request["port"],
        version=request["version"],
        metadata=request.get("metadata", {})
    )
    return {"service_id": service_id}

@app.delete("/services/{service_name}/{service_id}")
async def deregister_service(service_name: str, service_id: str):
    """서비스 등록 해제"""
    success = await service_manager.service_registry.deregister_service(
        service_name, service_id
    )
    return {"success": success}

@app.get("/services")
async def get_services():
    """서비스 목록 조회"""
    services = await service_manager.service_registry.get_all_services()
    return services

@app.get("/services/metrics")
async def get_service_metrics():
    """서비스 메트릭스 조회"""
    metrics = await service_manager.get_service_metrics()
    return metrics

@app.post("/gateway/{service_name}")
async def gateway_route(service_name: str, request: Request):
    """API 게이트웨이 라우팅"""
    # 요청 정보 추출
    path = request.url.path.replace(f"/gateway/{service_name}", "")
    method = request.method
    headers = dict(request.headers)
    
    try:
        body = await request.json()
    except:
        body = None
    
    # 인증 확인 (선택사항)
    auth_header = headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        user_data = await service_manager.api_gateway.authenticate_request(token)
        if not user_data:
            raise HTTPException(status_code=401, detail="인증 실패")
        
        # 속도 제한 확인
        client_id = user_data.get("user_id", "anonymous")
        if not await service_manager.api_gateway.check_rate_limit(client_id):
            raise HTTPException(status_code=429, detail="속도 제한 초과")
    
    # 요청 라우팅
    response = await service_manager.api_gateway.route_request(
        service_name, path, method, headers, body
    )
    
    return response

@app.get("/tracing/{trace_id}")
async def get_trace(trace_id: str):
    """분산 추적 정보 조회"""
    if trace_id in service_manager.distributed_tracing.traces:
        return service_manager.distributed_tracing.traces[trace_id]
    else:
        raise HTTPException(status_code=404, detail="추적 정보를 찾을 수 없습니다")

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import os
    import uvicorn
    
    # 로깅 설정
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    _p = int(os.environ.get("ENTERPRISE_MICROSERVICE_ARCHITECTURE_PORT", os.environ.get("PORT", "8000")))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=_p,
        log_level="info"
    ) 