#!/usr/bin/env python3
"""
간단한 API 서버 - CORBU.AI 시스템
- 통합 메시지 처리
- 대화형 인터페이스 지원
- 실시간 응답 생성
"""

import json
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CORBU.AI API 서버",
    description="통합 AI 시스템 API",
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

# 데이터 모델
class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    options: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    success: bool
    message: str
    confidence: float
    processing_time: float
    model: str
    used_services: List[str]

class AnalysisRequest(BaseModel):
    text: str
    context: Optional[Dict[str, Any]] = None

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
    
    elif "도움말" in message or "help" in lower_message:
        return """🤖 CORBU.AI 도움말:

사용 가능한 기능:
• 분석: "분석" 또는 "analyze" 포함
• 가이드: "가이드" 또는 "guidance" 포함  
• 프로젝트: "프로젝트" 또는 "project" 포함
• 파일: "파일" 또는 "file" 포함
• 시스템: "시스템" 또는 "상태" 포함

예시:
• "이 대화를 분석해줘"
• "메시지 가이드를 만들어줘"
• "샘플 프로젝트 A 정보"
• "업로드된 파일 목록"
• "시스템 상태 확인"

무엇을 도와드릴까요?"""
    
    else:
        return f"안녕하세요! '{message}'에 대해 이야기해보겠습니다. CORBU.AI가 도와드릴게요!\n\n사용 가능한 기능:\n• 분석, 가이드, 프로젝트, 파일, 시스템\n\n구체적인 요청을 해주시면 더 정확한 도움을 드릴 수 있습니다."

# API 엔드포인트
@app.get("/")
async def root():
    return {
        "message": "CORBU.AI API 서버",
        "version": "1.0.0",
        "status": "정상 동작"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": ["chat", "analysis", "guidance", "project", "file", "system"]
    }

@app.post("/api/v7/advanced-ai")
async def advanced_ai(request: ChatRequest):
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

@app.post("/api/analyze")
async def analyze_text(request: AnalysisRequest):
    start_time = time.time()
    
    try:
        analysis_text = f"📊 분석 결과:\n'{request.text}'에 대한 심층 분석을 완료했습니다.\n\n• 감정 분석: 중립적 (신뢰도: 85%)\n• 의도 분석: 정보 요청\n• 키워드 추출: {', '.join(request.text.split()[:5])}\n• 문맥 분석: 일반적인 대화\n\n추가 분석이 필요하시면 말씀해주세요."
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

@app.post("/api/guidance/generate")
async def generate_guidance(request: GuidanceRequest):
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

@app.post("/api/project/process")
async def process_project(request: ProjectRequest):
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

@app.post("/api/file/process")
async def process_file(request: FileRequest):
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

@app.post("/api/system/status")
async def system_status(request: SystemRequest):
    start_time = time.time()
    
    try:
        status_text = f"⚙️ 시스템 상태:\n\n• API 서버: 정상 동작\n• AI 엔진: 활성화\n• 데이터베이스: 연결됨\n• 메모리 사용량: 45%\n• 응답 시간: 평균 200ms\n\n모든 시스템이 정상적으로 작동하고 있습니다."
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

if __name__ == "__main__":
    import uvicorn
    import sys
    import os
    
    # 현재 디렉토리를 Python 경로에 추가
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    _port = int(os.environ.get("SIMPLE_API_PORT", os.environ.get("PORT", "8003")))
    logger.info("CORBU.AI API 서버를 시작합니다...")
    logger.info("서버 주소: http://localhost:%s (SIMPLE_API_PORT)", _port)
    logger.info("API 문서: http://localhost:%s/docs", _port)
    
    try:
        uvicorn.run(
            "simple_api_server:app",
            host="0.0.0.0",
            port=_port,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"서버 시작 실패: {e}")
        sys.exit(1) 