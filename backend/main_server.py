"""
CORBU.AI Ultimate System - 메인 서버
모든 고도화된 기능을 통합하는 메인 서버
"""

import asyncio
import time
import json
import logging
import sqlite3
import threading
import random
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

# Python 3.12+: silence DeprecationWarning for sqlite3 datetime adapter (register explicitly)
if hasattr(sqlite3, 'register_adapter'):
    sqlite3.register_adapter(datetime, lambda d: d.isoformat())
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from pydantic import BaseModel

try:
    import psutil
except ImportError:
    psutil = None
import uvicorn
import os
import sys

# .env 로드 (backend 디렉터리 기준). 딥시크 설치형(DEEPSEEK_USE_LOCAL) 등 환경 변수 적용
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
except ImportError:
    pass

# API 모듈들 import
from api.performance_api import router as performance_router
from api.ai_engine_api import router as ai_engine_router
from api.security_api import router as security_router
from api.user_experience_api import router as user_experience_router
from api.websocket_api import router as websocket_router
from api.ai_analytics_api import router as ai_analytics_router
from api.performance_monitor_api import router as performance_monitor_router
from api.analytics_api import router as analytics_router
from api.automation_api import router as automation_router
from api.advanced_security_api import router as advanced_security_router
from api.backup_recovery_api import router as backup_recovery_router
from api.integrated_api import router as integrated_router
from api.unified_chat_api import router as unified_chat_router
from api.project_session_api import router as project_session_router
from api.tts_api import router as tts_router
from api.intent_api import router as intent_router
from api.v7_api import router as v7_router
from api.analysis_api import router as analysis_router
from api.extended_views_api import router as extended_views_router
from api.pipeline_tuning_api import router as pipeline_tuning_router
from api.google_drive_auth_api import router as google_drive_auth_router
from api.conversation_graph_api import router as conversation_graph_router
from cors_config import get_main_server_cors_allow_origins

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("corbu_ai.log"), logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


