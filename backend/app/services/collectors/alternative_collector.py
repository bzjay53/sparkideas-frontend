"""
Alternative Search Collector Module
Multi-source pain point discovery without Google dependency
"""

import asyncio
import aiohttp
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import structlog

from .base_collector import BaseCollector, CollectorConfig, PainPointData
from .cache_manager import get_cache_manager

logger = structlog.get_logger()

class AlternativeCollector(BaseCollector):
    """Multi-source alternative search collector"""
    
    def __init__(self, config: CollectorConfig = None):
        super().__init__(config)
        self.cache_manager = get_cache_manager()
        
        # Source configurations with quality weights
        self.source_configs = {
            "hackernews": {
                "weight": 0.9,
                "base_url": "https://hn.algolia.com/api/v1/search",
                "rate_limit": 1.0,
                "quality_threshold": 5  # Minimum points
            },
            "github": {
                "weight": 0.8,
                "base_url": "https://api.github.com/search/issues",
                "rate_limit": 2.0,  # GitHub has stricter limits
                "quality_threshold": 2  # Minimum interactions
            },
            "reddit_direct": {
                "weight": 0.7,
                "base_url": "https://www.reddit.com/r/{subreddit}/search.json",
                "rate_limit": 1.5,
                "quality_threshold": 1  # Minimum score
            },
            "stackoverflow": {
                "weight": 0.85,
                "base_url": "https://api.stackexchange.com/2.3/search/advanced",
                "rate_limit": 2.0,
                "quality_threshold": 0  # All questions welcome
            }
        }
        
        # Specialized query patterns for different pain point types
        self.query_patterns = {
            "technical": [
                "{query} problem issue bug",
                "{query} frustrating difficult",
                "{query} needs improvement broken",
                "{query} inefficient slow"
            ],
            "business": [
                "{query} market gap opportunity",
                "{query} customer pain problem",
                "{query} business challenge",
                "{query} startup idea validation"
            ],
            "productivity": [
                "{query} workflow inefficient",
                "{query} automation needed",
                "{query} time consuming manual",
                "{query} productivity blocker"
            ]
        }
    
    @property
    def collector_name(self) -> str:
        return "alternative"
    
    async def _collect_raw_data(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Collect from multiple alternative sources"""
        # Check cache first
        cached_data = await self.cache_manager.get_cached_pain_points("alternative", query)
        if cached_data:
            self.logger.info("Using cached alternative data", query=query, count=len(cached_data))
            return cached_data
        
        all_results = []
        
        try:
            # Generate enhanced query patterns
            enhanced_queries = self._generate_enhanced_queries(query)
            
            # Collect from each source
            source_tasks = []
            for source_name, source_config in self.source_configs.items():
                task = self._collect_from_source(source_name, enhanced_queries, 
                                               limit // len(self.source_configs))
                source_tasks.append(task)
            
            # Execute with controlled concurrency
            if self.config.vercel_memory_limit:
                # Process sources sequentially for Vercel memory limits
                for task in source_tasks:
                    try:
                        result = await task
                        if isinstance(result, list):
                            all_results.extend(result)
                    except Exception as e:
                        self.logger.warning("Source collection failed", error=str(e))
            else:
                # Process sources in parallel
                source_results = await asyncio.gather(*source_tasks, return_exceptions=True)
                for result in source_results:
                    if isinstance(result, list):
                        all_results.extend(result)
                    elif isinstance(result, Exception):
                        self.logger.warning("Source collection failed", error=str(result))
            
            # Apply advanced filtering and scoring
            filtered_results = self._apply_advanced_filtering(all_results)
            
            # Cache results
            await self.cache_manager.cache_pain_points("alternative", query, filtered_results, ttl_hours=6)
            
            return filtered_results
            
        except Exception as e:
            self.logger.error("Alternative collection failed", query=query, error=str(e))
            return []
    
    def _generate_enhanced_queries(self, base_query: str) -> List[str]:
        """Generate enhanced queries with pain point focus"""
        enhanced_queries = [base_query]  # Original query
        
        # Determine query category
        base_lower = base_query.lower()
        if any(tech_word in base_lower for tech_word in ["code", "software", "app", "tech", "programming"]):
            category = "technical"
        elif any(biz_word in base_lower for biz_word in ["business", "market", "startup", "customer"]):
            category = "business"
        elif any(prod_word in base_lower for prod_word in ["workflow", "process", "productivity", "efficiency"]):
            category = "productivity"
        else:
            category = "technical"  # Default
        
        # Add category-specific patterns
        patterns = self.query_patterns[category]
        for pattern in patterns[:2]:  # Limit to prevent API overuse
            enhanced_queries.append(pattern.format(query=base_query))
        
        return enhanced_queries
    
    async def _collect_from_source(self, source_name: str, queries: List[str], limit: int) -> List[Dict[str, Any]]:
        """Collect from specific alternative source"""
        source_config = self.source_configs[source_name]
        results = []
        
        try:
            for query in queries:
                # Check cache for this specific source-query combination
                cache_params = {"source": source_name, "query": query}
                cached = await self.cache_manager.get_cached_api_response("alternative", source_name, cache_params)
                
                if cached:
                    self._stats["cache_hits"] += 1
                    processed = self._process_source_response(cached, source_name)
                    results.extend(processed)
                    continue
                
                # Collect from source
                if source_name == "hackernews":
                    source_results = await self._collect_hackernews(query, limit // len(queries))
                elif source_name == "github":
                    source_results = await self._collect_github(query, limit // len(queries))
                elif source_name == "reddit_direct":
                    source_results = await self._collect_reddit_direct(query, limit // len(queries))
                elif source_name == "stackoverflow":
                    source_results = await self._collect_stackoverflow(query, limit // len(queries))
                else:
                    continue
                
                # Cache and process results
                if source_results:
                    await self.cache_manager.cache_api_response("alternative", source_name, cache_params, source_results)
                    processed = self._process_source_response(source_results, source_name)
                    results.extend(processed)
                
                # Rate limiting
                await asyncio.sleep(source_config["rate_limit"])
                
                if len(results) >= limit:
                    break
        
        except Exception as e:
            self.logger.error("Source collection failed", source=source_name, error=str(e))
        
        return results[:limit]
    
    async def _collect_hackernews(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Collect from Hacker News"""
        try:
            params = {
                "query": f"{query} problem pain point frustrated",
                "tags": "story",
                "hitsPerPage": min(50, limit),
                "numericFilters": "points>5"  # Quality filter
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.source_configs["hackernews"]["base_url"], params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        self._stats["api_calls"] += 1
                        return data.get('hits', [])
        
        except Exception as e:
            self.logger.error("HackerNews collection failed", error=str(e))
        
        return []
    
    async def _collect_github(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Collect from GitHub Issues"""
        try:
            params = {
                "q": f"{query} problem issue bug frustrating in:title,body",
                "sort": "interactions",
                "order": "desc",
                "per_page": min(30, limit)
            }
            
            headers = {"Accept": "application/vnd.github.v3+json"}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.source_configs["github"]["base_url"], 
                                     params=params, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        self._stats["api_calls"] += 1
                        return data.get('items', [])
                    elif response.status == 403:  # Rate limit
                        self.logger.warning("GitHub API rate limit exceeded")
                        await asyncio.sleep(60)  # Wait 1 minute
        
        except Exception as e:
            self.logger.error("GitHub collection failed", error=str(e))
        
        return []
    
    async def _collect_reddit_direct(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Collect from Reddit using direct API"""
        try:
            subreddits = ["mildlyinfuriating", "firstworldproblems", "productivity", "technology"]
            all_results = []
            
            headers = {"User-Agent": "IdeaSpark:v2.0 (pain point analysis)"} 
            
            async with aiohttp.ClientSession() as session:
                for subreddit in subreddits:
                    url = f"https://www.reddit.com/r/{subreddit}/search.json"
                    params = {
                        "q": f"{query} problem issue frustrating",
                        "restrict_sr": "true",
                        "sort": "relevance",
                        "limit": min(25, limit // len(subreddits))
                    }
                    
                    async with session.get(url, params=params, headers=headers) as response:
                        if response.status == 200:
                            data = await response.json()
                            posts = data.get('data', {}).get('children', [])
                            all_results.extend([post.get('data', {}) for post in posts])
                            self._stats["api_calls"] += 1
                        
                        await asyncio.sleep(1)  # Reddit rate limiting
            
            return all_results
        
        except Exception as e:
            self.logger.error("Reddit direct collection failed", error=str(e))
        
        return []
    
    async def _collect_stackoverflow(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Collect from Stack Overflow"""
        try:
            params = {
                "q": f"{query} problem issue",
                "order": "desc",
                "sort": "votes",
                "site": "stackoverflow",
                "pagesize": min(30, limit),
                "filter": "withbody"  # Include question body
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(self.source_configs["stackoverflow"]["base_url"], params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        self._stats["api_calls"] += 1
                        return data.get('items', [])
        
        except Exception as e:
            self.logger.error("StackOverflow collection failed", error=str(e))
        
        return []
    
    def _process_source_response(self, raw_data: List[Dict[str, Any]], source_name: str) -> List[Dict[str, Any]]:
        """Process raw source data into standardized format"""
        results = []
        
        for item in raw_data:
            try:
                if source_name == "hackernews":
                    result = self._process_hackernews_item(item)
                elif source_name == "github":
                    result = self._process_github_item(item)
                elif source_name == "reddit_direct":
                    result = self._process_reddit_item(item)
                elif source_name == "stackoverflow":
                    result = self._process_stackoverflow_item(item)
                else:
                    continue
                
                if result:
                    results.append(result)
            
            except Exception as e:
                self.logger.warning("Failed to process item", source=source_name, error=str(e))
                continue
        
        return results
    
    def _process_hackernews_item(self, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process HackerNews item"""
        if item.get('points', 0) < self.source_configs["hackernews"]["quality_threshold"]:
            return None
        
        return {
            "title": item.get('title', ''),
            "content": item.get('story_text', '') or item.get('title', ''),
            "source_url": f"https://news.ycombinator.com/item?id={item.get('objectID')}",
            "subsource": "hackernews",
            "confidence": self.source_configs["hackernews"]["weight"],
            "trend_score": min(item.get('points', 0) / 100, 1.0),
            "timestamp": datetime.fromisoformat(item.get('created_at', '').replace('Z', '+00:00')) if item.get('created_at') else None
        }
    
    def _process_github_item(self, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process GitHub issue"""
        interactions = item.get('comments', 0) + item.get('reactions', {}).get('total_count', 0)
        if interactions < self.source_configs["github"]["quality_threshold"]:
            return None
        
        return {
            "title": item.get('title', ''),
            "content": (item.get('body', '') or '')[:500],
            "source_url": item.get('html_url', ''),
            "subsource": "github",
            "confidence": self.source_configs["github"]["weight"],
            "trend_score": min(interactions / 50, 1.0),
            "timestamp": datetime.fromisoformat(item.get('created_at', '').replace('Z', '+00:00')) if item.get('created_at') else None
        }
    
    def _process_reddit_item(self, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process Reddit post"""
        if item.get('score', 0) < self.source_configs["reddit_direct"]["quality_threshold"]:
            return None
        
        return {
            "title": item.get('title', ''),
            "content": item.get('selftext', '') or item.get('title', ''),
            "source_url": f"https://reddit.com{item.get('permalink', '')}",
            "subsource": f"reddit-{item.get('subreddit', 'unknown')}",
            "confidence": self.source_configs["reddit_direct"]["weight"],
            "trend_score": min(item.get('score', 0) / 1000, 1.0),
            "timestamp": datetime.fromtimestamp(item.get('created_utc', 0)) if item.get('created_utc') else None
        }
    
    def _process_stackoverflow_item(self, item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process StackOverflow question"""
        return {
            "title": item.get('title', ''),
            "content": (item.get('body', '') or '')[:500],
            "source_url": item.get('link', ''),
            "subsource": "stackoverflow",
            "confidence": self.source_configs["stackoverflow"]["weight"],
            "trend_score": min(item.get('score', 0) / 20, 1.0),
            "timestamp": datetime.fromtimestamp(item.get('creation_date', 0)) if item.get('creation_date') else None
        }
    
    def _apply_advanced_filtering(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply advanced filtering and deduplication"""
        # Remove duplicates by content similarity
        unique_results = []
        seen_hashes = set()
        
        for result in results:
            content_hash = self.cache_manager.generate_content_hash(
                result.get('title', ''),
                result.get('content', ''),
                result.get('source_url', '')
            )
            
            if content_hash not in seen_hashes:
                seen_hashes.add(content_hash)
                unique_results.append(result)
        
        # Sort by confidence and trend score
        unique_results.sort(
            key=lambda x: (x.get('confidence', 0) + x.get('trend_score', 0)) / 2,
            reverse=True
        )
        
        self.logger.info("Applied advanced filtering",
                        original_count=len(results),
                        unique_count=len(unique_results))
        
        return unique_results
    
    async def collect_trending_alternative(self, limit: int = 50) -> List[PainPointData]:
        """Collect trending pain points from alternative sources"""
        trending_queries = [
            "user experience problems",
            "software usability issues", 
            "workflow inefficiencies",
            "automation opportunities",
            "productivity bottlenecks"
        ]
        
        return await self.collect(trending_queries, limit // len(trending_queries))
    
    def get_alternative_stats(self) -> Dict[str, Any]:
        """Get alternative collector statistics"""
        base_stats = self.get_stats()
        
        alternative_stats = {
            "sources": list(self.source_configs.keys()),
            "total_source_configs": len(self.source_configs),
            "query_pattern_categories": list(self.query_patterns.keys()),
            "average_source_weight": sum(config["weight"] for config in self.source_configs.values()) / len(self.source_configs)
        }
        
        base_stats["alternative_specific"] = alternative_stats
        return base_stats