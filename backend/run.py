#!/usr/bin/env python3
"""
카카오톡 분석 백엔드 서버 실행 스크립트
"""

import uvicorn
import os
import sys

# 현재 디렉토리를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    _port = int(
        os.environ.get(
            "BACKEND_PORT",
            os.environ.get("API_PORT", os.environ.get("PORT", "5002")),
        )
    )
    print("🚀 카카오톡 분석 백엔드 서버를 시작합니다...")
    print(f"📍 서버 주소: http://localhost:{_port}")
    print(f"📚 API 문서: http://localhost:{_port}/docs (또는 /api/docs — 앱 설정에 따름)")
    print(f"🔌 WebSocket: ws://localhost:{_port}/ws")
    print("-" * 50)

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=_port,
        reload=True,
        log_level="info",
    ) 