"""
API Router Configuration
Enhanced with Vercel Cron endpoints for serverless data pipeline
"""

from fastapi import APIRouter
from app.api.endpoints import pain_points, business_ideas, analytics, telegram, community, prd
from app.api import cron

# Create main API router
router = APIRouter()

# Include endpoint routers
router.include_router(
    pain_points.router,
    prefix="/pain-points",
    tags=["Pain Points"]
)

router.include_router(
    business_ideas.router,
    prefix="/business-ideas", 
    tags=["Business Ideas"]
)

router.include_router(
    analytics.router,
    prefix="/analytics",
    tags=["Analytics"]
)

router.include_router(
    telegram.router,
    prefix="/telegram",
    tags=["Telegram"]
)

router.include_router(
    community.router,
    prefix="/community",
    tags=["Community"]
)

router.include_router(
    prd.router,
    prefix="/prd",
    tags=["PRD Generation"]
)

# Vercel Cron endpoints for automated data pipeline
router.include_router(
    cron.router,
    prefix="/cron",
    tags=["Cron Jobs"]
)