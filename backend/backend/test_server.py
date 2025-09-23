from fastapi import FastAPI; import uvicorn; app = FastAPI(); @app.get("/"); async def root(): return {"message": "Test server running!"}; uvicorn.run(app, host="0.0.0.0", port=8005)
