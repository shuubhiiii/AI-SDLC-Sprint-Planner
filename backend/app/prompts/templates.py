"""
Prompt templates for the ProjectPilot AI agentic workflow.

Each template enforces strict JSON output that matches the Pydantic
schemas in `app.schemas`. The schema is mirrored in the prompt so the
model has zero ambiguity about the expected shape.
"""

# Visible-to-the-UI workflow narration. Drives the animated step list
# while the backend is generating the plan.
WORKFLOW_STEPS = [
    "Analyzing project idea",
    "Extracting core modules and features",
    "Drafting functional requirements",
    "Drafting non-functional requirements",
    "Building 6-phase SDLC plan",
    "Composing Agile sprint plan",
    "Generating user stories",
    "Identifying risks and mitigations",
    "Producing testing checklist",
    "Recommending tech stack and timeline",
]


SYSTEM_ROLE = (
    "You are ProjectPilot AI, a senior software architect, agile coach, and "
    "SDLC strategist. You produce concise, realistic, and professional "
    "software planning artifacts. You ALWAYS respond with valid JSON that "
    "matches the requested schema exactly. No markdown, no commentary."
)


MASTER_PROMPT = """
Analyze the project idea below and return a complete structured planning
document as a SINGLE JSON object that matches the schema EXACTLY.

PROJECT IDEA:
\"\"\"{idea}\"\"\"

Reason internally as an agentic planner:
1. Identify project type, target users, main objective, and a one-line elevator pitch.
2. Break the system into 4-7 feature categories, each with 3-6 concrete items.
3. Derive 6-10 functional requirements (clear system behaviors).
4. Provide 3-5 non-functional requirements per category: Security, Scalability,
   Performance, Availability, Usability.
5. Build the 6 standard SDLC phases in order: Requirement Gathering, System Design,
   Development, Testing, Deployment, Maintenance — each with objective, 3-5 tasks,
   and 2-4 deliverables.
6. Build at least 3 sprints that progress logically (foundation -> core -> polish),
   each 2-3 weeks, with a goal and 3-6 tasks.
7. Write 5-8 realistic user stories (role / goal / benefit).
8. For each risk bucket (technical, security, scalability, timeline), list 2-4
   risks each with a concrete mitigation.
9. Build a testing checklist with 4-6 items per category: functional, ui, api,
   security, performance.
10. Recommend 2-3 concrete tech choices per layer (Frontend, Backend, Database,
    Hosting, APIs), each with a 1-sentence reason.
11. Produce a timeline with `total_weeks` and 5-8 weekly milestones.

Return ONLY this JSON object (no markdown, no prose):

{{
  "summary": {{
    "project_type": "string",
    "target_users": ["string", "..."],
    "main_objective": "string",
    "elevator_pitch": "string"
  }},
  "features": [
    {{ "category": "string", "items": ["string", "..."] }}
  ],
  "functional_requirements": ["string", "..."],
  "non_functional_requirements": {{
    "Security": ["string", "..."],
    "Scalability": ["string", "..."],
    "Performance": ["string", "..."],
    "Availability": ["string", "..."],
    "Usability": ["string", "..."]
  }},
  "sdlc_plan": [
    {{
      "phase": "Requirement Gathering",
      "objective": "string",
      "tasks": ["string", "..."],
      "deliverables": ["string", "..."]
    }}
  ],
  "sprints": [
    {{
      "name": "Sprint 1",
      "goal": "string",
      "tasks": ["string", "..."],
      "duration_weeks": 2
    }}
  ],
  "user_stories": [
    {{ "role": "string", "goal": "string", "benefit": "string" }}
  ],
  "risks": {{
    "technical":   [{{ "risk": "string", "mitigation": "string" }}],
    "security":    [{{ "risk": "string", "mitigation": "string" }}],
    "scalability": [{{ "risk": "string", "mitigation": "string" }}],
    "timeline":    [{{ "risk": "string", "mitigation": "string" }}]
  }},
  "testing_checklist": {{
    "functional":  ["string", "..."],
    "ui":          ["string", "..."],
    "api":         ["string", "..."],
    "security":    ["string", "..."],
    "performance": ["string", "..."]
  }},
  "tech_stack": {{
    "Frontend": [{{ "name": "string", "reason": "string" }}],
    "Backend":  [{{ "name": "string", "reason": "string" }}],
    "Database": [{{ "name": "string", "reason": "string" }}],
    "Hosting":  [{{ "name": "string", "reason": "string" }}],
    "APIs":     [{{ "name": "string", "reason": "string" }}]
  }},
  "timeline": {{
    "total_weeks": 12,
    "milestones": [
      {{ "week": 1, "milestone": "string" }}
    ]
  }}
}}

Hard constraints:
- Output MUST be a single valid JSON object. No markdown fences. No prose.
- Field names and casing MUST match exactly.
- `sdlc_plan` MUST contain exactly 6 phases in the standard order.
- `sprints` MUST contain at least 3 entries.
- Each string MUST be concise (<= 220 chars) and concrete to this idea.
""".strip()


