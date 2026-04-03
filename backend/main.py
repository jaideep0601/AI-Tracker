"""
ThinkStream FastAPI Backend
Centralized AI Developments Tracker
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from models import Base, Source, Article, UserFeedback
from schemas import (
    SourceResponse, ArticleResponse, FeedbackRequest, 
    FeedResponse, CategoryResponse
)
from config import settings
from routers.auth import router as auth_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
engine = create_engine(str(settings.DATABASE_URL), echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)


def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("ThinkStream API starting up...")
    logger.info(f"Database: {settings.DATABASE_URL}")
    logger.info(f"Redis: {settings.REDIS_URL}")
    yield
    logger.info("ThinkStream API shutting down...")


# Create FastAPI app
app = FastAPI(
    title="ThinkStream API",
    description="Centralized AI Developments Aggregation Platform",
    version="1.0.0",
    lifespan=lifespan,
)
app.include_router(auth_router)
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development: allow all, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# HEALTH CHECKS
# ============================================================================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
    }


@app.get("/api/health/db")
async def health_check_db(db: Session = Depends(get_db)):
    """Database health check"""
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(status_code=503, detail="Database connection failed")


# ============================================================================
# FEED ENDPOINTS
# ============================================================================

@app.get("/api/feed", response_model=FeedResponse)
async def get_feed(
    category: Optional[str] = Query(None),
    source_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=10, le=100),
    db: Session = Depends(get_db),
):
    """
    Get article feed with optional filters
    
    - **category**: Filter by category (research, development, people, companies, social, models, events)
    - **source_id**: Filter by specific source
    - **page**: Pagination page (1-indexed)
    - **limit**: Items per page (10-100)
    """
    try:
        query = db.query(Article).order_by(Article.published_at.desc())
        
        # Apply filters
        if category:
            query = query.filter(Article.category == category)
        if source_id:
            query = query.filter(Article.source_id == source_id)
        
        # Count total
        total_count = query.count()
        
        # Pagination
        skip = (page - 1) * limit
        articles = query.offset(skip).limit(limit).all()
        
        return FeedResponse(
            data=[ArticleResponse.from_orm(a) for a in articles],
            pagination={
                "page": page,
                "limit": limit,
                "total_count": total_count,
                "total_pages": (total_count + limit - 1) // limit,
            }
        )
    except Exception as e:
        logger.error(f"Error fetching feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch feed")


@app.get("/api/feed/{article_id}", response_model=ArticleResponse)
async def get_article_detail(
    article_id: int,
    db: Session = Depends(get_db),
):
    """Get single article details"""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleResponse.from_orm(article)


@app.get("/api/feed/search")
async def search_articles(
    q: str = Query(..., min_length=3),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=10, le=100),
    db: Session = Depends(get_db),
):
    """Full-text search articles"""
    try:
        # Simple substring search (production: use PostgreSQL full-text search)
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
        }
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed")


# ============================================================================
# SOURCES ENDPOINTS
# ============================================================================

@app.get("/api/sources", response_model=List[SourceResponse])
async def list_sources(
    type: Optional[str] = Query(None),
    rating_min: Optional[int] = Query(None, ge=1, le=5),
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
):
    """Get all sources with optional filters"""
    query = db.query(Source)
    
    if active_only:
        query = query.filter(Source.active == True)
    if type:
        query = query.filter(Source.type == type)
    if rating_min:
        query = query.filter(Source.rating >= rating_min)
    
    sources = query.all()
    return [SourceResponse.from_orm(s) for s in sources]


@app.post("/api/sources", response_model=SourceResponse, status_code=201)
async def create_source(
    source_data: dict,
    db: Session = Depends(get_db),
):
    """Create new source (admin only)"""
    try:
        source = Source(**source_data)
        db.add(source)
        db.commit()
        db.refresh(source)
        return SourceResponse.from_orm(source)
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating source: {e}")
        raise HTTPException(status_code=400, detail="Failed to create source")


@app.get("/api/sources/{source_id}", response_model=SourceResponse)
async def get_source(source_id: int, db: Session = Depends(get_db)):
    """Get source details"""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return SourceResponse.from_orm(source)


@app.patch("/api/sources/{source_id}", response_model=SourceResponse)
async def update_source(
    source_id: int,
    update_data: dict,
    db: Session = Depends(get_db),
):
    """Update source rating or active status"""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    for key, value in update_data.items():
        if hasattr(source, key):
            setattr(source, key, value)
    
    db.commit()
    db.refresh(source)
    return SourceResponse.from_orm(source)


@app.delete("/api/sources/{source_id}", status_code=204)
async def delete_source(source_id: int, db: Session = Depends(get_db)):
    """Delete source"""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    db.delete(source)
    db.commit()


# ============================================================================
# FEEDBACK ENDPOINTS
# ============================================================================

@app.put("/api/feedback/{article_id}")
async def submit_feedback(
    article_id: int,
    feedback_data: FeedbackRequest,
    db: Session = Depends(get_db),
):
    """Submit thumbs up/down feedback"""
    # Verify article exists
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    try:
        # Check if feedback exists
        existing = db.query(UserFeedback).filter(
            UserFeedback.article_id == article_id
        ).first()
        
        if existing:
            existing.feedback = feedback_data.feedback
            existing.feedback_reason = feedback_data.reason
        else:
            feedback = UserFeedback(
                article_id=article_id,
                feedback=feedback_data.feedback,
                feedback_reason=feedback_data.reason,
            )
            db.add(feedback)
        
        db.commit()
        return {"article_id": article_id, "feedback": feedback_data.feedback, "recorded_at": datetime.now()}
    except Exception as e:
        db.rollback()
        logger.error(f"Error recording feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to record feedback")


@app.get("/api/feedback/history")
async def get_feedback_history(
    feedback_type: Optional[int] = Query(None, regex="^(-1|1)$"),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db),
):
    """Get user's feedback history"""
    query = db.query(UserFeedback).order_by(UserFeedback.created_at.desc())
    
    if feedback_type:
        query = query.filter(UserFeedback.feedback == feedback_type)
    
    feedbacks = query.limit(limit).all()
    return {
        "data": [
            {
                "article_id": f.article_id,
                "feedback": f.feedback,
                "reason": f.feedback_reason,
                "created_at": f.created_at,
            }
            for f in feedbacks
        ]
    }


