#!/usr/bin/env python3
"""
분산 처리 및 클러스터링 시스템 v9.0
- 분산 컴퓨팅 아키텍처
- 워커 노드 관리
- 작업 분산 및 로드 밸런싱
- 클러스터 상태 모니터링
- 장애 복구 및 자동 확장
"""

import asyncio
import json
import time
import logging
import hashlib
import threading
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, Callable, Union
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
from pathlib import Path
import queue
import multiprocessing
import socket
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass 
class WorkerNode:
    """워커 노드"""
    node_id: str
    host: str
    port: int
    status: str  # active, busy, idle, error, offline
    capabilities: List[str]
    current_load: float  # 0.0 - 1.0
    max_capacity: int
    current_tasks: int
    total_processed: int
    last_heartbeat: datetime
    metadata: Dict[str, Any]


@dataclass
class Task:
    """분산 작업"""
    task_id: str
    task_type: str
    priority: int  # 1(highest) - 5(lowest)
    payload: Any
    requirements: List[str]  # 필요한 능력
    estimated_duration: float  # 예상 처리 시간 (초)
    max_retries: int
    retry_count: int
    created_at: datetime
    assigned_node: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: str = "pending"  # pending, assigned, running, completed, failed
    result: Optional[Any] = None
    error_message: Optional[str] = None


@dataclass
class ClusterMetrics:
    """클러스터 메트릭스"""
    total_nodes: int
    active_nodes: int
    total_capacity: int
    current_load: float
    pending_tasks: int
    running_tasks: int
    completed_tasks: int
    failed_tasks: int
    avg_task_duration: float
    throughput_per_second: float
    last_updated: datetime


class TaskScheduler:
    """작업 스케줄러"""
    
    def __init__(self):
        self.pending_queue = queue.PriorityQueue()
        self.running_tasks: Dict[str, Task] = {}
        self.completed_tasks: Dict[str, Task] = {}
        self.failed_tasks: Dict[str, Task] = {}
        
    def submit_task(self, task: Task):
        """작업 제출"""
        # 우선순위 큐에 추가 (낮은 숫자가 높은 우선순위)
        self.pending_queue.put((task.priority, task.created_at, task))
        logger.info(f"작업 제출: {task.task_id} (우선순위: {task.priority})")
        
    def get_next_task(self) -> Optional[Task]:
        """다음 작업 가져오기"""
        try:
            priority, created_at, task = self.pending_queue.get_nowait()
            return task
        except queue.Empty:
            return None
            
    def assign_task(self, task: Task, node_id: str):
        """작업 할당"""
        task.assigned_node = node_id
        task.status = "assigned"
        task.started_at = datetime.now()
        self.running_tasks[task.task_id] = task
        
    def complete_task(self, task_id: str, result: Any):
        """작업 완료"""
        if task_id in self.running_tasks:
            task = self.running_tasks.pop(task_id)
            task.status = "completed"
            task.completed_at = datetime.now()
            task.result = result
            self.completed_tasks[task_id] = task
            logger.info(f"작업 완료: {task_id}")
            
    def fail_task(self, task_id: str, error_message: str):
        """작업 실패"""
        if task_id in self.running_tasks:
            task = self.running_tasks.pop(task_id)
            task.retry_count += 1
            
            if task.retry_count < task.max_retries:
                # 재시도
                task.status = "pending"
                task.assigned_node = None
                task.started_at = None
                self.pending_queue.put((task.priority, task.created_at, task))
                logger.warning(f"작업 재시도: {task_id} ({task.retry_count}/{task.max_retries})")
            else:
                # 최종 실패
                task.status = "failed"
                task.error_message = error_message
                self.failed_tasks[task_id] = task
                logger.error(f"작업 최종 실패: {task_id} - {error_message}")
                
    def get_task_status(self, task_id: str) -> Optional[Task]:
        """작업 상태 조회"""
        for task_dict in [self.running_tasks, self.completed_tasks, self.failed_tasks]:
            if task_id in task_dict:
                return task_dict[task_id]
                
        # 대기 큐에서 검색
        temp_queue = queue.Queue()
        found_task = None
        
        while not self.pending_queue.empty():
            item = self.pending_queue.get()
            temp_queue.put(item)
            if item[2].task_id == task_id:
                found_task = item[2]
                
        # 큐 복원
        while not temp_queue.empty():
            self.pending_queue.put(temp_queue.get())
            
        return found_task


