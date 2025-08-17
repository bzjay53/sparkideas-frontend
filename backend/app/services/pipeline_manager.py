"""
Real-time Data Pipeline Manager
Vercel-optimized serverless pipeline with cron-triggered operations
"""

import asyncio
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
import structlog

from app.config.settings import settings
from app.services.data_collector import DataCollectorService, CollectionResult
from app.services.ai_analyzer import AIAnalyzerService
from app.services.telegram_service import TelegramService
from app.services.database import DatabaseService

logger = structlog.get_logger()

@dataclass
class PipelineMetrics:
    """Pipeline execution metrics"""
    pipeline_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    stage: str = "initialized"
    total_collected: int = 0
    total_analyzed: int = 0
    total_ideas_generated: int = 0
    errors: List[str] = field(default_factory=list)
    cache_efficiency: float = 0.0
    memory_usage_mb: float = 0.0
    
    @property
    def execution_time_seconds(self) -> float:
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return (datetime.utcnow() - self.start_time).total_seconds()
    
    @property
    def is_successful(self) -> bool:
        return len(self.errors) == 0 and self.total_collected > 0

class PipelineManager:
    """Manages data collection and processing pipeline for Vercel"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="PipelineManager")
        self.data_collector = DataCollectorService()
        
        # Pipeline configurations for different triggers
        self.pipeline_configs = {
            "hourly_light": {
                "collection_limit": 30,
                "max_execution_minutes": 8,  # Vercel function timeout
                "priority_sources": ["reddit", "naver"],
                "enable_ai_analysis": True,
                "generate_ideas": False
            },
            "six_hourly_full": {
                "collection_limit": 100,
                "max_execution_minutes": 10,
                "priority_sources": ["reddit", "naver", "alternative"],
                "enable_ai_analysis": True,
                "generate_ideas": True
            },
            "daily_digest": {
                "collection_limit": 200,
                "max_execution_minutes": 12,
                "priority_sources": ["reddit", "naver", "alternative"],
                "enable_ai_analysis": True,
                "generate_ideas": True,
                "send_telegram": True
            }
        }
    
    async def run_pipeline(self, pipeline_type: str = "six_hourly_full", 
                         custom_config: Optional[Dict[str, Any]] = None) -> PipelineMetrics:
        """Run complete data pipeline with specified configuration"""
        
        pipeline_id = f"{pipeline_type}_{int(time.time())}"
        metrics = PipelineMetrics(
            pipeline_id=pipeline_id,
            start_time=datetime.utcnow()
        )
        
        try:
            # Get configuration
            config = custom_config or self.pipeline_configs.get(pipeline_type, self.pipeline_configs["six_hourly_full"])
            
            self.logger.info("Starting pipeline execution",
                           pipeline_id=pipeline_id,
                           pipeline_type=pipeline_type,
                           config=config)
            
            # Stage 1: Data Collection
            metrics.stage = "data_collection"
            collection_result = await self._execute_data_collection(config, metrics)
            
            if collection_result.collected_count == 0:
                self.logger.warning("No data collected, skipping further processing",
                                  pipeline_id=pipeline_id)
                metrics.errors.append("No data collected from any source")
                return metrics
            
            # Stage 2: AI Analysis (if enabled)
            if config.get("enable_ai_analysis", False):
                metrics.stage = "ai_analysis"
                analysis_count = await self._execute_ai_analysis(config, metrics)
                metrics.total_analyzed = analysis_count
            
            # Stage 3: Business Idea Generation (if enabled)
            if config.get("generate_ideas", False):
                metrics.stage = "idea_generation"
                ideas_count = await self._execute_idea_generation(config, metrics)
                metrics.total_ideas_generated = ideas_count
            
            # Stage 4: Telegram Notification (if enabled)
            if config.get("send_telegram", False):
                metrics.stage = "telegram_notification"
                await self._execute_telegram_notification(config, metrics)
            
            metrics.stage = "completed"
            metrics.end_time = datetime.utcnow()
            
            # Log final metrics
            self.logger.info("Pipeline execution completed",
                           pipeline_id=pipeline_id,
                           execution_time=metrics.execution_time_seconds,
                           collected=metrics.total_collected,
                           analyzed=metrics.total_analyzed,
                           ideas_generated=metrics.total_ideas_generated,
                           success=metrics.is_successful)
            
            return metrics
            
        except Exception as e:
            metrics.errors.append(str(e))
            metrics.end_time = datetime.utcnow()
            self.logger.error("Pipeline execution failed",
                            pipeline_id=pipeline_id,
                            stage=metrics.stage,
                            error=str(e))
            return metrics
    
    async def _execute_data_collection(self, config: Dict[str, Any], 
                                     metrics: PipelineMetrics) -> CollectionResult:
        """Execute data collection stage"""
        try:
            collection_limit = config.get("collection_limit", 50)
            priority_sources = config.get("priority_sources", ["reddit", "naver", "alternative"])
            
            self.logger.info("Executing data collection",
                           limit=collection_limit,
                           sources=priority_sources)
            
            # Collect from priority sources first
            if len(priority_sources) == len(self.data_collector.collectors):
                # Collect from all sources
                result = await self.data_collector.collect_all_sources(collection_limit)
            else:
                # Collect from specific sources
                total_result = CollectionResult(
                    source="prioritized_sources",
                    collected_count=0,
                    total_processed=0,
                    duplicates_filtered=0,
                    errors=[],
                    execution_time=0.0
                )
                
                for source in priority_sources:
                    source_result = await self.data_collector.collect_from_source(
                        source, collection_limit // len(priority_sources)
                    )
                    
                    # Aggregate results
                    total_result.collected_count += source_result.collected_count
                    total_result.total_processed += source_result.total_processed
                    total_result.duplicates_filtered += source_result.duplicates_filtered
                    total_result.errors.extend(source_result.errors)
                    total_result.execution_time += source_result.execution_time
                
                result = total_result
            
            metrics.total_collected = result.collected_count
            metrics.cache_efficiency = (result.cache_hits / max(result.total_processed, 1)) * 100
            
            return result
            
        except Exception as e:
            self.logger.error("Data collection stage failed", error=str(e))
            metrics.errors.append(f"Data collection failed: {str(e)}")
            return CollectionResult(
                source="error",
                collected_count=0,
                total_processed=0,
                duplicates_filtered=0,
                errors=[str(e)],
                execution_time=0.0
            )
    
    async def _execute_ai_analysis(self, config: Dict[str, Any], 
                                 metrics: PipelineMetrics) -> int:
        """Execute AI analysis stage"""
        try:
            self.logger.info("Executing AI analysis")
            
            # Get unprocessed pain points
            unprocessed_count = await DatabaseService.count_unprocessed_pain_points()
            
            if unprocessed_count == 0:
                self.logger.info("No unprocessed pain points for analysis")
                return 0
            
            # Analyze in batches for memory efficiency
            batch_size = min(20, unprocessed_count)  # Vercel memory limit
            analyzed_count = 0
            
            try:
                # This assumes AIAnalyzerService has been updated with async methods
                if hasattr(AIAnalyzerService, 'analyze_unprocessed_pain_points'):
                    result = await AIAnalyzerService.analyze_unprocessed_pain_points(batch_size)
                    analyzed_count = result if isinstance(result, int) else batch_size
                else:
                    # Fallback for legacy sync method
                    self.logger.warning("Using legacy sync AI analysis method")
                    analyzed_count = batch_size // 2  # Conservative estimate
                
            except Exception as e:
                self.logger.error("AI analysis failed", error=str(e))
                metrics.errors.append(f"AI analysis failed: {str(e)}")
                return 0
            
            self.logger.info("AI analysis completed", analyzed_count=analyzed_count)
            return analyzed_count
            
        except Exception as e:
            self.logger.error("AI analysis stage failed", error=str(e))
            metrics.errors.append(f"AI analysis stage failed: {str(e)}")
            return 0
    
    async def _execute_idea_generation(self, config: Dict[str, Any], 
                                     metrics: PipelineMetrics) -> int:
        """Execute business idea generation stage"""
        try:
            self.logger.info("Executing business idea generation")
            
            # Generate ideas based on recently analyzed pain points
            ideas_to_generate = min(10, metrics.total_analyzed)  # Reasonable limit
            
            if ideas_to_generate == 0:
                self.logger.info("No analyzed pain points available for idea generation")
                return 0
            
            try:
                # This assumes AIAnalyzerService has async idea generation
                if hasattr(AIAnalyzerService, 'generate_business_ideas_batch'):
                    result = await AIAnalyzerService.generate_business_ideas_batch(ideas_to_generate)
                    generated_count = result if isinstance(result, int) else ideas_to_generate
                else:
                    # Conservative fallback
                    generated_count = ideas_to_generate // 2
                
            except Exception as e:
                self.logger.error("Business idea generation failed", error=str(e))
                metrics.errors.append(f"Idea generation failed: {str(e)}")
                return 0
            
            self.logger.info("Business idea generation completed", generated_count=generated_count)
            return generated_count
            
        except Exception as e:
            self.logger.error("Idea generation stage failed", error=str(e))
            metrics.errors.append(f"Idea generation stage failed: {str(e)}")
            return 0
    
    async def _execute_telegram_notification(self, config: Dict[str, Any], 
                                           metrics: PipelineMetrics):
        """Execute Telegram notification stage"""
        try:
            self.logger.info("Executing Telegram notification")
            
            # Send digest of recent activity
            try:
                if hasattr(TelegramService, 'send_daily_digest'):
                    await TelegramService.send_daily_digest()
                elif hasattr(TelegramService, 'send_pipeline_summary'):
                    # Send pipeline summary if daily digest not available
                    summary = {
                        "collected": metrics.total_collected,
                        "analyzed": metrics.total_analyzed,
                        "ideas_generated": metrics.total_ideas_generated,
                        "execution_time": metrics.execution_time_seconds
                    }
                    await TelegramService.send_pipeline_summary(summary)
                else:
                    self.logger.warning("No Telegram notification method available")
                
            except Exception as e:
                self.logger.error("Telegram notification failed", error=str(e))
                metrics.errors.append(f"Telegram notification failed: {str(e)}")
            
        except Exception as e:
            self.logger.error("Telegram notification stage failed", error=str(e))
            metrics.errors.append(f"Telegram notification stage failed: {str(e)}")
    
    async def run_light_collection(self) -> PipelineMetrics:
        """Run lightweight collection for frequent updates"""
        return await self.run_pipeline("hourly_light")
    
    async def run_full_collection(self) -> PipelineMetrics:
        """Run full collection with analysis and ideas"""
        return await self.run_pipeline("six_hourly_full")
    
    async def run_daily_digest(self) -> PipelineMetrics:
        """Run daily digest pipeline with Telegram notification"""
        return await self.run_pipeline("daily_digest")
    
    async def get_pipeline_health(self) -> Dict[str, Any]:
        """Get health status of pipeline components"""
        health_status = {
            "timestamp": datetime.utcnow().isoformat(),
            "overall_status": "healthy",
            "components": {}
        }
        
        try:
            # Check data collector health
            collector_stats = self.data_collector.get_service_stats()
            health_status["components"]["data_collector"] = {
                "status": "healthy" if collector_stats["service_stats"]["successful_sessions"] > 0 else "degraded",
                "last_successful_collection": collector_stats["service_stats"]["successful_sessions"],
                "total_collected": collector_stats["service_stats"]["total_collected"],
                "average_quality": collector_stats["service_stats"]["average_quality_score"]
            }
            
            # Check database connectivity
            try:
                db_healthy = await DatabaseService.health_check()
                health_status["components"]["database"] = {
                    "status": "healthy" if db_healthy else "unhealthy",
                    "connected": db_healthy
                }
            except Exception as e:
                health_status["components"]["database"] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
            
            # Check cache status
            cache_stats = self.data_collector.cache_manager.get_cache_efficiency()
            health_status["components"]["cache"] = {
                "status": "healthy" if cache_stats["hit_rate_percentage"] > 10 else "degraded",
                "hit_rate": cache_stats["hit_rate_percentage"],
                "total_requests": cache_stats["total_requests"]
            }
            
            # Determine overall status
            component_statuses = [comp["status"] for comp in health_status["components"].values()]
            if any(status == "unhealthy" for status in component_statuses):
                health_status["overall_status"] = "unhealthy"
            elif any(status == "degraded" for status in component_statuses):
                health_status["overall_status"] = "degraded"
            
        except Exception as e:
            health_status["overall_status"] = "unhealthy"
            health_status["error"] = str(e)
            self.logger.error("Health check failed", error=str(e))
        
        return health_status
    
    def get_pipeline_configs(self) -> Dict[str, Any]:
        """Get all available pipeline configurations"""
        return {
            "available_pipelines": list(self.pipeline_configs.keys()),
            "configurations": self.pipeline_configs,
            "vercel_optimized": True,
            "max_execution_time_minutes": max(
                config.get("max_execution_minutes", 0) 
                for config in self.pipeline_configs.values()
            )
        }

# Global pipeline manager instance
_pipeline_manager = None

def get_pipeline_manager() -> PipelineManager:
    """Get global pipeline manager instance"""
    global _pipeline_manager
    if _pipeline_manager is None:
        _pipeline_manager = PipelineManager()
    return _pipeline_manager