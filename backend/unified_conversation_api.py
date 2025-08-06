from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import asyncio
import json
import os
from datetime import datetime
import sqlite3
import uuid

# FastAPI 앱 생성
app = FastAPI(title="CORBU AI 통합 대화 API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 초기화
def init_database():
    conn = sqlite3.connect('unified_conversation.db')
    cursor = conn.cursor()
    
    # 대화 메시지 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            sender TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            message_type TEXT,
            metadata TEXT
        )
    ''')
    
    # 파일 정보 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS files (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            upload_time TEXT NOT NULL,
            analysis_status TEXT DEFAULT 'pending',
            analysis_result TEXT
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
            file_count INTEGER DEFAULT 0
        )
    ''')
    
    # 명령어 히스토리 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS command_history (
            id TEXT PRIMARY KEY,
            command TEXT NOT NULL,
            args TEXT,
            execution_time TEXT NOT NULL,
            success BOOLEAN NOT NULL,
            response TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# 데이터베이스 초기화
init_database()

# Pydantic 모델들
class Message(BaseModel):
    id: str
    sender: str
    content: str
    timestamp: str
    message_type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class CommandRequest(BaseModel):
    command: str
    args: List[str]
    user_id: Optional[str] = None

class CommandResponse(BaseModel):
    success: bool
    response: str
    execution_time: float
    metadata: Optional[Dict[str, Any]] = None

