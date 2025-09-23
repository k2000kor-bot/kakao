#!/usr/bin/env python3
"""
확장성 관리 시스템
로드 밸런싱, 자동 스케일링, 마이크로서비스 관리
"""

import os
import json
import asyncio
import logging
import time
import psutil
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict, deque
import numpy as np
import aiohttp
import docker
from kubernetes import client, config
from kubernetes.client.rest import ApiException
import redis
from celery import Celery
import consul
import requests

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ServiceInstance:
    """서비스 인스턴스 정보"""
    service_id: str
    instance_id: str
    host: str
    port: int
    status: str  # healthy, unhealthy, starting, stopping
    cpu_usage: float
    memory_usage: float
    request_count: int
    response_time: float
    last_heartbeat: str
    tags: List[str]

@dataclass
class LoadBalancerConfig:
    """로드 밸런서 설정"""
    algorithm: str  # round_robin, least_connections, weighted_round_robin
    health_check_interval: int
    health_check_timeout: int
    max_retries: int
    circuit_breaker_threshold: int
    circuit_breaker_timeout: int

@dataclass
class ScalingMetrics:
    """스케일링 메트릭"""
    timestamp: str
    cpu_usage: float
    memory_usage: float
    request_rate: float
    response_time: float
    error_rate: float
    active_connections: int
    queue_length: int

class ServiceRegistry:
    """서비스 레지스트리 관리"""
    
    def __init__(self):
        self.services = defaultdict(list)
        self.health_checker = HealthChecker()
        
    def register_service(self, service: ServiceInstance) -> bool:
        """서비스 등록"""
        try:
            self.services[service.service_id].append(service)
            logger.info(f"서비스 등록: {service.service_id} - {service.instance_id}")
            return True
        except Exception as e:
            logger.error(f"서비스 등록 오류: {e}")
            return False
    
    def deregister_service(self, service_id: str, instance_id: str) -> bool:
        """서비스 등록 해제"""
        try:
            if service_id in self.services:
                self.services[service_id] = [
                    s for s in self.services[service_id] 
                    if s.instance_id != instance_id
                ]
                logger.info(f"서비스 등록 해제: {service_id} - {instance_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"서비스 등록 해제 오류: {e}")
            return False
    
    def get_healthy_instances(self, service_id: str) -> List[ServiceInstance]:
        """건강한 서비스 인스턴스 조회"""
        if service_id not in self.services:
            return []
        
        healthy_instances = []
        for instance in self.services[service_id]:
            if instance.status == 'healthy':
                healthy_instances.append(instance)
        
        return healthy_instances
    
    def update_service_status(self, service_id: str, instance_id: str, status: str) -> bool:
        """서비스 상태 업데이트"""
        try:
            if service_id in self.services:
                for instance in self.services[service_id]:
                    if instance.instance_id == instance_id:
                        instance.status = status
                        instance.last_heartbeat = datetime.now().isoformat()
                        return True
            return False
        except Exception as e:
            logger.error(f"서비스 상태 업데이트 오류: {e}")
            return False

class HealthChecker:
    """헬스 체크 관리"""
    
    def __init__(self):
        self.check_results = defaultdict(dict)
        
    async def check_service_health(self, instance: ServiceInstance) -> bool:
        """서비스 헬스 체크"""
        try:
            url = f"http://{instance.host}:{instance.port}/health"
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=5) as response:
                    is_healthy = response.status == 200
                    self.check_results[instance.instance_id] = {
                        'timestamp': datetime.now().isoformat(),
                        'healthy': is_healthy,
                        'status_code': response.status,
                        'response_time': response.headers.get('X-Response-Time', 0)
                    }
                    return is_healthy
        except Exception as e:
            logger.error(f"헬스 체크 오류 ({instance.instance_id}): {e}")
            self.check_results[instance.instance_id] = {
                'timestamp': datetime.now().isoformat(),
                'healthy': False,
                'error': str(e)
            }
            return False
    
    async def check_all_services(self, registry: ServiceRegistry) -> Dict[str, bool]:
        """모든 서비스 헬스 체크"""
        results = {}
        
        for service_id, instances in registry.services.items():
            for instance in instances:
                is_healthy = await self.check_service_health(instance)
                results[instance.instance_id] = is_healthy
                
                # 상태 업데이트
                registry.update_service_status(
                    service_id, 
                    instance.instance_id, 
                    'healthy' if is_healthy else 'unhealthy'
                )
        
        return results

