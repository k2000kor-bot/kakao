#!/usr/bin/env python3
"""
간단한 테스트 서버
"""

from fastapi import FastAPI
import uvicorn
import sys

def create_server(port):
    app = FastAPI(title=f"Test Server {port}")

    @app.get("/")
    async def root():
        return {"message": f"Test server {port} is running!", "port": port}

    @app.get("/health")
    async def health():
        return {"status": "healthy", "port": port}

    return app

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8006
    app = create_server(port)
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
