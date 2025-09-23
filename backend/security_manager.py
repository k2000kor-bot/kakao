#!/usr/bin/env python3
"""
CORBU AI 보안 관리 시스템
입력 검증, SQL 인젝션 방지, XSS 방지, Rate Limiting
"""

import re
import time
import hashlib
import secrets
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, validator
import sqlite3
from collections import defaultdict
import html

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Security Manager API",
    description="Security and input validation for CORBU AI",
    version="1.0.0",
)

security = HTTPBearer()

class SecurityEvent(BaseModel):
    event_type: str
    user_id: Optional[str] = None
    ip_address: str
    timestamp: datetime
    details: Dict[str, Any]
    severity: str  # low, medium, high, critical

class RateLimitInfo(BaseModel):
    user_id: str
    ip_address: str
    request_count: int
    window_start: datetime
    blocked: bool

class SecurityStats(BaseModel):
    total_requests: int
    blocked_requests: int
    suspicious_activities: int
    sql_injection_attempts: int
    xss_attempts: int
    rate_limit_hits: int
    last_24h_events: int

# 보안 설정
SECURITY_CONFIG = {
    "rate_limit": {
        "requests_per_minute": 60,
        "requests_per_hour": 1000,
        "requests_per_day": 10000
    },
    "input_validation": {
        "max_message_length": 5000,
        "allowed_characters": r"^[가-힣a-zA-Z0-9\s\.\,\!\?\-\_\(\)\[\]\{\}\:\;\"\'\/\\]+$",
        "blocked_patterns": [
            r"<script.*?>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
            r"union\s+select",
            r"drop\s+table",
            r"delete\s+from",
            r"insert\s+into",
            r"update\s+set",
            r"exec\s*\(",
            r"eval\s*\(",
            r"system\s*\(",
            r"shell_exec",
            r"passthru",
            r"file_get_contents",
            r"fopen",
            r"fwrite"
        ]
    },
    "session": {
        "max_session_duration": 3600,  # 1시간
        "session_cleanup_interval": 300  # 5분
    }
}

# 보안 이벤트 저장소
security_events: List[SecurityEvent] = []
rate_limit_tracker: Dict[str, RateLimitInfo] = {}
security_stats = {
    "total_requests": 0,
    "blocked_requests": 0,
    "suspicious_activities": 0,
    "sql_injection_attempts": 0,
    "xss_attempts": 0,
    "rate_limit_hits": 0
}

def init_security_database():
    """보안 데이터베이스 초기화"""
    conn = sqlite3.connect('security_manager.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS security_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            user_id TEXT,
            ip_address TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            details TEXT NOT NULL,
            severity TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS blocked_ips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip_address TEXT UNIQUE NOT NULL,
            reason TEXT NOT NULL,
            blocked_at TEXT NOT NULL,
            expires_at TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def sanitize_input(text: str) -> str:
    """입력 텍스트 정화"""
    if not text:
        return ""
    
    # HTML 엔티티 이스케이프
    text = html.escape(text)
    
    # SQL 인젝션 패턴 제거
    sql_patterns = [
        r"union\s+select",
        r"drop\s+table",
        r"delete\s+from",
        r"insert\s+into",
        r"update\s+set",
        r"exec\s*\(",
        r"eval\s*\(",
        r"system\s*\(",
        r"shell_exec",
        r"passthru"
    ]
    
    for pattern in sql_patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)
    
    # XSS 패턴 제거
    xss_patterns = [
        r"<script.*?>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"vbscript:",
        r"data:",
        r"<iframe.*?>.*?</iframe>",
        r"<object.*?>.*?</object>",
        r"<embed.*?>",
        r"<link.*?>",
        r"<meta.*?>"
    ]
    
    for pattern in xss_patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)
    
    return text.strip()