class FileInfo(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    upload_time: str
    analysis_status: str
    analysis_result: Optional[str] = None

class ProjectInfo(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_time: str
    updated_time: str
    file_count: int

# 시스템 상태 관리
class SystemStatus:
    def __init__(self):
        self.is_file_uploading = False
        self.is_analyzing = False
        self.is_learning = False
        self.is_project_loading = False
        self.active_projects = []
        self.available_commands = [
            "upload", "analyze", "project", "ai", "system", "help"
        ]

system_status = SystemStatus()

# 명령어 핸들러들
class CommandHandlers:
    @staticmethod
    async def handle_upload(args: List[str]) -> str:
        """파일 업로드 명령어 처리"""
        if not args:
            return "📁 파일 업로드 모달이 열렸습니다. 파일을 선택해주세요."
        
        filename = args[0]
        return f"📁 파일 '{filename}' 업로드가 시작되었습니다."
    
    @staticmethod
    async def handle_analyze(args: List[str]) -> str:
        """파일 분석 명령어 처리"""
        if not args:
            return "❌ 분석할 파일을 지정해주세요. 예: /analyze document.pdf"
        
        filename = args[0]
        system_status.is_analyzing = True
        
        # 분석 시뮬레이션
        await asyncio.sleep(2)
        
        system_status.is_analyzing = False
        return f"📊 파일 '{filename}' 분석이 완료되었습니다!\n\n**분석 결과:**\n• 텍스트 추출: 완료\n• 키워드 분석: 완료\n• 감정 분석: 완료"
    
    @staticmethod
    async def handle_project(args: List[str]) -> str:
        """프로젝트 관리 명령어 처리"""
        if not args:
            return "❌ 프로젝트 명령어 사용법: /project [create|list|open] [프로젝트명]"
        
        operation = args[0]
        
        if operation == "create":
            if len(args) < 2:
                return "❌ 프로젝트명을 입력해주세요: /project create [프로젝트명]"
            project_name = args[1]
            return f"📁 프로젝트 '{project_name}' 생성 모드가 활성화되었습니다."
        
        elif operation == "list":
            # 데이터베이스에서 프로젝트 목록 조회
            conn = sqlite3.connect('unified_conversation.db')
            cursor = conn.cursor()
            cursor.execute('SELECT name, file_count FROM projects')
            projects = cursor.fetchall()
            conn.close()
            
            if not projects:
                return "📋 현재 프로젝트가 없습니다."
            
            project_list = "\n".join([f"• {name} ({file_count}개 파일)" for name, file_count in projects])
            return f"📋 현재 프로젝트 목록:\n{project_list}"
        
        elif operation == "open":
            if len(args) < 2:
                return "❌ 프로젝트명을 입력해주세요: /project open [프로젝트명]"
            project_name = args[1]
            return f"📁 프로젝트 '{project_name}'이 열렸습니다."
        
        else:
            return f"❌ 알 수 없는 프로젝트 작업입니다: {operation}\n💡 사용법: /project [create|list|open] [프로젝트명]"
    
    @staticmethod
    async def handle_ai(args: List[str]) -> str:
        """AI 기능 명령어 처리"""
        if len(args) < 2:
            return "❌ AI 명령어 사용법: /ai [analyze|write|summarize] [내용]"
        
        operation = args[0]
        content = " ".join(args[1:])
        
        if operation == "analyze":
            return f"🤖 AI 분석 결과:\n\n**분석 대상:** {content}\n**결과:** 긍정적 감정이 70%로 나타났으며, 주요 키워드는 '프로젝트', '개발', '진행'입니다."
        
        elif operation == "write":
            return f"✍️ AI 글쓰기 결과:\n\n**주제:** {content}\n**생성된 내용:**\n\n{content}에 대한 상세한 보고서를 작성해드리겠습니다. 주요 내용은 다음과 같습니다..."
        
        elif operation == "summarize":
            return f"📋 AI 요약 결과:\n\n**원문:** {content}\n**요약:** 핵심 내용을 간결하게 정리한 요약문입니다."
        
        else:
            return f"❌ 알 수 없는 AI 작업입니다: {operation}\n💡 사용법: /ai [analyze|write|summarize] [내용]"
    
    @staticmethod
    async def handle_system(args: List[str]) -> str:
        """시스템 관리 명령어 처리"""
        if not args:
            return "❌ 시스템 명령어 사용법: /system [status|logs|optimize]"
        
        operation = args[0]
        
        if operation == "status":
            return f"🖥️ 시스템 상태:\n\n• 파일 업로드: {'진행 중' if system_status.is_file_uploading else '대기 중'}\n• 분석 작업: {'진행 중' if system_status.is_analyzing else '대기 중'}\n• 학습 작업: {'진행 중' if system_status.is_learning else '대기 중'}\n• 활성 프로젝트: {len(system_status.active_projects)}개\n• 사용 가능한 명령어: {len(system_status.available_commands)}개"
        
        elif operation == "logs":
            return "📝 최근 시스템 로그:\n\n• [2024-12-19 14:30] 시스템 시작\n• [2024-12-19 14:31] 파일 업로드 완료\n• [2024-12-19 14:32] AI 분석 시작\n• [2024-12-19 14:33] 프로젝트 생성 완료"
        
        elif operation == "optimize":
            return "⚡ 시스템 최적화 완료:\n\n• 메모리 사용량: 15% 감소\n• 응답 시간: 0.2초 단축\n• 캐시 정리: 완료\n• 성능 향상: 25%"
        
        else:
            return f"❌ 알 수 없는 시스템 작업입니다: {operation}\n💡 사용법: /system [status|logs|optimize]"
    
    @staticmethod
    async def handle_help(args: List[str]) -> str:
        """도움말 명령어 처리"""
        if not args:
            help_text = "🤖 CORBU AI 사용 가능한 명령어:\n\n"
            help_text += "**/upload** - 파일을 업로드합니다\n   사용법: /upload [파일명]\n\n"
            help_text += "**/analyze** - 파일을 분석합니다\n   사용법: /analyze [파일명]\n\n"
            help_text += "**/project** - 프로젝트를 관리합니다\n   사용법: /project [create|list|open] [프로젝트명]\n\n"
            help_text += "**/ai** - AI 기능을 사용합니다\n   사용법: /ai [analyze|write|summarize] [내용]\n\n"
            help_text += "**/system** - 시스템 상태를 확인합니다\n   사용법: /system [status|logs|optimize]\n\n"
            help_text += "**/help** - 사용 가능한 명령어를 보여줍니다\n   사용법: /help [명령어명]\n\n"
            help_text += "💡 특정 명령어의 자세한 설명을 보려면: /help [명령어명]"
            return help_text
        
        command_name = args[0]
        
        if command_name == "upload":
            return "📖 **/upload** 명령어 도움말:\n\n**설명:** 파일을 업로드합니다\n**사용법:** /upload [파일명]\n**예시:**\n• /upload document.pdf\n• /upload image.jpg"
        
        elif command_name == "analyze":
            return "📖 **/analyze** 명령어 도움말:\n\n**설명:** 파일을 분석합니다\n**사용법:** /analyze [파일명]\n**예시:**\n• /analyze document.pdf\n• /analyze all"
        
        elif command_name == "project":
            return "📖 **/project** 명령어 도움말:\n\n**설명:** 프로젝트를 관리합니다\n**사용법:** /project [create|list|open] [프로젝트명]\n**예시:**\n• /project create 새프로젝트\n• /project list\n• /project open 기존프로젝트"
        
        elif command_name == "ai":
            return "📖 **/ai** 명령어 도움말:\n\n**설명:** AI 기능을 사용합니다\n**사용법:** /ai [analyze|write|summarize] [내용]\n**예시:**\n• /ai analyze 이 텍스트를 분석해줘\n• /ai write 보고서 작성"
        
        elif command_name == "system":
            return "📖 **/system** 명령어 도움말:\n\n**설명:** 시스템 상태를 확인합니다\n**사용법:** /system [status|logs|optimize]\n**예시:**\n• /system status\n• /system logs"
        
        else:
            return f"❌ 명령어 '{command_name}'을 찾을 수 없습니다."

# 명령어 핸들러 매핑
command_handlers = {
    "upload": CommandHandlers.handle_upload,
    "analyze": CommandHandlers.handle_analyze,
    "project": CommandHandlers.handle_project,
    "ai": CommandHandlers.handle_ai,
    "system": CommandHandlers.handle_system,
    "help": CommandHandlers.handle_help
}

# API 엔드포인트들

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "CORBU AI 통합 대화 API",
        "version": "1.0.0",
        "status": "running",
        "available_commands": system_status.available_commands
    }

@app.post("/api/command", response_model=CommandResponse)
async def execute_command(request: CommandRequest):
    """명령어 실행 API"""
    start_time = datetime.now()
    
    try:
        command = request.command
        args = request.args
        
        if command not in command_handlers:
            return CommandResponse(
                success=False,
                response=f"❌ 알 수 없는 명령어입니다: {command}\n💡 /help를 입력하여 사용 가능한 명령어를 확인하세요.",
                execution_time=0.0
            )
        
        # 명령어 실행
        handler = command_handlers[command]
        response = await handler(args)
        
        # 명령어 히스토리 저장
        conn = sqlite3.connect('unified_conversation.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO command_history (id, command, args, execution_time, success, response)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            command,
            json.dumps(args),
            start_time.isoformat(),
            True,
            response
        ))
        conn.commit()
        conn.close()
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return CommandResponse(
            success=True,
            response=response,
            execution_time=execution_time
        )
    
    except Exception as e:
        execution_time = (datetime.now() - start_time).total_seconds()
        
        # 오류 로그 저장
        conn = sqlite3.connect('unified_conversation.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO command_history (id, command, args, execution_time, success, response)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            request.command,
            json.dumps(request.args),
            start_time.isoformat(),
            False,
            str(e)
        ))
        conn.commit()
        conn.close()
        
        return CommandResponse(
            success=False,
            response=f"❌ 명령어 실행 중 오류가 발생했습니다: {str(e)}",
            execution_time=execution_time
        )

