#!/usr/bin/env python3
"""
대화 분석 시스템
- 대화 패턴 분석
- 감정 트렌드 분석
- 사용자 행동 분석
- 대화 품질 평가
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from collections import defaultdict, Counter
import logging

logger = logging.getLogger(__name__)


class ConversationAnalyzer:
    def __init__(self):
        self.conversation_data = []
        self.user_profiles = {}
        self.analysis_cache = {}
        
    def add_conversation(self, conversation_data: Dict[str, Any]):
        """대화 데이터 추가"""
        try:
            # 기본 정보 추가
            conversation_data["analyzed_at"] = datetime.now().isoformat()
            conversation_data["conversation_id"] = self._generate_conversation_id()
            
            # 분석 데이터 추가
            analysis_result = self._analyze_single_conversation(conversation_data)
            conversation_data["analysis"] = analysis_result
            
            self.conversation_data.append(conversation_data)
            
            # 캐시 초기화
            self.analysis_cache.clear()
            
            logger.info(f"대화 데이터 추가 완료: {conversation_data['conversation_id']}")
            
        except Exception as e:
            logger.error(f"대화 데이터 추가 중 오류: {e}")
    
    def _generate_conversation_id(self) -> str:
        """대화 ID 생성"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"conv_{timestamp}_{len(self.conversation_data)}"
    
    def _analyze_single_conversation(self, conversation: Dict[str, Any]) -> Dict[str, Any]:
        """단일 대화 분석"""
        try:
            messages = conversation.get("messages", [])
            
            analysis = {
                "basic_stats": self._analyze_basic_stats(messages),
                "emotion_analysis": self._analyze_emotions(messages),
                "language_analysis": self._analyze_languages(messages),
                "interaction_patterns": self._analyze_interaction_patterns(messages),
                "topic_analysis": self._analyze_topics(messages),
                "quality_metrics": self._analyze_quality_metrics(messages)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"단일 대화 분석 중 오류: {e}")
            return {}
    
    def _analyze_basic_stats(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """기본 통계 분석"""
        if not messages:
            return {"total_messages": 0, "avg_length": 0, "duration": 0}
        
        total_messages = len(messages)
        total_length = sum(len(msg.get("content", "")) for msg in messages)
        avg_length = total_length / total_messages if total_messages > 0 else 0
        
        # 대화 지속 시간 계산
        if len(messages) >= 2:
            first_time = datetime.fromisoformat(messages[0].get("timestamp", ""))
            last_time = datetime.fromisoformat(messages[-1].get("timestamp", ""))
            duration = (last_time - first_time).total_seconds()
        else:
            duration = 0
        
        return {
            "total_messages": total_messages,
            "avg_length": round(avg_length, 2),
            "duration_seconds": round(duration, 2),
            "messages_per_minute": round(total_messages / (duration / 60), 2) if duration > 0 else 0
        }
    
    def _analyze_emotions(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """감정 분석"""
        if not messages:
            return {"emotion_distribution": {}, "emotion_trend": []}
        
        emotion_counts = Counter()
        emotion_trend = []
        
        for msg in messages:
            emotion = msg.get("emotion", "neutral")
            emotion_counts[emotion] += 1
            
            emotion_trend.append({
                "timestamp": msg.get("timestamp", ""),
                "emotion": emotion,
                "content": msg.get("content", "")[:50]  # 첫 50자만
            })
        
        dominant_emotion = emotion_counts.most_common(1)[0][0] if emotion_counts else "neutral"
        
        return {
            "emotion_distribution": dict(emotion_counts),
            "dominant_emotion": dominant_emotion,
            "emotion_trend": emotion_trend,
            "emotion_stability": self._calculate_emotion_stability(emotion_trend)
        }
    
    def _analyze_languages(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """언어 분석"""
        if not messages:
            return {"language_distribution": {}, "language_switches": 0}
        
        language_counts = Counter()
        language_switches = 0
        previous_language = None
        
        for msg in messages:
            language = msg.get("language", "korean")
            language_counts[language] += 1
            
            if previous_language and previous_language != language:
                language_switches += 1
            
            previous_language = language
        
        return {
            "language_distribution": dict(language_counts),
            "dominant_language": language_counts.most_common(1)[0][0] if language_counts else "korean",
            "language_switches": language_switches
        }
    
    def _analyze_interaction_patterns(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """상호작용 패턴 분석"""
        if not messages:
            return {"response_times": [], "turn_taking": {}, "engagement_level": "low"}
        
        response_times = []
        turn_taking = {"user": 0, "ai": 0}
        
        for i in range(1, len(messages)):
            prev_msg = messages[i-1]
            curr_msg = messages[i]
            
            # 응답 시간 계산
            try:
                prev_time = datetime.fromisoformat(prev_msg.get("timestamp", ""))
                curr_time = datetime.fromisoformat(curr_msg.get("timestamp", ""))
                response_time = (curr_time - prev_time).total_seconds()
                response_times.append(response_time)
            except:
                pass
            
            # 턴 테이킹 분석
            speaker = curr_msg.get("speaker", "user")
            turn_taking[speaker] = turn_taking.get(speaker, 0) + 1
        
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # 참여도 레벨 계산
        engagement_level = self._calculate_engagement_level(messages, avg_response_time)
        
        return {
            "response_times": response_times,
            "avg_response_time": round(avg_response_time, 2),
            "turn_taking": turn_taking,
            "engagement_level": engagement_level
        }
    
    def _analyze_topics(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """주제 분석"""
        if not messages:
            return {"topics": [], "topic_changes": 0}
        
        # 간단한 키워드 기반 주제 분석
        topic_keywords = {
            "project": ["프로젝트", "project", "작업", "task"],
            "file": ["파일", "file", "업로드", "upload", "분석", "analysis"],
            "system": ["시스템", "system", "기능", "function", "설정", "setting"],
            "chat": ["대화", "chat", "대화", "conversation", "메시지", "message"],
            "help": ["도움", "help", "질문", "question", "문제", "problem"]
        }
        
        topics = []
        topic_changes = 0
        previous_topic = None
        
        for msg in messages:
            content = msg.get("content", "").lower()
            current_topic = "general"
            
            for topic, keywords in topic_keywords.items():
                if any(keyword in content for keyword in keywords):
                    current_topic = topic
                    break
            
            topics.append(current_topic)
            
            if previous_topic and previous_topic != current_topic:
                topic_changes += 1
            
            previous_topic = current_topic
        
        topic_distribution = Counter(topics)
        
        return {
            "topics": topics,
            "topic_distribution": dict(topic_distribution),
            "dominant_topic": topic_distribution.most_common(1)[0][0] if topic_distribution else "general",
            "topic_changes": topic_changes
        }
    
    def _analyze_quality_metrics(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """대화 품질 지표 분석"""
        if not messages:
            return {"quality_score": 0, "suggestions": []}
        
        # 품질 지표 계산
        total_messages = len(messages)
        avg_length = sum(len(msg.get("content", "")) for msg in messages) / total_messages
        
        # 감정 다양성
        emotions = [msg.get("emotion", "neutral") for msg in messages]
        emotion_diversity = len(set(emotions)) / len(emotions) if emotions else 0
        
        # 응답 시간 일관성
        response_times = []
        for i in range(1, len(messages)):
            try:
                prev_time = datetime.fromisoformat(messages[i-1].get("timestamp", ""))
                curr_time = datetime.fromisoformat(messages[i].get("timestamp", ""))
                response_time = (curr_time - prev_time).total_seconds()
                response_times.append(response_time)
            except:
                pass
        
        response_consistency = 1.0
        if len(response_times) > 1:
            avg_response = sum(response_times) / len(response_times)
            variance = sum((t - avg_response) ** 2 for t in response_times) / len(response_times)
            response_consistency = 1.0 / (1.0 + variance)
        
        # 품질 점수 계산 (0-100)
        quality_score = (
            min(avg_length / 10, 1.0) * 30 +  # 메시지 길이
            emotion_diversity * 25 +           # 감정 다양성
            response_consistency * 25 +        # 응답 일관성
            min(total_messages / 20, 1.0) * 20  # 대화 길이
        )
        
        # 개선 제안
        suggestions = []
        if avg_length < 10:
            suggestions.append("더 자세한 메시지를 작성해보세요.")
        if emotion_diversity < 0.3:
            suggestions.append("다양한 감정 표현을 시도해보세요.")
        if response_consistency < 0.5:
            suggestions.append("일관된 응답 시간을 유지해보세요.")
        if total_messages < 10:
            suggestions.append("더 긴 대화를 시도해보세요.")
        
        return {
            "quality_score": round(quality_score, 1),
            "avg_length": round(avg_length, 1),
            "emotion_diversity": round(emotion_diversity, 3),
            "response_consistency": round(response_consistency, 3),
            "suggestions": suggestions
        }
    
    def _calculate_emotion_stability(self, emotion_trend: List[Dict[str, Any]]) -> float:
        """감정 안정성 계산"""
        if len(emotion_trend) < 2:
            return 1.0
        
        emotion_changes = 0
        for i in range(1, len(emotion_trend)):
            if emotion_trend[i]["emotion"] != emotion_trend[i-1]["emotion"]:
                emotion_changes += 1
        
        stability = 1.0 - (emotion_changes / (len(emotion_trend) - 1))
        return round(stability, 3)
    
    def _calculate_engagement_level(self, messages: List[Dict[str, Any]], avg_response_time: float) -> str:
        """참여도 레벨 계산"""
        if not messages:
            return "low"
        
        # 참여도 지표들
        message_count = len(messages)
        avg_length = sum(len(msg.get("content", "")) for msg in messages) / message_count
        
        # 점수 계산
        engagement_score = (
            min(message_count / 20, 1.0) * 40 +      # 메시지 수
            min(avg_length / 50, 1.0) * 30 +         # 메시지 길이
            max(0, 1.0 - avg_response_time / 60) * 30  # 응답 시간
        )
        
        if engagement_score >= 80:
            return "high"
        elif engagement_score >= 50:
            return "medium"
        else:
            return "low"
    
    def get_conversation_summary(self, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """대화 요약 조회"""
        if conversation_id:
            # 특정 대화 요약
            for conv in self.conversation_data:
                if conv.get("conversation_id") == conversation_id:
                    return {
                        "conversation_id": conversation_id,
                        "summary": conv.get("analysis", {}),
                        "timestamp": conv.get("analyzed_at", "")
                    }
            return {"error": "대화를 찾을 수 없습니다."}
        else:
            # 전체 대화 요약
            if not self.conversation_data:
                return {"total_conversations": 0, "overall_summary": {}}
            
            total_conversations = len(self.conversation_data)
            overall_stats = self._calculate_overall_stats()
            
            return {
                "total_conversations": total_conversations,
                "overall_summary": overall_stats,
                "recent_conversations": self.conversation_data[-5:]  # 최근 5개
            }
    
    def _calculate_overall_stats(self) -> Dict[str, Any]:
        """전체 통계 계산"""
        if not self.conversation_data:
            return {}
        
        total_messages = sum(len(conv.get("messages", [])) for conv in self.conversation_data)
        avg_quality = sum(conv.get("analysis", {}).get("quality_metrics", {}).get("quality_score", 0) 
                         for conv in self.conversation_data) / len(self.conversation_data)
        
        # 전체 감정 분포
        all_emotions = []
        for conv in self.conversation_data:
            messages = conv.get("messages", [])
            emotions = [msg.get("emotion", "neutral") for msg in messages]
            all_emotions.extend(emotions)
        
        emotion_distribution = Counter(all_emotions)
        
        return {
            "total_messages": total_messages,
            "avg_quality_score": round(avg_quality, 1),
            "emotion_distribution": dict(emotion_distribution),
            "avg_conversation_length": round(total_messages / len(self.conversation_data), 1)
        }
    
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """사용자 프로필 조회"""
        if user_id in self.user_profiles:
            return self.user_profiles[user_id]
        
        # 사용자별 대화 분석
        user_conversations = [conv for conv in self.conversation_data 
                            if conv.get("user_id") == user_id]
        
        if not user_conversations:
            return {"user_id": user_id, "conversations": 0}
        
        # 사용자 통계 계산
        total_conversations = len(user_conversations)
        total_messages = sum(len(conv.get("messages", [])) for conv in user_conversations)
        
        # 사용자 선호 감정
        all_emotions = []
        for conv in user_conversations:
            messages = conv.get("messages", [])
            emotions = [msg.get("emotion", "neutral") for msg in messages]
            all_emotions.extend(emotions)
        
        emotion_distribution = Counter(all_emotions)
        preferred_emotion = emotion_distribution.most_common(1)[0][0] if emotion_distribution else "neutral"
        
        # 평균 품질 점수
        avg_quality = sum(conv.get("analysis", {}).get("quality_metrics", {}).get("quality_score", 0) 
                         for conv in user_conversations) / total_conversations
        
        user_profile = {
            "user_id": user_id,
            "conversations": total_conversations,
            "total_messages": total_messages,
            "avg_messages_per_conversation": round(total_messages / total_conversations, 1),
            "preferred_emotion": preferred_emotion,
            "avg_quality_score": round(avg_quality, 1),
            "emotion_distribution": dict(emotion_distribution),
            "last_conversation": user_conversations[-1].get("analyzed_at", "") if user_conversations else ""
        }
        
        self.user_profiles[user_id] = user_profile
        return user_profile
    
    def clear_data(self):
        """모든 데이터 초기화"""
        self.conversation_data.clear()
        self.user_profiles.clear()
        self.analysis_cache.clear()
        logger.info("모든 대화 분석 데이터가 초기화되었습니다.")


# 싱글톤 인스턴스
conversation_analyzer = ConversationAnalyzer()
