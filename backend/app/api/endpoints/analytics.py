"""
Analytics API Endpoints
Statistics and insights dashboard
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
import structlog

from app.services.database import DatabaseService

logger = structlog.get_logger()
router = APIRouter()

@router.get("/overview")
async def get_analytics_overview() -> Dict[str, Any]:
    """Get comprehensive analytics overview"""
    try:
        # Get various statistics
        pain_point_stats = await DatabaseService.get_pain_point_stats_by_source()
        business_idea_stats = await DatabaseService.get_business_idea_stats()
        telegram_stats = await DatabaseService.get_telegram_delivery_stats()
        
        return {
            "pain_points": pain_point_stats,
            "business_ideas": business_idea_stats,
            "telegram": telegram_stats,
            "generated_at": "2025-08-16T00:00:00Z"
        }
    except Exception as e:
        logger.error("Failed to fetch analytics overview", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch analytics overview")

@router.get("/trending-keywords")
async def get_trending_keywords(
    days: int = Query(7, ge=1, le=30),
    limit: int = Query(20, ge=1, le=100)
) -> Dict[str, Any]:
    """Get trending keywords from pain points"""
    try:
        keywords = await DatabaseService.get_trending_keywords(days, limit)
        return {
            "keywords": keywords,
            "period_days": days,
            "total_keywords": len(keywords)
        }
    except Exception as e:
        logger.error("Failed to fetch trending keywords", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch trending keywords")

@router.get("/performance")
async def get_performance_metrics() -> Dict[str, Any]:
    """Get system performance metrics"""
    try:
        # This would integrate with actual monitoring in production
        return {
            "api_health": "healthy",
            "database_status": "connected",
            "ai_service_status": "operational",
            "telegram_bot_status": "active",
            "last_data_collection": "2025-08-16T08:00:00Z",
            "last_idea_generation": "2025-08-16T08:30:00Z",
            "last_telegram_digest": "2025-08-16T09:00:00Z"
        }
    except Exception as e:
        logger.error("Failed to fetch performance metrics", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch performance metrics")