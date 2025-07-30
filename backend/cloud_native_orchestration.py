"""
클라우드 네이티브 컨테이너 오케스트레이션 시스템
- Kubernetes 리소스 관리
- 자동 스케일링 (HPA/VPA)
- 헬스체크 및 프로브
- 서비스 메시 및 로드밸런싱
- CI/CD 파이프라인 자동화
"""

import asyncio
import json
import time
import uuid
import yaml
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field, asdict
from enum import Enum
import base64
import subprocess
import os
import logging
from pathlib import Path
import aiofiles
import aiohttp
from kubernetes import client, config, watch
from kubernetes.client.rest import ApiException
import docker
import git

# 배포 상태
class DeploymentStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    FAILED = "failed"
    SUCCEEDED = "succeeded"
    UNKNOWN = "unknown"

# 스케일링 정책
class ScalingPolicy(Enum):
    CPU_BASED = "cpu_based"
    MEMORY_BASED = "memory_based"
    CUSTOM_METRIC = "custom_metric"
    PREDICTIVE = "predictive"

# 서비스 타입
class ServiceType(Enum):
    CLUSTER_IP = "ClusterIP"
    NODE_PORT = "NodePort"
    LOAD_BALANCER = "LoadBalancer"
    EXTERNAL_NAME = "ExternalName"

@dataclass
class ContainerSpec:
    """컨테이너 사양"""
    name: str
    image: str
    tag: str = "latest"
    ports: List[int] = field(default_factory=list)
    env_vars: Dict[str, str] = field(default_factory=dict)
    resource_requests: Dict[str, str] = field(default_factory=dict)
    resource_limits: Dict[str, str] = field(default_factory=dict)
    health_check: Optional[Dict[str, Any]] = None
    volume_mounts: List[Dict[str, str]] = field(default_factory=list)

@dataclass
class ServiceSpec:
    """서비스 사양"""
    name: str
    namespace: str = "default"
    service_type: ServiceType = ServiceType.CLUSTER_IP
    ports: List[Dict[str, Any]] = field(default_factory=list)
    selector: Dict[str, str] = field(default_factory=dict)
    annotations: Dict[str, str] = field(default_factory=dict)

@dataclass
class DeploymentSpec:
    """배포 사양"""
    name: str
    namespace: str = "default"
    replicas: int = 1
    containers: List[ContainerSpec] = field(default_factory=list)
    labels: Dict[str, str] = field(default_factory=dict)
    annotations: Dict[str, str] = field(default_factory=dict)
    strategy: str = "RollingUpdate"
    max_unavailable: str = "25%"
    max_surge: str = "25%"

@dataclass
class AutoScalingSpec:
    """오토스케일링 사양"""
    name: str
    deployment_name: str
    namespace: str = "default"
    min_replicas: int = 1
    max_replicas: int = 10
    cpu_target: Optional[int] = 80
    memory_target: Optional[int] = 80
    custom_metrics: List[Dict[str, Any]] = field(default_factory=list)
    scale_down_policy: Dict[str, Any] = field(default_factory=dict)
    scale_up_policy: Dict[str, Any] = field(default_factory=dict)

@dataclass
class IngressSpec:
    """인그레스 사양"""
    name: str
    namespace: str = "default"
    host: str = ""
    paths: List[Dict[str, str]] = field(default_factory=list)
    tls_config: Optional[Dict[str, Any]] = None
    annotations: Dict[str, str] = field(default_factory=dict)

