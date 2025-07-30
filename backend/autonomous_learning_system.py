#!/usr/bin/env python3
"""
자율 학습 시스템 v1.0
- 스스로 학습 목표 설정
- 자동 지식 발견 및 통합
- 지속적 성능 개선
- 자기 진화 능력
"""

import asyncio
import json
import logging
import numpy as np
# import torch
# import torch.nn as nn
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import sqlite3
import hashlib
import uuid
from collections import defaultdict
import random

# 머신러닝 라이브러리
# from sklearn.cluster import KMeans
# from sklearn.metrics import silhouette_score
# from sklearn.decomposition import PCA
# import faiss
# from sentence_transformers import SentenceTransformer

# 한국어 처리
# from konlpy.tag import Okt, Mecab
# import kss

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LearningGoal(Enum):
    """학습 목표 분류"""
    KNOWLEDGE_ACQUISITION = "knowledge_acquisition"  # 지식 습득
    SKILL_IMPROVEMENT = "skill_improvement"          # 기술 향상
    PERFORMANCE_OPTIMIZATION = "performance_optimization"  # 성능 최적화
    CREATIVITY_ENHANCEMENT = "creativity_enhancement"    # 창의성 증대
    ADAPTATION_LEARNING = "adaptation_learning"      # 적응 학습
    PROBLEM_SOLVING = "problem_solving"              # 문제 해결

class LearningStrategy(Enum):
    """학습 전략 분류"""
    EXPLORATION = "exploration"          # 탐색
    EXPLOITATION = "exploitation"        # 활용
    BALANCED = "balanced"               # 균형
    ADAPTIVE = "adaptive"               # 적응적
    META_LEARNING = "meta_learning"     # 메타러닝

@dataclass
class LearningObjective:
    """학습 목표"""
    objective_id: str
    goal_type: LearningGoal
    target_metric: str
    target_value: float
    current_value: float
    priority: int
    deadline: datetime
    dependencies: List[str] = field(default_factory=list)
    progress: float = 0.0

@dataclass
class LearningExperience:
    """학습 경험"""
    experience_id: str
    task_type: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    performance_metrics: Dict[str, float]
    feedback: Dict[str, Any]
    timestamp: datetime
    learning_gained: Dict[str, Any] = field(default_factory=dict)

@dataclass
class KnowledgePattern:
    """지식 패턴"""
    pattern_id: str
    pattern_type: str
    frequency: int
    effectiveness: float
    context: Dict[str, Any]
    last_used: datetime
    confidence: float

