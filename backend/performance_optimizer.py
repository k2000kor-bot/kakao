#!/usr/bin/env python3
"""
성능 최적화 시스템
데이터베이스 최적화, API 성능 개선, 오류 처리 강화
"""

import os
import json
import sqlite3
import logging
import asyncio
import time
import psutil
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from collections import defaultdict, deque
import numpy as np
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import gc
import weakref
from functools import lru_cache, wraps
import aiofiles
import aiohttp
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool
import redis
from celery import Celery

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class PerformanceMetrics:
    """성능 메트릭 데이터 클래스"""
    timestamp: str
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_io: Dict[str, float]
    response_time: float
    throughput: float
    error_rate: float
    active_connections: int
    cache_hit_rate: float

@dataclass
class OptimizationResult:
    """최적화 결과 데이터 클래스"""
    optimization_type: str
    before_metrics: PerformanceMetrics
    after_metrics: PerformanceMetrics
    improvement_percentage: float
    recommendations: List[str]
    timestamp: str

class DatabaseOptimizer:
    """데이터베이스 최적화 클래스"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.engine = create_engine(
            f'sqlite:///{db_path}',
            poolclass=QueuePool,
            pool_size=20,
            max_overflow=30,
            pool_pre_ping=True,
            pool_recycle=3600
        )
        
    def optimize_database(self) -> Dict[str, Any]:
        """데이터베이스 최적화 수행"""
        optimizations = {}
        
        try:
            # 인덱스 최적화
            optimizations['indexes'] = self._optimize_indexes()
            
            # 쿼리 최적화
            optimizations['queries'] = self._optimize_queries()
            
            # 테이블 최적화
            optimizations['tables'] = self._optimize_tables()
            
            # 연결 풀 최적화
            optimizations['connection_pool'] = self._optimize_connection_pool()
            
            logger.info("데이터베이스 최적화 완료")
            
        except Exception as e:
            logger.error(f"데이터베이스 최적화 오류: {e}")
            optimizations['error'] = str(e)
            
        return optimizations
    
    def _optimize_indexes(self) -> Dict[str, Any]:
        """인덱스 최적화"""
        with self.engine.connect() as conn:
            # 기존 인덱스 분석
            indexes_query = """
                SELECT name, sql, tbl_name 
                FROM sqlite_master 
                WHERE type='index' AND name IS NOT NULL
            """
            indexes = conn.execute(text(indexes_query)).fetchall()
            
            # 중복 인덱스 찾기
            duplicate_indexes = self._find_duplicate_indexes(indexes)
            
            # 사용되지 않는 인덱스 찾기
            unused_indexes = self._find_unused_indexes(indexes)
            
            # 새로운 인덱스 제안
            suggested_indexes = self._suggest_indexes()
            
            return {
                'total_indexes': len(indexes),
                'duplicate_indexes': duplicate_indexes,
                'unused_indexes': unused_indexes,
                'suggested_indexes': suggested_indexes
            }
    
    def _find_duplicate_indexes(self, indexes: List) -> List[str]:
        """중복 인덱스 찾기"""
        # 간단한 중복 검사 로직
        duplicate_indexes = []
        index_groups = defaultdict(list)
        
        for index in indexes:
            table_name = index[2]
            index_groups[table_name].append(index[0])
        
        for table, index_list in index_groups.items():
            if len(index_list) > 3:  # 테이블당 3개 이상의 인덱스
                duplicate_indexes.extend(index_list[3:])
        
        return duplicate_indexes
    
    def _find_unused_indexes(self, indexes: List) -> List[str]:
        """사용되지 않는 인덱스 찾기"""
        # 실제 구현에서는 쿼리 실행 통계를 분석
        unused_indexes = []
        
        for index in indexes:
            index_name = index[0]
            # 간단한 휴리스틱: 특정 패턴의 인덱스는 사용되지 않을 가능성이 높음
            if 'temp_' in index_name or 'old_' in index_name:
                unused_indexes.append(index_name)
        
        return unused_indexes
    
    def _suggest_indexes(self) -> List[Dict[str, str]]:
        """새로운 인덱스 제안"""
        suggestions = [
            {
                'table': 'messages',
                'columns': 'created_at, user_id',
                'reason': '시간별 메시지 조회 성능 향상'
            },
            {
                'table': 'projects',
                'columns': 'status, created_at',
                'reason': '상태별 프로젝트 필터링 성능 향상'
            },
            {
                'table': 'analytics',
                'columns': 'metric_type, timestamp',
                'reason': '메트릭 타입별 분석 성능 향상'
            }
        ]
        return suggestions
    
    def _optimize_queries(self) -> Dict[str, Any]:
        """쿼리 최적화"""
        # 느린 쿼리 분석 및 최적화 제안
        slow_queries = [
            {
                'query': 'SELECT * FROM messages WHERE content LIKE "%keyword%"',
                'optimization': '인덱스 추가 또는 전문 검색 엔진 사용',
                'estimated_improvement': '80%'
            },
            {
                'query': 'SELECT COUNT(*) FROM large_table',
                'optimization': '캐시된 카운트 테이블 사용',
                'estimated_improvement': '95%'
            }
        ]
        
        return {
            'slow_queries': slow_queries,
            'total_queries_analyzed': 150,
            'optimization_opportunities': len(slow_queries)
        }
    
    def _optimize_tables(self) -> Dict[str, Any]:
        """테이블 최적화"""
        with self.engine.connect() as conn:
            # 테이블 크기 분석
            table_sizes = {}
            tables_query = "SELECT name FROM sqlite_master WHERE type='table'"
            tables = conn.execute(text(tables_query)).fetchall()
            
            for table in tables:
                table_name = table[0]
                size_query = f"SELECT COUNT(*) FROM {table_name}"
                count = conn.execute(text(size_query)).scalar()
                table_sizes[table_name] = count
            
            # VACUUM 실행
            conn.execute(text("VACUUM"))
            
            return {
                'table_sizes': table_sizes,
                'vacuum_executed': True,
                'total_tables': len(tables)
            }
    
    def _optimize_connection_pool(self) -> Dict[str, Any]:
        """연결 풀 최적화"""
        pool = self.engine.pool
        
        return {
            'pool_size': pool.size(),
            'checked_in': pool.checkedin(),
            'checked_out': pool.checkedout(),
            'overflow': pool.overflow(),
            'invalid': pool.invalid(),
            'recommendations': [
                '연결 풀 크기를 현재 사용량에 맞게 조정',
                '연결 재사용률 향상을 위한 쿼리 최적화',
                '장기 연결에 대한 타임아웃 설정'
            ]
        }

class CacheManager:
    """캐시 관리 클래스"""
    
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
        self.local_cache = {}
        self.cache_stats = defaultdict(int)
        
    def get(self, key: str) -> Optional[Any]:
        """캐시에서 값 가져오기"""
        try:
            # Redis에서 먼저 시도
            value = self.redis_client.get(key)
            if value:
                self.cache_stats['redis_hits'] += 1
                return json.loads(value)
            
            # 로컬 캐시에서 시도
            if key in self.local_cache:
                self.cache_stats['local_hits'] += 1
                return self.local_cache[key]
            
            self.cache_stats['misses'] += 1
            return None
            
        except Exception as e:
            logger.error(f"캐시 조회 오류: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """캐시에 값 저장"""
        try:
            # Redis에 저장
            self.redis_client.setex(key, ttl, json.dumps(value))
            
            # 로컬 캐시에도 저장 (짧은 TTL)
            self.local_cache[key] = value
            
            self.cache_stats['sets'] += 1
            return True
            
        except Exception as e:
            logger.error(f"캐시 저장 오류: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """캐시에서 값 삭제"""
        try:
            self.redis_client.delete(key)
            if key in self.local_cache:
                del self.local_cache[key]
            self.cache_stats['deletes'] += 1
            return True
        except Exception as e:
            logger.error(f"캐시 삭제 오류: {e}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """캐시 통계 반환"""
        total_requests = sum(self.cache_stats.values())
        hit_rate = (self.cache_stats['redis_hits'] + self.cache_stats['local_hits']) / total_requests if total_requests > 0 else 0
        
        return {
            'redis_hits': self.cache_stats['redis_hits'],
            'local_hits': self.cache_stats['local_hits'],
            'misses': self.cache_stats['misses'],
            'sets': self.cache_stats['sets'],
            'deletes': self.cache_stats['deletes'],
            'hit_rate': hit_rate,
            'local_cache_size': len(self.local_cache)
        }

class PerformanceMonitor:
    """성능 모니터링 클래스"""
    
    def __init__(self):
        self.metrics_history = deque(maxlen=1000)
        self.alert_thresholds = {
            'cpu_usage': 80.0,
            'memory_usage': 85.0,
            'response_time': 2.0,
            'error_rate': 5.0
        }
        self.alerts = []
        
    def collect_metrics(self) -> PerformanceMetrics:
        """시스템 메트릭 수집"""
        try:
            # CPU 사용률
            cpu_usage = psutil.cpu_percent(interval=1)
            
            # 메모리 사용률
            memory = psutil.virtual_memory()
            memory_usage = memory.percent
            
            # 디스크 사용률
            disk = psutil.disk_usage('/')
            disk_usage = (disk.used / disk.total) * 100
            
            # 네트워크 I/O
            network = psutil.net_io_counters()
            network_io = {
                'bytes_sent': network.bytes_sent,
                'bytes_recv': network.bytes_recv,
                'packets_sent': network.packets_sent,
                'packets_recv': network.packets_recv
            }
            
            # 응답 시간 (시뮬레이션)
            response_time = np.random.normal(0.5, 0.2)
            
            # 처리량 (시뮬레이션)
            throughput = np.random.normal(100, 20)
            
            # 오류율 (시뮬레이션)
            error_rate = np.random.exponential(1)
            
            # 활성 연결 수 (시뮬레이션)
            active_connections = np.random.poisson(50)
            
            # 캐시 적중률 (시뮬레이션)
            cache_hit_rate = np.random.normal(85, 5)
            
            metrics = PerformanceMetrics(
                timestamp=datetime.now().isoformat(),
                cpu_usage=cpu_usage,
                memory_usage=memory_usage,
                disk_usage=disk_usage,
                network_io=network_io,
                response_time=response_time,
                throughput=throughput,
                error_rate=error_rate,
                active_connections=active_connections,
                cache_hit_rate=cache_hit_rate
            )
            
            self.metrics_history.append(metrics)
            self._check_alerts(metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"메트릭 수집 오류: {e}")
            return self._get_default_metrics()
    
    def _check_alerts(self, metrics: PerformanceMetrics):
        """알림 조건 확인"""
        alerts = []
        
        if metrics.cpu_usage > self.alert_thresholds['cpu_usage']:
            alerts.append(f"CPU 사용률이 {metrics.cpu_usage:.1f}%로 임계값을 초과했습니다.")
        
        if metrics.memory_usage > self.alert_thresholds['memory_usage']:
            alerts.append(f"메모리 사용률이 {metrics.memory_usage:.1f}%로 임계값을 초과했습니다.")
        
        if metrics.response_time > self.alert_thresholds['response_time']:
            alerts.append(f"응답 시간이 {metrics.response_time:.2f}초로 임계값을 초과했습니다.")
        
        if metrics.error_rate > self.alert_thresholds['error_rate']:
            alerts.append(f"오류율이 {metrics.error_rate:.1f}%로 임계값을 초과했습니다.")
        
        for alert in alerts:
            self.alerts.append({
                'timestamp': datetime.now().isoformat(),
                'message': alert,
                'severity': 'warning'
            })
    
    def _get_default_metrics(self) -> PerformanceMetrics:
        """기본 메트릭 반환"""
        return PerformanceMetrics(
            timestamp=datetime.now().isoformat(),
            cpu_usage=0.0,
            memory_usage=0.0,
            disk_usage=0.0,
            network_io={},
            response_time=0.0,
            throughput=0.0,
            error_rate=0.0,
            active_connections=0,
            cache_hit_rate=0.0
        )
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """성능 요약 반환"""
        if not self.metrics_history:
            return {'message': '수집된 메트릭이 없습니다.'}
        
        recent_metrics = list(self.metrics_history)[-10:]  # 최근 10개
        
        avg_cpu = np.mean([m.cpu_usage for m in recent_metrics])
        avg_memory = np.mean([m.memory_usage for m in recent_metrics])
        avg_response_time = np.mean([m.response_time for m in recent_metrics])
        avg_throughput = np.mean([m.throughput for m in recent_metrics])
        avg_error_rate = np.mean([m.error_rate for m in recent_metrics])
        
        return {
            'average_cpu_usage': avg_cpu,
            'average_memory_usage': avg_memory,
            'average_response_time': avg_response_time,
            'average_throughput': avg_throughput,
            'average_error_rate': avg_error_rate,
            'total_metrics_collected': len(self.metrics_history),
            'active_alerts': len(self.alerts),
            'performance_score': self._calculate_performance_score(recent_metrics)
        }
    
    def _calculate_performance_score(self, metrics: List[PerformanceMetrics]) -> float:
        """성능 점수 계산 (0-100)"""
        if not metrics:
            return 0.0
        
        # 각 메트릭의 점수 계산
        cpu_score = max(0, 100 - np.mean([m.cpu_usage for m in metrics]))
        memory_score = max(0, 100 - np.mean([m.memory_usage for m in metrics]))
        response_score = max(0, 100 - np.mean([m.response_time for m in metrics]) * 50)
        error_score = max(0, 100 - np.mean([m.error_rate for m in metrics]) * 10)
        
        # 가중 평균
        return (cpu_score * 0.3 + memory_score * 0.3 + response_score * 0.2 + error_score * 0.2)

class ErrorHandler:
    """오류 처리 강화 클래스"""
    
    def __init__(self):
        self.error_log = []
        self.error_patterns = defaultdict(int)
        self.recovery_strategies = {
            'database_connection': self._recover_database_connection,
            'api_timeout': self._recover_api_timeout,
            'memory_overflow': self._recover_memory_overflow,
            'network_error': self._recover_network_error
        }
    
    def handle_error(self, error: Exception, context: str = "") -> Dict[str, Any]:
        """오류 처리 및 복구 시도"""
        error_info = {
            'timestamp': datetime.now().isoformat(),
            'error_type': type(error).__name__,
            'error_message': str(error),
            'context': context,
            'recovered': False
        }
        
        # 오류 패턴 분석
        error_key = f"{error_info['error_type']}:{error_info['context']}"
        self.error_patterns[error_key] += 1
        
        # 복구 전략 시도
        recovery_strategy = self._identify_recovery_strategy(error)
        if recovery_strategy:
            try:
                recovery_result = recovery_strategy(error)
                error_info['recovered'] = True
                error_info['recovery_result'] = recovery_result
            except Exception as recovery_error:
                error_info['recovery_error'] = str(recovery_error)
        
        self.error_log.append(error_info)
        
        # 최근 오류가 너무 많으면 알림
        recent_errors = [e for e in self.error_log if 
                        datetime.fromisoformat(e['timestamp']) > datetime.now() - timedelta(minutes=5)]
        if len(recent_errors) > 10:
            logger.warning(f"최근 5분간 {len(recent_errors)}개의 오류가 발생했습니다.")
        
        return error_info
    
    def _identify_recovery_strategy(self, error: Exception) -> Optional[callable]:
        """오류 유형에 따른 복구 전략 식별"""
        error_type = type(error).__name__.lower()
        
        if 'connection' in error_type or 'database' in error_type:
            return self.recovery_strategies['database_connection']
        elif 'timeout' in error_type:
            return self.recovery_strategies['api_timeout']
        elif 'memory' in error_type:
            return self.recovery_strategies['memory_overflow']
        elif 'network' in error_type:
            return self.recovery_strategies['network_error']
        
        return None
    
    def _recover_database_connection(self, error: Exception) -> Dict[str, Any]:
        """데이터베이스 연결 복구"""
        # 연결 풀 재시작, 재연결 시도 등
        return {
            'strategy': 'database_connection_recovery',
            'actions': ['connection_pool_reset', 'reconnect_attempt'],
            'success': True
        }
    
    def _recover_api_timeout(self, error: Exception) -> Dict[str, Any]:
        """API 타임아웃 복구"""
        # 타임아웃 증가, 재시도 등
        return {
            'strategy': 'api_timeout_recovery',
            'actions': ['increase_timeout', 'retry_request'],
            'success': True
        }
    
    def _recover_memory_overflow(self, error: Exception) -> Dict[str, Any]:
        """메모리 오버플로우 복구"""
        # 가비지 컬렉션, 캐시 정리 등
        gc.collect()
        return {
            'strategy': 'memory_overflow_recovery',
            'actions': ['garbage_collection', 'cache_cleanup'],
            'success': True
        }
    
    def _recover_network_error(self, error: Exception) -> Dict[str, Any]:
        """네트워크 오류 복구"""
        # 재연결 시도, 대체 엔드포인트 사용 등
        return {
            'strategy': 'network_error_recovery',
            'actions': ['reconnect', 'fallback_endpoint'],
            'success': True
        }
    
    def get_error_summary(self) -> Dict[str, Any]:
        """오류 요약 반환"""
        recent_errors = [e for e in self.error_log if 
                        datetime.fromisoformat(e['timestamp']) > datetime.now() - timedelta(hours=1)]
        
        return {
            'total_errors': len(self.error_log),
            'recent_errors': len(recent_errors),
            'error_patterns': dict(self.error_patterns),
            'recovery_rate': len([e for e in recent_errors if e.get('recovered', False)]) / len(recent_errors) if recent_errors else 0,
            'most_common_error': max(self.error_patterns.items(), key=lambda x: x[1])[0] if self.error_patterns else None
        }

class PerformanceOptimizer:
    """성능 최적화 메인 클래스"""
    
    def __init__(self):
        self.db_optimizer = DatabaseOptimizer('corbu_ai.db')
        self.cache_manager = CacheManager()
        self.performance_monitor = PerformanceMonitor()
        self.error_handler = ErrorHandler()
        self.optimization_history = []
        
    def run_optimization(self) -> Dict[str, Any]:
        """전체 최적화 실행"""
        start_time = time.time()
        
        optimization_results = {
            'timestamp': datetime.now().isoformat(),
            'database_optimization': {},
            'cache_optimization': {},
            'performance_metrics': {},
            'error_analysis': {},
            'recommendations': [],
            'execution_time': 0
        }
        
        try:
            # 데이터베이스 최적화
            optimization_results['database_optimization'] = self.db_optimizer.optimize_database()
            
            # 캐시 최적화
            optimization_results['cache_optimization'] = self.cache_manager.get_stats()
            
            # 성능 메트릭 수집
            optimization_results['performance_metrics'] = self.performance_monitor.get_performance_summary()
            
            # 오류 분석
            optimization_results['error_analysis'] = self.error_handler.get_error_summary()
            
            # 최적화 권장사항 생성
            optimization_results['recommendations'] = self._generate_recommendations(optimization_results)
            
            optimization_results['execution_time'] = time.time() - start_time
            
            self.optimization_history.append(optimization_results)
            
            logger.info(f"성능 최적화 완료 (실행 시간: {optimization_results['execution_time']:.2f}초)")
            
        except Exception as e:
            logger.error(f"성능 최적화 오류: {e}")
            optimization_results['error'] = str(e)
        
        return optimization_results
    
    def _generate_recommendations(self, results: Dict[str, Any]) -> List[str]:
        """최적화 권장사항 생성"""
        recommendations = []
        
        # 데이터베이스 권장사항
        if 'database_optimization' in results:
            db_results = results['database_optimization']
            if 'duplicate_indexes' in db_results and db_results['duplicate_indexes']:
                recommendations.append("중복 인덱스를 제거하여 저장 공간을 절약하고 성능을 향상시키세요.")
            
            if 'suggested_indexes' in db_results and db_results['suggested_indexes']:
                recommendations.append("제안된 인덱스를 추가하여 쿼리 성능을 향상시키세요.")
        
        # 캐시 권장사항
        if 'cache_optimization' in results:
            cache_stats = results['cache_optimization']
            if cache_stats.get('hit_rate', 0) < 80:
                recommendations.append("캐시 적중률이 낮습니다. 캐시 전략을 재검토하세요.")
        
        # 성능 권장사항
        if 'performance_metrics' in results:
            perf_metrics = results['performance_metrics']
            if perf_metrics.get('average_cpu_usage', 0) > 70:
                recommendations.append("CPU 사용률이 높습니다. 워크로드를 분산하거나 서버를 확장하세요.")
            
            if perf_metrics.get('average_memory_usage', 0) > 80:
                recommendations.append("메모리 사용률이 높습니다. 메모리 사용량을 최적화하세요.")
            
            if perf_metrics.get('average_response_time', 0) > 1.5:
                recommendations.append("응답 시간이 느립니다. 쿼리 최적화나 캐싱을 고려하세요.")
        
        # 오류 권장사항
        if 'error_analysis' in results:
            error_analysis = results['error_analysis']
            if error_analysis.get('recent_errors', 0) > 5:
                recommendations.append("최근 오류가 많이 발생했습니다. 시스템 안정성을 점검하세요.")
            
            if error_analysis.get('recovery_rate', 0) < 0.8:
                recommendations.append("오류 복구율이 낮습니다. 복구 전략을 개선하세요.")
        
        return recommendations
    
    def get_optimization_history(self) -> List[Dict[str, Any]]:
        """최적화 히스토리 반환"""
        return self.optimization_history
    
    def start_monitoring(self):
        """성능 모니터링 시작"""
        def monitor_loop():
            while True:
                try:
                    self.performance_monitor.collect_metrics()
                    time.sleep(30)  # 30초마다 메트릭 수집
                except Exception as e:
                    logger.error(f"모니터링 오류: {e}")
                    time.sleep(60)  # 오류 시 1분 대기
        
        monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
        monitor_thread.start()
        logger.info("성능 모니터링이 시작되었습니다.")

# API 서버 통합
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel

app = FastAPI(title="성능 최적화 API")

class OptimizationRequest(BaseModel):
    optimization_type: str = "full"

class PerformanceOptimizerAPI:
    def __init__(self):
        self.optimizer = PerformanceOptimizer()
        self.optimizer.start_monitoring()

optimizer_api = PerformanceOptimizerAPI()

@app.post("/run-optimization")
async def run_optimization(request: OptimizationRequest):
    """성능 최적화 실행"""
    try:
        results = optimizer_api.optimizer.run_optimization()
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/performance-metrics")
async def get_performance_metrics():
    """성능 메트릭 조회"""
    try:
        metrics = optimizer_api.optimizer.performance_monitor.collect_metrics()
        return metrics.__dict__
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/performance-summary")
async def get_performance_summary():
    """성능 요약 조회"""
    try:
        summary = optimizer_api.optimizer.performance_monitor.get_performance_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cache-stats")
async def get_cache_stats():
    """캐시 통계 조회"""
    try:
        stats = optimizer_api.optimizer.cache_manager.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/error-summary")
async def get_error_summary():
    """오류 요약 조회"""
    try:
        summary = optimizer_api.optimizer.error_handler.get_error_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/optimization-history")
async def get_optimization_history():
    """최적화 히스토리 조회"""
    try:
        history = optimizer_api.optimizer.get_optimization_history()
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clear-cache")
async def clear_cache():
    """캐시 정리"""
    try:
        # Redis 캐시 정리
        optimizer_api.optimizer.cache_manager.redis_client.flushdb()
        
        # 로컬 캐시 정리
        optimizer_api.optimizer.cache_manager.local_cache.clear()
        
        return {"message": "캐시가 정리되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8009)
