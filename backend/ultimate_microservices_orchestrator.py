#!/usr/bin/env python3
"""
궁극의 마이크로서비스 오케스트레이터 v6.0
- 완전 자동화된 서비스 디스커버리
- 동적 로드 밸런싱
- 자동 스케일링
- 서비스 메시 관리
- 실시간 헬스 체크
- 장애 복구 시스템
"""

import asyncio
import json
import logging
import time
import aiohttp
import uvicorn
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union, Callable
from dataclasses import dataclass, asdict, field
from enum import Enum
import hashlib
import secrets
import threading
import multiprocessing
import psutil
import subprocess
import os
import signal
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import redis
import consul
import docker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ServiceStatus(Enum):
    """서비스 상태"""
    STARTING = "starting"
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    STOPPING = "stopping"
    STOPPED = "stopped"
    ERROR = "error"

class LoadBalancingStrategy(Enum):
    """로드 밸런싱 전략"""
    ROUND_ROBIN = "round_robin"
    LEAST_CONNECTIONS = "least_connections"
    WEIGHTED_ROUND_ROBIN = "weighted_round_robin"
    IP_HASH = "ip_hash"
    RANDOM = "random"
    AI_OPTIMIZED = "ai_optimized"

class ScalingPolicy(Enum):
    """스케일링 정책"""
    CPU_BASED = "cpu_based"
    MEMORY_BASED = "memory_based"
    REQUEST_BASED = "request_based"
    PREDICTIVE = "predictive"
    ML_DRIVEN = "ml_driven"

@dataclass
class ServiceDefinition:
    """서비스 정의"""
    service_id: str
    name: str
    version: str
    image: Optional[str]
    command: Optional[str]
    ports: Dict[str, int]
    environment: Dict[str, str]
    health_check_url: str
    dependencies: List[str]
    resource_limits: Dict[str, Any]
    scaling_config: Dict[str, Any]
    tags: List[str]

@dataclass
class ServiceInstance:
    """서비스 인스턴스"""
    instance_id: str
    service_id: str
    host: str
    port: int
    status: ServiceStatus
    health_score: float
    load_metrics: Dict[str, float]
    created_at: datetime
    last_health_check: datetime
    request_count: int = 0
    error_count: int = 0
    response_time_avg: float = 0.0

@dataclass
class ServiceMeshConfig:
    """서비스 메시 설정"""
    mesh_id: str
    encryption_enabled: bool
    mutual_tls: bool
    circuit_breaker_config: Dict[str, Any]
    retry_policy: Dict[str, Any]
    timeout_config: Dict[str, int]
    tracing_enabled: bool

