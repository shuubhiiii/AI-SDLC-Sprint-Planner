"""SQLAlchemy ORM models."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from .database import Base


class Project(Base):
    """A user-submitted project idea and its AI-generated plan."""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    idea = Column(Text, nullable=False)
    # The full structured plan is persisted as JSON text for simplicity
    plan_json = Column(Text, nullable=False)
    # User customization preferences (tech stack, team size, priority...) as JSON
    preferences_json = Column(Text, nullable=True)
    # Execution-mode task progress: { "<sprint_index>": { "<task_index>": true } }
    progress_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
