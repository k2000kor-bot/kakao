#!/usr/bin/env python3
"""
CORBU.AI 성능 최적화 도구
시스템 성능을 분석하고 최적화 제안을 제공합니다.
"""

import time
import psutil
import threading
from functools import wraps
from datetime import datetime, timedelta
from collections import defaultdict, deque
import json

class PerformanceOptimizer:
    def __init__(self):
        self.api_metrics = defaultdict(lambda: {
            'call_count': 0,
            'total_time': 0,
            'avg_time': 0,
            'max_time': 0,
            'min_time': float('inf'),
            'recent_calls': deque(maxlen=100)
        })
        self.system_metrics = deque(maxlen=1440)  # 24시간 분 단위
        self.cache = {}
        self.cache_stats = {'hits': 0, 'misses': 0, 'total': 0}
        
    def performance_monitor(self, endpoint_name):
        """API 성능 모니터링 데코레이터"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                
                try:
                    result = func(*args, **kwargs)
                    success = True
                except Exception as e:
                    result = None
                    success = False
                    raise e
                finally:
                    end_time = time.time()
                    execution_time = end_time - start_time
                    
                    # 메트릭 업데이트
                    self._update_api_metrics(endpoint_name, execution_time, success)
                
                return result
            return wrapper
        return decorator
    
    def _update_api_metrics(self, endpoint_name, execution_time, success):
        """API 메트릭 업데이트"""
        metrics = self.api_metrics[endpoint_name]
        
        metrics['call_count'] += 1
        metrics['total_time'] += execution_time
        metrics['avg_time'] = metrics['total_time'] / metrics['call_count']
        metrics['max_time'] = max(metrics['max_time'], execution_time)
        metrics['min_time'] = min(metrics['min_time'], execution_time)
        
        metrics['recent_calls'].append({
            'timestamp': datetime.now().isoformat(),
            'execution_time': execution_time,
            'success': success
        })
    
    def cache_result(self, key, value, ttl=300):
        """결과 캐싱 (TTL: Time To Live in seconds)"""
        expiry_time = datetime.now() + timedelta(seconds=ttl)
        self.cache[key] = {
            'value': value,
            'expiry': expiry_time,
            'created': datetime.now()
        }
    
    def get_cached_result(self, key):
        """캐시된 결과 조회"""
        self.cache_stats['total'] += 1
        
        if key in self.cache:
            cached_item = self.cache[key]
            if datetime.now() < cached_item['expiry']:
                self.cache_stats['hits'] += 1
                return cached_item['value']
            else:
                # 만료된 캐시 삭제
                del self.cache[key]
        
        self.cache_stats['misses'] += 1
        return None
    
    def clear_expired_cache(self):
        """만료된 캐시 정리"""
        current_time = datetime.now()
        expired_keys = [
            key for key, item in self.cache.items()
            if current_time >= item['expiry']
        ]
        
        for key in expired_keys:
            del self.cache[key]
        
        return len(expired_keys)
    
    def collect_system_metrics(self):
        """시스템 메트릭 수집"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            network = psutil.net_io_counters()
            
            metric = {
                'timestamp': datetime.now().isoformat(),
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available': memory.available,
                'disk_percent': (disk.used / disk.total) * 100,
                'network_bytes_sent': network.bytes_sent,
                'network_bytes_recv': network.bytes_recv
            }
            
            self.system_metrics.append(metric)
            return metric
            
        except Exception as e:
            print(f"시스템 메트릭 수집 오류: {e}")
            return None
    
    def analyze_performance(self):
        """성능 분석 및 최적화 제안"""
        analysis = {
            'timestamp': datetime.now().isoformat(),
            'api_performance': {},
            'system_performance': {},
            'cache_performance': {},
            'recommendations': []
        }
        
        # API 성능 분석
        for endpoint, metrics in self.api_metrics.items():
            if metrics['call_count'] > 0:
                analysis['api_performance'][endpoint] = {
                    'call_count': metrics['call_count'],
                    'avg_response_time': round(metrics['avg_time'], 3),
                    'max_response_time': round(metrics['max_time'], 3),
                    'min_response_time': round(metrics['min_time'], 3),
                    'calls_per_minute': self._calculate_calls_per_minute(metrics['recent_calls'])
                }
                
                # 느린 API 감지
                if metrics['avg_time'] > 1.0:
                    analysis['recommendations'].append({
                        'type': 'performance',
                        'priority': 'high',
                        'message': f"{endpoint} API의 평균 응답시간이 {metrics['avg_time']:.3f}초로 느립니다. 최적화가 필요합니다."
                    })
        
        # 시스템 성능 분석
        if self.system_metrics:
            recent_metrics = list(self.system_metrics)[-60:]  # 최근 1시간
            
            avg_cpu = sum(m['cpu_percent'] for m in recent_metrics) / len(recent_metrics)
            avg_memory = sum(m['memory_percent'] for m in recent_metrics) / len(recent_metrics)
            
            analysis['system_performance'] = {
                'avg_cpu_percent': round(avg_cpu, 1),
                'avg_memory_percent': round(avg_memory, 1),
                'current_cpu': recent_metrics[-1]['cpu_percent'],
                'current_memory': recent_metrics[-1]['memory_percent']
            }
            
            # 시스템 리소스 경고
            if avg_cpu > 70:
                analysis['recommendations'].append({
                    'type': 'system',
                    'priority': 'medium',
                    'message': f"평균 CPU 사용률이 {avg_cpu:.1f}%로 높습니다. 서버 리소스 증설을 고려하세요."
                })
            
            if avg_memory > 80:
                analysis['recommendations'].append({
                    'type': 'system',
                    'priority': 'high',
                    'message': f"평균 메모리 사용률이 {avg_memory:.1f}%로 높습니다. 메모리 최적화가 필요합니다."
                })
        
        # 캐시 성능 분석
        if self.cache_stats['total'] > 0:
            hit_rate = (self.cache_stats['hits'] / self.cache_stats['total']) * 100
            analysis['cache_performance'] = {
                'hit_rate': round(hit_rate, 1),
                'total_requests': self.cache_stats['total'],
                'cache_hits': self.cache_stats['hits'],
                'cache_misses': self.cache_stats['misses'],
                'cache_size': len(self.cache)
            }
            
            if hit_rate < 50:
                analysis['recommendations'].append({
                    'type': 'cache',
                    'priority': 'medium',
                    'message': f"캐시 히트율이 {hit_rate:.1f}%로 낮습니다. 캐시 전략을 개선하세요."
                })
        
        # 일반적인 최적화 제안
        if len(analysis['recommendations']) == 0:
            analysis['recommendations'].append({
                'type': 'general',
                'priority': 'low',
                'message': "시스템이 원활하게 작동하고 있습니다. 정기적인 모니터링을 계속하세요."
            })
        
        return analysis
    
    def _calculate_calls_per_minute(self, recent_calls):
        """분당 호출 수 계산"""
        if not recent_calls:
            return 0
        
        now = datetime.now()
        one_minute_ago = now - timedelta(minutes=1)
        
        recent_count = sum(
            1 for call in recent_calls
            if datetime.fromisoformat(call['timestamp']) >= one_minute_ago
        )
        
        return recent_count
    
    def optimize_system(self):
        """시스템 자동 최적화"""
        optimizations = []
        
        # 만료된 캐시 정리
        expired_count = self.clear_expired_cache()
        if expired_count > 0:
            optimizations.append(f"만료된 캐시 {expired_count}개 정리")
        
        # 메트릭 데이터 정리 (오래된 데이터 삭제)
        if len(self.system_metrics) > 1000:
            # 최근 1000개만 유지
            old_count = len(self.system_metrics) - 1000
            for _ in range(old_count):
                self.system_metrics.popleft()
            optimizations.append(f"오래된 시스템 메트릭 {old_count}개 정리")
        
        return optimizations
    
    def generate_performance_report(self):
        """성능 보고서 생성"""
        analysis = self.analyze_performance()
        optimizations = self.optimize_system()
        
        print("🚀 CORBU.AI 성능 분석 보고서")
        print("=" * 50)
        print(f"📅 생성 시간: {analysis['timestamp']}")
        
        # API 성능
        if analysis['api_performance']:
            print(f"\n📡 API 성능:")
            for endpoint, perf in analysis['api_performance'].items():
                print(f"   {endpoint}:")
                print(f"     • 호출 수: {perf['call_count']}회")
                print(f"     • 평균 응답시간: {perf['avg_response_time']}초")
                print(f"     • 분당 호출: {perf['calls_per_minute']}회")
        
        # 시스템 성능
        if analysis['system_performance']:
            print(f"\n💻 시스템 성능:")
            sys_perf = analysis['system_performance']
            print(f"   • 평균 CPU: {sys_perf['avg_cpu_percent']}%")
            print(f"   • 평균 메모리: {sys_perf['avg_memory_percent']}%")
            print(f"   • 현재 CPU: {sys_perf['current_cpu']}%")
            print(f"   • 현재 메모리: {sys_perf['current_memory']}%")
        
        # 캐시 성능
        if analysis['cache_performance']:
            print(f"\n🗄️  캐시 성능:")
            cache_perf = analysis['cache_performance']
            print(f"   • 히트율: {cache_perf['hit_rate']}%")
            print(f"   • 총 요청: {cache_perf['total_requests']}회")
            print(f"   • 캐시 크기: {cache_perf['cache_size']}개")
        
        # 최적화 제안
        print(f"\n💡 최적화 제안:")
        for rec in analysis['recommendations']:
            priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(rec['priority'], "ℹ️")
            print(f"   {priority_emoji} {rec['message']}")
        
        # 자동 최적화 결과
        if optimizations:
            print(f"\n🔧 자동 최적화 완료:")
            for opt in optimizations:
                print(f"   ✅ {opt}")
        
        print("=" * 50)
        
        return analysis

# 전역 성능 최적화 인스턴스
performance_optimizer = PerformanceOptimizer()

# 시스템 메트릭 수집 스레드 시작
def start_performance_monitoring():
    """성능 모니터링 시작"""
    def collect_metrics():
        while True:
            performance_optimizer.collect_system_metrics()
            time.sleep(60)  # 1분마다 수집
    
    monitoring_thread = threading.Thread(target=collect_metrics, daemon=True)
    monitoring_thread.start()
    print("📊 성능 모니터링이 시작되었습니다 (1분마다 수집)")

if __name__ == "__main__":
    # 테스트 실행
    start_performance_monitoring()
    
    # 잠시 대기 후 보고서 생성
    print("성능 데이터 수집 중...")
    time.sleep(5)
    
    performance_optimizer.generate_performance_report()
