"""
Workflow orchestrator — the agent layer.

Sequences AI calls, validates structured output against the Pydantic
schemas, and persists the result to SQLite.
"""
import json
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from .. import models, schemas
from . import ai_service


def _validate_plan(raw: dict) -> schemas.ProjectPlan:
    """Validate raw LLM JSON against the Pydantic schema."""
    return schemas.ProjectPlan.model_validate(raw)


def run_workflow(
    db: Session, request: schemas.ProjectCreateRequest
) -> models.Project:
    """
    End-to-end planning workflow:
      1. Generate a short title if the user didn't provide one.
      2. Run the master planning prompt to produce structured JSON.
      3. Validate it against our Pydantic schema.
      4. Persist the project + plan to SQLite.
    """
    idea = request.idea.strip()

    # 1. Title
    title = (request.title or "").strip()
    if not title:
        try:
            title = ai_service.generate_title(idea)
        except Exception:
            title = idea[:60] + ("..." if len(idea) > 60 else "")

    # 2. Plan
    raw_plan: Any = ai_service.generate_plan(idea)

    # 3. Validate
    plan = _validate_plan(raw_plan)

    # 4. Persist
    project = models.Project(
        title=title,
        idea=idea,
        plan_json=json.dumps(plan.model_dump(), ensure_ascii=False),
        preferences_json=None,
        progress_json=json.dumps({}),
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def customize_workflow(
    db: Session,
    project: models.Project,
    preferences: schemas.ProjectPreferences,
) -> models.Project:
    """
    Regenerate this project's plan using the supplied preferences and
    persist both the new plan and the preferences. Progress is reset
    because sprint/task indices may shift.
    """
    prefs_dict = preferences.model_dump()
    raw_plan: Any = ai_service.customize_plan(project.idea, prefs_dict)
    plan = _validate_plan(raw_plan)

    project.plan_json = json.dumps(plan.model_dump(), ensure_ascii=False)
    project.preferences_json = json.dumps(prefs_dict, ensure_ascii=False)
    project.progress_json = json.dumps({})
    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project


def update_sprint(
    db: Session,
    project: models.Project,
    sprint_index: int,
    *,
    name: str | None = None,
    goal: str | None = None,
    duration_weeks: int | None = None,
    tasks: list[str] | None = None,
) -> models.Project:
    """
    Edit a single sprint's name / goal / duration / task list and persist.

    If `tasks` is provided, completion progress for that sprint is remapped
    by task text where possible (so renaming preserves ticks; removed tasks
    lose their ticks; new tasks start unchecked).
    """
    plan_dict = json.loads(project.plan_json)
    sprints = plan_dict.get("sprints", []) or []
    if sprint_index >= len(sprints):
        raise IndexError("sprint_index out of range")

    sprint = sprints[sprint_index]
    old_tasks = list(sprint.get("tasks", []) or [])

    if name is not None:
        sprint["name"] = name.strip() or sprint["name"]
    if goal is not None:
        sprint["goal"] = goal.strip() or sprint["goal"]
    if duration_weeks is not None:
        sprint["duration_weeks"] = int(duration_weeks)
    if tasks is not None:
        cleaned = [t.strip() for t in tasks if t and t.strip()]
        if not cleaned:
            raise ValueError("A sprint must have at least one task")
        sprint["tasks"] = cleaned

    sprints[sprint_index] = sprint
    plan_dict["sprints"] = sprints

    # Remap completion progress by task text whenever the task list changes
    progress = json.loads(project.progress_json or "{}")
    s_key = str(sprint_index)
    if tasks is not None and s_key in progress:
        old_marks = progress[s_key]
        new_marks: dict[str, bool] = {}
        for new_idx, new_text in enumerate(sprint["tasks"]):
            try:
                old_idx = old_tasks.index(new_text)
            except ValueError:
                continue
            if old_marks.get(str(old_idx)):
                new_marks[str(new_idx)] = True
        if new_marks:
            progress[s_key] = new_marks
        else:
            progress.pop(s_key, None)
        project.progress_json = json.dumps(progress)

    project.plan_json = json.dumps(plan_dict, ensure_ascii=False)
    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project


def update_task_progress(
    db: Session,
    project: models.Project,
    sprint_index: int,
    task_index: int,
    completed: bool,
) -> dict:
    """
    Toggle one task's completion status and persist. Returns the updated
    progress map alongside an aggregate summary.
    """
    plan_dict = json.loads(project.plan_json)
    sprints = plan_dict.get("sprints", []) or []
    if sprint_index >= len(sprints):
        raise IndexError("sprint_index out of range")
    if task_index >= len(sprints[sprint_index].get("tasks", []) or []):
        raise IndexError("task_index out of range")

    progress = json.loads(project.progress_json or "{}")
    s_key = str(sprint_index)
    t_key = str(task_index)
    bucket = progress.setdefault(s_key, {})
    if completed:
        bucket[t_key] = True
    else:
        bucket.pop(t_key, None)
        if not bucket:
            progress.pop(s_key, None)

    project.progress_json = json.dumps(progress)
    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)

    total = sum(len(s.get("tasks", []) or []) for s in sprints)
    done = sum(len(v) for v in progress.values())
    pct = int(round((done / total) * 100)) if total else 0
    return {
        "progress": progress,
        "completed_tasks": done,
        "total_tasks": total,
        "percent": pct,
    }


def project_to_response(project: models.Project) -> schemas.ProjectResponse:
    """Hydrate a stored Project row into the API response shape."""
    plan = schemas.ProjectPlan.model_validate(json.loads(project.plan_json))
    prefs = None
    if project.preferences_json:
        try:
            prefs = schemas.ProjectPreferences.model_validate(
                json.loads(project.preferences_json)
            )
        except Exception:
            prefs = None
    progress: dict = {}
    if project.progress_json:
        try:
            progress = json.loads(project.progress_json) or {}
        except Exception:
            progress = {}
    return schemas.ProjectResponse(
        id=project.id,
        title=project.title,
        idea=project.idea,
        plan=plan,
        preferences=prefs,
        progress=progress,
        created_at=project.created_at,
        updated_at=getattr(project, "updated_at", None),
    )