def validate_input(text: str) -> Dict[str, Any]:
    """입력 검증"""
    validation_result = {
        "valid": True,
        "errors": [],
        "sanitized_text": text
    }
    
    if not text:
        validation_result["errors"].append("Empty input")
        validation_result["valid"] = False
        return validation_result
    
    # 길이 검증
    if len(text) > SECURITY_CONFIG["input_validation"]["max_message_length"]:
        validation_result["errors"].append(f"Input too long (max {SECURITY_CONFIG['input_validation']['max_message_length']} characters)")
        validation_result["valid"] = False
    
    # 문자 검증
    allowed_pattern = SECURITY_CONFIG["input_validation"]["allowed_characters"]
    if not re.match(allowed_pattern, text):
        validation_result["errors"].append("Contains invalid characters")
        validation_result["valid"] = False
    
    # 차단된 패턴 검사
    for pattern in SECURITY_CONFIG["input_validation"]["blocked_patterns"]:
        if re.search(pattern, text, re.IGNORECASE):
            validation_result["errors"].append(f"Blocked pattern detected: {pattern}")
            validation_result["valid"] = False
    
    # 정화된 텍스트 생성
    validation_result["sanitized_text"] = sanitize_input(text)
    
    return validation_result

def check_rate_limit(user_id: str, ip_address: str) -> bool:
    """Rate Limiting 검사"""
    current_time = datetime.now()
    key = f"{user_id}:{ip_address}"
    
    if key not in rate_limit_tracker:
        rate_limit_tracker[key] = RateLimitInfo(
            user_id=user_id,
            ip_address=ip_address,
            request_count=1,
            window_start=current_time,
            blocked=False
        )
        return True
    
    rate_info = rate_limit_tracker[key]
    
    # 시간 윈도우 확인 (1분)
    if current_time - rate_info.window_start > timedelta(minutes=1):
        rate_info.request_count = 1
        rate_info.window_start = current_time
        rate_info.blocked = False
        return True
    
    # 요청 수 확인
    if rate_info.request_count >= SECURITY_CONFIG["rate_limit"]["requests_per_minute"]:
        rate_info.blocked = True
        security_stats["rate_limit_hits"] += 1
        return False
    
    rate_info.request_count += 1
    return True

def log_security_event(event_type: str, user_id: Optional[str], ip_address: str, 
                      details: Dict[str, Any], severity: str = "medium"):
    """보안 이벤트 로깅"""
    event = SecurityEvent(
        event_type=event_type,
        user_id=user_id,
        ip_address=ip_address,
        timestamp=datetime.now(),
        details=details,
        severity=severity
    )
    
    security_events.append(event)
    
    # 데이터베이스에 저장
    conn = sqlite3.connect('security_manager.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO security_events 
        (event_type, user_id, ip_address, timestamp, details, severity)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        event_type,
        user_id,
        ip_address,
        event.timestamp.isoformat(),
        json.dumps(details),
        severity
    ))
    
    conn.commit()
    conn.close()
    
    logger.warning(f"Security event: {event_type} from {ip_address} - {severity}")

def get_client_ip(request: Request) -> str:
    """클라이언트 IP 주소 추출"""
    # X-Forwarded-For 헤더 확인 (프록시 환경)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    # X-Real-IP 헤더 확인
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # 직접 연결
    return request.client.host if request.client else "unknown"

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "security_manager", "timestamp": datetime.now().isoformat()}

@app.post("/validate/input")
async def validate_user_input(text: str, request: Request):
    """사용자 입력 검증"""
    client_ip = get_client_ip(request)
    security_stats["total_requests"] += 1
    
    # Rate Limiting 검사
    if not check_rate_limit("anonymous", client_ip):
        log_security_event("rate_limit_exceeded", None, client_ip, 
                          {"text_length": len(text)}, "medium")
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    # 입력 검증
    validation_result = validate_input(text)
    
    if not validation_result["valid"]:
        security_stats["blocked_requests"] += 1
        log_security_event("invalid_input", None, client_ip, 
                          {"errors": validation_result["errors"], "original_text": text}, "medium")
        raise HTTPException(status_code=400, detail=f"Invalid input: {', '.join(validation_result['errors'])}")
    
    return {
        "valid": True,
        "sanitized_text": validation_result["sanitized_text"],
        "original_length": len(text),
        "sanitized_length": len(validation_result["sanitized_text"])
    }

