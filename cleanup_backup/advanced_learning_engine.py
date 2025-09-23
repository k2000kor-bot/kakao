"""
고급 학습 및 적응 기능 엔진
Advanced Learning and Adaptation Engine
"""

import json
import time
import pickle
import hashlib
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import re
import math
import numpy as np
from collections import defaultdict, deque

class LearningType(Enum):
    """학습 유형"""
    SUPERVISED = "supervised"
    UNSUPERVISED = "unsupervised"
    REINFORCEMENT = "reinforcement"
    TRANSFER = "transfer"
    META = "meta"
    CONTINUOUS = "continuous"

class AdaptationLevel(Enum):
    """적응 수준"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    DEEP = "deep"
    TRANSFORMATIVE = "transformative"

class LearningPattern(Enum):
    """학습 패턴"""
    SEQUENTIAL = "sequential"
    PARALLEL = "parallel"
    HIERARCHICAL = "hierarchical"
    ASSOCIATIVE = "associative"
    CREATIVE = "creative"
    CRITICAL = "critical"

@dataclass
class LearningData:
    """학습 데이터"""
    data_id: str
    content: str
    category: str
    difficulty: float  # 0.0 - 1.0
    importance: float  # 0.0 - 1.0
    timestamp: datetime
    user_id: str
    learning_type: LearningType
    success_rate: float  # 0.0 - 1.0
    retention_rate: float  # 0.0 - 1.0
    metadata: Dict[str, Any]

@dataclass
class LearningSession:
    """학습 세션"""
    session_id: str
    user_id: str
    start_time: datetime
    end_time: Optional[datetime]
    learning_data: List[LearningData]
    performance_metrics: Dict[str, float]
    adaptation_level: AdaptationLevel
    learning_pattern: LearningPattern
    success_rate: float
    retention_rate: float
    satisfaction_score: float

@dataclass
class AdaptiveModel:
    """적응 모델"""
    model_id: str
    user_id: str
    model_type: str
    parameters: Dict[str, Any]
    performance_history: List[float]
    adaptation_history: List[Dict[str, Any]]
    last_updated: datetime
    confidence_score: float
    prediction_accuracy: float

class AdvancedLearningEngine:
    """고급 학습 엔진"""
    
    def __init__(self):
        self.learning_data: Dict[str, List[LearningData]] = {}
        self.learning_sessions: Dict[str, List[LearningSession]] = {}
        self.adaptive_models: Dict[str, AdaptiveModel] = {}
        self.user_profiles: Dict[str, Dict[str, Any]] = {}
        self.learning_patterns = self._initialize_learning_patterns()
        self.adaptation_strategies = self._initialize_adaptation_strategies()
        self.knowledge_graph = self._initialize_knowledge_graph()
        
    def _initialize_learning_patterns(self) -> Dict[LearningPattern, Dict[str, Any]]:
        """학습 패턴 초기화"""
        return {
            LearningPattern.SEQUENTIAL: {
                "description": "순차적 학습 - 단계별로 체계적으로 학습",
                "characteristics": ["체계적", "단계적", "논리적", "구조화"],
                "best_for": ["기초 학습", "복잡한 개념", "기술 습득"],
                "korean_characteristics": ["한국인의 체계적 사고방식", "단계별 접근 선호"],
                "adaptation_strategies": ["난이도 조절", "진도 관리", "복습 강화"]
            },
            LearningPattern.PARALLEL: {
                "description": "병렬 학습 - 여러 주제를 동시에 학습",
                "characteristics": ["다양성", "연관성", "효율성", "통합성"],
                "best_for": ["종합적 이해", "연관성 파악", "효율적 학습"],
                "korean_characteristics": ["한국인의 통합적 사고", "연관성 중시"],
                "adaptation_strategies": ["연관성 강화", "통합적 접근", "다양성 유지"]
            },
            LearningPattern.HIERARCHICAL: {
                "description": "계층적 학습 - 상위 개념부터 하위 개념으로 학습",
                "characteristics": ["구조화", "체계적", "논리적", "포괄적"],
                "best_for": ["복잡한 도메인", "전문 지식", "체계적 이해"],
                "korean_characteristics": ["한국인의 계층적 사고", "체계적 접근 선호"],
                "adaptation_strategies": ["구조화 강화", "계층적 접근", "체계성 유지"]
            },
            LearningPattern.ASSOCIATIVE: {
                "description": "연상 학습 - 기존 지식과 연결하여 학습",
                "characteristics": ["연결성", "기억", "이해", "적용"],
                "best_for": ["기억 강화", "이해도 향상", "적용 능력"],
                "korean_characteristics": ["한국인의 연상적 사고", "기억 중심 학습"],
                "adaptation_strategies": ["연상 강화", "기억 도구 제공", "연결성 강화"]
            },
            LearningPattern.CREATIVE: {
                "description": "창의적 학습 - 창의적 사고를 통한 학습",
                "characteristics": ["창의성", "상상력", "혁신", "독창성"],
                "best_for": ["창의적 문제해결", "혁신적 사고", "독창적 접근"],
                "korean_characteristics": ["한국인의 창의적 사고", "상상력 활용"],
                "adaptation_strategies": ["창의성 자극", "상상력 활용", "혁신적 접근"]
            },
            LearningPattern.CRITICAL: {
                "description": "비판적 학습 - 비판적 사고를 통한 학습",
                "characteristics": ["비판적", "분석적", "논리적", "객관적"],
                "best_for": ["비판적 사고", "분석 능력", "논리적 추론"],
                "korean_characteristics": ["한국인의 비판적 사고", "분석적 접근"],
                "adaptation_strategies": ["비판적 사고 자극", "분석 능력 강화", "논리적 접근"]
            }
        }
    
    def _initialize_adaptation_strategies(self) -> Dict[AdaptationLevel, Dict[str, Any]]:
        """적응 전략 초기화"""
        return {
            AdaptationLevel.LOW: {
                "description": "낮은 적응 - 기본적인 개인화",
                "strategies": ["기본 선호도 반영", "단순한 맞춤화", "표준화된 접근"],
                "korean_characteristics": ["한국인의 기본 선호도", "표준화된 학습 방식"],
                "implementation": ["선호도 조사", "기본 맞춤화", "표준 템플릿 사용"]
            },
            AdaptationLevel.MEDIUM: {
                "description": "중간 적응 - 적당한 개인화",
                "strategies": ["학습 스타일 반영", "난이도 조절", "진도 관리"],
                "korean_characteristics": ["한국인의 학습 스타일", "적당한 맞춤화"],
                "implementation": ["학습 스타일 분석", "난이도 자동 조절", "진도 추적"]
            },
            AdaptationLevel.HIGH: {
                "description": "높은 적응 - 고도화된 개인화",
                "strategies": ["심층 분석", "동적 조절", "예측적 적응"],
                "korean_characteristics": ["한국인의 심층적 특성", "고도화된 맞춤화"],
                "implementation": ["심층 분석", "동적 조절", "예측 모델 사용"]
            },
            AdaptationLevel.DEEP: {
                "description": "깊은 적응 - 매우 정교한 개인화",
                "strategies": ["다차원 분석", "실시간 적응", "맞춤형 생성"],
                "korean_characteristics": ["한국인의 복합적 특성", "매우 정교한 맞춤화"],
                "implementation": ["다차원 분석", "실시간 적응", "맞춤형 콘텐츠 생성"]
            },
            AdaptationLevel.TRANSFORMATIVE: {
                "description": "변혁적 적응 - 혁신적인 개인화",
                "strategies": ["혁신적 접근", "예측적 생성", "지속적 진화"],
                "korean_characteristics": ["한국인의 혁신적 특성", "변혁적 맞춤화"],
                "implementation": ["혁신적 접근", "예측적 생성", "지속적 진화"]
            }
        }
    
    def _initialize_knowledge_graph(self) -> Dict[str, Any]:
        """지식 그래프 초기화"""
        return {
            "nodes": {},  # 개념 노드
            "edges": {},  # 관계 엣지
            "categories": {},  # 카테고리
            "difficulty_levels": {},  # 난이도 레벨
            "prerequisites": {},  # 선수 지식
            "learning_paths": {}  # 학습 경로
        }
    
    def add_learning_data(self, content: str, category: str, user_id: str, 
                         learning_type: LearningType = LearningType.UNSUPERVISED,
                         difficulty: float = 0.5, importance: float = 0.5) -> str:
        """학습 데이터 추가"""
        data_id = hashlib.md5(f"{content}{user_id}{time.time()}".encode()).hexdigest()[:16]
        
        learning_data = LearningData(
            data_id=data_id,
            content=content,
            category=category,
            difficulty=difficulty,
            importance=importance,
            timestamp=datetime.now(),
            user_id=user_id,
            learning_type=learning_type,
            success_rate=0.0,
            retention_rate=0.0,
            metadata={}
        )
        
        if user_id not in self.learning_data:
            self.learning_data[user_id] = []
        
        self.learning_data[user_id].append(learning_data)
        
        # 지식 그래프 업데이트
        self._update_knowledge_graph(learning_data)
        
        return data_id
    
    def _update_knowledge_graph(self, learning_data: LearningData):
        """지식 그래프 업데이트"""
        # 개념 노드 추가
        concept_id = f"concept_{learning_data.data_id}"
        self.knowledge_graph["nodes"][concept_id] = {
            "content": learning_data.content,
            "category": learning_data.category,
            "difficulty": learning_data.difficulty,
            "importance": learning_data.importance,
            "timestamp": learning_data.timestamp.isoformat()
        }
        
        # 카테고리 관계 추가
        if learning_data.category not in self.knowledge_graph["categories"]:
            self.knowledge_graph["categories"][learning_data.category] = []
        self.knowledge_graph["categories"][learning_data.category].append(concept_id)
        
        # 난이도 레벨 추가
        difficulty_level = self._get_difficulty_level(learning_data.difficulty)
        if difficulty_level not in self.knowledge_graph["difficulty_levels"]:
            self.knowledge_graph["difficulty_levels"][difficulty_level] = []
        self.knowledge_graph["difficulty_levels"][difficulty_level].append(concept_id)
    
    def _get_difficulty_level(self, difficulty: float) -> str:
        """난이도 레벨 결정"""
        if difficulty < 0.2:
            return "beginner"
        elif difficulty < 0.4:
            return "elementary"
        elif difficulty < 0.6:
            return "intermediate"
        elif difficulty < 0.8:
            return "advanced"
        else:
            return "expert"
    
    def start_learning_session(self, user_id: str, learning_pattern: LearningPattern = LearningPattern.SEQUENTIAL) -> str:
        """학습 세션 시작"""
        session_id = hashlib.md5(f"{user_id}{time.time()}".encode()).hexdigest()[:16]
        
        session = LearningSession(
            session_id=session_id,
            user_id=user_id,
            start_time=datetime.now(),
            end_time=None,
            learning_data=[],
            performance_metrics={},
            adaptation_level=AdaptationLevel.MEDIUM,
            learning_pattern=learning_pattern,
            success_rate=0.0,
            retention_rate=0.0,
            satisfaction_score=0.0
        )
        
        if user_id not in self.learning_sessions:
            self.learning_sessions[user_id] = []
        
        self.learning_sessions[user_id].append(session)
        
        return session_id
    
    def end_learning_session(self, session_id: str, user_id: str, 
                           success_rate: float, retention_rate: float, 
                           satisfaction_score: float) -> Dict[str, Any]:
        """학습 세션 종료"""
        if user_id not in self.learning_sessions:
            return {"error": "사용자를 찾을 수 없습니다"}
        
        session = None
        for s in self.learning_sessions[user_id]:
            if s.session_id == session_id:
                session = s
                break
        
        if not session:
            return {"error": "세션을 찾을 수 없습니다"}
        
        # 세션 종료
        session.end_time = datetime.now()
        session.success_rate = success_rate
        session.retention_rate = retention_rate
        session.satisfaction_score = satisfaction_score
        
        # 성능 메트릭 계산
        session.performance_metrics = self._calculate_performance_metrics(session)
        
        # 적응 수준 업데이트
        session.adaptation_level = self._determine_adaptation_level(session)
        
        # 사용자 프로필 업데이트
        self._update_user_profile(user_id, session)
        
        return {
            "session_id": session_id,
            "duration": (session.end_time - session.start_time).total_seconds(),
            "performance_metrics": session.performance_metrics,
            "adaptation_level": session.adaptation_level.value,
            "recommendations": self._generate_learning_recommendations(session)
        }
    
    def _calculate_performance_metrics(self, session: LearningSession) -> Dict[str, float]:
        """성능 메트릭 계산"""
        metrics = {
            "overall_score": 0.0,
            "learning_efficiency": 0.0,
            "retention_quality": 0.0,
            "satisfaction_level": 0.0,
            "adaptation_effectiveness": 0.0
        }
        
        # 전체 점수
        metrics["overall_score"] = (session.success_rate + session.retention_rate + session.satisfaction_score) / 3
        
        # 학습 효율성
        if session.end_time and session.start_time:
            duration_hours = (session.end_time - session.start_time).total_seconds() / 3600
            if duration_hours > 0:
                metrics["learning_efficiency"] = session.success_rate / duration_hours
        
        # 기억 품질
        metrics["retention_quality"] = session.retention_rate
        
        # 만족도
        metrics["satisfaction_level"] = session.satisfaction_score
        
        # 적응 효과성
        metrics["adaptation_effectiveness"] = min(session.success_rate * 1.2, 1.0)
        
        return metrics
    
    def _determine_adaptation_level(self, session: LearningSession) -> AdaptationLevel:
        """적응 수준 결정"""
        overall_score = (session.success_rate + session.retention_rate + session.satisfaction_score) / 3
        
        if overall_score >= 0.9:
            return AdaptationLevel.TRANSFORMATIVE
        elif overall_score >= 0.8:
            return AdaptationLevel.DEEP
        elif overall_score >= 0.7:
            return AdaptationLevel.HIGH
        elif overall_score >= 0.5:
            return AdaptationLevel.MEDIUM
        else:
            return AdaptationLevel.LOW
    
    def _update_user_profile(self, user_id: str, session: LearningSession):
        """사용자 프로필 업데이트"""
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = {
                "learning_preferences": {},
                "performance_history": [],
                "adaptation_level": AdaptationLevel.MEDIUM,
                "learning_pattern": LearningPattern.SEQUENTIAL,
                "strengths": [],
                "weaknesses": [],
                "recommendations": []
            }
        
        profile = self.user_profiles[user_id]
        
        # 성능 히스토리 추가
        profile["performance_history"].append({
            "session_id": session.session_id,
            "timestamp": session.start_time.isoformat(),
            "success_rate": session.success_rate,
            "retention_rate": session.retention_rate,
            "satisfaction_score": session.satisfaction_score,
            "adaptation_level": session.adaptation_level.value
        })
        
        # 최근 10개 세션만 유지
        if len(profile["performance_history"]) > 10:
            profile["performance_history"] = profile["performance_history"][-10:]
        
        # 적응 수준 업데이트
        profile["adaptation_level"] = session.adaptation_level
        
        # 학습 패턴 업데이트
        profile["learning_pattern"] = session.learning_pattern
        
        # 강점과 약점 분석
        self._analyze_strengths_weaknesses(user_id, session)
    
    def _analyze_strengths_weaknesses(self, user_id: str, session: LearningSession):
        """강점과 약점 분석"""
        profile = self.user_profiles[user_id]
        
        # 강점 분석
        if session.success_rate >= 0.8:
            profile["strengths"].append("높은 성공률")
        if session.retention_rate >= 0.8:
            profile["strengths"].append("우수한 기억력")
        if session.satisfaction_score >= 0.8:
            profile["strengths"].append("높은 만족도")
        
        # 약점 분석
        if session.success_rate < 0.5:
            profile["weaknesses"].append("낮은 성공률")
        if session.retention_rate < 0.5:
            profile["weaknesses"].append("기억력 부족")
        if session.satisfaction_score < 0.5:
            profile["weaknesses"].append("낮은 만족도")
        
        # 중복 제거
        profile["strengths"] = list(set(profile["strengths"]))
        profile["weaknesses"] = list(set(profile["weaknesses"]))
    
    def _generate_learning_recommendations(self, session: LearningSession) -> List[str]:
        """학습 권장사항 생성"""
        recommendations = []
        
        # 성공률 기반 권장사항
        if session.success_rate < 0.6:
            recommendations.append("학습 난이도를 낮춰보세요.")
            recommendations.append("기초 개념부터 다시 학습해보세요.")
        elif session.success_rate >= 0.8:
            recommendations.append("더 도전적인 내용을 시도해보세요.")
            recommendations.append("고급 개념으로 진도해보세요.")
        
        # 기억률 기반 권장사항
        if session.retention_rate < 0.6:
            recommendations.append("복습을 더 자주 해보세요.")
            recommendations.append("기억 도구를 활용해보세요.")
        elif session.retention_rate >= 0.8:
            recommendations.append("새로운 내용을 더 많이 학습해보세요.")
            recommendations.append("다양한 주제를 탐구해보세요.")
        
        # 만족도 기반 권장사항
        if session.satisfaction_score < 0.6:
            recommendations.append("학습 방법을 바꿔보세요.")
            recommendations.append("흥미로운 주제를 찾아보세요.")
        elif session.satisfaction_score >= 0.8:
            recommendations.append("현재 학습 방식을 유지하세요.")
            recommendations.append("다른 사람과 함께 학습해보세요.")
        
        # 적응 수준 기반 권장사항
        if session.adaptation_level == AdaptationLevel.LOW:
            recommendations.append("개인화된 학습을 시도해보세요.")
            recommendations.append("학습 스타일을 분석해보세요.")
        elif session.adaptation_level == AdaptationLevel.TRANSFORMATIVE:
            recommendations.append("혁신적인 학습 방법을 시도해보세요.")
            recommendations.append("다른 사람에게 학습 방법을 공유해보세요.")
        
        return recommendations
    
    def get_learning_recommendations(self, user_id: str) -> Dict[str, Any]:
        """학습 권장사항 조회"""
        if user_id not in self.user_profiles:
            return {"error": "사용자 프로필을 찾을 수 없습니다"}
        
        profile = self.user_profiles[user_id]
        
        # 최근 성능 분석
        recent_sessions = profile["performance_history"][-5:] if profile["performance_history"] else []
        
        if not recent_sessions:
            return {"error": "학습 데이터가 없습니다"}
        
        # 평균 성능 계산
        avg_success_rate = sum(s["success_rate"] for s in recent_sessions) / len(recent_sessions)
        avg_retention_rate = sum(s["retention_rate"] for s in recent_sessions) / len(recent_sessions)
        avg_satisfaction_score = sum(s["satisfaction_score"] for s in recent_sessions) / len(recent_sessions)
        
        # 권장사항 생성
        recommendations = []
        
        if avg_success_rate < 0.6:
            recommendations.append("학습 난이도를 조절해보세요.")
        if avg_retention_rate < 0.6:
            recommendations.append("복습을 강화해보세요.")
        if avg_satisfaction_score < 0.6:
            recommendations.append("학습 방법을 다양화해보세요.")
        
        return {
            "user_id": user_id,
            "current_adaptation_level": profile["adaptation_level"].value,
            "current_learning_pattern": profile["learning_pattern"].value,
            "average_performance": {
                "success_rate": avg_success_rate,
                "retention_rate": avg_retention_rate,
                "satisfaction_score": avg_satisfaction_score
            },
            "strengths": profile["strengths"],
            "weaknesses": profile["weaknesses"],
            "recommendations": recommendations,
            "recent_sessions_count": len(recent_sessions)
        }
    
    def create_adaptive_model(self, user_id: str, model_type: str, 
                            parameters: Dict[str, Any]) -> str:
        """적응 모델 생성"""
        model_id = hashlib.md5(f"{user_id}{model_type}{time.time()}".encode()).hexdigest()[:16]
        
        model = AdaptiveModel(
            model_id=model_id,
            user_id=user_id,
            model_type=model_type,
            parameters=parameters,
            performance_history=[],
            adaptation_history=[],
            last_updated=datetime.now(),
            confidence_score=0.0,
            prediction_accuracy=0.0
        )
        
        self.adaptive_models[model_id] = model
        
        return model_id
    
    def update_adaptive_model(self, model_id: str, performance: float, 
                            adaptation_data: Dict[str, Any]) -> Dict[str, Any]:
        """적응 모델 업데이트"""
        if model_id not in self.adaptive_models:
            return {"error": "모델을 찾을 수 없습니다"}
        
        model = self.adaptive_models[model_id]
        
        # 성능 히스토리 추가
        model.performance_history.append(performance)
        
        # 적응 히스토리 추가
        model.adaptation_history.append({
            "timestamp": datetime.now().isoformat(),
            "performance": performance,
            "adaptation_data": adaptation_data
        })
        
        # 최근 20개 기록만 유지
        if len(model.performance_history) > 20:
            model.performance_history = model.performance_history[-20:]
        if len(model.adaptation_history) > 20:
            model.adaptation_history = model.adaptation_history[-20:]
        
        # 신뢰도 점수 업데이트
        model.confidence_score = self._calculate_confidence_score(model)
        
        # 예측 정확도 업데이트
        model.prediction_accuracy = self._calculate_prediction_accuracy(model)
        
        # 마지막 업데이트 시간
        model.last_updated = datetime.now()
        
        return {
            "model_id": model_id,
            "confidence_score": model.confidence_score,
            "prediction_accuracy": model.prediction_accuracy,
            "performance_trend": self._calculate_performance_trend(model),
            "adaptation_effectiveness": self._calculate_adaptation_effectiveness(model)
        }
    
    def _calculate_confidence_score(self, model: AdaptiveModel) -> float:
        """신뢰도 점수 계산"""
        if not model.performance_history:
            return 0.0
        
        # 성능의 일관성 계산
        performance_std = np.std(model.performance_history)
        performance_mean = np.mean(model.performance_history)
        
        # 일관성이 높을수록 신뢰도 높음
        consistency_score = 1.0 - min(performance_std, 1.0)
        
        # 평균 성능이 높을수록 신뢰도 높음
        performance_score = performance_mean
        
        # 전체 신뢰도 점수
        confidence_score = (consistency_score * 0.6) + (performance_score * 0.4)
        
        return min(confidence_score, 1.0)
    
    def _calculate_prediction_accuracy(self, model: AdaptiveModel) -> float:
        """예측 정확도 계산"""
        if len(model.performance_history) < 2:
            return 0.0
        
        # 예측 정확도 계산 (간단한 예시)
        predictions = model.performance_history[:-1]
        actuals = model.performance_history[1:]
        
        if not predictions or not actuals:
            return 0.0
        
        # 평균 절대 오차 계산
        mae = np.mean([abs(p - a) for p, a in zip(predictions, actuals)])
        
        # 정확도 (1 - 오차)
        accuracy = max(0.0, 1.0 - mae)
        
        return accuracy
    
    def _calculate_performance_trend(self, model: AdaptiveModel) -> str:
        """성능 트렌드 계산"""
        if len(model.performance_history) < 3:
            return "insufficient_data"
        
        recent_performance = model.performance_history[-3:]
        
        # 트렌드 계산
        if recent_performance[0] < recent_performance[1] < recent_performance[2]:
            return "improving"
        elif recent_performance[0] > recent_performance[1] > recent_performance[2]:
            return "declining"
        else:
            return "stable"
    
    def _calculate_adaptation_effectiveness(self, model: AdaptiveModel) -> float:
        """적응 효과성 계산"""
        if len(model.adaptation_history) < 2:
            return 0.0
        
        # 적응 전후 성능 비교
        before_adaptation = model.adaptation_history[0]["performance"]
        after_adaptation = model.adaptation_history[-1]["performance"]
        
        # 효과성 (성능 향상 정도)
        effectiveness = max(0.0, after_adaptation - before_adaptation)
        
        return min(effectiveness, 1.0)
    
    def get_learning_analytics(self, user_id: str) -> Dict[str, Any]:
        """학습 분석 데이터 조회"""
        if user_id not in self.user_profiles:
            return {"error": "사용자 프로필을 찾을 수 없습니다"}
        
        profile = self.user_profiles[user_id]
        recent_sessions = profile["performance_history"][-10:] if profile["performance_history"] else []
        
        if not recent_sessions:
            return {"error": "학습 데이터가 없습니다"}
        
        # 성능 분석
        success_rates = [s["success_rate"] for s in recent_sessions]
        retention_rates = [s["retention_rate"] for s in recent_sessions]
        satisfaction_scores = [s["satisfaction_score"] for s in recent_sessions]
        
        # 통계 계산
        analytics = {
            "user_id": user_id,
            "total_sessions": len(profile["performance_history"]),
            "recent_sessions": len(recent_sessions),
            "performance_statistics": {
                "success_rate": {
                    "mean": np.mean(success_rates),
                    "std": np.std(success_rates),
                    "min": np.min(success_rates),
                    "max": np.max(success_rates)
                },
                "retention_rate": {
                    "mean": np.mean(retention_rates),
                    "std": np.std(retention_rates),
                    "min": np.min(retention_rates),
                    "max": np.max(retention_rates)
                },
                "satisfaction_score": {
                    "mean": np.mean(satisfaction_scores),
                    "std": np.std(satisfaction_scores),
                    "min": np.min(satisfaction_scores),
                    "max": np.max(satisfaction_scores)
                }
            },
            "learning_patterns": {
                "current_pattern": profile["learning_pattern"].value,
                "adaptation_level": profile["adaptation_level"].value,
                "strengths": profile["strengths"],
                "weaknesses": profile["weaknesses"]
            },
            "recommendations": self._generate_advanced_recommendations(profile, recent_sessions)
        }
        
        return analytics
    
    def _generate_advanced_recommendations(self, profile: Dict[str, Any], 
                                         recent_sessions: List[Dict[str, Any]]) -> List[str]:
        """고급 권장사항 생성"""
        recommendations = []
        
        # 성능 기반 권장사항
        avg_success_rate = np.mean([s["success_rate"] for s in recent_sessions])
        avg_retention_rate = np.mean([s["retention_rate"] for s in recent_sessions])
        avg_satisfaction_score = np.mean([s["satisfaction_score"] for s in recent_sessions])
        
        if avg_success_rate < 0.6:
            recommendations.append("학습 난이도를 단계적으로 조절해보세요.")
            recommendations.append("기초 개념부터 체계적으로 학습해보세요.")
        elif avg_success_rate >= 0.8:
            recommendations.append("더 도전적인 프로젝트를 시도해보세요.")
            recommendations.append("다른 사람에게 가르쳐보세요.")
        
        if avg_retention_rate < 0.6:
            recommendations.append("간격 반복 학습을 시도해보세요.")
            recommendations.append("다양한 기억 도구를 활용해보세요.")
        elif avg_retention_rate >= 0.8:
            recommendations.append("새로운 지식을 기존 지식과 연결해보세요.")
            recommendations.append("실제 상황에 적용해보세요.")
        
        if avg_satisfaction_score < 0.6:
            recommendations.append("학습 방법을 다양화해보세요.")
            recommendations.append("흥미로운 주제를 찾아보세요.")
        elif avg_satisfaction_score >= 0.8:
            recommendations.append("현재 학습 방식을 유지하세요.")
            recommendations.append("다른 사람과 함께 학습해보세요.")
        
        # 적응 수준 기반 권장사항
        current_adaptation_level = profile["adaptation_level"]
        if current_adaptation_level == AdaptationLevel.LOW:
            recommendations.append("개인화된 학습을 시도해보세요.")
            recommendations.append("학습 스타일을 분석해보세요.")
        elif current_adaptation_level == AdaptationLevel.TRANSFORMATIVE:
            recommendations.append("혁신적인 학습 방법을 시도해보세요.")
            recommendations.append("다른 사람에게 학습 방법을 공유해보세요.")
        
        return recommendations
