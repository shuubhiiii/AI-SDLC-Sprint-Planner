"""
Agentic workflow orchestrator.

Although the AI call itself is a single structured prompt (so the model
can reason holistically across SDLC sections), this module models the
agentic *workflow* explicitly: each step has a name, a status, and a
contribution to the final plan. This is what makes the system feel like
a planning agent rather than a chatbot.
"""
from __future__ import annotations

from typing import Any

from services.ai_service import generate_plan


WORKFLOW_STEPS = [
    "Analyze project idea",
    "Extract core modules & features",
    "Generate functional requirements",
    "Generate non-functional requirements",
    "Build SDLC lifecycle plan",
    "Build Agile sprint plan",
    "Generate user stories",
    "Identify project risks",
    "Generate testing checklist",
    "Recommend tech stack & timeline",
]


def run_workflow(idea: str) -> dict[str, Any]:
    """Run the full ProjectPilot workflow and return a plan + metadata."""
    plan = generate_plan(idea)

    # Attach workflow trace so the UI can render the agent steps.
    plan["workflow"] = [
        {"step": name, "status": "completed"} for name in WORKFLOW_STEPS
    ]
    return plan
