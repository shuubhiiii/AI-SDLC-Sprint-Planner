"""
Database setup using SQLAlchemy + SQLite.
A single engine + session factory is shared across the app.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./projectpilot.db")

# `check_same_thread` is required for SQLite when used with FastAPI
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and ensures cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema() -> None:
    """
    Lightweight, idempotent schema sync for SQLite.

    `Base.metadata.create_all` only creates missing tables — it does NOT
    add new columns to an existing table. We add any missing columns
    here so older databases pick up new fields automatically.
    """
    if not DATABASE_URL.startswith("sqlite"):
        return
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    if "projects" not in inspector.get_table_names():
        return

    existing = {col["name"] for col in inspector.get_columns("projects")}
    additions = [
        ("preferences_json", "TEXT"),
        ("progress_json", "TEXT"),
        ("updated_at", "DATETIME"),
    ]
    with engine.begin() as conn:
        for name, sqltype in additions:
            if name not in existing:
                conn.execute(text(f"ALTER TABLE projects ADD COLUMN {name} {sqltype}"))
