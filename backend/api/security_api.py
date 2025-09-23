"""
보안 모니터링 API 엔드포인트
"""
import asyncio
import time
import json
import logging
import sqlite3
import threading
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel
import psutil
import random

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 보안 모니터링 데이터베이스
SECURITY_DB = "security_monitor.db"

# 보안 메트릭 모델
class SecurityMetrics(BaseModel):
    threat_level: str
    active_threats: int
    blocked_attempts: int
    vulnerabilities: int
    security_score: float
    last_scan: str
    encryption_status: str
    firewall_status: str
    antivirus_status: str

# 보안 이벤트 모델
class SecurityEvent(BaseModel):
    id: str
    type: str
    severity: str
    title: str
    description: str
    timestamp: str
    source: str
    status: str
    action: str

# 보안 정책 모델
class SecurityPolicy(BaseModel):
    id: str
    name: str
    type: str
    status: str
    description: str
    last_updated: str
    compliance: float

# 감사 로그 모델
class AuditLog(BaseModel):
    id: str
    user: str
    action: str
    resource: str
    timestamp: str
    ip: str
    status: str
    details: str

# 보안 스캔 요청 모델
class SecurityScanRequest(BaseModel):
    scan_type: str = "full"
    target: Optional[str] = None
    options: Optional[Dict[str, Any]] = None

router = APIRouter(prefix="/api/security", tags=["security"])

# 보안 모니터링 데이터베이스 초기화
def init_security_db():
    """보안 모니터링 데이터베이스 초기화"""
    conn = sqlite3.connect(SECURITY_DB)
    cursor = conn.cursor()
    
    # 보안 메트릭 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS security_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            threat_level TEXT,
            active_threats INTEGER,
            blocked_attempts INTEGER,
            vulnerabilities INTEGER,
            security_score REAL,
            encryption_status TEXT,
            firewall_status TEXT,
            antivirus_status TEXT
        )
    ''')
    
    # 보안 이벤트 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS security_events (
            id TEXT PRIMARY KEY,
            type TEXT,
            severity TEXT,
            title TEXT,
            description TEXT,
            timestamp DATETIME,
            source TEXT,
            status TEXT,
            action TEXT
        )
    ''')
    
    # 보안 정책 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS security_policies (
            id TEXT PRIMARY KEY,
            name TEXT,
            type TEXT,
            status TEXT,
            description TEXT,
            last_updated DATETIME,
            compliance REAL
        )
    ''')
    
    # 감사 로그 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            user TEXT,
            action TEXT,
            resource TEXT,
            timestamp DATETIME,
            ip TEXT,
            status TEXT,
            details TEXT
        )
    ''')
    
    # 보안 스캔 히스토리 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scan_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            scan_type TEXT,
            target TEXT,
            status TEXT,
            threats_found INTEGER,
            vulnerabilities_found INTEGER,
            duration REAL,
            details TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# 기본 보안 정책 데이터 삽입
