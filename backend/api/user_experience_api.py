"""
사용자 경험 관리 API 엔드포인트
"""
import asyncio
import time
import json
import logging
import sqlite3
import threading
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import random

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 사용자 경험 데이터베이스
USER_EXPERIENCE_DB = "user_experience.db"

# 사용자 선호도 모델
class UserPreferences(BaseModel):
    theme: str = "auto"
    language: str = "ko"
    fontSize: int = 14
    animations: bool = True
    sounds: bool = True
    notifications: bool = True
    accessibility: Dict[str, bool] = {
        "highContrast": False,
        "reducedMotion": False,
        "screenReader": False,
        "keyboardNavigation": True
    }
    performance: Dict[str, bool] = {
        "enableCaching": True,
        "enableCompression": True,
        "enableLazyLoading": True,
        "enableVirtualization": True
    }

# 사용자 통계 모델
class UserStats(BaseModel):
    totalSessions: int
    totalTime: int
    favoriteFeatures: List[str]
    achievements: int
    productivity: float
    satisfaction: float

# 사용자 활동 모델
class UserActivity(BaseModel):
    id: str
    type: str
    title: str
    description: str
    timestamp: str
    icon: str
    color: str

# 피드백 모델
class Feedback(BaseModel):
    rating: int
    comment: str
    category: str

# 알림 모델
class Notification(BaseModel):
    id: str
    type: str
    title: str
    message: str
    timestamp: str
    read: bool

router = APIRouter(prefix="/api/user", tags=["user-experience"])

