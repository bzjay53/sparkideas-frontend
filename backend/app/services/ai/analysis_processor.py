"""
Analysis Processor
Processes AI analysis results with quality validation and metrics tracking
"""

import asyncio
import time
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
import structlog

from .openai_client import get_openai_client, ModelConfig
from .prompt_engine import get_prompt_engine
from .nlp_processor import get_nlp_processor
from app.services.database import DatabaseService

logger = structlog.get_logger()

@dataclass
class AnalysisResult:
    """Structured analysis result with quality metrics"""
    pain_point_id: str
    analysis_data: Dict[str, Any]
    quality_score: float
    confidence_score: float
    processing_time: float
    validation_results: Dict[str, Any]
    model_used: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    @property
    def is_high_quality(self) -> bool:
        """Check if analysis meets high quality standards"""
        return (self.quality_score >= 0.85 and 
                self.confidence_score >= 0.8 and
                self.validation_results.get("valid", False))
    
    @property
    def needs_review(self) -> bool:
        """Check if analysis needs human review"""
        return (self.quality_score < 0.7 or 
                self.confidence_score < 0.6 or
                not self.validation_results.get("valid", False))

@dataclass
class ProcessingMetrics:
    """Track processing performance and quality"""
    total_processed: int = 0
    successful_analyses: int = 0
    high_quality_analyses: int = 0
    failed_analyses: int = 0
    average_processing_time: float = 0.0
    average_quality_score: float = 0.0
    average_confidence_score: float = 0.0
    total_processing_time: float = 0.0
    
    @property
    def success_rate(self) -> float:
        if self.total_processed == 0:
            return 0.0
        return (self.successful_analyses / self.total_processed) * 100
    
    @property
    def high_quality_rate(self) -> float:
        if self.successful_analyses == 0:
            return 0.0
        return (self.high_quality_analyses / self.successful_analyses) * 100
    
    def add_result(self, result: AnalysisResult, success: bool):
        """Add analysis result to metrics"""
        self.total_processed += 1
        self.total_processing_time += result.processing_time
        
        if success:
            self.successful_analyses += 1
            if result.is_high_quality:
                self.high_quality_analyses += 1
            
            # Update running averages
            self.average_processing_time = self.total_processing_time / self.successful_analyses
            
            # Update quality metrics
            total_quality = (self.average_quality_score * (self.successful_analyses - 1) + result.quality_score)
            self.average_quality_score = total_quality / self.successful_analyses
            
            total_confidence = (self.average_confidence_score * (self.successful_analyses - 1) + result.confidence_score)
            self.average_confidence_score = total_confidence / self.successful_analyses
        else:
            self.failed_analyses += 1

