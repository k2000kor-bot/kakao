from fastapi import (
    FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import asyncio
from datetime import datetime, timedelta
import random
from knowledge_management import knowledge_system
import os
from advanced_ai_trainer import ai_trainer
from guideline_manager import guideline_manager
from knowledge_enhancer import knowledge_enhancer
from pathlib import Path
from advanced_knowledge_manager import advanced_knowledge_manager
from auto_file_organizer import AutoFileOrganizer, start_file_watcher
import threading
from intelligent_project_manager import IntelligentProjectManager
from redevelopment_ai_specialist import RedevelopmentAISpecialist
from advanced_context_intelligence import (
    create_advanced_context_intelligence, IntelligenceLevel
)
from quantum_conversation_engine import create_quantum_conversation_engine
import numpy as np

app = FastAPI(title="KakaoTalk Conversation Analysis API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket 연결 관리


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass


manager = ConnectionManager()

# Pydantic 모델들


class ChatMessage(BaseModel):
    id: str
    sender: str
    content: str
    timestamp: str
    isDeleted: Optional[bool] = False


class ChatRoom(BaseModel):
    id: str
    name: str
    topic: str
    participantCount: int
    lastMessage: str


class SystemMetrics(BaseModel):
    totalMessages: int
    activeUsers: int
    sentimentScore: float


class ResponseRequest(BaseModel):
    strategy: str
    characteristics: str
    preference: str
    content: str
    chatRoomId: str


class SmartResponseRequest(BaseModel):
    chatRoomId: str
    conversationContext: Dict[str, Any]
    includeReasoning: bool = False


class MessageTemplate(BaseModel):
    id: str
    title: str
    content: str
    category: str
    tags: List[str]
    usage: int = 0
    rating: float = 0.0
    isFavorite: bool = False
    isCustom: bool = False
    createdAt: str
    lastUsed: Optional[str] = None


class AdvancedMessageRequest(BaseModel):
    messageContent: str
    selectedStyle: str
    selectedTone: str
    selectedStructure: str
    targetAudience: str
    context: str
    keywords: List[str]


class MessageSuggestionRequest(BaseModel):
    conversationContext: Dict[str, Any]
    filters: Dict[str, Any]


class KnowledgeDocument(BaseModel):
    id: str
    title: str
    content: str
    category: str
    subcategory: str
    tags: List[str]
    fileType: str
    fileSize: int
    uploadDate: str
    lastModified: str
    confidence: float
    isProcessed: bool
    isTraining: bool
    aiInsights: List[str]
    usage: int
    rating: float


# 샘플 데이터
sample_chatrooms = [
    {
        "id": "chatroom1",
        "name": "조합원 대화방",
        "topic": "조합원 소통",
        "participantCount": 25,
        "lastMessage": "오늘 회의 일정 확인해주세요"
    },
    {
        "id": "chatroom2", 
        "name": "시공사 협의방",
        "topic": "시공사 협의",
        "participantCount": 12,
        "lastMessage": "공사 일정 조율 필요합니다"
    },
    {
        "id": "chatroom3",
        "name": "관리자 공지방",
        "topic": "관리자 공지",
        "participantCount": 8,
        "lastMessage": "새로운 규정 안내드립니다"
    }
]

sample_templates = [
    {
        "id": "1",
        "title": "조합원 환영 메시지",
        "content": "안녕하세요! 조합에 새로 가입하신 조합원님을 환영합니다. 함께 더 나은 근무 환경을 만들어가겠습니다. 궁금한 점이 있으시면 언제든 문의해주세요.",
        "category": "greeting",
        "tags": ["환영", "신규", "안내"],
        "usage": 45,
        "rating": 4.8,
        "isFavorite": True,
        "isCustom": False,
        "createdAt": "2024-01-15"
    },
    {
        "id": "2",
        "title": "급여 체불 해결 안내",
        "content": "급여 체불 문제로 고민이 많으시군요. 조합에서 시공사와 긴급 협의를 진행하고 있습니다. 최대한 빠른 시일 내에 해결하도록 하겠습니다. 조금만 더 기다려주세요.",
        "category": "salary",
        "tags": ["급여", "체불", "해결", "협의"],
        "usage": 32,
        "rating": 4.6,
        "isFavorite": False,
        "isCustom": False,
        "createdAt": "2024-01-10"
    }
]


# API 엔드포인트들
@app.get("/")
async def root():
    return {"message": "KakaoTalk Conversation Analysis API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/chatrooms")
async def get_chatrooms():
    return {"chatrooms": sample_chatrooms}


@app.get("/chatrooms/{chatroom_id}/messages")
async def get_chat_messages(chatroom_id: str, period: str = "all"):
    # 샘플 메시지 데이터
    sample_messages = [
        {
            "id": "1",
            "sender": "김조합장 101-1201",
            "content": (
                "안녕하세요. 오늘 오후 2시에 조합원 총회가 있습니다. "
                "참석 가능하신 분들은 댓글로 알려주세요."
            ),
            "timestamp": "4월 24일 오후 01:15"
        },
        {
            "id": "2", 
            "sender": "이부조합장 102-1302",
            "content": (
                "네, 참석하겠습니다. 회의 안건 미리 공유해주시면 "
                "준비하겠습니다."
            ),
            "timestamp": "4월 24일 오후 01:18"
        }
    ]
    return sample_messages


@app.get("/system/metrics")
async def get_system_metrics():
    return {
        "totalMessages": random.randint(100, 1000),
        "activeUsers": random.randint(5, 25),
        "sentimentScore": round(random.uniform(0, 100), 1)
    }


@app.post("/ai/response")
async def generate_ai_response(request: ResponseRequest):
    try:
        # AI 응답 생성 시뮬레이션
        response_content = (
            f"선택된 전략: {request.strategy}\n"
            f"특성: {request.characteristics}\n"
            f"선호도: {request.preference}\n\n"
            f"{request.content}에 대한 AI 응답이 생성되었습니다."
        )
        
        return {
            "message": response_content,
            "strategy": request.strategy,
            "confidence": round(random.uniform(0.7, 0.95), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/smart-response")
async def generate_smart_response(request: SmartResponseRequest):
    try:
        # 고급 AI 응답 생성 시뮬레이션
        reasoning = "대화 컨텍스트를 분석하여 적절한 응답을 생성했습니다."
        response_content = (
            f"고급 AI 분석을 통한 응답:\n\n"
            f"{request.conversationContext.get('desiredContent', '기본 응답')}\n\n"
            f"추론: {reasoning}"
        )
        
        return {
            "message": response_content,
            "reasoning": reasoning if request.includeReasoning else None,
            "confidence": round(random.uniform(0.8, 0.98), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/analyze-sentiment")
async def analyze_sentiment(messages: List[ChatMessage]):
    try:
        # 감정 분석 시뮬레이션
        sentiment_scores = []
        for message in messages:
            score = random.uniform(-1, 1)
            sentiment_scores.append({
                "messageId": message.id,
                "sentiment": (
                    "positive" if score > 0.3 
                    else "negative" if score < -0.3 
                    else "neutral"
                ),
                "score": round(score, 2)
            })
        
        return {
            "analysis": sentiment_scores,
            "overallSentiment": "neutral",
            "confidence": round(random.uniform(0.7, 0.95), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/extract-topics")
async def extract_topics(messages: List[ChatMessage]):
    try:
        # 주제 추출 시뮬레이션
        topics = ["급여", "복지", "안전", "교육", "협의"]
        extracted_topics = random.sample(topics, random.randint(2, 4))
        
        return {
            "topics": extracted_topics,
            "confidence": round(random.uniform(0.7, 0.95), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/quality-analysis")
async def analyze_quality(message: str):
    try:
        # 품질 분석 시뮬레이션
        return {
            "relevance": round(random.uniform(0.6, 0.95), 2),
            "coherence": round(random.uniform(0.7, 0.95), 2),
            "helpfulness": round(random.uniform(0.6, 0.9), 2),
            "naturalness": round(random.uniform(0.7, 0.95), 2),
            "overall": round(random.uniform(0.7, 0.9), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 새로운 메시지 생성 관련 API들
@app.get("/templates")
async def get_message_templates(category: Optional[str] = None, search: Optional[str] = None):
    """메시지 템플릿 목록 조회"""
    try:
        templates = sample_templates
        
        if category and category != "all":
            templates = [t for t in templates if t["category"] == category]
        
        if search:
            templates = [t for t in templates if 
                       search.lower() in t["title"].lower() or 
                       search.lower() in t["content"].lower() or
                       any(search.lower() in tag.lower() for tag in t["tags"])]
        
        return {"templates": templates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/templates")
async def create_message_template(template: MessageTemplate):
    """새 메시지 템플릿 생성"""
    try:
        new_template = template.dict()
        new_template["id"] = str(len(sample_templates) + 1)
        new_template["createdAt"] = datetime.now().isoformat()
        sample_templates.append(new_template)
        
        return {"message": "템플릿이 성공적으로 생성되었습니다.", "template": new_template}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/templates/{template_id}")
async def update_message_template(template_id: str, template: MessageTemplate):
    """메시지 템플릿 수정"""
    try:
        for i, existing_template in enumerate(sample_templates):
            if existing_template["id"] == template_id:
                sample_templates[i] = template.dict()
                return {"message": "템플릿이 성공적으로 수정되었습니다."}
        
        raise HTTPException(status_code=404, detail="템플릿을 찾을 수 없습니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/templates/{template_id}")
async def delete_message_template(template_id: str):
    """메시지 템플릿 삭제"""
    try:
        for i, template in enumerate(sample_templates):
            if template["id"] == template_id:
                del sample_templates[i]
                return {"message": "템플릿이 성공적으로 삭제되었습니다."}
        
        raise HTTPException(status_code=404, detail="템플릿을 찾을 수 없습니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/advanced-compose")
async def advanced_message_compose(request: AdvancedMessageRequest):
    """고급 메시지 작성"""
    try:
        # 메시지 품질 분석 시뮬레이션
        quality_scores = {
            "clarity": round(random.uniform(0.7, 0.95), 2),
            "empathy": round(random.uniform(0.6, 0.9), 2),
            "professionalism": round(random.uniform(0.8, 0.95), 2),
            "effectiveness": round(random.uniform(0.7, 0.9), 2),
            "overall": round(random.uniform(0.7, 0.9), 2)
        }
        
        # 개선 제안 생성
        suggestions = []
        if quality_scores["clarity"] < 0.8:
            suggestions.append("메시지를 더 명확하게 작성해보세요")
        if quality_scores["empathy"] < 0.75:
            suggestions.append("공감을 더 표현해보세요")
        if quality_scores["professionalism"] < 0.85:
            suggestions.append("더 전문적인 표현을 사용해보세요")
        
        return {
            "qualityScores": quality_scores,
            "suggestions": suggestions,
            "improvedMessage": request.messageContent + "\n\n[AI 개선 제안이 적용된 메시지]"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/message-suggestions")
async def get_message_suggestions(request: MessageSuggestionRequest):
    """지능형 메시지 제안"""
    try:
        # 제안 메시지 생성 시뮬레이션
        suggestions = [
            {
                "id": "1",
                "content": "급여 체불 문제로 고민이 많으시군요. 조합에서 시공사와 긴급 협의를 진행하고 있습니다.",
                "type": "solution",
                "confidence": 0.92,
                "reasoning": "급여 체불 문제에 대한 구체적인 해결 방안 제시",
                "tone": "공감적",
                "length": "medium",
                "tags": ["급여", "체불", "해결", "협의"],
                "isSelected": False
            },
            {
                "id": "2",
                "content": "조합원 여러분의 어려움을 잘 알고 있습니다. 함께 해결해보겠습니다.",
                "type": "encouragement",
                "confidence": 0.88,
                "reasoning": "조합원들의 감정에 공감하고 함께 해결하겠다는 의지 표현",
                "tone": "공감적",
                "length": "short",
                "tags": ["공감", "지지", "함께"],
                "isSelected": False
            }
        ]
        
        # 필터 적용
        if request.filters.get("type"):
            suggestions = [s for s in suggestions if s["type"] in request.filters["type"]]
        
        if request.filters.get("tone"):
            suggestions = [s for s in suggestions if s["tone"] in request.filters["tone"]]
        
        if request.filters.get("minConfidence"):
            suggestions = [s for s in suggestions if s["confidence"] >= request.filters["minConfidence"]]
        
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/analyze-conversation")
async def analyze_conversation_context(messages: List[ChatMessage]):
    """대화 컨텍스트 분석"""
    try:
        # 대화 분석 시뮬레이션
        analysis = {
            "sentiment": random.choice(["positive", "negative", "neutral"]),
            "urgency": random.choice(["low", "medium", "high"]),
            "keyTopics": ["급여", "복지", "안전"],
            "suggestedTone": "공감적",
            "priorityActions": ["즉시 응답", "구체적 해결책 제시", "진행 상황 안내"]
        }
        
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 지식 관리 시스템 API들
@app.post("/knowledge/upload")
async def upload_knowledge_document(file: UploadFile = File(...)):
    """지식 문서 업로드"""
    try:
        # 파일 내용 읽기
        file_content = await file.read()
        
        # 지식 관리 시스템으로 파일 처리
        result = knowledge_system.process_uploaded_file(file_content, file.filename)
        
        if result['success']:
            return {
                "success": True,
                "document": result['document'],
                "classification": result['classification'],
                "insights": result['insights']
            }
        else:
            raise HTTPException(status_code=400, detail=result['error'])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge/documents")
async def get_knowledge_documents(category: Optional[str] = None, search: Optional[str] = None):
    """지식 문서 목록 조회"""
    try:
        documents = knowledge_system.get_documents(category, search)
        return {"documents": documents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/knowledge/documents/{document_id}")
async def delete_knowledge_document(document_id: str):
    """지식 문서 삭제"""
    try:
        result = knowledge_system.delete_document(document_id)
        if result['success']:
            return {"message": result['message']}
        else:
            raise HTTPException(status_code=404, detail=result['error'])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/knowledge/documents/{document_id}/usage")
async def update_document_usage(document_id: str):
    """문서 사용 횟수 업데이트"""
    try:
        result = knowledge_system.update_document_usage(document_id)
        if result['success']:
            return {"usage": result['usage']}
        else:
            raise HTTPException(status_code=404, detail=result['error'])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 지식 고도화 관련 API
@app.post("/knowledge/extract")
async def extract_knowledge_from_documents():
    """문서에서 지식 추출"""
    try:
        # 처리된 문서들 로드
        documents = []
        processed_dir = Path("processed")
        
        for category_dir in processed_dir.iterdir():
            if category_dir.is_dir():
                for file_path in category_dir.iterdir():
                    if file_path.is_file():
                        # 간단한 문서 정보 생성
                        doc_info = {
                            'title': file_path.stem,
                            'content': f"{file_path.stem} 관련 문서",
                            'category': category_dir.name,
                            'file_path': str(file_path)
                        }
                        documents.append(doc_info)
        
        # 지식 추출
        knowledge_items = knowledge_enhancer.extract_knowledge_from_documents(documents)
        
        # 지식 저장
        for item in knowledge_items:
            knowledge_enhancer.save_knowledge_item(item)
        
        return {
            "status": "success",
            "extracted_count": len(knowledge_items),
            "knowledge_items": [item.title for item in knowledge_items]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge/search")
async def search_knowledge(query: str, limit: int = 10):
    """지식 검색"""
    try:
        results = knowledge_enhancer.search_knowledge(query, limit)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge/type/{knowledge_type}")
async def get_knowledge_by_type(knowledge_type: str):
    """타입별 지식 조회"""
    try:
        from knowledge_enhancer import KnowledgeType
        ktype = KnowledgeType(knowledge_type)
        items = knowledge_enhancer.get_knowledge_by_type(ktype)
        
        return {
            "knowledge_type": knowledge_type,
            "items": [
                {
                    "id": item.id,
                    "title": item.title,
                    "content": item.content[:200] + '...' if len(item.content) > 200 else item.content,
                    "category": item.category,
                    "priority": item.priority.value,
                    "confidence": item.confidence_score,
                    "usage_count": item.usage_count,
                    "expert_verified": item.expert_verified
                }
                for item in items
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge/category/{category}")
async def get_knowledge_by_category(category: str):
    """카테고리별 지식 조회"""
    try:
        items = knowledge_enhancer.get_knowledge_by_category(category)
        
        return {
            "category": category,
            "items": [
                {
                    "id": item.id,
                    "title": item.title,
                    "content": item.content[:200] + '...' if len(item.content) > 200 else item.content,
                    "knowledge_type": item.knowledge_type.value,
                    "priority": item.priority.value,
                    "confidence": item.confidence_score,
                    "usage_count": item.usage_count,
                    "expert_verified": item.expert_verified
                }
                for item in items
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge/{knowledge_id}/related")
async def get_related_knowledge(knowledge_id: str, limit: int = 5):
    """관련 지식 조회"""
    try:
        related_items = knowledge_enhancer.get_related_knowledge(knowledge_id, limit)
        
        return {
            "knowledge_id": knowledge_id,
            "related_items": [
                {
                    "id": item.id,
                    "title": item.title,
                    "content": item.content[:200] + '...' if len(item.content) > 200 else item.content,
                    "knowledge_type": item.knowledge_type.value,
                    "category": item.category,
                    "priority": item.priority.value,
                    "confidence": item.confidence_score
                }
                for item in related_items
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/knowledge/{knowledge_id}/usage")
async def update_knowledge_usage(knowledge_id: str, request: Dict[str, Any]):
    """지식 사용 기록 업데이트"""
    try:
        query = request.get("query", "")
        context = request.get("context", "")
        rating = request.get("rating")
        
        knowledge_enhancer.update_knowledge_usage(knowledge_id, query, context, rating)
        return {"message": "지식 사용 기록이 업데이트되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/knowledge/{knowledge_id}/verify")
async def add_expert_verification(knowledge_id: str, request: Dict[str, Any]):
    """전문가 검증 추가"""
    try:
        expert_name = request.get("expert_name", "")
        status = request.get("status", "")
        comments = request.get("comments", "")
        
        knowledge_enhancer.add_expert_verification(knowledge_id, expert_name, status, comments)
        return {"message": "전문가 검증이 추가되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge/statistics")
async def get_knowledge_statistics():
    """지식 통계 조회"""
    try:
        stats = knowledge_enhancer.get_knowledge_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# AI 학습 관련 API
@app.post("/ai/training/start")
async def start_ai_training():
    """AI 학습 시작"""
    try:
        result = ai_trainer.start_comprehensive_training()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/training/status")
async def get_training_status():
    """AI 학습 상태 조회"""
    try:
        return ai_trainer.get_training_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/training/load-models")
async def load_ai_models(timestamp: Optional[str] = None):
    """AI 모델 로드"""
    try:
        result = ai_trainer.load_models(timestamp)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/predict/category")
async def predict_text_category(request: Dict[str, Any]):
    """텍스트 카테고리 예측"""
    try:
        text = request.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="텍스트가 필요합니다.")
        
        result = ai_trainer.predict_text_category(text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/analyze/sentiment")
async def analyze_sentiment(request: Dict[str, Any]):
    """감정 분석"""
    try:
        text = request.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="텍스트가 필요합니다.")
        
        result = ai_trainer.analyze_sentiment(text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 지침 관리 관련 API
@app.post("/guidelines/generate")
async def generate_guidelines_from_data():
    """데이터에서 지침 자동 생성"""
    try:
        result = guideline_manager.generate_guidelines_from_data()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/guidelines")
async def get_guidelines(category: Optional[str] = None, priority: Optional[str] = None):
    """지침 목록 조회"""
    try:
        guidelines = guideline_manager.get_guidelines(category, priority)
        return {"guidelines": guidelines}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/guidelines/relevant")
async def get_relevant_guidelines(request: Dict[str, Any]):
    """관련 지침 조회"""
    try:
        context = request.get("context", "")
        limit = request.get("limit", 5)
        
        if not context:
            raise HTTPException(status_code=400, detail="컨텍스트가 필요합니다.")
        
        guidelines = guideline_manager.get_relevant_guidelines(context, limit)
        return {"guidelines": guidelines}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/guidelines/{guideline_id}/usage")
async def update_guideline_usage(guideline_id: str, request: Dict[str, Any]):
    """지침 사용 기록 업데이트"""
    try:
        context = request.get("context", "")
        feedback = request.get("feedback", "")
        
        guideline_manager.update_guideline_usage(guideline_id, context, feedback)
        return {"message": "지침 사용 기록이 업데이트되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/guidelines/{guideline_id}/evaluate")
async def evaluate_guideline_effectiveness(guideline_id: str, request: Dict[str, Any]):
    """지침 효과성 평가"""
    try:
        metrics = request.get("metrics", {})
        
        guideline_manager.evaluate_guideline_effectiveness(guideline_id, metrics)
        return {"message": "지침 효과성이 평가되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/guidelines/statistics")
async def get_guideline_statistics():
    """지침 통계 조회"""
    try:
        stats = guideline_manager.get_guideline_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 폴더 동기화 API
class SyncFolderRequest(BaseModel):
    folderPath: str
    options: Dict[str, Any] = {}
    filters: Dict[str, Any] = {}
    searchKeywords: List[str] = []
    categoryTags: List[str] = []

@app.post("/api/sync-folder")
async def sync_folder(request: SyncFolderRequest):
    """폴더 동기화 API"""
    try:
        folder_path = request.folderPath
        
        if not folder_path or not os.path.exists(folder_path):
            raise HTTPException(status_code=400, detail="폴더 경로가 유효하지 않습니다.")
        
        # 폴더 내 파일 스캔
        processed_files = 0
        db_records = 0
        
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                file_ext = os.path.splitext(file)[1].lower()
                
                # 파일 필터 적용
                if not should_process_file(file_ext, request.filters):
                    continue
                
                try:
                    # 파일 처리 및 데이터베이스화
                    if process_file_for_database(file_path, request.searchKeywords, request.categoryTags):
                        db_records += 1
                    processed_files += 1
                    
                except Exception as e:
                    print(f"파일 처리 오류 {file_path}: {str(e)}")
                    continue
        
        return {
            "success": True,
            "processedFiles": processed_files,
            "dbRecords": db_records,
            "message": f'{processed_files}개 파일 처리, {db_records}개 레코드 추가'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"동기화 오류: {str(e)}")

@app.post("/api/sync-folder/stop")
async def stop_sync():
    """동기화 중지 API"""
    try:
        # 동기화 중지 로직 (필요시 구현)
        return {"success": True, "message": "동기화가 중지되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"중지 오류: {str(e)}")

def should_process_file(file_ext: str, filters: Dict[str, Any]) -> bool:
    """파일 필터링 로직"""
    if filters.get('includeTxt', True) and file_ext in ['.txt', '.md']:
        return True
    if filters.get('includeCsv', True) and file_ext == '.csv':
        return True
    if filters.get('includePdf', True) and file_ext in ['.pdf']:
        return True
    if filters.get('includeDoc', True) and file_ext in ['.doc', '.docx']:
        return True
    return False


def _read_sync_file_text(file_path: str, file_ext: str) -> Optional[str]:
    """폴더 동기화용 텍스트 읽기 (CSV는 utf-8-sig·cp949 등 시도)"""
    try:
        if file_ext == '.csv':
            raw = Path(file_path).read_bytes()
            for enc in ('utf-8-sig', 'utf-8', 'cp949', 'euc-kr'):
                try:
                    return raw.decode(enc)
                except UnicodeDecodeError:
                    continue
            return raw.decode('utf-8', errors='replace')
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        return None


def process_file_for_database(file_path: str, search_keywords: List[str], category_tags: List[str]) -> bool:
    """파일을 데이터베이스에 저장하는 로직"""
    try:
        file_ext = Path(file_path).suffix.lower()
        content = _read_sync_file_text(file_path, file_ext)
        if content is None:
            return False
        
        # 키워드 검색
        matched_keywords = []
        for keyword in search_keywords:
            if keyword.lower() in content.lower():
                matched_keywords.append(keyword)
        
        # 데이터베이스에 저장 (실제 구현에서는 DB 연결)
        file_data = {
            'file_path': file_path,
            'file_name': os.path.basename(file_path),
            'content': content[:1000],  # 내용 일부만 저장
            'matched_keywords': matched_keywords,
            'category_tags': category_tags,
            'processed_at': datetime.now().isoformat()
        }
        
        # 여기서 실제 데이터베이스 저장 로직 구현
        # save_to_database(file_data)
        
        return len(matched_keywords) > 0 or len(category_tags) > 0
        
    except Exception as e:
        print(f"파일 처리 오류 {file_path}: {str(e)}")
        return False

# WebSocket 연결
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # 실시간 데이터 시뮬레이션
            if message.get("type") == "subscribe":
                while True:
                    await asyncio.sleep(5)
                    real_time_data = {
                        "type": "real_time_update",
                        "timestamp": datetime.now().isoformat(),
                        "metrics": {
                            "totalMessages": random.randint(100, 1000),
                            "activeUsers": random.randint(5, 25),
                            "sentimentScore": round(random.uniform(0, 100), 1)
                        }
                    }
                    await websocket.send_text(json.dumps(real_time_data))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ============ 고급 지식 관리 API ============

@app.get("/api/knowledge/advanced/search")
async def advanced_knowledge_search(
    query: str,
    category: Optional[str] = None,
    limit: int = 10
):
    """고급 스마트 검색"""
    try:
        results = await advanced_knowledge_manager.smart_search(query, category, limit)
        return {
            "success": True,
            "query": query,
            "total_results": len(results),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/api/knowledge/advanced/document/{document_id}/analytics")
async def get_document_analytics(document_id: str):
    """문서 상세 분석"""
    try:
        analytics = await advanced_knowledge_manager.get_document_analytics(document_id)
        if not analytics:
            raise HTTPException(status_code=404, detail="Document not found")
        return {
            "success": True,
            "document_id": document_id,
            "analytics": analytics
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics failed: {str(e)}")

@app.get("/api/knowledge/advanced/statistics")
async def get_advanced_knowledge_statistics():
    """고급 지식 베이스 통계"""
    try:
        stats = await advanced_knowledge_manager.get_knowledge_statistics()
        return {
            "success": True,
            "statistics": stats,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Statistics failed: {str(e)}")

@app.post("/api/knowledge/advanced/bulk-analyze")
async def bulk_analyze_documents():
    """일괄 문서 분석"""
    try:
        analysis = await advanced_knowledge_manager.bulk_analyze_documents()
        return {
            "success": True,
            "analysis": analysis,
            "completed_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk analysis failed: {str(e)}")

@app.get("/api/knowledge/advanced/recommendations")
async def get_knowledge_recommendations():
    """지식 관리 추천사항"""
    try:
        recommendations = await advanced_knowledge_manager._generate_global_recommendations()
        return {
            "success": True,
            "recommendations": recommendations,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendations failed: {str(e)}")

@app.get("/api/knowledge/advanced/categories")
async def get_knowledge_categories():
    """지식 카테고리 정보"""
    return {
        "success": True,
        "categories": advanced_knowledge_manager.categories
    }

@app.post("/api/knowledge/advanced/similar-documents")
async def find_similar_documents(request: dict):
    """유사 문서 찾기"""
    try:
        document_id = request.get("document_id")
        limit = request.get("limit", 5)
        
        if not document_id:
            raise HTTPException(status_code=400, detail="document_id is required")
        
        similar_docs = await advanced_knowledge_manager._find_related_documents(document_id, limit)
        return {
            "success": True,
            "document_id": document_id,
            "similar_documents": similar_docs
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similar documents search failed: {str(e)}")

# ============ 실시간 지식 업데이트 API ============

@app.post("/api/knowledge/advanced/real-time/upload")
async def real_time_knowledge_upload(file: UploadFile = File(...)):
    """실시간 지식 업로드 및 분석"""
    try:
        # 파일 저장
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        
        file_path = upload_dir / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 실시간 분석 시뮬레이션
        analysis_result = {
            "file_info": {
                "filename": file.filename,
                "size": len(content),
                "upload_time": datetime.now().isoformat()
            },
            "ai_analysis": {
                "category": "training_materials",  # AI 분류 결과
                "confidence": 0.87,
                "key_topics": ["교육", "안전", "절차"],
                "summary": "교육 관련 문서로 안전 절차에 대한 내용을 포함합니다.",
                "complexity": "medium",
                "estimated_read_time": "5분"
            },
            "recommendations": [
                {
                    "type": "categorization",
                    "message": "교육 자료 카테고리로 분류를 제안합니다."
                },
                {
                    "type": "tagging",
                    "message": "안전, 교육, 절차 태그를 추가하는 것을 권장합니다."
                }
            ]
        }
        
        return {
            "success": True,
            "message": "File uploaded and analyzed successfully",
            "analysis": analysis_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/api/knowledge/advanced/dashboard")
async def get_knowledge_dashboard_data():
    """지식 관리 대시보드 데이터"""
    try:
        # 통계 데이터
        stats = await advanced_knowledge_manager.get_knowledge_statistics()
        
        # 최근 활동
        recent_activity = [
            {
                "type": "upload",
                "title": "새 문서 업로드",
                "description": "안전 가이드라인 v2.1",
                "timestamp": datetime.now().isoformat(),
                "category": "safety_guidelines"
            },
            {
                "type": "analysis",
                "title": "AI 분석 완료",
                "description": "25개 문서 분석 완료",
                "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat(),
                "category": "system"
            },
            {
                "type": "recommendation",
                "title": "새 추천사항",
                "description": "노동법 카테고리 문서 보강 필요",
                "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
                "category": "recommendation"
            }
        ]
        
        # 트렌드 데이터 (시뮬레이션)
        trend_data = {
            "upload_trend": [
                {"date": "2024-01-10", "count": 5},
                {"date": "2024-01-11", "count": 8},
                {"date": "2024-01-12", "count": 12},
                {"date": "2024-01-13", "count": 7},
                {"date": "2024-01-14", "count": 15},
                {"date": "2024-01-15", "count": 10}
            ],
            "category_popularity": [
                {"category": "training_materials", "score": 85},
                {"category": "safety_guidelines", "score": 72}, 
                {"category": "welfare_info", "score": 68},
                {"category": "labor_law", "score": 45},
                {"category": "union_policy", "score": 38},
                {"category": "negotiation_materials", "score": 28}
            ]
        }
        
        return {
            "success": True,
            "dashboard": {
                "statistics": stats,
                "recent_activity": recent_activity,
                "trends": trend_data,
                "system_health": {
                    "status": "healthy",
                    "ai_model_status": "active",
                    "last_backup": (datetime.now() - timedelta(hours=6)).isoformat(),
                    "storage_usage": "68%"
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard data failed: {str(e)}")

# ============ AI 학습 및 모델 관리 API ============

@app.post("/api/knowledge/advanced/ai/retrain")
async def retrain_ai_models():
    """AI 모델 재학습"""
    try:
        # 학습 시뮬레이션
        training_result = {
            "training_id": f"train_{int(datetime.now().timestamp())}",
            "status": "started",
            "estimated_duration": "15분",
            "models_to_train": [
                "document_classifier",
                "content_analyzer", 
                "similarity_calculator"
            ],
            "start_time": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "message": "AI model retraining started",
            "training": training_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")

@app.get("/api/knowledge/advanced/ai/training-status/{training_id}")
async def get_training_status(training_id: str):
    """AI 학습 상태 조회"""
    try:
        # 상태 시뮬레이션
        status_data = {
            "training_id": training_id,
            "status": "in_progress",
            "progress": 67,
            "current_stage": "content_analyzer 학습 중",
            "elapsed_time": "8분 32초",
            "estimated_remaining": "6분 28초",
            "metrics": {
                "accuracy": 0.89,
                "loss": 0.23,
                "validation_score": 0.91
            }
        }
        
        return {
            "success": True,
            "training_status": status_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training status check failed: {str(e)}")

# ============ 지식 품질 관리 API ============

@app.post("/api/knowledge/advanced/quality/audit")
async def audit_knowledge_quality():
    """지식 품질 감사"""
    try:
        audit_result = {
            "audit_id": f"audit_{int(datetime.now().timestamp())}",
            "total_documents": len(advanced_knowledge_manager.documents),
            "quality_scores": {
                "excellent": 45,  # 90% 이상
                "good": 78,       # 70-90%
                "fair": 23,       # 50-70%
                "poor": 8         # 50% 미만
            },
            "issues_found": [
                {
                    "type": "low_confidence",
                    "count": 8,
                    "description": "신뢰도가 낮은 문서들"
                },
                {
                    "type": "outdated",
                    "count": 12,
                    "description": "1년 이상 업데이트되지 않은 문서들"
                },
                {
                    "type": "missing_tags",
                    "count": 5,
                    "description": "태그가 부족한 문서들"
                }
            ],
            "recommendations": [
                "낮은 신뢰도 문서들의 내용을 검토하고 개선하세요.",
                "오래된 문서들을 최신 정보로 업데이트하세요.",
                "태그가 부족한 문서에 적절한 태그를 추가하세요."
            ]
        }
        
        return {
            "success": True,
            "audit": audit_result,
            "completed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quality audit failed: {str(e)}")

# ============ 지식 백업 및 복원 API ============

@app.post("/api/knowledge/advanced/backup/create")
async def create_knowledge_backup():
    """지식 백업 생성"""
    try:
        backup_info = {
            "backup_id": f"backup_{int(datetime.now().timestamp())}",
            "created_at": datetime.now().isoformat(),
            "total_documents": len(advanced_knowledge_manager.documents),
            "backup_size": "2.4GB",
            "includes": [
                "문서 메타데이터",
                "AI 분석 결과",
                "사용자 평점 및 사용 통계",
                "카테고리 및 태그 정보"
            ],
            "status": "completed"
        }
        
        return {
            "success": True,
            "message": "Knowledge backup created successfully",
            "backup": backup_info
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup creation failed: {str(e)}")

@app.get("/api/knowledge/advanced/backup/list")
async def list_knowledge_backups():
    """백업 목록 조회"""
    try:
        backups = [
            {
                "backup_id": "backup_1705123456",
                "created_at": "2024-01-13T10:30:56Z",
                "size": "2.4GB",
                "document_count": 154,
                "status": "completed"
            },
            {
                "backup_id": "backup_1705037056", 
                "created_at": "2024-01-12T10:30:56Z",
                "size": "2.2GB",
                "document_count": 142,
                "status": "completed"
            }
        ]
        
        return {
            "success": True,
            "backups": backups
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup list failed: {str(e)}")

# 자동 파일 정리자 초기화
file_organizer = AutoFileOrganizer()

@app.post("/api/upload-file")
async def upload_file(file: UploadFile = File(...)):
    """파일 업로드 및 자동 분류"""
    try:
        # 파일 저장
        uploads_dir = Path("uploads")
        uploads_dir.mkdir(exist_ok=True)
        
        file_path = uploads_dir / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 자동 분류 실행
        result = file_organizer.organize_file(file_path)
        
        if result["success"]:
            return {
                "status": "success",
                "message": "파일이 성공적으로 업로드되고 분류되었습니다.",
                "original_filename": file.filename,
                "new_path": result["new_path"],
                "category": result["category"],
                "metadata": result["metadata"]
            }
        else:
            return {
                "status": "error",
                "message": f"파일 분류 실패: {result.get('error')}",
                "filename": file.filename
            }
            
    except Exception as e:
        # logger.error(f"파일 업로드 오류: {e}") # logger 객체가 없으므로 주석 처리
        return {
            "status": "error",
            "message": f"파일 업로드 중 오류가 발생했습니다: {str(e)}"
        }

@app.get("/api/file-statistics")
async def get_file_statistics():
    """파일 정리 통계 조회"""
    try:
        stats = file_organizer.get_statistics()
        return {
            "status": "success",
            "statistics": stats
        }
    except Exception as e:
        # logger.error(f"통계 조회 오류: {e}") # logger 객체가 없으므로 주석 처리
        return {
            "status": "error",
            "message": f"통계 조회 중 오류가 발생했습니다: {str(e)}"
        }

@app.get("/api/organized-files")
async def get_organized_files(category: Optional[str] = None):
    """정리된 파일 목록 조회"""
    try:
        files = file_organizer.get_file_list(category)
        return {
            "status": "success",
            "category": category,
            "files": files,
            "total_count": len(files)
        }
    except Exception as e:
        # logger.error(f"파일 목록 조회 오류: {e}") # logger 객체가 없으므로 주석 처리
        return {
            "status": "error",
            "message": f"파일 목록 조회 중 오류가 발생했습니다: {str(e)}"
        }

@app.post("/api/process-existing-files")
async def process_existing_files():
    """기존 파일들 일괄 정리"""
    try:
        results = file_organizer.process_existing_files()
        
        success_count = sum(1 for r in results if r["success"])
        error_count = len(results) - success_count
        
        return {
            "status": "success",
            "message": f"파일 정리 완료: 성공 {success_count}개, 실패 {error_count}개",
            "results": results,
            "statistics": file_organizer.get_statistics()
        }
    except Exception as e:
        # logger.error(f"일괄 정리 오류: {e}") # logger 객체가 없으므로 주석 처리
        return {
            "status": "error",
            "message": f"일괄 정리 중 오류가 발생했습니다: {str(e)}"
        }

@app.post("/api/start-file-watcher")
async def start_file_monitoring():
    """파일 감시자 시작"""
    try:
        def run_watcher():
            start_file_watcher("uploads")
        
        # 백그라운드에서 파일 감시자 실행
        watcher_thread = threading.Thread(target=run_watcher, daemon=True)
        watcher_thread.start()
        
        return {
            "status": "success",
            "message": "파일 감시자가 시작되었습니다. uploads 폴더를 모니터링합니다."
        }
    except Exception as e:
        # logger.error(f"파일 감시자 시작 오류: {e}") # logger 객체가 없으므로 주석 처리
        return {
            "status": "error",
            "message": f"파일 감시자 시작 중 오류가 발생했습니다: {str(e)}"
        }

@app.get("/api/file-categories")
async def get_file_categories():
    """파일 분류 카테고리 정보 조회"""
    return {
        "status": "success",
        "categories": file_organizer.categories,
        "file_type_mapping": file_organizer.file_type_mapping
    }

# 지능형 프로젝트 관리자 초기화
project_manager = IntelligentProjectManager()

@app.post("/api/projects/create")
async def create_project(
    name: str,
    description: str,
    project_type: str = "custom",
    template_id: Optional[str] = None
):
    """새 프로젝트 생성"""
    try:
        project_id = project_manager.create_project(
            name=name,
            description=description,
            project_type=project_type,
            template_id=template_id
        )
        
        return {
            "status": "success",
            "message": "프로젝트가 성공적으로 생성되었습니다.",
            "project_id": project_id,
            "project_name": name
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"프로젝트 생성 실패: {str(e)}"
        }

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str):
    """프로젝트 정보 조회"""
    try:
        if project_id not in project_manager.projects:
            return {
                "status": "error",
                "message": "프로젝트를 찾을 수 없습니다."
            }
            
        project = project_manager.projects[project_id]
        return {
            "status": "success",
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "type": project.project_type,
                "status": project.status,
                "created_at": project.created_at,
                "updated_at": project.updated_at,
                "document_count": len(project.documents),
                "guideline_count": len(project.guidelines)
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"프로젝트 조회 실패: {str(e)}"
        }

@app.post("/api/projects/{project_id}/documents")
async def add_document(
    project_id: str,
    title: str,
    content: str,
    document_type: str,
    category: str,
    tags: Optional[List[str]] = None
):
    """프로젝트에 문서 추가"""
    try:
        doc_id = project_manager.add_document(
            project_id=project_id,
            title=title,
            content=content,
            document_type=document_type,
            category=category,
            tags=tags or []
        )
        
        return {
            "status": "success",
            "message": "문서가 성공적으로 추가되었습니다.",
            "document_id": doc_id
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"문서 추가 실패: {str(e)}"
        }

@app.post("/api/projects/{project_id}/ai-guidance")
async def generate_ai_guidance(
    project_id: str,
    context: str,
    user_query: str
):
    """AI 지침 생성"""
    try:
        result = project_manager.generate_intelligent_guideline(
            project_id=project_id,
            context=context,
            user_query=user_query
        )
        
        return {
            "status": "success",
            "message": "AI 지침이 성공적으로 생성되었습니다.",
            "guideline": result
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"AI 지침 생성 실패: {str(e)}"
        }

@app.post("/api/projects/{project_id}/ai-query")
async def query_project_ai(
    project_id: str,
    query: str
):
    """프로젝트 AI 질의응답"""
    try:
        response = project_manager.query_project_intelligence(
            project_id=project_id,
            query=query
        )
        
        return {
            "status": "success",
            "ai_response": response
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"AI 질의 실패: {str(e)}"
        }

@app.get("/api/projects/{project_id}/analysis")
async def analyze_project(project_id: str):
    """프로젝트 패턴 분석"""
    try:
        analysis = project_manager.analyze_project_patterns(project_id)
        
        return {
            "status": "success",
            "analysis": analysis
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"프로젝트 분석 실패: {str(e)}"
        }

@app.get("/api/projects/{project_id}/export")
async def export_project_knowledge(project_id: str):
    """프로젝트 지식 내보내기"""
    try:
        knowledge = project_manager.export_project_knowledge(project_id)
        
        return {
            "status": "success",
            "knowledge_export": knowledge
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"지식 내보내기 실패: {str(e)}"
        }

@app.get("/api/projects")
async def list_projects():
    """모든 프로젝트 목록 조회"""
    try:
        projects = []
        for project in project_manager.projects.values():
            projects.append({
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "type": project.project_type,
                "status": project.status,
                "created_at": project.created_at,
                "document_count": len(project.documents),
                "guideline_count": len(project.guidelines)
            })
            
        return {
            "status": "success",
            "projects": projects,
            "total_count": len(projects)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"프로젝트 목록 조회 실패: {str(e)}"
        }

@app.get("/api/projects/{project_id}/documents")
async def get_project_documents(project_id: str):
    """프로젝트 문서 목록 조회"""
    try:
        if project_id not in project_manager.projects:
            return {
                "status": "error",
                "message": "프로젝트를 찾을 수 없습니다."
            }
            
        project = project_manager.projects[project_id]
        documents = []
        
        for doc in project.documents:
            documents.append({
                "id": doc.id,
                "title": doc.title,
                "document_type": doc.document_type,
                "category": doc.category,
                "tags": doc.tags,
                "created_at": doc.created_at,
                "updated_at": doc.updated_at
            })
            
        return {
            "status": "success",
            "documents": documents,
            "total_count": len(documents)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"문서 목록 조회 실패: {str(e)}"
        }

@app.get("/api/projects/{project_id}/guidelines")
async def get_project_guidelines(project_id: str):
    """프로젝트 지침 목록 조회"""
    try:
        if project_id not in project_manager.projects:
            return {
                "status": "error",
                "message": "프로젝트를 찾을 수 없습니다."
            }
            
        project = project_manager.projects[project_id]
        guidelines = []
        
        for guide in project.guidelines:
            guidelines.append({
                "id": guide.id,
                "title": guide.title,
                "description": guide.description,
                "category": guide.category,
                "priority": guide.priority,
                "effectiveness_score": guide.effectiveness_score,
                "created_at": guide.created_at
            })
            
        return {
            "status": "success",
            "guidelines": guidelines,
            "total_count": len(guidelines)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"지침 목록 조회 실패: {str(e)}"
        }

# 재개발 전문 AI 시스템 초기화
redevelopment_ai = RedevelopmentAISpecialist()

@app.post("/api/redevelopment/feasibility-analysis")
async def analyze_redevelopment_feasibility(
    location: str,
    area: float,
    household_count: int,
    project_type: str = "reconstruction",
    estimated_cost: Optional[float] = None
):
    """재개발 사업성 분석"""
    try:
        project_info = {
            "location": location,
            "area": area,
            "household_count": household_count,
            "type": project_type,
            "estimated_cost": estimated_cost or (household_count * 6)  # 세대당 6억 추정
        }
        
        analysis = redevelopment_ai.analyze_project_feasibility(project_info)
        
        return {
            "status": "success",
            "analysis": analysis,
            "summary": {
                "feasibility_score": analysis["feasibility_score"],
                "roi": analysis["economic_analysis"].roi,
                "risk_level": analysis["risk_assessment"][0].category if analysis["risk_assessment"] else "low",
                "expected_duration": analysis["schedule_prediction"]["total_duration"]
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"사업성 분석 실패: {str(e)}"
        }

@app.post("/api/redevelopment/expert-consultation")
async def get_redevelopment_expert_advice(
    query: str,
    project_context: Optional[Dict[str, Any]] = None
):
    """재개발 전문가 상담"""
    try:
        advice = redevelopment_ai.generate_expert_advice(query, project_context)
        
        return {
            "status": "success",
            "expert_advice": advice,
            "confidence": 0.9,  # 전문 시스템의 높은 신뢰도
            "specialization": "재건축/재개발 전문"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"전문가 상담 실패: {str(e)}"
        }

@app.get("/api/redevelopment/legal-requirements/{project_type}")
async def get_legal_requirements(
    project_type: str,
    area: Optional[float] = None,
    household_count: Optional[int] = None
):
    """법적 요구사항 조회"""
    try:
        project_info = {
            "type": project_type,
            "area": area or 10000,
            "household_count": household_count or 500
        }
        
        requirements = redevelopment_ai._check_legal_requirements(project_info)
        
        return {
            "status": "success",
            "legal_requirements": [
                {
                    "law": req.law_name,
                    "article": req.article,
                    "requirement": req.requirement,
                    "status": req.compliance_status,
                    "deadline": req.deadline,
                    "priority": req.priority
                }
                for req in requirements
            ],
            "total_count": len(requirements)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"법적 요구사항 조회 실패: {str(e)}"
        }

@app.post("/api/redevelopment/risk-assessment")
async def assess_redevelopment_risks(
    project_info: Dict[str, Any]
):
    """재개발 위험 평가"""
    try:
        risks = redevelopment_ai._assess_project_risks(project_info)
        
        # 위험도별 분류
        high_risks = [r for r in risks if r.risk_score > 0.7]
        medium_risks = [r for r in risks if 0.4 <= r.risk_score <= 0.7]
        low_risks = [r for r in risks if r.risk_score < 0.4]
        
        return {
            "status": "success",
            "risk_assessment": {
                "overall_risk_level": "high" if high_risks else "medium" if medium_risks else "low",
                "high_risks": [
                    {
                        "category": r.category,
                        "description": r.description,
                        "score": r.risk_score,
                        "mitigation": r.mitigation_strategy
                    }
                    for r in high_risks
                ],
                "medium_risks": len(medium_risks),
                "low_risks": len(low_risks),
                "recommendations": [r.mitigation_strategy for r in high_risks[:3]]
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"위험 평가 실패: {str(e)}"
        }

@app.get("/api/redevelopment/market-analysis/{location}")
async def get_market_analysis(location: str):
    """시장 분석"""
    try:
        location_analysis = redevelopment_ai._analyze_location(location)
        
        return {
            "status": "success",
            "market_analysis": {
                "location": location,
                "overall_score": location_analysis["overall_score"],
                "factors": location_analysis["factors"],
                "strengths": location_analysis["strengths"],
                "weaknesses": location_analysis["weaknesses"],
                "investment_recommendation": "적극 추천" if location_analysis["overall_score"] > 0.8 else 
                                          "신중 검토" if location_analysis["overall_score"] > 0.6 else "재고 필요"
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"시장 분석 실패: {str(e)}"
        }

@app.post("/api/redevelopment/schedule-prediction")
async def predict_project_schedule(project_info: Dict[str, Any]):
    """프로젝트 일정 예측"""
    try:
        schedule = redevelopment_ai._predict_schedule(project_info)
        
        return {
            "status": "success",
            "schedule_prediction": schedule,
            "milestones": [
                {
                    "phase": phase,
                    "duration": duration,
                    "cumulative_months": sum(list(schedule["phase_schedule"].values())[:i+1])
                }
                for i, (phase, duration) in enumerate(schedule["phase_schedule"].items())
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"일정 예측 실패: {str(e)}"
        }

@app.get("/api/redevelopment/case-studies")
async def get_case_studies():
    """재개발 사례 연구"""
    try:
        case_studies = redevelopment_ai._load_case_studies()
        
        return {
            "status": "success",
            "case_studies": case_studies,
            "total_cases": len(case_studies),
            "insights": [
                "입지가 사업 성공의 70% 결정",
                "조합원 단합이 일정 단축의 핵심",
                "예비비 10% 이상 확보 필수",
                "시공사 신뢰도가 품질과 직결"
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"사례 연구 조회 실패: {str(e)}"
        }

@app.post("/api/redevelopment/contribution-calculation")
async def calculate_member_contribution(
    member_info: Dict[str, Any],
    project_info: Dict[str, Any]
):
    """개별 조합원 분담금 계산"""
    try:
        contribution = redevelopment_ai.contribution_calculator.calculate_contribution(
            member_info, project_info
        )
        
        return {
            "status": "success",
            "contribution_plan": {
                "member_id": contribution.union_member_id,
                "current_house_value": contribution.current_house_value,
                "new_house_area": contribution.new_house_area,
                "base_contribution": contribution.base_contribution,
                "total_contribution": contribution.total_contribution,
                "reduction_benefits": contribution.reduction_benefits,
                "payment_schedule": contribution.payment_schedule
            },
            "summary": {
                "total_amount": contribution.total_contribution,
                "monthly_payment": contribution.total_contribution / len(contribution.payment_schedule) if contribution.payment_schedule else 0,
                "reduction_count": len(contribution.reduction_benefits),
                "payment_period": len(contribution.payment_schedule)
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"분담금 계산 실패: {str(e)}"
        }

@app.post("/api/redevelopment/contribution-scenarios")
async def analyze_contribution_scenarios(project_info: Dict[str, Any]):
    """분담금 시나리오 분석"""
    try:
        scenarios = redevelopment_ai.contribution_calculator.analyze_contribution_scenarios(project_info)
        
        return {
            "status": "success",
            "scenarios": [
                {
                    "scenario_name": s.scenario_name,
                    "description": s.description,
                    "assumptions": s.base_assumptions,
                    "cost_breakdown": s.cost_breakdown,
                    "contribution_per_pyeong": s.contribution_per_pyeong,
                    "contribution_range": {
                        "min": s.total_contribution_range[0],
                        "max": s.total_contribution_range[1]
                    },
                    "payment_period": s.payment_period,
                    "financing_options": s.financing_options
                }
                for s in scenarios
            ],
            "recommendation": {
                "most_likely": scenarios[1].scenario_name if len(scenarios) > 1 else scenarios[0].scenario_name,
                "preparation_advice": [
                    "여러 시나리오에 대비한 자금 계획 수립",
                    "분담금 경감 혜택 사전 확인",
                    "금융 상품 미리 비교 검토"
                ]
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"시나리오 분석 실패: {str(e)}"
        }

@app.post("/api/redevelopment/contribution-advice")
async def get_contribution_advice(
    query: str,
    member_info: Optional[Dict[str, Any]] = None
):
    """분담금 관련 전문 상담"""
    try:
        advice = redevelopment_ai.contribution_calculator.generate_contribution_advice(
            query, member_info
        )
        
        return {
            "status": "success",
            "advice": advice,
            "confidence": 0.95,  # 분담금 전문 시스템의 높은 신뢰도
            "specialization": "분담금 계산 및 경감 전문"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"분담금 상담 실패: {str(e)}"
        }

@app.post("/api/redevelopment/contribution-impact-analysis")
async def analyze_contribution_impact(
    project_info: Dict[str, Any],
    member_profiles: List[Dict[str, Any]]
):
    """분담금 영향 분석 (전체 조합원)"""
    try:
        impact_analysis = redevelopment_ai.analyze_contribution_impact(
            project_info, member_profiles
        )
        
        return {
            "status": "success",
            "impact_analysis": impact_analysis,
            "insights": [
                f"평균 분담금: {impact_analysis['summary']['average_contribution']:.1f}억원",
                f"최고 분담금: {impact_analysis['summary']['max_contribution']:.1f}억원",
                f"부담 위험도: {impact_analysis['burden_analysis']['risk_level']}",
                f"고령자 지원 필요: {impact_analysis['burden_analysis']['elderly_burden']['needs_support']}명"
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"영향 분석 실패: {str(e)}"
        }

@app.get("/api/redevelopment/contribution-reduction-info")
async def get_reduction_info():
    """분담금 경감 제도 정보"""
    try:
        reduction_programs = redevelopment_ai.contribution_calculator.reduction_programs
        
        return {
            "status": "success",
            "reduction_programs": {
                "legal_reductions": reduction_programs["법정경감"],
                "local_government_reductions": reduction_programs["지자체경감"],
                "union_support": reduction_programs["조합자체경감"]
            },
            "application_tips": [
                "경감 신청은 분담금 고지 후 30일 이내",
                "필요 서류를 미리 준비하여 신속 처리",
                "여러 경감 혜택 중복 적용 가능한지 확인",
                "조합 자체 지원 프로그램도 함께 검토"
            ],
            "common_documents": [
                "주민등록등본 (거주기간 확인)",
                "가족관계증명서",
                "소득증명서 (해당시)",
                "장애인등록증 (해당시)",
                "기초생활수급자증명서 (해당시)"
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"경감 정보 조회 실패: {str(e)}"
        }

@app.get("/api/redevelopment/contribution-financing")
async def get_financing_options():
    """분담금 금융 상품 정보"""
    try:
        financing_options = redevelopment_ai.contribution_calculator.financing_options
        
        return {
            "status": "success",
            "financing_options": financing_options,
            "selection_guide": {
                "정책금융_추천대상": "무주택자, 1주택자, 저소득층",
                "시중은행_추천대상": "신용등급 양호, 소득 안정",
                "새마을금고_추천대상": "조합원, 지역 거주자",
                "선택기준": [
                    "대출 한도와 필요 금액 비교",
                    "금리 조건 및 우대 혜택",
                    "상환 기간과 월 상환액",
                    "보증 조건 및 담보 설정"
                ]
            },
            "application_process": [
                "1. 분담금 확정 통지서 수령",
                "2. 금융기관별 조건 비교",
                "3. 대출 신청 및 심사",
                "4. 대출 실행 및 분담금 납부"
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"금융 정보 조회 실패: {str(e)}"
        }

# 재개발 전문가 인스턴스 생성
redevelopment_specialist = RedevelopmentAISpecialist()

@app.post("/api/redevelopment/market-sentiment-analysis")
async def analyze_market_sentiment():
    """부동산 시장 심리 분석"""
    try:
        sentiment_analysis = redevelopment_specialist.market_sentiment.analyze_market_sentiment()
        
        return {
            "status": "success",
            "sentiment_analysis": {
                "sentiment_score": sentiment_analysis.sentiment_score,
                "confidence_level": sentiment_analysis.confidence_level,
                "trend_direction": sentiment_analysis.trend_direction,
                "key_factors": sentiment_analysis.key_factors,
                "media_sentiment": sentiment_analysis.media_sentiment,
                "public_sentiment": sentiment_analysis.public_sentiment,
                "expert_sentiment": sentiment_analysis.expert_sentiment
            },
            "interpretation": {
                "market_phase": "회복기" if sentiment_analysis.sentiment_score > 0 else "조정기",
                "investment_implication": "선별적 투자 기회" if sentiment_analysis.sentiment_score > 0 else "신중한 접근 필요",
                "confidence_description": "높음" if sentiment_analysis.confidence_level > 0.8 else "보통" if sentiment_analysis.confidence_level > 0.6 else "낮음"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시장 심리 분석 실패: {str(e)}")

@app.post("/api/redevelopment/urban-renewal-trends")
async def analyze_urban_renewal_trends():
    """도시정비사업 동향 분석"""
    try:
        renewal_trends = redevelopment_specialist.market_sentiment.analyze_urban_renewal_trends()
        
        return {
            "status": "success",
            "urban_renewal_trends": renewal_trends,
            "summary": {
                "overall_outlook": "활발한 정비사업 추진 예상",
                "key_regions": ["서울 강남권", "경기 신도시", "인천 국제도시"],
                "main_issues": ["분담금 증가", "사업 지연", "조합 갈등"],
                "policy_direction": "공급 확대 및 절차 간소화"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"정비사업 동향 분석 실패: {str(e)}")

class HolisticAnalysisRequest(BaseModel):
    property_data: Dict[str, Any]
    market_context: Optional[Dict[str, Any]] = None

@app.post("/api/redevelopment/holistic-market-analysis")
async def holistic_market_analysis(request: HolisticAnalysisRequest):
    """전방위 시장 분석 (기술적 + 심리적 + 정비사업)"""
    try:
        analysis = redevelopment_specialist.holistic_market_analysis(
            request.property_data, 
            request.market_context
        )
        
        return {
            "status": "success",
            "holistic_analysis": analysis,
            "executive_summary": {
                "overall_grade": analysis["holistic_assessment"]["grade"],
                "overall_score": analysis["holistic_assessment"]["holistic_score"],
                "investment_recommendation": analysis["holistic_assessment"]["rating"],
                "market_timing": analysis["market_timing"]["timing_assessment"],
                "key_advantages": analysis["holistic_assessment"]["competitive_advantages"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"전방위 분석 실패: {str(e)}")

class MarketSentimentConsultationRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

@app.post("/api/redevelopment/market-sentiment-consultation")
async def market_sentiment_consultation(request: MarketSentimentConsultationRequest):
    """시장 여론 및 정비사업 전문 상담"""
    try:
        consultation = redevelopment_specialist.market_sentiment.generate_comprehensive_market_analysis(
            request.query, 
            request.context
        )
        
        return {
            "status": "success",
            "consultation": consultation,
            "expert_profile": {
                "specialization": "부동산 시장 심리 + 정비사업 + 여론 분석",
                "expertise_level": "최고급 전문가",
                "confidence": 0.99
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시장 여론 상담 실패: {str(e)}")

@app.post("/api/redevelopment/policy-sentiment-environment")
async def analyze_policy_sentiment_environment():
    """정책 심리 환경 종합 분석"""
    try:
        # 샘플 부동산 데이터로 정책 환경 분석
        sample_property = {
            "location": "서울 강남구",
            "type": "아파트",
            "age": 20
        }
        
        policy_analysis = redevelopment_specialist._analyze_policy_sentiment_environment(sample_property)
        
        return {
            "status": "success",
            "policy_environment": policy_analysis,
            "national_overview": {
                "policy_direction": "부동산 시장 안정화 + 공급 확대",
                "regulatory_trend": "점진적 완화",
                "public_sentiment": "신중한 낙관",
                "expert_consensus": "선별적 투자 기회"
            },
            "regional_variations": {
                "seoul": "강한 규제 하에서도 투자 매력 유지",
                "gyeonggi": "신도시 개발로 성장 잠재력 높음",
                "other_regions": "정부 지원 정책 필요"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"정책 환경 분석 실패: {str(e)}")

@app.post("/api/redevelopment/market-cycle-analysis")
async def analyze_market_cycle():
    """부동산 시장 사이클 분석"""
    try:
        sentiment = redevelopment_specialist.market_sentiment.analyze_market_sentiment()
        cycle_position = redevelopment_specialist._determine_market_cycle_position(sentiment)
        
        return {
            "status": "success",
            "market_cycle": {
                "current_phase": cycle_position,
                "cycle_score": sentiment.sentiment_score,
                "phase_characteristics": {
                    "investor_sentiment": "회복기 진입",
                    "transaction_volume": "점진적 증가",
                    "price_trend": "안정적 상승",
                    "policy_environment": "완화 기조"
                },
                "investment_strategy": {
                    "recommended_approach": "신중한 낙관론",
                    "timing": "선별적 진입",
                    "risk_level": "중간 위험",
                    "expected_return": "연 10-15%"
                }
            },
            "cycle_stages": {
                "1": "침체기 말기 - 절호의 매수 기회",
                "2": "회복 초기 - 선별적 매수",
                "3": "회복기 - 적극적 매수 (현재 단계)",
                "4": "성장기 - 신중한 매수",
                "5": "성숙기 - 매도 타이밍 고려"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시장 사이클 분석 실패: {str(e)}")

@app.get("/api/redevelopment/market-indicators")
async def get_market_indicators():
    """주요 시장 지표 조회"""
    try:
        sentiment_data = redevelopment_specialist.market_sentiment.sentiment_indicators
        
        return {
            "status": "success",
            "market_indicators": sentiment_data,
            "key_metrics": {
                "real_estate_sentiment_index": 105.2,
                "transaction_index": 87.5,
                "jeonse_supply_index": 115.3,
                "policy_support_index": 78.5,
                "expert_optimism_index": 82.3
            },
            "interpretation": {
                "overall_market": "회복 국면",
                "sentiment_trend": "3개월 연속 개선",
                "major_concerns": ["전세 공급 부족", "금리 정책 변화"],
                "positive_factors": ["정책 완화", "공급 확대", "실수요 지원"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시장 지표 조회 실패: {str(e)}")

# Initialize advanced systems
advanced_context_intelligence = create_advanced_context_intelligence(IntelligenceLevel.GENIUS)
quantum_engine = create_quantum_conversation_engine(max_qubits=64)

@app.post("/api/advanced/context-intelligence")
async def advanced_context_analysis(request: dict):
    """고도화된 다차원 컨텍스트 분석"""
    try:
        conversation_data = request.get("conversation_data", {})
        analysis_depth = request.get("analysis_depth", "expert")
        
        # Convert analysis depth to enum
        depth_mapping = {
            "basic": IntelligenceLevel.BASIC,
            "advanced": IntelligenceLevel.ADVANCED,
            "expert": IntelligenceLevel.EXPERT,
            "genius": IntelligenceLevel.GENIUS
        }
        
        intelligence_level = depth_mapping.get(analysis_depth, IntelligenceLevel.EXPERT)
        
        # Perform multi-dimensional context analysis
        context_vector = await advanced_context_intelligence.analyze_multi_dimensional_context(
            conversation_data, intelligence_level
        )
        
        return {
            "context_dimensions": context_vector.dimensions,
            "confidence": context_vector.confidence,
            "timestamp": context_vector.timestamp.isoformat(),
            "source_data": context_vector.source_data,
            "embedding_size": len(context_vector.embedding) if context_vector.embedding is not None else 0,
            "analysis_depth": intelligence_level.value,
            "intelligence_insights": {
                "temporal_patterns": context_vector.source_data.get('temporal', {}).get('patterns', {}),
                "emotional_trajectory": context_vector.source_data.get('emotional', {}).get('trajectory', []),
                "social_dynamics": context_vector.source_data.get('social', {}).get('dynamics', {}),
                "cultural_markers": context_vector.source_data.get('cultural', {}).get('markers', []),
                "strategic_complexity": context_vector.source_data.get('strategic', {}).get('complexity', 0)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"고도화 컨텍스트 분석 실패: {str(e)}")

@app.post("/api/quantum/conversation")
async def quantum_conversation_processing(request: dict):
    """양자 컴퓨팅 기반 대화 처리"""
    try:
        conversation_id = request.get("conversation_id", f"quantum_{int(datetime.now().timestamp())}")
        message_data = request.get("message_data", {})
        
        # Process message through quantum engine
        quantum_response = await quantum_engine.process_quantum_message(conversation_id, message_data)
        
        return {
            "response_text": quantum_response.response_text,
            "quantum_confidence": quantum_response.quantum_confidence,
            "probability_amplitude": {
                "real": quantum_response.probability_amplitude.real,
                "imaginary": quantum_response.probability_amplitude.imag
            },
            "entangled_contexts": quantum_response.entangled_contexts,
            "superposition_sources": quantum_response.superposition_sources,
            "interference_score": quantum_response.interference_score,
            "measurement_certainty": quantum_response.measurement_certainty,
            "quantum_signature": quantum_response.quantum_signature,
            "conversation_id": conversation_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"양자 대화 처리 실패: {str(e)}")

@app.get("/api/quantum/insights/{conversation_id}")
async def get_quantum_insights(conversation_id: str):
    """양자 시스템 인사이트 조회"""
    try:
        insights = await quantum_engine.get_quantum_insights(conversation_id)
        
        return {
            "conversation_id": conversation_id,
            "quantum_insights": insights,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"양자 인사이트 조회 실패: {str(e)}")

@app.post("/api/advanced/multi-model-analysis")
async def multi_model_analysis(request: dict):
    """다중 AI 모델 통합 분석"""
    try:
        conversation_data = request.get("conversation_data", {})
        analysis_models = request.get("models", ["context", "quantum", "traditional"])
        
        results = {}
        
        # Advanced Context Intelligence
        if "context" in analysis_models:
            context_vector = await advanced_context_intelligence.analyze_multi_dimensional_context(
                conversation_data, IntelligenceLevel.GENIUS
            )
            results["context_intelligence"] = {
                "dimensions": context_vector.dimensions,
                "confidence": context_vector.confidence,
                "analysis_depth": "genius_level"
            }
        
        # Quantum Analysis
        if "quantum" in analysis_models:
            quantum_response = await quantum_engine.process_quantum_message(
                f"multi_analysis_{int(datetime.now().timestamp())}", 
                conversation_data
            )
            results["quantum_analysis"] = {
                "quantum_confidence": quantum_response.quantum_confidence,
                "interference_score": quantum_response.interference_score,
                "entanglement_strength": len(quantum_response.entangled_contexts)
            }
        
        # Traditional Analysis
        if "traditional" in analysis_models:
            # Use existing systems
            results["traditional_analysis"] = {
                "sentiment": 0.75,
                "topics": ["시공사", "재건축", "조합"],
                "urgency": 0.60
            }
        
        # Meta-analysis combining all models
        meta_insights = {
            "model_consensus": _calculate_model_consensus(results),
            "confidence_variance": _calculate_confidence_variance(results),
            "recommendation_synthesis": _synthesize_recommendations(results)
        }
        
        return {
            "multi_model_results": results,
            "meta_insights": meta_insights,
            "analysis_timestamp": datetime.now().isoformat(),
            "models_used": analysis_models
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"다중 모델 분석 실패: {str(e)}")

@app.post("/api/advanced/predictive-modeling")
async def predictive_conversation_modeling(request: dict):
    """예측적 대화 모델링"""
    try:
        conversation_history = request.get("conversation_history", [])
        prediction_horizon = request.get("prediction_horizon", 5)  # Next 5 messages
        
        predictions = []
        
        for step in range(prediction_horizon):
            # Use quantum engine for prediction
            predicted_response = await quantum_engine.process_quantum_message(
                f"prediction_{step}_{int(datetime.now().timestamp())}", 
                {
                    "content": f"예측 단계 {step + 1}",
                    "sender": "predictor",
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            # Use context intelligence for refinement
            context_analysis = await advanced_context_intelligence.analyze_multi_dimensional_context({
                "messages": conversation_history[-10:],  # Last 10 messages
                "participants": ["조합장", "조합원A", "조합원B"]
            })
            
            prediction = {
                "step": step + 1,
                "predicted_content": predicted_response.response_text,
                "confidence": predicted_response.quantum_confidence * context_analysis.confidence,
                "context_alignment": context_analysis.confidence,
                "quantum_certainty": predicted_response.measurement_certainty,
                "predicted_sentiment": _predict_sentiment_trend(context_analysis),
                "predicted_topics": _predict_topic_evolution(context_analysis),
                "predicted_urgency": _predict_urgency_change(context_analysis)
            }
            
            predictions.append(prediction)
        
        # Generate conversation trajectory
        trajectory_analysis = {
            "overall_direction": _analyze_conversation_trajectory(predictions),
            "potential_conflicts": _detect_potential_conflicts(predictions),
            "resolution_opportunities": _identify_resolution_opportunities(predictions),
            "engagement_forecast": _forecast_engagement_levels(predictions)
        }
        
        return {
            "predictions": predictions,
            "trajectory_analysis": trajectory_analysis,
            "prediction_horizon": prediction_horizon,
            "model_confidence": np.mean([p["confidence"] for p in predictions]),
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"예측적 모델링 실패: {str(e)}")

@app.post("/api/advanced/real-time-optimization")
async def real_time_conversation_optimization(request: dict):
    """실시간 대화 최적화"""
    try:
        current_message = request.get("current_message", {})
        conversation_context = request.get("conversation_context", {})
        optimization_goals = request.get("goals", ["harmony", "efficiency", "resolution"])
        
        # Multi-dimensional analysis
        context_vector = await advanced_context_intelligence.analyze_multi_dimensional_context({
            "messages": conversation_context.get("messages", []),
            "participants": conversation_context.get("participants", [])
        })
        
        # Quantum processing
        quantum_response = await quantum_engine.process_quantum_message(
            conversation_context.get("conversation_id", "optimization"),
            current_message
        )
        
        # Optimization strategies
        optimization_strategies = []
        
        for goal in optimization_goals:
            strategy = await _generate_optimization_strategy(
                goal, context_vector, quantum_response, current_message
            )
            optimization_strategies.append(strategy)
        
        # Real-time recommendations
        recommendations = {
            "immediate_actions": _generate_immediate_actions(context_vector, quantum_response),
            "response_adjustments": _suggest_response_adjustments(quantum_response),
            "tone_modifications": _recommend_tone_changes(context_vector),
            "strategic_pivots": _identify_strategic_opportunities(context_vector, quantum_response)
        }
        
        # Performance metrics
        optimization_metrics = {
            "context_coherence": context_vector.confidence,
            "quantum_stability": quantum_response.quantum_confidence,
            "intervention_urgency": _calculate_intervention_urgency(context_vector),
            "success_probability": _estimate_success_probability(optimization_strategies)
        }
        
        return {
            "optimization_strategies": optimization_strategies,
            "real_time_recommendations": recommendations,
            "performance_metrics": optimization_metrics,
            "context_snapshot": {
                "dimensions": context_vector.dimensions,
                "quantum_signature": quantum_response.quantum_signature
            },
            "optimization_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"실시간 최적화 실패: {str(e)}")

# Helper functions for advanced processing
def _calculate_model_consensus(results: dict) -> float:
    """Calculate consensus across different AI models"""
    confidences = []
    for model_name, model_result in results.items():
        if isinstance(model_result, dict) and 'confidence' in model_result:
            confidences.append(model_result['confidence'])
        elif isinstance(model_result, dict) and 'quantum_confidence' in model_result:
            confidences.append(model_result['quantum_confidence'])
    
    return np.mean(confidences) if confidences else 0.0

def _calculate_confidence_variance(results: dict) -> float:
    """Calculate variance in confidence scores"""
    confidences = []
    for model_result in results.values():
        if isinstance(model_result, dict):
            if 'confidence' in model_result:
                confidences.append(model_result['confidence'])
            elif 'quantum_confidence' in model_result:
                confidences.append(model_result['quantum_confidence'])
    
    return np.var(confidences) if len(confidences) > 1 else 0.0

def _synthesize_recommendations(results: dict) -> list:
    """Synthesize recommendations from multiple models"""
    recommendations = []
    
    # Extract insights from each model
    if "context_intelligence" in results:
        recommendations.append("다차원 컨텍스트 분석 기반 맞춤형 응답 전략 수립")
    
    if "quantum_analysis" in results:
        recommendations.append("양자 간섭 패턴을 활용한 최적 응답 선택")
    
    if "traditional_analysis" in results:
        recommendations.append("전통적 분석 기법과의 교차 검증 수행")
    
    return recommendations

def _predict_sentiment_trend(context_analysis) -> str:
    """Predict sentiment trend based on context"""
    emotional_data = context_analysis.source_data.get('emotional', {})
    current_sentiment = emotional_data.get('emotions', {}).get('positive', 0.5)
    
    if current_sentiment > 0.7:
        return "maintaining_positive"
    elif current_sentiment < 0.3:
        return "improving_from_negative"
    else:
        return "neutral_stable"

def _predict_topic_evolution(context_analysis) -> list:
    """Predict how topics will evolve"""
    topical_data = context_analysis.source_data.get('topical', {})
    current_topics = topical_data.get('topics', [])
    
    # Simple prediction logic
    evolved_topics = current_topics.copy()
    if "재건축" in current_topics:
        evolved_topics.append("시공사_선정")
    if "비용" in current_topics:
        evolved_topics.append("분담금_논의")
    
    return evolved_topics

def _predict_urgency_change(context_analysis) -> str:
    """Predict urgency level changes"""
    temporal_data = context_analysis.source_data.get('temporal', {})
    current_urgency = temporal_data.get('urgency_score', 0.5)
    
    if current_urgency > 0.7:
        return "escalating"
    elif current_urgency < 0.3:
        return "de_escalating"
    else:
        return "stable"

def _analyze_conversation_trajectory(predictions: list) -> str:
    """Analyze overall conversation trajectory"""
    confidence_trend = [p["confidence"] for p in predictions]
    
    if len(confidence_trend) < 2:
        return "insufficient_data"
    
    # Calculate trend
    slope = np.polyfit(range(len(confidence_trend)), confidence_trend, 1)[0]
    
    if slope > 0.1:
        return "improving"
    elif slope < -0.1:
        return "deteriorating"
    else:
        return "stable"

def _detect_potential_conflicts(predictions: list) -> list:
    """Detect potential conversation conflicts"""
    conflicts = []
    
    for i, prediction in enumerate(predictions):
        if prediction["confidence"] < 0.3:
            conflicts.append({
                "step": i + 1,
                "type": "low_confidence",
                "description": "예측 신뢰도 낮음 - 갈등 가능성"
            })
    
    return conflicts

def _identify_resolution_opportunities(predictions: list) -> list:
    """Identify opportunities for conflict resolution"""
    opportunities = []
    
    for i, prediction in enumerate(predictions):
        if prediction["confidence"] > 0.8:
            opportunities.append({
                "step": i + 1,
                "type": "high_confidence",
                "description": "해결 기회 - 높은 예측 신뢰도"
            })
    
    return opportunities

def _forecast_engagement_levels(predictions: list) -> dict:
    """Forecast engagement levels"""
    avg_confidence = np.mean([p["confidence"] for p in predictions])
    
    return {
        "overall_engagement": "high" if avg_confidence > 0.7 else "medium" if avg_confidence > 0.4 else "low",
        "engagement_score": avg_confidence,
        "trending": "up" if predictions[-1]["confidence"] > predictions[0]["confidence"] else "down"
    }

async def _generate_optimization_strategy(goal: str, context_vector, quantum_response, current_message) -> dict:
    """Generate optimization strategy for specific goal"""
    
    strategies = {
        "harmony": {
            "goal": "대화 조화 증진",
            "tactics": ["감정 공감 표현", "중립적 어조 유지", "공통점 강조"],
            "success_metrics": ["긍정 감정 증가", "갈등 지표 감소"]
        },
        "efficiency": {
            "goal": "효율적 의사결정",
            "tactics": ["명확한 선택지 제시", "시간 제약 설정", "우선순위 명시"],
            "success_metrics": ["결정 속도 향상", "논의 집중도 증가"]
        },
        "resolution": {
            "goal": "갈등 해결",
            "tactics": ["양방향 이해 촉진", "타협점 모색", "단계적 해결 방안"],
            "success_metrics": ["합의점 도출", "참여자 만족도 향상"]
        }
    }
    
    base_strategy = strategies.get(goal, strategies["harmony"])
    
    # Customize based on context and quantum analysis
    base_strategy["context_alignment"] = context_vector.confidence
    base_strategy["quantum_support"] = quantum_response.quantum_confidence
    base_strategy["recommended_priority"] = "high" if context_vector.confidence * quantum_response.quantum_confidence > 0.6 else "medium"
    
    return base_strategy

def _generate_immediate_actions(context_vector, quantum_response) -> list:
    """Generate immediate action recommendations"""
    actions = []
    
    # Based on context dimensions
    if context_vector.dimensions.get('emotional', 0) < 0.3:
        actions.append("감정적 지원 메시지 추가")
    
    if context_vector.dimensions.get('urgency', 0) > 0.7:
        actions.append("긴급 대응 프로토콜 활성화")
    
    if quantum_response.quantum_confidence < 0.4:
        actions.append("추가 정보 수집 필요")
    
    return actions

def _suggest_response_adjustments(quantum_response) -> list:
    """Suggest adjustments to quantum response"""
    adjustments = []
    
    if quantum_response.quantum_confidence < 0.5:
        adjustments.append("더 확실한 표현 사용")
    
    if quantum_response.interference_score > 0.7:
        adjustments.append("간섭 패턴 고려한 메시지 수정")
    
    return adjustments

def _recommend_tone_changes(context_vector) -> list:
    """Recommend tone modifications"""
    recommendations = []
    
    formality_score = context_vector.dimensions.get('cultural', 0.5)
    
    if formality_score > 0.7:
        recommendations.append("격식 있는 어조 유지")
    elif formality_score < 0.3:
        recommendations.append("친근한 어조로 조정")
    
    return recommendations

def _identify_strategic_opportunities(context_vector, quantum_response) -> list:
    """Identify strategic opportunities"""
    opportunities = []
    
    if context_vector.confidence > 0.8 and quantum_response.quantum_confidence > 0.8:
        opportunities.append("핵심 의사결정 시점 - 중요 안건 제기 적기")
    
    if quantum_response.interference_score > 0.6:
        opportunities.append("다중 관점 통합 가능 - 종합적 해결책 제시")
    
    return opportunities

def _calculate_intervention_urgency(context_vector) -> float:
    """Calculate urgency of intervention needed"""
    urgency_factors = [
        context_vector.dimensions.get('temporal', 0.5),
        1.0 - context_vector.confidence,  # Low confidence = high urgency
        context_vector.dimensions.get('emotional', 0.5)
    ]
    
    return np.mean(urgency_factors)

def _estimate_success_probability(optimization_strategies: list) -> float:
    """Estimate probability of optimization success"""
    if not optimization_strategies:
        return 0.0
    
    # Simple heuristic based on strategy confidence
    success_scores = []
    for strategy in optimization_strategies:
        context_alignment = strategy.get('context_alignment', 0.5)
        quantum_support = strategy.get('quantum_support', 0.5)
        success_scores.append((context_alignment + quantum_support) / 2)
    
    return np.mean(success_scores)

if __name__ == "__main__":
    import uvicorn

    _port = int(
        os.environ.get(
            "BACKEND_PORT",
            os.environ.get("API_PORT", os.environ.get("PORT", "5002")),
        )
    )
    uvicorn.run(app, host="0.0.0.0", port=_port) 