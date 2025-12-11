"""
WebSocket API for real-time communication
실시간 통신을 위한 WebSocket API
"""
import asyncio
import json
import logging
import time
from datetime import datetime
from typing import Dict, List, Any
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter
import psutil
import random

logger = logging.getLogger(__name__)
router = APIRouter()

class ConnectionManager:
    """WebSocket 연결 관리자"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_data: Dict[WebSocket, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str = None):
        """새로운 연결 수락"""
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_data[websocket] = {
            'client_id': client_id or f"client_{len(self.active_connections)}",
            'connected_at': datetime.now().isoformat(),
            'last_ping': time.time()
        }
        logger.info(f"새로운 WebSocket 연결: {client_id}")
    
    def disconnect(self, websocket: WebSocket):
        """연결 해제"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            client_id = self.connection_data.get(websocket, {}).get('client_id', 'unknown')
            del self.connection_data[websocket]
            logger.info(f"WebSocket 연결 해제: {client_id}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """개별 메시지 전송"""
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"개별 메시지 전송 실패: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: str):
        """모든 연결에 브로드캐스트"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"브로드캐스트 실패: {e}")
                disconnected.append(connection)
        
        # 연결이 끊어진 클라이언트 제거
        for connection in disconnected:
            self.disconnect(connection)
    
    async def send_system_metrics(self):
        """시스템 메트릭 전송"""
        try:
            # 시스템 메트릭 수집
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            network = psutil.net_io_counters()
            
            # 네트워크 사용률 계산 (간단한 시뮬레이션)
            network_usage = random.uniform(10, 80)
            
            metrics = {
                'type': 'system_metrics',
                'timestamp': datetime.now().isoformat(),
                'data': {
                    'cpu': cpu_percent,
                    'memory': memory.percent,
                    'disk': disk.percent,
                    'network': network_usage,
                    'responseTime': random.uniform(50, 150),
                    'errorRate': random.uniform(0, 2),
                    'activeConnections': len(self.active_connections)
                }
            }
            
            await self.broadcast(json.dumps(metrics))
            
        except Exception as e:
            logger.error(f"시스템 메트릭 전송 실패: {e}")
    
    async def send_security_alerts(self):
        """보안 알림 전송"""
        try:
            # 보안 이벤트 시뮬레이션
            if random.random() < 0.1:  # 10% 확률로 보안 이벤트 발생
                alert_types = ['threat_detected', 'vulnerability_scan', 'access_denied', 'suspicious_activity']
                alert_type = random.choice(alert_types)
                
                alert = {
                    'type': 'security_alert',
                    'timestamp': datetime.now().isoformat(),
                    'data': {
                        'alert_type': alert_type,
                        'severity': random.choice(['low', 'medium', 'high']),
                        'message': f'{alert_type.replace("_", " ").title()} detected',
                        'source': f'192.168.1.{random.randint(1, 254)}',
                        'action': 'monitoring'
                    }
                }
                
                await self.broadcast(json.dumps(alert))
                
        except Exception as e:
            logger.error(f"보안 알림 전송 실패: {e}")
    
    async def send_ai_engine_status(self):
        """AI 엔진 상태 전송"""
        try:
            ai_models = ['GPT-4', 'BERT', 'Transformer', 'ResNet', 'LSTM']
            model_statuses = ['active', 'idle', 'processing', 'training']
            
            ai_status = {
                'type': 'ai_engine_status',
                'timestamp': datetime.now().isoformat(),
                'data': {
                    'models': [
                        {
                            'name': model,
                            'status': random.choice(model_statuses),
                            'accuracy': random.uniform(85, 99),
                            'processing_time': random.uniform(100, 1000),
                            'memory_usage': random.uniform(20, 80)
                        }
                        for model in ai_models
                    ],
                    'overall_performance': random.uniform(90, 99),
                    'active_requests': random.randint(0, 50)
                }
            }
            
            await self.broadcast(json.dumps(ai_status))
            
        except Exception as e:
            logger.error(f"AI 엔진 상태 전송 실패: {e}")
    
    async def send_performance_optimization(self):
        """성능 최적화 상태 전송"""
        try:
            optimization_types = ['memory', 'cpu', 'network', 'cache', 'database']
            optimization_status = {
                'type': 'performance_optimization',
                'timestamp': datetime.now().isoformat(),
                'data': {
                    'optimization_type': random.choice(optimization_types),
                    'status': random.choice(['running', 'completed', 'failed']),
                    'progress': random.randint(0, 100),
                    'estimated_completion': random.randint(30, 300),
                    'performance_gain': random.uniform(5, 25)
                }
            }
            
            await self.broadcast(json.dumps(optimization_status))
            
        except Exception as e:
            logger.error(f"성능 최적화 상태 전송 실패: {e}")
    
    async def send_security_threats(self, websocket: WebSocket = None):
        """보안 위협 정보 전송"""
        try:
            threat_types = ['SQL Injection', 'XSS Attack', 'Brute Force', 'DDoS', 'Malware']
            threat = {
                'type': 'threat',
                'timestamp': datetime.now().isoformat(),
                'data': {
                    'id': f"threat_{int(time.time())}",
                    'type': random.choice(threat_types),
                    'severity': random.choice(['low', 'medium', 'high', 'critical']),
                    'description': f"Detected {random.choice(threat_types).lower()} attempt",
                    'source_ip': f"192.168.{random.randint(1, 255)}.{random.randint(1, 255)}",
                    'status': 'detected',
                    'risk_score': round(random.uniform(0.1, 1.0), 2)
                }
            }
            
            if websocket:
                await self.send_personal_message(json.dumps(threat), websocket)
            else:
                await self.broadcast(json.dumps(threat))
                
        except Exception as e:
            logger.error(f"보안 위협 전송 실패: {e}")
    
    async def send_security_alerts_to_client(self, websocket: WebSocket):
        """클라이언트에게 보안 알림 전송"""
        try:
            if random.random() < 0.1:  # 10% 확률로 알림 생성
                alert_types = ['threat', 'anomaly', 'policy_violation', 'system_alert']
                alert = {
                    'type': 'alert',
                    'timestamp': datetime.now().isoformat(),
                    'data': {
                        'id': f"alert_{int(time.time())}",
                        'alert_type': random.choice(alert_types),
                        'severity': random.choice(['low', 'medium', 'high', 'critical']),
                        'title': f"보안 알림 {int(time.time())}",
                        'description': f"{random.choice(alert_types)} 관련 보안 이벤트가 감지되었습니다",
                        'source': f"system_{random.randint(1, 10)}",
                        'status': 'new'
                    }
                }
                
                await self.send_personal_message(json.dumps(alert), websocket)
                
        except Exception as e:
            logger.error(f"보안 알림 전송 실패: {e}")
    
    async def send_security_status_update(self, websocket: WebSocket):
        """보안 상태 업데이트 전송"""
        try:
            status = {
                'type': 'status_update',
                'timestamp': datetime.now().isoformat(),
                'data': {
                    'overall_status': random.choice(['healthy', 'warning', 'critical']),
                    'security_score': random.randint(60, 100),
                    'threats': {
                        'total': random.randint(0, 20),
                        'active': random.randint(0, 5),
                        'critical': random.randint(0, 2)
                    },
                    'events': {
                        'total': random.randint(0, 100),
                        'high_risk': random.randint(0, 10)
                    }
                }
            }
            
            await self.send_personal_message(json.dumps(status), websocket)
            
        except Exception as e:
            logger.error(f"보안 상태 업데이트 전송 실패: {e}")

# 전역 연결 관리자
manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket 엔드포인트"""
    client_id = f"client_{int(time.time())}"
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            # 클라이언트로부터 메시지 수신
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # 메시지 타입에 따른 처리
            if message.get('type') == 'ping':
                await manager.send_personal_message(
                    json.dumps({
                        'type': 'pong',
                        'timestamp': datetime.now().isoformat()
                    }),
                    websocket
                )
            elif message.get('type') == 'request_metrics':
                await manager.send_system_metrics()
            elif message.get('type') == 'request_security':
                await manager.send_security_alerts()
            elif message.get('type') == 'request_ai_status':
                await manager.send_ai_engine_status()
            elif message.get('type') == 'request_performance':
                await manager.send_performance_optimization()
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket 오류: {e}")
        manager.disconnect(websocket)

@router.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    """실시간 메트릭 전용 WebSocket"""
    client_id = f"metrics_client_{int(time.time())}"
    await manager.connect(websocket, client_id)
    
    try:
        # 실시간 메트릭 전송 루프
        while True:
            await manager.send_system_metrics()
            await asyncio.sleep(2)  # 2초마다 업데이트
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"메트릭 WebSocket 오류: {e}")
        manager.disconnect(websocket)

@router.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    """실시간 알림 전용 WebSocket"""
    client_id = f"alerts_client_{int(time.time())}"
    await manager.connect(websocket, client_id)
    
    try:
        # 실시간 알림 전송 루프
        while True:
            await manager.send_security_alerts()
            await asyncio.sleep(5)  # 5초마다 확인
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"알림 WebSocket 오류: {e}")
        manager.disconnect(websocket)

@router.websocket("/ws/security")
async def websocket_security(websocket: WebSocket):
    """실시간 보안 모니터링 전용 WebSocket"""
    client_id = f"security_client_{int(time.time())}"
    await manager.connect(websocket, client_id)
    
    try:
        # 보안 이벤트 구독 관리
        subscriptions = set(['threat', 'alert', 'event', 'status_update'])
        
        while True:
            # 클라이언트로부터 메시지 수신
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=1.0)
                message = json.loads(data)
                
                # 구독 요청 처리
                if message.get('action') == 'subscribe':
                    event_type = message.get('event_type')
                    if event_type:
                        subscriptions.add(event_type)
                        await manager.send_personal_message(
                            json.dumps({
                                'type': 'subscription_confirmed',
                                'event_type': event_type,
                                'timestamp': datetime.now().isoformat()
                            }),
                            websocket
                        )
                
                # 구독 해제 요청 처리
                elif message.get('action') == 'unsubscribe':
                    event_type = message.get('event_type')
                    if event_type:
                        subscriptions.discard(event_type)
                        await manager.send_personal_message(
                            json.dumps({
                                'type': 'unsubscription_confirmed',
                                'event_type': event_type,
                                'timestamp': datetime.now().isoformat()
                            }),
                            websocket
                        )
                
                # ping/pong
                elif message.get('type') == 'ping':
                    await manager.send_personal_message(
                        json.dumps({
                            'type': 'pong',
                            'timestamp': datetime.now().isoformat()
                        }),
                        websocket
                    )
                    
            except asyncio.TimeoutError:
                # 타임아웃은 정상 (주기적 데이터 전송을 위해)
                pass
            
            # 구독된 이벤트 타입에 따라 데이터 전송
            if 'threat' in subscriptions:
                await manager.send_security_threats(websocket)
            
            if 'alert' in subscriptions:
                await manager.send_security_alerts_to_client(websocket)
            
            if 'status_update' in subscriptions:
                await manager.send_security_status_update(websocket)
            
            await asyncio.sleep(2)  # 2초마다 업데이트
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"보안 WebSocket 오류: {e}")
        manager.disconnect(websocket)

@router.get("/ws/status")
async def websocket_status():
    """WebSocket 연결 상태 조회"""
    return {
        'success': True,
        'active_connections': len(manager.active_connections),
        'connections': [
            {
                'client_id': data['client_id'],
                'connected_at': data['connected_at'],
                'last_ping': data['last_ping']
            }
            for data in manager.connection_data.values()
        ],
        'timestamp': datetime.now().isoformat()
    }

# 백그라운드 태스크로 주기적 데이터 전송
async def background_data_sender():
    """백그라운드에서 주기적으로 데이터 전송"""
    while True:
        try:
            if manager.active_connections:
                # 다양한 타입의 데이터를 주기적으로 전송
                await manager.send_system_metrics()
                await asyncio.sleep(3)
                
                await manager.send_ai_engine_status()
                await asyncio.sleep(3)
                
                await manager.send_performance_optimization()
                await asyncio.sleep(3)
                
                await manager.send_security_alerts()
                await asyncio.sleep(3)
            else:
                await asyncio.sleep(5)  # 연결이 없으면 5초 대기
                
        except Exception as e:
            logger.error(f"백그라운드 데이터 전송 오류: {e}")
            await asyncio.sleep(5)

# 백그라운드 태스크 시작
@router.on_event("startup")
async def start_background_tasks():
    """백그라운드 태스크 시작"""
    asyncio.create_task(background_data_sender())
    logger.info("WebSocket 백그라운드 데이터 전송 시작")

logger.info("WebSocket API가 초기화되었습니다")
