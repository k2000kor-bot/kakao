#!/usr/bin/env python3
"""
대응메시지 생성 전용 서버
대응메시지 생성과 관련된 모든 기능만 포함
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
    title="대응메시지 생성 서버",
    description="대응메시지 생성 전용 API 서버",
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
def init_response_database():
    """대응메시지 생성용 데이터베이스 초기화"""
    conn = sqlite3.connect('response_system.db')
    cursor = conn.cursor()
    
    # 대응메시지 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS response_messages (
            id TEXT PRIMARY KEY,
            original_message TEXT NOT NULL,
            response_message TEXT NOT NULL,
            strategy TEXT NOT NULL,
            tone TEXT NOT NULL,
            format TEXT NOT NULL,
            confidence REAL,
            impact REAL,
            emotion TEXT,
            created_at TEXT NOT NULL,
            chat_room_id TEXT,
            user_id TEXT
        )
    ''')
    
    # 대응 전략 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS response_strategies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            strategy_name TEXT UNIQUE NOT NULL,
            description TEXT,
            template TEXT NOT NULL,
            keywords TEXT,
            effectiveness REAL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 대응 히스토리 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS response_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_message TEXT NOT NULL,
            response_message TEXT NOT NULL,
            strategy TEXT NOT NULL,
            success BOOLEAN,
            feedback TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 기본 전략 데이터 삽입
    default_strategies = [
        ('공감 전략', '상대방의 감정에 공감하며 대응', '말씀하신 {intent}에 대해 충분히 이해합니다. {emotion_phrase} 함께 해결책을 찾아보시죠.', '이해,공감,함께', 0.85),
        ('논리 설득', '객관적 데이터와 논리로 설득', '{intent}에 대한 객관적 데이터를 바탕으로 설명드리겠습니다. {data_phrase}', '데이터,분석,객관적', 0.80),
        ('감정 호소', '감정적 공감을 통한 설득', '우리 모두의 미래를 위해 {intent}에 집중해야 합니다. {emotional_phrase}', '미래,공동체,희망', 0.75),
        ('권위 인용', '전문가 의견을 인용한 설득', '전문가들의 의견에 따르면 {intent}가 중요하다고 합니다. {authority_phrase}', '전문가,권위,검증', 0.90),
        ('사회적 증명', '다른 사람들의 의견을 인용', '다른 분들도 {intent}에 동의하고 있습니다. {social_phrase}', '다른사람,동의,일반적', 0.82)
    ]
    
    for strategy in default_strategies:
        cursor.execute('''
            INSERT OR IGNORE INTO response_strategies 
            (strategy_name, description, template, keywords, effectiveness, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (*strategy, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()

# 요청 모델
class ResponseGenerationRequest(BaseModel):
    original_message: str
    sender: str
    chat_room_id: str
    strategy: Optional[str] = "공감 전략"
    tone: Optional[str] = "중립"
    format: Optional[str] = "일반"
    urgency_level: Optional[str] = "보통"
    message_length: Optional[str] = "중간"
    include_data: Optional[bool] = False
    include_examples: Optional[bool] = False
    include_call_to_action: Optional[bool] = False
    target_emotion: Optional[str] = None

class ResponseTemplateRequest(BaseModel):
    strategy_name: str
    template: str
    description: str
    keywords: str

# 응답 모델
class GeneratedResponse(BaseModel):
    id: str
    original_message: str
    response_message: str
    strategy: str
    tone: str
    format: str
    confidence: float
    impact: float
    emotion: Optional[str]
    reasoning: str
    alternatives: List[str]
    created_at: str

class ResponseStrategy(BaseModel):
    strategy_name: str
    description: str
    template: str
    keywords: List[str]
    effectiveness: float

# 대응 전략 템플릿
RESPONSE_TEMPLATES = {
    '공감 전략': {
        'template': '말씀하신 {intent}에 대해 충분히 이해합니다. {emotion_phrase} 함께 해결책을 찾아보시죠.',
        'emotion_phrases': ['정말 공감이 가는 부분이네요.', '충분히 이해할 수 있는 상황입니다.', '같은 마음이 드는군요.'],
        'keywords': ['이해', '공감', '함께', '해결책']
    },
    '논리 설득': {
        'template': '{intent}에 대한 객관적 데이터를 바탕으로 설명드리겠습니다. {data_phrase}',
        'data_phrases': ['통계에 따르면', '분석 결과', '전문가들의 의견에 따르면'],
        'keywords': ['데이터', '분석', '객관적', '통계']
    },
    '감정 호소': {
        'template': '우리 모두의 미래를 위해 {intent}에 집중해야 합니다. {emotional_phrase}',
        'emotional_phrases': ['이것이 우리의 기회입니다.', '지금이 중요한 순간입니다.', '함께 노력해야 할 때입니다.'],
        'keywords': ['미래', '공동체', '희망', '함께']
    },
    '권위 인용': {
        'template': '전문가들의 의견에 따르면 {intent}가 중요하다고 합니다. {authority_phrase}',
        'authority_phrases': ['건설업계 전문가들이 강조하고 있습니다.', '경제학자들이 분석한 결과입니다.', '시장 전문가들의 의견입니다.'],
        'keywords': ['전문가', '권위', '검증', '분석']
    },
    '사회적 증명': {
        'template': '다른 조합원들도 {intent}에 동의하고 있습니다. {social_phrase}',
        'social_phrases': ['많은 분들이 같은 의견을 가지고 계십니다.', '이미 검증된 방법입니다.', '성공 사례가 많습니다.'],
        'keywords': ['다른사람', '동의', '일반적', '검증']
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

# 의도 추출 함수
def extract_intent(message: str) -> str:
    """메시지에서 의도 추출"""
    intents = {
        '건설': ['건설', '공사', '시공', '조성', '개발'],
        '투자': ['투자', '자금', '예산', '비용', '경제'],
        '협의': ['협의', '상의', '논의', '회의', '토론'],
        '승인': ['승인', '허가', '인가', '동의', '찬성'],
        '반대': ['반대', '거부', '부정', '비판', '우려'],
        '정보': ['정보', '알림', '공지', '안내', '설명']
    }
    
    message_lower = message.lower()
    for intent, keywords in intents.items():
        if any(keyword in message_lower for keyword in keywords):
            return intent
    
    return '일반'

# 대응메시지 생성
def generate_response_message(request: ResponseGenerationRequest) -> GeneratedResponse:
    """대응메시지 생성"""
    # 의도 추출
    intent = extract_intent(request.original_message)
    
    # 전략 템플릿 선택
    strategy_info = RESPONSE_TEMPLATES.get(request.strategy, RESPONSE_TEMPLATES['공감 전략'])
    template = strategy_info['template']
    
    # 랜덤 요소 선택
    if 'emotion_phrases' in strategy_info:
        emotion_phrase = random.choice(strategy_info['emotion_phrases'])
        response_content = template.format(intent=intent, emotion_phrase=emotion_phrase)
    elif 'data_phrases' in strategy_info:
        data_phrase = random.choice(strategy_info['data_phrases'])
        response_content = template.format(intent=intent, data_phrase=data_phrase)
    elif 'emotional_phrases' in strategy_info:
        emotional_phrase = random.choice(strategy_info['emotional_phrases'])
        response_content = template.format(intent=intent, emotional_phrase=emotional_phrase)
    elif 'authority_phrases' in strategy_info:
        authority_phrase = random.choice(strategy_info['authority_phrases'])
        response_content = template.format(intent=intent, authority_phrase=authority_phrase)
    elif 'social_phrases' in strategy_info:
        social_phrase = random.choice(strategy_info['social_phrases'])
        response_content = template.format(intent=intent, social_phrase=social_phrase)
    else:
        response_content = template.format(intent=intent)
    
    # 톤 조정
    tone_info = TONE_ADJUSTMENTS.get(request.tone, TONE_ADJUSTMENTS['중립'])
    response_content = tone_info['prefix'] + response_content
    
    # 추가 옵션 적용
    if request.include_data:
        response_content += " 관련 데이터를 첨부드립니다."
    
    if request.include_examples:
        response_content += " 구체적인 사례를 제시드리겠습니다."
    
    if request.include_call_to_action:
        response_content += " 즉시 조치하시기 바랍니다."
    
    # 신뢰도와 영향력 계산
    base_confidence = 0.75 + random.uniform(0, 0.15)
    strategy_confidence = {
        '공감 전략': 0.85,
        '논리 설득': 0.80,
        '감정 호소': 0.75,
        '권위 인용': 0.90,
        '사회적 증명': 0.82
    }
    
    confidence = min(base_confidence * strategy_confidence.get(request.strategy, 0.80), 1.0)
    impact = 60 + random.uniform(0, 30)
    
    # 대안 메시지 생성
    alternatives = []
    for i in range(2):
        alt_strategy = random.choice(list(RESPONSE_TEMPLATES.keys()))
        alt_template = RESPONSE_TEMPLATES[alt_strategy]['template']
        alt_content = alt_template.format(intent=intent, emotion_phrase="", data_phrase="", emotional_phrase="", authority_phrase="", social_phrase="")
        alternatives.append(alt_content)
    
    # 메시지 ID 생성
    response_id = f"resp_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random.randint(1000, 9999)}"
    
    return GeneratedResponse(
        id=response_id,
        original_message=request.original_message,
        response_message=response_content,
        strategy=request.strategy,
        tone=request.tone,
        format=request.format,
        confidence=confidence,
        impact=min(impact, 100),
        emotion=tone_info['emotion'],
        reasoning=f"{request.strategy}를 사용하여 {intent}에 대한 {request.tone} 톤의 대응메시지를 생성했습니다.",
        alternatives=alternatives,
        created_at=datetime.now().isoformat()
    )

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "대응메시지 생성 서버",
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
            "대응메시지 생성",
            "전략별 템플릿",
            "톤 조정",
            "신뢰도 계산",
            "대안 메시지 생성"
        ]
    }

@app.post("/api/generate-response", response_model=Dict[str, Any])
async def generate_response_endpoint(request: ResponseGenerationRequest):
    """대응메시지 생성 API"""
    try:
        response = generate_response_message(request)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('response_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO response_messages 
            (id, original_message, response_message, strategy, tone, format, 
             confidence, impact, emotion, created_at, chat_room_id, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            response.id, response.original_message, response.response_message,
            response.strategy, response.tone, response.format, response.confidence,
            response.impact, response.emotion, response.created_at,
            request.chat_room_id, request.sender
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "response": response.dict(),
            "chat_room_id": request.chat_room_id
        }
        
    except Exception as e:
        logger.error(f"대응메시지 생성 오류: {e}")
        raise HTTPException(status_code=500, detail=f"대응메시지 생성 실패: {str(e)}")

@app.get("/api/response-strategies")
async def get_response_strategies():
    """대응 전략 목록 조회"""
    try:
        conn = sqlite3.connect('response_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT strategy_name, description, template, keywords, effectiveness
            FROM response_strategies 
            ORDER BY effectiveness DESC
        ''')
        
        strategies = []
        for row in cursor.fetchall():
            strategies.append({
                'strategy_name': row[0],
                'description': row[1],
                'template': row[2],
                'keywords': row[3].split(',') if row[3] else [],
                'effectiveness': row[4]
            })
        
        conn.close()
        
        return {
            "success": True,
            "strategies": strategies
        }
        
    except Exception as e:
        logger.error(f"전략 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "strategies": []
        }

@app.post("/api/add-strategy")
async def add_response_strategy(request: ResponseTemplateRequest):
    """새로운 대응 전략 추가"""
    try:
        conn = sqlite3.connect('response_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO response_strategies 
            (strategy_name, description, template, keywords, effectiveness, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            request.strategy_name,
            request.description,
            request.template,
            request.keywords,
            0.75,  # 기본 효과성
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": f"전략 '{request.strategy_name}'이 추가되었습니다."
        }
        
    except Exception as e:
        logger.error(f"전략 추가 오류: {e}")
        raise HTTPException(status_code=500, detail=f"전략 추가 실패: {str(e)}")

@app.get("/api/response-history")
async def get_response_history():
    """대응메시지 히스토리 조회"""
    try:
        conn = sqlite3.connect('response_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, original_message, response_message, strategy, tone, 
                   confidence, impact, created_at
            FROM response_messages 
            ORDER BY created_at DESC 
            LIMIT 50
        ''')
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'id': row[0],
                'original_message': row[1],
                'response_message': row[2],
                'strategy': row[3],
                'tone': row[4],
                'confidence': row[5],
                'impact': row[6],
                'created_at': row[7]
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

@app.post("/api/feedback")
async def submit_feedback(response_id: str, success: bool, feedback: str = ""):
    """대응메시지 피드백 제출"""
    try:
        conn = sqlite3.connect('response_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO response_history 
            (original_message, response_message, strategy, success, feedback, created_at)
            SELECT original_message, response_message, strategy, ?, ?, ?
            FROM response_messages 
            WHERE id = ?
        ''', (success, feedback, datetime.now().isoformat(), response_id))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "피드백이 저장되었습니다."
        }
        
    except Exception as e:
        logger.error(f"피드백 저장 오류: {e}")
        raise HTTPException(status_code=500, detail=f"피드백 저장 실패: {str(e)}")

# 서버 시작
if __name__ == "__main__":
    _p = int(
        os.environ.get(
            "RESPONSE_GENERATION_SERVER_PORT", os.environ.get("PORT", "8007")
        )
    )
    print("🚀 대응메시지 생성 서버 시작")
    print("=" * 50)
    print(f"📍 서버 주소: http://localhost:{_p}")
    print(f"📖 API 문서: http://localhost:{_p}/docs")
    print("🎯 주요 엔드포인트:")
    print("   POST /api/generate-response - 대응메시지 생성")
    print("   GET /api/response-strategies - 전략 목록")
    print("   POST /api/add-strategy - 전략 추가")
    print("   GET /api/response-history - 히스토리 조회")
    print("   POST /api/feedback - 피드백 제출")
    print("")
    
    try:
        # 데이터베이스 초기화
        init_response_database()
        print("✅ 대응메시지 데이터베이스 초기화 완료")
        
        # 서버 시작
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=_p, log_level="info")
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 