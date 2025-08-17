"""
Database Service
Supabase integration for data persistence
"""

import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import structlog
from supabase import create_client, Client

from app.config.settings import settings

logger = structlog.get_logger()

class DatabaseService:
    """Database service for Supabase operations"""
    
    _client: Optional[Client] = None
    
    @classmethod
    async def initialize(cls):
        """Initialize Supabase client"""
        try:
            cls._client = create_client(
                settings.supabase_url, 
                settings.supabase_service_key
            )
            logger.info("Database service initialized successfully")
        except Exception as e:
            logger.error("Failed to initialize database service", error=str(e))
            raise
    
    @classmethod
    async def close(cls):
        """Close database connection"""
        if cls._client:
            cls._client = None
            logger.info("Database service closed")
    
    @classmethod
    async def health_check(cls) -> bool:
        """Check database connection health"""
        try:
            if not cls._client:
                return False
            
            result = cls._client.table('users').select('id').limit(1).execute()
            return True
        except Exception as e:
            logger.error("Database health check failed", error=str(e))
            return False
    
    # Pain Points Methods
    @classmethod
    async def create_pain_point(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new pain point"""
        try:
            result = cls._client.table('pain_points').insert(data).execute()
            return result.data[0]
        except Exception as e:
            logger.error("Failed to create pain point", error=str(e))
            raise
    
    @classmethod
    async def get_pain_points(cls, limit: int = 20) -> List[Dict[str, Any]]:
        """Get pain points with limit"""
        try:
            result = cls._client.table('pain_points')\
                .select('*')\
                .order('collected_at', desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            logger.error("Failed to fetch pain points", error=str(e))
            raise
    
    @classmethod
    async def get_pain_points_by_source(cls, source: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get pain points by source"""
        try:
            result = cls._client.table('pain_points')\
                .select('*')\
                .eq('source', source)\
                .order('collected_at', desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            logger.error("Failed to fetch pain points by source", source=source, error=str(e))
            raise
    
    @classmethod
    async def get_trending_pain_points(cls, limit: int = 10) -> List[Dict[str, Any]]:
        """Get trending pain points"""
        try:
            result = cls._client.table('pain_points')\
                .select('*')\
                .order('trend_score', desc=True)\
                .order('sentiment_score', desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            logger.error("Failed to fetch trending pain points", error=str(e))
            raise
    
    @classmethod
    async def get_unprocessed_pain_points(cls, limit: int = 10) -> List[Dict[str, Any]]:
        """Get unprocessed pain points for AI analysis"""
        try:
            result = cls._client.table('pain_points')\
                .select('*')\
                .is_('processed_at', 'null')\
                .order('collected_at', desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            logger.error("Failed to fetch unprocessed pain points", error=str(e))
            raise
    
    @classmethod
    async def get_high_quality_pain_points(cls, limit: int = 15) -> List[Dict[str, Any]]:
        """Get high-quality pain points for idea generation"""
        try:
            result = cls._client.table('pain_points')\
                .select('*')\
                .gte('trend_score', 0.6)\
                .gte('sentiment_score', -0.3)\
                .is_not('processed_at', 'null')\
                .order('trend_score', desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            logger.error("Failed to fetch high quality pain points", error=str(e))
            raise
    
    @classmethod
    async def update_pain_point(cls, pain_point_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update pain point"""
        try:
            result = cls._client.table('pain_points')\
                .update(data)\
                .eq('id', pain_point_id)\
                .execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Failed to update pain point", pain_point_id=pain_point_id, error=str(e))
            raise
    
    @classmethod
    async def get_pain_point_by_id(cls, pain_point_id: str) -> Optional[Dict[str, Any]]:
        """Get pain point by ID"""
        try:
            result = cls._client.table('pain_points')\
                .select('*')\
                .eq('id', pain_point_id)\
                .execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Failed to fetch pain point by ID", pain_point_id=pain_point_id, error=str(e))
            raise
    
    # Business Ideas Methods
    @classmethod
    async def create_business_idea(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new business idea"""
        try:
            result = cls._client.table('business_ideas').insert(data).execute()
            return result.data[0]
        except Exception as e:
            logger.error("Failed to create business idea", error=str(e))
            raise
    
    @classmethod
    async def get_business_ideas(cls, limit: int = 20) -> List[Dict[str, Any]]:
        """Get business ideas"""
        try:
            result = cls._client.table('business_ideas')\
                .select('*')\
                .order('confidence_score', desc=True)\
                .order('generated_at', desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            logger.error("Failed to fetch business ideas", error=str(e))
            raise
    
    @classmethod
    async def get_telegram_worthy_ideas(cls, limit: int = 5) -> List[Dict[str, Any]]:
        """Get high-confidence ideas for telegram digest"""
        try:
            result = cls._client.table('business_ideas')\
                .select('*')\
                .gte('confidence_score', 85)\
                .order('generated_at', desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            logger.error("Failed to fetch telegram worthy ideas", error=str(e))
            raise
    
    @classmethod
    async def get_ideas_by_difficulty(cls, difficulty: int, limit: int = 20) -> List[Dict[str, Any]]:
        """Get ideas by implementation difficulty"""
        try:
            result = cls._client.table('business_ideas')\
                .select('*')\
                .eq('implementation_difficulty', difficulty)\
                .order('confidence_score', desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            logger.error("Failed to fetch ideas by difficulty", difficulty=difficulty, error=str(e))
            raise
    
    @classmethod
    async def get_ideas_by_confidence(cls, min_confidence: float, limit: int = 20) -> List[Dict[str, Any]]:
        """Get ideas by minimum confidence score"""
        try:
            result = cls._client.table('business_ideas')\
                .select('*')\
                .gte('confidence_score', min_confidence)\
                .order('confidence_score', desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            logger.error("Failed to fetch ideas by confidence", min_confidence=min_confidence, error=str(e))
            raise
    
    @classmethod
    async def get_business_idea_by_id(cls, idea_id: str) -> Optional[Dict[str, Any]]:
        """Get business idea by ID"""
        try:
            result = cls._client.table('business_ideas')\
                .select('*')\
                .eq('id', idea_id)\
                .execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Failed to fetch business idea by ID", idea_id=idea_id, error=str(e))
            raise
    
    @classmethod
    async def update_business_idea(cls, idea_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update business idea"""
        try:
            result = cls._client.table('business_ideas')\
                .update(data)\
                .eq('id', idea_id)\
                .execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error("Failed to update business idea", idea_id=idea_id, error=str(e))
            raise
    
    # Analytics Methods
    @classmethod
    async def get_pain_point_stats_by_source(cls) -> Dict[str, Any]:
        """Get pain point statistics by source"""
        try:
            # This would be better as a SQL function, but for now using Python aggregation
            all_points = cls._client.table('pain_points').select('source, sentiment_score, trend_score').execute()
            
            stats = {}
            for point in all_points.data:
                source = point['source']
                if source not in stats:
                    stats[source] = {'count': 0, 'avg_sentiment': 0, 'avg_trend': 0}
                stats[source]['count'] += 1
                stats[source]['avg_sentiment'] += point['sentiment_score'] or 0
                stats[source]['avg_trend'] += point['trend_score'] or 0
            
            # Calculate averages
            for source in stats:
                count = stats[source]['count']
                if count > 0:
                    stats[source]['avg_sentiment'] /= count
                    stats[source]['avg_trend'] /= count
            
            return stats
        except Exception as e:
            logger.error("Failed to fetch pain point stats by source", error=str(e))
            raise
    
    @classmethod
    async def get_trending_keywords(cls, days: int = 7, limit: int = 20) -> List[Dict[str, Any]]:
        """Get trending keywords from recent pain points"""
        try:
            cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
            
            result = cls._client.table('pain_points')\
                .select('keywords')\
                .gte('created_at', cutoff_date)\
                .execute()
            
            # Count keyword frequencies
            keyword_counts = {}
            for point in result.data:
                for keyword in point.get('keywords', []):
                    keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1
            
            # Sort and limit
            sorted_keywords = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
            
            return [{'keyword': kw, 'frequency': freq} for kw, freq in sorted_keywords]
        except Exception as e:
            logger.error("Failed to fetch trending keywords", error=str(e))
            raise
    
    @classmethod
    async def get_business_idea_stats(cls) -> Dict[str, Any]:
        """Get comprehensive business idea statistics"""
        try:
            all_ideas = cls._client.table('business_ideas')\
                .select('implementation_difficulty, confidence_score, target_market, created_at')\
                .execute()
            
            total_count = len(all_ideas.data)
            if total_count == 0:
                return {
                    'total_count': 0,
                    'by_difficulty': {},
                    'average_confidence': 0,
                    'top_confidence_ideas': [],
                    'recent_generations': {},
                    'market_distribution': {}
                }
            
            # Calculate statistics
            by_difficulty = {}
            confidence_scores = []
            market_distribution = {}
            
            for idea in all_ideas.data:
                # Difficulty distribution
                diff = idea['implementation_difficulty']
                by_difficulty[diff] = by_difficulty.get(diff, 0) + 1
                
                # Confidence scores
                confidence_scores.append(idea['confidence_score'])
                
                # Market distribution
                market = idea.get('target_market', 'Unknown')[:50]  # Limit length
                market_distribution[market] = market_distribution.get(market, 0) + 1
            
            avg_confidence = sum(confidence_scores) / len(confidence_scores)
            
            return {
                'total_count': total_count,
                'by_difficulty': by_difficulty,
                'average_confidence': avg_confidence,
                'market_distribution': market_distribution
            }
        except Exception as e:
            logger.error("Failed to fetch business idea stats", error=str(e))
            raise
    
    # Telegram Methods
    @classmethod
    async def log_telegram_message(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Log telegram message delivery"""
        try:
            result = cls._client.table('telegram_messages').insert(data).execute()
            return result.data[0]
        except Exception as e:
            logger.error("Failed to log telegram message", error=str(e))
            raise
    
    @classmethod
    async def get_telegram_delivery_stats(cls, days: int = 7) -> Dict[str, Any]:
        """Get telegram delivery statistics"""
        try:
            cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
            
            result = cls._client.table('telegram_messages')\
                .select('success, message_type')\
                .gte('sent_at', cutoff_date)\
                .execute()
            
            total = len(result.data)
            successful = sum(1 for msg in result.data if msg['success'])
            
            by_type = {}
            for msg in result.data:
                msg_type = msg['message_type']
                by_type[msg_type] = by_type.get(msg_type, 0) + 1
            
            return {
                'total': total,
                'successful': successful,
                'failed': total - successful,
                'success_rate': (successful / total * 100) if total > 0 else 0,
                'by_type': by_type
            }
        except Exception as e:
            logger.error("Failed to fetch telegram delivery stats", error=str(e))
            raise
    
    # Delete Methods
    @classmethod
    async def delete_pain_point(cls, pain_point_id: str) -> bool:
        """Delete pain point"""
        try:
            result = cls._client.table('pain_points')\
                .delete()\
                .eq('id', pain_point_id)\
                .execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error("Failed to delete pain point", pain_point_id=pain_point_id, error=str(e))
            raise
    
    @classmethod
    async def delete_business_idea(cls, idea_id: str) -> bool:
        """Delete business idea"""
        try:
            result = cls._client.table('business_ideas')\
                .delete()\
                .eq('id', idea_id)\
                .execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error("Failed to delete business idea", idea_id=idea_id, error=str(e))
            raise