def insert_default_policies():
    """기본 보안 정책 데이터 삽입"""
    conn = sqlite3.connect(SECURITY_DB)
    cursor = conn.cursor()
    
    # 기존 데이터 확인
    cursor.execute("SELECT COUNT(*) FROM security_policies")
    count = cursor.fetchone()[0]
    
    if count == 0:
        default_policies = [
            {
                'id': '1',
                'name': '데이터 암호화 정책',
                'type': 'data',
                'status': 'active',
                'description': '모든 민감한 데이터는 AES-256으로 암호화되어야 합니다.',
                'last_updated': datetime.now().isoformat(),
                'compliance': 98.0
            },
            {
                'id': '2',
                'name': '접근 제어 정책',
                'type': 'access',
                'status': 'active',
                'description': '사용자는 자신의 권한 범위 내에서만 리소스에 접근할 수 있습니다.',
                'last_updated': datetime.now().isoformat(),
                'compliance': 95.0
            },
            {
                'id': '3',
                'name': '네트워크 보안 정책',
                'type': 'network',
                'status': 'active',
                'description': '모든 네트워크 통신은 HTTPS를 통해 암호화되어야 합니다.',
                'last_updated': datetime.now().isoformat(),
                'compliance': 92.0
            },
            {
                'id': '4',
                'name': '시스템 보안 정책',
                'type': 'system',
                'status': 'active',
                'description': '시스템은 정기적인 보안 업데이트를 받아야 합니다.',
                'last_updated': datetime.now().isoformat(),
                'compliance': 88.0
            }
        ]
        
        for policy in default_policies:
            cursor.execute('''
                INSERT INTO security_policies 
                (id, name, type, status, description, last_updated, compliance)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                policy['id'], policy['name'], policy['type'], policy['status'],
                policy['description'], policy['last_updated'], policy['compliance']
            ))
        
        conn.commit()
    
    conn.close()

# 보안 메트릭 수집
def collect_security_metrics() -> Dict[str, Any]:
    """보안 메트릭 수집"""
    try:
        # 위협 레벨 결정
        threat_levels = ['low', 'medium', 'high', 'critical']
        threat_level = random.choice(threat_levels)
        
        # 보안 지표 계산
        active_threats = random.randint(0, 5)
        blocked_attempts = random.randint(10, 100)
        vulnerabilities = random.randint(0, 10)
        
        # 보안 점수 계산
        security_score = 100
        if threat_level == 'critical':
            security_score -= 30
        elif threat_level == 'high':
            security_score -= 20
        elif threat_level == 'medium':
            security_score -= 10
        
        security_score -= active_threats * 5
        security_score -= vulnerabilities * 3
        security_score = max(0, security_score)
        
        # 보안 시스템 상태
        encryption_status = random.choice(['active', 'inactive', 'error'])
        firewall_status = random.choice(['active', 'inactive', 'error'])
        antivirus_status = random.choice(['active', 'inactive', 'error'])
        
        return {
            'threat_level': threat_level,
            'active_threats': active_threats,
            'blocked_attempts': blocked_attempts,
            'vulnerabilities': vulnerabilities,
            'security_score': security_score,
            'last_scan': datetime.now().isoformat(),
            'encryption_status': encryption_status,
            'firewall_status': firewall_status,
            'antivirus_status': antivirus_status,
            'timestamp': datetime.now()
        }
    except Exception as e:
        logger.error(f"보안 메트릭 수집 실패: {e}")
        return {}

# 보안 메트릭 저장
def save_security_metrics(metrics: Dict[str, Any]):
    """보안 메트릭을 데이터베이스에 저장"""
    try:
        conn = sqlite3.connect(SECURITY_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO security_metrics 
            (timestamp, threat_level, active_threats, blocked_attempts, vulnerabilities, 
             security_score, encryption_status, firewall_status, antivirus_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            metrics.get('timestamp', datetime.now()),
            metrics.get('threat_level', 'low'),
            metrics.get('active_threats', 0),
            metrics.get('blocked_attempts', 0),
            metrics.get('vulnerabilities', 0),
            metrics.get('security_score', 100),
            metrics.get('encryption_status', 'active'),
            metrics.get('firewall_status', 'active'),
            metrics.get('antivirus_status', 'active')
        ))
        
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"보안 메트릭 저장 실패: {e}")

# 보안 이벤트 생성
def generate_security_events() -> List[Dict[str, Any]]:
    """보안 이벤트 생성"""
    events = []
    
    # 랜덤 이벤트 생성
    event_types = ['threat', 'vulnerability', 'access', 'system']
    severities = ['low', 'medium', 'high', 'critical']
    statuses = ['active', 'resolved', 'investigating']
    
    for i in range(random.randint(0, 3)):
        event = {
            'id': secrets.token_hex(8),
            'type': random.choice(event_types),
            'severity': random.choice(severities),
            'title': f'보안 이벤트 {i+1}',
            'description': f'보안 관련 이벤트가 감지되었습니다.',
            'timestamp': datetime.now().isoformat(),
            'source': f'192.168.1.{random.randint(100, 200)}',
            'status': random.choice(statuses),
            'action': '자동 차단'
        }
        events.append(event)
    
    return events

# 보안 스캔 실행
def execute_security_scan(scan_type: str, target: Optional[str] = None) -> Dict[str, Any]:
    """보안 스캔 실행"""
    start_time = time.time()
    
    try:
        # 스캔 시뮬레이션
        time.sleep(2)  # 스캔 시간 시뮬레이션
        
        # 스캔 결과 생성
        threats_found = random.randint(0, 5)
        vulnerabilities_found = random.randint(0, 10)
        duration = time.time() - start_time
        
        # 스캔 히스토리 저장
        conn = sqlite3.connect(SECURITY_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO scan_history 
            (timestamp, scan_type, target, status, threats_found, vulnerabilities_found, duration, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            datetime.now(),
            scan_type,
            target or 'system',
            'completed',
            threats_found,
            vulnerabilities_found,
            duration,
            json.dumps({'scan_details': '보안 스캔이 완료되었습니다.'})
        ))
        
        conn.commit()
        conn.close()
        
        return {
            'success': True,
            'scan_type': scan_type,
            'target': target or 'system',
            'threats_found': threats_found,
            'vulnerabilities_found': vulnerabilities_found,
            'duration': duration,
            'status': 'completed'
        }
        
    except Exception as e:
        logger.error(f"보안 스캔 실패: {e}")
        return {
            'success': False,
            'error': str(e)
        }

# 위협 해결
def resolve_threat(threat_id: str) -> Dict[str, Any]:
    """보안 위협 해결"""
    try:
        conn = sqlite3.connect(SECURITY_DB)
        cursor = conn.cursor()
        
        # 위협 상태를 해결됨으로 변경
        cursor.execute('''
            UPDATE security_events 
            SET status = 'resolved', action = '해결됨'
            WHERE id = ?
        ''', (threat_id,))
        
        conn.commit()
        conn.close()
        
        return {
            'success': True,
            'threat_id': threat_id,
            'status': 'resolved',
            'message': '위협이 성공적으로 해결되었습니다.'
        }
        
    except Exception as e:
        logger.error(f"위협 해결 실패: {e}")
        return {
            'success': False,
            'error': str(e)
        }

# 정책 상태 변경
def update_policy_status(policy_id: str, status: str) -> Dict[str, Any]:
    """보안 정책 상태 변경"""
    try:
        conn = sqlite3.connect(SECURITY_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE security_policies 
            SET status = ?, last_updated = ?
            WHERE id = ?
        ''', (status, datetime.now().isoformat(), policy_id))
        
        conn.commit()
        conn.close()
        
        return {
            'success': True,
            'policy_id': policy_id,
            'status': status,
            'message': f'정책 상태가 {status}로 변경되었습니다.'
        }
        
    except Exception as e:
        logger.error(f"정책 상태 변경 실패: {e}")
        return {
            'success': False,
            'error': str(e)
        }

