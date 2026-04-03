"""
Personalization algorithm (Phase 1D / CLAUDE “Algorithm 4” style):
- Source quality: 30%
- User feedback (per-article + category affinity): 40%
- Recency (exponential decay): 20%
- Category preference (from historical thumbs): 10%
"""

from __future__ import annotations

import math
from datetime import datetime
from typing import Dict, List, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session

from models import Article, UserFeedback
from quality import source_quality_score


def category_affinity_map(db: Session) -> Dict[str, float]:
    """Map category -> [0,1] affinity from average feedback (-1..1 -> 0..1)."""
    rows = (
        db.query(Article.category, func.avg(UserFeedback.feedback))
        .join(UserFeedback, UserFeedback.article_id == Article.id)
        .group_by(Article.category)
        .all()
    )
    out: Dict[str, float] = {}
    for cat, avg in rows:
        if not cat or avg is None:
            continue
        try:
            v = float(avg)
        except (TypeError, ValueError):
            continue
        out[cat] = max(0.0, min(1.0, (v + 1.0) / 2.0))
    return out


def feedback_by_article(db: Session, article_ids: List[int]) -> Dict[int, int]:
    if not article_ids:
        return {}
    rows = (
        db.query(UserFeedback.article_id, UserFeedback.feedback)
        .filter(UserFeedback.article_id.in_(article_ids))
        .all()
    )
    return {aid: fb for aid, fb in rows}


def personalization_score(
    article: Article,
    feedback_value: int | None,
    cat_affinity: Dict[str, float],
    now: datetime | None = None,
) -> float:
    now = now or datetime.utcnow()
    src = article.source
    r = src.rating if src else 3
    q_src = (source_quality_score(r) / 100.0) * 0.30

    if feedback_value == 1:
        q_fb = 1.0
    elif feedback_value == -1:
        q_fb = 0.0
    elif feedback_value == 0:
        q_fb = 0.5
    else:
        q_fb = 0.55
    q_fb *= 0.40

    pub = article.published_at or article.fetched_at or datetime.utcnow()
    if getattr(pub, "tzinfo", None) is not None:
        pub = pub.replace(tzinfo=None)
    age_days = max(0.0, (now - pub).total_seconds() / 86400.0)
    recency = math.exp(-age_days / 10.0) * 0.20

    cat = article.category or "models"
    aff = cat_affinity.get(cat, 0.5)
    q_cat = aff * 0.10

    return q_src + q_fb + recency + q_cat


def rank_articles(
    db: Session, articles: List[Article]
) -> List[Tuple[Article, float]]:
    if not articles:
        return []
    ids = [a.id for a in articles]
    fb_map = feedback_by_article(db, ids)
    cat_affinity = category_affinity_map(db)
    now = datetime.utcnow()
    scored: List[Tuple[Article, float]] = []
    for a in articles:
        fv = fb_map.get(a.id)
        s = personalization_score(a, fv, cat_affinity, now=now)
        scored.append((a, s))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored
