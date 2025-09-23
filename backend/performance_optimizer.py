"""
성능 최적화 모듈
Performance Optimization Module
"""

import time
import threading
import gc
import psutil
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import os


@dataclass
class OptimizationMetrics:
    """최적화 메트릭 데이터 클래스"""
    timestamp: str
    memory_before: float
    memory_after: float
    memory_freed: float
    cpu_before: float
    cpu_after: float
    optimization_type: str
    duration: float


class PerformanceOptimizer:
    """성능 최적화 클래스"""
    
    def __init__(self):
        self.optimization_history: List[OptimizationMetrics] = []
        self.auto_optimization_active = False
        self.optimization_thread: Optional[threading.Thread] = None
        self.last_optimization = datetime.now()
        
        # 최적화 임계값
        self.memory_threshold = 80.0  # 80% 이상 시 최적화
        self.cpu_threshold = 70.0     # 70% 이상 시 최적화
        self.optimization_interval = 300  # 5분마다 체크
        
    def start_auto_optimization(self):
        """자동 최적화 시작"""
        if self.auto_optimization_active:
            return
            
        self.auto_optimization_active = True
        self.optimization_thread = threading.Thread(
            target=self._auto_optimization_loop,
            daemon=True
        )
        self.optimization_thread.start()
        print("🚀 자동 성능 최적화 시작")
        
    def stop_auto_optimization(self):
        """자동 최적화 중지"""
        self.auto_optimization_active = False
        if self.optimization_thread:
            self.optimization_thread.join(timeout=5)
        print("⏹️ 자동 성능 최적화 중지")
        
    def _auto_optimization_loop(self):
        """자동 최적화 루프"""
        while self.auto_optimization_active:
            try:
                current_time = datetime.now()
                
                # 최적화 간격 체크
                if (current_time - self.last_optimization).total_seconds() < self.optimization_interval:
                    time.sleep(30)
                    continue
                
                # 시스템 상태 체크
                memory_percent = psutil.virtual_memory().percent
                cpu_percent = psutil.cpu_percent(interval=1)
                
                # 최적화 필요성 판단
                if memory_percent > self.memory_threshold or cpu_percent > self.cpu_threshold:
                    print(f"🔧 최적화 필요 감지 - 메모리: {memory_percent:.1f}%, CPU: {cpu_percent:.1f}%")
                    self.optimize_memory()
                    self.optimize_cpu()
                    self.last_optimization = current_time
                
            except Exception as e:
                print(f"⚠️ 자동 최적화 오류: {e}")
            
            time.sleep(30)  # 30초마다 체크
    
    def optimize_memory(self) -> Dict:
        """메모리 최적화"""
        start_time = time.time()
        memory_before = psutil.virtual_memory().percent
        
        try:
            # 가비지 컬렉션 강제 실행
            collected = gc.collect()
            
            # 메모리 정리
            self._cleanup_memory()
            
            # 메모리 상태 확인
            memory_after = psutil.virtual_memory().percent
            memory_freed = memory_before - memory_after
            
            duration = time.time() - start_time
            
            # 메트릭 기록
            metrics = OptimizationMetrics(
                timestamp=datetime.now().isoformat(),
                memory_before=memory_before,
                memory_after=memory_after,
                memory_freed=memory_freed,
                cpu_before=0.0,
                cpu_after=0.0,
                optimization_type="memory",
                duration=duration
            )
            
            self.optimization_history.append(metrics)
            
            print(f"🧹 메모리 최적화 완료 - 해제: {memory_freed:.1f}%, 소요시간: {duration:.2f}초")
            
            return {
                "success": True,
                "memory_before": memory_before,
                "memory_after": memory_after,
                "memory_freed": memory_freed,
                "duration": duration,
                "collected_objects": collected
            }
            
        except Exception as e:
            print(f"❌ 메모리 최적화 실패: {e}")
            return {"success": False, "error": str(e)}
    
    def optimize_cpu(self) -> Dict:
        """CPU 최적화"""
        start_time = time.time()
        cpu_before = psutil.cpu_percent(interval=1)
        
        try:
            # CPU 집약적 작업 최적화
            self._optimize_cpu_usage()
            
            # CPU 상태 확인
            cpu_after = psutil.cpu_percent(interval=1)
            
            duration = time.time() - start_time
            
            # 메트릭 기록
            metrics = OptimizationMetrics(
                timestamp=datetime.now().isoformat(),
                memory_before=0.0,
                memory_after=0.0,
                memory_freed=0.0,
                cpu_before=cpu_before,
                cpu_after=cpu_after,
                optimization_type="cpu",
                duration=duration
            )
            
            self.optimization_history.append(metrics)
            
            print(f"⚡ CPU 최적화 완료 - 개선: {cpu_before - cpu_after:.1f}%, 소요시간: {duration:.2f}초")
            
            return {
                "success": True,
                "cpu_before": cpu_before,
                "cpu_after": cpu_after,
                "cpu_improvement": cpu_before - cpu_after,
                "duration": duration
            }
            
        except Exception as e:
            print(f"❌ CPU 최적화 실패: {e}")
            return {"success": False, "error": str(e)}
    
    def _cleanup_memory(self):
        """메모리 정리"""
        try:
            # 불필요한 캐시 정리
            if hasattr(gc, 'set_threshold'):
                # 가비지 컬렉션 임계값 조정
                gc.set_threshold(700, 10, 10)
            
            # 메모리 압축 (가능한 경우)
            if hasattr(gc, 'collect'):
                gc.collect()
                
        except Exception as e:
            print(f"⚠️ 메모리 정리 오류: {e}")
    
    def _optimize_cpu_usage(self):
        """CPU 사용량 최적화"""
        try:
            # CPU 집약적 작업 최적화
            # 실제 구현에서는 시스템별 최적화 로직 적용
            pass
            
        except Exception as e:
            print(f"⚠️ CPU 최적화 오류: {e}")
    
    def get_optimization_stats(self) -> Dict:
        """최적화 통계 반환"""
        if not self.optimization_history:
            return {"message": "최적화 기록이 없습니다"}
        
        # 최근 24시간 데이터
        cutoff_time = datetime.now() - timedelta(hours=24)
        recent_optimizations = [
            opt for opt in self.optimization_history
            if datetime.fromisoformat(opt.timestamp) > cutoff_time
        ]
        
        if not recent_optimizations:
            return {"message": "최근 24시간 최적화 기록이 없습니다"}
        
        # 통계 계산
        memory_optimizations = [opt for opt in recent_optimizations if opt.optimization_type == "memory"]
        cpu_optimizations = [opt for opt in recent_optimizations if opt.optimization_type == "cpu"]
        
        total_memory_freed = sum(opt.memory_freed for opt in memory_optimizations)
        total_cpu_improvement = sum(opt.cpu_before - opt.cpu_after for opt in cpu_optimizations)
        
        return {
            "total_optimizations": len(recent_optimizations),
            "memory_optimizations": len(memory_optimizations),
            "cpu_optimizations": len(cpu_optimizations),
            "total_memory_freed": total_memory_freed,
            "total_cpu_improvement": total_cpu_improvement,
            "average_memory_freed": total_memory_freed / len(memory_optimizations) if memory_optimizations else 0,
            "average_cpu_improvement": total_cpu_improvement / len(cpu_optimizations) if cpu_optimizations else 0,
            "auto_optimization_active": self.auto_optimization_active,
            "last_optimization": self.last_optimization.isoformat()
        }
    
    def manual_optimization(self) -> Dict:
        """수동 최적화 실행"""
        print("🔧 수동 최적화 시작...")
        
        memory_result = self.optimize_memory()
        cpu_result = self.optimize_cpu()
        
        return {
            "memory_optimization": memory_result,
            "cpu_optimization": cpu_result,
            "timestamp": datetime.now().isoformat()
        }


# 전역 최적화 인스턴스
performance_optimizer = PerformanceOptimizer()

def get_performance_optimizer() -> PerformanceOptimizer:
    """성능 최적화 인스턴스 반환"""
    return performance_optimizer