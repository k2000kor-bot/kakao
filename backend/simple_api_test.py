#!/usr/bin/env python3
"""
간단한 테스트용 API 서버
Ultimate AI Message System 통합 테스트
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import json
import random
from datetime import datetime

# FastAPI 앱 생성
app = FastAPI(title="Ultimate AI Message System API", version="2.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 모델
class MessageGenerationRequest(BaseModel):
    purpose: str
    formats: List[str] = []
    generationType: str = "batch"
    useAdvancedLearning: bool = False
    context: Optional[Dict[str, Any]] = {}

class FeedbackRequest(BaseModel):
    messageId: str
    feedback: str  # positive, negative, neutral
    chatRoom: str = "general"
    context: Optional[Dict[str, Any]] = {}

# 응답 데이터 생성 함수들
def generate_sample_messages(count: int = 4, purpose: str = "일반 안내"):
    """샘플 메시지 생성"""
    message_templates = [
        f"안녕하세요! {purpose}에 대해 안내드립니다. 자세한 내용은 문의해주세요.",
        f"{purpose} 관련하여 중요한 공지사항이 있어 연락드립니다.",
        f"안녕하세요. {purpose}에 대한 업데이트 내용을 공유드립니다.",
        f"{purpose}와 관련된 추가 정보가 필요하시면 언제든 말씀해주세요."
    ]
    
    return [
        {
            "id": f"msg_{i+1}_{int(datetime.now().timestamp())}",
            "content": random.choice(message_templates),
            "confidence": round(random.uniform(0.7, 0.95), 3),
            "tone": random.choice(["professional", "friendly", "informative"]),
            "emotion_score": {
                "positive": round(random.uniform(0.6, 0.9), 2),
                "neutral": round(random.uniform(0.1, 0.3), 2),
                "concern": round(random.uniform(0.0, 0.2), 2)
            }
        }
        for i in range(count)
    ]

def generate_ai_stats():
    """AI 성능 통계 생성"""
    return {
        "total_generated": random.randint(150, 300),
        "success_rate": round(random.uniform(85, 95), 1),
        "avg_confidence": round(random.uniform(0.8, 0.9), 3),
        "improved_patterns": random.randint(5, 15),
        "last_update": datetime.now().isoformat()
    }

def generate_learning_status():
    """학습 상태 생성"""
    return {
        "progress": random.randint(65, 95),
        "status": "active",
        "patterns_learned": random.randint(25, 50),
        "confidence_improvement": round(random.uniform(5, 15), 1),
        "recent_patterns": [
            "환급금 문의 응답 패턴",
            "총회 공지 스타일",
            "시공사 관련 설명 방식"
        ]
    }

# API 엔드포인트들

@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0",
        "services": {
            "api": "running",
            "ai_models": "ready",
            "database": "connected",
            "websocket": "active"
        }
    }

@app.post("/api/v8/generate")
async def generate_messages(request: MessageGenerationRequest):
    """기본 메시지 생성"""
    try:
        count = 4 if request.generationType == "batch" else 1
        messages = generate_sample_messages(count, request.purpose)
        
        return {
            "success": True,
            "messages": messages,
            "generation_type": request.generationType,
            "model_used": "gpt-4",
            "processing_time": round(random.uniform(0.5, 1.2), 2),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v8/advanced-generate")
async def advanced_generate_messages(request: MessageGenerationRequest):
    """고급 AI 앙상블 메시지 생성"""
    try:
        messages = generate_sample_messages(4, request.purpose)
        
        # 앙상블 모델 정보 추가
        for msg in messages:
            msg["ensemble_info"] = {
                "models_used": ["gpt-4", "claude-3", "gemini-pro"],
                "primary_model": random.choice(["gpt-4", "claude-3"]),
                "consensus_score": round(random.uniform(0.8, 0.95), 3)
            }
        
        return {
            "success": True,
            "messages": messages,
            "generation_type": "ultra_advanced",
            "ensemble_models": ["gpt-4", "claude-3", "gemini-pro"],
            "processing_time": round(random.uniform(0.6, 0.9), 2),
            "quality_metrics": {
                "relevance": round(random.uniform(0.85, 0.95), 3),
                "coherence": round(random.uniform(0.90, 0.99), 3),
                "tone_match": round(random.uniform(0.80, 0.90), 3)
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v8/feedback")
async def process_feedback(request: FeedbackRequest):
    """사용자 피드백 처리"""
    try:
        # 학습 업데이트 시뮬레이션
        learning_update = {
            "feedback_processed": True,
            "feedback_type": request.feedback,
            "learning_adjustment": round(random.uniform(0.1, 0.3), 3),
            "pattern_strength": "increased" if request.feedback == "positive" else "adjusted"
        }
        
        return {
            "success": True,
            "feedback_id": f"fb_{int(datetime.now().timestamp())}",
            "learning_update": learning_update,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v8/learning-status/{chat_room_id}")
async def get_learning_status(chat_room_id: str):
    """대화방별 학습 상태 조회"""
    return {
        "success": True,
        "chat_room_id": chat_room_id,
        "learning_status": generate_learning_status(),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v8/chat-stats/{chat_room_id}")
async def get_chat_stats(chat_room_id: str):
    """대화방별 통계 조회"""
    return {
        "success": True,
        "chat_room_id": chat_room_id,
        "stats": generate_ai_stats(),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v8/chatroom-messages/{chat_room_id}")
async def get_chatroom_messages(chat_room_id: str):
    """대화방 메시지 조회"""
    sample_messages = [
        {
            "id": f"msg_{i}",
            "sender": "김한수" if i % 3 == 0 else "송미화" if i % 3 == 1 else "이강미",
            "content": f"안녕하세요. 메시지 {i}번입니다.",
            "timestamp": datetime.now().isoformat(),
            "isMe": i % 4 == 0,
            "type": "text"
        }
        for i in range(1, 21)  # 20개 메시지
    ]
    
    return {
        "success": True,
        "chat_room_id": chat_room_id,
        "messages": sample_messages,
        "total_count": len(sample_messages),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v8/realtime-analysis")
async def realtime_analysis(data: Dict[str, Any]):
    """실시간 대화 분석"""
    messages = data.get("messages", [])
    
    analysis_result = {
        "key_topics": ["환급금", "총회", "시공사 선정"],
        "sentiment": {
            "overall": "positive",
            "confidence": round(random.uniform(0.7, 0.9), 3)
        },
        "urgency_level": random.choice(["low", "medium", "high"]),
        "participant_activity": {
            "most_active": "김한수",
            "total_participants": random.randint(8, 15),
            "recent_active": random.randint(3, 8)
        },
        "conversation_flow": "steady"
    }
    
    return {
        "success": True,
        "analysis": analysis_result,
        "processed_messages": len(messages),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v8/detailed-analysis")
async def detailed_analysis(data: Dict[str, Any]):
    """상세 대화 분석"""
    return {
        "success": True,
        "detailed_analysis": {
            "participant_analysis": {
                "김한수": {"messages": 45, "sentiment": "neutral", "topics": ["총회", "공지"]},
                "송미화": {"messages": 32, "sentiment": "concerned", "topics": ["환급금", "시공사"]},
                "이강미": {"messages": 28, "sentiment": "positive", "topics": ["절차", "검토"]}
            },
            "topic_trends": [
                {"topic": "환급금", "frequency": 23, "sentiment": "mixed"},
                {"topic": "총회", "frequency": 18, "sentiment": "neutral"},
                {"topic": "시공사", "frequency": 15, "sentiment": "concerned"}
            ],
            "recommendations": [
                "환급금 관련 명확한 안내 필요",
                "시공사 선정 과정 투명성 강화",
                "총회 참여 독려 메시지 발송"
            ]
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v8/projects")
async def get_projects():
    """프로젝트 목록 조회"""
    return {
        "success": True,
        "projects": [
            {
                "id": "proj_1",
                "name": "샘플 재건축",
                "description": "데모용 아파트 재건축 프로젝트",
                "created_at": "2024-01-15T10:00:00Z",
                "knowledge_items": 25
            },
            {
                "id": "proj_2", 
                "name": "입주자 소통 개선",
                "description": "입주자 간 효과적인 소통 방안",
                "created_at": "2024-02-01T14:30:00Z",
                "knowledge_items": 18
            }
        ],
        "total": 2,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v8/projects")
async def create_project(data: Dict[str, Any]):
    """새 프로젝트 생성"""
    project_name = data.get("name", "새 프로젝트")
    
    return {
        "success": True,
        "project": {
            "id": f"proj_{int(datetime.now().timestamp())}",
            "name": project_name,
            "description": data.get("description", ""),
            "created_at": datetime.now().isoformat(),
            "knowledge_items": 0
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v8/projects/{project_id}/knowledge")
async def get_project_knowledge(project_id: str):
    """프로젝트 지식 항목 조회"""
    return {
        "success": True,
        "project_id": project_id,
        "knowledge_items": [
            {
                "id": "know_1",
                "title": "환급금 처리 절차",
                "content": "환급금은 총회 결의 후 30일 이내 처리됩니다.",
                "type": "document",
                "created_at": "2024-01-20T09:00:00Z"
            },
            {
                "id": "know_2",
                "title": "시공사 선정 기준",
                "content": "기술력, 재무상태, 과거 실적을 종합 평가합니다.",
                "type": "guideline", 
                "created_at": "2024-01-25T11:30:00Z"
            }
        ],
        "total": 2,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v8/projects/{project_id}/knowledge")
async def add_project_knowledge(project_id: str, data: Dict[str, Any]):
    """프로젝트에 지식 항목 추가"""
    return {
        "success": True,
        "knowledge_item": {
            "id": f"know_{int(datetime.now().timestamp())}",
            "title": data.get("title", "새 지식"),
            "content": data.get("content", ""),
            "type": data.get("type", "document"),
            "project_id": project_id,
            "created_at": datetime.now().isoformat()
        },
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    _p = int(os.environ.get("SIMPLE_API_TEST_PORT", os.environ.get("PORT", "8003")))
    print("🚀 Ultimate AI Message System API 서버 시작...")
    print(f"📡 포트: {_p}")
    print(f"🔗 Health Check: http://localhost:{_p}/health")
    print(f"📚 API 문서: http://localhost:{_p}/docs")
    
    uvicorn.run(
        app,
        host="localhost",
        port=_p,
        log_level="info"
    ) 