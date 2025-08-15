#!/usr/bin/env python3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

app = FastAPI(title="분석 서버", description="대화 분석 서버")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "service": "CORBU AI 분석 서버",
        "version": "1.0.0",
        "status": "온라인",
        "port": 8005,
        "endpoints": [
            "/health - 헬스체크",
            "/api/status - 서버 상태"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/status")
async def get_status():
    return {"status": "online", "server": "analysis", "port": 8005}

if __name__ == "__main__":
    print("🚀 분석 서버 시작 (포트 8005)")
    uvicorn.run(app, host="0.0.0.0", port=8005)
