"""
Data Collection Service
Collects pain points from various sources (Reddit, Twitter, Google, etc.)
"""

import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Set
import structlog
import hashlib
import json
from dataclasses import dataclass

from app.config.settings import settings
from app.services.database import DatabaseService
from app.services.collectors.reddit_collector import RedditCollector
from app.services.collectors.naver_collector import NaverCollector
from app.services.collectors.alternative_collector import AlternativeCollector
from app.services.collectors.cache_manager import CacheManager

logger = structlog.get_logger()

@dataclass
class CollectionResult:
    """Data collection result with metrics"""
    source: str
    collected_count: int
    total_processed: int
    duplicates_filtered: int
    errors: List[str]
    execution_time: float
    cache_hits: int = 0
    
    @property
    def success_rate(self) -> float:
        if self.total_processed == 0:
            return 0.0
        return (self.collected_count / self.total_processed) * 100
    
    @property
    def efficiency_score(self) -> float:
        """Calculate efficiency based on collection rate and cache usage"""
        base_score = self.success_rate / 100
        cache_bonus = min(self.cache_hits / max(self.total_processed, 1), 0.5)
        return min(base_score + cache_bonus, 1.0)

class DataCollectorService:
    """Enhanced modular data collection service for Vercel optimization"""
    
    def __init__(self):
        self.cache_manager = CacheManager()
        self.collectors = {
            "reddit": RedditCollector(),
            "naver": NaverCollector(), 
            "alternative": AlternativeCollector()
        }
        self.logger = structlog.get_logger().bind(service="DataCollectorService")
        self._collection_stats = {
            "total_sessions": 0,
            "successful_sessions": 0,
            "total_collected": 0,
            "average_quality_score": 0.0
        }
    
    async def collect_all_sources(self, limit_per_source: int = 50) -> CollectionResult:
        """Collect data from all configured sources with enhanced error handling"""
        start_time = time.time()
        self._collection_stats["total_sessions"] += 1
        
        # Generate intelligent queries based on current trends
        base_queries = self._generate_intelligent_queries()
        
        collection_results = []
        all_pain_points = []
        total_errors = []
        
        try:
            # Collect from each source with optimized concurrency
            for collector_name, collector in self.collectors.items():
                try:
                    self.logger.info("Starting collection", collector=collector_name)
                    
                    # Collect pain points
                    pain_points = await collector.collect(base_queries, limit_per_source)
                    
                    # Convert to database format and store
                    stored_count = 0
                    for pain_point in pain_points:
                        try:
                            # Check for duplicates before storing
                            if not await self.cache_manager.is_duplicate_content(
                                pain_point.title, pain_point.content, pain_point.source_url
                            ):
                                await DatabaseService.create_pain_point(pain_point.to_dict())
                                stored_count += 1
                        except Exception as e:
                            self.logger.warning("Failed to store pain point", error=str(e))
                    
                    # Create collection result
                    collector_stats = collector.get_stats()
                    result = CollectionResult(
                        source=collector_name,
                        collected_count=stored_count,
                        total_processed=len(pain_points),
                        duplicates_filtered=len(pain_points) - stored_count,
                        errors=collector_stats["stats"]["errors"],
                        execution_time=time.time() - start_time,
                        cache_hits=collector_stats["stats"].get("cache_hits", 0)
                    )
                    
                    collection_results.append(result)
                    all_pain_points.extend(pain_points)
                    
                    self.logger.info("Collection completed", 
                                   collector=collector_name,
                                   stored=stored_count,
                                   processed=len(pain_points),
                                   efficiency=result.efficiency_score)
                    
                except Exception as e:
                    self.logger.error("Collector failed", collector=collector_name, error=str(e))
                    total_errors.append(f"{collector_name}: {str(e)}")
                    continue
            
            # Calculate overall results
            total_collected = sum(r.collected_count for r in collection_results)
            total_processed = sum(r.total_processed for r in collection_results)
            
            # Update global stats
            if total_collected > 0:
                self._collection_stats["successful_sessions"] += 1
                self._collection_stats["total_collected"] += total_collected
                
                avg_quality = sum(p.quality_score for p in all_pain_points) / len(all_pain_points)
                self._collection_stats["average_quality_score"] = (
                    (self._collection_stats["average_quality_score"] + avg_quality) / 2
                )
            
            # Cleanup memory and cache
            await self.cache_manager.cleanup_expired()
            
            execution_time = time.time() - start_time
            
            self.logger.info("Data collection session completed",
                           total_collected=total_collected,
                           total_processed=total_processed,
                           sources_successful=len(collection_results),
                           execution_time=execution_time,
                           efficiency_score=sum(r.efficiency_score for r in collection_results) / len(collection_results) if collection_results else 0)
            
            return CollectionResult(
                source="all_sources",
                collected_count=total_collected,
                total_processed=total_processed,
                duplicates_filtered=sum(r.duplicates_filtered for r in collection_results),
                errors=total_errors,
                execution_time=execution_time,
                cache_hits=sum(r.cache_hits for r in collection_results)
            )
            
        except Exception as e:
            self.logger.error("Data collection session failed", error=str(e))
            return CollectionResult(
                source="all_sources",
                collected_count=0,
                total_processed=0,
                duplicates_filtered=0,
                errors=[str(e)],
                execution_time=time.time() - start_time
            )
    
    def _generate_intelligent_queries(self) -> List[str]:
        """Generate intelligent queries based on trending topics and pain point patterns"""
        # Time-sensitive queries
        current_hour = datetime.utcnow().hour
        current_day = datetime.utcnow().weekday()  # 0 = Monday
        
        base_queries = [
            "software usability problems",
            "workflow inefficiencies", 
            "automation opportunities",
            "user experience pain points",
            "productivity bottlenecks"
        ]
        
        # Add time-contextual queries
        if current_hour < 12:  # Morning - focus on productivity
            base_queries.extend([
                "morning routine problems",
                "work setup inefficiencies",
                "daily planning issues"
            ])
        elif current_hour > 17:  # Evening - focus on tools and services
            base_queries.extend([
                "app frustrations",
                "service problems",
                "tool limitations"
            ])
        
        # Add day-contextual queries
        if current_day < 5:  # Weekday
            base_queries.extend([
                "business process problems",
                "work tool issues",
                "collaboration difficulties"
            ])
        else:  # Weekend
            base_queries.extend([
                "personal productivity issues", 
                "hobby tool problems",
                "lifestyle inefficiencies"
            ])
        
        return base_queries[:8]  # Limit to prevent API overuse
    
    async def collect_from_source(self, source: str, limit: int = 50) -> CollectionResult:
        """Collect data from specific source using modular collectors"""
        if source not in self.collectors:
            self.logger.warning("Unknown source", source=source)
            return CollectionResult(
                source=source,
                collected_count=0,
                total_processed=0,
                duplicates_filtered=0,
                errors=[f"Unknown source: {source}"],
                execution_time=0.0
            )
        
        start_time = time.time()
        
        try:
            collector = self.collectors[source]
            queries = self._generate_intelligent_queries()
            
            pain_points = await collector.collect(queries, limit)
            
            # Store in database
            stored_count = 0
            for pain_point in pain_points:
                try:
                    if not await self.cache_manager.is_duplicate_content(
                        pain_point.title, pain_point.content, pain_point.source_url
                    ):
                        await DatabaseService.create_pain_point(pain_point.to_dict())
                        stored_count += 1
                except Exception as e:
                    self.logger.warning("Failed to store pain point", error=str(e))
            
            collector_stats = collector.get_stats()
            
            return CollectionResult(
                source=source,
                collected_count=stored_count,
                total_processed=len(pain_points),
                duplicates_filtered=len(pain_points) - stored_count,
                errors=collector_stats["stats"]["errors"],
                execution_time=time.time() - start_time,
                cache_hits=collector_stats["stats"].get("cache_hits", 0)
            )
            
        except Exception as e:
            self.logger.error("Source collection failed", source=source, error=str(e))
            return CollectionResult(
                source=source,
                collected_count=0,
                total_processed=0,
                duplicates_filtered=0,
                errors=[str(e)],
                execution_time=time.time() - start_time
            )
    
    async def collect_trending_topics(self, limit: int = 100) -> Dict[str, Any]:
        """Collect trending pain points across all sources"""
        trending_results = {}
        
        for source_name, collector in self.collectors.items():
            try:
                if hasattr(collector, 'collect_trending_topics'):
                    trending_data = await collector.collect_trending_topics(limit // len(self.collectors))
                    trending_results[source_name] = {
                        "count": len(trending_data),
                        "avg_quality": sum(p.quality_score for p in trending_data) / len(trending_data) if trending_data else 0,
                        "top_categories": list(set(p.category for p in trending_data[:10]))
                    }
            except Exception as e:
                self.logger.error("Trending collection failed", source=source_name, error=str(e))
                trending_results[source_name] = {"error": str(e)}
        
        return trending_results
    
    async def collect_by_category(self, category: str, limit: int = 50) -> Dict[str, Any]:
        """Collect pain points for specific category across all sources"""
        category_results = {}
        
        for source_name, collector in self.collectors.items():
            try:
                if hasattr(collector, 'collect_by_category') or hasattr(collector, f'collect_by_{source_name}_category'):
                    method = getattr(collector, 'collect_by_category', 
                                   getattr(collector, f'collect_by_{source_name}_category', None))
                    if method:
                        category_data = await method(category, limit // len(self.collectors))
                        category_results[source_name] = {
                            "count": len(category_data),
                            "avg_confidence": sum(p.confidence for p in category_data) / len(category_data) if category_data else 0
                        }
            except Exception as e:
                self.logger.error("Category collection failed", source=source_name, category=category, error=str(e))
                category_results[source_name] = {"error": str(e)}
        
        return category_results
    
    def get_service_stats(self) -> Dict[str, Any]:
        """Get comprehensive service statistics"""
        collector_stats = {}
        for name, collector in self.collectors.items():
            collector_stats[name] = collector.get_stats()
        
        return {
            "service_stats": self._collection_stats,
            "cache_stats": self.cache_manager.get_memory_usage(),
            "cache_efficiency": self.cache_manager.get_cache_efficiency(),
            "collectors": collector_stats
        }
    
    # Legacy methods for backward compatibility
    @classmethod
    async def _collect_from_reddit(cls, limit: int) -> int:
        """Legacy Reddit collection method - use RedditCollector instead"""
        service = DataCollectorService()
        result = await service.collect_from_source("reddit", limit)
        return result.collected_count
    
    @classmethod
    async def _collect_from_google(cls, limit: int) -> int:
        """Legacy Google collection method - use AlternativeCollector instead"""
        service = DataCollectorService()
        result = await service.collect_from_source("alternative", limit)
        return result.collected_count
    
    @classmethod
    async def _collect_fallback_data(cls, limit: int) -> int:
        """Fallback data when all sources fail - minimal mock data for system stability"""
        try:
            logger.warning("Using fallback data - all collectors failed")
            
            # Minimal fallback data to ensure system doesn't crash
            fallback_data = [
                {
                    "title": "System fallback - data collection services unavailable",
                    "content": "This is fallback data when external APIs are unavailable",
                    "source": "system-fallback",
                    "source_url": "",
                    "sentiment_score": 0.5,
                    "trend_score": 0.1,
                    "keywords": ["system", "fallback"],
                    "category": "system"
                }
            ]
            
            collected_count = 0
            for data in fallback_data[:min(3, limit)]:  # Limit fallback data
                await DatabaseService.create_pain_point(data)
                collected_count += 1
            
            logger.info("Fallback data collection completed", collected=collected_count)
            return collected_count
            
        except Exception as e:
            logger.error("Fallback data collection failed", error=str(e))
            return 0
    
    @classmethod
    async def _collect_from_naver(cls, limit: int) -> int:
        """Legacy Naver collection method - use NaverCollector instead"""
        service = DataCollectorService()
        result = await service.collect_from_source("naver", limit)
        return result.collected_count
    
    @classmethod
    async def _collect_from_twitter(cls, limit: int) -> int:
        """Twitter collection - disabled (use alternative sources instead)"""
        logger.info("Twitter collection disabled - using alternative sources")
        return 0
    
    # Utility methods moved to BaseCollector for reusability
    # Legacy methods kept for backward compatibility
    
    @classmethod
    def _is_pain_point_content(cls, text: str) -> bool:
        """Legacy method - use BaseCollector._is_pain_point_content instead"""
        from .collectors.base_collector import BaseCollector
        dummy_collector = BaseCollector()
        return dummy_collector._is_pain_point_content(text)
    
    @classmethod  
    def _extract_keywords(cls, text: str) -> List[str]:
        """Legacy method - use BaseCollector._extract_keywords instead"""
        from .collectors.base_collector import BaseCollector
        dummy_collector = BaseCollector()
        return dummy_collector._extract_keywords(text)
    
    @classmethod
    def _categorize_content(cls, text: str) -> str:
        """Legacy method - use BaseCollector._categorize_content instead"""
        from .collectors.base_collector import BaseCollector
        dummy_collector = BaseCollector()
        return dummy_collector._categorize_content(text)
    
    @classmethod
    def _clean_html(cls, text: str) -> str:
        """Legacy method - use BaseCollector._clean_text instead"""
        from .collectors.base_collector import BaseCollector
        dummy_collector = BaseCollector()
        return dummy_collector._clean_text(text)