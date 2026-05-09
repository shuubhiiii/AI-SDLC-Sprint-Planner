"""HTTP routes for ProjectPilot AI."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..prompts.templates import WORKFLOW_STEPS
from ..services import workflow, ai_service

router = APIRouter(prefix="/api", tags=["projects"])


@router.get("/health")
def health() -> dict:
    """Liveness probe."""
    return {"status": "ok", "service": "ProjectPilot AI", "provider": ai_service.active_provider()}


@router.get("/workflow-steps", response_model=schemas.WorkflowStepsResponse)
def workflow_steps():
    """
    Return the agent's workflow narration. The frontend uses this to
    render an animated step indicator while a plan is generating.
    """
    return {"steps": WORKFLOW_STEPS}


@router.post(
    "/generate",
    response_model=schemas.ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_project(
    payload: schemas.ProjectCreateRequest,
    db: Session = Depends(get_db),
):
    """Run the full agentic planning workflow on a project idea."""
    try:
        project = workflow.run_workflow(db, payload)
    except ValidationError as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI returned an invalid plan structure: {e.errors()[:3]}",
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI workflow failed: {e}")

    return workflow.project_to_response(project)


@router.get("/projects", response_model=list[schemas.ProjectListItem])
def list_projects(db: Session = Depends(get_db)):
    rows = (
        db.query(models.Project)
        .order_by(models.Project.created_at.desc())
        .limit(50)
        .all()
    )
    return rows


@router.get("/projects/{project_id}", response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = (
        db.query(models.Project).filter(models.Project.id == project_id).first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return workflow.project_to_response(project)


@router.delete("/projects/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = (
        db.query(models.Project).filter(models.Project.id == project_id).first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return None


@router.post("/ask", response_model=schemas.AskResponse)
def ask_ai(payload: schemas.AskRequest):
    """Free-form Q&A powered by Gemini / OpenAI (whichever is configured)."""
    try:
        result = ai_service.ask(payload.question, payload.context)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI provider failed: {e}")
    return result


@router.post(
    "/projects/{project_id}/customize",
    response_model=schemas.ProjectResponse,
)
def customize_project(
    project_id: int,
    payload: schemas.CustomizeRequest,
    db: Session = Depends(get_db),
):
    """
    Regenerate this project's plan using the supplied customization
    preferences (tech stack, team size, sprint duration, timeline,
    architecture, priority, notes). Resets task progress.
    """
    project = (
        db.query(models.Project).filter(models.Project.id == project_id).first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        project = workflow.customize_workflow(db, project, payload.preferences)
    except ValidationError as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI returned an invalid customized plan: {e.errors()[:3]}",
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Customization failed: {e}")

    return workflow.project_to_response(project)


@router.post(
    "/projects/{project_id}/progress",
    response_model=schemas.ProgressResponse,
)
def update_progress(
    project_id: int,
    payload: schemas.ProgressUpdateRequest,
    db: Session = Depends(get_db),
):
    """Toggle a single sprint task's completion state."""
    project = (
        db.query(models.Project).filter(models.Project.id == project_id).first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        return workflow.update_task_progress(
            db,
            project,
            sprint_index=payload.sprint_index,
            task_index=payload.task_index,
            completed=payload.completed,
        )
    except IndexError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch(
    "/projects/{project_id}/sprints/{sprint_index}",
    response_model=schemas.ProjectResponse,
)
def edit_sprint(
    project_id: int,
    sprint_index: int,
    payload: schemas.SprintUpdateRequest,
    db: Session = Depends(get_db),
):
    """Edit one sprint (name, goal, duration_weeks, tasks). Preserves
    task completion ticks for tasks whose text is unchanged."""
    project = (
        db.query(models.Project).filter(models.Project.id == project_id).first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        project = workflow.update_sprint(
            db,
            project,
            sprint_index=sprint_index,
            name=payload.name,
            goal=payload.goal,
            duration_weeks=payload.duration_weeks,
            tasks=payload.tasks,
        )
    except IndexError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return workflow.project_to_response(project)
