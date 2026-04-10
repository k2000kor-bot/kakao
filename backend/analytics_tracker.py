"""
CORBU.AI 사용자 행동 분석 및 통계 시스템
사용자의 질문 패턴과 서비스 사용 통계를 수집합니다.
"""

import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import json
from datetime import datetime
import logging
import sqlite3

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CORBU.AI Analytics Tracker", version="1.0.0")


class AnalyticsEvent(BaseModel):
    user_id: str
    session_id: str
    event_type: str  # 'question', 'intent_classified', 'service_used', 'error'
    data: Dict[str, Any]
    timestamp: str


class AnalyticsStats(BaseModel):
    total_users: int
    total_sessions: int
    total_questions: int
    intent_distribution: Dict[str, int]
    service_usage: Dict[str, int]
    popular_keywords: List[Dict[str, Any]]
    daily_stats: List[Dict[str, Any]]
    error_rate: float


class UserBehavior(BaseModel):
    user_id: str
    session_count: int
    question_count: int
    favorite_intent: str
    avg_session_duration: float
    last_active: str

# 데이터베이스 초기화
def init_database():
    """분석 데이터베이스를 초기화합니다."""
    db_path = "analytics.db"

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 이벤트 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            session_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            data TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 사용자 통계 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_stats (
            user_id TEXT PRIMARY KEY,
            session_count INTEGER DEFAULT 0,
            question_count INTEGER DEFAULT 0,
            favorite_intent TEXT,
            total_session_duration REAL DEFAULT 0,
            last_active TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 세션 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT,
            duration REAL,
            question_count INTEGER DEFAULT 0,
            intents_used TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()
    logger.info("Analytics database initialized")


def log_event(event: AnalyticsEvent):
    """분석 이벤트를 데이터베이스에 기록합니다."""
    db_path = "analytics.db"

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO analytics_events 
        (user_id, session_id, event_type, data, timestamp)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        event.user_id,
        event.session_id,
        event.event_type,
        json.dumps(event.data),
        event.timestamp
    ))

    conn.commit()
    conn.close()


def update_user_stats(
    user_id: str, session_id: str, event_type: str, data: Dict[str, Any]
):
    """사용자 통계를 업데이트합니다."""
    db_path = "analytics.db"

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 사용자 통계 업데이트
    if event_type == 'question':
        cursor.execute('''
            INSERT OR REPLACE INTO user_stats 
            (user_id, question_count, last_active, updated_at)
            VALUES (?, COALESCE((SELECT question_count FROM user_stats 
            WHERE user_id = ?), 0) + 1, ?, CURRENT_TIMESTAMP)
        ''', (user_id, user_id, datetime.now().isoformat()))

    elif event_type == 'session_start':
        cursor.execute('''
            INSERT OR REPLACE INTO user_stats 
            (user_id, session_count, last_active, updated_at)
            VALUES (?, COALESCE((SELECT session_count FROM user_stats 
            WHERE user_id = ?), 0) + 1, ?, CURRENT_TIMESTAMP)
        ''', (user_id, user_id, datetime.now().isoformat()))

    elif event_type == 'intent_classified':
        intent = data.get('intent', '')
        cursor.execute('''
            UPDATE user_stats
            SET favorite_intent = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ''', (intent, user_id))

    conn.commit()
    conn.close()


