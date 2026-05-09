"""
Deterministic offline planner.

Used when no OPENAI_API_KEY is configured (or when the OpenAI call fails)
so the demo never breaks. The output is generic-but-coherent and shaped
exactly like the Pydantic ProjectPlan schema, so the frontend renders
without any code paths that special-case it.
"""
from __future__ import annotations
import re
from typing import Any


def _keywords(idea: str, n: int = 3) -> list[str]:
    """Pick a few salient tokens from the idea to personalize the output."""
    tokens = re.findall(r"[A-Za-z][A-Za-z\-]{2,}", idea.lower())
    stop = {
        "the", "and", "for", "with", "that", "this", "want", "build",
        "make", "create", "into", "from", "have", "users", "user", "app",
        "application", "platform", "system", "would", "need", "their",
        "they", "them", "able", "should", "will", "like",
    }
    seen, out = set(), []
    for t in tokens:
        if t in stop or t in seen:
            continue
        seen.add(t)
        out.append(t)
        if len(out) >= n:
            break
    return out or ["product"]


def _cap(s: str) -> str:
    return s[:1].upper() + s[1:] if s else s


def offline_plan(idea: str) -> dict[str, Any]:
    """Build a deterministic plan dict from a raw idea string."""
    kws = _keywords(idea, 3)
    domain = " ".join(_cap(k) for k in kws)
    primary = _cap(kws[0])

    return {
        "summary": {
            "project_type": f"{domain} Web/Mobile Platform",
            "target_users": [
                f"End users interested in {primary.lower()}",
                "Administrators and operators",
                "Business stakeholders",
            ],
            "main_objective": (
                f"Deliver a reliable {primary.lower()} platform that solves "
                "the problem described in the idea with a clean UX and "
                "strong engineering foundations."
            ),
            "elevator_pitch": (
                f"A modern {primary.lower()} platform that turns the user's "
                "idea into a production-ready product across web and mobile."
            ),
        },
        "features": [
            {
                "category": "Authentication & Accounts",
                "items": [
                    "Email + password signup and login",
                    "Password reset and email verification",
                    "Role-based access (user, admin)",
                    "Profile management",
                ],
            },
            {
                "category": f"{primary} Core",
                "items": [
                    f"Browse and search {primary.lower()} content",
                    "Create and manage primary entities",
                    "Filter, sort and paginate results",
                    "Detail pages with rich actions",
                ],
            },
            {
                "category": "Notifications",
                "items": [
                    "In-app notifications",
                    "Email notifications for key events",
                    "User-configurable preferences",
                ],
            },
            {
                "category": "Admin & Analytics",
                "items": [
                    "Admin dashboard",
                    "User and content management",
                    "Usage analytics and KPIs",
                ],
            },
        ],
        "functional_requirements": [
            "Users can register, log in and recover their password securely.",
            f"Users can browse, search and filter {primary.lower()} content.",
            "Users can create, update and delete their own data.",
            "Admins can manage users, content and platform settings.",
            "The system sends notifications for important events.",
            "All data changes are persisted reliably to the database.",
            "The system exposes a versioned REST API for all features.",
        ],
        "non_functional_requirements": {
            "Security": [
                "Hashed passwords (bcrypt/argon2)",
                "JWT-based stateless authentication",
                "Input validation and rate limiting",
                "OWASP Top 10 mitigations",
            ],
            "Scalability": [
                "Stateless API services behind a load balancer",
                "Horizontal scaling of workers",
                "Database read replicas where needed",
            ],
            "Performance": [
                "P95 API latency under 300ms for hot paths",
                "Aggressive client-side caching of static assets",
                "Server-side pagination for all list endpoints",
            ],
            "Availability": [
                "99.9% monthly uptime target",
                "Health checks and automatic restarts",
                "Daily database backups",
            ],
            "Usability": [
                "Responsive UI across desktop and mobile",
                "WCAG AA accessibility for core flows",
                "Clear empty, loading and error states",
            ],
        },
        "sdlc_plan": [
            {
                "phase": "Requirement Gathering",
                "objective": "Capture and validate functional + non-functional needs.",
                "tasks": [
                    "Interview stakeholders",
                    "Define user personas",
                    "Document MVP scope",
                    "Sign-off on requirements",
                ],
                "deliverables": ["BRD/PRD", "User personas", "Scope document"],
            },
            {
                "phase": "System Design",
                "objective": "Design architecture, data model and APIs.",
                "tasks": [
                    "Draft architecture diagram",
                    "Design database schema",
                    "Define API contracts",
                    "Plan security model",
                ],
                "deliverables": [
                    "Architecture diagram",
                    "ERD",
                    "OpenAPI spec",
                ],
            },
            {
                "phase": "Development",
                "objective": "Implement features iteratively per sprint plan.",
                "tasks": [
                    "Set up CI/CD",
                    "Build backend services",
                    "Build frontend UI",
                    "Code reviews",
                ],
                "deliverables": ["Working increments", "Reviewed pull requests"],
            },
            {
                "phase": "Testing",
                "objective": "Verify quality across functionality, UI, API and security.",
                "tasks": [
                    "Unit tests",
                    "Integration tests",
                    "End-to-end tests",
                    "Security scans",
                ],
                "deliverables": ["Test reports", "Bug-free release candidate"],
            },
            {
                "phase": "Deployment",
                "objective": "Ship the product to production safely.",
                "tasks": [
                    "Provision infrastructure",
                    "Run database migrations",
                    "Blue/green deploy",
                    "Smoke tests in prod",
                ],
                "deliverables": ["Production environment", "Runbooks"],
            },
            {
                "phase": "Maintenance",
                "objective": "Monitor, patch and iterate based on feedback.",
                "tasks": [
                    "Monitor logs and metrics",
                    "Triage bugs",
                    "Ship improvements",
                    "Periodic dependency updates",
                ],
                "deliverables": ["Incident reports", "Release notes"],
            },
        ],
        "sprints": [
            {
                "name": "Sprint 1",
                "goal": "Foundations: auth, project skeleton, CI/CD.",
                "tasks": [
                    "Set up repo, CI/CD and environments",
                    "Implement signup/login/password reset",
                    "Scaffold core API and DB schema",
                    "Build base UI shell and navigation",
                ],
                "duration_weeks": 2,
            },
            {
                "name": "Sprint 2",
                "goal": f"{primary} core flows end-to-end.",
                "tasks": [
                    f"Implement primary {primary.lower()} CRUD APIs",
                    "Build core list and detail pages",
                    "Add search and filtering",
                    "Wire notifications for key events",
                ],
                "duration_weeks": 2,
            },
            {
                "name": "Sprint 3",
                "goal": "Polish, admin, hardening and launch prep.",
                "tasks": [
                    "Build admin dashboard",
                    "Add analytics and usage tracking",
                    "Security review and load tests",
                    "Production deployment and smoke tests",
                ],
                "duration_weeks": 2,
            },
        ],
        "user_stories": [
            {
                "role": "new user",
                "goal": "sign up and verify my email",
                "benefit": "I can securely access the platform",
            },
            {
                "role": "returning user",
                "goal": "log in and resume what I was doing",
                "benefit": "I save time and stay productive",
            },
            {
                "role": "user",
                "goal": f"browse and search {primary.lower()} content quickly",
                "benefit": "I find what I need without friction",
            },
            {
                "role": "user",
                "goal": "receive notifications for important events",
                "benefit": "I never miss something that matters to me",
            },
            {
                "role": "admin",
                "goal": "manage users and content from a dashboard",
                "benefit": "I can keep the platform healthy",
            },
            {
                "role": "stakeholder",
                "goal": "see usage analytics",
                "benefit": "I can make informed product decisions",
            },
        ],
        "risks": {
            "technical": [
                {
                    "risk": "Unclear requirements lead to rework.",
                    "mitigation": "Lock down MVP scope before sprint 1.",
                },
                {
                    "risk": "Third-party API instability.",
                    "mitigation": "Wrap integrations behind adapters and add retries.",
                },
            ],
            "security": [
                {
                    "risk": "Credential stuffing or brute-force attacks.",
                    "mitigation": "Rate limiting, lockouts and MFA option.",
                },
                {
                    "risk": "Sensitive data leakage in logs.",
                    "mitigation": "Centralized log scrubbing and PII allowlists.",
                },
            ],
            "scalability": [
                {
                    "risk": "Database becomes the bottleneck under load.",
                    "mitigation": "Add read replicas, indexes and pagination.",
                },
                {
                    "risk": "N+1 queries in list endpoints.",
                    "mitigation": "Use eager loading and add query budgets in CI.",
                },
            ],
            "timeline": [
                {
                    "risk": "Scope creep during sprints.",
                    "mitigation": "Strict change-control via product owner.",
                },
                {
                    "risk": "Underestimated infra setup time.",
                    "mitigation": "Front-load DevOps tasks in Sprint 1.",
                },
            ],
        },
        "testing_checklist": {
            "functional": [
                "Auth: signup, login, password reset",
                "CRUD: create, read, update, delete primary entities",
                "Search and filtering returns expected results",
                "Permissions enforced for admin routes",
            ],
            "ui": [
                "Responsive layout on mobile and desktop",
                "Empty, loading and error states present",
                "Keyboard navigation works on key forms",
                "Color contrast meets WCAG AA",
            ],
            "api": [
                "Schema validation on every endpoint",
                "Auth middleware applied where required",
                "Pagination and sorting supported on list endpoints",
                "OpenAPI documentation up to date",
            ],
            "security": [
                "OWASP Top 10 review",
                "Dependency vulnerability scan in CI",
                "Authn/authz tests for every protected route",
                "Secrets are never logged or committed",
            ],
            "performance": [
                "P95 latency budgets defined and tested",
                "Load test of critical endpoints",
                "Frontend Lighthouse score ≥ 90",
                "DB query plans reviewed for hot paths",
            ],
        },
        "tech_stack": {
            "Frontend": [
                {
                    "name": "React + Vite",
                    "reason": "Fast DX, component model, huge ecosystem.",
                },
                {
                    "name": "Tailwind CSS",
                    "reason": "Utility-first styling for rapid, consistent UI.",
                },
            ],
            "Backend": [
                {
                    "name": "Python FastAPI",
                    "reason": "Async, typed, auto-generated OpenAPI docs.",
                },
                {
                    "name": "Pydantic",
                    "reason": "Strong runtime validation of all inputs/outputs.",
                },
            ],
            "Database": [
                {
                    "name": "SQLite (dev) / PostgreSQL (prod)",
                    "reason": "Zero-config locally, battle-tested in production.",
                },
            ],
            "Hosting": [
                {
                    "name": "Render / Railway / Fly.io",
                    "reason": "Simple deploys with managed Postgres and TLS.",
                },
                {
                    "name": "Vercel / Netlify (frontend)",
                    "reason": "Global CDN and zero-config previews.",
                },
            ],
            "APIs": [
                {
                    "name": "OpenAI API",
                    "reason": "Powers the agentic planning workflow.",
                },
                {
                    "name": "SendGrid / Resend",
                    "reason": "Reliable transactional email delivery.",
                },
            ],
        },
        "timeline": {
            "total_weeks": 8,
            "milestones": [
                {"week": 1, "milestone": "Repo, CI/CD and auth scaffolding"},
                {"week": 2, "milestone": "MVP API contracts and DB schema"},
                {"week": 3, "milestone": "Core feature flows end-to-end"},
                {"week": 4, "milestone": "Notifications and search"},
                {"week": 5, "milestone": "Admin dashboard and analytics"},
                {"week": 6, "milestone": "Security review and load testing"},
                {"week": 7, "milestone": "Beta release to early users"},
                {"week": 8, "milestone": "Public launch"},
            ],
        },
    }


