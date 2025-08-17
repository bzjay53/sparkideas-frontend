"""
Base Collector Class
Vercel-optimized foundation for all data collectors
"""

import asyncio
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Set
from datetime import datetime, timedelta
import structlog
import hashlib
import json

logger = structlog.get_logger()

@dataclass
class CollectorConfig:
    """Configuration for data collectors"""
    max_concurrent: int = 5
    timeout_seconds: int = 30
    retry_attempts: int = 3
    cache_ttl_hours: int = 6
    max_content_length: int = 5000
    min_quality_score: float = 0.3
    rate_limit_delay: float = 1.0
    vercel_memory_limit: bool = True  # Optimize for Vercel 1GB limit

@dataclass 
class PainPointData:
    """Standardized pain point data structure"""
    title: str
    content: str
    source: str
    source_url: str
    sentiment_score: float = 0.0
    trend_score: float = 0.5
    keywords: List[str] = field(default_factory=list)
    category: str = "general"
    confidence: float = 0.5
    timestamp: Optional[datetime] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.utcnow()
    
    @property
    def content_hash(self) -> str:
        """Generate unique hash for deduplication"""
        content_str = f"{self.title[:100]}{self.source}{self.source_url}"
        return hashlib.md5(content_str.encode()).hexdigest()
    
    @property
    def quality_score(self) -> float:
        """Calculate overall quality score"""
        # Basic quality metrics
        title_score = min(len(self.title) / 50, 1.0)  # Good titles are descriptive
        content_score = min(len(self.content) / 200, 1.0)  # Substantial content
        keyword_score = min(len(self.keywords) / 5, 1.0)  # Rich keyword set
        
        # Weight the scores
        return (title_score * 0.3 + content_score * 0.4 + 
                keyword_score * 0.2 + self.confidence * 0.1)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage"""
        return {
            "title": self.title[:500],  # DB limit
            "content": self.content[:5000],  # DB limit
            "source": self.source,
            "source_url": self.source_url,
            "sentiment_score": self.sentiment_score,
            "trend_score": self.trend_score,
            "keywords": self.keywords[:10],  # Limit keywords
            "category": self.category,
            "confidence": self.confidence,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "quality_score": self.quality_score,
            "content_hash": self.content_hash
        }

class BaseCollector(ABC):
    """Abstract base class for all data collectors"""
    
    def __init__(self, config: CollectorConfig = None):
        self.config = config or CollectorConfig()
        self.logger = structlog.get_logger().bind(collector=self.__class__.__name__)
        self._seen_hashes: Set[str] = set()
        self._stats = {
            "total_processed": 0,
            "duplicates_filtered": 0,
            "quality_filtered": 0,
            "api_calls": 0,
            "cache_hits": 0,
            "errors": []
        }
    
    @property
    @abstractmethod
    def collector_name(self) -> str:
        """Unique name for this collector"""
        pass
    
    @abstractmethod
    async def _collect_raw_data(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Collect raw data from the source"""
        pass
    
    async def collect(self, queries: List[str], limit_per_query: int = 10) -> List[PainPointData]:
        """Main collection method with error handling and optimization"""
        start_time = time.time()
        all_results = []
        
        try:
            # Vercel memory optimization: Process queries in batches
            batch_size = 3 if self.config.vercel_memory_limit else len(queries)
            
            for i in range(0, len(queries), batch_size):
                batch_queries = queries[i:i + batch_size]
                batch_tasks = [
                    self._collect_single_query(query, limit_per_query)
                    for query in batch_queries
                ]
                
                batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                
                for result in batch_results:
                    if isinstance(result, Exception):
                        self.logger.error("Query batch failed", error=str(result))
                        self._stats["errors"].append(str(result))
                    elif isinstance(result, list):
                        all_results.extend(result)
                
                # Memory cleanup for Vercel
                if self.config.vercel_memory_limit:
                    await asyncio.sleep(0.1)  # Allow garbage collection
        
        except Exception as e:
            self.logger.error("Collection failed", error=str(e))
            self._stats["errors"].append(str(e))
        
        execution_time = time.time() - start_time
        
        # Log performance metrics
        self.logger.info("Collection completed",
                        collector=self.collector_name,
                        total_results=len(all_results),
                        execution_time=execution_time,
                        stats=self._stats)
        
        return all_results
    
    async def _collect_single_query(self, query: str, limit: int) -> List[PainPointData]:
        """Collect data for a single query with retries"""
        for attempt in range(self.config.retry_attempts):
            try:
                raw_data = await asyncio.wait_for(
                    self._collect_raw_data(query, limit),
                    timeout=self.config.timeout_seconds
                )
                
                # Process and validate results
                processed_results = []
                for item in raw_data:
                    pain_point = self._process_raw_item(item)
                    if pain_point and self._should_include(pain_point):
                        processed_results.append(pain_point)
                
                self._stats["total_processed"] += len(raw_data)
                self._stats["api_calls"] += 1
                
                return processed_results
                
            except asyncio.TimeoutError:
                self.logger.warning("Query timeout", query=query, attempt=attempt + 1)
                if attempt == self.config.retry_attempts - 1:
                    self._stats["errors"].append(f"Timeout for query: {query}")
            except Exception as e:
                self.logger.error("Query failed", query=query, attempt=attempt + 1, error=str(e))
                if attempt == self.config.retry_attempts - 1:
                    self._stats["errors"].append(f"Failed query {query}: {str(e)}")
            
            # Exponential backoff
            await asyncio.sleep(self.config.rate_limit_delay * (2 ** attempt))
        
        return []
    
    def _process_raw_item(self, item: Dict[str, Any]) -> Optional[PainPointData]:
        """Process raw API response into PainPointData"""
        try:
            # Extract and clean data
            title = self._clean_text(item.get('title', ''))
            content = self._clean_text(item.get('content', '') or item.get('description', ''))
            
            if not title and not content:
                return None
            
            # Create pain point data
            pain_point = PainPointData(
                title=title,
                content=content,
                source=f"{self.collector_name}-{item.get('subsource', 'main')}",
                source_url=item.get('source_url', ''),
                sentiment_score=item.get('sentiment_score', 0.0),
                trend_score=item.get('trend_score', 0.5),
                keywords=self._extract_keywords(title + " " + content),
                category=self._categorize_content(title + " " + content),
                confidence=item.get('confidence', 0.5)
            )
            
            return pain_point
            
        except Exception as e:
            self.logger.error("Failed to process item", error=str(e), item_keys=list(item.keys()))
            return None
    
    def _should_include(self, pain_point: PainPointData) -> bool:
        """Determine if pain point should be included"""
        # Check for duplicates
        if pain_point.content_hash in self._seen_hashes:
            self._stats["duplicates_filtered"] += 1
            return False
        
        # Check quality threshold
        if pain_point.quality_score < self.config.min_quality_score:
            self._stats["quality_filtered"] += 1
            return False
        
        # Check if it's actually a pain point
        if not self._is_pain_point_content(pain_point.title + " " + pain_point.content):
            self._stats["quality_filtered"] += 1
            return False
        
        self._seen_hashes.add(pain_point.content_hash)
        return True
    
    def _is_pain_point_content(self, text: str) -> bool:
        """Enhanced pain point detection"""
        pain_keywords = [
            # English
            "problem", "issue", "bug", "error", "fail", "broken", "difficult", 
            "hard", "struggle", "challenge", "frustrating", "annoying", "pain",
            "inefficient", "slow", "complex", "confusing", "needs improvement",
            "could be better", "wish there was", "if only", "why doesn't",
            
            # Korean  
            "문제", "불편", "어려움", "힘들", "짜증", "비효율", "개선", "필요",
            "불만", "고민", "걱정", "스트레스", "복잡", "느림", "어렵"
        ]
        
        # Negative keywords that indicate it's NOT a pain point
        exclude_keywords = [
            "solution", "solved", "fixed", "working", "success", "great", "awesome",
            "해결", "성공", "좋은", "훌륭", "완벽"
        ]
        
        text_lower = text.lower()
        
        # Check for pain point indicators
        pain_score = sum(1 for keyword in pain_keywords if keyword in text_lower)
        exclude_score = sum(1 for keyword in exclude_keywords if keyword in text_lower)
        
        return pain_score > exclude_score and pain_score > 0
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Enhanced keyword extraction"""
        import re
        
        # Remove special characters and split
        words = re.findall(r'\b\w{3,}\b', text.lower())  # Min 3 chars
        
        # Enhanced stop words
        stop_words = {
            # English
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "by", "is", "are", "was", "were", "be", "been", "have",
            "has", "had", "do", "does", "did", "will", "would", "could", "should",
            "this", "that", "these", "those", "they", "them", "their", "there",
            "when", "where", "why", "how", "what", "who", "which", "can", "may",
            
            # Korean 
            "그", "이", "저", "것", "들", "는", "은", "을", "를", "이", "가", "에", 
            "의", "로", "으로", "에서", "까지", "부터", "하는", "하지", "되는", "있는"
        }
        
        # Filter and deduplicate
        keywords = []
        seen = set()
        for word in words:
            if (word not in stop_words and 
                word not in seen and 
                len(word) > 2):
                keywords.append(word)
                seen.add(word)
                
                if len(keywords) >= 10:  # Limit keywords
                    break
        
        return keywords
    
    def _categorize_content(self, text: str) -> str:
        """Enhanced content categorization"""
        text_lower = text.lower()
        
        categories = {
            "technology": ["tech", "programming", "software", "app", "website", "api", "bug", "code", 
                          "개발", "프로그래밍", "소프트웨어", "앱", "웹사이트", "기술"],
            "business": ["business", "startup", "entrepreneur", "market", "customer", "revenue",
                        "비즈니스", "사업", "창업", "기업", "고객", "매출"],
            "productivity": ["productivity", "efficient", "workflow", "process", "automation", "time",
                           "생산성", "효율", "업무", "프로세스", "자동화", "시간"],
            "healthcare": ["health", "medical", "fitness", "wellness", "hospital", "doctor",
                         "건강", "의료", "병원", "의사", "치료"],
            "education": ["education", "learning", "school", "university", "student", "teacher",
                        "교육", "학습", "학교", "대학", "학생", "선생님"],
            "finance": ["money", "finance", "bank", "payment", "investment", "cost", "price",
                       "돈", "금융", "은행", "결제", "투자", "비용"],
            "communication": ["communication", "social", "chat", "message", "email", "call",
                            "소통", "소셜", "채팅", "메시지", "이메일", "전화"]
        }
        
        # Score each category
        category_scores = {}
        for category, keywords in categories.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                category_scores[category] = score
        
        # Return highest scoring category or 'general'
        if category_scores:
            return max(category_scores.items(), key=lambda x: x[1])[0]
        
        return "general"
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        
        import re
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove excessive whitespace
        text = ' '.join(text.split())
        
        # Remove URLs (keep readable text)
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Limit length for memory efficiency
        if len(text) > self.config.max_content_length:
            text = text[:self.config.max_content_length] + "..."
        
        return text.strip()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get collection statistics"""
        return {
            "collector": self.collector_name,
            "stats": self._stats.copy(),
            "config": {
                "max_concurrent": self.config.max_concurrent,
                "timeout_seconds": self.config.timeout_seconds,
                "min_quality_score": self.config.min_quality_score,
                "vercel_optimized": self.config.vercel_memory_limit
            }
        }