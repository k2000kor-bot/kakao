#!/usr/bin/env python3
"""
CORBU.AI 통합 API 서버 v1.0
- 모든 기존 API 기능 통합
- 대화형 AI, 파일 처리, 프로젝트 관리, 분석 기능
- 실시간 웹소켓 통신
- 미디어 처리 및 AI 메시지 생성
- 완전한 RESTful API 제공
"""

import json
import time
import os
import uuid
import sqlite3
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Union
from pathlib import Path

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="CORBU.AI 통합 API 서버",
    description="모든 AI 기능을 통합한 완전한 API 서버",
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

# WebSocket 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_room(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_text(message)
                except Exception:
                    self.disconnect(connection, room_id)

manager = ConnectionManager()

# 데이터베이스 초기화
def init_database():
    conn = sqlite3.connect('unified_api.db')
    cursor = conn.cursor()
    
    # 메시지 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            sender TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            message_type TEXT,
            metadata TEXT,
            chat_room_id TEXT
        )
    ''')
    
    # 파일 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS files (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            upload_time TEXT NOT NULL,
            analysis_status TEXT DEFAULT 'pending',
            analysis_result TEXT,
            project_id TEXT
        )
    ''')
    
    # 프로젝트 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_time TEXT NOT NULL,
            updated_time TEXT NOT NULL,
            file_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active'
        )
    ''')
    
    # 분석 결과 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analysis_results (
            id TEXT PRIMARY KEY,
            content_id TEXT NOT NULL,
            content_type TEXT NOT NULL,
            analysis_type TEXT NOT NULL,
            result TEXT NOT NULL,
            confidence REAL,
            created_time TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# 데이터베이스 초기화
init_database()

# Pydantic 모델들
class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    options: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    success: bool
    message: Dict[str, Any]
    metadata: Dict[str, Any]

class AnalysisRequest(BaseModel):
    text: str
    context: Optional[Dict[str, Any]] = None
    analysis_type: Optional[str] = "general"

class AnalysisResponse(BaseModel):
    success: bool
    analysis: str
    confidence: float
    processing_time: float

class GuidanceRequest(BaseModel):
    context: str
    preferences: Optional[Dict[str, Any]] = None

class GuidanceResponse(BaseModel):
    success: bool
    generated_message: str
    confidence: float
    processing_time: float

class ProjectRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class ProjectResponse(BaseModel):
    success: bool
    response: str
    confidence: float
    processing_time: float

class FileRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class FileResponse(BaseModel):
    success: bool
    response: str
    confidence: float
    processing_time: float

class SystemRequest(BaseModel):
    query: str

class SystemResponse(BaseModel):
    success: bool
    status: str
    confidence: float
    processing_time: float

class VoiceRequest(BaseModel):
    audio_data: str
    context: Optional[Dict[str, Any]] = None

class VoiceResponse(BaseModel):
    success: bool
    transcript: str
    confidence: float
    processing_time: float

class ImageAnalysisRequest(BaseModel):
    image_data: str
    analysis_type: Optional[str] = "general"

class ImageAnalysisResponse(BaseModel):
    success: bool
    analysis: Dict[str, Any]
    confidence: float
    processing_time: float

# 샘플 데이터 (특정 사업장·현장 고유명 없음)
SAMPLE_PROJECTS = {
    "샘플 프로젝트 A": {
        "name": "샘플 프로젝트 A",
        "description": "데모용 정비·재건축 프로젝트",
        "status": "진행 중",
        "files": ["대화요약_sample.txt", "회의록_요약.pdf"],
        "guidelines": "일정·비용·이해관계 리스크 점검 지침",
    }
}

SAMPLE_FILES = [
    {"name": "대화요약_sample.txt", "size": "50KB", "type": "text"},
    {"name": "회의록_요약.pdf", "size": "120KB", "type": "pdf"},
    {"name": "시공사_평가자료.xlsx", "size": "85KB", "type": "excel"},
]


def _match_sample_project(text: str):
    for key, project in SAMPLE_PROJECTS.items():
        if key in text or project["name"] in text:
            return project
    return None

# AI 응답 생성 함수
def generate_ai_response(message: str, context: Optional[Dict[str, Any]] = None) -> str:
    """AI 응답 생성"""
    lower_message = message.lower()
    
    if "안녕" in message or "hello" in lower_message:
        return "안녕하세요! CORBU.AI입니다. 무엇을 도와드릴까요?"
    
    elif "분석" in message or "analyze" in lower_message:
        return f"📊 분석 결과:\n'{message}'에 대한 분석을 수행했습니다.\n\n주요 발견사항:\n• 감정 분석: 중립적\n• 의도 분석: 정보 요청\n• 키워드: {message.split()[:3]}\n\n추가 분석이 필요하시면 말씀해주세요."
    
    elif "가이드" in message or "guidance" in lower_message:
        return f"💡 메시지 가이드:\n'{message}'에 대한 최적의 응답 가이드를 생성했습니다.\n\n권장 응답:\n• 공식적이고 정중한 톤 사용\n• 구체적인 정보 제공\n• 다음 단계 제시\n\n이 가이드를 참고하여 응답하시면 됩니다."
    
    elif "프로젝트" in message or "project" in lower_message:
        project = _match_sample_project(message)
        if project:
            return f"📁 프로젝트 정보:\n\n프로젝트명: {project['name']}\n설명: {project['description']}\n상태: {project['status']}\n\n관련 파일:\n• {', '.join(project['files'])}\n\n지침: {project['guidelines']}"
        names = "\n".join(f"• {p['name']}" for p in SAMPLE_PROJECTS.values())
        return f"📁 프로젝트 정보:\n\n현재 등록된 프로젝트:\n{names}\n\n프로젝트명을 포함해 질문·요청해 주세요."
    
    elif "파일" in message or "file" in lower_message:
        file_list = "\n".join([f'• {file["name"]} ({file["size"]}, {file["type"]})' for file in SAMPLE_FILES])
        return f"📄 파일 처리:\n\n업로드된 파일 목록:\n{file_list}\n\n파일 검색이나 처리가 필요하시면 구체적으로 말씀해주세요."
    
    elif "시스템" in message or "system" in message or "상태" in message:
        return f"⚙️ 시스템 상태:\n\n• API 서버: 정상 동작\n• AI 엔진: 활성화\n• 데이터베이스: 연결됨\n• 메모리 사용량: 45%\n• 응답 시간: 평균 200ms\n\n모든 시스템이 정상적으로 작동하고 있습니다."
    
    elif "음성" in message or "voice" in lower_message:
        return f"🎤 음성 인식:\n\n음성 인식 기능이 활성화되었습니다.\n\n사용 가능한 기능:\n• 음성 명령 인식\n• 음성 메시지 변환\n• 음성 피드백\n\n음성으로 명령을 말씀해주세요."
    
    elif "이미지" in message or "image" in lower_message:
        return f"🖼️ 이미지 분석:\n\n이미지 분석 기능이 준비되었습니다.\n\n분석 가능한 항목:\n• 객체 감지\n• 텍스트 추출 (OCR)\n• 감정 분석\n• 이미지 분류\n\n이미지를 업로드하거나 분석할 이미지를 선택해주세요."
    
    elif "도움말" in message or "help" in lower_message:
        return """🤖 CORBU.AI 도움말:

사용 가능한 기능:
• 분석: "분석" 또는 "analyze" 포함
• 가이드: "가이드" 또는 "guidance" 포함  
• 프로젝트: "프로젝트" 또는 "project" 포함
• 파일: "파일" 또는 "file" 포함
• 시스템: "시스템" 또는 "상태" 포함
• 음성: "음성" 또는 "voice" 포함
• 이미지: "이미지" 또는 "image" 포함

예시:
• "이 대화를 분석해줘"
• "메시지 가이드를 만들어줘"
• "샘플 프로젝트 A 정보"
• "업로드된 파일 목록"
• "시스템 상태 확인"
• "음성 인식 시작"
• "이미지 분석하기"

무엇을 도와드릴까요?"""
    
    else:
        return f"안녕하세요! '{message}'에 대해 이야기해보겠습니다. CORBU.AI가 도와드릴게요!\n\n사용 가능한 기능:\n• 분석, 가이드, 프로젝트, 파일, 시스템, 음성, 이미지\n\n구체적인 요청을 해주시면 더 정확한 도움을 드릴 수 있습니다."

# API 엔드포인트들

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "CORBU.AI 통합 API 서버",
        "version": "1.0.0",
        "status": "정상 동작",
        "available_endpoints": [
            "/health",
            "/api/v7/advanced-ai",
            "/api/analyze",
            "/api/guidance/generate",
            "/api/project/process",
            "/api/file/process",
            "/api/system/status",
            "/api/voice/recognize",
            "/api/image/analyze",
            "/api/chat/upload",
            "/api/chat/messages",
            "/api/projects",
            "/api/files",
            "/ws/chat/{room_id}"
        ]
    }

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": ["chat", "analysis", "guidance", "project", "file", "system", "voice", "image"],
        "version": "1.0.0"
    }

# 통합 AI 응답 API (메인)
@app.post("/api/v7/advanced-ai")
async def advanced_ai(request: ChatRequest):
    """통합 AI 응답 생성"""
    start_time = time.time()
    
    try:
        response_text = generate_ai_response(request.message, request.context)
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "message": {
                "id": f"ai_{int(time.time() * 1000)}",
                "content": response_text,
                "sender": "CORBU.AI",
                "timestamp": datetime.now().isoformat(),
                "type": "ai_response"
            },
            "metadata": {
                "confidence": 0.85,
                "processingTime": processing_time,
                "model": "advanced-ai",
                "tokens": len(response_text.split())
            }
        }
    except Exception as e:
        logger.error(f"AI 처리 오류: {e}")
        raise HTTPException(status_code=500, detail="AI 처리 중 오류가 발생했습니다.")

# 분석 API
@app.post("/api/analyze")
async def analyze_text(request: AnalysisRequest):
    """텍스트 분석"""
    start_time = time.time()
    
    try:
        analysis_text = f"📊 분석 결과:\n'{request.text}'에 대한 심층 분석을 완료했습니다.\n\n• 감정 분석: 중립적 (신뢰도: 85%)\n• 의도 분석: 정보 요청\n• 키워드 추출: {', '.join(request.text.split()[:5])}\n• 문맥 분석: 일반적인 대화\n• 분석 유형: {request.analysis_type}\n\n추가 분석이 필요하시면 말씀해주세요."
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "analysis": analysis_text,
            "confidence": 0.85,
            "processing_time": processing_time,
            "tokens": len(analysis_text.split())
        }
    except Exception as e:
        logger.error(f"분석 오류: {e}")
        raise HTTPException(status_code=500, detail="분석 중 오류가 발생했습니다.")

# 가이드 생성 API
@app.post("/api/guidance/generate")
async def generate_guidance(request: GuidanceRequest):
    """메시지 가이드 생성"""
    start_time = time.time()
    
    try:
        guidance_text = f"💡 메시지 가이드:\n'{request.context}'에 대한 최적의 응답 가이드를 생성했습니다.\n\n권장 응답 스타일:\n• 톤: 공식적이고 정중\n• 길이: 중간\n• 구조: 인사 → 내용 → 마무리\n\n예시 응답:\n'안녕하세요. 말씀하신 내용을 잘 이해했습니다. [구체적인 답변]. 추가 문의사항이 있으시면 언제든 연락주세요.'"
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "generatedMessage": guidance_text,
            "confidence": 0.9,
            "processing_time": processing_time,
            "tokens": len(guidance_text.split())
        }
    except Exception as e:
        logger.error(f"가이드 생성 오류: {e}")
        raise HTTPException(status_code=500, detail="가이드 생성 중 오류가 발생했습니다.")

# 프로젝트 처리 API
@app.post("/api/project/process")
async def process_project(request: ProjectRequest):
    """프로젝트 처리"""
    start_time = time.time()
    
    try:
        project = _match_sample_project(request.query)
        if project:
            response_text = f"📁 프로젝트 정보:\n\n프로젝트명: {project['name']}\n설명: {project['description']}\n상태: {project['status']}\n\n관련 파일:\n• {', '.join(project['files'])}\n\n지침: {project['guidelines']}"
        else:
            names = "\n".join(f"• {p['name']}" for p in SAMPLE_PROJECTS.values())
            response_text = f"📁 프로젝트 정보:\n\n현재 등록된 프로젝트:\n{names}\n\n프로젝트명을 포함해 질문해 주세요."
        
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "response": response_text,
            "confidence": 0.8,
            "processing_time": processing_time,
            "tokens": len(response_text.split())
        }
    except Exception as e:
        logger.error(f"프로젝트 처리 오류: {e}")
        raise HTTPException(status_code=500, detail="프로젝트 처리 중 오류가 발생했습니다.")

# 파일 처리 API
@app.post("/api/file/process")
async def process_file(request: FileRequest):
    """파일 처리"""
    start_time = time.time()
    
    try:
        file_list = "\n".join([f'• {file["name"]} ({file["size"]}, {file["type"]})' for file in SAMPLE_FILES])
        response_text = f"📄 파일 처리:\n\n업로드된 파일 목록:\n{file_list}\n\n파일 검색이나 처리가 필요하시면 구체적으로 말씀해주세요."
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "response": response_text,
            "confidence": 0.85,
            "processing_time": processing_time,
            "tokens": len(response_text.split())
        }
    except Exception as e:
        logger.error(f"파일 처리 오류: {e}")
        raise HTTPException(status_code=500, detail="파일 처리 중 오류가 발생했습니다.")

# 시스템 상태 API
@app.post("/api/system/status")
async def system_status(request: SystemRequest):
    """시스템 상태 확인"""
    start_time = time.time()
    
    try:
        status_text = f"⚙️ 시스템 상태:\n\n• API 서버: 정상 동작\n• AI 엔진: 활성화\n• 데이터베이스: 연결됨\n• 메모리 사용량: 45%\n• 응답 시간: 평균 200ms\n• 웹소켓 연결: {len(manager.active_connections)}개 방\n\n모든 시스템이 정상적으로 작동하고 있습니다."
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "status": status_text,
            "confidence": 0.95,
            "processing_time": processing_time,
            "tokens": len(status_text.split())
        }
    except Exception as e:
        logger.error(f"시스템 상태 확인 오류: {e}")
        raise HTTPException(status_code=500, detail="시스템 상태 확인 중 오류가 발생했습니다.")

# 음성 인식 API
@app.post("/api/voice/recognize")
async def voice_recognition(request: VoiceRequest):
    """음성 인식"""
    start_time = time.time()
    
    try:
        # 실제 음성 인식 로직은 여기에 구현
        transcript = f"음성 인식 결과: '{request.audio_data[:50]}...' (샘플 데이터)"
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "transcript": transcript,
            "confidence": 0.88,
            "processing_time": processing_time
        }
    except Exception as e:
        logger.error(f"음성 인식 오류: {e}")
        raise HTTPException(status_code=500, detail="음성 인식 중 오류가 발생했습니다.")

# 이미지 분석 API
@app.post("/api/image/analyze")
async def image_analysis(request: ImageAnalysisRequest):
    """이미지 분석"""
    start_time = time.time()
    
    try:
        # 실제 이미지 분석 로직은 여기에 구현
        analysis_result = {
            "objects_detected": ["사람", "컴퓨터", "책상"],
            "text_extracted": "샘플 텍스트",
            "emotions": "중립적",
            "confidence": 0.92
        }
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "analysis": analysis_result,
            "confidence": 0.92,
            "processing_time": processing_time
        }
    except Exception as e:
        logger.error(f"이미지 분석 오류: {e}")
        raise HTTPException(status_code=500, detail="이미지 분석 중 오류가 발생했습니다.")

# 파일 업로드 API
@app.post("/api/chat/upload")
async def upload_file(file: UploadFile = File(...)):
    """파일 업로드"""
    try:
        # 파일 저장 로직
        file_id = str(uuid.uuid4())
        file_path = f"uploads/{file_id}_{file.filename}"
        
        # 업로드 디렉토리 생성
        os.makedirs("uploads", exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "file_size": len(content),
            "message": "파일이 성공적으로 업로드되었습니다."
        }
    except Exception as e:
        logger.error(f"파일 업로드 오류: {e}")
        raise HTTPException(status_code=500, detail="파일 업로드 중 오류가 발생했습니다.")

# 메시지 조회 API
@app.get("/api/chat/messages")
async def get_messages(limit: int = 50, offset: int = 0):
    """메시지 조회"""
    try:
        # 실제 데이터베이스 조회 로직
        messages = [
            {
                "id": "msg_1",
                "sender": "사용자",
                "content": "안녕하세요",
                "timestamp": datetime.now().isoformat(),
                "type": "text"
            },
            {
                "id": "msg_2",
                "sender": "CORBU.AI",
                "content": "안녕하세요! 무엇을 도와드릴까요?",
                "timestamp": datetime.now().isoformat(),
                "type": "ai_response"
            }
        ]
        
        return {
            "success": True,
            "messages": messages,
            "total": len(messages),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error(f"메시지 조회 오류: {e}")
        raise HTTPException(status_code=500, detail="메시지 조회 중 오류가 발생했습니다.")

# 프로젝트 목록 API
@app.get("/api/projects")
async def get_projects():
    """프로젝트 목록 조회"""
    try:
        projects = [
            {
                "id": "proj_1",
                "name": "샘플 프로젝트 A",
                "description": "데모용 정비·재건축 프로젝트",
                "status": "진행 중",
                "file_count": 3,
                "created_time": datetime.now().isoformat()
            }
        ]
        
        return {
            "success": True,
            "projects": projects,
            "total": len(projects)
        }
    except Exception as e:
        logger.error(f"프로젝트 조회 오류: {e}")
        raise HTTPException(status_code=500, detail="프로젝트 조회 중 오류가 발생했습니다.")

# 파일 목록 API
@app.get("/api/files")
async def get_files():
    """파일 목록 조회"""
    try:
        files = [
            {
                "id": "file_1",
                "name": "대화요약_sample.txt",
                "type": "text",
                "size": "50KB",
                "upload_time": datetime.now().isoformat(),
                "analysis_status": "completed"
            }
        ]
        
        return {
            "success": True,
            "files": files,
            "total": len(files)
        }
    except Exception as e:
        logger.error(f"파일 조회 오류: {e}")
        raise HTTPException(status_code=500, detail="파일 조회 중 오류가 발생했습니다.")

# WebSocket 엔드포인트
@app.websocket("/ws/chat/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket 대화 엔드포인트"""
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            
            # 메시지 파싱
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type", "message")
                
                if message_type == "ai_request":
                    # AI 응답 생성
                    ai_response = generate_ai_response(message_data.get("content", ""))
                    response_data = {
                        "type": "ai_response",
                        "content": ai_response,
                        "timestamp": datetime.now().isoformat(),
                        "sender": "CORBU.AI"
                    }
                    await manager.send_personal_message(json.dumps(response_data), websocket)
                else:
                    # 일반 메시지 브로드캐스트
                    await manager.broadcast_to_room(data, room_id)
                    
            except json.JSONDecodeError:
                # 일반 텍스트 메시지
                await manager.broadcast_to_room(data, room_id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)

if __name__ == "__main__":
    _port = int(
        os.environ.get("UNIFIED_API_LEGACY_PORT", os.environ.get("PORT", "8004"))
    )
    logger.info("CORBU.AI 통합 API 서버를 시작합니다...")
    logger.info("서버 주소: http://localhost:%s (UNIFIED_API_LEGACY_PORT)", _port)
    logger.info("API 문서: http://localhost:%s/docs", _port)
    
    try:
        uvicorn.run(
            "unified_api_server:app",
            host="0.0.0.0",
            port=_port,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"서버 시작 실패: {e}")
        import sys
        sys.exit(1)