def offline_title(idea: str) -> str:
    """Build a short readable title from the idea."""
    kws = _keywords(idea, 3)
    if not kws:
        return "Untitled Project"
    return " ".join(_cap(k) for k in kws)[:80]


# ---------- Customization-aware offline regeneration ----------

_TEAM_TASK_TARGETS = {
    "solo developer": 4,
    "small team": 5,
    "medium team": 6,
    "enterprise team": 7,
}

_TECH_REASONS = {
    "react": ("React + Vite", "Component model, fast DX, massive ecosystem."),
    "angular": ("Angular", "Opinionated framework with first-class TypeScript."),
    "flutter": ("Flutter", "Single codebase for iOS, Android and web."),
    "fastapi": ("Python FastAPI", "Async, typed, auto OpenAPI docs."),
    "node.js": ("Node.js + Express", "Lightweight, JS everywhere, huge ecosystem."),
    "nodejs": ("Node.js + Express", "Lightweight, JS everywhere, huge ecosystem."),
    "node": ("Node.js + Express", "Lightweight, JS everywhere, huge ecosystem."),
}

_FRONTEND_KEYS = {"react", "angular", "flutter"}
_BACKEND_KEYS = {"fastapi", "node.js", "nodejs", "node"}


def _resize_list(items: list, target: int, filler_prefix: str) -> list:
    items = list(items or [])
    if len(items) >= target:
        return items[:target]
    while len(items) < target:
        items.append(f"{filler_prefix} #{len(items) + 1}")
    return items


