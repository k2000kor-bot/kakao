# backend/api/advanced_security_api.py
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import json
import random
import time
import logging
import hashlib
import secrets
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import jwt
import bcrypt

router = APIRouter()
logger = logging.getLogger(__name__)

# 보안 설정
SECURITY_CONFIG = {
    "encryption_key": Fernet.generate_key(),
    "jwt_secret": secrets.token_urlsafe(32),
    "session_timeout": 3600,  # 1시간
    "max_login_attempts": 5,
    "password_min_length": 8,
    "require_2fa": True,
    "audit_log_retention": 90  # 일
}

class SecurityThreat(BaseModel):
    id: str
    type: str
    severity: str  # low, medium, high, critical
    description: str
    source_ip: str
    user_agent: str
    timestamp: datetime
    status: str  # detected, investigating, resolved, false_positive
    risk_score: float

class SecurityEvent(BaseModel):
    id: str
    event_type: str
    user_id: Optional[str]
    ip_address: str
    user_agent: str
    timestamp: datetime
    details: Dict[str, Any]
    risk_level: str

class EncryptionKey(BaseModel):
    id: str
    name: str
    algorithm: str
    key_size: int
    created_at: datetime
    expires_at: Optional[datetime]
    status: str  # active, expired, revoked
    usage_count: int

class AuditLog(BaseModel):
    id: str
    user_id: Optional[str]
    action: str
    resource: str
    ip_address: str
    user_agent: str
    timestamp: datetime
    success: bool
    details: Dict[str, Any]

# 보안 데이터 저장소
security_threats: Dict[str, SecurityThreat] = {}
security_events: Dict[str, SecurityEvent] = {}
encryption_keys: Dict[str, EncryptionKey] = {}
audit_logs: Dict[str, AuditLog] = {}

# 암호화 키 생성
def generate_encryption_key():
    """새로운 암호화 키 생성"""
    key_id = f"key_{int(time.time())}"
    key = Fernet.generate_key()
    
    encryption_key = EncryptionKey(
        id=key_id,
        name=f"Auto-generated Key {key_id}",
        algorithm="AES-256",
        key_size=256,
        created_at=datetime.now(),
        expires_at=datetime.now() + timedelta(days=365),
        status="active",
        usage_count=0
    )
    
    encryption_keys[key_id] = encryption_key
    return key_id, key

# 초기 암호화 키 생성
initial_key_id, initial_key = generate_encryption_key()

