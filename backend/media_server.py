#!/usr/bin/env python3
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

app = FastAPI(title="미디어 서버", description="파일 관리 서버")

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
    p = int(os.environ.get("MEDIA_STUB_SERVER_PORT", os.environ.get("PORT", "8007")))
    return {"status": "online", "server": "media", "port": p}

if __name__ == "__main__":
    _p = int(os.environ.get("MEDIA_STUB_SERVER_PORT", os.environ.get("PORT", "8007")))
    print(f"🚀 미디어 서버 시작 (포트 {_p})")
    uvicorn.run(app, host="0.0.0.0", port=_p)
