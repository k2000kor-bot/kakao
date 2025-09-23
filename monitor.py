#!/usr/bin/env python3
"""
CORBU.AI 시스템 모니터링 도구
서버 상태, 성능, 리소스 사용량을 모니터링합니다.
"""

import os
import sys
import time
import json
import psutil
import requests
from datetime import datetime
from typing import Dict, List, Any

class CorbuAIMonitor:
    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url
        self.monitoring_data = []
        
    def check_server_health(self) -> Dict[str, Any]:
        """서버 헬스체크"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=5)
            if response.status_code == 200:
                return {
                    "status": "healthy",
                    "response_time": response.elapsed.total_seconds(),
                    "data": response.json()
                }
            else:
                return {
                    "status": "unhealthy", 
                    "response_time": None,
                    "error": f"HTTP {response.status_code}"
                }
        except Exception as e:
            return {
                "status": "error",
                "response_time": None, 
                "error": str(e)
            }
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """시스템 리소스 메트릭"""
        try:
            # CPU 사용률
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # 메모리 사용률
            memory = psutil.virtual_memory()
            
            # 디스크 사용률
            disk = psutil.disk_usage('/')
            
            # 네트워크 통계
            network = psutil.net_io_counters()
            
            return {
                "timestamp": datetime.now().isoformat(),
                "cpu": {
                    "percent": cpu_percent,
                    "count": psutil.cpu_count()
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "percent": memory.percent,
                    "used": memory.used
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
            }
        except Exception as e:
            return {"error": str(e)}
    
    def get_process_info(self) -> List[Dict[str, Any]]:
        """CORBU.AI 관련 프로세스 정보"""
        processes = []
        
        for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cpu_percent', 'memory_percent']):
            try:
                cmdline = ' '.join(proc.info['cmdline'] or [])
                if any(keyword in cmdline.lower() for keyword in ['corbu', 'complete_server', 'production_server', 'gunicorn']):
                    processes.append({
                        "pid": proc.info['pid'],
                        "name": proc.info['name'],
                        "cmdline": cmdline[:100] + "..." if len(cmdline) > 100 else cmdline,
                        "cpu_percent": proc.info['cpu_percent'],
                        "memory_percent": proc.info['memory_percent']
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
                
        return processes
    
    def check_log_files(self) -> Dict[str, Any]:
        """로그 파일 상태 확인"""
        log_info = {}
        log_dirs = ['logs', '.']
        log_files = ['corbu_ai.log', 'error.log', 'access.log', 'backend.log', 'frontend.log']
        
        for log_dir in log_dirs:
            for log_file in log_files:
                log_path = os.path.join(log_dir, log_file)
                if os.path.exists(log_path):
                    stat = os.stat(log_path)
                    log_info[log_file] = {
                        "path": log_path,
                        "size": stat.st_size,
                        "size_mb": round(stat.st_size / (1024*1024), 2),
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                    }
        
        return log_info
    
    def check_api_endpoints(self) -> Dict[str, Any]:
        """주요 API 엔드포인트 확인"""
        endpoints = [
            "/api/health",
            "/api/chat-history", 
            "/sw.js",
            "/"
        ]
        
        results = {}
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=5)
                results[endpoint] = {
                    "status_code": response.status_code,
                    "response_time": response.elapsed.total_seconds(),
                    "accessible": response.status_code < 400
                }
            except Exception as e:
                results[endpoint] = {
                    "status_code": None,
                    "response_time": None,
                    "accessible": False,
                    "error": str(e)
                }
        
        return results
    
    def generate_report(self) -> Dict[str, Any]:
        """종합 모니터링 보고서 생성"""
        print("🔍 CORBU.AI 시스템 모니터링 중...")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "server_health": self.check_server_health(),
            "system_metrics": self.get_system_metrics(),
            "processes": self.get_process_info(),
            "log_files": self.check_log_files(),
            "api_endpoints": self.check_api_endpoints()
        }
        
        return report
    
    def print_report(self, report: Dict[str, Any]):
        """보고서를 콘솔에 출력"""
        print("\n" + "="*60)
        print("🤖 CORBU.AI 시스템 모니터링 보고서")
        print("="*60)
        print(f"📅 생성 시간: {report['timestamp']}")
        
        # 서버 상태
        health = report['server_health']
        status_emoji = "✅" if health['status'] == 'healthy' else "❌"
        print(f"\n🏥 서버 상태: {status_emoji} {health['status']}")
        if health.get('response_time'):
            print(f"   응답 시간: {health['response_time']:.3f}초")
        if health.get('error'):
            print(f"   오류: {health['error']}")
        
        # 시스템 리소스
        if 'error' not in report['system_metrics']:
            metrics = report['system_metrics']
            print(f"\n💻 시스템 리소스:")
            print(f"   CPU: {metrics['cpu']['percent']:.1f}% (코어: {metrics['cpu']['count']}개)")
            print(f"   메모리: {metrics['memory']['percent']:.1f}% ({metrics['memory']['used']//1024//1024}MB / {metrics['memory']['total']//1024//1024}MB)")
            print(f"   디스크: {metrics['disk']['percent']:.1f}% ({metrics['disk']['used']//1024//1024//1024}GB / {metrics['disk']['total']//1024//1024//1024}GB)")
        
        # 프로세스 정보
        processes = report['processes']
        print(f"\n🔄 실행 중인 프로세스: {len(processes)}개")
        for proc in processes:
            print(f"   PID {proc['pid']}: {proc['name']} (CPU: {proc['cpu_percent']:.1f}%, 메모리: {proc['memory_percent']:.1f}%)")
        
        # 로그 파일
        logs = report['log_files']
        print(f"\n📝 로그 파일: {len(logs)}개")
        for log_name, log_info in logs.items():
            print(f"   {log_name}: {log_info['size_mb']}MB (수정: {log_info['modified'][:19]})")
        
        # API 엔드포인트
        endpoints = report['api_endpoints']
        print(f"\n🌐 API 엔드포인트:")
        for endpoint, info in endpoints.items():
            status_emoji = "✅" if info['accessible'] else "❌"
            print(f"   {status_emoji} {endpoint}: {info.get('status_code', 'N/A')}")
        
        print("\n" + "="*60)
    
    def save_report(self, report: Dict[str, Any], filename: str = None):
        """보고서를 파일로 저장"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"logs/monitoring_report_{timestamp}.json"
        
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"📊 보고서 저장: {filename}")
    
    def continuous_monitoring(self, interval: int = 60):
        """연속 모니터링"""
        print(f"🔄 연속 모니터링 시작 (간격: {interval}초)")
        print("Ctrl+C로 중단")
        
        try:
            while True:
                report = self.generate_report()
                self.print_report(report)
                
                # 심각한 문제 감지 시 알림
                self.check_alerts(report)
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n👋 모니터링을 중단합니다.")
    
    def check_alerts(self, report: Dict[str, Any]):
        """경고 조건 확인"""
        alerts = []
        
        # 서버 다운 확인
        if report['server_health']['status'] != 'healthy':
            alerts.append("🚨 서버가 응답하지 않습니다!")
        
        # 높은 CPU 사용률
        if 'error' not in report['system_metrics']:
            cpu_percent = report['system_metrics']['cpu']['percent']
            if cpu_percent > 80:
                alerts.append(f"⚠️  높은 CPU 사용률: {cpu_percent:.1f}%")
            
            # 높은 메모리 사용률
            memory_percent = report['system_metrics']['memory']['percent']
            if memory_percent > 85:
                alerts.append(f"⚠️  높은 메모리 사용률: {memory_percent:.1f}%")
            
            # 낮은 디스크 공간
            disk_percent = report['system_metrics']['disk']['percent']
            if disk_percent > 90:
                alerts.append(f"⚠️  디스크 공간 부족: {disk_percent:.1f}%")
        
        # 프로세스 없음
        if not report['processes']:
            alerts.append("⚠️  CORBU.AI 프로세스를 찾을 수 없습니다!")
        
        # 알림 출력
        if alerts:
            print("\n🚨 경고 사항:")
            for alert in alerts:
                print(f"   {alert}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="CORBU.AI 시스템 모니터링 도구")
    parser.add_argument("--url", default="http://localhost:8080", help="서버 URL")
    parser.add_argument("--continuous", "-c", action="store_true", help="연속 모니터링")
    parser.add_argument("--interval", "-i", type=int, default=60, help="모니터링 간격 (초)")
    parser.add_argument("--save", "-s", help="보고서 저장 파일명")
    
    args = parser.parse_args()
    
    monitor = CorbuAIMonitor(args.url)
    
    if args.continuous:
        monitor.continuous_monitoring(args.interval)
    else:
        report = monitor.generate_report()
        monitor.print_report(report)
        
        if args.save:
            monitor.save_report(report, args.save)

if __name__ == "__main__":
    main()
