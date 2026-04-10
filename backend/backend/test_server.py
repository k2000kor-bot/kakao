import os

from fastapi import FastAPI
import uvicorn

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Test server running!"}


if __name__ == "__main__":
    _p = int(os.environ.get("TEST_STUB_SERVER_PORT", os.environ.get("PORT", "8005")))
    uvicorn.run(app, host="0.0.0.0", port=_p)