class KubernetesManager:
    """Kubernetes 클러스터 관리자"""
    
    def __init__(self, kubeconfig_path: Optional[str] = None):
        self.kubeconfig_path = kubeconfig_path
        self.v1_client = None
        self.apps_v1_client = None
        self.autoscaling_v1_client = None
        self.networking_v1_client = None
        self.metrics_client = None
        
        self._initialize_kubernetes_clients()
    
    def _initialize_kubernetes_clients(self):
        """Kubernetes 클라이언트 초기화"""
        try:
            if self.kubeconfig_path:
                config.load_kube_config(config_file=self.kubeconfig_path)
            else:
                try:
                    config.load_incluster_config()
                except config.ConfigException:
                    config.load_kube_config()
            
            self.v1_client = client.CoreV1Api()
            self.apps_v1_client = client.AppsV1Api()
            self.autoscaling_v1_client = client.AutoscalingV1Api()
            self.networking_v1_client = client.NetworkingV1Api()
            
            logging.info("Kubernetes 클라이언트 초기화 완료")
            
        except Exception as e:
            logging.error(f"Kubernetes 클라이언트 초기화 오류: {e}")
            raise e
    
    async def create_namespace(self, namespace: str) -> bool:
        """네임스페이스 생성"""
        try:
            namespace_manifest = client.V1Namespace(
                metadata=client.V1ObjectMeta(name=namespace)
            )
            
            self.v1_client.create_namespace(body=namespace_manifest)
            logging.info(f"네임스페이스 생성됨: {namespace}")
            
            return True
            
        except ApiException as e:
            if e.status == 409:  # Already exists
                logging.info(f"네임스페이스 이미 존재: {namespace}")
                return True
            else:
                logging.error(f"네임스페이스 생성 오류: {e}")
                return False
    
    async def create_deployment(self, deployment_spec: DeploymentSpec) -> bool:
        """디플로이먼트 생성"""
        try:
            # 네임스페이스 확인/생성
            await self.create_namespace(deployment_spec.namespace)
            
            # 컨테이너 사양 변환
            containers = []
            for container_spec in deployment_spec.containers:
                container = client.V1Container(
                    name=container_spec.name,
                    image=f"{container_spec.image}:{container_spec.tag}",
                    ports=[
                        client.V1ContainerPort(container_port=port)
                        for port in container_spec.ports
                    ],
                    env=[
                        client.V1EnvVar(name=key, value=value)
                        for key, value in container_spec.env_vars.items()
                    ]
                )
                
                # 리소스 설정
                if container_spec.resource_requests or container_spec.resource_limits:
                    container.resources = client.V1ResourceRequirements(
                        requests=container_spec.resource_requests,
                        limits=container_spec.resource_limits
                    )
                
                # 헬스체크 설정
                if container_spec.health_check:
                    health_config = container_spec.health_check
                    
                    if health_config.get("type") == "http":
                        container.liveness_probe = client.V1Probe(
                            http_get=client.V1HTTPGetAction(
                                path=health_config.get("path", "/health"),
                                port=health_config.get("port", 8080)
                            ),
                            initial_delay_seconds=health_config.get("initial_delay", 30),
                            period_seconds=health_config.get("period", 10)
                        )
                        
                        container.readiness_probe = client.V1Probe(
                            http_get=client.V1HTTPGetAction(
                                path=health_config.get("path", "/health"),
                                port=health_config.get("port", 8080)
                            ),
                            initial_delay_seconds=health_config.get("initial_delay", 5),
                            period_seconds=health_config.get("period", 5)
                        )
                
                containers.append(container)
            
            # 배포 전략 설정
            strategy = client.V1DeploymentStrategy(
                type=deployment_spec.strategy
            )
            
            if deployment_spec.strategy == "RollingUpdate":
                strategy.rolling_update = client.V1RollingUpdateDeployment(
                    max_unavailable=deployment_spec.max_unavailable,
                    max_surge=deployment_spec.max_surge
                )
            
            # 디플로이먼트 매니페스트
            deployment_manifest = client.V1Deployment(
                api_version="apps/v1",
                kind="Deployment",
                metadata=client.V1ObjectMeta(
                    name=deployment_spec.name,
                    namespace=deployment_spec.namespace,
                    labels=deployment_spec.labels,
                    annotations=deployment_spec.annotations
                ),
                spec=client.V1DeploymentSpec(
                    replicas=deployment_spec.replicas,
                    selector=client.V1LabelSelector(
                        match_labels=deployment_spec.labels
                    ),
                    template=client.V1PodTemplateSpec(
                        metadata=client.V1ObjectMeta(
                            labels=deployment_spec.labels
                        ),
                        spec=client.V1PodSpec(
                            containers=containers
                        )
                    ),
                    strategy=strategy
                )
            )
            
            # 디플로이먼트 생성
            self.apps_v1_client.create_namespaced_deployment(
                namespace=deployment_spec.namespace,
                body=deployment_manifest
            )
            
            logging.info(f"디플로이먼트 생성됨: {deployment_spec.name}")
            
            return True
            
        except ApiException as e:
            logging.error(f"디플로이먼트 생성 오류: {e}")
            return False
    
    async def create_service(self, service_spec: ServiceSpec) -> bool:
        """서비스 생성"""
        try:
            # 네임스페이스 확인/생성
            await self.create_namespace(service_spec.namespace)
            
            # 포트 설정
            ports = [
                client.V1ServicePort(
                    name=port_config.get("name", f"port-{port_config['port']}"),
                    port=port_config["port"],
                    target_port=port_config.get("target_port", port_config["port"]),
                    protocol=port_config.get("protocol", "TCP")
                )
                for port_config in service_spec.ports
            ]
            
            # 서비스 매니페스트
            service_manifest = client.V1Service(
                api_version="v1",
                kind="Service",
                metadata=client.V1ObjectMeta(
                    name=service_spec.name,
                    namespace=service_spec.namespace,
                    annotations=service_spec.annotations
                ),
                spec=client.V1ServiceSpec(
                    selector=service_spec.selector,
                    ports=ports,
                    type=service_spec.service_type.value
                )
            )
            
            # 서비스 생성
            self.v1_client.create_namespaced_service(
                namespace=service_spec.namespace,
                body=service_manifest
            )
            
            logging.info(f"서비스 생성됨: {service_spec.name}")
            
            return True
            
        except ApiException as e:
            logging.error(f"서비스 생성 오류: {e}")
            return False
    
    async def create_hpa(self, autoscaling_spec: AutoScalingSpec) -> bool:
        """HPA (Horizontal Pod Autoscaler) 생성"""
        try:
            # HPA 매니페스트
            hpa_manifest = client.V1HorizontalPodAutoscaler(
                api_version="autoscaling/v1",
                kind="HorizontalPodAutoscaler",
                metadata=client.V1ObjectMeta(
                    name=autoscaling_spec.name,
                    namespace=autoscaling_spec.namespace
                ),
                spec=client.V1HorizontalPodAutoscalerSpec(
                    scale_target_ref=client.V1CrossVersionObjectReference(
                        api_version="apps/v1",
                        kind="Deployment",
                        name=autoscaling_spec.deployment_name
                    ),
                    min_replicas=autoscaling_spec.min_replicas,
                    max_replicas=autoscaling_spec.max_replicas,
                    target_cpu_utilization_percentage=autoscaling_spec.cpu_target
                )
            )
            
            # HPA 생성
            self.autoscaling_v1_client.create_namespaced_horizontal_pod_autoscaler(
                namespace=autoscaling_spec.namespace,
                body=hpa_manifest
            )
            
            logging.info(f"HPA 생성됨: {autoscaling_spec.name}")
            
            return True
            
        except ApiException as e:
            logging.error(f"HPA 생성 오류: {e}")
            return False
    
    async def create_ingress(self, ingress_spec: IngressSpec) -> bool:
        """인그레스 생성"""
        try:
            # 네임스페이스 확인/생성
            await self.create_namespace(ingress_spec.namespace)
            
            # 경로 설정
            paths = []
            for path_config in ingress_spec.paths:
                path = client.V1HTTPIngressPath(
                    path=path_config["path"],
                    path_type="Prefix",
                    backend=client.V1IngressBackend(
                        service=client.V1IngressServiceBackend(
                            name=path_config["service_name"],
                            port=client.V1ServiceBackendPort(
                                number=path_config["service_port"]
                            )
                        )
                    )
                )
                paths.append(path)
            
            # 인그레스 규칙
            rules = [
                client.V1IngressRule(
                    host=ingress_spec.host,
                    http=client.V1HTTPIngressRuleValue(paths=paths)
                )
            ]
            
            # TLS 설정
            tls = None
            if ingress_spec.tls_config:
                tls = [
                    client.V1IngressTLS(
                        hosts=[ingress_spec.host],
                        secret_name=ingress_spec.tls_config.get("secret_name")
                    )
                ]
            
            # 인그레스 매니페스트
            ingress_manifest = client.V1Ingress(
                api_version="networking.k8s.io/v1",
                kind="Ingress",
                metadata=client.V1ObjectMeta(
                    name=ingress_spec.name,
                    namespace=ingress_spec.namespace,
                    annotations=ingress_spec.annotations
                ),
                spec=client.V1IngressSpec(
                    rules=rules,
                    tls=tls
                )
            )
            
            # 인그레스 생성
            self.networking_v1_client.create_namespaced_ingress(
                namespace=ingress_spec.namespace,
                body=ingress_manifest
            )
            
            logging.info(f"인그레스 생성됨: {ingress_spec.name}")
            
            return True
            
        except ApiException as e:
            logging.error(f"인그레스 생성 오류: {e}")
            return False
    
    async def get_deployment_status(self, name: str, namespace: str = "default") -> Dict[str, Any]:
        """디플로이먼트 상태 조회"""
        try:
            deployment = self.apps_v1_client.read_namespaced_deployment(
                name=name, namespace=namespace
            )
            
            # 파드 상태 조회
            pods = self.v1_client.list_namespaced_pod(
                namespace=namespace,
                label_selector=f"app={name}"
            )
            
            pod_statuses = []
            for pod in pods.items:
                pod_status = {
                    "name": pod.metadata.name,
                    "phase": pod.status.phase,
                    "ready": sum(1 for condition in (pod.status.conditions or []) 
                               if condition.type == "Ready" and condition.status == "True") > 0,
                    "restart_count": sum(container.restart_count or 0 
                                       for container in (pod.status.container_statuses or [])),
                    "node": pod.spec.node_name
                }
                pod_statuses.append(pod_status)
            
            return {
                "name": deployment.metadata.name,
                "namespace": deployment.metadata.namespace,
                "replicas": {
                    "desired": deployment.spec.replicas,
                    "current": deployment.status.replicas or 0,
                    "ready": deployment.status.ready_replicas or 0,
                    "available": deployment.status.available_replicas or 0
                },
                "conditions": [
                    {
                        "type": condition.type,
                        "status": condition.status,
                        "reason": condition.reason,
                        "message": condition.message
                    }
                    for condition in (deployment.status.conditions or [])
                ],
                "pods": pod_statuses,
                "creation_timestamp": deployment.metadata.creation_timestamp.isoformat(),
                "image": deployment.spec.template.spec.containers[0].image if deployment.spec.template.spec.containers else None
            }
            
        except ApiException as e:
            logging.error(f"디플로이먼트 상태 조회 오류: {e}")
            return {"error": str(e)}
    
    async def scale_deployment(self, name: str, replicas: int, namespace: str = "default") -> bool:
        """디플로이먼트 스케일링"""
        try:
            # 현재 디플로이먼트 조회
            deployment = self.apps_v1_client.read_namespaced_deployment(
                name=name, namespace=namespace
            )
            
            # 레플리카 수 변경
            deployment.spec.replicas = replicas
            
            # 디플로이먼트 업데이트
            self.apps_v1_client.patch_namespaced_deployment(
                name=name,
                namespace=namespace,
                body=deployment
            )
            
            logging.info(f"디플로이먼트 스케일링 완료: {name} -> {replicas} replicas")
            
            return True
            
        except ApiException as e:
            logging.error(f"디플로이먼트 스케일링 오류: {e}")
            return False
    
    async def update_deployment_image(self, name: str, image: str, namespace: str = "default") -> bool:
        """디플로이먼트 이미지 업데이트"""
        try:
            # 현재 디플로이먼트 조회
            deployment = self.apps_v1_client.read_namespaced_deployment(
                name=name, namespace=namespace
            )
            
            # 이미지 변경
            deployment.spec.template.spec.containers[0].image = image
            
            # 롤링 업데이트를 위한 어노테이션 추가
            if not deployment.spec.template.metadata.annotations:
                deployment.spec.template.metadata.annotations = {}
            
            deployment.spec.template.metadata.annotations["kubectl.kubernetes.io/restartedAt"] = datetime.now().isoformat()
            
            # 디플로이먼트 업데이트
            self.apps_v1_client.patch_namespaced_deployment(
                name=name,
                namespace=namespace,
                body=deployment
            )
            
            logging.info(f"디플로이먼트 이미지 업데이트 완료: {name} -> {image}")
            
            return True
            
        except ApiException as e:
            logging.error(f"디플로이먼트 이미지 업데이트 오류: {e}")
            return False
    
    async def delete_deployment(self, name: str, namespace: str = "default") -> bool:
        """디플로이먼트 삭제"""
        try:
            self.apps_v1_client.delete_namespaced_deployment(
                name=name, namespace=namespace
            )
            
            logging.info(f"디플로이먼트 삭제됨: {name}")
            
            return True
            
        except ApiException as e:
            logging.error(f"디플로이먼트 삭제 오류: {e}")
            return False