# 사용자 경험 데이터베이스 초기화
def init_user_experience_db():
    """사용자 경험 데이터베이스 초기화"""
    conn = sqlite3.connect(USER_EXPERIENCE_DB)
    cursor = conn.cursor()
    
    # 사용자 선호도 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_preferences (
            user_id TEXT PRIMARY KEY,
            theme TEXT,
            language TEXT,
            font_size INTEGER,
            animations BOOLEAN,
            sounds BOOLEAN,
            notifications BOOLEAN,
            accessibility TEXT,
            performance TEXT,
            last_updated DATETIME
        )
    ''')
    
    # 사용자 통계 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_stats (
            user_id TEXT PRIMARY KEY,
            total_sessions INTEGER,
            total_time INTEGER,
            favorite_features TEXT,
            achievements INTEGER,
            productivity REAL,
            satisfaction REAL,
            last_updated DATETIME
        )
    ''')
    
    # 사용자 활동 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_activities (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            type TEXT,
            title TEXT,
            description TEXT,
            timestamp DATETIME,
            icon TEXT,
            color TEXT
        )
    ''')
    
    # 피드백 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_feedback (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            rating INTEGER,
            comment TEXT,
            category TEXT,
            timestamp DATETIME,
            status TEXT
        )
    ''')
    
    # 알림 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            type TEXT,
            title TEXT,
            message TEXT,
            timestamp DATETIME,
            read BOOLEAN
        )
    ''')
    
    conn.commit()
    conn.close()

# 기본 사용자 데이터 삽입
def insert_default_user_data():
    """기본 사용자 데이터 삽입"""
    conn = sqlite3.connect(USER_EXPERIENCE_DB)
    cursor = conn.cursor()
    
    user_id = "default_user"
    
    # 기본 선호도 설정
    cursor.execute('''
        INSERT OR REPLACE INTO user_preferences 
        (user_id, theme, language, font_size, animations, sounds, notifications, accessibility, performance, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user_id,
        'auto',
        'ko',
        14,
        True,
        True,
        True,
        json.dumps({
            "highContrast": False,
            "reducedMotion": False,
            "screenReader": False,
            "keyboardNavigation": True
        }),
        json.dumps({
            "enableCaching": True,
            "enableCompression": True,
            "enableLazyLoading": True,
            "enableVirtualization": True
        }),
        datetime.now().isoformat()
    ))
    
    # 기본 사용자 통계
    cursor.execute('''
        INSERT OR REPLACE INTO user_stats 
        (user_id, total_sessions, total_time, favorite_features, achievements, productivity, satisfaction, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user_id,
        45,
        1250,
        json.dumps(['AI 분석', '프로젝트 관리', '실시간 협업']),
        12,
        85.0,
        4.5,
        datetime.now().isoformat()
    ))
    
    # 기본 활동 데이터
    activities = [
        {
            'id': secrets.token_hex(8),
            'user_id': user_id,
            'type': 'achievement',
            'title': 'AI 마스터 달성',
            'description': 'AI 분석 기능을 100번 사용했습니다.',
            'timestamp': datetime.now().isoformat(),
            'icon': '🏆',
            'color': 'success'
        },
        {
            'id': secrets.token_hex(8),
            'user_id': user_id,
            'type': 'action',
            'title': '프로젝트 생성',
            'description': '새로운 프로젝트를 생성했습니다.',
            'timestamp': (datetime.now() - timedelta(hours=1)).isoformat(),
            'icon': '📁',
            'color': 'info'
        },
        {
            'id': secrets.token_hex(8),
            'user_id': user_id,
            'type': 'login',
            'title': '로그인',
            'description': '시스템에 로그인했습니다.',
            'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
            'icon': '🔐',
            'color': 'primary'
        }
    ]
    
    for activity in activities:
        cursor.execute('''
            INSERT OR REPLACE INTO user_activities 
            (id, user_id, type, title, description, timestamp, icon, color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            activity['id'], activity['user_id'], activity['type'], activity['title'],
            activity['description'], activity['timestamp'], activity['icon'], activity['color']
        ))
    
    # 기본 알림 데이터
    notifications = [
        {
            'id': secrets.token_hex(8),
            'user_id': user_id,
            'type': 'success',
            'title': '시스템 최적화 완료',
            'message': '성능이 15% 향상되었습니다.',
            'timestamp': datetime.now().isoformat(),
            'read': False
        },
        {
            'id': secrets.token_hex(8),
            'user_id': user_id,
            'type': 'info',
            'title': '새로운 AI 모델 배포',
            'message': 'GPT-4 Enhanced 모델이 업데이트되었습니다.',
            'timestamp': (datetime.now() - timedelta(hours=1)).isoformat(),
            'read': False
        },
        {
            'id': secrets.token_hex(8),
            'user_id': user_id,
            'type': 'warning',
            'title': '보안 스캔 필요',
            'message': '마지막 보안 스캔이 24시간 전입니다.',
            'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
            'read': True
        }
    ]
    
    for notification in notifications:
        cursor.execute('''
            INSERT OR REPLACE INTO notifications 
            (id, user_id, type, title, message, timestamp, read)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            notification['id'], notification['user_id'], notification['type'],
            notification['title'], notification['message'], notification['timestamp'],
            notification['read']
        ))
    
    conn.commit()
    conn.close()

# 사용자 선호도 저장
def save_user_preferences(user_id: str, preferences: Dict[str, Any]) -> bool:
    """사용자 선호도 저장"""
    try:
        conn = sqlite3.connect(USER_EXPERIENCE_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_preferences 
            (user_id, theme, language, font_size, animations, sounds, notifications, accessibility, performance, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            preferences.get('theme', 'auto'),
            preferences.get('language', 'ko'),
            preferences.get('fontSize', 14),
            preferences.get('animations', True),
            preferences.get('sounds', True),
            preferences.get('notifications', True),
            json.dumps(preferences.get('accessibility', {})),
            json.dumps(preferences.get('performance', {})),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"사용자 선호도 저장 실패: {e}")
        return False

# 사용자 선호도 조회
def get_user_preferences(user_id: str) -> Dict[str, Any]:
    """사용자 선호도 조회"""
    try:
        conn = sqlite3.connect(USER_EXPERIENCE_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT theme, language, font_size, animations, sounds, notifications, accessibility, performance
            FROM user_preferences
            WHERE user_id = ?
        ''', (user_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'theme': row[0],
                'language': row[1],
                'fontSize': row[2],
                'animations': bool(row[3]),
                'sounds': bool(row[4]),
                'notifications': bool(row[5]),
                'accessibility': json.loads(row[6]) if row[6] else {},
                'performance': json.loads(row[7]) if row[7] else {}
            }
        else:
            # 기본값 반환
            return {
                'theme': 'auto',
                'language': 'ko',
                'fontSize': 14,
                'animations': True,
                'sounds': True,
                'notifications': True,
                'accessibility': {
                    'highContrast': False,
                    'reducedMotion': False,
                    'screenReader': False,
                    'keyboardNavigation': True
                },
                'performance': {
                    'enableCaching': True,
                    'enableCompression': True,
                    'enableLazyLoading': True,
                    'enableVirtualization': True
                }
            }
    except Exception as e:
        logger.error(f"사용자 선호도 조회 실패: {e}")
        return {}

# 사용자 통계 업데이트
def update_user_stats(user_id: str, stats: Dict[str, Any]) -> bool:
    """사용자 통계 업데이트"""
    try:
        conn = sqlite3.connect(USER_EXPERIENCE_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_stats 
            (user_id, total_sessions, total_time, favorite_features, achievements, productivity, satisfaction, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            stats.get('totalSessions', 0),
            stats.get('totalTime', 0),
            json.dumps(stats.get('favoriteFeatures', [])),
            stats.get('achievements', 0),
            stats.get('productivity', 0.0),
            stats.get('satisfaction', 0.0),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"사용자 통계 업데이트 실패: {e}")
        return False

# 사용자 통계 조회
def get_user_stats(user_id: str) -> Dict[str, Any]:
    """사용자 통계 조회"""
    try:
        conn = sqlite3.connect(USER_EXPERIENCE_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT total_sessions, total_time, favorite_features, achievements, productivity, satisfaction
            FROM user_stats
            WHERE user_id = ?
        ''', (user_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'totalSessions': row[0],
                'totalTime': row[1],
                'favoriteFeatures': json.loads(row[2]) if row[2] else [],
                'achievements': row[3],
                'productivity': row[4],
                'satisfaction': row[5]
            }
        else:
            # 기본값 반환
            return {
                'totalSessions': 0,
                'totalTime': 0,
                'favoriteFeatures': [],
                'achievements': 0,
                'productivity': 0.0,
                'satisfaction': 0.0
            }
    except Exception as e:
        logger.error(f"사용자 통계 조회 실패: {e}")
        return {}

# 피드백 저장
def save_feedback(user_id: str, feedback: Dict[str, Any]) -> bool:
    """사용자 피드백 저장"""
    try:
        conn = sqlite3.connect(USER_EXPERIENCE_DB)
        cursor = conn.cursor()
        
        feedback_id = secrets.token_hex(8)
        cursor.execute('''
            INSERT INTO user_feedback 
            (id, user_id, rating, comment, category, timestamp, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            feedback_id,
            user_id,
            feedback.get('rating', 0),
            feedback.get('comment', ''),
            feedback.get('category', 'general'),
            datetime.now(),
            'pending'
        ))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"피드백 저장 실패: {e}")
        return False

# 알림 조회
def get_notifications(user_id: str) -> List[Dict[str, Any]]:
    """사용자 알림 조회"""
    try:
        conn = sqlite3.connect(USER_EXPERIENCE_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, type, title, message, timestamp, read
            FROM notifications
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT 100
        ''', (user_id,))
        
        data = cursor.fetchall()
        conn.close()
        
        notifications = []
        for row in data:
            notifications.append({
                'id': row[0],
                'type': row[1],
                'title': row[2],
                'message': row[3],
                'timestamp': row[4],
                'read': bool(row[5])
            })
        
        return notifications
    except Exception as e:
        logger.error(f"알림 조회 실패: {e}")
        return []

# 알림 읽음 처리
def mark_notification_read(user_id: str, notification_id: str) -> bool:
    """알림 읽음 처리"""
    try:
        conn = sqlite3.connect(USER_EXPERIENCE_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE notifications 
            SET read = 1
            WHERE id = ? AND user_id = ?
        ''', (notification_id, user_id))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"알림 읽음 처리 실패: {e}")
        return False

