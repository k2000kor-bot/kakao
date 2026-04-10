#!/usr/bin/env python3
"""
대화 분석 전용 서버
대화 분석, 감정 분석, 키워드 추출 기능만 포함
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
    title="대화 분석 서버",
    description="대화 분석 전용 API 서버",
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
def init_analysis_database():
    """대화 분석용 데이터베이스 초기화"""
    conn = sqlite3.connect('analysis_system.db')
    cursor = conn.cursor()
    
    # 분석 결과 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversation_analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_room_id TEXT NOT NULL,
            total_messages INTEGER,
            active_participants INTEGER,
            dominant_emotion TEXT,
            sentiment_trend TEXT,
            conflict_level REAL,
            key_topics TEXT,
            influence_opportunities TEXT,
            ai_recommendations TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 감정 분석 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS emotion_analysis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT NOT NULL,
            emotion TEXT,
            sentiment_score REAL,
            keywords TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    
    # 키워드 추출 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS keyword_extraction (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_room_id TEXT NOT NULL,
            keyword TEXT NOT NULL,
            frequency INTEGER,
            importance_score REAL,
            created_at TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# 요청 모델
class ConversationAnalysisRequest(BaseModel):
    messages: List[Dict[str, Any]]
    chat_room_id: str
    analysis_type: Optional[str] = "comprehensive"

class EmotionAnalysisRequest(BaseModel):
    message: str
    sender: str
    timestamp: str

class KeywordExtractionRequest(BaseModel):
    text: str
    chat_room_id: str

# 응답 모델
class ConversationAnalysis(BaseModel):
    total_messages: int
    active_participants: int
    dominant_emotion: str
    sentiment_trend: str
    conflict_level: float
    key_topics: List[str]
    influence_opportunities: List[str]
    ai_recommendations: List[str]
    analysis_timestamp: str

class EmotionAnalysis(BaseModel):
    emotion: str
    sentiment_score: float
    keywords: List[str]
    confidence: float

class KeywordExtraction(BaseModel):
    keywords: List[Dict[str, Any]]
    total_keywords: int
    most_important: str

# 감정 분석 함수
def analyze_emotion(text: str) -> Dict[str, Any]:
    """텍스트의 감정 분석"""
    emotions = {
        '기쁨': ['좋아', '행복', '감사', '즐거워', '만족', '기쁘', '좋은'],
        '분노': ['화나', '짜증', '열받', '분노', '화가', '싫어', '나빠'],
        '슬픔': ['슬퍼', '우울', '힘들', '어려워', '불안', '걱정'],
        '중립': ['알겠', '네', '그래', '좋아', '괜찮', '보통'],
        '놀람': ['어?', '뭐?', '진짜?', '와!', '대박', '놀라'],
        '두려움': ['무서워', '겁나', '불안', '걱정', '위험', '조심']
    }
    
    text_lower = text.lower()
    emotion_scores = {}
    
    for emotion, keywords in emotions.items():
        score = sum(1 for keyword in keywords if keyword in text_lower)
        emotion_scores[emotion] = score
    
    # 가장 높은 점수의 감정 선택
    dominant_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0]
    total_score = sum(emotion_scores.values())
    confidence = emotion_scores[dominant_emotion] / max(total_score, 1)
    
    # 감정 점수 정규화 (-1 ~ 1)
    sentiment_score = (emotion_scores['기쁨'] - emotion_scores['분노'] - emotion_scores['슬픔']) / max(total_score, 1)
    
    return {
        'emotion': dominant_emotion,
        'sentiment_score': max(-1, min(1, sentiment_score)),
        'confidence': confidence,
        'emotion_scores': emotion_scores
    }

# 키워드 추출 함수
def extract_keywords(text: str) -> List[Dict[str, Any]]:
    """텍스트에서 키워드 추출"""
    # 한국어 키워드 패턴
    korean_pattern = r'[가-힣]{2,}'
    keywords = re.findall(korean_pattern, text)
    
    # 빈도수 계산
    keyword_freq = {}
    for keyword in keywords:
        if len(keyword) >= 2:  # 2글자 이상만
            keyword_freq[keyword] = keyword_freq.get(keyword, 0) + 1
    
    # 중요도 점수 계산 (길이 * 빈도)
    keyword_scores = []
    for keyword, freq in keyword_freq.items():
        importance = len(keyword) * freq
        keyword_scores.append({
            'keyword': keyword,
            'frequency': freq,
            'importance': importance,
            'length': len(keyword)
        })
    
    # 중요도 순으로 정렬
    keyword_scores.sort(key=lambda x: x['importance'], reverse=True)
    
    return keyword_scores[:10]  # 상위 10개만 반환

# 대화 분석 함수
def analyze_conversation(messages: List[Dict[str, Any]]) -> ConversationAnalysis:
    """대화 전체 분석"""
    if not messages:
        return ConversationAnalysis(
            total_messages=0,
            active_participants=0,
            dominant_emotion="중립",
            sentiment_trend="안정",
            conflict_level=0.0,
            key_topics=[],
            influence_opportunities=[],
            ai_recommendations=[],
            analysis_timestamp=datetime.now().isoformat()
        )
    
    # 기본 통계
    total_messages = len(messages)
    participants = set(msg.get('sender', '') for msg in messages if msg.get('sender'))
    active_participants = len(participants)
    
    # 감정 분석
    emotions = []
    sentiment_scores = []
    
    for msg in messages:
        content = msg.get('content', '')
        if content:
            emotion_result = analyze_emotion(content)
            emotions.append(emotion_result['emotion'])
            sentiment_scores.append(emotion_result['sentiment_score'])
    
    # 지배적 감정
    emotion_counts = {}
    for emotion in emotions:
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else "중립"
    
    # 감정 트렌드
    if sentiment_scores:
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores)
        if avg_sentiment > 0.3:
            sentiment_trend = "긍정적"
        elif avg_sentiment < -0.3:
            sentiment_trend = "부정적"
        else:
            sentiment_trend = "중립적"
    else:
        sentiment_trend = "안정"
    
    # 갈등 수준 계산
    negative_emotions = sum(1 for emotion in emotions if emotion in ['분노', '슬픔', '두려움'])
    conflict_level = min(negative_emotions / max(total_messages, 1) * 100, 100)
    
    # 키워드 추출
    all_text = ' '.join(msg.get('content', '') for msg in messages)
    keywords = extract_keywords(all_text)
    key_topics = [kw['keyword'] for kw in keywords[:5]]
    
    # 영향력 기회
    influence_opportunities = []
    if conflict_level > 50:
        influence_opportunities.append("갈등 해소를 위한 중재 필요")
    if sentiment_trend == "부정적":
        influence_opportunities.append("긍정적 분위기 조성 필요")
    if active_participants > 5:
        influence_opportunities.append("다수 참여자 관리 전략 필요")
    
    # AI 추천사항
    ai_recommendations = []
    if conflict_level > 70:
        ai_recommendations.append("즉시 갈등 해소 대화 시작")
    elif conflict_level > 30:
        ai_recommendations.append("갈등 조기 해결 권장")
    
    if sentiment_trend == "부정적":
        ai_recommendations.append("긍정적 메시지로 분위기 전환")
    
    if len(key_topics) > 0:
        ai_recommendations.append(f"'{key_topics[0]}' 주제로 대화 연결")
    
    return ConversationAnalysis(
        total_messages=total_messages,
        active_participants=active_participants,
        dominant_emotion=dominant_emotion,
        sentiment_trend=sentiment_trend,
        conflict_level=conflict_level,
        key_topics=key_topics,
        influence_opportunities=influence_opportunities,
        ai_recommendations=ai_recommendations,
        analysis_timestamp=datetime.now().isoformat()
    )

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "대화 분석 서버",
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
            "대화 분석",
            "감정 분석",
            "키워드 추출",
            "갈등 수준 측정",
            "AI 추천사항"
        ]
    }

@app.post("/api/analyze-conversation")
async def analyze_conversation_endpoint(request: ConversationAnalysisRequest):
    """대화 분석 API"""
    try:
        analysis = analyze_conversation(request.messages)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('analysis_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO conversation_analyses 
            (chat_room_id, total_messages, active_participants, dominant_emotion, 
             sentiment_trend, conflict_level, key_topics, influence_opportunities, 
             ai_recommendations, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            request.chat_room_id, analysis.total_messages, analysis.active_participants,
            analysis.dominant_emotion, analysis.sentiment_trend, analysis.conflict_level,
            ','.join(analysis.key_topics), ','.join(analysis.influence_opportunities),
            ','.join(analysis.ai_recommendations), analysis.analysis_timestamp
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "analysis": analysis.dict(),
            "chat_room_id": request.chat_room_id
        }
        
    except Exception as e:
        logger.error(f"대화 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=f"대화 분석 실패: {str(e)}")

@app.post("/api/analyze-emotion")
async def analyze_emotion_endpoint(request: EmotionAnalysisRequest):
    """감정 분석 API"""
    try:
        emotion_result = analyze_emotion(request.message)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('analysis_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO emotion_analysis 
            (message_id, emotion, sentiment_score, keywords, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            f"{request.sender}_{request.timestamp}",
            emotion_result['emotion'],
            emotion_result['sentiment_score'],
            ','.join(extract_keywords(request.message)[:5]),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "emotion": emotion_result['emotion'],
            "sentiment_score": emotion_result['sentiment_score'],
            "confidence": emotion_result['confidence'],
            "keywords": extract_keywords(request.message)[:5]
        }
        
    except Exception as e:
        logger.error(f"감정 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=f"감정 분석 실패: {str(e)}")

@app.post("/api/extract-keywords")
async def extract_keywords_endpoint(request: KeywordExtractionRequest):
    """키워드 추출 API"""
    try:
        keywords = extract_keywords(request.text)
        
        # 데이터베이스에 저장
        conn = sqlite3.connect('analysis_system.db')
        cursor = conn.cursor()
        
        for keyword_data in keywords[:5]:  # 상위 5개만 저장
            cursor.execute('''
                INSERT INTO keyword_extraction 
                (chat_room_id, keyword, frequency, importance_score, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                request.chat_room_id,
                keyword_data['keyword'],
                keyword_data['frequency'],
                keyword_data['importance'],
                datetime.now().isoformat()
            ))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "keywords": keywords,
            "total_keywords": len(keywords),
            "most_important": keywords[0]['keyword'] if keywords else ""
        }
        
    except Exception as e:
        logger.error(f"키워드 추출 오류: {e}")
        raise HTTPException(status_code=500, detail=f"키워드 추출 실패: {str(e)}")

@app.get("/api/analysis-history/{chat_room_id}")
async def get_analysis_history(chat_room_id: str):
    """분석 히스토리 조회"""
    try:
        conn = sqlite3.connect('analysis_system.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT total_messages, active_participants, dominant_emotion, 
                   sentiment_trend, conflict_level, key_topics, 
                   influence_opportunities, ai_recommendations, created_at
            FROM conversation_analyses 
            WHERE chat_room_id = ?
            ORDER BY created_at DESC 
            LIMIT 10
        ''', (chat_room_id,))
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'total_messages': row[0],
                'active_participants': row[1],
                'dominant_emotion': row[2],
                'sentiment_trend': row[3],
                'conflict_level': row[4],
                'key_topics': row[5].split(',') if row[5] else [],
                'influence_opportunities': row[6].split(',') if row[6] else [],
                'ai_recommendations': row[7].split(',') if row[7] else [],
                'created_at': row[8]
            })
        
        conn.close()
        
        return {
            "success": True,
            "history": history
        }
        
    except Exception as e:
        logger.error(f"분석 히스토리 조회 오류: {e}")
        return {
            "success": False,
            "error": str(e),
            "history": []
        }

# 서버 시작
if __name__ == "__main__":
    _p = int(
        os.environ.get("CHAT_ANALYSIS_SERVER_PORT", os.environ.get("PORT", "8004"))
    )
    print("🚀 대화 분석 서버 시작")
    print("=" * 50)
    print(f"📍 서버 주소: http://localhost:{_p}")
    print(f"📖 API 문서: http://localhost:{_p}/docs")
    print("🎯 주요 엔드포인트:")
    print("   POST /api/analyze-conversation - 대화 분석")
    print("   POST /api/analyze-emotion - 감정 분석")
    print("   POST /api/extract-keywords - 키워드 추출")
    print("   GET /api/analysis-history/{id} - 분석 히스토리")
    print("")
    
    try:
        # 데이터베이스 초기화
        init_analysis_database()
        print("✅ 분석 데이터베이스 초기화 완료")
        
        # 서버 시작
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=_p, log_level="info")
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 