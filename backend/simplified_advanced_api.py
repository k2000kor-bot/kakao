"""
Simplified Advanced API
단순화된 고도화 API 시스템

Features:
- Advanced context analysis without heavy dependencies
- Multi-dimensional conversation understanding
- Predictive modeling with statistical methods
- Real-time optimization
- Performance analytics
"""

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import time
import random
import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from collections import defaultdict, Counter
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Simplified Advanced KakaoTalk Analysis API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@dataclass
class AdvancedAnalysisResult:
    """고도화 분석 결과"""
    temporal_intelligence: Dict[str, Any]
    emotional_intelligence: Dict[str, Any]
    social_intelligence: Dict[str, Any]
    cultural_intelligence: Dict[str, Any]
    strategic_intelligence: Dict[str, Any]
    overall_confidence: float
    analysis_depth: str
    processing_time: float

@dataclass
class PredictiveInsight:
    """예측적 인사이트"""
    prediction_type: str
    prediction_content: str
    confidence: float
    time_horizon: str
    supporting_evidence: List[str]
    risk_factors: List[str]

class AdvancedContextAnalyzer:
    """고도화된 컨텍스트 분석기"""
    
    def __init__(self):
        self.analysis_cache = {}
        self.korean_patterns = self._load_korean_patterns()
        
    def _load_korean_patterns(self) -> Dict[str, Any]:
        """한국어 패턴 데이터 로드"""
        return {
            "emotion_indicators": {
                "positive": ["좋아", "기쁘", "만족", "효과", "성공", "도움"],
                "negative": ["싫어", "화나", "실망", "문제", "어려", "걱정"],
                "neutral": ["그래", "알겠", "이해", "확인", "검토", "논의"]
            },
            "urgency_markers": {
                "high": ["긴급", "빨리", "즉시", "당장", "시급", "급하"],
                "medium": ["빠른", "신속", "조속", "이른", "서둘러"],
                "low": ["천천히", "차근차근", "신중", "여유", "점진적"]
            },
            "social_hierarchy": {
                "formal": ["습니다", "있습니다", "드립니다", "께서"],
                "semi_formal": ["해요", "이에요", "가요", "세요"],
                "casual": ["해", "야", "어", "지"]
            },
            "decision_patterns": {
                "decisive": ["결정", "확정", "선택", "채택", "승인"],
                "consultative": ["논의", "검토", "상의", "협의", "토의"],
                "uncertain": ["고민", "망설", "확신", "불안", "의문"]
            }
        }
    
    async def analyze_advanced_context(self, 
                                     conversation_data: Dict[str, Any],
                                     analysis_depth: str = "expert") -> AdvancedAnalysisResult:
        """고도화된 컨텍스트 분석 수행"""
        
        start_time = time.time()
        
        try:
            messages = conversation_data.get('messages', [])
            participants = conversation_data.get('participants', [])
            
            # 각 차원별 분석 수행
            temporal_analysis = self._analyze_temporal_intelligence(messages)
            emotional_analysis = self._analyze_emotional_intelligence(messages)
            social_analysis = self._analyze_social_intelligence(messages, participants)
            cultural_analysis = self._analyze_cultural_intelligence(messages)
            strategic_analysis = self._analyze_strategic_intelligence(messages, analysis_depth)
            
            # 전체 신뢰도 계산
            confidence_scores = [
                temporal_analysis.get('confidence', 0.5),
                emotional_analysis.get('confidence', 0.5),
                social_analysis.get('confidence', 0.5),
                cultural_analysis.get('confidence', 0.5),
                strategic_analysis.get('confidence', 0.5)
            ]
            overall_confidence = sum(confidence_scores) / len(confidence_scores)
            
            processing_time = time.time() - start_time
            
            return AdvancedAnalysisResult(
                temporal_intelligence=temporal_analysis,
                emotional_intelligence=emotional_analysis,
                social_intelligence=social_analysis,
                cultural_intelligence=cultural_analysis,
                strategic_intelligence=strategic_analysis,
                overall_confidence=overall_confidence,
                analysis_depth=analysis_depth,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"Advanced context analysis failed: {e}")
            return self._create_fallback_analysis(analysis_depth)
    
    def _analyze_temporal_intelligence(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """시간적 지능 분석"""
        
        if not messages:
            return {"confidence": 0.0, "patterns": {}, "insights": []}
        
        # 시간 패턴 분석
        timestamps = []
        for msg in messages:
            try:
                ts = datetime.fromisoformat(msg.get('timestamp', ''))
                timestamps.append(ts)
            except:
                continue
        
        if len(timestamps) < 2:
            return {"confidence": 0.3, "patterns": {"insufficient_data": True}, "insights": []}
        
        # 응답 간격 분석
        intervals = []
        for i in range(1, len(timestamps)):
            interval = (timestamps[i] - timestamps[i-1]).total_seconds()
            intervals.append(interval)
        
        avg_interval = sum(intervals) / len(intervals) if intervals else 0
        interval_variance = sum((x - avg_interval) ** 2 for x in intervals) / len(intervals) if intervals else 0
        
        # 시간대별 활동 분석
        hour_activity = defaultdict(int)
        for ts in timestamps:
            hour_activity[ts.hour] += 1
        
        peak_hour = max(hour_activity.items(), key=lambda x: x[1])[0] if hour_activity else 12
        
        # 대화 리듬 분석
        if avg_interval < 60:  # 1분 이내
            rhythm = "rapid_fire"
            urgency_score = 0.9
        elif avg_interval < 300:  # 5분 이내
            rhythm = "active"
            urgency_score = 0.7
        elif avg_interval < 1800:  # 30분 이내
            rhythm = "moderate"
            urgency_score = 0.5
        else:
            rhythm = "slow"
            urgency_score = 0.3
        
        # 일관성 점수 (낮은 분산 = 높은 일관성)
        consistency_score = 1.0 / (1.0 + interval_variance / 1000)
        
        insights = [
            f"대화 리듬: {rhythm}",
            f"평균 응답 간격: {avg_interval:.1f}초",
            f"주요 활동 시간: {peak_hour}시",
            f"대화 일관성: {consistency_score:.2f}"
        ]
        
        return {
            "confidence": 0.8,
            "patterns": {
                "rhythm": rhythm,
                "avg_interval_seconds": avg_interval,
                "interval_variance": interval_variance,
                "peak_hour": peak_hour,
                "consistency_score": consistency_score,
                "urgency_score": urgency_score
            },
            "insights": insights,
            "metrics": {
                "total_messages": len(messages),
                "time_span_hours": (timestamps[-1] - timestamps[0]).total_seconds() / 3600 if len(timestamps) > 1 else 0,
                "messages_per_hour": len(messages) / max(1, (timestamps[-1] - timestamps[0]).total_seconds() / 3600) if len(timestamps) > 1 else 0
            }
        }
    
    def _analyze_emotional_intelligence(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """감정적 지능 분석"""
        
        if not messages:
            return {"confidence": 0.0, "emotions": {}, "trajectory": []}
        
        emotion_scores = {
            "positive": 0.0,
            "negative": 0.0,
            "neutral": 0.0
        }
        
        emotion_trajectory = []
        detailed_emotions = {
            "joy": 0.0, "satisfaction": 0.0, "optimism": 0.0,
            "anger": 0.0, "frustration": 0.0, "concern": 0.0,
            "calm": 0.0, "professional": 0.0, "analytical": 0.0
        }
        
        for msg in messages:
            content = msg.get('content', '').lower()
            msg_emotions = {"positive": 0.0, "negative": 0.0, "neutral": 0.0}
            
            # 감정 키워드 매칭
            for emotion_type, keywords in self.korean_patterns["emotion_indicators"].items():
                score = sum(1 for keyword in keywords if keyword in content)
                msg_emotions[emotion_type] = min(1.0, score * 0.3)
                emotion_scores[emotion_type] += msg_emotions[emotion_type]
            
            # 세부 감정 분석
            if "좋" in content or "기쁘" in content:
                detailed_emotions["joy"] += 0.5
            if "만족" in content or "효과" in content:
                detailed_emotions["satisfaction"] += 0.5
            if "성공" in content or "도움" in content:
                detailed_emotions["optimism"] += 0.5
            
            if "화" in content or "짜증" in content:
                detailed_emotions["anger"] += 0.5
            if "답답" in content or "힘들" in content:
                detailed_emotions["frustration"] += 0.5
            if "걱정" in content or "우려" in content:
                detailed_emotions["concern"] += 0.5
            
            if "차분" in content or "안정" in content:
                detailed_emotions["calm"] += 0.5
            if "검토" in content or "분석" in content:
                detailed_emotions["analytical"] += 0.5
            if "업무" in content or "공식" in content:
                detailed_emotions["professional"] += 0.5
            
            emotion_trajectory.append({
                "timestamp": msg.get('timestamp'),
                "emotions": msg_emotions.copy()
            })
        
        # 정규화
        total_messages = len(messages)
        for emotion in emotion_scores:
            emotion_scores[emotion] /= total_messages
        
        for emotion in detailed_emotions:
            detailed_emotions[emotion] = min(1.0, detailed_emotions[emotion] / total_messages)
        
        # 감정 변화율 계산
        emotion_volatility = 0.0
        if len(emotion_trajectory) > 1:
            changes = []
            for i in range(1, len(emotion_trajectory)):
                prev_emotions = emotion_trajectory[i-1]["emotions"]
                curr_emotions = emotion_trajectory[i]["emotions"]
                change = sum(abs(curr_emotions[e] - prev_emotions[e]) for e in prev_emotions)
                changes.append(change)
            emotion_volatility = sum(changes) / len(changes) if changes else 0.0
        
        # 지배적 감정 결정
        dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])
        
        insights = [
            f"지배적 감정: {dominant_emotion[0]} ({dominant_emotion[1]:.2f})",
            f"감정 변화율: {emotion_volatility:.2f}",
            f"감정적 안정성: {'높음' if emotion_volatility < 0.3 else '보통' if emotion_volatility < 0.6 else '낮음'}"
        ]
        
        return {
            "confidence": 0.85,
            "emotions": emotion_scores,
            "detailed_emotions": detailed_emotions,
            "trajectory": emotion_trajectory,
            "insights": insights,
            "metrics": {
                "dominant_emotion": dominant_emotion[0],
                "emotion_strength": dominant_emotion[1],
                "emotion_volatility": emotion_volatility,
                "emotional_complexity": len([e for e in emotion_scores.values() if e > 0.2])
            }
        }
    
    def _analyze_social_intelligence(self, messages: List[Dict[str, Any]], participants: List[str]) -> Dict[str, Any]:
        """사회적 지능 분석"""
        
        if not messages or not participants:
            return {"confidence": 0.0, "dynamics": {}, "roles": {}}
        
        # 참여자별 분석
        participant_stats = defaultdict(lambda: {
            "message_count": 0,
            "total_length": 0,
            "avg_length": 0,
            "response_times": [],
            "formality_score": 0.0,
            "influence_score": 0.0
        })
        
        # 메시지 분석
        prev_timestamp = None
        prev_sender = None
        
        for msg in messages:
            sender = msg.get('sender', 'unknown')
            content = msg.get('content', '')
            timestamp_str = msg.get('timestamp', '')
            
            if sender in participant_stats or sender in participants:
                participant_stats[sender]["message_count"] += 1
                participant_stats[sender]["total_length"] += len(content)
                
                # 격식도 분석
                formality = 0.0
                for formal_marker in self.korean_patterns["social_hierarchy"]["formal"]:
                    if formal_marker in content:
                        formality += 0.3
                for semi_formal_marker in self.korean_patterns["social_hierarchy"]["semi_formal"]:
                    if semi_formal_marker in content:
                        formality += 0.2
                participant_stats[sender]["formality_score"] += formality
                
                # 응답 시간 분석
                if prev_timestamp and prev_sender != sender:
                    try:
                        curr_time = datetime.fromisoformat(timestamp_str)
                        prev_time = datetime.fromisoformat(prev_timestamp)
                        response_time = (curr_time - prev_time).total_seconds()
                        participant_stats[sender]["response_times"].append(response_time)
                    except:
                        pass
                
                prev_timestamp = timestamp_str
                prev_sender = sender
        
        # 통계 계산
        for sender, stats in participant_stats.items():
            if stats["message_count"] > 0:
                stats["avg_length"] = stats["total_length"] / stats["message_count"]
                stats["formality_score"] /= stats["message_count"]
                
                # 영향력 점수 (메시지 수, 길이, 응답 유발 등 고려)
                stats["influence_score"] = (
                    stats["message_count"] * 0.4 +
                    min(stats["avg_length"] / 50, 2.0) * 0.3 +
                    (2.0 - min(len(stats["response_times"]) / 10, 2.0)) * 0.3
                )
        
        # 대화 역학 분석
        total_messages = len(messages)
        participation_balance = self._calculate_participation_balance(participant_stats, total_messages)
        hierarchy_detected = any(stats["formality_score"] > 0.5 for stats in participant_stats.values())
        
        # 상호작용 패턴
        interaction_patterns = self._analyze_interaction_patterns(messages)
        
        insights = [
            f"참여 균형도: {participation_balance:.2f}",
            f"계층 구조 감지: {'예' if hierarchy_detected else '아니오'}",
            f"주요 발언자: {max(participant_stats.items(), key=lambda x: x[1]['influence_score'])[0] if participant_stats else 'N/A'}"
        ]
        
        return {
            "confidence": 0.9,
            "dynamics": {
                "participation_balance": participation_balance,
                "hierarchy_detected": hierarchy_detected,
                "total_participants": len(participant_stats),
                "interaction_patterns": interaction_patterns
            },
            "roles": dict(participant_stats),
            "insights": insights,
            "metrics": {
                "dominant_speaker": max(participant_stats.items(), key=lambda x: x[1]['message_count'])[0] if participant_stats else None,
                "avg_formality": sum(stats["formality_score"] for stats in participant_stats.values()) / len(participant_stats) if participant_stats else 0,
                "response_efficiency": sum(len(stats["response_times"]) for stats in participant_stats.values()) / len(participant_stats) if participant_stats else 0
            }
        }
    
    def _analyze_cultural_intelligence(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """문화적 지능 분석"""
        
        cultural_markers = {
            "collectivism": 0.0,    # 집단주의
            "hierarchy": 0.0,       # 계층의식
            "harmony": 0.0,         # 조화 중시
            "face_saving": 0.0,     # 체면 중시
            "indirect_communication": 0.0  # 간접 소통
        }
        
        collectivism_words = ["우리", "함께", "같이", "모두", "전체", "공동"]
        hierarchy_words = ["선배", "후배", "상급자", "하급자", "님", "께서"]
        harmony_words = ["조화", "화합", "평화", "균형", "상생", "협력"]
        face_saving_words = ["체면", "명예", "존중", "배려", "예의", "신중"]
        indirect_words = ["아마", "아닌가", "같습니다", "것 같아", "듯이", "처럼"]
        
        total_score = 0.0
        
        for msg in messages:
            content = msg.get('content', '')
            
            # 각 문화적 차원 점수 계산
            cultural_markers["collectivism"] += sum(0.2 for word in collectivism_words if word in content)
            cultural_markers["hierarchy"] += sum(0.2 for word in hierarchy_words if word in content)
            cultural_markers["harmony"] += sum(0.2 for word in harmony_words if word in content)
            cultural_markers["face_saving"] += sum(0.2 for word in face_saving_words if word in content)
            cultural_markers["indirect_communication"] += sum(0.2 for word in indirect_words if word in content)
        
        # 정규화
        total_messages = len(messages) if messages else 1
        for marker in cultural_markers:
            cultural_markers[marker] = min(1.0, cultural_markers[marker] / total_messages)
            total_score += cultural_markers[marker]
        
        # 문화적 복잡성
        cultural_complexity = len([score for score in cultural_markers.values() if score > 0.3])
        
        # 지배적 문화적 특성
        dominant_trait = max(cultural_markers.items(), key=lambda x: x[1])
        
        insights = [
            f"지배적 문화 특성: {dominant_trait[0]} ({dominant_trait[1]:.2f})",
            f"문화적 복잡성: {cultural_complexity}/5",
            f"한국 문화 적합도: {total_score / 5:.2f}"
        ]
        
        return {
            "confidence": 0.75,
            "cultural_markers": cultural_markers,
            "insights": insights,
            "metrics": {
                "dominant_trait": dominant_trait[0],
                "cultural_complexity": cultural_complexity,
                "korean_cultural_fitness": total_score / 5,
                "total_cultural_score": total_score
            }
        }
    
    def _analyze_strategic_intelligence(self, messages: List[Dict[str, Any]], analysis_depth: str) -> Dict[str, Any]:
        """전략적 지능 분석"""
        
        if analysis_depth == "basic":
            return {"confidence": 0.5, "strategies": ["기본 분석"], "complexity": 1}
        
        strategic_patterns = {
            "persuasion": 0.0,          # 설득
            "information_seeking": 0.0,  # 정보 탐색
            "consensus_building": 0.0,   # 합의 구축
            "problem_solving": 0.0,      # 문제 해결
            "relationship_building": 0.0, # 관계 구축
            "authority_exercise": 0.0    # 권위 행사
        }
        
        persuasion_words = ["설득", "납득", "이해시키", "동의", "찬성"]
        info_seeking_words = ["궁금", "질문", "문의", "알고", "확인", "조사"]
        consensus_words = ["합의", "의견", "토론", "논의", "상의", "협의"]
        problem_solving_words = ["해결", "방법", "방안", "대책", "개선", "수정"]
        relationship_words = ["관계", "친목", "소통", "이해", "공감", "배려"]
        authority_words = ["결정", "지시", "명령", "승인", "허가", "규정"]
        
        for msg in messages:
            content = msg.get('content', '')
            
            strategic_patterns["persuasion"] += sum(0.3 for word in persuasion_words if word in content)
            strategic_patterns["information_seeking"] += sum(0.3 for word in info_seeking_words if word in content)
            strategic_patterns["consensus_building"] += sum(0.3 for word in consensus_words if word in content)
            strategic_patterns["problem_solving"] += sum(0.3 for word in problem_solving_words if word in content)
            strategic_patterns["relationship_building"] += sum(0.3 for word in relationship_words if word in content)
            strategic_patterns["authority_exercise"] += sum(0.3 for word in authority_words if word in content)
        
        # 정규화
        total_messages = len(messages) if messages else 1
        for pattern in strategic_patterns:
            strategic_patterns[pattern] = min(1.0, strategic_patterns[pattern] / total_messages)
        
        # 전략적 복잡성
        active_strategies = [strategy for strategy, score in strategic_patterns.items() if score > 0.2]
        strategic_complexity = len(active_strategies)
        
        # 주요 전략
        primary_strategy = max(strategic_patterns.items(), key=lambda x: x[1])
        
        # 고급 분석 (genius 레벨)
        advanced_insights = []
        if analysis_depth == "genius":
            # 전략 조합 분석
            if strategic_patterns["consensus_building"] > 0.5 and strategic_patterns["problem_solving"] > 0.5:
                advanced_insights.append("협력적 문제해결 패턴 감지")
            
            if strategic_patterns["authority_exercise"] > 0.3 and strategic_patterns["persuasion"] > 0.3:
                advanced_insights.append("권위적 설득 패턴 감지")
            
            if strategic_patterns["information_seeking"] > 0.4:
                advanced_insights.append("데이터 기반 의사결정 성향")
        
        insights = [
            f"주요 전략: {primary_strategy[0]} ({primary_strategy[1]:.2f})",
            f"전략적 복잡성: {strategic_complexity}/6"
        ] + advanced_insights
        
        confidence = 0.6 if analysis_depth == "basic" else 0.8 if analysis_depth == "expert" else 0.95
        
        return {
            "confidence": confidence,
            "strategies": strategic_patterns,
            "insights": insights,
            "metrics": {
                "primary_strategy": primary_strategy[0],
                "strategic_complexity": strategic_complexity,
                "strategy_diversity": len([s for s in strategic_patterns.values() if s > 0.1]),
                "advanced_patterns": advanced_insights
            },
            "complexity": strategic_complexity
        }
    
    def _calculate_participation_balance(self, participant_stats: Dict, total_messages: int) -> float:
        """참여 균형도 계산"""
        if not participant_stats or total_messages == 0:
            return 0.0
        
        message_counts = [stats["message_count"] for stats in participant_stats.values()]
        if not message_counts:
            return 0.0
        
        # Gini 계수의 역수로 균형도 계산
        n = len(message_counts)
        if n <= 1:
            return 1.0
        
        sorted_counts = sorted(message_counts)
        index = list(range(1, n + 1))
        
        gini = (2 * sum(i * count for i, count in zip(index, sorted_counts))) / (n * sum(sorted_counts)) - (n + 1) / n
        balance = 1.0 - gini
        
        return max(0.0, min(1.0, balance))
    
    def _analyze_interaction_patterns(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """상호작용 패턴 분석"""
        
        if len(messages) < 2:
            return {"pattern_type": "insufficient_data"}
        
        # 연속 발화 패턴
        speaker_sequence = [msg.get('sender', '') for msg in messages]
        consecutive_counts = []
        current_count = 1
        
        for i in range(1, len(speaker_sequence)):
            if speaker_sequence[i] == speaker_sequence[i-1]:
                current_count += 1
            else:
                consecutive_counts.append(current_count)
                current_count = 1
        consecutive_counts.append(current_count)
        
        avg_consecutive = sum(consecutive_counts) / len(consecutive_counts)
        
        # 대화 턴 분석
        unique_speakers = len(set(speaker_sequence))
        turn_taking_balance = unique_speakers / len(messages) if messages else 0
        
        # 패턴 유형 결정
        if avg_consecutive > 3:
            pattern_type = "monologue_dominant"
        elif turn_taking_balance > 0.3:
            pattern_type = "highly_interactive"
        elif turn_taking_balance > 0.1:
            pattern_type = "moderately_interactive"
        else:
            pattern_type = "low_interaction"
        
        return {
            "pattern_type": pattern_type,
            "avg_consecutive_messages": avg_consecutive,
            "turn_taking_balance": turn_taking_balance,
            "unique_speakers": unique_speakers
        }
    
    def _create_fallback_analysis(self, analysis_depth: str) -> AdvancedAnalysisResult:
        """폴백 분석 결과 생성"""
        return AdvancedAnalysisResult(
            temporal_intelligence={"confidence": 0.1, "error": "temporal_analysis_failed"},
            emotional_intelligence={"confidence": 0.1, "error": "emotional_analysis_failed"},
            social_intelligence={"confidence": 0.1, "error": "social_analysis_failed"},
            cultural_intelligence={"confidence": 0.1, "error": "cultural_analysis_failed"},
            strategic_intelligence={"confidence": 0.1, "error": "strategic_analysis_failed"},
            overall_confidence=0.1,
            analysis_depth=analysis_depth,
            processing_time=0.0
        )

class PredictiveModeler:
    """예측 모델링 시스템"""
    
    def __init__(self):
        self.prediction_cache = {}
    
    async def generate_conversation_predictions(self, 
                                             conversation_history: List[Dict[str, Any]],
                                             prediction_horizon: int = 5) -> List[PredictiveInsight]:
        """대화 예측 생성"""
        
        predictions = []
        
        if not conversation_history:
            return [PredictiveInsight(
                prediction_type="insufficient_data",
                prediction_content="예측에 필요한 데이터가 부족합니다.",
                confidence=0.0,
                time_horizon="unknown",
                supporting_evidence=[],
                risk_factors=["데이터 부족"]
            )]
        
        # 최근 메시지 분석
        recent_messages = conversation_history[-5:] if len(conversation_history) >= 5 else conversation_history
        
        # 주제 트렌드 예측
        topic_prediction = self._predict_topic_evolution(recent_messages)
        predictions.append(topic_prediction)
        
        # 감정 트렌드 예측
        emotion_prediction = self._predict_emotional_trajectory(recent_messages)
        predictions.append(emotion_prediction)
        
        # 참여도 예측
        engagement_prediction = self._predict_engagement_level(recent_messages)
        predictions.append(engagement_prediction)
        
        # 갈등 예측
        conflict_prediction = self._predict_potential_conflicts(recent_messages)
        predictions.append(conflict_prediction)
        
        # 해결 기회 예측
        resolution_prediction = self._predict_resolution_opportunities(recent_messages)
        predictions.append(resolution_prediction)
        
        return predictions[:prediction_horizon]
    
    def _predict_topic_evolution(self, messages: List[Dict[str, Any]]) -> PredictiveInsight:
        """주제 진화 예측"""
        
        # 현재 주제 키워드 추출
        current_topics = []
        for msg in messages:
            content = msg.get('content', '')
            if '시공사' in content:
                current_topics.append('시공사_선정')
            if '분담금' in content or '비용' in content:
                current_topics.append('비용_관리')
            if '총회' in content or '회의' in content:
                current_topics.append('총회_운영')
            if '일정' in content or '스케줄' in content:
                current_topics.append('일정_관리')
        
        # 주제 진화 패턴 예측
        if 'time공사_선정' in current_topics:
            predicted_topic = "시공사_계약_및_조건_협상"
            confidence = 0.8
            evidence = ["시공사 선정 논의 진행 중", "계약 조건 논의 필요성 증가"]
            risks = ["계약 조건 이견", "추가 비용 발생 가능성"]
        elif '비용_관리' in current_topics:
            predicted_topic = "분담금_납부_일정_확정"
            confidence = 0.75
            evidence = ["비용 관련 논의 활발", "구체적 금액 산정 필요"]
            risks = ["분담금 부담 이의 제기", "납부 일정 지연"]
        else:
            predicted_topic = "일반_운영_사항_논의"
            confidence = 0.6
            evidence = ["다양한 주제 논의", "정기 운영 회의 패턴"]
            risks = ["논의 초점 분산", "결정 지연"]
        
        return PredictiveInsight(
            prediction_type="topic_evolution",
            prediction_content=f"다음 주요 논의 주제: {predicted_topic}",
            confidence=confidence,
            time_horizon="단기 (1-3일)",
            supporting_evidence=evidence,
            risk_factors=risks
        )
    
    def _predict_emotional_trajectory(self, messages: List[Dict[str, Any]]) -> PredictiveInsight:
        """감정 궤적 예측"""
        
        # 최근 감정 트렌드 분석
        emotion_scores = []
        for msg in messages:
            content = msg.get('content', '')
            score = 0.0
            
            # 긍정 키워드
            if any(word in content for word in ['좋아', '만족', '성공', '효과']):
                score += 0.5
            
            # 부정 키워드
            if any(word in content for word in ['걱정', '문제', '어려', '불만']):
                score -= 0.5
            
            emotion_scores.append(score)
        
        if not emotion_scores:
            avg_emotion = 0.0
            emotion_trend = "stable"
        else:
            avg_emotion = sum(emotion_scores) / len(emotion_scores)
            
            # 트렌드 계산
            if len(emotion_scores) >= 3:
                recent_avg = sum(emotion_scores[-3:]) / 3
                earlier_avg = sum(emotion_scores[:-3]) / max(1, len(emotion_scores) - 3)
                
                if recent_avg - earlier_avg > 0.2:
                    emotion_trend = "improving"
                elif earlier_avg - recent_avg > 0.2:
                    emotion_trend = "declining"
                else:
                    emotion_trend = "stable"
            else:
                emotion_trend = "stable"
        
        # 예측 생성
        if emotion_trend == "improving":
            prediction = "긍정적 분위기 지속 및 협력적 논의 증가 예상"
            confidence = 0.8
            evidence = ["최근 긍정적 표현 증가", "건설적 대화 패턴"]
            risks = ["과도한 낙관", "중요 이슈 간과 가능성"]
        elif emotion_trend == "declining":
            prediction = "긴장감 증가 및 갈등 요소 주의 필요"
            confidence = 0.85
            evidence = ["부정적 표현 증가", "우려 사항 증가"]
            risks = ["갈등 확산", "의사결정 지연", "참여도 감소"]
        else:
            prediction = "안정적 감정 상태 유지, 균형잡힌 논의 지속"
            confidence = 0.7
            evidence = ["감정적 안정성", "일관된 소통 패턴"]
            risks = ["진전 부족", "동기 저하 가능성"]
        
        return PredictiveInsight(
            prediction_type="emotional_trajectory",
            prediction_content=prediction,
            confidence=confidence,
            time_horizon="단기 (1-2일)",
            supporting_evidence=evidence,
            risk_factors=risks
        )
    
    def _predict_engagement_level(self, messages: List[Dict[str, Any]]) -> PredictiveInsight:
        """참여도 예측"""
        
        # 참여자 활동 분석
        participants = set(msg.get('sender', '') for msg in messages)
        total_messages = len(messages)
        
        if total_messages == 0:
            return PredictiveInsight(
                prediction_type="engagement",
                prediction_content="참여도 예측 불가 - 데이터 부족",
                confidence=0.0,
                time_horizon="unknown",
                supporting_evidence=[],
                risk_factors=["데이터 부족"]
            )
        
        # 최근 메시지 빈도
        if len(messages) >= 3:
            recent_frequency = len(messages) / 24  # 가정: 24시간 기준
        else:
            recent_frequency = 0.1
        
        # 참여도 예측
        if recent_frequency > 5:  # 시간당 5개 이상
            engagement_level = "high"
            confidence = 0.85
            prediction = "높은 참여도 지속, 활발한 논의 진행 예상"
            evidence = ["빈번한 메시지 교환", "다수 참여자 활동"]
            risks = ["피로도 증가", "논의 품질 저하 가능성"]
        elif recent_frequency > 1:  # 시간당 1-5개
            engagement_level = "medium"
            confidence = 0.75
            prediction = "적정 수준 참여도 유지, 꾸준한 진행 예상"
            evidence = ["안정적 메시지 빈도", "지속적 참여"]
            risks = ["관심도 저하", "핵심 이슈 미논의"]
        else:
            engagement_level = "low"
            confidence = 0.8
            prediction = "참여도 저하 우려, 논의 활성화 필요"
            evidence = ["메시지 빈도 감소", "참여자 활동 저조"]
            risks = ["논의 중단", "결정 지연", "참여자 이탈"]
        
        return PredictiveInsight(
            prediction_type="engagement_level",
            prediction_content=f"{engagement_level} 참여도 - {prediction}",
            confidence=confidence,
            time_horizon="단기 (1-2일)",
            supporting_evidence=evidence,
            risk_factors=risks
        )
    
    def _predict_potential_conflicts(self, messages: List[Dict[str, Any]]) -> PredictiveInsight:
        """잠재 갈등 예측"""
        
        conflict_indicators = 0
        conflict_evidence = []
        
        for msg in messages:
            content = msg.get('content', '')
            
            # 갈등 지표 키워드
            if any(word in content for word in ['반대', '문제', '불만', '이의']):
                conflict_indicators += 1
                conflict_evidence.append("반대 의견 표명")
            
            if any(word in content for word in ['걱정', '우려', '의심']):
                conflict_indicators += 0.5
                conflict_evidence.append("우려 사항 제기")
            
            if '?' in content and any(word in content for word in ['왜', '어떻게', '정말']):
                conflict_indicators += 0.3
                conflict_evidence.append("의문 제기")
        
        # 갈등 위험도 평가
        total_messages = len(messages) if messages else 1
        conflict_ratio = conflict_indicators / total_messages
        
        if conflict_ratio > 0.6:
            risk_level = "high"
            confidence = 0.9
            prediction = "높은 갈등 위험 - 즉각적 중재 및 합의점 도출 필요"
            risks = ["논의 중단", "그룹 분열", "의사결정 불가"]
        elif conflict_ratio > 0.3:
            risk_level = "medium"
            confidence = 0.75
            prediction = "중간 수준 갈등 가능성 - 예방적 소통 강화 권장"
            risks = ["의견 대립 심화", "결정 지연", "일부 참여자 소외"]
        else:
            risk_level = "low"
            confidence = 0.7
            prediction = "낮은 갈등 위험 - 현재 수준의 건설적 논의 유지"
            risks = ["예상치 못한 이슈 발생", "외부 요인 영향"]
        
        return PredictiveInsight(
            prediction_type="conflict_potential",
            prediction_content=f"{risk_level} 갈등 위험도 - {prediction}",
            confidence=confidence,
            time_horizon="즉시-단기 (1일)",
            supporting_evidence=list(set(conflict_evidence)),
            risk_factors=risks
        )
    
    def _predict_resolution_opportunities(self, messages: List[Dict[str, Any]]) -> PredictiveInsight:
        """해결 기회 예측"""
        
        resolution_indicators = 0
        resolution_evidence = []
        
        for msg in messages:
            content = msg.get('content', '')
            
            # 해결 지표 키워드
            if any(word in content for word in ['해결', '방법', '방안', '대책']):
                resolution_indicators += 1
                resolution_evidence.append("해결 방안 모색")
            
            if any(word in content for word in ['합의', '동의', '찬성', '승인']):
                resolution_indicators += 1
                resolution_evidence.append("합의 의지 표명")
            
            if any(word in content for word in ['협력', '함께', '같이', '공동']):
                resolution_indicators += 0.5
                resolution_evidence.append("협력적 태도")
            
            if any(word in content for word in ['검토', '분석', '조사', '확인']):
                resolution_indicators += 0.3
                resolution_evidence.append("신중한 접근")
        
        # 해결 기회 평가
        total_messages = len(messages) if messages else 1
        resolution_ratio = resolution_indicators / total_messages
        
        if resolution_ratio > 0.5:
            opportunity_level = "high"
            confidence = 0.85
            prediction = "높은 해결 가능성 - 적극적 중재 및 결론 도출 추진"
            evidence = resolution_evidence + ["강한 해결 의지", "협력적 분위기"]
        elif resolution_ratio > 0.2:
            opportunity_level = "medium"
            confidence = 0.7
            prediction = "중간 수준 해결 기회 - 추가 논의 및 조정 필요"
            evidence = resolution_evidence + ["부분적 합의 가능성", "추가 논의 필요"]
        else:
            opportunity_level = "low"
            confidence = 0.6
            prediction = "낮은 해결 가능성 - 새로운 접근 방식 모색 필요"
            evidence = ["해결 의지 부족", "대안 필요"]
        
        return PredictiveInsight(
            prediction_type="resolution_opportunity",
            prediction_content=f"{opportunity_level} 해결 기회 - {prediction}",
            confidence=confidence,
            time_horizon="단기-중기 (2-5일)",
            supporting_evidence=list(set(resolution_evidence)),
            risk_factors=["외부 변수", "새로운 이슈 등장", "참여자 변심"]
        )

# 글로벌 인스턴스
advanced_analyzer = AdvancedContextAnalyzer()
predictive_modeler = PredictiveModeler()

# API 엔드포인트들
@app.get("/")
async def root():
    return {"message": "Simplified Advanced KakaoTalk Analysis API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/advanced/context-intelligence")
async def advanced_context_analysis(request: dict):
    """고도화된 다차원 컨텍스트 분석"""
    try:
        conversation_data = request.get("conversation_data", {})
        analysis_depth = request.get("analysis_depth", "expert")
        
        result = await advanced_analyzer.analyze_advanced_context(conversation_data, analysis_depth)
        
        return {
            "analysis_result": asdict(result),
            "timestamp": datetime.now().isoformat(),
            "api_version": "1.0.0"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"고도화 컨텍스트 분석 실패: {str(e)}")

@app.post("/api/advanced/predictive-modeling")
async def predictive_conversation_modeling(request: dict):
    """예측적 대화 모델링"""
    try:
        conversation_history = request.get("conversation_history", [])
        prediction_horizon = request.get("prediction_horizon", 5)
        
        predictions = await predictive_modeler.generate_conversation_predictions(
            conversation_history, prediction_horizon
        )
        
        # 예측 결과를 딕셔너리로 변환
        prediction_dicts = [asdict(prediction) for prediction in predictions]
        
        return {
            "predictions": prediction_dicts,
            "prediction_horizon": prediction_horizon,
            "model_confidence": sum(p.confidence for p in predictions) / len(predictions) if predictions else 0.0,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"예측적 모델링 실패: {str(e)}")

@app.post("/api/advanced/multi-model-analysis")
async def multi_model_analysis(request: dict):
    """다중 모델 통합 분석"""
    try:
        conversation_data = request.get("conversation_data", {})
        analysis_models = request.get("models", ["context", "predictive"])
        
        results = {}
        
        # Advanced Context Analysis
        if "context" in analysis_models:
            context_result = await advanced_analyzer.analyze_advanced_context(
                conversation_data, "genius"
            )
            results["context_intelligence"] = asdict(context_result)
        
        # Predictive Analysis
        if "predictive" in analysis_models:
            messages = conversation_data.get("messages", [])
            predictions = await predictive_modeler.generate_conversation_predictions(messages, 3)
            results["predictive_analysis"] = [asdict(p) for p in predictions]
        
        # Meta-analysis
        meta_insights = {
            "models_used": analysis_models,
            "total_processing_time": sum(
                result.get("processing_time", 0) for result in results.values() 
                if isinstance(result, dict)
            ),
            "overall_confidence": _calculate_overall_confidence(results),
            "recommendation_synthesis": _synthesize_multi_model_recommendations(results)
        }
        
        return {
            "multi_model_results": results,
            "meta_insights": meta_insights,
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"다중 모델 분석 실패: {str(e)}")

@app.post("/api/advanced/real-time-optimization")
async def real_time_conversation_optimization(request: dict):
    """실시간 대화 최적화"""
    try:
        current_message = request.get("current_message", {})
        conversation_context = request.get("conversation_context", {})
        optimization_goals = request.get("goals", ["harmony", "efficiency", "resolution"])
        
        # 컨텍스트 분석
        messages = conversation_context.get("messages", [])
        if current_message:
            messages.append(current_message)
        
        context_analysis = await advanced_analyzer.analyze_advanced_context({
            "messages": messages,
            "participants": conversation_context.get("participants", [])
        })
        
        # 최적화 전략 생성
        optimization_strategies = []
        for goal in optimization_goals:
            strategy = _generate_optimization_strategy(goal, context_analysis)
            optimization_strategies.append(strategy)
        
        # 실시간 권장사항
        recommendations = _generate_real_time_recommendations(context_analysis, current_message)
        
        # 성능 메트릭
        metrics = {
            "context_coherence": context_analysis.overall_confidence,
            "optimization_urgency": _calculate_optimization_urgency(context_analysis),
            "success_probability": _estimate_optimization_success(optimization_strategies)
        }
        
        return {
            "optimization_strategies": optimization_strategies,
            "real_time_recommendations": recommendations,
            "performance_metrics": metrics,
            "context_snapshot": asdict(context_analysis),
            "optimization_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"실시간 최적화 실패: {str(e)}")

# 헬퍼 함수들
def _calculate_overall_confidence(results: Dict[str, Any]) -> float:
    """전체 신뢰도 계산"""
    confidences = []
    
    for result in results.values():
        if isinstance(result, dict) and "overall_confidence" in result:
            confidences.append(result["overall_confidence"])
        elif isinstance(result, list):
            # 예측 결과의 경우
            for item in result:
                if isinstance(item, dict) and "confidence" in item:
                    confidences.append(item["confidence"])
    
    return sum(confidences) / len(confidences) if confidences else 0.0

def _synthesize_multi_model_recommendations(results: Dict[str, Any]) -> List[str]:
    """다중 모델 권장사항 합성"""
    recommendations = []
    
    if "context_intelligence" in results:
        context_result = results["context_intelligence"]
        if context_result.get("overall_confidence", 0) > 0.8:
            recommendations.append("높은 컨텍스트 신뢰도 - 현재 전략 유지")
        elif context_result.get("overall_confidence", 0) < 0.5:
            recommendations.append("낮은 컨텍스트 신뢰도 - 추가 정보 수집 필요")
    
    if "predictive_analysis" in results:
        predictions = results["predictive_analysis"]
        high_risk_predictions = [p for p in predictions if "conflict" in p.get("prediction_type", "")]
        if high_risk_predictions:
            recommendations.append("갈등 위험 감지 - 예방적 조치 필요")
    
    return recommendations

def _generate_optimization_strategy(goal: str, context_analysis: AdvancedAnalysisResult) -> Dict[str, Any]:
    """최적화 전략 생성"""
    
    strategies = {
        "harmony": {
            "goal": "대화 조화 증진",
            "tactics": ["감정 공감 표현", "중립적 어조 유지", "공통점 강조"],
            "priority": "high" if context_analysis.emotional_intelligence.get("confidence", 0) < 0.6 else "medium"
        },
        "efficiency": {
            "goal": "효율적 의사결정",
            "tactics": ["명확한 선택지 제시", "시간 제약 설정", "우선순위 명시"],
            "priority": "high" if context_analysis.temporal_intelligence.get("confidence", 0) > 0.7 else "medium"
        },
        "resolution": {
            "goal": "갈등 해결",
            "tactics": ["양방향 이해 촉진", "타협점 모색", "단계적 해결 방안"],
            "priority": "high" if context_analysis.social_intelligence.get("confidence", 0) < 0.6 else "low"
        }
    }
    
    base_strategy = strategies.get(goal, strategies["harmony"])
    base_strategy["context_alignment"] = context_analysis.overall_confidence
    
    return base_strategy

def _generate_real_time_recommendations(context_analysis: AdvancedAnalysisResult, current_message: Dict[str, Any]) -> Dict[str, List[str]]:
    """실시간 권장사항 생성"""
    
    recommendations = {
        "immediate_actions": [],
        "tone_adjustments": [],
        "content_suggestions": []
    }
    
    # 감정 상태 기반 권장사항
    emotional_confidence = context_analysis.emotional_intelligence.get("confidence", 0.5)
    if emotional_confidence < 0.4:
        recommendations["immediate_actions"].append("감정적 지원 메시지 추가")
        recommendations["tone_adjustments"].append("더 공감적인 어조 사용")
    
    # 사회적 역학 기반 권장사항
    social_confidence = context_analysis.social_intelligence.get("confidence", 0.5)
    if social_confidence < 0.5:
        recommendations["immediate_actions"].append("참여 균형 조정 필요")
        recommendations["content_suggestions"].append("모든 참여자 의견 수렴")
    
    # 문화적 맥락 기반 권장사항
    cultural_confidence = context_analysis.cultural_intelligence.get("confidence", 0.5)
    if cultural_confidence > 0.7:
        recommendations["tone_adjustments"].append("문화적 맥락에 맞는 표현 사용")
    
    return recommendations

def _calculate_optimization_urgency(context_analysis: AdvancedAnalysisResult) -> float:
    """최적화 긴급도 계산"""
    
    urgency_factors = [
        1.0 - context_analysis.overall_confidence,  # 낮은 신뢰도 = 높은 긴급도
        1.0 - context_analysis.emotional_intelligence.get("confidence", 0.5),
        1.0 - context_analysis.social_intelligence.get("confidence", 0.5)
    ]
    
    return sum(urgency_factors) / len(urgency_factors)

def _estimate_optimization_success(strategies: List[Dict[str, Any]]) -> float:
    """최적화 성공 확률 추정"""
    
    if not strategies:
        return 0.0
    
    success_scores = []
    for strategy in strategies:
        context_alignment = strategy.get("context_alignment", 0.5)
        priority_weight = 1.0 if strategy.get("priority") == "high" else 0.7 if strategy.get("priority") == "medium" else 0.5
        success_scores.append(context_alignment * priority_weight)
    
    return sum(success_scores) / len(success_scores)

if __name__ == "__main__":
    import uvicorn

    _sap = int(
        os.environ.get(
            "SIMPLIFIED_ADVANCED_API_PORT", os.environ.get("PORT", "8001")
        )
    )
    uvicorn.run(app, host="0.0.0.0", port=_sap)