# ============================================================================
# CATEGORIES ENDPOINTS
# ============================================================================

@app.get("/api/categories")
async def list_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    categories = [
        "research",
        "development",
        "people",
        "companies",
        "social",
        "models",
        "events",
    ]
    
    result = []
    for cat in categories:
        count = db.query(Article).filter(Article.category == cat).count()
        result.append({
            "id": cat,
            "name": cat.replace("_", " ").title(),
            "count": count,
        })
    
    return {"data": result}


@app.get("/api/categories/{category_id}")
async def get_category_articles(
    category_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=10, le=100),
    db: Session = Depends(get_db),
):
    """Get articles in category"""
    query = db.query(Article).filter(Article.category == category_id).order_by(Article.published_at.desc())
    
    total_count = query.count()
    skip = (page - 1) * limit
    articles = query.offset(skip).limit(limit).all()
    
    return {
        "data": [ArticleResponse.from_orm(a) for a in articles],
        "category": category_id,
        "pagination": {
            "page": page,
            "limit": limit,
            "total_count": total_count,
        }
    }


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@app.get("/api/analytics/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get feed statistics"""
    total_articles = db.query(Article).count()
    total_sources = db.query(Source).count()
    
    # Category breakdown
    categories = {}
    for cat in ["research", "development", "people", "companies", "social", "models", "events"]:
        categories[cat] = db.query(Article).filter(Article.category == cat).count()
    
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
    """Get most engaged sources"""
    sources = db.query(Source).all()
    
    result = []
    for source in sources[:limit]:
        thumbs_up = db.query(UserFeedback).filter(
            UserFeedback.article_id.in_(
                db.query(Article.id).filter(Article.source_id == source.id)
            ),
            UserFeedback.feedback == 1,
        ).count()
        
        thumbs_down = db.query(UserFeedback).filter(
            UserFeedback.article_id.in_(
                db.query(Article.id).filter(Article.source_id == source.id)
            ),
            UserFeedback.feedback == -1,
        ).count()
        
        engagement_ratio = (thumbs_up / (thumbs_up + thumbs_down)) if (thumbs_up + thumbs_down) > 0 else 0
        
        result.append({
            "source_id": source.id,
            "source_name": source.name,
            "thumbs_up_count": thumbs_up,
            "thumbs_down_count": thumbs_down,
            "engagement_ratio": round(engagement_ratio, 2),
        })
    
    return {"data": sorted(result, key=lambda x: x["engagement_ratio"], reverse=True)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