class AutonomousLearningEngine:
    """자율 학습 엔진"""
    
    def __init__(self):
        self.learning_objectives = []
        self.experience_memory = []
        self.knowledge_patterns = []
        self.learning_strategies = self._initialize_learning_strategies()
        self.performance_history = []
        self.adaptation_mechanisms = self._initialize_adaptation_mechanisms()
        
    def _initialize_learning_strategies(self) -> Dict[str, Dict]:
        """학습 전략 초기화"""
        return {
            "exploration": {
                "description": "새로운 영역 탐색",
                "risk_tolerance": 0.8,
                "learning_rate": 0.1,
                "exploration_rate": 0.3
            },
            "exploitation": {
                "description": "기존 지식 활용",
                "risk_tolerance": 0.2,
                "learning_rate": 0.05,
                "exploration_rate": 0.1
            },
            "balanced": {
                "description": "탐색과 활용 균형",
                "risk_tolerance": 0.5,
                "learning_rate": 0.075,
                "exploration_rate": 0.2
            },
            "adaptive": {
                "description": "상황에 따른 적응",
                "risk_tolerance": 0.6,
                "learning_rate": 0.08,
                "exploration_rate": 0.25
            },
            "meta_learning": {
                "description": "학습 방법 학습",
                "risk_tolerance": 0.7,
                "learning_rate": 0.12,
                "exploration_rate": 0.4
            }
        }
    
    def _initialize_adaptation_mechanisms(self) -> Dict[str, Dict]:
        """적응 메커니즘 초기화"""
        return {
            "performance_based": {
                "trigger": "성능 저하 감지",
                "action": "학습 전략 조정",
                "threshold": 0.1
            },
            "knowledge_gap": {
                "trigger": "지식 격차 발견",
                "action": "목표 재설정",
                "threshold": 0.2
            },
            "opportunity_detection": {
                "trigger": "개선 기회 발견",
                "action": "새로운 목표 추가",
                "threshold": 0.3
            },
            "stagnation_detection": {
                "trigger": "학습 정체 감지",
                "action": "전략 변경",
                "threshold": 0.05
            }
        }
    
    async def set_autonomous_learning_goals(self, current_performance: Dict[str, float]) -> List[LearningObjective]:
        """자율적으로 학습 목표 설정"""
        objectives = []
        
        # 1. 성능 분석
        performance_analysis = await self._analyze_performance_gaps(current_performance)
        
        # 2. 지식 격차 식별
        knowledge_gaps = await self._identify_knowledge_gaps()
        
        # 3. 개선 기회 발견
        improvement_opportunities = await self._discover_improvement_opportunities()
        
        # 4. 목표 우선순위 설정
        prioritized_goals = await self._prioritize_learning_goals(performance_analysis, knowledge_gaps, improvement_opportunities)
        
        # 5. 구체적 목표 생성
        for goal in prioritized_goals:
            objective = LearningObjective(
                objective_id=str(uuid.uuid4()),
                goal_type=goal["type"],
                target_metric=goal["metric"],
                target_value=goal["target"],
                current_value=goal["current"],
                priority=goal["priority"],
                deadline=datetime.now() + timedelta(days=goal["timeline"]),
                dependencies=goal.get("dependencies", [])
            )
            objectives.append(objective)
        
        self.learning_objectives = objectives
        return objectives
    
    async def _analyze_performance_gaps(self, current_performance: Dict[str, float]) -> Dict[str, float]:
        """성능 격차 분석"""
        gaps = {}
        
        # 목표 성능 기준
        target_performance = {
            "accuracy": 0.95,
            "response_time": 2.0,
            "creativity": 0.85,
            "adaptation_speed": 0.8,
            "knowledge_integration": 0.9
        }
        
        for metric, current_value in current_performance.items():
            if metric in target_performance:
                target_value = target_performance[metric]
                gap = target_value - current_value
                if gap > 0:
                    gaps[metric] = gap
        
        return gaps
    
    async def _identify_knowledge_gaps(self) -> List[Dict[str, Any]]:
        """지식 격차 식별"""
        gaps = []
        
        # 경험 분석을 통한 격차 발견 (경험 데이터가 있는 경우에만)
        if self.experience_memory:
            latest_experience = self.experience_memory[-1]
            experience_analysis = await self._analyze_experience_patterns(latest_experience)
            
            for pattern in experience_analysis:
                if pattern.get("confidence", 0.0) < 0.7:
                    gaps.append({
                        "domain": pattern.get("type", "unknown"),
                        "gap_type": "confidence_low",
                        "priority": "high",
                        "description": f"{pattern.get('type', 'unknown')} 도메인에서 신뢰도 향상 필요"
                    })
        else:
            # 기본 격차 설정
            gaps.append({
                "domain": "general",
                "gap_type": "no_experience",
                "priority": "medium",
                "description": "경험 데이터 부족으로 인한 학습 기회 필요"
            })
        
        return gaps
    
    async def _discover_improvement_opportunities(self) -> List[Dict[str, Any]]:
        """개선 기회 발견"""
        opportunities = []
        
        # 성능 히스토리 분석
        if len(self.performance_history) > 10:
            recent_performance = self.performance_history[-10:]
            trend_analysis = await self._analyze_performance_trends(recent_performance)
            
            for trend in trend_analysis:
                if trend["direction"] == "improving" and trend["rate"] < 0.05:
                    opportunities.append({
                        "type": "acceleration",
                        "domain": trend["metric"],
                        "potential": 0.3,
                        "description": f"{trend['metric']} 개선 속도 가속화"
                    })
        
        return opportunities
    
    async def _prioritize_learning_goals(self, performance_gaps: Dict[str, float], 
                                       knowledge_gaps: List[Dict[str, Any]], 
                                       opportunities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """학습 목표 우선순위 설정"""
        goals = []
        
        # 성능 격차 기반 목표
        for metric, gap in performance_gaps.items():
            goals.append({
                "type": LearningGoal.PERFORMANCE_OPTIMIZATION,
                "metric": metric,
                "current": 0.0,  # 실제 값으로 대체 필요
                "target": gap,
                "priority": int(gap * 10),
                "timeline": 30,
                "description": f"{metric} 성능 향상"
            })
        
        # 지식 격차 기반 목표
        for gap in knowledge_gaps:
            goals.append({
                "type": LearningGoal.KNOWLEDGE_ACQUISITION,
                "metric": gap["domain"],
                "current": 0.0,
                "target": 0.8,
                "priority": 8,
                "timeline": 45,
                "description": gap["description"]
            })
        
        # 개선 기회 기반 목표
        for opportunity in opportunities:
            goals.append({
                "type": LearningGoal.SKILL_IMPROVEMENT,
                "metric": opportunity["domain"],
                "current": 0.0,
                "target": opportunity["potential"],
                "priority": 6,
                "timeline": 20,
                "description": opportunity["description"]
            })
        
        # 우선순위 정렬
        goals.sort(key=lambda x: x["priority"], reverse=True)
        
        return goals[:5]  # 상위 5개 목표만 선택
    
    async def learn_from_experience(self, experience: LearningExperience) -> Dict[str, Any]:
        """경험으로부터 학습"""
        learning_outcome = {
            "new_knowledge": [],
            "pattern_discovery": [],
            "strategy_adjustment": [],
            "performance_improvement": {}
        }
        
        # 1. 경험 저장
        self.experience_memory.append(experience)
        
        # 2. 패턴 발견
        patterns = await self._discover_patterns(experience)
        learning_outcome["pattern_discovery"] = patterns
        
        # 3. 지식 업데이트
        new_knowledge = await self._extract_knowledge(experience)
        learning_outcome["new_knowledge"] = new_knowledge
        
        # 4. 전략 조정
        strategy_adjustment = await self._adjust_learning_strategy(experience)
        learning_outcome["strategy_adjustment"] = strategy_adjustment
        
        # 5. 성능 개선 측정
        performance_improvement = await self._measure_performance_improvement(experience)
        learning_outcome["performance_improvement"] = performance_improvement
        
        return learning_outcome
    
    async def _discover_patterns(self, experience: LearningExperience) -> List[Dict[str, Any]]:
        """패턴 발견"""
        patterns = []
        
        # 성공 패턴 분석
        if experience.performance_metrics.get("success", False):
            patterns.append({
                "type": "success_pattern",
                "description": "성공적인 접근법 발견",
                "confidence": 0.8,
                "applicability": "유사한 상황에 적용 가능"
            })
        
        # 실패 패턴 분석
        if experience.performance_metrics.get("success", True) == False:
            patterns.append({
                "type": "failure_pattern",
                "description": "실패 원인 분석",
                "confidence": 0.7,
                "applicability": "동일한 실패 방지"
            })
        
        return patterns
    
    async def _extract_knowledge(self, experience: LearningExperience) -> List[Dict[str, Any]]:
        """지식 추출"""
        knowledge = []
        
        # 입력-출출 관계 분석
        input_output_pattern = {
            "input_type": type(experience.input_data).__name__,
            "output_type": type(experience.output_data).__name__,
            "success_rate": experience.performance_metrics.get("success_rate", 0.0)
        }
        knowledge.append(input_output_pattern)
        
        # 성능 지표 분석
        for metric, value in experience.performance_metrics.items():
            knowledge.append({
                "metric": metric,
                "value": value,
                "insight": f"{metric}에 대한 새로운 이해"
            })
        
        return knowledge
    
    async def _adjust_learning_strategy(self, experience: LearningExperience) -> List[str]:
        """학습 전략 조정"""
        adjustments = []
        
        # 성능 기반 조정
        if experience.performance_metrics.get("success_rate", 0.0) < 0.5:
            adjustments.append("탐색 전략 강화")
        
        if experience.performance_metrics.get("efficiency", 0.0) < 0.6:
            adjustments.append("학습 효율성 최적화")
        
        # 피드백 기반 조정
        if "feedback" in experience.feedback:
            if "too_slow" in experience.feedback["feedback"]:
                adjustments.append("응답 속도 개선")
            if "too_simple" in experience.feedback["feedback"]:
                adjustments.append("복잡성 증가")
        
        return adjustments
    
    async def _measure_performance_improvement(self, experience: LearningExperience) -> Dict[str, float]:
        """성능 개선 측정"""
        improvements = {}
        
        # 이전 성능과 비교
        if len(self.performance_history) > 0:
            previous_performance = self.performance_history[-1]
            
            for metric, current_value in experience.performance_metrics.items():
                if metric in previous_performance:
                    previous_value = previous_performance[metric]
                    improvement = current_value - previous_value
                    improvements[metric] = improvement
        
        return improvements
    
    async def _analyze_experience_patterns(self, experience: LearningExperience) -> List[Dict[str, Any]]:
        """경험 패턴 분석"""
        patterns = []
        
        # 성공/실패 패턴
        if experience.performance_metrics.get("success", False):
            patterns.append({
                "type": "success_pattern",
                "description": "성공적인 접근법",
                "confidence": 0.8
            })
        else:
            patterns.append({
                "type": "failure_pattern", 
                "description": "실패 원인 분석",
                "confidence": 0.7
            })
        
        # 입력-출력 패턴
        patterns.append({
            "type": "input_output_pattern",
            "description": f"입력: {type(experience.input_data).__name__}, 출력: {type(experience.output_data).__name__}",
            "confidence": 0.6
        })
        
        return patterns
    
    async def adapt_learning_approach(self, current_performance: Dict[str, float]) -> Dict[str, Any]:
        """학습 접근법 적응"""
        adaptation = {
            "strategy_changes": [],
            "parameter_adjustments": {},
            "new_objectives": [],
            "adaptation_reason": ""
        }
        
        # 1. 성능 정체 감지
        stagnation_detected = await self._detect_stagnation(current_performance)
        if stagnation_detected:
            adaptation["strategy_changes"].append("학습 전략 변경")
            adaptation["adaptation_reason"] = "성능 정체 감지"
        
        # 2. 새로운 기회 발견
        new_opportunities = await self._detect_new_opportunities(current_performance)
        if new_opportunities:
            adaptation["new_objectives"].extend(new_opportunities)
            adaptation["adaptation_reason"] += "새로운 학습 기회 발견"
        
        # 3. 매개변수 조정
        parameter_adjustments = await self._adjust_learning_parameters(current_performance)
        adaptation["parameter_adjustments"] = parameter_adjustments
        
        return adaptation
    
    async def _detect_stagnation(self, current_performance: Dict[str, float]) -> bool:
        """성능 정체 감지"""
        if len(self.performance_history) < 5:
            return False
        
        recent_performance = self.performance_history[-5:]
        
        for metric, current_value in current_performance.items():
            if metric in recent_performance[0]:
                initial_value = recent_performance[0][metric]
                improvement_rate = (current_value - initial_value) / len(recent_performance)
                
                if improvement_rate < 0.01:  # 1% 미만 개선
                    return True
        
        return False
    
    async def _detect_new_opportunities(self, current_performance: Dict[str, float]) -> List[Dict[str, Any]]:
        """새로운 기회 발견"""
        opportunities = []
        
        # 성능 격차 분석
        target_performance = {
            "accuracy": 0.95,
            "creativity": 0.85,
            "adaptation_speed": 0.8
        }
        
        for metric, current_value in current_performance.items():
            if metric in target_performance:
                target_value = target_performance[metric]
                gap = target_value - current_value
                
                if gap > 0.1:  # 10% 이상 격차
                    opportunities.append({
                        "type": "performance_gap",
                        "metric": metric,
                        "gap": gap,
                        "priority": int(gap * 10)
                    })
        
        return opportunities
    
    async def _adjust_learning_parameters(self, current_performance: Dict[str, float]) -> Dict[str, float]:
        """학습 매개변수 조정"""
        adjustments = {}
        
        # 성능 기반 조정
        if current_performance.get("accuracy", 0.0) < 0.8:
            adjustments["learning_rate"] = 0.1  # 학습률 증가
            adjustments["exploration_rate"] = 0.3  # 탐색률 증가
        
        if current_performance.get("response_time", 5.0) > 3.0:
            adjustments["efficiency_threshold"] = 0.8  # 효율성 임계값 증가
        
        return adjustments
    
    async def get_learning_status(self) -> Dict[str, Any]:
        """학습 상태 반환"""
        return {
            "active_objectives": len(self.learning_objectives),
            "total_experiences": len(self.experience_memory),
            "discovered_patterns": len(self.knowledge_patterns),
            "performance_trend": "improving" if len(self.performance_history) > 0 else "stable",
            "adaptation_count": len(self.performance_history),
            "learning_efficiency": 0.85,  # 계산된 값으로 대체 필요
            "knowledge_coverage": 0.78,   # 계산된 값으로 대체 필요
            "recent_improvements": self.performance_history[-5:] if len(self.performance_history) >= 5 else []
        }

class SelfEvolvingSystem:
    """자기 진화 시스템"""
    
    def __init__(self):
        self.evolution_generations = 0
        self.evolution_history = []
        self.adaptation_success_rate = 0.0
        self.evolution_triggers = self._initialize_evolution_triggers()
        
    def _initialize_evolution_triggers(self) -> Dict[str, Dict]:
        """진화 트리거 초기화"""
        return {
            "performance_plateau": {
                "condition": "성능 정체 30일",
                "action": "새로운 학습 전략 도입",
                "threshold": 30
            },
            "knowledge_saturation": {
                "condition": "지식 포화도 90%",
                "action": "새로운 도메인 탐색",
                "threshold": 0.9
            },
            "adaptation_failure": {
                "condition": "적응 실패율 20%",
                "action": "진화 메커니즘 강화",
                "threshold": 0.2
            },
            "innovation_opportunity": {
                "condition": "혁신 기회 발견",
                "action": "창의적 진화",
                "threshold": 0.7
            }
        }
    
    async def check_evolution_triggers(self, current_state: Dict[str, Any]) -> List[Dict[str, Any]]:
        """진화 트리거 확인"""
        triggered_evolutions = []
        
        for trigger_name, trigger_config in self.evolution_triggers.items():
            if await self._check_trigger_condition(trigger_name, current_state, trigger_config):
                evolution_plan = await self._create_evolution_plan(trigger_name, trigger_config)
                triggered_evolutions.append(evolution_plan)
        
        return triggered_evolutions
    
    async def _check_trigger_condition(self, trigger_name: str, current_state: Dict[str, Any], 
                                     trigger_config: Dict[str, Any]) -> bool:
        """트리거 조건 확인"""
        if trigger_name == "performance_plateau":
            return current_state.get("days_without_improvement", 0) >= trigger_config["threshold"]
        elif trigger_name == "knowledge_saturation":
            return current_state.get("knowledge_coverage", 0.0) >= trigger_config["threshold"]
        elif trigger_name == "adaptation_failure":
            return current_state.get("adaptation_failure_rate", 0.0) >= trigger_config["threshold"]
        elif trigger_name == "innovation_opportunity":
            return current_state.get("innovation_potential", 0.0) >= trigger_config["threshold"]
        
        return False
    
    async def _create_evolution_plan(self, trigger_name: str, trigger_config: Dict[str, Any]) -> Dict[str, Any]:
        """진화 계획 생성"""
        return {
            "trigger": trigger_name,
            "action": trigger_config["action"],
            "priority": "high",
            "estimated_impact": 0.3,
            "implementation_time": 7,  # 일
            "description": f"{trigger_config['action']}을 통한 시스템 진화"
        }
    
    async def execute_evolution(self, evolution_plan: Dict[str, Any]) -> Dict[str, Any]:
        """진화 실행"""
        evolution_result = {
            "success": True,
            "changes": [],
            "performance_impact": {},
            "evolution_generation": self.evolution_generations + 1
        }
        
        # 진화 실행
        if evolution_plan["trigger"] == "performance_plateau":
            changes = await self._introduce_new_learning_strategy()
            evolution_result["changes"] = changes
        elif evolution_plan["trigger"] == "knowledge_saturation":
            changes = await self._explore_new_domains()
            evolution_result["changes"] = changes
        elif evolution_plan["trigger"] == "adaptation_failure":
            changes = await self._strengthen_adaptation_mechanisms()
            evolution_result["changes"] = changes
        elif evolution_plan["trigger"] == "innovation_opportunity":
            changes = await self._implement_creative_evolution()
            evolution_result["changes"] = changes
        
        # 진화 기록
        self.evolution_generations += 1
        self.evolution_history.append({
            "generation": self.evolution_generations,
            "plan": evolution_plan,
            "result": evolution_result,
            "timestamp": datetime.now()
        })
        
        return evolution_result
    
    async def _introduce_new_learning_strategy(self) -> List[str]:
        """새로운 학습 전략 도입"""
        return [
            "메타러닝 알고리즘 강화",
            "다중 모달 학습 도입",
            "적응적 학습률 조정",
            "진화적 네트워크 구조"
        ]
    
    async def _explore_new_domains(self) -> List[str]:
        """새로운 도메인 탐색"""
        return [
            "크로스 도메인 지식 전이",
            "새로운 문제 유형 학습",
            "다중 분야 통합 이해",
            "혁신적 접근법 개발"
        ]
    
    async def _strengthen_adaptation_mechanisms(self) -> List[str]:
        """적응 메커니즘 강화"""
        return [
            "실시간 적응 알고리즘 개선",
            "동적 매개변수 조정",
            "강화학습 기반 최적화",
            "예측적 적응 시스템"
        ]
    
    async def _implement_creative_evolution(self) -> List[str]:
        """창의적 진화 구현"""
        return [
            "창의적 문제 해결 능력 강화",
            "혁신적 알고리즘 개발",
            "예술적 표현 능력 향상",
            "직관적 사고 시스템"
        ]

# 자율 학습 시스템 인스턴스
autonomous_learning_system = AutonomousLearningEngine()
self_evolving_system = SelfEvolvingSystem()

async def initialize_autonomous_learning(current_performance: Dict[str, float]) -> Dict[str, Any]:
    """자율 학습 시스템 초기화"""
    # 학습 목표 설정
    objectives = await autonomous_learning_system.set_autonomous_learning_goals(current_performance)
    
    # 진화 트리거 확인
    evolution_triggers = await self_evolving_system.check_evolution_triggers({
        "days_without_improvement": 15,
        "knowledge_coverage": 0.75,
        "adaptation_failure_rate": 0.15,
        "innovation_potential": 0.6
    })
    
    return {
        "learning_objectives": [obj.__dict__ for obj in objectives],
        "evolution_triggers": evolution_triggers,
        "system_status": await autonomous_learning_system.get_learning_status()
    }

async def process_autonomous_learning_experience(experience_data: Dict[str, Any]) -> Dict[str, Any]:
    """자율 학습 경험 처리"""
    experience = LearningExperience(
        experience_id=str(uuid.uuid4()),
        task_type=experience_data.get("task_type", "unknown"),
        input_data=experience_data.get("input_data", {}),
        output_data=experience_data.get("output_data", {}),
        performance_metrics=experience_data.get("performance_metrics", {}),
        feedback=experience_data.get("feedback", {}),
        timestamp=datetime.now()
    )
    
    # 학습 수행
    learning_outcome = await autonomous_learning_system.learn_from_experience(experience)
    
    # 적응 수행
    adaptation_outcome = await autonomous_learning_system.adapt_learning_approach(
        experience.performance_metrics
    )
    
    return {
        "learning_outcome": learning_outcome,
        "adaptation_outcome": adaptation_outcome,
        "updated_status": await autonomous_learning_system.get_learning_status()
    }

if __name__ == "__main__":
    # 테스트 실행
    async def test_autonomous_learning():
        # 초기화
        current_performance = {
            "accuracy": 0.82,
            "response_time": 2.5,
            "creativity": 0.75,
            "adaptation_speed": 0.7
        }
        
        init_result = await initialize_autonomous_learning(current_performance)
        print("자율 학습 시스템 초기화 결과:")
        print(json.dumps(init_result, indent=2, ensure_ascii=False))
        
        # 경험 처리
        experience_data = {
            "task_type": "creative_writing",
            "input_data": {"prompt": "마케팅 전략 개발"},
            "output_data": {"strategy": "소셜미디어 활용 전략"},
            "performance_metrics": {
                "success_rate": 0.85,
                "creativity_score": 0.78,
                "response_time": 2.1
            },
            "feedback": {
                "user_satisfaction": 0.8,
                "improvement_suggestions": ["더 구체적인 전략 제시"]
            }
        }
        
        learning_result = await process_autonomous_learning_experience(experience_data)
        print("\n자율 학습 경험 처리 결과:")
        print(json.dumps(learning_result, indent=2, ensure_ascii=False))
    
    asyncio.run(test_autonomous_learning()) 