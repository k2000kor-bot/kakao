import logging
import asyncio
import json
import random
import math
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timezone
from dataclasses import dataclass, field
from enum import Enum

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import aiohttp

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Universal AI Orchestrator",
    description="범용 AI 오케스트레이터 - 모든 AI 시스템을 통합 관리하고 조율",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

class SystemStatus(Enum):
    """시스템 상태"""
    ONLINE = "online"
    OFFLINE = "offline"
    DEGRADED = "degraded"
    MAINTENANCE = "maintenance"
    EVOLVING = "evolving"

class OrchestrationMode(Enum):
    """오케스트레이션 모드"""
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    ADAPTIVE = "adaptive"
    COLLABORATIVE = "collaborative"
    EMERGENT = "emergent"

class TaskPriority(Enum):
    """작업 우선순위"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    TRANSCENDENT = "transcendent"

@dataclass
class AISystem:
    """AI 시스템 정보"""
    system_id: str
    name: str
    url: str
    port: int
    status: SystemStatus = SystemStatus.OFFLINE
    capabilities: List[str] = field(default_factory=list)
    performance_metrics: Dict[str, float] = field(default_factory=dict)
    last_health_check: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    response_time: float = 0.0
    success_rate: float = 0.0
    load_factor: float = 0.0

@dataclass
class OrchestrationTask:
    """오케스트레이션 작업"""
    task_id: str
    request_data: Dict[str, Any]
    target_systems: List[str]
    orchestration_mode: OrchestrationMode
    priority: TaskPriority
    status: str = "pending"
    results: Dict[str, Any] = field(default_factory=dict)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    error_log: List[str] = field(default_factory=list)

@dataclass
class SystemPerformance:
    """시스템 성능"""
    system_id: str
    response_time_avg: float
    success_rate: float
    throughput: float
    error_rate: float
    cpu_usage: float
    memory_usage: float
    last_updated: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

class UniversalAIOrchestrator:
    """범용 AI 오케스트레이터"""
    
    def __init__(self):
        self.ai_systems: Dict[str, AISystem] = {}
        self.orchestration_tasks: List[OrchestrationTask] = []
        self.system_performance: Dict[str, SystemPerformance] = {}
        self.session: Optional[aiohttp.ClientSession] = None
        
        # 오케스트레이션 설정
        self.max_parallel_tasks = 10
        self.task_timeout = 30.0
        self.health_check_interval = 60.0
        self.performance_monitoring = True
        
        # 초기화
        self._initialize_ai_systems()
        
        logger.info("범용 AI 오케스트레이터 초기화 완료")
    
    def _initialize_ai_systems(self):
        """AI 시스템 초기화"""
        system_configs = [
            {
                "system_id": "neural_processing",
                "name": "고급 신경망 처리 시스템",
                "url": "http://localhost:8011",
                "port": 8011,
                "capabilities": ["neural_networks", "pattern_recognition", "deep_learning"]
            },
            {
                "system_id": "quantum_algorithms",
                "name": "양자 영감 알고리즘 시스템",
                "url": "http://localhost:8012",
                "port": 8012,
                "capabilities": ["quantum_optimization", "quantum_gates", "quantum_annealing"]
            },
            {
                "system_id": "cognitive_architecture",
                "name": "인지 아키텍처 시스템",
                "url": "http://localhost:8013",
                "port": 8013,
                "capabilities": ["cognitive_modeling", "metacognition", "bias_detection"]
            },
            {
                "system_id": "transcendent_ai",
                "name": "초월적 AI 시스템",
                "url": "http://localhost:8014",
                "port": 8014,
                "capabilities": ["transcendent_processing", "consciousness", "wisdom_integration"]
            },
            {
                "system_id": "ai_evolution",
                "name": "AI 진화 시스템",
                "url": "http://localhost:8015",
                "port": 8015,
                "capabilities": ["ai_evolution", "self_organization", "emergent_behavior"]
            },
            {
                "system_id": "ultimate_integration",
                "name": "궁극의 AI 통합 시스템",
                "url": "http://localhost:8016",
                "port": 8016,
                "capabilities": ["system_integration", "multi_dimensional_processing"]
            },
            {
                "system_id": "final_unified",
                "name": "최종 통합 AI 시스템",
                "url": "http://localhost:8017",
                "port": 8017,
                "capabilities": ["yoo_style_response", "transcendent_processing", "evolutionary_learning"]
            },
            {
                "system_id": "consciousness_ai",
                "name": "궁극의 의식 AI 시스템",
                "url": "http://localhost:8018",
                "port": 8018,
                "capabilities": ["consciousness", "wisdom_insights", "creative_breakthroughs"]
            },
            {
                "system_id": "quantum_consciousness",
                "name": "양자 의식 AI 시스템",
                "url": "http://localhost:8021",
                "port": 8021,
                "capabilities": ["quantum_mechanics", "consciousness_integration", "quantum_entanglement", "superposition"]
            }
        ]
        
        for config in system_configs:
            self.ai_systems[config["system_id"]] = AISystem(
                system_id=config["system_id"],
                name=config["name"],
                url=config["url"],
                port=config["port"],
                capabilities=config["capabilities"]
            )
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def orchestrate_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """요청 오케스트레이션"""
        logger.info(f"오케스트레이션 요청 시작: {request_data.get('question', '')[:50]}...")
        
        # 오케스트레이션 전략 결정
        orchestration_strategy = await self._determine_orchestration_strategy(request_data)
        
        # 대상 시스템 선택
        target_systems = await self._select_target_systems(request_data, orchestration_strategy)
        
        # 작업 생성
        task = OrchestrationTask(
            task_id=f"task_{len(self.orchestration_tasks) + 1}_{int(datetime.now().timestamp())}",
            request_data=request_data,
            target_systems=target_systems,
            orchestration_mode=orchestration_strategy["mode"],
            priority=orchestration_strategy["priority"]
        )
        
        self.orchestration_tasks.append(task)
        
        # 오케스트레이션 실행
        orchestration_result = await self._execute_orchestration(task)
        
        # 결과 통합
        integrated_result = await self._integrate_results(task, orchestration_result)
        
        # 성능 업데이트
        await self._update_system_performance(task, orchestration_result)
        
        logger.info(f"오케스트레이션 완료: {task.task_id}")
        return integrated_result
    
    async def _determine_orchestration_strategy(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """오케스트레이션 전략 결정"""
        question = request_data.get("question", "").lower()
        complexity = request_data.get("complexity", "medium")
        domain = request_data.get("domain", "general")
        
        # 복잡도 기반 우선순위 결정
        priority_map = {
            "low": TaskPriority.LOW,
            "medium": TaskPriority.MEDIUM,
            "high": TaskPriority.HIGH,
            "very_high": TaskPriority.CRITICAL
        }
        
        # 특별한 키워드 감지
        transcendent_keywords = ["의식", "창의성", "지혜", "초월", "통합", "진화"]
        if any(keyword in question for keyword in transcendent_keywords):
            priority = TaskPriority.TRANSCENDENT
        else:
            priority = priority_map.get(complexity, TaskPriority.MEDIUM)
        
        # 오케스트레이션 모드 결정
        if complexity == "very_high" or priority == TaskPriority.TRANSCENDENT:
            mode = OrchestrationMode.COLLABORATIVE
        elif complexity == "high":
            mode = OrchestrationMode.ADAPTIVE
        elif "통합" in question or "종합" in question:
            mode = OrchestrationMode.PARALLEL
        else:
            mode = OrchestrationMode.SEQUENTIAL
        
        return {
            "mode": mode,
            "priority": priority,
            "complexity": complexity,
            "domain": domain
        }
    
    async def _select_target_systems(self, request_data: Dict[str, Any], strategy: Dict[str, Any]) -> List[str]:
        """대상 시스템 선택"""
        question = request_data.get("question", "").lower()
        domain = request_data.get("domain", "general")
        complexity = strategy["complexity"]
        
        selected_systems = []
        
        # 기본 시스템들
        if complexity in ["high", "very_high"]:
            selected_systems.extend(["consciousness_ai", "transcendent_ai"])
        
        # 도메인별 시스템 선택
        if "정치" in question or "사회" in question or "역사" in question:
            selected_systems.append("final_unified")  # 유시민 스타일
        
        if "진화" in question or "학습" in question or "적응" in question:
            selected_systems.append("ai_evolution")
        
        if "의식" in question or "창의성" in question or "지혜" in question:
            selected_systems.append("consciousness_ai")
        
        if "초월" in question or "통합" in question:
            selected_systems.extend(["transcendent_ai", "ultimate_integration"])
        
        if "신경망" in question or "패턴" in question:
            selected_systems.append("neural_processing")
        
        if "양자" in question or "최적화" in question:
            selected_systems.append("quantum_algorithms")
        
        if "인지" in question or "메타인지" in question:
            selected_systems.append("cognitive_architecture")
        
        # 중복 제거 및 우선순위 정렬
        selected_systems = list(set(selected_systems))
        
        # 최소 1개 시스템 보장
        if not selected_systems:
            selected_systems = ["final_unified"]
        
        return selected_systems[:5]  # 최대 5개 시스템
    
    async def _execute_orchestration(self, task: OrchestrationTask) -> Dict[str, Any]:
        """오케스트레이션 실행"""
        task.status = "in_progress"
        task.start_time = datetime.now(timezone.utc)
        
        results = {}
        
        try:
            if task.orchestration_mode == OrchestrationMode.SEQUENTIAL:
                results = await self._execute_sequential(task)
            elif task.orchestration_mode == OrchestrationMode.PARALLEL:
                results = await self._execute_parallel(task)
            elif task.orchestration_mode == OrchestrationMode.ADAPTIVE:
                results = await self._execute_adaptive(task)
            elif task.orchestration_mode == OrchestrationMode.COLLABORATIVE:
                results = await self._execute_collaborative(task)
            elif task.orchestration_mode == OrchestrationMode.EMERGENT:
                results = await self._execute_emergent(task)
            
            task.status = "completed"
            task.results = results
            
        except Exception as e:
            task.status = "failed"
            task.error_log.append(str(e))
            logger.error(f"오케스트레이션 실행 오류: {e}")
        
        task.end_time = datetime.now(timezone.utc)
        return results
    
    async def _execute_sequential(self, task: OrchestrationTask) -> Dict[str, Any]:
        """순차 실행"""
        logger.info(f"순차 실행: {task.target_systems}")
        results = {}
        
        for system_id in task.target_systems:
            if system_id in self.ai_systems:
                try:
                    result = await self._call_ai_system(system_id, task.request_data)
                    results[system_id] = result
                except Exception as e:
                    task.error_log.append(f"{system_id}: {str(e)}")
                    logger.error(f"시스템 {system_id} 호출 오류: {e}")
        
        return results
    
    async def _execute_parallel(self, task: OrchestrationTask) -> Dict[str, Any]:
        """병렬 실행"""
        logger.info(f"병렬 실행: {task.target_systems}")
        
        async def call_system(system_id: str):
            try:
                return system_id, await self._call_ai_system(system_id, task.request_data)
            except Exception as e:
                task.error_log.append(f"{system_id}: {str(e)}")
                return system_id, {"error": str(e)}
        
        # 병렬 실행
        tasks = [call_system(system_id) for system_id in task.target_systems if system_id in self.ai_systems]
        results_list = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 결과 정리
        results = {}
        for result in results_list:
            if isinstance(result, tuple):
                system_id, system_result = result
                results[system_id] = system_result
        
        return results
    
    async def _execute_adaptive(self, task: OrchestrationTask) -> Dict[str, Any]:
        """적응적 실행"""
        logger.info(f"적응적 실행: {task.target_systems}")
        
        # 첫 번째 시스템으로 시작
        primary_system = task.target_systems[0]
        results = {}
        
        try:
            primary_result = await self._call_ai_system(primary_system, task.request_data)
            results[primary_system] = primary_result
            
            # 결과에 따라 추가 시스템 선택
            if "error" not in primary_result:
                # 성공한 경우 관련 시스템 추가 호출
                for system_id in task.target_systems[1:]:
                    try:
                        result = await self._call_ai_system(system_id, task.request_data)
                        results[system_id] = result
                    except Exception as e:
                        task.error_log.append(f"{system_id}: {str(e)}")
            
        except Exception as e:
            task.error_log.append(f"{primary_system}: {str(e)}")
        
        return results
    
    async def _execute_collaborative(self, task: OrchestrationTask) -> Dict[str, Any]:
        """협력적 실행"""
        logger.info(f"협력적 실행: {task.target_systems}")
        
        # 모든 시스템을 병렬로 실행
        results = await self._execute_parallel(task)
        
        # 협력적 결과 생성
        collaborative_result = await self._generate_collaborative_result(results, task.request_data)
        results["collaborative"] = collaborative_result
        
        return results
    
    async def _execute_emergent(self, task: OrchestrationTask) -> Dict[str, Any]:
        """창발적 실행"""
        logger.info(f"창발적 실행: {task.target_systems}")
        
        # 기본 병렬 실행
        results = await self._execute_parallel(task)
        
        # 창발적 결과 생성
        emergent_result = await self._generate_emergent_result(results, task.request_data)
        results["emergent"] = emergent_result
        
        return results
    
    async def _call_ai_system(self, system_id: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """AI 시스템 호출"""
        system = self.ai_systems[system_id]
        
        # 시스템별 엔드포인트 결정
        endpoint = self._determine_endpoint(system_id, request_data)
        
        try:
            async with self.session.post(
                f"{system.url}{endpoint}",
                json=request_data,
                timeout=aiohttp.ClientTimeout(total=self.task_timeout)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return {
                        "status": "success",
                        "data": result,
                        "response_time": response.headers.get("X-Response-Time", 0)
                    }
                else:
                    return {
                        "status": "error",
                        "error": f"HTTP {response.status}",
                        "data": None
                    }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "data": None
            }
    
    def _determine_endpoint(self, system_id: str, request_data: Dict[str, Any]) -> str:
        """엔드포인트 결정"""
        endpoint_map = {
            "neural_processing": "/api/neural/process",
            "quantum_algorithms": "/api/quantum/process",
            "cognitive_architecture": "/api/cognitive/process",
            "transcendent_ai": "/api/transcendent/process",
            "ai_evolution": "/api/evolve",
            "ultimate_integration": "/api/integration/process",
            "final_unified": "/api/ai/process",
            "consciousness_ai": "/api/consciousness/process",
            "quantum_consciousness": "/api/quantum-consciousness/process"
        }
        
        return endpoint_map.get(system_id, "/api/process")
    
    async def _generate_collaborative_result(self, results: Dict[str, Any], request_data: Dict[str, Any]) -> Dict[str, Any]:
        """협력적 결과 생성"""
        successful_results = {k: v for k, v in results.items() if v.get("status") == "success"}
        
        return {
            "collaboration_type": "multi_system",
            "participating_systems": list(successful_results.keys()),
            "collaborative_insights": [
                f"{system_id} 시스템의 고유한 강점을 활용한 통합적 접근"
                for system_id in successful_results.keys()
            ],
            "synergy_effect": len(successful_results) * 0.2,
            "collaborative_timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    async def _generate_emergent_result(self, results: Dict[str, Any], request_data: Dict[str, Any]) -> Dict[str, Any]:
        """창발적 결과 생성"""
        successful_results = {k: v for k, v in results.items() if v.get("status") == "success"}
        
        # 창발적 특성 계산
        emergent_properties = []
        if len(successful_results) >= 3:
            emergent_properties.append("다중 시스템 상호작용")
        if len(successful_results) >= 5:
            emergent_properties.append("복잡계 창발")
        
        return {
            "emergent_type": "system_synergy",
            "emergent_properties": emergent_properties,
            "complexity_level": len(successful_results),
            "unexpected_insights": [
                "시스템 간 상호작용에서 나타난 예상치 못한 통찰",
                "개별 시스템의 한계를 넘어선 통합적 지혜",
                "창발적 창의성의 발현"
            ],
            "emergent_timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    async def _integrate_results(self, task: OrchestrationTask, orchestration_result: Dict[str, Any]) -> Dict[str, Any]:
        """결과 통합"""
        question = task.request_data.get("question", "")
        complexity = task.request_data.get("complexity", "medium")
        
        # 성공한 결과들 수집
        successful_results = {}
        for system_id, result in orchestration_result.items():
            if isinstance(result, dict) and result.get("status") == "success":
                successful_results[system_id] = result.get("data", {})
        
        # 통합된 응답 생성
        integrated_response = f"""## 🎼 범용 AI 오케스트레이터 통합 응답

