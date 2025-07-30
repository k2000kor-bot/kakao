#!/usr/bin/env python3
"""
컨텍스트 분석 전용 서버
대화 컨텍스트 분석, 상황 파악 기능만 포함
"""

import os
import json
import re
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
    title="컨텍스트 분석 서버",
    description="대화 컨텍스트 분석 전용 API 서버",
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
def init_context_database():
    """컨텍스트 분석용 데이터베이스 초기화"""
    conn = sqlite3.connect('context_system.db')
    cursor = conn.cursor()
    
    # 컨텍스트 분석 결과 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS context_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_room_id TEXT NOT NULL,
            conversation_context TEXT NOT NULL,
            situation_type TEXT,
            urgency_level TEXT,
            participants_count INTEGER,
            key_topics TEXT,
            sentiment_overview TEXT,
            power_dynamics TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 상황 패턴 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS situation_patterns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pattern_name TEXT UNIQUE NOT NULL,
            keywords TEXT NOT NULL,
            context_rules TEXT,
            response_suggestions TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 컨텍스트 히스토리 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS context_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_room_id TEXT NOT NULL,
            analysis_result TEXT NOT NULL,
            accuracy_score REAL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 기본 상황 패턴 삽입
    default_patterns = [
        ('건설 프로젝트 논의', '건설,공사,시공,개발,조성', '건설 관련 프로젝트 논의 상황', '전문적이고 구체적인 정보 제공'),
        ('투자 결정', '투자,자금,예산,경제,비용', '투자 결정이 필요한 상황', '신중하고 검토된 의견 제시'),
        ('갈등 해결', '갈등,문제,해결,조정,중재', '갈등 상황 해결 필요', '중재적이고 균형잡힌 접근'),
        ('정보 공유', '정보,알림,공지,안내,설명', '정보 공유 상황', '명확하고 이해하기 쉬운 설명'),
        ('승인 요청', '승인,허가,인가,동의,찬성', '승인 요청 상황', '정당성과 필요성 강조'),
        ('반대 의견', '반대,거부,부정,비판,우려', '반대 의견 제시 상황', '이해와 함께 대안 제시')
    ]
    
    for pattern in default_patterns:
        cursor.execute('''
            INSERT OR IGNORE INTO situation_patterns 
            (pattern_name, keywords, context_rules, response_suggestions, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (*pattern, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()

# 요청 모델
class ContextAnalysisRequest(BaseModel):
    messages: List[Dict[str, Any]]
    chat_room_id: str
    participants: List[str]
    conversation_length: int

class SituationPatternRequest(BaseModel):
    pattern_name: str
    keywords: str
    context_rules: str
    response_suggestions: str

# 응답 모델
class ContextAnalysis(BaseModel):
    situation_type: str
    urgency_level: str
    participants_count: int
    key_topics: List[str]
    sentiment_overview: str
    power_dynamics: str
    context_summary: str
    response_guidance: List[str]
    risk_factors: List[str]
    opportunities: List[str]

class SituationPattern(BaseModel):
    pattern_name: str
    keywords: List[str]
    context_rules: str
    response_suggestions: str

# 상황 타입 분류
SITUATION_TYPES = {
    '건설 프로젝트': {
        'keywords': ['건설', '공사', '시공', '개발', '조성', '프로젝트'],
        'urgency': '보통',
        'sentiment': '업무적',
        'dynamics': '전문가 중심'
    },
    '투자 결정': {
        'keywords': ['투자', '자금', '예산', '경제', '비용', '수익'],
        'urgency': '높음',
        'sentiment': '신중',
        'dynamics': '의사결정자 중심'
    },
    '갈등 해결': {
        'keywords': ['갈등', '문제', '해결', '조정', '중재', '불만'],
        'urgency': '매우 높음',
        'sentiment': '긴장',
        'dynamics': '중재자 필요'
    },
    '정보 공유': {
        'keywords': ['정보', '알림', '공지', '안내', '설명', '보고'],
        'urgency': '낮음',
        'sentiment': '중립',
        'dynamics': '정보 제공자 중심'
    },
    '승인 요청': {
        'keywords': ['승인', '허가', '인가', '동의', '찬성', '요청'],
        'urgency': '높음',
        'sentiment': '긍정적',
        'dynamics': '승인자 중심'
    },
    '반대 의견': {
        'keywords': ['반대', '거부', '부정', '비판', '우려', '반박'],
        'urgency': '높음',
        'sentiment': '부정적',
        'dynamics': '대립 구도'
    }
}

# 컨텍스트 분석 함수
def analyze_context(request: ContextAnalysisRequest) -> ContextAnalysis:
    """대화 컨텍스트 분석"""
    if not request.messages:
        return ContextAnalysis(
            situation_type="일반",
            urgency_level="보통",
            participants_count=len(request.participants),
            key_topics=[],
            sentiment_overview="중립",
            power_dynamics="균등",
            context_summary="대화 내용이 없습니다.",
            response_guidance=["기본적인 인사말로 시작하세요."],
            risk_factors=[],
            opportunities=[]
        )
    
    # 전체 텍스트 수집
    all_text = ' '.join(msg.get('content', '') for msg in request.messages)
    all_text_lower = all_text.lower()
    
    # 상황 타입 분류
    situation_type = "일반"
    max_score = 0
    
    for sit_type, config in SITUATION_TYPES.items():
        score = sum(1 for keyword in config['keywords'] if keyword in all_text_lower)
        if score > max_score:
            max_score = score
            situation_type = sit_type
    
    # 긴급도 분석
    urgency_keywords = {
        '매우 높음': ['즉시', '긴급', '당장', '시급', '중요'],
        '높음': ['빨리', '서둘러', '중요', '필요'],
        '보통': ['일반', '평상시', '보통'],
        '낮음': ['천천히', '여유', '시간']
    }
    
    urgency_level = "보통"
    for level, keywords in urgency_keywords.items():
        if any(keyword in all_text_lower for keyword in keywords):
            urgency_level = level
            break
    
    # 키워드 추출
    korean_pattern = r'[가-힣]{2,}'
    keywords = re.findall(korean_pattern, all_text)
    keyword_freq = {}
    for keyword in keywords:
        if len(keyword) >= 2:
            keyword_freq[keyword] = keyword_freq.get(keyword, 0) + 1
    
    key_topics = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)[:5]
    key_topics = [topic[0] for topic in key_topics]
    
    # 감정 분석
    positive_words = ['좋은', '감사', '행복', '만족', '성공', '희망', '동의']
    negative_words = ['나쁜', '실패', '실망', '걱정', '불안', '화가', '반대']
    
    positive_count = sum(1 for word in positive_words if word in all_text_lower)
    negative_count = sum(1 for word in negative_words if word in all_text_lower)
    
    if positive_count > negative_count:
        sentiment_overview = "긍정적"
    elif negative_count > positive_count:
        sentiment_overview = "부정적"
    else:
        sentiment_overview = "중립적"
    
    # 권력 역학 분석
    participants_count = len(request.participants)
    if participants_count == 1:
        power_dynamics = "1:1 대화"
    elif participants_count <= 3:
        power_dynamics = "소규모 그룹"
    else:
        power_dynamics = "대규모 그룹"
    
    # 컨텍스트 요약
    context_summary = f"{situation_type} 상황에서 {sentiment_overview} 분위기의 대화가 진행 중입니다."
    
    # 응답 가이드 생성
    response_guidance = []
    if situation_type == "갈등 해결":
        response_guidance.extend([
            "중재적 입장을 유지하세요",
            "양쪽 의견을 균형있게 다루세요",
            "해결책을 제시하세요"
        ])
    elif situation_type == "투자 결정":
        response_guidance.extend([
            "신중한 분석을 제공하세요",
            "리스크와 기회를 명확히 설명하세요",
            "객관적 데이터를 활용하세요"
        ])
    else:
        response_guidance.extend([
            "상황에 맞는 적절한 톤을 유지하세요",
            "명확하고 이해하기 쉬운 메시지를 작성하세요"
        ])
    
    # 위험 요소 분석
    risk_factors = []
    if urgency_level in ['높음', '매우 높음']:
        risk_factors.append("시간적 압박")
    if sentiment_overview == "부정적":
        risk_factors.append("감정적 갈등")
    if participants_count > 5:
        risk_factors.append("복잡한 이해관계")
    
    # 기회 요소 분석
    opportunities = []
    if sentiment_overview == "긍정적":
        opportunities.append("협력 기회")
    if situation_type != "일반":
        opportunities.append("전문성 발휘 기회")
    if urgency_level == "높음":
        opportunities.append("의사결정 참여 기회")
    
    return ContextAnalysis(
        situation_type=situation_type,
        urgency_level=urgency_level,
        participants_count=participants_count,
        key_topics=key_topics,
        sentiment_overview=sentiment_overview,
        power_dynamics=power_dynamics,
        context_summary=context_summary,
        response_guidance=response_guidance,
        risk_factors=risk_factors,
        opportunities=opportunities
    )

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "컨텍스트 분석 서버",
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
            "대화 컨텍스트 분석",
            "상황 타입 분류",
            "긴급도 측정",
            "감정 분석",
            "권력 역학 분석"
        ]
    }

@app.post("/api/analyze-context")
async def analyze_context_endpoint(request: ContextAnalysisRequest):
    """컨텍스트 분석 API"""
    try:
        analysis = analyze_context(request)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('context_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO context_analyses 
            (chat_room_id, conversation_context, situation_type, urgency_level,
             participants_count, key_topics, sentiment_overview, power_dynamics, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            request.chat_room_id,
            json.dumps([msg.get('content', '') for msg in request.messages]),
            analysis.situation_type,
            analysis.urgency_level,
            analysis.participants_count,
            ','.join(analysis.key_topics),
            analysis.sentiment_overview,
            analysis.power_dynamics,
            analysis.created_at
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "analysis": analysis.dict(),
            "chat_room_id": request.chat_room_id
        }
        
    except Exception as e:
        logger.error(f"컨텍스트 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=f"컨텍스트 분석 실패: {str(e)}")

@app.get("/api/situation-patterns")
async def get_situation_patterns():
    """상황 패턴 목록 조회"""
    try:
        conn = sqlite3.connect('context_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT pattern_name, keywords, context_rules, response_suggestions
            FROM situation_patterns 
            ORDER BY pattern_name
        ''')
        
        patterns = []
        for row in cursor.fetchall():
            patterns.append({
                'pattern_name': row[0],
                'keywords': row[1].split(',') if row[1] else [],
                'context_rules': row[2],
                'response_suggestions': row[3]
            })
        
        conn.close()
        
        return {
            "success": True,
            "patterns": patterns
        }
        
    except Exception as e:
        logger.error(f"상황 패턴 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "patterns": []
        }