class DockerManager:
    """Docker 이미지 관리자"""
    
    def __init__(self):
        self.client = docker.from_env()
    
    async def build_image(self, dockerfile_path: str, image_name: str, tag: str = "latest") -> bool:
        """Docker 이미지 빌드"""
        try:
            build_path = Path(dockerfile_path).parent
            
            # 이미지 빌드
            image, build_logs = self.client.images.build(
                path=str(build_path),
                dockerfile=Path(dockerfile_path).name,
                tag=f"{image_name}:{tag}",
                rm=True,
                forcerm=True
            )
            
            # 빌드 로그 출력
            for log in build_logs:
                if 'stream' in log:
                    logging.info(log['stream'].strip())
            
            logging.info(f"Docker 이미지 빌드 완료: {image_name}:{tag}")
            
            return True
            
        except Exception as e:
            logging.error(f"Docker 이미지 빌드 오류: {e}")
            return False
    
    async def push_image(self, image_name: str, tag: str = "latest", registry: str = None) -> bool:
        """Docker 이미지 푸시"""
        try:
            full_image_name = f"{image_name}:{tag}"
            
            if registry:
                full_image_name = f"{registry}/{image_name}:{tag}"
                
                # 이미지 태깅
                image = self.client.images.get(f"{image_name}:{tag}")
                image.tag(registry, f"{image_name}:{tag}")
            
            # 이미지 푸시
            push_logs = self.client.images.push(full_image_name, stream=True, decode=True)
            
            # 푸시 로그 출력
            for log in push_logs:
                if 'status' in log:
                    logging.info(f"Push: {log['status']}")
            
            logging.info(f"Docker 이미지 푸시 완료: {full_image_name}")
            
            return True
            
        except Exception as e:
            logging.error(f"Docker 이미지 푸시 오류: {e}")
            return False
    
    async def list_images(self) -> List[Dict[str, Any]]:
        """Docker 이미지 목록 조회"""
        try:
            images = self.client.images.list()
            
            image_list = []
            for image in images:
                image_info = {
                    "id": image.id,
                    "tags": image.tags,
                    "size": image.attrs.get("Size", 0),
                    "created": image.attrs.get("Created", ""),
                    "labels": image.attrs.get("Config", {}).get("Labels", {})
                }
                image_list.append(image_info)
            
            return image_list
            
        except Exception as e:
            logging.error(f"Docker 이미지 목록 조회 오류: {e}")
            return []