# 감사 로그 생성
def create_audit_log(user: str, action: str, resource: str, ip: str, status: str, details: str = ""):
    """감사 로그 생성"""
    try:
        conn = sqlite3.connect(SECURITY_DB)
        cursor = conn.cursor()
        
        log_id = secrets.token_hex(8)
        cursor.execute('''
            INSERT INTO audit_logs 
            (id, user, action, resource, timestamp, ip, status, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            log_id,
            user,
            action,
            resource,
            datetime.now(),
            ip,
            status,
            details
        ))
        
        conn.commit()
        conn.close()
        
        return log_id
    except Exception as e:
        logger.error(f"감사 로그 생성 실패: {e}")
        return None

# API 엔드포인트들

@router.get("/metrics")
async def get_security_metrics():
    """보안 메트릭 조회"""
    try:
        metrics = collect_security_metrics()
        return {
            "success": True,
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"보안 메트릭 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="보안 메트릭 조회 실패")

@router.get("/events")
async def get_security_events():
    """보안 이벤트 조회"""
    try:
        conn = sqlite3.connect(SECURITY_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, type, severity, title, description, timestamp, source, status, action
            FROM security_events
            ORDER BY timestamp DESC
            LIMIT 100
        ''')
        
        data = cursor.fetchall()
        conn.close()
        
        events = []
        for row in data:
            events.append({
                'id': row[0],
                'type': row[1],
                'severity': row[2],
                'title': row[3],
                'description': row[4],
                'timestamp': row[5],
                'source': row[6],
                'status': row[7],
                'action': row[8]
            })
        
        return {
            "success": True,
            "events": events,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"보안 이벤트 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="보안 이벤트 조회 실패")

@router.get("/policies")
async def get_security_policies():
    """보안 정책 조회"""
    try:
        conn = sqlite3.connect(SECURITY_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, type, status, description, last_updated, compliance
            FROM security_policies
            ORDER BY last_updated DESC
        ''')
        
        data = cursor.fetchall()
        conn.close()
        
        policies = []
        for row in data:
            policies.append({
                'id': row[0],
                'name': row[1],
                'type': row[2],
                'status': row[3],
                'description': row[4],
                'last_updated': row[5],
                'compliance': row[6]
            })
        
        return {
            "success": True,
            "policies": policies,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"보안 정책 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="보안 정책 조회 실패")

@router.get("/audit")
async def get_audit_logs():
    """감사 로그 조회"""
    try:
        conn = sqlite3.connect(SECURITY_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, user, action, resource, timestamp, ip, status, details
            FROM audit_logs
            ORDER BY timestamp DESC
            LIMIT 1000
        ''')
        
        data = cursor.fetchall()
        conn.close()
        
        logs = []
        for row in data:
            logs.append({
                'id': row[0],
                'user': row[1],
                'action': row[2],
                'resource': row[3],
                'timestamp': row[4],
                'ip': row[5],
                'status': row[6],
                'details': row[7]
            })
        
        return {
            "success": True,
            "logs": logs,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"감사 로그 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="감사 로그 조회 실패")

@router.post("/scan")
async def run_security_scan(request: SecurityScanRequest, background_tasks: BackgroundTasks):
    """보안 스캔 실행"""
    try:
        background_tasks.add_task(execute_security_scan, request.scan_type, request.target)
        
        return {
            "success": True,
            "message": "보안 스캔이 시작되었습니다",
            "scan_type": request.scan_type,
            "target": request.target,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"보안 스캔 시작 실패: {e}")
        raise HTTPException(status_code=500, detail="보안 스캔 시작 실패")

@router.post("/threats/{threat_id}/resolve")
async def resolve_threat_endpoint(threat_id: str):
    """보안 위협 해결"""
    try:
        result = resolve_threat(threat_id)
        return {
            "success": result['success'],
            "message": result.get('message', '위협 해결 완료'),
            "threat_id": threat_id,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"위협 해결 실패: {e}")
        raise HTTPException(status_code=500, detail="위협 해결 실패")

@router.put("/policies/{policy_id}")
async def update_policy_endpoint(policy_id: str, status: str):
    """보안 정책 상태 변경"""
    try:
        result = update_policy_status(policy_id, status)
        return {
            "success": result['success'],
            "message": result.get('message', '정책 상태 변경 완료'),
            "policy_id": policy_id,
            "status": status,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"정책 상태 변경 실패: {e}")
        raise HTTPException(status_code=500, detail="정책 상태 변경 실패")

@router.get("/scan/history")
async def get_scan_history():
    """보안 스캔 히스토리 조회"""
    try:
        conn = sqlite3.connect(SECURITY_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT timestamp, scan_type, target, status, threats_found, vulnerabilities_found, duration, details
            FROM scan_history
            ORDER BY timestamp DESC
            LIMIT 50
        ''')
        
        data = cursor.fetchall()
        conn.close()
        
        history = []
        for row in data:
            history.append({
                'timestamp': row[0],
                'scan_type': row[1],
                'target': row[2],
                'status': row[3],
                'threats_found': row[4],
                'vulnerabilities_found': row[5],
                'duration': row[6],
                'details': json.loads(row[7]) if row[7] else {}
            })
        
        return {
            "success": True,
            "history": history,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"스캔 히스토리 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="스캔 히스토리 조회 실패")

@router.get("/health")
async def security_health_check():
    """보안 모니터링 시스템 상태 확인"""
    try:
        metrics = collect_security_metrics()
        
        # 보안 시스템 상태 확인
        conn = sqlite3.connect(SECURITY_DB)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM security_policies WHERE status = 'active'")
        active_policies = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM security_events WHERE status = 'active'")
        active_threats = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            "success": True,
            "status": "healthy",
            "metrics": metrics,
            "active_policies": active_policies,
            "active_threats": active_threats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"보안 시스템 상태 확인 실패: {e}")
        return {
            "success": False,
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# 미들웨어는 main_server.py에서 처리

# 데이터베이스 초기화
init_security_db()
insert_default_policies()

# 백그라운드 보안 모니터링
def background_security_monitoring():
    """백그라운드 보안 모니터링"""
    while True:
        try:
            # 보안 메트릭 수집
            metrics = collect_security_metrics()
            save_security_metrics(metrics)
            
            # 보안 이벤트 생성 (랜덤)
            if random.random() < 0.1:  # 10% 확률로 이벤트 생성
                events = generate_security_events()
                for event in events:
                    conn = sqlite3.connect(SECURITY_DB)
                    cursor = conn.cursor()
                    
                    cursor.execute('''
                        INSERT OR REPLACE INTO security_events 
                        (id, type, severity, title, description, timestamp, source, status, action)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        event['id'], event['type'], event['severity'], event['title'],
                        event['description'], event['timestamp'], event['source'],
                        event['status'], event['action']
                    ))
                    
                    conn.commit()
                    conn.close()
            
            time.sleep(60)  # 1분마다 모니터링
        except Exception as e:
            logger.error(f"백그라운드 보안 모니터링 실패: {e}")
            time.sleep(60)

# 백그라운드 스레드 시작
security_thread = threading.Thread(target=background_security_monitoring, daemon=True)
security_thread.start()

logger.info("보안 모니터링 API가 초기화되었습니다")