def offline_customize(idea: str, preferences: dict) -> dict:
    """
    Build a plan that *adapts* to the supplied preferences.
    Always falls back to a coherent shape that matches ProjectPlan.
    """
    plan = offline_plan(idea)

    prefs = preferences or {}
    tech_pref = [t.lower().strip() for t in (prefs.get("tech_stack") or []) if t]
    team = (prefs.get("team_size") or "").lower().strip()
    sprint_dur = prefs.get("sprint_duration_weeks")
    timeline = prefs.get("timeline_weeks")
    architecture = (prefs.get("architecture") or "").strip()
    priority = (prefs.get("priority") or "").lower().strip()
    notes = (prefs.get("notes") or "").strip()

    # 1. Tech stack re-bias
    if tech_pref:
        front, back = [], []
        for t in tech_pref:
            entry = _TECH_REASONS.get(t)
            if not entry:
                continue
            name, reason = entry
            item = {"name": name, "reason": reason}
            if t in _FRONTEND_KEYS:
                front.append(item)
            elif t in _BACKEND_KEYS:
                back.append(item)
        if front:
            plan["tech_stack"]["Frontend"] = front + [
                {"name": "Tailwind CSS", "reason": "Utility-first styling."}
            ]
        if back:
            plan["tech_stack"]["Backend"] = back + [
                {"name": "Pydantic / Zod", "reason": "Runtime validation of I/O."}
            ]

    # 2. Architecture
    if architecture:
        plan["summary"]["main_objective"] += f" Architecture: {architecture}."
        if "microservice" in architecture.lower():
            plan["tech_stack"]["Hosting"] = [
                {"name": "Kubernetes / ECS", "reason": "Service orchestration."},
                {"name": "Docker", "reason": "Container packaging for each service."},
            ]
        elif "serverless" in architecture.lower():
            plan["tech_stack"]["Hosting"] = [
                {"name": "AWS Lambda / Cloudflare Workers", "reason": "Pay-per-use, zero ops."},
                {"name": "API Gateway", "reason": "Front door for serverless functions."},
            ]

    # 3. Priority adjustments
    if priority:
        nfr = plan["non_functional_requirements"]
        if "security" in priority:
            nfr["Security"] = nfr["Security"] + [
                "Mandatory MFA for admin accounts",
                "Quarterly third-party security audits",
            ]
        elif "performance" in priority:
            nfr["Performance"] = nfr["Performance"] + [
                "CDN for static assets",
                "Aggressive caching with stale-while-revalidate",
            ]
        elif "scalab" in priority:
            nfr["Scalability"] = nfr["Scalability"] + [
                "Async job queues for heavy work",
                "Horizontal autoscaling on CPU/RPS",
            ]
        elif "mvp" in priority or "fast" in priority:
            # Trim features to top 3 categories
            plan["features"] = plan["features"][:3]
        elif "budget" in priority:
            plan["tech_stack"]["Hosting"] = [
                {"name": "Free-tier managed services", "reason": "Minimize spend during MVP."},
                {"name": "SQLite + Litestream", "reason": "Cheap, durable persistence."},
            ]

    # 4. Sprints — duration + team-based task density
    target_tasks = _TEAM_TASK_TARGETS.get(team, 5)
    base_dur = int(sprint_dur) if sprint_dur else (
        plan["sprints"][0]["duration_weeks"] if plan["sprints"] else 2
    )

    # 5. Timeline — recompute number of sprints
    if timeline:
        total = max(2, int(timeline))
        n_sprints = max(3, round(total / max(1, base_dur)))
    else:
        n_sprints = max(3, len(plan["sprints"]))
        total = n_sprints * base_dur

    base_sprints = plan["sprints"]
    sprints_out = []
    for i in range(n_sprints):
        src = base_sprints[i] if i < len(base_sprints) else {
            "name": f"Sprint {i + 1}",
            "goal": f"Iteration {i + 1}: extend features and harden the system.",
            "tasks": [
                "Refine core flows from previous sprint",
                "Address tech debt and review feedback",
                "Add metrics and observability",
                "Improve test coverage",
            ],
            "duration_weeks": base_dur,
        }
        src = dict(src)
        src["name"] = f"Sprint {i + 1}"
        src["duration_weeks"] = base_dur
        src["tasks"] = _resize_list(src.get("tasks", []), target_tasks, "Additional task")
        sprints_out.append(src)
    plan["sprints"] = sprints_out

    # 6. Timeline + milestones evenly spaced
    plan["timeline"]["total_weeks"] = total
    step = max(1, total // 6)
    milestones = []
    for w in range(step, total + 1, step):
        milestones.append({"week": min(w, total), "milestone": f"Checkpoint at week {min(w, total)}"})
    if not milestones or milestones[-1]["week"] != total:
        milestones.append({"week": total, "milestone": "Public launch"})
    plan["timeline"]["milestones"] = milestones[:8]

    # 7. Notes
    if notes:
        plan["summary"]["elevator_pitch"] += f" Note: {notes}"

    return plan

