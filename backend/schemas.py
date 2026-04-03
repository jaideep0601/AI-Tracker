"""
Pydantic schemas for API request/response validation
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class SourceResponse(BaseModel):
    id: int
    name: str
    type: str
    url: str
    description: Optional[str] = None
    rating: int
    active: bool
    last_fetched_at: Optional[datetime] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ArticleResponse(BaseModel):
    id: int
    title: str
    content: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None
    author: Optional[str] = None
    published_at: Optional[datetime] = None
    fetched_at: datetime
    language: str = "en"
    # Avoid reading SQLAlchemy's class-level `metadata` attribute during ORM serialization.
    article_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        serialization_alias="metadata",
        validation_alias=AliasChoices("article_metadata", "metadata"),
    )
    source: Optional[SourceResponse] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PaginationResponse(BaseModel):
    page: int
    limit: int
    total_count: int
    total_pages: int


class FeedResponse(BaseModel):
    data: List[ArticleResponse]
    pagination: PaginationResponse


class FeedbackRequest(BaseModel):
    feedback: int = Field(..., ge=-1, le=1)  # -1, 0, or 1
    reason: Optional[str] = Field(None, pattern="^(relevant|duplicate|spam|not_interested|saved_for_later)$")


class CategoryResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    count: int


class PreferenceResponse(BaseModel):
    id: int
    preference_key: str
    preference_type: str
    preference_value: str
    weight: float
    created_at: datetime