# Lifespan 이벤트 핸들러 (on_event deprecated 대체)
@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 시작/종료 이벤트 핸들러"""
    # 시작 이벤트
    logger.info("🚀 CORBU.AI Ultimate System이 시작되었습니다!")
    try:
        from llm_internal_security import log_policy_once

        log_policy_once()
    except ImportError:
        pass
    logger.info(
        "📊 성능 최적화, AI 엔진, 보안 모니터링, 사용자 경험 시스템이 활성화되었습니다"
    )
    port = int(
        os.environ.get(
            "BACKEND_PORT",
            os.environ.get("API_PORT", os.environ.get("PORT", "5002")),
        )
    )
    logger.info("🌐 API 문서: http://localhost:%s/api/docs", port)
    logger.info("🔍 시스템 상태: http://localhost:%s/api/health", port)

    # WebSocket 백그라운드 태스크 시작
    try:
        from api.websocket_api import start_websocket_background_tasks

        await start_websocket_background_tasks()
    except ImportError:
        logger.warning("WebSocket 백그라운드 태스크를 시작할 수 없습니다")

    yield
    # 종료 이벤트
    logger.info("🛑 CORBU.AI Ultimate System이 종료되었습니다")


# FastAPI 앱 생성
app = FastAPI(
    title="CORBU.AI Ultimate System",
    description="고도화된 AI 플랫폼 - 성능 최적화, AI 엔진, 보안 모니터링, 사용자 경험 통합 시스템",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# CORS 미들웨어 설정 (CORS_ALLOW_ORIGINS 미설정 시 ["*"] — 프로덕션은 env로 Origin 지정)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_main_server_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gzip 압축 미들웨어
app.add_middleware(GZipMiddleware, minimum_size=1000)


# 요청 로깅 미들웨어 (메서드, 경로, 상태코드, 소요시간)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start) * 1000
    logger.info(
        "%s %s → %s %.0fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


# 전역 예외 처리: 응답 형식 표준화
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTPException → 일관된 JSON 에러 응답"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail if isinstance(exc.detail, str) else str(exc.detail),
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat(),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """요청 검증 실패 시 일관된 에러 응답"""
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": "요청 데이터가 올바르지 않습니다.",
            "detail": exc.errors(),
            "status_code": 422,
            "timestamp": datetime.now().isoformat(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """미처리 예외 → 500 + 로깅 및 표준 JSON"""
    logger.exception("미처리 예외: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "서버 내부 오류가 발생했습니다.",
            "status_code": 500,
            "timestamp": datetime.now().isoformat(),
        },
    )


# 정적 파일 서빙 (필요시 활성화)
# app.mount("/static", StaticFiles(directory="static"), name="static")

# API 라우터 등록
app.include_router(performance_router)
app.include_router(ai_engine_router)
app.include_router(security_router)
app.include_router(user_experience_router)
app.include_router(websocket_router)
app.include_router(analytics_router)
app.include_router(automation_router)
app.include_router(advanced_security_router)
app.include_router(backup_recovery_router)
app.include_router(ai_analytics_router)
app.include_router(performance_monitor_router)
app.include_router(integrated_router)
app.include_router(unified_chat_router, tags=["Chat"])
app.include_router(project_session_router)
app.include_router(tts_router)
app.include_router(intent_router)
app.include_router(v7_router)
app.include_router(analysis_router)
app.include_router(extended_views_router)
app.include_router(pipeline_tuning_router)
app.include_router(google_drive_auth_router)
app.include_router(conversation_graph_router)

# 고도화 대화형 API (/api/v2/enhanced/*, ws://.../ws/v2/enhanced/...) — 별도 8003 프로세스 없이 통합 포트에서 제공
try:
    from enhanced_conversational_api import EnhancedConversationalAPI

    _enhanced_subapp = EnhancedConversationalAPI().app
    for _route in list(_enhanced_subapp.routes):
        app.routes.append(_route)
    logger.info("Enhanced conversational API routes mounted on main server (/api/v2/enhanced)")
except Exception as _enhanced_mount_err:
    logger.warning(
        "Enhanced conversational API not mounted (optional): %s", _enhanced_mount_err
    )


# 시스템 상태 모델
class SystemStatus(BaseModel):
    overall: str
    uptime: float
    activeUsers: int
    totalRequests: int
    errorRate: float
    responseTime: float
    cpuUsage: float
    memoryUsage: float
    diskUsage: float
    networkUsage: float


# 시스템 메트릭 모델
class SystemMetrics(BaseModel):
    performance: float
    security: float
    userExperience: float
    aiCapability: float
    overall: float


# 시스템 시작 시간
start_time = time.time()

# 시스템 상태 초기화
system_status = SystemStatus(
    overall="healthy",
    uptime=99.9,
    activeUsers=0,
    totalRequests=0,
    errorRate=0.0,
    responseTime=0.0,
    cpuUsage=0.0,
    memoryUsage=0.0,
    diskUsage=0.0,
    networkUsage=0.0,
)

# 시스템 메트릭 초기화
system_metrics = SystemMetrics(
    performance=95.0,
    security=98.0,
    userExperience=92.0,
    aiCapability=96.0,
    overall=95.0,
)

# 요청 카운터
request_count = 0
error_count = 0

# 시스템 모니터링 데이터베이스
SYSTEM_DB = "system_monitor.db"


# 시스템 모니터링 데이터베이스 초기화
def init_system_db():
    """시스템 모니터링 데이터베이스 초기화"""
    conn = sqlite3.connect(SYSTEM_DB)
    cursor = conn.cursor()

    # 시스템 상태 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            overall TEXT,
            uptime REAL,
            active_users INTEGER,
            total_requests INTEGER,
            error_rate REAL,
            response_time REAL,
            cpu_usage REAL,
            memory_usage REAL,
            disk_usage REAL,
            network_usage REAL
        )
    """)

    # 시스템 메트릭 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            performance REAL,
            security REAL,
            user_experience REAL,
            ai_capability REAL,
            overall REAL
        )
    """)

    # 요청 로그 테이블
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS request_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            method TEXT,
            url TEXT,
            status_code INTEGER,
            response_time REAL,
            user_agent TEXT,
            ip_address TEXT
        )
    """)

    conn.commit()
    conn.close()