@app.post("/api/message")
async def add_message(message: Message):
    """메시지 추가 API"""
    try:
        conn = sqlite3.connect('unified_conversation.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO messages (id, sender, content, timestamp, message_type, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            message.id,
            message.sender,
            message.content,
            message.timestamp,
            message.message_type,
            json.dumps(message.metadata) if message.metadata else None
        ))
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "메시지가 저장되었습니다."}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"메시지 저장 중 오류: {str(e)}")

@app.get("/api/messages")
async def get_messages(limit: int = 50, offset: int = 0):
    """메시지 목록 조회 API"""
    try:
        conn = sqlite3.connect('unified_conversation.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, sender, content, timestamp, message_type, metadata
            FROM messages
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
        ''', (limit, offset))
        
        messages = []
        for row in cursor.fetchall():
            message = {
                "id": row[0],
                "sender": row[1],
                "content": row[2],
                "timestamp": row[3],
                "message_type": row[4],
                "metadata": json.loads(row[5]) if row[5] else None
            }
            messages.append(message)
        
        conn.close()
        
        return {"messages": messages, "total": len(messages)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"메시지 조회 중 오류: {str(e)}")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """파일 업로드 API"""
    try:
        system_status.is_file_uploading = True
        
        # 파일 정보 생성
        file_id = str(uuid.uuid4())
        file_info = {
            "id": file_id,
            "filename": file.filename,
            "file_type": file.content_type,
            "file_size": 0,  # 실제로는 파일 크기를 계산해야 함
            "upload_time": datetime.now().isoformat(),
            "analysis_status": "pending"
        }
        
        # 파일 저장 (실제 구현에서는 안전한 경로에 저장)
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            file_info["file_size"] = len(content)
        
        # 데이터베이스에 파일 정보 저장
        conn = sqlite3.connect('unified_conversation.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO files (id, filename, file_type, file_size, upload_time, analysis_status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            file_info["id"],
            file_info["filename"],
            file_info["file_type"],
            file_info["file_size"],
            file_info["upload_time"],
            file_info["analysis_status"]
        ))
        conn.commit()
        conn.close()
        
        system_status.is_file_uploading = False
        
        return {
            "success": True,
            "message": f"파일 '{file.filename}'이 성공적으로 업로드되었습니다.",
            "file_info": file_info
        }
    
    except Exception as e:
        system_status.is_file_uploading = False
        raise HTTPException(status_code=500, detail=f"파일 업로드 중 오류: {str(e)}")

@app.get("/api/files")
async def get_files():
    """파일 목록 조회 API"""
    try:
        conn = sqlite3.connect('unified_conversation.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, filename, file_type, file_size, upload_time, analysis_status, analysis_result
            FROM files
            ORDER BY upload_time DESC
        ''')
        
        files = []
        for row in cursor.fetchall():
            file_info = {
                "id": row[0],
                "filename": row[1],
                "file_type": row[2],
                "file_size": row[3],
                "upload_time": row[4],
                "analysis_status": row[5],
                "analysis_result": json.loads(row[6]) if row[6] else None
            }
            files.append(file_info)
        
        conn.close()
        
        return {"files": files, "total": len(files)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 목록 조회 중 오류: {str(e)}")

@app.get("/api/status")
async def get_system_status():
    """시스템 상태 조회 API"""
    return {
        "is_file_uploading": system_status.is_file_uploading,
        "is_analyzing": system_status.is_analyzing,
        "is_learning": system_status.is_learning,
        "is_project_loading": system_status.is_project_loading,
        "active_projects": system_status.active_projects,
        "available_commands": system_status.available_commands,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/project")
async def create_project(name: str = Form(...), description: str = Form(None)):
    """프로젝트 생성 API"""
    try:
        project_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        
        conn = sqlite3.connect('unified_conversation.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO projects (id, name, description, created_time, updated_time)
            VALUES (?, ?, ?, ?, ?)
        ''', (project_id, name, description, current_time, current_time))
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": f"프로젝트 '{name}'이 성공적으로 생성되었습니다.",
            "project_id": project_id
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"프로젝트 생성 중 오류: {str(e)}")

@app.get("/api/projects")
async def get_projects():
    """프로젝트 목록 조회 API"""
    try:
        conn = sqlite3.connect('unified_conversation.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, name, description, created_time, updated_time, file_count
            FROM projects
            ORDER BY updated_time DESC
        ''')
        
        projects = []
        for row in cursor.fetchall():
            project_info = {
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "created_time": row[3],
                "updated_time": row[4],
                "file_count": row[5]
            }
            projects.append(project_info)
        
        conn.close()
        
        return {"projects": projects, "total": len(projects)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"프로젝트 목록 조회 중 오류: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001) 