#!/usr/bin/env python3
import psutil
import time
import json
from datetime import datetime

def get_system_stats():
    return {
        "timestamp": datetime.now().isoformat(),
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent,
        "network_io": psutil.net_io_counters()._asdict()
    }

def monitor_performance(duration=60):
    print(f"🔍 {duration}초 동안 성능 모니터링 시작...")
    stats = []
    
    for i in range(duration):
        stats.append(get_system_stats())
        time.sleep(1)
        if i % 10 == 0:
            print(f"진행률: {i}/{duration}초")
    
    # 평균 계산
    avg_cpu = sum(s["cpu_percent"] for s in stats) / len(stats)
    avg_memory = sum(s["memory_percent"] for s in stats) / len(stats)
    
    print(f"📊 성능 통계:")
    print(f"  평균 CPU 사용률: {avg_cpu:.1f}%")
    print(f"  평균 메모리 사용률: {avg_memory:.1f}%")
    
    return stats

if __name__ == "__main__":
    try:
        monitor_performance(30)
    except KeyboardInterrupt:
        print("\n⏹️ 모니터링 중단됨")
