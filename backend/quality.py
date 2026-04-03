"""Source quality score on a 0–100 scale derived from 1–5 star rating."""

from __future__ import annotations


def source_quality_score(rating: int | None) -> int:
    r = rating if rating is not None else 3
    r = max(1, min(5, r))
    return int(round((r / 5.0) * 100))


def passes_quality_threshold(rating: int | None, min_score: int = 51) -> bool:
    """True if quality score is strictly above 50 (i.e. >= 51 on integer scale)."""
    return source_quality_score(rating) >= min_score
