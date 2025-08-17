"""
Business Idea Data Models
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class DifficultyLevel(int, Enum):
    """Implementation difficulty levels"""
    VERY_EASY = 1
    EASY = 2
    MEDIUM = 3
    HARD = 4
    VERY_HARD = 5

class BusinessIdeaBase(BaseModel):
    """Base business idea model"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    target_market: str = Field(..., min_length=1, max_length=500)
    revenue_model: str = Field(..., min_length=1, max_length=500)
    market_size: str = Field(..., min_length=1, max_length=200)
    implementation_difficulty: DifficultyLevel
    confidence_score: float = Field(..., ge=0.0, le=100.0)
    pain_point_ids: Optional[List[str]] = Field(default_factory=list)
    ai_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict)

class BusinessIdeaCreate(BusinessIdeaBase):
    """Create business idea model"""
    
    @validator('pain_point_ids')
    def validate_pain_point_ids(cls, v):
        """Validate pain point IDs"""
        if v and len(v) > 10:
            raise ValueError("Too many linked pain points (max 10)")
        return v
    
    @validator('ai_analysis')
    def validate_ai_analysis(cls, v):
        """Validate AI analysis structure"""
        if v:
            allowed_keys = {
                'market_validation', 'competition_analysis', 'risk_assessment',
                'implementation_roadmap', 'monetization_strategies', 'success_probability'
            }
            if not all(key in allowed_keys for key in v.keys()):
                raise ValueError("Invalid AI analysis keys")
        return v

class BusinessIdeaUpdate(BaseModel):
    """Update business idea model"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    target_market: Optional[str] = Field(None, min_length=1, max_length=500)
    revenue_model: Optional[str] = Field(None, min_length=1, max_length=500)
    market_size: Optional[str] = Field(None, min_length=1, max_length=200)
    implementation_difficulty: Optional[DifficultyLevel] = None
    confidence_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    pain_point_ids: Optional[List[str]] = None
    ai_analysis: Optional[Dict[str, Any]] = None

class BusinessIdeaResponse(BusinessIdeaBase):
    """Business idea response model"""
    id: str
    generated_at: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class BusinessIdeaStats(BaseModel):
    """Business idea statistics"""
    total_count: int
    by_difficulty: Dict[int, int]
    average_confidence: float
    top_confidence_ideas: List[Dict[str, Any]]
    recent_generations: Dict[str, int]
    market_distribution: Dict[str, int]

class TelegramDigest(BaseModel):
    """Telegram digest model"""
    ideas: List[BusinessIdeaResponse]
    total_count: int
    avg_confidence: float
    generated_at: datetime
    digest_text: str

class AIAnalysisResult(BaseModel):
    """AI analysis result model"""
    market_validation: Dict[str, Any]
    competition_analysis: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    implementation_roadmap: List[Dict[str, Any]]
    monetization_strategies: List[str]
    success_probability: float
    generated_at: datetime