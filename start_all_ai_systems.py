#!/usr/bin/env python3
"""
모든 AI 시스템을 한 번에 실행하는 스크립트
"""
import subprocess
import time
import signal
import sys
import os
from typing import List, Dict
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AISystemManager:
    """AI 시스템 관리자"""
    
    def __init__(self):
        self.processes: List[subprocess.Popen] = []
        self.ai_systems = {
            "integrated_frontend_dashboard": {
                "file": "integrated_frontend_dashboard.py",
                "port": 8000,
                "description": "통합 프론트엔드 대시보드"
            },
            "deep_learning_yoo_system": {
                "file": "deep_learning_yoo_system.py", 
                "port": 8002,
                "description": "유시민 딥러닝 AI 시스템"
            },
            "transdimensional_ai_system": {
                "file": "transdimensional_ai_system.py",
                "port": 8023,
                "description": "차원 초월 AI 시스템"
            },
            "quantum_consciousness_ai_system": {
                "file": "quantum_consciousness_ai_system.py",
                "port": 8024,
                "description": "양자 의식 AI 시스템"
            },
            "holographic_ai_system": {
                "file": "holographic_ai_system.py",
                "port": 8025,
                "description": "홀로그래픽 AI 시스템"
            },
            "ultimate_integrated_ai_system": {
                "file": "ultimate_integrated_ai_system.py",
                "port": 8026,
                "description": "궁극의 통합 AI 시스템"
            },
            "advanced_ml_ai_system": {
                "file": "advanced_ml_ai_system.py",
                "port": 8027,
                "description": "고급 머신러닝 AI 시스템"
            },
            "final_unified_ai_system": {
                "file": "final_unified_ai_system.py",
                "port": 8028,
                "description": "최종 통합 AI 시스템"
            }
        }
    
    def start_all_systems(self):
        """모든 AI 시스템 시작"""
        logger.info("🚀 모든 AI 시스템을 시작합니다...")
        
        for system_name, config in self.ai_systems.items():
            try:
                self._start_system(system_name, config)
                time.sleep(2)  # 각 시스템 간 간격
            except Exception as e:
                logger.error(f"시스템 {system_name} 시작 실패: {e}")
        
        logger.info(f"✅ 총 {len(self.processes)}개의 AI 시스템이 시작되었습니다!")
        self._print_system_status()
    
    def _start_system(self, system_name: str, config: Dict):
        """개별 시스템 시작"""
        file_path = config["file"]
        port = config["port"]
        description = config["description"]
        
        if not os.path.exists(file_path):
            logger.warning(f"파일 {file_path}가 존재하지 않습니다. 건너뜁니다.")
            return
        
        logger.info(f"시작 중: {description} (포트 {port})")
        
        try:
            # Python3로 실행
            process = subprocess.Popen(
                ["python3", file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            self.processes.append(process)
            logger.info(f"✅ {description} 시작됨 (PID: {process.pid})")
            
        except Exception as e:
            logger.error(f"❌ {description} 시작 실패: {e}")
    
    def _print_system_status(self):
        """시스템 상태 출력"""
        print("\n" + "="*60)
        print("🌟 AI 시스템 상태")
        print("="*60)
        
        for i, (system_name, config) in enumerate(self.ai_systems.items(), 1):
            port = config["port"]
            description = config["description"]
            status = "🟢 실행 중" if i <= len(self.processes) else "🔴 중지됨"
            
            print(f"{i:2d}. {description}")
            print(f"    포트: {port}")
            print(f"    상태: {status}")
            print(f"    URL: http://localhost:{port}")
            print()
        
        print("="*60)
        print("🎯 메인 대시보드: http://localhost:8000")
        print("📚 API 문서: 각 시스템의 /docs 엔드포인트")
        print("="*60)
    
    def stop_all_systems(self):
        """모든 AI 시스템 중지"""
        logger.info("🛑 모든 AI 시스템을 중지합니다...")
        
        for process in self.processes:
            try:
                process.terminate()
                process.wait(timeout=5)
                logger.info(f"✅ 프로세스 {process.pid} 중지됨")
            except subprocess.TimeoutExpired:
                process.kill()
                logger.warning(f"⚠️ 프로세스 {process.pid} 강제 종료됨")
            except Exception as e:
                logger.error(f"❌ 프로세스 중지 실패: {e}")
        
        self.processes.clear()
        logger.info("✅ 모든 AI 시스템이 중지되었습니다.")
    
    def monitor_systems(self):
        """시스템 모니터링"""
        logger.info("📊 시스템 모니터링을 시작합니다...")
        
        try:
            while True:
                time.sleep(10)
                
                # 실행 중인 프로세스 확인
                active_processes = []
                for process in self.processes:
                    if process.poll() is None:  # 프로세스가 실행 중
                        active_processes.append(process)
                    else:
                        logger.warning(f"⚠️ 프로세스 {process.pid}가 종료됨")
                
                self.processes = active_processes
                
                if not self.processes:
                    logger.info("모든 시스템이 종료되었습니다.")
                    break
                
                logger.info(f"📊 {len(self.processes)}개 시스템 실행 중...")
                
        except KeyboardInterrupt:
            logger.info("사용자에 의해 모니터링이 중단되었습니다.")
            self.stop_all_systems()

def signal_handler(signum, frame):
    """시그널 핸들러"""
    print("\n🛑 종료 신호를 받았습니다. 모든 시스템을 중지합니다...")
    manager.stop_all_systems()
    sys.exit(0)

if __name__ == "__main__":
    # 시그널 핸들러 등록
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    manager = AISystemManager()
    
    try:
        # 모든 시스템 시작
        manager.start_all_systems()
        
        # 시스템 모니터링
        manager.monitor_systems()
        
    except Exception as e:
        logger.error(f"오류 발생: {e}")
        manager.stop_all_systems()
        sys.exit(1)
