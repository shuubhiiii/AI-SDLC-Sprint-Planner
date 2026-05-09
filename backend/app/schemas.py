"""Pydantic request/response schemas matching the frontend contract."""
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


# ---------- Request ----------

class ProjectCreateRequest(BaseModel):
    idea: str = Field(..., min_length=10, description="Raw project idea text")
    title: Optional[str] = Field(default=None, description="Optional short title")


class ProjectPreferences(BaseModel):
    """User-supplied customization to steer the AI regeneration."""
    tech_stack: List[str] = Field(default_factory=list)
    team_size: Optional[str] = None
    sprint_duration_weeks: Optional[int] = Field(default=None, ge=1, le=8)
    timeline_weeks: Optional[int] = Field(default=None, ge=2, le=52)
    architecture: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = Field(default=None, max_length=1000)


class CustomizeRequest(BaseModel):
    preferences: ProjectPreferences


class ProgressUpdateRequest(BaseModel):
    """Toggle / set completion of a single sprint task."""
    sprint_index: int = Field(..., ge=0)
    task_index: int = Field(..., ge=0)
    completed: bool


class SprintUpdateRequest(BaseModel):
    """Edit a single sprint's name, goal, duration, or task list."""
    name: Optional[str] = Field(default=None, max_length=120)
    goal: Optional[str] = Field(default=None, max_length=600)
    duration_weeks: Optional[int] = Field(default=None, ge=1, le=12)
    tasks: Optional[List[str]] = Field(default=None, max_length=30)


# ---------- Plan sub-models ----------

class Summary(BaseModel):
    project_type: str
    target_users: List[str]
    main_objective: str
    elevator_pitch: str


class FeatureGroup(BaseModel):
    category: str
    items: List[str]


class SDLCPhase(BaseModel):
    phase: str
    objective: str
    tasks: List[str]
    deliverables: List[str]


class Sprint(BaseModel):
    name: str
    goal: str
    tasks: List[str]
    duration_weeks: int


class UserStory(BaseModel):
    role: str
    goal: str
    benefit: str


class RiskItem(BaseModel):
    risk: str
    mitigation: str


class RiskBuckets(BaseModel):
    technical: List[RiskItem]
    security: List[RiskItem]
    scalability: List[RiskItem]
    timeline: List[RiskItem]


class TestingChecklist(BaseModel):
    functional: List[str]
    ui: List[str]
    api: List[str]
    security: List[str]
    performance: List[str]


class TechItem(BaseModel):
    name: str
    reason: str


class TechStack(BaseModel):
    Frontend: List[TechItem]
    Backend: List[TechItem]
    Database: List[TechItem]
    Hosting: List[TechItem]
    APIs: List[TechItem]


class Milestone(BaseModel):
    week: int
    milestone: str


class Timeline(BaseModel):
    total_weeks: int
    milestones: List[Milestone]


class ProjectPlan(BaseModel):
    """Full structured plan returned by the agentic AI workflow."""
    summary: Summary
    features: List[FeatureGroup]
    functional_requirements: List[str]
    non_functional_requirements: Dict[str, List[str]]
    sdlc_plan: List[SDLCPhase]
    sprints: List[Sprint]
    user_stories: List[UserStory]
    risks: RiskBuckets
    testing_checklist: TestingChecklist
    tech_stack: TechStack
    timeline: Timeline


# ---------- Responses ----------

class ProjectResponse(BaseModel):
    id: int
    title: str
    idea: str
    plan: ProjectPlan
    preferences: Optional[ProjectPreferences] = None
    progress: Dict[str, Dict[str, bool]] = Field(default_factory=dict)
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProgressResponse(BaseModel):
    progress: Dict[str, Dict[str, bool]]
    completed_tasks: int
    total_tasks: int
    percent: int


class ProjectListItem(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class WorkflowStepsResponse(BaseModel):
    steps: List[str]


# ---------- Ask AI (custom queries) ----------

class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=4000)
    context: Optional[str] = Field(default=None, max_length=8000)


class AskResponse(BaseModel):
    answer: str
    provider: str
