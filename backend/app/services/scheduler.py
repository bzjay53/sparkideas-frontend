"""
Background Task Scheduler
Handles periodic data collection, analysis, and telegram sending
"""

import asyncio
import schedule
import time
from threading import Thread
from datetime import datetime
import structlog

from app.config.settings import settings
from app.services.data_collector import DataCollectorService
from app.services.ai_analyzer import AIAnalyzerService
from app.services.telegram_service import TelegramService

logger = structlog.get_logger()

class SchedulerService:
    """Background scheduler for automated tasks"""
    
    def __init__(self):
        self.running = False
        self.thread = None
    
    def start(self):
        """Start the scheduler"""
        if self.running:
            logger.warning("Scheduler already running")
            return
        
        self.running = True
        
        # Schedule tasks
        self._setup_schedules()
        
        # Start scheduler thread
        self.thread = Thread(target=self._run_scheduler, daemon=True)
        self.thread.start()
        
        logger.info("Scheduler started successfully")
    
    def stop(self):
        """Stop the scheduler"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        
        schedule.clear()
        logger.info("Scheduler stopped")
    
    def _setup_schedules(self):
        """Setup all scheduled tasks"""
        
        # Data collection every 6 hours
        schedule.every(settings.collection_interval_hours).hours.do(
            self._run_async_task, 
            DataCollectorService.collect_all_sources
        )
        
        # AI analysis every 2 hours
        schedule.every(2).hours.do(
            self._run_async_task,
            AIAnalyzerService.analyze_unprocessed_pain_points
        )
        
        # Business idea generation every 4 hours
        schedule.every(4).hours.do(
            self._run_async_task,
            AIAnalyzerService.generate_business_ideas_batch
        )
        
        # Daily telegram digest at 9:00 AM
        schedule.every().day.at(settings.telegram_digest_time).do(
            self._run_async_task,
            TelegramService.send_daily_digest
        )
        
        logger.info("Scheduled tasks configured", 
                   collection_interval=f"{settings.collection_interval_hours}h",
                   digest_time=settings.telegram_digest_time)
    
    def _run_scheduler(self):
        """Run the scheduler loop"""
        logger.info("Scheduler loop started")
        
        while self.running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
            except Exception as e:
                logger.error("Scheduler error", error=str(e))
                time.sleep(60)
        
        logger.info("Scheduler loop ended")
    
    def _run_async_task(self, coro_func, *args, **kwargs):
        """Run async function in scheduler thread"""
        try:
            # Create new event loop for this thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Run the async function
            loop.run_until_complete(coro_func(*args, **kwargs))
            loop.close()
            
            logger.info("Scheduled task completed", task=coro_func.__name__)
            
        except Exception as e:
            logger.error("Scheduled task failed", 
                        task=coro_func.__name__, 
                        error=str(e))

# Global scheduler instance
_scheduler = SchedulerService()

def start_scheduler():
    """Start the global scheduler"""
    _scheduler.start()

def stop_scheduler():
    """Stop the global scheduler"""
    _scheduler.stop()

def get_scheduler():
    """Get scheduler instance"""
    return _scheduler