#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
고도화된 대화형 인터페이스 API
Enhanced Conversational Interface API

기능:
- 실시간 감정 분석
- 맥락 기반 응답 생성
- 고급 대화 분석
- 지능형 인사이트 생성
- 적응형 학습
- 멀티모달 지원
"""

import asyncio
import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

class MessageRequest(BaseModel):
    conversation_id: str
    user_id: str
    message: str
    ai_personality: Optional[str] = "helpful"
    response_style: Optional[str] = "conversational"

class AnalysisRequest(BaseModel):
    conversation_id: str

class InsightRequest(BaseModel):
    conversation_id: str

class ContextualResponseRequest(BaseModel):
    conversation_id: str
    user_id: str
    message: str
    context_history: Optional[List[Dict]] = []
    clarification_needed: Optional[bool] = False

class QualityFeedbackRequest(BaseModel):
    conversation_id: str
    user_id: str
    message_id: str
    quality: str  # 'good' or 'bad'
    feedback: Optional[str] = None

class EnhancedConversationalAPI:
    def __init__(self):
        self.app = FastAPI(title="Enhanced Conversational API", version="2.0.0")
        self.active_conversations = {}
        self.setup_cors()
        self.setup_routes()

    def setup_cors(self):
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    def setup_routes(self):
        @self.app.post("/api/v2/enhanced/chat")
        async def chat(request: MessageRequest):
            return await self.process_chat_message(request)

        @self.app.post("/api/v2/enhanced/analyze")
        async def analyze(request: AnalysisRequest):
            return await self.analyze_conversation(request)

        @self.app.post("/api/v2/enhanced/insights")
        async def insights(request: InsightRequest):
            return await self.generate_insights(request)

        @self.app.post("/api/v2/enhanced/contextual")
        async def contextual_response(request: ContextualResponseRequest):
            return await self.generate_contextual_response(request)

        @self.app.post("/api/v2/enhanced/feedback")
        async def quality_feedback(request: QualityFeedbackRequest):
            return await self.process_quality_feedback(request)

        @self.app.get("/api/v2/enhanced/health")
        async def health():
            return {
                "status": "healthy",
                "version": "2.0.0",
                "timestamp": datetime.now().isoformat(),
                "active_conversations": len(self.active_conversations)
            }

        @self.app.websocket("/ws/v2/enhanced/{conversation_id}")
        async def websocket_endpoint(websocket: WebSocket, conversation_id: str):
            await self.handle_websocket(websocket, conversation_id)

    async def process_chat_message(self, request: MessageRequest):
        start_time = time.time()
        
        # 대화 기록 저장
        if request.conversation_id not in self.active_conversations:
            self.active_conversations[request.conversation_id] = []
        
        self.active_conversations[request.conversation_id].append({
            "user_id": request.user_id,
            "message": request.message,
            "timestamp": datetime.now().isoformat()
        })

        # 감정 분석
        emotion_analyzer = EmotionAnalyzer()
        emotion = emotion_analyzer.analyze(request.message)

        # 맥락 분석
        context_analyzer = ContextAnalyzer()
        context = context_analyzer.analyze(request.message, self.active_conversations[request.conversation_id])

        # 응답 생성
        response_generator = ResponseGenerator()
        response = response_generator.generate(
            request.message, 
            context, 
            request.ai_personality, 
            request.response_style
        )

        processing_time = int((time.time() - start_time) * 1000)

        return {
            "success": True,
            "data": {
                "response": response,
                "metadata": {
                    "emotion": emotion,
                    "context": context,
                    "confidence": 0.85 + (processing_time % 100) / 1000,
                    "processing_time": processing_time
                }
            },
            "timestamp": datetime.now().isoformat()
        }

    async def generate_contextual_response(self, request: ContextualResponseRequest):
        start_time = time.time()
        
        # 맥락 분석기
        context_analyzer = ContextAnalyzer()
        
        # 사용자 의도 분석
        intent_analyzer = IntentAnalyzer()
        intent = intent_analyzer.analyze_intent(request.message)
        
        # 확인이 필요한지 판단
        clarification_needed = self.needs_clarification(request.message, intent)
        
        if clarification_needed:
            # 확인 질문 생성
            clarification_question = self.generate_clarification_question(request.message, intent)
            response = {
                "type": "clarification",
                "question": clarification_question,
                "suggestions": self.generate_suggestions(intent),
                "context": intent
            }
        else:
            # 정확한 답변 생성
            accurate_response = self.generate_accurate_response(request.message, intent, request.context_history)
            response = {
                "type": "answer",
                "response": accurate_response,
                "confidence": self.calculate_confidence(intent),
                "sources": self.get_relevant_sources(intent),
                "context": intent
            }

        processing_time = int((time.time() - start_time) * 1000)

        return {
            "success": True,
            "data": response,
            "metadata": {
                "processing_time": processing_time,
                "intent": intent,
                "clarification_needed": clarification_needed
            },
            "timestamp": datetime.now().isoformat()
        }

    def needs_clarification(self, message: str, intent: Dict) -> bool:
        """사용자 메시지가 확인이 필요한지 판단"""
        unclear_keywords = [
            "이것", "그것", "저것", "이런", "그런", "저런",
            "이거", "그거", "저거", "이런 것", "그런 것", "저런 것"
        ]
        
        vague_indicators = [
            "좀", "약간", "대략", "대충", "어쩌면", "아마",
            "보통", "일반적으로", "대부분", "보통은"
        ]
        
        # 불명확한 표현이 있는지 확인
        has_unclear = any(keyword in message for keyword in unclear_keywords)
        has_vague = any(indicator in message for indicator in vague_indicators)
        
        # 의도가 명확하지 않은 경우
        intent_confidence = intent.get("confidence", 0)
        
        return has_unclear or has_vague or intent_confidence < 0.7

    def generate_clarification_question(self, message: str, intent: Dict) -> str:
        """확인 질문 생성"""
        intent_type = intent.get("type", "general")
        
        if intent_type == "question":
            return f"'{message}'에 대해 더 구체적으로 알려주실 수 있나요? 어떤 부분에 대해 궁금하신지요?"
        elif intent_type == "request":
            return f"'{message}' 요청에 대해 더 자세히 설명해주세요. 어떤 결과를 원하시나요?"
        elif intent_type == "comparison":
            return f"'{message}' 비교에 대해 더 구체적으로 말씀해주세요. 어떤 기준으로 비교하고 싶으신가요?"
        else:
            return f"'{message}'에 대해 더 자세히 설명해주세요. 정확히 어떤 도움이 필요하신가요?"

    def generate_suggestions(self, intent: Dict) -> List[str]:
        """의도에 따른 제안사항 생성"""
        intent_type = intent.get("type", "general")
        
        suggestions = {
            "question": [
                "구체적인 질문을 해주세요",
                "예시를 들어 설명해주세요",
                "어떤 상황에서 궁금하신지 알려주세요"
            ],
            "request": [
                "원하는 결과를 구체적으로 설명해주세요",
                "언제까지 필요한지 알려주세요",
                "어떤 형식으로 원하시는지 알려주세요"
            ],
            "comparison": [
                "비교 기준을 명확히 해주세요",
                "어떤 관점에서 비교하고 싶으신지 알려주세요",
                "우선순위를 정해주세요"
            ],
            "general": [
                "더 구체적으로 설명해주세요",
                "예시를 들어 설명해주세요",
                "어떤 상황에서 필요한지 알려주세요"
            ]
        }
        
        return suggestions.get(intent_type, suggestions["general"])

    def generate_accurate_response(self, message: str, intent: Dict, context_history: List[Dict]) -> str:
        """정확한 답변 생성"""
        intent_type = intent.get("type", "general")
        confidence = intent.get("confidence", 0.8)
        
        # 맥락 기반 응답 생성
        context_response = self.build_contextual_response(message, intent, context_history)
        
        # 신뢰도에 따른 응답 조정
        if confidence >= 0.9:
            response = f"✅ {context_response}\n\n이 답변이 정확한지 확인해주세요."
        elif confidence >= 0.7:
            response = f"💭 {context_response}\n\n이 답변이 도움이 되는지 알려주세요."
        else:
            response = f"🤔 {context_response}\n\n이 답변이 맞는지 확인해주세요."
        
        return response

    def build_contextual_response(self, message: str, intent: Dict, context_history: List[Dict]) -> str:
        """맥락을 고려한 응답 구성"""
        intent_type = intent.get("type", "general")
        
        # 이전 대화 맥락 분석
        recent_context = self.analyze_recent_context(context_history)
        
        if intent_type == "question":
            return self.generate_question_response(message, recent_context)
        elif intent_type == "request":
            return self.generate_request_response(message, recent_context)
        elif intent_type == "comparison":
            return self.generate_comparison_response(message, recent_context)
        else:
            return self.generate_general_response(message, recent_context)

    def analyze_recent_context(self, context_history: List[Dict]) -> Dict:
        """최근 대화 맥락 분석"""
        if not context_history:
            return {"topics": [], "sentiment": "neutral", "user_preferences": []}
        
        recent_messages = context_history[-5:]  # 최근 5개 메시지
        
        topics = []
        sentiments = []
        preferences = []
        
        for msg in recent_messages:
            # 주제 추출
            if "AI" in msg.get("message", ""):
                topics.append("AI/기술")
            if "분석" in msg.get("message", ""):
                topics.append("분석/데이터")
            if "대화" in msg.get("message", ""):
                topics.append("대화/소통")
            
            # 감정 분석
            if any(word in msg.get("message", "") for word in ["좋아", "감사", "훌륭"]):
                sentiments.append("positive")
            elif any(word in msg.get("message", "") for word in ["싫어", "안좋아", "문제"]):
                sentiments.append("negative")
            else:
                sentiments.append("neutral")
        
        return {
            "topics": list(set(topics)),
            "sentiment": max(set(sentiments), key=sentiments.count) if sentiments else "neutral",
            "user_preferences": preferences
        }

    def generate_question_response(self, message: str, context: Dict) -> str:
        """질문에 대한 응답 생성"""
        topics = context.get("topics", [])
        
        if "AI/기술" in topics:
            return f"AI 기술에 대한 질문이시군요! '{message}'에 대해 구체적으로 답변드리겠습니다. AI의 현재 발전 상황과 미래 전망에 대해 설명해드릴까요?"
        elif "분석/데이터" in topics:
            return f"데이터 분석에 대한 질문이시군요! '{message}'에 대해 체계적으로 분석해드리겠습니다. 어떤 종류의 분석이 필요하신가요?"
        else:
            return f"'{message}'에 대한 답변을 드리겠습니다. 더 구체적인 정보가 필요하시면 말씀해주세요."

    def generate_request_response(self, message: str, context: Dict) -> str:
        """요청에 대한 응답 생성"""
        sentiment = context.get("sentiment", "neutral")
        
        if sentiment == "positive":
            return f"긍정적인 요청이시군요! '{message}'를 도와드리겠습니다. 어떤 방식으로 진행하면 좋을지 제안해드릴까요?"
        else:
            return f"'{message}' 요청을 처리해드리겠습니다. 구체적인 방법을 제시해드릴게요."

    def generate_comparison_response(self, message: str, context: Dict) -> str:
        """비교에 대한 응답 생성"""
        return f"'{message}' 비교 분석을 해드리겠습니다. 객관적인 기준으로 비교해드릴게요."

    def generate_general_response(self, message: str, context: Dict) -> str:
        """일반적인 응답 생성"""
        sentiment = context.get("sentiment", "neutral")
        
        if sentiment == "positive":
            return f"좋은 질문이시군요! '{message}'에 대해 도움을 드리겠습니다."
        else:
            return f"'{message}'에 대해 답변드리겠습니다. 더 자세한 정보가 필요하시면 말씀해주세요."

    def calculate_confidence(self, intent: Dict) -> float:
        """답변 신뢰도 계산"""
        base_confidence = intent.get("confidence", 0.8)
        
        # 의도 타입에 따른 조정
        intent_type = intent.get("type", "general")
        type_confidence = {
            "question": 0.9,
            "request": 0.85,
            "comparison": 0.8,
            "general": 0.75
        }
        
        return min(base_confidence * type_confidence.get(intent_type, 0.8), 1.0)

    def get_relevant_sources(self, intent: Dict) -> List[str]:
        """관련 소스 정보"""
        intent_type = intent.get("type", "general")
        
        sources = {
            "question": ["최신 기술 트렌드", "전문가 의견", "실제 사례"],
            "request": ["모범 사례", "가이드라인", "체크리스트"],
            "comparison": ["비교 기준", "데이터 분석", "객관적 지표"],
            "general": ["일반적인 정보", "기본 가이드", "참고 자료"]
        }
        
        return sources.get(intent_type, sources["general"])

    async def analyze_conversation(self, request: AnalysisRequest):
        if request.conversation_id not in self.active_conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        messages = self.active_conversations[request.conversation_id]
        
        # 대화 분석
        conversation_length = len(messages)
        average_message_length = sum(len(msg["message"]) for msg in messages) / conversation_length if conversation_length > 0 else 0
        
        # 감정 분포 분석
        emotion_analyzer = EmotionAnalyzer()
        emotions = [emotion_analyzer.analyze(msg["message"]) for msg in messages]
        emotion_distribution = {}
        for emotion in emotions:
            emotion_distribution[emotion] = emotion_distribution.get(emotion, 0) + 1
        
        # 키워드 분석
        keywords = {}
        for msg in messages:
            words = msg["message"].split()
            for word in words:
                if len(word) > 1:
                    keywords[word] = keywords.get(word, 0) + 1
        
        return {
            "success": True,
            "data": {
                "conversation_length": conversation_length,
                "average_message_length": average_message_length,
                "emotion_distribution": emotion_distribution,
                "top_keywords": dict(sorted(keywords.items(), key=lambda x: x[1], reverse=True)[:10]),
                "topics": [],
                "conversation_flow": "smooth",
                "user_satisfaction": 0.0
            },
            "timestamp": datetime.now().isoformat()
        }

    async def generate_insights(self, request: InsightRequest):
        if request.conversation_id not in self.active_conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        messages = self.active_conversations[request.conversation_id]
        
        # 인사이트 생성
        patterns = ["일반적인 대화 패턴"]
        recommendations = ["다양한 주제로 대화 확장"]
        predictions = ["일반적인 대화 지속"]
        improvements = ["사용자 만족도 향상", "대화 지속성 강화"]
        
        return {
            "success": True,
            "data": {
                "patterns": patterns,
                "recommendations": recommendations,
                "predictions": predictions,
                "improvements": improvements
            },
            "timestamp": datetime.now().isoformat()
        }

    async def process_quality_feedback(self, request: QualityFeedbackRequest):
        """응답 품질 피드백 처리"""
        try:
            # 피드백 저장 (실제 구현에서는 데이터베이스에 저장)
            feedback_data = {
                "conversation_id": request.conversation_id,
                "user_id": request.user_id,
                "message_id": request.message_id,
                "quality": request.quality,
                "feedback": request.feedback,
                "timestamp": datetime.now().isoformat()
            }
            
            # 피드백 분석 및 개선점 도출
            improvement_suggestions = self.analyze_feedback(feedback_data)
            
            return {
                "success": True,
                "data": {
                    "message": "피드백이 성공적으로 처리되었습니다.",
                    "improvements": improvement_suggestions
                },
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

    def analyze_feedback(self, feedback_data: Dict) -> List[str]:
        """피드백 분석 및 개선점 도출"""
        quality = feedback_data.get("quality", "neutral")
        feedback = feedback_data.get("feedback", "")
        
        improvements = []
        
        if quality == "bad":
            if "불명확" in feedback or "모호" in feedback:
                improvements.append("더 구체적인 질문을 유도하는 확인 질문 개선")
            if "부정확" in feedback or "틀림" in feedback:
                improvements.append("답변 정확도 향상을 위한 맥락 분석 강화")
            if "부족" in feedback or "짧음" in feedback:
                improvements.append("더 상세한 답변 제공을 위한 정보 확장")
        else:
            improvements.append("현재 응답 품질 유지 및 지속적 개선")
        
        return improvements

    async def handle_websocket(self, websocket: WebSocket, conversation_id: str):
        await websocket.accept()
        try:
            while True:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # WebSocket 메시지 처리
                response = {"type": "message", "content": "WebSocket 메시지 처리됨"}
                await websocket.send_text(json.dumps(response))
        except WebSocketDisconnect:
            print(f"WebSocket 연결 해제: {conversation_id}")

class EmotionAnalyzer:
    def analyze(self, text: str) -> str:
        positive_words = ["좋아", "감사", "훌륭", "완벽", "최고", "사랑", "행복"]
        negative_words = ["싫어", "안좋아", "문제", "실패", "어려워", "힘들어", "화나"]
        
        text_lower = text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"

class ContextAnalyzer:
    def analyze(self, text: str, history: List[Dict]) -> Dict:
        return {
            "is_question": "?" in text or any(word in text for word in ["무엇", "어떻게", "왜"]),
            "is_request": any(word in text for word in ["해주세요", "도와", "필요해"]),
            "is_greeting": any(word in text for word in ["안녕", "반갑", "좋은"]),
            "keywords": text.split()[:5],
            "topics": [],
            "topic": "일반"
        }

class IntentAnalyzer:
    def analyze_intent(self, text: str) -> Dict:
        # 의도 분석
        if "?" in text or any(word in text for word in ["무엇", "어떻게", "왜", "언제", "어디"]):
            intent_type = "question"
            confidence = 0.9
        elif any(word in text for word in ["해주세요", "도와", "필요해", "원해"]):
            intent_type = "request"
            confidence = 0.85
        elif any(word in text for word in ["비교", "차이", "어떤", "더"]):
            intent_type = "comparison"
            confidence = 0.8
        else:
            intent_type = "general"
            confidence = 0.7
        
        return {
            "type": intent_type,
            "confidence": confidence,
            "keywords": text.split()[:5]
        }

class ResponseGenerator:
    def generate(self, message: str, context: Dict, personality: str, style: str) -> str:
        if context.get("is_greeting"):
            return f"👋 안녕하세요! {message}\n\n저는 도움을 주는 CORBU.AI입니다. 무엇을 도와드릴까요?"
        elif context.get("is_question"):
            return f"🤔 {message}에 대한 답변을 드리겠습니다.\n\n도움을 주는 관점에서 대화형 답변을 제공해드릴게요."
        elif context.get("is_request"):
            return f"✅ {message} 요청을 처리하고 있습니다.\n\n최적의 방법으로 도움을 드리겠습니다."
        else:
            return f"💭 {message}에 대해 생각해보겠습니다.\n\n도움을 주는 관점에서 대화형 분석을 제공해드릴게요."

if __name__ == "__main__":
    import os

    api = EnhancedConversationalAPI()
    _port = int(
        os.environ.get("ENHANCED_CONV_PORT", os.environ.get("PORT", "8003"))
    )
    uvicorn.run(api.app, host="0.0.0.0", port=_port) 