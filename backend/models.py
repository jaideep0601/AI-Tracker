"""
SQLAlchemy models for ThinkStream
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Source(Base):
    __tablename__ = "sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    type = Column(String(50), nullable=False, index=True)  # linkedin, twitter, github, arxiv, rss, reddit, blog
    url = Column(String(2048), nullable=False)
    description = Column(Text)
    rating = Column(Integer, default=3, index=True)  # 1-5 stars
    active = Column(Boolean, default=True, index=True)
    last_fetched_at = Column(DateTime, nullable=True)
    fetch_error_count = Column(Integer, default=0)
    environment_metadata = Column(JSONB, default={})
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    articles = relationship("Article", back_populates="source", cascade="all, delete-orphan")


class Article(Base):
    __tablename__ = "articles"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False)
    external_id = Column(String(255))
    title = Column(String(1024), nullable=False)
    content = Column(Text)
    url = Column(String(2048), index=True)
    url_hash = Column(String(64), index=True)  # SHA256 for dedup
    category = Column(String(100), index=True)  # research, development, people, companies, social, models, events
    author = Column(String(255))
    published_at = Column(DateTime, index=True)
    fetched_at = Column(DateTime, default=datetime.utcnow, index=True)
    language = Column(String(10), default="en")
    article_metadata = Column(JSONB, default={})  # views, likes, etc
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    source = relationship("Source", back_populates="articles")
    feedbacks = relationship("UserFeedback", back_populates="article", cascade="all, delete-orphan")


class UserFeedback(Base):
    __tablename__ = "user_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, unique=True)
    feedback = Column(Integer, nullable=False)  # 1=thumbs_up, -1=thumbs_down, 0=neutral
    feedback_reason = Column(String(255))  # relevant, duplicate, spam, not_interested
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    article = relationship("Article", back_populates="feedbacks")


class Bookmark(Base):
    """Saved article (single-user MVP)."""

    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, unique=True)
    created_at = Column(DateTime, server_default=func.now(), index=True)


class SourceRating(Base):
    __tablename__ = "source_ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id", ondelete="CASCADE"), unique=True)
    rating = Column(Integer, nullable=False)  # 1-5
    rating_justification = Column(Text)
    quality_metrics = Column(JSONB, default={})
    last_reviewed_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class UserPreferences(Base):
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    preference_key = Column(String(255), unique=True, nullable=False)
    preference_type = Column(String(50))  # category, source, author, topic
    preference_value = Column(String(255))
    weight = Column(Integer, default=1)  # 0.0-5.0 multiplier
    preference_reason = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
