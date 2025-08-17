"""
Pain Points API Endpoints
Real-time data collection and management
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import List, Optional
import structlog

from app.models.pain_point import PainPointCreate, PainPointResponse, PainPointUpdate
from app.services.data_collector import DataCollectorService
from app.services.ai_analyzer import AIAnalyzerService
from app.services.database import DatabaseService

logger = structlog.get_logger()
router = APIRouter()

@router.get("/", response_model=List[PainPointResponse])
async def get_pain_points(
    source: Optional[str] = None,
    limit: int = 20,
    trending: bool = False
):
    """Get pain points with optional filtering"""
    try:
        if trending:
            pain_points = await DatabaseService.get_trending_pain_points(limit)
        elif source:
            pain_points = await DatabaseService.get_pain_points_by_source(source, limit)
        else:
            pain_points = await DatabaseService.get_pain_points(limit)
        
        return pain_points
    except Exception as e:
        logger.error("Failed to fetch pain points", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch pain points")

@router.post("/", response_model=PainPointResponse)
async def create_pain_point(pain_point: PainPointCreate):
    """Create a new pain point"""
    try:
        result = await DatabaseService.create_pain_point(pain_point.dict())
        return result
    except Exception as e:
        logger.error("Failed to create pain point", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to create pain point")

@router.get("/{pain_point_id}", response_model=PainPointResponse)
async def get_pain_point(pain_point_id: str):
    """Get specific pain point by ID"""
    try:
        pain_point = await DatabaseService.get_pain_point_by_id(pain_point_id)
        if not pain_point:
            raise HTTPException(status_code=404, detail="Pain point not found")
        return pain_point
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to fetch pain point", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch pain point")

@router.put("/{pain_point_id}", response_model=PainPointResponse)
async def update_pain_point(pain_point_id: str, update_data: PainPointUpdate):
    """Update pain point"""
    try:
        result = await DatabaseService.update_pain_point(
            pain_point_id, 
            update_data.dict(exclude_unset=True)
        )
        if not result:
            raise HTTPException(status_code=404, detail="Pain point not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update pain point", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to update pain point")

@router.post("/collect")
async def trigger_collection(
    background_tasks: BackgroundTasks,
    source: Optional[str] = None,
    limit: int = 50
):
    """Trigger manual data collection"""
    try:
        if source:
            sources = [source]
        else:
            sources = ["reddit", "google", "naver", "linkedin", "twitter"]
        
        for src in sources:
            background_tasks.add_task(
                DataCollectorService.collect_from_source, 
                src, 
                limit
            )
        
        return {
            "message": "Data collection started",
            "sources": sources,
            "limit_per_source": limit
        }
    except Exception as e:
        logger.error("Failed to trigger collection", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to trigger collection")

@router.post("/analyze")
async def trigger_analysis(
    background_tasks: BackgroundTasks,
    batch_size: int = 10
):
    """Trigger AI analysis for unprocessed pain points"""
    try:
        background_tasks.add_task(
            AIAnalyzerService.analyze_unprocessed_pain_points,
            batch_size
        )
        
        return {
            "message": "AI analysis started",
            "batch_size": batch_size
        }
    except Exception as e:
        logger.error("Failed to trigger analysis", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to trigger analysis")

@router.get("/sources/stats")
async def get_source_stats():
    """Get collection statistics by source"""
    try:
        stats = await DatabaseService.get_pain_point_stats_by_source()
        return stats
    except Exception as e:
        logger.error("Failed to fetch source stats", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch source stats")

@router.get("/trending/keywords")
async def get_trending_keywords(days: int = 7, limit: int = 20):
    """Get trending keywords from pain points"""
    try:
        keywords = await DatabaseService.get_trending_keywords(days, limit)
        return {"keywords": keywords, "period_days": days}
    except Exception as e:
        logger.error("Failed to fetch trending keywords", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch trending keywords")

@router.delete("/{pain_point_id}")
async def delete_pain_point(pain_point_id: str):
    """Delete pain point"""
    try:
        success = await DatabaseService.delete_pain_point(pain_point_id)
        if not success:
            raise HTTPException(status_code=404, detail="Pain point not found")
        return {"message": "Pain point deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete pain point", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to delete pain point")