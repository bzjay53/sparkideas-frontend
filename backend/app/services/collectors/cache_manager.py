"""
Cache Manager for Data Collectors
Vercel-optimized memory management and deduplication
"""

import asyncio
import time
import json
import hashlib
from typing import Dict, Any, Optional, Set, List
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from collections import defaultdict, OrderedDict
import structlog

logger = structlog.get_logger()

@dataclass
class CacheEntry:
    """Cache entry with TTL and metadata"""
    data: Any
    timestamp: datetime
    ttl_hours: int
    access_count: int = 0
    last_accessed: Optional[datetime] = None
    size_bytes: int = 0
    
    def __post_init__(self):
        if self.last_accessed is None:
            self.last_accessed = self.timestamp
        
        # Estimate size for memory management
        if isinstance(self.data, (str, dict, list)):
            self.size_bytes = len(str(self.data).encode('utf-8'))
    
    @property
    def is_expired(self) -> bool:
        """Check if cache entry is expired"""
        return datetime.utcnow() > self.timestamp + timedelta(hours=self.ttl_hours)
    
    @property
    def age_minutes(self) -> float:
        """Get age in minutes"""
        return (datetime.utcnow() - self.timestamp).total_seconds() / 60
    
    def touch(self):
        """Update access tracking"""
        self.access_count += 1
        self.last_accessed = datetime.utcnow()

