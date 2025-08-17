"""
Telegram API Endpoints
Bot management and message delivery
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any
import structlog

from app.services.telegram_service import TelegramService
from app.services.database import DatabaseService

logger = structlog.get_logger()
router = APIRouter()

@router.post("/send-digest")
async def send_telegram_digest(background_tasks: BackgroundTasks) -> Dict[str, str]:
    """Send daily digest immediately"""
    try:
        background_tasks.add_task(TelegramService.send_daily_digest)
        return {
            "message": "Daily digest sending initiated",
            "status": "queued"
        }
    except Exception as e:
        logger.error("Failed to initiate telegram digest", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to initiate telegram digest")

@router.get("/digest/preview")
async def preview_telegram_digest() -> Dict[str, Any]:
    """Preview daily digest without sending"""
    try:
        digest = await TelegramService.prepare_daily_digest()
        return digest
    except Exception as e:
        logger.error("Failed to preview telegram digest", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to preview telegram digest")

@router.post("/test")
async def send_test_message() -> Dict[str, Any]:
    """Send test message to verify bot functionality"""
    try:
        success = await TelegramService.send_test_message()
        return {
            "success": success,
            "message": "Test message sent" if success else "Test message failed"
        }
    except Exception as e:
        logger.error("Failed to send test message", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to send test message")

@router.get("/stats")
async def get_telegram_stats(days: int = 7) -> Dict[str, Any]:
    """Get telegram delivery statistics"""
    try:
        stats = await DatabaseService.get_telegram_delivery_stats(days)
        return stats
    except Exception as e:
        logger.error("Failed to fetch telegram stats", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch telegram stats")