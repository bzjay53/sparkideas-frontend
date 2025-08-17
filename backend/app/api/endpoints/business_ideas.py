"""
Business Ideas API Endpoints
AI-generated business ideas management
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from typing import List, Optional
import structlog

from app.models.business_idea import (
    BusinessIdeaCreate, BusinessIdeaResponse, BusinessIdeaUpdate,
    BusinessIdeaStats, TelegramDigest, DifficultyLevel
)
from app.services.ai_analyzer import AIAnalyzerService
from app.services.database import DatabaseService
from app.services.telegram_service import TelegramService

logger = structlog.get_logger()
router = APIRouter()

@router.get("/", response_model=List[BusinessIdeaResponse])
async def get_business_ideas(
    limit: int = Query(20, ge=1, le=100),
    difficulty: Optional[DifficultyLevel] = None,
    min_confidence: Optional[float] = Query(None, ge=0.0, le=100.0),
    for_telegram: bool = False
):
    """Get business ideas with filtering options"""
    try:
        if for_telegram:
            ideas = await DatabaseService.get_telegram_worthy_ideas(5)
        elif difficulty:
            ideas = await DatabaseService.get_ideas_by_difficulty(difficulty, limit)
        elif min_confidence:
            ideas = await DatabaseService.get_ideas_by_confidence(min_confidence, limit)
        else:
            ideas = await DatabaseService.get_business_ideas(limit)
        
        return ideas
    except Exception as e:
        logger.error("Failed to fetch business ideas", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch business ideas")

@router.post("/", response_model=BusinessIdeaResponse)
async def create_business_idea(idea: BusinessIdeaCreate):
    """Create a new business idea"""
    try:
        result = await DatabaseService.create_business_idea(idea.dict())
        return result
    except Exception as e:
        logger.error("Failed to create business idea", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to create business idea")

@router.get("/{idea_id}", response_model=BusinessIdeaResponse)
async def get_business_idea(idea_id: str):
    """Get specific business idea by ID"""
    try:
        idea = await DatabaseService.get_business_idea_by_id(idea_id)
        if not idea:
            raise HTTPException(status_code=404, detail="Business idea not found")
        return idea
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to fetch business idea", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch business idea")

@router.put("/{idea_id}", response_model=BusinessIdeaResponse)
async def update_business_idea(idea_id: str, update_data: BusinessIdeaUpdate):
    """Update business idea"""
    try:
        result = await DatabaseService.update_business_idea(
            idea_id, 
            update_data.dict(exclude_unset=True)
        )
        if not result:
            raise HTTPException(status_code=404, detail="Business idea not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update business idea", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to update business idea")

@router.post("/generate")
async def generate_ideas(
    background_tasks: BackgroundTasks,
    batch_size: int = Query(5, ge=1, le=20),
    min_confidence: float = Query(75.0, ge=0.0, le=100.0)
):
    """Generate new business ideas from recent pain points"""
    try:
        background_tasks.add_task(
            AIAnalyzerService.generate_business_ideas_batch,
            batch_size,
            min_confidence
        )
        
        return {
            "message": "Business idea generation started",
            "batch_size": batch_size,
            "min_confidence_threshold": min_confidence
        }
    except Exception as e:
        logger.error("Failed to trigger idea generation", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to trigger idea generation")

@router.post("/{idea_id}/analyze")
async def enhance_idea_analysis(
    idea_id: str,
    background_tasks: BackgroundTasks
):
    """Enhance AI analysis for specific business idea"""
    try:
        # Check if idea exists
        idea = await DatabaseService.get_business_idea_by_id(idea_id)
        if not idea:
            raise HTTPException(status_code=404, detail="Business idea not found")
        
        background_tasks.add_task(
            AIAnalyzerService.enhance_business_idea_analysis,
            idea_id
        )
        
        return {
            "message": "Enhanced analysis started",
            "idea_id": idea_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to trigger enhanced analysis", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to trigger enhanced analysis")

@router.get("/stats/overview", response_model=BusinessIdeaStats)
async def get_business_idea_stats():
    """Get comprehensive business idea statistics"""
    try:
        stats = await DatabaseService.get_business_idea_stats()
        return stats
    except Exception as e:
        logger.error("Failed to fetch business idea stats", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch business idea stats")

@router.get("/telegram/digest", response_model=TelegramDigest)
async def get_telegram_digest():
    """Get daily telegram digest of top business ideas"""
    try:
        digest = await TelegramService.prepare_daily_digest()
        return digest
    except Exception as e:
        logger.error("Failed to prepare telegram digest", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to prepare telegram digest")

@router.post("/telegram/send-digest")
async def send_telegram_digest(background_tasks: BackgroundTasks):
    """Send telegram digest immediately"""
    try:
        background_tasks.add_task(TelegramService.send_daily_digest)
        
        return {
            "message": "Telegram digest sending started",
            "estimated_delivery": "within 30 seconds"
        }
    except Exception as e:
        logger.error("Failed to trigger telegram digest", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to trigger telegram digest")

@router.get("/top/confidence")
async def get_top_confidence_ideas(limit: int = Query(10, ge=1, le=50)):
    """Get top business ideas by confidence score"""
    try:
        ideas = await DatabaseService.get_top_confidence_ideas(limit)
        return {
            "ideas": ideas,
            "count": len(ideas),
            "average_confidence": sum(idea["confidence_score"] for idea in ideas) / len(ideas) if ideas else 0
        }
    except Exception as e:
        logger.error("Failed to fetch top confidence ideas", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch top confidence ideas")

@router.delete("/{idea_id}")
async def delete_business_idea(idea_id: str):
    """Delete business idea"""
    try:
        success = await DatabaseService.delete_business_idea(idea_id)
        if not success:
            raise HTTPException(status_code=404, detail="Business idea not found")
        return {"message": "Business idea deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete business idea", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to delete business idea")