class CacheManager:
    """Memory-efficient cache manager for Vercel environment"""
    
    def __init__(self, max_memory_mb: int = 800):  # Conservative for Vercel 1GB limit
        self.max_memory_bytes = max_memory_mb * 1024 * 1024
        self.cache: Dict[str, CacheEntry] = OrderedDict()
        self.deduplication_hashes: Set[str] = set()
        self.stats = {
            "hits": 0,
            "misses": 0,
            "evictions": 0,
            "memory_cleanups": 0,
            "duplicate_blocks": 0
        }
        
        # Content type specific caches
        self.pain_point_cache: Dict[str, CacheEntry] = OrderedDict()
        self.api_response_cache: Dict[str, CacheEntry] = OrderedDict()
        self.processed_content_hashes: Set[str] = set()
        
        logger.info("CacheManager initialized", max_memory_mb=max_memory_mb)
    
    def generate_cache_key(self, source: str, query: str, params: Dict[str, Any] = None) -> str:
        """Generate consistent cache key"""
        params_str = json.dumps(params or {}, sort_keys=True)
        key_string = f"{source}:{query}:{params_str}"
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def generate_content_hash(self, title: str, content: str, source_url: str = "") -> str:
        """Generate hash for content deduplication"""
        content_string = f"{title[:100]}{content[:200]}{source_url}"
        return hashlib.md5(content_string.encode()).hexdigest()
    
    async def get(self, key: str, cache_type: str = "general") -> Optional[Any]:
        """Get item from cache with LRU update"""
        cache_store = self._get_cache_store(cache_type)
        
        if key not in cache_store:
            self.stats["misses"] += 1
            return None
        
        entry = cache_store[key]
        
        # Check expiration
        if entry.is_expired:
            await self.delete(key, cache_type)
            self.stats["misses"] += 1
            return None
        
        # Update access tracking and move to end (LRU)
        entry.touch()
        cache_store.move_to_end(key)
        
        self.stats["hits"] += 1
        logger.debug("Cache hit", key=key[:16], age_minutes=entry.age_minutes, access_count=entry.access_count)
        
        return entry.data
    
    async def set(self, key: str, data: Any, ttl_hours: int = 6, cache_type: str = "general"):
        """Set item in cache with memory management"""
        cache_store = self._get_cache_store(cache_type)
        
        # Create cache entry
        entry = CacheEntry(
            data=data,
            timestamp=datetime.utcnow(),
            ttl_hours=ttl_hours
        )
        
        # Check memory before adding
        await self._ensure_memory_capacity(entry.size_bytes, cache_type)
        
        # Add to cache
        cache_store[key] = entry
        
        logger.debug("Cache set", key=key[:16], size_bytes=entry.size_bytes, ttl_hours=ttl_hours)
    
    async def is_duplicate_content(self, title: str, content: str, source_url: str = "") -> bool:
        """Check if content is duplicate"""
        content_hash = self.generate_content_hash(title, content, source_url)
        
        if content_hash in self.processed_content_hashes:
            self.stats["duplicate_blocks"] += 1
            return True
        
        # Add to seen hashes
        self.processed_content_hashes.add(content_hash)
        
        # Limit hash set size for memory management
        if len(self.processed_content_hashes) > 10000:
            # Keep newest 7500 hashes
            hash_list = list(self.processed_content_hashes)
            self.processed_content_hashes = set(hash_list[-7500:])
            logger.info("Pruned duplicate hash set", remaining=len(self.processed_content_hashes))
        
        return False
    
    async def cache_pain_points(self, source: str, query: str, pain_points: List[Dict[str, Any]], 
                              ttl_hours: int = 6):
        """Cache processed pain points"""
        cache_key = self.generate_cache_key(source, query, {"type": "pain_points"})
        
        # Filter out potential duplicates before caching
        unique_points = []
        for point in pain_points:
            if not await self.is_duplicate_content(
                point.get("title", ""), 
                point.get("content", ""), 
                point.get("source_url", "")
            ):
                unique_points.append(point)
        
        await self.set(cache_key, unique_points, ttl_hours, "pain_points")
        
        logger.info("Cached pain points", 
                   source=source, 
                   query=query[:20], 
                   total=len(pain_points),
                   unique=len(unique_points),
                   duplicates_filtered=len(pain_points) - len(unique_points))
    
    async def get_cached_pain_points(self, source: str, query: str) -> Optional[List[Dict[str, Any]]]:
        """Get cached pain points"""
        cache_key = self.generate_cache_key(source, query, {"type": "pain_points"})
        return await self.get(cache_key, "pain_points")
    
    async def cache_api_response(self, source: str, endpoint: str, params: Dict[str, Any], 
                               response_data: Any, ttl_hours: int = 2):
        """Cache raw API responses"""
        cache_key = self.generate_cache_key(source, endpoint, params)
        await self.set(cache_key, response_data, ttl_hours, "api_response")
    
    async def get_cached_api_response(self, source: str, endpoint: str, 
                                    params: Dict[str, Any]) -> Optional[Any]:
        """Get cached API response"""
        cache_key = self.generate_cache_key(source, endpoint, params)
        return await self.get(cache_key, "api_response")
    
    def _get_cache_store(self, cache_type: str) -> OrderedDict:
        """Get appropriate cache store"""
        if cache_type == "pain_points":
            return self.pain_point_cache
        elif cache_type == "api_response":
            return self.api_response_cache
        else:
            return self.cache
    
    async def _ensure_memory_capacity(self, required_bytes: int, cache_type: str):
        """Ensure sufficient memory capacity"""
        cache_store = self._get_cache_store(cache_type)
        current_size = sum(entry.size_bytes for entry in cache_store.values())
        
        # If adding this entry would exceed memory limit, evict LRU items
        while current_size + required_bytes > self.max_memory_bytes // 3:  # Use 1/3 per cache type
            if not cache_store:
                break
            
            # Remove LRU item (first item in OrderedDict)
            lru_key = next(iter(cache_store))
            lru_entry = cache_store.pop(lru_key)
            current_size -= lru_entry.size_bytes
            self.stats["evictions"] += 1
            
            logger.debug("Evicted LRU cache entry", 
                        key=lru_key[:16], 
                        size_bytes=lru_entry.size_bytes,
                        age_minutes=lru_entry.age_minutes)
    
    async def cleanup_expired(self):
        """Remove expired entries from all caches"""
        cleanup_count = 0
        
        for cache_type, cache_store in [
            ("general", self.cache),
            ("pain_points", self.pain_point_cache), 
            ("api_response", self.api_response_cache)
        ]:
            expired_keys = [key for key, entry in cache_store.items() if entry.is_expired]
            
            for key in expired_keys:
                cache_store.pop(key)
                cleanup_count += 1
        
        if cleanup_count > 0:
            self.stats["memory_cleanups"] += 1
            logger.info("Cleaned up expired cache entries", count=cleanup_count)
    
    async def delete(self, key: str, cache_type: str = "general"):
        """Delete specific cache entry"""
        cache_store = self._get_cache_store(cache_type)
        if key in cache_store:
            cache_store.pop(key)
    
    async def clear_cache(self, cache_type: str = "all"):
        """Clear cache (optionally by type)"""
        if cache_type == "all":
            self.cache.clear()
            self.pain_point_cache.clear()
            self.api_response_cache.clear()
            self.processed_content_hashes.clear()
        else:
            cache_store = self._get_cache_store(cache_type)
            cache_store.clear()
        
        logger.info("Cache cleared", cache_type=cache_type)
    
    def get_memory_usage(self) -> Dict[str, Any]:
        """Get detailed memory usage statistics"""
        def calculate_cache_size(cache_store):
            return {
                "entries": len(cache_store),
                "total_bytes": sum(entry.size_bytes for entry in cache_store.values()),
                "avg_entry_size": (
                    sum(entry.size_bytes for entry in cache_store.values()) / len(cache_store)
                    if cache_store else 0
                )
            }
        
        usage = {
            "general_cache": calculate_cache_size(self.cache),
            "pain_points_cache": calculate_cache_size(self.pain_point_cache),
            "api_response_cache": calculate_cache_size(self.api_response_cache),
            "duplicate_hashes": len(self.processed_content_hashes),
            "max_memory_bytes": self.max_memory_bytes,
            "stats": self.stats.copy()
        }
        
        # Calculate total usage
        total_bytes = sum(cache["total_bytes"] for cache in 
                         [usage["general_cache"], usage["pain_points_cache"], usage["api_response_cache"]])
        usage["total_usage"] = {
            "bytes": total_bytes,
            "mb": total_bytes / (1024 * 1024),
            "percentage": (total_bytes / self.max_memory_bytes) * 100
        }
        
        return usage
    
    def get_cache_efficiency(self) -> Dict[str, float]:
        """Calculate cache efficiency metrics"""
        total_requests = self.stats["hits"] + self.stats["misses"]
        hit_rate = (self.stats["hits"] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "hit_rate_percentage": hit_rate,
            "total_requests": total_requests,
            "duplicates_blocked": self.stats["duplicate_blocks"],
            "memory_cleanups": self.stats["memory_cleanups"],
            "evictions": self.stats["evictions"]
        }

# Global cache manager instance (singleton for Vercel)
_cache_manager = None

def get_cache_manager() -> CacheManager:
    """Get global cache manager instance"""
    global _cache_manager
    if _cache_manager is None:
        _cache_manager = CacheManager()
    return _cache_manager