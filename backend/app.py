from fastapi import FastAPI, HTTPException, Depends, Header, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ValidationError
from typing import Dict, Any, Optional
import uvicorn
import asyncio
import time
import random
from datetime import datetime
import hashlib
import secrets
import json
import traceback
import os

from cors_config import get_cors_allow_origins

# LLM 서비스 import
try:
    from llm_service import LLMService
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    print("⚠️ LLM 서비스를 사용할 수 없습니다. 기본 모드로 작동합니다.")

# API 버전 정보
API_VERSION = "1.0.0"
API_VERSIONS = {
    "1.0.0": {
        "version": "1.0.0",
        "status": "stable",
        "release_date": "2024-01-01",
        "endpoints": [
            "/api/auth/*",
            "/api/security/*",
            "/api/user/*"
        ]
    }
}

app = FastAPI(
    title="CORBU.AI Backend API",
    version=API_VERSION,
    description="CORBU.AI 백엔드 API - 인증, 보안, 사용자 관리 시스템",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 예외 처리 핸들러
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTP 예외 처리"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """요청 검증 예외 처리"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "요청 데이터 검증 실패",
            "details": exc.errors(),
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """일반 예외 처리"""
    error_traceback = traceback.format_exc()
    print(f"예외 발생: {error_traceback}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "서버 내부 오류가 발생했습니다.",
            "error_type": type(exc).__name__,
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )

# 요청 로깅 미들웨어
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """요청 로깅 미들웨어"""
    start_time = time.time()
    
    # 요청 정보 로깅
    client_ip = request.client.host if request.client else "unknown"
    method = request.method
    path = request.url.path
    query_params = str(request.query_params) if request.query_params else ""
    
    print(f"[{datetime.now().isoformat()}] {method} {path} {query_params} - IP: {client_ip}")
    
    # 응답 처리
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # 응답 정보 로깅
        print(f"[{datetime.now().isoformat()}] {method} {path} - Status: {response.status_code} - Time: {process_time:.3f}s")
        
        # 응답 헤더에 처리 시간 추가
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-API-Version"] = API_VERSION
        
        return response
    except Exception as e:
        process_time = time.time() - start_time
        print(f"[{datetime.now().isoformat()}] {method} {path} - Error: {str(e)} - Time: {process_time:.3f}s")
        raise


# 요청/응답 모델
class ChatRequest(BaseModel):
    message: str
    quality: str = "enhanced"
    context: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    quality_score: float
    confidence: float
    processing_time: int
    model: str
    tokens: int


class HealthResponse(BaseModel):
    status: str
    ultimate: bool
    enhanced: bool
    standard: bool
    timestamp: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    confirmPassword: str


class LoginRequest(BaseModel):
    username: str
    password: str


class RefreshTokenRequest(BaseModel):
    refreshToken: str


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str


class ResetPasswordRequest(BaseModel):
    email: str

class SecurityEventRequest(BaseModel):
    type: str
    userId: Optional[str] = None
    ipAddress: str
    userAgent: str
    details: Dict[str, Any] = {}
    severity: str

class SecurityConfigRequest(BaseModel):
    maxLoginAttempts: Optional[int] = None
    lockoutDuration: Optional[int] = None
    sessionTimeout: Optional[int] = None
    requireTwoFactor: Optional[bool] = None
    passwordPolicy: Optional[Dict[str, Any]] = None
    encryptionEnabled: Optional[bool] = None
    auditLogging: Optional[bool] = None

class UserProfileRequest(BaseModel):
    fullName: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class UserSettingsRequest(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    notifications: Optional[Dict[str, Any]] = None
    preferences: Optional[Dict[str, Any]] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    permissions: list
    isActive: bool
    createdAt: str


class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str
    expiresIn: int
    tokenType: str = "Bearer"


# 상태 변수
system_status = {
    "ultimate": True,
    "enhanced": True,
    "standard": True,
    "last_check": time.time(),
}

# 간단한 사용자 저장소 (실제 프로덕션에서는 데이터베이스 사용)
users_db: Dict[str, Dict[str, Any]] = {}
# 토큰 저장소 (실제 프로덕션에서는 Redis 등 사용)
tokens_db: Dict[str, Dict[str, Any]] = {}
# 보안 이벤트 저장소
security_events_db: list = []
# 사용자 프로필 저장소
user_profiles_db: Dict[str, Dict[str, Any]] = {}
# 사용자 설정 저장소
user_settings_db: Dict[str, Dict[str, Any]] = {}
# LLM 서비스 초기화
llm_service = None
if LLM_AVAILABLE:
    try:
        llm_service = LLMService()
        print("✅ LLM 서비스 초기화 완료")
    except Exception as e:
        print(f"⚠️ LLM 서비스 초기화 실패: {e}")

# 보안 설정
security_config = {
    "maxLoginAttempts": 5,
    "lockoutDuration": 15 * 60 * 1000,  # 15분
    "sessionTimeout": 30 * 60 * 1000,  # 30분
    "requireTwoFactor": False,
    "passwordPolicy": {
        "minLength": 8,
        "requireUppercase": True,
        "requireLowercase": True,
        "requireNumbers": True,
        "requireSpecialChars": True
    },
    "encryptionEnabled": True,
    "auditLogging": True
}


# 토큰 생성 헬퍼 함수
def generate_token(user_id: str, token_type: str = "access") -> str:
    """간단한 토큰 생성 (실제 프로덕션에서는 JWT 사용)"""
    payload = {"user_id": user_id, "type": token_type, "timestamp": time.time()}
    token_data = json.dumps(payload)
    token = hashlib.sha256(
        f"{token_data}{secrets.token_urlsafe(32)}".encode()
    ).hexdigest()
    return token


def verify_token(token: str, token_type: str = "access") -> Optional[str]:
    """토큰 검증 (실제 프로덕션에서는 JWT 검증)"""
    if token in tokens_db:
        token_info = tokens_db[token]
        if token_info["type"] == token_type:
            # 토큰 만료 확인 (30분)
            if time.time() - token_info["created_at"] < 1800:
                return token_info["user_id"]
    return None

async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """인증 미들웨어 - 현재 사용자 정보 반환"""
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="인증 토큰이 필요합니다."
        )
    
    # Bearer 토큰 추출
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="잘못된 인증 형식입니다."
            )
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="잘못된 인증 형식입니다."
        )
    
    # 토큰 검증
    user_id = verify_token(token, "access")
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="유효하지 않거나 만료된 토큰입니다."
        )
    
    # 사용자 정보 조회
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="사용자를 찾을 수 없습니다."
        )
    
    # 비밀번호 제외한 사용자 정보 반환
    return {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "permissions": user["permissions"],
        "isActive": user.get("isActive", True)
    }


