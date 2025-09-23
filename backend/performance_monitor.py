#!/usr/bin/env python3
"""
CORBU AI 성능 모니터링 시스템
실시간 성능 지표 수집 및 최적화 제안
"""

import psutil
import time
import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import threading
from collections import defaultdict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Performance Monitor API",
    description="Real-time performance monitoring for CORBU AI system",
    version="1.0.0",
)

class PerformanceMetrics(BaseModel):
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    disk_usage_percent: float
    network_io: Dict[str, int]
    active_connections: int
    response_times: Dict[str, float]
    error_rate: float
    requests_per_minute: int

class ServiceHealth(BaseModel):
    service_name: str
    port: int
    status: str
    response_time: float
    memory_usage_mb: float
    cpu_usage_percent: float
    last_check: datetime

# 성능 데이터 저장소
performance_data: List[PerformanceMetrics] = []
service_health_data: Dict[str, ServiceHealth] = {}
request_counts = defaultdict(int)
response_times = defaultdict(list)

# 데이터베이스 초기화
def init_database():
    conn = sqlite3.connect('performance_monitor.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS performance_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            cpu_percent REAL NOT NULL,
            memory_percent REAL NOT NULL,
            memory_used_mb REAL NOT NULL,
            disk_usage_percent REAL NOT NULL,
            network_io_sent INTEGER NOT NULL,
            network_io_recv INTEGER NOT NULL,
            active_connections INTEGER NOT NULL,
            avg_response_time REAL NOT NULL,
            error_rate REAL NOT NULL,
            requests_per_minute INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS service_health (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_name TEXT NOT NULL,
            port INTEGER NOT NULL,
            status TEXT NOT NULL,
            response_time REAL NOT NULL,
            memory_usage_mb REAL NOT NULL,
            cpu_usage_percent REAL NOT NULL,
            last_check TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def collect_system_metrics() -> PerformanceMetrics:
    """시스템 성능 지표 수집"""
    try:
        # CPU 사용률
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # 메모리 사용률
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        memory_used_mb = memory.used / (1024 * 1024)
        
        # 디스크 사용률
        disk = psutil.disk_usage('/')
        disk_usage_percent = (disk.used / disk.total) * 100
        
        # 네트워크 I/O
        network_io = psutil.net_io_counters()
        
        # 활성 연결 수
        connections = len(psutil.net_connections())
        
        # 평균 응답 시간 계산
        avg_response_time = 0
        if response_times:
            all_times = []
            for times in response_times.values():
                all_times.extend(times)
            if all_times:
                avg_response_time = sum(all_times) / len(all_times)
        
        # 오류율 계산 (간단한 구현)
        error_rate = 0.0  # 실제로는 로그에서 계산
        
        # 분당 요청 수
        current_time = datetime.now()
        minute_ago = current_time - timedelta(minutes=1)
        requests_per_minute = sum(1 for timestamp in request_counts.keys() 
                                if datetime.fromisoformat(timestamp) > minute_ago)
        
        return PerformanceMetrics(
            timestamp=current_time,
            cpu_percent=cpu_percent,
            memory_percent=memory_percent,
            memory_used_mb=memory_used_mb,
            disk_usage_percent=disk_usage_percent,
            network_io={
                "sent": network_io.bytes_sent,
                "recv": network_io.bytes_recv
            },
            active_connections=connections,
            response_times={k: sum(v)/len(v) if v else 0 for k, v in response_times.items()},
            error_rate=error_rate,
            requests_per_minute=requests_per_minute
        )
    except Exception as e:
        logger.error(f"Error collecting system metrics: {e}")
        return None

def check_service_health(service_name: str, port: int) -> ServiceHealth:
    """개별 서비스 상태 확인"""
    try:
        start_time = time.time()
        response = requests.get(f"http://localhost:{port}/health", timeout=5)
        response_time = (time.time() - start_time) * 1000  # ms
        
        if response.status_code == 200:
            status = "healthy"
        else:
            status = "unhealthy"
            
        # 프로세스 정보 수집 (간단한 구현)
        memory_usage_mb = 0
        cpu_usage_percent = 0
        
        return ServiceHealth(
            service_name=service_name,
            port=port,
            status=status,
            response_time=response_time,
            memory_usage_mb=memory_usage_mb,
            cpu_usage_percent=cpu_usage_percent,
            last_check=datetime.now()
        )
    except Exception as e:
        logger.error(f"Error checking service {service_name}: {e}")
        return ServiceHealth(
            service_name=service_name,
            port=port,
            status="error",
            response_time=999.0,
            memory_usage_mb=0,
            cpu_usage_percent=0,
            last_check=datetime.now()
        )

def background_monitoring():
    """백그라운드 모니터링 스레드"""
    services = [
        ("intent_classifier", 8000),
        ("context_manager", 8003),
        ("analytics_tracker", 8004),
        ("apartment_community_analyzer", 8005),
        ("construction_company_info", 8006),
        ("market_analysis_engine", 8007),
        ("dream_visualization", 8008)
    ]
    
    while True:
        try:
            # 시스템 메트릭 수집
            metrics = collect_system_metrics()
            if metrics:
                performance_data.append(metrics)
                
                # 최근 100개 데이터만 유지
                if len(performance_data) > 100:
                    performance_data.pop(0)
            
            # 서비스 상태 확인
            for service_name, port in services:
                health = check_service_health(service_name, port)
                service_health_data[service_name] = health
            
            # 데이터베이스에 저장
            save_metrics_to_db(metrics)
            
            time.sleep(30)  # 30초마다 수집
        except Exception as e:
            logger.error(f"Background monitoring error: {e}")
            time.sleep(60)

def save_metrics_to_db(metrics: PerformanceMetrics):
    """메트릭을 데이터베이스에 저장"""
    if not metrics:
        return
        
    conn = sqlite3.connect('performance_monitor.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO performance_metrics 
        (timestamp, cpu_percent, memory_percent, memory_used_mb, disk_usage_percent,
         network_io_sent, network_io_recv, active_connections, avg_response_time,
         error_rate, requests_per_minute)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        metrics.timestamp.isoformat(),
        metrics.cpu_percent,
        metrics.memory_percent,
        metrics.memory_used_mb,
        metrics.disk_usage_percent,
        metrics.network_io["sent"],
        metrics.network_io["recv"],
        metrics.active_connections,
        sum(metrics.response_times.values()) / len(metrics.response_times) if metrics.response_times else 0,
        metrics.error_rate,
        metrics.requests_per_minute
    ))
    
    conn.commit()
    conn.close()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "performance_monitor", "timestamp": datetime.now().isoformat()}

