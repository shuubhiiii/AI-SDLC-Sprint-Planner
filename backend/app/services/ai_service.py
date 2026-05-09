"""
AI service layer.

Multi-provider:
  - Gemini  (google-generativeai)   — preferred when GEMINI_API_KEY is set
  - OpenAI  (openai)                — used when OPENAI_API_KEY is set
  - Offline deterministic planner   — fallback so demos never break

The active provider is decided by:
  AI_PROVIDER = gemini | openai | auto (default)
"""
import json
import logging
import os
from typing import Any

from dotenv import load_dotenv

from ..prompts.templates import SYSTEM_ROLE, build_master_prompt, TITLE_PROMPT, build_customize_prompt
from ..utils.parser import extract_json
from .offline_planner import offline_plan, offline_title, offline_customize

load_dotenv()
log = logging.getLogger(__name__)


def _is_real(key: str) -> bool:
    k = (key or "").strip()
    if not k:
        return False
    low = k.lower()
    return not low.startswith(("sk-your", "your-", "changeme", "replace", "<"))


_AI_PROVIDER = (os.getenv("AI_PROVIDER") or "auto").strip().lower()

_OPENAI_KEY = os.getenv("OPENAI_API_KEY", "").strip()
_OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

_GEMINI_KEY = os.getenv("GEMINI_API_KEY", "").strip()
_GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

_HAS_OPENAI = _is_real(_OPENAI_KEY)
_HAS_GEMINI = _is_real(_GEMINI_KEY)


def _resolve_provider() -> str:
    if _AI_PROVIDER == "gemini" and _HAS_GEMINI:
        return "gemini"
    if _AI_PROVIDER == "openai" and _HAS_OPENAI:
        return "openai"
    if _AI_PROVIDER == "auto":
        if _HAS_GEMINI:
            return "gemini"
        if _HAS_OPENAI:
            return "openai"
    return "offline"


# ---------- OpenAI ----------

_openai_client = None


def _get_openai():
    global _openai_client
    if _openai_client is None:
        from openai import OpenAI
        _openai_client = OpenAI(api_key=_OPENAI_KEY)
    return _openai_client


def _openai_chat_json(prompt: str, temperature: float) -> Any:
    resp = _get_openai().chat.completions.create(
        model=_OPENAI_MODEL,
        temperature=temperature,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_ROLE},
            {"role": "user", "content": prompt},
        ],
    )
    return extract_json(resp.choices[0].message.content or "")


def _openai_chat_text(system: str, prompt: str, temperature: float) -> str:
    resp = _get_openai().chat.completions.create(
        model=_OPENAI_MODEL,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
    )
    return (resp.choices[0].message.content or "").strip()


# ---------- Gemini ----------

_gemini_configured = False


def _ensure_gemini():
    global _gemini_configured
    if not _gemini_configured:
        import google.generativeai as genai
        genai.configure(api_key=_GEMINI_KEY)
        _gemini_configured = True
    import google.generativeai as genai
    return genai


def _gemini_chat_json(prompt: str, temperature: float) -> Any:
    genai = _ensure_gemini()
    model = genai.GenerativeModel(
        _GEMINI_MODEL,
        system_instruction=SYSTEM_ROLE,
        generation_config={
            "temperature": temperature,
            "response_mime_type": "application/json",
        },
    )
    resp = model.generate_content(prompt)
    text = (getattr(resp, "text", None) or "").strip()
    if not text:
        # Fallback: stitch parts manually
        try:
            parts = resp.candidates[0].content.parts  # type: ignore[attr-defined]
            text = "".join(getattr(p, "text", "") for p in parts)
        except Exception:
            text = ""
    return extract_json(text)


def _gemini_chat_text(system: str, prompt: str, temperature: float) -> str:
    genai = _ensure_gemini()
    model = genai.GenerativeModel(
        _GEMINI_MODEL,
        system_instruction=system,
        generation_config={"temperature": temperature},
    )
    resp = model.generate_content(prompt)
    return (getattr(resp, "text", "") or "").strip()