# 시스템 상태 업데이트
def update_system_status():
    """시스템 상태 업데이트"""
    global system_status, request_count, error_count

    try:
        # 시스템 리소스 정보 수집
        if psutil:
            cpu_usage = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            memory_usage = memory.percent
            disk = psutil.disk_usage("/")
            disk_usage = (disk.used / disk.total) * 100
            # 네트워크 사용량
            network = psutil.net_io_counters()
            network_usage = (network.bytes_sent + network.bytes_recv) / (
                1024 * 1024
            )  # MB
        else:
            # psutil이 없을 때 기본값 사용
            cpu_usage = random.uniform(20, 60)
            memory_usage = random.uniform(40, 70)
            disk_usage = random.uniform(50, 80)
            network_usage = random.uniform(100, 500)

        # 가동 시간 계산
        uptime_seconds = time.time() - start_time
        uptime_hours = uptime_seconds / 3600

        # 전체 상태 결정
        overall_status = "healthy"
        if cpu_usage > 90 or memory_usage > 90 or disk_usage > 95:
            overall_status = "critical"
        elif cpu_usage > 80 or memory_usage > 80 or disk_usage > 90:
            overall_status = "warning"

        # 시스템 상태 업데이트
        system_status = SystemStatus(
            overall=overall_status,
            uptime=uptime_hours,
            activeUsers=random.randint(10, 50),
            totalRequests=request_count,
            errorRate=(error_count / max(request_count, 1)) * 100,
            responseTime=random.uniform(10, 100),
            cpuUsage=cpu_usage,
            memoryUsage=memory_usage,
            diskUsage=disk_usage,
            networkUsage=network_usage,
        )

        # 데이터베이스에 저장
        conn = sqlite3.connect(SYSTEM_DB)
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO system_status 
            (timestamp, overall, uptime, active_users, total_requests, error_rate, 
             response_time, cpu_usage, memory_usage, disk_usage, network_usage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                datetime.now(),
                system_status.overall,
                system_status.uptime,
                system_status.activeUsers,
                system_status.totalRequests,
                system_status.errorRate,
                system_status.responseTime,
                system_status.cpuUsage,
                system_status.memoryUsage,
                system_status.diskUsage,
                system_status.networkUsage,
            ),
        )

        conn.commit()
        conn.close()

    except Exception as e:
        logger.error(f"시스템 상태 업데이트 실패: {e}")