**질문**: {question}
**복잡도**: {complexity}
**오케스트레이션 모드**: {task.orchestration_mode.value}
**우선순위**: {task.priority.value}

### 🎯 참여 시스템들
총 {len(successful_results)}개 시스템이 성공적으로 처리했습니다:
"""
        
        for system_id, result_data in successful_results.items():
            system_name = self.ai_systems[system_id].name
            integrated_response += f"- **{system_name}**: {system_id}\n"
        
        # 특별한 결과들 추가
        if "collaborative" in orchestration_result:
            collab_data = orchestration_result["collaborative"]
            integrated_response += f"""
### 🤝 협력적 통찰
{collab_data.get('collaborative_insights', [])[0] if collab_data.get('collaborative_insights') else '다중 시스템 협력을 통한 통합적 접근'}
"""
        
        if "emergent" in orchestration_result:
            emergent_data = orchestration_result["emergent"]
            integrated_response += f"""
### ✨ 창발적 통찰
{emergent_data.get('unexpected_insights', [])[0] if emergent_data.get('unexpected_insights') else '시스템 간 상호작용에서 나타난 창발적 지혜'}
"""
        
        integrated_response += f"""
### 🌟 통합 결론
범용 AI 오케스트레이터가 {task.orchestration_mode.value} 모드로
{len(successful_results)}개 시스템을 조율하여 통합된 지혜를 제공했습니다.

