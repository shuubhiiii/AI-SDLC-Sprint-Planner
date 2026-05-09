"""Helpers for safely parsing LLM JSON output."""
import json
import re
from typing import Any


def extract_json(text: str) -> Any:
    """
    Best-effort extraction of a JSON object from a model response.

    Handles cases where the model wraps JSON in markdown fences or adds
    a stray prefix/suffix despite instructions.
    """
    if not text:
        raise ValueError("Empty model response")

    # Strip common code fences
    cleaned = text.strip()
    fence = re.match(r"^```(?:json)?\s*(.*)\s*```$", cleaned, re.DOTALL)
    if fence:
        cleaned = fence.group(1).strip()

    # Fast path
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Fallback: grab the first top-level {...} block
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = cleaned[start : end + 1]
        return json.loads(candidate)

    raise ValueError("Could not parse JSON from model response")