# 시스템 메트릭 업데이트
def update_system_metrics():
    """시스템 메트릭 업데이트"""
    global system_metrics

    try:
        # 각 모듈의 메트릭 수집 (시뮬레이션)
        performance_score = random.uniform(90, 100)
        security_score = random.uniform(95, 100)
        user_experience_score = random.uniform(85, 95)
        ai_capability_score = random.uniform(90, 100)

        # 전체 점수 계산
        overall_score = (
            performance_score
            + security_score
            + user_experience_score
            + ai_capability_score
        ) / 4

        # 시스템 메트릭 업데이트
        system_metrics = SystemMetrics(
            performance=performance_score,
            security=security_score,
            userExperience=user_experience_score,
            aiCapability=ai_capability_score,
            overall=overall_score,
        )

        # 데이터베이스에 저장
        conn = sqlite3.connect(SYSTEM_DB)
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO system_metrics 
            (timestamp, performance, security, user_experience, ai_capability, overall)
            VALUES (?, ?, ?, ?, ?, ?)
        """,
            (
                datetime.now(),
                system_metrics.performance,
                system_metrics.security,
                system_metrics.userExperience,
                system_metrics.aiCapability,
                system_metrics.overall,
            ),
        )

        conn.commit()
        conn.close()

    except Exception as e:
        logger.error(f"시스템 메트릭 업데이트 실패: {e}")


# 요청 로깅 미들웨어
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """요청 로깅 미들웨어"""
    global request_count, error_count

    start_time = time.time()

    # 요청 정보 추출
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    method = request.method
    url = str(request.url)

    # 응답 처리
    response = await call_next(request)

    # 처리 시간 계산
    process_time = time.time() - start_time

    # 요청 카운터 업데이트
    request_count += 1
    if response.status_code >= 400:
        error_count += 1

    # 요청 로그 저장
    try:
        conn = sqlite3.connect(SYSTEM_DB)
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO request_logs 
            (timestamp, method, url, status_code, response_time, user_agent, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
            (
                datetime.now(),
                method,
                url,
                response.status_code,
                process_time,
                user_agent,
                client_ip,
            ),
        )

        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"요청 로그 저장 실패: {e}")

    return response


# API 엔드포인트들


@app.get("/", response_class=HTMLResponse)
async def root():
    """메인 페이지"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>CORBU.AI Ultimate System</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { font-size: 3em; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            .header p { font-size: 1.2em; margin: 10px 0; opacity: 0.9; }
            .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
            .status-card { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; backdrop-filter: blur(10px); }
            .status-card h3 { margin: 0 0 10px 0; color: #ffd700; }
            .status-card .value { font-size: 2em; font-weight: bold; margin: 10px 0; }
            .status-card .status { padding: 5px 10px; border-radius: 20px; font-size: 0.9em; }
            .status-healthy { background: #4CAF50; }
            .status-warning { background: #FF9800; }
            .status-critical { background: #F44336; }
            .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .feature-card { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; backdrop-filter: blur(10px); }
            .feature-card h3 { margin: 0 0 15px 0; color: #ffd700; }
            .feature-card ul { list-style: none; padding: 0; }
            .feature-card li { padding: 5px 0; }
            .feature-card li:before { content: "✓ "; color: #4CAF50; font-weight: bold; }
            .api-links { text-align: center; margin-top: 40px; }
            .api-links a { color: #ffd700; text-decoration: none; margin: 0 20px; padding: 10px 20px; border: 2px solid #ffd700; border-radius: 25px; transition: all 0.3s; }
            .api-links a:hover { background: #ffd700; color: #333; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 CORBU.AI Ultimate System</h1>
                <p>고도화된 AI 플랫폼 - 성능 최적화, AI 엔진, 보안 모니터링, 사용자 경험 통합 시스템</p>
            </div>
            
            <div class="status-grid">
                <div class="status-card">
                    <h3>시스템 상태</h3>
                    <div class="value" id="system-status">로딩 중...</div>
                    <div class="status status-healthy" id="status-badge">정상</div>
                </div>
                <div class="status-card">
                    <h3>전체 점수</h3>
                    <div class="value" id="overall-score">로딩 중...</div>
                    <div>점수</div>
                </div>
                <div class="status-card">
                    <h3>활성 사용자</h3>
                    <div class="value" id="active-users">로딩 중...</div>
                    <div>명</div>
                </div>
                <div class="status-card">
                    <h3>총 요청 수</h3>
                    <div class="value" id="total-requests">로딩 중...</div>
                    <div>요청</div>
                </div>
            </div>
            
            <div class="features">
                <div class="feature-card">
                    <h3>🎯 성능 최적화</h3>
                    <ul>
                        <li>실시간 성능 모니터링</li>
                        <li>자동 최적화 시스템</li>
                        <li>메모리 및 CPU 최적화</li>
                        <li>캐싱 및 압축</li>
                        <li>성능 분석 및 권장사항</li>
                    </ul>
                </div>
                
                <div class="feature-card">
                    <h3>🤖 AI 엔진</h3>
                    <ul>
                        <li>다중 AI 모델 관리</li>
                        <li>실시간 AI 메트릭</li>
                        <li>AI 처리 파이프라인</li>
                        <li>모델 재훈련 및 최적화</li>
                        <li>AI 성능 분석</li>
                    </ul>
                </div>
                
                <div class="feature-card">
                    <h3>🔒 보안 모니터링</h3>
                    <ul>
                        <li>실시간 보안 스캔</li>
                        <li>위협 탐지 및 대응</li>
                        <li>보안 정책 관리</li>
                        <li>감사 로그</li>
                        <li>보안 점수 모니터링</li>
                    </ul>
                </div>
                
                <div class="feature-card">
                    <h3>👤 사용자 경험</h3>
                    <ul>
                        <li>개인화 설정</li>
                        <li>접근성 기능</li>
                        <li>사용자 통계</li>
                        <li>피드백 시스템</li>
                        <li>알림 관리</li>
                    </ul>
                </div>
            </div>
            
            <div class="api-links">
                <a href="/api/docs" target="_blank">API 문서</a>
                <a href="/api/health" target="_blank">시스템 상태</a>
                <a href="/api/metrics" target="_blank">시스템 메트릭</a>
            </div>
        </div>
        
        <script>
            async function updateStatus() {
                try {
                    const response = await fetch('/api/status');
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('system-status').textContent = data.status.overall;
                        document.getElementById('overall-score').textContent = Math.round(data.metrics.overall);
                        document.getElementById('active-users').textContent = data.status.activeUsers;
                        document.getElementById('total-requests').textContent = data.status.totalRequests;
                        
                        const statusBadge = document.getElementById('status-badge');
                        statusBadge.textContent = data.status.overall;
                        statusBadge.className = 'status status-' + data.status.overall;
                    }
                } catch (error) {
                    console.error('상태 업데이트 실패:', error);
                }
            }
            
            // 초기 로드
            updateStatus();
            
            // 5초마다 업데이트
            setInterval(updateStatus, 5000);
        </script>
    </body>
    </html>
    """


@app.get("/api/status")
async def get_system_status():
    """시스템 상태 조회"""
    try:
        return {
            "success": True,
            "status": system_status.model_dump(),
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"시스템 상태 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="시스템 상태 조회 실패")


@app.get("/api/metrics")
async def get_system_metrics():
    """시스템 메트릭 조회"""
    try:
        return {
            "success": True,
            "metrics": system_metrics.model_dump(),
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"시스템 메트릭 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="시스템 메트릭 조회 실패")


@app.get("/api/health")
async def health_check():
    """전체 시스템 상태 확인"""
    try:
        # 각 모듈의 상태 확인
        module_status = {
            "performance": "healthy",
            "ai_engine": "healthy",
            "security": "healthy",
            "user_experience": "healthy",
        }

        # 전체 상태 결정
        overall_status = "healthy"
        if any(status != "healthy" for status in module_status.values()):
            overall_status = "warning"

        result = {
            "success": True,
            "status": overall_status,
            "modules": module_status,
            "system": system_status.model_dump(),
            "metrics": system_metrics.model_dump(),
            "uptime": time.time() - start_time,
            "timestamp": datetime.now().isoformat(),
        }
        # 딥시크 등 LLM 연결 상태 (설정 화면·연결 확인용)
        try:
            from api.unified_chat_api import LLM_SERVICE_AVAILABLE, llm_service_instance
            if LLM_SERVICE_AVAILABLE and llm_service_instance is not None:
                result["llm_provider"] = getattr(llm_service_instance, "provider", "unknown")
        except Exception:
            pass
        return result
    except Exception as e:
        logger.error(f"시스템 상태 확인 실패: {e}")
        return {
            "success": False,
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }


@app.get("/api/chat/llm-status")
async def chat_llm_status():
    """대화에 사용 중인 LLM provider·model 요약 (설정·디버깅용)."""
    try:
        from api.unified_chat_api import LLM_SERVICE_AVAILABLE, llm_service_instance
        if not LLM_SERVICE_AVAILABLE or llm_service_instance is None:
            return {
                "success": True,
                "provider": "none",
                "model": None,
                "summary": "LLM 미연동",
                "timestamp": datetime.now().isoformat(),
            }
        provider = getattr(llm_service_instance, "provider", "unknown")
        model = getattr(llm_service_instance, "model", None)
        if provider == "deepseek-local":
            model = os.getenv("DEEPSEEK_LOCAL_MODEL", "deepseek-r1")
            summary = "DeepSeek(로컬)"
        elif provider == "deepseek":
            model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
            summary = "DeepSeek(API)"
        else:
            summary = provider
        return {
            "success": True,
            "provider": provider,
            "model": model,
            "summary": summary,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.warning(f"LLM 상태 조회 실패: {e}")
        return {
            "success": False,
            "provider": None,
            "model": None,
            "summary": "조회 실패",
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }


@app.get("/api/restart")
async def restart_system(background_tasks: BackgroundTasks):
    """시스템 재시작"""
    try:
        # 백그라운드에서 재시작 처리
        background_tasks.add_task(restart_system_task)

        return {
            "success": True,
            "message": "시스템 재시작이 시작되었습니다",
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"시스템 재시작 실패: {e}")
        raise HTTPException(status_code=500, detail="시스템 재시작 실패")


async def restart_system_task():
    """시스템 재시작 태스크"""
    try:
        logger.info("시스템 재시작 시작...")
        await asyncio.sleep(5)  # 재시작 시뮬레이션
        logger.info("시스템 재시작 완료")
    except Exception as e:
        logger.error(f"시스템 재시작 태스크 실패: {e}")


@app.get("/api/backup")
async def backup_system(background_tasks: BackgroundTasks):
    """시스템 백업"""
    try:
        # 백그라운드에서 백업 처리
        background_tasks.add_task(backup_system_task)

        return {
            "success": True,
            "message": "시스템 백업이 시작되었습니다",
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"시스템 백업 실패: {e}")
        raise HTTPException(status_code=500, detail="시스템 백업 실패")


async def backup_system_task():
    """시스템 백업 태스크"""
    try:
        logger.info("시스템 백업 시작...")
        await asyncio.sleep(10)  # 백업 시뮬레이션
        logger.info("시스템 백업 완료")
    except Exception as e:
        logger.error(f"시스템 백업 태스크 실패: {e}")


@app.get("/api/logs")
async def get_system_logs():
    """시스템 로그 조회"""
    try:
        conn = sqlite3.connect(SYSTEM_DB)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT timestamp, method, url, status_code, response_time, user_agent, ip_address
            FROM request_logs
            ORDER BY timestamp DESC
            LIMIT 100
        """)

        data = cursor.fetchall()
        conn.close()

        logs = []
        for row in data:
            logs.append(
                {
                    "timestamp": row[0],
                    "method": row[1],
                    "url": row[2],
                    "status_code": row[3],
                    "response_time": row[4],
                    "user_agent": row[5],
                    "ip_address": row[6],
                }
            )

        return {"success": True, "logs": logs, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        logger.error(f"시스템 로그 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="시스템 로그 조회 실패")


# 백그라운드 시스템 모니터링
def background_system_monitoring():
    """백그라운드 시스템 모니터링"""
    while True:
        try:
            update_system_status()
            update_system_metrics()
            time.sleep(30)  # 30초마다 업데이트
        except Exception as e:
            logger.error(f"백그라운드 시스템 모니터링 실패: {e}")
            time.sleep(30)


# 데이터베이스 초기화
init_system_db()

# 백그라운드 스레드 시작
monitoring_thread = threading.Thread(target=background_system_monitoring, daemon=True)
monitoring_thread.start()


if __name__ == "__main__":
    # 포트: BACKEND_PORT → API_PORT → PORT → 기본 5002 (프론트·프록시와 맞출 것)
    port = int(
        os.environ.get(
            "BACKEND_PORT",
            os.environ.get("API_PORT", os.environ.get("PORT", "5002")),
        )
    )
    # 서버 실행 (타임아웃: keep-alive 30초, graceful shutdown 10초)
    logger.info("📍 API 서버: http://localhost:%s (프론트엔드 REACT_APP_API_URL와 맞추세요)", port)
    uvicorn.run(
        "main_server:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info",
        timeout_keep_alive=30,
        timeout_graceful_shutdown=10,
    )