class LoadBalancer:
    """로드 밸런서"""
    
    def __init__(self, config: LoadBalancerConfig):
        self.config = config
        self.request_counts = defaultdict(int)
        self.connection_counts = defaultdict(int)
        self.circuit_breakers = defaultdict(dict)
        
    def select_instance(self, service_id: str, instances: List[ServiceInstance]) -> Optional[ServiceInstance]:
        """로드 밸런싱 알고리즘에 따라 인스턴스 선택"""
        if not instances:
            return None
        
        # 서킷 브레이커 확인
        healthy_instances = []
        for instance in instances:
            if self._is_circuit_breaker_open(instance.instance_id):
                continue
            healthy_instances.append(instance)
        
        if not healthy_instances:
            return None
        
        # 로드 밸런싱 알고리즘 적용
        if self.config.algorithm == 'round_robin':
            return self._round_robin_selection(service_id, healthy_instances)
        elif self.config.algorithm == 'least_connections':
            return self._least_connections_selection(healthy_instances)
        elif self.config.algorithm == 'weighted_round_robin':
            return self._weighted_round_robin_selection(healthy_instances)
        else:
            return healthy_instances[0]  # 기본값
    
    def _round_robin_selection(self, service_id: str, instances: List[ServiceInstance]) -> ServiceInstance:
        """라운드 로빈 선택"""
        if not instances:
            return None
        
        current_index = self.request_counts[service_id] % len(instances)
        self.request_counts[service_id] += 1
        return instances[current_index]
    
    def _least_connections_selection(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """최소 연결 선택"""
        if not instances:
            return None
        
        return min(instances, key=lambda x: self.connection_counts[x.instance_id])
    
    def _weighted_round_robin_selection(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """가중 라운드 로빈 선택"""
        if not instances:
            return None
        
        # CPU 사용률 기반 가중치 계산
        weights = []
        for instance in instances:
            weight = max(1, 100 - instance.cpu_usage)  # CPU 사용률이 낮을수록 높은 가중치
            weights.append(weight)
        
        # 가중치 기반 선택
        total_weight = sum(weights)
        if total_weight == 0:
            return instances[0]
        
        random_value = np.random.random() * total_weight
        current_weight = 0
        
        for i, weight in enumerate(weights):
            current_weight += weight
            if random_value <= current_weight:
                return instances[i]
        
        return instances[-1]
    
    def _is_circuit_breaker_open(self, instance_id: str) -> bool:
        """서킷 브레이커 상태 확인"""
        if instance_id not in self.circuit_breakers:
            return False
        
        breaker = self.circuit_breakers[instance_id]
        if breaker.get('state') == 'open':
            # 타임아웃 확인
            if datetime.now() - datetime.fromisoformat(breaker['last_failure']) > timedelta(seconds=self.config.circuit_breaker_timeout):
                breaker['state'] = 'half_open'
                return False
            return True
        
        return False
    
    def record_request_result(self, instance_id: str, success: bool, response_time: float):
        """요청 결과 기록"""
        if instance_id not in self.circuit_breakers:
            self.circuit_breakers[instance_id] = {
                'state': 'closed',
                'failure_count': 0,
                'last_failure': None
            }
        
        breaker = self.circuit_breakers[instance_id]
        
        if success:
            breaker['failure_count'] = 0
            breaker['state'] = 'closed'
        else:
            breaker['failure_count'] += 1
            breaker['last_failure'] = datetime.now().isoformat()
            
            if breaker['failure_count'] >= self.config.circuit_breaker_threshold:
                breaker['state'] = 'open'

class AutoScaler:
    """자동 스케일러"""
    
    def __init__(self):
        self.scaling_history = deque(maxlen=100)
        self.scaling_policies = {
            'cpu_threshold': 70.0,
            'memory_threshold': 80.0,
            'response_time_threshold': 2.0,
            'error_rate_threshold': 5.0,
            'min_instances': 1,
            'max_instances': 10,
            'scale_up_cooldown': 300,  # 5분
            'scale_down_cooldown': 600  # 10분
        }
        
    def analyze_scaling_need(self, metrics: ScalingMetrics, current_instances: int) -> Dict[str, Any]:
        """스케일링 필요성 분석"""
        scaling_decision = {
            'action': 'no_action',
            'reason': '',
            'target_instances': current_instances,
            'confidence': 0.0
        }
        
        # 스케일 업 조건 확인
        scale_up_conditions = [
            metrics.cpu_usage > self.scaling_policies['cpu_threshold'],
            metrics.memory_usage > self.scaling_policies['memory_threshold'],
            metrics.response_time > self.scaling_policies['response_time_threshold'],
            metrics.error_rate > self.scaling_policies['error_rate_threshold']
        ]
        
        # 스케일 다운 조건 확인
        scale_down_conditions = [
            metrics.cpu_usage < 30.0,
            metrics.memory_usage < 40.0,
            metrics.response_time < 0.5,
            metrics.error_rate < 1.0
        ]
        
        if any(scale_up_conditions) and current_instances < self.scaling_policies['max_instances']:
            scaling_decision['action'] = 'scale_up'
            scaling_decision['target_instances'] = min(
                current_instances + 1, 
                self.scaling_policies['max_instances']
            )
            scaling_decision['reason'] = '리소스 사용률이 임계값을 초과했습니다.'
            scaling_decision['confidence'] = self._calculate_confidence(scale_up_conditions)
            
        elif all(scale_down_conditions) and current_instances > self.scaling_policies['min_instances']:
            # 쿨다운 기간 확인
            if self._can_scale_down():
                scaling_decision['action'] = 'scale_down'
                scaling_decision['target_instances'] = max(
                    current_instances - 1,
                    self.scaling_policies['min_instances']
                )
                scaling_decision['reason'] = '리소스 사용률이 낮아 스케일 다운이 가능합니다.'
                scaling_decision['confidence'] = self._calculate_confidence(scale_down_conditions)
        
        return scaling_decision
    
    def _calculate_confidence(self, conditions: List[bool]) -> float:
        """스케일링 결정 신뢰도 계산"""
        true_count = sum(conditions)
        return true_count / len(conditions)
    
    def _can_scale_down(self) -> bool:
        """스케일 다운 가능 여부 확인 (쿨다운 기간 고려)"""
        if not self.scaling_history:
            return True
        
        last_scale_down = None
        for record in reversed(self.scaling_history):
            if record['action'] == 'scale_down':
                last_scale_down = datetime.fromisoformat(record['timestamp'])
                break
        
        if last_scale_down is None:
            return True
        
        cooldown_period = timedelta(seconds=self.scaling_policies['scale_down_cooldown'])
        return datetime.now() - last_scale_down > cooldown_period
    
    def record_scaling_action(self, action: str, target_instances: int, reason: str):
        """스케일링 액션 기록"""
        record = {
            'timestamp': datetime.now().isoformat(),
            'action': action,
            'target_instances': target_instances,
            'reason': reason
        }
        self.scaling_history.append(record)

class DockerManager:
    """Docker 컨테이너 관리"""
    
    def __init__(self):
        try:
            self.client = docker.from_env()
        except Exception as e:
            logger.error(f"Docker 클라이언트 초기화 오류: {e}")
            self.client = None
    
    def create_service_instance(self, service_id: str, image: str, port: int, env_vars: Dict[str, str] = None) -> Optional[str]:
        """서비스 인스턴스 생성"""
        if not self.client:
            return None
        
        try:
            container_name = f"{service_id}_{int(time.time())}"
            
            container = self.client.containers.run(
                image,
                name=container_name,
                ports={port: port},
                environment=env_vars or {},
                detach=True,
                restart_policy={"Name": "unless-stopped"}
            )
            
            logger.info(f"컨테이너 생성: {container_name}")
            return container.id
            
        except Exception as e:
            logger.error(f"컨테이너 생성 오류: {e}")
            return None
    
    def stop_service_instance(self, container_id: str) -> bool:
        """서비스 인스턴스 중지"""
        if not self.client:
            return False
        
        try:
            container = self.client.containers.get(container_id)
            container.stop()
            container.remove()
            logger.info(f"컨테이너 중지 및 제거: {container_id}")
            return True
            
        except Exception as e:
            logger.error(f"컨테이너 중지 오류: {e}")
            return False
    
    def get_container_stats(self, container_id: str) -> Optional[Dict[str, Any]]:
        """컨테이너 통계 조회"""
        if not self.client:
            return None
        
        try:
            container = self.client.containers.get(container_id)
            stats = container.stats(stream=False)
            
            # CPU 사용률 계산
            cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
            system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
            cpu_usage = (cpu_delta / system_delta) * len(stats['cpu_stats']['cpu_usage']['percpu_usage']) * 100.0
            
            # 메모리 사용률 계산
            memory_usage = stats['memory_stats']['usage']
            memory_limit = stats['memory_stats']['limit']
            memory_percent = (memory_usage / memory_limit) * 100.0
            
            return {
                'cpu_usage': cpu_usage,
                'memory_usage': memory_percent,
                'memory_bytes': memory_usage,
                'memory_limit': memory_limit
            }
            
        except Exception as e:
            logger.error(f"컨테이너 통계 조회 오류: {e}")
            return None

class KubernetesManager:
    """Kubernetes 클러스터 관리"""
    
    def __init__(self):
        try:
            config.load_incluster_config()  # 클러스터 내부에서 실행되는 경우
        except:
            try:
                config.load_kube_config()  # 로컬에서 실행되는 경우
            except Exception as e:
                logger.error(f"Kubernetes 설정 로드 오류: {e}")
                return
        
        self.apps_v1 = client.AppsV1Api()
        self.core_v1 = client.CoreV1Api()
        self.autoscaling_v1 = client.AutoscalingV1Api()
    
    def scale_deployment(self, namespace: str, deployment_name: str, replicas: int) -> bool:
        """Deployment 스케일링"""
        try:
            # 현재 Deployment 정보 조회
            deployment = self.apps_v1.read_namespaced_deployment(deployment_name, namespace)
            
            # Replica 수 업데이트
            deployment.spec.replicas = replicas
            
            # Deployment 업데이트
            self.apps_v1.patch_namespaced_deployment_scale(
                deployment_name, 
                namespace, 
                {'spec': {'replicas': replicas}}
            )
            
            logger.info(f"Deployment 스케일링: {deployment_name} -> {replicas} replicas")
            return True
            
        except ApiException as e:
            logger.error(f"Deployment 스케일링 오류: {e}")
            return False
    
    def create_hpa(self, namespace: str, deployment_name: str, min_replicas: int, max_replicas: int, target_cpu: int) -> bool:
        """Horizontal Pod Autoscaler 생성"""
        try:
            hpa = client.V1HorizontalPodAutoscaler(
                metadata=client.V1ObjectMeta(name=f"{deployment_name}-hpa"),
                spec=client.V1HorizontalPodAutoscalerSpec(
                    scale_target_ref=client.V1CrossVersionObjectReference(
                        api_version="apps/v1",
                        kind="Deployment",
                        name=deployment_name
                    ),
                    min_replicas=min_replicas,
                    max_replicas=max_replicas,
                    target_cpu_utilization_percentage=target_cpu
                )
            )
            
            self.autoscaling_v1.create_namespaced_horizontal_pod_autoscaler(namespace, hpa)
            logger.info(f"HPA 생성: {deployment_name}")
            return True
            
        except ApiException as e:
            logger.error(f"HPA 생성 오류: {e}")
            return False

class ScalabilityManager:
    """확장성 관리 메인 클래스"""
    
    def __init__(self):
        self.service_registry = ServiceRegistry()
        self.load_balancer = LoadBalancer(LoadBalancerConfig(
            algorithm='least_connections',
            health_check_interval=30,
            health_check_timeout=5,
            max_retries=3,
            circuit_breaker_threshold=5,
            circuit_breaker_timeout=60
        ))
        self.auto_scaler = AutoScaler()
        self.docker_manager = DockerManager()
        self.k8s_manager = KubernetesManager()
        self.metrics_collector = MetricsCollector()
        
    def register_service(self, service_id: str, host: str, port: int, tags: List[str] = None) -> str:
        """서비스 등록"""
        instance_id = f"{service_id}_{int(time.time())}"
        
        service_instance = ServiceInstance(
            service_id=service_id,
            instance_id=instance_id,
            host=host,
            port=port,
            status='starting',
            cpu_usage=0.0,
            memory_usage=0.0,
            request_count=0,
            response_time=0.0,
            last_heartbeat=datetime.now().isoformat(),
            tags=tags or []
        )
        
        success = self.service_registry.register_service(service_instance)
        return instance_id if success else None
    
    def get_service_endpoint(self, service_id: str) -> Optional[str]:
        """서비스 엔드포인트 조회 (로드 밸런싱 적용)"""
        instances = self.service_registry.get_healthy_instances(service_id)
        selected_instance = self.load_balancer.select_instance(service_id, instances)
        
        if selected_instance:
            return f"http://{selected_instance.host}:{selected_instance.port}"
        return None
    
    async def perform_health_checks(self):
        """헬스 체크 수행"""
        await self.service_registry.health_checker.check_all_services(self.service_registry)
    
    def analyze_and_scale(self, service_id: str) -> Dict[str, Any]:
        """스케일링 분석 및 실행"""
        instances = self.service_registry.services[service_id]
        current_count = len(instances)
        
        # 메트릭 수집
        metrics = self.metrics_collector.collect_service_metrics(service_id)
        
        # 스케일링 분석
        scaling_decision = self.auto_scaler.analyze_scaling_need(metrics, current_count)
        
        # 스케일링 실행
        if scaling_decision['action'] != 'no_action':
            success = self._execute_scaling(service_id, scaling_decision)
            scaling_decision['executed'] = success
            
            if success:
                self.auto_scaler.record_scaling_action(
                    scaling_decision['action'],
                    scaling_decision['target_instances'],
                    scaling_decision['reason']
                )
        
        return scaling_decision
    
    def _execute_scaling(self, service_id: str, decision: Dict[str, Any]) -> bool:
        """스케일링 실행"""
        try:
            if decision['action'] == 'scale_up':
                return self._scale_up_service(service_id)
            elif decision['action'] == 'scale_down':
                return self._scale_down_service(service_id)
            return False
        except Exception as e:
            logger.error(f"스케일링 실행 오류: {e}")
            return False
    
    def _scale_up_service(self, service_id: str) -> bool:
        """서비스 스케일 업"""
        # Docker 컨테이너 생성 또는 Kubernetes Pod 스케일링
        if self.docker_manager.client:
            # Docker 환경
            container_id = self.docker_manager.create_service_instance(
                service_id, 
                f"{service_id}:latest", 
                8080
            )
            return container_id is not None
        else:
            # Kubernetes 환경
            return self.k8s_manager.scale_deployment('default', service_id, 
                                                   len(self.service_registry.services[service_id]) + 1)
    
    def _scale_down_service(self, service_id: str) -> bool:
        """서비스 스케일 다운"""
        instances = self.service_registry.services[service_id]
        if not instances:
            return False
        
        # 가장 오래된 인스턴스 제거
        oldest_instance = min(instances, key=lambda x: x.last_heartbeat)
        
        if self.docker_manager.client:
            # Docker 환경
            return self.docker_manager.stop_service_instance(oldest_instance.instance_id)
        else:
            # Kubernetes 환경
            return self.k8s_manager.scale_deployment('default', service_id, 
                                                   len(instances) - 1)
    
    def get_cluster_status(self) -> Dict[str, Any]:
        """클러스터 상태 조회"""
        total_services = len(self.service_registry.services)
        total_instances = sum(len(instances) for instances in self.service_registry.services.values())
        healthy_instances = sum(
            len(self.service_registry.get_healthy_instances(service_id)) 
            for service_id in self.service_registry.services.keys()
        )
        
        return {
            'total_services': total_services,
            'total_instances': total_instances,
            'healthy_instances': healthy_instances,
            'unhealthy_instances': total_instances - healthy_instances,
            'services': {
                service_id: {
                    'total_instances': len(instances),
                    'healthy_instances': len(self.service_registry.get_healthy_instances(service_id)),
                    'instances': [
                        {
                            'instance_id': instance.instance_id,
                            'status': instance.status,
                            'cpu_usage': instance.cpu_usage,
                            'memory_usage': instance.memory_usage,
                            'response_time': instance.response_time
                        }
                        for instance in instances
                    ]
                }
                for service_id, instances in self.service_registry.services.items()
            }
        }

class MetricsCollector:
    """메트릭 수집기"""
    
    def __init__(self):
        self.metrics_cache = defaultdict(lambda: deque(maxlen=100))
    
    def collect_service_metrics(self, service_id: str) -> ScalingMetrics:
        """서비스 메트릭 수집"""
        # 실제 구현에서는 Prometheus, InfluxDB 등에서 메트릭 수집
        # 여기서는 시뮬레이션된 데이터 사용
        
        cpu_usage = np.random.normal(50, 20)
        memory_usage = np.random.normal(60, 15)
        request_rate = np.random.poisson(100)
        response_time = np.random.exponential(0.5)
        error_rate = np.random.exponential(2)
        active_connections = np.random.poisson(50)
        queue_length = np.random.poisson(10)
        
        metrics = ScalingMetrics(
            timestamp=datetime.now().isoformat(),
            cpu_usage=max(0, min(100, cpu_usage)),
            memory_usage=max(0, min(100, memory_usage)),
            request_rate=max(0, request_rate),
            response_time=max(0, response_time),
            error_rate=max(0, error_rate),
            active_connections=max(0, active_connections),
            queue_length=max(0, queue_length)
        )
        
        self.metrics_cache[service_id].append(metrics)
        return metrics

# API 서버 통합
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel

app = FastAPI(title="확장성 관리 API")

class ServiceRegistrationRequest(BaseModel):
    service_id: str
    host: str
    port: int
    tags: List[str] = []

class ScalingAnalysisRequest(BaseModel):
    service_id: str

scalability_manager = ScalabilityManager()

@app.post("/register-service")
async def register_service(request: ServiceRegistrationRequest):
    """서비스 등록"""
    try:
        instance_id = scalability_manager.register_service(
            request.service_id,
            request.host,
            request.port,
            request.tags
        )
        
        if instance_id:
            return {"instance_id": instance_id, "message": "서비스가 등록되었습니다."}
        else:
            raise HTTPException(status_code=500, detail="서비스 등록에 실패했습니다.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/service-endpoint/{service_id}")
async def get_service_endpoint(service_id: str):
    """서비스 엔드포인트 조회"""
    try:
        endpoint = scalability_manager.get_service_endpoint(service_id)
        if endpoint:
            return {"endpoint": endpoint}
        else:
            raise HTTPException(status_code=404, detail="사용 가능한 서비스 인스턴스가 없습니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-scaling")
async def analyze_scaling(request: ScalingAnalysisRequest):
    """스케일링 분석"""
    try:
        decision = scalability_manager.analyze_and_scale(request.service_id)
        return decision
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/health-check")
async def perform_health_check():
    """헬스 체크 수행"""
    try:
        await scalability_manager.perform_health_checks()
        return {"message": "헬스 체크가 완료되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cluster-status")
async def get_cluster_status():
    """클러스터 상태 조회"""
    try:
        status = scalability_manager.get_cluster_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scaling-history")
async def get_scaling_history():
    """스케일링 히스토리 조회"""
    try:
        history = list(scalability_manager.auto_scaler.scaling_history)
        return {"scaling_history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