class AnalysisProcessor:
    """Processes pain points through AI analysis with quality assurance"""
    
    def __init__(self):
        self.logger = structlog.get_logger().bind(service="AnalysisProcessor")
        self.openai_client = get_openai_client()
        self.prompt_engine = get_prompt_engine()
        self.nlp_processor = get_nlp_processor()
        self.metrics = ProcessingMetrics()
        
        # Quality thresholds
        self.min_quality_score = 0.75
        self.min_confidence_score = 0.70
        self.target_accuracy = 0.92
        
        # Processing configuration
        self.max_concurrent_analyses = 5  # Vercel memory limit
        self.analysis_timeout = 25  # seconds
        self.retry_attempts = 2
    
    async def analyze_pain_point(self, pain_point: Dict[str, Any]) -> AnalysisResult:
        """Analyze single pain point with enhanced NLP and quality validation"""
        start_time = time.time()
        
        try:
            # Enhanced NLP Analysis first
            text_content = f"{pain_point.get('title', '')} {pain_point.get('content', '')}"
            nlp_result = await self.nlp_processor.analyze_text(
                text=text_content,
                text_id=pain_point.get("id", "unknown"),
                context=pain_point
            )
            
            # Prepare analysis variables with NLP insights
            variables = {
                "title": pain_point.get("title", ""),
                "content": pain_point.get("content", ""),
                "source": pain_point.get("source", ""),
                "collected_at": pain_point.get("created_at", datetime.utcnow().isoformat()),
                "nlp_sentiment": nlp_result.sentiment.score,
                "nlp_keywords": ", ".join(nlp_result.keywords.primary_keywords),
                "nlp_emotions": ", ".join(nlp_result.sentiment.emotions.keys()),
                "nlp_trend_signals": ", ".join(nlp_result.trends.frequency_indicators + nlp_result.trends.urgency_indicators)
            }
            
            # Render prompt
            prompt_data = self.prompt_engine.render_prompt("pain_point_analysis", variables)
            
            # Configure AI model for analysis
            config = ModelConfig.for_analysis()
            
            # Perform AI analysis with retry logic
            ai_result = await self.openai_client.analyze_with_retry(
                messages=[{"role": "user", "content": prompt_data["user_prompt"]}],
                config=config,
                system_prompt=prompt_data["system_prompt"],
                max_retries=self.retry_attempts
            )
            
            processing_time = time.time() - start_time
            
            if "error" in ai_result:
                raise Exception(f"AI analysis failed: {ai_result['error']}")
            
            # Extract and validate analysis data
            analysis_data = ai_result.get("parsed_content", {})
            if not analysis_data and "content" in ai_result:
                try:
                    analysis_data = json.loads(ai_result["content"])
                except json.JSONDecodeError:
                    raise Exception("Failed to parse AI response as JSON")
            
            # Enhance analysis data with NLP results
            analysis_data = self._integrate_nlp_analysis(analysis_data, nlp_result)
            
            # Validate response against schema
            validation_results = self.prompt_engine.validate_response("pain_point_analysis", analysis_data)
            
            # Calculate enhanced quality scores
            quality_score = self._calculate_enhanced_quality_score(analysis_data, validation_results, nlp_result)
            confidence_score = self._calculate_enhanced_confidence(analysis_data, nlp_result)
            
            # Create analysis result
            result = AnalysisResult(
                pain_point_id=pain_point["id"],
                analysis_data=analysis_data,
                quality_score=quality_score,
                confidence_score=confidence_score,
                processing_time=processing_time,
                validation_results=validation_results,
                model_used=config.name
            )
            
            # Update metrics
            self.metrics.add_result(result, True)
            
            self.logger.info("Pain point analysis completed",
                           pain_point_id=pain_point["id"],
                           quality_score=quality_score,
                           confidence_score=confidence_score,
                           processing_time=processing_time)
            
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            
            # Create error result
            error_result = AnalysisResult(
                pain_point_id=pain_point.get("id", "unknown"),
                analysis_data={"error": str(e)},
                quality_score=0.0,
                confidence_score=0.0,
                processing_time=processing_time,
                validation_results={"valid": False, "error": str(e)},
                model_used="error"
            )
            
            self.metrics.add_result(error_result, False)
            
            self.logger.error("Pain point analysis failed",
                            pain_point_id=pain_point.get("id", "unknown"),
                            error=str(e),
                            processing_time=processing_time)
            
            return error_result
    
    async def analyze_batch(self, pain_points: List[Dict[str, Any]]) -> List[AnalysisResult]:
        """Analyze multiple pain points with controlled concurrency"""
        if not pain_points:
            return []
        
        self.logger.info("Starting batch analysis", count=len(pain_points))
        
        # Process in batches to respect Vercel memory limits
        batch_size = min(self.max_concurrent_analyses, len(pain_points))
        results = []
        
        for i in range(0, len(pain_points), batch_size):
            batch = pain_points[i:i + batch_size]
            
            # Process batch concurrently
            batch_tasks = [self.analyze_pain_point(pp) for pp in batch]
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            
            # Handle results and exceptions
            for j, result in enumerate(batch_results):
                if isinstance(result, Exception):
                    error_result = AnalysisResult(
                        pain_point_id=batch[j].get("id", f"batch_{i}_{j}"),
                        analysis_data={"error": str(result)},
                        quality_score=0.0,
                        confidence_score=0.0,
                        processing_time=0.0,
                        validation_results={"valid": False, "error": str(result)},
                        model_used="error"
                    )
                    results.append(error_result)
                    self.metrics.add_result(error_result, False)
                else:
                    results.append(result)
            
            # Brief pause between batches for Vercel optimization
            if i + batch_size < len(pain_points):
                await asyncio.sleep(0.5)
        
        # Log batch completion
        successful = sum(1 for r in results if r.quality_score > 0)
        high_quality = sum(1 for r in results if r.is_high_quality)
        
        self.logger.info("Batch analysis completed",
                        total=len(results),
                        successful=successful,
                        high_quality=high_quality,
                        success_rate=f"{(successful/len(results)*100):.1f}%",
                        high_quality_rate=f"{(high_quality/successful*100):.1f}%" if successful > 0 else "0%")
        
        return results
    
    async def store_analysis_results(self, results: List[AnalysisResult]) -> Dict[str, Any]:
        """Store analysis results in database"""
        stored_count = 0
        error_count = 0
        
        for result in results:
            try:
                if result.quality_score > 0:  # Only store successful analyses
                    # Prepare update data
                    update_data = {
                        "sentiment_score": result.analysis_data.get("sentiment_score", 0.0),
                        "trend_score": result.analysis_data.get("trend_score", 0.0),
                        "business_potential": result.analysis_data.get("business_potential", 0.0),
                        "urgency_level": result.analysis_data.get("urgency_level", 1),
                        "market_size": result.analysis_data.get("market_size", "small"),
                        "keywords": result.analysis_data.get("keywords", []),
                        "category": result.analysis_data.get("category", "general"),
                        "pain_severity": result.analysis_data.get("pain_severity", 1),
                        "solution_complexity": result.analysis_data.get("solution_complexity", 1),
                        "target_demographics": result.analysis_data.get("target_demographics", ""),
                        "ai_analysis": {
                            "confidence": result.confidence_score,
                            "quality_score": result.quality_score,
                            "model_used": result.model_used,
                            "processing_time": result.processing_time,
                            "validation_results": result.validation_results,
                            "reasoning": result.analysis_data.get("reasoning", {}),
                            "analyzed_at": result.timestamp.isoformat()
                        },
                        "processed_at": datetime.utcnow().isoformat()
                    }
                    
                    # Update pain point in database
                    await DatabaseService.update_pain_point(result.pain_point_id, update_data)
                    stored_count += 1
                
            except Exception as e:
                error_count += 1
                self.logger.error("Failed to store analysis result",
                                pain_point_id=result.pain_point_id,
                                error=str(e))
        
        return {
            "stored": stored_count,
            "errors": error_count,
            "total": len(results)
        }
    
    def _integrate_nlp_analysis(self, analysis_data: Dict[str, Any], nlp_result) -> Dict[str, Any]:
        """Integrate NLP analysis results with AI analysis"""
        # Use NLP sentiment if AI sentiment seems off
        ai_sentiment = analysis_data.get("sentiment_score", 0.0)
        nlp_sentiment = nlp_result.sentiment.score
        
        # If NLP has high confidence, blend with AI result
        if nlp_result.sentiment.confidence > 0.7:
            analysis_data["sentiment_score"] = (ai_sentiment * 0.6) + (nlp_sentiment * 0.4)
        
        # Enhance keywords with NLP keywords
        ai_keywords = analysis_data.get("keywords", [])
        nlp_keywords = nlp_result.keywords.primary_keywords
        
        # Merge and deduplicate keywords
        combined_keywords = list(set(ai_keywords + nlp_keywords))
        analysis_data["keywords"] = combined_keywords[:8]  # Limit to 8 keywords
        
        # Add NLP-specific insights
        analysis_data["nlp_analysis"] = {
            "sentiment_confidence": nlp_result.sentiment.confidence,
            "emotion_breakdown": nlp_result.sentiment.emotions,
            "trend_signals": {
                "frequency_indicators": nlp_result.trends.frequency_indicators,
                "urgency_indicators": nlp_result.trends.urgency_indicators,
                "trend_score": nlp_result.trends.trend_score
            },
            "text_quality": nlp_result.text_quality,
            "technical_terms": nlp_result.keywords.technical_terms,
            "action_words": nlp_result.keywords.action_words
        }
        
        # Enhance business potential with trend analysis
        if nlp_result.trends.is_trending:
            current_potential = analysis_data.get("business_potential", 0.5)
            analysis_data["business_potential"] = min(1.0, current_potential + 0.2)
        
        # Enhance urgency level with NLP urgency indicators
        if nlp_result.trends.urgency_indicators:
            current_urgency = analysis_data.get("urgency_level", 1)
            analysis_data["urgency_level"] = min(5, current_urgency + 1)
        
        return analysis_data
    
    def _calculate_enhanced_quality_score(self, analysis_data: Dict[str, Any], 
                                        validation_results: Dict[str, Any], 
                                        nlp_result) -> float:
        """Calculate quality score enhanced with NLP analysis"""
        # Base quality score from validation
        base_score = self._calculate_quality_score(analysis_data, validation_results)
        
        # NLP quality bonuses
        nlp_bonus = 0.0
        
        # High confidence sentiment analysis
        if nlp_result.sentiment.confidence > 0.8:
            nlp_bonus += 0.1
        
        # Rich keyword extraction
        if len(nlp_result.keywords.primary_keywords) >= 3:
            nlp_bonus += 0.1
        
        # Strong trend signals
        if nlp_result.trends.trend_score > 0.7:
            nlp_bonus += 0.1
        
        # High text quality
        avg_text_quality = sum(nlp_result.text_quality.values()) / len(nlp_result.text_quality) if nlp_result.text_quality else 0
        if avg_text_quality > 0.7:
            nlp_bonus += 0.1
        
        # Technical specificity
        if nlp_result.keywords.technical_terms:
            nlp_bonus += 0.05
        
        return min(1.0, base_score + nlp_bonus)
    
    def _calculate_enhanced_confidence(self, analysis_data: Dict[str, Any], nlp_result) -> float:
        """Calculate enhanced confidence score using NLP insights"""
        ai_confidence = analysis_data.get("confidence", 0.0)
        nlp_confidence = nlp_result.sentiment.confidence
        
        # Weighted combination of AI and NLP confidence
        enhanced_confidence = (ai_confidence * 0.7) + (nlp_confidence * 0.3)
        
        # Boost confidence if multiple indicators align
        consistency_bonus = 0.0
        
        # Sentiment consistency check
        ai_sentiment = analysis_data.get("sentiment_score", 0.0)
        nlp_sentiment = nlp_result.sentiment.score
        sentiment_diff = abs(ai_sentiment - nlp_sentiment)
        
        if sentiment_diff < 0.3:  # Good alignment
            consistency_bonus += 0.1
        
        # Business potential and trend alignment
        business_potential = analysis_data.get("business_potential", 0.5)
        if business_potential > 0.7 and nlp_result.trends.trend_score > 0.6:
            consistency_bonus += 0.1
        
        return min(1.0, enhanced_confidence + consistency_bonus)
    
    def _calculate_quality_score(self, analysis_data: Dict[str, Any], 
                                validation_results: Dict[str, Any]) -> float:
        """Calculate overall quality score for analysis"""
        # Base score from validation
        validation_score = validation_results.get("accuracy_score", 0.0)
        
        # Content quality checks
        content_score = 0.0
        
        # Check if reasoning is provided and meaningful
        reasoning = analysis_data.get("reasoning", {})
        if reasoning and len(reasoning) >= 3:  # At least 3 reasoning fields
            content_score += 0.2
        
        # Check keyword quality (should have 3-8 relevant keywords)
        keywords = analysis_data.get("keywords", [])
        if 3 <= len(keywords) <= 8:
            content_score += 0.2
        
        # Check confidence level (should be realistic, not overconfident)
        confidence = analysis_data.get("confidence", 0.0)
        if 0.6 <= confidence <= 0.95:  # Realistic confidence range
            content_score += 0.2
        
        # Check score consistency (sentiment vs pain severity should correlate)
        sentiment = analysis_data.get("sentiment_score", 0.0)
        pain_severity = analysis_data.get("pain_severity", 1)
        if sentiment < 0 and pain_severity >= 3:  # Negative sentiment + high pain = consistent
            content_score += 0.2
        elif sentiment >= 0 and pain_severity <= 2:  # Positive sentiment + low pain = consistent
            content_score += 0.2
        
        # Check business potential vs urgency alignment
        business_potential = analysis_data.get("business_potential", 0.0)
        urgency = analysis_data.get("urgency_level", 1)
        if business_potential > 0.7 and urgency >= 3:  # High potential + high urgency = good
            content_score += 0.2
        
        # Combine scores (60% validation, 40% content quality)
        final_score = (validation_score * 0.6) + (content_score * 0.4)
        
        return min(1.0, final_score)
    
    async def get_unprocessed_pain_points(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get unprocessed pain points for analysis"""
        try:
            # Get pain points that haven't been processed or need reprocessing
            unprocessed = await DatabaseService.get_unprocessed_pain_points(limit)
            
            self.logger.info("Retrieved unprocessed pain points", count=len(unprocessed))
            return unprocessed
            
        except Exception as e:
            self.logger.error("Failed to get unprocessed pain points", error=str(e))
            return []
    
    async def process_analysis_queue(self, batch_size: int = 10) -> Dict[str, Any]:
        """Process the queue of unprocessed pain points"""
        try:
            # Get unprocessed pain points
            pain_points = await self.get_unprocessed_pain_points(batch_size)
            
            if not pain_points:
                return {
                    "status": "no_work",
                    "message": "No unprocessed pain points found",
                    "processed": 0
                }
            
            # Analyze batch
            results = await self.analyze_batch(pain_points)
            
            # Store results
            storage_result = await self.store_analysis_results(results)
            
            return {
                "status": "completed",
                "processed": len(results),
                "stored": storage_result["stored"],
                "errors": storage_result["errors"],
                "metrics": {
                    "success_rate": self.metrics.success_rate,
                    "high_quality_rate": self.metrics.high_quality_rate,
                    "average_quality_score": self.metrics.average_quality_score,
                    "average_confidence_score": self.metrics.average_confidence_score,
                    "average_processing_time": self.metrics.average_processing_time
                }
            }
            
        except Exception as e:
            self.logger.error("Failed to process analysis queue", error=str(e))
            return {
                "status": "error",
                "error": str(e),
                "processed": 0
            }
    
    def get_processing_metrics(self) -> Dict[str, Any]:
        """Get comprehensive processing metrics"""
        return {
            "performance": {
                "total_processed": self.metrics.total_processed,
                "success_rate": round(self.metrics.success_rate, 2),
                "high_quality_rate": round(self.metrics.high_quality_rate, 2),
                "average_processing_time": round(self.metrics.average_processing_time, 3),
                "target_accuracy": self.target_accuracy
            },
            "quality": {
                "average_quality_score": round(self.metrics.average_quality_score, 3),
                "average_confidence_score": round(self.metrics.average_confidence_score, 3),
                "min_quality_threshold": self.min_quality_score,
                "min_confidence_threshold": self.min_confidence_score
            },
            "configuration": {
                "max_concurrent_analyses": self.max_concurrent_analyses,
                "analysis_timeout": self.analysis_timeout,
                "retry_attempts": self.retry_attempts
            },
            "openai_usage": self.openai_client.get_usage_stats(),
            "nlp_performance": self.nlp_processor.get_performance_metrics()
        }

# Global analysis processor instance
_analysis_processor = None

def get_analysis_processor() -> AnalysisProcessor:
    """Get global analysis processor instance"""
    global _analysis_processor
    if _analysis_processor is None:
        _analysis_processor = AnalysisProcessor()
    return _analysis_processor