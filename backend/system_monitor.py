"""
시스템 모니터링 및 성능 추적 모듈
System Monitoring and Performance Tracking Module
"""

import time
import psutil
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import json
import os


@dataclass
class PerformanceMetrics:
    """성능 메트릭 데이터 클래스"""
    timestamp: str
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    memory_available_mb: float
    disk_usage_percent: float
    active_connections: int
    response_time_avg: float
    requests_per_minute: float
    error_rate: float


@dataclass
class RequestMetrics:
    """요청 메트릭 데이터 클래스"""
    timestamp: str
    endpoint: str
    method: str
    response_time: float
    status_code: int
    success: bool
    error_message: Optional[str] = None


class SystemMonitor:
    """시스템 모니터링 클래스"""
    
    def __init__(self, log_file: str = "system_monitor.log"):
        self.log_file = log_file
        self.metrics_history: List[PerformanceMetrics] = []
        self.request_history: List[RequestMetrics] = []
        self.start_time = datetime.now()
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.response_times: List[float] = []
        self.monitoring_active = False
        self.monitor_thread: Optional[threading.Thread] = None
        
        # 성능 임계값 설정
        self.cpu_threshold = 80.0
        self.memory_threshold = 85.0
        self.disk_threshold = 90.0
        self.response_time_threshold = 5.0
        
    def start_monitoring(self, interval: int = 30):
        """모니터링 시작"""
        if self.monitoring_active:
            return
            
        self.monitoring_active = True
        self.monitor_thread = threading.Thread(
            target=self._monitoring_loop,
            args=(interval,),
            daemon=True
        )
        self.monitor_thread.start()
        print(f"🔍 시스템 모니터링 시작 (간격: {interval}초)")
        
    def stop_monitoring(self):
        """모니터링 중지"""
        self.monitoring_active = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        print("⏹️ 시스템 모니터링 중지")
        
    def _monitoring_loop(self, interval: int):
        """모니터링 루프"""
        while self.monitoring_active:
            try:
                metrics = self._collect_metrics()
                self.metrics_history.append(metrics)
                
                # 메모리 사용량이 임계값을 초과하면 경고
                if metrics.memory_percent > self.memory_threshold:
                    self._log_warning(f"높은 메모리 사용량: {metrics.memory_percent:.1f}%")
                
                # CPU 사용량이 임계값을 초과하면 경고
                if metrics.cpu_percent > self.cpu_threshold:
                    self._log_warning(f"높은 CPU 사용량: {metrics.cpu_percent:.1f}%")
                
                # 디스크 사용량이 임계값을 초과하면 경고
                if metrics.disk_usage_percent > self.disk_threshold:
                    self._log_warning(f"높은 디스크 사용량: {metrics.disk_usage_percent:.1f}%")
                
                # 오래된 메트릭 정리 (24시간 이상)
                self._cleanup_old_metrics()
                
                # 로그 파일에 저장
                self._save_metrics_to_log(metrics)
                
            except Exception as e:
                self._log_error(f"모니터링 오류: {e}")
            
            time.sleep(interval)
    
    def _collect_metrics(self) -> PerformanceMetrics:
        """시스템 메트릭 수집"""
        try:
            # CPU 사용률
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # 메모리 사용률
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_used_mb = memory.used / (1024 * 1024)
            memory_available_mb = memory.available / (1024 * 1024)
            
            # 디스크 사용률
            disk = psutil.disk_usage('/')
            disk_usage_percent = (disk.used / disk.total) * 100
            
            # 네트워크 연결 수
            connections = len(psutil.net_connections())
            
            # 응답 시간 평균
            response_time_avg = sum(self.response_times) / len(self.response_times) if self.response_times else 0.0
            
            # 분당 요청 수
            uptime_minutes = (datetime.now() - self.start_time).total_seconds() / 60
            requests_per_minute = self.total_requests / uptime_minutes if uptime_minutes > 0 else 0.0
            
            # 오류율
            error_rate = (self.failed_requests / self.total_requests * 100) if self.total_requests > 0 else 0.0
            
            return PerformanceMetrics(
                timestamp=datetime.now().isoformat(),
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                memory_used_mb=memory_used_mb,
                memory_available_mb=memory_available_mb,
                disk_usage_percent=disk_usage_percent,
                active_connections=connections,
                response_time_avg=response_time_avg,
                requests_per_minute=requests_per_minute,
                error_rate=error_rate
            )
            
        except Exception as e:
            self._log_error(f"메트릭 수집 오류: {e}")
            # 기본값 반환
            return PerformanceMetrics(
                timestamp=datetime.now().isoformat(),
                cpu_percent=0.0,
                memory_percent=0.0,
                memory_used_mb=0.0,
                memory_available_mb=0.0,
                disk_usage_percent=0.0,
                active_connections=0,
                response_time_avg=0.0,
                requests_per_minute=0.0,
                error_rate=0.0
            )
    
    def record_request(self, endpoint: str, method: str, response_time: float, 
                      status_code: int, success: bool, error_message: Optional[str] = None):
        """요청 기록"""
        self.total_requests += 1
        if success:
            self.successful_requests += 1
        else:
            self.failed_requests += 1
            
        self.response_times.append(response_time)
        
        # 응답 시간이 너무 길면 경고
        if response_time > self.response_time_threshold:
            self._log_warning(f"느린 응답 시간: {response_time:.2f}초 ({endpoint})")
        
        # 응답 시간 히스토리 관리 (최근 1000개만 유지)
        if len(self.response_times) > 1000:
            self.response_times = self.response_times[-1000:]
        
        request_metrics = RequestMetrics(
            timestamp=datetime.now().isoformat(),
            endpoint=endpoint,
            method=method,
            response_time=response_time,
            status_code=status_code,
            success=success,
            error_message=error_message
        )
        
        self.request_history.append(request_metrics)
        
        # 요청 히스토리 관리 (최근 10000개만 유지)
        if len(self.request_history) > 10000:
            self.request_history = self.request_history[-10000:]
    
    def get_system_status(self) -> Dict:
        """시스템 상태 반환"""
        if not self.metrics_history:
            return {"status": "no_data", "message": "모니터링 데이터가 없습니다"}
        
        latest_metrics = self.metrics_history[-1]
        
        # 상태 판단
        status = "healthy"
        warnings = []
        
        if latest_metrics.cpu_percent > self.cpu_threshold:
            status = "warning"
            warnings.append(f"높은 CPU 사용량: {latest_metrics.cpu_percent:.1f}%")
        
        if latest_metrics.memory_percent > self.memory_threshold:
            status = "warning"
            warnings.append(f"높은 메모리 사용량: {latest_metrics.memory_percent:.1f}%")
        
        if latest_metrics.disk_usage_percent > self.disk_threshold:
            status = "critical"
            warnings.append(f"높은 디스크 사용량: {latest_metrics.disk_usage_percent:.1f}%")
        
        if latest_metrics.error_rate > 10.0:
            status = "warning"
            warnings.append(f"높은 오류율: {latest_metrics.error_rate:.1f}%")
        
        return {
            "status": status,
            "uptime_seconds": (datetime.now() - self.start_time).total_seconds(),
            "total_requests": self.total_requests,
            "successful_requests": self.successful_requests,
            "failed_requests": self.failed_requests,
            "success_rate": (self.successful_requests / self.total_requests * 100) if self.total_requests > 0 else 0.0,
            "average_response_time": latest_metrics.response_time_avg,
            "requests_per_minute": latest_metrics.requests_per_minute,
            "current_metrics": asdict(latest_metrics),
            "warnings": warnings,
            "monitoring_active": self.monitoring_active
        }
    
    def get_performance_summary(self, hours: int = 24) -> Dict:
        """성능 요약 반환"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_metrics = [
            m for m in self.metrics_history 
            if datetime.fromisoformat(m.timestamp) > cutoff_time
        ]
        
        if not recent_metrics:
            return {"message": f"최근 {hours}시간 데이터가 없습니다"}
        
        # 통계 계산
        cpu_values = [m.cpu_percent for m in recent_metrics]
        memory_values = [m.memory_percent for m in recent_metrics]
        response_times = [m.response_time_avg for m in recent_metrics]
        
        return {
            "period_hours": hours,
            "data_points": len(recent_metrics),
            "cpu": {
                "average": sum(cpu_values) / len(cpu_values),
                "max": max(cpu_values),
                "min": min(cpu_values)
            },
            "memory": {
                "average": sum(memory_values) / len(memory_values),
                "max": max(memory_values),
                "min": min(memory_values)
            },
            "response_time": {
                "average": sum(response_times) / len(response_times),
                "max": max(response_times),
                "min": min(response_times)
            }
        }
    
    def _cleanup_old_metrics(self):
        """오래된 메트릭 정리"""
        cutoff_time = datetime.now() - timedelta(hours=24)
        self.metrics_history = [
            m for m in self.metrics_history 
            if datetime.fromisoformat(m.timestamp) > cutoff_time
        ]
    
    def _save_metrics_to_log(self, metrics: PerformanceMetrics):
        """메트릭을 로그 파일에 저장"""
        try:
            log_entry = {
                "timestamp": metrics.timestamp,
                "type": "performance_metrics",
                "data": asdict(metrics)
            }
            
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
                
        except Exception as e:
            self._log_error(f"로그 저장 오류: {e}")
    
    def _log_warning(self, message: str):
        """경고 로그"""
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "level": "WARNING",
            "message": message
        }
        print(f"⚠️ {message}")
        
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
        except Exception:
            pass
    
    def _log_error(self, message: str):
        """오류 로그"""
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "level": "ERROR",
            "message": message
        }
        print(f"❌ {message}")
        
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
        except Exception:
            pass


# 전역 모니터 인스턴스
system_monitor = SystemMonitor()

def get_system_monitor() -> SystemMonitor:
    """시스템 모니터 인스턴스 반환"""
    return system_monitor
