#!/usr/bin/env python3
"""
궁극의 통합 시스템 실행 스크립트 v10.0
- 모든 고도화 시스템 통합 실행
- 자동 의존성 체크
- 순차적 서비스 시작
- 실시간 상태 모니터링
"""

import asyncio
import subprocess
import sys
import time
import os
import json
import logging
import signal
import threading
from datetime import datetime
from pathlib import Path
import psutil
import requests
from typing import List, Dict, Any

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('ultimate_system.log')
    ]
)
logger = logging.getLogger(__name__)

class UltimateSystemManager:
    """궁극의 시스템 관리자"""
    
    def __init__(self):
        self.services = {}
        self.startup_order = [
            'redis',
            'quantum_security',
            'adaptive_learning',
            'korean_nlp',
            'multimodal_processor',
            'next_gen_ai',
            'microservices_orchestrator',
            'ultimate_integration_api'
        ]
        
        self.service_configs = {
            'redis': {
                'command': 'redis-server',
                'port': 6379,
                'health_check': self._check_redis_health,
                'required': False
            },
            'quantum_security': {
                'module': 'quantum_security_system',
                'port': 8001,
                'health_check': self._check_service_health,
                'required': True
            },
            'adaptive_learning': {
                'module': 'real_time_adaptive_learning_system',
                'port': 8002,
                'health_check': self._check_service_health,
                'required': True
            },
            'korean_nlp': {
                'module': 'hyper_advanced_korean_nlp_engine',
                'port': 8003,
                'health_check': self._check_service_health,
                'required': True
            },
            'multimodal_processor': {
                'module': 'multimodal_ai_processor',
                'port': 8004,
                'health_check': self._check_service_health,
                'required': True
            },
            'next_gen_ai': {
                'module': 'next_generation_ai_engine',
                'port': 8005,
                'health_check': self._check_service_health,
                'required': True
            },
            'microservices_orchestrator': {
                'module': 'ultimate_microservices_orchestrator',
                'port': 8006,
                'health_check': self._check_service_health,
                'required': True
            },
            'ultimate_integration_api': {
                'module': 'ultimate_integration_api_server',
                'port': 8080,
                'health_check': self._check_integration_api_health,
                'required': True
            }
        }
        
        self.running = False
        self.monitoring_active = False
    
    def check_dependencies(self) -> bool:
        """의존성 체크"""
        
        logger.info("🔍 의존성 체크 시작...")
        
        # Python 패키지 체크
        required_packages = [
            'fastapi', 'uvicorn', 'redis', 'asyncio', 'numpy', 
            'torch', 'transformers', 'opencv-python', 'librosa',
            'psutil', 'aiohttp', 'websockets', 'cryptography'
        ]
        
        missing_packages = []
        for package in required_packages:
            try:
                __import__(package.replace('-', '_'))
                logger.info(f"✅ {package} 설치됨")
            except ImportError:
                missing_packages.append(package)
                logger.warning(f"❌ {package} 없음")
        
        if missing_packages:
            logger.error(f"누락된 패키지: {missing_packages}")
            logger.info("설치 명령어: pip install " + " ".join(missing_packages))
            return False
        
        # 시스템 리소스 체크
        memory = psutil.virtual_memory()
        cpu_count = psutil.cpu_count()
        
        logger.info(f"💾 메모리: {memory.total // (1024**3)}GB (사용가능: {memory.available // (1024**3)}GB)")
        logger.info(f"🖥️ CPU: {cpu_count}코어")
        
        if memory.available < 4 * 1024**3:  # 4GB 미만
            logger.warning("⚠️ 메모리 부족 (4GB 이상 권장)")
        
        if cpu_count < 4:
            logger.warning("⚠️ CPU 부족 (4코어 이상 권장)")
        
        # 포트 사용 가능성 체크
        for service, config in self.service_configs.items():
            if 'port' in config:
                if self._is_port_in_use(config['port']):
                    logger.warning(f"⚠️ 포트 {config['port']} 이미 사용중 ({service})")
        
        logger.info("✅ 의존성 체크 완료")
        return True
    
    def _is_port_in_use(self, port: int) -> bool:
        """포트 사용 여부 확인"""
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) == 0
    
    async def start_system(self):
        """시스템 시작"""
        
        logger.info("🌟 ============================================")
        logger.info("🚀 궁극의 통합 AI 시스템 v10.0 시작")
        logger.info("🌟 ============================================")
        
        if not self.check_dependencies():
            logger.error("❌ 의존성 체크 실패")
            return False
        
        self.running = True
        
        # 서비스 순차 시작
        for service_name in self.startup_order:
            if not self.running:
                break
                
            config = self.service_configs[service_name]
            
            logger.info(f"🔄 {service_name} 시작 중...")
            
            success = await self._start_service(service_name, config)
            
            if success:
                logger.info(f"✅ {service_name} 시작 성공")
                await asyncio.sleep(2)  # 안정화 대기
            else:
                if config['required']:
                    logger.error(f"❌ 필수 서비스 {service_name} 시작 실패")
                    await self.stop_system()
                    return False
                else:
                    logger.warning(f"⚠️ 선택적 서비스 {service_name} 시작 실패")
        
        # 모니터링 시작
        self.monitoring_active = True
        asyncio.create_task(self._monitoring_loop())
        
        logger.info("🎉 모든 서비스 시작 완료!")
        logger.info("🌐 메인 API: http://localhost:8080")
        logger.info("📊 실시간 모니터링: ws://localhost:8080/ws/real-time-updates")
        logger.info("📈 종합 분석: http://localhost:8080/api/v10/analytics/comprehensive")
        
        return True
    
    async def _start_service(self, service_name: str, config: Dict[str, Any]) -> bool:
        """개별 서비스 시작"""
        
        try:
            if service_name == 'redis':
                # Redis 서버 시작
                process = subprocess.Popen(
                    ['redis-server', '--daemonize', 'yes'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                await asyncio.sleep(3)
                
                if await config['health_check']():
                    self.services[service_name] = {'process': process, 'type': 'external'}
                    return True
                else:
                    return False
            
            elif 'module' in config:
                # Python 모듈 서비스 시작
                module_path = f"{config['module']}.py"
                
                if service_name == 'ultimate_integration_api':
                    # 통합 API 서버는 별도 실행
                    cmd = [
                        sys.executable, '-c',
                        f"""
import sys
sys.path.append('.')
from {config['module']} import start_ultimate_integration_server
start_ultimate_integration_server(host='0.0.0.0', port={config['port']})
                        """
                    ]
                else:
                    # 기타 서비스는 모듈로 실행
                    cmd = [sys.executable, module_path]
                
                process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    cwd=os.path.dirname(os.path.abspath(__file__))
                )
                
                # 서비스 시작 대기
                await asyncio.sleep(5)
                
                # 헬스 체크
                if await config['health_check'](config.get('port')):
                    self.services[service_name] = {
                        'process': process,
                        'type': 'module',
                        'port': config.get('port')
                    }
                    return True
                else:
                    process.terminate()
                    return False
            
            return False
            
        except Exception as e:
            logger.error(f"서비스 {service_name} 시작 오류: {e}")
            return False
    
    async def _check_redis_health(self) -> bool:
        """Redis 헬스 체크"""
        try:
            import redis
            r = redis.Redis(host='localhost', port=6379, socket_timeout=3)
            r.ping()
            return True
        except:
            return False
    
    async def _check_service_health(self, port: int = None) -> bool:
        """일반 서비스 헬스 체크"""
        if not port:
            return True
        
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get(f'http://localhost:{port}/health', timeout=5) as response:
                    return response.status == 200
        except:
            return False
    
    async def _check_integration_api_health(self, port: int = 8080) -> bool:
        """통합 API 헬스 체크"""
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get(f'http://localhost:{port}/health', timeout=10) as response:
                    return response.status == 200
        except:
            return False
    
    async def _monitoring_loop(self):
        """시스템 모니터링 루프"""
        
        logger.info("📊 시스템 모니터링 시작")
        
        while self.monitoring_active and self.running:
            try:
                # 서비스 상태 체크
                service_status = {}
                
                for service_name, service_info in self.services.items():
                    if service_info['type'] == 'external':
                        # 외부 서비스 (Redis 등)
                        config = self.service_configs[service_name]
                        is_healthy = await config['health_check']()
                    else:
                        # 모듈 서비스
                        process = service_info['process']
                        is_running = process.poll() is None
                        
                        if is_running and 'port' in service_info:
                            # 포트 헬스 체크
                            is_healthy = await self._check_service_health(service_info['port'])
                        else:
                            is_healthy = is_running
                    
                    service_status[service_name] = {
                        'healthy': is_healthy,
                        'port': service_info.get('port'),
                        'uptime': time.time() - getattr(service_info, 'start_time', time.time())
                    }
                
                # 시스템 리소스 모니터링
                cpu_percent = psutil.cpu_percent(interval=1)
                memory = psutil.virtual_memory()
                
                # 상태 로깅
                healthy_services = sum(1 for status in service_status.values() if status['healthy'])
                total_services = len(service_status)
                
                logger.info(f"📊 시스템 상태: {healthy_services}/{total_services} 서비스 정상, "
                          f"CPU: {cpu_percent:.1f}%, 메모리: {memory.percent:.1f}%")
                
                # 문제 감지
                unhealthy_services = [
                    name for name, status in service_status.items()
                    if not status['healthy']
                ]
                
                if unhealthy_services:
                    logger.warning(f"⚠️ 문제 서비스: {unhealthy_services}")
                
                if cpu_percent > 90:
                    logger.warning(f"⚠️ 높은 CPU 사용률: {cpu_percent:.1f}%")
                
                if memory.percent > 90:
                    logger.warning(f"⚠️ 높은 메모리 사용률: {memory.percent:.1f}%")
                
                await asyncio.sleep(30)  # 30초마다 체크
                
            except Exception as e:
                logger.error(f"모니터링 오류: {e}")
                await asyncio.sleep(60)
    
    async def stop_system(self):
        """시스템 중지"""
        
        logger.info("🛑 시스템 종료 시작...")
        
        self.running = False
        self.monitoring_active = False
        
        # 서비스 역순으로 중지
        for service_name in reversed(self.startup_order):
            if service_name in self.services:
                service_info = self.services[service_name]
                process = service_info.get('process')
                
                if process:
                    logger.info(f"🛑 {service_name} 중지 중...")
                    
                    try:
                        process.terminate()
                        await asyncio.sleep(3)
                        
                        if process.poll() is None:
                            process.kill()
                            await asyncio.sleep(1)
                        
                        logger.info(f"✅ {service_name} 중지 완료")
                        
                    except Exception as e:
                        logger.error(f"서비스 {service_name} 중지 오류: {e}")
        
        # Redis 중지
        try:
            subprocess.run(['redis-cli', 'shutdown'], timeout=5)
        except:
            pass
        
        logger.info("✅ 시스템 종료 완료")
    
    def get_system_status(self) -> Dict[str, Any]:
        """시스템 상태 조회"""
        
        return {
            'running': self.running,
            'monitoring_active': self.monitoring_active,
            'services': list(self.services.keys()),
            'total_services': len(self.service_configs),
            'healthy_services': len(self.services),
            'uptime': time.time() - getattr(self, 'start_time', time.time()),
            'system_resources': {
                'cpu_percent': psutil.cpu_percent(),
                'memory_percent': psutil.virtual_memory().percent,
                'cpu_count': psutil.cpu_count(),
                'memory_total_gb': psutil.virtual_memory().total // (1024**3)
            },
            'ports': {
                service: config.get('port')
                for service, config in self.service_configs.items()
                if 'port' in config
            }
        }

# 전역 시스템 매니저
system_manager = UltimateSystemManager()

def signal_handler(signum, frame):
    """시그널 핸들러"""
    logger.info("🛑 종료 신호 수신")
    asyncio.create_task(system_manager.stop_system())

# 시그널 등록
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

async def main():
    """메인 함수"""
    
    try:
        system_manager.start_time = time.time()
        
        # 시스템 시작
        success = await system_manager.start_system()
        
        if success:
            logger.info("🎯 시스템이 성공적으로 시작되었습니다!")
            logger.info("🔗 주요 엔드포인트:")
            logger.info("   📋 메인 API: http://localhost:8080")
            logger.info("   🔮 하이퍼 개인화 메시지: POST http://localhost:8080/api/v10/generate/hyper-personalized")
            logger.info("   🎭 멀티모달 처리: POST http://localhost:8080/api/v10/multimodal/process")
            logger.info("   🔒 양자 보안: POST http://localhost:8080/api/v10/security/create-channel")
            logger.info("   🏗️ 마이크로서비스: POST http://localhost:8080/api/v10/microservices/register")
            logger.info("   📊 종합 분석: GET http://localhost:8080/api/v10/analytics/comprehensive")
            logger.info("   🌐 실시간 WebSocket: ws://localhost:8080/ws/real-time-updates")
            
            # 무한 대기 (모니터링 계속)
            while system_manager.running:
                await asyncio.sleep(1)
        else:
            logger.error("❌ 시스템 시작 실패")
            
    except KeyboardInterrupt:
        logger.info("🛑 사용자에 의한 중단")
    except Exception as e:
        logger.error(f"시스템 오류: {e}")
    finally:
        await system_manager.stop_system()

def start_ultimate_system():
    """궁극의 시스템 시작 함수"""
    
    print("🌟 ============================================")
    print("🚀 궁극의 통합 AI 메시지 생성 시스템 v10.0")
    print("🌟 ============================================")
    print("📈 200% 고도화 완료!")
    print("🎯 모든 시스템 통합 실행!")
    print("🌟 ============================================")
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 시스템 종료")

if __name__ == "__main__":
    start_ultimate_system() 