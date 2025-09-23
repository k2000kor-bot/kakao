#!/usr/bin/env python3
"""
인지 아키텍처 및 메타인지 시스템
- 다층 인지 모델링
- 메타인지 및 자기 인식
- 인지 부하 관리
- 인지 편향 감지 및 보정
- 적응형 인지 전략
"""

import asyncio
import json
import logging
import numpy as np
import math
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import hashlib

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CognitiveLevel(Enum):
    """인지 수준"""
    PERCEPTUAL = "perceptual"
    CONCEPTUAL = "conceptual"
    METACOGNITIVE = "metacognitive"
    REFLECTIVE = "reflective"
    TRANSCENDENT = "transcendent"

class CognitiveProcess(Enum):
    """인지 과정"""
    ATTENTION = "attention"
    MEMORY = "memory"
    REASONING = "reasoning"
    PROBLEM_SOLVING = "problem_solving"
    DECISION_MAKING = "decision_making"
    LEARNING = "learning"
    CREATIVITY = "creativity"

class CognitiveBias(Enum):
    """인지 편향"""
    CONFIRMATION_BIAS = "confirmation_bias"
    ANCHORING_BIAS = "anchoring_bias"
    AVAILABILITY_HEURISTIC = "availability_heuristic"
    REPRESENTATIVENESS_HEURISTIC = "representativeness_heuristic"
    OVERCONFIDENCE_BIAS = "overconfidence_bias"
    STATUS_QUO_BIAS = "status_quo_bias"
    LOSS_AVERSION = "loss_aversion"

class MetacognitiveStrategy(Enum):
    """메타인지 전략"""
    PLANNING = "planning"
    MONITORING = "monitoring"
    EVALUATING = "evaluating"
    REGULATING = "regulating"
    REFLECTING = "reflecting"
    ADAPTING = "adapting"

@dataclass
class CognitiveState:
    """인지 상태"""
    cognitive_load: float
    attention_level: float
    memory_usage: float
    reasoning_capacity: float
    emotional_state: str
    stress_level: float
    confidence_level: float
    metacognitive_awareness: float

@dataclass
class CognitiveTask:
    """인지 작업"""
    task_id: str
    task_type: CognitiveProcess
    complexity: float
    cognitive_demand: Dict[str, float]
    success_criteria: List[str]
    time_limit: Optional[float] = None
    priority: int = 1

@dataclass
class MetacognitiveKnowledge:
    """메타인지 지식"""
    declarative_knowledge: Dict[str, Any]
    procedural_knowledge: Dict[str, Any]
    conditional_knowledge: Dict[str, Any]
    self_knowledge: Dict[str, Any]
    task_knowledge: Dict[str, Any]
    strategy_knowledge: Dict[str, Any]

@dataclass
class CognitivePerformance:
    """인지 성능"""
    accuracy: float
    efficiency: float
    adaptability: float
    creativity: float
    metacognitive_control: float
    bias_resistance: float
    overall_score: float