class CICDPipeline:
    """CI/CD 파이프라인"""
    
    def __init__(self, k8s_manager: KubernetesManager, docker_manager: DockerManager):
        self.k8s_manager = k8s_manager
        self.docker_manager = docker_manager
        self.pipeline_history: List[Dict[str, Any]] = []
    
    async def run_pipeline(self, pipeline_config: Dict[str, Any]) -> Dict[str, Any]:
        """CI/CD 파이프라인 실행"""
        pipeline_id = str(uuid.uuid4())
        start_time = datetime.now()
        
        pipeline_result = {
            "pipeline_id": pipeline_id,
            "status": "running",
            "start_time": start_time.isoformat(),
            "stages": {},
            "config": pipeline_config
        }
        
        try:
            # 1. 소스 코드 체크아웃
            if "git" in pipeline_config:
                checkout_result = await self._checkout_source(pipeline_config["git"])
                pipeline_result["stages"]["checkout"] = checkout_result
                
                if not checkout_result["success"]:
                    raise Exception("소스 체크아웃 실패")
            
            # 2. 테스트 실행
            if "tests" in pipeline_config:
                test_result = await self._run_tests(pipeline_config["tests"])
                pipeline_result["stages"]["tests"] = test_result
                
                if not test_result["success"]:
                    raise Exception("테스트 실패")
            
            # 3. Docker 이미지 빌드
            if "build" in pipeline_config:
                build_result = await self._build_image(pipeline_config["build"])
                pipeline_result["stages"]["build"] = build_result
                
                if not build_result["success"]:
                    raise Exception("이미지 빌드 실패")
            
            # 4. 이미지 푸시
            if "push" in pipeline_config:
                push_result = await self._push_image(pipeline_config["push"])
                pipeline_result["stages"]["push"] = push_result
                
                if not push_result["success"]:
                    raise Exception("이미지 푸시 실패")
            
            # 5. Kubernetes 배포
            if "deploy" in pipeline_config:
                deploy_result = await self._deploy_to_kubernetes(pipeline_config["deploy"])
                pipeline_result["stages"]["deploy"] = deploy_result
                
                if not deploy_result["success"]:
                    raise Exception("Kubernetes 배포 실패")
            
            # 6. 배포 후 테스트
            if "post_deploy_tests" in pipeline_config:
                post_test_result = await self._run_post_deploy_tests(pipeline_config["post_deploy_tests"])
                pipeline_result["stages"]["post_deploy_tests"] = post_test_result
                
                if not post_test_result["success"]:
                    raise Exception("배포 후 테스트 실패")
            
            pipeline_result["status"] = "succeeded"
            
        except Exception as e:
            pipeline_result["status"] = "failed"
            pipeline_result["error"] = str(e)
            logging.error(f"파이프라인 실패: {e}")
        
        finally:
            end_time = datetime.now()
            pipeline_result["end_time"] = end_time.isoformat()
            pipeline_result["duration"] = (end_time - start_time).total_seconds()
            
            # 파이프라인 기록 저장
            self.pipeline_history.append(pipeline_result)
        
        return pipeline_result
    
    async def _checkout_source(self, git_config: Dict[str, Any]) -> Dict[str, Any]:
        """소스 코드 체크아웃"""
        try:
            repo_url = git_config["repository"]
            branch = git_config.get("branch", "main")
            target_dir = git_config.get("target_dir", "./source")
            
            # Git 클론
            repo = git.Repo.clone_from(repo_url, target_dir, branch=branch)
            
            commit_hash = repo.head.commit.hexsha
            
            return {
                "success": True,
                "commit_hash": commit_hash,
                "branch": branch,
                "target_dir": target_dir
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _run_tests(self, test_config: Dict[str, Any]) -> Dict[str, Any]:
        """테스트 실행"""
        try:
            test_command = test_config.get("command", "pytest")
            test_dir = test_config.get("directory", "./source")
            
            # 테스트 실행
            result = subprocess.run(
                test_command.split(),
                cwd=test_dir,
                capture_output=True,
                text=True
            )
            
            return {
                "success": result.returncode == 0,
                "exit_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _build_image(self, build_config: Dict[str, Any]) -> Dict[str, Any]:
        """Docker 이미지 빌드"""
        try:
            dockerfile = build_config.get("dockerfile", "./source/Dockerfile")
            image_name = build_config["image_name"]
            tag = build_config.get("tag", "latest")
            
            success = await self.docker_manager.build_image(dockerfile, image_name, tag)
            
            return {
                "success": success,
                "image_name": image_name,
                "tag": tag
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _push_image(self, push_config: Dict[str, Any]) -> Dict[str, Any]:
        """Docker 이미지 푸시"""
        try:
            image_name = push_config["image_name"]
            tag = push_config.get("tag", "latest")
            registry = push_config.get("registry")
            
            success = await self.docker_manager.push_image(image_name, tag, registry)
            
            return {
                "success": success,
                "image_name": image_name,
                "tag": tag,
                "registry": registry
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _deploy_to_kubernetes(self, deploy_config: Dict[str, Any]) -> Dict[str, Any]:
        """Kubernetes 배포"""
        try:
            # 배포 사양 생성
            deployment_spec = DeploymentSpec(
                name=deploy_config["name"],
                namespace=deploy_config.get("namespace", "default"),
                replicas=deploy_config.get("replicas", 1),
                containers=[
                    ContainerSpec(
                        name=deploy_config["name"],
                        image=deploy_config["image_name"],
                        tag=deploy_config.get("tag", "latest"),
                        ports=deploy_config.get("ports", [8080]),
                        env_vars=deploy_config.get("env_vars", {}),
                        resource_requests=deploy_config.get("resource_requests", {}),
                        resource_limits=deploy_config.get("resource_limits", {}),
                        health_check=deploy_config.get("health_check")
                    )
                ],
                labels={"app": deploy_config["name"]}
            )
            
            # 기존 배포 확인 및 업데이트/생성
            try:
                existing_deployment = await self.k8s_manager.get_deployment_status(
                    deployment_spec.name, deployment_spec.namespace
                )
                
                if "error" not in existing_deployment:
                    # 기존 배포 업데이트 (이미지 변경)
                    image_with_tag = f"{deploy_config['image_name']}:{deploy_config.get('tag', 'latest')}"
                    success = await self.k8s_manager.update_deployment_image(
                        deployment_spec.name, image_with_tag, deployment_spec.namespace
                    )
                else:
                    # 새 배포 생성
                    success = await self.k8s_manager.create_deployment(deployment_spec)
                
            except:
                # 새 배포 생성
                success = await self.k8s_manager.create_deployment(deployment_spec)
            
            # 서비스 생성 (필요한 경우)
            if "service" in deploy_config:
                service_config = deploy_config["service"]
                service_spec = ServiceSpec(
                    name=f"{deployment_spec.name}-service",
                    namespace=deployment_spec.namespace,
                    service_type=ServiceType(service_config.get("type", "ClusterIP")),
                    ports=[{
                        "port": port,
                        "target_port": port,
                        "name": f"port-{port}"
                    } for port in deploy_config.get("ports", [8080])],
                    selector={"app": deployment_spec.name}
                )
                
                await self.k8s_manager.create_service(service_spec)
            
            return {
                "success": success,
                "deployment_name": deployment_spec.name,
                "namespace": deployment_spec.namespace
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _run_post_deploy_tests(self, test_config: Dict[str, Any]) -> Dict[str, Any]:
        """배포 후 테스트"""
        try:
            # 배포 준비 대기
            await asyncio.sleep(30)  # 30초 대기
            
            # 헬스체크 테스트
            health_url = test_config.get("health_check_url")
            if health_url:
                async with aiohttp.ClientSession() as session:
                    async with session.get(health_url) as response:
                        if response.status == 200:
                            return {"success": True, "health_check": "passed"}
                        else:
                            return {"success": False, "health_check": f"failed with status {response.status}"}
            
            return {"success": True, "message": "배포 후 테스트 완료"}
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

class CloudNativeOrchestrator:
    """클라우드 네이티브 오케스트레이터"""
    
    def __init__(self, kubeconfig_path: Optional[str] = None):
        self.k8s_manager = KubernetesManager(kubeconfig_path)
        self.docker_manager = DockerManager()
        self.cicd_pipeline = CICDPipeline(self.k8s_manager, self.docker_manager)
        self.monitoring_active = False
        self.alerts: List[Dict[str, Any]] = []
    
    async def deploy_application(self, app_config: Dict[str, Any]) -> Dict[str, Any]:
        """애플리케이션 배포"""
        try:
            deployment_id = str(uuid.uuid4())
            
            # 배포 사양 생성
            deployment_spec = DeploymentSpec(
                name=app_config["name"],
                namespace=app_config.get("namespace", "default"),
                replicas=app_config.get("replicas", 1),
                containers=[
                    ContainerSpec(
                        name=container["name"],
                        image=container["image"],
                        tag=container.get("tag", "latest"),
                        ports=container.get("ports", []),
                        env_vars=container.get("env_vars", {}),
                        resource_requests=container.get("resource_requests", {}),
                        resource_limits=container.get("resource_limits", {}),
                        health_check=container.get("health_check")
                    )
                    for container in app_config.get("containers", [])
                ],
                labels=app_config.get("labels", {"app": app_config["name"]})
            )
            
            # 배포 생성
            deployment_success = await self.k8s_manager.create_deployment(deployment_spec)
            
            result = {
                "deployment_id": deployment_id,
                "deployment_success": deployment_success
            }
            
            # 서비스 생성
            if "service" in app_config:
                service_config = app_config["service"]
                service_spec = ServiceSpec(
                    name=f"{app_config['name']}-service",
                    namespace=app_config.get("namespace", "default"),
                    service_type=ServiceType(service_config.get("type", "ClusterIP")),
                    ports=service_config.get("ports", []),
                    selector={"app": app_config["name"]}
                )
                
                service_success = await self.k8s_manager.create_service(service_spec)
                result["service_success"] = service_success
            
            # HPA 생성
            if "autoscaling" in app_config:
                autoscaling_config = app_config["autoscaling"]
                hpa_spec = AutoScalingSpec(
                    name=f"{app_config['name']}-hpa",
                    deployment_name=app_config["name"],
                    namespace=app_config.get("namespace", "default"),
                    min_replicas=autoscaling_config.get("min_replicas", 1),
                    max_replicas=autoscaling_config.get("max_replicas", 10),
                    cpu_target=autoscaling_config.get("cpu_target", 80)
                )
                
                hpa_success = await self.k8s_manager.create_hpa(hpa_spec)
                result["hpa_success"] = hpa_success
            
            # 인그레스 생성
            if "ingress" in app_config:
                ingress_config = app_config["ingress"]
                ingress_spec = IngressSpec(
                    name=f"{app_config['name']}-ingress",
                    namespace=app_config.get("namespace", "default"),
                    host=ingress_config.get("host", ""),
                    paths=ingress_config.get("paths", []),
                    annotations=ingress_config.get("annotations", {})
                )
                
                ingress_success = await self.k8s_manager.create_ingress(ingress_spec)
                result["ingress_success"] = ingress_success
            
            return result
            
        except Exception as e:
            logging.error(f"애플리케이션 배포 오류: {e}")
            return {"error": str(e)}
    
    async def run_cicd_pipeline(self, pipeline_config: Dict[str, Any]) -> Dict[str, Any]:
        """CI/CD 파이프라인 실행"""
        return await self.cicd_pipeline.run_pipeline(pipeline_config)
    
    async def get_cluster_status(self) -> Dict[str, Any]:
        """클러스터 상태 조회"""
        try:
            # 노드 정보
            nodes = self.k8s_manager.v1_client.list_node()
            node_info = []
            
            for node in nodes.items:
                node_status = {
                    "name": node.metadata.name,
                    "ready": any(condition.type == "Ready" and condition.status == "True" 
                               for condition in node.status.conditions),
                    "roles": list(node.metadata.labels.get("kubernetes.io/role", "worker").split(",")),
                    "version": node.status.node_info.kubelet_version,
                    "os": node.status.node_info.os_image,
                    "capacity": {
                        "cpu": node.status.capacity.get("cpu"),
                        "memory": node.status.capacity.get("memory"),
                        "pods": node.status.capacity.get("pods")
                    }
                }
                node_info.append(node_status)
            
            # 네임스페이스 정보
            namespaces = self.k8s_manager.v1_client.list_namespace()
            namespace_info = [ns.metadata.name for ns in namespaces.items]
            
            # 전체 파드 수
            all_pods = self.k8s_manager.v1_client.list_pod_for_all_namespaces()
            pod_count = len(all_pods.items)
            running_pods = sum(1 for pod in all_pods.items if pod.status.phase == "Running")
            
            return {
                "cluster_info": {
                    "nodes": len(node_info),
                    "namespaces": len(namespace_info),
                    "total_pods": pod_count,
                    "running_pods": running_pods
                },
                "nodes": node_info,
                "namespaces": namespace_info,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"클러스터 상태 조회 오류: {e}")
            return {"error": str(e)}
    
    async def get_application_metrics(self, app_name: str, namespace: str = "default") -> Dict[str, Any]:
        """애플리케이션 메트릭스 조회"""
        try:
            # 디플로이먼트 상태
            deployment_status = await self.k8s_manager.get_deployment_status(app_name, namespace)
            
            # 서비스 상태
            try:
                service = self.k8s_manager.v1_client.read_namespaced_service(
                    name=f"{app_name}-service", namespace=namespace
                )
                service_info = {
                    "name": service.metadata.name,
                    "type": service.spec.type,
                    "cluster_ip": service.spec.cluster_ip,
                    "ports": [{"port": port.port, "target_port": port.target_port} 
                             for port in service.spec.ports]
                }
            except:
                service_info = None
            
            # HPA 상태
            try:
                hpa = self.k8s_manager.autoscaling_v1_client.read_namespaced_horizontal_pod_autoscaler(
                    name=f"{app_name}-hpa", namespace=namespace
                )
                hpa_info = {
                    "current_replicas": hpa.status.current_replicas,
                    "desired_replicas": hpa.status.desired_replicas,
                    "min_replicas": hpa.spec.min_replicas,
                    "max_replicas": hpa.spec.max_replicas,
                    "cpu_target": hpa.spec.target_cpu_utilization_percentage
                }
            except:
                hpa_info = None
            
            return {
                "application": app_name,
                "namespace": namespace,
                "deployment": deployment_status,
                "service": service_info,
                "autoscaling": hpa_info,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"애플리케이션 메트릭스 조회 오류: {e}")
            return {"error": str(e)}
    
    async def scale_application(self, app_name: str, replicas: int, namespace: str = "default") -> Dict[str, Any]:
        """애플리케이션 스케일링"""
        try:
            success = await self.k8s_manager.scale_deployment(app_name, replicas, namespace)
            
            return {
                "success": success,
                "application": app_name,
                "namespace": namespace,
                "replicas": replicas,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"애플리케이션 스케일링 오류: {e}")
            return {"error": str(e)}
    
    async def update_application(self, app_name: str, image: str, namespace: str = "default") -> Dict[str, Any]:
        """애플리케이션 업데이트"""
        try:
            success = await self.k8s_manager.update_deployment_image(app_name, image, namespace)
            
            return {
                "success": success,
                "application": app_name,
                "namespace": namespace,
                "new_image": image,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"애플리케이션 업데이트 오류: {e}")
            return {"error": str(e)}
    
    async def get_pipeline_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """파이프라인 기록 조회"""
        return self.cicd_pipeline.pipeline_history[-limit:]

# FastAPI 통합
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel

class DeployApplicationRequest(BaseModel):
    name: str
    namespace: str = "default"
    containers: List[Dict[str, Any]]
    replicas: int = 1
    service: Optional[Dict[str, Any]] = None
    autoscaling: Optional[Dict[str, Any]] = None
    ingress: Optional[Dict[str, Any]] = None
    labels: Optional[Dict[str, str]] = None

class RunPipelineRequest(BaseModel):
    git: Optional[Dict[str, Any]] = None
    tests: Optional[Dict[str, Any]] = None
    build: Optional[Dict[str, Any]] = None
    push: Optional[Dict[str, Any]] = None
    deploy: Optional[Dict[str, Any]] = None
    post_deploy_tests: Optional[Dict[str, Any]] = None

class ScaleApplicationRequest(BaseModel):
    replicas: int

class UpdateApplicationRequest(BaseModel):
    image: str

# 글로벌 오케스트레이터
orchestrator = None

async def get_orchestrator():
    global orchestrator
    if orchestrator is None:
        orchestrator = CloudNativeOrchestrator()
    return orchestrator

def create_cloud_native_app() -> FastAPI:
    app = FastAPI(title="Cloud Native Orchestration System", version="1.0.0")
    
    @app.post("/applications/deploy")
    async def deploy_application(request: DeployApplicationRequest):
        """애플리케이션 배포"""
        orch = await get_orchestrator()
        
        app_config = {
            "name": request.name,
            "namespace": request.namespace,
            "containers": request.containers,
            "replicas": request.replicas,
            "labels": request.labels or {"app": request.name}
        }
        
        if request.service:
            app_config["service"] = request.service
        if request.autoscaling:
            app_config["autoscaling"] = request.autoscaling
        if request.ingress:
            app_config["ingress"] = request.ingress
        
        result = await orch.deploy_application(app_config)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    
    @app.post("/pipelines/run")
    async def run_pipeline(request: RunPipelineRequest, background_tasks: BackgroundTasks):
        """CI/CD 파이프라인 실행"""
        orch = await get_orchestrator()
        
        pipeline_config = {}
        if request.git:
            pipeline_config["git"] = request.git
        if request.tests:
            pipeline_config["tests"] = request.tests
        if request.build:
            pipeline_config["build"] = request.build
        if request.push:
            pipeline_config["push"] = request.push
        if request.deploy:
            pipeline_config["deploy"] = request.deploy
        if request.post_deploy_tests:
            pipeline_config["post_deploy_tests"] = request.post_deploy_tests
        
        # 백그라운드에서 파이프라인 실행
        background_tasks.add_task(orch.run_cicd_pipeline, pipeline_config)
        
        return {"message": "파이프라인이 백그라운드에서 실행 중입니다"}
    
    @app.get("/cluster/status")
    async def get_cluster_status():
        """클러스터 상태 조회"""
        orch = await get_orchestrator()
        return await orch.get_cluster_status()
    
    @app.get("/applications/{app_name}/metrics")
    async def get_application_metrics(app_name: str, namespace: str = "default"):
        """애플리케이션 메트릭스 조회"""
        orch = await get_orchestrator()
        return await orch.get_application_metrics(app_name, namespace)
    
    @app.post("/applications/{app_name}/scale")
    async def scale_application(app_name: str, request: ScaleApplicationRequest, namespace: str = "default"):
        """애플리케이션 스케일링"""
        orch = await get_orchestrator()
        result = await orch.scale_application(app_name, request.replicas, namespace)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    
    @app.post("/applications/{app_name}/update")
    async def update_application(app_name: str, request: UpdateApplicationRequest, namespace: str = "default"):
        """애플리케이션 업데이트"""
        orch = await get_orchestrator()
        result = await orch.update_application(app_name, request.image, namespace)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    
    @app.get("/pipelines/history")
    async def get_pipeline_history(limit: int = 10):
        """파이프라인 기록 조회"""
        orch = await get_orchestrator()
        return await orch.get_pipeline_history(limit)
    
    @app.get("/health")
    async def health_check():
        """헬스 체크"""
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
    
    return app

if __name__ == "__main__":
    import uvicorn
    
    # 로깅 설정
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    app = create_cloud_native_app()
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8005,
        log_level="info"
    ) 