def build_master_prompt(idea: str) -> str:
    """Inject the user's idea into the master prompt template."""
    safe = idea.replace('"""', "'''")
    return MASTER_PROMPT.format(idea=safe)


TITLE_PROMPT = """
Generate a short professional product title (max 6 words) for this idea.
Return ONLY the title text, no quotes, no punctuation at the end.

IDEA: {idea}
""".strip()


CUSTOMIZE_PROMPT = """
You previously generated an "AI Recommended Plan" for the project below.
The user has now provided customization preferences. Regenerate the FULL
plan as a single JSON object that adapts to these preferences while
keeping the same JSON schema and field names exactly.

PROJECT IDEA:
\"\"\"{idea}\"\"\"

USER PREFERENCES (apply ALL that are present; ignore any that are empty):
- Preferred tech stack: {tech_stack}
- Team size: {team_size}
- Sprint duration (weeks): {sprint_duration}
- Target timeline (weeks): {timeline_weeks}
- Architecture preference: {architecture}
- Top priority: {priority}
- Additional notes: {notes}

Adaptive behavior REQUIRED:
1. tech_stack: Re-bias `tech_stack.Frontend` / `Backend` / `Database` / `Hosting`
   / `APIs` to favor the listed technologies (still recommend 2-3 per layer
   with reasons). If a tech isn't natural for a layer, omit it for that layer.
2. team_size: Adjust workload, sprint task count, and number of parallel tracks.
   - Solo developer: 3-4 tasks per sprint, sequential work.
   - Small team (2-5):  4-6 tasks per sprint.
   - Medium team (6-15): 5-7 tasks per sprint, parallel tracks.
   - Enterprise (15+):   6-8 tasks per sprint, multi-team coordination.
3. sprint_duration: Set every sprint's `duration_weeks` to this value.
4. timeline_weeks: Set `timeline.total_weeks` to this and rebuild milestones
   evenly. Recompute the number of sprints accordingly
   (sprints * sprint_duration ≈ timeline_weeks; minimum 3 sprints).
5. architecture: Reflect this in `summary`, `sdlc_plan` (System Design phase),
   and `tech_stack` choices (e.g. microservices => containers + service mesh).
6. priority: Re-rank features and adjust non-functional requirements.
   - Fast MVP: trim features, prioritize core, shorter sprints.
   - Scalability: emphasize horizontal scaling, queues, caching.
   - Security: add auth/audit/compliance items, more security tests.
   - Performance: caching, CDN, profiling, load testing.
   - Budget-friendly: open-source, managed free tiers, minimal services.
7. notes: Treat as additional constraints from the user.

Return ONLY the JSON object that matches this schema (same as the master
plan):

{{
  "summary": {{ "project_type": "string", "target_users": ["string"], "main_objective": "string", "elevator_pitch": "string" }},
  "features": [{{ "category": "string", "items": ["string"] }}],
  "functional_requirements": ["string"],
  "non_functional_requirements": {{ "Security": ["string"], "Scalability": ["string"], "Performance": ["string"], "Availability": ["string"], "Usability": ["string"] }},
  "sdlc_plan": [{{ "phase": "string", "objective": "string", "tasks": ["string"], "deliverables": ["string"] }}],
  "sprints": [{{ "name": "string", "goal": "string", "tasks": ["string"], "duration_weeks": 0 }}],
  "user_stories": [{{ "role": "string", "goal": "string", "benefit": "string" }}],
  "risks": {{ "technical": [{{"risk":"string","mitigation":"string"}}], "security": [], "scalability": [], "timeline": [] }},
  "testing_checklist": {{ "functional": [], "ui": [], "api": [], "security": [], "performance": [] }},
  "tech_stack": {{ "Frontend": [{{"name":"string","reason":"string"}}], "Backend": [], "Database": [], "Hosting": [], "APIs": [] }},
  "timeline": {{ "total_weeks": 0, "milestones": [{{ "week": 1, "milestone": "string" }}] }}
}}

Hard constraints:
- Output MUST be a single valid JSON object (no markdown, no prose).
- `sdlc_plan` MUST contain exactly 6 phases in the standard order.
- `sprints` MUST contain at least 3 entries.
- Every field name and casing MUST match exactly.
""".strip()


def build_customize_prompt(idea: str, preferences: dict) -> str:
    """Inject idea + preferences into the customization prompt."""
    safe_idea = idea.replace('"""', "'''")
    tech = ", ".join(preferences.get("tech_stack") or []) or "(no preference)"

    def _v(key: str) -> str:
        v = preferences.get(key)
        return str(v) if v not in (None, "", []) else "(no preference)"

    return CUSTOMIZE_PROMPT.format(
        idea=safe_idea,
        tech_stack=tech,
        team_size=_v("team_size"),
        sprint_duration=_v("sprint_duration_weeks"),
        timeline_weeks=_v("timeline_weeks"),
        architecture=_v("architecture"),
        priority=_v("priority"),
        notes=_v("notes"),
    )