@app.post("/validate/message")
async def validate_chat_message(message: str, user_id: str, request: Request):
    """채팅 메시지 검증"""
    client_ip = get_client_ip(request)
    security_stats["total_requests"] += 1
    
    # Rate Limiting 검사
    if not check_rate_limit(user_id, client_ip):
        log_security_event("rate_limit_exceeded", user_id, client_ip, 
                          {"message_length": len(message)}, "medium")
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    # 입력 검증
    validation_result = validate_input(message)
    
    if not validation_result["valid"]:
        security_stats["blocked_requests"] += 1
        log_security_event("invalid_message", user_id, client_ip, 
                          {"errors": validation_result["errors"], "original_message": message}, "high")
        raise HTTPException(status_code=400, detail=f"Invalid message: {', '.join(validation_result['errors'])}")
    
    # SQL 인젝션 시도 감지
    sql_patterns = [r"union\s+select", r"drop\s+table", r"delete\s+from", r"insert\s+into"]
    for pattern in sql_patterns:
        if re.search(pattern, message, re.IGNORECASE):
            security_stats["sql_injection_attempts"] += 1
            log_security_event("sql_injection_attempt", user_id, client_ip, 
                              {"pattern": pattern, "message": message}, "critical")
            raise HTTPException(status_code=400, detail="Potential SQL injection attempt detected")
    
    # XSS 시도 감지
    xss_patterns = [r"<script.*?>", r"javascript:", r"on\w+\s*="]
    for pattern in xss_patterns:
        if re.search(pattern, message, re.IGNORECASE):
            security_stats["xss_attempts"] += 1
            log_security_event("xss_attempt", user_id, client_ip, 
                              {"pattern": pattern, "message": message}, "critical")
            raise HTTPException(status_code=400, detail="Potential XSS attempt detected")
    
    return {
        "valid": True,
        "sanitized_message": validation_result["sanitized_text"],
        "user_id": user_id,
        "ip_address": client_ip
    }

@app.get("/security/stats")
async def get_security_stats():
    """보안 통계 조회"""
    last_24h = datetime.now() - timedelta(hours=24)
    recent_events = [e for e in security_events if e.timestamp > last_24h]
    
    return SecurityStats(
        total_requests=security_stats["total_requests"],
        blocked_requests=security_stats["blocked_requests"],
        suspicious_activities=security_stats["suspicious_activities"],
        sql_injection_attempts=security_stats["sql_injection_attempts"],
        xss_attempts=security_stats["xss_attempts"],
        rate_limit_hits=security_stats["rate_limit_hits"],
        last_24h_events=len(recent_events)
    )

@app.get("/security/events")
async def get_security_events(limit: int = 100, severity: Optional[str] = None):
    """보안 이벤트 조회"""
    filtered_events = security_events
    
    if severity:
        filtered_events = [e for e in filtered_events if e.severity == severity]
    
    filtered_events = filtered_events[-limit:]
    
    return {
        "events": [e.dict() for e in filtered_events],
        "total_count": len(security_events),
        "filtered_count": len(filtered_events)
    }

@app.post("/security/block-ip")
async def block_ip_address(ip_address: str, reason: str, duration_hours: int = 24):
    """IP 주소 차단"""
    expires_at = datetime.now() + timedelta(hours=duration_hours)
    
    conn = sqlite3.connect('security_manager.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT OR REPLACE INTO blocked_ips 
        (ip_address, reason, blocked_at, expires_at)
        VALUES (?, ?, ?, ?)
    ''', (
        ip_address,
        reason,
        datetime.now().isoformat(),
        expires_at.isoformat()
    ))
    
    conn.commit()
    conn.close()
    
    log_security_event("ip_blocked", None, ip_address, 
                      {"reason": reason, "duration_hours": duration_hours}, "high")
    
    return {"status": "blocked", "ip_address": ip_address, "expires_at": expires_at.isoformat()}

@app.get("/security/blocked-ips")
async def get_blocked_ips():
    """차단된 IP 목록 조회"""
    conn = sqlite3.connect('security_manager.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT ip_address, reason, blocked_at, expires_at 
        FROM blocked_ips 
        WHERE expires_at IS NULL OR expires_at > ?
        ORDER BY blocked_at DESC
    ''', (datetime.now().isoformat(),))
    
    blocked_ips = cursor.fetchall()
    conn.close()
    
    return {
        "blocked_ips": [
            {
                "ip_address": row[0],
                "reason": row[1],
                "blocked_at": row[2],
                "expires_at": row[3]
            }
            for row in blocked_ips
        ]
    }

if __name__ == "__main__":
    init_security_database()
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8015)