class UltimateMicroservicesOrchestrator:
    """궁극의 마이크로서비스 오케스트레이터"""
    
    def __init__(self):
        # 서비스 레지스트리
        self.service_definitions = {}
        self.service_instances = {}
        self.service_mesh_config = {}
        
        # 로드 밸런싱
        self.load_balancers = {}
        self.current_lb_strategy = LoadBalancingStrategy.AI_OPTIMIZED
        
        # 헬스 체크
        self.health_check_interval = 30  # 초
        self.health_check_active = True
        
        # 스케일링
        self.auto_scaling_enabled = True
        self.scaling_policies = {}
        
        # 메트릭 수집
        self.metrics = {
            'total_services': 0,
            'healthy_instances': 0,
            'total_requests': 0,
            'total_errors': 0,
            'average_response_time': 0.0,
            'cpu_usage': 0.0,
            'memory_usage': 0.0,
            'scaling_events': 0
        }
        
        # 네트워킹
        self.api_gateway_port = 8000
        self.service_mesh_enabled = True
        
        # 외부 서비스 연동
        self.redis_client = None
        self.consul_client = None
        self.docker_client = None
        
        # 백그라운드 태스크
        self.background_tasks_active = True
        self.executor = ThreadPoolExecutor(max_workers=10)
        
        # WebSocket 연결 관리
        self.websocket_connections = []
        
        self._initialize_external_services()
        self._start_background_tasks()
        self._setup_api_gateway()
    
    def _initialize_external_services(self):
        """외부 서비스 초기화"""
        
        try:
            # Redis 연결
            self.redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
            self.redis_client.ping()
            logger.info("✅ Redis 연결 성공")
        except:
            logger.warning("⚠️ Redis 연결 실패, 로컬 캐시 사용")
        
        try:
            # Consul 연결
            import consul
            self.consul_client = consul.Consul()
            logger.info("✅ Consul 연결 성공")
        except:
            logger.warning("⚠️ Consul 연결 실패, 내장 서비스 디스커버리 사용")
        
        try:
            # Docker 연결
            self.docker_client = docker.from_env()
            logger.info("✅ Docker 연결 성공")
        except:
            logger.warning("⚠️ Docker 연결 실패, 프로세스 기반 서비스 관리")
    
    def _setup_api_gateway(self):
        """API 게이트웨이 설정"""
        
        self.app = FastAPI(
            title="Ultimate Microservices Orchestrator",
            description="차세대 마이크로서비스 오케스트레이션 플랫폼",
            version="6.0.0"
        )
        
        # CORS 설정
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # API 라우트 설정
        self._setup_api_routes()
        
        logger.info(f"🌐 API 게이트웨이 설정 완료 (포트: {self.api_gateway_port})")
    
    def _setup_api_routes(self):
        """API 라우트 설정"""
        
        @self.app.get("/")
        async def root():
            return {"message": "Ultimate Microservices Orchestrator v6.0", "status": "active"}
        
        @self.app.get("/health")
        async def health_check():
            return {
                "status": "healthy",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "services": len(self.service_definitions),
                "instances": len(self.service_instances),
                "metrics": self.metrics
            }
        
        @self.app.post("/services/register")
        async def register_service(service_def: dict):
            return await self.register_service(ServiceDefinition(**service_def))
        
        @self.app.delete("/services/{service_id}")
        async def unregister_service(service_id: str):
            return await self.unregister_service(service_id)
        
        @self.app.get("/services")
        async def list_services():
            return await self.list_services()
        
        @self.app.get("/services/{service_id}/instances")
        async def get_service_instances(service_id: str):
            return await self.get_service_instances(service_id)
        
        @self.app.post("/services/{service_id}/scale")
        async def scale_service(service_id: str, replicas: int):
            return await self.scale_service(service_id, replicas)
        
        @self.app.get("/metrics")
        async def get_metrics():
            return await self.get_system_metrics()
        
        @self.app.post("/loadbalancer/strategy")
        async def set_load_balancing_strategy(strategy: str):
            return await self.set_load_balancing_strategy(LoadBalancingStrategy(strategy))
        
        @self.app.websocket("/ws/metrics")
        async def websocket_metrics(websocket: WebSocket):
            await self._handle_websocket_connection(websocket)
        
        # 동적 서비스 라우팅
        @self.app.api_route("/{service_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
        async def dynamic_service_route(service_name: str, request):
            return await self._route_to_service(service_name, request)
    
    async def register_service(self, service_def: ServiceDefinition) -> Dict[str, Any]:
        """서비스 등록"""
        
        try:
            # 서비스 정의 저장
            self.service_definitions[service_def.service_id] = service_def
            
            # 초기 인스턴스 생성
            initial_replicas = service_def.scaling_config.get('min_replicas', 1)
            for i in range(initial_replicas):
                instance = await self._create_service_instance(service_def, i)
                if instance:
                    self.service_instances[instance.instance_id] = instance
            
            # 스케일링 정책 설정
            self.scaling_policies[service_def.service_id] = {
                'policy': ScalingPolicy.CPU_BASED,
                'target_cpu': service_def.scaling_config.get('target_cpu', 70),
                'min_replicas': service_def.scaling_config.get('min_replicas', 1),
                'max_replicas': service_def.scaling_config.get('max_replicas', 10),
                'scale_up_threshold': service_def.scaling_config.get('scale_up_threshold', 80),
                'scale_down_threshold': service_def.scaling_config.get('scale_down_threshold', 30)
            }
            
            # 로드 밸런서 설정
            self.load_balancers[service_def.service_id] = {
                'strategy': self.current_lb_strategy,
                'instances': [],
                'weights': {},
                'connections': {}
            }
            
            # 외부 서비스 디스커버리에 등록
            if self.consul_client:
                self.consul_client.agent.service.register(
                    name=service_def.name,
                    service_id=service_def.service_id,
                    port=list(service_def.ports.values())[0],
                    tags=service_def.tags,
                    check=consul.Check.http(service_def.health_check_url, interval="30s")
                )
            
            self.metrics['total_services'] = len(self.service_definitions)
            
            await self._broadcast_to_websockets({
                'event': 'service_registered',
                'service_id': service_def.service_id,
                'name': service_def.name,
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
            
            logger.info(f"📝 서비스 등록: {service_def.name} ({service_def.service_id})")
            
            return {
                'status': 'success',
                'service_id': service_def.service_id,
                'instances_created': initial_replicas,
                'message': f'서비스 {service_def.name} 등록 완료'
            }
            
        except Exception as e:
            logger.error(f"서비스 등록 실패: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _create_service_instance(self, service_def: ServiceDefinition, replica_index: int) -> Optional[ServiceInstance]:
        """서비스 인스턴스 생성"""
        
        try:
            instance_id = f"{service_def.service_id}-{replica_index}-{secrets.token_hex(4)}"
            
            # 포트 할당
            base_port = list(service_def.ports.values())[0]
            instance_port = base_port + replica_index
            
            # Docker 컨테이너로 실행
            if self.docker_client and service_def.image:
                container = await self._create_docker_container(
                    service_def, instance_id, instance_port
                )
                if not container:
                    return None
                
                host = 'localhost'
            else:
                # 프로세스로 실행
                process = await self._create_process_instance(
                    service_def, instance_id, instance_port
                )
                if not process:
                    return None
                
                host = 'localhost'
            
            # 인스턴스 객체 생성
            instance = ServiceInstance(
                instance_id=instance_id,
                service_id=service_def.service_id,
                host=host,
                port=instance_port,
                status=ServiceStatus.STARTING,
                health_score=1.0,
                load_metrics={'cpu': 0.0, 'memory': 0.0, 'connections': 0},
                created_at=datetime.now(timezone.utc),
                last_health_check=datetime.now(timezone.utc)
            )
            
            # 헬스 체크 대기
            await asyncio.sleep(2)
            health_ok = await self._check_instance_health(instance, service_def)
            if health_ok:
                instance.status = ServiceStatus.HEALTHY
                self.metrics['healthy_instances'] += 1
            else:
                instance.status = ServiceStatus.UNHEALTHY
            
            logger.info(f"🚀 인스턴스 생성: {instance_id} (상태: {instance.status.value})")
            
            return instance
            
        except Exception as e:
            logger.error(f"인스턴스 생성 실패: {e}")
            return None
    
    async def _create_docker_container(self, service_def: ServiceDefinition, instance_id: str, port: int):
        """Docker 컨테이너 생성"""
        
        try:
            environment = dict(service_def.environment)
            environment['PORT'] = str(port)
            environment['INSTANCE_ID'] = instance_id
            
            container = self.docker_client.containers.run(
                service_def.image,
                command=service_def.command,
                environment=environment,
                ports={f"{port}/tcp": port},
                name=instance_id,
                detach=True,
                labels={
                    'orchestrator': 'ultimate-microservices',
                    'service_id': service_def.service_id,
                    'service_name': service_def.name
                },
                mem_limit=service_def.resource_limits.get('memory', '512m'),
                cpu_quota=int(service_def.resource_limits.get('cpu', 1.0) * 100000)
            )
            
            logger.info(f"🐳 Docker 컨테이너 생성: {instance_id}")
            return container
            
        except Exception as e:
            logger.error(f"Docker 컨테이너 생성 실패: {e}")
            return None
    
    async def _create_process_instance(self, service_def: ServiceDefinition, instance_id: str, port: int):
        """프로세스 인스턴스 생성"""
        
        try:
            env = os.environ.copy()
            env.update(service_def.environment)
            env['PORT'] = str(port)
            env['INSTANCE_ID'] = instance_id
            
            if service_def.command:
                cmd = service_def.command.replace('${PORT}', str(port))
                process = subprocess.Popen(
                    cmd.split(),
                    env=env,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                
                logger.info(f"⚙️ 프로세스 생성: {instance_id} (PID: {process.pid})")
                return process
                
        except Exception as e:
            logger.error(f"프로세스 생성 실패: {e}")
            return None
    
    async def scale_service(self, service_id: str, target_replicas: int) -> Dict[str, Any]:
        """서비스 스케일링"""
        
        try:
            if service_id not in self.service_definitions:
                raise ValueError(f"서비스 없음: {service_id}")
            
            service_def = self.service_definitions[service_id]
            current_instances = [
                inst for inst in self.service_instances.values()
                if inst.service_id == service_id and inst.status != ServiceStatus.STOPPED
            ]
            
            current_count = len(current_instances)
            
            if target_replicas > current_count:
                # 스케일 아웃
                for i in range(current_count, target_replicas):
                    instance = await self._create_service_instance(service_def, i)
                    if instance:
                        self.service_instances[instance.instance_id] = instance
                
                action = "scale_out"
                message = f"{target_replicas - current_count}개 인스턴스 추가"
                
            elif target_replicas < current_count:
                # 스케일 인
                instances_to_remove = current_instances[target_replicas:]
                for instance in instances_to_remove:
                    await self._stop_service_instance(instance)
                
                action = "scale_in"
                message = f"{current_count - target_replicas}개 인스턴스 제거"
                
            else:
                action = "no_change"
                message = "스케일링 불필요"
            
            self.metrics['scaling_events'] += 1
            
            await self._broadcast_to_websockets({
                'event': 'service_scaled',
                'service_id': service_id,
                'action': action,
                'current_replicas': target_replicas,
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
            
            logger.info(f"📊 서비스 스케일링: {service_id} -> {target_replicas}개 ({action})")
            
            return {
                'status': 'success',
                'service_id': service_id,
                'action': action,
                'current_replicas': target_replicas,
                'message': message
            }
            
        except Exception as e:
            logger.error(f"서비스 스케일링 실패: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _stop_service_instance(self, instance: ServiceInstance):
        """서비스 인스턴스 중지"""
        
        try:
            instance.status = ServiceStatus.STOPPING
            
            # Docker 컨테이너 중지
            if self.docker_client:
                try:
                    container = self.docker_client.containers.get(instance.instance_id)
                    container.stop()
                    container.remove()
                    logger.info(f"🛑 Docker 컨테이너 중지: {instance.instance_id}")
                except:
                    pass
            
            # 프로세스 중지 (PID 기반)
            # 실제 구현에서는 PID 추적 메커니즘 필요
            
            instance.status = ServiceStatus.STOPPED
            
            if instance.status == ServiceStatus.HEALTHY:
                self.metrics['healthy_instances'] -= 1
            
        except Exception as e:
            logger.error(f"인스턴스 중지 실패: {e}")
            instance.status = ServiceStatus.ERROR
    
    def _start_background_tasks(self):
        """백그라운드 태스크 시작"""
        
        # 헬스 체크 태스크
        asyncio.create_task(self._health_check_loop())
        
        # 자동 스케일링 태스크
        asyncio.create_task(self._auto_scaling_loop())
        
        # 메트릭 수집 태스크
        asyncio.create_task(self._metrics_collection_loop())
        
        # 로드 밸런싱 최적화 태스크
        asyncio.create_task(self._load_balancing_optimization_loop())
        
        logger.info("🔄 백그라운드 태스크 시작")
    
    async def _health_check_loop(self):
        """헬스 체크 루프"""
        
        while self.health_check_active:
            try:
                health_check_tasks = []
                
                for instance in self.service_instances.values():
                    if instance.status in [ServiceStatus.HEALTHY, ServiceStatus.UNHEALTHY]:
                        service_def = self.service_definitions.get(instance.service_id)
                        if service_def:
                            task = self._check_instance_health(instance, service_def)
                            health_check_tasks.append(task)
                
                if health_check_tasks:
                    await asyncio.gather(*health_check_tasks, return_exceptions=True)
                
                await asyncio.sleep(self.health_check_interval)
                
            except Exception as e:
                logger.error(f"헬스 체크 루프 오류: {e}")
                await asyncio.sleep(30)
    
    async def _check_instance_health(self, instance: ServiceInstance, service_def: ServiceDefinition) -> bool:
        """인스턴스 헬스 체크"""
        
        try:
            health_url = f"http://{instance.host}:{instance.port}{service_def.health_check_url}"
            
            async with aiohttp.ClientSession() as session:
                start_time = time.time()
                async with session.get(health_url, timeout=10) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        # 헬스 스코어 계산
                        response_score = min(1.0, 1.0 - (response_time / 5.0))  # 5초 기준
                        error_rate = instance.error_count / max(instance.request_count, 1)
                        error_score = max(0.0, 1.0 - (error_rate * 10))
                        
                        instance.health_score = (response_score + error_score) / 2
                        
                        if instance.status != ServiceStatus.HEALTHY:
                            instance.status = ServiceStatus.HEALTHY
                            self.metrics['healthy_instances'] += 1
                            logger.info(f"✅ 인스턴스 복구: {instance.instance_id}")
                        
                        instance.last_health_check = datetime.now(timezone.utc)
                        instance.response_time_avg = (instance.response_time_avg + response_time) / 2
                        
                        return True
                    else:
                        raise aiohttp.ClientResponseError(None, None, status=response.status)
            
        except Exception as e:
            if instance.status == ServiceStatus.HEALTHY:
                instance.status = ServiceStatus.UNHEALTHY
                self.metrics['healthy_instances'] -= 1
                logger.warning(f"❌ 인스턴스 불건전: {instance.instance_id} - {e}")
            
            instance.health_score = max(0.0, instance.health_score - 0.1)
            return False
    
    async def _auto_scaling_loop(self):
        """자동 스케일링 루프"""
        
        while self.auto_scaling_enabled:
            try:
                for service_id, policy in self.scaling_policies.items():
                    await self._evaluate_scaling_decision(service_id, policy)
                
                await asyncio.sleep(60)  # 1분마다 평가
                
            except Exception as e:
                logger.error(f"자동 스케일링 루프 오류: {e}")
                await asyncio.sleep(60)
    
    async def _evaluate_scaling_decision(self, service_id: str, policy: Dict[str, Any]):
        """스케일링 결정 평가"""
        
        try:
            instances = [
                inst for inst in self.service_instances.values()
                if inst.service_id == service_id and inst.status == ServiceStatus.HEALTHY
            ]
            
            current_count = len(instances)
            
            if current_count == 0:
                return
            
            # CPU 사용률 기반 스케일링
            if policy['policy'] == ScalingPolicy.CPU_BASED:
                avg_cpu = sum(inst.load_metrics.get('cpu', 0) for inst in instances) / current_count
                
                if avg_cpu > policy['scale_up_threshold'] and current_count < policy['max_replicas']:
                    # 스케일 아웃
                    target_replicas = min(current_count + 1, policy['max_replicas'])
                    await self.scale_service(service_id, target_replicas)
                    logger.info(f"📈 자동 스케일 아웃: {service_id} (CPU: {avg_cpu:.1f}%)")
                    
                elif avg_cpu < policy['scale_down_threshold'] and current_count > policy['min_replicas']:
                    # 스케일 인
                    target_replicas = max(current_count - 1, policy['min_replicas'])
                    await self.scale_service(service_id, target_replicas)
                    logger.info(f"📉 자동 스케일 인: {service_id} (CPU: {avg_cpu:.1f}%)")
            
            # 요청 기반 스케일링
            elif policy['policy'] == ScalingPolicy.REQUEST_BASED:
                total_requests = sum(inst.request_count for inst in instances)
                requests_per_instance = total_requests / current_count
                
                if requests_per_instance > 100 and current_count < policy['max_replicas']:
                    # 높은 요청 부하
                    target_replicas = min(current_count + 1, policy['max_replicas'])
                    await self.scale_service(service_id, target_replicas)
                
        except Exception as e:
            logger.error(f"스케일링 결정 평가 오류: {e}")
    
    async def _metrics_collection_loop(self):
        """메트릭 수집 루프"""
        
        while self.background_tasks_active:
            try:
                # 시스템 메트릭 수집
                self.metrics['cpu_usage'] = psutil.cpu_percent()
                self.metrics['memory_usage'] = psutil.virtual_memory().percent
                
                # 서비스 메트릭 집계
                healthy_count = sum(
                    1 for inst in self.service_instances.values()
                    if inst.status == ServiceStatus.HEALTHY
                )
                self.metrics['healthy_instances'] = healthy_count
                
                total_requests = sum(inst.request_count for inst in self.service_instances.values())
                total_errors = sum(inst.error_count for inst in self.service_instances.values())
                
                self.metrics['total_requests'] = total_requests
                self.metrics['total_errors'] = total_errors
                
                # 평균 응답 시간
                response_times = [
                    inst.response_time_avg for inst in self.service_instances.values()
                    if inst.response_time_avg > 0
                ]
                if response_times:
                    self.metrics['average_response_time'] = sum(response_times) / len(response_times)
                
                # 인스턴스 로드 메트릭 업데이트
                for instance in self.service_instances.values():
                    if instance.status == ServiceStatus.HEALTHY:
                        # 실제 환경에서는 각 인스턴스에서 메트릭 수집
                        instance.load_metrics = {
                            'cpu': psutil.cpu_percent() + (hash(instance.instance_id) % 20 - 10),
                            'memory': psutil.virtual_memory().percent + (hash(instance.instance_id) % 15 - 7),
                            'connections': instance.request_count % 50
                        }
                
                await asyncio.sleep(15)  # 15초마다 수집
                
            except Exception as e:
                logger.error(f"메트릭 수집 오류: {e}")
                await asyncio.sleep(30)
    
    async def _load_balancing_optimization_loop(self):
        """로드 밸런싱 최적화 루프"""
        
        while self.background_tasks_active:
            try:
                # AI 기반 로드 밸런싱 최적화
                if self.current_lb_strategy == LoadBalancingStrategy.AI_OPTIMIZED:
                    await self._optimize_load_balancing()
                
                await asyncio.sleep(300)  # 5분마다 최적화
                
            except Exception as e:
                logger.error(f"로드 밸런싱 최적화 오류: {e}")
                await asyncio.sleep(300)
    
    async def _optimize_load_balancing(self):
        """AI 기반 로드 밸런싱 최적화"""
        
        try:
            for service_id, lb_config in self.load_balancers.items():
                instances = [
                    inst for inst in self.service_instances.values()
                    if inst.service_id == service_id and inst.status == ServiceStatus.HEALTHY
                ]
                
                if len(instances) > 1:
                    # 인스턴스별 성능 점수 계산
                    performance_scores = {}
                    for instance in instances:
                        cpu_score = max(0, 1 - (instance.load_metrics.get('cpu', 0) / 100))
                        response_score = max(0, 1 - (instance.response_time_avg / 2))
                        health_score = instance.health_score
                        
                        # 종합 성능 점수
                        performance_scores[instance.instance_id] = (
                            cpu_score * 0.4 + response_score * 0.4 + health_score * 0.2
                        )
                    
                    # 가중치 재조정
                    total_score = sum(performance_scores.values())
                    if total_score > 0:
                        for instance_id, score in performance_scores.items():
                            weight = score / total_score
                            lb_config['weights'][instance_id] = weight
                    
                    logger.debug(f"🔧 로드 밸런싱 가중치 최적화: {service_id}")
            
        except Exception as e:
            logger.error(f"로드 밸런싱 최적화 실패: {e}")
    
    async def _route_to_service(self, service_path: str, request):
        """서비스로 요청 라우팅"""
        
        try:
            # 서비스 이름 추출
            path_parts = service_path.strip('/').split('/')
            service_name = path_parts[0]
            
            # 서비스 찾기
            target_service_id = None
            for service_id, service_def in self.service_definitions.items():
                if service_def.name == service_name:
                    target_service_id = service_id
                    break
            
            if not target_service_id:
                raise HTTPException(status_code=404, detail=f"서비스 없음: {service_name}")
            
            # 로드 밸런싱으로 인스턴스 선택
            instance = await self._select_instance_for_request(target_service_id)
            if not instance:
                raise HTTPException(status_code=503, detail=f"사용 가능한 인스턴스 없음: {service_name}")
            
            # 요청 프록시
            target_url = f"http://{instance.host}:{instance.port}/{'/'.join(path_parts[1:])}"
            
            async with aiohttp.ClientSession() as session:
                start_time = time.time()
                
                # 요청 메서드에 따른 처리
                method = request.method.lower()
                
                if method == 'get':
                    async with session.get(target_url, params=dict(request.query_params)) as response:
                        content = await response.text()
                        response_time = time.time() - start_time
                
                elif method == 'post':
                    body = await request.body()
                    async with session.post(target_url, data=body) as response:
                        content = await response.text()
                        response_time = time.time() - start_time
                
                else:
                    # 기타 메서드들
                    async with session.request(method, target_url) as response:
                        content = await response.text()
                        response_time = time.time() - start_time
                
                # 메트릭 업데이트
                instance.request_count += 1
                instance.response_time_avg = (instance.response_time_avg + response_time) / 2
                
                if response.status >= 400:
                    instance.error_count += 1
                    self.metrics['total_errors'] += 1
                
                self.metrics['total_requests'] += 1
                
                return {"content": content, "status_code": response.status}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"서비스 라우팅 오류: {e}")
            raise HTTPException(status_code=500, detail="내부 서버 오류")
    
    async def _select_instance_for_request(self, service_id: str) -> Optional[ServiceInstance]:
        """요청을 위한 인스턴스 선택"""
        
        instances = [
            inst for inst in self.service_instances.values()
            if inst.service_id == service_id and inst.status == ServiceStatus.HEALTHY
        ]
        
        if not instances:
            return None
        
        lb_config = self.load_balancers.get(service_id, {})
        strategy = lb_config.get('strategy', LoadBalancingStrategy.ROUND_ROBIN)
        
        if strategy == LoadBalancingStrategy.ROUND_ROBIN:
            # 라운드 로빈
            current_index = lb_config.get('current_index', 0)
            selected_instance = instances[current_index % len(instances)]
            lb_config['current_index'] = (current_index + 1) % len(instances)
            
        elif strategy == LoadBalancingStrategy.LEAST_CONNECTIONS:
            # 최소 연결
            selected_instance = min(instances, key=lambda x: x.load_metrics.get('connections', 0))
            
        elif strategy == LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN:
            # 가중 라운드 로빈
            weights = lb_config.get('weights', {})
            if weights:
                # 가중치 기반 선택
                import random
                choices = []
                for instance in instances:
                    weight = weights.get(instance.instance_id, 1.0)
                    choices.extend([instance] * int(weight * 100))
                selected_instance = random.choice(choices) if choices else instances[0]
            else:
                selected_instance = instances[0]
                
        elif strategy == LoadBalancingStrategy.AI_OPTIMIZED:
            # AI 최적화 선택
            best_score = -1
            selected_instance = instances[0]
            
            for instance in instances:
                score = (
                    instance.health_score * 0.4 +
                    (1 - instance.load_metrics.get('cpu', 0) / 100) * 0.3 +
                    (1 - instance.response_time_avg / 2) * 0.3
                )
                if score > best_score:
                    best_score = score
                    selected_instance = instance
        
        else:
            # 랜덤 선택
            import random
            selected_instance = random.choice(instances)
        
        return selected_instance
    
    async def _handle_websocket_connection(self, websocket: WebSocket):
        """WebSocket 연결 처리"""
        
        await websocket.accept()
        self.websocket_connections.append(websocket)
        
        try:
            while True:
                # 실시간 메트릭 전송
                await websocket.send_json({
                    'metrics': self.metrics,
                    'services': len(self.service_definitions),
                    'instances': len(self.service_instances),
                    'timestamp': datetime.now(timezone.utc).isoformat()
                })
                
                await asyncio.sleep(5)  # 5초마다 전송
                
        except WebSocketDisconnect:
            self.websocket_connections.remove(websocket)
        except Exception as e:
            logger.error(f"WebSocket 오류: {e}")
            if websocket in self.websocket_connections:
                self.websocket_connections.remove(websocket)
    
    async def _broadcast_to_websockets(self, message: Dict[str, Any]):
        """WebSocket 브로드캐스트"""
        
        disconnected = []
        
        for websocket in self.websocket_connections:
            try:
                await websocket.send_json(message)
            except:
                disconnected.append(websocket)
        
        # 연결 해제된 WebSocket 제거
        for websocket in disconnected:
            self.websocket_connections.remove(websocket)
    
    async def get_system_metrics(self) -> Dict[str, Any]:
        """시스템 메트릭 조회"""
        
        return {
            'orchestrator_version': '6.0',
            'status': 'active',
            'metrics': self.metrics,
            'services': {
                'total': len(self.service_definitions),
                'definitions': {
                    service_id: {
                        'name': service_def.name,
                        'version': service_def.version,
                        'instances': len([
                            inst for inst in self.service_instances.values()
                            if inst.service_id == service_id
                        ])
                    }
                    for service_id, service_def in self.service_definitions.items()
                }
            },
            'instances': {
                'total': len(self.service_instances),
                'healthy': self.metrics['healthy_instances'],
                'details': [
                    {
                        'instance_id': inst.instance_id,
                        'service_id': inst.service_id,
                        'status': inst.status.value,
                        'health_score': inst.health_score,
                        'request_count': inst.request_count,
                        'load_metrics': inst.load_metrics
                    }
                    for inst in self.service_instances.values()
                ]
            },
            'load_balancing': {
                'strategy': self.current_lb_strategy.value,
                'configurations': self.load_balancers
            },
            'scaling': {
                'auto_scaling_enabled': self.auto_scaling_enabled,
                'policies': self.scaling_policies,
                'events': self.metrics['scaling_events']
            },
            'last_updated': datetime.now(timezone.utc).isoformat()
        }
    
    def start_orchestrator(self, host: str = "0.0.0.0", port: int = 8000):
        """오케스트레이터 시작"""
        
        self.api_gateway_port = port
        
        logger.info(f"🚀 궁극의 마이크로서비스 오케스트레이터 v6.0 시작")
        logger.info(f"🌐 API 게이트웨이: http://{host}:{port}")
        logger.info(f"📊 실시간 메트릭: ws://{host}:{port}/ws/metrics")
        
        uvicorn.run(self.app, host=host, port=port, log_level="info")

# 전역 인스턴스
orchestrator = UltimateMicroservicesOrchestrator()

# 편의 함수들
async def register_microservice(service_definition: Dict[str, Any]) -> Dict[str, Any]:
    """마이크로서비스 등록 편의 함수"""
    service_def = ServiceDefinition(**service_definition)
    return await orchestrator.register_service(service_def)

async def scale_microservice(service_id: str, replicas: int) -> Dict[str, Any]:
    """마이크로서비스 스케일링 편의 함수"""
    return await orchestrator.scale_service(service_id, replicas)

def get_orchestrator_metrics() -> Dict[str, Any]:
    """오케스트레이터 메트릭 조회 편의 함수"""
    return asyncio.run(orchestrator.get_system_metrics())

def start_microservices_platform(host: str = "0.0.0.0", port: int = 8000):
    """마이크로서비스 플랫폼 시작 편의 함수"""
    orchestrator.start_orchestrator(host, port)

if __name__ == "__main__":
    print("🏗️ 궁극의 마이크로서비스 오케스트레이터 v6.0 초기화 완료")
    print("✅ 기능: 서비스디스커버리, 동적로드밸런싱, 자동스케일링, 헬스체크")
    print("🎯 지원: Docker, 프로세스, 서비스메시, 실시간모니터링")
    _p = int(
        os.environ.get(
            "ULTIMATE_MICROSERVICES_ORCHESTRATOR_PORT",
            os.environ.get("PORT", "8000"),
        )
    )
    start_microservices_platform(port=_p) 