@app.post("/api/add-pattern")
async def add_situation_pattern(request: SituationPatternRequest):
    """새로운 상황 패턴 추가"""
    try:
        conn = sqlite3.connect('context_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO situation_patterns 
            (pattern_name, keywords, context_rules, response_suggestions, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            request.pattern_name,
            request.keywords,
            request.context_rules,
            request.response_suggestions,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": f"패턴 '{request.pattern_name}'이 추가되었습니다."
        }
        
    except Exception as e:
        logger.error(f"패턴 추가 오류: {e}")
        raise HTTPException(status_code=500, detail=f"패턴 추가 실패: {str(e)}")

@app.get("/api/context-history/{chat_room_id}")
async def get_context_history(chat_room_id: str):
    """컨텍스트 분석 히스토리 조회"""
    try:
        conn = sqlite3.connect('context_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT situation_type, urgency_level, participants_count, 
                   key_topics, sentiment_overview, power_dynamics, created_at
            FROM context_analyses 
            WHERE chat_room_id = ?
            ORDER BY created_at DESC 
            LIMIT 10
        ''', (chat_room_id,))
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'situation_type': row[0],
                'urgency_level': row[1],
                'participants_count': row[2],
                'key_topics': row[3].split(',') if row[3] else [],
                'sentiment_overview': row[4],
                'power_dynamics': row[5],
                'created_at': row[6]
            })
        
        conn.close()
        
        return {
            "success": True,
            "history": history
        }
        
    except Exception as e:
        logger.error(f"컨텍스트 히스토리 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "history": []
        }

# 서버 시작
if __name__ == "__main__":
    print("🚀 컨텍스트 분석 서버 시작")
    print("=" * 50)
    print("📍 서버 주소: http://localhost:8008")
    print("📖 API 문서: http://localhost:8008/docs")
    print("🎯 주요 엔드포인트:")
    print("   POST /api/analyze-context - 컨텍스트 분석")
    print("   GET /api/situation-patterns - 상황 패턴 목록")
    print("   POST /api/add-pattern - 패턴 추가")
    print("   GET /api/context-history/{id} - 분석 히스토리")
    print("")
    
    try:
        # 데이터베이스 초기화
        init_context_database()
        print("✅ 컨텍스트 데이터베이스 초기화 완료")
        
        # 서버 시작
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8008, log_level="info")
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 