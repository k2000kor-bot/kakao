from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import asyncio
import time
import random

app = FastAPI(title="CORBU AI Backend API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 요청/응답 모델
class ChatRequest(BaseModel):
    message: str
    quality: str = "enhanced"
    context: Optional[Dict[str, Any]] = None

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

# 상태 변수
system_status = {
    "ultimate": True,
    "enhanced": True,
    "standard": True,
    "last_check": time.time()
}

@app.get("/")
async def root():
    return {"message": "CORBU AI Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    """백엔드 상태 확인"""
    return HealthResponse(
        status="healthy",
        ultimate=system_status["ultimate"],
        enhanced=system_status["enhanced"],
        standard=system_status["standard"],
        timestamp=time.strftime("%Y-%m-%d %H:%M:%S")
    )

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """채팅 메시지 처리"""
    start_time = time.time()
    
    try:
        # 품질별 처리 시간 시뮬레이션
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
            tokens=tokens
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"처리 중 오류 발생: {str(e)}")

@app.get("/api/status")
async def api_status():
    """API 상태 확인 (프론트엔드 호환성)"""
    return {
        "ultimate": system_status["ultimate"],
        "enhanced": system_status["enhanced"],
        "standard": system_status["standard"],
        "overall": any([system_status["ultimate"], system_status["enhanced"], system_status["standard"]])
    }

@app.post("/api/chat")
async def api_chat(request: ChatRequest):
    """API 채팅 엔드포인트 (프론트엔드 호환성)"""
    return await chat_endpoint(request)

@app.get("/api/performance/metrics")
async def get_performance_metrics():
    """실시간 성능 메트릭 조회"""
    import psutil
    import time
    
    # 시스템 메트릭 수집
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # 네트워크 메트릭
    network = psutil.net_io_counters()
    
    # 프로세스 정보
    processes = len(psutil.pids())
    
    return {
        "timestamp": time.time(),
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
        },
        "system": {
            "processes": processes,
            "boot_time": psutil.boot_time()
        }
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
            "response_time_improvement": 30.0
        },
        "message": f"{optimization_type} 최적화가 성공적으로 적용되었습니다."
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
    disk = psutil.disk_usage('/')
    disk_health = max(0, 100 - (disk.used / disk.total) * 100)
    
    # 네트워크 건강도 (간단한 계산)
    network_health = 95  # 기본값
    
    # 보안 건강도
    security_health = 92  # 기본값
    
    # 전체 건강도
    overall_health = (cpu_health + memory_health + disk_health + network_health + security_health) / 5
    
    return {
        "overall": round(overall_health, 1),
        "cpu": round(cpu_health, 1),
        "memory": round(memory_health, 1),
        "disk": round(disk_health, 1),
        "network": round(network_health, 1),
        "security": round(security_health, 1),
        "last_check": time.time()
    }

@app.get("/api/performance/recommendations")
async def get_optimization_recommendations():
    """최적화 권장사항 조회"""
    import psutil
    
    recommendations = []
    
    # CPU 사용률 기반 권장사항
    cpu_percent = psutil.cpu_percent(interval=1)
    if cpu_percent > 80:
        recommendations.append({
            "id": "cpu-001",
            "type": "cpu",
            "priority": "high",
            "title": "CPU 사용률 최적화",
            "description": f"현재 CPU 사용률이 {cpu_percent:.1f}%로 높습니다. 불필요한 프로세스를 종료하거나 작업을 분산하세요.",
            "impact": 20,
            "estimated_time": 10
        })
    
    # 메모리 사용률 기반 권장사항
    memory = psutil.virtual_memory()
    if memory.percent > 85:
        recommendations.append({
            "id": "memory-001",
            "type": "memory",
            "priority": "critical",
            "title": "메모리 사용률 최적화",
            "description": f"현재 메모리 사용률이 {memory.percent:.1f}%로 매우 높습니다. 메모리 누수를 확인하고 캐시를 정리하세요.",
            "impact": 35,
            "estimated_time": 15
        })
    
    # 디스크 사용률 기반 권장사항
    disk = psutil.disk_usage('/')
    disk_percent = (disk.used / disk.total) * 100
    if disk_percent > 90:
        recommendations.append({
            "id": "disk-001",
            "type": "storage",
            "priority": "critical",
            "title": "디스크 공간 정리",
            "description": f"현재 디스크 사용률이 {disk_percent:.1f}%로 매우 높습니다. 불필요한 파일을 정리하세요.",
            "impact": 25,
            "estimated_time": 20
        })
    
    # 기본 권장사항들
    recommendations.extend([
        {
            "id": "cache-001",
            "type": "memory",
            "priority": "medium",
            "title": "캐시 최적화",
            "description": "자주 사용되는 데이터를 메모리에 캐싱하여 응답시간을 단축합니다.",
            "impact": 15,
            "estimated_time": 5
        },
        {
            "id": "compression-001",
            "type": "network",
            "priority": "medium",
            "title": "응답 압축",
            "description": "API 응답을 압축하여 네트워크 트래픽을 줄입니다.",
            "impact": 30,
            "estimated_time": 8
        }
    ])
    
    return {
        "recommendations": recommendations,
        "total_count": len(recommendations),
        "critical_count": len([r for r in recommendations if r["priority"] == "critical"]),
        "high_count": len([r for r in recommendations if r["priority"] == "high"])
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004, reload=True)
