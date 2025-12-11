#!/usr/bin/env python3
"""
간단한 통합 API 서버
integrated_api만 사용하는 경량 서버
"""

import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 통합 API만 import
from api.integrated_api import router as integrated_router

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="CORBU AI 통합 API 서버",
    description="통합 API 엔드포인트만 포함하는 경량 서버",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 통합 API router 등록
app.include_router(integrated_router)


# 루트 엔드포인트
@app.get("/")
async def root():
    return {
        "message": "CORBU AI 통합 API 서버",
        "version": "1.0.0",
        "docs": "/api/docs",
        "integrated_api": "/api/integrated",
    }


# 헬스 체크
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "integrated-api"}


# 서버 시작 이벤트
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 CORBU AI 통합 API 서버가 시작되었습니다!")
    logger.info("📍 서버 주소: http://localhost:8000")
    logger.info("📚 API 문서: http://localhost:8000/api/docs")
    logger.info("🔗 통합 API: http://localhost:8000/api/integrated")


if __name__ == "__main__":
    uvicorn.run(
        "start_simple_integrated_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
