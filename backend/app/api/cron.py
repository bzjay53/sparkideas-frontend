"""
Cron API Endpoints for Vercel
Serverless cron jobs triggered by Vercel's cron functionality
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import structlog

from app.services.pipeline_manager import get_pipeline_manager, PipelineMetrics
from app.services.database import DatabaseService
from app.config.settings import settings

logger = structlog.get_logger()
router = APIRouter()

# Simple authentication for cron endpoints
async def verify_cron_secret(cron_secret: str = None):
    """Verify cron secret for security"""
    if not cron_secret or cron_secret != settings.cron_secret:
        raise HTTPException(status_code=401, detail="Invalid cron secret")
    return True

@router.post("/hourly-collection")
async def hourly_collection(
    background_tasks: BackgroundTasks,
    authenticated: bool = Depends(verify_cron_secret)
):
    """
    Hourly light data collection
    Triggered by Vercel cron: 0 * * * * (every hour)
    """
    try:
        pipeline_manager = get_pipeline_manager()
        
        logger.info("Starting hourly collection cron job")
        
        # Run lightweight collection in background
        def run_collection():
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            metrics = loop.run_until_complete(pipeline_manager.run_light_collection())
            loop.close()
            
            logger.info("Hourly collection completed",
                       collected=metrics.total_collected,
                       execution_time=metrics.execution_time_seconds,
                       success=metrics.is_successful)
        
        background_tasks.add_task(run_collection)
        
        return JSONResponse({
            "status": "success",
            "message": "Hourly collection started",
            "timestamp": datetime.utcnow().isoformat(),
            "type": "hourly_light"
        })
        
    except Exception as e:
        logger.error("Hourly collection cron failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Cron job failed: {str(e)}")

@router.post("/six-hourly-collection")
async def six_hourly_collection(
    background_tasks: BackgroundTasks,
    authenticated: bool = Depends(verify_cron_secret)
):
    """
    Six-hourly full data collection with AI analysis
    Triggered by Vercel cron: 0 */6 * * * (every 6 hours)
    """
    try:
        pipeline_manager = get_pipeline_manager()
        
        logger.info("Starting six-hourly collection cron job")
        
        # Run full collection
        metrics = await pipeline_manager.run_full_collection()
        
        # Store metrics for monitoring
        await _store_pipeline_metrics(metrics)
        
        return JSONResponse({
            "status": "success",
            "message": "Six-hourly collection completed",
            "timestamp": datetime.utcnow().isoformat(),
            "type": "six_hourly_full",
            "metrics": {
                "collected": metrics.total_collected,
                "analyzed": metrics.total_analyzed,
                "ideas_generated": metrics.total_ideas_generated,
                "execution_time_seconds": metrics.execution_time_seconds,
                "success": metrics.is_successful,
                "errors": len(metrics.errors)
            }
        })
        
    except Exception as e:
        logger.error("Six-hourly collection cron failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Cron job failed: {str(e)}")

@router.post("/daily-digest")
async def daily_digest(
    background_tasks: BackgroundTasks,
    authenticated: bool = Depends(verify_cron_secret)
):
    """
    Daily digest with Telegram notification
    Triggered by Vercel cron: 0 9 * * * (every day at 9:00 AM)
    """
    try:
        pipeline_manager = get_pipeline_manager()
        
        logger.info("Starting daily digest cron job")
        
        # Run daily digest pipeline
        metrics = await pipeline_manager.run_daily_digest()
        
        # Store metrics
        await _store_pipeline_metrics(metrics)
        
        return JSONResponse({
            "status": "success",
            "message": "Daily digest completed",
            "timestamp": datetime.utcnow().isoformat(),
            "type": "daily_digest",
            "metrics": {
                "collected": metrics.total_collected,
                "analyzed": metrics.total_analyzed,
                "ideas_generated": metrics.total_ideas_generated,
                "execution_time_seconds": metrics.execution_time_seconds,
                "success": metrics.is_successful,
                "telegram_sent": "send_telegram" in str(metrics.stage),
                "errors": len(metrics.errors)
            }
        })
        
    except Exception as e:
        logger.error("Daily digest cron failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Cron job failed: {str(e)}")

@router.get("/health")
async def pipeline_health():
    """
    Pipeline health check
    Can be called by monitoring services
    """
    try:
        pipeline_manager = get_pipeline_manager()
        health_status = await pipeline_manager.get_pipeline_health()
        
        # Determine HTTP status based on health
        status_code = 200
        if health_status["overall_status"] == "unhealthy":
            status_code = 503
        elif health_status["overall_status"] == "degraded":
            status_code = 200  # Still healthy but degraded
        
        return JSONResponse(health_status, status_code=status_code)
        
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        return JSONResponse({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }, status_code=503)

@router.get("/metrics")
async def pipeline_metrics(
    hours: int = 24,
    authenticated: bool = Depends(verify_cron_secret)
):
    """
    Get pipeline metrics for the last N hours
    """
    try:
        # Get metrics from database
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        # This would need to be implemented in DatabaseService
        # For now, return mock metrics structure
        metrics_data = {
            "time_range_hours": hours,
            "total_executions": 0,
            "successful_executions": 0,
            "total_collected": 0,
            "total_analyzed": 0,
            "total_ideas_generated": 0,
            "average_execution_time": 0.0,
            "error_rate": 0.0,
            "last_execution": None
        }
        
        try:
            # Get basic stats from database
            pain_points_count = await DatabaseService.count_pain_points_since(cutoff_time)
            metrics_data["total_collected"] = pain_points_count
            
        except Exception as e:
            logger.warning("Failed to get detailed metrics", error=str(e))
        
        return JSONResponse(metrics_data)
        
    except Exception as e:
        logger.error("Failed to get pipeline metrics", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")

@router.post("/trigger-manual")
async def trigger_manual_collection(
    pipeline_type: str = "six_hourly_full",
    background_tasks: BackgroundTasks = None,
    authenticated: bool = Depends(verify_cron_secret)
):
    """
    Manually trigger a pipeline execution
    Useful for testing and emergency data collection
    """
    try:
        pipeline_manager = get_pipeline_manager()
        
        # Validate pipeline type
        available_pipelines = pipeline_manager.get_pipeline_configs()["available_pipelines"]
        if pipeline_type not in available_pipelines:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid pipeline type. Available: {available_pipelines}"
            )
        
        logger.info("Manual pipeline trigger", pipeline_type=pipeline_type)
        
        # Run pipeline
        metrics = await pipeline_manager.run_pipeline(pipeline_type)
        
        # Store metrics
        await _store_pipeline_metrics(metrics)
        
        return JSONResponse({
            "status": "success",
            "message": f"Manual {pipeline_type} pipeline completed",
            "timestamp": datetime.utcnow().isoformat(),
            "type": pipeline_type,
            "metrics": {
                "collected": metrics.total_collected,
                "analyzed": metrics.total_analyzed,
                "ideas_generated": metrics.total_ideas_generated,
                "execution_time_seconds": metrics.execution_time_seconds,
                "success": metrics.is_successful,
                "errors": metrics.errors
            }
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Manual pipeline trigger failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")

@router.get("/configs")
async def get_pipeline_configs():
    """
    Get available pipeline configurations
    Public endpoint for monitoring dashboards
    """
    try:
        pipeline_manager = get_pipeline_manager()
        configs = pipeline_manager.get_pipeline_configs()
        
        return JSONResponse({
            "timestamp": datetime.utcnow().isoformat(),
            "configs": configs,
            "cron_schedules": {
                "hourly_collection": "0 * * * *",  # Every hour
                "six_hourly_collection": "0 */6 * * *",  # Every 6 hours
                "daily_digest": "0 9 * * *"  # Daily at 9 AM
            }
        })
        
    except Exception as e:
        logger.error("Failed to get pipeline configs", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get configs: {str(e)}")

# Helper functions
async def _store_pipeline_metrics(metrics: PipelineMetrics):
    """Store pipeline execution metrics in database"""
    try:
        # This would store metrics in a dedicated table for monitoring
        # For now, just log the metrics
        logger.info("Pipeline execution metrics",
                   pipeline_id=metrics.pipeline_id,
                   collected=metrics.total_collected,
                   analyzed=metrics.total_analyzed,
                   ideas=metrics.total_ideas_generated,
                   execution_time=metrics.execution_time_seconds,
                   success=metrics.is_successful,
                   errors=len(metrics.errors))
        
        # TODO: Implement actual database storage
        # await DatabaseService.store_pipeline_metrics(metrics.to_dict())
        
    except Exception as e:
        logger.error("Failed to store pipeline metrics", error=str(e))
        # Don't raise exception as this is non-critical