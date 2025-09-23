#!/usr/bin/env python3
"""
WebSocket 서버 - 실시간 통신 지원
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 초기화
app = FastAPI(
    title="CORBU AI WebSocket Server",
    description="실시간 통신을 위한 WebSocket 서버",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.metrics_connections: List[WebSocket] = []
        self.alerts_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket, connection_type: str = "general"):
        await websocket.accept()
        if connection_type == "metrics":
            self.metrics_connections.append(websocket)
        elif connection_type == "alerts":
            self.alerts_connections.append(websocket)
        else:
            self.active_connections.append(websocket)
        logger.info(f"WebSocket 연결됨: {connection_type}")
    
    def disconnect(self, websocket: WebSocket, connection_type: str = "general"):
        if connection_type == "metrics":
            if websocket in self.metrics_connections:
                self.metrics_connections.remove(websocket)
        elif connection_type == "alerts":
            if websocket in self.alerts_connections:
                self.alerts_connections.remove(websocket)
        else:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
        logger.info(f"WebSocket 연결 해제됨: {connection_type}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"메시지 전송 오류: {e}")
    
    async def broadcast(self, message: str, connection_type: str = "general"):
        connections = self.active_connections
        if connection_type == "metrics":
            connections = self.metrics_connections
        elif connection_type == "alerts":
            connections = self.alerts_connections
        
        for connection in connections.copy():
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"브로드캐스트 오류: {e}")
                self.disconnect(connection, connection_type)

manager = ConnectionManager()

# WebSocket 엔드포인트들
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket, "general")
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # 메시지 처리
            response = {
                "type": "response",
                "message": f"받은 메시지: {message.get('message', '')}",
                "timestamp": datetime.now().isoformat()
            }
            
            await manager.send_personal_message(json.dumps(response), websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, "general")

@app.websocket("/ws/metrics")
async def metrics_websocket(websocket: WebSocket):
    await manager.connect(websocket, "metrics")
    try:
        # 주기적으로 메트릭 데이터 전송
        while True:
            metrics_data = {
                "type": "metrics",
                "cpu_usage": 45.2,
                "memory_usage": 67.8,
                "disk_usage": 23.1,
                "active_users": len(manager.active_connections),
                "timestamp": datetime.now().isoformat()
            }
            
            await manager.send_personal_message(json.dumps(metrics_data), websocket)
            await asyncio.sleep(5)  # 5초마다 업데이트
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, "metrics")

@app.websocket("/ws/alerts")
async def alerts_websocket(websocket: WebSocket):
    await manager.connect(websocket, "alerts")
    try:
        while True:
            # 알림 데이터 전송
            alert_data = {
                "type": "alert",
                "level": "info",
                "message": "시스템이 정상적으로 작동 중입니다.",
                "timestamp": datetime.now().isoformat()
            }
            
            await manager.send_personal_message(json.dumps(alert_data), websocket)
            await asyncio.sleep(10)  # 10초마다 업데이트
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, "alerts")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "websocket_server",
        "active_connections": len(manager.active_connections),
        "metrics_connections": len(manager.metrics_connections),
        "alerts_connections": len(manager.alerts_connections),
        "timestamp": datetime.now().isoformat()
    }

# 메인 실행
if __name__ == "__main__":
    logger.info("🚀 WebSocket 서버 시작 중...")
    uvicorn.run(
        "websocket_server:app",
        host="0.0.0.0",
        port=8002,
        reload=False,
        log_level="info"
    )
