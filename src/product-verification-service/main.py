import sys
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import Config
from core.database import db
from api.suites import router as suites_router
from api.verifications import router as verifications_router
from api.artifacts import router as artifacts_router
from api.ws import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(Config.OUTPUT_DIR, exist_ok=True)
    await db.connect()
    yield
    await db.disconnect()


app = FastAPI(
    title="Product Verification Service",
    description="Specification end-to-end verification platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(suites_router)
app.include_router(verifications_router)
app.include_router(artifacts_router)
app.include_router(ws_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "product-verification-service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=Config.HOST, port=Config.PORT, reload=True)
