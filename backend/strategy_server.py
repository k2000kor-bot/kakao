#!/usr/bin/env python3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

app = FastAPI(title="전략 서버", description="전략 최적화 서버")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/status")
async def get_status():
    return {"status": "online", "server": "strategy", "port": 8008}

if __name__ == "__main__":
    print("🚀 전략 서버 시작 (포트 8008)")
    uvicorn.run(app, host="0.0.0.0", port=8008)
