"""
AI service: talks to OpenAI when an API key is configured, otherwise
falls back to a deterministic offline planner so the app keeps working.
"""
from __future__ import annotations

import json
from typing import Any

from config import settings
from prompts.templates import SYSTEM_PROMPT, MASTER_PROMPT
from utils.parser import extract_json


def _call_openai(idea: str) -> dict[str, Any]:
    """Call the OpenAI chat-completions API and parse a JSON plan."""
    # Imported lazily so the app can run without the dependency at runtime
    from openai import OpenAI

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=0.4,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": MASTER_PROMPT.format(idea=idea)},
        ],
    )
    content = response.choices[0].message.content or ""
    return extract_json(content)


def _offline_plan(idea: str) -> dict[str, Any]:
    """Deterministic structured plan used when no API key is set.

    This is intentionally generic-but-coherent, so the UI can be demoed
    end-to-end without external dependencies. Real outputs come from the
    OpenAI path.
    """
    short = idea.strip().rstrip(".")
    title_words = [w for w in short.split() if w.isalpha()][:5]
    title = " ".join(title_words).title() or "New Software Project"

    return {
        "title": title,
        "summary": {
            "project_type": "Web Application",
            "target_users": ["End Users", "Administrators", "Business Stakeholders"],
            "main_objective": f"Deliver a reliable platform that addresses: {short}.",
            "elevator_pitch": (
                f"{title} is a modern, scalable solution that turns the idea "
                f"\"{short}\" into a production-ready product with a strong "
                "engineering foundation."
            ),
        },
        "features": [
            {"category": "Authentication", "items": ["Sign Up", "Login", "Password Reset", "Role-Based Access"]},
            {"category": "Core Workflow", "items": ["Create Item", "Update Item", "Delete Item", "Search & Filter"]},
            {"category": "Dashboard", "items": ["KPIs Overview", "Recent Activity", "Notifications"]},
            {"category": "Admin", "items": ["User Management", "Audit Logs", "Configuration"]},
        ],
        "functional_requirements": [
            "Users must be able to register and authenticate securely.",
            "Authenticated users must be able to perform CRUD on their resources.",
            "Admins must be able to manage users and roles.",
            "The system must send transactional emails for key events.",
            "The system must expose a documented REST API.",
            "The system must log critical actions for audit.",
        ],
        "non_functional_requirements": {
            "security": ["OWASP Top 10 mitigations", "Encrypted secrets at rest", "JWT-based auth with rotation"],
            "scalability": ["Stateless API tier", "Horizontal scaling via containers", "Cacheable read endpoints"],
            "performance": ["P95 API latency < 300ms", "Optimized DB indexes", "Pagination on list endpoints"],
            "availability": ["99.9% uptime SLO", "Health checks & auto-restart", "Multi-AZ deployment"],
            "usability": ["Responsive UI", "Accessible (WCAG AA)", "Consistent design system"],
        },
        "sdlc_plan": [
            {
                "phase": "Requirement Gathering",
                "objective": "Capture and validate stakeholder requirements.",
                "tasks": ["Stakeholder interviews", "Define personas", "Prioritize MVP scope"],
                "deliverables": ["Requirements doc", "User personas", "MVP scope"],
            },
            {
                "phase": "System Design",
                "objective": "Design architecture, data model and API contracts.",
                "tasks": ["High-level architecture", "ER diagram", "OpenAPI spec", "UI wireframes"],
                "deliverables": ["Architecture diagram", "DB schema", "API contracts"],
            },
            {
                "phase": "Development",
                "objective": "Implement features in iterative sprints.",
                "tasks": ["Backend APIs", "Frontend UI", "Integrations", "Code reviews"],
                "deliverables": ["Working software", "Unit tests", "Documentation"],
            },
            {
                "phase": "Testing",
                "objective": "Verify quality across functional and non-functional dimensions.",
                "tasks": ["Unit tests", "Integration tests", "E2E tests", "Load tests"],
                "deliverables": ["Test reports", "Bug list", "Performance baseline"],
            },
            {
                "phase": "Deployment",
                "objective": "Release to production safely.",
                "tasks": ["CI/CD pipeline", "Infrastructure as code", "Monitoring setup"],
                "deliverables": ["Production environment", "Runbooks", "Dashboards"],
            },
            {
                "phase": "Maintenance",
                "objective": "Operate, monitor, and continuously improve the system.",
                "tasks": ["Bug fixing", "Security patches", "Feature iteration"],
                "deliverables": ["Release notes", "SLA compliance", "Incident reports"],
            },
        ],
        "sprints": [
            {"name": "Sprint 1", "goal": "Foundations & Auth", "duration_weeks": 2,
             "tasks": ["Repo & CI setup", "Auth APIs", "Login/Signup UI", "DB schema v1"]},
            {"name": "Sprint 2", "goal": "Core CRUD", "duration_weeks": 2,
             "tasks": ["Resource APIs", "List & detail UI", "Form validation", "Unit tests"]},
            {"name": "Sprint 3", "goal": "Dashboard & Admin", "duration_weeks": 2,
             "tasks": ["KPI endpoints", "Dashboard UI", "Admin user management", "Audit logging"]},
            {"name": "Sprint 4", "goal": "Hardening & Launch", "duration_weeks": 2,
             "tasks": ["Performance tuning", "Security review", "E2E tests", "Production deploy"]},
        ],
        "user_stories": [
            {"role": "new user", "goal": "create an account", "benefit": "I can access the platform"},
            {"role": "registered user", "goal": "log in securely", "benefit": "my data stays private"},
            {"role": "user", "goal": "create and manage my items", "benefit": "I can get my work done"},
            {"role": "user", "goal": "search and filter items", "benefit": "I can find information quickly"},
            {"role": "admin", "goal": "manage users and roles", "benefit": "I can keep the system organized"},
            {"role": "admin", "goal": "view audit logs", "benefit": "I can investigate incidents"},
            {"role": "stakeholder", "goal": "see KPIs on a dashboard", "benefit": "I can make informed decisions"},
        ],
        "risks": {
            "technical": [
                {"risk": "Architectural complexity grows beyond team capacity",
                 "mitigation": "Start with a modular monolith; extract services only when needed"}
            ],
            "security": [
                {"risk": "Credential leakage and account takeover",
                 "mitigation": "Use hashed passwords, MFA, short-lived JWTs, and secret rotation"}
            ],
            "scalability": [
                {"risk": "Database becomes a bottleneck under load",
                 "mitigation": "Add read replicas, caching, and proper indexing"}
            ],
            "timeline": [
                {"risk": "Scope creep delays the MVP",
                 "mitigation": "Lock MVP scope, use a change-request process for new features"}
            ],
        },
        "testing_checklist": {
            "functional": ["All user stories pass acceptance criteria",
                           "CRUD flows work end-to-end",
                           "Role-based access is enforced"],
            "ui": ["Responsive across mobile/tablet/desktop",
                   "Keyboard navigation works",
                   "Loading and error states present"],
            "api": ["All endpoints return correct status codes",
                    "Input validation rejects malformed data",
                    "Pagination & filtering verified"],
            "security": ["OWASP Top 10 reviewed",
                         "Auth tokens expire correctly",
                         "Sensitive data is never logged"],
            "performance": ["P95 latency < 300ms under expected load",
                            "Frontend bundle size monitored",
                            "Database query plans reviewed"],
        },
        "tech_stack": {
            "frontend": [
                {"name": "React", "reason": "Mature, component-based UI library with a vast ecosystem."},
                {"name": "Tailwind CSS", "reason": "Utility-first styling for fast, consistent design."},
            ],
            "backend": [
                {"name": "FastAPI (Python)", "reason": "High-performance async APIs with automatic OpenAPI docs."},
            ],
            "database": [
                {"name": "PostgreSQL", "reason": "Reliable relational DB with strong tooling and JSON support."},
            ],
            "hosting": [
                {"name": "Docker + AWS / Render", "reason": "Reproducible deployments and easy horizontal scaling."},
            ],
            "apis": [
                {"name": "OpenAI API", "reason": "Generative AI features for planning and assistance."},
                {"name": "Stripe", "reason": "Battle-tested payments if monetization is needed."},
            ],
        },
        "timeline": {
            "total_weeks": 8,
            "milestones": [
                {"week": 2, "milestone": "Auth + foundations live in staging"},
                {"week": 4, "milestone": "Core CRUD complete"},
                {"week": 6, "milestone": "Dashboard & admin shipped"},
                {"week": 8, "milestone": "Production launch"},
            ],
        },
    }


def generate_plan(idea: str) -> dict[str, Any]:
    """Main entry point used by the API layer.

    Tries OpenAI first when configured, then gracefully falls back to
    the offline planner. Always returns a structured plan dict.
    """
    if settings.OPENAI_API_KEY:
        try:
            plan = _call_openai(idea)
            # Defensive: ensure required top-level keys exist
            if isinstance(plan, dict) and "summary" in plan:
                return plan
        except Exception as exc:  # noqa: BLE001
            # Log and fall back so the UX never breaks.
            print(f"[ai_service] OpenAI call failed, using offline planner: {exc}")

    return _offline_plan(idea)
