"""
Pain Point Data Models
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from enum import Enum

class SourceType(str, Enum):
    """Data source types"""
    REDDIT = "reddit"
    GOOGLE = "google"
    NAVER = "naver"
    LINKEDIN = "linkedin"
    TWITTER = "twitter"

class PainPointBase(BaseModel):
    """Base pain point model"""
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1, max_length=5000)
    source: SourceType
    source_url: str = Field(..., min_length=1, max_length=1000)
    sentiment_score: Optional[float] = Field(default=0.0, ge=-1.0, le=1.0)
    trend_score: Optional[float] = Field(default=0.0, ge=0.0, le=1.0)
    keywords: Optional[List[str]] = Field(default_factory=list)
    category: Optional[str] = Field(default="general", max_length=100)

class PainPointCreate(PainPointBase):
    """Create pain point model"""
    
    @validator('keywords')
    def validate_keywords(cls, v):
        """Validate keywords list"""
        if v and len(v) > 20:
            raise ValueError("Too many keywords (max 20)")
        return v
    
    @validator('source_url')
    def validate_url(cls, v):
        """Basic URL validation"""
        if not v.startswith(('http://', 'https://')):
            raise ValueError("Invalid URL format")
        return v

class PainPointUpdate(BaseModel):
    """Update pain point model"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0)
    trend_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    keywords: Optional[List[str]] = None
    category: Optional[str] = Field(None, max_length=100)
    processed_at: Optional[datetime] = None

class PainPointResponse(PainPointBase):
    """Pain point response model"""
    id: str
    collected_at: datetime
    processed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PainPointStats(BaseModel):
    """Pain point statistics model"""
    total_count: int
    by_source: dict
    by_category: dict
    average_sentiment: float
    average_trend_score: float
    top_keywords: List[dict]
    recent_activity: dict

class TrendingKeyword(BaseModel):
    """Trending keyword model"""
    keyword: str
    frequency: int
    trend_change: float
    related_pain_points: int