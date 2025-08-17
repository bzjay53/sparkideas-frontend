#!/usr/bin/env python3
"""
IdeaSpark Backend Startup Script
Initializes and starts the FastAPI application with proper configuration
"""

import os
import sys
import asyncio
import uvicorn
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.main import app, lifespan
from app.config.settings import settings
import structlog

logger = structlog.get_logger()

def main():
    """Main startup function"""
    try:
        logger.info("Starting IdeaSpark Backend...", 
                   port=settings.port,
                   environment=settings.environment)
        
        # Start the FastAPI application
        uvicorn.run(
            "app.main:app",
            host=settings.host,
            port=settings.port,
            reload=settings.environment == "development",
            log_level=settings.log_level.lower(),
            workers=1,  # Single worker for async tasks
            access_log=True
        )
        
    except KeyboardInterrupt:
        logger.info("Shutdown requested by user")
    except Exception as e:
        logger.error("Failed to start application", error=str(e))
        sys.exit(1)

if __name__ == "__main__":
    main()