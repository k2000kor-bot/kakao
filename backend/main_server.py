#!/usr/bin/env python3
"""
메인 API 서버
기본적인 서버 설정과 공통 기능만 포함
"""

import os
import json
import time
import random
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import sqlite3
from pathlib import Path
import shutil
import hashlib

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="카카오 AI 메인 서버",
    description="메인 API 서버 - 기본 기능 제공",
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

# 데이터베이스 초기화
def init_database():
    """데이터베이스 초기화"""
    conn = sqlite3.connect('main_system.db')
    cursor = conn.cursor()
    
    # 기본 시스템 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS system_status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            details TEXT
        )
    ''')
    
    # API 로그 테이블
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            endpoint TEXT NOT NULL,
            method TEXT NOT NULL,
            status_code INTEGER,
            response_time REAL,
            timestamp TEXT NOT NULL,
            details TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# 기본 상태 확인
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "카카오 AI 메인 서버",
        "version": "1.0.0",
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def get_status():
    """시스템 상태 확인"""
    return {
        "status": "online",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "기본 API 서버",
            "상태 모니터링",
            "API 로깅"
        ]
    }

@app.get("/api/health")
async def health_check():
    """헬스 체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

# 서버 시작
if __name__ == "__main__":
    print("🚀 카카오 AI 메인 서버 시작")
    print("=" * 50)
    print("📍 서버 주소: http://localhost:8001")
    print("📖 API 문서: http://localhost:8001/docs")
    print("🎯 주요 엔드포인트:")
    print("   GET / - 루트")
    print("   GET /api/status - 시스템 상태")
    print("   GET /api/health - 헬스 체크")
    print("")
    
    try:
        # 데이터베이스 초기화
        init_database()
        print("✅ 데이터베이스 초기화 완료")
        
        # 서버 시작
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
        
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        import traceback
        traceback.print_exc() 