def get_analytics_stats() -> AnalyticsStats:
    """전체 분석 통계를 조회합니다."""
    db_path = "analytics.db"

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 전체 통계
    cursor.execute('SELECT COUNT(DISTINCT user_id) FROM analytics_events')
    total_users = cursor.fetchone()[0] or 0

    cursor.execute('SELECT COUNT(DISTINCT session_id) FROM analytics_events')
    total_sessions = cursor.fetchone()[0] or 0

    cursor.execute(
        'SELECT COUNT(*) FROM analytics_events WHERE event_type = "question"'
    )
    total_questions = cursor.fetchone()[0] or 0

    # 의도 분포
    cursor.execute('''
        SELECT data FROM analytics_events
        WHERE event_type = "intent_classified"
    ''')
    intent_data = cursor.fetchall()

    intent_distribution = {}
    for (data_str,) in intent_data:
        try:
            data = json.loads(data_str)
            intent = data.get('intent', 'unknown')
            intent_distribution[intent] = intent_distribution.get(intent, 0) + 1
        except Exception:
            continue

    # 서비스 사용량
    cursor.execute('''
        SELECT data FROM analytics_events
        WHERE event_type = "service_used"
    ''')
    service_data = cursor.fetchall()

    service_usage = {}
    for (data_str,) in service_data:
        try:
            data = json.loads(data_str)
            service = data.get('service', 'unknown')
            service_usage[service] = service_usage.get(service, 0) + 1
        except Exception:
            continue

    # 인기 키워드 (간단한 구현)
    cursor.execute('''
        SELECT data FROM analytics_events
        WHERE event_type = "question"
    ''')
    question_data = cursor.fetchall()

    keywords = {}
    for (data_str,) in question_data:
        try:
            data = json.loads(data_str)
            message = data.get('message', '').lower()
            # 간단한 키워드 추출
            words = message.split()
            for word in words:
                if len(word) > 2:  # 2글자 이상만
                    keywords[word] = keywords.get(word, 0) + 1
        except Exception:
            continue

    popular_keywords = [
        {"keyword": k, "count": v}
        for k, v in sorted(
            keywords.items(), key=lambda x: x[1], reverse=True
        )[:10]
    ]

    # 일일 통계 (최근 7일)
    cursor.execute('''
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM analytics_events
        WHERE created_at >= date('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY date
    ''')
    daily_data = cursor.fetchall()

    daily_stats = [
        {"date": row[0], "count": row[1]}
        for row in daily_data
    ]

    # 오류율
    cursor.execute(
        'SELECT COUNT(*) FROM analytics_events WHERE event_type = "error"'
    )
    error_count = cursor.fetchone()[0] or 0

    error_rate = (error_count / max(total_questions, 1)) * 100

    conn.close()

    return AnalyticsStats(
        total_users=total_users,
        total_sessions=total_sessions,
        total_questions=total_questions,
        intent_distribution=intent_distribution,
        service_usage=service_usage,
        popular_keywords=popular_keywords,
        daily_stats=daily_stats,
        error_rate=error_rate
    )


@app.post("/track-event")
async def track_analytics_event(event: AnalyticsEvent):
    """분석 이벤트를 기록합니다."""
    try:
        log_event(event)
        update_user_stats(
            event.user_id, event.session_id, event.event_type, event.data
        )

        logger.info(
            f"Event tracked: {event.event_type} for user {event.user_id}"
        )
        return {"status": "success", "message": "Event tracked successfully"}

    except Exception as e:
        logger.error(f"Event tracking error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Event tracking failed: {str(e)}"
        )


@app.get("/analytics", response_model=AnalyticsStats)
async def get_analytics():
    """전체 분석 통계를 조회합니다."""
    try:
        stats = get_analytics_stats()
        logger.info("Analytics stats retrieved")
        return stats

    except Exception as e:
        logger.error(f"Analytics retrieval error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Analytics retrieval failed: {str(e)}"
        )


@app.get("/user-behavior/{user_id}", response_model=UserBehavior)
async def get_user_behavior(user_id: str):
    """특정 사용자의 행동 패턴을 조회합니다."""
    try:
        db_path = "analytics.db"

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT session_count, question_count, favorite_intent,
                   total_session_duration, last_active
            FROM user_stats WHERE user_id = ?
        ''', (user_id,))

        result = cursor.fetchone()
        conn.close()

        if result:
            (session_count, question_count, favorite_intent,
             total_duration, last_active) = result
            avg_duration = total_duration / max(session_count, 1)

            return UserBehavior(
                user_id=user_id,
                session_count=session_count,
                question_count=question_count,
                favorite_intent=favorite_intent or "unknown",
                avg_session_duration=avg_duration,
                last_active=last_active or datetime.now().isoformat()
            )
        else:
            raise HTTPException(status_code=404, detail="User not found")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User behavior retrieval error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"User behavior retrieval failed: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """헬스체크 엔드포인트"""
    return {
        "status": "healthy",
        "service": "analytics_tracker",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "CORBU.AI Analytics Tracker",
        "version": "1.0.0",
        "description": "사용자 행동 분석 및 통계를 수집합니다.",
        "endpoints": {
            "track_event": "/track-event",
            "analytics": "/analytics",
            "user_behavior": "/user-behavior/{user_id}",
            "health": "/health",
            "docs": "/docs"
        }
    }

# 데이터베이스 초기화
init_database()

if __name__ == "__main__":
    import uvicorn

    _p = int(
        os.environ.get("ANALYTICS_TRACKER_SERVICE_PORT", os.environ.get("PORT", "8004"))
    )
    uvicorn.run(app, host="0.0.0.0", port=_p)