class WorkerManager:
    """워커 관리자"""
    
    def __init__(self):
        self.workers: Dict[str, WorkerNode] = {}
        self.heartbeat_timeout = 30  # 30초
        
    def register_worker(self, worker: WorkerNode):
        """워커 등록"""
        self.workers[worker.node_id] = worker
        logger.info(f"워커 등록: {worker.node_id} ({worker.host}:{worker.port})")
        
    def unregister_worker(self, node_id: str):
        """워커 등록 해제"""
        if node_id in self.workers:
            del self.workers[node_id]
            logger.info(f"워커 등록 해제: {node_id}")
            
    def update_worker_heartbeat(self, node_id: str, load: float, current_tasks: int):
        """워커 하트비트 업데이트"""
        if node_id in self.workers:
            worker = self.workers[node_id]
            worker.last_heartbeat = datetime.now()
            worker.current_load = load
            worker.current_tasks = current_tasks
            
            # 상태 업데이트
            if current_tasks >= worker.max_capacity:
                worker.status = "busy"
            elif current_tasks > 0:
                worker.status = "active"
            else:
                worker.status = "idle"
                
    def get_available_workers(self, requirements: List[str] = None) -> List[WorkerNode]:
        """사용 가능한 워커 목록"""
        available = []
        
        for worker in self.workers.values():
            # 타임아웃 체크
            if (datetime.now() - worker.last_heartbeat).seconds > self.heartbeat_timeout:
                worker.status = "offline"
                continue
                
            # 상태 체크
            if worker.status not in ["idle", "active"]:
                continue
                
            # 용량 체크
            if worker.current_tasks >= worker.max_capacity:
                continue
                
            # 요구사항 체크
            if requirements:
                if not all(req in worker.capabilities for req in requirements):
                    continue
                    
            available.append(worker)
            
        # 로드 순으로 정렬 (낮은 로드가 우선)
        available.sort(key=lambda w: w.current_load)
        
        return available
        
    def select_best_worker(self, task: Task) -> Optional[WorkerNode]:
        """최적 워커 선택"""
        
        available_workers = self.get_available_workers(task.requirements)
        
        if not available_workers:
            return None
            
        # 로드 밸런싱: 현재 로드가 가장 낮은 워커 선택
        best_worker = min(available_workers, key=lambda w: w.current_load)
        
        return best_worker
        
    def get_cluster_health(self) -> Dict[str, Any]:
        """클러스터 상태"""
        
        total_nodes = len(self.workers)
        active_nodes = len([w for w in self.workers.values() 
                           if w.status in ["idle", "active", "busy"]])
        
        total_capacity = sum(w.max_capacity for w in self.workers.values())
        current_tasks = sum(w.current_tasks for w in self.workers.values())
        current_load = current_tasks / total_capacity if total_capacity > 0 else 0
        
        status_counts = defaultdict(int)
        for worker in self.workers.values():
            status_counts[worker.status] += 1
            
        return {
            'total_nodes': total_nodes,
            'active_nodes': active_nodes,
            'total_capacity': total_capacity,
            'current_load': current_load,
            'status_distribution': dict(status_counts),
            'nodes': [asdict(worker) for worker in self.workers.values()]
        }


