#!/usr/bin/env python3
"""
ChatGPT 스타일 통합 대화형 시스템 - 간소화 버전
"""

import os
import json
import uuid
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from functools import wraps

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# 로컬 모듈 import
from database_manager import DatabaseManager
from text_analyzer import TextAnalyzer
from construction_company_analyzer import ConstructionCompanyAnalyzer

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 초기화
app = FastAPI(
    title="CORBU AI 통합 채팅 시스템",
    description="ChatGPT 스타일의 통합 대화형 AI 시스템",
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

# 전역 변수
db_manager = DatabaseManager()
text_analyzer = TextAnalyzer()
construction_analyzer = ConstructionCompanyAnalyzer()

# Pydantic 모델들
class ChatMessage(BaseModel):
    message: str
    user_id: str = "default_user"
    session_id: Optional[str] = None
    message_type: str = "text"

class ChatResponse(BaseModel):
    response: str
    session_id: str
    message_id: int
    timestamp: str
    analysis: Optional[Dict[str, Any]] = None

class AnalysisRequest(BaseModel):
    text: str
    analysis_type: str = "all"

# 유틸리티 함수들
def error_handler(func):
    """에러 핸들링 데코레이터"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {func.__name__}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    return wrapper

def sanitize_text(text: str, max_length: int = 10000) -> str:
    """텍스트 정리"""
    if not text:
        return ""
    if len(text) > max_length:
        text = text[:max_length] + "..."
    return text.strip()