@app.get("/metrics")
async def get_current_metrics():
    """현재 성능 지표 조회"""
    if not performance_data:
        return {"message": "No metrics available yet"}
    
    latest_metrics = performance_data[-1]
    return {
        "current_metrics": latest_metrics.dict(),
        "service_health": {k: v.dict() for k, v in service_health_data.items()},
        "data_points": len(performance_data)
    }

@app.get("/metrics/history")
async def get_metrics_history(hours: int = 24):
    """과거 성능 지표 조회"""
    cutoff_time = datetime.now() - timedelta(hours=hours)
    
    filtered_data = [
        metrics for metrics in performance_data 
        if metrics.timestamp > cutoff_time
    ]
    
    return {
        "metrics_history": [m.dict() for m in filtered_data],
        "period_hours": hours,
        "data_points": len(filtered_data)
    }

@app.get("/optimization/suggestions")
async def get_optimization_suggestions():
    """성능 최적화 제안"""
    if not performance_data:
        return {"suggestions": ["데이터 수집 중..."]}
    
    latest = performance_data[-1]
    suggestions = []
    
    if latest.cpu_percent > 80:
        suggestions.append("CPU 사용률이 높습니다. 서비스 분산을 고려하세요.")
    
    if latest.memory_percent > 85:
        suggestions.append("메모리 사용률이 높습니다. 캐시 정리나 메모리 증설을 고려하세요.")
    
    if latest.disk_usage_percent > 90:
        suggestions.append("디스크 사용률이 높습니다. 로그 정리나 스토리지 확장을 고려하세요.")
    
    if latest.response_times:
        avg_response = sum(latest.response_times.values()) / len(latest.response_times)
        if avg_response > 1000:  # 1초 이상
            suggestions.append("응답 시간이 느립니다. 데이터베이스 최적화나 캐싱을 고려하세요.")
    
    unhealthy_services = [name for name, health in service_health_data.items() 
                         if health.status != "healthy"]
    if unhealthy_services:
        suggestions.append(f"비정상 서비스: {', '.join(unhealthy_services)}")
    
    if not suggestions:
        suggestions.append("시스템이 최적 상태입니다!")
    
    return {
        "suggestions": suggestions,
        "current_status": {
            "cpu_percent": latest.cpu_percent,
            "memory_percent": latest.memory_percent,
            "disk_percent": latest.disk_usage_percent,
            "healthy_services": len([h for h in service_health_data.values() if h.status == "healthy"]),
            "total_services": len(service_health_data)
        }
    }

@app.post("/track/request")
async def track_request(service_name: str, response_time: float):
    """요청 추적"""
    current_time = datetime.now().isoformat()
    request_counts[current_time] += 1
    
    if service_name not in response_times:
        response_times[service_name] = []
    response_times[service_name].append(response_time)
    
    # 최근 100개 응답 시간만 유지
    if len(response_times[service_name]) > 100:
        response_times[service_name].pop(0)
    
    return {"status": "tracked"}

if __name__ == "__main__":
    init_database()
    
    # 백그라운드 모니터링 시작
    monitor_thread = threading.Thread(target=background_monitoring, daemon=True)
    monitor_thread.start()
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8013)
