#!/usr/bin/env python3
"""
시스템 상태 모니터링 대시보드
"""

import psutil
import requests
import time
import os
from datetime import datetime

class SystemMonitor:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        
    def get_system_info(self):
        """시스템 정보 수집"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'memory_used': memory.used // (1024**3),  # GB
            'memory_total': memory.total // (1024**3),  # GB
            'disk_percent': disk.percent,
            'disk_used': disk.used // (1024**3),  # GB
            'disk_total': disk.total // (1024**3),  # GB
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    
    def check_backend_status(self):
        """백엔드 서버 상태 확인"""
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=2)
            return response.status_code == 200
        except:
            return False
    
    def check_frontend_status(self):
        """프론트엔드 서버 상태 확인"""
        try:
            response = requests.get(self.frontend_url, timeout=2)
            return response.status_code == 200
        except:
            return False
    
    def get_process_info(self):
        """프로세스 정보 수집"""
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                if proc.info['name'] in ['python', 'node', 'react-scripts']:
                    processes.append({
                        'pid': proc.info['pid'],
                        'name': proc.info['name'],
                        'cpu_percent': proc.info['cpu_percent'],
                        'memory_percent': proc.info['memory_percent']
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        return processes
    
    def display_dashboard(self):
        """대시보드 표시"""
        os.system('clear' if os.name == 'posix' else 'cls')
        
        print("🖥️  CORBU AI 시스템 모니터링 대시보드")
        print("=" * 60)
        
        # 시스템 정보
        sys_info = self.get_system_info()
        print(f"📊 시스템 정보 ({sys_info['timestamp']})")
        print(f"   CPU 사용률: {sys_info['cpu_percent']:5.1f}%")
        print(f"   메모리: {sys_info['memory_used']:3d}GB / {sys_info['memory_total']:3d}GB ({sys_info['memory_percent']:5.1f}%)")
        print(f"   디스크: {sys_info['disk_used']:3d}GB / {sys_info['disk_total']:3d}GB ({sys_info['disk_percent']:5.1f}%)")
        
        # 서버 상태
        print(f"\n🌐 서버 상태")
        backend_status = "🟢 정상" if self.check_backend_status() else "🔴 오류"
        frontend_status = "🟢 정상" if self.check_frontend_status() else "🔴 오류"
        print(f"   백엔드 서버: {backend_status}")
        print(f"   프론트엔드 서버: {frontend_status}")
        
        # 프로세스 정보
        processes = self.get_process_info()
        if processes:
            print(f"\n⚙️  주요 프로세스")
            for proc in processes[:5]:  # 상위 5개만 표시
                print(f"   {proc['name']:15} (PID: {proc['pid']:5d}) - CPU: {proc['cpu_percent']:5.1f}%, MEM: {proc['memory_percent']:5.1f}%")
        
        # 연결 정보
        print(f"\n🔗 연결 정보")
        print(f"   백엔드 API: {self.backend_url}")
        print(f"   프론트엔드: {self.frontend_url}")
        print(f"   API 문서: {self.backend_url}/docs")
        
        # 사용 안내
        print(f"\n📋 사용 안내")
        print(f"   • 프론트엔드 접속: {self.frontend_url}")
        print(f"   • API 테스트: {self.backend_url}/docs")
        print(f"   • 종료: Ctrl+C")
        
        print("\n" + "=" * 60)
    
    def run_monitor(self, interval=5):
        """모니터링 실행"""
        print("🚀 시스템 모니터링 시작...")
        print("5초마다 업데이트됩니다.")
        
        try:
            while True:
                self.display_dashboard()
                time.sleep(interval)
        except KeyboardInterrupt:
            print("\n\n👋 모니터링을 종료합니다.")

def main():
    """메인 함수"""
    monitor = SystemMonitor()
    monitor.run_monitor()

if __name__ == "__main__":
    main() 