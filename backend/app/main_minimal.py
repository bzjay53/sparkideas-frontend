"""
IdeaSpark FastAPI Backend - Minimal Version
Core backend application for IdeaSpark v2.0 without external dependencies
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.dev.ConsoleRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("🚀 IdeaSpark Backend starting up...")
    
    # Initialize database service
    try:
        from app.services.database_minimal import DatabaseService
        await DatabaseService.initialize()
        logger.info("✅ Database service initialized")
    except Exception as e:
        logger.error("❌ Database initialization failed", error=str(e))
    
    logger.info("✅ Application startup completed")
    
    yield
    
    logger.info("🛑 Application shutting down...")

# Create FastAPI application
app = FastAPI(
    title="IdeaSpark API",
    description="Real-time Pain Point Analysis & Business Idea Generation Platform",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3300", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "🚀 IdeaSpark v2.0 API is running!",
        "version": "2.0.0",
        "description": "Real-time Pain Point Analysis & Business Idea Generation",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ideaSpark-backend",
        "version": "2.0.0",
        "environment": "development",
        "timestamp": "2025-08-16T00:00:00Z"
    }

# Minimal API endpoints for testing
@app.get("/api/pain-points")
async def get_pain_points():
    """Get recent pain points"""
    from app.services.database_minimal import DatabaseService
    pain_points = await DatabaseService.get_pain_points(limit=10)
    return {
        "pain_points": pain_points,
        "total": len(pain_points),
        "status": "success"
    }

@app.get("/api/business-ideas")
async def get_business_ideas():
    """Get recent business ideas"""
    from app.services.database_minimal import DatabaseService
    ideas = await DatabaseService.get_business_ideas(limit=5)
    return {
        "business_ideas": ideas,
        "total": len(ideas),
        "status": "success"
    }

@app.get("/api/analytics/overview")
async def get_analytics_overview():
    """Get analytics overview"""
    from app.services.database_minimal import DatabaseService
    
    pain_point_stats = await DatabaseService.get_pain_point_stats_by_source()
    business_idea_stats = await DatabaseService.get_business_idea_stats()
    telegram_stats = await DatabaseService.get_telegram_delivery_stats()
    
    return {
        "pain_points": pain_point_stats,
        "business_ideas": business_idea_stats,
        "telegram": telegram_stats,
        "generated_at": "2025-08-16T00:00:00Z"
    }

@app.get("/api/analytics/trending-keywords")
async def get_trending_keywords():
    """Get trending keywords"""
    from app.services.database_minimal import DatabaseService
    keywords = await DatabaseService.get_trending_keywords(days=7, limit=10)
    return {
        "keywords": keywords,
        "total": len(keywords),
        "period_days": 7
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)