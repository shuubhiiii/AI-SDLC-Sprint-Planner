"""
ProjectPilot AI – FastAPI entry point.

Run with:
    uvicorn app.main:app --reload --port 8000
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .database import Base, engine, ensure_schema
from .api.routes import router as api_router

load_dotenv()

# Create tables on startup (suitable for SQLite/dev; use Alembic for prod)
Base.metadata.create_all(bind=engine)
# Apply lightweight ALTER TABLE migrations for any new columns
ensure_schema()

app = FastAPI(
    title="ProjectPilot AI",
    description="AI-powered SDLC & Agile planning assistant.",
    version="1.0.0",
)

_origins = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root() -> dict:
    return {
        "name": "ProjectPilot AI",
        "docs": "/docs",
        "health": "/api/health",
    }
