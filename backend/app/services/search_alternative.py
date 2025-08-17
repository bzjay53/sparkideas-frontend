"""
Alternative Search Service
Provides search functionality without relying on Google Custom Search
"""

import asyncio
import aiohttp
import json
from typing import List, Dict, Any
from datetime import datetime
import structlog

logger = structlog.get_logger()

class AlternativeSearchService:
    """Alternative search methods for pain point discovery"""
    
    @classmethod
    async def search_multiple_sources(cls, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search across multiple sources simultaneously"""
        
        tasks = [
            cls.search_hackernews(query, limit//3),
            cls.search_reddit_direct(query, limit//3),
            cls.search_github_issues(query, limit//3)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        combined_results = []
        for result in results:
            if isinstance(result, list):
                combined_results.extend(result)
        
        # Sort by relevance and return top results
        combined_results.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        return combined_results[:limit]
    
    @classmethod
    async def search_hackernews(cls, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search Hacker News for pain points"""
        try:
            async with aiohttp.ClientSession() as session:
                # Use HN Algolia Search API
                url = "https://hn.algolia.com/api/v1/search"
                params = {
                    "query": f"{query} problem pain point frustrated",
                    "tags": "story",
                    "hitsPerPage": limit,
                    "numericFilters": "points>5"  # Quality filter
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        results = []
                        
                        for hit in data.get('hits', []):
                            results.append({
                                "title": hit.get('title', ''),
                                "content": hit.get('story_text', '') or hit.get('title', ''),
                                "source": "hackernews",
                                "source_url": f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                                "relevance_score": hit.get('points', 0) / 100,  # Normalize
                                "timestamp": hit.get('created_at', ''),
                                "category": "technology"
                            })
                        
                        logger.info("HackerNews search completed", results=len(results))
                        return results
                        
        except Exception as e:
            logger.error("HackerNews search failed", error=str(e))
            return []
    
    @classmethod 
    async def search_reddit_direct(cls, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search Reddit using direct API (no PRAW needed)"""
        try:
            async with aiohttp.ClientSession() as session:
                # Use Reddit's JSON API
                subreddits = ["mildlyinfuriating", "firstworldproblems", "productivity"]
                results = []
                
                for subreddit in subreddits:
                    url = f"https://www.reddit.com/r/{subreddit}/search.json"
                    params = {
                        "q": f"{query} problem issue frustrating",
                        "restrict_sr": "true",
                        "sort": "relevance",
                        "limit": limit // len(subreddits)
                    }
                    
                    headers = {"User-Agent": "IdeaSpark:v2.0 (pain point analysis)"}
                    
                    async with session.get(url, params=params, headers=headers) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            for post in data.get('data', {}).get('children', []):
                                post_data = post.get('data', {})
                                results.append({
                                    "title": post_data.get('title', ''),
                                    "content": post_data.get('selftext', '') or post_data.get('title', ''),
                                    "source": f"reddit-{subreddit}",
                                    "source_url": f"https://reddit.com{post_data.get('permalink', '')}",
                                    "relevance_score": post_data.get('score', 0) / 1000,  # Normalize
                                    "timestamp": datetime.fromtimestamp(post_data.get('created_utc', 0)).isoformat(),
                                    "category": "general"
                                })
                
                logger.info("Reddit direct search completed", results=len(results))
                return results
                
        except Exception as e:
            logger.error("Reddit direct search failed", error=str(e))
            return []
    
    @classmethod
    async def search_github_issues(cls, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search GitHub issues for pain points"""
        try:
            async with aiohttp.ClientSession() as session:
                # Use GitHub Search API
                url = "https://api.github.com/search/issues"
                params = {
                    "q": f"{query} problem issue bug frustrating in:title,body",
                    "sort": "interactions",
                    "order": "desc",
                    "per_page": limit
                }
                
                headers = {"Accept": "application/vnd.github.v3+json"}
                
                async with session.get(url, params=params, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        results = []
                        
                        for issue in data.get('items', []):
                            results.append({
                                "title": issue.get('title', ''),
                                "content": (issue.get('body', '') or '')[:500],  # Limit content
                                "source": "github",
                                "source_url": issue.get('html_url', ''),
                                "relevance_score": (issue.get('comments', 0) + issue.get('reactions', {}).get('total_count', 0)) / 100,
                                "timestamp": issue.get('created_at', ''),
                                "category": "development"
                            })
                        
                        logger.info("GitHub search completed", results=len(results))
                        return results
                        
        except Exception as e:
            logger.error("GitHub search failed", error=str(e))
            return []
    
    @classmethod
    async def search_product_hunt_discussions(cls, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search Product Hunt for product pain points"""
        try:
            # Product Hunt doesn't have a public API, but we can search for product problems
            # This is a placeholder for future implementation
            return []
        except Exception as e:
            logger.error("Product Hunt search failed", error=str(e))
            return []
    
    @classmethod
    def validate_search_results(cls, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate and score search results"""
        pain_keywords = [
            "problem", "issue", "bug", "frustrating", "annoying", "difficult",
            "pain", "struggle", "challenge", "obstacle", "inefficient", "slow",
            "문제", "불편", "어려움", "힘들", "짜증", "비효율"
        ]
        
        validated_results = []
        
        for result in results:
            text = (result.get('title', '') + ' ' + result.get('content', '')).lower()
            
            # Calculate pain point score
            pain_score = sum(1 for keyword in pain_keywords if keyword in text)
            
            if pain_score > 0:  # Only include results with pain point keywords
                result['pain_point_score'] = pain_score
                result['confidence'] = min(pain_score / 3, 1.0)  # Normalize to 0-1
                validated_results.append(result)
        
        # Sort by pain point score
        validated_results.sort(key=lambda x: x.get('pain_point_score', 0), reverse=True)
        
        return validated_results

# Integration with existing data collector
class GoogleSearchAlternative:
    """Drop-in replacement for Google Search functionality"""
    
    @classmethod
    async def collect_search_data(cls, queries: List[str], limit_per_query: int = 10) -> List[Dict[str, Any]]:
        """Collect search data using alternative sources"""
        all_results = []
        
        for query in queries:
            results = await AlternativeSearchService.search_multiple_sources(query, limit_per_query)
            validated_results = AlternativeSearchService.validate_search_results(results)
            all_results.extend(validated_results)
        
        logger.info("Alternative search completed", 
                   total_results=len(all_results),
                   queries=len(queries))
        
        return all_results