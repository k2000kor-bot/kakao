"""
고급 성능 모니터링 API
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import json
import time
import psutil
import logging
from datetime import datetime, timedelta
import random

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/performance", tags=["Performance Monitor"])

# 메모리 내 데이터 저장
performance_history = []
performance_alerts = []
is_monitoring = False
monitoring_task = None

class PerformanceMetrics(BaseModel):
    timestamp: str
    cpu: Dict[str, Any]
    memory: Dict[str, Any]
    disk: Dict[str, Any]
    network: Dict[str, Any]
    processes: Dict[str, int]

class PerformanceAlert(BaseModel):
    id: str
    timestamp: str
    type: str
    severity: str
    message: str
    value: float
    threshold: float
    resolved: bool

class MonitoringConfig(BaseModel):
    cpu_threshold: float = 80.0
    memory_threshold: float = 85.0
    disk_threshold: float = 90.0
    network_threshold: float = 1000.0
    monitoring_interval: int = 2000

monitoring_config = MonitoringConfig()

async def collect_performance_metrics():
    """성능 메트릭 수집"""
    try:
        # CPU 정보
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        
        # 메모리 정보
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        # 디스크 정보
        disk = psutil.disk_usage('/')
        disk_io = psutil.disk_io_counters()
        
        # 네트워크 정보
        network_io = psutil.net_io_counters()
        
        # 프로세스 정보
        processes = list(psutil.process_iter(['pid', 'name', 'status']))
        process_status = {}
        for proc in processes:
            try:
                status = proc.info['status']
                process_status[status] = process_status.get(status, 0) + 1
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        metrics = PerformanceMetrics(
            timestamp=datetime.now().isoformat(),
            cpu={
                "usage": cpu_percent,
                "cores": cpu_count,
                "temperature": random.uniform(40, 80),  # 시뮬레이션
                "frequency": cpu_freq.current if cpu_freq else 0
            },
            memory={
                "used": memory.used,
                "total": memory.total,
                "available": memory.available,
                "swap": swap.used
            },
            disk={
                "used": disk.used,
                "total": disk.total,
                "readSpeed": disk_io.read_bytes / 1024 / 1024 if disk_io else 0,  # MB/s
                "writeSpeed": disk_io.write_bytes / 1024 / 1024 if disk_io else 0  # MB/s
            },
            network={
                "bytesIn": network_io.bytes_recv,
                "bytesOut": network_io.bytes_sent,
                "packetsIn": network_io.packets_recv,
                "packetsOut": network_io.packets_sent,
                "latency": random.uniform(10, 100)  # 시뮬레이션
            },
            processes={
                "total": len(processes),
                "running": process_status.get('running', 0),
                "sleeping": process_status.get('sleeping', 0),
                "zombie": process_status.get('zombie', 0)
            }
        )
        
        # 히스토리에 추가
        performance_history.insert(0, metrics.dict())
        if len(performance_history) > 1000:  # 최대 1000개 유지
            performance_history = performance_history[:1000]
        
        # 임계값 체크
        await check_thresholds(metrics)
        
        return metrics
        
    except Exception as e:
        print(f"메트릭 수집 오류: {e}")
        return None

async def check_thresholds(metrics: PerformanceMetrics):
    """임계값 체크 및 알림 생성"""
    alerts = []
    
    # CPU 임계값 체크
    if metrics.cpu["usage"] > monitoring_config.cpu_threshold:
        alerts.append(PerformanceAlert(
            id=f"cpu_{int(time.time())}_{random.randint(1000, 9999)}",
            timestamp=datetime.now().isoformat(),
            type="cpu",
            severity="critical" if metrics.cpu["usage"] > 95 else "high" if metrics.cpu["usage"] > 90 else "medium",
            message=f"CPU 사용률이 {metrics.cpu['usage']:.1f}%로 임계값 {monitoring_config.cpu_threshold}%를 초과했습니다.",
            value=metrics.cpu["usage"],
            threshold=monitoring_config.cpu_threshold,
            resolved=False
        ))
    
    # 메모리 임계값 체크
    memory_usage_percent = (metrics.memory["used"] / metrics.memory["total"]) * 100
    if memory_usage_percent > monitoring_config.memory_threshold:
        alerts.append(PerformanceAlert(
            id=f"memory_{int(time.time())}_{random.randint(1000, 9999)}",
            timestamp=datetime.now().isoformat(),
            type="memory",
            severity="critical" if memory_usage_percent > 95 else "high",
            message=f"메모리 사용률이 {memory_usage_percent:.1f}%로 임계값 {monitoring_config.memory_threshold}%를 초과했습니다.",
            value=memory_usage_percent,
            threshold=monitoring_config.memory_threshold,
            resolved=False
        ))
    
    # 디스크 임계값 체크
    disk_usage_percent = (metrics.disk["used"] / metrics.disk["total"]) * 100
    if disk_usage_percent > monitoring_config.disk_threshold:
        alerts.append(PerformanceAlert(
            id=f"disk_{int(time.time())}_{random.randint(1000, 9999)}",
            timestamp=datetime.now().isoformat(),
            type="disk",
            severity="critical" if disk_usage_percent > 95 else "high",
            message=f"디스크 사용률이 {disk_usage_percent:.1f}%로 임계값 {monitoring_config.disk_threshold}%를 초과했습니다.",
            value=disk_usage_percent,
            threshold=monitoring_config.disk_threshold,
            resolved=False
        ))
    
    # 네트워크 지연 임계값 체크
    if metrics.network["latency"] > monitoring_config.network_threshold:
        alerts.append(PerformanceAlert(
            id=f"network_{int(time.time())}_{random.randint(1000, 9999)}",
            timestamp=datetime.now().isoformat(),
            type="network",
            severity="critical" if metrics.network["latency"] > 2000 else "medium",
            message=f"네트워크 지연시간이 {metrics.network['latency']:.1f}ms로 임계값 {monitoring_config.network_threshold}ms를 초과했습니다.",
            value=metrics.network["latency"],
            threshold=monitoring_config.network_threshold,
            resolved=False
        ))
    
    # 알림 추가
    for alert in alerts:
        performance_alerts.insert(0, alert.dict())
        if len(performance_alerts) > 500:  # 최대 500개 유지
            performance_alerts = performance_alerts[:500]

async def monitoring_loop():
    """모니터링 루프"""
    global is_monitoring
    while is_monitoring:
        try:
            await collect_performance_metrics()
            await asyncio.sleep(monitoring_config.monitoring_interval / 1000)  # ms를 초로 변환
        except Exception as e:
            print(f"모니터링 루프 오류: {e}")
            await asyncio.sleep(5)

@router.get("/metrics")
async def get_current_metrics():
    """현재 성능 메트릭 조회"""
    try:
        metrics = await collect_performance_metrics()
        if metrics:
            return metrics.dict()
        else:
            raise HTTPException(status_code=500, detail="메트릭 수집 실패")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"메트릭 조회 중 오류 발생: {str(e)}")

@router.get("/history")
async def get_performance_history(limit: int = 100):
    """성능 히스토리 조회"""
    return performance_history[:limit]

@router.get("/alerts")
async def get_performance_alerts(limit: int = 50, resolved: Optional[bool] = None):
    """성능 알림 조회"""
    alerts = performance_alerts
    if resolved is not None:
        alerts = [alert for alert in alerts if alert["resolved"] == resolved]
    return alerts[:limit]

@router.post("/start-monitoring")
async def start_monitoring():
    """성능 모니터링 시작"""
    global is_monitoring, monitoring_task
    
    if is_monitoring:
        return {"message": "모니터링이 이미 실행 중입니다.", "status": "running"}
    
    is_monitoring = True
    monitoring_task = asyncio.create_task(monitoring_loop())
    
    return {"message": "성능 모니터링이 시작되었습니다.", "status": "started"}

@router.post("/stop-monitoring")
async def stop_monitoring():
    """성능 모니터링 중지"""
    global is_monitoring, monitoring_task
    
    if not is_monitoring:
        return {"message": "모니터링이 실행 중이 아닙니다.", "status": "stopped"}
    
    is_monitoring = False
    if monitoring_task:
        monitoring_task.cancel()
        try:
            await monitoring_task
        except asyncio.CancelledError:
            pass
    
    return {"message": "성능 모니터링이 중지되었습니다.", "status": "stopped"}

@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """알림 해결"""
    try:
        for alert in performance_alerts:
            if alert["id"] == alert_id:
                alert["resolved"] = True
                return {"message": f"알림 {alert_id}가 해결되었습니다.", "status": "resolved"}
        
        raise HTTPException(status_code=404, detail="알림을 찾을 수 없습니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"알림 해결 중 오류 발생: {str(e)}")

@router.post("/config")
async def update_monitoring_config(config: MonitoringConfig):
    """모니터링 설정 업데이트"""
    global monitoring_config
    monitoring_config = config
    return {"message": "모니터링 설정이 업데이트되었습니다.", "config": config.dict()}

@router.get("/config")
async def get_monitoring_config():
    """모니터링 설정 조회"""
    return monitoring_config.dict()

@router.get("/export")
async def export_performance_data(format: str = "json", timeRange: str = "1h"):
    """성능 데이터 내보내기"""
    try:
        # 시간 범위에 따른 데이터 필터링
        now = datetime.now()
        if timeRange == "1h":
            cutoff = now - timedelta(hours=1)
        elif timeRange == "6h":
            cutoff = now - timedelta(hours=6)
        elif timeRange == "24h":
            cutoff = now - timedelta(hours=24)
        elif timeRange == "7d":
            cutoff = now - timedelta(days=7)
        else:
            cutoff = now - timedelta(hours=1)
        
        filtered_data = [
            data for data in performance_history 
            if datetime.fromisoformat(data["timestamp"]) >= cutoff
        ]
        
        if format == "csv":
            # CSV 형식으로 변환
            csv_data = "timestamp,cpu_usage,cpu_cores,memory_used,memory_total,disk_used,disk_total,network_latency\n"
            for data in filtered_data:
                csv_data += f"{data['timestamp']},{data['cpu']['usage']},{data['cpu']['cores']},{data['memory']['used']},{data['memory']['total']},{data['disk']['used']},{data['disk']['total']},{data['network']['latency']}\n"
            return csv_data
        else:
            return filtered_data
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 내보내기 중 오류 발생: {str(e)}")

@router.get("/summary")
async def get_performance_summary():
    """성능 요약 정보"""
    try:
        if not performance_history:
            return {"message": "성능 데이터가 없습니다."}
        
        recent_data = performance_history[:10]  # 최근 10개 데이터
        
        # 평균값 계산
        avg_cpu = sum(data["cpu"]["usage"] for data in recent_data) / len(recent_data)
        avg_memory = sum(data["memory"]["used"] / data["memory"]["total"] * 100 for data in recent_data) / len(recent_data)
        avg_disk = sum(data["disk"]["used"] / data["disk"]["total"] * 100 for data in recent_data) / len(recent_data)
        avg_network = sum(data["network"]["latency"] for data in recent_data) / len(recent_data)
        
        # 활성 알림 수
        active_alerts = len([alert for alert in performance_alerts if not alert["resolved"]])
        
        return {
            "summary": {
                "average_cpu_usage": round(avg_cpu, 2),
                "average_memory_usage": round(avg_memory, 2),
                "average_disk_usage": round(avg_disk, 2),
                "average_network_latency": round(avg_network, 2),
                "active_alerts": active_alerts,
                "total_data_points": len(performance_history),
                "monitoring_status": "active" if is_monitoring else "inactive"
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"성능 요약 생성 중 오류 발생: {str(e)}")

@router.get("/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "monitoring": is_monitoring,
        "data_count": len(performance_history),
        "alerts_count": len(performance_alerts)
    }

# 초기화 로그
logger.info("Performance Monitor API가 초기화되었습니다")
