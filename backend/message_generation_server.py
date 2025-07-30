#!/usr/bin/env python3
"""
메시지 생성 전용 서버
메시지 생성과 관련된 기능만 포함
"""

import os
import json
import random
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import sqlite3

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="메시지 생성 서버",
    description="메시지 생성 전용 API 서버",
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

# 데이터베이스 초기화
def init_message_database():
    """메시지 생성용 데이터베이스 초기화"""
    conn = sqlite3.connect('message_system.db')
    cursor = conn.cursor()
    
    # 생성된 메시지 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS generated_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT UNIQUE NOT NULL,
            content TEXT NOT NULL,
            strategy TEXT NOT NULL,
            tone TEXT NOT NULL,
            format TEXT NOT NULL,
            confidence REAL,
            impact REAL,
            created_at TEXT NOT NULL,
            chat_room_id TEXT,
            target_message TEXT
        )
    ''')
    
    # 메시지 히스토리 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS message_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_message TEXT NOT NULL,
            generated_message TEXT NOT NULL,
            strategy TEXT NOT NULL,
            success BOOLEAN,
            created_at TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# 요청 모델
class MessageGenerationRequest(BaseModel):
    target_message: Dict[str, str]
    tone: str
    message_format: str
    intent: str
    chat_room_id: str
    strategy: Optional[str] = "공감 전략"
    urgency_level: Optional[str] = "보통"
    message_length: Optional[str] = "중간"
    include_data: Optional[bool] = False
    include_examples: Optional[bool] = False
    include_call_to_action: Optional[bool] = False

# 응답 모델
class GeneratedMessage(BaseModel):
    id: str
    content: str
    style: str
    tone: str
    format: str
    confidence: float
    reasoning: str
    follow_up_messages: List[str]
    timestamp: str
    emotion: Optional[str] = None
    impact: Optional[float] = None
    strategy: Optional[str] = None

class MessageGenerationResponse(BaseModel):
    success: bool
    generated_messages: List[GeneratedMessage]
    chat_room_id: str
    target_message: str
    generation_time: str

# 전략별 메시지 템플릿
STRATEGY_TEMPLATES = {
    '공감 전략': {
        'template': "말씀하신 {intent}에 대해 충분히 이해합니다. {emotion_phrase} 함께 해결책을 찾아보시죠.",
        'emotion_phrases': ['정말 공감이 가는 부분이네요.', '충분히 이해할 수 있는 상황입니다.', '같은 마음이 드는군요.']
    },
    '논리 설득': {
        'template': "{intent}에 대한 객관적 데이터를 바탕으로 설명드리겠습니다. {data_phrase}",
        'data_phrases': ['통계에 따르면', '분석 결과', '전문가들의 의견에 따르면']
    },
    '감정 호소': {
        'template': "우리 모두의 미래를 위해 {intent}에 집중해야 합니다. {emotional_phrase}",
        'emotional_phrases': ['이것이 우리의 기회입니다.', '지금이 중요한 순간입니다.', '함께 노력해야 할 때입니다.']
    },
    '권위 인용': {
        'template': "전문가들의 의견에 따르면 {intent}가 중요하다고 합니다. {authority_phrase}",
        'authority_phrases': ['건설업계 전문가들이 강조하고 있습니다.', '경제학자들이 분석한 결과입니다.', '시장 전문가들의 의견입니다.']
    },
    '사회적 증명': {
        'template': "다른 조합원들도 {intent}에 동의하고 있습니다. {social_phrase}",
        'social_phrases': ['많은 분들이 같은 의견을 가지고 계십니다.', '이미 검증된 방법입니다.', '성공 사례가 많습니다.']
    }
}

# 톤별 조정
TONE_ADJUSTMENTS = {
    '강대우': {'prefix': '강력히 주장하는 바입니다: ', 'intensity': 1.5, 'emotion': '강경'},
    '중대우': {'prefix': '분명히 말씀드립니다: ', 'intensity': 1.2, 'emotion': '확신'},
    '약대우': {'prefix': '제안드리는 바입니다: ', 'intensity': 0.8, 'emotion': '부드러움'},
    '중립': {'prefix': '', 'intensity': 1.0, 'emotion': '중립'},
    '약삼성': {'prefix': '우려를 표하는 바입니다: ', 'intensity': 0.8, 'emotion': '우려'},
    '중삼성': {'prefix': '분명히 지적하는 바입니다: ', 'intensity': 1.2, 'emotion': '지적'},
    '강삼성': {'prefix': '강력히 반대하는 바입니다: ', 'intensity': 1.5, 'emotion': '강경'}
}

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "메시지 생성 서버",
        "version": "1.0.0",
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "고급 메시지 생성",
            "전략별 템플릿",
            "톤 조정",
            "신뢰도 계산"
        ]
    }

@app.post("/api/generate-message", response_model=MessageGenerationResponse)
async def generate_message(request: MessageGenerationRequest):
    """메시지 생성 API"""
    try:
        generated_messages = []
        
        for i in range(3):
            # 기본 템플릿 선택
            template_info = STRATEGY_TEMPLATES.get(request.strategy, STRATEGY_TEMPLATES['공감 전략'])
            template = template_info['template']
            
            # 랜덤 요소 선택
            if 'emotion_phrases' in template_info:
                emotion_phrase = random.choice(template_info['emotion_phrases'])
                message_content = template.format(intent=request.intent, emotion_phrase=emotion_phrase)
            elif 'data_phrases' in template_info:
                data_phrase = random.choice(template_info['data_phrases'])
                message_content = template.format(intent=request.intent, data_phrase=data_phrase)
            elif 'emotional_phrases' in template_info:
                emotional_phrase = random.choice(template_info['emotional_phrases'])
                message_content = template.format(intent=request.intent, emotional_phrase=emotional_phrase)
            elif 'authority_phrases' in template_info:
                authority_phrase = random.choice(template_info['authority_phrases'])
                message_content = template.format(intent=request.intent, authority_phrase=authority_phrase)
            elif 'social_phrases' in template_info:
                social_phrase = random.choice(template_info['social_phrases'])
                message_content = template.format(intent=request.intent, social_phrase=social_phrase)
            else:
                message_content = template.format(intent=request.intent)
            
            # 톤 조정
            tone_info = TONE_ADJUSTMENTS.get(request.tone, TONE_ADJUSTMENTS['중립'])
            message_content = tone_info['prefix'] + message_content
            
            # 신뢰도와 영향력 계산
            base_confidence = 0.75 + (i * 0.05) + (random.random() * 0.1)
            strategy_confidence = {
                '공감 전략': 0.85,
                '논리 설득': 0.80,
                '감정 호소': 0.75,
                '권위 인용': 0.90,
                '사회적 증명': 0.82
            }
            
            confidence = min(base_confidence * strategy_confidence.get(request.strategy, 0.80), 1.0)
            impact = 60 + (i * 10) + (random.random() * 20)
            
            # 메시지 생성
            message = GeneratedMessage(
                id=f"msg-{i+1}",
                content=message_content,
                style=request.message_format,
                tone=request.tone,
                format=request.message_format,
                confidence=confidence,
                reasoning=f"{request.strategy}를 사용하여 {request.intent}에 대한 {request.tone} 톤의 메시지를 생성했습니다.",
                follow_up_messages=[
                    "이어서 추가 논점을 제시할 수 있습니다.",
                    "상대방의 반응에 따라 조정이 필요합니다.",
                    "감정적 공감 포인트를 찾아 접근하세요."
                ],
                timestamp=datetime.now().isoformat(),
                emotion=tone_info['emotion'],
                impact=min(impact, 100),
                strategy=request.strategy
            )
            
            generated_messages.append(message)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('message_system.db')
        cursor = conn.cursor()
        
        for msg in generated_messages:
            # target_message가 딕셔너리인지 문자열인지 확인
            if isinstance(request.target_message, dict):
                target_content = request.target_message.get('content', '')
            else:
                target_content = str(request.target_message)
            
            cursor.execute('''
                INSERT OR REPLACE INTO generated_messages 
                (message_id, content, strategy, tone, format, confidence, impact, created_at, chat_room_id, target_message)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (msg.id, msg.content, msg.strategy, msg.tone, msg.format, 
                  msg.confidence, msg.impact, msg.timestamp, request.chat_room_id, 
                  target_content))
        
        conn.commit()
        conn.close()
        
        # target_message가 딕셔너리인지 문자열인지 확인
        if isinstance(request.target_message, dict):
            target_content = request.target_message.get('content', '')
        else:
            target_content = str(request.target_message)
        
        return MessageGenerationResponse(
            success=True,
            generated_messages=generated_messages,
            chat_room_id=request.chat_room_id,
            target_message=target_content,
            generation_time=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"메시지 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=f"메시지 생성 실패: {str(e)}")

@app.get("/api/message-history")
async def get_message_history():
    """메시지 히스토리 조회"""
    try:
        conn = sqlite3.connect('message_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT message_id, content, strategy, tone, confidence, impact, created_at
            FROM generated_messages 
            ORDER BY created_at DESC 
            LIMIT 50
        ''')
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'id': row[0],
                'content': row[1],
                'strategy': row[2],
                'tone': row[3],
                'confidence': row[4],
                'impact': row[5],
                'created_at': row[6]
            })
        
        conn.close()
        
        return {
            "success": True,
            "history": history
        }
        
    except Exception as e:
        logger.error(f"히스토리 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "history": []
        }

# 서버 시작
if __name__ == "__main__":
    print("🚀 메시지 생성 서버 시작")
    print("=" * 50)
    print("📍 서버 주소: http://localhost:8001")
    print("📖 API 문서: http://localhost:8001/docs")
    print("🎯 주요 엔드포인트:")
    print("   POST /api/generate-message - 메시지 생성")
    print("   GET /api/message-history - 히스토리 조회")
    print("   GET /api/status - 시스템 상태")
    print("")
    
    try:
        # 데이터베이스 초기화
        init_message_database()
        print("✅ 메시지 데이터베이스 초기화 완료")
        
        # 서버 시작
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8003, log_level="info")
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 