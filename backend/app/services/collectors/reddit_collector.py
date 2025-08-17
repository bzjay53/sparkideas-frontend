"""
Reddit Collector Module
Optimized for Vercel Serverless with PRAW connection pooling
"""

import asyncio
import time
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import structlog

from .base_collector import BaseCollector, CollectorConfig, PainPointData
from app.config.settings import settings

logger = structlog.get_logger()

class RedditCollector(BaseCollector):
    """Optimized Reddit data collector for Vercel"""
    
    def __init__(self, config: CollectorConfig = None):
        super().__init__(config)
        self._reddit_client = None
        self._client_created_at = None
        self._client_ttl = timedelta(minutes=30)  # Reuse client for 30 mins
        
        # Vercel-optimized subreddit targets
        self.subreddit_configs = {
            # High-value technical subreddits
            "primary": [
                {"name": "programming", "keywords": ["bug", "issue", "problem", "help"], "weight": 0.9},
                {"name": "webdev", "keywords": ["framework", "performance", "optimization"], "weight": 0.9},
                {"name": "startups", "keywords": ["problem", "solution", "idea", "market"], "weight": 0.8},
                {"name": "entrepreneur", "keywords": ["challenge", "difficulty", "pain"], "weight": 0.8},
            ],
            
            # Productivity and UX focused
            "secondary": [
                {"name": "productivity", "keywords": ["inefficient", "workflow", "automation"], "weight": 0.7},
                {"name": "technology", "keywords": ["frustrating", "slow", "complex"], "weight": 0.6},
                {"name": "mildlyinfuriating", "keywords": ["annoying", "irritating", "design"], "weight": 0.6},
                {"name": "firstworldproblems", "keywords": ["wish", "should", "could"], "weight": 0.5},
            ],
            
            # Localized content (Korean market focus)
            "localized": [
                {"name": "korea", "keywords": ["불편", "문제", "개선"], "weight": 0.8},
                {"name": "hanguk", "keywords": ["스타트업", "아이디어"], "weight": 0.7},
            ]
        }
    
    @property
    def collector_name(self) -> str:
        return "reddit"
    
    async def _get_reddit_client(self):
        """Get Reddit client with connection reuse for Vercel optimization"""
        try:
            # Check if we can reuse existing client
            if (self._reddit_client and 
                self._client_created_at and 
                datetime.utcnow() - self._client_created_at < self._client_ttl):
                return self._reddit_client
            
            # Import PRAW only when needed (lazy loading for Vercel)
            try:
                import praw
            except ImportError:
                self.logger.error("PRAW not installed - Reddit collection disabled")
                return None
            
            # Create new client
            self._reddit_client = praw.Reddit(
                client_id=settings.reddit_client_id,
                client_secret=settings.reddit_client_secret,
                username=settings.reddit_username,
                password=settings.reddit_password,
                user_agent="IdeaSpark:v2.0:pain-point-analysis (by /u/RelationshipOne8189)",
                ratelimit_seconds=600,  # Handle rate limits gracefully
            )
            
            self._client_created_at = datetime.utcnow()
            
            # Test connection
            test_subreddit = self._reddit_client.subreddit("test")
            next(test_subreddit.hot(limit=1))  # Simple connection test
            
            self.logger.info("Reddit client initialized successfully")
            return self._reddit_client
            
        except Exception as e:
            self.logger.error("Failed to initialize Reddit client", error=str(e))
            self._reddit_client = None
            return None
    
    async def _collect_raw_data(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Collect raw data from Reddit API"""
        reddit = await self._get_reddit_client()
        if not reddit:
            return []
        
        raw_results = []
        target_subreddits = self._select_optimal_subreddits(query, limit)
        
        try:
            # Process subreddits in parallel batches for Vercel memory efficiency
            batch_size = 2 if self.config.vercel_memory_limit else len(target_subreddits)
            
            for i in range(0, len(target_subreddits), batch_size):
                batch = target_subreddits[i:i + batch_size]
                batch_tasks = [
                    self._collect_from_subreddit(reddit, config, query, limit // len(target_subreddits))
                    for config in batch
                ]
                
                batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                
                for result in batch_results:
                    if isinstance(result, list):
                        raw_results.extend(result)
                    elif isinstance(result, Exception):
                        self.logger.warning("Subreddit batch failed", error=str(result))
                
                # Memory management for Vercel
                if self.config.vercel_memory_limit and i + batch_size < len(target_subreddits):
                    await asyncio.sleep(0.1)
        
        except Exception as e:
            self.logger.error("Reddit collection failed", error=str(e))
            return []
        
        return raw_results
    
    def _select_optimal_subreddits(self, query: str, total_limit: int) -> List[Dict[str, Any]]:
        """Select most relevant subreddits based on query and limits"""
        query_lower = query.lower()
        scored_subreddits = []
        
        # Score subreddits based on query relevance
        for tier, subreddits in self.subreddit_configs.items():
            for subreddit in subreddits:
                relevance_score = 0
                
                # Check if query matches subreddit keywords
                for keyword in subreddit["keywords"]:
                    if keyword in query_lower:
                        relevance_score += 1
                
                # Apply tier and base weight
                tier_multiplier = {"primary": 1.0, "secondary": 0.8, "localized": 0.9}
                final_score = (relevance_score + 0.1) * subreddit["weight"] * tier_multiplier[tier]
                
                scored_subreddits.append({
                    **subreddit,
                    "relevance_score": final_score,
                    "tier": tier
                })
        
        # Sort by relevance and select top subreddits
        scored_subreddits.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        # Limit subreddits based on total_limit and Vercel constraints
        max_subreddits = min(6 if self.config.vercel_memory_limit else 10, 
                           max(3, total_limit // 10))
        
        return scored_subreddits[:max_subreddits]
    
    async def _collect_from_subreddit(self, reddit, subreddit_config: Dict[str, Any], 
                                    query: str, limit: int) -> List[Dict[str, Any]]:
        """Collect from a specific subreddit"""
        try:
            subreddit_name = subreddit_config["name"]
            subreddit = reddit.subreddit(subreddit_name)
            
            results = []
            
            # Multiple collection strategies for better coverage
            strategies = [
                ("hot", lambda: subreddit.hot(limit=limit)),
                ("new", lambda: subreddit.new(limit=limit // 2)) if limit > 10 else None,
                ("top", lambda: subreddit.top(time_filter="week", limit=limit // 3)) if limit > 15 else None
            ]
            
            for strategy_name, strategy_func in strategies:
                if strategy_func is None:
                    continue
                
                try:
                    submissions = strategy_func()
                    
                    for submission in submissions:
                        if self._is_relevant_submission(submission, query, subreddit_config):
                            result_data = {
                                "title": submission.title,
                                "content": submission.selftext or submission.title,
                                "source_url": f"https://reddit.com{submission.permalink}",
                                "subsource": f"{subreddit_name}-{strategy_name}",
                                "trend_score": min(submission.score / 1000, 1.0),  # Normalize Reddit score
                                "confidence": subreddit_config["weight"],
                                "timestamp": datetime.fromtimestamp(submission.created_utc),
                                "reddit_data": {
                                    "score": submission.score,
                                    "num_comments": submission.num_comments,
                                    "upvote_ratio": getattr(submission, 'upvote_ratio', 0.5),
                                    "subreddit": subreddit_name,
                                    "author": str(submission.author) if submission.author else "deleted"
                                }
                            }
                            results.append(result_data)
                            
                            # Memory limit protection
                            if len(results) >= limit:
                                break
                    
                    # Rate limiting
                    await asyncio.sleep(self.config.rate_limit_delay)
                    
                except Exception as e:
                    self.logger.warning("Strategy failed", 
                                      subreddit=subreddit_name, 
                                      strategy=strategy_name, 
                                      error=str(e))
                    continue
            
            self.logger.info("Subreddit collection completed",
                           subreddit=subreddit_name,
                           results=len(results),
                           weight=subreddit_config["weight"])
            
            return results
            
        except Exception as e:
            self.logger.error("Subreddit collection failed", 
                            subreddit=subreddit_config.get("name", "unknown"), 
                            error=str(e))
            return []
    
    def _is_relevant_submission(self, submission, query: str, subreddit_config: Dict[str, Any]) -> bool:
        """Enhanced relevance filtering"""
        try:
            # Basic filters
            if submission.is_self == False and not submission.selftext:
                return False  # Skip link posts without text
            
            if submission.score < 1:  # Skip heavily downvoted content
                return False
            
            # Content relevance check
            full_text = (submission.title + " " + (submission.selftext or "")).lower()
            
            # Check for pain point indicators
            if not self._is_pain_point_content(full_text):
                return False
            
            # Query relevance (if specific query provided)
            if query and len(query) > 3:
                query_words = query.lower().split()
                relevance_score = sum(1 for word in query_words if word in full_text)
                if relevance_score == 0 and query not in ["general", "all"]:
                    return False
            
            # Subreddit-specific keyword match
            keyword_match = any(keyword in full_text for keyword in subreddit_config["keywords"])
            
            return keyword_match or query == "general"
            
        except Exception as e:
            self.logger.warning("Relevance check failed", error=str(e))
            return False
    
    async def collect_trending_topics(self, limit: int = 50) -> List[PainPointData]:
        """Collect currently trending pain points from Reddit"""
        trending_queries = [
            "frustrating technology",
            "workflow problems", 
            "app usability issues",
            "startup challenges",
            "productivity pain points",
            "user experience problems"
        ]
        
        return await self.collect(trending_queries, limit // len(trending_queries))
    
    async def collect_by_category(self, category: str, limit: int = 30) -> List[PainPointData]:
        """Collect pain points for specific category"""
        category_queries = {
            "technology": ["programming problems", "software bugs", "app issues"],
            "business": ["startup struggles", "market problems", "customer pain"],
            "productivity": ["workflow inefficiency", "time management", "automation needs"],
            "design": ["UX problems", "interface issues", "user frustration"]
        }
        
        queries = category_queries.get(category, ["general problems"])
        return await self.collect(queries, limit // len(queries))
    
    def get_reddit_stats(self) -> Dict[str, Any]:
        """Get Reddit-specific statistics"""
        base_stats = self.get_stats()
        
        reddit_stats = {
            "client_status": "connected" if self._reddit_client else "disconnected",
            "client_age_minutes": (
                (datetime.utcnow() - self._client_created_at).total_seconds() / 60
                if self._client_created_at else 0
            ),
            "subreddit_configs": len(sum(self.subreddit_configs.values(), [])),
            "primary_subreddits": len(self.subreddit_configs["primary"]),
            "vercel_optimized": self.config.vercel_memory_limit
        }
        
        base_stats["reddit_specific"] = reddit_stats
        return base_stats