# ---------- Public API ----------

def active_provider() -> str:
    """Expose the active provider for diagnostics."""
    return _resolve_provider()


def generate_plan(idea: str) -> dict:
    """Run the master planning prompt; fall back across providers."""
    provider = _resolve_provider()
    prompt = build_master_prompt(idea)

    if provider == "gemini":
        try:
            return _gemini_chat_json(prompt, temperature=0.6)
        except Exception as e:
            log.warning("Gemini plan failed (%s); trying OpenAI/offline.", e)

    if provider == "openai" or _HAS_OPENAI:
        try:
            return _openai_chat_json(prompt, temperature=0.4)
        except Exception as e:
            log.warning("OpenAI plan failed (%s); using offline planner.", e)

    log.info("Using offline deterministic planner.")
    return offline_plan(idea)


def customize_plan(idea: str, preferences: dict) -> dict:
    """
    Regenerate the plan adapted to user preferences (tech stack, team size,
    sprint duration, timeline, architecture, priority, notes).
    Falls back across providers, then to the deterministic offline customizer.
    """
    provider = _resolve_provider()
    prompt = build_customize_prompt(idea, preferences)

    if provider == "gemini":
        try:
            return _gemini_chat_json(prompt, temperature=0.5)
        except Exception as e:
            log.warning("Gemini customize failed (%s); trying OpenAI/offline.", e)

    if provider == "openai" or _HAS_OPENAI:
        try:
            return _openai_chat_json(prompt, temperature=0.4)
        except Exception as e:
            log.warning("OpenAI customize failed (%s); using offline customizer.", e)

    log.info("Using offline deterministic customizer.")
    return offline_customize(idea, preferences)


def generate_title(idea: str) -> str:
    """Short product-style title for the idea."""
    provider = _resolve_provider()
    prompt = TITLE_PROMPT.format(idea=idea)
    sys = "You write concise product titles."

    if provider == "gemini":
        try:
            t = _gemini_chat_text(sys, prompt, temperature=0.5).strip().strip('"').strip("'")
            return (t[:120] or offline_title(idea))
        except Exception as e:
            log.warning("Gemini title failed (%s); trying OpenAI/offline.", e)

    if provider == "openai" or _HAS_OPENAI:
        try:
            t = _openai_chat_text(sys, prompt, temperature=0.5).strip().strip('"').strip("'")
            return (t[:120] or offline_title(idea))
        except Exception as e:
            log.warning("OpenAI title failed (%s); using offline title.", e)

    return offline_title(idea)


def ask(question: str, context: str | None = None) -> dict:
    """
    Free-form Q&A used by the 'Ask AI' page.

    Returns: {"answer": str, "provider": str}
    """
    provider = _resolve_provider()
    sys = (
        "You are ProjectPilot AI's planning assistant. "
        "Answer the user's question about software planning, SDLC, Agile, "
        "user stories, risks, testing, or tech stacks. "
        "Be concise, structured and use markdown when helpful."
    )
    user = question.strip()
    if context:
        user = f"Context:\n{context}\n\nQuestion:\n{question}"

    if provider == "gemini":
        try:
            return {"answer": _gemini_chat_text(sys, user, temperature=0.6), "provider": "gemini"}
        except Exception as e:
            log.warning("Gemini ask failed (%s); trying OpenAI.", e)

    if _HAS_OPENAI:
        try:
            return {"answer": _openai_chat_text(sys, user, temperature=0.4), "provider": "openai"}
        except Exception as e:
            log.warning("OpenAI ask failed (%s).", e)

    return {
        "answer": (
            "No AI provider is configured. Add a `GEMINI_API_KEY` (preferred) "
            "or `OPENAI_API_KEY` to `backend/.env` and restart the server to "
            "enable custom queries."
        ),
        "provider": "offline",
    }