@router.get("/security/threats")
async def get_security_threats(severity: Optional[str] = None, status: Optional[str] = None):
    """보안 위협 조회"""
    try:
        # 시뮬레이션된 위협 데이터 생성
        threat_types = ["SQL Injection", "XSS Attack", "Brute Force", "DDoS", "Malware", "Phishing"]
        severities = ["low", "medium", "high", "critical"]
        statuses = ["detected", "investigating", "resolved", "false_positive"]
        
        threats = []
        for i in range(random.randint(5, 15)):
            threat = SecurityThreat(
                id=f"threat_{i}",
                type=random.choice(threat_types),
                severity=random.choice(severities),
                description=f"Detected {random.choice(threat_types).lower()} attempt from suspicious source",
                source_ip=f"192.168.{random.randint(1, 255)}.{random.randint(1, 255)}",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                timestamp=datetime.now() - timedelta(hours=random.randint(1, 72)),
                status=random.choice(statuses),
                risk_score=round(random.uniform(0.1, 1.0), 2)
            )
            threats.append(threat)
        
        # 필터링
        if severity:
            threats = [t for t in threats if t.severity == severity]
        if status:
            threats = [t for t in threats if t.status == status]
        
        return {
            "success": True,
            "data": {
                "threats": threats,
                "total_count": len(threats),
                "severity_counts": {
                    "critical": len([t for t in threats if t.severity == "critical"]),
                    "high": len([t for t in threats if t.severity == "high"]),
                    "medium": len([t for t in threats if t.severity == "medium"]),
                    "low": len([t for t in threats if t.severity == "low"])
                }
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get security threats error: {e}")
        raise HTTPException(status_code=500, detail="보안 위협 조회 실패")

@router.post("/security/threats/{threat_id}/resolve")
async def resolve_threat(threat_id: str, resolution: Dict[str, Any]):
    """보안 위협 해결"""
    try:
        # 실제 환경에서는 데이터베이스에서 위협 조회 및 업데이트
        threat = SecurityThreat(
            id=threat_id,
            type="Resolved Threat",
            severity="low",
            description="Threat has been resolved",
            source_ip="127.0.0.1",
            user_agent="System",
            timestamp=datetime.now(),
            status="resolved",
            risk_score=0.0
        )
        
        return {
            "success": True,
            "data": threat,
            "message": "보안 위협이 성공적으로 해결되었습니다",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Resolve threat error: {e}")
        raise HTTPException(status_code=500, detail="보안 위협 해결 실패")

@router.get("/security/events")
async def get_security_events(limit: int = 50):
    """보안 이벤트 조회"""
    try:
        event_types = ["login", "logout", "file_access", "api_call", "permission_change", "data_export"]
        risk_levels = ["low", "medium", "high"]
        
        events = []
        for i in range(min(limit, 50)):
            event = SecurityEvent(
                id=f"event_{i}",
                event_type=random.choice(event_types),
                user_id=f"user_{random.randint(1, 100)}" if random.random() > 0.3 else None,
                ip_address=f"10.0.{random.randint(1, 255)}.{random.randint(1, 255)}",
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                timestamp=datetime.now() - timedelta(minutes=random.randint(1, 1440)),
                details={
                    "resource": f"/api/resource_{random.randint(1, 100)}",
                    "method": random.choice(["GET", "POST", "PUT", "DELETE"]),
                    "response_code": random.choice([200, 201, 400, 401, 403, 500])
                },
                risk_level=random.choice(risk_levels)
            )
            events.append(event)
        
        return {
            "success": True,
            "data": {
                "events": events,
                "total_count": len(events),
                "risk_distribution": {
                    "high": len([e for e in events if e.risk_level == "high"]),
                    "medium": len([e for e in events if e.risk_level == "medium"]),
                    "low": len([e for e in events if e.risk_level == "low"])
                }
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get security events error: {e}")
        raise HTTPException(status_code=500, detail="보안 이벤트 조회 실패")

@router.post("/security/encrypt")
async def encrypt_data(data: Dict[str, Any]):
    """데이터 암호화"""
    try:
        # JSON 문자열로 변환
        json_data = json.dumps(data)
        
        # Fernet으로 암호화
        fernet = Fernet(SECURITY_CONFIG["encryption_key"])
        encrypted_data = fernet.encrypt(json_data.encode())
        
        # Base64 인코딩
        encrypted_b64 = base64.b64encode(encrypted_data).decode()
        
        # 암호화 키 사용량 증가
        encryption_keys[initial_key_id].usage_count += 1
        
        return {
            "success": True,
            "data": {
                "encrypted_data": encrypted_b64,
                "key_id": initial_key_id,
                "algorithm": "AES-256",
                "timestamp": datetime.now().isoformat()
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Encrypt data error: {e}")
        raise HTTPException(status_code=500, detail="데이터 암호화 실패")

@router.post("/security/decrypt")
async def decrypt_data(encrypted_data: str, key_id: str):
    """데이터 복호화"""
    try:
        if key_id not in encryption_keys:
            raise HTTPException(status_code=404, detail="암호화 키를 찾을 수 없습니다")
        
        # Base64 디코딩
        encrypted_bytes = base64.b64decode(encrypted_data)
        
        # Fernet으로 복호화
        fernet = Fernet(SECURITY_CONFIG["encryption_key"])
        decrypted_data = fernet.decrypt(encrypted_bytes)
        
        # JSON 파싱
        decrypted_json = json.loads(decrypted_data.decode())
        
        return {
            "success": True,
            "data": decrypted_json,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Decrypt data error: {e}")
        raise HTTPException(status_code=500, detail="데이터 복호화 실패")

@router.get("/security/keys")
async def get_encryption_keys():
    """암호화 키 목록 조회"""
    try:
        return {
            "success": True,
            "data": {
                "keys": list(encryption_keys.values()),
                "total_count": len(encryption_keys),
                "active_count": len([k for k in encryption_keys.values() if k.status == "active"])
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get encryption keys error: {e}")
        raise HTTPException(status_code=500, detail="암호화 키 조회 실패")

@router.post("/security/keys")
async def create_encryption_key(key_config: Dict[str, Any]):
    """새 암호화 키 생성"""
    try:
        key_id, key = generate_encryption_key()
        
        # 사용자 설정 적용
        if "name" in key_config:
            encryption_keys[key_id].name = key_config["name"]
        if "expires_days" in key_config:
            encryption_keys[key_id].expires_at = datetime.now() + timedelta(days=key_config["expires_days"])
        
        return {
            "success": True,
            "data": encryption_keys[key_id],
            "message": "암호화 키가 성공적으로 생성되었습니다",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Create encryption key error: {e}")
        raise HTTPException(status_code=500, detail="암호화 키 생성 실패")

@router.post("/security/hash")
async def hash_password(password: str):
    """비밀번호 해시"""
    try:
        # bcrypt로 해시
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        return {
            "success": True,
            "data": {
                "hashed_password": hashed.decode('utf-8'),
                "algorithm": "bcrypt",
                "salt": salt.decode('utf-8')
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Hash password error: {e}")
        raise HTTPException(status_code=500, detail="비밀번호 해시 실패")

@router.post("/security/verify-password")
async def verify_password(password: str, hashed_password: str):
    """비밀번호 검증"""
    try:
        is_valid = bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
        
        return {
            "success": True,
            "data": {
                "is_valid": is_valid,
                "message": "비밀번호가 일치합니다" if is_valid else "비밀번호가 일치하지 않습니다"
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Verify password error: {e}")
        raise HTTPException(status_code=500, detail="비밀번호 검증 실패")

@router.post("/security/generate-token")
async def generate_jwt_token(payload: Dict[str, Any]):
    """JWT 토큰 생성"""
    try:
        # 만료 시간 설정
        exp_time = datetime.utcnow() + timedelta(seconds=SECURITY_CONFIG["session_timeout"])
        payload["exp"] = exp_time
        payload["iat"] = datetime.utcnow()
        
        # JWT 토큰 생성
        token = jwt.encode(payload, SECURITY_CONFIG["jwt_secret"], algorithm="HS256")
        
        return {
            "success": True,
            "data": {
                "token": token,
                "expires_at": exp_time.isoformat(),
                "algorithm": "HS256"
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Generate JWT token error: {e}")
        raise HTTPException(status_code=500, detail="JWT 토큰 생성 실패")

@router.post("/security/verify-token")
async def verify_jwt_token(token: str):
    """JWT 토큰 검증"""
    try:
        # 토큰 검증
        payload = jwt.decode(token, SECURITY_CONFIG["jwt_secret"], algorithms=["HS256"])
        
        return {
            "success": True,
            "data": {
                "payload": payload,
                "is_valid": True,
                "expires_at": datetime.fromtimestamp(payload["exp"]).isoformat()
            },
            "timestamp": datetime.now().isoformat()
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="토큰이 만료되었습니다")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")
    except Exception as e:
        logger.error(f"Verify JWT token error: {e}")
        raise HTTPException(status_code=500, detail="JWT 토큰 검증 실패")

@router.get("/security/audit-logs")
async def get_audit_logs(user_id: Optional[str] = None, limit: int = 100):
    """감사 로그 조회"""
    try:
        actions = ["login", "logout", "create", "read", "update", "delete", "export", "import"]
        resources = ["user", "document", "report", "system", "api", "database"]
        
        logs = []
        for i in range(min(limit, 100)):
            log = AuditLog(
                id=f"log_{i}",
                user_id=f"user_{random.randint(1, 50)}" if random.random() > 0.2 else None,
                action=random.choice(actions),
                resource=random.choice(resources),
                ip_address=f"172.16.{random.randint(1, 255)}.{random.randint(1, 255)}",
                user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
                timestamp=datetime.now() - timedelta(hours=random.randint(1, 168)),
                success=random.random() > 0.1,
                details={
                    "resource_id": f"res_{random.randint(1, 1000)}",
                    "method": random.choice(["GET", "POST", "PUT", "DELETE"]),
                    "response_code": random.choice([200, 201, 400, 401, 403, 404, 500])
                }
            )
            logs.append(log)
        
        # 필터링
        if user_id:
            logs = [l for l in logs if l.user_id == user_id]
        
        return {
            "success": True,
            "data": {
                "logs": logs,
                "total_count": len(logs),
                "success_count": len([l for l in logs if l.success]),
                "failure_count": len([l for l in logs if not l.success])
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get audit logs error: {e}")
        raise HTTPException(status_code=500, detail="감사 로그 조회 실패")

@router.get("/security/status")
async def get_security_status():
    """보안 시스템 상태 조회"""
    try:
        # 보안 메트릭 계산
        total_threats = len(security_threats)
        active_threats = len([t for t in security_threats.values() if t.status in ["detected", "investigating"]])
        critical_threats = len([t for t in security_threats.values() if t.severity == "critical"])
        
        total_events = len(security_events)
        high_risk_events = len([e for e in security_events.values() if e.risk_level == "high"])
        
        total_logs = len(audit_logs)
        failed_logins = len([l for l in audit_logs.values() if l.action == "login" and not l.success])
        
        # 보안 점수 계산 (0-100)
        security_score = 100
        if critical_threats > 0:
            security_score -= critical_threats * 20
        if high_risk_events > 10:
            security_score -= (high_risk_events - 10) * 2
        if failed_logins > 20:
            security_score -= (failed_logins - 20) * 1
        
        security_score = max(0, security_score)
        
        status = {
            "overall_status": "healthy" if security_score >= 80 else "warning" if security_score >= 60 else "critical",
            "security_score": security_score,
            "threats": {
                "total": total_threats,
                "active": active_threats,
                "critical": critical_threats
            },
            "events": {
                "total": total_events,
                "high_risk": high_risk_events
            },
            "audit": {
                "total_logs": total_logs,
                "failed_logins": failed_logins
            },
            "encryption": {
                "active_keys": len([k for k in encryption_keys.values() if k.status == "active"]),
                "total_keys": len(encryption_keys)
            },
            "recommendations": []
        }
        
        # 권장사항 생성
        if critical_threats > 0:
            status["recommendations"].append("긴급 보안 위협이 감지되었습니다. 즉시 조치가 필요합니다.")
        if high_risk_events > 10:
            status["recommendations"].append("고위험 보안 이벤트가 증가하고 있습니다. 보안 정책을 검토하세요.")
        if failed_logins > 20:
            status["recommendations"].append("로그인 실패가 증가하고 있습니다. 계정 보안을 강화하세요.")
        if security_score < 80:
            status["recommendations"].append("전체 보안 점수가 낮습니다. 보안 시스템을 점검하세요.")
        
        return {
            "success": True,
            "data": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Get security status error: {e}")
        raise HTTPException(status_code=500, detail="보안 상태 조회 실패")

@router.post("/security/scan")
async def run_security_scan(scan_type: str = "full"):
    """보안 스캔 실행"""
    try:
        scan_id = f"scan_{int(time.time())}"
        
        # 스캔 타입별 시뮬레이션
        if scan_type == "full":
            vulnerabilities = random.randint(5, 20)
            threats_detected = random.randint(2, 8)
        elif scan_type == "quick":
            vulnerabilities = random.randint(1, 5)
            threats_detected = random.randint(0, 3)
        else:
            vulnerabilities = random.randint(3, 10)
            threats_detected = random.randint(1, 5)
        
        scan_result = {
            "scan_id": scan_id,
            "scan_type": scan_type,
            "started_at": datetime.now().isoformat(),
            "completed_at": (datetime.now() + timedelta(minutes=random.randint(5, 30))).isoformat(),
            "vulnerabilities_found": vulnerabilities,
            "threats_detected": threats_detected,
            "risk_level": "high" if vulnerabilities > 15 else "medium" if vulnerabilities > 5 else "low",
            "recommendations": [
                "시스템 패치를 최신 상태로 유지하세요",
                "방화벽 규칙을 검토하세요",
                "사용자 권한을 정기적으로 검토하세요",
                "백업 시스템을 점검하세요"
            ]
        }
        
        return {
            "success": True,
            "data": scan_result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Run security scan error: {e}")
        raise HTTPException(status_code=500, detail="보안 스캔 실행 실패")
