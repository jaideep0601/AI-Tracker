"""Scheduled background jobs (e.g. periodic source ingestion)."""

import logging
from typing import Callable

from sqlalchemy.orm import Session

from config import settings
from ingestion import ingest_sources_by_ids
from quality import passes_quality_threshold

logger = logging.getLogger(__name__)


def eligible_active_source_ids(db: Session) -> list[int]:
    """Active sources whose quality score meets the minimum threshold (> 50 → >= 51)."""
    from models import Source

    min_s = settings.MIN_SOURCE_QUALITY_SCORE
    out: list[int] = []
    for s in db.query(Source).filter(Source.active == True).all():
        if passes_quality_threshold(s.rating, min_s):
            out.append(s.id)
    return out


def run_scheduled_source_fetch(session_factory: Callable[[], Session]) -> None:
    """Ingest from all eligible sources (APScheduler every N hours)."""
    db = session_factory()
    try:
        ids = eligible_active_source_ids(db)
        if not ids:
            logger.info("Scheduled fetch: no active sources above quality threshold")
            return
        logger.info("Scheduled fetch: ingesting %d source(s): %s", len(ids), ids)
        ingest_sources_by_ids(db, ids)
    except Exception:
        logger.exception("Scheduled source fetch failed")
    finally:
        db.close()
