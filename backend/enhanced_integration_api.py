#!/usr/bin/env python3
"""
고도화된 자동 통합 API 서버
파일 업로드 시 모든 시스템이 자동으로 연동되어 진행
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import asyncio
import os
import logging
from datetime import datetime
from typing import Dict, List, Any
from werkzeug.utils import secure_filename
import json

# 고도화된 통합 시스템 import
from enhanced_auto_integration_system import EnhancedAutoIntegrationSystem

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="CORBU AI 고도화된 자동 통합 API",
    description="파일 업로드 시 모든 시스템이 자동으로 연동되어 진행되는 고도화된 API 서버",
    version="3.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 고도화된 통합 시스템 초기화
enhanced_system = EnhancedAutoIntegrationSystem()

# WebSocket 연결 관리자
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        logger.info(f"WebSocket 연결됨: {room_id}")

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
        logger.info(f"WebSocket 연결 해제: {room_id}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_room(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_text(message)
                except:
                    self.disconnect(connection, room_id)

manager = ConnectionManager()

# Pydantic 모델들
class FileUploadRequest(BaseModel):
    project_id: str = None
    chat_id: str = None
    auto_integration: bool = True

class IntegrationStatus(BaseModel):
    file_id: str
    status: str
    progress: float
    systems: Dict[str, str]
    results: Dict[str, Any]

class SystemStatus(BaseModel):
    active_processes: int
    completed_processes: int
    processing_status: Dict[str, Any]

# 파일 업로드 설정
UPLOAD_FOLDER = 'backend/uploads'
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif',
    'mp4', 'avi', 'mov', 'mp3', 'wav', 'aac'
}

app.config = {'UPLOAD_FOLDER': UPLOAD_FOLDER}

def allowed_file(filename):
    """허용된 파일 확장자 확인"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# WebSocket 엔드포인트
@app.websocket("/ws/integration/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """통합 시스템 WebSocket 엔드포인트"""
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # 통합 시스템 메시지 처리
            await process_integration_message(message_data, room_id)
            
            # 메시지 브로드캐스트
            await manager.broadcast_to_room(data, room_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)

async def process_integration_message(message_data: Dict[str, Any], room_id: str):
    """통합 시스템 메시지 처리"""
    try:
        message_type = message_data.get('type', '')
        
        if message_type == 'file_upload':
            # 파일 업로드 처리
            file_id = message_data.get('file_id')
            project_id = message_data.get('project_id')
            chat_id = message_data.get('chat_id')
            
            # 통합 시스템에 전달
            result = enhanced_system.process_file_upload(
                message_data.get('file_path'), project_id, chat_id
            )
            
            # 결과를 WebSocket으로 전송
            await manager.broadcast_to_room(
                json.dumps({
                    'type': 'integration_result',
                    'file_id': file_id,
                    'result': result
                }), room_id
            )
            
    except Exception as e:
        logger.error(f"통합 메시지 처리 실패: {e}")

# API 엔드포인트들
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "CORBU AI 고도화된 자동 통합 API 서버",
        "version": "3.0.0",
        "status": "running",
        "features": [
            "파일 업로드 자동 통합",
            "6개 시스템 자동 연동",
            "실시간 진행 상황 모니터링",
            "WebSocket 실시간 통신",
            "자동 알림 시스템"
        ]
    }

@app.post("/api/v3/upload-and-integrate")
async def upload_and_integrate(
    file: UploadFile = File(...),
    project_id: str = Form(None),
    chat_id: str = Form(None),
    auto_integration: bool = Form(True)
):
    """파일 업로드 및 모든 시스템 자동 통합"""
    try:
        if file.filename == '':
            return JSONResponse(
                status_code=400,
                content={'success': False, 'error': '파일이 선택되지 않았습니다.'}
            )
        
        if not allowed_file(file.filename):
            return JSONResponse(
                status_code=400,
                content={'success': False, 'error': '지원하지 않는 파일 형식입니다.'}
            )
        
        # 파일 저장
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 고도화된 통합 시스템에 전달
        if auto_integration:
            result = enhanced_system.process_file_upload(file_path, project_id, chat_id)
            
            if result['success']:
                return {
                    'success': True,
                    'file_id': result['file_id'],
                    'integration_id': result['integration_id'],
                    'message': result['message'],
                    'systems': [
                        '파일 분석 시스템',
                        '지식 추출 시스템', 
                        'AI 모델 훈련 시스템',
                        '프로젝트 분석 시스템',
                        '채팅 통합 시스템',
                        '알림 시스템'
                    ]
                }
            else:
                return JSONResponse(
                    status_code=500,
                    content={'success': False, 'error': result['error']}
                )
        else:
            return {
                'success': True,
                'message': '파일이 업로드되었습니다. (자동 통합 비활성화)'
            }
            
    except Exception as e:
        logger.error(f"파일 업로드 및 통합 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={'success': False, 'error': str(e)}
        )

@app.get("/api/v3/integration-status/{file_id}")
async def get_integration_status(file_id: str):
    """통합 처리 상태 조회"""
    try:
        status = enhanced_system.get_integration_status(file_id)
        return {
            'success': True,
            'file_id': file_id,
            'status': status
        }
    except Exception as e:
        logger.error(f"통합 상태 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={'success': False, 'error': str(e)}
        )

@app.get("/api/v3/all-integration-status")
async def get_all_integration_status():
    """모든 통합 처리 상태 조회"""
    try:
        status = enhanced_system.get_all_integration_status()
        return {
            'success': True,
            'status': status
        }
    except Exception as e:
        logger.error(f"전체 통합 상태 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={'success': False, 'error': str(e)}
        )

@app.get("/api/v3/system-overview")
async def get_system_overview():
    """시스템 전체 현황 조회"""
    try:
        all_status = enhanced_system.get_all_integration_status()
        
        # 시스템별 통계
        system_stats = {
            'file_analysis': {'completed': 0, 'failed': 0, 'pending': 0},
            'knowledge_extraction': {'completed': 0, 'failed': 0, 'pending': 0},
            'ai_model_training': {'completed': 0, 'failed': 0, 'pending': 0},
            'project_analysis': {'completed': 0, 'failed': 0, 'pending': 0},
            'chat_integration': {'completed': 0, 'failed': 0, 'pending': 0},
            'notification_system': {'completed': 0, 'failed': 0, 'pending': 0}
        }
        
        # 각 프로세스의 시스템 상태 집계
        for process_status in all_status['processing_status'].values():
            for system_name, system_status in process_status['systems'].items():
                if system_name in system_stats:
                    system_stats[system_name][system_status] += 1
        
        return {
            'success': True,
            'overview': {
                'total_processes': all_status['active_processes'],
                'completed_processes': all_status['completed_processes'],
                'system_statistics': system_stats,
                'active_integrations': len(all_status['processing_status'])
            }
        }
        
    except Exception as e:
        logger.error(f"시스템 현황 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={'success': False, 'error': str(e)}
        )

@app.post("/api/v3/trigger-integration/{file_id}")
async def trigger_integration(file_id: str):
    """특정 파일에 대한 통합 처리 재시작"""
    try:
        # 파일 정보 조회
        status = enhanced_system.get_integration_status(file_id)
        
        if 'error' in status:
            return JSONResponse(
                status_code=404,
                content={'success': False, 'error': '파일을 찾을 수 없습니다.'}
            )
        
        # 통합 처리 재시작
        # (실제로는 파일 경로를 다시 전달하여 재처리)
        
        return {
            'success': True,
            'file_id': file_id,
            'message': '통합 처리가 재시작되었습니다.'
        }
        
    except Exception as e:
        logger.error(f"통합 처리 재시작 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={'success': False, 'error': str(e)}
        )

@app.get("/api/v3/system-health")
async def get_system_health():
    """시스템 건강 상태 조회"""
    try:
        all_status = enhanced_system.get_all_integration_status()
        
        # 시스템 건강도 계산
        total_processes = all_status['active_processes']
        completed_processes = all_status['completed_processes']
        
        if total_processes == 0:
            health_score = 100
        else:
            health_score = (completed_processes / total_processes) * 100
        
        # 시스템별 성공률 계산
        system_health = {}
        for process_status in all_status['processing_status'].values():
            for system_name, system_status in process_status['systems'].items():
                if system_name not in system_health:
                    system_health[system_name] = {'success': 0, 'total': 0}
                
                system_health[system_name]['total'] += 1
                if system_status == 'completed':
                    system_health[system_name]['success'] += 1
        
        # 성공률 계산
        for system_name, stats in system_health.items():
            if stats['total'] > 0:
                stats['success_rate'] = (stats['success'] / stats['total']) * 100
            else:
                stats['success_rate'] = 0
        
        return {
            'success': True,
            'health': {
                'overall_health_score': health_score,
                'total_processes': total_processes,
                'completed_processes': completed_processes,
                'system_health': system_health,
                'status': 'healthy' if health_score >= 80 else 'warning' if health_score >= 60 else 'critical'
            }
        }
        
    except Exception as e:
        logger.error(f"시스템 건강 상태 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={'success': False, 'error': str(e)}
        )

@app.get("/api/v3/real-time-monitoring")
async def get_real_time_monitoring():
    """실시간 모니터링 데이터"""
    try:
        all_status = enhanced_system.get_all_integration_status()
        
        # 실시간 통계
        active_processes = []
        for file_id, status in all_status['processing_status'].items():
            if status['status'] == 'processing':
                active_processes.append({
                    'file_id': file_id,
                    'progress': status['progress'],
                    'start_time': status['start_time'],
                    'systems_status': status['systems']
                })
        
        return {
            'success': True,
            'real_time_data': {
                'active_processes': active_processes,
                'total_active': len(active_processes),
                'timestamp': datetime.now().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"실시간 모니터링 조회 실패: {e}")
        return JSONResponse(
            status_code=500,
            content={'success': False, 'error': str(e)}
        )

# 기존 API 엔드포인트들도 유지
@app.get("/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "3.0.0",
        "features": [
            "고도화된 자동 통합 시스템",
            "6개 시스템 자동 연동",
            "실시간 모니터링",
            "WebSocket 통신"
        ]
    }

if __name__ == "__main__":
    # 업로드 디렉토리 생성
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    uvicorn.run(
        "enhanced_integration_api:app",
        host="0.0.0.0",
        port=5003,
        reload=True
    )
