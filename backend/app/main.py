"""
IdeaSpark v2.0 FastAPI Backend
Real-time Pain Point Analysis & Business Idea Generation
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
import structlog

from app.config.settings import settings
from app.api import router as api_router
from app.services.database import DatabaseService
from app.services.scheduler import start_scheduler, stop_scheduler
from app.utils.logging import setup_logging

# Setup structured logging
logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🚀 Starting IdeaSpark v2.0 Backend")
    
    # Initialize database
    await DatabaseService.initialize()
    
    # Start background scheduler for data collection
    start_scheduler()
    
    logger.info("✅ Backend startup complete")
    
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down IdeaSpark Backend")
    stop_scheduler()
    await DatabaseService.close()
    logger.info("✅ Backend shutdown complete")

# Create FastAPI application
app = FastAPI(
    title="IdeaSpark API",
    description="Real-time Pain Point Analysis & Business Idea Generation Platform",
    version="2.0.0",
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url="/redoc" if settings.environment == "development" else None,
    lifespan=lifespan
)

# Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.allowed_hosts
)

# Setup logging
setup_logging()

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db_status = await DatabaseService.health_check()
        
        return {
            "status": "healthy" if db_status else "unhealthy",
            "service": "IdeaSpark API",
            "version": "2.0.0",
            "environment": settings.environment,
            "database": "connected" if db_status else "disconnected"
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "🚀 IdeaSpark v2.0 API",
        "description": "Real-time Pain Point Analysis & Business Idea Generation",
        "docs": "/docs" if settings.environment == "development" else "Documentation disabled in production",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=5001,
        reload=settings.environment == "development",
        log_level="info"
    )