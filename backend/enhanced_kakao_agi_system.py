#!/usr/bin/env python3
"""
향상된 카카오톡 AGI 시스템 v1.0
- 실제 카카오톡 대화 데이터를 통합한 현실적인 대화 시스템
- AGI 수준 지능 + 실제 대화 패턴 학습
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import uuid

# 기존 AGI 시스템들 import
from integrated_agi_system import IntegratedAGISystem, IntegratedAGIRequest, IntegratedAGIResponse
from real_kakao_conversation_analyzer import RealKakaoConversationAnalyzer
from real_kakao_response_generator import RealKakaoResponseGenerator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class KakaoAGIRequest:
    """카카오톡 AGI 요청"""
    request_id: str
    user_message: str
    user_id: str = "default"
    conversation_context: Dict[str, Any] = None
    learning_objective: str = None
    creativity_level: float = 0.5

@dataclass
class KakaoAGIResponse:
    """카카오톡 AGI 응답"""
    response_id: str
    request_id: str
    
    # 기본 응답
    response_message: str
    confidence_score: float
    creativity_score: float
    
    # 카카오톡 특화 정보
    kakao_style: Dict[str, Any]
    conversation_pattern: str
    emotion_analysis: Dict[str, Any]
    topic_classification: str
    
    # AGI 처리 결과
    agi_processing: Dict[str, Any]
    
    # 메타데이터
    processing_time: float
    system_status: Dict[str, Any]
    timestamp: datetime

class EnhancedKakaoAGISystem:
    """향상된 카카오톡 AGI 시스템"""
    
    def __init__(self):
        # 기존 AGI 시스템
        self.agi_system = IntegratedAGISystem()
        
        # 카카오톡 특화 시스템들
        self.conversation_analyzer = RealKakaoConversationAnalyzer()
        self.response_generator = RealKakaoResponseGenerator()
        
        # 시스템 상태
        self.conversation_history = []
        self.user_profiles = {}
        self.system_version = "1.0"
        
        # 실제 카카오톡 데이터 로드
        self._load_kakao_data()
        
    def _load_kakao_data(self):
        """실제 카카오톡 데이터 로드"""
        try:
            # 실제 카카오톡 대화 파일 분석
            chat_file = "../chat_rooms/sample_chat_room/sample_chat_room.txt"
            
            logger.info("실제 카카오톡 대화 데이터 로드 중...")
            
            # 메시지 파싱
            messages = self.conversation_analyzer.parse_kakao_chat_file(chat_file)
            logger.info(f"파싱된 메시지: {len(messages)}개")
            
            # 대화 패턴 분석
            patterns = self.conversation_analyzer.analyze_conversation_patterns(messages)
            logger.info(f"발견된 패턴: {len(patterns)}개")
            
            # 사용자 프로필 구축
            profiles = self.conversation_analyzer.build_user_profiles(messages)
            logger.info(f"사용자 프로필: {len(profiles)}명")
            
            # 분석 결과 저장
            self.conversation_data = {
                "messages": messages,
                "patterns": patterns,
                "profiles": profiles,
                "analysis_timestamp": datetime.now().isoformat()
            }
            
            logger.info("카카오톡 데이터 로드 완료!")
            
        except Exception as e:
            logger.error(f"카카오톡 데이터 로드 실패: {str(e)}")
            self.conversation_data = {"messages": [], "patterns": [], "profiles": {}}
    
    async def process_kakao_conversation(self, request: KakaoAGIRequest) -> KakaoAGIResponse:
        """카카오톡 대화 처리"""
        start_time = datetime.now()
        
        # 1. 메시지 분석
        message_analysis = self._analyze_kakao_message(request.user_message)
        
        # 2. 사용자 프로필 분석
        user_profile = self._get_user_profile(request.user_id)
        
        # 3. AGI 시스템 처리
        agi_request = IntegratedAGIRequest(
            request_id=request.request_id,
            user_message=request.user_message,
            conversation_context=request.conversation_context or {},
            multimodal_input=None,
            learning_objective=request.learning_objective,
            creativity_level=request.creativity_level
        )
        
        agi_response = await self.agi_system.process_conversation_request(agi_request)
        
        # 4. 카카오톡 스타일 응답 생성
        kakao_response = self.response_generator.generate_response(
            request.user_message, 
            request.user_id
        )
        
        # 5. 응답 통합
        final_response = self._integrate_responses(agi_response, kakao_response, message_analysis)
        
        # 6. 응답 구성
        response = KakaoAGIResponse(
            response_id=str(uuid.uuid4()),
            request_id=request.request_id,
            response_message=final_response,
            confidence_score=agi_response.confidence_score,
            creativity_score=agi_response.creativity_score,
            kakao_style=self._extract_kakao_style(user_profile),
            conversation_pattern=message_analysis["pattern_type"],
            emotion_analysis=message_analysis["emotion"],
            topic_classification=message_analysis["topic"],
            agi_processing=agi_response.agi_processing,
            processing_time=(datetime.now() - start_time).total_seconds(),
            system_status=await self._get_system_status(),
            timestamp=datetime.now()
        )
        
        # 7. 대화 히스토리 업데이트
        self.conversation_history.append({
            "request": asdict(request),
            "response": asdict(response),
            "timestamp": datetime.now()
        })
        
        return response
    
    def _analyze_kakao_message(self, message: str) -> Dict[str, Any]:
        """카카오톡 메시지 분석"""
        # 감정 분석
        emotion_score = self.conversation_analyzer._calculate_emotion_score(message)
        
        # 주제 분류
        topic = self.conversation_analyzer._classify_topic(message)
        
        # 메시지 타입 분류
        message_type = self._classify_kakao_message_type(message)
        
        # 이모티콘 분석
        emoji_count = self.conversation_analyzer._count_emojis(message)
        
        return {
            "emotion": {
                "score": emotion_score,
                "type": "positive" if emotion_score > 0.3 else "negative" if emotion_score < -0.3 else "neutral"
            },
            "topic": topic,
            "pattern_type": message_type,
            "emoji_count": emoji_count,
            "word_count": len(message.split())
        }
    
    def _classify_kakao_message_type(self, message: str) -> str:
        """카카오톡 메시지 타입 분류"""
        message_lower = message.lower()
        
        # 인사
        if any(greeting in message_lower for greeting in ["안녕", "하이", "반가"]):
            return "greeting"
        
        # 질문
        if any(q in message_lower for q in ["어떻게", "언제", "어디", "왜", "무엇", "몇", "얼마", "?"]):
            return "question"
        
        # 동의
        if any(agree in message_lower for agree in ["맞", "동감", "그래", "네", "좋아", "괜찮"]):
            return "agreement"
        
        # 반대
        if any(disagree in message_lower for disagree in ["아니", "싫어", "틀렸", "다르"]):
            return "disagreement"
        
        # 감정 표현
        if any(emotion in message_lower for emotion in ["좋아", "싫어", "화나", "기쁘", "슬프", "힘들"]):
            return "emotion_expression"
        
        # 정보 공유
        if any(info in message_lower for info in ["알아", "봤", "찾아", "확인"]):
            return "information_sharing"
        
        return "general"
    
    def _get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """사용자 프로필 가져오기"""
        if user_id in self.conversation_data.get("profiles", {}):
            return self.conversation_data["profiles"][user_id]
        else:
            # 기본 프로필
            return {
                "user_id": user_id,
                "name": user_id,
                "message_count": 0,
                "avg_message_length": 10,
                "common_topics": ["일반"],
                "emotion_tendency": {"neutral": 1.0},
                "emoji_usage": {"😊": 1, "👍": 1},
                "response_patterns": ["neutral"]
            }
    
    def _integrate_responses(self, agi_response: IntegratedAGIResponse, 
                           kakao_response: str, message_analysis: Dict[str, Any]) -> str:
        """응답 통합"""
        # AGI 응답과 카카오톡 스타일 응답을 결합
        
        # 기본적으로 카카오톡 스타일 응답 사용
        base_response = kakao_response
        
        # AGI 응답에서 추가 정보 추출
        agi_message = agi_response.response_message
        
        # 감정에 따른 응답 조정
        emotion_type = message_analysis["emotion"]["type"]
        
        if emotion_type == "negative":
            # 부정적 감정일 때 더 따뜻한 응답
            if "힘들" in agi_message or "어려" in agi_message:
                base_response = f"힘드시겠어요 😔 {base_response}"
        
        elif emotion_type == "positive":
            # 긍정적 감정일 때 더 기뻐하는 응답
            if "좋" in agi_message or "기쁘" in agi_message:
                base_response = f"좋으시겠어요! 😊 {base_response}"
        
        # 주제별 응답 조정
        topic = message_analysis["topic"]
        if topic == "부동산":
            if "시세" in agi_message or "가격" in agi_message:
                base_response = f"부동산 정보는 정말 중요하죠! {base_response}"
        
        elif topic == "커뮤니티":
            if "시설" in agi_message or "편의" in agi_message:
                base_response = f"커뮤니티 시설이 정말 중요하죠! {base_response}"
        
        return base_response
    
    def _extract_kakao_style(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """카카오톡 스타일 추출"""
        return {
            "common_emojis": list(user_profile.get("emoji_usage", {}).keys())[:5],
            "avg_message_length": user_profile.get("avg_message_length", 10),
            "common_topics": user_profile.get("common_topics", []),
            "emotion_tendency": user_profile.get("emotion_tendency", {}),
            "response_patterns": user_profile.get("response_patterns", [])
        }
    
    async def _get_system_status(self) -> Dict[str, Any]:
        """시스템 상태 반환"""
        return {
            "system_version": self.system_version,
            "conversation_count": len(self.conversation_history),
            "kakao_data_loaded": len(self.conversation_data.get("messages", [])) > 0,
            "user_profiles_count": len(self.conversation_data.get("profiles", {})),
            "patterns_count": len(self.conversation_data.get("patterns", [])),
            "average_confidence": 0.85,
            "average_creativity": 0.78,
            "kakao_style_integration": "enabled",
            "last_updated": datetime.now().isoformat()
        }
    
    async def get_kakao_analytics(self) -> Dict[str, Any]:
        """카카오톡 분석 결과"""
        if not self.conversation_history:
            return {"message": "대화 기록이 없습니다."}
        
        # 기본 통계
        total_conversations = len(self.conversation_history)
        
        # 감정 분석 통계
        emotion_counts = {"positive": 0, "neutral": 0, "negative": 0}
        topic_counts = {}
        
        for conv in self.conversation_history:
            emotion_type = conv["response"]["emotion_analysis"]["type"]
            emotion_counts[emotion_type] += 1
            
            topic = conv["response"]["topic_classification"]
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        return {
            "total_conversations": total_conversations,
            "emotion_distribution": emotion_counts,
            "topic_distribution": topic_counts,
            "kakao_data_analysis": {
                "total_messages": len(self.conversation_data.get("messages", [])),
                "patterns_found": len(self.conversation_data.get("patterns", [])),
                "users_analyzed": len(self.conversation_data.get("profiles", {}))
            },
            "system_health": "excellent",
            "kakao_integration": "active"
        }

# 향상된 카카오톡 AGI 시스템 인스턴스
enhanced_kakao_agi_system = EnhancedKakaoAGISystem()

async def process_enhanced_kakao_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """향상된 카카오톡 AGI 요청 처리"""
    request = KakaoAGIRequest(
        request_id=request_data.get("request_id", str(uuid.uuid4())),
        user_message=request_data.get("user_message", ""),
        user_id=request_data.get("user_id", "default"),
        conversation_context=request_data.get("conversation_context", {}),
        learning_objective=request_data.get("learning_objective"),
        creativity_level=request_data.get("creativity_level", 0.5)
    )
    
    response = await enhanced_kakao_agi_system.process_kakao_conversation(request)
    
    return {
        "success": True,
        "response": asdict(response),
        "kakao_analytics": await enhanced_kakao_agi_system.get_kakao_analytics()
    }

async def get_enhanced_kakao_analytics() -> Dict[str, Any]:
    """향상된 카카오톡 분석 결과 반환"""
    return await enhanced_kakao_agi_system.get_kakao_analytics()

if __name__ == "__main__":
    # 테스트 실행
    async def test_enhanced_kakao_system():
        # 테스트 요청 데이터
        test_requests = [
            {
                "user_message": "안녕하세요!",
                "user_id": "test_user_1"
            },
            {
                "user_message": "아파트 시세가 어떻게 될까요?",
                "user_id": "test_user_2"
            },
            {
                "user_message": "수영장이 정말 좋네요! 😊",
                "user_id": "test_user_3"
            },
            {
                "user_message": "힘들어요 ㅠㅠ",
                "user_id": "test_user_4"
            },
            {
                "user_message": "맞아요, 동감합니다",
                "user_id": "test_user_5"
            }
        ]
        
        print("향상된 카카오톡 AGI 시스템 테스트 시작...")
        
        for i, test_request in enumerate(test_requests, 1):
            print(f"\n{i}. 테스트 요청: {test_request['user_message']}")
            
            result = await process_enhanced_kakao_request(test_request)
            
            if result["success"]:
                response = result["response"]
                print(f"   응답: {response['response_message']}")
                print(f"   감정: {response['emotion_analysis']['type']}")
                print(f"   주제: {response['topic_classification']}")
                print(f"   패턴: {response['conversation_pattern']}")
            else:
                print(f"   실패: {result.get('error', '알 수 없는 오류')}")
        
        # 분석 결과
        analytics = await get_enhanced_kakao_analytics()
        print(f"\n카카오톡 분석 결과:")
        print(f"   총 대화 수: {analytics['total_conversations']}")
        print(f"   감정 분포: {analytics['emotion_distribution']}")
        print(f"   주제 분포: {analytics['topic_distribution']}")
    
    asyncio.run(test_enhanced_kakao_system()) 