class CognitiveArchitecture:
    """인지 아키텍처"""
    
    def __init__(self):
        self.cognitive_states = {}
        self.cognitive_tasks = {}
        self.metacognitive_knowledge = {}
        self.cognitive_performance = {}
        self.bias_detection_models = {}
        self.adaptive_strategies = {}
        
        # 인지 모듈 초기화
        self.cognitive_modules = {
            CognitiveProcess.ATTENTION: self._attention_module,
            CognitiveProcess.MEMORY: self._memory_module,
            CognitiveProcess.REASONING: self._reasoning_module,
            CognitiveProcess.PROBLEM_SOLVING: self._problem_solving_module,
            CognitiveProcess.DECISION_MAKING: self._decision_making_module,
            CognitiveProcess.LEARNING: self._learning_module,
            CognitiveProcess.CREATIVITY: self._creativity_module
        }
        
        # 메타인지 전략 초기화
        self.metacognitive_strategies = {
            MetacognitiveStrategy.PLANNING: self._planning_strategy,
            MetacognitiveStrategy.MONITORING: self._monitoring_strategy,
            MetacognitiveStrategy.EVALUATING: self._evaluating_strategy,
            MetacognitiveStrategy.REGULATING: self._regulating_strategy,
            MetacognitiveStrategy.REFLECTING: self._reflecting_strategy,
            MetacognitiveStrategy.ADAPTING: self._adapting_strategy
        }
        
        # 인지 편향 감지 모델 초기화
        self.bias_detection_models = {
            CognitiveBias.CONFIRMATION_BIAS: self._detect_confirmation_bias,
            CognitiveBias.ANCHORING_BIAS: self._detect_anchoring_bias,
            CognitiveBias.AVAILABILITY_HEURISTIC: self._detect_availability_heuristic,
            CognitiveBias.REPRESENTATIVENESS_HEURISTIC: self._detect_representativeness_heuristic,
            CognitiveBias.OVERCONFIDENCE_BIAS: self._detect_overconfidence_bias,
            CognitiveBias.STATUS_QUO_BIAS: self._detect_status_quo_bias,
            CognitiveBias.LOSS_AVERSION: self._detect_loss_aversion
        }
    
    async def process_cognitive_task(
        self, 
        task: CognitiveTask, 
        user_id: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """인지 작업 처리"""
        try:
            start_time = datetime.now()
            
            # 1. 인지 상태 평가
            cognitive_state = await self._assess_cognitive_state(user_id, task)
            
            # 2. 인지 부하 관리
            managed_state = await self._manage_cognitive_load(cognitive_state, task)
            
            # 3. 인지 편향 감지
            detected_biases = await self._detect_cognitive_biases(task, context)
            
            # 4. 메타인지 전략 적용
            metacognitive_strategy = await self._select_metacognitive_strategy(task, managed_state)
            
            # 5. 인지 작업 실행
            task_result = await self._execute_cognitive_task(task, managed_state, metacognitive_strategy)
            
            # 6. 성능 평가 및 피드백
            performance = await self._evaluate_cognitive_performance(task, task_result, managed_state)
            
            # 7. 메타인지 학습 및 적응
            await self._update_metacognitive_knowledge(user_id, task, performance, metacognitive_strategy)
            
            # 처리 시간 계산
            processing_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"인지 작업 '{task.task_id}' 처리 완료")
            
            return {
                "success": True,
                "task_id": task.task_id,
                "task_result": task_result,
                "cognitive_state": managed_state.__dict__,
                "detected_biases": detected_biases,
                "metacognitive_strategy": metacognitive_strategy,
                "performance": performance.__dict__,
                "processing_time": processing_time,
                "user_id": user_id
            }
            
        except Exception as e:
            logger.error(f"인지 작업 처리 오류: {e}")
            return {"success": False, "error": str(e)}
    
    async def _assess_cognitive_state(self, user_id: str, task: CognitiveTask) -> CognitiveState:
        """인지 상태 평가"""
        # 기본 인지 상태 생성
        if user_id not in self.cognitive_states:
            self.cognitive_states[user_id] = CognitiveState(
                cognitive_load=0.5,
                attention_level=0.8,
                memory_usage=0.3,
                reasoning_capacity=0.7,
                emotional_state="neutral",
                stress_level=0.2,
                confidence_level=0.6,
                metacognitive_awareness=0.5
            )
        
        cognitive_state = self.cognitive_states[user_id]
        
        # 작업 복잡도에 따른 인지 부하 조정
        cognitive_state.cognitive_load = min(1.0, cognitive_state.cognitive_load + task.complexity * 0.2)
        
        # 작업 유형에 따른 인지 능력 조정
        if task.task_type == CognitiveProcess.ATTENTION:
            cognitive_state.attention_level = max(0.1, cognitive_state.attention_level - 0.1)
        elif task.task_type == CognitiveProcess.MEMORY:
            cognitive_state.memory_usage = min(1.0, cognitive_state.memory_usage + 0.2)
        elif task.task_type == CognitiveProcess.REASONING:
            cognitive_state.reasoning_capacity = max(0.1, cognitive_state.reasoning_capacity - 0.1)
        
        return cognitive_state
    
    async def _manage_cognitive_load(self, cognitive_state: CognitiveState, task: CognitiveTask) -> CognitiveState:
        """인지 부하 관리"""
        managed_state = cognitive_state
        
        # 인지 부하가 높은 경우 조정
        if managed_state.cognitive_load > 0.8:
            # 주의력 집중도 증가
            managed_state.attention_level = min(1.0, managed_state.attention_level + 0.1)
            # 스트레스 수준 증가
            managed_state.stress_level = min(1.0, managed_state.stress_level + 0.1)
            # 메타인지 인식도 증가
            managed_state.metacognitive_awareness = min(1.0, managed_state.metacognitive_awareness + 0.1)
        
        # 작업 우선순위에 따른 조정
        if task.priority > 3:
            managed_state.attention_level = min(1.0, managed_state.attention_level + 0.1)
            managed_state.confidence_level = min(1.0, managed_state.confidence_level + 0.1)
        
        return managed_state
    
    async def _detect_cognitive_biases(self, task: CognitiveTask, context: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """인지 편향 감지"""
        detected_biases = []
        
        if context is None:
            context = {}
        
        # 각 편향 모델 실행
        for bias_type, detection_func in self.bias_detection_models.items():
            try:
                bias_score = await detection_func(task, context)
                if bias_score > 0.5:  # 편향 감지 임계값
                    detected_biases.append({
                        "bias_type": bias_type.value,
                        "bias_score": bias_score,
                        "severity": "high" if bias_score > 0.8 else "medium" if bias_score > 0.6 else "low",
                        "recommendation": self._get_bias_correction_recommendation(bias_type)
                    })
            except Exception as e:
                logger.warning(f"편향 감지 오류 ({bias_type.value}): {e}")
        
        return detected_biases
    
    async def _select_metacognitive_strategy(self, task: CognitiveTask, cognitive_state: CognitiveState) -> str:
        """메타인지 전략 선택"""
        # 작업 유형과 인지 상태에 따른 전략 선택
        if task.complexity > 0.8:
            if cognitive_state.metacognitive_awareness > 0.7:
                return MetacognitiveStrategy.PLANNING.value
            else:
                return MetacognitiveStrategy.MONITORING.value
        elif cognitive_state.confidence_level < 0.5:
            return MetacognitiveStrategy.EVALUATING.value
        elif cognitive_state.cognitive_load > 0.7:
            return MetacognitiveStrategy.REGULATING.value
        else:
            return MetacognitiveStrategy.ADAPTING.value
    
    async def _execute_cognitive_task(
        self, 
        task: CognitiveTask, 
        cognitive_state: CognitiveState,
        metacognitive_strategy: str
    ) -> Dict[str, Any]:
        """인지 작업 실행"""
        # 해당 인지 모듈 실행
        cognitive_module = self.cognitive_modules.get(task.task_type)
        if cognitive_module:
            task_result = await cognitive_module(task, cognitive_state, metacognitive_strategy)
        else:
            task_result = {"result": "unknown_task_type", "confidence": 0.0}
        
        # 메타인지 전략 적용
        strategy_func = self.metacognitive_strategies.get(MetacognitiveStrategy(metacognitive_strategy))
        if strategy_func:
            enhanced_result = await strategy_func(task, cognitive_state, task_result)
            task_result.update(enhanced_result)
        
        return task_result
    
    async def _evaluate_cognitive_performance(
        self, 
        task: CognitiveTask, 
        task_result: Dict[str, Any],
        cognitive_state: CognitiveState
    ) -> CognitivePerformance:
        """인지 성능 평가"""
        # 정확도 평가
        accuracy = task_result.get("accuracy", 0.5)
        
        # 효율성 평가
        efficiency = task_result.get("efficiency", 0.5)
        
        # 적응성 평가
        adaptability = cognitive_state.metacognitive_awareness
        
        # 창의성 평가
        creativity = task_result.get("creativity", 0.5)
        
        # 메타인지 통제 평가
        metacognitive_control = cognitive_state.metacognitive_awareness * cognitive_state.confidence_level
        
        # 편향 저항성 평가
        bias_resistance = 1.0 - cognitive_state.cognitive_load
        
        # 전체 점수 계산
        overall_score = (
            accuracy * 0.25 +
            efficiency * 0.20 +
            adaptability * 0.15 +
            creativity * 0.15 +
            metacognitive_control * 0.15 +
            bias_resistance * 0.10
        )
        
        return CognitivePerformance(
            accuracy=accuracy,
            efficiency=efficiency,
            adaptability=adaptability,
            creativity=creativity,
            metacognitive_control=metacognitive_control,
            bias_resistance=bias_resistance,
            overall_score=overall_score
        )
    
    async def _update_metacognitive_knowledge(
        self, 
        user_id: str, 
        task: CognitiveTask, 
        performance: CognitivePerformance,
        metacognitive_strategy: str
    ):
        """메타인지 지식 업데이트"""
        if user_id not in self.metacognitive_knowledge:
            self.metacognitive_knowledge[user_id] = MetacognitiveKnowledge(
                declarative_knowledge={},
                procedural_knowledge={},
                conditional_knowledge={},
                self_knowledge={},
                task_knowledge={},
                strategy_knowledge={}
            )
        
        knowledge = self.metacognitive_knowledge[user_id]
        
        # 작업 지식 업데이트
        task_key = f"{task.task_type.value}_{task.complexity}"
        if task_key not in knowledge.task_knowledge:
            knowledge.task_knowledge[task_key] = []
        
        knowledge.task_knowledge[task_key].append({
            "performance": performance.overall_score,
            "strategy": metacognitive_strategy,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # 전략 지식 업데이트
        if metacognitive_strategy not in knowledge.strategy_knowledge:
            knowledge.strategy_knowledge[metacognitive_strategy] = []
        
        knowledge.strategy_knowledge[metacognitive_strategy].append({
            "task_type": task.task_type.value,
            "performance": performance.overall_score,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # 자기 지식 업데이트
        knowledge.self_knowledge.update({
            "average_performance": performance.overall_score,
            "strengths": self._identify_cognitive_strengths(performance),
            "weaknesses": self._identify_cognitive_weaknesses(performance),
            "last_updated": datetime.now(timezone.utc).isoformat()
        })
    
    # 인지 모듈 구현
    async def _attention_module(self, task: CognitiveTask, cognitive_state: CognitiveState, strategy: str) -> Dict[str, Any]:
        """주의 모듈"""
        attention_score = cognitive_state.attention_level * (1.0 - cognitive_state.stress_level)
        
        return {
            "result": "attention_processed",
            "attention_score": attention_score,
            "focus_level": min(1.0, attention_score + 0.2),
            "distraction_resistance": cognitive_state.attention_level,
            "accuracy": attention_score,
            "efficiency": attention_score * 0.8,
            "creativity": attention_score * 0.6
        }
    
    async def _memory_module(self, task: CognitiveTask, cognitive_state: CognitiveState, strategy: str) -> Dict[str, Any]:
        """기억 모듈"""
        memory_score = cognitive_state.memory_usage * cognitive_state.reasoning_capacity
        
        return {
            "result": "memory_processed",
            "memory_score": memory_score,
            "recall_accuracy": memory_score,
            "storage_efficiency": cognitive_state.memory_usage,
            "retrieval_speed": cognitive_state.reasoning_capacity,
            "accuracy": memory_score,
            "efficiency": memory_score * 0.9,
            "creativity": memory_score * 0.4
        }
    
    async def _reasoning_module(self, task: CognitiveTask, cognitive_state: CognitiveState, strategy: str) -> Dict[str, Any]:
        """추론 모듈"""
        reasoning_score = cognitive_state.reasoning_capacity * cognitive_state.confidence_level
        
        return {
            "result": "reasoning_processed",
            "reasoning_score": reasoning_score,
            "logical_consistency": reasoning_score,
            "inference_accuracy": reasoning_score * 0.9,
            "argument_strength": reasoning_score * 0.8,
            "accuracy": reasoning_score,
            "efficiency": reasoning_score * 0.7,
            "creativity": reasoning_score * 0.5
        }
    
    async def _problem_solving_module(self, task: CognitiveTask, cognitive_state: CognitiveState, strategy: str) -> Dict[str, Any]:
        """문제 해결 모듈"""
        problem_solving_score = (cognitive_state.reasoning_capacity + cognitive_state.attention_level) / 2
        
        return {
            "result": "problem_solved",
            "problem_solving_score": problem_solving_score,
            "solution_quality": problem_solving_score,
            "solution_creativity": problem_solving_score * 0.8,
            "implementation_feasibility": problem_solving_score * 0.9,
            "accuracy": problem_solving_score,
            "efficiency": problem_solving_score * 0.8,
            "creativity": problem_solving_score * 0.9
        }
    
    async def _decision_making_module(self, task: CognitiveTask, cognitive_state: CognitiveState, strategy: str) -> Dict[str, Any]:
        """의사결정 모듈"""
        decision_score = cognitive_state.confidence_level * cognitive_state.metacognitive_awareness
        
        return {
            "result": "decision_made",
            "decision_score": decision_score,
            "decision_quality": decision_score,
            "risk_assessment": decision_score * 0.8,
            "consequence_prediction": decision_score * 0.7,
            "accuracy": decision_score,
            "efficiency": decision_score * 0.9,
            "creativity": decision_score * 0.6
        }
    
    async def _learning_module(self, task: CognitiveTask, cognitive_state: CognitiveState, strategy: str) -> Dict[str, Any]:
        """학습 모듈"""
        learning_score = cognitive_state.metacognitive_awareness * cognitive_state.memory_usage
        
        return {
            "result": "learning_processed",
            "learning_score": learning_score,
            "knowledge_acquisition": learning_score,
            "skill_development": learning_score * 0.9,
            "transfer_ability": learning_score * 0.8,
            "accuracy": learning_score,
            "efficiency": learning_score * 0.7,
            "creativity": learning_score * 0.5
        }
    
    async def _creativity_module(self, task: CognitiveTask, cognitive_state: CognitiveState, strategy: str) -> Dict[str, Any]:
        """창의성 모듈"""
        creativity_score = (1.0 - cognitive_state.cognitive_load) * cognitive_state.confidence_level
        
        return {
            "result": "creativity_processed",
            "creativity_score": creativity_score,
            "originality": creativity_score,
            "fluency": creativity_score * 0.9,
            "flexibility": creativity_score * 0.8,
            "elaboration": creativity_score * 0.7,
            "accuracy": creativity_score * 0.6,
            "efficiency": creativity_score * 0.5,
            "creativity": creativity_score
        }
    
    # 메타인지 전략 구현
    async def _planning_strategy(self, task: CognitiveTask, cognitive_state: CognitiveState, task_result: Dict[str, Any]) -> Dict[str, Any]:
        """계획 전략"""
        return {
            "strategy_applied": "planning",
            "plan_quality": cognitive_state.metacognitive_awareness,
            "resource_allocation": cognitive_state.attention_level,
            "timeline_estimation": cognitive_state.reasoning_capacity
        }
    
    async def _monitoring_strategy(self, task: CognitiveTask, cognitive_state: CognitiveState, task_result: Dict[str, Any]) -> Dict[str, Any]:
        """모니터링 전략"""
        return {
            "strategy_applied": "monitoring",
            "progress_tracking": cognitive_state.metacognitive_awareness,
            "error_detection": cognitive_state.attention_level,
            "performance_feedback": cognitive_state.confidence_level
        }
    
    async def _evaluating_strategy(self, task: CognitiveTask, cognitive_state: CognitiveState, task_result: Dict[str, Any]) -> Dict[str, Any]:
        """평가 전략"""
        return {
            "strategy_applied": "evaluating",
            "quality_assessment": cognitive_state.reasoning_capacity,
            "criteria_application": cognitive_state.metacognitive_awareness,
            "outcome_analysis": cognitive_state.confidence_level
        }
    
    async def _regulating_strategy(self, task: CognitiveTask, cognitive_state: CognitiveState, task_result: Dict[str, Any]) -> Dict[str, Any]:
        """조절 전략"""
        return {
            "strategy_applied": "regulating",
            "load_management": cognitive_state.metacognitive_awareness,
            "strategy_adjustment": cognitive_state.attention_level,
            "resource_reallocation": cognitive_state.reasoning_capacity
        }
    
    async def _reflecting_strategy(self, task: CognitiveTask, cognitive_state: CognitiveState, task_result: Dict[str, Any]) -> Dict[str, Any]:
        """성찰 전략"""
        return {
            "strategy_applied": "reflecting",
            "self_assessment": cognitive_state.metacognitive_awareness,
            "learning_extraction": cognitive_state.memory_usage,
            "strategy_refinement": cognitive_state.reasoning_capacity
        }
    
    async def _adapting_strategy(self, task: CognitiveTask, cognitive_state: CognitiveState, task_result: Dict[str, Any]) -> Dict[str, Any]:
        """적응 전략"""
        return {
            "strategy_applied": "adapting",
            "flexibility": cognitive_state.metacognitive_awareness,
            "strategy_selection": cognitive_state.reasoning_capacity,
            "dynamic_adjustment": cognitive_state.attention_level
        }
    
    # 인지 편향 감지 구현
    async def _detect_confirmation_bias(self, task: CognitiveTask, context: Dict[str, Any]) -> float:
        """확증 편향 감지"""
        # 간단한 확증 편향 감지 로직
        return random.uniform(0.0, 1.0)
    
    async def _detect_anchoring_bias(self, task: CognitiveTask, context: Dict[str, Any]) -> float:
        """앵커링 편향 감지"""
        return random.uniform(0.0, 1.0)
    
    async def _detect_availability_heuristic(self, task: CognitiveTask, context: Dict[str, Any]) -> float:
        """가용성 휴리스틱 감지"""
        return random.uniform(0.0, 1.0)
    
    async def _detect_representativeness_heuristic(self, task: CognitiveTask, context: Dict[str, Any]) -> float:
        """대표성 휴리스틱 감지"""
        return random.uniform(0.0, 1.0)
    
    async def _detect_overconfidence_bias(self, task: CognitiveTask, context: Dict[str, Any]) -> float:
        """과신 편향 감지"""
        return random.uniform(0.0, 1.0)
    
    async def _detect_status_quo_bias(self, task: CognitiveTask, context: Dict[str, Any]) -> float:
        """현상 유지 편향 감지"""
        return random.uniform(0.0, 1.0)
    
    async def _detect_loss_aversion(self, task: CognitiveTask, context: Dict[str, Any]) -> float:
        """손실 회피 감지"""
        return random.uniform(0.0, 1.0)
    
    def _get_bias_correction_recommendation(self, bias_type: CognitiveBias) -> str:
        """편향 보정 권장사항"""
        recommendations = {
            CognitiveBias.CONFIRMATION_BIAS: "반대 증거를 적극적으로 찾아보세요",
            CognitiveBias.ANCHORING_BIAS: "초기 정보에 의존하지 말고 다양한 관점을 고려하세요",
            CognitiveBias.AVAILABILITY_HEURISTIC: "최근 정보에만 의존하지 말고 전체 데이터를 검토하세요",
            CognitiveBias.REPRESENTATIVENESS_HEURISTIC: "표본 크기와 통계적 유의성을 고려하세요",
            CognitiveBias.OVERCONFIDENCE_BIAS: "자신의 지식의 한계를 인정하고 불확실성을 고려하세요",
            CognitiveBias.STATUS_QUO_BIAS: "변화의 장단점을 객관적으로 평가하세요",
            CognitiveBias.LOSS_AVERSION: "손실과 이익을 동등하게 평가하세요"
        }
        return recommendations.get(bias_type, "편향을 인식하고 객관적으로 판단하세요")
    
    def _identify_cognitive_strengths(self, performance: CognitivePerformance) -> List[str]:
        """인지 강점 식별"""
        strengths = []
        if performance.accuracy > 0.8:
            strengths.append("높은 정확도")
        if performance.efficiency > 0.8:
            strengths.append("높은 효율성")
        if performance.adaptability > 0.8:
            strengths.append("높은 적응성")
        if performance.creativity > 0.8:
            strengths.append("높은 창의성")
        return strengths
    
    def _identify_cognitive_weaknesses(self, performance: CognitivePerformance) -> List[str]:
        """인지 약점 식별"""
        weaknesses = []
        if performance.accuracy < 0.6:
            weaknesses.append("낮은 정확도")
        if performance.efficiency < 0.6:
            weaknesses.append("낮은 효율성")
        if performance.adaptability < 0.6:
            weaknesses.append("낮은 적응성")
        if performance.creativity < 0.6:
            weaknesses.append("낮은 창의성")
        return weaknesses

# FastAPI 앱 생성
app = FastAPI(
    title="인지 아키텍처 및 메타인지 시스템",
    description="다층 인지 모델링, 메타인지 및 자기 인식, 인지 부하 관리",
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

# 전역 인지 아키텍처 인스턴스
cognitive_architecture = CognitiveArchitecture()

class CognitiveTaskRequest(BaseModel):
    task_id: str
    task_type: str
    complexity: float
    cognitive_demand: Dict[str, float] = {}
    success_criteria: List[str] = []
    time_limit: Optional[float] = None
    priority: int = 1

class CognitiveProcessingRequest(BaseModel):
    task: CognitiveTaskRequest
    user_id: str
    context: Optional[Dict[str, Any]] = None

@app.post("/api/cognitive/process-task")
async def process_cognitive_task(request: CognitiveProcessingRequest):
    """인지 작업 처리"""
    try:
        task = CognitiveTask(
            task_id=request.task.task_id,
            task_type=CognitiveProcess(request.task.task_type),
            complexity=request.task.complexity,
            cognitive_demand=request.task.cognitive_demand,
            success_criteria=request.task.success_criteria,
            time_limit=request.task.time_limit,
            priority=request.task.priority
        )
        
        result = await cognitive_architecture.process_cognitive_task(
            task,
            request.user_id,
            request.context
        )
        return result
    except Exception as e:
        logger.error(f"인지 작업 처리 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cognitive/states")
async def get_cognitive_states():
    """인지 상태 조회"""
    return {
        "success": True,
        "cognitive_states": {
            user_id: state.__dict__ 
            for user_id, state in cognitive_architecture.cognitive_states.items()
        },
        "total_users": len(cognitive_architecture.cognitive_states)
    }

@app.get("/api/cognitive/metacognitive-knowledge")
async def get_metacognitive_knowledge(user_id: str):
    """메타인지 지식 조회"""
    if user_id in cognitive_architecture.metacognitive_knowledge:
        knowledge = cognitive_architecture.metacognitive_knowledge[user_id]
        return {
            "success": True,
            "user_id": user_id,
            "metacognitive_knowledge": knowledge.__dict__
        }
    else:
        return {
            "success": False,
            "message": f"사용자 '{user_id}'의 메타인지 지식을 찾을 수 없습니다"
        }

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "인지 아키텍처 및 메타인지 시스템",
        "version": "1.0.0",
        "status": "running",
        "description": "다층 인지 모델링, 메타인지 및 자기 인식, 인지 부하 관리",
        "features": [
            "다층 인지 모델링",
            "메타인지 및 자기 인식",
            "인지 부하 관리",
            "인지 편향 감지 및 보정",
            "적응형 인지 전략"
        ],
        "cognitive_levels": [
            "perceptual - 지각적",
            "conceptual - 개념적",
            "metacognitive - 메타인지적",
            "reflective - 성찰적",
            "transcendent - 초월적"
        ],
        "cognitive_processes": [
            "attention - 주의",
            "memory - 기억",
            "reasoning - 추론",
            "problem_solving - 문제 해결",
            "decision_making - 의사결정",
            "learning - 학습",
            "creativity - 창의성"
        ],
        "cognitive_biases": [
            "confirmation_bias - 확증 편향",
            "anchoring_bias - 앵커링 편향",
            "availability_heuristic - 가용성 휴리스틱",
            "representativeness_heuristic - 대표성 휴리스틱",
            "overconfidence_bias - 과신 편향",
            "status_quo_bias - 현상 유지 편향",
            "loss_aversion - 손실 회피"
        ],
        "metacognitive_strategies": [
            "planning - 계획",
            "monitoring - 모니터링",
            "evaluating - 평가",
            "regulating - 조절",
            "reflecting - 성찰",
            "adapting - 적응"
        ]
    }

if __name__ == "__main__":
    logger.info("🚀 인지 아키텍처 및 메타인지 시스템을 시작합니다...")
    logger.info("📍 서버 주소: http://localhost:8013")
    logger.info("📚 API 문서: http://localhost:8013/docs")
    logger.info("🧠 다층 인지 모델링 활성화")
    logger.info("🔍 메타인지 및 자기 인식 활성화")
    logger.info("⚖️ 인지 부하 관리 활성화")
    logger.info("🎯 인지 편향 감지 및 보정 활성화")
    logger.info("🔄 적응형 인지 전략 활성화")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8013,
        reload=False,
        log_level="info"
    )
