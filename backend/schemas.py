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
    fetch_error_count: int = 0
    last_fetched_at: Optional[datetime] = None
    created_at: datetime

    @computed_field
    @property
    def quality_score(self) -> int:
        """0-100 quality score derived from the 1-5 star rating."""
        return source_quality_score(self.rating)

    model_config = ConfigDict(from_attributes=True)


class CreateSourceRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., description="Source type: arxiv, github, reddit, rss, blog, news, company, research, social")
    url: str = Field(..., min_length=1, max_length=2048)
    description: Optional[str] = Field(None, max_length=500)
    rating: int = Field(default=3, ge=1, le=5)


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
    reason: Optional[str] = Field(
        None,
        pattern="^(relevant|duplicate|spam|not_interested|saved_for_later)$",
    )


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
