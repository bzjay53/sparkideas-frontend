"""
Naver Search API Collector Module  
Optimized for Korean market pain point discovery
"""

import asyncio
import aiohttp
from typing import List, Dict, Any, Optional
from datetime import datetime
import structlog

from .base_collector import BaseCollector, CollectorConfig, PainPointData
from .cache_manager import get_cache_manager
from app.config.settings import settings

logger = structlog.get_logger()

class NaverCollector(BaseCollector):
    """Korean market focused pain point collector using Naver APIs"""
    
    def __init__(self, config: CollectorConfig = None):
        super().__init__(config)
        self.cache_manager = get_cache_manager()
        
        # Korean pain point focused search queries
        self.korean_queries = {
            "technology": [
                "앱 불편함", "웹사이트 문제", "소프트웨어 버그", "프로그램 오류",
                "사용성 개선", "인터페이스 문제", "모바일 앱 이슈", "개발 문제"
            ],
            "business": [
                "사업 문제점", "창업 어려움", "비즈니스 고민", "마케팅 문제",
                "고객 불만", "서비스 개선", "업무 비효율", "경영 애로사항"
            ],
            "lifestyle": [
                "생활 불편", "일상 문제", "효율성 부족", "자동화 필요",
                "시간 부족", "스트레스", "불편한 서비스", "개선 필요"
            ],
            "productivity": [
                "업무 효율", "생산성 문제", "워크플로우 개선", "자동화 도구",
                "시간 관리", "업무 도구", "협업 문제", "프로세스 개선"
            ]
        }
        
        # Naver API endpoints
        self.api_endpoints = {
            "blog": "https://openapi.naver.com/v1/search/blog.json",
            "news": "https://openapi.naver.com/v1/search/news.json", 
            "cafearticle": "https://openapi.naver.com/v1/search/cafearticle.json",
            "kin": "https://openapi.naver.com/v1/search/kin.json"  # 지식iN
        }
    
    @property
    def collector_name(self) -> str:
        return "naver"
    
    async def _collect_raw_data(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Collect from multiple Naver API endpoints"""
        # Check cache first
        cached_data = await self.cache_manager.get_cached_pain_points("naver", query)
        if cached_data:
            self.logger.info("Using cached Naver data", query=query, count=len(cached_data))
            return cached_data
        
        all_results = []
        
        try:
            # Determine best queries for this search
            relevant_queries = self._select_korean_queries(query, limit)
            
            # Collect from multiple Naver services in parallel
            tasks = []
            for endpoint_name, endpoint_url in self.api_endpoints.items():
                for korean_query in relevant_queries:
                    task = self._collect_from_endpoint(
                        endpoint_name, 
                        endpoint_url, 
                        korean_query, 
                        max(2, limit // (len(self.api_endpoints) * len(relevant_queries)))
                    )
                    tasks.append(task)
            
            # Execute with controlled concurrency for Vercel
            batch_size = 4 if self.config.vercel_memory_limit else len(tasks)
            
            for i in range(0, len(tasks), batch_size):
                batch = tasks[i:i + batch_size]
                batch_results = await asyncio.gather(*batch, return_exceptions=True)
                
                for result in batch_results:
                    if isinstance(result, list):
                        all_results.extend(result)
                    elif isinstance(result, Exception):
                        self.logger.warning("Naver API batch failed", error=str(result))
                
                # Rate limiting and memory management
                if i + batch_size < len(tasks):
                    await asyncio.sleep(self.config.rate_limit_delay)
            
            # Cache results
            await self.cache_manager.cache_pain_points("naver", query, all_results, ttl_hours=4)
            
        except Exception as e:
            self.logger.error("Naver collection failed", query=query, error=str(e))
            return []
        
        return all_results
    
    def _select_korean_queries(self, base_query: str, limit: int) -> List[str]:
        """Select most relevant Korean queries based on input"""
        base_lower = base_query.lower()
        selected_queries = []
        
        # Direct Korean query if provided
        if any(ord(char) > 127 for char in base_query):  # Contains Korean characters
            selected_queries.append(base_query)
        
        # Category matching
        for category, queries in self.korean_queries.items():
            if category in base_lower or any(keyword in base_lower for keyword in 
                ["tech", "business", "life", "product"]):
                selected_queries.extend(queries[:2])  # Top 2 from each relevant category
                break
        
        # Default queries for general searches
        if not selected_queries:
            selected_queries = [
                "불편한 점", "문제점", "개선 필요", "비효율적",
                "자동화 필요", "사용하기 어려운"
            ]
        
        # Limit queries based on total limit and Vercel constraints
        max_queries = min(6 if self.config.vercel_memory_limit else 8, 
                         max(2, limit // 5))
        
        return selected_queries[:max_queries]
    
    async def _collect_from_endpoint(self, endpoint_name: str, endpoint_url: str, 
                                   query: str, limit: int) -> List[Dict[str, Any]]:
        """Collect from specific Naver API endpoint"""
        try:
            # Check API response cache
            cache_params = {"endpoint": endpoint_name, "query": query, "limit": limit}
            cached_response = await self.cache_manager.get_cached_api_response(
                "naver", endpoint_name, cache_params
            )
            
            if cached_response:
                self._stats["cache_hits"] += 1
                return self._process_naver_response(cached_response, endpoint_name)
            
            # Make API request
            headers = {
                "X-Naver-Client-Id": settings.naver_client_id,
                "X-Naver-Client-Secret": settings.naver_client_secret,
                "User-Agent": "IdeaSpark-v2.0-PainPointAnalysis"
            }
            
            params = {
                "query": query,
                "display": min(20, limit),  # Naver API limit
                "start": 1,
                "sort": "sim"  # Similarity sort for relevance
            }
            
            # Special params for specific endpoints
            if endpoint_name == "news":
                params["sort"] = "date"  # Recent news
            elif endpoint_name == "kin":
                params["sort"] = "count"  # Popular Q&A
            
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.config.timeout_seconds)) as session:
                async with session.get(endpoint_url, headers=headers, params=params) as response:
                    self._stats["api_calls"] += 1
                    
                    if response.status == 200:
                        response_data = await response.json()
                        
                        # Cache the raw response
                        await self.cache_manager.cache_api_response(
                            "naver", endpoint_name, cache_params, response_data, ttl_hours=2
                        )
                        
                        return self._process_naver_response(response_data, endpoint_name)
                    
                    elif response.status == 429:  # Rate limit
                        self.logger.warning("Naver API rate limit", endpoint=endpoint_name)
                        await asyncio.sleep(self.config.rate_limit_delay * 2)
                        return []
                    
                    else:
                        self.logger.error("Naver API error", 
                                        endpoint=endpoint_name, 
                                        status=response.status,
                                        query=query)
                        return []
        
        except asyncio.TimeoutError:
            self.logger.warning("Naver API timeout", endpoint=endpoint_name, query=query)
            return []
        except Exception as e:
            self.logger.error("Naver endpoint failed", 
                            endpoint=endpoint_name, 
                            query=query, 
                            error=str(e))
            return []
    
    def _process_naver_response(self, response_data: Dict[str, Any], 
                              endpoint_name: str) -> List[Dict[str, Any]]:
        """Process Naver API response into standardized format"""
        results = []
        items = response_data.get('items', [])
        
        for item in items:
            try:
                # Clean HTML tags from Naver responses
                title = self._clean_html(item.get('title', ''))
                description = self._clean_html(item.get('description', ''))
                
                # Skip if no meaningful content
                if not title and not description:
                    continue
                
                # Calculate confidence based on endpoint type
                confidence_map = {
                    "blog": 0.7,      # High relevance, personal experiences
                    "kin": 0.8,       # Very high relevance, direct Q&A
                    "news": 0.6,      # Medium relevance, general reporting
                    "cafearticle": 0.7 # High relevance, community discussions
                }
                
                result_data = {
                    "title": title,
                    "content": description or title,
                    "source_url": item.get('link', ''),
                    "subsource": f"naver-{endpoint_name}",
                    "confidence": confidence_map.get(endpoint_name, 0.5),
                    "timestamp": self._parse_naver_date(item.get('pubDate', '')),
                    "naver_data": {
                        "endpoint": endpoint_name,
                        "bloggername": item.get('bloggername', ''),
                        "bloggerlink": item.get('bloggerlink', ''),
                        "cafe_name": item.get('cafename', ''),
                        "cafe_url": item.get('cafeurl', '')
                    }
                }
                
                # Additional scoring for Korean content
                full_text = title + " " + description
                if self._has_pain_indicators_korean(full_text):
                    result_data["confidence"] += 0.1  # Boost for pain indicators
                
                results.append(result_data)
                
            except Exception as e:
                self.logger.warning("Failed to process Naver item", 
                                  endpoint=endpoint_name, 
                                  error=str(e))
                continue
        
        self.logger.info("Processed Naver response", 
                        endpoint=endpoint_name, 
                        total_items=len(items),
                        processed_items=len(results))
        
        return results
    
    def _has_pain_indicators_korean(self, text: str) -> bool:
        """Check for Korean-specific pain point indicators"""
        korean_pain_indicators = [
            "불편", "문제", "어려움", "힘들", "짜증", "스트레스",
            "비효율", "느림", "복잡", "어렵", "안되", "막힘",
            "고민", "걱정", "답답", "귀찮", "번거롭", "불만",
            "개선", "필요", "바꿔", "고쳐", "해결", "도움"
        ]
        
        text_lower = text.lower()
        return any(indicator in text_lower for indicator in korean_pain_indicators)
    
    def _parse_naver_date(self, date_string: str) -> Optional[datetime]:
        """Parse Naver API date format"""
        if not date_string:
            return None
        
        try:
            # Naver uses RFC 2822 format: "Mon, 01 Jan 2024 00:00:00 +0900"
            from email.utils import parsedate_to_datetime
            return parsedate_to_datetime(date_string)
        except Exception:
            try:
                # Fallback to ISO format
                return datetime.fromisoformat(date_string.replace('Z', '+00:00'))
            except Exception:
                return None
    
    def _clean_html(self, text: str) -> str:
        """Enhanced HTML cleaning for Naver content"""
        if not text:
            return ""
        
        import re
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove Naver-specific artifacts
        text = re.sub(r'&[a-zA-Z]+;', '', text)  # HTML entities
        text = re.sub(r'\s+', ' ', text)  # Multiple spaces
        
        # Remove URLs and email addresses
        text = re.sub(r'http[s]?://\S+', '', text)
        text = re.sub(r'\S+@\S+\.\S+', '', text)
        
        return text.strip()
    
    async def collect_korean_trending(self, limit: int = 50) -> List[PainPointData]:
        """Collect trending Korean pain points"""
        trending_queries = [
            "최근 불편한 점", "요즘 문제", "개선 필요한 서비스",
            "사용하기 어려운", "비효율적인 시스템", "자동화가 필요한"
        ]
        
        return await self.collect(trending_queries, limit // len(trending_queries))
    
    async def collect_by_korean_category(self, category: str, limit: int = 30) -> List[PainPointData]:
        """Collect by Korean-specific categories"""
        if category in self.korean_queries:
            queries = self.korean_queries[category][:4]  # Top 4 queries
            return await self.collect(queries, limit // len(queries))
        
        return []
    
    def get_naver_stats(self) -> Dict[str, Any]:
        """Get Naver-specific statistics"""
        base_stats = self.get_stats()
        
        naver_stats = {
            "api_endpoints": list(self.api_endpoints.keys()),
            "korean_query_categories": list(self.korean_queries.keys()),
            "total_korean_queries": sum(len(queries) for queries in self.korean_queries.values()),
            "cache_hit_rate": (
                self._stats["cache_hits"] / max(self._stats["api_calls"], 1) * 100
                if self._stats["api_calls"] > 0 else 0
            )
        }
        
        base_stats["naver_specific"] = naver_stats
        return base_stats