# 모든 알림 읽음 처리
def mark_all_notifications_read(user_id: str) -> bool:
    """모든 알림 읽음 처리"""
    try:
        conn = sqlite3.connect(USER_EXPERIENCE_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE notifications 
            SET read = 1
            WHERE user_id = ?
        ''', (user_id,))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"모든 알림 읽음 처리 실패: {e}")
        return False

# 사용자 활동 조회
def get_user_activities(user_id: str) -> List[Dict[str, Any]]:
    """사용자 활동 조회"""
    try:
        conn = sqlite3.connect(USER_EXPERIENCE_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, type, title, description, timestamp, icon, color
            FROM user_activities
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT 100
        ''', (user_id,))
        
        data = cursor.fetchall()
        conn.close()
        
        activities = []
        for row in data:
            activities.append({
                'id': row[0],
                'type': row[1],
                'title': row[2],
                'description': row[3],
                'timestamp': row[4],
                'icon': row[5],
                'color': row[6]
            })
        
        return activities
    except Exception as e:
        logger.error(f"사용자 활동 조회 실패: {e}")
        return []

# API 엔드포인트들

@router.get("/preferences")
async def get_user_preferences_endpoint(user_id: str = "default_user"):
    """사용자 선호도 조회"""
    try:
        preferences = get_user_preferences(user_id)
        return {
            "success": True,
            "preferences": preferences,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"사용자 선호도 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="사용자 선호도 조회 실패")

@router.put("/preferences")
async def update_user_preferences_endpoint(
    preferences: UserPreferences,
    user_id: str = "default_user"
):
    """사용자 선호도 업데이트"""
    try:
        success = save_user_preferences(user_id, preferences.dict())
        if success:
            return {
                "success": True,
                "message": "선호도가 업데이트되었습니다",
                "preferences": preferences.dict(),
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail="선호도 업데이트 실패")
    except Exception as e:
        logger.error(f"사용자 선호도 업데이트 실패: {e}")
        raise HTTPException(status_code=500, detail="사용자 선호도 업데이트 실패")

@router.get("/stats")
async def get_user_stats_endpoint(user_id: str = "default_user"):
    """사용자 통계 조회"""
    try:
        stats = get_user_stats(user_id)
        return {
            "success": True,
            "stats": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"사용자 통계 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="사용자 통계 조회 실패")

@router.put("/stats")
async def update_user_stats_endpoint(
    stats: UserStats,
    user_id: str = "default_user"
):
    """사용자 통계 업데이트"""
    try:
        success = update_user_stats(user_id, stats.dict())
        if success:
            return {
                "success": True,
                "message": "통계가 업데이트되었습니다",
                "stats": stats.dict(),
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail="통계 업데이트 실패")
    except Exception as e:
        logger.error(f"사용자 통계 업데이트 실패: {e}")
        raise HTTPException(status_code=500, detail="사용자 통계 업데이트 실패")

@router.post("/feedback")
async def submit_feedback_endpoint(
    feedback: Feedback,
    user_id: str = "default_user"
):
    """사용자 피드백 제출"""
    try:
        success = save_feedback(user_id, feedback.dict())
        if success:
            return {
                "success": True,
                "message": "피드백이 제출되었습니다",
                "feedback": feedback.dict(),
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail="피드백 제출 실패")
    except Exception as e:
        logger.error(f"피드백 제출 실패: {e}")
        raise HTTPException(status_code=500, detail="피드백 제출 실패")

@router.get("/notifications")
async def get_notifications_endpoint(user_id: str = "default_user"):
    """사용자 알림 조회"""
    try:
        notifications = get_notifications(user_id)
        return {
            "success": True,
            "notifications": notifications,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"알림 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="알림 조회 실패")

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read_endpoint(
    notification_id: str,
    user_id: str = "default_user"
):
    """알림 읽음 처리"""
    try:
        success = mark_notification_read(user_id, notification_id)
        if success:
            return {
                "success": True,
                "message": "알림이 읽음 처리되었습니다",
                "notification_id": notification_id,
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail="알림 읽음 처리 실패")
    except Exception as e:
        logger.error(f"알림 읽음 처리 실패: {e}")
        raise HTTPException(status_code=500, detail="알림 읽음 처리 실패")

@router.put("/notifications/read-all")
async def mark_all_notifications_read_endpoint(user_id: str = "default_user"):
    """모든 알림 읽음 처리"""
    try:
        success = mark_all_notifications_read(user_id)
        if success:
            return {
                "success": True,
                "message": "모든 알림이 읽음 처리되었습니다",
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail="모든 알림 읽음 처리 실패")
    except Exception as e:
        logger.error(f"모든 알림 읽음 처리 실패: {e}")
        raise HTTPException(status_code=500, detail="모든 알림 읽음 처리 실패")

@router.get("/activities")
async def get_user_activities_endpoint(user_id: str = "default_user"):
    """사용자 활동 조회"""
    try:
        activities = get_user_activities(user_id)
        return {
            "success": True,
            "activities": activities,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"사용자 활동 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="사용자 활동 조회 실패")

@router.get("/health")
async def user_experience_health_check():
    """사용자 경험 시스템 상태 확인"""
    try:
        # 기본 사용자 데이터 확인
        conn = sqlite3.connect(USER_EXPERIENCE_DB)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM user_preferences")
        preferences_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM user_stats")
        stats_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM notifications")
        notifications_count = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "success": True,
            "status": "healthy",
            "preferences_count": preferences_count,
            "stats_count": stats_count,
            "notifications_count": notifications_count,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"사용자 경험 시스템 상태 확인 실패: {e}")
        return {
            "success": False,
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# 데이터베이스 초기화
init_user_experience_db()
insert_default_user_data()

logger.info("사용자 경험 API가 초기화되었습니다")