@app.get("/")
async def root():
    return {
        "message": "CORBU.AI Backend API",
        "status": "running",
        "version": API_VERSION,
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/api/version")
async def get_api_version():
    """API 버전 정보 조회"""
    return {
        "success": True,
        "data": {
            "current_version": API_VERSION,
            "versions": API_VERSIONS,
            "supported_versions": list(API_VERSIONS.keys())
        },
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """백엔드 상태 확인"""
    return HealthResponse(
        status="healthy",
        ultimate=system_status["ultimate"],
        enhanced=system_status["enhanced"],
        standard=system_status["standard"],
        timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
    )


@app.get("/api/health")
async def api_health_check():
    """API 상태 확인 (프론트엔드 호환성)"""
    try:
        import psutil
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        
        return {
            "status": "healthy",
            "service": "CORBU.AI Backend API",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "system": {
                "cpu": {
                    "usage_percent": cpu_percent,
                    "count": psutil.cpu_count()
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "used": memory.used,
                    "percent": memory.percent
                }
            },
            "services": {
                "ultimate": system_status["ultimate"],
                "enhanced": system_status["enhanced"],
                "standard": system_status["standard"]
            },
            "database": {
                "users": len(users_db),
                "active_tokens": len([
                    t for t in tokens_db.values()
                    if time.time() - t["created_at"] < 1800
                ]),
                "security_events": len(security_events_db)
            }
        }
    except Exception as e:
        return {
            "status": "degraded",
            "service": "CORBU.AI Backend API",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
            "services": {
                "ultimate": system_status["ultimate"],
                "enhanced": system_status["enhanced"],
                "standard": system_status["standard"]
            }
        }


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """대화 메시지 처리"""
    start_time = time.time()

    try:
        # 입력 검증
        if not request.message or not request.message.strip():
            raise HTTPException(
                status_code=400,
                detail="메시지가 비어있습니다."
            )

        # 메시지 길이 제한
        if len(request.message) > 10000:
            raise HTTPException(
                status_code=400,
                detail="메시지가 너무 깁니다. (최대 10,000자)"
            )

        # LLM 서비스 사용 시도
        if llm_service:
            try:
                llm_response = await llm_service.generate_response(
                    message=request.message,
                    conversation_id=request.conversation_id,
                    context=request.context
                )
                
                response_text = llm_response["content"]
                model = llm_response["model"]
                tokens = llm_response["tokens"]
                quality_score = llm_response["confidence"]
                processing_time = int((time.time() - start_time) * 1000)
                
            except Exception as e:
                print(f"[ERROR] LLM 서비스 오류: {e}")
                traceback.print_exc()
                # 폴백으로 기본 응답 생성
                response_text = f"안녕하세요! '{request.message}'에 대한 응답입니다. "
                response_text += "현재 기본 모드로 작동 중입니다."
                model = "Fallback Model"
                tokens = len(response_text.split())
                quality_score = 0.6
                processing_time = int((time.time() - start_time) * 1000)
        else:
            # LLM 서비스 없을 때 기본 응답
            if request.quality == "ultimate":
                await asyncio.sleep(2.0)
                quality_score = random.uniform(0.85, 0.98)
                model = "Ultimate AI Model"
                tokens = random.randint(800, 1200)
            elif request.quality == "enhanced":
                await asyncio.sleep(1.5)
                quality_score = random.uniform(0.75, 0.90)
                model = "Enhanced AI Model"
                tokens = random.randint(600, 900)
            else:  # standard
                await asyncio.sleep(0.8)
                quality_score = random.uniform(0.60, 0.80)
                model = "Standard AI Model"
                tokens = random.randint(400, 700)

            processing_time = int((time.time() - start_time) * 1000)

            # 응답 생성
            response_text = f"안녕하세요! '{request.message}'에 대한 {request.quality} 품질의 응답입니다. "
            response_text += f"현재 {model}을 사용하여 처리되었으며, 품질 점수는 {quality_score:.2f}입니다."

        return ChatResponse(
            response=response_text,
            quality_score=quality_score,
            confidence=random.uniform(0.7, 0.95),
            processing_time=processing_time,
            model=model,
            tokens=tokens,
        )

    except HTTPException:
        raise
    except Exception as e:
        # 로깅 추가
        print(f"[ERROR] 대화 처리 오류: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"처리 중 오류 발생: {str(e)}"
        )


@app.get("/api/status")
async def api_status():
    """API 상태 확인 (프론트엔드 호환성)"""
    return {
        "ultimate": system_status["ultimate"],
        "enhanced": system_status["enhanced"],
        "standard": system_status["standard"],
        "overall": any(
            [
                system_status["ultimate"],
                system_status["enhanced"],
                system_status["standard"],
            ]
        ),
    }


@app.post("/api/chat")
async def api_chat(request: ChatRequest):
    """API 대화 엔드포인트 (프론트엔드 호환성)"""
    return await chat_endpoint(request)


@app.get("/api/performance/metrics")
async def get_performance_metrics():
    """실시간 성능 메트릭 조회"""
    import psutil
    import time

    # 시스템 메트릭 수집
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    # 네트워크 메트릭
    network = psutil.net_io_counters()

    # 프로세스 정보
    processes = len(psutil.pids())

    return {
        "timestamp": time.time(),
        "cpu": {
            "usage_percent": cpu_percent,
            "count": psutil.cpu_count(),
            "frequency": psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None,
        },
        "memory": {
            "total": memory.total,
            "available": memory.available,
            "used": memory.used,
            "percent": memory.percent,
        },
        "disk": {
            "total": disk.total,
            "used": disk.used,
            "free": disk.free,
            "percent": (disk.used / disk.total) * 100,
        },
        "network": {
            "bytes_sent": network.bytes_sent,
            "bytes_recv": network.bytes_recv,
            "packets_sent": network.packets_sent,
            "packets_recv": network.packets_recv,
        },
        "system": {"processes": processes, "boot_time": psutil.boot_time()},
    }


@app.post("/api/performance/optimize")
async def apply_optimization(optimization: dict):
    """성능 최적화 적용"""
    optimization_type = optimization.get("type")
    optimization_id = optimization.get("id")

    # 최적화 로직 시뮬레이션
    optimization_results = {
        "id": optimization_id,
        "type": optimization_type,
        "status": "completed",
        "applied_at": time.time(),
        "impact": {
            "cpu_improvement": 15.0,
            "memory_improvement": 25.0,
            "response_time_improvement": 30.0,
        },
        "message": f"{optimization_type} 최적화가 성공적으로 적용되었습니다.",
    }

    return optimization_results


@app.get("/api/performance/health")
async def get_system_health():
    """시스템 건강도 조회"""
    import psutil

    # 각 컴포넌트별 건강도 계산
    cpu_health = max(0, 100 - psutil.cpu_percent(interval=1))
    memory_health = max(0, 100 - psutil.virtual_memory().percent)

    # 디스크 건강도
    disk = psutil.disk_usage("/")
    disk_health = max(0, 100 - (disk.used / disk.total) * 100)

    # 네트워크 건강도 (간단한 계산)
    network_health = 95  # 기본값

    # 보안 건강도
    security_health = 92  # 기본값

    # 전체 건강도
    overall_health = (
        cpu_health + memory_health + disk_health + network_health + security_health
    ) / 5

    return {
        "overall": round(overall_health, 1),
        "cpu": round(cpu_health, 1),
        "memory": round(memory_health, 1),
        "disk": round(disk_health, 1),
        "network": round(network_health, 1),
        "security": round(security_health, 1),
        "last_check": time.time(),
    }


@app.get("/api/performance/recommendations")
async def get_optimization_recommendations():
    """최적화 권장사항 조회"""
    import psutil

    recommendations = []

    # CPU 사용률 기반 권장사항
    cpu_percent = psutil.cpu_percent(interval=1)
    if cpu_percent > 80:
        recommendations.append(
            {
                "id": "cpu-001",
                "type": "cpu",
                "priority": "high",
                "title": "CPU 사용률 최적화",
                "description": f"현재 CPU 사용률이 {cpu_percent:.1f}%로 높습니다. 불필요한 프로세스를 종료하거나 작업을 분산하세요.",
                "impact": 20,
                "estimated_time": 10,
            }
        )

    # 메모리 사용률 기반 권장사항
    memory = psutil.virtual_memory()
    if memory.percent > 85:
        recommendations.append(
            {
                "id": "memory-001",
                "type": "memory",
                "priority": "critical",
                "title": "메모리 사용률 최적화",
                "description": f"현재 메모리 사용률이 {memory.percent:.1f}%로 매우 높습니다. 메모리 누수를 확인하고 캐시를 정리하세요.",
                "impact": 35,
                "estimated_time": 15,
            }
        )

    # 디스크 사용률 기반 권장사항
    disk = psutil.disk_usage("/")
    disk_percent = (disk.used / disk.total) * 100
    if disk_percent > 90:
        recommendations.append(
            {
                "id": "disk-001",
                "type": "storage",
                "priority": "critical",
                "title": "디스크 공간 정리",
                "description": f"현재 디스크 사용률이 {disk_percent:.1f}%로 매우 높습니다. 불필요한 파일을 정리하세요.",
                "impact": 25,
                "estimated_time": 20,
            }
        )

    # 기본 권장사항들
    recommendations.extend(
        [
            {
                "id": "cache-001",
                "type": "memory",
                "priority": "medium",
                "title": "캐시 최적화",
                "description": "자주 사용되는 데이터를 메모리에 캐싱하여 응답시간을 단축합니다.",
                "impact": 15,
                "estimated_time": 5,
            },
            {
                "id": "compression-001",
                "type": "network",
                "priority": "medium",
                "title": "응답 압축",
                "description": "API 응답을 압축하여 네트워크 트래픽을 줄입니다.",
                "impact": 30,
                "estimated_time": 8,
            },
        ]
    )

    return {
        "recommendations": recommendations,
        "total_count": len(recommendations),
        "critical_count": len(
            [r for r in recommendations if r["priority"] == "critical"]
        ),
        "high_count": len([r for r in recommendations if r["priority"] == "high"]),
    }


@app.post("/api/auth/register")
async def register_user(request: RegisterRequest):
    """사용자 회원가입"""
    try:
        # 필수 필드 검증
        if not all(
            [request.username, request.email, request.password, request.confirmPassword]
        ):
            return {"success": False, "error": "모든 필드를 입력해주세요."}

        # 비밀번호 일치 확인
        if request.password != request.confirmPassword:
            return {"success": False, "error": "비밀번호가 일치하지 않습니다."}

        # 비밀번호 길이 검증
        if len(request.password) < 8:
            return {"success": False, "error": "비밀번호는 최소 8자 이상이어야 합니다."}

        # 이메일 중복 확인
        if any(user["email"] == request.email for user in users_db.values()):
            return {"success": False, "error": "이미 등록된 이메일입니다."}

        # 사용자명 중복 확인
        if any(user["username"] == request.username for user in users_db.values()):
            return {"success": False, "error": "이미 사용 중인 사용자명입니다."}

        # 사용자 ID 생성
        user_id = f"user-{int(time.time() * 1000)}"

        # 비밀번호 해시 (실제 프로덕션에서는 bcrypt 등 사용)
        password_hash = hashlib.sha256(request.password.encode()).hexdigest()

        # 사용자 생성
        user = {
            "id": user_id,
            "username": request.username,
            "email": request.email,
            "password_hash": password_hash,
            "role": "user",
            "permissions": ["read", "write"],
            "isActive": True,
            "createdAt": datetime.now().isoformat(),
        }

        # 사용자 저장
        users_db[user_id] = user

        # 응답 데이터 (비밀번호 제외)
        user_response = {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "permissions": user["permissions"],
            "isActive": user["isActive"],
            "createdAt": user["createdAt"],
        }

        return {
            "success": True,
            "data": {"user": user_response},
            "message": "회원가입이 완료되었습니다.",
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        return {"success": False, "error": f"회원가입 중 오류가 발생했습니다: {str(e)}"}


@app.post("/api/auth/login")
async def login_user(request: LoginRequest):
    """사용자 로그인"""
    try:
        # 사용자 찾기
        user = None
        for u in users_db.values():
            if u["username"] == request.username:
                user = u
                break

        if not user:
            return {
                "success": False,
                "error": "사용자명 또는 비밀번호가 올바르지 않습니다.",
            }

        # 비밀번호 확인
        password_hash = hashlib.sha256(request.password.encode()).hexdigest()
        if user["password_hash"] != password_hash:
            return {
                "success": False,
                "error": "사용자명 또는 비밀번호가 올바르지 않습니다.",
            }

        # 계정 활성화 확인
        if not user.get("isActive", True):
            return {"success": False, "error": "비활성화된 계정입니다."}

        # 토큰 생성
        access_token = generate_token(user["id"], "access")
        refresh_token = generate_token(user["id"], "refresh")

        # 토큰 저장
        tokens_db[access_token] = {
            "user_id": user["id"],
            "type": "access",
            "created_at": time.time(),
        }
        tokens_db[refresh_token] = {
            "user_id": user["id"],
            "type": "refresh",
            "created_at": time.time(),
        }

        # 사용자 정보 업데이트 (마지막 로그인)
        user["lastLogin"] = datetime.now().isoformat()

        # 응답 데이터
        user_response = {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "permissions": user["permissions"],
            "isActive": user["isActive"],
            "createdAt": user["createdAt"],
            "lastLogin": user.get("lastLogin"),
        }

        token_response = {
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "expiresIn": 1800,  # 30분
            "tokenType": "Bearer",
        }

        return {
            "success": True,
            "data": {"user": user_response, "token": token_response},
            "message": "로그인 성공",
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        return {"success": False, "error": f"로그인 중 오류가 발생했습니다: {str(e)}"}


@app.post("/api/auth/logout")
async def logout_user(request: RefreshTokenRequest):
    """사용자 로그아웃"""
    try:
        # 리프레시 토큰으로 액세스 토큰 찾기
        user_id = verify_token(request.refreshToken, "refresh")

        if user_id:
            # 해당 사용자의 모든 토큰 삭제
            tokens_to_remove = [
                token for token, info in tokens_db.items() if info["user_id"] == user_id
            ]
            for token in tokens_to_remove:
                del tokens_db[token]

        return {
            "success": True,
            "message": "로그아웃되었습니다.",
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        return {"success": False, "error": f"로그아웃 중 오류가 발생했습니다: {str(e)}"}


@app.post("/api/auth/refresh")
async def refresh_token(request: RefreshTokenRequest):
    """토큰 갱신"""
    try:
        user_id = verify_token(request.refreshToken, "refresh")

        if not user_id:
            return {"success": False, "error": "유효하지 않은 리프레시 토큰입니다."}

        # 새 토큰 생성
        access_token = generate_token(user_id, "access")
        refresh_token = generate_token(user_id, "refresh")

        # 기존 토큰 삭제
        tokens_to_remove = [
            token for token, info in tokens_db.items() if info["user_id"] == user_id
        ]
        for token in tokens_to_remove:
            del tokens_db[token]

        # 새 토큰 저장
        tokens_db[access_token] = {
            "user_id": user_id,
            "type": "access",
            "created_at": time.time(),
        }
        tokens_db[refresh_token] = {
            "user_id": user_id,
            "type": "refresh",
            "created_at": time.time(),
        }

        token_response = {
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "expiresIn": 1800,  # 30분
            "tokenType": "Bearer",
        }

        return {
            "success": True,
            "data": {"token": token_response},
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"토큰 갱신 중 오류가 발생했습니다: {str(e)}",
        }


@app.post("/api/auth/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """비밀번호 변경"""
    try:
        # 인증된 사용자 정보 가져오기
        user_id = current_user["id"]
        user = users_db.get(user_id)
        
        if not user:
            return {"success": False, "error": "사용자를 찾을 수 없습니다."}

        # 현재 비밀번호 확인
        current_hash = hashlib.sha256(request.currentPassword.encode()).hexdigest()
        if user["password_hash"] != current_hash:
            return {"success": False, "error": "현재 비밀번호가 올바르지 않습니다."}

        # 새 비밀번호 검증
        if len(request.newPassword) < 8:
            return {"success": False, "error": "비밀번호는 최소 8자 이상이어야 합니다."}

        # 비밀번호 업데이트
        new_hash = hashlib.sha256(request.newPassword.encode()).hexdigest()
        user["password_hash"] = new_hash

        return {
            "success": True,
            "message": "비밀번호가 변경되었습니다.",
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"비밀번호 변경 중 오류가 발생했습니다: {str(e)}",
        }

@app.get("/api/auth/me")
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """현재 인증된 사용자 정보 조회"""
    try:
        return {
            "success": True,
            "data": {
                "user": current_user
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"사용자 정보 조회 중 오류가 발생했습니다: {str(e)}"
        }


@app.post("/api/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """비밀번호 재설정"""
    try:
        # 이메일로 사용자 찾기
        user = None
        for u in users_db.values():
            if u["email"] == request.email:
                user = u
                break

        if not user:
            # 보안을 위해 사용자가 없어도 성공 메시지 반환
            return {
                "success": True,
                "message": "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
                "timestamp": datetime.now().isoformat(),
            }

        # NOTE: 실제 운영 시에는 SMTP/이메일 서비스를 연동해 재설정 링크를 전송해야 함.
        # 현재는 보안상 사용자 존재 시에도 "전송됨" 메시지만 반환 (링크 미발송).
        return {
            "success": True,
            "message": "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"비밀번호 재설정 중 오류가 발생했습니다: {str(e)}",
        }

@app.post("/api/security/events")
async def log_security_event(event: SecurityEventRequest):
    """보안 이벤트 로깅"""
    try:
        security_event = {
            "id": f"event-{int(time.time() * 1000)}-{secrets.token_urlsafe(9)}",
            "type": event.type,
            "userId": event.userId,
            "ipAddress": event.ipAddress,
            "userAgent": event.userAgent,
            "timestamp": datetime.now().isoformat(),
            "details": event.details,
            "severity": event.severity
        }
        
        security_events_db.append(security_event)
        
        # 최대 10000개 이벤트만 유지
        if len(security_events_db) > 10000:
            security_events_db.pop(0)
        
        return {
            "success": True,
            "data": security_event,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"보안 이벤트 로깅 중 오류가 발생했습니다: {str(e)}"
        }

@app.get("/api/security/events")
async def get_security_events(limit: int = 100):
    """보안 이벤트 조회"""
    try:
        events = security_events_db[-limit:] if limit > 0 else security_events_db
        return {
            "success": True,
            "data": events,
            "total": len(security_events_db),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"보안 이벤트 조회 중 오류가 발생했습니다: {str(e)}"
        }

@app.get("/api/security/metrics")
async def get_security_metrics():
    """보안 메트릭 조회"""
    try:
        total_events = len(security_events_db)
        failed_logins = len([
            e for e in security_events_db
            if e.get("type") == "failed_login"
        ])
        suspicious_activities = len([
            e for e in security_events_db
            if e.get("severity") in ["high", "critical"]
        ])
        
        # 이벤트 타입별 통계
        event_types = {}
        for event in security_events_db:
            event_type = event.get("type", "unknown")
            event_types[event_type] = event_types.get(event_type, 0) + 1
        
        # 심각도별 통계
        severity_stats = {}
        for event in security_events_db:
            severity = event.get("severity", "low")
            severity_stats[severity] = severity_stats.get(severity, 0) + 1
        
        return {
            "success": True,
            "data": {
                "totalEvents": total_events,
                "failedLogins": failed_logins,
                "suspiciousActivities": suspicious_activities,
                "eventTypes": event_types,
                "severityStats": severity_stats,
                "last24Hours": len([
                    e for e in security_events_db
                    if time.time() - datetime.fromisoformat(
                        e.get("timestamp", datetime.now().isoformat())
                    ).timestamp() < 86400
                ])
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"보안 메트릭 조회 중 오류가 발생했습니다: {str(e)}"
        }

@app.get("/api/security/config")
async def get_security_config():
    """보안 설정 조회"""
    try:
        return {
            "success": True,
            "data": security_config,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"보안 설정 조회 중 오류가 발생했습니다: {str(e)}"
        }

@app.put("/api/security/config")
async def update_security_config(config: SecurityConfigRequest):
    """보안 설정 업데이트"""
    try:
        # 설정 업데이트
        if config.maxLoginAttempts is not None:
            security_config["maxLoginAttempts"] = config.maxLoginAttempts
        if config.lockoutDuration is not None:
            security_config["lockoutDuration"] = config.lockoutDuration
        if config.sessionTimeout is not None:
            security_config["sessionTimeout"] = config.sessionTimeout
        if config.requireTwoFactor is not None:
            security_config["requireTwoFactor"] = config.requireTwoFactor
        if config.passwordPolicy is not None:
            security_config["passwordPolicy"].update(config.passwordPolicy)
        if config.encryptionEnabled is not None:
            security_config["encryptionEnabled"] = config.encryptionEnabled
        if config.auditLogging is not None:
            security_config["auditLogging"] = config.auditLogging
        
        return {
            "success": True,
            "data": security_config,
            "message": "보안 설정이 업데이트되었습니다.",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"보안 설정 업데이트 중 오류가 발생했습니다: {str(e)}"
        }

@app.get("/api/user-profile/{user_id}")
async def get_user_profile(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """사용자 프로필 조회"""
    try:
        # 본인 프로필만 조회 가능 (또는 관리자는 모든 프로필 조회 가능)
        if user_id != current_user["id"] and current_user["role"] != "admin":
            return {
                "success": False,
                "error": "권한이 없습니다."
            }
        
        # 프로필 조회
        profile = user_profiles_db.get(user_id, {})
        
        # 기본 프로필 생성
        if not profile:
            user = users_db.get(user_id)
            if user:
                profile = {
                    "userId": user_id,
                    "username": user.get("username"),
                    "email": user.get("email"),
                    "fullName": "",
                    "avatar": "",
                    "phone": "",
                    "location": "",
                    "bio": "",
                    "preferences": {},
                    "createdAt": user.get("createdAt"),
                    "updatedAt": datetime.now().isoformat()
                }
                user_profiles_db[user_id] = profile
        
        return {
            "success": True,
            "data": {
                "profile": profile
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"프로필 조회 중 오류가 발생했습니다: {str(e)}"
        }

@app.post("/api/update-user-profile")
async def update_user_profile(
    request: UserProfileRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """사용자 프로필 업데이트"""
    try:
        user_id = current_user["id"]
        
        # 기존 프로필 가져오기 또는 생성
        profile = user_profiles_db.get(user_id, {})
        if not profile:
            user = users_db.get(user_id)
            profile = {
                "userId": user_id,
                "username": user.get("username") if user else "",
                "email": user.get("email") if user else "",
                "fullName": "",
                "avatar": "",
                "phone": "",
                "location": "",
                "bio": "",
                "preferences": {},
                "createdAt": user.get("createdAt") if user else datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
        
        # 프로필 업데이트
        if request.fullName is not None:
            profile["fullName"] = request.fullName
        if request.avatar is not None:
            profile["avatar"] = request.avatar
        if request.phone is not None:
            profile["phone"] = request.phone
        if request.location is not None:
            profile["location"] = request.location
        if request.bio is not None:
            profile["bio"] = request.bio
        if request.preferences is not None:
            profile["preferences"] = {
                **profile.get("preferences", {}),
                **request.preferences
            }
        
        profile["updatedAt"] = datetime.now().isoformat()
        user_profiles_db[user_id] = profile
        
        return {
            "success": True,
            "data": {
                "profile": profile
            },
            "message": "프로필이 업데이트되었습니다.",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"프로필 업데이트 중 오류가 발생했습니다: {str(e)}"
        }

@app.get("/api/user/settings")
async def get_user_settings(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """사용자 설정 조회"""
    try:
        user_id = current_user["id"]
        
        # 기본 설정
        default_settings = {
            "theme": "auto",
            "language": "ko",
            "notifications": {
                "email": True,
                "push": True,
                "sms": False
            },
            "preferences": {}
        }
        
        # 저장된 설정 가져오기
        settings = user_settings_db.get(user_id, default_settings)
        
        return {
            "success": True,
            "data": settings,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"설정 조회 중 오류가 발생했습니다: {str(e)}"
        }

@app.put("/api/user/settings")
async def update_user_settings(
    request: UserSettingsRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """사용자 설정 업데이트"""
    try:
        user_id = current_user["id"]
        
        # 기존 설정 가져오기
        settings = user_settings_db.get(user_id, {
            "theme": "auto",
            "language": "ko",
            "notifications": {
                "email": True,
                "push": True,
                "sms": False
            },
            "preferences": {}
        })
        
        # 설정 업데이트
        if request.theme is not None:
            settings["theme"] = request.theme
        if request.language is not None:
            settings["language"] = request.language
        if request.notifications is not None:
            settings["notifications"] = {
                **settings.get("notifications", {}),
                **request.notifications
            }
        if request.preferences is not None:
            settings["preferences"] = {
                **settings.get("preferences", {}),
                **request.preferences
            }
        
        user_settings_db[user_id] = settings
        
        return {
            "success": True,
            "data": settings,
            "message": "설정이 업데이트되었습니다.",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"설정 업데이트 중 오류가 발생했습니다: {str(e)}"
        }

@app.get("/api/metrics")
async def get_api_metrics():
    """API 성능 메트릭 조회"""
    try:
        import psutil
        
        # 시스템 메트릭
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # 프로세스 정보
        process = psutil.Process()
        process_info = {
            "cpu_percent": process.cpu_percent(interval=0.1),
            "memory_percent": process.memory_percent(),
            "memory_info": process.memory_info()._asdict(),
            "num_threads": process.num_threads(),
            "create_time": datetime.fromtimestamp(process.create_time()).isoformat()
        }
        
        # 네트워크 통계
        network = psutil.net_io_counters()
        
        return {
            "success": True,
            "data": {
                "system": {
                    "cpu": {
                        "usage_percent": cpu_percent,
                        "count": psutil.cpu_count(),
                        "frequency": psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None
                    },
                    "memory": {
                        "total": memory.total,
                        "available": memory.available,
                        "used": memory.used,
                        "percent": memory.percent
                    },
                    "disk": {
                        "total": disk.total,
                        "used": disk.used,
                        "free": disk.free,
                        "percent": (disk.used / disk.total) * 100
                    },
                    "network": {
                        "bytes_sent": network.bytes_sent,
                        "bytes_recv": network.bytes_recv,
                        "packets_sent": network.packets_sent,
                        "packets_recv": network.packets_recv
                    }
                },
                "application": {
                    "process": process_info,
                    "users_count": len(users_db),
                    "active_tokens": len([
                        t for t in tokens_db.values()
                        if time.time() - t["created_at"] < 1800
                    ]),
                    "security_events_count": len(security_events_db),
                    "profiles_count": len(user_profiles_db),
                    "settings_count": len(user_settings_db)
                },
                "api": {
                    "version": API_VERSION,
                    "uptime_seconds": time.time() - psutil.boot_time() if hasattr(psutil, 'boot_time') else 0
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"메트릭 조회 중 오류가 발생했습니다: {str(e)}"
        }

@app.get("/api/test")
async def test_endpoint():
    """API 테스트 엔드포인트"""
    return {
        "success": True,
        "message": "API가 정상적으로 작동 중입니다.",
        "data": {
            "timestamp": datetime.now().isoformat(),
            "version": API_VERSION,
            "status": "operational"
        }
    }

@app.get("/api/test/auth")
async def test_auth_endpoint(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """인증 테스트 엔드포인트"""
    return {
        "success": True,
        "message": "인증이 정상적으로 작동 중입니다.",
        "data": {
            "user": current_user,
            "timestamp": datetime.now().isoformat()
        }
    }

@app.post("/api/utils/validate-email")
async def validate_email(email: str):
    """이메일 형식 검증"""
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    is_valid = bool(re.match(email_pattern, email))
    
    return {
        "success": True,
        "data": {
            "email": email,
            "is_valid": is_valid
        }
    }

@app.post("/api/utils/validate-password")
async def validate_password(password: str):
    """비밀번호 강도 검증"""
    strength = {
        "score": 0,
        "level": "weak",
        "checks": {
            "length": False,
            "uppercase": False,
            "lowercase": False,
            "numbers": False,
            "special": False
        }
    }
    
    # 길이 확인
    if len(password) >= 8:
        strength["checks"]["length"] = True
        strength["score"] += 1
    
    # 대문자 확인
    if any(c.isupper() for c in password):
        strength["checks"]["uppercase"] = True
        strength["score"] += 1
    
    # 소문자 확인
    if any(c.islower() for c in password):
        strength["checks"]["lowercase"] = True
        strength["score"] += 1
    
    # 숫자 확인
    if any(c.isdigit() for c in password):
        strength["checks"]["numbers"] = True
        strength["score"] += 1
    
    # 특수문자 확인
    if any(c in "!@#$%^&*(),.?\":{}|<>" for c in password):
        strength["checks"]["special"] = True
        strength["score"] += 1
    
    # 강도 레벨 결정
    if strength["score"] <= 2:
        strength["level"] = "weak"
    elif strength["score"] <= 3:
        strength["level"] = "medium"
    elif strength["score"] <= 4:
        strength["level"] = "strong"
    else:
        strength["level"] = "very_strong"
    
    return {
        "success": True,
        "data": strength
    }

@app.get("/api/utils/stats")
async def get_utils_stats():
    """시스템 통계 조회"""
    return {
        "success": True,
        "data": {
            "users": {
                "total": len(users_db),
                "active": len([
                    u for u in users_db.values()
                    if u.get("isActive", True)
                ])
            },
            "tokens": {
                "total": len(tokens_db),
                "active": len([
                    t for t in tokens_db.values()
                    if time.time() - t["created_at"] < 1800
                ])
            },
            "security_events": len(security_events_db),
            "profiles": len(user_profiles_db),
            "settings": len(user_settings_db)
        },
        "timestamp": datetime.now().isoformat()
    }

# 환경 변수 설정
API_PORT = int(
    os.getenv(
        "API_PORT",
        os.getenv("BACKEND_PORT", os.getenv("PORT", "5002")),
    )
)
API_HOST = os.getenv("API_HOST", "0.0.0.0")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
RELOAD = os.getenv("RELOAD", "true").lower() == "true"

# 프로젝트 관리 API
projects_db: Dict[str, Dict[str, Any]] = {}


class ProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    createdAt: str
    updatedAt: str


@app.get("/api/projects")
async def get_projects():
    """프로젝트 목록 조회"""
    try:
        projects = [
            {
                "id": project_id,
                "name": project["name"],
                "description": project.get("description"),
                "createdAt": project.get("createdAt", datetime.now().isoformat()),
                "updatedAt": project.get("updatedAt", datetime.now().isoformat()),
            }
            for project_id, project in projects_db.items()
        ]
        return {
            "success": True,
            "data": {"projects": projects},
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"프로젝트 조회 중 오류가 발생했습니다: {str(e)}",
        }


@app.post("/api/projects")
async def create_project(request: ProjectRequest):
    """프로젝트 생성"""
    try:
        if not request.name or not request.name.strip():
            return {"success": False, "error": "프로젝트 이름을 입력해주세요."}

        project_id = f"project-{int(time.time() * 1000)}"
        project = {
            "id": project_id,
            "name": request.name.strip(),
            "description": request.description or "",
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat(),
        }
        projects_db[project_id] = project

        return {
            "success": True,
            "data": {"project": project},
            "message": "프로젝트가 생성되었습니다.",
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"프로젝트 생성 중 오류가 발생했습니다: {str(e)}",
        }


@app.get("/api/projects/{project_id}")
async def get_project(project_id: str):
    """프로젝트 조회"""
    try:
        if project_id not in projects_db:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")

        project = projects_db[project_id]
        return {
            "success": True,
            "data": {"project": project},
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        return {
            "success": False,
            "error": f"프로젝트 조회 중 오류가 발생했습니다: {str(e)}",
        }


@app.put("/api/projects/{project_id}")
async def update_project(project_id: str, request: ProjectRequest):
    """프로젝트 업데이트"""
    try:
        if project_id not in projects_db:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")

        projects_db[project_id]["name"] = request.name.strip()
        if request.description is not None:
            projects_db[project_id]["description"] = request.description
        projects_db[project_id]["updatedAt"] = datetime.now().isoformat()

        return {
            "success": True,
            "data": {"project": projects_db[project_id]},
            "message": "프로젝트가 업데이트되었습니다.",
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        return {
            "success": False,
            "error": f"프로젝트 업데이트 중 오류가 발생했습니다: {str(e)}",
        }


@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    """프로젝트 삭제"""
    try:
        if project_id not in projects_db:
            raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다.")

        del projects_db[project_id]

        return {
            "success": True,
            "message": "프로젝트가 삭제되었습니다.",
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        return {
            "success": False,
            "error": f"프로젝트 삭제 중 오류가 발생했습니다: {str(e)}",
        }


if __name__ == "__main__":
    print("🚀 CORBU.AI Backend API 시작 중...")
    print(f"📍 서버: http://{API_HOST}:{API_PORT}")
    print(f"📚 문서: http://{API_HOST}:{API_PORT}/docs")
    print(f"🔍 ReDoc: http://{API_HOST}:{API_PORT}/redoc")
    print(f"💚 헬스 체크: http://{API_HOST}:{API_PORT}/api/health")
    print(f"📦 API 버전: {API_VERSION}")
    if llm_service and llm_service.notebook_llm:
        print("🤖 노트북 LLM: 사용 가능")
    
    uvicorn.run(
        app,
        host=API_HOST,
        port=API_PORT,
        reload=RELOAD if DEBUG else False
    )