각 시스템의 고유한 강점을 최대한 활용하여
더욱 정교하고 포괄적인 답변을 생성했습니다.

---
*범용 AI 오케스트레이터가 제공하는 통합된 AI 서비스입니다*"""
        
        return {
            "orchestration_task_id": task.task_id,
            "orchestration_mode": task.orchestration_mode.value,
            "priority": task.priority.value,
            "participating_systems": list(successful_results.keys()),
            "successful_systems_count": len(successful_results),
            "total_systems_count": len(task.target_systems),
            "integrated_response": integrated_response,
            "individual_results": successful_results,
            "special_results": {k: v for k, v in orchestration_result.items() if k in ["collaborative", "emergent"]},
            "processing_time": (task.end_time - task.start_time).total_seconds() if task.end_time and task.start_time else 0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    async def _update_system_performance(self, task: OrchestrationTask, orchestration_result: Dict[str, Any]):
        """시스템 성능 업데이트"""
        for system_id, result in orchestration_result.items():
            if system_id in self.ai_systems and isinstance(result, dict):
                system = self.ai_systems[system_id]
                
                # 응답 시간 업데이트
                if "response_time" in result:
                    system.response_time = float(result["response_time"])
                
                # 성공률 업데이트
                if result.get("status") == "success":
                    system.success_rate = min(1.0, system.success_rate + 0.1)
                else:
                    system.success_rate = max(0.0, system.success_rate - 0.05)
                
                # 성능 메트릭스 업데이트
                if system_id not in self.system_performance:
                    self.system_performance[system_id] = SystemPerformance(
                        system_id=system_id,
                        response_time_avg=system.response_time,
                        success_rate=system.success_rate,
                        throughput=0.0,
                        error_rate=0.0,
                        cpu_usage=0.0,
                        memory_usage=0.0
                    )
                
                perf = self.system_performance[system_id]
                perf.response_time_avg = (perf.response_time_avg + system.response_time) / 2
                perf.success_rate = system.success_rate
                perf.last_updated = datetime.now(timezone.utc)
    
    async def check_all_systems_health(self) -> Dict[str, Any]:
        """모든 시스템 건강 상태 확인"""
        logger.info("시스템 건강 상태 확인 시작")
        
        health_status = {}
        online_count = 0
        
        for system_id, system in self.ai_systems.items():
            try:
                async with self.session.get(f"{system.url}/", timeout=aiohttp.ClientTimeout(total=5)) as response:
                    if response.status == 200:
                        system.status = SystemStatus.ONLINE
                        online_count += 1
                        health_status[system_id] = {
                            "status": "healthy",
                            "response_time": response.headers.get("X-Response-Time", 0),
                            "capabilities": system.capabilities
                        }
                    else:
                        system.status = SystemStatus.DEGRADED
                        health_status[system_id] = {
                            "status": "degraded",
                            "response_time": 0,
                            "capabilities": system.capabilities
                        }
            except Exception as e:
                system.status = SystemStatus.OFFLINE
                health_status[system_id] = {
                    "status": "offline",
                    "response_time": 0,
                    "capabilities": system.capabilities,
                    "error": str(e)
                }
        
        overall_health = online_count / len(self.ai_systems) if self.ai_systems else 0
        
        return {
            "overall_health": overall_health,
            "online_systems": online_count,
            "total_systems": len(self.ai_systems),
            "system_health": health_status,
            "check_timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def get_orchestrator_status(self) -> Dict[str, Any]:
        """오케스트레이터 상태 조회"""
        return {
            "total_systems": len(self.ai_systems),
            "online_systems": sum(1 for s in self.ai_systems.values() if s.status == SystemStatus.ONLINE),
            "total_tasks": len(self.orchestration_tasks),
            "completed_tasks": sum(1 for t in self.orchestration_tasks if t.status == "completed"),
            "failed_tasks": sum(1 for t in self.orchestration_tasks if t.status == "failed"),
            "system_performance": {
                system_id: {
                    "response_time_avg": perf.response_time_avg,
                    "success_rate": perf.success_rate,
                    "throughput": perf.throughput,
                    "error_rate": perf.error_rate
                }
                for system_id, perf in self.system_performance.items()
            },
            "last_update": datetime.now(timezone.utc).isoformat()
        }

# 범용 AI 오케스트레이터 인스턴스 생성
ai_orchestrator = UniversalAIOrchestrator()

# Pydantic 모델들
class OrchestrationRequest(BaseModel):
    question: str
    complexity: Optional[str] = "medium"
    domain: Optional[str] = "general"
    orchestration_preference: Optional[str] = "auto"

class OrchestrationResponse(BaseModel):
    success: bool
    orchestration_result: Dict[str, Any]
    message: str

# API 엔드포인트들
@app.get("/")
async def root():
    return {
        "message": "Universal AI Orchestrator",
        "version": "1.0.0",
        "status": "running",
        "total_systems": len(ai_orchestrator.ai_systems),
        "online_systems": sum(1 for s in ai_orchestrator.ai_systems.values() if s.status == SystemStatus.ONLINE),
        "docs_url": "/docs"
    }

@app.post("/api/orchestrate", response_model=OrchestrationResponse)
async def orchestrate_request(request: OrchestrationRequest):
    """요청 오케스트레이션"""
    try:
        logger.info(f"오케스트레이션 요청: {request.question[:50]}...")
        
        # 요청 데이터 준비
        request_data = {
            "question": request.question,
            "complexity": request.complexity,
            "domain": request.domain
        }
        
        # 오케스트레이션 실행
        async with ai_orchestrator:
            orchestration_result = await ai_orchestrator.orchestrate_request(request_data)
        
        return OrchestrationResponse(
            success=True,
            orchestration_result=orchestration_result,
            message=f"오케스트레이션 완료: {orchestration_result['orchestration_mode']} 모드"
        )
        
    except Exception as e:
        logger.error(f"오케스트레이션 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/orchestrator/systems-health")
async def get_systems_health():
    """모든 시스템 건강 상태 확인"""
    try:
        async with ai_orchestrator:
            health = await ai_orchestrator.check_all_systems_health()
            return health
    except Exception as e:
        logger.error(f"시스템 건강 상태 확인 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/orchestrator/status")
async def get_orchestrator_status():
    """오케스트레이터 상태 조회"""
    try:
        status = ai_orchestrator.get_orchestrator_status()
        return status
    except Exception as e:
        logger.error(f"오케스트레이터 상태 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/orchestrator/tasks")
async def get_orchestration_tasks():
    """오케스트레이션 작업 조회"""
    try:
        return {
            "orchestration_tasks": [
                {
                    "task_id": task.task_id,
                    "target_systems": task.target_systems,
                    "orchestration_mode": task.orchestration_mode.value,
                    "priority": task.priority.value,
                    "status": task.status,
                    "start_time": task.start_time.isoformat() if task.start_time else None,
                    "end_time": task.end_time.isoformat() if task.end_time else None,
                    "error_log": task.error_log
                }
                for task in ai_orchestrator.orchestration_tasks[-20:]  # 최근 20개
            ],
            "total_tasks": len(ai_orchestrator.orchestration_tasks)
        }
    except Exception as e:
        logger.error(f"오케스트레이션 작업 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    logger.info("🚀 Universal AI Orchestrator를 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8019")
    logger.info("📚 API 문서: http://localhost:8019/docs")
    uvicorn.run(app, host="0.0.0.0", port=8019, reload=False, log_level="info")
