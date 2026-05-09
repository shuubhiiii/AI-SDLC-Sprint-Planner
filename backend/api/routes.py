"""
REST API routes for ProjectPilot AI.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from services.workflow import run_workflow, WORKFLOW_STEPS

router = APIRouter(prefix="/api", tags=["projectpilot"])


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/workflow-steps")
def workflow_steps() -> dict:
    """Expose the agent's step list so the UI can render the workflow."""
    return {"steps": WORKFLOW_STEPS}


@router.post("/generate", response_model=schemas.ProjectOut)
def generate_project(
    payload: schemas.GenerateRequest,
    db: Session = Depends(get_db),
):
    """Run the agentic workflow on a project idea and persist the result."""
    try:
        plan = run_workflow(payload.idea)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI workflow failed: {exc}",
        )

    title = (payload.title or plan.get("title") or "Untitled Project")[:255]

    project = models.Project(
        title=title,
        idea=payload.idea,
        status="completed",
        plan=plan,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/projects", response_model=list[schemas.ProjectListItem])
def list_projects(db: Session = Depends(get_db)):
    return (
        db.query(models.Project)
        .order_by(models.Project.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/projects/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"deleted": project_id}
