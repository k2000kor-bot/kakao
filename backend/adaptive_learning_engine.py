import json
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from collections import defaultdict, deque
import pickle
import hashlib
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import threading
import time


@dataclass
class LearningEvent:
    """학습 이벤트"""
    event_id: str
    event_type: str  # 'generation', 'feedback', 'optimization'
    timestamp: datetime
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    effectiveness_score: float
    user_feedback: Optional[Dict[str, Any]]
    context_metadata: Dict[str, Any]


@dataclass
class PerformanceMetrics:
    """성능 메트릭"""
    accuracy: float
    efficiency: float
    user_satisfaction: float
    adaptation_speed: float
    consistency: float
    innovation_index: float


@dataclass
class LearningPattern:
    """학습 패턴"""
    pattern_id: str
    pattern_name: str
    trigger_conditions: Dict[str, Any]
    success_rate: float
    usage_frequency: int
    last_optimization: datetime
    effectiveness_trend: List[float]
    adaptation_rules: Dict[str, Any]


class AdaptiveLearningEngine:
    """적응형 학습 엔진"""
    
    def __init__(self):
        self.learning_events = deque(maxlen=10000)  # 최대 10,000개 이벤트
        self.performance_history = deque(maxlen=1000)  # 성능 이력
        self.learning_patterns = {}
        self.adaptation_rules = {}
        self.user_profiles = {}
        self.context_clusters = {}
        
        # 실시간 학습 설정
        self.learning_rate = 0.01
        self.adaptation_threshold = 0.1
        self.pattern_discovery_interval = 100  # 100개 이벤트마다 패턴 분석
        
        # 백그라운드 학습 스레드
        self.learning_thread = None
        self.learning_active = False
        
        # 성능 추적
        self.current_metrics = PerformanceMetrics(
            accuracy=0.7,
            efficiency=0.6,
            user_satisfaction=0.5,
            adaptation_speed=0.4,
            consistency=0.8,
            innovation_index=0.3
        )
        
        self._initialize_learning_system()
    
    def _initialize_learning_system(self):
        """학습 시스템 초기화"""
        
        # 기본 학습 패턴 설정
        self._setup_base_patterns()
        
        # 적응 규칙 초기화
        self._initialize_adaptation_rules()
        
        # 백그라운드 학습 시작
        self._start_background_learning()
    
    def _setup_base_patterns(self):
        """기본 학습 패턴 설정"""
        
        base_patterns = {
            "executive_preference": LearningPattern(
                pattern_id="exec_pref_001",
                pattern_name="임원진 선호 패턴",
                trigger_conditions={
                    "target_audience": "임원진",
                    "urgency_level": ["긴급", "높음"],
                    "content_length": {"min": 100, "max": 300}
                },
                success_rate=0.85,
                usage_frequency=0,
                last_optimization=datetime.now(),
                effectiveness_trend=[0.8, 0.82, 0.85],
                adaptation_rules={
                    "prefer_conclusion_first": True,
                    "minimize_technical_details": True,
                    "emphasize_business_impact": True
                }
            ),
            "technical_detail": LearningPattern(
                pattern_id="tech_detail_001",
                pattern_name="기술진 상세 패턴",
                trigger_conditions={
                    "target_audience": "기술진",
                    "complexity_level": ["complex", "advanced"],
                    "detail_preference": {"min": 0.7}
                },
                success_rate=0.78,
                usage_frequency=0,
                last_optimization=datetime.now(),
                effectiveness_trend=[0.75, 0.77, 0.78],
                adaptation_rules={
                    "include_technical_specifications": True,
                    "provide_detailed_methodology": True,
                    "use_professional_terminology": True
                }
            ),
            "collaborative_consensus": LearningPattern(
                pattern_id="collab_cons_001",
                pattern_name="협의 합의 패턴",
                trigger_conditions={
                    "stakeholder_complexity": {"min": 0.6},
                    "decision_style": "collaborative",
                    "consensus_required": True
                },
                success_rate=0.72,
                usage_frequency=0,
                last_optimization=datetime.now(),
                effectiveness_trend=[0.68, 0.70, 0.72],
                adaptation_rules={
                    "address_multiple_perspectives": True,
                    "propose_compromise_solutions": True,
                    "emphasize_shared_benefits": True
                }
            )
        }
        
        self.learning_patterns.update(base_patterns)
    
    def _initialize_adaptation_rules(self):
        """적응 규칙 초기화"""
        
        self.adaptation_rules = {
            "performance_thresholds": {
                "effectiveness_min": 0.7,
                "user_satisfaction_min": 0.6,
                "consistency_min": 0.8
            },
            "learning_triggers": {
                "low_performance_count": 3,      # 연속 저성과 횟수
                "feedback_score_threshold": 0.5, # 피드백 점수 임계치
                "pattern_staleness_days": 30     # 패턴 업데이트 주기
            },
            "adaptation_strategies": {
                "performance_boost": {
                    "increase_detail_level": 0.1,
                    "enhance_credibility_signals": True,
                    "adjust_complexity_down": 0.05
                },
                "satisfaction_improvement": {
                    "increase_personalization": 0.15,
                    "add_emotional_elements": 0.1,
                    "improve_readability": True
                },
                "consistency_maintenance": {
                    "standardize_terminology": True,
                    "maintain_logical_structure": True,
                    "preserve_brand_voice": True
                }
            }
        }
    
    def record_learning_event(
        self,
        event_type: str,
        input_data: Dict[str, Any],
        output_data: Dict[str, Any],
        effectiveness_score: float,
        user_feedback: Optional[Dict[str, Any]] = None,
        context_metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """학습 이벤트 기록"""
        
        event_id = f"learn_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(str(input_data)) % 10000}"
        
        event = LearningEvent(
            event_id=event_id,
            event_type=event_type,
            timestamp=datetime.now(),
            input_data=input_data,
            output_data=output_data,
            effectiveness_score=effectiveness_score,
            user_feedback=user_feedback,
            context_metadata=context_metadata or {}
        )
        
        self.learning_events.append(event)
        
        # 실시간 학습 트리거
        if len(self.learning_events) % self.pattern_discovery_interval == 0:
            self._trigger_pattern_discovery()
        
        # 성능 메트릭 업데이트
        self._update_performance_metrics(event)
        
        return event_id
    
    def _trigger_pattern_discovery(self):
        """패턴 발견 트리거"""
        
        if not self.learning_active:
            return
        
        recent_events = list(self.learning_events)[-self.pattern_discovery_interval:]
        
        # 새로운 패턴 발견
        new_patterns = self._discover_patterns(recent_events)
        
        # 기존 패턴 업데이트
        self._update_existing_patterns(recent_events)
        
        # 성능 기반 적응
        self._adapt_based_on_performance()
    
    def _discover_patterns(self, events: List[LearningEvent]) -> List[LearningPattern]:
        """새로운 패턴 발견"""
        
        if len(events) < 10:
            return []
        
        # 고성과 이벤트 필터링
        high_performance_events = [
            event for event in events 
            if event.effectiveness_score > 0.8
        ]
        
        if len(high_performance_events) < 5:
            return []
        
        # 공통 특성 추출
        common_features = self._extract_common_features(high_performance_events)
        
        # 새 패턴 생성
        new_patterns = []
        for feature_set in common_features:
            if self._validate_pattern_uniqueness(feature_set):
                pattern = self._create_pattern_from_features(feature_set, high_performance_events)
                new_patterns.append(pattern)
                self.learning_patterns[pattern.pattern_id] = pattern
        
        return new_patterns
    
    def _extract_common_features(self, events: List[LearningEvent]) -> List[Dict[str, Any]]:
        """공통 특성 추출"""
        
        feature_groups = defaultdict(list)
        
        for event in events:
            # 입력 데이터에서 특성 추출
            input_features = self._extract_features_from_input(event.input_data)
            
            # 컨텍스트에서 특성 추출
            context_features = self._extract_features_from_context(event.context_metadata)
            
            # 특성 조합
            combined_features = {**input_features, **context_features}
            
            # 특성별 그룹화
            for feature_name, feature_value in combined_features.items():
                feature_groups[feature_name].append(feature_value)
        
        # 공통 특성 식별
        common_features = []
        for feature_name, values in feature_groups.items():
            if len(set(values)) == 1:  # 모든 이벤트에서 동일한 값
                common_features.append({feature_name: values[0]})
            elif self._is_numeric_pattern(values):  # 수치 패턴
                pattern = self._identify_numeric_pattern(values)
                if pattern:
                    common_features.append({feature_name: pattern})
        
        return common_features
    
    def _extract_features_from_input(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """입력 데이터에서 특성 추출"""
        
        features = {}
        
        # 직접적 특성
        direct_features = [
            "target_audience", "urgency_level", "message_type",
            "complexity_level", "personalization_applied"
        ]
        
        for feature in direct_features:
            if feature in input_data:
                features[feature] = input_data[feature]
        
        # 계산된 특성
        if "context_data" in input_data:
            context_data = input_data["context_data"]
            
            # 컨텍스트 복잡도
            features["context_complexity"] = len(context_data) / 10
            
            # 데이터 완성도
            required_fields = ["project_type", "stakeholders", "timeline"]
            completion_rate = sum(1 for field in required_fields if field in context_data) / len(required_fields)
            features["data_completeness"] = completion_rate
        
        return features
    
    def _extract_features_from_context(self, context_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """컨텍스트에서 특성 추출"""
        
        features = {}
        
        # 시간적 특성
        if "generation_time" in context_metadata:
            features["generation_time"] = context_metadata["generation_time"]
        
        # 사용자 특성
        if "user_profile" in context_metadata:
            user_profile = context_metadata["user_profile"]
            features["user_experience_level"] = user_profile.get("experience_level", "medium")
            features["user_preference_style"] = user_profile.get("communication_style", "standard")
        
        # 환경적 특성
        features["time_of_day"] = datetime.now().hour
        features["day_of_week"] = datetime.now().weekday()
        
        return features
    
    def _is_numeric_pattern(self, values: List[Any]) -> bool:
        """수치 패턴 여부 확인"""
        try:
            [float(v) for v in values]
            return True
        except (ValueError, TypeError):
            return False
    
    def _identify_numeric_pattern(self, values: List[float]) -> Optional[Dict[str, float]]:
        """수치 패턴 식별"""
        
        if len(values) < 3:
            return None
        
        numeric_values = [float(v) for v in values]
        
        # 범위 패턴
        min_val = min(numeric_values)
        max_val = max(numeric_values)
        
        if max_val - min_val < 0.1:  # 거의 동일한 값들
            return {"value": np.mean(numeric_values)}
        else:  # 범위 패턴
            return {"min": min_val, "max": max_val}
    
    def _validate_pattern_uniqueness(self, feature_set: Dict[str, Any]) -> bool:
        """패턴 고유성 검증"""
        
        for existing_pattern in self.learning_patterns.values():
            # 기존 패턴과의 유사도 계산
            similarity = self._calculate_pattern_similarity(
                feature_set, existing_pattern.trigger_conditions
            )
            
            if similarity > 0.8:  # 80% 이상 유사하면 중복으로 판단
                return False
        
        return True
    
    def _calculate_pattern_similarity(
        self, 
        features1: Dict[str, Any], 
        features2: Dict[str, Any]
    ) -> float:
        """패턴 유사도 계산"""
        
        common_keys = set(features1.keys()) & set(features2.keys())
        
        if not common_keys:
            return 0.0
        
        matches = 0
        for key in common_keys:
            if features1[key] == features2[key]:
                matches += 1
        
        return matches / len(common_keys)
    
    def _create_pattern_from_features(
        self, 
        features: Dict[str, Any], 
        events: List[LearningEvent]
    ) -> LearningPattern:
        """특성에서 패턴 생성"""
        
        pattern_id = f"discovered_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        pattern_name = f"발견된 패턴 {len(self.learning_patterns) + 1}"
        
        # 성공률 계산
        success_rate = np.mean([event.effectiveness_score for event in events])
        
        # 효과성 트렌드
        effectiveness_trend = [event.effectiveness_score for event in events[-5:]]
        
        # 적응 규칙 추론
        adaptation_rules = self._infer_adaptation_rules(events)
        
        return LearningPattern(
            pattern_id=pattern_id,
            pattern_name=pattern_name,
            trigger_conditions=features,
            success_rate=success_rate,
            usage_frequency=len(events),
            last_optimization=datetime.now(),
            effectiveness_trend=effectiveness_trend,
            adaptation_rules=adaptation_rules
        )
    
    def _infer_adaptation_rules(self, events: List[LearningEvent]) -> Dict[str, Any]:
        """적응 규칙 추론"""
        
        rules = {}
        
        # 출력 데이터 분석
        output_features = defaultdict(list)
        for event in events:
            output_data = event.output_data
            
            # 메시지 길이
            if "content" in output_data:
                output_features["content_length"].append(len(output_data["content"]))
            
            # 구조 복잡도
            if "sections" in output_data:
                output_features["structure_complexity"].append(len(output_data["sections"]))
            
            # 개인화 수준
            if "personalization_applied" in output_data:
                output_features["personalization_level"].append(
                    1 if output_data["personalization_applied"] else 0
                )
        
        # 규칙 생성
        for feature, values in output_features.items():
            if len(values) > 0:
                if feature == "content_length":
                    rules["optimal_content_length"] = {
                        "min": int(np.percentile(values, 25)),
                        "max": int(np.percentile(values, 75))
                    }
                elif feature == "structure_complexity":
                    rules["preferred_structure_complexity"] = int(np.median(values))
                elif feature == "personalization_level":
                    rules["require_personalization"] = np.mean(values) > 0.5
        
        return rules
    
    def _update_existing_patterns(self, events: List[LearningEvent]):
        """기존 패턴 업데이트"""
        
        for pattern_id, pattern in self.learning_patterns.items():
            # 해당 패턴을 사용한 이벤트 필터링
            matching_events = [
                event for event in events
                if self._event_matches_pattern(event, pattern)
            ]
            
            if matching_events:
                # 성공률 업데이트
                new_scores = [event.effectiveness_score for event in matching_events]
                pattern.success_rate = (
                    pattern.success_rate * 0.8 + np.mean(new_scores) * 0.2
                )
                
                # 사용 빈도 업데이트
                pattern.usage_frequency += len(matching_events)
                
                # 효과성 트렌드 업데이트
                pattern.effectiveness_trend.extend(new_scores)
                pattern.effectiveness_trend = pattern.effectiveness_trend[-10:]  # 최근 10개만 유지
                
                # 적응 규칙 업데이트
                if len(matching_events) >= 3:
                    updated_rules = self._infer_adaptation_rules(matching_events)
                    pattern.adaptation_rules.update(updated_rules)
                
                pattern.last_optimization = datetime.now()
    
    def _event_matches_pattern(self, event: LearningEvent, pattern: LearningPattern) -> bool:
        """이벤트가 패턴에 매치되는지 확인"""
        
        input_features = self._extract_features_from_input(event.input_data)
        context_features = self._extract_features_from_context(event.context_metadata)
        all_features = {**input_features, **context_features}
        
        for condition_key, condition_value in pattern.trigger_conditions.items():
            if condition_key not in all_features:
                continue
            
            feature_value = all_features[condition_key]
            
            # 정확한 매치
            if isinstance(condition_value, (str, int, bool)):
                if feature_value != condition_value:
                    return False
            
            # 리스트 매치
            elif isinstance(condition_value, list):
                if feature_value not in condition_value:
                    return False
            
            # 범위 매치
            elif isinstance(condition_value, dict):
                if "min" in condition_value and feature_value < condition_value["min"]:
                    return False
                if "max" in condition_value and feature_value > condition_value["max"]:
                    return False
        
        return True
    
    def _adapt_based_on_performance(self):
        """성능 기반 적응"""
        
        current_performance = self.current_metrics
        thresholds = self.adaptation_rules["performance_thresholds"]
        
        adaptations_needed = []
        
        # 성능 임계치 확인
        if current_performance.accuracy < thresholds["effectiveness_min"]:
            adaptations_needed.append("performance_boost")
        
        if current_performance.user_satisfaction < thresholds["user_satisfaction_min"]:
            adaptations_needed.append("satisfaction_improvement")
        
        if current_performance.consistency < thresholds["consistency_min"]:
            adaptations_needed.append("consistency_maintenance")
        
        # 적응 실행
        for adaptation_type in adaptations_needed:
            self._execute_adaptation(adaptation_type)
    
    def _execute_adaptation(self, adaptation_type: str):
        """적응 실행"""
        
        strategies = self.adaptation_rules["adaptation_strategies"].get(adaptation_type, {})
        
        if adaptation_type == "performance_boost":
            # 성능 향상 전략
            self._adjust_complexity_parameters(strategies)
            self._enhance_credibility_signals(strategies)
        
        elif adaptation_type == "satisfaction_improvement":
            # 만족도 개선 전략
            self._increase_personalization_level(strategies)
            self._improve_emotional_resonance(strategies)
        
        elif adaptation_type == "consistency_maintenance":
            # 일관성 유지 전략
            self._standardize_output_format(strategies)
            self._maintain_brand_voice(strategies)
    
    def _adjust_complexity_parameters(self, strategies: Dict[str, Any]):
        """복잡도 매개변수 조정"""
        
        if "adjust_complexity_down" in strategies:
            adjustment = strategies["adjust_complexity_down"]
            
            # 모든 패턴의 복잡도 관련 규칙 조정
            for pattern in self.learning_patterns.values():
                if "preferred_structure_complexity" in pattern.adaptation_rules:
                    current_complexity = pattern.adaptation_rules["preferred_structure_complexity"]
                    pattern.adaptation_rules["preferred_structure_complexity"] = max(
                        1, int(current_complexity * (1 - adjustment))
                    )
    
    def _enhance_credibility_signals(self, strategies: Dict[str, Any]):
        """신뢰성 신호 강화"""
        
        if strategies.get("enhance_credibility_signals"):
            # 모든 패턴에 신뢰성 강화 규칙 추가
            for pattern in self.learning_patterns.values():
                pattern.adaptation_rules["emphasize_data_sources"] = True
                pattern.adaptation_rules["include_verification_steps"] = True
    
    def _increase_personalization_level(self, strategies: Dict[str, Any]):
        """개인화 수준 증가"""
        
        if "increase_personalization" in strategies:
            increase_factor = strategies["increase_personalization"]
            
            for pattern in self.learning_patterns.values():
                pattern.adaptation_rules["personalization_boost"] = increase_factor
    
    def _improve_emotional_resonance(self, strategies: Dict[str, Any]):
        """감정적 공명 개선"""
        
        if "add_emotional_elements" in strategies:
            emotional_boost = strategies["add_emotional_elements"]
            
            for pattern in self.learning_patterns.values():
                pattern.adaptation_rules["emotional_enhancement"] = emotional_boost
    
    def _standardize_output_format(self, strategies: Dict[str, Any]):
        """출력 형식 표준화"""
        
        if strategies.get("standardize_terminology"):
            # 용어 표준화 규칙 추가
            for pattern in self.learning_patterns.values():
                pattern.adaptation_rules["use_standard_terminology"] = True
    
    def _maintain_brand_voice(self, strategies: Dict[str, Any]):
        """브랜드 보이스 유지"""
        
        if strategies.get("preserve_brand_voice"):
            for pattern in self.learning_patterns.values():
                pattern.adaptation_rules["maintain_voice_consistency"] = True
    
    def _update_performance_metrics(self, event: LearningEvent):
        """성능 메트릭 업데이트"""
        
        # 효과성 업데이트
        self.current_metrics.accuracy = (
            self.current_metrics.accuracy * 0.9 + event.effectiveness_score * 0.1
        )
        
        # 사용자 만족도 업데이트 (피드백이 있는 경우)
        if event.user_feedback:
            satisfaction_score = event.user_feedback.get("satisfaction", 0.5)
            self.current_metrics.user_satisfaction = (
                self.current_metrics.user_satisfaction * 0.9 + satisfaction_score * 0.1
            )
        
        # 적응 속도 계산
        recent_events = list(self.learning_events)[-10:]
        if len(recent_events) >= 2:
            effectiveness_changes = [
                abs(recent_events[i].effectiveness_score - recent_events[i-1].effectiveness_score)
                for i in range(1, len(recent_events))
            ]
            self.current_metrics.adaptation_speed = np.mean(effectiveness_changes)
        
        # 일관성 계산
        if len(recent_events) >= 5:
            recent_scores = [e.effectiveness_score for e in recent_events]
            consistency = 1.0 - np.std(recent_scores)
            self.current_metrics.consistency = max(0, consistency)
        
        # 성능 이력 저장
        self.performance_history.append({
            "timestamp": datetime.now(),
            "metrics": asdict(self.current_metrics),
            "event_id": event.event_id
        })
    
    def _start_background_learning(self):
        """백그라운드 학습 시작"""
        
        self.learning_active = True
        
        def background_learning_loop():
            while self.learning_active:
                try:
                    # 주기적 패턴 최적화
                    self._optimize_patterns_periodically()
                    
                    # 성능 모니터링
                    self._monitor_system_health()
                    
                    # 클러스터링 업데이트
                    self._update_context_clusters()
                    
                    time.sleep(300)  # 5분마다 실행
                    
                except Exception as e:
                    print(f"Background learning error: {e}")
                    time.sleep(60)  # 오류 시 1분 대기
        
        self.learning_thread = threading.Thread(target=background_learning_loop, daemon=True)
        self.learning_thread.start()
    
    def _optimize_patterns_periodically(self):
        """주기적 패턴 최적화"""
        
        current_time = datetime.now()
        stale_threshold = timedelta(days=self.adaptation_rules["learning_triggers"]["pattern_staleness_days"])
        
        for pattern_id, pattern in self.learning_patterns.items():
            if current_time - pattern.last_optimization > stale_threshold:
                # 오래된 패턴 최적화
                self._optimize_single_pattern(pattern)
    
    def _optimize_single_pattern(self, pattern: LearningPattern):
        """단일 패턴 최적화"""
        
        # 최근 사용 이벤트 분석
        recent_events = [
            event for event in self.learning_events
            if self._event_matches_pattern(event, pattern)
            and (datetime.now() - event.timestamp).days <= 30
        ]
        
        if len(recent_events) >= 5:
            # 성과 트렌드 분석
            recent_scores = [event.effectiveness_score for event in recent_events]
            trend_direction = self._calculate_trend_direction(recent_scores)
            
            if trend_direction < -0.1:  # 하향 트렌드
                # 패턴 조정 필요
                self._adjust_pattern_parameters(pattern, recent_events)
            
            pattern.last_optimization = datetime.now()
    
    def _calculate_trend_direction(self, scores: List[float]) -> float:
        """트렌드 방향 계산"""
        
        if len(scores) < 3:
            return 0.0
        
        # 선형 회귀를 통한 기울기 계산
        x = np.arange(len(scores))
        y = np.array(scores)
        
        slope = np.polyfit(x, y, 1)[0]
        return slope
    
    def _adjust_pattern_parameters(self, pattern: LearningPattern, events: List[LearningEvent]):
        """패턴 매개변수 조정"""
        
        # 저성과 이벤트 분석
        low_performance_events = [e for e in events if e.effectiveness_score < 0.6]
        
        if low_performance_events:
            # 공통 문제점 식별
            common_issues = self._identify_common_issues(low_performance_events)
            
            # 적응 규칙 조정
            for issue, solution in common_issues.items():
                pattern.adaptation_rules[issue] = solution
    
    def _identify_common_issues(self, events: List[LearningEvent]) -> Dict[str, Any]:
        """공통 문제점 식별"""
        
        issues = {}
        
        # 메시지 길이 문제
        content_lengths = []
        for event in events:
            if "content" in event.output_data:
                content_lengths.append(len(event.output_data["content"]))
        
        if content_lengths:
            avg_length = np.mean(content_lengths)
            if avg_length > 500:
                issues["reduce_content_length"] = True
            elif avg_length < 100:
                issues["increase_content_detail"] = True
        
        # 개인화 부족 문제
        personalization_rates = []
        for event in events:
            if "personalization_applied" in event.output_data:
                personalization_rates.append(1 if event.output_data["personalization_applied"] else 0)
        
        if personalization_rates and np.mean(personalization_rates) < 0.3:
            issues["increase_personalization"] = True
        
        return issues
    
    def _monitor_system_health(self):
        """시스템 상태 모니터링"""
        
        current_performance = self.current_metrics
        
        # 성능 저하 감지
        if current_performance.accuracy < 0.5:
            self._trigger_emergency_adaptation()
        
        # 메모리 사용량 모니터링
        if len(self.learning_events) > 8000:
            self._cleanup_old_events()
    
    def _trigger_emergency_adaptation(self):
        """비상 적응 트리거"""
        
        print("Emergency adaptation triggered due to low performance")
        
        # 모든 패턴의 적응 규칙 리셋
        for pattern in self.learning_patterns.values():
            pattern.adaptation_rules = self._get_safe_adaptation_rules()
        
        # 학습률 임시 증가
        self.learning_rate *= 2
    
    def _get_safe_adaptation_rules(self) -> Dict[str, Any]:
        """안전한 적응 규칙 반환"""
        
        return {
            "use_simple_structure": True,
            "include_clear_examples": True,
            "maintain_formal_tone": True,
            "provide_step_by_step_logic": True
        }
    
    def _cleanup_old_events(self):
        """오래된 이벤트 정리"""
        
        # 30일 이전 이벤트 제거
        cutoff_date = datetime.now() - timedelta(days=30)
        
        self.learning_events = deque([
            event for event in self.learning_events
            if event.timestamp > cutoff_date
        ], maxlen=10000)
    
    def _update_context_clusters(self):
        """컨텍스트 클러스터 업데이트"""
        
        if len(self.learning_events) < 50:
            return
        
        # 컨텍스트 특성 추출
        context_features = []
        for event in list(self.learning_events)[-100:]:  # 최근 100개
            features = self._extract_features_from_context(event.context_metadata)
            numeric_features = []
            
            for key, value in features.items():
                if isinstance(value, (int, float)):
                    numeric_features.append(value)
                elif isinstance(value, str):
                    # 문자열을 해시값으로 변환
                    numeric_features.append(hash(value) % 1000 / 1000)
            
            if len(numeric_features) >= 3:  # 최소 3개 특성 필요
                context_features.append(numeric_features[:5])  # 최대 5개 특성
        
        if len(context_features) >= 10:
            try:
                # K-means 클러스터링
                scaler = StandardScaler()
                scaled_features = scaler.fit_transform(context_features)
                
                kmeans = KMeans(n_clusters=min(5, len(context_features) // 10), random_state=42)
                clusters = kmeans.fit_predict(scaled_features)
                
                # 클러스터 정보 저장
                self.context_clusters = {
                    "cluster_centers": kmeans.cluster_centers_.tolist(),
                    "cluster_labels": clusters.tolist(),
                    "scaler_params": {
                        "mean": scaler.mean_.tolist(),
                        "scale": scaler.scale_.tolist()
                    },
                    "last_updated": datetime.now()
                }
                
            except Exception as e:
                print(f"Clustering error: {e}")
    
    def get_adaptive_recommendations(
        self,
        input_data: Dict[str, Any],
        context_metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """적응형 권고사항 제공"""
        
        # 가장 적합한 패턴 찾기
        best_pattern = self._find_best_pattern(input_data, context_metadata)
        
        if not best_pattern:
            return {"message": "적용 가능한 패턴을 찾을 수 없습니다."}
        
        # 권고사항 생성
        recommendations = {
            "recommended_pattern": {
                "pattern_id": best_pattern.pattern_id,
                "pattern_name": best_pattern.pattern_name,
                "success_rate": best_pattern.success_rate,
                "confidence": self._calculate_pattern_confidence(best_pattern)
            },
            "adaptation_rules": best_pattern.adaptation_rules,
            "optimization_suggestions": self._generate_optimization_suggestions(
                best_pattern, input_data
            ),
            "performance_prediction": self._predict_performance(best_pattern, input_data),
            "alternative_patterns": [
                {
                    "pattern_id": p.pattern_id,
                    "pattern_name": p.pattern_name,
                    "success_rate": p.success_rate
                }
                for p in self._find_alternative_patterns(input_data, context_metadata)[:3]
            ]
        }
        
        return recommendations
    
    def _find_best_pattern(
        self,
        input_data: Dict[str, Any],
        context_metadata: Dict[str, Any]
    ) -> Optional[LearningPattern]:
        """최적 패턴 찾기"""
        
        input_features = self._extract_features_from_input(input_data)
        context_features = self._extract_features_from_context(context_metadata)
        all_features = {**input_features, **context_features}
        
        best_pattern = None
        best_score = 0
        
        for pattern in self.learning_patterns.values():
            # 패턴 적합도 계산
            match_score = self._calculate_pattern_match_score(pattern, all_features)
            
            # 성과 가중치 적용
            weighted_score = match_score * pattern.success_rate
            
            if weighted_score > best_score:
                best_score = weighted_score
                best_pattern = pattern
        
        return best_pattern
    
    def _calculate_pattern_match_score(
        self,
        pattern: LearningPattern,
        features: Dict[str, Any]
    ) -> float:
        """패턴 매치 점수 계산"""
        
        total_conditions = len(pattern.trigger_conditions)
        if total_conditions == 0:
            return 0
        
        matches = 0
        for condition_key, condition_value in pattern.trigger_conditions.items():
            if condition_key in features:
                feature_value = features[condition_key]
                
                if self._values_match(condition_value, feature_value):
                    matches += 1
        
        return matches / total_conditions
    
    def _values_match(self, condition_value: Any, feature_value: Any) -> bool:
        """값 매치 여부 확인"""
        
        # 정확한 매치
        if condition_value == feature_value:
            return True
        
        # 리스트 매치
        if isinstance(condition_value, list) and feature_value in condition_value:
            return True
        
        # 범위 매치
        if isinstance(condition_value, dict):
            if isinstance(feature_value, (int, float)):
                min_val = condition_value.get("min", float('-inf'))
                max_val = condition_value.get("max", float('inf'))
                return min_val <= feature_value <= max_val
        
        return False
    
    def _calculate_pattern_confidence(self, pattern: LearningPattern) -> float:
        """패턴 신뢰도 계산"""
        
        factors = []
        
        # 사용 빈도 기반 신뢰도
        usage_confidence = min(pattern.usage_frequency / 100, 1.0)
        factors.append(usage_confidence)
        
        # 효과성 트렌드 기반 신뢰도
        if len(pattern.effectiveness_trend) >= 3:
            trend_stability = 1.0 - np.std(pattern.effectiveness_trend)
            factors.append(max(0, trend_stability))
        
        # 최근 업데이트 기반 신뢰도
        days_since_update = (datetime.now() - pattern.last_optimization).days
        freshness_confidence = max(0, 1.0 - days_since_update / 30)
        factors.append(freshness_confidence)
        
        return np.mean(factors)
    
    def _generate_optimization_suggestions(
        self,
        pattern: LearningPattern,
        input_data: Dict[str, Any]
    ) -> List[str]:
        """최적화 제안 생성"""
        
        suggestions = []
        
        # 패턴 특성 기반 제안
        if pattern.success_rate < 0.7:
            suggestions.append("패턴 성과가 낮으므로 추가적인 개인화 적용을 권장합니다")
        
        if pattern.usage_frequency < 10:
            suggestions.append("패턴 사용 빈도가 낮으므로 더 많은 학습 데이터가 필요합니다")
        
        # 적응 규칙 기반 제안
        adaptation_rules = pattern.adaptation_rules
        
        if adaptation_rules.get("optimal_content_length"):
            length_range = adaptation_rules["optimal_content_length"]
            suggestions.append(
                f"최적 메시지 길이는 {length_range['min']}-{length_range['max']}자입니다"
            )
        
        if adaptation_rules.get("require_personalization"):
            suggestions.append("개인화 적용이 권장됩니다")
        
        return suggestions
    
    def _predict_performance(
        self,
        pattern: LearningPattern,
        input_data: Dict[str, Any]
    ) -> Dict[str, float]:
        """성능 예측"""
        
        base_performance = pattern.success_rate
        
        # 컨텍스트 적합도에 따른 조정
        context_adjustment = 0
        
        # 사용자 프로필 매치도
        if "target_audience" in input_data:
            audience = input_data["target_audience"]
            if audience in pattern.pattern_name.lower():
                context_adjustment += 0.1
        
        # 복잡도 매치도
        if "complexity_level" in input_data:
            complexity = input_data["complexity_level"]
            if complexity in ["complex", "advanced"] and "detail" in pattern.pattern_name.lower():
                context_adjustment += 0.05
        
        predicted_effectiveness = min(1.0, base_performance + context_adjustment)
        
        return {
            "effectiveness": predicted_effectiveness,
            "confidence": self._calculate_pattern_confidence(pattern),
            "improvement_potential": max(0, 0.9 - predicted_effectiveness)
        }
    
    def _find_alternative_patterns(
        self,
        input_data: Dict[str, Any],
        context_metadata: Dict[str, Any]
    ) -> List[LearningPattern]:
        """대안 패턴 찾기"""
        
        input_features = self._extract_features_from_input(input_data)
        context_features = self._extract_features_from_context(context_metadata)
        all_features = {**input_features, **context_features}
        
        pattern_scores = []
        
        for pattern in self.learning_patterns.values():
            match_score = self._calculate_pattern_match_score(pattern, all_features)
            if match_score > 0.3:  # 최소 30% 매치
                pattern_scores.append((pattern, match_score * pattern.success_rate))
        
        # 점수순 정렬
        pattern_scores.sort(key=lambda x: x[1], reverse=True)
        
        return [pattern for pattern, score in pattern_scores[1:]]  # 최고 점수 제외
    
    def get_learning_analytics(self) -> Dict[str, Any]:
        """학습 분석 정보 제공"""
        
        analytics = {
            "system_overview": {
                "total_learning_events": len(self.learning_events),
                "active_patterns": len(self.learning_patterns),
                "learning_active": self.learning_active,
                "current_performance": asdict(self.current_metrics)
            },
            "pattern_statistics": self._analyze_pattern_statistics(),
            "performance_trends": self._analyze_performance_trends(),
            "learning_insights": self._generate_learning_insights(),
            "optimization_opportunities": self._identify_optimization_opportunities()
        }
        
        return analytics
    
    def _analyze_pattern_statistics(self) -> Dict[str, Any]:
        """패턴 통계 분석"""
        
        if not self.learning_patterns:
            return {"message": "패턴 데이터가 없습니다"}
        
        success_rates = [p.success_rate for p in self.learning_patterns.values()]
        usage_frequencies = [p.usage_frequency for p in self.learning_patterns.values()]
        
        return {
            "total_patterns": len(self.learning_patterns),
            "average_success_rate": np.mean(success_rates),
            "success_rate_std": np.std(success_rates),
            "most_used_pattern": max(
                self.learning_patterns.values(),
                key=lambda p: p.usage_frequency
            ).pattern_name,
            "highest_performing_pattern": max(
                self.learning_patterns.values(),
                key=lambda p: p.success_rate
            ).pattern_name,
            "usage_distribution": {
                "mean": np.mean(usage_frequencies),
                "median": np.median(usage_frequencies),
                "max": max(usage_frequencies) if usage_frequencies else 0
            }
        }
    
    def _analyze_performance_trends(self) -> Dict[str, Any]:
        """성능 트렌드 분석"""
        
        if len(self.performance_history) < 5:
            return {"message": "충분한 성능 데이터가 없습니다"}
        
        recent_history = list(self.performance_history)[-20:]  # 최근 20개
        
        # 트렌드 계산
        timestamps = [h["timestamp"] for h in recent_history]
        accuracies = [h["metrics"]["accuracy"] for h in recent_history]
        satisfactions = [h["metrics"]["user_satisfaction"] for h in recent_history]
        
        accuracy_trend = self._calculate_trend_direction(accuracies)
        satisfaction_trend = self._calculate_trend_direction(satisfactions)
        
        return {
            "performance_trajectory": {
                "accuracy_trend": "향상" if accuracy_trend > 0.01 else "안정" if accuracy_trend > -0.01 else "하락",
                "satisfaction_trend": "향상" if satisfaction_trend > 0.01 else "안정" if satisfaction_trend > -0.01 else "하락",
                "overall_stability": np.std(accuracies) < 0.1
            },
            "current_vs_initial": {
                "accuracy_change": accuracies[-1] - accuracies[0],
                "satisfaction_change": satisfactions[-1] - satisfactions[0]
            },
            "peak_performance": {
                "best_accuracy": max(accuracies),
                "best_satisfaction": max(satisfactions),
                "achieved_at": timestamps[accuracies.index(max(accuracies))].isoformat()
            }
        }
    
    def _generate_learning_insights(self) -> List[str]:
        """학습 인사이트 생성"""
        
        insights = []
        
        # 패턴 효과성 인사이트
        if self.learning_patterns:
            avg_success = np.mean([p.success_rate for p in self.learning_patterns.values()])
            if avg_success > 0.8:
                insights.append("전반적으로 높은 패턴 효과성을 보이고 있습니다")
            elif avg_success < 0.6:
                insights.append("패턴 효과성 개선이 필요합니다")
        
        # 학습 속도 인사이트
        if self.current_metrics.adaptation_speed > 0.1:
            insights.append("빠른 적응 속도를 보이고 있어 동적 환경에 적합합니다")
        elif self.current_metrics.adaptation_speed < 0.05:
            insights.append("안정적인 성능을 유지하고 있습니다")
        
        # 일관성 인사이트
        if self.current_metrics.consistency > 0.8:
            insights.append("높은 일관성으로 신뢰할 수 있는 결과를 제공합니다")
        elif self.current_metrics.consistency < 0.6:
            insights.append("일관성 개선을 통해 안정성을 높일 수 있습니다")
        
        # 혁신성 인사이트
        if self.current_metrics.innovation_index > 0.5:
            insights.append("새로운 패턴 발견 능력이 우수합니다")
        
        return insights
    
    def _identify_optimization_opportunities(self) -> List[Dict[str, Any]]:
        """최적화 기회 식별"""
        
        opportunities = []
        
        # 저성과 패턴 최적화
        low_performance_patterns = [
            p for p in self.learning_patterns.values()
            if p.success_rate < 0.6
        ]
        
        if low_performance_patterns:
            opportunities.append({
                "type": "pattern_optimization",
                "description": f"{len(low_performance_patterns)}개 패턴의 성능 개선 필요",
                "priority": "high",
                "estimated_impact": "15-25% 성능 향상"
            })
        
        # 데이터 부족 패턴
        low_data_patterns = [
            p for p in self.learning_patterns.values()
            if p.usage_frequency < 5
        ]
        
        if low_data_patterns:
            opportunities.append({
                "type": "data_collection",
                "description": f"{len(low_data_patterns)}개 패턴의 학습 데이터 부족",
                "priority": "medium",
                "estimated_impact": "패턴 신뢰도 향상"
            })
        
        # 클러스터링 기회
        if len(self.learning_events) > 100 and not self.context_clusters:
            opportunities.append({
                "type": "clustering_analysis",
                "description": "컨텍스트 클러스터링을 통한 세분화 가능",
                "priority": "medium",
                "estimated_impact": "개인화 정확도 10-15% 향상"
            })
        
        return opportunities
    
    def stop_learning(self):
        """학습 중지"""
        self.learning_active = False
        if self.learning_thread and self.learning_thread.is_alive():
            self.learning_thread.join(timeout=5)
    
    def save_learning_state(self, filepath: str):
        """학습 상태 저장"""
        
        state = {
            "learning_patterns": {pid: asdict(pattern) for pid, pattern in self.learning_patterns.items()},
            "adaptation_rules": self.adaptation_rules,
            "current_metrics": asdict(self.current_metrics),
            "context_clusters": self.context_clusters,
            "save_timestamp": datetime.now().isoformat()
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(state, f)
    
    def load_learning_state(self, filepath: str):
        """학습 상태 로드"""
        
        try:
            with open(filepath, 'rb') as f:
                state = pickle.load(f)
            
            # 학습 패턴 복원
            self.learning_patterns = {}
            for pid, pattern_dict in state.get("learning_patterns", {}).items():
                # datetime 객체 복원
                pattern_dict["last_optimization"] = datetime.fromisoformat(
                    pattern_dict["last_optimization"]
                )
                self.learning_patterns[pid] = LearningPattern(**pattern_dict)
            
            # 기타 상태 복원
            self.adaptation_rules = state.get("adaptation_rules", {})
            if "current_metrics" in state:
                self.current_metrics = PerformanceMetrics(**state["current_metrics"])
            self.context_clusters = state.get("context_clusters", {})
            
            print(f"Learning state loaded successfully from {filepath}")
            
        except Exception as e:
            print(f"Failed to load learning state: {e}")


# 테스트 함수
def test_adaptive_learning_engine():
    """적응형 학습 엔진 테스트"""
    
    engine = AdaptiveLearningEngine()
    
    # 샘플 학습 이벤트 생성
    for i in range(50):
        input_data = {
            "target_audience": ["임원진", "실무진", "기술진"][i % 3],
            "message_type": "recommendation",
            "complexity_level": ["simple", "moderate", "complex"][i % 3],
            "context_data": {
                "project_type": "재개발",
                "urgency_level": ["낮음", "보통", "높음"][i % 3]
            }
        }
        
        output_data = {
            "content": f"테스트 메시지 {i}" * (10 + i % 20),
            "personalization_applied": i % 2 == 0,
            "sections": ["intro", "analysis", "conclusion"][:1 + i % 3]
        }
        
        effectiveness = 0.5 + (i % 10) * 0.05  # 0.5-0.95 범위
        
        user_feedback = {
            "satisfaction": 0.3 + (i % 8) * 0.1
        } if i % 5 == 0 else None
        
        context_metadata = {
            "user_profile": {
                "experience_level": ["beginner", "intermediate", "expert"][i % 3],
                "communication_style": ["formal", "casual"][i % 2]
            },
            "generation_time": 1.0 + (i % 5) * 0.2
        }
        
        event_id = engine.record_learning_event(
            event_type="generation",
            input_data=input_data,
            output_data=output_data,
            effectiveness_score=effectiveness,
            user_feedback=user_feedback,
            context_metadata=context_metadata
        )
    
    # 적응형 권고사항 테스트
    test_input = {
        "target_audience": "임원진",
        "message_type": "recommendation",
        "complexity_level": "moderate"
    }
    
    test_context = {
        "user_profile": {
            "experience_level": "expert",
            "communication_style": "formal"
        }
    }
    
    recommendations = engine.get_adaptive_recommendations(test_input, test_context)
    
    print("=== 적응형 학습 엔진 테스트 결과 ===")
    print(f"학습 이벤트 수: {len(engine.learning_events)}")
    print(f"발견된 패턴 수: {len(engine.learning_patterns)}")
    print(f"현재 성능 지표:")
    print(f"  - 정확도: {engine.current_metrics.accuracy:.3f}")
    print(f"  - 사용자 만족도: {engine.current_metrics.user_satisfaction:.3f}")
    print(f"  - 일관성: {engine.current_metrics.consistency:.3f}")
    
    print(f"\n권고된 패턴: {recommendations.get('recommended_pattern', {}).get('pattern_name', 'None')}")
    
    # 학습 분석 정보
    analytics = engine.get_learning_analytics()
    print(f"\n학습 인사이트:")
    for insight in analytics.get("learning_insights", []):
        print(f"  - {insight}")
    
    # 정리
    engine.stop_learning()


if __name__ == "__main__":
    test_adaptive_learning_engine() 