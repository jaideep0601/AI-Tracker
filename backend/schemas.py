"""
Pydantic schemas for API request/response validation
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import AliasChoices, BaseModel, ConfigDict, Field, computed_field

from quality import source_quality_score


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

    @computed_field
    @property
    def quality_score(self) -> int:
        return source_quality_score(self.rating)

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
    # serialization_alias only: alias="metadata" would read ORM .metadata (SQLAlchemy MetaData)
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


class FetchSourcesRequest(BaseModel):
    source_ids: List[int] = Field(..., min_length=1)


class FetchSourceResult(BaseModel):
    source_id: int
    name: str
    ok: bool
    inserted: int = 0
    skipped: int = 0
    error: Optional[str] = None


class FetchSourcesResponse(BaseModel):
    results: List[FetchSourceResult]
    total_inserted: int
