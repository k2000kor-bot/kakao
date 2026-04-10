#!/usr/bin/env python3
"""
간단한 테스트 서버
"""

import os
import sys

from fastapi import FastAPI
import uvicorn

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
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    else:
        port = int(
            os.environ.get(
                "SIMPLE_TEST_SERVER_PORT",
                os.environ.get("PORT", "8006"),
            )
        )
    app = create_server(port)
    print(f"Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
