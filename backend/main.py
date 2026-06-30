"""
ThinkStream FastAPI Backend
Centralized AI Developments Tracker
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Optional, List

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, func, case, text
from sqlalchemy.orm import Session, sessionmaker

from jobs import run_scheduled_source_fetch
from models import Base, Source, Article, UserFeedback
from schemas import (
    SourceResponse, ArticleResponse, FeedbackRequest,
    FeedResponse, PaginationResponse, CategoryResponse,
    CreateSourceRequest,
)
from config import settings
from routers.auth import router as auth_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler(timezone="UTC")

engine = create_engine(str(settings.DATABASE_URL), echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("ThinkStream API starting up...")
    if settings.ENABLE_SCHEDULER:
        scheduler.add_job(
            run_scheduled_source_fetch,
            "date",
            args=[SessionLocal],
            id="startup_source_fetch",
            replace_existing=True,
        )
        scheduler.add_job(
            run_scheduled_source_fetch,
            "interval",
            hours=settings.FETCH_INTERVAL_HOURS,
            args=[SessionLocal],
            id="scheduled_source_fetch",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )
        scheduler.start()
        logger.info("Scheduler enabled; fetching every %sh", settings.FETCH_INTERVAL_HOURS)
    yield
    if scheduler.running:
        scheduler.shutdown(wait=False)
    logger.info("ThinkStream API shutting down...")


app = FastAPI(
    title="ThinkStream API",
    description="Centralized AI Developments Aggregation Platform",
    version="1.0.0",
    lifespan=lifespan,
)
app.include_router(auth_router)

# CORS: allow_credentials requires explicit origins, not "*".
# Since auth uses localStorage (not cookies), credentials mode is not needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# HEALTH CHECKS
# ============================================================================

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat(), "version": "1.0.0"}


@app.get("/api/health/db")
async def health_check_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error("Database health check failed: %s", e)
        raise HTTPException(status_code=503, detail="Database connection failed")


# ============================================================================
# FEED ENDPOINTS
# ============================================================================

@app.get("/api/feed", response_model=FeedResponse)
async def get_feed(
    category: Optional[str] = Query(None),
    source_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=10, le=100),
    db: Session = Depends(get_db),
):
    """Get article feed ordered by published date."""
    try:
        query = db.query(Article).order_by(Article.published_at.desc())
        if category:
            query = query.filter(Article.category == category)
        if source_id:
            query = query.filter(Article.source_id == source_id)

        total_count = query.count()
        skip = (page - 1) * limit
        articles = query.offset(skip).limit(limit).all()

        return FeedResponse(
            data=[ArticleResponse.from_orm(a) for a in articles],
            pagination=PaginationResponse(
                page=page, limit=limit,
                total_count=total_count,
                total_pages=max(1, (total_count + limit - 1) // limit),
            ),
        )
    except Exception as e:
        logger.error("Error fetching feed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to fetch feed")


@app.get("/api/feed/personalized", response_model=FeedResponse)
async def get_personalized_feed(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=10, le=100),
    db: Session = Depends(get_db),
):
    """Get personalized feed ranked by source quality, user feedback, recency, and category affinity."""
    from ranking import rank_articles
    try:
        cutoff = datetime.utcnow() - timedelta(days=60)
        query = db.query(Article).filter(Article.published_at >= cutoff)
        if category:
            query = query.filter(Article.category == category)

        articles = query.all()
        total_count = len(articles)
        ranked = rank_articles(db, articles)

        skip = (page - 1) * limit
        page_articles = [a for a, _ in ranked[skip: skip + limit]]

        return FeedResponse(
            data=[ArticleResponse.from_orm(a) for a in page_articles],
            pagination=PaginationResponse(
                page=page, limit=limit,
                total_count=total_count,
                total_pages=max(1, (total_count + limit - 1) // limit),
            ),
        )
    except Exception as e:
        logger.error("Error fetching personalized feed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to fetch personalized feed")


# NOTE: /api/feed/search must be declared before /api/feed/{article_id}
# so FastAPI routes the literal path correctly.
@app.get("/api/feed/search")
async def search_articles(
    q: str = Query(..., min_length=2),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=10, le=100),
    db: Session = Depends(get_db),
):
    """Full-text search across article titles and content."""
    try:
        query = db.query(Article).filter(
            Article.title.ilike(f"%{q}%") | Article.content.ilike(f"%{q}%")
        ).order_by(Article.published_at.desc())

        total_count = query.count()
        skip = (page - 1) * limit
        articles = query.offset(skip).limit(limit).all()

        return {
            "data": [ArticleResponse.from_orm(a) for a in articles],
            "query": q,
            "total_hits": total_count,
            "page": page,
            "total_pages": max(1, (total_count + limit - 1) // limit),
        }
    except Exception as e:
        logger.error("Search error: %s", e)
        raise HTTPException(status_code=500, detail="Search failed")


@app.get("/api/feed/{article_id}", response_model=ArticleResponse)
async def get_article_detail(article_id: int, db: Session = Depends(get_db)):
    """Get single article details."""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleResponse.from_orm(article)


# ============================================================================
# SOURCES ENDPOINTS
# ============================================================================

@app.get("/api/sources", response_model=List[SourceResponse])
async def list_sources(
    type: Optional[str] = Query(None),
    rating_min: Optional[int] = Query(None, ge=1, le=5),
    active_only: bool = Query(False),
    db: Session = Depends(get_db),
):
    """Get all sources with optional filters."""
    query = db.query(Source)
    if active_only:
        query = query.filter(Source.active == True)
    if type:
        query = query.filter(Source.type == type)
    if rating_min:
        query = query.filter(Source.rating >= rating_min)
    return [SourceResponse.from_orm(s) for s in query.all()]


@app.post("/api/sources", response_model=SourceResponse, status_code=201)
async def create_source(source_data: CreateSourceRequest, db: Session = Depends(get_db)):
    """Create a new source."""
    try:
        source = Source(**source_data.model_dump())
        db.add(source)
        db.commit()
        db.refresh(source)
        return SourceResponse.from_orm(source)
    except Exception as e:
        db.rollback()
        logger.error("Error creating source: %s", e)
        raise HTTPException(status_code=400, detail=f"Failed to create source: {e}")


@app.get("/api/sources/{source_id}", response_model=SourceResponse)
async def get_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return SourceResponse.from_orm(source)


@app.patch("/api/sources/{source_id}", response_model=SourceResponse)
async def update_source(source_id: int, update_data: dict, db: Session = Depends(get_db)):
    """Update source rating or active status."""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    allowed = {"rating", "active", "description"}
    for key, value in update_data.items():
        if key in allowed and hasattr(source, key):
            setattr(source, key, value)
    db.commit()
    db.refresh(source)
    return SourceResponse.from_orm(source)


@app.delete("/api/sources/{source_id}", status_code=204)
async def delete_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    db.delete(source)
    db.commit()


@app.post("/api/sources/{source_id}/fetch")
async def trigger_source_fetch(source_id: int, db: Session = Depends(get_db)):
    """Manually trigger ingestion for a single source."""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    from ingestion import ingest_source
    result = ingest_source(db, source)
    return result


@app.post("/api/sources/fetch-all")
async def trigger_all_sources_fetch(db: Session = Depends(get_db)):
    """Manually trigger ingestion for all eligible active sources."""
    from jobs import eligible_active_source_ids
    from ingestion import ingest_sources_by_ids
    ids = eligible_active_source_ids(db)
    if not ids:
        return {"message": "No eligible sources found", "results": []}
    results = ingest_sources_by_ids(db, ids)
    total_inserted = sum(r.get("inserted", 0) for r in results)
    return {"message": f"Fetched {len(ids)} source(s), {total_inserted} new articles", "results": results}


# ============================================================================
# FEEDBACK ENDPOINTS
# ============================================================================

@app.put("/api/feedback/{article_id}")
async def submit_feedback(
    article_id: int,
    feedback_data: FeedbackRequest,
    db: Session = Depends(get_db),
):
    """Submit thumbs up/down feedback for an article."""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    try:
        existing = db.query(UserFeedback).filter(UserFeedback.article_id == article_id).first()
        if existing:
            existing.feedback = feedback_data.feedback
            existing.feedback_reason = feedback_data.reason
        else:
            db.add(UserFeedback(
                article_id=article_id,
                feedback=feedback_data.feedback,
                feedback_reason=feedback_data.reason,
            ))
        db.commit()
        return {"article_id": article_id, "feedback": feedback_data.feedback, "recorded_at": datetime.now()}
    except Exception as e:
        db.rollback()
        logger.error("Error recording feedback: %s", e)
        raise HTTPException(status_code=500, detail="Failed to record feedback")


@app.get("/api/feedback/history")
async def get_feedback_history(
    limit: int = Query(500, le=1000),
    db: Session = Depends(get_db),
):
    """Get all recorded feedback (article_id → value map)."""
    feedbacks = db.query(UserFeedback).order_by(UserFeedback.created_at.desc()).limit(limit).all()
    return {
        "data": [
            {"article_id": f.article_id, "feedback": f.feedback, "reason": f.feedback_reason}
            for f in feedbacks
        ]
    }


# ============================================================================
# CATEGORIES ENDPOINTS
# ============================================================================

CATEGORY_LIST = ["research", "development", "people", "companies", "social", "models", "events"]


@app.get("/api/categories")
async def list_categories(db: Session = Depends(get_db)):
    result = []
    for cat in CATEGORY_LIST:
        count = db.query(Article).filter(Article.category == cat).count()
        result.append({"id": cat, "name": cat.replace("_", " ").title(), "count": count})
    return {"data": result}


@app.get("/api/categories/{category_id}")
async def get_category_articles(
    category_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=10, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Article).filter(Article.category == category_id).order_by(Article.published_at.desc())
    total_count = query.count()
    skip = (page - 1) * limit
    articles = query.offset(skip).limit(limit).all()
    return {
        "data": [ArticleResponse.from_orm(a) for a in articles],
        "category": category_id,
        "pagination": {"page": page, "limit": limit, "total_count": total_count},
    }


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@app.get("/api/analytics/stats")
async def get_stats(db: Session = Depends(get_db)):
    total_articles = db.query(Article).count()
    total_sources = db.query(Source).count()
    categories = {cat: db.query(Article).filter(Article.category == cat).count() for cat in CATEGORY_LIST}
    return {
        "total_articles": total_articles,
        "total_sources": total_sources,
        "categories": categories,
        "last_updated": datetime.now().isoformat(),
    }


@app.get("/api/analytics/top-sources")
async def get_top_sources(
    limit: int = Query(10, le=50),
    db: Session = Depends(get_db),
):
    """Get most-engaged sources — fixed N+1 with a single aggregated query."""
    rows = (
        db.query(
            Source.id,
            Source.name,
            Source.type,
            Source.rating,
            func.sum(case((UserFeedback.feedback == 1, 1), else_=0)).label("thumbs_up"),
            func.sum(case((UserFeedback.feedback == -1, 1), else_=0)).label("thumbs_down"),
        )
        .outerjoin(Article, Article.source_id == Source.id)
        .outerjoin(UserFeedback, UserFeedback.article_id == Article.id)
        .group_by(Source.id, Source.name, Source.type, Source.rating)
        .all()
    )

    result = []
    for row in rows:
        up = row.thumbs_up or 0
        down = row.thumbs_down or 0
        total = up + down
        ratio = up / total if total > 0 else 0.0
        result.append({
            "source_id": row.id,
            "source_name": row.name,
            "source_type": row.type,
            "rating": row.rating,
            "thumbs_up_count": up,
            "thumbs_down_count": down,
            "engagement_ratio": round(ratio, 2),
        })

    result.sort(key=lambda x: x["engagement_ratio"], reverse=True)
    return {"data": result[:limit]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