class DistributedClusteringSystem:
    """분산 클러스터링 시스템"""
    
    def __init__(self, master_host: str = "localhost", master_port: int = 9000):
        self.master_host = master_host
        self.master_port = master_port
        self.is_master = True
        
        # 핵심 컴포넌트
        self.task_scheduler = TaskScheduler()
        self.worker_manager = WorkerManager()
        
        # 메트릭스
        self.metrics = ClusterMetrics(
            total_nodes=0,
            active_nodes=0,
            total_capacity=0,
            current_load=0.0,
            pending_tasks=0,
            running_tasks=0,
            completed_tasks=0,
            failed_tasks=0,
            avg_task_duration=0.0,
            throughput_per_second=0.0,
            last_updated=datetime.now()
        )
        
        # 실행 상태
        self.is_running = False
        self.background_tasks = []
        
        # 작업 처리 함수 등록
        self.task_processors: Dict[str, Callable] = {}
        
        logger.info(f"분산 클러스터링 시스템 초기화 (마스터: {master_host}:{master_port})")
        
    def register_task_processor(self, task_type: str, processor_func: Callable):
        """작업 처리기 등록"""
        self.task_processors[task_type] = processor_func
        logger.info(f"작업 처리기 등록: {task_type}")
        
    async def start_master(self):
        """마스터 노드 시작"""
        
        if not self.is_master:
            raise RuntimeError("마스터 모드가 아닙니다")
            
        self.is_running = True
        
        # 백그라운드 태스크 시작
        tasks = [
            asyncio.create_task(self._master_task_dispatcher()),
            asyncio.create_task(self._master_health_monitor()),
            asyncio.create_task(self._metrics_updater()),
            asyncio.create_task(self._start_master_server())
        ]
        
        self.background_tasks.extend(tasks)
        
        logger.info("마스터 노드 시작 완료")
        
    async def start_worker(self, worker_config: Dict[str, Any]):
        """워커 노드 시작"""
        
        self.is_master = False
        self.worker_config = worker_config
        self.is_running = True
        
        # 워커 정보 생성
        self.worker_info = WorkerNode(
            node_id=worker_config.get('node_id', f"worker_{uuid.uuid4().hex[:8]}"),
            host=worker_config.get('host', socket.gethostname()),
            port=worker_config.get('port', 9001),
            status="idle",
            capabilities=worker_config.get('capabilities', ['general']),
            current_load=0.0,
            max_capacity=worker_config.get('max_capacity', 4),
            current_tasks=0,
            total_processed=0,
            last_heartbeat=datetime.now(),
            metadata=worker_config.get('metadata', {})
        )
        
        # 백그라운드 태스크 시작
        tasks = [
            asyncio.create_task(self._worker_heartbeat_sender()),
            asyncio.create_task(self._worker_task_executor()),
            asyncio.create_task(self._start_worker_server())
        ]
        
        self.background_tasks.extend(tasks)
        
        logger.info(f"워커 노드 시작: {self.worker_info.node_id}")
        
    async def stop(self):
        """시스템 중지"""
        
        self.is_running = False
        
        # 모든 백그라운드 태스크 취소
        for task in self.background_tasks:
            task.cancel()
            
        # 태스크 완료 대기
        await asyncio.gather(*self.background_tasks, return_exceptions=True)
        
        logger.info("분산 클러스터링 시스템 중지")
        
    def submit_task(self, task_type: str, payload: Any, 
                   priority: int = 3, requirements: List[str] = None,
                   estimated_duration: float = 10.0) -> str:
        """작업 제출"""
        
        if not self.is_master:
            raise RuntimeError("워커 노드에서는 작업을 제출할 수 없습니다")
            
        task_id = f"task_{int(time.time())}_{uuid.uuid4().hex[:8]}"
        
        task = Task(
            task_id=task_id,
            task_type=task_type,
            priority=priority,
            payload=payload,
            requirements=requirements or ['general'],
            estimated_duration=estimated_duration,
            max_retries=3,
            retry_count=0,
            created_at=datetime.now()
        )
        
        self.task_scheduler.submit_task(task)
        
        return task_id
        
    def get_task_result(self, task_id: str) -> Optional[Task]:
        """작업 결과 조회"""
        return self.task_scheduler.get_task_status(task_id)
        
    async def _master_task_dispatcher(self):
        """마스터: 작업 분배기"""
        
        while self.is_running:
            try:
                # 대기 중인 작업 가져오기
                task = self.task_scheduler.get_next_task()
                
                if task is None:
                    await asyncio.sleep(0.1)
                    continue
                    
                # 적절한 워커 선택
                worker = self.worker_manager.select_best_worker(task)
                
                if worker is None:
                    # 사용 가능한 워커가 없으면 다시 큐에 넣기
                    self.task_scheduler.pending_queue.put((task.priority, task.created_at, task))
                    await asyncio.sleep(1.0)
                    continue
                    
                # 작업 할당
                self.task_scheduler.assign_task(task, worker.node_id)
                
                # 워커에게 작업 전송 (실제로는 네트워크 통신)
                await self._send_task_to_worker(worker, task)
                
                logger.info(f"작업 분배: {task.task_id} → {worker.node_id}")
                
            except Exception as e:
                logger.error(f"작업 분배 오류: {e}")
                await asyncio.sleep(1.0)
                
    async def _send_task_to_worker(self, worker: WorkerNode, task: Task):
        """워커에게 작업 전송"""
        
        # 실제로는 네트워크 통신으로 작업 전송
        # 여기서는 시뮬레이션
        
        worker.current_tasks += 1
        worker.current_load = worker.current_tasks / worker.max_capacity
        
        # 작업 실행 시뮬레이션
        asyncio.create_task(self._simulate_worker_execution(worker, task))
        
    async def _simulate_worker_execution(self, worker: WorkerNode, task: Task):
        """워커 작업 실행 시뮬레이션"""
        
        try:
            # 작업 실행 시간 시뮬레이션
            execution_time = task.estimated_duration + random.uniform(-2, 2)
            await asyncio.sleep(max(0.1, execution_time))
            
            # 작업 처리
            if task.task_type in self.task_processors:
                result = await self._execute_task_local(task)
                self.task_scheduler.complete_task(task.task_id, result)
            else:
                # 기본 처리
                result = f"Processed {task.task_type} with payload: {task.payload}"
                self.task_scheduler.complete_task(task.task_id, result)
                
            # 워커 상태 업데이트
            worker.current_tasks -= 1
            worker.total_processed += 1
            worker.current_load = worker.current_tasks / worker.max_capacity
            
            logger.debug(f"작업 실행 완료: {task.task_id} (워커: {worker.node_id})")
            
        except Exception as e:
            self.task_scheduler.fail_task(task.task_id, str(e))
            worker.current_tasks -= 1
            worker.current_load = worker.current_tasks / worker.max_capacity
            logger.error(f"작업 실행 실패: {task.task_id} - {e}")
            
    async def _execute_task_local(self, task: Task) -> Any:
        """로컬 작업 실행"""
        
        processor = self.task_processors[task.task_type]
        
        if asyncio.iscoroutinefunction(processor):
            return await processor(task.payload)
        else:
            # 동기 함수를 비동기로 실행
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, processor, task.payload)
            
    async def _master_health_monitor(self):
        """마스터: 워커 상태 모니터링"""
        
        while self.is_running:
            try:
                current_time = datetime.now()
                
                # 타임아웃된 워커 감지
                timeout_workers = []
                for worker in self.worker_manager.workers.values():
                    if (current_time - worker.last_heartbeat).seconds > self.worker_manager.heartbeat_timeout:
                        if worker.status != "offline":
                            worker.status = "offline"
                            timeout_workers.append(worker.node_id)
                            
                if timeout_workers:
                    logger.warning(f"타임아웃된 워커: {timeout_workers}")
                    
                # 실행 중인 작업 중 오프라인 워커의 작업 재스케줄링
                for task in list(self.task_scheduler.running_tasks.values()):
                    if task.assigned_node in timeout_workers:
                        self.task_scheduler.fail_task(
                            task.task_id, 
                            f"워커 타임아웃: {task.assigned_node}"
                        )
                        
                await asyncio.sleep(10)  # 10초마다 체크
                
            except Exception as e:
                logger.error(f"상태 모니터링 오류: {e}")
                await asyncio.sleep(5)
                
    async def _metrics_updater(self):
        """메트릭스 업데이트"""
        
        while self.is_running:
            try:
                cluster_health = self.worker_manager.get_cluster_health()
                
                self.metrics.total_nodes = cluster_health['total_nodes']
                self.metrics.active_nodes = cluster_health['active_nodes']
                self.metrics.total_capacity = cluster_health['total_capacity']
                self.metrics.current_load = cluster_health['current_load']
                
                self.metrics.pending_tasks = self.task_scheduler.pending_queue.qsize()
                self.metrics.running_tasks = len(self.task_scheduler.running_tasks)
                self.metrics.completed_tasks = len(self.task_scheduler.completed_tasks)
                self.metrics.failed_tasks = len(self.task_scheduler.failed_tasks)
                
                # 평균 작업 시간 계산
                completed_tasks = list(self.task_scheduler.completed_tasks.values())
                if completed_tasks:
                    durations = [
                        (task.completed_at - task.started_at).total_seconds()
                        for task in completed_tasks 
                        if task.started_at and task.completed_at
                    ]
                    self.metrics.avg_task_duration = sum(durations) / len(durations) if durations else 0
                    
                self.metrics.last_updated = datetime.now()
                
                await asyncio.sleep(5)  # 5초마다 업데이트
                
            except Exception as e:
                logger.error(f"메트릭스 업데이트 오류: {e}")
                await asyncio.sleep(5)
                
    async def _worker_heartbeat_sender(self):
        """워커: 하트비트 전송"""
        
        while self.is_running:
            try:
                # 마스터에게 하트비트 전송 (시뮬레이션)
                self.worker_manager.update_worker_heartbeat(
                    self.worker_info.node_id,
                    self.worker_info.current_load,
                    self.worker_info.current_tasks
                )
                
                await asyncio.sleep(5)  # 5초마다 전송
                
            except Exception as e:
                logger.error(f"하트비트 전송 오류: {e}")
                await asyncio.sleep(5)
                
    async def _worker_task_executor(self):
        """워커: 작업 실행기"""
        
        while self.is_running:
            try:
                # 실제로는 마스터로부터 작업을 받아서 실행
                # 여기서는 시뮬레이션을 위해 로컬에서 처리
                
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"작업 실행 오류: {e}")
                await asyncio.sleep(1)
                
    async def _start_master_server(self):
        """마스터 서버 시작"""
        
        # 실제로는 웹서버나 TCP 서버 구현
        logger.info(f"마스터 서버 시작: {self.master_host}:{self.master_port}")
        
        while self.is_running:
            await asyncio.sleep(1)
            
    async def _start_worker_server(self):
        """워커 서버 시작"""
        
        # 실제로는 마스터와 통신하는 클라이언트 구현
        logger.info(f"워커 서버 시작: {self.worker_info.host}:{self.worker_info.port}")
        
        while self.is_running:
            await asyncio.sleep(1)
            
    def get_cluster_status(self) -> Dict[str, Any]:
        """클러스터 상태 조회"""
        
        cluster_health = self.worker_manager.get_cluster_health()
        
        return {
            'is_master': self.is_master,
            'is_running': self.is_running,
            'metrics': asdict(self.metrics),
            'cluster_health': cluster_health,
            'task_summary': {
                'pending': self.task_scheduler.pending_queue.qsize(),
                'running': len(self.task_scheduler.running_tasks),
                'completed': len(self.task_scheduler.completed_tasks),
                'failed': len(self.task_scheduler.failed_tasks)
            },
            'registered_processors': list(self.task_processors.keys())
        }
        
    def scale_cluster(self, target_nodes: int):
        """클러스터 확장"""
        
        current_nodes = len(self.worker_manager.workers)
        
        if target_nodes > current_nodes:
            # 노드 추가 (실제로는 자동 프로비저닝)
            for i in range(target_nodes - current_nodes):
                new_worker = WorkerNode(
                    node_id=f"auto_worker_{uuid.uuid4().hex[:8]}",
                    host="auto-provisioned",
                    port=9000 + i,
                    status="idle",
                    capabilities=['general'],
                    current_load=0.0,
                    max_capacity=4,
                    current_tasks=0,
                    total_processed=0,
                    last_heartbeat=datetime.now(),
                    metadata={'auto_provisioned': True}
                )
                
                self.worker_manager.register_worker(new_worker)
                
            logger.info(f"클러스터 확장: {current_nodes} → {target_nodes} 노드")
            
        elif target_nodes < current_nodes:
            # 노드 제거 (유휴 노드부터)
            workers_to_remove = []
            for worker in self.worker_manager.workers.values():
                if len(workers_to_remove) >= (current_nodes - target_nodes):
                    break
                if worker.status == "idle" and worker.current_tasks == 0:
                    workers_to_remove.append(worker.node_id)
                    
            for node_id in workers_to_remove:
                self.worker_manager.unregister_worker(node_id)
                
            logger.info(f"클러스터 축소: {current_nodes} → {len(self.worker_manager.workers)} 노드")


# 테스트용 작업 처리기들
async def text_processing_task(payload: Dict[str, Any]) -> str:
    """텍스트 처리 작업"""
    text = payload.get('text', '')
    operation = payload.get('operation', 'count')
    
    # 시뮬레이션 지연
    await asyncio.sleep(1.0)
    
    if operation == 'count':
        return f"텍스트 길이: {len(text)}"
    elif operation == 'uppercase':
        return text.upper()
    elif operation == 'tokenize':
        return text.split()
    else:
        return f"알 수 없는 작업: {operation}"


def data_analysis_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    """데이터 분석 작업 (동기)"""
    import random
    import time
    
    data = payload.get('data', [])
    analysis_type = payload.get('type', 'summary')
    
    # 처리 시뮬레이션
    time.sleep(random.uniform(0.5, 2.0))
    
    if analysis_type == 'summary':
        return {
            'count': len(data),
            'sum': sum(data) if data else 0,
            'avg': sum(data) / len(data) if data else 0
        }
    elif analysis_type == 'stats':
        return {
            'min': min(data) if data else 0,
            'max': max(data) if data else 0,
            'count': len(data)
        }
    else:
        return {'error': f'Unknown analysis type: {analysis_type}'}


# 사용 예시 및 테스트
async def test_distributed_clustering():
    """분산 클러스터링 시스템 테스트"""
    
    print("🌐 분산 처리 및 클러스터링 시스템 테스트")
    print("=" * 60)
    
    # 마스터 노드 생성
    master = DistributedClusteringSystem()
    
    # 작업 처리기 등록
    master.register_task_processor('text_processing', text_processing_task)
    master.register_task_processor('data_analysis', data_analysis_task)
    
    print("1. 마스터 노드 시작...")
    await master.start_master()
    
    # 워커 노드들 생성 및 등록 (시뮬레이션)
    print("2. 워커 노드 등록...")
    
    worker_configs = [
        {
            'node_id': 'worker_001',
            'host': 'worker1.local',
            'port': 9001,
            'capabilities': ['text_processing', 'general'],
            'max_capacity': 3
        },
        {
            'node_id': 'worker_002', 
            'host': 'worker2.local',
            'port': 9002,
            'capabilities': ['data_analysis', 'general'],
            'max_capacity': 4
        },
        {
            'node_id': 'worker_003',
            'host': 'worker3.local', 
            'port': 9003,
            'capabilities': ['text_processing', 'data_analysis', 'general'],
            'max_capacity': 2
        }
    ]
    
    for config in worker_configs:
        worker_node = WorkerNode(
            node_id=config['node_id'],
            host=config['host'],
            port=config['port'],
            status="idle",
            capabilities=config['capabilities'],
            current_load=0.0,
            max_capacity=config['max_capacity'],
            current_tasks=0,
            total_processed=0,
            last_heartbeat=datetime.now(),
            metadata={}
        )
        
        master.worker_manager.register_worker(worker_node)
        
    print(f"   워커 {len(worker_configs)}개 등록 완료")
    
    # 초기 클러스터 상태
    print("\n3. 초기 클러스터 상태:")
    status = master.get_cluster_status()
    
    print(f"   총 노드: {status['cluster_health']['total_nodes']}개")
    print(f"   활성 노드: {status['cluster_health']['active_nodes']}개")
    print(f"   총 용량: {status['cluster_health']['total_capacity']}")
    print(f"   현재 로드: {status['cluster_health']['current_load']:.1%}")
    
    # 작업 제출
    print("\n4. 작업 제출 테스트...")
    
    task_ids = []
    
    # 텍스트 처리 작업들
    for i in range(5):
        task_id = master.submit_task(
            task_type='text_processing',
            payload={
                'text': f'안녕하세요! 이것은 테스트 메시지 {i+1}번입니다. 시공사 관련 내용을 포함합니다.',
                'operation': 'count'
            },
            priority=2,
            requirements=['text_processing']
        )
        task_ids.append(task_id)
        
    # 데이터 분석 작업들
    for i in range(3):
        import random
        test_data = [random.randint(1, 100) for _ in range(10)]
        
        task_id = master.submit_task(
            task_type='data_analysis',
            payload={
                'data': test_data,
                'type': 'summary'
            },
            priority=1,
            requirements=['data_analysis']
        )
        task_ids.append(task_id)
        
    print(f"   작업 {len(task_ids)}개 제출 완료")
    
    # 작업 처리 대기
    print("\n5. 작업 처리 대기 중... (15초)")
    
    for i in range(15):
        await asyncio.sleep(1)
        if i % 5 == 4:  # 5초마다 상태 출력
            current_status = master.get_cluster_status()
            metrics = current_status['metrics']
            print(f"   진행 상황: 대기 {metrics['pending_tasks']}, "
                  f"실행 중 {metrics['running_tasks']}, "
                  f"완료 {metrics['completed_tasks']}, "
                  f"실패 {metrics['failed_tasks']}")
            
    # 결과 확인
    print("\n6. 작업 결과 확인:")
    
    completed_count = 0
    for task_id in task_ids[:5]:  # 처음 5개만 확인
        task = master.get_task_result(task_id)
        if task:
            print(f"   {task.task_id}: {task.status}")
            if task.status == "completed":
                completed_count += 1
                print(f"     결과: {task.result}")
            elif task.status == "failed":
                print(f"     오류: {task.error_message}")
                
    print(f"   완료율: {completed_count}/{len(task_ids[:5])} ({completed_count/5:.1%})")
    
    # 클러스터 확장 테스트
    print("\n7. 클러스터 확장 테스트...")
    
    print("   현재 클러스터 크기:", len(master.worker_manager.workers))
    master.scale_cluster(5)  # 5개 노드로 확장
    print("   확장 후 클러스터 크기:", len(master.worker_manager.workers))
    
    # 추가 작업 부하 테스트
    print("\n8. 부하 테스트...")
    
    bulk_task_ids = []
    for i in range(10):
        task_id = master.submit_task(
            task_type='text_processing',
            payload={
                'text': f'부하 테스트 메시지 {i+1}',
                'operation': 'uppercase'
            },
            priority=3
        )
        bulk_task_ids.append(task_id)
        
    print(f"   부하 테스트 작업 {len(bulk_task_ids)}개 제출")
    
    # 처리 대기
    await asyncio.sleep(10)
    
    # 최종 상태
    print("\n9. 최종 클러스터 상태:")
    final_status = master.get_cluster_status()
    final_metrics = final_status['metrics']
    
    print(f"   총 처리된 작업: {final_metrics['completed_tasks']}개")
    print(f"   실패한 작업: {final_metrics['failed_tasks']}개")
    print(f"   평균 처리 시간: {final_metrics['avg_task_duration']:.2f}초")
    print(f"   현재 클러스터 로드: {final_metrics['current_load']:.1%}")
    
    # 워커별 성능
    print("\n   워커별 성능:")
    for worker in master.worker_manager.workers.values():
        print(f"     {worker.node_id}: {worker.total_processed}개 처리 "
              f"(현재 로드: {worker.current_load:.1%})")
              
    print("\n10. 시스템 종료...")
    await master.stop()
    
    print("\n🏆 분산 처리 및 클러스터링 시스템 테스트 완료!")


if __name__ == "__main__":
    import random  # 테스트용
    
    try:
        asyncio.run(test_distributed_clustering())
    except KeyboardInterrupt:
        print("\n사용자에 의해 중단됨")
    except Exception as e:
        print(f"\n오류 발생: {e}")
        logging.exception("시스템 오류") 